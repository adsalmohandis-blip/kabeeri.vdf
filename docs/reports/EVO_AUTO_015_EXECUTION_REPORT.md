# EVO_AUTO_015 Execution Report

## Priority

- ID: `evo-auto-015`
- Title: `Fast test layers`
- Source: `technical_debt_review`
- Status: `done`

## Why this priority exists

The repository needs a fast feedback path for everyday development and a slower integration tier for broader contract coverage. This priority keeps the lightweight unit/service layer distinct from the integration layer so developers can validate small changes quickly without collapsing the two tiers into one overloaded suite.

The key idea is separation:

- `tests/service.unit.test.js` is the fast validation layer for local behavior and service contracts
- `tests/cli.integration.test.js` stays the slower end-to-end contract layer
- documentation and evolution status should point developers to the right tier for the right change
- the repo should not force every edit through the slower suite first

## Detailed checklist

1. Confirm the service/unit suite exists as the fast local layer.
2. Confirm the integration suite remains a separate slower tier.
3. Keep the test layering described in repo docs and evolution status.
4. Preserve the fast path for day-to-day validation of service behavior.
5. Avoid collapsing the two tiers into one undifferentiated test surface.

## Preconditions

- `tests/service.unit.test.js` is available as the lightweight service layer.
- `tests/cli.integration.test.js` remains the broader integration layer.
- The evolution queue already records the next priority separately.

## Guardrails

- Do not pretend the integration suite is the fast path.
- Do not remove the slower integration coverage.
- Do not move broad cross-surface assertions into the fast suite when they belong in integration.
- Do not treat broad unrelated integration failures as proof that the fast layer is missing.

## Validation flow

```bash
node tests/service.unit.test.js
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The service suite passes as the quick feedback layer.
- The integration suite remains available as the slower contract layer.
- Evolution status advances past `Fast test layers` to the next planned priority.

## Summary

`evo-auto-015` is complete because the repository already exposes the fast unit/service layer beside the slower integration suite, and the evolution ledger now records that layering clearly. The next session can move on to the next planning slice without reworking the test topology.
