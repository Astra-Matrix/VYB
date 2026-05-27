import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vyb: {
          bg: '#0a0b0f',
          surface: '#12141a',
          panel: '#181b24',
          elevated: '#1f2430',
          border: '#2a3142',
          muted: '#6b7289',
          text: '#e8ecf4',
          accent: '#5b8def',
          accentDim: '#3d5a8a',
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
          glow: 'rgba(91, 141, 239, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        panel: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
