# Case 1: IDE Policy Checks

The IDE policy engine decides whether an AI action is allowed inside the
current workspace and IDE window.

## Decision Outcomes

- `allow`
- `warn`
- `block`
- `require_owner_approval`

## Inputs

- IDE window id
- workspace id
- project id
- tool id
- agent id
- task id
- file or folder path
- active lease
- denied path list
- conflict state
- risk level hints

## Required Decision Fields

- `decision`
- `reason`
- `risk_level`
- `requires_owner_approval`
- `evidence_id`
- `timestamp`

## Policy Rules

- Denied paths are blocked.
- Same-file conflicts are blocked.
- Expired leases are blocked.
- Ungoverned edits without a valid lease are warned.
- High-risk paths require owner approval.

## Evidence

Each decision writes a durable record under `.kabeeri/multi_ai_governance/`
and also appends an audit record so the action can be traced later.
