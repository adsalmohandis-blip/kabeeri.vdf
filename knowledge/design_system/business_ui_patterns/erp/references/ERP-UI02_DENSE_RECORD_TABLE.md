# ERP-UI02 Dense Record Table

## Identity

- Design code: `ERP-UI02`
- Business: ERP
- View: dense records table
- Style: compact, filterable, exportable enterprise table

## Core Pattern

```text
filter toolbar
column controls
compact table
status badges
row actions
pagination/export
```

## Required Sections

- search and filters;
- date range;
- column visibility;
- table with status and owner;
- row actions;
- export and pagination.

## Component Contracts

- `FilterToolbar`
- `ColumnVisibilityMenu`
- `DenseDataTable`
- `StatusBadge`
- `RowActions`
- `ExportButton`

## States

- loading;
- empty;
- no results;
- permission denied;
- export pending;
- sync error.

## Design Rules

- Tables use compact density without sacrificing readability.
- Avoid hiding critical columns by default.
- Row actions should remain predictable.

## Motion

- `MINIMAL_MOTION`
- Table updates can highlight once.
- Avoid animated columns or decorative refresh.

## Task Seed

- Build dense ERP table with filters, column visibility, export, pagination, and states.

