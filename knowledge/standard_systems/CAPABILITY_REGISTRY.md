# Capability Registry

The capability registry is the machine-readable catalog of the 53 standard
system areas used by Kabeeri's questionnaire, capability mapping, and
delivery-routing logic.

## What It Records

- capability id and name
- capability group
- owning workstream
- activation states
- question group
- source references for traceability

## Canonical CLI Surface

```bash
kvdf capability list
kvdf capability registry
kvdf capability registry payments_billing
kvdf capability registry map
```

## Source Relationships

- `knowledge/standard_systems/SYSTEM_AREAS_INDEX.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `kvdf validate docs-source-truth`

## Notes

This registry is intentionally aligned with the system-area list already used
by questionnaires and delivery routing. It is not a duplicate taxonomy; it is
the traceable machine-readable form of the same canonical capability catalog.
