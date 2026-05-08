# Sprint Cost Dashboard Spec

Sprint cost analytics show the cost of each Agile increment.

## Source Files

- `.kabeeri/ai_usage/sprint_costs.json`
- `agile_delivery/SPRINT_COST_METADATA_SCHEMA.json`

## Sections

- Current sprint total tokens and cost
- Previous sprint comparison
- Cost by story
- Cost by task
- Cost by developer/agent
- Cost by workstream
- Accepted vs rework vs untracked cost
- Budget warnings

## Pricing Note

Sprint price is broader than AI cost. Kabeeri v3 tracks AI token cost first; later layers may add developer time, review cost, and risk margin.
