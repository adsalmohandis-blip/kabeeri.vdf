# FIN-UI02 Transactions Ledger

## Identity

- Design code: `FIN-UI02`
- Business: fintech
- View: transactions ledger
- Style: precise, filterable financial table/list

## Layout Anatomy

```text
filters
transaction list/table
status badges
amounts
detail drawer
export
```

## UX Goals

- Help users find and audit transactions.
- Make status and amount clear.
- Provide receipts/details.

## Required Components

- `TransactionFilterBar`
- `TransactionTable`
- `AmountCell`
- `TransactionStatusBadge`
- `TransactionDrawer`
- `ExportButton`

## Required States

- loading;
- empty;
- filtered empty;
- pending;
- failed;
- reversed.

## Data Requirements

- transaction id;
- date;
- amount;
- currency;
- status;
- counterparty;
- receipt.

## Accessibility

- Amount sign is textually clear.
- Table headers are present.
- Status is not color-only.

## Motion

- `MINIMAL_MOTION`
- Detail drawer can transition.
- No animated row shuffling.

## Common Mistakes

- Amounts hard to scan.
- Failed transactions hidden.
- No export or receipt path when needed.

## Acceptance Criteria

- User can filter, inspect, and export transactions safely.

## Task Seed

- Build transactions ledger with filters, statuses, detail drawer, receipts, export, and empty states.

