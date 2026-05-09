# Kabeeri VDF Documentation Site

This is a static local documentation site. It keeps the existing visual style
and renders detailed Arabic and English documentation from
`assets/js/app.js`.

## Open Locally

Open `docs/site/index.html` in a browser.

## Regenerate Pages

```bash
node docs/site/generate-pages.js
```

The generator creates the shell pages for both languages. The detailed content
is rendered in the browser from `assets/js/app.js`.

## Structure

- `index.html`
- `assets/css/style.css`
- `assets/js/app.js`
- `pages/en/*.html`
- `pages/ar/*.html`

## Coverage

The site is organized around `docs/SYSTEM_CAPABILITIES_REFERENCE.md` and covers:

- complete system capabilities
- how AI works inside the Kabeeri environment
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
- live dashboard
- AI cost control
- multi-AI governance
- GitHub and release gates
- six practical build playbooks
- troubleshooting
