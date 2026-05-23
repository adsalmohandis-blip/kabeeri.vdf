# AI Tool Adapter Contract

`ai_tool_adapters` is the local discovery and registration layer for AI tools.

## What It Does

- detects common AI and developer tools on `PATH`
- records a local registry of discovered or manually registered tools
- summarizes the tools available in the current workspace
- keeps `execution_enabled` disabled in Phase 1

## What It Does Not Do

- it does not execute tools
- it does not assign tasks
- it does not claim authority over agents or queues
- it does not replace `multi_ai_governance`
- it does not add external dependencies

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

Default policy for Phase 1:

- `execution_default`: `disabled`
- `manual_registration_allowed`: `true`
- `external_dependencies_allowed`: `false`

## Safety Rules

- do not execute tools during discovery
- do not enable execution in Phase 1
- do not depend on external libraries
- keep registry changes local to the workspace

## State File

The plugin owns the local state file:

`.kabeeri/ai_tool_adapters.json`

The state file is a registry and scan history, not a task authority store.
