# Plugin Dev Task Punches

**Status:** `planned`
**Track:** `plugin_dev`
**Scope:** `plugin_dev` plugin plan for the Plugin Development Track
**Mode:** planning only, no implementation yet
**Source:** `docs/reports/PLUGIN_DEV_EVO_PLAN.md`

---

## Purpose

This report converts the `plugin_dev` phase brief into implementation-ready task punches. It is still planning-only. No source code, schemas, runtime files, or commands are changed here.

Each task punch is narrow enough to be assigned later without overlapping another punch. The order below preserves the phase sequence in the user brief.

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
- Do not duplicate `plugin_folder_structure`.
- Do not create plugin folders directly from `plugin_dev`.
- Do not delete user files.
- Do not overwrite non-empty files without explicit approval.
- Do not allow path traversal or unsafe slugs.
- Do not invent folder structures outside the approved contract.
- Do not hardcode integration targets.
- Do not install or publish anything directly.

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

### `evo-pdev-000` - Scope lock and architecture confirmation

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-000-a` | Map repo conventions for plugins, CLI registration, runtime state, docs, and tests. | Learn how this repo already registers plugins, exposes commands, writes runtime state, and documents behavior so the new plugin follows the same rules. | `plugins/`, `src/cli/`, `schemas/`, `docs/`, `.kabeeri/` | Implementation code outside analysis scope | A clear analysis report exists with repo conventions and integration points. | Repository inspection only; no behavior changes. |
| `pdev-000-b` | Define the plugin-dev planning dependency map. | Convert the phase brief into ordered slices so each later step has a clear start and end. | `docs/reports/` | All runtime/implementation folders | The plugin-dev plan is split into safe Evo slices. | Review report completeness. |

### `evo-pdev-001` - Plugin skeleton and discoverability

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-001-a` | Create the plugin shell and manifest. | Establish `plugin_dev` as a real plugin package with a manifest and entry point, but no development lifecycle logic yet. | `plugins/plugin_dev/plugin.json`, `plugins/plugin_dev/README.md`, `plugins/plugin_dev/bootstrap.js`, `plugins/plugin_dev/index.js` | Workspaces, runtime, unrelated plugins | Plugin exists as a safe shell with documented purpose. | Plugin metadata loads and surfaces a status command. |
| `pdev-001-b` | Add status and doctor output only. | Give users and workers a read-only way to see what the plugin is for before any workspace logic is added. | `plugins/plugin_dev/*`, `src/cli/*` if wiring is needed | Workspace creation logic | Status and doctor report plugin state without creating folders. | CLI smoke for status/help. |

### `evo-pdev-002` - Core integration with `plugin_folder_structure`

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-002-a` | Create the workspace-contract integration layer. | Teach `plugin_dev` how to detect `plugin_folder_structure`, read its workspace contract, and decide whether workspace creation/checking can be delegated safely. | `plugins/plugin_dev/*`, plugin integration code, schemas, docs | Folder materialization logic copied from `plugin_folder_structure` | `plugin_folder_structure` integration is explicit and read-only at first. | Missing/disabled plugin handling tests. |
| `pdev-002-b` | Add workspace ensure/check/status/contract commands. | Make workspace validation part of the development flow, but keep creation delegated to the workspace-contract owner. | `plugins/plugin_dev/*`, CLI wiring, docs | Direct workspace creation code | Workspace checks fail closed when the contract is missing or invalid. | Workspace contract smoke tests. |

### `evo-pdev-003` - Plugin intake engine

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-003-a` | Create the intake reader and intake files. | Capture the plugin brief, target track, required capabilities, and missing information in the workspace. | workspace intake folders, plugin docs, plugin code | Source generation or package logic | Intake files are created only inside a valid plugin workspace. | Intake JSON validation and question extraction. |
| `pdev-003-b` | Add generic integration-question capture. | Collect the target-plugin integration questions without hardcoding any target list. | integration intake docs, JSON outputs, plugin code | Hardcoded target plugin knowledge | Integration needs are captured generically. | Missing-details reports and question-set tests. |

### `evo-pdev-004` - Git library input analyzer

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-004-a` | Register and analyze library inputs. | Let the plugin store references to Git/library inputs and analyze them safely. | library input folders, plugin code, docs | Blind code copying or unknown execution | Library refs can be registered and analyzed. | Structured analysis JSON and markdown. |
| `pdev-004-b` | Add license/security/reuse decision reporting. | Make legal and safety concerns visible before anything is reused. | library review folders, plugin code | Unapproved dependency install or code execution | Unsafe or unknown licenses are flagged. | License/security/reuse review tests. |

### `evo-pdev-005` - Plugin specification generator

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-005-a` | Generate the base plugin spec package. | Turn intake and library analysis into a complete plugin specification set. | spec docs, plugin code, workspace docs | Source generation | Specs are generated from intake and analysis. | Spec validation and missing-data blocking checks. |
| `pdev-005-b` | Add integration contract sections to the spec. | Document integration obligations for any target plugin slug, including roles, fallback, tests, and evidence. | integration spec docs, plugin code | Hardcoded integration only for known plugins | Integration requirements are written generically. | Integration-spec completeness tests. |

### `evo-pdev-006` - Governed task generator

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-006-a` | Convert specs into a governed task graph. | Create tasks from approved specs rather than inventing ad hoc work items. | task docs, plugin code, workspace docs | Source output | Task files are generated from specs. | Task dependency and acceptance checks. |
| `pdev-006-b` | Add integration tasks for declared targets. | Generate explicit integration tasks whenever another plugin is mentioned in the spec. | integration task docs, plugin code | Folder-structure creation tasks owned by `plugin_folder_structure` | Integration tasks exist for declared targets. | Integration-task coverage tests. |

### `evo-pdev-007` - Source builder orchestrator

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-007-a` | Build one task at a time. | Provide a controlled source builder that writes only inside allowed workspace paths. | source builder code, workspace source folders | Unrelated plugins, core files, or folder creation logic | A single task can be built safely. | Path-restriction and diff/evidence checks. |
| `pdev-007-b` | Emit build reports and changed-file lists. | Record what changed for auditability and later review. | source build reports, evidence folders | Hidden file mutation | Build evidence exists for each task. | Build-report and changed-file tests. |

### `evo-pdev-008` - Schema, runtime, and contract validation

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-008-a` | Validate manifest, schema, runtime, and command contracts. | Check that the plugin is internally consistent before packaging. | validators, schemas, docs, reports | Auto-fixing or rewriting source | Invalid source or contracts are blocked. | Validation report generation tests. |
| `pdev-008-b` | Validate declared integration contracts read-only. | Confirm each target plugin integration has explicit fallback and boundary rules. | integration validators, reports | Contract mutation | Invalid required integrations block packaging. | Integration validation checks. |

### `evo-pdev-009` - Generic plugin integration builder

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-009-a` | Add generic integration contracts for any target plugin slug. | Let `plugin_dev` support any mentioned plugin without hardcoding a fixed list. | integration builder code, docs, schemas | Special-casing only known plugins | Generic integration contracts are generated safely. | Unknown-target and missing-metadata tests. |
| `pdev-009-b` | Generate integration tests and evidence. | Ensure every declared integration is proven, not just documented. | integration tests, evidence folders | Skipping required tests | Required integration failures block readiness. | Integration evidence and fallback-behavior checks. |

### `evo-pdev-010` - Test runner and quality gate

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-010-a` | Add a plugin-level test plan and runner. | Run plugin tests through existing repo test tooling. | test docs, test runner code, workspace fixtures | New test framework if one already exists | Tests can run for a developed plugin. | Test-plan and test-report checks. |
| `pdev-010-b` | Gate packaging on test quality. | Make test failures and required integration failures block packaging. | quality-gate code, reports | Packaging without quality checks | Failed tests block packaging. | Quality-gate blocking tests. |

### `evo-pdev-011` - Evidence and audit trail

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-011-a` | Collect evidence per major phase. | Write durable evidence records for workspace validation, intake, specs, tasks, source, tests, and integrations. | evidence folders, audit reports, plugin code | Secret exposure | Every major phase produces evidence. | Evidence index completeness. |
| `pdev-011-b` | Add evidence verification/reporting. | Give Owner Track a clear review trail. | evidence reports, audit summaries | Silent evidence loss | Evidence verification detects missing phase records. | Evidence verification checks. |

### `evo-pdev-012` - Readiness scoring and package gating

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-012-a` | Score readiness across all major categories. | Compute a 0-100 readiness picture with blockers and warnings. | readiness code, reports, docs | Auto-promotion | Readiness gives clear pass/fail. | Readiness score/report tests. |
| `pdev-012-b` | Gate package build on readiness. | Prevent packaging until the workspace, integrations, tests, and evidence are ready. | package gate code, reports | Packaging when critical categories fail | Packaging is blocked when readiness is below threshold. | Package-readiness blocking tests. |

### `evo-pdev-013` - Promotion request workflow

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-013-a` | Generate a formal Owner Track promotion request. | Create review artifacts that ask for install, marketplace review, or rework. | promotion request docs, reports, workspace evidence | Direct install/publish logic | Promotion requests are generated without auto-promotion. | Promotion-request completeness checks. |
| `pdev-013-b` | Include risks, evidence, and decision options. | Make the owner decision surface explicit and reviewable. | promotion docs, evidence summaries | Hidden approval logic | Owner Track has clear decision options. | Risk/evidence inclusion checks. |

### `evo-pdev-014` - Dashboard and status surfaces

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-014-a` | Add read-only status and summary outputs. | Show current workspace health without mutating files. | dashboard/status code, reports | Workspace mutation | Users can inspect progress without mutating files. | Status/dashboard smoke tests. |
| `pdev-014-b` | Surface integration and readiness state in the dashboard. | Make blockers and progress visible in a machine-readable way. | dashboard JSON/markdown outputs | Hidden state changes | Integration status is visible. | Dashboard-data completeness checks. |

### `evo-pdev-015` - Documentation and final hardening

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `pdev-015-a` | Finalize docs and command references. | Explain how the plugin works and how it relates to `plugin_folder_structure`. | docs, README, command reference | Behavior changes disguised as docs | The workflow is documented clearly. | Documentation completeness review. |
| `pdev-015-b` | Add hardening tests for failure and safety cases. | Prove the plugin fails closed for invalid workspaces, libraries, integrations, and promotion attempts. | tests, validation fixtures | Unsafe writes or auto-promotion | The plugin is hardened and test-covered. | Final safety-matrix tests. |

---

## Recommended Worker Assignment Shape

For execution later, assign work in this order:

1. Scope lock and architecture confirmation
2. Plugin shell
3. Core integration with `plugin_folder_structure`
4. Intake
5. Library analysis
6. Spec generation
7. Task generation
8. Source building
9. Validation
10. Generic integration builder
11. Tests and quality gate
12. Evidence and audit
13. Readiness and package gating
14. Promotion requests
15. Dashboard and status
16. Documentation and hardening

This keeps the early slices small and prevents integration logic from being mixed with packaging too soon.

---

## Notes

- This task punch set is ready for later implementation, but it is still only a plan.
- The actual plugin code should be created only when the corresponding Evo slice is activated.
- If `plugin_folder_structure` is missing or disabled, the implementation slice must fail safely instead of inventing workspace structure.

### One-Sentence Summary

`plugin_dev` is a plugin-development orchestrator that validates workspaces through `plugin_folder_structure`, safely analyzes libraries, generates specs/tasks/source/evidence/readiness for any plugin being developed, and raises Owner Track promotion requests without self-approval.
