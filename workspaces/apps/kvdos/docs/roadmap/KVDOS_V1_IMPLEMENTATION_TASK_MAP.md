# KVDOS V1 Implementation Task Map

Updated: 2026-05-22

Branch: `docs/kvdos-v1-ide-studio-expanded-implementation-map`

Status: task planning only

This document maps the expanded KVDOS v1 implementation punch into concrete
task packages before any coding starts.
It keeps the roadmap app-local to `docs/` in this standalone KVDOS repository.
It does not authorize code changes by itself.
It does not touch repo-root KVDF core files or `.vscode/settings.json`.

## Product Direction Reminder

KVDOS Studio is being expanded into a workspace-based AI IDE.
The Studio must hide KVDOS internal source/product files by default, open
user folders and workspaces like an IDE, and surface workspace applications
instead of internal KVDOS files.
It must also expose terminal, AI workbench, preview, health, workspace
applications, plugin center, problems/errors, task conversion, logs, patch
review, command palette, privacy guard, and resource/activity monitoring
surfaces in later slices.

## Task Map Rules

- Each implementation evolution gets 3 concrete build tasks in this map.
- Tasks represent real build work, not planning-only placeholders.
- Each slice requires owner approval before implementation starts.
- Each slice gets its own branch and PR when execution begins.
- Repo-root KVDF core files remain out of scope unless a separate approved
  bridge decision explicitly allows them.
- `.vscode/settings.json` is out of scope.
- `impl-16` through `impl-21` and `impl-35` through `impl-40` are local
  KVDOS client or API contract slices only; they do not authorize cloud
  backend services in this roadmap.
- `impl-26` and `impl-27` must not be treated as available until
  `impl-22` through `impl-25` are complete.
- `impl-28` and `impl-29` must not be treated as available until safety,
  execution approval, logs / audit, and release access are defined.
- Must finish before next slice: yes for every slice unless explicitly
  called out otherwise.
- Owner approval gate: required for every slice.

## Default Files and Validation Baseline

Unless a slice says otherwise, the default allowed files/areas are:

- `src/**`
- `tests/**`
- `docs/**`
- other app-local support files only when explicitly approved for the slice

Unless a slice says otherwise, the default forbidden files/areas are:

- repo-root KVDF core files
- `.vscode/settings.json`
- runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas

Unless a slice says otherwise, the default validation commands are:

- `git diff --check`
- `git status --short --untracked-files=all`
- `npm test`
- `npm run check`

## Implementation Order

### `impl-0` Implementation Baseline And Guardrails

- Goal: establish implementation rules, file boundaries, and review gates.
- Product output: implementation baseline, guardrails, and slice governance.
- Work type: local KVDOS client work.
- Dependencies: none.
- Task IDs / titles / descriptions:
  - `impl-0-t1` Build implementation baseline scaffold - implement the implementation baseline surface so the slice has a concrete starting point.
  - `impl-0-t2` Wire implementation baseline flow/state - wire the implementation baseline data flow and shell integration without widening scope.
  - `impl-0-t3` Add implementation baseline tests - add tests and validation for the implementation baseline path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the implementation baseline surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-0-implementation-baseline-and-guardrails`.
- Suggested PR title: `impl-0: implementation baseline and guardrails`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-1` Local IDE Studio Shell Skeleton

- Goal: create the first Studio shell frame and landing structure.
- Product output: visible KVDOS Studio shell skeleton.
- Work type: local KVDOS client work.
- Dependencies: impl-0.
- Task IDs / titles / descriptions:
  - `impl-1-t1` Build studio shell skeleton scaffold - implement the studio shell skeleton surface so the slice has a concrete starting point.
  - `impl-1-t2` Wire studio shell skeleton flow/state - wire the studio shell skeleton data flow and shell integration without widening scope.
  - `impl-1-t3` Add studio shell skeleton tests - add tests and validation for the studio shell skeleton path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the studio shell skeleton surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-1-local-ide-studio-shell-skeleton`.
- Suggested PR title: `impl-1: local ide studio shell skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-2` Studio Navigation Scaffold

- Goal: add the primary navigation structure for Studio.
- Product output: navigation scaffold with shell-level routes and entry points.
- Work type: local KVDOS client work.
- Dependencies: impl-1.
- Task IDs / titles / descriptions:
  - `impl-2-t1` Build studio navigation scaffold scaffold - implement the studio navigation scaffold surface so the slice has a concrete starting point.
  - `impl-2-t2` Wire studio navigation scaffold flow/state - wire the studio navigation scaffold data flow and shell integration without widening scope.
  - `impl-2-t3` Add studio navigation scaffold tests - add tests and validation for the studio navigation scaffold path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the studio navigation scaffold surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-2-studio-navigation-scaffold`.
- Suggested PR title: `impl-2: studio navigation scaffold`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-3` Workspace-Based IDE Model

- Goal: define workspace-first Studio behavior and hide KVDOS internals by default.
- Product output: workspace model that opens user folders and applications.
- Work type: local KVDOS client work.
- Dependencies: impl-1,impl-2.
- Task IDs / titles / descriptions:
  - `impl-3-t1` Build workspace-based IDE model scaffold - implement the workspace-based IDE model surface so the slice has a concrete starting point.
  - `impl-3-t2` Wire workspace-based IDE model flow/state - wire the workspace-based IDE model data flow and shell integration without widening scope.
  - `impl-3-t3` Add workspace-based IDE model tests - add tests and validation for the workspace-based IDE model path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the workspace-based IDE model surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-3-workspace-based-ide-model`.
- Suggested PR title: `impl-3: workspace-based ide model`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-4` Open Folder / Open Workspace Flow

- Goal: let Studio open a user folder, app, or workspace like an IDE.
- Product output: open-workspace flow and top-level entry actions.
- Work type: local KVDOS client work.
- Dependencies: impl-3.
- Task IDs / titles / descriptions:
  - `impl-4-t1` Build open folder / open workspace flow scaffold - implement the open folder / open workspace flow surface so the slice has a concrete starting point.
  - `impl-4-t2` Wire open folder / open workspace flow flow/state - wire the open folder / open workspace flow data flow and shell integration without widening scope.
  - `impl-4-t3` Add open folder / open workspace flow tests - add tests and validation for the open folder / open workspace flow path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the open folder / open workspace flow surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-4-open-folder-open-workspace-flow`.
- Suggested PR title: `impl-4: open folder / open workspace flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-5` Recent Workspaces + Project Registry

- Goal: show recent workspaces and a registry of workspace entries.
- Product output: recent-workspaces list and registry shell surface.
- Work type: local KVDOS client work.
- Dependencies: impl-4.
- Task IDs / titles / descriptions:
  - `impl-5-t1` Build recent workspaces + project registry scaffold - implement the recent workspaces + project registry surface so the slice has a concrete starting point.
  - `impl-5-t2` Wire recent workspaces + project registry flow/state - wire the recent workspaces + project registry data flow and shell integration without widening scope.
  - `impl-5-t3` Add recent workspaces + project registry tests - add tests and validation for the recent workspaces + project registry path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the recent workspaces + project registry surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-5-recent-workspaces-project-registry`.
- Suggested PR title: `impl-5: recent workspaces + project registry`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-6` Selected Workspace Context

- Goal: keep active workspace visible and stable across navigation.
- Product output: selected-workspace context banner and state hook.
- Work type: local KVDOS client work.
- Dependencies: impl-5.
- Task IDs / titles / descriptions:
  - `impl-6-t1` Build selected workspace context scaffold - implement the selected workspace context surface so the slice has a concrete starting point.
  - `impl-6-t2` Wire selected workspace context flow/state - wire the selected workspace context data flow and shell integration without widening scope.
  - `impl-6-t3` Add selected workspace context tests - add tests and validation for the selected workspace context path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the selected workspace context surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-6-selected-workspace-context`.
- Suggested PR title: `impl-6: selected workspace context`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-7` Studio Landing Canvas

- Goal: provide a landing canvas that hosts later panels.
- Product output: main landing canvas and placeholder panel regions.
- Work type: local KVDOS client work.
- Dependencies: impl-1,impl-2,impl-6.
- Task IDs / titles / descriptions:
  - `impl-7-t1` Build studio landing canvas scaffold - implement the studio landing canvas surface so the slice has a concrete starting point.
  - `impl-7-t2` Wire studio landing canvas flow/state - wire the studio landing canvas data flow and shell integration without widening scope.
  - `impl-7-t3` Add studio landing canvas tests - add tests and validation for the studio landing canvas path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the studio landing canvas surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-7-studio-landing-canvas`.
- Suggested PR title: `impl-7: studio landing canvas`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-8` Empty-State Orchestration

- Goal: define what Studio shows when nothing is selected or loaded.
- Product output: orienting empty-state behavior and guidance.
- Work type: local KVDOS client work.
- Dependencies: impl-6,impl-7.
- Task IDs / titles / descriptions:
  - `impl-8-t1` Build empty-state orchestration scaffold - implement the empty-state orchestration surface so the slice has a concrete starting point.
  - `impl-8-t2` Wire empty-state orchestration flow/state - wire the empty-state orchestration data flow and shell integration without widening scope.
  - `impl-8-t3` Add empty-state orchestration tests - add tests and validation for the empty-state orchestration path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the empty-state orchestration surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-8-empty-state-orchestration`.
- Suggested PR title: `impl-8: empty-state orchestration`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-9` Command Palette Shell

- Goal: add the command palette entry surface for future actions.
- Product output: command palette shell and shortcut entry path.
- Work type: local KVDOS client work.
- Dependencies: impl-1,impl-2,impl-7.
- Task IDs / titles / descriptions:
  - `impl-9-t1` Build command palette shell scaffold - implement the command palette shell surface so the slice has a concrete starting point.
  - `impl-9-t2` Wire command palette shell flow/state - wire the command palette shell data flow and shell integration without widening scope.
  - `impl-9-t3` Add command palette shell tests - add tests and validation for the command palette shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the command palette shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-9-command-palette-shell`.
- Suggested PR title: `impl-9: command palette shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-10` Local Runtime State Skeleton

- Goal: create the minimal local runtime state model for KVDOS.
- Product output: local runtime state skeleton.
- Work type: local KVDOS client work.
- Dependencies: impl-0,impl-6,impl-8.
- Task IDs / titles / descriptions:
  - `impl-10-t1` Build local runtime state skeleton scaffold - implement the local runtime state skeleton surface so the slice has a concrete starting point.
  - `impl-10-t2` Wire local runtime state skeleton flow/state - wire the local runtime state skeleton data flow and shell integration without widening scope.
  - `impl-10-t3` Add local runtime state skeleton tests - add tests and validation for the local runtime state skeleton path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the local runtime state skeleton surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-10-local-runtime-state-skeleton`.
- Suggested PR title: `impl-10: local runtime state skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-11` Workspace Persistence Layer

- Goal: persist and restore app-local workspace state.
- Product output: save/load workspace and session state.
- Work type: local KVDOS client work.
- Dependencies: impl-10.
- Task IDs / titles / descriptions:
  - `impl-11-t1` Build workspace persistence layer scaffold - implement the workspace persistence layer surface so the slice has a concrete starting point.
  - `impl-11-t2` Wire workspace persistence layer flow/state - wire the workspace persistence layer data flow and shell integration without widening scope.
  - `impl-11-t3` Add workspace persistence layer tests - add tests and validation for the workspace persistence layer path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the workspace persistence layer surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-11-workspace-persistence-layer`.
- Suggested PR title: `impl-11: workspace persistence layer`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-12` .kvdos Workspace Surface

- Goal: define the local .kvdos workspace layout and folder conventions.
- Product output: .kvdos workspace surface and helpers.
- Work type: local KVDOS client work.
- Dependencies: impl-11.
- Task IDs / titles / descriptions:
  - `impl-12-t1` Build kvdos workspace surface scaffold - implement the kvdos workspace surface surface so the slice has a concrete starting point.
  - `impl-12-t2` Wire kvdos workspace surface flow/state - wire the kvdos workspace surface data flow and shell integration without widening scope.
  - `impl-12-t3` Add kvdos workspace surface tests - add tests and validation for the kvdos workspace surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the kvdos workspace surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-12-kvdos-workspace-surface`.
- Suggested PR title: `impl-12: .kvdos workspace surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-13` App State Validation

- Goal: validate workspace/app state and recover from malformed data.
- Product output: app-state validation and recovery guardrail.
- Work type: local KVDOS client work.
- Dependencies: impl-10,impl-11,impl-12.
- Task IDs / titles / descriptions:
  - `impl-13-t1` Build app state validation scaffold - implement the app state validation surface so the slice has a concrete starting point.
  - `impl-13-t2` Wire app state validation flow/state - wire the app state validation data flow and shell integration without widening scope.
  - `impl-13-t3` Add app state validation tests - add tests and validation for the app state validation path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the app state validation surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-13-app-state-validation`.
- Suggested PR title: `impl-13: app state validation`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-14` Workspace Explorer / File Surface

- Goal: show workspace files and the file navigation surface.
- Product output: workspace explorer/file surface.
- Work type: local KVDOS client work.
- Dependencies: impl-3,impl-4,impl-11.
- Task IDs / titles / descriptions:
  - `impl-14-t1` Build workspace explorer / file surface scaffold - implement the workspace explorer / file surface surface so the slice has a concrete starting point.
  - `impl-14-t2` Wire workspace explorer / file surface flow/state - wire the workspace explorer / file surface data flow and shell integration without widening scope.
  - `impl-14-t3` Add workspace explorer / file surface tests - add tests and validation for the workspace explorer / file surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the workspace explorer / file surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-14-workspace-explorer-file-surface`.
- Suggested PR title: `impl-14: workspace explorer / file surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-15` Discovery Questionnaires Surface

- Goal: capture initial discovery prompts and approved brief input.
- Product output: questionnaire surface and form flow.
- Work type: local KVDOS client work.
- Dependencies: impl-14.
- Task IDs / titles / descriptions:
  - `impl-15-t1` Build discovery questionnaires surface scaffold - implement the discovery questionnaires surface surface so the slice has a concrete starting point.
  - `impl-15-t2` Wire discovery questionnaires surface flow/state - wire the discovery questionnaires surface data flow and shell integration without widening scope.
  - `impl-15-t3` Add discovery questionnaires surface tests - add tests and validation for the discovery questionnaires surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the discovery questionnaires surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-15-discovery-questionnaires-surface`.
- Suggested PR title: `impl-15: discovery questionnaires surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-16` Spec Blueprint Surface

- Goal: turn discovery input into a spec/blueprint view.
- Product output: blueprint/spec surface and derivation view.
- Work type: local KVDOS client work.
- Dependencies: impl-15.
- Task IDs / titles / descriptions:
  - `impl-16-t1` Build spec blueprint surface scaffold - implement the spec blueprint surface surface so the slice has a concrete starting point.
  - `impl-16-t2` Wire spec blueprint surface flow/state - wire the spec blueprint surface data flow and shell integration without widening scope.
  - `impl-16-t3` Add spec blueprint surface tests - add tests and validation for the spec blueprint surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the spec blueprint surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-16-spec-blueprint-surface`.
- Suggested PR title: `impl-16: spec blueprint surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-17` Tasking Surface

- Goal: derive task punches from the approved spec/blueprint.
- Product output: tasking surface and task list model.
- Work type: API contract work.
- Dependencies: impl-16.
- Task IDs / titles / descriptions:
  - `impl-17-t1` Build tasking surface scaffold - implement the tasking surface surface so the slice has a concrete starting point.
  - `impl-17-t2` Wire tasking surface flow/state - wire the tasking surface data flow and shell integration without widening scope.
  - `impl-17-t3` Add tasking surface tests - add tests and validation for the tasking surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the tasking surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-17-tasking-surface`.
- Suggested PR title: `impl-17: tasking surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-18` Approval Surface

- Goal: review and approve task punches before execution.
- Product output: approval panel and review controls.
- Work type: local KVDOS client work.
- Dependencies: impl-17.
- Task IDs / titles / descriptions:
  - `impl-18-t1` Build approval surface scaffold - implement the approval surface surface so the slice has a concrete starting point.
  - `impl-18-t2` Wire approval surface flow/state - wire the approval surface data flow and shell integration without widening scope.
  - `impl-18-t3` Add approval surface tests - add tests and validation for the approval surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the approval surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-18-approval-surface`.
- Suggested PR title: `impl-18: approval surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-19` Task / Approval Persistence

- Goal: persist tasks, approvals, and audit history locally.
- Product output: task and approval persistence layer.
- Work type: API contract work.
- Dependencies: impl-17,impl-18.
- Task IDs / titles / descriptions:
  - `impl-19-t1` Build task / approval persistence scaffold - implement the task / approval persistence surface so the slice has a concrete starting point.
  - `impl-19-t2` Wire task / approval persistence flow/state - wire the task / approval persistence data flow and shell integration without widening scope.
  - `impl-19-t3` Add task / approval persistence tests - add tests and validation for the task / approval persistence path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the task / approval persistence surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-19-task-approval-persistence`.
- Suggested PR title: `impl-19: task / approval persistence`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-20` Reports Dashboard

- Goal: show generated reports, readiness states, and stage outputs.
- Product output: reports dashboard and summary cards.
- Work type: local KVDOS client work.
- Dependencies: impl-15,impl-19.
- Task IDs / titles / descriptions:
  - `impl-20-t1` Build reports dashboard scaffold - implement the reports dashboard surface so the slice has a concrete starting point.
  - `impl-20-t2` Wire reports dashboard flow/state - wire the reports dashboard data flow and shell integration without widening scope.
  - `impl-20-t3` Add reports dashboard tests - add tests and validation for the reports dashboard path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the reports dashboard surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-20-reports-dashboard`.
- Suggested PR title: `impl-20: reports dashboard`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-21` Terminal Panel Shell

- Goal: provide a workspace-bound terminal panel with safety gating later.
- Product output: terminal panel shell and command entry region.
- Work type: local KVDOS client work.
- Dependencies: impl-7,impl-14,impl-20.
- Task IDs / titles / descriptions:
  - `impl-21-t1` Build terminal panel shell scaffold - implement the terminal panel shell surface so the slice has a concrete starting point.
  - `impl-21-t2` Wire terminal panel shell flow/state - wire the terminal panel shell data flow and shell integration without widening scope.
  - `impl-21-t3` Add terminal panel shell tests - add tests and validation for the terminal panel shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the terminal panel shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-21-terminal-panel-shell`.
- Suggested PR title: `impl-21: terminal panel shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-22` Preview Browser / HTML Report Viewer

- Goal: preview HTML/Markdown/Mermaid reports like a browser.
- Product output: preview/report viewer panel.
- Work type: local KVDOS client work.
- Dependencies: impl-20,impl-21.
- Task IDs / titles / descriptions:
  - `impl-22-t1` Build preview browser / html report viewer scaffold - implement the preview browser / html report viewer surface so the slice has a concrete starting point.
  - `impl-22-t2` Wire preview browser / html report viewer flow/state - wire the preview browser / html report viewer data flow and shell integration without widening scope.
  - `impl-22-t3` Add preview browser / html report viewer tests - add tests and validation for the preview browser / html report viewer path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the preview browser / html report viewer surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-22-preview-browser-html-report-viewer`.
- Suggested PR title: `impl-22: preview browser / html report viewer`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-23` AI Workbench Multi-Chat Shell

- Goal: provide the multi-chat AI workbench shell.
- Product output: multi-chat AI workbench surface.
- Work type: local KVDOS client work.
- Dependencies: impl-1,impl-7,impl-20,impl-22.
- Task IDs / titles / descriptions:
  - `impl-23-t1` Build ai workbench multi-chat shell scaffold - implement the ai workbench multi-chat shell surface so the slice has a concrete starting point.
  - `impl-23-t2` Wire ai workbench multi-chat shell flow/state - wire the ai workbench multi-chat shell data flow and shell integration without widening scope.
  - `impl-23-t3` Add ai workbench multi-chat shell tests - add tests and validation for the ai workbench multi-chat shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the ai workbench multi-chat shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-23-ai-workbench-multi-chat-shell`.
- Suggested PR title: `impl-23: ai workbench multi-chat shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-24` AI Tool Session Model

- Goal: keep AI workbench sessions and tool state organized.
- Product output: AI tool session model and session flow.
- Work type: local KVDOS client work.
- Dependencies: impl-23.
- Task IDs / titles / descriptions:
  - `impl-24-t1` Build ai tool session model scaffold - implement the ai tool session model surface so the slice has a concrete starting point.
  - `impl-24-t2` Wire ai tool session model flow/state - wire the ai tool session model data flow and shell integration without widening scope.
  - `impl-24-t3` Add ai tool session model tests - add tests and validation for the ai tool session model path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the ai tool session model surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-24-ai-tool-session-model`.
- Suggested PR title: `impl-24: ai tool session model`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-25` Problems / Errors Panel

- Goal: surface captured problems and errors for the workspace.
- Product output: problems/errors panel and list view.
- Work type: local KVDOS client work.
- Dependencies: impl-14,impl-24.
- Task IDs / titles / descriptions:
  - `impl-25-t1` Build problems / errors panel scaffold - implement the problems / errors panel surface so the slice has a concrete starting point.
  - `impl-25-t2` Wire problems / errors panel flow/state - wire the problems / errors panel data flow and shell integration without widening scope.
  - `impl-25-t3` Add problems / errors panel tests - add tests and validation for the problems / errors panel path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the problems / errors panel surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-25-problems-errors-panel`.
- Suggested PR title: `impl-25: problems / errors panel`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-26` Context & Error Capture Engine

- Goal: capture programming-language context and errors.
- Product output: context/error capture engine and parsing hooks.
- Work type: local KVDOS client work.
- Dependencies: impl-14,impl-21,impl-25.
- Task IDs / titles / descriptions:
  - `impl-26-t1` Build context & error capture engine scaffold - implement the context & error capture engine surface so the slice has a concrete starting point.
  - `impl-26-t2` Wire context & error capture engine flow/state - wire the context & error capture engine data flow and shell integration without widening scope.
  - `impl-26-t3` Add context & error capture engine tests - add tests and validation for the context & error capture engine path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the context & error capture engine surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-26-context-error-capture-engine`.
- Suggested PR title: `impl-26: context & error capture engine`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-27` Error-To-Task Conversion

- Goal: convert captured errors into governed tasks.
- Product output: error-to-task conversion pipeline.
- Work type: local KVDOS client work.
- Dependencies: impl-25,impl-26.
- Task IDs / titles / descriptions:
  - `impl-27-t1` Build error-to-task conversion scaffold - implement the error-to-task conversion surface so the slice has a concrete starting point.
  - `impl-27-t2` Wire error-to-task conversion flow/state - wire the error-to-task conversion data flow and shell integration without widening scope.
  - `impl-27-t3` Add error-to-task conversion tests - add tests and validation for the error-to-task conversion path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the error-to-task conversion surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-27-error-to-task-conversion`.
- Suggested PR title: `impl-27: error-to-task conversion`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-28` Logs / Trace / Audit Viewer

- Goal: provide logs, trace, and audit views for governance.
- Product output: logs/trace/audit viewer panel.
- Work type: local KVDOS client work.
- Dependencies: impl-19,impl-24,impl-27.
- Task IDs / titles / descriptions:
  - `impl-28-t1` Build logs / trace / audit viewer scaffold - implement the logs / trace / audit viewer surface so the slice has a concrete starting point.
  - `impl-28-t2` Wire logs / trace / audit viewer flow/state - wire the logs / trace / audit viewer data flow and shell integration without widening scope.
  - `impl-28-t3` Add logs / trace / audit viewer tests - add tests and validation for the logs / trace / audit viewer path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the logs / trace / audit viewer surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-28-logs-trace-audit-viewer`.
- Suggested PR title: `impl-28: logs / trace / audit viewer`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-29` Patch / Diff Review Panel

- Goal: preview patch and diff review materials for governance.
- Product output: patch/diff review panel.
- Work type: local KVDOS client work.
- Dependencies: impl-19,impl-28.
- Task IDs / titles / descriptions:
  - `impl-29-t1` Build patch / diff review panel scaffold - implement the patch / diff review panel surface so the slice has a concrete starting point.
  - `impl-29-t2` Wire patch / diff review panel flow/state - wire the patch / diff review panel data flow and shell integration without widening scope.
  - `impl-29-t3` Add patch / diff review panel tests - add tests and validation for the patch / diff review panel path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the patch / diff review panel surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-29-patch-diff-review-panel`.
- Suggested PR title: `impl-29: patch / diff review panel`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-30` KVDOS Health Dashboard

- Goal: show the health and readiness of the KVDOS workspace.
- Product output: KVDOS health dashboard.
- Work type: local KVDOS client work.
- Dependencies: impl-20,impl-28.
- Task IDs / titles / descriptions:
  - `impl-30-t1` Build kvdos health dashboard scaffold - implement the kvdos health dashboard surface so the slice has a concrete starting point.
  - `impl-30-t2` Wire kvdos health dashboard flow/state - wire the kvdos health dashboard data flow and shell integration without widening scope.
  - `impl-30-t3` Add kvdos health dashboard tests - add tests and validation for the kvdos health dashboard path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the kvdos health dashboard surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-30-kvdos-health-dashboard`.
- Suggested PR title: `impl-30: kvdos health dashboard`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-31` Workspace Applications Dashboard

- Goal: show workspace applications instead of KVDOS internals.
- Product output: workspace applications dashboard.
- Work type: local KVDOS client work.
- Dependencies: impl-3,impl-5,impl-30.
- Task IDs / titles / descriptions:
  - `impl-31-t1` Build workspace applications dashboard scaffold - implement the workspace applications dashboard surface so the slice has a concrete starting point.
  - `impl-31-t2` Wire workspace applications dashboard flow/state - wire the workspace applications dashboard data flow and shell integration without widening scope.
  - `impl-31-t3` Add workspace applications dashboard tests - add tests and validation for the workspace applications dashboard path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the workspace applications dashboard surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-31-workspace-applications-dashboard`.
- Suggested PR title: `impl-31: workspace applications dashboard`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-32` Plugin Center Shell

- Goal: provide the plugin center shell for future extensions.
- Product output: plugin center shell and catalog entry shell.
- Work type: local KVDOS client work.
- Dependencies: impl-31.
- Task IDs / titles / descriptions:
  - `impl-32-t1` Build plugin center shell scaffold - implement the plugin center shell surface so the slice has a concrete starting point.
  - `impl-32-t2` Wire plugin center shell flow/state - wire the plugin center shell data flow and shell integration without widening scope.
  - `impl-32-t3` Add plugin center shell tests - add tests and validation for the plugin center shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the plugin center shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-32-plugin-center-shell`.
- Suggested PR title: `impl-32: plugin center shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-33` Marketplace Catalog Shell

- Goal: provide the marketplace catalog shell without backend coupling.
- Product output: marketplace catalog shell and browsing surface.
- Work type: local KVDOS client work.
- Dependencies: impl-32.
- Task IDs / titles / descriptions:
  - `impl-33-t1` Build marketplace catalog shell scaffold - implement the marketplace catalog shell surface so the slice has a concrete starting point.
  - `impl-33-t2` Wire marketplace catalog shell flow/state - wire the marketplace catalog shell data flow and shell integration without widening scope.
  - `impl-33-t3` Add marketplace catalog shell tests - add tests and validation for the marketplace catalog shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the marketplace catalog shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-33-marketplace-catalog-shell`.
- Suggested PR title: `impl-33: marketplace catalog shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-34` Plugin Safety + Permissions Boundary

- Goal: define plugin safety and permission boundaries before any plugin execution.
- Product output: plugin safety and permissions boundary.
- Work type: local KVDOS client work.
- Dependencies: impl-32,impl-33.
- Task IDs / titles / descriptions:
  - `impl-34-t1` Build plugin safety + permissions boundary scaffold - implement the plugin safety + permissions boundary surface so the slice has a concrete starting point.
  - `impl-34-t2` Wire plugin safety + permissions boundary flow/state - wire the plugin safety + permissions boundary data flow and shell integration without widening scope.
  - `impl-34-t3` Add plugin safety + permissions boundary tests - add tests and validation for the plugin safety + permissions boundary path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the plugin safety + permissions boundary surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-34-plugin-safety-permissions-boundary`.
- Suggested PR title: `impl-34: plugin safety + permissions boundary`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-35` Cloud Account Shell

- Goal: provide the cloud account shell and entry state.
- Product output: cloud account shell and account status surface.
- Work type: local KVDOS client work.
- Dependencies: impl-16,impl-21,impl-34.
- Task IDs / titles / descriptions:
  - `impl-35-t1` Build cloud account shell scaffold - implement the cloud account shell surface so the slice has a concrete starting point.
  - `impl-35-t2` Wire cloud account shell flow/state - wire the cloud account shell data flow and shell integration without widening scope.
  - `impl-35-t3` Add cloud account shell tests - add tests and validation for the cloud account shell path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the cloud account shell surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-35-cloud-account-shell`.
- Suggested PR title: `impl-35: cloud account shell`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-36` Authentication Session Flow

- Goal: define the auth session flow and state model.
- Product output: auth session flow and session state.
- Work type: API contract work.
- Dependencies: impl-35.
- Task IDs / titles / descriptions:
  - `impl-36-t1` Build authentication session flow scaffold - implement the authentication session flow surface so the slice has a concrete starting point.
  - `impl-36-t2` Wire authentication session flow flow/state - wire the authentication session flow data flow and shell integration without widening scope.
  - `impl-36-t3` Add authentication session flow tests - add tests and validation for the authentication session flow path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the authentication session flow surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-36-authentication-session-flow`.
- Suggested PR title: `impl-36: authentication session flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-37` Subscription Entitlement Wiring

- Goal: wire subscription state into entitlement visibility.
- Product output: subscription entitlement wiring.
- Work type: API contract work.
- Dependencies: impl-36.
- Task IDs / titles / descriptions:
  - `impl-37-t1` Build subscription entitlement wiring scaffold - implement the subscription entitlement wiring surface so the slice has a concrete starting point.
  - `impl-37-t2` Wire subscription entitlement wiring flow/state - wire the subscription entitlement wiring data flow and shell integration without widening scope.
  - `impl-37-t3` Add subscription entitlement wiring tests - add tests and validation for the subscription entitlement wiring path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the subscription entitlement wiring surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-37-subscription-entitlement-wiring`.
- Suggested PR title: `impl-37: subscription entitlement wiring`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-38` Device Activation Flow

- Goal: define the device activation flow and secure cache handling.
- Product output: device activation flow and cache hooks.
- Work type: API contract work.
- Dependencies: impl-37.
- Task IDs / titles / descriptions:
  - `impl-38-t1` Build device activation flow scaffold - implement the device activation flow surface so the slice has a concrete starting point.
  - `impl-38-t2` Wire device activation flow flow/state - wire the device activation flow data flow and shell integration without widening scope.
  - `impl-38-t3` Add device activation flow tests - add tests and validation for the device activation flow path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the device activation flow surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-38-device-activation-flow`.
- Suggested PR title: `impl-38: device activation flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-39` Local License Gate Enforcement

- Goal: enforce local license access and offline grace handling.
- Product output: local license gate and grace policy.
- Work type: local KVDOS client work.
- Dependencies: impl-38.
- Task IDs / titles / descriptions:
  - `impl-39-t1` Build local license gate enforcement scaffold - implement the local license gate enforcement surface so the slice has a concrete starting point.
  - `impl-39-t2` Wire local license gate enforcement flow/state - wire the local license gate enforcement data flow and shell integration without widening scope.
  - `impl-39-t3` Add local license gate enforcement tests - add tests and validation for the local license gate enforcement path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the local license gate enforcement surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-39-local-license-gate-enforcement`.
- Suggested PR title: `impl-39: local license gate enforcement`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-40` Release Access Controls

- Goal: gate release and download access by entitlement and approval.
- Product output: release access controls and gated release flow.
- Work type: local KVDOS client work.
- Dependencies: impl-39.
- Task IDs / titles / descriptions:
  - `impl-40-t1` Build release access controls scaffold - implement the release access controls surface so the slice has a concrete starting point.
  - `impl-40-t2` Wire release access controls flow/state - wire the release access controls data flow and shell integration without widening scope.
  - `impl-40-t3` Add release access controls tests - add tests and validation for the release access controls path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
  - local KVDOS client or API contract files only; no cloud backend service files.
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
  - cloud backend service implementation files.
- Acceptance criteria:
  - the release access controls surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
  - the work type is respected and does not drift into backend implementation
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-40-release-access-controls`.
- Suggested PR title: `impl-40: release access controls`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-41` Safety Gate Surface

- Goal: add the safety gate surface before execution starts.
- Product output: safety gate surface and preflight checks.
- Work type: local KVDOS client work.
- Dependencies: impl-21,impl-26,impl-34.
- Task IDs / titles / descriptions:
  - `impl-41-t1` Build safety gate surface scaffold - implement the safety gate surface surface so the slice has a concrete starting point.
  - `impl-41-t2` Wire safety gate surface flow/state - wire the safety gate surface data flow and shell integration without widening scope.
  - `impl-41-t3` Add safety gate surface tests - add tests and validation for the safety gate surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the safety gate surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-41-safety-gate-surface`.
- Suggested PR title: `impl-41: safety gate surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-42` Quality Gate Surface

- Goal: add the quality gate surface before execution or release handoff.
- Product output: quality gate surface and readiness checks.
- Work type: local KVDOS client work.
- Dependencies: impl-41.
- Task IDs / titles / descriptions:
  - `impl-42-t1` Build quality gate surface scaffold - implement the quality gate surface surface so the slice has a concrete starting point.
  - `impl-42-t2` Wire quality gate surface flow/state - wire the quality gate surface data flow and shell integration without widening scope.
  - `impl-42-t3` Add quality gate surface tests - add tests and validation for the quality gate surface path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the quality gate surface surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-42-quality-gate-surface`.
- Suggested PR title: `impl-42: quality gate surface`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-43` Execution Approval Flow

- Goal: require explicit approval before execution can start.
- Product output: execution approval flow and approval state transition.
- Work type: local KVDOS client work.
- Dependencies: impl-41,impl-42.
- Task IDs / titles / descriptions:
  - `impl-43-t1` Build execution approval flow scaffold - implement the execution approval flow surface so the slice has a concrete starting point.
  - `impl-43-t2` Wire execution approval flow flow/state - wire the execution approval flow data flow and shell integration without widening scope.
  - `impl-43-t3` Add execution approval flow tests - add tests and validation for the execution approval flow path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the execution approval flow surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-43-execution-approval-flow`.
- Suggested PR title: `impl-43: execution approval flow`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-44` Local Runner Skeleton

- Goal: create the local runner boundary without executing real work yet.
- Product output: local runner skeleton and command boundary.
- Work type: local KVDOS client work.
- Dependencies: impl-24,impl-43.
- Task IDs / titles / descriptions:
  - `impl-44-t1` Build local runner skeleton scaffold - implement the local runner skeleton surface so the slice has a concrete starting point.
  - `impl-44-t2` Wire local runner skeleton flow/state - wire the local runner skeleton data flow and shell integration without widening scope.
  - `impl-44-t3` Add local runner skeleton tests - add tests and validation for the local runner skeleton path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the local runner skeleton surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-44-local-runner-skeleton`.
- Suggested PR title: `impl-44: local runner skeleton`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-45` Approved Execution Loop

- Goal: run only approved execution through the local runner boundary.
- Product output: approved execution loop and loop state.
- Work type: local KVDOS client work.
- Dependencies: impl-44.
- Task IDs / titles / descriptions:
  - `impl-45-t1` Build approved execution loop scaffold - implement the approved execution loop surface so the slice has a concrete starting point.
  - `impl-45-t2` Wire approved execution loop flow/state - wire the approved execution loop data flow and shell integration without widening scope.
  - `impl-45-t3` Add approved execution loop tests - add tests and validation for the approved execution loop path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the approved execution loop surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-45-approved-execution-loop`.
- Suggested PR title: `impl-45: approved execution loop`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-46` Desktop Build Pipeline

- Goal: create the desktop build pipeline for KVDOS v1 distribution.
- Product output: desktop build pipeline and build outputs.
- Work type: local KVDOS client work.
- Dependencies: impl-45.
- Task IDs / titles / descriptions:
  - `impl-46-t1` Build desktop build pipeline scaffold - implement the desktop build pipeline surface so the slice has a concrete starting point.
  - `impl-46-t2` Wire desktop build pipeline flow/state - wire the desktop build pipeline data flow and shell integration without widening scope.
  - `impl-46-t3` Add desktop build pipeline tests - add tests and validation for the desktop build pipeline path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the desktop build pipeline surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-46-desktop-build-pipeline`.
- Suggested PR title: `impl-46: desktop build pipeline`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-47` Release Packaging + Update Strategy

- Goal: package releases and define updater behavior for delivery.
- Product output: release packaging and update strategy surface.
- Work type: local KVDOS client work.
- Dependencies: impl-46.
- Task IDs / titles / descriptions:
  - `impl-47-t1` Build release packaging + update strategy scaffold - implement the release packaging + update strategy surface so the slice has a concrete starting point.
  - `impl-47-t2` Wire release packaging + update strategy flow/state - wire the release packaging + update strategy data flow and shell integration without widening scope.
  - `impl-47-t3` Add release packaging + update strategy tests - add tests and validation for the release packaging + update strategy path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the release packaging + update strategy surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-47-release-packaging-update-strategy`.
- Suggested PR title: `impl-47: release packaging + update strategy`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-48` KVDOS Adapter Boundary And V1 Hardening

- Goal: define the adapter boundary and harden the v1 handoff.
- Product output: adapter boundary and hardening checks.
- Work type: local KVDOS client work.
- Dependencies: impl-30,impl-45,impl-47.
- Task IDs / titles / descriptions:
  - `impl-48-t1` Build kvdos adapter boundary and v1 hardening scaffold - implement the kvdos adapter boundary and v1 hardening surface so the slice has a concrete starting point.
  - `impl-48-t2` Wire kvdos adapter boundary and v1 hardening flow/state - wire the kvdos adapter boundary and v1 hardening data flow and shell integration without widening scope.
  - `impl-48-t3` Add kvdos adapter boundary and v1 hardening tests - add tests and validation for the kvdos adapter boundary and v1 hardening path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the kvdos adapter boundary and v1 hardening surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-48-kvdos-adapter-boundary-and-v1-hardening`.
- Suggested PR title: `impl-48: kvdos adapter boundary and v1 hardening`.
- Must finish before next slice: yes.
- Owner approval gate: required.

### `impl-49` V1 QA, Release Candidate, And Launch Handoff

- Goal: finish QA and launch handoff for KVDOS v1.
- Product output: QA, release candidate, and launch handoff artifacts.
- Work type: local KVDOS client work.
- Dependencies: impl-48,impl-47.
- Task IDs / titles / descriptions:
  - `impl-49-t1` Build v1 qa, release candidate, and launch handoff scaffold - implement the v1 qa, release candidate, and launch handoff surface so the slice has a concrete starting point.
  - `impl-49-t2` Wire v1 qa, release candidate, and launch handoff flow/state - wire the v1 qa, release candidate, and launch handoff data flow and shell integration without widening scope.
  - `impl-49-t3` Add v1 qa, release candidate, and launch handoff tests - add tests and validation for the v1 qa, release candidate, and launch handoff path.
- Allowed files/areas:
  - `src/**`
  - `tests/**`
  - `docs/**`
  - other app-local support files only when explicitly approved for the slice
- Forbidden files/areas:
  - repo-root KVDF core files
  - `.vscode/settings.json`
  - runtime, SQLite, cloud API/backend, execution, packaging, bridge, marketplace, enterprise, and Web3 areas
- Acceptance criteria:
  - the v1 qa, release candidate, and launch handoff surface is visible and usable in Studio
  - the slice stays app-local and avoids forbidden systems
  - later slices can build on this work without rewriting the boundary
- Validation commands:
  - `git diff --check`
  - `git status --short --untracked-files=all`
  - `npm test`
  - `npm run check`
- Suggested branch name: `impl/impl-49-v1-qa-release-candidate-and-launch-handoff`.
- Suggested PR title: `impl-49: v1 qa, release candidate, and launch handoff`.
- Must finish before next slice: yes.
- Owner approval gate: required.
