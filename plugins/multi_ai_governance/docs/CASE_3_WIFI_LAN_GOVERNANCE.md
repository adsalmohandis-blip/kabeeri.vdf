# Case 3 - Wi-Fi / LAN Governance

Case 3 extends `multi_ai_governance` from single-IDE and single-machine control into local network governance across multiple computers, runners, and devices connected through Wi-Fi/LAN.

## Authority Split

- `multi_ai_governance` owns identity, trust, permissions, tokens, leases, conflicts, approval, and audit.
- `wifi_data_sharing` owns discovery, transport, packet exchange, and local network sync.
- `ai_tool_adapter` remains an optional translation layer only.
- `.kabeeri/` remains the local runtime source of truth.

## Governance Model

Wi-Fi/LAN nodes are mapped into governance identities with:

- `wifi_node_id`
- `governance_node_id`
- `machine_id`
- `project_id`
- `node_type`
- `hostname`
- `local_ip`
- `wifi_data_sharing_peer_id`
- `trust_status`
- `owner_approved`
- `paired_at`
- `last_seen_at`
- `status`
- `capabilities`

Node mapping and trust are recorded under:

- `.kabeeri/multi_ai_governance/wifi_nodes.json`
- `.kabeeri/multi_ai_governance/wifi_node_identity_map.json`
- `.kabeeri/multi_ai_governance/wifi_trust.json`

## Commands

- `kvdf multi-ai wifi status`
- `kvdf multi-ai wifi nodes`
- `kvdf multi-ai wifi map-node`
- `kvdf multi-ai wifi trust status`
- `kvdf multi-ai wifi pair request`
- `kvdf multi-ai wifi pair approve`
- `kvdf multi-ai wifi pair deny`
- `kvdf multi-ai wifi revoke`
- `kvdf multi-ai wifi permissions`
- `kvdf multi-ai wifi token issue`
- `kvdf multi-ai wifi token status`
- `kvdf multi-ai wifi lease create`
- `kvdf multi-ai wifi lease status`
- `kvdf multi-ai wifi release`
- `kvdf multi-ai wifi conflicts`
- `kvdf multi-ai wifi policy check`

## What It Does

- Maps observed LAN peers into governance identities.
- Separates untrusted, pairing-requested, trusted, revoked, expired, and blocked nodes.
- Requires owner approval before high-risk Wi-Fi/LAN actions.
- Keeps distributed leases separate from IDE-window and local-project leases, while still checking for conflicts across layers.
- Writes policy evidence and audit records under `.kabeeri/multi_ai_governance/`.

## What It Does Not Do

- It does not move transport authority into `wifi_data_sharing`.
- It does not implement GitHub repo governance.
- It does not implement cloud governance.
- It does not replace Case 1 or Case 2 identity models.
