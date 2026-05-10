# Agile Release Plan Template

Use this template to connect Agile delivery to a concrete release or demo target.

## Release Identity

- Release ID:
- Title:
- Goal:
- Target date:
- Audience: internal QA / owner demo / client demo / production

## Included Scope

- Epics:
- Stories:
- Out of scope:

## Release Criteria

- [ ] Required stories are accepted.
- [ ] Required checks are complete.
- [ ] Critical/high impediments are resolved or explicitly accepted.
- [ ] Security, migration, handoff, release, and GitHub write gates are reviewed where relevant.
- [ ] Client/demo notes are clear.

## Risks And Questions

- Known risks:
- Open questions:
- Required approvals:

## Kabeeri Commands

```bash
kvdf agile release plan release-001 --title "Checkout demo" --stories story-001 --criteria "Checkout accepted" --checks "Policy gates reviewed"
kvdf agile release readiness release-001
kvdf agile health
```
