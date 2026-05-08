const pages = [
  ["what-is", "What is Kabeeri-vdf", "ما هو Kabeeri-vdf"],
  ["start-here", "Start here", "ابدأ من هنا"],
  ["new-project", "New project workflow", "مسار مشروع جديد"],
  ["existing-project", "Existing project adoption", "اعتماد مشروع قائم"],
  ["structured-delivery", "Structured Delivery", "التسليم المنظم"],
  ["agile-delivery", "Agile Delivery", "التسليم الأجايل"],
  ["questionnaire-engine", "Questionnaire engine", "محرك الأسئلة"],
  ["task-governance", "Task governance and provenance", "حوكمة التاسكات والمصدر"],
  ["dashboard-monitoring", "Dashboard and monitoring", "الداشبورد والمتابعة"],
  ["owner-verify", "Owner verify", "تحقق المالك"],
  ["ai-cost-control", "AI cost control", "التحكم في تكلفة الذكاء الاصطناعي"],
  ["multi-ai-governance", "Multi-AI governance", "حوكمة تعدد وكلاء الذكاء الاصطناعي"],
  ["vibe-first", "Vibe-first workflow", "مسار Vibe-first"],
  ["design-source-governance", "Design source governance", "حوكمة مصادر التصميم"],
  ["production-publish", "Production vs Publish", "الإنتاج مقابل النشر"],
  ["troubleshooting", "Troubleshooting", "حل المشكلات"]
];

const content = {
  en: {
    ui: {
      eyebrow: "Kabeeri VDF Guide",
      beginner: "Beginner explanation",
      deep: "Practical Details",
      checklist: "Checklist",
      example: "Example",
      mistakes: "Common Mistakes",
      search: "Search docs",
      filter: "Filter"
    },
    pages: {
      "what-is": {
        lead: "Kabeeri-vdf is a local-first operating system for AI-assisted software delivery. It helps a developer turn a raw idea into questions, project state, governed tasks, AI prompts, tracked implementation, review evidence, Owner verification, and release decisions.",
        beginner: "If you are new, think of Kabeeri as the project manager, memory, rulebook, and dashboard that sits beside your AI coding tools. Codex, Claude, Cursor, Windsurf, and GitHub Copilot help write, edit, and explain code; Kabeeri decides what work should exist, why it exists, who may do it, how AI usage is tracked, and when the result is accepted.",
        sections: [
          ["The system role", "Kabeeri is a meta-framework above the codebase. It manages delivery state, not application runtime. Your app may still be Laravel, Next.js, Django, .NET, WordPress, React, or any other stack."],
          ["Source of truth", "The `.kabeeri/` folder stores project identity, owner, mode, tasks, audit events, dashboard state, GitHub mapping, AI usage, tokens, locks, memory, policies, and verification data."],
          ["Developer workflow", "The developer opens the folder in VS Code or another editor, runs validation, reads the current project state, chooses the next ready task, works with an AI coding tool, records evidence, and sends the task to review and Owner verification."],
          ["AI coding tools relationship", "Kabeeri does not replace Codex, Claude, Cursor, Windsurf, or GitHub Copilot. Those tools are coding assistants. Kabeeri is the governance layer that feeds them scoped prompts and records what they produced."],
          ["Productivity value", "Kabeeri reduces random prompting, duplicate work, unclear scope, forgotten decisions, uncontrolled token spend, and unsafe parallel AI work. It makes AI development repeatable instead of improvised."],
          ["Governance value", "Tasks must have sources, acceptance criteria, owners, assignees, reviewers, allowed scope, AI cost metadata, audit events, and final Owner verification when required."],
          ["Project visibility", "Dashboards and reports show technical state, business readiness, task progress, locks, sprint status, feature readiness, journey readiness, cost, and publish readiness."],
          ["End of the journey", "The flow ends when work is reviewed, accepted by the Owner, tokens and locks are closed, release readiness is checked, and the project is either production-ready, published, or intentionally deferred."]
        ],
        pipeline: ["Open folder", "Validate state", "Answer questions", "Create tasks", "Use AI coding", "Review evidence", "Owner verify", "Release decision"],
        details: [
          ["What Kabeeri is", ["It is a delivery operating layer for vibe coding, AI-assisted development, and software teams that use AI heavily.", "It starts before code, continues during implementation, and remains useful after code is generated because it tracks acceptance, cost, verification, and release state."]],
          ["What Kabeeri is not", ["It is not a replacement for Codex, Claude, GitHub Copilot, Cursor, Windsurf, ChatGPT, or your IDE. It does not try to be the AI brain that writes every line of code.", "It is not a backend framework, a no-code platform, a hosting service, or a Git replacement. Git stores code history; Kabeeri stores delivery intent, governance, and acceptance state."]],
          ["How it helps productivity", ["It turns vague requests into scoped tasks, prevents the AI from working on random areas, and gives each coding session a clear source and acceptance target.", "It helps the developer resume work quickly because the next task, blockers, owner decisions, locks, and past AI usage are visible instead of hidden in chat history."]],
          ["How the developer starts", ["Open the project folder in VS Code or a similar editor. Run `kvdf validate` or `node bin/kvdf.js validate` to check the workspace, then inspect tasks, dashboard state, and missing questions.", "For a new project, initialize or generate a profile. For an existing project, adopt it gradually without overwriting useful work."]],
          ["How AI coding fits", ["The developer can ask Codex, Claude, Copilot, Cursor, or another AI tool to implement one scoped task at a time using Kabeeri context, prompt packs, allowed files, and acceptance criteria.", "After the AI produces code, Kabeeri helps record what changed, what evidence exists, how much AI was used, and whether the result is accepted or needs rework."]],
          ["What the full system can manage", ["Project intake, delivery mode selection, adaptive questionnaires, generated tasks, prompt packs, sprints, features, journeys, acceptance records, audit logs, GitHub issue mapping, dashboard export, VS Code-oriented workflows, agents, task tokens, locks, budgets, AI usage events, pricing rules, design source governance, Owner verification, and production/publish state.", "These pieces are designed to work together around the `.kabeeri/` source of truth."]],
          ["Why Owner verification matters", ["AI can generate code quickly, but speed is not the same as acceptance. Kabeeri separates implementation, review, and final Owner verification.", "This prevents an AI agent or implementer from silently deciding that work is finished without accountable approval."]],
          ["Where the journey ends", ["A project does not end when the AI writes code. It ends when tasks are reviewed, evidence is recorded, the Owner verifies, cost and audit records are complete, and release readiness is explicitly decided.", "A release may become production-ready without being publicly published. Kabeeri keeps those states separate."]]
        ],
        checklist: ["The reader understands that Kabeeri manages AI software delivery, not the application runtime.", "The reader understands that Codex, Claude, Copilot, Cursor, and similar tools still write or assist code.", "The `.kabeeri/` folder is understood as the local source of truth.", "The workflow from opening the folder to Owner verification is clear.", "The main capabilities are visible: intake, questionnaires, tasks, prompts, dashboard, GitHub sync, AI cost, tokens, locks, audit, design governance, and release state.", "The difference between production-ready and published is clear."],
        example: "A developer opens an existing app in VS Code. Instead of asking an AI tool to just improve the app, they run validation, read the dashboard, pick a ready task with a source and acceptance criteria, ask Codex or Claude to implement only that task, record AI usage and changed files, run checks, request review, then the Owner verifies or rejects. Kabeeri did not replace the AI assistant; it made the AI session focused, measurable, and safe to accept.",
        mistakes: ["Thinking Kabeeri is an AI coding model. It is the management and governance layer around AI coding tools.", "Using AI chat history as the only project memory.", "Starting work without a task source and acceptance criteria.", "Letting multiple AI agents edit overlapping files without locks.", "Ignoring token cost until the end.", "Publishing because code runs locally without Owner verification and release checks."]
      },
      "start-here": {
        lead: "Start here when you want to use Kabeeri-vdf as a disciplined operating system for AI-assisted software development, not as a loose collection of prompts. This page explains how to enter the system, understand its capabilities, work through Vibe-first interactions, and move from a project folder to governed delivery.",
        beginner: "The simplest mental model is this: you open the Kabeeri project folder, let the system inspect and validate its state, answer the questions that define the project, convert answers into tasks, run those tasks through AI coding tools, watch the dashboard, track AI token cost, and finish only after review and Owner verification. The CLI works underneath this flow as the engine, while Vibe-first keeps the human experience natural.",
        sections: [
          ["Open the Kabeeri folder", "Start from the repository or generated project folder. The folder is not just code; it contains `.kabeeri/`, docs, generators, prompt packs, questionnaires, task records, dashboards, and governance rules."],
          ["Validate before acting", "Run validation or doctor commands before major work. Validation checks framework files, JSON/JSONL state, prompt packs, generators, task governance, Owner rules, locks, tokens, and workspace health."],
          ["Use Vibe-first as the entry experience", "Describe what you want naturally. Kabeeri should classify the intent, detect vague requests, suggest task cards, and only then let work move toward execution."],
          ["Understand the CLI engine", "The `kvdf` CLI powers the workflow under the surface: init, create, validate, questionnaire flow, task lifecycle, dashboard export, GitHub sync, AI usage, tokens, locks, Owner verify, and release checks."],
          ["Generate and answer questions", "Use adaptive questionnaires to understand the project without asking everything at once. Answers activate system areas, produce coverage reports, expose missing answers, and generate tasks with provenance."],
          ["Convert answers into governed tasks", "A task is not just a note. It needs a source, scope, workstream, acceptance criteria, assignee, allowed files, review path, cost expectation, and audit trail."],
          ["Watch the dashboard", "Use dashboards to see technical progress, business readiness, feature status, user journeys, locks, assignments, AI cost, sprint state, and publish readiness."],
          ["Manage backend and frontend workstreams", "Kabeeri understands workstreams such as backend, public frontend, admin frontend, database, integrations, testing, docs, security, design, and release. It uses workstream ownership and locks to prevent overlap."],
          ["Build project interfaces", "Frontend work starts from approved design text specs, page specs, component contracts, design tokens, responsive states, accessibility notes, data requirements, and visual acceptance criteria."],
          ["Build the backend", "Backend work starts from capability questions, data requirements, API contracts, auth and permission rules, database models, validation, services, error handling, tests, and release handoff."],
          ["Track AI tokens and cost", "AI usage should be linked to tasks, developers or AI agents, providers, models, workstreams, accepted output, rework, exploration, and untracked usage."],
          ["Sync GitHub safely", "GitHub issues, labels, milestones, and releases can be synced, but `.kabeeri/` remains the source of truth. Dry-run is the safe default; writes require explicit confirmation."],
          ["Manage the project team", "Humans and AI agents have identities, roles, workstreams, access tokens, locks, budgets, and audit events. Final verification belongs to the active Owner."],
          ["Choose Structured or Agile", "Structured Delivery gives a sequential documentation-led path. Agile Delivery gives backlog, epics, stories, sprints, reviews, and sprint cost analytics. Vibe-first can sit above either mode."]
        ],
        pipeline: ["Open folder", "Validate", "Vibe-first intent", "Questions", "Tasks", "AI coding", "Dashboard", "Owner verify"],
        details: [
          ["Step 1: enter through the folder", ["Open the Kabeeri repository or generated project in VS Code or a similar editor. Do not start by asking AI to change code. First orient yourself in the workspace.", "Look for `.kabeeri/` as the local source of truth, then review docs, task state, dashboard state, and the active delivery mode."]],
          ["Step 2: let validation create trust", ["Run `node bin/kvdf.js validate` or `kvdf validate` to confirm core files, JSON state, prompt packs, generators, task rules, Owner state, locks, tokens, and audit files are valid.", "If validation fails, fix the source state before execution. A broken source of truth means the dashboard, GitHub sync, and AI work may mislead you."]],
          ["Step 3: use Vibe-first without losing governance", ["Vibe-first lets a user say: I want to add payments, improve onboarding, or fix dashboard performance. Kabeeri classifies the intent and turns it into reviewable suggestions.", "The important point is that natural language is not automatic approval. Suggested tasks must be reviewed, scoped, and connected to sources before execution."]],
          ["Step 4: know that CLI is the engine", ["The CLI is not the whole product experience, but it is the reliable execution layer under chat, cards, dashboard actions, VS Code tasks, and automation.", "Examples include `kvdf questionnaire flow`, `kvdf task create`, `kvdf task start`, `kvdf dashboard export`, `kvdf usage summary`, `kvdf github issue sync --dry-run`, and `kvdf task verify`."]],
          ["Step 5: use questions to build project intelligence", ["Kabeeri's adaptive questionnaire engine starts with entry questions, detects project type, activates relevant system areas, asks deeper questions only when needed, then creates coverage and missing-answer reports.", "The capability map covers product, users, frontend, backend, database, auth, admin, notifications, payments, SEO, accessibility, performance, testing, deployment, monitoring, support, legal, AI features, data governance, and Kabeeri control."]],
          ["Step 6: turn clarity into tasks", ["When answers are ready, Kabeeri can generate proposed tasks that include provenance back to system areas, question IDs, answer IDs, and source mode.", "Before work starts, each task needs readiness: scope, acceptance criteria, workstream, assignee, reviewer, allowed or forbidden files, token budget, and expected evidence."]],
          ["Step 7: plan frontend before implementation", ["Do not ask AI to build UI from a screenshot, PDF, Figma link, or reference website directly. Kabeeri requires design sources to become approved text specs first.", "Create or review a Page Spec for each real page: purpose, audience, layout, data requirements, loading/empty/error/success states, responsive behavior, RTL/LTR needs, accessibility, and acceptance criteria. Repeated UI needs Component Contracts with variants, props, states, design tokens, forbidden variations, and review checks."]],
          ["Step 8: execute frontend tasks safely", ["Choose the correct frontend prompt pack: React, Vue, Angular for SPA/front-end layers; Next.js, Nuxt, SvelteKit, or Astro when routing/rendering conventions matter.", "Turn each page or component into a scoped task. The task should mention page spec, component contract, allowed files, data source, responsive states, accessibility checks, and visual acceptance evidence. AI implements one UI task at a time, then screenshots or visual notes prove acceptance."]],
          ["Step 9: plan backend before implementation", ["Backend work starts from system capability coverage: users, auth, permissions, database, APIs, integrations, payments, notifications, files, audit logs, security, performance, monitoring, and deployment.", "Before coding, define data models, API contracts, validation rules, auth/authorization behavior, service boundaries, error handling, logging, tests, migration impact, and release risks. A backend task is not ready if the API contract or data shape is still unknown."]],
          ["Step 10: execute backend tasks safely", ["Choose the correct backend prompt pack: Express.js, FastAPI, Django, Laravel, Rails, Spring Boot, NestJS, Symfony, Go Gin, .NET, Supabase, Firebase, or another supported stack.", "Use one prompt for one small backend task: route, controller, service, model, migration, validation rule, integration, job, or test set. Review output, run checks, record changed files, record AI usage, and connect the result to acceptance criteria before moving on."]],
          ["Step 11: execute with AI coding tools", ["Use Codex, Claude, Cursor, Windsurf, GitHub Copilot, or another AI tool to implement one scoped task at a time. Kabeeri provides context, prompt packs, constraints, and acceptance expectations.", "For backend/frontend awareness, pick the right workstream and prompt pack. A backend task, public frontend task, admin frontend task, database task, and integration task should not be mixed silently."]],
          ["Step 12: monitor the project like a professional product", ["The technical dashboard shows tasks, checks, backend/frontend/admin/database/docs/testing progress, locks, assignments, GitHub sync, agent activity, and cost so far.", "The business dashboard translates that into feature readiness, user journeys, target audience, demo readiness, publish readiness, deferred features, and release value."]],
          ["Step 13: control AI cost", ["Use low-cost mode, context packs, model routing, pricing rules, and budget approvals to avoid expensive random prompting.", "Usage records should distinguish accepted output, rejected output, rework, exploration, untracked usage, urgent incidents, sprint totals, and workstream totals."]],
          ["Step 14: coordinate GitHub and the team safely", ["GitHub sync can map Kabeeri tasks to issues, milestones, labels, and releases, but writes should dry-run first and require confirmation.", "For teams, every human developer and AI agent should have identity, role, assigned workstreams, access token, locks, and audit trail. Owner-only verification prevents accidental final acceptance."]],
          ["Step 15: choose the delivery mode deliberately", ["Use Structured when you need deep planning, full documentation, stable scope, client handoff, regulated work, or complex architecture.", "Use Agile when you need fast iteration, backlog, stories, sprints, feedback, demos, and sprint cost analytics. Vibe-first can be the human-friendly layer above both."]],
          ["Step 16: know when you are done", ["You are not done when AI produces code. You are done when checks pass or risks are accepted, evidence is recorded, the reviewer has reviewed, the Owner has verified, tokens and locks are handled, and the release decision is explicit.", "A project can be production-ready without being published. Kabeeri keeps that distinction visible."]
          ]
        ],
        checklist: ["The user knows Kabeeri is a professional system for managing AI-assisted development, not a random prompt library.", "The user understands `.kabeeri/` as the source of truth.", "The user knows to validate the folder before work.", "The user understands Vibe-first and that CLI powers it underneath.", "The user knows how questions become coverage, missing-answer reports, tasks, and provenance.", "The user understands backend, frontend, admin, database, testing, docs, security, and integration workstreams.", "The user knows frontend work needs approved design text specs, page specs, component contracts, states, accessibility, and visual acceptance.", "The user knows backend work needs data models, API contracts, validation, auth, permissions, services, tests, and release checks.", "The user knows dashboards show technical, business, and AI cost views.", "The user understands AI token usage, budgets, and untracked usage.", "The user understands GitHub sync is safe and confirmation-based.", "The user understands team and AI agent governance: identities, roles, tokens, locks, budgets, audit, and Owner verify.", "The user can choose Structured or Agile without guessing.", "The user knows the workflow ends with verification and a release or publish decision."],
        example: "A developer opens a Kabeeri-managed SaaS project in VS Code. They run validation, see that payments and onboarding questions are missing, answer the relevant questionnaire items, generate proposed tasks, review the task cards, choose an Agile sprint, and split work properly. The frontend task references an approved onboarding page spec, component contracts, responsive states, and visual acceptance. The backend task references payment API contracts, database changes, validation rules, authorization, tests, and release risk. They issue scoped tokens and locks, run AI coding through Codex or Claude, record usage, watch the dashboard, sync GitHub issues with dry-run first, review evidence, then the Owner verifies or rejects. This is how Kabeeri turns vibe coding into a controlled professional product workflow.",
        mistakes: ["Starting with AI coding before validating the Kabeeri folder.", "Using Vibe-first as permission for silent execution instead of suggested tasks.", "Treating CLI as optional magic instead of the engine that enforces state changes.", "Answering questions but not converting them into traceable tasks.", "Mixing backend, frontend, admin, and database changes inside one vague task.", "Ignoring AI token budgets and untracked usage.", "Letting GitHub become the source of truth instead of `.kabeeri/`.", "Letting AI agents work without identity, assignment, tokens, or locks.", "Choosing Structured or Agile casually without matching the project type.", "Calling work finished before review, Owner verification, and release decision."],
        command: "node bin/kvdf.js validate\nnode bin/kvdf.js doctor\nnode bin/kvdf.js questionnaire flow\nnode bin/kvdf.js questionnaire coverage\nnode bin/kvdf.js questionnaire generate-tasks\nnode bin/kvdf.js task list\nnode bin/kvdf.js dashboard export\nnode bin/kvdf.js usage summary\nnode bin/kvdf.js github issue sync --dry-run"
      },
      "new-project": {
        lead: "A new project starts from intent, then becomes structured files, questions, tasks, acceptance criteria, and governed work.",
        beginner: "For a new idea, do not start with code. First capture the goal, audience, delivery style, and owner so generated tasks have a clear source.",
        sections: [
          ["Intake", "Capture the product goal, audience, delivery mode, project owner, stack, and release expectations."],
          ["Questionnaire", "Use adaptive questions to activate only relevant system areas."],
          ["Output", "Generate docs, task candidates, prompt packs, acceptance checklists, and initial dashboard state."]
        ],
        details: [
          ["Step-by-step start", ["Write the simplest product statement: who it serves, what problem it solves, and what success looks like.", "Choose owner and delivery mode. Then answer only the questionnaire sections that affect the first release."]],
          ["From answers to tasks", ["Each important answer should either become documentation, a decision, a task, or a deferred item.", "Generated tasks must include a source reference so nobody has to guess why the task exists later."]],
          ["What ready looks like", ["A new project is ready for implementation when there is a clear first scope, enough acceptance criteria, known risks, and no missing owner decision blocking the first task."]]
        ],
        checklist: ["Goal written in plain language.", "Audience identified.", "Owner selected.", "Delivery mode selected.", "First release boundary described.", "Questions answered or intentionally deferred."],
        example: "For an e-commerce MVP, intake records customer type, product catalog needs, checkout approach, admin needs, payment risk, and first release definition before coding.",
        mistakes: ["Writing tasks that only say build page or add feature.", "Asking every possible question before the first useful milestone.", "Letting generated docs become final without owner review."]
      },
      "existing-project": {
        lead: "Existing projects should be adopted safely without overwriting useful work.",
        beginner: "For an existing repository, Kabeeri should observe and map what is already there. It should not overwrite useful work or force a new structure immediately.",
        sections: [
          ["Scan", "Inspect repository structure, docs, tasks, tests, and current delivery state."],
          ["Map", "Map existing folders and decisions into Kabeeri concepts without forcing a rewrite."],
          ["Adopt", "Add `.kabeeri/` state, intake notes, provenance, and governance rules incrementally."]
        ],
        details: [
          ["Safe adoption sequence", ["Start read-only: scan files, package scripts, docs, open tasks, and release notes.", "Create adoption notes before changing project structure. The first Kabeeri task should be adoption itself."]],
          ["Mapping existing work", ["Existing README files become project context. Existing issues can become task sources. Existing tests become verification evidence.", "If a decision has no source, mark it as unknown rather than inventing history."]],
          ["When to stop adoption", ["Stop when Kabeeri can validate core state, display meaningful dashboard status, and track future tasks. Deep cleanup can become later tasks."]]
        ],
        checklist: ["Repo scanned.", "Current scripts listed.", "Existing docs mapped.", "Known tasks imported or referenced.", "Unknown decisions recorded.", "No useful work overwritten."],
        example: "A React app already has pages and tests. Kabeeri adopts the repo by documenting current features, linking tests, and creating backlog tasks for missing governance.",
        mistakes: ["Renaming folders during adoption without a task.", "Deleting old docs because they are messy.", "Pretending unknown decisions are approved."]
      },
      "structured-delivery": {
        lead: "Structured Delivery is a sequential path from idea to documents, tasks, acceptance, and release.",
        beginner: "Use Structured Delivery when you want a calm, step-by-step path. It is especially useful when a client needs clear documents and acceptance gates.",
        sections: [
          ["Best for", "Clear-scope work, client handoff, documentation-first projects, and stable release preparation."],
          ["Sequence", "Questionnaires, generated docs, task definitions, acceptance checklists, implementation, review, verification."],
          ["Guardrail", "Do not skip source references or acceptance criteria when creating tasks."]
        ],
        details: [
          ["The full sequence", ["Intake defines scope. Questionnaires clarify unknowns. Docs summarize decisions. Tasks make work executable. Reviews collect evidence. Owner verify closes the gate.", "Each step should produce something visible, even if it is short."]],
          ["When to require strictness", ["Use stricter gates for client delivery, regulated work, paid milestones, design-heavy frontend work, or expensive AI execution.", "Lightweight internal experiments can use fewer required fields but should still preserve source and acceptance."]],
          ["How to continue", ["Continue from the next incomplete gate. If tasks exist but docs are stale, update the source docs or record a change decision before adding more implementation."]]
        ],
        checklist: ["Intake complete.", "Relevant questions answered.", "Docs reviewed.", "Tasks include acceptance.", "Evidence attached before verification.", "Owner closes final acceptance."],
        example: "A client dashboard project goes through requirements, page specs, task cards, implementation evidence, client review, owner verify, then production readiness.",
        mistakes: ["Skipping documentation because the task seems obvious.", "Changing scope during implementation without recording the decision.", "Calling work done when acceptance evidence is missing."]
      },
      "agile-delivery": {
        lead: "Agile Delivery organizes work through backlog, epics, user stories, sprint planning, review, and cost metadata.",
        beginner: "Use Agile Delivery when work changes often. Backlog, stories, and sprints help you plan small chunks and review cost after each sprint.",
        sections: [
          ["Backlog", "Product ideas and requirements become epics and stories with source references."],
          ["Sprint", "Sprint planning includes scope, owner, workstreams, acceptance, and AI cost estimates."],
          ["Review", "Sprint review includes accepted work, rework, token cost, risks, and next priorities."]
        ],
        details: [
          ["Backlog hygiene", ["Every backlog item needs a source, rough value, owner expectation, and acceptance hint.", "Ideas can stay vague in the backlog, but sprint-ready stories must be specific enough to test."]],
          ["Sprint planning", ["Select stories by capacity, dependency, risk, and cost. Expensive AI tasks should have preflight estimates before the sprint starts.", "Keep integration tasks visible because they often affect multiple workstreams."]],
          ["Sprint review", ["Review finished work, rejected work, rework, cost variance, unresolved risks, and what should move into the next sprint.", "Accepted output should be linked to evidence, not just a verbal update."]]
        ],
        checklist: ["Backlog has sources.", "Stories have acceptance criteria.", "Sprint scope is explicit.", "AI budget is estimated.", "Review records accepted and rejected work."],
        example: "A two-week sprint includes login, profile editing, and dashboard filters. Review shows login accepted, profile needs rework, filters exceeded AI cost estimate.",
        mistakes: ["Putting vague ideas directly into sprint work.", "Ignoring AI cost until after the sprint.", "Closing stories without owner or reviewer evidence."]
      },
      "questionnaire-engine": {
        lead: "The adaptive questionnaire engine asks fewer questions first and expands only when the project needs more detail.",
        beginner: "The questionnaire engine is not a long form for everything. It asks enough to understand the project, then expands only where the answers show risk or missing detail.",
        sections: [
          ["Activation", "Answers activate required, optional, deferred, not applicable, unknown, or follow-up system areas."],
          ["Coverage", "Coverage reports prevent silent skips across product, users, frontend, backend, security, operations, and Kabeeri control layers."],
          ["Output", "Answers can become docs, tasks, acceptance criteria, memory, and missing answer reports."]
        ],
        details: [
          ["How answers change the flow", ["A yes answer can activate new sections. A not applicable answer can close them. An unknown answer should create a follow-up rather than blocking everything.", "The goal is useful coverage, not maximum questions."]],
          ["Question quality", ["Good questions are concrete, answerable, and connected to a decision. Avoid questions that collect trivia nobody will use.", "If an answer affects scope, security, cost, ownership, or release readiness, it deserves tracking."]],
          ["What to do with missing answers", ["Mark missing answers as deferred, blocked, unknown, or not applicable. Then decide whether they block the current task or a later release."]]
        ],
        checklist: ["Questions are relevant.", "Unknowns are tracked.", "Deferred answers have a reason.", "Coverage report is reviewed.", "Important answers produce docs or tasks."],
        example: "If the user says payments are needed, Kabeeri asks about provider, currency, refunds, test mode, security, and release gate. If payments are not needed, that branch closes.",
        mistakes: ["Asking every question upfront.", "Treating unknown as no.", "Leaving missing answers invisible."]
      },
      "task-governance": {
        lead: "Task governance makes every task traceable to a source, scoped to workstreams, and reviewable through acceptance criteria.",
        beginner: "A governed task is more than a to-do item. It has a source, scope, owner rules, acceptance criteria, and a way to prove it is finished.",
        sections: [
          ["Required", "Task source, title, status, workstream, assignee when executable, allowed files, acceptance criteria, and provenance."],
          ["Provenance", "Tasks can originate from questionnaires, documents, issues, stories, AI suggestions, or post-work capture."],
          ["Safety", "Integration tasks must explicitly list every affected workstream."]
        ],
        details: [
          ["Good task anatomy", ["A good task says what to change, why it exists, what files or areas are allowed, what done means, and how it will be verified.", "If the task uses AI, it should also record cost expectations and actual usage."]],
          ["Task sources", ["Valid sources include questionnaire answers, docs, bugs, owner requests, client feedback, sprint stories, audit findings, and post-work capture.", "AI suggestions are only proposals until a human or owner-approved process accepts them."]],
          ["Continuing or splitting tasks", ["Continue a task when the goal is unchanged and the scope is still accurate. Split it when new workstreams, new risks, or unclear acceptance appear."]]
        ],
        checklist: ["Source exists.", "Scope is clear.", "Allowed files or areas are known.", "Acceptance criteria are testable.", "Evidence will be attached.", "Integration effects are listed."],
        example: "Bad task: Make dashboard better. Good task: Add task status filters to dashboard from story AG-12, touching dashboard JS/CSS only, accepted when filters persist and tests pass.",
        mistakes: ["Creating orphan tasks with no source.", "Letting one task cover unrelated features.", "Closing tasks without evidence."]
      },
      "dashboard-monitoring": {
        lead: "Dashboards summarize `.kabeeri/` state. They are not a separate source of truth.",
        beginner: "The dashboard is a window into project state. If something looks wrong, fix the `.kabeeri/` source data or task record instead of treating the dashboard as a separate database.",
        sections: [
          ["Technical", "Shows task state, workstreams, locks, checks, AI sessions, and implementation readiness."],
          ["Business", "Shows feature readiness, journeys, demo readiness, and production/publish state."],
          ["Cost", "Shows AI token usage by task, sprint, model, workstream, accepted output, rework, and untracked usage."]
        ],
        details: [
          ["What to monitor daily", ["Open tasks, blocked tasks, failed checks, active locks, missing answers, AI cost, and owner verification queue.", "For active teams, also watch cross-workstream conflicts and tasks waiting for review."]],
          ["How to interpret status", ["Green means evidence supports progress. Yellow means risk or missing data. Red means blocked, invalid, over budget, or unsafe to proceed.", "A dashboard number without provenance should trigger investigation, not blind trust."]],
          ["Business view vs technical view", ["Business view explains readiness in product language. Technical view explains implementation and validation health.", "Both views should point back to the same underlying task and state records."]]
        ],
        checklist: ["Blocked work visible.", "Owner verification queue visible.", "AI cost visible.", "Locks visible.", "Release state visible.", "Dashboard data has traceable source."],
        example: "The dashboard shows 80% feature readiness but one red security task. The business view should still say not publish-ready until that gate is cleared.",
        mistakes: ["Fixing the dashboard display instead of bad source state.", "Hiding blocked tasks from business view.", "Ignoring untracked AI usage."]
      },
      "owner-verify": {
        lead: "Owner verify is the final acceptance gate. Reviewers can recommend, but only the active Owner can close final verification.",
        beginner: "Owner verify means the accountable owner says the work is truly accepted. Reviews and tests help, but final verification is protected.",
        sections: [
          ["Before verify", "Task output must include acceptance evidence, checks, risks, files changed, and token usage when AI was used."],
          ["After verify", "Access tokens are revoked or archived, locks are released, and audit events are written."],
          ["Reject", "Owner rejection requires a reason and may issue a narrower rework token."]
        ],
        details: [
          ["What the owner checks", ["The owner checks whether the requested outcome was met, whether evidence is enough, whether risks are acceptable, and whether the work can move forward.", "The owner does not need to inspect every line of code, but must see proof connected to acceptance criteria."]],
          ["Approval outcomes", ["Approved means the task is accepted. Rejected means the work needs changes. Deferred means the work is not accepted yet but may be reconsidered later.", "Each outcome should write an audit event."]],
          ["Rework flow", ["Rejected work should become a narrower rework task or update to the same task with a clear reason.", "Do not reopen the entire scope when only one acceptance point failed."]]
        ],
        checklist: ["Acceptance evidence present.", "Checks run or explicitly skipped with reason.", "Risks listed.", "AI usage recorded when relevant.", "Owner decision recorded.", "Locks and tokens handled after decision."],
        example: "A reviewer says the feature works. The owner still rejects because the mobile screenshot fails the agreed visual acceptance criteria. A rework task is created for mobile layout only.",
        mistakes: ["Letting implementers self-verify final acceptance.", "Rejecting without a reason.", "Leaving task tokens active after approval."]
      },
      "ai-cost-control": {
        lead: "AI cost control makes token usage visible, estimates cost before expensive work, and keeps exploration explainable.",
        beginner: "AI cost control helps you avoid surprise bills. It encourages smaller context, cheaper paths, and visible tracking for exploration and rework.",
        sections: [
          ["Low-cost mode", "Prefer templates, focused context packs, cheaper model classes, and small scoped tasks."],
          ["Preflight", "Estimate input/output tokens, model class, budget status, and approval requirements before premium AI runs."],
          ["Untracked usage", "Random usage is classified as exploration, learning, waste, rework, missing task, or uncaptured work."]
        ],
        details: [
          ["Cost before work", ["Estimate the task complexity, context size, model class, expected output, and number of review loops.", "If a task is exploratory, set a small exploration budget and decide what output would justify continuing."]],
          ["Cost during work", ["Track sessions by task, model, prompt pack, input tokens, output tokens, accepted output, and rework.", "If the model drifts or repeats, stop and narrow the context instead of spending more."]],
          ["Cost after work", ["Compare estimated and actual usage. Label useful exploration, wasted runs, accepted work, and rework.", "Use the review to improve future task sizing."]]
        ],
        checklist: ["Task has AI budget expectation.", "Premium runs have approval if required.", "Usage linked to task or exploration.", "Rework is separated from accepted output.", "Untracked usage is classified."],
        example: "A design review task uses a premium model only after a low-cost pass prepares a focused context pack. The dashboard records both runs and shows which output was accepted.",
        mistakes: ["Sending the whole repo for a tiny task.", "Using premium AI before defining acceptance.", "Treating all exploration as productive work."]
      },
      "multi-ai-governance": {
        lead: "Multi-AI governance lets multiple humans and AI agents work without unsafe overlap.",
        beginner: "When several humans or AI agents work together, Kabeeri prevents overlap with identities, assignment, tokens, and locks.",
        sections: [
          ["Identity", "Every developer and AI agent has a traceable identity, role, workstream, and status."],
          ["Access", "Task access tokens grant scoped permission. They are separate from AI usage tokens."],
          ["Locks", "File, folder, task, workstream, database table, and prompt pack locks prevent conflicts."]
        ],
        details: [
          ["Why identity matters", ["If two agents change the same area, the project must know who owns which task and why.", "Identity also helps audit mistakes, cost, rejected work, and approvals."]],
          ["How scoped access works", ["Access should be granted per task, workstream, or allowed file area. It should expire or be revoked after completion.", "AI usage tokens track cost. They should not be confused with permission to edit files."]],
          ["Conflict prevention", ["Locks should protect files, folders, database tables, prompt packs, and tasks when simultaneous work could collide.", "Integration tasks should declare all workstreams they affect."]]
        ],
        checklist: ["Every agent has an identity.", "Each active task has ownership.", "Access scope is limited.", "Locks are visible.", "Integration tasks list affected workstreams.", "Audit events record important changes."],
        example: "One agent updates frontend filters while another updates API schema. A shared integration lock prevents both from changing the dashboard contract at the same time.",
        mistakes: ["Letting agents work from vague instructions.", "Using cost tokens as edit permission.", "Ignoring locks because the change seems small."]
      },
      "vibe-first": {
        lead: "Vibe-first workflow lets users speak naturally, review suggested task cards, and keep coding momentum.",
        beginner: "Vibe-first means users can describe what they want naturally. Kabeeri turns that intent into reviewable task cards instead of forcing terminal commands.",
        sections: [
          ["Natural language", "User intent is classified, checked for vagueness, and converted into editable suggested tasks."],
          ["Post-work capture", "Free coding can be captured after the fact and linked to a task or changeset."],
          ["CLI as engine", "Common actions should have UI equivalents while CLI remains available for power users."]
        ],
        details: [
          ["From intent to task", ["The user can say what they want in plain language. Kabeeri should detect whether it is a question, task request, bug report, design request, or release request.", "Before execution, suggested task cards should be reviewable and editable."]],
          ["Handling vague requests", ["If the request is vague but low risk, Kabeeri can propose assumptions. If it affects money, release, security, or owner approval, it should ask for clarification or create a blocked task.", "The user should not need to know internal command names to move forward."]],
          ["Post-work capture", ["Sometimes work happens before a task exists. Capture the changed files, summary, reason, evidence, and cost, then link it to a new or existing task."]]
        ],
        checklist: ["Intent classified.", "Assumptions shown.", "Suggested tasks reviewable.", "Risky ambiguity blocked.", "Post-work changes can be captured.", "CLI and UI stay aligned."],
        example: "User says: make onboarding smoother. Kabeeri proposes tasks for copy, step order, analytics, and design review instead of starting random edits.",
        mistakes: ["Treating natural language as automatic approval.", "Hiding assumptions.", "Letting post-work capture replace owner verification."]
      },
      "design-source-governance": {
        lead: "Design source governance prevents frontend implementation from raw images, PDFs, links, screenshots, or reference websites.",
        beginner: "Frontend work should not start from a screenshot alone. First turn the visual source into approved words: page specs, component contracts, and design tokens.",
        sections: [
          ["Rule", "Design sources must become approved text specs before AI implementation."],
          ["Contracts", "Every real page needs a page spec; repeated components need component contracts."],
          ["Visual acceptance", "Frontend work needs screenshot or visual review notes before Owner or client verify."]
        ],
        details: [
          ["Allowed design sources", ["Figma files, screenshots, PDFs, brand guides, reference sites, and sketches can be inputs.", "They are not implementation instructions until converted into approved text specs."]],
          ["What a page spec includes", ["Purpose, audience, layout, states, content hierarchy, responsive behavior, interactions, accessibility, data needs, and visual acceptance criteria.", "Repeated UI should move into component contracts so it stays consistent."]],
          ["Reference site safety", ["Reference sites can inspire structure or mood, but should not be copied. The spec must describe original behavior, spacing, components, and content for this product."]]
        ],
        checklist: ["Design input identified.", "Text spec approved.", "Component contracts created for repeated UI.", "Responsive states described.", "Screenshots or visual notes captured.", "Owner/client visual acceptance recorded."],
        example: "A client sends a screenshot. The team writes a page spec with sections, states, spacing rules, colors, and acceptance screenshots before asking AI to implement.",
        mistakes: ["Building directly from a screenshot.", "Copying a reference website.", "Skipping mobile and empty states.", "Treating design inspiration as client approval."],
        callout: "Reference websites are inspiration only. They are not copy sources and not implementation specs."
      },
      "production-publish": {
        lead: "Production-ready and published are different states.",
        beginner: "Production-ready means it can safely run. Published means it is actually released to users. Kabeeri keeps those decisions separate.",
        sections: [
          ["Production-ready", "The project can run safely in a production environment but may not be publicly launched."],
          ["Published", "The project is live, discoverable, or delivered to users with Owner approval."],
          ["Gate", "Publish decisions require release checklist, no critical blockers, security readiness, and Owner approval."]
        ],
        details: [
          ["Production-ready checks", ["The app builds, required config is known, critical tests pass or have accepted exceptions, security risks are reviewed, and rollback expectations are understood.", "Production-ready does not automatically mean customers can access it."]],
          ["Publish checks", ["Publishing adds audience exposure, support expectations, monitoring, communication, and owner approval.", "A project can be production-ready for internal review and still not published."]],
          ["Release records", ["Each release should record version or changeset, accepted tasks, known issues, owner decision, environment target, and publish status."]]
        ],
        checklist: ["Build/run verified.", "Critical blockers cleared.", "Security and config reviewed.", "Known issues listed.", "Owner approves publish.", "Release state recorded."],
        example: "A staging deployment passes checks and is production-ready. The owner delays public publish until pricing copy and support inbox are ready.",
        mistakes: ["Publishing because deployment succeeded.", "Calling staging production.", "Skipping owner approval for a public launch."]
      },
      "troubleshooting": {
        lead: "Use troubleshooting when validation, tasks, dashboards, cost reports, or verification do not behave as expected.",
        beginner: "When stuck, first validate, then trace the source. Most Kabeeri problems are missing state, missing source, invalid JSON, expired tokens, or unclear ownership.",
        sections: [
          ["Validate", "Run validation first to find missing files, invalid JSON, lock conflicts, or governance issues."],
          ["Trace", "Check audit logs, task provenance, and source references before changing implementation."],
          ["Escalate", "Owner-only actions, budget overrides, publishing, and design approval should not be bypassed."]
        ],
        details: [
          ["First response", ["Run validation. Read the exact failing file or rule. Check whether the problem is data, missing state, broken syntax, expired access, or a real implementation failure.", "Do not fix symptoms before finding the source record."]],
          ["Common issue paths", ["Dashboard wrong: check source state. Task blocked: check missing answers, locks, owner decisions, and dependencies. Cost wrong: check untracked sessions and task links.", "Design blocked: check whether the source was converted into an approved spec."]],
          ["When to escalate", ["Escalate when the action requires owner approval, budget override, publish approval, access expansion, or acceptance of known risk.", "Record the escalation reason so the next person understands why progress stopped."]]
        ],
        checklist: ["Validation run.", "Failing source identified.", "Audit/provenance checked.", "Owner-only gates respected.", "Fix recorded.", "Re-run validation after fix."],
        example: "A task cannot verify. Validation passes, but audit shows no owner decision. The fix is not code; the owner must approve or reject with a reason.",
        mistakes: ["Editing generated output without fixing source state.", "Bypassing locks.", "Treating missing owner approval as a technical bug."],
        command: "node bin/kvdf.js validate\nnode bin/kvdf.js audit list\nnode bin/kvdf.js doctor --deep"
      }
    }
  },
  ar: {
    ui: {
      eyebrow: "دليل Kabeeri VDF",
      beginner: "شرح للمبتدئ",
      deep: "تفاصيل عملية",
      checklist: "قائمة تحقق",
      example: "مثال",
      mistakes: "أخطاء شائعة",
      search: "ابحث في الدليل",
      filter: "تصفية"
    },
    pages: {
      "what-is": {
        lead: "Kabeeri-vdf هو نظام محلي لإدارة عملية تطوير البرمجيات بالذكاء الاصطناعي. يساعد المطور على تحويل الفكرة الخام إلى أسئلة، حالة مشروع، تاسكات محكومة، برومبتات جاهزة للـ AI، تنفيذ متتبع، دليل مراجعة، تحقق مالك، وقرار إنتاج أو نشر.",
        beginner: "لو أنت جديد، اعتبر Kabeeri مدير مشروع وذاكرة وقواعد تشغيل وداشبورد بجانب أدوات البرمجة بالذكاء الاصطناعي. Codex وClaude وCursor وWindsurf وGitHub Copilot تساعدك في كتابة وتعديل وشرح الكود؛ أما Kabeeri فيحدد ما العمل المطلوب، لماذا يوجد، من يملك الموافقة عليه، كيف تتبع تكلفة AI، ومتى يعتبر الناتج مقبولًا.",
        sections: [
          ["دور النظام", "Kabeeri طبقة meta-framework فوق مشروع البرمجة. يدير حالة التسليم وليس تشغيل التطبيق نفسه. تطبيقك قد يكون Laravel أو Next.js أو Django أو .NET أو WordPress أو React أو أي تقنية أخرى."],
          ["مصدر الحقيقة", "مجلد `.kabeeri/` يخزن هوية المشروع، المالك، نمط التسليم، التاسكات، أحداث التدقيق، حالة الداشبورد، ربط GitHub، استخدام AI، التوكنز، اللوكس، الذاكرة، السياسات، وبيانات التحقق."],
          ["مسار المطور", "المطور يفتح المجلد في VS Code أو أي محرر مشابه، يشغل validation، يقرأ حالة المشروع، يختار التاسك الجاهز التالي، يعمل بأداة AI coding، يسجل الدليل، ثم يرسل التاسك للمراجعة وتحقق المالك."],
          ["علاقته بأدوات AI", "Kabeeri لا يستبدل Codex أو Claude أو Cursor أو Windsurf أو GitHub Copilot. هذه أدوات مساعدة للكود. Kabeeri هو طبقة الحوكمة التي تعطيها سياقًا مضبوطًا وتسجل ما أنتجته."],
          ["قيمته للإنتاجية", "Kabeeri يقلل البرومبتات العشوائية، تكرار العمل، غموض النطاق، نسيان القرارات، استهلاك التوكنز بلا رقابة، وتضارب أكثر من وكيل AI على نفس الملفات."],
          ["قيمته للحوكمة", "التاسكات يجب أن يكون لها مصدر، معايير قبول، مالك، منفذ، مراجع، نطاق مسموح، بيانات تكلفة AI، أحداث تدقيق، وتحقق مالك نهائي عند الحاجة."],
          ["رؤية المشروع", "الداشبورد والتقارير تعرض الحالة التقنية، الجاهزية التجارية، تقدم التاسكات، اللوكس، حالة الاسبرنت، جاهزية الميزات والرحلات، التكلفة، وجاهزية النشر."],
          ["نهاية الرحلة", "المسار ينتهي عندما يراجع العمل، يقبله المالك، تغلق التوكنز واللوكس، تفحص جاهزية الإصدار، ثم يقرر المشروع: جاهز للإنتاج، منشور، أو مؤجل بقرار واضح."]
        ],
        pipeline: ["فتح المجلد", "فحص الحالة", "إجابة الأسئلة", "إنشاء التاسكات", "استخدام AI coding", "مراجعة الدليل", "تحقق المالك", "قرار الإصدار"],
        details: [
          ["ما هو Kabeeri فعليًا", ["هو طبقة تشغيل وإدارة للتطوير بأسلوب vibe coding والتطوير المدعوم بالذكاء الاصطناعي والفرق التي تستخدم AI بكثافة.", "يبدأ قبل الكود، يستمر أثناء التنفيذ، ويبقى مفيدًا بعد توليد الكود لأنه يتتبع القبول والتكلفة والتحقق وحالة الإصدار."]],
          ["ما الذي لا يفعله", ["هو ليس بديلًا عن Codex أو Claude أو GitHub Copilot أو Cursor أو Windsurf أو ChatGPT أو محرر الكود. لا يحاول أن يكون نموذج AI يكتب كل سطر.", "هو ليس باكند ولا no-code ولا منصة استضافة ولا بديلًا عن Git. Git يحفظ تاريخ الكود؛ Kabeeri يحفظ نية التسليم والحوكمة والقبول."]],
          ["كيف يساعد في الإنتاجية", ["يحول الطلب الغامض إلى تاسكات محددة، يمنع AI من العمل في مناطق عشوائية، ويجعل كل جلسة كود لها مصدر وهدف قبول واضح.", "يساعد المطور على استكمال العمل بسرعة لأن التاسك التالي، العوائق، قرارات المالك، اللوكس، واستخدام AI السابق كلها ظاهرة بدل أن تكون مدفونة في الشات."]],
          ["كيف يبدأ المطور", ["افتح مجلد المشروع في VS Code أو محرر مشابه. شغل `kvdf validate` أو `node bin/kvdf.js validate` لفحص مساحة العمل، ثم راجع التاسكات وحالة الداشبورد والأسئلة الناقصة.", "في مشروع جديد، أنشئ أو ولد profile مناسب. في مشروع قائم، اعتمده تدريجيًا دون مسح العمل المفيد."]],
          ["كيف يدخل AI coding في المسار", ["يمكن للمطور أن يطلب من Codex أو Claude أو Copilot أو Cursor أو أي أداة AI تنفيذ تاسك واحد محدد باستخدام سياق Kabeeri، حزم البرومبت، الملفات المسموحة، ومعايير القبول.", "بعد أن ينتج AI الكود، يساعد Kabeeri في تسجيل ما تغير، ما الدليل، كم استهلك AI، وهل النتيجة مقبولة أو تحتاج إعادة عمل."]],
          ["ما الذي يستطيع النظام إدارته", ["استقبال المشروع، اختيار نمط التسليم، الأسئلة التكيفية، التاسكات المولدة، prompt packs، الاسبرنتات، الميزات، رحلات المستخدم، سجلات القبول، audit logs، ربط GitHub issues، تصدير الداشبورد، مسارات VS Code، الوكلاء، task tokens، اللوكس، الميزانيات، أحداث استخدام AI، قواعد التسعير، حوكمة مصادر التصميم، تحقق المالك، وحالة الإنتاج أو النشر.", "هذه الأجزاء تعمل معًا حول `.kabeeri/` كمصدر حقيقة محلي."]],
          ["لماذا تحقق المالك مهم", ["AI قد يولد كود بسرعة، لكن السرعة ليست قبولًا. Kabeeri يفصل بين التنفيذ والمراجعة والقبول النهائي من المالك.", "هذا يمنع وكيل AI أو منفذ العمل من أن يقرر وحده أن المهمة انتهت دون موافقة مسؤولة."]],
          ["أين تنتهي الرحلة", ["المشروع لا ينتهي عندما يكتب AI الكود. ينتهي عندما تراجع التاسكات، يسجل الدليل، يتحقق المالك، تكتمل سجلات التكلفة والتدقيق، ويتخذ قرار الإصدار صراحة.", "قد يكون المشروع جاهزًا للإنتاج دون أن يكون منشورًا للعامة. Kabeeri يفصل بين الحالتين."]]
        ],
        checklist: ["القارئ فهم أن Kabeeri يدير تطوير البرمجيات بالذكاء الاصطناعي ولا يشغل التطبيق نفسه.", "القارئ فهم أن Codex وClaude وCopilot وCursor وأدوات مشابهة ما زالت أدوات كتابة ومساعدة في الكود.", "مجلد `.kabeeri/` واضح كمصدر حقيقة محلي.", "المسار من فتح المجلد إلى تحقق المالك واضح.", "الإمكانيات الرئيسية واضحة: الاستقبال، الأسئلة، التاسكات، البرومبتات، الداشبورد، GitHub sync، تكلفة AI، التوكنز، اللوكس، التدقيق، حوكمة التصميم، وحالة الإصدار.", "الفرق بين جاهز للإنتاج ومنشور واضح."],
        example: "مطور يفتح تطبيقًا قائمًا في VS Code. بدل أن يطلب من AI: حسن التطبيق، يشغل validation، يقرأ الداشبورد، يختار تاسكًا جاهزًا له مصدر ومعايير قبول، يطلب من Codex أو Claude تنفيذ هذا التاسك فقط، يسجل استخدام AI والملفات المتغيرة، يشغل الفحوصات، يطلب مراجعة، ثم يتحقق المالك أو يرفض. Kabeeri لم يستبدل أداة AI؛ هو جعل جلسة AI مركزة وقابلة للقياس وآمنة للقبول.",
        mistakes: ["اعتبار Kabeeri نموذج AI يكتب الكود. هو طبقة إدارة وحوكمة حول أدوات AI coding.", "استخدام تاريخ الشات كذاكرة المشروع الوحيدة.", "بدء العمل بلا مصدر تاسك ومعايير قبول.", "ترك أكثر من وكيل AI يعدل ملفات متداخلة بلا لوكس.", "تجاهل تكلفة التوكنز حتى النهاية.", "النشر لأن الكود يعمل محليًا دون تحقق مالك وفحوصات إصدار."]
      },
      "start-here": {
        lead: "ابدأ من هنا عندما تريد استخدام Kabeeri-vdf كنظام تشغيل منظم ودقيق لتطوير البرمجيات بالذكاء الاصطناعي، وليس كمجموعة برومبتات عشوائية. هذه الصفحة تشرح كيف تدخل النظام، تفهم إمكانياته، تستخدم Vibe-first، وتنتقل من مجلد المشروع إلى تسليم محكوم.",
        beginner: "أبسط تصور هو: تفتح مجلد Kabeeri، تجعل النظام يفحص حالته، تجيب عن الأسئلة التي تفهم المشروع، تتحول الإجابات إلى تاسكات وسجل واضح، تنفذ التاسكات بأدوات AI coding، تراقب الداشبورد، تتابع تكلفة توكنات الذكاء الاصطناعي، ولا تعتبر العمل منتهيًا إلا بعد المراجعة وتحقق المالك. الـ CLI يعمل تحت هذا المسار كمحرك، بينما Vibe-first يجعل التجربة طبيعية للمستخدم.",
        sections: [
          ["افتح مجلد Kabeeri", "ابدأ من الريبو أو مجلد المشروع المولد. المجلد ليس كود فقط؛ يحتوي `.kabeeri/` والدوكس والـ generators والـ prompt packs والأسئلة وسجلات التاسكات والداشبورد وقواعد الحوكمة."],
          ["تحقق قبل أي تنفيذ", "شغل أوامر validation أو doctor قبل العمل المهم. التحقق يراجع ملفات النظام، JSON/JSONL، prompt packs، generators، حوكمة التاسكات، قواعد المالك، اللوكس، التوكنز، وصحة مساحة العمل."],
          ["استخدم Vibe-first كبوابة دخول", "صف ما تريده بلغة طبيعية. Kabeeri يصنف النية، يكتشف الغموض، يقترح كروت تاسكات، وبعد المراجعة فقط يتحرك العمل نحو التنفيذ."],
          ["افهم أن CLI هو المحرك", "أمر `kvdf` يشغل المسار تحت السطح: init، create، validate، questionnaire flow، دورة حياة التاسك، تصدير الداشبورد، GitHub sync، استخدام AI، التوكنز، اللوكس، تحقق المالك، وفحوصات الإصدار."],
          ["ولد الأسئلة وأجب عليها", "استخدم الأسئلة التكيفية لفهم المشروع دون سؤال كل شيء مرة واحدة. الإجابات تفعل system areas، تنتج coverage reports، تظهر missing answers، وتولد تاسكات لها provenance."],
          ["حوّل الإجابات إلى تاسكات محكومة", "التاسك ليس ملاحظة عابرة. يحتاج مصدرًا، نطاقًا، workstream، معايير قبول، منفذًا، ملفات مسموحة، مسار مراجعة، توقع تكلفة، وسجل تدقيق."],
          ["راقب الداشبورد", "استخدم الداشبورد لرؤية التقدم التقني، الجاهزية التجارية، حالة الميزات، رحلات المستخدم، اللوكس، الإسنادات، تكلفة AI، حالة الاسبرنت، وجاهزية النشر."],
          ["أدر ملفات الباك إند والفرونت إند", "Kabeeri يفهم workstreams مثل backend وpublic frontend وadmin frontend وdatabase وintegrations وtesting وdocs وsecurity وdesign وrelease، ويستخدم الملكية واللوكس لمنع التضارب."],
          ["ابنِ واجهات المشروع", "عمل الواجهة يبدأ من مواصفات تصميم نصية معتمدة، Page Specs، Component Contracts، design tokens، حالات responsive، ملاحظات accessibility، احتياجات البيانات، ومعايير قبول بصرية."],
          ["ابنِ الباك إند", "عمل الباك إند يبدأ من أسئلة القدرات، احتياجات البيانات، عقود API، قواعد auth والصلاحيات، نماذج قاعدة البيانات، validation، services، error handling، الاختبارات، وتسليم الإصدار."],
          ["راقب توكنات AI والتكلفة", "استخدام AI يجب أن يرتبط بتاسكات، مطورين أو وكلاء AI، providers، models، workstreams، مخرجات مقبولة، rework، exploration، واستخدام غير متتبع."],
          ["أدر GitHub بأمان", "يمكن مزامنة GitHub issues وlabels وmilestones وreleases، لكن `.kabeeri/` يبقى مصدر الحقيقة. dry-run هو الوضع الآمن، والكتابة تحتاج confirmation واضح."],
          ["أدر فريق المشروع", "البشر ووكلاء AI لهم هويات، أدوار، workstreams، access tokens، locks، budgets، وأحداث audit. التحقق النهائي يخص المالك النشط فقط."],
          ["اختر Structured أو Agile", "Structured Delivery يعطي مسارًا تسلسليًا تقوده الوثائق. Agile Delivery يعطي backlog وepics وstories وsprints ومراجعات وتحليل تكلفة الاسبرنت. Vibe-first يمكن أن يكون الطبقة البشرية فوق أي منهما."]
        ],
        pipeline: ["فتح المجلد", "التحقق", "نية Vibe-first", "الأسئلة", "التاسكات", "AI coding", "الداشبورد", "تحقق المالك"],
        details: [
          ["الخطوة 1: ادخل من المجلد", ["افتح ريبو Kabeeri أو المشروع المولد في VS Code أو محرر مشابه. لا تبدأ بسؤال AI أن يغير الكود مباشرة. أولًا افهم مساحة العمل.", "ابحث عن `.kabeeri/` كمصدر الحقيقة المحلي، ثم راجع الدوكس وحالة التاسكات والداشبورد ونمط التسليم النشط."]],
          ["الخطوة 2: اجعل validation يبني الثقة", ["شغل `node bin/kvdf.js validate` أو `kvdf validate` للتأكد من ملفات النظام، حالة JSON، prompt packs، generators، قواعد التاسكات، حالة المالك، اللوكس، التوكنز، وملفات audit.", "إذا فشل التحقق، أصلح مصدر الحالة قبل التنفيذ. مصدر حقيقة مكسور يعني أن الداشبورد وGitHub sync وعمل AI قد يضللونك."]],
          ["الخطوة 3: استخدم Vibe-first دون فقدان الحوكمة", ["Vibe-first يسمح للمستخدم أن يقول: أريد إضافة المدفوعات، تحسين onboarding، أو إصلاح أداء الداشبورد. Kabeeri يصنف النية ويحولها إلى اقتراحات قابلة للمراجعة.", "المهم أن اللغة الطبيعية ليست موافقة تلقائية. كروت التاسكات المقترحة يجب مراجعتها وتحديد نطاقها وربطها بمصدر قبل التنفيذ."]],
          ["الخطوة 4: اعرف أن CLI هو المحرك", ["الـ CLI ليس تجربة المنتج كلها، لكنه طبقة التنفيذ الموثوقة تحت الشات والكروت وأزرار الداشبورد ومهام VS Code والأتمتة.", "أمثلة: `kvdf questionnaire flow`، `kvdf task create`، `kvdf task start`، `kvdf dashboard export`، `kvdf usage summary`، `kvdf github issue sync --dry-run`، و`kvdf task verify`."]],
          ["الخطوة 5: استخدم الأسئلة لبناء ذكاء المشروع", ["محرك الأسئلة التكيفي يبدأ بأسئلة دخول، يكتشف نوع المشروع، يفعل system areas المناسبة، يسأل أعمق عند الحاجة فقط، ثم ينشئ coverage وmissing-answer reports.", "خريطة القدرات تغطي المنتج، المستخدمين، الواجهة، الباك إند، قاعدة البيانات، auth، الإدارة، الإشعارات، المدفوعات، SEO، accessibility، الأداء، الاختبارات، النشر، المراقبة، الدعم، القانون، ميزات AI، حوكمة البيانات، وتحكم Kabeeri."]],
          ["الخطوة 6: حوّل الوضوح إلى تاسكات", ["عندما تصبح الإجابات جاهزة، يستطيع Kabeeri توليد تاسكات مقترحة لها provenance يرجع إلى system areas وquestion IDs وanswer IDs وsource mode.", "قبل بدء العمل، يحتاج كل تاسك readiness: نطاق، معايير قبول، workstream، assignee، reviewer، ملفات مسموحة أو ممنوعة، ميزانية توكنز، والدليل المتوقع."]],
          ["الخطوة 7: خطط الواجهة قبل التنفيذ", ["لا تطلب من AI بناء واجهة مباشرة من screenshot أو PDF أو Figma link أو موقع مرجعي. Kabeeri يشترط تحويل مصادر التصميم إلى مواصفات نصية معتمدة أولًا.", "أنشئ أو راجع Page Spec لكل صفحة حقيقية: الغرض، الجمهور، التخطيط، احتياجات البيانات، حالات loading/empty/error/success، responsive، RTL/LTR، accessibility، ومعايير القبول. المكونات المتكررة تحتاج Component Contracts فيها variants وprops وstates وdesign tokens وممنوعات ومراجعة."]],
          ["الخطوة 8: نفذ تاسكات الواجهة بأمان", ["اختر prompt pack المناسب للواجهة: React أو Vue أو Angular لواجهات SPA، وNext.js أو Nuxt أو SvelteKit أو Astro عندما تكون قواعد routing/rendering مهمة.", "حوّل كل صفحة أو مكون إلى تاسك محدد. يجب أن يذكر التاسك page spec وcomponent contract والملفات المسموحة ومصدر البيانات وحالات responsive وفحوصات accessibility ودليل القبول البصري. AI ينفذ تاسك UI واحدًا في كل مرة، ثم تثبت اللقطات أو الملاحظات البصرية القبول."]],
          ["الخطوة 9: خطط الباك إند قبل التنفيذ", ["عمل الباك إند يبدأ من تغطية قدرات النظام: users وauth وpermissions وdatabase وAPIs وintegrations وpayments وnotifications وfiles وaudit logs وsecurity وperformance وmonitoring وdeployment.", "قبل الكود، عرّف data models وAPI contracts وvalidation rules وسلوك auth/authorization وحدود services وerror handling وlogging والاختبارات وتأثير migrations ومخاطر الإصدار. تاسك الباك إند ليس جاهزًا إذا كان شكل API أو البيانات مجهولًا."]],
          ["الخطوة 10: نفذ تاسكات الباك إند بأمان", ["اختر prompt pack المناسب للباك إند: Express.js أو FastAPI أو Django أو Laravel أو Rails أو Spring Boot أو NestJS أو Symfony أو Go Gin أو .NET أو Supabase أو Firebase أو أي stack مدعوم.", "استخدم برومبت واحد لتاسك باك إند صغير: route أو controller أو service أو model أو migration أو validation rule أو integration أو job أو tests. راجع الناتج، شغل الفحوصات، سجل الملفات المتغيرة، سجل استخدام AI، واربط النتيجة بمعايير القبول قبل الانتقال."]],
          ["الخطوة 11: نفذ بأدوات AI coding", ["استخدم Codex أو Claude أو Cursor أو Windsurf أو GitHub Copilot أو أي أداة AI لتنفيذ تاسك واحد محدد في كل مرة. Kabeeri يوفر السياق، prompt packs، القيود، وتوقعات القبول.", "لإلمام ملفات الباك إند والفرونت إند، اختر workstream وprompt pack صحيحين. تاسك backend وتاسك public frontend وتاسك admin frontend وتاسك database وتاسك integration لا يجب خلطهم بصمت."]],
          ["الخطوة 12: راقب المشروع كمنتج محترف", ["الداشبورد التقني يعرض التاسكات، الفحوصات، تقدم backend/frontend/admin/database/docs/testing، اللوكس، الإسنادات، GitHub sync، نشاط الوكلاء، والتكلفة حتى الآن.", "الداشبورد التجاري يترجم ذلك إلى جاهزية الميزات، رحلات المستخدم، الجمهور المستهدف، جاهزية الديمو، جاهزية النشر، الميزات المؤجلة، وقيمة الإصدار."]],
          ["الخطوة 13: تحكم في تكلفة AI", ["استخدم low-cost mode وcontext packs وmodel routing وpricing rules وbudget approvals لتجنب البرومبتات العشوائية المكلفة.", "سجلات الاستخدام يجب أن تفرق بين المخرجات المقبولة، المرفوضة، إعادة العمل، الاستكشاف، الاستخدام غير المتتبع، الحالات العاجلة، إجماليات الاسبرنت، وإجماليات workstream."]],
          ["الخطوة 14: نسق GitHub والفريق بأمان", ["GitHub sync يربط تاسكات Kabeeri بـ issues وmilestones وlabels وreleases، لكن الكتابة تبدأ dry-run وتحتاج confirmation.", "في الفرق، كل مطور بشري أو وكيل AI يجب أن يكون له identity وrole وworkstreams وaccess token وlocks وaudit trail. Owner-only verification يمنع القبول النهائي بالخطأ."]],
          ["الخطوة 15: اختر نمط التسليم بوعي", ["استخدم Structured عندما تحتاج تخطيطًا عميقًا، وثائق كاملة، نطاقًا ثابتًا، تسليم عميل، عملًا منظمًا، أو معماريات معقدة.", "استخدم Agile عندما تحتاج سرعة تعلم، backlog، stories، sprints، feedback، demos، وتحليل تكلفة الاسبرنت. Vibe-first يمكن أن يكون الطبقة السهلة فوق الاثنين."]],
          ["الخطوة 16: اعرف متى تنتهي", ["أنت لا تنتهي عندما ينتج AI كودًا. تنتهي عندما تنجح الفحوصات أو تقبل المخاطر، يسجل الدليل، يراجع المراجع، يتحقق المالك، تعالج التوكنز واللوكس، ويكون قرار الإصدار واضحًا.", "المشروع قد يكون جاهزًا للإنتاج دون أن يكون منشورًا. Kabeeri يبقي هذا الفرق ظاهرًا."]]
        ],
        checklist: ["المستخدم فهم أن Kabeeri نظام محترف لإدارة التطوير بالذكاء الاصطناعي وليس مكتبة برومبتات عشوائية.", "المستخدم فهم أن `.kabeeri/` هو مصدر الحقيقة.", "المستخدم يعرف أنه يجب التحقق من المجلد قبل العمل.", "المستخدم فهم Vibe-first وأن CLI يعمل تحته كمحرك.", "المستخدم يعرف كيف تتحول الأسئلة إلى coverage وmissing-answer reports وتاسكات وprovenance.", "المستخدم يفهم workstreams مثل backend وfrontend وadmin وdatabase وtesting وdocs وsecurity وintegration.", "المستخدم يعرف أن الواجهة تحتاج design text spec معتمد وpage specs وcomponent contracts وحالات وaccessibility وقبول بصري.", "المستخدم يعرف أن الباك إند يحتاج data models وAPI contracts وvalidation وauth وpermissions وservices وtests وفحوصات إصدار.", "المستخدم يعرف أن الداشبورد يعرض الحالة التقنية والتجارية وتكلفة AI.", "المستخدم يفهم توكنات AI والميزانيات والاستخدام غير المتتبع.", "المستخدم يفهم أن GitHub sync آمن ويحتاج confirmation.", "المستخدم يفهم حوكمة الفريق ووكلاء AI: identities وroles وtokens وlocks وbudgets وaudit وOwner verify.", "المستخدم يستطيع اختيار Structured أو Agile دون تخمين.", "المستخدم يعرف أن نهاية المسار هي التحقق وقرار release أو publish."],
        example: "مطور يفتح مشروع SaaS مدار بـ Kabeeri داخل VS Code. يشغل validation، يرى أن أسئلة payments وonboarding ناقصة، يجيب عن الأسئلة المناسبة، يولد تاسكات مقترحة، يراجع كروت التاسكات، يختار Agile sprint، ويقسم العمل صح. تاسك الواجهة يرجع إلى onboarding page spec معتمد وcomponent contracts وحالات responsive وقبول بصري. تاسك الباك إند يرجع إلى payment API contracts وتغييرات database وقواعد validation وauthorization واختبارات ومخاطر إصدار. يصدر tokens وlocks محددة، يشغل AI coding عبر Codex أو Claude، يسجل الاستخدام، يراقب الداشبورد، يزامن GitHub issues عبر dry-run أولًا، يراجع الدليل، ثم يتحقق المالك أو يرفض. هكذا يحول Kabeeri الـ vibe coding إلى مسار منتج احترافي مضبوط.",
        mistakes: ["بدء AI coding قبل التحقق من مجلد Kabeeri.", "استخدام Vibe-first كإذن تنفيذ صامت بدل كروت تاسكات مقترحة.", "اعتبار CLI سحرًا اختياريًا بدل المحرك الذي ينفذ تغييرات الحالة.", "الإجابة على الأسئلة دون تحويلها إلى تاسكات قابلة للتتبع.", "خلط تغييرات backend وfrontend وadmin وdatabase داخل تاسك غامض واحد.", "تجاهل ميزانية توكنات AI والاستخدام غير المتتبع.", "ترك GitHub يصبح مصدر الحقيقة بدل `.kabeeri/`.", "ترك وكلاء AI يعملون بلا identity أو assignment أو tokens أو locks.", "اختيار Structured أو Agile عشوائيًا دون ملاءمة نوع المشروع.", "اعتبار العمل منتهيًا قبل المراجعة وتحقق المالك وقرار الإصدار."],
        command: "node bin/kvdf.js validate\nnode bin/kvdf.js doctor\nnode bin/kvdf.js questionnaire flow\nnode bin/kvdf.js questionnaire coverage\nnode bin/kvdf.js questionnaire generate-tasks\nnode bin/kvdf.js task list\nnode bin/kvdf.js dashboard export\nnode bin/kvdf.js usage summary\nnode bin/kvdf.js github issue sync --dry-run"
      },
      "new-project": {
        lead: "المشروع الجديد يبدأ من النية ثم يتحول إلى ملفات وأسئلة وتاسكات ومعايير قبول وعمل محكوم.",
        beginner: "في المشروع الجديد لا تبدأ بالكود مباشرة. سجل الهدف والجمهور ونمط التسليم والمالك حتى تكون التاسكات لها مصدر واضح.",
        sections: [["الاستقبال", "سجل هدف المنتج والجمهور ونمط التسليم والمالك والتقنيات وتوقعات الإصدار."], ["الأسئلة", "استخدم الأسئلة التكيفية لتفعيل مناطق النظام المناسبة فقط."], ["المخرجات", "أنشئ الوثائق والتاسكات المقترحة وحزم البرومبت وقوائم القبول وحالة الداشبورد."]],
        details: [["خطوات البداية", ["اكتب أبسط جملة للمنتج: يخدم من، يحل أي مشكلة، وما شكل النجاح.", "اختر المالك ونمط التسليم، ثم أجب فقط عن الأسئلة التي تؤثر على أول إصدار."]], ["من الإجابة إلى التاسك", ["كل إجابة مهمة تتحول إلى وثيقة أو قرار أو تاسك أو عنصر مؤجل.", "كل تاسك مولد يحتاج مصدرًا واضحًا حتى لا يضيع سبب وجوده لاحقًا."]], ["شكل الجاهزية", ["المشروع جاهز للتنفيذ عندما يوجد نطاق أول واضح، ومعايير قبول كافية، ومخاطر معروفة، ولا يوجد قرار مالك ناقص يمنع أول تاسك."]]],
        checklist: ["الهدف مكتوب بلغة بسيطة.", "الجمهور معروف.", "المالك محدد.", "نمط التسليم محدد.", "حدود أول إصدار واضحة.", "الأسئلة أجيبت أو أُجلت بسبب واضح."],
        example: "في MVP متجر إلكتروني، يسجل Kabeeri نوع العملاء، الكتالوج، الدفع، لوحة الإدارة، مخاطر الدفع، وتعريف أول إصدار قبل الكود.",
        mistakes: ["تاسكات مثل: ابن الصفحة أو أضف الميزة فقط.", "سؤال كل شيء قبل أول محطة مفيدة.", "اعتماد الدوكس المولدة دون مراجعة المالك."]
      },
      "existing-project": {
        lead: "المشاريع القائمة يجب اعتمادها بأمان دون مسح أو إعادة كتابة العمل المفيد.",
        beginner: "في مشروع قائم، Kabeeri يراقب ويربط الموجود بدلًا من مسح العمل أو فرض هيكل جديد فجأة.",
        sections: [["الفحص", "افحص هيكل الريبو والوثائق والتاسكات والاختبارات والحالة الحالية."], ["الربط", "اربط المجلدات والقرارات الموجودة بمفاهيم Kabeeri دون فرض إعادة بناء."], ["الاعتماد", "أضف `.kabeeri/` والملاحظات والمصدر وقواعد الحوكمة تدريجيًا."]],
        details: [["تسلسل آمن", ["ابدأ قراءة فقط: الملفات، السكربتات، الدوكس، التاسكات، وملاحظات الإصدار.", "اكتب ملاحظات اعتماد قبل تغيير الهيكل. أول تاسك يكون اعتماد المشروع نفسه."]], ["ربط الموجود", ["README يصبح سياق مشروع. Issues تصبح مصادر تاسكات. الاختبارات تصبح دليل تحقق.", "لو القرار بلا مصدر، سجله كغير معروف بدل اختراع تاريخ."]], ["متى تتوقف", ["توقف عندما يستطيع Kabeeri التحقق من الحالة الأساسية وعرض داشبورد مفيد وتتبع التاسكات القادمة. التنظيف العميق يصبح تاسكات لاحقة."]]],
        checklist: ["الريبو مفحوص.", "السكربتات الحالية معروفة.", "الدوكس القديمة مربوطة.", "التاسكات الحالية مستوردة أو مشار إليها.", "القرارات المجهولة مسجلة.", "لا يوجد عمل مفيد تم مسحه."],
        example: "تطبيق React قائم لديه صفحات واختبارات. Kabeeri يوثق الميزات الحالية، يربط الاختبارات، وينشئ باكلوج للحوكمة الناقصة.",
        mistakes: ["إعادة تسمية مجلدات أثناء الاعتماد بلا تاسك.", "حذف دوكس قديمة لأنها غير منظمة.", "اعتبار القرارات المجهولة معتمدة."]
      },
      "structured-delivery": {
        lead: "Structured Delivery مسار تسلسلي من الفكرة إلى الوثائق والتاسكات والقبول والإصدار.",
        beginner: "استخدم Structured Delivery عندما تريد مسارًا هادئًا خطوة بخطوة، خصوصًا مع العملاء والوثائق وبوابات القبول.",
        sections: [["مناسب لـ", "الأعمال واضحة النطاق، تسليم العملاء، المشاريع التي تبدأ بالوثائق، وتجهيز الإصدار."], ["التسلسل", "أسئلة، وثائق، تعريف تاسكات، قوائم قبول، تنفيذ، مراجعة، تحقق."], ["قاعدة", "لا تنشئ تاسك بدون مصدر ومعايير قبول."]],
        details: [["التسلسل الكامل", ["الاستقبال يحدد النطاق. الأسئلة توضح المجهول. الدوكس تلخص القرارات. التاسكات تجعل العمل قابلًا للتنفيذ. المراجعة تجمع الأدلة. تحقق المالك يغلق البوابة.", "كل خطوة يجب أن تنتج شيئًا مرئيًا حتى لو كان قصيرًا."]], ["متى نشدد الحوكمة", ["مع العميل، العمل المدفوع، الواجهات الثقيلة، العمل المنظم، أو تشغيل AI مكلف.", "التجارب الداخلية يمكنها تخفيف الحقول مع الحفاظ على المصدر والقبول."]], ["كيف تكمل", ["اكمل من أول بوابة ناقصة. لو التاسكات موجودة والدوكس قديمة، حدّث مصدر القرار قبل تنفيذ المزيد."]]],
        checklist: ["الاستقبال مكتمل.", "الأسئلة المهمة مجابة.", "الدوكس مراجعة.", "التاسكات بها قبول.", "الدليل مرفق قبل التحقق.", "المالك يغلق القبول النهائي."],
        example: "مشروع داشبورد عميل يمر بالمتطلبات، Page Specs، تاسكات، دليل تنفيذ، مراجعة العميل، تحقق المالك، ثم جاهزية الإنتاج.",
        mistakes: ["تخطي الدوكس لأن التاسك واضح.", "تغيير النطاق أثناء التنفيذ دون تسجيل القرار.", "إعلان الانتهاء دون دليل قبول."]
      },
      "agile-delivery": {
        lead: "Agile Delivery ينظم العمل عبر الباكلوج والإبيكس والستوريز والاسبرنت وتكلفة AI.",
        beginner: "استخدم Agile Delivery عندما يتغير العمل كثيرًا. الباكلوج والستوريز والاسبرنت تساعدك على تقسيم العمل ومراجعة التكلفة.",
        sections: [["الباكلوج", "الأفكار والمتطلبات تتحول إلى إبيكس وستوريز بمصادر واضحة."], ["الاسبرنت", "التخطيط يشمل النطاق والمالك ومسارات العمل والقبول وتقدير تكلفة AI."], ["المراجعة", "مراجعة الاسبرنت تشمل المقبول وإعادة العمل والتكلفة والمخاطر والأولويات التالية."]],
        details: [["نظافة الباكلوج", ["كل عنصر يحتاج مصدرًا وقيمة تقريبية وتوقع مالك ولمحة قبول.", "الأفكار قد تبقى عامة في الباكلوج، لكن الستوري الجاهزة للاسبرنت يجب أن تكون قابلة للاختبار."]], ["تخطيط الاسبرنت", ["اختر الستوريز حسب السعة والاعتمادية والمخاطر والتكلفة.", "التاسكات المكلفة بالـ AI تحتاج تقديرًا مسبقًا قبل بداية الاسبرنت."]], ["مراجعة الاسبرنت", ["راجع المقبول والمرفوض وإعادة العمل وفارق التكلفة والمخاطر وما ينتقل للاسبرنت التالي.", "العمل المقبول يجب أن يرتبط بدليل وليس تحديثًا شفهيًا فقط."]]],
        checklist: ["الباكلوج له مصادر.", "الستوريز لها معايير قبول.", "نطاق الاسبرنت واضح.", "ميزانية AI مقدرة.", "المراجعة تسجل المقبول والمرفوض."],
        example: "اسبرنت أسبوعين يشمل تسجيل الدخول والبروفايل وفلاتر الداشبورد. المراجعة تقبل تسجيل الدخول، تعيد البروفايل، وتوضح أن الفلاتر تجاوزت تقدير AI.",
        mistakes: ["إدخال أفكار غامضة مباشرة للاسبرنت.", "تجاهل تكلفة AI حتى نهاية الاسبرنت.", "إغلاق الستوريز بلا دليل."]
      },
      "questionnaire-engine": {
        lead: "محرك الأسئلة التكيفي يسأل أقل أولًا ثم يتوسع فقط عند الحاجة.",
        beginner: "محرك الأسئلة ليس فورمًا طويلًا لكل شيء. يسأل القدر الكافي ثم يتوسع فقط عند وجود خطر أو نقص.",
        sections: [["التفعيل", "الإجابات تفعل مناطق مطلوبة أو اختيارية أو مؤجلة أو غير منطبقة أو تحتاج متابعة."], ["التغطية", "تقارير التغطية تمنع نسيان المنتج والمستخدمين والواجهات والباكند والأمان والتشغيل."], ["المخرجات", "الإجابات تتحول إلى وثائق وتاسكات ومعايير قبول وذاكرة وتقارير نقص."]],
        details: [["كيف تغير الإجابات المسار", ["إجابة نعم قد تفتح أسئلة جديدة. غير منطبق يغلق فرعًا. غير معروف ينشئ متابعة بدل تعطيل كل شيء.", "الهدف تغطية مفيدة، وليس أكبر عدد أسئلة."]], ["جودة السؤال", ["السؤال الجيد واضح وقابل للإجابة ومربوط بقرار.", "لو الإجابة تؤثر على النطاق أو الأمان أو التكلفة أو الملكية أو الإصدار، تستحق التتبع."]], ["التعامل مع الناقص", ["سجل الإجابة الناقصة كمؤجلة أو محجوبة أو غير معروفة أو غير منطبقة.", "حدد هل تمنع التاسك الحالي أو تخص إصدارًا لاحقًا."]]],
        checklist: ["الأسئلة ذات صلة.", "المجهول متتبع.", "التأجيل له سبب.", "تقرير التغطية مراجع.", "الإجابات المهمة تنتج دوكس أو تاسكات."],
        example: "لو المستخدم يحتاج مدفوعات، يسأل Kabeeri عن المزود والعملة والاسترداد والاختبار والأمان وبوابة الإصدار. لو لا يحتاجها، يغلق الفرع.",
        mistakes: ["سؤال كل شيء مقدمًا.", "اعتبار غير معروف بمعنى لا.", "ترك الإجابات الناقصة غير مرئية."]
      },
      "task-governance": {
        lead: "حوكمة التاسكات تجعل كل تاسك مرتبطًا بمصدر ونطاق ومعايير قبول.",
        beginner: "التاسك المحكوم ليس مجرد مهمة. له مصدر ونطاق وقواعد مالك ومعايير قبول ودليل على الإنجاز.",
        sections: [["المطلوب", "مصدر، عنوان، حالة، مسار عمل، منفذ عند التنفيذ، ملفات مسموحة، ومعايير قبول."], ["المصدر", "التاسكات قد تأتي من الأسئلة أو الوثائق أو GitHub أو قصص المستخدم أو اقتراح AI أو التقاط العمل."], ["الأمان", "تاسكات الدمج يجب أن تذكر كل مسارات العمل المتأثرة."]],
        details: [["تشريح التاسك الجيد", ["يقول ماذا يتغير، لماذا يوجد، ما المناطق المسموحة، ما معنى الانتهاء، وكيف يتحقق.", "لو يستخدم AI، يسجل التقدير والاستهلاك الفعلي."]], ["مصادر التاسكات", ["الإجابات، الدوكس، الأخطاء، طلبات المالك، ملاحظات العميل، الستوريز، التدقيق، والتقاط ما بعد العمل.", "اقتراح AI يظل اقتراحًا حتى يعتمده إنسان أو مسار موافقة."]], ["الاستكمال أو التقسيم", ["استكمل التاسك لو الهدف لم يتغير والنطاق ما زال صحيحًا.", "قسّمه عند ظهور مسارات عمل أو مخاطر أو قبول غير واضح."]]],
        checklist: ["المصدر موجود.", "النطاق واضح.", "الملفات أو المناطق المسموحة معروفة.", "معايير القبول قابلة للاختبار.", "الدليل سيُرفق.", "تأثيرات الدمج مذكورة."],
        example: "سيئ: حسن الداشبورد. جيد: أضف فلاتر حالة التاسكات من story AG-12، في ملفات الداشبورد فقط، ويقبل عند حفظ الفلاتر ونجاح الاختبارات.",
        mistakes: ["تاسكات بلا مصدر.", "تاسك واحد لميزات غير مترابطة.", "إغلاق تاسك بلا دليل."]
      },
      "dashboard-monitoring": {
        lead: "الداشبورد يعرض حالة `.kabeeri/` ولا يصبح مصدر حقيقة منفصلًا.",
        beginner: "الداشبورد نافذة على حالة المشروع. لو ظهر شيء خطأ، أصلح بيانات `.kabeeri/` أو سجل التاسك، لا تعتبر الداشبورد قاعدة بيانات منفصلة.",
        sections: [["تقني", "يعرض التاسكات واللوكس والفحوصات وجلسات AI وجاهزية التنفيذ."], ["تجاري", "يعرض جاهزية الميزات والرحلات والعرض والنشر."], ["التكلفة", "يعرض التوكنز حسب التاسك والاسبرنت والموديل ومسار العمل والمقبول وإعادة العمل."]],
        details: [["ما تتابعه يوميًا", ["التاسكات المفتوحة، المحجوبة، الفحوصات الفاشلة، اللوكس، الإجابات الناقصة، تكلفة AI، وطابور تحقق المالك.", "في الفرق النشطة راقب تضارب مسارات العمل والتاسكات المنتظرة للمراجعة."]], ["تفسير الحالة", ["الأخضر يعني أن الدليل يدعم التقدم. الأصفر يعني خطرًا أو نقص بيانات. الأحمر يعني حجبًا أو خطأ أو تجاوز ميزانية أو عدم أمان.", "أي رقم بلا مصدر يجب أن يفتح تحقيقًا لا ثقة عمياء."]], ["عرض تجاري وتقني", ["العرض التجاري يشرح الجاهزية بلغة المنتج. التقني يشرح صحة التنفيذ والتحقق.", "كلاهما يجب أن يرجع لنفس التاسكات وملفات الحالة."]]],
        checklist: ["العمل المحجوب ظاهر.", "طابور تحقق المالك ظاهر.", "تكلفة AI ظاهرة.", "اللوكس ظاهرة.", "حالة الإصدار ظاهرة.", "بيانات الداشبورد لها مصدر."],
        example: "الداشبورد يعرض جاهزية 80% لكن تاسك أمان أحمر. العرض التجاري يجب أن يقول غير جاهز للنشر حتى يغلق التاسك.",
        mistakes: ["إصلاح شكل الداشبورد بدل إصلاح المصدر.", "إخفاء التاسكات المحجوبة عن العرض التجاري.", "تجاهل استخدام AI غير المتتبع."]
      },
      "owner-verify": {
        lead: "تحقق المالك هو بوابة القبول النهائية. المراجع يوصي فقط، والمالك يغلق نهائيًا.",
        beginner: "تحقق المالك يعني أن الشخص المسؤول قبل العمل فعليًا. المراجعات والاختبارات تساعد، لكن القرار النهائي محمي.",
        sections: [["قبل التحقق", "يجب وجود دليل قبول وفحوصات ومخاطر وملفات متغيرة وتكلفة AI عند استخدامها."], ["بعد التحقق", "تسحب التوكنز أو تؤرشف، وتغلق اللوكس، وتكتب أحداث التدقيق."], ["الرفض", "رفض المالك يحتاج سببًا وقد يصدر توكن إعادة عمل أضيق."]],
        details: [["ماذا يراجع المالك", ["هل النتيجة المطلوبة تحققت؟ هل الدليل كاف؟ هل المخاطر مقبولة؟ هل العمل يمكن أن يتحرك للمرحلة التالية؟", "لا يحتاج لفحص كل سطر كود، لكنه يحتاج دليلًا مرتبطًا بمعايير القبول."]], ["نتائج القرار", ["مقبول يعني إغلاق التاسك. مرفوض يعني تغييرات مطلوبة. مؤجل يعني غير مقبول الآن وقد يعاد النظر لاحقًا.", "كل نتيجة يجب أن تكتب حدث تدقيق."]], ["مسار إعادة العمل", ["الرفض يتحول لتاسك أضيق أو تحديث واضح لنفس التاسك مع السبب.", "لا تعيد فتح النطاق كله لو فشل بند قبول واحد."]]],
        checklist: ["دليل القبول موجود.", "الفحوصات شغلت أو تم تخطيها بسبب واضح.", "المخاطر مكتوبة.", "استخدام AI مسجل عند الحاجة.", "قرار المالك مسجل.", "اللوكس والتوكنز عولجت بعد القرار."],
        example: "المراجع يقول الميزة تعمل، لكن المالك يرفض لأن لقطة الموبايل تفشل معيار القبول البصري. ينشأ تاسك إعادة عمل للموبايل فقط.",
        mistakes: ["منفذ العمل يصدق على نفسه نهائيًا.", "رفض بلا سبب.", "ترك توكنز التاسك فعالة بعد القبول."]
      },
      "ai-cost-control": {
        lead: "التحكم في تكلفة AI يجعل الاستهلاك مرئيًا ويقدر التكلفة قبل العمل المكلف.",
        beginner: "التحكم في تكلفة AI يمنع المفاجآت. يشجع سياقًا أصغر، مسارات أرخص، وتتبعًا واضحًا للاستكشاف وإعادة العمل.",
        sections: [["النمط قليل التكلفة", "استخدم القوالب وحزم السياق الصغيرة والموديلات الأرخص والتاسكات الصغيرة."], ["الفحص المسبق", "قدر التوكنز والموديل والميزانية والموافقة قبل تشغيل AI مكلف."], ["الاستخدام غير المتتبع", "يصنف كاستكشاف أو تعلم أو هدر أو إعادة عمل أو عمل غير ملتقط."]],
        details: [["قبل العمل", ["قدر تعقيد التاسك، حجم السياق، فئة الموديل، حجم الخرج، وعدد دورات المراجعة.", "لو التاسك استكشافي، ضع ميزانية صغيرة وحدد ما الذي يبرر الاستمرار."]], ["أثناء العمل", ["تتبع الجلسات حسب التاسك والموديل وحزمة البرومبت والتوكنز والمخرجات المقبولة وإعادة العمل.", "لو الموديل يكرر أو يخرج عن المسار، أوقفه وضيّق السياق."]], ["بعد العمل", ["قارن التقدير بالاستهلاك. صنف الاستكشاف المفيد والهدر والعمل المقبول وإعادة العمل.", "استخدم المراجعة لتحسين تقدير التاسكات القادمة."]]],
        checklist: ["للتاسك توقع ميزانية AI.", "التشغيل المكلف له موافقة عند الحاجة.", "الاستخدام مربوط بتاسك أو استكشاف.", "إعادة العمل منفصلة عن المقبول.", "الاستخدام غير المتتبع مصنف."],
        example: "تاسك مراجعة تصميم يستخدم موديلًا مكلفًا فقط بعد مرور منخفض التكلفة يحضر حزمة سياق مركزة. الداشبورد يسجل الجلستين وما تم قبوله.",
        mistakes: ["إرسال الريبو كله لتاسك صغير.", "استخدام AI مكلف قبل تعريف القبول.", "اعتبار كل استكشاف عملًا منتجًا."]
      },
      "multi-ai-governance": {
        lead: "حوكمة Multi-AI تسمح لأكثر من إنسان أو وكيل AI بالعمل دون تضارب.",
        beginner: "عند عمل أكثر من إنسان أو وكيل AI، يمنع Kabeeri التداخل بالهويات والإسناد والتوكنز واللوكس.",
        sections: [["الهوية", "كل مطور أو وكيل له هوية ودور ومسار عمل وحالة."], ["الوصول", "توكن التاسك يعطي صلاحية محددة ويختلف عن توكنز تكلفة AI."], ["اللوكس", "لوكس الملفات والمجلدات والتاسكات ومسارات العمل تمنع التضارب."]],
        details: [["لماذا الهوية مهمة", ["لو وكيلان يغيران نفس المنطقة، يجب معرفة من يملك أي تاسك ولماذا.", "الهوية تساعد في تدقيق الأخطاء والتكلفة والرفض والموافقات."]], ["الوصول المحدد", ["الوصول يمنح لكل تاسك أو مسار عمل أو منطقة ملفات، وينتهي أو يسحب بعد الإنجاز.", "توكنز AI تتبع التكلفة وليست إذن تعديل ملفات."]], ["منع التضارب", ["اللوكس تحمي الملفات والمجلدات والجداول وحزم البرومبت والتاسكات عند احتمال التصادم.", "تاسكات الدمج تعلن كل مسارات العمل المتأثرة."]]],
        checklist: ["كل وكيل له هوية.", "كل تاسك نشط له مالك.", "نطاق الوصول محدود.", "اللوكس ظاهرة.", "تاسكات الدمج تذكر المسارات المتأثرة.", "أحداث التدقيق تسجل التغييرات المهمة."],
        example: "وكيل يحدّث فلاتر الواجهة وآخر يغير API. لوك دمج يمنع الاثنين من تغيير عقد الداشبورد في نفس الوقت.",
        mistakes: ["وكلاء يعملون من تعليمات عامة.", "استخدام توكن تكلفة كإذن تعديل.", "تجاهل اللوكس لأن التغيير صغير."]
      },
      "vibe-first": {
        lead: "Vibe-first يسمح للمستخدم بالكلام الطبيعي ومراجعة كروت التاسكات والحفاظ على سرعة العمل.",
        beginner: "Vibe-first يعني أن المستخدم يصف ما يريد بلغة طبيعية، ثم يحوله Kabeeri إلى كروت تاسكات قابلة للمراجعة.",
        sections: [["لغة طبيعية", "النية تصنف وتفحص للغموض وتتحول إلى كروت تاسكات قابلة للتعديل."], ["التقاط بعد العمل", "العمل الحر يمكن التقاطه وربطه بتاسك أو changeset."], ["CLI كمحرك", "الأوامر الشائعة لها واجهة بينما يبقى CLI للمستخدم المتقدم."]],
        details: [["من النية إلى التاسك", ["المستخدم يقول ما يريد. Kabeeri يحدد هل هذا سؤال أو تاسك أو bug أو تصميم أو نشر.", "قبل التنفيذ تظهر كروت تاسكات قابلة للمراجعة والتعديل."]], ["التعامل مع الغموض", ["لو الطلب غامض ومنخفض المخاطر، يمكن اقتراح افتراضات.", "لو يؤثر على المال أو النشر أو الأمان أو موافقة المالك، يجب الاستيضاح أو إنشاء تاسك محجوب."]], ["التقاط ما بعد العمل", ["أحيانًا يحدث العمل قبل وجود تاسك. سجل الملفات المتغيرة والملخص والسبب والدليل والتكلفة، ثم اربطه بتاسك جديد أو قائم."]]],
        checklist: ["النية مصنفة.", "الافتراضات ظاهرة.", "التاسكات المقترحة قابلة للمراجعة.", "الغموض الخطر محجوب.", "التغييرات الحرة قابلة للالتقاط.", "CLI والواجهة متوافقان."],
        example: "المستخدم يقول: خلي onboarding أسهل. Kabeeri يقترح تاسكات للنصوص وترتيب الخطوات والتحليلات ومراجعة التصميم بدل تعديل عشوائي.",
        mistakes: ["اعتبار اللغة الطبيعية موافقة تلقائية.", "إخفاء الافتراضات.", "استبدال تحقق المالك بالتقاط ما بعد العمل."]
      },
      "design-source-governance": {
        lead: "حوكمة مصادر التصميم تمنع تنفيذ الواجهة من صورة أو PDF أو رابط أو موقع مرجعي مباشرة.",
        beginner: "لا يبدأ عمل الواجهة من لقطة شاشة وحدها. حول المصدر البصري أولًا إلى مواصفات نصية معتمدة.",
        sections: [["القاعدة", "مصادر التصميم تتحول إلى مواصفات نصية معتمدة قبل تنفيذ AI."], ["العقود", "كل صفحة تحتاج Page Spec وكل مكون متكرر يحتاج Component Contract."], ["القبول البصري", "الواجهة تحتاج مراجعة لقطات أو ملاحظات بصرية قبل تحقق المالك أو العميل."]],
        details: [["مصادر مسموحة", ["Figma ولقطات الشاشة وPDF ودليل الهوية والمواقع المرجعية والاسكتشات يمكن أن تكون مدخلات.", "لكنها لا تصبح تعليمات تنفيذ إلا بعد تحويلها إلى Spec نصي معتمد."]], ["محتوى Page Spec", ["الغرض، الجمهور، التخطيط، الحالات، ترتيب المحتوى، الاستجابة، التفاعلات، الوصول، احتياج البيانات، ومعايير القبول البصري.", "المكونات المتكررة تتحول إلى Component Contracts للحفاظ على الاتساق."]], ["أمان المواقع المرجعية", ["الموقع المرجعي للإلهام فقط وليس للنسخ.", "المواصفة يجب أن تصف سلوكًا ومسافات ومكونات ومحتوى أصليًا لهذا المنتج."]]],
        checklist: ["مصدر التصميم محدد.", "Spec نصي معتمد.", "Contracts للمكونات المتكررة.", "حالات الموبايل والفراغ موصوفة.", "لقطات أو ملاحظات بصرية مرفقة.", "قبول بصري من المالك أو العميل."],
        example: "العميل يرسل Screenshot. الفريق يكتب Page Spec فيه الأقسام والحالات والمسافات والألوان ومعايير القبول قبل طلب التنفيذ من AI.",
        mistakes: ["البناء مباشرة من Screenshot.", "نسخ موقع مرجعي.", "تجاهل الموبايل وحالات الفراغ.", "اعتبار الإلهام موافقة تصميم."],
        callout: "المواقع المرجعية للإلهام فقط، وليست مصدرًا للنسخ أو التنفيذ."
      },
      "production-publish": {
        lead: "جاهز للإنتاج ومنشور حالتان مختلفتان.",
        beginner: "جاهز للإنتاج يعني يمكن تشغيله بأمان. منشور يعني أنه خرج للمستخدمين فعليًا. Kabeeri يفصل القرارين.",
        sections: [["جاهز للإنتاج", "المشروع يمكن تشغيله بأمان في بيئة إنتاج لكنه ليس متاحًا للعامة بالضرورة."], ["منشور", "المشروع حي أو متاح للمستخدمين بموافقة المالك."], ["البوابة", "النشر يحتاج قائمة إصدار، عدم وجود عوائق حرجة، جاهزية أمان، وموافقة المالك."]],
        details: [["فحوصات الإنتاج", ["التطبيق يبني ويعمل، الإعدادات المطلوبة معروفة، الفحوصات الحرجة ناجحة أو لها استثناء مقبول، ومخاطر الأمان مراجعة.", "جاهز للإنتاج لا يعني أن العملاء يستطيعون الوصول إليه."]], ["فحوصات النشر", ["النشر يضيف تعرض المستخدمين والدعم والمراقبة والتواصل وموافقة المالك.", "قد يكون المشروع جاهزًا للمراجعة الداخلية دون أن يكون منشورًا."]], ["سجل الإصدار", ["كل إصدار يسجل النسخة أو changeset، التاسكات المقبولة، المشاكل المعروفة، قرار المالك، البيئة، وحالة النشر."]]],
        checklist: ["البناء أو التشغيل متحقق.", "العوائق الحرجة مغلقة.", "الأمان والإعدادات مراجعة.", "المشاكل المعروفة مكتوبة.", "المالك يوافق على النشر.", "حالة الإصدار مسجلة."],
        example: "نشر staging ينجح ويصبح جاهزًا للإنتاج، لكن المالك يؤجل النشر العام حتى تجهز نسخة التسعير وصندوق الدعم.",
        mistakes: ["النشر لأن deployment نجح.", "اعتبار staging إنتاجًا.", "تخطي موافقة المالك في إطلاق عام."]
      },
      "troubleshooting": {
        lead: "استخدم حل المشكلات عندما تفشل الفحوصات أو الداشبورد أو التكلفة أو التحقق.",
        beginner: "عند التعطل، ابدأ بالتحقق ثم تتبع المصدر. أغلب المشاكل تكون حالة ناقصة، مصدر ناقص، JSON غير صالح، توكن منتهي، أو ملكية غير واضحة.",
        sections: [["Validate", "ابدأ بالتحقق لاكتشاف ملفات ناقصة أو JSON غير صالح أو تضارب لوكس."], ["Trace", "راجع audit logs ومصدر التاسكات قبل تغيير التنفيذ."], ["Escalate", "لا تتجاوز إجراءات المالك أو الميزانية أو النشر أو اعتماد التصميم."]],
        details: [["أول استجابة", ["شغل التحقق. اقرأ الملف أو القاعدة الفاشلة. حدد هل المشكلة بيانات أم حالة ناقصة أم وصول منتهي أم فشل تنفيذ حقيقي.", "لا تصلح العرض قبل معرفة سجل المصدر."]], ["مسارات شائعة", ["الداشبورد خطأ: افحص الحالة المصدرية. التاسك محجوب: افحص الإجابات واللوكس والمالك والاعتمادات. التكلفة خطأ: افحص الجلسات غير المتتبعة.", "التصميم محجوب: افحص هل المصدر تحول إلى Spec معتمد."]], ["متى تصعد", ["صعّد عند الحاجة لموافقة مالك أو تجاوز ميزانية أو نشر أو توسيع وصول أو قبول خطر معروف.", "سجل سبب التصعيد حتى يفهم الشخص التالي لماذا توقف العمل."]]],
        checklist: ["التحقق شُغل.", "المصدر الفاشل معروف.", "التدقيق والمصدر مراجعان.", "بوابات المالك محترمة.", "الإصلاح مسجل.", "التحقق أُعيد بعد الإصلاح."],
        example: "تاسك لا يقبل التحقق. validation ينجح، لكن audit يوضح عدم وجود قرار مالك. الحل ليس كودًا؛ المالك يجب أن يقبل أو يرفض بسبب.",
        mistakes: ["تعديل المخرجات المولدة دون إصلاح المصدر.", "تجاوز اللوكس.", "اعتبار غياب موافقة المالك bug تقنيًا."],
        command: "node bin/kvdf.js validate\nnode bin/kvdf.js audit list\nnode bin/kvdf.js doctor --deep"
      }
    }
  }
};

function rootPath() {
  return document.body.dataset.root || "";
}

function currentLang() {
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

function currentSlug() {
  return document.body.dataset.page || "what-is";
}

function pagePath(lang, slug) {
  return `${rootPath()}pages/${lang}/${slug}.html`;
}

function textToHtml(text) {
  return text.replace(/`([^`]+)`/g, "<code>$1</code>");
}

function listHtml(items) {
  return `<ul>${items.map((item) => `<li>${textToHtml(item)}</li>`).join("")}</ul>`;
}

const itemGuideLabels = {
  en: {
    title: "Item-by-item explanation",
    means: "What this item means",
    use: "When to use it",
    steps: "How to apply it",
    output: "Expected output"
  },
  ar: {
    title: "شرح كل بند",
    means: "معنى هذا البند",
    use: "متى تستخدمه",
    steps: "كيف تطبقه",
    output: "المخرج المتوقع"
  }
};

const pageOperatingGuidance = {
  en: {
    "what-is": ["Use this page as the first explanation for developers, founders, clients, and AI-assisted teams who need to understand what Kabeeri manages and what it deliberately does not replace.", "Read the system role first, then follow the workflow from opening the folder to validation, task selection, AI coding, review, Owner verification, and release decision. Use the capability list to know which part of Kabeeri to open next.", "A reader who understands that Kabeeri is the delivery governance layer for AI coding projects, while tools like Codex, Claude, Cursor, Windsurf, and GitHub Copilot remain the coding assistants."],
    "start-here": ["Use this page as the practical entry map for a developer or owner who wants to run Kabeeri professionally from the folder, through Vibe-first intent, CLI-backed actions, questions, tasks, dashboards, AI cost, GitHub sync, team governance, and delivery mode selection.", "Start with the folder and `.kabeeri/` state, validate it, express intent through Vibe-first, let the CLI-backed system convert intent and answers into governed tasks, then monitor execution and finish through review, Owner verification, and release decision.", "A reader who knows exactly where to begin, which system capability to use next, and how Kabeeri turns AI-assisted development into a controlled product delivery workflow."],
    "new-project": ["Use it before the first implementation task in a new product, MVP, client build, or internal tool.", "Capture goal, audience, owner, release boundary, active questions, and first task candidates.", "A project foundation that can generate governed tasks and acceptance criteria."],
    "existing-project": ["Use it when the codebase already exists and Kabeeri must be introduced without damaging current work.", "Scan first, map existing decisions, then add governance incrementally through adoption tasks.", "A safely adopted project with useful history preserved and future work traceable."],
    "structured-delivery": ["Use it when scope, approvals, documents, or client handoff matter more than sprint speed.", "Move through intake, questions, docs, tasks, implementation, evidence, review, and owner verification.", "A sequential delivery record with clear gates and reduced ambiguity."],
    "agile-delivery": ["Use it when scope changes frequently and the team needs backlog, stories, sprint planning, and review.", "Convert sources into backlog items, make sprint-ready stories, estimate cost, execute, then review accepted work and rework.", "A sprint record that connects product value, implementation, acceptance, and AI cost."],
    "questionnaire-engine": ["Use it when the project has unknowns and you need to ask only the questions that matter.", "Start broad, activate relevant follow-up areas, classify missing answers, and turn important answers into docs or tasks.", "Coverage without forcing the user through irrelevant forms."],
    "task-governance": ["Use it for every executable unit of work, especially work done by AI or multiple collaborators.", "Attach source, scope, allowed areas, acceptance criteria, owner rules, evidence, and provenance.", "A task that can be assigned, monitored, reviewed, and verified without guessing."],
    "dashboard-monitoring": ["Use it while work is active, during reviews, and before delivery or publish decisions.", "Read status from the source state, investigate blocked or red items, and fix the underlying record when data is wrong.", "A live operational view of tasks, readiness, cost, locks, and verification."],
    "owner-verify": ["Use it whenever work claims to be finished, accepted, delivered, or ready for release.", "Collect evidence, review criteria, record the owner decision, then close or reject with a reason.", "A final accountable acceptance record with audit history."],
    "ai-cost-control": ["Use it before, during, and after AI-assisted work so spending stays visible and justified.", "Estimate cost, choose model route, track usage by task, classify untracked runs, and compare estimate with actuals.", "A cost record that separates accepted output, exploration, waste, and rework."],
    "multi-ai-governance": ["Use it when multiple humans, AI agents, tools, or workstreams can overlap.", "Assign identities, scopes, tokens, locks, and integration ownership before parallel work starts.", "Parallel work that remains auditable and avoids unsafe file or decision conflicts."],
    "vibe-first": ["Use it when the user expresses intent naturally and should not need to know internal commands.", "Classify intent, expose assumptions, produce editable task cards, and capture post-work changes when needed.", "Natural-language workflow that still produces governed tasks and traceable outcomes."],
    "design-source-governance": ["Use it before frontend implementation from screenshots, Figma, PDFs, links, references, or brand material.", "Convert the visual input into approved text specs, component contracts, and visual acceptance rules.", "Frontend work with original, approved design instructions instead of risky copying or guessing."],
    "production-publish": ["Use it when deciding whether the product can run safely or should become available to users.", "Separate production readiness checks from public publish approval, then record release state and owner decision.", "A release decision that distinguishes deployable from actually published."],
    "troubleshooting": ["Use it whenever validation, dashboard status, tasks, cost, locks, or verification behave unexpectedly.", "Validate first, trace the failing source, fix the root record or implementation, then validate again.", "A diagnosed issue with a recorded fix instead of a hidden workaround."]
  },
  ar: {
    "what-is": ["استخدم هذه الصفحة كأول شرح للمطور أو صاحب المشروع أو العميل أو الفريق الذي يريد فهم ما يديره Kabeeri وما الذي لا يستبدله.", "اقرأ دور النظام أولًا، ثم اتبع المسار من فتح المجلد إلى validation، اختيار التاسك، استخدام AI coding، المراجعة، تحقق المالك، وقرار الإصدار. استخدم قائمة الإمكانيات لمعرفة أي جزء تفتحه بعد ذلك.", "قارئ يفهم أن Kabeeri طبقة حوكمة وإدارة لتطوير البرمجيات بالذكاء الاصطناعي، بينما Codex وClaude وCursor وWindsurf وGitHub Copilot تظل أدوات مساعدة في كتابة الكود."],
    "start-here": ["استخدم هذه الصفحة كخريطة دخول عملية للمطور أو المالك الذي يريد تشغيل Kabeeri باحتراف من المجلد، عبر Vibe-first، وأوامر CLI التي تعمل تحتها، والأسئلة، والتاسكات، والداشبورد، وتكلفة AI، وGitHub sync، وحوكمة الفريق، واختيار نمط التسليم.", "ابدأ من المجلد وحالة `.kabeeri/`، تحقق منها، عبر عن النية بأسلوب Vibe-first، دع النظام المدعوم بالـ CLI يحول النية والإجابات إلى تاسكات محكومة، ثم راقب التنفيذ وأنهِ العمل بالمراجعة وتحقق المالك وقرار الإصدار.", "قارئ يعرف من أين يبدأ بالضبط، وأي قدرة من قدرات النظام يستخدم بعدها، وكيف يحول Kabeeri تطوير البرمجيات بالذكاء الاصطناعي إلى مسار منتج مضبوط."],
    "new-project": ["استخدمه قبل أول تاسك تنفيذ في منتج جديد أو MVP أو مشروع عميل أو أداة داخلية.", "سجل الهدف والجمهور والمالك وحدود الإصدار والأسئلة النشطة والتاسكات الأولى.", "أساس مشروع يستطيع توليد تاسكات محكومة ومعايير قبول."],
    "existing-project": ["استخدمه عندما يكون الكود موجودًا وتحتاج إدخال Kabeeri دون إتلاف العمل الحالي.", "افحص أولًا، اربط القرارات الموجودة، ثم أضف الحوكمة تدريجيًا عبر تاسكات اعتماد.", "مشروع معتمد بأمان مع حفظ التاريخ المفيد وجعل العمل القادم قابلًا للتتبع."],
    "structured-delivery": ["استخدمه عندما يكون النطاق أو الموافقات أو الوثائق أو تسليم العميل أهم من سرعة الاسبرنت.", "تحرك عبر الاستقبال والأسئلة والدوكس والتاسكات والتنفيذ والدليل والمراجعة وتحقق المالك.", "سجل تسليم متسلسل ببوابات واضحة وغموض أقل."],
    "agile-delivery": ["استخدمه عندما يتغير النطاق كثيرًا ويحتاج الفريق باكلوج وستوريز واسبرنت ومراجعة.", "حول المصادر إلى باكلوج، جهز الستوريز، قدر التكلفة، نفذ، ثم راجع المقبول وإعادة العمل.", "سجل اسبرنت يربط قيمة المنتج والتنفيذ والقبول وتكلفة AI."],
    "questionnaire-engine": ["استخدمه عندما يحتوي المشروع على مجهولات وتحتاج سؤال ما يهم فقط.", "ابدأ واسعًا، فعل مناطق المتابعة المناسبة، صنف الإجابات الناقصة، وحول المهم إلى دوكس أو تاسكات.", "تغطية مفيدة دون إجبار المستخدم على فورمات غير مهمة."],
    "task-governance": ["استخدمه لكل وحدة عمل قابلة للتنفيذ، خصوصًا عمل AI أو التعاون بين أكثر من شخص.", "اربط المصدر والنطاق والمناطق المسموحة ومعايير القبول وقواعد المالك والدليل والمصدر.", "تاسك يمكن إسناده ومتابعته ومراجعته والتحقق منه دون تخمين."],
    "dashboard-monitoring": ["استخدمه أثناء العمل، في المراجعات، وقبل قرارات التسليم أو النشر.", "اقرأ الحالة من المصدر، افحص البنود المحجوبة أو الحمراء، وأصلح السجل الأصلي عند خطأ البيانات.", "عرض تشغيلي حي للتاسكات والجاهزية والتكلفة واللوكس والتحقق."],
    "owner-verify": ["استخدمه عندما يدعي العمل أنه منتهٍ أو مقبول أو مسلم أو جاهز للإصدار.", "اجمع الدليل، راجع معايير القبول، سجل قرار المالك، ثم أغلق أو ارفض بسبب.", "قبول نهائي مسؤول وله سجل تدقيق."],
    "ai-cost-control": ["استخدمه قبل وأثناء وبعد العمل المدعوم بالذكاء الاصطناعي حتى تبقى التكلفة واضحة ومبررة.", "قدر التكلفة، اختر مسار الموديل، تتبع الاستخدام حسب التاسك، صنف غير المتتبع، وقارن التقدير بالفعلي.", "سجل تكلفة يفصل المقبول عن الاستكشاف والهدر وإعادة العمل."],
    "multi-ai-governance": ["استخدمه عندما يمكن أن يتداخل أكثر من إنسان أو وكيل AI أو أداة أو مسار عمل.", "حدد الهويات والنطاقات والتوكنز واللوكس وملكية الدمج قبل العمل المتوازي.", "عمل متوازٍ قابل للتدقيق ويتجنب تضارب الملفات والقرارات."],
    "vibe-first": ["استخدمه عندما يعبر المستخدم طبيعيًا ولا يجب أن يعرف أسماء الأوامر الداخلية.", "صنف النية، أظهر الافتراضات، أنشئ كروت تاسكات قابلة للتعديل، والتقط العمل بعد التنفيذ عند الحاجة.", "مسار بلغة طبيعية ينتج تاسكات محكومة ومخرجات قابلة للتتبع."],
    "design-source-governance": ["استخدمه قبل تنفيذ واجهة من Screenshot أو Figma أو PDF أو رابط أو مرجع أو هوية بصرية.", "حول المدخل البصري إلى Specs نصية معتمدة وComponent Contracts وقواعد قبول بصري.", "واجهة مبنية على تعليمات تصميم أصلية ومعتمدة بدل النسخ أو التخمين."],
    "production-publish": ["استخدمه عند تقرير هل المنتج يعمل بأمان أو يجب أن يكون متاحًا للمستخدمين.", "افصل فحوصات الجاهزية للإنتاج عن موافقة النشر العام، ثم سجل حالة الإصدار وقرار المالك.", "قرار إصدار يفرق بين قابل للتشغيل ومنشور فعليًا."],
    "troubleshooting": ["استخدمه عندما تتصرف الفحوصات أو الداشبورد أو التاسكات أو التكلفة أو اللوكس أو التحقق بشكل غير متوقع.", "ابدأ بالتحقق، تتبع المصدر الفاشل، أصلح السجل أو التنفيذ، ثم أعد التحقق.", "مشكلة مشخصة ولها إصلاح مسجل بدل حل جانبي مخفي."]
  }
};

function sectionGuideHtml(lang, slug, page) {
  const labels = itemGuideLabels[lang];
  const guidance = pageOperatingGuidance[lang][slug];
  const cards = (page.sections || []).map(([title, body], index) => `
    <article class="section-explainer">
      <h3>${title}</h3>
      <dl>
        <dt>${labels.means}</dt>
        <dd>${textToHtml(body)}</dd>
        <dt>${labels.use}</dt>
        <dd>${textToHtml(guidance[0])}</dd>
        <dt>${labels.steps}</dt>
        <dd>${textToHtml(guidance[1])}${index === 0 ? "" : ` ${lang === "ar" ? "طبقه بعد ربطه بالبند السابق حتى لا يصبح العمل منفصلًا." : "Apply it after linking it to the previous item so the work does not become detached."}`}</dd>
        <dt>${labels.output}</dt>
        <dd>${textToHtml(guidance[2])}</dd>
      </dl>
    </article>
  `).join("");
  return `<section class="deep-section"><h2>${labels.title}</h2><div class="section-explainer-grid">${cards}</div></section>`;
}

function renderNav() {
  const lang = currentLang();
  const slug = currentSlug();
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = pages.map(([id, enTitle, arTitle]) => {
    const title = lang === "ar" ? arTitle : enTitle;
    return `<a class="nav-link${id === slug ? " is-active" : ""}" href="${pagePath(lang, id)}" data-filter="${title.toLowerCase()}">${title}</a>`;
  }).join("");
}

function renderLanguageLinks() {
  const lang = currentLang();
  const slug = currentSlug();
  document.querySelectorAll(".language-link").forEach((link) => {
    const target = link.dataset.langTarget;
    link.href = pagePath(target, slug);
    link.classList.toggle("is-active", target === lang);
    link.textContent = target === "ar" ? "العربية" : "English";
  });
}

function renderContent() {
  const lang = currentLang();
  const slug = currentSlug();
  const dict = content[lang];
  const page = dict.pages[slug] || dict.pages["what-is"];
  const titles = Object.fromEntries(pages.map(([id, enTitle, arTitle]) => [id, lang === "ar" ? arTitle : enTitle]));
  const sections = (page.sections || []).map(([title, body]) => `
    <article class="info-card">
      <h3>${title}</h3>
      <p>${textToHtml(body)}</p>
    </article>
  `).join("");
  const details = (page.details || []).map(([title, items]) => `
    <article class="detail-block">
      <h3>${title}</h3>
      ${listHtml(items)}
    </article>
  `).join("");
  const sectionGuides = sectionGuideHtml(lang, slug, page);
  const pipeline = page.pipeline ? `<div class="pipeline">${page.pipeline.map((item) => `<span>${item}</span>`).join("")}</div>` : "";
  const checklist = page.checklist ? `<section class="deep-section"><h2>${dict.ui.checklist}</h2>${listHtml(page.checklist)}</section>` : "";
  const example = page.example ? `<section class="example-box"><h2>${dict.ui.example}</h2><p>${textToHtml(page.example)}</p></section>` : "";
  const mistakes = page.mistakes ? `<section class="deep-section warning-section"><h2>${dict.ui.mistakes}</h2>${listHtml(page.mistakes)}</section>` : "";
  const command = page.command ? `<pre><code>${page.command}</code></pre>` : "";
  const callout = page.callout ? `<div class="callout">${page.callout}</div>` : "";

  document.getElementById("content").innerHTML = `
    <p class="eyebrow">${dict.ui.eyebrow}</p>
    <h1>${titles[slug]}</h1>
    <p class="lead">${textToHtml(page.lead)}</p>
    <div class="beginner-note"><strong>${dict.ui.beginner}</strong><p>${textToHtml(page.beginner)}</p></div>
    ${pipeline}
    <div class="section-grid">${sections}</div>
    ${sectionGuides}
    <section class="deep-section"><h2>${dict.ui.deep}</h2><div class="detail-stack">${details}</div></section>
    ${checklist}
    ${example}
    ${mistakes}
    ${callout}
    ${command}
  `;
}

function bindSearch() {
  const lang = currentLang();
  const input = document.getElementById("doc-search");
  const label = document.querySelector(".search-label");
  input.placeholder = content[lang].ui.search;
  if (label) label.textContent = content[lang].ui.filter;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.hidden = query && !link.dataset.filter.includes(query);
    });
  });
}

renderNav();
renderLanguageLinks();
renderContent();
bindSearch();
