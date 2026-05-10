# ECOM-UI03 Checkout Flow

## Identity

- Design code: `ECOM-UI03`
- Business: e-commerce
- View: checkout
- Style: low-friction stepper with explicit cost review
- Copy policy: inspiration only

## Core Pattern

```text
checkout stepper
contact / shipping / payment forms
order summary
policy notes
processing / success / failure states
```

## Required Sections

- checkout progress indicator;
- contact details;
- shipping or delivery method;
- payment method;
- coupon or discount;
- order summary;
- final review before payment.

## Component Contracts

- `CheckoutStepper`
- `AddressForm`
- `PaymentMethod`
- `CouponInput`
- `OrderSummary`
- `PolicyNotice`
- `PaymentButton`

## States

- empty cart;
- invalid address;
- payment processing;
- payment failed;
- order success;
- duplicate submission disabled.

## Design Rules

- Total, fees, tax, and shipping must be visible before final action.
- Payment action must be disabled while processing.
- Errors stay close to fields and are not toast-only.
- Support guest and logged-in checkout if the product requires both.

## Motion

- `BALANCED_MOTION`
- Step transitions can be subtle.
- Payment processing uses stable progress or spinner.
- No confetti for serious payment confirmation.

## Task Seed

- Build checkout using `CHECKOUT_FLOW.md` and `PAYMENT_CONFIRMATION_FLOW.md`.
- Include validation, processing, failure, retry, success, and receipt states.

