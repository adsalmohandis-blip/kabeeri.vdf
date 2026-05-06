# Task Source Rules and Provenance

Every task in Kabeeri VDF must have a traceable source. This document defines what sources are valid and how to trace task origin.

---

## Core Principle

**Every task must answer: "Where did this task come from?"**

A task without a source is a "random task" and is prohibited.

---

## Valid Source Types

### 1. Manual

**What:** Task created manually by team/person  
**When:** Team explicitly decides to create task  
**Example:** "We realized we should add two-factor authentication"  

**Source Reference:** Who decided?
```
source_reference: "email://product-lead@example.com/2026-05-06"
source_reference: "meeting://team-sync-2026-05-06"
source_reference: "slack://channel-discussion/2026-05-06"
```

### 2. Questionnaire Answer

**What:** Task derived from questionnaire response during planning  
**When:** Structured mode: questions answered, features identified  
**Example:** Questionnaire Q5 asks "What's your primary user signup flow?" → Answer requires task  

**Source Reference:** Link to specific question and answer:
```
source_reference: "questionnaire://02_PRODUCT_DEFINITION/question-5/answer-1"
source_reference: "questionnaire://04_CORE_FEATURES/feature-list"
```

### 3. Generated Document

**What:** Task identified while creating AI-generated documentation  
**When:** Document generation reveals implementation needs  
**Example:** "Architecture document recommends API rate limiting" → Create implementation task  

**Source Reference:** Link to document that suggested it:
```
source_reference: "document://03_ARCHITECTURE_AND_DESIGN/README.md#section-api-design"
source_reference: "document://04_CORE_FEATURES/authentication.md"
```

### 4. User Story (Agile)

**What:** Task broken down from user story  
**When:** Agile mode: story in sprint needs task breakdown  
**Example:** Story "As user, I want to reset password" → Tasks: email flow, token gen, UI  

**Source Reference:** Link to user story:
```
source_reference: "story://sprint-001/user-story-auth-reset"
source_reference: "github://owner/repo/issues/101"
```

### 5. Epic (Agile)

**What:** Task from epic breakdown  
**When:** Epic too large, needs breaking into stories/tasks  
**Example:** Epic "User Authentication System" → Multiple task breakdowns  

**Source Reference:** Link to epic:
```
source_reference: "epic://auth-system"
source_reference: "github://owner/repo/milestone/authentication"
```

### 6. Sprint Planning

**What:** Task identified during sprint planning session  
**When:** Team decides what to work on this sprint  
**Example:** "We need to optimize database queries for this sprint"  

**Source Reference:** Link to sprint or meeting notes:
```
source_reference: "sprint://sprint-001/planning-session"
source_reference: "meeting://sprint-planning-2026-05-07"
```

### 7. Acceptance Review

**What:** Task to fix issues found during acceptance testing  
**When:** Reviewer finds acceptance criteria not met  
**Example:** "Acceptance review found bug: emails not sending"  

**Source Reference:** Link to acceptance review:
```
source_reference: "acceptance://task-042/review-2026-05-06"
source_reference: "document://acceptance_checklist_report.md"
```

### 8. Bug Report

**What:** Task to fix a reported bug  
**When:** Bug reported (customer, internal, QA)  
**Example:** "User profile page crashes on >10k users"  

**Source Reference:** Link to bug report:
```
source_reference: "github://owner/repo/issues/42"
source_reference: "email://customer@example.com/bug-report-2026-05-01"
source_reference: "slack://channel-bugs/thread-123"
```

### 9. GitHub Issue

**What:** Task to address GitHub issue  
**When:** Issue created in tracking system  
**Example:** Enhancement request, performance issue, feature request  

**Source Reference:** Link to GitHub issue:
```
source_reference: "github://owner/repo/issues/42"
source_reference: "github://owner/repo/pull/123"
```

### 10. AI Suggestion

**What:** Task suggested by AI agent  
**When:** AI analysis suggests a task  
**Example:** "I notice you have no rate limiting. Should I create task for it?"  

**Source Reference:** Link to AI suggestion:
```
source_reference: "ai://claude-analysis-batch-5/suggestion-3"
source_reference: "ai://cursor-review/line-42-suggestion"
```

**Important:** AI-suggested tasks must be approved by owner before execution.

### 11. Existing Project Scan

**What:** Task identified during adoption scanning  
**When:** Non-Kabeeri project being adopted  
**Example:** "Scan found missing rate limiting" → Create task  

**Source Reference:** Link to scan report:
```
source_reference: "adoption://project-scan-report/finding-5"
source_reference: "document://.kabeeri/adoption_scan/ADOPTION_REPORT.md#finding"
```

### 12. Migration Report

**What:** Task from analysis of project upgrade/migration  
**When:** Project migrated from old system or old Kabeeri version  
**Example:** "Migration recommends refactoring auth module"  

**Source Reference:** Link to migration report:
```
source_reference: "migration://v1.0.0-to-v1.1.0/compatibility-report"
source_reference: "document://migration_analysis.md"
```

---

## Source Modes

Beyond the **type** of source, also specify the **mode** (how directly related):

### Direct

**Definition:** Task directly implements the source requirement  
**Example:** Bug report says "Search crashes on special characters" → Task to fix search input validation  

```
source_type: bug_report
source_mode: direct
source_reference: github://owner/repo/issues/42
```

### Indirect

**Definition:** Task supports implementing the source requirement  
**Example:** Questionnaire asks for "Advanced search" → Task to create database index (indirect support)  

```
source_type: questionnaire_answer
source_mode: indirect
source_reference: questionnaire://04_CORE_FEATURES/q-advanced-search
```

### Derived

**Definition:** Task derived from analyzing the source (not explicit)  
**Example:** Architecture doc says "Uses REST API" → Task to add API authentication (not explicitly asked)  

```
source_type: generated_document
source_mode: derived
source_reference: document://03_ARCHITECTURE_AND_DESIGN/README.md
```

### Suggested

**Definition:** Task is a suggestion based on source, not a requirement  
**Example:** "You don't have this, would you like me to create task?"  

```
source_type: ai_suggestion
source_mode: suggested
source_reference: ai://claude-analysis/suggestion-7
```

### Required

**Definition:** Task is a prerequisite/blocker for implementing source  
**Example:** User story requires API, but API doesn't exist → Create API task first  

```
source_type: user_story
source_mode: required
source_reference: story://sprint-001/user-payment-processing
```

---

## Task Provenance Chain

Show the full chain from original decision to task:

```markdown
## Provenance Chain

**Original Request** (source_type: questionnaire_answer)
→ Question 5: "How do users authenticate?"
→ Answer: "Email + password, plus OAuth"

**Generated Documentation** (source_type: generated_document)
→ 02_PRODUCT_DEFINITION.md says: "OAuth required for enterprise customers"

**Task Created** (source_type: generated_document)
→ Task-042: "Implement Google OAuth integration"

**Why this chain matters:**
- If original questionnaire answer changes, we know which docs and tasks may be affected
- We can trace why a task exists all the way back to a decision
- Easier to argue "should we keep this task?" by referencing original decision
```

---

## Source Validation Rules

Before accepting a task, verify source:

### Validation Checklist

- [ ] **Source type is valid:** One of the 12 types defined above
- [ ] **Source reference is accessible:** Can you find the actual source document?
- [ ] **Source reference is correct:** Does the reference actually match the source?
- [ ] **Source mode makes sense:** Direct/indirect/derived/suggested/required (pick one)
- [ ] **Not orphaned:** Task doesn't exist without source (unless manual task approved)
- [ ] **Not duplicate source:** Two tasks don't reference the same source (unless intentional)

### Invalid Sources (Rejected)

❌ **No source specified**  
```
source_type: unknown
source_reference: null
```
→ Reject: Create task with clear source first

❌ **Vague source reference**  
```
source_type: manual
source_reference: "Team thought it was a good idea"
```
→ Reject: Get specific source (meeting date, email, etc.)

❌ **Dead link source**  
```
source_type: github_issue
source_reference: "github://owner/repo/issues/999" (issue deleted)
```
→ Reject: Source must be accessible (archive if needed)

❌ **AI-suggested without approval**  
```
source_type: ai_suggestion
source_reference: ai://claude/suggestion-123
status: in_progress (already executing!)
```
→ Reject: AI suggestions must be approved before execution (move to pending)

---

## Tracing Tasks Back to Decisions

### Scenario 1: Why Was Task-042 Created?

```
Task-042: Implement Google OAuth

→ source_type: generated_document
→ source_reference: document://02_PRODUCT_DEFINITION/README.md
→ Referencing: "Enterprise customers require OAuth (from questionnaire)"
→ Questionnaire reference: questionnaire://02_PRODUCT_DEFINITION/q-auth-methods
→ Answer: "OAuth required for enterprise"
→ Original decision: Product lead decided "we need enterprise plan" (meeting notes 2026-04-01)

RESULT: Task exists because of deliberate decision to support enterprise customers
```

### Scenario 2: Why Was Task-019 Created?

```
Task-019: Fix slow profile page

→ source_type: bug_report
→ source_reference: github://owner/repo/issues/89
→ Bug report says: "Profile page slow on >10k users"
→ Bug created by: Customer support report (email 2026-05-01)
→ Performance impact: 5+ second load time

RESULT: Task exists because real customer reported actual problem
```

### Scenario 3: Why Was Task-099 Created?

```
Task-099: Add webhook support

→ source_type: ai_suggestion
→ source_reference: ai://cursor-analysis/suggestion-batch-7
→ AI said: "You have REST API, should add webhooks for real-time updates"
→ Status: pending (AI suggested, not yet approved)
→ Owner: product-lead
→ Waiting for: Product lead to approve before execution

RESULT: Task exists as suggestion; waiting for human approval
```

---

## Handling Source Conflicts

### Multiple Sources for One Task

Sometimes a task comes from multiple sources:

```markdown
## Multiple Sources

**Primary source:**
- source_type: user_story
- source_reference: story://sprint-001/payment-processing

**Supporting sources:**
- AI suggestion: ai://claude-analysis/recommendation-3
- Bug report: github://owner/repo/issues/50
- Architecture requirement: document://03_ARCHITECTURE_AND_DESIGN/README.md

All sources support the same task, strengthening the case for its importance.
```

### Conflicting Sources

If sources conflict, escalate to owner:

```markdown
## Source Conflict

**Questionnaire answer says:** "Don't add real-time features yet"

**AI suggestion says:** "Real-time features would improve UX"

**User bug report says:** "We need real-time notifications"

ACTION REQUIRED:
- Owner to decide: prioritize questionnaire or user feedback?
- Create task-002 to investigate real-time feasibility
- If feasible, may change product decision
```

---

## Documentation Location

### Task File

Include source in task file header:

```markdown
# Task: Implement Google OAuth

**ID:** task-042  
**Source Type:** generated_document  
**Source Reference:** document://02_PRODUCT_DEFINITION/README.md  
**Source Mode:** direct  

## Source Context

Generated documentation recommended OAuth integration for enterprise support. This task implements that recommendation.
```

### Decision Log

Also document in `.kabeeri/metadata/decisions.json`:

```json
{
  "decisions": [
    {
      "id": "dec-001",
      "title": "Support enterprise customers with OAuth",
      "context": "Questionnaire answered: enterprise is target market",
      "decision": "OAuth required for enterprise plan",
      "date": "2024-01-15",
      "status": "active",
      "tasks": ["task-042"]
    }
  ]
}
```

---

## Source Tracing in Agile vs Structured

### Structured Mode

Most tasks source from:
- Questionnaire answers (direct source)
- Generated documents (one step away from questionnaire)
- Manual team decisions (second level)

### Agile Mode

Most tasks source from:
- User stories (direct source)
- Sprint planning (one step away)
- Bug reports (direct source)
- AI suggestions (emerging source)

---

## AI Usage with Sources

### When AI Creates Tasks

Rule: AI must trace to valid source:

```
❌ Bad: AI creates random task
"I think we should add feature X"
→ No source, rejected

✅ Good: AI suggests from analysis
"Analysis of questionnaire shows we need feature X"
→ source_type: generated_document, source_mode: derived
→ Approved if owner agrees
```

### When AI Executes Tasks

AI uses source to understand context:

```
Task: Implement OAuth

AI uses source context:
→ Document/questionnaire recommended OAuth
→ Enterprise customers need it
→ Security requirements defined
→ Success metrics defined

Result: AI generates better implementation with context
```

---

## Common Source Patterns

### Pattern 1: Questionnaire → Documentation → Tasks

```
Q: "What's your primary revenue model?"
Answer: "Subscription"
↓
Generated document: "Subscription system design"
↓
Task-1: "Build subscription payment processing"
Task-2: "Build subscription management UI"
Task-3: "Add usage-based billing calculations"
```

### Pattern 2: Bug → Investigation → Tasks

```
Bug Report: "Search results sometimes empty"
↓
Investigation: "Query doesn't handle special chars"
↓
Task-1: "Add input sanitization"
Task-2: "Add tests for special characters"
Task-3: "Update search documentation"
```

### Pattern 3: AI Suggestion → Approval → Tasks

```
AI: "Suggest adding rate limiting"
↓
Owner: "Approve, high priority"
↓
Task-1: "Design rate limiting strategy"
Task-2: "Implement rate limiting middleware"
Task-3: "Add rate limit tests"
```

---

## Related Documents

- [TASK_CREATION_RULES.md](TASK_CREATION_RULES.md) — Task governance
- [TASK_INTAKE_TEMPLATE.md](TASK_INTAKE_TEMPLATE.md) — Task template
- [TASK_DEFINITION_OF_READY.md](TASK_DEFINITION_OF_READY.md) — When task is ready
