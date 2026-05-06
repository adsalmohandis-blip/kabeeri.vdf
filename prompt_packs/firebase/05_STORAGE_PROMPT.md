# 05 — Firebase Storage Prompt

## Goal

Add Firebase Storage bucket/path planning and rules if the product needs file uploads.

## Context for the AI coding assistant

This prompt is optional. Use it only when the first release needs files, images, documents, or avatars.

## Information the user should provide before running this prompt

- What files will users upload? Avatars, PDFs, images, documents?
- Should files be public or private?
- Who can upload/delete files?
- Technical note: If unsure, ask ChatGPT to help decide Firebase Storage path and rule design.

## Files and areas allowed for this prompt

```text
storage.rules
src/lib/firebase*
app/
components/
README.md
```

## Files and areas forbidden for this prompt

```text
Admin SDK credentials in frontend
Public access for private files
Real production secrets
```

## Tasks

1. Ask what file types the product needs.
2. Decide whether files are public or private.
3. Create a simple path convention only for first-release needs.
4. Add storage rules that match access rules.
5. Validate file type/size in app code where possible.
6. Do not create broad public access unless intended.
7. Do not build advanced media management.


## Checks to run

```text
Upload a test file in local/staging.
Test public/private access.
Test unauthorized access.
Confirm no Admin SDK credentials are exposed.
```

## Acceptance criteria

- Storage paths match first-release needs.
- Public/private access is clear.
- Storage rules are safe.
- No advanced media scope is added.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Firebase Admin credentials in frontend or mobile code.  
Do not commit real secrets.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Firebase changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
