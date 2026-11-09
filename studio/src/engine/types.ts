/**
 * The scene model: the single source of truth for a diagram. Every element
 * has a stable id that the voice agent uses to edit it, and every node keeps
 * its position until it is moved by the user or by an explicit re-layout.
 */

export const DIAGRAM_TYPES = ['architecture', 'flowchart', 'c4', 'network', 'generic'] as const;
export type DiagramType = (typeof DIAGRAM_TYPES)[number];

export const DIRECTIONS = ['LR', 'TB'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const NODE_KINDS = [
  // Architecture and C4
  'service', 'api', 'database', 'cache', 'queue', 'storage', 'function', 'gateway',
  'loadbalancer', 'user', 'client', 'mobile', 'external', 'server', 'container',
  'ai', 'analytics', 'security', 'network', 'email', 'system', 'component',
  // Flowchart
  'process', 'decision', 'start', 'end', 'io', 'document', 'subprocess',
  // Any diagram
  'note',
] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export const GROUP_KINDS = ['boundary', 'region', 'vpc', 'subnet', 'cluster', 'zone', 'system', 'lane', 'generic'] as const;
export type GroupKind = (typeof GROUP_KINDS)[number];

export const COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'yellow', 'gray'] as const;
export type ColorName = (typeof COLORS)[number];

export const PROVIDERS = ['gcp', 'aws', 'azure', 'k8s', 'onprem', 'generic'] as const;
export type Provider = (typeof PROVIDERS)[number];

export const EDGE_STYLES = ['solid', 'dashed', 'dotted'] as const;
export type EdgeStyle = (typeof EDGE_STYLES)[number];

export const ARROWS = ['forward', 'both', 'none'] as const;
export type Arrow = (typeof ARROWS)[number];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DNode extends Rect {
  id: string;
  label: string;
  kind: NodeKind;
  /** Technology or product, e.g. "Cloud Run", "PostgreSQL", "Kafka". */
  tech?: string;
  provider?: Provider;
  description?: string;
  /** Id of the group that contains the node. */
  group?: string;
  color?: ColorName;
}

export interface DEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  style?: EdgeStyle;
  arrow?: Arrow;
}

export interface DGroup {
  id: string;
  label: string;
  kind: GroupKind;
  /** Id of the enclosing group. */
  parent?: string;
  color?: ColorName;
  /** Area of a group without members (otherwise derived from the members). */
  box?: Rect;
}

export const BLOCK_KINDS = ['text', 'table'] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

/**
 * A chapter of the page's documentation (a text or a table), e.g. the
 * overview of an architecture or a table of its components. The chapters are
 * shown in their own tab as a book, in the order of Scene.blocks; they are
 * not drawn on the canvas (x, y, w, h are only kept for older files).
 */
export interface DBlock extends Rect {
  id: string;
  kind: BlockKind;
  title?: string;
  /** Text blocks: Markdown (headings, lists, **bold**, `code`, simple tables). */
  text?: string;
  /** Table blocks: header row and body rows. */
  columns?: string[];
  rows?: string[][];
  color?: ColorName;
}

export interface Scene {
  /** Incremented on every change, the agent edits against a version. */
  version: number;
  type: DiagramType;
  direction: Direction;
  /** Shown above the diagram; also the name of its page. */
  title: string;
  subtitle?: string;
  nodes: DNode[];
  edges: DEdge[];
  groups: DGroup[];
  /** Text and table blocks. */
  blocks: DBlock[];
}

/** What a change did, by element id (used for highlighting and the log). */
export interface ChangeSet {
  addedNodes: string[];
  updatedNodes: string[];
  removedNodes: string[];
  movedNodes: string[];
  addedEdges: string[];
  updatedEdges: string[];
  removedEdges: string[];
  addedGroups: string[];
  updatedGroups: string[];
  removedGroups: string[];
  addedBlocks: string[];
  updatedBlocks: string[];
  removedBlocks: string[];
}

export function emptyChanges(): ChangeSet {
  return {
    addedNodes: [], updatedNodes: [], removedNodes: [], movedNodes: [],
    addedEdges: [], updatedEdges: [], removedEdges: [],
    addedGroups: [], updatedGroups: [], removedGroups: [],
    addedBlocks: [], updatedBlocks: [], removedBlocks: [],
  };
}

export function emptyScene(): Scene {
  return { version: 0, type: 'architecture', direction: 'LR', title: '', nodes: [], edges: [], groups: [], blocks: [] };
}

/** True if nothing is drawn (no nodes, groups or blocks). */
export function isBlankScene(scene: Scene): boolean {
  return scene.nodes.length === 0 && scene.groups.length === 0 && scene.blocks.length === 0;
}

/** True if the page has a diagram (nodes or groups); its documentation does not count. */
export function hasDiagram(scene: Scene): boolean {
  return scene.nodes.length > 0 || scene.groups.length > 0;
}
