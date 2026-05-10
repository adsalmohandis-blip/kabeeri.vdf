# RTL Arabic Accessibility

## Language And Direction

- Use `lang="ar"` for Arabic documents or Arabic sections.
- Use `dir="rtl"` for Arabic UI surfaces.
- Use `dir="auto"` for user-generated content.
- Use `bdi` for IDs, codes, email addresses, and mixed inline values.

## Keyboard

- Keyboard navigation must remain logical in RTL.
- Arrow-key behavior should match component expectations.
- Menus and tabs must remain reachable.

## Screen Readers

- Arabic labels must be meaningful, not literal placeholder text.
- Icon-only controls need Arabic `aria-label`.
- Status changes should be announced where needed.
- Loading states should have accessible labels.

## Color And Status

- Do not use color alone.
- Use icon, label, and text status.
- Critical medical, financial, security, and destructive states need explicit language.

## Focus

- Focus indicators must be visible in RTL.
- Modals and drawers manage focus.
- Do not move focus unexpectedly after validation.

## Motion

- Respect reduced motion.
- Do not animate Arabic text in ways that reduce readability.
- Preserve static status indicators when motion is reduced.

## Reading Comfort

- Arabic body text should have enough line height.
- Avoid cramped text in cards and tables.
- Do not truncate critical Arabic labels without tooltip or full value.

## Review Questions

- Can a keyboard user complete the flow in Arabic?
- Can a screen reader identify each action?
- Are mixed-language values announced correctly?
- Are status and errors understandable without color?

