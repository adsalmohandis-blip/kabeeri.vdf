# Arabic Typography

Arabic UI typography must be chosen for readability, not decoration.

## Font Strategy

Use a high-quality Arabic-capable font stack.

Recommended stacks:

```css
font-family:
  "IBM Plex Sans Arabic",
  "Noto Sans Arabic",
  "Tajawal",
  "Cairo",
  system-ui,
  sans-serif;
```

For dense dashboards:

```css
font-family:
  "IBM Plex Sans Arabic",
  "Noto Sans Arabic",
  system-ui,
  sans-serif;
```

## Size And Line Height

- Body: at least `16px`.
- Small UI text: avoid going below `13px`.
- Arabic line height should usually be higher than Latin: `1.55` to `1.75`.
- Dense tables can use `14px` with `1.5` line height if readability is tested.

## Weight

- Avoid very thin weights for Arabic.
- Use `400`, `500`, `600`, and `700`.
- For headings, `600` is often cleaner than heavy `800`.

## Letter Spacing

- Do not use negative letter spacing.
- Do not add tracking to Arabic text.
- Arabic readability is harmed by careless letter spacing.

## Alignment

- Arabic paragraphs align right by default.
- Center alignment is acceptable for short hero or empty state copy.
- Avoid justified Arabic text in UI surfaces.

## Mixed Text

- Use `dir="auto"` for user-generated mixed-language text.
- Keep IDs, codes, URLs, and emails LTR.
- Use isolation when needed:

```html
<bdi>INV-2026-0042</bdi>
```

## Common Mistakes

- Tiny Arabic table labels.
- Using decorative Arabic fonts in operational UI.
- English punctuation placed awkwardly in Arabic sentences.
- Overly bold body copy.
- Clipped Arabic diacritics due to low line-height.

## Review

- Arabic text is readable at mobile width.
- Long Arabic labels wrap cleanly.
- Headings do not crowd following content.
- Form labels and helper text remain clear.

