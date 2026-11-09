import { useEffect, useRef, useState } from 'react';
import type { KeyStatus } from '../voice/liveToken';
import { Icon, IconButton, useStudio } from './context';
import type { IconName } from './icons';
import { LIVE_MODELS, VOICES, type Settings } from './settings';
import { SEED_COLORS, type ThemeMode } from './theme';

const SEED_NAMES: Record<string, string> = {
  '#3367d6': 'Blue',
  '#0f9d58': 'Green',
  '#7c4dff': 'Purple',
  '#c5221f': 'Red',
  '#e37400': 'Amber',
  '#00838f': 'Teal',
};

const KEY_STATUS: Record<KeyStatus, { icon: IconName; text: string }> = {
  configured: {
    icon: 'lock',
    text: 'Kept on the studio server. This browser never sees it: every session gets a single-use token that expires within 30 minutes.',
  },
  missing: {
    icon: 'error',
    text: 'The studio server has no key yet. In a terminal, run ./studio.sh key (on a Mac it goes into the Keychain), then try again.',
  },
  unknown: {
    icon: 'error',
    text: 'The studio server cannot be reached, so voice is off. Start the app with ./studio.sh.',
  },
};

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setSettings, liveKey, refreshLiveKey } = useStudio();
  const [draft, setDraft] = useState<Settings>(settings);
  const ref = useRef<HTMLDialogElement>(null);
  const keyStatus = KEY_STATUS[liveKey];

  useEffect(() => {
    const d = ref.current;
    if (d == null) return;
    if (open && !d.open) {
      setDraft(settings);
      refreshLiveKey();
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, settings, refreshLiveKey]);

  // Light-dismiss fallback when native closedby="any" is not supported
  useEffect(() => {
    const d = ref.current;
    if (d == null || 'closedBy' in HTMLDialogElement.prototype) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener('click', onClick);
    return () => d.removeEventListener('click', onClick);
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const save = () => {
    setSettings(draft);
    onClose();
  };

  return (
    <dialog ref={ref} className="dialog" closedby="any" onClose={onClose} aria-labelledby="settings-title">
      <form method="dialog" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <header className="dialog-header">
          <h2 id="settings-title">Settings</h2>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </header>

        <section className="dialog-section">
          <h3>Gemini</h3>
          <div className="field">
            <span id="settings-api-key">API key</span>
            <p className={`key-status ${liveKey}`} role="status" aria-labelledby="settings-api-key">
              <Icon name={keyStatus.icon} size={20} />
              <span>{keyStatus.text}</span>
            </p>
            <small>Get a key at aistudio.google.com/apikey and restrict it to the Generative Language API.</small>
          </div>
          <div className="field">
            <label htmlFor="settings-live-model">Live model</label>
            <input
              id="settings-live-model"
              list="live-models"
              value={draft.model}
              onChange={(e) => set('model', e.target.value.trim())}
              spellCheck={false}
              aria-describedby="settings-live-model-hint"
            />
            <datalist id="live-models">
              {LIVE_MODELS.map((m) => <option key={m} value={m} />)}
            </datalist>
            <small id="settings-live-model-hint">Models with “thinking” reason more before they edit, but answer slower.</small>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Voice</span>
              <select value={draft.voice} onChange={(e) => set('voice', e.target.value)}>
                {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Pause before answering: {(draft.silenceDurationMs / 1000).toFixed(1)} s</span>
              <input
                type="range" min={300} max={1500} step={100}
                value={draft.silenceDurationMs}
                onChange={(e) => set('silenceDurationMs', Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="dialog-section">
          <h3>Appearance</h3>
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {(['system', 'light', 'dark'] as ThemeMode[]).map((m, i, arr) => (
              <button
                key={m} type="button" role="radio" aria-checked={draft.themeMode === m}
                tabIndex={draft.themeMode === m ? 0 : -1}
                className={draft.themeMode === m ? 'active' : ''}
                onClick={() => set('themeMode', m)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = arr[(i + 1) % arr.length];
                    set('themeMode', next);
                    (e.currentTarget.parentElement?.children[(i + 1) % arr.length] as HTMLElement | undefined)?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = arr[(i - 1 + arr.length) % arr.length];
                    set('themeMode', prev);
                    (e.currentTarget.parentElement?.children[(i - 1 + arr.length) % arr.length] as HTMLElement | undefined)?.focus();
                  }
                }}
              >
                {draft.themeMode === m && <Icon name="check" size={18} />}
                {m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
          <div className="seed-row" role="radiogroup" aria-label="Accent color">
            {SEED_COLORS.map((c, i, arr) => (
              <button
                key={c} type="button" role="radio" aria-checked={draft.seedColor === c}
                aria-label={`${SEED_NAMES[c] ?? c} accent`}
                tabIndex={draft.seedColor === c ? 0 : -1}
                className={`seed${draft.seedColor === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => set('seedColor', c)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = arr[(i + 1) % arr.length];
                    set('seedColor', next);
                    (e.currentTarget.parentElement?.children[(i + 1) % arr.length] as HTMLElement | undefined)?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = arr[(i - 1 + arr.length) % arr.length];
                    set('seedColor', prev);
                    (e.currentTarget.parentElement?.children[(i - 1 + arr.length) % arr.length] as HTMLElement | undefined)?.focus();
                  }
                }}
              >
                {draft.seedColor === c && <Icon name="check" size={18} />}
              </button>
            ))}
          </div>
        </section>

        <footer className="dialog-actions">
          <button type="button" className="text-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="filled-btn">Save</button>
        </footer>
      </form>
    </dialog>
  );
}
