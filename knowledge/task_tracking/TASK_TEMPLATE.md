# Task Template

Copy this template into GitHub Issues, project documents, or local task files.

---

## Task title

```text
[Type] Short task name
```

Example:

```text
[Task Tracking] Define first task tracking format
```

## Task ID

```text
T001
```

## Status

Choose one:

```text
proposed
approved
ready
assigned
in_progress
review
owner_verified
rejected
blocked
done
closed
trashed
```

## Task type

Choose one:

```text
docs
generator
questionnaire
prompt-pack
task-tracking
acceptance
example
cli
review
release
```

## Related issue

```text
#6
```

## Related milestone

```text
v0.1.1
```

## Related folder

```text
task_tracking/
```

## Related prompt pack

```text
none
```

Use `none` when the task is not tied to a specific implementation stack.

## Goal

```text
Explain the goal of the task in one or two clear sentences.
```

## Why this task matters

```text
Explain why this task helps the framework, the developer, or the AI assistant.
```

## Scope

```text
- ...
- ...
- ...
```

## Out of scope

```text
- ...
- ...
- ...
```

## Required inputs

```text
- ...
- ...
- ...
```

## Allowed files and folders

```text
...
```

## Forbidden files and folders

```text
...
```

## Dependencies

```text
- T000
```

Use an empty list if there are no dependencies.

## Execution summary

```text
Summarize the task in one sentence so the next session can resume without chat history.
```

## Resume steps

```text
- Read the source record.
- Inspect only the allowed files.
- Apply the smallest coherent change.
- Run the listed checks.
```

## Execution inputs

```text
- ...
```

## Expected outputs

```text
- ...
```

## Do not change

```text
- ...
```

## Verification commands

```text
- npm test
```

## Tests/checks

```text
- Manual review
- git status
```

## AI execution instructions

```text
You are working inside Kabeeri Vibe Developer Framework.

Implement only this task.
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
Create or edit only the allowed files.
Keep the task memory fields in sync with the task record.
After finishing, explain:
1. What you changed.
2. Which files changed.
3. What should be reviewed.
4. What checks/tests should be run.
Stop after completing this task.
```

## Review checklist

```text
- [ ] The task stayed inside scope.
- [ ] Only allowed files were changed.
- [ ] No unrelated files were modified.
- [ ] The output is beginner-friendly.
- [ ] File names are clear.
- [ ] Instructions are clear.
- [ ] No real secrets were added.
- [ ] The task can be reviewed manually.
```

## Acceptance criteria

```text
- [ ] ...
- [ ] ...
- [ ] ...
```

## Suggested commit message

```bash
git commit -m "..."
```

## Closing line

```text
Closes #issue-number
```
