# Case 5 GitHub Provider Implementation Plan

## Goal

Build a governance layer in `multi_ai_governance` that authorizes GitHub-connected AI work and then delegates the actual GitHub operations to `github_provider`.

## Phase 1 - Analysis

Done:

- Confirmed `github_provider` is a provider/planner layer, not governance.
- Confirmed provider-owned runtime state exists under `.kabeeri/github/`.
- Confirmed the core CLI already routes `github_provider`.
- Confirmed no Case 5 governance layer exists yet.

## Phase 2 - Connection And Repo Mapping

Add governance-owned mapping between KVDF projects and GitHub provider connections.

Likely runtime files:

- `.kabeeri/multi_ai_governance/github_provider_connections.json`
- `.kabeeri/multi_ai_governance/github_provider_repo_map.json`
- `.kabeeri/multi_ai_governance/github_provider_sync_state.json`

Likely commands:

- `kvdf multi-ai github-provider status`
- `kvdf multi-ai github-provider map-repo`
- `kvdf multi-ai github-provider sync status`

## Phase 3 - Governed Operation Requests

Add governed requests for GitHub issues, PRs, branches, checks, labels, comments, and releases.

Likely runtime files:

- `.kabeeri/multi_ai_governance/github_provider_operations.json`
- `.kabeeri/multi_ai_governance/github_provider_operation_results.json`
- `.kabeeri/multi_ai_governance/github_provider_risk_events.json`

Likely commands:

- `kvdf multi-ai github-provider operation request`
- `kvdf multi-ai github-provider operation status`
- `kvdf multi-ai github-provider operation execute`
- `kvdf multi-ai github-provider risk check`

## Phase 4 - Orchestration

Add governed request builders for:

- issue sync
- PR sync
- check runs
- comments
- labels

Likely runtime files:

- `.kabeeri/multi_ai_governance/github_provider_issue_sync.json`
- `.kabeeri/multi_ai_governance/github_provider_pr_sync.json`
- `.kabeeri/multi_ai_governance/github_provider_check_runs.json`
- `.kabeeri/multi_ai_governance/github_provider_comments.json`
- `.kabeeri/multi_ai_governance/github_provider_labels.json`

Likely commands:

- `kvdf multi-ai github-provider issue sync`
- `kvdf multi-ai github-provider pr sync`
- `kvdf multi-ai github-provider check run`
- `kvdf multi-ai github-provider comment`
- `kvdf multi-ai github-provider label`

## Phase 5 - Policy, Audit, Tests, Acceptance

Add provider policy checks, audit, evidence, docs, and tests.

Likely runtime files:

- `.kabeeri/multi_ai_governance/github_provider_policy_decisions.json`
- `.kabeeri/multi_ai_governance/github_provider_approval_requests.json`
- `.kabeeri/multi_ai_governance/github_provider_audit_log.json`
- `.kabeeri/multi_ai_governance/github_provider_evidence.json`

Likely commands:

- `kvdf multi-ai github-provider policy check`
- `kvdf multi-ai github-provider approval status`
- `kvdf multi-ai github-provider audit`
- `kvdf multi-ai github-provider evidence`

## Reuse Rules

- Reuse the provider’s read/dry-run/write result structure.
- Reuse the existing multi-AI governance decision and audit patterns.
- Do not copy GitHub API implementation into governance.

## Acceptance Checks

- Governance returns allow/warn/block/approval-required.
- High-risk operations require owner approval.
- Provider results are recorded locally.
- Audit and evidence are written under `.kabeeri/multi_ai_governance/`.
- Existing Cases 1-4 and `github_provider` tests still pass.

