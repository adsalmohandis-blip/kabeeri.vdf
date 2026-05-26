# Case 3 - Wi-Fi Data Sharing Integration

`wifi_data_sharing` is the transport and discovery layer for Case 3.

## What `wifi_data_sharing` Provides

- peer discovery
- trusted node transport
- package creation and transfer
- inbox/quarantine handling
- local network sync
- packet read/write visibility

## What `multi_ai_governance` Provides

- Wi-Fi/LAN governance identity mapping
- trust and pairing approvals
- permissions and task tokens
- distributed leases
- conflict detection
- policy decisions
- owner approval
- audit and evidence

## Boundary Rules

- `wifi_data_sharing` does not decide permissions.
- `wifi_data_sharing` does not approve tasks or leases.
- `wifi_data_sharing` does not become governance authority.
- `multi_ai_governance` may consume trusted transport metadata from `wifi_data_sharing`, but it owns the decision.

## Packet Flow

1. `wifi_data_sharing` discovers or transports peer data.
2. `multi_ai_governance` maps the peer to a governance identity.
3. `multi_ai_governance` issues or blocks trust, permissions, and leases.
4. `wifi_data_sharing` moves the approved packet or package when asked.
5. `multi_ai_governance` records evidence and audit locally.
