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

