import { createContext, useContext, useSyncExternalStore } from 'react';
import type { VoiceAgent, VoiceSnapshot } from '../agent/session';
import type { DiagramStore } from '../engine/store';
import type { Workspace } from '../engine/workspace';
import type { AuthStatus, KeyStatus } from '../voice/liveToken';
import { ICONS, type IconName } from './icons';
import type { Settings } from './settings';

export interface Studio {
  workspace: Workspace;
  /** The diagram of the active page. */
  store: DiagramStore;
  agent: VoiceAgent;
  settings: Settings;
  setSettings: (s: Settings) => void;
  /** Whether the studio server has a Gemini API key (the page never sees the key). */
  liveKey: KeyStatus;
  refreshLiveKey: () => void;
  notify: (message: string, action?: { label: string; run: () => void }) => void;
  openSettings: () => void;
  /** Starts or stops the voice session. */
  toggleVoice: () => void;
  /** Whether the studio server requires sign-in, and who is signed in. */
  auth: AuthStatus;
  requestSignIn: () => void;
  signOut: () => void;
  /** True when Gemini can be asked now; otherwise it asks for sign-in or a key and returns false. */
  ensureCanTalk: () => boolean;
}

export const StudioContext = createContext<Studio | null>(null);

export function useStudio(): Studio {
  const s = useContext(StudioContext);
  if (s == null) throw new Error('StudioContext missing');
  return s;
}

/** Re-renders on every change of any page, and when pages are added, closed or switched. */
export function useWorkspaceRevision(workspace: Workspace): number {
  return useSyncExternalStore((l) => workspace.subscribe(l), () => workspace.revision);
}

/** Re-renders on every store change. */
export function useStoreRevision(store: DiagramStore): number {
  return useSyncExternalStore((l) => store.subscribe(l), () => store.revision);
}

export function useVoice(agent: VoiceAgent): VoiceSnapshot {
  return useSyncExternalStore((l) => agent.subscribe(l), () => agent.snapshot);
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <span
      className={'icon' + (className ? ' ' + className : '')}
      style={{ width: size, height: size }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}

export function IconButton(props: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  variant?: 'standard' | 'tonal' | 'filled';
  shortcut?: string;
}) {
  const { icon, label, onClick, disabled, selected, variant = 'standard', shortcut } = props;
  return (
    <button
      type="button"
      className={`icon-btn ${variant}${selected ? ' selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={selected}
      data-tooltip={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon name={icon} />
    </button>
  );
}
