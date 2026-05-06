# 02 — Content Modeling Prompt

## Goal

Plan or create first-release Strapi content types based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt handles content types, fields, and relationships. It must be based on product/content documents, not guesses.

## Information the user should provide before running this prompt

- What content or data does the system manage? Example: articles, products, services, projects, testimonials, pages.
- Which content types are needed in the first release?
- Which can wait?
- Who should create/edit/see each content type?
- Technical note: If unsure, ask ChatGPT to convert your product objects into Strapi content types.

## Files and areas allowed for this prompt

```text
src/api/
database/
README.md
content-model-notes.md
```

## Files and areas forbidden for this prompt

```text
Real production data
Open public permissions by default
Unrelated modules
```

## Tasks

1. Read the user's product/content notes.
2. Identify only first-release content types.
3. Define fields in beginner-readable language first.
4. Decide whether each content type is public, private, admin-only, or authenticated-user-only.
5. Add relations only when clearly required.
6. Add draft/publish behavior if useful.
7. Do not add future content types.
8. Leave detailed permissions for the roles/permissions prompt.


## Checks to run

```text
Review content model manually.
Run Strapi locally if available.
Create test records only with fake/demo data.
```

## Acceptance criteria

- Content types match first-release product needs.
- Content model is not overbuilt.
- Relationships are understandable.
- Public/private intent is documented.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
