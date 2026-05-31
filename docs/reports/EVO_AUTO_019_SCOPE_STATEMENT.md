# EVO_AUTO_019 Scope Statement

## Priority

- ID: `evo-auto-019-source-capability-mapping`
- Title: `Source-to-Capability Mapping`
- Source: `new_features_docs_study`

## Scope

This priority maps source-study files to the exact capability surface, runtime target, docs page, and CLI command.

The scope includes:

- destination mapping for the source study branches
- traceability into capability surfaces and docs
- CLI access to the destination contract
- permanent homes for the imported content

## Out of scope

- removing the source package before the mapping is complete
- changing unrelated capability behavior
- replacing the canonical capability registry
- making the destination map a second source of truth for capability names

## Success criteria

- the source-package destination map is available
- the imported branches have permanent destination homes
- CLI and docs point to the same mapping contract
- future cleanup or migration steps can rely on the map without re-deriving destinations
