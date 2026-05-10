# 14 - Mobile Accessibility and Performance Prompt

## Goal

Review and improve mobile accessibility, perceived performance, and device ergonomics without adding new product features.

Use this prompt after one or more screens exist and the team needs the app to feel professional on real devices.

## Information the user should provide before running this prompt

- Which screens or flows should be reviewed?
- Which devices, screen sizes, and languages matter most?
- Is Arabic, RTL, large text, or dark mode required?
- Are there known slow screens, heavy lists, image issues, keyboard problems, or layout jumps?

## Files and areas allowed for this prompt

```text
app/
src/screens/
src/components/
src/theme/
src/hooks/
src/utils/
__tests__/
tests/
README.md
```

## Files and areas forbidden for this prompt

```text
New product features
Unrelated navigation rewrites
Backend behavior
Native platform configuration unless an approved issue requires it
Store publishing files
Secrets or credentials
```

## Tasks

1. Inspect the requested screens and existing UI foundation.
2. Check accessibility labels, roles where relevant, text scaling, contrast, focus order, hit areas, and disabled/loading states.
3. Check mobile ergonomics: safe areas, keyboard avoidance, scrolling, platform differences, orientation assumptions, and one-handed reach where important.
4. Check performance basics: heavy renders, unstable list keys, oversized images, unnecessary re-fetching, and avoidable layout shifts.
5. Improve only focused issues that fit the approved task.
6. Add a short manual review note covering iOS, Android, small screen, and large text expectations.
7. Do not redesign the product or add new scope.

## Checks to run

```bash
npm run lint
npm test
npx expo-doctor
```

Run only checks that exist.

## Acceptance criteria

- Requested screens are easier to use on real mobile devices.
- Accessibility and performance changes are focused and explainable.
- No unrelated product features were added.
- Remaining manual device risks are documented.
