/**
 * Editing the chapters of a page's documentation by hand: the editable text
 * form of a chapter, and adding a new chapter (it opens in the documentation tab).
 */
import { normalize } from '../engine/resolve';
import type { DiagramStore } from '../engine/store';
import type { DBlock } from '../engine/types';
import type { Workspace } from '../engine/workspace';

/** The editable source of a chapter: Markdown, or for a table one row per line with cells separated by "|". */
export function chapterSource(b: DBlock): string {
  if (b.kind === 'text') return b.text ?? '';
  return [b.columns ?? [], ...(b.rows ?? [])].map((r) => r.join(' | ')).join('\n');
}

/** Parses the text form of a table (the first line is the header). */
export function parseTableSource(src: string): { columns: string[]; rows: string[][] } | null {
  const lines = src.split('\n').map((l) => l.trim()).filter((l) => l !== '' && !/^\|?[\s:|-]+\|?$/.test(l));
  if (lines.length === 0) return null;
  const split = (l: string) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  return { columns: split(lines[0]), rows: lines.slice(1).map(split) };
}

/** Adds a chapter after the open one (or at the end) and opens it. Returns its id. */
export function addChapter(workspace: Workspace, store: DiagramStore, kind: 'text' | 'table'): string | undefined {
  const page = workspace.active;
  const open = workspace.view === 'doc' ? page.chapter : undefined;
  const after = open != null && store.scene.blocks.some((b) => b.id === open) ? open : undefined;
  // A chapter with the same title would be rewritten instead of added
  const titles = new Set(store.scene.blocks.map((b) => normalize(b.title ?? '')));
  const base = kind === 'text' ? 'New chapter' : 'Components';
  let title = base;
  for (let n = 2; titles.has(normalize(title)); n++) title = `${base} ${n}`;
  const r = store.edit({
    write_blocks: [kind === 'text'
      ? { kind, title, after, text: 'Write this chapter here.\n\n## A section\n- Markdown works: **bold**, `code`, "- " bullets\n- Each "## " heading is a section in the contents' }
      : { kind, title, after, columns: ['Component', 'Technology', 'Responsibility'], rows: [['', '', '']] }],
  }, { source: 'manual', label: kind === 'text' ? 'Added a chapter' : 'Added a table' });
  const id = r.ok ? r.changes.addedBlocks[0] : undefined;
  if (id != null) workspace.showView('doc', { chapter: id });
  return id;
}
