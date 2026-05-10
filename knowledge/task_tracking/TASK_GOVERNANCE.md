# Unified Task Tracking And Governance

This is the canonical task tracking and task governance policy for Kabeeri VDF.

The old split was:

- `task_tracking/` for task schemas, templates, states, and execution logs.
- `governance/TASK_GOVERNANCE.md` for task policy.
- `task_governance/` as an older duplicate governance location.

The unified rule is now simpler:

```text
knowledge/task_tracking/
```

is the single home for task tracking formats, task governance rules, task
provenance, review checklists, task states, task intake, AI execution logs, and
task runtime guidance.

`knowledge/governance/TASK_GOVERNANCE.md` remains only as a compatibility
pointer for old links. Do not add new task policy there.

## Core Rule

Executable work must be represented by a clear governed task before code work
starts.

A governed task must have:

- clear title and summary
- source and provenance
- included and excluded scope
- acceptance criteria
- workstream boundary
- app boundary when the workspace has registered apps
- assignee when work is ready to start
- reviewer or Owner verification path
- execution scope token for governed AI or developer execution
- expected checks or review evidence

## What Task Tracking Means

Task tracking is the practical record of work.

It answers:

- What task exists?
- Who or which AI agent is responsible?
- What status is it in?
- What files, app, feature, workstream, sprint, or release does it affect?
- What evidence proves it was completed?
- What is still blocked, rejected, or waiting for verification?

Runtime task state lives in:

```text
.kabeeri/tasks.json
.kabeeri/dashboard/task_tracker_state.json
```

The live task tracker is exposed through:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf dashboard task-tracker
kvdf dashboard serve
```

When the local dashboard is running, the focused task API is:

```text
/__kvdf/api/tasks
```

## What Task Governance Means

Task governance is the rule layer around task tracking.

It decides whether a task is valid, ready, traceable, scoped, assigned,
reviewable, safe to execute, and safe to mark done.

Governance prevents common AI-development failures:

- asking AI to build a whole product in one vague prompt
- mixing backend, frontend, design, migration, security, and release work in one task
- losing why a task exists
- expanding scope silently during implementation
- accepting work without tests, screenshots, review notes, or Owner verification
- editing the wrong app inside a multi-app Kabeeri workspace
- spending AI tokens on unclear or duplicated work

## Source And Provenance

Every task must explain where it came from.

Valid sources include:

- owner request
- questionnaire answer
- generated project document
- Vibe-first suggested task
- GitHub issue
- sprint planning
- bug report
- design source
- security scan
- migration plan
- post-work capture
- explicit technical decision

Tasks without a source are not ready for execution.

Use `TASK_PROVENANCE_SCHEMA.json` when the source needs structured evidence.

## Scope Rules

Every task must say what is included and what is excluded.

Good scope:

- names the app or workstream
- lists expected files or folders when known
- says what must not be changed
- separates integration work from single-area work
- avoids mixing unrelated features

Bad scope:

- "improve everything"
- "build the whole app"
- "fix dashboard and auth and payments"
- "clean the project" without a target and acceptance criteria

## Definition Of Ready

A task is ready only when:

- the source is traceable
- the workstream exists
- the app boundary is valid if app-scoped
- acceptance criteria are measurable
- the assignee is allowed to work in the target workstream
- cross-workstream or cross-app work uses task type `integration`
- expected checks are known
- risky work has policy gates or Owner approval path

If any of these are missing, keep the task in intake, backlog, or blocked state
instead of starting implementation.

## Assignment Rules

Task assignment must respect:

- developer identity
- AI agent identity
- role permissions
- workstream ownership
- app boundary
- active locks
- reviewer independence

An assignee should not be the final verifier of their own work. Owner
verification remains the final authority for governed completion.

## Execution Rules

Before governed execution:

1. Create or approve the task.
2. Assign the task.
3. Issue an execution-scoped task access token.
4. Acquire required locks when applicable.
5. Start an AI or developer session if the work is tracked.

During execution:

- stay inside the allowed scope
- report changed files
- report checks run
- capture risks or follow-up work
- do not silently expand the task

After execution:

- submit review evidence
- record AI usage when AI was used
- run validation or checks
- Owner verifies or rejects
- active task tokens are revoked after final verification or rejection

## Relationship To Vibe-first

Vibe-first suggestions are not executable tasks until they are approved and
converted.

```text
natural language intent
-> suggested task card
-> approval or rejection
-> governed task
-> scoped token
-> execution
-> review
-> Owner verification
```

## Relationship To Agile

Agile user stories can become governed tasks when they are small enough, ready,
and traceable.

```text
epic
-> user story
-> Definition of Ready
-> governed task
-> sprint execution
-> sprint review
-> release readiness
```

Story-to-task conversion must keep the source reference, such as:

```text
story:story-checkout-001
```

## Relationship To Structured Delivery

Structured delivery uses the same task governance rules, but task sources often
come from approved requirements, phases, milestones, deliverables, risks, or
change requests.

No structured deliverable should be marked complete unless the linked governed
tasks have evidence and review status.

## Relationship To Design, Security, Migration, And Release Gates

Some tasks require extra governance:

- Design tasks need approved design sources, page specs, component contracts, or visual review evidence.
- Security tasks need scan evidence, secret rules, and remediation notes.
- Migration tasks need migration plans, rollback plans, and safety checks.
- Release tasks need policy gates and handoff evidence.
- GitHub write tasks need publish/write authorization.

Do not hide these gates inside generic acceptance text. Make them explicit in
the task fields or review checklist.

## Main Runtime Commands

```bash
kvdf task create
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task tracker
kvdf workstream validate
kvdf token issue
kvdf lock create
kvdf session start
kvdf session end
kvdf validate task
```

## Files In This Unified Folder

```text
README.md
README_AR.md
TASK_GOVERNANCE.md
TASK_TEMPLATE.md
TASK_STATES.md
TASK_INTAKE_TEMPLATE.md
TASK_PROVENANCE_SCHEMA.json
TASK_REVIEW_CHECKLIST.md
AI_EXECUTION_LOG_TEMPLATE.md
EXAMPLE_TASK.md
OWNER_VERIFY_RULES.md
task.schema.json
task.schema.example.json
task_tracking_manifest.json
```

## Deprecated Location Rule

Do not recreate:

```text
task_governance/
```

Do not add new task policy to:

```text
knowledge/governance/TASK_GOVERNANCE.md
```

New task tracking and governance changes belong in:

```text
knowledge/task_tracking/
```
