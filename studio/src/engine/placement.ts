/**
 * Incremental placement: puts new nodes next to the nodes they connect to and
 * never moves existing nodes, except for one predictable case: inserting a
 * node between two adjacent nodes shifts everything after them by one column
 * (or row) to make room. A full layout only happens on request (layout.ts).
 */
import {
  GROUP_PADDING, center, crossOf, findGroup, fromMainCross, groupAndDescendants,
  groupBounds, inflate, intersects, isInGroup, mainOf, sceneBounds, union,
} from './scene';
import type { DNode, Direction, Rect, Scene } from './types';

export type Side = 'right' | 'left' | 'above' | 'below';

export interface PlacementHint {
  near?: string;
  side?: Side;
}

/** Center-to-center distance between neighbouring nodes along / across the flow. */
export function steps(dir: Direction): { main: number; cross: number } {
  return dir === 'LR' ? { main: 304, cross: 128 } : { main: 168, cross: 264 };
}

const NODE_MARGIN = 28;
const GRID = 8;

const snap = (v: number) => Math.round(v / GRID) * GRID;

interface Ctx {
  scene: Scene;
  placed: Set<string>;
  moved: Set<string>;
}

function placedNodes(ctx: Ctx): DNode[] {
  return ctx.scene.nodes.filter((n) => ctx.placed.has(n.id));
}

/** Group bounds counting only nodes that already have a position. */
function placedGroupBounds(ctx: Ctx): Map<string, Rect> {
  return groupBounds({ ...ctx.scene, nodes: placedNodes(ctx) });
}

/** Ids of the group and its ancestors. */
export function groupChain(scene: Scene, groupId: string | undefined): string[] {
  const chain: string[] = [];
  const seen = new Set<string>();
  let g = groupId != null ? findGroup(scene, groupId) : undefined;
  while (g != null && !seen.has(g.id)) {
    seen.add(g.id);
    chain.push(g.id);
    g = g.parent != null ? findGroup(scene, g.parent) : undefined;
  }
  return chain;
}

/** True if the node can be put at rect without overlapping anything. */
function fits(ctx: Ctx, node: DNode, rect: Rect, bounds: Map<string, Rect>): boolean {
  const scene = ctx.scene;
  for (const other of placedNodes(ctx)) {
    if (other.id !== node.id && intersects(rect, other, NODE_MARGIN)) {
      return false;
    }
  }
  const chain = new Set(groupChain(scene, node.group));
  // Must not land inside a group it does not belong to
  for (const [gid, b] of bounds) {
    if (!chain.has(gid) && intersects(rect, b, 12)) {
      return false;
    }
  }
  // Its own groups grow to enclose it and must not swallow other elements
  for (const gid of chain) {
    const grown = union(bounds.get(gid) ?? null, inflate(rect, GROUP_PADDING));
    const members = groupAndDescendants(scene, gid);
    for (const other of placedNodes(ctx)) {
      if (other.id !== node.id && !(other.group != null && members.has(other.group)) && intersects(grown, other, 4)) {
        return false;
      }
    }
    for (const [ogid, ob] of bounds) {
      // Groups that are neither nested in it nor enclosing it
      if (!members.has(ogid) && !chain.has(ogid) && intersects(grown, ob, 4)) {
        return false;
      }
    }
  }
  return true;
}

function rectAt(node: DNode, c: { x: number; y: number }): Rect {
  return { x: snap(c.x - node.w / 2), y: snap(c.y - node.h / 2), w: node.w, h: node.h };
}

/** Searches the closest free slot around the desired center. */
function findSlot(ctx: Ctx, node: DNode, desired: { x: number; y: number }, side?: Side): Rect {
  const dir = ctx.scene.direction;
  const st = steps(dir);
  const bounds = placedGroupBounds(ctx);
  const crossOffsets = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  const base = { main: mainOf(desired, dir), cross: crossOf(desired, dir) };

  // A side hint searches in that screen direction first
  if (side != null) {
    const sx = side === 'right' ? 1 : side === 'left' ? -1 : 0;
    const sy = side === 'below' ? 1 : side === 'above' ? -1 : 0;
    const stepX = dir === 'LR' ? st.main : st.cross;
    const stepY = dir === 'LR' ? st.cross : st.main;
    for (let k = 0; k < 6; k++) {
      for (const o of [0, 1, -1, 2, -2]) {
        const c = {
          x: desired.x + sx * k * stepX + (sx === 0 ? o * stepX : 0),
          y: desired.y + sy * k * stepY + (sy === 0 ? o * stepY : 0),
        };
        const r = rectAt(node, c);
        if (fits(ctx, node, r, bounds)) {
          return r;
        }
      }
    }
  }

  for (let m = 0; m <= 4; m++) {
    for (const o of crossOffsets) {
      const r = rectAt(node, fromMainCross(base.main + m * st.main, base.cross + o * st.cross, dir));
      if (fits(ctx, node, r, bounds)) {
        return r;
      }
    }
  }
  // Last resort: after everything else
  const all = sceneBounds({ ...ctx.scene, nodes: placedNodes(ctx) });
  const c = all == null ? desired : dir === 'LR'
    ? { x: all.x + all.w / 2, y: all.y + all.h + st.cross }
    : { x: all.x + all.w + st.cross / 2 + node.w / 2, y: all.y + all.h / 2 };
  return rectAt(node, c);
}

/** Moves every placed node at or after the given main position one step along the flow. */
function makeRoom(ctx: Ctx, fromMain: number) {
  const dir = ctx.scene.direction;
  const st = steps(dir);
  for (const n of placedNodes(ctx)) {
    if (mainOf(center(n), dir) >= fromMain - 1) {
      if (dir === 'LR') {
        n.x += st.main;
      } else {
        n.y += st.main;
      }
      ctx.moved.add(n.id);
    }
  }
  for (const g of ctx.scene.groups) {
    if (g.box != null && mainOf(center(g.box), dir) >= fromMain - 1) {
      if (dir === 'LR') {
        g.box.x += st.main;
      } else {
        g.box.y += st.main;
      }
    }
  }
}

const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

function placeOne(ctx: Ctx, node: DNode, hint: PlacementHint | undefined) {
  const scene = ctx.scene;
  const dir = scene.direction;
  const st = steps(dir);
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));
  const isPlaced = (id: string) => ctx.placed.has(id) && id !== node.id;

  const preds = scene.edges.filter((e) => e.to === node.id && isPlaced(e.from)).map((e) => byId.get(e.from)!);
  const succs = scene.edges.filter((e) => e.from === node.id && isPlaced(e.to)).map((e) => byId.get(e.to)!);

  // Find placed nodes reachable through unplaced nodes (e.g. A -> X -> Y -> B)
  const findTransitive = (forward: boolean): DNode[] => {
    const found: DNode[] = [];
    const seen = new Set<string>([node.id]);
    const queue = [node.id];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const e of scene.edges) {
        const next = forward ? (e.from === cur ? e.to : undefined) : (e.to === cur ? e.from : undefined);
        if (next == null || seen.has(next)) continue;
        seen.add(next);
        if (isPlaced(next)) {
          const n = byId.get(next);
          if (n != null) found.push(n);
        } else {
          queue.push(next);
        }
      }
    }
    return found;
  };
  const effPreds = preds.length > 0 ? preds : succs.length > 0 ? findTransitive(false) : [];
  const effSuccs = succs.length > 0 ? succs : preds.length > 0 ? findTransitive(true) : [];
  let desired: { x: number; y: number } | null = null;

  const near = hint?.near != null && isPlaced(hint.near) ? byId.get(hint.near) : undefined;

  if (near != null) {
    const c = center(near);
    const side = hint?.side;
    desired = side == null
      ? fromMainCross(mainOf(c, dir) + st.main, crossOf(c, dir), dir)
      : {
        x: c.x + (side === 'right' ? 1 : side === 'left' ? -1 : 0) * (dir === 'LR' ? st.main : st.cross),
        y: c.y + (side === 'below' ? 1 : side === 'above' ? -1 : 0) * (dir === 'LR' ? st.cross : st.main),
      };
  } else if (effPreds.length > 0 && effSuccs.length > 0) {
    const pMain = Math.max(...effPreds.map((p) => mainOf(center(p), dir)));
    const sMain = Math.min(...effSuccs.map((s) => mainOf(center(s), dir)));
    const cross = avg([...effPreds, ...effSuccs].map((n) => crossOf(center(n), dir)));
    if (preds.length > 0 && succs.length > 0 && sMain - pMain >= st.main * 1.8) {
      desired = fromMainCross((pMain + sMain) / 2, cross, dir);
    } else if (sMain > pMain) {
      // Adjacent (or chain insertion): shift what comes after to make room
      if (sMain - pMain < st.main * 1.8) {
        makeRoom(ctx, sMain);
      }
      desired = fromMainCross(
        preds.length > 0 ? pMain + st.main : sMain - st.main,
        cross,
        dir,
      );
    } else {
      desired = fromMainCross(pMain + st.main, cross, dir);
    }
  } else if (preds.length > 0) {
    desired = fromMainCross(
      Math.max(...preds.map((p) => mainOf(center(p), dir))) + st.main,
      avg(preds.map((p) => crossOf(center(p), dir))),
      dir,
    );
  } else if (succs.length > 0) {
    desired = fromMainCross(
      Math.min(...succs.map((s) => mainOf(center(s), dir))) - st.main,
      avg(succs.map((s) => crossOf(center(s), dir))),
      dir,
    );
  } else if (node.group != null) {
    const members = placedNodes(ctx).filter((n) => n.id !== node.id && isInGroup(scene, n, node.group!));
    if (members.length > 0) {
      desired = fromMainCross(
        avg(members.map((m) => mainOf(center(m), dir))),
        Math.max(...members.map((m) => crossOf(center(m), dir))) + st.cross,
        dir,
      );
    } else {
      const box = findGroup(scene, node.group)?.box;
      if (box != null) {
        desired = center(box);
      }
    }
  }

  if (desired == null) {
    const all = sceneBounds({ ...scene, nodes: placedNodes(ctx) });
    desired = all == null ? { x: 0, y: 0 } : fromMainCross(
      mainOf({ x: all.x + all.w, y: all.y + all.h }, dir) + st.main / 2,
      crossOf({ x: all.x, y: all.y }, dir) + crossOf({ x: node.w, y: node.h }, dir) / 2,
      dir,
    );
  }

  const r = findSlot(ctx, node, desired, hint?.side);
  node.x = r.x;
  node.y = r.y;
  ctx.placed.add(node.id);

  // A group that was waiting for content now takes its bounds from the members
  for (const gid of groupChain(scene, node.group)) {
    const g = findGroup(scene, gid);
    if (g != null) {
      g.box = undefined;
    }
  }
}

/**
 * Places the given nodes (which have no position yet) and returns the ids of
 * existing nodes that had to move to make room.
 */
export function placeNodes(scene: Scene, ids: string[], hints: Map<string, PlacementHint> = new Map()): string[] {
  const pending = new Set(ids);
  const ctx: Ctx = {
    scene,
    placed: new Set(scene.nodes.filter((n) => !pending.has(n.id)).map((n) => n.id)),
    moved: new Set(),
  };

  while (pending.size > 0) {
    // Next: the pending node with the most placed neighbours, in request order
    let best: DNode | null = null;
    let bestScore = -1;
    for (const id of ids) {
      if (!pending.has(id)) continue;
      const node = scene.nodes.find((n) => n.id === id)!;
      const hint = hints.get(id);
      let score = hint?.near != null && ctx.placed.has(hint.near) ? 100 : 0;
      for (const e of scene.edges) {
        if ((e.from === id && ctx.placed.has(e.to)) || (e.to === id && ctx.placed.has(e.from))) {
          score++;
        }
      }
      if (score > bestScore) {
        best = node;
        bestScore = score;
      }
    }
    pending.delete(best!.id);
    placeOne(ctx, best!, hints.get(best!.id));
  }

  for (const id of ids) {
    ctx.moved.delete(id);
  }
  return [...ctx.moved];
}

/** Places a new group without members where it does not cover anything. */
export function placeEmptyGroup(scene: Scene, groupId: string) {
  const g = findGroup(scene, groupId);
  if (g == null) return;
  const parentBounds = g.parent != null ? groupBounds(scene).get(g.parent) : undefined;
  const all = parentBounds ?? sceneBounds(scene);
  const dir = scene.direction;
  const w = 312, h = 168;
  let x = all == null ? 0 : dir === 'LR' ? all.x : all.x + all.w + 64;
  let y = all == null ? 0 : dir === 'LR' ? all.y + all.h + 64 : all.y;
  const bounds = groupBounds(scene);
  const chain = new Set(groupChain(scene, g.id));
  for (let i = 0; i < 40; i++) {
    const r = { x: snap(x), y: snap(y), w, h };
    const blocked = scene.nodes.some((n) => intersects(r, n, 24)) ||
      [...bounds].some(([id, b]) => !chain.has(id) && intersects(r, b, 24));
    if (!blocked) {
      g.box = r;
      return;
    }
    if (dir === 'LR') y += h / 2; else x += w / 2;
  }
  g.box = { x: snap(x), y: snap(y), w, h };
}

/**
 * Groups grow to enclose their members. If a group now covers elements that
 * are not in it (e.g. after moving a node into it, or grouping scattered
 * nodes), its members are placed again around its most central member.
 * Returns the ids of the nodes that moved.
 */
export function repairGroups(scene: Scene, groupIds: string[], regroupedIds?: ReadonlySet<string>): string[] {
  const moved: string[] = [];
  const coversForeign = (gid: string): boolean => {
    const bounds = groupBounds(scene);
    const b = bounds.get(gid);
    if (b == null) return false;
    const family = groupAndDescendants(scene, gid);
    const chain = new Set(groupChain(scene, gid));
    return scene.nodes.some((n) => !(n.group != null && family.has(n.group)) && intersects(b, n, 0)) ||
      [...bounds].some(([id, ob]) => !family.has(id) && !chain.has(id) && intersects(b, ob, 0));
  };
  for (const gid of groupIds) {
    if (findGroup(scene, gid) == null) continue;
    if (!coversForeign(gid)) continue;

    const family = groupAndDescendants(scene, gid);
    const members = scene.nodes.filter((n) => n.group != null && family.has(n.group));
    if (members.length < 2) {
      // A single member: move it next to nothing in particular, out of the way
      const ids = members.map((m) => m.id);
      placeNodes(scene, ids);
      moved.push(...ids);
      continue;
    }
    // Prefer moving only the newly regrouped nodes if existing members already sit cleanly
    if (regroupedIds != null && regroupedIds.size > 0) {
      const fresh = members.filter((m) => regroupedIds.has(m.id)).map((m) => m.id);
      if (fresh.length > 0 && fresh.length < members.length) {
        const extra = placeNodes(scene, fresh);
        moved.push(...fresh, ...extra);
        if (!coversForeign(gid)) continue;
      }
    }
    const c = { x: avg(members.map((m) => center(m).x)), y: avg(members.map((m) => center(m).y)) };
    let anchor = members[0];
    let best = Infinity;
    for (const m of members) {
      const mc = center(m);
      const d = Math.hypot(mc.x - c.x, mc.y - c.y);
      if (d < best) {
        best = d;
        anchor = m;
      }
    }
    const ids = members.filter((m) => m.id !== anchor.id).map((m) => m.id);
    const extra = placeNodes(scene, ids);
    moved.push(...ids, ...extra);
  }
  return [...new Set(moved)];
}
