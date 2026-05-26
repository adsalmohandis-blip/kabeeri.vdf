# Case 1 Acceptance Audit: IDE Window Governance

## Final Status

`CASE_1_ACCEPTED`

## Scope Audited

Case 1 IDE Window Governance inside the existing `multi_ai_governance` plugin.
No Case 2, Case 3, Case 4, or Case 5 behavior was added during this audit.

## Passed Checks

- The plugin loads from `plugins/multi_ai_governance/plugin.json`.
- The plugin bootstrap loads from `plugins/multi_ai_governance/bootstrap.js`.
- The advertised `kvdf multi-ai ide ...` command surface routes through the session dispatcher and the plugin bundle.
- Runtime state files are created under `.kabeeri/multi_ai_governance/`.
- Schema registry entries match the runtime files written by Case 1.
- JSON state remains valid after repeated command runs.
- Policy decision output is machine-readable and stable.
- Conflict detection works for same-file conflicts.
- Conflict detection works for denied-path conflicts.
- Policy check warns when no valid lease exists.
- Policy check blocks expired leases.
- Policy check requires owner approval for high-risk paths.
- Audit logs are written for IDE window registration.
- Audit logs are written for tool registration.
- Audit logs are written for agent session registration.
- Audit logs are written for lease creation.
- Audit logs are written for lease release.
- Audit logs are written for policy decisions.
- Audit logs are written for conflict detection.
- Audit logs are written for owner approval requests.
- Removed legacy `v3_*` and `v4_0_*` plugin artifacts do not break the plugin manifest, docs links, CLI docs, tests, or system capability references.

## Failed Checks

- Initial top-level CLI smoke through `src/cli/index.js` failed because `plugins/kvdf_dev/runtime/task_packet.js` resolved the repo root one directory too shallow and loaded `src/src/cli/services/command_registry`.
- That failure was unrelated to `multi_ai_governance`, but it blocked the acceptance audit until fixed.

## Fixed Issues

- Corrected `plugins/kvdf_dev/runtime/task_packet.js` so it resolves the repository root from the CLI entrypoint correctly.
- Added explicit audit records for detected IDE lease conflicts in `plugins/multi_ai_governance/commands/ide_window_governance.js`.
- Added explicit audit records for owner approval requests in `plugins/multi_ai_governance/commands/ide_window_governance.js`.
- Added regression assertions in `plugins/multi_ai_governance/tests/ide_window_governance.contract.test.js` for conflict-audit and approval-request-audit coverage.

## Files Changed During This Audit

- `plugins/multi_ai_governance/commands/ide_window_governance.js`
- `plugins/multi_ai_governance/tests/ide_window_governance.contract.test.js`
- `plugins/kvdf_dev/runtime/task_packet.js`
- `plugins/multi_ai_governance/docs/CASE_1_ACCEPTANCE_AUDIT.md`

## Commands Verified

- `kvdf multi-ai ide status`
- `kvdf multi-ai ide register`
- `kvdf multi-ai ide tool status`
- `kvdf multi-ai ide tool register`
- `kvdf multi-ai ide agent status`
- `kvdf multi-ai ide agent register`
- `kvdf multi-ai ide lease status`
- `kvdf multi-ai ide lease create`
- `kvdf multi-ai ide release`
- `kvdf multi-ai ide conflicts`
- `kvdf multi-ai ide policy check`

## Tests Executed

- `node plugins/multi_ai_governance/tests/ide_window_governance.contract.test.js`
- `node tests/service.unit.test.js`
- Top-level CLI smoke through `node src/cli/index.js multi-ai ide ...`
- Direct dispatcher smoke for `multi-ai ide` routing
- Runtime-state smoke for `.kabeeri/multi_ai_governance/`
- Schema registry verification for Case 1 IDE runtime files
- Audit-log verification for conflict detection and owner approval requests

## Remaining Limitations

- Case 2 Local Project Governance is still out of scope.
- Case 3 Wi-Fi/LAN Governance is still out of scope.
- Case 4 GitHub Repo Governance is still out of scope.
- Case 5 KVDOS Cloud Governance is still out of scope.

## Notes

- The Case 1 implementation remains local-first and authority-bound to `multi_ai_governance`.
- `ai_tool_adapter` remains an optional translator and does not own governance decisions.
- `wifi_data_sharing` remains transport-only and does not own IDE governance.

