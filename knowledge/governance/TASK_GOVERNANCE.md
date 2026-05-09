# Task Governance

This is the canonical task governance policy for Kabeeri VDF.

Use `task_tracking/` for task schemas, templates, examples, states, and AI
execution log formats. Use this document for the rules that decide whether a
task is valid, ready, traceable, scoped, assigned, reviewable, and safe to
execute.

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

## Relationship To Runtime Commands

Main commands:

```bash
kvdf task create
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf workstream validate
kvdf token issue
kvdf lock create
kvdf session start
kvdf session end
kvdf validate task
```

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

## Relationship To Existing Folders

- `task_tracking/` is the task format and template home.
- `governance/TASK_GOVERNANCE.md` is the task policy home.
- `task_governance/` has been removed. Do not recreate it; new task policy
  belongs here.
