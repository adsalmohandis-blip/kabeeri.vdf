# Task Context Pack Rules

A task context pack is a compact bundle of the minimum useful context for a task.

## Purpose

Context packs reduce AI cost by replacing broad repository ingestion with a focused, reviewable package.

## Required Fields

- `context_pack_id`
- `task_id`
- `source_reference`
- `workstream`
- `goal`
- `allowed_files`
- `forbidden_files`
- `required_specs`
- `acceptance_criteria`
- `memory_summary`
- `open_questions`
- `estimated_tokens`
- `estimated_cost`

## Included Context

Include only:

- task source and acceptance criteria
- relevant specs/templates
- file paths and short summaries
- exact snippets only when needed
- prior decisions and constraints from memory
- risks, forbidden files, and locks

## Excluded Context

Exclude:

- secrets and credentials
- unrelated folders
- raw large generated files
- full repository dumps unless explicitly approved
- raw design/image/PDF interpretation without approved text specs

## Review Rule

Users should be able to inspect a context pack before AI execution, especially when the estimated cost is medium or high.

