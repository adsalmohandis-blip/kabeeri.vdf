# Acceptance Checklist Format

## Goal

Define a repeatable acceptance checklist format for reviewing AI-generated output inside Kabeeri VDF.

## Why acceptance checklists matter

AI can generate files quickly, but speed is not the same as quality.

An acceptance checklist protects the project from:

- accepting incomplete output
- accepting unrelated changes
- accepting unclear instructions
- accepting unsafe code or documentation
- accepting files that do not match the task scope
- closing GitHub Issues too early

## Standard checklist fields

Every acceptance checklist should include:

```text
Checklist title
Checklist type
Related task
Related issue
Related milestone
Reviewed output
Reviewer
Decision
Scope checks
File checks
Content checks
Safety checks
Testing/check checks
Documentation checks
Acceptance criteria
Remaining risks
Final notes
```

## Checklist title

Use a clear action-based title.

Example:

```text
Acceptance checklist for task #7
```

## Checklist type

Suggested types:

```text
ai-output
task-completion
folder-output
prompt-pack
document-set
release
security
manual-review
```

## Decision values

Use the values from:

```text
ACCEPTANCE_DECISIONS.md
```

## Reviewed output

List what is being reviewed.

Example:

```text
acceptance_checklists/README.md
acceptance_checklists/ACCEPTANCE_CHECKLIST_TEMPLATE.md
acceptance_checklists/acceptance.schema.json
```

## Required review areas

Every acceptance checklist should include at least:

```text
Scope review
File review
Content review
Safety review
Testing/check review
Final acceptance decision
```

## Scope review

Confirm the output matches the original task.

```text
- Does it solve the requested task?
- Did it avoid future features?
- Did it avoid unrelated folders?
```

## File review

Confirm files are correct.

```text
- Are file names clear?
- Are files in the correct folder?
- Were unrelated files changed?
```

## Content review

Confirm the content is useful.

```text
- Is it beginner-friendly?
- Is it structured?
- Is it clear enough for AI and humans?
```

## Safety review

Confirm no unsafe material was added.

```text
- No real secrets.
- No private keys.
- No private user data.
- No production credentials.
```

## Testing/check review

Confirm checks were run or documented.

```text
- Manual review.
- Schema validation if available.
- Framework-specific tests if code was changed.
- Git status review.
```

## Acceptance criteria

Define what must be true for the output to be accepted.

Example:

```text
- Checklist templates exist.
- Decisions are documented.
- A JSON schema exists.
- An example JSON file exists.
- The content is beginner-friendly.
```
