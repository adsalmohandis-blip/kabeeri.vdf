# KVDOS Studio Pages and Widget Map

## Review Metadata

- Status: Draft
- Source: Promoted from KVDF-generated KVDOS discovery docs
- Product: KVDOS
- Review state: Pending owner review before implementation
- Canonical status: Not canonical until merged and approved by owner

> Note: this is a Studio UX target map. The current workspace ships a local
> HTML task view and related command-line surfaces, not the full page set
> described below.

## Studio Layout Model

KVDOS Studio should use an IDE-like control-center layout:

- left sidebar for global navigation
- top bar for app, scope, mode, status, and search
- main canvas for the active page
- right panel for evidence, approvals, history, or inspector details
- bottom strip for logs, runner state, and quick actions
- portfolio and compare surfaces for multiple workspaces or app contexts
- application detail surfaces for full app identity, foldering, versions, evolutions, tasks, and analysis

## Main Pages

### Home Dashboard

Purpose: show the current app identity, current pipeline stage, current scope, current mode, and the next exact action.

Widgets:

- app card
- pipeline stage chip
- version / evo strip
- scope selector
- mode toggle
- next action card
- health indicators
- recent activity list
- pending approvals badge
- runner status
- cloud/license status

### Application Dashboard

Purpose: show one app at a glance with its identity, pipeline, and next actions.

Widgets:

- app identity header
- pipeline stage strip
- version summary
- evo summary
- task summary
- approval summary
- report summary
- health summary
- quick actions
- recent activity

### Workspace Portfolio

Purpose: show multiple active workspaces and app contexts without mixing state.

Widgets:

- workspace list
- active workspace chip
- app portfolio summary
- compare entry point
- quick switch actions

### Compare Mode

Purpose: inspect two workspaces or app contexts side by side.

Widgets:

- left context panel
- right context panel
- diff summary
- health comparison
- open-in-workspace actions

### Applications

Purpose: create, import, select, and inspect app objects and workspaces.

Widgets:

- application list
- import repo button
- create app button
- application status chips
- last activity
- workspace path

### Workspace Explorer

Purpose: browse, open, and create files and folders inside the active workspace or app.

Widgets:

- workspace tree
- folder tree nodes
- file tree nodes
- new file action
- new folder action
- open folder action
- search filter
- pinned sections
- task/report shortcuts
- explorer footer

### Application Detail

Purpose: show one app as a full object identity with its folder map, pipeline, versions, evolutions, tasks, settings, and analysis.

Widgets:

- app identity card
- folder map
- pipeline lane
- version lane
- version detail panel
- evo lane
- evo detail panel
- task lane
- analysis summary
- settings summary
- health summary
- report links
- approval links
- AI tool stack

### App Scaffolding

Purpose: create a new app object and initial workspace shell.

Widgets:

- template picker
- stack selector
- initial folder generator
- app identity form
- first-run setup checklist

### Code Intelligence

Purpose: provide IDE-grade navigation and refactor actions.

Widgets:

- search results
- definition jump list
- references list
- rename action
- diagnostics list
- refactor actions

### Test And Debug

Purpose: run tests and debug failures with source-linked output.

Widgets:

- test explorer
- run/debug controls
- breakpoint list
- failure-to-line links
- linked log output

### Source Control

Purpose: manage branches, commits, diffs, and review handoff.

Widgets:

- branch list
- commit composer
- diff viewer
- merge conflict view
- PR handoff link

### Environment And Runtime

Purpose: manage env vars, secrets, ports, and runtime settings per app.

Widgets:

- env var list
- secrets panel
- port list
- local services list
- runtime toggle
- preview / hot reload status

### Build Release And Rollback

Purpose: package, release, verify, and restore app versions.

Widgets:

- package summary
- release candidate card
- signature / verification panel
- version history
- rollback action

### AI To Code

Purpose: turn approved AI output into reviewed code changes.

Widgets:

- prompt composer
- proposed patch view
- diff explanation panel
- apply / reject controls
- tool provenance badge

### App Ownership

Purpose: keep the app as a full first-class object identity.

Widgets:

- identity card
- folder map
- pipeline stage lane
- version and evo summaries
- task / approval / report links
- settings summary
- activity history

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

### AI Workbench

Purpose: manage multiple AI sessions and multiple AI tools in one workbench.

Widgets:

- chat session list
- tool stack / tool picker
- active tool indicator
- assigned role card
- context summary
- follow-up composer
- review queue

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

Purpose: show human-readable and machine-readable app evidence.

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

### Plugin Detail

Purpose: inspect one plugin, its trust state, and its permissions before enabling or installing it.

Widgets:

- plugin header
- purpose summary
- trust state
- permissions list
- install / enable button
- disable button
- permission request details
- marketplace link

### Settings

Purpose: configure app, runner, cloud account, license, AI tools, connections, and privacy.

Widgets:

- local runner settings
- cloud/license settings
- AI tool connection settings
- privacy mode
- export/backup controls

### AI Tool Connections

Purpose: manage external AI tool connections such as Codex or Claude Code.

Widgets:

- connection list
- add connection button
- edit connection button
- provider status
- permission scope
- enable/disable controls
- test connection

## UI Priority

The first visible product should not be a code editor.

The first visible product should be a clear app control center that shows status, next action, tasks, approvals, and local runner state.
