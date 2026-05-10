# Bilingual Documentation Parity

Kabeeri VDF maintains Arabic and English documentation as parallel entry
points.

Updated: 2026-05-10.

## Canonical Rule

The canonical numbered docs are:

```text
docs/ar/01_... through docs/ar/20_...
docs/en/01_... through docs/en/20_...
```

Both folders should expose the same numbered topics. The level of detail may
temporarily differ, but the topic must exist in both languages.

The current canonical set is 20 Arabic files and 20 English files with matching
filenames. `docs/ar/README.md` and `docs/en/README.md` must list the same
topics in the same order.

## Legacy Files

Some English files existed before the parity pass with older numbering:

```text
docs/en/02_ARCHITECTURE.md
docs/en/03_REPOSITORY_STRUCTURE.md
docs/en/04_ROADMAP.md
docs/en/05_MARKET_RESEARCH_AND_DIFFERENTIATION.md
```

They are retained to avoid breaking links. New links should use the canonical
files listed in `docs/en/README.md`.

Legacy files should contain a compatibility note or be referenced only as old
entry points. They are not part of the canonical parity count.

## Current Parity Status

| Area | Status |
| --- | --- |
| Arabic canonical files | 20 files present |
| English canonical files | 20 files present |
| Canonical filenames | aligned |
| Canonical indexes | aligned |
| Legacy English files | retained for compatibility |
| Deep line-by-line translation parity | ongoing |

## Maintenance Checklist

- Add both Arabic and English files for any new numbered topic.
- Update both `docs/ar/README.md` and `docs/en/README.md`.
- Keep current runtime behavior in `docs/SYSTEM_CAPABILITIES_REFERENCE.md`.
- Avoid deleting legacy English files until inbound links are checked.
- Record parity review results in `docs/reports/BILINGUAL_DOCS_PARITY_REPORT.md`.
