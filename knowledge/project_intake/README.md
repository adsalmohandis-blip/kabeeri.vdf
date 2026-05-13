# Project Intake and Existing System Adoption

Phase 05 canonical intake files:

- [NEW_PROJECT.md](NEW_PROJECT.md)
- [EXISTING_KABEERI_PROJECT.md](EXISTING_KABEERI_PROJECT.md)
- [EXISTING_NON_KABEERI_PROJECT.md](EXISTING_NON_KABEERI_PROJECT.md)

**v1.2.0** defines how Kabeeri VDF handles three project scenarios:

1. **New Project** — Starting from scratch
2. **Existing Kabeeri Project** — Upgrading from older Kabeeri version
3. **Existing Non-Kabeeri Project** — Adopting Kabeeri into existing codebase

---

## Overview: Three Intake Modes

### Mode 1: New Project Initialization

**Scenario:** You have an idea, nothing built yet.

**Process:**
1. Choose delivery mode (Structured or Agile)
2. Choose project profile (Lite, Standard, Enterprise) or let `kvdf project profile route` infer it from the goal and current stack
3. Kabeeri scaffolds folder structure
4. Begin questionnaires/vision workshop
5. Start development

**Result:** Clean Kabeeri project from day 1, no migrations needed.

**Timeline:** Fastest path to development.

---

### Mode 2: Existing Kabeeri Project Upgrade

**Scenario:** You started with Kabeeri v0.9.0 or v1.0.0, now want to upgrade to v1.1.0+.

**Process:**
1. Run compatibility check
2. Generate compatibility report (what changed, what's compatible)
3. Backup existing project
4. Apply upgrade scripts (if any)
5. Update metadata files to new version
6. Verify all files still accessible

**Result:** Existing project structure preserved, enhanced with new v1.1+ features.

**Timeline:** 1-2 hours, minimal disruption.

---

### Mode 3: Non-Kabeeri Project Adoption

**Scenario:** You have an existing project built with Laravel, Next.js, Django, etc. (no Kabeeri). Now want to adopt Kabeeri to manage it.

**Process:**
1. Scan existing project structure
2. Detect technology stack and patterns
3. Create .kabeeri/` metadata folder
4. Generate adoption report
5. Create suggested tasks to bring project into compliance
6. Document current decisions

**Result:** Existing code untouched, Kabeeri management layer added on top.

**Timeline:** 2-4 hours for scan and adoption setup.

---

## Mode 1: New Project Initialization

### Prerequisites

- Delivery mode decided (Structured or Agile)
- Project profile chosen (Lite, Standard, Enterprise) or routed from the goal
- Team assembled
- Technology stack selected (optional, can refine after)

### New Project Initialization Process

#### Step 1: Project Setup

```bash
# Create project folder
mkdir my-project
cd my-project

# Initialize Kabeeri structure
# (In v1.3+, this will be: kvdf init --profile standard --mode structured)
```

#### Step 2: Folder Structure Created

Kabeeri scaffolds the core folder structure immediately:

The current `kvdf generate` flow also seeds bilingual architecture-guide markdown files in `00_SYSTEM_INDEX` and folder questionnaire markdown files in each governed folder so the intake phase starts with explicit prompts instead of blank directories.
`kvdf init` also seeds deterministic `.kabeeri/metadata/*` files and a delivery-mode record so the workspace starts from a predictable governed baseline.

**For Structured mode:**
```
my-project/
├── .kabeeri/
│   ├── project.json (version, profile, mode, created_date)
│   ├── delivery_mode.json (structured-specific config)
│   └── metadata/
├── 01_STRATEGY_AND_BUSINESS/
│   ├── questionnaire.md
│   ├── answers.md (user will fill)
│   └── README.md
├── 02_PRODUCT_DEFINITION/
│   ├── questionnaire.md
│   ├── answers.md
│   └── README.md
├── [additional workstreams...]
├── tasks/
│   └── task_template.md
├── acceptance_checklists/
│   └── [symlink to shared acceptance_checklists/]
└── .gitignore
```

**For Agile mode:**
```
my-project/
├── .kabeeri/
│   ├── project.json
│   ├── delivery_mode.json (agile-specific config)
│   └── metadata/
├── backlog.md (product backlog)
├── sprints/
│   └── sprint_template.md
├── stories/
│   └── user_story_template.md
├── tasks/
│   └── task_template.md
├── acceptance_checklists/
├── vision.md (product vision)
└── .gitignore
```

#### Step 3: Initialize .kabeeri/project.json

```json
{
  "project_name": "my-project",
  "version": "1.1.0",
  "profile": "standard",
  "delivery_mode": "structured",
  "created": "2026-05-07T10:30:00Z",
  "created_by": "user@example.com",
  "technology_stack": ["laravel", "vue", "postgresql"],
  "team_size": 3,
  "status": "initialized",
  "workstreams": []
}
```

#### Step 4: Create Metadata Folder

```
.kabeeri/metadata/
├── milestones.json (project phases/sprints)
├── team.json (who's on the team)
├── decisions.json (architecture decisions log)
└── changelog.json (what changed and when)
```

#### Step 5: Begin With Questionnaires (Structured) or Vision (Agile)

**Structured:**
- Open 01_STRATEGY_AND_BUSINESS/questionnaire.md
- Answer questions about business goals, user personas, success metrics
- Save answers in 01_STRATEGY_AND_BUSINESS/answers.md
- Repeat for each workstream

**Agile:**
- Conduct vision workshop (1-2 hours)
- Document product vision in vision.md
- Create initial product backlog in backlog.md
- Estimate backlog, prioritize top epics

#### Step 6: Generate Initial Documents

**Structured:**
- Collect all questionnaire answers
- Send to AI: "Generate 02_PRODUCT_DEFINITION.md based on these answers"
- Repeat for each workstream

**Agile:**
- Create first epic list from backlog
- Convert high-priority epics to user stories
- Break stories into tasks
- Plan Sprint 1

---

### New Project Rules

**DO:**
- ✅ Create empty .kabeeri folder immediately
- ✅ Scaffold workstream/epic/story structure immediately
- ✅ Use provided templates for questionnaires and stories
- ✅ Generate documents before writing code
- ✅ Plan all core features before building first feature

**DON'T:**
- ❌ Write application code before completing planning
- ❌ Skip questionnaires to "save time" (you'll lose time later)
- ❌ Modify core Kabeeri folder structure manually
- ❌ Create tasks without clear acceptance criteria
- ❌ Start coding before team alignment

---

## Mode 2: Existing Kabeeri Project Upgrade

### Prerequisites

- Existing Kabeeri project (v0.9.0, v1.0.0, etc.)
- Access to project repository
- Git for version control (backup before upgrade)

### Upgrade Process

#### Step 1: Assess Current Version

Check `project.json`:

```bash
cat .kabeeri/project.json
```

Example output:
```json
{
  "project_name": "existing-project",
  "version": "1.0.0",
  "profile": "standard"
}
```

#### Step 2: Generate Compatibility Report

Kabeeri should compare old version with new version:

```bash
# In v1.2.0+, would be:
# kvdf upgrade --from 1.0.0 --to 1.1.0 --report

# Manual process for now:
# 1. Check CHANGELOG for breaking changes
# 2. List what's new in v1.1.0
# 3. Identify any manual migration steps
```

**Sample compatibility report:**

```
Upgrade Report: v1.0.0 → v1.1.0
=====================================

Version: 1.0.0 → 1.1.0
Profile: standard (unchanged)
Status: Safe to upgrade

New Features:
- Delivery modes (existing projects treated as Structured)
- Project intake modes
- Task governance and provenance
- Agile delivery support (opt-in)

Breaking Changes: None

Files Added:
- .kabeeri/delivery_mode.json
- .kabeeri/metadata/decisions.json

Files Modified:
- .kabeeri/project.json (new fields: delivery_mode, intake_mode)
- task.schema.json (new validation fields)

Files Unchanged (existing):
- All questionnaires
- All generated documents
- All task files
- All acceptance checklists

Recommended Actions:
1. Backup project (git commit current state)
2. Add .kabeeri/delivery_mode.json with structured config
3. Update .kabeeri/project.json version to 1.1.0
4. Verify all existing files still load correctly
5. Test task creation with new schema

Estimated Time: 30-60 minutes
Risk Level: LOW
```

#### Step 3: Backup Existing Project

```bash
git commit -am "Pre-v1.1.0 upgrade backup"
git tag v1.0.0-production
```

#### Step 4: Apply Upgrade

**Automated (future):**
```bash
kvdf upgrade --from 1.0.0 --to 1.1.0 --apply
```

**Manual (now):**

1. Update `.kabeeri/project.json`:

```json
{
  "project_name": "existing-project",
  "version": "1.1.0",
  "profile": "standard",
  "delivery_mode": "structured",    // NEW
  "intake_mode": "kabeeri_upgrade", // NEW
  "created": "2024-01-15T...",
  "created_by": "...",
  "upgraded": "2026-05-07T...",     // NEW
  "upgraded_from": "1.0.0"          // NEW
}
```

2. Create `.kabeeri/delivery_mode.json`:

```json
{
  "mode": "structured",
  "enabled_agile_features": false,
  "version": "1.1.0"
}
```

3. Create `.kabeeri/metadata/decisions.json`:

```json
{
  "decisions": [
    {
      "id": "dec-001",
      "title": "Use structured delivery mode",
      "context": "Existing v1.0.0 project upgraded to v1.1.0",
      "decision": "Maintain structured mode from v1.0.0",
      "date": "2026-05-07",
      "status": "active"
    }
  ]
}
```

#### Step 5: Verify Upgrade

```bash
# Check all critical files exist
test -f .kabeeri/project.json && echo "✓ project.json"
test -f .kabeeri/delivery_mode.json && echo "✓ delivery_mode.json"
test -d 01_STRATEGY_AND_BUSINESS && echo "✓ Workstreams"
test -d tasks && echo "✓ Tasks folder"

# Load and validate project.json
# (verify version is 1.1.0)

# Verify task schema compatibility
# (old tasks should still validate)
```

#### Step 6: Test Workflow

1. Create new task following v1.1.0 task schema
2. Verify task validates
3. Verify old tasks still work
4. Make a small commit documenting upgrade

### Upgrade Rules

**DO:**
- ✅ Backup before upgrade
- ✅ Test after upgrade
- ✅ Read compatibility report
- ✅ Update project.json version
- ✅ Document the upgrade in git

**DON'T:**
- ❌ Skip backup
- ❌ Manually modify .kabeeri folder structure
- ❌ Mix old and new schema versions
- ❌ Delete old questionnaire answers
- ❌ Interrupt upgrade process mid-way

---

## Mode 3: Non-Kabeeri Project Adoption

### Prerequisites

- Existing project with mature codebase
- Clear understanding of project structure and technology stack
- Access to codebase
- Git for tracking adoption changes

### Adoption Process

#### Step 1: Scan Existing Project

Kabeeri analyzes the existing codebase:

**What Kabeeri scans:**
- Directory structure
- Technology stack (framework, language, ORM, etc.)
- File naming patterns
- Git history (optional, to understand decisions)
- README and documentation (if exists)
- Configuration files (package.json, requirements.txt, composer.json, etc.)

**Output: Scan Report**

```
Project Scan Report
===================

Project Name: existing-saas
Detected Stack:
- Framework: Next.js 14
- Database: PostgreSQL
- ORM: Prisma
- Frontend: React 18, TailwindCSS
- Backend: Next.js API routes
- Auth: NextAuth.js

Folder Structure Detected:
├── src/
│   ├── pages/ (10 routes)
│   ├── components/ (45 components)
│   ├── lib/ (utility functions)
│   └── styles/ (global styles)
├── prisma/
│   └── schema.prisma (12 models)
├── tests/
└── public/

Current Status:
- Latest commit: 2026-05-05
- Git history: ~150 commits
- Test coverage: 65%
- Open issues: 23

Kabeeri Readiness:
- Has clear architecture: YES
- Has documentation: PARTIAL
- Has tests: YES
- Has deployment process: YES

Recommendation:
✓ Ready for Kabeeri adoption
Estimated effort: 3-4 hours
Risk level: LOW

Next Steps:
1. Create .kabeeri/ folder
2. Document current decisions
3. Map existing features to Kabeeri tasks
4. Create adoption task list
```

#### Step 2: Create .kabeeri Folder

```bash
mkdir -p .kabeeri/metadata
```

#### Step 3: Generate Adoption Metadata

Create `.kabeeri/project.json`:

```json
{
  "project_name": "existing-saas",
  "version": "1.1.0",
  "profile": "standard",
  "delivery_mode": "structured",
  "intake_mode": "non_kabeeri_adoption",
  "adopted": "2026-05-07T12:00:00Z",
  "adopted_by": "user@example.com",
  "technology_stack": ["nextjs", "postgresql", "prisma", "nextauth"],
  "team_size": 5,
  "status": "adopted",
  "adoption_report": {
    "scan_date": "2026-05-07",
    "codebase_age_months": 14,
    "estimated_features": 8,
    "current_issues": 23,
    "adoption_effort_hours": 4,
    "risk_level": "low"
  }
}
```

#### Step 4: Document Current Architecture Decisions

Create `.kabeeri/metadata/decisions.json`:

```json
{
  "decisions": [
    {
      "id": "dec-001",
      "title": "Use Next.js for fullstack framework",
      "context": "Team familiar with React, needed fullstack solution",
      "decision": "Next.js 14 with API routes",
      "date": "2024-01-01",
      "status": "active",
      "source": "adoption_scan"
    },
    {
      "id": "dec-002",
      "title": "Use Prisma as ORM",
      "context": "Database abstraction, type safety, migrations",
      "decision": "Prisma with PostgreSQL",
      "date": "2024-01-15",
      "status": "active",
      "source": "adoption_scan"
    }
  ]
}
```

#### Step 5: Map Existing Features to Kabeeri Structure

Create mapping document:

```
Existing Project Feature → Kabeeri Workstream Mapping
======================================================

Current Features in Production:
1. User authentication & profiles → 04_CORE_FEATURES/auth
2. Project management (CRUD) → 04_CORE_FEATURES/project_mgmt
3. Collaboration/sharing → 04_CORE_FEATURES/collaboration
4. Reporting/analytics → 04_CORE_FEATURES/reporting

Current Planned Features:
1. Mobile app support → 05_EXTENSION/mobile
2. Real-time notifications → 05_EXTENSION/realtime
3. AI-powered recommendations → 05_EXTENSION/ai_features

Current Issues:
- Bug: Profile page slow on large user lists → TASK-001
- Feature: Search needs improvement → TASK-002
- Tech debt: Tests need refactoring → TASK-003

Current Workstreams (Partial):
✓ Defined: Architecture (implicit in code)
✗ Missing: Product definition document
✗ Missing: API documentation
✗ Missing: Infrastructure-as-code docs
✗ Missing: Security audit findings
```

#### Step 6: Generate Adoption Task List

Create `.kabeeri/metadata/adoption_tasks.json`:

```json
{
  "adoption_phase": "phase-1",
  "tasks": [
    {
      "id": "adopt-001",
      "title": "Document current architecture decisions",
      "workstream": "03_ARCHITECTURE_AND_DESIGN",
      "type": "documentation",
      "priority": "high",
      "status": "pending",
      "source": "adoption_scan",
      "description": "Extract architectural decisions from code and git history"
    },
    {
      "id": "adopt-002",
      "title": "Create API documentation",
      "workstream": "06_INTEGRATIONS_AND_APIS",
      "type": "documentation",
      "priority": "high",
      "status": "pending",
      "source": "adoption_scan"
    },
    {
      "id": "adopt-003",
      "title": "Create database schema documentation",
      "workstream": "05_DATA_AND_DATABASE",
      "type": "documentation",
      "priority": "high",
      "status": "pending",
      "source": "adoption_scan"
    },
    {
      "id": "bug-001",
      "title": "Fix slow profile page query",
      "workstream": "04_CORE_FEATURES",
      "type": "bug",
      "priority": "medium",
      "status": "pending",
      "source": "adoption_scan"
    },
    {
      "id": "feat-001",
      "title": "Improve search functionality",
      "workstream": "04_CORE_FEATURES",
      "type": "feature",
      "priority": "medium",
      "status": "pending",
      "source": "adoption_scan"
    }
  ]
}
```

#### Step 7: Plan Adoption Workflow

**Phase 1 (Week 1):** Documentation
- [ ] Document architecture decisions
- [ ] Create API documentation
- [ ] Create database schema documentation
- [ ] Document infrastructure setup

**Phase 2 (Week 2):** Backlog Conversion
- [ ] Review existing issues → map to Kabeeri tasks
- [ ] Prioritize adoption tasks vs new features
- [ ] Team training on Kabeeri workflow

**Phase 3 (Week 3+):** Ongoing Integration
- [ ] All new features follow Kabeeri task workflow
- [ ] Existing codebase remains unchanged
- [ ] Adoption layer adds governance on top

#### Step 8: Set Up Kabeeri Questionnaires

For adoption projects, questionnaires should focus on documenting existing decisions, not planning from scratch.

**Adoption questionnaire focuses:**
- Existing architecture (not planned)
- Current team structure (not idealized)
- Production constraints (not theoretical)
- Known issues and tech debt (not future work)

---

### Adoption Rules

**DO:**
- ✅ Scan thoroughly before adoption
- ✅ Document existing decisions
- ✅ Map features to Kabeeri structure
- ✅ Create adoption task list
- ✅ Get team buy-in before adoption
- ✅ Keep existing code untouched initially

**DON'T:**
- ❌ Refactor existing code during adoption
- ❌ Skip scanning phase
- ❌ Force existing code into Kabeeri structure
- ❌ Treat adoption as rewrite
- ❌ Mandate Kabeeri for historical decisions

---

## Adoption Stages

### Pre-Adoption

Determine if project is ready for Kabeeri:
- Clear architecture ✓
- Version control (git) ✓
- Documentation (at least README) ✓
- Team alignment ✓

### Adoption Phase 1: Scan & Document

- Scan codebase
- Document decisions
- Map to Kabeeri structure
- Create adoption task list
- (1-2 days)

### Adoption Phase 2: Integration

- Team training on Kabeeri
- Set up .kabeeri folder
- Begin creating new features in Kabeeri workflow
- (1-2 days)

### Adoption Phase 3: Full Integration

- All new work follows Kabeeri
- Gradual tech debt cleanup using Kabeeri tasks
- Kabeeri becomes source of truth for project
- (ongoing)

---

## Next Steps

**New Projects:**
1. Choose delivery mode and profile
2. Create project folder
3. Begin questionnaires or vision workshop
4. [See v1.3+ for task governance]

**Existing Kabeeri Projects:**
1. Assess current version in project.json
2. Generate compatibility report
3. Backup project (git)
4. Apply upgrade
5. Test and verify

**Non-Kabeeri Projects:**
1. Scan existing project
2. Document existing decisions
3. Create adoption task list
4. Begin adopting Kabeeri for new work
5. [See v1.3+ for task governance]

---

## Related Documents

- [Delivery Modes](../delivery_modes/README.md)
- [Task Tracking And Governance](../task_tracking/TASK_GOVERNANCE.md)
- [Project Intake Issues](https://github.com/kabeeri/kabeeri-vdf/milestone/v1.2.0) (GitHub Issues)
