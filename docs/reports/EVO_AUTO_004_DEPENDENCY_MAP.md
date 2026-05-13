# evo-auto-004 Dependency Map

Generated while the active Evolution temporary queue is on the `map` slice.

## Current Target: Runtime Services Layer

We are extracting reusable runtime logic out of command handlers so the planner, relay, scheduler, and governance surfaces share one target-selection path instead of drifting between routers.

### Core code surfaces

- `src/cli/services/ai_planner.js` (Shared candidate-pool builder and scoring logic for leader call, queue add, and sync distribution)
- `src/cli/services/multi_ai_relay.js` (Shared watch/relay rendering loop for inbox and dispatch-board updates)
- `src/cli/commands/multi_ai_governance.js` (Governance command facade now reuses the shared planner and relay sync path)
- `src/cli/commands/multi_ai_communications.js` (Communications facade now routes relay watch through the shared relay service)
- `src/cli/commands/task_scheduler.js` (Scheduler now reuses the shared planner for automatic target selection)
- `src/cli/index.js` (Still contains legacy routing that should stay aligned with the extracted service modules)

### Runtime state surfaces

- `.kabeeri/multi_ai_governance.json`
- `.kabeeri/multi_ai_communications.json`
- `.kabeeri/dashboard/*.json`
- `.kabeeri/reports/*.json`
- `.kabeeri/interactions/*.json`

### Schema surfaces

- `schemas/runtime/`

### Documentation surfaces

- `knowledge/governance/MULTI_AI_GOVERNANCE.md`
- `docs/reports/EVO_AUTO_004_SCOPE_STATEMENT.md`
- `docs/reports/EVO_AUTO_004_DEPENDENCY_MAP.md`

### Test surfaces

- `tests/cli.integration.test.js`
- `npm test`

## Coupled change rule

When the runtime services layer extracts logic, the command facade, runtime state shape, CLI reference text, and integration tests must move together.

The implementation is still responsible for:
- keeping the command entry points stable
- preserving existing Multi-AI governance and relay behavior
- keeping state writes on the repository-backed `.kabeeri` files
- avoiding new scope outside evo-auto-004

## Sync Checkpoint

The runtime-services sync slice is now reflected in the owner checkpoint and the
main capability/command references. The dependency map remains the canonical
surface list for the remaining validation step.
