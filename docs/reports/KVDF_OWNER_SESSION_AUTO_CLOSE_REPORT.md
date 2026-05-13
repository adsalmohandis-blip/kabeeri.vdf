# KVDF Owner Session Auto-Close Report

## Summary

This report documents the owner-session lifecycle rule that closes the session explicitly and revokes active owner-docs tokens when the session ends or expires.

## What Was Added

- `kvdf owner session status`
- `kvdf owner session close`
- `kvdf owner logout` as a close alias
- automatic owner-docs token revocation on session close
- automatic expiry sweep for owner session state

## Operational Rules

- An active Owner session is required before opening the owner docs surface.
- Session expiry closes the session immediately when state is read.
- Closing the session invalidates active owner-docs tokens.
- The next session always starts from a clean access state.

## Validation

- Owner session state is schema-aware through `.kabeeri/session.json` and the runtime registry.
- The owner CLI help surface exposes session controls only in owner mode.
- Session closure is reflected in the owner status report.

## Outcome

Owner session lifecycle is now explicit and bounded, preventing stale access from surviving across conversations.
