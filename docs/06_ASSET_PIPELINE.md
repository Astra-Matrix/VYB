# 06_ASSET_PIPELINE — Asset Registry & Indexing

VYB uses an asset registry to index and display project assets without forcing a full content pipeline immediately.

## Goals
- Fast indexing based on file paths + extensions
- Typed asset metadata model
- Future content-aware normalization, hashing, caching, and dependency graphs

## Current implementation status (scaffold)
- Supported extensions mapped to typed asset categories.
- `AssetRegistry` indexes file paths into typed metadata objects.

## Planned path
- Dependency graphs (materials/shaders/meshes)
- Import normalization and caching
- Asset processors via plugin extension points

