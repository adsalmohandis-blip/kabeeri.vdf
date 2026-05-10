# Delivery UI Pattern Pack

Use this pack for delivery logistics, order tracking, courier apps, store order operations, and dispatch dashboards.

## Design Posture

- Priority: status clarity, ETA confidence, live updates, failure recovery.
- Density: balanced; compact for driver/store operations.
- Motion: `BALANCED_MOTION`.
- Dashboard reference: `ADMIT-ADB02` for operations.

## Required Views

- Customer order status
- Tracking map/timeline
- Driver dashboard
- Store order queue
- Admin monitoring

## Required Flows

- `CHECKOUT_FLOW.md`
- `PAYMENT_CONFIRMATION_FLOW.md`

## Creative Axes

- Timeline versus map emphasis
- ETA treatment
- Driver action density
- Alert intensity
- Support and recovery style

## Acceptance Criteria

- Current order state is always visible.
- ETA changes are clear.
- Failed delivery or cancellation has recovery path.

