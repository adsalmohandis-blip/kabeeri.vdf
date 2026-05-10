# ERP-UI05 Audit Reports

## Identity

- Design code: `ERP-UI05`
- Business: ERP
- View: audit and reports
- Style: traceable reporting and compliance evidence

## Core Pattern

```text
report filters
report table
summary cards
audit trail
export package
```

## Required Sections

- report filter form;
- summary metrics;
- report table;
- audit trail;
- export package;
- report generation status.

## Component Contracts

- `ReportFilterForm`
- `SummaryMetric`
- `ReportTable`
- `AuditTrail`
- `ExportPackageButton`
- `GenerationStatus`

## States

- generating;
- ready;
- no data;
- export failed;
- permission denied;
- expired report.

## Design Rules

- Report assumptions and filters should be visible.
- Export actions require permission awareness.
- Audit records preserve actor, action, timestamp.

## Motion

- `MINIMAL_MOTION`
- Generation progress can be static or minimal.
- Avoid motion that implies data mutation.

## Task Seed

- Build audit reports screen with filters, summaries, report table, audit trail, export, and permission states.

