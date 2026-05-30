# App Folder Structure Evo History

**Status:** `completed`  
**Track:** `plugin_dev` workspace for `app_folder_structure`  
**Scope:** `app_folder_structure` plugin workspace and app-workspace contract engine  
**Mode:** implementation history, canonical full-set delivered in workspace  
**Source:** user-provided app-folder structure brief, canonical full-set correction, and implemented workspace contract

---

## Purpose

This report preserves the `app_folder_structure` Evo sequence as the implementation history for the Plugin Development Track. The workspace now contains the realized plugin package, the governed app-folder contract, the canonical folder set, and the supporting docs, tests, and evidence structure.

The implemented target is a plugin workspace contract engine that:

- creates and validates app workspaces under `workspaces/apps/<app_slug>/`
- keeps app workspaces governed by a fixed canonical pipeline
- integrates category-approved roadmap structure through `app_category_registry`
- keeps `08_source` stack-adaptive and neutral
- writes manifests, evidence, validation, and repair records safely
- refuses unsafe slugs, unsafe paths, and missing category profiles
- preserves old compact folders only where legacy workspaces already exist

`app_folder_structure` does not invent a second plugin structure. It owns app-workspace governance, not plugin package promotion. The plugin workspace remains track-aware and safe.

---

## Evo Execution Record

| Evo ID | Implemented Title | Phase(s) | What It Delivers | Dependency Notes | Exit Criterion |
|---|---|---:|---|---|---|
| `appfs-000` | Repo analysis and scope lock | Phase 1 | Repo conventions, plugin-registration map, track model, and implementation boundaries captured in workspace docs. | First slice. Confirm repository patterns before coding. | The boundary is explicit and preserved. |
| `appfs-001` | Plugin skeleton and status surface | Phase 1 | Plugin workspace shell, metadata, bootstrap wiring, docs, schemas, tests, and read-only status output. | Depends on `appfs-000`. | `app_folder_structure` loads and reports status safely. |
| `appfs-002` | Workspace type registry | Phase 2 | Workspace-type registry for apps, plugins, blueprints, and benchmarks, plus validation for unsupported types. | Depends on `appfs-000` and `appfs-001`. | Workspace types are listed and invalid types are rejected. |
| `appfs-003` | Fixed app pipeline skeleton | Phase 3 | Canonical app workspace root and fixed pipeline skeleton under `workspaces/apps/<app_slug>/`. | Depends on `appfs-002`. | A new app workspace is created with the canonical top-level pipeline. |
| `appfs-004` | Viber input area | Phase 4 | Source-input area for snapshots, files, links, and questions/answers before generation. | Depends on `appfs-003`. | Viber inputs are separated from generated outputs. |
| `appfs-005` | Category registry integration | Phase 5 | Safe integration with `app_category_registry` and approved folder-structure profiles. | Depends on `appfs-003` and `appfs-004`. | Category-specific profile lookup is explicit and fail-closed. |
| `appfs-006` | Category-governed roadmap folders | Phase 6 | Category-approved roadmap internals for UI/UX, system design, and database/storage. | Depends on `appfs-005`. | Only approved roadmap sections are materialized. |
| `appfs-007` | Stack-adaptive source folder | Phase 7 | Neutral `08_source` layer that does not force frontend/backend/API structure. | Depends on `appfs-003`. | `08_source` stays stack-adaptive and source-only. |
| `appfs-008` | Full specification contract | Phase 8 | Handoff-grade requirements and specification placeholders for future software delivery. | Depends on `appfs-003`. | Specification folders exist and are traceable. |
| `appfs-009` | Version control governance | Phase 9 | Branch, commit, issue, pull request, release, and GitHub governance documentation. | Depends on `appfs-003`. | Version-control governance folders exist. |
| `appfs-010` | Evolutions and task punches | Phase 10 | Evolution-to-task-punch production model inside every app workspace. | Depends on `appfs-003`. | The workspace supports clear evolution and punch flow. |
| `appfs-011` | Production governance folders | Phase 11 | Agents, tests, evidence, review, release, owner portal, and archive folders. | Depends on `appfs-003`. | The governance pipeline exists from agents to archive. |
| `appfs-012` | Commands, validation, repair, and hardening | Phase 12 | Create/validate/repair/print/manifest commands, evidence, and safe repair checks. | Depends on `appfs-002` through `appfs-011`. | Workspace creation/validation/repair is safe and test-covered. |
| `appfs-013` | Full canonical folder set upgrade | Phase 13 | Additive upgrade to the full canonical folder set with backward compatibility for older compact folders. | Depends on `appfs-003` through `appfs-012`. | Existing compact folders are preserved and the full set is present. |
| `appfs-014` | Lifecycle, audit, final acceptance | Phase 14 | Lifecycle state management, audit trails, final docs, and acceptance hardening. | Depends on `appfs-012` and `appfs-013`. | The plugin is documented, audited, and ready for extension. |

---

## Execution Order

1. `appfs-000`
2. `appfs-001`
3. `appfs-002`
4. `appfs-003`
5. `appfs-004`
6. `appfs-005`
7. `appfs-006`
8. `appfs-007`
9. `appfs-008`
10. `appfs-009`
11. `appfs-010`
12. `appfs-011`
13. `appfs-012`
14. `appfs-013`
15. `appfs-014`

This kept the workspace contract, category profiles, and app-pipeline design ahead of validation, repair, and final acceptance.

---

## Safety Rules For The Implemented Plugin

- Do not regress the implemented contract when extending the plugin.
- Do not create app workspaces directly from undocumented paths.
- Do not duplicate `plugin_folder_structure` responsibilities.
- Do not let `08_source` invent stack-specific folders by default.
- Do not skip category profile validation.
- Do not delete or rename older compact folders if they already exist in a legacy workspace.
- Do not overwrite non-empty files without explicit approval or a safe flag.
- Do not move content automatically when a safe additive mapping is enough.
- Do not promote or publish anything directly.
- Do not treat this history file as a substitute for execution.

### Summary Of The Delivered Contract

The plugin now makes these guarantees:

- app workspaces are created only under `workspaces/apps/<app_slug>/`
- category-controlled roadmap internals come from approved profiles
- `08_source` remains neutral and stack-adaptive
- handoff-grade specs, version control governance, evolutions, task punches, and evidence are all represented
- validation and repair are safe, additive, and auditable
- older compact folders remain compatible where legacy workspaces already contain them
- Owner Track approval remains the final promotion surface

---

## Handoff Notes

Each Evo slice in this history produced:

- files changed
- behavior added
- tests added
- risks
- next phase readiness

The full implementation is now present in the workspace; future changes should preserve the same contract.

---

## Quick Reader Summary

If you only read one thing from this history:

1. `appfs-000` learned the repo and locked the architecture.
2. `appfs-001` created the plugin shell.
3. `appfs-002` created the workspace type registry.
4. `appfs-003` created the fixed app pipeline.
5. `appfs-004` captured Viber inputs.
6. `appfs-005` validated category profiles.
7. `appfs-006` materialized category-governed roadmap folders.
8. `appfs-007` kept `08_source` stack-adaptive.
9. `appfs-008` created handoff-grade specs.
10. `appfs-009` added version-control governance.
11. `appfs-010` added evolutions and task punches.
12. `appfs-011` added agents, tests, evidence, reviews, releases, owner portal, and archive.
13. `appfs-012` added create/validate/repair/manifest commands.
14. `appfs-013` upgraded to the full canonical folder set.
15. `appfs-014` hardened lifecycle, audit, and final acceptance.

Everything else exists to support those rules safely.
