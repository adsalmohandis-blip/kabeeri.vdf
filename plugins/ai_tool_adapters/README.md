# AI Tool Adapters

`ai_tool_adapters` is a removable plugin for discovering, registering, and summarizing local AI tools.

Phase 1 is discovery and registration only:

- detect tool executables on `PATH`
- keep a local registry in `.kabeeri/ai_tool_adapters.json`
- allow manual registration and disablement
- never execute tools
- keep `execution_enabled` false by default

## Commands

- `kvdf ai-tool-adapters status`
- `kvdf ai-tool-adapters scan`
- `kvdf ai-tool-adapters list`
- `kvdf ai-tool-adapters register --tool <tool> --path <path|auto> --editor <editor>`
- `kvdf ai-tool-adapters unregister --tool <tool-id>`
- `kvdf ai-tool-adapters show <tool-id>`

## Boundary

This plugin connects to AI tools. It does not govern assignments.

`multi_ai_governance` governs authority, leader sessions, queues, merges, and collaboration rules.

## Runtime State

The local runtime state lives in:

`.kabeeri/ai_tool_adapters.json`

That file is local workspace state only and is not a published source artifact.
