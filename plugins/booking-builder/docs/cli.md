# Booking Builder CLI

This is the exact CLI surface the plugin is expected to expose.

## Commands

```text
kvdf booking status
kvdf booking init [--mode appointments|services|classes|hotels|events]
kvdf booking questionnaire [--json]
kvdf booking brief [--json]
kvdf booking design [--json]
kvdf booking modules [--json]
kvdf booking tasks [--json]
kvdf booking approve [--batch <id>] [--json]
kvdf booking report [--json]
kvdf plugins install booking-builder
kvdf plugins uninstall booking-builder
kvdf plugins enable booking-builder
kvdf plugins disable booking-builder
```

## Expected outputs

### `kvdf booking status`

Returns the current booking build state.

```json
{
  "plugin_id": "booking-builder",
  "status": "enabled|disabled",
  "project_mode": "appointments|services|classes|hotels|events",
  "stage": "intake|brief|design|modules|tasks|approval|execution",
  "generated_at": "ISO-8601 timestamp",
  "blockers": [],
  "next_action": "kvdf booking questionnaire"
}
```

### `kvdf booking init`

Creates the project shell and records the booking archetype.

```json
{
  "project_id": "book-<slug>",
  "plugin_id": "booking-builder",
  "project_mode": "appointments",
  "track": "app",
  "state_path": ".kabeeri/booking/<project_id>.json",
  "next_action": "kvdf booking questionnaire"
}
```

### `kvdf booking questionnaire`

Asks only unanswered booking questions and stores answers durably.

```json
{
  "project_id": "book-<slug>",
  "questions": [],
  "missing_answers": [],
  "answered_fields": [],
  "next_action": "kvdf booking brief"
}
```

### `kvdf booking brief`

Generates product, UI/UX, system, and data briefs.

```json
{
  "project_id": "book-<slug>",
  "artifacts": {
    "product_brief": "path",
    "uiux_brief": "path",
    "system_brief": "path",
    "data_brief": "path"
  },
  "next_action": "kvdf booking design"
}
```

### `kvdf booking design`

Maps booking-specific UI patterns and system design references to screens and modules.

```json
{
  "project_id": "book-<slug>",
  "ui_patterns": [],
  "system_patterns": [],
  "page_map": [],
  "module_hints": [],
  "next_action": "kvdf booking modules"
}
```

### `kvdf booking modules`

Breaks the brief into implementation modules and dependencies.

```json
{
  "project_id": "book-<slug>",
  "modules": [],
  "dependencies": [],
  "plugin_candidates": [],
  "next_action": "kvdf booking tasks"
}
```

### `kvdf booking tasks`

Produces detailed proposed tasks with acceptance criteria and file boundaries.

```json
{
  "project_id": "book-<slug>",
  "proposed_tasks": [],
  "task_count": 0,
  "delivery_mode": "agile|structured",
  "next_action": "kvdf booking approve"
}
```

### `kvdf booking approve`

Packages the proposed tasks into approval-ready batches.

```json
{
  "project_id": "book-<slug>",
  "batch_id": "book-batch-001",
  "approved": false,
  "blockers": [],
  "next_action": "kvdf task assign"
}
```

### `kvdf booking report`

Shows the full booking build status and missing pieces.

```json
{
  "project_id": "book-<slug>",
  "summary": {},
  "blockers": [],
  "next_actions": [],
  "artifacts": []
}
```
