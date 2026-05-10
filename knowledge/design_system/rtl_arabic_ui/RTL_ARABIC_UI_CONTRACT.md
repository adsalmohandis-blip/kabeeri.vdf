# RTL Arabic UI Contract

Use this contract for Arabic or bilingual UI work.

## Core Rules

- Set document or app direction intentionally: `dir="rtl"` for Arabic surfaces, `dir="ltr"` for English surfaces.
- Do not rely on visual flipping alone. Review content order, icon direction, number direction, and input behavior.
- Prefer logical CSS properties: `margin-inline-start`, `padding-inline-end`, `border-inline-start`, `inset-inline-start`.
- Avoid left/right naming in new component APIs. Use start/end.
- Arabic labels must be visible and readable, especially in forms and tables.
- Support Arabic copy length. Arabic can be wider or wrap differently than English.
- Keep UI density comfortable enough for Arabic readability.
- Do not mix Arabic and English punctuation carelessly.

## Bilingual Surfaces

For bilingual UI:

- Each language segment should have the correct `dir` and `lang`.
- Use `dir="auto"` for user-generated text when language is unknown.
- Keep product navigation direction consistent with the active locale.
- Do not mirror brand logos unless the brand explicitly requires it.

## Numbers And Dates

- Choose numeral style deliberately: Arabic-Indic, Eastern Arabic, or Western digits based on product locale and domain.
- Financial, technical, and code-heavy screens may prefer Western digits for operator clarity.
- Dates must use locale-aware formatting.
- Phone numbers, email addresses, URLs, SKUs, order IDs, and code tokens usually stay LTR inside RTL text.

## Icon Direction

Mirror directional icons:

- back/forward arrows;
- chevrons;
- next/previous;
- undo/redo when direction implies navigation.

Do not mirror:

- search;
- settings;
- user/avatar;
- trash;
- download/upload unless the icon itself is directional in the selected library;
- brand marks;
- payment card icons.

## Motion

- Directional motion follows reading direction.
- In RTL, drawers often enter from the right unless product navigation says otherwise.
- Reduced motion rules still apply.

## Acceptance Criteria

- Direction is correct for the active language.
- Icons with direction are mirrored intentionally.
- Forms, tables, and navigation work in RTL.
- Mixed Arabic/English values display correctly.
- Text does not overlap or truncate badly.

