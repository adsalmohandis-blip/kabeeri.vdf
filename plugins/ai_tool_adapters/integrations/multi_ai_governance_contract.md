# ai_tool_adapter and multi_ai_governance Contract

This document defines the optional integration boundary between the capability
provider and the authority governor.

## Roles

### ai_tool_adapter

`ai_tool_adapter` provides capability.

It can:

- list available tools
- report tool readiness
- validate whether a contract can run
- execute a governed contract through the existing runner path
- read evidence for a previously recorded run

It must not:

- approve tasks
- approve merges
- create assignments
- own leader sessions or worker queues
- replace governance authority

### multi_ai_governance

`multi_ai_governance` provides authority.

It decides:

- whether an assignment is approved
- when a run should be authorized
- how task ownership and collaboration are governed
- whether a tool contract is allowed to proceed

## Integration Flow

1. `multi_ai_governance` reviews the task or assignment.
2. `multi_ai_governance` may call `provider.canRunContract(contract)` to confirm
   that the tool contract is valid and ready.
3. After owner approval, `multi_ai_governance` may call `provider.runContract(contract)`.
4. `ai_tool_adapter` records the governed run evidence in
   `.kabeeri/ai_tool_runs.jsonl`.

## Boundary Rule

`ai_tool_adapter` does not decide authority. It only tells the authority layer
whether a registered tool can accept a governed contract and it records the
resulting run evidence.
