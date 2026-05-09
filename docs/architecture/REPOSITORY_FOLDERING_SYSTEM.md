# Repository Foldering System

Kabeeri had grown into many top-level folders. That makes sense historically, but it is hard for a new maintainer or an AI coding agent to know where to start. The foldering system creates a Laravel-like mental model: every root area has a stable meaning, and new work must fit an existing group unless there is a documented reason to add a new top-level folder.

The machine-readable source of truth is:

```text
knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json
```

## Target Model

| Group | Target meaning | Current paths |
| --- | --- | --- |
| `core` | Runtime code, CLI handlers, command entrypoints, product-branch apps | `src/`, `bin/`, `cli/`, `apps/` |
| `knowledge` | Product intelligence, governance, delivery systems, design guidance | `knowledge/standard_systems/`, `knowledge/project_intelligence/`, `knowledge/questionnaires/`, `knowledge/delivery_modes/`, `knowledge/agile_delivery/`, `knowledge/governance/`, `knowledge/task_tracking/`, `knowledge/vibe_ux/`, `knowledge/design_system/` |
| `packs` | Exportable templates, generators, examples, prompt packs | `packs/generators/`, `packs/templates/`, `packs/examples/`, `packs/prompt_packs/` |
| `integrations` | GitHub, VS Code, dashboard, platform and multi-AI integrations | `integrations/github_sync/`, `integrations/github/`, `integrations/vscode_extension/`, `integrations/platform_integration/`, `integrations/multi_ai_governance/`, `integrations/dashboard/` |
| `contracts` | JSON schemas and runtime contracts | `schemas/` |
| `documentation` | Human docs and references | `docs/`, `docs/site/`, `docs/codex_context/`, root readmes |
| `quality` | Tests and validation fixtures | `tests/` |
| `runtime_state` | Workspace-local live state | `.kabeeri/` |

## Why Not Move Everything Immediately?

The first physical move has now been done. Legacy paths are still readable through CLI asset aliases so old commands and packaged references can continue to work while docs are gradually cleaned up.

Current root should stay small:

```text
bin/
src/
cli/
apps/
knowledge/
packs/
integrations/
docs/
schemas/
tests/
.kabeeri/
```

## CLI

Use these commands:

```text
kvdf structure map
kvdf structure show standard_systems
kvdf structure validate
kvdf structure guide
kvdf validate foldering
```

`kvdf structure validate` checks whether the current repository root contains folders outside the allowed foldering contract.

## New Folder Rule

Before adding a new top-level folder, document:

- Business reason.
- Target group.
- Owner.
- Migration plan.
- Package and documentation impact.

Most new features should use one of these existing homes:

| Feature type | Preferred location |
| --- | --- |
| New CLI/runtime command | `src/cli/` |
| New product/system catalog | `knowledge/standard_systems/` |
| New human docs | `docs/` |
| New schema | `schemas/` |
| New reusable prompt/template | `packs/prompt_packs/` or `packs/templates/` |
| New integration | `integrations/` |

## AI Usage

AI agents should read `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` before broad filesystem exploration. This reduces token use and prevents scanning old milestone folders unless the task is specifically about release history, migrations, or integrations.
