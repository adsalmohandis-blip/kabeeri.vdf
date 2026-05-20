# Idea to Evolution Pipeline

The Idea to Evolution Pipeline is the next planning layer above the shared Planner Runtime Approval Gate.
It turns a raw idea or goal into documentation files, design artifacts, a visual planning model, a version plan, governed evolutions, task punches, a visual roadmap, and the next approved Evolution slice.

The planner dashboard sync layer can then surface the approved plan, visual summary, source-control state, materialization status, and next action in live dashboard JSON and exported HTML.

## Flow

```text
Idea
-> Documentation Files
-> System Design
-> Database Design
-> UI/UX Design
-> Visual Planning
-> Version Plan
-> Evolutions
-> Task Punches
-> Visual Roadmap
-> Next Evolution
-> Planner approval / materialization
-> Dashboard / live-state sync
-> Execution
-> Validation
-> Dashboard / visual updates later
```

## Track Behavior

### Owner Track

- Delivery mode defaults to direct-to-main when Git is available.
- The pipeline stays focused on KVDF Core source, docs, schemas, tests, and prompt packs.
- KVDOS and runtime state under `.kabeeri/` stay out of scope unless explicitly requested.

### Vibe/App Track

- Delivery mode defaults to local-first.
- The pipeline focuses on app workspace docs, system design, database design, UI/UX design, and handoff artifacts.
- GitHub handoff remains optional and never becomes the default path.

### Plugin Track

- Delivery mode follows the selected source-control contract.
- The pipeline focuses on plugin manifest, runtime, docs, schemas, and tests parity.
- Unrelated plugins and `.kabeeri/plugin-links/` stay protected.

## Visual Planning

The pipeline reuses the Planner visual model so the plan can be rendered as:

- Mermaid graph
- planning board
- scope map
- markdown visual report

The dashboard sync layer can render the planner summary as an empty-state-safe
Planner / Pipeline section without becoming the source of truth.

## Planner Method And Docs Materialization

The pipeline is now fed by the self-planning engine:

- `kvdf planner method` chooses `auto`, `structured`, `agile`, or `hybrid`
- `kvdf planner auto` generates the planning strategy, docs map, design
  artifacts, versions, evolutions, task punches, visuals, review summary, and
  Codex prompt
- `kvdf planner review` checks scope, method, docs, security, source control,
  task quality, and visual readiness
- `kvdf planner docs` materializes draft Markdown docs before execution

The pipeline still does not execute work or materialize Evolutions on its own.
It prepares the governed package that the Owner can review, approve, and then
materialize.

## Source Control

The pipeline carries the explicit `source_control` object so plan output can describe:

- no source control
- local-only delivery
- Git direct-to-main
- Git branch
- Git branch + PR
- GitHub as an optional provider/plugin
- future replaceable providers

## Next Action

The next action is to review the pipeline plan, then approve and materialize the first Evolution.
