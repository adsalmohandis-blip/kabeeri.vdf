# KVDOS UIUX Evos

This document preserves the old "UI evo" idea in a versioned, reviewable form.

Each evo is a bounded UI/UX slice that can be implemented, reviewed, and
tracked independently.

## Evo Format

- `evo_id`
- `title`
- `version`
- `scope`
- `primary_screens`
- `dependencies`
- `exit_criteria`

## UI-EVO-001 Foundation Shell

- `evo_id`: `ui-evo-001`
- `title`: Foundation Shell And Navigation
- `version`: `v0.1`
- `scope`: establish layout, shell, workspace switching, and top-level nav
- `primary_screens`: shared shell, dashboard shell, global search, user menu
- `dependencies`: design tokens, nav structure, product framing
- `exit_criteria`: user can understand where they are and how to move around

## UI-EVO-002 Project Overview

- `evo_id`: `ui-evo-002`
- `title`: Project Overview And Status
- `version`: `v0.1`
- `scope`: show project identity, phase, status, health, and next action
- `primary_screens`: Studio dashboard, project dashboard
- `dependencies`: shell, project model, state indicators
- `exit_criteria`: project state is visible without opening multiple screens

## UI-EVO-003 Discovery Flow

- `evo_id`: `ui-evo-003`
- `title`: Discovery Questions And Assumptions
- `version`: `v0.2`
- `scope`: capture missing answers and surface assumptions, conflicts, and confidence
- `primary_screens`: discovery flow, question panel, answer review
- `dependencies`: intake model, questionnaire state, blueprint source
- `exit_criteria`: the user can move from vague intent to reviewable scope

## UI-EVO-004 Blueprint And Spec

- `evo_id`: `ui-evo-004`
- `title`: Blueprint Viewer And Spec Viewer
- `version`: `v0.2`
- `scope`: render product blueprint and `app.kvdos.yaml` in a readable format
- `primary_screens`: blueprint viewer, spec viewer
- `dependencies`: discovery output, project manifest format
- `exit_criteria`: users can inspect the product plan before execution

## UI-EVO-005 Task Execution Cockpit

- `evo_id`: `ui-evo-005`
- `title`: Task Queue And Agent Activity
- `version`: `v0.3`
- `scope`: make the active work queue, attempts, agents, and outputs visible
- `primary_screens`: task queue, agent activity
- `dependencies`: task engine, agent lifecycle, queue state
- `exit_criteria`: users can see what is running and why

## UI-EVO-006 Files, Logs, And Patch Review

- `evo_id`: `ui-evo-006`
- `title`: Operational Evidence Review
- `version`: `v0.3`
- `scope`: inspect files, logs, patches, and test output
- `primary_screens`: file explorer, logs, patch preview, test results
- `dependencies`: runner outputs, file diff data, log aggregation
- `exit_criteria`: users can validate execution before they accept results

## UI-EVO-007 Approvals And Risk

- `evo_id`: `ui-evo-007`
- `title`: Approval Center
- `version`: `v0.3`
- `scope`: handle risky actions, package changes, secret access, and deployment approvals
- `primary_screens`: approvals, approval history
- `dependencies`: policy gate, risk model, audit records
- `exit_criteria`: all risky operations are clearly reviewable

## UI-EVO-008 Runner Control Surface

- `evo_id`: `ui-evo-008`
- `title`: Runner Status And Execution
- `version`: `v0.4`
- `scope`: show runner health, sandbox state, diagnostics, and execution flow
- `primary_screens`: runner status, runner execution view, sandbox state, health
- `dependencies`: runtime status feed, sandbox events, diagnostics
- `exit_criteria`: execution infrastructure is visible and debuggable

## UI-EVO-009 Cloud, Packages, And Entitlements

- `evo_id`: `ui-evo-009`
- `title`: Cloud And Package Operations
- `version`: `v0.4`
- `scope`: manage cloud sync, package registry, package lifecycle, licensing, and billing
- `primary_screens`: cloud sync, package registry, package detail, billing, license, entitlements
- `dependencies`: cloud account state, package model, licensing model
- `exit_criteria`: users can understand what is installed, synced, paid, and enabled

## UI-EVO-010 Hardening And Polish

- `evo_id`: `ui-evo-010`
- `title`: Accessibility, Responsiveness, And Final Polish
- `version`: `v0.5`
- `scope`: finish responsive behavior, empty states, loading states, errors, and keyboard support
- `primary_screens`: all MVP screens
- `dependencies`: all previous UI evo outputs
- `exit_criteria`: the full MVP surface feels coherent and production-ready

## Mapping Notes

- The old UI evo idea should now be treated as a structured sequence.
- Each evo can be linked to a roadmap item, a UI task, or a design review.
- If a screen belongs to more than one evo, the earliest evo owns the shell and the later evo owns the refinement.
