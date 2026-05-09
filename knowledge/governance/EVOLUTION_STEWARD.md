# Evolution Steward

Evolution Steward is the Kabeeri capability that governs changes to Kabeeri
itself.

Its purpose is to prevent framework updates from becoming isolated code or docs
edits. When the Owner asks for a new Kabeeri capability, bug fix, governance
rule, dashboard behavior, CLI surface, schema, or documentation change,
Evolution Steward records the change, infers the impacted system areas, creates
follow-up tasks, and exposes the unfinished work to dashboard and live reports.

## Source Of Truth

- Runtime state: `.kabeeri/evolution.json`
- Follow-up work: `.kabeeri/tasks.json`
- Central capability reference: `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- CLI reference: `cli/CLI_COMMAND_REFERENCE.md`
- Dashboard/live reports: `.kabeeri/dashboard/*.json` and `.kabeeri/reports/live_reports_state.json`
- Schema: `schemas/runtime/evolution-state.schema.json`

## Why This Exists

Kabeeri is a meta-framework. A change in one part often affects other parts:

- CLI commands and help
- task tracking and governance rules
- runtime state files
- schemas and validation
- dashboard and live JSON
- readiness/governance reports
- prompt packs or AI workflow guidance
- human docs and docs site
- capability reference
- tests
- changelog and release notes

Evolution Steward turns that dependency list into an explicit impact plan.

## Commands

```bash
kvdf evolution plan "Add docs-first init gate"
kvdf evolution plan "Improve dashboard descriptions" --areas cli,docs,dashboard,tests
kvdf evolution list
kvdf evolution status
kvdf evolution show evo-001
kvdf evolution impact evo-001
kvdf evolution tasks evo-001
kvdf evolution verify evo-001
```

## Workflow

1. Owner requests a Kabeeri update.
2. The AI assistant runs `kvdf evolution plan "<request>"`.
3. Kabeeri records a change under `.kabeeri/evolution.json`.
4. Kabeeri creates proposed follow-up tasks for impacted areas.
5. The AI assistant implements the update through the generated tasks.
6. The dashboard and live reports show open follow-up work.
7. The Owner or maintainer verifies the evolution change when dependent tasks
   are complete.

## Impact Areas

| Area | Meaning |
| --- | --- |
| `implementation` | Runtime code in `src/cli/` or related helpers. |
| `cli` | Command routing, help text, CLI reference, and examples. |
| `tasks` | Task tracker integration and governance metadata. |
| `schemas` | Runtime schema and validation coverage. |
| `dashboard` | Dashboard state, live APIs, or UI visibility. |
| `reports` | Readiness, governance, or live reports. |
| `ai_context` | Prompt packs, Vibe-first rules, or AI workflow guidance. |
| `docs` | Human documentation and knowledge files. |
| `capabilities` | Central capability map and docs site capability table. |
| `tests` | Automated integration or validation coverage. |
| `changelog` | Change history and Owner continuation state. |
| `release` | Release notes, publish gates, or upgrade guidance. |

## Rule

A framework update is not considered done just because code changed. It is done
when all dependent surfaces are either updated, explicitly deferred, or rejected
with a reason.
