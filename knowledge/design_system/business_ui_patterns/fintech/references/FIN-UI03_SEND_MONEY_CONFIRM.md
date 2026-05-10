# FIN-UI03 Send Money Confirm

## Identity

- Design code: `FIN-UI03`
- Business: fintech
- View: send money or payment confirmation
- Style: review-confirm-processing-receipt

## Layout Anatomy

```text
recipient
amount
fees
review
confirm
processing
success/failure receipt
```

## UX Goals

- Prevent accidental transfers.
- Make fees and recipient explicit.
- Give clear result and receipt.

## Required Components

- `RecipientCard`
- `AmountInput`
- `FeeBreakdown`
- `ReviewPanel`
- `ConfirmButton`
- `ReceiptCard`

## Required States

- draft;
- validation error;
- review;
- processing;
- success;
- failure.

## Data Requirements

- recipient identity;
- amount;
- fees;
- source account;
- confirmation text;
- receipt id.

## Accessibility

- Amount input has label and currency context.
- Confirmation button describes action.
- Error messages stay near fields.

## Motion

- `MINIMAL_MOTION`
- Processing uses spinner/progress.
- No confetti, bounce, or playful effects.

## Common Mistakes

- Recipient not verified on review.
- Fees hidden until after confirm.
- Failure without retry/support.

## Acceptance Criteria

- User reviews recipient, amount, fees, and result clearly.

## Task Seed

- Build send money flow with review, confirmation, processing, receipt, failure, and retry states.

