# 16 - Contributor Roles

Kabeeri separates responsibility so AI-assisted work remains accountable.

## Common Roles

- Owner: final authority for verification, release, and sensitive decisions.
- Developer: implements or reviews scoped work.
- AI Developer: an AI agent or assistant executing a governed task.
- Reviewer: checks output against acceptance criteria.
- Maintainer: protects repository quality, releases, and documentation.

## Runtime

```bash
kvdf developer add --id dev-001 --name "Developer"
kvdf agent add --id agent-001 --name "AI Agent" --workstreams backend
kvdf owner status
```
