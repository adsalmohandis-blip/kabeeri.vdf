# Task Definition of Ready

A task is **Ready** when it meets all criteria in this checklist. Ready tasks can be pulled into development immediately.

---

## Task Definition of Ready (DoR) Checklist

Before a task moves from `pending` to `in-progress` status, verify:

### Identity (Required)

- [ ] **Task has unique ID:** `task-{uuid}` or `{prefix}-{number}`
- [ ] **Title is clear:** Understandable without extra context
- [ ] **No duplicate tasks:** Searched existing tasks, this is not a duplicate

### Scope (Required)

- [ ] **Clear description:** 2-3 sentences explaining the task
- [ ] **Included section complete:** Explicit list of what IS in scope
- [ ] **Excluded section complete:** Explicit list of what IS NOT in scope
- [ ] **Allowed files listed:** Explicit list of files that can be modified
- [ ] **Forbidden files listed:** Explicit list of files that cannot be touched

### Acceptance Criteria (Required)

- [ ] **Criteria exist:** Task has measurable acceptance criteria
- [ ] **Criteria are specific:** Not vague (e.g., "works well" ❌ vs "completes in <100ms" ✅)
- [ ] **Criteria are testable:** Can be verified objectively
- [ ] **Criteria are complete:** Cover functionality + quality + documentation
- [ ] **Team agrees on criteria:** Consensus on what "done" means

### Source & Provenance (Required)

- [ ] **Source type selected:** One value from: manual, questionnaire_answer, user_story, bug_report, etc.
- [ ] **Source reference provided:** Link or reference to originating source
- [ ] **Source is accessible:** Owner/team can find the source if needed
- [ ] **Source is valid:** Source actually exists (not made-up reference)

### Roles & Permissions (Required)

- [ ] **Owner identified:** Person/role who owns decision
- [ ] **Owner has authority:** Owner is authorized to make decisions
- [ ] **Assignee assigned:** Who will execute (person or "ai")
- [ ] **Assignee capable:** Assignee has skills to do the work
- [ ] **Reviewer identified:** Independent reviewer (not assignee)
- [ ] **Reviewer capable:** Reviewer can assess quality

### Estimation (Required)

- [ ] **Hour estimate provided:** 1-20 hour estimate (>20 = split task)
- [ ] **Hour estimate realistic:** Team agrees estimate is achievable
- [ ] **Token estimate provided:** Expected AI token consumption
- [ ] **No external blockers:** Task doesn't depend on other unfinished work
- [ ] **Dependencies resolved:** If task depends on others, they're complete

### Technical Readiness (Required)

- [ ] **Environment ready:** Dev environment set up
- [ ] **Access granted:** Assignee has necessary access
- [ ] **No breaking changes:** Task won't break existing functionality (unless intended)
- [ ] **Backward compatible:** Task maintains backward compatibility if applicable
- [ ] **Security reviewed:** No obvious security issues in scope

### Context & Knowledge (Required)

- [ ] **Assignee understands goal:** "Why" is clear, not just "what"
- [ ] **No vague requirements:** Specific details provided
- [ ] **Questions answered:** Clarifications from owner received
- [ ] **Design approved:** If design needed, it's approved
- [ ] **Architecture fits:** Task aligns with system architecture

### Process Compliance (Required)

- [ ] **Governance rules followed:** Task passes governance validation
- [ ] **Right size:** Fits in estimated time (not too large, not too small)
- [ ] **One concern:** Task addresses one thing (feature/bug/tech debt)
- [ ] **Not prohibited pattern:** Doesn't match prohibited patterns
- [ ] **Traceable:** Every decision can be traced back

---

## States Before Ready

### PENDING

Task exists but is not ready yet.

**Typical reasons:**
- Still clarifying requirements
- Waiting for owner approval
- Waiting for design
- Waiting for dependencies

**To move to READY:**
- Complete all clarifications
- Get owner approval
- Confirm design
- Verify dependencies exist

### Questions for Owner/Clarification

If task is not ready, identify specific blockers:

```markdown
## Blockers to Ready Status

- [ ] Missing clarification on X (ask: ___)
- [ ] Waiting for design approval (owner: ___)
- [ ] Dependent on task-123 (status: ___)
- [ ] Needs security review (owner: ___)
- [ ] Acceptance criteria not agreed (discuss: ___)
```

---

## Definition of Ready by Task Type

### Feature Task

DoR for new features:

- [ ] User story written (if Agile)
- [ ] Acceptance criteria include user value
- [ ] UI/UX mockup approved (if applicable)
- [ ] Database schema defined
- [ ] API contract defined
- [ ] Integration points identified

### Bug Fix Task

DoR for bug fixes:

- [ ] Bug is reproducible
- [ ] Steps to reproduce documented
- [ ] Root cause analyzed
- [ ] Fix approach approved
- [ ] Impact on other features assessed
- [ ] No existing tests mask this bug

### Tech Debt Task

DoR for technical debt:

- [ ] Why this matters (performance, maintainability, etc.)
- [ ] Current state documented
- [ ] Desired state described
- [ ] No functionality change (same behavior)
- [ ] Backward compatibility maintained
- [ ] Metrics for success defined

### Documentation Task

DoR for documentation:

- [ ] Content outline approved
- [ ] Audience identified
- [ ] Scope clear (what to document, what not to)
- [ ] Tool/format selected
- [ ] Review process defined
- [ ] Acceptance criteria for completeness

### Security Task

DoR for security work:

- [ ] Vulnerability described
- [ ] Severity assessed
- [ ] Fix approach approved by security team
- [ ] No partial fixes (must be comprehensive)
- [ ] Testing strategy defined
- [ ] Rollback plan in place

---

## Readiness vs Other Concepts

### Different from DoD (Definition of Done)

| DoR (Ready) | DoD (Done) |
|---|---|
| Before starting task | After completing task |
| "Is it clear what to do?" | "Is the work complete?" |
| Questions answered | Criteria verified |
| Design approved | Code reviewed |
| Example: Acceptance criteria clear | Example: Acceptance criteria met |

### Different from Blocked

**Blocked:** Task is in progress but stuck  
**Not Ready:** Task hasn't started and is blocked

### Different from Estimation

**Estimation:** Rough guess of effort (can be wrong)  
**DoR:** Specific, clear requirements (enables better estimation)

---

## Who Verifies Ready Status?

### Can Declare Ready:

✅ **Tech Lead** — Final authority  
✅ **Owner** — Stakeholder authority  
✅ **Scrum Master/Delivery Manager** — Process authority  

### Should Review Before Ready:

✅ **Assignee** — Must understand requirements  
✅ **Reviewer** — Should understand acceptance criteria  

### Cannot Declare Ready Alone:

❌ **Assignee** — (conflict: wants to start even if unclear)  

---

## Ready Checklist Template

Copy this to verify task readiness:

```markdown
# Task Readiness Review

**Task ID:** task-001  
**Reviewer:** tech-lead  
**Review Date:** 2026-05-07  

## Ready Checklist

- [ ] Identity verified
- [ ] Scope clear
- [ ] Acceptance criteria agreed
- [ ] Source traceable
- [ ] Roles assigned
- [ ] Estimation realistic
- [ ] Technical readiness confirmed
- [ ] Context understood
- [ ] Governance compliant

## Blocker Status

Ready? **YES / NO**

If NO, blockers:
- [ ] ...
- [ ] ...
- [ ] ...

## Sign-Off

Reviewed by: **[name]** (tech-lead)  
Approved: **[date]**  

Task moves to **IN-PROGRESS** status.
```

---

## Moving Task to In-Progress

Once task is **Ready** (DoR met):

1. **Update status:** `pending` → `ready` → `in-progress`
2. **Notify assignee:** "Task is ready for you to start"
3. **Start work:** Assignee begins implementation
4. **Use review checklist:** Prepare for review once done

---

## If Task Becomes Un-Ready During Development

If, during development, task becomes unclear or requirements change:

1. **Stop development:** Don't proceed with unclear requirements
2. **Mark as:** `blocked` or `pending_clarification`
3. **Notify owner:** "Need clarification on X"
4. **Get clarification:** Owner provides answer
5. **Resume:** Once ready again, move back to `in-progress`

---

## Ready in Different Delivery Modes

### Structured Delivery

**Ready = Detailed planning complete**

- All questionnaires for workstream answered
- Documentation generated
- Architecture agreed
- Task clearly maps to requirements

### Agile Delivery

**Ready = Sprint planning complete**

- Story accepted into sprint backlog
- Acceptance criteria refined
- Dependencies resolved
- Story estimated and prioritized

---

## DoR Is Not Perfection

**Ready** means:

✅ Clear enough to start  
✅ Questions answered  
✅ Resources allocated  
✅ Success criteria defined  

Ready does NOT mean:

❌ Perfect design (can evolve)  
❌ All requirements predicted (can learn)  
❌ No changes will happen (changes are expected)  
❌ Will take exactly estimated hours (estimate is guidance)  

---

## Common Failures to Avoid

| Mistake | How to Prevent |
|---------|---|
| **Mark ready before scope clear** | Use "Scope" section checklist |
| **Skip acceptance criteria** | Make criteria mandatory before ready |
| **Assign to wrong person** | Verify assignee capability |
| **Ready but dependencies blocked** | Check dependency status first |
| **Change requirements mid-development** | Get approval before making ready, freeze during dev |
| **Owner not involved in ready check** | Owner must sign-off before ready |
| **Too large to finish in estimated time** | Split if estimate >20 hours |

---

## Frequently Asked Questions

**Q: Can a task be "half ready"?**  
A: No. Either all DoR criteria are met (ready), or not (pending). Be binary about it.

**Q: Who decides if task is ready?**  
A: Tech lead + Owner together. If disagree, escalate to product lead.

**Q: Can ready status change?**  
A: Yes, if requirements change. Revert to `pending` and re-check DoR.

**Q: How long can task stay in "pending" status?**  
A: Shouldn't be >1 week. If longer, either make decision to cancel or ready-up.

**Q: What if task will never be ready?**  
A: Mark as `declined` or `archived`. Document why in task.

**Q: Can AI declare task ready?**  
A: No. Only humans (tech lead, owner) can declare ready.

---

## Related Documents

- [TASK_CREATION_RULES.md](TASK_CREATION_RULES.md) — How to create tasks
- [TASK_INTAKE_TEMPLATE.md](TASK_INTAKE_TEMPLATE.md) — Task template
- [TASK_SOURCE_RULES.md](TASK_SOURCE_RULES.md) — Where tasks come from
