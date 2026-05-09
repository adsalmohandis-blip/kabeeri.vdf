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
- `.kabeeri/ai_usage/usage_summary.json`
- `.kabeeri/ai_usage/cost_breakdown.json`
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

## AI Usage Accounting

Kabeeri separates task access tokens from AI usage tokens.

- task access tokens grant scoped permission to work
- AI usage tokens measure input, output, cached tokens, and cost

AI usage accounting records:

- task
- sprint
- workstream
- developer or AI agent
- provider and model
- input tokens
- output tokens
- cached tokens
- cost
- tracked vs untracked usage
- accepted, rejected, rework, exploration, and urgent incident cost

Main commands:

```bash
kvdf pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500
kvdf usage record --untracked --input-tokens 1000 --output-tokens 500 --source ad-hoc-prompt
kvdf usage summary
kvdf usage efficiency
kvdf usage report --output usage-report.md
```

Untracked usage should be logged instead of hidden. Later it can be linked to a
task, moved to an exploration budget, or used as evidence that a task should be
created.

## Budget Levels

Budgets can apply to:

- task
- sprint
- workstream
- developer or AI agent
- project
- exploration or learning budget

At 75 percent usage, Kabeeri should warn. At 90 percent, it should require
acknowledgement. At 100 percent, official usage should be blocked unless an
active approval covers the overrun.

The canonical governance policy for budget approval lives in
[../governance/TOKEN_BUDGET_RULES.md](../governance/TOKEN_BUDGET_RULES.md).
