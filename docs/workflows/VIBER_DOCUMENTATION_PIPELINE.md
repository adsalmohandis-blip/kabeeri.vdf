# Viber Documentation Pipeline

The Viber Dev Pipeline uses docs as part of the delivery contract. Docs are
planned, generated, reviewed, approved, and applied to stage before execution.

## Stage-Doc Mapping

- `idea`: PRD or BRD draft
- `requirements`: PRD, SRS, FRD, scope, personas, stories
- `system_design`: system design and C4 docs when relevant
- `database_design`: ERD and schema docs when data is persistent
- `ui_ux_design`: UI/UX, IA, flows, wireframes, UI spec
- `api_design`: API spec and integration notes when the app has a backend
- `security_design`: security design and threat model for auth, payment, tenant,
  admin, or sensitive apps
- `version_plan`: version plan
- `evolution`: evolutions
- `task_punch`: task punches
- `validation`: test strategy and QA checklist
- `handoff`: handoff, release, support, security, and dependency docs

## Method Alignment

- `structured`: stricter upfront docs and gates
- `agile`: lighter docs, faster feedback, smaller slices
- `hybrid`: structured foundation first, then agile execution slices
- `auto`: KVDF chooses the method and explains why

## Docs Lifecycle

1. Plan required docs
2. Materialize draft docs into the app workspace
3. Mark docs as applied to stage when the stage uses them
4. Review docs completeness and alignment
5. Approve docs with the Owner gate

## Output Expectations

Planner and pipeline output should surface:

- docs plan
- docs status
- missing required docs
- stale docs
- next action
- stop condition

Docs live in the app workspace, not in KVDF Core docs.

The planner may also attach a Roadmap Train summary so the app can resume the
same version/stage/sprint/evolution queue on the next session without
rebuilding it from chat or stale runtime state.
That summary is surfaced as `roadmap_train_summary` and pairs with the derived
`evo_sprint_queue` view when the train is present.

When `ui_ux_intelligence` is available, the Viber docs pipeline can optionally
include its UI/UX recommendations, checklist summary, Markdown-ready docs
sections, scorecard, gate, readiness, tokens, component blueprints, screen
blueprints, pattern libraries, implementation guidance, prompt packs, evidence
manifests, visual QA contracts, acceptance gates, regression checklists, and
handoff-pack summary during planning or materialization. The same provider can
also surface knowledge-pack status, catalog health, governance registry, and
safe upgrade planning so future docs runs know whether the local knowledge pack
is healthy before relying on it. Use
`--include-ui-ux-intelligence` or `--ui-ux-intelligence` to opt in, and
`--no-ui-ux-intelligence` to suppress the provider even when installed. The
plugin remains optional, offline, and read-only unless docs materialization is
already writing the app docs. The handoff pack can be exported to Markdown only
when the operator explicitly passes `handoff-pack --output <path>`. The prompt
pack can likewise be exported only when `prompt-pack --output <path>` is
explicitly requested. The evidence, visual-qa, acceptance-gate, and regression
commands are report-only surfaces for handoff and publish readiness.

Tailwind guidance is separate from UI/UX intelligence. When an app or planner
workflow explicitly opts into `tailwind_ui`, the docs pipeline can surface a
read-only provider summary, planner guidance, docs guidance, and an HTML
comment marker without making Tailwind a KVDF Core dependency. Use
`--include-tailwind-ui` or `--tailwind-ui` to opt in, and `--no-tailwind-ui` to
suppress the provider even when the plugin is available. Tailwind stays
guidance-only in this phase, so the docs pipeline never runs Tailwind CLI or
fetches CDN assets. Generated HTML continues to fall back to the local path
when Tailwind is unavailable.

The optional `ui_dashboard_kits` plugin keeps the old UI execution-kit checker,
dashboard examples, templates, and snippets available as a removable plugin
surface. When it is installed, docs or task-punch guidance can point developers
to `kvdf ui-dashboard-kits check`, `examples`, `templates`, and `snippets`
without making those rules part of KVDF Core itself.

If a surface explicitly opts into Bootstrap styling, the optional
`bootstrap_ui` plugin can provide copied Bootstrap CSS and JavaScript assets
and a safe snippet/helper/provider surface without making Bootstrap a Core
dependency. When it is not enabled, HTML builders keep the fallback comment in
the output so review tools can see that the surface stayed on the local HTML
path instead of a Bootstrap-backed path.
