# Framework Token Mapping

## Bootstrap

- Map `primary`, `secondary`, `success`, `warning`, `danger`, `info` to
  Bootstrap theme colors.
- Map `surface`, `border`, `radius`, and `shadow` to card, modal, table, and
  form variables.
- Use Bootstrap semantic classes first, then project utilities.

## Tailwind CSS

- Map colors to CSS variables and theme color names.
- Prefer semantic utilities such as `bg-surface`, `text-muted`,
  `border-border`, and `ring-focus`.
- Keep repeated utility bundles in component contracts.

## MUI

- Map colors to `palette`, spacing to `spacing`, radius to `shape`, and density
  to component default props.
- Configure direction and locale centrally for RTL.

## Ant Design

- Map colors, radius, font, control height, and motion values through theme
  tokens and ConfigProvider.
- Define density and table/form behavior centrally.

## daisyUI

- Map daisyUI theme variables back to project semantic tokens.
- Document allowed theme names and component classes.

## shadcn/ui

- Map CSS variables to project semantic tokens.
- Document copied component ownership and local token overrides.

