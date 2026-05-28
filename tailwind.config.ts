import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vyb: {
          bg: '#050608',
          charcoal: '#0a0c10',
          graphite: '#0f1218',
          gunmetal: '#161b24',
          'silver-dark': '#1e2430',
          surface: '#12161f',
          panel: '#181e28',
          elevated: '#1f2632',
          border: '#2a3348',
          line: '#222a38',
          'line-strong': '#3a4658',
          muted: '#7b849c',
          text: '#f0f2f8',
          'text-secondary': '#b8c0d4',
          'text-bright': '#ffffff',
          plasma: '#ff6b1a',
          ember: '#ff8533',
          hot: '#ff9a3d',
          amber: '#ffb347',
          'red-glint': '#e83a2a',
          cyan: '#00c8e0',
          blue: '#3d8bff',
          violet: '#9b6dff',
          magenta: '#e85dff',
          green: '#3dd68c',
          success: '#3dd68c',
          warning: '#ffb347',
          danger: '#ff4d4d',
          glow: 'rgba(255, 107, 26, 0.35)',
          glowSoft: 'rgba(255, 107, 26, 0.18)',
          /** Legacy aliases */
          accent: '#ff6b1a',
          accentWarm: '#ffb347',
          accentEpic: '#00c8e0',
          accentDim: '#cc4f10',
        },
      },
      fontFamily: {
        sans: ['"Sora"', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'Sora', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'mesh-hero':
          'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,107,26,0.14), transparent 60%), radial-gradient(ellipse 50% 40% at 15% 20%, rgba(0,200,224,0.06), transparent 50%), radial-gradient(ellipse 60% 50% at 85% 75%, rgba(232,58,42,0.05), transparent 45%)',
        'panel-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 35%, transparent 100%)',
        'metal-base':
          'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)',
        'accent-bar':
          'linear-gradient(90deg, #ff6b1a 0%, #ffb347 45%, #e83a2a 75%, #ff8533 100%)',
        'btn-plasma':
          'linear-gradient(180deg, #ff8533 0%, #ff6b1a 45%, #cc4f10 100%)',
        'btn-metal':
          'linear-gradient(180deg, #2a3344 0%, #1a212c 50%, #12161f 100%)',
      },
      boxShadow: {
        panel: '0 4px 28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)',
        glass: '0 12px 48px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 28px rgba(255,107,26,0.4), 0 0 56px rgba(255,107,26,0.1)',
        'glow-warm': '0 0 24px rgba(255,179,71,0.3)',
        'rim-plasma': 'inset 0 0 0 1px rgba(255,107,26,0.5), 0 0 16px rgba(255,107,26,0.25)',
        'lift-hover': '0 8px 32px rgba(0,0,0,0.55), 0 0 20px rgba(255,107,26,0.15)',
      },
      backdropBlur: {
        panel: '14px',
      },
      transitionTimingFunction: {
        vyb: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'vyb-snap': 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
      transitionDuration: {
        vyb: '200ms',
        'vyb-fast': '120ms',
        'vyb-slow': '320ms',
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'rim-glow': 'rim-glow 2.4s ease-in-out infinite',
        'red-glint': 'red-glint-sweep 3s ease-in-out infinite',
        'diagnostic-pulse': 'diagnostic-pulse 1.8s ease-in-out infinite',
        'boot-spin': 'boot-spin 12s linear infinite',
        'hud-arc': 'hud-arc-pulse 2.8s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.88' },
          '50%': { opacity: '1' },
        },
        'rim-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255,107,26,0.25)' },
          '50%': { boxShadow: '0 0 22px rgba(255,107,26,0.45)' },
        },
        'red-glint-sweep': {
          '0%, 100%': { opacity: '0' },
          '45%, 55%': { opacity: '0.6' },
        },
        'diagnostic-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'boot-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'hud-arc-pulse': {
          '0%, 100%': { opacity: '0.65', strokeWidth: '2' },
          '50%': { opacity: '1', strokeWidth: '3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
