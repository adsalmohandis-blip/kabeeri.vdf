# AI Tool Adapter Fail-Closed Policy

`ai_tool_adapter` is the canonical optional plugin for AI tool discovery,
registration, provider summaries, contract validation, governed execution, and
run evidence. KVDF Core only routes to the plugin and never emulates its tool
logic.

## Fail-Closed Rules

- if a tool is not registered, it is `unknown`
- if execution is not enabled, it cannot run
- if there is no run contract, it cannot run
- if the `ai_tool_adapters` plugin is missing or disabled, execution-related
  commands fail closed
- Core must not create `.kabeeri/ai_tool_adapters.json`
- Core must not append `.kabeeri/ai_tool_runs.jsonl`

## Core Boundary

Core may:

- route `kvdf ai-tool-adapter` and legacy `kvdf ai-tool-adapters` aliases to the plugin
- show a read-only unavailable report when the plugin is missing or disabled
- validate CLI schema and command wiring

Core may not:

- scan local tools
- register tools
- enable execution
- run contracts
- write run evidence
- synthesize AI tool readiness outside the plugin

## Authority Boundary

`multi_ai_governance` remains the authority layer for assignment and approval.
It may consume the provider API, but it does not move authority into the
adapter plugin.
