# 02 — Project Structure Prompt

## Goal

Review or prepare a clean Django project and app structure.

## Context for the AI coding assistant

This prompt organizes the Django codebase structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Is this a full-stack Django app or API backend?
- Do you prefer one app first or multiple apps?
- Are templates needed?

## Files and areas allowed for this prompt

```text
manage.py
config/
project/
apps/
requirements.txt
pyproject.toml
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Advanced product features
```

## Tasks

1. Check whether a Django project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that Django setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for the selected profile: Lite, Standard, or Enterprise.
5. Avoid forcing complex enterprise structure on a Lite project.
6. If apps exist, explain what each app is responsible for.
7. Do not create product features in this prompt.


## Checks to run

```bash
python manage.py check
python manage.py test
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- No unnecessary architecture was forced.
- The user understands where apps, templates, static files, and tests should go.
- No product features were added.


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
