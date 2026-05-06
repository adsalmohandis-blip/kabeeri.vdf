# 06 — Media Library Prompt

## Goal

Plan Strapi media library and file handling if the product needs uploads.

## Context for the AI coding assistant

This prompt is optional. Use it only when the first release needs images, files, documents, or media fields.

## Information the user should provide before running this prompt

- What media will be uploaded? Images, PDFs, videos, documents?
- Which content types need media?
- Should media be public or private?
- Technical note: Ask ChatGPT if you are unsure about Strapi media providers.

## Files and areas allowed for this prompt

```text
config/
src/api/
README.md
media-notes.md
```

## Files and areas forbidden for this prompt

```text
Public exposure of private files
Real secrets
Unrelated media features
```

## Tasks

1. Ask what file types the product needs.
2. Identify where media fields are used.
3. Decide whether media should be public or protected.
4. Configure or document provider choice only if needed.
5. Validate file size/type expectations if applicable.
6. Do not build advanced digital asset management.


## Checks to run

```text
Upload demo media locally/staging.
Check media fields in API response.
Confirm private media is not exposed if private.
```

## Acceptance criteria

- Media needs are clear.
- Media fields match first-release content.
- Public/private expectations are documented.
- Scope is not overbuilt.


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
