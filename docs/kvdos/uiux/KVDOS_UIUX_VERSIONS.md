# KVDOS UIUX Versions

This document defines the UI/UX versioning plan for KVDOS.

It is written so the work can be delivered in stable slices, while still
covering the full MVP surface.

## Version Strategy

- `v0.1` builds the visual and navigation foundation.
- `v0.2` builds the discovery and planning experience.
- `v0.3` builds the execution cockpit.
- `v0.4` builds the runner, cloud, and package operations.
- `v0.5` builds governance, billing, and operational hardening.
- `v1.0` is the launch-ready, fully connected KVDOS UI layer.

## v0.1 Foundation

### Goal

Create the visual language, shell, and navigation system.

### Included Screens

- shared shell
- Studio dashboard
- project dashboard shell
- global search / command palette
- user menu
- notifications

### Exit Criteria

- navigation is clear and stable;
- project context is visible everywhere;
- layout, spacing, colors, and typography are consistent;
- responsive shell works on desktop and tablet.

## v0.2 Discovery And Planning

### Goal

Make the product useful before execution starts.

### Included Screens

- discovery flow
- blueprint viewer
- spec viewer
- project overview
- task creation / suggested task handoff

### Exit Criteria

- discovery can capture the missing decisions;
- blueprint and spec are readable and actionable;
- users can see assumptions and open questions;
- task intent can be handed off cleanly.

## v0.3 Execution Cockpit

### Goal

Give the operator a strong control surface for active work.

### Included Screens

- task queue
- agent activity
- file explorer
- logs
- approvals
- patch preview
- test result view

### Exit Criteria

- task state is visible at a glance;
- logs and output are easy to inspect;
- risky actions route to approvals;
- changes can be reviewed before acceptance.

## v0.4 Runner, Cloud, And Packages

### Goal

Connect the local execution layer to operational infrastructure.

### Included Screens

- runner status
- runner execution view
- sandbox state
- diagnostics
- health checks
- cloud connection status
- sync status
- package registry
- package detail
- package install / enable / disable

### Exit Criteria

- the runner state is visible and understandable;
- cloud sync is explicit;
- package operations are governed and auditable;
- operational state is not hidden behind generic settings.

## v0.5 Governance, Billing, And Hardening

### Goal

Make the product safe enough for serious use and commercial operations.

### Included Screens

- billing / subscription
- license / entitlement
- settings / permissions
- project lifecycle controls
- approval history
- audit-friendly summaries

### Exit Criteria

- entitlements are visible;
- settings are structured and not overloaded;
- approvals and governance are easy to review;
- destructive actions require confirmation and logging.

## v1.0 Launch Readiness

### Goal

Ship the full MVP experience with coherent polish.

### Exit Criteria

- all MVP screens exist;
- all major flows are connected;
- empty, loading, error, offline, and permission states exist;
- accessibility checks are in place;
- responsive behavior is complete;
- the UI matches the intended KVDOS product positioning.

## Version Notes

- Versions are product-UI versions, not repository release tags.
- A screen can appear in an early version as read-only and become editable in a later version.
- Old UI evo notes should map into these version buckets so the planning history stays searchable.
