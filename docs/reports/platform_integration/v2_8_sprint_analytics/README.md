# v2.8.0 - Agile Sprint Cost Analytics

Goal: price each Sprint and learn from each delivered increment.

## Sprint Cost Model

Each sprint should include:

- `sprint_id`
- `version`
- `start_date`
- `end_date`
- `total_tokens`
- `total_cost`
- `currency`
- `by_story`
- `by_task`
- `by_developer`
- `by_workstream`
- `accepted_cost`
- `rework_cost`
- `untracked_cost`

## Dashboard View

Sprint dashboard should show:

- current sprint cost
- previous sprint cost
- cost trend
- backend/public frontend/admin frontend comparison
- untracked usage warning
- cost per accepted story
- cost per story point, when story points exist

## Pricing Notes

Sprint price is not only AI token cost.

Recommended pricing formula:

```text
Sprint Price = AI token cost + developer time + review cost + risk margin
```

Kabeeri v3.0.0 starts with AI token cost because it is measurable early. Later releases can add labor cost, review cost, infrastructure, and margin modeling.

## Acceptance Criteria

- Sprint cost model is documented.
- Sprint dashboard view is documented.
- Pricing notes explain the full commercial model clearly.

