# ERP-UI03 Approval Workflow

## Identity

- Design code: `ERP-UI03`
- Business: ERP
- View: approvals, reviews, workflow decisions
- Style: consequence-aware workflow screen

## Core Pattern

```text
record summary
approval stepper
current owner
decision actions
comments
audit history
```

## Required Sections

- record summary;
- approval path;
- current step and owner;
- approve, reject, request changes actions;
- comment field;
- audit history.

## Component Contracts

- `RecordSummary`
- `ApprovalStepper`
- `DecisionActions`
- `CommentBox`
- `AuditHistory`
- `ConfirmModal`

## States

- pending;
- approved;
- rejected;
- blocked;
- delegated;
- permission denied.

## Design Rules

- Decision consequences must be explicit.
- Reject/request changes requires comment when policy demands it.
- Audit history is visible or easy to open.

## Motion

- `MINIMAL_MOTION`
- Step change can highlight.
- No playful motion for approvals.

## Task Seed

- Build approval workflow with stepper, decision actions, comments, audit, and confirmation.

