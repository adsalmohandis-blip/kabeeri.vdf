# AI Cost Preflight Template

Use this template before expensive AI execution.

## Preflight Fields

```json
{
  "preflight_id": "preflight-001",
  "task_id": "task-001",
  "context_pack_id": "ctx-001",
  "requested_action": "implementation",
  "risk_level": "medium",
  "estimated_input_tokens": 12000,
  "estimated_output_tokens": 4000,
  "estimated_cached_tokens": 1000,
  "estimated_cost": 0.18,
  "currency": "USD",
  "budget_status": "within_budget",
  "recommended_path": "low_cost",
  "recommended_model_class": "balanced",
  "split_recommended": false,
  "approval_required": false
}
```

## Budget Status Values

- `within_budget`
- `near_warning`
- `near_limit`
- `over_budget`
- `unknown_pricing`

## Recommended Paths

- `template_first`
- `low_cost`
- `balanced`
- `premium`
- `split_task`
- `human_review_first`

## Output

Preflight should explain:

- why this path is recommended
- what context will be sent
- what cost range is expected
- what cheaper alternative exists
- whether Owner approval is required

