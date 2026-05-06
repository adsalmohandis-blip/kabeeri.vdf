# Roadmap

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
- [task_governance/README.md](task_governance/README.md) — Task governance overview
- [task_governance/TASK_CREATION_RULES.md](task_governance/TASK_CREATION_RULES.md) — Governance rules
- [task_governance/TASK_INTAKE_TEMPLATE.md](task_governance/TASK_INTAKE_TEMPLATE.md) — Task template
- [task_governance/TASK_DEFINITION_OF_READY.md](task_governance/TASK_DEFINITION_OF_READY.md) — DoR criteria
- [task_governance/TASK_SOURCE_RULES.md](task_governance/TASK_SOURCE_RULES.md) — Source tracing

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
- [ai_usage/README.md](ai_usage/README.md) — AI usage accounting foundation

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

## Phase 6 — VS Code Extension (v2.1.0)

- [ ] Side panel for questionnaires
- [ ] Generate prompts from answered documents
- [ ] Task tracking view
- [ ] Acceptance checklist view
- [ ] AI handoff export
- [ ] Sprint dashboard
- [ ] Cost tracking dashboard

---

## Phase 7 — Dashboard & Analytics (v2.2.0)

- [ ] Web dashboard for project overview
- [ ] Real-time task tracking
- [ ] Cost analytics and forecasting
- [ ] Team velocity tracking
- [ ] Feature roadmap visualization
- [ ] Export reports (PDF, CSV)

---

## Phase 8 — Desktop App (v2.3.0)

- [ ] Local project manager
- [ ] Offline-first templates
- [ ] Guided wizard for non-technical users
- [ ] Export to ZIP and GitHub
- [ ] Automatic backups

---

## Phase 9 — SaaS / Team Workspace (v3.0.0)

- [ ] Team projects
- [ ] Shared questionnaires
- [ ] AI provider integrations
- [ ] Review workflows
- [ ] Template marketplace
- [ ] Permissioned team collaboration
- [ ] Multi-project management

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
| 2.1.0 | VS Code Ext | TBD | ⏳ Planned |
| 2.2.0 | Dashboard | TBD | ⏳ Planned |
| 2.3.0 | Desktop App | TBD | ⏳ Planned |
| 3.0.0 | SaaS | TBD | ⏳ Planned |
