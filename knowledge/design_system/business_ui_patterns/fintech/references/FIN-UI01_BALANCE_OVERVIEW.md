# FIN-UI01 Balance Overview

## Identity

- Design code: `FIN-UI01`
- Business: fintech
- View: balance overview
- Style: calm financial summary with explicit status

## Layout Anatomy

```text
balance cards
quick actions
alerts
recent transactions
security/status
```

## UX Goals

- Show financial position clearly.
- Keep quick actions safe and understandable.
- Surface alerts without panic.

## Required Components

- `BalanceCard`
- `QuickActionButton`
- `SecurityAlert`
- `RecentTransactions`
- `StatusBadge`

## Required States

- normal;
- pending balance;
- account restricted;
- loading;
- unavailable data.

## Data Requirements

- available balance;
- pending amount;
- currency;
- account status;
- recent transactions.

## Accessibility

- Amounts are text and screen-reader friendly.
- Alerts use icon plus text.
- Quick actions have precise labels.

## Motion

- `MINIMAL_MOTION`
- Do not animate amounts distractingly.
- Loading can use skeletons.

## Common Mistakes

- Hiding pending balance.
- Using playful tone for serious money.
- Ambiguous quick action labels.

## Acceptance Criteria

- User can understand balance, restrictions, and next actions.

## Task Seed

- Build balance overview with cards, alerts, recent transactions, and restricted/unavailable states.

