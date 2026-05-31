# EVO_AUTO_012 Scope Statement

## Priority

- ID: `evo-auto-012`
- Title: `Docs source-of-truth checks`
- Source: `technical_debt_review`

## Scope

This priority checks that commands and capabilities present in the CLI are represented in the canonical documentation surfaces, especially the command reference and capability reference.

The scope includes:

- command reference source-of-truth checks
- capability reference source-of-truth checks
- missing canonical documentation coverage detection
- historical source clarity checks for archived source material

## Out of scope

- rewriting the entire docs site
- replacing the canonical command or capability references
- changing planner behavior unrelated to docs coverage
- altering historical archive policy

## Success criteria

- missing canonical docs coverage is detectable
- canonical repository docs pass the check
- historical archives stay distinct from authoritative docs
- the check can be used during normal validation

