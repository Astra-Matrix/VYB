# 11_BUILD_SYSTEM — Build Targets

VYB unifies deployment targets behind a single **BuildPipeline**.

## Outputs

Each build writes to `{projectRoot}/builds/{target}/{configuration}/` (or a custom output folder):

| Artifact | Purpose |
|----------|---------|
| `build-manifest.json` | Project metadata, staged file list, capability flags |
| `build-report.json` | Summary, warnings, file counts |
| `project/` | Staged copy of scenes, assets, scripts, materials, shaders, audio, ui, `.vyb` config |
| `runtime/README.md` | Target-specific deployment notes |
| `runtime/launch.config.json` | Runtime entry scaffold |

## Studio usage

1. Switch to **Build** mode.
2. Select target (Web, Windows, Linux, Dedicated Server, …).
3. Choose **Debug** or **Release**.
4. Click **Build project** (desktop) or **Preview build** (web).

## CI

GitHub Actions runs `npm run lint`, `npm test`, and `npm run build`, uploading the Vite `dist/` folder as a web artifact.

## Planned

- Scripted bundling per target (Tauri player, WASM runtime).
- Dependency graph and incremental builds.
- Signed desktop installers.
