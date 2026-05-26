# Case 5 GitHub Provider Boundary

`github_provider` is the provider/integration layer. It is not the governance
authority.

## Belongs In `multi_ai_governance`

- policy decisions
- task binding validation
- owner approval requests
- audit and evidence
- governing whether a GitHub operation may run

## Belongs In `github_provider`

- GitHub provider status and readiness
- provider planning
- provider runtime state under `.kabeeri/github/`
- execution of the approved provider-side work

## Out Of Scope

- GitHub Actions as governance authority
- Case 4 KCloud governance
- `kcloud_data_sharing`
- `wifi_data_sharing`
- direct GitHub API duplication inside `multi_ai_governance`
