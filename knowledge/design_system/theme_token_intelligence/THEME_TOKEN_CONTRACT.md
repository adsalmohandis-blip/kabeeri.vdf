# Theme Token Contract

Every generated UI should use semantic tokens instead of one-off colors or
arbitrary design values.

## Required Token Groups

- `colors`: background, surface, surface_alt, foreground, text, muted, primary,
  secondary, accent, success, warning, danger, info, border, focus.
- `typography`: family, base size, body/small/heading scale.
- `spacing`: xs, sm, md, lg, xl.
- `radius`: sm, md, lg.
- `shadow`: sm, md.
- `density`: comfortable, balanced, compact.
- `motion`: level, duration, easing, distance, scale, reduced motion.
- `breakpoints`: mobile, tablet, desktop.

## Rules

- Raw colors belong only in token/theme files.
- Components reference semantic token names or framework semantic variants.
- State colors are reserved for state meaning.
- A generated product must select a palette preset and a creative profile.
- Dark mode, RTL, and Arabic typography must be token-driven when enabled.
- Similar products may share token structure, but should vary palette preset,
  density, surface style, accent strategy, and tone from product answers.

