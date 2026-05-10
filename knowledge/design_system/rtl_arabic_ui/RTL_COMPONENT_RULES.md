# RTL Component Rules

## Buttons

- Icon appears at logical start of the label.
- Directional icons are mirrored.
- Use spacing utilities that support direction:
  - Bootstrap: prefer `me-*` and `ms-*` intentionally.
  - CSS: prefer logical margin.

Example:

```html
<button class="btn btn-primary">
  <i class="bi bi-plus-lg ms-2"></i>
  إنشاء
</button>
```

## Icon-Only Buttons

- Must have Arabic `aria-label` in Arabic UI.
- Tooltip text should match active locale.

## Inputs

- Arabic text inputs: `dir="rtl"`.
- Email, URL, code, SKU, and phone inputs: usually `dir="ltr"` even inside RTL forms.
- Search input can use RTL direction for Arabic query, `dir="auto"` for mixed search.

## Dropdowns

- Menu aligns with logical start/end.
- Chevrons mirror where directional.
- Keyboard navigation remains predictable.

## Tabs

- Tab order follows reading direction.
- Active indicator uses logical properties.

## Alerts

- Icon at logical start.
- Alert copy must be concise and not alarming unless critical.
- Critical states use text plus icon and not color alone.

## Toasts

- Position can be top-start or top-end based on product convention.
- Arabic toast text should have enough duration for reading.
- Important form errors should not be toast-only.

## Modals

- Title aligns right.
- Close button placement follows component library and locale convention.
- Confirm/cancel order should be intentional and consistent.

## Charts

- Chart labels and legends should support Arabic.
- Numeric axes often remain LTR.
- Tooltips need proper text direction.
- Do not mirror data meaning accidentally.

## Empty States

- Icon or illustration above title.
- Arabic title and helper text centered or right-aligned based on layout.
- CTA uses icon and Arabic label.

## Motion

- Directional entrance follows layout direction.
- Do not animate Arabic text in ways that harm readability.

