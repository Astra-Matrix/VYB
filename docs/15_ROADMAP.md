# 15_ROADMAP — Phased Development Plan

This roadmap is architecture-first. Each phase aims to produce stable interfaces so future features can land safely.

## Phase 0 — Studio shell and architecture
- Desktop shell scaffold (Tauri + React + TypeScript)
- Project system models
- Import detection + report generation scaffold
- ECS/scene editor scaffolding

## Phase 1 — Project system + asset registry + basic scene editor (in progress)
- Real project open/create via Tauri filesystem commands
- Native asset folder scanning + project tree listing
- Scene JSON load/save (`scenes/*.vybscene`)
- Hierarchy: add/delete entities
- Inspector: editable transform + entity rename
- Asset browser + project explorer refresh

## Phase 2 — WebGPU viewport and renderer foundation
- Real WebGPU renderer backend
- Viewport rendering + frame stats

## Phase 3 — ECS runtime and scripting
- ECS runtime tick integration
- Script runtime bridges

## Phase 4 — Import pipelines (Unity/Unreal/Godot/raw assets)
- Scene + material translation

## Phase 5 — Visual scripting and shader graph
- Node editor UX + execution/data graph system

## Phase 6 — Physics, animation, audio, UI, networking
- Runtime subsystems and editor integration

## Phase 7 — Build pipeline and deployment targets
- CI-friendly builds and artifacts

## Phase 8 — AI-assisted workflows
- AI task models + provider wiring

## Phase 9 — Plugin marketplace and cloud collaboration
- Marketplace scaffolding
- Collaboration runtime

## Phase 10 — Native runtime, XR, procedural worlds, advanced hardware
- Console-grade optimization
- XR pipelines and advanced spatial inputs

