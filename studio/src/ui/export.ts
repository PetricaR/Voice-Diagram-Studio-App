/**
 * Exports: a .drawio file with one draw.io page per studio page (so diagrams
 * can be fine-tuned in draw.io, with their titles), followed by a page with
 * the documentation of each diagram that has one, and the pages as JSON
 * (which the app can open again).
 */
import { TonalPalette, hexFromArgb } from '@material/material-color-utilities';
import { chapterInfo } from '../engine/book';
import { blockSize, tableSize, BLOCK_METRICS } from '../engine/blocks';
import { normalizeText, parseInline, parseMarkdown } from '../engine/markdown';
import { findGroup, groupBounds, groupDepth, nodeSize, sceneBounds } from '../engine/scene';
import {
  BLOCK_KINDS, COLORS, DIAGRAM_TYPES, DIRECTIONS, GROUP_KINDS, NODE_KINDS,
  type ColorName, type DBlock, type DNode, type NodeKind, type Scene,
} from '../engine/types';
import { kindColor } from './theme';

const HUES: Record<ColorName, [number, number]> = {
  blue: [262, 40], green: [145, 36], orange: [55, 48], red: [25, 52], purple: [300, 36],
  teal: [190, 32], pink: [350, 40], yellow: [90, 44], gray: [262, 6],
};

function tones(c: ColorName) {
  const p = TonalPalette.fromHueAndChroma(...HUES[c]);
  return { fill: hexFromArgb(p.tone(94)), stroke: hexFromArgb(p.tone(45)), text: hexFromArgb(p.tone(20)), tint: hexFromArgb(p.tone(98)) };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function nodeShape(n: DNode): string {
  switch (n.kind) {
    case 'database': case 'cache':
      return 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=10;';
    case 'decision':
      return 'rhombus;';
    case 'start': case 'end':
      return 'rounded=1;arcSize=50;';
    case 'io':
      return 'shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;size=16;';
    case 'document':
      return 'shape=document;boundedLbl=1;size=0.2;';
    case 'subprocess':
      return 'shape=process;backgroundOutline=1;size=0.08;';
    case 'queue':
      return 'shape=mxgraph.flowchart.direct_data;';
    case 'note':
      return 'shape=note;size=14;';
    case 'external':
      return 'rounded=1;arcSize=12;dashed=1;';
    case 'user':
      return 'rounded=1;arcSize=50;';
    default:
      return 'rounded=1;arcSize=12;';
  }
}

/** Where the title sits: above the top left corner of the diagram. */
export function titleOrigin(scene: Scene): { x: number; y: number } {
  const b = sceneBounds(scene);
  return b == null ? { x: 0, y: -72 } : { x: b.x, y: b.y - (scene.subtitle ? 88 : 64) };
}

function inlineHtml(text: string): string {
  return parseInline(text).map((s) => {
    const t = esc(s.text);
    return s.bold ? `<b>${t}</b>` : s.italic ? `<i>${t}</i>` : s.code ? `<code>${t}</code>` : t;
  }).join('');
}

function tableHtml(columns: string[], rows: string[][], widths: number[]): string {
  const cell = 'border:1px solid #c4c7c5;padding:4px 8px;text-align:left;vertical-align:top;';
  return '<table style="border-collapse:collapse;width:100%;font-size:12px;">' +
    `<tr>${columns.map((c, i) => `<th style="${cell}background:#eef0f4;width:${widths[i] ?? 80}px;">${inlineHtml(c)}</th>`).join('')}</tr>` +
    rows.map((r) => `<tr>${r.map((c) => `<td style="${cell}">${inlineHtml(c)}</td>`).join('')}</tr>`).join('') +
    '</table>';
}

/** Markdown of a text block as the HTML of a draw.io label. */
export function markdownToHtml(text: string, width: number): string {
  return parseMarkdown(text).map((b) => {
    switch (b.type) {
      case 'heading': {
        const size = b.level === 1 ? 18 : b.level === 2 ? 15 : 13;
        return `<div style="font-size:${size}px;font-weight:bold;margin:8px 0 2px;">${inlineHtml(b.text)}</div>`;
      }
      case 'paragraph':
        return `<div style="margin:0 0 6px;">${inlineHtml(b.text)}</div>`;
      case 'quote':
        return `<div style="margin:0 0 6px;padding-left:8px;border-left:3px solid #c4c7c5;font-style:italic;">${inlineHtml(b.text)}</div>`;
      case 'code':
        return `<pre style="margin:0 0 6px;font-size:11px;">${esc(b.text)}</pre>`;
      case 'rule':
        return '<hr>';
      case 'list': {
        const tag = b.ordered ? 'ol' : 'ul';
        return `<${tag} style="margin:0 0 6px;padding-left:18px;">` +
          b.items.map((it) => `<li style="margin-left:${it.depth * 14}px;">${inlineHtml(it.text)}</li>`).join('') + `</${tag}>`;
      }
      case 'table':
        return tableHtml(b.header, b.rows, tableSize(b.header, b.rows, width).colWidths);
    }
  }).join('');
}

function blockCell(b: DBlock): string {
  const t = tones(b.color ?? 'gray');
  const title = b.title ? `<div style="font-size:14px;font-weight:bold;margin-bottom:6px;">${inlineHtml(b.title)}</div>` : '';
  const inner = b.w - 2 * BLOCK_METRICS.padX;
  const body = b.kind === 'table'
    ? tableHtml(b.columns ?? [], b.rows ?? [], tableSize(b.columns ?? [], b.rows ?? [], BLOCK_METRICS.maxTableWidth).colWidths)
    : markdownToHtml(b.text ?? '', inner);
  return `<mxCell id="b_${esc(b.id)}" value="${esc(title + body)}" style="rounded=1;arcSize=3;whiteSpace=wrap;html=1;` +
    `align=left;verticalAlign=top;spacingLeft=14;spacingRight=14;spacingTop=10;fontSize=12;overflow=hidden;` +
    `fillColor=${b.color ? t.tint : '#ffffff'};strokeColor=${b.color ? t.stroke : '#c4c7c5'};fontColor=#1f1f1f;" vertex="1" parent="1">` +
    `<mxGeometry x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" as="geometry"/></mxCell>`;
}

/** One draw.io page (a <diagram> element). */
function diagramXml(scene: Scene, index: number, name: string): string {
  const cells: string[] = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  if (scene.title) {
    const o = titleOrigin(scene);
    const html = `<b style="font-size:24px;">${esc(scene.title)}</b>` +
      (scene.subtitle ? `<br><span style="font-size:14px;color:#5f6368;">${esc(scene.subtitle)}</span>` : '');
    cells.push(`<mxCell id="title" value="${esc(html)}" style="text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;` +
      `fontSize=24;fontColor=#1f1f1f;" vertex="1" parent="1"><mxGeometry x="${o.x}" y="${o.y}" ` +
      `width="${Math.max(320, scene.title.length * 14)}" height="${scene.subtitle ? 64 : 40}" as="geometry"/></mxCell>`);
  }
  const bounds = groupBounds(scene);
  const origin = (gid: string | undefined) => {
    const b = gid != null && findGroup(scene, gid) != null ? bounds.get(gid) : undefined;
    return b != null ? { x: b.x, y: b.y, parent: 'g_' + gid } : { x: 0, y: 0, parent: '1' };
  };
  const groups = [...scene.groups].sort((a, b) => groupDepth(scene, a) - groupDepth(scene, b));
  for (const g of groups) {
    const b = bounds.get(g.id);
    if (b == null) continue;
    const o = origin(g.parent);
    const t = tones(g.color ?? 'gray');
    const dashed = g.kind === 'subnet' || g.kind === 'boundary' || g.kind === 'zone' || g.kind === 'lane'
      ? 'dashed=1;dashPattern=6 4;' : '';
    cells.push(`<mxCell id="g_${esc(g.id)}" value="${esc(esc(g.label))}" style="rounded=1;arcSize=4;container=1;collapsible=0;` +
      `whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=12;spacingTop=4;fontStyle=1;fontSize=12;` +
      `fillColor=${t.tint};strokeColor=${t.stroke};fontColor=${t.text};${dashed}" vertex="1" parent="${o.parent}">` +
      `<mxGeometry x="${b.x - o.x}" y="${b.y - o.y}" width="${b.w}" height="${b.h}" as="geometry"/></mxCell>`);
  }
  for (const n of scene.nodes) {
    const o = origin(n.group);
    const t = tones(n.color ?? kindColor(n.kind));
    // html=1: the value is HTML, written into an XML attribute
    const caption = [n.tech, n.description].filter(Boolean).map((s) => esc(s!)).join('<br>');
    const html = `<b>${esc(n.label)}</b>` + (caption ? `<br><span style="font-size: 11px">${caption}</span>` : '');
    cells.push(`<mxCell id="n_${esc(n.id)}" value="${esc(html)}" style="${nodeShape(n)}whiteSpace=wrap;html=1;` +
      `fillColor=${t.fill};strokeColor=${t.stroke};fontColor=${t.text};fontSize=13;" vertex="1" parent="${o.parent}">` +
      `<mxGeometry x="${n.x - o.x}" y="${n.y - o.y}" width="${n.w}" height="${n.h}" as="geometry"/></mxCell>`);
  }
  for (const e of scene.edges) {
    const arrows = e.arrow === 'none' ? 'endArrow=none;' : e.arrow === 'both'
      ? 'startArrow=block;startFill=1;endArrow=block;endFill=1;' : 'endArrow=block;endFill=1;';
    const dash = e.style === 'dashed' ? 'dashed=1;' : e.style === 'dotted' ? 'dashed=1;dashPattern=1 3;' : '';
    cells.push(`<mxCell id="e_${esc(e.id)}" value="${esc(esc(e.label ?? ''))}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;` +
      `html=1;strokeColor=#5f6368;fontSize=11;labelBackgroundColor=#ffffff;${arrows}${dash}" edge="1" parent="1" ` +
      `source="n_${esc(e.from)}" target="n_${esc(e.to)}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  }
  return `<diagram name="${esc(name)}" id="studio-${index + 1}">` +
    `<mxGraphModel grid="1" gridSize="8" guides="1" connect="1" arrows="1" page="0" math="0" shadow="0"><root>` +
    cells.join('') + '</root></mxGraphModel></diagram>';
}

/** The documentation of a page as a draw.io page: its chapters, numbered, one below the other. */
function documentationXml(scene: Scene, index: number, name: string): string {
  const cells: string[] = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  const head = `<b style="font-size:24px;">${esc(scene.title || 'Documentation')}</b>` +
    '<br><span style="font-size:14px;color:#5f6368;">Documentation</span>';
  cells.push(`<mxCell id="title" value="${esc(head)}" style="text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;` +
    `fontSize=24;fontColor=#1f1f1f;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="640" height="64" as="geometry"/></mxCell>`);
  let y = 88;
  scene.blocks.forEach((b, i) => {
    const info = chapterInfo(b, i + 1);
    const chapter = { ...b, title: `${info.number}. ${info.title}`, x: 0, y };
    if (info.skipFirstHeading && chapter.text != null) {
      const lines = normalizeText(chapter.text).split('\n');
      chapter.text = lines.slice(lines.findIndex((l) => l.trim() !== '') + 1).join('\n');
    }
    const size = blockSize(chapter);
    chapter.w = size.w;
    chapter.h = size.h;
    cells.push(blockCell(chapter));
    y += size.h + 24;
  });
  return `<diagram name="${esc(name)}" id="studio-doc-${index + 1}">` +
    `<mxGraphModel grid="1" gridSize="8" guides="1" connect="1" arrows="1" page="0" math="0" shadow="0"><root>` +
    cells.join('') + '</root></mxGraphModel></diagram>';
}

/** A .drawio file with one page per scene. */
export function toDrawio(scenes: Scene | Scene[]): string {
  const list = Array.isArray(scenes) ? scenes : [scenes];
  return '<mxfile host="Voice Diagram Studio">' +
    list.map((s, i) => {
      const name = s.title || `Page ${i + 1}`;
      return diagramXml(s, i, name) + (s.blocks.length > 0 ? documentationXml(s, i, `${name} · Documentation`) : '');
    }).join('') + '</mxfile>';
}

export function toJson(scene: Scene): string {
  return JSON.stringify({ format: 'voice-diagram-studio', version: 1, scene }, null, 2);
}

/** All pages as one studio file. */
export function pagesToJson(scenes: Scene[]): string {
  return JSON.stringify({ format: 'voice-diagram-studio', version: 2, pages: scenes }, null, 2);
}

const cellText = (v: unknown) => (v == null ? '' : String(v));

function normalizeBlock(raw: any): DBlock | null {
  if (raw == null || typeof raw.id !== 'string' || !BLOCK_KINDS.includes(raw.kind)) return null;
  const b: DBlock = { id: raw.id, kind: raw.kind, x: 0, y: 0, w: 0, h: 0 };
  if (typeof raw.title === 'string' && raw.title) b.title = raw.title;
  if (COLORS.includes(raw.color)) b.color = raw.color;
  if (b.kind === 'text') {
    b.text = typeof raw.text === 'string' ? raw.text : '';
  } else {
    b.columns = Array.isArray(raw.columns) ? raw.columns.map(cellText) : [];
    b.rows = Array.isArray(raw.rows) ? raw.rows.filter(Array.isArray).map((r: unknown[]) => r.map(cellText)) : [];
    if (b.columns!.length === 0) return null;
  }
  const size = blockSize(b);
  b.x = Number.isFinite(raw.x) ? raw.x : 0;
  b.y = Number.isFinite(raw.y) ? raw.y : 0;
  b.w = size.w;
  b.h = size.h;
  return b;
}

/** Checks and completes a scene read from a file or from storage, or null if it is not one. */
export function normalizeScene(s: any): Scene | null {
  if (!Array.isArray(s?.nodes) || !Array.isArray(s?.edges)) return null;
  const nodes: DNode[] = [];
  for (const raw of s.nodes) {
    if (raw == null || typeof raw.id !== 'string' || typeof raw.label !== 'string') return null;
    const kind: NodeKind = NODE_KINDS.includes(raw.kind) ? raw.kind : 'service';
    const def = nodeSize(kind);
    nodes.push({
      ...raw,
      kind,
      x: Number.isFinite(raw.x) ? raw.x : 0,
      y: Number.isFinite(raw.y) ? raw.y : 0,
      w: Number.isFinite(raw.w) && raw.w > 0 ? raw.w : def.w,
      h: Number.isFinite(raw.h) && raw.h > 0 ? raw.h : def.h,
    });
  }
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = s.edges.filter((e: any) =>
    e != null && typeof e.id === 'string' && nodeIds.has(e.from) && nodeIds.has(e.to));
  const groups = (Array.isArray(s.groups) ? s.groups : [])
    .filter((g: any) => g != null && typeof g.id === 'string' && typeof g.label === 'string')
    .map((g: any) => ({ ...g, kind: GROUP_KINDS.includes(g.kind) ? g.kind : 'generic' }));
  const blocks = (Array.isArray(s.blocks) ? s.blocks : []).map(normalizeBlock).filter((b: DBlock | null): b is DBlock => b != null);
  const scene: Scene = {
    version: typeof s.version === 'number' ? s.version : 0,
    type: DIAGRAM_TYPES.includes(s.type) ? s.type : 'architecture',
    direction: DIRECTIONS.includes(s.direction) ? s.direction : 'LR',
    title: typeof s.title === 'string' ? s.title : '',
    nodes,
    edges,
    groups,
    blocks,
  };
  if (typeof s.subtitle === 'string' && s.subtitle) scene.subtitle = s.subtitle;
  return scene;
}

/** Reads a scene saved by toJson, or null if the text is not one. */
export function fromJson(text: string): Scene | null {
  try {
    const data = JSON.parse(text);
    return normalizeScene(data?.scene ?? data);
  } catch {
    return null;
  }
}

/** Reads the pages of a studio file (one page for files with a single diagram), or null. */
export function pagesFromJson(text: string): Scene[] | null {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data?.pages)) {
      const pages = data.pages.map(normalizeScene).filter((s: Scene | null): s is Scene => s != null);
      return pages.length > 0 ? pages : null;
    }
    const one = normalizeScene(data?.scene ?? data);
    return one != null ? [one] : null;
  } catch {
    return null;
  }
}

export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileName(scene: Scene, ext: string): string {
  const base = (scene.title || 'diagram').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${base || 'diagram'}.${ext}`;
}
