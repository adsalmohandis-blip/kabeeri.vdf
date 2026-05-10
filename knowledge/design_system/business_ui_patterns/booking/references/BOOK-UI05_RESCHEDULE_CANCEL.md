# BOOK-UI05 Reschedule Cancel

## Identity

- Design code: `BOOK-UI05`
- Business: booking
- View: reschedule and cancellation
- Style: policy-aware change flow

## Core Pattern

```text
current booking
change options
policy impact
new slot selector
confirm change/cancel
```

## Required Sections

- current booking summary;
- reschedule action;
- cancellation policy;
- new slot selector;
- confirm change or cancel;
- result state.

## Component Contracts

- `CurrentBookingCard`
- `PolicyImpact`
- `ReschedulePicker`
- `CancelButton`
- `ConfirmChangeModal`
- `ResultState`

## States

- allowed;
- policy penalty;
- too late to cancel;
- reschedule success;
- cancellation success;
- failed update.

## Design Rules

- Policy impact must be explicit.
- Destructive cancellation requires confirmation.
- Success state explains what changed.

## Motion

- `BALANCED_MOTION`
- Slot change can update summary subtly.
- Cancellation confirmation stays calm.

## Task Seed

- Build reschedule/cancel flow with policy impact, slot selection, confirmation, and result states.

