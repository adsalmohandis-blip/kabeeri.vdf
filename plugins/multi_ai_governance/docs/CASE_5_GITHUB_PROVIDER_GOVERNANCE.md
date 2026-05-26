# Case 5: GitHub Provider Governance

Case 5 adds governance for GitHub-connected AI work without turning GitHub or
`github_provider` into the policy authority.

## Authority Split

- `multi_ai_governance` decides policy, task binding, approvals, leases, audit,
  and evidence.
- `github_provider` performs GitHub provider work after approval.
- GitHub remains source-control truth.
- `.kabeeri` remains the local runtime source of truth.

## What This Case Covers

- Mapping a KVDF project to a GitHub provider connection
- Recording governed GitHub operation requests
- Checking task binding, repo binding, and risk
- Requiring owner approval for high-risk GitHub provider actions
- Recording audit and evidence locally under `.kabeeri/multi_ai_governance/`

## Runtime State

- `.kabeeri/multi_ai_governance/github_provider_connections.json`
- `.kabeeri/multi_ai_governance/github_provider_repo_map.json`
- `.kabeeri/multi_ai_governance/github_provider_sync_state.json`
- `.kabeeri/multi_ai_governance/github_provider_operations.json`
- `.kabeeri/multi_ai_governance/github_provider_operation_results.json`
- `.kabeeri/multi_ai_governance/github_provider_risk_events.json`
- `.kabeeri/multi_ai_governance/github_provider_issue_sync.json`
- `.kabeeri/multi_ai_governance/github_provider_pr_sync.json`
- `.kabeeri/multi_ai_governance/github_provider_check_runs.json`
- `.kabeeri/multi_ai_governance/github_provider_comments.json`
- `.kabeeri/multi_ai_governance/github_provider_labels.json`
- `.kabeeri/multi_ai_governance/github_provider_policy_decisions.json`
- `.kabeeri/multi_ai_governance/github_provider_approval_requests.json`
- `.kabeeri/multi_ai_governance/github_provider_audit_log.json`
- `.kabeeri/multi_ai_governance/github_provider_evidence.json`

## Command Surface

- `kvdf multi-ai github-provider status`
- `kvdf multi-ai github-provider map-repo`
- `kvdf multi-ai github-provider sync status`
- `kvdf multi-ai github-provider operation request`
- `kvdf multi-ai github-provider operation status`
- `kvdf multi-ai github-provider operation execute`
- `kvdf multi-ai github-provider issue sync`
- `kvdf multi-ai github-provider pr sync`
- `kvdf multi-ai github-provider check run`
- `kvdf multi-ai github-provider comment`
- `kvdf multi-ai github-provider label`
- `kvdf multi-ai github-provider policy check`
- `kvdf multi-ai github-provider approval status`
- `kvdf multi-ai github-provider audit`
- `kvdf multi-ai github-provider evidence`

## Notes

This case does not add GitHub API logic to `multi_ai_governance`. It only
authorizes and records governed requests before delegating execution to
`github_provider`.
