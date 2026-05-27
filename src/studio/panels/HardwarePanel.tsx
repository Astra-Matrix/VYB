import { useEffect, useState } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';
import type { HardwareCapabilities } from '../../engine/hardware/hardwareCapabilities';
import { probeHardware } from '../../app/commands/tauriCommands';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] py-1">
      <div className="text-vyb-text/60">{label}</div>
      <div className="text-vyb-text/80 text-right">{value}</div>
    </div>
  );
}

export function HardwarePanel() {
  const cap = useAppState((s) => s.hardwareCapabilities);
  const capAt = useAppState((s) => s.hardwareLastProbedAt);
  const setHardwareCapabilities = useAppState((s) => s.actions.setHardwareCapabilities);

  const [isProbing, setIsProbing] = useState(false);

  useEffect(() => {
    if (cap) return;
    // First probe is optional; the panel remains useful with placeholders.
  }, [cap]);

  return (
    <GlassPanel className="p-2 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Hardware</div>
          <div className="text-[11px] text-vyb-text/55">Capability reporting scaffold</div>
        </div>
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={async () => {
            try {
              setIsProbing(true);
              const result = await probeHardware();
              // Scaffold: result is unknown until rust command is implemented.
              setHardwareCapabilities(result as HardwareCapabilities, new Date().toISOString());
            } catch (e) {
              setHardwareCapabilities(
                {
                  probeStatus: 'unknown',
                  gpu: { available: false, backend: 'web-unknown' },
                  cpu: {},
                  ram: {},
                  storage: {},
                } as HardwareCapabilities,
                new Date().toISOString(),
              );
            } finally {
              setIsProbing(false);
            }
          }}
          disabled={isProbing}
        >
          {isProbing ? 'Probing…' : 'Probe'}
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-1 space-y-2">
        {!cap ? (
          <div className="text-xs text-vyb-text/55 px-1 py-3">
            Hardware probe has not run yet. This scaffold is designed to integrate WebGPU + native probes later.
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
              <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">GPU</div>
              <Row label="Available" value={cap.gpu.available ? 'Yes' : 'No'} />
              <Row label="Backend" value={cap.gpu.backend} />
              {cap.gpu.maxTextureSize ? <Row label="Max texture" value={`${cap.gpu.maxTextureSize}`} /> : null}
            </div>
            <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
              <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">CPU / RAM</div>
              <Row label="Cores" value={cap.cpu.cores ? String(cap.cpu.cores) : 'Unknown'} />
              <Row label="RAM" value={cap.ram.totalGb ? `~${cap.ram.totalGb} GB` : 'Unknown'} />
            </div>
            <div className="text-[11px] text-vyb-text/45">
              Last probed: {capAt ? new Date(capAt).toLocaleString() : '—'}
            </div>
          </>
        )}
      </div>
    </GlassPanel>
  );
}

