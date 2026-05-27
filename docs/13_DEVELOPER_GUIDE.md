# 13_DEVELOPER_GUIDE — Developer Guide

## Where things live
- `src/studio/*`: studio shell UI and editor panels.
- `src/engine/*`: typed architecture (project/import/assets/scene/ECS/renderer/plugins).
- `src-tauri/*`: native-ish desktop commands and filesystem integration.
- `docs/*`: product documentation.
- `src/tests/*`: unit tests scaffold.

## Quick start
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Contribution philosophy
Keep changes modular, typed, and documented. VYB is designed to be a long-lived platform.

