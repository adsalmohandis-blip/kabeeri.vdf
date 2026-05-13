# New Project Initialization Rules

These rules ensure a new Kabeeri project starts correctly and maintains consistency throughout its lifecycle.

---

## Pre-Initialization Checklist

Before creating a new project, verify:

- [ ] **Team assembled:** Who will use Kabeeri? (developer, product manager, founder, etc.)
- [ ] **Delivery mode chosen:** Structured or Agile?
- [ ] **Profile chosen:** Lite, Standard, or Enterprise?
- [ ] **Technology stack known:** What framework/language will you use? (Can refine later)
- [ ] **Vision articulated:** What are you building and why? (1-2 sentences min)
- [ ] **Budget defined:** Do you have AI token budget?
- [ ] **Timeline estimated:** When do you want to launch?

---

## Initialization Sequence

### 1. Create Project Folder

```bash
mkdir my-project-name
cd my-project-name
```

**Naming convention:**
- Use lowercase
- Use hyphens, not underscores
- Example: `healthcare-app`, `saas-dashboard`, `mobile-api`

### 2. Initialize Git Repository

```bash
git init
git config user.email "team@example.com"
git config user.name "Your Team"
```

**Create .gitignore:**

```
# Dependencies
node_modules/
venv/
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log
```

### 3. Create .kabeeri Folder Structure

```bash
mkdir -p .kabeeri/metadata
touch .kabeeri/project.json
```

### 4. Initialize project.json

**For Structured Mode:**

```json
{
  "project_name": "my-project-name",
  "description": "One-line description of what the project does",
  "version": "1.1.0",
  "kabeeri_version": "1.1.0",
  "profile": "standard",
  "delivery_mode": "structured",
  "intake_mode": "new_project",
  "created": "2026-05-07T10:30:00Z",
  "created_by": "founder@example.com",
  "team_size": 2,
  "technology_stack": ["nextjs", "typescript", "postgresql"],
  "target_launch": "2026-07-15",
  "ai_token_budget": 500000,
  "status": "initialized",
  "workstreams": [],
  "tags": ["saas", "b2b"]
}
```

**For Agile Mode:**

```json
{
  "project_name": "my-project-name",
  "description": "One-line description",
  "version": "1.1.0",
  "kabeeri_version": "1.1.0",
  "profile": "lite",
  "delivery_mode": "agile",
  "intake_mode": "new_project",
  "created": "2026-05-07T10:30:00Z",
  "created_by": "founder@example.com",
  "team_size": 2,
  "technology_stack": ["react", "firebase"],
  "target_launch": "2026-06-01",
  "ai_token_budget": 250000,
  "status": "initialized",
  "sprints": [],
  "tags": ["mvp", "startup"]
}
```

### 5. Create Initial Folders

**Structured Mode:**

```bash
mkdir -p 01_STRATEGY_AND_BUSINESS
mkdir -p 02_PRODUCT_DEFINITION
mkdir -p 03_ARCHITECTURE_AND_DESIGN
mkdir -p 04_CORE_FEATURES
mkdir -p 05_DATA_AND_DATABASE
mkdir -p 06_INTEGRATIONS_AND_APIS
mkdir -p 07_INFRASTRUCTURE_AND_DEVOPS
mkdir -p 08_SECURITY_AND_COMPLIANCE
mkdir -p 09_TESTING_AND_QA
mkdir -p tasks
mkdir -p acceptance_checklists
mkdir -p docs
mkdir -p .kabeeri/metadata

# Create README in each folder
for folder in 01 02 03 04 05 06 07 08 09; do
  echo "# $(ls | grep "^$folder")" > "$folder*/README.md"
done
```

**Agile Mode:**

```bash
mkdir -p backlog
mkdir -p sprints
mkdir -p stories
mkdir -p tasks
mkdir -p acceptance_checklists
mkdir -p docs
mkdir -p .kabeeri/metadata
```

### 6. Copy Templates

Get questionnaire templates and story templates:

`kvdf generate` now seeds the generated skeleton with architecture-guide and questionnaire markdown files, so the initial intake prompts live beside the scaffold instead of being added later by hand.

**Structured:**
- Copy questionnaires from `/questionnaires/core/` to each workstream folder
- Copy task template to `tasks/`
- Copy acceptance checklist template

**Agile:**
- Copy `USER_STORY_TEMPLATE.md` to `stories/`
- Copy `SPRINT_TEMPLATE.md` to `sprints/`
- Copy task template
- Copy acceptance checklist template

### 7. Initialize Metadata Files

Create `.kabeeri/metadata/team.json`:

```json
{
  "team_members": [
    {
      "id": "founder-001",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "founder/product",
      "responsibilities": ["product decisions", "vision"],
      "can_approve": true
    },
    {
      "id": "dev-001",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "role": "developer",
      "responsibilities": ["architecture", "implementation"],
      "can_approve": false
    }
  ]
}
```

Create `.kabeeri/metadata/decisions.json`:

```json
{
  "decisions": [
    {
      "id": "dec-001",
      "title": "Project created",
      "context": "Initial project setup",
      "decision": "Project initialized with Kabeeri v1.1.0",
      "date": "2026-05-07",
      "status": "active",
      "decided_by": "founder-001"
    }
  ]
}
```

### 8. Create Initial README.md (Project Root)

```markdown
# My Project Name

## Vision

[One-line description of what you're building and why]

## Getting Started

1. **Review the vision:** See [vision.md](vision.md) (Agile) or [02_PRODUCT_DEFINITION/README.md](02_PRODUCT_DEFINITION/README.md) (Structured)
2. **Understand the structure:** See [.kabeeri/project.json](.kabeeri/project.json)
3. **Delivery mode:** This project uses [Structured/Agile] delivery mode
4. **Local setup:** See [DEVELOPMENT.md](DEVELOPMENT.md)

## Team

See [.kabeeri/metadata/team.json](.kabeeri/metadata/team.json)

## Project Status

- Created: 2026-05-07
- Delivery Mode: Structured/Agile
- Current Phase/Sprint: Planning
- Target Launch: 2026-07-15
```

### 9. Create First Git Commit

```bash
git add .kabeeri/
git add README.md
git add .gitignore
git commit -m "chore: initialize Kabeeri v1.1.0 project - profile: standard, mode: structured"
git tag -a v1.1.0-init -m "Initial Kabeeri project initialization"
```

---

## After Initialization

### Next: Begin Planning (Structured)

1. **Answer questionnaires:**
   - Open `01_STRATEGY_AND_BUSINESS/questionnaire.md`
   - Answer all questions thoroughly
   - Save answers in `01_STRATEGY_AND_BUSINESS/answers.md`

2. **Repeat for each workstream:**
   - 02_PRODUCT_DEFINITION
   - 03_ARCHITECTURE_AND_DESIGN
   - 04_CORE_FEATURES
   - 05_DATA_AND_DATABASE
   - [etc.]

3. **Generate documentation:**
   - Collect all answers
   - Send to AI: Generate documents from answers
   - Save outputs to each workstream

4. **Create task list:**
   - Review all documentation
   - Create tasks for Phase 1
   - Link tasks to workstreams

5. **Begin implementation:**
   - Select first task
   - Choose appropriate prompt pack
   - Hand to AI coding tool
   - Execute and review

### Next: Begin Planning (Agile)

1. **Vision workshop (1-2 hours):**
   - Document product vision in `vision.md`
   - Identify key user personas
   - Define success metrics

2. **Create initial backlog:**
   - List all possible features (high-level)
   - Group into epics
   - Write user stories for top 5 epics
   - Prioritize backlog

3. **Plan Sprint 1:**
   - Review top priority stories
   - Team estimates story complexity
   - Select stories fitting team capacity
   - Create task breakdown for stories

4. **Execute Sprint 1:**
   - Implement stories one-by-one
   - Use acceptance criteria for verification
   - Hold daily standup
   - Track progress

5. **Sprint 1 Review:**
   - Demo completed stories to stakeholders
   - Gather feedback
   - Adjust backlog for Sprint 2

---

## Project Initialization Template Checklist

Before marking project as "initialized":

- [ ] Project folder created
- [ ] Git initialized with .gitignore
- [ ] .kabeeri/project.json created with correct metadata
- [ ] .kabeeri/metadata/ folder created
- [ ] team.json added
- [ ] decisions.json created
- [ ] Workstream folders created (Structured) or backlog/sprint folders (Agile)
- [ ] Questionnaires/templates copied
- [ ] Initial README.md written
- [ ] First git commit made with tag
- [ ] Team has access to repository
- [ ] Next step documented in README.md

---

## Common Mistakes to Avoid

| Mistake | Impact | Prevention |
|---------|--------|-----------|
| **Skip questionnaires** | Missing context, poor architecture | Do questionnaires first, even if time-consuming |
| **Start coding immediately** | Rework later, scope creep | Complete planning phase first |
| **Unclear project.json** | Confusion about project state | Fill in all fields, even if estimates change |
| **No team file** | Unclear who decides what | Create team.json with roles |
| **Ignored .gitignore** | Secrets/build files in repo | Set up .gitignore before any code |
| **No initial commit** | Hard to track project evolution | Commit initialization immediately |
| **Vague project name** | Hard to reference | Use clear, descriptive name |
| **Skip metadata** | Loss of decisions | Document decisions as made |

---

## Profile-Specific Initialization

### Lite Profile (Small MVP)

- Fewer workstreams (maybe only 01, 02, 04)
- Shorter questionnaires (2-3 days planning)
- Fewer expected features (5-8 core)
- Faster to launch (4-8 weeks)

### Standard Profile (Normal SaaS)

- All 9 workstreams
- Complete questionnaires (5-7 days planning)
- Moderate feature count (10-20 core)
- Typical launch (8-16 weeks)

### Enterprise Profile (Complex System)

- All 9 workstreams + potential custom
- Extensive questionnaires (1-2 weeks planning)
- Many features (30+ core)
- Longer launch (16+ weeks)
- External compliance requirements

---

## Support & Help

If initialization is unclear:

1. Review [../delivery_modes/](../delivery_modes/) documentation
2. Check [Questionnaires](../../questionnaires/) examples
3. Look at [Examples](../../examples/) for reference projects
4. Ask in documentation or create GitHub issue

---

## Related Documents

- [README.md](README.md) — Project intake overview
- [Kabeeri VDF README](../../README.md) — Main project documentation
- [Delivery Modes](../delivery_modes/SELECTION_GUIDE.md) — Help choosing mode/profile
- [Task Tracking And Governance](../task_tracking/TASK_GOVERNANCE.md) — Rules for creating tasks after initialization
