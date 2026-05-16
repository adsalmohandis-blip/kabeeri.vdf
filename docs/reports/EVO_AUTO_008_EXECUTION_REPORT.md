# EVO_AUTO_008 Execution Report

## Priority

- ID: `evo-auto-008`
- Title: `Source package cleanup and removal workflow`
- Source: `manual_source_package`
- Status: `done`

## Why this priority exists

This priority is the final cleanup step for `KVDF_New_Features_Docs`.
It exists so the source package is not removed until its useful content has been copied into permanent Kabeeri locations, represented in Evolution Steward, and verified by the source-package tooling.

The key idea is safety:

- move or recreate every meaningful asset first
- verify that the destination map is complete
- preview the cleanup before removal
- request owner approval for the final decommission step
- remove the folder only after the verification trail is complete

## Detailed checklist

1. Confirm the workspace is in framework-owner mode.
2. Review `evo-auto-006` and `evo-auto-007` so the design-system and documentation-generator content is already represented in Kabeeri.
3. Verify the destination map lists a permanent home for every meaningful asset.
4. Check that the copied material is reflected in Evolution Steward, docs, and the correct Kabeeri folders.
5. Run the cleanup preview and make sure it reports a safe removal plan.
6. Record any missing destination, duplicate surface, or unresolved overlap as a blocker.
7. Request owner approval only after the verification commands pass.
8. Remove the source folder only when the approval trail, destination map, and verification evidence agree.

## Preconditions

- `evo-auto-006` must have completed overlap and duplicate analysis.
- `evo-auto-007` must have imported the reusable docs-generator flow, templates, and catalog entries.
- The destination map must be complete.
- Source-package verification must pass before removal is requested.

## Guardrails

- Do not delete the source folder if any meaningful asset still lacks a destination.
- Do not treat preview output as deletion approval.
- Do not skip overlap analysis or destination-map verification.
- Do not close the priority if tests or conflict scan fail.
- Do not rely on chat memory as the record of the migration.

## Validation flow

```bash
kvdf source-package map
kvdf source-package verify
kvdf source-package cleanup
npm test
kvdf conflict scan
```

## Expected outputs

- A complete destination map for the source package.
- Evolution Steward entries for the imported systems.
- A cleanup preview report showing the safe removal plan.
- A decommission request trail with explicit owner approval.
- A final note confirming the folder was retired only after verification.

## Rollback plan

- If verification fails, stop before removal and fix the missing destination or duplicate mapping.
- If the owner does not approve decommissioning, keep the source folder intact.
- If a file is missing after a partial move, restore it from the source package backup or the generated destination report before retrying cleanup.

## Summary

`evo-auto-008` is not “delete a folder” work.
It is the controlled retirement of a temporary migration source after the real Kabeeri destinations have been proven, documented, and approved.
