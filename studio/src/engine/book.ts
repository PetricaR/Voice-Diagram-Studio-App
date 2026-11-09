/**
 * The documentation of a page as a book. Its chapters are the page's text and
 * table blocks in reading order; the headings inside a text chapter are its
 * sections. Builds the table of contents (the book's menu) and the Markdown
 * export.
 */
import { normalizeText, parseMarkdown, plainInline } from './markdown';
import { normalize } from './resolve';
import type { DBlock, Scene } from './types';

export interface BookSection {
  /** Index of the heading among the headings of the chapter (anchors use it). */
  heading: number;
  level: 1 | 2 | 3;
  text: string;
}

export interface BookChapter {
  id: string;
  /** 1-based number in the book. */
  number: number;
  title: string;
  kind: DBlock['kind'];
  sections: BookSection[];
  /** The text starts with a heading that is the chapter title: shown once, as the title. */
  skipFirstHeading: boolean;
  /** Approximate number of words, for the reading time. */
  words: number;
}

/** Title, sections and size of one chapter. */
export function chapterInfo(b: DBlock, number: number): BookChapter {
  if (b.kind === 'table') {
    const cells = [...(b.columns ?? []), ...(b.rows ?? []).flat()].join(' ');
    return {
      id: b.id, number, kind: 'table', title: b.title?.trim() || 'Table', sections: [], skipFirstHeading: false,
      words: cells.split(/\s+/).filter(Boolean).length,
    };
  }
  const md = parseMarkdown(b.text ?? '');
  const headings = md.flatMap((x) => (x.type === 'heading' ? [x] : []));
  const first = md[0]?.type === 'heading' ? md[0] : undefined;
  const ownTitle = b.title?.trim();
  const skipFirstHeading = first != null && (ownTitle == null || ownTitle === '' ||
    normalize(plainInline(first.text)) === normalize(plainInline(ownTitle)));
  const title = ownTitle || (first != null ? plainInline(first.text) : `Chapter ${number}`);
  const sections: BookSection[] = headings
    .map((h, i) => ({ heading: i, level: h.level, text: plainInline(h.text) }))
    .filter((s) => !(skipFirstHeading && s.heading === 0));
  return {
    id: b.id, number, kind: 'text', title, sections, skipFirstHeading,
    words: normalizeText(b.text ?? '').split(/\s+/).filter(Boolean).length,
  };
}

/** The table of contents of a page's documentation. */
export function bookOutline(scene: Scene): BookChapter[] {
  return scene.blocks.map((b, i) => chapterInfo(b, i + 1));
}

const escapeCell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** A pipe table. */
export function tableMarkdown(columns: string[], rows: string[][]): string {
  const line = (cells: string[]) => `| ${cells.map(escapeCell).join(' | ')} |`;
  return [line(columns), line(columns.map(() => '---')), ...rows.map(line)].join('\n');
}

/**
 * The documentation as one Markdown file: the title of the page, a contents
 * list, then "## n. Chapter" per chapter with its sections one level lower.
 */
export function bookToMarkdown(scene: Scene): string {
  const chapters = bookOutline(scene);
  const out: string[] = [`# ${scene.title || 'Documentation'}`];
  if (scene.subtitle) out.push(`_${scene.subtitle}_`);
  if (chapters.length > 1) out.push(chapters.map((c) => `${c.number}. ${c.title}`).join('\n'));
  scene.blocks.forEach((b, i) => {
    const c = chapters[i];
    out.push(`## ${c.number}. ${c.title}`);
    if (b.kind === 'table') {
      out.push(tableMarkdown(b.columns ?? [], b.rows ?? []));
      return;
    }
    let lines = normalizeText(b.text ?? '').split('\n');
    if (c.skipFirstHeading) {
      const at = lines.findIndex((l) => l.trim() !== '');
      lines = lines.slice(at + 1);
    }
    // Sections sit under the chapter heading
    let fenced = false;
    const body = lines.map((l) => {
      if (l.trim().startsWith('```')) fenced = !fenced;
      const h = fenced ? null : /^(#{1,6})\s+(.*)$/.exec(l.trim());
      return h ? `${'#'.repeat(Math.min(6, Math.max(3, h[1].length + 1)))} ${h[2]}` : l;
    }).join('\n').trim();
    if (body) out.push(body);
  });
  return out.join('\n\n') + '\n';
}
