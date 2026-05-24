# Wi-Fi Data Sharing Security Policy

## Default posture

- Network is disabled by default in the local state.
- Pairing is required before any future transfer phase.
- Data transfer default remains disabled.
- External dependencies are not allowed.

## Discovery posture

- Discovery messages are treated as untrusted candidates only.
- Discovery does not imply trust.
- Discovery does not send project payloads.
- Malformed or foreign packets are ignored.

## Boundary rules

- Do not alter `multi_ai_governance`.
- Do not execute tools.
- Do not assign tasks.
- Do not replace KVDF core commands.

