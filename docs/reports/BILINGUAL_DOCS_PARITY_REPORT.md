# Bilingual Docs Parity Report

Updated: 2026-05-10

This report records the current Arabic/English documentation parity state for
the canonical docs under `docs/ar/` and `docs/en/`.

## Scope

Checked:

- `docs/ar/README.md`
- `docs/en/README.md`
- `docs/ar/01_...` through `docs/ar/20_...`
- `docs/en/01_...` through `docs/en/20_...`
- legacy English files retained for compatibility
- `docs/BILINGUAL_DOCUMENTATION_PARITY.md`

## Result

| Check | Status | Notes |
| --- | --- | --- |
| Canonical Arabic files | pass | 20 numbered files exist. |
| Canonical English files | pass | 20 numbered files exist. |
| Filename parity | pass | Every canonical Arabic filename has the same English filename. |
| Index parity | pass | Arabic and English indexes use the same 20-topic structure. |
| Legacy English files | accepted | Kept to avoid breaking old links; not counted as canonical docs. |
| Full translation depth | ongoing | Some English pages remain shorter than Arabic pages and need future content-depth passes. |

## Canonical Topic Map

| No. | Canonical file | Arabic topic | English topic |
| --- | --- | --- | --- |
| 01 | `01_VISION_AND_POSITIONING.md` | الرؤية والتموضع | Vision and positioning |
| 02 | `02_CORE_CONCEPTS.md` | المفاهيم الأساسية | Core concepts |
| 03 | `03_FRAMEWORK_ARCHITECTURE.md` | معمارية الفريمورك | Framework architecture |
| 04 | `04_REPOSITORY_STRUCTURE.md` | هيكل الريبو | Repository structure |
| 05 | `05_PROJECT_LIFECYCLE.md` | دورة حياة المشروع | Project lifecycle |
| 06 | `06_GENERATOR_SYSTEM.md` | نظام المولدات | Generator system |
| 07 | `07_QUESTIONNAIRE_SYSTEM.md` | نظام الأسئلة | Questionnaire system |
| 08 | `08_DOCUMENT_GENERATION_FLOW.md` | تدفق توليد الوثائق | Document generation flow |
| 09 | `09_PROMPT_PACKS.md` | حزم البرومبت | Prompt packs |
| 10 | `10_TASK_TRACKING.md` | تتبع المهام | Task tracking |
| 11 | `11_ACCEPTANCE_CHECKLISTS.md` | قوائم القبول | Acceptance checklists |
| 12 | `12_EXTENSION_LAYER.md` | طبقة الامتداد | Extension layer |
| 13 | `13_PRODUCT_ROADMAP_AND_DISTRIBUTION.md` | خارطة المنتج والتوزيع | Product roadmap and distribution |
| 14 | `14_OPEN_SOURCE_STRATEGY.md` | استراتيجية المصدر المفتوح | Open-source strategy |
| 15 | `15_MARKET_RESEARCH_AND_DIFFERENTIATION.md` | أبحاث السوق والتمييز | Market research and differentiation |
| 16 | `16_CONTRIBUTOR_ROLES.md` | أدوار المساهمين | Contributor roles |
| 17 | `17_GOVERNANCE_AND_RELEASE_MODEL.md` | الحوكمة ونموذج الإصدارات | Governance and release model |
| 18 | `18_LICENSING_AND_RIGHTS.md` | الترخيص والحقوق | Licensing and rights |
| 19 | `19_MVP_BUILD_PLAN.md` | خطة بناء النسخة الأولى | MVP build plan |
| 20 | `20_AI_USAGE_RULES.md` | قواعد استخدام الذكاء الاصطناعي | AI usage rules |

## Legacy English Files

These files remain for old links:

- `docs/en/02_ARCHITECTURE.md`
- `docs/en/03_REPOSITORY_STRUCTURE.md`
- `docs/en/04_ROADMAP.md`
- `docs/en/05_MARKET_RESEARCH_AND_DIFFERENTIATION.md`

They should not be used for new navigation. New links should point to the
canonical numbered files listed above.

## Remaining Work

- Deepen English pages that are shorter than Arabic pages.
- Continue content-depth parity after each major runtime feature.
- Add a lightweight automated parity check later if docs drift becomes frequent.
