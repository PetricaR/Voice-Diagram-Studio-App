/**
 * Material 3 color system: the whole UI is themed from one seed color with
 * Google's material-color-utilities (tonal spot scheme, light and dark), and
 * the diagram colors come from tonal palettes with fixed hues so they stay
 * harmonious in both themes.
 */
import {
  Hct, MaterialDynamicColors, SchemeTonalSpot, TonalPalette, argbFromHex, hexFromArgb,
} from '@material/material-color-utilities';
import type { ColorName, NodeKind } from '../engine/types';

export type ThemeMode = 'system' | 'light' | 'dark';

const ROLES: Record<string, keyof typeof MaterialDynamicColors> = {
  primary: 'primary', 'on-primary': 'onPrimary', 'primary-container': 'primaryContainer',
  'on-primary-container': 'onPrimaryContainer', secondary: 'secondary', 'on-secondary': 'onSecondary',
  'secondary-container': 'secondaryContainer', 'on-secondary-container': 'onSecondaryContainer',
  tertiary: 'tertiary', 'on-tertiary': 'onTertiary', 'tertiary-container': 'tertiaryContainer',
  'on-tertiary-container': 'onTertiaryContainer', error: 'error', 'on-error': 'onError',
  'error-container': 'errorContainer', 'on-error-container': 'onErrorContainer',
  surface: 'surface', 'surface-dim': 'surfaceDim', 'surface-bright': 'surfaceBright',
  'surface-container-lowest': 'surfaceContainerLowest', 'surface-container-low': 'surfaceContainerLow',
  'surface-container': 'surfaceContainer', 'surface-container-high': 'surfaceContainerHigh',
  'surface-container-highest': 'surfaceContainerHighest', 'on-surface': 'onSurface',
  'on-surface-variant': 'onSurfaceVariant', outline: 'outline', 'outline-variant': 'outlineVariant',
  'inverse-surface': 'inverseSurface', 'inverse-on-surface': 'inverseOnSurface',
  'inverse-primary': 'inversePrimary', scrim: 'scrim', shadow: 'shadow',
};

/** Hues of the diagram colors (HCT). */
const HUES: Record<ColorName, [number, number]> = {
  blue: [262, 40], green: [145, 36], orange: [55, 48], red: [25, 52], purple: [300, 36],
  teal: [190, 32], pink: [350, 40], yellow: [90, 44], gray: [262, 6],
};

function schemeVars(seed: string, dark: boolean): string {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(seed)), dark, 0);
  const vars: string[] = [];
  for (const [name, role] of Object.entries(ROLES)) {
    const color = MaterialDynamicColors[role] as unknown as { getArgb: (s: SchemeTonalSpot) => number };
    vars.push(`--md-${name}: ${hexFromArgb(color.getArgb(scheme))};`);
  }
  for (const [name, [hue, chroma]] of Object.entries(HUES)) {
    const p = TonalPalette.fromHueAndChroma(hue, chroma);
    // container, on-container, accent (borders, edges) and a faint tint (groups)
    vars.push(`--c-${name}-container: ${hexFromArgb(p.tone(dark ? 30 : 92))};`);
    vars.push(`--c-${name}-on: ${hexFromArgb(p.tone(dark ? 90 : 20))};`);
    vars.push(`--c-${name}-accent: ${hexFromArgb(p.tone(dark ? 75 : 45))};`);
    // Group backgrounds: very little color, so content stays readable
    const faint = TonalPalette.fromHueAndChroma(hue, Math.min(chroma, 16));
    vars.push(`--c-${name}-tint: ${hexFromArgb(faint.tone(dark ? 13 : 97))};`);
  }
  vars.push(`color-scheme: ${dark ? 'dark' : 'light'};`);
  return vars.join('\n  ');
}

/** Writes the theme as CSS custom properties. */
export function applyTheme(seed: string, mode: ThemeMode) {
  const light = schemeVars(seed, false);
  const dark = schemeVars(seed, true);
  const css = mode === 'light' ? `:root {\n  ${light}\n}`
    : mode === 'dark' ? `:root {\n  ${dark}\n}`
    : `:root {\n  ${light}\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n  ${dark}\n  }\n}`;
  let style = document.getElementById('md-theme') as HTMLStyleElement | null;
  if (style == null) {
    style = document.createElement('style');
    style.id = 'md-theme';
    document.head.appendChild(style);
  }
  style.textContent = css;
}

export const SEED_COLORS = ['#3367d6', '#0b8043', '#7b5cd6', '#c2185b', '#00838f', '#e37400'];

/** Default diagram color of each kind, so the same kind always looks the same. */
export function kindColor(kind: NodeKind): ColorName {
  switch (kind) {
    case 'database': case 'storage': case 'analytics': case 'document':
      return 'teal';
    case 'cache':
      return 'green';
    case 'queue': case 'email': case 'decision':
      return 'orange';
    case 'gateway': case 'loadbalancer': case 'network': case 'io':
      return 'purple';
    case 'ai':
      return 'pink';
    case 'security': case 'end':
      return 'red';
    case 'user': case 'client': case 'mobile': case 'external':
      return 'gray';
    case 'start':
      return 'green';
    case 'note':
      return 'yellow';
    default:
      return 'blue';
  }
}
