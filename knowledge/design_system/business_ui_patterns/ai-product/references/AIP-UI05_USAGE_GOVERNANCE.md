# AIP-UI05 Usage Governance

## Identity

- Design code: `AIP-UI05`
- Business: AI product
- View: usage, limits, governance, cost awareness
- Style: transparent AI usage dashboard
- Dashboard reference: `ADMIT-ADB01`

## Core Pattern

```text
usage summary
credit/limit cards
model or feature usage
cost trend
policy alerts
upgrade/request action
```

## Required Sections

- credit or usage cards;
- model/feature breakdown;
- cost or usage trend;
- policy alerts;
- limit warnings;
- request more or upgrade action.

## Component Contracts

- `UsageSummary`
- `CreditCard`
- `UsageBreakdown`
- `CostTrendChart`
- `PolicyAlert`
- `UpgradeOrRequestButton`

## States

- normal usage;
- near limit;
- over limit;
- policy blocked;
- unavailable usage data;
- request submitted.

## Design Rules

- Usage and limits must be understandable before blocking.
- Policy blocks need explanation and next action.
- Cost data should be readable and stable.

## Motion

- `BALANCED_MOTION`
- Usage updates can animate once.
- No distracting cost animations.

## Task Seed

- Build AI usage governance with credits, breakdown, cost trend, alerts, limits, and request action.

