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
.kabeeri/task_trash.json
.kabeeri/task_scheduler.json
```

The live task tracker is exposed through:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf dashboard task-tracker
kvdf dashboard serve
kvdf schedule status
kvdf schedule route <task-id> --to temp|trash|restore|agent|deferred
```

Completed tasks are not deleted immediately. When a task reaches its final
completion step, KVDF moves the full record into `.kabeeri/task_trash.json`
with:

- `trashed_at`
- `trash_expires_at`
- `trashed_reason`
- `trashed_by`
- `original_position`
- `original_status`
- `trash_retention_days`

Trash is retained for 30 days by default. On `kvdf resume` and `kvdf entry`,
KVDF sweeps expired trash records before reporting the current session state.
`kvdf task trash restore <task-id>` can move a record back into the active task
list when recovery is needed.

Task movement itself is recorded by the Task Scheduler. It keeps a durable
route history in `.kabeeri/task_scheduler.json` for routes into temp, trash,
restore, agent handoffs, and deferred scheduling decisions so a later session
can resume the movement trail without chat memory.

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
- preserves `KVDF_New_Features_Docs` as a protected source package that must not be moved, renamed, deleted, or recreated by task execution until its contents have been redistributed into the correct Kabeeri folders

Bad scope:

- "improve everything"
- "build the whole app"
- "fix dashboard and auth and payments"
- "clean the project" without a target and acceptance criteria
- "move the new features docs folder" or any task that changes the location of `KVDF_New_Features_Docs` before its contents have been redistributed

## Protected Intake Folder

The folder `KVDF_New_Features_Docs/` is a protected source package. It contains
two sub-systems: a reference software-design library and a project-documentation
generator library. Tasks may analyze it, import knowledge from it, or convert
its ideas into formal Evolution priorities, but task execution must not move,
rename, delete, or recreate the folder itself until the selected content has
been redistributed into the correct Kabeeri folders.

If a task touches repository folder structure, it must keep this folder in its
original location and add an explicit `do_not_change` rule for it.

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

## Task Assessment System

Before large work starts, produce a structured assessment that records the
goal, workstream, allowed files, dependencies, acceptance criteria, expected
checks, and policy gates. An assessment should make scope and blockers visible
before implementation moves into the ready or execution stages.

## Durable Task Memory

Tasks that must survive interrupted sessions should keep execution-grade
memory in the task record itself.

Store these fields when they help the next session resume safely:

- `execution_summary`
- `memory`
- `resume_steps`
- `required_inputs`
- `expected_outputs`
- `do_not_change`
- `verification_commands`

When a task is generated from Evolution, keep the source change id and the
impacted area visible so the follow-up task chain remains traceable.

If a task creates additional follow-up tasks, link them in the source change or
task tracker record instead of relying on chat memory to remember the chain.

Prefer a concrete `follow_up_tasks` array in the task record when the follow-up
chain is known. Keep the source change id, impacted area, and acceptance
criteria on the source task so the framework change remains identifiable.

## Traceability Layer

Traceability links the evidence chain around a task: source, assessment,
verification commands, ADRs, AI runs, docs source-of-truth checks, and the
resulting trace edges. Use `kvdf trace report` to inspect the chain and identify
gaps before handoff or archive.

## Change Control Layer

Change control records larger decisions that can affect the runtime, docs, or
release path. It combines structured change requests, Evolution changes, and
risk register entries so high-risk work can be reviewed before it reaches
release or handoff. Use `kvdf change report` or `kvdf risk report` to inspect
the current control state.

## Lifecycle Engine

The visible task lifecycle groups status values into intake, ready, execution,
validation, closure, blocked, and archived stages. Use `kvdf task lifecycle`
when you need to see the next governed step for a task, the current stage in
the flow, and whether a task is still active or already archived in trash.

## Main Runtime Commands

```bash
kvdf task create
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task assessment
kvdf task lifecycle
kvdf trace report
kvdf change report
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
