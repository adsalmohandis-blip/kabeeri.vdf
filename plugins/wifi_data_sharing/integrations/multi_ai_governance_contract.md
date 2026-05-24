# Multi-AI Governance and Wi-Fi Data Sharing Contract

`multi_ai_governance` may consume `wifi_data_sharing` as an optional transport layer for trusted local packet exchange.

## Contract Boundaries

- `wifi_data_sharing` moves bounded local data packages over the LAN.
- `multi_ai_governance` decides what packages should exist and when they may be sent.
- `wifi_data_sharing` does not approve tasks, assignments, merges, owners, or workers.
- `wifi_data_sharing` does not replace queue planning or merge authority.
- Received packages always land in inbox/quarantine first.
- `multi_ai_governance` must explicitly consume inbox packages later; nothing auto-applies.

## Integration Flow

1. `multi_ai_governance` builds a governance packet.
2. The optional wifi provider creates or validates the local package.
3. `canSendPackage(...)` checks trust, package type, size, and policy.
4. `sendPackage(...)` sends the package only after confirmation.
5. The receiving side stores the package in inbox/quarantine.
6. `multi_ai_governance` may inspect the packet payload, audit the receipt, or later consume the packet record.

## Optional Nature

- If `wifi_data_sharing` is missing, `multi_ai_governance` must continue to work locally.
- The governance bundle must never hard depend on the transport plugin.
- The optional client must return an unavailable status instead of throwing for normal absence.

## Packet Contract Notes

- Governance packets are envelopes around the actual multi-AI intent.
- Packet types include assignment, queue status, evidence, merge preview, owner decision, and heartbeat messages.
- Receiving a packet through wifi does not approve it.
- Consuming a packet records a receipt or audit note only; it does not automatically mutate queues or merges.

## Safety Notes

- No remote packet should auto-promote itself to governance authority.
- No inbox package should mutate multi-AI state unless a future explicit consume path approves it.
- This contract is for transport and evidence only.
