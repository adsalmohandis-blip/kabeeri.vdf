# FIN-UI04 Cards Invoices

## Identity

- Design code: `FIN-UI04`
- Business: fintech
- View: cards, invoices, payment methods
- Style: secure financial management

## Layout Anatomy

```text
cards/payment methods
invoice table
status
pay/download actions
security notices
```

## UX Goals

- Manage payment instruments safely.
- Track invoices and status.
- Keep secure actions explicit.

## Required Components

- `PaymentMethodCard`
- `InvoiceTable`
- `PaymentStatusBadge`
- `DownloadInvoiceButton`
- `SecurityNotice`
- `ConfirmModal`

## Required States

- active card;
- expired card;
- invoice paid;
- invoice overdue;
- payment failed;
- deleting method.

## Data Requirements

- masked card info;
- invoice id;
- amount;
- due date;
- status;
- security policy.

## Accessibility

- Masked financial data is readable.
- Status uses text and icon.
- Dangerous actions require confirmation.

## Motion

- `MINIMAL_MOTION`
- Confirmation modal can transition.
- No playful payment method deletion effects.

## Common Mistakes

- Full card data displayed.
- Overdue invoices not prominent.
- Delete card without confirmation.

## Acceptance Criteria

- Payment methods and invoices are secure, clear, and recoverable.

## Task Seed

- Build cards/invoices screen with masked cards, invoices, statuses, download, and confirmation states.

