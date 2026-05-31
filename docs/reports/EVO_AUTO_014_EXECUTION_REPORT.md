# EVO_AUTO_014 Execution Report

## Priority

- ID: `evo-auto-014`
- Title: `Dashboard separation`
- Source: `technical_debt_review`
- Status: `done`

## Why this priority exists

The owner and viber dashboards are separate products, not role filters inside one page. This priority keeps the generation and state builders separated from the CLI core and makes the JSON contract boundaries explicit so each track renders its own dashboard cleanly.

The key idea is separation:

- owner and viber dashboards have distinct report types
- the CLI can export each dashboard product separately
- the current-track dashboard remains track-scoped
- the JSON contract stays readable and testable

## Detailed checklist

1. Confirm owner and viber dashboard state reports are distinct.
2. Confirm dashboard export can write separated dashboard products.
3. Confirm the CLI keeps the track-scoped dashboard behavior explicit.
4. Keep JSON contract tests aligned with the separated dashboard products.
5. Preserve the dashboard product split in docs and generated reports.

## Preconditions

- The dashboard builders already produce separate owner and viber states.
- The dashboard CLI supports owner and viber surfaces.
- The docs already describe the dashboard split.

## Guardrails

- Do not merge owner and viber dashboards into one filtered product.
- Do not let CLI core pretend dashboard state is track-neutral.
- Do not lose the separate JSON report types.
- Do not weaken the track-scoped dashboard contract in tests.

## Validation flow

```bash
node bin/kvdf.js dashboard owner state --json
node bin/kvdf.js dashboard viber state --json
node bin/kvdf.js dashboard export --output .kabeeri/reports/holder-dashboard.html
node bin/kvdf.js conflict scan
```

## Expected outputs

- Owner dashboard state returns `kvdf_owner_dashboard_state`.
- Viber dashboard state returns `kvdf_viber_dashboard_state`.
- Dashboard export writes separated dashboard outputs.
- The split remains visible in the CLI and docs.

## Summary

`evo-auto-014` is complete because the dashboard layer already exposes separate owner and viber products with distinct report types and export paths. The separation is now recorded as a closed evolution item, and the next session can move on to the next planning slice.

