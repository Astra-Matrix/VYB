# 14_CONTRIBUTING — Contributing to VYB

VYB is intended to grow into a professional platform. To keep the codebase healthy:

## Contribution guidelines
- Prefer small, reviewable changes.
- Keep architecture modular and typed.
- Update docs when interfaces or workflows change.
- Add unit tests for new core behavior.

## Security expectations
- Treat imported project content as untrusted.
- Keep filesystem operations tied to explicit user intent.
- Validate plugin manifests and never execute plugin code in an unsafe way.

