# 00 — Strapi Safety Rules

Use these rules with every Strapi prompt in this pack.

## Main safety rule

Do not expose admin credentials, API tokens, database credentials, or private environment variables in frontend/mobile code or public repositories.

## Permissions rule

Do not make content public by default.

Only expose public read access when the content is intentionally public.

## Allowed work areas

Depending on the project, AI may work in:

```text
src/api/
src/components/
src/extensions/
src/admin/
config/
database/
public/
.env.example
README.md
```

## Forbidden by default

Do not commit:

```text
real admin credentials
API tokens
database passwords
JWT secrets
app keys
private user data
production exports with private data
```

## AI coding assistant instruction

Always include this instruction when sending a Strapi prompt:

```text
You are working on a Strapi-backed project.
Do not expose admin credentials, API tokens, or private environment variables.
Do not make content public unless explicitly requested.
Follow the prompt scope exactly.
Do not add unrelated features.
Explain what you changed.
List files changed.
List checks to run.
Stop after completing this task.
```

## Beginner note

If you do not understand a Strapi term such as content type, component, dynamic zone, relation, role, permission, API token, lifecycle hook, or webhook, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.
