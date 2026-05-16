# English Documentation Index

This index is the official English entry point for Kabeeri VDF documentation. It must stay structurally aligned with `docs/ar/README.md`: same file numbers, same topics, and the same reading order.

## Parity Rule

- Files numbered `01` through `20` are the canonical documentation files.
- Every English canonical file has an Arabic counterpart with the same number and filename in `docs/ar/`.
- When one language gains more detail, the same idea should be added to the other language in the next parity update.
- Current runtime capability details live in `docs/SYSTEM_CAPABILITIES_REFERENCE.md`; these files explain the foundation and method.

## Canonical Files

| No. | File | Topic |
| --- | --- | --- |
| 01 | `01_VISION_AND_POSITIONING.md` | Vision and positioning |
| 02 | `02_CORE_CONCEPTS.md` | Core concepts |
| 03 | `03_FRAMEWORK_ARCHITECTURE.md` | Framework architecture |
| 04 | `04_REPOSITORY_STRUCTURE.md` | Repository structure |
| 05 | `05_PROJECT_LIFECYCLE.md` | Project lifecycle |
| 06 | `06_GENERATOR_SYSTEM.md` | Generator system |
| 07 | `07_QUESTIONNAIRE_SYSTEM.md` | Questionnaire system |
| 08 | `08_DOCUMENT_GENERATION_FLOW.md` | Document generation flow |
| 09 | `09_PROMPT_PACKS.md` | Prompt packs |
| 10 | `10_TASK_TRACKING.md` | Task tracking |
| 11 | `11_ACCEPTANCE_CHECKLISTS.md` | Acceptance checklists |
| 12 | `12_EXTENSION_LAYER.md` | Extension layer |
| 13 | `13_PRODUCT_ROADMAP_AND_DISTRIBUTION.md` | Product roadmap and distribution |
| 14 | `14_OPEN_SOURCE_STRATEGY.md` | Open-source strategy |
| 15 | `15_MARKET_RESEARCH_AND_DIFFERENTIATION.md` | Market research and differentiation |
| 16 | `16_CONTRIBUTOR_ROLES.md` | Contributor roles |
| 17 | `17_GOVERNANCE_AND_RELEASE_MODEL.md` | Governance and release model |
| 18 | `18_LICENSING_AND_RIGHTS.md` | Licensing and rights |
| 19 | `19_MVP_BUILD_PLAN.md` | MVP build plan |
| 20 | `20_AI_USAGE_RULES.md` | AI usage rules |

## Legacy English Files

The following English files existed before the parity pass and are retained only to avoid breaking old links:

- `02_ARCHITECTURE.md`
- `03_REPOSITORY_STRUCTURE.md`
- `04_ROADMAP.md`
- `05_MARKET_RESEARCH_AND_DIFFERENTIATION.md`

Use the canonical numbered files above for all new links.

## Maintenance Rule

When adding or changing a canonical document:

1. Update the Arabic and English versions together.
2. Update `docs/ar/README.md` and `docs/en/README.md`.
3. Update `docs/BILINGUAL_DOCUMENTATION_PARITY.md` if the parity rule changes.
4. Update `docs/reports/BILINGUAL_DOCS_PARITY_REPORT.md` after a new parity review.

## Workflow Instructions

The shared workflow contract for the AI Tool and Vibe developer lives in:

- `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- `docs/site/pages/en/ai-tool-hub.html`
- `docs/site/pages/en/vibe-developer-hub.html`

## Canonical Paths

The repository layout source of truth lives in
`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`. When you need to
decide where a file belongs, read that map first, use
`docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md` as the human workflow guide,
and then place the file inside the existing owning root instead of creating a
new top-level folder.
- `docs/site/pages/en/ai-tool.html`
- `docs/site/pages/en/vibe-developer.html`
- `docs/site/pages/en/ai-tool-hub.html`
- `docs/site/pages/en/vibe-developer-hub.html`

## Report And Command Rule

Live JSON reports are the execution view, and historical reports are the
explanation layer. If they disagree, fix the source state and regenerate the
derived report. The CLI reference should stay compact enough to scan quickly
while still pointing to the exact source of truth for the current command
state.

## Hand-Written Guidance Rule

These numbered English files are hand-written guidance, not generated page
shells. Keep them readable on their own, keep their Arabic counterparts in
sync, and update the docs site surface only after the human guidance is clear.
When a capability changes, update the human explanation here before relying on
the generated docs site to mirror it.
