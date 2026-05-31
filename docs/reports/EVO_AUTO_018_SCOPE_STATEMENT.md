# EVO_AUTO_018 Scope Statement

## Priority

- ID: `evo-auto-018-capability-registry`
- Title: `Capability Registry`
- Source: `new_features_docs_study`

## Scope

This priority registers every imported capability as a named, traceable unit with clear ownership and source mapping.

The scope includes:

- canonical capability registry data
- ownership and runtime-boundary mapping
- docs and CLI alignment for registry lookup
- machine-readable and human-readable views of the registry

## Out of scope

- inventing a second capability registry
- changing unrelated runtime features
- collapsing the registry into a plain narrative doc
- removing the existing canonical capability map

## Success criteria

- the capability registry is queryable and machine-readable
- the registry exposes ownership and runtime boundaries
- docs and CLI agree on the canonical registry source
- future slices can build on the registry without reintroducing ambiguity
