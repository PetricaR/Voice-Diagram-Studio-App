/**
 * Page tabs under the top bar: one tab per diagram page, followed by the
 * documentation tab of the page when it has documentation (a book of
 * chapters, ui/DocView.tsx). Click to switch, double-click (or F2) to rename,
 * the close button or the menu to close, duplicate or move a page. Gemini can
 * create, switch, rename and close pages and open the documentation too
 * (agent/tools.ts).
 */
import { Fragment, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { isBlankScene } from '../engine/types';
import type { Page, PageView } from '../engine/workspace';
import { Icon, IconButton, useStudio, useWorkspaceRevision } from './context';
import type { IconName } from './icons';

const TYPE_ICON: Record<string, IconName> = {
  architecture: 'cloud', flowchart: 'flowchart', c4: 'schema', network: 'lan', generic: 'account_tree',
};

function RenameInput({ value, onDone }: { value: string; onDone: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      className="tab-rename"
      value={text}
      aria-label="Page name"
      size={Math.max(6, Math.min(32, text.length + 1))}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onDone(text)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter') onDone(text);
        else if (e.key === 'Escape') onDone(null);
      }}
    />
  );
}

export function PageTabs() {
  const { workspace } = useStudio();
  useWorkspaceRevision(workspace);
  const [renaming, setRenaming] = useState<string | null>(null);
  // The menu is fixed-positioned: the tab list scrolls and would clip it
  const [menu, setMenu] = useState<{ id: string; left: number; top: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pages = workspace.pages;
  const view = workspace.view;
  const hasDocTab = (p: Page) => p.store.scene.blocks.length > 0 || (p.id === workspace.activeId && view === 'doc');
  // Every tab in order (a page's diagram, then its documentation), for the arrow keys
  const stops: { page: Page; view: PageView }[] = pages.flatMap((p) =>
    hasDocTab(p) ? [{ page: p, view: 'diagram' as const }, { page: p, view: 'doc' as const }] : [{ page: p, view: 'diagram' as const }]);

  useEffect(() => {
    if (menu == null) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
    const close = (e: PointerEvent) => {
      const t = e.target as Element;
      // The button that opened the menu toggles it itself
      if (!menuRef.current?.contains(t) && !t.closest?.('[aria-haspopup="menu"]')) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenu(null);
      }
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [menu]);

  // Keep the active tab visible when pages are added or switched (also by voice)
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [workspace.activeId, pages.length, view]);

  const finishRename = (page: Page, v: string | null) => {
    setRenaming(null);
    if (v != null) workspace.renamePage(page.id, v);
  };
  const focusTab = (id: string, v: PageView) =>
    listRef.current?.querySelector<HTMLElement>(`[data-page="${id}"][data-view="${v}"]`)?.focus();
  const onArrow = (e: ReactKeyboardEvent, page: Page, v: PageView): boolean => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return false;
    e.preventDefault();
    const i = stops.findIndex((s) => s.page === page && s.view === v);
    const next = stops[(i + (e.key === 'ArrowRight' ? 1 : stops.length - 1)) % stops.length];
    workspace.showView(next.view, { page: next.page.id });
    requestAnimationFrame(() => focusTab(next.page.id, next.view));
    return true;
  };
  const openMenu = (id: string, el: Element) => {
    const r = el.closest('.page-tab')!.getBoundingClientRect();
    setMenu({ id, left: Math.min(r.left, window.innerWidth - 232), top: r.bottom + 4 });
  };

  return (
    <nav className="page-tabs" aria-label="Pages">
      <div className="tab-list" role="tablist" aria-label="Pages" ref={listRef}>
        {pages.map((p, i) => {
          const pageActive = p.id === workspace.activeId;
          const active = pageActive && view !== 'doc';
          const docActive = pageActive && view === 'doc';
          const title = workspace.pageTitle(p);
          const scene = p.store.scene;
          const chapters = scene.blocks.length;
          const icon: IconName = isBlankScene(scene) ? 'grid_view' : TYPE_ICON[scene.type] ?? 'account_tree';
          return (
            <Fragment key={p.id}>
            <div className={`page-tab${active ? ' active' : ''}`}>
              <button
                type="button"
                role="tab"
                data-page={p.id}
                data-view="diagram"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="tab-main"
                title={`${title} (page ${i + 1})`}
                onClick={() => workspace.showView('diagram', { page: p.id })}
                onDoubleClick={() => setRenaming(p.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  workspace.switchTo(p.id);
                  openMenu(p.id, e.currentTarget);
                }}
                onKeyDown={(e) => {
                  if (onArrow(e, p, 'diagram')) return;
                  if (e.key === 'F2' || (e.key === 'Enter' && active)) {
                    e.preventDefault();
                    setRenaming(p.id);
                  }
                }}
              >
                <Icon name={icon} size={16} />
                {renaming === p.id
                  ? <RenameInput value={scene.title} onDone={(v) => finishRename(p, v)} />
                  : <span className="tab-label">{title}</span>}
              </button>
              {pageActive && renaming !== p.id && (
                <button
                  type="button"
                  className="tab-action"
                  aria-label={`Page options for ${title}`}
                  aria-haspopup="menu"
                  aria-expanded={menu?.id === p.id}
                  onClick={(e) => (menu?.id === p.id ? setMenu(null) : openMenu(p.id, e.currentTarget))}
                >
                  <Icon name="more_vert" size={16} />
                </button>
              )}
              {pages.length > 1 && renaming !== p.id && (
                <button
                  type="button"
                  className="tab-action tab-close"
                  aria-label={`Close page ${title}`}
                  data-tooltip="Close page"
                  onClick={() => workspace.removePage(p.id)}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
              {menu?.id === p.id && (
                <div className="menu tab-menu" role="menu" ref={menuRef} style={{ left: menu.left, top: menu.top }}>
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); setRenaming(p.id); }}>
                    <Icon name="edit" size={20} /><span>Rename</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); workspace.showView('doc', { page: p.id }); }}>
                    <Icon name="menu_book" size={20} /><span>{chapters > 0 ? 'Open the documentation' : 'Write documentation'}</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); workspace.duplicatePage(p.id); }}>
                    <Icon name="content_copy" size={20} /><span>Duplicate</span>
                  </button>
                  <button type="button" role="menuitem" disabled={i === 0} onClick={() => { setMenu(null); workspace.movePage(p.id, -1); }}>
                    <Icon name="chevron_left" size={20} /><span>Move left</span>
                  </button>
                  <button type="button" role="menuitem" disabled={i === pages.length - 1} onClick={() => { setMenu(null); workspace.movePage(p.id, 1); }}>
                    <Icon name="chevron_right" size={20} /><span>Move right</span>
                  </button>
                  <div className="menu-divider" />
                  <button type="button" role="menuitem" disabled={pages.length <= 1} onClick={() => { setMenu(null); workspace.removePage(p.id); }}>
                    <Icon name="close" size={20} /><span>Close page</span>
                  </button>
                </div>
              )}
            </div>
            {hasDocTab(p) && (
              <div className={`page-tab doc-tab${docActive ? ' active' : ''}`}>
                <button
                  type="button"
                  role="tab"
                  data-page={p.id}
                  data-view="doc"
                  aria-selected={docActive}
                  tabIndex={docActive ? 0 : -1}
                  className="tab-main"
                  title={`Documentation of “${title}”${chapters > 0 ? ` · ${chapters} ${chapters === 1 ? 'chapter' : 'chapters'}` : ''}`}
                  aria-label={`Documentation of ${title}`}
                  onClick={() => workspace.showView('doc', { page: p.id })}
                  onKeyDown={(e) => { onArrow(e, p, 'doc'); }}
                >
                  <Icon name="menu_book" size={16} />
                  <span className="tab-label">Documentation</span>
                  {chapters > 0 && <span className="tab-count">{chapters}</span>}
                </button>
              </div>
            )}
            </Fragment>
          );
        })}
      </div>
      <IconButton icon="add" label="New page" onClick={() => workspace.addPage({ label: 'New page' })} />
    </nav>
  );
}
