import { useEffect, useMemo, useRef, useState } from 'react';
import { PlaceholderViewportRenderer } from '../../engine/renderer/placeholder';
import { useAppState } from '../../app/state/useAppState';

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PlaceholderViewportRenderer | null>(null);

  const [cameraMode, setCameraMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [lightingMode, setLightingMode] = useState<LightingMode>('lit');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('shaded');

  const isRunning = useMemo(() => !!scene, [scene]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) rendererRef.current = new PlaceholderViewportRenderer(canvasRef.current);

    const renderer = rendererRef.current;
    if (!scene) return;

    renderer.setScene(scene);
    renderer.setCameraMode(cameraMode);
    renderer.renderFrame();
  }, [scene, cameraMode]);

  useEffect(() => {
    if (!rendererRef.current) return;
    const renderer = rendererRef.current;
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
  }, []);

  useEffect(() => {
    if (!rendererRef.current) return;
    if (!isRunning) return;
    const renderer = rendererRef.current;
    renderer.startLoop();
    return () => renderer.stopLoop();
  }, [isRunning]);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setCameraMode(cameraMode);
    // grid / lighting / preview are placeholders; we still allow toggling for future integration.
    rendererRef.current.renderFrame();
  }, [gridEnabled, lightingMode, previewMode, cameraMode]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="rounded-xl border border-vyb-border/60 bg-vyb-panel/60 backdrop-blur-panel shadow-glass p-3">
            <div className="text-xs font-bold tracking-wide text-vyb-text/80 mb-2">Viewport Controls</div>
            <div className="space-y-2">
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
                Camera controls, gizmos, frame stats, and real materials are planned. This placeholder exists to validate
                the renderer abstraction and UI layout.
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <div className="rounded-xl border border-vyb-border/60 bg-vyb-panel/60 backdrop-blur-panel shadow-glass p-3 text-right">
            <div className="text-xs font-bold text-vyb-text/80">Mode</div>
            <div className="text-sm font-semibold text-vyb-text">{activeMode}</div>
            <div className="text-[11px] text-vyb-text/55 mt-1">Renderer backend indicator placeholder.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

