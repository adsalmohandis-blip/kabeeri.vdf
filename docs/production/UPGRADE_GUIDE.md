# Upgrade Guide

This guide explains how to upgrade Kabeeri VDF and how to check whether a local
workspace needs migration work.

## Upgrade The CLI

From a git checkout:

```bash
git pull
npm install
npm test
npm run test:smoke
```

From an installed package:

```bash
npm install -g kabeeri-vdf@latest
kvdf --version
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

`upgrade check` reads `.kabeeri/version_compatibility.json` and
`.kabeeri/migration_state.json`, compares the workspace engine version with the
current CLI version, and reports pending migration risks.

## Safe Upgrade Sequence

1. Commit or shelve unrelated local work.
2. Run `kvdf readiness report` and `kvdf governance report`.
3. Run `kvdf upgrade check`.
4. Run `kvdf validate`.
5. Run `npm test` when working from the repository checkout.
6. Review `.kabeeri/version_compatibility.json` and `.kabeeri/migration_state.json`.
7. Record any migration decision in ADR or project memory when the upgrade
   changes workflow behavior.

## Compatibility Rule

Kabeeri state is local-first. Upgrade work must not silently rewrite `.kabeeri`
state in a way that removes tasks, audit history, tokens, locks, policy results,
AI usage, design records, or handoff packages.

If a future migration needs to mutate state, it should be implemented as an
explicit migration command with a dry-run, backup/rollback notes, and Owner
approval.
