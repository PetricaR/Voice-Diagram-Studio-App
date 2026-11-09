import { BLUEPRINTS, type Blueprint } from './blueprints';
import { Icon, useStudio } from './context';

export function EmptyState() {
  const { store, agent, liveKey, toggleVoice } = useStudio();
  const launchBlueprint = (b: Blueprint) => {
    if (liveKey === 'configured') {
      agent.sendText(b.prompt).catch(() => undefined);
    } else {
      store.create(b.diagram, {
        source: 'system',
        label: `Created “${b.diagram.title}”`,
        request: b.prompt,
      }).catch(() => undefined);
    }
  };
  return (
    <div className="empty-state">
      <div className="empty-card">
        <div className="empty-icon"><Icon name="graphic_eq" size={32} /></div>
        <h1>Speak your diagram</h1>
        <p>
          Describe a system, a process or an idea. Then keep talking to refine it — every request
          is a precise edit of what is on the canvas, never a redraw.
        </p>
        <button type="button" className="filled-btn" onClick={toggleVoice}>
          <Icon name="mic" size={20} /> Start talking
        </button>
        <div className="suggestions" role="group" aria-label="Architecture and Gen AI blueprints">
          {BLUEPRINTS.map((b) => (
            <button key={b.id} type="button" className="suggestion-chip" onClick={() => launchBlueprint(b)}>
              <span className="suggestion-head">
                <Icon name={b.icon} size={18} />
                <span className="suggestion-title">{b.title}</span>
              </span>
              <span className="suggestion-meta">{b.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
