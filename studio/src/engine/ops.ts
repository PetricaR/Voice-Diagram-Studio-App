/**
 * Applies a batch of edits to a scene atomically: the whole batch is
 * validated first and rejected with precise errors (so the agent can correct
 * itself) or applied as one change. Existing nodes keep their positions.
 */
import { blockSize, placeBlock, reflowBlocks, resolveBlock, type BlockSide } from './blocks';
import { normalizeText } from './markdown';
import { groupChain, placeEmptyGroup, placeNodes, repairGroups, type PlacementHint, type Side } from './placement';
import { cloneScene, findGroup, groupBounds, isInGroup, nodeSize } from './scene';
import { SELECTED, inferKind, inferProvider, normalize, resolveGroup, resolveNode, slugify, uniqueId } from './resolve';
import {
  ARROWS, COLORS, DIAGRAM_TYPES, DIRECTIONS, EDGE_STYLES, GROUP_KINDS, NODE_KINDS, PROVIDERS,
  emptyChanges, type Arrow, type ChangeSet, type ColorName, type DBlock, type DEdge, type DGroup, type DNode,
  type DiagramType, type Direction, type EdgeStyle, type GroupKind, type NodeKind, type Provider, type Rect, type Scene,
} from './types';

/** A text or table block to write: a new one, or new content for an existing one. */
export interface BlockInput {
  id?: string;
  kind?: string;
  title?: string;
  /** Text: Markdown. */
  text?: string;
  /** Text: add to the end instead of replacing; table: add the rows. */
  append?: boolean;
  columns?: string[];
  rows?: unknown[][];
  color?: string;
  /** Id of a node, group or block to put it next to. */
  near?: string;
  side?: string;
  /** Reading order in the documentation: id or title of the chapter it follows, or "start". */
  after?: string;
}

const MAX_COLUMNS = 12;
const MAX_ROWS = 80;

export interface NodeInput {
  id?: string;
  label: string;
  kind?: string;
  tech?: string;
  provider?: string;
  description?: string;
  group?: string;
  color?: string;
  /** Existing node to put the new one next to. */
  near?: string;
  side?: string;
}

export interface NodeUpdate {
  id: string;
  label?: string;
  kind?: string;
  tech?: string;
  provider?: string;
  description?: string;
  /** Group to move the node into, "" or "none" to take it out of its group. */
  group?: string;
  color?: string;
}

export interface EdgeInput {
  from: string;
  to: string;
  label?: string;
  style?: string;
  arrow?: string;
}

export interface EdgeUpdate {
  from: string;
  to: string;
  label?: string;
  style?: string;
  arrow?: string;
  /** Reconnect: new source or target. */
  new_from?: string;
  new_to?: string;
  /** Swap the direction. */
  reverse?: boolean;
}

export interface EdgeRef {
  from: string;
  to: string;
  label?: string;
}

export interface GroupInput {
  id?: string;
  label: string;
  kind?: string;
  parent?: string;
  members?: string[];
  color?: string;
}

export interface GroupUpdate {
  id: string;
  label?: string;
  kind?: string;
  parent?: string;
  add_members?: string[];
  remove_members?: string[];
  color?: string;
}

export interface EditRequest {
  base_version?: number;
  summary?: string;
  add_groups?: GroupInput[];
  add_nodes?: NodeInput[];
  update_nodes?: NodeUpdate[];
  update_groups?: GroupUpdate[];
  remove_edges?: EdgeRef[];
  add_edges?: EdgeInput[];
  update_edges?: EdgeUpdate[];
  remove_nodes?: string[];
  remove_groups?: string[];
  /** Text and table blocks to add or rewrite (matched by id). */
  write_blocks?: BlockInput[];
  /** Ids of text or table blocks to remove. */
  remove_blocks?: string[];
  direction?: string;
  title?: string;
  /** Line under the title, "" to remove it. */
  subtitle?: string;
  diagram_type?: string;
  /** Required to remove a large part of the diagram in one edit. */
  confirm_large_removal?: boolean;
}

export interface EditResult {
  ok: boolean;
  scene: Scene;
  changes: ChangeSet;
  errors: string[];
  warnings: string[];
  /** How imprecise references were understood, e.g. "the database" → db. */
  notes: string[];
}

export interface EditContext {
  /** Ids of the selected nodes, for the @selected placeholder. */
  selection?: string[];
}

const oneOf = <T extends string>(values: readonly T[], v: string | undefined): T | undefined => {
  if (v == null) return undefined;
  const key = v.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return values.find((x) => x === key);
};

/** Removes empty optional strings so that "" means "not given". */
const opt = (s: string | undefined | null): string | undefined => {
  if (s == null) return undefined;
  const t = String(s).trim();
  return t === '' ? undefined : t;
};

export function edgeId(scene: Scene, from: string, to: string): string {
  return uniqueId(`${from}->${to}`, new Set(scene.edges.map((e) => e.id)));
}

/** The large-removal guard: more than a third of the diagram (and more than two nodes). */
export function isLargeRemoval(total: number, removed: number): boolean {
  return removed > 2 && removed > total / 3;
}

export function applyEdit(base: Scene, req: EditRequest, ctx: EditContext = {}): EditResult {
  const scene = cloneScene(base);
  const prevGroupBounds = groupBounds(base);
  const changes = emptyChanges();
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];
  const hints = new Map<string, PlacementHint>();
  const newNodeIds: string[] = [];
  const regrouped = new Set<string>();
  const selection = (ctx.selection ?? []).filter((id) => scene.nodes.some((n) => n.id === id));
  const selectedBlocks = (ctx.selection ?? []).filter((id) => scene.blocks.some((b) => b.id === id));

  const node = (ref: string, where: string): DNode | undefined => {
    const r = resolveNode(ref, scene.nodes);
    if (r.error) errors.push(`${where}: ${r.error}`);
    if (r.note) notes.push(r.note);
    return r.item;
  };
  const group = (ref: string, where: string): DGroup | undefined => {
    const r = resolveGroup(ref, scene.groups);
    if (r.error) errors.push(`${where}: ${r.error}`);
    if (r.note) notes.push(r.note);
    return r.item;
  };
  /** Expands @selected into the ids of the selected nodes. */
  const expand = (refs: string[] | undefined, where: string): string[] => {
    const result: string[] = [];
    for (const ref of refs ?? []) {
      if (ref === SELECTED || normalize(ref) === 'selected' || normalize(ref) === 'selection') {
        if (selection.length === 0) errors.push(`${where}: nothing is selected.`);
        result.push(...selection);
      } else {
        result.push(ref);
      }
    }
    return result;
  };
  const touch = (list: string[], id: string) => {
    if (!list.includes(id)) list.push(id);
  };
  const setColor = (target: { color?: ColorName }, color: string | undefined, where: string) => {
    if (color == null) return;
    if (/^(none|default)$/i.test(color)) {
      delete target.color;
      return;
    }
    const c = oneOf(COLORS, color);
    if (c == null) errors.push(`${where}: unknown color "${color}" (use ${COLORS.join(', ')}).`);
    else target.color = c;
  };

  // Diagram settings
  const direction = opt(req.direction);
  if (direction != null) {
    const d = oneOf(DIRECTIONS, direction.toUpperCase() === 'TD' ? 'TB' : direction.toUpperCase());
    if (d == null) errors.push(`direction: use LR or TB.`);
    else scene.direction = d as Direction;
  }
  const type = opt(req.diagram_type);
  if (type != null) {
    const t = oneOf(DIAGRAM_TYPES, type);
    if (t == null) errors.push(`diagram_type: use ${DIAGRAM_TYPES.join(', ')}.`);
    else scene.type = t as DiagramType;
  }
  if (opt(req.title) != null) scene.title = opt(req.title)!;
  if (req.subtitle != null) {
    if (opt(req.subtitle) == null) delete scene.subtitle;
    else scene.subtitle = opt(req.subtitle);
  }

  // 1. New groups (members are assigned after the new nodes exist)
  const pendingMembers: [DGroup, string[], string][] = [];
  for (const gi of req.add_groups ?? []) {
    const label = opt(gi.label);
    if (label == null) {
      errors.push('add_groups: a group needs a label.');
      continue;
    }
    const taken = new Set([...scene.groups.map((g) => g.id), ...scene.nodes.map((n) => n.id)]);
    const wanted = slugify(opt(gi.id) ?? label);
    const existing = findGroup(scene, wanted);
    if (existing != null) {
      if (normalize(existing.label) !== normalize(label)) {
        errors.push(`add_groups: id "${wanted}" is already the group "${existing.label}", use another id or update_groups.`);
      } else {
        warnings.push(`Group ${wanted} already exists.`);
      }
      continue;
    }
    const g: DGroup = { id: uniqueId(wanted, taken), label, kind: oneOf(GROUP_KINDS, gi.kind) ?? 'generic' };
    if (gi.kind != null && oneOf(GROUP_KINDS, gi.kind) == null) {
      warnings.push(`Group kind "${gi.kind}" is unknown, used generic.`);
    }
    setColor(g, opt(gi.color), `add_groups ${g.id}`);
    scene.groups.push(g);
    changes.addedGroups.push(g.id);
    if (opt(gi.parent) != null) {
      pendingMembers.push([g, [], opt(gi.parent)!]);
    }
    if (gi.members != null && gi.members.length > 0) {
      pendingMembers.push([g, gi.members, '']);
    }
  }
  for (const [g, , parentRef] of pendingMembers) {
    if (parentRef !== '') {
      const p = group(parentRef, `add_groups ${g.id} parent`);
      if (p != null) {
        if (groupChain(scene, p.id).includes(g.id)) {
          errors.push(`add_groups ${g.id} parent: "${p.label}" cannot be nested inside "${g.label}" and also be its parent.`);
        } else {
          g.parent = p.id;
        }
      }
    }
  }

  // 2. New nodes
  for (const ni of req.add_nodes ?? []) {
    const label = opt(ni.label);
    if (label == null) {
      errors.push('add_nodes: a node needs a label.');
      continue;
    }
    const wanted = slugify(opt(ni.id) ?? label);
    const existing = scene.nodes.find((n) => n.id === wanted);
    if (existing != null) {
      if (normalize(existing.label) === normalize(label)) {
        warnings.push(`Node ${wanted} "${label}" already exists, it was not added again.`);
      } else {
        errors.push(`add_nodes: id "${wanted}" is already "${existing.label}". Use a different id for the new node, or update_nodes to change the existing one.`);
      }
      continue;
    }
    const tech = opt(ni.tech);
    let kind = oneOf(NODE_KINDS, ni.kind) as NodeKind | undefined;
    if (kind == null) {
      if (opt(ni.kind) != null) warnings.push(`Kind "${ni.kind}" of ${wanted} is unknown, it was inferred.`);
      kind = inferKind(label, tech, scene.type);
    }
    // Ids are unique across nodes and blocks (the canvas selects both by id)
    const id = scene.blocks.some((b) => b.id === wanted)
      ? uniqueId(wanted, new Set([...scene.nodes.map((x) => x.id), ...scene.blocks.map((x) => x.id)]))
      : wanted;
    const n: DNode = { id, label, kind, x: NaN, y: NaN, ...nodeSize(kind) };
    if (tech != null) n.tech = tech;
    const provider = oneOf(PROVIDERS, opt(ni.provider)) ?? inferProvider(label, tech);
    if (provider != null) n.provider = provider as Provider;
    if (opt(ni.description) != null) n.description = opt(ni.description);
    setColor(n, opt(ni.color), `add_nodes ${wanted}`);
    if (opt(ni.group) != null) {
      let g = resolveGroup(ni.group!, scene.groups).item;
      if (g == null) {
        // A group that does not exist yet is created, as spoken requests
        // often name the group together with its first member
        g = { id: uniqueId(slugify(ni.group!), new Set(scene.groups.map((x) => x.id))), label: ni.group!, kind: 'generic' };
        scene.groups.push(g);
        changes.addedGroups.push(g.id);
        notes.push(`Created group ${g.id} "${g.label}" for ${wanted}.`);
      }
      n.group = g.id;
    }
    scene.nodes.push(n);
    newNodeIds.push(n.id);
    changes.addedNodes.push(n.id);
    const side = oneOf(['right', 'left', 'above', 'below'] as const, opt(ni.side)) as Side | undefined;
    if (opt(ni.near) != null || side != null) {
      hints.set(n.id, { near: opt(ni.near), side });
    }
  }
  // near is resolved once all new nodes exist, it may name one of them
  for (const [id, hint] of hints) {
    if (hint.near != null) {
      const target = node(hint.near, `add_nodes ${id} near`);
      hint.near = target?.id;
    }
  }

  // 3. Group membership of new groups
  for (const [g, members] of pendingMembers) {
    for (const ref of expand(members, `add_groups ${g.id} members`)) {
      const n = node(ref, `add_groups ${g.id} members`);
      if (n != null) {
        n.group = g.id;
        regrouped.add(n.id);
        if (!changes.addedNodes.includes(n.id)) touch(changes.updatedNodes, n.id);
      }
    }
  }

  // 4. Node updates
  for (const nu of req.update_nodes ?? []) {
    const ids = expand([nu.id], 'update_nodes');
    for (const ref of ids) {
      const n = node(ref, 'update_nodes');
      if (n == null) continue;
      const where = `update_nodes ${n.id}`;
      if (opt(nu.label) != null) n.label = opt(nu.label)!;
      if (nu.kind != null) {
        const k = oneOf(NODE_KINDS, nu.kind);
        if (k == null) errors.push(`${where}: unknown kind "${nu.kind}".`);
        else if (k !== n.kind) {
          // Keep the center where it was
          const size = nodeSize(k);
          n.x += (n.w - size.w) / 2;
          n.y += (n.h - size.h) / 2;
          n.w = size.w;
          n.h = size.h;
          n.kind = k;
        }
      }
      if (nu.tech != null) {
        if (opt(nu.tech) == null) delete n.tech;
        else {
          n.tech = opt(nu.tech);
          if (nu.provider == null && n.provider == null) {
            const inferred = inferProvider(n.label, n.tech);
            if (inferred != null) n.provider = inferred;
          }
        }
      }
      if (nu.provider != null) {
        const p = oneOf(PROVIDERS, nu.provider);
        if (p == null) delete n.provider;
        else n.provider = p as Provider;
      }
      if (nu.description != null) {
        if (opt(nu.description) == null) delete n.description;
        else n.description = opt(nu.description);
      }
      setColor(n, opt(nu.color), where);
      if (nu.group != null) {
        if (opt(nu.group) == null || /^(none|null|no group)$/i.test(nu.group)) {
          if (n.group != null) {
            delete n.group;
            regrouped.add(n.id);
          }
        } else {
          const g = group(nu.group, where + ' group');
          if (g != null && g.id !== n.group) {
            n.group = g.id;
            regrouped.add(n.id);
          }
        }
      }
      if (!changes.addedNodes.includes(n.id)) touch(changes.updatedNodes, n.id);
    }
  }

  // 5. Group updates
  for (const gu of req.update_groups ?? []) {
    const g = group(gu.id, 'update_groups');
    if (g == null) continue;
    const where = `update_groups ${g.id}`;
    if (opt(gu.label) != null) g.label = opt(gu.label)!;
    if (gu.kind != null) {
      const k = oneOf(GROUP_KINDS, gu.kind);
      if (k == null) errors.push(`${where}: unknown kind "${gu.kind}".`);
      else g.kind = k as GroupKind;
    }
    setColor(g, opt(gu.color), where);
    if (gu.parent != null) {
      if (opt(gu.parent) == null || /^(none|null)$/i.test(gu.parent)) {
        delete g.parent;
      } else {
        const p = group(gu.parent, where + ' parent');
        if (p != null) {
          if (groupChain(scene, p.id).includes(g.id)) {
            errors.push(`${where} parent: cannot make "${p.label}" parent of "${g.label}" (cycle).`);
          } else {
            g.parent = p.id;
          }
        }
      }
    }
    for (const ref of expand(gu.add_members, where + ' add_members')) {
      const n = node(ref, where + ' add_members');
      if (n != null && n.group !== g.id) {
        n.group = g.id;
        regrouped.add(n.id);
        if (!changes.addedNodes.includes(n.id)) touch(changes.updatedNodes, n.id);
      }
    }
    for (const ref of expand(gu.remove_members, where + ' remove_members')) {
      const n = node(ref, where + ' remove_members');
      if (n != null && isInGroup(scene, n, g.id)) {
        if (g.parent != null) n.group = g.parent;
        else delete n.group;
        if (!changes.addedNodes.includes(n.id)) touch(changes.updatedNodes, n.id);
      }
    }
    if (!changes.addedGroups.includes(g.id)) touch(changes.updatedGroups, g.id);
  }

  // 6. Edges: removals first, so that "replace A→B by A→C→B" works
  const findEdges = (from: DNode, to: DNode, label: string | undefined, bothWays: boolean): DEdge[] => {
    let found = scene.edges.filter((e) => (e.from === from.id && e.to === to.id) ||
      (bothWays && e.from === to.id && e.to === from.id));
    if (label != null && found.length > 1) {
      const byLabel = found.filter((e) => normalize(e.label ?? '') === normalize(label));
      if (byLabel.length > 0) found = byLabel;
    }
    return found;
  };
  for (const er of req.remove_edges ?? []) {
    const from = node(er.from, 'remove_edges from');
    const to = node(er.to, 'remove_edges to');
    if (from == null || to == null) continue;
    const found = findEdges(from, to, opt(er.label), true);
    if (found.length === 0) {
      warnings.push(`No connection between ${from.id} and ${to.id} to remove.`);
    }
    for (const e of found) {
      scene.edges = scene.edges.filter((x) => x !== e);
      changes.removedEdges.push(e.id);
    }
  }
  for (const ei of req.add_edges ?? []) {
    const from = node(ei.from, 'add_edges from');
    const to = node(ei.to, 'add_edges to');
    if (from == null || to == null) continue;
    const label = opt(ei.label);
    const dup = scene.edges.find((e) => e.from === from.id && e.to === to.id &&
      normalize(e.label ?? '') === normalize(label ?? ''));
    if (dup != null) {
      warnings.push(`${from.id} → ${to.id} already exists.`);
      continue;
    }
    const e: DEdge = { id: edgeId(scene, from.id, to.id), from: from.id, to: to.id };
    if (label != null) e.label = label;
    const style = oneOf(EDGE_STYLES, opt(ei.style));
    if (style != null) e.style = style as EdgeStyle;
    const arrow = oneOf(ARROWS, opt(ei.arrow));
    if (arrow != null) e.arrow = arrow as Arrow;
    scene.edges.push(e);
    changes.addedEdges.push(e.id);
  }
  for (const eu of req.update_edges ?? []) {
    const from = node(eu.from, 'update_edges from');
    const to = node(eu.to, 'update_edges to');
    if (from == null || to == null) continue;
    const found = findEdges(from, to, undefined, true);
    if (found.length === 0) {
      errors.push(`update_edges: there is no connection between ${from.id} and ${to.id} (use add_edges).`);
      continue;
    }
    for (const e of found) {
      if (eu.label != null) {
        if (opt(eu.label) == null) delete e.label;
        else e.label = opt(eu.label);
      }
      if (eu.style != null) {
        const s = oneOf(EDGE_STYLES, eu.style);
        if (s == null) errors.push(`update_edges: unknown style "${eu.style}".`);
        else e.style = s as EdgeStyle;
      }
      if (eu.arrow != null) {
        const a = oneOf(ARROWS, eu.arrow);
        if (a == null) errors.push(`update_edges: unknown arrow "${eu.arrow}".`);
        else e.arrow = a as Arrow;
      }
      if (eu.reverse) {
        [e.from, e.to] = [e.to, e.from];
      }
      if (opt(eu.new_from) != null) {
        const nf = node(eu.new_from!, 'update_edges new_from');
        if (nf != null) e.from = nf.id;
      }
      if (opt(eu.new_to) != null) {
        const nt = node(eu.new_to!, 'update_edges new_to');
        if (nt != null) e.to = nt.id;
      }
      const dup = scene.edges.find((x) => x !== e && x.from === e.from && x.to === e.to &&
        normalize(x.label ?? '') === normalize(e.label ?? ''));
      if (dup != null) {
        scene.edges = scene.edges.filter((x) => x !== e);
        changes.removedEdges.push(e.id);
      } else {
        touch(changes.updatedEdges, e.id);
      }
    }
  }

  // 7. Node removals, with their connections (a block id here removes the block)
  const blockRemovals = [...(req.remove_blocks ?? [])];
  const nodeRemovals = (req.remove_nodes ?? []).flatMap((ref) =>
    /^@?selected$/i.test(ref) && selection.length === 0 && selectedBlocks.length > 0 ? selectedBlocks : [ref]);
  const removeRefs = expand(nodeRemovals, 'remove_nodes').filter((ref) => {
    const isBlock = !scene.nodes.some((n) => n.id === ref) && scene.blocks.some((b) => b.id === ref);
    if (isBlock) blockRemovals.push(ref);
    return !isBlock;
  });
  for (const ref of removeRefs) {
    const n = node(ref, 'remove_nodes');
    if (n == null) continue;
    scene.nodes = scene.nodes.filter((x) => x !== n);
    changes.removedNodes.push(n.id);
    for (const e of scene.edges.filter((e) => e.from === n.id || e.to === n.id)) {
      changes.removedEdges.push(e.id);
    }
    scene.edges = scene.edges.filter((e) => e.from !== n.id && e.to !== n.id);
  }
  changes.addedNodes = changes.addedNodes.filter((id) => !changes.removedNodes.includes(id));
  changes.updatedNodes = changes.updatedNodes.filter((id) => !changes.removedNodes.includes(id));
  changes.addedEdges = changes.addedEdges.filter((id) => !changes.removedEdges.includes(id));
  changes.updatedEdges = changes.updatedEdges.filter((id) => !changes.removedEdges.includes(id));

  // 8. Group removals: members move to the enclosing group
  for (const ref of req.remove_groups ?? []) {
    const g = group(ref, 'remove_groups');
    if (g == null) continue;
    for (const n of scene.nodes) {
      if (n.group === g.id) {
        if (g.parent != null) n.group = g.parent;
        else delete n.group;
      }
    }
    for (const c of scene.groups) {
      if (c.parent === g.id) {
        if (g.parent != null) c.parent = g.parent;
        else delete c.parent;
      }
    }
    scene.groups = scene.groups.filter((x) => x !== g);
    changes.removedGroups.push(g.id);
  }
  changes.addedGroups = changes.addedGroups.filter((id) => !changes.removedGroups.includes(id));
  changes.updatedGroups = changes.updatedGroups.filter((id) => !changes.removedGroups.includes(id));

  // 9. Text and table blocks
  const blockHints = new Map<string, { near?: Rect; side?: BlockSide }>();
  const grown: string[] = [];
  for (const ref of blockRemovals) {
    const refs = ref === SELECTED || /^@?selected$/i.test(ref) ? selectedBlocks : [ref];
    if (refs.length === 0) errors.push('remove_blocks: no text or table is selected.');
    for (const r of refs) {
      const found = resolveBlock(r, scene.blocks);
      if (found.item == null) {
        errors.push(`remove_blocks: ${found.error ?? `no text or table "${r}"`}`);
        continue;
      }
      if (found.note) notes.push(found.note);
      scene.blocks = scene.blocks.filter((b) => b !== found.item);
      changes.removedBlocks.push(found.item.id);
    }
  }
  for (const bi of req.write_blocks ?? []) {
    const r = writeBlock(scene, bi, selectedBlocks);
    errors.push(...r.errors);
    notes.push(...r.notes);
    if (r.block == null) continue;
    if (r.created) {
      changes.addedBlocks.push(r.block.id);
      const nearRef = opt(bi.near);
      let near: Rect | undefined;
      if (nearRef != null) {
        const nn = resolveNode(nearRef, scene.nodes).item;
        const ng = nn == null ? resolveGroup(nearRef, scene.groups).item : undefined;
        const nb = nn == null && ng == null ? resolveBlock(nearRef, scene.blocks.filter((b) => b !== r.block)).item : undefined;
        near = nn ?? (ng != null ? groupBounds(scene).get(ng.id) : undefined) ?? nb;
        if (near == null) warnings.push(`near "${nearRef}" was not found, the block was placed beside the diagram.`);
      }
      const side = oneOf(['right', 'left', 'above', 'below'] as const, opt(bi.side)) as BlockSide | undefined;
      blockHints.set(r.block.id, { near, side });
    } else {
      touch(changes.updatedBlocks, r.block.id);
      if (r.grew) grown.push(r.block.id);
    }
    const after = opt(bi.after);
    if (after != null) {
      const moved = moveChapter(scene, r.block, after);
      if (moved.error) warnings.push(`${r.block.id}: ${moved.error}`);
      else if (moved.note) notes.push(moved.note);
    }
  }

  // Guard against an "edit" that throws most of the diagram away
  const existing = base.nodes.length;
  const removedExisting = changes.removedNodes.filter((id) => base.nodes.some((n) => n.id === id)).length;
  if (isLargeRemoval(existing, removedExisting) && !req.confirm_large_removal) {
    errors.push(`This edit removes ${removedExisting} of ${existing} nodes. Only remove that much if the user ` +
      `explicitly asked for it, then repeat the call with confirm_large_removal: true. To change the diagram, ` +
      `edit the affected elements instead.`);
  }

  if (errors.length > 0) {
    return { ok: false, scene: base, changes: emptyChanges(), errors, warnings, notes };
  }

  // Positions: only the new nodes are placed, the rest stays where it is
  const live = newNodeIds.filter((id) => scene.nodes.some((n) => n.id === id));
  const moved = new Set(placeNodes(scene, live, hints));
  const changedGroups = new Set<string>();
  for (const id of regrouped) {
    const n = scene.nodes.find((x) => x.id === id);
    for (const gid of groupChain(scene, n?.group)) {
      changedGroups.add(gid);
    }
  }
  for (const id of repairGroups(scene, [...changedGroups], regrouped)) {
    if (!live.includes(id)) moved.add(id);
  }
  for (const g of scene.groups) {
    const hasContent = scene.nodes.some((n) => n.group === g.id) || scene.groups.some((c) => c.parent === g.id);
    if (!hasContent && g.box == null) {
      const prev = prevGroupBounds.get(g.id);
      if (prev != null) g.box = { ...prev };
      else placeEmptyGroup(scene, g.id);
    }
  }
  changes.movedNodes = [...moved].filter((id) => scene.nodes.some((n) => n.id === id));

  // Blocks go into free space after the nodes are placed; blocks that the
  // diagram now covers (or that a grown block pushes) move out of the way
  for (const [id, hint] of blockHints) {
    const b = scene.blocks.find((x) => x.id === id);
    if (b != null) placeBlock(scene, b, hint);
  }
  for (const id of grown) reflowBlocks(scene, id);
  reflowBlocks(scene);

  scene.version = base.version + 1;
  return { ok: true, scene, changes, errors, warnings, notes };
}

/**
 * Moves a chapter of the documentation (blocks are in reading order) after
 * another one, or to the start.
 */
function moveChapter(scene: Scene, block: DBlock, after: string): { error?: string; note?: string } {
  const others = scene.blocks.filter((b) => b !== block);
  let index: number;
  let note: string | undefined;
  if (/^(start|first|beginning|top|begin)$/i.test(after)) {
    index = 0;
  } else {
    const found = resolveBlock(after, others);
    if (found.item == null) return { error: `after "${after}" is not a chapter, the chapter keeps its place.` };
    index = others.indexOf(found.item) + 1;
    note = found.note;
  }
  others.splice(index, 0, block);
  scene.blocks = others;
  return { note };
}

const cell = (v: unknown): string => (v == null ? '' : typeof v === 'string' ? v.trim() : String(v));

/** Normalizes table rows: strings, as many cells as columns. */
function tableRows(rows: unknown[][] | undefined, width: number): string[][] {
  return (Array.isArray(rows) ? rows : []).slice(0, MAX_ROWS).map((r) => {
    const cells = (Array.isArray(r) ? r : [r]).map(cell);
    while (cells.length < width) cells.push('');
    return cells.slice(0, width);
  });
}

/**
 * Adds a block or rewrites an existing one (the same id, or the same title
 * and kind). A new block gets its position later (NaN until placed).
 */
function writeBlock(scene: Scene, bi: BlockInput, selected: string[]):
  { block?: DBlock; created: boolean; grew: boolean; errors: string[]; notes: string[] } {
  const errors: string[] = [];
  const notes: string[] = [];
  const id = opt(bi.id);
  const title = opt(bi.title);
  const kindIn = opt(bi.kind)?.toLowerCase();
  const kind = kindIn === 'table' || (kindIn == null && Array.isArray(bi.columns)) ? 'table' : 'text';
  const where = `${kind === 'table' ? 'write_table' : 'write_text'}${id ? ' ' + id : ''}`;

  let existing: DBlock | undefined;
  if (id === SELECTED || (id != null && /^@?selected$/i.test(id))) {
    existing = scene.blocks.find((b) => b.id === selected[0]);
    if (existing == null) errors.push(`${where}: no text or table is selected.`);
  } else if (id != null) {
    existing = scene.blocks.find((b) => b.id === id || b.id === slugify(id));
  }
  if (existing == null && title != null) {
    existing = scene.blocks.find((b) => b.kind === kind && b.title != null && normalize(b.title) === normalize(title));
    if (existing != null && id != null) notes.push(`"${id}" → ${existing.id} (same title)`);
  }
  if (existing != null && kindIn != null && existing.kind !== kind) {
    errors.push(`${where}: ${existing.id} is a ${existing.kind}, not a ${kind}. Use another id for a new ${kind}.`);
    return { created: false, grew: false, errors, notes };
  }
  if (errors.length > 0) return { created: false, grew: false, errors, notes };

  const target: DBlock = existing ?? { id: '', kind, x: NaN, y: NaN, w: 0, h: 0 };
  if (title != null) target.title = title;
  if (target.kind === 'text') {
    if (bi.text != null) {
      const text = normalizeText(String(bi.text));
      target.text = bi.append && target.text ? `${target.text}\n\n${text}` : text;
    }
    if (!target.text) {
      errors.push(`${where}: a text needs text.`);
      return { created: false, grew: false, errors, notes };
    }
  } else {
    if (Array.isArray(bi.columns) && bi.columns.length > 0) {
      target.columns = bi.columns.slice(0, MAX_COLUMNS).map(cell);
    }
    const columns = target.columns ?? [];
    if (columns.length === 0) {
      errors.push(`${where}: a table needs columns.`);
      return { created: false, grew: false, errors, notes };
    }
    if (bi.rows != null) {
      const rows = tableRows(bi.rows, columns.length);
      target.rows = bi.append ? [...tableRows(target.rows, columns.length), ...rows].slice(0, MAX_ROWS) : rows;
    } else {
      target.rows = tableRows(target.rows, columns.length);
    }
  }
  if (bi.color != null) {
    if (/^(none|default)$/i.test(bi.color)) delete target.color;
    else {
      const c = oneOf(COLORS, bi.color);
      if (c == null) errors.push(`${where}: unknown color "${bi.color}".`);
      else target.color = c;
    }
  }
  const size = blockSize(target);
  const grew = existing != null && size.h > existing.h;
  target.w = size.w;
  target.h = size.h;
  if (existing == null) {
    const taken = new Set([...scene.nodes.map((n) => n.id), ...scene.groups.map((g) => g.id), ...scene.blocks.map((b) => b.id)]);
    target.id = uniqueId(slugify(id ?? title ?? (kind === 'table' ? 'table' : 'notes')), taken);
    scene.blocks.push(target);
  }
  return { block: target, created: existing == null, grew, errors, notes };
}

/** A complete new diagram (create_diagram). */
export interface CreateRequest {
  diagram_type?: string;
  direction?: string;
  title?: string;
  subtitle?: string;
  groups?: GroupInput[];
  nodes?: NodeInput[];
  edges?: EdgeInput[];
  blocks?: BlockInput[];
}

/**
 * Builds a new diagram through the same validation as edits, then lays it
 * out with ELK (see layout.ts, called by the store).
 */
export function buildScene(req: CreateRequest, version: number): EditResult {
  const start: Scene = {
    version,
    type: (oneOf(DIAGRAM_TYPES, req.diagram_type) as DiagramType) ?? 'architecture',
    direction: 'LR',
    title: opt(req.title) ?? '',
    nodes: [],
    edges: [],
    groups: [],
    blocks: [],
  };
  if (opt(req.subtitle) != null) start.subtitle = opt(req.subtitle);
  const dir = opt(req.direction)?.toUpperCase();
  start.direction = dir === 'TB' || dir === 'TD' ? 'TB' : 'LR';
  const result = applyEdit(start, {
    add_groups: req.groups,
    add_nodes: req.nodes?.map((n) => ({ ...n, near: undefined, side: undefined })),
    add_edges: req.edges,
    write_blocks: req.blocks,
  });
  if (result.ok) {
    result.scene.version = version + 1;
  }
  return result;
}
