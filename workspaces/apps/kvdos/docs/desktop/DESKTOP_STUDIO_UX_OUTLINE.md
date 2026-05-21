# KVDOS Studio UX Outline

This outline describes the first visible KVDOS Studio surface for the app
workspace. It is local-first, app-local, and focused on the studio shell,
navigation, registry framing, and first-view layout. It does not describe
runtime execution or cloud/licensing behavior.

## Studio Shell

- Purpose: present KVDOS as a calm, IDE-like control center
- Frame: left navigation, top context bar, main canvas, and right-side details
- First visible feeling: clear, technical, and trustworthy
- Not a code editor: the shell should orient the user before any deeper work

## Primary Navigation

- Home
- Projects
- Discovery
- Spec
- Tasks
- Approvals
- Reports
- Settings

Each destination should be explicit in the shell from the first view.

## Project Registry Framing

- Purpose: list, import, create, and inspect projects
- Top-level behavior: show the current project and the available workspace list
- Registry state: visible without opening any source code or runtime UI
- Empty state: explain that the workspace exists but no project has been selected

## Selected-Project Scope

- Purpose: make the current project scope obvious at all times
- Scope indicator: show the active project in the top context bar
- Scope behavior: navigation and reports should always refer to the selected project
- Scope boundary: do not imply execution, cloud sync, or license logic

## First View Layout Notes

- Left sidebar: primary navigation
- Top bar: current project, scope, and mode
- Main canvas: home dashboard or selected project overview
- Right panel: evidence, approvals, history, or inspector details
- Bottom strip: status notes and future quick actions, not execution controls

## First Show Contract

The first screen should show:

- the current project
- the primary navigation
- the project registry entry point
- the selected-project scope indicator
- a clear home/dashboard landing state

The first screen should not show:

- runtime execution controls
- cloud login or license flows
- packaging or release operations
- agent execution panels
- code editor surfaces as the primary entry point

## Section Map

### Home

- Purpose: orient the user and explain the current KVDOS state
- Source: app-local product docs, roadmap docs, readiness reports
- First view behavior: show product status, current next action, and readiness notes
- Empty state: explain that KVDOS is initialized but no project is selected
- Warning text: "Studio foundation: control surface only, not execution."

### Projects

- Purpose: create, import, select, and inspect projects
- Source: local project registry docs and app-local project metadata
- First view behavior: show a project list with status chips and workspace paths
- Empty state: show a clear no-data status if the registry is empty
- Warning text: "Projects are registry items, not execution targets."

### Discovery

- Purpose: collect product answers and convert them into blueprint/spec inputs
- Source: questionnaire and discovery artifacts
- First view behavior: show current discovery progress and unanswered prompts
- Empty state: explain that discovery has not started for the selected project
- Warning text: "Discovery defines scope; it does not execute tasks."

### Spec

- Purpose: show and edit `app.kvdos.yaml`
- Source: spec docs and validation rules
- First view behavior: show the current spec shape, validation state, and trace links
- Empty state: explain that the spec is not yet generated
- Warning text: "Spec editing is local planning, not execution."

### Tasks

- Purpose: show the FIFO task queue and task lifecycle
- Source: roadmap and tasking docs
- First view behavior: show task lanes, task cards, dependencies, and status filters
- Empty state: "No tasks found."
- Warning text: "Tasks are governance items until execution is explicitly approved."

### Approvals

- Purpose: centralize risky actions waiting for owner decision
- Source: approval gates and readiness reports
- First view behavior: show approval queue, risk summary, and evidence
- Empty state: explain that no approvals are pending yet
- Warning text: "Approvals gate work; they do not run work."

### Reports

- Purpose: show human-readable and machine-readable evidence
- Source: readiness reports, handoff notes, verification docs
- First view behavior: show readiness reports and recent review notes
- Empty state: "No reports available yet."
- Warning text: "Reports are read-only evidence."

### Settings

- Purpose: show local-only configuration and UI preferences
- Source: local config files and future desktop settings
- First view behavior: keep settings minimal and local-first
- Empty state: explain that settings are intentionally narrow in the first version
- Warning text: "Settings do not unlock execution or cloud behavior."

## Guardrails And Non-Goals

- No runtime execution
- No cloud login or license work
- No packaging or release flow
- No execution runner
- No agent execution surface
- No code editor as the primary first screen
