# Product Packaging Guide

Kabeeri VDF is packaged as a local-first Node.js CLI with the `kvdf` binary.

Packaging answers:

```text
Is this repository ready to be distributed as a usable Kabeeri VDF product package?
```

It is different from release, publish, handoff, and readiness:

- Packaging checks whether the npm package contains the right files.
- Release checks whether a version is ready to announce.
- Publish checks whether remote registry/GitHub mutation is allowed.
- Handoff checks whether an Owner/client can understand the state.
- Readiness checks whether the workspace is safe to demo, hand off, release, or publish.

## Package Contract

The package must include the runtime and operating knowledge needed for a new
developer or AI assistant to install Kabeeri and initialize/govern a workspace.

Required package surface:

- `bin/kvdf.js`
- `src/cli/`
- `knowledge/`
- `packs/`
- `plugins/`
- `schemas/`
- `docs/`
- `cli/`
- root `README.md`
- root `README_AR.md`
- root `ROADMAP.md`
- root `CHANGELOG.md`
- root `LICENSE`

Required `package.json` fields:

- `name`
- `version`
- `description`
- `license`
- `bin.kvdf`
- `files`
- `engines.node`
- `scripts.pack:check`

## What Must Not Be Packaged

The package must not depend on machine-local or workspace-local state:

- `.kabeeri/`
- `node_modules/`
- generated dashboard exports
- local reports that are not part of docs
- temporary test output
- secrets, API keys, `.env`, or machine credentials

The package should install the framework, not the current developer's active
workspace.

## Local Packaging Check

Run:

```bash
kvdf package check
kvdf package check --json
npm run pack:check
```

The check validates:

- required package fields
- `bin.kvdf`
- Node engine metadata
- packaging script
- required runtime files
- package `files` coverage for runtime, docs, schemas, packs, and CLI references

## Recommended Packaging Sequence

For a normal local verification:

```bash
node bin/kvdf.js validate
node bin/kvdf.js package check
node bin/kvdf.js readiness report --target release --strict
node bin/kvdf.js governance report --target release --strict
```

For a repository checkout before distribution:

```bash
npm test
npm run test:smoke
npm run pack:check
npm pack --dry-run
```

Review the dry-run file list carefully. The package should contain the framework
runtime and documentation surface, not local `.kabeeri` state.

## When Packaging Should Block

Do not package if:

- `package.json` is missing required fields
- `bin.kvdf` is not `bin/kvdf.js`
- required runtime files are missing
- `package.json.files` excludes `bin/`, `src/`, `knowledge/`, `packs/`, `plugins/`, `schemas/`, `docs/`, or `cli/`
- validation fails
- readiness/governance strict reports are blocked for the release target

## Publish Boundary

Packaging readiness does not publish anything.

Publishing still requires:

- Owner approval
- reviewed version number
- changelog entry
- passing validation and tests
- passing release policy
- passing GitHub write policy when GitHub mutation is involved
- passing npm/registry policy if a future registry publish command is added

Use packaging as a local evidence step before release or publish, not as a
replacement for release governance.

## Useful Commands

```bash
kvdf package check
kvdf package check --json
kvdf package guide
kvdf release check --strict
kvdf readiness report --target release --strict
kvdf governance report --target release --strict
npm run pack:check
npm pack --dry-run
```

## Output Review Checklist

Before treating the package as ready, confirm:

- package check status is `ready`
- no packaging blockers exist
- dry-run package file list includes runtime and docs
- dry-run package file list excludes local state and secrets
- version number matches the changelog and intended release
- release/readiness/governance evidence is attached to the release notes
