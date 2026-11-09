/**
 * The side panel on the right:
 * - Diagrams: every diagram that was generated (with a live thumbnail, request and page link)
 * - Changes: change history of the current page
 * - Catalog: RAG Technical Blueprints (6 AI Agent categories + Architecture Center),
 *   multi-cloud architecture components, and all 261 official Google Cloud SVG icons.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AGENT_CATEGORY_LABELS,
  BLUEPRINT_CATALOG,
  COMPONENT_CATALOG,
  LAYER_LABELS,
  loadAllBlueprints,
  searchBlueprints,
  searchComponents,
  type BlueprintEntry,
  type ComponentEntry,
} from '../engine/catalog';
import { DiagramStore } from '../engine/store';
import type { LibraryEntry } from '../engine/workspace';
import { ActivityList, timeAgo } from './ActivityPanel';
import { Icon, IconButton, useStudio, useWorkspaceRevision } from './context';
import { ALL_GCP_ICONS, resolveGcpIconUrl, searchGcpIcons, type GcpIconEntry } from './gcpIcons';
import { resolveNodeIcon, type IconName } from './icons';
import { Thumbnail } from './Thumbnail';

export type PanelTab = 'diagrams' | 'changes' | 'catalog';
type CatalogFilter = 'all' | 'blueprints' | 'components' | 'gcp-icons';

const TYPE_LABEL: Record<string, string> = {
  architecture: 'Architecture', flowchart: 'Flowchart', c4: 'C4', network: 'Network', generic: 'Diagram',
};

const GROUP_BADGE: Record<GcpIconEntry['group'], string> = {
  core: 'Core SVG',
  category: 'Category SVG',
  products: 'Product SVG',
};

function EntryMenu({ entry, open, onClose }: { entry: LibraryEntry; open: boolean; onClose: () => void }) {
  const { workspace, notify } = useStudio();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const close = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!ref.current?.contains(t) && !t.closest?.('.history-more')) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="menu history-menu" role="menu" ref={ref}>
      <button type="button" role="menuitem" onClick={() => {
        workspace.addPage({ scene: entry.scene, label: `Copied “${entry.title}” from the history` });
        onClose();
      }}>
        <Icon name="content_copy" size={20} /><span>Open a copy on a new page</span>
      </button>
      <button type="button" role="menuitem" onClick={() => {
        const removed = workspace.removeEntry(entry.id);
        onClose();
        if (removed) notify(`Removed “${entry.title}” from the history`, { label: 'Undo', run: () => workspace.restoreEntry(removed) });
      }}>
        <Icon name="delete" size={20} /><span>Remove from history</span>
      </button>
    </div>
  );
}

function DiagramHistory() {
  const { workspace } = useStudio();
  useWorkspaceRevision(workspace);
  const [menu, setMenu] = useState<string | null>(null);
  const entries = workspace.library;
  const activeEntry = workspace.entryOfPage(workspace.activeId)?.id;

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <Icon name="library_books" size={32} />
        <p>Every diagram you create by voice, by typing or from a blueprint appears here, kept up to date as you edit it.</p>
      </div>
    );
  }
  return (
    <ol className="history-list" aria-label="Generated diagrams">
      {entries.map((e) => {
        const page = workspace.pageOfEntry(e.id);
        const nodes = e.scene.nodes.length;
        const blocks = e.scene.blocks.length;
        return (
          <li key={e.id} className={`history-card${page ? ' open' : ''}${e.id === activeEntry ? ' current' : ''}`}>
            <button
              type="button"
              className="history-open"
              onClick={() => workspace.openEntry(e.id)}
              aria-current={e.id === activeEntry ? 'page' : undefined}
              aria-label={`${e.title}${page ? ', open' : ''}. ${page ? 'Show its page' : 'Open it on a new page'}`}
            >
              <Thumbnail scene={e.scene} />
              <span className="history-body">
                <span className="history-title">{e.title}</span>
                {e.request && <span className="history-request">“{e.request}”</span>}
                <span className="history-meta">
                  <span className="chip">{TYPE_LABEL[e.type] ?? 'Diagram'}</span>
                  <span>{nodes} {nodes === 1 ? 'node' : 'nodes'}{blocks > 0 ? ` · ${blocks} ${blocks === 1 ? 'chapter' : 'chapters'}` : ''}</span>
                  <span>· {timeAgo(e.created)}</span>
                </span>
                {page && (
                  <span className="history-page">
                    <Icon name={e.id === activeEntry ? 'visibility' : 'open_in_new'} size={14} />
                    {e.id === activeEntry ? 'On this page' : `Open on page ${workspace.pageIndex(page.id) + 1}`}
                  </span>
                )}
              </span>
            </button>
            <div className="menu-anchor history-more">
              <IconButton icon="more_vert" label={`More for ${e.title}`} onClick={() => setMenu(menu === e.id ? null : e.id)} />
              <EntryMenu entry={e} open={menu === e.id} onClose={() => setMenu(null)} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CatalogPane() {
  const { workspace, store, notify } = useStudio();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CatalogFilter>('all');
  // The 101 Gen AI blueprints are loaded when the catalog is first opened
  const [allBlueprints, setAllBlueprints] = useState(false);
  useEffect(() => {
    let alive = true;
    loadAllBlueprints().then(() => alive && setAllBlueprints(true), () => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const blueprints = useMemo(
    () => (filter === 'all' || filter === 'blueprints' ? searchBlueprints(query, { limit: filter === 'blueprints' ? 120 : 6 }) : []),
    [query, filter, allBlueprints],
  );
  const components = useMemo(
    () => (filter === 'all' || filter === 'components' ? searchComponents(query, { limit: filter === 'components' ? 40 : 8 }) : []),
    [query, filter],
  );
  const gcpIcons = useMemo(
    () => (filter === 'all' || filter === 'gcp-icons' ? searchGcpIcons(query, { limit: filter === 'gcp-icons' ? 261 : 18 }) : []),
    [query, filter],
  );

  const openBlueprint = async (b: BlueprintEntry) => {
    const isEmpty = store.scene.nodes.length === 0 && store.scene.groups.length === 0;
    const meta = { source: 'manual' as const, label: `Blueprint: ${b.title}`, request: b.prompt };
    if (isEmpty) {
      await store.create(b.diagram, meta);
      notify(`Loaded blueprint “${b.title}”`);
    } else {
      const draft = new DiagramStore();
      const res = await draft.create(b.diagram, meta);
      if (res.ok) {
        workspace.addPage({ scene: draft.scene, label: `Blueprint: ${b.title}`, meta });
        notify(`Opened “${b.title}” on a new page`);
      }
    }
  };

  const insertComponent = (c: ComponentEntry) => {
    const res = store.edit(
      { add_nodes: [{ label: c.role, kind: c.kind, tech: c.tech, provider: c.provider }] },
      { source: 'manual', label: `Added ${c.tech}` },
    );
    if (res.ok) {
      const id = res.changes.addedNodes[0];
      if (id) store.setSelection([id]);
      notify(`Added ${c.tech} to the canvas`);
    }
  };

  const insertGcpIcon = (item: GcpIconEntry) => {
    const res = store.edit(
      { add_nodes: [{ label: item.title, kind: item.kind, tech: item.title, provider: 'gcp' }] },
      { source: 'manual', label: `Added ${item.title}` },
    );
    if (res.ok) {
      const id = res.changes.addedNodes[0];
      if (id) store.setSelection([id]);
      notify(`Added ${item.title} (Google Cloud) to the canvas`);
    }
  };

  const nothingFound = blueprints.length === 0 && components.length === 0 && gcpIcons.length === 0;

  return (
    <div className="catalog-pane">
      <div className="catalog-controls">
        <div className="catalog-search-box">
          <Icon name="find_in_page" size={18} />
          <input
            type="search"
            className="catalog-search-input"
            value={query}
            placeholder="Search blueprints, RAG agents & 261 GCP icons…"
            aria-label="Search blueprints, components and Google Cloud icons"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === 'Escape' && query) {
                e.stopPropagation();
                setQuery('');
              }
            }}
          />
          {query && (
            <button type="button" className="catalog-clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div className="catalog-filters" role="group" aria-label="Filter catalog">
          {([
            ['all', 'All'],
            ['blueprints', `Blueprints (${BLUEPRINT_CATALOG.length})`],
            ['components', `Components (${COMPONENT_CATALOG.length})`],
            ['gcp-icons', `GCP Icons (${ALL_GCP_ICONS.length})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`catalog-chip${filter === id ? ' active' : ''}`}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-scroll">
        {nothingFound && (
          <div className="history-empty">
            <Icon name="find_in_page" size={28} />
            <p>No blueprints, components or Google Cloud icons match “{query}”.</p>
          </div>
        )}

        {blueprints.length > 0 && (
          <section className="catalog-section" aria-label="Gen AI and Cloud Technical Blueprints">
            <h3 className="catalog-heading">Gen AI &amp; Cloud Blueprints</h3>
            <div className="catalog-list">
              {blueprints.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="catalog-card blueprint-card"
                  onClick={() => openBlueprint(b)}
                  aria-label={`Open blueprint ${b.title}`}
                >
                  <span className="catalog-card-head">
                    <span className="catalog-card-icon"><Icon name={b.icon as IconName} size={20} /></span>
                    <span className="catalog-card-titles">
                      <span className="catalog-card-title">{b.title}</span>
                      <span className="catalog-card-sub">{AGENT_CATEGORY_LABELS[b.agentCategory]} · {b.pillars.slice(0, 2).join(' · ')}</span>
                    </span>
                  </span>
                  <span className="catalog-card-desc">{b.summary}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {components.length > 0 && (
          <section className="catalog-section" aria-label="Architecture and AI Components">
            <h3 className="catalog-heading">Architecture &amp; AI Components</h3>
            <div className="catalog-list">
              {components.map((c) => {
                const gcpUrl = resolveGcpIconUrl({ kind: c.kind, label: c.role, tech: c.tech, provider: c.provider });
                const iconName = resolveNodeIcon({ kind: c.kind, label: c.role, tech: c.tech });
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="catalog-card component-card"
                    onClick={() => insertComponent(c)}
                    aria-label={`Add ${c.tech} (${c.role}) to canvas`}
                  >
                    <span className="catalog-card-head">
                      <span className="catalog-card-icon">
                        {gcpUrl
                          ? <img src={gcpUrl} alt="" width={22} height={22} loading="lazy" decoding="async" />
                          : <Icon name={iconName} size={20} />}
                      </span>
                      <span className="catalog-card-titles">
                        <span className="catalog-card-title">{c.tech}</span>
                        <span className="catalog-card-sub">{c.role} · {LAYER_LABELS[c.layer]}</span>
                      </span>
                      {c.provider && (
                        <span className={`provider provider-${c.provider}`}>
                          {c.provider === 'k8s' ? 'K8s' : c.provider.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="catalog-card-desc">{c.usage}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {gcpIcons.length > 0 && (
          <section className="catalog-section" aria-label="Official Google Cloud Icons">
            <h3 className="catalog-heading">
              Official Google Cloud Icons ({gcpIcons.length}{filter === 'all' && !query ? ` of ${ALL_GCP_ICONS.length}` : ''})
            </h3>
            <div className="gcp-icon-grid">
              {gcpIcons.map((item) => (
                <button
                  key={`${item.group}-${item.id}`}
                  type="button"
                  className="gcp-icon-card"
                  onClick={() => insertGcpIcon(item)}
                  title={`${item.title} (${GROUP_BADGE[item.group]}) — Click to add to canvas`}
                  aria-label={`Add Google Cloud ${item.title} node`}
                >
                  <img src={item.url} alt="" width={26} height={26} loading="lazy" decoding="async" />
                  <span className="gcp-icon-name">{item.title}</span>
                  <span className="gcp-icon-badge">{GROUP_BADGE[item.group]}</span>
                </button>
              ))}
            </div>
            {filter === 'all' && !query && (
              <button type="button" className="catalog-show-all" onClick={() => setFilter('gcp-icons')}>
                Show all {ALL_GCP_ICONS.length} official Google Cloud SVG icons
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export function SidePanel({ tab, setTab, onClose }: { tab: PanelTab; setTab: (t: PanelTab) => void; onClose: () => void }) {
  const { workspace } = useStudio();
  useWorkspaceRevision(workspace);
  const tabs: { id: PanelTab; label: string; count?: number }[] = [
    { id: 'diagrams', label: 'Diagrams', count: workspace.library.length },
    { id: 'changes', label: 'Changes' },
    { id: 'catalog', label: 'Catalog', count: ALL_GCP_ICONS.length },
  ];
  return (
    <aside className="side-sheet side-panel" aria-label="History">
      <header className="sheet-header">
        <h2>{tab === 'catalog' ? 'Catalog & Icons' : 'History'}</h2>
        <IconButton icon="right_panel_close" label="Close history" onClick={onClose} />
      </header>
      <div className="panel-tabs" role="tablist" aria-label="History">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`panel-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="panel-body"
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const idx = tabs.findIndex((x) => x.id === t.id);
                const delta = e.key === 'ArrowRight' ? 1 : -1;
                const next = tabs[(idx + delta + tabs.length) % tabs.length].id;
                setTab(next);
                document.getElementById(`panel-tab-${next}`)?.focus();
              }
            }}
          >
            {t.label}
            {t.count != null && t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>
      <div id="panel-body" className="panel-body" role="tabpanel" aria-labelledby={`panel-tab-${tab}`}>
        {tab === 'diagrams' ? <DiagramHistory /> : tab === 'changes' ? <ActivityList /> : <CatalogPane />}
      </div>
    </aside>
  );
}
