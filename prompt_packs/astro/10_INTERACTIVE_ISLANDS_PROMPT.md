# 10 — Interactive Islands Prompt

## Goal

Add Astro interactive islands only when specific interactivity is needed.

## Context for the AI coding assistant

This prompt is optional. Use it only for confirmed interactive parts.

## Information the user should provide before running this prompt

- What exactly needs interactivity?
- Is it a calculator, filter, form, carousel, menu, dashboard widget, or something else?
- Which UI framework is already used, if any?

## Files and areas allowed for this prompt

```text
src/components/
src/pages/
src/lib/
package.json if framework integration is required
```

## Files and areas forbidden for this prompt

```text
Unrelated client-side app conversion
Heavy JavaScript everywhere
Secrets
```

## Tasks

1. Identify the exact interactive component needed.
2. Decide whether vanilla JS, React, Vue, Svelte, or another island framework is required.
3. Add one interactive island only.
4. Keep JavaScript minimal.
5. Add fallback/empty states where useful.
6. Do not convert the whole site into a client-side app.
7. Do not add heavy packages unless justified.


## Checks to run

```bash
npm run build
Preview interaction locally.
Check that page still works without unrelated JS.
```

## Acceptance criteria

- Interactive island has one clear purpose.
- JavaScript is limited.
- Site performance is not harmed unnecessarily.
- No unrelated interactive features are added.


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
