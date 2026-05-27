# 17_TESTING — Testing Strategy

VYB’s testing focus is on core architecture invariants:
- project format validation,
- import detection and report generation,
- asset registry indexing behavior,
- ECS/scene model correctness,
- plugin manifest validation.

## Current scaffold
Unit tests will be added under `src/tests/` using Vitest.

## Philosophy
Tests should verify behavior and contracts, not rendering pixels.

