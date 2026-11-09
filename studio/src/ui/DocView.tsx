/**
 * The documentation tab of a page: its chapters as a book. The table of
 * contents on the left is the book's menu (numbered chapters, and the
 * sections of the open chapter); one chapter is shown at a time, with the
 * previous and next chapter at its end (← and → turn the pages). Gemini
 * writes the chapters (write_text, write_table) and this view opens at the
 * chapter it wrote; chapters can also be written, edited, reordered and
 * deleted by hand.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bookOutline, type BookChapter } from '../engine/book';
import { hasDiagram, type DBlock } from '../engine/types';
import { addChapter, chapterSource, parseTableSource } from './chapters';
import { Icon, IconButton, useStudio, useWorkspaceRevision } from './context';
import { Markdown, TableView } from './Markdown';
import { Thumbnail } from './Thumbnail';
import './docs.css';

const ARTICLE_WIDTH = 720;
const HIGHLIGHT_MS = 2600;

type Flash = 'added' | 'updated';

function ChapterEditor({ block, chapter, onDone }: {
  block: DBlock;
  chapter: BookChapter;
  onDone: (v: { title: string; source: string } | null) => void;
}) {
  const [title, setTitle] = useState(block.title ?? chapter.title);
  const [source, setSource] = useState(() => chapterSource(block));
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const table = block.kind === 'table';
  return (
    <div
      className="chapter-editor"
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onDone({ title, source });
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onDone(null);
        }
      }}
    >
      <input
        className="chapter-title-input"
        value={title}
        aria-label="Chapter title"
        placeholder="Chapter title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        ref={ref}
        className="chapter-source"
        value={source}
        spellCheck
        aria-label={table ? 'Table rows, cells separated by |, the first line is the header' : 'Chapter text (Markdown)'}
        onChange={(e) => setSource(e.target.value)}
      />
      <div className="chapter-editor-actions">
        <span className="hint">
          {table
            ? 'One row per line, cells separated by |; the first line is the header.'
            : 'Markdown: “## ” starts a section (listed in the contents), “- ” a bullet, **bold**, `code`.'}
          {' '}⌘↵ saves, Esc cancels.
        </span>
        <button type="button" className="text-btn" onClick={() => onDone(null)}>Cancel</button>
        <button type="button" className="filled-btn" onClick={() => onDone({ title, source })}>Save</button>
      </div>
    </div>
  );
}

/** What the "Document this diagram" button asks Gemini (the prompt picks the outline for the diagram type). */
const DOCUMENT_REQUEST = 'Document this diagram.';

function EmptyBook({ onAdd }: { onAdd: (kind: 'text' | 'table') => void }) {
  const { store, agent, liveKey, openSettings, toggleVoice } = useStudio();
  const canDocument = hasDiagram(store.scene);
  const writeDocs = () => {
    if (liveKey === 'missing') openSettings();
    else agent.sendText(DOCUMENT_REQUEST).catch(() => undefined);
  };
  return (
    <div className="doc-empty">
      <div className="doc-empty-icon"><Icon name="menu_book" size={32} /></div>
      <h1>No documentation yet</h1>
      <p>
        Say “document this architecture” and Gemini writes it here as a book that follows arc42 and the
        C4 model: goals, context, building blocks, runtime flows, deployment, cross-cutting concepts,
        decision records (ADRs) and risks, one chapter each, with a table of contents.
      </p>
      <div className="doc-empty-actions">
        {canDocument && (
          <button type="button" className="filled-btn doc-generate" onClick={writeDocs}>
            <Icon name="article" size={20} /> Document this diagram
          </button>
        )}
        <button type="button" className={canDocument ? 'tonal-btn' : 'filled-btn'} onClick={toggleVoice}>
          <Icon name="mic" size={20} /> Start talking
        </button>
        <button type="button" className="tonal-btn" onClick={() => onAdd('text')}><Icon name="note_add" size={18} /> Write a chapter</button>
        <button type="button" className="text-btn" onClick={() => onAdd('table')}><Icon name="table_chart" size={18} /> Add a table</button>
      </div>
    </div>
  );
}

export function DocView() {
  const { workspace, store, notify } = useStudio();
  useWorkspaceRevision(workspace);
  const page = workspace.active;
  const scene = store.scene;
  const chapters = useMemo(() => bookOutline(scene), [scene]);
  const current = chapters.find((c) => c.id === page.chapter) ?? chapters[0];
  const index = current != null ? chapters.indexOf(current) : -1;
  const block = current != null ? scene.blocks.find((b) => b.id === current.id) : undefined;
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : undefined;
  const words = chapters.reduce((n, c) => n + c.words, 0);

  const [editing, setEditing] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [flash, setFlash] = useState<Map<string, Flash>>(new Map());
  const [tocOpen, setTocOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const open = useCallback((id: string, anchor?: string) => {
    workspace.showView('doc', { chapter: id });
    setPending(anchor ?? null);
    setTocOpen(false);
  }, [workspace]);

  // The open chapter is also the selection ("rewrite this chapter")
  useEffect(() => {
    if (current != null && page.chapter !== current.id) workspace.showView('doc', { chapter: current.id });
  }, [current, page, workspace]);

  // A new chapter starts at its top; a section link scrolls to the section
  useEffect(() => {
    const main = mainRef.current;
    if (main == null) return;
    if (pending != null) {
      document.getElementById(pending)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setSection(pending);
      setPending(null);
    } else {
      main.scrollTo({ top: 0 });
      setSection(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, pending]);

  // Highlight what was just written; a chapter added by hand opens in the editor
  const last = store.lastChange;
  useEffect(() => {
    if (last == null || Date.now() - last.time > 1500) return;
    const m = new Map<string, Flash>();
    last.changes.updatedBlocks.forEach((id) => m.set(id, 'updated'));
    last.changes.addedBlocks.forEach((id) => m.set(id, 'added'));
    if (m.size === 0) return;
    const entry = store.history[store.historyIndex];
    if (entry?.source === 'manual' && last.changes.addedBlocks.length === 1 && entry.changes === last.changes) {
      setEditing(last.changes.addedBlocks[0]);
    }
    setFlash(m);
    const t = setTimeout(() => setFlash(new Map()), HIGHLIGHT_MS);
    return () => clearTimeout(t);
  }, [last, store]);

  // ← and → turn the pages, Enter edits the open chapter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229 || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], dialog, [role="tab"], [role="menu"]')) return;
      if (e.key === 'ArrowLeft' && prev != null) {
        e.preventDefault();
        open(prev.id);
      } else if (e.key === 'ArrowRight' && next != null) {
        e.preventDefault();
        open(next.id);
      } else if (e.key === 'Enter' && current != null && editing == null && !target.closest('button, a')) {
        e.preventDefault();
        setEditing(current.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, current, editing, open]);

  // The section being read is marked in the contents
  const onScroll = useCallback(() => {
    const main = mainRef.current;
    if (main == null || current == null) return;
    const top = main.getBoundingClientRect().top + 96;
    let active: string | null = null;
    for (const h of main.querySelectorAll<HTMLElement>(`.doc-article [id^="${CSS.escape(current.id)}-h"]`)) {
      if (h.getBoundingClientRect().top <= top) active = h.id;
    }
    setSection(active);
  }, [current]);

  const add = (kind: 'text' | 'table') => {
    addChapter(workspace, store, kind);
  };

  const move = (c: BookChapter, delta: -1 | 1) => {
    const i = chapters.indexOf(c);
    const after = delta < 0 ? (i >= 2 ? chapters[i - 2].id : 'start') : chapters[i + 1]?.id;
    if (after == null) return;
    store.edit({ write_blocks: [{ id: c.id, after }] }, { source: 'manual', label: `Moved “${c.title}” ${delta < 0 ? 'up' : 'down'}` });
  };

  const remove = (c: BookChapter) => {
    const neighbour = next ?? prev;
    const r = store.edit({ remove_blocks: [c.id] }, { source: 'manual', label: `Deleted the chapter “${c.title}”` });
    if (!r.ok) return;
    if (neighbour != null) workspace.showView('doc', { chapter: neighbour.id });
    notify(`Deleted “${c.title}”`, { label: 'Undo', run: () => store.undo() });
  };

  const save = (b: DBlock, c: BookChapter, v: { title: string; source: string } | null) => {
    setEditing(null);
    if (v == null) return;
    const title = v.title.trim() || undefined;
    const label = `Edited “${title ?? c.title}”`;
    if (b.kind === 'text') {
      if (v.source.trim() === '') {
        notify('A chapter needs some text. To remove it, delete it.');
        return;
      }
      if (v.source === b.text && (title == null || title === b.title)) return;
      store.edit({ write_blocks: [{ id: b.id, kind: 'text', title, text: v.source }] }, { source: 'manual', label });
    } else {
      const t = parseTableSource(v.source);
      if (t == null) {
        notify('A table needs at least its header line.');
        return;
      }
      const r = store.edit({ write_blocks: [{ id: b.id, kind: 'table', title, columns: t.columns, rows: t.rows }] }, { source: 'manual', label });
      if (!r.ok) notify(r.errors[0]);
    }
  };

  if (current == null || block == null) {
    return (
      <div className="doc-view empty" role="region" aria-label="Documentation">
        <main className="doc-main" ref={mainRef}>
          <EmptyBook onAdd={add} />
        </main>
      </div>
    );
  }

  const flashOf = flash.get(current.id);

  return (
    <div className="doc-view" role="region" aria-label="Documentation" data-toc-open={tocOpen || undefined}>
      <nav className="doc-toc" aria-label="Contents">
        <div className="doc-cover">
          {hasDiagram(scene) && (
            <button type="button" className="doc-cover-figure" onClick={() => workspace.showView('diagram')}
              aria-label="Show the diagram" data-tooltip="Show the diagram">
              <Thumbnail scene={scene} />
              <span className="doc-cover-open"><Icon name="account_tree" size={14} /> Diagram</span>
            </button>
          )}
          <div className="doc-cover-text">
            <span className="doc-eyebrow">Documentation</span>
            <h2 className="doc-book-title">{scene.title || 'Untitled diagram'}</h2>
            <span className="doc-book-meta">
              {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} · {Math.max(1, Math.round(words / 200))} min read
            </span>
          </div>
        </div>
        <div className="doc-toc-head" id="doc-contents">Contents</div>
        <ol className="doc-toc-list" aria-labelledby="doc-contents">
          {chapters.map((c) => {
            const active = c.id === current.id;
            let n = 0;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`toc-chapter${active ? ' active' : ''}${flash.has(c.id) ? ' flash' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => open(c.id)}
                >
                  <span className="toc-num">{c.number}</span>
                  <span className="toc-title">{c.title}</span>
                  {c.kind === 'table' && <Icon name="table_chart" size={16} className="toc-kind" />}
                </button>
                {active && c.sections.length > 0 && (
                  <ol className="toc-sections" aria-label={`Sections of ${c.title}`}>
                    {c.sections.map((s) => {
                      const anchor = `${c.id}-h${s.heading}`;
                      const numbered = s.level <= 2;
                      if (numbered) n++;
                      return (
                        <li key={anchor}>
                          <button
                            type="button"
                            className={`toc-section level-${numbered ? 2 : 3}${section === anchor ? ' active' : ''}`}
                            aria-current={section === anchor ? 'location' : undefined}
                            onClick={() => open(c.id, anchor)}
                          >
                            {numbered && <span className="toc-num">{c.number}.{n}</span>}
                            <span className="toc-title">{s.text}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
        <div className="doc-toc-actions">
          <button type="button" className="text-btn" onClick={() => add('text')}><Icon name="note_add" size={18} /> Chapter</button>
          <button type="button" className="text-btn" onClick={() => add('table')}><Icon name="table_chart" size={18} /> Table</button>
        </div>
      </nav>
      {tocOpen && <div className="doc-scrim" onClick={() => setTocOpen(false)} aria-hidden="true" />}
      <main className="doc-main" ref={mainRef} onScroll={onScroll}>
        <button type="button" className="doc-toc-toggle tonal-btn" aria-expanded={tocOpen} onClick={() => setTocOpen(!tocOpen)}>
          <Icon name="toc" size={18} /> Contents
        </button>
        <article
          key={current.id}
          className={`doc-article${flashOf ? ` flash-${flashOf}` : ''}`}
          aria-labelledby="chapter-title"
        >
          <header className="chapter-head">
            <span className="doc-eyebrow">Chapter {current.number} of {chapters.length}</span>
            <h1 id="chapter-title" className="chapter-title">{current.title}</h1>
            {editing !== current.id && (
              <div className="chapter-actions" role="toolbar" aria-label="Chapter actions">
                <IconButton icon="edit" label="Edit the chapter" shortcut="Enter" onClick={() => setEditing(current.id)} />
                <IconButton icon="arrow_upward" label="Move up" disabled={prev == null} onClick={() => move(current, -1)} />
                <IconButton icon="arrow_downward" label="Move down" disabled={next == null} onClick={() => move(current, 1)} />
                <IconButton icon="delete" label="Delete the chapter" onClick={() => remove(current)} />
              </div>
            )}
          </header>
          {editing === current.id ? (
            <ChapterEditor key={current.id} block={block} chapter={current} onDone={(v) => save(block, current, v)} />
          ) : block.kind === 'table' ? (
            <div className="md">
              <TableView columns={block.columns ?? []} rows={block.rows ?? []} maxWidth={ARTICLE_WIDTH} />
            </div>
          ) : (
            <Markdown text={block.text ?? ''} width={ARTICLE_WIDTH} anchor={current.id} skipFirstHeading={current.skipFirstHeading} />
          )}
          <footer className="chapter-nav" aria-label="Turn the page">
            {prev != null ? (
              <button type="button" className="chapter-link prev" onClick={() => open(prev.id)}>
                <span className="chapter-link-label"><Icon name="arrow_back" size={16} /> Previous</span>
                <span className="chapter-link-title">{prev.number}. {prev.title}</span>
              </button>
            ) : <span />}
            {next != null && (
              <button type="button" className="chapter-link next" onClick={() => open(next.id)}>
                <span className="chapter-link-label">Next <Icon name="arrow_forward" size={16} /></span>
                <span className="chapter-link-title">{next.number}. {next.title}</span>
              </button>
            )}
          </footer>
        </article>
      </main>
    </div>
  );
}
