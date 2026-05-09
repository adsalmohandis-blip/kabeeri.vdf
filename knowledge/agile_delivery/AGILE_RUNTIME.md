# Agile Templates Runtime

Agile templates are now executable workspace records, not only markdown examples.

Kabeeri still supports the older direct sprint commands. The `kvdf agile` layer adds the missing Agile objects around them:

- product backlog items
- epics
- user stories
- story Definition of Ready checks
- sprint planning commitments
- impediment tracking and blocking
- retrospective action records
- velocity and release forecasting
- Agile health live JSON for dashboard and editor surfaces
- sprint review records
- conversion from story to governed task

Runtime state lives in:

```text
.kabeeri/agile.json
.kabeeri/sprints.json
.kabeeri/tasks.json
.kabeeri/dashboard/agile_state.json
```

## Command Flow

```bash
kvdf agile backlog add --id BL-001 --title "Checkout MVP" --type epic --priority high --source "vision"

kvdf agile epic create \
  --id epic-checkout \
  --title "Checkout" \
  --goal "Customers can place orders" \
  --users customer \
  --source "vision"

kvdf agile story create \
  --id story-checkout-001 \
  --epic epic-checkout \
  --title "Cart checkout" \
  --role customer \
  --want "pay for cart items" \
  --value "complete an order" \
  --points 5 \
  --workstream backend \
  --acceptance "Order is created,Payment result is stored" \
  --reviewer owner-001 \
  --source "vision"

kvdf agile story ready story-checkout-001
kvdf agile story task story-checkout-001 --task task-001
kvdf agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10 --goal "Checkout foundation"
kvdf agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted
kvdf agile impediment add --id imp-001 --story story-checkout-001 --severity high --title "Payment credentials missing" --owner owner-001
kvdf agile impediment resolve imp-001 --resolution "Credentials configured"
kvdf agile retrospective add sprint-001 --good "Goal was clear" --improve "Slice stories smaller" --actions "Add QA earlier"
kvdf agile health
kvdf agile forecast
kvdf validate agile
```

## Record Model

`backlog` records follow `PRODUCT_BACKLOG_TEMPLATE.md`:

- `id`
- `title`
- `type`: `epic`, `story`, or `task`
- `priority`
- `source`
- `status`
- `notes`

`epics` follow `EPIC_TEMPLATE.md`:

- `epic_id`
- `title`
- `business_goal`
- `target_users`
- `source`
- `priority`
- `story_ids`
- `acceptance_summary`
- `out_of_scope`
- `risks`
- `target_release`

`stories` follow `USER_STORY_TEMPLATE.md`:

- `story_id`
- `epic_id`
- `title`
- `story_text`
- `source`
- `priority`
- `estimate_points`
- `workstream`
- `sprint_id`
- `reviewer_id`
- `acceptance_criteria`
- `definition_of_ready`
- `definition_of_done`
- `dependencies`
- `risks`
- `non_functional_requirements`
- `test_notes`
- `task_id`

`sprint_reviews` follow `SPRINT_REVIEW_TEMPLATE.md`:

- `review_id`
- `sprint_id`
- `goal_met`
- `accepted_story_ids`
- `rework_story_ids`
- `accepted_points`
- `rework_points`
- `token_cost`
- `owner_decision`
- `feedback`
- `next_backlog_changes`
- `demo_notes`
- `stakeholder_feedback`
- `action_items`

`impediments` capture delivery blockers:

- `impediment_id`
- `title`
- `description`
- `severity`: `low`, `medium`, `high`, or `critical`
- `status`: `open`, `resolved`, or `deferred`
- `sprint_id`
- `story_id`
- `owner_id`
- `target_resolution`
- `resolution`

`retrospectives` capture continuous improvement:

- `retro_id`
- `sprint_id`
- `went_well`
- `improve`
- `action_items`
- `decision`
- `facilitator`

## Governance Rules

- Epics are not implementation units. They must be broken into stories before sprint commitment.
- A story is `ready` only when it has source, business value, acceptance criteria, estimate points, reviewer, and test notes.
- Sprint planning blocks not-ready stories unless `--force` is explicitly used.
- Sprint planning blocks stories with open impediments unless `--force` is explicitly used.
- Sprint planning blocks over-commitment when committed story points exceed `--capacity-points`.
- High and critical open impediments appear as Agile health blockers.
- `kvdf agile story task` creates a normal governed task with `source: user_story` and `source_reference: story:<story_id>`.
- Converted story tasks still use workstream governance, app boundary governance, assignment checks, tokens, locks, acceptance review, and Owner verification.

## Scrum-grade Operating Loop

Use the Agile runtime as a lightweight Scrum Master layer:

1. Keep the product backlog ordered with clear source and priority.
2. Break epics into small stories with business value and acceptance criteria.
3. Run `kvdf agile story ready <story-id>` before sprint commitment.
4. Use `kvdf agile sprint plan` with a sprint goal, capacity points, dependencies, and risks.
5. Record blockers with `kvdf agile impediment add`; resolve them before committing affected stories.
6. Convert committed stories into governed tasks before implementation.
7. Record sprint review outcomes with accepted/rework stories.
8. Record retrospective actions and carry them into the next sprint.
9. Use `kvdf agile health --json` or `.kabeeri/dashboard/agile_state.json` for quick resume context.

## Live Agile State

`kvdf agile health` writes `.kabeeri/dashboard/agile_state.json`.

The live state includes:

- summary counts
- health status
- active sprint commitments
- last-five-sprint velocity
- remaining point forecast
- open impediments
- latest retrospectives
- action items

The live dashboard serves the same data from:

```text
/__kvdf/api/agile
```

## Dashboard And Validation

The live dashboard shows Agile stories and sprint reviews.

`kvdf validate agile` checks:

- duplicate backlog, epic, story, and review IDs
- valid backlog types and priorities
- story references to existing epics, sprints, and tasks
- ready story requirements
- sprint review references to existing stories and sprints
- impediment references to existing stories and sprints
- retrospective references to existing sprints

## Relationship To Existing Templates

- `PRODUCT_BACKLOG_TEMPLATE.md` defines backlog fields.
- `EPIC_TEMPLATE.md` defines epic fields.
- `USER_STORY_TEMPLATE.md` defines story shape and DoR/DoD.
- `SPRINT_PLANNING_TEMPLATE.md` maps to `kvdf agile sprint plan`.
- `SPRINT_REVIEW_TEMPLATE.md` maps to `kvdf agile sprint review`.
- `SPRINT_COST_METADATA_SCHEMA.json` is still used by sprint cost analytics and AI usage rollups.
