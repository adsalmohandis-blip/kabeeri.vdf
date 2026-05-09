# 01 - Mobile Project Context Prompt

## Goal

Give the AI coding assistant enough product and mobile context before implementation.

## Information the user should provide before running this prompt

- What mobile app are you building?
- Is it customer-facing, internal, admin, companion, or mobile-only?
- What backend, BaaS, or API does it connect to?
- What is the first release scope?
- Which platforms are required: iOS, Android, or both?
- Is the app Expo Go compatible, development build based, or custom native?

## Files and areas allowed for this prompt

```text
README.md
docs/
app/
src/
package.json only for inspection
app.json or app.config.* only for inspection
```

## Files and areas forbidden for this prompt

```text
Real secrets
Native credentials
Production store configuration
Unrelated backend files
```

## Tasks

1. Inspect the current Expo app structure.
2. Summarize the product, audience, first release scope, and platform targets.
3. Identify whether this is one app inside the current Kabeeri product boundary.
4. Identify backend/API/BaaS dependencies.
5. Identify risky areas: auth, payments, private data, permissions, notifications, native config, store publishing.
6. Write or update a small mobile context note if the project has a docs folder.
7. Do not implement product features in this prompt.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist in the project.

## Acceptance criteria

- The mobile app purpose is clear.
- First release scope is clear.
- Backend/API relationship is clear.
- Risk areas are listed.
- No feature work was added.
