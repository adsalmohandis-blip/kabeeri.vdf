# KVDF New Features Docs Decommission Record

Date: 2026-05-14

## Outcome

`KVDF_New_Features_Docs/` has been removed from the workspace after redistribution and verification.

## Permanent Destinations

### Software Design System stream

- `knowledge/design_system/software_design_reference/`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md`
- `docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md`

### Docs generator stream

- `knowledge/documentation_generator/`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_CLEANUP_PLAN.md`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_DECOMMISSION_REQUEST.md`

### Governance and runtime references

- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `cli/CLI_COMMAND_REFERENCE.md`
- `knowledge/governance/EVOLUTION_STEWARD.md`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`
- `src/cli/services/evolution.js`
- `src/cli/index.js`
- `.kabeeri/evolution.json`
- `tests/cli.integration.test.js`

## Verification

- The source folder no longer exists in the repository workspace.
- Redistribution reports remain in `docs/reports/` as the permanent audit trail.
- The capability reference states that the source folder has been decommissioned and the permanent folders are canonical.

## Notes

- Historical references to `KVDF_New_Features_Docs/` remain in reports and docs only as traceable history.
- No reusable source content should remain in the removed folder.
