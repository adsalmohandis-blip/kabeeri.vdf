# 01 — Project Context Prompt

## Goal

Give AI the correct product and Angular frontend context before coding.

## Context for the AI coding assistant

Use before implementation starts to define product, V1 scope, backend relationship, and what not to build.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should V1 include?
- What backend/API will Angular connect to?

## Files and areas allowed for this prompt

```text
src/
angular.json
package.json
tsconfig.json
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
Real secrets
```

## Tasks

1. Read product summary.
2. Identify V1 frontend scope.
3. Identify backend/API/CMS.
4. Identify whether this is dashboard, public app, or internal system.
5. Separate V1 from future ideas.
6. Do not write code unless asked after summary.

## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- The change is focused and matches first-release scope.
- No unrelated features are added.
- Real secrets are not committed.
- Checks pass or issues are clearly explained.

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
