# KVDF New Features Docs Destination Map

## Purpose

This report maps the current `KVDF_New_Features_Docs/` inventory into permanent Kabeeri destinations. It is the bridge between the physical source package and the final redistributed state.

## Mapping Principles

- Keep reference software design assets in governance and standard-system references.
- Keep project documentation generator assets in docs, reports, and lifecycle governance.
- Preserve traceability while moving content.
- Remove the source folder only after the destination map is complete and verified.

## System A: Software Design System

The `software design system to follow` branch is the larger Software Design System reference library. Its useful content should be redistributed into these permanent homes:

- `knowledge/governance/`
  - operating rules
  - reference intake contracts
  - routing and governance principles
- `knowledge/design_system/software_design_reference/`
  - analyzed software design system references
  - reusable architecture and boundary patterns
- `knowledge/standard_systems/`
  - normalized reference maps
  - stable system-design catalogs
  - reusable policy and structure references
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
  - capability-level summaries and import targets
- `docs/site/`
  - human-readable capability pages and learning surfaces
- `docs/reports/`
  - migration reports, duplicate analysis, and extraction notes

### Content classes in this branch

- `01_CORE`
  - move policy and operating content into `knowledge/governance/`
- `02_PACKS`
  - move reusable capability patterns into `knowledge/standard_systems/` and `docs/site/`
  - keep examples and summaries in `docs/reports/`
- `00_START`
  - move entry routing and package manifest knowledge into `knowledge/governance/` and `docs/reports/`
- `99_ARCH`
  - preserve traceability notes in `docs/reports/` before removing the folder

## System B: project documentation generator system

The `software project docs sys to generate` branch is the documentation lifecycle generator. Its useful content should be redistributed into these permanent homes:

- `docs/site/`
  - generation guidance
  - rendered reference pages
  - navigation and usage docs
- `knowledge/documentation_generator/`
  - reusable lifecycle rules
  - document phase contracts
  - generator guidance
- `cli/CLI_COMMAND_REFERENCE.md`
  - command-facing documentation flows and usage patterns
- `knowledge/task_tracking/`
  - lifecycle rules
  - phase-gate logic
  - coverage and tracking behavior
- `knowledge/governance/`
  - policy, quality, and decision gates
- `docs/reports/`
  - phase analysis, migration notes, and traceability reports

### Content classes in this branch

- `r001.md` to `r015.md`
  - route into `knowledge/task_tracking/`, `knowledge/governance/`, and `docs/reports/` depending on whether the content is lifecycle, policy, or report-oriented
- `r006.csv`, `r007.json`, `r010.json`
  - preserve as machine-readable reference data in `docs/reports/` or `knowledge/standard_systems/` if reused directly
- `p00` to `p28`
  - route the phase docs into the appropriate combination of `docs/site/`, `knowledge/task_tracking/`, `knowledge/governance/`, and `docs/reports/`

## Traceability Requirements

Before deletion of the source folder:

1. every meaningful asset must have a destination
2. every destination must be represented in a report or manifest
3. duplicate or overlapping capabilities must be resolved
4. any remaining source-only note must be copied into Kabeeri first

## Recommended Operational Use

Use this map together with:

- [KVDF_NEW_FEATURES_DOCS_INVENTORY.md](./KVDF_NEW_FEATURES_DOCS_INVENTORY.md)
- [KVDF_NEW_FEATURES_DOCS_STUDY.md](./KVDF_NEW_FEATURES_DOCS_STUDY.md)
- `evo-auto-006`
- `evo-auto-007`
- `evo-auto-008`
- `kabeeri-076`
- `kabeeri-077`

## Bottom Line

This map is the redistribution contract for the source package. It answers where every useful part goes inside Kabeeri so the source folder can be safely retired after migration is complete.

## CLI Access

Inspect this destination contract with `kvdf source-package map` or `kvdf source-package verify`.
