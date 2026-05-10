# MRKT-UI04 Transaction Request

## Identity

- Design code: `MRKT-UI04`
- Business: marketplace
- View: request, booking, quote, or checkout
- Style: review-first transaction with platform clarity

## Layout Anatomy

```text
request details
buyer info
seller terms
fees
review
submit/confirm
```

## UX Goals

- Reduce ambiguity before transaction.
- Separate seller terms from platform fees.
- Provide recovery for failures.

## Required Components

- `RequestForm`
- `BuyerDetails`
- `SellerTerms`
- `FeeBreakdown`
- `ReviewPanel`
- `SubmitRequestButton`

## Required States

- draft;
- validating;
- submitted;
- seller unavailable;
- payment required;
- failed.

## Data Requirements

- listing id;
- buyer details;
- request details;
- fees;
- terms;
- payment state.

## Accessibility

- Forms have visible labels.
- Errors are field-specific.
- Fee breakdown is readable.

## Motion

- `BALANCED_MOTION`
- Step changes can transition.
- No celebratory motion before seller confirmation.

## Common Mistakes

- Hidden platform fees.
- Buyer cannot edit before submit.
- Failure state has no support path.

## Acceptance Criteria

- User reviews terms, fees, and details before confirming.

## Task Seed

- Build transaction request with review, terms, fees, validation, submit, success, and failure states.

