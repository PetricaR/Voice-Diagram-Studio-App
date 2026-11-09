/**
 * The workspace: the pages (tabs) of the document, each with its own diagram
 * and undo history, and the history of generated diagrams. A history entry
 * starts when a diagram is created (by voice, text, a blueprint, a file or a
 * new page) and follows that diagram through its edits, so the history shows
 * every diagram as it is now, or as it was when its page was closed or the
 * diagram was replaced.
 */
import { normalize, resolveRef, type Resolution } from './resolve';
import { DiagramStore, type ChangeMeta, type ChangeSource, type HistoryEntry } from './store';
import { cloneScene } from './scene';
import { emptyScene, isBlankScene, type DiagramType, type Scene } from './types';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/** What a page shows: its diagram (canvas) or its documentation (a book). */
export type PageView = 'diagram' | 'doc';

export interface Page {
  id: string;
  store: DiagramStore;
  /** Where the canvas was when the page was left (not saved). */
  viewport?: Viewport;
  /** The documentation tab of the page is shown instead of its diagram. */
  view?: PageView;
  /** The chapter open in the documentation. */
  chapter?: string;
}

/** A generated diagram in the history panel. */
export interface LibraryEntry {
  id: string;
  title: string;
  type: DiagramType;
  /** What the user asked for when it was created. */
  request?: string;
  source: ChangeSource;
  created: number;
  updated: number;
  /** The diagram as it is now (or was last). */
  scene: Scene;
}

export interface RemovedPage {
  page: Page;
  index: number;
  wasActive: boolean;
}

export interface RemovedEntry {
  entry: LibraryEntry;
  index: number;
  /** Page and history entry that pointed to it. */
  links: [string, number][];
}

export interface SavedWorkspace {
  version: 2;
  active: string;
  pages: { id: string; scene: Scene; diagram?: string; view?: PageView; chapter?: string }[];
  library: LibraryEntry[];
}

const MAX_LIBRARY = 60;
const DISMISSED = '';

const ORDINALS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  primul: 1, prima: 1, doua: 2, doilea: 2, treia: 3, treilea: 3, patra: 4, patrulea: 4, cincea: 5, cincilea: 5,
};

export class Workspace {
  pages: Page[] = [];
  activeId = '';
  library: LibraryEntry[] = [];
  /** Incremented on every change of any page, a stable snapshot for React. */
  revision = 0;
  private listeners = new Set<() => void>();
  private removedListeners = new Set<(r: RemovedPage) => void>();
  private unsubscribe = new Map<string, () => void>();
  /** Per page: id of the history entry that started a diagram → library entry id. */
  private origins = new Map<string, Map<number, string>>();
  /** The library entry each page shows now. */
  private current = new Map<string, string>();
  private pageCounter = 0;
  private entryCounter = 0;

  constructor(saved?: SavedWorkspace | null) {
    this.library = saved?.library.slice(0, MAX_LIBRARY) ?? [];
    if (saved != null && saved.pages.length > 0) {
      for (const p of saved.pages) {
        const page = this.attach(p.id, new DiagramStore(p.scene));
        if (p.view === 'doc') page.view = 'doc';
        if (typeof p.chapter === 'string') page.chapter = p.chapter;
        const n = /^page_(\d+)$/.exec(p.id);
        if (n) this.pageCounter = Math.max(this.pageCounter, Number(n[1]));
        if (p.diagram != null && this.library.some((e) => e.id === p.diagram)) {
          this.originsOf(page.id).set(page.store.history[0].id, p.diagram);
        }
      }
      this.activeId = this.pages.some((p) => p.id === saved.active) ? saved.active : this.pages[0].id;
    } else {
      this.activeId = this.attach(this.newPageId(), new DiagramStore()).id;
    }
    for (const p of this.pages) this.sync(p);
  }

  get active(): Page {
    return this.pages.find((p) => p.id === this.activeId) ?? this.pages[0];
  }

  /** The diagram of the active page. */
  get store(): DiagramStore {
    return this.active.store;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Called when a page is closed (by the user or the agent), e.g. to offer undo. */
  onPageRemoved(listener: (r: RemovedPage) => void): () => void {
    this.removedListeners.add(listener);
    return () => this.removedListeners.delete(listener);
  }

  private emit() {
    this.revision++;
    for (const l of this.listeners) l();
  }

  private newPageId(): string {
    let id: string;
    do {
      id = `page_${++this.pageCounter}`;
    } while (this.pages.some((p) => p.id === id));
    return id;
  }

  private originsOf(pageId: string): Map<number, string> {
    let m = this.origins.get(pageId);
    if (m == null) {
      m = new Map();
      this.origins.set(pageId, m);
    }
    return m;
  }

  private attach(id: string, store: DiagramStore, index = this.pages.length): Page {
    const page: Page = { id, store };
    this.pages.splice(index, 0, page);
    this.unsubscribe.set(id, store.subscribe(() => {
      this.sync(page);
      this.emit();
    }));
    return page;
  }

  /** Keeps the history entry of the diagram on the page up to date. */
  private sync(page: Page) {
    const s = page.store;
    const upto = s.history.slice(0, s.historyIndex + 1);
    let origin: HistoryEntry | undefined;
    for (let i = upto.length - 1; i >= 0 && origin == null; i--) {
      if (upto[i].origin) origin = upto[i];
    }
    if (origin == null) {
      this.current.delete(page.id);
      return;
    }
    const map = this.originsOf(page.id);
    const mapped = map.get(origin.id);
    if (mapped === DISMISSED) {
      this.current.delete(page.id);
      return;
    }
    let entry = mapped != null ? this.library.find((e) => e.id === mapped) : undefined;
    if (entry == null) {
      if (isBlankScene(s.scene)) {
        this.current.delete(page.id);
        return;
      }
      const lineage = upto.slice(upto.indexOf(origin));
      entry = {
        id: `d_${Date.now().toString(36)}_${++this.entryCounter}`,
        title: s.scene.title || 'Untitled diagram',
        type: s.scene.type,
        request: lineage.find((e) => e.request)?.request,
        source: lineage.find((e) => e.source !== 'system')?.source ?? origin.source,
        created: Date.now(),
        updated: Date.now(),
        scene: s.scene,
      };
      this.library.unshift(entry);
      map.set(origin.id, entry.id);
      this.trimLibrary();
    }
    this.current.set(page.id, entry.id);
    // A diagram that was emptied keeps its last drawing in the history
    if (entry.scene !== s.scene && !isBlankScene(s.scene)) {
      entry.scene = s.scene;
      entry.title = s.scene.title || 'Untitled diagram';
      entry.type = s.scene.type;
      entry.updated = Date.now();
      if (!entry.request) entry.request = upto.slice(upto.indexOf(origin)).find((e) => e.request)?.request;
    }
  }

  private trimLibrary() {
    if (this.library.length <= MAX_LIBRARY) return;
    const live = new Set(this.current.values());
    for (let i = this.library.length - 1; i >= 0 && this.library.length > MAX_LIBRARY; i--) {
      if (!live.has(this.library[i].id)) this.library.splice(i, 1);
    }
  }

  pageIndex(id: string): number {
    return this.pages.findIndex((p) => p.id === id);
  }

  /** Name of a page on its tab: the title of its diagram. */
  pageTitle(page: Page): string {
    return page.store.scene.title || `Page ${this.pageIndex(page.id) + 1}`;
  }

  /** The library entry shown on a page, if its diagram is in the history. */
  entryOfPage(pageId: string): LibraryEntry | undefined {
    const id = this.current.get(pageId);
    return id != null ? this.library.find((e) => e.id === id) : undefined;
  }

  /** The open page that shows a history entry. */
  pageOfEntry(entryId: string): Page | undefined {
    return this.pages.find((p) => this.current.get(p.id) === entryId);
  }

  /** Adds a page after the active one (empty, or with a diagram) and by default opens it. */
  addPage(opts: {
    title?: string;
    scene?: Scene;
    activate?: boolean;
    label?: string;
    meta?: Partial<ChangeMeta>;
    /** History entry the page continues (when reopened from the history). */
    entry?: string;
  } = {}): Page {
    const scene = opts.scene != null ? cloneScene(opts.scene) : emptyScene();
    if (opts.title != null && opts.title.trim() !== '') scene.title = opts.title.trim();
    const store = new DiagramStore(scene);
    if (opts.label != null || opts.meta != null) {
      // Name the first history entry after what created the page
      const first = store.history[0] as HistoryEntry;
      if (opts.label != null) first.label = opts.label;
      if (opts.meta?.source != null) first.source = opts.meta.source;
      if (opts.meta?.request != null) first.request = opts.meta.request;
    }
    const page = this.attach(this.newPageId(), store, this.pageIndex(this.activeId) + 1);
    if (opts.entry != null) this.originsOf(page.id).set(store.history[0].id, opts.entry);
    this.sync(page);
    if (opts.activate !== false) this.activeId = page.id;
    this.emit();
    return page;
  }

  switchTo(id: string): boolean {
    if (id === this.activeId || !this.pages.some((p) => p.id === id)) return false;
    this.activeId = id;
    this.emit();
    return true;
  }

  /** What the active page shows. */
  get view(): PageView {
    return this.active.view ?? 'diagram';
  }

  /**
   * Shows the diagram or the documentation of a page (the active one by
   * default) and makes it the active page. In the documentation, the open
   * chapter is also the selection, so "this chapter" means it.
   */
  showView(view: PageView, opts: { page?: string; chapter?: string } = {}): boolean {
    const page = opts.page != null ? this.pages.find((p) => p.id === opts.page) : this.active;
    if (page == null) return false;
    const store = page.store;
    const chapter = view === 'doc'
      ? (store.scene.blocks.find((b) => b.id === opts.chapter) ?? store.scene.blocks.find((b) => b.id === page.chapter) ??
        store.scene.blocks[0])?.id
      : page.chapter;
    const changed = page.id !== this.activeId || (page.view ?? 'diagram') !== view || page.chapter !== chapter;
    this.activeId = page.id;
    page.view = view === 'doc' ? 'doc' : undefined;
    page.chapter = chapter;
    const blocks = new Set(store.scene.blocks.map((b) => b.id));
    if (view === 'doc') {
      store.setSelection(chapter != null ? [chapter] : []);
    } else if (store.selection.some((id) => blocks.has(id))) {
      store.setSelection(store.selection.filter((id) => !blocks.has(id)));
    }
    if (changed) this.emit();
    return changed;
  }

  /** Closes a page (the last page cannot be closed). Its diagram stays in the history. */
  removePage(id: string): RemovedPage | null {
    const index = this.pageIndex(id);
    if (index < 0 || this.pages.length <= 1) return null;
    const page = this.pages[index];
    const wasActive = id === this.activeId;
    this.unsubscribe.get(id)?.();
    this.unsubscribe.delete(id);
    this.pages.splice(index, 1);
    this.current.delete(id);
    if (wasActive) this.activeId = this.pages[Math.min(index, this.pages.length - 1)].id;
    const removed = { page, index, wasActive };
    this.emit();
    for (const l of this.removedListeners) l(removed);
    return removed;
  }

  /** Undoes removePage. */
  restorePage(r: RemovedPage) {
    if (this.pages.some((p) => p.id === r.page.id)) return;
    const page = this.attach(r.page.id, r.page.store, Math.min(r.index, this.pages.length));
    page.viewport = r.page.viewport;
    this.sync(page);
    if (r.wasActive) this.activeId = page.id;
    this.emit();
  }

  /** Renames a page (its diagram title). */
  renamePage(id: string, title: string, meta: ChangeMeta = { source: 'manual' }): boolean {
    const page = this.pages.find((p) => p.id === id);
    const t = title.trim();
    if (page == null || t === '' || t === page.store.scene.title) return false;
    return page.store.edit({ title: t }, { ...meta, label: meta.label ?? `Renamed the page to “${t}”` }).ok;
  }

  /** Moves a page left (-1) or right (+1). */
  movePage(id: string, delta: number) {
    const from = this.pageIndex(id);
    const to = Math.max(0, Math.min(this.pages.length - 1, from + delta));
    if (from < 0 || from === to) return;
    const [page] = this.pages.splice(from, 1);
    this.pages.splice(to, 0, page);
    this.emit();
  }

  duplicatePage(id: string): Page | null {
    const page = this.pages.find((p) => p.id === id);
    if (page == null) return null;
    const title = `${this.pageTitle(page)} (copy)`;
    this.activeId = id;
    return this.addPage({ scene: page.store.scene, title, label: `Duplicated “${this.pageTitle(page)}”` });
  }

  /**
   * Finds a page from a spoken or typed reference: its id, its title, its
   * number ("2", "page 2", "the second tab") or "next", "previous", "last".
   */
  findPage(ref: string | undefined): Resolution<Page> {
    if (ref == null || ref.trim() === '') return { item: this.active };
    const exact = this.pages.find((p) => p.id === ref);
    if (exact) return { item: exact };
    const words = ref.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const at = (i: number): Resolution<Page> => (i >= 0 && i < this.pages.length
      ? { item: this.pages[i], note: `"${ref}" → ${this.pages[i].id}` }
      : { error: `There is no page ${i + 1} (there are ${this.pages.length}).` });
    const tabWords = new Set(['page', 'tab', 'sheet', 'pagina', 'tabul', 'foaia', 'the', 'a', 'to', 'la', 'pe']);
    const rest = words.filter((w) => !tabWords.has(w));
    if (rest.length === 1) {
      const w = rest[0];
      if (/^\d+$/.test(w)) return at(Number(w) - 1);
      if (ORDINALS[w] != null) return at(ORDINALS[w] - 1);
      const cur = this.pageIndex(this.activeId);
      if (w === 'last' || w === 'ultima' || w === 'ultimul') return at(this.pages.length - 1);
      if (w === 'next' || w === 'urmatoarea' || w === 'urmatorul') return at(Math.min(cur + 1, this.pages.length - 1));
      if (w === 'previous' || w === 'prev' || w === 'anterioara' || w === 'precedenta') return at(Math.max(cur - 1, 0));
      if (w === 'current' || w === 'this' || w === 'curenta') return { item: this.active };
    }
    const items = this.pages.map((p) => ({ id: p.id, label: this.pageTitle(p), page: p }));
    let r = resolveRef(ref, items, 'page');
    if (r.item == null && rest.length > 0 && rest.length < words.length) {
      const key = normalize(rest.join(''));
      const found = items.filter((i) => normalize(i.label).includes(key));
      if (found.length === 1) r = { item: found[0], note: `"${ref}" → ${found[0].id}` };
    }
    return { item: r.item?.page, note: r.note, error: r.error };
  }

  /** Opens a diagram from the history: its page if it is open, otherwise on a new page. */
  openEntry(entryId: string): Page | null {
    const live = this.pageOfEntry(entryId);
    if (live != null) {
      this.switchTo(live.id);
      return live;
    }
    const entry = this.library.find((e) => e.id === entryId);
    if (entry == null) return null;
    // The page continues that history entry instead of starting a new one
    return this.addPage({ scene: entry.scene, label: `Opened “${entry.title}” from the history`, entry: entry.id });
  }

  /** Removes a diagram from the history (an open page keeps it, but it is no longer tracked). */
  removeEntry(entryId: string): RemovedEntry | null {
    const index = this.library.findIndex((e) => e.id === entryId);
    if (index < 0) return null;
    const removed: RemovedEntry = { entry: this.library[index], index, links: [] };
    this.library.splice(index, 1);
    for (const [pageId, map] of this.origins) {
      for (const [origin, id] of map) {
        if (id === entryId) {
          map.set(origin, DISMISSED);
          removed.links.push([pageId, origin]);
        }
      }
      if (this.current.get(pageId) === entryId) this.current.delete(pageId);
    }
    this.emit();
    return removed;
  }

  /** Undoes removeEntry. */
  restoreEntry(r: RemovedEntry) {
    if (this.library.some((e) => e.id === r.entry.id)) return;
    this.library.splice(Math.min(r.index, this.library.length), 0, r.entry);
    for (const [pageId, origin] of r.links) this.originsOf(pageId).set(origin, r.entry.id);
    for (const p of this.pages) this.sync(p);
    this.emit();
  }

  /** Removes every history entry that is not open on a page. */
  clearClosedEntries() {
    const live = new Set(this.current.values());
    this.library = this.library.filter((e) => live.has(e.id));
    this.emit();
  }

  serialize(): SavedWorkspace {
    return {
      version: 2,
      active: this.activeId,
      pages: this.pages.map((p) => ({
        id: p.id, scene: p.store.scene, diagram: this.current.get(p.id),
        ...(p.view === 'doc' ? { view: p.view } : {}), ...(p.chapter != null ? { chapter: p.chapter } : {}),
      })),
      library: this.library,
    };
  }
}
