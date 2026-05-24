# Multi-AI Governance Authority

`multi_ai_governance` is the authority plugin for governed multi-agent work.
`ai_tool_adapter` may consume it, but never replaces it.

## Authority Responsibilities

- decide assignment authority
- govern queues and handoffs
- control work ordering
- manage collaboration and leadership state
- authorize work before a run is attempted

## Adapter Responsibilities

`ai_tool_adapter` may:

- report capability and readiness
- validate contracts
- execute only after policy pass and confirmation
- write evidence

It may not:

- approve assignments
- decide queue ownership
- create itself as the source of truth
- grant itself execution authority

## Practical Rule

If there is a question of authority, the answer belongs to
`multi_ai_governance`, not the adapter plugin.
