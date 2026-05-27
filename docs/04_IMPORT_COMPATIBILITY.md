# 04_IMPORT_COMPATIBILITY — Import Compatibility

VYB’s import layer is designed to be incremental and honest:

1. **Detect**: identify likely project/asset structure.
2. **Plan**: decide what can be imported now vs. what needs manual migration.
3. **Report**: generate readable migration report.
4. **Translate**: planned in later phases (Phase 4+).

## Current scaffold capabilities
- Detection stubs for Unity, Unreal, Godot, raw asset folders.
- Import planning stubs with risk signaling.
- Import report generator that outputs markdown.

## Not implemented yet (honest)
- Full runtime/scene translation pipelines.
- Asset/material graph translation.
- Scripting language migrations.

## Security
Imported project content is treated as untrusted. This scaffold does not execute imported scripts.

