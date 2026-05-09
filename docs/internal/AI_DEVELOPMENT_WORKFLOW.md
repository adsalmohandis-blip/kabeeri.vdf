# Internal AI Development Workflow

This document preserves the permanent development rules that were extracted
from the temporary `codex_commands/` execution packs.

`codex_commands/` was useful during deep repository development, roadmap
ingestion, v1-v7 implementation, documentation-site work, GitHub safety
planning, frontend design governance, and final validation. After those packs
are deleted, this file remains the canonical internal workflow for AI-assisted
development inside Kabeeri VDF.

## Status

- Audience: Kabeeri VDF maintainers and AI coding assistants
- Runtime capability: no
- User-facing capability: no
- Source of truth: this document, plus `.kabeeri/` runtime state and regular
  repository documentation
- Supersedes: `codex_commands/` after command-pack deletion

## Core Rules

1. Do not implement from a short summary only.
2. Read the relevant source docs, current code, and capability reference before
   changing behavior.
3. Treat `.kabeeri/` as runtime source of truth.
4. Treat the CLI as the engine behind dashboard, VS Code, chat, and future UI
   surfaces.
5. Do not overwrite existing work without a clear reason and reviewable diff.
6. Do not delete files unless the replacement or deprecation path is documented.
7. Do not push to GitHub or run confirmed GitHub writes without explicit Owner
   approval.
8. Do not expose secrets, passphrases, tokens, private client data, or
   unpublished commercial details.
9. Do not implement frontend work directly from raw images, PDFs, screenshots,
   Drive links, Figma links, or reference websites. Convert design sources into
   approved text specs first.
10. Keep every new major capability linked from
    `docs/SYSTEM_CAPABILITIES_REFERENCE.md`.

## Before Starting Work

Run or inspect:

```bash
git status --short
node bin/kvdf.js --help
node bin/kvdf.js validate
```

For code changes, also inspect the relevant tests and current implementation
before editing.

For documentation-only work, validation can be limited to:

```bash
git diff --check
```

## During Work

- Keep edits scoped to the requested capability.
- Follow the existing repository structure before adding a new folder.
- Prefer updating existing canonical docs over creating duplicate docs.
- Update `CHANGELOG.md` for meaningful user-facing or developer-facing changes.
- Update `OWNER_DEVELOPMENT_STATE.md` when the change affects the owner resume
  flow or future development direction.
- Keep deleted or deprecated concepts traceable in reports before removal.

## Frontend And Dashboard Work

Frontend or dashboard implementation requires:

- approved design source or clear existing UI pattern
- approved text spec, page spec, or component contract when available
- allowed files and forbidden files
- required states
- accessibility expectations
- visual acceptance criteria

If required design details are missing, create or update a missing design note
instead of guessing.

Permanent references:

- `design_sources/README.md`
- `design_sources/DESIGN_SOURCE_TO_TEXT_SPEC_RULES.md`
- `design_system/UI_ACCEPTANCE_CHECKLIST.md`
- `frontend_specs/PAGE_SPEC_TEMPLATE.md`
- `frontend_specs/COMPONENT_CONTRACT_TEMPLATE.md`

## GitHub Safety

Default behavior is dry-run or file generation.

Confirmed GitHub writes require:

- explicit Owner approval
- configured repository
- GitHub CLI availability and authentication
- passing `github_write_policy`
- no unresolved security or policy blockers

Permanent references:

- `github_sync/GITHUB_SYNC_RULES.md`
- `github/import_instructions.md`
- `governance/EXECUTION_SCOPE_GOVERNANCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`

## Final Validation Checklist

Before a commit or release candidate:

```bash
npm test
npm run test:smoke
node bin/kvdf.js validate
node bin/kvdf.js release check --strict
git diff --check
```

Also check:

- no accidental secrets
- docs match runtime behavior
- capability reference is updated
- Vibe-first remains optional
- Owner verification rules remain intact
- task access tokens and AI usage tokens remain separate concepts
- GitHub confirmed writes remain gated
- dashboard is a view, not the source of truth

## Completion Rule

At the end of a substantial development session:

1. Summarize changed capabilities.
2. List verification run.
3. Update `OWNER_DEVELOPMENT_STATE.md` if the next session needs context.
4. Keep any deletion-ready internal packs documented before removing them.
