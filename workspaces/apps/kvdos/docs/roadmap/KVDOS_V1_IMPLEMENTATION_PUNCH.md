# KVDOS V1 Implementation Punch

Updated: 2026-05-22

Branch: `docs/kvdos-v1-implementation-punch`

Status: implementation roadmap only

This document defines the real KVDOS v1 implementation slices only.
It does not implement code.
It does not authorize skipping owner approval.
It stays app-local to `workspaces/apps/kvdos/`.

## Implementation Order

1. `impl-0` Implementation Baseline And Guardrails
2. `impl-1` Local IDE Studio Shell Skeleton
3. `impl-2` Studio Navigation Scaffold
4. `impl-3` Project Registry Selector
5. `impl-4` Selected Project Context
6. `impl-5` Studio Landing Canvas
7. `impl-6` Empty-State Orchestration
8. `impl-7` Local Runtime State Skeleton
9. `impl-8` Workspace Persistence Layer
10. `impl-9` `.kvdos` Workspace Surface
11. `impl-10` App State Validation
12. `impl-11` Discovery Questionnaires Surface
13. `impl-12` Spec Blueprint Surface
14. `impl-13` Tasking Surface
15. `impl-14` Approval Surface
16. `impl-15` Task / Approval Persistence
17. `impl-16` Cloud Account Shell
18. `impl-17` Authentication Session Flow
19. `impl-18` Subscription Entitlement Wiring
20. `impl-19` Device Activation Flow
21. `impl-20` Local License Gate Enforcement
22. `impl-21` Release Access Controls
23. `impl-22` Safety Gate Surface
24. `impl-23` Quality Gate Surface
25. `impl-24` Execution Approval Flow
26. `impl-25` Logs / Trace / Audit Skeleton
27. `impl-26` Local Runner Skeleton
28. `impl-27` Approved Execution Loop
29. `impl-28` Desktop Build Pipeline
30. `impl-29` Release Packaging + Update Strategy
31. `impl-30` KVDOS Adapter Boundary And V1 Hardening
32. `impl-31` V1 QA, Release Candidate, And Launch Handoff

## Slice Specifications

### `impl-0` Implementation Baseline And Guardrails

- Goal: establish the implementation rules, file boundaries, and review gates for the rest of KVDOS v1.
- Product output: implementation baseline, guardrails, and branch/PR discipline.
- Allowed files/areas:
  - `workspaces/apps/kvdos/docs/**`
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - other app-local files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `workspaces/apps/kvdos/.kabeeri/**`
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: none; this is the first implementation slice.
- Acceptance criteria:
  - implementation rules are explicit
  - file boundaries are explicit
  - owner approval is required before later slices
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
- Suggested branch: `impl/0-baseline-and-guardrails`
- Suggested PR title: `impl-0: implementation baseline and guardrails`

### `impl-1` Local IDE Studio Shell Skeleton

- Goal: create the initial Studio shell frame and landing structure.
- Product output: visible KVDOS Studio shell skeleton.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting `workspaces/apps/kvdos/docs/**` updates only if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, runtime, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-0`.
- Acceptance criteria:
  - Studio shell renders as a stable app surface
  - first screen shows a usable shell frame
  - no cloud or runtime features are required to orient the user
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/1-studio-shell-skeleton`
- Suggested PR title: `impl-1: local IDE studio shell skeleton`

### `impl-2` Studio Navigation Scaffold

- Goal: add the primary navigation structure for Studio.
- Product output: navigation scaffold with shell-level routes and entry points.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-1`.
- Acceptance criteria:
  - navigation is visible and stable
  - shell navigation does not imply runtime or cloud behavior
  - selected-project context can be surfaced later without rewrites
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/2-studio-navigation-scaffold`
- Suggested PR title: `impl-2: studio navigation scaffold`

### `impl-3` Project Registry Selector

- Goal: let Studio show projects and select the active workspace/project.
- Product output: project registry selector in the shell.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-2`.
- Acceptance criteria:
  - projects can be listed and selected
  - active selection is visible in the shell
  - no runtime or cloud dependency is introduced
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/3-project-registry-selector`
- Suggested PR title: `impl-3: project registry selector`

### `impl-4` Selected Project Context

- Goal: keep the selected project visible and persistent in the Studio shell.
- Product output: selected-project context display and persistence hooks.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-3`.
- Acceptance criteria:
  - current project context is always visible
  - changing context does not require cloud or runtime work
  - state remains app-local
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/4-selected-project-context`
- Suggested PR title: `impl-4: selected project context`

### `impl-5` Studio Landing Canvas

- Goal: provide the first landing canvas where later panels can appear.
- Product output: landing canvas and empty content region.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-1`, `impl-2`.
- Acceptance criteria:
  - the landing canvas is visible
  - the layout can later host tasks, reports, and views
  - the slice stays shell-only
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/5-studio-landing-canvas`
- Suggested PR title: `impl-5: studio landing canvas`

### `impl-6` Empty-State Orchestration

- Goal: define what the shell does when nothing is selected or loaded.
- Product output: empty-state behavior and orientation messaging.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-1`, `impl-3`, `impl-5`.
- Acceptance criteria:
  - empty-state behavior is clear and non-blocking
  - user orientation works without runtime execution
  - later features can replace the empty state safely
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/6-empty-state-orchestration`
- Suggested PR title: `impl-6: empty-state orchestration`

### `impl-7` Local Runtime State Skeleton

- Goal: create the minimal local runtime state model for KVDOS.
- Product output: local runtime state skeleton.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-0`, `impl-4`.
- Acceptance criteria:
  - runtime state is app-local and skeletal
  - no external services are required
  - the model can support later persistence work
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/7-local-runtime-state-skeleton`
- Suggested PR title: `impl-7: local runtime state skeleton`

### `impl-8` Workspace Persistence Layer

- Goal: persist and restore app-local workspace and session state.
- Product output: persistence layer for local KVDOS state.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-7`.
- Acceptance criteria:
  - state persists locally
  - restore behavior is deterministic
  - no cloud dependency is introduced
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/8-workspace-persistence-layer`
- Suggested PR title: `impl-8: workspace persistence layer`

### `impl-9` `.kvdos` Workspace Surface

- Goal: define the local `.kvdos` workspace surface and folder conventions.
- Product output: workspace surface and local state area.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-7`, `impl-8`.
- Acceptance criteria:
  - `.kvdos` usage is explicit and app-local
  - state locations are documented and consistent
  - no repo-root state is introduced
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/9-kvdos-workspace-surface`
- Suggested PR title: `impl-9: .kvdos workspace surface`

### `impl-10` App State Validation

- Goal: validate app-local state and guard against malformed workspace data.
- Product output: state validation layer.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-8`, `impl-9`.
- Acceptance criteria:
  - malformed state is handled safely
  - validation is deterministic
  - the shell stays usable when validation fails
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/10-app-state-validation`
- Suggested PR title: `impl-10: app state validation`

### `impl-11` Discovery Questionnaires Surface

- Goal: build the first discovery/questionnaire input surface.
- Product output: discovery questionnaire UI surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-1`, `impl-5`, `impl-10`.
- Acceptance criteria:
  - questionnaire flow is visible and usable
  - the surface stays app-local
  - the questionnaire does not imply cloud or execution behavior
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/11-discovery-questionnaires-surface`
- Suggested PR title: `impl-11: discovery questionnaires surface`

### `impl-12` Spec Blueprint Surface

- Goal: render and edit a spec/blueprint derived from discovery inputs.
- Product output: blueprint/spec surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-11`.
- Acceptance criteria:
  - blueprint/spec view is available
  - derivation stays app-local
  - generation rules remain reviewable
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/12-spec-blueprint-surface`
- Suggested PR title: `impl-12: spec blueprint surface`

### `impl-13` Tasking Surface

- Goal: present a tasking surface for approved KVDOS work.
- Product output: tasking UI surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-12`.
- Acceptance criteria:
  - tasks are visible and editable in the app
  - task derivation remains app-local
  - tasking does not imply execution by itself
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/13-tasking-surface`
- Suggested PR title: `impl-13: tasking surface`

### `impl-14` Approval Surface

- Goal: add the owner approval surface for gated work.
- Product output: approval UI surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-13`.
- Acceptance criteria:
  - approval states are visible
  - approval is app-local and reviewable
  - execution is not implied
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/14-approval-surface`
- Suggested PR title: `impl-14: approval surface`

### `impl-15` Task / Approval Persistence

- Goal: persist tasks, approvals, and state transitions locally.
- Product output: local task/approval persistence.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-13`, `impl-14`.
- Acceptance criteria:
  - approvals persist deterministically
  - task history is app-local
  - persistence is safe and reviewable
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/15-task-approval-persistence`
- Suggested PR title: `impl-15: task and approval persistence`

### `impl-16` Cloud Account Shell

- Goal: add the cloud account-facing shell entry points.
- Product output: cloud account shell.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-14`, `impl-15`.
- Acceptance criteria:
  - account entry points exist
  - the shell does not implement cloud APIs yet
  - app-local state remains the source of truth
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/16-cloud-account-shell`
- Suggested PR title: `impl-16: cloud account shell`

### `impl-17` Authentication Session Flow

- Goal: implement the cloud auth/session surface.
- Product output: authentication session flow.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-16`.
- Acceptance criteria:
  - sign-in/session behavior is defined and testable
  - auth remains scoped to KVDOS v1
  - no repo-root KVDF changes are introduced
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/17-authentication-session-flow`
- Suggested PR title: `impl-17: authentication session flow`

### `impl-18` Subscription Entitlement Wiring

- Goal: connect subscription state to entitlement visibility.
- Product output: subscription entitlement wiring.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-17`.
- Acceptance criteria:
  - entitlement state is visible in the app
  - subscription status maps cleanly to features
  - no hidden cross-repo dependency appears
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/18-subscription-entitlement-wiring`
- Suggested PR title: `impl-18: subscription entitlement wiring`

### `impl-19` Device Activation Flow

- Goal: add device activation and secure entitlement caching.
- Product output: device activation flow.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-18`.
- Acceptance criteria:
  - device activation is explicit and secure
  - entitlement cache behavior is deterministic
  - the flow stays within app-local boundaries
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/19-device-activation-flow`
- Suggested PR title: `impl-19: device activation flow`

### `impl-20` Local License Gate Enforcement

- Goal: enforce local license availability and feature gating.
- Product output: local license gate enforcement.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-19`.
- Acceptance criteria:
  - local license gating is explicit
  - invalid or expired license behavior is testable
  - the gate remains app-local and reviewable
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/20-local-license-gate-enforcement`
- Suggested PR title: `impl-20: local license gate enforcement`

### `impl-21` Release Access Controls

- Goal: gate release and update access by entitlement and approval state.
- Product output: release access controls.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - execution, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-20`.
- Acceptance criteria:
  - release/download access is controlled and visible
  - access decisions are deterministic
  - the implementation stays app-local
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/21-release-access-controls`
- Suggested PR title: `impl-21: release access controls`

### `impl-22` Safety Gate Surface

- Goal: add safety checks and guardrails before execution.
- Product output: safety gate surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-21`.
- Acceptance criteria:
  - safety checks are explicit
  - the gate is reviewable and deterministic
  - no execution code is implied yet
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/22-safety-gate-surface`
- Suggested PR title: `impl-22: safety gate surface`

### `impl-23` Quality Gate Surface

- Goal: add quality checks and readiness validation before launch.
- Product output: quality gate surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-22`.
- Acceptance criteria:
  - quality checks are explicit
  - readiness logic is testable
  - no release automation is implied
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/23-quality-gate-surface`
- Suggested PR title: `impl-23: quality gate surface`

### `impl-24` Execution Approval Flow

- Goal: implement the approval step that authorizes execution.
- Product output: execution approval flow.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-23`.
- Acceptance criteria:
  - execution approval is explicit and auditable
  - no runner behavior is included yet
  - the flow is app-local and controlled
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/24-execution-approval-flow`
- Suggested PR title: `impl-24: execution approval flow`

### `impl-25` Logs / Trace / Audit Skeleton

- Goal: add a skeleton for logs, trace, and audit views.
- Product output: observability skeleton.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-24`.
- Acceptance criteria:
  - logs and trace surfaces are visible
  - audit history is app-local
  - no runtime execution behavior is implied
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/25-logs-trace-audit-skeleton`
- Suggested PR title: `impl-25: logs trace and audit skeleton`

### `impl-26` Local Runner Skeleton

- Goal: create the local runner entry point and execution boundary.
- Product output: local runner skeleton.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-25`.
- Acceptance criteria:
  - runner entry point exists
  - execution boundary is explicit
  - the runner remains controlled and app-local
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/26-local-runner-skeleton`
- Suggested PR title: `impl-26: local runner skeleton`

### `impl-27` Approved Execution Loop

- Goal: implement the approved execution path for KVDOS work.
- Product output: approved execution loop.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-26`.
- Acceptance criteria:
  - approved execution is explicit and bounded
  - execution follows approval state
  - no packaging or cloud dependence is required
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/27-approved-execution-loop`
- Suggested PR title: `impl-27: approved execution loop`

### `impl-28` Desktop Build Pipeline

- Goal: create the desktop build pipeline for distributable KVDOS output.
- Product output: desktop build pipeline.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-27`.
- Acceptance criteria:
  - build pipeline is explicit and reproducible
  - desktop output is app-local
  - no repo-root packaging dependency is introduced
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/28-desktop-build-pipeline`
- Suggested PR title: `impl-28: desktop build pipeline`

### `impl-29` Release Packaging + Update Strategy

- Goal: define the release packaging and update strategy path.
- Product output: release packaging and update strategy surface.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-28`.
- Acceptance criteria:
  - packaging and update strategy are explicit
  - release behavior is deterministic and app-local
  - the slice does not imply downstream cloud changes
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/29-release-packaging-update-strategy`
- Suggested PR title: `impl-29: release packaging and update strategy`

### `impl-30` KVDOS Adapter Boundary And V1 Hardening

- Goal: define the adapter boundary and harden v1 integration points.
- Product output: adapter boundary and hardening pass.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - supporting docs if needed
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3 areas
- Dependencies: `impl-29`.
- Acceptance criteria:
  - adapter boundary is explicit
  - v1 hardening closes known gaps
  - the implementation remains app-local
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/30-kvdos-adapter-boundary-and-v1-hardening`
- Suggested PR title: `impl-30: KVDOS adapter boundary and v1 hardening`

### `impl-31` V1 QA, Release Candidate, And Launch Handoff

- Goal: complete QA, release-candidate work, and launch handoff for KVDOS v1.
- Product output: QA/release-candidate/launch-handoff package.
- Allowed files/areas:
  - `workspaces/apps/kvdos/src/**`
  - `workspaces/apps/kvdos/tests/**`
  - `workspaces/apps/kvdos/docs/**`
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - any new unapproved core or repo-root work
- Dependencies: `impl-30`.
- Acceptance criteria:
  - v1 is testable end-to-end
  - release candidate criteria are explicit
  - launch handoff is documented and owner-approved
- Validation commands:
  - `git diff --check`
  - `npm test`
  - `npm run check`
- Suggested branch: `impl/31-v1-qa-release-candidate-launch-handoff`
- Suggested PR title: `impl-31: v1 QA release candidate and launch handoff`

## Roadmap Rules

- This document defines implementation slices only.
- Each slice requires its own branch and PR.
- Each slice requires owner approval before implementation starts.
- No implementation may skip the approved boundaries.
- No repo-root KVDF core files may be edited without a separate approved bridge
  decision.
- `.vscode/settings.json` is out of scope.

## Transition Note

This roadmap is the next stage after the Commercial Foundation Stage closeout.
The implementation work must now proceed slice by slice, with owner approval at
each gate.
