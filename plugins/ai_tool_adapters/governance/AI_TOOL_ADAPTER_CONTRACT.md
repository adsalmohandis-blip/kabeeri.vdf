# AI Tool Adapter Contract

`ai_tool_adapter` is the local discovery and registration layer for AI tools.
The bundle lives in `plugins/ai_tool_adapters/` for compatibility, but the
public-facing identity is singular.

## What It Does

- detects common AI and developer tools on `PATH`
- records a local registry of discovered or manually registered tools
- summarizes the tools available in the current workspace
- keeps `execution_enabled` disabled by default until explicitly changed

## What It Does Not Do

- it does not execute tools by default
- it does not assign tasks
- it does not claim authority over agents or queues
- it does not replace `multi_ai_governance`
- it does not add external dependencies
- it does not become a general shell wrapper

## Governance Boundary

This plugin connects to tools.
It does not govern who is allowed to work.

`multi_ai_governance` remains the authority layer for:

- agent leadership
- queue ordering
- merge bundles
- collaboration state
- governance around multi-agent execution

## Runtime Policy

Default policy:

- `execution_default`: `disabled`
- `manual_registration_allowed`: `true`
- `external_dependencies_allowed`: `false`

## Governed Runner Boundary

The plugin only runs a local tool when all of the following are true:

- a valid run contract exists
- the tool is registered
- execution is enabled for that tool
- policy evaluation passes
- `--confirm` is provided
- the command is executed through direct spawn with `shell: false`

## State File

The plugin owns the local state file:

`.kabeeri/ai_tool_adapters.json`

The state file is registry and scan history data, not task authority data.
