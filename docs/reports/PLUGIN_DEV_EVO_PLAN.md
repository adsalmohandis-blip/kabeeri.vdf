# Plugin Dev Evo Plan

**Status:** `planned`
**Track:** `plugin_dev`
**Scope:** `plugin_dev` plugin plan for the Plugin Development Track
**Mode:** planning only, no implementation yet
**Source:** user-provided `plugin_dev` phase brief

---

## Purpose

This report turns the requested `plugin_dev` phase brief into an ordered Evo queue for the Plugin Development Track. It is a planning artifact only. No plugin code, workspace logic, schema, runtime, or command changes are made by this report.

The intended target is a plugin development orchestrator that:

- consumes workspaces created by `plugin_folder_structure`
- validates workspace contracts before any development work
- analyzes Git libraries safely
- generates plugin specs, tasks, source plans, tests, evidence, and readiness outputs
- supports generic plugin-to-plugin integration for any target plugin slug
- raises promotion requests without installing or publishing anything directly

`plugin_dev` must not duplicate `plugin_folder_structure`. That plugin owns workspace creation and workspace-contract validation. `plugin_dev` owns the development lifecycle after the workspace exists.

---

## Proposed Evo Queue

| Evo ID | Planned Title | Source Phase(s) | What It Delivers | Dependency Notes | Exit Criterion |
|---|---|---:|---|---|---|
| `evo-pdev-000` | Scope lock and architecture confirmation | Phase 0 | A repo-convention map, architecture boundary map, command-surface outline, and safety rules for `plugin_dev`. | First slice. Must review repo conventions before implementation starts. | The plan is agreed and the plugin boundary is explicit. |
| `evo-pdev-001` | Plugin skeleton and discoverability | Phase 1 | A minimal removable plugin package with metadata, bootstrap/entry wiring, docs, schemas, tests, and read-only status/doctor commands. | Depends on `evo-pdev-000`. | `plugin_dev` loads, is discoverable, and exposes status/doctor safely. |
| `evo-pdev-002` | Core integration with `plugin_folder_structure` | Phase 2 | Workspace lookup, workspace-contract reading, safe delegation checks, and strict refusal to create folders directly. | Depends on `evo-pdev-000` and `evo-pdev-001`. | Workspace validation is delegated to `plugin_folder_structure`. |
| `evo-pdev-003` | Plugin intake engine | Phase 3 | Intake collection for plugin brief, track, requirements, integration questions, and missing-question reporting. | Depends on `evo-pdev-002`. | Plugin intake is captured only after workspace validation passes. |
| `evo-pdev-004` | Git library input analyzer | Phase 4 | Safe registration and analysis of external Git/library inputs with license, security, reuse, and attribution reviews. | Depends on `evo-pdev-003`. | Library inputs are analyzed without blind code copying. |
| `evo-pdev-005` | Plugin specification generator | Phase 5 | A full plugin spec package, including integration-specific contracts and blocking questions when data is missing. | Depends on `evo-pdev-003` and `evo-pdev-004`. | Approved specs can be generated and validated. |
| `evo-pdev-006` | Governed task generator | Phase 6 | A task graph derived from the validated spec, including integration tasks and evidence requirements. | Depends on `evo-pdev-005`. | Tasks are generated from specs, not invented ad hoc. |
| `evo-pdev-007` | Source builder orchestrator | Phase 7 | Safe, task-by-task source generation inside the approved workspace with patch/evidence output. | Depends on `evo-pdev-006`. | A single task can be built safely inside allowed paths. |
| `evo-pdev-008` | Schema, runtime, and contract validation | Phase 8 | Read-only validation for manifest, schemas, runtime-state paths, commands, and integration contracts. | Depends on `evo-pdev-005` through `evo-pdev-007`. | Invalid source or contracts are blocked from packaging. |
| `evo-pdev-009` | Generic plugin integration builder | Phase 9 | A reusable integration builder that supports any target plugin slug with contracts, adapters, tests, and evidence. | Depends on `evo-pdev-005` and `evo-pdev-008`. | Generic integrations are generated and validated safely. |
| `evo-pdev-010` | Test runner and quality gate | Phase 10 | A focused plugin quality gate that proves workspace, contract, and integration safety before packaging. | Depends on `evo-pdev-007` through `evo-pdev-009`. | Test failures block packaging and promotion. |
| `evo-pdev-011` | Evidence and audit trail | Phase 11 | Durable evidence for workspace validation, specs, tasks, source generation, tests, and integration work. | Depends on `evo-pdev-003` through `evo-pdev-010`. | Every major phase writes evidence. |
| `evo-pdev-012` | Readiness scoring and package gating | Phase 12 + Phase 13 | Readiness scoring plus package validation so unready plugins cannot be bundled or promoted. | Depends on `evo-pdev-010` and `evo-pdev-011`. | Readiness is clear and package build is gated safely. |
| `evo-pdev-013` | Promotion request workflow | Phase 14 | A formal Owner Track review request with package, evidence, risk, and decision options. | Depends on `evo-pdev-012`. | Promotion requests are generated without auto-promotion. |
| `evo-pdev-014` | Dashboard and status surfaces | Phase 15 | Read-only status, summary, and dashboard data for development workspaces. | Depends on `evo-pdev-003` through `evo-pdev-013`. | Users can inspect progress without mutating files. |
| `evo-pdev-015` | Documentation and final hardening | Phase 16 | Final docs, safety coverage, and hardening tests for the full plugin lifecycle. | Depends on `evo-pdev-001` through `evo-pdev-014`. | The plugin is documented, hardened, and ready for extension. |

---

## Recommended Execution Order

1. `evo-pdev-000`
2. `evo-pdev-001`
3. `evo-pdev-002`
4. `evo-pdev-003`
5. `evo-pdev-004`
6. `evo-pdev-005`
7. `evo-pdev-006`
8. `evo-pdev-007`
9. `evo-pdev-008`
10. `evo-pdev-009`
11. `evo-pdev-010`
12. `evo-pdev-011`
13. `evo-pdev-012`
14. `evo-pdev-013`
15. `evo-pdev-014`
16. `evo-pdev-015`

This ordering keeps the workspace contract, intake, analysis, and spec layers ahead of source generation, packaging, and promotion.

---

## Safety Rules For The Future Implementation

- Do not start implementation until the active Evo slice is confirmed.
- Do not create workspace folders directly inside `plugin_dev`.
- Do not duplicate the job of `plugin_folder_structure`.
- Do not allow blind copying from external libraries.
- Do not generate integrations without contracts and tests.
- Do not install or publish anything directly.
- Do not bypass Owner Track approval.
- Do not overwrite unrelated files or delete user content.
- Do not invent a hardcoded fixed list of integration targets.
- Do not treat this planning report as a substitute for execution.

### Summary Of The Intended Contract

The plugin should eventually make these guarantees:

- plugin workspaces are validated before development starts
- `plugin_folder_structure` remains the source of truth for workspace shape
- Git libraries are analyzed safely and respectfully
- plugin specs and tasks are generated from evidence and declared requirements
- integrations are generic and contract-driven for any target plugin slug
- source generation is task-scoped and path-restricted
- validation, tests, evidence, readiness, packaging, and promotion are all gated
- Owner Track remains the final approval surface

---

## Suggested Handoff Notes

When this queue is ready to execute, each Evo should produce:

- files changed
- behavior added
- tests added
- risks
- next phase readiness

The first implementation slice should begin only after the scope lock is complete and the repo conventions have been confirmed.

---

## Quick Reader Summary

If you only read one thing from this plan:

1. `evo-pdev-000` learns the repo and locks the architecture.
2. `evo-pdev-001` creates the plugin shell.
3. `evo-pdev-002` integrates with `plugin_folder_structure`.
4. `evo-pdev-003` captures plugin intake and integration questions.
5. `evo-pdev-004` analyzes external libraries safely.
6. `evo-pdev-005` generates plugin specs.
7. `evo-pdev-006` turns specs into governed tasks.
8. `evo-pdev-007` builds source one task at a time.
9. `evo-pdev-009` handles generic integrations for any target plugin.
10. `evo-pdev-012` gates readiness and packaging.
11. `evo-pdev-013` raises Owner Track promotion requests.
12. `evo-pdev-015` hardens and documents the full workflow.

Everything else exists to support those rules safely.
