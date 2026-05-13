# KVDF New Features Docs Placement Plan

## Purpose

Map the source package branches to the exact permanent Kabeeri target folders so redistribution can be executed consistently.

## Routes

| Route | Stream | Source Class | Destination | Note |
| --- | --- | --- | --- | --- |
| software_design_core | software_design_system | 00_START | knowledge/governance/ | Keep routing, manifest, and intake rules in governance. |
| software_design_policy | software_design_system | 01_CORE | knowledge/governance/ | Core operating rules belong in governance. |
| software_design_patterns | software_design_system | 02_PACKS | knowledge/design_system/software_design_reference/ | Reusable analyzed design patterns belong in the permanent reference. |
| software_design_catalogs | software_design_system | 02_PACKS | knowledge/standard_systems/ | Normalized maps and stable catalogs belong in standard systems. |
| software_design_traceability | software_design_system | 99_ARCH | docs/reports/ | Archive evidence and traceability belong in reports. |
| docs_generator_lifecycle | project_docs_generator | r001.md-r015.md | knowledge/documentation_generator/ | Reusable lifecycle guidance belongs in the permanent documentation generator reference. |
| docs_generator_tasks | project_docs_generator | r001.md-r015.md | knowledge/task_tracking/ | Lifecycle and coverage behavior belong in task tracking. |
| docs_generator_governance | project_docs_generator | r001.md-r015.md | knowledge/governance/ | Phase gates and policy rules belong in governance. |
| docs_generator_site | project_docs_generator | p00-p28 | docs/site/ | Rendered docs pages and navigation belong in the docs site. |
| docs_generator_reports | project_docs_generator | r006.csv-r010.json | docs/reports/ | Machine-readable mapping and traceability data belong in reports. |

## Summary

- Software design routes: 5
- Documentation routes: 5
- Destinations covered: 7
