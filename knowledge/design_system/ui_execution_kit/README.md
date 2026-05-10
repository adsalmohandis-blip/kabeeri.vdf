# Kabeeri UI Execution Kit

This kit turns Kabeeri UI/UX strategy into short, reusable execution rules for Codex and other AI coding agents.

The goal is not to make every product look the same. The goal is to make every product start from a governed UI system, then vary creatively through approved product answers, brand tokens, palette presets, density, layout rhythm, and component choices.

## Use

For UI implementation or refactor work:

1. Select one approved UI foundation from `knowledge/design_system/ui_ux_reference/`.
2. Select the closest business pattern from `knowledge/design_system/business_ui_patterns/`.
3. Select the user flow from `knowledge/design_system/ui_flows/`.
4. Select a color palette and token set from `COLOR_SYSTEM.md` or `knowledge/design_system/theme_token_intelligence/`.
5. Select accessibility references from `knowledge/design_system/accessibility_inclusive_ui/`.
6. Select performance references from `knowledge/design_system/performance_web_vitals_ui/`.
7. Select content and microcopy references from `knowledge/design_system/content_microcopy_ux/`.
8. Select RTL/Arabic references from `knowledge/design_system/rtl_arabic_ui/` when Arabic, bilingual, MENA, or RTL surfaces exist.
9. Follow `UI_CONTRACT.md`.
10. Use icons from `ICON_MAP.md`.
11. Use button patterns from `BUTTON_PRESETS.md`.
12. Select a screen composition from `knowledge/design_system/component_composition_intelligence/`, then use page/component recipes from `recipes/`.
13. Select a framework adapter from `knowledge/design_system/framework_adapter_intelligence/`.
14. Select a product-type playbook from `knowledge/design_system/project_ui_playbooks/`.
15. Create a UI decision profile from `knowledge/design_system/ui_decision_intake/`.
16. Select a creative variant from `knowledge/design_system/creative_variant_intelligence/`.
17. Apply motion from `MOTION_MICROINTERACTIONS.md` only when it supports UX meaning.
18. Apply `CREATIVE_VARIATION_RULES.md` so similar apps can still produce distinct, high-quality interfaces.
19. Run or manually apply `UI_REVIEW.md`, `ACCESSIBILITY_REVIEW_CHECKLIST.md`, `PERFORMANCE_REVIEW_CHECKLIST.md`, `CONTENT_REVIEW_CHECKLIST.md`, `knowledge/design_system/framework_adapter_intelligence/ADAPTER_REVIEW_CHECKLIST.md`, `knowledge/design_system/project_ui_playbooks/PLAYBOOK_REVIEW_CHECKLIST.md`, `knowledge/design_system/ui_decision_intake/UI_DECISION_REVIEW_CHECKLIST.md`, `knowledge/design_system/creative_variant_intelligence/VARIANT_REVIEW_CHECKLIST.md`, and `knowledge/design_system/visual_quality_governance/VISUAL_QUALITY_RUBRIC.md` before delivery, plus `RTL_REVIEW_CHECKLIST.md` when Arabic or RTL is enabled.

## Token-Cost Rule

Prompts should reference this kit by filename instead of repeating design instructions.

Example:

```text
Build the Products CRUD page using Kabeeri UI Execution Kit.
Business type: ecommerce.
Use the selected UI foundation, framework adapter, business pattern, CRUD recipe, Icon Map, Accessibility pack, Performance pack, Content Microcopy pack, Motion rules, RTL Arabic UI pack when applicable, and UI Review.
Include search, filters, table actions, loading, empty, and error states.
Use selected creative variant ID instead of inventing a new visual direction from scratch.
```

## Files

- `UI_CONTRACT.md` - short execution contract for UI work.
- `COLOR_SYSTEM.md` - semantic colors, palette presets, contrast and usage rules.
- `CREATIVE_VARIATION_RULES.md` - controlled creativity rules to avoid repetitive output.
- `ICON_MAP.md` - stable action/state/icon mapping.
- `BUTTON_PRESETS.md` - reusable action button patterns.
- `COMPONENT_MAP.md` - when to use cards, alerts, badges, tables, modals, toasts, and empty states.
- `UI_REVIEW.md` - checklist for UI-only review.
- `AGENTS_UI_TEMPLATE.md` - compact instructions a generated project can place in `AGENTS.md`.
- `KVDF_DESIGN_SYSTEM_ASSESSMENT_TEMPLATE.md` - assessment report template for external UI briefs.
- `MOTION_MICROINTERACTIONS.md` - motion levels, tokens, library decisions, reduced-motion rules, and review checklist.
- `../framework_adapter_intelligence/` - adapter plans for Bootstrap, Tailwind CSS, Bulma, Foundation, MUI, Ant Design, daisyUI, and shadcn/ui.
- `../project_ui_playbooks/` - product-type UI defaults for all Kabeeri blueprints.
- `../ui_decision_intake/` - compact questions and answer mapping for variant, palette, density, navigation, surface style, and tone.
- `../creative_variant_intelligence/` - bounded creative directions that vary similar products without breaking governance.
- `recipes/` - reusable page and component recipes.
- `templates/` - starter HTML snippets for common UI surfaces.
- `scripts/check-ui.js` - lightweight static UI checker.
