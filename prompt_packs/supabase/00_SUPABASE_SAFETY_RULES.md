# 00 — Supabase Safety Rules

Use these rules with every Supabase prompt in this pack.

## Main safety rule

Do not expose Supabase service role keys in frontend or mobile apps.

Service role keys must only be used in trusted server-side environments.

## RLS rule

For user-owned or private data, Row Level Security should be enabled and policies should be reviewed carefully.

Do not disable RLS casually.

## Allowed work areas

Depending on the project, AI may work in:

```text
supabase/
supabase/migrations/
supabase/functions/
src/lib/supabase*
app/
components/
lib/
server/
README.md
.env.example
```

## Forbidden by default

Do not commit:

```text
real API keys
service role keys
database passwords
production secrets
private user data
```

## AI coding assistant instruction

Always include this instruction when sending a Supabase prompt:

```text
You are working on a Supabase-backed project.
Never expose service role keys in frontend or mobile code.
Do not disable RLS unless explicitly justified and reviewed.
Do not commit real secrets.
Follow the prompt scope exactly.
Explain what you changed.
List files changed.
List checks to run.
Stop after completing this task.
```

## Beginner note

If you do not understand a Supabase term such as RLS, policy, anon key, service role key, edge function, or storage bucket, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.
