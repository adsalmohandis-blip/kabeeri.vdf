# Case 3 - Wi-Fi Leases

Wi-Fi leases govern distributed work across Wi-Fi/LAN nodes for a shared project.

## Lease Types

- `task`
- `file`
- `folder`
- `branch`
- `runner`
- `service`
- `device`
- `port`

## Lease Fields

- `wifi_lease_id`
- `project_id`
- `task_id`
- `wifi_node_id`
- `governance_node_id`
- `lease_type`
- `scope`
- `branch`
- `local_service`
- `device_id`
- `port`
- `created_at`
- `expires_at`
- `status`

## Runtime Files

- `.kabeeri/multi_ai_governance/wifi_task_tokens.json`
- `.kabeeri/multi_ai_governance/wifi_leases.json`
- `.kabeeri/multi_ai_governance/wifi_conflicts.json`
- `.kabeeri/multi_ai_governance/wifi_ungoverned_packets.json`

## Conflict Detection

Case 3 detects:

- same-file conflicts across Wi-Fi nodes
- branch conflicts across different tasks
- denied path conflicts
- denied action conflicts
- local project lease conflicts from Case 2
- device, service, and port collisions
- expired token or lease usage
- untrusted node activity

## Commands

- `kvdf multi-ai wifi token issue`
- `kvdf multi-ai wifi token status`
- `kvdf multi-ai wifi lease create`
- `kvdf multi-ai wifi lease status`
- `kvdf multi-ai wifi release`
- `kvdf multi-ai wifi conflicts`

## Notes

- A Wi-Fi lease should only be created after pairing trust and task token issuance.
- Local project leases remain Case 2 state, but Case 3 must check them before allowing distributed LAN work.
