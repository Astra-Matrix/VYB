import { useEffect, useMemo, useState } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';
import { createSampleNodeGraph, createSampleShaderGraph, ShaderGraphCompiler } from '../../engine/visual-scripting';
import { graphToJson } from '../../engine/visual-scripting/graphSerializer';
import { Button } from '../../ui/components/Button';
import { NodeGraphCanvas } from './NodeGraphCanvas';

type GraphTab = 'behavior' | 'shader';

export function VisualScriptingPanel() {
  const nodeGraph = useAppState((s) => s.nodeGraph);
  const shaderGraph = useAppState((s) => s.shaderGraph);
  const runBehaviorGraphOnPlay = useAppState((s) => s.runBehaviorGraphOnPlay);
  const selectedEntityId = useAppState((s) => s.selectedEntityId);
  const setNodeGraph = useAppState((s) => s.actions.setNodeGraph);
  const setShaderGraph = useAppState((s) => s.actions.setShaderGraph);
  const setRunBehaviorGraphOnPlay = useAppState((s) => s.actions.setRunBehaviorGraphOnPlay);
  const pushConsole = useAppState((s) => s.actions.pushConsole);

  const [tab, setTab] = useState<GraphTab>('behavior');
  const [compiledWgsl, setCompiledWgsl] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeGraph) setNodeGraph(createSampleNodeGraph());
    if (!shaderGraph) setShaderGraph(createSampleShaderGraph());
  }, [nodeGraph, shaderGraph, setNodeGraph, setShaderGraph]);

  const activeGraph = tab === 'behavior' ? nodeGraph : shaderGraph;

  const shaderPreview = useMemo(() => {
    if (!shaderGraph) return null;
    return new ShaderGraphCompiler().compile(shaderGraph);
  }, [shaderGraph]);

  return (
    <GlassPanel className="h-full overflow-hidden flex flex-col p-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-vyb-border/60 bg-vyb-panel/30 gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            className={[
              'px-2 py-1 rounded-lg text-xs font-semibold border',
              tab === 'behavior' ? 'bg-vyb-accent/20 border-vyb-accent/40' : 'bg-black/10 border-vyb-border/60',
            ].join(' ')}
            onClick={() => setTab('behavior')}
          >
            Behavior Graph
          </button>
          <button
            type="button"
            className={[
              'px-2 py-1 rounded-lg text-xs font-semibold border',
              tab === 'shader' ? 'bg-vyb-accent/20 border-vyb-accent/40' : 'bg-black/10 border-vyb-border/60',
            ].join(' ')}
            onClick={() => setTab('shader')}
          >
            Shader Graph
          </button>
        </div>
        <div className="flex gap-1">
          {tab === 'behavior' ? (
            <>
              <label className="flex items-center gap-1 text-[10px] text-vyb-text/55 mr-2">
                <input
                  type="checkbox"
                  checked={runBehaviorGraphOnPlay}
                  onChange={(e) => setRunBehaviorGraphOnPlay(e.target.checked)}
                />
                Run on Play
              </label>
              <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setNodeGraph(createSampleNodeGraph())}>
                Reset sample
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => {
                if (!shaderGraph) return;
                const result = new ShaderGraphCompiler().compile(shaderGraph);
                setCompiledWgsl(result.wgsl);
                pushConsole({ level: 'info', message: `Shader compiled: ${result.surfaceColorExpression}` });
                result.warnings.forEach((w) => pushConsole({ level: 'warn', message: w }));
              }}
            >
              Compile WGSL
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col p-2 gap-2">
        {activeGraph ? (
          <NodeGraphCanvas
            graph={activeGraph}
            onChange={(g) => (tab === 'behavior' ? setNodeGraph(g) : setShaderGraph(g))}
          />
        ) : null}

        <div className="flex gap-3 text-[10px] text-vyb-text/50 shrink-0">
          <span>{activeGraph?.nodes.length ?? 0} nodes</span>
          <span>{activeGraph?.connections.length ?? 0} connections</span>
          {tab === 'behavior' && selectedEntityId ? (
            <span>Target entity: {selectedEntityId} (set on Rotate Entity Y node)</span>
          ) : null}
        </div>

        {tab === 'shader' && shaderPreview ? (
          <div className="rounded-lg border border-vyb-border/40 bg-black/30 p-2 max-h-[100px] overflow-auto shrink-0">
            <div className="text-[10px] font-mono text-vyb-text/60 whitespace-pre-wrap">
              {compiledWgsl ?? `// Preview: return ${shaderPreview.surfaceColorExpression};`}
            </div>
          </div>
        ) : null}

        {tab === 'behavior' && nodeGraph ? (
          <details className="text-[10px] text-vyb-text/45 shrink-0">
            <summary className="cursor-pointer">Export graph JSON</summary>
            <pre className="mt-1 max-h-24 overflow-auto font-mono text-[9px]">{graphToJson(nodeGraph)}</pre>
          </details>
        ) : null}
      </div>
    </GlassPanel>
  );
}
