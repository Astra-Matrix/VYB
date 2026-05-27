# 03_PROJECT_FORMAT — VYB Project Format

VYB projects are designed to be stored on disk so they can be:
- versioned in Git,
- shared between tools and collaborators,
- imported into the editor.

## Target folder layout (v0 scaffold)
```text
.vyb/
  project.vyb.json
  engine.config.json
  import.map.json
assets/
scenes/
scripts/
materials/
shaders/
audio/
ui/
builds/
plugins/
docs/
```

## project.vyb.json (intent)
The metadata file includes:
- project name + version
- engine version
- target platforms
- rendering mode
- asset folders
- scene list
- plugin list
- scripting language settings
- import compatibility metadata

## Current implementation status
- TypeScript models exist for the metadata.
- Rust commands scaffold create/validate for `.vyb/` and the main folders.

