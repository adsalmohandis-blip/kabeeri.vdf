# Runtime Schema Registry

Kabeeri runtime state lives under `.kabeeri/`. The registry in
`schemas/runtime/schema_registry.json` maps those local JSON and JSONL files to
their validation schemas so CLI checks, AI assistants, dashboard code, and team
members can agree on the same state contracts.

This layer catches accidental runtime drift early without replacing the
feature-specific validators already in `src/cli/validate.js`. Feature
validators still enforce business rules such as task boundaries, workstream
rules, Owner verification, policy gates, and design gates. Runtime schemas
enforce the structural shape of the state files those rules read.

## What It Covers

- Workspace identity and project state.
- Tasks, apps, features, journeys, Agile state, and sprints.
- Developers, agents, workstreams, locks, sessions, and task access tokens.
- Policies, AI usage, context packs, preflights, model routing, and handoff.
- Security scans, migration plans, design governance, ADRs, AI run history,
  prompt compositions, Vibe suggestions, and post-work captures.
- JSONL event streams such as audit events, AI usage events, AI runs, Vibe
  intents, memory records, and approval/event logs.

## Commands

```bash
kvdf validate runtime-schemas
kvdf validate runtime
kvdf validate
```

`kvdf validate runtime-schemas` checks three things:

1. The registry file is valid JSON.
2. Every schema referenced by the registry exists and is valid JSON.
3. Every existing mapped `.kabeeri/` JSON or JSONL runtime file matches its
   registered schema.

`kvdf validate` includes runtime schema validation as part of the full
repository health check.

## Adding A Runtime File

When a new CLI feature writes `.kabeeri/something.json` or
`.kabeeri/something.jsonl`:

1. Add a schema under `schemas/runtime/`.
2. Add the file path and schema path to `schemas/runtime/schema_registry.json`.
3. Add or update the feature-specific validator in `src/cli/validate.js` when
   business rules are needed beyond structure.
4. Add an integration test that runs `kvdf validate runtime-schemas` or the
   relevant scoped validator.

Schemas should be strict enough to catch invalid structures but tolerant enough
to read older local state safely. Use feature validators for deeper rules.
