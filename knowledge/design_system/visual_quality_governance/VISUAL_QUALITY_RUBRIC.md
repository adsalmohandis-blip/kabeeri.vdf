# Visual Quality Rubric

Use this rubric to evaluate implemented UI without asking an AI model to
redesign from scratch. Score evidence, then fix only the weak areas.

Each category is scored:

- `2`: solid evidence and no obvious issue.
- `1`: partially covered, needs small polish or missing evidence.
- `0`: missing, weak, or contradictory to the approved design direction.

## Categories

| Category | What To Check |
| --- | --- |
| `visual_match` | Implementation follows approved page spec, selected business pattern, tokens, and component contracts. |
| `layout_responsive` | Mobile and desktop screenshots exist, layout is stable, text does not overlap, tables/forms remain usable. |
| `states_feedback` | Loading, empty, error, success, disabled, validation, and permission states are represented where relevant. |
| `accessibility` | Keyboard, focus, contrast, semantics, labels, touch targets, dialogs, and reduced motion are checked. |
| `performance` | LCP/INP/CLS risks, images, fonts, JavaScript weight, lazy loading, lists, tables, charts, and skeletons are reviewed. |
| `content_microcopy` | Action labels, helper text, errors, empty states, confirmations, statuses, and tone match the product. |
| `motion_behavior` | Motion is purposeful, uses tokens, respects reduced motion, and does not hide critical information. |
| `creative_fit` | The UI uses selected creative axes and does not look like a generic repeated template. |
| `rtl_arabic` | Arabic/RTL surfaces handle direction, typography, numbers, dates, forms, tables, icons, and focus order. Mark not applicable for LTR-only UI. |

## Thresholds

- `90%+`: pass with high confidence.
- `75%-89%`: pass only if issues are low risk and recorded.
- `60%-74%`: needs rework before owner/client visual approval.
- `<60%`: block UI acceptance.

## Rule

The rubric should guide targeted fixes. Do not request a broad redesign unless
the score is low across multiple categories.

