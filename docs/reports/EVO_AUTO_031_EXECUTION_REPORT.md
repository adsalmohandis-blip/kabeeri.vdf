# EVO_AUTO_031 Execution Report

## Priority

- ID: `evo-auto-031-project-profiles`
- Title: `Project Profile System`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Project profiles shape the depth, speed, and governance footprint of the current project. The repo already routes project profiles and scale-pack recommendations into durable reports, so this priority keeps that routing contract explicit and resumable.

The key idea is routing discipline:

- a project goal resolves to a profile
- the profile influences delivery mode and prompt packs
- the routing result is persisted as a report
- downstream intake work can rely on the chosen profile

## Detailed checklist

1. Keep project profile routing as a distinct runtime surface.
2. Keep the selected profile, delivery mode, and scale pack recommendations visible.
3. Preserve the project profile report as the durable record of routing.
4. Keep intake groups and next actions explicit.
5. Avoid letting profile routing become a chat-only suggestion.

## Preconditions

- `kvdf project profile route` exists.
- `kvdf project profile status` exists.
- `kvdf project profile report` exists.
- `kvdf prompt-pack scale` exists.

## Guardrails

- Do not hide profile recommendations inside unrelated intake commands.
- Do not remove the scale-pack report from the routing chain.
- Do not treat a profile result as disposable chat memory.
- Do not weaken the routing contract just because the report already exists.

## Validation flow

```bash
node bin/kvdf.js project profile route --goal "Build a SaaS product" --json
node bin/kvdf.js project profile status --json
node bin/kvdf.js project profile report --json
node bin/kvdf.js prompt-pack scale --profile enterprise --goal "Build a hospital ERP" --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The project profile router returns a persisted recommendation.
- The profile status and report remain readable.
- The scale-pack router remains aligned with the selected profile.
- Evolution status advances to the next governance slice.

## Summary

`evo-auto-031` is complete because the project profile router, profile report, and scale-pack router already work together and persist the current routing state. The next session can move on to scale-specific packs.
