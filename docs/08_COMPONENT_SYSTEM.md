# 08_COMPONENT_SYSTEM — Typed Components for Editor ECS

Components in VYB are designed as typed definitions to:
- power editor property editing,
- enable predictable scene serialization,
- support plugin-driven extensions.

## Current component set (scaffold)
- `TransformComponent`
- `CameraComponent`
- `LightComponent`
- `MeshRendererComponent`
- `MaterialComponent`
- `ScriptComponent`
- `RigidbodyComponent`
- `ColliderComponent`
- `AudioSourceComponent`
- `UIElementComponent`
- `AIBehaviorComponent`
- `NetworkIdentityComponent`

## Current implementation status
- Typed component interfaces exist in TypeScript.
- Inspector panel renders typed component JSON for selected entities.

## Planned path
- Property editors for each component type.
- Plugin extension components.
- Runtime mapping to engine systems.

