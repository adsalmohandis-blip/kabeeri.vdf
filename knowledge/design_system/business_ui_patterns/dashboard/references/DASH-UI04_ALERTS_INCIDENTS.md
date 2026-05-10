# DASH-UI04 Alerts Incidents

## Identity

- Design code: `DASH-UI04`
- Business: dashboard
- View: alerts and incidents
- Style: severity-first response surface

## Core Pattern

```text
severity summary
incident list
assigned owners
timeline
resolution actions
```

## Required Sections

- severity counters;
- incident table or cards;
- owner and SLA;
- incident detail drawer;
- acknowledge and resolve actions.

## Component Contracts

- `SeverityCounter`
- `IncidentList`
- `SlaBadge`
- `OwnerBadge`
- `IncidentDrawer`
- `ResolveButton`

## States

- active alert;
- acknowledged;
- escalated;
- resolved;
- no incidents;
- failed update.

## Design Rules

- Critical alerts are unmistakable but not visually chaotic.
- Acknowledge and resolve are distinct actions.
- Status history remains visible.

## Motion

- `MINIMAL_MOTION`
- New alert can highlight once.
- No flashing or rapid blinking.

## Task Seed

- Build incidents dashboard with severity, owners, SLA, detail drawer, and action states.

