# Wi-Fi Governance Packet Policy

`multi_ai_governance` may create governance packets and send them through `wifi_data_sharing` when the optional transport plugin is available.

## Boundaries

- `multi_ai_governance` is the authority layer.
- `wifi_data_sharing` is the transport layer.
- `wifi_data_sharing` does not make leadership, queue, merge, or approval decisions.
- `wifi_data_sharing` only moves packets between trusted local nodes and lands received data in inbox/quarantine first.
- Packet receive or consume never auto-applies to leader sessions, queues, merges, or assignments.

## Allowed Packet Types

- `assignment_packet`
- `queue_status_packet`
- `evidence_packet`
- `merge_preview_packet`
- `owner_decision_packet`
- `heartbeat_packet`

## Required Safety Rules

- A packet must be created from governed state, not from arbitrary shell input.
- A packet may only be sent to a trusted node through the optional wifi provider.
- `--confirm` is required for important packet sends and packet consumes.
- The packet inspect flow is read-only.
- The packet consume flow records a receipt or audit event only.
- No packet should auto-mutate `multi_ai_governance` leader, queue, merge, or owner state.

## Operational Flow

1. `multi_ai_governance` reads its local governance state.
2. A packet object is created for a queue, leader session, or evidence bundle.
3. The wifi provider checks local transport readiness and trusted node eligibility.
4. The packet is sent through `wifi_data_sharing`.
5. The receiving wifi inbox stores the package without auto-applying it.
6. `multi_ai_governance` may inspect the packet and optionally consume it later with confirmation.

## Owner Confirmation

- Sending important packets requires explicit confirmation.
- Consuming packets requires explicit confirmation.
- Any future automatic queue or merge mutation must be implemented as a separate, explicit governance action.

## Missing Wifi Plugin

- If `wifi_data_sharing` is unavailable, the governance bundle must continue working locally.
- Packet commands should report the integration as unavailable instead of throwing for ordinary absence.
