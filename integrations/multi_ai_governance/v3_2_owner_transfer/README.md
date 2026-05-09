# v3.2.0 - Single Owner and Owner Transfer

Goal: prevent top-authority conflict while allowing ownership to transfer safely.

## Rule

There is exactly one Owner at any time.

The old Owner is downgraded immediately after successful transfer. Default downgrade role is `Maintainer` unless the transfer record specifies a stricter role.

## Transfer Token Lifecycle

See [owner_transfer_token_lifecycle.md](owner_transfer_token_lifecycle.md).

States:

- `created`
- `issued`
- `accepted`
- `used`
- `expired`
- `revoked`

## Audit Rules

Every transfer attempt writes audit events for:

- token creation
- token issuance
- token acceptance
- token usage
- old Owner downgrade
- expiry or revocation

## Issues

1. Enforce single owner rule  
   Labels: `permissions`, `owner-transfer`, `priority-high`

2. Design owner transfer token lifecycle  
   Labels: `owner-transfer`, `token-access`, `priority-high`

3. Add owner transfer audit log rules  
   Labels: `owner-transfer`, `docs`, `priority-high`

## Acceptance Criteria

- Single Owner rule is documented.
- There is no scenario with two active Owners.
- Transfer token is single-use.
- Every ownership transfer is auditable.

