# Agile Delivery Mode

Phase 05 canonical Agile templates:

- [PRODUCT_BACKLOG_TEMPLATE.md](PRODUCT_BACKLOG_TEMPLATE.md)
- [EPIC_TEMPLATE.md](EPIC_TEMPLATE.md)
- [USER_STORY_TEMPLATE.md](USER_STORY_TEMPLATE.md)
- [SPRINT_PLANNING_TEMPLATE.md](SPRINT_PLANNING_TEMPLATE.md)
- [SPRINT_REVIEW_TEMPLATE.md](SPRINT_REVIEW_TEMPLATE.md)
- [SPRINT_COST_METADATA_SCHEMA.json](SPRINT_COST_METADATA_SCHEMA.json)
- [AGILE_RUNTIME.md](AGILE_RUNTIME.md)

## Runtime Commands

The executable Agile layer stores backlog, epic, story, sprint planning, impediment, retrospective, forecast, and sprint review records under `.kabeeri/agile.json`:

```bash
kvdf agile summary
kvdf agile backlog add --id BL-001 --title "Checkout MVP" --type epic --priority high --source "vision"
kvdf agile epic create --id epic-checkout --title "Checkout" --goal "Customers can place orders" --source "vision"
kvdf agile story create --id story-checkout-001 --epic epic-checkout --title "Cart checkout" --points 5 --workstream backend --acceptance "Order is created,Payment result is stored" --reviewer owner-001
kvdf agile story task story-checkout-001 --task task-001
kvdf agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10 --goal "Checkout foundation"
kvdf agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted
kvdf agile impediment add --id imp-001 --story story-checkout-001 --severity high --title "Payment credentials missing"
kvdf agile impediment resolve imp-001 --resolution "Credentials configured"
kvdf agile retrospective add sprint-001 --good "Goal was clear" --improve "Slice stories smaller" --actions "Add QA earlier"
kvdf agile health
kvdf agile forecast
kvdf validate agile
```

Stories converted with `kvdf agile story task` become normal governed tasks and then use the existing task, token, lock, acceptance, policy, and Owner verification runtime.

Live Agile health is written to `.kabeeri/dashboard/agile_state.json` and served by the dashboard at `/__kvdf/api/agile`.

**Agile Delivery** is the iterative, sprint-based approach to Kabeeri VDF. It leverages v1.0.0 components but reorganizes them into an adaptive workflow suited for fast-moving teams and uncertain requirements.

---

## Core Philosophy

**Build and learn in iterations.** Product vision → Prioritized backlog → Sprint-based delivery → Continuous stakeholder feedback.

Agile Delivery emphasizes getting working software in customers' hands quickly, gathering feedback, and adapting based on real learning.

---

## Workflow Overview

```
1. VISION WORKSHOP
   ↓
2. CREATE PRODUCT BACKLOG
   ↓
3. PLAN SPRINT 1
   ↓
4. IMPLEMENT STORIES IN SPRINT
   ↓
5. SPRINT REVIEW (demo to stakeholders)
   ↓
6. GATHER FEEDBACK
   ↓
7. REFINE BACKLOG
   ├─→ REPEAT (Plan Sprint 2, 3, etc.)
   └─→ LAUNCH when MVP ready
   ↓
8. POST-LAUNCH ITERATION & LEARNING
```

---

## Core Terminology

### Product Vision

A concise statement of what you're building and why.

**Example:** "Fitness Tracking — Help busy professionals track workouts in under 30 seconds, share progress with friends, and stay motivated."

**Not a detailed spec** — a direction and core value prop.

### Product Backlog

A prioritized list of features, stories, and epics the product needs.

**Structure:**
```
1. User Authentication (High priority, Epic)
   - User registration
   - Email login
   - Password reset
2. Workout Tracking (High priority, Epic)
   - Log workout (type, duration, intensity)
   - View workout history
   - Track progress charts
3. Social Sharing (Medium priority, Epic)
   - Share workouts with friends
   - Friend feed
   - Leaderboards
4. Notifications (Low priority, Epic)
   - Reminder to workout
   - Friend activity notifications
```

Backlog is continuously refined and re-prioritized as team learns.

### Epic

A large feature that spans multiple sprints and multiple stories.

**Example Epic: "User Authentication"**

Contains stories:
- User registration
- Email login with verification
- Password reset via email
- Social login (Google, Apple)
- Session management

### User Story

A small, independent piece of functionality described from user perspective.

**Format:** "As a [user role], I want to [action], so that [value]."

**Example:**
- "As a fitness enthusiast, I want to log a workout in under 30 seconds, so I don't forget to track it."
- "As a social user, I want to see my friends' workouts, so I can stay motivated together."

**Characteristics:**
- Fits in one sprint (1-2 weeks)
- Has clear acceptance criteria
- Independent (doesn't require other stories)
- Valuable to user
- Estimable by team

### Task

A smaller unit of work within a User Story.

If story is "User login," tasks might be:
- Set up email verification backend
- Build login form UI
- Implement password hashing
- Write login tests

Not all stories break into tasks; some are small enough as-is.

### Sprint

A fixed time period (1-2 weeks) where team commits to completing a set of stories.

**Sprint Structure:**
- Sprint planning (2-4 hours) — team selects stories for sprint
- Daily standup (15 min) — team syncs on progress
- Development (8-40 hours/week) — implement stories
- Sprint review (1-2 hours) — demo completed work to stakeholders
- Sprint retrospective (1 hour) — team reflects on process

### Increment

The working software completed in a sprint.

**Example:**
- Sprint 1 increment: User registration + email login
- Sprint 2 increment: Password reset + session management
- Sprint 3 increment: Social login + 2FA

Each increment should be potentially shippable to production (but may not be released immediately).

### Backlog Refinement

Ongoing process of clarifying stories, adding acceptance criteria, breaking epics into stories.

**Timing:** Usually 1-2 hours/week throughout the sprint.

**Team:** Product owner, tech lead, optionally developers.

### Definition of Ready (DoR)

Criteria a story must meet before it can be pulled into a sprint.

**Story is ready if:**
- [ ] User acceptance criteria defined
- [ ] AI implementation notes added
- [ ] Technical questions answered
- [ ] Story estimated by team
- [ ] No external blockers
- [ ] Product owner prioritized it

### Definition of Done (DoD)

Criteria a story must meet to be considered completed.

**Story is done if:**
- [ ] Acceptance criteria verified
- [ ] Code reviewed
- [ ] Tests written and passing
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] No open bugs
- [ ] Product owner approved

### Sprint Capacity

The amount of work a team can realistically complete in a sprint.

**Calculation:** Previous sprint velocity (how many story points completed) + 10-20% buffer.

Example: If team completed 25 points in Sprint 1, Sprint 2 capacity is 20-27 points.

### AI-Assisted Development in Agile

AI helps implement individual stories or tasks, **not entire epics or sprints**.

**Workflow:**
1. Story ready (DoR met)
2. Extract acceptance criteria
3. Generate AI prompt for story from prompt pack
4. Hand to AI coding tool (Claude, Cursor, Windsurf, etc.)
5. AI implements story + tests
6. Review output against acceptance criteria
7. Merge to main branch

**Key difference from Structured:** Each story is scoped for 1 AI pass. If story too big, break it smaller.

---

## Relationship to v1.0.0 Components

Agile Delivery reuses v1.0.0 building blocks:

| v1.0.0 Component | Agile Adaptation |
|---|---|
| **Generators** | Define initial project structure, not full roadmap |
| **Questionnaires** | Vision/kickoff questions (not exhaustive) |
| **Documentation** | Evolves sprint-by-sprint, not all upfront |
| **Prompt Packs** | Used story-by-story during implementation |
| **Task Tracking** | Track stories/sprints instead of phases |
| **Acceptance Checklists** | Review each story completion |
| **Profiles (Lite/Standard/Enterprise)** | Define initial team/scope size |

**Key difference:** Agile spreads planning across sprints instead of doing it all upfront.

---

## Task States in Agile Delivery

```
BACKLOG (waiting for sprint)
  ↓
SELECTED_FOR_SPRINT
  ↓
IN_PROGRESS
  ↓
REVIEW_NEEDED
  ├─→ APPROVED (ready to merge)
  │    ↓
  │    COMPLETED (merged, in increment)
  │
  └─→ NEEDS_REWORK
       ↓
       IN_PROGRESS (fix issues)
       ↓
       [back to REVIEW_NEEDED]
  ↓
BLOCKED (external blocker)
  ↓
DEFERRED (moved to next sprint)
```

---

## Sprint Rhythm

### Sprint Planning (4 hours for 2-week sprint)

**Agenda:**
1. Review product backlog (highest priority items)
2. Discuss acceptance criteria and unknowns
3. Team estimates story complexity (Story Points)
4. Team commits to stories fitting sprint capacity
5. Create task breakdown for stories

**Output:** Sprint backlog (committed stories + tasks)

### Daily Standup (15 min, every day)

**Each person answers:**
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

**Goal:** Identify blockers quickly, maintain team alignment.

### Backlog Refinement (1-2 hours, mid-sprint)

**Activities:**
- Break large epics into stories
- Add acceptance criteria to stories without them
- Estimate new stories
- Remove or defer low-priority stories

**Goal:** Next sprint's backlog is clear and ready.

### Sprint Review (1-2 hours, end of sprint)

**Agenda:**
1. Demonstrate completed stories to stakeholders
2. Gather feedback
3. Discuss what's working well
4. Adjust product roadmap based on feedback

**Output:** Stakeholder sign-off on sprint work.

### Sprint Retrospective (1 hour, end of sprint)

**Questions:**
- What went well?
- What could improve?
- What will we do differently next sprint?

**Goal:** Continuous process improvement.

---

## Agile vs Structured Terminology

| Concept | Agile | Structured |
|---------|-------|-----------|
| **Planning unit** | User Story → Sprint | Questionnaire → Phase |
| **Requirement source** | Backlog prioritization | Complete upfront questionnaires |
| **Planning scope** | Per sprint (1-2 weeks) | All upfront (weeks) |
| **Change process** | Backlog reprioritization | Extension layer |
| **Review frequency** | Per sprint (bi-weekly) | Per phase or feature |
| **Task size** | 1-2 week stories | 2-6 hour tasks |
| **Documentation** | Evolving, story-driven | Complete before code |
| **AI usage** | Story-by-story prompts | Full project prompts |

---

## Agile in Kabeeri VDF: Special Considerations

### AI Works Best With Small Stories

**Good story:** "As a user, I can log a 5-minute workout with type and intensity"  
**Bad story:** "Build complete workout tracking system"

Small stories = AI can implement in one session = easier to review.

### Acceptance Criteria Are Critical

**Poor criteria:** "User can log workouts"  
**Better criteria:**
- [ ] Login form accepts type, duration, intensity
- [ ] Validates duration 1-180 minutes
- [ ] Stores in database
- [ ] Shows success message
- [ ] Tests pass with 90% coverage

AI needs clear criteria to know when it's done.

### Don't Assume Agile Means "No Documentation"

**Agile means:**
- Documentation evolves, not all upfront
- User stories guide development
- Decisions documented as team learns

**Agile does NOT mean:**
- No documentation
- Chaotic architecture
- Skipping code review

### Agile Doesn't Skip Design Thinking

**Before Sprint 1:**
- Vision workshop
- Rough user flow sketches
- Technology choice
- Team structure

You're not diving into code blind; you're planning per-sprint instead of exhaustively.

### Sprint Cost Tracking

Track AI token usage per sprint:
- Tokens used per story
- Cost per story
- Total sprint cost
- Cost per feature

Helps predict budget for future sprints and projects.

---

## Agile Delivery Timeline Example

### 8-Week MVP: Fitness Tracker

```
Week 0: Vision Workshop + Initial Backlog
- Define vision
- Create initial epic list
- Estimate team size

Week 1: Sprint 1 Planning + Development
- Sprint 1 Stories: User registration, email verification, dashboard skeleton
- 5 sprint days
- Cost tracking setup

Week 2: Sprint 1 Complete
- Sprint review: show registration + verification
- Sprint retro: what to improve
- Backlog refinement: plan Sprint 2

Week 3: Sprint 2 Development
- Sprint 2 Stories: Workout logging, workout history, basic charts
- Deploy first version to beta users
- Gather feedback

Week 4: Sprint 2 Complete
- Sprint review: show logging system
- Sprint retro
- Backlog refinement based on beta feedback

Week 5: Sprint 3 Development
- Sprint 3 Stories: Social features, friend feed
- Improve based on user feedback
- Performance optimization

Week 6: Sprint 3 Complete
- Sprint review
- Sprint retro
- Decide: ready for public launch?

Weeks 7-8: Buffer / Iteration
- Use buffer for feedback-driven features
- Or start Sprint 4 if team wants more features
- Ongoing support and monitoring
```

**By Week 6-7:** Have working, user-tested product in market.  
**Structured approach:** Same work takes 12-16 weeks due to upfront planning.

---

## When Agile Delivery Works Best

| Scenario | Why Agile Shines |
|---|---|
| **Startup MVP** | Get to market fast, learn from users |
| **Unknown requirements** | Discover what users want by building + feedback |
| **Competitive pressure** | Sprint-based iteration matches market speed |
| **Small team** | Lite profile teams agile more naturally |
| **Frequent feedback** | Sprint reviews align with stakeholder cycles |
| **Learning products** | Experimental features need iterative validation |
| **Tight budget** | Pay only for what you build, extend later |

---

## When Agile Struggles in Kabeeri VDF

| Problem | Why | Solution |
|---|---|---|
| **Architecture inconsistency** | Stories built independently, no master plan | Larger design upfront, architecture reviews per sprint |
| **Tech debt accumulation** | Speed over quality in sprints | Strict DoD, dedicated refactoring tasks |
| **Scope creep** | Backlog keeps growing, never "done" | Product owner discipline on backlog |
| **Integration pain** | Stories built separately, integration messy | Integration tasks in sprint, not after |
| **AI cost surprises** | No budget planning upfront | Track sprint costs, extrapolate for project |

---

## Best Practices for Agile in Kabeeri VDF

### 1. Keep Stories Independent

- Stories shouldn't block each other
- If story A depends on story B, merge them or adjust order
- Independence = parallel work = faster delivery

### 2. Use Acceptance Criteria Religiously

- Story without clear criteria is a backlog debt
- Criteria guides AI implementation
- Criteria guides review and testing

### 3. Commit to Definition of Done

- Every story must meet DoD
- No shortcuts to "finish faster"
- DoD protects sprint quality

### 4. Measure and Track Everything

- Sprint velocity (points completed)
- Sprint cost (AI tokens, developer hours)
- Cycle time (story start to done)
- Defect rate (bugs per sprint)

### 5. Protect Sprint Focus

- Don't add stories mid-sprint
- Don't change priorities mid-sprint
- Sprint ends = time to adjust, not during

### 6. Review Quality Over Speed

- Acceptance review should take 1-3 hours per story
- Don't rubber-stamp reviews
- Quality in sprint = less rework later

### 7. Retrospectives Drive Improvement

- Don't skip retros
- Implement one improvement per retro
- Track what improved over sprints

---

## Agile + Structured Hybrid: Not Recommended

Mixing approaches mid-project creates confusion.

**Tempting but problematic:**
- "We'll do Structured planning, then Agile sprints"
- Usually leads to: 50% planning, 50% chaos, 100% waste

**Recommendation:** Choose one mode per project. Next project can choose differently.

---

## Scaling Agile Delivery

### Single Team (3-8 people)

Use single sprint rhythm, single backlog, single definition of done.

### Multiple Teams (8-20 people)

- Each team has own sprint rhythm (sync'd sprints)
- Shared product backlog (clarify dependencies)
- Integration sprint every 2-4 weeks
- Architecture sync meetings

### Large Teams (20+ people)

Consider Structured Delivery instead of Agile. Agile gets hard at scale without significant process overhead.

---

## Next Steps

1. Schedule vision workshop with stakeholders
2. Create initial product backlog
3. Estimate team size/capacity for Sprint 1
4. Choose technology stack using Prompt Packs
5. Set up sprint tracking (GitHub Issues, Jira, or local tool)
6. Plan Sprint 1
7. Begin development

---

## Related Documents

- [SELECTION_GUIDE.md](../delivery_modes/SELECTION_GUIDE.md) — How to choose Agile vs Structured
- [Delivery Modes Overview](../delivery_modes/README.md)
- [Structured Delivery](../delivery_modes/STRUCTURED_DELIVERY.md) — Alternative approach
- [Task Governance](../task_governance/README.md) — Governance rules apply to both modes

---

## Common Questions

**Q: Can I switch from Agile to Structured mid-project?**
A: Technically yes, but painful. Better to choose upfront. You can switch modes for v2.

**Q: Does Agile skip documentation?**
A: No. Documentation evolves sprint-by-sprint instead of all upfront. Stories are the documentation.

**Q: How long should sprints be?**
A: 1-2 weeks typical. Shorter = more overhead, longer = harder to respond to feedback. Start with 2 weeks.

**Q: What if a story is blocked mid-sprint?**
A: Move it to deferred status, start another story from backlog. Keep team velocity high by always having backup stories.

**Q: How do I know when to release to customers?**
A: After Sprint 2-3 when core features work and can gather real feedback. Don't wait for perfection.
