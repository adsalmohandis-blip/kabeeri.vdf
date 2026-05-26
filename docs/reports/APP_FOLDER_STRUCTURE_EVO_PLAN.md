# App Folder Structure Evo Plan

**Status:** `planned`
**Track:** `owner`
**Scope:** `app_folder_structure` plugin plan on the owner track
**Mode:** planning only, no implementation yet
**Source:** user-provided phase brief

---

## Purpose

This report turns the requested `app_folder_structure` phase brief into an ordered Evo queue for the owner-track dev process. It is a planning artifact only. No plugin code, schema, runtime, or command changes are made by this report.

The intended target is the official folder contract engine for KVDOS/KVDF app workspaces under:

`./workspaces/apps/<app-slug>/`

### Plain-English Goal

We want one plugin to define and safely create the complete app workspace shape for every app project. That plugin should:

- understand the workspace root
- know which workspace types are allowed
- build the fixed production pipeline
- separate Viber inputs from generated outputs
- respect category-approved roadmap structures
- keep source layout stack-adaptive
- produce manifests, validation, repair, and evidence

It must do this without inventing random folders or overwriting user files.

---

## Proposed Evo Queue

| Evo ID | Planned Title | Source Phase(s) | What It Delivers | Dependency Notes | Exit Criterion |
|---|---|---:|---|---|---|
| `evo-appfs-000` | App Folder Structure intake and repo analysis | Phase 00 + Phase 01 | A repo-convention map, a plugin boundary map, and a list of safe integration points. | First slice. Must review repo conventions before any implementation. | Analysis report and repo-convention map exist. |
| `evo-appfs-001` | Plugin shell, metadata, and status command | Phase 01 | A discoverable plugin package with metadata and a read-only status/help surface. | Depends on `evo-appfs-000`. | Plugin shell exists and exposes a safe status surface. |
| `evo-appfs-002` | Workspace type registry and root resolver | Phase 02 | An explicit allow-list for workspace types and a safe resolver for `./workspaces/`. | Depends on `evo-appfs-000`. | Supported workspace roots are defined and invalid types are rejected. |
| `evo-appfs-003` | Fixed app pipeline core and create/validate skeleton | Phase 03 | The top-level workspace pipeline and safe create/validate behavior for app workspaces. | Depends on `evo-appfs-001` and `evo-appfs-002`. | App workspace skeleton can be created and validated safely. |
| `evo-appfs-004` | Viber input area materialization | Phase 04 | The source-intake zone for Viber-provided text, files, links, snapshots, and Q&A. | Depends on `evo-appfs-003`. | `00_viber_inputs/` is materialized as source-only input space. |
| `evo-appfs-005` | Category registry integration and profile validation | Phase 05 | Approved category-driven roadmap profiles and the adapter that loads them. | Depends on `evo-appfs-002` and `evo-appfs-003`. | Approved category profiles are loaded and validated safely. |
| `evo-appfs-006` | Category-governed roadmap folder materialization | Phase 06 | The generated roadmap folders for UI/UX, system design, and database, based on the approved profile. | Depends on `evo-appfs-005`. | UI/UX, system design, and database roadmap subfolders are generated from category profiles. |
| `evo-appfs-007` | Stack-adaptive source folder contract | Phase 07 | A neutral `08_source/` container with no forced framework tree. | Depends on `evo-appfs-003`. | `08_source/` remains neutral and stack-adaptive. |
| `evo-appfs-008` | Full specifications handoff package | Phase 08 | The handoff-grade documentation contract for product, requirements, architecture, testing, and operations. | Depends on `evo-appfs-003`. | Handoff-grade spec placeholders and manifests exist. |
| `evo-appfs-009` | Version control and GitHub governance folders | Phase 09 | Local documentation and policy surfaces for branch, commit, issue, PR, and release governance. | Depends on `evo-appfs-003`. | Version control governance folders exist without replacing GitHub. |
| `evo-appfs-010` | Evolutions and task punches folders | Phase 10 | The internal production flow folders for larger changes and small executable tasks. | Depends on `evo-appfs-003`. | Evolution and task punch production flow folders exist. |
| `evo-appfs-011` | Agents, quality, evidence, review, release, owner, archive | Phase 11 | The remaining production governance folders that support traceability, quality, approvals, and archiving. | Depends on `evo-appfs-003`. | Remaining governance folders exist end to end. |
| `evo-appfs-012` | Safe commands, validation, repair, evidence, and tests | Phase 12 + revision closeout | The safe command surface, repair flow, evidence generation, validation, and tests needed to ship the plugin. | Depends on `evo-appfs-001` through `evo-appfs-011`. | Create/validate/repair/print/manifest commands and test coverage are complete. |

---

## Recommended Execution Order

1. `evo-appfs-000`
2. `evo-appfs-001`
3. `evo-appfs-002`
4. `evo-appfs-003`
5. `evo-appfs-004`
6. `evo-appfs-005`
7. `evo-appfs-006`
8. `evo-appfs-007`
9. `evo-appfs-008`
10. `evo-appfs-009`
11. `evo-appfs-010`
12. `evo-appfs-011`
13. `evo-appfs-012`

This ordering keeps the workspace contract, category profiles, and safe creation rules ahead of the higher-level documentation and governance surfaces.

### Why This Order Matters

- The repository conventions must be understood before any new plugin is added.
- Workspace types and root safety must exist before any folder creation.
- The fixed pipeline must exist before source, specs, or governance subfolders are generated.
- Category profiles must be validated before roadmap internals are materialized.
- Safe commands and repair are the last step because they depend on every previous contract being defined.

---

## Safety Rules For The Future Implementation

- Do not start implementation until the active Evo slice is confirmed.
- Do not invent folder structures outside the fixed pipeline.
- Do not add roadmap internals unless the category profile authorizes them.
- Do not force a source tree layout inside `08_source/`.
- Do not overwrite user files or delete existing content.
- Do not allow path traversal or unsafe app slugs.
- Do not create unsupported workspace types.
- Do not treat the planning report as a substitute for execution.

### Summary Of The Intended Contract

The plugin should eventually make these guarantees:

- app workspaces always start with the same top-level pipeline
- Viber inputs stay separated from system-generated outputs
- roadmap internals are category-governed, not AI-invented
- source layout stays flexible for different stacks
- validation and repair are safe and non-destructive
- evidence is generated for every structural action
- the plugin fails closed when the category profile is missing or invalid

---

## Suggested Handoff Notes

When this queue is ready to execute, each Evo should produce:

- files changed
- behavior added
- tests added
- risks
- next phase readiness

The first implementation slice should begin only after the analysis slice is complete and the repo conventions have been confirmed.

---

## Quick Reader Summary

If you only read one thing from this plan:

1. `evo-appfs-000` learns the repo.
2. `evo-appfs-001` creates the plugin shell.
3. `evo-appfs-002` defines which workspace types exist.
4. `evo-appfs-003` creates the fixed app pipeline.
5. `evo-appfs-004` separates Viber input from generated output.
6. `evo-appfs-005` makes roadmap structure category-driven.
7. `evo-appfs-007` keeps source layout stack-adaptive.
8. `evo-appfs-012` adds the safe command and repair surface.

Everything else exists to support those rules safely.
