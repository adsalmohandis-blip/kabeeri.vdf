# Single Owner Rule

## Rule

Kabeeri projects must have exactly one active Owner.

## Validation

Project validation fails when:

- no active Owner exists
- more than one active Owner exists
- ownership transfer is partially applied
- old Owner is not downgraded after transfer

## Transfer Result

After successful transfer:

- new identity becomes `Owner`
- previous Owner becomes `Maintainer` by default
- transfer token status becomes `used`
- audit events are written

