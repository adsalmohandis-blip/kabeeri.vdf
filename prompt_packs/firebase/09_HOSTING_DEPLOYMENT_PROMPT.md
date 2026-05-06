# 09 — Hosting and Deployment Prompt

## Goal

Plan Firebase Hosting or deployment workflow if the first release needs it.

## Context for the AI coding assistant

This prompt is optional. Use it only if the project uses Firebase Hosting or a Firebase deployment workflow.

## Information the user should provide before running this prompt

- Is Firebase Hosting needed?
- What app will be hosted? Static site, SPA, Next.js build, docs, or other?
- Is this local demo, staging, or production?

## Files and areas allowed for this prompt

```text
firebase.json
.firebaserc
README.md
hosting config
build output notes
```

## Files and areas forbidden for this prompt

```text
Production secrets
Billing changes
Unrelated deployment providers
```

## Tasks

1. Ask whether Firebase Hosting is needed.
2. Identify the frontend/build output.
3. Add hosting configuration only if selected.
4. Document deployment commands without running production deployment unless explicitly asked.
5. Add staging/production notes if relevant.
6. Do not change billing or Google Cloud settings.


## Checks to run

```text
Review firebase.json.
Run local build.
Use preview/staging deployment only if configured and approved.
```

## Acceptance criteria

- Hosting need is clear.
- Deployment workflow is documented.
- Production deployment is not done accidentally.
- No secrets are committed.


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
