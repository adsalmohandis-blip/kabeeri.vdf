# Form And Validation Copy

## Labels

- Labels should name the data expected.
- Helper text should explain format, limits, or consequence.
- Placeholder text may show an example but must not replace the label.
- Required fields should be explicit.

## Validation

- Say what is wrong.
- Say how to fix it.
- Preserve user input.
- Use field-level errors for simple forms.
- Use an error summary for long or multi-step forms.

## Sensitive Flows

- Payments: clarify fees, taxes, currency, retry, and duplicate charge risk.
- Healthcare: avoid exposing sensitive data in error messages.
- FinTech: use precise amount, account, and permission copy.
- Admin: distinguish validation error from permission error.

## Examples

- `Enter a valid email address, such as name@example.com.`
- `Password must be at least 12 characters.`
- `Amount must be greater than 0.`
- `This SKU already exists. Use a unique SKU or edit the existing product.`

