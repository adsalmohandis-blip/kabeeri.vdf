# Task Intake Template

Use this template to create new tasks in Kabeeri VDF. Copy and fill out all sections, then save as `task-{id}-{slug}.md` in the appropriate location.

---

## Task Header (Required)

```markdown
# Task: [Clear, Action-Oriented Title]

**ID:** task-{unique-id} or {prefix}-{number}  
**Status:** pending  
**Created:** {ISO 8601 date}  
**Created By:** {name or email}  
**Version:** 1.0  

## Quick Summary

One-sentence description of what this task accomplishes.
```

---

## Task Overview (Required)

```markdown
## Overview

**Delivery Mode:** structured / agile  
**Intake Mode:** new_project / kabeeri_upgrade / non_kabeeri_adoption  
**Workstream/Epic:** [04_CORE_FEATURES or epic-name]  
**Priority:** critical / high / medium / low  
**Type:** feature / bug / tech-debt / documentation / security / performance  

### Why This Task Matters

2-3 sentences explaining the business value or technical reason for this task.

Example: "User profile queries are slow for accounts with 10k+ users, causing 5+ second page load times. This impacts user experience and is the #1 support complaint."
```

---

## Scope Definition (Required)

```markdown
## Scope

### Included

What IS part of this task:

- Email verification link generation
- 24-hour link expiration
- Link valid for 5 attempts
- Account locked until verified
- User notification email sent
- Unit and integration tests
- Database schema migration

### Excluded

What IS NOT part of this task:

- SMS verification (separate future task)
- Resend verification email button (separate task)
- Admin override capability (separate task)
- UI redesign (separate task)
- Performance optimization (separate future task)

### Allowed Files

Files that CAN be modified:

```
/src/auth/
/src/email/
/tests/auth/
/database/migrations/
/src/models/User.js
```

### Forbidden Files

Files that CANNOT be modified:

```
/src/config/database.js (database config is separate task)
/src/config/secrets.js (no secrets in task)
/public/ (UI separate)
.env.example (no env vars)
```

### Technical Constraints

Any technical requirements or restrictions:

- Use existing email service (no new providers)
- Must use OAuth token generation for link security
- Cannot add new NPM dependencies
- Database migrations must be backward-compatible
```

---

## Acceptance Criteria (Required)

```markdown
## Acceptance Criteria

Task is "done" only when ALL criteria are verified:

### Functional Requirements

- [ ] Verification link generated and sent on registration
- [ ] Link expires after 24 hours
- [ ] Link can be used maximum 5 times (then invalidated)
- [ ] Clicking link marks email as verified
- [ ] Account functionality locked until email verified
- [ ] User receives success message after verification
- [ ] User can request new verification link

### Technical Requirements

- [ ] No console errors or warnings
- [ ] Tests written with >90% code coverage
- [ ] All existing tests still pass
- [ ] No new security vulnerabilities (code review)
- [ ] Performance: link verification completes <100ms
- [ ] Database migration runs without errors

### Documentation Requirements

- [ ] README updated with email verification info
- [ ] API documentation updated
- [ ] Code comments explain complex logic
- [ ] CHANGELOG entry added

### Deployment Requirements

- [ ] Feature flag added (can disable without code change)
- [ ] No breaking changes to existing API
- [ ] Staging environment tested by QA
- [ ] Ready for production deployment
```

---

## Source & Provenance (Required)

```markdown
## Source & Provenance

### Source Type

What is the source of this task? (Required: one value)

- [ ] `manual` — Manually created by team
- [ ] `questionnaire_answer` — From questionnaire response
- [ ] `generated_document` — From AI-generated documentation
- [ ] `user_story` — From Agile user story
- [ ] `epic` — Derived from epic breakdown
- [ ] `sprint_planning` — From sprint planning session
- [ ] `acceptance_review` — From acceptance testing feedback
- [ ] `bug_report` — From bug report
- [ ] `github_issue` — From GitHub issue
- [ ] `ai_suggestion` — Suggested by AI agent
- [ ] `existing_project_scan` — From adoption project scan
- [ ] `migration_report` — From migration analysis

Selected: **manual**

### Source Reference

Link or reference to where this task came from (Required):

```
github://owner/repo/issues/42
questionnaire://02_PRODUCT_DEFINITION/question-5
ai://claude-suggestion-batch-3/item-7
email://product-lead@example.com/2026-05-06
meeting://sprint-planning-2026-05-06
```

**Example:** `github://owner/repo/issues/42` — User complaint about slow profile page

### Source Mode

How directly does this task relate to the source? (Required: one value)

- [ ] `direct` — Task directly implements source requirement
- [ ] `indirect` — Task supports implementing source requirement
- [ ] `derived` — Task derived from analyzing source
- [ ] `suggested` — Task is a suggestion based on source
- [ ] `required` — Task is a prerequisite for source

Selected: **direct**

### Related Tasks

Link to related tasks:

- Depends on: task-000 (database schema)
- Blocks: task-999 (user dashboard)
- Related to: task-001 (password reset)
```

---

## Roles & Permissions (Required)

```markdown
## Roles & Permissions

### Owner

**Who:** Person or role who owns the decision to execute this task  
**Responsibility:** Approve execution, clarify requirements  
**Can override:** Blocked status, change assignee  

Owner: **product-lead** (alice@example.com)

### Assignee

**Who:** Person (or "ai") who will execute the task  
**Responsibility:** Complete work, request clarification  

Assignee: **dev-001** (james@example.com)

OR

Assignee: **ai** (Claude with auth token)

### Reviewer

**Who:** Person who reviews completion before acceptance  
**Responsibility:** Verify acceptance criteria, check code quality  
**Requirement:** Not the assignee (no conflict of interest)  

Reviewer: **tech-lead** (senior-dev@example.com)

### Approval Workflow

1. **Owner** reviews task and approves to go to "in-progress"
2. **Assignee** executes the task
3. **Reviewer** checks acceptance criteria
4. If criteria met → **Owner** accepts and task moves to "completed"
5. If criteria not met → **Reviewer** sends back to "rework-needed"
```

---

## Estimation (Required)

```markdown
## Estimation

### Time Estimate

**Hours:** 6-8 hours

**Breakdown:**
- Research & setup: 1 hour
- Implementation: 4-5 hours
- Testing: 1-2 hours
- Documentation: 0.5 hours

### AI Token Estimate

**Estimated tokens:** 12,000 tokens

**Breakdown:**
- API implementation: 6,000
- Tests: 4,000
- Documentation: 2,000

### Resource Requirements

- AI tool (Claude, Cursor, Windsurf)
- Database access for migrations
- Email service API keys
```

---

## Metadata (Optional)

```markdown
## Metadata

### Tags

#feature #auth #user-experience #high-priority

### Labels

- enhancement
- user-requested
- security-related
- performance-sensitive

### Component

Which part of system does this affect?

- Component: Authentication Module
- Service: User Service
- Database: Users table

### Breaking Changes?

Will this change the API or database in breaking ways?

- [ ] No breaking changes
- [ ] API breaking (version bump required)
- [ ] Database breaking (migration required)
- [ ] Config breaking (env vars changed)

**If breaking:** Migration plan:

```
Version 1.5 → 1.6 migration:
1. Add new fields to database (backward-compatible)
2. Deploy v1.6 with feature flag disabled
3. Run data backfill script
4. Enable feature flag after validation
5. Remove old code in v1.7
```
```

---

## Implementation Notes (Optional)

```markdown
## Implementation Notes

### Technical Approach

How should this be implemented?

1. Generate secure token using crypto.randomBytes()
2. Store token + expiration + attempt count in VerificationToken table
3. Send email with link: /verify?token=xxx
4. Verify endpoint checks token validity and marks user verified

### Code Reference Points

Where in the codebase should this work?

- Copy pattern from: `/src/auth/resetPassword.js`
- Similar to: `/src/auth/sessionCreation.js`
- Update: `/src/models/User.js` schema

### Potential Pitfalls

Risks or challenges:

- Token collision (use UUID, not simple random)
- Race condition if user tries two verification attempts simultaneously
- Email delivery delays (expect 10-30 second lag)
- Timezone issues with expiration (use UTC always)

### Questions for Owner

Clarifications needed before starting:

- [ ] Should old verification links be invalidated if user requests new one?
- [ ] What's acceptable email delay before showing "verify email" UI?
- [ ] Should we log verification attempts for security audit?
- [ ] Is SMS verification planned? (affects database schema)
```

---

## Review Checklist (For Reviewer)

```markdown
## Review Checklist

Use this after task is submitted for review:

### Acceptance Criteria

- [ ] All functional criteria verified working
- [ ] All technical criteria met
- [ ] All documentation requirements complete
- [ ] Deployment requirements satisfied

### Code Quality

- [ ] Code follows project style guide
- [ ] No console errors or warnings
- [ ] Error handling adequate
- [ ] Security concerns addressed
- [ ] Performance acceptable

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Coverage >90%
- [ ] Edge cases covered
- [ ] Manual testing done

### Documentation

- [ ] Code comments clear
- [ ] README updated
- [ ] API docs updated
- [ ] CHANGELOG updated
- [ ] Examples provided

### Scope Compliance

- [ ] Only allowed files modified
- [ ] No forbidden files touched
- [ ] Scope matches original task
- [ ] No scope creep

### Approval

- [ ] Ready to accept? YES / NO
- [ ] If NO, describe issues:

```

---

## After Task Completion

```markdown
## Completion Summary

**Completed By:** {name}  
**Completed Date:** {ISO date}  
**PR Reference:** {github URL}  
**Deployment Date:** {ISO date}  

### What Was Done

Brief summary of what was accomplished:

- Email verification endpoint implemented
- Database migration deployed
- Tests passing with 95% coverage
- Documentation updated

### Lessons Learned

What did the team learn? What would do differently?

- Email delivery was slower than expected
- Token generation could be faster with index optimization
- Should have added admin dashboard for verification troubleshooting

### Next Steps

What comes next?

- Task-002: Add resend verification email button
- Task-003: Add verification analytics
- Monitor: Verify email failure rates in production
```

---

## Usage Instructions

### To Create a New Task

1. Copy this template
2. Fill in all **Required** sections (marked with Required label)
3. Fill in relevant **Optional** sections
4. Save as `task-{id}-{slug}.md`
5. Commit to git with message: `feat: create task {id} - {title}`
6. Submit for owner approval
7. Once approved, task moves to `ready` status

### To Use for AI Task Execution

1. Collect completed task file
2. Send to AI tool (Claude, Cursor, Windsurf)
3. Include: scope, acceptance criteria, implementation notes
4. AI executes task following the criteria
5. Submit work for reviewer approval

### To Submit for Review

1. Update **Status** to `review_needed`
2. Include link to PR/code
3. Reviewer uses **Review Checklist**
4. If approved → mark as `completed`
5. If rework needed → mark as `rework_needed` with notes

---

## Template Sections Quick Reference

| Section | Required? | Notes |
|---------|-----------|-------|
| Task Header | ✅ | ID, status, dates |
| Overview | ✅ | Mode, workstream, priority |
| Scope | ✅ | Included/excluded/allowed/forbidden |
| Acceptance Criteria | ✅ | Measurable requirements |
| Source & Provenance | ✅ | Where task came from |
| Roles & Permissions | ✅ | Owner, assignee, reviewer |
| Estimation | ✅ | Hours and tokens |
| Metadata | ⭕ | Tags, components, breaking changes |
| Implementation Notes | ⭕ | Technical approach, pitfalls |
| Review Checklist | ⭕ | For reviewer (filled after submission) |
| Completion Summary | ⭕ | Filled after task done |

✅ = Required  
⭕ = Optional but recommended

---

## Example: Completed Task Template

See [task-example.md](task-example.md) for a fully filled-out example task.

---

## Related Documents

- [TASK_CREATION_RULES.md](TASK_CREATION_RULES.md) — Governance rules
- [TASK_DEFINITION_OF_READY.md](TASK_DEFINITION_OF_READY.md) — When task is ready
- [TASK_SOURCE_RULES.md](TASK_SOURCE_RULES.md) — Source type definitions
