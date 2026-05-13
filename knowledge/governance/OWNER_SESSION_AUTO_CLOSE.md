# Owner Session Auto-Close

## Purpose

The Owner session must not leak across chat sessions or linger after the Owner is done. A fresh session should always start with fresh access state.

## Behavior

- `kvdf owner session close` ends the active Owner session explicitly.
- `kvdf owner logout` is an alias for ending the active Owner session.
- Closing the session revokes any active owner-docs token.
- Expired sessions are swept when the Owner session state is read.

## Storage

- Runtime state: `.kabeeri/session.json`
- The session file records the active flag, owner id, timestamps, and close reason.

## Guardrails

- Owner docs cannot remain active after the session closes.
- A new session starts from a clean token state.
- Session expiry is treated as a terminal condition and is closed immediately on read.

## Notes

This policy is a framework-owner maintenance rule. It belongs in the owner bundle and should not be surfaced to developers as a general application behavior.
