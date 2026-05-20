# Canonical Truth And Reconciliation

KVDF must reconcile current source-level evidence before it claims a capability or Evolution is implemented.

## Source Truth Hierarchy

1. Source truth: `src/cli/commands/*`, `src/cli/dispatchers/*`, `src/cli/index.js`, `schemas/`, `tests/`, `package.json`, and plugin manifests.
2. Documentation truth: `docs/cli/CLI_COMMAND_REFERENCE.md`, `docs/SYSTEM_CAPABILITIES_REFERENCE.md`, `docs/workflows/*`, and `knowledge/governance/*`.
3. Runtime truth: `.kabeeri/planner.json`, `.kabeeri/evolution.json`, `.kabeeri/tasks.json`, `.kabeeri/dashboard/*`, and `.kabeeri/reports/*`.
4. Generated snapshots: `docs/reports/*` and other generated matrices or audits.
5. Chat/manual planning: supporting context only.

## Rules

- Runtime state alone never proves implementation.
- Generated reports are snapshots, not canonical truth.
- A capability is implemented only when source evidence exists.
- KVDF should mark runtime-only, documented-only, and stale-planned items clearly instead of promoting them to implemented.
- When source, docs, runtime, and snapshots conflict in a way that is ambiguous, KVDF must stop and ask the Owner.

## Commands

- `kvdf truth audit --json` compares source, docs, runtime, and generated snapshots.
- `kvdf truth feature <feature-id> --json` checks one capability or command surface.
- `kvdf planner truth --json` summarizes planner command, doc, schema, test, and runtime evidence.
- `kvdf evolution reconcile --json` compares evolution runtime state against source-level evidence.

## Practical Outcome

Use truth reconciliation before planning the next Evolution, before trusting a stale recommendation, and before treating runtime backlog items as current implementation.
