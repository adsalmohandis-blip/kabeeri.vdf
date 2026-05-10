# Project UI Rules

For UI work, follow Kabeeri UI Execution Kit.

## Approved Stack

Use only the approved UI stack selected for this project. Do not add another UI library unless explicitly requested.

## Required References

- UI contract: `docs/ui/UI_CONTRACT.md`
- Color system: `docs/ui/COLOR_SYSTEM.md`
- Creative variation: `docs/ui/CREATIVE_VARIATION_RULES.md`
- Business patterns: `docs/ui/business_ui_patterns/BUSINESS_UI_PATTERN_CATALOG.json`
- User flows: `docs/ui/ui_flows/`
- Accessibility pack: `docs/ui/accessibility_inclusive_ui/`
- Performance pack: `docs/ui/performance_web_vitals_ui/`
- Content Microcopy pack: `docs/ui/content_microcopy_ux/`
- Icon map: `docs/ui/ICON_MAP.md`
- Button presets: `docs/ui/BUTTON_PRESETS.md`
- Motion and microinteractions: `docs/ui/MOTION_MICROINTERACTIONS.md`
- RTL Arabic UI pack: `docs/ui/rtl_arabic_ui/`
- UI review: `docs/ui/UI_REVIEW.md`

## Rules

- Do not design from scratch when approved recipes/components exist.
- Do not use raw colors inside components.
- Every action button must include an icon unless the selected system intentionally omits icons.
- Include loading, empty, error, success, and disabled states for data screens.
- Choose the closest business pattern and user flow before composing screens.
- Apply accessibility rules for semantic HTML, keyboard, focus, forms, tables, dialogs, contrast, and readable content.
- Apply performance rules for LCP, INP, CLS, image/media dimensions, font loading, JavaScript weight, data rendering, skeletons, and loading states.
- Apply content rules for action labels, empty/error states, validation, onboarding, confirmations, status labels, and business tone.
- Apply the RTL Arabic UI pack when Arabic, bilingual, MENA, or RTL surfaces exist.
- Use motion only for feedback, guidance, continuity, or perceived performance.
- Respect `prefers-reduced-motion` when adding animation.
- Keep creativity inside approved tokens, layout variants, density, tone, and product-specific answers.
- Run the UI review/checker before finishing UI work.
