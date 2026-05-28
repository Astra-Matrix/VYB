/**
 * VYB Command Center design tokens — source of truth for theme values.
 * Tailwind mirrors these in tailwind.config.ts; CSS variables in index.css.
 */

export const colors = {
  foundation: {
    bgBlack: '#050608',
    bgCharcoal: '#0a0c10',
    bgGraphite: '#0f1218',
    bgGunmetal: '#161b24',
    bgSilverDark: '#1e2430',
    surfaceMetal: '#12161f',
    surfaceElevated: '#1a212c',
    borderSubtle: '#222a38',
    borderStrong: '#3a4658',
  },
  plasma: {
    plasma: '#ff6b1a',
    ember: '#ff8533',
    hot: '#ff9a3d',
    amber: '#ffb347',
    redGlint: '#e83a2a',
  },
  signal: {
    cyan: '#00c8e0',
    blue: '#3d8bff',
    violet: '#9b6dff',
    magenta: '#e85dff',
    green: '#3dd68c',
  },
  text: {
    primary: '#f0f2f8',
    secondary: '#b8c0d4',
    muted: '#7b849c',
    bright: '#ffffff',
  },
} as const;

export const motion = {
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easingSnap: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
} as const;

export const glow = {
  plasma: '0 0 24px rgba(255, 107, 26, 0.45), 0 0 48px rgba(255, 107, 26, 0.12)',
  plasmaSoft: '0 0 16px rgba(255, 107, 26, 0.28)',
  rim: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255, 107, 26, 0.35)',
  panel: '0 4px 24px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
} as const;
