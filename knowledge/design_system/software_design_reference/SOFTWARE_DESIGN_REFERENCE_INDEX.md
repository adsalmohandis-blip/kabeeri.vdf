# Software Design Reference Index

This index organizes the permanent software-design knowledge extracted from
source packages such as `KVDF_New_Features_Docs/`.

## Reference Families

| Family | Purpose | Destination |
| --- | --- | --- |
| Source package study | Preserve the high-level interpretation of the imported system. | `docs/reports/`, `knowledge/design_system/software_design_reference/` |
| System patterns | Keep reusable architecture and boundary patterns. | `knowledge/design_system/software_design_reference/` |
| Routing and governance | Store rules for how the system should be handled in future imports. | `knowledge/governance/` |
| Capability mapping | Keep the canonical mapping from capabilities to permanent Kabeeri areas. | `knowledge/standard_systems/`, `docs/SYSTEM_CAPABILITIES_REFERENCE.md` |
| Duplicate analysis | Prevent re-creating existing capabilities under new names. | `knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_DUPLICATE_ANALYSIS.md`, `kvdf software-design compare` |
| Migration traceability | Record where imported knowledge went and why. | `docs/reports/` |

## Imported Knowledge Types

- architecture and system-design observations
- software reference patterns
- capability deduplication signals
- routing and boundary rules
- permanent storage targets
- extraction and decommission rules

## Related Command Surfaces

```bash
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package compare
kvdf source-package verify
kvdf software-design compare
```

## Notes

This index is intentionally compact. The detailed evidence stays in the
source-package reports and the permanent destination folders that receive the
extracted knowledge.
