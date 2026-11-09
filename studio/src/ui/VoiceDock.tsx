/**
 * The voice dock: a floating toolbar at the bottom of the canvas with the mic
 * button (large FAB), the live transcript and state, and a text field for
 * typed requests.
 */
import { useEffect, useRef, useState } from 'react';
import { Icon, useStudio, useVoice } from './context';

const STATUS_TEXT: Record<string, string> = {
  idle: 'Tap the mic and describe a diagram',
  connecting: 'Connecting…',
  listening: 'Listening…',
  working: 'Updating the diagram…',
  speaking: 'Speaking…',
  error: 'Voice stopped',
};

export function VoiceDock({ typing, setTyping }: { typing: boolean; setTyping: (t: boolean) => void }) {
  const { agent, toggleVoice } = useStudio();
  const v = useVoice(agent);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typing) inputRef.current?.focus();
  }, [typing]);

  const live = v.status !== 'idle' && v.status !== 'error';
  const send = () => {
    const t = text.trim();
    if (t === '') return;
    setText('');
    agent.sendText(t).catch(() => undefined);
  };

  const status = v.status === 'error' ? v.error ?? STATUS_TEXT.error
    : v.status === 'listening' && !v.micOn ? 'Connected · type a request or tap the mic' : STATUS_TEXT[v.status];
  const transcript = v.heard;
  const reply = v.reply;
  const ring = v.micOn ? 1 + Math.min(1, v.level) * 0.35 : 1;

  return (
    <div className={`voice-dock status-${v.status}`} role="region" aria-label="Voice assistant">
      <button
        type="button"
        className={`icon-btn standard${typing ? ' selected' : ''}`}
        onClick={() => setTyping(!typing)}
        aria-label={typing ? 'Hide the text field' : 'Type a request'}
        aria-pressed={typing}
        data-tooltip="Type instead (/)"
      >
        <Icon name="keyboard" />
      </button>

      <div className="dock-center">
        {(!typing || live || reply !== '') && (
          <div className={`dock-transcript${typing ? ' compact' : ''}`} aria-live="polite">
            <div className="dock-status">
              <span className="status-dot" />
              <span>{status}</span>
              {v.lastLatency != null && live && <span className="latency">· last change {v.lastLatency.toFixed(1)} s</span>}
            </div>
            <div className="dock-text">
              {reply ? <span className="reply">{reply}</span> : transcript ? <span className="heard">“{transcript}”</span>
                : <span className="hint">{live ? 'Say what to draw or change' : 'Or press Space'}</span>}
            </div>
          </div>
        )}
        {typing && (
          <form className="dock-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) {
                  if (e.key === 'Enter') e.preventDefault();
                  return;
                }
                if (e.key === 'Escape') {
                  e.currentTarget.blur();
                  setTyping(false);
                }
              }}
              placeholder="Describe a diagram or a change…"
              aria-label="Request"
            />
            <button type="submit" className="icon-btn standard" disabled={text.trim() === ''} aria-label="Send" data-tooltip="Send (Enter)">
              <Icon name="send" />
            </button>
          </form>
        )}
      </div>

      <button
        type="button"
        className={`mic-fab${v.micOn ? ' on' : ''}${v.status === 'connecting' ? ' busy' : ''}`}
        onClick={toggleVoice}
        aria-label={v.micOn || v.status === 'connecting' ? 'Stop voice' : 'Start voice'}
        aria-pressed={v.micOn || v.status === 'connecting'}
        data-tooltip={v.micOn || v.status === 'connecting' ? 'Stop (Space)' : 'Talk (Space)'}
      >
        <span className="mic-ring" style={{ transform: `scale(${ring})` }} />
        <Icon name={v.micOn ? 'mic-fill' : 'mic'} size={28} />
      </button>
    </div>
  );
}
