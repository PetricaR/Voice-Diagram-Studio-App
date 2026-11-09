/**
 * The document store shared by the canvas and the voice agent: the current
 * scene, the selection and a linear history in which every change (spoken,
 * typed or done by hand) is one entry that can be undone.
 */
import { applyEdit, buildScene, type CreateRequest, type EditRequest, type EditResult } from './ops';
import { reflowBlocks } from './blocks';
import { layoutScene } from './layout';
import { cloneScene } from './scene';
import { describeChanges, isEmptyChange } from './summary';
import { emptyChanges, emptyScene, type ChangeSet, type Scene } from './types';

export type ChangeSource = 'voice' | 'text' | 'manual' | 'system';

export interface HistoryEntry {
  id: number;
  scene: Scene;
  /** What the change did, in the words of the agent or the UI. */
  label: string;
  /** Short diff, e.g. "+1 node, −1 connection". */
  diff: string;
  source: ChangeSource;
  /** What the user said or typed, if the change came from the agent. */
  request?: string;
  changes: ChangeSet;
  time: number;
  /** The change started a new diagram (created, opened or a new page): the diagram history tracks it from here. */
  origin?: boolean;
}

export interface ChangeMeta {
  source: ChangeSource;
  label?: string;
  request?: string;
  origin?: boolean;
}

type Listener = () => void;

export class DiagramStore {
  private entries: HistoryEntry[] = [];
  private index = -1;
  private listeners = new Set<Listener>();
  private nextId = 1;
  /** Incremented on every change, a stable snapshot for React. */
  revision = 0;
  selection: string[] = [];
  /** The last change, for highlighting what changed on the canvas. */
  lastChange: { changes: ChangeSet; time: number } | null = null;

  constructor(initial: Scene = emptyScene()) {
    this.push({ ...initial, blocks: initial.blocks ?? [] }, { source: 'system', label: 'New diagram', origin: true }, emptyChanges());
  }

  get scene(): Scene {
    return this.entries[this.index].scene;
  }

  get history(): readonly HistoryEntry[] {
    return this.entries;
  }

  get historyIndex(): number {
    return this.index;
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.entries.length - 1;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.revision++;
    for (const l of this.listeners) l();
  }

  private push(scene: Scene, meta: ChangeMeta, changes: ChangeSet) {
    // A change after an undo discards the undone entries, as in any editor
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push({
      id: this.nextId++,
      scene,
      label: meta.label ?? describeChanges(changes),
      diff: describeChanges(changes),
      source: meta.source,
      request: meta.request,
      changes,
      time: Date.now(),
      origin: meta.origin,
    });
    this.index = this.entries.length - 1;
    this.lastChange = { changes, time: Date.now() };
    this.selection = this.selection.filter((id) => scene.nodes.some((n) => n.id === id) || scene.blocks.some((b) => b.id === id));
  }

  /** Applies an edit; nothing changes if it is rejected. */
  edit(req: EditRequest, meta: ChangeMeta): EditResult {
    const prev = this.scene;
    const result = applyEdit(prev, req, { selection: this.selection });
    const metaChanged = result.scene.title !== prev.title ||
      result.scene.direction !== prev.direction ||
      result.scene.type !== prev.type ||
      (result.scene.subtitle ?? '') !== (prev.subtitle ?? '');
    if (result.ok && (!isEmptyChange(result.changes) || metaChanged)) {
      const fallbackLabel = isEmptyChange(result.changes) && result.scene.title !== prev.title
        ? (result.scene.title ? `Renamed to “${result.scene.title}”` : 'Cleared the title')
        : undefined;
      this.push(result.scene, { ...meta, label: meta.label ?? req.summary ?? fallbackLabel }, result.changes);
      this.emit();
    } else if (result.ok) {
      // Nothing to do (e.g. everything already existed): no history entry
      result.scene = prev;
    }
    return result;
  }

  /** Replaces the diagram with a new one, laid out from scratch. */
  async create(req: CreateRequest, meta: ChangeMeta): Promise<EditResult> {
    const prev = this.scene;
    const result = buildScene(req, prev.version);
    if (!result.ok) return result;
    await layoutScene(result.scene);
    // Texts and tables written before there was a diagram stay, beside it
    if (prev.nodes.length === 0 && prev.groups.length === 0 && prev.blocks.length > 0 && result.scene.blocks.length === 0) {
      result.scene.blocks = cloneScene(prev).blocks;
      if (!result.scene.title && prev.title) result.scene.title = prev.title;
      reflowBlocks(result.scene);
    } else if (result.scene.blocks.length > 0) {
      for (const b of result.scene.blocks) b.x = NaN;
      reflowBlocks(result.scene);
    }
    const changes = emptyChanges();
    changes.addedNodes = result.scene.nodes.map((n) => n.id);
    changes.addedEdges = result.scene.edges.map((e) => e.id);
    changes.addedGroups = result.scene.groups.map((g) => g.id);
    changes.addedBlocks = (req.blocks ?? []).length > 0 ? result.scene.blocks.map((b) => b.id) : [];
    result.changes = changes;
    this.selection = [];
    this.push(result.scene, { ...meta, origin: true, label: meta.label ?? (req.title ? `Created “${req.title}”` : 'Created the diagram') }, changes);
    this.emit();
    return result;
  }

  /** Lays the whole diagram out again (tidy up), optionally in another direction. */
  async relayout(meta: ChangeMeta, direction?: 'LR' | 'TB'): Promise<Scene> {
    const scene = cloneScene(this.scene);
    if (direction != null) scene.direction = direction;
    await layoutScene(scene);
    scene.version = this.scene.version + 1;
    const changes = emptyChanges();
    changes.movedNodes = scene.nodes.map((n) => n.id);
    // Text and tables keep their place unless the new layout covers them
    reflowBlocks(scene);
    this.push(scene, { ...meta, label: meta.label ?? 'Tidied up the layout' }, changes);
    this.emit();
    return scene;
  }

  /** Moves nodes that the user dragged (one history entry per drag). */
  moveNodes(positions: Map<string, { x: number; y: number }>) {
    const scene = cloneScene(this.scene);
    const changes = emptyChanges();
    let movedEmptyGroup = false;
    for (const n of scene.nodes) {
      const p = positions.get(n.id);
      if (p != null) {
        const nx = Math.round(p.x / 4) * 4;
        const ny = Math.round(p.y / 4) * 4;
        if (nx !== n.x || ny !== n.y) {
          n.x = nx;
          n.y = ny;
          changes.movedNodes.push(n.id);
        }
      }
    }
    for (const g of scene.groups) {
      const p = positions.get(`group:${g.id}`);
      if (p != null && g.box != null) {
        const gx = Math.round(p.x / 4) * 4;
        const gy = Math.round(p.y / 4) * 4;
        if (gx !== g.box.x || gy !== g.box.y) {
          g.box.x = gx;
          g.box.y = gy;
          changes.updatedGroups.push(g.id);
          movedEmptyGroup = true;
        }
      }
    }
    for (const b of scene.blocks) {
      const p = positions.get(`block:${b.id}`);
      if (p != null) {
        const bx = Math.round(p.x / 4) * 4;
        const by = Math.round(p.y / 4) * 4;
        if (bx !== b.x || by !== b.y) {
          b.x = bx;
          b.y = by;
          changes.updatedBlocks.push(b.id);
        }
      }
    }
    if (changes.movedNodes.length === 0 && !movedEmptyGroup && changes.updatedBlocks.length === 0) return;
    scene.version = this.scene.version + 1;
    const moved = changes.movedNodes.length + changes.updatedBlocks.length;
    const label = moved > 1
      ? `Moved ${moved} elements`
      : changes.movedNodes.length === 1
        ? 'Moved a node'
        : changes.updatedBlocks.length === 1
          ? (scene.blocks.find((b) => b.id === changes.updatedBlocks[0])?.kind === 'table' ? 'Moved a table' : 'Moved a text')
          : 'Moved a group';
    this.push(scene, { source: 'manual', label }, changes);
    this.lastChange = null; // no highlight for the user's own drag
    this.emit();
  }

  /** Replaces the whole document, e.g. when a file is opened. */
  load(scene: Scene, label = 'Opened a diagram', meta: Partial<ChangeMeta> = {}) {
    const changes = emptyChanges();
    changes.addedNodes = scene.nodes.map((n) => n.id);
    this.selection = [];
    this.push({ ...cloneScene({ ...scene, blocks: scene.blocks ?? [] }), version: this.scene.version + 1 },
      { source: 'system', label, ...meta, origin: true }, changes);
    this.lastChange = null;
    this.emit();
  }

  undo(steps = 1): boolean {
    if (!this.canUndo()) return false;
    const from = this.entries[this.index];
    this.index = Math.max(0, this.index - steps);
    this.lastChange = { changes: from.changes, time: Date.now() };
    this.emit();
    return true;
  }

  redo(steps = 1): boolean {
    if (!this.canRedo()) return false;
    this.index = Math.min(this.entries.length - 1, this.index + steps);
    this.lastChange = { changes: this.entries[this.index].changes, time: Date.now() };
    this.emit();
    return true;
  }

  /** Restores the diagram as it was after the given history entry, as a new entry. */
  restore(entryId: number) {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry == null || entry === this.entries[this.index]) return;
    const scene = { ...cloneScene(entry.scene), version: this.scene.version + 1 };
    this.push(scene, { source: 'manual', label: `Restored “${entry.label}”` }, emptyChanges());
    this.emit();
  }

  setSelection(ids: string[]) {
    const same = ids.length === this.selection.length && ids.every((id, i) => id === this.selection[i]);
    if (!same) {
      this.selection = ids;
      this.emit();
    }
  }
}
