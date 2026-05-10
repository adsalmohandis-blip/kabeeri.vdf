# Roadmap

## Current State Note

This roadmap contains historical/staged planning plus later roadmap tracks. The repository now includes more implemented local CLI and planning assets than some older checklist rows imply. Phase 04 stabilizes wording and points readers to [docs/production/V1_CURRENT_STATE.md](docs/production/V1_CURRENT_STATE.md) for the current v1 snapshot without rewriting roadmap history.

## Phase 0 — Foundation Docs ✅

- ✅ Define vision, architecture, lifecycle, and governance.
- ✅ Publish the first GitHub repository.
- ✅ Add Arabic and English documentation.
- ✅ Add the first Standard generator JSON.

**Status:** Completed (v0.1.0)

---

## Phase 1 — Delivery Modes & Project Intake (v1.1.0 - v1.2.0) ✅

### v1.1.0 — Delivery Modes Foundation ✅
- ✅ Define Structured Delivery mode (comprehensive upfront planning)
- ✅ Define Agile Delivery mode (iterative sprint-based)
- ✅ Create delivery modes selection guide
- ✅ Establish that v1.0.0 is the foundation for both modes
- ✅ Document mode-specific terminology

**Completed features:**
- [delivery_modes/README.md](delivery_modes/README.md) — Overview of both modes
- [delivery_modes/SELECTION_GUIDE.md](delivery_modes/SELECTION_GUIDE.md) — How to choose
- [delivery_modes/STRUCTURED_DELIVERY.md](delivery_modes/STRUCTURED_DELIVERY.md) — Structured mode guide
- [agile_delivery/README.md](agile_delivery/README.md) — Agile mode guide

### v1.2.0 — Project Intake & Adoption ✅
- ✅ Define new project initialization
- ✅ Define existing Kabeeri project upgrades
- ✅ Define non-Kabeeri project adoption
- ✅ Create setup rules and workflows

**Completed features:**
- [project_intake/README.md](project_intake/README.md) — Project intake overview
- [project_intake/NEW_PROJECT_RULES.md](project_intake/NEW_PROJECT_RULES.md) — New project setup
- [project_intake/EXISTING_PROJECT_ADOPTION.md](project_intake/EXISTING_PROJECT_ADOPTION.md) — Adoption workflow

---

## Phase 2 — Task Governance & Agile Core (v1.3.0 - v1.5.0) ✅

### v1.3.0 — Task Governance & Provenance ✅
- ✅ Create strict task creation governance rules
- ✅ Define task intake template
- ✅ Define Definition of Ready (DoR) criteria
- ✅ Establish task source tracing and provenance
- ✅ Support both Structured and Agile modes

**Completed features:**
- [knowledge/task_tracking/README.md](knowledge/task_tracking/README.md) — Unified task tracking and governance overview
- [knowledge/task_tracking/TASK_GOVERNANCE.md](knowledge/task_tracking/TASK_GOVERNANCE.md) — Task governance policy
- [knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md](knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md) — Task intake template
- [knowledge/task_tracking/TASK_PROVENANCE_SCHEMA.json](knowledge/task_tracking/TASK_PROVENANCE_SCHEMA.json) — Source tracing schema
- [knowledge/task_tracking/task.schema.json](knowledge/task_tracking/task.schema.json) — Runtime task schema
- [knowledge/task_tracking/TASK_REVIEW_CHECKLIST.md](knowledge/task_tracking/TASK_REVIEW_CHECKLIST.md) — Review checklist

### v1.4.0 — Agile Delivery Core ✅
- ✅ Create product backlog management
- ✅ Define user stories and epics
- ✅ Create sprint planning & review templates
- ✅ Establish sprint cost metadata
- ✅ Integrate with task governance

**Completed features:**
- [agile_delivery/SPRINT_AND_BACKLOG_CORE.md](agile_delivery/SPRINT_AND_BACKLOG_CORE.md) — Backlog & sprint core

### v1.5.0 — AI Usage Accounting ✅
- ✅ Create AI usage folder specification
- ✅ Define AI usage event schema
- ✅ Create pricing rules schema
- ✅ Define untracked AI usage rules
- ✅ Enable cost forecasting

**Completed features:**
- [ai_cost_control/README.md](ai_cost_control/README.md) — AI usage accounting and cost control

---

## Phase 3 — Skeleton Generators (v1.6.0)

- [ ] Add Lite generator with full workstreams
- [ ] Add Standard generator with all 9 workstreams
- [ ] Add Enterprise generator with extended workstreams
- [ ] Add questionnaire files for all folders
- [ ] Add architecture guide templates
- [ ] Add validation schemas

---

## Phase 4 — Prompt Packs (v1.7.0)

- [ ] Laravel prompt pack
- [ ] Next.js prompt pack
- [ ] .NET prompt pack
- [ ] Django prompt pack
- [ ] WordPress prompt pack
- [ ] Vue/Nuxt prompt pack
- [ ] Generic web app prompt pack

---

## Phase 5 — CLI Tool (v2.0.0)

- [ ] `kvdf init --profile standard --mode structured`
- [ ] `kvdf validate`
- [ ] `kvdf questionnaire list`
- [ ] `kvdf generate docs`
- [ ] `kvdf tasks next`
- [ ] `kvdf sprint plan`
- [ ] `kvdf cost report`

---

## Phase 6 — Platform Integration Track (v2.1.0 - v3.0.0)

The v3.0.0 plan now focuses on making Kabeeri operable as a local platform through `.kabeeri/` state, GitHub CLI sync, VS Code integration, live dashboards, Owner-only verification, and AI token cost analytics.

**Planning files:**
- [platform_integration/README.md](platform_integration/README.md)
- [platform_integration/V3_0_UPDATED_PLAN.md](platform_integration/V3_0_UPDATED_PLAN.md)
- [platform_integration/milestones_and_issues.v3.0.0.json](platform_integration/milestones_and_issues.v3.0.0.json)

### v2.1.0 — Local Project State and Source of Truth
- [ ] Define `.kabeeri/` canonical state structure
- [ ] Define dashboard state files
- [ ] Define project audit log

### v2.2.0 — GitHub CLI Integration
- [ ] Define GitHub sync configuration
- [ ] Define task-to-issue mapping
- [ ] Define GitHub issue and milestone CLI commands

### v2.3.0 — VS Code Integration Foundation
- [ ] Define VS Code extension architecture
- [ ] Define command palette plan
- [ ] Define editor-agnostic integration rules

### v2.4.0 — Live Technical Dashboard
- [ ] Define technical dashboard sections
- [ ] Define backend/frontend/admin/database/docs/testing progress model
- [ ] Define live developer progress model

### v2.5.0 — Business Dashboard
- [ ] Define business dashboard sections
- [ ] Define feature readiness model
- [ ] Define onboarding and user journey model

### v2.6.0 — Owner-Only Task Verification
- [ ] Define Owner-only final verify rules
- [ ] Define dashboard verify action
- [ ] Define CLI verify/reject/reopen commands

### v2.7.0 — AI Token Cost Dashboard
- [ ] Define token usage dashboard sections
- [ ] Define configurable token cost calculator
- [ ] Define workstream token breakdown
- [ ] Define developer token efficiency analysis

### v2.8.0 — Agile Sprint Cost Analytics
- [ ] Define sprint token cost model
- [ ] Define sprint cost dashboard view
- [ ] Define sprint pricing notes

### v3.0.0 — Stable Platform Integration Release
- [ ] Prepare integration release checklist
- [ ] Prepare release notes
- [ ] Publish v3.0.0 GitHub release

---

## Phase 7 — Multi-AI Governance Track (v3.1.0 - v4.0.0)

The v4.0.0 plan adds governance for multiple human developers and AI Developers on one project through identity, roles, single Owner authority, access tokens, locks, budgets, output contracts, and audit reports.

**Planning files:**
- [multi_ai_governance/README.md](multi_ai_governance/README.md)
- [multi_ai_governance/V4_0_UPDATED_PLAN.md](multi_ai_governance/V4_0_UPDATED_PLAN.md)
- [multi_ai_governance/milestones_and_issues.v4.0.0.json](multi_ai_governance/milestones_and_issues.v4.0.0.json)

### v3.1.0 — Collaboration Identity and Role Model
- [ ] Define collaboration identity model
- [ ] Define role and permission model
- [ ] Define workstream ownership rules

### v3.2.0 — Single Owner and Owner Transfer
- [ ] Enforce single Owner rule
- [ ] Define owner transfer token lifecycle
- [ ] Define owner transfer audit log rules

### v3.3.0 — Task Access Tokens Lifecycle
- [ ] Define task access token schema
- [ ] Define access token lifecycle rules
- [ ] Define token issue/revoke/list CLI commands

### v3.4.0 — Locks and Conflict Prevention
- [ ] Define task/file/folder/workstream lock types
- [ ] Define conflict detection rules
- [ ] Define lock dashboard view

### v3.5.0 — Assignment and Execution Governance
- [ ] Define multi-developer assignment rules
- [ ] Define backend/frontend/admin frontend task separation rules
- [ ] Define reviewer independence rule

### v3.6.0 — AI Developer Sessions and Output Contracts
- [ ] Define AI Developer session schema
- [ ] Define AI output contract rules
- [ ] Define random prompt prevention rules

### v3.7.0 — Token Budgets and Cost Controls
- [ ] Define task token budget fields
- [ ] Define budget warning and approval rules
- [ ] Define cost control dashboard metrics

### v3.8.0 — Owner Verify, Token Revocation, and Audit
- [ ] Link Owner verify to token revocation
- [ ] Define Owner rejection and reissue rules
- [ ] Define final verification audit report

### v4.0.0 — Stable Multi-AI Governance Release
- [ ] Prepare governance release checklist
- [ ] Run multi-ai collaboration scenario review
- [ ] Prepare release notes
- [ ] Publish v4.0.0 GitHub release

---

## Current Status

**Latest Release:** v1.5.0 (May 2026)

**Completed:**
- ✅ Foundation documentation
- ✅ Delivery modes (Structured & Agile)
- ✅ Project intake workflows
- ✅ Task governance & provenance
- ✅ Agile sprint core
- ✅ AI usage accounting

**Next:**
- Skeleton generators (Phase 3)
- Prompt packs (Phase 4)
- CLI tool (Phase 5)

---

## Version Release Schedule

The table below is retained as a planning schedule. `TBD` rows should be read as timeline/status placeholders unless a dedicated phase report marks the area complete.

| Version | Phase | Timeline | Status |
|---------|-------|----------|--------|
| 0.1.0 | Foundation Docs | Jan 2026 | ✅ Released |
| 1.1.0 | Delivery Modes | May 2026 | ✅ Released |
| 1.2.0 | Project Intake | May 2026 | ✅ Released |
| 1.3.0 | Task Governance | May 2026 | ✅ Released |
| 1.4.0 | Agile Core | May 2026 | ✅ Released |
| 1.5.0 | AI Accounting | May 2026 | ✅ Released |
| 1.6.0 | Generators | TBD | ⏳ Planned |
| 1.7.0 | Prompt Packs | TBD | ⏳ Planned |
| 2.0.0 | CLI Tool | TBD | ⏳ Planned |
| 2.1.0 | Local Project State | TBD | ⏳ Planned |
| 2.2.0 | GitHub CLI Integration | TBD | ⏳ Planned |
| 2.3.0 | VS Code Integration Foundation | TBD | ⏳ Planned |
| 2.4.0 | Live Technical Dashboard | TBD | ⏳ Planned |
| 2.5.0 | Business Dashboard | TBD | ⏳ Planned |
| 2.6.0 | Owner-Only Task Verification | TBD | ⏳ Planned |
| 2.7.0 | AI Token Cost Dashboard | TBD | ⏳ Planned |
| 2.8.0 | Agile Sprint Cost Analytics | TBD | ⏳ Planned |
| 3.0.0 | Stable Platform Integration | TBD | ⏳ Planned |
| 3.1.0 | Collaboration Identity and Role Model | TBD | ⏳ Planned |
| 3.2.0 | Single Owner and Owner Transfer | TBD | ⏳ Planned |
| 3.3.0 | Task Access Tokens Lifecycle | TBD | ⏳ Planned |
| 3.4.0 | Locks and Conflict Prevention | TBD | ⏳ Planned |
| 3.5.0 | Assignment and Execution Governance | TBD | ⏳ Planned |
| 3.6.0 | AI Developer Sessions and Output Contracts | TBD | ⏳ Planned |
| 3.7.0 | Token Budgets and Cost Controls | TBD | ⏳ Planned |
| 3.8.0 | Owner Verify, Token Revocation, and Audit | TBD | ⏳ Planned |
| 4.0.0 | Stable Multi-AI Governance | TBD | ⏳ Planned |
