# CLI Command Reference

This is a compact reference for the `kvdf` commands. The working CLI entrypoint is `bin/kvdf.js`; use `kvdf --help` or `npm run kvdf -- --help` to confirm the exact command surface in the current checkout.

## Global

```bash
kvdf --help
kvdf --version
kvdf create --help
kvdf task --help
kvdf token --help
kvdf dashboard --help
kvdf github --help
```

Common command aliases are supported for terminal convenience:

```bash
kvdf tasks list
kvdf t list
kvdf tokens list
kvdf dash generate
kvdf prompts list
```

## Workspace

```bash
kvdf init
kvdf init --profile lite
kvdf init --profile standard
kvdf init --profile enterprise
kvdf init --lang ar
kvdf init --lang en
kvdf init --lang both
```

## Generators

```bash
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
kvdf create --profile lite
kvdf create --profule lite
kvdf generate --profile standard --output my-project
kvdf generator create standard --output my-project
```

Generator commands create a folder skeleton with README files and `kabeeri.generated.json`.

## Questionnaires

```bash
kvdf questionnaire list
kvdf questionnaire create --profile lite
kvdf questionnaire create --group core
kvdf questionnaire create --group production
kvdf questionnaire create --group extension
kvdf questionnaire create --profile enterprise --output owner-questions
kvdf questionnaire status
```

`questionnaire create` copies the real `.docx` questionnaire files into the output folder. Profiles map to groups: `lite` exports `core`, `standard` exports `core` and `production`, and `enterprise` exports all groups.

## Prompt packs

```bash
kvdf prompt-pack list
kvdf prompt-pack show <name>
kvdf prompt-pack export <name> --output <folder>
kvdf prompt-pack use <name>
kvdf prompt-pack validate <name>
```

Examples:

```bash
kvdf prompt-pack show laravel
kvdf prompt-pack show nextjs
kvdf prompt-pack show fastapi
kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
kvdf prompt-pack use react --output my-project/07_AI_CODE_PROMPTS/react
```

`prompt-pack use` is a convenience install command. Without `--output`, it writes to `07_AI_CODE_PROMPTS/<name>`.

## Tasks

```bash
kvdf sprint create --id sprint-001 --name "Sprint 1" --start 2026-05-01 --end 2026-05-14
kvdf sprint list
kvdf sprint summary sprint-001
kvdf task create
kvdf task create --title "Add API" --sprint sprint-001
kvdf task create --title "Integration task" --type integration --workstreams backend,public_frontend
kvdf task list
kvdf task status
kvdf task approve
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task reject
kvdf task reopen
```

Examples:

```bash
kvdf task create --title "Add task tracking format" --type task-tracking --issue 6
kvdf task status --id T006
kvdf task assign task-001 --assignee agent-001
kvdf task start task-001 --actor agent-001
kvdf task review task-001 --actor reviewer-001
kvdf task verify task-001 --owner owner-001
```

When an Owner identity or Owner auth is configured, mutating commands enforce role permissions. Use `--actor <id>` for non-Owner actions, or an active Owner session for Owner/Maintainer-level actions.

Task assignment also checks workstream ownership. If an assignee has `workstreams` configured, they can only receive tasks in those workstreams. Tasks that span multiple workstreams must be created with `--type integration`.

## Business Features and Journeys

```bash
kvdf feature create --title "Public signup" --readiness needs_review --tasks task-001
kvdf feature status feature-001 --readiness ready_to_demo
kvdf feature list
kvdf feature show feature-001
kvdf journey create --name "Signup journey" --audience Visitors --steps Landing,Signup,Welcome
kvdf journey status journey-001 --status ready_to_show --ready-to-show
kvdf journey list
kvdf journey show journey-001
kvdf validate business
```

Feature readiness supports `ready_to_demo`, `ready_to_publish`, `needs_review`, and `future`. Journey status supports `draft`, `needs_review`, `ready_to_show`, and `future`.

## Acceptance

```bash
kvdf acceptance create
kvdf acceptance review <acceptance-id>
kvdf acceptance list
```

Examples:

```bash
kvdf acceptance create --type task-completion --issue 7
kvdf acceptance create --type release --version v0.1.1
kvdf acceptance review acceptance-001 --reviewer reviewer-001 --result pass --notes "Ready"
```

## Audit

```bash
kvdf audit list
kvdf audit list --limit 50
kvdf audit report
kvdf audit report --task task-001 --output audit.md
```

## Developers and AI Agents

```bash
kvdf owner init --id owner-001 --name "Project Owner"
kvdf owner login --id owner-001
kvdf owner status
kvdf owner logout
kvdf owner transfer issue --to owner-002 --name "New Owner"
kvdf owner transfer accept --id owner-transfer-001 --token TRANSFER-SECRET
kvdf owner transfer list
kvdf owner transfer revoke --id owner-transfer-001
kvdf developer list
kvdf developer add --id owner-001 --name "Project Owner" --role Owner
kvdf agent list
kvdf agent add --id agent-001 --name "AI Backend Agent" --role "AI Developer" --workstreams backend
```

`owner init` and `owner login` read the passphrase from `--passphrase` or `KVDF_OWNER_PASSPHRASE`. When Owner auth is configured, `task verify` requires an active Owner session.

`owner transfer issue` requires the active Owner session and creates a one-use transfer token. `owner transfer accept` moves the `Owner` role to the new owner, downgrades the previous owner to `Maintainer`, rewrites Owner auth for the new owner, starts a new Owner session, and marks the transfer token as used.

## Tokens and Locks

```bash
kvdf token list
kvdf token issue --task task-001 --assignee agent-001
kvdf token issue --task task-001 --assignee agent-001 --max-usage-tokens 50000 --max-cost 10
kvdf token issue --task task-001 --assignee agent-001 --max-cost 10 --budget-approval-required
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/ --forbidden-files .env,secrets/
kvdf token revoke task-token-001
kvdf token reissue task-token-001 --max-usage-tokens 200 --reason "Rework only"
kvdf lock list
kvdf lock create --type file --scope src/api/users.ts --task task-001 --owner agent-001
kvdf lock create --type folder --scope src/api --task task-001 --owner agent-001
kvdf lock create --type workstream --scope backend --task task-001 --owner agent-001
kvdf lock release lock-001
```

Active locks prevent exact scope conflicts and file/folder overlap. For example, a folder lock on `src/api` blocks a file lock on `src/api/users.ts` until the folder lock is released.

## Budget Approvals

```bash
kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
kvdf budget approve --task task-001 --cost 5
kvdf budget list
kvdf budget revoke budget-approval-001
```

When a task access token is issued with `--budget-approval-required`, `usage record` refuses over-budget token or cost usage until an active approval covers the overrun.

Task access tokens require a real local task. In governed workspaces, the token assignee must match the task assignee, and AI sessions cannot start for unassigned tasks.

Owner rejection revokes active task tokens. Use `token reissue` to create a limited rework token from a revoked token.

## AI Usage

```bash
kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt
kvdf session end session-001 --input-tokens 1000 --output-tokens 500 --files src/api/users.ts --summary "Implemented endpoint" --checks "npm test" --risks "Needs API review"
kvdf session list
kvdf session show session-001
kvdf pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1 --currency USD
kvdf pricing list
kvdf pricing show
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --cached-tokens 0 --cost 0.25 --workstream backend
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --cached-tokens 0 --workstream backend
kvdf usage record --untracked --input-tokens 1000 --output-tokens 500 --cost 0.25 --source ad-hoc-prompt
kvdf usage list
kvdf usage summary
kvdf usage efficiency
kvdf usage report --output usage-report.md
```

Usage records are stored in `.kabeeri/ai_usage/usage_events.jsonl` and rolled up into `.kabeeri/ai_usage/usage_summary.json`. If `--cost` is omitted, Kabeeri calculates cost from `.kabeeri/ai_usage/pricing_rules.json` when a matching provider/model rule exists.

Completed AI sessions generate `.kabeeri/reports/<session-id>.handoff.md`.

## Customer Apps

```bash
kvdf app create --username acme --name "ACME Portal"
kvdf app list
kvdf app show acme
kvdf app status acme --status ready_to_publish
kvdf validate routes
```

Customer-facing app routes always use `username`, never numeric IDs:

```text
/customer/apps/acme
```

`kvdf app create --username 3` fails because public customer URLs must not expose numeric IDs such as `/customer/apps/3`.

## v5 Adaptive Questionnaire and Capability Map

```bash
kvdf capability list
kvdf capability show payments_billing
kvdf capability map
kvdf questionnaire flow
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire answer entry.has_users --value yes
kvdf questionnaire answer entry.has_payments --value unknown
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
kvdf validate questionnaire
```

`questionnaire coverage` generates `.kabeeri/questionnaires/coverage_matrix.json` for the 53 standard system areas. `questionnaire missing` writes `.kabeeri/questionnaires/missing_answers_report.json`. `questionnaire generate-tasks` creates proposed tasks with provenance fields for `system_area_key`, `question_ids`, `answer_ids`, and `source_mode`.

## Project Memory

```bash
kvdf memory add --type decision --text "Use PostgreSQL"
kvdf memory add --type risk --text "Payment provider not confirmed"
kvdf memory list --type risk
kvdf memory summary
```

Project memory writes append-only JSONL files under `.kabeeri/memory/` and keeps `.kabeeri/memory/memory_summary.json` updated.

## Dashboard

```bash
kvdf dashboard generate
kvdf dashboard state
kvdf dashboard export
kvdf dashboard export --output .kabeeri/site/index.html --dashboard-output .kabeeri/site/__kvdf/dashboard/index.html
kvdf dashboard serve --port 4177
```

`dashboard export` writes the customer-facing first page to `.kabeeri/site/index.html`, writes the private technical dashboard to `.kabeeri/site/__kvdf/dashboard/index.html`, and exports per-app pages under `.kabeeri/site/customer/apps/<username>/index.html`.

`dashboard state` prints the same live JSON state used by the local dashboard API. `dashboard serve` serves the customer page at `/`, app pages at `/customer/apps/<username>`, the private dashboard at `/__kvdf/dashboard`, and live JSON at `/__kvdf/api/state`.

## VS Code

```bash
kvdf vscode scaffold
kvdf vscode status
```

`vscode scaffold` writes `.vscode/tasks.json`, `.vscode/extensions.json`, and `.vscode/kvdf.commands.json` so common Kabeeri CLI actions can be run from VS Code tasks.

## Plans

```bash
kvdf plan list
kvdf plan show v3.0.0
kvdf plan show v4.0.0
```

## GitHub Dry Run

```bash
kvdf github plan --version v4.0.0 --dry-run
kvdf github label sync --version v4.0.0 --dry-run
kvdf github milestone sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run --output github-issues.dry-run.txt
kvdf github config set --repo owner/repo --branch main --default-version v4.0.0
kvdf github config show
```

These commands do not write to GitHub.

## GitHub Confirmed Sync

```bash
kvdf github label sync --version v4.0.0 --confirm
kvdf github milestone sync --version v4.0.0 --confirm
kvdf github issue sync --version v4.0.0 --confirm
kvdf github release publish --version v4.0.0 --confirm
```

Confirmed commands use the installed GitHub CLI (`gh`) and write to the current GitHub repository. Issue creation is recorded in `.kabeeri/github/issue_map.json` when a workspace exists.

## Examples

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
```

## Validation

```bash
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
```

## Release

```bash
kvdf release check
kvdf release check --version v4.0.0 --strict
kvdf release scenario --version v4.0.0
kvdf release notes --version v0.1.1
kvdf release checklist --version v0.1.1
kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
kvdf release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md
kvdf release publish --version v4.0.0
kvdf release publish --version v4.0.0 --confirm
```

## Doctor

```bash
kvdf doctor
```
