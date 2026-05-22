# UI Dashboard Kits

`ui_dashboard_kits` is an optional removable plugin that owns UI dashboard
example surfaces, starter templates, lightweight static checking, and small UI
snippets for KVDF-oriented dashboard and docs work.

It is guidance and validation support only. KVDF Core no longer needs the
active UI/dashboard kit logic to run normal commands.

## What It Provides

- Dashboard and UI examples for common patterns.
- HTML starter templates for Bootstrap- and utility-style surfaces.
- Tiny snippets that encode the UI check contract.
- A lightweight `ui:check` replacement that keeps the old workflow working.
- Safe metadata-only status and catalog views for discovery.

## Relationship To Other UI Plugins

- `bootstrap_ui` provides optional local Bootstrap asset files.
- `tailwind_ui` provides optional Tailwind guidance and provider summaries.
- `ui_ux_intelligence` provides product-aware recommendations, docs, prompts,
  checks, and planning guidance.
- `ui_dashboard_kits` focuses on reusable dashboard examples, templates, and
  validation rules.

## Safety Rules

- No Bootstrap or Tailwind package dependency is required in KVDF Core.
- No CDN links are introduced by this plugin.
- No source code is generated.
- The legacy Core script path now delegates to the plugin checker.

## Files

- `runtime/check_ui.js` - static UI checker logic.
- `runtime/index.js` - plugin status and metadata reports.
- `examples/` - dashboard and UI example docs.
- `templates/` - starter HTML snippets.
- `snippets/` - short reusable guidance snippets.
