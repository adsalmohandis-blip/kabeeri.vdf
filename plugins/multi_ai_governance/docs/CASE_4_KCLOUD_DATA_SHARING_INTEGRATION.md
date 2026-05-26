# Case 4 KCloud Data Sharing Integration

`kcloud_data_sharing` is a future or existing cloud transport/sync layer.
It is not the governance authority.

## Expected boundary

- `kcloud_data_sharing` moves packets and sync payloads.
- `multi_ai_governance` decides trust, permissions, leases, approvals, and policy.

## Integration posture

- Case 4 can consume cloud packet and sync state when the transport layer exists.
- Case 4 must not depend on transport authority.
- Case 4 must not duplicate transport responsibilities.

