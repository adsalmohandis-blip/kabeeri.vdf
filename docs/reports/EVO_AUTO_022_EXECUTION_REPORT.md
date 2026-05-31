# EVO_AUTO_022 Execution Report

## Priority

- ID: `evo-auto-022-pack-router`
- Title: `Pack Router and Project Profile System`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Before broad generation or implementation starts, the repo needs a durable decision about project profile and the smallest correct pack set. That keeps large-system prompts, intake groups, and profile guidance aligned with the actual project size instead of defaulting to a generic bundle.

The key idea is routing the project to the smallest correct pack set:

- project profile can be routed from a goal or codebase signal
- the selected profile is durable and resumable
- scale-specific pack recommendations are explicit
- the router and the profile system agree on the same output

## Detailed checklist

1. Confirm project profile routing returns a durable profile record.
2. Confirm scale-specific pack routing returns an explicit large-system pack recommendation.
3. Keep project profile status and report commands aligned with the router.
4. Keep the pack router and project profile system using the same source of truth.
5. Preserve the recommended next actions for composing prompts or reports.

## Preconditions

- `kvdf project profile route` works.
- `kvdf project profile status` and `kvdf project profile report` work.
- `kvdf prompt-pack scale` returns a recommended large-system bundle set.

## Guardrails

- Do not choose a pack set without a project profile signal.
- Do not make the selection ambiguous once a durable profile exists.
- Do not collapse the scale router into a generic prompt-pack list.
- Do not let broad generation start before profile and pack routing are explicit.

## Validation flow

```bash
node bin/kvdf.js project profile route --goal "Build a SaaS product" --json
node bin/kvdf.js prompt-pack scale --profile enterprise --goal "Build a hospital ERP" --json
node bin/kvdf.js conflict scan
```

## Expected outputs

- The project profile router returns a durable recommendation record.
- The scale pack router returns the expected large-system pack set.
- Evolution status advances to the next planned capability slice.

## Summary

`evo-auto-022` is complete because the project profile system and the pack router are already live and return the correct profile and pack recommendations. The repo can now use that routing layer before broad generation or implementation starts.
