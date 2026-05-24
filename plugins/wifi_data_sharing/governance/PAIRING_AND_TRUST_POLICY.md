# Pairing And Trust Policy

Discovery is not trust.

The Wi-Fi Data Sharing plugin treats discovered nodes as candidates only. A node becomes trusted only after:

1. The owner creates a pairing session for that candidate node.
2. The pairing code is verified before expiry.
3. The owner explicitly confirms trust with `--confirm`.

Rules:

- Discovery does not auto-promote a node to trusted.
- Pairing codes are short-lived and expire after 10 minutes.
- Pairing sessions store only a hash of the code, not the raw code.
- Trust is a separate action from pairing verification.
- A revoked node cannot receive data until a new pairing session is created and verified.
- Transfer remains disabled in this phase.
- The plugin never mutates `multi_ai_governance`.

Trusted node records are local-only state and should be treated as an operator-managed registry, not as remote identity proof. If a node is revoked, the revocation reason is recorded and the node stays blocked until the owner repeats the pairing flow.
