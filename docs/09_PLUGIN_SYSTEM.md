# 09_PLUGIN_SYSTEM — Plugins and Extensions

VYB is designed to be extensible via plugins. Plugins extend the studio editor and the engine architecture via a manifest-driven model.

## What a plugin is (intent)
A plugin provides:
- metadata (manifest),
- editor UI contributions (panels, commands),
- importer handlers,
- asset processors,
- renderer backend extensions,
- build targets,
- scripting language integration,
- AI tools (planned).

## Current implementation status (scaffold)
- Plugin manifest types and a validator exist.
- Built-in plugin manifests are loaded for the editor (manifest-only; no code execution in this scaffold).

## Security
In production, plugin execution must be permission scoped and sandboxed. This scaffold validates manifests, not plugin behavior.

