# Structured Delivery Mode

**Structured Delivery** is the comprehensive, upfront-planning approach to Kabeeri VDF. It is built directly on v1.0.0 and represents the original framework design.

---

## Core Philosophy

**Build clarity before code.** Complete product understanding → Full documentation → Organized implementation → Managed extensions.

Structured Delivery emphasizes getting all the pieces right before building, reducing rework and supporting complex, interdependent systems.

---

## Workflow Overview

```
1. SELECT PROFILE
   ↓
2. ANSWER QUESTIONNAIRES (all project folders)
   ↓
3. GENERATE DOCUMENTATION (from answers)
   ↓
4. REVIEW & APPROVE DOCUMENTS
   ↓
5. CREATE IMPLEMENTATION TASKS (per component)
   ↓
6. EXECUTE TASKS WITH AI
   ↓
7. REVIEW OUTPUT (acceptance checklists)
   ↓
8. PLAN EXTENSIONS (without damaging core)
```

---

## Core Terminology

### Project Profile

The scale and complexity level of your project.

**Lite Profile**
- Small MVPs, dashboards, internal tools
- 5-8 core features
- Single database
- Simple architecture
- Timeline: 4-8 weeks

**Standard Profile**
- SaaS products, web apps, content sites
- 10-20 core features
- Multiple services/modules
- Moderate complexity
- Timeline: 8-16 weeks

**Enterprise Profile**
- Large platforms, marketplaces, multi-tenant systems
- 30+ core features
- Distributed architecture
- High complexity, security requirements
- Timeline: 16+ weeks

### Generator

A JSON file (lite.json, standard.json, enterprise.json) that defines:
- Core project folders
- Questionnaire files for each folder
- Expected documentation output
- Typical task breakdown

### Workstream

A major area of your project organized in Kabeeri folder structure:
- 01_STRATEGY_AND_BUSINESS
- 02_PRODUCT_DEFINITION
- 03_ARCHITECTURE_AND_DESIGN
- 04_CORE_FEATURES
- 05_DATA_AND_DATABASE
- 06_INTEGRATIONS_AND_APIS
- 07_INFRASTRUCTURE_AND_DEVOPS
- 08_SECURITY_AND_COMPLIANCE
- 09_TESTING_AND_QA

Each workstream has its own questionnaire and produces its own documentation.

### Questionnaire

A set of beginner-friendly questions for each workstream. Example:

**Workstream: 02_PRODUCT_DEFINITION**

Questions might include:
- "What is your target user?"
- "What is the core problem you're solving?"
- "What makes your product different?"
- "What are your top 5 features?"

Answers are stored in `answers/` folder and used to generate documentation.

### Document Generation

AI-powered creation of workstream documents from questionnaire answers.

**Input:** Questionnaire answers for 02_PRODUCT_DEFINITION  
**Output:** Product Definition document with:
- Executive summary
- User personas
- Feature list with priorities
- Success metrics
- Competitor analysis

### Prompt Pack

Technology-specific guidance for implementation tasks.

Examples:
- Laravel Prompt Pack
- Next.js Prompt Pack
- .NET Prompt Pack
- Django Prompt Pack

Each pack contains:
- General setup instructions
- Folder structure recommendations
- Technology-specific patterns
- Sample AI prompts for common tasks

### Task

A single, well-defined unit of work to implement one feature or fix one bug.

**Required fields:**
- title
- description
- scope (what's included/excluded)
- acceptance_criteria (how to verify it's done)
- workstream (which folder)
- estimated_tokens (AI token budget)
- assigned_to (person or AI)

**Prohibited:** Vague tasks like "Build authentication" (too big). Break into smaller tasks.

### Phase

A logical grouping of related tasks in Structured delivery.

**Phase 1: Core Features**
- Auth system
- User management
- Dashboard

**Phase 2: Advanced Features**
- Reporting
- Integrations
- Analytics

Each phase is planned, built, reviewed, and accepted as a unit.

### Extension

A feature planned for after the core product launch.

**Important:** Extensions are NOT built as part of the core project. They:
- Are tracked in extension layer
- Require separate approval
- Can be added later without modifying core code
- Follow their own task workflow

### Acceptance Criteria

Measurable requirements for a task or phase to be considered "done."

Example acceptance criteria for "User authentication":
- [ ] Users can sign up with email
- [ ] Login persists across sessions
- [ ] Password reset works via email
- [ ] OAuth integration with Google works
- [ ] All credentials stored securely
- [ ] Tests pass with 90%+ coverage

### Acceptance Checklist

A structured review template used before marking work as accepted.

Checks:
- [ ] Acceptance criteria met?
- [ ] Code quality acceptable?
- [ ] Performance acceptable?
- [ ] Security reviewed?
- [ ] Documentation updated?
- [ ] Tests included?
- [ ] Dependencies compatible?

### Definition of Done (DoD)

The agreed-upon standard for what "done" means for all tasks.

Default Definition of Done:
- [ ] Acceptance criteria verified
- [ ] Code reviewed by peer or senior dev
- [ ] Tests written and passing
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Change log entry added
- [ ] Ready for staging/production

---

## Task States in Structured Delivery

```
PENDING
  ↓
IN_PROGRESS
  ↓
AI_DONE (AI has completed the implementation)
  ↓
REVIEW_NEEDED (awaiting human review)
  ↓
VERIFIED (review passed, ready to merge)
  ├─→ ACCEPTED (merged/deployed)
  └─→ REWORK_NEEDED (review identified issues)
       ↓
       IN_PROGRESS (fix issues)
       ↓
       [back to REVIEW_NEEDED]
  ↓
BLOCKED (external dependency or issue)
```

---

## Workstream Relationship to Generators

The **Generator** JSON file defines which questionnaires and documents apply to your project.

**Example: Standard Profile Generator**

```json
{
  "profile": "standard",
  "workstreams": [
    {
      "id": "01_STRATEGY_AND_BUSINESS",
      "questionnaire": "strategy_questionnaire.md",
      "documentation": "strategy_document.md",
      "tasks_estimate": 4
    },
    {
      "id": "02_PRODUCT_DEFINITION",
      "questionnaire": "product_questionnaire.md",
      "documentation": "product_definition.md",
      "tasks_estimate": 6
    },
    ...
  ]
}
```

**Process:**
1. User chooses Standard profile
2. Kabeeri loads standard.json generator
3. For each workstream in generator, user answers questionnaire
4. AI generates documentation from answers
5. Documentation guides task creation

**Lite profile** might skip workstreams like "07_INFRASTRUCTURE_AND_DEVOPS" (not needed for small projects).

**Enterprise profile** might add extra workstreams like "06_INTEGRATIONS_AND_APIS" with more detail.

---

## Prompt Pack Integration

**Prompt Packs** are used at **task execution time**, not project definition time.

**Workflow:**

1. Complete all questionnaires and documentation (no code yet)
2. Create task list for first phase
3. For each task, select matching **Prompt Pack**
   - Task: "Build user authentication" → Use Laravel Prompt Pack (auth section)
   - Task: "Create dashboard UI" → Use Next.js Prompt Pack (frontend section)
4. Hand task + selected prompts to AI coding tool
5. AI executes task following the prompts
6. Review output using acceptance checklists

**Key point:** Prompt packs guide HOW to build (best practices, patterns, setup). Questionnaires define WHAT to build (requirements, features, decisions).

---

## Structured vs Agile Terminology

| Concept | Structured | Agile |
|---------|-----------|-------|
| **Planning unit** | Workstream → Phase | Sprint → User Story |
| **Requirement source** | Questionnaire answers | Backlog prioritization |
| **Planning horizon** | 100% upfront | Per sprint |
| **Change process** | Extension layer | Backlog refinement |
| **Review frequency** | Phase-end or feature-end | Sprint-end (increment) |
| **Task size** | Feature or module-sized | Story or task-sized |
| **AI involvement** | Full project prompts | Story-by-story prompts |

---

## Timeline and Effort

### Structured project typical timeline:

| Phase | Activity | Duration |
|-------|----------|----------|
| Planning | Complete all questionnaires | 2-5 days |
| Documentation | Generate and review documents | 3-7 days |
| Setup | Create task list, setup CI/CD | 2-3 days |
| Phase 1 Build | Implement core features | 2-4 weeks |
| Phase 1 Review | Acceptance testing, fixes | 1-2 weeks |
| Phase 2 Build | Implement advanced features | 1-3 weeks |
| Phase 2 Review | Acceptance testing, fixes | 1 week |
| Stabilization | Bug fixes, performance tuning | 1-2 weeks |

**Total: 6-12 weeks** for Standard profile

---

## Structured Delivery Best Practices

### 1. Answer Questionnaires Thoroughly

- Don't skip questions or say "we'll figure it out later"
- Involve product/business stakeholder, not just technical team
- Honest answers lead to better documentation

### 2. Review Generated Documentation

- Don't accept documents blindly
- Adjust and refine based on reality
- Documentation is source of truth for implementation

### 3. Break Tasks Into Small Chunks

- Each task should take 2-6 hours for AI to complete
- Small tasks = easier to review, easier to fix, easier to track
- Avoid "build entire authentication" — split into registration, login, password reset, etc.

### 4. Follow Definition of Done Strictly

- Every task must meet DoD before marking VERIFIED
- Don't compromise quality in early phases
- Shortcuts in core phase create tech debt

### 5. Use Acceptance Checklists Religiously

- Don't skip checklist steps
- Checklist catches issues before they reach production
- Review quality directly affects extension quality

### 6. Protect the Core Project

- Don't modify core code for extensions
- Use extension layer for new features
- Core stability = faster future iteration

### 7. Track AI Token Usage

- Record tokens used per task, phase, workstream
- Identify high-cost tasks for optimization
- Inform budget for v2 or similar projects

---

## Common Structured Delivery Scenarios

### Scenario 1: Complete Up-Front Planning

```
Week 1: All questionnaires answered
Week 2: All documentation generated and reviewed
Week 3: All tasks created
Weeks 4+: Implementation starts
```

**Pros:** Clear roadmap, architectural coherence  
**Cons:** Upfront effort before coding

### Scenario 2: Phase-Based Planning

```
Week 1: Strategy & Product questionnaires → Create Phase 1 tasks
Weeks 2-3: Execute Phase 1
Week 3: Architecture questionnaire → Refine Phase 2 tasks
Weeks 4-5: Execute Phase 2
```

**Pros:** Learn and adjust between phases  
**Cons:** Some benefits of upfront planning lost

### Scenario 3: Incremental Task Refinement

```
Questionnaire → Documentation → Coarse task list
Implement first task, learn details
Refine next task with learnings
Repeat
```

**Pros:** Flexibility within structured framework  
**Cons:** Risk of inconsistent architecture if tasks conflict

---

## Extension Layer in Structured Delivery

After core project is launched:

1. Gather feature requests and learnings
2. Create new feature list
3. Determine if feature fits core or is an extension
4. If extension:
   - Create extension questionnaires
   - Generate extension documentation
   - Create extension task list
   - Review against core architecture (don't break it)
   - Implement extension in separate folder/component
5. Extension can be merged into core for v2

**Key:** Core stays stable, extensions are isolated.

---

## When Structured Delivery Struggles

| Problem | Solution |
|---------|----------|
| Requirements change during implementation | Use extension layer for new ideas |
| Questionnaires seem too long | Choose Lite profile if scope is really small |
| Team frustrated with upfront planning | Consider Agile mode for next project |
| Market moves faster than Phase 1 completion | Launch Phase 1 earlier, start Phase 2 planning sooner |
| Architectural issues discovered mid-build | Document in decision log, plan for v2, continue core completion |

---

## Next Steps

1. Choose your project profile (Lite, Standard, Enterprise)
2. Get the relevant [Generator](../generators/) file
3. Answer questionnaires for each workstream
4. Request documentation generation from AI
5. Create task list from documentation
6. Begin Phase 1 implementation
7. Use acceptance checklists to review work
8. Plan extensions after core launch

---

## Related Documents

- [SELECTION_GUIDE.md](SELECTION_GUIDE.md) — How to choose Structured vs Agile
- [README.md](README.md) — Overview of both delivery modes
- [Agile Delivery](../agile_delivery/README.md) — Alternative mode documentation
