import { useEffect } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';
import { createSampleNodeGraph } from '../../engine/visual-scripting';
import { Button } from '../../ui/components/Button';

export function VisualScriptingPanel() {
  const nodeGraph = useAppState((s) => s.nodeGraph);
  const setNodeGraph = useAppState((s) => s.actions.setNodeGraph);

  useEffect(() => {
    if (nodeGraph) return;
    setNodeGraph(createSampleNodeGraph());
  }, [nodeGraph, setNodeGraph]);

  return (
    <GlassPanel className="h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-vyb-border/60 bg-vyb-panel/30">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">World / Visual Scripting</div>
          <div className="text-[11px] text-vyb-text/55">Node graph scaffold (no editor yet).</div>
        </div>
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={() => setNodeGraph(createSampleNodeGraph())}
        >
          Load sample
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {!nodeGraph ? (
          <div className="text-xs text-vyb-text/55">No node graph loaded.</div>
        ) : (
          <>
            <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-3">
              <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Graph summary</div>
              <div className="text-[11px] text-vyb-text/55 leading-relaxed">
                Name: {nodeGraph.name}
                <br />
                Execution nodes: {nodeGraph.nodes.length}
                <br />
                Connections: {nodeGraph.connections.length}
              </div>
            </div>

            <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-3">
              <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Event / logic nodes</div>
              <div className="space-y-2">
                {nodeGraph.nodes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-vyb-border/40 bg-black/10 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-vyb-text/85">{n.title}</div>
                      <div className="text-[11px] text-vyb-text/50">{n.category}</div>
                    </div>
                    <div className="text-[11px] text-vyb-text/55 mt-1">
                      Inputs: {n.inputPins.length} • Outputs: {n.outputPins.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-vyb-text/45">
              Visual scripting editor is planned for Phase 5. This panel validates the node graph data model and UI routing.
            </div>
          </>
        )}
      </div>
    </GlassPanel>
  );
}

