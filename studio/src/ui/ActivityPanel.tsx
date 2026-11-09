/**
 * Changes of the current page: every change as one entry (what was asked,
 * what changed), with undo/redo position and restoring an earlier state.
 */
import type { HistoryEntry } from '../engine/store';
import { Icon, useStoreRevision, useStudio } from './context';
import type { IconName } from './icons';

const SOURCE_ICON: Record<HistoryEntry['source'], IconName> = {
  voice: 'mic', text: 'keyboard', manual: 'pan_tool', system: 'lightbulb',
};

export function timeAgo(t: number): string {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ActivityList() {
  const { store } = useStudio();
  useStoreRevision(store);
  const entries = store.history;
  const current = store.historyIndex;

  return (
      <ol className="activity-list" role="list" aria-label="Changes on this page">
        {[...entries].map((e, i) => ({ e, i })).reverse().map(({ e, i }) => {
          const undone = i > current;
          return (
            <li key={e.id} className={`activity${i === current ? ' current' : ''}${undone ? ' undone' : ''}`}>
              <div className={`activity-icon source-${e.source}`}><Icon name={SOURCE_ICON[e.source]} size={18} /></div>
              <div className="activity-body">
                <div className="activity-title">{e.label}</div>
                {e.request && <div className="activity-request">“{e.request}”</div>}
                <div className="activity-meta">
                  {e.diff !== 'no change' && e.diff.split(', ').map((d) => <span key={d} className="chip">{d}</span>)}
                  <span>{timeAgo(e.time)}</span>
                  {undone && <span>· undone</span>}
                </div>
              </div>
              {i < current && i > 0 && (
                <button type="button" className="text-btn small" onClick={() => store.restore(e.id)} data-tooltip="Restore the diagram as it was after this step">
                  Restore
                </button>
              )}
              {undone && i === current + 1 && (
                <button type="button" className="text-btn small" onClick={() => store.redo()}>Redo</button>
              )}
            </li>
          );
        })}
      </ol>
  );
}
