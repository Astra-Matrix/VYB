# 07_SCENE_SYSTEM — Scenes, Entities, and Hierarchy

VYB’s editor scene model is based on a typed ECS representation.

## Scene model (intent)
- A scene contains an ECS world.
- The world contains entities with typed components.
- Hierarchy is represented via parent/children entity links (editor representation).

## Current implementation status (scaffold)
- `VybScene` exists and wraps an `EcsWorld`.
- A sample scene is generated for editor UI integration:
  - camera
  - directional light
  - cube + plane/grid proxies
  - empty parent entity
  - audio source placeholder

## Planned path
- Runtime ECS integration.
- Editor entity operations (add/remove components, transform editing).
- Scene translation from imported project formats.

