# 11 — Shopify Testing and Review Prompt

## Goal

Review the current Shopify implementation and improve basic quality and safety checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new product features.

## Information the user should provide before running this prompt

- Which Shopify features have been implemented so far?
- Are there known bugs?
- Which pages or flows need manual testing?

## Files and areas allowed for this prompt

```text
theme files
app files
tests/
README.md
review notes
```

## Files and areas forbidden for this prompt

```text
New product features
Production deployment without approval
Secrets
```

## Tasks

1. Review changed theme/app files.
2. Check that no secrets are committed.
3. Check theme preview or app local run.
4. Test mobile and desktop where relevant.
5. Test empty/error states.
6. Review API scopes and webhook verification if app work exists.
7. Document manual testing steps.
8. Do not add new features.


## Checks to run

```text
Preview theme or run app locally.
Check console/logs.
Test affected pages/flows.
Confirm no secrets are committed.
```

## Acceptance criteria

- Current Shopify changes have basic checks.
- Theme/app safety is reviewed.
- No new product scope is added.
- Review notes are clear.


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
