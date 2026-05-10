# DELV-UI03 Driver Dashboard

## Identity

- Design code: `DELV-UI03`
- Business: delivery
- View: driver dashboard
- Style: touch-friendly operational interface

## Layout Anatomy

```text
shift status
next delivery
route list
primary action
issue reporting
```

## UX Goals

- Keep driver actions fast and safe.
- Prioritize next delivery.
- Provide clear issue reporting.

## Required Components

- `ShiftStatus`
- `NextDeliveryCard`
- `RouteList`
- `PrimaryActionButton`
- `IssueReportButton`
- `OfflineStatus`

## Required States

- online;
- offline;
- en route;
- arrived;
- issue reported;
- network lost.

## Data Requirements

- assigned orders;
- route;
- customer/contact policy;
- status actions;
- issue reasons.

## Accessibility

- Large touch targets.
- Clear button labels.
- Offline state is visible.

## Motion

- `MINIMAL_MOTION`
- Action feedback is quick.
- No distracting motion while driving context may apply.

## Common Mistakes

- Tiny controls.
- Too many modals.
- Hidden offline state.

## Acceptance Criteria

- Driver can see and execute next safe action quickly.

## Task Seed

- Build driver dashboard with route, next delivery, large actions, offline, and issue states.

