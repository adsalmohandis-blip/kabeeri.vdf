# Case 5 GitHub Provider Policy Checks

Policy checks decide whether a GitHub-connected AI action is allowed, warned,
blocked, or requires owner approval.

## Decision Flow

1. Confirm the GitHub repo mapping exists.
2. Confirm the requested action is tied to a KVDF task when required.
3. Classify the risk level.
4. Block denied or unmapped work.
5. Require owner approval for high-risk provider operations.
6. Record the decision and evidence under `.kabeeri/multi_ai_governance/`.

## Decision Output

The policy decision record includes:

- `decision`
- `reason`
- `risk_level`
- `requires_owner_approval`
- `project_id`
- `github_provider_connection_id`
- `github_owner`
- `github_repo`
- `task_id`
- `issue_number`
- `pr_number`
- `branch_name`
- `operation_type`
- `actor_id`
- `agent_id`
- `tool_id`
- `provider_result_id`
- `evidence_id`
- `timestamp`

## High-Risk Examples

- `create_pr`
- `update_pr`
- `create_check_run`
- `update_check_run`
- `create_branch`
- `protect_branch`
- `create_release`
- `update_release`

These operations are permitted only when governance says so, and owner
approval is required when the risk check escalates the request.
