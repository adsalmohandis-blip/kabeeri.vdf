# Case 2 Implementation Plan: Local Project Governance

## Goal

Add a local-project governance layer inside the existing `multi_ai_governance` plugin so the same
computer and same repo are governed across IDEs, terminals, local agents, and local scripts.

## Constraints

- do not create a new plugin
- do not rename `multi_ai_governance`
- do not break Case 1
- do not add Case 3, Case 4, or Case 5
- do not add Wi-Fi/LAN governance
- do not add GitHub governance
- do not duplicate `ai_tool_adapters`

## Phase 1: Analysis Outcome

Use the existing Case 1 implementation as the base reference, but keep the models separate:

- Case 1 stays window-local
- Case 2 becomes project-local

## Phase 2: Local Project Registry

Add a project-wide identity model and runtime files:

- `.kabeeri/multi_ai_governance/local_project.json`
- `.kabeeri/multi_ai_governance/local_machine.json`

Add schemas:

- `schemas/runtime/local-project-state.schema.json`
- `schemas/runtime/local-machine-state.schema.json`

Add commands:

- `kvdf multi-ai local status`
- `kvdf multi-ai local register`

## Phase 3: Local Client And Session Registry

Add project-wide client/session tracking:

- `.kabeeri/multi_ai_governance/local_clients.json`
- `.kabeeri/multi_ai_governance/local_sessions.json`
- `.kabeeri/multi_ai_governance/local_heartbeats.json`

Add schemas:

- `schemas/runtime/local-clients-state.schema.json`
- `schemas/runtime/local-sessions-state.schema.json`
- `schemas/runtime/local-heartbeats-state.schema.json`

Add commands:

- `kvdf multi-ai local client status`
- `kvdf multi-ai local client register`
- `kvdf multi-ai local session status`
- `kvdf multi-ai local session register`
- `kvdf multi-ai local heartbeat`

## Phase 4: Local Project Leases And Conflict Detection

Add project-wide leases and conflict detection:

- `.kabeeri/multi_ai_governance/local_leases.json`
- `.kabeeri/multi_ai_governance/local_conflicts.json`
- `.kabeeri/multi_ai_governance/local_ungoverned_changes.json`

Add schemas:

- `schemas/runtime/local-leases-state.schema.json`
- `schemas/runtime/local-conflicts-state.schema.json`
- `schemas/runtime/local-ungoverned-changes-state.schema.json`

Add commands:

- `kvdf multi-ai local lease status`
- `kvdf multi-ai local lease create`
- `kvdf multi-ai local release`
- `kvdf multi-ai local conflicts`
- `kvdf multi-ai local scan`

## Phase 5: Local Policy, Audit, Tests, And Docs

Add project-wide policy decisions and audit logging:

- `.kabeeri/multi_ai_governance/local_policy_decisions.json`
- `.kabeeri/multi_ai_governance/local_approval_requests.json`
- `.kabeeri/multi_ai_governance/local_audit_log.json`

Add schemas:

- `schemas/runtime/local-policy-decisions-state.schema.json`
- `schemas/runtime/local-approval-requests-state.schema.json`
- `schemas/runtime/local-audit-log-state.schema.json`

Add command:

- `kvdf multi-ai local policy check`

Add docs:

- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_PROJECT_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_LEASES.md`
- `plugins/multi_ai_governance/docs/CASE_2_COMPLETION_REPORT.md`

Add tests that cover:

- local project registration
- local client registration
- local session registration
- file/folder/branch leases
- same-file conflict detection across two clients
- branch conflict detection across two tasks
- denied-path detection
- ungoverned local change warnings
- high-risk approval requirements
- audit record writing
- Case 1 regression protection

## Reuse Rules

Reuse:

- plugin bootstrap and manifest patterns
- Case 1 audit/approval/decision conventions
- `.kabeeri` state handling
- schema registry wiring
- CLI docs style
- contract test style

Reference Case 1 where relevant:

- when a client comes from an IDE window
- when a local project lease should be aware of an IDE-level lease

## What Must Not Happen

- do not merge Case 1 and Case 2 into one ambiguous model
- do not make IDE-window identity the only project identity
- do not add a daemon if the repo does not already have a safe pattern
- do not use Wi-Fi/LAN or GitHub as a workaround for local project governance

## Acceptance Target

Case 2 is complete when the local-project registry, client/session registry, lease/conflict/policy
controls, audit logging, docs, and tests are all present and Case 1 remains green.

