# EVO_AUTO_012 Execution Report

## Priority

- ID: `evo-auto-012`
- Title: `Docs source-of-truth checks`
- Source: `technical_debt_review`
- Status: `done`

## Why this priority exists

The CLI can expose commands and capabilities faster than the canonical docs are updated. This priority keeps those docs source-of-truth surfaces honest by checking that the command reference and capability reference stay aligned with the live runtime.

The key idea is documentation drift control:

- missing commands should be detected in canonical docs
- canonical docs should pass when they cover the live CLI surface
- historical source archives should remain distinct from authoritative docs
- source-of-truth checks should be part of the normal validation loop

## Detailed checklist

1. Confirm `kvdf validate docs-source-truth` checks the command reference and capability reference.
2. Confirm missing canonical doc coverage is reported clearly.
3. Confirm the canonical repository docs pass the source-of-truth check.
4. Keep historical source clarity checks available for archived roadmap and report files.
5. Preserve the source-of-truth check as a reusable validation step for future commands and docs.

## Preconditions

- The command reference and capability reference exist.
- The docs-source-truth validator is available.
- Historical source clarity checks are already part of the validation workflow.

## Guardrails

- Do not let new CLI commands or capabilities bypass the canonical docs check.
- Do not confuse historical source clarity with canonical docs ownership.
- Do not remove the validation output that shows what was checked.
- Do not treat a docs-source failure as a mere warning.

## Validation flow

```bash
node bin/kvdf.js validate docs-source-truth
node bin/kvdf.js validate docs-source-truth --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The command reference is checked against the live CLI surface.
- The capability reference is checked against the live capability surface.
- Missing canonical coverage is reported clearly.
- The docs source-of-truth check stays available for future review cycles.

## Summary

`evo-auto-012` is complete because the validator already checks the canonical docs surfaces and reports the result clearly. The repo now has a visible source-of-truth guard for docs coverage, and the next session can move on to the next planning slice.

