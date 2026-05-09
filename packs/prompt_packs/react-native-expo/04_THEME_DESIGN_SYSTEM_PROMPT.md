# 04 - Theme and Design System Prompt

## Goal

Create or improve the mobile design foundation: colors, typography, spacing, reusable components, and basic accessibility.

## Information the user should provide before running this prompt

- Are there existing brand tokens or Kabeeri design documents?
- Is dark mode required?
- Which devices or screen sizes matter most?
- Are Arabic, RTL, or localization required?

## Files and areas allowed for this prompt

```text
src/theme/
src/components/
src/ui/
app/
components/
design_system/
README.md
```

## Files and areas forbidden for this prompt

```text
Backend code
API behavior
Auth logic
Unrelated screens
Native platform configuration unless explicitly needed
```

## Tasks

1. Inspect existing styles and components.
2. Add simple reusable theme tokens if missing.
3. Add small reusable UI primitives only when useful.
4. Improve touch target, contrast, spacing, and text scaling basics.
5. Keep components mobile-native; do not copy web CSS patterns blindly.
6. Do not redesign the whole app.
7. Document how future screens should use the theme.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Theme foundation is consistent.
- Reusable components are small and practical.
- Accessibility basics are considered.
- No unrelated feature work was added.
