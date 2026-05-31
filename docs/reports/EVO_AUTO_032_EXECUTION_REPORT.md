# EVO_AUTO_032 Execution Report

## Priority

- ID: `evo-auto-032-scale-packs`
- Title: `Scale-Specific Packs`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Scale-specific packs let KVDF scale beyond a single stack prompt pack for enterprise, regulated, and high-risk work. The repo already produces a live scale-pack report and routes it through the project profile system, so this priority keeps that bundle selection explicit.

The key idea is scale awareness:

- large systems get broader pack bundles
- the selected pack set is persisted in a report
- the project profile and scale-pack router stay aligned
- downstream prompt composition can reuse the chosen bundle

## Detailed checklist

1. Keep the scale-pack report available as a distinct runtime artifact.
2. Keep the selected prompt pack bundle visible for enterprise and large-system work.
3. Preserve the connection between project profile routing and scale-pack routing.
4. Keep the bundle recommendations explicit.
5. Avoid flattening large-system context into a single generic pack.

## Preconditions

- `kvdf prompt-pack scale` exists.
- `kvdf project profile route` and `kvdf project profile report` exist.
- The scale-pack report persists the chosen pack bundle.

## Guardrails

- Do not hide the selected packs inside a generic prompt-pack summary.
- Do not separate the scale-pack router from the project profile report.
- Do not weaken the large-system bundle logic just because the report already exists.

## Validation flow

```bash
node bin/kvdf.js prompt-pack scale --profile enterprise --goal "Build a hospital ERP" --json
node bin/kvdf.js project profile report --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The scale-pack router returns a durable bundle recommendation.
- The project profile report reflects the current scale-pack selection.
- Evolution status advances to the task/prompt/generation planning slice.

## Summary

`evo-auto-032` is complete because the scale-pack router already returns durable bundle recommendations and the project profile report keeps that selection visible. The next session can move on to the task/prompt/generation planning slice.
