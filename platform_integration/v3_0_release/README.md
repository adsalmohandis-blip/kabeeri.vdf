# v3.0.0 - Stable Platform Integration Release

Goal: ship a stable local platform integration release covering GitHub, VS Code, dashboards, owner verify, and token cost analytics.

## Integration Checklist

- [x] `.kabeeri/` source-of-truth structure documented and initialized by `kvdf init`.
- [x] Dashboard state files documented as derived views.
- [x] GitHub sync config documented and manageable through `kvdf github config`.
- [x] GitHub issue mapping documented and persisted for confirmed sync.
- [x] GitHub CLI commands support dry-run and confirmed `gh` writes.
- [x] VS Code extension architecture scaffolded locally through `kvdf vscode scaffold`.
- [x] VS Code command palette mapped to CLI.
- [x] Technical dashboard state generated and exposed through `kvdf dashboard state`.
- [x] Business dashboard state generated with customer apps, features, and journeys.
- [x] Owner-only final verify enforced when Owner auth is configured.
- [x] Verify/reject/reopen CLI commands implemented.
- [x] AI token cost dashboard state implemented.
- [x] Token calculator uses configurable prices.
- [x] Sprint cost analytics implemented.
- [x] Release notes prepared.

## Release Notes Draft

### Added

- Local `.kabeeri/` source-of-truth state model.
- GitHub CLI sync planning for labels, milestones, issues, and releases.
- VS Code integration foundation through CLI-backed panels and commands.
- Live technical dashboard state model.
- Business dashboard state model for product readiness and user journey.
- Owner-only final task verification rules.
- AI token cost dashboard and configurable calculator specification.
- Agile sprint cost analytics model.

### Limitations

- This release has a working local CLI runtime. Some hosted product surfaces may still be implemented by downstream apps.
- GitHub writes remain dry-run by default and require explicit `--confirm`.
- Dashboard files are derived and may be regenerated from canonical `.kabeeri` files.
- AI pricing is user-configured and must be reviewed against current provider prices before cost reporting.

## Publish Steps

```text
kvdf validate
kvdf github issue sync --dry-run
kvdf github milestone sync --dry-run
kvdf github release prepare v3.0.0 --dry-run
git tag v3.0.0
gh release create v3.0.0 --title "Kabeeri VDF v3.0.0" --notes-file RELEASE_NOTES.md
```

Publishing requires Owner confirmation after all checklist items are complete.

## Acceptance Criteria

- Integration checklist exists.
- Release notes are ready.
- Publish process is documented.
- `v3.0.0` is published only after Owner verification.
