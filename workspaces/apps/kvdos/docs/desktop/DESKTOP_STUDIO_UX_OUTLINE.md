# KVDOS Desktop Studio UX Outline

The first desktop version should present KVDOS as a clear, IDE-like control surface.
It is preview-only and uses a read-only generated snapshot when available, with
a demo snapshot / fixture fallback in v1.5.

## Home

- Purpose: orient the user and explain the current KVDOS state
- Source command/data: `npm run status`, roadmap docs, current release notes
- First version UI behavior: show product status, current next action, and recent readiness notes
- Empty state: explain that KVDOS is initialized but no task is selected
- Risk / warning text: "Read-only Desktop Preview: this is a control surface, not an execution engine."

## Project Status

- Purpose: summarize the current workspace health
- Source command/data: `npm run status`
- First version UI behavior: show validation status, task counts, and next READY task
- Empty state: show a clear no-data status if the store is empty
- Risk / warning text: "Read-only Desktop Preview: status reflects local KVDOS state only."

## Tasks

- Purpose: browse local tasks
- Source command/data: `npm run task:list`, `npm run task:show`
- First version UI behavior: table or list view with details panel
- Empty state: "No tasks found."
- Risk / warning text: "Read-only Desktop Preview: tasks are local governance items, not executed work."

## Dependencies

- Purpose: inspect dependency graph and slices
- Source command/data: `npm run studio:dependencies`
- First version UI behavior: show upstream, downstream, blocked, and ready-slice panels
- Empty state: show that no dependency graph is available yet
- Risk / warning text: "Read-only Desktop Preview: this is navigation and diagnosis, not execution."

## Validation

- Purpose: show project/spec validation
- Source command/data: `npm run validate`
- First version UI behavior: show pass/fail state and summary text
- Empty state: explain that validation has not been run in the current view
- Risk / warning text: "Read-only Desktop Preview: validation does not execute tasks."

## Reports

- Purpose: surface readiness and review outputs
- Source command/data: `npm run queue:status`, release notes, verification docs
- First version UI behavior: show readiness reports and handoff notes
- Empty state: "No reports available yet."
- Risk / warning text: "Read-only Desktop Preview: reports are read-only and do not change task state."

## Settings

- Purpose: show local-only configuration and UI preferences
- Source command/data: local config files and future desktop settings
- First version UI behavior: keep settings minimal and local-first
- Empty state: explain that settings are intentionally narrow in the first version
- Risk / warning text: "Read-only Desktop Preview: settings do not unlock execution or cloud behavior."
