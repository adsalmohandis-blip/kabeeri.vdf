# Agile Delivery Core

**v1.4.0** establishes Agile delivery as a first-class mode with:
- Product backlog management
- Sprint planning and execution
- User stories and epics
- Sprint cost tracking (AI tokens)

The runtime implementation is documented in [AGILE_RUNTIME.md](AGILE_RUNTIME.md). Use `kvdf agile` to turn these templates into `.kabeeri/agile.json` records and `kvdf agile story task` to convert ready stories into governed tasks.

---

## Overview

Agile Delivery in Kabeeri VDF combines Agile methodology with Kabeeri's task governance:

**Kabeeri Agile = Agile methodology + Task governance + AI-assisted development**

This differs from traditional Agile:
- Every story/task follows governance rules
- Every story traced to source (DoD requirement)
- AI assists per-story (not per-team-member)
- Sprint costs tracked (tokens + hours)
- Structured acceptance reviews

---

## Key Documents

### PRODUCT_BACKLOG_TEMPLATE.md

Structure for managing product backlog:

```
## Product Backlog

### Epic: User Authentication (High Priority)

**Epic ID:** epic-auth  
**Owner:** product-lead  
**Target Sprint:** Sprint 1-2  
**Story Points:** 21 (total)  

**Stories:**
1. User registration (5 pts)
2. Email login (3 pts)
3. Password reset (3 pts)
4. OAuth integration (8 pts)
5. Session management (2 pts)

### Epic: Dashboard (High Priority)

[etc.]
```

### USER_STORY_TEMPLATE.md

Format for user stories in sprints:

```
# User Story: User Registration

**ID:** story-auth-001  
**Epic:** epic-auth  
**Sprint:** Sprint 1  
**Story Points:** 5  
**Owner:** product-lead  

## User Story Format

As a [user role],  
I want to [action],  
So that [value].

**Example:**
As a new user,
I want to create an account with my email and password,
So that I can access the platform.

## Acceptance Criteria

- [ ] User sees registration form
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Account created on backend
- [ ] Verification email sent
- [ ] Tests pass (>90% coverage)

[etc.]
```

### SPRINT_PLANNING_TEMPLATE.md

Sprint planning agenda and structure:

```
# Sprint Planning

**Sprint:** Sprint 1  
**Date:** 2026-05-07  
**Duration:** 2 weeks  
**Team Capacity:** 40 story points  

## Agenda

1. Review backlog priorities (15 min)
2. Discuss high-priority stories (30 min)
3. Team estimates stories (30 min)
4. Commit to sprint scope (15 min)
5. Define sprint goal (10 min)

## Sprint Commitment

**Sprint Goal:** "Enable user authentication (registration + email login)"

**Stories committed:**
- story-auth-001: User registration (5 pts)
- story-auth-002: Email login (3 pts)
- story-core-001: Dashboard home page (12 pts)
[etc.]

**Total committed:** 37 points (of 40 capacity)

[etc.]
```

### SPRINT_REVIEW_TEMPLATE.md

Sprint review meeting structure:

```
# Sprint Review & Demo

**Sprint:** Sprint 1  
**Date:** 2026-05-21  
**Duration:** 1.5 hours  

## Demo

**Story-001: User Registration**
- Demo: Registration form submission
- Show: Email verification working
- Metrics: Response time <200ms

[etc.]

## Feedback

**From stakeholders:**
- Loves: Registration UI clean
- Concern: Password reset button too small
- Suggestion: Add social signup later

## Metrics

- Completed: 35/37 points (95%)
- Velocity: 35 points
- Defect rate: 2 bugs
- Test coverage: 92%

[etc.]
```

### SPRINT_COST_METADATA.md

Track sprint costs (AI tokens, hours):

```
# Sprint Cost Metadata

**Sprint:** Sprint 1  
**Duration:** 2 weeks  
**Team:** 3 developers  

## Story Costs

| Story | Tasks | Dev Hours | AI Tokens | Total Cost |
|-------|-------|-----------|-----------|-----------|
| story-auth-001 | 3 | 12 | 8,000 | $1.20 |
| story-auth-002 | 2 | 8 | 5,000 | $0.75 |
| story-core-001 | 4 | 18 | 12,000 | $1.80 |

## Workstream Costs

| Workstream | Hours | Tokens | Cost |
|---|---|---|---|
| 04_CORE_FEATURES | 38 | 25,000 | $3.75 |

## Acceptance & Rework

| Category | Hours | Tokens | Cost |
|---|---|---|---|
| Accepted (first time) | 35 | 21,000 | $3.15 |
| Rework (defects) | 3 | 4,000 | $0.60 |
| **Total** | **38** | **25,000** | **$3.75** |

## Budget Tracking

- Sprint budget: $500
- Sprint actual: $3.75
- Remaining: $496.25
- Velocity: 35 points / $3.75 = 9.3 points per dollar
- Forecast: $25-30 for MVP

[etc.]
```

---

## Core Agile Concepts (Kabeeri Context)

### Epic

Large feature spanning multiple sprints.

**In Kabeeri:**
- Epics are organized as issues or documents
- Epics reference workstreams (structured mapping)
- Epics break into user stories (not directly into tasks)
- Example: Epic "User Authentication System" → 5 user stories

### User Story

Small feature from user perspective, fits in one sprint.

**In Kabeeri:**
- Stories follow task governance rules
- Stories have sources (DoR requirement)
- Stories have acceptance criteria (DoR requirement)
- Story size: 1-2 week sprint capacity = 3-8 hour story
- Example: "As user, I want to register with email"

### Task (in Agile)

Smaller unit of work within a story.

**In Kabeeri:**
- Tasks within stories follow task governance
- Tasks are 2-4 hour chunks
- Task: 1 AI execution + review cycle
- Example: Task "Implement email verification endpoint"

### Sprint

Fixed 1-2 week iteration.

**In Kabeeri Agile:**
- Sprint goal is explicit
- Stories committed with story points
- Sprint capacity = team capacity (story points)
- Velocity = points completed / sprint
- Cost tracked per sprint

### Increment

Working software completed in sprint.

**In Kabeeri:**
- Increment is demo-ready
- Increment reviewed against acceptance criteria
- Increment may or may not be released
- Example: Sprint 1 increment = registration + login features

---

## Backlog Prioritization (MoSCoW)

Backlog items categorized by priority:

**Must Have** (High Priority)
- Essential for MVP/launch
- Included in next sprint
- Example: User authentication

**Should Have** (Medium Priority)
- Important but not blocking
- Next 2-3 sprints
- Example: User profiles

**Could Have** (Low Priority)
- Nice to have
- Future sprints or v2
- Example: User analytics

**Won't Have** (Explicitly out)
- Deprioritized or v2+
- Example: Mobile app (v2 feature)

---

## Sprint Velocity & Capacity

### Calculating Sprint Capacity

```
Developer capacity per sprint = 40 hours/week × 2 weeks = 80 hours

Reduce for:
- Meetings (estimate 20% = -16 hours)
- Admin/overhead (estimate 10% = -8 hours)
- Buffer for unknowns (estimate 10% = -8 hours)

Available sprint capacity = 48 hours = ~12 story points (4 hour/point)
```

### Velocity Tracking

```
Sprint 1: Completed 32 points (velocity = 32)
Sprint 2: Completed 35 points (velocity = 35)
Sprint 3: Completed 30 points (velocity = 30)

Average velocity: 32 points/sprint

Forecast for MVP (100 points):
100 points ÷ 32 points/sprint = 3.1 sprints ≈ 6-7 weeks
```

---

## Agile Story Sizing

Use **Story Points** to estimate relative complexity:

| Points | Meaning | Example |
|--------|---------|---------|
| 1-2 | Tiny, trivial | Add new button to UI |
| 3 | Small, well-understood | Simple form field with validation |
| 5 | Medium, normal story | User registration with email |
| 8 | Large, complex | OAuth integration |
| 13+ | Too large, split it | "Build entire payment system" |

**Rule:** Never commit story >13 points. Split larger stories.

---

## Sprint Ritual Cycle

### Monday: Sprint Planning (4 hours)

```
Sprint Planning
├─ Review backlog (high priority)
├─ Discuss unclear stories
├─ Team estimates (planning poker)
├─ Commit to stories
└─ Define sprint goal
```

### Tuesday-Friday: Development (daily standup)

```
Daily Standup (15 min)
├─ What did I complete yesterday?
├─ What am I working on today?
└─ Any blockers?
```

Mid-sprint: **Backlog Refinement** (1-2 hours)

```
Backlog Refinement
├─ Break large epics into stories
├─ Add acceptance criteria
├─ Team estimates new stories
└─ Prepare next sprint
```

### Friday (end of sprint): Sprint Review + Retro

```
Sprint Review (1.5 hours)
├─ Demo completed stories
├─ Gather stakeholder feedback
└─ Adjust backlog priorities

Sprint Retrospective (1 hour)
├─ What went well?
├─ What could improve?
└─ Commit to 1 improvement for next sprint
```

---

## Handling Sprint Disruptions

### Story Blocked Mid-Sprint

```
Story: "User login"
Status: IN_PROGRESS
Blocker: "Email service API not responding"

Action:
1. Move story to BLOCKED status
2. Pull next story from backlog
3. Notify email service owner
4. Resume when blocker resolved
```

### Scope Creep

```
Stakeholder: "Can we add social login to Sprint 1?"

Team: "Sprint 1 is committed to 35 points. Social login is 8 more.
We'd have to remove something."

Decision: "Move social login to Sprint 2 backlog"
```

### Story Takes Longer

```
Story: "Dashboard widgets" (estimated 5 pts)
Status: REVIEW_NEEDED (day 8 of 10-day sprint)
Actual hours: 12 (estimated 8)

Action:
1. Owner reviews: "Do we still want this?"
2. If YES: extend deadline, remove lower-priority story
3. If NO: defer to next sprint
4. Learn: widgets are more complex (size as 8 pts next time)
```

---

## Agile + Task Governance Integration

### Story Follows Task Governance

Every user story is also a tracked task:

```
User Story: "User registration"

Includes task governance:
✓ source_type: user_story
✓ source_reference: story://sprint-001/user-story-auth-001
✓ acceptance_criteria: [clear list]
✓ scope.allowed_files: [explicit]
✓ scope.forbidden_files: [explicit]
✓ owner, assignee, reviewer
✓ estimated_hours, estimated_tokens
```

### Story Execution with AI

```
1. Story selected for sprint
2. Story has governance fields filled
3. Story assigned to developer or AI
4. If AI: AI reads acceptance criteria, source, scope
5. AI implements story following criteria
6. Review against acceptance checklist
7. If passes: story moves to COMPLETED
8. If fails: story moves to REWORK_NEEDED
```

---

## AI Token Cost Tracking in Sprints

### Per-Story Token Accounting

```
Sprint 1, Story: User Registration

AI Usage:
- Prompt generation: 2,000 tokens
- API endpoint implementation: 4,000 tokens
- Test writing: 2,000 tokens
- Documentation: 1,000 tokens
Total: 9,000 tokens

Cost (at $0.001/1000 tokens): $0.009 per story
```

### Per-Sprint Token Budget

```
Sprint 1 Budget: 50,000 tokens ($50)

Allocation:
- Story auth-001 (registration): 9,000 tokens
- Story auth-002 (login): 6,000 tokens
- Story core-001 (dashboard): 12,000 tokens
- Buffer/overrun: 23,000 tokens

Total sprint: 50,000 tokens (on budget)
```

### Rework Token Costs

```
Story: "User profile"
Initial submission: 10,000 tokens
Acceptance review: Failed (criteria not met)
Rework: +5,000 tokens (fixing issues)
Total story cost: 15,000 tokens

Tracked as:
- Accepted (first pass): 10,000 tokens
- Rework (not ideal): 5,000 tokens (flagged for team learning)
```

---

## Sprint Metrics

Track per sprint:

| Metric | Calcul Reason |
|--------|---|
| **Velocity** | Points completed / sprint = forecast accuracy |
| **Burndown** | Points remaining vs days = sprint pace |
| **Defect rate** | Bugs found per sprint = quality |
| **Rework %** | Rework tokens / total tokens = quality |
| **Cost/point** | Total tokens / points completed = efficiency |
| **Team capacity** | Actual vs estimated = planning accuracy |

---

## Agile vs Structured Sprint Comparison

| Aspect | Agile Sprint | Structured Phase |
|--------|---|---|
| **Duration** | 1-2 weeks | 2-4 weeks |
| **Planning** | Per sprint | All upfront |
| **Feedback** | Continuous (bi-weekly) | Per phase |
| **Scope** | Flexible (backlog reprioritized) | Fixed (scope defined upfront) |
| **Review** | Sprint review | Phase completion |
| **Metrics** | Velocity, burndown | Phase completion % |
| **AI usage** | Story-by-story | Full project prompts |

---

## Implementation Timeline (v1.4.0)

### Week 1: Foundation

- [ ] Create backlog templates
- [ ] Create sprint templates
- [ ] Define story sizing (points)
- [ ] Train team on Agile + Kabeeri

### Week 2: Sprint 1 Setup

- [ ] Create initial product backlog
- [ ] Hold sprint planning
- [ ] Commit stories
- [ ] Begin development

### Week 3+: Sprint Execution

- [ ] Daily standups
- [ ] Backlog refinement
- [ ] Sprint review & retro
- [ ] Next sprint planning

---

## Next Steps

1. **Read** [agile_delivery/README.md](../agile_delivery/README.md) for Agile terminology
2. **Create** initial product backlog using templates
3. **Hold** sprint planning with team
4. **Execute** Sprint 1
5. **Track** velocity and metrics
6. **Refine** based on learnings

---

## Related Documents

- [../agile_delivery/README.md](../agile_delivery/README.md) — Agile mode documentation
- [../delivery_modes/](../delivery_modes/) — Mode selection and comparison
- [../task_tracking/TASK_GOVERNANCE.md](../task_tracking/TASK_GOVERNANCE.md) — Task governance (applies to stories/tasks)
- [SPRINT_COST_METADATA.md](#sprint-cost-metadata) — Token cost tracking
