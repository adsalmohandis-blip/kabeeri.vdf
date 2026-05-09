# Interaction Surfaces

## Primary Surfaces

- VS Code Webview: developer workspace, suggested tasks, active work, cost, locks, and Owner verify queue.
- Local Dashboard: project overview, readiness, cost, task state, locks, GitHub sync, and reports.
- Chat Panel: natural language intent capture, clarifying questions, and task suggestions.

## Secondary Surface

- CLI: advanced engine for automation, CI, and power users.

## Future Surfaces

- Desktop app
- Cloud app
- Browser extension
- Other editor integrations

## Source Rule

No surface replaces `.kabeeri/`. All surfaces are views, command senders, or guided editors over project state.

## Safety Rule

Sensitive actions must preserve the same approvals regardless of surface: Owner verify, budget override, GitHub mutation, publish, migration, and owner transfer cannot bypass policy through UI.

