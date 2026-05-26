# Case 2 Local Policy Checks

Local policy checks decide whether a project-level AI action should be allowed,
warned, blocked, or escalated to owner approval.

## Decision Flow

Each check evaluates:

1. machine
2. local project
3. repo root
4. local client
5. session
6. AI tool or local agent
7. task
8. branch
9. file or folder
10. valid local lease
11. Case 1 IDE lease evidence
12. allowed paths
13. denied paths
14. conflicts
15. high-risk paths
16. owner approval
17. final decision
18. evidence record

## Decision Values

The decision object is machine-readable and uses:

- `allow`
- `warn`
- `block`
- `require_owner_approval`

The record also includes:

- `decision`
- `reason`
- `risk_level`
- `requires_owner_approval`
- `machine_id`
- `project_id`
- `client_id`
- `session_id`
- `task_id`
- `evidence_id`
- `timestamp`

## High-Risk Paths

The local policy layer treats sensitive files and repo-control files as
high-risk, including:

- `.kabeeri/owner_auth.json`
- `.kabeeri/session.json`
- `.kabeeri/multi_ai_governance.json`
- `.kabeeri/multi_ai_governance/`
- `plugins/multi_ai_governance/plugin.json`
- `schemas/runtime/schema_registry.json`
- `src/cli/index.js`
- `package.json`

High-risk actions require owner approval.

## Audit And Approval

Policy decisions are written to local audit and approval logs so the decision
can be traced later without relying on chat history.
