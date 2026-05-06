# Changelog

## [Unreleased] — v3.0.0 Platform Integration Plan

### Added

- Added the v3.0.0 updated planning track for GitHub CLI, VS Code, live dashboards, Owner Verify, and AI token cost analytics.
- Added `platform_integration/` as the documentation home for the 9 milestones and 28 planned GitHub issues.
- Added machine-readable GitHub planning source at `platform_integration/milestones_and_issues.v3.0.0.json`.
- Added local `.kabeeri/` source-of-truth specification, dashboard state rules, GitHub sync rules, VS Code integration rules, owner-only verification rules, token cost dashboard rules, and sprint cost analytics rules.

### Changed

- Updated the roadmap so v2.1.0 through v3.0.0 now represent the Stable Platform Integration path instead of a generic future app/SaaS track.

---

## [1.5.0] — AI Usage Accounting Foundation

**Released:** May 2026

### Added

- **AI Usage Accounting System**
  - New `.kabeeri/ai_usage/` folder specification
  - AI usage event schema (`usage_events.jsonl`)
  - Pricing rules schema (user-configurable, not hard-coded)
  - Cost breakdown and sprint cost tracking
  - Untracked AI usage rules and monitoring

- **AI Token Tracking**
  - Per-task token estimation and tracking
  - Per-sprint cost accumulation
  - Provider-agnostic token counting
  - Rework cost separation from clean work
  - Budget forecasting capabilities

### Key Features

- Enable AI cost accounting from day 1
- Track Structured and Agile token usage uniformly
- Support for untracked exploration/learning budget
- Foundation for future dashboards and analytics

### Files Added

- [ai_usage/README.md](ai_usage/README.md)

---

## [1.4.0] — Agile Delivery Core and Sprint Cost Metadata

**Released:** May 2026

### Added

- **Agile Delivery Foundation**
  - Product backlog management concepts
  - Epic and user story definitions
  - Sprint planning and review processes
  - Sprint-based task execution
  - Velocity tracking and capacity planning

- **Sprint Metrics**
  - Story points for estimation
  - Velocity tracking (points per sprint)
  - Burndown concepts
  - Defect rate and rework metrics
  - Cost per point calculation

- **Integration with Task Governance**
  - User stories follow task governance rules
  - Acceptance criteria enforcement in stories
  - Source tracing for Agile mode
  - Definition of Ready for sprint tasks

### Key Features

- Agile mode fully operable with sprints
- Backlog prioritization (MoSCoW method)
- Sprint ceremonies documented (planning, standup, review, retro)
- Cost tracking per sprint and per story

### Files Added

- [agile_delivery/SPRINT_AND_BACKLOG_CORE.md](agile_delivery/SPRINT_AND_BACKLOG_CORE.md)

---

## [1.3.0] — Task Creation Governance and Provenance

**Released:** May 2026

### Added

- **Strict Task Governance Rules**
  - Required fields for every task
  - Task validation rules
  - Roles and permissions matrix
  - Task state machine and transitions
  - Prohibited task patterns

- **Task Definition of Ready (DoR)**
  - Comprehensive readiness checklist
  - Pre-development requirements
  - Blocker identification
  - Type-specific DoR (feature/bug/tech-debt/documentation/security)

- **Task Provenance & Source Tracing**
  - 12 valid source types (questionnaire, bug_report, user_story, etc.)
  - 5 source modes (direct, indirect, derived, suggested, required)
  - Provenance chain documentation
  - Source validation rules
  - Tracing tasks back to original decisions

### Key Features

- Every task must have a source (no random tasks)
- Every task must be "ready" before execution
- Clear governance prevents task chaos
- Applies to both Structured and Agile modes
- AI-suggested tasks require approval before execution

### Files Added

- [task_governance/README.md](task_governance/README.md)
- [task_governance/TASK_CREATION_RULES.md](task_governance/TASK_CREATION_RULES.md)
- [task_governance/TASK_INTAKE_TEMPLATE.md](task_governance/TASK_INTAKE_TEMPLATE.md)
- [task_governance/TASK_DEFINITION_OF_READY.md](task_governance/TASK_DEFINITION_OF_READY.md)
- [task_governance/TASK_SOURCE_RULES.md](task_governance/TASK_SOURCE_RULES.md)

---

## [1.2.0] — Project Intake and Existing System Adoption

**Released:** May 2026

### Added

- **Three Project Intake Modes**
  - New Project Initialization
  - Existing Kabeeri Project Upgrade
  - Non-Kabeeri Project Adoption

- **New Project Initialization**
  - Step-by-step setup rules
  - Project folder structure scaffolding
  - Initial metadata files creation
  - First git commit guidelines
  - Pre-initialization checklist

- **Existing Kabeeri Project Upgrade**
  - Compatibility report generation
  - Version upgrade process
  - Metadata updates
  - Verification steps
  - Rollback planning

- **Non-Kabeeri Project Adoption**
  - Project scanning and analysis
  - Technology stack detection
  - Feature mapping to workstreams
  - Adoption task generation
  - Team training guides
  - Phase-based adoption (scan, setup, training, execution)

### Key Features

- Supports three different entry points into Kabeeri
- Existing code never modified during adoption
- Clear workflows for each mode
- Comprehensive documentation for each stage

### Files Added

- [project_intake/README.md](project_intake/README.md)
- [project_intake/NEW_PROJECT_RULES.md](project_intake/NEW_PROJECT_RULES.md)
- [project_intake/EXISTING_PROJECT_ADOPTION.md](project_intake/EXISTING_PROJECT_ADOPTION.md)

---

## [1.1.0] — Delivery Modes Foundation

**Released:** May 2026

### Added

- **Two Official Delivery Modes**
  - Structured Delivery (comprehensive upfront planning)
  - Agile Delivery (iterative sprint-based)
  - Both built on v1.0.0 foundation
  - Neither replaces the other

- **Structured Delivery Mode**
  - Full workflow from questionnaires to documentation to implementation
  - 9-layer architecture integrated
  - Phase-based execution
  - Complete planning before coding
  - Extension layer for future features

- **Agile Delivery Mode**
  - Iterative sprint-based approach
  - Product backlog concept
  - User story and epic breakdown
  - Continuous stakeholder feedback
  - Adaptive planning

- **Mode Selection Guide**
  - Decision matrix for choosing mode
  - Detailed scenarios for each mode
  - Common misconceptions addressed
  - When to use each mode
  - Can't (or shouldn't) mix mid-project

### Key Features

- v1.0.0 is NOT "Waterfall-only" — it's the foundation for both modes
- Structured and Agile are equal first-class citizens
- Both modes share task governance, project intake, etc.
- Clear guidance on mode selection
- Terminology defined for each mode

### Files Added

- [delivery_modes/README.md](delivery_modes/README.md)
- [delivery_modes/SELECTION_GUIDE.md](delivery_modes/SELECTION_GUIDE.md)
- [delivery_modes/STRUCTURED_DELIVERY.md](delivery_modes/STRUCTURED_DELIVERY.md)
- [agile_delivery/README.md](agile_delivery/README.md)

---

## [0.1.0] — Initial Documentation Release

**Released:** January 2026

### Added

- Introduced Kabeeri Vibe Developer Framework concept
- Added Arabic and English documentation
- Added repository structure proposal
- Added governance, contributing, security, and roadmap files
- Added initial schemas and example generator placeholders
- Project profile definitions (Lite, Standard, Enterprise)
- Core workflow documentation
- Foundation layer architecture

### Files Added

- README.md (English)
- README_AR.md (Arabic)
- ROADMAP.md
- GOVERNANCE.md
- CONTRIBUTING.md
- SECURITY.md
- CODE_OF_CONDUCT.md
- CHANGELOG.md (this file)
