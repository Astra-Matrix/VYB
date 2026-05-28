import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Square, StepForward } from 'lucide-react';
import { createViewportRenderer } from '../../engine/renderer/createViewportRenderer';
import type { ViewportRenderer } from '../../engine/renderer/renderInterfaces';
import { useAppState } from '../../app/state/useAppState';
import { getSceneRuntime } from '../../app/runtime/sceneRuntimeController';

type PreviewMode = 'shaded' | 'wireframe' | 'material-preview';
type LightingMode = 'default' | 'unlit' | 'lit';

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-vyb-text/70 select-none">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border border-vyb-border/70 bg-black/20"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function ViewportPanel() {
  const scene = useAppState((s) => s.scene);
  const activeMode = useAppState((s) => s.activeMode);
  const setViewportBackend = useAppState((s) => s.actions.setViewportBackend);
  const runtimePlayback = useAppState((s) => s.runtimePlayback);
  const runtimeStats = useAppState((s) => s.runtimeStats);
  const playRuntime = useAppState((s) => s.actions.playRuntime);
  const pauseRuntime = useAppState((s) => s.actions.pauseRuntime);
  const stopRuntime = useAppState((s) => s.actions.stopRuntime);
  const stepRuntime = useAppState((s) => s.actions.stepRuntime);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSimTimeRef = useRef(performance.now());
  const rendererRef = useRef<ViewportRenderer | null>(null);
  const [rendererReady, setRendererReady] = useState(false);
  const [frameStats, setFrameStats] = useState<{ fps: number; frameMs: number; drawCalls: number } | null>(null);

  const [cameraMode, setCameraMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [lightingMode, setLightingMode] = useState<LightingMode>('lit');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('shaded');

  const isRunning = useMemo(() => !!scene && rendererReady, [scene, rendererReady]);
  const backendLabel = rendererRef.current?.backendId ?? '…';

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    void (async () => {
      const renderer = await createViewportRenderer(canvas);
      if (cancelled) {
        renderer.destroy();
        return;
      }
      rendererRef.current = renderer;
      setViewportBackend(renderer.backendId);
      setRendererReady(true);
    })();

    return () => {
      cancelled = true;
      rendererRef.current?.destroy();
      rendererRef.current = null;
      setRendererReady(false);
      setViewportBackend(null);
    };
  }, [setViewportBackend]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !scene) return;
    renderer.setScene(scene);
    renderer.setCameraMode(cameraMode);
    renderer.renderFrame();
  }, [scene, cameraMode, rendererReady]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      renderer.setViewportSize(parent.clientWidth, parent.clientHeight);
      renderer.renderFrame();
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rendererReady]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !isRunning || !scene) return;

    let raf = 0;
    const frame = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastSimTimeRef.current) / 1000);
      lastSimTimeRef.current = now;

      const draw = () => {
        renderer.setScene(scene);
        renderer.renderFrame();
        raf = window.requestAnimationFrame(frame);
      };

      if (runtimePlayback === 'playing') {
        const runtime = getSceneRuntime();
        if (runtime) {
          void runtime.tickFrame(dt).then(draw);
          return;
        }
      }

      draw();
    };

    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, [isRunning, runtimePlayback, scene]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setCameraMode(cameraMode);
    renderer.setGridEnabled(gridEnabled);
    renderer.setLightingMode(lightingMode);
    renderer.setPreviewMode(previewMode);
    renderer.renderFrame();
  }, [gridEnabled, lightingMode, previewMode, cameraMode, rendererReady]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      const stats = rendererRef.current?.getFrameStats();
      if (!stats) return;
      setFrameStats({ fps: stats.fps, frameMs: stats.frameMs, drawCalls: stats.drawCalls });
    }, 500);
    return () => window.clearInterval(id);
  }, [isRunning]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="rounded-xl border border-vyb-border/60 bg-vyb-panel/60 backdrop-blur-panel shadow-glass p-3">
            <div className="text-xs font-bold tracking-wide text-vyb-text/80 mb-2">Viewport Controls</div>
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                <button
                  className="px-2 py-1 rounded-lg text-xs font-semibold border bg-vyb-accent/20 border-vyb-accent/40 flex items-center gap-1"
                  disabled={!scene}
                  onClick={() => void playRuntime()}
                  title="Play"
                >
                  <Play className="w-3 h-3" /> Play
                </button>
                <button
                  className="px-2 py-1 rounded-lg text-xs font-semibold border bg-black/10 border-vyb-border/60 flex items-center gap-1"
                  disabled={runtimePlayback !== 'playing'}
                  onClick={() => pauseRuntime()}
                  title="Pause"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
                <button
                  className="px-2 py-1 rounded-lg text-xs font-semibold border bg-black/10 border-vyb-border/60 flex items-center gap-1"
                  disabled={runtimePlayback === 'stopped'}
                  onClick={() => void stopRuntime()}
                  title="Stop"
                >
                  <Square className="w-3 h-3" /> Stop
                </button>
                <button
                  className="px-2 py-1 rounded-lg text-xs font-semibold border bg-black/10 border-vyb-border/60 flex items-center gap-1"
                  disabled={runtimePlayback !== 'paused'}
                  onClick={() => void stepRuntime()}
                  title="Step one fixed tick"
                >
                  <StepForward className="w-3 h-3" /> Step
                </button>
              </div>
              <div className="text-[10px] font-mono text-vyb-text/55">
                Runtime: {runtimePlayback}
                {runtimeStats ? ` • tick ${runtimeStats.tick} • scripts ${runtimeStats.scriptsActive}` : ''}
              </div>
              <div className="flex gap-2">
                <button
                  className={[
                    'px-2 py-1 rounded-lg text-xs font-semibold border',
                    cameraMode === 'perspective' ? 'bg-vyb-accent/20 border-vyb-accent/40' : 'bg-black/10 border-vyb-border/60',
                  ].join(' ')}
                  onClick={() => setCameraMode('perspective')}
                >
                  Perspective
                </button>
                <button
                  className={[
                    'px-2 py-1 rounded-lg text-xs font-semibold border',
                    cameraMode === 'orthographic' ? 'bg-vyb-accent/20 border-vyb-accent/40' : 'bg-black/10 border-vyb-border/60',
                  ].join(' ')}
                  onClick={() => setCameraMode('orthographic')}
                >
                  Ortho
                </button>
              </div>
              <Toggle label="Grid" value={gridEnabled} onChange={setGridEnabled} />
              <div className="flex gap-2 items-center">
                <div className="text-xs text-vyb-text/70 w-20">Lighting</div>
                <select
                  className="flex-1 rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-1"
                  value={lightingMode}
                  onChange={(e) => setLightingMode(e.target.value as LightingMode)}
                >
                  <option value="default">Default</option>
                  <option value="unlit">Unlit</option>
                  <option value="lit">Lit</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-xs text-vyb-text/70 w-20">Preview</div>
                <select
                  className="flex-1 rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-1"
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}
                >
                  <option value="shaded">Shaded</option>
                  <option value="wireframe">Wireframe</option>
                  <option value="material-preview">Material</option>
                </select>
              </div>
              <div className="text-[11px] text-vyb-text/55 leading-relaxed">
                Press Play to run ECS script ticks (Cube rotates via scripts/player.ts). WebGPU viewport falls back to
                canvas when unavailable.
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <div className="rounded-xl border border-vyb-border/60 bg-vyb-panel/60 backdrop-blur-panel shadow-glass p-3 text-right min-w-[140px]">
            <div className="text-xs font-bold text-vyb-text/80">Mode</div>
            <div className="text-sm font-semibold text-vyb-text">{activeMode}</div>
            <div className="text-[11px] text-vyb-text/55 mt-1">Backend: {backendLabel}</div>
            {frameStats ? (
              <div className="text-[11px] text-vyb-text/70 mt-2 font-mono">
                {frameStats.fps} fps • {frameStats.frameMs.toFixed(1)} ms
                <br />
                {frameStats.drawCalls} draw calls
              </div>
            ) : (
              <div className="text-[11px] text-vyb-text/45 mt-2">Initializing renderer…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
