/**
 * The canvas: renders the scene with React Flow. The store is the single
 * source of truth; React Flow is fully controlled. Position changes coming
 * from the store (insertions that make room, tidy up, undo) are animated so
 * the eye can follow them; new and changed elements are briefly highlighted.
 */
import {
  Background, BackgroundVariant, ConnectionMode, MiniMap, ReactFlow, useReactFlow, useStoreApi,
  type Connection, type Edge, type Node, type NodeChange, type OnDelete, type OnNodeDrag,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { routeEdge, type Pt } from '../../engine/routing';
import { groupAndDescendants, groupBounds, groupDepth, sceneBounds, union } from '../../engine/scene';
import { hasDiagram, type ColorName, type Rect, type Scene } from '../../engine/types';
import type { Viewport } from '../../engine/workspace';
import { useStoreRevision, useStudio } from '../context';
import { titleOrigin } from '../export';
import { kindColor } from '../theme';
import { FIT_OPTIONS } from './fit';
import { captureViewport, registerImageExporter } from './imageExport';
import { EdgeMarkers, FloatingEdge, type FloatingEdgeType } from './FloatingEdge';
import { GroupNode, type GroupNodeType } from './GroupNode';
import { ShapeNode, type Highlight, type ShapeNodeType } from './ShapeNode';
import { TitleNode, type TitleNodeType } from './TitleNode';

const nodeTypes = { shape: ShapeNode, group: GroupNode, title: TitleNode };
const edgeTypes = { floating: FloatingEdge };
const G = 'group:';
const TITLE = 'title:';

/** The id React Flow uses for a node or group of the scene (documentation chapters are not on the canvas). */
export function flowId(scene: Scene, id: string): string | null {
  if (scene.nodes.some((n) => n.id === id)) return id;
  if (scene.groups.some((g) => g.id === id)) return G + id;
  return null;
}

/** Everything that is drawn on the page, the title included. */
export function viewBounds(scene: Scene): Rect | null {
  const b = sceneBounds(scene);
  if (b == null || !scene.title) return b;
  const t = titleOrigin(scene);
  return union(b, { x: t.x, y: t.y, w: Math.min(b.w, scene.title.length * 13), h: 40 });
}

type Pos = { x: number; y: number };
type PosMap = Map<string, Pos>;

const positionsOf = (scene: Scene): PosMap => new Map(scene.nodes.map((n) => [n.id, { x: n.x, y: n.y }] as [string, Pos]));

// Emphasized decelerate easing (Material 3 motion)
const ease = (t: number) => 1 - Math.pow(1 - t, 3.2);
const DURATION = 360;
const HIGHLIGHT_MS = 2600;

/** Positions shown on screen: animates from the previous ones to the scene's. */
function useAnimatedPositions(scene: Scene, frozen: boolean): PosMap {
  const [shown, setShown] = useState<PosMap>(() => positionsOf(scene));
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const frame = useRef(0);

  useEffect(() => {
    const target = positionsOf(scene);
    const from = shownRef.current;
    cancelAnimationFrame(frame.current);
    const moving = [...target].filter(([id, p]) => {
      const f = from.get(id);
      return f != null && (f.x !== p.x || f.y !== p.y);
    });
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (frozen || moving.length === 0 || reduced) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const k = ease(t);
      const next: PosMap = new Map(target);
      for (const [id, p] of moving) {
        const f = from.get(id)!;
        next.set(id, { x: f.x + (p.x - f.x) * k, y: f.y + (p.y - f.y) * k });
      }
      setShown(next);
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return shown;
}

export function DiagramCanvas({ onEmptyChange, viewport, onLeave, minimap = false, hidden = false }: {
  onEmptyChange?: (empty: boolean) => void;
  /** Covered by the documentation tab: no keyboard shortcuts. */
  hidden?: boolean;
  /** Where the view was when this page was last shown. */
  viewport?: Viewport;
  /** Called with the view when the page is left. */
  onLeave?: (v: Viewport) => void;
  minimap?: boolean;
}) {
  const { store, notify } = useStudio();
  useStoreRevision(store);
  const scene = store.scene;
  const selection = store.selection;
  const rf = useReactFlow();
  const flowStore = useStoreApi();
  // While a picture is taken: no selection, toolbar or change highlights
  const [exporting, setExporting] = useState(false);

  const [drag, setDrag] = useState<PosMap>(new Map());
  const dragStart = useRef<{ group?: string; origin: Pos; members: PosMap } | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<{ nodes: Map<string, Highlight>; edges: Set<string>; groups: Map<string, Highlight> }>(
    { nodes: new Map(), edges: new Set(), groups: new Map() });

  const shown = useAnimatedPositions(scene, drag.size > 0);
  const positions = useMemo(() => {
    if (drag.size === 0) return shown;
    const merged = new Map(shown);
    for (const [id, p] of drag) merged.set(id, p);
    return merged;
  }, [shown, drag]);

  useEffect(() => onEmptyChange?.(!hasDiagram(scene)), [scene, onEmptyChange]);

  // Highlight what the last change added or changed
  const lastChange = store.lastChange;
  useEffect(() => {
    if (lastChange == null) return;
    const c = lastChange.changes;
    // A new diagram is not highlighted as a whole, it just appears
    if (c.addedNodes.length > 0 && c.addedNodes.length === store.scene.nodes.length) return;
    const nodes = new Map<string, Highlight>();
    c.updatedNodes.forEach((id) => nodes.set(id, 'updated'));
    c.addedNodes.forEach((id) => nodes.set(id, 'added'));
    const groups = new Map<string, Highlight>();
    c.updatedGroups.forEach((id) => groups.set(id, 'updated'));
    c.addedGroups.forEach((id) => groups.set(id, 'added'));
    if (nodes.size + groups.size + c.addedEdges.length + c.updatedEdges.length === 0) return;
    setHighlight({ nodes, edges: new Set([...c.addedEdges, ...c.updatedEdges]), groups });
    const t = setTimeout(() => setHighlight({ nodes: new Map(), edges: new Set(), groups: new Map() }), HIGHLIGHT_MS);
    return () => clearTimeout(t);
  }, [lastChange, store]);

  // Keep new content in view: fit when the diagram was created or laid out,
  // when any part of the diagram extends outside the visible area, or when the
  // canvas container resizes (e.g. opening the Activity side-sheet)
  const fitSceneToContainer = useCallback((duration = 400) => {
    const b = viewBounds(store.scene);
    if (b == null) return;
    const container = document.querySelector('.react-flow');
    if (container == null) {
      rf.fitView({ ...FIT_OPTIONS, duration });
      return;
    }
    const cw = container.clientWidth || 1280;
    const ch = container.clientHeight || 800;
    const pad = { top: 56, bottom: 144, left: 80, right: 56 };
    const availW = Math.max(200, cw - pad.left - pad.right);
    const availH = Math.max(200, ch - pad.top - pad.bottom);
    const zoom = Math.min(FIT_OPTIONS.maxZoom, availW / Math.max(1, b.w), availH / Math.max(1, b.h));
    const x = pad.left + availW / 2 - (b.x + b.w / 2) * zoom;
    const y = pad.top + availH / 2 - (b.y + b.h / 2) * zoom;
    rf.setViewport({ x, y, zoom }, { duration });
  }, [store, rf]);

  // A page that was shown before opens where it was left, a new one fitted
  const lastFit = useRef<number>(viewport != null ? store.history[store.historyIndex]?.id ?? -1 : -1);
  useEffect(() => {
    if (viewport != null) {
      rf.setViewport(viewport);
    } else if (hasDiagram(store.scene)) {
      lastFit.current = store.history[store.historyIndex]?.id ?? -1;
      const t = setTimeout(() => fitSceneToContainer(0), 30);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const leave = useRef(onLeave);
  leave.current = onLeave;
  useEffect(() => () => leave.current?.(rf.getViewport()), [rf]);

  useEffect(() => {
    const entry = store.history[store.historyIndex];
    if (entry == null || lastFit.current === entry.id || !hasDiagram(scene)) return;
    lastFit.current = entry.id;
    const b = viewBounds(scene);
    if (b == null) return;
    const created = (scene.nodes.length > 0 && (entry.changes.addedNodes.length === scene.nodes.length ||
      entry.changes.movedNodes.length === scene.nodes.length)) || (entry.origin === true);
    const el = document.querySelector('.react-flow');
    let outside = false;
    if (el != null) {
      const r = el.getBoundingClientRect();
      const tl = rf.screenToFlowPosition({ x: r.left + 16, y: r.top + 16 });
      const br = rf.screenToFlowPosition({ x: r.right - 16, y: r.bottom - 120 });
      outside = b.x < tl.x || b.y < tl.y || b.x + b.w > br.x || b.y + b.h > br.y;
    }
    if (created || outside) {
      const timer = setTimeout(() => fitSceneToContainer(400), 40);
      return () => clearTimeout(timer);
    }
  }, [store, scene, rf, fitSceneToContainer]);

  useEffect(() => {
    const el = document.querySelector('.react-flow');
    if (el == null || typeof ResizeObserver === 'undefined') return;
    let prevW = el.clientWidth;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (Math.abs(w - prevW) > 32) {
        prevW = w;
        if (hasDiagram(store.scene)) fitSceneToContainer(260);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [store, fitSceneToContainer]);

  const onEditLabel = useCallback((id: string, label: string | null) => {
    setEditing(null);
    const node = store.scene.nodes.find((n) => n.id === id);
    if (label == null || node == null || label.trim() === '' || label.trim() === node.label) return;
    store.edit({ update_nodes: [{ id, label: label.trim() }] }, { source: 'manual', label: `Renamed to “${label.trim()}”` });
  }, [store]);
  const onColor = useCallback((id: string, color: ColorName | 'none') => {
    store.edit({ update_nodes: [{ id, color }] }, { source: 'manual', label: color === 'none' ? 'Reset the color' : `Colored ${color}` });
  }, [store]);
  const onDeleteNode = useCallback((id: string) => {
    store.edit({ remove_nodes: [id], confirm_large_removal: true }, { source: 'manual', label: 'Removed a node' });
  }, [store]);
  const onRenameTitle = useCallback((title: string | null) => {
    const t = title?.trim();
    if (t == null || t === '' || t === store.scene.title) return;
    store.edit({ title: t }, { source: 'manual', label: `Renamed to “${t}”` });
  }, [store]);

  const sceneWithShown = useMemo<Scene>(() => ({
    ...scene,
    nodes: scene.nodes.map((n) => ({ ...n, ...(positions.get(n.id) ?? {}) })),
    groups: scene.groups.map((g) => {
      const gp = positions.get(G + g.id);
      return gp != null && g.box != null ? { ...g, box: { ...g.box, x: gp.x, y: gp.y } } : g;
    }),
  }), [scene, positions]);

  const shownGroupBounds = useMemo(() => groupBounds(sceneWithShown), [sceneWithShown]);

  const nodes = useMemo(() => {
    const result: Node[] = [];
    const bounds = shownGroupBounds;
    const groups = [...scene.groups].sort((a, b) => groupDepth(scene, a) - groupDepth(scene, b));
    for (const g of groups) {
      const b = bounds.get(g.id);
      if (b == null) continue;
      const depth = groupDepth(scene, g);
      result.push({
        id: G + g.id,
        type: 'group',
        position: { x: b.x, y: b.y },
        data: { group: g, w: b.w, h: b.h, depth, highlight: exporting ? undefined : highlight.groups.get(g.id) },
        selected: !exporting && selectedGroups.includes(g.id),
        zIndex: depth,
        // Known sizes: React Flow keeps the nodes visible instead of re-measuring
        width: b.w,
        height: b.h,
        measured: { width: b.w, height: b.h },
        style: { width: b.w, height: b.h },
        connectable: false,
      } satisfies GroupNodeType);
    }
    const single = selection.length === 1;
    for (const n of sceneWithShown.nodes) {
      result.push({
        id: n.id,
        type: 'shape',
        position: { x: n.x, y: n.y },
        data: {
          node: n, highlight: exporting ? undefined : highlight.nodes.get(n.id), editing: !exporting && editing === n.id, single,
          onEditLabel, onStartEdit: setEditing, onColor, onDelete: onDeleteNode,
        },
        selected: !exporting && selection.includes(n.id),
        zIndex: 100,
        width: n.w,
        height: n.h,
        measured: { width: n.w, height: n.h },
        style: { width: n.w, height: n.h },
      } satisfies ShapeNodeType);
    }
    if (sceneWithShown.title && hasDiagram(sceneWithShown)) {
      const o = titleOrigin(sceneWithShown);
      const w = Math.max(240, Math.min(1200, sceneWithShown.title.length * 15 + 32));
      const h = sceneWithShown.subtitle ? 64 : 40;
      result.push({
        id: TITLE + 'main',
        type: 'title',
        position: o,
        data: { title: sceneWithShown.title, subtitle: sceneWithShown.subtitle, onRename: onRenameTitle },
        selectable: false,
        draggable: false,
        connectable: false,
        focusable: false,
        zIndex: 1,
        width: w,
        height: h,
        measured: { width: w, height: h },
        style: { width: w, height: h },
      } satisfies TitleNodeType);
    }
    return result;
  }, [scene, sceneWithShown, shownGroupBounds, selection, selectedGroups, highlight, editing, onEditLabel, onColor, onDeleteNode,
    onRenameTitle, exporting]);

  // Edges are routed around all nodes and group borders at their shown positions
  const edges = useMemo(() => {
    const rects = new Map(sceneWithShown.nodes.map((n) => [n.id, { x: n.x, y: n.y, w: n.w, h: n.h }]));
    const groupRects = [...shownGroupBounds.values()];
    const centered = new Set(scene.nodes.filter((n) => n.kind === 'decision').map((n) => n.id));
    const pairs = new Map<string, string[]>();
    for (const e of scene.edges) {
      const key = [e.from, e.to].sort().join('|');
      pairs.set(key, [...(pairs.get(key) ?? []), e.id]);
    }
    const result: FloatingEdgeType[] = [];
    const used = new Map<string, number>();
    const routed: Pt[][] = [];
    const labels: Pt[] = [];
    for (const e of scene.edges) {
      const s = rects.get(e.from);
      const t = rects.get(e.to);
      if (s == null || t == null) continue;
      const obstacles = [...rects].filter(([id]) => id !== e.from && id !== e.to).map(([, r]) => r);
      // Parallel connections between the same nodes are spread apart
      const siblings = pairs.get([e.from, e.to].sort().join('|'))!;
      const shift = (siblings.indexOf(e.id) - (siblings.length - 1) / 2) * 16;
      const route = routeEdge(
        s,
        t,
        obstacles,
        shift,
        { used, from: e.from, to: e.to },
        {
          sourceCentered: centered.has(e.from),
          targetCentered: centered.has(e.to),
          groups: groupRects,
          routed,
          labels,
        },
      );
      routed.push(route.points);
      if (e.label) labels.push(route.label);
      result.push({
        id: e.id,
        source: e.from,
        target: e.to,
        type: 'floating',
        data: { edge: e, route, highlight: !exporting && highlight.edges.has(e.id) },
        selected: !exporting && selectedEdges.includes(e.id),
        zIndex: 50,
      });
    }
    return result;
  }, [scene, sceneWithShown, shownGroupBounds, highlight, selectedEdges, exporting]);

  // The canvas on screen takes the pictures for Export → PNG / SVG / Copy
  useEffect(() => registerImageExporter(async (format) => {
    setExporting(true);
    try {
      // Two frames: React renders without the selection, then the browser paints it
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const viewportEl = flowStore.getState().domNode?.querySelector<HTMLElement>('.react-flow__viewport');
      const drawn = rf.getNodes().filter((n) => !n.hidden && n.width != null && n.height != null);
      if (viewportEl == null || drawn.length === 0) throw new Error('There is no diagram on this page to export.');
      const x = Math.min(...drawn.map((n) => n.position.x));
      const y = Math.min(...drawn.map((n) => n.position.y));
      const w = Math.max(...drawn.map((n) => n.position.x + (n.width ?? 0))) - x;
      const h = Math.max(...drawn.map((n) => n.position.y + (n.height ?? 0))) - y;
      return await captureViewport(viewportEl, { x, y, w, h }, format);
    } finally {
      setExporting(false);
    }
  }), [rf, flowStore]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    let sel: Set<string> | null = null;
    let gsel: Set<string> | null = null;
    let nextDrag: PosMap | null = null;
    for (const c of changes) {
      if (c.type === 'select') {
        if (c.id.startsWith(TITLE)) continue;
        if (c.id.startsWith(G)) {
          gsel ??= new Set(selectedGroups);
          if (c.selected) gsel.add(c.id.slice(G.length)); else gsel.delete(c.id.slice(G.length));
        } else {
          sel ??= new Set(store.selection);
          if (c.selected) sel.add(c.id); else sel.delete(c.id);
        }
      } else if (c.type === 'position' && c.position != null) {
        nextDrag ??= new Map(drag);
        const start = dragStart.current;
        if (c.id.startsWith(G) && start?.group === c.id.slice(G.length)) {
          if (start.members.size === 0) {
            nextDrag.set(c.id, c.position);
          } else {
            const dx = c.position.x - start.origin.x;
            const dy = c.position.y - start.origin.y;
            for (const [id, p] of start.members) nextDrag.set(id, { x: p.x + dx, y: p.y + dy });
          }
        } else if (!c.id.startsWith(G)) {
          nextDrag.set(c.id, c.position);
        }
      }
    }
    if (sel != null) store.setSelection([...sel]);
    if (gsel != null) setSelectedGroups([...gsel]);
    if (nextDrag != null) setDrag(nextDrag);
  }, [store, drag, selectedGroups]);

  const onEdgesChange = useCallback((changes: { type: string; id: string; selected?: boolean }[]) => {
    let sel: Set<string> | null = null;
    for (const c of changes) {
      if (c.type === 'select') {
        sel ??= new Set(selectedEdges);
        if (c.selected) sel.add(c.id); else sel.delete(c.id);
      }
    }
    if (sel != null) setSelectedEdges([...sel]);
  }, [selectedEdges]);

  const onNodeDragStart: OnNodeDrag = useCallback((_e, node) => {
    if (node.id.startsWith(G)) {
      const gid = node.id.slice(G.length);
      const family = groupAndDescendants(store.scene, gid);
      const members: PosMap = new Map();
      for (const n of store.scene.nodes) {
        if (n.group != null && family.has(n.group)) members.set(n.id, positions.get(n.id) ?? { x: n.x, y: n.y });
      }
      dragStart.current = { group: gid, origin: { ...node.position }, members };
    } else {
      dragStart.current = { origin: { ...node.position }, members: new Map() };
    }
  }, [store, positions]);

  const onNodeDragStop: OnNodeDrag = useCallback(() => {
    dragStart.current = null;
    if (drag.size > 0) {
      const moved = new Map(drag);
      setDrag(new Map());
      store.moveNodes(moved);
    }
  }, [drag, store]);

  const onConnect = useCallback((c: Connection) => {
    if (c.source == null || c.target == null || c.source === c.target) return;
    const r = store.edit({ add_edges: [{ from: c.source, to: c.target }] }, { source: 'manual', label: 'Connected two nodes' });
    if (!r.ok) notify(r.errors[0]);
  }, [store, notify]);

  const onDelete: OnDelete<Node, Edge> = useCallback(({ nodes: delNodes, edges: delEdges }) => {
    const nodeIds = delNodes.filter((n) => n.type === 'shape').map((n) => n.id);
    const groupIds = delNodes.filter((n) => n.id.startsWith(G)).map((n) => n.id.slice(G.length));
    const edgeRefs = delEdges.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
      .map((e) => ({ from: e.source, to: e.target, label: (e.data as { edge?: { label?: string } } | undefined)?.edge?.label }));
    if (nodeIds.length + groupIds.length + edgeRefs.length === 0) return;
    const r = store.edit({ remove_nodes: nodeIds, remove_groups: groupIds, remove_edges: edgeRefs, confirm_large_removal: true },
      { source: 'manual', label: 'Deleted the selection' });
    if (r.ok) {
      setSelectedEdges([]);
      setSelectedGroups([]);
      notify('Deleted', { label: 'Undo', run: () => store.undo() });
    }
  }, [store, notify]);

  // Enter renames the selected node; Escape clears group/edge selection
  useEffect(() => {
    if (hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      if (e.key === 'Enter' && store.selection.length === 1) {
        e.preventDefault();
        setEditing(store.selection[0]);
      } else if (e.key === 'Escape') {
        setSelectedGroups([]);
        setSelectedEdges([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, hidden]);

  return (
    <>
      <EdgeMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange as never}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={hidden ? null : ['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Shift', 'Control']}
        selectionOnDrag={false}
        panOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.15}
        maxZoom={2.5}
        fitView={viewport == null}
        fitViewOptions={FIT_OPTIONS}
        elevateNodesOnSelect={false}
        nodeDragThreshold={2}
        aria-label="Diagram canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} className="canvas-bg" />
        {minimap && (
          <MiniMap
            pannable
            zoomable
            ariaLabel="Minimap"
            className="minimap"
            position="bottom-right"
            nodeBorderRadius={6}
            nodeClassName={(n) => n.type === 'shape'
              ? `mm-node color-${(n.data as ShapeNodeType['data']).node.color ?? kindColor((n.data as ShapeNodeType['data']).node.kind)}`
              : n.type === 'group' ? 'mm-group' : 'mm-hidden'}
          />
        )}
      </ReactFlow>
    </>
  );
}
