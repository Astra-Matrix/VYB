# 15_ROADMAP — Phased Development Plan

This roadmap is architecture-first. Each phase aims to produce stable interfaces so future features can land safely.

## Phase 0 — Studio shell and architecture
- Desktop shell scaffold (Tauri + React + TypeScript)
- Project system models
- Import detection + report generation scaffold
- ECS/scene editor scaffolding

## Phase 1 — Project system + asset registry + basic scene editor (complete)
- Real project open/create via Tauri filesystem commands
- Native asset folder scanning + project tree listing
- Scene JSON load/save (`scenes/*.vybscene`)
- Hierarchy: add/delete entities
- Inspector: editable transform + entity rename
- Asset browser + project explorer refresh

## Phase 2 — WebGPU viewport and renderer foundation (complete)
- WebGPU viewport renderer with canvas fallback
- Scene camera + directional light driven shading
- Grid, mesh proxies (unit cubes), preview/lighting modes
- Live frame stats (FPS, frame ms, draw calls)

## Phase 3 — ECS runtime and scripting (complete)
- SceneRuntime with fixed-step clock and ScriptSystem
- TypeScript/JavaScript script bridges + Lua/Rust/WASM stubs
- Play/Pause/Stop/Step controls in viewport and command bar
- Sample `scripts/player.ts` rotates Cube during playback

## Phase 4 — Import pipelines (Unity/Unreal/Godot/raw assets) (complete)
- Godot `.tscn` → `.vybscene` translator (Camera/Light/MeshInstance3D)
- Raw asset folder auto-layout scenes
- `.vybmat` material translation stubs + import.map.json tracking
- Import preview (web) and full import (Tauri copy/write)

## Phase 5 — Visual scripting and shader graph (complete)
- Interactive node canvas (pan/zoom, drag, wire pins)
- Behavior graph executor integrated with Play runtime
- Shader graph compiler (WGSL fragment scaffold)

## Phase 6 — Physics, animation, audio, UI, networking (complete)
- PhysicsWorld gravity + ground collision
- AnimationDirector, AudioEngine, UIRuntime, NetworkSession scaffolds
- Runtime systems integrated with Play; Systems panel in Audio/Network modes
- Vibrant Blizzard × UE5 UI refresh (Framer Motion, resizable panels)

## Phase 7 — Build pipeline and deployment targets (complete)
- BuildPipeline: validate, stage project files, emit build-manifest + launch stubs
- Tauri build_io commands (list/copy/write artifacts)
- Build panel wired to pipeline; preview mode on web, full export on desktop
- GitHub Actions CI: lint, test, web dist artifact

## Phase 8 — AI-assisted workflows (complete)
- Local rule-based AI provider (no API keys)
- AITaskExecutor + studio context builder
- AI panel with task catalog, markdown output, history

## Phase 9 — Plugin marketplace and cloud collaboration
- Marketplace scaffolding
- Collaboration runtime

## Phase 10 — Native runtime, XR, procedural worlds, advanced hardware
- Console-grade optimization
- XR pipelines and advanced spatial inputs

