# evo-auto-006 Dependency Map

Generated while the duplicate-analysis slice is completed.

## Completed Target: Reference design duplicate analysis

The Software Design System content from `KVDF_New_Features_Docs/` was compared
against the central capability map to identify overlap and avoid duplicate
capability naming.

### Core runtime surfaces

- `src/cli/commands/source_package.js` - exposes the `compare` action that
  produces the duplicate-analysis report.
- `docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md` - the permanent
  duplicate-analysis output for the source package.
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md` - canonical capability inventory used
  to detect overlap.
- `src/cli/services/manual_feature_docs.js` - protected-folder helper used to
  keep the source package manual-only.
- `src/cli/services/task_memory.js` - preserves the protected source-package
  rule in task memory.

### Governance surfaces

- `knowledge/governance/EVOLUTION_STEWARD.md`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`

### Validation surfaces

- `node bin/kvdf.js source-package compare --json`
- `node bin/kvdf.js source-package verify --json`
- `node bin/kvdf.js conflict scan`

## Coupled change rule

When this analysis is updated, the duplicate-analysis report, the capability
map, and the source-package protection rule should stay aligned. The goal is to
reuse existing capability names rather than creating a parallel vocabulary.

## Bottom Line

The duplicate-analysis work is complete and retained as history. Future work
should reuse the same capability map and source-package boundaries.
