/**
 * The Markdown subset of text blocks: headings, paragraphs, bullet and
 * numbered lists, quotes, code, rules and pipe tables, with **bold**,
 * *italic* and `code` inline. One parser feeds both the canvas renderer and
 * the size estimate, so a block is as tall as its content.
 */

export type MdBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: { text: string; depth: number }[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'rule' };

export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

const splitRow = (line: string): string[] =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/** Normalizes text the model sent with escaped line breaks. */
export function normalizeText(src: string): string {
  let s = src.replace(/\r\n?/g, '\n');
  if (!s.includes('\n') && s.includes('\\n')) s = s.replace(/\\n/g, '\n');
  return s.trim();
}

export function parseMarkdown(src: string): MdBlock[] {
  const lines = normalizeText(src).split('\n');
  const out: MdBlock[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length > 0) {
      out.push({ type: 'paragraph', text: para.join(' ') });
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') {
      flush();
      continue;
    }
    if (trimmed.startsWith('```')) {
      flush();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].trim().startsWith('```'); i++) code.push(lines[i]);
      out.push({ type: 'code', text: code.join('\n') });
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      const level = Math.min(3, heading[1].length) as 1 | 2 | 3;
      out.push({ type: 'heading', level, text: heading[2].replace(/\s*#+\s*$/, '') });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      out.push({ type: 'rule' });
      continue;
    }
    if (trimmed.startsWith('|') && trimmed.length > 1) {
      flush();
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
        const t = lines[i].trim();
        if (/^\|?[\s:|-]+\|?$/.test(t) && t.includes('-')) continue; // |---|---|
        rows.push(splitRow(t));
      }
      i--;
      if (rows.length > 0) out.push({ type: 'table', header: rows[0], rows: rows.slice(1) });
      continue;
    }
    const bullet = /^(\s*)([-*•+])\s+(.*)$/.exec(line);
    const numbered = /^(\s*)(\d+)[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flush();
      const m = (bullet ?? numbered)!;
      const ordered = numbered != null && bullet == null;
      const item = { text: m[3], depth: Math.min(2, Math.floor(m[1].replace(/\t/g, '  ').length / 2)) };
      const last = out[out.length - 1];
      if (last?.type === 'list' && (last.ordered === ordered || item.depth > 0)) last.items.push(item);
      else out.push({ type: 'list', ordered, items: [item] });
      continue;
    }
    if (trimmed.startsWith('>')) {
      flush();
      const text = trimmed.replace(/^>\s?/, '');
      const last = out[out.length - 1];
      if (last?.type === 'quote') last.text += ' ' + text;
      else out.push({ type: 'quote', text });
      continue;
    }
    // A line right after a list item that is indented continues it
    const last = out[out.length - 1];
    if (para.length === 0 && last?.type === 'list' && /^\s+/.test(line)) {
      last.items[last.items.length - 1].text += ' ' + trimmed;
      continue;
    }
    para.push(trimmed);
  }
  flush();
  return out;
}

/** Splits **bold**, *italic* / _italic_ and `code` marks. */
export function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  for (let m = re.exec(text); m != null; m = re.exec(text)) {
    if (m.index > last) spans.push({ text: text.slice(last, m.index) });
    const t = m[0];
    if (t.startsWith('**') || t.startsWith('__')) spans.push({ text: t.slice(2, -2), bold: true });
    else if (t.startsWith('`')) spans.push({ text: t.slice(1, -1), code: true });
    else spans.push({ text: t.slice(1, -1), italic: true });
    last = m.index + t.length;
  }
  if (last < text.length) spans.push({ text: text.slice(last) });
  return spans;
}

/** The text without inline marks (for sizes and plain exports). */
export function plainInline(text: string): string {
  return parseInline(text).map((s) => s.text).join('');
}
