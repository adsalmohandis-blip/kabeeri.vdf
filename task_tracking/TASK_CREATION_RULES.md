# Task Creation Rules

This canonical v2 file records the task creation rules used by `task_tracking/`. The stricter policy explanation lives in [../task_governance/TASK_CREATION_RULES.md](../task_governance/TASK_CREATION_RULES.md).

## Required Fields

Every executable task must include:

- `id`
- `title`
- `status`
- `workstream` or `folder`
- `delivery_mode`
- `intake_mode`
- `source`
- `source_mode`
- `scope`
- `allowed_files`
- `forbidden_files`
- `acceptance_criteria`
- `creator`
- `assignee`
- `reviewer`

## Rule

No task may enter execution unless it has a source, approved scope, allowed/forbidden file boundaries, acceptance criteria, and reviewer separation.
