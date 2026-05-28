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
    <label className="flex items-center gap-2 text-xs text-vyb-text-secondary select-none">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded-sm border border-vyb-line/80 bg-vyb-charcoal accent-vyb-plasma"
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
          <div className="vyb-viewport-overlay p-3 min-w-[220px]">
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-vyb-text-secondary mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-vyb-plasma shadow-[0_0_8px_rgba(255,107,26,0.8)]" />
              Viewport
            </div>
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                <button
                  className="vyb-viewport-toggle vyb-viewport-toggle-active flex items-center gap-1"
                  disabled={!scene}
                  onClick={() => void playRuntime()}
                  title="Play"
                >
                  <Play className="w-3 h-3" /> Play
                </button>
                <button
                  className="vyb-viewport-toggle flex items-center gap-1"
                  disabled={runtimePlayback !== 'playing'}
                  onClick={() => pauseRuntime()}
                  title="Pause"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
                <button
                  className="vyb-viewport-toggle flex items-center gap-1"
                  disabled={runtimePlayback === 'stopped'}
                  onClick={() => void stopRuntime()}
                  title="Stop"
                >
                  <Square className="w-3 h-3" /> Stop
                </button>
                <button
                  className="vyb-viewport-toggle flex items-center gap-1"
                  disabled={runtimePlayback !== 'paused'}
                  onClick={() => void stepRuntime()}
                  title="Step one fixed tick"
                >
                  <StepForward className="w-3 h-3" /> Step
                </button>
              </div>
              <div className="vyb-viewport-stat">
                Runtime: <span className="text-vyb-plasma">{runtimePlayback}</span>
                {runtimeStats ? ` • tick ${runtimeStats.tick} • scripts ${runtimeStats.scriptsActive}` : ''}
              </div>
              <div className="flex gap-2">
                <button
                  className={[
                    'vyb-viewport-toggle',
                    cameraMode === 'perspective' && 'vyb-viewport-toggle-active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setCameraMode('perspective')}
                >
                  Perspective
                </button>
                <button
                  className={[
                    'vyb-viewport-toggle',
                    cameraMode === 'orthographic' && 'vyb-viewport-toggle-active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setCameraMode('orthographic')}
                >
                  Ortho
                </button>
              </div>
              <Toggle label="Grid" value={gridEnabled} onChange={setGridEnabled} />
              <div className="flex gap-2 items-center">
                <div className="text-xs text-vyb-text-secondary w-20">Lighting</div>
                <select
                  className="vyb-input flex-1 !py-1 text-xs"
                  value={lightingMode}
                  onChange={(e) => setLightingMode(e.target.value as LightingMode)}
                >
                  <option value="default">Default</option>
                  <option value="unlit">Unlit</option>
                  <option value="lit">Lit</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-xs text-vyb-text-secondary w-20">Preview</div>
                <select
                  className="vyb-input flex-1 !py-1 text-xs"
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}
                >
                  <option value="shaded">Shaded</option>
                  <option value="wireframe">Wireframe</option>
                  <option value="material-preview">Material</option>
                </select>
              </div>
              <div className="text-[10px] text-vyb-muted leading-relaxed border-t border-vyb-line/50 pt-2 mt-1">
                <span className="vyb-axis-x">X</span>
                <span className="mx-1 text-vyb-muted">·</span>
                <span className="vyb-axis-y">Y</span>
                <span className="mx-1 text-vyb-muted">·</span>
                <span className="vyb-axis-z">Z</span>
                <span className="ml-2">— Play runs ECS + scripts. WebGPU falls back to canvas.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <div className="vyb-viewport-overlay p-3 text-right min-w-[148px]">
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-vyb-muted">Diagnostics</div>
            <div className="text-sm font-semibold text-vyb-plasma mt-0.5">{activeMode}</div>
            <div className="vyb-viewport-stat mt-1">
              Backend: <span className="text-vyb-cyan">{backendLabel}</span>
            </div>
            {frameStats ? (
              <div className="vyb-viewport-stat mt-2 space-y-0.5">
                <div>
                  <span className="text-vyb-green">{frameStats.fps}</span> fps · {frameStats.frameMs.toFixed(1)} ms
                </div>
                <div>{frameStats.drawCalls} draw calls</div>
              </div>
            ) : (
              <div className="vyb-viewport-stat mt-2 animate-pulse-soft">Initializing renderer…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
