# Case 5 GitHub Provider Integration

`multi_ai_governance` integrates with `github_provider` as a downstream
provider layer, not as a policy authority.

## Integration Contract

- `multi_ai_governance` creates the governed request.
- `multi_ai_governance` decides allow / warn / block / require_owner_approval.
- `github_provider` performs the provider-side work after approval.
- Provider results are written back into local governance state.

## Reused Provider Surfaces

- provider status and readiness reports
- provider plan helpers for issues, PRs, releases, and sync flows
- provider-local `.kabeeri/github/*` state

## What Is Not Duplicated

- GitHub API/client logic
- provider auth handling
- remote write behavior
- provider planning and sync internals

## Local Outputs

Case 5 records:

- connection mappings
- governed operation requests
- operation results
- risk events
- issue / PR / check / label sync records
- policy decisions
- approval requests
- audit events
- evidence records
