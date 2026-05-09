# Acceptance Decisions

This file defines the decision values used by Kabeeri VDF acceptance checklists.

## Decision values

```text
accepted
needs_changes
blocked
rejected
not_applicable
```

## accepted

Use when:

```text
- The output matches the task.
- Checklist items pass.
- Remaining risks are acceptable.
- The task can move to Done.
```

## needs_changes

Use when:

```text
- The output is close but needs fixes.
- Some checklist items failed.
- AI should revise the output.
- The issue should stay open.
```

## blocked

Use when:

```text
- The reviewer cannot decide yet.
- Required information is missing.
- Another task must be completed first.
- A technical or product decision is needed.
```

## rejected

Use when:

```text
- The output does not match the task.
- The output is unsafe.
- The output modifies unrelated files heavily.
- It is better to redo the task.
```

## not_applicable

Use when:

```text
- A checklist item does not apply to the task.
- A test/check is impossible or irrelevant.
- The task is documentation-only and code tests are not needed.
```

## Recommended GitHub usage

```text
accepted      → move card to Done and close issue
needs_changes → keep card in In Progress or Review
blocked       → add blocked label
rejected      → reopen or redo task
not_applicable → explain in review notes
```
