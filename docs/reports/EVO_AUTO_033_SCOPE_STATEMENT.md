# EVO_AUTO_033 Scope Statement

## Priority

- ID: `evo-auto-033-doc-generation`
- Title: `Documentation Generation Flow`
- Source: `new_features_docs_study`

## Scope

This priority treats docs generation as a first-class workflow with a template catalog, generated site manifest, page contracts, coverage reporting, and sync validation.

The scope includes:

- docs generation workflow
- template/manifest/page-contract alignment
- validation and coverage refresh

## Out of scope

- treating docs generation as a loose file export
- skipping validation after generation
- letting workflow state drift from generated artifacts

## Success criteria

- the generator refreshes the site artifacts
- the workflow report stays resumable
- the generated artifacts stay in sync
- downstream docs-site publishing can rely on the workflow
