# FinTech UI Pattern Pack

Use this pack for wallets, payments, transfers, invoices, financial dashboards, cards, and investment-style financial tools.

## Design Posture

- Priority: trust, precision, explicit confirmation, error recovery.
- Density: balanced or compact for operator views.
- Motion: `MINIMAL_MOTION`.
- Dashboard reference: `ADMIT-ADB04` for billing and finance records.

## Required Views

- Balance overview
- Transactions
- Send/payment flow
- Cards/invoices
- Security settings

## Required Flows

- `PAYMENT_CONFIRMATION_FLOW.md`
- `DELETE_CONFIRMATION_FLOW.md` for high-risk removal

## Creative Axes

- Trust tone
- Amount hierarchy
- Confirmation depth
- Risk warning style
- Receipt and audit visibility

## Acceptance Criteria

- Amounts, fees, recipients, and status are explicit.
- Financial actions use review then confirm.
- Failure states provide retry, receipt, or support path.

