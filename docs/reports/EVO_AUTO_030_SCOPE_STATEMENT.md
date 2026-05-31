# EVO_AUTO_030 Scope Statement

## Priority

- ID: `evo-auto-030-docs-cli-sync`
- Title: `Docs-to-CLI Synchronization`
- Source: `new_features_docs_study`

## Scope

This priority keeps docs, CLI help, and runtime behavior aligned so no capability is documented without being real.

The scope includes:

- docs-site workflow sync
- manifest/contract/template agreement
- CLI/docs/runtime alignment

## Out of scope

- treating docs generation as a standalone artifact
- allowing CLI help to drift away from runtime behavior
- hiding sync status inside a generic report

## Success criteria

- workflow and sync report agree
- manifest/contracts/templates remain aligned
- docs help mirrors runtime behavior
- downstream docs-generation work can rely on the synced surface
