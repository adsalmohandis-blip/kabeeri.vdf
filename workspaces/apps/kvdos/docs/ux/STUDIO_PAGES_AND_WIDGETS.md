# KVDOS Studio Pages and Widget Map

## Review Metadata

- Status: Ready for e1-p1 execution
- Source: Promoted from KVDF-generated KVDOS discovery docs
- Product: KVDOS
- Review state: Approved for scoped execution
- Canonical status: App-local target map for the Studio foundation slice

> Note: this is a Studio UX target map for the KVDOS Studio foundation slice.
> It defines the first shell and navigation contract, not runtime execution.

## Studio Layout Model

KVDOS Studio should use an IDE-like control-center layout:

- left sidebar for global navigation
- top bar for project, scope, mode, status, and search
- main canvas for the active page
- right panel for evidence, approvals, history, or inspector details
- bottom strip for logs, runner state, and quick actions

## Main Pages

### Home Dashboard

Purpose: show the current project, current scope, current mode, and the next exact action.

Widgets:

- project card
- scope selector
- mode toggle
- next action card
- health indicators
- recent activity list
- pending approvals badge
- runner status
- cloud/license status

### Projects

Purpose: create, import, select, and inspect projects.

Widgets:

- project list
- import repo button
- create project button
- project status chips
- last activity
- workspace path

### Discovery

Purpose: collect product answers and convert them into blueprint/spec inputs.

Widgets:

- question card
- answer input
- progress indicator
- assumptions list
- conflicts list
- confidence score

### Spec

Purpose: show and edit `app.kvdos.yaml`.

Widgets:

- YAML editor
- validation panel
- spec diff
- trace links
- missing fields

### Tasks

Purpose: show the FIFO task queue and task lifecycle.

Widgets:

- task lanes
- task cards
- dependencies
- assigned agent/tool
- status filters
- blocked task panel

### Agents

Purpose: show active and historical AI/tool execution.

Widgets:

- active agent card
- current task
- model/tool info
- token/cost summary
- last result
- failure/repair count

### Patches

Purpose: review proposed changes before merge/apply.

Widgets:

- patch list
- file diff viewer
- risk level
- approval controls
- rollback availability

### Approvals

Purpose: centralize risky actions waiting for owner/reviewer decision.

Widgets:

- approval queue
- risk summary
- affected files
- approve/reject/request changes controls
- evidence panel

### Reports

Purpose: show human-readable and machine-readable project evidence.

Widgets:

- report cards
- readiness summary
- governance summary
- export Markdown/JSON buttons

### Logs

Purpose: inspect runner, build, test, and agent logs.

Widgets:

- log stream
- filter by source
- error grouping
- retry links

### Packages

Purpose: manage plugins and packages.

Widgets:

- installed packages
- available packages
- signature status
- capabilities
- enable/disable controls

### Settings

Purpose: configure project, runner, cloud account, license, AI tools, and privacy.

Widgets:

- local runner settings
- cloud/license settings
- AI tool connection settings
- privacy mode
- export/backup controls

## First-Show Contract

The first visible Studio shell should show:

- current project
- selected-project scope
- primary navigation
- home/dashboard landing content
- registry entry point

The first visible Studio shell should not show:

- execution runner controls as the primary entry
- cloud login or license flows as the first step
- packaging or release operations
- a code editor as the main landing surface

## e1-p1 Foundation Pages

For the `e1-p1` Studio foundation slice, the first priority pages are:

- Home Dashboard
- Projects
- Discovery
- Spec
- Tasks
- Approvals
- Reports
- Settings

These pages are navigation and planning surfaces only.
They should not be treated as execution surfaces until later slices authorize them.

## Later / Not Yet For e1-p1

These surfaces may exist as later planning targets, but they are not the focus of
the `e1-p1` Studio foundation slice:

- Agents
- Patches
- Logs
- Packages

If these are referenced in the wider roadmap, they should remain clearly downstream from the Studio foundation slice.

## UI Priority

The first visible product should not be a code editor.

The first visible product should be a clear project control center that shows status, next action, tasks, approvals, and local scope state.

The first visible product should be a Studio shell that makes the current project and primary navigation obvious before any deeper workflow appears.
