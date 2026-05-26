# Case 4 KCloud Analysis

Case 4 is the Kabeeri / KVDOS Cloud governance layer for `multi_ai_governance`.
It must stay inside the plugin and treat cloud transport as a separate concern.

## What already exists

- Case 1 IDE window governance: local window identity, tool presence, leases, conflicts, and policy decisions.
- Case 2 local project governance: machine/project/client/session/lease/policy state across the repo.
- Case 3 Wi-Fi/LAN governance: node identity, pairing, permissions, task tokens, leases, conflicts, and packet policy.
- Shared runtime and schema patterns under `.kabeeri/multi_ai_governance/` and `schemas/runtime/`.
- CLI and manifest conventions for `kvdf multi-ai ...` commands.
- Audit/evidence conventions for policy checks and approvals.
- A `github_provider` plugin, but it is a source-control provider layer, not cloud governance.

## What is missing for Case 4

- Cloud identity mapping for nodes, tenants, projects, users, and roles.
- Cloud trust and approval records.
- Cloud task tokens and cloud leases.
- Cloud packet governance and conflict detection.
- Cloud policy decisions, audit records, and evidence records.
- CLI commands for `kvdf multi-ai kcloud ...`.
- Docs and schemas for cloud governance state.

## What should be reused

- The state-file pattern from Cases 1 to 3.
- The policy object pattern with decision, reason, risk level, approval requirement, evidence id, and timestamp.
- The lease/conflict/audit/evidence patterns already used by the IDE, local project, and Wi-Fi/LAN cases.
- The manifest, bootstrap, and command-router conventions in `multi_ai_governance`.

## What must not be duplicated

- Wi-Fi/LAN transport logic from `wifi_data_sharing`.
- Any GitHub provider logic.
- Any Case 1, Case 2, or Case 3 identity/lease/policy model that is already fit for purpose.
- Any cloud transport implementation that belongs in a future `kcloud_data_sharing` layer.

## Files that should change

- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- A new cloud governance command module under `plugins/multi_ai_governance/commands/`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/commands/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `schemas/runtime/schema_registry.json`
- New runtime schema files under `schemas/runtime/`

## Runtime files that should be owned by multi_ai_governance

- `.kabeeri/multi_ai_governance/kcloud_nodes.json`
- `.kabeeri/multi_ai_governance/kcloud_identity_map.json`
- `.kabeeri/multi_ai_governance/kcloud_trust.json`
- `.kabeeri/multi_ai_governance/kcloud_project_map.json`
- `.kabeeri/multi_ai_governance/kcloud_permissions.json`
- `.kabeeri/multi_ai_governance/kcloud_task_tokens.json`
- `.kabeeri/multi_ai_governance/kcloud_approval_rules.json`
- `.kabeeri/multi_ai_governance/kcloud_leases.json`
- `.kabeeri/multi_ai_governance/kcloud_conflicts.json`
- `.kabeeri/multi_ai_governance/kcloud_ungoverned_packets.json`
- `.kabeeri/multi_ai_governance/kcloud_packet_evidence.json`
- `.kabeeri/multi_ai_governance/kcloud_policy_decisions.json`
- `.kabeeri/multi_ai_governance/kcloud_approval_requests.json`
- `.kabeeri/multi_ai_governance/kcloud_audit_log.json`
- `.kabeeri/multi_ai_governance/kcloud_evidence.json`

## What should remain outside scope

- Case 5 GitHub provider governance.
- Any `github_provider` integration beyond a boundary note.
- Any `kcloud_data_sharing` implementation details beyond transport/sync reuse if the plugin exists.
- Any cloud branch protection or remote provider authority model.

