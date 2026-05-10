# ECOM-UI04 Order Tracking

## Identity

- Design code: `ECOM-UI04`
- Business: e-commerce
- View: order status and tracking
- Style: calm timeline with clear next steps
- Copy policy: inspiration only

## Core Pattern

```text
order summary
status timeline
shipping / delivery details
items list
support / return actions
```

## Required Sections

- order number and date;
- current status badge;
- status timeline;
- delivery estimate or pickup details;
- item list;
- invoice, support, return, reorder actions.

## Component Contracts

- `OrderStatusBadge`
- `StatusTimeline`
- `OrderItemsList`
- `DeliveryCard`
- `SupportActions`
- `InvoiceButton`

## States

- order placed;
- processing;
- shipped;
- delayed;
- delivered;
- cancelled;
- return requested.

## Design Rules

- Current status must be obvious without reading the whole page.
- Timeline uses text plus icons, not color alone.
- Support path is visible for delayed or failed orders.

## Motion

- `BALANCED_MOTION`
- Timeline updates can highlight once.
- Avoid looping animations near delivery status.

## Task Seed

- Build order tracking with status timeline, item list, and support actions.
- Add delayed, cancelled, return, and delivered states.

