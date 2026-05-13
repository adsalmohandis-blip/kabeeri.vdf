# KVDF New Features Docs Study Report

## Scope

Study of `KVDF_New_Features_Docs` as a dual-purpose source package for future KVDF capabilities.

This folder is not a single document set. It contains two distinct source systems:

1. a Software Design System reference to follow
2. a software project documentation generation system

Both sources are temporary inputs. Their useful content must be extracted into the correct Kabeeri folders, represented in CLI and governance flows, and only then can the source folder be removed.

Permanent extraction targets now exist for the imported knowledge:

- `knowledge/design_system/software_design_reference/`
- `knowledge/documentation_generator/`

For the current physical inventory snapshot, see [KVDF_NEW_FEATURES_DOCS_INVENTORY.md](./KVDF_NEW_FEATURES_DOCS_INVENTORY.md).
For the redistribution contract, see [KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md](./KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md).

## CLI Surface

Use the source-package CLI while the source folder still exists:

```bash
kvdf source-package
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package verify
```

These commands keep the study, inventory, destination map, and verification state inspectable without relying on chat history.

The extraction contract is now represented permanently in the destination map
and in the dedicated knowledge folders above.

## Rename Attempt

I attempted to rename the top folder to lowercase only.

Result:
- `Rename-Item` failed with `Access to the path ... is denied`
- `cmd /c ren` also failed with `Access is denied`

Observed reason:
- The folder contains a deeply nested self-referential chain of `KVDF_New_Features_Docs` inside itself.
- That makes the tree unsafe to rename in one shot and likely contributes to the access/path behavior.

Important:
- The rename has **not** been completed yet.
- The study below reflects the current folder contents.

## Source System A: Software Design System

### Purpose

This package is a KVDF reference library for Software Design System analysis.

Its role is to preserve analyzed system-design patterns so KVDF can:

- learn from them permanently
- extract reusable CLI behaviors and learning flows
- redistribute the learned patterns into the correct Kabeeri folders
- keep the source package temporary until migration is complete

### Structure

- `00_START`
  - entry point
  - active router/master/agent docs
  - package manifest and folder map
- `01_CORE`
  - 38 governance documents
  - core rules for thinking, building, testing, releasing, and operating
- `02_PACKS`
  - 83 project reference packs
  - shared pack rules/templates/router docs
  - pack-specific docs for booking, ecommerce, SaaS, marketplace, and many other domains
- `99_ARCH`
  - original archives preserved for traceability

### Core Behavior

This package says:

- governance tells Kabeeri how to think
- reference packs tell Kabeeri which patterns to reuse
- choose one primary reference source first
- add supporting sources only when they change entities, flows, risks, or architecture
- do not read everything at once

### High-Value Capabilities

The package gives KVDF these capabilities:

- domain routing by project type
- primary/supporting pack selection
- assessment report before implementation
- modular monolith first, services later
- security, testing, observability, and release rules per domain
- pack-driven design for booking, ecommerce, SaaS, marketplace, healthcare, fintech, GRC, and more

### Most Important Pack Patterns

#### Booking

Key features:
- availability
- hold/reservation before confirmation
- payment/refund state machines
- double booking prevention
- provider dashboard and admin moderation

#### Ecommerce

Key features:
- catalog
- cart
- checkout orchestration
- inventory reservation
- order and payment state machines
- shipping, returns, refunds

#### SaaS

Key features:
- tenant/workspace isolation
- entitlements and usage limits
- billing webhook idempotency
- support impersonation with audit

#### Marketplace

Key features:
- vendor isolation
- commission and payout logic
- disputes and moderation
- separate marketplace order state from seller fulfillment

## Source System B: software project documentation generation system

### Purpose

This package is a lifecycle-based documentation generator for software projects.

It defines a full documentation journey from:

- idea
- product strategy
- requirements
- domain
- UX/UI
- architecture
- database
- API
- backend
- frontend
- security
- testing
- DevOps
- operations
- release
- docs
- AI agent instructions
- implementation planning
- scale-specific packs
- traceability
- quality gates
- data governance
- risk/change
- cost/compliance
- maintenance lifecycle
- trust/safety
- AI/ML governance
- extensibility

### Structure

- `r001.md` to `r015.md`
  - operational templates, gates, prompts, profiles, router guidance, and assessment format
- `r006.csv`, `r007.json`, `r010.json`
  - machine-readable mapping/index data
- `p00` to `p28`
  - 29 phases total
  - 254 files
  - each phase has a README plus task-specific files

### Lifecycle Shape

The phase ladder is:

1. Start Here
2. Idea & Discovery
3. Product Strategy
4. Requirements
5. Domain & Business Rules
6. UX/UI
7. System Architecture
8. Database & Data Design
9. API & Integration Contract
10. Backend Design
11. Frontend Design
12. Security & Privacy
13. Testing & QA
14. DevOps & Infrastructure
15. Observability & Operations
16. Release & Versioning
17. Documentation & Training
18. AI Agent Instructions
19. Implementation Plan
20. Scale Specific Packs
21. Traceability
22. Quality Gates
23. Data Governance
24. Risk & Change Management
25. Cost & Compliance
26. Maintenance Lifecycle
27. Trust Safety & Abuse
28. AI / ML Governance
29. Extensibility

### Key Operating Ideas

This package is strict about:

- no code before documents
- no feature before requirements
- no database before domain
- no API before contract
- no deployment before DevOps plan
- send a task assessment before risky changes
- use phase gates before moving forward

### High-Value Capabilities

This package gives KVDF a full project lifecycle model:

- doc-first project bootstrap
- phase-by-phase approval flow
- project profiles by size
- document router for task-specific reading
- codex prompts for staged work
- traceability and quality gates
- risk/change management
- cost/compliance and lifecycle planning
- trust/safety and AI governance
- extensibility planning

## What KVDF Can Learn From These Sources

### 1. Two-layer routing

KVDF should separate:

- framework governance
- project reference selection

This prevents mixing generic rules with domain-specific patterns.

### 2. Full lifecycle entry point

KVDF should have a single entry that routes users to:

- owner/framework track
- app/vibe developer track

Then activates the correct documentation and tools automatically.

### 3. Phase gates for tasks

The project docs generator proves that a task should not jump directly to code.

KVDF can adopt the same ladder:

- understand
- classify
- route
- assess
- plan
- implement
- validate
- close

### 4. Template-driven execution

The project docs system is template-heavy.

KVDF can reuse that idea for:

- assessment reports
- feature specs
- table specs
- API specs
- task plans
- review checklists

### 5. Pack-based domain memory

The pack system is a strong design pattern for KVDF:

- one primary pack
- optional supporting packs
- pack manifest first
- only read what is needed

## Normalization Notes

The current source folder should be normalized by extracting its content into Kabeeri folders and then removing the folder.

Recommended migration order:

1. use the current inventory snapshot as the source baseline
2. map each asset to its permanent Kabeeri destination
3. extract the reusable patterns into CLI, governance, docs, and reports
4. verify the new references and remove the source package

## Recommended KVDF Feature Imports

- Pack router for domain selection
- Assessment report before implementation
- Phase-gated task lifecycle
- Project profile depth control
- Traceability matrix for task/document links
- Quality gate enforcement
- Risk/change tracking
- Extensibility rules for future packs
- Codex prompt templates for staged execution

## Bottom Line

This folder is a strong source of:

- governance architecture
- project routing
- staged documentation lifecycle
- domain pack selection
- implementation discipline

It is especially useful for turning KVDF into a system that can:

- classify a request
- route it to the right track
- activate the right docs
- enforce gates
- then guide implementation with minimal overlap

It should be treated as a temporary source package whose useful knowledge is migrated into Kabeeri and whose folder is removed after redistribution is complete.
