# Case 4 KCloud Data Sharing Boundary

`kcloud_data_sharing` is the cloud transport/sync layer for Kabeeri / KVDOS Cloud.
It is not the governance authority.

## Responsibilities that belong to kcloud_data_sharing

- Cloud packet transport.
- Cloud sync transport.
- Peer delivery and receipt handling.
- Cloud data movement only.

## Responsibilities that belong to multi_ai_governance

- Cloud identity mapping.
- Trust and approval decisions.
- Task permissions and leases.
- Conflict detection.
- Policy decisions.
- Audit and evidence.

## What not to duplicate

- Local project governance.
- Wi-Fi/LAN governance.
- IDE window governance.
- GitHub provider behavior.

## Future note

If `kcloud_data_sharing` is added later, `multi_ai_governance` should consume its packet and sync state, then decide whether the cloud work is allowed.

