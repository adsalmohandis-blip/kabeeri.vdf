# Forms And Error Accessibility

## Labels

- Every input, select, textarea, checkbox group, and radio group needs a visible label.
- Placeholder text is not a label.
- Required fields must be indicated in text, not only color or symbol.
- Helper text should be near the field and programmatically associated.

## Validation

- Validation errors must be specific and actionable.
- Use inline field errors and an optional error summary for long forms.
- Error summaries should link or move focus to invalid fields.
- Preserve entered values after failed submission.
- Disabled submit buttons should communicate why action is unavailable when practical.

## Inputs

- Use correct input types and autocomplete attributes.
- Numeric, currency, phone, date, and email inputs should use appropriate formatting and parsing.
- Date pickers need keyboard and manual-entry fallback.
- File upload controls need accepted file type, size, progress, error, and retry states.

