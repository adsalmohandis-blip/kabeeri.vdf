# Case 5 GitHub Provider Gap Report

## What Exists

- `github_provider` already handles GitHub provider readiness and planning.
- `github_provider` already has confirmed GitHub issue sync and release publish paths through `gh`.
- `github_provider` already owns `.kabeeri/github/*` provider state.
- `multi_ai_governance` already has the policy/audit/approval patterns needed for a governed layer.

## What Is Missing

- A governance-owned GitHub provider connection registry.
- Governance-owned repo mapping.
- Governance-owned governed operation requests.
- Governance-owned policy decisions for provider operations.
- Governance-owned issue/PR/check/label orchestration requests.
- Governance-owned approval requests and evidence for GitHub-connected work.
- CLI routes under `kvdf multi-ai github-provider ...`.

## What Is Partial

- The core CLI already has a `github_provider` compatibility wrapper and provider loading path.
- The provider has planner/readiness/dry-run surfaces, but those are not governance decisions.
- Local GitHub-related docs already exist, but they are provider-facing, not governance-facing.

## What Should Be Reused

- The existing `github_provider` runtime and report shapes.
- The provider’s `gh`-backed execution path for confirmed remote writes.
- Existing `github` compatibility behavior in the core CLI only as a wrapper.

## What Should Not Be Reused

- Provider dry-run logic as a substitute for governance.
- Provider-local state as the authority for approvals or risk.
- Any direct `gh` invocation from `multi_ai_governance`.

## Files To Change

- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/commands/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `schemas/runtime/schema_registry.json`

## Files To Add

- New Case 5 command module under `plugins/multi_ai_governance/commands/`
- New Case 5 contract test under `plugins/multi_ai_governance/tests/`
- New Case 5 docs under `plugins/multi_ai_governance/docs/`
- New Case 5 runtime schemas under `schemas/runtime/`

## Test Coverage Needed

- Positive and negative policy decisions.
- Task binding validation.
- High-risk approval gating.
- Issue/PR/check/label orchestration request flow.
- Provider execution-result recording.
- Audit and evidence output.
- Regression for `github_provider`.

## Outside Scope

- Any GitHub API implementation changes inside `multi_ai_governance`.
- Any GitHub Actions governance implementation.
- Any cloud transport or KCloud flow.
- Any Wi-Fi or local-project flow.

