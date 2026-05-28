# 05_RENDERING_PIPELINE — Rendering Architecture

VYB’s renderer is abstracted to support both WebGPU-first workflows and future native GPU backends.

## Key interfaces (scaffold)
- `RenderDevice`: owns global GPU state
- `ViewportRenderer`: renders an editor viewport
- `SceneRenderer`: renders a scene
- `MaterialSystem`, `ShaderSystem`, `TextureSystem`, `MeshSystem`, `LightingSystem`
- `PostProcessingSystem`

## Current implementation status
- **WebGPU viewport renderer** (`WebGpuViewportRenderer`): grid, lit mesh proxies, scene camera, frame stats.
- **Canvas fallback** (`PlaceholderViewportRenderer`) when WebGPU is unavailable.
- Factory: `createViewportRenderer(canvas)` selects the best backend at runtime.

## Planned path
- PBR materials, real mesh GPU buffers, editor gizmos and picking
- Native renderer integration behind the same interfaces

