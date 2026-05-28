import type { VybScene } from '../../scene';
import type {
  ViewportFrameStats,
  ViewportLightingMode,
  ViewportPreviewMode,
  ViewportRenderer,
} from '../renderInterfaces';

/**
 * PlaceholderViewportRenderer
 * Uses a 2D canvas for editor scaffolding: grid, axes, and simple gizmos.
 * Architecture matches the future ViewportRenderer interface.
 */
export class PlaceholderViewportRenderer implements ViewportRenderer {
  readonly backendId = 'placeholder' as const;

  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private scene?: VybScene;
  private cameraMode: 'perspective' | 'orthographic' = 'perspective';
  private gridEnabled = true;
  private lightingMode: ViewportLightingMode = 'lit';
  private previewMode: ViewportPreviewMode = 'shaded';
  private raf?: number;
  private frameMs = 0;
  private fps = 0;
  private lastFrameAt = performance.now();
  private fpsAccum = 0;
  private fpsFrames = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    this.ctx = ctx;
  }

  setViewportSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
    this.canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
  }

  setScene(scene: VybScene): void {
    this.scene = scene;
  }

  setCameraMode(mode: 'perspective' | 'orthographic'): void {
    this.cameraMode = mode;
  }

  setGridEnabled(enabled: boolean): void {
    this.gridEnabled = enabled;
  }

  setLightingMode(mode: ViewportLightingMode): void {
    this.lightingMode = mode;
  }

  setPreviewMode(mode: ViewportPreviewMode): void {
    this.previewMode = mode;
  }

  getFrameStats(): ViewportFrameStats | null {
    return { fps: this.fps, frameMs: this.frameMs, backend: 'placeholder', drawCalls: 0 };
  }

  destroy(): void {
    this.stopLoop();
  }

  renderFrame(): void {
    const frameStart = performance.now();
    if (!this.ctx || !this.scene) return;
    const ctx = this.ctx;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, this.width, this.height);

    // Background.
    ctx.fillStyle = '#0a0b0f';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.gridEnabled) {
      this.drawGrid(ctx);
    }
    // Gizmo axes.
    this.drawAxes(ctx);
    // Scene marker proxies.
    this.drawEntities(ctx);

    // Subtle HUD hint.
    ctx.fillStyle = 'rgba(232,236,244,0.8)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillText(
      `Viewport (placeholder) — ${this.cameraMode} • ${this.lightingMode} • ${this.previewMode}`,
      12,
      20,
    );

    const now = performance.now();
    this.frameMs = now - frameStart;
    this.fpsAccum += this.frameMs;
    this.fpsFrames++;
    if (now - this.lastFrameAt >= 500) {
      this.fps = Math.round((this.fpsFrames * 1000) / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      this.lastFrameAt = now;
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const gridSize = 64;
    ctx.save();
    ctx.strokeStyle = 'rgba(91,141,239,0.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, this.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(this.width, y + 0.5);
      ctx.stroke();
    }
    // Emphasize center.
    ctx.strokeStyle = 'rgba(91,141,239,0.22)';
    ctx.beginPath();
    ctx.moveTo(this.width / 2 + 0.5, 0);
    ctx.lineTo(this.width / 2 + 0.5, this.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, this.height / 2 + 0.5);
    ctx.lineTo(this.width, this.height / 2 + 0.5);
    ctx.stroke();
    ctx.restore();
  }

  private drawAxes(ctx: CanvasRenderingContext2D) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(232,236,244,0.22)';
    ctx.lineWidth = 2;
    // X axis.
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 110, cy);
    ctx.stroke();
    // Y axis.
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + 110);
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,236,244,0.8)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillText('X', cx + 102, cy - 6);
    ctx.fillText('Y', cx + 6, cy + 106);
    ctx.restore();
  }

  private drawEntities(ctx: CanvasRenderingContext2D) {
    if (!this.scene) return;
    // For editor scaffolding we place entity proxies based on component presence.
    const entities = this.scene.world.getAllEntities();
    const cx = this.width / 2;
    const cy = this.height / 2;

    let y = cy + 80;
    const max = 9;
    ctx.save();
    ctx.fillStyle = 'rgba(91,141,239,0.85)';
    ctx.strokeStyle = 'rgba(91,141,239,0.35)';
    ctx.lineWidth = 1;

    const toShow = entities.slice(0, max);
    for (const e of toShow) {
      const hasCubeProxy = !!this.scene.world.getComponent(e.id, 'meshRenderer');
      const hasCameraProxy = this.scene.activeCameraEntityId === e.id;
      const w = hasCubeProxy ? 92 : 62;
      const h = hasCubeProxy ? 58 : 26;
      ctx.beginPath();
      ctx.roundRect(cx - w / 2, y - h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();
      y += 34;

      ctx.fillStyle = '#0a0b0f';
      ctx.font = '12px JetBrains Mono, monospace';
      const label = hasCameraProxy ? `${e.name} (Camera)` : e.name;
      ctx.fillText(label.slice(0, 20), cx - w / 2 + 10, y - h / 2 + 16);
      ctx.fillStyle = 'rgba(91,141,239,0.85)';
    }
    ctx.restore();
  }

  /**
   * Placeholder render loop. Used by the editor viewport panel.
   */
  startLoop(): void {
    const tick = () => {
      this.renderFrame();
      this.raf = window.requestAnimationFrame(tick);
    };
    this.raf = window.requestAnimationFrame(tick);
  }

  stopLoop(): void {
    if (this.raf) window.cancelAnimationFrame(this.raf);
    this.raf = undefined;
  }
}

