# Kabeeri Color System

Color must be semantic, tokenized, and varied by product context. The UI foundation provides implementation classes; Kabeeri provides meaning and constraints.

## Semantic Tokens

Every project should define these tokens before UI implementation:

```json
{
  "background": "#f8fafc",
  "surface": "#ffffff",
  "surface_alt": "#f1f5f9",
  "border": "#e2e8f0",
  "text": "#0f172a",
  "muted": "#64748b",
  "primary": "#2563eb",
  "secondary": "#64748b",
  "accent": "#14b8a6",
  "success": "#16a34a",
  "warning": "#d97706",
  "danger": "#dc2626",
  "info": "#0284c7",
  "focus": "#2563eb"
}
```

Components must reference token names or framework semantic variants. Raw colors belong only in central token/theme files.

## Palette Presets

Use these presets as starting points, then adjust from brand answers.
For executable preset data, use `knowledge/design_system/theme_token_intelligence/PALETTE_PRESET_CATALOG.json`.

| Preset | Best for | Personality |
| --- | --- | --- |
| `saas_calm` | SaaS, portals, dashboards | clear, modern, trustworthy |
| `enterprise_neutral` | ERP, CRM, backoffice | dense, restrained, operational |
| `commerce_energy` | ecommerce, marketplace | active, conversion-focused |
| `clinical_trust` | medical, dental, wellness | clean, calm, credible |
| `finance_precision` | billing, accounting, fintech | stable, precise, high contrast |
| `content_editorial` | blog, news, knowledge sites | readable, editorial, structured |
| `luxury_minimal` | premium brands | quiet, spacious, selective accent |
| `restaurant_warmth` | restaurant, POS, food | warm, human, high action clarity |
| `dark_governance` | governance, AI cost, operations | dark, status-rich, controlled |
| `arabic_corporate` | Arabic-first corporate sites | formal, readable, RTL-aware |

## Usage Rules

- One primary brand color per product surface.
- State colors are reserved: success, warning, danger, info.
- Destructive actions always use `danger`.
- Secondary text always uses `muted`.
- Borders use the border token, not arbitrary grays.
- Background and surface must be visually separated.
- Dark mode requires its own token mapping.
- Arabic/RTL screens must preserve contrast and icon direction.
- Avoid one-note palettes dominated by one hue unless a brand explicitly requires it.

## Contrast

Minimum checks:

- normal text: readable against background and surface;
- muted text: readable, not decorative-only;
- primary button text: high contrast;
- danger/warning badges: status is conveyed by text plus color/icon;
- focus states: visible against both light and dark surfaces.

## Framework Mapping

Bootstrap:

- `primary` -> `.btn-primary`, `.text-primary`
- `danger` -> `.btn-danger`, `.text-danger`
- `surface` -> `.card`, `.bg-body`

Tailwind:

- map tokens to CSS variables or theme colors;
- use semantic utilities such as `bg-surface`, `text-muted`, `border-border` when configured.

MUI/Ant Design:

- map project tokens to theme/config provider tokens;
- define direction, locale, density, and mode centrally.
