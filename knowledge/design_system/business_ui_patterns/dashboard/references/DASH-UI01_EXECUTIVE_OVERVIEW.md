# DASH-UI01 Executive Overview

## Identity

- Design code: `DASH-UI01`
- Business: dashboard
- View: executive overview
- Style: prioritized KPIs and insight-first dashboard
- Dashboard reference: `ADMIT-ADB01`

## Core Pattern

```text
header with time range
priority KPI band
main trend chart
insight callouts
action queue
```

## Required Sections

- date range and comparison controls;
- KPI cards;
- trend chart;
- insight or anomaly callouts;
- action queue or next steps.

## Component Contracts

- `DashboardHeader`
- `KpiBand`
- `TrendChart`
- `InsightCallout`
- `ActionQueue`

## States

- loading;
- partial data;
- no data;
- stale data;
- error.

## Design Rules

- Not every metric gets equal weight.
- Charts must have labels, period, and meaning.
- Empty data must explain what is missing.

## Motion

- `BALANCED_MOTION`
- KPI values may count in once.
- Reduced motion uses static values.

## Task Seed

- Build executive dashboard with KPI hierarchy, trend chart, insight callouts, and data states.

