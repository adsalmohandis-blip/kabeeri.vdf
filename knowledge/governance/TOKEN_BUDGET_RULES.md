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
- exploration cost
- urgent incident cost

## Budget Levels

Budgets can be defined at these levels:

- task budget
- sprint budget
- workstream budget
- developer or AI Developer budget
- project budget
- exploration or learning budget

## Over-Budget Approval

Over-budget execution requires:

- Owner or Maintainer approval based on policy
- reason for continuing
- expected value of the extra spend
- link to task, sprint, or exploration budget
- audit event
- expiry or revocation path for temporary approval

Budgets attach to execution-scoped task access tokens and AI usage sessions so permission, boundaries, and consumption remain connected but distinct. See `EXECUTION_SCOPE_GOVERNANCE.md`.
