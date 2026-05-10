# CRM-UI03 Leads Inbox

## Identity

- Design code: `CRM-UI03`
- Business: CRM
- View: leads inbox and triage
- Style: fast qualification queue

## Core Pattern

```text
lead queue
filters
lead preview
qualify/disqualify actions
assignment
activity context
```

## Required Sections

- lead source filters;
- priority and status badges;
- lead preview panel;
- qualify, assign, archive actions;
- empty and no-results states.

## Component Contracts

- `LeadQueue`
- `LeadPreview`
- `SourceBadge`
- `AssignUserMenu`
- `QualifyButton`
- `ArchiveButton`

## States

- new lead;
- assigned;
- duplicate lead;
- disqualified;
- empty inbox;
- assignment failed.

## Design Rules

- Triage actions are clear and grouped.
- Duplicate and low-quality leads are explicit.
- Archive/disqualify needs confirmation if irreversible.

## Motion

- `BALANCED_MOTION`
- Queue item removal can animate lightly.
- Do not obscure lead details.

## Task Seed

- Build lead inbox with triage actions, preview, assignment, duplicate, and empty states.

