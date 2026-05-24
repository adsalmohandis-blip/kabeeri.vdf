# Wi-Fi Data Sharing Usage Policy

`multi_ai_governance` may optionally use `wifi_data_sharing` as a transport provider, but it must never treat the transport plugin as the authority layer.

## Rules

- Transport is optional.
- Governance remains authoritative in `multi_ai_governance`.
- Packets may be created, sent, inspected, and audited only through explicit commands.
- Received packets must not auto-apply to queues, merges, workers, or leadership.
- If the transport plugin is missing, governance commands must continue to operate locally.

## Allowed Uses

- assignment packets
- worker reports
- evidence packets
- node status packets
- other bounded governance packets that are explicitly approved

## Disallowed Uses

- moving governance authority into the transport plugin
- auto-trusting nodes
- auto-consuming inbox packages
- replacing the queue, merge, or leader logic with the transport plugin
