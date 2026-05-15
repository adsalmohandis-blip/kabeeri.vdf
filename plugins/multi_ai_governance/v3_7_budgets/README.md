# v3.7.0 - Token Budgets and Cost Controls

Goal: prevent unmanaged AI token consumption and support cost analysis.

## Task Budget Fields

```json
{
  "task_id": "task-001",
  "max_input_tokens": 20000,
  "max_output_tokens": 20000,
  "max_total_tokens": 50000,
  "max_cost": 10.0,
  "currency": "USD",
  "approval_required_over_budget": true
}
```

Budgets are linked to Task Access Tokens and AI usage sessions.

## Warning Rules

- At 75 percent budget use: show warning.
- At 90 percent budget use: require acknowledgement.
- At 100 percent budget use: block additional official usage unless Owner approval exists.

## Dashboard Metrics

Cost control dashboard should show:

- cost by task
- cost by sprint
- cost by developer/AI Developer
- cost by workstream
- accepted cost
- rejected cost
- rework cost
- untracked cost

## Acceptance Criteria

- Every task can have a budget.
- Budget overrun requires approval.
- Cost metrics are clear.

