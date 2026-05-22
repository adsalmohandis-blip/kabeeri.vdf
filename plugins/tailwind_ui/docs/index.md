# Tailwind UI Plugin

`tailwind_ui` is an optional, removable KVDF plugin that provides Tailwind guidance without making KVDF Core depend on Tailwind packages.

## What It Provides

- `kvdf tailwind-ui status`
- `kvdf tailwind-ui snippet`
- `kvdf tailwind-ui utility-map`
- `kvdf tailwind-ui verify`

## Behavior

- Offline and deterministic
- Guidance-only output, not runtime CSS bundling
- No external CDN usage
- No dependency on `node_modules/tailwindcss`
- No runtime use of `plugins/tailwind_ui/_temp_meta` or external GitHub repositories

## When To Use It

Use this plugin when a UI surface explicitly opts into Tailwind utility guidance, or when you want a reusable utility map for docs, prompts, or future generated HTML surfaces.

## Core Safety

KVDF Core remains valid without this plugin. If the plugin is disabled or removed, Core dashboards and docs continue to render using their existing fallback HTML and CSS.
