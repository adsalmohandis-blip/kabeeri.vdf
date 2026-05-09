# 02 — App Structure Prompt

## Goal

Review or prepare a clean Next.js project structure.

## Context for the AI coding assistant

This prompt organizes the app structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- App Router or Pages Router?
- TypeScript or JavaScript?
- Tailwind, CSS Modules, plain CSS, or another styling approach?

## Files and areas allowed for this prompt

```text
app/
pages/
components/
lib/
hooks/
styles/
public/
package.json
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

1. Check whether a Next.js project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that Next.js setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for the selected profile: Lite, Standard, or Enterprise.
5. Prefer App Router if the project already uses it, but do not migrate unless asked.
6. Avoid forcing complex enterprise structure on a Lite project.
7. Do not create product features in this prompt.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- No unnecessary architecture was forced.
- The user understands where components, utilities, and routes should go.
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
