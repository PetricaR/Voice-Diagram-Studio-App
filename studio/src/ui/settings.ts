import { DEFAULT_SETTINGS, type VoiceSettings } from '../agent/session';
import type { ThemeMode } from './theme';

export { LIVE_MODELS, VOICES } from '../voice/liveSetup';

export interface Settings extends VoiceSettings {
  themeMode: ThemeMode;
  seedColor: string;
}

const KEY = 'studio.settings';

export const DEFAULTS: Settings = { ...DEFAULT_SETTINGS, themeMode: 'system', seedColor: '#3367d6' };

/** Reads the settings; storage may be unavailable (private windows), so it never throws. */
export function loadSettings(): Settings {
  let stored: Partial<Settings> & { apiKey?: unknown } = {};
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    // Earlier versions kept the Gemini API key here; it now stays on the server
    if (stored != null && 'apiKey' in stored) {
      delete stored.apiKey;
      localStorage.setItem(KEY, JSON.stringify(stored));
    }
  } catch {
    // defaults
  }
  return { ...DEFAULTS, ...stored };
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // not persisted
  }
}
