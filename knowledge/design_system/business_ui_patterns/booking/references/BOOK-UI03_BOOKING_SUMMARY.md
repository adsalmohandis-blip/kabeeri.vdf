# BOOK-UI03 Booking Summary

## Identity

- Design code: `BOOK-UI03`
- Business: booking
- View: booking summary
- Style: confirmation-ready review card

## Core Pattern

```text
selected service
date/time
provider/location
price
policy
confirm action
```

## Required Sections

- service summary;
- date and time;
- provider or location;
- price and fees;
- cancellation policy;
- confirm action.

## Component Contracts

- `BookingSummaryCard`
- `PolicyNotice`
- `PriceBreakdown`
- `ConfirmBookingButton`
- `EditSelectionButton`

## States

- ready to confirm;
- validating;
- policy warning;
- payment required;
- confirmation failed.

## Design Rules

- Summary appears before final confirmation.
- Policy is visible before commitment.
- Edit action is available.

## Motion

- `BALANCED_MOTION`
- Summary updates can transition.
- Confirmation action should not bounce.

## Task Seed

- Build booking summary with price, policy, edit, confirm, validation, and failure states.

