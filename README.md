# Kabeeri Vibe Developer Framework

Kabeeri VDF, also known as `kabeeri.vdf`, is an open-source meta-framework for building software with AI assistants.

It does not replace Laravel, Next.js, React, Vue, Angular, WordPress, Django, .NET, Flutter, or React Native. Instead, it gives the developer and the AI assistant a governed working environment before, during, and after code generation.

Kabeeri helps turn a product idea into:

- clear questions for the developer or client
- application boundaries
- Agile or Structured delivery plans
- product blueprints
- database design guidance
- UI/UX guidance
- governed tasks
- AI prompt context
- token and cost records
- live dashboard visibility
- readiness and release gates
- handoff reports

The goal is simple: the developer speaks naturally, the AI assistant uses Kabeeri as the project operating layer, and the project remains understandable when sessions stop and resume.

## Vibe-First By Design

Kabeeri is built for vibe coding first.

If you are a vibe coder, do not start by learning the CLI. Start by describing your product to an AI assistant and ask it to use Kabeeri to organize the work.

The normal developer experience is not memorizing terminal commands. The normal experience is:

```text
Developer talks to an AI assistant in normal language.
The AI assistant uses Kabeeri rules and runtime records in the background.
Kabeeri keeps tasks, decisions, scopes, usage, captures, and dashboard state organized.
```

Example:

```text
I want to build an ecommerce store with a Laravel backend, a Next.js storefront,
an admin dashboard, payments, shipping, and a mobile app later.
```

The AI assistant should then use Kabeeri to identify the product blueprint, ask missing questions, recommend Agile or Structured delivery, split the work into tasks, track token usage, and keep the live dashboard updated.

## What `kvdf` Is For

Kabeeri includes a working Node.js CLI named `kvdf`, but `kvdf` is the engine, not the main product experience.

The CLI exists so AI assistants, automation, and advanced developers can reliably update the project state. It can initialize `.kabeeri/`, create project skeletons, generate governed tasks, run validation, track AI usage, manage task access tokens, serve the live dashboard, enforce policy gates, and export readiness/governance reports.

Source of truth:

- `.kabeeri/` is the runtime state folder for a project.
- The CLI updates `.kabeeri/` records.
- The dashboard reads `.kabeeri/` state.
- AI assistants should work through tasks, scopes, captures, and reports instead of editing randomly.

For most vibe coders, the important idea is: talk to your AI assistant normally, and let it use `kvdf` only when the project needs traceability, dashboard updates, task records, usage logs, or governance checks.

For the complete capability map, read:

- [System Capabilities Reference](docs/SYSTEM_CAPABILITIES_REFERENCE.md)
- [CLI Command Reference](cli/CLI_COMMAND_REFERENCE.md)
- [Documentation Site](docs/site/index.html)

## Who Is Kabeeri For?

Kabeeri is useful for:

- vibe coders and AI-powered builders
- founders building software with AI
- developers who want AI work to be traceable
- small teams using AI assistants
- agencies delivering repeated AI-assisted projects
- product owners who need clearer planning before coding
- developers working on multiple apps in the same product

You can use it with any AI coding assistant. Kabeeri is not tied to one AI tool.

## Why Use It?

AI assistants are powerful, but software projects still fail when:

- the product is vague
- the AI starts coding before tasks exist
- backend, frontend, and mobile work get mixed together
- two developers edit the same files
- token usage is invisible
- the dashboard is stale
- work is done outside the agreed task
- the owner cannot tell what is ready, blocked, or risky

Kabeeri provides the governance layer around the AI workflow.

## Quick Setup For The Engine

This setup is mainly for the AI assistant, automation, or advanced users who need the local engine available.

Install dependencies from this repository:

```bash
npm install
```

Check the runtime engine:

```bash
npm run kvdf -- --help
npm run kvdf -- doctor
npm run kvdf -- validate
```

After local linking or package installation, `kvdf` can be used directly. In daily vibe coding, your AI assistant may run these commands for you.

## Start With An AI Assistant

Open the repository or your product workspace in your editor, then tell your AI assistant something like:

```text
Use Kabeeri to help me start a new ecommerce project. Ask me only the missing
questions, recommend the delivery mode, create governed tasks, and keep the
dashboard updated. Do not implement outside approved tasks.
```

The assistant can then use Kabeeri's runtime records and CLI engine behind the scenes.

## What To Ask The AI To Do First

For a new product, the developer can simply say:

```text
Use Kabeeri as the operating system for this project.
Start by understanding the product, ask me only the missing questions,
choose the right delivery mode with my approval, create governed tasks,
track AI usage, and keep the live dashboard updated.
```

For an existing project, say:

```text
Use Kabeeri to analyze this existing codebase.
Do not rewrite it. Identify the app boundaries, tech stack, risks,
missing tasks, dashboard state, and what should be done next.
```

## Workspace State

Inside the folder where you want Kabeeri runtime state:

```bash
kvdf init --profile standard --mode structured
```

By default, Kabeeri stores `language: user`, which means adaptive intake and generated guidance should follow the user's detected language unless you override it:

```bash
kvdf init --profile standard --lang en
kvdf init --profile standard --lang ar
```

## Project Profiles

Kabeeri has three project profiles:

| Profile | Best For |
| --- | --- |
| `lite` | landing pages, small MVPs, simple tools |
| `standard` | SaaS apps, ecommerce, CMS, booking, business systems |
| `enterprise` | ERP, marketplaces, multi-tenant systems, large long-term platforms |

The AI assistant can create a skeleton from the selected profile. An advanced developer can run:

```bash
kvdf create --profile standard --output my-project
```

or:

```bash
kvdf generate --profile standard --output my-project
```

When this command runs inside an initialized `.kabeeri` workspace, Kabeeri also creates proposed governance tasks for review, implementation, and validation. This prevents generated Laravel, Next.js, WordPress, or other skeletons from bypassing the task tracker.

Use this only when you want a raw skeleton without tasks:

```bash
kvdf create --profile standard --output my-project --no-tasks
```

## Recommended Vibe Workflow

A practical flow with any AI assistant:

1. Initialize Kabeeri.
2. Describe the product in normal language.
3. Let Kabeeri recommend blueprint, delivery mode, data design, UI direction, and framework prompt packs.
4. Ask only the missing questions.
5. Convert approved suggestions into tasks.
6. Work on one task at a time.
7. Use task tokens and locks for execution scope.
8. Record AI token usage.
9. Capture any work done outside the normal flow.
10. Review, verify, and hand off.

The AI assistant may use commands like these behind the scenes:

```bash
kvdf questionnaire plan "Build an ecommerce store with Laravel backend, Next.js frontend, payments, shipping, and a mobile app" --json
kvdf blueprint recommend "Build ecommerce store with catalog cart checkout payments shipping"
kvdf data-design context ecommerce --json
kvdf design recommend ecommerce --json
kvdf delivery recommend "Build a regulated ERP with accounting and approvals" --json
```

## `kvdf` Examples For Automation

These examples are mainly for AI assistants, scripts, and advanced users. They are not the primary way a vibe coder has to think about Kabeeri:

```bash
kvdf vibe suggest "Add a checkout page for customers"
kvdf vibe plan "Build ecommerce store with products cart checkout admin and tests"
kvdf vibe convert suggestion-001
kvdf capture --summary "Implemented checkout validation" --files src/checkout.ts --checks "npm test" --evidence "checkout tests passed"
```

Post-work captures are important. If files changed without a linked task, readiness can become blocked until the capture is linked, converted, rejected, or resolved.

## Task Governance

Kabeeri expects implementation to happen through tasks.

```bash
kvdf task create --title "Build product catalog API" --workstream backend
kvdf task approve task-001
kvdf task assign task-001 --assignee agent-001
kvdf token issue --task task-001 --assignee agent-001 --max-usage-tokens 50000
kvdf lock acquire --task task-001 --type folder --scope src/api/products --owner agent-001
kvdf task start task-001 --actor agent-001
```

The task tracker is available as both CLI output and live JSON:

```bash
kvdf task tracker
kvdf task tracker --json
```

## AI Usage And Cost Tracking

Task usage:

```bash
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --cost 0.25
```

Non-task usage, such as owner questions, planning, documentation, or dashboard review:

```bash
kvdf usage inquiry --input-tokens 300 --output-tokens 120 --cost 0.04 --operation owner-question
kvdf usage admin --input-tokens 500 --output-tokens 200 --cost 0.08 --operation dashboard-review
```

Summary:

```bash
kvdf usage summary
kvdf usage efficiency
```

## Live Dashboard

Serve the local dashboard:

```bash
kvdf dashboard serve --port 4177
```

Routes:

- customer page: `http://127.0.0.1:4177/`
- private dashboard: `http://127.0.0.1:4177/__kvdf/dashboard`
- full live state: `http://127.0.0.1:4177/__kvdf/api/state`
- task tracker state: `http://127.0.0.1:4177/__kvdf/api/tasks`
- live reports: `http://127.0.0.1:4177/__kvdf/api/reports`

The dashboard shows apps, task tracker, execution scopes, workstreams, Vibe suggestions, post-work captures, Agile/Structured state, AI usage, policies, readiness, security, migrations, and developer efficiency. Each dashboard section includes a short explanation so the developer remembers why the table exists.

## Readiness, Governance, And Release Gates

Generate independent reports:

```bash
kvdf readiness report --output readiness.md
kvdf governance report --output governance.md
kvdf reports live
```

Release and GitHub publishing are guarded by policy gates:

```bash
kvdf policy evaluate --release v0.2.0
kvdf release publish --version v0.2.0 --dry-run
```

Open tasks may produce a readiness warning. That is not always a hard blocker. Actual blockers include failed validation, blocked policies, blocked migration/security checks, or ungoverned changed files captured without a task.

## Agile And Structured Delivery

Kabeeri supports two delivery styles:

- Agile: backlog, epics, stories, sprints, reviews, impediments, retrospectives, velocity.
- Structured: requirements, phases, deliverables, risks, approvals, gates, traceability.

The delivery advisor can recommend one, but the developer or owner decides:

```bash
kvdf delivery recommend "Build CRM with pipeline, reporting, and integrations" --json
kvdf delivery choose agile --reason "Client wants iterative delivery"
```

## Repository Layout

The current repository is organized into stable groups:

```text
src/                 CLI source code
bin/                 executable kvdf entrypoint
knowledge/           governance, task, design, agile, data, and workflow knowledge
packs/               generators, templates, prompt packs, examples
integrations/        dashboard, GitHub, VS Code, multi-AI integration knowledge
schemas/             runtime and contract schemas
docs/                documentation, reports, docs site, production guides
cli/                 command reference
tests/               CLI integration tests
```

Runtime project state is stored in:

```text
.kabeeri/
```

## Documentation

Start here:

- [System Capabilities Reference](docs/SYSTEM_CAPABILITIES_REFERENCE.md)
- [CLI Command Reference](cli/CLI_COMMAND_REFERENCE.md)
- [Production State](docs/production/V1_CURRENT_STATE.md)
- [Docs Site](docs/site/index.html)

Open the docs site:

```bash
kvdf docs open
kvdf docs serve --port 4180
```

## Development

Run tests:

```bash
npm test
```

Run smoke checks:

```bash
npm run test:smoke
```

Run full check:

```bash
npm run check
```

## License

Kabeeri Vibe Developer Framework is open-source software released under the MIT License.

See [LICENSE](LICENSE).
