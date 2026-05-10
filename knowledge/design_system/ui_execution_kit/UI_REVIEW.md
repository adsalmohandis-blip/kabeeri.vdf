# UI Review Checklist

Review only UI/UX consistency unless the task asks for business logic review.

## Stack And Tokens

- Approved UI foundation is used.
- No unapproved UI library was introduced.
- No raw hex colors inside page components.
- Design tokens or theme variables are used.
- Custom CSS does not duplicate framework components.
- A business UI pattern is selected when product type is known.
- Relevant user flow files are referenced for stateful UI.

## Actions And Icons

- Every action button has an icon unless the selected design system intentionally omits it.
- Icon placement follows `ICON_MAP.md`.
- Destructive actions use danger/destructive style.
- Primary action is visually clear.
- Icon-only buttons have `aria-label`.

## States

- Loading state exists for data loading.
- Empty state exists for zero data.
- Error state exists for failures.
- Success feedback exists for mutations.
- Disabled/action-in-progress state exists for submissions.

## Layout And Density

- Page header is clear.
- Spacing follows the selected density.
- Tables are responsive.
- Forms have visible labels and helper/error text.
- Cards and sections are not nested unnecessarily.

## Accessibility

- Buttons are used for actions.
- Links are used for navigation.
- Focus states are visible.
- Color is not the only status signal.
- Contrast is acceptable.
- Modals/dialogs have titles.
- RTL behavior is considered when Arabic is supported.

## Creative Fit

- The design uses at least four creative axes from `CREATIVE_VARIATION_RULES.md`.
- Visual personality matches product answers.
- Similar app types are not forced into identical layout, palette, or tone.

## Motion

- Motion level matches business risk and surface type.
- Motion serves feedback, guidance, continuity, or perceived performance.
- Durations and easing use motion tokens.
- `prefers-reduced-motion` is respected.
- Critical prices, warnings, errors, confirmations, or table data are not hidden behind motion.
