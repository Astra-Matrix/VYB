import type { RenderingMode } from '../project/types';
import type { VybScene } from '../scene';

export interface RenderHardwareInfo {
  backend: RenderingMode | 'unknown' | 'web-unknown';
  vendor?: string;
  adapter?: string;
  limits?: {
    maxTextureSize?: number;
  };
}

/**
 * RenderDevice
 * Owns GPU resources, pipelines, and global renderer state.
 *
 * Current scaffold provides a placeholder 2D canvas renderer. Future phases
 * will add a real WebGPU backend.
 */
export interface RenderDevice {
  readonly hardwareInfo: RenderHardwareInfo;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

export interface RenderPipeline {
  readonly id: string;
}

export interface SceneRenderer {
  render(scene: VybScene, viewport: ViewportRenderer): void;
}

export interface ViewportRenderer {
  setViewportSize(width: number, height: number): void;
  setScene(scene: VybScene): void;
  setCameraMode(mode: 'perspective' | 'orthographic'): void;
  renderFrame(): void;
}

export interface TextureSystem {
  preloadTexture(id: string): Promise<void>;
}

export interface MeshSystem {
  preloadMesh(id: string): Promise<void>;
}

export interface MaterialSystem {
  preloadMaterial(id: string): Promise<void>;
}

export interface ShaderSystem {
  preloadShader(id: string): Promise<void>;
}

export interface LightingSystem {
  setLightingMode(mode: 'default' | 'unlit' | 'lit'): void;
}

export interface PostProcessingSystem {
  setPostMode(mode: 'none' | 'bloom' | 'tone-mapping'): void;
}

export interface RenderPipelineBundle {
  sceneRenderer: SceneRenderer;
  lighting: LightingSystem;
  post: PostProcessingSystem;
}

