# ERP-UI04 Finance Billing

## Identity

- Design code: `ERP-UI04`
- Business: ERP
- View: finance, billing, invoices
- Style: precise financial records with review steps
- Dashboard reference: `ADMIT-ADB04`

## Core Pattern

```text
balance / totals
invoice table
payment status
review/confirm flow
receipts
reports
```

## Required Sections

- finance summary cards;
- invoice or transaction table;
- payment status badges;
- review and confirm actions;
- receipt/download actions;
- reports links.

## Component Contracts

- `FinanceSummary`
- `InvoiceTable`
- `PaymentStatusBadge`
- `ReviewPanel`
- `ReceiptButton`
- `ReportLink`

## States

- unpaid;
- paid;
- overdue;
- processing;
- failed;
- refunded.

## Design Rules

- Amounts and due dates must be stable and readable.
- Payment and financial actions require review then confirmation.
- No hidden fees or ambiguous totals.

## Motion

- `MINIMAL_MOTION`
- Processing uses stable spinner/progress.
- No confetti or bouncing around money.

## Task Seed

- Build finance billing screen with invoices, statuses, review/confirm, receipts, and failure states.

