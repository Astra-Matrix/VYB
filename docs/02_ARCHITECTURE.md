# 02_ARCHITECTURE — System Architecture

VYB’s architecture is split into layered concerns to keep the platform scalable and plugin-friendly.

## Layer 1: Studio Shell (UI/UX)
- React + TypeScript UI
- Tauri desktop shell
- Panels: project explorer, hierarchy, viewport, inspector, asset browser, console
- Mode system (Design/Code/World/Render/Audio/Network/Build/AI)

## Layer 2: Engine Architecture (TypeScript models + interfaces)
- Project format model + metadata IO scaffolding
- Import detection + import planning/report generation scaffolding
- Asset registry model
- ECS + scene model for editor-side representation
- Rendering abstraction interfaces (future WebGPU/native backends)
- Plugin manifest model + loader scaffold

## Layer 3: Desktop/Natively-leaning services (Rust via Tauri commands)
- Filesystem integration (explicit user intent)
- Project create/validate (scaffold)
- Import compatibility detection (lightweight native heuristic)
- Hardware probing placeholder (scaffold)

## Security boundaries (intentional)
- Imported content is treated as untrusted.
- Filesystem operations are tied to explicit user-chosen paths.
- Plugin execution is not wired in this scaffold; only manifest parsing/validation.

