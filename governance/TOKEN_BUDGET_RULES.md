# Token Budget Rules

Token budgets prevent unmanaged AI spend and support sprint, task, workstream, and developer cost analysis.

## Budget Shape

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

## Warning Rules

- At 75 percent usage, show a warning.
- At 90 percent usage, require acknowledgement.
- At 100 percent usage, block additional official usage unless Owner approval exists.

## Required Metrics

Cost analytics should support:

- cost by task
- cost by sprint
- cost by developer or AI Developer
- cost by workstream
- accepted cost
- rejected cost
- rework cost
- untracked cost

Budgets attach to task access tokens and AI usage sessions so permission and consumption remain connected but distinct.

