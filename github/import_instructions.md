# GitHub Import Instructions

These instructions are safe-by-default. Do not run GitHub mutations unless the Owner explicitly approves.

## Preconditions

- Work from a feature branch, not `main`.
- Confirm `gh auth status`.
- Confirm repository target.
- Review `github/labels.json`, `github/milestones.md`, and `github/issues_backlog.md`.
- Confirm Owner approval for GitHub mutation.

## Safe Dry Review

```bash
gh auth status
gh repo view
```

## Labels

Create labels manually from `github/labels.json`, or use a reviewed script after Owner approval.

## Milestones

Create milestones from `github/milestones.md`. Keep milestone names stable so issues can be grouped predictably.

## Issues

For each issue:

- copy title
- add labels
- assign milestone
- paste body using the issue body template
- include source/version
- include scope
- include acceptance criteria
- include Owner verify requirement
- include cost/design/security notes where applicable

## Prohibited Without Fresh Approval

- pushing directly to `main`
- closing issues
- publishing releases
- creating tags
- changing repository settings
- mutating GitHub from scripts

