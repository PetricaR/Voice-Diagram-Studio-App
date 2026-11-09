/**
 * Zoom and view controls (bottom left): zoom in / out, the zoom level with
 * presets, fit, zoom to the selection and the minimap, with the usual
 * shortcuts (⌘+ ⌘− ⌘0, ⇧1 fit, ⇧2 selection, M minimap). Also lets the voice
 * agent move the view ("zoom in", "focus on the database").
 */
import { useReactFlow, useViewport } from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isBlankScene } from '../engine/types';
import { flowId } from './canvas/DiagramCanvas';
import { FIT_OPTIONS } from './canvas/fit';
import { Icon, IconButton, useStoreRevision, useStudio } from './context';

const DURATION = 220;
const PRESETS = [0.5, 1, 1.5, 2];

export function ZoomControls({ minimap, setMinimap, hidden = false }: {
  minimap: boolean;
  setMinimap: (on: boolean) => void;
  /** The documentation tab covers the canvas: no buttons and no shortcuts (the agent can still move the view). */
  hidden?: boolean;
}) {
  const rf = useReactFlow();
  const { zoom } = useViewport();
  const { store, agent } = useStudio();
  useStoreRevision(store);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const empty = isBlankScene(store.scene);
  const pct = Math.round(zoom * 100);

  const fit = useCallback(() => {
    rf.fitView({ ...FIT_OPTIONS, duration: 400 });
  }, [rf]);
  const zoomTo = useCallback((z: number) => {
    rf.zoomTo(z, { duration: DURATION });
  }, [rf]);
  const focusFlowIds = useCallback((ids: string[]): boolean => {
    if (ids.length === 0) return false;
    rf.fitView({ nodes: ids.map((id) => ({ id })), padding: 0.35, maxZoom: 1.5, duration: 450 });
    return true;
  }, [rf]);
  const zoomToSelection = useCallback(
    () => focusFlowIds(rf.getNodes().filter((n) => n.selected).map((n) => n.id)),
    [rf, focusFlowIds]);

  // The voice agent moves the view through the same functions
  useEffect(() => {
    const view = {
      zoomIn: () => void rf.zoomIn({ duration: DURATION }),
      zoomOut: () => void rf.zoomOut({ duration: DURATION }),
      fit,
      actualSize: () => zoomTo(1),
      focus: (ids: string[]) => focusFlowIds(ids.map((id) => flowId(store.scene, id)).filter((x): x is string => x != null)),
    };
    agent.view = view;
    return () => {
      if (agent.view === view) agent.view = undefined;
    };
  }, [agent, rf, store, fit, zoomTo, focusFlowIds]);

  useEffect(() => {
    if (hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.altKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); // instead of the browser zoom
        rf.zoomIn({ duration: DURATION });
      } else if (mod && !e.altKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        rf.zoomOut({ duration: DURATION });
      } else if (mod && !e.altKey && e.key === '0') {
        e.preventDefault();
        zoomTo(1);
      } else if (!mod && e.shiftKey && !e.altKey && e.code === 'Digit1') {
        e.preventDefault();
        fit();
      } else if (!mod && e.shiftKey && !e.altKey && e.code === 'Digit2') {
        e.preventDefault();
        zoomToSelection();
      } else if (!mod && e.shiftKey && !e.altKey && e.code === 'Digit0') {
        e.preventDefault();
        zoomTo(1);
      } else if (!mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'm') {
        setMinimap(!minimap);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rf, fit, zoomTo, zoomToSelection, minimap, setMinimap, hidden]);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenu(false);
      }
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [menu]);

  const item = (label: string, run: () => void, shortcut?: string, disabled = false) => (
    <button type="button" role="menuitem" disabled={disabled} onClick={() => { run(); setMenu(false); }}>
      <span>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </button>
  );

  return (
    <div className="zoom-controls" role="toolbar" aria-label="Zoom and view" aria-orientation="vertical" hidden={hidden}>
      <IconButton icon="zoom_in" label="Zoom in" shortcut="⌘+" onClick={() => rf.zoomIn({ duration: DURATION })} />
      <div className="menu-anchor" ref={menuRef}>
        <button
          type="button"
          className="zoom-level"
          aria-haspopup="menu"
          aria-expanded={menu}
          aria-label={`Zoom ${pct} %, zoom options`}
          data-tooltip="Zoom options"
          onClick={() => setMenu(!menu)}
        >
          {pct}%
        </button>
        {menu && (
          <div className="menu zoom-menu" role="menu" aria-label="Zoom">
            {item('Zoom to fit', fit, '⇧1', empty)}
            {item('Zoom to selection', zoomToSelection, '⇧2', store.selection.length === 0)}
            <div className="menu-divider" />
            {PRESETS.map((z) => (
              <button key={z} type="button" role="menuitemradio" aria-checked={Math.abs(zoom - z) < 0.005}
                onClick={() => { zoomTo(z); setMenu(false); }}>
                <span>{z * 100}%</span>
                {z === 1 && <kbd>⌘0</kbd>}
                {Math.abs(zoom - z) < 0.005 && <Icon name="check" size={18} />}
              </button>
            ))}
            <div className="menu-divider" />
            {item(minimap ? 'Hide minimap' : 'Show minimap', () => setMinimap(!minimap), 'M')}
          </div>
        )}
      </div>
      <IconButton icon="zoom_out" label="Zoom out" shortcut="⌘−" onClick={() => rf.zoomOut({ duration: DURATION })} />
      <span className="zoom-divider" />
      <IconButton icon="fit_screen" label="Fit to screen" shortcut="⇧1" disabled={empty} onClick={fit} />
      <IconButton icon="filter_center_focus" label="Zoom to selection" shortcut="⇧2" disabled={store.selection.length === 0} onClick={zoomToSelection} />
      <IconButton icon="map" label={minimap ? 'Hide minimap' : 'Show minimap'} shortcut="M" selected={minimap} onClick={() => setMinimap(!minimap)} />
    </div>
  );
}
