# 05 - Authentication and Onboarding Prompt

## Goal

Add or improve mobile authentication and first-use onboarding foundation when required.

## Information the user should provide before running this prompt

- Is login required for the first release?
- Which auth provider is used?
- What screens are needed: login, signup, reset password, onboarding, profile?
- Which routes are public and which require authentication?

## Files and areas allowed for this prompt

```text
app/
src/auth/
src/screens/
src/services/
src/state/
src/config/
README.md
```

## Files and areas forbidden for this prompt

```text
Private auth secrets
Backend admin credentials
Payment features
Unrelated product screens
Native credentials
```

## Tasks

1. Inspect existing auth/onboarding code.
2. Add minimal auth state foundation if missing.
3. Add screens or route guards only within the requested scope.
4. Use secure storage only when the project already chose it or the task approves it.
5. Avoid storing sensitive tokens in plain local storage.
6. Add loading, error, and signed-out states.
7. Do not implement unrelated account or admin features.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Public/authenticated flow is clear.
- Sensitive values are not exposed.
- Onboarding/auth changes are small and reviewable.
- User can understand the next auth task.
