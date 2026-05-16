# Final Release Preparation Checklist

Use this checklist before a release or public publish decision.

## Repository State

- Feature branch is used.
- Working tree is reviewed.
- No unrelated user changes are reverted.
- Required phase reports exist.
- Required folders exist or are intentionally deferred.

## Validation

- `node bin/kvdf.js validate` passes.
- `npm test` passes.
- `kvdf release check` reports validation `OK`, readiness `READY`, and release gate `PASS`.
- Docs site inventory check passes.
- JSON and JSONL examples validate.

## Governance

- Owner-only final verify is documented.
- Task access tokens are scoped and revocable.
- Locks and assignment rules are documented.
- AI usage and cost tracking are visible.
- Design sources require approved text specs before frontend implementation.

## Security

- No production secrets in docs or examples.
- `.env`, credentials, private keys, and API secrets are not committed.
- AI prompt privacy rules are documented.

## GitHub

- `github/labels.json` reviewed.
- `github/milestones.md` reviewed.
- `github/issues_backlog.md` reviewed.
- `github/import_instructions.md` reviewed.
- No GitHub mutation happens without Owner approval.

## Publish Decision

- Owner approval recorded.
- Production-ready and published states are distinguished.
- No release or publish step runs before validation passes.
- Remaining blockers are listed.
- Release notes and publishing guide are ready.
