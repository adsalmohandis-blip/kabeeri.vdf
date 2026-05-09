# Post-Work Capture

Post-work capture turns free coding into governed records after the work happens.

It is for real developer behavior: sometimes a person or AI finishes useful work before the task card is perfect. Kabeeri must not discard that work. It records it, classifies it, links it to governance, and tells the Owner what still needs review.

## Flow

```text
detect changed files
-> summarize changeset
-> classify workstream and risk
-> link to existing task or suggest a new task
-> collect acceptance evidence
-> flag unapproved work when needed
```

## Runtime Commands

```bash
kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js --checks "npm test"
kvdf capture --summary "Finished docs cleanup"
kvdf capture list
kvdf capture show capture-001
kvdf capture link capture-001 --task task-001
kvdf capture convert capture-001 --task task-002
kvdf capture resolve capture-001 --reason "Evidence reviewed"
kvdf validate capture
```

`--files` is optional. When it is not supplied, Kabeeri reads `git status --short` and ignores its own interaction capture file so capture does not keep recapturing itself.

## Changed File Detection

Use git status, explicit changed file lists, timestamps, and workspace state to detect changed scope. Never revert user work during capture.

Runtime stores both:

- `files_changed`: normalized file paths
- `file_details`: status-aware entries from git or manual input

## Classifications

- `matches_existing_task`
- `needs_new_task`
- `unapproved_scope`
- `exploration`
- `urgent_fix`
- `documentation_only`
- `converted_to_task`

## Lifecycle Status

- `captured`: recorded but not yet linked or converted
- `linked`: attached to an existing governed task
- `converted_to_task`: converted into a proposed task in `.kabeeri/tasks.json`
- `resolved`: reviewed and closed as a capture record
- `rejected`: reserved for future explicit rejection flows

## Task Matching

Kabeeri attempts a best-effort task match from:

- explicit `--task`
- detected workstreams
- similar task title words
- changed files inside task allowed file scopes

If no confident match exists, the capture remains `needs_new_task` and `kvdf vibe next` recommends:

```bash
kvdf capture convert capture-001
```

Conversion creates a normal proposed task with `source: capture:<capture_id>`, acceptance criteria from files/checks/risks, workstream and app metadata, and normal App Boundary Governance rules.

## Acceptance Review

Captured work should produce review notes: files changed, purpose, checks run, risks, missing tests, cost, and whether Owner verify is required.

Runtime records:

- `checks_run`
- `acceptance_evidence`
- `missing_evidence`
- `risk_level`
- `owner_verify_required`
- `recommended_next_action`

Owner verification is required for urgent, unapproved-scope, linked, converted, high-risk, or critical-risk captures.

## Dashboard And Validation

The live dashboard shows recent captures with task link, classification, workstreams, files, missing evidence, status, and next action.

`kvdf validate capture` checks capture IDs, duplicate records, required arrays, valid classifications/statuses, and task references for linked or converted captures.
