# Tailwind UI CLI

## `kvdf tailwind-ui status`

Reports whether the optional Tailwind UI provider is available and whether KVDF Core is clean of hard Tailwind dependencies.

## `kvdf tailwind-ui snippet`

Returns a guidance-only HTML snippet that demonstrates a Tailwind-friendly surface.

## `kvdf tailwind-ui utility-map`

Returns a compact utility map for layout, spacing, typography, color, state, and responsive guidance.

## `kvdf tailwind-ui verify`

Verifies that:

- `package.json` no longer lists Tailwind as a Core devDependency
- `package-lock.json` no longer lists Tailwind as a Core devDependency
- Core source does not hard-require Tailwind packages

## Notes

- No files are written by these commands.
- No external CDN links are used.
- The plugin stays optional and removable.
