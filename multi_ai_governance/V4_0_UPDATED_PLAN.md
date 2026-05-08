# Kabeeri VDF v4.0.0 Updated Plan

Multi-AI Developer Governance + Single Owner + Access Tokens + Locks + Budgets + Audit

## Purpose

This update makes Kabeeri safe for multiple human developers and AI Developers working on the same project. It prevents overlap through identity, roles, assignment rules, scoped task tokens, locks, budget controls, and audit records.

## Summary

| Item | Value |
|---|---:|
| Target version | `v4.0.0` |
| Milestones | 9 |
| Issues | 28 |
| Document type | GitHub Milestones and Issues planning document |

## Terms

| Term | Definition |
|---|---|
| Structured Delivery | Ordered delivery from idea, questions, documents, tasks, acceptance, then release. |
| Agile Delivery | Iterative delivery through backlog, user stories, sprints, and continuous review. |
| Task Provenance | Trace of where a task came from: question, answer, document, story, bug, or AI suggestion. |
| Access Token | Permission token allowing a developer or AI agent to work within a limited scope. |
| AI Usage Tokens | AI consumption tokens used for cost and quality analytics. |
| Owner Verify | Final task verification, allowed only for the Owner. |

## Non-Negotiable Rules

- One Owner only.
- No task execution without source, acceptance, assignment, access token, and required locks.
- Access tokens are scoped to one task and one assignee.
- Locks must include owner, scope, expiry, and reason.
- AI output must follow the output contract before review.
- Budget overrun requires explicit approval.
- Owner verify revokes task access tokens and writes audit events.

## Milestones and Issues

### v3.1.0 - Collaboration Identity and Role Model

Goal: Allow more than one developer or AI Agent to work without overlap.

1. Define collaboration identity model  
   Labels: `multi-ai`, `permissions`, `priority-high`  
   Scope: Define `developers.json` and `agents.json`; support human developer and AI Developer; record role, workstream, and status.  
   Acceptance: Every developer/agent has an ID; identity is traceable in audit log.

2. Define role and permission model  
   Labels: `permissions`, `multi-ai`, `priority-high`  
   Scope: Owner, Maintainer, Reviewer, Backend Developer, Frontend Developer, Admin Frontend Developer, Business Analyst, AI Developer, Viewer.  
   Acceptance: Role matrix exists; Owner is single.

3. Add workstream ownership rules  
   Labels: `multi-ai`, `task-governance`, `priority-medium`  
   Scope: Backend, Public Frontend, Admin Frontend, Database, Docs, QA; define who can accept each workstream.  
   Acceptance: Workstream rules prevent overlap.

### v3.2.0 - Single Owner and Owner Transfer

Goal: Prevent top-authority conflict while allowing safe transfer.

1. Enforce single owner rule  
   Labels: `permissions`, `owner-transfer`, `priority-high`  
   Scope: Document only one Owner at a time; prevent two Owners; define default downgrade for old Owner.  
   Acceptance: Single Owner rule is clear; no two-owner scenario exists.

2. Design owner transfer token lifecycle  
   Labels: `owner-transfer`, `token-access`, `priority-high`  
   Scope: `created`, `issued`, `accepted`, `used`, `expired`, `revoked`; old Owner is downgraded after use.  
   Acceptance: Transfer flow is documented; token is single-use.

3. Add owner transfer audit log rules  
   Labels: `owner-transfer`, `docs`, `priority-high`  
   Scope: Log who created the token, who accepted it, transfer time, and old Owner's new role.  
   Acceptance: Every ownership transfer is auditable.

### v3.3.0 - Task Access Tokens Lifecycle

Goal: Allow work on a specific task with clear limits that expire when the task is complete.

1. Define task access token schema  
   Labels: `token-access`, `task-governance`, `priority-high`  
   Scope: `task_id`, `assignee_id`, `workstream`, `allowed_files`, `forbidden_files`, `expires_at`, `max_usage_tokens`, `max_cost`, `owner_verify_required`.  
   Acceptance: Token schema exists; every token is linked to task and assignee.

2. Add access token lifecycle rules  
   Labels: `token-access`, `priority-high`  
   Scope: `created`, `assigned`, `active`, `used`, `expired`, `revoked`, `reissued`; revoke after verify or rejection according to rules.  
   Acceptance: Lifecycle is clear; no open-ended permission exists.

3. Add token issue and revoke commands design  
   Labels: `token-access`, `cli`, `priority-medium`  
   Scope: `kvdf token issue --task`; `kvdf token revoke TOKEN-ID`; `kvdf token list`.  
   Acceptance: Commands documented; Owner/Maintainer authority required.

### v3.4.0 - Locks and Conflict Prevention

Goal: Prevent task, file, folder, and risky parallel-work conflicts.

1. Define task, file, folder, and workstream lock types  
   Labels: `locking`, `task-governance`, `priority-high`  
   Scope: Task Lock, File Lock, Folder Lock, Workstream Lock, Database Table Lock, Prompt Pack Lock.  
   Acceptance: Lock types documented; each lock has owner, expiry, and reason.

2. Add conflict detection rules  
   Labels: `locking`, `priority-high`  
   Scope: Prevent new tasks with overlapping allowed files/folders when active locks exist; define manual conflict resolution.  
   Acceptance: Conflict rules prevent overlap; risky conflicts are not auto-resolved.

3. Design lock dashboard view  
   Labels: `locking`, `dashboard`, `priority-medium`  
   Scope: Show active locks, owner, task, files, and expiry.  
   Acceptance: Dashboard makes ownership of locks clear.

### v3.5.0 - Assignment and Execution Governance

Goal: Prevent any AI Developer from working on an unapproved or unassigned task.

1. Add task assignment rules for multi-developer work  
   Labels: `multi-ai`, `task-governance`, `priority-high`  
   Scope: `proposed -> approved -> ready -> assigned -> in_progress -> review -> verified`; define who can assign and when.  
   Acceptance: Assignment flow is clear; no execution without assignment.

2. Add backend/frontend/admin frontend task separation rules  
   Labels: `multi-ai`, `task-governance`, `priority-high`  
   Scope: Separate Backend, Public Frontend, Admin Frontend; cross-workstream work requires Integration Task approval.  
   Acceptance: Tasks are clearly separated; Integration Tasks have special rules.

3. Add reviewer independence rule  
   Labels: `acceptance`, `permissions`, `priority-medium`  
   Scope: Executor cannot accept their own task; Reviewer recommends only; Owner verifies finally.  
   Acceptance: Review governance is clear.

### v3.6.0 - AI Developer Sessions and Output Contracts

Goal: Make every AI output readable, reviewable, costed, and auditable.

1. Define AI developer session schema  
   Labels: `multi-ai`, `ai-usage`, `priority-high`  
   Scope: `session_id`, `developer_id`, `task_id`, model/provider, start/end, token usage, files touched.  
   Acceptance: AI sessions are traceable.

2. Add AI output contract rules  
   Labels: `multi-ai`, `acceptance`, `priority-high`  
   Scope: Summary, files created, files changed, checks run, risks, known limitations, needs review, next suggested task.  
   Acceptance: Every AI output follows a fixed shape; non-compliance blocks verify.

3. Add random prompt prevention rules  
   Labels: `ai-usage`, `task-governance`, `priority-medium`  
   Scope: AI usage without task/token/source is classified as untracked; dashboard warning is planned.  
   Acceptance: Random AI usage is detectable.

### v3.7.0 - Token Budgets and Cost Controls

Goal: Prevent random AI token consumption and enable pricing and analysis.

1. Add task token budget fields  
   Labels: `budget-control`, `ai-usage`, `priority-high`  
   Scope: `max_input_tokens`, `max_output_tokens`, `max_total_tokens`, `max_cost`; link budget to Task Access Token.  
   Acceptance: Every task can have a budget.

2. Add budget warning and approval rules  
   Labels: `budget-control`, `dashboard`, `priority-high`  
   Scope: Warn near budget limit; require Owner approval to exceed limit.  
   Acceptance: Budget overruns do not happen silently.

3. Add cost control dashboard metrics  
   Labels: `budget-control`, `dashboard`, `ai-usage`, `priority-medium`  
   Scope: Cost by task, sprint, developer, workstream, accepted/rejected/rework.  
   Acceptance: Cost metrics are clear.

### v3.8.0 - Owner Verify, Token Revocation, and Audit

Goal: Close each task safely after Owner verification only.

1. Link owner verify to token revocation  
   Labels: `owner-verify`, `token-access`, `priority-high`  
   Scope: On verify, revoke access token, update task status, write audit event.  
   Acceptance: Token is revoked after verify; status updates automatically.

2. Add owner rejection and reissue rules  
   Labels: `owner-verify`, `task-governance`, `priority-medium`  
   Scope: If rejected, record reason; issue a limited replacement token when needed.  
   Acceptance: Task rejection does not create permission chaos.

3. Add final verification audit report  
   Labels: `owner-verify`, `docs`, `priority-medium`  
   Scope: Report task, assignee, reviewer, owner, token, files, acceptance, and usage tokens.  
   Acceptance: Every verified task has a final report.

### v4.0.0 - Stable Multi-AI Governance Release

Goal: Ship a strong and flexible governance model for AI-assisted team development.

1. Prepare v4.0.0 governance release checklist  
   Labels: `acceptance`, `docs`, `priority-high`  
   Scope: Check roles, tokens, locks, assignment, verify, audit, and budgets.  
   Acceptance: Checklist is ready.

2. Run multi-ai collaboration scenario review  
   Labels: `multi-ai`, `acceptance`, `priority-high`  
   Scope: Backend + Frontend + Admin Frontend + Owner verify scenario; document gaps.  
   Acceptance: Scenario works without task overlap.

3. Prepare v4.0.0 release notes  
   Labels: `docs`, `priority-high`  
   Scope: Summarize Multi-AI Governance, Single Owner, Tokens, Locks, and Cost Control.  
   Acceptance: Release notes are ready.

4. Publish v4.0.0 GitHub release  
   Labels: `docs`, `priority-high`  
   Scope: Confirm milestones complete, create tag `v4.0.0`, publish release.  
   Acceptance: `v4.0.0` is published.

