# VYB

**The next-generation game creation environment for designers, developers, artists, worldbuilders, and AI-assisted creators.**

## What VYB is
VYB is designed to become an integrated creative operating environment for building games, simulations, interactive worlds, cinematic experiences, AI-driven environments, mixed reality applications, and future spatial computing projects.

This repository is an **early, production-grade scaffold** for a studio platform. It is intentionally honest about what is implemented now vs. what is planned next.

## Long-term vision (high level)
VYB’s architecture targets an experience that can eventually exceed Unreal Engine, Unity, Godot, Roblox Studio, and current proprietary studio tooling in:
- graphical fidelity (WebGPU-first + native renderer paths),
- interface quality and workflow intelligence,
- extensibility (plugins and integrations),
- asset/import ecosystems,
- and documentation/developer experience.

## Current status
- **Phase 0 complete:** studio shell, typed architecture, docs, tests, plugin manifests.
- **Phase 1 complete:** real project I/O (Tauri), asset scanning, scene persistence, hierarchy/inspector editing.
- **Phase 2 complete:** WebGPU viewport renderer with canvas fallback, grid, mesh proxies, frame stats.
- **Phase 3 complete:** ECS runtime tick, TS/JS script bridges, play/pause/stop in editor.
- **Phase 4 complete:** Godot/raw import translators, `.vybmat` materials, import preview and Tauri import execution.
- **Phase 5 complete:** Visual scripting node editor, behavior graph runtime, shader graph WGSL compiler.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the studio UI (in dev web context):
   ```bash
   npm run dev
   ```
3. (Optional) Run the desktop shell when Rust toolchain is available:
   ```bash
   npm run tauri:dev
   ```

## Development commands
- UI dev server: `npm run dev`
- Type check: `npm run lint`
- Tests: `npm test`

## Documentation map
See:
- `docs/01_VISION.md`
- `docs/02_ARCHITECTURE.md`
- `docs/03_PROJECT_FORMAT.md`
- `docs/04_IMPORT_COMPATIBILITY.md`
- `docs/05_RENDERING_PIPELINE.md`
- `docs/06_ASSET_PIPELINE.md`
- `docs/07_SCENE_SYSTEM.md`
- `docs/08_COMPONENT_SYSTEM.md`
- `docs/09_PLUGIN_SYSTEM.md`
- `docs/10_AI_ASSISTED_WORKFLOWS.md`
- `docs/11_BUILD_SYSTEM.md`
- `docs/12_HARDWARE_SUPPORT.md`
- `docs/13_DEVELOPER_GUIDE.md`
- `docs/14_CONTRIBUTING.md`
- `docs/15_ROADMAP.md`
- `docs/16_SECURITY.md`
- `docs/17_TESTING.md`
- `docs/18_RELEASE_STRATEGY.md`

## Disclaimer
VYB is in early development. This repository is a foundation scaffold and does not yet claim full engine compatibility, import/runtime parity, or production feature completion compared to existing platforms.

