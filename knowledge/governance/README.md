# Governance

This folder is the canonical v4 governance specification for safe multi-developer and multi-AI work in Kabeeri projects.

The multi-AI governance bundle now lives in `plugins/multi_ai_governance/` as a removable framework plugin. This folder turns that plan into operational rules that project workspaces, dashboards, VS Code surfaces, and CLI commands can enforce.

## Core Rules

- Exactly one active Owner exists at any time.
- Every human developer and AI agent has a traceable identity.
- Executable work requires an approved task, an assignee, an execution-scoped task access token, lock coverage, source provenance, and acceptance criteria.
- Task access tokens are different from AI usage tokens. Access tokens grant scoped permission through app and workstream boundaries; AI usage tokens measure cost.
- Final task verification is Owner-only.
- Tokens are revoked after Owner verify, rejection, expiry, or explicit revocation.
- AI output must follow the output contract before it can be verified.

## Runtime State

The `.kabeeri/` workspace remains source of truth. Governance examples live beside the other `.kabeeri` examples:

- `.kabeeri/developers.json.example`
- `.kabeeri/agents.json.example`
- `.kabeeri/locks.json.example`
- `.kabeeri/multi_ai_governance.json`
- `.kabeeri/access_tokens/README.md`

## Spec Files

- `ROLE_PERMISSION_MATRIX.md`
- `SINGLE_OWNER_RULE.md`
- `OWNER_TRANSFER_TOKEN.md`
- `TASK_GOVERNANCE.md` (compatibility pointer; canonical task policy is in `../task_tracking/TASK_GOVERNANCE.md`)
- `EXECUTION_SCOPE_GOVERNANCE.md`
- `WORKSTREAM_GOVERNANCE.md`
- `LOCKING_RULES.md`
- `ASSIGNMENT_EXECUTION_GOVERNANCE.md`
- `AI_DEVELOPER_OUTPUT_CONTRACT.md`
- `TOKEN_BUDGET_RULES.md`
- `KVDF_WORKFLOW_INSTRUCTIONS.md`
- `OWNER_VERIFY_TOKEN_REVOCATION_AUDIT.md`
- `MULTI_AI_GOVERNANCE.md`
- `PLUGIN_FOLDER_CONTRACT.md`
