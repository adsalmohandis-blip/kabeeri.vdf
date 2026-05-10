# CRM-UI01 Pipeline Board

## Identity

- Design code: `CRM-UI01`
- Business: CRM
- View: sales pipeline
- Style: kanban pipeline with clear deal value and next action
- Dashboard reference: `ADMIT-ADB03`

## Core Pattern

```text
pipeline header
stage columns
deal cards
drag/update feedback
filters
summary metrics
```

## Required Sections

- pipeline selector;
- stage columns with counts;
- deal cards with company, value, owner, and next action;
- filters by owner, priority, and date;
- stage totals and forecast summary.

## Component Contracts

- `PipelineBoard`
- `StageColumn`
- `DealCard`
- `OwnerBadge`
- `DealValue`
- `NextActionButton`
- `PipelineFilterBar`

## States

- empty pipeline;
- empty stage;
- dragging deal;
- update failed;
- permission denied;
- loading.

## Design Rules

- Next action must be visible on each deal.
- Drag must have keyboard alternative.
- Deal value and stage are not hidden behind hover.

## Motion

- `BALANCED_MOTION`
- Drag feedback can be subtle.
- Avoid excessive motion during data entry.

## Task Seed

- Build pipeline board with columns, cards, filters, drag/update states, and accessible alternatives.

