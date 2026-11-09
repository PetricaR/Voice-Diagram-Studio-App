import type { DGroup, DNode, Direction, NodeKind, Rect, Scene } from './types';

/** Default node sizes by kind, so that the same kind always looks the same. */
export function nodeSize(kind: NodeKind): { w: number; h: number } {
  switch (kind) {
    case 'process':
    case 'subprocess':
    case 'io':
    case 'document':
      return { w: 184, h: 64 };
    case 'decision':
      return { w: 168, h: 104 };
    case 'start':
    case 'end':
      return { w: 168, h: 56 };
    case 'user':
      return { w: 160, h: 88 };
    case 'note':
      return { w: 200, h: 88 };
    default:
      return { w: 208, h: 72 };
  }
}

export const GROUP_PADDING = { top: 48, right: 28, bottom: 28, left: 28 };

export function cloneScene(scene: Scene): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((n) => ({ ...n })),
    edges: scene.edges.map((e) => ({ ...e })),
    groups: scene.groups.map((g) => ({ ...g, box: g.box ? { ...g.box } : undefined })),
    blocks: (scene.blocks ?? []).map((b) => ({
      ...b,
      columns: b.columns ? [...b.columns] : undefined,
      rows: b.rows ? b.rows.map((r) => [...r]) : undefined,
    })),
  };
}

export function findNode(scene: Scene, id: string): DNode | undefined {
  return scene.nodes.find((n) => n.id === id);
}

export function findGroup(scene: Scene, id: string): DGroup | undefined {
  return scene.groups.find((g) => g.id === id);
}

export function center(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/** Position along the flow (x for left-to-right, y for top-to-bottom). */
export function mainOf(p: { x: number; y: number }, dir: Direction): number {
  return dir === 'LR' ? p.x : p.y;
}

/** Position across the flow. */
export function crossOf(p: { x: number; y: number }, dir: Direction): number {
  return dir === 'LR' ? p.y : p.x;
}

export function fromMainCross(main: number, cross: number, dir: Direction): { x: number; y: number } {
  return dir === 'LR' ? { x: main, y: cross } : { x: cross, y: main };
}

export function union(a: Rect | null, b: Rect): Rect {
  if (a == null) {
    return { ...b };
  }
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

export function intersects(a: Rect, b: Rect, margin = 0): boolean {
  return a.x < b.x + b.w + margin && b.x < a.x + a.w + margin &&
    a.y < b.y + b.h + margin && b.y < a.y + a.h + margin;
}

export function inflate(r: Rect, pad: { top: number; right: number; bottom: number; left: number }): Rect {
  return { x: r.x - pad.left, y: r.y - pad.top, w: r.w + pad.left + pad.right, h: r.h + pad.top + pad.bottom };
}

/** Ids of the group and all groups nested in it. */
export function groupAndDescendants(scene: Scene, groupId: string): Set<string> {
  const result = new Set<string>([groupId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const g of scene.groups) {
      if (g.parent != null && result.has(g.parent) && !result.has(g.id)) {
        result.add(g.id);
        grew = true;
      }
    }
  }
  return result;
}

/** True if the node is in the group or in a group nested in it. */
export function isInGroup(scene: Scene, node: DNode, groupId: string): boolean {
  return node.group != null && groupAndDescendants(scene, groupId).has(node.group);
}

/**
 * Bounds of every group, derived from its members and nested groups so that
 * groups always enclose their content. Groups without content use their box.
 */
export function groupBounds(scene: Scene): Map<string, Rect> {
  const result = new Map<string, Rect>();
  const visiting = new Set<string>();

  const compute = (g: DGroup): Rect | null => {
    if (result.has(g.id)) {
      return result.get(g.id)!;
    }
    if (visiting.has(g.id)) {
      return null; // parent cycle, ignored
    }
    visiting.add(g.id);
    let r: Rect | null = null;
    for (const n of scene.nodes) {
      if (n.group === g.id) {
        r = union(r, n);
      }
    }
    for (const child of scene.groups) {
      if (child.parent === g.id) {
        const cr = compute(child);
        if (cr != null) {
          r = union(r, cr);
        }
      }
    }
    visiting.delete(g.id);
    const bounds = r != null ? inflate(r, GROUP_PADDING) : g.box ? { ...g.box } : null;
    if (bounds != null) {
      result.set(g.id, bounds);
    }
    return bounds;
  };

  for (const g of scene.groups) {
    compute(g);
  }
  return result;
}

/** Bounds of the whole diagram, or null if it is empty. */
export function sceneBounds(scene: Scene): Rect | null {
  let r: Rect | null = null;
  for (const n of scene.nodes) {
    r = union(r, n);
  }
  for (const b of groupBounds(scene).values()) {
    r = union(r, b);
  }
  return r;
}

/** Depth of a group (0 for top-level groups). */
export function groupDepth(scene: Scene, g: DGroup): number {
  let depth = 0;
  let parent = g.parent;
  const seen = new Set<string>();
  while (parent != null && !seen.has(parent)) {
    seen.add(parent);
    depth++;
    parent = findGroup(scene, parent)?.parent;
  }
  return depth;
}
