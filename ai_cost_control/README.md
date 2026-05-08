# AI Cost Control

This layer defines how Kabeeri reduces AI/Codex cost without hiding useful AI usage or blocking normal work.

The goal is not to shame exploration. The goal is to make cost visible, route work to the cheapest safe path, and require approval before expensive or risky AI execution.

## Principles

- Use the smallest useful context.
- Prefer templates, structured specs, and existing summaries before premium AI runs.
- Estimate cost before high-risk or large-context work.
- Split broad tasks into smaller scoped tasks.
- Track unplanned AI usage instead of hiding it.
- Treat task access tokens and AI usage tokens as separate concepts.
- Let Owner approval override budgets only with an audit trail.

## Source Files

- `.kabeeri/ai_usage/usage_events.jsonl`
- `.kabeeri/ai_usage/pricing_rules.example.json`
- `.kabeeri/ai_usage/sprint_costs.example.json`
- `.kabeeri/ai_usage/random_usage_report.example.json`
- `.kabeeri/ai_usage/context_pack.example.json`
- `.kabeeri/ai_usage/cost_preflight.example.json`
- `.kabeeri/ai_usage/model_routing.example.json`
- `.kabeeri/ai_usage/budget_policy.example.json`

## Specs

- `LOW_COST_DEVELOPMENT_MODE.md`
- `TASK_CONTEXT_PACK_RULES.md`
- `AI_COST_PREFLIGHT_TEMPLATE.md`
- `MODEL_ROUTING_RULES.md`
- `TOKEN_BUDGET_RULES.md`
- `RANDOM_USAGE_DETECTION_RULES.md`
- `SPRINT_COST_CONTROL.md`
- `COST_SAVING_STRATEGIES.md`

