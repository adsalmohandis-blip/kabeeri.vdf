# Semantic HTML Rules

## Structure

- Use one clear `h1` per page view.
- Headings must follow content hierarchy.
- Use `main`, `nav`, `header`, `footer`, `section`, `article`, and `aside` where appropriate.
- Use lists for grouped navigation or repeated simple items.
- Use tables for tabular data, not CSS grids pretending to be tables.
- Use buttons for actions and links for navigation.

## ARIA

- Prefer native HTML behavior before ARIA.
- Use `aria-label` or `aria-labelledby` only when visible text is not enough.
- Use `aria-describedby` for helper text and error descriptions.
- Use `aria-expanded`, `aria-controls`, `aria-current`, `aria-selected`, and `aria-sort` only when state exists and is updated.
- Do not add ARIA roles that conflict with native semantics.

## Landmarks

- Public pages should include skip-to-content behavior.
- App shells should expose main navigation and main content regions.
- Repeated sidebars, filters, and toolbars should have clear labels.

