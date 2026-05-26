# Case 5 GitHub Provider Analysis

## Scope

Case 5 is the GitHub governance integration for `multi_ai_governance`. It must govern GitHub-connected AI work by calling the existing `github_provider` plugin only after policy approval.

## What Already Exists

### `multi_ai_governance`

- Case 1 IDE Window Governance.
- Case 2 Local Project Governance.
- Case 3 Wi-Fi/LAN Governance.
- Case 4 KCloud Governance.
- Existing local runtime conventions under `.kabeeri/multi_ai_governance/`.
- Existing audit, conflict, approval, evidence, and policy decision patterns.
- Existing CLI routing style for nested `kvdf multi-ai ...` groups.

### `github_provider`

- Manifest-driven removable plugin at [plugins/github_provider/plugin.json](../../../plugins/github_provider/plugin.json).
- Runtime entrypoint at [plugins/github_provider/runtime/index.js](../../../plugins/github_provider/runtime/index.js).
- Provider/planner surfaces for:
  - `status`
  - `readiness`
  - `sync-plan`
  - `issue-plan`
  - `pr-plan`
  - `release-plan`
  - `handoff-plan`
- Compatibility support for `kvdf github` through the core CLI wrapper.
- Local runtime state files under `.kabeeri/github/`:
  - `sync_config.json`
  - `issue_map.json`
  - `team_feedback.json`
- Dry-run planning and confirmed remote execution through `gh` where available.
- Local-only policy results written by the provider when GitHub writes are blocked.

## What `github_provider` Already Provides

- GitHub remote/provider readiness detection.
- Git repository and GitHub remote detection.
- Dry-run planning for sync, issues, PRs, releases, and handoff.
- Confirmed remote issue sync and release publish actions when gates allow it.
- Local `.kabeeri/github` state for sync config, issue mapping, and team feedback.
- Compatibility routing through `kvdf github`.

## What Case 5 Should Reuse

- Provider availability and readiness reports from `github_provider`.
- Provider planning outputs for issue, PR, release, and handoff surfaces.
- Provider execution for remote GitHub writes where confirmation and gates pass.
- Core CLI GitHub provider wrapper behavior already in `src/cli/commands/github_provider.js`.
- Existing `.kabeeri/github/*` provider-owned runtime state.

## What Must Remain Inside `multi_ai_governance`

- Governance policy decisions.
- Task binding validation.
- Risk classification.
- Owner approval requests.
- Audit and evidence records under `.kabeeri/multi_ai_governance/`.
- Governed operation request records.
- Issue/PR/check/label orchestration requests.
- Provider-operation policy gates.
- Decision output that returns `allow`, `warn`, `block`, or `require_owner_approval`.

## What Must Remain Inside `github_provider`

- GitHub-specific API/provider logic.
- GitHub remote detection and `gh`-backed remote write execution.
- Read-only or dry-run GitHub provider planning behavior.
- Provider-owned `.kabeeri/github/*` local state.
- Provider-specific sync/readiness/handoff reports.

## What Must Not Be Duplicated

- GitHub API calls.
- `gh` CLI execution logic.
- GitHub remote detection helpers.
- GitHub issue/PR/release rendering already present in the provider.
- Provider state file handling.

## How Case 5 Differs From Direct GitHub Repo Checks

- Direct repo checks only inspect Git state or remote availability.
- Case 5 adds governance around who may request a GitHub action, why, and under what task binding.
- Case 5 must record approval, audit, evidence, and risk decisions locally before provider execution.

## How Case 5 Differs From Case 4

- Case 4 governs cloud-routed work through `kcloud_data_sharing`.
- Case 5 governs GitHub-connected work through `github_provider`.
- Case 4 is about cloud sync/control-plane state.
- Case 5 is about source-control governance and provider-backed GitHub operations.

## Files Likely To Change

- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- new Case 5 command module under `plugins/multi_ai_governance/commands/`
- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/commands/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `schemas/runtime/schema_registry.json`
- new Case 5 test file under `plugins/multi_ai_governance/tests/`

## Tests That Should Be Added

- Connection mapping tests.
- Governed operation request tests.
- Task binding validation tests.
- High-risk approval tests.
- Issue/PR/check/label orchestration request tests.
- Provider audit/evidence tests.
- Regression tests for Cases 1-4.
- Regression tests for `github_provider`.

## Runtime Files That Should Be Created Under `.kabeeri/multi_ai_governance/`

- `github_provider_connections.json`
- `github_provider_repo_map.json`
- `github_provider_sync_state.json`
- `github_provider_operations.json`
- `github_provider_operation_results.json`
- `github_provider_risk_events.json`
- `github_provider_issue_sync.json`
- `github_provider_pr_sync.json`
- `github_provider_check_runs.json`
- `github_provider_comments.json`
- `github_provider_labels.json`
- `github_provider_policy_decisions.json`
- `github_provider_approval_requests.json`
- `github_provider_audit_log.json`
- `github_provider_evidence.json`

## What Must Remain Outside Scope

- Kabeeri/KVDOS Cloud governance.
- Wi-Fi/LAN governance.
- Local project governance.
- IDE window governance.
- Any direct GitHub provider rewrite.
- Any new GitHub plugin.
- Any `kcloud_data_sharing` integration.

