# Case 3 - Wi-Fi Policy Checks

Wi-Fi policy checks evaluate every governed LAN action before it is allowed to continue.

## Decision Flow

1. Identify the project.
2. Identify the Wi-Fi/LAN node.
3. Resolve the governance identity map.
4. Check trust status.
5. Check pairing approval.
6. Check the active Wi-Fi task token.
7. Check the Wi-Fi lease.
8. Check the requested path, branch, service, device, or port.
9. Check for conflicts with Wi-Fi leases.
10. Check for conflicts with Case 2 local leases.
11. Check for denied paths or denied actions.
12. Detect high-risk actions.
13. Require owner approval when needed.
14. Record the decision and evidence.

## Decision Values

- `allow`
- `warn`
- `block`
- `require_owner_approval`

## Decision Shape

Policy decisions are written to:

- `.kabeeri/multi_ai_governance/wifi_policy_decisions.json`

Each decision includes:

- `decision`
- `reason`
- `risk_level`
- `requires_owner_approval`
- `machine_id`
- `project_id`
- `wifi_node_id`
- `governance_node_id`
- `task_id`
- `wifi_task_token_id`
- `wifi_lease_id`
- `packet_id`
- `evidence_id`
- `timestamp`

## Related Runtime Files

- `.kabeeri/multi_ai_governance/wifi_approval_requests.json`
- `.kabeeri/multi_ai_governance/wifi_audit_log.json`
- `.kabeeri/multi_ai_governance/wifi_packet_evidence.json`
- `.kabeeri/multi_ai_governance/wifi_ungoverned_packets.json`

## Owner Approval

High-risk LAN actions require owner approval before the governed action can proceed. The approval request is stored locally and does not depend on `wifi_data_sharing` deciding permissions.
