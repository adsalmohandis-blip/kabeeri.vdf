# Settings Page Recipe

Use for account, workspace, admin, theme, billing, or integration settings.

## Required Sections

1. Header with page purpose.
2. Section cards grouped by meaning.
3. Visible labels and helper text.
4. Save/Cancel or per-section save actions.
5. Success toast/snackbar.
6. Validation and permission states.

## Acceptance Criteria

- Dangerous settings are visually separated.
- Save actions use icon and loading state.
- Disabled settings explain why.
- Changes show success or error feedback.
- Sections remain readable on mobile.

## Variation Hooks

Vary these from product answers:

- tabs, sidebar nav, accordion, or section stack;
- per-section save vs global sticky save bar;
- compact admin style vs spacious account style;
- warning treatment for high-risk settings.
