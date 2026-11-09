/**
 * Full layout with ELK (layered, orthogonal), used for new diagrams and when
 * the user asks to tidy up. Children are given to ELK in their current order
 * across the flow and ELK is told to respect that order, so a re-layout keeps
 * the arrangement the user knows.
 */
import type { ELK, ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api';
import { GROUP_PADDING, center, crossOf, findGroup, groupAndDescendants, groupBounds, intersects } from './scene';
import { groupChain, placeEmptyGroup } from './placement';
import type { Scene } from './types';

let elkFactory: () => Promise<ELK> = async () => {
  const mod = await import('elkjs/lib/elk.bundled.js');
  const Ctor = (mod.default ?? mod) as unknown as new () => ELK;
  return new Ctor();
};
let elkInstance: Promise<ELK> | null = null;

/** Lets the browser run ELK in a web worker. */
export function setElkFactory(factory: () => Promise<ELK>) {
  elkFactory = factory;
  elkInstance = null;
}

function getElk(): Promise<ELK> {
  if (elkInstance == null) {
    elkInstance = elkFactory();
  }
  return elkInstance;
}

const NODE = 'n:';
const GROUP = 'g:';

export async function layoutScene(scene: Scene): Promise<void> {
  if (scene.nodes.length === 0) {
    for (const g of scene.groups) placeEmptyGroup(scene, g.id);
    return;
  }
  const dir = scene.direction;
  const validGroup = (id: string | undefined) => id != null && findGroup(scene, id) != null;

  // Current order across the flow, for a stable re-layout
  const hasPositions = scene.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y));
  const nodes = hasPositions
    ? [...scene.nodes].sort((a, b) => crossOf(center(a), dir) - crossOf(center(b), dir))
    : scene.nodes;

  const elkNodes = new Map<string, ElkNode>();
  const root: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': dir === 'LR' ? 'RIGHT' : 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': dir === 'LR' ? '96' : '72',
      'elk.spacing.nodeNode': dir === 'LR' ? '48' : '72',
      'elk.spacing.edgeNode': '24',
      'elk.spacing.edgeEdge': '16',
      'elk.layered.spacing.edgeNodeBetweenLayers': '24',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'false',
      'elk.edgeLabels.placement': 'CENTER',
    },
    children: [],
    edges: [],
  };
  elkNodes.set('root', root);

  // Groups first (parents before children), then nodes
  const pad = `[top=${GROUP_PADDING.top},left=${GROUP_PADDING.left},bottom=${GROUP_PADDING.bottom},right=${GROUP_PADDING.right}]`;
  const groupNode = (gid: string, trail = new Set<string>()): ElkNode => {
    const key = GROUP + gid;
    let en = elkNodes.get(key);
    if (en == null) {
      const g = findGroup(scene, gid)!;
      en = {
        id: key,
        layoutOptions: { 'elk.padding': pad },
        children: [],
        edges: [],
      };
      elkNodes.set(key, en);
      trail.add(gid);
      const parent = validGroup(g.parent) && !trail.has(g.parent!) ? groupNode(g.parent!, trail) : root;
      parent.children!.push(en);
    }
    return en;
  };
  for (const n of nodes) {
    if (validGroup(n.group)) groupNode(n.group!);
  }
  for (const n of nodes) {
    const en: ElkNode = { id: NODE + n.id, width: n.w, height: n.h };
    elkNodes.set(en.id, en);
    (validGroup(n.group) ? groupNode(n.group!) : root).children!.push(en);
  }

  // Each edge goes into the lowest common ancestor of its ends
  const ancestors = (nodeId: string): string[] => {
    const result: string[] = [];
    const node = scene.nodes.find((n) => n.id === nodeId);
    let gid = node?.group;
    const seen = new Set<string>();
    while (validGroup(gid) && !seen.has(gid!)) {
      seen.add(gid!);
      result.push(GROUP + gid);
      gid = findGroup(scene, gid!)!.parent;
    }
    result.push('root');
    return result;
  };
  for (const e of scene.edges) {
    if (!elkNodes.has(NODE + e.from) || !elkNodes.has(NODE + e.to)) continue;
    const a = ancestors(e.from);
    const b = new Set(ancestors(e.to));
    const lca = a.find((x) => b.has(x)) ?? 'root';
    const edge: ElkExtendedEdge = { id: 'e:' + e.id, sources: [NODE + e.from], targets: [NODE + e.to] };
    if (e.label) {
      edge.labels = [{ text: e.label, width: Math.min(220, e.label.length * 7 + 16), height: 20 }];
    }
    elkNodes.get(lca)!.edges!.push(edge);
  }

  const elk = await getElk();
  const result = await elk.layout(root);

  const positions = new Map<string, { x: number; y: number }>();
  const visit = (en: ElkNode, ox: number, oy: number) => {
    for (const child of en.children ?? []) {
      const x = ox + (child.x ?? 0);
      const y = oy + (child.y ?? 0);
      if (child.id.startsWith(NODE)) {
        positions.set(child.id.slice(NODE.length), { x, y });
      }
      visit(child, x, y);
    }
  };
  visit(result, 0, 0);

  for (const n of scene.nodes) {
    const p = positions.get(n.id);
    if (p != null) {
      n.x = Math.round(p.x / 4) * 4;
      n.y = Math.round(p.y / 4) * 4;
    }
  }
  // Align nodes that sit nearly inline with their single connected neighbour
  // (e.g. an external node connected to a node inside a group container)
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));
  for (const n of scene.nodes) {
    const neighbours = new Set<string>();
    for (const e of scene.edges) {
      if (e.from === n.id && e.to !== n.id) neighbours.add(e.to);
      if (e.to === n.id && e.from !== n.id) neighbours.add(e.from);
    }
    if (neighbours.size !== 1) continue;
    const peer = byId.get([...neighbours][0]);
    if (peer == null) continue;
    const diff = crossOf(center(peer), dir) - crossOf(center(n), dir);
    if (Math.abs(diff) === 0 || Math.abs(diff) > 36) continue;
    const cand = {
      x: dir === 'LR' ? n.x : Math.round((n.x + diff) / 4) * 4,
      y: dir === 'LR' ? Math.round((n.y + diff) / 4) * 4 : n.y,
      w: n.w,
      h: n.h,
    };
    const bounds = groupBounds(scene);
    const chain = new Set(groupChain(scene, n.group));
    const collidesNode = scene.nodes.some((o) => o.id !== n.id && intersects(cand, o, 24));
    const collidesGroup = [...bounds].some(([gid, gb]) => {
      if (chain.has(gid)) return false;
      const fam = groupAndDescendants(scene, gid);
      return !(n.group != null && fam.has(n.group)) && intersects(cand, gb, 12);
    });
    if (!collidesNode && !collidesGroup) {
      n.x = cand.x;
      n.y = cand.y;
    }
  }
  for (const g of scene.groups) {
    const hasContent = scene.nodes.some((n) => n.group === g.id) || scene.groups.some((c) => c.parent === g.id);
    g.box = undefined;
    if (!hasContent) {
      placeEmptyGroup(scene, g.id);
    }
  }
}
