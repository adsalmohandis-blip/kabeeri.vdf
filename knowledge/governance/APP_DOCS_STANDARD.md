# App Docs Standard

App Docs Standard defines the portable documentation package for every app
workspace. The goal is simple: if an app is copied out of Kabeeri, the copied
folder should still explain the app well enough for another system or team to
continue work without rereading chat history.

## Source Of Truth

- Portable app docs: `workspaces/apps/<app-slug>/docs/`
- App README: `workspaces/apps/<app-slug>/README.md`
- App assets and diagrams: `workspaces/apps/<app-slug>/assets/`
- App-local working state: `workspaces/apps/<app-slug>/.kabeeri/`
- App boundary rules: `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`
- Vibe workflow and planning gate: `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`

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

## Required App Docs Package

The baseline portable package should include:

- `README.md`
- `docs/README.md`
- `docs/00-overview.md`
- `docs/01-vision-and-goals.md`
- `docs/02-scope-and-non-goals.md`
- `docs/03-users-and-personas.md`
- `docs/04-user-stories-and-jobs-to-be-done.md`
- `docs/05-ux-principles.md`
- `docs/06-information-architecture.md`
- `docs/07-user-flows.md`
- `docs/08-wireframes.md`
- `docs/09-ui-specification.md`
- `docs/10-content-and-tone.md`
- `docs/11-accessibility.md`
- `docs/12-architecture-overview.md`
- `docs/13-module-breakdown.md`
- `docs/14-service-boundaries.md`
- `docs/15-api-contracts.md`
- `docs/16-authentication-and-permissions.md`
- `docs/17-error-handling.md`
- `docs/18-integration-map.md`
- `docs/19-data-model.md`
- `docs/20-entities-and-relationships.md`
- `docs/21-data-dictionary.md`
- `docs/22-schema-rules.md`
- `docs/23-state-and-lifecycle.md`
- `docs/24-feature-breakdown.md`
- `docs/25-task-plan.md`
- `docs/26-implementation-order.md`
- `docs/27-release-plan.md`
- `docs/28-acceptance-criteria.md`
- `docs/29-test-strategy.md`
- `docs/30-qa-checklist.md`
- `docs/31-edge-cases.md`
- `docs/32-performance-notes.md`
- `docs/33-deployment-and-environments.md`
- `docs/34-observability-and-analytics.md`
- `docs/35-support-runbook.md`
- `docs/36-backup-and-recovery.md`
- `docs/37-change-log.md`
- `docs/38-security-and-privacy.md`
- `docs/39-compliance-notes.md`
- `docs/40-audit-and-logging.md`
- `docs/41-role-and-permission-matrix.md`
- `docs/42-vendor-and-dependency-inventory.md`

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

### UI/UX Layer

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

