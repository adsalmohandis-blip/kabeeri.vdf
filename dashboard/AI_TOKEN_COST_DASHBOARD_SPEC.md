# AI Token Cost Dashboard Spec

This dashboard shows AI usage tokens and cost by meaningful project dimensions.

## Source Files

- `.kabeeri/ai_usage/usage_events.jsonl`
- `.kabeeri/ai_usage/pricing_rules.json`
- `.kabeeri/ai_usage/random_usage_report.json`

## Required Breakdowns

- Total tokens and total cost
- Version
- Milestone
- Sprint
- Task
- Developer or AI agent
- Workstream
- Provider/model
- Accepted/rejected/rework/untracked usage

## Calculator Rules

- Pricing must be user-configured.
- Support input, output, and cached token prices.
- Support per token, per 1K, and per 1M units.
- Support currency field.
- Do not hard-code provider pricing.
