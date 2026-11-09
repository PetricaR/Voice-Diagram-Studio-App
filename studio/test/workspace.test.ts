import { describe, expect, it } from 'vitest';
import { handleToolCall, type ViewController } from '../src/agent/dispatcher';
import { blockSize } from '../src/engine/blocks';
import { bookOutline, bookToMarkdown } from '../src/engine/book';
import { parseInline, parseMarkdown } from '../src/engine/markdown';
import { groupBounds, intersects } from '../src/engine/scene';
import { DiagramStore } from '../src/engine/store';
import { describeScene } from '../src/engine/summary';
import type { Rect, Scene } from '../src/engine/types';
import { Workspace } from '../src/engine/workspace';
import { pagesFromJson, pagesToJson, toDrawio, toJson } from '../src/ui/export';

const webApp = {
  diagram_type: 'architecture',
  direction: 'LR',
  title: 'Web App on GCP',
  groups: [{ id: 'gcp', label: 'Google Cloud', kind: 'region' }],
  nodes: [
    { id: 'user', label: 'Users', kind: 'user' },
    { id: 'lb', label: 'Load Balancer', kind: 'loadbalancer', tech: 'Cloud Load Balancing', provider: 'gcp', group: 'gcp' },
    { id: 'api', label: 'API', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'gcp' },
    { id: 'db', label: 'Database', kind: 'database', tech: 'Cloud SQL', provider: 'gcp', group: 'gcp' },
  ],
  edges: [
    { from: 'user', to: 'lb', label: 'HTTPS' },
    { from: 'lb', to: 'api' },
    { from: 'api', to: 'db', label: 'SQL' },
  ],
};

const flow = {
  diagram_type: 'flowchart',
  direction: 'TB',
  title: 'Checkout',
  nodes: [
    { id: 'start', label: 'Start', kind: 'start' },
    { id: 'pay', label: 'Pay', kind: 'process' },
    { id: 'end', label: 'Done', kind: 'end' },
  ],
  edges: [{ from: 'start', to: 'pay' }, { from: 'pay', to: 'end' }],
};

const DOC = '## Overview\nUsers reach the **API** through the load balancer.\n## Data flow\n- The API reads and writes the database\n- Static assets come from the CDN';

/** No block overlaps a node, a group or another block. */
function expectBlocksClear(scene: Scene) {
  const diagram: [string, Rect][] = [...scene.nodes.map((n) => [n.id, n] as [string, Rect]), ...groupBounds(scene)];
  for (const b of scene.blocks) {
    expect(Number.isFinite(b.x) && Number.isFinite(b.y), `${b.id} has a position`).toBe(true);
    for (const [id, r] of diagram) expect(intersects(b, r), `${b.id} overlaps ${id}`).toBe(false);
    for (const o of scene.blocks) {
      if (o !== b) expect(intersects(b, o), `${b.id} overlaps ${o.id}`).toBe(false);
    }
  }
}

async function workspaceWithDiagram(): Promise<Workspace> {
  const ws = new Workspace();
  const r = await handleToolCall('create_diagram', webApp, { workspace: ws, source: 'voice', request: 'Draw a web app on GCP' });
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return ws;
}

describe('markdown', () => {
  it('parses headings, lists, quotes, tables and inline marks', () => {
    const md = parseMarkdown('# Title\nSome **bold** text\ncontinued.\n\n- one\n  - nested\n1. first\n> note\n| A | B |\n|---|---|\n| 1 | 2 |');
    expect(md.map((b) => b.type)).toEqual(['heading', 'paragraph', 'list', 'list', 'quote', 'table']);
    expect(md[1]).toEqual({ type: 'paragraph', text: 'Some **bold** text continued.' });
    expect(md[2]).toMatchObject({ ordered: false, items: [{ text: 'one', depth: 0 }, { text: 'nested', depth: 1 }] });
    expect(md[5]).toEqual({ type: 'table', header: ['A', 'B'], rows: [['1', '2']] });
    expect(parseInline('a **b** `c` *d*')).toEqual([
      { text: 'a ' }, { text: 'b', bold: true }, { text: ' ' }, { text: 'c', code: true }, { text: ' ' }, { text: 'd', italic: true },
    ]);
  });

  it('accepts escaped line breaks from the model', () => {
    expect(parseMarkdown('## A\\n- b').map((b) => b.type)).toEqual(['heading', 'list']);
  });

  it('sizes a block by its content', () => {
    const short = blockSize({ kind: 'text', text: 'Hello' });
    const long = blockSize({ kind: 'text', title: 'Notes', text: DOC.repeat(4) });
    expect(long.h).toBeGreaterThan(short.h * 3);
    const table = blockSize({ kind: 'table', columns: ['A', 'B'], rows: [['1', '2'], ['3', '4']] });
    const bigger = blockSize({ kind: 'table', columns: ['A', 'B'], rows: Array.from({ length: 10 }, () => ['x', 'y']) });
    expect(bigger.h).toBeGreaterThan(table.h);
  });
});

describe('documentation chapters', () => {
  it('writes a chapter into the documentation tab and leaves the diagram as it is', async () => {
    const ws = await workspaceWithDiagram();
    const before = ws.store.scene.nodes.map((n) => [n.id, n.x, n.y]);
    const r = await handleToolCall('write_text', { id: 'overview', title: 'Architecture Overview', text: DOC }, { workspace: ws, source: 'voice' });
    expect(r.ok).toBe(true);
    expect(r.id).toBe('overview');
    const scene = ws.store.scene;
    expect(scene.blocks).toHaveLength(1);
    expect(scene.nodes.map((n) => [n.id, n.x, n.y])).toEqual(before);
    expectBlocksClear(scene);
    // The documentation tab opens at the chapter, which is also the selection ("this chapter")
    expect(ws.view).toBe('doc');
    expect(ws.active.chapter).toBe('overview');
    expect(ws.store.selection).toEqual(['overview']);
    expect(String(r.diagram)).toContain('page_1 "Web App on GCP" (current, its documentation tab is shown) + documentation (1 chapter)');
    expect(String(r.diagram)).toContain('1. overview text "Architecture Overview"');
    expect(String(r.diagram)).toContain('## Data flow');
  });

  it('rewrites, appends and removes a text by id', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'overview', title: 'Overview', text: 'First' }, ctx);
    const pos = { x: ws.store.scene.blocks[0].x, y: ws.store.scene.blocks[0].y };
    await handleToolCall('write_text', { id: 'overview', text: 'Second' }, ctx);
    expect(ws.store.scene.blocks).toHaveLength(1);
    expect(ws.store.scene.blocks[0]).toMatchObject({ text: 'Second', title: 'Overview', ...pos });
    await handleToolCall('write_text', { id: 'overview', text: '## Security\n- IAM', append: true }, ctx);
    expect(ws.store.scene.blocks[0].text).toBe('Second\n\n## Security\n- IAM');
    const r = await handleToolCall('edit_diagram', { summary: 'Removed the notes', remove_blocks: ['overview'] }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.store.scene.blocks).toHaveLength(0);
    // One undo step per write
    ws.store.undo();
    expect(ws.store.scene.blocks[0].text).toContain('Security');
  });

  it('writes tables with normalized rows, and appends rows', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    const r = await handleToolCall('write_table', {
      id: 'components', title: 'Components', columns: ['Component', 'Technology'],
      rows: [['API', 'Cloud Run', 'extra'], ['Database'], [42, null]],
    }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.store.scene.blocks[0].rows).toEqual([['API', 'Cloud Run'], ['Database', ''], ['42', '']]);
    await handleToolCall('write_table', { id: 'components', columns: ['Component', 'Technology'], rows: [['LB', 'Cloud Load Balancing']], append: true }, ctx);
    expect(ws.store.scene.blocks[0].rows).toHaveLength(4);
    await handleToolCall('write_text', { id: 'notes', title: 'Notes', text: DOC }, ctx);
    expectBlocksClear(ws.store.scene);
    const bad = await handleToolCall('write_table', { id: 'x', columns: [], rows: [] }, ctx);
    expect(bad.ok).toBe(false);
  });

  it('removes a block named in remove_nodes, and a selected block', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'notes', text: 'A' }, ctx);
    await handleToolCall('write_table', { id: 'costs', columns: ['Item', 'Cost'], rows: [['API', '$10']] }, ctx);
    expect((await handleToolCall('edit_diagram', { summary: 'x', remove_nodes: ['notes'] }, ctx)).ok).toBe(true);
    ws.store.setSelection(['costs']);
    expect((await handleToolCall('edit_diagram', { summary: 'x', remove_nodes: ['@selected'] }, ctx)).ok).toBe(true);
    expect(ws.store.scene.blocks).toHaveLength(0);
    expect(ws.store.scene.nodes).toHaveLength(4);
  });

  it('keeps blocks clear of the diagram when it grows or is laid out again', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'notes', text: DOC }, ctx);
    await handleToolCall('write_table', { id: 'costs', columns: ['Item', 'Cost'], rows: [['API', '$10'], ['DB', '$50']] }, ctx);
    for (let i = 0; i < 4; i++) {
      const r = await handleToolCall('edit_diagram', {
        summary: 'more', add_nodes: [{ id: `svc${i}`, label: `Service ${i}`, kind: 'service', group: 'gcp' }],
        add_edges: [{ from: i === 0 ? 'db' : `svc${i - 1}`, to: `svc${i}` }],
      }, ctx);
      expect(r.ok).toBe(true);
      expectBlocksClear(ws.store.scene);
    }
    await handleToolCall('tidy_layout', { direction: 'TB' }, ctx);
    expectBlocksClear(ws.store.scene);
    // A text that grows pushes the table below it down
    await handleToolCall('write_text', { id: 'notes', text: DOC.repeat(5) }, ctx);
    expectBlocksClear(ws.store.scene);
  });

  it('draws a diagram next to texts written on an empty page', async () => {
    const ws = new Workspace();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'notes', title: 'Requirements', text: DOC }, ctx);
    const r = await handleToolCall('create_diagram', webApp, ctx);
    expect(r.ok).toBe(true);
    expect(ws.store.scene.blocks.map((b) => b.id)).toEqual(['notes']);
    expectBlocksClear(ws.store.scene);
  });

  it('sets and clears the subtitle', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('edit_diagram', { summary: 'subtitle', subtitle: 'Production · v2' }, ctx);
    expect(ws.store.scene.subtitle).toBe('Production · v2');
    expect(describeScene(ws.store.scene)).toContain('subtitle "Production · v2"');
    await handleToolCall('edit_diagram', { summary: 'subtitle', subtitle: '' }, ctx);
    expect(ws.store.scene.subtitle).toBeUndefined();
  });
});

describe('pages', () => {
  it('draws a separate diagram on a new page and keeps the first one', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    const refused = await handleToolCall('create_diagram', flow, ctx);
    expect(refused.ok).toBe(false);
    expect(String((refused.errors as string[])[0])).toContain('new_page: true');
    const r = await handleToolCall('create_diagram', { ...flow, new_page: true }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.pages).toHaveLength(2);
    expect(ws.activeId).toBe(ws.pages[1].id);
    expect(ws.pages[0].store.scene.title).toBe('Web App on GCP');
    expect(ws.store.scene.title).toBe('Checkout');
    expect(String(r.diagram)).toMatch(/pages: page_1 "Web App on GCP" · page_2 "Checkout" \(current\)/);
  });

  it('creates on the current page when it is empty, even with new_page', async () => {
    const ws = new Workspace();
    const r = await handleToolCall('create_diagram', { ...flow, new_page: true }, { workspace: ws, source: 'voice' });
    expect(r.ok).toBe(true);
    expect(ws.pages).toHaveLength(1);
  });

  it('switches, renames and closes pages by number, name or position', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('create_diagram', { ...flow, new_page: true }, ctx);
    await handleToolCall('new_page', { title: 'Security' }, ctx);
    expect(ws.pages.map((p) => ws.pageTitle(p))).toEqual(['Web App on GCP', 'Checkout', 'Security']);

    expect((await handleToolCall('switch_page', { page: '1' }, ctx)).ok).toBe(true);
    expect(ws.active.id).toBe('page_1');
    await handleToolCall('switch_page', { page: 'the checkout tab' }, ctx);
    expect(ws.pageTitle(ws.active)).toBe('Checkout');
    await handleToolCall('switch_page', { page: 'last' }, ctx);
    expect(ws.pageTitle(ws.active)).toBe('Security');
    await handleToolCall('switch_page', { page: 'second' }, ctx);
    expect(ws.pageTitle(ws.active)).toBe('Checkout');
    expect((await handleToolCall('switch_page', { page: '9' }, ctx)).ok).toBe(false);

    await handleToolCall('rename_page', { page: 'Security', title: 'Security Model' }, ctx);
    expect(ws.pageTitle(ws.pages[2])).toBe('Security Model');

    const closed = await handleToolCall('delete_page', { page: 'Checkout' }, ctx);
    expect(closed.ok).toBe(true);
    expect(ws.pages).toHaveLength(2);
    await handleToolCall('delete_page', {}, ctx);
    const last = await handleToolCall('delete_page', {}, ctx);
    expect(last.ok).toBe(false);
    expect(ws.pages).toHaveLength(1);
  });

  it('acts on the active page for edits and undo', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('create_diagram', { ...flow, new_page: true }, ctx);
    await handleToolCall('edit_diagram', { summary: 'x', add_nodes: [{ id: 'ship', label: 'Ship', kind: 'process' }] }, ctx);
    expect(ws.pages[1].store.scene.nodes.map((n) => n.id)).toContain('ship');
    expect(ws.pages[0].store.scene.nodes.map((n) => n.id)).not.toContain('ship');
    await handleToolCall('undo', {}, ctx);
    expect(ws.pages[1].store.scene.nodes.map((n) => n.id)).not.toContain('ship');
  });

  it('restores a closed page', async () => {
    const ws = await workspaceWithDiagram();
    ws.addPage({ title: 'Two' });
    const removed = ws.removePage(ws.pages[0].id)!;
    expect(ws.pages).toHaveLength(1);
    ws.restorePage(removed);
    expect(ws.pages.map((p) => ws.pageTitle(p))).toEqual(['Web App on GCP', 'Two']);
    // It was not the active page, so the view stays where it is
    expect(ws.activeId).toBe('page_2');
    const again = ws.removePage('page_2')!;
    expect(ws.activeId).toBe('page_1');
    ws.restorePage(again);
    expect(ws.activeId).toBe('page_2');
  });

  it('moves the view through the view controller', async () => {
    const ws = await workspaceWithDiagram();
    const calls: string[] = [];
    const view: ViewController = {
      zoomIn: () => calls.push('in'), zoomOut: () => calls.push('out'), fit: () => calls.push('fit'),
      actualSize: () => calls.push('100'), focus: (ids) => { calls.push(`focus ${ids.join(',')}`); return true; },
    };
    const ctx = { workspace: ws, source: 'voice' as const, view };
    await handleToolCall('change_view', { action: 'zoom_in' }, ctx);
    await handleToolCall('change_view', { action: 'focus', targets: ['db', 'Load Balancer', 'nothing'] }, ctx);
    expect((await handleToolCall('change_view', { action: 'focus', targets: ['nothing'] }, ctx)).ok).toBe(false);
    await handleToolCall('change_view', { action: 'fit' }, ctx);
    expect(calls).toEqual(['in', 'focus db,lb', 'fit']);
    expect((await handleToolCall('change_view', { action: 'fit' }, { workspace: ws, source: 'voice' })).ok).toBe(false);
  });

  it('still works on a single store without pages (eval)', async () => {
    const store = new DiagramStore();
    const r = await handleToolCall('create_diagram', webApp, { store, source: 'text' });
    expect(r.ok).toBe(true);
    expect(String(r.diagram)).not.toContain('pages:');
    expect((await handleToolCall('new_page', {}, { store, source: 'text' })).ok).toBe(false);
  });
});

describe('diagram history', () => {
  it('records every generated diagram and follows its edits', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const, request: 'Add a cache' };
    expect(ws.library).toHaveLength(1);
    expect(ws.library[0]).toMatchObject({ title: 'Web App on GCP', request: 'Draw a web app on GCP', source: 'voice' });
    await handleToolCall('edit_diagram', { summary: 'cache', add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache' }] }, ctx);
    expect(ws.library[0].scene.nodes.map((n) => n.id)).toContain('cache');
    expect(ws.pageOfEntry(ws.library[0].id)?.id).toBe('page_1');

    // A new page and a replaced diagram are new entries; the replaced one keeps its last state
    await handleToolCall('create_diagram', { ...flow, new_page: true }, ctx);
    expect(ws.library.map((e) => e.title)).toEqual(['Checkout', 'Web App on GCP']);
    await handleToolCall('create_diagram', { ...flow, title: 'Refunds', replace: true }, ctx);
    expect(ws.library.map((e) => e.title)).toEqual(['Refunds', 'Checkout', 'Web App on GCP']);
    expect(ws.pageOfEntry(ws.library[1].id)).toBeUndefined();
    expect(ws.library[1].scene.title).toBe('Checkout');
  });

  it('reopens a closed diagram on a new page and keeps following it', async () => {
    const ws = await workspaceWithDiagram();
    const entry = ws.library[0];
    ws.addPage({ title: 'Other' });
    ws.removePage('page_1');
    expect(ws.pageOfEntry(entry.id)).toBeUndefined();
    const page = ws.openEntry(entry.id)!;
    expect(ws.activeId).toBe(page.id);
    expect(ws.library).toHaveLength(1);
    expect(ws.pageOfEntry(entry.id)?.id).toBe(page.id);
    page.store.edit({ add_nodes: [{ id: 'cdn', label: 'CDN', kind: 'gateway' }] }, { source: 'manual' });
    expect(ws.library[0].scene.nodes.map((n) => n.id)).toContain('cdn');
    // Opening it again shows its page instead of a second copy
    ws.switchTo(ws.pages[0].id);
    expect(ws.openEntry(entry.id)?.id).toBe(page.id);
    expect(ws.pages).toHaveLength(2);
  });

  it('removes an entry and brings it back', async () => {
    const ws = await workspaceWithDiagram();
    const removed = ws.removeEntry(ws.library[0].id)!;
    expect(ws.library).toHaveLength(0);
    // Edits of the page no longer create an entry
    ws.store.edit({ add_nodes: [{ id: 'x', label: 'X', kind: 'service' }] }, { source: 'manual' });
    expect(ws.library).toHaveLength(0);
    ws.restoreEntry(removed);
    expect(ws.library).toHaveLength(1);
    expect(ws.library[0].scene.nodes.map((n) => n.id)).toContain('x');
  });

  it('survives a reload with its pages and history links', async () => {
    const ws = await workspaceWithDiagram();
    await handleToolCall('create_diagram', { ...flow, new_page: true }, { workspace: ws, source: 'voice' });
    const saved = JSON.parse(JSON.stringify(ws.serialize()));
    const again = new Workspace(saved);
    expect(again.pages.map((p) => again.pageTitle(p))).toEqual(['Web App on GCP', 'Checkout']);
    expect(again.activeId).toBe('page_2');
    expect(again.library).toHaveLength(2);
    again.store.edit({ add_nodes: [{ id: 'ship', label: 'Ship', kind: 'process' }] }, { source: 'manual' });
    expect(again.library).toHaveLength(2);
    expect(again.library[0].scene.nodes.map((n) => n.id)).toContain('ship');
    // New pages get new ids
    expect(again.addPage().id).toBe('page_3');
  });
});

describe('export', () => {
  it('writes one draw.io page per page, and a documentation page after a diagram that has one', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'notes', title: 'Notes', text: DOC }, ctx);
    await handleToolCall('write_table', { id: 'costs', columns: ['Item', 'Cost'], rows: [['API', '$10']] }, ctx);
    await handleToolCall('create_diagram', { ...flow, new_page: true }, ctx);
    const xml = toDrawio(ws.pages.map((p) => p.store.scene));
    expect([...xml.matchAll(/<diagram name="([^"]*)"/g)].map((m) => m[1]))
      .toEqual(['Web App on GCP', 'Web App on GCP · Documentation', 'Checkout']);
    const [diagram, docs] = xml.split('<diagram ').slice(1);
    expect(diagram).toContain('id="title"');
    expect(diagram).not.toContain('id="b_notes"');
    expect(docs).toContain('id="b_notes"');
    expect(docs).toContain('1. Notes');
    expect(docs).toContain('2. Table');
    expect(docs).toContain('&lt;table');
    expect(xml).not.toMatch(/value="[^"]*<[^"]*"/); // HTML in attributes is escaped
  });

  it('reads studio files with one or several pages', async () => {
    const ws = await workspaceWithDiagram();
    await handleToolCall('write_text', { id: 'notes', text: DOC }, { workspace: ws, source: 'voice' });
    const one = pagesFromJson(toJson(ws.store.scene))!;
    expect(one).toHaveLength(1);
    expect(one[0].blocks[0].text).toBe(DOC);
    const two = pagesFromJson(pagesToJson([ws.store.scene, ws.store.scene]))!;
    expect(two).toHaveLength(2);
    expect(pagesFromJson('{"nope": 1}')).toBeNull();
  });
});

describe('documentation book', () => {
  it('keeps the chapters in reading order, numbered, with their sections', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'overview', title: 'Overview', text: 'The web app.\n## Scope\n- Public site\n### Out of scope\n- Admin' }, ctx);
    await handleToolCall('write_table', { id: 'components', title: 'Components', columns: ['Component', 'Technology'], rows: [['API', 'Cloud Run']] }, ctx);
    await handleToolCall('write_text', { id: 'data_flow', title: 'Data flow', text: DOC }, ctx);
    const r = await handleToolCall('write_text', { id: 'security', title: 'Security', after: 'overview', text: '## Identity\n- IAM' }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.store.scene.blocks.map((b) => b.id)).toEqual(['overview', 'security', 'components', 'data_flow']);
    expect(String(r.diagram)).toMatch(/1\. overview text "Overview"[\s\S]*2\. security text "Security"[\s\S]*3\. components table/);

    const book = bookOutline(ws.store.scene);
    expect(book.map((c) => [c.number, c.title, c.kind])).toEqual([
      [1, 'Overview', 'text'], [2, 'Security', 'text'], [3, 'Components', 'table'], [4, 'Data flow', 'text'],
    ]);
    expect(book[0].sections.map((s) => [s.heading, s.level, s.text])).toEqual([[0, 2, 'Scope'], [1, 3, 'Out of scope']]);
    expect(book[3].sections.map((s) => s.text)).toEqual(['Overview', 'Data flow']);

    // Reorder: to the start, after a chapter named by its title; an unknown chapter only warns
    await handleToolCall('write_text', { id: 'data_flow', after: 'start' }, ctx);
    await handleToolCall('write_table', { id: 'components', after: 'Overview' }, ctx);
    expect(ws.store.scene.blocks.map((b) => b.id)).toEqual(['data_flow', 'overview', 'components', 'security']);
    const bad = await handleToolCall('write_text', { id: 'security', text: 'Changed', after: 'nowhere' }, ctx);
    expect(bad.ok).toBe(true);
    expect((bad.warnings as string[]).join(' ')).toMatch(/not a chapter/);
    expect(ws.store.scene.blocks.map((b) => b.id)).toEqual(['data_flow', 'overview', 'components', 'security']);
  });

  it('takes the title from a leading heading and shows it only once', () => {
    const scene = { ...new DiagramStore().scene, blocks: [
      { id: 'a', kind: 'text' as const, text: '# Runbook\n## Deploy\n- …', x: 0, y: 0, w: 0, h: 0 },
      { id: 'b', kind: 'text' as const, title: 'Risks', text: '## Risks\n- Cost', x: 0, y: 0, w: 0, h: 0 },
      { id: 'c', kind: 'text' as const, title: 'Notes', text: 'Plain', x: 0, y: 0, w: 0, h: 0 },
    ] };
    const book = bookOutline(scene);
    expect(book.map((c) => [c.title, c.skipFirstHeading, c.sections.map((s) => s.text)])).toEqual([
      ['Runbook', true, ['Deploy']], ['Risks', true, []], ['Notes', false, []],
    ]);
  });

  it('switches between the diagram and the documentation as the agent works', async () => {
    const ws = await workspaceWithDiagram();
    const calls: string[] = [];
    const view: ViewController = {
      zoomIn: () => calls.push('in'), zoomOut: () => calls.push('out'), fit: () => calls.push('fit'),
      actualSize: () => calls.push('100'), focus: (ids) => { calls.push(`focus ${ids}`); return true; },
    };
    const ctx = { workspace: ws, source: 'voice' as const, view };
    await handleToolCall('write_text', { id: 'overview', title: 'Overview', text: DOC }, ctx);
    await handleToolCall('write_text', { id: 'risks', title: 'Risks', text: '- Cost' }, ctx);
    expect([ws.view, ws.active.chapter]).toEqual(['doc', 'risks']);

    // "This chapter" is the open one
    let r = await handleToolCall('write_text', { id: '@selected', text: '- Cost\n- Latency' }, ctx);
    expect(ws.store.scene.blocks.find((b) => b.id === 'risks')?.text).toBe('- Cost\n- Latency');

    // An edit of the diagram shows the diagram; removing a chapter does not
    r = await handleToolCall('edit_diagram', { summary: 'Added a cache', add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache' }] }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.view).toBe('diagram');
    expect(ws.store.selection).toEqual([]);
    await handleToolCall('switch_page', { view: 'documentation', chapter: 'Overview' }, ctx);
    expect([ws.view, ws.active.chapter]).toEqual(['doc', 'overview']);
    await handleToolCall('edit_diagram', { summary: 'Removed the risks', remove_blocks: ['risks'] }, ctx);
    expect(ws.view).toBe('doc');

    // Spoken references to the documentation, and back to the diagram
    await handleToolCall('switch_page', { page: '1' }, ctx);
    expect(ws.view).toBe('diagram');
    r = await handleToolCall('switch_page', { page: 'the documentation' }, ctx);
    expect(r.ok).toBe(true);
    expect(ws.view).toBe('doc');
    await handleToolCall('switch_page', { view: 'diagram' }, ctx);
    expect(ws.view).toBe('diagram');

    // Focusing a chapter opens it; zooming shows the diagram
    await handleToolCall('change_view', { action: 'focus', targets: ['overview'] }, ctx);
    expect([ws.view, ws.active.chapter]).toEqual(['doc', 'overview']);
    await handleToolCall('change_view', { action: 'fit' }, ctx);
    expect(ws.view).toBe('diagram');
    expect(calls).toEqual(['fit']);

    // Undoing a chapter shows the documentation, undoing a diagram edit the diagram
    await handleToolCall('write_text', { id: 'ops', title: 'Operations', text: '- Alerts' }, ctx);
    await handleToolCall('switch_page', { view: 'diagram' }, ctx);
    await handleToolCall('undo', {}, ctx);
    expect(ws.view).toBe('doc');
    expect(ws.store.scene.blocks.some((b) => b.id === 'ops')).toBe(false);
  });

  it('keeps the open documentation across a reload', async () => {
    const ws = await workspaceWithDiagram();
    await handleToolCall('write_text', { id: 'overview', title: 'Overview', text: DOC }, { workspace: ws, source: 'voice' });
    const again = new Workspace(ws.serialize());
    expect([again.view, again.active.chapter]).toEqual(['doc', 'overview']);
    // A new diagram on a new page shows its diagram
    await handleToolCall('create_diagram', { ...flow, new_page: true }, { workspace: again, source: 'voice' });
    expect(again.view).toBe('diagram');
  });

  it('exports the book as Markdown', async () => {
    const ws = await workspaceWithDiagram();
    const ctx = { workspace: ws, source: 'voice' as const };
    await handleToolCall('write_text', { id: 'overview', title: 'Overview', text: '## Overview\nThe web app.\n## Scope\n- Public' }, ctx);
    await handleToolCall('write_table', { id: 'components', title: 'Components', columns: ['Component', 'Technology'], rows: [['API', 'Cloud Run | Go']] }, ctx);
    expect(bookToMarkdown(ws.store.scene)).toBe([
      '# Web App on GCP',
      '1. Overview\n2. Components',
      '## 1. Overview',
      'The web app.\n### Scope\n- Public',
      '## 2. Components',
      '| Component | Technology |\n| --- | --- |\n| API | Cloud Run \\| Go |',
    ].join('\n\n') + '\n');
  });
});
