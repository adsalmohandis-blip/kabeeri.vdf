# Case 2 Gap Report: Local Project Governance

## Existing Foundation

The repository already has enough infrastructure to support Case 2 without introducing a new plugin:

- `multi_ai_governance` is already a removable, manifest-driven bundle
- `multi-ai` command routing already exists in the CLI dispatcher
- Case 1 already established the pattern for local runtime state, schemas, tests, docs, and audits
- `.kabeeri` already acts as the local source of truth
- plugin bootstrap loading already works
- optional `ai_tool_adapters` integration already exists as a translator boundary

## Partial Coverage Relevant To Case 2

These pieces help Case 2 but do not solve it:

- Case 1 IDE window governance
- leader/queue/relay governance
- Wi-Fi packet transport policies
- generic audit and approval patterns
- `multi_ai_governance.json` as the older shared governance snapshot

They are useful signals, but they do not govern the whole local project across IDEs, terminals,
scripts, and local sessions.

## What Is Missing

The repo does not yet have a distinct project-wide governance layer for:

- local machine identity
- local project identity
- local client identity across editor/terminal/script entrypoints
- local session identity across tools
- local project-level leases
- local same-file and branch conflict detection
- local ungoverned-change detection
- local policy decisions with owner approval
- local audit/evidence records for the whole project

## What Case 2 Must Reuse

Case 2 should reuse:

- the plugin authority model
- the `.kabeeri` runtime state pattern
- the schema registry pattern
- the Case 1 audit and policy decision structure
- the existing multi-ai command family
- the adapter boundary for external tool translation

## What Must Not Be Duplicated

Case 2 must not duplicate Case 1 in a way that confuses scope.

Avoid:

- reusing IDE window sessions as the primary project identity
- making tool presence the only source of truth for local project activity
- collapsing project-level leases into IDE-only leases
- adding Wi-Fi or GitHub behavior to the local project layer

Case 2 should reference Case 1 when an IDE window is the originating client, but it should still
store separate project-level records.

## Commands Missing For Case 2

The repo does not yet advertise or route:

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

## Schemas Missing For Case 2

Case 2 needs new schema files for:

- local project state
- local machine state
- local clients state
- local sessions state
- local heartbeats state
- local leases state
- local conflicts state
- local ungoverned changes state
- local policy decisions state
- local approval requests state
- local audit log state

## Runtime Files Missing For Case 2

Case 2 should create separate runtime files under `.kabeeri/multi_ai_governance/`:

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

## Tests Missing For Case 2

The repo does not yet have a Case 2 contract file covering:

- local project registration
- local client registration
- local session registration
- file/folder/branch lease creation
- same-file conflict detection across two clients
- branch conflict detection across two tasks
- denied-path detection
- ungoverned local change warnings
- high-risk approval requirements
- local audit logging
- Case 1 regression preservation

## Files That Likely Need Changes

Likely plugin files:

- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- a new local governance command module under `plugins/multi_ai_governance/commands/`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/commands/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- `schemas/runtime/schema_registry.json`
- new Case 2 docs under `plugins/multi_ai_governance/docs/`
- new Case 2 tests under `plugins/multi_ai_governance/tests/`

Likely core docs only if command references need to be documented:

- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`

## What Must Stay Out Of Scope

Case 2 must not introduce:

- Wi-Fi/LAN governance
- GitHub repo governance
- cloud governance
- a new plugin
- a duplicate authority model outside `multi_ai_governance`
- self-governance by AI tools

## Conclusion

Case 2 is a missing project-wide layer, not a repeat of Case 1. The plugin already has the base
authority and durable-state patterns; the gap is a local-project registry plus cross-client lease,
conflict, and policy control across the entire machine/project boundary.

