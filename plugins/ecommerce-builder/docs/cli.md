# Ecommerce Builder CLI

This is the exact CLI surface the plugin is expected to expose.

## Commands

```text
kvdf ecommerce status
kvdf ecommerce init [--mode store|marketplace|digital-products|subscription|services]
kvdf ecommerce questionnaire [--json]
kvdf ecommerce brief [--json]
kvdf ecommerce design [--json]
kvdf ecommerce modules [--json]
kvdf ecommerce tasks [--json]
kvdf ecommerce approve [--batch <id>] [--json]
kvdf ecommerce report [--json]
kvdf plugin install ecommerce-builder
kvdf plugin uninstall ecommerce-builder
kvdf plugin enable ecommerce-builder
kvdf plugin disable ecommerce-builder
```

## Expected outputs

### `kvdf ecommerce status`

Returns the current ecommerce build state.

```json
{
  "plugin_id": "ecommerce-builder",
  "status": "enabled|disabled",
  "project_mode": "store|marketplace|digital-products|subscription|services",
  "stage": "intake|brief|design|modules|tasks|approval|execution",
  "generated_at": "ISO-8601 timestamp",
  "blockers": [],
  "next_action": "kvdf ecommerce questionnaire"
}
```

### `kvdf ecommerce init`

Creates the project shell and records the archetype.

```json
{
  "project_id": "eco-<slug>",
  "plugin_id": "ecommerce-builder",
  "project_mode": "store",
  "track": "app",
  "state_path": ".kabeeri/ecommerce/<project_id>.json",
  "next_action": "kvdf ecommerce questionnaire"
}
```

### `kvdf ecommerce questionnaire`

Asks only unanswered ecommerce questions and stores answers durably.

```json
{
  "project_id": "eco-<slug>",
  "questions": [],
  "missing_answers": [],
  "answered_fields": [],
  "next_action": "kvdf ecommerce brief"
}
```

### `kvdf ecommerce brief`

Generates product, UI/UX, system, and data briefs.

```json
{
  "project_id": "eco-<slug>",
  "artifacts": {
    "product_brief": "path",
    "uiux_brief": "path",
    "system_brief": "path",
    "data_brief": "path"
  },
  "next_action": "kvdf ecommerce design"
}
```

### `kvdf ecommerce design`

Maps UI patterns and system design references to screens and modules.

```json
{
  "project_id": "eco-<slug>",
  "ui_patterns": [],
  "system_patterns": [],
  "page_map": [],
  "module_hints": [],
  "next_action": "kvdf ecommerce modules"
}
```

### `kvdf ecommerce modules`

Breaks the brief into implementation modules and dependencies.

```json
{
  "project_id": "eco-<slug>",
  "modules": [],
  "dependencies": [],
  "plugin_candidates": [],
  "next_action": "kvdf ecommerce tasks"
}
```

### `kvdf ecommerce tasks`

Produces detailed proposed tasks with acceptance criteria and file boundaries.

```json
{
  "project_id": "eco-<slug>",
  "proposed_tasks": [],
  "task_count": 0,
  "delivery_mode": "agile|structured",
  "next_action": "kvdf ecommerce approve"
}
```

### `kvdf ecommerce approve`

Packages the proposed tasks into approval-ready batches.

```json
{
  "project_id": "eco-<slug>",
  "batch_id": "eco-batch-001",
  "approved": false,
  "blockers": [],
  "next_action": "kvdf task assign"
}
```

### `kvdf ecommerce report`

Shows the full ecommerce build status and missing pieces.

```json
{
  "project_id": "eco-<slug>",
  "summary": {},
  "blockers": [],
  "next_actions": [],
  "artifacts": []
}
```

