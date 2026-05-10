# Upgrade Guide

This guide explains how to upgrade Kabeeri VDF and how to check whether a local
workspace needs migration work.

Upgrade answers:

```text
Can this workspace safely use the current Kabeeri CLI and knowledge layer?
```

It is different from packaging:

- Packaging checks whether the framework can be distributed.
- Upgrade checks whether a workspace is compatible with the current framework.

## Upgrade Sources

Kabeeri may be upgraded from:

- a git checkout
- an installed npm package
- a copied local framework folder
- a future packaged release artifact

Use the source approved by the Owner for production-facing work.

## Upgrade The CLI From Git

From a git checkout:

```bash
git pull
npm install
node bin/kvdf.js --version
node bin/kvdf.js validate
npm test
npm run test:smoke
```

If the working tree has unrelated changes, commit or shelve them before pulling.

## Upgrade The CLI From Package

From an installed package:

```bash
npm install -g kabeeri-vdf@latest
kvdf --version
kvdf doctor
```

Use the package manager and version policy approved by the Owner before
upgrading production-facing teams.

## Check A Workspace

Run this inside a Kabeeri workspace:

```bash
kvdf upgrade check
kvdf upgrade check --json
kvdf validate
```

`upgrade check` reads:

```text
.kabeeri/version_compatibility.json
.kabeeri/migration_state.json
```

It compares the workspace engine version with the current CLI version and
reports pending migration risks.

## Safe Upgrade Sequence

1. Commit or shelve unrelated local work.
2. Run `kvdf readiness report --target workspace`.
3. Run `kvdf governance report --target workspace`.
4. Run `kvdf upgrade check`.
5. Run `kvdf validate`.
6. Run `npm test` and `npm run test:smoke` when working from the repository checkout.
7. Review `.kabeeri/version_compatibility.json`.
8. Review `.kabeeri/migration_state.json`.
9. Record any migration decision in ADR or project memory when the upgrade changes workflow behavior.
10. Regenerate dashboard/live reports after the upgrade check.

## Upgrade Status Meaning

`current` means no blockers or warnings were detected.

`warning` means the workspace can often continue, but the Owner should review
the version difference or missing workspace state.

`blocked` means migration state says a pending migration exists and the upgrade
should stop until that migration is resolved.

## Compatibility Rule

Kabeeri state is local-first. Upgrade work must not silently rewrite `.kabeeri`
state in a way that removes:

- tasks
- audit history
- access tokens
- locks
- policy results
- AI usage records
- design records
- ADRs
- AI run history
- security scans
- migration records
- handoff packages

If a future migration needs to mutate state, it must be implemented as an
explicit migration command with:

- dry-run output
- backup/rollback notes
- Owner approval
- audit event
- validation after mutation

## When To Create An ADR

Create or update an ADR when the upgrade changes:

- project architecture
- delivery mode behavior
- policy gates
- dashboard behavior
- task governance
- prompt composition rules
- packaging or publishing rules
- migration safety behavior

## Useful Commands

```bash
kvdf upgrade guide
kvdf upgrade check
kvdf upgrade check --json
kvdf validate
kvdf readiness report --target workspace
kvdf governance report --target workspace
kvdf reports live
kvdf adr create --title "Upgrade Kabeeri VDF" --context "Workspace upgrade" --decision "Proceed with upgrade after checks"
```

## Upgrade Review Checklist

Before considering an upgrade complete, confirm:

- CLI version is known
- workspace version is known or explicitly missing
- no pending migration blocks the upgrade
- validation passes
- readiness/governance reports are reviewed
- dashboard/live report state is refreshed
- any behavior-changing upgrade is captured in ADR or project memory
