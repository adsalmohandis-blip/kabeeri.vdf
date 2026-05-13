# Software Design System Patterns

This document captures the first permanent extraction of reusable software
design knowledge from `KVDF_New_Features_Docs/`.

It is intentionally broad and system-oriented. The goal is to preserve
patterns that Kabeeri can reuse across future software projects without
re-reading the source package.

## Core Extraction Rules

The analyzed source material teaches Kabeeri to:

- route by project type before implementation starts;
- choose one primary reference source first, then only add supporting sources
  when they change entities, flows, risks, or architecture;
- prefer a modular monolith before splitting into services;
- make security, testing, observability, and release rules part of the
  reference system, not late-stage add-ons;
- preserve system design knowledge as a learning library, not as a one-off
  project note;
- keep the source package temporary and migrate reusable knowledge to permanent
  Kabeeri folders.

## Durable Patterns

### 1. Domain Routing

Kabeeri should classify the project domain first, then route the project to
the correct reference packs and governance paths.

Examples:

- booking
- ecommerce
- SaaS
- marketplace
- healthcare
- fintech
- GRC

### 2. Primary / Supporting Sources

The source package emphasizes a simple rule:

- start with one primary source;
- add supporting sources only when they materially change the design;
- do not read or reproduce everything at once.

This rule reduces token waste and keeps design analysis focused.

### 3. Assessment Before Build

Before implementation, Kabeeri should produce a compact assessment that
explains:

- what the system needs;
- which patterns apply;
- what should be deferred;
- what risks or constraints exist;
- what the right implementation shape is.

### 4. Modular Monolith First

The extracted guidance favors a modular monolith first, then services later.
This keeps the first implementation simpler and avoids unnecessary early
distribution of responsibilities.

### 5. Domain-Specific Safety Rules

The reference system insists that important non-functional rules are designed
up front:

- security and secrets handling
- testing and QA coverage
- observability and monitoring
- release and deployment behavior
- audit and compliance boundaries

### 6. Pack-Driven Reuse

The source package is pack-driven: reusable system design knowledge should be
stored as reference packs and route guidance rather than rebuilt from scratch
for every project.

## Notable Domain Signals

### Booking

- availability
- hold or reservation before confirmation
- payment and refund state machines
- double booking prevention
- provider dashboard and admin moderation

### Ecommerce

- catalog
- cart
- checkout orchestration
- inventory reservation
- order and payment state machines
- shipping, returns, refunds

### SaaS

- tenant and workspace isolation
- entitlements and usage limits
- billing webhook idempotency
- support impersonation with audit

### Marketplace

- vendor isolation
- commission and payout logic
- disputes and moderation
- separate marketplace order state from seller fulfillment

## How Kabeeri Should Use This

This reference should feed:

- capability mapping
- design-source review commands
- prompt packs
- task generation
- governance rules
- docs and reports for future project analysis

## CLI Relationship

Use `kvdf source-package compare` to inspect duplicate-capability signals while
the source package still exists.

Use `kvdf source-package verify` after redistribution planning to confirm that
the reusable knowledge has been mapped to permanent Kabeeri folders.
