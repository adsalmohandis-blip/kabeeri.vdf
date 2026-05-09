# 10 — Media and Static Files Prompt

## Goal

Add a simple media and static files foundation.

## Context for the AI coding assistant

This prompt is used when the product needs uploads, images, documents, or static assets.

## Information the user should provide before running this prompt

- Does the product need file uploads?
- What file types? Images, PDFs, documents?
- Should files be public or private?
- Technical note: Ask ChatGPT for help if you are not sure about public vs private media files.

## Files and areas allowed for this prompt

```text
settings.py
config/settings/
urls.py
templates/
static/
media/
apps/
```

## Files and areas forbidden for this prompt

```text
Advanced DAM
Video processing
Unrelated modules
Cloud provider lock-in unless requested
```

## Tasks

1. Ask what file types the product needs.
2. Configure static files for development.
3. Configure media files for development if uploads are needed.
4. Add upload fields only where required by current models.
5. Validate file size/type where useful.
6. Keep cloud storage out of scope unless requested.
7. Do not build advanced file management.


## Checks to run

```bash
python manage.py check
python manage.py test
Run local server and verify static/media behavior manually.
```

## Acceptance criteria

- Static files are configured for local development.
- Media uploads are configured only if needed.
- Upload behavior is safe and simple.
- No advanced media system is added.


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
