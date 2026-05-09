# 02 — Store Structure Prompt

## Goal

Plan Shopify store structure for products, collections, navigation, pages, and content.

## Context for the AI coding assistant

This prompt helps organize the store before coding theme/app customizations.

## Information the user should provide before running this prompt

- What products/services will the store sell?
- What are the main collections?
- What pages are required in the first version?
- What menu items should appear first?

## Files and areas allowed for this prompt

```text
README.md
store-structure-notes.md
content-plan.md
migration notes if present
```

## Files and areas forbidden for this prompt

```text
Live store destructive changes
Real customer data
Secrets
```

## Tasks

1. Identify product types and main collections.
2. Plan navigation/menu structure.
3. Plan important pages such as home, product, collection, about, contact, policy pages.
4. Identify content blocks needed for the first release.
5. Identify what can wait until later.
6. Do not write theme/app code unless explicitly requested.
7. Do not import real production data.


## Checks to run

```text
Review store structure manually.
Confirm first-release navigation and content plan.
Confirm no production data is included.
```

## Acceptance criteria

- Store structure is understandable.
- Product/collection plan matches first release.
- Navigation plan is simple.
- Future ideas are separated.


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
