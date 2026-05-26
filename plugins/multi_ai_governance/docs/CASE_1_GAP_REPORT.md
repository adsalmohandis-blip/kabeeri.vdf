# Case 1 Gap Report: IDE Window Governance

## Current State

The existing `multi_ai_governance` plugin already governs:

- leader sessions
- agent entries and heartbeats
- worker queues
- merge bundles
- conversation relay
- optional Wi-Fi packet transport

It does not yet govern a single IDE window workspace as a first-class unit.

## Partial Coverage

The repo already has nearby pieces that can be reused:

- `ai_tool_adapters` discovers local AI tools and stores registry/policy state
- `.kabeeri/ai_tool_adapters.json` already contains detected local tool metadata
- `.kabeeri/ai_tool_policy_results.json` already stores policy decisions for tool execution
- `locks.json` and `tokens.json` already model scope and release, but not IDE window leases
- `audit_log.jsonl` already exists for durable evidence

These are useful signals, but they do not implement Case 1 by themselves.

## Missing Pieces

### 1. IDE Window Identity

Missing:

- `ide_window_id`
- `workspace_id`
- `project_id`
- `repo_root`
- `active_task_id`
- `owner_id`
- `opened_at`
- `last_seen_at`
- `status`

### 2. Tool Presence In Window

Missing:

- `tool_id`
- `tool_name`
- `agent_id`
- `session_id`
- `ide_window_id`
- `workspace_id`
- `task_id`
- `status`
- `last_seen_at`
- `capabilities`

### 3. IDE Leases

Missing:

- `lease_id`
- `lease_type` values for `task`, `file`, `folder`
- `scope`
- `allowed_paths`
- `denied_paths`
- `expires_at`
- IDE-specific lease release flow

### 4. Conflict Detection

Missing conflict checks for:

- two AI tools editing the same file
- editing a denied path
- editing without an active task
- editing outside the allowed task scope
- expired lease still being used
- high-risk path changed without owner approval

### 5. Policy And Approval Flow

Missing:

- decision output with `allow`, `warn`, `block`, or `require_owner_approval`
- evidence ID and timestamp on each decision
- explicit owner approval request records
- IDE-specific audit log entries

### 6. CLI Exposure

The existing CLI convention is `kvdf multi-ai ...`.

Missing or not yet present:

- `kvdf multi-ai ide status`
- `kvdf multi-ai ide register`
- `kvdf multi-ai ide tool`
- `kvdf multi-ai ide lease`
- `kvdf multi-ai ide release`
- `kvdf multi-ai ide conflicts`
- `kvdf multi-ai ide policy`

If a future alias for `kvdf ai ide ...` is desired, it should be added carefully as an alias, not as a new competing command family.

## Reuse Targets

Reuse these existing assets:

- plugin loader and bootstrap wiring
- `multi_ai_governance` authority model
- `ai_tool_adapters` discovery and provider integration
- `.kabeeri` JSON/JSONL state storage
- audit logging helpers
- existing plugin manifest and schema registry patterns
- existing docs/reference-generation flow

## Must-Not-Duplicate Areas

Do not add a second copy of:

- adapter discovery
- tool execution policy engine
- GitHub governance
- Wi-Fi/LAN transport
- task token issuance
- generic lock mechanics

## Files That Need Change

Likely plugin-side files:

- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- new IDE-specific command module(s) in `plugins/multi_ai_governance/commands/`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- new docs under `plugins/multi_ai_governance/docs/`
- new schema files under `plugins/multi_ai_governance/schemas/`
- new tests under `plugins/multi_ai_governance/tests/`

Likely repo-wide files:

- `schemas/runtime/schema_registry.json`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- possibly `src/cli/index.js` if a new alias family is added

## Tests Missing Today

The repo does not yet have Case 1 tests for:

- IDE window registration
- AI tool presence registration
- IDE lease creation and release
- file conflict detection
- denied-path blocking
- ungoverned edit warning
- high-risk approval routing
- audit record persistence

## Runtime Files Missing Today

The current `.kabeeri` tree does not yet include the dedicated IDE-window governance files listed in the Case 1 requirements.

Recommended additions:

- `.kabeeri/multi_ai_governance/ide_window_sessions.json`
- `.kabeeri/multi_ai_governance/ide_tool_presence.json`
- `.kabeeri/multi_ai_governance/ide_agent_sessions.json`
- `.kabeeri/multi_ai_governance/ide_leases.json`
- `.kabeeri/multi_ai_governance/ide_conflicts.json`
- `.kabeeri/multi_ai_governance/ide_policy_decisions.json`
- `.kabeeri/multi_ai_governance/ide_approval_requests.json`
- `.kabeeri/multi_ai_governance/ide_audit_log.json`

## Gap Summary

The plugin is complete for its current multi-AI collaboration surface, but Case 1 adds a distinct IDE-local governance layer. That layer is still missing and needs its own runtime files, schema coverage, CLI commands, policy decisions, and tests.
