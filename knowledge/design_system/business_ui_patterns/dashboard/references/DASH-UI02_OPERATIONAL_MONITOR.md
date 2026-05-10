# DASH-UI02 Operational Monitor

## Identity

- Design code: `DASH-UI02`
- Business: dashboard
- View: operations monitoring
- Style: dense status and exception tracking

## Core Pattern

```text
status summary
alerts
queues
tables
recent activity
```

## Required Sections

- operational status strip;
- critical alerts;
- queue cards;
- exception table;
- activity stream;
- refresh and export controls.

## Component Contracts

- `StatusStrip`
- `AlertPanel`
- `QueueCard`
- `ExceptionTable`
- `ActivityStream`
- `RefreshButton`

## States

- live;
- stale;
- alert;
- no exceptions;
- failed refresh.

## Design Rules

- Current status must be visible at all times.
- Alert severity uses text and icon.
- Refresh behavior must be clear.

## Motion

- `MINIMAL_MOTION` or `BALANCED_MOTION`
- Use subtle update highlight.
- Avoid constant motion in dense monitors.

## Task Seed

- Build operational monitor with status, alerts, queues, exceptions, and refresh states.

