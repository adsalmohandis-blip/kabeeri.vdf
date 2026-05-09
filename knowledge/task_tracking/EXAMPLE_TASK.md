# Example Task

## Task title

```text
[Task Tracking] Define first task tracking format
```

## Task ID

```text
T006
```

## Status

```text
in_progress
```

## Task type

```text
task-tracking
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

## Goal

Create the first task tracking format for Kabeeri VDF so contributors and vibe developers can manage AI implementation work in small, reviewable steps.

## Why this task matters

Kabeeri VDF depends on controlled AI execution.

Without a task format, users may ask AI to build too much at once, lose track of changed files, or close issues before reviewing the output.

## Scope

```text
- Improve task_tracking/README.md.
- Improve task.schema.example.json.
- Add a reusable task schema.
- Add task state documentation.
- Add review checklist.
- Add AI execution log template.
- Add one example task.
```

## Out of scope

```text
- Do not build the CLI.
- Do not edit prompt packs.
- Do not edit generator files.
- Do not add GitHub Actions.
```

## Allowed files and folders

```text
task_tracking/
```

## Forbidden files and folders

```text
docs/
generators/
questionnaires/
prompt_packs/
acceptance_checklists/
examples/
.github/
LICENSE
```

## Acceptance criteria

```text
- A task tracking README exists.
- A reusable task template exists.
- Task states are documented.
- A JSON schema exists.
- A JSON example exists.
- A review checklist exists.
- An AI execution log template exists.
- The format is easy for beginners and useful with GitHub Issues.
```

## Suggested commit message

```bash
git commit -m "Define first task tracking format for v0.1.1

Closes #6"
```
