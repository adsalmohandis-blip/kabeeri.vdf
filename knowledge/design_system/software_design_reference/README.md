# Software Design System Reference

This folder is the permanent Kabeeri home for analyzed software design system
references imported from `KVDF_New_Features_Docs/` and future approved source
packages.

It is the software-design equivalent of the UI/UX reference library:

- `knowledge/design_system/ui_ux_reference/` stores approved visual and
  interaction references.
- `knowledge/design_system/software_design_reference/` stores approved software
  system-design references, structure rules, learning patterns, and routing
  contracts.

## Purpose

Kabeeri uses this library to:

- preserve analyzed system design knowledge in a durable location;
- extract reusable software patterns into CLI-driven workflows;
- convert reference systems into governed learning rules;
- compare the reference against the central capability map so duplicate names are avoided;
- keep future extraction and redistribution tasks source-backed;
- avoid re-analyzing the same source package every time a new feature appears.

## What Belongs Here

Store software-design knowledge that has already been reviewed, analyzed, and
approved for permanent reuse:

- system design reference notes
- architecture patterns
- routing and boundary rules
- capability mapping guidance
- intake and extraction rules
- reusable learning prompts
- migration notes that explain why a pattern was preserved

## What Does Not Belong Here

Do not store raw scratch notes, temporary inbox material, or app-specific
implementation code.

Do not use this folder as a duplicate of `docs/reports/` or `.kabeeri/` state.

## Recommended Structure

```text
knowledge/design_system/software_design_reference/
  README.md
  SOFTWARE_DESIGN_REFERENCE_INDEX.md
  SOFTWARE_DESIGN_SYSTEM_PATTERNS.md
```

Future additions can be split into subfolders when a reference family grows,
for example:

```text
patterns/
contracts/
extraction_notes/
import_targets/
```

## Extraction Contract

The current source package extraction rule is:

1. Analyze the software design system in `KVDF_New_Features_Docs/`.
2. Move the reusable design knowledge here or into the most appropriate
   permanent Kabeeri folder.
3. Keep the redistribution trace in `docs/reports/`.
4. Remove the source folder only after no useful reference knowledge remains
   stranded there.

## CLI

Use the source-package CLI while the imported source still exists:

```bash
kvdf source-package
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package compare
kvdf source-package verify
```

The extracted reference patterns are now captured in
`SOFTWARE_DESIGN_SYSTEM_PATTERNS.md`.

## Relationship To Other Layers

- `knowledge/governance/` holds policy and operating rules.
- `knowledge/standard_systems/` holds normalized cross-project references.
- `docs/reports/` holds migration reports and traceability notes.
- `docs/site/` exposes human-readable capability pages.
- `knowledge/design_system/ui_ux_reference/` remains the UI/UX counterpart.

## Rule

If a software design pattern is reusable across future Kabeeri work, it should
live here or in a clearly named permanent knowledge folder, not only inside
the temporary source package.
