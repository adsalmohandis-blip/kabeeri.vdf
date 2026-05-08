# v4.0.0 - Stable Multi-AI Governance Release

Goal: ship a stable governance model for multiple human developers and AI Developers.

## Governance Release Checklist

- [x] Collaboration identity model documented and implemented through developer/agent commands.
- [x] Role matrix documented and enforced for governed workspace actions.
- [x] Workstream ownership rules documented and enforced during task assignment.
- [x] Single Owner rule documented and validated.
- [x] Owner transfer token lifecycle documented and implemented.
- [x] Task access token lifecycle documented and implemented.
- [x] Lock types and conflict rules documented and enforced.
- [x] Assignment and execution governance documented and enforced.
- [x] AI Developer session schema documented and implemented.
- [x] AI output contract documented through session handoff reports.
- [x] Token budget fields documented and implemented.
- [x] Budget warning and approval rules documented and implemented.
- [x] Owner verify revokes tokens.
- [x] Final verification audit report documented and generated.
- [x] Multi-AI collaboration scenario reviewed through `kvdf release scenario`.
- [x] Release notes prepared.

## Scenario Review

Required scenario:

```text
Backend Developer/AI Agent works on backend task
Frontend Developer/AI Agent works on public frontend task
Admin Frontend Developer/AI Agent works on admin task
Reviewer recommends acceptance
Owner verifies final completion
Tokens revoke
Locks release
Audit report is generated
```

The scenario passes only when tasks do not overlap and every action is traceable.

## Release Notes Draft

### Added

- Multi-AI collaboration identity model.
- Role and permission matrix with single Owner.
- Owner transfer token lifecycle.
- Task access token lifecycle.
- Lock and conflict prevention rules.
- Assignment governance for human and AI Developers.
- AI Developer session schema and output contract.
- Token budgets and cost controls.
- Owner verify, token revocation, and final audit reports.

### Limitations

- This release now has local CLI/runtime enforcement for governed workspaces.
- Token values are secrets and must not be committed or shown in dashboard state.
- Manual conflict resolution is required for risky lock conflicts.

## Publish Steps

```text
kvdf validate
kvdf github issue sync --dry-run
kvdf github milestone sync --dry-run
kvdf github release prepare v4.0.0 --dry-run
git tag v4.0.0
gh release create v4.0.0 --title "Kabeeri VDF v4.0.0" --notes-file RELEASE_NOTES.md
```

Publishing requires Owner confirmation after all checklist items are complete.

## Acceptance Criteria

- Checklist is ready.
- Multi-AI scenario is reviewed.
- Release notes are ready.
- `v4.0.0` is published only after Owner verification.
