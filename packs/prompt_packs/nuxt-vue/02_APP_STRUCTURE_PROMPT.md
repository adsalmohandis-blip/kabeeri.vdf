# 02 — App Structure Prompt

## Goal

Review or prepare a clean Nuxt/Vue project structure.

## Context for the AI coding assistant

This prompt organizes the app structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Nuxt or Vue SPA?
- TypeScript or JavaScript?
- Tailwind, CSS modules, plain CSS, UI library, or not sure?

## Files and areas allowed for this prompt

```text
app/
pages/
layouts/
components/
composables/
stores/
plugins/
server/
assets/
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

1. Check whether a Nuxt/Vue project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for Lite, Standard, or Enterprise profile.
5. Identify whether the app uses Nuxt file-based routing, Vue Router, or another approach.
6. Avoid forcing complex enterprise structure on a Lite project.
7. Do not create product features in this prompt.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- Routing approach is clear.
- No unnecessary architecture was forced.
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
