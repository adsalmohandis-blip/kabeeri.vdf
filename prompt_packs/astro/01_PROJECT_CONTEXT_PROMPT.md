# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct website/product and Astro context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the site purpose, audience, first release scope, content source, integrations, and what it must not build yet.

## Information the user should provide before running this prompt

- What site are you building?
- Who will visit it?
- What should the first version include?
- Is it landing page, blog, docs, portfolio, marketing site, or hybrid?
- Where will content come from?

## Files and areas allowed for this prompt

```text
README.md
src/
astro.config.*
package.json
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

1. Read the product/site summary provided by the user.
2. Identify the first release scope.
3. Identify site type: landing page, marketing site, blog, docs site, portfolio, product site, or hybrid.
4. Identify content source: local markdown, Astro content collections, CMS, API, or static content.
5. Identify whether interactive islands are needed.
6. Identify what should not be built yet.
7. Produce an implementation context summary.
8. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
npm run build
npm test
```

## Acceptance criteria

- The AI clearly understands the site/product.
- First release scope is separated from future ideas.
- Astro role and content source are clear.
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
