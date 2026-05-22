# Tailwind UI CLI

## `kvdf tailwind-ui status`

Reports whether the optional Tailwind UI provider is available and whether KVDF Core is clean of hard Tailwind dependencies.

## `kvdf tailwind-ui provider`

Returns a guidance-only provider summary for Tailwind UI or a safe fallback summary when Tailwind is unavailable or not requested.

## `kvdf tailwind-ui snippet`

Returns a guidance-only HTML snippet that demonstrates a Tailwind-friendly surface.

## `kvdf tailwind-ui utility-map`

Returns a compact utility map for layout, spacing, typography, color, state, and responsive guidance.

## `kvdf tailwind-ui verify`

Verifies that:

- `package.json` no longer lists Tailwind as a Core devDependency
- `package-lock.json` no longer lists Tailwind as a Core devDependency
- Core source does not hard-require Tailwind packages

## `kvdf tailwind-ui planner-guidance`

Returns a concise Tailwind guidance summary for planner prompt enrichment, including a utility map and local-only constraints.

## `kvdf tailwind-ui docs-guidance`

Returns Markdown-ready Tailwind guidance sections for the Viber UI/UX docs pipeline.

## `kvdf tailwind-ui html-comment`

Returns the fallback and guidance-only HTML comments that generated surfaces can include when a provider marker is helpful.

## Notes

- No files are written by these commands.
- No external CDN links are used.
- No Tailwind CLI commands are executed.
- No compiled Tailwind CSS is generated.
- The plugin stays optional and removable.
