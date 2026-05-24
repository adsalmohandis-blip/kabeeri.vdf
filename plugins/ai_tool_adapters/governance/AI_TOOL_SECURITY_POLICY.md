# AI Tool Security Policy

`ai_tool_adapter` is a local safety and evidence layer for AI tool runs.
It is not an authority layer and does not decide assignments, ownership,
worker queues, or merge decisions.

## Scope

- validate whether a local tool run contract is safe enough to proceed
- record policy results in `.kabeeri/ai_tool_policy_results.json`
- redact obvious secret-like values from policy previews and evidence output
- fail closed when contracts are missing, invalid, or unsafe

## Default Posture

- tool execution is disabled by default
- `multi_ai_governance` remains the authority layer
- `ai_tool_adapter` only checks local tool-run safety
- KVDF Core must not mutate adapter runtime state

## Fail-Closed Behavior

- missing contract: blocked
- unregistered tool: blocked
- disabled execution: blocked
- unsafe command text: blocked
- unsafe working directory: blocked
- timeout above the limit: blocked
- confirm missing for an execution request: warn, and the run must not proceed

## Redaction

Policy results and evidence must not print obvious secrets.
The plugin redacts obvious key/value patterns such as:

- `API_KEY=`
- `TOKEN=`
- `SECRET=`
- `PASSWORD=`
- `OPENAI_API_KEY=`
- `ANTHROPIC_API_KEY=`

## Authority Boundary

`multi_ai_governance` may later approve assignments and hand contracts to the
adapter, but `ai_tool_adapter` never approves tasks or merges.
It only validates whether a given tool run contract is safe enough to continue.
