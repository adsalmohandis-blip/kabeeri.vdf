# Project Documentation Generator

This folder is the permanent Kabeeri home for the reusable project
documentation generation system imported from `KVDF_New_Features_Docs/` and
future approved source packages.

The purpose of this system is to teach Kabeeri how to produce the full
documentation lifecycle for an application from idea to delivery.

## Purpose

Kabeeri uses this generator knowledge to:

- create consistent project documentation structures for every app;
- keep documentation generation CLI-driven instead of chat-driven;
- connect docs output to task tracking, governance, reports, and site pages;
- avoid reinventing the document lifecycle for every new project;
- preserve reusable documentation rules after the source folder is removed.
- compare the generator reference against the central capability map so duplicate names are avoided.

## What Belongs Here

Store documentation-generation knowledge that should survive after source
package cleanup:

- document lifecycle rules
- required docs by phase
- generator and scaffold guidance
- traceability and review rules
- task-tracking hooks for documentation work
- release and handoff documentation patterns
- report templates that support docs generation

## What Does Not Belong Here

Do not store app-specific generated docs here.

Do not keep temporary source-only notes here once they are redistributed to the
right permanent folder.

## Recommended Structure

```text
knowledge/documentation_generator/
  README.md
  DOCS_GENERATION_LIFECYCLE.md
  DOCS_GENERATION_REFERENCE.md
```

Future additions can be split into:

```text
templates/
rules/
phase_contracts/
traceability/
```

## Lifecycle

The documentation generator system should be able to describe and support a
project lifecycle such as:

1. idea capture
2. scope and intake
3. blueprint and system mapping
4. task creation and execution
5. validation and review
6. release and handoff
7. archive and traceability

## CLI

Use the source-package CLI while the source folder still exists:

```bash
kvdf source-package
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package compare
kvdf source-package verify
kvdf docs-generator compare
```

The extracted lifecycle reference is now captured in
`DOCS_GENERATION_REFERENCE.md`.

## Relationship To Other Layers

- `knowledge/task_tracking/` owns governed task records and lifecycle rules.
- `knowledge/governance/` owns the rules that keep documentation generation
  safe and traceable.
- `docs/site/` exposes the human-readable docs experience.
- `docs/reports/` stores extraction and migration evidence.

## Rule

If a document is part of the reusable documentation lifecycle rather than the
output of one specific app, it should live here or in a related permanent
Kabeeri knowledge folder.
