/**
 * PNG and SVG pictures of the diagram, as the canvas draws it (icons, groups,
 * routed edges, the title), cropped to the diagram with a margin and without the
 * dot grid, the selection, handles or change highlights. The canvas that is on
 * screen registers itself as the exporter.
 */
import { toPng, toSvg } from 'html-to-image';
import type { Rect } from '../../engine/types';

export type ImageFormat = 'png' | 'svg';

/** A data: URL of the picture. */
type Exporter = (format: ImageFormat) => Promise<string>;

let current: Exporter | null = null;

export function registerImageExporter(exporter: Exporter): () => void {
  current = exporter;
  return () => {
    if (current === exporter) current = null;
  };
}

export function exportDiagramImage(format: ImageFormat): Promise<string> {
  if (current == null) return Promise.reject(new Error('Open a page with a diagram to export it as a picture.'));
  return current(format);
}

let fontCss: Promise<string> | null = null;

/**
 * Roboto for the picture: only the Latin and Latin Extended files (Romanian
 * included) of the weights the canvas uses, as data: URLs. Left to itself,
 * html-to-image would embed every subset (cyrillic, greek, math, …) in every
 * picture, about 1.5 MB of fonts.
 */
function pictureFontCss(): Promise<string> {
  fontCss ??= (async () => {
    const rules: CSSFontFaceRule[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let list: CSSRuleList;
      try {
        list = sheet.cssRules;
      } catch {
        continue; // another origin's stylesheet (Google sign-in)
      }
      for (const rule of Array.from(list)) if (rule instanceof CSSFontFaceRule) rules.push(rule);
    }
    // "A" is in the Latin file, "ș" in Latin Extended
    const wanted = rules.filter((r) => /roboto/i.test(r.style.getPropertyValue('font-family')) &&
      (covers(r.style.getPropertyValue('unicode-range'), 0x41) || covers(r.style.getPropertyValue('unicode-range'), 0x219)));
    const faces = await Promise.all(wanted.map(async (r) => {
      const src = r.style.getPropertyValue('src').match(/url\(\s*["']?([^"')]+\.woff2[^"')]*)["']?\s*\)/);
      if (src == null) return '';
      const href = new URL(src[1], r.parentStyleSheet?.href ?? location.href).href;
      const bytes = new Uint8Array(await (await fetch(href)).arrayBuffer());
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const prop = (name: string) => r.style.getPropertyValue(name).trim();
      return `@font-face{font-family:${prop('font-family')};font-style:${prop('font-style') || 'normal'};` +
        `font-weight:${prop('font-weight') || '400'};font-display:block;` +
        `src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');unicode-range:${prop('unicode-range')}}`;
    }));
    return faces.join('\n');
  })().catch(() => {
    fontCss = null;
    return '';
  });
  return fontCss;
}

/** Whether a CSS unicode-range ("U+0-FF, U+131, U+4??") includes `code`. */
function covers(range: string, code: number): boolean {
  return range.split(',').some((part) => {
    const m = part.trim().match(/^U\+([0-9a-f?]+)(?:-([0-9a-f]+))?$/i);
    if (m == null) return false;
    const lo = parseInt(m[1].replace(/\?/g, '0'), 16);
    const hi = m[2] ? parseInt(m[2], 16) : parseInt(m[1].replace(/\?/g, 'f'), 16);
    return code >= lo && code <= hi;
  });
}

/**
 * The style properties copied into the picture. html-to-image copies every
 * computed property of every element by default (about 10 KB each), which made
 * a five-node SVG weigh over a megabyte.
 */
const STYLE_PROPERTIES = [
  // `content` lets ::before / ::after (the provider dot of a node) be drawn
  'content', 'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'box-sizing',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'aspect-ratio',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-clip',
  'color', 'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y', 'box-shadow', 'filter',
  'transform', 'transform-origin', 'translate', 'scale', 'rotate',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'order',
  'align-items', 'align-self', 'align-content', 'justify-content', 'justify-items', 'justify-self',
  'row-gap', 'column-gap', 'grid-template-columns', 'grid-template-rows', 'grid-column-start', 'grid-column-end',
  'grid-row-start', 'grid-row-end', 'grid-auto-flow',
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'font-feature-settings', 'font-variation-settings',
  'line-height', 'letter-spacing', 'word-spacing', 'text-align', 'text-transform', 'text-indent', 'text-overflow',
  'text-decoration-line', 'text-decoration-color', 'text-decoration-style', 'text-shadow', 'vertical-align',
  'white-space', 'white-space-collapse', 'text-wrap-mode', 'text-wrap-style', 'word-break', 'overflow-wrap', 'hyphens',
  '-webkit-line-clamp', '-webkit-box-orient', 'line-clamp',
  'object-fit', 'object-position', 'mix-blend-mode', 'isolation',
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset',
  'stroke-linecap', 'stroke-linejoin', 'marker-start', 'marker-mid', 'marker-end', 'paint-order', 'shape-rendering',
  'text-anchor', 'dominant-baseline',
];

/**
 * html-to-image does not copy the styles of elements inside an <svg> (edges,
 * arrowheads, the outlines of decision and data shapes), so they are written
 * on them as inline styles while the picture is taken.
 */
const SVG_PROPERTIES = [
  'display', 'visibility', 'opacity', 'color', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width',
  'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
  'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
];

function inlineSvgStyles(root: Element): () => void {
  const saved: [Element, string | null][] = [];
  for (const el of Array.from(root.querySelectorAll('svg *'))) {
    const computed = getComputedStyle(el);
    const before = el.getAttribute('style');
    saved.push([el, before]);
    const inline = SVG_PROPERTIES.map((p) => `${p}:${computed.getPropertyValue(p)}`).join(';');
    el.setAttribute('style', before ? `${before};${inline}` : inline);
  }
  return () => {
    for (const [el, before] of saved) {
      if (before == null) el.removeAttribute('style');
      else el.setAttribute('style', before);
    }
  };
}

const MARGIN = 40;
/** Browsers refuse canvases much larger than this on a side. */
const MAX_PIXELS = 8192;

/** Draws the React Flow viewport `viewport` cropped to `bounds` (diagram coordinates). */
export async function captureViewport(viewport: HTMLElement, bounds: Rect, format: ImageFormat): Promise<string> {
  const width = Math.ceil(bounds.w + MARGIN * 2);
  const height = Math.ceil(bounds.h + MARGIN * 2);
  const background = getComputedStyle(document.documentElement).getPropertyValue('--md-surface').trim() || '#ffffff';
  // The arrowheads are defined once outside the canvas; the picture needs its own copy
  const markers = document.querySelector('svg.edge-markers')?.cloneNode(true) as SVGSVGElement | undefined;
  if (markers) viewport.append(markers);
  const restoreSvg = inlineSvgStyles(viewport);
  try {
    const options = {
      fontEmbedCSS: await pictureFontCss(),
      includeStyleProperties: STYLE_PROPERTIES,
      backgroundColor: background,
      width,
      height,
      pixelRatio: format === 'png' ? Math.max(1, Math.min(2, MAX_PIXELS / Math.max(width, height))) : 1,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${MARGIN - bounds.x}px, ${MARGIN - bounds.y}px) scale(1)`,
      },
      filter: (node: HTMLElement) => !node.classList?.contains('react-flow__handle'),
    };
    return format === 'png' ? await toPng(viewport, options) : await toSvg(viewport, options);
  } finally {
    restoreSvg();
    markers?.remove();
  }
}

/** The bytes of a base64 data: URL (fetching it would be blocked by the Content-Security-Policy). */
export function dataUrlToBlob(url: string): Blob {
  const comma = url.indexOf(',');
  const meta = url.slice(5, comma);
  const type = meta.split(';')[0] || 'application/octet-stream';
  const data = url.slice(comma + 1);
  if (!meta.endsWith(';base64')) return new Blob([decodeURIComponent(data)], { type });
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}
