# Suggested Task Card

Suggested task cards are the bridge between natural language and governed execution.

## Card Shape

```json
{
  "suggestion_id": "suggestion-001",
  "source_intent_id": "intent-001",
  "title": "Add theme settings screen",
  "workstream": "admin_frontend",
  "task_type": "feature",
  "summary": "Create an admin screen for editing theme colors.",
  "allowed_files": ["admin/", "src/admin/"],
  "forbidden_files": [".env", "secrets/"],
  "acceptance_criteria": [
    "Admin can edit primary, secondary, and background colors.",
    "Preview updates before saving.",
    "Contrast warning is shown before invalid colors are accepted."
  ],
  "risk_level": "medium",
  "estimated_cost_level": "medium",
  "approval_required": true,
  "status": "suggested"
}
```

## Status Values

- `suggested`
- `edited`
- `approved`
- `rejected`
- `converted_to_task`
- `deferred`

## Rules

- Cards are editable before approval.
- High-risk cards must explain why approval is required.
- Cards can create one task or a split set of tasks.
- High-risk or integration cards should be approved before conversion.

## Approval Flow

```text
natural language
-> suggested task card
-> approve or reject
-> convert to governed task
-> assign/token/lock/session
-> execute
-> review
-> Owner verification
```

```bash
kvdf vibe approve suggestion-001 --actor owner-001
kvdf vibe reject suggestion-001 --reason "Too broad"
kvdf vibe convert suggestion-001
```

Approval records intent that the suggestion is valid work. Conversion creates
the governed task. Execution still happens through normal task governance.
