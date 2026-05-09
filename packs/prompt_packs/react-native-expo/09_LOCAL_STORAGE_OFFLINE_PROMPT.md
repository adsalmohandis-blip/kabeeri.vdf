# 09 - Local Storage and Offline Prompt

## Goal

Add local storage, cache, or offline behavior only when the mobile task needs it.

## Information the user should provide before running this prompt

- What data needs to be stored locally?
- Is the data sensitive?
- Should data persist after logout?
- What should happen when the network is unavailable?

## Files and areas allowed for this prompt

```text
src/storage/
src/cache/
src/services/
src/state/
src/screens/
app/
README.md
```

## Files and areas forbidden for this prompt

```text
Private secrets
Long-lived sensitive tokens without secure storage
Unrelated sync engines
Native folders unless approved
```

## Tasks

1. Identify whether local persistence is truly needed.
2. Use the existing storage approach when present.
3. Store only the minimum needed data.
4. Avoid storing sensitive values in insecure storage.
5. Add offline empty/error states where relevant.
6. Document what is cached and when it clears.
7. Do not build a broad sync engine unless explicitly requested.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Local storage behavior is explicit.
- Sensitive data risk is reviewed.
- Offline behavior is understandable.
- Scope is limited to the task.
