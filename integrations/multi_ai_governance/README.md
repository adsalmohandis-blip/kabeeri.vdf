# Multi-AI Developer Governance

This folder is now a historical roadmap and plan-inspection source for
multi-developer and multi-AI governance.

The active runtime and product documentation has moved to:

- `governance/`
- `governance/TASK_GOVERNANCE.md`
- `governance/EXECUTION_SCOPE_GOVERNANCE.md`
- `governance/WORKSTREAM_GOVERNANCE.md`
- `governance/SOLO_DEVELOPER_MODE.md`
- `cli/CLI_COMMAND_REFERENCE.md`

## Core Rules

- Exactly one Owner exists at any time.
- Every human developer and AI Developer has a traceable identity.
- Every execution task requires source, acceptance, assignment, access token, and lock coverage.
- AI Developers work only inside a task-specific token scope.
- Final verification is Owner-only.
- Tokens are revoked after verify, rejection, expiry, or explicit revocation.
- Cost and token usage are tracked by task, sprint, developer, workstream, and version.

## Merged Runtime Status

The old `v3_*` planning folders have been merged conceptually into current
governance documentation and CLI runtime:

| Historical folder | Current reference |
| --- | --- |
| `v3_1_collaboration_identity/` | `governance/ROLE_PERMISSION_MATRIX.md`, `kvdf developer`, `kvdf agent` |
| `v3_2_owner_transfer/` | `governance/SINGLE_OWNER_RULE.md`, `governance/OWNER_TRANSFER_TOKEN.md`, `kvdf owner transfer` |
| `v3_3_task_access_tokens/` | `governance/EXECUTION_SCOPE_GOVERNANCE.md`, `kvdf token` |
| `v3_4_locks/` | `governance/LOCKING_RULES.md`, `kvdf lock` |
| `v3_5_assignment_governance/` | `governance/ASSIGNMENT_EXECUTION_GOVERNANCE.md`, `governance/TASK_GOVERNANCE.md` |
| `v3_6_ai_sessions/` | `governance/AI_DEVELOPER_OUTPUT_CONTRACT.md`, `kvdf session` |
| `v3_7_budgets/` | `governance/TOKEN_BUDGET_RULES.md`, `ai_cost_control/` |
| `v3_8_verify_audit/` | `governance/OWNER_VERIFY_TOKEN_REVOCATION_AUDIT.md`, `kvdf audit` |
| `v4_0_release/` | `kvdf release`, `kvdf policy` |

Keep the milestone JSON file for `kvdf plan` inspection. Do not treat the
historical `v3_*` folders as active product documentation.

## Planned Labels

| Label | Color | Description |
|---|---:|---|
| `delivery-mode` | `#5319E7` | Delivery modes: Structured and Agile |
| `structured-delivery` | `#0075CA` | Structured/sequential delivery |
| `agile` | `#0E8A16` | Backlog, sprint, and story work |
| `project-intake` | `#1D76DB` | New or adopted project intake |
| `task-governance` | `#D93F0B` | Task creation and management rules |
| `provenance` | `#FBCA04` | Task source tracing |
| `ai-usage` | `#7057FF` | AI token usage and cost records |
| `dashboard` | `#C5DEF5` | Project dashboard work |
| `github` | `#0075CA` | GitHub integration |
| `vscode` | `#5319E7` | VS Code integration |
| `cli` | `#5319E7` | CLI commands |
| `permissions` | `#D93F0B` | Roles and permissions |
| `token-access` | `#B60205` | Access token lifecycle |
| `priority-high` | `#B60205` | High priority |
| `priority-medium` | `#FBCA04` | Medium priority |
| `good-first-issue` | `#7057FF` | Good first contributor task |
| `multi-ai` | `#5319E7` | Multiple AI Developers or AI-assisted developers |
| `locking` | `#D93F0B` | Task, file, folder, and workstream locks |
| `owner-transfer` | `#B60205` | Single Owner transfer |
| `budget-control` | `#FBCA04` | Token and task cost budgets |

## Milestones

| Milestone | Issues | Goal |
|---|---:|---|
| `v3.1.0 - Collaboration Identity and Role Model` | 3 | Allow multiple developers or AI Agents to work without overlap. |
| `v3.2.0 - Single Owner and Owner Transfer` | 3 | Prevent top-authority conflict while allowing safe transfer. |
| `v3.3.0 - Task Access Tokens Lifecycle` | 3 | Allow task-specific scoped work that expires when done. |
| `v3.4.0 - Locks and Conflict Prevention` | 3 | Prevent task, file, folder, and risky parallel-work conflicts. |
| `v3.5.0 - Assignment and Execution Governance` | 3 | Prevent AI Developers from working on unapproved or unassigned tasks. |
| `v3.6.0 - AI Developer Sessions and Output Contracts` | 3 | Make AI output readable, reviewable, costed, and auditable. |
| `v3.7.0 - Token Budgets and Cost Controls` | 3 | Prevent random AI token consumption and support pricing analytics. |
| `v3.8.0 - Owner Verify, Token Revocation, and Audit` | 3 | Close each task only after Owner verification and audit. |
| `v4.0.0 - Stable Multi-AI Governance Release` | 4 | Ship a strong governance model for AI-assisted team development. |

Total: 9 milestones, 28 issues.

## Historical Files

- [V4_0_UPDATED_PLAN.md](V4_0_UPDATED_PLAN.md) - human-readable planning document.
- [milestones_and_issues.v4.0.0.json](milestones_and_issues.v4.0.0.json) - machine-readable GitHub planning source.
- [v3_1_collaboration_identity/README.md](v3_1_collaboration_identity/README.md) - identities, roles, permissions, workstreams.
- [v3_2_owner_transfer/README.md](v3_2_owner_transfer/README.md) - single Owner and transfer tokens.
- [v3_3_task_access_tokens/README.md](v3_3_task_access_tokens/README.md) - task access token lifecycle.
- [v3_4_locks/README.md](v3_4_locks/README.md) - lock types and conflict prevention.
- [v3_5_assignment_governance/README.md](v3_5_assignment_governance/README.md) - assignment and execution flow.
- [v3_6_ai_sessions/README.md](v3_6_ai_sessions/README.md) - AI sessions and output contracts.
- [v3_7_budgets/README.md](v3_7_budgets/README.md) - budgets and cost controls.
- [v3_8_verify_audit/README.md](v3_8_verify_audit/README.md) - verify, revocation, final audit reports.
- [v4_0_release/README.md](v4_0_release/README.md) - release checklist and notes.
