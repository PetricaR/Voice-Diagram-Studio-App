import { useEffect, useRef, useState } from 'react';
import { isBlankScene } from '../engine/types';
import { bookToMarkdown } from '../engine/book';
import { addChapter } from './chapters';
import { Icon, IconButton, useStoreRevision, useStudio, useWorkspaceRevision } from './context';
import { download, fileName, pagesFromJson, pagesToJson, toDrawio } from './export';

const TYPE_LABEL: Record<string, string> = {
  architecture: 'Architecture', flowchart: 'Flowchart', c4: 'C4', network: 'Network', generic: 'Diagram',
};

export function TopBar({ panelOpen, togglePanel }: { panelOpen: boolean; togglePanel: () => void }) {
  const { workspace, store, notify, openSettings } = useStudio();
  useStoreRevision(store);
  useWorkspaceRevision(workspace);
  const scene = store.scene;
  const pages = workspace.pages.map((p) => p.store.scene);
  const nothing = pages.every(isBlankScene);
  const docName = pages.length > 1 ? { ...scene, title: pages[0].title || scene.title } : scene;
  const [title, setTitle] = useState(scene.title);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setTitle(scene.title), [scene.title]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenu(false);
        menuRef.current?.querySelector<HTMLButtonElement>('.tonal-btn')?.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])];
        if (items.length === 0) return;
        e.preventDefault();
        const idx = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === 'ArrowDown'
          ? items[(idx + 1) % items.length]
          : items[(idx - 1 + items.length) % items.length];
        next.focus();
      }
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const commitTitle = () => {
    const t = title.trim();
    if (t !== scene.title) store.edit({ title: t || 'Untitled diagram' }, { source: 'manual', label: 'Renamed the diagram' });
  };
  const empty = scene.nodes.length === 0;
  // The documentation tab of the page is open (the layout tools are about the canvas)
  const docOpen = workspace.view === 'doc';
  const chapters = scene.blocks.length;

  return (
    <header className="top-bar">
      <div className="brand" aria-hidden="true"><Icon name="graphic_eq" size={22} /></div>
      <input
        className="title-input"
        value={title}
        placeholder="Untitled diagram"
        aria-label="Diagram title"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setTitle(scene.title);
            e.currentTarget.blur();
          }
        }}
      />
      {!empty && !docOpen && <span className="type-chip">{TYPE_LABEL[scene.type]} · {scene.direction === 'LR' ? 'left to right' : 'top to bottom'}</span>}
      <div className="spacer" />
      <div className="toolbar-group">
        <IconButton icon="undo" label="Undo" shortcut="⌘Z" disabled={!store.canUndo()} onClick={() => store.undo()} />
        <IconButton icon="redo" label="Redo" shortcut="⇧⌘Z" disabled={!store.canRedo()} onClick={() => store.redo()} />
        <span className="divider" />
        {!docOpen && (
          <>
            <IconButton icon="auto_awesome_mosaic" label="Tidy up layout" disabled={empty}
              onClick={() => store.relayout({ source: 'manual' }).catch((e) => notify(String(e)))} />
            <IconButton icon={scene.direction === 'LR' ? 'swap_vert' : 'swap_horiz'} label={scene.direction === 'LR' ? 'Lay out top to bottom' : 'Lay out left to right'} disabled={empty}
              onClick={() => store.relayout({ source: 'manual' }, scene.direction === 'LR' ? 'TB' : 'LR').catch((e) => notify(String(e)))} />
            <span className="divider" />
          </>
        )}
        <IconButton icon="menu_book" label={docOpen ? 'Show the diagram' : chapters > 0 ? 'Documentation' : 'Write documentation'} selected={docOpen}
          onClick={() => workspace.showView(docOpen ? 'diagram' : 'doc')} />
        <IconButton icon="note_add" label="Add a chapter to the documentation" onClick={() => addChapter(workspace, store, 'text')} />
        <IconButton icon="table_chart" label="Add a table to the documentation" onClick={() => addChapter(workspace, store, 'table')} />
        <span className="divider" />
        <div className="menu-anchor" ref={menuRef}>
          <button type="button" className="tonal-btn" onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu}>
            <Icon name="download" size={18} /> Export
          </button>
          {menu && (
            <div className="menu" role="menu">
              <button type="button" role="menuitem" disabled={nothing} onClick={() => { download(fileName(docName, 'drawio'), toDrawio(pages), 'application/xml'); setMenu(false); }}>
                <Icon name="account_tree" size={20} />
                <span>draw.io file{pages.length > 1 ? ` · ${pages.length} pages` : ''}<small>Open and fine-tune in draw.io</small></span>
              </button>
              {pages.length > 1 && (
                <button type="button" role="menuitem" disabled={isBlankScene(scene)} onClick={() => { download(fileName(scene, 'drawio'), toDrawio(scene), 'application/xml'); setMenu(false); }}>
                  <Icon name="account_tree" size={20} /><span>draw.io file · this page<small>Only “{workspace.pageTitle(workspace.active)}”</small></span>
                </button>
              )}
              <button type="button" role="menuitem" disabled={chapters === 0} onClick={() => {
                const name = fileName(scene, 'md').replace(/\.md$/, '-documentation.md');
                download(name, bookToMarkdown(scene), 'text/markdown');
                setMenu(false);
              }}>
                <Icon name="menu_book" size={20} />
                <span>Documentation (.md)<small>{chapters > 0 ? `${chapters} ${chapters === 1 ? 'chapter' : 'chapters'} of “${workspace.pageTitle(workspace.active)}”` : 'This page has no documentation yet'}</small></span>
              </button>
              <button type="button" role="menuitem" disabled={nothing} onClick={() => { download(fileName(docName, 'json'), pagesToJson(pages), 'application/json'); setMenu(false); }}>
                <Icon name="data_object" size={20} /><span>Studio file (.json)<small>All pages, to open again here later</small></span>
              </button>
              <div className="menu-divider" />
              <button type="button" role="menuitem" onClick={() => { fileRef.current?.click(); setMenu(false); }}>
                <Icon name="upload_file" size={20} /><span>Open a studio file…<small>Its pages open as new pages</small></span>
              </button>
              <button type="button" role="menuitem" onClick={() => {
                workspace.addPage({ label: 'New page' });
                setMenu(false);
              }}>
                <Icon name="add" size={20} /><span>New page</span>
              </button>
            </div>
          )}
          <input
            ref={fileRef} type="file" accept=".json,application/json" hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file == null) return;
              const opened = pagesFromJson(await file.text());
              if (opened == null) {
                notify('That file is not a studio diagram.');
                return;
              }
              // Each new page goes after the previous one, in the order of the file
              const added = opened.map((s) => workspace.addPage({ scene: s, label: `Opened ${file.name}` }));
              workspace.switchTo(added[0].id);
              notify(opened.length === 1 ? `Opened “${opened[0].title || file.name}”` : `Opened ${opened.length} pages from ${file.name}`);
            }}
          />
        </div>
        <IconButton icon={panelOpen ? 'right_panel_close' : 'history'} label={panelOpen ? 'Hide history' : 'History'} selected={panelOpen} onClick={togglePanel} />
        <IconButton icon="settings" label="Settings" onClick={openSettings} />
      </div>
    </header>
  );
}
