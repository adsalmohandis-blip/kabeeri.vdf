# 11 - Testing and Review Prompt

## Goal

Review the current Expo implementation and improve basic quality without adding features.

## Information the user should provide before running this prompt

- Which screens/features were implemented?
- What known issues exist?
- Which devices or platforms should be checked?
- Is there an existing test setup?

## Files and areas allowed for this prompt

```text
__tests__/
tests/
src/
app/
README.md
package.json only for existing scripts or test setup
```

## Files and areas forbidden for this prompt

```text
New product features
Large rewrites
Store credentials
Native platform changes unless fixing an approved issue
```

## Tasks

1. Inspect available scripts and test setup.
2. Run available checks.
3. Add or improve focused tests if the setup exists.
4. Check loading, empty, error, and offline states where relevant.
5. Review accessibility basics: labels, contrast, touch targets, text scaling.
6. Review iOS/Android differences where possible.
7. Fix only small issues discovered during review.

## Checks to run

```bash
npm run lint
npm test
npx expo-doctor
```

Run only checks that exist.

## Acceptance criteria

- Checks pass or failures are clearly explained.
- Review does not add new product scope.
- Device/manual review notes are clear.
- Remaining risks are listed.
