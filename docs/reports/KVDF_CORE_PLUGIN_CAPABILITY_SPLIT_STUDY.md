# KVDF Core / Plugin Capability Split Study

## Purpose

This study defines how KVDF capabilities should be separated into:

- `kabeeri-core`
- `plugins/kvdf-dev`
- `workspaces/apps/<app-slug>/`

The goal is to make the system fully controllable, removable, and
track-aware, while preventing mixed owner/developer surfaces from leaking into
the wrong part of the platform.

This report is the study source for the `Capability Partition Matrix`
priority in Evolution.

## Study Inputs

The split below was derived from the current KVDF architecture, including:

- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md`
- `knowledge/governance/EVOLUTION_STEWARD.md`
- `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`
- `knowledge/governance/WORKSTREAM_GOVERNANCE.md`
- `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`
- `src/cli/ui.js`
- `src/cli/services/evolution.js`
- `knowledge/wordpress/WORDPRESS_PLUGIN_DEVELOPMENT.md`

The current architecture already suggests a three-way split:

- shared runtime core
- removable owner bundle
- isolated developer app workspaces

## Target Structure

```text
kabeeri-core/
plugins/
  kvdf-dev/
workspaces/
  apps/
    <app-slug>/
      .kabeeri/
      src/
      tests/
      docs/
```

## Core Principle

Every capability must have one clear home.

If a capability can only exist by mixing owner and developer behavior, it must
be broken into smaller parts until each part has a single owner.

## Ownership Buckets

### 1. kabeeri-core

The core owns the platform primitives that both tracks need.

Core includes:

- CLI bootstrap and command registration
- session detection and track routing
- guard and boundary enforcement
- conflict scanning
- validation and schema checks
- workspace discovery
- task engine primitives
- temp queue orchestration
- trash retention and restore primitives
- scheduler primitives
- multi-AI coordination primitives
- live dashboard state
- runtime reports
- docs shell and shared documentation data loading
- plugin loader and plugin enable/disable metadata

Core must not contain:

- owner-only workflows
- owner-only docs or prompts
- developer app source code
- hard-coded mixed routing tables
- plugin-specific business logic

### 2. plugins/kvdf-dev

The owner bundle owns the Kabeeri platform-development surface.

Owner-track includes:

- `evolution`
- owner-only priorities and roadmap management
- owner docs token gating
- owner session lifecycle rules
- owner-specific governance and release behavior
- owner-only prompts and documentation pages
- owner-specific multi-AI policies
- owner-specific command aliases and help text

Owner-track must be removable.

If the plugin is disabled:

- owner commands disappear or fail closed
- owner docs are hidden
- owner-specific routing is blocked
- developer mode continues to work

### 3. workspaces/apps/<app-slug>/

Developer app workspaces own the customer-facing project surface.

App workspaces include:

- app-local `.kabeeri/`
- app source code
- app tests
- app docs
- app task records
- app temp queues
- app blueprints and questionnaires
- app capture history

App workspaces must remain isolated from:

- `kabeeri-core`
- owner plugin files
- owner governance files

## Capability Classification Rules

1. If it is required for both tracks to run safely, it belongs in core.
2. If it changes Kabeeri itself, it belongs in the owner plugin.
3. If it belongs to a customer application, it belongs in the app workspace.
4. If a capability crosses boundaries, split it into:
   - a core primitive
   - a plugin wrapper
   - or an app-side adapter
5. If the boundary is unclear, keep it out of implementation until it can be
   classified cleanly.

## Recommended Capability Buckets

### Core Capabilities

- entry routing
- session resume
- guard scanning
- conflict detection
- workspace detection
- runtime schema validation
- task storage and retrieval
- temp queue mechanics
- trash retention mechanics
- scheduler mechanics
- live dashboard state
- reports and traceability
- docs shell loading
- plugin registration and load control

### Owner Plugin Capabilities

- Evolution Steward
- framework priorities
- canonical framework roadmap
- owner docs token gate
- owner session auto-close
- owner-only CLI commands
- owner-only docs and reports
- owner-only governance rules
- owner-only AI coordination rules

### Developer App Capabilities

- vibe intake
- ask / capture flow
- blueprint generation
- questionnaire flow
- app temp execution
- app task tracker
- app-local prompts and docs
- app-local state and handoff

## Boundary Decisions

### Must Stay in Core

- `kvdf resume`
- `kvdf start`
- `kvdf entry`
- `kvdf guard`
- `kvdf conflict scan`
- `kvdf validate`
- shared task and session plumbing

### Must Move to Owner Plugin

- `kvdf evolution`
- owner docs access controls
- owner session rules
- owner-only roadmap and priorities
- owner-only plugin docs

### Must Stay in App Workspaces

- `kvdf vibe`
- `kvdf ask`
- `kvdf capture`
- app blueprints
- app questionnaires
- app task records

## Hard Exclusions

The following must not exist as mixed surfaces:

- owner commands living in developer help output
- developer app files living inside core
- owner-only docs exposed in developer docs pages
- app workspace state stored in owner plugin folders
- implicit path-based ownership with no explicit track boundary

## What Success Looks Like

The split is successful only when:

- every capability can be named and placed into one bucket
- every owner-only capability can be removed as a bundle
- every developer app capability can live in an app workspace
- core can start without the owner plugin
- docs and CLI agree on the same ownership model
- no capability appears in two places as a primary owner

## Suggested Implementation Order

1. Freeze the capability inventory.
2. Classify each capability into core, owner plugin, or app workspace.
3. Publish the matrix in docs and reports.
4. Update CLI routing and help surfaces.
5. Update plugin loader and state boundaries.
6. Validate with tests and conflict scans.

## Capability Partition Matrix

The authoritative machine-readable matrix is exposed through:

- `kvdf evolution partition`
- `kvdf evolution partition --json`

The matrix keeps three buckets aligned with the target structure:

- `kabeeri-core`
- `plugins/kvdf-dev`
- `workspaces/apps/<app-slug>`

The matrix is considered authoritative when:

- every current capability is assigned to exactly one bucket
- any cross-boundary capability is split into a core primitive plus a plugin or workspace wrapper
- load rules describe when a capability is available
- the docs reference, CLI surface, and runtime routing all agree on the same bucket

Boundary rules:

- core capabilities are loaded at bootstrap for every session
- owner plugin capabilities are loaded only when the framework-owner track is active and the owner bundle is enabled
- app workspace capabilities are loaded only when the workspace resolves to a developer app root and the app track is active

Use this matrix before adding new capabilities. If a capability cannot be assigned cleanly, split it first instead of mixing the layers.

## Plugin Loader Contract

The shared core exposes a loader surface so the owner bundle can be added or
removed without rewriting the CLI bootstrap.

Loader behavior:

- read manifests from `plugins/*/plugin.json`
- persist enable/disable overrides in `.kabeeri/plugins.json`
- report plugin state through `kvdf plugins status`
- enable or disable a bundle through `kvdf plugins enable|disable <plugin-id>`

The `kvdf-dev` bundle is the first removable bundle modeled by the loader.
Core must keep working if the bundle is disabled, and owner-only surfaces must
fail closed in that state.

## Notes For Future Implementation

- Treat this report as a contract, not just a brainstorming note.
- Use it to guide plugin extraction and workspace isolation.
- When a future capability is added, classify it before writing code.
- If a future capability needs both tracks, split it into two capabilities
  instead of mixing the layers.
