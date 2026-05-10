# BOOK-UI04 Payment Confirmation

## Identity

- Design code: `BOOK-UI04`
- Business: booking
- View: paid booking payment and confirmation
- Style: trustworthy review-confirm-receipt flow

## Core Pattern

```text
booking review
payment method
processing
success/failure
receipt
calendar action
```

## Required Sections

- booking review;
- payment method;
- final total;
- processing state;
- success receipt;
- retry or support action.

## Component Contracts

- `BookingReview`
- `PaymentMethod`
- `TotalBlock`
- `ProcessingState`
- `ReceiptCard`
- `RetryButton`

## States

- review;
- processing;
- success;
- payment failed;
- slot expired;
- receipt ready.

## Design Rules

- Payment amount is stable and readable.
- Failure state gives retry and support path.
- Calendar add action appears after success.

## Motion

- `MINIMAL_MOTION`
- Processing uses clear spinner/progress.
- No confetti for paid bookings.

## Task Seed

- Build booking payment confirmation with review, processing, success, failure, receipt, and calendar action.

