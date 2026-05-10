# SAAS-UI03 Billing Settings

## Identity

- Design code: `SAAS-UI03`
- Business: SaaS
- View: billing, plans, invoices, usage
- Style: clear subscription management with trust and transparency

## Core Pattern

```text
current plan
usage limits
upgrade/downgrade actions
payment method
invoice table
billing notices
```

## Required Sections

- current plan card;
- usage or quota cards;
- plan comparison or upgrade path;
- payment method;
- invoices table;
- cancellation and downgrade information.

## Component Contracts

- `PlanCard`
- `UsageCard`
- `PaymentMethodCard`
- `InvoiceTable`
- `PlanComparison`
- `BillingAlert`

## States

- trial active;
- payment failed;
- near limit;
- over limit;
- invoice loading;
- cancelled subscription.

## Design Rules

- Price and renewal dates are never hidden.
- Cancellation or downgrade consequences must be explicit.
- Financial actions need review and confirmation.

## Motion

- `MINIMAL_MOTION`
- Use stable processing feedback for payment updates.
- Avoid playful motion around billing.

## Task Seed

- Build billing settings with plan, usage, invoices, payment method, and payment failure states.

