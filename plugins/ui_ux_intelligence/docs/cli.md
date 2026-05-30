# UI UX Intelligence CLI

## Commands

```bash
kvdf ui-ux-intelligence status --json
kvdf ui-ux-intelligence source-status --json
kvdf ui-ux-intelligence catalog --json
kvdf ui-ux-intelligence search --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence search --query "clinic booking app" --domain products --json
kvdf ui-ux-intelligence recommend --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence design-system --idea "Build ecommerce app" --json
kvdf ui-ux-intelligence checklist --idea "Build dashboard app" --json
kvdf ui-ux-intelligence docs --idea "Build booking app" --track vibe --app booking --json
kvdf ui-ux-intelligence audit --target docs/ui-ux/UI_UX_DESIGN.md --json
kvdf ui-ux-intelligence audit --target docs/ui-ux/UI_UX_DESIGN.md --strict --json
kvdf ui-ux-intelligence scorecard --idea "Build booking app" --json
kvdf ui-ux-intelligence gate --app booking --stage ui_ux_design --json
kvdf ui-ux-intelligence readiness --app booking --stage handoff --json
kvdf ui-ux-intelligence handoff-pack --idea "Build booking app" --app booking --json
kvdf ui-ux-intelligence handoff-pack --idea "Build booking app" --app booking --output docs/reports/uiux-handoff.md
kvdf ui-ux-intelligence tokens --idea "Build booking app" --json
kvdf ui-ux-intelligence components --idea "Build booking app" --json
kvdf ui-ux-intelligence screens --idea "Build booking app" --json
kvdf ui-ux-intelligence patterns --idea "Build booking app" --json
kvdf ui-ux-intelligence implementation-guidance --idea "Build booking app" --stack react --json
kvdf ui-ux-intelligence prompt-pack --idea "Build booking app" --stack react --executor codex --json
kvdf ui-ux-intelligence prompt-pack --idea "Build booking app" --stack react --executor codex --output docs/reports/uiux-prompt-pack.md
kvdf ui-ux-intelligence knowledge-pack --json
kvdf ui-ux-intelligence catalog-health --json
kvdf ui-ux-intelligence governance-registry --json
kvdf ui-ux-intelligence upgrade-plan --json
kvdf ui-ux-intelligence governance --json
kvdf plugins install ui_ux_intelligence
kvdf plugins uninstall ui_ux_intelligence
```

## Notes

- `status` reports the plugin as an available optional bundle.
- `source-status` inspects the installed `data/` + `data/stacks/` catalog.
- `catalog` reports whether the approved data is ready for search and recommendation.
- `recommend` is deterministic and uses only the local catalog and search scoring to derive product, style, palette, typography, layout, UX, chart, icon, and stack guidance.
- `design-system` turns the recommendation into a structured design foundation for Viber planning.
- `checklist` returns UI/UX readiness checks grouped by accessibility, responsive, interaction, content, layout, forms, dashboard, performance, motion, and handoff.
- `docs` returns Markdown-ready sections for the Viber UI/UX docs pipeline and never writes files.
- `audit` inspects a target UI/UX file or inline text, returns warnings or blockers, and never writes files.
- `scorecard` combines the recommendation, checklist, audit, and docs completeness into a governed UI/UX readiness score.
- `gate` evaluates UI/UX readiness against a stage gate such as design, validation, handoff, or publish readiness.
- `readiness` reads the Viber app docs workspace and summarizes UI/UX readiness for handoff or publish planning.
- `handoff-pack` assembles the recommendation, design system, tokens, components, screens, checklist, and scorecard into a Markdown-ready handoff bundle. It does not write files unless `--output <path>` is passed, and then it only writes Markdown to an allowed docs or workspace path.
- `tokens`, `components`, and `screens` generate implementation-planning artifacts that remain framework-neutral and do not create production code.
- `patterns` turns the UI/UX plan into reusable UI pattern guidance.
- `implementation-guidance` adds framework-aware, task-punch-friendly implementation direction without generating source code.
- `prompt-pack` creates Codex-ready UI implementation prompts that stay task-slice oriented and do not auto-run anything. It is guidance only, not autonomous execution.
- `evidence` accepts path-or-URL metadata for screenshots, docs, test reports, and manual notes. It does not run OCR or inspect pixels.
- `visual-qa` turns the current UI/UX plan into a metadata-only QA contract for required screens, states, breakpoints, and accessibility evidence.
- `acceptance-gate` evaluates docs, scorecard, evidence, and visual QA for handoff and publish readiness. Strict mode raises missing critical evidence to blockers.
- `regression` builds a lightweight regression checklist for the key screens, components, states, responsive breakpoints, accessibility, and handoff checks.
- Planner integration is optional: `kvdf planner docs plan|materialize --include-ui-ux-intelligence` can consume the docs sections, `kvdf planner review|visual|prompt` can surface optional summaries, and `kvdf dashboard viber state --json` can expose a safe availability summary. Use `--no-ui-ux-intelligence` when you want to suppress the provider even if it is installed.
- `search`, `recommend`, `design-system`, `checklist`, `docs`, `audit`, `scorecard`, `gate`, `readiness`, `handoff-pack`, `tokens`, `components`, `screens`, `patterns`, `implementation-guidance`, `prompt-pack`, `evidence`, `visual-qa`, `acceptance-gate`, and `regression` all work offline in the MVP.
- `search` uses the local catalog only and can filter by `--domain products|styles|colors|typography|ui_reasoning|ux_guidelines|charts|landing|icons|app_interface|react_performance|stacks|all`.
- The runtime does not depend on any staging cache and reads only the live catalog.
- `audit --strict` escalates critical missing UI/UX sections to blockers for handoff review.
- `evidence`, `visual-qa`, `acceptance-gate`, and `regression` are report commands only; they never generate production code and only write Markdown when `--output` explicitly targets an allowed docs or workspace path.
- `knowledge-pack` reports the installed manifest-driven UI/UX knowledge pack version, loaded domains, and reproducibility state.
- `catalog-health` validates that the required local data files exist and that the catalog is usable before Planner or Viber consumes the plugin.
- `governance-registry` lists the plugin capabilities, command surfaces, runtime modules, docs, and schemas.
- `upgrade-plan` recommends a safe next knowledge-pack version without changing any files.
- `governance` combines the knowledge pack, catalog health, governance registry, and upgrade plan into one read-only summary.
- `handoff-pack --output` and `prompt-pack --output` are the only commands in this plugin that can write a file, and they only write Markdown when the operator explicitly requests it.
