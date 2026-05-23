# AI Tool Adapters Provider API

`ai_tool_adapters` exposes a read-only provider API for capability discovery,
contract readiness, governed run evidence, and optional integration with
`multi_ai_governance`.

## What The Provider Does

- lists registered local AI tools
- summarizes tool capabilities and execution readiness
- validates run contracts without approving assignments
- reuses the governed runner path for accepted contracts
- reads evidence from `.kabeeri/ai_tool_runs.jsonl`

## What The Provider Does Not Do

- it does not create assignments
- it does not choose task authority
- it does not own leader sessions or queues
- it does not approve merges or releases
- it does not replace `multi_ai_governance`

## Provider Methods

- `getProviderInfo()`
- `ensureState()`
- `listAvailableTools(options)`
- `getToolCapabilities(toolId)`
- `canRunContract(contract, options)`
- `runContract(contract, options)`
- `getRunEvidence(runId)`
- `buildAdapterProviderReport(options)`

## Integration Rule

`multi_ai_governance` may consume this provider to check whether a contract is
ready before an owner-approved assignment is executed. The authority decision
still lives in `multi_ai_governance`; the provider only confirms capability and
records evidence.
