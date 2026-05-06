# Task Creation Governance

Kabeeri VDF establishes strict rules for task creation to ensure every task is traceable, reviewable, and properly scoped. This prevents random or unclear work from entering the project.

---

## Core Governance Principles

1. **No task without scope** — Every task must define what's included and excluded
2. **Acceptance criteria mandatory** — Task cannot be marked done without criteria
3. **Source tracking required** — Every task must trace back to where it came from
4. **Owner approval required** — Tasks need owner/stakeholder approval before execution
5. **One task, one concern** — Each task addresses one thing (feature, bug, tech debt, etc.)
6. **AI and humans equal** — Same rules apply whether task executed by AI or human
7. **Reversible decisions** — Tasks should not break existing functionality

---

## Task Properties (Required)

Every Kabeeri task must have these properties:

### Identity

- **id:** Unique identifier (auto-generated or manual)
  - Format: `task-{uuid}` or `feature-{workstream}-{number}`
  - Example: `task-f47ac10b`, `feature-04-core-features-001`

- **title:** Clear, action-oriented title
  - ✅ Good: "Add email verification to registration"
  - ❌ Bad: "Authentication improvements"

### Scope

- **description:** 2-3 sentences explaining what needs to be done

- **scope.included:** Explicit list of what IS included
  ```
  - User email verification via link
  - Verification link expiration (24h)
  - Retry limit (5 attempts)
  ```

- **scope.excluded:** Explicit list of what IS NOT included
  ```
  - SMS verification
  - Resend verification email feature
  - Admin verification override
  ```

- **scope.allowed_files:** What files CAN be modified
  ```
  - /src/auth/
  - /src/email/
  - /tests/auth/
  ```

- **scope.forbidden_files:** What files CANNOT be modified
  ```
  - /src/config/database.js (dangerous)
  - /src/migrations/ (handled separately)
  - /public/index.html (UI styling separate task)
  ```

### Acceptance Criteria

- **acceptance_criteria:** List of measurable requirements
  ```
  - [ ] Verification link sent on registration
  - [ ] Link valid for 24 hours
  - [ ] Account locked until verified
  - [ ] Tests pass with >90% coverage
  - [ ] No console errors
  - [ ] Documentation updated
  ```

### Source & Provenance

- **source_type:** Where did this task originate?
  - Values: `manual`, `questionnaire_answer`, `generated_document`, `user_story`, `epic`, `sprint_planning`, `acceptance_review`, `bug_report`, `github_issue`, `ai_suggestion`, `existing_project_scan`, `migration_report`

- **source_reference:** Link to originating source
  - Examples: `github://owner/repo/issues/42`, `questionnaire://02_PRODUCT_DEFINITION/q5`, `ai://claude-suggestion-5`

### Roles & Permissions

- **owner:** Who owns the decision (must approve execution)
  - Format: `{role}` or `{email}`
  - Example: `product-lead`, `alice@example.com`

- **assignee:** Who will execute the task (person or "ai")
  - Format: `{person-id}` or `ai`
  - Example: `dev-001`, `ai`

- **reviewer:** Who reviews completion before acceptance
  - Format: `{person-id}` or `{role}`
  - Example: `tech-lead`, `senior-dev-001`

### Estimation & Tracking

- **delivery_mode:** Which delivery mode this task belongs to
  - Values: `structured`, `agile`

- **intake_mode:** How project was set up
  - Values: `new_project`, `kabeeri_upgrade`, `non_kabeeri_adoption`

- **workstream:** Which major area (Structured) or Epic (Agile)
  - Examples: `04_CORE_FEATURES`, `06_INTEGRATIONS_AND_APIS`

- **estimated_tokens:** Estimated AI tokens needed
  - Example: `12000` (for token counting)

- **estimated_hours:** Estimated human hours
  - Example: `6`

- **priority:** Priority level
  - Values: `critical`, `high`, `medium`, `low`

- **status:** Current state (see state diagram below)
  - Values: `pending`, `ready_for_review`, `in_progress`, `review_needed`, `blocked`, `rework_needed`, `completed`

### Metadata

- **created:** Timestamp when task was created
- **created_by:** Who created the task (usually different from assignee)
- **labels:** Tags for filtering
  - Examples: `bug`, `feature`, `tech-debt`, `security`, `performance`

---

## Task States and Transitions

```
PENDING
├─→ [ready_for_review] ───→ BLOCKED
└─→ IN_PROGRESS
    ├─→ REVIEW_NEEDED
    │   ├─→ COMPLETED (accepted)
    │   └─→ REWORK_NEEDED ───→ IN_PROGRESS
    └─→ BLOCKED
```

### State Definitions

| State | Meaning | Next Steps |
|-------|---------|-----------|
| **PENDING** | Task created but not ready to start | Get approval, wait for dependencies |
| **READY_FOR_REVIEW** | Task ready but undergoing acceptance review | Reviewer checks criteria |
| **IN_PROGRESS** | Task actively being worked on | Continue work or hit blocker |
| **REVIEW_NEEDED** | Work complete, awaiting review | Reviewer examines output |
| **COMPLETED** | Task accepted and merged | Update docs, move to next task |
| **REWORK_NEEDED** | Review found issues | Fix issues and resubmit |
| **BLOCKED** | External dependency or issue prevents progress | Resolve blocker, resume |

---

## Who Can Do What?

### Create Task

✅ **Can create:**
- Team lead
- Product owner
- Delivery manager
- AI agent (if configured)

❌ **Cannot create alone:**
- Individual developers (should suggest to lead)
- External tools (should create via API with auth)

### Approve Task

✅ **Can approve:**
- Owner (as defined in task)
- Tech lead (override authority)
- Product owner (if owner not available)

❌ **Cannot approve:**
- Assignee (conflict of interest)
- Reviewer (should be independent)

### Assign Task

✅ **Can assign:**
- Owner
- Tech lead
- Delivery manager

❌ **Cannot assign:**
- Assignee to themselves (should be assigned by manager)

### Review Task

✅ **Can review:**
- Reviewer (as defined in task)
- Tech lead (override authority)
- Senior team member (if reviewer unavailable)

❌ **Cannot review:**
- Assignee (conflict of interest)
- Owner alone (needs technical review)

---

## Task Validation Rules

Before a task can enter `IN_PROGRESS` status, it must pass validation:

### ✅ Required Fields Present
- [ ] id (unique)
- [ ] title (clear)
- [ ] description (2-3 sentences)
- [ ] scope.included (explicit)
- [ ] scope.excluded (explicit)
- [ ] acceptance_criteria (list)
- [ ] source_type (traceable)
- [ ] source_reference (linked)
- [ ] owner (identified)
- [ ] assignee (assigned)
- [ ] reviewer (designated)
- [ ] workstream (classified)
- [ ] priority (set)

### ✅ Scope is Achievable

- [ ] Task doable in estimated time
- [ ] Acceptance criteria measurable
- [ ] Dependencies identified
- [ ] No circular dependencies

### ✅ Permissions Correct

- [ ] Owner exists and authorized
- [ ] Assignee exists or is "ai"
- [ ] Reviewer capable
- [ ] No conflicts of interest

### ✅ Source is Valid

- [ ] Source exists and is accessible
- [ ] Source_reference is valid
- [ ] No orphaned tasks (every task must have source)

### ✅ Not Prohibited

- [ ] Task is not a duplicate (check id uniqueness)
- [ ] Task doesn't violate scope rules
- [ ] Task doesn't modify forbidden files
- [ ] Task is not too large (estimate <20 hours)
- [ ] Task not mixing concerns (one focus)

---

## Task Governance for Different Modes

### Structured Delivery

- Tasks created per-workstream
- All tasks planned before implementation phase
- Owner is workstream lead
- Reviewer is tech lead
- Source usually: questionnaire_answer or generated_document

### Agile Delivery

- Tasks created per-sprint
- Task can be created just-in-time (per-sprint)
- Owner is product owner
- Reviewer is tech lead
- Source usually: user_story or sprint_planning

---

## Prohibited Task Patterns

### Pattern 1: Vague Tasks

❌ **Bad:**
```
Title: "Improve performance"
Acceptance criteria: "System is faster"
```

✅ **Good:**
```
Title: "Optimize user profile query for >10k user sets"
Acceptance criteria:
- [ ] Query completes in <100ms
- [ ] Database index created
- [ ] Tests pass
```

### Pattern 2: Multiple Concerns

❌ **Bad:**
```
Title: "Add authentication and payment processing"
```

✅ **Good:**
```
Task 1: Title: "Add email-based authentication"
Task 2: Title: "Add payment method storage"
Task 3: Title: "Add payment processing checkout"
```

### Pattern 3: Undefined Scope

❌ **Bad:**
```
Scope: "Build feature"
```

✅ **Good:**
```
Included:
- User registration with email
- Email verification
- Session creation

Excluded:
- OAuth (separate task)
- Password reset (separate task)
- 2FA (future sprint)
```

### Pattern 4: Impossibly Large Tasks

❌ **Bad:**
```
Title: "Build the entire billing system"
Estimated: 200 hours
```

✅ **Good:**
```
Sprint 1 Tasks:
- Task 1: "Create billing database schema"
- Task 2: "Build payment method input form"
- Task 3: "Implement stripe integration"
- Task 4: "Create billing history page"
```

### Pattern 5: Tasks Without Source

❌ **Bad:**
```
source_type: unknown
source_reference: null
"Created randomly because we thought of it"
```

✅ **Good:**
```
source_type: user_story
source_reference: github://owner/repo/issues/123
"From Product Backlog: High-priority customer request"
```

### Pattern 6: Owner/Reviewer Conflict

❌ **Bad:**
```
owner: dev-001
assignee: dev-001
reviewer: dev-001
```

✅ **Good:**
```
owner: product-lead
assignee: dev-001
reviewer: tech-lead
```

---

## Task Governance Checklist

Use this checklist before creating a task:

- [ ] **Clear title?** Would someone understand it without asking?
- [ ] **Explicit scope?** What's in and out is crystal clear
- [ ] **Measurable criteria?** Can reviewers verify it's done?
- [ ] **Valid source?** Does it trace back to a decision or request?
- [ ] **Right size?** Fits in estimated time with clear outcome
- [ ] **Permissions clear?** Owner, assignee, reviewer identified
- [ ] **Not duplicate?** Check existing tasks first
- [ ] **One concern?** Does it focus on one thing?
- [ ] **Realistic estimate?** Experienced team agrees on hours/tokens
- [ ] **Not prohibited?** Doesn't violate scope rules

If all checked ✅, task is ready for approval.

---

## AI-Suggested Tasks

When AI suggests a task (source_type: `ai_suggestion`):

**Requirements:**
- AI suggestion must be approved by owner before execution
- Owner reviews: does AI suggestion make sense?
- Owner can: approve, modify, or reject suggestion
- Modified suggestions get new task_id and reference original

**Example AI suggestion flow:**

```
AI: "I notice you have manual data import. Suggest task:
    'Create CSV import automation tool'"

Owner review: "Good suggestion, but scope too large.
    Split into: 
    1. CSV parsing
    2. Data validation
    3. Database insertion
    Each gets own task"

Result: Three tasks created, each referencing ai_suggestion
```

---

## Task Documentation Location

### Structure

```
.kabeeri/
└── tasks/
    ├── task-001-auth-email-verification.md
    ├── task-002-api-rate-limiting.md
    ├── task-003-database-migration.md
    └── ...

agile_delivery/
└── sprints/
    └── sprint-001/
        ├── stories/
        │   ├── story-auth-001.md
        │   └── story-dashboard-001.md
        └── tasks/
            ├── task-001.md
            └── task-002.md
```

### File Naming

**Structured:**
- `task-{sequence}-{slug}.md`
- Example: `task-001-user-email-verification.md`

**Agile:**
- `task-{sprint}-{sequence}-{slug}.md`
- Example: `task-001-001-email-verification.md` (Sprint 1, Task 1)

---

## Version History

Track task changes in header:

```markdown
# Task: Email Verification

**ID:** task-001  
**Version:** 1.2  
**Created:** 2026-05-07  
**Last Updated:** 2026-05-08

## Change History

- v1.0: Initial task creation
- v1.1: Added forbidden_files section
- v1.2: Refined acceptance criteria after team review
```

---

## Governance Enforcement

### Automated Checks (future v1.3+ CLI)

```bash
kvdf validate tasks/
```

Would check:
- All required fields present
- Valid JSON schema
- No duplicates
- Source references valid
- Permissions valid

### Manual Review

Team lead periodically reviews:
- [ ] Tasks following governance rules
- [ ] Sources are traced correctly
- [ ] Permissions make sense
- [ ] No blocker tasks stuck too long
- [ ] Completed tasks properly documented

### Escalation

If task violates governance:
1. Reviewer flags task as "governance_violation"
2. Task creator notified
3. Task returns to PENDING status
4. Creator must fix and resubmit

---

## Next Steps

1. **Create task templates** based on this governance
2. **Train team** on task creation rules
3. **Set up validation** (manual or automated)
4. **Review existing tasks** against new governance
5. **Document decisions** for why governance exists

---

## Related Documents

- [TASK_INTAKE_TEMPLATE.md](TASK_INTAKE_TEMPLATE.md) — Template for creating tasks
- [TASK_DEFINITION_OF_READY.md](TASK_DEFINITION_OF_READY.md) — When task is ready to start
- [TASK_SOURCE_RULES.md](TASK_SOURCE_RULES.md) — Source type definitions
- [Project Intake](../project_intake/README.md) — How projects start
- [Task Schema](../schemas/task.schema.json) — JSON schema for tasks
