# AI Tool Adapter Architecture

`ai_tool_adapter` is a KVDF plugin that governs access to local AI tools.
It is an integration and policy layer, not an approval authority and not a
replacement for `multi_ai_governance`.

## Architecture Summary

- **KVDF core** loads and routes the plugin.
- **`ai_tool_adapter`** discovers, registers, validates, and reports on tools.
- **External AI tools** are treated as workers or executors, not sources of truth.
- **`multi_ai_governance`** remains the authority plugin that decides who gets work.
- **GitHub / repository state** remains the source of truth for source code.

## Current Implementation Surfaces

- discovery and registry state in `commands/tool_scan.js` and `commands/tool_registry.js`
- fail-closed policy checks in `commands/policy_gate.js`
- governed run contracts and direct spawn runner in `commands/run_contract.js` and `commands/tool_runner.js`
- run evidence in `.kabeeri/ai_tool_runs.jsonl`
- policy results in `.kabeeri/ai_tool_policy_results.json`
- provider API in `provider.js`
- dashboard, readiness, evidence, and audit visibility in their respective commands
- schemas under `schemas/`
- tests under `tests/`

## Control Model

`ai_tool_adapter` controls:

- what tool is registered
- whether execution is enabled
- whether a run contract is valid
- whether a run is blocked
- what evidence is written
- what read-only visibility reports are produced

It does not control:

- assignment authority
- queue leadership
- merge approval
- repository ownership
- source-of-truth state for tasks or workstreams

## Current Limitations

- no live adapters for every tool yet
- no MCP governance surface in this phase
- no auto-approval
- no auto-merge
- no general shell wrapper behavior
- no external dependency integration beyond local executable discovery
