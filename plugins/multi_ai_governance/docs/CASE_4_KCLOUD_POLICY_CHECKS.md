# Case 4 KCloud Policy Checks

Cloud policy checks decide whether a cloud packet or cloud action is allowed.

## Decision values

- `allow`
- `warn`
- `block`
- `require_owner_approval`

## Inputs

- Tenant and organization.
- Cloud project and local project.
- Cloud node and role.
- Agent and tool identity when known.
- Task, branch, path, and cloud channel.
- Token and lease state.
- Local project lease conflicts.
- Wi-Fi/LAN lease conflicts.

## Outputs

- Decision.
- Reason.
- Risk level.
- Owner approval requirement.
- Evidence id.
- Timestamp.

