# UI/UX Advisor Runtime

The UI/UX Advisor helps Kabeeri and AI coding tools choose the right frontend
design direction for the requested product instead of inventing UI from scratch.

It extends the existing Design Governance layer:

- Product Blueprints identify the product type.
- UI/UX Advisor maps that type to experience patterns, component groups,
  page templates, stack suggestions, SEO/GEO rules, dashboard rules, or mobile
  rules.
- Design Governance still requires approved text specs, page specs, component
  contracts, visual reviews, and Owner/client approval.

## Commands

```bash
kvdf design recommend ecommerce --json
kvdf design recommend news_website --json
kvdf design recommend erp --json
kvdf design ui-checklist
kvdf design ui-review "news article page with semantic HTML structured data responsive accessibility loading empty error"
kvdf design ui-history
kvdf design framework-adapters
kvdf design framework-plan bootstrap --blueprint erp --composition crud_table_workspace --json
kvdf design ui-questions ecommerce --json
kvdf design ui-decisions ecommerce --page checkout --json
kvdf design playbooks
kvdf design playbook erp --json
kvdf design variant-archetypes
kvdf design variants ecommerce --page checkout --count 3 --json
kvdf validate ui-design
```

## Runtime State

Recommendations and UI reviews are stored in:

```text
.kabeeri/design_sources/ui_advisor.json
```

## What It Returns

For a blueprint such as `news_website`, the advisor returns:

- `experience_pattern`: for example `seo_content_site`
- recommended stacks: for example Astro, Next.js, Tailwind, shadcn/ui
- design foundations: brand, tokens, typography, color, spacing, layout, accessibility
- component groups: core, content, commerce, dashboard, mobile
- components: article cards, author boxes, FAQ, tables, cards, modals, drawers, etc.
- page templates: home, listing, detail, search, FAQ, account, checkout, dashboard
- SEO/GEO rules: semantic HTML, structured data, breadcrumbs, author/date, source lists
- avoid list: common bad UX choices for that product type
- approval checklist
- approved UI library foundations and installation guidance
- theme token recommendation from `knowledge/design_system/theme_token_intelligence/`
- component composition recommendation from `knowledge/design_system/component_composition_intelligence/`
- framework adapter recommendation from `knowledge/design_system/framework_adapter_intelligence/`
- UI decision intake profile from `knowledge/design_system/ui_decision_intake/`
- project UI playbook from `knowledge/design_system/project_ui_playbooks/`
- creative variant recommendations from `knowledge/design_system/creative_variant_intelligence/`
- UI Execution Kit references for implementation, review, and low-token prompts
- business UI pattern references from `knowledge/design_system/business_ui_patterns/`
- full business design references from `BUSINESS_REFERENCE_INDEX.json`
- template pack and recommended template metadata from `TEMPLATE_LIBRARY_INDEX.json`
- recommended dashboard reference style when applicable, such as `ADMIT-ADB01` through `ADMIT-ADB05`
- user flow references from `knowledge/design_system/ui_flows/`
- accessibility level and inclusive UI references from `knowledge/design_system/accessibility_inclusive_ui/`
- performance level and Core Web Vitals references from `knowledge/design_system/performance_web_vitals_ui/`
- content and microcopy level from `knowledge/design_system/content_microcopy_ux/`
- motion level and microinteraction guidance from `MOTION_MICROINTERACTIONS.md`
- RTL/Arabic UI references from `knowledge/design_system/rtl_arabic_ui/` when Arabic, bilingual, MENA, or RTL surfaces are detected
- visual quality governance references from `knowledge/design_system/visual_quality_governance/` for scored UI QA and rework decisions
- a compact `implementation_prompt` that references stable files instead of repeating long UI instructions
- color palette preset and creative variation axes based on product answers

## Experience Patterns

| Pattern | Use For |
| --- | --- |
| `seo_content_site` | Blog, news, corporate, knowledge base, docs, paid content. |
| `commerce_storefront` | eCommerce, marketplace, loyalty, booking-style public flows. |
| `data_heavy_web_app` | ERP, CRM, WMS, accounting, helpdesk, HR, BI dashboards. |
| `pos_operations` | POS, restaurant, fast operator workflows. |
| `mobile_app` | Customer, driver, sales rep, employee, news, delivery mobile apps. |

## Rule

The advisor is not a license to skip design approval. It is a compact planning
context for AI and developers. Frontend implementation should still pass:

```bash
kvdf design gate --task <task-id> --page <page-spec-id>
```

## UI Execution Kit

When frontend implementation is requested, the advisor should point the AI agent to:

- `knowledge/design_system/ui_execution_kit/UI_CONTRACT.md`
- `knowledge/design_system/ui_execution_kit/COLOR_SYSTEM.md`
- `knowledge/design_system/ui_execution_kit/CREATIVE_VARIATION_RULES.md`
- `knowledge/design_system/ui_execution_kit/ICON_MAP.md`
- `knowledge/design_system/ui_execution_kit/BUTTON_PRESETS.md`
- `knowledge/design_system/ui_execution_kit/COMPONENT_MAP.md`
- `knowledge/design_system/ui_execution_kit/UI_REVIEW.md`
- the relevant recipe under `knowledge/design_system/ui_execution_kit/recipes/`

Use these references to reduce repeated prompt text and keep implementation deterministic where it should be deterministic.

## Theme Token Intelligence

Use `knowledge/design_system/theme_token_intelligence/` before UI implementation to choose a product-aware token set.

```bash
kvdf design theme-presets
kvdf design theme-recommend ecommerce --json
kvdf design theme-recommend erp --output knowledge/frontend_specs/tokens.json
```

The exported token file should be referenced in implementation prompts instead of pasting palette details. This keeps prompts shorter while allowing creative variation through preset, density, surface style, accent strategy, and microcopy tone.

## Component Composition Intelligence

Use `knowledge/design_system/component_composition_intelligence/` to select a screen-level composition before implementation.

```bash
kvdf design composition-list
kvdf design composition-recommend erp --page "invoice approval table" --json
```

The selected `composition_id` should be referenced in prompts instead of describing the full screen structure every time.

## Framework Adapter Intelligence

Use `knowledge/design_system/framework_adapter_intelligence/` after selecting tokens and screen composition.

```bash
kvdf design framework-adapters
kvdf design framework-plan bootstrap --blueprint erp --composition crud_table_workspace --json
kvdf design framework-plan shadcn-ui --blueprint ecommerce --page checkout --json
```

The selected adapter translates Kabeeri tokens and composition into framework-specific imports, component mappings, icon strategy, and compatibility warnings. Implementation prompts should reference `adapter_key`, `token_set_id`, and `composition_id` instead of repeating framework documentation.

## Creative Variant Intelligence

## UI Decision Intake

Use `knowledge/design_system/ui_decision_intake/` to map developer/client answers into design choices.

```bash
kvdf design ui-questions ecommerce --json
kvdf questionnaire answer ui.brand_personality --value "premium trustworthy Arabic-first"
kvdf questionnaire answer ui.primary_user --value customer
kvdf questionnaire answer ui.primary_workflow --value checkout
kvdf design ui-decisions ecommerce --page checkout --json
```

The output selects a variant, palette, density, navigation pattern, surface style, tone, adapter, and composition. Missing high-priority answers should be asked before final visual implementation.

## Project UI Playbooks

Use `knowledge/design_system/project_ui_playbooks/` to start every product blueprint from a strong default UI direction.

```bash
kvdf design playbooks
kvdf design playbook erp --json
kvdf design playbook customer_mobile_app --page onboarding --json
```

Each playbook defines default variant archetype, composition, adapter preferences, density, navigation pattern, focus areas, critical UI questions, and avoid rules. UI Decision Intake can override these defaults from developer/client answers.

Use `knowledge/design_system/creative_variant_intelligence/` when a UI could otherwise become generic or repetitive.

```bash
kvdf design variant-archetypes
kvdf design variants ecommerce --page checkout --count 3 --json
kvdf design variants erp --page "invoice approval table" --framework antd
```

The selected `variant_id` changes density, hierarchy, navigation, surface style, component emphasis, and tone while preserving tokens, adapter, composition, accessibility, performance, motion, content, and RTL rules.

## KVDF Business Patterns And Flows

Kabeeri adapts the KVDF idea into the existing design system instead of creating a separate `kvdf/` folder. Recommendations should reference:

- `knowledge/design_system/business_ui_patterns/BUSINESS_UI_PATTERN_CATALOG.json`
- `knowledge/design_system/business_ui_patterns/BUSINESS_REFERENCE_INDEX.json`
- `knowledge/design_system/business_ui_patterns/TEMPLATE_LIBRARY_INDEX.json`
- `knowledge/design_system/business_ui_patterns/<business>/PATTERN.md`
- `knowledge/design_system/business_ui_patterns/<business>/references/*.md`
- `knowledge/design_system/business_ui_patterns/<business>/data/templates.json`
- the closest business pattern key, such as `ecommerce`, `erp`, `crm`, `booking`, or `ai-product`
- the relevant flow files under `knowledge/design_system/ui_flows/`
- `schemas/ui-template.schema.json` when creating reusable template metadata

This keeps prompts short while preserving business-specific UX expectations.

## Motion

Use `knowledge/design_system/ui_execution_kit/MOTION_MICROINTERACTIONS.md` when a task involves animation, hover behavior, transitions, loading indicators, success feedback, or page motion.

Default levels:

- `MINIMAL_MOTION`: admin panel, ERP, FinTech, HealthTech, internal tools.
- `BALANCED_MOTION`: SaaS, CRM, dashboard, booking, delivery, LMS, real estate, AI product.
- `EXPRESSIVE_MOTION`: landing pages, corporate sites, product showcases, and marketing pages.

Do not add a new motion library unless CSS transitions or the current UI framework are not enough.

## Visual Quality Governance

Use `knowledge/design_system/visual_quality_governance/` after frontend implementation and before Owner/client visual approval.

The runtime should record a quality score during:

```bash
kvdf design visual-review --page <page-spec-id> --screenshots desktop.png,mobile.png --checks responsive,states,accessibility,performance,content,motion,creative
kvdf design governance --json
```

The rubric checks visual match, responsive layout, states, accessibility, performance, content/microcopy, motion, creative fit, and RTL/Arabic behavior when applicable. Missing categories should create targeted rework actions instead of broad redesign prompts.

## Accessibility And Inclusive UI

Use `knowledge/design_system/accessibility_inclusive_ui/` for every UI recommendation and implementation. Accessibility is always enabled, but the advisor should choose the level:

- `ACCESSIBILITY_STRICT`: admin, ERP, CRM, FinTech, HealthTech, dashboards, security, government, and dense operational tools.
- `ACCESSIBILITY_BALANCED`: SaaS, booking, delivery, LMS, real estate, AI products, and general apps.
- `ACCESSIBILITY_CONTENT`: landing pages, corporate sites, blogs, news, documentation, and content-heavy public surfaces.

The advisor should expose `accessibility_inclusive_ui.level` and reference:

- `ACCESSIBILITY_CONTRACT.md`
- `FOCUS_KEYBOARD_RULES.md`
- `SEMANTIC_HTML_RULES.md`
- `FORMS_ERRORS_RULES.md`
- `TABLES_DATA_ACCESSIBILITY.md`
- `DIALOGS_OVERLAYS_RULES.md`
- `CONTENT_READABILITY_RULES.md`
- `ACCESSIBILITY_REVIEW_CHECKLIST.md`

Use these files to keep prompts short while making keyboard behavior, focus order, semantic HTML, forms, data tables, dialogs, contrast, touch targets, readable content, reduced motion, and assistive technology behavior part of the default UI contract.

## Performance And Core Web Vitals

Use `knowledge/design_system/performance_web_vitals_ui/` for every UI recommendation and implementation. Performance is always enabled, but the advisor should choose the level:

- `PERFORMANCE_PUBLIC_STRICT`: SEO pages, landing pages, commerce storefronts, marketplaces, news, blogs, documentation, and public marketing pages.
- `PERFORMANCE_APP_BALANCED`: SaaS, booking, delivery, LMS, real estate, AI products, and general authenticated apps.
- `PERFORMANCE_DATA_HEAVY`: ERP, CRM, admin panels, dashboards, FinTech, HealthTech, BI, WMS, accounting, helpdesk, and dense operational tools.

The advisor should expose `performance_web_vitals_ui.level` and reference:

- `PERFORMANCE_CONTRACT.md`
- `CORE_WEB_VITALS_RULES.md`
- `IMAGE_MEDIA_RULES.md`
- `FONT_CSS_RULES.md`
- `JAVASCRIPT_INTERACTION_RULES.md`
- `DATA_RENDERING_RULES.md`
- `LOADING_SKELETON_RULES.md`
- `PERFORMANCE_REVIEW_CHECKLIST.md`

Use these files so AI agents plan LCP, INP, CLS, stable dimensions, image/media strategy, font loading, JavaScript weight, table rendering, skeleton dimensions, and loading behavior before writing frontend code.

## Content And Microcopy UX

Use `knowledge/design_system/content_microcopy_ux/` for every UI recommendation and implementation. The advisor should choose the level:

- `CONTENT_OPERATIONAL`: admin panels, ERP, CRM, dashboards, FinTech, HealthTech, WMS, accounting, helpdesk, and internal tools.
- `CONTENT_CONVERSION`: eCommerce, marketplaces, booking, landing pages, SaaS signup, lead generation, and checkout flows.
- `CONTENT_EDITORIAL`: blogs, news, corporate sites, documentation, knowledge bases, and content-heavy pages.
- `CONTENT_CONVERSATIONAL`: AI products, assistants, prompt tools, onboarding, and guided workflows.

The advisor should expose `content_microcopy_ux.level` and reference:

- `CONTENT_MICROCOPY_CONTRACT.md`
- `ACTION_LABEL_RULES.md`
- `EMPTY_ERROR_STATE_COPY.md`
- `FORM_VALIDATION_COPY.md`
- `ONBOARDING_HELP_COPY.md`
- `CONFIRMATION_STATUS_COPY.md`
- `BUSINESS_TONE_MATRIX.md`
- `CONTENT_REVIEW_CHECKLIST.md`

Use these files so AI agents write product-aware action labels, empty states, errors, validation, onboarding, confirmations, status labels, and tone without repeating long prompt instructions.

## RTL Arabic UI

Use `knowledge/design_system/rtl_arabic_ui/` when the product supports Arabic, bilingual content, RTL direction, MENA audiences, Arabic dashboards, Arabic commerce, Arabic forms, or Arabic content-heavy surfaces.

The advisor should expose `rtl_arabic_ui.enabled = true` when language or flags indicate Arabic or RTL, and should point implementation to:

- `RTL_ARABIC_UI_CONTRACT.md`
- `ARABIC_TYPOGRAPHY.md`
- `RTL_LAYOUT_PATTERNS.md`
- `RTL_COMPONENT_RULES.md`
- `ARABIC_FORMS_TABLES.md`
- `RTL_ACCESSIBILITY.md`
- `RTL_REVIEW_CHECKLIST.md`

Arabic UI must handle typography, direction, mirrored layout, icon behavior, numbers, dates, tables, forms, focus order, and accessibility. Do not treat RTL as only `direction: rtl`.

## Creative Differentiation

For two similar applications, Kabeeri may recommend the same UI foundation and acceptance rules, but should vary at least four of:

- palette preset;
- density;
- page hierarchy;
- component emphasis;
- navigation pattern;
- surface style;
- empty-state tone;
- dashboard ordering;
- microcopy tone.

Variation must come from questionnaire answers, product blueprint, brand identity, target users, domain risk, and language requirements.
