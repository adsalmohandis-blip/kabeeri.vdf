# v3.0.0 - Stable Platform Integration Release

Goal: ship a stable local platform integration release covering GitHub, VS Code, dashboards, owner verify, and token cost analytics.

## Integration Checklist

- [ ] `.kabeeri/` source-of-truth structure documented.
- [ ] Dashboard state files documented as derived views.
- [ ] GitHub sync config documented.
- [ ] GitHub issue mapping documented.
- [ ] GitHub CLI commands support dry-run.
- [ ] VS Code extension architecture documented.
- [ ] VS Code command palette mapped to CLI.
- [ ] Technical dashboard state documented.
- [ ] Business dashboard state documented.
- [ ] Owner-only final verify documented.
- [ ] Verify/reject/reopen CLI commands documented.
- [ ] AI token cost dashboard documented.
- [ ] Token calculator uses configurable prices.
- [ ] Sprint cost analytics documented.
- [ ] Release notes prepared.

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

- This release defines the platform integration contract; it is not yet a full runtime implementation.
- GitHub writes must remain dry-run by default until explicit confirmation is implemented.
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

