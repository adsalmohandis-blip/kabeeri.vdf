# 07 - Core Screens and Features Prompt

## Goal

Implement one small first-release mobile screen or feature.

## Information the user should provide before running this prompt

- Which screen or feature is requested?
- Which task acceptance criteria must be satisfied?
- Which API/data source is involved?
- Which design or page spec should be followed?

## Files and areas allowed for this prompt

```text
app/
src/screens/
src/components/
src/services/
src/state/
src/theme/
README.md only for notes
```

## Files and areas forbidden for this prompt

```text
Unrelated screens
Large navigation rewrites
Backend changes unless the task explicitly includes them
Native platform files unless explicitly approved
Release credentials
```

## Tasks

1. Implement only the requested screen or feature.
2. Reuse existing components, theme, routing, and data patterns.
3. Include loading, empty, and error states where the feature depends on data.
4. Keep touch targets usable on mobile.
5. Avoid hidden deferred scope.
6. Add or update a focused test if test setup exists.
7. Leave clear notes for manual device review.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Requested feature works within the described task.
- UI is mobile-appropriate.
- No unrelated features were added.
- Manual device review notes are included.
