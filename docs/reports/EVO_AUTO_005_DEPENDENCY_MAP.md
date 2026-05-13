# evo-auto-005 Dependency Map

Generated while the active Evolution temporary queue is on the `scope` slice.

## Current Target: Manual source package intake

The folder `KVDF_New_Features_Docs/` is intentionally handled as a manual-only
source package. The runtime already blocks it from automatic repository scans,
and task memory preserves it as a protected dual-purpose source package that
contains both reference software design material and project documentation
generator material.

### Core runtime surfaces

- `src/cli/validate.js` - excludes `KVDF_New_Features_Docs` from automatic
  validation scans until migration is complete.
- `docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md` - baseline inventory for
  the current source package tree and destination mapping work.
- `docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md` - redistribution
  contract that maps the inventory into permanent Kabeeri folders.
- `kvdf source-package` - CLI surface for the study, inventory, destination
  map, comparison, and verification state of the source package.
- `src/cli/services/manual_feature_docs.js` - central manual source-package
  helpers and the protected-folder rule shared by runtime checks.
- `src/cli/services/task_memory.js` - adds the protected source-package rule to
  task memory so task execution does not try to recreate or relocate the folder.
- `knowledge/design_system/software_design_reference/` - permanent home for the
  analyzed software design reference library.
- `knowledge/documentation_generator/` - permanent home for the reusable
  documentation lifecycle generator knowledge.

### Governance surfaces

- `knowledge/governance/EVOLUTION_STEWARD.md`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`

### Documentation surfaces

- `docs/reports/EVO_AUTO_005_SCOPE_STATEMENT.md`
- `docs/reports/EVO_AUTO_005_DEPENDENCY_MAP.md`
- `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md`
- `OWNER_DEVELOPMENT_STATE.md`

### Validation surfaces

- `npm test`
- `node bin/kvdf.js conflict scan`

## Coupled change rule

When the manual source-package priority is updated, the protection rule, owner
checkpoint, and Evolution summary should stay aligned. This prevents the folder
from silently becoming a normal scan target in a future session.

The implementation is still responsible for:
- keeping the source package manually requested only
- preserving the protected-folder rule in task memory
- keeping automatic scans from treating the source package as current source
- avoiding new scope outside `evo-auto-005`
