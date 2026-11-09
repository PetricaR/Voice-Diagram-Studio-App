import { ReactFlowProvider } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { VoiceAgent } from '../agent/session';
import { Workspace, type LibraryEntry, type SavedWorkspace } from '../engine/workspace';
import { fetchKeyStatus, type KeyStatus } from '../voice/liveToken';
import { DiagramCanvas } from './canvas/DiagramCanvas';
import { StudioContext, useStudio, type Studio } from './context';
import { DocView } from './DocView';
import { EmptyState } from './EmptyState';
import { download, fileName, fromJson, normalizeScene, pagesToJson } from './export';
import { PageTabs } from './PageTabs';
import { loadSettings, saveSettings, type Settings } from './settings';
import { SettingsDialog } from './SettingsDialog';
import { SidePanel, type PanelTab } from './SidePanel';
import { applyTheme } from './theme';
import { TopBar } from './TopBar';
import { VoiceDock } from './VoiceDock';
import { ZoomControls } from './ZoomControls';

const WORKSPACE_KEY = 'studio.workspace';
const LIBRARY_KEY = 'studio.library';
/** Single diagram saved by earlier versions. */
const LEGACY_KEY = 'studio.scene';
const UI_KEY = 'studio.ui';

/** The pages and the diagram history saved by the last session, if any. */
function savedWorkspace(): SavedWorkspace | null {
  try {
    const lib = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? '[]');
    const library: LibraryEntry[] = (Array.isArray(lib) ? lib : []).flatMap((e: any) => {
      const scene = normalizeScene(e?.scene);
      return scene != null && typeof e.id === 'string' ? [{ ...e, scene } as LibraryEntry] : [];
    });
    const text = localStorage.getItem(WORKSPACE_KEY);
    if (text) {
      const data = JSON.parse(text);
      const pages = (Array.isArray(data?.pages) ? data.pages : []).flatMap((p: any) => {
        const scene = normalizeScene(p?.scene);
        return scene != null && typeof p.id === 'string' ? [{ id: p.id, scene, diagram: p.diagram, view: p.view, chapter: p.chapter }] : [];
      });
      if (pages.length > 0) return { version: 2, active: data.active, pages, library };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    const scene = legacy ? fromJson(legacy) : null;
    if (scene != null) return { version: 2, active: 'page_1', pages: [{ id: 'page_1', scene }], library };
    return library.length > 0 ? { version: 2, active: '', pages: [], library } : null;
  } catch {
    return null;
  }
}

interface UiPrefs {
  panelOpen: boolean;
  panelTab: PanelTab;
  minimap: boolean;
}

function loadPrefs(): UiPrefs {
  const defaults: UiPrefs = { panelOpen: typeof window !== 'undefined' && window.innerWidth >= 1100, panelTab: 'diagrams', minimap: false };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(UI_KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

function Snackbar({ toast, onDone }: { toast: Toast | null; onDone: () => void }) {
  useEffect(() => {
    if (toast == null) return;
    const t = setTimeout(onDone, toast.action ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (toast == null) return null;
  return (
    <div className="snackbar" role="status" key={toast.id}>
      <span>{toast.message}</span>
      {toast.action && (
        <button type="button" className="text-btn inverse" onClick={() => { toast.action!.run(); onDone(); }}>
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

/** Global shortcuts: undo/redo, Space to talk, / to type (zoom shortcuts are in ZoomControls). */
function Shortcuts({ focusComposer }: { focusComposer: () => void }) {
  const { store, workspace, toggleVoice } = useStudio();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo(); else store.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
      } else if (e.key === ' ' && !mod && !e.repeat) {
        e.preventDefault();
        toggleVoice();
      } else if (e.key === '/') {
        e.preventDefault();
        focusComposer();
      } else if (e.key === 'Escape' && workspace.view !== 'doc') {
        // In the documentation the open chapter stays selected ("this chapter")
        store.setSelection([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, workspace, toggleVoice, focusComposer]);
  return null;
}

export function App() {
  const workspace = useMemo(() => new Workspace(savedWorkspace()), []);
  // Re-render when another page is shown (each page has its own canvas state)
  const activeId = useSyncExternalStore((l) => workspace.subscribe(l), () => workspace.activeId);
  // The documentation tab of the page is shown over its canvas
  const docOpen = useSyncExternalStore((l) => workspace.subscribe(l), () => workspace.view === 'doc');
  const page = workspace.active;
  const store = page.store;
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const agent = useMemo(() => new VoiceAgent(workspace, () => settingsRef.current), [workspace]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<UiPrefs>(loadPrefs);
  // Bumped by "/" to focus the request field of the dock
  const [focusRequest, setFocusRequest] = useState(0);
  const focusComposer = useCallback(() => setFocusRequest((n) => n + 1), []);
  const [empty, setEmpty] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastId = useRef(0);

  useEffect(() => applyTheme(settings.seedColor, settings.themeMode), [settings.seedColor, settings.themeMode]);

  const updatePrefs = useCallback((patch: Partial<UiPrefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem(UI_KEY, JSON.stringify(next));
      } catch {
        // not persisted
      }
      return next;
    });
  }, []);

  // Every change is saved in this browser: the pages, and the diagram history
  useEffect(() => {
    let timer = 0;
    // Said once until a save succeeds again, not after every change
    let warned = false;
    const save = () => {
      try {
        const data = workspace.serialize();
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ version: 2, active: data.active, pages: data.pages }));
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(data.library));
        localStorage.removeItem(LEGACY_KEY);
        warned = false;
      } catch {
        // Storage full or unavailable (private window): the work would be lost on reload
        if (warned) return;
        warned = true;
        const exportPages = () => {
          const pages = workspace.pages.map((p) => p.store.scene);
          download(fileName(pages[0], 'json'), pagesToJson(pages), 'application/json');
        };
        setToast({
          id: ++toastId.current,
          message: 'Changes can no longer be saved in this browser (storage is full). Export the pages to keep them.',
          action: { label: 'Export', run: exportPages },
        });
      }
    };
    const unsubscribe = workspace.subscribe(() => {
      clearTimeout(timer);
      timer = window.setTimeout(save, 400);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [workspace]);

  useEffect(() => () => agent.stop(), [agent]);

  const notify = useCallback((message: string, action?: Toast['action']) => {
    setToast({ id: ++toastId.current, message, action });
  }, []);

  // A closed page (by hand or by voice) can be brought back
  useEffect(() => workspace.onPageRemoved((r) => {
    const title = r.page.store.scene.title;
    notify(title ? `Closed “${title}”` : 'Closed the page', { label: 'Undo', run: () => workspace.restorePage(r) });
  }), [workspace, notify]);

  // For automated UI tests in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as { __studio: unknown }).__studio = {
        workspace, agent,
        get store() {
          return workspace.store;
        },
      };
    }
  }, [workspace, agent]);

  // The key stays on the studio server; the page only learns whether there is one
  const [liveKey, setLiveKey] = useState<KeyStatus>('unknown');
  const liveKeyRef = useRef(liveKey);
  liveKeyRef.current = liveKey;
  const refreshLiveKey = useCallback(() => {
    fetchKeyStatus().then(setLiveKey).catch(() => undefined);
  }, []);
  useEffect(refreshLiveKey, [refreshLiveKey]);

  const setSettings = useCallback((s: Settings) => {
    const restart = agent.active && (s.model !== settingsRef.current.model ||
      s.voice !== settingsRef.current.voice || s.silenceDurationMs !== settingsRef.current.silenceDurationMs);
    setSettingsState(s);
    saveSettings(s);
    if (restart) {
      agent.stop();
      notify('Settings saved. Start talking again to use them.');
    }
  }, [agent, notify]);

  const toggleVoice = useCallback(() => {
    if (agent.snapshot.micOn || agent.snapshot.status === 'connecting') {
      agent.stop();
      return;
    }
    if (liveKeyRef.current === 'missing') {
      setSettingsOpen(true);
      notify('Add a Gemini API key to the studio server to start talking.');
      return;
    }
    agent.start(true).catch(() => undefined);
  }, [agent, notify]);

  // Errors of the voice session are shown in the dock (with Settings or Try again);
  // a key problem also re-checks whether the server has a key
  useEffect(() => {
    let last: string | null = null;
    return agent.subscribe(() => {
      const s = agent.snapshot;
      const error = s.status === 'error' ? s.error : null;
      if (error && error !== last && /key/i.test(error)) refreshLiveKey();
      last = error;
    });
  }, [agent, refreshLiveKey]);

  const studio: Studio = useMemo(() => ({
    workspace, store, agent, settings, setSettings, liveKey, refreshLiveKey, notify, toggleVoice,
    openSettings: () => setSettingsOpen(true),
  }), [workspace, store, agent, settings, setSettings, liveKey, refreshLiveKey, notify, toggleVoice]);

  const togglePanel = useCallback(() => updatePrefs({ panelOpen: !prefs.panelOpen }), [prefs.panelOpen, updatePrefs]);

  return (
    <StudioContext.Provider value={studio}>
      <ReactFlowProvider>
        <div className={`app${prefs.panelOpen ? ' with-sheet' : ''}`}>
          <TopBar panelOpen={prefs.panelOpen} togglePanel={togglePanel} />
          <PageTabs />
          <main className="workspace">
            <div className="canvas">
              <div className="canvas-layer" inert={docOpen}>
                <DiagramCanvas
                  key={activeId}
                  viewport={page.viewport}
                  onLeave={(v) => { page.viewport = v; }}
                  minimap={prefs.minimap}
                  onEmptyChange={setEmpty}
                  hidden={docOpen}
                />
              </div>
              {empty && !docOpen && <EmptyState />}
              <ZoomControls minimap={prefs.minimap} setMinimap={(minimap) => updatePrefs({ minimap })} hidden={docOpen} />
              {docOpen && <DocView key={activeId} />}
              <VoiceDock focusRequest={focusRequest} />
              <Snackbar toast={toast} onDone={() => setToast(null)} />
            </div>
            {prefs.panelOpen && (
              <SidePanel tab={prefs.panelTab} setTab={(panelTab) => updatePrefs({ panelTab })} onClose={() => updatePrefs({ panelOpen: false })} />
            )}
          </main>
          <Shortcuts focusComposer={focusComposer} />
          <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      </ReactFlowProvider>
    </StudioContext.Provider>
  );
}
