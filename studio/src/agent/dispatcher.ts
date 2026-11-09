/**
 * Executes the agent's function calls on the workspace. Every response
 * carries the resulting diagram state of the active page (and the list of
 * pages), so the model always edits the real canvas (including changes the
 * user made by hand) instead of its memory.
 */
import { resolveBlock } from '../engine/blocks';
import { loadAllBlueprints, retrieveCatalogContext } from '../engine/catalog';
import type { BlockInput, CreateRequest, EditRequest, EditResult } from '../engine/ops';
import { DiagramStore, type ChangeSource } from '../engine/store';
import { describeChanges, describeScene } from '../engine/summary';
import type { ChangeSet } from '../engine/types';
import type { Workspace } from '../engine/workspace';

/** Moves the canvas view; provided by the UI. */
export interface ViewController {
  zoomIn(): void;
  zoomOut(): void;
  /** Fits the whole diagram (with its texts and tables). */
  fit(): void;
  /** 100 %. */
  actualSize(): void;
  /** Zooms to the given elements (nodes or groups); false if none is on the canvas. */
  focus(ids: string[]): boolean;
}

export interface ToolContext {
  /** The document with its pages; tools act on the active page. */
  workspace?: Workspace;
  /** A single diagram without pages (tests, eval). Ignored when workspace is set. */
  store?: DiagramStore;
  source: ChangeSource;
  /** What the user said or typed in the current turn, for the history. */
  request?: string;
  view?: ViewController;
}

export type ToolResponse = Record<string, unknown>;

function storeOf(ctx: ToolContext): DiagramStore {
  const store = ctx.workspace?.store ?? ctx.store;
  if (store == null) throw new Error('No diagram to edit.');
  return store;
}

/**
 * The pages line of the state, e.g.
 *   pages: page_1 "Checkout" (current) + documentation (3 chapters) · page_2 "Data flow".
 */
function pagesLine(ws: Workspace): string {
  return 'pages: ' + ws.pages.map((p, i) => {
    const chapters = p.store.scene.blocks.length;
    return `${p.id} ${JSON.stringify(ws.pageTitle(p))}` +
      (p.id === ws.activeId ? (p.view === 'doc' ? ' (current, its documentation tab is shown)' : ' (current)') : '') +
      (chapters > 0 ? ` + documentation (${chapters} ${chapters === 1 ? 'chapter' : 'chapters'})` : '') +
      (i === 0 && ws.pages.length === 1 ? ' (only page)' : '');
  }).join(' · ');
}

/**
 * Shows what an agent change touched: the documentation tab (at the chapter)
 * when only chapters were written, the diagram when the diagram changed.
 */
function follow(ws: Workspace | undefined, c: ChangeSet | undefined) {
  if (ws == null || c == null) return;
  const diagram = c.addedNodes.length + c.updatedNodes.length + c.removedNodes.length + c.movedNodes.length +
    c.addedEdges.length + c.updatedEdges.length + c.removedEdges.length +
    c.addedGroups.length + c.updatedGroups.length + c.removedGroups.length > 0;
  const chapters = [...c.addedBlocks, ...c.updatedBlocks, ...c.removedBlocks];
  // A chapter that is gone (removed, or its writing undone) leaves the documentation at another chapter
  const chapter = chapters.find((id) => ws.store.scene.blocks.some((b) => b.id === id));
  if (diagram) ws.showView('diagram');
  else if (chapters.length > 0) ws.showView('doc', { chapter });
}

const DOC_WORDS = /\b(doc|docs|documentation|documentatia|documentatie|documentația|documentație|book|carte|cartea)\b/i;

function stateOf(ctx: ToolContext): string {
  const store = storeOf(ctx);
  const scene = describeScene(store.scene, store.selection);
  return ctx.workspace != null ? `${pagesLine(ctx.workspace)}\n${scene}` : scene;
}

function editResponse(ctx: ToolContext, result: EditResult, staleNote?: string): ToolResponse {
  const response: ToolResponse = { ok: result.ok };
  if (result.ok) {
    response.result = describeChanges(result.changes);
  } else {
    response.errors = result.errors;
    response.result = 'Nothing was changed.';
  }
  if (result.warnings.length > 0) response.warnings = result.warnings;
  if (result.notes.length > 0) response.understood = result.notes;
  if (staleNote) response.note = staleNote;
  response.diagram = stateOf(ctx);
  return response;
}

const asInt = (v: unknown, def: number) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 50) : def;
};

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined);

const needsPages = (ctx: ToolContext): ToolResponse | null => (ctx.workspace == null
  ? { ok: false, errors: ['Pages are not available here.'], diagram: stateOf(ctx) }
  : null);

/** Label of a write_text / write_table call in the history. */
function blockLabel(kind: 'text' | 'table', input: BlockInput, existed: boolean, summary: string | undefined): string {
  if (summary) return summary;
  const name = input.title ? `“${input.title}”` : kind === 'table' ? 'a table' : 'a text';
  if (kind === 'table') return existed ? `Updated the table ${input.title ? name : ''}`.trim() : `Added the table ${name}`;
  return existed ? `Updated ${name}` : `Wrote ${name}`;
}

export async function handleToolCall(name: string, args: Record<string, unknown> | undefined, ctx: ToolContext): Promise<ToolResponse> {
  const a = args ?? {};
  const ws = ctx.workspace;
  const meta = { source: ctx.source, request: ctx.request };

  switch (name) {
    case 'get_diagram':
      return { ok: true, diagram: stateOf(ctx) };

    case 'search_catalog': {
      // Without the 101 blueprints the search still has the built-in ones
      await loadAllBlueprints().catch(() => undefined);
      const retrieved = retrieveCatalogContext(str(a.query) ?? '', {
        provider: str(a.provider),
        category: str(a.category),
      });
      return {
        ok: true,
        blueprints: retrieved.blueprints,
        components: retrieved.components,
        diagram: stateOf(ctx),
      };
    }

    case 'create_diagram': {
      const store = storeOf(ctx);
      // Documentation alone does not count: the diagram is drawn on the page and the chapters stay
      const isEmpty = store.scene.nodes.length === 0 && store.scene.groups.length === 0;
      const label = typeof a.title === 'string' && a.title ? `Created “${a.title}”` : undefined;
      if (!isEmpty && a.new_page === true && ws != null) {
        // A separate diagram on its own page; the current one stays as it is
        const draft = new DiagramStore();
        const result = await draft.create(a as CreateRequest, { ...meta, label });
        if (result.ok) ws.addPage({ scene: draft.scene, label: label ?? 'Created the diagram', meta });
        return editResponse(ctx, result);
      }
      if (!isEmpty && a.replace !== true) {
        const scene = store.scene;
        return {
          ok: false,
          errors: [`The current page already has a diagram (${scene.nodes.length} nodes). Change it with edit_diagram. ` +
            (ws != null ? 'For a new, separate diagram call create_diagram again with new_page: true (keeps this one). ' : '') +
            'Use replace: true only if the user explicitly asked to replace this diagram or to start over.'],
          diagram: stateOf(ctx),
        };
      }
      const result = await store.create(a as CreateRequest, { ...meta, label });
      if (result.ok) ws?.showView('diagram');
      return editResponse(ctx, result);
    }

    case 'edit_diagram': {
      const store = storeOf(ctx);
      const req = a as EditRequest;
      const base = typeof req.base_version === 'number' ? req.base_version : undefined;
      const current = store.scene.version;
      const stale = base != null && base !== current
        ? `The diagram is at version ${current}, not ${base} (it was changed in the meantime, e.g. by hand). ` +
          'The state below is current; check that the edit still fits it.'
        : undefined;
      const result = store.edit(req, { ...meta, label: typeof req.summary === 'string' && req.summary.trim() ? req.summary.trim() : undefined });
      if (result.ok) follow(ws, result.changes);
      return editResponse(ctx, result, stale);
    }

    case 'write_text':
    case 'write_table': {
      const store = storeOf(ctx);
      const kind = name === 'write_table' ? 'table' : 'text';
      const input: BlockInput = { ...(a as BlockInput), kind };
      const existed = input.id != null && store.scene.blocks.some((b) => b.id === input.id);
      const result = store.edit({ write_blocks: [input] }, { ...meta, label: blockLabel(kind, input, existed, str(a.summary)) });
      const id = result.ok ? [...result.changes.addedBlocks, ...result.changes.updatedBlocks][0] : undefined;
      // The chapter is shown in the documentation tab as soon as it is written
      if (id != null) ws?.showView('doc', { chapter: id });
      const response = editResponse(ctx, result);
      if (id != null) response.id = id;
      return response;
    }

    case 'tidy_layout': {
      const store = storeOf(ctx);
      const dir = typeof a.direction === 'string' ? a.direction.toUpperCase() : undefined;
      await store.relayout({ ...meta, label: dir ? `Laid out ${dir === 'TB' ? 'top to bottom' : 'left to right'}` : undefined },
        dir === 'TB' || dir === 'TD' ? 'TB' : dir === 'LR' ? 'LR' : undefined);
      ws?.showView('diagram');
      return { ok: true, result: 'Laid out again.', diagram: stateOf(ctx) };
    }

    case 'undo': {
      const steps = asInt(a.steps, 1);
      const store = storeOf(ctx);
      const done = store.undo(steps);
      if (done) follow(ws, store.lastChange?.changes);
      return { ok: done, result: done ? `Undid ${steps} change(s).` : 'Nothing to undo on this page.', diagram: stateOf(ctx) };
    }

    case 'redo': {
      const steps = asInt(a.steps, 1);
      const store = storeOf(ctx);
      const done = store.redo(steps);
      if (done) follow(ws, store.lastChange?.changes);
      return { ok: done, result: done ? `Redid ${steps} change(s).` : 'Nothing to redo on this page.', diagram: stateOf(ctx) };
    }

    case 'new_page': {
      const missing = needsPages(ctx);
      if (missing || ws == null) return missing!;
      const page = ws.addPage({ title: str(a.title), label: 'New page', meta });
      return { ok: true, result: `Opened the new page ${page.id}.`, diagram: stateOf(ctx) };
    }

    case 'switch_page': {
      const missing = needsPages(ctx);
      if (missing || ws == null) return missing!;
      // "the documentation of the checkout", "open the docs": the documentation tab of that page
      const ref = str(a.page);
      const viewArg = str(a.view)?.toLowerCase();
      const docRef = ref != null && DOC_WORDS.test(ref);
      const pageRef = docRef
        ? str(ref!.replace(new RegExp(DOC_WORDS.source, 'gi'), ' ').replace(/\b(of|the|for|a|al|lui|despre|open|show)\b/gi, ' '))
        : ref;
      const docs = viewArg != null ? /^doc/.test(viewArg) : docRef;
      const r = ws.findPage(pageRef);
      if (r.item == null) return { ok: false, errors: [r.error ?? 'No such page.'], diagram: stateOf(ctx) };
      const chapter = str(a.chapter);
      const blocks = r.item.store.scene.blocks;
      const found = chapter != null ? resolveBlock(chapter, blocks) : undefined;
      if (found != null && found.item == null) {
        return { ok: false, errors: [`switch_page: ${found.error ?? `no chapter "${chapter}"`}`], diagram: stateOf(ctx) };
      }
      ws.showView(docs || found != null ? 'doc' : 'diagram', { page: r.item.id, chapter: found?.item?.id });
      const notes = [r.note, found?.note].filter((x): x is string => x != null);
      const shown = ws.view === 'doc'
        ? (blocks.length === 0 ? 'its documentation tab (no chapters yet)' : 'its documentation tab')
        : 'its diagram';
      return { ok: true, result: `Now on ${r.item.id}, showing ${shown}.`, ...(notes.length ? { understood: notes } : {}), diagram: stateOf(ctx) };
    }

    case 'rename_page': {
      const missing = needsPages(ctx);
      if (missing || ws == null) return missing!;
      const title = str(a.title);
      const r = ws.findPage(str(a.page));
      if (r.item == null || title == null) {
        return { ok: false, errors: [title == null ? 'rename_page needs a title.' : r.error ?? 'No such page.'], diagram: stateOf(ctx) };
      }
      ws.renamePage(r.item.id, title, { ...meta, label: `Renamed the page to “${title}”` });
      return { ok: true, result: `Renamed ${r.item.id}.`, diagram: stateOf(ctx) };
    }

    case 'delete_page': {
      const missing = needsPages(ctx);
      if (missing || ws == null) return missing!;
      const r = ws.findPage(str(a.page));
      if (r.item == null) return { ok: false, errors: [r.error ?? 'No such page.'], diagram: stateOf(ctx) };
      if (ws.pages.length <= 1) {
        return { ok: false, errors: ['This is the only page and cannot be closed. To clear it, ask the user and use create_diagram with replace: true.'], diagram: stateOf(ctx) };
      }
      const title = ws.pageTitle(r.item);
      ws.removePage(r.item.id);
      return { ok: true, result: `Closed the page "${title}" (it stays in the diagram history).`, diagram: stateOf(ctx) };
    }

    case 'change_view': {
      const view = ctx.view;
      const action = String(a.action ?? 'fit').toLowerCase();
      const targets = Array.isArray(a.targets) ? a.targets.map(String) : typeof a.targets === 'string' ? [a.targets] : [];
      // A chapter is "focused" by opening it in the documentation tab
      const scene = storeOf(ctx).scene;
      const chapter = action === 'focus' && ws != null
        ? targets.map((t) => scene.blocks.find((b) => b.id === t)).find((b) => b != null)
        : undefined;
      if (chapter != null) {
        ws!.showView('doc', { chapter: chapter.id });
        return { ok: true, result: `Opened the chapter ${chapter.id} in the documentation tab.` };
      }
      if (view == null) return { ok: false, errors: ['The view cannot be changed here.'] };
      // Zooming is about the diagram: show it if the documentation was open
      ws?.showView('diagram');
      switch (action) {
        case 'zoom_in': view.zoomIn(); break;
        case 'zoom_out': view.zoomOut(); break;
        case 'actual_size': view.actualSize(); break;
        case 'focus': {
          const store = storeOf(ctx);
          const ids = targets.flatMap((t) => {
            if (store.scene.nodes.some((n) => n.id === t) || store.scene.groups.some((g) => g.id === t)) return [t];
            const n = store.scene.nodes.find((x) => x.label.toLowerCase() === t.toLowerCase());
            return n != null ? [n.id] : [];
          });
          if (ids.length === 0 || !view.focus(ids)) {
            return { ok: false, errors: [`Nothing to focus on: ${targets.join(', ') || 'no targets'} (use ids from the state).`] };
          }
          break;
        }
        default: view.fit();
      }
      return { ok: true, result: 'View changed.' };
    }

    default:
      return { ok: false, errors: [`Unknown function ${name}.`] };
  }
}
