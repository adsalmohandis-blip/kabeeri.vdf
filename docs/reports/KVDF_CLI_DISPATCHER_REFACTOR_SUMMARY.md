# KVDF CLI Dispatcher Refactor Summary

Date: 2026-05-16

## What Changed

The main CLI router was split into focused dispatcher modules so `src/cli/dispatchers/ops.js` is no longer a large monolith.

New dispatcher modules:

- `src/cli/dispatchers/safety.js`
- `src/cli/dispatchers/build.js`
- `src/cli/dispatchers/reports.js`
- `src/cli/dispatchers/delivery_ops.js`
- `src/cli/dispatchers/session_ops.js`
- `src/cli/dispatchers/admin_ops.js`
- `src/cli/dispatchers/identity_access.js`
- `src/cli/dispatchers/governance.js`
- `src/cli/dispatchers/evolution_ops.js`
- `src/cli/dispatchers/shared.js`

## Result

- The router is easier to scan and extend.
- Command families are grouped by responsibility instead of being buried in one file.
- Shared dispatcher return-shape logic is centralized in one helper.

## Verification

- `node tests/cli.integration.test.js`
- `node tests/service.unit.test.js`
- `node bin/kvdf.js conflict scan --json`

All checks passed after the refactor.
