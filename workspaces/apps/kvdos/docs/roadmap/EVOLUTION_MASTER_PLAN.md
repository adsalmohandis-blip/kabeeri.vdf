# KVDOS Evolution Master Plan

This is the navigation source for the full KVDOS evolution package.
It defines the current shipped/local foundation, the planned v1.0 hardening work, the later v1.x planning tracks, the v2.0 commercial direction, and the future-only areas that must not be implemented yet.

KVDOS is the product.
KVDF is the governance/tooling layer used to build and support KVDOS.

## KVDF Terminology Used in KVDOS

- Evolution: one delivery slice in the KVDOS roadmap.
- Task: a closable unit of work under an Evolution.
- Task Punch: the generated batch of Tasks for an Evolution.
- Owner Approval Gate: the checkpoint the Owner must approve before moving forward.
- Evolution Handoff: the final report produced after an Evolution.
- Future-only Evolution Track: a track that must stay out of implementation until separately approved.

## Package Map

| Document | Purpose |
| --- | --- |
| [V1_0_EVOLUTIONS.md](./V1_0_EVOLUTIONS.md) | Canonical index for the shipped foundation plus the v1.0 hardening evolutions |
| [V1_2_DESKTOP_ARCHITECTURE_DECISION.md](./V1_2_DESKTOP_ARCHITECTURE_DECISION.md) | The completed desktop / IDE decision record |
| [V1_3_DESKTOP_STUDIO_SKELETON.md](./V1_3_DESKTOP_STUDIO_SKELETON.md) | The completed desktop Studio preview package |
| [Desktop Packaging Architecture](../desktop/DESKTOP_PACKAGING_ARCHITECTURE.md) | The packaging direction and Tauri preference record |
| [Tauri Readiness Checklist](../desktop/TAURI_READINESS_CHECKLIST.md) | The readiness gate before any Tauri install |
| [Desktop Packaging Roadmap](../desktop/DESKTOP_PACKAGING_ROADMAP.md) | The planned packaging track after live snapshot UX validation |
| [V1_X_EVOLUTIONS.md](./V1_X_EVOLUTIONS.md) | Completed desktop track, later packaging track, later local-execution track, and later bridge/plugin/cloud planning tracks |
| [V2_0_PLATFORM_EVOLUTIONS.md](./V2_0_PLATFORM_EVOLUTIONS.md) | Commercial platform direction after the local-first foundation |
| [KVDOS UI/UX Evolution Track](./KVDOS_UIUX_EVOLUTION_TRACK.md) | The UI/UX evolution package required to deliver the full studio shell, pages, flows, and developer surfaces |
| [KVDOS UI/UX Version Ladder](./KVDOS_UIUX_VERSION_LADDER.md) | The versioned delivery map for the UI/UX evolution package, including the older desktop prerequisites |
| [KVDOS UI/UX ux-0 Execution Pack](./KVDOS_UIUX_UX0_EXECUTION_PACK.md) | The first concrete execution slice for the shared shell contract |
| [KVDOS UI/UX Recreated Evolution Set](./KVDOS_UIUX_RECREATED_EVOLUTION_SET.md) | The single consolidated evolution map that combines the legacy desktop evolutions with the recreated UI/UX version ladder |
| [KVDOS Recreated UI/UX Task Punch](./KVDOS_UIUX_RECREATED_TASK_PUNCH.md) | The consolidated task-punch map for the recreated UI/UX evolution set |
| [KVDOS UI/UX Version-By-Version Punch](./KVDOS_UIUX_VERSION_BY_VERSION_PUNCH.md) | The strict build order from version bundle to punch slice |
| [KVDOS UI/UX JSON Exports](./generated-uiux-json-clean/KVDOS_UIUX_RECREATED_INDEX.json) | Machine-readable JSON exports for every recreated evo and task |
| [KVDOS UI/UX Micro Task Punch](./KVDOS_UIUX_MICRO_TASK_PUNCH.md) | The atomic IDE-side micro-task punch layer |
| [KVDOS UI/UX Micro JSON Exports](./generated-uiux-micro-json-clean/KVDOS_UIUX_MICRO_INDEX.json) | Machine-readable JSON exports for every micro evo and micro task |
| [KVDOS Cloud Micro Task Punch](./KVDOS_CLOUD_MICRO_TASK_PUNCH.md) | The atomic cloud-side micro-task punch layer |
| [KVDOS UI/UX Task Punch](./KVDOS_UIUX_TASK_PUNCH.md) | The slice-by-slice punch map for the full UI/UX evolution track |
| [KVDOS UI/UX Spec Completion Track](./KVDOS_UIUX_SPEC_COMPLETION_TRACK.md) | The missing-spec evolution package for page-by-page detail, states, and interaction rules |
| [KVDOS UI/UX Spec Completion Task Punch](./KVDOS_UIUX_SPEC_COMPLETION_TASK_PUNCH.md) | The slice-by-slice punch map for the missing-spec completion track |
| [KVDOS UI/UX Page Matrix](./KVDOS_UIUX_PAGE_MATRIX.md) | The first page-by-page matrix for the launch, home, and workspace surfaces |
| [KVDOS UI/UX Page Microcopy](./KVDOS_UIUX_PAGE_MICROCOPY.md) | The desktop-side exact button and helper copy annex |
| [KVDOS UI Page Button Catalog](./KVDOS_UI_PAGE_BUTTON_CATALOG.md) | The desktop-side exact primary button catalog |
| [KVDOS UI Implementation Component Matrix](./KVDOS_UI_IMPLEMENTATION_COMPONENT_MATRIX.md) | The desktop-side implementation-ready component and data contract matrix |
| [KVDOS UI State Tables](./KVDOS_UI_STATE_TABLES.md) | The desktop-side page state tables |
| [KVDOS Cloud UI/UX Track](./KVDOS_CLOUD_UIUX_TRACK.md) | The cloud-side UI/UX package for public, user, and admin dashboard surfaces |
| [KVDOS Cloud UI/UX Task Punch](./KVDOS_CLOUD_UIUX_TASK_PUNCH.md) | The slice-by-slice punch map for the cloud UI/UX track |
| [KVDOS Cloud Page Matrix](./KVDOS_CLOUD_PAGE_MATRIX.md) | The page-by-page cloud matrix covering user and admin dashboard pages |
| [KVDOS Cloud User Flows](./KVDOS_CLOUD_USER_FLOWS.md) | The cloud-side user flow documentation |
| [KVDOS Cloud User Flows Visual](./KVDOS_CLOUD_USER_FLOWS_VISUAL.md) | The cloud-side visual flow companion |
| [KVDOS Cloud UI Component Inventory](./KVDOS_CLOUD_UI_COMPONENT_INVENTORY.md) | The cloud-side UI component inventory |
| [KVDOS Cloud Page Microcopy](./KVDOS_CLOUD_PAGE_MICROCOPY.md) | The cloud-side exact button and helper copy annex |
| [KVDOS Cloud Implementation Component Matrix](./KVDOS_CLOUD_IMPLEMENTATION_COMPONENT_MATRIX.md) | The cloud-side implementation-ready component and data contract matrix |
| [KVDOS Cloud State Tables](./KVDOS_CLOUD_STATE_TABLES.md) | The cloud-side page state tables |
| [KVDOS Cloud UI Wireframe Order](./KVDOS_CLOUD_UI_WIREFRAME_ORDER.md) | The cloud-side page hierarchy and wireframe order |
| [KVDOS Cloud Spec Page Matrix](./KVDOS_CLOUD_SPEC_PAGE_MATRIX.md) | The cloud-side spec completion page matrix bridge |
| [KVDOS Cloud Spec Completion Track](./KVDOS_CLOUD_SPEC_COMPLETION_TRACK.md) | The missing-spec cloud package for recovery, billing, activation, and admin detail |
| [KVDOS Cloud Spec Completion Task Punch](./KVDOS_CLOUD_SPEC_COMPLETION_TASK_PUNCH.md) | The slice-by-slice punch map for the cloud missing-spec completion track |
| [KVDOS Cloud To Desktop Crosswalk](./KVDOS_CLOUD_TO_DESKTOP_CROSSWALK.md) | The shared-concept mapping between cloud and desktop surfaces |
| [KVDOS Shared State Crosswalk](./KVDOS_SHARED_STATE_CROSSWALK.md) | The shared state mapping between cloud and desktop surfaces |
| [KVDOS Missing States Checklist](./KVDOS_MISSING_STATES_CHECKLIST.md) | The residual state review checklist for desktop and cloud |
| [KVDOS UI/UX Combined Roadmap Summary](./KVDOS_UIUX_COMBINED_ROADMAP_SUMMARY.md) | The short combined summary of the desktop and cloud UI/UX plan |
| [KVDOS UI/UX Master Roadmap Index](./KVDOS_UIUX_MASTER_ROADMAP_INDEX.md) | The single ordered index for all UI/UX annexes |
| [FUTURE_ONLY_TRACKS.md](./FUTURE_ONLY_TRACKS.md) | Tracks that must stay future-only until explicitly approved |
| [EVOLUTION_EXECUTION_RULES.md](./EVOLUTION_EXECUTION_RULES.md) | Planning and execution rules for all evolutions |
| [EVOLUTION_DEPENDENCY_MAP.md](./EVOLUTION_DEPENDENCY_MAP.md) | Dependency overview across the full roadmap |
| [OWNER_APPROVAL_GATES.md](./OWNER_APPROVAL_GATES.md) | Owner Approval Gates for planning and implementation |
| [KVDF Discovery README](../generated/kvdf-discovery/README.md) | Draft source-doc package overview for the KVDF discovery materials |
| [KVDF Source Docs Index](../generated/kvdf-discovery/SOURCE_DOCS_INDEX.md) | File index for the imported KVDF-generated source docs |
| [KVDF Discovery Manifest](../generated/kvdf-discovery/MANIFEST.md) | Import manifest and promotion notes for the generated source-doc package |

Reference documents already in the repo:

- [KVDOS Roadmap](./ROADMAP.md)
- [KVDOS v1.0 Hardening Plan](./V1_0_HARDENING_PLAN.md)
- [KVDOS v1.0 Owner Review](./V1_0_OWNER_REVIEW.md)
- [KVDOS v1.0 Task Punch](./V1_0_TASK_PUNCH.md)
- [KVDOS v1.0 Release Checklist](./V1_0_RELEASE_CHECKLIST.md)
- [KVDOS v1.0 Release Notes Draft](./V1_0_RELEASE_NOTES_DRAFT.md)
- [Post-v1 Evolution Roadmap](./POST_V1_EVOLUTION_ROADMAP.md)
- [KVDOS Release Ladder](./KVDOS_RELEASE_LADDER.md)
- [Future Tracks And Boundaries](./FUTURE_TRACKS_AND_BOUNDARIES.md)
- [KVDF-Generated KVDOS Discovery Docs](../generated/kvdf-discovery/README.md)
- [KVDF-Generated Source Docs Index](../generated/kvdf-discovery/SOURCE_DOCS_INDEX.md)
- [KVDF-Generated Discovery Manifest](../generated/kvdf-discovery/MANIFEST.md)

## Roadmap Layers

### 1. Current Shipped / Local Foundation

This layer covers what is already merged or already in the local workspace foundation.

Completed Evolutions:

- v0.1 Foundation Skeleton
- v0.2 Spec Validation + FIFO Task Queue
- v0.3 Local Task Persistence + Queue Commands
- v0.4 Local Studio Task View
- v0.5 Studio Task Filtering + Local Edit Controls
- v0.6 Saved Studio Filter Presets
- v0.7 Studio Task Grouping + Dependency Navigation
- v0.8 Dependency Graph Summary
- v0.9 Dependency-Aware Task Slicing
- v0.10 Stability Review + Release Readiness
- v0.11 v1.0 Hardening Plan
- v1.0 Final Release
- v1.1 IDE-like User Journey Validation

### 2. v1.2 Desktop Decision Evolution

The desktop / IDE path is now decided and documented:

- `v1.2` Desktop Architecture Decision

### 3. v1.3 Desktop Studio Skeleton

The first desktop Studio preview shell is now in place:

- `v1.3` Desktop Studio Skeleton

### 4. v1.4 to v1.12 Desktop Packaging Track

`v1.4`, `v1.5`, `v1.5.1`, `v1.6`, `v1.7`, and `v1.8` are complete; the remaining desktop steps follow the preview shell:

- `v1.4` Connect Desktop UI to KVDOS Status/Tasks/Dependencies
- `v1.5` Live CLI Snapshot Integration
- `v1.5.1` Desktop Snapshot Safety Policy
- `v1.6` Desktop Live Snapshot UX Validation
- `v1.7` Packaging Architecture + Tauri Readiness
- `v1.8` Add Tauri Shell
- `v1.9` First Windows `.exe` Preview
- `v1.10` Portable Preview Packaging Strategy
- `v1.11` Installer / Portable Distribution Decision
- `v1.12` Code Signing and Update Strategy Planning

### 5. v1.13 to v1.16 Later Local-Execution Track

These Evolutions are intentionally later than the desktop track.

- `v1.13` Runner Safety Layer
- `v1.14` Patch Proposal System
- `v1.15` Approval Workflow Hardening
- `v1.16` Basic Local Execution Gate

### 6. v1.17 to v1.19 Later Platform Planning

- `v1.17` VDF Bridge Hardening
- `v1.18` Plugin/Package Foundation Planning
- `v1.19` Cloud Licensing Planning

### 7. v1.0 Hardening Evolutions

The v1.0 hardening package keeps KVDOS local-first and honest:

- `v1.0-H1` Command and Help Surface Consistency
- `v1.0-H2` Documentation Drift Cleanup
- `v1.0-H3` Test Coverage Hardening
- `v1.0-H4` Runtime Leak Safety and Ignore Rules
- `v1.0-H5` Studio UX Polish
- `v1.0-H6` Release Notes and Tag Readiness

### 8. v2.0 Commercial Platform Direction

This is the first commercial framing point, not a shipped platform claim.
It remains a framing Evolution point until earlier tracks are explicitly approved.

- `v2.0` Commercial Platform Foundation
- `v2.1` Account and Workspace Model
- `v2.2` License and Entitlement Service
- `v2.3` Package Registry Foundation
- `v2.4` Marketplace Planning
- `v2.5` Team/Agency Workspace
- `v2.6` Enterprise Boundary Planning

### 9. Future-only Evolution Tracks

These must remain future-only until explicitly planned, approved, and shipped:

- Real AI agents
- MasterAgent execution
- Cloud runner
- Marketplace sales
- Enterprise self-hosting
- Signed packages
- Secure Rust core
- Web3 / ownership layer
- Automatic publishing
- Advanced sandbox execution

## KVDF-Generated Discovery Source Docs

The full KVDF-generated discovery package has been imported under:

```text
docs/generated/kvdf-discovery/source/
```

These are draft source materials only.
They are not canonical product truth until reviewed and promoted by the Owner.

Use the following package files as the source-doc entry points:

- [README.md](../generated/kvdf-discovery/README.md)
- [SOURCE_DOCS_INDEX.md](../generated/kvdf-discovery/SOURCE_DOCS_INDEX.md)
- [MANIFEST.md](../generated/kvdf-discovery/MANIFEST.md)

## Current Honest State

The shipped/local foundation is the local-first Studio and task-governance baseline.

It includes:

- `app.kvdos.yaml` validation
- local task persistence
- FIFO task queue behavior
- task commands
- Studio task browsing
- filtering, search, grouping, and local edit controls
- saved Studio presets
- dependency navigation and slicing
- release readiness documentation

It does not include:

- real task execution
- AI agents
- MasterAgent execution
- cloud sync
- billing
- licensing
- marketplace
- enterprise runtime
- sandbox execution
- publishing automation

## Navigation Rule

Use this master plan first when you need the roadmap shape.
Use the family-specific evolution files when you need the detailed structure for a particular track.
