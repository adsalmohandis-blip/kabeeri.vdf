# Kabeeri VDF Documentation Site

This is a static local documentation site for developers and app builders only.
It keeps the existing visual style and renders detailed Arabic and English
documentation from `assets/js/app.js`.
Arabic is the default entry language for the site, while English pages remain
available as a secondary view.

## Open Locally

Open `docs/site/index.html` in a browser.

## Regenerate Pages

```bash
node docs/site/generate-pages.js
```

The generator creates the shell pages for both languages. The detailed content
is rendered in the browser from `assets/js/app.js`.
The generated docs workflow is governed by the same source-of-truth loop as the
rest of Kabeeri: update the human guidance first, regenerate the site shell,
then validate the generated pages, page contracts, and localized content
together. Treat `docs/site/generate-pages.js`, `docs/site/site-manifest.json`,
and `docs/site/page-contracts.json` as the generated artifacts that reflect the
current docs surface rather than the place to invent new guidance by hand.
The same docs-site build also emits a deep publishing coverage report in
`docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json` so the published
families stay visible from CLI and validation. The generator also writes a
template catalog in `docs/site/page-templates.json`, a site manifest in
`docs/site/site-manifest.json`, page contracts in
`docs/site/page-contracts.json`, and a docs-generation workflow report in
`docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json`.
Use `kvdf docs workflow` when you want the workflow report itself without
opening the browser.
Use `kvdf docs validate --json` to confirm the site, generated pages, and
localized guidance still match the current command surface before publishing.
`kvdf docs sync` writes a docs site sync report to
`docs/reports/DOCS_SITE_SYNC_REPORT.json` after rebuilding and validating the
site.

## Structure

- `index.html`
- `page-templates.json`
- `site-manifest.json`
- `page-contracts.json`
- `assets/css/style.css`
- `assets/js/app.js`
- `pages/en/*.html`
- `pages/ar/*.html`

## Coverage

The site is organized around developer-facing capability docs and covers:

- complete system capabilities
- how AI works inside the Kabeeri environment
- developer onboarding
- repository foldering
- new application roadmap
- continuing existing Kabeeri projects
- adopting existing non-Kabeeri applications
- Agile and Structured delivery
- questionnaire engine
- product blueprints
- data design
- UI/UX advisor
- Vibe-first workflow
- task governance
- app boundary governance
- workstreams and execution scope
- prompt packs
- WordPress development and WordPress plugin development
- AI Tool and Vibe developer workflow instructions and role hubs for app delivery
- system-development docs are now published separately under `plugins/kvdf-dev/docs/site/`
- live dashboard
- AI cost control
- multi-AI governance
- GitHub and release gates
- AI run provenance and docs validation
- docs site generation and page contracts
- eight practical build playbooks
- troubleshooting

Framework-internal governance content is intentionally excluded from this site.
