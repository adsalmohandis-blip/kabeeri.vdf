# 11 — Testing and Review Prompt

## Goal

Review the current Astro implementation and improve basic quality checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which pages/features have been implemented so far?
- Are there known bugs?
- Which pages feel risky?
- Is testing or link checking already installed?

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

1. Review current scripts: build, test, check, lint if present.
2. Check important pages manually.
3. Check accessibility basics.
4. Check responsive behavior.
5. Check metadata and broken links where possible.
6. Fix small issues discovered during review.
7. Add a short testing/checks section in README if needed.
8. Do not add new features.


## Checks to run

```bash
npm run build
npm test
```

## Acceptance criteria

- Site builds or failures are explained.
- Important pages have basic review coverage.
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
