# KVDF New Features Docs Inventory

## Purpose

This report records the current physical inventory of `KVDF_New_Features_Docs/` so its content can be mapped, redistributed into Kabeeri folders, and later removed safely.

## Top-Level Snapshot

The source package currently contains two meaningful systems:

| System | Files |
| --- | ---: |
| `software design system to follow` | 1,036 |
| `software project docs sys to generate` | 259 |

Total files discovered in the package: `1,295`

## System A: `software design system to follow` / Software Design System

This is the reference Software Design System.

### Immediate structure

| Subfolder | Files |
| --- | ---: |
| `02_PACKS` | 938 |
| `01_CORE` | 77 |
| `00_START` | 19 |
| `99_ARCH` | 2 |

### File-type mix

| Extension | Count |
| --- | ---: |
| `.md` | 837 |
| `.docx` | 183 |
| `.json` | 11 |
| `.zip` | 2 |
| no extension | 2 |
| `.csv` | 1 |

### Destination families

The useful content from this system should be redistributed into:

- `knowledge/governance/` for policy and operating rules
- `knowledge/standard_systems/` for stable reference maps and normalized system-design reference data
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md` for capability-level summaries
- `docs/site/` for user-facing learning and reference pages
- `docs/reports/` for migration and analysis reports

## System B: `software project docs sys to generate`

This is the project documentation generation system.

### Immediate structure

| Subfolder | Files |
| --- | ---: |
| `p09` | 13 |
| `p05` | 12 |
| `p11` | 12 |
| `p12` | 12 |
| `p13` | 12 |
| `p07` | 11 |
| `p08` | 11 |
| `p10` | 11 |
| `p14` | 11 |
| `p06` | 11 |
| `p15` | 9 |
| `p16` | 9 |
| `p02` | 9 |
| `p17` | 8 |
| `p03` | 8 |
| `p04` | 8 |
| `p01` | 8 |
| `p18` | 7 |
| `p00` | 6 |
| `p19` | 6 |
| `p22` | 6 |
| `p23` | 6 |
| `p27` | 6 |
| `p24` | 5 |
| `p25` | 5 |
| `p26` | 5 |
| `p28` | 5 |
| `p20` | 4 |
| `p21` | 4 |

### File-type mix

| Extension | Count |
| --- | ---: |
| `.md` | 252 |
| `.json` | 4 |
| `.csv` | 2 |
| `.yaml` | 1 |

### Destination families

The useful content from this system should be redistributed into:

- `docs/site/` for docs-generation guidance and rendered reference pages
- `cli/CLI_COMMAND_REFERENCE.md` for command-facing flows
- `knowledge/task_tracking/` for lifecycle and task-coverage behavior
- `knowledge/governance/` for phase-gate and policy rules
- `docs/reports/` for analysis, migration, and traceability reports

## Working Split

The package should be treated as two separate import streams:

1. reference software design knowledge
2. project documentation generation knowledge

Each stream must be mapped to its own permanent Kabeeri destination before the source package is deleted.

## Next Operational Step

Use the inventory above as the baseline for:

- `kabeeri-076` - inventory and destination mapping
- `kabeeri-077` - verification and decommission
- [KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md](./KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md) - the redistribution contract that consumes this inventory

## Bottom Line

This inventory confirms the package is not a generic inbox. It is a structured source library with a large reference-design branch and a smaller documentation-generator branch, and both branches need permanent homes inside Kabeeri before the source folder can be removed.

## CLI Access

Inspect this inventory with `kvdf source-package inventory` or `kvdf source-package --json`.
