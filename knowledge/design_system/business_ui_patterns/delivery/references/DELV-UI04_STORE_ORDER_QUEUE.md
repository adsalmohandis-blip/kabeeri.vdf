# DELV-UI04 Store Order Queue

## Identity

- Design code: `DELV-UI04`
- Business: delivery
- View: store order queue
- Style: compact fulfillment queue

## Layout Anatomy

```text
order filters
status columns/table
order cards
prep actions
handoff status
alerts
```

## UX Goals

- Help store staff process orders quickly.
- Make deadlines and status clear.
- Reduce missed handoffs.

## Required Components

- `OrderQueue`
- `StatusColumn`
- `OrderCard`
- `PrepTimer`
- `HandoffBadge`
- `AlertPanel`

## Required States

- new;
- preparing;
- ready;
- handed off;
- delayed;
- cancelled.

## Data Requirements

- order number;
- prep time;
- items;
- delivery partner;
- status;
- notes.

## Accessibility

- Timers have text labels.
- Status uses badge plus text.
- Actions are keyboard accessible.

## Motion

- `MINIMAL_MOTION`
- New order can highlight once.
- Avoid alarm-like looping unless truly critical.

## Common Mistakes

- Orders look too similar across states.
- Critical notes hidden.
- No no-orders state.

## Acceptance Criteria

- Staff can identify next prep action and handoff status.

## Task Seed

- Build store order queue with statuses, timers, prep actions, alerts, and no-orders state.

