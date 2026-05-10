# ADMP-UI02 CRUD List

## Identity

- Design code: `ADMP-UI02`
- Business: admin panel
- View: CRUD list and table management
- Style: operational table with clear actions

## Core Pattern

```text
page header
create action
search/filter toolbar
responsive table
row actions
pagination
states
```

## Required Sections

- title, subtitle, and primary action;
- search input;
- filters and saved views if needed;
- responsive table;
- row actions;
- pagination or virtualization;
- empty and error states.

## Component Contracts

- `PageHeader`
- `FilterToolbar`
- `DataTable`
- `StatusBadge`
- `RowActions`
- `Pagination`
- `EmptyState`

## States

- loading;
- empty;
- no results;
- error;
- selection active;
- bulk action pending.

## Design Rules

- Destructive row action uses danger style and confirmation.
- Tables must not overflow mobile without a responsive plan.
- Filter changes should be recoverable.

## Motion

- `MINIMAL_MOTION`
- Row update can highlight once.
- No decorative table animation.

## Task Seed

- Build CRUD list with search, filters, table, row actions, bulk actions, and all data states.

