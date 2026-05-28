import { motion } from 'framer-motion';
import {
  Code2,
  Cpu,
  Globe,
  Hammer,
  Layers,
  Music,
  Sparkles,
  View,
} from 'lucide-react';
import { useAppState, type AppState } from '../../app/state/useAppState';

type StudioMode = AppState['activeMode'];

const MODES: { id: StudioMode; label: string; icon: typeof View }[] = [
  { id: 'Design', label: 'Design', icon: View },
  { id: 'Code', label: 'Code', icon: Code2 },
  { id: 'World', label: 'World', icon: Layers },
  { id: 'Render', label: 'Render', icon: Cpu },
  { id: 'Audio', label: 'Audio', icon: Music },
  { id: 'Network', label: 'Network', icon: Globe },
  { id: 'Build', label: 'Build', icon: Hammer },
  { id: 'AI', label: 'AI', icon: Sparkles },
];

export function ModeSwitcher() {
  const activeMode = useAppState((s) => s.activeMode);
  const setActiveMode = useAppState((s) => s.actions.setActiveMode);

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-md bg-vyb-charcoal/90 border border-vyb-line/80 shadow-panel overflow-x-auto max-w-[min(100%,52rem)]">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = m.id === activeMode;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMode(m.id)}
            className={`relative z-10 vyb-tab shrink-0 ${active ? 'vyb-tab-active' : ''}`}
          >
            {active ? (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-md border border-vyb-plasma/40 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,107,26,0.15) 0%, rgba(255,107,26,0.04) 100%)',
                  boxShadow: '0 0 14px rgba(255,107,26,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            ) : null}
            <span className={`relative z-10 flex items-center gap-1.5 ${active ? 'text-vyb-text' : ''}`}>
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
