# Owner Roadmap Pipeline

The Owner Roadmap Pipeline is the KVDF Core version of the shared Roadmap Train.

## Rules

- Default delivery mode is direct-to-main.
- The Owner Track is for KVDF Core docs, schemas, tests, validation, and governance changes.
- The queue must be resumable from JSON state, not rebuilt from chat.

## Readiness

Owner readiness should consider:

- docs
- schemas
- tests
- validation
- security
- generated reports
- direct-main readiness

## Train State

- Persist the owner train in `.kabeeri/owner_roadmap_train.json`.
- Use FIFO to find the next unblocked evolution.
- Keep blocked items visible and skip completed items.
