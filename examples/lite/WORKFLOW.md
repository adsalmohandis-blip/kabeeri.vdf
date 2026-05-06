# Lite Example Workflow

## Step 1 — Choose profile

```text
lite
```

## Step 2 — Choose stack

Example options:

```text
astro
nextjs
wordpress
supabase
firebase
```

## Step 3 — Create tasks

```text
T001 - Create public page
T002 - Add booking form
T003 - Add validation and success state
T004 - Review and handoff
```

## Step 4 — Use prompt pack

If using Astro:

```text
prompt_packs/astro/01_PROJECT_CONTEXT_PROMPT.md
prompt_packs/astro/04_LAYOUTS_PAGES_NAVIGATION_PROMPT.md
prompt_packs/astro/08_FORMS_LEADS_PROMPT.md
prompt_packs/astro/11_TESTING_REVIEW_PROMPT.md
prompt_packs/astro/12_RELEASE_HANDOFF_PROMPT.md
```

## Step 5 — Review

Use:

```text
acceptance_checklists/AI_OUTPUT_ACCEPTANCE_CHECKLIST.md
acceptance_checklists/TASK_COMPLETION_ACCEPTANCE_CHECKLIST.md
```

## Step 6 — Commit

```bash
git add .
git commit -m "Add simple booking request MVP"
git push
```
