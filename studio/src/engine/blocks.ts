/**
 * Text and table blocks: their size (estimated from the content with the
 * same metrics the canvas uses, see styles.css ".block") and their place
 * next to the diagram. Blocks never sit on top of nodes or groups: new ones
 * go into free space beside the diagram, and blocks that a change of the
 * diagram would cover are moved out of the way (the diagram itself never
 * moves for a block).
 */
import { parseMarkdown, plainInline } from './markdown';
import { resolveRef, type Resolution } from './resolve';
import { groupBounds, intersects, sceneBounds, union } from './scene';
import type { DBlock, Rect, Scene } from './types';

export type BlockSide = 'right' | 'left' | 'above' | 'below';

/** Metrics shared with styles.css (.block, .md-*). */
export const BLOCK_METRICS = {
  padX: 16,
  padY: 14,
  title: 30,
  textWidth: 400,
  maxTableWidth: 880,
  /** Average glyph widths (px) of Roboto at the sizes used. */
  char: { body: 6.9, h1: 10.2, h2: 9.2, h3: 7.8, code: 7.4, cell: 7.0, head: 7.4 },
};

const GAP = 64;
const MARGIN = 32;
const SNAP = 8;
const snap = (v: number) => Math.round(v / SNAP) * SNAP;

/** Number of lines a text wraps into at the given width. */
function wrapLines(text: string, width: number, charW: number): number {
  const perLine = Math.max(6, Math.floor(width / charW));
  let lines = 0;
  for (const hard of text.split('\n')) {
    // Word wrapping leaves some room at the end of each line
    lines += Math.max(1, Math.ceil((hard.length * 1.06) / perLine));
  }
  return lines;
}

interface TableSize {
  colWidths: number[];
  width: number;
  height: number;
}

/** Column widths and height of a table (cells wrap within their column). */
export function tableSize(columns: string[], rows: string[][], maxWidth: number): TableSize {
  const c = BLOCK_METRICS.char;
  const n = Math.max(1, columns.length);
  let widths = Array.from({ length: n }, (_, i) => {
    let len = plainInline(columns[i] ?? '').length * (c.head / c.cell);
    for (const r of rows) len = Math.max(len, plainInline(r[i] ?? '').length);
    return Math.min(280, Math.max(72, Math.ceil(len * c.cell + 24)));
  });
  const total = widths.reduce((a, b) => a + b, 0);
  if (total > maxWidth) {
    const k = maxWidth / total;
    widths = widths.map((w) => Math.max(64, Math.floor(w * k)));
  }
  const rowHeight = (cells: string[], charW: number) => {
    let lines = 1;
    cells.forEach((cell, i) => {
      lines = Math.max(lines, wrapLines(plainInline(cell ?? ''), (widths[i] ?? 72) - 20, charW));
    });
    return lines * 18 + 11;
  };
  let height = rowHeight(columns, c.head);
  for (const r of rows) height += rowHeight(r, c.cell);
  return { colWidths: widths, width: widths.reduce((a, b) => a + b, 0), height };
}

/** Height of Markdown content at the given inner width. */
function markdownHeight(text: string, inner: number): number {
  const c = BLOCK_METRICS.char;
  let h = 0;
  const blocks = parseMarkdown(text);
  blocks.forEach((b, i) => {
    const first = i === 0;
    switch (b.type) {
      case 'heading': {
        const [lh, cw, mt] = b.level === 1 ? [26, c.h1, 14] : b.level === 2 ? [24, c.h2, 12] : [20, c.h3, 10];
        h += (first ? 0 : mt) + wrapLines(plainInline(b.text), inner, cw) * lh + 4;
        break;
      }
      case 'paragraph':
        h += wrapLines(plainInline(b.text), inner, c.body) * 20 + 8;
        break;
      case 'quote':
        h += wrapLines(plainInline(b.text), inner - 16, c.body) * 20 + 12 + 8;
        break;
      case 'code':
        h += b.text.split('\n').length * 18 + 16 + 8;
        break;
      case 'list':
        for (const item of b.items) {
          h += wrapLines(plainInline(item.text), inner - 20 - item.depth * 16, c.body) * 20 + 2;
        }
        h += 8;
        break;
      case 'table':
        h += tableSize(b.header, b.rows, inner).height + 8;
        break;
      case 'rule':
        h += 17;
        break;
    }
  });
  return Math.max(20, h - 8);
}

/** Width and height of a block for its content. */
export function blockSize(b: Pick<DBlock, 'kind' | 'title' | 'text' | 'columns' | 'rows'>): { w: number; h: number } {
  const m = BLOCK_METRICS;
  const titleH = b.title ? m.title : 0;
  if (b.kind === 'table') {
    const t = tableSize(b.columns ?? [], b.rows ?? [], m.maxTableWidth);
    const titleW = b.title ? plainInline(b.title).length * 8.4 : 0;
    return { w: snap(Math.max(t.width, titleW, 160) + 2 * m.padX), h: snap(t.height + titleH + 2 * m.padY + 4) };
  }
  const text = b.text ?? '';
  const md = parseMarkdown(text);
  const widestTable = Math.max(0, ...md.filter((x) => x.type === 'table').map((x) => (x as { header: string[] }).header.length));
  const w = widestTable > 0 ? Math.min(720, Math.max(m.textWidth, widestTable * 132)) : text.length < 160 ? 320 : m.textWidth;
  const inner = w - 2 * m.padX;
  return { w, h: snap(markdownHeight(text, inner) + titleH + 2 * m.padY + 4) };
}

/** Diagram bounds (nodes and groups) and all content bounds (with blocks). */
export function contentBounds(scene: Scene): Rect | null {
  let r = sceneBounds(scene);
  for (const b of scene.blocks) r = union(r, b);
  return r;
}

function obstacles(scene: Scene, except: Set<string>): Rect[] {
  return [
    ...scene.nodes,
    ...groupBounds(scene).values(),
    ...scene.blocks.filter((b) => !except.has(b.id) && Number.isFinite(b.x)),
  ];
}

/**
 * Puts a block into free space beside the anchor (a node, group or block, or
 * by default the whole diagram): to the right of tall diagrams and below wide
 * ones, after the blocks that are already there.
 */
export function placeBlock(scene: Scene, block: DBlock, hint: { near?: Rect; side?: BlockSide } = {}) {
  const diagram = sceneBounds(scene);
  const others = scene.blocks.filter((b) => b.id !== block.id && Number.isFinite(b.x));
  let anchor = hint.near ?? diagram;
  if (anchor == null) {
    // No diagram: blocks are stacked, the first one at the origin
    let r: Rect | null = null;
    for (const b of others) r = union(r, b);
    anchor = r;
  }
  if (anchor == null) {
    block.x = 0;
    block.y = 0;
    return;
  }
  const side: BlockSide = hint.side ??
    (hint.near == null && diagram != null && diagram.w > diagram.h * 1.6 ? 'below' : 'right');
  const vertical = side === 'right' || side === 'left';
  let x = side === 'right' ? anchor.x + anchor.w + GAP : side === 'left' ? anchor.x - GAP - block.w : anchor.x;
  let y = side === 'below' ? anchor.y + anchor.h + GAP : side === 'above' ? anchor.y - GAP - block.h : anchor.y;
  // Without a diagram, blocks are stacked below each other
  if (diagram == null && hint.near == null) {
    x = anchor.x;
    y = anchor.y + anchor.h + MARGIN;
  }
  const obs = obstacles(scene, new Set([block.id]));
  for (let i = 0; i < 400; i++) {
    const r = { x: snap(x), y: snap(y), w: block.w, h: block.h };
    const hit = obs.find((o) => intersects(r, o, MARGIN));
    if (hit == null) {
      block.x = r.x;
      block.y = r.y;
      return;
    }
    // Skip past what is in the way, along the column or row
    if (vertical) y = Math.max(y + 24, hit.y + hit.h + MARGIN + 1);
    else x = Math.max(x + 24, hit.x + hit.w + MARGIN + 1);
  }
  const all = contentBounds({ ...scene, blocks: others })!;
  block.x = snap(all.x);
  block.y = snap(all.y + all.h + GAP);
}

/**
 * Moves blocks out of the way of the diagram and of each other (after a
 * layout, a new node or a block that grew). Returns the ids that moved.
 */
export function reflowBlocks(scene: Scene, grown?: string): string[] {
  const moved: string[] = [];
  const diagram: Rect[] = [...scene.nodes, ...groupBounds(scene).values()];
  // A block that grew pushes the blocks below it further down
  const g = grown != null ? scene.blocks.find((b) => b.id === grown) : undefined;
  if (g != null) {
    const below = scene.blocks.filter((b) => b !== g && b.y >= g.y).sort((a, b) => a.y - b.y);
    let edge = g;
    for (const b of below) {
      if (intersects(b, edge, MARGIN / 2)) {
        b.y = snap(edge.y + edge.h + MARGIN);
        moved.push(b.id);
        edge = b;
      }
    }
  }
  for (const b of scene.blocks) {
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) {
      placeBlock(scene, b);
      moved.push(b.id);
      continue;
    }
    const others = scene.blocks.filter((o) => o !== b && scene.blocks.indexOf(o) < scene.blocks.indexOf(b));
    if (diagram.some((r) => intersects(b, r, 8)) || others.some((o) => intersects(b, o, 8))) {
      b.x = NaN;
      placeBlock(scene, b);
      moved.push(b.id);
    }
  }
  return [...new Set(moved)];
}

/** Finds a block by id or title (spoken references are approximate). */
export function resolveBlock(ref: string, blocks: DBlock[]): Resolution<DBlock> {
  const items = blocks.map((b) => ({ id: b.id, label: b.title ?? b.id, block: b }));
  const r = resolveRef(ref, items, 'text or table');
  if (r.item == null) {
    // "the table", "the notes": the only block of that kind
    const key = ref.toLowerCase();
    const kind = /\b(table|tabel)/.test(key) ? 'table' : /\b(text|note|notes|doc|documentation|description|documentatie)/.test(key) ? 'text' : null;
    const ofKind = kind != null ? blocks.filter((b) => b.kind === kind) : [];
    if (ofKind.length === 1) return { item: ofKind[0], note: `"${ref}" → ${ofKind[0].id}` };
  }
  return { item: r.item?.block, note: r.note, error: r.error };
}
