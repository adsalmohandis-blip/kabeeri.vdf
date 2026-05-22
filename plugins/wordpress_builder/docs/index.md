# WordPress Builder

`wordpress_builder` is an optional, removable KVDF plugin that owns WordPress-specific planning and governance surfaces.

It keeps WordPress-specific site planning out of KVDF Core while preserving a thin compatibility wrapper for the legacy `kvdf wordpress ...` command.

## What It Covers

- Site planning
- Theme planning
- Plugin planning
- WooCommerce planning
- Security cleanup planning
- CMS roles and content modeling hints
- Viber documentation targets and safety gates

## Safety Rules

- Planning only in this phase
- No remote access
- No FTP, SFTP, or cPanel automation
- No file deletion or deployment
- No WordPress core edits
- No production modification without owner approval

## Relationship To Core

- KVDF Core keeps the planner, task lifecycle, plugin loader, and governance contracts
- WordPress-specific planning now lives in the optional plugin
- The legacy `kvdf wordpress ...` command remains a compatibility wrapper

## Related Surfaces

- `bootstrap_ui` for optional Bootstrap asset snippets
- `tailwind_ui` for optional Tailwind guidance
- `ui_dashboard_kits` for dashboard examples, templates, snippets, and checks
- `ui_ux_intelligence` for higher-level design, readiness, and handoff guidance
