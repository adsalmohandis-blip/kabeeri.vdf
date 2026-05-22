# Tailwind UI Plugin

`tailwind_ui` is an optional, removable KVDF plugin that provides Tailwind guidance without making KVDF Core depend on Tailwind packages. In this phase it is guidance-only: KVDF Core does not run Tailwind CLI, does not fetch CDN assets, and does not generate compiled Tailwind CSS.

## What It Provides

- `kvdf tailwind-ui status`
- `kvdf tailwind-ui provider`
- `kvdf tailwind-ui snippet`
- `kvdf tailwind-ui utility-map`
- `kvdf tailwind-ui verify`
- `kvdf tailwind-ui planner-guidance`
- `kvdf tailwind-ui docs-guidance`
- `kvdf tailwind-ui html-comment`

## Behavior

- Offline and deterministic
- Guidance-only output, not runtime CSS bundling
- No external CDN usage
- No dependency on `node_modules/tailwindcss`
- No runtime use of `plugins/tailwind_ui/_temp_meta` or external GitHub repositories
- No Tailwind CLI execution and no generated CSS artifacts

## When To Use It

Use this plugin when a UI surface explicitly opts into Tailwind utility guidance, or when you want a reusable utility map for docs, prompts, future generated HTML surfaces, or planner prompt enrichment. The `planner-guidance` and `docs-guidance` commands are the preferred read-only summaries for Viber/UI docs workflows.

## Core Safety

KVDF Core remains valid without this plugin. If the plugin is disabled or removed, Core dashboards and docs continue to render using their existing fallback HTML and CSS.
