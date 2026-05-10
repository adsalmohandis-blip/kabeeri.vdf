# DASH-UI03 Analytics Reporting

## Identity

- Design code: `DASH-UI03`
- Business: dashboard
- View: analytics and reports
- Style: filterable chart-first reporting

## Core Pattern

```text
filter bar
chart grid
comparison table
export
definitions
```

## Required Sections

- filter bar and date range;
- chart cards;
- breakdown table;
- export action;
- metric definitions or notes.

## Component Contracts

- `FilterBar`
- `ChartCard`
- `BreakdownTable`
- `ExportButton`
- `MetricDefinition`

## States

- chart loading;
- no data;
- filter no-results;
- export in progress;
- query error.

## Design Rules

- Filters must remain visible or easy to reopen.
- Chart cards need titles and units.
- Provide table fallback for chart data when useful.

## Motion

- `BALANCED_MOTION`
- Chart entrance once is acceptable.
- Do not animate every refresh.

## Task Seed

- Build analytics reporting with filters, charts, breakdown table, export, and states.

