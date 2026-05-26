# Case 2 Analysis: Local Project Governance

## What Already Exists

The existing `multi_ai_governance` plugin already provides the core authority model and durable local state
patterns that Case 2 can reuse:

- removable bundle bootstrap and manifest wiring
- `multi-ai` command routing through the CLI dispatcher
- leader, queue, relay, and sync governance
- Case 1 IDE window governance for local workspace-in-window coordination
- `.kabeeri` as the local runtime source of truth
- schema registry support for durable JSON/JSONL runtime files
- audit and approval record patterns
- optional `ai_tool_adapters` integration boundary
- optional `wifi_data_sharing` transport boundary, which Case 2 must not use

Case 1 already demonstrates the pattern for:

- creating a new command module under `plugins/multi_ai_governance/commands/`
- adding plugin-owned runtime JSON files under `.kabeeri/multi_ai_governance/`
- registering runtime schemas in `schemas/runtime/schema_registry.json`
- writing contract tests that validate local state and audit behavior

## What Case 1 Can Reuse

Case 2 should reuse the following Case 1 ideas:

- `multi_ai_governance` remains the authority layer
- `.kabeeri` remains the runtime source of truth
- audit and approval record patterns
- machine-readable decision objects
- command routing through `kvdf multi-ai ...`
- local validation contracts in plugin tests
- optional adapter translation from `ai_tool_adapters`

Case 2 can also reference Case 1 for identity linkage:

- a local client may point to an `ide_window_id` when the source is an IDE window
- a local project lease may reference a Case 1 IDE lease as supporting evidence
- project-level policy checks may incorporate IDE-window evidence without merging the models

## What Case 2 Needs Separately

Case 2 is broader than Case 1. It must govern the whole local project across:

- different IDE windows
- different IDEs
- terminals
- local agents
- local scripts
- local CLI sessions

That means Case 2 needs its own project-level registry, client/session tracking, leases, conflicts,
ungoverned-change detection, and policy decisions.

## What Must Not Be Duplicated

Case 2 must not duplicate Case 1 without a project-level reason.

Do not blindly copy:

- IDE window session identity
- IDE tool presence identity
- IDE-specific lease scope semantics
- IDE-specific policy wording

Instead, Case 2 should:

- store project-wide client and session records
- reference Case 1 records when an IDE window is the source client
- keep project-level leases and conflicts distinct from IDE-window leases and conflicts

## Current Command Surface

The existing `multi_ai_governance` command surface already includes:

- `kvdf multi-ai status`
- `kvdf multi-ai queue`
- `kvdf multi-ai relay`
- `kvdf multi-ai sync`
- `kvdf multi-ai ide ...`
- `kvdf multi-ai wifi ...`

Case 2 should add a new `local` branch under `multi-ai`:

- `kvdf multi-ai local status`
- `kvdf multi-ai local register`
- `kvdf multi-ai local client status`
- `kvdf multi-ai local client register`
- `kvdf multi-ai local session status`
- `kvdf multi-ai local session register`
- `kvdf multi-ai local heartbeat`
- `kvdf multi-ai local lease status`
- `kvdf multi-ai local lease create`
- `kvdf multi-ai local release`
- `kvdf multi-ai local conflicts`
- `kvdf multi-ai local scan`
- `kvdf multi-ai local policy check`

## Current Runtime State

The plugin already owns these Case 1 runtime files under `.kabeeri/multi_ai_governance/`:

- `ide_window_sessions.json`
- `ide_tool_presence.json`
- `ide_agent_sessions.json`
- `ide_leases.json`
- `ide_conflicts.json`
- `ide_policy_decisions.json`
- `ide_approval_requests.json`
- `ide_audit_log.json`

Case 2 should add separate local-project runtime files so the project-wide layer does not overwrite
or blur the IDE-window layer:

- `local_project.json`
- `local_machine.json`
- `local_clients.json`
- `local_sessions.json`
- `local_heartbeats.json`
- `local_leases.json`
- `local_conflicts.json`
- `local_ungoverned_changes.json`
- `local_policy_decisions.json`
- `local_approval_requests.json`
- `local_audit_log.json`

## Existing Schema Registry Pattern

The schema registry already maps `.kabeeri/multi_ai_governance/*` files to runtime schemas.
Case 2 should extend that same registry pattern with new local-project schema entries.

## Existing Tests

Case 1 already has plugin contract coverage for:

- window registration
- tool presence
- agent sessions
- leases
- conflicts
- policy decisions
- approval requests
- audit records

Case 2 needs its own contract test file for:

- local project registration
- local client registration
- local session registration
- local file/folder/branch leases
- local same-file and branch conflict detection
- ungoverned change detection
- high-risk approval flow
- local audit record writing
- Case 1 regression protection

## Files Likely To Change

Likely plugin files:

- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- a new local governance module under `plugins/multi_ai_governance/commands/`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/commands/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- new Case 2 docs under `plugins/multi_ai_governance/docs/`
- new Case 2 tests under `plugins/multi_ai_governance/tests/`
- `schemas/runtime/schema_registry.json`
- new runtime schema files under `schemas/runtime/`

Likely core CLI files only if routing needs to surface new command help text:

- `src/cli/commands/multi_ai_governance.js`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`

## What Remains Outside Scope

Case 2 must not include:

- Wi-Fi/LAN transport governance
- GitHub repository governance
- KVDOS cloud governance
- a new plugin
- a duplicate authority layer outside `multi_ai_governance`
- a daemon if the repo does not already have a safe pattern for one

## Summary

Case 1 gives the plugin a local IDE-window governance layer. Case 2 should build the broader
machine-and-project governance layer around it, with its own local-project identity and client/session
registry, while continuing to treat Case 1 as a referenced subsystem rather than a merged model.

