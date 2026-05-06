# Existing Project Adoption Workflow

Detailed step-by-step guide for adopting Kabeeri into an existing non-Kabeeri project.

---

## When to Adopt

Adopt Kabeeri when:

✅ **Recommended:**
- Project has mature codebase (6+ months old)
- Clear folder structure exists
- Team wants better task tracking and governance
- Project needs documentation layer
- Planning future features with AI assistance

❌ **Not recommended:**
- Project is < 3 months old (just use Kabeeri from start)
- Code is disorganized with no clear patterns
- No team consensus to adopt
- Active major refactor in progress

---

## Pre-Adoption Requirements

Before beginning adoption, verify:

- [ ] **Git access:** Can you access the git repository?
- [ ] **Code stability:** No major refactoring active?
- [ ] **Team aligned:** Does team want to adopt Kabeeri?
- [ ] **Time available:** 1-2 days for adoption setup?
- [ ] **Documentation:** Any existing architecture docs?
- [ ] **Deployment working:** Current deployment process stable?

---

## Adoption Phases

### Phase 1: Scan & Report (2-3 hours)

#### 1.1 Scan Project Structure

```bash
# Create adoption scan directory
mkdir -p .kabeeri/adoption_scan
cd project-root
```

Document existing structure:

```bash
# Tree structure
tree -L 3 -I 'node_modules|.git|venv|build' > .kabeeri/adoption_scan/structure.txt

# Framework detection
# Look for: package.json, Gemfile, requirements.txt, composer.json, pom.xml, etc.
ls -la | grep -E "package\.json|Gemfile|requirements\.txt|composer\.json"

# Recent commits
git log --oneline -20 > .kabeeri/adoption_scan/recent_commits.txt

# Open issues/PRs (if available)
# Document current work in progress
```

#### 1.2 Analyze Technology Stack

From configuration files, identify:

**Frontend:**
- Framework (React, Vue, Angular, etc.)
- Version
- UI library (Tailwind, Bootstrap, etc.)

**Backend:**
- Framework (Django, Laravel, .NET, etc.)
- Version
- API approach (REST, GraphQL, etc.)

**Database:**
- Type (PostgreSQL, MySQL, MongoDB, etc.)
- Version
- ORM/Query builder

**Infrastructure:**
- Hosting (AWS, Vercel, Heroku, etc.)
- CI/CD (GitHub Actions, GitLab CI, etc.)
- Containerization (Docker, etc.)

**Testing:**
- Test framework (Jest, Pytest, RSpec, etc.)
- Coverage level
- Test count

#### 1.3 Document Existing Features

List all production features:

```markdown
## Production Features

1. User Authentication
   - Login/logout
   - Registration
   - Password reset
   - OAuth (Google, GitHub)

2. User Profiles
   - Profile editing
   - Avatar upload
   - Privacy settings

3. Dashboard
   - Main dashboard view
   - Widgets
   - Data export

4. Reporting
   - Standard reports
   - Custom reports
   - Scheduled export

[etc.]
```

#### 1.4 Identify Known Issues

From git issues, PRs, and codebase comments:

```markdown
## Known Issues & Tech Debt

### High Priority
- [ ] Profile page query slow on >10k users (BUG)
- [ ] API rate limiting not enforced (SECURITY)
- [ ] Tests need 20% more coverage (TECH DEBT)

### Medium Priority
- [ ] Search functionality basic (FEATURE)
- [ ] Email notifications not batched (PERF)
- [ ] Documentation outdated (TECH DEBT)

### Low Priority
- [ ] UI inconsistency on mobile (UX)
- [ ] Logging not structured (TECH DEBT)
```

#### 1.5 Create Adoption Report

Create `.kabeeri/adoption_scan/ADOPTION_REPORT.md`:

```markdown
# Project Adoption Report

## Project Overview

- **Name:** existing-saas
- **Scan Date:** 2026-05-07
- **Scanned By:** adoption-ai

## Technology Stack

### Frontend
- Framework: React 18
- UI: TailwindCSS
- Package Manager: npm
- Build Tool: Vite

### Backend
- Framework: Express.js + Node.js 18
- Database: PostgreSQL 14
- ORM: Sequelize
- API: REST

### Infrastructure
- Hosting: AWS (EC2 + RDS)
- CI/CD: GitHub Actions
- Containerization: Docker
- Package Registry: npm

## Codebase Analysis

- **Language(s):** JavaScript/TypeScript
- **Total Files:** ~450
- **Lines of Code:** ~45,000
- **Git History:** 180 commits over 14 months
- **Contributors:** 3 active

## Current Features

- ✓ User authentication (email + OAuth)
- ✓ User profiles with settings
- ✓ Organization/team management
- ✓ Dashboard with widgets
- ✓ Reporting (standard + custom)
- ✓ API for integrations
- ✓ Email notifications
- ✓ File uploads/storage

## Identified Issues

### High Priority (3)
- [ ] Profile query performance
- [ ] API rate limiting missing
- [ ] Missing security headers

### Medium Priority (6)
- [ ] Search functionality needs improvement
- [ ] Email batching not implemented
- [ ] Documentation outdated
- [ ] Test coverage at 65% (target: 80%)
- [ ] Some technical debt in auth module
- [ ] No structured logging

### Low Priority (4)
- [ ] Mobile UI inconsistencies
- [ ] Code style inconsistency
- [ ] Missing API documentation
- [ ] Deployment process manual

## Project Health Score

| Criterion | Score | Notes |
|-----------|-------|-------|
| Code Organization | 8/10 | Clear folder structure |
| Test Coverage | 6/10 | 65%, target 80% |
| Documentation | 5/10 | Some outdated |
| Deployment | 7/10 | Mostly automated |
| Security | 7/10 | Few gaps identified |
| Performance | 6/10 | Some optimization needed |
| **Overall** | **6.5/10** | **Good foundation for adoption** |

## Kabeeri Adoption Recommendation

✓ **Ready for Kabeeri adoption**

### Reasoning
- Clear architecture
- Established patterns
- Stable deployment
- Manageable tech debt
- Team available

### Adoption Approach
- Document current architecture decisions
- Map features to Kabeeri workstreams
- Create adoption task list
- Begin using Kabeeri for new features

### Estimated Effort
- **Adoption setup:** 3-4 hours
- **Team training:** 2-3 hours
- **Total:** 5-7 hours

### Risk Level: **LOW**

### Next Steps
1. Get team approval
2. Proceed to Phase 2: Integration Setup
3. Create adoption tasks
4. Begin new feature work with Kabeeri

---

## Scanning Notes

- No major security vulnerabilities detected
- Existing tests are well-structured
- Architecture decisions seem sound
- Team is capable of managing Kabeeri
```

### Phase 2: Integration Setup (2-3 hours)

#### 2.1 Create .kabeeri Folder

```bash
mkdir -p .kabeeri/metadata
mkdir -p .kabeeri/adoption
```

#### 2.2 Create project.json

```json
{
  "project_name": "existing-saas",
  "version": "1.1.0",
  "kabeeri_version": "1.1.0",
  "profile": "standard",
  "delivery_mode": "structured",
  "intake_mode": "non_kabeeri_adoption",
  "created": "2024-01-15T10:00:00Z",
  "adopted": "2026-05-07T14:30:00Z",
  "adopted_by": "team-lead@example.com",
  "team_size": 5,
  "technology_stack": ["expressjs", "react", "postgresql"],
  "status": "adopted",
  "adoption_scan": {
    "date": "2026-05-07",
    "health_score": 6.5,
    "risk_level": "low",
    "estimated_adoption_hours": 5,
    "report": ".kabeeri/adoption_scan/ADOPTION_REPORT.md"
  }
}
```

#### 2.3 Document Architecture Decisions

Create `.kabeeri/metadata/decisions.json` with existing decisions:

```json
{
  "decisions": [
    {
      "id": "dec-001",
      "title": "Use Express.js for backend",
      "context": "Team familiar with Node.js, needed rapid development",
      "decision": "Express.js as the primary backend framework",
      "date": "2024-01-01",
      "status": "active",
      "decided_by": "tech-lead",
      "source": "adoption_scan"
    },
    {
      "id": "dec-002",
      "title": "Use React for frontend",
      "context": "Large component library, strong team knowledge",
      "decision": "React 18 as the primary frontend framework",
      "date": "2024-01-01",
      "status": "active",
      "decided_by": "tech-lead",
      "source": "adoption_scan"
    },
    {
      "id": "dec-003",
      "title": "PostgreSQL for database",
      "context": "Relational data structure, ACID compliance needed",
      "decision": "PostgreSQL 14 with Sequelize ORM",
      "date": "2024-01-01",
      "status": "active",
      "decided_by": "tech-lead",
      "source": "adoption_scan"
    }
  ]
}
```

#### 2.4 Create Team File

Create `.kabeeri/metadata/team.json`:

```json
{
  "team_members": [
    {
      "id": "lead-001",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "role": "tech-lead",
      "responsibilities": ["architecture", "code review", "approvals"],
      "can_approve": true
    },
    {
      "id": "dev-001",
      "name": "James Wilson",
      "email": "james@example.com",
      "role": "senior-developer",
      "responsibilities": ["backend", "infrastructure"],
      "can_approve": true
    },
    {
      "id": "dev-002",
      "name": "Emma Davis",
      "email": "emma@example.com",
      "role": "frontend-developer",
      "responsibilities": ["frontend", "ui/ux"],
      "can_approve": false
    },
    {
      "id": "dev-003",
      "name": "Alex Kumar",
      "email": "alex@example.com",
      "role": "junior-developer",
      "responsibilities": ["bug fixes", "features"],
      "can_approve": false
    }
  ]
}
```

#### 2.5 Map Features to Workstreams

Create `.kabeeri/adoption/FEATURE_MAP.md`:

```markdown
# Feature to Workstream Mapping

## Current Production Features → Kabeeri Workstreams

### User Authentication & Profiles
- **Source:** Existing feature
- **Workstream:** 04_CORE_FEATURES/authentication
- **Owner:** James Wilson
- **Status:** Stable, maintenance mode
- **Note:** Use for reference when building new auth features

### User Organization Management
- **Source:** Existing feature
- **Workstream:** 04_CORE_FEATURES/organization
- **Owner:** Emma Davis
- **Status:** Stable

### Dashboard & Analytics
- **Source:** Existing feature
- **Workstream:** 04_CORE_FEATURES/dashboard
- **Owner:** Alex Kumar
- **Status:** Active development

### Reporting System
- **Source:** Existing feature
- **Workstream:** 04_CORE_FEATURES/reporting
- **Owner:** James Wilson
- **Status:** Stable

### Email Notifications
- **Source:** Existing feature
- **Workstream:** 06_INTEGRATIONS_AND_APIS
- **Owner:** Emma Davis
- **Status:** Needs batching optimization

### File Management
- **Source:** Existing feature
- **Workstream:** 05_DATA_AND_DATABASE
- **Owner:** James Wilson
- **Status:** Using AWS S3

## Current Known Issues → Adoption Tasks

### High Priority Issues

**Issue:** Profile page slow on 10k+ users
- **Workstream:** 04_CORE_FEATURES/user_profiles
- **Type:** Bug
- **Priority:** HIGH
- **Estimated effort:** 8-12 hours
- **Source:** adoption_scan

**Issue:** API rate limiting not enforced
- **Workstream:** 06_INTEGRATIONS_AND_APIS
- **Type:** Security
- **Priority:** HIGH
- **Estimated effort:** 4-6 hours
- **Source:** adoption_scan

### Tech Debt Items

**Item:** Increase test coverage to 80%
- **Workstream:** 09_TESTING_AND_QA
- **Type:** Tech debt
- **Priority:** MEDIUM
- **Estimated effort:** 20-30 hours
- **Source:** adoption_scan
```

#### 2.6 Create Adoption Task List

Create `.kabeeri/adoption/ADOPTION_TASKS.md`:

```markdown
# Adoption Tasks

## Phase 1: Documentation & Mapping (Week 1)

### Task: Document architecture decisions
- **Description:** Extract all architectural decisions from code, commits, and team
- **Workstream:** 03_ARCHITECTURE_AND_DESIGN
- **Type:** Documentation
- **Priority:** HIGH
- **Status:** Ready for assignment
- **Estimated tokens:** 15,000
- **Acceptance criteria:**
  - [ ] All major decisions documented in decisions.json
  - [ ] Each decision has rationale and date
  - [ ] Team reviews and approves

### Task: Create API documentation
- **Description:** Document all API endpoints, request/response formats
- **Workstream:** 06_INTEGRATIONS_AND_APIS
- **Type:** Documentation
- **Priority:** HIGH
- **Status:** Ready for assignment
- **Estimated tokens:** 20,000

### Task: Document database schema
- **Description:** Create ER diagram and schema documentation
- **Workstream:** 05_DATA_AND_DATABASE
- **Type:** Documentation
- **Priority:** HIGH
- **Status:** Ready for assignment
- **Estimated tokens:** 10,000

## Phase 2: Bug Fixes & Optimization (Week 2)

### Task: Fix profile page performance
- **Description:** Profile page slow on >10k users, needs query optimization
- **Workstream:** 04_CORE_FEATURES
- **Type:** Bug
- **Priority:** HIGH
- **Status:** Pending review
- **Estimated tokens:** 12,000
- **Source:** adoption_scan issue #42

### Task: Implement API rate limiting
- **Description:** Add rate limiting to API endpoints for security
- **Workstream:** 06_INTEGRATIONS_AND_APIS
- **Type:** Security
- **Priority:** HIGH
- **Status:** Pending review
- **Estimated tokens:** 8,000
- **Source:** adoption_scan security finding

## Phase 3: Testing & Quality (Week 3)

### Task: Increase test coverage to 80%
- **Description:** Add tests to reach 80% coverage target
- **Workstream:** 09_TESTING_AND_QA
- **Type:** Tech debt
- **Priority:** MEDIUM
- **Status:** Pending review
- **Estimated tokens:** 25,000
```

#### 2.7 Create Adoption Folder Structure

Organize adoption files:

```
.kabeeri/
├── project.json
├── metadata/
│   ├── team.json
│   ├── decisions.json
│   └── adoption_timeline.json
├── adoption_scan/
│   ├── ADOPTION_REPORT.md
│   ├── structure.txt
│   ├── recent_commits.txt
│   └── SCANNING_NOTES.md
└── adoption/
    ├── FEATURE_MAP.md
    ├── ADOPTION_TASKS.md
    ├── TEAM_GUIDE.md
    └── NEXT_STEPS.md
```

### Phase 3: Team Training (1-2 hours)

#### 3.1 Team Meeting

Schedule 1-2 hour meeting:

**Agenda:**
1. Why we're adopting Kabeeri (15 min)
2. How Kabeeri changes workflow (15 min)
3. Tour of adoption setup (15 min)
4. Demo: Creating a new feature with Kabeeri (15 min)
5. Q&A (15 min)

#### 3.2 Create TEAM_GUIDE.md

Create `.kabeeri/adoption/TEAM_GUIDE.md`:

```markdown
# Kabeeri Adoption Team Guide

## What's Changing?

### Before Adoption
- Create GitHub issues
- Assign to person
- Implement
- GitHub PR review
- Merge

### After Adoption
- Create task in .kabeeri/tasks/
- Define scope and acceptance criteria
- Assign to person
- Implement (same as before)
- GitHub PR review (same as before)
- Review against Kabeeri acceptance checklist
- Merge (same as before)

## Key Takeaways

1. **Existing workflow mostly unchanged:** We're adding governance layer, not replacing development
2. **All new features use Kabeeri:** Every new task goes through Kabeeri task creation process
3. **Existing code untouched:** We're not refactoring existing working code
4. **Better tracking:** We can now track features, bugs, and tech debt in organized way
5. **AI-assisted development:** We can use AI prompts from Kabeeri for feature implementation

## How to Create a New Task

1. Create file in `tasks/` using task template
2. Fill in: title, scope, acceptance criteria, workstream
3. Save and commit
4. Assign to team member
5. Implement using selected prompt pack
6. Use acceptance checklist for review

## Important Rules

- ✓ Small, focused tasks (2-6 hours each)
- ✓ Clear acceptance criteria
- ✓ One task = one PR
- ✓ Use acceptance checklists
- ✗ No vague "build feature X" tasks
- ✗ Don't modify existing code without task
- ✗ Don't skip acceptance review

## Support

- Questions? Ask tech lead or review [Kabeeri documentation](../../README.md)
- Training recordings: [link to video]
- Kabeeri FAQ: [link to FAQ]
```

#### 3.3 Create Demo Task

Create one example task so team can see the process:

```markdown
# Example Task: Add Workspace Invitation Links

**Task ID:** example-001  
**Status:** Ready for implementation  
**Assigned to:** [Team member]

## Scope

Add ability to generate and share invitation links for workspace access. Invitee can join without email confirmation.

### Included
- Generate unique invitation link
- Store invitation metadata
- Join via link
- One-time or unlimited use option

### Excluded
- Email sending (use existing email service)
- Admin revoke feature (future task)

## Acceptance Criteria

- [ ] API endpoint `/api/invitations/generate` created
- [ ] Invitation stored with: link token, created_date, expires_date, one_time flag
- [ ] GET `/api/invitations/{token}` returns invitation details
- [ ] User can join via `/join/{token}`
- [ ] Tests written (>80% coverage)
- [ ] Existing tests still pass

## Technical Notes

- Use short URL tokens (8-12 chars)
- Store expiration logic in database
- Frontend: Add "Generate link" button in workspace settings

## Prompt Pack

Use: [expressjs/auth-and-sharing]

## Estimated Tokens

8,000 (API + tests)
```

### Phase 4: First New Feature (Ongoing)

#### 4.1 Choose First Feature

Select a small feature that:
- Uses existing technology stack
- Doesn't break existing functionality
- Can be completed in 1-2 days
- Has clear acceptance criteria

#### 4.2 Create Feature Task

Use task template from Kabeeri task governance

#### 4.3 Execute Task

- Assign to capable team member
- Use prompt pack for guidance
- Review with acceptance checklist
- Merge to main

#### 4.4 Retrospective

After first feature:
- What went well?
- What was confusing?
- What would help?
- Adjust process for next feature

---

## Adoption Milestones

| Milestone | Duration | Status |
|-----------|----------|--------|
| **Phase 1:** Scan & Report | 2-3 hours | Ready to start |
| **Phase 2:** Integration Setup | 2-3 hours | After phase 1 |
| **Phase 3:** Team Training | 1-2 hours | After phase 2 |
| **Phase 4:** First Feature | 1-2 days | After phase 3 |
| **Stabilization:** Next 2-3 features | 1-2 weeks | Ongoing |

**Total adoption time:** 5-7 hours setup + 2-3 weeks stabilization

---

## Success Metrics

After adoption is complete, measure:

- [ ] All team members create tasks in Kabeeri format
- [ ] 100% of new features have acceptance criteria
- [ ] All acceptance checklists reviewed before merge
- [ ] Bug resolution uses Kabeeri task tracking
- [ ] No "random" work without task reference
- [ ] Tech debt is documented as tasks
- [ ] Team comfortable with process

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Team resistance** | Emphasize: Kabeeri helps, doesn't replace workflow |
| **Confusion about workstreams** | Reference FEATURE_MAP.md for how features map |
| **Tasks feel too strict** | Start with guidelines, relax if needed |
| **Too many existing issues** | Triage: only create tasks for immediate work |
| **Existing code doesn't fit structure** | It's okay; focus on new work following structure |

---

## Related Documents

- [Project Intake README](README.md)
- [Task Governance](../task_governance/README.md)
- [Main Kabeeri Documentation](../../README.md)
