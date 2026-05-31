# EVO_AUTO_030 Execution Report

## Priority

- ID: `evo-auto-030-docs-cli-sync`
- Title: `Docs-to-CLI Synchronization`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Docs-to-CLI synchronization keeps docs, CLI help, and runtime behavior aligned so no capability is documented without being real. The repo already exposes a synchronized docs-site workflow and sync report, so this priority keeps that contract explicit.

The key idea is alignment:

- docs help matches runtime commands
- the docs site workflow and sync report agree
- manifest, contracts, templates, and coverage all stay in sync
- the site explains what the CLI can actually do

## Detailed checklist

1. Keep docs-site sync as a distinct runtime artifact.
2. Keep CLI help and docs content aligned with runtime behavior.
3. Preserve manifest, contracts, templates, and coverage agreement.
4. Keep the sync report explicit and queryable.
5. Avoid treating docs sync as a one-time generation only.

## Preconditions

- `kvdf docs workflow` exists.
- `kvdf docs validate` exists.
- `kvdf docs sync` exists.
- The docs-site manifest, page contracts, template catalog, and coverage report are present.

## Guardrails

- Do not allow docs and CLI help to drift apart.
- Do not hide sync failures inside a general publishing summary.
- Do not separate the docs site workflow from the sync report.
- Do not weaken the sync surface just because it is already healthy.

## Validation flow

```bash
node bin/kvdf.js docs workflow --json
node bin/kvdf.js docs sync --json
node bin/kvdf.js docs validate --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The docs-site workflow stays synchronized with the docs-site sync report.
- CLI help and docs content stay aligned with runtime behavior.
- Evolution status advances to the project-profile slice.

## Summary

`evo-auto-030` is complete because the docs-site workflow and sync report already agree, and the CLI/docs/runtime surfaces remain aligned. The next session can move on to project profiles.
