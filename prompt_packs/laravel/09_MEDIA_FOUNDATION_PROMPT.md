# 09 — Media Foundation Prompt

## Goal

Add a simple media/file upload foundation.

## Context for the AI coding assistant

This prompt creates a safe first version for uploading and managing files if the product needs it.

## Information the user should provide before running this prompt

- What files will users upload? Images, PDFs, documents, avatars?
- What is the maximum file size?
- Should files be public or private?
- Technical note: Ask ChatGPT for help if you are not sure about public vs private storage.

## Files and areas allowed for this prompt

```text
config/filesystems.php
app/Models/
database/migrations/
app/Http/Controllers/
resources/views/
tests/
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
2. Add a simple media table if needed.
3. Configure local storage first unless the user requests cloud storage.
4. Validate file size and type.
5. Store file metadata safely.
6. Add basic upload and delete behavior if in scope.
7. Do not build advanced image editing or video processing.


## Checks to run

```bash
php artisan storage:link
php artisan migrate
php artisan test
```

## Acceptance criteria

- Files can be uploaded safely.
- Validation exists.
- File metadata is stored.
- Sensitive files are not made public accidentally.


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
