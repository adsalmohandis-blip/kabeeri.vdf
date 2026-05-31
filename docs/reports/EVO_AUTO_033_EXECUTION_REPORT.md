# EVO_AUTO_033 Execution Report

## Priority

- ID: `evo-auto-033-doc-generation`
- Title: `Documentation Generation Flow`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Docs generation is treated as a workflow with templates, manifests, and page contracts rather than as loose files. The repo already generates the site workflow artifacts, so this priority keeps that regeneration contract explicit.

The key idea is workflow discipline:

- templates are loaded first
- the manifest and page contracts are derived from the same source
- validation keeps the generated artifacts aligned
- the workflow report records the path for later sessions

## Detailed checklist

1. Keep the docs generation workflow as a distinct runtime surface.
2. Preserve the template catalog, site manifest, page contracts, and coverage report.
3. Keep the generated artifacts aligned after each regeneration.
4. Keep the workflow report resumable.
5. Avoid treating docs generation as a loose file export.

## Preconditions

- `kvdf docs generate` exists.
- `kvdf docs workflow` exists.
- The site manifest, page contracts, and coverage report are generated from the current site source.

## Guardrails

- Do not hide the generator steps inside a generic docs summary.
- Do not remove validation from the generation flow.
- Do not let the workflow drift away from the generated artifacts.
- Do not weaken the report just because generation is already available.

## Validation flow

```bash
node bin/kvdf.js docs generate --json
node bin/kvdf.js docs workflow --json
node bin/kvdf.js docs validate --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The docs generation command refreshes templates, pages, manifest, and contracts.
- The workflow report remains resumable and aligned.
- Evolution status advances to the developer onboarding slice.

## Summary

`evo-auto-033` is complete because the docs generation workflow is active, the artifacts are regenerated from the current site source, and the workflow report remains aligned. The next session can move on to developer onboarding.
