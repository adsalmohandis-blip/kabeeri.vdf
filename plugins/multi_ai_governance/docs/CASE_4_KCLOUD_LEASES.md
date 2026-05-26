# Case 4 KCloud Leases

KCloud leases protect cloud AI work across files, folders, branches, runners, channels, sync flows, and release gates.

## Lease types

- `task`
- `file`
- `folder`
- `branch`
- `runner`
- `cloud_channel`
- `cloud_sync`
- `approval_flow`
- `release_gate`

## Lease rules

- A valid cloud task token must exist before a lease is issued.
- Cloud leases must not collide with active Case 2 local leases.
- Cloud leases must not collide with active Case 3 Wi-Fi/LAN leases.
- High-risk leases can require owner approval.

