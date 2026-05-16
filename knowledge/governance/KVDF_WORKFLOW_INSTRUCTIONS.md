# KVDF Workflow Instructions

Updated: 2026-05-15

This document defines the shared operating instructions for three roles:

- AI Tool
- Kabeeri developer
- Vibe developer

The goal is to keep planning, implementation, review, and handoff strict,
traceable, and hard to misread.

## Purpose

KVDF work must be:

- planned before it is implemented
- split into explicit tasks
- approved before execution
- bounded by workspace scope
- verified after each task
- resumable without chat memory

If a change does not fit those rules, it should stop and return to planning.

## Shared Rules

These rules apply to every role:

1. Plan first.
2. Do not edit files until the task list is approved.
3. Implement one task at a time.
4. Stop after each task and report what changed.
5. Do not bundle unrelated cleanup into the current task.
6. If scope changes, return to planning and re-approve.
7. If the boundary is unclear, stop and ask.
8. Use runtime state, not chat memory, as the source of truth.

## AI Tool Role

The AI Tool is the reasoning and drafting layer.

### Allowed

- summarize the problem
- split the work into tasks
- describe dependencies and risks
- draft implementation steps
- explain validation and failure cases
- propose next actions

### Not allowed

- modify files before approval
- silently expand scope
- merge tasks into one implementation pass
- pretend approval happened when it did not
- treat chat memory as the authoritative record

### Required behavior

- Present the task plan first.
- Wait for approval before editing files.
- Execute only the approved task.
- Stop when the task is complete.
- Ask again before continuing.

## Kabeeri Developer Role

The Kabeeri developer changes Kabeeri itself.

### Scope

- CLI commands
- runtime services
- schemas
- dashboard behavior
- documentation for the framework
- plugins that belong to Kabeeri core
- Evo work for framework evolution

### Required behavior

- Use Evo when changing the framework.
- Split Evo into tasks before implementation.
- Keep docs, runtime, and tests aligned.
- Update governance and capability references when behavior changes.
- Verify each slice before moving on.

### Not allowed

- change framework behavior without an Evo or approved task
- bundle unrelated framework changes into one step
- leave runtime behavior undocumented
- let docs drift away from command behavior

## Vibe Developer Role

The vibe developer builds an app inside a governed workspace.

### Scope

- app source code
- app tests
- app docs
- workspace-local `.kabeeri/` state
- planning pack
- app scorecards
- app tasks
- app validation
- app handoff

### Required behavior

- Start with planning.
- Review the planning pack.
- Approve the planning pack before tasks are created.
- Keep work inside the workspace boundary.
- Respect the surface scopes for website, mobile, admin, API, backend, or other approved app surfaces.
- Implement one task at a time.
- Stop when scope changes.

### Not allowed

- implement before approval
- write outside the workspace boundary
- mix unrelated products inside one workspace
- create tasks from assumptions instead of approved planning
- ignore boundary status or scorecard warnings

## Planning Gate

The planning gate is mandatory for both Kabeeri development and vibe
development.

Required planning artifacts may include:

- product scope statement
- architecture and stack decision
- data design document
- UI/UX direction
- questionnaire coverage
- module or task plan
- scorecard summary

The planning gate is complete only when:

- the pack exists
- the pack has been reviewed
- the pack has been approved
- the next exact action is clear

## Task Slicing Rules

Every implementation step must be a real task.

Task slices must:

- have a clear title
- have a clear dependency chain
- have an acceptance criterion
- have a narrow file scope
- be small enough to verify

Task slices must not:

- mix unrelated work
- change the scope without review
- depend on undocumented assumptions
- hide extra cleanup inside the slice

## Approval Rules

Approval is required before execution.

### Approval must confirm

- the work is in scope
- the planning pack is complete enough
- the next task is the right task
- the task boundaries are clear

### Approval must block

- incomplete planning
- unresolved scope questions
- missing surface scope definitions
- unreviewed boundary changes

## Boundary Rules

The workspace boundary is enforced through runtime classification.

### Allowed

- files and folders inside the active workspace
- approved task outputs
- workspace-local state
- explicitly approved surface scopes

### Linked

- explicitly linked workspaces
- shared references used for planning
- related product surfaces that were approved as part of the same product

### Blocked

- unrelated products
- unapproved cross-product changes
- writes outside the active workspace
- scope expansion without re-review
- tasks that cannot be traced to the approved plan

## Stop Rules

Stop immediately when:

- the plan is incomplete
- the scope changes
- the boundary is unclear
- the task is bigger than the approved slice
- the runtime and docs disagree
- a required artifact is missing

When stopping:

- explain the blocker
- show the next safe action
- do not continue silently

## Escalation Rules

Escalate back to planning when:

- a change touches a new surface scope
- a change affects another product boundary
- a change alters the dashboard role split
- a change affects scorecard semantics
- a change requires new governance text

## Examples

### Example: AI Tool

The AI Tool receives a user request, breaks it into tasks, and waits for
approval before editing files.

### Example: Kabeeri developer

The Kabeeri developer uses Evo to change dashboard behavior, command behavior,
schemas, or plugins, then verifies the runtime and docs together.

### Example: Vibe developer

The vibe developer reviews the planning pack, approves it, then implements one
workspace task at a time inside the app boundary.

## Failure Cases

These are wrong and must be blocked:

- implementing before approval
- editing outside the workspace boundary
- bundling unrelated changes into one task
- using chat memory instead of the approved plan
- letting docs and runtime tell different stories

## Done Definition

This instruction set is working when:

- the same rules can guide the AI Tool, Kabeeri developer, and vibe developer
- task slicing is visible before implementation
- workspace boundaries are respected in runtime
- approval is required before execution
- stop rules are clear and consistently enforced
