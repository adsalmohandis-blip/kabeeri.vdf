# KVDOS UIUX Master Plan

## Purpose

KVDOS needs a full product UI/UX layer, not just isolated screens.

This plan defines the interface system for:

- KVDOS Studio
- KVDOS Runner
- KVDOS Cloud
- shared approvals, audit, package, and settings surfaces

The goal is to keep the experience:

- local-first where possible;
- governed and reviewable;
- versioned and resumable;
- clear for operators, builders, and commercial users;
- consistent with the KVDOS technical spec and Kabeeri design governance.

## Design Principles

1. Every screen has a primary job.
1. The app should always show the current project, current phase, and current risk.
1. Discovery should reduce ambiguity instead of hiding it.
1. Blueprints and specs should be visible before execution.
1. Execution surfaces should expose status, errors, attempts, and next action.
1. Approvals must be explicit, not implied.
1. Package and entitlement flows should be easy to inspect.
1. Every screen must support loading, empty, error, and permission states.
1. Responsive behavior must exist from the first version.
1. Accessibility and keyboard navigation are part of the default contract.

## Product Surface Map

### Shared Shell

- global navigation
- workspace switcher
- project switcher
- command/search palette
- notifications
- user menu
- risk / approval indicator
- sync / connectivity indicator

### Studio

- dashboard
- project dashboard
- discovery flow
- blueprint viewer
- spec viewer
- task queue
- agent activity
- file explorer
- logs
- approvals
- package registry
- package detail
- settings

### Runner

- runner status
- runner execution view
- sandbox state
- patch preview
- test result view
- diagnostics
- health check

### Cloud

- cloud connection status
- sync status
- project list
- package sync
- license / entitlement status
- billing overview
- account settings

## Screen Inventory

The KVDOS MVP includes all screens below:

- Studio dashboard
- Project dashboard
- Discovery flow
- Blueprint viewer
- Spec viewer
- Task queue
- Agent activity
- File explorer
- Logs
- Approvals
- Runner status
- Runner execution view
- Cloud sync / connection status
- Health / diagnostics
- Sandbox state
- Patch and test results
- Package registry
- Package install / enable / disable
- Project lifecycle controls
- Billing / subscription
- License / entitlement
- Settings / permissions

## Flow Model

### 1. Start

- open KVDOS
- authenticate or connect
- choose workspace
- see project list

### 2. Discover

- start discovery
- answer missing questions
- review assumptions
- validate scope

### 3. Plan

- inspect blueprint
- inspect spec
- review generated tasks
- review package needs

### 4. Execute

- send work to runner
- track agent activity
- inspect logs and files
- review patches and tests

### 5. Approve

- review risky actions
- approve package installs
- approve deployments
- capture audit trail

### 6. Ship And Maintain

- sync with cloud when enabled
- manage licenses and billing
- update packages
- monitor health
- handle regressions

## UX System Requirements

### Information Architecture

- project-first navigation
- clear separation between Studio, Runner, and Cloud
- consistent screen hierarchy
- visible state for current step and next action

### Visual System

- strong hierarchy
- dense but readable operational layout
- clear panel separation
- accessible contrast
- restrained but modern motion

### Content And Microcopy

- short labels for actions
- explicit status labels
- no vague approval text
- empty states must explain what to do next

### Governance

- risky actions require review
- package lifecycle actions are visible
- changes to project state should be tracked
- approvals should be easy to audit

### States

- loading
- empty
- error
- permission denied
- offline
- syncing
- pending approval
- executing
- completed

## Non-Negotiable Acceptance Criteria

- each MVP screen has a documented purpose;
- each screen has a primary action and a secondary action;
- every flow includes back navigation or cancel behavior;
- every destructive action has confirmation;
- every async flow has visible feedback;
- every data-heavy screen handles large states gracefully;
- every view works on desktop and tablet, with mobile fallbacks where appropriate;
- the UI aligns with the KVDOS spec and the Kabeeri design system.

## Implementation Sources

The UI/UX plan should be implemented using the existing design system references:

- `knowledge/design_system/ui_execution_kit/`
- `knowledge/design_system/ui_ux_reference/`
- `knowledge/design_system/component_composition_intelligence/`
- `knowledge/design_system/framework_adapter_intelligence/`
- `knowledge/design_system/ui_decision_intake/`
- `knowledge/design_system/project_ui_playbooks/`
- `knowledge/design_system/creative_variant_intelligence/`
- `knowledge/design_system/accessibility_inclusive_ui/`
- `knowledge/design_system/performance_web_vitals_ui/`
- `knowledge/design_system/content_microcopy_ux/`
- `knowledge/design_system/rtl_arabic_ui/` when RTL or Arabic is required

## Notes

This plan is intentionally implementation-aware but framework-neutral.
It can be translated into Figma, prompt packs, page specs, component
contracts, or actual code tasks depending on the delivery mode.
