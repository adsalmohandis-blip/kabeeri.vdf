# Idea to Evolution Pipeline

The Idea to Evolution Pipeline is the next planning layer above the shared Planner Runtime Approval Gate.
It turns a raw idea or goal into documentation files, design artifacts, a visual planning model, a version plan, governed evolutions, task punches, a visual roadmap, and the next approved Evolution slice.

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
