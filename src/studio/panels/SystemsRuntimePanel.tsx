import { Activity, Box, Globe, Music, PanelsTopLeft, Radio } from 'lucide-react';
import { useAppState } from '../../app/state/useAppState';
import { StudioPanel } from '../../ui/components/StudioPanel';
import { Badge } from '../../ui/components/Badge';
import { NetworkSession } from '../../engine/networking/NetworkSession';
import { useMemo, useState } from 'react';

type Tab = 'physics' | 'animation' | 'audio' | 'ui' | 'network';

const TABS: { id: Tab; label: string; icon: typeof Box }[] = [
  { id: 'physics', label: 'Physics', icon: Box },
  { id: 'animation', label: 'Animation', icon: Activity },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'ui', label: 'UI', icon: PanelsTopLeft },
  { id: 'network', label: 'Network', icon: Globe },
];

export function SystemsRuntimePanel() {
  const [tab, setTab] = useState<Tab>('physics');
  const runtimeStats = useAppState((s) => s.runtimeStats);
  const subsystems = useAppState((s) => s.runtimeSubsystems);
  const setRuntimeSubsystem = useAppState((s) => s.actions.setRuntimeSubsystem);
  const scene = useAppState((s) => s.scene);

  const demoSession = useMemo(() => {
    const s = new NetworkSession({ role: 'host', maxPlayers: 16, tickRate: 30 });
    s.connectPeer({ id: 'local', displayName: 'Host (you)', latencyMs: 12 });
    s.connectPeer({ id: 'p2', displayName: 'Player 2', latencyMs: 48 });
    return s;
  }, []);

  const entityCounts = useMemo(() => {
    if (!scene) return { rigidbody: 0, audio: 0, ui: 0, mesh: 0 };
    return {
      rigidbody: scene.world.getEntitiesWithComponent('rigidbody').length,
      audio: scene.world.getEntitiesWithComponent('audioSource').length,
      ui: scene.world.getEntitiesWithComponent('uiElement').length,
      mesh: scene.world.getEntitiesWithComponent('meshRenderer').length,
    };
  }, [scene]);

  return (
    <StudioPanel
      title="Runtime Systems"
      icon={<Radio className="w-4 h-4" />}
      className="h-full"
      noPadding
    >
      <div className="flex flex-col h-full">
        <div className="flex gap-1 p-2 border-b border-vyb-border/50 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all',
                  active
                    ? 'bg-vyb-accent/25 text-vyb-accent border border-vyb-accent/50 shadow-glow'
                    : 'text-vyb-text/60 hover:bg-white/5 border border-transparent',
                ].join(' ')}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-3 space-y-3 overflow-auto flex-1">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(subsystems) as (keyof typeof subsystems)[]).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 text-[11px] text-vyb-text/70 bg-black/20 border border-vyb-border/50 rounded-lg px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={subsystems[key]}
                  onChange={(e) => setRuntimeSubsystem(key, e.target.checked)}
                />
                {key}
              </label>
            ))}
          </div>

          {tab === 'physics' && (
            <div className="space-y-2">
              <Badge variant="accent">Phase 6</Badge>
              <p className="text-[11px] text-vyb-text/60 leading-relaxed">
                Gravity + ground collision for entities with Rigidbody and Collider. Sample cube spawns elevated — press Play with Physics enabled to watch it fall.
              </p>
              <StatRow label="Rigidbodies in scene" value={String(entityCounts.rigidbody)} />
              <StatRow label="Simulated (last tick)" value={String(runtimeStats?.physicsBodies ?? '—')} />
            </div>
          )}

          {tab === 'animation' && (
            <div className="space-y-2">
              <Badge variant="warm">Animation Director</Badge>
              <p className="text-[11px] text-vyb-text/60 leading-relaxed">
                Procedural clip playback on mesh entities during Play. Active clips update transform rotation.
              </p>
              <StatRow label="Mesh entities" value={String(entityCounts.mesh)} />
              <StatRow label="Active clips" value={String(runtimeStats?.animationClips ?? '—')} />
            </div>
          )}

          {tab === 'audio' && (
            <div className="space-y-2">
              <Badge variant="success">Audio Engine</Badge>
              <p className="text-[11px] text-vyb-text/60 leading-relaxed">
                Queues AudioSource components on Play. Full Web Audio spatial mix planned for production.
              </p>
              <StatRow label="Audio sources" value={String(entityCounts.audio)} />
              <StatRow label="Active voices" value={String(runtimeStats?.audioSources ?? '—')} />
            </div>
          )}

          {tab === 'ui' && (
            <div className="space-y-2">
              <Badge variant="muted">UI Runtime</Badge>
              <p className="text-[11px] text-vyb-text/60 leading-relaxed">
                Rebuilds widget list from UIElement components for editor overlay preview.
              </p>
              <StatRow label="UI elements" value={String(entityCounts.ui)} />
              <StatRow label="Widgets tracked" value={String(runtimeStats?.uiWidgets ?? '—')} />
            </div>
          )}

          {tab === 'network' && (
            <div className="space-y-2">
              <Badge variant="accent">Network Session</Badge>
              <p className="text-[11px] text-vyb-text/60 leading-relaxed">
                Host session scaffold with peer list and bandwidth stats. Enable Network on Play for tick simulation.
              </p>
              <StatRow label="Connected peers" value={String(runtimeStats?.networkPeers ?? demoSession.getPeers().length)} />
              {demoSession.getPeers().map((p) => (
                <div key={p.id} className="text-[11px] text-vyb-text/70 flex justify-between border-b border-vyb-border/30 py-1">
                  <span>{p.displayName}</span>
                  <span className="font-mono text-vyb-muted">{p.latencyMs} ms</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudioPanel>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px] py-1 border-b border-vyb-border/30">
      <span className="text-vyb-text/55">{label}</span>
      <span className="font-mono text-vyb-text/85">{value}</span>
    </div>
  );
}
