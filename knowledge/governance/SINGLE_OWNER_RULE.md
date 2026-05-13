# Single Owner Rule

Kabeeri projects must have exactly one active Owner.

## Validation

Validation fails when:

- no active Owner exists in the real project workspace
- more than one active Owner exists
- ownership transfer is partially applied
- old Owner is not downgraded after transfer
- Owner authentication points to an inactive or different identity

## Transfer Result

After successful transfer:

- the new identity becomes `Owner`
- the previous Owner becomes `Maintainer` unless the transfer token specifies a stricter downgrade
- the owner transfer token status becomes `used`
- a transfer audit event is written
- dashboards hide the secret token value and show only safe token metadata
- the transfer token keeps `issued_at`, `accepted_at`, `used_at`, and `transfer_path` fields so the ownership chain is auditable

## Non-Negotiable Rule

No task, release, publish decision, owner transfer, or final verification can be final when the active Owner state is invalid.
