# Kabeeri VDF v3.0.0 Updated Plan

GitHub CLI + VS Code + Live Dashboard + Owner Verify + AI Token Cost Analytics

## Purpose

This update makes Kabeeri operable from VS Code and CLI, syncable with GitHub, and visible through live dashboards for development status, cost, progress, and final Owner verification.

## Summary

| Item | Value |
|---|---:|
| Target version | `v3.0.0` |
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

- `.kabeeri/` is the source of truth.
- Dashboards display data; they do not own project state.
- GitHub sync must support dry-run and explicit confirmation before remote changes.
- Final verify is Owner-only.
- Token cost analytics must be broken down by task, sprint, workstream, developer, and version.
- Access tokens are secrets and must not be shown in dashboard state files.

## Milestones and Issues

### v2.1.0 - Local Project State and Source of Truth

Goal: Make Dashboard, CLI, and GitHub read from one unified local state.

1. Define `.kabeeri` source of truth structure  
   Labels: `docs`, `cli`, `priority-high`  
   Scope: Define `project.json`, `tasks.json`, `developers.json`, `locks.json`, `acceptance.json`, `audit_log.jsonl`; state that Dashboard is not the source of truth.  
   Acceptance: `.kabeeri` structure documented; source of truth is clear.

2. Add dashboard state file specification  
   Labels: `dashboard`, `docs`, `priority-high`  
   Scope: Define `.kabeeri/dashboard/technical_state.json` and `business_state.json`; separate public dashboard fields from internal state.  
   Acceptance: Dashboard state schema is clear; secrets are never displayed.

3. Add project audit log specification  
   Labels: `docs`, `task-governance`, `priority-high`  
   Scope: Define `audit_log.jsonl`; record task creation, assignment, verify, reject, token issue, and revoke.  
   Acceptance: Audit events are documented; important events are traceable.

### v2.2.0 - GitHub CLI Integration

Goal: Manage Issues, Milestones, and Releases via CLI without depending on GitHub UI.

1. Design GitHub sync configuration  
   Labels: `github`, `cli`, `priority-high`  
   Scope: Define `.kabeeri/github/sync_config.json` with repo, branch, milestones, labels, and issue mapping settings.  
   Acceptance: GitHub sync config documented; no GitHub write occurs without confirmation.

2. Add GitHub issue mapping rules  
   Labels: `github`, `task-tracking`, `priority-high`  
   Scope: Link `task_id` to issue number; define sync states and conflicts.  
   Acceptance: `issue_map` schema exists; conflicts do not resolve automatically without approval.

3. Design CLI commands for GitHub issues and milestones  
   Labels: `github`, `cli`, `priority-high`  
   Scope: `kvdf github issue create/list/sync`; `kvdf github milestone create/list/sync`; dry-run support.  
   Acceptance: Commands documented; basic operation does not need GitHub UI.

### v2.3.0 - VS Code Integration Foundation

Goal: Run Kabeeri from VS Code through CLI and Extension/Webview, while keeping future editor support possible.

1. Design VS Code extension integration architecture  
   Labels: `vscode`, `docs`, `priority-high`  
   Scope: Define Extension relationship to CLI and `.kabeeri`; panels for tasks, dashboard, usage, and GitHub sync.  
   Acceptance: Architecture document exists; Extension is not source of truth.

2. Add VS Code command palette plan  
   Labels: `vscode`, `cli`, `priority-medium`  
   Scope: Commands such as Verify Task, Open Dashboard, Sync GitHub, Show Token Usage.  
   Acceptance: Command palette documented and mapped to CLI.

3. Design editor-agnostic integration rules  
   Labels: `vscode`, `docs`, `priority-medium`  
   Scope: Explain how other text editors can integrate later.  
   Acceptance: Integration abstraction is clear.

### v2.4.0 - Live Technical Dashboard

Goal: Let developers and owners see the technical project state.

1. Design technical dashboard sections  
   Labels: `technical-dashboard`, `dashboard`, `priority-high`  
   Scope: Tasks, GitHub Issues, branches, build status, test status, database tables, backend, public frontend, and admin frontend progress.  
   Acceptance: Sections documented; every section reads from a defined state file.

2. Add backend/frontend/admin progress model  
   Labels: `technical-dashboard`, `docs`, `priority-high`  
   Scope: Split progress into backend, public_frontend, admin_frontend, database, docs, and testing.  
   Acceptance: Progress model exists and fits large projects.

3. Add live developer progress model  
   Labels: `dashboard`, `task-tracking`, `priority-high`  
   Scope: Show developer/agent, role, current task, locks, last activity, status, and cost so far.  
   Acceptance: Every developer's progress is visible; developer state is not mixed.

### v2.5.0 - Business Dashboard

Goal: Give the project owner and target audience a clear product-value view.

1. Design business dashboard sections  
   Labels: `business-dashboard`, `dashboard`, `priority-high`  
   Scope: Product capabilities, feature readiness, user journey, target audience, onboarding, and release value.  
   Acceptance: Business dashboard documented; separates technical language from business language.

2. Add feature readiness business model  
   Labels: `business-dashboard`, `docs`, `priority-medium`  
   Scope: Define `ready_to_demo`, `ready_to_publish`, `needs_review`, and `future`; link features to tasks and acceptance.  
   Acceptance: Feature status is clear for non-technical readers.

3. Add onboarding and user journey dashboard model  
   Labels: `business-dashboard`, `example`, `priority-medium`  
   Scope: Show user journey, core actions, and what is ready to demo.  
   Acceptance: User journey is presentable and helps marketing/client demos.

### v2.6.0 - Owner-Only Task Verification

Goal: Prevent tasks from being closed or treated as complete without top Owner approval.

1. Add owner-only verify rules  
   Labels: `owner-verify`, `permissions`, `priority-high`  
   Scope: Define final verify as Owner-only; reviewer can recommend but cannot final-verify.  
   Acceptance: Owner-only rule documented; exactly one final verifier role.

2. Design dashboard verify action  
   Labels: `owner-verify`, `dashboard`, `priority-high`  
   Scope: Verify Task button visible/enabled only for Owner; write verify event to audit log.  
   Acceptance: Verify action documented and unavailable to ordinary developers.

3. Design CLI task verify/reject/reopen commands  
   Labels: `owner-verify`, `cli`, `priority-high`  
   Scope: `kvdf task verify TASK-ID`; `kvdf task reject TASK-ID --reason`; `kvdf task reopen TASK-ID`.  
   Acceptance: Commands documented and require owner session or owner approval token.

### v2.7.0 - AI Token Cost Dashboard

Goal: Convert AI token usage into pricing and quality data.

1. Add AI token usage dashboard sections  
   Labels: `ai-usage`, `dashboard`, `cost-analytics`, `priority-high`  
   Scope: Total tokens and cost by version, milestone, sprint, task, developer, workstream, model, and provider.  
   Acceptance: Every breakdown is documented and supports product pricing.

2. Add token cost calculator specification  
   Labels: `ai-usage`, `dashboard`, `priority-high`  
   Scope: Input/output/cached token cost; per-token, per-1K, and per-1M units; currency selection.  
   Acceptance: Calculator spec exists and does not depend on hard-coded prices.

3. Add workstream token breakdown  
   Labels: `ai-usage`, `cost-analytics`, `priority-high`  
   Scope: Backend, public frontend, admin frontend, database, docs, testing, debugging, refactor, business analysis, and untracked.  
   Acceptance: Cost shows where tokens went.

4. Add developer token efficiency analysis  
   Labels: `ai-usage`, `dashboard`, `priority-medium`  
   Scope: Developer/AI Agent usage, high-usage warnings, accepted vs rejected/rework cost.  
   Acceptance: Developer efficiency can be evaluated.

### v2.8.0 - Agile Sprint Cost Analytics

Goal: Price each Sprint and learn from every increment.

1. Add sprint token cost model  
   Labels: `agile`, `ai-usage`, `cost-analytics`, `priority-high`  
   Scope: Sprint total tokens/cost; cost per story/task/developer/workstream; accepted, rework, and untracked cost.  
   Acceptance: Sprint cost model documented and supports pricing.

2. Add sprint cost dashboard view  
   Labels: `agile`, `dashboard`, `ai-usage`, `priority-high`  
   Scope: Current/previous sprint cost; compare backend/frontend/admin frontend; warn about untracked usage.  
   Acceptance: Sprint dashboard view documented.

3. Add sprint pricing notes  
   Labels: `agile`, `docs`, `cost-analytics`, `priority-medium`  
   Scope: Explain Sprint price as AI tokens + developer time + review cost + risk margin.  
   Acceptance: Pricing notes are clear.

### v3.0.0 - Stable Platform Integration Release

Goal: Deliver a measurable local platform integration release.

1. Prepare v3.0.0 integration release checklist  
   Labels: `acceptance`, `docs`, `priority-high`  
   Scope: Check GitHub sync, VS Code integration, dashboard, owner verify, and token analytics.  
   Acceptance: Checklist exists and every component has review.

2. Prepare v3.0.0 release notes  
   Labels: `docs`, `priority-high`  
   Scope: Summarize GitHub CLI, VS Code, Dashboard, Owner Verify, Token Cost Analytics, and limitations.  
   Acceptance: Release notes are ready.

3. Publish v3.0.0 GitHub release  
   Labels: `docs`, `priority-high`  
   Scope: Confirm milestone complete, create tag `v3.0.0`, publish release.  
   Acceptance: `v3.0.0` is published.

