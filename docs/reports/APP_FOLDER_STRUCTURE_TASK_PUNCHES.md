# App Folder Structure Task Punches

**Status:** `planned`
**Track:** `owner`
**Scope:** `app_folder_structure` plugin plan on the owner track
**Mode:** planning only, no implementation yet
**Source:** `docs/reports/APP_FOLDER_STRUCTURE_EVO_PLAN.md`

---

## Purpose

This report converts the `app_folder_structure` owner-track Evo plan into implementation-ready task punches. It is still planning-only. No source code, schemas, runtime files, or commands are changed here.

Each task punch is narrow enough to be assigned later without overlapping another punch. The order below preserves the fixed phase sequence in the user brief.

### Plain-English Goal

Each punch should be small enough that a worker can understand it without reading the whole roadmap again. A good punch should answer:

- what folder or command is being built
- what the worker is allowed to touch
- what must stay untouched
- how success will be recognized
- which tests or checks prove the work is safe

The goal is to remove guesswork before implementation starts.

---

## Global Safety Rules

- Do not start implementation until the active Evo slice is approved.
- Do not change unrelated plugins or runtime systems.
- Do not delete user files.
- Do not overwrite non-empty files.
- Do not allow path traversal or unsafe app slugs.
- Do not invent folder structures outside the approved contract.
- Do not force a stack-specific source tree inside `08_source/`.
- Do not create unsupported workspace types.

### What A Good Punch Looks Like

A task punch is good when it is:

- narrow enough to finish in one focused pass
- explicit about allowed and forbidden paths
- explicit about the folder contract it is changing
- explicit about tests and validation
- explicit about what it must not change

If a punch would require multiple unrelated systems, it should be split.

---

## Task Punch Breakdown

### `evo-appfs-000` - App Folder Structure intake and repo analysis

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-000-a` | Map repo conventions for plugins, CLI registration, runtime state, docs, and tests. | Learn how this repo already registers plugins, exposes commands, writes runtime state, and documents behavior so the new plugin follows the same rules. | `plugins/`, `src/cli/`, `schemas/`, `docs/`, `.kabeeri/` | Implementation code outside analysis scope | A clear analysis report exists with repo conventions and integration points. | Repository inspection only; no behavior changes. |
| `appfs-000-b` | Define the planning dependency map for the future plugin. | Convert the phase brief into ordered slices so each later step has a clear start and end. | `docs/reports/` | All runtime/implementation folders | The app-folder dev plan is split into safe Evo slices. | Review report completeness. |

### `evo-appfs-001` - Plugin shell, metadata, and status command

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-001-a` | Create the plugin shell and manifest. | Establish `app_folder_structure` as a real plugin package with a manifest and entry point, but no folder creation yet. | `plugins/app_folder_structure/plugin.json`, `plugins/app_folder_structure/README.md`, `plugins/app_folder_structure/bootstrap.js` or convention-equivalent entry point | Workspaces, runtime, unrelated plugins | Plugin exists as a safe shell with documented purpose. | Plugin metadata loads and surfaces a status command. |
| `appfs-001-b` | Add status/help output only. | Give users and workers a read-only way to see what the plugin is for before any workspace is created. | `plugins/app_folder_structure/*`, `src/cli/*` if wiring is needed | Workspace creation logic | Status command reports plugin state without creating folders. | CLI smoke for status/help. |

### `evo-appfs-002` - Workspace type registry and root resolver

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-002-a` | Create workspace type registry and schema. | Define the visible workspace types once so later code can ask “is this supported?” instead of guessing. | `registry/workspace_types.json`, `schemas/runtime/*workspace*`, plugin docs | App pipeline implementation | Supported workspace roots are explicitly defined. | Registry validation and unsupported type rejection. |
| `appfs-002-b` | Add safe root resolver and workspace validation. | Make sure the plugin can tell the difference between the official app root and anything unsafe or outside the contract. | `plugins/app_folder_structure/*`, `src/cli/*` routing if required | Folder materialization beyond root checks | `./workspaces/apps/` is recognized as the active app root and unsafe types are rejected. | Root resolution tests. |

### `evo-appfs-003` - Fixed app pipeline core and create/validate skeleton

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-003-a` | Materialize the fixed top-level pipeline folders. | Build the outer shell of every app workspace so every app starts with the same production pipeline. | `plugins/app_folder_structure/*`, `registry/app_pipeline_structure.json`, `schemas/runtime/*`, `workspaces/apps/<app-slug>/` in test fixtures only | Category internals, source stack layout, destructive operations | The top-level pipeline exists and is stable. | Create/validate skeleton tests. |
| `appfs-003-b` | Add create/validate commands for app workspaces. | Let the plugin create a valid app workspace and inspect whether the contract is complete. | `plugins/app_folder_structure/*`, CLI wiring, docs | Category-governed roadmap internals | Creating a valid app workspace is safe and deterministic. | Create and validate command smoke/tests. |

### `evo-appfs-004` - Viber input area materialization

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-004-a` | Create the `00_viber_inputs/` contract. | Build the intake zone where raw Viber-provided material lives before the system generates outputs. | `plugins/app_folder_structure/*`, workspace fixtures | Roadmap/spec/source folders | Input folders are separated from generated outputs. | Input-folder structure tests. |
| `appfs-004-b` | Add source-only input file placeholders and docs. | Provide the starter files for brief, notes, snapshots, links, and Q&A without mixing them into generated output folders. | `workspaces/apps/<slug>/00_viber_inputs/` in test fixtures only | Roadmap generation logic | Viber inputs are clearly source material only. | File-preservation and separation checks. |

### `evo-appfs-005` - Category registry integration and profile validation

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-005-a` | Add category-profile loading and schema validation. | Teach the plugin how to ask the category registry for the approved roadmap shape instead of inventing one. | category registry files, plugin integration code, schemas | Hardcoded roadmap folders | Category profiles are read and validated safely. | Missing/invalid profile rejection tests. |
| `appfs-005-b` | Wire profile lookup into app creation. | Make profile lookup part of the create flow so a missing profile fails closed. | `plugins/app_folder_structure/*`, category registry adapters | Stack-specific source layout | App creation fails safely if the approved profile is missing. | Category lookup smoke tests. |

### `evo-appfs-006` - Category-governed roadmap folder materialization

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-006-a` | Materialize UI/UX, system design, and database roadmap folders from profile. | Create the approved roadmap subfolders for the selected category, and only those folders. | `plugins/app_folder_structure/*`, registry/profile data, test fixtures | Unapproved roadmap internals | Roadmap internals come only from category-approved profiles. | Web/mobile/embedded profile tests. |
| `appfs-006-b` | Generate profile trace files for the roadmap. | Record which category profile created which roadmap folders so the output is auditable later. | generated JSON and markdown under app workspace fixtures | Manual roadmap drift | Created folders are traceable to the selected category profile. | Generated-structure validation. |

### `evo-appfs-007` - Stack-adaptive source folder contract

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-007-a` | Create neutral `08_source/` placeholders only. | Reserve the source area without choosing a framework layout for the user. | plugin code, source contract docs, test fixtures | Default frontend/backend/API tree | `08_source` remains stack-adaptive. | No forced source layout tests. |
| `appfs-007-b` | Add source manifest and handoff notes. | Explain that a later stack/framework generator owns the real source structure. | `08_source/` placeholders in fixtures, plugin docs | Stack-specific source trees | Later stack generators can own the real source layout. | Source-manifest tests. |

### `evo-appfs-008` - Full specifications handoff package

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-008-a` | Create the full specs document contract. | Lay out the documentation stack that another team could continue from later. | `03_full_specifications/` contract files in fixtures, plugin docs | Source implementation | Handoff-grade specification placeholders exist. | Required document presence checks. |
| `appfs-008-b` | Add manifest entries for future handoff. | Keep the spec package discoverable and traceable through the workspace manifest. | manifest/runtime docs, test fixtures | Real product text generation | The handoff package is structurally complete. | Manifest and file-list validation. |

### `evo-appfs-009` - Version control and GitHub governance folders

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-009-a` | Create version-control governance folders. | Give each app a place to describe branches, commits, issues, PRs, and releases without forcing GitHub integration. | `04_version_control/` contract files in fixtures, plugin docs | GitHub API logic | GitHub usage is documented, not replaced. | Folder-structure validation. |
| `appfs-009-b` | Keep local-first and GitHub-aware governance separate. | Make sure the app can stay local-first while still having a place to document GitHub-linked workflows later. | plugin docs and schema/contracts | GitHub provider logic | Local projects and GitHub-connected projects are both supported by the contract. | Doc and contract checks. |

### `evo-appfs-010` - Evolutions and task punches folders

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-010-a` | Create the evolutions folder structure. | Provide the larger change container where milestones and slices can live. | `05_evolutions/` contract files in fixtures | Runtime task execution code | Evolution history can be organized cleanly. | Folder presence checks. |
| `appfs-010-b` | Create the task punches folder structure. | Provide the smaller execution task container where workers can later receive precise instructions. | `06_task_punches/` contract files in fixtures | Auto-execution logic | Task punches can be stored, tracked, and reviewed. | Punch-folder validation. |

### `evo-appfs-011` - Remaining governance folders

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-011-a` | Create agents, quality, evidence, review, release, owner, and archive folders. | Finish the production governance trail so every app has a place for traceability, approvals, and release history. | fixture workspace trees, plugin docs | User-file deletion or overwrite logic | The full governance pipeline exists in folder form. | Presence and separation checks. |
| `appfs-011-b` | Add local owner-facing portal placeholders. | Give the owner a summary area that shows progress and readiness without exposing everything inside the workspace. | `13_owner_portal/` and related docs in fixtures | Internal-only content leakage | Owner-facing summaries exist without exposing the full internal workspace. | Owner portal contract checks. |

### `evo-appfs-012` - Safe commands, validation, repair, evidence, and tests

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-012-a` | Add create/validate/repair/print/manifest commands. | Expose the operational commands that users and workers will actually run when managing workspaces. | plugin code, CLI wiring, docs | Unsafe filesystem mutation outside workspace contract | Commands exist and are safe. | CLI smoke for each command. |
| `appfs-012-b` | Add validation, repair, evidence, and manifest outputs. | Make each structural action traceable so the plugin can prove what it created or repaired. | plugin code, schema registry, test fixtures, docs | Overwriting user files, path traversal | Evidence is generated and repairs are non-destructive. | Create/validate/repair/evidence tests. |
| `appfs-012-c` | Add the full test matrix for the plugin. | Prove every major rule in the contract with automated coverage. | `tests/`, plugin contract tests, docs | Production app workspace files | All acceptance rules are covered by automated tests. | Full unit/integration coverage. |

---

## Recommended Worker Assignment Shape

For execution later, assign work in this order:

1. Analysis and planning
2. Plugin shell
3. Workspace registry
4. Pipeline core
5. Viber inputs
6. Category integration
7. Category roadmap generation
8. Stack-adaptive source contract
9. Full specifications
10. Version control governance
11. Evolutions and task punches
12. Remaining governance folders
13. Commands, validation, repair, evidence, tests

This keeps the early slices small and prevents category/profile logic from being mixed with file-generation logic too soon.

### Human-Friendly Readout

If a worker asks “what am I doing right now?”, the answer should look like this:

- first learn the repo and conventions
- then create the plugin shell
- then define safe workspace types
- then build the fixed folder pipeline
- then separate Viber input from generated output
- then connect category profiles
- then materialize approved roadmap folders
- then keep source adaptive
- then finish the specs, governance, and validation surfaces
- finally add commands, repair, evidence, and tests

---

## Notes

- This task punch set is ready for later implementation, but it is still only a plan.
- The actual plugin code should be created only when the corresponding Evo slice is activated.
- If a category profile is missing, the implementation slice must fail safely instead of inventing folders.

### One-Sentence Summary

`app_folder_structure` is a safe workspace-contractor plugin that creates a fixed app pipeline, loads approved category-based roadmap profiles, keeps source layout flexible, and proves every structural action with validation and evidence.
