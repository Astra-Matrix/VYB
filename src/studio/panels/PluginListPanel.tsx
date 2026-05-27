import { useMemo } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { loadBuiltinPlugins } from '../../engine/plugins';

export function PluginListPanel() {
  const plugins = useMemo(() => loadBuiltinPlugins(), []);

  return (
    <GlassPanel className="p-2 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Plugins</div>
          <div className="text-[11px] text-vyb-text/55">{plugins.length} manifests loaded</div>
        </div>
      </div>

      <div className="space-y-2 overflow-auto pr-1" style={{ maxHeight: 240 }}>
        {plugins.length === 0 ? (
          <div className="text-[11px] text-vyb-text/55 px-1 py-3">No plugin manifests found.</div>
        ) : (
          plugins.slice(0, 80).map((p) => (
            <div key={p.manifest.pluginId} className="rounded-lg border border-vyb-border/40 bg-black/10 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-vyb-text/85 truncate">{p.manifest.name}</div>
                  <div className="text-[11px] text-vyb-text/50 truncate">{p.manifest.pluginId}</div>
                </div>
                <div className="text-[11px] text-vyb-text/40 whitespace-nowrap">{p.manifest.version}</div>
              </div>
              <div className="text-[11px] text-vyb-text/55 mt-2 leading-relaxed">
                Permissions: {p.manifest.permissions.length} • Entry: {p.manifest.entrypoint.editor}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

