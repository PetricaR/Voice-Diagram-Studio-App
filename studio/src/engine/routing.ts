/**
 * Orthogonal edge routing around nodes. For each connection a small set of
 * candidate routes is generated (every pair of sides, with the bend near the
 * source, the target or halfway, plus a straight line when the nodes face
 * each other) and the one that crosses no other node with the fewest bends
 * and the shortest length wins. Deterministic and fast enough to run on
 * every animation frame.
 */
import type { Rect } from './types';

export interface Pt {
  x: number;
  y: number;
}

export interface Route {
  points: Pt[];
  /** Where the label goes: the middle of the longest segment. */
  label: Pt;
}

type Side = 'top' | 'right' | 'bottom' | 'left';

const SIDES: Side[] = ['right', 'left', 'bottom', 'top'];
const DIR: Record<Side, Pt> = { top: { x: 0, y: -1 }, right: { x: 1, y: 0 }, bottom: { x: 0, y: 1 }, left: { x: -1, y: 0 } };
/** Length of the straight part leaving and entering a node (kept distinct from GROUP_PADDING=28). */
const STUB = 20;
const MIN_OVERLAP = 20;

function anchor(r: Rect, side: Side, shift: number): Pt {
  switch (side) {
    case 'top': return { x: r.x + r.w / 2 + shift, y: r.y };
    case 'bottom': return { x: r.x + r.w / 2 + shift, y: r.y + r.h };
    case 'left': return { x: r.x, y: r.y + r.h / 2 + shift };
    default: return { x: r.x + r.w, y: r.y + r.h / 2 + shift };
  }
}

function simplify(points: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last != null && Math.abs(last.x - p.x) < 0.5 && Math.abs(last.y - p.y) < 0.5) continue;
    out.push(p);
  }
  // Drop middle points of straight runs
  for (let i = out.length - 2; i > 0; i--) {
    const a = out[i - 1], b = out[i], c = out[i + 1];
    if ((Math.abs(a.x - b.x) < 0.5 && Math.abs(b.x - c.x) < 0.5) || (Math.abs(a.y - b.y) < 0.5 && Math.abs(b.y - c.y) < 0.5)) {
      out.splice(i, 1);
    }
  }
  return out;
}

/** True if the axis-aligned segment passes through the inside of the rect. */
function crosses(a: Pt, b: Pt, r: Rect, pad: number): boolean {
  const x0 = r.x - pad, x1 = r.x + r.w + pad, y0 = r.y - pad, y1 = r.y + r.h + pad;
  if (Math.abs(a.y - b.y) < 0.5) {
    const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
    return a.y > y0 && a.y < y1 && hi > x0 && lo < x1;
  }
  const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
  return a.x > x0 && a.x < x1 && hi > y0 && lo < y1;
}

/** True if two axis-aligned segments intersect or run collinearly within `pad`. */
function segmentsConflict(a1: Pt, a2: Pt, b1: Pt, b2: Pt): 'cross' | 'overlap' | null {
  const aHoriz = Math.abs(a1.y - a2.y) < 0.5;
  const bHoriz = Math.abs(b1.y - b2.y) < 0.5;
  if (aHoriz === bHoriz) {
    if (aHoriz) {
      if (Math.abs(a1.y - b1.y) > 8) return null;
      const lo = Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
      const hi = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x));
      return hi - lo > 4 ? 'overlap' : null;
    }
    if (Math.abs(a1.x - b1.x) > 8) return null;
    const lo = Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
    const hi = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y));
    return hi - lo > 4 ? 'overlap' : null;
  }
  const h1 = aHoriz ? a1 : b1, h2 = aHoriz ? a2 : b2;
  const v1 = aHoriz ? b1 : a1, v2 = aHoriz ? b2 : a2;
  const hx0 = Math.min(h1.x, h2.x) + 2, hx1 = Math.max(h1.x, h2.x) - 2;
  const vy0 = Math.min(v1.y, v2.y) + 2, vy1 = Math.max(v1.y, v2.y) - 2;
  return v1.x > hx0 && v1.x < hx1 && h1.y > vy0 && h1.y < vy1 ? 'cross' : null;
}

/** True if segment `[a, b]` runs along one of the 4 border walls or header pill of `g`. */
function hugsGroupWall(a: Pt, b: Pt, g: Rect): boolean {
  if (Math.abs(a.y - b.y) < 0.5) {
    const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
    if (hi <= g.x || lo >= g.x + g.w) return false;
    if (Math.abs(a.y - g.y) < 10 || Math.abs(a.y - (g.y + g.h)) < 10) return true;
    // Avoid crossing through the top-left group header badge band
    if (a.y > g.y && a.y < g.y + 30 && lo < g.x + Math.min(g.w, 220)) return true;
    return false;
  }
  const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
  if (hi <= g.y || lo >= g.y + g.h) return false;
  return Math.abs(a.x - g.x) < 10 || Math.abs(a.x - (g.x + g.w)) < 10;
}

function score(
  points: Pt[],
  s: Rect,
  t: Rect,
  ss: Side,
  ts: Side,
  obstacles: Rect[],
  groups: Rect[],
  routed: Pt[][],
): number {
  let cost = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    cost += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    for (const o of obstacles) {
      if (crosses(a, b, o, 8)) cost += 10_000;
    }
    for (const g of groups) {
      if (hugsGroupWall(a, b, g)) cost += 600;
    }
    for (const prev of routed) {
      for (let j = 0; j < prev.length - 1; j++) {
        const hit = segmentsConflict(a, b, prev[j], prev[j + 1]);
        if (hit === 'overlap') cost += 500;
        else if (hit === 'cross') cost += 220;
      }
    }
    // Must not run back through its own nodes
    if (i > 0 && crosses(a, b, s, -1)) cost += 20_000;
    if (i < points.length - 2 && crosses(a, b, t, -1)) cost += 20_000;
    // No U-turns on itself
    if (i > 0) {
      const p = points[i - 1];
      const d1 = { x: Math.sign(a.x - p.x), y: Math.sign(a.y - p.y) };
      const d2 = { x: Math.sign(b.x - a.x), y: Math.sign(b.y - a.y) };
      if (d1.x === -d2.x && d1.y === -d2.y) cost += 5_000;
    }
  }
  // Flow-direction preference: enter the facing side along the primary displacement
  const sc = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  const tc = { x: t.x + t.w / 2, y: t.y + t.h / 2 };
  if (t.y >= s.y + s.h && Math.abs(tc.x - sc.x) < (t.y - s.y) * 1.6) {
    if (ss === 'top') cost += 140;
    if (ts === 'bottom') cost += 140;
    else if (ts !== 'top') cost += 55;
  } else if (t.x >= s.x + s.w && Math.abs(tc.y - sc.y) < (t.x - s.x) * 1.2) {
    if (ss === 'left') cost += 140;
    if (ts === 'right') cost += 140;
    else if (ts !== 'left' && Math.abs(tc.y - sc.y) < 96) cost += 45;
  }
  return cost + (points.length - 2) * 40;
}

function labelPoint(points: Pt[], groups: Rect[] = [], labels: Pt[] = []): Pt {
  let bestScore = -Infinity;
  let at = { x: points[0].x, y: points[0].y };
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const fracs = len >= 64 ? [0.5, 0.38, 0.62, 0.3, 0.7] : [0.5];
    for (const f of fracs) {
      const p = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      // Prefer longer segments and staying close to the segment midpoint
      let s = len - Math.abs(f - 0.5) * 45;
      for (const g of groups) {
        if (p.x >= g.x - 24 && p.x <= g.x + g.w + 24 && p.y >= g.y - 16 && p.y <= g.y + g.h + 16) {
          const dWall = Math.min(
            Math.abs(p.x - g.x),
            Math.abs(p.x - (g.x + g.w)),
            Math.abs(p.y - g.y),
            Math.abs(p.y - (g.y + g.h)),
          );
          if (dWall < 28) s -= (28 - dWall) * 6;
        }
      }
      for (const other of labels) {
        if (Math.abs(p.x - other.x) < 64 && Math.abs(p.y - other.y) < 24) {
          s -= 180;
        }
      }
      if (s > bestScore) {
        bestScore = s;
        at = p;
      }
    }
  }
  return at;
}

/** Sides already taken by earlier connections, so later ones use free sides. */
export interface SideUsage {
  used: Map<string, number>;
  from: string;
  to: string;
}

interface Candidate {
  points: Pt[];
  ss: Side;
  ts: Side;
}

/**
 * Routes a connection from s to t around the obstacles. `shift` moves the
 * end points along the sides (to separate parallel connections). With
 * `usage`, sides that other connections already use cost extra, and the
 * chosen sides are recorded.
 */
export interface EndOptions {
  /** Shapes such as diamonds can only connect at the middle of their sides. */
  sourceCentered?: boolean;
  targetCentered?: boolean;
  /** Optional explicit port shift along the chosen side. */
  sourceOffset?: number;
  targetOffset?: number;
  /** Group boxes to avoid hugging collinearly or placing labels across. */
  groups?: Rect[];
  /** Previously routed polylines to minimize crossings and overlaps. */
  routed?: Pt[][];
  /** Previously placed label centers to avoid overlapping pills. */
  labels?: Pt[];
}

export function routeEdge(s: Rect, t: Rect, obstacles: Rect[], shift = 0, usage?: SideUsage, ends: EndOptions = {}): Route {
  if (s.x === t.x && s.y === t.y && s.w === t.w && s.h === t.h) {
    const p0 = { x: s.x + s.w * 0.7, y: s.y };
    const p1 = { x: p0.x, y: s.y - 24 };
    const p2 = { x: s.x + s.w + 28, y: s.y - 24 };
    const p3 = { x: s.x + s.w + 28, y: s.y + s.h * 0.4 };
    const p4 = { x: s.x + s.w, y: s.y + s.h * 0.4 };
    const points = [p0, p1, p2, p3, p4];
    return { points, label: { x: p2.x, y: p2.y } };
  }

  const candidates: Candidate[] = [];
  const taken = (node: string, side: Side) => usage?.used.get(`${node}:${side}`) ?? 0;
  // Connections sharing a side are spread along it: 0, +16, −16, +32, …
  const spread = (node: string | undefined, side: Side, centered?: boolean, explicit?: number) => {
    if (centered) return 0;
    if (explicit != null) return explicit;
    const k = node != null ? taken(node, side) : 0;
    return k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * 16;
  };
  const sc = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  const tc = { x: t.x + t.w / 2, y: t.y + t.h / 2 };

  // Straight when the nodes are aligned face-to-face
  const straight = (lo: number, hi: number, sMid: number, tMid: number): number | null => {
    if (Math.abs(sMid - tMid) > 20) return null;
    if (ends.sourceCentered && ends.targetCentered) return Math.abs(sMid - tMid) < 4 ? sMid : null;
    const v = ends.sourceCentered ? sMid : ends.targetCentered ? tMid : (sMid + tMid) / 2 + shift;
    return v >= lo + 12 && v <= hi - 12 ? v : null;
  };
  const oy0 = Math.max(s.y, t.y), oy1 = Math.min(s.y + s.h, t.y + t.h);
  if (oy1 - oy0 >= MIN_OVERLAP) {
    const y = straight(oy0, oy1, sc.y, tc.y);
    if (y != null && t.x > s.x + s.w) candidates.push({ points: [{ x: s.x + s.w, y }, { x: t.x, y }], ss: 'right', ts: 'left' });
    else if (y != null && s.x > t.x + t.w) candidates.push({ points: [{ x: s.x, y }, { x: t.x + t.w, y }], ss: 'left', ts: 'right' });
  }
  const ox0 = Math.max(s.x, t.x), ox1 = Math.min(s.x + s.w, t.x + t.w);
  if (ox1 - ox0 >= MIN_OVERLAP) {
    const x = straight(ox0, ox1, sc.x, tc.x);
    if (x != null && t.y > s.y + s.h) candidates.push({ points: [{ x, y: s.y + s.h }, { x, y: t.y }], ss: 'bottom', ts: 'top' });
    else if (x != null && s.y > t.y + t.h) candidates.push({ points: [{ x, y: s.y }, { x, y: t.y + t.h }], ss: 'top', ts: 'bottom' });
  }

  // Bypass channels around intervening obstacles so collinear rows/columns can route cleanly
  const boxX0 = Math.min(s.x, t.x) - 32, boxX1 = Math.max(s.x + s.w, t.x + t.w) + 32;
  const boxY0 = Math.min(s.y, t.y) - 32, boxY1 = Math.max(s.y + s.h, t.y + t.h) + 32;
  const bypassY: number[] = [];
  const bypassX: number[] = [];
  for (const o of obstacles) {
    if (o.x + o.w > boxX0 && o.x < boxX1 && o.y + o.h > boxY0 && o.y < boxY1) {
      bypassY.push(o.y + o.h + 20, o.y - 20);
      bypassX.push(o.x + o.w + 20, o.x - 20);
    }
  }

  for (const ss of SIDES) {
    for (const ts of SIDES) {
      const p0 = anchor(s, ss, ends.sourceCentered ? 0 : shift + spread(usage?.from, ss, ends.sourceCentered, ends.sourceOffset));
      const p3 = anchor(t, ts, ends.targetCentered ? 0 : shift + spread(usage?.to, ts, ends.targetCentered, ends.targetOffset));
      const p1 = { x: p0.x + DIR[ss].x * STUB, y: p0.y + DIR[ss].y * STUB };
      const p2 = { x: p3.x + DIR[ts].x * STUB, y: p3.y + DIR[ts].y * STUB };
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      candidates.push({ points: [p0, p1, { x: p2.x, y: p1.y }, p2, p3], ss, ts });
      candidates.push({ points: [p0, p1, { x: p1.x, y: p2.y }, p2, p3], ss, ts });
      candidates.push({ points: [p0, p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2, p3], ss, ts });
      candidates.push({ points: [p0, p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2, p3], ss, ts });
      for (const by of bypassY) {
        candidates.push({ points: [p0, p1, { x: p1.x, y: by }, { x: p2.x, y: by }, p2, p3], ss, ts });
      }
      for (const bx of bypassX) {
        candidates.push({ points: [p0, p1, { x: bx, y: p1.y }, { x: bx, y: p2.y }, p2, p3], ss, ts });
      }
    }
  }

  const groups = ends.groups ?? [];
  const routed = ends.routed ?? [];
  let best = candidates[0];
  let bestPoints = simplify(best.points);
  let bestScore = Infinity;
  for (const c of candidates) {
    const points = simplify(c.points);
    let cost = score(points, s, t, c.ss, c.ts, obstacles, groups, routed);
    if (usage != null) cost += 24 * (taken(usage.from, c.ss) + taken(usage.to, c.ts));
    if (cost < bestScore) {
      bestScore = cost;
      best = c;
      bestPoints = points;
    }
  }
  if (usage != null) {
    usage.used.set(`${usage.from}:${best.ss}`, taken(usage.from, best.ss) + 1);
    usage.used.set(`${usage.to}:${best.ts}`, taken(usage.to, best.ts) + 1);
  }
  return { points: bestPoints, label: labelPoint(bestPoints, groups, ends.labels ?? []) };
}

/** SVG path through the points with rounded corners. */
export function roundedPath(points: Pt[], radius = 12): string {
  if (points.length === 0) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i - 1], c = points[i], n = points[i + 1];
    const r = Math.min(radius, Math.hypot(c.x - p.x, c.y - p.y) / 2, Math.hypot(n.x - c.x, n.y - c.y) / 2);
    const a = { x: c.x - Math.sign(c.x - p.x) * r, y: c.y - Math.sign(c.y - p.y) * r };
    const b = { x: c.x + Math.sign(n.x - c.x) * r, y: c.y + Math.sign(n.y - c.y) * r };
    d += ` L${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`;
  }
  const last = points[points.length - 1];
  return d + ` L${last.x},${last.y}`;
}
