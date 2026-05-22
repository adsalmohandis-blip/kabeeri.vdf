# impl-1 Local IDE Studio Shell Skeleton Proposal

Updated: 2026-05-22

Branch: `docs/impl-1-local-ide-studio-shell-skeleton-proposal`

Status: proposal only

## Purpose

This proposal defines the first real implementation stage for KVDOS.

The goal is to build the initial Studio shell skeleton only, while staying
strictly inside the approved app-local boundary and not crossing into cloud,
license, runtime, execution, packaging, or KVDF core work.

This document is a proposal, not implementation authorization.

## 1. Implementation Scope

The first real implementation slice, `impl-1 Local IDE Studio Shell Skeleton`,
should focus on the minimum Studio shell needed to make KVDOS feel like a
product surface rather than a collection of planning docs.

### In scope

- the outer Studio shell frame
- the app header / top bar
- the primary side navigation shell
- the selected-project context display
- a landing canvas / first view area
- basic empty-state orientation
- app-local navigation framing
- stubbed placeholders for future Studio panels

### Out of scope

- cloud APIs
- auth flows
- subscriptions
- license enforcement
- runtime execution
- SQLite implementation
- release/download access
- packaging
- runner execution
- bridge logic
- repo-root KVDF core edits

## 2. Allowed Files

The first implementation slice should be limited to files inside
`workspaces/apps/kvdos/`, and preferably only the following areas until the
scope is proven stable:

- `workspaces/apps/kvdos/src/**`
- `workspaces/apps/kvdos/docs/**` only for supporting docs updates
- `workspaces/apps/kvdos/tests/**` only for implementation tests

If additional files are needed, they must stay app-local and require explicit
owner review.

## 3. Forbidden Files

The following are not allowed for the first implementation slice:

- repo-root KVDF core files
- `workspaces/apps/kvdos/.kabeeri/**`
- `workspaces/apps/kvdos/workspaces/**`
- any cloud API implementation files
- any SQLite runtime implementation files
- any packaging implementation files
- any release/download access implementation files
- any bridge / controlled-upgrade implementation files
- `.vscode/settings.json`

## 4. Expected UI Shell Behavior

The first real Studio shell should:

- open as a clear KVDOS app surface
- show a stable shell frame on load
- provide clear app-local navigation
- preserve the current selected project context
- avoid exposing unfinished runtime or cloud functionality
- remain visually simple enough to accept later panels without rewrites

The shell should feel like the place where all later KVDOS work lands.

## 5. Studio Navigation Boundaries

The first implementation slice should define navigation boundaries without
building the full product.

Navigation should:

- provide a primary Studio entry point
- separate shell navigation from future content panels
- keep current project context visible
- avoid routing into runtime, cloud, or packaging work
- avoid implying plugin registry or marketplace behavior

## 6. First Screen Behavior

The first screen should:

- show the KVDOS Studio shell immediately
- show the selected project or an empty-state prompt
- show the primary navigation structure
- show a landing area that can later host tasks, reports, or views
- not require runtime execution to orient the user
- not require cloud login to explain the shell

The first screen must be useful even before deeper features exist.

## 7. Tests / Validation Commands

The first implementation slice should be validated with:

- `git diff --check`
- `npm test`
- `npm run check`
- any app-local unit or integration tests added for the shell slice

If browser-visible work is included later in the slice, a browser-based manual
check should also confirm that the shell renders and navigation remains stable.

## 8. Risks

- The shell could expand into an unbounded app rewrite if scope is not kept
  tight.
- Navigation work could accidentally pull in later runtime or cloud features.
- A shell-only slice could become too abstract if it does not show a useful
  first screen.
- The implementation might drift outside app-local files if the boundary is not
  enforced.

## 9. Owner Approval Checkpoint

This proposal requires owner approval before any implementation branch is
opened.

Approval is required for:

- the implementation scope
- the allowed / forbidden file set
- the first-screen behavior
- the navigation boundaries
- the test / validation approach
- the boundary that excludes cloud, runtime, execution, packaging, and KVDF
  core work

## 10. Recommended Starting Shape

Recommended initial slice:

- the shell frame
- the primary navigation scaffold
- the selected-project display
- an empty landing canvas

Recommended first implementation path:

- create a new `impl-1` branch only after this proposal is approved
- keep all changes app-local
- ship the smallest shell skeleton that can grow safely

## 11. Transition Rule

If this proposal is approved, the next implementation stage must:

- use its own branch and PR
- stay app-local
- stay inside the approved boundary
- avoid skipping owner review

Do not implement from this proposal.
Do not modify repo-root KVDF core files.
