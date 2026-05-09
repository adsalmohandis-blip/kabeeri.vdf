# 10 — i18n and Localization Prompt

## Goal

Plan Strapi internationalization/localization if the product needs multiple languages.

## Context for the AI coding assistant

This prompt is optional. Use it only when multilingual content is needed.

## Information the user should provide before running this prompt

- What languages are needed?
- Is multilingual content required in V1?
- Which content types need translation?
- Should Arabic/RTL be considered in the frontend?

## Files and areas allowed for this prompt

```text
src/api/
config/
README.md
i18n-notes.md
```

## Files and areas forbidden for this prompt

```text
Unrelated content model changes
Overly complex localization strategy
```

## Tasks

1. Ask which languages are needed.
2. Decide whether localization is needed in the first release.
3. Identify which content types require localization.
4. Plan fallback behavior.
5. Add localization notes or configuration only if required.
6. Do not localize everything automatically.


## Checks to run

```text
Run Strapi locally if available.
Create test localized content if configured.
Check API response for locale behavior.
```

## Acceptance criteria

- Localization need is clear.
- Only required content types are localized.
- Fallback behavior is documented.
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
