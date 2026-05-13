# AI Session Contract Runtime

Kabeeri keeps AI sessions durable in `.kabeeri/sessions.json` instead of chat
history.

Each governed session records:

- the task and developer
- the task token used to start the session
- a session contract with task title, task status, acceptance criteria, and scope
- a scope snapshot with workstreams, app paths, allowed files, forbidden files,
  and scope source
- an output contract with summary, files touched, checks run, risks, and next
  suggested task
- handoff evidence entries that point at the generated handoff report and usage
  event log

The handoff report at `.kabeeri/reports/<session-id>.handoff.md` mirrors the
same contract and output fields so the durable state and the human-readable
report stay aligned.

Session execution still fails if touched files leave the allowed app, token,
lock, or workstream boundaries.
