# Repository Foldering System

Kabeeri had grown into many top-level folders. That makes sense historically, but it is hard for a new maintainer or an AI coding agent to know where to start. The foldering system creates a Laravel-like mental model: every root area has a stable meaning, and new work must fit an existing group unless there is a documented reason to add a new top-level folder.

The machine-readable source of truth is:

```text
knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json
```

## Target Model

| Group | Target meaning | Current paths |
| --- | --- | --- |
| `core` | Runtime code, CLI handlers, command entrypoints | `src/`, `bin/`, `cli/` |
| `knowledge` | Product intelligence, governance, delivery systems, design guidance | `knowledge/standard_systems/`, `knowledge/project_intelligence/`, `knowledge/questionnaires/`, `knowledge/delivery_modes/`, `knowledge/agile_delivery/`, `knowledge/governance/`, `knowledge/task_tracking/`, `knowledge/vibe_ux/`, `knowledge/design_system/`, `knowledge/design_system/ui_ux_reference/` |
| `packs` | Exportable templates, generators, examples, prompt packs | `packs/generators/`, `packs/templates/`, `packs/examples/`, `packs/prompt_packs/` |
| `plugins` | GitHub, VS Code, and multi-AI plugin bundles | `plugins/github_sync/`, `plugins/github/`, `plugins/vscode_extension/`, `plugins/multi_ai_governance/` |
| `docs/reports` | Historical reports, dashboard runtime docs, platform plan archives, and enforcement matrices | `docs/reports/dashboard/`, `docs/reports/platform_integration/` |
| `contracts` | JSON schemas and runtime contracts | `schemas/` |
| `documentation` | Human docs and references | `docs/`, `docs/site/`, `docs/codex_context/`, root readmes |
| `quality` | Tests and validation fixtures | `tests/` |
| `runtime_state` | Workspace-local live state and local tooling state | `.kabeeri/`, `.kilo/` |

## Why Not Move Everything Immediately?

The first physical move has now been done. Legacy paths are still readable through CLI asset aliases so old commands and packaged references can continue to work while docs are gradually cleaned up.

Current root should stay small:

```text
bin/
src/
cli/
knowledge/
packs/
plugins/
docs/
schemas/
tests/
.kabeeri/
.kilo/
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

## Versioning Contract

The foldering system is versioned in two places:

| Layer | Field | Purpose |
| --- | --- | --- |
| Foldering map | `schema_version` | Declares the contract shape used by the repository foldering map itself. |
| Foldering map | `map_version` | Tracks the current foldering plan version. |
| Foldering migration phases | `schema_version` and `migration_version` | Show which contract version and migration line each phase belongs to. |
| Runtime schema registry | `registry_version` | Marks the version of the runtime schema mapping registry. |
| Plugin loader state | `schema_version` and `plugin_loader_version` | Distinguish the loader contract from the active plugin loader behavior. |
| Workspace project state | `schema_version` and `version` | Separate the workspace schema contract from the project/content version. |

This separation matters because folder layout changes, plugin packaging changes, and workspace state changes do not always move together. When the schema version changes, KVDF should be able to say whether the change is a validation-only update, a migration update, or a compatibility bump that needs follow-up documentation.

Practical rules:

- Keep `schema_version` explicit in every contract file that is expected to evolve.
- Keep `map_version` or `plugin_loader_version` for the runtime behavior line.
- Add a migration note whenever the foldering contract changes in a way that affects root classification or top-level routing.
- Treat version fields as machine-readable signals, not as documentation-only text.

If the version fields disagree, validation should surface the mismatch with a next action rather than leaving the maintainer to infer it from chat history.

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
| New integration | `plugins/` |

## AI Usage

AI agents should read `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` before broad filesystem exploration. This reduces token use and prevents scanning old milestone folders unless the task is specifically about release history, migrations, or integrations.
