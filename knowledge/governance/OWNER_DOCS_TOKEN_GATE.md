# Owner Docs Token Gate

## Purpose

The owner docs surface is not part of the developer-facing docs site. It is a track-gated owner bundle that must be opened explicitly by an active Owner session.

## Behavior

- `kvdf owner docs open` generates a fresh 50-character mixed token.
- The token is valid for one minute from creation.
- Opening the docs again invalidates the previously active token for the current Owner session.
- Closing the Owner session revokes every active owner-docs token.
- `kvdf owner docs status` reports the current token state without exposing the hash.
- `kvdf owner docs close` revokes the active token while keeping the Owner session open.

## Storage

- Runtime state: `.kabeeri/owner_docs_tokens.json`
- Validation schema: `schemas/runtime/owner-docs-token-state.schema.json`
- The token is stored by hash, with only the last 4 characters recorded for inspection.

## Guardrails

- The command is only available when the Owner session is active.
- The command is hidden from developer mode help and routing.
- Expired tokens are swept on read, so stale tokens never stay active.

## Session Coupling

The owner-docs gate is coupled to the active Owner session. When the session is closed or expires, the active owner-docs token is revoked automatically.
