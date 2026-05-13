# Documentation Generation Reference

This document captures the reusable documentation lifecycle knowledge
extracted from `KVDF_New_Features_Docs/`.

The purpose of the generator system is to teach Kabeeri how to produce the
full documentation stack for a software project from idea to delivery.

## Core Rule

Documentation is not a one-time output. It is a lifecycle with explicit phases,
traceability, review gates, and handoff artifacts.

The generator knowledge should therefore live in a permanent Kabeeri folder
and be reused by CLI-driven workflows.

## Lifecycle Stages

| Stage | Goal | Typical Output |
| --- | --- | --- |
| Idea | Capture why the project exists. | brief, discovery notes |
| Strategy | Define market position and product direction. | strategy notes, scope outline |
| Requirements | Capture what must be built. | requirements, acceptance criteria |
| Domain | Define entities, workflows, and business rules. | domain model notes |
| UX/UI | Define the experience and interface rules. | UI spec, flow notes |
| Architecture | Define the system structure. | architecture outline |
| Data Design | Define schema and data behavior. | data model, migration notes |
| API / Integration | Define contracts and external behavior. | API notes, integration contracts |
| Implementation | Guide code execution and tasking. | task packs, implementation notes |
| QA / Security | Validate quality and safety. | test plan, security notes |
| Release | Prepare delivery and versioning. | release notes, handoff pack |
| Documentation | Preserve the knowledge for future reuse. | docs, reports, references |
| Maintenance | Keep the project and its records healthy. | maintenance notes, audits |

## Reusable Documentation Surfaces

- project overview
- scope and assumptions
- system architecture
- task decomposition
- acceptance criteria
- validation evidence
- release and handoff records
- traceability reports
- maintenance and archive notes

## What Kabeeri Should Extract

The generator system should become reusable knowledge in Kabeeri for:

- docs site structure
- lifecycle templates
- task-tracking integration
- governance and phase gates
- report generation
- future application documentation packs

## Permanent Homes

The reusable knowledge now belongs in:

- `knowledge/documentation_generator/`
- `knowledge/task_tracking/`
- `knowledge/governance/`
- `docs/site/`
- `docs/reports/`

## CLI Relationship

Use the source-package CLI while the source folder still exists:

```bash
kvdf source-package
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package compare
kvdf source-package verify
```

The generator knowledge should be consumable from CLI-driven workflows rather
than only from chat or manual browsing.

## Duplicate Analysis

Use `kvdf docs-generator compare` to compare the permanent documentation
generator reference against Kabeeri's central capability map before adding new
documentation lifecycle concepts under a fresh name.
