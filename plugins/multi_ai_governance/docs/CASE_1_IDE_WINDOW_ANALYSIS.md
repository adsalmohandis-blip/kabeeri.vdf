# Case 1 Analysis: IDE Window Governance

## What Already Exists

The `multi_ai_governance` plugin is already a real removable bundle with a working command surface, bootstrap entrypoint, docs, runtime state, and tests.

Existing plugin surfaces:

- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- `plugins/multi_ai_governance/commands/multi_ai_communications.js`
- `plugins/multi_ai_governance/commands/wifi_packets.js`
- `plugins/multi_ai_governance/schemas/multi-ai-wifi-packet.schema.json`
- `plugins/multi_ai_governance/tests/wifi_packet_workflow.contract.test.js`
- `plugins/multi_ai_governance/tests/wifi_packet_decision.contract.test.js`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/docs/index.md`

Current command convention:

- Canonical family: `kvdf multi-ai ...`
- Existing sub-families: `status`, `leader`, `agent`, `conversation`, `queue`, `merge`, `sync`, and `wifi`
- The repo already uses alias-style command routing for other plugins, but there is no existing top-level `ai` command family in the CLI router

Current authority model already present:

- `multi_ai_governance` is the authority layer
- `.kabeeri` is the runtime source of truth
- GitHub remains source-control truth
- `ai_tool_adapters` is an optional capability provider, not the authority layer

Current runtime state already in `.kabeeri` that can be reused:

- `.kabeeri/multi_ai_governance.json`
- `.kabeeri/multi_ai_communications.json`
- `.kabeeri/multi_ai_wifi_packets.json`
- `.kabeeri/ai_tool_adapters.json`
- `.kabeeri/ai_tool_policy_results.json`
- `.kabeeri/agents.json`
- `.kabeeri/locks.json`
- `.kabeeri/tokens.json`
- `.kabeeri/tasks.json`
- `.kabeeri/audit_log.jsonl`
- `.kabeeri/session.json`
- `.kabeeri/session_track.json`

Existing governance concepts already available in the repo:

- leader sessions
- agent registrations and heartbeats
- worker queues
- merge bundles
- token and lock governance
- task ownership and task verification
- audit logging
- policy result recording
- optional tool adapter scanning and execution gates

## What Is Partial

The plugin already covers multi-AI collaboration, but it does not yet model IDE-local window governance.

Partial coverage relevant to Case 1:

- `ai_tool_adapters` already discovers local AI tools and records policy results, but it does not model IDE windows, task/file/folder leases, or IDE conflict arbitration
- `multi_ai_governance` already tracks agents, queues, and leader sessions, but it does not track per-IDE-window presence
- `locks.json` and `tokens.json` already exist, but they are task/token-oriented rather than IDE-window session and lease oriented
- `audit_log.jsonl` already records events, but there is no IDE-specific decision/evidence trail yet

## What Is Missing

Case 1 needs a new IDE-window governance layer inside the existing `multi_ai_governance` plugin.

Missing capabilities:

- IDE window identity and workspace registration
- AI tool presence inside a specific IDE window
- IDE agent-session tracking tied to window and workspace
- task/file/folder lease records for IDE-local work
- conflict detection for same-file, denied-path, expired-lease, and out-of-scope edits
- policy decisions that can `allow`, `warn`, `block`, or `require_owner_approval`
- IDE-specific audit/evidence records
- dedicated docs and tests for IDE governance behavior

## What Should Be Reused

Reuse instead of duplicating:

- `multi_ai_governance` as the authority layer
- `ai_tool_adapters` as the tool capability provider and discovery source
- existing `.kabeeri` runtime patterns for durable JSON/JSONL state
- existing audit logging conventions
- existing plugin bootstrap and plugin loader conventions
- existing CLI command style and response/report style
- existing schema registry pattern under `schemas/runtime/schema_registry.json`
- existing task/lock/token concepts as related authority signals, not as the new IDE model itself

## What Must Not Be Duplicated

Do not duplicate:

- AI tool discovery logic from `ai_tool_adapters`
- source-control or GitHub governance logic
- Wi-Fi/LAN packet transport logic
- leader/queue/merge governance already handled by the existing plugin
- generic task token logic already present in `tokens.json`
- generic lock logic already present in `locks.json`

## Files That Are Likely to Change

Plugin files:

- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- new IDE governance command module(s) under `plugins/multi_ai_governance/commands/`
- new IDE governance docs under `plugins/multi_ai_governance/docs/`
- new schema files under `plugins/multi_ai_governance/schemas/`
- new tests under `plugins/multi_ai_governance/tests/`

Core repo files:

- `schemas/runtime/schema_registry.json`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- possibly `src/cli/index.js` if a new CLI alias is added
- possibly `src/cli/commands/multi_ai_governance.js` if the command handler is extended from the core side

## Tests That Should Be Added

Tests should cover:

- registering an IDE window
- registering AI tool presence
- creating a lease
- detecting a same-file conflict
- blocking a denied path
- warning on an ungoverned change
- requiring owner approval for a high-risk action
- writing audit records

## Runtime Files That Should Be Added

Recommended new runtime files under `.kabeeri/multi_ai_governance/`:

- `ide_window_sessions.json`
- `ide_tool_presence.json`
- `ide_agent_sessions.json`
- `ide_leases.json`
- `ide_conflicts.json`
- `ide_policy_decisions.json`
- `ide_approval_requests.json`
- `ide_audit_log.json`

## Summary

The plugin is already real and stable enough to extend. Case 1 is not about creating a new plugin or replacing the current multi-AI governance layer. It is about adding a new IDE-window governance branch inside the existing bundle, while reusing the adapter plugin and the existing durable `.kabeeri` state patterns.
