# KVDF Workspace Boundary Implementation Checklist

Updated: 2026-05-15

This checklist turns the workspace boundary spec into concrete implementation
work for both the Kabeeri core track and the vibe app-developer track.

## Purpose

The workspace boundary is the governed line that decides:

- what belongs inside a Kabeeri workspace
- what can be linked to a workspace
- what must be blocked
- what needs re-review when scope changes

The rule is simple:

- if the work should be tracked, resumed, validated, and handed off, it
  belongs in a governed workspace
- if it belongs to another product, it should not be mixed into the current
  workspace

## Current Implementation Status

### Already in place

- [x] app workspaces live under `workspaces/apps/<slug>/`
- [x] local `.kabeeri/` state exists for app workspaces
- [x] app workspace contract validation exists
- [x] app workspace validation command exists
- [x] workspace validation checks app workspace contracts
- [x] `surface_scopes` are stored in app workspace metadata
- [x] workspace help/docs mention the strict app workspace contract
- [x] runtime boundary classifier exists for allowed, linked, and blocked paths
- [x] app workspace list/show surfaces expose boundary status
- [x] boundary classifier is covered by tests

### Still needs hard boundary enforcement

- [ ] reject cross-product files placed inside the active workspace
- [ ] reject implementation work that is outside the approved workspace scope
- [ ] require explicit review when a workspace gains a new surface scope
- [x] show boundary status in the app workspace dashboard
- [x] add dashboard widgets for boundary status and scope risks
- [x] add tests for dashboard boundary presentation

## Boundary Model

### Allowed

These belong inside the active workspace and are fully governed by Kabeeri:

- app source code
- app tests
- app docs
- app package files
- local `.kabeeri/` state
- planning pack artifacts
- scorecards
- tasks
- validation outputs
- handoff and release artifacts
- surface-scoped work for website, mobile, admin, API, backend, or worker
  when those belong to the same product

### Linked

These can exist outside the app root, but only if they are explicitly connected
to the workspace:

- shared backend or shared services when they are intentionally part of the
  same product
- external design references used in planning
- GitHub issues or PRs connected to the workspace
- installed plugins or bundles
- generated reports that summarize workspace state
- separate surfaces that are intentionally part of one product

### Blocked

These should fail closed by default:

- unrelated products in the same workspace
- cross-product tasks without an explicit integration type
- implementation before approved planning
- writing outside the active workspace boundary
- editing Kabeeri core as if it were app code from a vibe workspace
- hidden assumptions about scope or surface ownership
- tasks or files that cannot be traced back to the workspace plan

## Implementation Checklist

### 1. Boundary classifier

Goal: give the runtime a clear way to decide whether something is allowed,
linked, or blocked.

- [x] define a boundary classification helper
- [x] classify path or artifact types by workspace scope
- [x] expose the classification in validation output
- [x] keep the classifier deterministic and easy to audit

Acceptance:

- every inspected workspace item returns one of the boundary states
- unknown items default to blocked or require explicit linking

### 2. Scope ownership

Goal: make the active product boundary explicit.

- [ ] store workspace-level scope in workspace metadata
- [ ] store surface scopes in workspace metadata
- [ ] require explicit review for new surface scopes
- [ ] prevent silent scope expansion

Acceptance:

- a workspace always knows whether it is app-wide, website, mobile, admin, or
  another approved surface
- scope changes are visible before implementation continues

### 3. Validation and rejection

Goal: fail closed when boundary rules are violated.

- [ ] reject cross-product file placement
- [ ] reject unapproved implementation outside planning
- [ ] reject mixed-product task creation
- [ ] reject writes that cannot be traced back to the current workspace
- [ ] make validation errors actionable

Acceptance:

- invalid workspace state blocks task generation or execution
- validation explains what is missing or out of scope

### 4. Dashboard visibility

Goal: show boundary health in the workspace dashboard.

- [ ] display workspace kind
- [ ] display surface scopes
- [ ] display boundary status
- [ ] display unresolved scope risks
- [ ] display the next allowed action

Acceptance:

- the dashboard makes it obvious when the workspace is compliant
- the dashboard makes it obvious when the workspace is blocked

### 5. Planning gate linkage

Goal: keep boundary rules tied to the approved planning pack.

- [ ] ensure scope is captured during planning
- [ ] ensure new surfaces require re-review
- [ ] ensure tasks cannot expand the workspace boundary silently
- [ ] ensure implementation tracks approved scope only

Acceptance:

- planning approval and workspace scope stay synchronized
- scope changes invalidate stale approval when needed

### 6. Tests

Goal: prove the boundary rules in runtime.

- [x] test allowed workspace content
- [x] test linked workspace content
- [x] test blocked workspace content
- [ ] test scope expansion requiring re-review
- [ ] test dashboard output for boundary state

Acceptance:

- boundary rules are covered by automated tests
- regressions are caught before they become normal behavior

## Recommended Enforcement Rule

The workspace boundary should behave like this:

1. accept only approved work inside the workspace
2. allow explicit links only when the workspace knows about them
3. block everything else
4. require re-review whenever the workspace boundary changes

## Done Definition

The workspace boundary work is complete when:

- the runtime classifies workspace content into allowed, linked, and blocked
  states
- the app workspace dashboard shows boundary status clearly
- the planning gate and scope model stay synchronized
- tests cover the boundary cases
- the docs explain the same rules that the runtime enforces
