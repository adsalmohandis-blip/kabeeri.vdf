# AI Tool Adapters

`ai_tool_adapters` is a removable plugin for discovering, registering, and summarizing local AI tools.

Phase 1 is discovery and registration only:

- detect tool executables on `PATH`
- keep a local registry in `.kabeeri/ai_tool_adapters.json`
- allow manual registration and disablement
- never execute tools
- keep `execution_enabled` false by default

Phase 2 adds governed runner contracts and evidence logging:

- require an explicit run contract before execution
- require `--confirm` for any run attempt
- append evidence to `.kabeeri/ai_tool_runs.jsonl`
- keep `multi_ai_governance` as the authority layer
- keep execution disabled until a registry entry is explicitly enabled

Phase 3 adds the provider API and the optional integration contract for
`multi_ai_governance`:

- expose tool capability and readiness data
- validate whether a contract can run without approving assignments
- read run evidence from the local JSONL log
- keep `multi_ai_governance` as the authority layer
- keep this plugin focused on capability, contract checks, and evidence

## Commands

- `kvdf ai-tool-adapters status`
- `kvdf ai-tool-adapters scan`
- `kvdf ai-tool-adapters list`
- `kvdf ai-tool-adapters register --tool <tool> --path <path|auto> --editor <editor>`
- `kvdf ai-tool-adapters unregister --tool <tool-id>`
- `kvdf ai-tool-adapters show <tool-id>`
- `kvdf ai-tool-adapters test --tool <tool-id>`
- `kvdf ai-tool-adapters run --tool <tool-id> --contract <path> --confirm`
- `kvdf ai-tool-adapters runs`
- `kvdf ai-tool-adapters run-show <run-id>`
- `kvdf ai-tool-adapters provider`
- `kvdf ai-tool-adapters capabilities`
- `kvdf ai-tool-adapters can-run --contract <path>`
- `kvdf ai-tool-adapters evidence --run <run-id>`
- `kvdf ai-tool-adapters enable-execution --tool <tool-id> --confirm`
- `kvdf ai-tool-adapters disable-execution --tool <tool-id>`

## Boundary

This plugin connects to AI tools. It does not govern assignments.

`multi_ai_governance` governs authority, leader sessions, queues, merges, and collaboration rules.
`multi_ai_governance` also owns any future assignment contract that authorizes a run.
The provider API is optional and can be consumed by `multi_ai_governance`, but it
does not approve work or create assignments by itself.

## Runtime State

The local runtime state lives in:

`.kabeeri/ai_tool_adapters.json`

That file is local workspace state only and is not a published source artifact.
Run evidence logs live in:

`.kabeeri/ai_tool_runs.jsonl`

That file is append-only evidence for governed runner attempts.
