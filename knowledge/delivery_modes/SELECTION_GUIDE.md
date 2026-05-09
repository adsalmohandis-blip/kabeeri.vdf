# Delivery Mode Selection Guide

Use this guide to determine whether **Structured Delivery** or **Agile Delivery** is best for your project.

---

## Quick Decision Matrix

| Your Situation | Best Mode | Reason |
|---|---|---|
| I know exactly what I want to build | **Structured** | Complete planning before coding works well |
| I have a rough idea but need to learn | **Agile** | Iteration helps validate assumptions |
| My team is distributed across time zones | **Structured** | Async documentation works better |
| My team can meet daily/frequently | **Agile** | Sprint ceremonies work better |
| Requirements are stable and complex | **Structured** | All features planned upfront |
| Requirements change frequently | **Agile** | Backlog prioritization handles changes |
| Regulatory compliance is critical | **Structured** | Complete documentation required |
| I'm building an MVP quickly | **Agile** | Fast iteration to market |
| I have limited AI budget | **Agile** | Build incrementally, cost control per sprint |
| I have a large AI budget | **Structured** | Comprehensive prompts for full scope |

---

## Structured Delivery: When to Choose

### Ideal scenarios:

- **Complex products** with many interdependencies
  - Example: Multi-tenant SaaS platform with complex role-based access
  - Reason: All features need architectural planning together

- **Regulatory or compliance requirements**
  - Example: Healthcare app, financial system, government software
  - Reason: Full documentation and planning required upfront

- **Distributed teams** across time zones
  - Example: Global team, async-first culture
  - Reason: Documentation serves as source of truth

- **Large, stable scope**
  - Example: "Build an e-commerce platform with X features"
  - Reason: Knowing scope helps Kabeeri generate complete documentation

- **Enterprise or Standard profiles**
  - Example: Large SaaS, complex platform
  - Reason: Structured approach handles complexity

- **Long-term project** with fixed scope
  - Example: "Build this product, then maintain/extend"
  - Reason: Complete planning reduces rework

### Sample project: **Hospital Management System**

**Choice:** Structured Delivery

**Why:**
- Regulatory compliance (healthcare)
- Complex interconnected modules (patients, doctors, appointments, billing, pharmacy, lab reports)
- Distributed team (corporate structure)
- Well-defined scope and requirements
- Long-term support and maintenance needed

**Workflow:**
1. Extensive questionnaire covering all hospital departments
2. Generate comprehensive documentation for architecture, database, integrations
3. Create prompts for each major module (auth, patient mgmt, scheduling, etc.)
4. Track implementation task-by-task
5. Use acceptance checklists for compliance requirements

---

## Agile Delivery: When to Choose

### Ideal scenarios:

- **Uncertain or evolving requirements**
  - Example: Startup MVP where product-market fit is unknown
  - Reason: Build and learn from real feedback

- **MVP or prototype** (quick to market)
  - Example: "Get the basic idea live in 2 weeks"
  - Reason: Agile prioritization gets core features first

- **Fast-moving market** with competitive pressure
  - Example: Trending social feature, seasonal product
  - Reason: Sprint-based delivery adapts quickly

- **Limited initial vision** (rough idea, not complete spec)
  - Example: "We think we want a collaboration tool, but aren't sure"
  - Reason: Stories emerge as you learn

- **Frequent stakeholder feedback** needed
  - Example: Client/investor wants bi-weekly reviews
  - Reason: Sprints align with review cycles

- **Lite profile** projects
  - Example: Dashboard, landing page, simple tool
  - Reason: Simpler scope fits sprint-based delivery

- **Experimental or research** products
  - Example: "Test if users want X feature"
  - Reason: Learn-fast approach validates hypotheses

- **Team loves iterating** and responding to feedback
  - Example: "We build as we learn"
  - Reason: Matches team culture

### Sample project: **Fitness Tracking Mobile App (Startup)**

**Choice:** Agile Delivery

**Why:**
- Startup with uncertain market needs
- Founder vision is "track workouts and social sharing" but details unknown
- Need to launch MVP in 4 weeks
- Will get investor and user feedback to guide later features
- Small, focused team
- Likely major pivots based on user feedback

**Workflow:**
1. Brief initial vision interview
2. Identify first 2-3 core user stories (Sign up → Log workout → View history)
3. Sprint 1 (2 weeks): Core workout tracking
4. Get user feedback, refine backlog
5. Sprint 2: Add social/sharing based on feedback
6. Continue iteration based on learning

---

## Hybrid Approach: Can You Mix?

**Generally recommended: Choose one mode per project.**

However, **structured with agile execution** is possible for complex projects:
- Complete all Structured planning
- Then execute delivery in Agile sprints instead of phases
- This requires careful task breakdown and sprint assignment

**Not recommended: Pure agile planning + structured execution**
- Creates planning gaps and architectural issues
- Better to commit to Agile upfront

---

## Decision Checklist

Answer these questions to help decide:

### Question 1: Requirements Clarity
- [ ] **Structured:** I have a complete product specification ready
- [ ] **Agile:** I have a vision but details will emerge

### Question 2: Feedback Frequency
- [ ] **Structured:** We'll gather all feedback upfront
- [ ] **Agile:** We want bi-weekly or continuous feedback

### Question 3: Team Structure
- [ ] **Structured:** Distributed, async-first, documented culture
- [ ] **Agile:** Co-located or sync-friendly, meeting-friendly culture

### Question 4: Scope
- [ ] **Structured:** Large, complex, interdependent features
- [ ] **Agile:** Small, independent, MVP-focused scope

### Question 5: AI Budget
- [ ] **Structured:** High budget (comprehensive prompts)
- [ ] **Agile:** Budget-conscious (smaller stories per sprint)

### Question 6: Timeline
- [ ] **Structured:** 3+ months planning and execution
- [ ] **Agile:** 2-6 week MVP target

### Question 7: Compliance
- [ ] **Structured:** Regulatory or compliance requirements
- [ ] **Agile:** No major compliance constraints

### Question 8: Team Experience
- [ ] **Structured:** Team prefers detailed specifications
- [ ] **Agile:** Team prefers short cycles and feedback

---

## Changing Modes Mid-Project

**Not recommended** but possible:

**Structured → Agile:** Only if new requirements or market conditions force it
- Warning: May lose architectural coherence
- Recommendation: Finish current phase as Structured, then switch for next version

**Agile → Structured:** If you suddenly need to stabilize and document
- Possible: Extract all decisions into documentation
- Warning: Retroactive documentation is inefficient
- Recommendation: Avoid this situation with upfront mode selection

**Best practice:** Choose correctly at project start. It's much more efficient than switching mid-flight.

---

## Support and Escalation

If you're unsure after reading this guide:

1. **Review the sample projects** above — find the closest match
2. **Discuss with your team** — which culture do you align with?
3. **Start with Structured** if truly undecided — it's the safer default (you can adapt to Agile later)
4. **Don't overthink it** — you can always incorporate learnings in v2 of your product

---

## Common Misconceptions

| Misconception | Reality |
|---|---|
| "Structured is slow" | Upfront planning actually speeds up total delivery time for complex projects |
| "Agile is chaotic" | Agile is disciplined; it just adapts rather than follows a fixed plan |
| "Only Structured works with AI" | Both modes work with AI; they structure the workflow differently |
| "Agile is only for startups" | Both early-stage and established companies use Agile |
| "Structured means no changes" | Both allow changes; Structured manages them more formally |
| "I must pick one forever" | You can switch modes per project; each project chooses independently |

---

## Next Steps

Once you've chosen your delivery mode:

1. Proceed to [v1.2.0 — Project Intake](../project_intake/README.md) to set up your project
2. Review your mode's detailed documentation:
   - [Structured Delivery](STRUCTURED_DELIVERY.md)
   - [Agile Delivery](../agile_delivery/README.md)
3. Begin with questionnaires (Structured) or vision workshop (Agile)
