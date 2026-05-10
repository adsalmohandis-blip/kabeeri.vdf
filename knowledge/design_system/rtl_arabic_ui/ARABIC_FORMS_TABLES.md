# Arabic Forms And Tables

## Forms

Arabic forms must be clear, labeled, and direction-aware.

Rules:

- Every input has a visible Arabic label.
- Helper text appears near the field.
- Error messages appear close to fields.
- Required indicators are consistent.
- Use `dir="auto"` for user-generated free text when language can vary.

Input direction:

| Field | Direction |
| --- | --- |
| Arabic name | RTL |
| English name | LTR or auto |
| Email | LTR |
| URL | LTR |
| Password | LTR or browser default |
| Phone | LTR |
| SKU / code / ID | LTR |
| Arabic address | RTL |
| Search | auto |

Validation:

- Errors should use calm Arabic language.
- Avoid vague messages like `خطأ`.
- Use specific messages such as `أدخل بريدًا إلكترونيًا صحيحًا`.

## Tables

Tables are one of the highest-risk RTL UI areas.

Rules:

- Headers align with cell content.
- Numeric columns can align left or use tabular alignment depending on locale policy.
- Status columns use badges with text.
- Actions column can be at logical end.
- Horizontal scroll starts with the most important columns visible.
- Empty state appears instead of a blank table.

Common Arabic table columns:

- الاسم
- الحالة
- التاريخ
- المبلغ
- المسؤول
- آخر تحديث
- الإجراءات

Mixed data:

- IDs and codes use `<bdi>`.
- Amounts should keep currency readable.
- Dates use locale-aware formatting.

Responsive table options:

- Horizontal scroll for dense admin tables.
- Card list transformation for customer-facing mobile screens.
- Column visibility controls for ERP/CRM.

## Financial Tables

- Amounts must be stable and readable.
- Do not animate financial values.
- Make positive/negative values clear with text plus color.

## Medical Tables

- Do not use tiny text.
- Critical values need text and icon.
- Units and reference ranges must be visible.

## Acceptance Criteria

- Labels, errors, help text, and table headers are readable in Arabic.
- LTR values inside RTL rows display correctly.
- Tables have loading, empty, error, and no-results states.

