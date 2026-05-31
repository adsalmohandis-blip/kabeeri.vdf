# EVO_AUTO_039 Execution Report

## Priority

- ID: `evo-auto-039-blocked-scenarios`
- Title: `Blocked Scenario Reporting`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Blocked scenario reporting makes invalid or blocked states explicit so the developer can see what cannot proceed and why. The repo already emits a blocked-scenarios report, and this priority keeps that report durable and readable instead of burying it in a generic status output.

The key idea is clear blockage:

- blockers stay visible as blockers
- warnings stay visible as warnings
- the report can explain why work cannot proceed
- the next session can pick up the same blocked state without guesswork

## Detailed checklist

1. Keep the blocked-scenarios report available as a structured report.
2. Keep the blocker and warning counts explicit.
3. Keep the readiness, governance, security, and dashboard signals visible.
4. Preserve the blocked state instead of pretending the workspace is clear.
5. Avoid collapsing blocked-scenario information into a generic readiness summary.

## Preconditions

- `kvdf reports blocked --json` exists.
- `.kabeeri/reports/blocked_scenarios_report.json` exists.
- The blocked scenarios report is mapped in the runtime schema registry.

## Guardrails

- Do not hide the blocker count.
- Do not remove readiness or governance references from the blocked report.
- Do not treat a blocked workspace as ready just because the report is readable.

## Validation flow

```bash
node bin/kvdf.js reports blocked --json
node bin/kvdf.js readiness report --json
node bin/kvdf.js governance report --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The blocked-scenarios report stays available and reloadable.
- The readiness and governance relationships remain visible.
- The next session can resume from the blocked state without reconstructing it.

## Summary

`evo-auto-039` is complete because the blocked-scenarios report already exists, explains the blocked state clearly, and now has a runtime schema mapping. The next session can move on to the searchable reference surface with the same reporting contract.
