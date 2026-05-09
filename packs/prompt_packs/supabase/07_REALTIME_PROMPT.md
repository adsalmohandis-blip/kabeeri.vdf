# 07 — Realtime Prompt

## Goal

Add Supabase Realtime foundation if the first release needs live updates.

## Context for the AI coding assistant

This prompt is optional. Use it only when live updates matter for the product.

## Information the user should provide before running this prompt

- What should update live?
- Who should receive updates?
- Is realtime required now or can it wait?
- Technical note: If unsure, ask ChatGPT whether realtime is necessary for your first release.

## Files and areas allowed for this prompt

```text
src/lib/supabase*
app/
components/
hooks/
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated realtime features
Realtime for private data without access review
Service role key in frontend
```

## Tasks

1. Ask what should update live.
2. Confirm whether realtime is needed in the first release or can wait.
3. Add a simple subscription for one confirmed use case.
4. Ensure RLS/access rules are compatible.
5. Add cleanup/unsubscribe behavior in frontend.
6. Do not add realtime everywhere.


## Checks to run

```text
Test live update with two sessions if possible.
Confirm unsubscribe/cleanup.
Confirm unauthorized data is not received.
```

## Acceptance criteria

- Realtime use case is clear.
- Subscription is limited to first-release need.
- Access rules are reviewed.
- Cleanup behavior exists.


## Important scope rule

Do not build features outside this prompt.  
Do not expose service role keys in frontend or mobile code.  
Do not commit real secrets.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Supabase changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
