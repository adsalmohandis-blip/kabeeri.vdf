# KVDOS V1 Implementation Task Map

Updated: 2026-05-22

Branch: `tasks/kvdos-v1-implementation-task-map`

Status: task planning only

This document maps the approved KVDOS v1 implementation punch into concrete
task packages before any coding starts.
It stays app-local to `workspaces/apps/kvdos/`.
It does not authorize code changes by itself.

## Task Map Rules

- Each implementation evolution gets 3 to 8 concrete tasks.
- Tasks represent real build work, not planning-only placeholders.
- Each slice requires owner approval before implementation starts.
- Each slice gets its own branch and PR when execution begins.
- Repo-root KVDF core files remain out of scope unless a separate approved
  bridge decision explicitly allows them.
- `.vscode/settings.json` is out of scope.
- `impl-16` through `impl-21` must explicitly state whether the work is local
  KVDOS client work, API contract work, or cloud backend work.
- `impl-26` and `impl-27` must not be treated as available until
  `impl-22` through `impl-25` are complete.
- `impl-28` and `impl-29` must not be treated as available until safety,
  execution approval, logs / audit, and release access are defined.

## `impl-0` Implementation Baseline And Guardrails

- Goal: establish implementation rules, file boundaries, and review gates.
- Product output: baseline guardrails and slice governance.
- Dependencies: none.
- Task IDs / titles / descriptions:
  - `impl-0-t1` Create implementation baseline module - add a shared guardrail
    module that records slice rules and boundary checks.
  - `impl-0-t2` Add branch / PR discipline checks - wire reusable checks that
    enforce per-slice branch and PR expectations.
  - `impl-0-t3` Add implementation smoke validation - add generic validation
    coverage for the first implementation slice and later slices.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  `workspaces/apps/kvdos/docs/**`, and other app-local support files when
  explicitly approved for the slice.
- Forbidden files/areas: repo-root KVDF core files, `workspaces/apps/kvdos/.kabeeri/**`,
  `.vscode/settings.json`, runtime, SQLite, cloud API, execution, packaging,
  bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: guardrails are explicit; file boundaries are explicit;
  later slices can reuse the baseline without widening scope.
- Validation commands: `git diff --check`; `git status --short --untracked-files=all`;
  `npm test`; `npm run check`.
- Suggested branch name: `impl/0-baseline-and-guardrails`.
- Suggested PR title: `impl-0: implementation baseline and guardrails`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-1` Local IDE Studio Shell Skeleton

- Goal: create the initial Studio shell frame and landing structure.
- Product output: visible KVDOS Studio shell skeleton.
- Dependencies: `impl-0`.
- Task IDs / titles / descriptions:
  - `impl-1-t1` Create shell frame component - build the outer Studio frame and
    top-level layout container.
  - `impl-1-t2` Wire shell navigation chrome - add the shell-level navigation
    scaffold and primary entry points.
  - `impl-1-t3` Add shell render tests - verify the shell loads stably and shows
    a usable first screen.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting `workspaces/apps/kvdos/docs/**` updates if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, runtime, SQLite, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: Studio shell renders as a stable app surface; the first
  screen is usable; no cloud or runtime behavior is required to orient the user.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/1-studio-shell-skeleton`.
- Suggested PR title: `impl-1: local IDE studio shell skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-2` Studio Navigation Scaffold

- Goal: add the primary navigation structure for Studio.
- Product output: navigation scaffold with shell-level routes and entry points.
- Dependencies: `impl-1`.
- Task IDs / titles / descriptions:
  - `impl-2-t1` Add navigation route model - define the shell-level route map and
    entry-point structure.
  - `impl-2-t2` Wire navigation state - connect navigation selection to the shell
    so routes remain stable.
  - `impl-2-t3` Add navigation tests - verify navigation renders and changes state
    without relying on cloud or runtime features.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: navigation is visible and stable; shell navigation does
  not imply runtime or cloud behavior; later screens can be mounted without
  rewrites.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/2-studio-navigation-scaffold`.
- Suggested PR title: `impl-2: studio navigation scaffold`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-3` Project Registry Selector

- Goal: let Studio show projects and select the active workspace/project.
- Product output: project registry selector in the shell.
- Dependencies: `impl-2`.
- Task IDs / titles / descriptions:
  - `impl-3-t1` Build project registry list - show available projects and their
    selectable rows.
  - `impl-3-t2` Wire project selection state - store and expose the active
    project selection in the shell.
  - `impl-3-t3` Add project selector tests - verify project listing and selection
    work without cloud or runtime dependencies.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: projects can be listed and selected; the active project
  is visible in the shell; the selector stays app-local.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/3-project-registry-selector`.
- Suggested PR title: `impl-3: project registry selector`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-4` Selected Project Context

- Goal: keep the selected project visible and persistent in the shell.
- Product output: selected-project context display and persistence hooks.
- Dependencies: `impl-3`.
- Task IDs / titles / descriptions:
  - `impl-4-t1` Build selected-project context banner - show the active project
    in a persistent shell location.
  - `impl-4-t2` Wire context propagation - make the selected project available to
    later Studio surfaces.
  - `impl-4-t3` Add context persistence tests - verify the active selection
    survives navigation and reload flows.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: current project context is always visible; changing
  context does not require cloud or runtime work; state remains app-local.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/4-selected-project-context`.
- Suggested PR title: `impl-4: selected project context`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-5` Studio Landing Canvas

- Goal: provide the first landing canvas where later panels can appear.
- Product output: landing canvas and empty content region.
- Dependencies: `impl-1`, `impl-2`, `impl-4`.
- Task IDs / titles / descriptions:
  - `impl-5-t1` Build landing canvas layout - add the main canvas region for
    Studio content.
  - `impl-5-t2` Add panel slot system - create stable placeholder regions for
    future tasks, reports, and views.
  - `impl-5-t3` Add layout tests - verify the landing canvas stays stable across
    shell states.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: the landing canvas is visible; the layout can later host
  tasks, reports, and views; the slice stays shell-only.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/5-studio-landing-canvas`.
- Suggested PR title: `impl-5: studio landing canvas`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-6` Empty-State Orchestration

- Goal: define what the shell does when nothing is selected or loaded.
- Product output: empty-state behavior and orientation messaging.
- Dependencies: `impl-1`, `impl-4`, `impl-5`.
- Task IDs / titles / descriptions:
  - `impl-6-t1` Build empty-state component - show the shell when no project or
    data is loaded.
  - `impl-6-t2` Add empty-state decision helper - centralize when the shell
    should show guidance versus content.
  - `impl-6-t3` Add empty-state tests - verify the shell remains usable and
    orienting in empty states.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: empty-state behavior is clear and non-blocking; user
  orientation works without runtime execution; later features can replace the
  empty state safely.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/6-empty-state-orchestration`.
- Suggested PR title: `impl-6: empty-state orchestration`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-7` Local Runtime State Skeleton

- Goal: create the minimal local runtime state model for KVDOS.
- Product output: local runtime state skeleton.
- Dependencies: `impl-0`, `impl-4`, `impl-6`.
- Task IDs / titles / descriptions:
  - `impl-7-t1` Define runtime state model - create the minimal local state shape
    for KVDOS.
  - `impl-7-t2` Wire state store/reducer - connect shell data flow to the runtime
    state skeleton.
  - `impl-7-t3` Add runtime state tests - verify the state model stays app-local
    and deterministic.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: runtime state is app-local and skeletal; no external
  services are required; the model can support later persistence work.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/7-local-runtime-state-skeleton`.
- Suggested PR title: `impl-7: local runtime state skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-8` Workspace Persistence Layer

- Goal: persist and restore app-local workspace and session state.
- Product output: persistence layer for local KVDOS state.
- Dependencies: `impl-7`.
- Task IDs / titles / descriptions:
  - `impl-8-t1` Build persistence service - add save/load services for local
    workspace and session state.
  - `impl-8-t2` Wire restore flow - restore the app-local state on startup.
  - `impl-8-t3` Add persistence tests - verify state survives reloads and stays
    deterministic.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: state persists locally; restore behavior is deterministic;
  no cloud dependency is introduced.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/8-workspace-persistence-layer`.
- Suggested PR title: `impl-8: workspace persistence layer`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-9` `.kvdos` Workspace Surface

- Goal: define the local `.kvdos` workspace surface and folder conventions.
- Product output: workspace surface and local state area.
- Dependencies: `impl-7`, `impl-8`.
- Task IDs / titles / descriptions:
  - `impl-9-t1` Add workspace path helpers - define local `.kvdos` path
    resolution and folder conventions.
  - `impl-9-t2` Build workspace metadata writer - store workspace metadata in the
    local app surface.
  - `impl-9-t3` Add workspace surface tests - verify `.kvdos` usage stays
    app-local and stable.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: `.kvdos` usage is explicit and app-local; state locations
  are documented and consistent; no repo-root state is introduced.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/9-kvdos-workspace-surface`.
- Suggested PR title: `impl-9: .kvdos workspace surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-10` App State Validation

- Goal: validate app-local state and guard against malformed workspace data.
- Product output: state validation layer.
- Dependencies: `impl-8`, `impl-9`.
- Task IDs / titles / descriptions:
  - `impl-10-t1` Build validation function - add deterministic validation for
    workspace and runtime state.
  - `impl-10-t2` Add malformed-state recovery - make the shell recover cleanly
    from invalid local data.
  - `impl-10-t3` Add validation tests - verify malformed state is handled safely
    and without cloud dependency.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: malformed state is handled safely; validation is
  deterministic; the shell stays usable when validation fails.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/10-app-state-validation`.
- Suggested PR title: `impl-10: app state validation`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-11` Discovery Questionnaires Surface

- Goal: build the first discovery/questionnaire input surface.
- Product output: discovery questionnaire UI surface.
- Dependencies: `impl-5`, `impl-10`.
- Task IDs / titles / descriptions:
  - `impl-11-t1` Build questionnaire form shell - create the first discovery
    questionnaire surface.
  - `impl-11-t2` Wire question rendering - render questions from local schema or
    model data.
  - `impl-11-t3` Add questionnaire tests - verify the questionnaire flow stays
    app-local and usable.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  runtime, SQLite, cloud, execution, packaging, bridge, marketplace, enterprise,
  Web3 areas.
- Acceptance criteria: questionnaire flow is visible and usable; the surface
  stays app-local; the questionnaire does not imply cloud or execution behavior.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/11-discovery-questionnaires-surface`.
- Suggested PR title: `impl-11: discovery questionnaires surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-12` Spec Blueprint Surface

- Goal: render and edit a spec/blueprint derived from discovery inputs.
- Product output: blueprint/spec surface.
- Dependencies: `impl-11`.
- Task IDs / titles / descriptions:
  - `impl-12-t1` Build blueprint view - render the spec/blueprint surface from
    local discovery inputs.
  - `impl-12-t2` Wire blueprint derivation - derive editable blueprint data from
    the questionnaire model.
  - `impl-12-t3` Add blueprint tests - verify derivation stays local and
    reviewable.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: blueprint/spec view is available; derivation stays
  app-local; generation rules remain reviewable.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/12-spec-blueprint-surface`.
- Suggested PR title: `impl-12: spec blueprint surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-13` Tasking Surface

- Goal: present a tasking surface for approved KVDOS work.
- Product output: tasking UI surface and the first half of the task/readiness
  dashboard.
- Dependencies: `impl-12`.
- Task IDs / titles / descriptions:
  - `impl-13-t1` Build task list surface - show the derived implementation tasks
    in the shell.
  - `impl-13-t2` Wire task derivation pipeline - turn approved blueprint/spec data
    into task-ready entries.
  - `impl-13-t3` Add tasking tests - verify task derivation and rendering stay
    app-local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: tasks are visible and editable in the app; task derivation
  remains app-local; tasking does not imply execution by itself.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/13-tasking-surface`.
- Suggested PR title: `impl-13: tasking surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-14` Approval Surface

- Goal: add the owner approval surface for gated work.
- Product output: approval UI surface and the second half of the task/readiness
  dashboard.
- Dependencies: `impl-13`.
- Task IDs / titles / descriptions:
  - `impl-14-t1` Build approval panel - add the owner approval review surface.
  - `impl-14-t2` Wire approval state transitions - connect approval actions to the
    task model.
  - `impl-14-t3` Add approval tests - verify approval states and review actions
    stay deterministic.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: approval states are visible; approval is app-local and
  reviewable; execution is not implied.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/14-approval-surface`.
- Suggested PR title: `impl-14: approval surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-15` Task / Approval Persistence

- Goal: persist tasks, approvals, and state transitions locally.
- Product output: local task/approval persistence for the task/readiness
  dashboard.
- Dependencies: `impl-13`, `impl-14`.
- Task IDs / titles / descriptions:
  - `impl-15-t1` Add persistence for task records - store task and approval
    records locally.
  - `impl-15-t2` Wire history and audit records - persist transitions for later
    review.
  - `impl-15-t3` Add persistence tests - verify task/approval state survives
    reloads and remains local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, Web3
  areas.
- Acceptance criteria: approvals persist deterministically; task history is
  app-local; persistence is safe and reviewable.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/15-task-approval-persistence`.
- Suggested PR title: `impl-15: task and approval persistence`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-16` Cloud Account Shell

- Goal: add the cloud account-facing shell entry points.
- Product output: cloud account shell.
- Implementation role: local KVDOS client work.
- Dependencies: `impl-15`.
- Task IDs / titles / descriptions:
  - `impl-16-t1` Build cloud account shell - add the account-facing container and
    entry points.
  - `impl-16-t2` Wire account status model - show cloud account status without
    implementing APIs yet.
  - `impl-16-t3` Add account shell tests - verify the cloud-facing shell remains
    app-local and bounded.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: account entry points exist; the shell does not implement
  cloud APIs yet; app-local state remains the source of truth.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/16-cloud-account-shell`.
- Suggested PR title: `impl-16: cloud account shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-17` Authentication Session Flow

- Goal: implement the cloud auth/session surface.
- Product output: authentication session flow.
- Implementation role: API contract work.
- Dependencies: `impl-16`.
- Task IDs / titles / descriptions:
  - `impl-17-t1` Build sign-in/session flow - add the first cloud authentication
    session entry.
  - `impl-17-t2` Wire session storage - keep authenticated session state in the
    app-local model.
  - `impl-17-t3` Add auth session tests - verify sign-in and session handling are
    deterministic.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: sign-in/session behavior is defined and testable; auth
  remains scoped to KVDOS v1; no repo-root KVDF changes are introduced.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/17-authentication-session-flow`.
- Suggested PR title: `impl-17: authentication session flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-18` Subscription Entitlement Wiring

- Goal: connect subscription state to entitlement visibility.
- Product output: subscription entitlement wiring.
- Implementation role: API contract work.
- Dependencies: `impl-17`.
- Task IDs / titles / descriptions:
  - `impl-18-t1` Build entitlement model wiring - map subscription state to
    feature visibility.
  - `impl-18-t2` Wire entitlement refresh - keep entitlement state synchronized in
    the app.
  - `impl-18-t3` Add entitlement tests - verify subscription-to-feature mapping is
    predictable and local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: entitlement state is visible in the app; subscription
  status maps cleanly to features; no hidden cross-repo dependency appears.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/18-subscription-entitlement-wiring`.
- Suggested PR title: `impl-18: subscription entitlement wiring`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-19` Device Activation Flow

- Goal: add device activation and secure entitlement caching.
- Product output: device activation flow.
- Implementation role: local KVDOS client work.
- Dependencies: `impl-18`.
- Task IDs / titles / descriptions:
  - `impl-19-t1` Build device activation flow - add the first activation path and
    state model.
  - `impl-19-t2` Wire secure entitlement cache - store activation/entitlement
    data safely in the app-local model.
  - `impl-19-t3` Add activation tests - verify activation and cache behavior are
    deterministic and secure.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: device activation is explicit and secure; entitlement
  cache behavior is deterministic; the flow stays within app-local boundaries.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/19-device-activation-flow`.
- Suggested PR title: `impl-19: device activation flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-20` Local License Gate Enforcement

- Goal: enforce local license availability and feature gating.
- Product output: local license gate enforcement.
- Implementation role: local KVDOS client work.
- Dependencies: `impl-19`.
- Task IDs / titles / descriptions:
  - `impl-20-t1` Build local license gate - add the enforcement layer that checks
    local license state before gated features render.
  - `impl-20-t2` Wire invalid/expired license UX - display clear local UI states
    for invalid and expired licenses.
  - `impl-20-t3` Add license gate tests - verify license gating and offline grace
    behavior remain app-local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  execution, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: local license gating is explicit; invalid or expired
  license behavior is testable; the gate remains app-local and reviewable.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/20-local-license-gate-enforcement`.
- Suggested PR title: `impl-20: local license gate enforcement`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-21` Release Access Controls

- Goal: gate release and update access by entitlement and approval state.
- Product output: release access controls.
- Implementation role: API contract work.
- Dependencies: `impl-20`.
- Task IDs / titles / descriptions:
  - `impl-21-t1` Build release access control surface - gate release and update
    access in the app shell.
  - `impl-21-t2` Wire entitlement-linked release checks - connect access decisions
    to the commercial state model.
  - `impl-21-t3` Add release access tests - verify release/download gating stays
    deterministic and local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  execution, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: release/download access is controlled and visible; access
  decisions are deterministic; the implementation stays app-local.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/21-release-access-controls`.
- Suggested PR title: `impl-21: release access controls`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-22` Safety Gate Surface

- Goal: add safety checks and guardrails before execution.
- Product output: safety gate surface.
- Dependencies: `impl-21`.
- Task IDs / titles / descriptions:
  - `impl-22-t1` Build safety gate surface - add the safety check UI and control
    flow.
  - `impl-22-t2` Wire safety check pipeline - connect gate decisions to task and
    approval state.
  - `impl-22-t3` Add safety tests - verify guardrails stay explicit and
    deterministic.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3
  areas.
- Acceptance criteria: safety checks are explicit; the gate is reviewable and
  deterministic; no execution code is implied yet.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/22-safety-gate-surface`.
- Suggested PR title: `impl-22: safety gate surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-23` Quality Gate Surface

- Goal: add quality checks and readiness validation before launch.
- Product output: quality gate surface.
- Dependencies: `impl-22`.
- Task IDs / titles / descriptions:
  - `impl-23-t1` Build quality gate surface - add the readiness and quality check
    UI/control flow.
  - `impl-23-t2` Wire quality readiness logic - connect readiness checks to the
    shell state model.
  - `impl-23-t3` Add quality tests - verify readiness logic is deterministic and
    local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3
  areas.
- Acceptance criteria: quality checks are explicit; readiness logic is testable;
  no release automation is implied.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/23-quality-gate-surface`.
- Suggested PR title: `impl-23: quality gate surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-24` Execution Approval Flow

- Goal: implement the approval step that authorizes execution.
- Product output: execution approval flow.
- Dependencies: `impl-23`.
- Task IDs / titles / descriptions:
  - `impl-24-t1` Build execution approval flow - add the explicit execution
    authorization step.
  - `impl-24-t2` Wire approval-to-execution state - connect approval decisions to
    the execution-ready model.
  - `impl-24-t3` Add execution approval tests - verify execution approval remains
    auditable and local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: execution approval is explicit and auditable; no runner
  behavior is included yet; the flow is app-local and controlled.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/24-execution-approval-flow`.
- Suggested PR title: `impl-24: execution approval flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-25` Logs / Trace / Audit Skeleton

- Goal: add a skeleton for logs, trace, audit, and review-friendly views.
- Product output: observability and review skeleton.
- Dependencies: `impl-24`.
- Task IDs / titles / descriptions:
  - `impl-25-t1` Build logs and trace skeleton - add the visible logs/trace
    surface.
  - `impl-25-t2` Add audit history model - keep review data app-local and
    renderable.
  - `impl-25-t3` Add review skeleton tests - verify the observability surfaces
    stay predictable.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, bridge, marketplace, enterprise, and Web3
  areas.
- Acceptance criteria: logs and trace surfaces are visible; audit history is
  app-local; no runtime execution behavior is implied.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/25-logs-trace-audit-skeleton`.
- Suggested PR title: `impl-25: logs trace and audit skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-26` Local Runner Skeleton

- Goal: create the local runner entry point and execution boundary.
- Product output: local runner skeleton.
- Dependencies: `impl-22`, `impl-23`, `impl-24`, `impl-25`.
- Task IDs / titles / descriptions:
  - `impl-26-t1` Build runner entry module - create the local runner entry and
    wiring surface.
  - `impl-26-t2` Wire execution boundary - connect the runner to the approved
    execution state model.
  - `impl-26-t3` Add runner smoke tests - verify the runner skeleton remains
    controlled and app-local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: runner entry point exists; execution boundary is explicit;
  the runner remains controlled and app-local.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/26-local-runner-skeleton`.
- Suggested PR title: `impl-26: local runner skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-27` Approved Execution Loop

- Goal: implement the approved execution path for KVDOS work.
- Product output: approved execution loop.
- Dependencies: `impl-22`, `impl-23`, `impl-24`, `impl-25`, `impl-26`.
- Task IDs / titles / descriptions:
  - `impl-27-t1` Build approved execution loop - wire the execution path that only
    runs after approval.
  - `impl-27-t2` Add execution command flow - connect the approved execution loop
    to the runner entry point.
  - `impl-27-t3` Add execution loop tests - verify approved execution remains
    deterministic and local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, packaging, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: approved execution is explicit and bounded; execution
  follows approval state; no packaging or cloud dependence is required.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/27-approved-execution-loop`.
- Suggested PR title: `impl-27: approved execution loop`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-28` Desktop Build Pipeline

- Goal: create the desktop build pipeline for distributable KVDOS output.
- Product output: desktop build pipeline.
- Dependencies: `impl-21`, `impl-22`, `impl-23`, `impl-24`, `impl-25`, `impl-26`,
  `impl-27`.
- Task IDs / titles / descriptions:
  - `impl-28-t1` Build desktop pipeline config - add the build workflow and
    packaging inputs.
  - `impl-28-t2` Wire build outputs - generate the desktop build artifacts from
    app-local sources.
  - `impl-28-t3` Add build pipeline tests - verify the desktop build path is
    reproducible.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: build pipeline is explicit and reproducible; desktop
  output is app-local; no repo-root packaging dependency is introduced.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/28-desktop-build-pipeline`.
- Suggested PR title: `impl-28: desktop build pipeline`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-29` Release Packaging + Update Strategy

- Goal: define the release packaging and update strategy path.
- Product output: release packaging and update strategy surface.
- Dependencies: `impl-21`, `impl-22`, `impl-23`, `impl-24`, `impl-25`, `impl-26`,
  `impl-27`, `impl-28`.
- Task IDs / titles / descriptions:
  - `impl-29-t1` Build release packaging workflow - add the release artifact
    packaging path.
  - `impl-29-t2` Add update strategy wiring - connect the packaging path to update
    strategy decisions.
  - `impl-29-t3` Add packaging/update tests - verify release behavior remains
    deterministic and app-local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, bridge, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: packaging and update strategy are explicit; release
  behavior is deterministic and app-local; the slice does not imply downstream
  cloud changes.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/29-release-packaging-update-strategy`.
- Suggested PR title: `impl-29: release packaging and update strategy`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-30` KVDOS Adapter Boundary And V1 Hardening

- Goal: define the adapter boundary and harden v1 integration points without
  implementing bridge logic.
- Product output: adapter boundary contract and hardening pass.
- Dependencies: `impl-29`.
- Task IDs / titles / descriptions:
  - `impl-30-t1` Define adapter boundary module - codify the KVDOS-to-KVDF
    adapter contract at the app boundary.
  - `impl-30-t2` Wire hardening checks - add the checks that keep the adapter
    boundary stable and reviewable.
  - `impl-30-t3` Add adapter boundary tests - verify no bridge logic or
    controlled-upgrade behavior leaks into the slice.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  and supporting docs if needed.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  cloud, SQLite, execution, packaging, marketplace, enterprise, and Web3 areas.
- Acceptance criteria: adapter boundary is explicit; v1 hardening closes known
  gaps; the implementation remains app-local; no bridge logic or controlled-
  upgrade behavior is implemented.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/30-kvdos-adapter-boundary-and-v1-hardening`.
- Suggested PR title: `impl-30: KVDOS adapter boundary and v1 hardening`.
- Must finish before next slice: yes.
- Owner approval gate: required.

## `impl-31` V1 QA, Release Candidate, And Launch Handoff

- Goal: complete QA, release-candidate work, and launch handoff for KVDOS v1.
- Product output: QA/release-candidate/launch-handoff package.
- Dependencies: `impl-30`.
- Task IDs / titles / descriptions:
  - `impl-31-t1` Build v1 QA suite - add the end-to-end checks that prove the
    release is ready.
  - `impl-31-t2` Build release candidate handoff - prepare the release-candidate
    report and launch checklist.
  - `impl-31-t3` Add launch verification tests - verify the final handoff stays
    owner-approved and app-local.
- Allowed files/areas: `workspaces/apps/kvdos/src/**`, `workspaces/apps/kvdos/tests/**`,
  `workspaces/apps/kvdos/docs/**`.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  any new unapproved core or repo-root work.
- Acceptance criteria: v1 is testable end-to-end; release candidate criteria are
  explicit; launch handoff is documented and owner-approved; the handoff clearly
  separates launch work from any later bridge evolution.
- Validation commands: `git diff --check`; `npm test`; `npm run check`.
- Suggested branch name: `impl/31-v1-qa-release-candidate-launch-handoff`.
- Suggested PR title: `impl-31: v1 QA release candidate and launch handoff`.
- Must finish before next slice: no (final v1 slice).
- Owner approval gate: required.

## Post-V1 Bridge And Later Evolution

This section is intentionally separate from the KVDOS v1 punch.
It exists so the future bridge/later-evolution path is visible, but it does not
change the fact that `impl-31` is the final KVDOS v1 slice.

- Goal: define the post-v1 bridge and later-evolution work that comes after the
  v1 launch handoff.
- Product output: future bridge boundary and later-evolution roadmap.
- Dependencies: `impl-31`; owner-approved v1 launch handoff complete.
- Task IDs / titles / descriptions:
  - `post-v1-t1` Define KVDF bridge boundary - codify how KVDOS maps to KVDF
    after v1 ships.
  - `post-v1-t2` Define controlled-upgrade boundary - describe later migration
    and upgrade rules without implementing them yet.
  - `post-v1-t3` Define ecosystem expansion boundary - frame plugin/package
    registry, cloud runner, marketplace, enterprise, and Web3 separation rules.
  - `post-v1-t4` Add future-track hardening review - verify the later-evolution
    boundary stays distinct from the v1 implementation punch.
- Allowed files/areas: `workspaces/apps/kvdos/docs/**` for planning; later
  implementation would still require app-local branches and PRs before any code.
- Forbidden files/areas: repo-root KVDF core files, `.vscode/settings.json`, and
  any implementation code until a separately approved later-stage plan exists.
- Acceptance criteria: the post-v1 bridge path is explicit; later-evolution
  boundaries are separated from v1; no code implementation is implied here.
- Validation commands: `git diff --check`; `git status --short --untracked-files=all`.
- Suggested branch name: `docs/post-v1-bridge-and-later-evolution`.
- Suggested PR title: `docs: define post-v1 bridge and later evolution`.
- Must finish before next slice: no (this is a post-v1 future-track section).
- Owner approval gate: required.

## Roadmap Rules

- This document defines implementation slices only.
- Each slice requires its own branch and PR.
- Each slice requires owner approval before implementation starts.
- No implementation may skip the approved boundaries.
- No repo-root KVDF core files may be edited without a separate approved bridge
  decision.
- `.vscode/settings.json` is out of scope.
- The implementation punch is the execution form of the closed foundation stage;
  it does not reopen planning/readiness work.

## Transition Note

This task map is the bridge from the closed Commercial Foundation planning stage
to the real KVDOS v1 implementation stage.
It makes the full v1 build visible before coding starts while keeping the work
app-local and owner-approved.
