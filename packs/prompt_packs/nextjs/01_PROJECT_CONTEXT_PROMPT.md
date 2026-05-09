# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct product and frontend context before writing Next.js code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the product, first release scope, frontend/backend relationship, and what it must not build yet.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should the first version do?
- Is Next.js the full app or only the frontend?
- Is there a backend API? If yes, what is it?
- Are you using App Router, Pages Router, or not sure?

## Files and areas allowed for this prompt

```text
README.md
app/ or pages/
components/
lib/
package.json
next.config.*
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the first release scope.
3. Identify whether this is frontend-only, full-stack Next.js, or frontend connected to an external backend.
4. Identify whether the project uses App Router or Pages Router.
5. Identify what should not be built yet.
6. Produce an implementation context summary.
7. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- The AI clearly understands the product.
- First release scope is separated from future ideas.
- The frontend/backend relationship is clear.
- The routing approach is clear or flagged as undecided.
- No unrelated features are added.


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
