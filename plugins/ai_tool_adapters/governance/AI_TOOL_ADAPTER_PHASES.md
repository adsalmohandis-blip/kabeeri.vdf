# AI Tool Adapter Phases

This document records the actual plugin phases that exist or are being
introduced in KVDF core.

## Phase 0

Normalize the public identity to `ai_tool_adapter` while keeping the existing
bundle folder, legacy plugin id, and runtime state filenames compatible.

## Phase 1

Discovery and registry state.

- detect tools on `PATH`
- store local registry state
- support manual registration and disablement
- keep execution disabled by default

## Phase 2

Governed run contracts and evidence.

- validate contracts before execution
- require `--confirm`
- record evidence in `.kabeeri/ai_tool_runs.jsonl`
- keep `multi_ai_governance` as the authority layer

## Phase 3

Provider API and integration boundary.

- surface capability and readiness data
- validate whether a contract can run
- return evidence and status summaries
- remain optional and removable

## Phase 6

Read-only visibility surfaces.

- dashboard
- readiness
- evidence
- audit

## Current Limitation

The plugin is already governance-heavy, but it is still not a live adapter for
every external AI coding agent. It remains a controlled integration layer, not
an autonomous authority.
