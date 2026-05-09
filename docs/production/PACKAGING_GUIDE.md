# Product Packaging Guide

Kabeeri VDF is packaged as a Node.js CLI with the `kvdf` binary. The package is
local-first and should include the runtime engine, schemas, knowledge catalogs,
prompt/generator packs, integrations, production docs, and templates required for a
developer to initialize and govern a workspace after installation.

## Package Contract

The package must include:

- `bin/kvdf.js`
- `src/cli/`
- `knowledge/`
- `packs/`
- `integrations/`
- `schemas/`
- `docs/production/`
- `cli/CLI_COMMAND_REFERENCE.md`
- root `README.md`, `CHANGELOG.md`, and `LICENSE`

The package must not rely on `.kabeeri/`, local test output, `node_modules/`, or
machine-local state.

## Local Packaging Check

```bash
kvdf package check
kvdf package check --json
npm run pack:check
```

The check verifies required `package.json` fields, `bin.kvdf`, Node engine
metadata, package file coverage, and required runtime/documentation files.

## Manual npm Dry Run

Before publishing to npm or distributing a tarball:

```bash
npm test
npm run test:smoke
npm run pack:check
npm pack --dry-run
```

Review the dry-run file list. The package should contain the runtime and
documentation surface, not local `.kabeeri` state or generated reports.

## Publish Boundary

Packaging readiness does not publish the package. Publishing still requires:

- Owner approval.
- Passing validation and tests.
- Passing release/GitHub publish gates when GitHub release mutation is involved.
- A reviewed version number and changelog entry.
