# evo-auto-007 Dependency Map

Generated while the docs-generator import slice is completed.

## Completed Target: Project documentation generator import

The reusable docs flow, templates, and catalog entries from the source package
now live in the permanent `knowledge/documentation_generator/` reference home.

### Core runtime surfaces

- `src/cli/commands/reference_folders.js` - exposes `docs-generator` and its
  compare/index/show surfaces.
- `knowledge/documentation_generator/` - permanent reference home for the
  reusable documentation lifecycle knowledge.
- `knowledge/documentation_generator/DOCS_GENERATION_REFERENCE.md` - canonical
  reference guide for the reusable docs flow.
- `knowledge/documentation_generator/DOCS_GENERATION_CATALOG.json` - catalog of
  the imported docs-generator sections and knowledge entries.
- `knowledge/documentation_generator/DOCS_GENERATION_DUPLICATE_ANALYSIS.md` -
  overlap analysis that guards against duplicate docs-generator naming.
- `src/cli/commands/source_package.js` - source-package compare path that
  remains the bridge from the old source package into the permanent folder.

### Governance surfaces

- `knowledge/governance/EVOLUTION_STEWARD.md`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`

### Validation surfaces

- `node bin/kvdf.js docs-generator --json`
- `node bin/kvdf.js docs-generator compare --json`
- `node bin/kvdf.js conflict scan`

## Coupled change rule

When this import is updated, the permanent docs-generator reference, the
duplicate-analysis report, and the docs command surface should stay aligned.
The goal is to reuse the same lifecycle vocabulary everywhere.

## Bottom Line

The docs-generator import is complete and retained as history. Future work
should build on the permanent `knowledge/documentation_generator/` reference
instead of reintroducing the old source package.
