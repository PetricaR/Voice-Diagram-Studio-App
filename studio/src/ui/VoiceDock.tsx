/**
 * The assistant composer at the bottom of the canvas: one Material 3 surface
 * for both ways of asking, after the input patterns of Google's AI products.
 *
 * - The text field is always there. "/" focuses it, Enter sends, Shift+Enter
 *   starts a new line, and it grows with the text.
 * - Talk starts a live voice conversation. While one runs, Talk becomes a
 *   microphone toggle and an End button, so it is always clear how to stop.
 * - A live strip above the field shows the session: a waveform that follows
 *   the microphone, what the assistant is doing, and what it heard or answered.
 */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import type { VoiceSnapshot } from '../agent/session';
import { Icon, useStudio, useVoice } from './context';

const STATUS: Record<VoiceSnapshot['status'], string> = {
  idle: '',
  connecting: 'Connecting…',
  listening: 'Listening',
  working: 'Updating the diagram…',
  speaking: 'Replying',
  error: 'Voice stopped',
};

function statusLabel(v: VoiceSnapshot): string {
  if (v.status === 'error') return v.error ?? STATUS.error;
  if (v.status === 'listening' && !v.micOn) return 'Microphone off';
  return STATUS[v.status];
}

const COMPACT = typeof window === 'undefined' ? null : window.matchMedia('(max-width: 720px)');

function subscribeCompact(listener: () => void): () => void {
  COMPACT?.addEventListener('change', listener);
  return () => COMPACT?.removeEventListener('change', listener);
}

/** Four bars: they follow the microphone while listening and move on their own while the model works or replies. */
function Waveform({ level }: { level: number }) {
  return (
    <span className="wave" style={{ '--level': level.toFixed(2) } as CSSProperties} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

export function VoiceDock({ focusRequest }: { focusRequest: number }) {
  const { agent, toggleVoice, openSettings, requestSignIn, ensureCanTalk } = useStudio();
  const v = useVoice(agent);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  // Phones get shorter placeholders, so they fit on one line
  const compact = useSyncExternalStore(subscribeCompact, () => COMPACT?.matches ?? false);

  // "/" anywhere on the page
  useEffect(() => {
    if (focusRequest > 0) fieldRef.current?.focus();
  }, [focusRequest]);

  // The snackbar and the empty state stay clear of the dock as it grows
  useLayoutEffect(() => {
    const dock = dockRef.current;
    const host = dock?.parentElement;
    if (dock == null || host == null) return;
    const update = () => host.style.setProperty('--dock-space', `${Math.ceil(dock.offsetHeight) + 36}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(dock);
    return () => {
      observer.disconnect();
      host.style.removeProperty('--dock-space');
    };
  }, []);

  const session = v.status !== 'idle' && v.status !== 'error';
  const connecting = v.status === 'connecting';
  const isError = v.status === 'error';
  const keyProblem = isError && /key/i.test(v.error ?? '');
  const signInProblem = isError && v.errorCode === 'signed-out';
  // Trying again cannot help before tomorrow, or before the server is set up
  const final = isError && (v.errorCode === 'daily-limit' || v.errorCode === 'busy' || v.errorCode === 'auth-not-configured');
  const hasText = text.trim() !== '';

  const send = () => {
    const t = text.trim();
    if (t === '') return;
    // The text stays in the field while the user signs in
    if (!session && !ensureCanTalk()) return;
    setText('');
    agent.sendText(t).catch(() => undefined);
  };

  const toggleMic = () => {
    if (v.micOn) agent.muteMic();
    else agent.start(true).catch(() => undefined);
  };

  let caption: ReactNode = null;
  if (v.reply) caption = <span className="reply">{v.reply}</span>;
  else if (v.heard) caption = <span className="heard">{v.heard}</span>;
  else if (v.status === 'listening') {
    caption = <span className="hint">{v.micOn ? 'Say what to draw or change' : 'Type a request below, or turn the microphone on'}</span>;
  }

  const classes = ['voice-dock', `state-${v.status}`];
  if (session) classes.push('live');
  if (v.micOn) classes.push('mic-on');

  return (
    <div ref={dockRef} className={classes.join(' ')} role="region" aria-label="Assistant">
      {v.status !== 'idle' && (
        <div className="dock-live">
          <div className="dock-live-head">
            {isError ? <Icon name="error" size={18} className="dock-error-icon" />
              : <Waveform level={v.status === 'listening' && v.micOn ? v.level : 0} />}
            <span className="dock-status" role="status">{statusLabel(v)}</span>
            {session && v.lastLatency != null && (
              <span className="dock-latency" data-tooltip="Time from your request to the change on the canvas">
                Last edit {v.lastLatency.toFixed(1)} s
              </span>
            )}
            {isError && (
              <>
                {!final && (
                  <button type="button" className="text-btn small" onClick={signInProblem ? requestSignIn : keyProblem ? openSettings : toggleVoice}>
                    {signInProblem ? 'Sign in' : keyProblem ? 'Settings' : 'Try again'}
                  </button>
                )}
                <button type="button" className="icon-btn dock-dismiss" onClick={() => agent.stop()} aria-label="Dismiss" data-tooltip="Dismiss">
                  <Icon name="close" size={18} />
                </button>
              </>
            )}
          </div>
          {caption && <div className="dock-text">{caption}</div>}
        </div>
      )}

      <form className="dock-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          ref={fieldRef}
          className="dock-field"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            } else if (e.key === 'Escape') {
              e.currentTarget.blur();
            }
          }}
          placeholder={session && v.micOn ? (compact ? 'Type while you talk…' : 'Type a request while you talk…')
            : compact ? 'Describe a diagram…' : 'Describe a diagram or a change…'}
          aria-label="Request"
          enterKeyHint="send"
        />
        {!focused && !hasText && <kbd className="dock-kbd" aria-hidden="true" title="Press / to type">/</kbd>}

        <div className="dock-actions">
          {hasText && (
            <button type="submit" className="dock-send" aria-label="Send" data-tooltip="Send (Enter)">
              <Icon name="arrow_upward" size={22} />
            </button>
          )}
          {session ? (
            <>
              <button
                type="button"
                className={`dock-mic${v.micOn ? ' on' : ''}`}
                onClick={toggleMic}
                disabled={connecting}
                aria-label={v.micOn ? 'Mute the microphone' : 'Turn the microphone on'}
                data-tooltip={v.micOn ? 'Mute' : 'Turn the microphone on (Space)'}
              >
                {connecting ? <span className="dock-spinner" aria-hidden="true" />
                  : <Icon name={v.micOn ? 'mic-fill' : 'mic_off'} size={22} />}
              </button>
              <button
                type="button"
                className="dock-end"
                onClick={() => agent.stop()}
                aria-label="End the voice session"
                data-tooltip={v.micOn || connecting ? 'End (Space)' : 'End'}
              >
                <Icon name="close" size={20} />
                <span>End</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`dock-talk${hasText ? ' quiet' : ''}`}
              onClick={toggleVoice}
              aria-label="Talk"
              data-tooltip="Start a voice conversation (Space)"
            >
              <Icon name="mic" size={20} />
              <span>Talk</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
