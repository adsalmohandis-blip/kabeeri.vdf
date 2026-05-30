# App Folder Structure Task Punches

**Status:** `planned`  
**Track:** `plugin_dev` workspace for `app_folder_structure`  
**Scope:** `app_folder_structure` plugin workspace and app-workspace contract engine  
**Mode:** planning only, no implementation yet  
**Source:** `docs/reports/APP_FOLDER_STRUCTURE_EVO_PLAN.md`

---

## Purpose

This report converts the `app_folder_structure` plan into implementation-ready task punches. It is still planning-only. No source code, schemas, runtime files, or commands are changed here.

Each punch is narrow enough to be assigned later without overlapping another punch. The order below preserves the planned Evo sequence and the additive compatibility rule.

### Plain-English Goal

Each punch should be small enough that a worker can understand it without reading the whole roadmap again. A good punch should answer:

- what command or surface is being built
- what the worker is allowed to touch
- what must stay untouched
- how success will be recognized
- which tests or checks prove the work is safe

The goal is to remove guesswork before implementation starts.

---

## Global Safety Rules

- Do not start implementation until the active Evo slice is approved.
- Do not change unrelated plugins or runtime systems.
- Do not duplicate `plugin_folder_structure` responsibilities.
- Do not create app workspaces outside the canonical `workspaces/apps/<app_slug>/` root.
- Do not delete user files.
- Do not overwrite non-empty files without explicit approval or a safe flag.
- Do not allow path traversal or unsafe slugs.
- Do not invent folder structures outside the approved contract.
- Do not auto-migrate compact folders unless the change is explicitly additive.
- Do not promote or publish anything directly.

### What A Good Punch Looks Like

A task punch is good when it is:

- narrow enough to finish in one focused pass
- explicit about allowed and forbidden paths
- explicit about the contract it is changing
- explicit about tests and validation
- explicit about what it must not change

If a punch would require multiple unrelated systems, it should be split.

---

## Task Punch Breakdown

### `appfs-000` - Repo analysis and scope lock

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-000-a` | Map repo conventions and safe integration points. | Learn how this repo already registers plugins, exposes commands, writes runtime state, and documents behavior so the new plugin follows the same rules. | `plugins/`, `src/cli/`, `schemas/`, `docs/`, `.kabeeri/` | Implementation code outside analysis scope | A clear analysis report exists with repo conventions and integration points. | Repository inspection only; no behavior changes. |
| `appfs-000-b` | Define the app-folder planning dependency map. | Convert the phase brief into ordered slices so each later step has a clear start and end. | `docs/reports/` | All runtime/implementation folders | The app-folder plan is split into safe Evo slices. | Review report completeness. |

### `appfs-001` - Plugin skeleton and status surface

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-001-a` | Create the plugin shell and manifest. | Establish `app_folder_structure` as a real plugin package with a manifest and entry point, but no app-workspace logic yet. | `plugins/app_folder_structure/plugin.json`, `plugins/app_folder_structure/README.md`, `plugins/app_folder_structure/bootstrap.js`, `plugins/app_folder_structure/index.js` | Workspaces, runtime, unrelated plugins | Plugin exists as a safe shell with documented purpose. | Plugin metadata loads and surfaces a status command. |
| `appfs-001-b` | Add status output and discoverability reporting. | Give users and workers a read-only way to see what the plugin is for before any workspace logic is added. | `plugins/app_folder_structure/*`, `src/cli/*` if wiring is needed | Workspace creation logic | Status reports plugin state without creating folders. | CLI smoke for status/help. |

### `appfs-002` - Workspace type registry

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-002-a` | Define the visible workspace-type registry. | List supported workspace types for the app workspace root. | plugin registry files, docs, schemas | App workspace materialization | Workspace types are listed explicitly. | Registry listing checks. |
| `appfs-002-b` | Validate supported workspace types and reject unsupported ones. | Fail closed for unrecognized workspace types and unsafe roots. | validation code, schemas, reports | Auto-creating unsupported types | Invalid workspace types are rejected. | Unsupported-type validation tests. |

### `appfs-003` - Fixed app pipeline skeleton

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-003-a` | Create the fixed app pipeline skeleton. | Create the canonical app workspace root and the top-level pipeline folders only. | `workspaces/apps/<app_slug>/`, app folder templates, docs | Source-layout forcing | A new app workspace has the canonical top-level pipeline. | Create/structure tests. |
| `appfs-003-b` | Write app manifest, state, and hidden metadata scaffolding. | Add workspace state and manifest files that make the app workspace tractable. | `.kabeeri/` under the app workspace, manifest files, docs | Source implementation files | App manifest/state exists alongside the pipeline. | Manifest/state presence checks. |

### `appfs-004` - Viber input area

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-004-a` | Create the Viber input area. | Create the input-only area for uploaded snapshots, files, links, and answers. | `00_plugin_inputs/` or app input area, docs, manifest files | Roadmap/spec outputs | Viber-provided source material is separated cleanly. | Input-area layout tests. |
| `appfs-004-b` | Separate inputs from generated outputs. | Prevent generated roadmap/spec material from leaking into the input zone. | input docs, validation code | Generated content paths | Inputs and outputs are strictly separated. | Separation invariant tests. |

### `appfs-005` - Category registry integration

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-005-a` | Integrate with `app_category_registry`. | Load approved folder-structure profiles for the selected category/platform. | registry adapter, docs, schemas | Randomly invented roadmap folders | Category profiles are loaded and validated. | Category lookup tests. |
| `appfs-005-b` | Require approved folder-structure profiles. | Fail safely when the category profile is missing, invalid, or incomplete. | validation code, reports | Silent fallback to generic roadmap folders | Missing profiles stop generation. | Missing-profile failure tests. |

### `appfs-006` - Category-governed roadmap folders

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-006-a` | Materialize category-governed roadmap folders. | Create only approved UI/UX, system design, and database/storage internals. | roadmap folders, category profile reader, docs | Unapproved roadmap sections | Roadmaps are reproducible and profile-driven. | Roadmap materialization tests. |
| `appfs-006-b` | Generate roadmap structure evidence. | Save a machine-readable record of which profile created which folders. | evidence folder, roadmap structure outputs | Hidden mutating behavior | Roadmap evidence is emitted for each creation. | Evidence output tests. |

### `appfs-007` - Stack-adaptive source folder

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-007-a` | Keep `08_source` stack-adaptive. | Make the source area neutral and governed only by later stack/framework selection. | `08_source/`, source manifest, docs | Default frontend/backend/API trees | Source remains stack-adaptive. | Source neutrality tests. |
| `appfs-007-b` | Emit a neutral source manifest. | Record that the real source layout will be created later by the selected stack/framework. | `08_source/source_manifest.json`, docs | Package-specific source shape | The manifest states source tracking only. | Source-manifest content tests. |

### `appfs-008` - Full specification contract

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-008-a` | Create handoff-grade specification placeholders. | Create product, requirements, and handoff-oriented docs for future teams. | `03_full_specifications/`, docs | Generated runtime source | Specification placeholders exist. | File-presence tests. |
| `appfs-008-b` | Add spec index and traceability artifacts. | Make it easy to see where requirements came from and where they go. | spec index, traceability docs, evidence | Free-form undocumented changes | Specs are traceable. | Traceability checks. |

### `appfs-009` - Version control governance

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-009-a` | Add version control governance folders. | Add branch, commit, issue, PR, and release strategy docs. | `04_version_control/`, docs | Git commands that mutate unrelated repos | Governance folders exist. | Presence and content checks. |
| `appfs-009-b` | Add GitHub and release governance docs. | Document how version control and releases are governed when GitHub is connected. | governance docs, release docs | Auto-publish logic | Release governance is documented. | Governance documentation checks. |

### `appfs-010` - Evolutions and task punches

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-010-a` | Add evolutions governance folders. | Add a place to track large change packages. | `05_evolutions/`, docs | Execution logic inside planning docs | Evolutions folders exist. | Folder creation checks. |
| `appfs-010-b` | Add task punch governance folders. | Add a place to track granular executable punches. | `06_task_punches/`, docs | Hidden task execution side effects | Task-punch folders exist. | Folder creation checks. |

### `appfs-011` - Production governance folders

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-011-a` | Add agents, tests, evidence, and reviews folders. | Add the production governance areas needed for build quality and review. | `07_agents/`, `09_tests_quality/`, `10_evidence_audit/`, `11_reviews_approvals/` | Source generation | Governance folders exist from agents to reviews. | Folder presence checks. |
| `appfs-011-b` | Add release, owner portal, and archive folders. | Add release/deployment and owner-facing summary areas plus archive. | `12_releases_deployment/`, `13_owner_portal/`, `99_archive/` | Direct publication | Release and archive areas exist. | Folder presence checks. |

### `appfs-012` - Commands, validation, repair, and hardening

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-012-a` | Implement create, validate, repair, print, and manifest commands. | Add the command surface for managing app workspaces safely. | CLI integration, plugin command surface, docs | Unsafe creation paths | Commands exist and are safe. | CLI smoke tests. |
| `appfs-012-b` | Add safe repair, manifest, evidence, and hardening tests. | Ensure repair is additive only and produces evidence. | validation, repair, evidence, tests | Deletion or overwrite of user content | Repair writes evidence and preserves content. | Repair/evidence tests. |

### `appfs-013` - Full canonical folder set upgrade

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-013-a` | Upgrade existing workspaces additively to the full canonical set. | Add missing folders/files without deleting compact folders already present. | workspace root, manifests, mapping docs | Renaming or deleting compact folders | Existing compact workspaces are upgraded additively. | Additive-upgrade tests. |
| `appfs-013-b` | Add compatibility mapping documentation. | Show how older compact folders map into the canonical layout. | `99_archive/compact_structure_mapping.md`, manifests | Content migration without approval | Mapping is documented and preserved. | Compatibility mapping review. |

### `appfs-014` - Lifecycle, audit, final acceptance

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `appfs-014-a` | Add lifecycle and audit services. | Track workspace lifecycle transitions and audit records. | lifecycle, audit, evidence, docs | Hidden state changes | Lifecycle and audit records exist. | Audit event tests. |
| `appfs-014-b` | Finalize docs and acceptance tests. | Ensure the plugin is documented and the full safety matrix is covered. | docs, tests, reports | Auto-promotion or unsafe publish | Final docs and acceptance tests pass. | Final hardening tests. |

---

## Recommended Worker Assignment Shape

For execution later, assign work in this order:

1. Scope lock and architecture confirmation
2. Plugin shell
3. Workspace type registry
4. Fixed app pipeline
5. Viber input area
6. Category registry integration
7. Category-governed roadmap folders
8. Stack-adaptive source folder
9. Full specification contract
10. Version control governance
11. Evolutions and task punches
12. Production governance folders
13. Commands, validation, repair, and hardening
14. Full canonical folder set upgrade
15. Lifecycle, audit, final acceptance

This keeps the early slices small and prevents category logic from being mixed with validation and repair too soon.

---

## Notes

- This task punch set is ready for later implementation, but it is still only a plan.
- The actual plugin code should be created only when the corresponding Evo slice is activated.
- If `app_category_registry` is missing or invalid, the implementation slice must fail safely instead of inventing roadmap structure.

### One-Sentence Summary

`app_folder_structure` is the app-workspace contract engine that creates canonical app workspaces, integrates category-approved roadmap profiles, keeps source layout stack-adaptive, preserves compact compatibility, and raises safe validation/repair/evidence flows without inventing its own app rules.
