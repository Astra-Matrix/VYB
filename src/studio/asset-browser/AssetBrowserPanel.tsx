import { useMemo, useState } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';
import type { AssetType } from '../../engine/assets/assetTypes';

function typeLabel(t: AssetType) {
  switch (t) {
    case 'mesh':
      return 'Meshes';
    case 'texture':
      return 'Textures';
    case 'material':
      return 'Materials';
    case 'audio':
      return 'Audio';
    case 'script':
      return 'Scripts';
    case 'scene':
      return 'Scenes';
    case 'shader':
      return 'Shaders';
    case 'prefab':
      return 'Prefabs';
    case 'ai_behavior':
      return 'AI Graphs';
    default:
      return 'Assets';
  }
}

export function AssetBrowserPanel() {
  const assets = useAppState((s) => s.assetRegistry.assets);
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return assets;
    return assets.filter((a) => a.type === typeFilter);
  }, [assets, typeFilter]);

  const types = useMemo(() => {
    const set = new Set<AssetType>();
    for (const a of assets) set.add(a.type as AssetType);
    return Array.from(set).sort();
  }, [assets]);

  return (
    <GlassPanel className="p-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="text-xs font-bold tracking-wide text-vyb-text/80">Asset Browser</div>
        <div className="text-[11px] text-vyb-text/40">{assets.length} indexed</div>
      </div>

      <div className="flex gap-2 px-1 mb-2">
        <select
          className="flex-1 rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-1"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AssetType | 'all')}
        >
          <option value="all">All</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-auto px-1 space-y-1 h-[220px]">
        {assets.length === 0 ? (
          <div className="text-xs text-vyb-text/55 px-1 py-3">Index assets to populate this panel.</div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-vyb-text/55 px-1 py-3">No assets match the filter.</div>
        ) : (
          filtered.slice(0, 200).map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-vyb-border/40 bg-black/10 px-2 py-1 text-[11px] text-vyb-text/80 truncate"
              title={a.path}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{a.id.split(':').slice(1).join(':')}</span>
                <span className="text-vyb-text/40">{a.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

