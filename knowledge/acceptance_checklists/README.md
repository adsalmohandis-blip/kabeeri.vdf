# Acceptance Checklists

This directory defines the acceptance checklist layer for **Kabeeri Vibe Developer Framework**.

The current folder started as a simple framework asset placeholder. This improved version turns it into a practical quality gate system for reviewing AI-generated work before considering a task, folder, prompt pack, or release complete.

## Purpose

Acceptance checklists help vibe developers answer one important question:

```text
Is this AI-generated output good enough to accept?
```

They connect:

```text
Task definition
→ AI output
→ human review
→ quality checks
→ acceptance decision
→ commit
→ issue closure
```

## What this folder is

This folder provides checklist templates for:

- reviewing AI-generated files
- accepting a task
- accepting a folder output
- accepting a prompt pack
- accepting a generated document set
- accepting a release candidate
- recording review notes and final decision

## What this folder is not

This folder is not a replacement for:

- automated tests
- security review
- code review by experts
- production QA
- legal review
- compliance review

It is a framework-level checklist system that helps beginners avoid accepting AI output too quickly.

## Recommended workflow

```text
1. Start from a task in task_tracking/.
2. Run one AI prompt or one implementation step.
3. Review changed files.
4. Use the matching acceptance checklist.
5. Mark each item as pass, fail, or not applicable.
6. If important items fail, send the output back to AI for fixes.
7. Accept only after the checklist passes.
8. Commit and close the related GitHub Issue.
```

## Acceptance decision values

Use these values:

```text
accepted
needs_changes
blocked
rejected
not_applicable
```

## Folder contents

```text
README.md
README_AR.md
ACCEPTANCE_CHECKLIST_FORMAT.md
ACCEPTANCE_CHECKLIST_TEMPLATE.md
ACCEPTANCE_DECISIONS.md
AI_OUTPUT_ACCEPTANCE_CHECKLIST.md
TASK_COMPLETION_ACCEPTANCE_CHECKLIST.md
FOLDER_OUTPUT_ACCEPTANCE_CHECKLIST.md
PROMPT_PACK_ACCEPTANCE_CHECKLIST.md
RELEASE_ACCEPTANCE_CHECKLIST.md
acceptance.schema.json
acceptance.schema.example.json
acceptance_checklists_manifest.json
```

## Minimum acceptance rule

## v1 Checklist Coverage

The v1 checklist set covers:

- task completion review
- folder output review
- prompt pack review
- AI output review
- release candidate review
- acceptance decision recording

These checklists are human review aids. They do not replace tests, expert code review, security review, or Owner verification rules introduced in later roadmap phases.

A task should not be marked as Done unless:

```text
- The output matches the task scope.
- No unrelated files were modified.
- No real secrets were added.
- The output is understandable.
- The required checks/tests were run or clearly documented.
- Remaining risks are documented.
```

## AI usage rule

When asking AI to review or fix output, include:

```text
You are reviewing output for Kabeeri Vibe Developer Framework.

Use the acceptance checklist.
Do not add new scope.
Fix only failed checklist items.
Do not modify unrelated files.
Explain what changed.
List remaining risks.
Stop after completing this review/fix.
```

## Commit example

```bash
git add acceptance_checklists
git commit -m "Create first acceptance checklist templates for v0.1.1

Closes #7"
git push
```

## Status

Foundation acceptance checklist templates for `v0.1.1`.
