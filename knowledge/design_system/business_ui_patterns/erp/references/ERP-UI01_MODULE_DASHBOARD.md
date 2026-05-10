# ERP-UI01 Module Dashboard

## Identity

- Design code: `ERP-UI01`
- Business: ERP
- View: module dashboard
- Style: dense operational summary with approvals and exceptions
- Dashboard reference: `ADMIT-ADB04`

## Core Pattern

```text
module header
KPI strip
approval queue
exceptions
records table
reports shortcut
```

## Required Sections

- module title and scope;
- KPI cards;
- pending approvals;
- exception alerts;
- recent records table;
- report shortcuts.

## Component Contracts

- `ModuleHeader`
- `KpiStrip`
- `ApprovalQueue`
- `ExceptionAlert`
- `RecordTable`
- `ReportShortcut`

## States

- no approvals;
- exception active;
- stale data;
- permission denied;
- loading.

## Design Rules

- Accuracy and traceability beat decoration.
- Status, owner, and current workflow step must be visible.
- Data-heavy widgets require empty and error states.

## Motion

- `MINIMAL_MOTION`
- Use row highlight after updates.
- No scroll reveal or large transitions.

## Task Seed

- Build ERP module dashboard with KPI strip, approval queue, exceptions, table, and states.

