# 17 - Governance and Release Model

Governance makes high-risk actions explicit.

## Governed Areas

- task verification
- owner authority
- workstreams and app boundaries
- task access tokens
- AI sessions and locks
- security scans
- migration plans
- release and GitHub publish gates

## Release Rule

A project can be production-ready for internal use and still not be safe to
publish. Publishing adds audience exposure, support expectations, secrets risk,
and communication requirements.

```bash
kvdf release check
kvdf release publish --confirm
kvdf github release publish --confirm
```
