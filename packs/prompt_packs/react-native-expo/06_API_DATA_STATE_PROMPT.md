# 06 - API, Data, and State Prompt

## Goal

Connect the mobile app to data in a controlled way without building every product feature.

## Information the user should provide before running this prompt

- Which endpoint, collection, or service is needed first?
- What loading, empty, and error states are required?
- Is the app using fetch, Axios, React Query, Zustand, Redux, Firebase, Supabase, or another data layer?

## Files and areas allowed for this prompt

```text
src/services/
src/api/
src/state/
src/hooks/
src/screens/
app/
README.md
```

## Files and areas forbidden for this prompt

```text
Server-only secrets
Backend admin SDK credentials
Unrelated endpoints
Large architecture rewrites
Native platform configuration
```

## Tasks

1. Reuse existing data/state patterns.
2. Add one small API/data integration for the requested task.
3. Add loading, empty, error, and retry behavior where appropriate.
4. Keep response shapes typed or documented where useful.
5. Prevent accidental exposure of private fields.
6. Do not add global state libraries unless justified and approved.
7. Keep the implementation testable.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- One data path is implemented or improved.
- Failure states are handled.
- No private server credentials are exposed.
- Scope remains tied to the task.
