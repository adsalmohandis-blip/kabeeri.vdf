# SAAS-UI05 Usage Limits

## Identity

- Design code: `SAAS-UI05`
- Business: SaaS
- View: usage, quotas, limits, metering
- Style: transparent metered usage dashboard

## Core Pattern

```text
usage summary
quota cards
trend chart
limit warnings
upgrade action
history table
```

## Required Sections

- usage cards by resource;
- limit thresholds;
- usage trend;
- overage or warning notice;
- upgrade or contact action;
- usage history table.

## Component Contracts

- `UsageCard`
- `QuotaProgress`
- `UsageChart`
- `LimitAlert`
- `UpgradeButton`
- `UsageHistoryTable`

## States

- normal usage;
- near limit;
- over limit;
- usage unavailable;
- plan upgrade pending.

## Design Rules

- Usage must be understandable without reading docs.
- Warnings use text plus color and icon.
- Upgrade action should be clear but not manipulative.

## Motion

- `BALANCED_MOTION`
- Progress updates can animate briefly.
- Reduced motion keeps percentage and bar visible.

## Task Seed

- Build usage limits screen with cards, warning states, chart, history, and upgrade action.

