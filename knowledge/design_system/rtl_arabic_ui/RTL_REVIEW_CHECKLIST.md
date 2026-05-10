# RTL Arabic UI Review Checklist

Use this checklist before finishing Arabic or bilingual UI work.

## Direction

- Page or app has correct `dir`.
- Arabic sections use `lang="ar"`.
- Mixed user content uses `dir="auto"` where needed.
- IDs, codes, emails, URLs, SKUs, and order numbers display correctly.

## Typography

- Arabic font is readable.
- Line height does not clip text.
- Small labels remain readable.
- No negative letter spacing.
- Arabic headings do not overlap nearby content.

## Layout

- Header, breadcrumbs, navigation, and actions follow RTL logic.
- Sidebar/drawer behavior is intentional.
- Responsive layout works on mobile.
- Content priority is preserved after mirroring.

## Components

- Buttons have icons where required.
- Directional icons are mirrored.
- Non-directional icons are not mirrored.
- Tooltips and aria labels match Arabic locale.
- Modals, dropdowns, tabs, and drawers behave correctly.

## Forms

- Every field has visible label.
- Field direction is correct.
- Error messages are close to fields.
- Required and disabled states are clear.
- Submit/loading/success/error states exist.

## Tables

- Headers align with content.
- Actions column placement is logical.
- LTR values inside RTL rows display correctly.
- Responsive behavior is defined.
- Loading, empty, no-results, and error states exist.

## Accessibility

- Keyboard navigation works.
- Focus indicators are visible.
- Status is not color-only.
- Icon-only buttons have Arabic labels.
- Motion respects reduced motion.

## Visual Quality

- Arabic text does not feel cramped.
- Long labels wrap cleanly.
- CTAs remain prominent.
- The screen does not look like a broken mirrored LTR layout.

