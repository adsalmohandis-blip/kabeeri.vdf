# App Docs Standard

App Docs Standard defines the portable documentation package for every app
workspace. The goal is simple: if an app is copied out of Kabeeri, the copied
folder should still explain the app well enough for another system or team to
continue work without rereading chat history.

This document is the human guide. The machine-readable companion lives in
[`APP_DOCS_STANDARD.json`](APP_DOCS_STANDARD.json).

## Source Of Truth

- Portable app docs: `workspaces/apps/<app-slug>/docs/`
- App README: `workspaces/apps/<app-slug>/README.md`
- App assets and diagrams: `workspaces/apps/<app-slug>/assets/`
- App-local working state: `workspaces/apps/<app-slug>/.kabeeri/`
- App boundary rules: `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`
- Vibe workflow and planning gate: `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- App docs contract: `knowledge/governance/APP_DOCS_STANDARD.json`

## Why This Exists

An app is not professional just because it has code. It is professional when
the product intent, UI/UX, architecture, and data design are written clearly
enough that:

- the app can be rebuilt later;
- the next developer can understand the design choices quickly;
- the owner can review the product without reading raw implementation first;
- Kabeeri can reconstruct the app from existing code when the app was built
  elsewhere.

## Storage Rule

- Kabeeri runtime state stays in `.kabeeri/`.
- Canonical app knowledge stays in `workspaces/apps/<app-slug>/docs/`.
- Human workflow guidance stays in `knowledge/` and `docs/`.
- The app folder is the portable package, not chat text.

## Document Metadata Standard

Every canonical app doc should carry a visible metadata block near the top with
these fields:

- Owner
- Status
- Version
- Last reviewed
- Source of truth
- Reviewed by
- Approved by
- Change log
- Lifecycle

Recommended values:

- Status: `Draft`, `Canonical`, `Deprecated`, `Archived`
- Lifecycle: `Draft`, `Canonical`, `Deprecated`, `Archived`

The metadata block exists so reviewers and AI agents can tell whether a doc is
stable, still changing, or retired without guessing.

## Navigation Rules

The front door of an app docs package should be:

1. `README.md`
2. `docs/README.md`
3. `docs/00-executive-summary.md`

The unnumbered navigation docs are:

- `docs/discovery-questionnaire.md`
- `docs/master-doc-index.md`

The numbered sequence should begin at `01` and stay contiguous after `00`.

`00-executive-summary.md` is the executive front door. It is the canonical top
summary and should stay first.

`discovery-questionnaire.md` and `master-doc-index.md` stay unnumbered by
design because they are navigation and intake artifacts, not content chapters.

## Required App Docs Package

The baseline portable package should include the following layers:

### Front Door And Discovery

- `README.md`
- `docs/README.md`
- `docs/00-executive-summary.md`
- `docs/discovery-questionnaire.md`
- `docs/master-doc-index.md`
- `docs/01-overview.md`

### Product Layer

- `docs/02-vision-and-goals.md`
- `docs/03-scope-and-non-goals.md`
- `docs/04-users-and-personas.md`
- `docs/05-user-stories-and-jobs-to-be-done.md`

### UX / UI Layer

- `docs/06-ux-principles.md`
- `docs/07-information-architecture.md`
- `docs/08-user-flows.md`
- `docs/09-wireframes.md`
- `docs/10-ui-specification.md`
- `docs/11-content-and-tone.md`
- `docs/12-accessibility.md`

### System Layer

- `docs/13-architecture-overview.md`
- `docs/14-module-breakdown.md`
- `docs/15-service-boundaries.md`
- `docs/16-api-contracts.md`
- `docs/17-authentication-and-permissions.md`
- `docs/18-error-handling.md`
- `docs/19-integration-map.md`
- `docs/44-erd.md`
- `docs/45-system-architecture.md`
- `docs/46-workflow-sequence.md`
- `docs/47-state-machine.md`
- `docs/48-data-flow.md`
- `docs/49-technical-diagrams-index.md`

### Data Layer

- `docs/20-data-model.md`
- `docs/21-entities-and-relationships.md`
- `docs/22-data-dictionary.md`
- `docs/23-schema-rules.md`
- `docs/24-state-and-lifecycle.md`

### Delivery Layer

- `docs/25-feature-breakdown.md`
- `docs/26-task-plan.md`
- `docs/27-implementation-order.md`
- `docs/28-release-plan.md`
- `docs/29-acceptance-criteria.md`
- `docs/30-test-strategy.md`
- `docs/31-qa-checklist.md`

### Operations Layer

- `docs/32-edge-cases.md`
- `docs/33-performance-notes.md`
- `docs/34-deployment-and-environments.md`
- `docs/35-observability-and-analytics.md`
- `docs/36-support-runbook.md`
- `docs/37-backup-and-recovery.md`
- `docs/38-change-log.md`
- `docs/39-security-and-privacy.md`
- `docs/40-compliance-notes.md`
- `docs/41-audit-and-logging.md`
- `docs/42-role-and-permission-matrix.md`
- `docs/43-vendor-and-dependency-inventory.md`

### Page Maps And Surface Design

- `docs/50-ide-pages-and-widget-map.md`
- `docs/51-cloud-site-pages-and-widget-map.md`
- `docs/52-dashboard-layout-system.md`
- `docs/53-admin-billing-marketplace-pages.md`
- `docs/54-component-library.md`
- `docs/55-screen-state-matrix.md`
- `docs/56-responsive-behavior.md`
- `docs/57-design-tokens.md`
- `docs/58-copy-and-microcopy.md`

### Runtime And Packaging

- `docs/59-runtime-schema-pack.md`
- `docs/60-plugin-and-package-lifecycle.md`
- `docs/61-runner-and-sandbox-spec.md`
- `docs/62-publish-ready-handoff.md`

### Governance And Enterprise

- `docs/63-doc-governance.md`
- `docs/64-glossary.md`
- `docs/65-decision-records.md`
- `docs/66-ownership-and-raci.md`
- `docs/67-threat-model.md`
- `docs/68-traceability-and-lineage.md`
- `docs/69-api-and-payload-examples.md`
- `docs/70-release-and-change-management.md`
- `docs/71-ux-interaction-states.md`
- `docs/72-success-metrics.md`
- `docs/73-operational-runbooks.md`
- `docs/74-documentation-standards.md`

The file names above are the portable baseline. A product can add extra docs, but
it should not remove the canonical baseline without a clear migration decision.

The first 20 to 30 docs are the practical core for most products. The later
files become more important for enterprise and regulated apps.

## What Each Layer Means

### Product Layer

These docs define the app as a product:

- overview
- vision and goals
- scope and non-goals
- users and personas
- user stories and jobs to be done

### UX / UI Layer

These docs define the user experience:

- UX principles
- information architecture
- user flows
- wireframes
- UI specification
- content and tone
- accessibility

### System Layer

These docs define the technical shape:

- architecture overview
- module breakdown
- service boundaries
- API contracts
- authentication and permissions
- error handling
- integration map
- ERD
- workflow sequence
- state machine
- data flow
- technical diagrams index

### Data Layer

These docs define how the app models its business information:

- data model
- entities and relationships
- data dictionary
- schema rules
- state and lifecycle

### Delivery Layer

These docs define how the app is planned and shipped:

- feature breakdown
- task plan
- implementation order
- release plan
- acceptance criteria
- test strategy
- QA checklist

### Operations Layer

These docs define how the app is supported after delivery:

- edge cases
- performance notes
- deployment and environments
- observability and analytics
- support runbook
- backup and recovery
- change log

### Enterprise Layer

These docs are especially important for serious business apps:

- security and privacy
- compliance notes
- audit and logging
- role and permission matrix
- vendor and dependency inventory
- governance and glossary
- decision records
- RACI
- threat model
- traceability and lineage
- API examples
- release and change management
- UX interaction states
- success metrics
- operational runbooks
- documentation standards

## New App Flow

For a new app, Kabeeri should:

1. capture the product idea;
2. generate or review the planning pack;
3. document the product scope, UI/UX direction, architecture, and data design;
4. store the final app docs in `workspaces/apps/<app-slug>/docs/`;
5. store runtime/session/task state in `workspaces/apps/<app-slug>/.kabeeri/`;
6. use the app docs package as the source for implementation and review.

## Existing App Reconstruction Flow

For an app that already exists outside Kabeeri, Kabeeri should:

1. inspect the codebase, routes, components, APIs, schema, config, and live UI;
2. infer the product shape from actual behavior;
3. ask only for critical missing truths that cannot be safely inferred;
4. rebuild the app docs package into `workspaces/apps/<app-slug>/docs/`;
5. preserve diagrams, mockups, and exported references in `assets/`;
6. keep `.kabeeri/` for working state and reconstruction notes;
7. validate that the portable package still explains the app clearly.

## Portability Rule

If a file is required to understand, build, validate, or operate the app later,
it should live in the app folder rather than only in chat.

That means:

- final UI/UX docs stay in the app folder;
- final system design docs stay in the app folder;
- final data design docs stay in the app folder;
- final task and release notes should be copied into the app package when they
  are app-specific;
- Kabeeri workflow memory can remain in `.kabeeri/`, but the app must keep its
  own durable product knowledge.

## Minimum Acceptance For A Professional App Package

- The app README says what the app is.
- The docs folder explains the product, UX, system design, and data design.
- Another reader can understand the major screens, flows, entities, and API
  boundaries from the docs alone.
- The package makes it obvious what is out of scope.
- The package can survive migration to another platform or another AI system.
