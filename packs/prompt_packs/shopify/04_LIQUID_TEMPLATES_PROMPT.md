# 04 — Liquid Templates Prompt

## Goal

Modify Shopify Liquid templates/snippets for a focused first-release customization.

## Context for the AI coding assistant

This prompt is used when theme template logic needs controlled changes.

## Information the user should provide before running this prompt

- Which page/template needs customization?
- What should change visually or functionally?
- What data should it show?
- Should it depend on products, collections, metafields, or settings?

## Files and areas allowed for this prompt

```text
templates/
sections/
snippets/
assets/
layout/
README.md
```

## Files and areas forbidden for this prompt

```text
Live production theme without backup
Unrelated templates
Shopify secrets
```

## Tasks

1. Confirm the target template/snippet.
2. Explain what the current template does if code exists.
3. Modify only the necessary Liquid/template code.
4. Use simple readable Liquid logic.
5. Avoid breaking merchant-editable content.
6. Test empty/missing data states.
7. Do not rewrite the whole theme.


## Checks to run

```text
Preview affected pages.
Check for Liquid errors.
Test desktop and mobile.
Test with missing/empty data.
```

## Acceptance criteria

- Target template behaves as expected.
- Liquid code is readable.
- Empty states are handled.
- Scope is limited to the requested template/snippet.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Shopify secrets.  
Do not modify live production themes/stores without backup and approval.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Shopify changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
