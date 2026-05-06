# 08 — Core Features Prompt

## Goal

Create the first product-specific UI features based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt touches actual product features. It must be based on planning documents, not guesses.

## Information the user should provide before running this prompt

- What is the first feature users must use?
- What data does it show or collect?
- What should happen when there is no data?
- Which features should wait until later?

## Files and areas allowed for this prompt

```text
app/
pages/
components/
lib/
hooks/
tests/
```

## Files and areas forbidden for this prompt

```text
Unplanned future modules
Advanced extension features
Deployment files
Unrelated UI rewrites
```

## Tasks

1. Read the user's product and release notes.
2. Identify only the first-release features.
3. Implement one small feature area, not the whole product.
4. Use existing layout, UI components, and data helpers.
5. Add loading, empty, and error states where needed.
6. Add simple tests if the project has a test setup.
7. Do not add future or optional modules.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- Only first-release UI features were created.
- Feature matches product documents.
- UI states are handled.
- No future features are added.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
