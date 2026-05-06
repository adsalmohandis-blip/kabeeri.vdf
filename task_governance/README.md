# Task Governance and Provenance

**v1.3.0** establishes strict governance rules for task creation, ensuring every task is:
- Clear and scoped
- Traceable to its origin
- Ready before execution
- Properly reviewed

---

## Overview

Kabeeri VDF prevents random or unclear work by enforcing task governance:

1. **Clear governance rules** — What makes a valid task
2. **Strict validation** — All required fields present
3. **Provenance tracking** — Every task traces back to a source
4. **Ready criteria** — Task must be ready before starting
5. **Review process** — Independent review before acceptance

---

## The Problem This Solves

Without governance:

❌ Tasks are vague ("Build feature X")  
❌ Tasks have no acceptance criteria  
❌ No one knows where task came from  
❌ AI executes random tasks  
❌ Tech debt accumulates without tracking  
❌ Same work redone multiple times  

With governance:

✅ All tasks have clear scope and criteria  
✅ Every task traceable to a decision  
✅ Only "ready" tasks executed  
✅ Independent review before acceptance  
✅ Tech debt tracked and managed  
✅ No duplicate work  

---

## Key Documents

### [TASK_CREATION_RULES.md](TASK_CREATION_RULES.md)

Core governance rules for creating tasks:

- **Required properties** — What every task must have
- **States and transitions** — Task lifecycle
- **Who can do what** — Permissions matrix
- **Validation rules** — What makes a valid task
- **Prohibited patterns** — What NOT to do
- **Governance checklist** — Verify before creating

**When to use:** Before creating a task, read this to ensure you follow governance.

### [TASK_INTAKE_TEMPLATE.md](TASK_INTAKE_TEMPLATE.md)

Template for creating tasks:

- **Full template** — Copy-and-fill structure
- **All sections** — Identity, scope, acceptance, source, roles, estimation
- **Usage instructions** — How to fill it out
- **Examples** — What good looks like
- **Review checklist** — For reviewer after submission

**When to use:** Creating a new task? Copy this template and fill it out.

### [TASK_DEFINITION_OF_READY.md](TASK_DEFINITION_OF_READY.md)

Criteria for when task is ready to start:

- **DoR Checklist** — All criteria to meet before in-progress
- **When ready** — Clear decision point
- **Before starting** — What owner should verify
- **If not ready** — How to identify blockers

**When to use:** Before assigning to someone, verify task is ready using this checklist.

### [TASK_SOURCE_RULES.md](TASK_SOURCE_RULES.md)

Rules for task provenance and source tracing:

- **12 valid source types** — Where tasks can come from
- **5 source modes** — How directly related to source
- **Validation rules** — What makes a valid source
- **Tracing chains** — How to trace task back to decision
- **Common patterns** — Typical task origin scenarios

**When to use:** Creating task, ensure it has valid source. Reviewing task, verify source is traceable.

---

## Task Governance Workflow

```
1. IDENTIFY SOURCE
   ↓
   Where does this task come from?
   (questionnaire answer, bug report, sprint planning, etc.)
   ↓
2. CREATE TASK (using template)
   ↓
   Fill all required fields using TASK_INTAKE_TEMPLATE.md
   ↓
3. VALIDATE TASK
   ↓
   Check against TASK_CREATION_RULES.md
   Submit for owner review
   ↓
4. VERIFY READY
   ↓
   Use TASK_DEFINITION_OF_READY.md checklist
   Owner approves
   ↓
5. ASSIGN & EXECUTE
   ↓
   Assignee begins work
   ↓
6. REVIEW COMPLETION
   ↓
   Reviewer checks acceptance criteria
   ↓
7. ACCEPT & CLOSE
   ↓
   Task marked complete
   Learning logged
```

---

## Task Required Fields (Quick Reference)

Every task MUST have:

| Field | Why | Example |
|-------|-----|---------|
| **id** | Unique identifier | task-001 |
| **title** | Clear description | Add email verification |
| **description** | 2-3 sentence explanation | Email verification link sent on signup, valid 24h, max 5 attempts |
| **scope.included** | What IS included | Verification link, 24h expiry, retry limit |
| **scope.excluded** | What IS NOT included | SMS verification, admin override |
| **scope.allowed_files** | Can modify | /src/auth/, /tests/ |
| **scope.forbidden_files** | Cannot modify | /src/config/, /public/ |
| **acceptance_criteria** | Measurable requirements | [ ] Link sent, [ ] 24h expiry, [ ] Tests pass |
| **source_type** | Where task came from | questionnaire_answer, bug_report, etc. |
| **source_reference** | Link to source | questionnaire://02_PRODUCT/q-5 |
| **owner** | Decision maker | product-lead |
| **assignee** | Who executes | dev-001 or ai |
| **reviewer** | Independent reviewer | tech-lead |
| **workstream** | Major area | 04_CORE_FEATURES |
| **estimated_hours** | Hour estimate | 6 |
| **estimated_tokens** | AI token estimate | 12000 |
| **priority** | Importance | high |
| **status** | Current state | pending |

---

## States and Permissions Matrix

### Who Can Do What?

| Permission | Can Create | Can Approve | Can Assign | Can Review |
|---|---|---|---|---|
| **Tech Lead** | ✅ | ✅ | ✅ | ✅ |
| **Product Owner** | ✅ | ✅ | ✅ | ⚠️ |
| **Developer** | ⚠️ | ❌ | ❌ | ✅ |
| **Assignee** | ❌ | ❌ | ❌ | ❌ |
| **AI Agent** | ⚠️ | ❌ | ❌ | ❌ |

✅ = Full authority  
⚠️ = With restrictions  
❌ = Not allowed

---

## Task Lifecycle

```
PENDING
├─ Owner reviews
├─ Clarifications gathered
└─ Ready? YES
   ↓
READY (via DoR checklist)
├─ Assignee assigned
└─ Status → IN_PROGRESS
   ↓
IN_PROGRESS
├─ Work being done
├─ Blocker? → BLOCKED
└─ Complete? → REVIEW_NEEDED
   ↓
REVIEW_NEEDED
├─ Reviewer checks criteria
├─ Passes? → COMPLETED
└─ Fails? → REWORK_NEEDED
   ↓
REWORK_NEEDED
├─ Issues fixed
└─ Status → REVIEW_NEEDED (retry)
```

---

## Structured vs Agile Task Governance

### Structured Mode

**Task creation timing:** All upfront (during planning phase)  
**Typical source:** questionnaire_answer, generated_document  
**Task size:** 2-6 hours each, planned before execution  
**Review frequency:** Per phase completion  
**Owner role:** Workstream lead  

### Agile Mode

**Task creation timing:** Per sprint (just-in-time)  
**Typical source:** user_story, sprint_planning, bug_report  
**Task size:** 1-2 hour stories, 2-4 hour tasks  
**Review frequency:** Per sprint (bi-weekly)  
**Owner role:** Product owner  

---

## Prohibited Task Patterns

### Pattern 1: Vague Scope ❌

```
Title: "Improve performance"
Acceptance: "System is faster"
```

### Pattern 2: Multiple Concerns ❌

```
Title: "Add auth and payments"
```

### Pattern 3: No Source ❌

```
source_type: unknown
source_reference: null
```

### Pattern 4: Too Large ❌

```
Title: "Build entire billing system"
Estimated: 200 hours
```

### Pattern 5: Conflict of Interest ❌

```
Owner: dev-001
Assignee: dev-001
Reviewer: dev-001
```

### Pattern 6: Forbidden Files ❌

```
scope.forbidden_files: [/src/config/]
[But task modifies /src/config/]
```

---

## Implementation Timeline

### Week 1: Foundation

- [ ] Document all task governance rules
- [ ] Create task template
- [ ] Define DoR checklist
- [ ] Train team on rules

### Week 2: Migration

- [ ] Review existing tasks against governance
- [ ] Update non-compliant tasks
- [ ] Document exceptions (if any)
- [ ] Set up validation process

### Week 3+: Enforcement

- [ ] All new tasks follow governance
- [ ] Periodic governance reviews
- [ ] Continuous improvement
- [ ] Tool/CLI integration (future)

---

## Common Questions

**Q: Do all tasks need AI-estimated tokens?**  
A: Yes. Even human tasks should estimate token usage for budget tracking.

**Q: Can task source be "internal discussion"?**  
A: Only if documented (Slack channel, meeting notes with date/people). Vague internal discussion doesn't count.

**Q: What if task is wrong after starting?**  
A: Move to BLOCKED, notify owner, clarify or cancel task.

**Q: Can AI suggest tasks?**  
A: Yes (source_type: ai_suggestion), but owner must approve before execution.

**Q: What's the minimum task scope?**  
A: ~1 hour (smaller tasks should be combined). No 5-minute tasks.

**Q: What's the maximum task scope?**  
A: ~20 hours (larger tasks should be split). No 100-hour tasks.

---

## Governance Benefits

### For Teams

✅ **Clear expectations** — Everyone knows what's needed  
✅ **Reduced rework** — Clear criteria prevent misalignment  
✅ **Better tracking** — Every task is traceable  
✅ **Faster reviews** — Criteria-based review is objective  

### For AI

✅ **Better context** — AI understands why task exists  
✅ **Clearer requirements** — AI has exact criteria  
✅ **Better implementation** — AI follows proven patterns  
✅ **Easier review** — AI work objectively checked  

### For Product

✅ **Better visibility** — Know what's being built and why  
✅ **Scope control** — Prevent feature creep  
✅ **Roadmap clarity** — Tasks trace back to decisions  
✅ **Quality assurance** — All work reviewed before acceptance  

---

## Next Steps

1. **Read all governance documents** in order:
   - [TASK_CREATION_RULES.md](TASK_CREATION_RULES.md)
   - [TASK_INTAKE_TEMPLATE.md](TASK_INTAKE_TEMPLATE.md)
   - [TASK_DEFINITION_OF_READY.md](TASK_DEFINITION_OF_READY.md)
   - [TASK_SOURCE_RULES.md](TASK_SOURCE_RULES.md)

2. **Train your team** on governance rules

3. **Create first task** using template

4. **Review with checklist** before execution

5. **Document learnings** and adjust rules as needed

---

## Task Governance in Different Scenarios

### Scenario 1: New Project (Structured)

1. Answer questionnaires (planning phase)
2. Generate documentation from answers
3. Create tasks from documentation
4. All tasks traced to questionnaire or document
5. Governance prevents random feature additions

### Scenario 2: New Project (Agile)

1. Vision workshop creates initial backlog
2. Sprint planning creates sprint tasks
3. Each task traced to user story or bug
4. DoR ensures sprint readiness
5. Governance prevents mid-sprint chaos

### Scenario 3: Project Adoption

1. Scan existing project
2. Create adoption tasks from scan findings
3. All tasks traced to scan report
4. Governance prevents blindly modifying existing code
5. Adoption becomes tracked and managed

---

## Schema Integration

Task governance integrates with [../schemas/task.schema.json](../schemas/task.schema.json):

- Schema validates required fields
- Schema enforces source_type values
- Schema validates permissions
- Schema enables CLI validation (v1.3+)

---

## AI Integration

### AI Creating Tasks

```
AI: "Suggest task: Add webhook support"
AI source_type: ai_suggestion
AI source_mode: suggested

Owner: "Approve this suggestion"
Owner action: Change status pending → ready

AI: "Executes approved task"
```

### AI Executing Tasks

```
AI reads task governance fields:
- Scope: What can I modify?
- Acceptance criteria: How do I know when done?
- Source: Why does this task exist?
- Allowed files: What can I touch?
- Forbidden files: What's off limits?

AI: "Execute task following governance"
```

---

## Future Enhancements (v1.4+)

- CLI tool to validate tasks
- GitHub integration for task validation
- Dashboard showing governance metrics
- AI-suggested task templates
- Automatic compliance checking
- Team governance reports

---

## Related Documents

- [Project Intake](../project_intake/README.md) — How projects start
- [Delivery Modes](../delivery_modes/README.md) — Structured vs Agile context
- [Agile Delivery](../agile_delivery/README.md) — Sprint-based task context
- [Task Schema](../schemas/task.schema.json) — JSON schema validation
