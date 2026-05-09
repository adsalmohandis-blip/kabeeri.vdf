# Natural Language Task Creation

Natural language task creation converts a user request into reviewable task cards.

## Required Task Card Fields

- title
- intent summary
- workstream
- task type
- source reference
- allowed files or scope
- forbidden files
- acceptance criteria
- risk level
- estimated cost level
- approval requirement
- suggested assignee role

## Rules

- Do not execute directly from vague text.
- Ask follow-up questions when scope, owner, acceptance, or affected files are unclear.
- Split work by workstream unless it is explicitly an integration task.
- Include cost level early: `low`, `medium`, or `high`.
- Attach provenance from user intent, questionnaire answer, document, issue, or post-work capture.

## Acceptance Criteria Generation

Acceptance criteria should be concrete, observable, and reviewable. Avoid broad phrases like "make it better" unless converted into specific checks.

