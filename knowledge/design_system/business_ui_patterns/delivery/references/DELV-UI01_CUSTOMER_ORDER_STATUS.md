# DELV-UI01 Customer Order Status

## Identity

- Design code: `DELV-UI01`
- Business: delivery
- View: customer order status
- Style: calm status-first order page

## Layout Anatomy

```text
order summary
current status
ETA
timeline
items
support
```

## UX Goals

- Reduce waiting anxiety.
- Keep current state unmistakable.
- Provide support when something goes wrong.

## Required Components

- `OrderSummary`
- `StatusBadge`
- `EtaCard`
- `StatusTimeline`
- `OrderItems`
- `SupportButton`

## Required States

- received;
- preparing;
- out for delivery;
- delayed;
- delivered;
- cancelled.

## Data Requirements

- order id;
- status;
- ETA;
- items;
- delivery address;
- support links.

## Accessibility

- Timeline uses text labels.
- ETA is not color-only.
- Support action is reachable by keyboard.

## Motion

- `BALANCED_MOTION`
- Status update highlight can be used once.
- Avoid constant pulsing near important text.

## Common Mistakes

- ETA hidden behind map only.
- Status update with no explanation.
- No path for delayed orders.

## Acceptance Criteria

- User can identify current status and next expectation immediately.

## Task Seed

- Build order status page with summary, ETA, timeline, items, support, and delayed/cancelled states.

