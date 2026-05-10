# 13 - Backend API Contract Prompt

## Goal

Align the Expo app with the product backend before coding mobile screens that depend on server data.

Use this prompt when the mobile app depends on Laravel, Node, Supabase, Firebase, Django, .NET, or another backend and the API contract is not yet clear enough for safe implementation.

## Information the user should provide before running this prompt

- Which backend app or service owns the data?
- Which mobile journey needs the contract?
- Which endpoints, auth method, headers, pagination, filtering, and error shapes are expected?
- Are there existing OpenAPI files, backend route files, Postman collections, or docs?
- Which fields are safe for the mobile app and which fields must remain server-only?

## Files and areas allowed for this prompt

```text
docs/
api/
src/api/
src/services/
src/types/
src/models/
app/
README.md
.kabeeri/ only through approved KVDF commands
```

## Files and areas forbidden for this prompt

```text
Backend database migrations unless explicitly approved
Backend admin credentials
Service role keys
Payment secrets
Store credentials
Large backend rewrites
Unrelated mobile screens
```

## Tasks

1. Inspect the current mobile API usage and any backend contract documents.
2. Identify the exact data contract needed for the task: request, response, auth, errors, pagination, cache behavior, and privacy boundaries.
3. Document missing backend questions before implementation.
4. Add or update lightweight mobile-side types, DTO notes, or service contract stubs only when they clarify the task.
5. Do not invent backend behavior that is not documented or visible in code.
6. If the backend is missing required behavior, create a clear follow-up task instead of hiding the gap in mobile code.
7. Keep the mobile app resilient to loading, empty, error, expired session, and offline states.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Mobile-backend contract is clear enough for the next implementation task.
- Sensitive backend-only fields and secrets are not exposed to the app.
- Missing API questions are listed instead of guessed.
- Any code changes are limited to mobile-side contract support.
