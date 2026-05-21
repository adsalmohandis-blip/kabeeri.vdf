# KVDF Workflow Instructions

Updated: 2026-05-19

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

## KVDF Core Authority Rules

KVDF Core defines the shared rules that every track must respect:

- Viber/App work must never edit KVDF Core source files, docs, schemas, or runtime surfaces.
- Core track boundaries are enforced before any planner or materialization step runs.
- Planner prompt-context hooks may reuse AI learning warnings, but the core rules stay authoritative.
- GitHub stays optional and secondary; local files and local Git evidence come first.
- `.kabeeri/` supports runtime evidence, but it never outranks current source files or current Core code.

## State Resync Before Planning

KVDF must not generate the next Evolution from stale local files.

State Resync is file-first, not GitHub-first.

Before recommending or starting any next Evolution, KVDF must perform a State
Resync and rebuild the current Evolution ledger from the current repository
reality.

The required source-of-truth priority is:

For application repositories / Vibe track:

1. Current app docs and requirements files
2. Current app manifests/specs/configs
3. Current app source structure
4. Current app tests
5. Local Git history if available
6. Release/tag history if available
7. Remote provider history such as GitHub only if enabled
8. `.kabeeri/` runtime state as supporting state only
9. Chat history as supporting context only

For KVDF Core repository work:

1. Current KVDF source files and docs
2. Current branch and latest main
3. Git commit history
4. Release/tag history if available
5. Current roadmap/docs
6. Current manifests/specs/configs
7. `.kabeeri/` runtime state as supporting state only
8. GitHub only if enabled as remote/provider plugin
9. Chat history as supporting context only

Required behavior:

- confirm the target repo, current repo, current branch, latest `main`, and current roadmap
- rebuild the Evolution status map before planning
- detect stale docs and warn the Owner
- do not restart Evolutions that are already completed
- treat `main`, merged PRs, release tags, and current roadmap docs as higher
  priority than old planning drafts
- treat `.kabeeri/tasks.json` as supporting state only, not the only source of
  current progress
- treat `.kabeeri/` runtime state as supporting state only, not implementation truth
- treat AI learning runtime as supporting memory that can be promoted, exported, or imported, but not as the source of Core authority
- do not let `.kabeeri/tasks.json` overrule later git history, release tags, or
  roadmap evidence
- for app work, treat current app files/docs/specs/tests as the primary source of truth
- for app work, Git and GitHub are supporting historical evidence unless the Owner explicitly chooses remote history as authoritative
- for KVDF Core work, keep direct-to-main as the default delivery mode unless the Owner explicitly asks for branches or PRs
- for KVDF Core work, let Planner prompt-context read AI learning warnings, but never let prompt history override current source evidence
- when source control is enabled and safe, sync or read the latest `main`
- stop and ask the Owner when source-of-truth conflicts are ambiguous

Planner Drift Guard means the planner must first prove that its view of
completed, active, planned, blocked, and future-only work matches the current
repository reality before it suggests the next Evolution.

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
- Confirm the target repo and workspace before implementation by checking the
  repo root, current branch, and working tree status.
- Keep runtime state out of commits unless an Evolution explicitly requires a
  runtime artifact to be versioned.
- Treat Owner review as the final merge authority for any GitHub-backed handoff.
- Treat Evolution as a closeout-aware milestone system: when all linked tasks
  are terminal and archived, the parent Evolution must auto-close in the
  current track.

### Not allowed

- change framework behavior without an Evo or approved task
- bundle unrelated framework changes into one step
- leave runtime behavior undocumented
- let docs drift away from command behavior

## Vibe Developer Role

The vibe developer builds an app inside a governed workspace.

### Application Source-Of-Truth Priority

For Vibe/App Track work, the current application files are the primary source
of truth.

Git and GitHub must not override current app files unless the Owner explicitly
chooses remote history as authoritative.

The source-of-truth priority is:

1. Current app docs and requirements files
2. Current app manifests/specs/configs
3. Current app source structure
4. Current app tests
5. Local Git history if available
6. Release/tag history if available
7. Remote provider history such as GitHub only if enabled
8. `.kabeeri/` runtime state as supporting state only
9. Chat history as supporting context only

Git is historical evidence. GitHub is an optional secondary provider/plugin evidence. `.kabeeri/` is supporting runtime evidence only, not the only source of current progress.

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
- Confirm the target repo and workspace before implementation by checking the
  repo root, current branch, and working tree status.
- Treat current app files as the primary source of truth for app-track planning
  and implementation.
- Implement one task at a time.
- Stop when scope changes.
- Keep runtime state out of commits unless the approved Evolution explicitly
  requires a runtime artifact to be versioned.
- Treat app-track Evolution as a closeout-aware milestone system: when all
  linked tasks are terminal and archived, the parent Evolution auto-closes in
  the app track even if GitHub sync is disabled.

### Not allowed

- implement before approval
- write outside the workspace boundary
- mix unrelated products inside one workspace
- create tasks from assumptions instead of approved planning
- ignore boundary status or scorecard warnings

## KVDF-Led Delivery

KVDF-led delivery is the workflow where KVDF keeps the local workspace as the
source of truth, slices approved Evolutions into Tasks, and decides whether the
handoff stops locally or continues through GitHub.

For app-track delivery, current app files are the primary source of truth, and
Git or GitHub only become authoritative when the Owner explicitly chooses
remote history as the higher-priority source.

## Delivery Modes

### Local-Only Mode

Local-only mode is valid when GitHub is not used.

Required outcome:

- tasks are completed
- tasks are verified and archived
- the parent Evolution auto-closes
- the final handoff report is written locally

### Solo Owner Direct-to-Main Mode

Solo Owner Direct-to-Main Mode is the default for KVDF core development when
the Owner is the only active framework developer.

Use it when:

- the target repo is `kabeeri.vdf`
- the active work is KVDF Core / Owner Track work
- the Owner is the only active core developer
- no team-review or protected-branch policy is required
- the Owner explicitly accepts direct-to-main delivery

Required outcome:

- the work is completed on `main`
- required checks are run before push
- only intended KVDF source, docs, schemas, tests, and approved generated docs
  are committed
- runtime state is not committed unless explicitly required by the Evolution
- the commit is pushed directly to `origin main`
- the workspace is clean or intentionally documented after push

Standard command flow:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
node bin/kvdf.js validate
npm test
npm run check
git add -A
git commit -m "<type>: <message>"
git push origin main
```

### Definition

- **Evolution** is the milestone / release slice / change layer.
- **Task** is a closable issue or work item under an Evolution.
- **Task Punch** is the generated batch of Tasks for the approved slice.
- **Evolution Handoff** is the final report and delivery output.
- **GitHub Handoff** is the optional branch, commit, push, PR, review, merge,
  and pull workflow.
- **Owner Track** is framework and core governance work.
- **App Track** is the product or application repository being built.

### Local-only handoff

Local-only handoff is valid and complete when:

- implementation is finished inside the approved workspace
- tasks are verified and archived
- the parent Evolution auto-closes
- the final handoff report is written
- no GitHub step is required or available

### GitHub handoff

GitHub handoff is mode-dependent.

### Team / Protected Repo GitHub Mode

Team / Protected Repo GitHub Mode is optional.

Use it when:

- the Owner explicitly asks for a branch and PR
- more than one developer is active
- branch protection requires review
- the change is risky or experimental

Required outcome:

- a branch is created from the approved Evolution slice
- tests run before commit
- the approved changes are committed and pushed
- a PR is prepared or created
- Owner review happens before merge
- `main` is merged only after approval
- the latest `main` is pulled before the next Evolution begins

#### Team / Protected Repo Mode

Branch and PR handoff is optional and should be used only when:

- there is more than one active developer
- the repository has branch protection
- the Owner explicitly requests PR review
- the change is risky, experimental, or needs isolated review

When Team / Protected Repo Mode is enabled:

- create or update a delivery branch from the approved Evolution slice
- run tests before commit
- commit only the intended source, docs, and deliverable artifacts
- do not commit runtime state such as `.kabeeri/`, temporary runtime outputs,
  or other live workspace state unless the Evolution explicitly requires it
- push the branch
- prepare or create the PR
- request Owner review
- merge only after Owner approval
- pull the latest `main`
- validate the workspace again
- start the next Evolution only after the sync succeeds

### Target repo confirmation rule

Before implementation begins, the actor must confirm the target repo and
workspace by inspecting:

- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git status --short`

Then confirm:

- app-track work targets the app workspace, not the KVDF core repository
- owner-track work targets the KVDF core repository only when the Evolution
  explicitly says it is core work
- if the target repo is wrong or unclear, stop and return to planning

### Git Commit and Publishing Rules

For Solo Owner Direct-to-Main Mode:

1. Work on `main`.
2. Run the required checks.
3. Commit only the intended KVDF Core changes.
4. Do not commit `.kabeeri/` runtime state or transient execution outputs unless explicitly required.
5. Push directly to `origin main`.

For Team / Protected Repo GitHub Mode:

1. Create a branch for the approved Evolution slice.
2. Run the required tests.
3. Commit only the intended source, docs, and deliverable artifacts.
4. Push the branch.
5. Prepare or create the PR.
6. Route the PR to Owner review.
7. Merge only after Owner approval.
8. Pull the latest `main`.
9. Re-validate the workspace.
10. Start the next Evolution only after the sync is clean.

### Failure handling

If push or PR tooling is unavailable:

- stay local
- record the failure in the handoff report
- preserve the completed local work
- do not pretend the GitHub handoff happened
- do not start the next Evolution until the local closeout is verified

## Planning Gate

The planning gate is mandatory for both Kabeeri development and vibe
development.

Required planning artifacts may include:

- product scope statement
- architecture and stack decision
- data design document
- UI/UX direction
- portable app-doc package
- questionnaire coverage
- module or task plan
- scorecard summary

The planning gate is complete only when:

- the pack exists
- the pack has been reviewed
- the pack has been approved
- the next exact action is clear
- the portable app docs package is written into the app folder when the work
  belongs to a specific app

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
