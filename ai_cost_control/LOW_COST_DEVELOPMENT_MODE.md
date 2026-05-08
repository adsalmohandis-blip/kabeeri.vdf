# Low-Cost Development Mode

Low-Cost Development Mode is a project or task mode that favors lower token usage, smaller context, and cheaper execution paths.

## Default Behavior

- Ask whether the task can be solved with existing templates or docs first.
- Generate a task context pack instead of sending the whole repository.
- Prefer summaries, file lists, and targeted excerpts.
- Use cheaper models for classification, summarization, and checklist generation.
- Reserve premium models for complex architecture, production code changes, security-sensitive review, or high-risk debugging.
- Require approval before a high-cost run when budgets are near limit.

## Allowed Shortcuts

- Use existing schemas and templates before asking AI to invent new structures.
- Reuse prior memory summaries and ADRs.
- Split high-cost work into planning, implementation, and verification tasks.
- Run local validators/tests before asking AI to inspect failures.

## Approval Triggers

Owner or Maintainer approval is required when:

- estimated task cost exceeds the task budget
- estimated sprint cost exceeds the sprint warning threshold
- the task requires broad repository context
- the task touches secrets, security, payments, migration, release, or publish scope
- premium AI is requested after a low-cost path is available

