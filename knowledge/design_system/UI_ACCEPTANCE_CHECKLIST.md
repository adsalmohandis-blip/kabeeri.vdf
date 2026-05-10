# UI Acceptance Checklist

## Source And Spec

- UI/UX Advisor recommendation exists when the product blueprint is known.
- Approved design source is linked.
- Approved text spec exists.
- Design tokens are referenced.
- Theme Token Intelligence preset or approved brand token set is selected.
- Color palette preset or brand token set is selected.
- UI Decision Intake profile is created from developer/client answers or missing answers are listed.
- Project UI Playbook is selected for the product blueprint and checked against the page intent.
- Creative variation profile is documented when a generated UI could otherwise look generic.
- Creative Variant Intelligence variant ID is selected when multiple professional directions are possible.
- Business UI pattern is selected from `knowledge/design_system/business_ui_patterns/` when the product category is known.
- Full design reference files are selected from `BUSINESS_REFERENCE_INDEX.json` when a priority business pack exists.
- Template pack and recommended templates are selected from `TEMPLATE_LIBRARY_INDEX.json` when a priority business pack exists.
- User flow is selected from `knowledge/design_system/ui_flows/` for multi-step or stateful UI.
- Accessibility level and references from `knowledge/design_system/accessibility_inclusive_ui/` are selected for every UI.
- Performance level and references from `knowledge/design_system/performance_web_vitals_ui/` are selected for every UI.
- Content microcopy level and references from `knowledge/design_system/content_microcopy_ux/` are selected for every UI.
- RTL/Arabic references from `knowledge/design_system/rtl_arabic_ui/` are selected when Arabic, bilingual, MENA, or RTL surfaces are involved.
- UI Execution Kit recipe is referenced for repeated screens such as CRUD, dashboard, form, settings, empty state, or confirm modal.
- Component Composition Intelligence composition ID is selected for each implemented screen.
- Framework Adapter Intelligence adapter key is selected for the target UI library before code generation.
- Framework imports, build setup, token mapping, icon strategy, and compatibility warnings are documented.
- UI template metadata follows `schemas/ui-template.schema.json` when reusable templates are created.
- Page spec exists.
- Component contracts exist for repeated components.

## States

- Loading state is defined.
- Empty state is defined.
- Error state is defined.
- Success state is defined when relevant.
- Disabled state is defined for controls.
- Empty, error, success, loading, permission, and no-results states include clear, product-aware copy and next actions.

## Responsive And Accessibility

- Mobile behavior is defined.
- Desktop behavior is defined.
- Keyboard access is considered.
- Focus states are visible.
- Semantic HTML, landmarks, heading order, and button/link roles are correct.
- Forms have visible labels, helper text, validation, and recoverable errors.
- Data tables define headers, sorting, row context, filtering, pagination, and empty/error states accessibly.
- Modals, drawers, dropdowns, and popovers define focus management, Escape behavior, and focus restoration.
- Contrast is acceptable.
- RTL behavior is considered when Arabic is supported.
- Arabic typography, reading rhythm, numbers, dates, forms, tables, mirrored layout, and icon direction are reviewed when `rtl_arabic_ui.enabled` is true.
- Icons follow the selected icon map.
- Action buttons include icons unless the selected design system intentionally omits them.
- Raw colors and inline color styles are absent from page components.
- Motion respects `prefers-reduced-motion` when animations are introduced.
- Motion does not become the only way to communicate status or meaning.
- LCP element or first usable content is identified for public and app screens.
- CLS risks are handled with image dimensions, aspect ratios, stable skeletons, and reserved widget space.
- INP risks are handled for search, filters, forms, navigation, and primary actions.
- Large tables, lists, charts, maps, and galleries use pagination, virtualization, lazy loading, or progressive rendering where appropriate.
- JavaScript, image, font, icon, chart, map, and animation weight is reviewed before delivery.
- Action labels describe outcomes and use consistent verbs.
- Destructive actions explain consequence and affected object.
- Form helper and validation copy is actionable.
- Status labels are consistent across the screen.
- Tone matches business type, user role, and risk level.

## Visual Review

- Screenshot or visual review notes exist.
- `kvdf design visual-review` is recorded when implementation touches UI.
- Visual quality rubric score is recorded for implemented UI.
- `kvdf design gate --task <task-id> --page <page-spec-id>` passes before Owner/client visual verify.
- Deviations are recorded.
- Owner/client visual approval is recorded when required.
- `UI_REVIEW.md` or equivalent UI-only review has been applied.
- `ACCESSIBILITY_REVIEW_CHECKLIST.md` has been applied for UI changes.
- `PERFORMANCE_REVIEW_CHECKLIST.md` has been applied for UI changes.
- `CONTENT_REVIEW_CHECKLIST.md` has been applied for UI changes.
- `MOTION_MICROINTERACTIONS.md` review has been applied when motion is introduced.
- `RTL_REVIEW_CHECKLIST.md` has been applied for Arabic or RTL UI.
- `VISUAL_QUALITY_RUBRIC.md` and `DESIGN_QA_CHECKLIST.md` have been applied before final visual approval.
- `check-ui.js` or equivalent static UI checker is run when applicable.

## SEO/GEO Surfaces

- Semantic HTML structure is defined.
- Structured data type is selected when relevant.
- Breadcrumb behavior is defined.
- Author/date/source/last-updated rules are defined for content pages.
- Core Web Vitals risks are reviewed: LCP, INP, CLS, image dimensions, JavaScript weight, font loading, and lazy loading.

## Dashboard And Mobile Surfaces

- Data-heavy screens define table filters, pagination or virtualization, and empty/error states.
- Role-based visibility and permission UX are defined for dashboards.
- Mobile screens define touch targets, offline state, deep links, and permission prompts.

## AI Cost Control

- Prompt references stable UI files instead of repeating long design instructions.
- The selected UI foundation is fixed before implementation.
- The selected business pattern and flow are referenced by path instead of pasted into every prompt.
- The selected full design references are referenced by filename instead of restating screen structure in the prompt.
- The implementation prompt references selected templates by ID instead of describing the whole screen from scratch.
- Page recipe and component map are selected before code generation.
- Screen composition ID is referenced instead of restating the full component arrangement in every prompt.
- Framework adapter key is referenced instead of restating framework usage rules in every prompt.
- Creative variant ID is referenced instead of asking AI to invent a fresh visual direction from scratch.
- Review uses checklist/checker output before asking AI for broad redesign.
