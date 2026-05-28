# 10_AI_ASSISTED_WORKFLOWS — AI-Assisted Development

VYB helps creators **under supervision** — surfacing migration risks, build steps, and scene guidance as drafts rather than silent auto-changes.

## Architecture

| Layer | Role |
|-------|------|
| `AIStudioContext` | Project, scene, import report, build target, console tail |
| `LocalAIProvider` | On-device rule-based drafts (default, no API keys) |
| `AIProvider` | Pluggable interface for future cloud models |
| `AITaskExecutor` | Runs tasks, returns `AITaskHistoryEntry` |
| `AIPanel` | Studio UI — task catalog, markdown output, history |

## Task types

- `explain_import_errors` — uses active import report
- `generate_build_plan` — deployment steps for selected build target
- `create_design_doc` — vision / pillars / milestones outline
- `propose_scene_changes` — ECS hierarchy suggestions
- `refactor_script` — scripting conventions for VYB bridges
- `create_shader_notes` — WGSL graph guidance
- `create_ui_layout` — HUD structure draft
- `create_npc_behavior` — behavior prototyping outline

## Usage

1. Open **AI** mode in the studio.
2. Choose a task card (requires a project for best context).
3. Review markdown output; apply changes manually.

## Security

AI output is **untrusted draft content**. Never execute generated code without review. Import payloads remain subject to normal sandbox rules.

## Planned

- Optional OpenAI / Anthropic providers via env configuration
- Apply-to-scene actions with explicit user confirmation
- Diff preview for script refactors
