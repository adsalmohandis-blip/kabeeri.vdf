# 07 — Authentication and Users Prompt

## Goal

Add authentication and user foundation if the first release needs login.

## Context for the AI coding assistant

This prompt is optional. Use it only if the project needs users or protected areas.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who logs in: customers, admins, team members, or all?
- Is auth handled by a backend API or inside SvelteKit?
- Preferred auth tool, if any?
- Technical note: If unsure, ask ChatGPT to compare simple auth options for your project.

## Files and areas allowed for this prompt

```text
src/routes/
src/lib/server/
src/lib/auth*
src/hooks.server.*
src/lib/components/
.env.example
package.json if auth package is required
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced billing
Marketplace
Future extension features
```

## Tasks

1. Ask whether login is required in the first release.
2. Identify auth approach: backend API auth, SvelteKit server auth, Supabase, Firebase, Auth0, Clerk, Lucia, custom JWT, or other.
3. Do not choose a paid/external provider without user approval.
4. Add minimal auth setup according to the chosen approach.
5. Add protected route handling if needed.
6. Add simple user/session display if useful.
7. Do not build complex roles yet unless required.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- Auth approach is clear.
- Protected areas are protected if needed.
- No real secrets are committed.
- The solution is not overbuilt.


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
