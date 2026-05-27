# 05_RENDERING_PIPELINE — Rendering Architecture

VYB’s renderer is abstracted to support both WebGPU-first workflows and future native GPU backends.

## Key interfaces (scaffold)
- `RenderDevice`: owns global GPU state
- `ViewportRenderer`: renders an editor viewport
- `SceneRenderer`: renders a scene
- `MaterialSystem`, `ShaderSystem`, `TextureSystem`, `MeshSystem`, `LightingSystem`
- `PostProcessingSystem`

## Current implementation status
- Placeholder viewport renderer (2D canvas) exists for UI integration.

## Planned path
- WebGPU viewport and pipelines
- Native renderer integration behind the same interfaces
- Real scene rendering and editor gizmos

