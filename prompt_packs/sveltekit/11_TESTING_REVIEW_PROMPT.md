# 11 — Testing and Review Prompt

## Goal

Review the current SvelteKit implementation and improve basic quality checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which features have been implemented so far?
- Are there known bugs?
- Which pages/forms feel risky?
- Is testing already installed?

## Files and areas allowed for this prompt

```text
tests/
src/ only for small fixes
README.md for test notes
package.json only for scripts if needed
```

## Files and areas forbidden for this prompt

```text
New product features
Large refactors
Unrelated architecture changes
```

## Tasks

1. Review current scripts: check, lint, build, test.
2. Add or improve basic tests if test setup exists.
3. Check accessibility basics for important pages.
4. Check loading, empty, and error states.
5. Check form actions and server errors where relevant.
6. Fix small issues discovered during review.
7. Add a short testing/checks section in README if needed.
8. Do not add new features.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- App passes check/build or failures are explained.
- Important UI has basic review coverage.
- No new product scope is added.
- Review notes are clear.


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
