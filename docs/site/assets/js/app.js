const pages = [
  ["what-is", "Overview", "F81) 9'E)"],
  ["start-here", "Start Here", "'(/# EF GF'"],
  ["install-profiles", "Install and Profiles", "'D*+(J* H'D(1HA'JD'*"],
  ["ai-with-kabeeri", "AI Works Inside Kabeeri", "CJA J9ED AI /'.D C(J1J"],
  ["developer-onboarding", "Developer Onboarding", "*#GJD 'DE7H1"],
  ["capabilities", "System Capabilities", "B/1'* 'DF8'E"],
  ["repository-layout", "Repository Layout", "*F8JE 'DE3*H/9"],
  ["new-project", "Start a New Application", "(/! *7(JB ,/J/"],
  ["existing-kabeeri-project", "Continue a Kabeeri Project", "'3*CE'D E41H9 C(J1J"],
  ["existing-non-kabeeri-project", "Adopt an Existing App", "'9*E'/ *7(JB B'&E"],
  ["delivery-mode", "Choose Agile or Structured", "'.*J'1 Agile #H Structured"],
  ["agile-delivery", "Agile Delivery", "'D*3DJE 'D#,'JD"],
  ["structured-delivery", "Structured Delivery", "'D*3DJE 'DEF8E"],
  ["questionnaire-engine", "Questionnaire Engine", "E-1C 'D#3&D)"],
  ["product-blueprints", "Product Blueprints", ".1'&7 'DEF*,'*"],
  ["data-design", "Data Design", "*5EJE 'D(J'F'*"],
  ["ui-ux-advisor", "UI/UX Advisor", "E3'9/ *5EJE 'DH',G'*"],
  ["ui-ux-reference-library", "UI/UX Reference Library", "EC*() E1',9 UI/UX"],
  ["vibe-first", "Vibe-first Workflow", "E3'1 Vibe-first"],
  ["task-governance", "Task Governance", "-HCE) 'D*'3C'*"],
  ["app-boundary", "App Boundary Governance", "-HCE) -/H/ 'D*7(JB'*"],
  ["workstreams-scope", "Workstreams and Scope", "E3'1'* 'D9ED H'DF7'B"],
  ["prompt-packs", "Prompt Packs", "-2E 'D(1HE(*"],
  ["wordpress-development", "WordPress Development", "*7HJ1 WordPress"],
  ["wordpress-plugins", "WordPress Plugin Development", "*7HJ1 %6'A'* WordPress"],
  ["dashboard-monitoring", "Live Dashboard", "'D/'4(H1/ 'D-J"],
  ["ai-cost-control", "AI Cost Control", "'D*-CE AJ *CDA) AI"],
  ["multi-ai-governance", "Multi-AI Governance", "-HCE) *9// HCD'! AI"],
  ["github-release", "GitHub and Release Gates", "GitHub H(H'('* 'D%5/'1"],
  ["practical-examples", "Seven Practical Builds", "3(9) *7(JB'* 9EDJ)"],
  ["example-ecommerce", "Example: Ecommerce Website", "E+'D: E*,1 %DC*1HFJ"],
  ["example-ai-team-ecommerce", "Example: 3 AI Developers Build Ecommerce", "E+'D: 3 E7H1J AI D(F'! E*,1"],
  ["example-blog", "Example: Personal Blog", "E+'D: E/HF) 4.5J)"],
  ["example-dental-clinic", "Example: Dental Clinic Booking", "E+'D: 9J'/) #3F'F H-,H2'*"],
  ["example-crm", "Example: Professional CRM", "E+'D: CRM '-*1'AJ"],
  ["example-mobile-commerce", "Example: Ecommerce Mobile App", "E+'D: *7(JB EH('JD DDE*,1"],
  ["example-pos", "Example: Supermarket POS", "E+'D: POS 3H(1E'1C*"],
  ["example-wordpress-digital-agency", "Example: WordPress Digital Agency", "E+'D: WordPress D41C) *3HJB 1BEJ"],
  ["troubleshooting", "Troubleshooting", "-D 'DE4CD'*"]
];

const capabilityRows = {
  en: [
    ["CLI Engine", "Runs local workspace operations, validation, task lifecycle, dashboard export, package checks, and release gates.", "`bin/kvdf.js`, `src/cli/`, `docs/cli/CLI_COMMAND_REFERENCE.md`"],
    ["Repository Foldering", "Keeps the framework organized into runtime, knowledge, packs, integrations, contracts, docs, tests, and live state.", "`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`"],
    ["Workspace State", "Stores the project truth, tasks, dashboards, policies, reports, tokens, costs, captures, and audit events.", "`.kabeeri/`"],
    ["Vibe-first UX", "Lets the developer speak naturally while Kabeeri turns intent into governed suggestions, plans, captures, and briefs.", "`knowledge/vibe_ux/`, `.kabeeri/interactions/`"],
    ["Delivery Mode Advisor", "Helps decide between Agile and Structured delivery based on product uncertainty, scope stability, approvals, and risk.", "`knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`"],
    ["Product Blueprints", "Understands market system types such as ecommerce, ERP, CRM, POS, news, blog, booking, delivery, and mobile apps.", "`knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`"],
    ["Data Design Blueprint", "Guides database design from workflows, entities, relationships, constraints, snapshots, audit, transactions, and reporting.", "`knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`"],
    ["Agile Runtime", "Manages backlog, epics, stories, sprints, reviews, velocity, impediments, and sprint dashboard state.", "`knowledge/agile_delivery/`, `.kabeeri/agile.json`"],
    ["Structured Runtime", "Manages requirements, phases, deliverables, traceability, risks, change requests, and phase gates.", "`knowledge/delivery_modes/`, `.kabeeri/structured.json`"],
    ["Questionnaires", "Collects only the answers that matter, activates system areas, reports missing answers, and generates tasks.", "`knowledge/questionnaires/`, `knowledge/questionnaire_engine/`"],
    ["Prompt Packs", "Provides framework-aware prompts for Laravel, React, Next.js, Vue, Angular, Django, FastAPI, WordPress, Expo, Flutter, and more.", "`packs/prompt_packs/`"],
    ["WordPress Development", "Plans new WordPress sites, adopts existing sites, analyzes plugins/themes, scaffolds safe plugins/themes, creates tasks, and uses the WordPress prompt pack without editing WordPress core.", "`packs/prompt_packs/wordpress/`, `.kabeeri/wordpress.json`, `schemas/runtime/wordpress-state.schema.json`"],
    ["WordPress Plugin Development", "Creates governed plugin plans, scoped tasks, secure plugin scaffolds, acceptance checklists, and AI-ready implementation context for custom WordPress plugins.", "`.kabeeri/wordpress.json`, `knowledge/wordpress/WORDPRESS_PLUGIN_DEVELOPMENT.md`, `wp-content/plugins/<slug>/`"],
    ["Task Governance", "Turns work into scoped, source-backed, reviewable, token-aware, acceptance-driven units with durable execution fields, source-of-truth task memory, and fast resume support.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
    ["App Boundary Governance", "Allows related apps in one product workspace and blocks unrelated products from mixing in one folder.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
    ["Execution Scope Governance", "Connects tasks, apps, workstreams, allowed files, locks, and task access tokens.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
    ["Design Governance", "Converts design sources into approved text specs, page specs, component contracts, and visual checks.", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
    ["UI/UX Advisor", "Recommends interface patterns, component groups, page templates, SEO/GEO rules, and dashboard/mobile UX guidance.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
    ["UI/UX Reference Library", "Stores approved UI/UX rules and reference patterns, then generates design questions and governed frontend/design tasks from them.", "`knowledge/design_system/ui_ux_reference/`, `.kabeeri/design_sources/ui_ux_reference.json`"],
    ["ADR and AI Run History", "Preserves architecture decisions and accepted or rejected AI runs beyond chat history.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
    ["AI Cost Control", "Tracks usage, budgets, context packs, preflight estimates, model routing, accepted output, rework, and waste.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
    ["Live Dashboard", "Shows live technical, business, governance, task, app, cost, policy, workspace, and UX state.", "`docs/reports/dashboard/`, `.kabeeri/dashboard/`"],
    ["GitHub Sync", "Plans labels, milestones, issues, and release writes with dry-run defaults and confirmed write gates.", "`plugins/github_sync/`, `plugins/github/`"],
    ["Policy Gates", "Blocks unsafe verification, release, handoff, security, migration, and GitHub write operations.", "`schemas/policy*.json`, `.kabeeri/policies/`"],
    ["Packaging and Upgrade", "Checks npm package readiness and workspace upgrade compatibility.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
  ],
  ar: [
    ["E-1C CLI", "J4:D 9EDJ'* 'DE3'-) 'DE-DJ) H'D*-BB H/H1) -J') 'D*'3C'* H*5/J1 'D/'4(H1/ HA-5 'D*:DJA H(H'('* 'D%5/'1.", "`bin/kvdf.js`, `src/cli/`, `docs/cli/CLI_COMMAND_REFERENCE.md`"],
    ["*F8JE 'DE3*H/9", "J-'A8 9DI *F8JE 'DA1JEH1C %DI runtime Hknowledge Hpacks Hintegrations Hschemas Hdocs Htests H-'D) -J).", "`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`"],
    ["-'D) 'DE41H9", "*.2F -BJB) 'DE41H9 H'D*'3C'* H'D/'4(H1/ H'D3J'3'* H'D*B'1J1 H'D*HCF2 H'D*CDA) H'D'D*B'7'* H3,D 'D*/BJB.", "`.kabeeri/`"],
    ["*,1() Vibe-first", "*3E- DDE7H1 ('DCD'E 'D7(J9J (JFE' J-HD C(J1J 'DFJ) %DI 'B*1'-'* H.77 H'D*B'7'* HED.5'* E-CHE).", "`knowledge/vibe_ux/`, `.kabeeri/interactions/`"],
    ["E3'9/ FE7 'D*3DJE", "J3'9/ AJ 'D'.*J'1 (JF Agile HStructured -3( :EH6 'DEF*, H+('* 'DF7'B H'DEH'AB'* H'DE.'71.", "`knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`"],
    [".1'&7 'DEF*,'*", "JAGE #FH'9 #F8E) 'D3HB E+D E*,1 %DC*1HFJ HERP HCRM HPOS H#.('1 HE/HF) H-,2 H*H5JD H*7(JB'* EH('JD.", "`knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`"],
    ["*5EJE 'D(J'F'*", "J14/ *5EJE B'9/) 'D(J'F'* EF /H1) 'D9ED H'DCJ'F'* H'D9D'B'* H'DBJH/ H'DDB7'* H'D*/BJB H'DE9'ED'* H'D*B'1J1.", "`knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`"],
    ["*4:JD Agile", "J/J1 'D('CDH, H'D%(JC3 H'D3*H1J2 H'D'3(1F* H'DE1',9'* H'D319) H'DE9HB'* H-'D) /'4(H1/ 'D'3(1F*.", "`knowledge/agile_delivery/`, `.kabeeri/agile.json`"],
    ["*4:JD Structured", "J/J1 'DE*7D('* H'DE1'-D H'DE.1,'* H'D**(9 H'DE.'71 H7D('* 'D*:JJ1 H(H'('* 'DE1'-D.", "`knowledge/delivery_modes/`, `.kabeeri/structured.json`"],
    ["'D#3&D)", "J,E9 'D%,'('* 'DEGE) AB7 HJA9D EF'7B 'DF8'E HJ916 'DFH'B5 HJHD/ 'D*'3C'*.", "`knowledge/questionnaires/`, `knowledge/questionnaire_engine/`"],
    ["-2E 'D(1HE(*", "*HA1 (1HE(*'* H'9J) ('DA1JEH1C E+D Laravel HReact HNext.js HVue HAngular HDjango HFastAPI HWordPress HExpo HFlutter H:J1G'.", "`packs/prompt_packs/`"],
    ["*7HJ1 WordPress", "J.77 EH'B9 WordPress 'D,/J/) HJ9*E/ 'DEH'B9 'DB'&E) HJ-DD plugins/themes HJF4& plugins/themes "EF) HJ-HD 'D.7) %DI *'3C'* E9 WordPress prompt pack (/HF *9/JD WordPress core.", "`packs/prompt_packs/wordpress/`, `.kabeeri/wordpress.json`, `schemas/runtime/wordpress-state.schema.json`"],
    ["*7HJ1 %6'A'* WordPress", "JF4& .77 plugins E-CHE) H*'3C'* E-//) 'DF7'B Hscaffold "EF HBH'&E B(HD H3J'B ,'G2 DD0C'! 'D'57F'9J D*7HJ1 %6'A'* WordPress.", "`.kabeeri/wordpress.json`, `knowledge/wordpress/WORDPRESS_PLUGIN_DEVELOPMENT.md`, `wp-content/plugins/<slug>/`"],
    ["-HCE) 'D*'3C'*", "*-HD 'D9ED %DI H-/'* 0'* E5/1 HF7'B HE1',9) H*HCF2 HE9'JJ1 B(HD H-BHD *FAJ0 /'&E) H0'C1) E5/1 'D-BJB) DD'3*&F'A 'D31J9.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
    ["-HCE) -/H/ 'D*7(JB'*", "*3E- (*7(JB'* E1*(7) /'.D EF*, H'-/ H*EF9 .D7 EF*,'* :J1 E1*(7) AJ AHD/1 H'-/.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
    ["-HCE) F7'B 'D*FAJ0", "*1(7 'D*'3C'* H'D*7(JB'* HE3'1'* 'D9ED H'DEDA'* 'DE3EH-) H'DDHC3 H*HCF2 'D*'3C.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
    ["-HCE) 'D*5EJE", "*-HD E5'/1 'D*5EJE %DI EH'5A'* F5J) H5A-'* H9BH/ ECHF'* HA-H5'* (51J) E9*E/).", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
    ["E3'9/ UI/UX", "JB*1- #FE'7 'DH',G) HE,EH9'* 'DECHF'* HBH'D( 'D5A-'* HBH'9/ SEO/GEO H%14'/ 'D/'4(H1/ H'DEH('JD.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
    ["ADR H*'1J. *4:JD AI", "J-A8 B1'1'* 'DE9E'1J) H*4:JD'* AI 'DEB(HD) #H 'DE1AH6) .'1, 0'C1) 'D4'*.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
    ["*CDA) AI", "J**(9 'D'3*./'E H'DEJ2'FJ'* H-2E 'D3J'B H'D*B/J1 'DE3(B H*H,JG 'DEH/JD'* H'DE.1,'* 'DEB(HD) H%9'/) 'D9ED H'DG/1.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
    ["'D/'4(H1/ 'D-J", "J916 'D-'D) 'D*BFJ) H'D*,'1J) H'D-HCE) H'D*'3C'* H'D*7(JB'* H'D*CDA) H'D3J'3'* HE3'-'* 'D9ED H*,1() 'DH',G).", "`docs/reports/dashboard/`, `.kabeeri/dashboard/`"],
    ["E2'EF) GitHub", "*.77 labels Hmilestones Hissues Hrelease writes E9 dry-run 'A*1'6J H(H'('* C*'() E$C/).", "`plugins/github_sync/`, `plugins/github/`"],
    ["(H'('* 'D3J'3'*", "*EF9 'D*-BB H'D%5/'1 H'D*3DJE H'D#E'F H'DG,1) HC*'('* GitHub :J1 'D"EF).", "`schemas/policy*.json`, `.kabeeri/policies/`"],
    ["'D*:DJA H'D*1BJ)", "*A-5 ,'G2J) npm package H*H'AB *1BJ) E3'-'* 'D9ED.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
  ]
};

const docs = {
  en: {
    ui: {
      eyebrow: "Kabeeri VDF Documentation",
      beginner: "Plain explanation",
      guide: "Developer Guide",
      steps: "Recommended Roadmap",
      checklist: "Readiness Checklist",
      commands: "Useful Commands",
      details: "Deep Notes",
      mistakes: "Common Failure Modes",
      source: "Source of Truth",
      search: "Search docs",
      filter: "Filter"
    },
    pages: {
      "what-is": {
        lead: "Kabeeri VDF is a local-first operating framework for AI-assisted software development. It works with any AI coding assistant or automation tool the developer chooses. It does not replace Laravel, React, Next.js, Django, .NET, WordPress, hosting, Git, or the AI tool itself; it governs how a software idea becomes answers, tasks, prompts, implementation, review, dashboards, cost records, final verification, and release decisions.",
        beginner: "Think of Kabeeri as the project memory, delivery rulebook, AI coordination layer, and live dashboard around your codebase. The application is still built with its normal stack; Kabeeri keeps the work scoped, traceable, reviewable, and resumable.",
        sections: [
          ["What it governs", "Project intake, delivery mode, application boundaries, workstreams, questionnaires, product blueprints, data design, UI/UX guidance, prompt packs, tasks, reviews, policies, dashboards, GitHub sync, AI usage, and releases."],
          ["What it does not replace", "It is not the application framework, database, hosting platform, Git provider, or AI coding model. It sits above those tools and gives them context and guardrails."],
          ["Why it matters", "AI can generate code quickly, but projects fail when scope, source, acceptance, ownership, cost, and release readiness are unclear. Kabeeri makes those parts explicit."],
          ["Where truth lives", "Runtime truth lives in `.kabeeri/`; reusable system knowledge lives in `knowledge/`; exportable packs live in `packs/`; integrations live in `plugins/`; contracts live in `schemas/`."]
        ],
        steps: ["Open the repository", "Read current state", "Validate", "Choose scenario", "Answer missing questions", "Create scoped tasks", "Use AI on one task", "Review and verify", "Release or defer"],
        details: [
          ["Developer mental model", ["Use Kabeeri before coding to decide what should be built, during coding to constrain AI work, and after coding to record evidence and acceptance.", "If a session is closed, the next developer or AI assistant should recover from `.kabeeri/`, docs, task state, and dashboard state instead of old chat memory."]],
          ["Professional output", ["Every serious feature should have a source, scope, workstream, acceptance criteria, changed files, evidence, cost record, review status, and lead decision.", "This is the difference between vibe coding as improvisation and vibe coding as a repeatable engineering workflow."]]
        ],
        checklist: ["The project has `.kabeeri/` state or an adoption plan.", "The repository layout is understood.", "The current scenario is selected: new app, existing Kabeeri app, or existing non-Kabeeri app.", "The delivery mode is explicit.", "The next task is scoped and testable."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js structure map", "node bin/kvdf.js dashboard state"]
      },
      "start-here": {
        lead: "This is the entry map for any developer who opens a Kabeeri folder and wants to know what to do next without guessing.",
        beginner: "Start by identifying the scenario. Are you creating a new application, continuing a project already managed by Kabeeri, or adopting a codebase that was built without Kabeeri? Each scenario has a different safe route.",
        sections: [
          ["Scenario 1: new application", "Use product blueprint, delivery mode, questionnaire plan, data design, UI/UX advisor, prompt packs, and task governance before implementation."],
          ["Scenario 2: existing Kabeeri project", "Validate the workspace, read dashboard state, inspect active tasks, captures, locks, cost, and next actions, then continue from the safest ready task."],
          ["Scenario 3: existing non-Kabeeri app", "Do not reorganize code immediately. First adopt it by mapping apps, folders, risks, data model, feature areas, and missing governance records."],
          ["Scenario 4: unclear request", "Use Vibe-first to turn natural language into reviewable task suggestions instead of executing a vague command."],
          ["Scenario 5: release or GitHub write", "Run readiness, governance, policy, security, migration, and GitHub write gates before publishing or syncing confirmed writes."]
        ],
        steps: ["Identify scenario", "Validate", "Read dashboard", "Plan questions", "Select Agile or Structured", "Create tasks", "Use prompt pack", "Record evidence", "Final verify"],
        details: [
          ["First ten minutes", ["Run validation, read the system capabilities file, inspect the repository layout, and open the dashboard state.", "Do not ask AI to modify code until the target task, allowed scope, and acceptance criteria are known."]],
          ["How Kabeeri reduces token use", ["The foldering map tells AI where to look first. Product blueprints and data design reduce repeated discovery. Prompt packs give stack-specific context. Task scope and context packs prevent broad scans.", "The result is less repeated explanation, less chat memory loss, and fewer accidental edits."]]
        ],
        checklist: ["You know which scenario you are in.", "Validation is green or blockers are known.", "The next task has source and acceptance criteria.", "The selected prompt pack matches the stack.", "Any broad work has a capture or planning record."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js questionnaire plan", "node bin/kvdf.js delivery recommend", "node bin/kvdf.js task tracker --json"]
      },
      "install-profiles": {
        lead: "This page explains how to get Kabeeri from GitHub, run it locally, expose the `kvdf` command, and either choose or route the right project profile: `lite`, `standard`, or `enterprise`.",
        beginner: "`lite` is the small starter, `standard` is the normal recommended setup, and `enterprise` is the full governance setup. If you do not want to choose manually, `kvdf project profile route` can infer a profile from the goal and current stack.",
        sections: [
          ["Install from GitHub", "Clone the repository, install dependencies, run validation, then use `npm run kvdf -- ...` until the `kvdf` binary is linked or installed."],
          ["When `kvdf` becomes available", "After local linking or package installation, use `kvdf` directly in daily work. `node bin/kvdf.js` remains a source-code fallback for framework development."],
          ["`lite` profile", "Smallest practical project pack. Good for experiments, solo prototypes, simple websites, and early product discovery where heavy governance would slow the first steps."],
          ["`standard` profile", "Recommended default. Good for real client work, normal apps, AI-assisted builds, dashboards, task governance, prompt packs, and balanced Agile/Structured delivery."],
          ["`enterprise` profile", "Full operating pack. Good for large systems, teams, regulated work, multi-AI coordination, deeper acceptance, production governance, release gates, and stronger traceability."],
          ["Automatic profile routing", "If the goal already describes the product, `kvdf project profile route` can choose the profile, delivery mode, prompt packs, and intake groups before the workspace is created."]
        ],
        steps: ["Clone from GitHub", "Install dependencies", "Validate", "Choose profile", "Create project", "Open project", "Run dashboard", "Start with AI"],
        details: [
          ["GitHub setup", ["Use `git clone <repo-url>` to download Kabeeri, then run `npm install` inside the repository.", "Run `npm run kvdf -- --help` and `npm run kvdf -- validate` to confirm the checkout is healthy before creating projects."]],
          ["Recommended first project", ["For most developers, start with `standard`: `kvdf create --profile standard --output my-project`.", "`lite` is useful when you want minimal files. `enterprise` is useful when governance, team roles, release gates, and auditability matter from day one."]]
        ],
        checklist: ["Repository cloned from GitHub.", "Dependencies installed.", "`npm run kvdf -- validate` is green.", "Profile selected intentionally.", "New project generated or current folder initialized.", "`kvdf` direct command is used after linking/installing."],
        commands: ["git clone <repo-url> kabeeri-vdf", "cd kabeeri-vdf", "npm install", "npm run kvdf -- --help", "npm run kvdf -- validate", "npm run kvdf -- create --profile standard --output my-project", "kvdf create --profile lite --output my-project", "kvdf create --profile standard --output my-project", "kvdf create --profile enterprise --output my-project"]
      },
      "ai-with-kabeeri": {
        lead: "Kabeeri is designed for developers who want to talk to AI normally while the AI works inside a controlled project environment. The developer does not need to live in CLI commands; the CLI is the engine that the assistant, dashboard, VS Code tasks, or scripts can use behind the scenes.",
        beginner: "You can tell your AI assistant: 'I want to build a dental booking system.' The AI assistant should use Kabeeri to understand the product, ask the right questions, choose delivery mode, prepare backend/frontend/data/UI tasks, run checks, track cost, and record evidence instead of improvising from chat memory.",
        sections: [
          ["Developer experience", "The developer speaks naturally. Kabeeri turns the conversation into source-backed state: blueprint, questions, task cards, context packs, prompt packs, dashboard JSON, AI usage, and verification records."],
          ["AI role", "Any AI coding assistant writes code, explains code, creates files, and helps debug, but it should work one scoped task at a time using Kabeeri context and acceptance criteria."],
          ["CLI role", "The CLI is not the user experience goal. It is the reliable local engine. A human may run commands directly, or an assistant/UI can run them for the human."],
          ["Dashboard role", "The dashboard is the visual monitoring layer. It shows current truth from `.kabeeri/` so the developer can resume quickly."],
          ["Why use Kabeeri", "It reduces forgotten context, broad AI edits, unclear tasks, missing acceptance, repeated prompts, untracked token cost, and unsafe release decisions."]
        ],
        steps: ["Talk normally", "Kabeeri records intent", "AI receives scoped context", "AI implements one task", "Kabeeri records evidence", "Final review"],
        details: [
          ["What the developer actually does", ["Open the project folder, tell the assistant what you want, review the suggested plan and tasks, approve or adjust them, then let the assistant execute task by task.", "When a command is needed, the assistant can run it. The developer only needs to understand the journey, not memorize every command."]],
          ["What the AI must respect", ["AI should not modify unrelated files, skip validation, invent missing requirements, publish without gates, or treat vague chat as approval.", "AI should use product blueprints, questions, data design, UI/UX advisor, prompt packs, task scope, and dashboard state before implementation."]]
        ],
        checklist: ["Developer understands AI is the coding partner.", "Kabeeri is understood as the control environment.", "CLI is understood as an engine, not a burden.", "Dashboard is understood as monitoring.", "Tasks and verification remain required."],
        commands: ["node bin/kvdf.js vibe \"Build an ecommerce store\"", "node bin/kvdf.js dashboard serve --port auto", "node bin/kvdf.js context-pack create --task task-001", "node bin/kvdf.js prompt-pack compose react --task task-001"]
      },
      "capabilities": {
        lead: "This page is the web version of the Kabeeri capabilities reference. It explains what each capability owns, why it exists, where a developer should look, and how AI should stay inside the correct owner/app/plugin lane while using the CLI directly.",
        beginner: "When you are lost, this is the map. Pick the capability that matches your problem, then follow its source files and commands. If the work already has state, let the AI use the CLI directly instead of rebuilding the context in chat.",
        capabilityTable: true,
        sections: [
          ["How to read the table", "Each row is a system capability. The middle column explains the practical job. The source column tells the developer where to inspect or extend it."],
          ["AI entry lanes", "Kabeeri expects one direct CLI entry path for the AI, then a clear split between framework-owner work, app-developer work, and plugin-feature modules. That separation keeps prompts shorter and feature boundaries easier to remove or extend."],
          ["What makes capabilities useful", "A capability is useful only if it has documentation, runtime state or executable checks, and a clear relationship to tasks, dashboards, or AI context."],
          ["How capabilities connect", "Product Blueprints feed Questionnaires. Questionnaires feed Tasks. Data Design and UI/UX Advisor improve those tasks. Prompt Packs guide AI implementation. Dashboard, policies, cost, and final verification close the loop."]
        ],
        steps: ["Find capability", "Open source", "Check runtime state", "Run command", "Update docs and tests", "Validate"],
        details: [
          ["Developer usage", ["Use this page before creating new folders or new systems. If a feature belongs to an existing capability, extend that capability instead of creating a new scattered document.", "For AI work, paste or summarize the relevant capability row and source path into the task context, then keep the prompt focused on one task, one track, and one plugin boundary at a time. Use the CLI directly when the state already exists."]],
          ["Maintenance rule", ["When a capability changes, update the source docs, runtime implementation, schema if any, tests, and this docs site.", "The capabilities reference should remain the executive index of the whole framework, including the owner/app split, plugin-first guidance, and the ability to add or remove feature bundles cleanly."]]
        ],
        checklist: ["Capability exists in docs.", "Implementation or runtime state exists when needed.", "CLI or validation path exists when needed.", "Dashboard or reports can expose important state.", "The capability is reflected in this site.", "The owner/app/plugin lane is clear for AI and humans.", "Feature bundles can be added or removed without ambiguity."]
      },
      "repository-layout": {
        lead: "Kabeeri now uses a physical Laravel-like repository layout with a small set of top-level folders. This makes the framework easier to learn, faster for AI tools to scan, and safer to extend.",
        beginner: "If you are a developer, do not search the whole repository first. Start with the group that owns your problem: runtime in `src/`, knowledge in `knowledge/`, reusable packs in `packs/`, integrations in `plugins/`, docs in `docs/`, schemas in `schemas/`, tests in `tests/`, and live state in `.kabeeri/`.",
        sections: [
          ["`src/`", "Executable CLI runtime, command handlers, workspace helpers, validation logic, dashboard builders, and command behavior."],
          ["`knowledge/`", "Reusable operating knowledge: governance, product intelligence, delivery modes, questionnaires, task tracking, data design, UI/UX, Vibe UX, and design governance."],
          ["`packs/`", "Exportable assets: prompt packs, generators, templates, and examples used to start or guide customer projects."],
          ["`plugins/`", "External-facing adapters and surfaces: dashboard, GitHub, VS Code, platform integration, and multi-AI coordination material."],
          ["`plugins/`", "Optional removable bundles such as the kvdf-dev plugin and other independent feature modules that extend Kabeeri without becoming part of core runtime."],
          ["`workspaces/`", "Developer app workspaces that live under `workspaces/apps/<app-slug>/` with local app `.kabeeri` state, tests, docs, and package metadata."],
          ["`docs/`", "Human documentation, architecture notes, production guides, reports, bilingual docs, docs site, and AI context."],
          ["`.kabeeri/`", "Live local workspace state. This is the source of truth for current project work, not a documentation folder."]
        ],
        steps: ["Read foldering map", "Choose owning root", "Add files inside existing group", "Keep runtime state under `.kabeeri/`", "Validate structure"],
        details: [
          ["Legacy aliases", ["Old root paths like `prompt_packs/`, `standard_systems/`, `dashboard/`, and `governance/` remain readable through CLI aliases for compatibility.", "New files should use the new physical folders. Aliases are a bridge, not the preferred layout."]],
          ["AI scan policy", ["AI tools should read `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` before broad scanning.", "This reduces token use and prevents the assistant from treating old moved folders as missing."]]
        ],
        checklist: ["No new top-level folder is created without a documented reason.", "New docs go under `docs/` or `knowledge/` depending on whether they are human docs or reusable system knowledge.", "Prompt packs and templates go under `packs/`.", "External surfaces go under `plugins/`."],
        commands: ["node bin/kvdf.js structure map", "node bin/kvdf.js structure validate --json"]
      },
      "new-project": {
        lead: "Use this roadmap when the developer wants to build a new application from an idea, a client request, a product brief, or a natural-language conversation.",
        beginner: "Do not jump straight into code. First let Kabeeri understand the product type, delivery mode, app boundaries, data model, frontend direction, and task plan.",
        sections: [
          ["1. Create or open the Kabeeri folder", "Start in a Kabeeri workspace. Use `init` for an existing folder or `create` for a generated starter profile."],
          ["2. Start monitoring", "Generate or serve the dashboard so project state is visible from the beginning, not only at the end."],
          ["3. Use Vibe-first through the assistant", "Tell the AI what you want in normal language. The assistant can use Vibe-first and CLI commands under the hood."],
          ["4. Validate Kabeeri files", "Run validation before planning and before release. Broken state means unreliable AI context."],
          ["5. Verify review setup", "Create or check the review session when final acceptance will require explicit verification."],
          ["6. Start the question system", "Use adaptive questions to discover product type, backend, frontend, database, UI/UX, delivery mode, and release risks."],
          ["7. Plan and execute", "Use blueprint, data design, UI/UX advisor, prompt packs, task governance, context packs, and dashboard monitoring to continue development."]
        ],
        steps: ["Kabeeri folder", "Dashboard", "Vibe-first", "Validate", "Review", "Questions", "Plan", "AI implementation", "Review", "Handoff"],
        details: [
          ["Example: ecommerce with Laravel and React", ["Kabeeri treats backend Laravel and frontend React as related apps in one product workspace when they serve the same store.", "The product blueprint activates commerce, inventory, payments, shipping, customers, admin, storefront, SEO, security, tests, and release readiness."]],
          ["What good planning produces", ["A list of apps, workstreams, entities, pages, APIs, integrations, roles, acceptance criteria, risks, and initial tasks.", "The first implementation tasks should be small enough for one AI session and one review cycle."]]
        ],
        checklist: ["Product type selected.", "Apps and boundaries defined.", "Delivery mode selected.", "Questionnaire coverage known.", "Initial data model drafted.", "Initial UI pattern selected.", "Tasks are ready before coding."],
        commands: ["node bin/kvdf.js init --profile standard --mode agile", "node bin/kvdf.js dashboard generate", "node bin/kvdf.js vibe \"I want to build an ecommerce store\"", "node bin/kvdf.js validate", "node bin/kvdf.js track status", "node bin/kvdf.js questionnaire plan \"Build an ecommerce store\"", "node bin/kvdf.js blueprint recommend \"Build an ecommerce store\"", "node bin/kvdf.js data-design context ecommerce", "node bin/kvdf.js design recommend ecommerce", "node bin/kvdf.js prompt-pack list"]
      },
      "existing-kabeeri-project": {
        lead: "Use this roadmap when the project already has `.kabeeri/` state and you are returning after a session break or another developer worked before you.",
        beginner: "Your first job is recovery. Kabeeri should tell you where the project stands, what changed, what is blocked, what is ready, and what should happen next.",
        sections: [
          ["Validate state", "Run validation to catch broken JSON, missing schemas, invalid tasks, lock conflicts, expired tokens, route boundary issues, and policy blockers."],
          ["Read dashboard state", "Use the live dashboard and task tracker to see progress, ready work, blockers, cost, workstreams, app state, and release status."],
          ["Inspect recent captures", "If work happened outside the ideal task flow, post-work capture can classify changed files and link them back to tasks or suggested tasks."],
          ["Continue only ready work", "Pick a task that is ready, assigned, scoped, and has acceptance criteria. Avoid restarting from vague memory."],
          ["Close the loop", "Record evidence, review output, update dashboard state, close locks or tokens, and ask for final verification when complete."]
        ],
        steps: ["Validate", "Dashboard", "Tasks", "Captures", "Locks/tokens", "Continue", "Evidence", "Final review"],
        details: [
          ["Session recovery", ["Use `context_briefs` and live dashboard state as the restart point. The goal is to avoid asking the AI to rediscover the whole repository.", "If the last session ended abruptly, run capture and validation before new implementation."]],
          ["Team recovery", ["When multiple developers are involved, check workstreams, locks, task tokens, and assignments before editing files.", "If you are the only developer, still use the same flow because it protects you from your own forgotten context."]]
        ],
        checklist: ["Validation passed or blockers are listed.", "No active lock conflicts.", "Next task is ready.", "Previous untracked changes are captured.", "Cost and evidence are recorded."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js dashboard state", "node bin/kvdf.js task tracker --json", "node bin/kvdf.js capture list"]
      },
      "existing-non-kabeeri-project": {
        lead: "Use this roadmap when a codebase already exists but was not built with Kabeeri. The safe strategy is adoption first, not immediate reorganization.",
        beginner: "Kabeeri should learn the existing app before controlling it. Map folders, frameworks, apps, domains, database shape, frontend pages, risks, and missing documentation, then add governance gradually.",
        sections: [
          ["Do not overwrite structure", "Respect the existing framework layout. Laravel, Rails, Django, Next.js, WordPress, and mobile projects already have their own conventions."],
          ["Create adoption state", "Put the existing code inside a Kabeeri workspace or run Kabeeri from the repository root, then record project identity, apps, workstreams, delivery mode, known modules, risks, current release state, and missing answers."],
          ["Analyze the existing app", "Use `project analyze --path <folder>` to detect obvious stacks, app folders, workstreams, risks, and next adoption actions before feature work."],
          ["Map current code to capabilities", "Identify auth, users, roles, database, APIs, frontend pages, admin, payments, content, mobile, tests, CI/CD, monitoring, and security."],
          ["Capture undocumented work", "Use post-work capture and ADRs to preserve existing decisions before asking AI to change behavior."],
          ["Introduce tasks gradually", "Start with documentation, validation, tests, small fixes, and safe refactors before deep feature work."]
        ],
        steps: ["Put app in Kabeeri workspace", "Run init", "Analyze app", "Map apps", "Map modules", "Record risks", "Create adoption tasks", "Improve safely"],
        details: [
          ["Adoption categories", ["Existing Kabeeri project: continue from state. Existing non-Kabeeri project: create state around it. Legacy unstable project: stabilize first.", "Never treat all existing projects as blank new projects. That creates broken assumptions."]],
          ["First safe tasks", ["Add README/context, map apps and workstreams, identify frameworks, run tests, document database, record ADRs, add security scan, and create a task tracker.", "Feature changes come after the system understands the current shape."]]
        ],
        checklist: ["Existing framework structure is preserved.", "Apps and workstreams are mapped.", "Critical risks are recorded.", "Missing answers report exists.", "First tasks are adoption tasks, not broad rewrites."],
        commands: ["node bin/kvdf.js init --profile standard --mode structured", "node bin/kvdf.js project analyze --path .", "node bin/kvdf.js validate", "node bin/kvdf.js app list", "node bin/kvdf.js workstream list", "node bin/kvdf.js questionnaire plan \"Adopt existing application\"", "node bin/kvdf.js adr list"]
      },
      "delivery-mode": {
        lead: "Kabeeri supports two major delivery systems: Agile and Structured. The AI assistant should help the developer choose, but the developer or project lead makes the final decision.",
        beginner: "Agile is best when scope changes and you need learning through iterations. Structured is best when scope, approvals, documents, traceability, and phase gates matter more.",
        sections: [
          ["Use Agile when", "The product is evolving, the team expects feedback loops, priorities may change, and delivery is best organized as backlog, stories, sprints, reviews, and retrospectives."],
          ["Use Structured when", "The project needs formal requirements, approved phases, traceability, change control, enterprise handoff, client signoff, or regulated delivery."],
          ["Use both carefully", "A high-level Structured phase can contain Agile execution inside a phase, but Kabeeri should record which mode owns the decision and reporting."],
          ["Let Kabeeri recommend", "The recommendation should consider project type, uncertainty, client governance, team size, release pressure, risk, and documentation needs."]
        ],
        steps: ["Describe product", "Assess uncertainty", "Assess approvals", "Assess team workflow", "Recommend", "Decision recorded", "Record decision"],
        details: [
          ["Decision examples", ["A startup SaaS MVP with unclear scope usually fits Agile.", "A government ERP rollout with signed requirements usually fits Structured.", "An ecommerce MVP for one team may use Agile, while a client ecommerce platform with fixed deliverables may use Structured."]],
          ["Avoid mode confusion", ["Do not call everything Agile just because tasks exist. Do not call everything Structured just because documents exist.", "The selected mode should shape planning, dashboard, reports, and acceptance flow."]]
        ],
        checklist: ["Recommendation is documented.", "Final choice is recorded.", "Dashboard state matches mode.", "Tasks or phases follow the selected mode."],
        commands: ["node bin/kvdf.js delivery recommend", "node bin/kvdf.js agile summary", "node bin/kvdf.js structured health"]
      },
      "agile-delivery": {
        lead: "Agile Delivery turns product work into backlog, epics, user stories, sprints, impediments, reviews, retrospectives, and velocity-aware planning.",
        beginner: "Use it when you want iterative progress and fast feedback while still keeping AI work governed and reviewable.",
        sections: [
          ["Backlog", "Collects desired work with value, source, priority, dependencies, and readiness."],
          ["Epics and stories", "Breaks large goals into user-centered, testable slices with acceptance criteria."],
          ["Sprint planning", "Selects ready stories based on capacity, dependencies, risk, and AI cost expectations."],
          ["Sprint review", "Records accepted work, rework, goal result, evidence, and review feedback."],
          ["Retrospective", "Captures process improvements, waste, blockers, and next sprint actions."]
        ],
        steps: ["Product goal", "Backlog", "Epics", "Stories", "Ready check", "Sprint", "Implementation", "Review", "Retro"],
        details: [
          ["Scrum-like discipline", ["Kabeeri should behave like a strong Scrum Master: it makes work visible, challenges not-ready stories, exposes impediments, and keeps reviews honest.", "The goal is not ceremony. The goal is reliable delivery at scale."]],
          ["AI-specific Agile", ["Each story can carry AI cost metadata, prompt pack hints, workstream ownership, expected evidence, and accepted/rejected AI run history.", "This makes sprint cost and sprint quality measurable."]]
        ],
        checklist: ["Backlog exists.", "Stories have acceptance criteria.", "Sprint capacity is realistic.", "Impediments are tracked.", "Review records accepted and rework items."],
        commands: ["node bin/kvdf.js agile summary", "node bin/kvdf.js agile sprint plan sprint-001 --capacity-points 20", "node bin/kvdf.js validate agile"]
      },
      "structured-delivery": {
        lead: "Structured Delivery is the Waterfall-style system for formal requirements, phases, deliverables, traceability, risk control, change requests, and phase gates.",
        beginner: "Use it when you need a company-grade plan that can be reviewed, approved, audited, and handed off with confidence.",
        sections: [
          ["Requirements", "Capture what must be built, why, who requested it, how it is accepted, and whether it is approved."],
          ["Phases", "Group approved requirements into controlled delivery phases with goals, scope, deliverables, and gates."],
          ["Traceability", "Connect requirements to tasks, deliverables, tests, decisions, and final acceptance."],
          ["Change control", "Record scope changes as explicit requests with impact, approval, and schedule/cost implications."],
          ["Phase gates", "Prevent movement to the next phase when requirements, deliverables, risks, or approvals are incomplete."]
        ],
        steps: ["Intake", "Requirements", "Approval", "Phase plan", "Tasks", "Deliverables", "Gate", "Handoff"],
        details: [
          ["Enterprise behavior", ["Structured mode should feel like a strong enterprise delivery office: requirements are not vague notes; they are controlled commitments.", "Every phase should answer what is in scope, what is out of scope, who approved it, what evidence proves it, and what risks remain."]],
          ["AI-specific Structured", ["AI can still implement tasks, but it cannot silently change approved requirements.", "If implementation reveals a new need, create a change request instead of hiding scope drift."]]
        ],
        checklist: ["Approved requirements exist.", "Phase has clear deliverables.", "Traceability is connected.", "Risks are visible.", "Change requests are controlled.", "Gate status is explicit."],
        commands: ["node bin/kvdf.js structured health", "node bin/kvdf.js structured gate check phase-001", "node bin/kvdf.js validate structured"]
      },
      "questionnaire-engine": {
        lead: "The Questionnaire Engine asks the right questions at the right time so the developer and AI assistant do not waste time collecting irrelevant details.",
        beginner: "Instead of forcing a giant form, Kabeeri starts broad, detects the product type, activates relevant areas, and asks follow-up questions only where answers affect planning or implementation.",
        sections: [
          ["Adaptive intake", "Uses product type, framework, delivery mode, data design, UI/UX needs, and risk flags to decide what to ask next."],
          ["Coverage matrix", "Shows which areas are answered, missing, blocked, unknown, or deferred."],
          ["Missing answers", "Turns uncertainty into explicit follow-up items or tasks."],
          ["Task generation", "Creates proposed tasks with provenance back to questions, answers, and system areas."],
          ["AI usefulness", "Gives any AI assistant compact project context without reasking the same questions in every session."]
        ],
        steps: ["Entry answers", "Detect type", "Activate areas", "Ask follow-up", "Coverage", "Missing report", "Generate tasks"],
        details: [
          ["Good questions", ["A good question changes planning, scope, database design, UI, security, release, or acceptance.", "Bad questions collect trivia before the system knows whether that area matters."]],
          ["Examples", ["For ecommerce, ask about products, variants, cart, checkout, payments, shipping, returns, admin, SEO, and inventory.", "For a news site, ask about editorial workflow, breaking news, authors, sources, ads, paywall, SEO, sitemap, and mobile notifications."]]
        ],
        checklist: ["Questions match product type.", "Unknowns are explicit.", "Missing answers have follow-up actions.", "Generated tasks include provenance."],
        commands: ["node bin/kvdf.js questionnaire plan", "node bin/kvdf.js questionnaire coverage", "node bin/kvdf.js questionnaire missing"]
      },
      "product-blueprints": {
        lead: "Product Blueprints teach Kabeeri common market application patterns so AI planning starts from a professional baseline instead of a blank page.",
        beginner: "When a developer says ecommerce, POS, ERP, CRM, blog, news, booking, delivery, or mobile app, Kabeeri should already know the usual channels, modules, pages, database areas, workstreams, and risks.",
        sections: [
          ["Core + Module + Channel", "Every product is modeled as shared core platform, business modules, and user-facing channels."],
          ["Business systems", "Covers POS, ERP, CRM, inventory, accounting, ecommerce, marketplace, delivery, booking, restaurant, HR, helpdesk, loyalty, and BI."],
          ["Content systems", "Covers blog, news, magazine, corporate, knowledge base, documentation, newsletter, paid content, community, and media library."],
          ["Mobile systems", "Covers customer app, driver app, sales rep app, employee app, news app, booking app, loyalty app, finance app, and learning app."],
          ["Planning output", "Produces suggested modules, entities, frontend pages, backend APIs, integrations, risks, and likely workstreams."]
        ],
        steps: ["Identify product type", "Select blueprint", "Confirm modules", "Confirm channels", "Activate questions", "Generate plan"],
        details: [
          ["Why it reduces errors", ["Without blueprints, AI may forget returns in ecommerce, offline mode in POS, editorial workflow in news, or GPS proof in delivery.", "Blueprints keep recurring domain knowledge available to every project."]],
          ["How to extend", ["Add a new market system only when it has distinct modules, data entities, pages, workflows, or risks.", "Keep it reusable and connect it to questionnaires, data design, UI/UX, and prompt packs."]]
        ],
        checklist: ["Product type is selected.", "Channels are known.", "Modules are accepted or deferred.", "Database areas are identified.", "Risks are listed."],
        commands: ["node bin/kvdf.js blueprint list", "node bin/kvdf.js blueprint show ecommerce"]
      },
      "data-design": {
        lead: "Data Design helps the AI and developer create reliable database models from business workflows instead of random screens.",
        beginner: "Start with the real workflow, then define core platform tables, business modules, relationships, constraints, status history, audit logs, money handling, inventory movement, snapshots, search, reports, transactions, and idempotency.",
        sections: [
          ["Design from workflow", "Do not design tables from page names. Model the process: order, payment, shipment, return, refund, approval, publication, booking, or delivery."],
          ["Core + modules", "Separate shared platform tables from commerce, inventory, accounting, CMS, news, mobile, booking, delivery, CRM, HR, and reporting modules."],
          ["Integrity rules", "Use primary keys, foreign keys, constraints, status transitions, history, audit logs, and migrations."],
          ["Operational safety", "Use transactions, idempotency, concurrency control, outbox events, snapshots, soft delete rules, and backup/restore strategy."],
          ["Performance", "Plan indexes, pagination, search, summary tables, read models, archiving, and reporting separation."]
        ],
        steps: ["Workflow", "Entities", "Relationships", "Constraints", "Status/history", "Security", "Performance", "Migrations", "ERD"],
        details: [
          ["Examples", ["In ecommerce, do not put items as JSON inside orders if you need reports or partial returns. Use orders, order_items, payments, shipments, returns, refunds, and snapshots.", "In inventory, do not store stock as only `product.stock_quantity`. Use stock_movements as the source history and stock_balances for fast reads."]],
          ["AI prompt effect", ["A data-design-ready task tells AI exactly which entity, relationship, migration, validation, transaction, and tests are needed.", "This prevents shallow CRUD output that breaks in real business workflows."]]
        ],
        checklist: ["Business workflow is written.", "Entities are grouped by module.", "Relationships and constraints are defined.", "Money is not stored as float.", "Snapshots and audit rules are known.", "Migration and rollback risk is considered."],
        commands: ["node bin/kvdf.js data-design context", "node bin/kvdf.js validate runtime-schemas"]
      },
      "ui-ux-advisor": {
        lead: "UI/UX Advisor helps Kabeeri choose the right frontend experience, page structure, component groups, accessibility rules, and SEO/GEO behavior for the requested application.",
        beginner: "The same design rules should not be used for every product. A CRM dashboard needs dense operational UI; a blog needs reading quality and SEO; an ecommerce store needs product discovery and checkout clarity; mobile apps need touch-first flows.",
        sections: [
          ["Experience type", "Classify whether the UI is website, web app, admin dashboard, mobile app, POS screen, customer portal, vendor portal, news site, or documentation site."],
          ["Component strategy", "Choose components such as tables, filters, drawers, modals, cards, forms, tabs, accordions, breadcrumbs, search, command palette, checkout steps, or article layouts."],
          ["Design governance link", "Design sources become text specs, page specs, component contracts, and visual acceptance checks before frontend implementation."],
          ["SEO/GEO", "Public content pages need semantic HTML, headings, breadcrumbs, structured data, performance, readable content, FAQ, author/date, and internal links."],
          ["Framework guidance", "Map the UI need to Next.js, Astro, React, Vue, Angular, Nuxt, SvelteKit, React Native Expo, Flutter, or a dashboard-oriented library."]
        ],
        steps: ["Identify UI type", "Choose stack", "Select patterns", "Define pages", "Define components", "Add accessibility/SEO", "Create tasks"],
        details: [
          ["Dashboard design", ["Operational tools should be dense, calm, scannable, and built around tables, filters, status badges, action menus, and predictable navigation.", "Avoid marketing-style heroes inside internal tools."]],
          ["Public site design", ["SEO sites need semantic structure, fast loading, useful content blocks, breadcrumbs, schema, and responsive behavior.", "Visual polish matters, but content clarity and performance are part of the design system."]]
        ],
        checklist: ["UI type is known.", "Page templates are listed.", "Components are selected.", "Responsive states are defined.", "Accessibility rules are included.", "SEO/GEO rules are included when public."],
        commands: ["node bin/kvdf.js design recommend", "node bin/kvdf.js design gate --task task-001"]
      },
      "ui-ux-reference-library": {
        lead: "The UI/UX Reference Library is Kabeeri's governed design memory. It stores practical UI rules and approved reference patterns so AI tools can ask smarter questions and generate frontend tasks before writing code.",
        beginner: "Instead of asking AI to design from taste, Kabeeri can point it to an approved pattern: dark governance dashboard, e-commerce admin dashboard, enterprise app shell, billing page, or minimal shadcn-style dashboard. The AI still must implement from text specs and tokens, not copy a template.",
        sections: [
          ["What it contains", "General UI/UX system rules, admin dashboard reference patterns, machine-readable catalog data, task seeds, question prompts, component inventories, state rules, responsive rules, accessibility rules, and visual checklists."],
          ["How it helps questions", "When the project needs a dashboard or frontend surface, Kabeeri uses the reference to ask about roles, workflows, navigation depth, tables, filters, billing, notifications, RTL, SEO/GEO, states, and visual acceptance."],
          ["How it helps tasks", "The reference can create governed design-system, page-spec, component-contract, and QA tasks. This protects the project from an AI tool jumping straight into random frontend implementation."],
          ["Bootstrap foundation", "Bootstrap 5.3.8 is now an approved UI foundation for responsive websites, WordPress UI, MVP prototypes, forms, tables, and conventional admin/public interfaces when the project selects it."],
          ["Tailwind foundation", "Tailwind CSS 4.3.0 is now an approved utility-first foundation for custom responsive interfaces, modern framework apps, shadcn/headless component systems, storefronts, and SaaS dashboards."],
          ["Additional library foundations", "Bulma, Foundation Sites, MUI, Ant Design, daisyUI, and shadcn/ui are approved options when the selected frontend stack and product workflow match their strengths."],
          ["Copy policy", "References are inspiration only. Do not copy third-party source code, assets, branding, images, demo data, or pixel-perfect layouts."],
          ["Current patterns", "TAIL-UI01 Tailwind CSS 4, BOOT-UI01 Bootstrap 5.3, BULM-UI01 Bulma, FOUND-UI01 Foundation Sites, MUI-UI01 Material UI, ANTD-UI01 Ant Design, DAISY-UI01 daisyUI, SHAD-UI01 shadcn/ui, plus the admin dashboard reference patterns."]
        ],
        steps: ["Recommend reference", "Generate questions", "Answer UI needs", "Create design tasks", "Approve tokens/specs", "Implement UI", "Run visual QA"],
        details: [
          ["For admin dashboards", ["Choose based on product shape: governance monitoring, e-commerce operations, enterprise multi-module shell, billing/finance page, or simple SaaS analytics.", "Every dashboard page needs navigation, tables, filters, states, permissions, responsive behavior, RTL readiness, and accessibility."]],
          ["For Bootstrap projects", ["Pin Bootstrap to `5.3.8`, document whether CSS/JS comes from npm bundler, Sass source, or CDN, and map Bootstrap variables to project design tokens.", "Create component contracts for buttons, forms, navs, cards, modals, dropdowns, alerts, toasts, tables, pagination, and the grid before page implementation."]],
          ["For Tailwind projects", ["Pin Tailwind CSS to `4.3.0`, document whether the build uses CLI, Vite, PostCSS, framework plugin, or browser-only prototype setup, and map theme variables to project tokens.", "Create component contracts so shared buttons, forms, app shells, cards, dialogs, tables, and states do not become repeated ad hoc utility strings."]],
          ["For React component libraries", ["Use MUI, Ant Design, or shadcn/ui only when the project is React/Next.js-compatible.", "Document theme tokens, provider setup, component ownership, RTL, dark mode, and table/form contracts before implementation."]],
          ["For CSS framework choices", ["Use Bulma for lightweight CSS-only responsive interfaces and Foundation Sites for mature customizable responsive websites.", "Avoid mixing full CSS frameworks on one surface unless there is a documented migration plan."]],
          ["For future public interfaces", ["Add storefront, blog/news, company site, mobile app, POS, booking, and portal references in the same structure.", "Each public reference should include SEO/GEO structure, content blocks, schema rules, and page-specific task seeds."]]
        ],
        checklist: ["Reference pattern is selected.", "Questions are generated before implementation.", "Design tokens are approved.", "Approved UI library decision is documented.", "Library/framework compatibility is confirmed.", "Page specs and component contracts exist.", "No copied assets or branding.", "Loading/empty/error/permission states are included.", "Responsive and RTL rules are documented."],
        commands: ["kvdf design reference-list", "kvdf design reference-show TAIL-UI01", "kvdf design reference-show BOOT-UI01", "kvdf design reference-show MUI-UI01", "kvdf design reference-show ANTD-UI01", "kvdf design reference-show SHAD-UI01", "kvdf design reference-recommend \"tailwind nextjs custom saas dashboard\"", "kvdf design reference-recommend \"ant design enterprise crm tables forms\"", "kvdf design reference-recommend \"bulma css only responsive public website\"", "kvdf design reference-questions SHAD-UI01", "kvdf design reference-tasks ANTD-UI01 --scope \"enterprise admin dashboard\""]
      },
      "vibe-first": {
        lead: "Vibe-first lets the developer talk naturally while Kabeeri converts intent into structured, reviewable, and safe work.",
        beginner: "You should be able to tell the assistant, 'I want to build an ecommerce store' or 'continue the dashboard work', without memorizing CLI commands. Kabeeri still records suggestions, tasks, captures, and context under the hood.",
        sections: [
          ["Intent classification", "Detects whether the user wants to create a task, ask a question, run a check, capture work, review work, verify a task, estimate cost, sync GitHub, or publish."],
          ["Vague request detection", "Stops dangerous broad execution such as 'improve everything' and asks follow-up questions or creates smaller safe suggestions."],
          ["Suggested task cards", "Creates reviewable cards with title, summary, workstream, type, source, allowed/forbidden files, risk, cost, and acceptance criteria."],
          ["Post-work capture", "When work happened outside the ideal flow, capture changed files, classify them, and link them back to tasks or suggestions."],
          ["Context briefs", "Creates compact summaries so AI sessions can resume with less token waste."]
        ],
        steps: ["Natural request", "Intent", "Vague check", "Suggestion", "Approval", "Task", "Execution", "Capture", "Brief"],
        details: [
          ["Why it matters for AI assistants", ["It reduces repeated explaining. Instead of asking the AI to rediscover the repo, Kabeeri can produce task-specific context and boundaries.", "It also prevents the assistant from treating natural language as permission to edit everything."]],
          ["With or without command", ["The CLI command is one surface. Chat, VS Code, dashboard cards, and future integrations can call the same runtime behavior.", "The developer does not need to use `kvdf vibe` directly if an assistant or UI surface drives the flow."]]
        ],
        checklist: ["Intent is classified.", "Vague requests are not executed directly.", "Suggested tasks are reviewable.", "Captures link untracked work.", "Context brief exists for resume."],
        commands: ["node bin/kvdf.js vibe \"Add checkout\"", "node bin/kvdf.js capture list", "node bin/kvdf.js vibe brief"]
      },
      "task-governance": {
        lead: "Task Governance turns ideas, answers, issues, and captures into executable work with a durable record that can be resumed from the source of truth.",
        beginner: "A Kabeeri task is more than a todo. It keeps source, scope, workstream, assignee, reviewer, acceptance criteria, allowed files, token budget, evidence, durable execution details, and final verification steps in one place so the next session can resume without rereading chat history.",
        sections: [
          ["Source", "Every task should come from a product answer, blueprint, bug report, design spec, capture, GitHub issue, release need, or lead decision."],
          ["Source of truth", "The task record is the source of truth for what must happen, what must not change, and how completion is verified."],
          ["Definition of Ready", "A task is not ready if scope, acceptance, workstream, dependencies, or reviewer are unknown."],
          ["Execution", "Work starts with assignment, optional lock, token scope, AI session, allowed files, and the task memory block that preserves the exact resume context."],
          ["Review", "Review checks changed files, evidence, tests, acceptance criteria, and policy gates."],
          ["Verification", "Final verification accepts or rejects completion and closes the loop."],
          ["Durable execution records", "Execution summary, resume steps, required inputs, expected outputs, do-not-change rules, and verification commands are stored with the task so a later session can resume from the record instead of the conversation."]
        ],
        steps: ["Source", "Draft", "Ready", "Assign", "Execute", "Review", "Final verify", "Close"],
        details: [
          ["Why it prevents chaos", ["AI tools are powerful but can drift. Task governance gives each session a boundary and an acceptance target.", "This is especially important when multiple apps, developers, or AI agents share one workspace."]],
          ["Live JSON", ["Task tracker state can be represented as live JSON for dashboards and editor integrations.", "This reduces manual docs editing after every task because UI surfaces can read state directly."]],
          ["Resuming later", ["The task memory block can be re-read by `kvdf task memory <id>` or by the temporary queue when the task enters `kvdf temp`.", "That means the next session can continue with less chat history and less token spend."]]
        ],
        checklist: ["Task has source.", "Acceptance criteria are testable.", "Allowed files are clear.", "Reviewer exists.", "Evidence is recorded.", "Final decision is recorded when required."],
        commands: ["node bin/kvdf.js task tracker --json", "node bin/kvdf.js task memory task-001", "node bin/kvdf.js validate task"]
      },
      "app-boundary": {
        lead: "App Boundary Governance decides whether multiple applications can live inside one Kabeeri workspace without mixing unrelated products.",
        beginner: "Backend Laravel plus React storefront plus admin dashboard can be one product if they serve the same ecommerce system. A store and a news platform for a different client should not share one Kabeeri folder. Developer app workspaces belong under `workspaces/apps/<app-slug>/`.",
        sections: [
          ["Allowed", "Related apps in one product: backend API, storefront, admin panel, mobile app, worker, docs site, vendor portal, or driver app. Each app can be scaffolded as a developer workspace under `workspaces/apps/<app-slug>/`."],
          ["Blocked", "Unrelated products, unrelated clients, separate business lifecycles, or apps that need separate tasks, releases, cost, responsibility, and governance."],
          ["Boundaries", "Each app should have path, type, product, workstreams, status, and integration relationship. The workspace root should be discoverable from `workspaces/apps/<app-slug>/`."],
          ["Cross-app work", "Integration tasks should explicitly mention every affected app and workstream."]
        ],
        steps: ["Identify product", "List apps", "Check relatedness", "Assign paths", "Assign workstreams", "Validate boundaries"],
        details: [
          ["Practical rule", ["A backend and frontend for the same ecommerce product are related applications, not unrelated products.", "Two different applications requested by the developer in the same folder are blocked unless they are modules/channels of one product."]],
          ["Why it matters", ["Without boundaries, tasks, costs, dashboards, releases, and AI context become polluted.", "Boundary governance keeps one workspace coherent."]]
        ],
        checklist: ["Every app has a product lead.", "Every app has a path.", "Relatedness is explicit.", "Cross-app tasks are marked as integration work."],
        commands: ["node bin/kvdf.js app list", "node bin/kvdf.js validate routes"]
      },
      "workstreams-scope": {
        lead: "Workstreams and execution scope define who or what can work where, on which app, and for which task.",
        beginner: "They prevent backend, frontend, mobile, database, QA, security, docs, and integration work from colliding or expanding silently.",
        sections: [
          ["Workstreams", "Represent responsibility areas such as backend, public frontend, admin frontend, mobile, database, integrations, QA, security, DevOps, docs, and design."],
          ["Task access tokens", "Narrow the permission scope for a task to specific files, paths, apps, and workstreams."],
          ["Locks", "Protect folders or files from overlapping edits when multiple humans or AI agents work in parallel."],
          ["Execution scope", "The final allowed scope is derived from task, app, workstream, token, and any manual broad-scope approval."]
        ],
        steps: ["Select task", "Select workstream", "Derive files", "Issue token", "Create lock", "Execute", "Close token/lock"],
        details: [
          ["Solo developer", ["Even one developer benefits because scope rules reduce accidental broad edits and make session recovery easier.", "Solo mode can be lighter, but the same state model still works."]],
          ["Team mode", ["Teams need explicit responsibility, locks, and token scopes before parallel work.", "AI agents should be treated as identities with constrained workstreams."]]
        ],
        checklist: ["Workstream exists.", "Allowed files are derived.", "Token is not broader than needed.", "Lock conflicts are checked.", "Session files match scope."],
        commands: ["node bin/kvdf.js workstream list", "node bin/kvdf.js token show task-token-001", "node bin/kvdf.js validate workstream"]
      },
      "prompt-packs": {
        lead: "Prompt Packs give AI coding tools stack-specific instructions so implementation starts from the conventions of the chosen framework.",
        beginner: "A Laravel task should not be prompted like a React task. A Next.js page, FastAPI endpoint, WordPress plugin, Expo screen, and Supabase policy each need different context and safety rules.",
        sections: [
          ["Framework packs", "Kabeeri includes packs for many stacks including Laravel, React, Vue, Angular, Next.js, Astro, Django, FastAPI, NestJS, Express, WordPress, Shopify, Supabase, Firebase, Flutter, and React Native Expo."],
          ["Common prompt layer", "Shared scope, review, evidence, AI-run, and safety rules are composed with stack-specific prompts."],
          ["Export", "Prompt packs can be exported into customer project folders when needed."],
          ["Composition", "A composed prompt should include task context, allowed scope, acceptance criteria, stack rules, and review expectations."]
        ],
        steps: ["Select stack", "Select task", "Compose prompt", "Run AI", "Review output", "Record run"],
        details: [
          ["Token saving", ["A prompt pack replaces repeated manual explanation of framework conventions.", "Combined with context briefs, it makes AI sessions shorter and more consistent."]],
          ["Quality rule", ["Prompt packs should guide implementation, not bypass review.", "The output still needs tests, evidence, and final verification where required."]]
        ],
        checklist: ["Correct stack pack selected.", "Common prompt layer included.", "Task scope included.", "Acceptance criteria included.", "AI run recorded."],
        commands: ["node bin/kvdf.js prompt-pack list", "node bin/kvdf.js prompt-pack compose react --task task-001"]
      },
      "wordpress-development": {
        lead: "Kabeeri can build a WordPress site from scratch or adopt an existing WordPress site, but it treats WordPress as a governed platform with staging, backup, scope, plugin/theme boundaries, and review gates.",
        beginner: "Tell your AI assistant what WordPress site you want. Kabeeri decides whether it is a company site, blog, news site, booking site, WooCommerce store, or custom portal, then turns that into questions, tasks, safe plugin/theme scaffolds, and WordPress-specific prompts.",
        sections: [
          ["New WordPress site", "Kabeeri plans the site type, product blueprint, pages, content model, CPTs, taxonomies, menus, forms, admin settings, SEO/GEO needs, theme/plugin route, delivery mode, and first implementation tasks."],
          ["Existing WordPress site", "Kabeeri analyzes `wp-content`, plugins, themes, WooCommerce signals, staging and backup risk, forbidden paths, and adoption next actions before code changes."],
          ["Safe implementation boundary", "Custom behavior should live in a custom plugin, custom theme, or child theme. Kabeeri explicitly forbids random edits to `wp-admin`, `wp-includes`, `wp-config.php`, uploads, or production secrets."],
          ["WooCommerce support", "For stores, Kabeeri requires explicit tasks for catalog, checkout, payments, shipping, tax, stock, order statuses, refunds, emails, and sandbox evidence."],
          ["AI usage", "Use `kvdf prompt-pack compose wordpress --task <task-id>` so the AI assistant gets WordPress rules about hooks, nonces, capabilities, sanitization, escaping, REST routes, shortcodes, admin settings, CPTs, WooCommerce, and release handoff."]
        ],
        steps: ["Describe site", "Analyze or classify", "Confirm staging/backup", "Select blueprint", "Create WordPress plan", "Generate tasks", "Scaffold safe layer", "Compose WordPress prompt", "Implement one task", "Test and handoff"],
        details: [
          ["From scratch flow", ["Start with `kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new`.", "Then create tasks, scaffold a plugin/theme if needed, compose WordPress prompt pack per task, implement, scan, validate, and hand off."]],
          ["Existing site flow", ["Start with `kvdf wordpress analyze --path existing-wordpress --staging --backup`.", "If staging or backup is missing, Kabeeri records risk and the AI should not perform broad changes until the lead accepts the risk."]],
          ["When not to use WordPress", ["If the project needs a custom SaaS app, complex real-time operations, or non-CMS-heavy workflows, Kabeeri may recommend Laravel, Next.js, Django, or another stack instead.", "WordPress is strongest for content sites, corporate sites, editorial sites, plugin-driven business sites, and WooCommerce stores."]]
        ],
        checklist: ["Site type is known.", "Existing site has staging and backup confirmed.", "WordPress core paths are forbidden.", "Implementation route is plugin, theme, or child theme.", "Tasks have acceptance criteria.", "WordPress prompt pack is composed per task.", "Security, SEO/GEO, accessibility, performance, and handoff are reviewed."],
        commands: ["kvdf wordpress analyze --path . --staging --backup", "kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new", "kvdf wordpress plan \"Improve existing WooCommerce checkout\" --type woocommerce --mode existing", "kvdf wordpress tasks", "kvdf wordpress scaffold plugin --name \"Business Features\"", "kvdf wordpress scaffold child-theme --name \"Company Child\" --parent twentytwentyfour", "kvdf prompt-pack compose wordpress --task task-001"]
      },
      "wordpress-plugins": {
        lead: "Kabeeri can plan and scaffold WordPress plugins as governed software modules with architecture, security, tasks, file boundaries, acceptance criteria, and handoff notes.",
        beginner: "Tell your AI assistant what plugin you want. Kabeeri turns the idea into a plugin plan, creates a safe folder under `wp-content/plugins`, generates scoped tasks, and gives the AI WordPress-specific rules before coding.",
        sections: [
          ["When to use a plugin", "Use a plugin for business behavior that should survive theme changes: bookings, WooCommerce extensions, CPTs, integrations, admin settings, REST APIs, shortcodes, blocks, and reusable modules."],
          ["Plugin plan", "The plan records plugin name, slug, type, target path, architecture, task templates, safety rules, recommended commands, and acceptance checklist."],
          ["Generated scaffold", "Kabeeri generates a conservative structure with plugin header, loader, admin class, public class, assets, languages folder, uninstall policy, and README."],
          ["Security model", "Plugin work requires ABSPATH guards, capabilities, nonces, sanitization, escaping, REST permission callbacks, safe uninstall behavior, and no production secrets."],
          ["AI workflow", "After the plan and tasks exist, use the WordPress prompt pack per task so the AI assistant works inside the plugin folder and avoids WordPress core files."]
        ],
        steps: ["Describe plugin", "Create plugin plan", "Scaffold plugin", "Create plugin tasks", "Compose prompt pack", "Implement one task", "Run checks", "Prepare handoff"],
        details: [
          ["Booking plugin", ["Use `--type booking` for appointments, clinics, reservations, calendars, availability, and public booking shortcodes.", "Tasks should cover data model, admin settings, public form, validation, notifications, and handoff."]],
          ["WooCommerce plugin", ["Use `--type woocommerce` for checkout, products, orders, stock, refunds, shipping, tax, payment gateways, and emails.", "Payment or order lifecycle changes need sandbox evidence and explicit review."]],
          ["Integration plugin", ["Use `--type integration` for APIs, CRM/ERP sync, webhooks, external gateways, and background retries.", "Tasks should cover credential storage, webhook verification, logs, retries, and failure states."]],
          ["CPT plugin", ["Use `--type cpt` for directories, listings, portfolios, editorial models, taxonomies, and custom admin content flows.", "Tasks should cover labels, capabilities, rewrites, admin columns, and migration notes."]]
        ],
        checklist: ["Plugin lives only under `wp-content/plugins/<slug>/`.", "Plugin plan and scaffold exist.", "Tasks include allowed and forbidden file scopes.", "Admin pages use capabilities and settings validation.", "Forms and state changes use nonces.", "Inputs are sanitized and outputs are escaped.", "REST routes have permission callbacks.", "Uninstall behavior is explicit.", "Handoff includes activation, rollback, changed files, and tests."],
        commands: ["kvdf wordpress plugin plan \"Build a clinic booking plugin\" --name \"Clinic Booking\" --type booking", "kvdf wordpress plugin plan \"Create a WooCommerce checkout add-on\" --name \"Checkout Addon\" --type woocommerce", "kvdf wordpress plugin scaffold --name \"Clinic Booking\"", "kvdf wordpress plugin tasks", "kvdf wordpress plugin checklist", "kvdf prompt-pack compose wordpress --task task-001"]
      },
      "dashboard-monitoring": {
        lead: "The Live Dashboard is the operational view over `.kabeeri/` state. It helps developers and AI assistants understand current truth quickly.",
        beginner: "Use the dashboard to see what is ready, blocked, expensive, risky, verified, unfinished, or ready for release without reading every file.",
        sections: [
          ["Task tracker", "Shows task readiness, status, assignees, acceptance, review, and verification."],
          ["Business state", "Shows feature readiness, journeys, demo readiness, and product value."],
          ["Technical state", "Shows apps, workstreams, checks, policies, security, migrations, and release status."],
          ["Cost and AI runs", "Shows AI usage, budget, waste, accepted runs, rejected runs, and preflight estimates."],
          ["Multi-workspace view", "Allows one dashboard to watch more than one Kabeeri folder when a developer works on several projects."]
        ],
        steps: ["Read state", "Find blockers", "Open task", "Fix source", "Validate", "Refresh dashboard"],
        details: [
          ["Live JSON", ["Important dashboard state is stored as JSON under `.kabeeri/dashboard/` and `.kabeeri/reports/`.", "This lets VS Code, browser dashboards, and AI tools consume the same truth."]],
          ["UX governance", ["The dashboard should be operational and scannable, not a marketing page.", "Dense data, filters, statuses, and predictable navigation matter more than decorative layout."]]
        ],
        checklist: ["Dashboard state exists.", "Task tracker state is fresh.", "Blockers are actionable.", "Costs and policies are visible.", "Workspace links are clear."],
        commands: ["node bin/kvdf.js dashboard state", "node bin/kvdf.js dashboard export", "node bin/kvdf.js reports live"]
      },
      "ai-cost-control": {
        lead: "AI Cost Control makes token spend visible, intentional, and connected to delivery value.",
        beginner: "Track what was spent, why it was spent, which task it supported, whether the output was accepted, and whether cheaper context or model routing could have helped.",
        sections: [
          ["Usage records", "Store provider, model, input tokens, output tokens, cost, task, developer or agent, and source."],
          ["Context packs", "Prepare compact allowed context for a task so the AI does not read everything."],
          ["Preflight estimates", "Estimate cost before a task or large prompt is run."],
          ["Model routing", "Recommend model class based on risk, complexity, and expected output."],
          ["Waste detection", "Separate accepted work from rejected work, rework, exploration, and untracked usage."]
        ],
        steps: ["Estimate", "Prepare context", "Choose model", "Record usage", "Review output", "Summarize cost"],
        details: [
          ["For solo developers", ["Cost control still matters because session resets and repeated explanations waste time and money.", "Context briefs and task-scoped prompts reduce that waste."]],
          ["For teams", ["Cost by sprint, workstream, assignee, task, and accepted output helps the lead understand ROI.", "Budget approvals prevent silent overuse."]]
        ],
        checklist: ["Pricing rules exist.", "Usage is linked to task or marked untracked.", "Context pack exists for large tasks.", "Accepted/rejected output is tracked.", "Budget approval exists for broad or expensive work."],
        commands: ["node bin/kvdf.js usage summary", "node bin/kvdf.js preflight estimate --task task-001", "node bin/kvdf.js model-route recommend --kind implementation --risk medium"]
      },
      "multi-ai-governance": {
        lead: "Multi-AI Governance controls identities, roles, sessions, locks, tokens, budgets, and final verification when humans and AI agents collaborate.",
        beginner: "Even if you are one developer, Kabeeri can treat you, AI coding assistants, IDE agents, and automation tools as actors whose work should be scoped, auditable, and reviewable.",
        sections: [
          ["Identities", "Developers and AI agents have IDs, roles, capabilities, and workstreams."],
          ["Sessions", "AI work sessions record task, developer or agent, provider, model, files, summary, and outcome."],
          ["Locks", "Prevent overlapping edits across people or agents."],
          ["Conversation relay", "Agents can exchange durable messages, inboxes, replies, and closed threads through repo-backed state in `.kabeeri/multi_ai_communications.json` without depending on the chat transcript."],
          ["Verification rule", "Only the active reviewer or lead can make final verification decisions when final verification is required."],
          ["Audit", "Important actions become audit events so project history survives chat resets."]
        ],
        steps: ["Define lead", "Add developers/agents", "Assign workstreams", "Issue token", "Lock scope", "Record session", "Verify"],
        details: [
          ["Solo mode", ["Solo mode can reduce ceremony while keeping the same state shape.", "This means the project can later grow into team mode without losing governance."]],
          ["Parallel AI", ["Parallel agents should own disjoint scopes and should never silently overwrite each other.", "Kabeeri helps expose conflicts before they become broken code."]]
        ],
        checklist: ["Reviewer is known.", "Developers and agents are identified.", "Assignments are scoped.", "Locks are checked.", "Sessions are recorded.", "Final verification is respected."],
        commands: ["node bin/kvdf.js developer solo --id dev-main --name \"Main Developer\"", "node bin/kvdf.js session start --task task-001 --developer agent-001", "node bin/kvdf.js multi-ai conversation start --from agent-001 --to agent-002 --topic \"Scope\" --message \"Please review the scope\""]
      },
      "github-release": {
        lead: "GitHub and Release Gates help Kabeeri publish or sync only after local truth, policies, security, migrations, and lead decisions are ready.",
        beginner: "GitHub is a collaboration and publishing surface. It should not become the only source of truth for Kabeeri delivery state.",
        sections: [
          ["GitHub sync", "Maps tasks to issues, labels, milestones, and release plans, usually through dry-run first."],
          ["Release readiness", "Checks validation, notes, checklist, policies, security, migrations, blockers, and lead evidence."],
          ["Publish gates", "Separate production-ready from actually published. A project can be deployable but intentionally not public."],
          ["Confirmed writes", "GitHub writes require explicit confirmation and policy gates."],
          ["Packaging", "Product packaging checks ensure the framework can be distributed with the right files after folder reorganization."]
        ],
        steps: ["Validate", "Security", "Migration check", "Policy gate", "Release checklist", "GitHub dry-run", "Confirm write"],
        details: [
          ["Why dry-run matters", ["Dry-run lets the developer inspect labels, issues, milestones, and release changes before touching GitHub.", "This protects the repository from accidental public or team-visible changes."]],
          ["Package readiness", ["After foldering changes, packaging must include `knowledge/`, `packs/`, `plugins/`, `schemas/`, `docs/`, `src/`, `bin/`, and `cli/`.", "Package checks prevent publishing an incomplete framework."]]
        ],
        checklist: ["Validation passed.", "Security state is acceptable.", "Migration risk is reviewed.", "Policy gates pass.", "GitHub write is dry-run first.", "Lead confirmation exists."],
        commands: ["node bin/kvdf.js release check --strict", "node bin/kvdf.js package check", "node bin/kvdf.js github plan --dry-run"]
      },
      "practical-examples": {
        lead: "This page shows seven practical build paths. Each example explains how a developer can use Kabeeri with any AI assistant from idea to handoff without needing deep technical experience first.",
        beginner: "Use these as story-like playbooks. Tell your AI assistant what goal, let Kabeeri choose product blueprint, delivery mode, questions, data design, UI direction, prompt packs, tasks, and dashboard checks, then implement one task at a time.",
        sections: [
          ["1. Full ecommerce website", "Use one product workspace with related apps: backend API, public storefront, admin panel, and possibly worker jobs. Recommended stack: Laravel or NestJS/FastAPI backend, React/Next.js storefront, admin dashboard with React/Mantine/Ant Design. Use Agile for MVP discovery or Structured for a client store with fixed scope. Kabeeri activates commerce, inventory, payments, shipping, coupons, reviews, customers, admin, SEO, security, tests, release gates, AI cost, and GitHub sync."],
          ["2. Personal blog website", "Use a simple content blueprint. Recommended stack: Astro or Next.js with Markdown/MDX, or WordPress if the user wants a CMS. Use Agile for iterative content/design or Structured if a client has approved pages. Kabeeri plans pages, posts, authors, categories, tags, SEO, sitemap, newsletter, comments, analytics, content workflow, UI typography, and deployment readiness."],
          ["3. Dental clinic booking website/system", "Treat it as booking plus service website plus admin panel. Recommended stack: Laravel or Django backend with React/Next.js frontend. Use Structured if the clinic client has strict requirements, or Agile for fast MVP. Kabeeri plans services, dentists, availability, appointments, patient records, reminders, admin calendar, cancellation policy, roles, privacy, notifications, and reports."],
          ["4. Professional CRM", "Treat it as a data-heavy business operations system. Recommended stack: Laravel/NestJS/.NET/FastAPI backend with React, Angular, or Vue admin frontend. Use Structured for enterprise CRM or Agile for startup CRM. Kabeeri plans leads, contacts, companies, deals, pipeline, activities, follow-ups, quotes, permissions, audit, import/export, dashboards, reports, and integrations."],
          ["5. Mobile app for the ecommerce store", "Treat it as a related mobile channel for the ecommerce product, not a separate product. Recommended stack: React Native Expo or Flutter. Use Agile because mobile UX usually evolves through testing. Kabeeri links it to the ecommerce backend and plans onboarding, auth, product feed, search, cart, checkout, orders, push notifications, profile, deep links, offline cache, app versions, analytics, and store release readiness."],
          ["6. Supermarket POS system", "Treat it as a POS operations system with inventory and possibly offline mode. Recommended stack: Laravel/.NET/NestJS backend, React/Vue/Angular POS screen, or Electron/web kiosk if needed. Use Structured for serious retail rollout because devices, shifts, receipts, cash drawer, returns, inventory, and audit are critical. Kabeeri plans cashier flow, barcode, products, prices, taxes, shifts, payments, receipts, offline sales, stock movements, reports, permissions, and security."],
          ["7. WordPress digital agency website", "Use WordPress for a digital marketing agency website with public service pages, blog, case studies, lead forms, and four custom plugins for customers, service requests, invoices, and accounts. Kabeeri keeps each plugin scoped, secure, and task-governed under `wp-content/plugins/`."]
        ],
        steps: ["Describe idea", "Select blueprint", "Choose delivery mode", "Answer questions", "Plan data", "Plan UI", "Select prompt packs", "Create tasks", "AI implements", "Review", "Final verify", "Handoff"],
        details: [
          ["Universal AI flow", ["Tell your AI assistant what product in plain language. AI assistant uses Kabeeri to recommend blueprint, delivery mode, data design, UI direction, framework prompt packs, and first tasks.", "The AI assistant should implement only one governed task at a time, record changed files and evidence, then run validation and tests."]],
          ["Backend planning pattern", ["For every example, define users, roles, entities, APIs, validation, permissions, audit logs, integrations, tests, and release risks before asking AI to code.", "Use `data-design context` to avoid weak database models."]],
          ["Frontend planning pattern", ["For every example, define pages, layouts, components, empty/loading/error states, responsive behavior, accessibility, and SEO/GEO needs if public.", "Use `design recommend` and design source governance before frontend implementation."]],
          ["Handoff pattern", ["Before delivery, run validation, dashboard, readiness report, governance report, security scan, release gates, and handoff package.", "The result should be a project with visible state, not only generated code."]]
        ],
        checklist: ["Each example has a product blueprint.", "Delivery mode is selected.", "Backend and frontend are planned separately.", "Prompt packs match chosen stacks.", "Tasks are scoped before AI edits code.", "Dashboard and final verification close the work."],
        commands: ["node bin/kvdf.js blueprint recommend \"Build a supermarket POS\"", "node bin/kvdf.js questionnaire plan \"Build a dental clinic booking system\"", "node bin/kvdf.js data-design context ecommerce", "node bin/kvdf.js design recommend ecommerce", "node bin/kvdf.js prompt-pack compose react-native-expo --task task-mobile-001", "kvdf wordpress plan \"Build a WordPress digital marketing agency website with services blog case studies and lead forms\" --type corporate --mode new", "node bin/kvdf.js handoff package --id client-handoff --audience client"]
      },
      "example-ecommerce": {
        lead: "This playbook explains how to build a complete ecommerce website with Kabeeri and an AI assistant from idea to handoff. Treat it as one product with related apps: backend API, public storefront, admin dashboard, and optional workers.",
        beginner: "Tell your AI assistant: 'I want to build a complete ecommerce store.' Kabeeri should not jump to code. It first selects the ecommerce blueprint, asks missing questions, designs the data model, chooses frontend/backend stacks, creates tasks, then AI implements one task at a time.",
        sections: [
          ["Product shape", "The product sells products online. It needs customer browsing, product catalog, cart, checkout, payment, shipping, order tracking, admin management, inventory, discounts, returns, emails, SEO, and reporting."],
          ["Recommended stack", "For a professional build: Laravel, NestJS, FastAPI, or Django for backend. Next.js or React for storefront. React with Ant Design, Mantine, or MUI for admin. PostgreSQL or MySQL for database."],
          ["Delivery mode", "Use Agile for MVP stores where catalog, checkout, and UI will evolve. Use Structured when a client has signed requirements, fixed integrations, legal invoices, payment provider rules, and delivery milestones."],
          ["Kabeeri capabilities to activate", "Product Blueprint, App Boundary, Delivery Advisor, Questionnaire Engine, Data Design, UI/UX Advisor, Prompt Packs, Task Governance, Workstreams, AI Cost Control, Live Dashboard, Security, Release Gates, and Handoff."],
          ["App boundaries", "Keep backend API, storefront, admin dashboard, and worker jobs in one Kabeeri workspace if they belong to the same store. Create separate Kabeeri workspaces only for unrelated stores or clients."],
          ["Main workstreams", "backend, database, public_frontend, admin_frontend, integration, qa, security, docs, release."]
        ],
        steps: ["Describe store", "Select ecommerce blueprint", "Choose Agile/Structured", "Answer questions", "Design database", "Plan storefront", "Plan admin", "Create tasks", "AI implements", "Test checkout", "Final verify", "Handoff"],
        details: [
          ["Questions Kabeeri should ask", ["What product types exist: simple, variants, digital, subscriptions, bundles?", "Do you need stock management, low-stock alerts, warehouses, or branches?", "Which payment providers and shipping providers are required?", "Do customers need accounts, guest checkout, coupons, reviews, wishlist, returns, invoices, and order tracking?", "Which languages, currencies, taxes, SEO pages, analytics, and emails are required?"]],
          ["Database plan", ["Core: users, roles, permissions, organizations, settings, files, audit_logs.", "Commerce: customers, products, product_variants, categories, prices, carts, cart_items, orders, order_items, payments, invoices, shipments, coupons, reviews, returns, refunds.", "Inventory: warehouses, stock_movements, stock_balances, stock_reservations.", "Important rule: order_items and invoices must store snapshots so old orders do not change when product prices change."]],
          ["Backend plan", ["Auth, roles, customer accounts, product catalog API, cart API, checkout service, payment webhook, shipping integration, order lifecycle, admin APIs, inventory updates, email notifications, audit logs, import/export, reports.", "Use transactions for checkout, payment, inventory reservation, invoice creation, and audit logging.", "Use idempotency keys for checkout, payment callbacks, webhooks, and order creation."]],
          ["Frontend storefront plan", ["Home, category page, product listing, product details, search, filters, cart drawer, checkout steps, payment result, account, orders, wishlist, returns, FAQ, policy pages.", "Public pages need SEO metadata, Product schema, Breadcrumb schema, optimized images, fast loading, empty states, error states, loading states, and mobile layout."]],
          ["Admin dashboard plan", ["Products table, product form, categories, inventory, orders table, order details, payments, refunds, shipments, coupons, customers, reports, settings, roles, audit logs.", "Use dense operational UI: tables, filters, status badges, bulk actions, drawers, confirmation modals, and export buttons."]],
          ["Task breakdown for AI", ["Task 1: define ecommerce blueprint and answer top questions.", "Task 2: create database migrations and models for products/categories/variants.", "Task 3: create cart and checkout backend.", "Task 4: create storefront product listing and product details.", "Task 5: create admin products table and form.", "Task 6: integrate payment sandbox.", "Task 7: add order lifecycle, emails, and reports.", "Task 8: run tests, security scan, release readiness, and handoff."]],
          ["Acceptance criteria", ["Customer can find product, add to cart, checkout, and see order.", "Admin can create product, update stock, process order, and issue refund.", "Payment webhooks are idempotent.", "Old invoices keep historical product names/prices.", "Storefront passes responsive, SEO, and accessibility checks.", "Dashboard shows task, cost, policy, and release state."]]
        ],
        checklist: ["Ecommerce blueprint selected.", "Apps recorded.", "Payment and shipping rules known.", "Database snapshots planned.", "Checkout transaction safe.", "Storefront and admin separated.", "the AI assistant works task by task.", "Release gates pass."],
        commands: ["node bin/kvdf.js blueprint recommend \"Build a complete ecommerce store with payments shipping admin and SEO\"", "node bin/kvdf.js questionnaire plan \"Build ecommerce store with catalog cart checkout payment shipping admin\"", "node bin/kvdf.js data-design context ecommerce", "node bin/kvdf.js design recommend ecommerce", "node bin/kvdf.js prompt-pack compose laravel --task task-backend-001", "node bin/kvdf.js prompt-pack compose react --task task-storefront-001"]
      },
      "example-ai-team-ecommerce": {
        lead: "This playbook explains how one team lead can coordinate three AI developers building one ecommerce product: one backend AI developer, one web storefront AI developer, and one mobile app AI developer.",
        beginner: "The improved scenario is not three AIs freely editing the same project. The safe scenario is one product workspace, one team lead, three registered AI agents, separate app boundaries, separate workstreams, scoped tasks, locks, tokens, handoff evidence, then integration tasks to join everything.",
        sections: [
          ["Recommended structure", "Treat the store as one product with related apps: `store-api`, `storefront-web`, `store-mobile`, and optional `admin-dashboard` or workers. The backend AI owns APIs and database changes. The web AI owns public storefront pages. The mobile AI owns Expo/Flutter screens and mobile integration. The team lead owns planning, approvals, task splitting, integration decisions, policy gates, and final verification."],
          ["Team lead role", "The lead is the human developer or technical reviewer. The lead selects the product blueprint, chooses Agile or Structured, answers or approves questionnaire decisions, creates apps/workstreams, assigns tasks, issues tokens, reviews outputs, resolves conflicts, and decides when work is integrated."],
          ["Backend AI role", "The backend AI works only on API, database, auth, products, cart, checkout, orders, payments, inventory, webhooks, tests, and backend docs. It must publish API contracts before web/mobile consume them."],
          ["Web AI role", "The web AI works only on public ecommerce storefront: home, categories, product list, product detail, search, filters, cart drawer, checkout UI, account/order pages, SEO, responsive states, and web tests."],
          ["Mobile AI role", "The mobile AI works only on the mobile channel: onboarding, auth, product feed, search, product detail, cart, checkout integration, orders, profile, push token registration, offline/error states, and device testing."],
          ["How tasks move", "Tasks do not move by chat memory. A task is created, assigned, scoped, tokenized, locked, implemented, ended with evidence, reviewed, and then either verified or rejected. Cross-team work becomes an integration task owned by the lead or explicitly assigned as `type=integration`."],
          ["How the store is finished", "The store is not finished when three agents say done. It is finished when backend contracts are stable, web and mobile flows pass against the same backend, payment and order lifecycle are tested, policy/security/readiness gates pass, final verification is recorded, and a handoff package exists."]
        ],
        steps: ["Create product workspace", "Register apps", "Register AI agents", "Create workstreams", "Plan API contracts", "Split tasks", "Issue tokens and locks", "Backend builds contracts", "Web and mobile consume contracts", "Run integration tasks", "Review evidence", "Final verify", "Handoff"],
        details: [
          ["Permissions model", ["The project lead can create apps, add agents, assign tasks, issue/revoke tokens, approve budget overruns, run policy gates, and verify final work.", "Backend AI can only work inside backend/database/API scopes assigned to its task.", "Web AI can only work inside storefront web paths assigned to public_frontend tasks.", "Mobile AI can only work inside mobile app paths assigned to mobile tasks.", "No AI agent should have elevated authority. If an AI needs broader scope, the lead creates a new integration task with explicit allowed files."]],
          ["Suggested apps", ["`store-api`: backend API and admin/API services.", "`storefront-web`: public web storefront.", "`store-mobile`: customer mobile app.", "`admin-dashboard`: optional admin panel if separated from backend.", "All apps can stay in one Kabeeri workspace because they are one ecommerce product. A separate unrelated store should use a separate Kabeeri folder."]],
          ["Task exchange rules", ["Backend AI does not hand files directly to the web/mobile AI. It hands over API contracts, endpoint notes, changed files, tests, and risks through session summary, capture, ADR if needed, and task evidence.", "Web/mobile AIs do not change backend code when an endpoint is missing. They create or request a backend task.", "Shared decisions such as auth strategy, cart sync, payment redirect, and order status naming should become ADRs or approved task notes.", "If web and mobile need the same API shape, the lead creates one contract task before UI tasks proceed."]],
          ["Per-agent handoff", ["Each AI session must end with changed files, checks run, summary, risks, and what remains blocked.", "Backend handoff must include endpoints, migrations, seed data, auth rules, idempotency/webhook notes, and tests.", "Web handoff must include pages/screens completed, API dependencies, responsive states, SEO/accessibility notes, and tests.", "Mobile handoff must include screens completed, API dependencies, device/platform notes, permissions, offline/error states, and release blockers."]],
          ["Integration plan", ["Integration Task 1: backend publishes product/catalog/cart/order API contracts.", "Integration Task 2: web storefront consumes API and validates cart/checkout/order flows.", "Integration Task 3: mobile app consumes same API and validates auth/product/cart/order flows.", "Integration Task 4: payment/order lifecycle tested end-to-end.", "Integration Task 5: readiness report, governance report, security scan, dashboard export, and handoff package."]],
          ["Conflict prevention", ["Use app boundaries so mobile cannot edit storefront and storefront cannot edit backend.", "Use workstreams so backend/database/public_frontend/mobile/security are explicit.", "Use locks before AI starts editing shared files.", "Use task access tokens so each AI has allowed_files and forbidden_files.", "Use policy gates before final verification or release."]],
          ["Common failure modes", ["All agents start coding before API contracts exist.", "Frontend agents invent mock data that does not match backend responses.", "Mobile app becomes a second product instead of a channel for the same store.", "The lead accepts separate demos but never tests the full checkout/order lifecycle.", "One agent edits shared config or auth files without an integration task."]]
        ],
        checklist: ["One ecommerce product workspace exists.", "Apps are registered with stable usernames.", "Backend, web, and mobile agents are registered.", "Each task has one responsible party, app scope, workstream, allowed files, and acceptance criteria.", "API contracts exist before frontend implementation depends on them.", "Integration tasks join backend, web, and mobile work.", "Each AI submits evidence and risks.", "Lead reviews, final verification passes, gates pass, handoff package is generated."],
        commands: ["node bin/kvdf.js init --profile standard --mode agile", "node bin/kvdf.js app create --username store-api --name \"Store API\" --type backend --path apps/api --product Store", "node bin/kvdf.js app create --username storefront-web --name \"Storefront Web\" --type frontend --path apps/web --product Store", "node bin/kvdf.js app create --username store-mobile --name \"Store Mobile\" --type mobile --path apps/mobile --product Store", "node bin/kvdf.js agent add --id ai-backend --name \"AI Backend Developer\" --role \"AI Developer\" --workstreams backend,database,integration", "node bin/kvdf.js agent add --id ai-web --name \"AI Web Frontend Developer\" --role \"AI Developer\" --workstreams public_frontend", "node bin/kvdf.js agent add --id ai-mobile --name \"AI Mobile Developer\" --role \"AI Developer\" --workstreams mobile,integration", "node bin/kvdf.js task create --title \"Define ecommerce API contracts\" --app store-api --workstream backend", "node bin/kvdf.js task create --title \"Build storefront product listing\" --app storefront-web --workstream public_frontend", "node bin/kvdf.js task create --title \"Build mobile product feed\" --app store-mobile --workstream mobile", "node bin/kvdf.js task create --title \"Integrate checkout across API web and mobile\" --type integration --apps store-api,storefront-web,store-mobile --workstreams backend,public_frontend,mobile,integration", "node bin/kvdf.js token issue --task task-001 --assignee ai-backend", "node bin/kvdf.js lock create --type folder --scope apps/api --task task-001 --owner ai-backend", "node bin/kvdf.js session start --task task-001 --developer ai-backend", "node bin/kvdf.js session end session-001 --input-tokens 1000 --output-tokens 500 --files apps/api --summary \"API contracts implemented\" --checks \"npm test\" --risks \"Payment sandbox not connected\"", "node bin/kvdf.js readiness report", "node bin/kvdf.js governance report", "node bin/kvdf.js handoff package --id ecommerce-team-handoff --audience team"]
      },
      "example-blog": {
        lead: "This playbook explains how to build a personal blog with Kabeeri and an AI assistant. The goal is not only pages; it is a maintainable content system with SEO, clean reading experience, and simple publishing flow.",
        beginner: "Tell your AI assistant: 'I want a personal blog.' Kabeeri should discover whether it is a static blog, CMS-backed blog, portfolio blog, newsletter blog, or paid-content blog before code starts.",
        sections: [
          ["Product shape", "A personal blog publishes articles, author profile, categories, tags, search, newsletter, SEO pages, about/contact pages, and maybe comments or paid content."],
          ["Recommended stack", "Astro or Next.js with Markdown/MDX for a fast personal blog. WordPress if the client wants a classic CMS. Strapi or headless CMS if content should be managed separately."],
          ["Delivery mode", "Use Agile for personal iteration and content growth. Use Structured if it is for a client with approved pages, brand rules, and SEO deliverables."],
          ["Kabeeri capabilities to activate", "Product Blueprint, Questionnaire Engine, UI/UX Advisor, Design Governance, Prompt Packs, Task Governance, SEO/GEO, Release Gates, Dashboard, and Handoff."],
          ["Main workstreams", "public_frontend, content, design, seo, qa, docs, release."],
          ["Success definition", "A reader can discover posts, read comfortably on mobile, find topics, subscribe, and search engines can understand the content."]
        ],
        steps: ["Describe blog", "Choose static/CMS", "Answer content questions", "Plan pages", "Plan content model", "Create tasks", "AI builds", "Review SEO", "Publish"],
        details: [
          ["Questions Kabeeri should ask", ["What is the blog topic and audience?", "Static files or CMS?", "Arabic, English, or both?", "Do you need newsletter, comments, author bio, tags, search, related posts, or paid content?", "What SEO goals exist: articles, topic clusters, schema, sitemap, RSS, social sharing?"]],
          ["Data/content plan", ["For static: posts with title, slug, date, updated date, summary, tags, category, cover image, author, SEO fields.", "For CMS: posts, authors, categories, tags, media, comments, subscribers, redirects, SEO metadata.", "For bilingual: translations or localized routes must be planned early."]],
          ["Frontend plan", ["Home, post list, category page, tag page, article page, about, contact, newsletter, search, archive, privacy.", "Article page needs H1/H2 structure, table of contents, reading time, author, date, last updated, related posts, share links, and clean typography."]],
          ["AI task breakdown", ["Task 1: select blog blueprint and content model.", "Task 2: implement layout, navigation, and theme tokens.", "Task 3: implement article listing and article page.", "Task 4: add SEO metadata, sitemap, RSS, and schema.", "Task 5: add search/newsletter/comments if required.", "Task 6: run performance and accessibility review."]],
          ["Acceptance criteria", ["A new article can be added safely.", "Pages are responsive and readable.", "SEO metadata and sitemap are generated.", "Arabic/English direction works if bilingual.", "Performance is acceptable.", "Handoff explains how to publish new posts."]]
        ],
        checklist: ["Content source selected.", "Post model defined.", "Typography and layout approved.", "SEO/GEO rules included.", "Publishing workflow documented.", "Performance checked."],
        commands: ["node bin/kvdf.js blueprint recommend \"Build a personal blog with SEO newsletter and articles\"", "node bin/kvdf.js questionnaire plan \"Personal blog with articles tags categories and newsletter\"", "node bin/kvdf.js design recommend blog_website", "node bin/kvdf.js prompt-pack compose astro --task task-blog-001"]
      },
      "example-wordpress-digital-agency": {
        lead: "This playbook explains how to build a WordPress website for a digital marketing agency and extend it with four custom plugins for accounts, invoices, customers, and service requests.",
        beginner: "Tell your AI assistant: 'I want a WordPress website for a digital marketing agency with client accounts, invoices, customers, and service requests.' Kabeeri should treat the public site as WordPress content, and the four business modules as governed plugins under `wp-content/plugins/`.",
        sections: [
          ["Product shape", "A public marketing website that sells services such as SEO, ads management, social media, content marketing, branding, landing pages, analytics, and consultation. Behind it, the agency needs a lightweight client operations layer."],
          ["Recommended WordPress approach", "Use WordPress for the public website, blog, case studies, landing pages, service pages, forms, SEO/GEO content, and CMS editing. Use custom plugins for business behavior that should survive theme changes."],
          ["Delivery mode", "Use Structured if this is a client website with approved pages, service packages, invoice rules, and handoff requirements. Use Agile if the agency is still discovering offers, funnels, and client portal behavior."],
          ["Kabeeri capabilities to activate", "WordPress Development, WordPress Plugin Development, Product Blueprints, Questionnaire Engine, Data Design, UI/UX Advisor, Prompt Packs, Task Governance, Security, Dashboard, Handoff, and Release Gates."],
          ["App boundary", "This is one product workspace: public WordPress site plus four related plugins. Do not split each plugin into an unrelated Kabeeri folder unless it becomes a separately sold product."],
          ["Success definition", "Visitors can understand services and request work. Agency staff can manage customers, accounts, invoices, and service requests from WordPress admin with safe permissions and clear handoff."]
        ],
        steps: ["Plan WordPress site", "Analyze services", "Choose theme route", "Plan four plugins", "Scaffold plugins", "Create tasks", "Compose WordPress prompts", "Implement one plugin at a time", "Integrate admin flows", "Review security", "Prepare handoff"],
        details: [
          ["Public website pages", ["Home: clear offer, services, proof, case studies, call to action.", "Services: SEO, paid ads, social media, content, email marketing, branding, website/landing pages, analytics.", "Case studies: problem, work done, results, metrics, client quote.", "Blog/resources: SEO articles, campaign guides, marketing checklists, FAQs.", "Contact/request page: lead form connected to service requests plugin.", "Policy pages: privacy, terms, refund/payment policy if invoices are used."]],
          ["Content model", ["Use pages for static service pages.", "Use posts for blog/resources.", "Use custom post types only when needed: case_study, service_package, testimonial, faq.", "Use categories/tags for content clusters: SEO, Ads, Social Media, Content, Analytics, Branding.", "Use schema and FAQ blocks for SEO/GEO, especially on service pages."]],
          ["Plugin 1: Accounts Management", ["Purpose: manage agency internal accounts, financial accounts, service packages, balances, and account notes.", "Suggested slug: `agency-accounts`.", "Plugin type: `business`.", "Core records: accounts, account types, balances, account notes, status history.", "Admin screens: accounts list, account detail, account settings.", "Rules: only managers/accountants can update balances; changes need audit notes; do not mix this with WordPress users table except by reference."]],
          ["Plugin 2: Invoices Management", ["Purpose: create invoices for marketing services, retainers, campaigns, setup fees, and add-ons.", "Suggested slug: `agency-invoices`.", "Plugin type: `business`.", "Core records: invoices, invoice_items, payments, payment_methods, tax/discount snapshots, invoice status history.", "Admin screens: invoice list, create invoice, invoice detail, payment recording, PDF/export later if needed.", "Rules: store money as decimal/cents, snapshot customer and service names, never delete paid invoices, support draft/sent/paid/overdue/cancelled."]],
          ["Plugin 3: Customers Management", ["Purpose: manage client companies and contacts independently from WordPress users.", "Suggested slug: `agency-customers`.", "Plugin type: `business` or `cpt` depending on scale.", "Core records: customers, contacts, company profile, billing details, assigned account manager, activity timeline.", "Admin screens: customers table, customer detail, contacts, notes, related invoices and requests.", "Rules: a customer may or may not have a WordPress user login; keep PII access controlled; record important changes."]],
          ["Plugin 4: Service Requests", ["Purpose: convert website forms into structured service requests that the agency can review, quote, approve, and deliver.", "Suggested slug: `agency-service-requests`.", "Plugin type: `business`.", "Core records: service_requests, requested_services, attachments, request_status_history, quotes or links to invoices.", "Admin screens: request inbox, request detail, status updates, assignment, conversion to customer/invoice.", "Public surface: shortcode/block form on service pages.", "Rules: nonce on public forms, sanitize all fields, file upload restrictions, statuses like new/reviewing/quoted/approved/in_progress/completed/rejected."]],
          ["How the four plugins integrate", ["Customers plugin is the central client record.", "Service Requests can create or link to a customer.", "Invoices link to customers and may link to service requests.", "Accounts can summarize balances and financial notes, but invoice payment remains the source of invoice truth.", "Integrations between plugins should use WordPress hooks/actions and explicit admin links, not direct random file edits across plugins."]],
          ["Data design warning", ["Do not store all business records in one `wp_options` JSON blob.", "For serious operations, use custom database tables or carefully designed CPT/meta depending on scale.", "Invoices and payments need stronger integrity than normal content posts.", "Use activation routines carefully and document rollback."]],
          ["Suggested implementation order", ["Task 1: WordPress site plan and service page map.", "Task 2: `agency-customers` plugin plan/scaffold/tasks.", "Task 3: `agency-service-requests` plugin plan/scaffold/tasks and public form.", "Task 4: `agency-invoices` plugin plan/scaffold/tasks.", "Task 5: `agency-accounts` plugin plan/scaffold/tasks.", "Task 6: integration task linking customers, requests, invoices, and accounts.", "Task 7: security, permissions, validation, dashboard, and handoff."]],
          ["Acceptance criteria", ["Public visitor can submit a service request from a service page.", "Admin can review request and link it to a customer.", "Admin can create invoice for that customer/request.", "Payment/status changes are recorded safely.", "Accounts summary does not corrupt invoice history.", "Plugins do not edit WordPress core or each other's files outside governed tasks.", "Handoff explains installation, activation order, admin roles, rollback, and test data."]]
        ],
        checklist: ["WordPress site plan exists.", "Four plugin plans exist.", "Each plugin has its own slug and folder.", "Tasks include allowed/forbidden files.", "Customers are separated from WordPress users.", "Invoices use snapshots and safe money handling.", "Service request forms use nonces and sanitization.", "Plugin integrations are explicit.", "Security and handoff are complete."],
        commands: ["kvdf wordpress plan \"Build a WordPress digital marketing agency website with services blog case studies and lead forms\" --type corporate --mode new", "kvdf wordpress tasks", "kvdf wordpress plugin plan \"Manage digital agency customers and contacts\" --name \"Agency Customers\" --type business", "kvdf wordpress plugin scaffold --name \"Agency Customers\"", "kvdf wordpress plugin tasks", "kvdf wordpress plugin plan \"Manage service requests from public WordPress forms\" --name \"Agency Service Requests\" --type business", "kvdf wordpress plugin scaffold --name \"Agency Service Requests\"", "kvdf wordpress plugin plan \"Manage invoices for agency services retainers and campaigns\" --name \"Agency Invoices\" --type business", "kvdf wordpress plugin scaffold --name \"Agency Invoices\"", "kvdf wordpress plugin plan \"Manage agency accounts balances and account notes\" --name \"Agency Accounts\" --type business", "kvdf wordpress plugin scaffold --name \"Agency Accounts\"", "kvdf prompt-pack compose wordpress --task task-001"]
      },
      "example-dental-clinic": {
        lead: "This playbook explains how to build a dental clinic website and booking system. It combines a public service website, appointment booking, clinic admin, reminders, and patient-safe data handling.",
        beginner: "Tell your AI assistant: 'I want a dental clinic booking system.' Kabeeri should treat it as healthcare-adjacent software: appointments and personal data need clear rules, not random CRUD.",
        sections: [
          ["Product shape", "Public website for clinic services plus booking flow for patients plus admin calendar for dentists and staff."],
          ["Recommended stack", "Laravel, Django, or NestJS backend; React or Next.js frontend; PostgreSQL/MySQL database; calendar UI for admin."],
          ["Delivery mode", "Use Structured if clinic requirements, privacy, and appointment policies are strict. Use Agile for a simple MVP clinic site with booking."],
          ["Kabeeri capabilities to activate", "Booking Product Blueprint, Data Design, UI/UX Advisor, App Boundary, Workstreams, Security, Task Governance, Dashboard, Notifications, Release Gates."],
          ["Main workstreams", "backend, database, public_frontend, admin_frontend, integration, security, qa, docs."],
          ["Success definition", "A patient can request/book an appointment, the clinic can manage availability, staff can confirm/cancel/reschedule, and reminders are sent safely."]
        ],
        steps: ["Define clinic services", "Plan booking rules", "Design data", "Plan public site", "Plan admin calendar", "Create tasks", "AI implements", "Test booking conflicts", "Final verify"],
        details: [
          ["Questions Kabeeri should ask", ["How many doctors and branches?", "What services exist and how long does each take?", "Can patients choose doctor or only service?", "Are appointments confirmed immediately or pending approval?", "What cancellation/no-show policy exists?", "What reminders are needed: email, SMS, WhatsApp, push?", "What patient data is sensitive and who can access it?"]],
          ["Database plan", ["Core: users, roles, permissions, audit_logs, settings.", "Clinic: dentists, services, staff_availability, appointments, patients, appointment_status_history, reminders, branches, rooms, cancellations.", "Optional: treatment categories, files, notes, payments, invoices, insurance fields depending on scope.", "Important rule: appointment start_at and end_at are required; date only is not enough. Prevent overlapping bookings."]],
          ["Backend plan", ["Availability service, appointment creation, conflict detection, status transitions, reminders, admin calendar API, patient profile API, cancellation/reschedule rules, audit logging.", "Use transactions around booking confirmation and slot reservation.", "Use timezone carefully if clinics or patients are in different regions."]],
          ["Frontend plan", ["Public pages: home, services, dentists, booking, contact, FAQ, policies.", "Booking flow: choose service, choose dentist/any dentist, choose time, enter patient info, confirm, receive result.", "Admin: calendar, appointments table, patient detail, service settings, staff availability, reminders, reports."]],
          ["AI task breakdown", ["Task 1: define booking rules and clinic data model.", "Task 2: create appointments and availability backend.", "Task 3: build public booking flow.", "Task 4: build admin calendar and appointment management.", "Task 5: add reminders and audit.", "Task 6: test overlapping bookings and edge cases."]],
          ["Acceptance criteria", ["Two patients cannot book the same doctor and time.", "Admin can confirm, cancel, and reschedule.", "Patient sees clear success/error states.", "Reminders are recorded.", "Sensitive data is access-controlled.", "Dashboard and handoff show readiness."]]
        ],
        checklist: ["Booking rules defined.", "Availability modeled.", "Overlap prevention implemented.", "Public and admin flows planned.", "Privacy and audit included.", "Reminders tested."],
        commands: ["node bin/kvdf.js blueprint recommend \"Dental clinic appointment booking website with admin calendar\"", "node bin/kvdf.js questionnaire plan \"Dental clinic booking system with dentists services patients reminders\"", "node bin/kvdf.js data-design context booking_appointment", "node bin/kvdf.js design recommend booking_system"]
      },
      "example-crm": {
        lead: "This playbook explains how to build a professional CRM with Kabeeri and an AI assistant. A CRM is not just contacts; it is a sales operating system with roles, pipeline, activities, reporting, and audit.",
        beginner: "Tell your AI assistant: 'I want a professional CRM.' Kabeeri should plan it as a data-heavy business application, choose a dashboard-first UI, define permissions, and split backend/admin work clearly.",
        sections: [
          ["Product shape", "CRM manages leads, contacts, companies, deals, pipeline stages, activities, follow-ups, notes, files, quotes, tasks, reports, import/export, and permissions."],
          ["Recommended stack", "Laravel, NestJS, .NET, Django, or FastAPI backend; React, Angular, or Vue admin frontend; PostgreSQL/MySQL database. Use TanStack Table, Ant Design, MUI, Mantine, or PrimeReact for data-heavy UI."],
          ["Delivery mode", "Use Structured for enterprise CRM with fixed sales process and approvals. Use Agile for startup CRM where pipeline and reports evolve."],
          ["Kabeeri capabilities to activate", "CRM Product Blueprint, Structured/Agile Advisor, Data Design, UI/UX Advisor, Workstreams, Task Governance, AI Cost Control, Dashboard, Import/Export, Security, Audit, Handoff."],
          ["Main workstreams", "backend, database, admin_frontend, integration, qa, security, docs, reporting."],
          ["Success definition", "Sales team can track leads through pipeline, record activities, search/filter data, follow up, and managers can see reliable reports."]
        ],
        steps: ["Define sales process", "Choose delivery mode", "Design entities", "Plan permissions", "Plan dashboard UI", "Create tasks", "AI implements", "Import sample data", "Review reports", "Handoff"],
        details: [
          ["Questions Kabeeri should ask", ["What sales stages exist?", "Who uses the CRM: sales reps, managers, support, admin?", "Are leads assigned manually or automatically?", "Do you need quotes, tasks, reminders, email integration, import/export, custom fields, or dashboards?", "What reports matter: pipeline value, forecast, rep performance, conversion rate, activity count?"]],
          ["Database plan", ["Core: users, roles, permissions, audit_logs, settings.", "CRM: leads, contacts, companies/accounts, deals, deal_stages, activities, notes, tasks, reminders, quotes, files, pipelines, assignments, custom_fields.", "Reporting: pipeline_summary, activity_summary, rep_performance, conversion_metrics if needed.", "Important rule: do not put everything in a generic records table unless the project is explicitly building a low-code CRM."]],
          ["Backend plan", ["Lead CRUD, contact/company relations, deal pipeline service, activity timeline, assignment rules, reminders, search/filter, import jobs, export, audit logs, permissions, reports.", "Use pagination and indexes early because CRM tables grow quickly.", "Use activity_logs for operational timeline and audit_logs for sensitive changes."]],
          ["Frontend plan", ["Dashboard, leads table, deal pipeline board, contact details, company profile, activity timeline, tasks/reminders, reports, import/export, settings, users/roles.", "Use dense UI: filters, saved views, column visibility, bulk actions, status badges, drawers, keyboard-friendly navigation."]],
          ["AI task breakdown", ["Task 1: define CRM pipeline and entities.", "Task 2: implement leads/contacts/companies backend.", "Task 3: implement deals and pipeline stages.", "Task 4: build admin table and pipeline UI.", "Task 5: implement activity timeline and reminders.", "Task 6: add import/export and reports.", "Task 7: security, audit, tests, handoff."]],
          ["Acceptance criteria", ["Sales rep can create and manage leads.", "Deal moves through allowed stages.", "Manager can filter pipeline and view report.", "Permissions restrict sensitive data.", "Import job records row errors.", "Dashboard reflects task and release readiness."]]
        ],
        checklist: ["Sales process defined.", "Permissions matrix planned.", "Pipeline entities modeled.", "Tables and filters planned.", "Reports specified.", "Audit and import/export included."],
        commands: ["node bin/kvdf.js blueprint recommend \"Professional CRM with leads contacts deals pipeline reports\"", "node bin/kvdf.js questionnaire plan \"CRM with sales pipeline activities import export and reporting\"", "node bin/kvdf.js data-design context crm", "node bin/kvdf.js design recommend crm"]
      },
      "example-mobile-commerce": {
        lead: "This playbook explains how to build a mobile app for the ecommerce store. It should be treated as a related channel of the same ecommerce product, not a separate unrelated application.",
        beginner: "Tell your AI assistant: 'I want a mobile app for the ecommerce store.' Kabeeri should link it to the existing ecommerce backend, activate mobile-specific questions, and plan app screens, API contracts, push notifications, offline cache, and store release requirements.",
        sections: [
          ["Product shape", "Customer mobile app for browsing products, search, cart, checkout, order tracking, notifications, profile, wishlist, support, and promotions."],
          ["Recommended stack", "React Native Expo for fast cross-platform delivery, or Flutter if the team prefers Dart. Backend remains the ecommerce backend."],
          ["Delivery mode", "Use Agile because mobile experience usually needs iteration, device testing, and feedback. Use Structured only when app store scope and API contracts are fixed for a client."],
          ["Kabeeri capabilities to activate", "App Boundary, Ecommerce Blueprint, Mobile Prompt Pack, Data Design, UI/UX Advisor, API Integration, AI Cost Control, Dashboard, Security, Release Gates."],
          ["Main workstreams", "mobile, backend, integration, qa, security, release, docs."],
          ["Success definition", "The app uses the same product/order backend, supports secure login, renders product data well, handles checkout safely, and is ready for store submission checks."]
        ],
        steps: ["Link to ecommerce product", "Confirm mobile stack", "Define screens", "Confirm APIs", "Plan auth/storage", "Create mobile tasks", "AI implements", "Device test", "Release checklist"],
        details: [
          ["Questions Kabeeri should ask", ["Will the app use existing customer accounts?", "Which checkout path: in-app checkout, web checkout, or external payment redirect?", "Do you need push notifications, deep links, offline cache, biometric login, dark mode, Arabic/English, analytics, crash reporting?", "Which API endpoints already exist and which are missing?"]],
          ["Mobile data/API plan", ["The mobile app should not duplicate ecommerce data model. It consumes APIs for products, categories, cart, checkout, orders, profile, wishlist, notifications.", "Mobile-specific tables may include devices, push_tokens, app_sessions, app_versions, user_preferences, deep_links, crash_logs.", "Secure storage is needed for tokens; payment card data should not be stored in the app."]],
          ["Mobile UI plan", ["Onboarding, login/register, home feed, categories, search, product details, cart, checkout, payment result, orders, order detail, wishlist, profile, settings, support.", "Each screen needs loading, empty, error, offline, success states, and touch-friendly layout."]],
          ["Backend integration plan", ["Confirm API response shapes, authentication, pagination, cart sync, order status, push notification events, app version/force update endpoint.", "If backend APIs are missing, create backend tasks before mobile tasks."]],
          ["AI task breakdown", ["Task 1: create mobile app shell and navigation.", "Task 2: connect auth and secure storage.", "Task 3: product feed/search/product details.", "Task 4: cart and checkout integration.", "Task 5: orders/profile/notifications.", "Task 6: offline/error states and store readiness.", "Task 7: final device QA and handoff."]],
          ["Acceptance criteria", ["App logs in securely.", "Product list and details render from API.", "Cart and checkout behave safely.", "Order tracking is clear.", "Push token registration works if enabled.", "App handles offline and errors gracefully.", "Store release checklist exists."]]
        ],
        checklist: ["Mobile app linked to ecommerce product.", "API contracts known.", "React Native Expo or Flutter selected.", "Screens mapped.", "Push/offline/versioning planned.", "Device QA included."],
        commands: ["node bin/kvdf.js app create --username store-mobile --name \"Store Mobile App\" --type mobile --path apps/mobile --product Store", "node bin/kvdf.js questionnaire plan \"Mobile app for ecommerce store with checkout orders and push notifications\"", "node bin/kvdf.js design recommend ecommerce", "node bin/kvdf.js prompt-pack compose react-native-expo --task task-mobile-001"]
      },
      "example-pos": {
        lead: "This playbook explains how to build a professional supermarket POS. POS is operational software: speed, offline behavior, inventory correctness, receipts, shifts, and audit are more important than decorative UI.",
        beginner: "Tell your AI assistant: 'I want a supermarket POS.' Kabeeri should treat it as a serious business operations system with cashier screen, product barcode, payments, returns, shifts, cash drawer, inventory, reports, and permissions.",
        sections: [
          ["Product shape", "POS for supermarket sales: cashier screen, barcode scanning, cart, discounts, taxes, payments, receipt printing, returns, shifts, cash drawer, products, inventory, reports, users, permissions."],
          ["Recommended stack", "Laravel, .NET, or NestJS backend; React/Vue/Angular POS frontend; PostgreSQL/MySQL database. If desktop hardware access is needed, consider Electron or a local bridge later."],
          ["Delivery mode", "Use Structured for professional supermarket rollout because POS affects money, inventory, staff, receipts, and daily operations. Agile can be used inside phases for UI iteration."],
          ["Kabeeri capabilities to activate", "POS Product Blueprint, Structured Delivery, Data Design, UI/UX Advisor, App Boundary, Workstreams, Security, Audit, Migration Safety, Dashboard, Release Gates."],
          ["Main workstreams", "backend, database, admin_frontend, pos_frontend or public_frontend, integration, qa, security, docs, release."],
          ["Success definition", "Cashier can sell quickly, receipt is correct, stock changes correctly, returns are controlled, shifts close accurately, and managers can audit sales."]
        ],
        steps: ["Define store operations", "Choose Structured", "Design POS data", "Plan cashier UI", "Plan admin", "Create phase tasks", "AI implements", "Test sales/returns/offline", "Final verify"],
        details: [
          ["Questions Kabeeri should ask", ["How many branches and registers?", "Do products use barcode, SKU, variants, units, weighted items?", "Which payment types: cash, card, split payment, wallet?", "Do you need receipt printer, cash drawer, barcode scanner, customer display?", "Is offline selling required?", "How are returns, discounts, taxes, and shift closing handled?"]],
          ["Database plan", ["Core: users, roles, permissions, branches, settings, audit_logs.", "POS: pos_devices, pos_sessions, cash_drawers, sales, sale_items, payments, returns, receipts.", "Inventory: products, barcodes, categories, stock_movements, stock_balances, warehouses, adjustments.", "Important rule: stock changes must be movements, not direct edits. Sales and receipts need snapshots."]],
          ["Backend plan", ["Product lookup by barcode, fast sale creation, payment recording, receipt generation, stock movement, return workflow, shift open/close, cash reconciliation, audit logs, reports.", "Use transactions for sale + payment + stock + receipt.", "Offline mode needs local sale IDs and sync conflict strategy."]],
          ["POS frontend plan", ["Large fast search/barcode input, cart, quantity controls, discount controls, payment panel, receipt preview, return flow, shift status, offline indicator, keyboard shortcuts.", "The POS screen should be stable and fast; no layout shifts during scanning."]],
          ["Admin frontend plan", ["Products, prices, categories, inventory, shifts, sales reports, users/roles, taxes, settings, devices, audit logs.", "Managers need filters, exports, daily summaries, low stock, cashier performance, and branch performance."]],
          ["AI task breakdown", ["Task 1: define POS operations and data model.", "Task 2: implement products/barcode and inventory movements.", "Task 3: implement sale transaction and receipt snapshot.", "Task 4: build cashier screen.", "Task 5: implement shifts and cash drawer.", "Task 6: implement returns and reports.", "Task 7: hardware/offline strategy if needed.", "Task 8: security, tests, release, handoff."]],
          ["Acceptance criteria", ["Barcode adds item quickly.", "Sale creates payment, receipt, and stock movement in one safe transaction.", "Return cannot corrupt inventory.", "Shift close shows expected vs actual cash.", "Manager can audit cashier activity.", "Offline requirements are either implemented or explicitly deferred."]]
        ],
        checklist: ["Structured delivery selected or justified.", "Cashier workflow defined.", "Inventory movements designed.", "Receipt snapshots planned.", "Shift closing planned.", "Offline/hardware needs clarified.", "Reports and audit included."],
        commands: ["node bin/kvdf.js blueprint recommend \"Professional supermarket POS with barcode inventory shifts receipts\"", "node bin/kvdf.js delivery recommend \"Supermarket POS with cash drawer receipts inventory and offline mode\"", "node bin/kvdf.js questionnaire plan \"Supermarket POS with barcode payments shifts inventory and reports\"", "node bin/kvdf.js data-design context pos", "node bin/kvdf.js design recommend pos"]
      },
      "troubleshooting": {
        lead: "Troubleshooting in Kabeeri starts from source-of-truth state, not guesses. Fix the record or implementation that actually causes the failure, then validate again.",
        beginner: "When something looks wrong, ask: is the problem in `.kabeeri/` state, source docs, schemas, moved paths, CLI implementation, generated dashboard JSON, or the application code?",
        sections: [
          ["Validation fails", "Read the exact failing file, schema, command, or governance rule. Fix that source before continuing."],
          ["Docs path looks old", "Remember legacy aliases exist. New physical paths should be used in docs and new files, but old command outputs may still display compatible aliases."],
          ["Dashboard looks stale", "Regenerate or export dashboard state from `.kabeeri/` instead of editing UI output manually."],
          ["AI changed too much", "Use task scope, locks, token allowed files, and post-work capture to classify and control the changes."],
          ["Release blocked", "Check policy results, security scan, migration state, unresolved blockers, and lead evidence."]
        ],
        steps: ["Run validate", "Find source", "Fix source", "Regenerate derived output", "Run tests", "Validate again"],
        details: [
          ["After folder reorganization", ["If a command uses an old path, first check whether it is a compatibility alias. The physical file may now be under `knowledge/`, `packs/`, or `plugins/`.", "Do not recreate old root folders just to satisfy a stale reference. Update the reference or asset alias."]],
          ["After a broken AI session", ["Capture changed files, compare them to the task scope, reject or split out unrelated edits, then create follow-up tasks.", "This preserves useful work without accepting unsafe drift."]]
        ],
        checklist: ["Failure source identified.", "No manual dashboard-only fix.", "No old root folder recreated accidentally.", "Validation rerun.", "Tests rerun when code changed."],
        commands: ["node bin/kvdf.js validate", "npm test", "node bin/kvdf.js structure validate --json"]
      }
    }
  },
  ar: {
    ui: {
      eyebrow: "*H+JB Kabeeri VDF",
      beginner: "41- E(37",
      guide: "/DJD 'DE7H1",
      steps: ".'17) 'D71JB 'DEB*1-)",
      checklist: "B'&E) 'D,'G2J)",
      commands: "#H'E1 EAJ/)",
      details: "*A'5JD 9EJB)",
      mistakes: "3JF'1JHG'* A4D 4'&9)",
      source: "E5/1 'D-BJB)",
      search: "'(-+ AJ 'D/DJD",
      filter: "*5AJ)"
    },
    pages: {
      "what-is": {
        lead: "Kabeeri VDF GH A1JEH1C *4:JD E-DJ D*7HJ1 'D(1E,J'* (E3'9/) 'D0C'! 'D'57F'9J. J9ED E9 #J E3'9/ (1E,) #H #/') #*E*) ('D0C'! 'D'57F'9J J.*'1G' 'DE7H1. GH D' J3*(/D Laravel #H React #H Next.js #H Django #H .NET #H WordPress #H 'D'3*6'A) #H Git #H #/') 'D0C'! 'D'57F'9J FA3G' /H1G #F J-CE CJA **-HD 'DAC1) %DI %,'('* H*'3C'* H(1HE(*'* H*FAJ0 HE1',9) H/'4(H1/ H*CDA) AI H*-BB E'DC HB1'1 %5/'1.",
        beginner: "'9*(1 C(J1J 0'C1) 'DE41H9 HC*'( BH'9/ 'D*3DJE H7(B) *F3JB AI H'D/'4(H1/ 'D-J -HD 'DCH/. 'D*7(JB FA3G J8D E(FJK' ('DA1JEH1C 'D7(J9J HC(J1J J-'A8 9DI 'DF7'B H'D**(9 H'DE1',9) H'DB/1) 9DI '3*CE'D 'D9ED (9/ 'FB7'9 'D,D3'*.",
        sections: [
          ["E' 'D0J J-CEG", "'3*B('D 'DE41H9 '.*J'1 FE7 'D*3DJE -/H/ 'D*7(JB'* E3'1'* 'D9ED 'D#3&D) .1'&7 'DEF*,'* *5EJE 'D(J'F'* UI/UX -2E 'D(1HE(* 'D*'3C'* 'DE1',9'* 'D3J'3'* 'D/'4(H1/ GitHub sync *CDA) AI H'D%5/'1'*."],
          ["E' 'D0J D' J3*(/DG", "DJ3 A1JEH1C 'D*7(JB HD' B'9/) 'D(J'F'* HD' 'D'3*6'A) HD' Git HD' FEH0, AI DDC*'(). GH 7(B) #9DI *97J G0G 'D#/H'* 3J'BK' H-/H/K'."],
          ["DE'0' EGE", "AI JC*( CH/ (319) DCF 'DE4'1J9 *A4D 9F/E' JCHF 'DF7'B H'DE5/1 HE9'JJ1 'DB(HD H'DEDCJ) H'D*CDA) H,'G2J) 'D%5/'1 :J1 H'6-). C(J1J J,9D G0G 'D#,2'! 51J-)."],
          ["#JF *H,/ 'D-BJB)", "'D-'D) 'D-J) AJ `.kabeeri/` H'DE91A) 'DB'(D) D%9'/) 'D'3*./'E AJ `knowledge/` H'D-2E 'DB'(D) DD*5/J1 AJ `packs/` H'D*C'ED'* AJ `plugins/` H'D9BH/ AJ `schemas/`."]
        ],
        steps: ["'A*- 'D1J(H", "'B1# 'D-'D)", "*-BB", "'.*1 'D3JF'1JH", "#,( 'DFH'B5", "#F4& *'3C'* E-//)", "'3*./E AI 9DI *'3C H'-/", "1',9 H*-BB", "#5/1 #H #,D"],
        details: [
          ["9BDJ) 'DE7H1", ["'3*./E C(J1J B(D 'DCH/ D*-/J/ E' J,( (F'$G H#+F'! 'DCH/ D*BJJ/ AI H(9/ 'DCH/ D*3,JD 'D/DJD H'DB(HD.", "DH '*BAD* 'D,D3) 'DEA1H6 'DE7H1 #H AI 'D*'DJ JCED EF `.kabeeri/` H'D/HC3 H-'D) 'D*'3C'* H'D/'4(H1/ (/D 0'C1) 'D4'* 'DB/JE)."]],
          ["'DE.1, 'D'-*1'AJ", ["CD EJ2) ,'/) J,( #F JCHF DG' E5/1 HF7'B HE3'1 9ED HE9'JJ1 B(HD HEDA'* E*:J1) H/DJD H*CDA) H-'D) E1',9) HB1'1 E'DC.", "G0' GH 'DA1B (JF vibe coding 94H'&J Hvibe coding B'(D DD*C1'1 GF/3JK'."]]
        ],
        checklist: ["JH,/ `.kabeeri/` #H .7) '9*E'/.", "*F8JE 'DE3*H/9 EAGHE.", "'D3JF'1JH 'D-'DJ E-//.", "FE7 'D*3DJE H'6-.", "'D*'3C 'D*'DJ E-// HB'(D DD'.*('1."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js structure map", "node bin/kvdf.js dashboard state"]
      }
    }
  }
};

const arOverrides = {
  "start-here": ["'(/# EF GF'", "G0G .1J7) 'D/.HD D#J E7H1 JA*- AHD/1 C(J1J HJ1J/ #F J91A E'0' JA9D (/HF *.EJF.", "'(/# (*-/J/ 'D3JF'1JH: *7(JB ,/J/ E41H9 C(J1J B'&E #H CH/ EH,H/ DE J(FN (C(J1J. CD 3JF'1JH DG 71JB "EF E.*DA."],
  "install-profiles": ["'D*+(J* H'D(1HA'JD'*", "G0G 'D5A-) *41- *-EJD C(J1J EF GitHub H*4:JDG E-DJK' H'.*J'1 'D(1HA'JD 'DEF'3(.", "`lite` 5:J1 DD*,'1( H`standard` GH 'D'.*J'1 'D'A*1'6J H`enterprise` DD-HCE) 'DC'ED)."],
  "ai-with-kabeeri": ["CJA J9ED AI /'.D C(J1J", "C(J1J E5EE DDE7H1 'D0J J1J/ #F J*CDE E9 'D0C'! 'D'57F'9J 7(J9JK' (JFE' J9ED AI /'.D (J&) E41H9 E-CHE).", "'DE7H1 D' J-*', #F J9J4 /'.D #H'E1 CLI. 'D#H'E1 GJ 'DE-1C 'DE-DJ 'D0J J3*7J9 'DE3'9/ #H 'D/'4(H1/ #H VS Code *4:JDG .DA 'DCH'DJ3."],
  "capabilities": ["B/1'* 'DF8'E", "G0G 'D5A-) GJ F3.) 'DHJ( EF E1,9 B/1'* C(J1J. *41- E'0' *EDC CD B/1) HDE'0' EH,H/) H#JF J(-+ 'DE7H1.", "9F/E' *CHF *'&GK' G0G GJ 'D.1J7). '.*1 'DB/1) 'DEF'3() DDE4CD) +E 'A*- E5'/1G' H#H'E1G'."],
  "repository-layout": ["*F8JE 'DE3*H/9", "J3*./E C(J1J 'D"F *F8JEK' A9DJK' B1J(K' EF D'1'AJD (,0H1 BDJD) HH'6-).", "D' *(-+ AJ CD 'D1J(H #HDK'. '(/# EF `src/` DDCH/ `knowledge/` DDE91A) `packs/` DD-2E `plugins/` DD*C'ED'* `docs/` DD*H+JB `schemas/` DD9BH/ H`.kabeeri/` DD-'D) 'D-J)."],
  "new-project": ["(/! *7(JB ,/J/", "'3*./E G0' 'DE3'1 9F/E' *1J/ (F'! *7(JB ,/J/ EF AC1) #H 7D( 9EJD #H H5A 7(J9J.", "D' *BA2 DDCH/ E('41). ',9D C(J1J JAGE FH9 'DEF*, HFE7 'D*3DJE H-/H/ 'D*7(JB'* H*5EJE 'D(J'F'* H'*,'G 'DH',G) H.7) 'D*'3C'*."],
  "existing-kabeeri-project": ["'3*CE'D E41H9 C(J1J", "'3*./E G0' 'DE3'1 9F/E' JCHF 'DE41H9 D/JG `.kabeeri/` H*9H/ (9/ 'FB7'9 ,D3) #H (9/ 9ED E7H1 ".1.", "EGE*C 'D#HDI GJ 'D'3*1,'9: *-BB EF 'D-'D) 'B1# 'D/'4(H1/ '91A 'D,'G2 H'DE-,H( +E #CED EF *'3C "EF."],
  "existing-non-kabeeri-project": ["'9*E'/ *7(JB B'&E", "'3*./E G0' 'DE3'1 9F/E' JCHF 'DCH/ EH,H/K' DCFG DE J(FN (C(J1J.", "D' *9J/ *F8JE 'DCH/ AH1K'. #HDK' 'AGEG H'1(7 *7(JB'*G HAHD/1'*G HE.'71G HFEH0, (J'F'*G HEF'7B 'DEJ2'* +E #/.D 'D-HCE) */1J,JK'."],
  "delivery-mode": ["'.*J'1 Agile #H Structured", "J/9E C(J1J F8'EJF: Agile HStructured. J3'9/ AI AJ 'D'B*1'- DCF 'DB1'1 'DFG'&J DDE7H1 #H 'DE'DC.", "Agile EF'3( DD*:JJ1 H'D*9DE ('D*C1'1. Structured EF'3( DDE*7D('* 'D+'(*) H'D'9*E'/'* H'D*H+JB H'D*3DJE 'DE$33J."],
  "agile-delivery": ["'D*3DJE 'D#,'JD", "Agile J-HD 'D9ED %DI backlog Hepics Hstories Hsprints HE1',9'* HE9HB'* H*-3JF E3*E1.", "'3*./EG 9F/E' *1J/ *B/EK' *C1'1JK' 31J9K' E9 (B'! 9ED AI E-CHEK' HB'(DK' DDE1',9)."],
  "structured-delivery": ["'D*3DJE 'DEF8E", "Structured GH F8'E Waterfall DDE*7D('* H'DE1'-D H'DE.1,'* H'D**(9 H'DE.'71 H7D('* 'D*:JJ1 H(H'('* 'DE1'-D.", "'3*./EG 9F/E' *-*', .7) 41C'* C(J1) JECF E1',9*G' H'9*E'/G' H*3DJEG' (+B)."],
  "questionnaire-engine": ["E-1C 'D#3&D)", "E-1C 'D#3&D) J3#D 'D3$'D 'DEF'3( AJ 'DHB* 'DEF'3( -*I D' J6J9 'DE7H1 HAI 'DHB* AJ *A'5JD :J1 EGE).", "(/D AH1E 6.E J(/# C(J1J H'39K' +E JC*4A FH9 'DEF*, HJA9D 'DEF'7B 'DEGE) HJ3#D AB7 AJE' J$+1 9DI 'D*.7J7 H'D*FAJ0."],
  "product-blueprints": [".1'&7 'DEF*,'*", ".1'&7 'DEF*,'* *,9D C(J1J JAGE #F8E) 'D3HB 'DE*C11) -*I D' J(/# AI EF 5A-) (J6'!.", "9F/E' *BHD E*,1 #H CRM #H ERP #H POS #H #.('1 #H -,2 #H *H5JD #H EH('JD J,( #F J91A C(J1J 'DBFH'* H'DEH/JHD'* H'D5A-'* H'D,/'HD H'DE.'71 'DE*HB9)."],
  "data-design": ["*5EJE 'D(J'F'*", "*5EJE 'D(J'F'* J3'9/ AI H'DE7H1 AJ (F'! B'9/) (J'F'* EH+HB) EF /H1) 'D9ED HDJ3 EF 4CD 'D4'4).", "'(/# ('Dworkflow 'D-BJBJ +E -// 'D,/'HD H'D9D'B'* H'DBJH/ H'D-'D'* H'D*/BJB H'DE9'ED'* H'DDB7'* H'D*B'1J1."],
  "ui-ux-advisor": ["E3'9/ *5EJE 'DH',G'*", "E3'9/ UI/UX J.*'1 *,1() 'DH',G) 'DEF'3() HE,EH9'* 'DECHF'* HBH'D( 'D5A-'* HBH'9/ 'DH5HD HSEO/GEO -3( FH9 'D*7(JB.", "H',G) CRM DJ3* E+D E/HF) HE*,1 %DC*1HFJ DJ3 E+D Dashboard /'.DJ. C(J1J J3'9/ AI 9DI '.*J'1 'DFE7 'DEF'3(."],
  "vibe-first": ["E3'1 Vibe-first", "Vibe-first J3E- DDE7H1 ('DCD'E 'D7(J9J (JFE' J-HD C(J1J 'DFJ) %DI 9ED EF8E HB'(D DDE1',9).", "'DE7H1 D' J,( #F J-A8 #H'E1. JECFG #F J7D( 7(J9JK' HC(J1J J3,D 'D'B*1'-'* H'D*'3C'* H'D'D*B'7'* H'D3J'B *-* 'D37-."],
  "task-governance": ["-HCE) 'D*'3C'*", "-HCE) 'D*'3C'* GJ BD( C(J1J D*-HJD 'D#AC'1 H'D%,'('* H'DE4'CD H'D'D*B'7'* %DI 9ED "EF B'(D DD*FAJ0.", "*'3C C(J1J DJ3 todo 9'/J. GH E5/1 HF7'B HE3'1 9ED HE3$HD HE1',9 HE9'JJ1 B(HD HEDA'* E3EH-) H*CDA) H/DJD."],
  "app-boundary": ["-HCE) -/H/ 'D*7(JB'*", "*-// GD JECF H69 #C+1 EF *7(JB /'.D AHD/1 C(J1J H'-/ (/HF .D7 EF*,'* :J1 E1*(7).", "Laravel backend E9 React storefront DFA3 'DE*,1 JECF #F JCHF' EF*,K' H'-/K'. DCF E*,1 HEF5) #.('1 D9EJD ".1 D' J,( .D7GE'."],
  "workstreams-scope": ["E3'1'* 'D9ED H'DF7'B", "E3'1'* 'D9ED HF7'B 'D*FAJ0 J-//'F EF J9ED #JF H9DI #J *7(JB HD#J *'3C.", "G0' JEF9 */'.D backend Hfrontend Hmobile Hdatabase HQA Hsecurity Hdocs #H *E// 'D*9/JD (D' B5/."],
  "prompt-packs": ["-2E 'D(1HE(*", "-2E 'D(1HE(* *97J #/H'* AI *9DJE'* H'9J) ('DA1JEH1C 'DE3*./E.", "*'3C Laravel D' JC*( E+D *'3C React. CD A1JEH1C J-*', 3J'BK' HBH'9/ #E'F E.*DA)."],
  "dashboard-monitoring": ["'D/'4(H1/ 'D-J", "'D/'4(H1/ 'D-J GH 916 *4:JDJ AHB -'D) `.kabeeri/`.", "'3*./EG DE91A) 'D,'G2 H'DE-,H( H'DECDA H'D.71 H'DEB(HD H:J1 'DEC*ED H,'G2J) 'D%5/'1 /HF B1'!) CD 'DEDA'*."],
  "ai-cost-control": ["'D*-CE AJ *CDA) AI", "*-CE *CDA) AI J,9D %FA'B 'D*HCF2 H'6-K' HEB5H/K' HE1(H7K' (BJE) 'D*3DJE.", "**(9 E' 5O1A HDE'0' HD#J *'3C HGD .1, EFG 9ED EB(HD HGD C'F JECF *BDJD 'D3J'B #H '.*J'1 EH/JD #1.5."],
  "multi-ai-governance": ["-HCE) *9// HCD'! AI", "**-CE AJ 'DGHJ'* H'D#/H'1 H'D,D3'* H'DDHC3 H'D*HCF2 H'DEJ2'FJ'* H*-BB 'DE'DC 9F/ *9'HF 'D(41 HHCD'! AI.", "-*I DH CF* E7H1K' H'-/K' JECF DC(J1J #F J9'ED E3'9/J 'D(1E,) ('D0C'! 'D'57F'9J HHCD'! IDE H#/H'* 'D#*E*) C#71'A 9ED DG' F7'B H*/BJB."],
  "github-release": ["GitHub H(H'('* 'D%5/'1", "*3'9/ GitHub HRelease Gates 9DI 'DF41 #H 'DE2'EF) (9/ ,'G2J) 'D-BJB) 'DE-DJ) H'D3J'3'* H'D#E'F H'DG,1) HB1'1'* 'DE'DC.", "GitHub 37- *9'HF HF41 DCFG D' J5(- E5/1 'D-BJB) 'DH-J/ D-'D) *3DJE C(J1J."],
  "practical-examples": ["3(9) *7(JB'* 9EDJ)", "G0G 'D5A-) *916 3(9) E3'1'* (F'! 9EDJ) H*41- CJA J3*./E 'DE7H1 C(J1J E9 #J E3'9/ 0C'! '57F'9J EF 'DAC1) %DI 'D*3DJE.", "'3*./EG' CB55 9ED (3J7): BD DE3'9/ 'D0C'! 'D'57F'9J 'DG/A H/9 C(J1J J.*'1 'D.1J7) H'D#3&D) H*5EJE 'D(J'F'* H'DH',G) H-2E 'D(1HE(* H'D*'3C'* H'D/'4(H1/."],
  "example-ecommerce": ["E+'D: E*,1 %DC*1HFJ", "G0' 'D/DJD J41- (F'! E*,1 %DC*1HFJ C'ED (C(J1J HE3'9/ 0C'! '57F'9J EF 'DAC1) %DI 'D*3DJE.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ (F'! E*,1 %DC*1HFJ C'ED. C(J1J D' J(/# ('DCH/ AH1K' J.*'1 blueprint +E 'D#3&D) +E *5EJE 'D(J'F'* H'DH',G) +E 'D*'3C'*."],
  "example-ai-team-ecommerce": ["E+'D: 3 E7H1J AI D(F'! E*,1", "G0G 'D5A-) *41- CJA JBH/ B'&/ A1JB H'-/ +D'+) E7H1J AI D(F'! E*,1 %DC*1HFJ H'-/: ('C %F/ H',G) HJ( H*7(JB EH('JD.", "'DAC1) 'D5-J-) DJ3* #F J9ED 'D+D'+) 94H'&JK' AJ FA3 'DEDA'*. C(J1J J,9D CD AI DG *7(JB HE3'1 9ED H*'3C H*HCF HBAD H*3DJE H'6- +E J,E9 'DB'&/ 'DF*'&, 9(1 *'3C'* *C'ED."],
  "example-blog": ["E+'D: E/HF) 4.5J)", "G0' 'D/DJD J41- (F'! E/HF) 4.5J) '-*1'AJ) E9 SEO H*,1() B1'!) BHJ).", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ E/HF) 4.5J). C(J1J J-// GD GJ static #H CMS #H newsletter #H paid content B(D 'DCH/."],
  "example-wordpress-digital-agency": ["E+'D: WordPress D41C) *3HJB 1BEJ", "G0' 'D/DJD J41- (F'! EHB9 WordPress D41C) *3HJB 1BEJ E9 4 %6'A'* D%/'1) 'D9ED'! H7D('* 'D./E'* H'DAH'*J1 H'D-3'('*.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ EHB9 WordPress D41C) *3HJB 1BEJ E9 F8'E /'.DJ (3J7. C(J1J JA5D 'DEHB9 'D9'E 9F plugins 'D#9E'D -*I D' J*-HD 'DE41H9 %DI *9/JD'* 94H'&J)."],
  "example-dental-clinic": ["E+'D: 9J'/) #3F'F H-,H2'*", "G0' 'D/DJD J41- (F'! EHB9 HF8'E -,2 D9J'/) #3F'F E9 DH-) %/'1) H*0CJ1'*.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ F8'E 9J'/) #3F'F ('D-,H2'*. C(J1J J*9'ED E9G CF8'E EH'9J/ H(J'F'* 4.5J) HDJ3 CRUD 94H'&J."],
  "example-crm": ["E+'D: CRM '-*1'AJ", "G0' 'D/DJD J41- (F'! CRM '-*1'AJ D%/'1) 'D9ED'! H'DE(J9'* H'DE*'(9'* H'D*B'1J1.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ CRM '-*1'AJ. C(J1J J.77G C*7(JB #9E'D C+JA 'D(J'F'* (5D'-J'* Hpipeline H*B'1J1."],
  "example-mobile-commerce": ["E+'D: *7(JB EH('JD DDE*,1", "G0' 'D/DJD J41- (F'! *7(JB EH('JD E1*(7 ('DE*,1 'D%DC*1HFJ.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ *7(JB EH('JD DDE*,1. C(J1J J1(7G (FA3 EF*, 'DE*,1 HD' J9'EDG C*7(JB EFA5D :J1 E1*(7."],
  "example-pos": ["E+'D: POS 3H(1E'1C*", "G0' 'D/DJD J41- (F'! F8'E POS '-*1'AJ D3H(1E'1C* E9 E.2HF HH1/J'* H%J5'D'*.", "BD DE3'9/ 'D0C'! 'D'57F'9J: #1J/ POS 3H(1E'1C*. C(J1J J*9'ED E9G CF8'E *4:JD E'DJ HE.2FJ -3'3."],
  "troubleshooting": ["-D 'DE4CD'*", "-D E4CD'* C(J1J J(/# EF E5/1 'D-BJB) HDJ3 'D*.EJF.", "9F/E' J-/+ .7# '3#D: GD 'DE4CD) AJ `.kabeeri/` #H 'D/HC3 #H schemas #H 'DE3'1'* 'DEFBHD) #H CLI #H 'D/'4(H1/ #H CH/ 'D*7(JB"]
};

function cloneEnglishToArabic() {
  for (const [slug, [title, lead, beginner]] of Object.entries(arOverrides)) {
    const en = docs.en.pages[slug];
    docs.ar.pages[slug] = {
      ...en,
      lead,
      beginner,
      arTitle: title
    };
  }
}

cloneEnglishToArabic();

docs.ar.pages["wordpress-development"] = {
  ...docs.en.pages["wordpress-development"],
  arTitle: "*7HJ1 WordPress",
  lead: "C(J1J JB/1 J(FJ EHB9 WordPress EF 'D5A1 #H J9*E/ EHB9 WordPress B'&E DCF EF .D'D .7) E-CHE): *-DJD staging backup *'3C'* scaffold "EF prompt pack E1',9) H*3DJE.",
  beginner: "BD DE3'9/ 'D0C'! 'D'57F'9J 7(J9JK': #1J/ EHB9 WordPress 41C) E/HF) #.('1 -,2 #H WooCommerce. C(J1J 3J-HD 0DC %DI .7) H#H'E1 H*'3C'* (/HF *9/JD WordPress core.",
  sections: [
    ["EHB9 ,/J/", "C(J1J J-// FH9 'DEHB9 blueprint 'DEF'3( 'D5A-'* 'DE-*HI CPTs taxonomies 'DBH'&E 'DFE'0, %9/'/'* 'D%/'1) SEO/GEO H71JB) 'D*FAJ0: plugin #H theme #H child theme."],
    ["EHB9 B'&E", "C(J1J J(/# (*-DJD `wp-content` H'D@ plugins H'D@ themes H%4'1'* WooCommerce HE.'71 staging Hbackup B(D #J *9/JD."],
    ["-/H/ 'D*FAJ0 'D"EF", "#J *.5J5 J,( #F J9J4 AJ custom plugin #H custom theme #H child theme. EEFH9 *9/JD `wp-admin` H`wp-includes` H`wp-config.php` H'D@ uploads 94H'&JK'."],
    ["WooCommerce", "'DE*',1 *-*', *'3C'* 51J-) DDEF*,'* 'D3D) checkout 'D/A9 'D4-F 'D61'&( 'DE.2HF -'D'* 'D7D( 'DE1*,9'* H'D%JEJD'*."],
    ["'3*./'E AI", "'3*./E `kvdf prompt-pack compose wordpress --task <task-id>` -*I J-5D E3'9/ 'D0C'! 'D'57F'9J 9DI BH'9/ WordPress 'D.'5) ('D@ hooks Hnonces Hcapabilities Hsanitization Hescaping HREST routes HWooCommerce."]
  ],
  steps: ["5A 'DEHB9", "-DD #H 5FA", "#C/ staging/backup", "'.*1 blueprint", "#F4& .7) WordPress", "HD/ *'3C'*", "#F4& scaffold "EF", "1C( WordPress prompt", "FA0 *'3C H'-/", "'.*(1 H3DE"],
  details: [
    ["EF 'D5A1", ["'(/# (@ `kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new`.", "(9/G' #F4& 'D*'3C'* scaffold 9F/ 'D-',) prompt pack DCD *'3C +E FA0 H'A-5 H3DE."]],
    ["EHB9 B'&E", ["'(/# (@ `kvdf wordpress analyze --path existing-wordpress --staging --backup`.", "DH staging #H backup :J1 E$C/ J3,D C(J1J 'D.71 HJ,( #D' JFA0 AI *:JJ1'* H'39) B(D B1'1 'DE'DC."]],
    ["E*I D' F3*./E WordPress", ["DH 'DE41H9 SaaS E9B/ #H 9EDJ'* realtime #H EF7B *,'1J +BJD :J1 E9*E/ 9DI CMS B/ JB*1- C(J1J Laravel #H Next.js #H Django #H :J1G'.", "WordPress #BHI AJ EH'B9 'DE-*HI H'D41C'* H'D*-1J1 HWooCommerce H'DE4'1J9 'D*J *3*AJ/ EF CMS."]]
  ],
  checklist: ["FH9 'DEHB9 E91HA.", "'DEHB9 'DB'&E D/JG staging Hbackup.", "WordPress core EEFH9 *9/JDG.", "71JB) 'D*FAJ0 plugin #H theme #H child theme H'6-).", "'D*'3C'* DG' acceptance criteria.", "WordPress prompt pack E1C( DCD *'3C.", "'D#E'F HSEO/GEO H'DH5HD H'D#/'! H'D*3DJE *E* E1',9*GE."]
};
docs.ar.pages["wordpress-plugins"] = {
  ...docs.en.pages["wordpress-plugins"],
  arTitle: "*7HJ1 %6'A'* WordPress",
  lead: "C(J1J JB/1 J.77 HJF4& %6'A'* WordPress CF8'E (1E,J E-CHE DG E9E'1J) H#E'F H*'3C'* H-/H/ EDA'* HE9'JJ1 B(HD H*3DJE.",
  beginner: "BD DE3'9/ 'D0C'! 'D'57F'9J 'D%6'A) 'D*J *1J/G'. C(J1J J-HD 'DAC1) %DI plugin plan HJF4& AHD/1 "EF /'.D `wp-content/plugins` HJHD/ *'3C'* E-//) 'DF7'B +E J97J 'D0C'! 'D'57F'9J BH'9/ WordPress B(D C*'() 'DCH/.",
  sections: [
    ["E*I F3*./E plugin", "'3*./E plugin DD3DHC 'D(1E,J 'D0J J,( #F J9J4 (9J/K' 9F 'D+JE: -,H2'* WooCommerce extensions CPTs *C'ED'* %9/'/'* %/'1) REST APIs shortcodes blocks HEH/JHD'* B'(D) D%9'/) 'D'3*./'E."],
    [".7) 'D%6'A)", "'D.7) *3,D '3E 'D%6'A) H'D@ slug H'DFH9 H'DE3'1 H'DE9E'1J) HBH'D( 'D*'3C'* HBH'9/ 'D#E'F H'D#H'E1 'DEB*1-) HB'&E) 'DB(HD."],
    ["'DGJCD 'DEHD/", "C(J1J JF4& GJCD E-'A8 AJG plugin header Hloader Hadmin class Hpublic class Hassets Hlanguages Huninstall policy HREADME."],
    ["FEH0, 'D#E'F", "*7HJ1 'D%6'A'* J-*', ABSPATH guards Hcapabilities Hnonces Hsanitization Hescaping HREST permission callbacks Huninstall "EF HEF9 #31'1 'D%F*',."],
    ["E3'1 AI", "(9/ H,H/ 'D.7) H'D*'3C'* J*E '3*./'E WordPress prompt pack DCD *'3C -*I J9ED E3'9/ 'D0C'! 'D'57F'9J /'.D AHD/1 'D%6'A) HJ*,F( EDA'* WordPress core."]
  ],
  steps: ["H5A 'D%6'A)", "%F4'! plugin plan", "%F4'! scaffold", "%F4'! *'3C'* plugin", "*1CJ( prompt pack", "*FAJ0 *'3C H'-/", "*4:JD 'DA-H5'*", "*,GJ2 'D*3DJE"],
  details: [
    ["%6'A) -,H2'*", ["'3*./E `--type booking` DDEH'9J/ H'D9J'/'* H'D-,H2'* H'D*BHJE'* H'D%*'-) Hshortcodes 'D9'E).", "'D*'3C'* *:7J FEH0, 'D(J'F'* H%9/'/'* 'D%/'1) H'DAH1E 'D9'E H'D*-BB H'D*F(JG'* H'D*3DJE."]],
    ["%6'A) WooCommerce", ["'3*./E `--type woocommerce` DD@ checkout H'DEF*,'* H'D7D('* H'DE.2HF H'DE1*,9'* H'D4-F H'D61'&( H'D/A9 H'D%JEJD'*.", "#J *:JJ1 AJ 'D/A9 #H /H1) -J') 'D7D( J-*', sandbox evidence HE1',9) 51J-)."]],
    ["%6'A) *C'ED", ["'3*./E `--type integration` DD@ APIs HE2'EF) CRM/ERP H'D@ webhooks H'D(H'('* 'D.'1,J) H%9'/) 'DE-'HD).", "'D*'3C'* *:7J *.2JF credentials H'D*-BB EF webhooks H'DDH,2 H%9'/) 'DE-'HD) H-'D'* 'DA4D."]],
    ["%6'A) CPT", ["'3*./E `--type cpt` DD#/D) H'DBH'&E H'D(H1*AHDJH H'DE-*HI 'D*-1J1J H'D*5FJA'* H*/AB'* %/'1) 'DE-*HI.", "'D*'3C'* *:7J labels Hcapabilities Hrewrites H#9E/) 'D%/'1) HED'-8'* migration."]]
  ],
  checklist: ["'D%6'A) *9J4 AB7 /'.D `wp-content/plugins/<slug>/`.", ".7) 'D%6'A) H'D@ scaffold EH,H/'F.", "'D*'3C'* *-*HJ allowed Hforbidden file scopes.", "5A-'* 'D%/'1) *3*./E capabilities Hsettings validation.", "'DAH1E'* H'D*:JJ1'* *3*./E nonces.", "'DE/.D'* sanitized H'DE.1,'* escaped.", "REST routes D/JG' permission callbacks.", "3DHC uninstall H'6-.", "'D*3DJE J4ED activation Hrollback H'DEDA'* 'DE*:J1) H'D'.*('1'*."]
};
docs.ar.pages["install-profiles"] = {
  ...docs.en.pages["install-profiles"],
  arTitle: "'D*+(J* H'D(1HA'JD'*",
  lead: "G0G 'D5A-) *41- *-EJD C(J1J EF GitHub H*4:JDG E-DJK' HE*I *3*./E `kvdf` E('41) HCJA *.*'1 'D(1HA'JD 'DEF'3(: `lite` #H `standard` #H `enterprise`.",
  beginner: "`lite` GH 'D(/'J) 'D5:J1) H`standard` GH 'D'.*J'1 'DEH5I (G DE98E 'DE4'1J9 H`enterprise` GH 'D-HCE) 'DC'ED).",
  sections: [
    ["'D*+(J* EF GitHub", "'9ED clone DD1J(H +(* 'D'9*E'/'* 4:D validation +E '3*./E `npm run kvdf -- ...` %DI #F *1(7 #H *+(* #E1 `kvdf`."],
    ["E*I J9ED `kvdf` E('41)", "(9/ local linking #H *+(J* 'D-2E) '3*./E `kvdf` E('41) AJ 'D9ED 'DJHEJ. #E' `node bin/kvdf.js` AGH fallback #+F'! *7HJ1 C(J1J FA3G EF 'D3H13."],
    ["(1HA'JD `lite`", "#5:1 %9/'/ 9EDJ. EF'3( DD*,'1( 'DFE'0, 'D31J9) 'DEH'B9 'D(3J7) H(/'J) 'C*4'A 'DEF*, 9F/E' D' *1J/ -HCE) +BJD)."],
    ["(1HA'JD `standard`", "'D'.*J'1 'D'A*1'6J 'DEH5I (G. EF'3( DDE4'1J9 'D-BJBJ) H'D9ED'! H'D*7(JB'* 'D9'/J) H'D0C'! 'D'57F'9J H'D/'4(H1/ H'D*'3C'* HPrompt Packs."],
    ["(1HA'JD `enterprise`", "'D%9/'/ 'DC'ED. EF'3( DD#F8E) 'DC(J1) H'DA1B H'D9ED 'DEF8E H'D-HCE) E*9//) 'DE7H1JF H(H'('* 'D%5/'1 H'D**(9 'D#BHI."]
  ],
  steps: ["Clone EF GitHub", "*+(J* 'D'9*E'/'*", "*4:JD validation", "'.*J'1 profile", "%F4'! E41H9", "A*- 'DE41H9", "*4:JD 'D/'4(H1/", "(/! 'D9ED E9 AI"],
  details: [
    ["%9/'/ GitHub", ["'3*./E `git clone <repo-url>` D*-EJD C(J1J +E 4:D `npm install` /'.D 'D1J(H.", "4:D `npm run kvdf -- --help` H`npm run kvdf -- validate` DD*#C/ #F 'DF3.) 3DJE) B(D %F4'! 'DE4'1J9."]],
    ["#HD E41H9 EH5I (G", ["DE98E 'DE7H1JF '(/# (@ `standard`: `kvdf create --profile standard --output my-project`.", "`lite` EF'3( DD-/ 'D#/FI. `enterprise` EF'3( 9F/E' *CHF 'D-HCE) H'DA1JB H'D%5/'1 H'D*/BJB EGE) EF 'DJHE 'D#HD."]]
  ],
  checklist: ["*E *-EJD 'D1J(H EF GitHub.", "*E *+(J* 'D'9*E'/'*.", "`npm run kvdf -- validate` F',-.", "*E '.*J'1 'D(1HA'JD (H9J.", "*E %F4'! E41H9 ,/J/ #H *GJ&) 'DAHD/1 'D-'DJ.", "J*E '3*./'E `kvdf` E('41) (9/ 'D1(7 #H 'D*+(J*."]
};

const arDeepOverrides = {
  "ai-with-kabeeri": {
    sections: [
      ["*,1() 'DE7H1", "'DE7H1 J*CDE 7(J9JK' HC(J1J J-HD 'DCD'E %DI -'D) EF8E): blueprint H#3&D) H*'3C'* H-2E 3J'B H(1HE(* H/'4(H1/ H*-BB."],
      ["/H1 AI", "E3'9/ 'D0C'! 'D'57F'9J #H #J E3'9/ AI JC*( 'DCH/ HJ3'9/ AJ 'D*5-J- DCFG J9ED /'.D *'3C E-// HE9'JJ1 B(HD HF7'B EDA'*."],
      ["/H1 CLI", "CLI DJ3 9(&K' 9DI 'DE7H1 GH 'DE-1C 'DE-DJ 'DEH+HB 'D0J JECF DDE3'9/ #H 'DH',G) *4:JDG."],
      ["/H1 'D/'4(H1/", "'D/'4(H1/ J916 'D-BJB) EF `.kabeeri/` -*I J91A 'DE7H1 #JF H5D 'DE41H9."],
      ["BJE) C(J1J", "JBDD F3J'F 'D3J'B H*9/JD AI 'D91J6 H:EH6 'D*'3C'* H*C1'1 'D(1HE(* H'D*CDA) :J1 'DE**(9) H'DF41 :J1 'D"EF."]
    ],
    details: [
      ["E'0' JA9D 'DE7H1 A9DJK'", ["JA*- AHD/1 'DE41H9 J.(1 'DE3'9/ (E' J1J/ J1',9 'D.7) H'D*'3C'* +E J*1C 'D*FAJ0 J*E *'3CK' *DH 'D".1.", "9F/E' JD2E #E1 JECF DDE3'9/ *4:JDG. 'DE7H1 J-*', AGE 'D1-D) D' -A8 'D#H'E1."]],
      ["E' 'D0J J,( 9DI AI '-*1'EG", ["D' J9/D EDA'* :J1 E1*(7) D' J*,'H2 validation D' J.*19 E*7D('* HD' JF41 (D' gates.", "J3*./E .1'&7 'DEF*,'* H'D#3&D) H*5EJE 'D(J'F'* HUI/UX H-2E 'D(1HE(* B(D 'D*FAJ0."]]
    ],
    checklist: ["'DE7H1 JAGE #F AI 41JC C*'() 'DCH/.", "C(J1J GH (J&) 'D*-CE.", "CLI E-1C HDJ3 9(&K'.", "'D/'4(H1/ E1'B().", "'D*'3C'* H'D*-BB E7DH('F."]
  },
  "start-here": {
    sections: [
      ["3JF'1JH *7(JB ,/J/", "'(/# EF 'D.1J7) 'DEF*,J) +E -/H/ 'D*7(JB'* +E FE7 'D*3DJE +E 'D#3&D) +E *5EJE 'D(J'F'* H'DH',G) +E 'D*'3C'*."],
      ["3JF'1JH E41H9 C(J1J B'&E", "*-BB EF `.kabeeri/` 'B1# 'D/'4(H1/ 'A*- 'D*'3C'* 'D,'G2) 1',9 'D'D*B'7'* H'DDHC3 H'D*HCF2 +E #CED EF FB7) "EF)."],
      ["3JF'1JH CH/ B'&E (/HF C(J1J", "D' *9J/ 'D*F8JE AH1K'. 'AGE 'DA1JEH1C 'D-'DJ '1(7 'D*7(JB'* H'DEH/JHD'* H'DE.'71 +E #/.D 'D-HCE) */1J,JK'."],
      ["3JF'1JH 7D( :'E6", "'3*./E Vibe-first D*-HJD 'D7D( %DI 'B*1'-'* *'3C'* B'(D) DDE1',9) (/D *FAJ0 H'39 H.71."],
      ["3JF'1JH %5/'1 #H GitHub", "D' *F41 HD' *C*( 9DI GitHub %D' (9/ validation H3J'3'* H#E'F HG,1) HEH'AB) E'DC."]
    ],
    details: [
      ["#HD 941 /B'&B", ["4:D 'D*-BB 'B1# EDA 'DB/1'* 'AGE *F8JE 'D1J(H H'A*- -'D) 'D/'4(H1/.", "D' *(/# *9/JD CH/ B(D E91A) 'D*'3C H'DF7'B HE9'JJ1 'DB(HD."]],
      ["*BDJD 'DHB* H'D*HCF2", [".1J7) 'DAHD/1'* *EF9 'D(-+ 'D94H'&J H.1'&7 'DEF*,'* H*5EJE 'D(J'F'* H-2E 'D(1HE(* *BDD *C1'1 'D41-.", "'DG/A #F J3*CED AI EF E5/1 -BJB) E.*51 D' EF 0'C1) 4'* 7HJD)."]]
    ],
    checklist: ["'D3JF'1JH E-//.", "'D*-BB F',- #H 'D(DHC12 E91HA).", "'D*'3C 'D*'DJ DG E5/1 HB(HD.", "-2E) 'D(1HE(* *7'(B 'DA1JEH1C.", "#J 9ED H'39 DG .7) #H capture."]
  },
  "capabilities": {
    sections: [
      ["CJA *B1# 'D,/HD", "CD 5A JE+D B/1) /'.D C(J1J: E'0' *A9D #JF *9J4 HCJA *3'9/ 'DE7H1 #H AI."],
      ["E' E9FI B/1) -BJBJ)", "'DB/1) 'DEAJ/) DG' *H+JB H*FAJ0 #H -'D) runtime #H *-BB HDJ3* E,1/ AC1) EC*H()."],
      ["CJA *1*(7 'DB/1'*", ".1'&7 'DEF*,'* *:0J 'D#3&D) H'D#3&D) *:0J 'D*'3C'* H*5EJE 'D(J'F'* HUI/UX J-3F'F 'D*'3C'* H-2E 'D(1HE(* *H,G 'D*FAJ0."],
      ["E*I *6JA B/1)", "#6A B/1) ,/J/) AB7 DH DG' E3$HDJ) H'6-) HDJ3* *C1'1K' DB/1) EH,H/)."],
      ["CJA *-'A8 9DJG'", "#J *:JJ1 AJ 'DB/1) J,( #F JF9C3 AJ 'D/HC3 H'D*FAJ0 H'D'.*('1'* H'D/'4(H1/ %F D2E."]
    ],
    details: [
      ["'3*./'E 'DE7H1", ["'A*- G0G 'D5A-) 9F/E' D' *91A #JF *(-+.", "'.*1 'DB/1) 'D#B1( DDE4CD) +E 'A*- EDA'* 'DE5/1 'DE0CH1) AJ 'D,/HD."]],
      ["'3*./'E AI", ["#97 AI '3E 'DB/1) HE3'1G' B(D 'D7D(.", "G0' JBDD 'D(-+ 'DH'39 HJEF9 *9/JD EC'F .'7&."]]
    ],
    checklist: ["'DB/1) EH+B).", "DG' *FAJ0 #H runtime 9F/ 'D-',).", "DG' 9D'B) H'6-) ('D*'3C'* #H 'D/'4(H1/ #H AI.", "EH,H/) AJ E1,9 'DB/1'*."]
  },
  "repository-layout": {
    sections: [
      ["`src/`", "CH/ 'D*FAJ0 'D-BJBJ HE-1C CLI H'D#H'E1 H'D*-BB H(F') 'D-'D)."],
      ["`knowledge/`", "'DE91A) 'D-'CE): governance Hdelivery Hquestionnaires Hdata design HUI/UX HVibe UX."],
      ["`packs/`", "-2E B'(D) DD*5/J1: prompt packs Hgenerators Htemplates Hexamples."],
      ["`plugins/`", "*C'ED'* dashboard HGitHub HVS Code Hmulti-AI Hplatform."],
      ["`.kabeeri/`", "'D-'D) 'D-J) DDE41H9: *'3C'* 3J'3'* *B'1J1 *CDA) /'4(H1/ */BJB."]
    ],
    details: [
      ["'DE3'1'* 'DB/JE)", ["'DE3'1'* 'DB/JE) E+D `prompt_packs/` H`standard_systems/` *9ED C@ aliases DD*H'AB.", "D' *F4& AHD/1'* B/JE) ,/J/) '3*./E 'D*F8JE 'DA9DJ 'D,/J/."]],
      ["B'9/) AI", ["'B1# `REPOSITORY_FOLDERING_MAP.json` B(D 'D(-+ 'DH'39.", "G0' JBDD 'D*HCF2 HJEF9 'D*4**."]]
    ],
    checklist: ["D' JH,/ top-level folder ,/J/ (D' 3((.", "'DE91A) AJ `knowledge/`.", "'D-2E AJ `packs/`.", "'D*C'ED'* AJ `plugins/`.", "'D-'D) 'D-J) AJ `.kabeeri/`."]
  },
  "new-project": {
    sections: [
      ["#F4& #H 'A*- AHD/1 C(J1J", "'(/# /'.D workspace C(J1J. '3*./E `init` DDAHD/1 'DB'&E #H `create` D(/'J) EHD/)."],
      ["A9D 'DE1'B()", "4:D `dashboard generate` #H `dashboard serve` -*I *1I 'D-'D) EF 'D(/'J)."],
      ["'3*./E Vibe-first 9(1 'DE3'9/", "BD DDE3'9/ E' *1J/ ('DD:) 'D9'/J) HGH J3*./E Vibe-first HCLI *-* 'D37-."],
      ["*-BB EF EDA'* C(J1J", "4:D validation B(D 'D*.7J7 HB(D 'D%5/'1."],
      ["*-BB FG'&J", "'A-5 #H #F4& 3,D 'DE1',9) 9F/E' JCHF 'DB(HD 'DFG'&J E7DH(K'."],
      ["'(/# F8'E 'D#3&D)", "'3*./E questionnaire plan D'C*4'A 'DEF*, H'D('C %F/ H'DA1HF* %F/ H'D(J'F'* H'DH',G) H'DE.'71."],
      ["#CED 'D*7HJ1", "'3*./E blueprint Hdata design HUI/UX Hprompt packs H'D*'3C'* H'D/'4(H1/ DD*FAJ0 .7H) (.7H)."]
    ],
    details: [
      ["E+'D E*,1 %DC*1HFJ", ["Laravel backend HReact storefront J9*(1'F *7(JBJF E1*(7JF /'.D EF*, H'-/.", "'D.1J7) *A9D commerce Hinventory Hpayments Hshipping Hadmin HSEO Hsecurity H'D'.*('1'*."]],
      ["'DF'*, 'D,J/", ["B'&E) apps HEH/JHD'* H,/'HD H5A-'* APIs HE.'71 H*'3C'* #HDI.", "#HD *'3C'* *CHF 5:J1) (E' JCAJ D,D3) AI H'-/) HE1',9) H'-/)."]]
    ],
    checklist: ["AHD/1 C(J1J EH,H/.", "'D/'4(H1/ J9ED.", "Vibe-first E*'- 9(1 'DE3'9/.", "validation F',-.", "'DE1',9 H'6-.", "'D#3&D) (/#*.", "'D*7HJ1 E3*E1 (*'3C'* 5:J1)."]
  },
  "existing-kabeeri-project": {
    sections: [
      ["*-BB #HDK'", "'C*4A EDA'* JSON 'DEC3H1) schemas 'DF'B5) 'DDHC3 'D*HCF2 H'D3J'3'* B(D 'D*FAJ0."],
      ["'B1# 'D/'4(H1/", "'91A 'D,'G2 H'DE-,H( H'D*CDA) H'D-'D) 'D*,'1J) H'D*BFJ)."],
      ["1',9 'D'D*B'7'*", "DH -/+ 9ED .'1, 'D*/AB 'DE+'DJ '1(7G (*'3C #H 'B*1'-."],
      ["#CED EF *'3C ,'G2", "D' *(/# EF 0'C1) 'D4'* '(/# EF E5/1 'D-BJB)."],
      ["#:DB 'D-DB)", "3,D 'D/DJD H'DE1',9) H*-BB 'DE'DC H#:DB 'D*HCF #H 'DDHC3."]
    ],
    details: [
      ["'3*1,'9 'D,D3)", ["'3*./E context briefs H'D/'4(H1/ CFB7) 1,H9.", "DH 'D,D3) 'F*G* A,#) FA0 capture B(D #J *9/JD ,/J/."]],
      ["'3*1,'9 'DA1JB", ["'A-5 workstreams H'DDHC3 H'D*HCF2 B(D 'D*9/JD.", "-*I 'DE7H1 'DH'-/ J3*AJ/ D#F 'DF8'E J-EJG EF F3J'F 'D3J'B."]]
    ],
    checklist: ["validation F',-.", "D' JH,/ lock conflict.", "'D*'3C 'D*'DJ ready.", "'D*:JJ1'* :J1 'DE**(9) captured.", "'D/DJD H'D*CDA) E3,D'F."]
  },
  "existing-non-kabeeri-project": {
    sections: [
      ["D' *C31 'D(FJ)", "'-*1E *F8JE Laravel #H Next.js #H Django #H WordPress #H #J A1JEH1C B'&E."],
      ["69G /'.D AHD/1 C(J1J", "JECF #F JCHF CH/ 'D*7(JB /'.D AHD/1 C(J1J #H JCHF AHD/1 'D*7(JB FA3G GH workspace C(J1J (9/ `init`."],
      ["-DD 'DE41H9", "'3*./E `project analyze --path <folder>` D'C*4'A 'DA1JEH1C H'D*7(JB'* H'DE.'71 HE3'1'* 'D9ED."],
      ["#F4& -'D) '9*E'/", "3,D GHJ) 'DE41H9 H'D*7(JB'* H'DEH/JHD'* H'DE.'71 H'D-'D) 'D-'DJ)."],
      ["'1(7 'DCH/ ('DB/1'*", "-// auth Husers Hdatabase HAPIs Hfrontend Hadmin Hpayments Htests Hsecurity."],
      ["H+B 'DEH,H/", "'3*./E ADR Hpost-work capture D-A8 B1'1'* -'DJ) B(D 'D*:JJ1."],
      ["'(/# (*'3C'* "EF)", "'(/# ('D*H+JB H'D*-BB H'D'.*('1'* H'DAGE B(D 'DEJ2'* 'DC(J1)."]
    ],
    details: [
      ["#FH'9 'D'9*E'/", ["E41H9 C(J1J B'&E: '3*CE'D EF 'D-'D).", "CH/ B'&E (/HF C(J1J: (F'! -'D) -HDG */1J,JK'."]],
      ["#HD *'3C'* "EF)", ["README H3J'B map DD*7(JB'* A-5 '.*('1'* *H+JB B'9/) 'D(J'F'* security scan.", "'D*:JJ1'* 'DC(J1) *#*J (9/ 'DAGE."]]
    ],
    checklist: ["(FJ) 'DA1JEH1C E-AH8).", "*E *4:JD project analyze.", "apps Hworkstreams mapped.", "'DE.'71 E3,D).", "missing answers EH,H/).", "#HD *'3C'* '9*E'/ D' rewrite."]
  },
  "delivery-mode": {
    sections: [
      ["'3*./E Agile 9F/E'", "'DF7'B E*:J1 H*-*', backlog Hstories Hsprints HE1',9'*."],
      ["'3*./E Structured 9F/E'", "'DE*7D('* H'D'9*E'/'* H'D*H+JB H'D**(9 #GE EF 319) 'D'3(1F*."],
      ["'3*./E 'D'+FJF (-01", "JECF #F *-*HJ E1-D) Structured 9DI *FAJ0 Agile (417 *3,JD EF JEDC 'DB1'1."],
      ["/9 C(J1J JB*1-", "'D'B*1'- J9*E/ 9DI 'D:EH6 H'DE.'71 H-,E 'DA1JB H'D9EJD H'D*H+JB 'DE7DH(."],
      ["3,D 'DB1'1", "D' **1C FE7 'D9ED 6EFJK' J,( #F J8G1 AJ 'D-'D) H'D/'4(H1/."]
    ],
    details: [
      ["#E+D)", ["SaaS MVP :'D(K' Agile.", "ERP -CHEJ (E*7D('* EHB9) :'D(K' Structured."]],
      ["EF9 'D.D7", ["H,H/ *'3C'* D' J9FJ Agile.", "H,H/ E3*F/'* D' J9FJ Structured."]]
    ],
    checklist: ["'D*H5J) EH,H/).", "B1'1 'DE'DC E3,D.", "'D/'4(H1/ J7'(B 'DFE7.", "'D*'3C'* #H 'DE1'-D **(9 'DB1'1."]
  },
  "agile-delivery": {
    sections: [
      ["Backlog", "J,E9 'D9ED -3( 'DBJE) H'DE5/1 H'D#HDHJ) H'D'9*E'/J'*."],
      ["Epics HStories", "*B3JE 'D#G/'A %DI 41'&- B'(D) DD'.*('1."],
      ["Sprint Planning", "'.*J'1 stories ,'G2) -3( 'D39) H'DE.'71 H'D*CDA)."],
      ["Sprint Review", "*3,JD 'DEB(HD H%9'/) 'D9ED H'D/DJD HED'-8'* 'DE'DC."],
      ["Retrospective", "*-3JF 'D9EDJ) H*BDJD 'DG/1 H'DE9HB'*."]
    ],
    details: [
      ["Scrum Master BHJ", ["C(J1J JH6- 'D9ED :J1 'D,'G2 H'DE9HB'* HD' J3E- (*B/E HGEJ.", "'DG/A *3DJE EH+HB HDJ3 7BH3K'."]],
      ["Agile E9 AI", ["CD story JECF #F *-ED *CDA) AI H-2E) (1HE(* HE3'1 9ED H/DJD B(HD.", "G0' J,9D ,H/) 'D'3(1F* H*CDA*G B'(D) DDBJ'3."]]
    ],
    checklist: ["backlog EH,H/.", "stories DG' B(HD.", "'D39) H'B9J).", "'DE9HB'* E3,D).", "'DE1',9) *A1B 'DEB(HD 9F rework."]
  },
  "structured-delivery": {
    sections: [
      ["Requirements", "E'0' 3J(FI HDE'0' HEF 7D(G HCJA JB(D."],
      ["Phases", "*B3JE 'DE*7D('* 'DE9*E/) %DI E1'-D (E.1,'* H(H'('*."],
      ["Traceability", "1(7 'DE*7D('* ('D*'3C'* H'D'.*('1'* H'DB1'1'* H'DB(HD."],
      ["Change Control", "#J *:JJ1 F7'B J5(- 7D( *:JJ1 DG #+1 HEH'AB)."],
      ["Phase Gates", "EF9 'D'F*B'D %0' 'DE*7D('* #H 'D#/D) #H 'DE.'71 F'B5)."]
    ],
    details: [
      ["3DHC 41C'* C(J1)", ["CD E1-D) *,J(: E' 'D/'.D E' 'D.'1, EF H'AB E' 'D/DJD E' 'DE.'71", "G0' EGE DD*3DJE 'DE$33J."]],
      ["Structured E9 AI", ["AI JFA0 DCF D' J:J1 'DE*7D('* 'DE9*E/) (5E*.", "'D'C*4'A 'D,/J/ J*-HD %DI change request."]]
    ],
    checklist: ["E*7D('* E9*E/).", "E1'-D H'6-).", "traceability E*5D).", "E.'71 8'G1).", "change requests E-CHE)."]
  },
  "questionnaire-engine": {
    sections: [
      ["#3&D) *CJAJ)", "'D#3&D) **:J1 -3( FH9 'DEF*, H'DA1JEH1C H'D(J'F'* H'DH',G) H'DE.'71."],
      ["Coverage Matrix", "J916 'DE,'( H'DF'B5 H'DE,GHD H'DE$,D."],
      ["Missing Answers", "J-HD 'D:EH6 %DI follow-ups #H *'3C'*."],
      ["Task Generation", "JHD/ *'3C'* DG' provenance EF 'D3$'D H'D%,'()."],
      ["A'&/) AI", "J97J AI 3J'BK' E.*51K' (/D %9'/) 'D3$'D AJ CD ,D3)."]
    ],
    details: [
      ["'D3$'D 'D,J/", ["'D3$'D 'D,J/ J:J1 'D*.7J7 #H 'D(J'F'* #H 'DH',G) #H 'D#E'F #H 'DB(HD.", "'D3$'D 'D3J& J,E9 *A'5JD D' *$+1."]],
      ["#E+D)", ["AJ ecommerce '3#D 9F 'DEF*,'* H'D/A9 H'D4-F H'DE1*,9'*.", "AJ news '3#D 9F 'D*-1J1 H'D9',D H'DE5'/1 H'D%9D'F'* HSEO."]]
    ],
    checklist: ["'D#3&D) *F'3( FH9 'DEF*,.", "'DE,GHD H'6-.", "'DFH'B5 DG' %,1'!.", "'D*'3C'* DG' E5/1."]
  },
  "product-blueprints": {
    sections: [
      ["Core + Module + Channel", "CD EF*, J*CHF EF FH') E4*1C) HEH/JHD'* #9E'D HBFH'* '3*./'E."],
      ["#F8E) *,'1J)", "POS HERP HCRM HE.2HF HE-'3() HE*',1 HE'1C* (DJ3 H*H5JD H-,2 HE7'9E HHR H/9E AFJ."],
      ["#F8E) E-*HI", "E/HF) H#.('1 HE,D) HEHB9 41C) HE1C2 E91A) H*H+JB HF41) HE-*HI E/AH9."],
      ["*7(JB'* EH('JD", "*7(JB 9EJD HEF/H( H3'&B HEH8A H#.('1 H-,2 HHD'! H*9DJE."],
      ["'DF'*, 'D*.7J7J", "EH/JHD'* H,/'HD H5A-'* HAPIs H*C'ED'* HE.'71 HE3'1'* 9ED EB*1-)."]
    ],
    details: [
      ["DE'0' *BDD 'D#.7'!", ["AI B/ JF3I 'DE1*,9'* AJ 'DE*,1 #H offline AJ POS #H workflow 'D*-1J1 AJ 'D#.('1.", "'D.1'&7 *-A8 E91A) 'D3HB 'DE*C11) /'.D C(J1J."]],
      ["CJA *H39G'", ["#6A FH9 EF*, ,/J/ AB7 DH DG EH/JHD'* #H ,/'HD #H 5A-'* #H E.'71 E.*DA).", "'1(7G ('D#3&D) H*5EJE 'D(J'F'* HUI/UX H-2E 'D(1HE(*."]]
    ],
    checklist: ["FH9 'DEF*, E-//.", "'DBFH'* E91HA).", "'DEH/JHD'* EB(HD) #H E$,D).", "EF'7B B'9/) 'D(J'F'* E-//).", "'DE.'71 8'G1)."]
  },
  "data-design": {
    sections: [
      ["5EE EF /H1) 'D9ED", "D' *5EE 'D,/'HD EF #3E'! 'D5A-'* 5EE EF order Hpayment Hshipment Hreturn Happroval."],
      ["Core + Modules", "'A5D ,/'HD 'DFH') 9F commerce Hinventory Haccounting HCMS Hmobile Hbooking H:J1G'."],
      ["3D'E) 'D(J'F'*", "'3*./E primary keys Hforeign keys Hconstraints H-'D'* H*'1J. H*/BJB HEG',1'*."],
      ["'D3D'E) 'D*4:JDJ)", "'3*./E transactions Hidempotency Hconcurrency Houtbox Hsnapshots HBH'9/ 'D-0A."],
      ["'D#/'!", ".77 DDAG'13 H'Dpagination H'D(-+ Hsummary tables Hread models H'D#14A)."]
    ],
    details: [
      ["#E+D)", ["AJ ecommerce D' *.2F order items C@ JSON DH *-*', *B'1J1 HE1*,9'* ,2&J).", "AJ inventory D' *,9D 'DE.2HF 1BEK' AB7 '3*./E stock_movements Hstock_balances."]],
      ["#+1G 9DI AI", ["*'3C ,'G2 D*5EJE 'D(J'F'* J-// entity Hrelationship Hmigration Hvalidation Htransaction H'D'.*('1'*.", "G0' JEF9 CRUD 37-J D' J*-ED 'D9ED 'D-BJBJ."]]
    ],
    checklist: ["workflow EC*H(.", "'D,/'HD E,E9) -3( 'DEH/JHD.", "'D9D'B'* H'DBJH/ H'6-).", "'D#EH'D DJ3* float.", "snapshots H'D*/BJB E91HA'F.", "E.'71 migration E-3H()."]
  },
  "ui-ux-advisor": {
    sections: [
      ["FH9 'D*,1()", "EHB9 9'E #H web app #H admin #H mobile #H POS #H customer portal #H news #H docs."],
      ["'3*1'*J,J) 'DECHF'*", "'.*J'1 tables Hfilters Hdrawers Hmodals Hcards Hforms Htabs Hbreadcrumbs Hcheckout Harticle layouts."],
      ["1(7 'D*5EJE ('D-HCE)", "E5'/1 'D*5EJE **-HD %DI specs Hpage specs Hcomponent contracts B(D 'D*FAJ0."],
      ["SEO/GEO", "'D5A-'* 'D9'E) *-*', HTML /D'DJ H9F'HJF Hbreadcrumbs Hstructured data H#/'! HE-*HI EB1H!."],
      ["%14'/ 'DA1JEH1C", "'.*J'1 Next.js #H Astro #H React #H Vue #H Angular #H Expo #H Flutter -3( 'D-',)."]
    ],
    details: [
      ["*5EJE 'D/'4(H1/", ["'D#/H'* 'D*4:JDJ) J,( #F *CHF G'/&) HC+JA) HB'(D) DDE3- 'D31J9.", "'D,/'HD H'DAD'*1 H'D-'D'* #GE EF hero *3HJBJ."]],
      ["*5EJE 'DEH'B9 'D9'E)", ["'DEH'B9 'D9'E) *-*', (FJ) /D'DJ) H319) HE-*HI H'6- H3CJE' H1H'(7 /'.DJ).", "'D,E'D 'D(51J EGE DCF H6H- 'DE-*HI H'D#/'! ,2! EF 'D*5EJE."]]
    ],
    checklist: ["FH9 'DH',G) E91HA.", "BH'D( 'D5A-'* EH,H/).", "'DECHF'* E-//).", "responsive states EC*H().", "accessibility HSEO/GEO E0CH1'F 9F/ 'D-',)."]
  },
  "vibe-first": {
    sections: [
      ["*5FJA 'DFJ)", "JAGE GD 'D7D( %F4'! *'3C #H 3$'D #H A-5 #H capture #H E1',9) #H %5/'1."],
      ["C4A 'D:EH6", "JEF9 *FAJ0 7D('* H'39) E+D -3F CD 4J! (/HF #3&D) #H *B3JE."],
      ["C1H* 'D*'3C'*", "JF*, C'1* E1',9) AJG 9FH'F HED.5 HF7'B HEDA'* E3EH-) HE.'71 HB(HD."],
      ["Post-work capture", "DH -/+ 9ED .'1, 'D*/AB JD*B7 'DEDA'* HJ1(7G' (*'3C #H 'B*1'-."],
      ["Context briefs", "JF*, ED.5'* 5:J1) D'3*CE'D 'D,D3) (*HCF2 #BD."]
    ],
    details: [
      ["DE'0' JAJ/ AI assistant", ["JBDD %9'/) 'D41- HJ97J -/H/K' DD*FAJ0.", "JEF9 *-HJD 'DCD'E 'D7(J9J %DI *51J- (*9/JD CD 4J!."]],
      ["E9 #H (/HF command", ["'D#E1 CLI E,1/ 37- *4:JD.", "'D4'* H'D/'4(H1/ HVS Code JECF #F J3*./EH' FA3 'DE-1C /HF #F J-A8 'DE7H1 'D#E1."]]
    ],
    checklist: ["'DFJ) E5FA).", "'D:EH6 D' JFA0 E('41).", "'DC'1* B'(D DDE1',9).", "capture J1(7 'D9ED :J1 'DE**(9.", "context brief EH,H/."]
  },
  "task-governance": {
    lead: "-HCE) 'D*'3C'* *-HD 'D#AC'1 H'D%,'('* H'DE4'CD H'D'D*B'7'* %DI 9ED B'(D DD*FAJ0 E9 3,D /'&E JECF '3*&F'AG EF E5/1 'D-BJB).",
    beginner: "*'3C C(J1J DJ3 todo 9'/JK'. J-*A8 ('DE5/1 H'DF7'B HE3'1 'D9ED H'DE3F/ H'DE1',9 HE9'JJ1 'DB(HD H'DEDA'* 'DE3EH- (G' HEJ2'FJ) 'D*HCF2 H'D/DJD H*A'5JD 'D*FAJ0 'D/'&E) H.7H'* 'D*-BB 'DFG'&J) AJ EC'F H'-/ -*I *3*#FA 'D,D3) 'D*'DJ) EF 'D3,D (/D 'DE-'/+).",
    sections: [
      ["'DE5/1", "CD *'3C J#*J EF %,'() #H blueprint #H bug #H design spec #H capture #H GitHub issue #H B1'1 E'DC."],
      ["E5/1 'D-BJB)", "3,D 'D*'3C GH E5/1 'D-BJB) DE' J,( #F J-/+ HE' D' J,( *:JJ1G HCJA J*E 'D*-BB EF 'D%CE'D."],
      ["*91JA 'D,'G2J)", "'D*'3C :J1 ,'G2 %0' 'DF7'B #H 'DB(HD #H 'DE3'1 #H 'D'9*E'/J'* #H 'DE1',9 :J1 E91HA)."],
      ["'D*FAJ0", "J(/# (%3F'/ HF7'B H*HCF H1(E' lock H,D3) AI HC*D) 0'C1) 'D*FAJ0 'D*J *-A8 3J'B 'D'3*&F'A (/B)."],
      ["'DE1',9)", "*A-5 'DEDA'* H'D/DJD H'D'.*('1'* HE9'JJ1 'DB(HD H'D3J'3'*."],
      ["'D*-BB", "B1'1 'DE'DC J:DB 'D-DB) ('DB(HD #H 'D1A6."],
      ["3,D'* 'D*FAJ0 'D/'&E)", "ED.5 'D*FAJ0 H.7H'* 'D'3*&F'A H'DE/.D'* 'DE7DH() H'DE.1,'* 'DE*HB9) HBH'9/ 9/E 'D*:JJ1 H#H'E1 'D*-BB *O-A8 E9 'D*'3C -*I *3*#FA 'D,D3) 'DD'-B) EF 'D3,D (/DK' EF 'DE-'/+)."]
    ],
    details: [
      ["DE'0' *EF9 'DAH6I", ["AI B/ J*E// .'1, 'DF7'B.", "'D*'3C J97J CD ,D3) -/H/K' HG/A B(HD."]],
      ["Live JSON", ["-'D) task tracker JECF B1'!*G' EF 'D/'4(H1/ HVS Code.", "G0' JBDD *9/JD EDA'* *H+JB (9/ CD *'3C."]],
      ["'D'3*&F'A D'-BK'", ["JECF %9'/) B1'!) C*D) 0'C1) 'D*'3C 9(1 `kvdf task memory <id>` #H 9(1 queue 'DE$B*) 9F/E' J/.D 'D*'3C %DI `kvdf temp`.", "H(0DC **'(9 'D,D3) 'D*'DJ) 'D9ED E9 *'1J. E-'/+) #BD H*CDA) *HCF2 #BD."]]
    ],
    checklist: ["'D*'3C DG E5/1.", "'DB(HD B'(D DD'.*('1.", "'DEDA'* 'DE3EH-) H'6-).", "'D/DJD E3,D.", "B1'1 'DE'DC E3,D 9F/ 'D-',)."]
  },
  "app-boundary": {
    sections: [
      ["'DE3EH-", "*7(JB'* E1*(7) AJ FA3 'DEF*, E+D backend Hstorefront Hadmin Hmobile Hworker Hvendor portal."],
      ["'DEEFH9", "EF*,'* #H 9ED'! #H /H1'* %5/'1 E3*BD) J,( A5DG' AJ AHD/1'* C(J1J E.*DA)."],
      ["*91JA 'D-/H/", "CD app DG path Htype Hproduct Hworkstreams Hstatus."],
      ["9ED 9'(1 DD*7(JB'*", "'D*'3C 'D9'(1 J,( #F J0C1 CD app HCD workstream E*#+1."],
      ["B1'1 'DA5D", "DH 'D4C C(J1 'A5D 'DEF*,'* (/D *DHJ+ 'D-'D) H'D*CDA) H'D/'4(H1/."]
    ],
    details: [
      ["B'9/) 9EDJ)", ["backend Hfrontend DFA3 'DE*,1 EF*, H'-/.", "E*,1 HEF5) #.('1 D9EJD ".1 EF*,'F EFA5D'F."]],
      ["DE'0' EGE", ["'D.D7 JA3/ 'D*'3C'* H'D*CDA) H'D%5/'1'* H'D3J'B.", "'D-/H/ *,9D workspace E*E'3CK'."]]
    ],
    checklist: ["CD app DG product.", "CD app DG path.", "'D9D'B) H'6-).", "*'3C'* integration E9DQE)."]
  },
  "workstreams-scope": {
    sections: [
      ["Workstreams", "E3$HDJ'* E+D backend Hfrontend Hadmin Hmobile Hdatabase HQA Hsecurity Hdocs."],
      ["Task tokens", "*6JB 'D5D'-J) %DI EDA'* HE3'1'* H*7(JB'* HE3'1'* 9ED E-//)."],
      ["Locks", "*EF9 */'.D 'D*9/JD (JF #C+1 EF E7H1 #H AI."],
      ["Execution scope", "'DF7'B 'DFG'&J J#*J EF task Happ Hworkstream Htoken H#J broad approval."],
      ["Validation", "J*#C/ #F 'DEDA'* H'D,D3'* D' *.1, 9F 'D-/H/."]
    ],
    details: [
      ["E7H1 H'-/", ["-*I solo J3*AJ/ D#FG JBDD 'D*9/JD'* 'D91J6) HF3J'F 'D3J'B.", "JECF #F JCHF #.A DCFG D' JD:J 'DFEH0,."]],
      ["A1JB", ["'DA1JB J-*', EDCJ) HDHC3 H*HCF2 B(D 'D9ED 'DE*H'2J.", "HCD'! AI J9'EDHF C#71'A DG' F7'B'*."]]
    ],
    checklist: ["workstream EH,H/.", "allowed files E4*B).", "token DJ3 #H39 EF 'DD'2E.", "lock conflicts EA-H5).", "'D,D3) /'.D 'DF7'B."]
  },
  "prompt-packs": {
    sections: [
      ["-2E 'DA1JEH1C'*", "Laravel HReact HVue HAngular HNext.js HAstro HDjango HFastAPI HNestJS HWordPress HExpo H:J1G'."],
      ["Common layer", "BH'9/ E4*1C) DDF7'B H'DE1',9) H'D/DJD HAI-run H'D3D'E)."],
      ["Export", "JECF *5/J1 'D-2E %DI E41H9 'D9EJD."],
      ["Composition", "'D(1HE(* 'DE1C( J,E9 'D*'3C H'DF7'B H'DB(HD HBH'9/ 'DA1JEH1C."],
      ["Review", "'D-2E) *H,G AI DCFG' D' *D:J 'D'.*('1 H'DE1',9)."]
    ],
    details: [
      ["*BDJD 'D*HCF2", ["'D-2E) *EF9 41- BH'9/ 'DA1JEH1C EF 'D5A1 CD E1).", "E9 context briefs *5(- 'D,D3'* #B51 H#C+1 '*3'BK'."]],
      ["B'9/) 'D,H/)", ["'D(1HE(* D' J9FJ B(HD 'DE.1,.", "'DE.1, J-*', /DJD H'.*('1'* HB1'1."]]
    ],
    checklist: ["'D-2E) *7'(B stack.", "common layer E6'A.", "'DF7'B EH,H/.", "'DB(HD EH,H/.", "AI run E3,D."]
  },
  "dashboard-monitoring": {
    sections: [
      ["Task tracker", "J916 'D,'G2J) H'D-'D) H'DE3$HD H'DB(HD H'DE1',9) H'D*-BB."],
      ["Business state", "J916 ,'G2J) 'DEJ2'* H'D1-D'* H'D/JEH HBJE) 'DEF*,."],
      ["Technical state", "J916 apps Hworkstreams Hchecks Hpolicies Hsecurity Hmigrations."],
      ["Cost and AI", "J916 'D'3*./'E H'DEJ2'FJ) H'DG/1 H'DEB(HD H'DE1AH6."],
      ["Multi-workspace", "JECF E*'(9) #C+1 EF AHD/1 C(J1J DE7H1 J9ED 9DI #C+1 EF E41H9."]
    ],
    details: [
      ["Live JSON", ["'D-'D) 'DEGE) *-* `.kabeeri/dashboard/` H`.kabeeri/reports/`.", "CD 'D37H- *B1# FA3 'D-BJB)."]],
      ["UX 'D/'4(H1/", ["J,( #F JCHF *4:JDJK' HB'(DK' DDE3- 'D31J9.", "'DAD'*1 H'D-'D'* #GE EF 'D2.1A)."]]
    ],
    checklist: ["-'D) 'D/'4(H1/ EH,H/).", "task tracker -/J+.", "'D(DHC'* B'(D) DD*FAJ0.", "'D*CDA) H'D3J'3'* 8'G1).", "workspaces H'6-)."]
  },
  "ai-cost-control": {
    sections: [
      ["Usage records", "*.2F provider Hmodel Htokens Hcost Htask Hactor."],
      ["Context packs", "*,G2 3J'BK' 5:J1K' DD*'3C (/D B1'!) 'D1J(H CDG."],
      ["Preflight", "*B/J1 *CDA) B(D *4:JD prompt C(J1."],
      ["Model routing", "'.*J'1 EH/JD -3( 'DE.'71 H'D*9BJ/."],
      ["Waste detection", "A5D 'DEB(HD 9F 'DE1AH6 H%9'/) 'D9ED H'D'3*C4'A H:J1 'DE**(9."]
    ],
    details: [
      ["E7H1 H'-/", ["EGE D#F %9'/) 41- 'D3J'B *6J9 HB*K' H*CDA).", "context briefs *BDD 0DC."]],
      ["A1JB", ["'D*CDA) -3( sprint Hworkstream Htask *3'9/ 'DE'DC.", "budget approvals *EF9 'D51A 'D5'E*."]]
    ],
    checklist: ["pricing rules EH,H/).", "usage E1(H7 (*'3C #H untracked.", "context pack EH,H/ DDEG'E 'DC(J1).", "accepted/rejected E91HA.", "budget approval DD*CDA) 'D9'DJ)."]
  },
  "multi-ai-governance": {
    sections: [
      ["Identities", "'DE7H1HF HHCD'! AI DGE IDs H#/H'1 HB/1'* HE3'1'* 9ED."],
      ["Sessions", ",D3'* AI *3,D 'D*'3C H'DEH/JD H'DEDA'* H'DED.5 H'DF*J,)."],
      ["Locks", "*EF9 *9/JD FA3 'DF7'B ('D*H'2J."],
      ["Verification rule", "'DE1',9 'DF47 JEDC B1'1 'D*-BB 'DFG'&J 9F/ 'D-',)."],
      ["Audit", "'D#A9'D 'DEGE) *3,D -*I D' *6J9 E9 %:D'B 'D4'*."]
    ],
    details: [
      ["Solo mode", ["JBDD 'D7BH3 HJ-'A8 9DI FA3 4CD 'D-'D).", "JECF 'D*H39 D'-BK' DA1JB (/HF .3'1)."]],
      ["Parallel AI", ["'DHCD'! 'DE*H'2JHF J-*',HF F7'B'* EFA5D).", "C(J1J JC4A 'D*9'16 B(D C31 'DCH/."]]
    ],
    checklist: ["'DE'DC E91HA.", "'DGHJ'* E91A).", "'D*9JJF'* E-//).", "'DDHC3 EA-H5).", "'D,D3'* E3,D).", "*-BB 'DE'DC E-*1E."]
  },
  "github-release": {
    sections: [
      ["GitHub sync", "1(7 'D*'3C'* ('Dissues H'Dlabels H'Dmilestones :'D(K' dry-run #HDK'."],
      ["Release readiness", "A-5 validation Hnotes Hchecklist Hpolicies Hsecurity Hmigrations."],
      ["Publish gates", "A5D production-ready 9F published A9DJK'."],
      ["Confirmed writes", "#J C*'() GitHub *-*', confirmation H3J'3'*."],
      ["Packaging", "'D*#C/ #F 'D-2E) *4ED 'DAHD/1'* 'D,/J/) (9/ 'D*F8JE."]
    ],
    details: [
      ["#GEJ) dry-run", ["J916 'D*:JJ1'* B(D DE3 GitHub.", "J-EJ 'D1J(H EF *:JJ1'* 9'E) #H E1&J) DDA1JB ('D.7#."]],
      [",'G2J) package", ["J,( *6EJF `knowledge/` H`packs/` H`plugins/` H`schemas/` H`docs/` H`src/` H`bin/` H`cli/`.", "'DA-5 JEF9 F41 A1JEH1C F'B5."]]
    ],
    checklist: ["validation F',-.", "'D#E'F EB(HD.", "'DG,1) EA-H5).", "'D3J'3'* F',-).", "GitHub dry-run #HDK'.", "*#CJ/ 'DE'DC EH,H/."]
  },
  "practical-examples": {
    sections: [
      ["1. EHB9 E*,1 %DC*1HFJ E*C'ED", "'9*(1G EF*,K' H'-/K' DG backend API HH',G) E*,1 HDH-) %/'1) H1(E' jobs. '.*1 Laravel #H NestJS #H FastAPI DD('C %F/ HReact #H Next.js DDH',G). '3*./E Agile DD@ MVP #H Structured DH F7'B 'D9EJD +'(*. C(J1J JA9D 'DEF*,'* H'DE.2HF H'D/A9 H'D4-F H'DCH(HF'* H'DE1',9'* H'D9ED'! H'D#/EF HSEO H'D#E'F H'D'.*('1'* H'D%5/'1."],
      ["2. EHB9 E/HF) 4.5J)", "'9*(1G F8'E E-*HI (3J7. '.*1 Astro #H Next.js E9 Markdown/MDX #H WordPress DH 5'-( 'DE41H9 J1J/ CMS ,'G2. C(J1J J.77 'DEB'D'* H'DE$DA H'D*5FJA'* H'DH3HE HSEO Hsitemap H'DF41) H'D*9DJB'* H'D*-DJD'* H*,1() 'DB1'!)."],
      ["3. EHB9 HF8'E 9J'/) #3F'F ('D-,H2'*", "'9*(1G EHB9 ./E'* + F8'E -,2 + DH-) %/'1). '.*1 Laravel #H Django DD('C %F/ HReact #H Next.js DDH',G). C(J1J J.77 'D./E'* H'D#7('! H'DEH'9J/ H'DE16I H'D*0CJ1'* H'D*BHJE H'D%D:'! H'D5D'-J'* H'D.5H5J) H'D*B'1J1."],
      ["4. F8'E CRM '-*1'AJ", "'9*(1G web app C+JA 'D(J'F'*. '.*1 Laravel #H NestJS #H .NET #H FastAPI DD('C %F/ HReact #H Angular #H Vue DDH-). C(J1J J.77 'D9ED'! 'DE-*EDJF H,G'* 'D'*5'D H'D41C'* H'D5AB'* H'Dpipeline H'D#F47) H'DE*'(9'* H'D5D'-J'* H'D*/BJB H'D'3*J1'/ H'D*B'1J1."],
      ["5. *7(JB EH('JD DDE*,1 'D%DC*1HFJ", "'9*(1G BF') EH('JD E1*(7) (FA3 EF*, 'DE*,1 HDJ3 EF*,K' EFA5DK'. '.*1 React Native Expo #H Flutter. C(J1J J1(7G ('D('C %F/ HJ.77 onboarding Hauth Hproduct feed Hsearch Hcart Hcheckout Horders Hpush notifications Hprofile Hdeep links Hoffline cache H%5/'1'* 'D*7(JB."],
      ["6. F8'E POS '-*1'AJ D3H(1E'1C*", "'9*(1G F8'E *4:JD (J9 HE.2HF HB/ J-*', offline. '.*1 Laravel #H .NET #H NestJS DD('C %F/ HReact #H Vue #H Angular D4'4) POS. '3*./E Structured :'D(K' D#F 'D#,G2) H'DH1/J'* H'D%J5'D'* H'DC'4 H'DE.2HF H'D*/BJB -3'3). C(J1J J.77 'DC'4J1 H'D('1CH/ H'DEF*,'* H'D#39'1 H'D61'&( H'DH1/J'* H'DE/AH9'* H'D%J5'D'* H'DE.2HF H'D*B'1J1 H'D5D'-J'*."],
      ["7. EHB9 WordPress D41C) *3HJB 1BEJ", "'3*./E WordPress DEHB9 41C) *3HJB 1BEJ AJG 5A-'* ./E'* HEB'D'* H/1'3'* -'D) HFE'0, 7D( H'3*./E 4 plugins E.55) DD9ED'! H7D('* 'D./E'* H'DAH'*J1 H'D-3'('*. C(J1J J,9D CD plugin AJ F7'B "EF H*'3C'* H'6-) /'.D `wp-content/plugins/`."]
    ],
    details: [
      ["*/AB E3'9/ 'D0C'! 'D'57F'9J 'D9'E", ["BD DE3'9/ 'D0C'! 'D'57F'9J 'DG/A (D:) (3J7) HE3'9/ 'D0C'! 'D'57F'9J J3*./E C(J1J D'.*J'1 blueprint HFE7 'D*3DJE H'D#3&D) H*5EJE 'D(J'F'* H'DH',G) H-2E 'D(1HE(*.", "E3'9/ 'D0C'! 'D'57F'9J JFA0 *'3C H'-/ AB7 AJ CD E1) HJ3,D 'DEDA'* H'D/DJD +E J4:D validation H'D'.*('1'*."]],
      ["*.7J7 'D('C %F/", ["AJ CD E+'D -// 'DE3*./EJF H'D5D'-J'* H'D,/'HD HAPIs H'Dvalidations H'D*C'ED'* H'D'.*('1'* HE.'71 'D%5/'1.", "'3*./E `data-design context` -*I D' JF*, AI B'9/) (J'F'* 69JA)."]],
      ["*.7J7 'DA1HF* %F/", ["-// 'D5A-'* H'D*.7J7'* H'DECHF'* H-'D'* loading Hempty Herror Hresponsive Haccessibility HSEO/GEO 9F/ 'D-',).", "'3*./E `design recommend` H-HCE) E5'/1 'D*5EJE B(D 'D*FAJ0."]],
      ["'D*3DJE", ["B(D 'D*3DJE 4:D validation H'D/'4(H1/ H*B'1J1 readiness/governance Hsecurity scan Hrelease gates Hhandoff package.", "'DE.1, 'D'-*1'AJ GH CH/ + -'D) E41H9 H'6-) HDJ3 CH/ AB7."]]
    ],
    checklist: ["CD E+'D DG blueprint.", "FE7 'D*3DJE E-//.", "'D('C %F/ H'DA1HF* %F/ E.77'F EFA5DK'.", "-2E 'D(1HE(* *7'(B 'D*BFJ).", "'D*'3C'* E-//) B(D *9/JD E3'9/ 'D0C'! 'D'57F'9J.", "'D/'4(H1/ H*-BB 'DE'DC J:DB'F 'D9ED."]
  },
  "example-ecommerce": {
    sections: [
      ["4CD 'DEF*,", "'DE*,1 J(J9 EF*,'* #HFD'JF HJ-*', C*'DH, H3D) Hcheckout H/A9 H4-F H**(9 7D( HDH-) %/'1) HE.2HF H.5HE'* HE1*,9'* H13'&D HSEO H*B'1J1."],
      ["'D*BFJ'* 'DEF'3()", "Laravel #H NestJS #H FastAPI #H Django DD('C %F/. Next.js #H React DDE*,1. React E9 Ant Design #H Mantine #H MUI DDH-) 'D%/'1). PostgreSQL #H MySQL DD/'*'."],
      ["FE7 'D*3DJE", "Agile DH MVP #H 'D*5EJE 3J*:J1. Structured DH 'D9EJD 9F/G E*7D('* +'(*) H*C'ED'* /A9 H4-F HAH'*J1 H*H'1J. *3DJE H'6-)."],
      ["B/1'* C(J1J", "Product Blueprint HApp Boundary HDelivery Advisor HQuestionnaire HData Design HUI/UX HPrompt Packs HTask Governance HDashboard HSecurity HRelease Gates."],
      ["-/H/ 'D*7(JB'*", "backend API Hstorefront Hadmin Hworkers /'.D workspace H'-/ DH DFA3 'DE*,1. 'A5D AB7 DH EF*,'* #H 9ED'! E.*DAJF."],
      ["E3'1'* 'D9ED", "backend Hdatabase Hpublic_frontend Hadmin_frontend Hintegration Hqa Hsecurity Hdocs Hrelease."]
    ],
    details: [
      ["#3&D) C(J1J 'DEGE)", ["GD 'DEF*,'* (3J7) #E variants #E digital #E subscriptions", "GD JH,/ E.2HF HA1H9 HE.'2F", "E' (H'('* 'D/A9 H'D4-F", "GD JH,/ guest checkout H-3'( 9EJD HCH(HF'* HE1',9'* HE1*,9'* HAH'*J1", "GD E7DH( 91(J/%F,DJ2J HSEO H9ED'* H61'&("]],
      ["*5EJE 'D(J'F'*", ["Core: users, roles, permissions, settings, files, audit_logs.", "Commerce: customers, products, variants, categories, carts, orders, order_items, payments, invoices, shipments, coupons, reviews, returns, refunds.", "Inventory: warehouses, stock_movements, stock_balances, reservations.", "EGE: order_items H'DAH'*J1 *-A8 snapshot -*I D' **:J1 'D7D('* 'DB/JE) 9F/ *:JJ1 'D391."]],
      ["'D('C %F/", ["Auth H#/H'1 C*'DH, cart API checkout service webhooks DD/A9 *C'ED 'D4-F lifecycle DD7D( admin APIs E.2HF emails audit import/export reports.", "'3*./E transactions AJ checkout H'D/A9 H-,2 'DE.2HF H'DA'*H1).", "'3*./E idempotency AJ 'D/A9 H'Dwebhooks H%F4'! 'D7D(."]],
      ["'DA1HF* %F/", ["Home Hcategories Hproduct list Hproduct details Hsearch Hfilters Hcart drawer Hcheckout Hpayment result Haccount Horders Hwishlist Hreturns HFAQ.", "'D5A-'* 'D9'E) *-*', SEO metadata HProduct schema HBreadcrumb schema H5H1 E-3F) H-'D'* loading/empty/error HEH('JD BHJ."]],
      ["DH-) 'D%/'1)", ["Products table Hproduct form Hcategories Hinventory Horders Hpayments Hrefunds Hshipments Hcoupons Hcustomers Hreports Hsettings Hroles Haudit logs.", "'3*./E tables HAD'*1 Hstatus badges Hbulk actions Hdrawers Hconfirm modals."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["*'3C blueprint H'D#3&D).", "*'3C migrations/models DDEF*,'*.", "*'3C cart/checkout backend.", "*'3C storefront listing/details.", "*'3C admin products.", "*'3C payment sandbox.", "*'3C orders/emails/reports.", "*'3C tests/security/handoff."]],
      ["'DB(HD", ["'D9EJD J6JA EF*, DD3D) HJ/A9 HJ1I 'D7D(.", "'D#/EF J6JA EF*, HJ9/D E.2HF HJ/J1 7D(.", "webhooks D' *C11 'D/A9.", "'DA'*H1) 'DB/JE) D' **:J1.", "'DH',G) responsive HSEO ,J/.", "'D/'4(H1/ J916 'D-'D)."]]
    ],
    checklist: ["blueprint 'DE*,1 E-//.", "'D*7(JB'* E1*(7).", "'D/A9 H'D4-F H'6-'F.", "snapshots EH,H/).", "checkout "EF.", "storefront Hadmin EFA5D'F.", "E3'9/ 'D0C'! 'D'57F'9J J9ED *'3C H1'! *'3C."]
  },
  "example-blog": {
    sections: [
      ["4CD 'DEF*,", "E/HF) *F41 EB'D'* HEDA C'*( H*5FJA'* HH3HE H(-+ HF41) H1(E' *9DJB'* #H E-*HI E/AH9."],
      ["'D*BFJ'* 'DEF'3()", "Astro #H Next.js E9 Markdown/MDX DE/HF) 31J9). WordPress DH 5'-( 'DE41H9 J1J/ CMS *BDJ/J. Strapi #H CMS headless DH %/'1) 'DE-*HI EFA5D)."],
      ["FE7 'D*3DJE", "Agile DE/HF) 4.5J) **7H1. Structured DH E41H9 9EJD DG 5A-'* HGHJ) HSEO deliverables E9*E/)."],
      ["B/1'* C(J1J", "Product Blueprint HQuestionnaire HUI/UX Advisor HDesign Governance HPrompt Packs HTask Governance HSEO/GEO HRelease Gates."],
      ["E3'1'* 'D9ED", "public_frontend Hcontent Hdesign Hseo Hqa Hdocs Hrelease."],
      ["*91JA 'DF,'-", "'DB'1& J,/ 'DEB'D'* HJB1# (3GHD) 9DI 'DEH('JD HE-1C'* 'D(-+ *AGE 'DE-*HI."]
    ],
    details: [
      ["#3&D) C(J1J", ["E' EH6H9 'DE/HF) H'D,EGH1", "Static #E CMS", "91(J #E %F,DJ2J #E 'D'+FJF", "GD *-*', newsletter #H comments #H author bio #H tags #H search", "E' #G/'A SEO: topic clusters Hschema Hsitemap HRSS"]],
      ["EH/JD 'DE-*HI", ["Static: title, slug, date, updated date, summary, tags, category, cover, author, SEO fields.", "CMS: posts, authors, categories, tags, media, comments, subscribers, redirects, seo_metadata.", "DD:*JF: .77 routes #H translations E(C1K'."]],
      ["'DH',G)", ["Home Hpost list Hcategory Htag Harticle Habout Hcontact Hnewsletter Hsearch Harchive.", "5A-) 'DEB'D *-*', H1/H2 HTOC Hreading time Hauthor Hdate Hrelated posts Hshare links H.7 E1J-."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["'.*J'1 content model.", "layout/navigation/theme tokens.", "article listing/article page.", "SEO/sitemap/RSS/schema.", "search/newsletter/comments.", "performance/accessibility review."]],
      ["'DB(HD", ["%6'A) EB'D ,/J/) 3GD).", "'DEHB9 responsive HEB1H!.", "SEO metadata Hsitemap EH,H/'F.", "RTL/LTR 5-J-.", "'D#/'! ,J/.", "handoff J41- F41 EB'D'* ,/J/)."]]
    ],
    checklist: ["E5/1 'DE-*HI E-//.", "post model H'6-.", "'D.7 H'D*.7J7 EB(HD'F.", "SEO/GEO EH,H/.", "workflow 'DF41 EH+B.", "'D#/'! EA-H5."]
  },
  "example-wordpress-digital-agency": {
    sections: [
      ["4CD 'DEF*,", "EHB9 WordPress 9'E D41C) *3HJB 1BEJ J916 'D./E'* H'DEB'D'* H/1'3'* 'D-'D) HFE'0, 'D7D( HE9G 7(B) *4:JD /'.DJ) .AJA) /'.D DH-) WordPress."],
      ["71JB) WordPress", "'3*./E WordPress DDE-*HI H'D5A-'* HSEO H'3*./E plugins E.55) D#J EF7B #9E'D J,( #F J9J4 (9J/K' 9F 'D+JE."],
      ["FE7 'D*3DJE", "Structured DH 'D5A-'* H'D('B'* H'DAH'*J1 E9*E/) EF 9EJD. Agile DH 'D41C) E' 2'D* *,1( 'D91H6 H'DAFD HFEH0, 'D9EJD."],
      ["B/1'* C(J1J", "WordPress Development HWordPress Plugin Development HData Design HUI/UX HPrompt Packs HTask Governance HSecurity HDashboard HHandoff."],
      ["-/H/ 'DEF*,", "'DEHB9 'D9'E H'D@ 4 plugins EF*, H'-/ /'.D E3'-) C(J1J H'-/). D' *A5D CD plugin AJ E3'-) :J1 E1*(7) %D' DH 3J('9 CEF*, E3*BD."]
    ],
    details: [
      ["5A-'* 'DEHB9 'D9'E", ["Home *916 'D916 'D#3'3J H'D./E'* H'D/DJD 'D',*E'9J HCTA.", "Service pages D./E'* SEO H'D%9D'F'* H'D3H4J'D H'DE-*HI H'DGHJ) H'DD'F/F, H'D*-DJD'*.", "Case studies *916 'DE4CD) H'D9ED H'DF*J,) H'D#1B'E.", "Blog/resources DEB'D'* SEO H#/D) 'D-ED'* H'D#3&D).", "Contact/request page J1(7 FEH0, 'D7D( (%6'A) 7D('* 'D./E'*."]],
      ["Plugin 1: 'D9ED'!", ["'D'3E 'DEB*1-: `Agency Customers` H'D@ slug: `agency-customers`.", "J/J1 'D41C'* H'D,G'* H'D(J'F'* H'DAH*1) HE/J1 'D-3'( H3,D 'DF4'7.", "D' *.D7 customer E9 WordPress user 'D9EJD B/ JCHF 3,D %/'1J AB7 (/HF -3'( /.HD."]],
      ["Plugin 2: 7D('* 'D./E'*", ["'D'3E 'DEB*1-: `Agency Service Requests` H'D@ slug: `agency-service-requests`.", "J-HQD FE'0, 'DEHB9 %DI 7D('* EF8E): ./E) E7DH() H5A EJ2'FJ) EDA'* -'D) E3$HD.", "'DAH1E 'D9'E J-*', nonce Hsanitization HBJH/ DDEDA'* H-'D'* E+D new/reviewing/quoted/approved/in_progress/completed."]],
      ["Plugin 3: 'DAH'*J1", ["'D'3E 'DEB*1-: `Agency Invoices` H'D@ slug: `agency-invoices`.", "JF4& AH'*J1 D./E'* 'D*3HJB H'D1J*ainer H'D-ED'* H'D%6'A'*.", "J-*', invoice_items Hpayments Hstatus history Hsnapshots D#3E'! 'D9EJD H'D./E) H'D391 H'D61J().", "D' *-0A A'*H1) E/AH9) '3*./E cancelled #H credit/refund flow."]],
      ["Plugin 4: 'D-3'('*", ["'D'3E 'DEB*1-: `Agency Accounts` H'D@ slug: `agency-accounts`.", "J/J1 'D-3'('* 'DE'DJ) #H #15/) 'D9ED'! #H ED.5'* 'D-3'( HED'-8'* 'D-3'(.", "D' *,9D 'D-3'( J9/D 'DAH'*J1 E('41) 'DA'*H1) H'D/A9 GE' E5/1 'D-BJB) H'D-3'( J916 ED.5K' #H BJH/K' EF8E)."]],
      ["*C'ED 'D%6'A'*", ["Customers GH 3,D 'D9EJD 'DE1C2J.", "Service Requests *1(7 #H *F4& customer.", "Invoices *1*(7 ('D9EJD HB/ *1*(7 (7D( ./E).", "Accounts *D.5 'D#15/) H'DED'-8'* (/HF %A3'/ *'1J. 'DAH'*J1.", "'3*./E hooks/actions H1H'(7 %/'1) H'6-) (/D *9/JD EDA'* plugins 'D#.1I 94H'&JK'."]],
      ["*1*J( 'D*FAJ0", ["'(/# (.7) EHB9 WordPress H5A-'* 'D./E'*.", "+E Customers +E Service Requests D#FG J1(7 'DEHB9 ('D9EJD.", "+E Invoices +E Accounts.", "(9/G' FA0 *'3C Integration J,E9 'D7D( H'D9EJD H'DA'*H1) H'D-3'(.", "'.*E ('D#E'F H'D5D'-J'* H'D*3DJE."]]
    ],
    checklist: [".7) EHB9 WordPress EH,H/).", "4 plugin plans EH,H/).", "CD %6'A) DG' slug HAHD/1 E3*BD.", "7D('* 'D./E'* *3*./E nonce Hsanitization.", "'D9ED'! EFA5DHF 9F WordPress users.", "'DAH'*J1 *3*./E snapshots H*9'ED "EF E9 'DE'D.", "*C'ED plugins H'6-.", "'D*3DJE J41- activation order H'Drollback."]
  },
  "example-dental-clinic": {
    sections: [
      ["4CD 'DEF*,", "EHB9 ./E'* DD9J'/) + -,2 EH'9J/ + DH-) %/'1) DD#7('! H'DEH8AJF."],
      ["'D*BFJ'* 'DEF'3()", "Laravel #H Django #H NestJS DD('C %F/ React #H Next.js DDH',G) PostgreSQL/MySQL Hcalendar UI DD%/'1)."],
      ["FE7 'D*3DJE", "Structured DH 'D9J'/) *-*', BH'9/ .5H5J) HEH'9J/ /BJB). Agile DH MVP 31J9."],
      ["B/1'* C(J1J", "Booking Blueprint HData Design HUI/UX HApp Boundary HWorkstreams HSecurity HTask Governance HDashboard HNotifications."],
      ["E3'1'* 'D9ED", "backend Hdatabase Hpublic_frontend Hadmin_frontend Hintegration Hsecurity Hqa Hdocs."],
      ["*91JA 'DF,'-", "'DE1J6 J-,2 H'D9J'/) */J1 'D*HA1 H'DEH8A J$C/ #H JD:J #H J9J/ 'D,/HD) H'D*0CJ1'* *9ED."]
    ],
    details: [
      ["#3&D) C(J1J", ["CE 7(J( HA19", "E' 'D./E'* HE/) CD ./E)", "GD 'DE1J6 J.*'1 'D7(J(", "GD 'D-,2 AH1J #E pending", "E' 3J'3) 'D%D:'!", "GD 'D*0CJ1 email #H SMS #H WhatsApp", "E' 'D(J'F'* 'D-3'3) HEF J1'G'"]],
      ["*5EJE 'D(J'F'*", ["Core: users, roles, permissions, audit_logs, settings.", "Clinic: dentists, services, staff_availability, appointments, patients, appointment_status_history, reminders, branches, rooms, cancellations.", "EGE: start_at Hend_at E7DH('F HJ,( EF9 */'.D 'DEH'9J/."]],
      ["'D('C %F/", ["availability service Happointment creation Hconflict detection Hstatus transitions Hreminders Hadmin calendar API Hpatient API Haudit.", "'3*./E transactions 9F/ *#CJ/ 'D-,2.", "'F*(G DDtimezone."]],
      ["'DH',G)", ["Public: home/services/dentists/booking/contact/FAQ/policies.", "Booking: '.*J'1 ./E) H7(J( HEH9/ H(J'F'* H*#CJ/.", "Admin: calendar Happointments table Hpatient detail Hservices Havailability Hreports."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["BH'9/ 'D-,2 H'D/'*'.", "backend DD-,2 H'D*HA1.", "public booking flow.", "admin calendar.", "reminders/audit.", "'.*('1 */'.D 'DEH'9J/."]],
      ["'DB(HD", ["D' JECF -,2 FA3 'D7(J( AJ FA3 'DHB*.", "'D%/'1) *$C/ H*D:J H*9J/ 'D,/HD).", "'DE1J6 J1I -'D'* H'6-).", "'D*0CJ1'* E3,D).", "'D(J'F'* 'D-3'3) E-EJ)."]]
    ],
    checklist: ["BH'9/ 'D-,2 H'6-).", "availability E5EE).", "EF9 'D*/'.D EH,H/.", "public/admin flows EH,H/).", "privacy/audit EH,H/'F.", "reminders E.*(1)."]
  },
  "example-crm": {
    sections: [
      ["4CD 'DEF*,", "CRM J/J1 leads Hcontacts Hcompanies Hdeals Hpipeline Hactivities Hfollow-ups Hnotes Hfiles Hquotes Hreports Hpermissions."],
      ["'D*BFJ'* 'DEF'3()", "Laravel #H NestJS #H .NET #H Django #H FastAPI DD('C %F/ React #H Angular #H Vue DDH',G) HB'9/) PostgreSQL/MySQL."],
      ["FE7 'D*3DJE", "Structured DCRM 41C) #H 9EJD C(J1. Agile DCRM F'4& J*:J1 AJG pipeline H'D*B'1J1."],
      ["B/1'* C(J1J", "CRM Blueprint HDelivery Advisor HData Design HUI/UX HWorkstreams HTask Governance HAI Cost HDashboard HSecurity HAudit."],
      ["E3'1'* 'D9ED", "backend Hdatabase Hadmin_frontend Hintegration Hqa Hsecurity Hdocs Hreporting."],
      ["*91JA 'DF,'-", "A1JB 'DE(J9'* J*'(9 leads H'D5AB'* H'D#F47) H'DE/J1 J1I *B'1J1 EH+HB)."]
    ],
    details: [
      ["#3&D) C(J1J", ["E' E1'-D 'DE(J9'*", "EF 'DE3*./EHF", "GD *H2J9 leads J/HJ #E *DB'&J", "GD *-*', quotes Hreminders Hemail integration Himport/export Hcustom fields", "E' 'D*B'1J1 'DE7DH()"]],
      ["*5EJE 'D(J'F'*", ["Core: users, roles, permissions, audit_logs.", "CRM: leads, contacts, companies, deals, deal_stages, activities, notes, tasks, reminders, quotes, files, pipelines, assignments, custom_fields.", "EGE: D' *,9D CD 4J! generic records %D' DH *(FJ low-code CRM."]],
      ["'D('C %F/", ["Lead CRUD Hcontacts/companies Hdeal pipeline Hactivity timeline Hassignment rules Hreminders Hsearch/filter Himport/export Haudit Hpermissions Hreports.", "'3*./E pagination Hindexes E(C1K'.", "'A5D activity_logs 9F audit_logs."]],
      ["'DH',G)", ["Dashboard Hleads table Hpipeline board Hcontact details Hcompany profile Hactivity timeline Htasks/reports/import/settings/users.", "'3*./E UI C+JA: filters Hsaved views Hcolumn visibility Hbulk actions Hdrawers."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["pipeline/entities.", "leads/contacts/companies backend.", "deals/stages.", "admin table/pipeline UI.", "activity/reminders.", "import/export/reports.", "security/audit/tests/handoff."]],
      ["'DB(HD", ["'DEF/H( JF4& lead.", "deal JF*BD (JF E1'-D E3EH-).", "'DE/J1 J1I pipeline report.", "'D5D'-J'* *EF9 'DH5HD 'D.'7&.", "import J3,D #.7'! 'D5AHA."]]
    ],
    checklist: ["sales process H'6-.", "permissions matrix EH,H/).", "pipeline entities H'6-).", "tables/filters E5EE).", "reports E-//).", "audit/import/export EH,H/)."]
  },
  "example-mobile-commerce": {
    sections: [
      ["4CD 'DEF*,", "*7(JB 9EJD DDEH('JD J916 'DEF*,'* H'D(-+ H'D3D) H'D/A9 H'D7D('* H'D*F(JG'* H'D-3'( H'DEA6D) H'D/9E."],
      ["'D*BFJ'* 'DEF'3()", "React Native Expo DD*3DJE 'D31J9 #H Flutter DH 'DA1JB JA6D Dart. 'D('C %F/ GH ('C %F/ 'DE*,1 FA3G."],
      ["FE7 'D*3DJE", "Agile :'D(K' D#F *,1() 'DEH('JD *-*', *,1() H*-3JF. Structured DH API HE*7D('* 'DE*,1 +'(*)."],
      ["B/1'* C(J1J", "App Boundary HEcommerce Blueprint HMobile Prompt Pack HData Design HUI/UX HAPI Integration HDashboard HSecurity HRelease Gates."],
      ["E3'1'* 'D9ED", "mobile Hbackend Hintegration Hqa Hsecurity Hrelease Hdocs."],
      ["*91JA 'DF,'-", "'D*7(JB J3*./E FA3 (J'F'* 'DE*,1 HJ916 'DEF*,'* HJ/J1 'D3D) H'D/A9 H**(9 'D7D( (4CD "EF."]
    ],
    details: [
      ["#3&D) C(J1J", ["GD J3*./E FA3 -3'( 'D9EJD", "GD 'D/A9 /'.D 'D*7(JB #E web checkout", "GD *-*', push notifications Hdeep links Hoffline cache Hbiometric Hdark mode", "E' APIs 'DEH,H/) H'DF'B5)"]],
      ["API H'D/'*'", ["'D*7(JB D' JC11 /'*' 'DE*,1 J3*GDC APIs DDEF*,'* H'D3D) H'D/A9 H'D7D('* H'D-3'(.", "EH('JD J-*', devices Hpush_tokens Happ_sessions Happ_versions Hpreferences Hdeep_links.", "D' *.2F (J'F'* (7'B) 'D/A9 AJ 'D*7(JB."]],
      ["'D4'4'*", ["Onboarding Hlogin/register Hhome Hcategories Hsearch Hproduct details Hcart Hcheckout Hpayment result Horders Hwishlist Hprofile Hsettings Hsupport.", "CD 4'4) *-*', loading/empty/error/offline/success states."]],
      ["*C'ED 'D('C %F/", ["*#C/ EF response shapes Hauth Hpagination Hcart sync Horder status Hpush events Hforce update endpoint.", "DH API F'B5 #F4& backend task B(D mobile task."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["mobile shell/navigation.", "auth/secure storage.", "product feed/search/details.", "cart/checkout integration.", "orders/profile/notifications.", "offline/error states.", "device QA/handoff."]],
      ["'DB(HD", ["login "EF.", "'DEF*,'* *8G1 EF API.", "'D3D) H'D/A9 J9ED'F.", "**(9 'D7D( H'6-.", "push token J9ED %0' EA9QD.", "offline/errors H'6-)."]]
    ],
    checklist: ["'D*7(JB E1(H7 (FA3 'DE*,1.", "API contracts E91HA).", "Expo #H Flutter E-//.", "'D4'4'* mapped.", "push/offline/versioning E.77).", "device QA EH,H/."]
  },
  "example-pos": {
    sections: [
      ["4CD 'DEF*,", "POS DD3H(1E'1C*: 4'4) C'4J1 H('1CH/ H3D) H.5HE'* H61'&( HE/AH9'* H%J5'D'* HE1*,9'* HH1/J'* HC'4 HE.2HF H*B'1J1."],
      ["'D*BFJ'* 'DEF'3()", "Laravel #H .NET #H NestJS DD('C %F/ React #H Vue #H Angular D4'4) POS PostgreSQL/MySQL. DH hardware desktop EGE JECF %6'A) Electron D'-BK'."],
      ["FE7 'D*3DJE", "Structured :'D(K' D#F POS JE3 'DE'D H'DE.2HF H'DEH8AJF H'D%J5'D'*. JECF '3*./'E Agile /'.D 'DE1'-D D*-3JF 'D4'4)."],
      ["B/1'* C(J1J", "POS Blueprint HStructured Delivery HData Design HUI/UX HApp Boundary HSecurity HAudit HMigration HDashboard HRelease Gates."],
      ["E3'1'* 'D9ED", "backend Hdatabase Hadmin_frontend Hpos_frontend Hintegration Hqa Hsecurity Hdocs Hrelease."],
      ["*91JA 'DF,'-", "'DC'4J1 J(J9 (319) 'D%J5'D 5-J- 'DE.2HF J*:J1 (/B) 'DE1*,9'* E-CHE) H'DH1/J) *:DB (#1B'E B'(D) DD*/BJB."]
    ],
    details: [
      ["#3&D) C(J1J", ["CE A19 H,G'2", "GD 'DEF*,'* barcode #H SKU #H weighted items", "E' 71B 'D/A9", "GD JH,/ receipt printer Hcash drawer Hscanner", "GD offline E7DH(", "CJA **E 'DE1*,9'* H'D.5HE'* H'D61'&( H%:D'B 'DH1/J)"]],
      ["*5EJE 'D(J'F'*", ["Core: users, roles, permissions, branches, settings, audit_logs.", "POS: pos_devices, pos_sessions, cash_drawers, sales, sale_items, payments, returns, receipts.", "Inventory: products, barcodes, categories, stock_movements, stock_balances, warehouses.", "EGE: 'DE.2HF movements HDJ3 1BEK' AB7 H'DE(J9'* H'D%J5'D'* snapshots."]],
      ["'D('C %F/", ["product lookup ('D('1CH/ %F4'! sale 31J9 *3,JD payment receipt generation stock movement returns shift open/close cash reconciliation audit reports.", "'3*./E transaction AJ sale + payment + stock + receipt.", "offline J-*', local sale IDs H.7) sync."]],
      ["H',G) POS", ["(-+/('1CH/ 31J9 cart quantity discounts payment panel receipt preview returns shift status offline indicator keyboard shortcuts.", "'D4'4) J,( #F *CHF +'(*) H31J9) (D' layout shifts."]],
      ["DH-) 'D%/'1)", ["Products Hprices Hcategories Hinventory Hshifts Hsales reports Husers/roles Htaxes Hsettings Hdevices Haudit logs.", "'DE/J1 J-*', daily summaries Hlow stock Hcashier performance Hbranch performance."]],
      ["*'3C'* E3'9/ 'D0C'! 'D'57F'9J", ["operations/data model.", "products/barcode/inventory.", "sale transaction/receipt snapshot.", "cashier screen.", "shifts/cash drawer.", "returns/reports.", "hardware/offline strategy.", "security/tests/release/handoff."]],
      ["'DB(HD", ["'D('1CH/ J6JA 'DEF*, (319).", "'D(J9 JF4& payment Hreceipt Hstock movement.", "'DE1*,9 D' JA3/ 'DE.2HF.", "%:D'B 'DH1/J) J916 expected vs actual cash.", "'DE/J1 J1',9 F4'7 'DC'4J1."]]
    ],
    checklist: ["Structured E.*'1 #H E(11.", "cashier workflow H'6-.", "inventory movements E5EE).", "receipt snapshots EH,H/).", "shift closing E.77.", "offline/hardware E-//.", "audit/reports EH,H/)."]
  },
  "troubleshooting": {
    sections: [
      ["validation fails", "'B1# 'DEDA #H schema #H B'9/) 'D-HCE) 'D*J A4D* +E #5D- 'DE5/1."],
      ["E3'1 B/JE", "B/ JCHF alias DD*H'AB D' *9J/ %F4'! AHD/1 B/JE."],
      ["/'4(H1/ B/JE", "#9/ *HDJ/ 'D-'D) EF `.kabeeri/` (/D *9/JD UI J/HJK'."],
      ["AI 9/D C+J1K'", "'3*./E scope Hlocks Htokens Hpost-work capture."],
    ["release blocked", "'A-5 policy results Hsecurity Hmigration Hlead evidence."]
    ],
    details: [
      ["(9/ *F8JE 'DAHD/1'*", ["DH 8G1 E3'1 B/JE *-BB GD GH alias.", "'DEDA 'DA9DJ :'D(K' *-* `knowledge/` #H `packs/` #H `plugins/`."]],
      ["(9/ ,D3) AI 3J&)", ["'D*B7 'DEDA'* HB'1FG' ('DF7'B.", "'B(D 'DEAJ/ (*'3C'* EFA5D) H'1A6 'D'F-1'A."]]
    ],
    checklist: ["E5/1 'DA4D E91HA.", "D' JH,/ %5D'- UI AB7.", "DE J*E %-J'! AHD/1 B/JE.", "*E* %9'/) validation.", "*E *4:JD tests 9F/ *:JJ1 'DCH/."]
  }
};

for (const [slug, override] of Object.entries(arDeepOverrides)) {
  docs.ar.pages[slug] = { ...docs.ar.pages[slug], ...override };
}

docs.en.pages["developer-onboarding"] = {
  lead: "This page gives a first-session path for developers who need to enter a Kabeeri workspace safely, understand the track, and choose the next command without guessing.",
  beginner: "Use this when you are new to the folder or returning after a break. It keeps the opening sequence short: identify the track, confirm the workspace, inspect the docs and state, then move into the first safe task.",
  sections: [
    ["Framework owner onboarding", "Run resume, inspect the active Evolution priority, confirm the temporary queue, and then follow the current slice before making framework changes."],
    ["App developer onboarding", "Run resume, confirm the app track, inspect the task tracker, and use vibe or task commands only inside the app workspace."],
    ["New workspace onboarding", "If the folder is not yet a Kabeeri workspace, initialize it first, then return to resume and confirm the track before any implementation."],
    ["The opening rule", "The first command should tell you where you are, what you are allowed to touch, and what exact step comes next. If it does not, keep reading state instead of editing code."]
  ],
  steps: ["Run resume", "Confirm the track", "Read the docs or dashboard", "Inspect the next safe command", "Open the first task", "Implement one slice", "Record evidence"],
  details: [
    ["What to do in the first ten minutes", ["Read the current state, check the repository map, open the docs manifest, and inspect the top-level task or evolution queue.", "Do not start a broad refactor just because the folder is familiar. The safe path is always smaller than it feels."]],
    ["How this reduces mistakes", ["Onboarding keeps the first session short, which reduces accidental edits, wrong-track commands, and repeated context hunting.", "The point is not speed alone. The point is a clean restart that can be repeated tomorrow by another developer or AI agent."]]
  ],
  checklist: ["The current track is known.", "The workspace mode is known.", "The next exact command is visible.", "The first task or priority is scoped.", "The developer can resume without chat history."],
  commands: ["node bin/kvdf.js resume --json", "node bin/kvdf.js onboarding", "node bin/kvdf.js docs manifest", "node bin/kvdf.js dashboard state"]
};

docs.ar.pages["developer-onboarding"] = {
  ...docs.en.pages["developer-onboarding"],
  arTitle: "*#GJD 'DE7H1",
  lead: "G0G 'D5A-) *97J E3'1 'D,D3) 'D#HDI DDE7H1 'D0J J/.D E3'-) Kabeeri (#E'F JAGE 'DE3'1 HJ.*'1 'D#E1 'D*'DJ (/HF *.EJF.",
  beginner: "'3*./EG' 9F/E' *CHF ,/J/K' 9DI 'DAHD/1 #H 9'&/K' (9/ 'FB7'9. 'DE3'1 B5J1: -/Q/ track *#C/ EF E3'-) 'D9ED 1',9 'D/HC3 H'D-'D) +E 'F*BD %DI #HD *'3C "EF.",
  sections: [
    ["*GJ&) 5'-( 'DE41H9", "4:QD resume 1',9 #HDHJ) Evolution 'DF47) *#C/ EF 'D@ temporary queue +E '*(9 'D@ slice 'D-'DJ B(D #J *:JJ1 AJ 'D@ framework."],
    ["*GJ&) E7H1 'D*7(JB", "4:QD resume *#C/ EF track 'D.'5 ('D*7(JB H1',9 task tracker +E '3*./E vibe #H task AB7 /'.D E3'-) 'D*7(JB."],
    ["*GJ&) E3'-) ,/J/)", "%0' DE *CF 'DE,D/'* EGJ#) (9/ CE3'-) Kabeeri FAQ0 init #HDK' +E 9/ %DI resume D*#CJ/ 'DE3'1 B(D #J *FAJ0."],
    ["B'9/) 'D(/'J)", "#HD #E1 J,( #F JH6- #JF #F* HE' 'DE3EH- DC DE3G HE' 'D.7H) 'D/BJB) 'D*'DJ). %0' DE JA9D 0DC '3*E1 AJ B1'!) 'D-'D) (/D *9/JD 'DCH/."]
  ],
  steps: ["4:QD resume", "#C/ 'DE3'1", "'B1# docs #H dashboard", "1',9 'D#E1 'D"EF 'D*'DJ", "'A*- #HD *'3C", "FA0 slice H'-/", "3,D 'D#/D)"],
  details: [
    ["E'0' *A9D AJ #HD 941 /B'&B", ["'B1# 'D-'D) 'D-'DJ) 1',9 .1J7) 'DE3*H/9 'A*- manifest 'D.'5 ('D@ docs H1',9 #9DI task #H evolution queue.", "D' *(/# refactor H'39 AB7 D#FC *91A 'DE,D/. 'DE3'1 'D"EF /'&EK' #5:1 EE' J(/H."]],
    ["CJA JBDD 'D#.7'!", ["'D*#GJD J(BJ 'D,D3) 'D#HDI B5J1) AJBDD 'D*9/JD'* 'D.7# H#H'E1 track 'D.'7&) H'D(-+ 'DE*C11 9F 'D3J'B.", "'DG/A DJ3 'D319) AB7 (D %9'/) (/! F8JA) JECF *C1'1G' :/K' (H'37) E7H1 ".1 #H HCJD AI."]]
  ],
  checklist: ["'DE3'1 'D-'DJ E91HA.", "H69 E3'-) 'D9ED E91HA.", "'D#E1 'D/BJB 'D*'DJ 8'G1.", "#HD task #H priority E-// 'DF7'B.", "'DE7H1 J3*7J9 'D'3*&F'A (/HF 0'C1) chat."],
  commands: ["node bin/kvdf.js resume --json", "node bin/kvdf.js onboarding", "node bin/kvdf.js docs manifest", "node bin/kvdf.js dashboard state"]
};

docs.ar.pages["example-ai-team-ecommerce"] = {
  ...docs.en.pages["example-ai-team-ecommerce"],
  arTitle: "E+'D: 3 E7H1J AI D(F'! E*,1",
  lead: "G0G 'D5A-) *41- CJA JBH/ B'&/ A1JB H'-/ +D'+) E7H1J AI D(F'! E*,1 %DC*1HFJ H'-/: H'-/ DD('C %F/ H'-/ DH',G) 'D%F*1F* HH'-/ D*7(JB 'DEH('JD.",
  beginner: "'D3JF'1JH 'D#A6D DJ3 #F J9ED 'D+D'+) 94H'&JK' AJ FA3 'DEDA'*. 'D3JF'1JH 'D"EF GH EF*, H'-/ /'.D E3'-) C(J1J B'&/ A1JB #H E'DC H'-/ +D'+) HCD'! AI E3,DJF -/H/ *7(JB'* EFA5D) E3'1'* 9ED EFA5D) *'3C'* E-//) #BA'D H*HCF2 +E *'3C'* *C'ED *,E9 'D9ED.",
  sections: [
    ["'DGJCD 'DEH5I (G", "'9*(1 'DE*,1 EF*,K' H'-/K' DG *7(JB'* E1*(7): `store-api` DD('C %F/ `storefront-web` DH',G) 'D%F*1F* `store-mobile` DDEH('JD H1(E' `admin-dashboard` #H workers. AI 'D('C %F/ JEDC APIs HB'9/) 'D(J'F'*. AI 'DHJ( JEDC H',G) 'DE*,1. AI 'DEH('JD JEDC *7(JB 'D9EJD. B'&/ 'DA1JB JEDC 'D*.7J7 H'D'9*E'/ H'D*C'ED H'D*-BB 'DFG'&J."],
    ["/H1 B'&/ 'DA1JB", "'DB'&/ GH 'DE7H1 'D(41J #H 'DE'DC #H 'DE1',9 'D*BFJ. J.*'1 blueprint JB11 Agile #H Structured J1',9 %,'('* 'D#3&D) JF4& 'D*7(JB'* HE3'1'* 'D9ED J3F/ 'D*'3C'* J5/1 'D*HCF2 J1',9 'D#/D) J-D 'D*9'16'* HJB11 E*I J*E /E, 'D9ED."],
    ["/H1 AI 'D('C %F/", "J9ED AB7 9DI API HB'9/) 'D(J'F'* Hauth H'DEF*,'* H'D3D) Hcheckout H'D7D('* H'D/A9 H'DE.2HF H'D@ webhooks H'D'.*('1'* 'D.DAJ). J,( #F J+(* API contracts B(D #F *9*E/ 9DJG' H',G'* 'DHJ( H'DEH('JD."],
    ["/H1 AI H',G) 'D%F*1F*", "J9ED AB7 9DI storefront web: 'D1&J3J) 'D*5FJA'* B'&E) 'DEF*,'* *A'5JD 'DEF*, 'D(-+ 'DAD'*1 'D3D) checkout UI 'D-3'( 'D7D('* SEO responsive states H'.*('1'* 'DHJ(."],
    ["/H1 AI 'DEH('JD", "J9ED AB7 9DI BF') 'DEH('JD: onboarding login product feed search product details cart checkout integration orders profile push token registration offline/error states Hdevice testing."],
    ["CJA *F*BD 'D*'3C'*", "'D*'3C'* D' *F*BD (0'C1) 'D4'*. CD *'3C JF4# J3F/ J-// F7'BG J5/1 DG token JBAD F7'BG JFA0 J3DE (/DJD J1',9 +E J*-BB #H J1A6. #J 9ED E4*1C J5(- `type=integration`."],
    ["CJA JF*GJ 'DE*,1", "D' JF*GJ 'DE*,1 9F/E' JBHD CD AI %F 4:DG .D5. JF*GJ 9F/E' *CHF API contracts E3*B1) 'DHJ( H'DEH('JD J9ED'F 9DI FA3 'D('C %F/ checkout Horder lifecycle E.*(1'F 'D3J'3'* H'D#E'F H'D,'G2J) F',-) H'D*-BB 'DFG'&J H-2E) 'D*3DJE EH,H/'F."]
  ],
  steps: ["%F4'! E3'-) 'DEF*,", "*3,JD 'D*7(JB'*", "*3,JD HCD'! AI", "%F4'! E3'1'* 'D9ED", "*+(J* API contracts", "*B3JE 'D*'3C'*", "%5/'1 tokens Hlocks", "'D('C %F/ J(FJ 'D9BH/", "'DHJ( H'DEH('JD J3*GDC'F 'D9BH/", "*'3C'* 'D*C'ED", "E1',9) 'D#/D)", "*-BB 'DE'DC", "'D*3DJE"],
  details: [
    ["FEH0, 'D5D'-J'*", ["'DB'&/ J3*7J9 %F4'! 'D*7(JB'* H%6'A) 'DHCD'! H%3F'/ 'D*'3C'* H%5/'1 #H 3-( 'D*HCF2 H*4:JD policy gates H'D*-BB 'DFG'&J.", "AI 'D('C %F/ J9ED AB7 /'.D backend/database/API scopes 'D.'5) (*'3CG.", "AI 'DHJ( J9ED AB7 /'.D E3'1'* storefront web.", "AI 'DEH('JD J9ED AB7 /'.D E3'1'* *7(JB 'DEH('JD.", "D' J-5D #J HCJD AI 9DI 5D'-J) 9DJ'. *H3J9 'DF7'B J*E (*'3C integration H'6- HE1',9."]],
    ["'D*7(JB'* 'DEB*1-)", ["`store-api`: 'D('C %F/ HAPI H'D./E'*.", "`storefront-web`: H',G) 'DE*,1 9DI 'D%F*1F*.", "`store-mobile`: *7(JB 'D9EJD DDEH('JD.", "`admin-dashboard`: DH-) 'D%/'1) %0' C'F* EFA5D).", "CD G0G 'D*7(JB'* JECF #F *9J4 /'.D FA3 E3'-) C(J1J D#FG' EF*, H'-/. E*,1 ".1 #H 9EJD ".1 J-*', E3'-) C(J1J EFA5D)."]],
    ["BH'9/ *('/D 'D9ED", ["AI 'D('C %F/ D' J3DE EDA'* E('41) DDHJ( #H 'DEH('JD J3DE API contracts Hendpoint notes H'DEDA'* 'DE*:J1) H'D'.*('1'* H'DE.'71.", "AI 'DHJ( H'DEH('JD D' J:J1'F 'D('C %F/ 9F/ FB5 endpoint. J7D('F #H JF4&'F *'3C ('C %F/.", "B1'1'* auth Hcart sync Hpayment redirect Horder status *3,D C@ ADR #H ED'-8'* *'3C E9*E/).", "DH 'DHJ( H'DEH('JD J-*','F FA3 API shape JF4& 'DB'&/ *'3C contract B(D *FAJ0 'DH',G'*."]],
    ["*3DJE CD HCJD AI", ["CD session *F*GJ (EDA'* E*:J1) checks summary risks HE' (BJ blocked.", "*3DJE 'D('C %F/ J4ED endpoints Hmigrations Hseed data HBH'9/ auth Hidempotency/webhook notes H'D'.*('1'*.", "*3DJE 'DHJ( J4ED 'D5A-'* 'DEC*ED) H'9*E'/'* API H-'D'* responsive HSEO/accessibility.", "*3DJE 'DEH('JD J4ED 'D4'4'* H'9*E'/'* API HED'-8'* 'D#,G2) H'D5D'-J'* Hoffline/error states Hrelease blockers."]],
    [".7) 'D*C'ED", ["Integration Task 1: 'D('C %F/ JF41 9BH/ product/catalog/cart/order API.", "Integration Task 2: H',G) 'DHJ( *3*GDC API H**-BB EF product/cart/checkout/order.", "Integration Task 3: 'DEH('JD J3*GDC FA3 API HJ*-BB EF auth/product/cart/order.", "Integration Task 4: '.*('1 end-to-end DD/A9 H'D7D(.", "Integration Task 5: readiness report Hgovernance report Hsecurity scan Hdashboard export Hhandoff package."]],
    ["EF9 'D*9'16", ["'3*./E app boundaries -*I D' JDE3 'DEH('JD EDA'* 'DHJ( HD' 'DHJ( EDA'* 'D('C %F/.", "'3*./E workstreams D*H6J- backend Hdatabase Hpublic_frontend Hmobile Hsecurity.", "'3*./E locks B(D (/! #J AI AJ EDA'* E4*1C).", "'3*./E task access tokens D*-/J/ allowed_files Hforbidden_files.", "'3*./E policy gates B(D 'D*-BB 'DFG'&J #H 'D%5/'1."]],
    ["#.7'! 4'&9)", ["CD 'DHCD'! J(/#HF 'DCH/ B(D H,H/ API contracts.", "HCD'! 'DH',G) J.*19HF mock data D' *7'(B 1/H/ 'D('C %F/.", "*7(JB 'DEH('JD J*-HD %DI EF*, EFA5D (/D BF') DFA3 'DE*,1.", "'DB'&/ JB(D 91H6 EFA5D) HD' J.*(1 checkout/order lifecycle C'ED.", "HCJD J:J1 auth #H config E4*1C (/HF *'3C integration."]]
  ],
  checklist: ["E3'-) E*,1 H'-/) EH,H/).", "'D*7(JB'* E3,D) (#3E'! usernames +'(*).", "HCD'! backend Hweb Hmobile E3,DHF.", "CD *'3C DG ,G) E3$HD) Happ scope Hworkstream Hallowed files Hacceptance criteria.", "API contracts EH,H/) B(D '9*E'/ 'DH',G'* 9DJG'.", "*'3C'* 'D*C'ED *,E9 backend Hweb Hmobile.", "CD AI J3DE evidence Hrisks.", "'DB'&/ J1',9 H'D*-BB 'DFG'&J JE1 H-2E) 'D*3DJE **HD/."]
};

const cleanArabicTitles = {
  "what-is": "F81) 9'E)",
  "start-here": "'(/# EF GF'",
  "ai-with-kabeeri": "CJA J9ED AI /'.D C(J1J",
  "capabilities": "B/1'* 'DF8'E",
  "repository-layout": "*F8JE 'DE3*H/9",
  "new-project": "(/! *7(JB ,/J/",
  "existing-kabeeri-project": "'3*CE'D E41H9 C(J1J",
  "existing-non-kabeeri-project": "'9*E'/ *7(JB B'&E",
  "delivery-mode": "'.*J'1 Agile #H Structured",
  "agile-delivery": "'D*3DJE 'D#,'JD",
  "structured-delivery": "'D*3DJE 'DEF8E",
  "questionnaire-engine": "E-1C 'D#3&D)",
  "product-blueprints": ".1'&7 'DEF*,'*",
  "data-design": "*5EJE 'D(J'F'*",
  "ui-ux-advisor": "E3'9/ *5EJE 'DH',G'*",
  "vibe-first": "E3'1 Vibe-first",
  "task-governance": "-HCE) 'D*'3C'*",
  "app-boundary": "-HCE) -/H/ 'D*7(JB'*",
  "workstreams-scope": "E3'1'* 'D9ED H'DF7'B",
  "prompt-packs": "-2E 'D(1HE(*",
  "dashboard-monitoring": "'D/'4(H1/ 'D-J",
  "ai-cost-control": "'D*-CE AJ *CDA) AI",
  "multi-ai-governance": "-HCE) *9// HCD'! AI",
  "github-release": "GitHub H(H'('* 'D%5/'1",
  "practical-examples": "3(9) *7(JB'* 9EDJ)",
  "example-ecommerce": "E+'D: E*,1 %DC*1HFJ",
  "example-ai-team-ecommerce": "E+'D: 3 E7H1J AI D(F'! E*,1",
  "example-blog": "E+'D: E/HF) 4.5J)",
  "example-wordpress-digital-agency": "E+'D: WordPress D41C) *3HJB 1BEJ",
  "example-dental-clinic": "E+'D: 9J'/) #3F'F H-,H2'*",
  "example-crm": "E+'D: CRM '-*1'AJ",
  "example-mobile-commerce": "E+'D: *7(JB EH('JD DDE*,1",
  "example-pos": "E+'D: POS 3H(1E'1C*",
  "troubleshooting": "-D 'DE4CD'*"
};

pages.forEach((page) => {
  page[2] = cleanArabicTitles[page[0]] || page[2];
  if (docs.ar.pages[page[0]]) docs.ar.pages[page[0]].arTitle = page[2];
});

capabilityRows.ar = [
  ["E-1C CLI", "J4:D 9EDJ'* E3'-) 'D9ED H'D*-BB H'D*'3C'* H'D/'4(H1/ H'D*:DJA H(H'('* 'D%5/'1.", "`bin/kvdf.js`, `src/cli/`, `docs/cli/CLI_COMMAND_REFERENCE.md`"],
  ["*F8JE 'DE3*H/9", "JF8E C(J1J %DI runtime Hknowledge Hpacks Hintegrations Hschemas Hdocs Htests H-'D) -J).", "`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`"],
  ["-'D) E3'-) 'D9ED", "*.2F -BJB) 'DE41H9 H'D*'3C'* H'D3J'3'* H'D*B'1J1 H'D*HCF2 H'D*CDA) H'D'D*B'7'* H3,D 'D*/BJB.", "`.kabeeri/`"],
  ["Vibe-first UX", "J3E- DDE7H1 ('DCD'E 'D7(J9J (JFE' J-HDG C(J1J %DI 'B*1'-'* H.77 H'D*B'7'* HED.5'* E-CHE).", "`knowledge/vibe_ux/`, `.kabeeri/interactions/`"],
  ["E3'9/ FE7 'D*3DJE", "J3'9/ 9DI '.*J'1 Agile #H Structured -3( 'D:EH6 H+('* 'DF7'B H'D'9*E'/'* H'DE.'71.", "`knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`"],
  [".1'&7 'DEF*,'*", "JAGE #F8E) 'D3HB E+D E*,1 HERP HCRM HPOS H#.('1 HE/HF) H-,2 H*H5JD HEH('JD.", "`knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`"],
  ["*5EJE 'D(J'F'*", "J14/ *5EJE B'9/) 'D(J'F'* EF /H1) 'D9ED H'D9D'B'* H'DBJH/ H'DDB7'* H'D*/BJB H'DE9'ED'* H'D*B'1J1.", "`knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`"],
  ["Agile Runtime", "J/J1 'D('C DH, H'D%(JC3 H'D3*H1J2 H'D'3(1F* H'DE1',9'* H'D319) H'DE9HB'*.", "`knowledge/agile_delivery/`, `.kabeeri/agile.json`"],
  ["Structured Runtime", "J/J1 'DE*7D('* H'DE1'-D H'DE.1,'* H'D**(9 H'DE.'71 H7D('* 'D*:JJ1 H(H'('* 'DE1'-D.", "`knowledge/delivery_modes/`, `.kabeeri/structured.json`"],
  ["E-1C 'D#3&D)", "J,E9 'D%,'('* 'DEGE) AB7 HJA9D EF'7B 'DF8'E HJC4A 'DFH'B5 HJHD/ *'3C'*.", "`knowledge/questionnaires/`, `knowledge/questionnaire_engine/`"],
  ["-2E 'D(1HE(*", "*HA1 *9DJE'* H'9J) ('DA1JEH1C DD'1'AJD H1J#C* HNext.js HVue HAngular HDjango HFastAPI HWordPress HExpo H:J1G'.", "`packs/prompt_packs/`"],
  ["-HCE) 'D*'3C'*", "*-HD 'D9ED %DI H-/'* E-//) 'DE5/1 H'DF7'B H'DE1',9 HE9'JJ1 'DB(HD H'D*HCF2.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
  ["-HCE) -/H/ 'D*7(JB'*", "*3E- (*7(JB'* E1*(7) /'.D EF*, H'-/ H*EF9 .D7 EF*,'* :J1 E1*(7) AJ AHD/1 H'-/.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
  ["-HCE) F7'B 'D*FAJ0", "*1(7 'D*'3C'* H'D*7(JB'* HE3'1'* 'D9ED H'DEDA'* 'DE3EH-) H'D#BA'D H*HCF2 'D*'3C.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
  ["-HCE) 'D*5EJE", "*-HD E5'/1 'D*5EJE %DI EH'5A'* F5J) H5A-'* H9BH/ ECHF'* HA-H5'* (51J) E9*E/).", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
  ["E3'9/ UI/UX", "JB*1- #FE'7 'DH',G) H'DECHF'* HBH'D( 'D5A-'* HBH'9/ SEO/GEO H%14'/ 'D/'4(H1/ H'DEH('JD.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
  ["ADR H*'1J. *4:JD AI", "J-A8 B1'1'* 'DE9E'1J) H*4:JD'* AI 'DEB(HD) #H 'DE1AH6) .'1, 0'C1) 'D4'*.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
  ["'D*-CE AJ *CDA) AI", "J**(9 'D'3*./'E H'DEJ2'FJ'* H-2E 'D3J'B H'D*B/J1 'DE3(B H*H,JG 'DEH/JD'* H'DG/1.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
  ["'D/'4(H1/ 'D-J", "J916 'D-'D) 'D*BFJ) H'D*,'1J) H'D-HCE) H'D*'3C'* H'D*7(JB'* H'D*CDA) H'D3J'3'*.", "`docs/reports/dashboard/`, `.kabeeri/dashboard/`"],
  ["GitHub Sync", "J.77 labels Hmilestones Hissues H'D%5/'1'* E9 dry-run 'A*1'6J H(H'('* C*'() E$C/).", "`plugins/github_sync/`, `plugins/github/`"],
  ["Policy Gates", "*EF9 'D*-BB #H 'D%5/'1 #H 'D*3DJE #H 'D#EF #H 'DG,1) #H C*'() GitHub (4CD :J1 "EF.", "`schemas/policy*.json`, `.kabeeri/policies/`"],
  ["'D*:DJA H'D*1BJ)", "JA-5 ,'G2J) npm package H*H'AB *1BJ) E3'-'* 'D9ED.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
];

docs.ar.ui = {
  eyebrow: "*H+JB Kabeeri VDF",
  beginner: "41- E(37",
  guide: "/DJD 'DE7H1",
  steps: ".'17) 'D71JB 'DEB*1-)",
  checklist: "B'&E) 'D,'G2J)",
  commands: "#H'E1 CLI DG0G 'DB/1)",
  details: "*A'5JD 9EJB)",
  mistakes: "3JF'1JHG'* A4D 4'&9)",
  source: "E5/1 'D-BJB)",
  search: "'(-+ AJ 'D/DJD",
  filter: "*5AJ)",
  cliCommand: "'D#E1",
  cliDescription: "'DH5A"
};

docs.en.ui = {
  ...docs.en.ui,
  commands: "CLI Commands For This Capability",
  cliCommand: "Command",
  cliDescription: "Description"
};

function c(command, en, ar) {
  return { command, en, ar };
}

const pageCommandCatalog = {
  "what-is": [
    c("node bin/kvdf.js --help", "Show the complete local CLI surface available in this checkout.", "J916 CD #H'E1 CLI 'DE*'-) A9DJK' AJ G0' 'D%5/'1 'DE-DJ."),
    c("node bin/kvdf.js validate", "Validate repository assets, runtime JSON state, schemas, policies, prompt packs, and workspace health.", "JA-5 EDA'* 'DF8'E H'D-'D) 'D-J) H'D@ schemas H'D3J'3'* H'D-2E H5-) E3'-) 'D9ED."),
    c("node bin/kvdf.js structure map", "Show the repository organization map so the developer knows where every system area lives.", "J916 .1J7) *F8JE 'DE3*H/9 -*I J91A 'DE7H1 EC'F CD EF7B) AJ 'DF8'E."),
    c("node bin/kvdf.js dashboard state", "Print the live workspace state that powers the dashboard and resume flow.", "J916 'D-'D) 'D-J) 'D*J J9*E/ 9DJG' 'D/'4(H1/ H'3*CE'D 'D9ED.")
  ],
  "start-here": [
    c("node bin/kvdf.js validate", "Start by checking whether Kabeeri state and contracts are healthy.", "'(/# (A-5 5-) -'D) C(J1J H'D9BH/ B(D #J *FAJ0."),
    c("node bin/kvdf.js questionnaire plan \"Describe the app you want\"", "Generate the first focused question plan for a new or unclear product idea.", "JF4& .7) #3&D) E1C2) D#HD AGE DAC1) 'D*7(JB."),
    c("node bin/kvdf.js delivery recommend \"Describe the app you want\"", "Ask Kabeeri to recommend Agile or Structured delivery with reasons.", "J,9D C(J1J JB*1- Agile #H Structured E9 'D#3('(."),
    c("node bin/kvdf.js blueprint recommend \"Describe the app you want\"", "Map the idea to a known product blueprint such as ecommerce, CRM, POS, blog, or booking.", "J1(7 'DAC1) (.1J7) EF*, E91HA) E+D E*,1 #H CRM #H POS #H E/HF) #H -,2."),
    c("node bin/kvdf.js task tracker --json", "Inspect current tasks as machine-readable state for AI and dashboard use.", "J916 'D*'3C'* (5J:) JSON EAJ/) DD0C'! 'D'57F'9J H'D/'4(H1/.")
  ],
  "developer-onboarding": [
    c("node bin/kvdf.js onboarding", "Show the guided first-session route for the current workspace.", "ï¿½`Ø¹Ø±Ø¶ Ø®Ø· Ø§ï¿½Ø¬ï¿½Ø³Ø© Ø§ï¿½Ø£ï¿½ï¿½ï¿½ï¿½0 Ø§ï¿½ï¿½&ï¿½ï¿½Ø¬ï¿½! ï¿½ï¿½ï¿½&Ø³Ø§Ø­Ø© Ø§ï¿½Ø­Ø§ï¿½ï¿½`Ø©."),
    c("node bin/kvdf.js resume --json", "Inspect the exact current track, workspace mode, and next action.", "ï¿½`ÙØ­Øµ Ø§ï¿½ï¿½&Ø³Ø§Ø± Ø§ï¿½Ø­Ø§ï¿½ï¿½` Ø¨Ø§ï¿½Ø¯ï¿½Ø© ï¿½ï¿½ï¿½ï¿½Ø¶Ø¹ Ø§ï¿½ï¿½&Ø³Ø§Ø­Ø© ï¿½ï¿½Ø§ï¿½Ø®Ø·ï¿½ï¿½Ø© Ø§ï¿½ØªØ§ï¿½ï¿½`Ø©."),
    c("node bin/kvdf.js docs manifest", "Open the generated documentation manifest before editing the site.", "ï¿½`Ø¹Ø±Ø¶ manifest Ø§ï¿½ï¿½ï¿½Ø«Ø§Ø¦ï¿½ Ø§ï¿½ï¿½&ï¿½ï¿½ï¿½Ø¯ ï¿½Ø¨ï¿½ ØªØ¹Ø¯ï¿½`ï¿½ Ø§ï¿½ï¿½&ï¿½ï¿½ï¿½Ø¹."),
    c("node bin/kvdf.js dashboard state", "Read the live workspace state before starting a first task.", "ï¿½`ï¿½Ø±Ø£ Ø§ï¿½Ø­Ø§ï¿½Ø© Ø§ï¿½Ø­ï¿½`Ø© ï¿½Ø¨ï¿½ Ø¨Ø¯Ø¡ Ø£ï¿½ï¿½ï¿½ ØªØ§Ø³Ù’.")
  ],
  "install-profiles": [
    c("git clone <repo-url> kabeeri-vdf", "Download Kabeeri from GitHub into a local folder.", "J-ED C(J1J EF GitHub /'.D AHD/1 E-DJ."),
    c("cd kabeeri-vdf", "Enter the cloned Kabeeri repository.", "J/.D %DI AHD/1 'D1J(H (9/ 'D*-EJD."),
    c("npm install", "Install Node.js dependencies for the local Kabeeri checkout.", "J+(* '9*E'/'* Node.js DDF3.) 'DE-DJ)."),
    c("npm run kvdf -- --help", "Run the CLI before the `kvdf` binary is linked or installed.", "J4:D CLI B(D #F J5(- #E1 `kvdf` E1(H7K' #H E+(*K'."),
    c("npm run kvdf -- validate", "Validate the cloned repository and workspace state.", "JA-5 'D1J(H H-'D) E3'-) 'D9ED (9/ 'D*-EJD."),
    c("kvdf docs open", "Open the live documentation site in the default browser.", "JA*- EHB9 'DH+'&B 'D-J AJ 'DE*5A- 'D'A*1'6J."),
    c("npm run kvdf -- create --profile standard --output my-project", "Create a project from the recommended standard profile before direct `kvdf` is available.", "JF4& E41H9K' ((1HA'JD standard B(D *HA1 `kvdf` E('41)."),
    c("kvdf create --profile lite --output my-project", "Create the smallest practical starter project.", "JF4& #5:1 E41H9 9EDJ DD(/!."),
    c("kvdf create --profile standard --output my-project", "Create the recommended default project setup.", "JF4& 'D%9/'/ 'D'A*1'6J 'DEH5I (G."),
    c("kvdf create --profile enterprise --output my-project", "Create the full governance-oriented project setup.", "JF4& %9/'/K' C'EDK' DD-HCE) H'DE4'1J9 'DC(J1).")
  ],
  "ai-with-kabeeri": [
    c("node bin/kvdf.js vibe \"Build an ecommerce store\"", "Turn natural language into governed suggested tasks instead of executing blindly.", "J-HD 'DCD'E 'D7(J9J %DI 'B*1'-'* *'3C'* E-CHE) (/D 'D*FAJ0 'D94H'&J."),
    c("node bin/kvdf.js docs serve --port auto --open", "Serve the Kabeeri documentation site locally and open it in the browser.", "J4:D EHB9 H+'&B C(J1J E-DJK' HJA*-G AJ 'DE*5A-."),
    c("node bin/kvdf.js docs validate --json", "Validate the docs site pages, generated contracts, and localized content before publishing.", "JA-5 5A-'* EHB9 'DH+'&B H'D9BH/ 'DEHD/) H'DE-*HI 'DE-DJ B(D 'DF41."),
    c("node bin/kvdf.js context-pack create --task task-001", "Create a compact AI context pack for one task to reduce token waste.", "JF4& -2E) 3J'B 5:J1) D*'3C H'-/ D*BDJD '3*GD'C 'D*HCF2."),
    c("node bin/kvdf.js ai-run provenance --json", "Inspect AI-run provenance tied to tasks, sessions, acceptance, and durable records.", "J916 provenance D*FAJ0'* AI 'DE1*(7) ('D*'3C'* H'D,D3'* H'DB(HD H'D3,D'* 'D/'&E)."),
    c("node bin/kvdf.js prompt-pack compose react --task task-001", "Compose framework-aware instructions for AI using the task context.", "J1C( *9DJE'* H'9J) ('DA1JEH1C DD0C'! 'D'57F'9J -3( 'D*'3C."),
    c("node bin/kvdf.js session start --task task-001 --developer agent-001", "Start a governed AI session tied to a task and developer or AI agent.", "J(/# ,D3) AI E-CHE) HE1(H7) (*'3C HE7H1 #H HCJD AI."),
    c("node bin/kvdf.js session end session-001 --input-tokens 1000 --output-tokens 500 --files src/example --summary \"Done\"", "Close the AI session with usage, touched files, summary, checks, and risks.", "JFGJ ,D3) AI E9 *3,JD 'D*HCF2 H'DEDA'* H'DED.5 H'DA-H5'* H'DE.'71.")
  ],
  "capabilities": [
    c("node bin/kvdf.js --help", "Discover every implemented command before documenting or using a capability.", "'C*4A CD #E1 EFA0 B(D *H+JB #H '3*./'E #J B/1)."),
    c("node bin/kvdf.js capability list", "List the adaptive capability areas known to the questionnaire system.", "J916 EF'7B 'DB/1'* 'DE91HA) DF8'E 'D#3&D)."),
    c("node bin/kvdf.js capability show payments_billing", "Show one capability area and the questions or coverage related to it.", "J916 B/1) H'-/) H'D#3&D) #H 'D*:7J) 'DE1*(7) (G'."),
    c("node bin/kvdf.js capability map", "Print the capability map used by adaptive questionnaire coverage.", "J916 .1J7) 'DB/1'* 'DE3*./E) AJ *:7J) 'D#3&D)."),
    c("node bin/kvdf.js validate", "Confirm that the documented capabilities still match real runtime assets.", "J*#C/ #F 'DB/1'* 'DEH+B) E' 2'D* E*H'AB) E9 'D#5HD 'D-BJBJ)."),
    c("node bin/kvdf.js docs validate --json", "Validate the docs site and localized guidance against the current command surface.", "JA-5 EHB9 'DH+'&B H'D%14'/'* 'DE-DJ) EB'(D 37- 'D#H'E1 'D-'DJ.")
  ],
  "repository-layout": [
    c("node bin/kvdf.js structure map", "Print the Kabeeri folder map and current top-level groups.", "J916 .1J7) AHD/1'* C(J1J H'DE,EH9'* 'D1&J3J)."),
    c("node bin/kvdf.js structure map --json", "Print the same foldering map as JSON for automation or AI parsing.", "J916 .1J7) 'DAHD/1'* (5J:) JSON DD#*E*) #H B1'!) AI."),
    c("node bin/kvdf.js structure show standard_systems", "Show how a legacy or logical area maps into the new repository layout.", "J916 CJA *1*(7 EF7B) EF7BJ) #H B/JE) ('D*F8JE 'D,/J/."),
    c("node bin/kvdf.js structure validate", "Validate the repository foldering map and root folder classification.", "JA-5 5-) .1J7) *F8JE 'DE3*H/9 H*5FJA 'D,0H1."),
    c("node bin/kvdf.js validate foldering", "Run the foldering-specific validation path.", "J4:D A-5 *F8JE 'DAHD/1'* *-/J/K'.")
  ],
  "new-project": [
    c("node bin/kvdf.js init --profile standard --mode agile", "Initialize a standard Kabeeri workspace for a new Agile product.", "JF4& E3'-) 9ED BJ'3J) DE41H9 ,/J/ (FE7 Agile."),
    c("node bin/kvdf.js init --profile standard --mode structured", "Initialize a standard workspace for a more planned Structured product.", "JF4& E3'-) 9ED BJ'3J) DE41H9 J-*', Structured."),
    c("node bin/kvdf.js dashboard generate", "Generate dashboard state after workspace initialization.", "JHD/ -'D) 'D/'4(H1/ (9/ %F4'! E3'-) 'D9ED."),
    c("node bin/kvdf.js vibe \"I want to build an ecommerce store\"", "Start from natural language and let Kabeeri create reviewable suggested work.", "J(/# EF CD'E 7(J9J HJ,9D C(J1J JB*1- 9ED B'(D DDE1',9)."),
    c("node bin/kvdf.js track status", "Check whether the active track is configured and whether a session is active.", "JA-5 -'D) 'DE3'1 'DF47 HGD *H,/ ,D3) A9'D)."),
    c("node bin/kvdf.js questionnaire plan \"Build an ecommerce store\"", "Generate the first focused project-intake questions.", "JF4& #HD #3&D) E1C2) DAGE 'DE41H9."),
    c("node bin/kvdf.js blueprint recommend \"Build an ecommerce store\"", "Choose the closest market product blueprint.", "JB*1- #B1( .1J7) EF*, EF #F8E) 'D3HB."),
    c("node bin/kvdf.js data-design context ecommerce", "Create database design context from the selected product blueprint.", "JF4& 3J'B *5EJE B'9/) 'D(J'F'* EF .1J7) 'DEF*,."),
    c("node bin/kvdf.js design recommend ecommerce", "Recommend UI/UX patterns and page/component groups.", "JB*1- FE7 'DH',G) H'D5A-'* H'DECHF'*."),
    c("node bin/kvdf.js prompt-pack list", "List available framework prompt packs before implementation.", "J916 -2E 'D(1HE(* 'DE*'-) B(D 'D*FAJ0.")
  ],
  "existing-kabeeri-project": [
    c("node bin/kvdf.js validate", "Check existing workspace health before continuing work.", "JA-5 5-) E3'-) 'D9ED 'D-'DJ) B(D 'D'3*CE'D."),
    c("node bin/kvdf.js dashboard state", "Read current live project status.", "J916 -'D) 'DE41H9 'D-J)."),
    c("node bin/kvdf.js task tracker --json", "Read task board state for continuation and AI context.", "J916 -'D) 'D*'3C'* DD'3*CE'D H3J'B AI."),
    c("node bin/kvdf.js capture list", "Show post-work captures that may need review or conversion to tasks.", "J916 'D'D*B'7'* (9/ 'D9ED 'D*J B/ *-*', E1',9) #H *-HJD D*'3C'*."),
    c("node bin/kvdf.js policy status", "Show the latest policy results and blockers.", "J916 ".1 F*'&, 'D3J'3'* H'DEH'F9.")
  ],
  "existing-non-kabeeri-project": [
    c("node bin/kvdf.js init --profile standard --mode structured", "Create Kabeeri state around an existing project with a controlled adoption mode.", "JF4& -'D) C(J1J -HD E41H9 B'&E (FE7 '9*E'/ EF8E."),
    c("node bin/kvdf.js project analyze --path .", "Inspect the existing app folder, detect stacks, app boundaries, workstreams, and adoption risks.", "J-DD AHD/1 'D*7(JB 'DB'&E HJC*4A 'DA1JEH1C'* H-/H/ 'D*7(JB'* HE3'1'* 'D9ED H'DE.'71."),
    c("node bin/kvdf.js project analyze --path . --json", "Return the adoption analysis in JSON for AI or dashboard consumption.", "J916 *-DJD 'DE41H9 'DB'&E (5J:) JSON DD0C'! 'D'57F'9J #H 'D/'4(H1/."),
    c("node bin/kvdf.js app list", "List registered customer apps after adoption mapping.", "J916 'D*7(JB'* 'DE3,D) (9/ 1(7 'DE41H9."),
    c("node bin/kvdf.js workstream list", "List workstreams used to govern the adopted codebase.", "J916 E3'1'* 'D9ED 'D*J *-CE 'DCH/ 'DB'&E."),
    c("node bin/kvdf.js adr list", "Review architecture decisions captured during adoption.", "J916 B1'1'* 'DE9E'1J) 'DE3,D) #+F'! 'D'9*E'/.")
  ],
  "delivery-mode": [
    c("node bin/kvdf.js delivery recommend \"Describe the project\"", "Score Agile vs Structured and return rationale and next actions.", "JB'1F Agile HStructured HJ1,9 'D#3('( H'D.7H'* 'D*'DJ)."),
    c("node bin/kvdf.js delivery recommend \"Describe the project\" --json", "Return the delivery recommendation as JSON for automation.", "J916 *H5J) FE7 'D*3DJE (5J:) JSON DD#*E*)."),
    c("node bin/kvdf.js delivery choose agile --reason \"MVP discovery\"", "Record the delivery decision to use Agile.", "J3,D B1'1 '3*./'E Agile E9 'D3((."),
    c("node bin/kvdf.js delivery choose structured --reason \"Known compliant scope\"", "Record the decision to use Structured delivery.", "J3,D B1'1 '3*./'E Structured E9 'D3((."),
    c("node bin/kvdf.js delivery history", "Show previous recommendations and delivery decisions.", "J916 *'1J. 'D*H5J'* HB1'1'* FE7 'D*3DJE.")
  ],
  "agile-delivery": [
    c("node bin/kvdf.js agile summary", "Show Agile runtime state: backlog, epics, stories, sprints, and reviews.", "J916 -'D) Agile: 'D('C DH, H'D%(JC3 H'D3*H1J2 H'D'3(1F*'* H'DE1',9'*."),
    c("node bin/kvdf.js agile backlog add --id BL-001 --title \"Checkout MVP\" --type epic --priority high --source \"vision\"", "Add a backlog item with priority and source provenance.", "J6JA 9F51 ('C DH, E9 'D#HDHJ) H'DE5/1."),
    c("node bin/kvdf.js agile epic create --id epic-checkout --title \"Checkout\" --goal \"Customers can place orders\" --users customer --source \"vision\"", "Create an Agile epic with goal, users, and source.", "JF4& epic (G/A HE3*./EJF HE5/1."),
    c("node bin/kvdf.js agile story create --id story-checkout-001 --epic epic-checkout --title \"Cart checkout\" --role customer --want \"pay\" --value \"complete order\" --points 5 --workstream backend --acceptance \"Order is created\" --reviewer lead-001", "Create a user story with role, value, points, workstream, acceptance, and reviewer.", "JF4& user story (/H1 HBJE) HFB'7 HE3'1 9ED HE9'JJ1 B(HD HE1',9."),
    c("node bin/kvdf.js agile story ready story-checkout-001", "Mark a story ready when it has enough detail.", "J-HD 'D3*H1J %DI ,'G2) 9F/E' *C*ED *A'5JDG'."),
    c("node bin/kvdf.js agile story task story-checkout-001 --task task-001", "Link an Agile story to a governed Kabeeri task.", "J1(7 'D3*H1J (*'3C E-CHE AJ C(J1J."),
    c("node bin/kvdf.js agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10 --goal \"Checkout foundation\"", "Plan a sprint from ready stories and capacity.", "J.77 '3(1F* EF 3*H1J2 ,'G2) H39) E-//)."),
    c("node bin/kvdf.js agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted", "Record sprint review and accepted stories.", "J3,D E1',9) 'D'3(1F* H'D3*H1J2 'DEB(HD)."),
    c("node bin/kvdf.js validate agile", "Validate Agile runtime consistency.", "JA-5 '*3'B -'D) Agile.")
  ],
  "structured-delivery": [
    c("node bin/kvdf.js structured health", "Show Structured delivery health and unresolved issues.", "J916 5-) Structured H'DE4'CD 'DEA*H-)."),
    c("node bin/kvdf.js structured requirement add --id REQ-001 --title \"Email login\" --source questionnaire --acceptance \"User can login\"", "Add a requirement with source and acceptance criteria.", "J6JA E*7D(K' (E5/1 HE9'JJ1 B(HD."),
    c("node bin/kvdf.js structured requirement approve REQ-001 --reason \"Reviewed\"", "Approve a requirement before implementation planning.", "J9*E/ 'DE*7D( B(D *.7J7 'D*FAJ0."),
    c("node bin/kvdf.js structured phase plan phase-001 --requirements REQ-001 --goal \"Authentication foundation\"", "Plan a phase around approved requirements.", "J.77 E1-D) (F'!K 9DI E*7D('* E9*E/)."),
    c("node bin/kvdf.js structured task REQ-001 --task task-001", "Trace a requirement to a governed implementation task.", "J1(7 'DE*7D( (*'3C *FAJ0 E-CHE."),
    c("node bin/kvdf.js structured deliverable add --id deliv-001 --phase phase-001 --title \"Authentication specification\" --acceptance \"Reviewed\"", "Add a phase deliverable with acceptance criteria.", "J6JA E.1, E1-D) (E9'JJ1 B(HD."),
    c("node bin/kvdf.js structured gate check phase-001", "Check whether a phase can pass its gate.", "JA-5 GD 'DE1-D) JECFG' 9(H1 'D(H'()."),
    c("node bin/kvdf.js validate structured", "Validate Structured runtime consistency.", "JA-5 '*3'B -'D) Structured.")
  ],
  "questionnaire-engine": [
    c("node bin/kvdf.js questionnaire list", "List questionnaire groups and available sources.", "J916 E,EH9'* 'D#3&D) H'DE5'/1 'DE*'-)."),
    c("node bin/kvdf.js questionnaire flow", "Show the questionnaire flow and activation logic.", "J916 */AB 'D#3&D) HEF7B 'D*A9JD."),
    c("node bin/kvdf.js questionnaire plan \"Build CRM\"", "Generate an adaptive intake plan from the product description.", "JF4& .7) #3&D) *CJAJ) EF H5A 'DEF*,."),
    c("node bin/kvdf.js questionnaire answer entry.project_type --value saas", "Record one questionnaire answer into local runtime state.", "J3,D %,'() H'-/) AJ -'D) C(J1J."),
    c("node bin/kvdf.js questionnaire coverage", "Generate the coverage matrix showing answered and missing areas.", "JF4& E5AHA) 'D*:7J) DDEF'7B 'DE,'() H'DF'B5)."),
    c("node bin/kvdf.js questionnaire missing", "Write a missing-answers report for the next session.", "JF4& *B1J1 'D%,'('* 'DF'B5) DD,D3) 'D*'DJ)."),
    c("node bin/kvdf.js questionnaire generate-tasks", "Generate proposed tasks from questionnaire gaps and answers.", "JHD/ *'3C'* EB*1-) EF 'D%,'('* H'DA,H'*."),
    c("node bin/kvdf.js validate questionnaire", "Validate questionnaire runtime records.", "JA-5 3,D'* F8'E 'D#3&D).")
  ],
  "product-blueprints": [
    c("node bin/kvdf.js blueprint list", "List all available market product blueprints.", "J916 CD .1'&7 'DEF*,'* 'DE*'-)."),
    c("node bin/kvdf.js blueprint show ecommerce", "Show one blueprint with channels, modules, pages, entities, and risks.", "J916 .1J7) EF*, H'-/) ('DBFH'* H'DEH/JHD'* H'D5A-'* H'DCJ'F'* H'DE.'71."),
    c("node bin/kvdf.js blueprint recommend \"Build ecommerce store with payments\"", "Recommend the closest blueprint from natural language.", "JB*1- #B1( .1J7) EF*, EF 'DH5A 'D7(J9J."),
    c("node bin/kvdf.js blueprint select ecommerce --delivery structured --reason \"Large catalog\"", "Record the selected blueprint and delivery preference.", "J3,D .1J7) 'DEF*, 'DE.*'1) HFE7 'D*3DJE."),
    c("node bin/kvdf.js blueprint context ecommerce --json", "Export compact AI-ready context for one product blueprint.", "J5/1 3J'BK' E.*51K' ,'G2K' DD0C'! 'D'57F'9J D.1J7) EF*,."),
    c("node bin/kvdf.js blueprint history", "Show previous blueprint recommendations and selections.", "J916 *'1J. *H5J'* H'.*J'1'* .1'&7 'DEF*,'*.")
  ],
  "data-design": [
    c("node bin/kvdf.js data-design principles", "List database design principles used by Kabeeri.", "J916 E('/& *5EJE BH'9/ 'D(J'F'* AJ C(J1J."),
    c("node bin/kvdf.js data-design principle workflow_first", "Show one principle in detail.", "J916 E(/# H'-/ ('D*A5JD."),
    c("node bin/kvdf.js data-design modules", "List data modules such as core, commerce, inventory, CMS, mobile, and accounting.", "J916 EH/JHD'* 'D(J'F'* E+D core Hcommerce Hinventory HCMS Hmobile Haccounting."),
    c("node bin/kvdf.js data-design module commerce", "Show entities and rules for one data module.", "J916 CJ'F'* HBH'9/ EH/JHD (J'F'* H'-/."),
    c("node bin/kvdf.js data-design context ecommerce --json", "Generate database context for a product blueprint.", "JF4& 3J'B B'9/) (J'F'* D.1J7) EF*,."),
    c("node bin/kvdf.js data-design recommend \"Build ecommerce store with payments inventory mobile app\" --json", "Recommend database modules and risk flags from a product description.", "JB*1- EH/JHD'* B'9/) 'D(J'F'* H'DE.'71 EF H5A 'DEF*,."),
    c("node bin/kvdf.js data-design checklist", "Print the database approval checklist.", "J916 B'&E) B(HD *5EJE B'9/) 'D(J'F'*."),
    c("node bin/kvdf.js data-design review \"orders table with price float and items json\"", "Review a proposed design for common modeling problems.", "J1',9 *5EJEK' EB*1-K' D'C*4'A E4'CD 'DFE0,) 'D4'&9)."),
    c("node bin/kvdf.js data-design history", "Show generated data-design contexts and recommendations.", "J916 *'1J. 3J'B'* H*H5J'* *5EJE 'D(J'F'*.")
  ],
  "ui-ux-advisor": [
    c("node bin/kvdf.js design recommend ecommerce --json", "Recommend UI/UX pattern, components, templates, and SEO rules for ecommerce.", "JB*1- FE7 UI/UX HECHF'* HBH'D( HBH'9/ SEO DDE*,1."),
    c("node bin/kvdf.js design recommend news_website --json", "Recommend interface structure for a news website.", "JB*1- (FJ) H',G) EHB9 #.('1."),
    c("node bin/kvdf.js design recommend erp --json", "Recommend data-dense dashboard patterns for ERP-like products.", "JB*1- #FE'7 /'4(H1/ C+JA) 'D(J'F'* D#F8E) ERP."),
    c("node bin/kvdf.js design ui-checklist", "Print the UI/UX approval checklist.", "J916 B'&E) B(HD UI/UX."),
    c("node bin/kvdf.js design ui-review \"Describe the page\"", "Review a UI proposal for semantic HTML, responsiveness, states, accessibility, and SEO/GEO.", "J1',9 'B*1'- H',G) EF F'-J) 'D/D'D) H'D*,'H( H'D-'D'* H'DH5HD HSEO/GEO."),
    c("node bin/kvdf.js design ui-history", "Show prior UI advisor recommendations and reviews.", "J916 *'1J. *H5J'* HE1',9'* E3'9/ UI."),
    c("node bin/kvdf.js validate ui-design", "Validate UI design advisor runtime state.", "JA-5 -'D) E3'9/ *5EJE 'DH',G'*.")
  ],
  "ui-ux-reference-library": [
    c("kvdf design reference-list", "List approved UI/UX reference patterns.", "J916 FE'0, UI/UX 'DE1,9J) 'DE9*E/)."),
    c("kvdf design reference-show ADMIT-ADB01", "Show one reference pattern, components, rules, states, and source file.", "J916 FEH0,K' E1,9JK' (CD ECHF'*G HBH'9/G H-'D'*G."),
    c("kvdf design reference-recommend \"admin ecommerce dashboard with orders and revenue\"", "Recommend the best reference pattern from a short project brief.", "JB*1- #A6D FEH0, E1,9J EF H5A E.*51 DDE41H9."),
    c("kvdf design reference-questions ADMIT-ADB02", "Generate UI/UX discovery questions from a chosen reference.", "JF4& #3&D) *5EJE H',G'* EF FEH0, E.*'1."),
    c("kvdf design reference-tasks ADMIT-ADB02 --scope \"ecommerce admin dashboard\"", "Create governed design-system, page-spec, component-contract, and QA tasks from the reference.", "JF4& *'3C'* -HCE) DD*5EJE H'DEH'5A'* H'DECHF'* H'D,H/) EF 'DE1,9.")
  ],
  "vibe-first": [
    c("node bin/kvdf.js vibe \"Add checkout\"", "Classify a natural-language request and create a suggested task card.", "J5FA 7D(K' 7(J9JK' HJF4& C'1* *'3C EB*1-."),
    c("node bin/kvdf.js vibe suggest \"Add checkout API\"", "Explicitly create a suggested task from text.", "JF4& *'3C EB*1- EF 'DF5 (4CD 51J-."),
    c("node bin/kvdf.js ask \"Improve the dashboard\"", "Handle a vague request safely by asking or suggesting smaller work.", "J*9'ED E9 7D( :'E6 (3$'D #H 'B*1'- 9ED #5:1."),
    c("node bin/kvdf.js vibe list", "List suggested Vibe tasks.", "J916 'B*1'-'* Vibe."),
    c("node bin/kvdf.js vibe show suggestion-001", "Show one suggestion card.", "J916 C'1* 'B*1'- H'-/."),
    c("node bin/kvdf.js vibe convert suggestion-001", "Convert an approved suggestion into a governed task.", "J-HD 'B*1'-K' E9*E/K' %DI *'3C E-CHE."),
    c("node bin/kvdf.js vibe reject suggestion-001 --reason \"Too broad\"", "Reject an unsafe or too broad suggestion.", "J1A6 'B*1'-K' H'39K' #H :J1 "EF."),
    c("node bin/kvdf.js vibe plan \"Build an ecommerce store\"", "Split a larger natural request into safer suggested cards.", "JB3E 7D(K' C(J1K' %DI C1H* 'B*1'- #5:1."),
    c("node bin/kvdf.js vibe session start --title \"Planning\"", "Start a Vibe planning session.", "J(/# ,D3) *.7J7 Vibe."),
    c("node bin/kvdf.js vibe brief", "Generate a compact brief for resuming the next session.", "JF4& ED.5K' 5:J1K' D'3*CE'D 'D,D3) 'D*'DJ)."),
    c("node bin/kvdf.js capture scan --summary \"Updated filters\" --files src/cli/index.js", "Preview post-work classification, task matches, missing evidence, and next action without writing a record.", "J916 *5FJA 9ED post-work H'D*'3C'* 'DB1J() H'D#/D) 'DF'B5) /HF *3,JD."),
    c("node bin/kvdf.js capture --summary \"Updated filters\" --files src/cli/index.js --checks \"npm test\"", "Record post-work changes that happened outside a planned task.", "J3,D *:JJ1'* *E* (9/ 'D9ED #H .'1, *'3C E.77."),
    c("node bin/kvdf.js capture evidence capture-001 --checks \"npm test\" --evidence \"manual review\"", "Attach checks and acceptance evidence before resolving the capture.", "J6JA 'DA-H5'* H/DJD 'DB(HD B(D %:D'B 'D'D*B'7."),
    c("node bin/kvdf.js capture reject capture-001 --reason \"Exploration will not continue\"", "Reject a capture that should not become governed work.", "J1A6 'D'D*B'7 %0' DF J*-HD %DI 9ED E-CHE."),
    c("node bin/kvdf.js validate capture", "Validate post-work capture records.", "JA-5 3,D'* post-work capture.")
  ],
  "wordpress-development": [
    c("kvdf wordpress analyze --path . --staging --backup", "Analyze an existing WordPress site and record plugins, themes, WooCommerce signals, risks, forbidden paths, and next actions.", "J-DD EHB9 WordPress B'&E HJ3,D plugins Hthemes H%4'1'* WooCommerce H'DE.'71 H'DE3'1'* 'DEEFH9) H'D.7H'* 'D*'DJ)."),
    c("kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new", "Create a governed plan for a new WordPress corporate website.", "JF4& .7) E-CHE) DEHB9 WordPress 41C) ,/J/."),
    c("kvdf wordpress plan \"Improve existing WooCommerce checkout\" --type woocommerce --mode existing", "Create an adoption/improvement plan for an existing WooCommerce site.", "JF4& .7) '9*E'/ #H *7HJ1 DE*,1 WooCommerce B'&E."),
    c("kvdf wordpress tasks", "Create governed tasks from the latest WordPress plan.", "JF4& *'3C'* E-CHE) EF ".1 .7) WordPress."),
    c("kvdf wordpress scaffold plugin --name \"Business Features\"", "Create a safe custom plugin skeleton under wp-content/plugins.", "JF4& plugin "EF /'.D wp-content/plugins."),
    c("kvdf wordpress scaffold theme --name \"Company Theme\"", "Create a safe custom theme skeleton under wp-content/themes.", "JF4& theme "EF /'.D wp-content/themes."),
    c("kvdf wordpress scaffold child-theme --name \"Company Child\" --parent twentytwentyfour", "Create a child theme skeleton for scoped visual changes.", "JF4& child theme D*9/JD'* 'DH',G) 6EF F7'B "EF."),
    c("kvdf wordpress checklist woocommerce", "Print the WordPress/WooCommerce acceptance checklist.", "J916 B'&E) B(HD WordPress/WooCommerce."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose the WordPress prompt pack for one governed task.", "J1C( WordPress prompt pack D*'3C E-CHE H'-/.")
  ],
  "wordpress-plugins": [
    c("kvdf wordpress plugin plan \"Build a clinic booking plugin\" --name \"Clinic Booking\" --type booking", "Create a governed plugin plan for a booking plugin.", "JF4& .7) E-CHE) D%6'A) -,H2'*."),
    c("kvdf wordpress plugin plan \"Create a WooCommerce checkout add-on\" --name \"Checkout Addon\" --type woocommerce", "Create a governed plugin plan for a WooCommerce extension.", "JF4& .7) E-CHE) D%6'A) WooCommerce."),
    c("kvdf wordpress plugin scaffold --name \"Clinic Booking\"", "Create the plugin folder, bootstrap file, admin/public classes, assets, uninstall file, and README.", "JF4& AHD/1 'D%6'A) HEDA 'D*4:JD Hadmin/public classes Hassets Huninstall HREADME."),
    c("kvdf wordpress plugin tasks", "Create scoped tasks from the latest plugin plan.", "JF4& *'3C'* E-//) 'DF7'B EF ".1 .7) plugin."),
    c("kvdf wordpress plugin tasks --plan wordpress-plugin-plan-001 --json", "Create scoped tasks from a selected plugin plan and return JSON.", "JF4& *'3C'* EF .7) plugin E-//) HJ916 JSON."),
    c("kvdf wordpress plugin checklist", "Print the WordPress plugin acceptance checklist.", "J916 B'&E) B(HD *7HJ1 %6'A'* WordPress."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose WordPress implementation prompts for the selected governed task.", "J1C( (1HE(*'* WordPress D*'3C E-CHE.")
  ],
  "task-governance": [
    c("node bin/kvdf.js task create --title \"Add API\" --sprint sprint-001", "Create a governed task with title and optional sprint.", "JF4& *'3C E-CHE (9FH'F H'3(1F* '.*J'1J."),
    c("node bin/kvdf.js task create --title \"Integration\" --type integration --workstreams backend,public_frontend", "Create a task that intentionally spans multiple workstreams.", "JF4& *'3C *C'ED JE*/ 9E/K' D#C+1 EF E3'1 9ED."),
    c("node bin/kvdf.js task list", "List governed tasks.", "J916 'D*'3C'*."),
    c("node bin/kvdf.js task status --id task-001", "Show current status and details for a task.", "J916 -'D) H*A'5JD *'3C."),
    c("node bin/kvdf.js task assign task-001 --assignee agent-001", "Assign a task to a developer or AI agent.", "J3F/ *'3C DE7H1 #H HCJD AI."),
    c("node bin/kvdf.js task start task-001 --actor agent-001", "Move a task into active execution.", "JFBD 'D*'3C %DI 'D*FAJ0."),
    c("node bin/kvdf.js task review task-001 --actor reviewer-001", "Move a task into review.", "JFBD 'D*'3C %DI 'DE1',9)."),
    c("node bin/kvdf.js task verify task-001 --reviewer lead-001", "Verify a completed task when evidence is ready.", "J*-BB EF *'3C EC*ED 9F/ H,H/ 'D/DJD."),
    c("node bin/kvdf.js task reject task-001", "Reject a task that fails review or verification.", "J1A6 *'3C A4D AJ 'DE1',9) #H 'D*-BB."),
    c("node bin/kvdf.js validate task", "Validate task state and governance rules.", "JA-5 -'D) 'D*'3C'* HBH'9/ -HCE*G'.")
  ],
  "app-boundary": [
    c("node bin/kvdf.js app create --username backend-api --name \"Laravel API\" --type backend --path apps/api-laravel --product \"Store\"", "Register a backend app as part of a product workspace.", "J3,D *7(JB ('C %F/ /'.D E3'-) EF*,."),
    c("node bin/kvdf.js app create --username storefront --name \"React Storefront\" --type frontend --path apps/storefront-react --product \"Store\"", "Register a frontend app in the same product boundary.", "J3,D *7(JB A1HF* %F/ /'.D FA3 -/H/ 'DEF*,."),
    c("node bin/kvdf.js app list", "List registered apps in the current workspace.", "J916 'D*7(JB'* 'DE3,D) AJ E3'-) 'D9ED."),
    c("node bin/kvdf.js app show storefront", "Show one app boundary record.", "J916 3,D -/H/ *7(JB H'-/."),
    c("node bin/kvdf.js app status storefront --status ready_to_publish --workstreams public_frontend", "Update app readiness and associated workstreams.", "J-/+ ,'G2J) 'D*7(JB HE3'1'* 'D9ED 'DE1*(7)."),
    c("node bin/kvdf.js task create --title \"Wire API to storefront\" --type integration --apps backend-api,storefront --workstreams backend,public_frontend", "Create a cross-app integration task only when related apps belong to the same product.", "JF4& *'3C *C'ED (JF *7(JB'* E1*(7) /'.D FA3 'DEF*,."),
    c("node bin/kvdf.js validate routes", "Validate customer app route safety and app boundary rules.", "JA-5 #E'F 1H'(7 'D*7(JB'* H-/H/G'.")
  ],
  "workstreams-scope": [
    c("node bin/kvdf.js workstream list", "List workstream boundaries.", "J916 -/H/ E3'1'* 'D9ED."),
    c("node bin/kvdf.js workstream show backend", "Show paths and review rules for one workstream.", "J916 'DE3'1'* HBH'9/ 'DE1',9) DE3'1 9ED."),
    c("node bin/kvdf.js workstream add --id payments --name \"Payments\" --paths src/payments,app/Payments --review security,contract_safety", "Add a new workstream with paths and review gates.", "J6JA E3'1 9ED ,/J/ (E3'1'* HBH'9/ E1',9)."),
    c("node bin/kvdf.js workstream update backend --paths src/api,app/Http,routes/api.php", "Update allowed paths for an existing workstream.", "J-/+ 'DE3'1'* 'DE3EH-) DE3'1 9ED B'&E."),
    c("node bin/kvdf.js token issue --task task-001 --assignee agent-001", "Issue a scoped task access token derived from task/workstream/app boundaries.", "J5/1 *HCF H5HD E6(H7 -3( -/H/ 'D*'3C H'DE3'1 H'D*7(JB."),
    c("node bin/kvdf.js lock create --type folder --scope src/api --task task-001 --owner agent-001", "Create a lock to prevent overlapping edits.", "JF4& BADK' DEF9 *9/JD'* E*/'.D)."),
    c("node bin/kvdf.js validate workstream", "Validate workstreams, assignments, and scope rules.", "JA-5 E3'1'* 'D9ED H'D%3F'/ H'DF7'B.")
  ],
  "prompt-packs": [
    c("node bin/kvdf.js prompt-pack list", "List all available framework prompt packs.", "J916 CD -2E 'D(1HE(* 'DE*'-)."),
    c("node bin/kvdf.js prompt-pack show laravel", "Show a specific stack prompt pack.", "J916 -2E) (1HE(* DA1JEH1C E9JF."),
    c("node bin/kvdf.js prompt-pack common", "Show common prompt layer instructions applied before stack-specific prompts.", "J916 7(B) 'D(1HE(* 'DE4*1C) B(D (1HE(* 'DA1JEH1C."),
    c("node bin/kvdf.js prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react", "Export a prompt pack into a project folder.", "J5/1 -2E) (1HE(* /'.D AHD/1 E41H9."),
    c("node bin/kvdf.js prompt-pack use react", "Install or copy a prompt pack into the default project prompt location.", "JF3. -2E) (1HE(* %DI 'DEC'F 'D'A*1'6J /'.D 'DE41H9."),
    c("node bin/kvdf.js prompt-pack compose react --task task-001", "Compose a task-aware prompt with common and framework-specific rules.", "J1C( (1HE(* H'9J ('D*'3C E9 'DBH'9/ 'DE4*1C) HBH'9/ 'DA1JEH1C."),
    c("node bin/kvdf.js prompt-pack compositions", "List composed prompts created for tasks.", "J916 'D(1HE(*'* 'DE1C() DD*'3C'*."),
    c("node bin/kvdf.js prompt-pack validate react", "Validate one prompt pack manifest and files.", "JA-5 -2E) (1HE(* H'-/).")
  ],
  "dashboard-monitoring": [
    c("node bin/kvdf.js dashboard generate", "Generate dashboard JSON and derived state from `.kabeeri`.", "JHD/ JSON H-'D) 'D/'4(H1/ EF `.kabeeri`."),
    c("node bin/kvdf.js dashboard state", "Print full live state used by the dashboard API.", "J916 'D-'D) 'D-J) 'DC'ED) 'D*J J3*./EG' API 'D/'4(H1/."),
    c("node bin/kvdf.js dashboard task-tracker", "Print the focused task tracker JSON.", "J916 JSON DH-) **(9 'D*'3C'*."),
    c("node bin/kvdf.js dashboard export", "Export static customer page and private dashboard HTML.", "J5/1 5A-) 'D9EJD H'D/'4(H1/ 'D.'5 C@ HTML +'(*."),
    c("node bin/kvdf.js dashboard ux", "Run Dashboard UX Governance audit.", "J4:D */BJB -HCE) *,1() 'D/'4(H1/."),
    c("node bin/kvdf.js dashboard serve --port auto", "Serve the live dashboard and API locally on an available port.", "J4:D 'D/'4(H1/ 'D-J HAPI E-DJK' 9DI (H1* E*'-."),
    c("node bin/kvdf.js dashboard workspace add --path ../store-a --name \"Store A\"", "Register another KVDF workspace as a linked dashboard summary.", "J3,D E3'-) 9ED C(J1J #.1I CED.5 E1*(7 AJ 'D/'4(H1/."),
    c("node bin/kvdf.js reports live", "Write compact live report JSON for dashboards and automation.", "JC*( *B1J1K' -JK' E.*51K' DD/'4(H1/ H'D#*E*).")
  ],
  "ai-cost-control": [
    c("node bin/kvdf.js pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1 --currency USD", "Set model pricing rules for automatic cost calculation.", "J6(7 BH'9/ *39J1 'DEH/JD D-3'( 'D*CDA) *DB'&JK'."),
    c("node bin/kvdf.js pricing list", "List pricing rules.", "J916 BH'9/ 'D*39J1."),
    c("node bin/kvdf.js usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --workstream backend", "Record AI usage for a governed task.", "J3,D '3*GD'C AI D*'3C E-CHE."),
    c("node bin/kvdf.js usage record --untracked --input-tokens 1000 --output-tokens 500 --cost 0.25 --source ad-hoc-prompt", "Record untracked/ad-hoc usage so it is not invisible.", "J3,D '3*GD'CK' 94H'&JK' -*I D' J.*AJ EF 'D-3'(."),
    c("node bin/kvdf.js usage summary", "Show aggregated token and cost summary.", "J916 ED.5 'D*HCF2 H'D*CDA)."),
    c("node bin/kvdf.js usage efficiency", "Show accepted, rejected, rework, and waste efficiency signals.", "J916 %4'1'* CA'!) 'DE.1,'* 'DEB(HD) H'DE1AH6) H'DG/1."),
    c("node bin/kvdf.js budget approve --task task-001 --tokens 5000 --reason \"Reviewed extra work\"", "Approve a token budget overrun for a task.", "J9*E/ *,'H2 EJ2'FJ) *HCF2 D*'3C."),
    c("node bin/kvdf.js preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4", "Estimate token/cost/risk before sending context to AI.", "JB/1 'D*HCF2 H'D*CDA) H'DE.'71 B(D %13'D 'D3J'B D@ AI."),
    c("node bin/kvdf.js model-route recommend --kind implementation --risk medium", "Recommend cheap, balanced, premium, or human-only model routing.", "JB*1- *H,JG 'DEH/JD: 1.J5 #H E*H'2F #H BHJ #H (41J AB7.")
  ],
  "multi-ai-governance": [
    c("node bin/kvdf.js track status", "Inspect the active track and session before sensitive operations.", "JA-5 'DE3'1 'DF47 H'D,D3) B(D 'D9EDJ'* 'D-3'3)."),
    c("node bin/kvdf.js entry", "Enter the correct track automatically from workspace context.", "J/.D 'DE3'1 'D5-J- *DB'&JK' EF 3J'B E3'-) 'D9ED."),
    c("node bin/kvdf.js multi-ai conversation start --from agent-001 --to agent-002 --topic \"Scope\" --message \"Please review the scope\"", "Open a durable agent-to-agent conversation relay thread.", "JA*- EH6H9 *H'5D /'&E (JF HCD'! AI."),
    c("node bin/kvdf.js developer solo --id dev-main --name \"Main Developer\"", "Configure one developer as full-stack across standard workstreams.", "J6(7 E7H1K' H'-/K' C@ full-stack 9DI 'DE3'1'* 'DBJ'3J)."),
    c("node bin/kvdf.js developer add --id dev-001 --name \"Backend Dev\" --role Developer", "Add a human developer identity.", "J6JA GHJ) E7H1 (41J."),
    c("node bin/kvdf.js agent add --id agent-001 --name \"AI Backend Agent\" --role \"AI Developer\" --workstreams backend", "Add an AI agent identity with workstream limits.", "J6JA HCJD AI (-/H/ E3'1'* 9ED."),
    c("node bin/kvdf.js token issue --task task-001 --assignee agent-001", "Issue a scoped token for one assignee and task.", "J5/1 *HCFK' E-//K' DECDA H'-/ H*'3C H'-/."),
    c("node bin/kvdf.js lock list", "Show active locks.", "J916 'D#BA'D 'DF47)."),
    c("node bin/kvdf.js session start --task task-001 --developer agent-001", "Start a governed execution session.", "J(/# ,D3) *FAJ0 E-CHE)."),
    c("node bin/kvdf.js validate business", "Validate business feature and journey state.", "JA-5 -'D) 'DEJ2'* H'D1-D'* 'D*,'1J).")
  ],
  "github-release": [
    c("node bin/kvdf.js github config set --repo owner/repo --branch main --default-version v4.0.0", "Store local GitHub sync configuration.", "J3,D %9/'/ E2'EF) GitHub E-DJK'."),
    c("node bin/kvdf.js github config show", "Show current GitHub sync configuration.", "J916 %9/'/ GitHub 'D-'DJ."),
    c("node bin/kvdf.js github plan --version v4.0.0 --dry-run", "Preview GitHub sync work without writing to GitHub.", "J916 .7) GitHub /HF C*'() A9DJ)."),
    c("node bin/kvdf.js github label sync --version v4.0.0 --dry-run", "Preview label sync.", "J916 E2'EF) 'DDJ(D2 /HF *FAJ0."),
    c("node bin/kvdf.js github milestone sync --version v4.0.0 --dry-run", "Preview milestone sync.", "J916 E2'EF) milestones /HF *FAJ0."),
    c("node bin/kvdf.js github issue sync --version v4.0.0 --dry-run", "Preview issue sync.", "J916 E2'EF) issues /HF *FAJ0."),
    c("node bin/kvdf.js release check --version v4.0.0 --strict", "Run strict release readiness checks.", "J4:D A-5 ,'G2J) 'D%5/'1 (51'E)."),
    c("node bin/kvdf.js release gate --version v4.0.0", "Evaluate release policy gate.", "JBJE (H'() 3J'3) 'D%5/'1."),
    c("node bin/kvdf.js release publish-gate --version v4.0.0", "Evaluate release plus GitHub write gates before publish.", "JBJE (H'() 'D%5/'1 H(H'() C*'() GitHub B(D 'DF41."),
    c("node bin/kvdf.js release notes --version v4.0.0 --output RELEASE_NOTES.md", "Generate release notes.", "JHD/ ED'-8'* 'D%5/'1."),
    c("node bin/kvdf.js release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md", "Generate release checklist.", "JHD/ B'&E) *-BB 'D%5/'1.")
  ],
  "practical-examples": [
    c("node bin/kvdf.js blueprint recommend \"Build a supermarket POS\"", "Start practical examples by mapping the product type.", "'(/# 'D#E+D) 'D9EDJ) (1(7 FH9 'DEF*, (.1J7) EF'3()."),
    c("node bin/kvdf.js questionnaire plan \"Build a dental clinic booking system\"", "Generate questions for the selected example.", "JF4& #3&D) 'DE+'D 'DE.*'1."),
    c("node bin/kvdf.js data-design context ecommerce", "Generate database context for the example.", "JF4& 3J'B B'9/) 'D(J'F'* DDE+'D."),
    c("node bin/kvdf.js design recommend ecommerce", "Generate UI/UX direction for the example.", "JF4& '*,'G 'DH',G) H*,1() 'DE3*./E DDE+'D."),
    c("node bin/kvdf.js prompt-pack compose react-native-expo --task task-mobile-001", "Compose a mobile task prompt for the ecommerce mobile app example.", "J1C( (1HE(* *'3C EH('JD D*7(JB 'DE*,1."),
    c("node bin/kvdf.js handoff package --id client-handoff --audience client", "Generate a client handoff package after work is ready.", "JF4& -2E) *3DJE DD9EJD (9/ 'D,'G2J).")
  ],
  "example-wordpress-digital-agency": [
    c("kvdf wordpress plan \"Build a WordPress digital marketing agency website with services blog case studies and lead forms\" --type corporate --mode new", "Create the governed WordPress site plan.", "JF4& .7) EHB9 WordPress E-CHE)."),
    c("kvdf wordpress tasks", "Create governed tasks for the WordPress site plan.", "JF4& *'3C'* E-CHE) D.7) EHB9 WordPress."),
    c("kvdf wordpress plugin plan \"Manage digital agency customers and contacts\" --name \"Agency Customers\" --type business", "Plan the customers management plugin.", "J.77 %6'A) %/'1) 'D9ED'!."),
    c("kvdf wordpress plugin scaffold --name \"Agency Customers\"", "Scaffold the customers plugin folder.", "JF4& GJCD %6'A) 'D9ED'!."),
    c("kvdf wordpress plugin plan \"Manage service requests from public WordPress forms\" --name \"Agency Service Requests\" --type business", "Plan the service requests plugin.", "J.77 %6'A) 7D('* 'D./E'*."),
    c("kvdf wordpress plugin scaffold --name \"Agency Service Requests\"", "Scaffold the service requests plugin folder.", "JF4& GJCD %6'A) 7D('* 'D./E'*."),
    c("kvdf wordpress plugin plan \"Manage invoices for agency services retainers and campaigns\" --name \"Agency Invoices\" --type business", "Plan the invoices plugin.", "J.77 %6'A) 'DAH'*J1."),
    c("kvdf wordpress plugin scaffold --name \"Agency Invoices\"", "Scaffold the invoices plugin folder.", "JF4& GJCD %6'A) 'DAH'*J1."),
    c("kvdf wordpress plugin plan \"Manage agency accounts balances and account notes\" --name \"Agency Accounts\" --type business", "Plan the accounts plugin.", "J.77 %6'A) 'D-3'('*."),
    c("kvdf wordpress plugin scaffold --name \"Agency Accounts\"", "Scaffold the accounts plugin folder.", "JF4& GJCD %6'A) 'D-3'('*."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose WordPress AI instructions for one governed implementation task.", "J1C( *9DJE'* WordPress D*'3C *FAJ0 E-CHE.")
  ],
  "troubleshooting": [
    c("node bin/kvdf.js validate", "Run the broadest health check first.", "J4:D #H39 A-5 5-) #HDK'."),
    c("node bin/kvdf.js policy status", "Inspect policy blockers.", "JA-5 EH'F9 'D3J'3'*."),
    c("node bin/kvdf.js security scan", "Run a local lightweight secret/security scan.", "J4:D A-5K' E-DJK' .AJAK' DD#31'1 H'D#E'F."),
    c("node bin/kvdf.js structure validate --json", "Check foldering problems in machine-readable form.", "JA-5 E4'CD *F8JE 'DAHD/1'* (5J:) JSON."),
    c("node bin/kvdf.js capture list", "Find unreviewed post-work changes.", "J9+1 9DI *:JJ1'* post-work :J1 E1',9)."),
    c("npm test", "Run the repository integration test suite.", "J4:D '.*('1'* 'D*C'ED AJ 'D1J(H.")
  ]
};

for (const [slug, commands] of Object.entries(pageCommandCatalog)) {
  if (docs.en.pages[slug]) {
    docs.en.pages[slug].commands = commands.map((item) => ({ command: displayCommand(item.command), description: item.en }));
  }
  if (docs.ar.pages[slug]) {
    docs.ar.pages[slug].commands = commands.map((item) => ({ command: displayCommand(item.command), description: item.ar }));
  }
}

docs.en.pages["ai-with-kabeeri"].details = [
  ["When to use `kvdf`", ["Use `kvdf` in documentation, daily project work, installed package usage, VS Code tasks, team onboarding, and any command a normal developer is expected to run.", "`kvdf` is the product-facing command. It works after the package is installed globally, linked locally, or exposed through npm/bin tooling. This is the recommended command style across the docs site."]],
  ["When to use `node bin/kvdf.js`", ["Use `node bin/kvdf.js` only when developing Kabeeri itself from the repository source, debugging the CLI entry file directly, running tests before the package is linked, or working in an environment where the `kvdf` binary is not on PATH yet.", "It is a repository-internal fallback, not the preferred command style for users reading the documentation."]],
  ...(docs.en.pages["ai-with-kabeeri"].details || [])
];

docs.ar.pages["ai-with-kabeeri"].details = [
  ["E*I F3*./E `kvdf`", ["'3*./E `kvdf` AJ EHB9 'DH+'&B HAJ 'D9ED 'DJHEJ 9DI 'DE4'1J9 H(9/ *+(J* 'D-2E) HAJ VS Code tasks HAJ 41- 'D'3*./'E D#J E7H1 9'/J.", "`kvdf` GH 'D#E1 'D13EJ 'DEH,G DDE7H1. J9ED 9F/E' *CHF 'D-2E) E+(*) #H E1(H7) E-DJK' #H E*'-) EF npm/bin tooling. D0DC 3JCHF GH 'D4CD 'DE91H6 AJ 'D/HC3."]],
  ["E*I F3*./E `node bin/kvdf.js`", ["'3*./E `node bin/kvdf.js` AB7 #+F'! *7HJ1 C(J1J FA3G EF 3H13 'D1J(H #H 9F/ debug E('41 DEDA CLI #H B(D 1(7 'D-2E) #H DH #E1 `kvdf` :J1 EH,H/ (9/ AJ PATH.", "G0' E3'1 /'.DJ DDE7H1JF 'D0JF J7H1HF 'DA1JEH1C FA3G HDJ3 'D4CD 'D#A6D DE3*./E 'D/HC3."]],
  ...(docs.ar.pages["ai-with-kabeeri"].details || [])
];

function currentLang() {
  const path = window.location.pathname;
  if (path.includes("/pages/ar/")) return "ar";
  return document.documentElement.lang || "en";
}

function currentSlug() {
  return document.body.dataset.page || "what-is";
}

function rootPath() {
  return document.body.dataset.root || "";
}

function pagePath(lang, slug) {
  const root = rootPath();
  if (slug === "what-is" && root === "") return "index.html";
  return `${root}pages/${lang}/${slug}.html`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function displayCommand(command) {
  return String(command).replace(/^node bin[\\/]kvdf\.js\b/, "kvdf");
}

function quotedText(command) {
  const match = String(command).match(/"([^"]+)"/);
  return match ? match[1] : "";
}

function vibeFirstRow(command, description, lang) {
  const text = displayCommand(command);
  const subject = quotedText(text);
  const isAr = lang === "ar";
  const generic = isAr
    ? "*9'ED E9 G0' 'D#E1 C.7H) /'.D C(J1J HFA0G' #H 'B*1- '3*./'EG' 9F/E' *CHF EF'3()."
    : "Treat this command as a Kabeeri step and run or suggest it when it fits the current work.";
  const rows = [
    [/^npm test$/, isAr ? "'.*(1 'D*:JJ1'* 'D-'DJ) H*#C/ #F 'DF8'E DE JFC31." : "Test the current changes and confirm nothing broke.", isAr ? "J4:D '.*('1'* 'DE41H9 C/DJD B(HD B(D 'D*3DJE." : "Runs the project test suite as delivery evidence."],
    [/^kvdf validate/, isAr ? "'A-5 5-) EDA'* C(J1J H'DE41H9 B(D E' FCED." : "Check Kabeeri and project health before we continue.", isAr ? "J3*./E A-5 'D5-) D'C*4'A E4'CD 'D-'D) H'D@ schemas H'D3J'3'* E(C1K'." : "Uses health validation to catch state, schema, and policy issues early."],
    [/^kvdf init/, isAr ? ",G2 E3'-) C(J1J DE41H9 ,/J/ H'.*1 71JB) 'D*3DJE 'DEF'3()." : "Set up a Kabeeri workspace for a new project and choose the right delivery mode.", isAr ? "JF4& -'D) 'DE41H9 'D#3'3J) (-J+ J(/# AI EF E5/1 -BJB) EF8E." : "Creates base workspace state so AI starts from an organized source of truth."],
    [/dashboard serve/, isAr ? "'A*- DH-) E1'B() -J) #*'(9 EFG' 'DE41H9." : "Open a live dashboard so I can monitor the project.", isAr ? "J4:D 'D/'4(H1/ 'DE-DJ DE*'(9) 'D-'D) H'D*'3C'* H'D*B'1J1." : "Serves the local dashboard for state, tasks, and reports."],
    [/dashboard generate|dashboard state|reports live|task tracker/, isAr ? "'916 DJ 'D-'D) 'D-'DJ) H'D*'3C'* HE' 'D0J J-*', E*'(9)." : "Show me the current state, tasks, and what needs attention.", isAr ? "JB1# #H J-/+ JSON 'D-J 'D0J J9*E/ 9DJG 'D/'4(H1/ H'3*CE'D 'D,D3'*." : "Reads or updates the live JSON used by the dashboard and resume flow."],
    [/dashboard export/, isAr ? ",G2 F3.) +'(*) EF 'D/'4(H1/ #H 5A-) 'D9EJD DDE1',9)." : "Prepare a static dashboard or customer page for review.", isAr ? "J5/1 5A-'* HTML +'(*) JECF A*-G' (/HF 3J1A1." : "Exports static HTML pages that can be opened without a server."],
    [/structure map|structure show|structure guide/, isAr ? "'41- DJ *F8JE AHD/1'* C(J1J H#JF #,/ CD ,2!." : "Explain Kabeeri foldering and where each area lives.", isAr ? "J916 .1J7) 'DAHD/1'* -*I D' J6J9 AI #H 'DE7H1 /'.D 'D1J(H." : "Shows the folder map so AI and developers do not get lost in the repo."],
    [/structure validate|validate foldering/, isAr ? "*#C/ #F *F8JE 'DAHD/1'* E' 2'D 5-J-K'." : "Make sure the foldering structure is still valid.", isAr ? "JA-5 *H'AB 'DAHD/1'* E9 .1J7) *F8JE C(J1J." : "Validates folders against the Kabeeri structure map."],
    [/questionnaire plan/, isAr ? `'3#DFJ 'D#3&D) 'DEGE) AB7 DAGE 'DE41H9${subject ? `: ${subject}` : ""}.` : `Ask only the important questions needed to understand the project${subject ? `: ${subject}` : ""}.`, isAr ? "JHD/ .7) #3&D) E.*51) E1*(7) ('DEF*, H'DA1JEH1C HB'9/) 'D(J'F'* H'DH',G)." : "Generates a compact intake plan linked to product, framework, data, and UI decisions."],
    [/questionnaire coverage|questionnaire missing/, isAr ? "1',9 %,'('* 'DE41H9 HBD DJ E' 'DF'B5 B(D 'D*FAJ0." : "Review project answers and tell me what is missing before implementation.", isAr ? "JC4A A,H'* 'D#3&D) -*I D' J(/# AI (3J'B F'B5." : "Finds missing answers so AI does not start from incomplete context."],
    [/delivery recommend/, isAr ? `'B*1- GD F4*:D Agile #E Structured HDE'0'${subject ? ` DG0' 'DE41H9: ${subject}` : ""}.` : `Recommend Agile or Structured delivery and explain why${subject ? ` for: ${subject}` : ""}.`, isAr ? "JB'1F %4'1'* 'DE41H9 HJB*1- FE7 'D*3DJE E9 #3('( 9EDJ)." : "Compares project signals and recommends a delivery mode with rationale."],
    [/agile summary|agile sprint|validate agile/, isAr ? "F8E 'D4:D (71JB) Agile H1',9 'D3(1F* H'D('CDH,." : "Organize the work with Agile and review the sprint/backlog.", isAr ? "J/J1 ED.5 Agile H'D*.7J7 H'DA-5 -*I J8D 'D*7HJ1 B'(DK' DD**(9." : "Manages Agile summary, planning, and checks so development stays traceable."],
    [/structured health|structured gate|validate structured/, isAr ? "F8E 'D4:D (71JB) Structured H1',9 'DE1'-D H'D(H'('*." : "Organize the work with Structured delivery and review phases/gates.", isAr ? "JA-5 'DE*7D('* H'DE1'-D H'D(H'('* H'D**(9 B(D 'D'F*B'D DDE1-D) 'D*'DJ)." : "Checks requirements, phases, gates, and traceability before moving on."],
    [/blueprint/, isAr ? `'AGE FH9 'DF8'E H-// ECHF'*G H5A-'*G H,/'HDG 'D#3'3J)${subject ? `: ${subject}` : ""}.` : `Understand the system type and identify its modules, pages, and core data${subject ? `: ${subject}` : ""}.`, isAr ? "J1(7 'DAC1) (.1J7) EF*, ,'G2) E+D E*,1 #H CRM #H POS #H E/HF)." : "Maps the idea to a known product blueprint such as ecommerce, CRM, POS, or blog."],
    [/wordpress plugin/, isAr ? "*9'ED E9 G0' C%6'A) WordPress: #F4& plugin plan +E scaffold +E *'3C'* E-//) B(D 'D*FAJ0." : "Treat this as a WordPress plugin: create a plugin plan, scaffold, and scoped tasks before implementation.", isAr ? "J1(7 'DAC1) (AHD/1 plugin "EF HBH'9/ nonces/capabilities/sanitization/escaping (/D *9/JD core." : "Binds the idea to a safe plugin folder and nonce/capability/sanitization/escaping rules instead of core edits."],
    [/wordpress/, isAr ? "*9'ED E9 G0' CE41H9 WordPress: -DD #H .77 #H #F4& plugin/theme "EF B(D 'D*FAJ0." : "Treat this as a WordPress project: analyze, plan, or scaffold a safe plugin/theme before implementation.", isAr ? "J3*./E -'D) WordPress Hprompt pack H-/H/ wp-content D*BDJD E.'71 *9/JD core #H #31'1 'D%F*',." : "Uses WordPress state, prompt pack, and wp-content boundaries to reduce core-edit and production-secret risks."],
    [/data-design/, isAr ? "3'9/FJ #5EE B'9/) 'D(J'F'* (F'!K 9DI /H1) 'D9ED HDJ3 4CD 'D5A-'* AB7." : "Help me design the database from the business workflow, not only the screens.", isAr ? "JF*, 3J'B *5EJE (J'F'* JBDD #.7'! 'D,/'HD H'D9D'B'* H'D*B'1J1." : "Creates data-design context that reduces table, relationship, and reporting mistakes."],
    [/design recommend|design gate|validate ui-design|ui-checklist|ui-review/, isAr ? "'B*1- #F3( H',G'* HECHF'* H*,1() '3*./'E DG0' 'DEF*,." : "Recommend the best UI patterns, components, and UX for this product.", isAr ? "J-HD FH9 'DEF*, %DI 5A-'* HECHF'* HBH'9/ SEO/GEO #H Dashboard/Mobile." : "Maps the product to pages, components, and SEO/GEO or dashboard/mobile rules."],
    [/prompt-pack/, isAr ? ",G2 (1HE(* *FAJ0 EF'3( DDA1JEH1C H'D*'3C 'D-'DJ." : "Prepare an implementation prompt for the current framework and task.", isAr ? "J1C( 3J'B AI E.*51K' EF BH'9/ 9'E) H-2E) 'DA1JEH1C H'D*'3C." : "Composes compact AI context from common rules, framework pack, and task."],
    [/vibe|capture/, isAr ? "-HQD CD'EJ 'D7(J9J #H 'D4:D 'D0J *E ('DA9D %DI *'3C'* B'(D) DDE1',9)." : "Turn my natural request or already-done work into reviewable tasks.", isAr ? "J3,D 'DFJ) #H 'D'D*B'7 /'.D `.kabeeri/interactions` (/D #F J6J9 (JF 'D,D3'*." : "Records intent or post-work capture under `.kabeeri/interactions` instead of losing it between sessions."],
    [/task create|task assign|task start|task review|task verify|task reject|task status|task list/, isAr ? "-HQD G0' 'D9ED %DI *'3C E-CHE H*'(9 -'D*G -*I 'D*3DJE." : "Turn this work into a governed task and track it through delivery.", isAr ? "J/J1 'D*'3C'* H'D%3F'/ H'DE1',9) H'D*-BB /'.D F8'E -HCE) C(J1J." : "Manages tasks, assignment, review, and verification inside Kabeeri governance."],
    [/app create|app list|app show|app status|validate routes/, isAr ? "3,D 'D*7(JB'* H-/H/G' -*I D' *.*D7 EDA'* 'DE4'1J9." : "Register app boundaries so project files do not get mixed.", isAr ? "J-CE 'D9D'B) (JF backend/frontend/mobile /'.D FA3 'DEF*, #H JEF9 'D.D7." : "Governs backend/frontend/mobile boundaries inside one product and prevents mixing."],
    [/workstream|token issue|lock create|lock list|session start|session end/, isAr ? "F8E 5D'-J'* 'DE7H1JF H'D@ AI H-/H/ 'DEDA'* #+F'! 'D*FAJ0." : "Organize developer and AI permissions and file scope during execution.", isAr ? "J1(7 'DE3'1'* H'D*HCF2 H'D#BA'D H'D,D3'* -*I JBD 'D*6'1( H'DG/1." : "Connects workstreams, tokens, locks, and sessions to reduce overlap and waste."],
    [/usage|pricing|budget|preflight|model-route/, isAr ? "B/1 *CDA) AI H'D*HCF2 H'.*1 E3*HI 'DEH/JD 'DEF'3( B(D 'D*FAJ0." : "Estimate AI cost/tokens and choose the right model level before execution.", isAr ? "J3,D 'D*CDA) H'D'3*GD'C HJEF9 G/1 'D*HCF2 AJ 3J'B :J1 61H1J." : "Tracks usage and cost and prevents token waste from oversized context."],
    [/track status|developer solo|developer add|agent add|validate business/, isAr ? "'6(7 GHJ) 'DA1JB HHCD'! AI H5D'-J'*GE." : "Set up the team, developers, AI agents, and their permissions.", isAr ? "J-A8 'DGHJ'* H'D#/H'1 H-/H/ 'D9ED B(D *H2J9 'DEG'E." : "Stores identities, roles, and work boundaries before task distribution."],
    [/github|release|package check|handoff|readiness report|governance report|policy status|security scan/, isAr ? "1',9 'D,'G2J) H'D3J'3'* H'D*3DJE B(D 'DF41 #H 1A9 'D*:JJ1'*." : "Review readiness, policies, and handoff before publish or GitHub changes.", isAr ? "JF*, *B'1J1 H(H'('* *EF9 'DF41 #H 'D*3DJE B(D 'C*E'D 'D/DJD." : "Produces reports and gates that block publish or handoff until evidence is ready."]
  ];
  for (const [pattern, request, outcome] of rows) {
    if (pattern.test(text)) return { request, outcome };
  }
  return {
    request: generic,
    outcome: description || (isAr ? "J1(7 'D7D( (B/1) EF'3() /'.D C(J1J." : "Connects the request to a matching Kabeeri capability.")
  };
}

function inlineCode(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function listHtml(items) {
  return `<ul>${items.map((item) => `<li>${inlineCode(item)}</li>`).join("")}</ul>`;
}

function stepsHtml(items) {
  return `<div class="pipeline">${items.map((item) => `<span>${inlineCode(item)}</span>`).join("")}</div>`;
}

function describeCommand(command, lang) {
  const text = displayCommand(command);
  const isAr = lang === "ar";
  const descriptions = [
    [/validate runtime-schemas/, ["Validate runtime schema registry and state-file schema mappings.", "JA-5 3,D schemas runtime H1(7 EDA'* 'D-'D) (G'."]],
    [/validate prompt-packs/, ["Validate prompt pack manifests and prompt-pack assets.", "JA-5 manifests H#5HD -2E 'D(1HE(*."]],
    [/validate generators/, ["Validate generator profiles and related JSON contracts.", "JA-5 (1HA'JD'* 'D*HDJ/ H9BH/ JSON 'DE1*(7) (G'."]],
    [/validate acceptance/, ["Validate acceptance records and review format.", "JA-5 3,D'* 'DB(HD H4CD 'DE1',9)."]],
    [/validate policy/, ["Validate policy definitions and saved policy results.", "JA-5 *91JA'* 'D3J'3'* HF*'&,G' 'DE-AH8)."]],
    [/validate design/, ["Validate design governance state and records.", "JA-5 -'D) H3,D'* -HCE) 'D*5EJE."]],
    [/validate capture/, ["Validate post-work capture records.", "JA-5 3,D'* 'D'D*B'7 (9/ 'D9ED."]],
    [/validate ui-design/, ["Validate UI/UX advisor runtime state.", "JA-5 -'D) E3'9/ UI/UX."]],
    [/validate routes/, ["Validate customer app routes and app-boundary rules.", "JA-5 1H'(7 *7(JB'* 'D9ED'! HBH'9/ -/H/ 'D*7(JB'*."]],
    [/validate workstream/, ["Validate workstreams, assignments, and execution boundaries.", "JA-5 E3'1'* 'D9ED H'D%3F'/ H-/H/ 'D*FAJ0."]],
    [/validate agile/, ["Validate Agile backlog, stories, sprints, and links.", "JA-5 'D('C DH, H'D3*H1J2 H'D'3(1F*'* H'D1H'(7 AJ Agile."]],
    [/validate structured/, ["Validate Structured requirements, phases, gates, and traceability.", "JA-5 'DE*7D('* H'DE1'-D H'D(H'('* H'D**(9 AJ Structured."]],
    [/validate task/, ["Validate governed task state and task rules.", "JA-5 -'D) 'D*'3C'* HBH'9/G'."]],
    [/validate foldering/, ["Validate repository foldering rules.", "JA-5 BH'9/ *F8JE 'DAHD/1'*."]],
    [/^node bin\\kvdf\.js validate$/, ["Run the full repository and workspace validation suite.", "J4:D A-5K' 4'EDK' DD1J(H HE3'-) 'D9ED."]],
    [/dashboard serve/, ["Serve the local live dashboard and API.", "J4:D 'D/'4(H1/ 'D-J HAPI E-DJK'."]],
    [/dashboard export/, ["Export static dashboard and customer-facing pages.", "J5/1 'D/'4(H1/ H'D5A-'* 'D+'(*)."]],
    [/app create --username .*--type backend/, ["Register a backend app inside the current product boundary.", "J3,D *7(JB ('C %F/ /'.D -/H/ 'DEF*, 'D-'DJ."]],
    [/app create --username .*--type frontend/, ["Register a web/frontend app inside the current product boundary.", "J3,D *7(JB HJ( #H A1HF* %F/ /'.D -/H/ 'DEF*, 'D-'DJ."]],
    [/app create --username .*--type mobile/, ["Register a mobile app as a channel of the same product.", "J3,D *7(JB EH('JD CBF') DFA3 'DEF*,."]],
    [/agent add .*ai-backend/, ["Register the backend AI developer with backend/database/integration workstreams.", "J3,D E7H1 AI DD('C %F/ (E3'1'* backend/database/integration."]],
    [/agent add .*ai-web/, ["Register the web frontend AI developer with public frontend scope.", "J3,D E7H1 AI DH',G) 'DHJ( (F7'B public_frontend."]],
    [/agent add .*ai-mobile/, ["Register the mobile AI developer with mobile/integration scope.", "J3,D E7H1 AI DDEH('JD (F7'B mobile/integration."]],
    [/task create .*--type integration/, ["Create a cross-app integration task with explicit apps and workstreams.", "JF4& *'3C *C'ED (JF 'D*7(JB'* E9 *-/J/ 'D*7(JB'* HE3'1'* 'D9ED 51'-)."]],
    [/task create .*--app store-api/, ["Create a backend-scoped task for the store API app.", "JF4& *'3C E-// D*7(JB API 'D.'5 ('DE*,1."]],
    [/task create .*--app storefront-web/, ["Create a web storefront task scoped to the web app.", "JF4& *'3C H',G) HJ( E-// D*7(JB 'DE*,1 9DI 'D%F*1F*."]],
    [/task create .*--app store-mobile/, ["Create a mobile task scoped to the customer mobile app.", "JF4& *'3C EH('JD E-// D*7(JB 'D9EJD."]],
    [/readiness report/, ["Generate a readiness report for demo, handoff, release, or publish review.", "JF4& *B1J1 ,'G2J) DD916 #H 'D*3DJE #H E1',9) 'D%5/'1 #H 'DF41."]],
    [/governance report/, ["Generate a governance health report for leads, agents, tasks, locks, tokens, and blockers.", "JF4& *B1J1 5-) 'D-HCE) DDE1',9 H'DHCD'! H'D*'3C'* H'D#BA'D H'D*HCF2 H'DEH'F9."]],
  ];
  for (const [pattern, [en, ar]] of descriptions) {
    if (pattern.test(text)) return isAr ? ar : en;
  }
  if (text.includes("blueprint recommend")) return isAr ? "JB*1- .1J7) 'DEF*, 'DEF'3() EF H5A 7(J9J." : "Recommend a product blueprint from natural language.";
  if (text.includes("questionnaire plan")) return isAr ? "JF4& .7) #3&D) E1C2) -3( H5A 'DEF*,." : "Generate a focused question plan from the product description.";
  if (text.includes("data-design context")) return isAr ? "JF4& 3J'B *5EJE (J'F'* EF'3( D.1J7) 'DEF*,." : "Generate data-design context for a product blueprint.";
  if (text.includes("design recommend")) return isAr ? "JB*1- FE7 'DH',G) H'DECHF'* H'D5A-'* 'DEF'3()." : "Recommend UI patterns, components, and page templates.";
  if (text.includes("prompt-pack compose")) return isAr ? "J1C( (1HE(* H'9J ('DA1JEH1C H'D*'3C." : "Compose a framework-aware prompt for a task.";
  if (text.includes("prompt-pack list")) return isAr ? "J916 -2E 'D(1HE(* 'DE*'-)." : "List available prompt packs.";
  if (text.includes("wordpress plugin plan")) return isAr ? "JF4& .7) *7HJ1 %6'A) WordPress E-CHE)." : "Create a governed WordPress plugin development plan.";
  if (text.includes("wordpress plugin tasks")) return isAr ? "JF4& *'3C'* E-//) 'DF7'B EF .7) plugin." : "Create scoped tasks from a plugin plan.";
  if (text.includes("wordpress plugin scaffold")) return isAr ? "JF4& GJCD plugin "EF HE,G2." : "Create a safe, structured plugin scaffold.";
  if (text.includes("wordpress plugin checklist")) return isAr ? "J916 B'&E) B(HD *7HJ1 plugin." : "Print the plugin development acceptance checklist.";
  if (text.includes("wordpress analyze")) return isAr ? "J-DD EHB9 WordPress B'&E B(D #J *9/JD." : "Analyze an existing WordPress site before any change.";
  if (text.includes("wordpress plan")) return isAr ? "JF4& .7) WordPress DEHB9 ,/J/ #H EHB9 B'&E." : "Create a WordPress plan for a new or existing site.";
  if (text.includes("wordpress tasks")) return isAr ? "JF4& *'3C'* E-CHE) EF .7) WordPress." : "Create governed tasks from a WordPress plan.";
  if (text.includes("wordpress scaffold")) return isAr ? "JF4& plugin #H theme #H child theme "EF." : "Create a safe plugin, theme, or child theme scaffold.";
  if (text.includes("wordpress checklist")) return isAr ? "J916 B'&E) B(HD WordPress #H WooCommerce." : "Print the WordPress or WooCommerce acceptance checklist.";
  if (text.includes("task tracker")) return isAr ? "J916 DH-) **(9 'D*'3C'* C-'D) B'(D) DDB1'!)." : "Print task tracker state.";
  if (text.includes("dashboard state")) return isAr ? "J916 'D-'D) 'D-J) 'D*J J9*E/ 9DJG' 'D/'4(H1/." : "Print live dashboard state.";
  if (text.includes("structure map")) return isAr ? "J916 .1J7) *F8JE 'DE3*H/9." : "Print repository foldering map.";
  if (text.includes("structure validate")) return isAr ? "JA-5 5-) *F8JE 'DE3*H/9." : "Validate repository foldering.";
  if (text.includes("delivery recommend")) return isAr ? "JB*1- FE7 'D*3DJE 'DEF'3( E9 'D#3('(." : "Recommend Agile or Structured delivery.";
  if (text.includes("agile summary")) return isAr ? "J916 ED.5 -'D) Agile." : "Show Agile runtime summary.";
  if (text.includes("structured health")) return isAr ? "J916 5-) E3'1 Structured." : "Show Structured delivery health.";
  if (text.includes("capture list")) return isAr ? "J916 'D'D*B'7'* 'DE3,D) (9/ 'D9ED." : "List post-work captures.";
  if (text.includes("track status")) return isAr ? "J916 -'D) 'DE3'1 H'D,D3)." : "Show active track and session status.";
  if (text.includes("app list")) return isAr ? "J916 'D*7(JB'* 'DE3,D) AJ E3'-) 'D9ED." : "List registered apps.";
  if (text.includes("workstream list")) return isAr ? "J916 E3'1'* 'D9ED 'DE3,D)." : "List registered workstreams.";
  if (text.includes("adr list")) return isAr ? "J916 B1'1'* 'DE9E'1J) 'DE3,D)." : "List ADR records.";
  if (text.includes("token show")) return isAr ? "J916 *A'5JD *HCF *'3C E-//." : "Show a task access token.";
  if (text.includes("usage summary")) return isAr ? "J916 ED.5 *CDA) H*HCF2 AI." : "Show AI usage and cost summary.";
  if (text.includes("preflight estimate")) return isAr ? "JB/1 *CDA) HE.'71 3J'B AI B(D 'D%13'D." : "Estimate AI context cost and risk before execution.";
  if (text.includes("model-route recommend")) return isAr ? "JB*1- A&) 'DEH/JD 'DEF'3() DD*'3C." : "Recommend a model routing class for the task.";
  if (text.includes("session start")) return isAr ? "J(/# ,D3) AI E-CHE) E1*(7) (*'3C." : "Start a governed AI execution session.";
  if (text.includes("release check")) return isAr ? "JA-5 ,'G2J) 'D%5/'1." : "Check release readiness.";
  if (text.includes("package check")) return isAr ? "JA-5 ,'G2J) *:DJA 'DEF*,." : "Check package readiness.";
  if (text.includes("github plan")) return isAr ? "J916 .7) GitHub /HF C*'() A9DJ)." : "Preview GitHub sync without writing.";
  if (text.includes("handoff package")) return isAr ? "JF4& -2E) *3DJE DDE'DC #H 'D9EJD." : "Generate a handoff package.";
  if (text.includes("npm test")) return isAr ? "J4:D '.*('1'* 'D*C'ED AJ 'D1J(H." : "Run the repository test suite.";
  return isAr ? "#E1 CLI E1*(7 (G0G 'DB/1). 1',9 E1,9 CLI DD*A'5JD 'DC'ED) H'D.J'1'*." : "CLI command related to this capability. See the CLI reference for full options.";
}

function vibeFirstRow(command, description, lang) {
  const text = displayCommand(command);
  const lower = text.toLowerCase();
  const subject = quotedText(text);
  const isAr = lang === "ar";
  const name = flagValue(text, "name");
  const type = flagValue(text, "type");
  const task = flagValue(text, "task") || "<task-id>";
  const app = flagValue(text, "app");
  const assignee = flagValue(text, "assignee");
  const scope = flagValue(text, "scope");

  const row = (enRequest, arRequest, enOutcome, arOutcome) => ({
    request: isAr ? arRequest : enRequest,
    outcome: isAr ? arOutcome : enOutcome
  });

  if (lower.includes("wordpress plugin plan")) {
    return row(
      `I want to plan a WordPress plugin${name ? ` named ${name}` : ""}${subject ? ` for: ${subject}` : ""}.`,
      `#1J/ *.7J7 %6'A) WordPress${name ? ` ('3E ${name}` : ""}${subject ? ` D:16: ${subject}` : ""}.`,
      `Kabeeri records a plugin plan with type${type ? ` ${type}` : ""}, target folder, architecture, safety rules, tasks, and acceptance checklist.`,
      `C(J1J J3,D plugin plan (FH9${type ? ` ${type}` : ""} HAHD/1 'DG/A H'DE9E'1J) HBH'9/ 'D#E'F H'D*'3C'* HB'&E) 'DB(HD.`
    );
  }
  if (lower.includes("wordpress plugin scaffold")) {
    return row(
      `Create the safe WordPress plugin scaffold${name ? ` for ${name}` : ""}.`,
      `#F4& GJCD %6'A) WordPress "EF${name ? ` D@ ${name}` : ""}.`,
      "Kabeeri creates the plugin folder, bootstrap file, admin/public classes, assets, languages, uninstall policy, and README.",
      "C(J1J JF4& AHD/1 'D%6'A) HEDA 'D*4:JD Hadmin/public classes Hassets Hlanguages Huninstall policy HREADME."
    );
  }
  if (lower.includes("wordpress plugin tasks")) {
    return row(
      "Turn the latest WordPress plugin plan into scoped implementation tasks.",
      "-HQD ".1 .7) %6'A) WordPress %DI *'3C'* *FAJ0 E-//) 'DF7'B.",
      "Kabeeri creates governed tasks tied to the plugin plan, allowed files, workstreams, acceptance criteria, and review flow.",
      "C(J1J JF4& *'3C'* E-CHE) E1*(7) (.7) 'D%6'A) H'DEDA'* 'DE3EH-) HE3'1'* 'D9ED HE9'JJ1 'DB(HD H'DE1',9)."
    );
  }
  if (lower.includes("wordpress plugin checklist")) {
    return row(
      "Show me the acceptance checklist for WordPress plugin development.",
      "'916 DJ B'&E) B(HD *7HJ1 %6'A'* WordPress.",
      "Kabeeri prints the plugin safety, architecture, permissions, sanitization, uninstall, testing, and handoff checklist.",
      "C(J1J J916 B'&E) #E'F 'D%6'A) H'DE9E'1J) H'D5D'-J'* H'D*F8JA Huninstall H'D'.*('1'* H'D*3DJE."
    );
  }
  if (lower.includes("wordpress analyze")) {
    return row(
      "Analyze this existing WordPress site before making changes.",
      "-DD EHB9 WordPress 'DB'&E B(D #J *9/JD.",
      "Kabeeri records detected plugins, themes, WooCommerce signals, staging/backup status, forbidden paths, risks, and next actions.",
      "C(J1J J3,D plugins Hthemes H%4'1'* WooCommerce H-'D) staging/backup H'DE3'1'* 'DEEFH9) H'DE.'71 H'D.7H'* 'D*'DJ)."
    );
  }
  if (lower.includes("wordpress plan")) {
    return row(
      `Plan this WordPress site work${subject ? `: ${subject}` : ""}.`,
      `.77 9ED EHB9 WordPress G0'${subject ? `: ${subject}` : ""}.`,
      `Kabeeri creates a governed WordPress plan for ${type || "the selected site type"} with phases, tasks, safe extension strategy, and acceptance criteria.`,
      `C(J1J JF4& .7) WordPress E-CHE) DFH9 ${type || "'DEHB9 'DE.*'1"} E9 E1'-D H*'3C'* H'3*1'*J,J) 'E*/'/ "EF) HE9'JJ1 B(HD.`
    );
  }
  if (lower.includes("wordpress tasks")) {
    return row(
      "Create governed tasks from the current WordPress site plan.",
      "#F4& *'3C'* E-CHE) EF .7) EHB9 WordPress 'D-'DJ).",
      "Kabeeri converts the WordPress plan into scoped tasks with workstreams, safety constraints, and acceptance criteria.",
      "C(J1J J-HD .7) WordPress %DI *'3C'* E-//) (E3'1'* 9ED HBJH/ #E'F HE9'JJ1 B(HD."
    );
  }
  if (lower.includes("wordpress scaffold child-theme")) {
    return row(
      `Create a safe WordPress child theme scaffold${name ? ` for ${name}` : ""}.`,
      `#F4& GJCD child theme "EF${name ? ` D@ ${name}` : ""}.`,
      "Kabeeri creates a child-theme extension point under wp-content without touching WordPress core.",
      "C(J1J JF4& FB7) 'E*/'/ child-theme /'.D wp-content (/HF DE3 WordPress core."
    );
  }
  if (lower.includes("wordpress scaffold plugin")) {
    return row(
      `Create a safe WordPress plugin scaffold${name ? ` for ${name}` : ""}.`,
      `#F4& GJCD plugin "EF${name ? ` D@ ${name}` : ""}.`,
      "Kabeeri creates a plugin extension point under wp-content/plugins with safe starter files.",
      "C(J1J JF4& FB7) 'E*/'/ plugin /'.D wp-content/plugins E9 EDA'* (/'J) "EF)."
    );
  }
  if (lower.includes("prompt-pack compose wordpress")) {
    return row(
      `Prepare WordPress-specific AI instructions for task ${task}.`,
      `,G2 *9DJE'* WordPress DE3'9/ 'D0C'! 'D'57F'9J D*'3C ${task}.`,
      "Kabeeri composes WordPress rules for hooks, nonces, capabilities, sanitization, escaping, REST routes, WooCommerce, and handoff.",
      "C(J1J J1C( BH'9/ WordPress 'D.'5) (@ hooks Hnonces Hcapabilities Hsanitization Hescaping HREST routes HWooCommerce H'D*3DJE."
    );
  }
  if (lower.includes("ai-run provenance")) {
    return row(
      "Inspect the provenance trail for AI runs tied to tasks, sessions, acceptance, and durable records.",
      "'A-5 E3'1 provenance D*FAJ0'* AI 'DE1*(7) ('D*'3C'* H'D,D3'* H'DB(HD H'D3,D'* 'D/'&E).",
      "Kabeeri shows how AI work is linked to task records, sessions, accept/reject decisions, and durable audit artifacts.",
      "C(J1J JH6- CJA J1*(7 9ED AI (3,D'* 'D*'3C'* H'D,D3'* HB1'1'* 'DB(HD #H 'D1A6 HEH'/ 'D*/BJB 'D/'&E)."
    );
  }
  if (lower.includes("docs open") || lower.includes("docs serve")) {
    return row(
      "Open the Kabeeri documentation site so I can read the current guidance.",
      "'A*- EHB9 H+'&B C(J1J -*I #B1# 'D%14'/'* 'D-'DJ).",
      "Kabeeri regenerates the docs site, serves it locally, and can open it in the browser.",
      "C(J1J J9J/ *HDJ/ EHB9 'DH+'&B HJ4:DG E-DJK' HJECFG A*-G AJ 'DE*5A-."
    );
  }
  if (lower.includes("docs validate")) {
    return row(
      "Validate the docs site before publishing so the generated pages and localized guidance stay in sync.",
      "'A-5 EHB9 'DH+'&B B(D 'DF41 -*I *(BI 'D5A-'* 'DEHD/) H'D%14'/'* 'DE-DJ) E*7'(B).",
      "Kabeeri compares the docs site, generated page contracts, and localized guidance against the current command surface.",
      "C(J1J JB'1F EHB9 'DH+'&B H9BH/ 'D5A-'* 'DEHD/) H'D%14'/'* 'DE-DJ) (37- 'D#H'E1 'D-'DJ."
    );
  }
  if (lower.includes("questionnaire plan")) {
    return row(
      `Ask me only the important questions for this project${subject ? `: ${subject}` : ""}.`,
      `'3#DFJ AB7 'D#3&D) 'DEGE) DG0' 'DE41H9${subject ? `: ${subject}` : ""}.`,
      "Kabeeri generates focused intake questions from product blueprint, delivery mode, data design, UI, and prompt-pack signals.",
      "C(J1J JHD/ #3&D) E1C2) EF .1J7) 'DEF*, HFE7 'D*3DJE H*5EJE 'D(J'F'* H'DH',G) H-2E 'D(1HE(*."
    );
  }
  if (lower.includes("blueprint recommend")) {
    return row(
      `Identify the product type, modules, pages, data entities, and risks${subject ? ` for: ${subject}` : ""}.`,
      `-// FH9 'DEF*, H'DEH/JHD'* H'D5A-'* H'D,/'HD H'DE.'71${subject ? ` DG0' 'D7D(: ${subject}` : ""}.`,
      "Kabeeri maps the idea to a known market blueprint such as ecommerce, CRM, POS, booking, blog, or WordPress.",
      "C(J1J J1(7 'DAC1) (.1J7) EF*, E91HA) E+D E*,1 #H CRM #H POS #H -,2 #H E/HF) #H WordPress."
    );
  }
  if (lower.includes("data-design")) {
    return row(
      "Help me design the database from the business workflow, not only the screens.",
      "3'9/FJ #5EE B'9/) 'D(J'F'* EF /H1) 'D9ED HDJ3 EF 4CD 'D5A-'* AB7.",
      "Kabeeri creates data-design context covering entities, relationships, constraints, snapshots, audit, transactions, and reporting risks.",
      "C(J1J JF4& 3J'B *5EJE (J'F'* J:7J 'D,/'HD H'D9D'B'* H'DBJH/ H'DDB7'* H'D*/BJB H'DE9'ED'* HE.'71 'D*B'1J1."
    );
  }
  if (lower.includes("design recommend")) {
    return row(
      "Recommend the best UI/UX pattern, page structure, and component groups for this product.",
      "'B*1- #F3( FE7 UI/UX HGJCD 5A-'* HE,EH9'* ECHF'* DG0' 'DEF*,.",
      "Kabeeri maps the product to SEO/content, dashboard, commerce, mobile, or operational UI guidance.",
      "C(J1J J1(7 'DEF*, (%14'/'* SEO/content #H dashboard #H commerce #H mobile #H H',G'* *4:JDJ)."
    );
  }
  if (lower.includes("prompt-pack compose")) {
    return row(
      `Prepare framework-aware AI instructions for task ${task}.`,
      `,G2 *9DJE'* 0C'! '57F'9J H'9J) ('DA1JEH1C D*'3C ${task}.`,
      "Kabeeri composes a compact prompt from common rules, the selected framework pack, and the governed task context.",
      "C(J1J J1C( (1HE(* E.*51 EF 'DBH'9/ 'D9'E) H-2E) 'DA1JEH1C H3J'B 'D*'3C 'DE-CHE."
    );
  }
  if (lower.includes("dashboard serve")) {
    return row(
      "Open a live dashboard so I can monitor the project.",
      "'A*- /'4(H1/ -J #*'(9 EFG 'DE41H9.",
      "Kabeeri serves local dashboard pages and live JSON APIs for state, tasks, reports, and governance.",
      "C(J1J J4:D 5A-'* 'D/'4(H1/ HH',G'* JSON 'D-J) DD-'D) H'D*'3C'* H'D*B'1J1 H'D-HCE)."
    );
  }
  if (lower.includes("dashboard") || lower.includes("reports live") || lower.includes("task tracker")) {
    return row(
      "Show me the current project state, tasks, reports, and next actions.",
      "'916 DJ -'D) 'DE41H9 H'D*'3C'* H'D*B'1J1 H'D.7H'* 'D*'DJ).",
      "Kabeeri reads or refreshes live JSON state used by the dashboard, VS Code, automation, and AI context.",
      "C(J1J JB1# #H J-/+ JSON 'D-J 'D0J J9*E/ 9DJG 'D/'4(H1/ HVS Code H'D#*E*) H3J'B 'D0C'! 'D'57F'9J."
    );
  }
  if (lower.includes("app create")) {
    return row(
      "Register this app inside the product boundary so files and responsibilities stay clear.",
      "3,D G0' 'D*7(JB /'.D -/H/ 'DEF*, -*I *8D 'DEDA'* H'DEDCJ) H'6-).",
      "Kabeeri records app username, type, path, product, route, and task boundary rules.",
      "C(J1J J3,D username HFH9 'D*7(JB HE3'1G H'DEF*, H'D1'(7 HBH'9/ -/H/ 'D*'3C'*."
    );
  }
  if (lower.includes("agent add")) {
    return row(
      "Register this AI developer with its role and allowed workstreams.",
      "3,D E7H1 'D0C'! 'D'57F'9J G0' (/H1G HE3'1'* 'D9ED 'DE3EH-).",
      "Kabeeri stores the agent identity so tasks, sessions, locks, tokens, and cost can be attributed.",
      "C(J1J J-A8 GHJ) 'DHCJD -*I *1*(7 (G 'D*'3C'* H'D,D3'* H'D#BA'D H'D*HCF2 H'D*CDA)."
    );
  }
  if (lower.includes("task create")) {
    return row(
      `Create a governed task${app ? ` for ${app}` : ""} with clear scope and acceptance criteria.`,
      `#F4& *'3C E-CHE${app ? ` D*7(JB ${app}` : ""} (F7'B HE9'JJ1 B(HD H'6-).`,
      "Kabeeri records the task source, app, workstream, type, responsible party, reviewer, allowed files, and acceptance targets.",
      "C(J1J J3,D E5/1 'D*'3C H'D*7(JB HE3'1 'D9ED H'DFH9 H'DE3$HD H'DE1',9 H'DEDA'* 'DE3EH-) HE9'JJ1 'DB(HD."
    );
  }
  if (lower.includes("token issue")) {
    return row(
      `Give ${assignee || "the assigned AI/developer"} access to work only on task ${task}.`,
      `'EF- ${assignee || "'DE7H1 #H E3'9/ 'D0C'! 'D'57F'9J"} 5D'-J) 'D9ED AB7 9DI *'3C ${task}.`,
      "Kabeeri issues a scoped task access token tied to assignment, expiry, workstream, and allowed execution scope.",
      "C(J1J J5/1 task access token E-//K' E1(H7K' ('D%3F'/ H'D'F*G'! HE3'1 'D9ED HF7'B 'D*FAJ0 'DE3EH-."
    );
  }
  if (lower.includes("lock create")) {
    return row(
      `Lock ${scope || "the target files/folder"} while this task is being implemented.`,
      `'BAD ${scope || "'DEDA'* #H 'DAHD/1 'DE7DH("} #+F'! *FAJ0 G0' 'D*'3C.`,
      "Kabeeri records a lock to prevent overlapping edits by parallel developers or AI agents.",
      "C(J1J J3,D BADK' DEF9 *9'16 'D*9/JD'* (JF 'DE7H1JF #H HCD'! 'D0C'! 'D'57F'9J 'DE*H'2JJF."
    );
  }
  if (lower.includes("session start") || lower.includes("session end")) {
    return row(
      "Track this AI work session against the governed task and record evidence when it ends.",
      "**(9 ,D3) 9ED 'D0C'! 'D'57F'9J G0G 9DI 'D*'3C 'DE-CHE H3,D 'D/DJD 9F/ 'F*G'&G'.",
      "Kabeeri links execution to task, developer, tokens, files, checks, risks, and AI usage records.",
      "C(J1J J1(7 'D*FAJ0 ('D*'3C H'DE7H1 H'D*HCF2 H'DEDA'* H'DA-H5'* H'DE.'71 H3,D'* '3*GD'C AI."
    );
  }
  if (lower.includes("validate")) {
    return row(
      "Check Kabeeri and project health before we continue.",
      "'A-5 5-) C(J1J H'DE41H9 B(D #F FCED.",
      "Kabeeri validates schemas, runtime state, policies, prompt packs, foldering, and workspace governance.",
      "C(J1J JA-5 schemas H-'D) runtime H'D3J'3'* H-2E 'D(1HE(* H*F8JE 'DAHD/1'* H-HCE) E3'-) 'D9ED."
    );
  }
  return row(
    "Treat this as a governed Kabeeri step and suggest or run it only when it fits the current work.",
    "*9'ED E9 G0' C.7H) E-CHE) /'.D C(J1J H'B*1-G' #H FA0G' AB7 9F/E' *F'3( 'D9ED 'D-'DJ.",
    description || "Kabeeri connects the natural request to the matching runtime capability.",
    description || "C(J1J J1(7 'D7D( 'D7(J9J ('DB/1) 'DEF'3() /'.D runtime."
  );
}

function flagValue(command, name) {
  const match = String(command).match(new RegExp(`--${name}\\s+(?:"([^"]+)"|([^\\s]+))`));
  return match ? match[1] || match[2] : "";
}

const universalDeepGuides = {
  en: [
    ["How to read this page", [
      "Start with the plain-language idea, then read the roadmap and only then use the CLI table. Kabeeri is designed so the developer talks normally and the AI assistant uses runtime commands only when they are useful.",
      "Treat every page as a decision guide, not as a memorization page. The important output is a clearer task, safer scope, better evidence, and fewer repeated questions.",
      "If you are building a real product, keep the live dashboard open and ask the AI assistant to translate your request into governed tasks before code changes begin."
    ]],
    ["What the developer decides", [
      "The developer or project lead decides product intent, delivery mode, acceptance criteria, priorities, and whether a suggested task is approved.",
      "Kabeeri should expose options, risks, missing answers, and implementation paths in a form that is easy to approve or reject.",
      "For ambiguous requests, prefer a small approved task over a large vague build. That keeps the project understandable when the session is resumed later."
    ]],
    ["What the AI assistant should do", [
      "The AI assistant should use this page as context, then read the relevant live JSON and source files before changing code.",
      "It should keep the app boundary, workstream, task token, prompt pack, and policy gates aligned with the actual work.",
      "After implementation, it should record what changed, what was checked, what remains risky, and which task or decision the work belongs to."
    ]],
    ["Evidence you should expect", [
      "A useful Kabeeri run leaves behind task records, live dashboard state, validation output, session notes, captures, and sometimes ADRs or release gate results.",
      "If a page describes a workflow but no evidence can be produced, treat that as a gap to fix before presenting the workflow as reliable.",
      "For team work, evidence must include responsibility, touched files, checks, blockers, and handoff notes so another AI assistant or developer can continue safely."
    ]]
  ],
  ar: [
    ["CJA *B1# G0G 'D5A-)", [
      "'(/# ('DAC1) (D:) (3J7) +E 'B1# .'17) 'D71JB H(9/G' '3*./E ,/HD 'D#H'E1 9F/ 'D-',). C(J1J E5EE (-J+ J*CDE 'DE7H1 7(J9JK' HE3'9/ 'D0C'! 'D'57F'9J J3*./E #H'E1 runtime AJ 'D.DAJ) 9F/E' *CHF EAJ/).",
      "'9*(1 CD 5A-) /DJD B1'1 HDJ3 5A-) -A8 #H'E1. 'DE.1, 'DEGE GH *'3C #H6- F7'B ##EF /DJD *FAJ0 #A6D H#3&D) EC11) #BD.",
      "DH *(FJ EF*,K' -BJBJK' ',9D 'D/'4(H1/ 'D-J EA*H-K' H'7D( EF E3'9/ 'D0C'! 'D'57F'9J *-HJD 7D(C %DI *'3C'* E-CHE) B(D (/! *9/JD 'DCH/."
    ]],
    ["E'0' JB11 'DE7H1", [
      "'DE7H1 #H 'DE'DC JB11 G/A 'DEF*, HFE7 'D*3DJE HE9'JJ1 'DB(HD H'D#HDHJ'* HGD 'D*'3C 'DEB*1- EB(HD #E D'.",
      "C(J1J D' J3*(/D -CE 5'-( 'DEF*,. /H1G #F JC4A 'D'.*J'1'* H'DE.'71 H'D%,'('* 'DF'B5) HE3'1'* 'D*FAJ0 (4CD 3GD 'DE1',9).",
      "DH 'D7D( :'E6 'D#A6D '9*E'/ *'3C 5:J1 HH'6- (/D (F'! C(J1 :J1 E-//. G0' J,9D '3*CE'D 'D,D3'* #3GD H#BD .7#."
    ]],
    ["E'0' JA9D E3'9/ 'D0C'! 'D'57F'9J", [
      "J3*./E G0G 'D5A-) C3J'B +E JB1# EDA'* 'D-'D) 'D-J) HEDA'* 'DE5/1 'DE1*(7) B(D *9/JD 'DCH/.",
      "J-'A8 9DI *H'AB -/H/ 'D*7(JB HE3'1 'D9ED H*HCF 'D*'3C H-2E) 'D(1HE(* H(H'('* 'D3J'3) E9 'D9ED 'D-BJBJ.",
      "(9/ 'D*FAJ0 J3,D E' *:J1 HE' *E A-5G HE' (BJ CE.'71 H#J *'3C #H B1'1 JF*EJ %DJG 'D9ED."
    ]],
    ["'D/DJD 'DE*HB9 (9/ 'D9ED", [
      "*4:JD C(J1J 'D,J/ J*1C H1'!G 3,D'* *'3C'* H-'D) /'4(H1/ -J) HF*'&, *-BB HED'-8'* ,D3) H'D*B'7'* post-work H#-J'FK' ADR #H F*'&, (H'('* %5/'1.",
      "DH 'D5A-) *41- workflow DCF D' JH,/ /DJD JECF %F*',G AG0' gap J,( %5D'-G B(D '9*('1 'DE3'1 EH+HBK'.",
      "AJ 9ED 'DA1JB J,( #F J*6EF 'D/DJD 'DE'DC H'DEDA'* 'D*J *E DE3G' H'DA-H5'* H'DE9HB'* HED'-8'* 'D*3DJE -*I J3*7J9 E7H1 #H AI ".1 'D'3*CE'D (#E'F."
    ]]
  ]
};

const focusedDeepGuides = {
  en: {
    "new-project": [["New product intake depth", [
      "For a new app, Kabeeri should first identify whether you are describing one product with multiple channels or multiple unrelated products. Ecommerce backend plus web storefront plus mobile app is one product with related apps.",
      "The first useful output is not code. It is product type, delivery mode, app boundaries, expected modules, data entities, UI surfaces, risks, and a short list of questions that block planning.",
      "After answers are captured, Kabeeri should create initial tasks with responsible parties, workstreams, allowed files, acceptance criteria, and validation steps."
    ]]],
    "existing-non-kabeeri-project": [["Adopting an existing app", [
      "Do not move an existing app blindly. Kabeeri should analyze the current stack, folder layout, framework conventions, database shape, environment files, tests, and deployment assumptions first.",
      "The adoption plan should separate observation from change. First register the app boundary, then document risks, then create small tasks for cleanup, tests, dashboard state, and future feature work.",
      "For WordPress or legacy projects, plugin/theme boundaries must be recorded clearly so AI does not mix business plugins, theme templates, uploads, and generated assets."
    ]]],
    "questionnaire-engine": [["Question quality", [
      "Good questions reduce token waste because the AI does not need to rediscover product intent every session.",
      "Kabeeri should ask only questions that change planning: product type, audience, data custody, payments, permissions, integrations, delivery mode, UI channel, release target, and risk constraints.",
      "Answers should become reusable state, not chat memory only. The dashboard, task generator, prompt packs, and policy gates should all benefit from the same answers."
    ]]],
    "product-blueprints": [["Blueprint depth", [
      "A blueprint is a market-aware product map. It tells the AI assistant what modules, pages, workflows, tables, integrations, and risks are normal for a product type.",
      "Use blueprints to avoid missing obvious features: ecommerce needs orders, payments, shipments, returns, reviews, SEO, and admin workflows; CRM needs pipeline, activities, assignments, reminders, and reporting.",
      "A blueprint is adjustable. The developer can remove modules, choose MVP scope, or split work across Agile sprints or Structured phases."
    ]]],
    "data-design": [["Database design depth", [
      "Kabeeri should design from business workflow before screens. Screens change quickly, but workflows such as order, payment, shipment, return, booking, article publishing, and stock movement are more stable.",
      "Strong data design must cover relationships, constraints, indexes, snapshots, audit logs, status history, transactions, idempotency, reporting tables, and backup/restore expectations.",
      "The AI assistant should not generate migrations until the workflow, entities, responsibility, and historical records are clear enough to avoid painful redesign."
    ]]],
    "ui-ux-advisor": [["Interface design depth", [
      "Kabeeri should choose UI patterns from the product job: SEO content pages need semantic HTML and structured data; dashboards need dense tables, filters, permissions, and fast repeated actions; mobile needs offline, touch, and notification states.",
      "The output should include page map, component groups, states, accessibility rules, SEO/GEO rules where relevant, and design tokens or library recommendation.",
      "A good UI task includes empty states, loading states, error states, responsive behavior, and acceptance criteria for screenshots or manual verification."
    ]]],
    "vibe-first": [["Vibe-first depth", [
      "Vibe-first means the developer can speak normally while Kabeeri translates intent into reviewable work. It is not a license for the AI assistant to execute vague requests without approval.",
      "A good vibe flow produces intent classification, suggested task card, workstream guess, risk level, allowed/forbidden files, acceptance criteria, and next question when the request is unclear.",
      "The same request should work whether the developer uses chat, dashboard, VS Code, or CLI. The CLI is the engine; the human experience should stay natural."
    ]]],
    "practical-examples": [["How to use the seven examples", [
      "Each example is written as a repeatable product story: what to ask, how Kabeeri classifies the product, which delivery mode fits, what backend and frontend surfaces exist, and what evidence proves readiness.",
      "Use the examples as scripts when starting with an AI assistant. Paste the product goal in normal language, then ask Kabeeri to run the relevant blueprint, questionnaire, data design, UI design, tasks, and gates.",
      "The seven examples intentionally cover content, commerce, operations, mobile, CRM, POS, bookings, and WordPress so the same mental model works across many client projects."
    ]]]
  },
  ar: {
    "new-project": [["*9EB (/! EF*, ,/J/", [
      "AJ *7(JB ,/J/ J,( #F J-// C(J1J #HDK' GD #F* *5A EF*,K' H'-/K' DG BFH'* E*9//) #E EF*,'* E.*DA) D' J,( .D7G'. E+'D: ('C %F/ E*,1 E9 H',G) HJ( H*7(JB EH('JD GH EF*, H'-/ (*7(JB'* E1*(7).",
      "#HD E.1, EAJ/ DJ3 'DCH/. 'DE.1, GH FH9 'DEF*, HFE7 'D*3DJE H-/H/ 'D*7(JB'* H'DEH/JHD'* 'DE*HB9) HCJ'F'* 'D(J'F'* H4'4'* 'DH',G) H'DE.'71 HB'&E) #3&D) B5J1) *EF9 'D*.7J7 'DF'B5.",
      "(9/ *3,JD 'D%,'('* JF4& C(J1J *'3C'* #HDJ) DG' E'DC HE3'1 9ED HEDA'* E3EH-) HE9'JJ1 B(HD H.7H'* *-BB."
    ]]],
    "existing-non-kabeeri-project": [["'9*E'/ E41H9 B'&E", [
      "D' *FBD E41H9K' B'&EK' %DI C(J1J (4CD #9EI. J,( #F J-DD C(J1J 'DA1JEH1C H*F8JE 'DAHD/1'* HBH'9/ 'D%7'1 H4CD B'9/) 'D(J'F'* HEDA'* 'D(J&) H'D'.*('1'* H'A*1'6'* 'DF41 #HDK'.",
      ".7) 'D'9*E'/ *A5D (JF 'DAGE H'D*:JJ1. 3,D -/H/ 'D*7(JB +E H+B 'DE.'71 +E #F4& *'3C'* 5:J1) DD*F8JA H'D'.*('1'* H-'D) 'D/'4(H1/ H'D9ED 'DB'/E.",
      "AJ WordPress #H 'DE4'1J9 'DB/JE) J,( *3,JD -/H/ 'D(D,F'* H'D+JE (H6H- -*I D' J.D7 AI (JF business plugins Htheme templates Huploads Hassets 'DEHD/)."
    ]]],
    "questionnaire-engine": [[",H/) 'D#3&D)", [
      "'D#3&D) 'D,J/) *BDD '3*GD'C 'D*HCF2 D#F AI D' J9J/ 'C*4'A G/A 'DEF*, AJ CD ,D3).",
      "J3#D C(J1J AB7 'D#3&D) 'D*J *:J1 'D*.7J7: FH9 'DEF*, 'D,EGH1 EDCJ) 'D(J'F'* 'D/A9 'D5D'-J'* 'D*C'ED'* FE7 'D*3DJE BF') 'DH',G) G/A 'D%5/'1 HBJH/ 'DE.'71.",
      "'D%,'('* **-HD %DI -'D) B'(D) D%9'/) 'D'3*./'E HDJ3* 0'C1) 4'* AB7. 'D/'4(H1/ HEHD/ 'D*'3C'* H-2E 'D(1HE(* H(H'('* 'D3J'3) J,( #F *3*AJ/ EF FA3 'D%,'('*."
    ]]],
    "product-blueprints": [["9EB .1'&7 'DEF*,'*", [
      "'D.1J7) GJ AGE 3HBJ DFH9 'DEF*,. *BHD DE3'9/ 'D0C'! 'D'57F'9J E' 'DEH/JHD'* H'D5A-'* H'D9EDJ'* H'D,/'HD H'D*C'ED'* H'DE.'71 'D7(J9J) DG0' 'DFH9.",
      "'3*./E 'D.1'&7 -*I D' *F3I EJ2'* (/JGJ): 'DE*,1 J-*', 7D('* HE/AH9'* H4-F HE1*,9'* HE1',9'* HSEO H%/'1) /'.DJ) HCRM J-*', pipeline H#F47) H%3F'/ H*0CJ1'* H*B'1J1.",
      "'D.1J7) B'(D) DD*9/JD. J3*7J9 'DE7H1 -0A EH/JHD'* #H '.*J'1 MVP #H *B3JE 'D9ED %DI 3(1F*'* Agile #H E1'-D Structured."
    ]]],
    "data-design": [["9EB *5EJE B'9/) 'D(J'F'*", [
      "J5EE C(J1J EF /H1) 'D9ED B(D 'D4'4'*. 'D4'4'* **:J1 (319) DCF 9EDJ'* E+D 'D7D( H'D/A9 H'D4-F H'DE1*,9 H'D-,2 HF41 'DEB'D H-1C) 'DE.2HF #C+1 +('*K'.",
      "*5EJE 'D(J'F'* 'DBHJ J:7J 'D9D'B'* H'DBJH/ H'DAG'13 H'DDB7'* 'D*'1J.J) H3,D'* 'D*/BJB H*'1J. 'D-'D'* H'DE9'ED'* HEF9 'D*C1'1 H,/'HD 'D*B'1J1 H*HB9'* 'DF3. 'D'-*J'7J H'D'3*1,'9.",
      "D' JF(:J DE3'9/ 'D0C'! 'D'57F'9J *HDJ/ migrations B(D H6H- workflow H'DCJ'F'* H'DEDCJ) H'D3,D'* 'D*'1J.J) (E' JCAJ D*,F( %9'/) *5EJE E$DE)."
    ]]],
    "ui-ux-advisor": [["9EB *5EJE 'DH',G'*", [
      "J.*'1 C(J1J FE7 'DH',G) EF H8JA) 'DEF*,: 5A-'* SEO *-*', HTML /D'DJ Hstructured data 'D/'4(H1/ J-*', ,/'HD HAD'*1 H5D'-J'* H#A9'D E*C11) 31J9) 'DEH('JD J-*', offline HDE3 H*F(JG'*.",
      "'DE.1, J,( #F J*6EF .1J7) 5A-'* HE,EH9'* ECHF'* H-'D'* 'DH',G) HBH'9/ accessibility HBH'9/ SEO/GEO 9F/ 'D-',) H*H5J) design tokens #H EC*() UI.",
      "*'3C 'DH',G) 'D,J/ J*6EF empty states Hloading states Herror states Hresponsive behavior HE9'JJ1 B(HD DD5H1 #H 'DA-5 'DJ/HJ."
    ]]],
    "vibe-first": [["9EB Vibe-first", [
      "Vibe-first J9FJ #F 'DE7H1 J*CDE 7(J9JK' (JFE' C(J1J J-HD 'DFJ) %DI 9ED B'(D DDE1',9). G0' D' J9FJ #F AI JFA0 7D(K' :'E6K' (/HF EH'AB).",
      "'DE3'1 'D,J/ JF*, intent classification Hsuggested task card H*.EJF workstream HE3*HI E.'71) Hallowed/forbidden files HE9'JJ1 B(HD H3$'D *'DM 9F/ 'D:EH6.",
      "FA3 'D7D( J,( #F J9ED 3H'! ,'! EF 'D4'* #H 'D/'4(H1/ #H VS Code #H CLI. 'D@ CLI GH 'DE-1C DCF *,1() 'D%F3'F *(BI 7(J9J)."
    ]]],
    "practical-examples": [["CJA *3*./E 'D#E+D) 'D3(9)", [
      "CD E+'D EC*H( CB5) EF*, B'(D) DD*C1'1: E'0' *3#D CJA J5FA C(J1J 'DEF*, E' FE7 'D*3DJE 'DEF'3( E' #37- 'D('C %F/ H'DA1HF* %F/ HE' 'D/DJD 'D0J J+(* 'D,'G2J).",
      "'3*./E 'D#E+D) C3C1J(* 9F/ 'D(/! E9 E3'9/ 0C'! '57F'9J. 'C*( G/A 'DEF*, 7(J9JK' +E '7D( EF C(J1J *4:JD blueprint Hquestionnaire Hdata design HUI design H'D*'3C'* H'D(H'('* 'DEF'3().",
      "'D#E+D) 'D3(9) *:7J 'DE-*HI H'D*,'1) H'D*4:JD H'DEH('JD HCRM HPOS H'D-,H2'* HWordPress -*I J9ED FA3 'DFEH0, 'D0GFJ E9 E4'1J9 9ED'! C+J1)."
    ]]]
  }
};

const exampleDeepGuides = {
  en: [
    ["Turning this example into real work", [
      "Start by copying the product goal in plain language, then ask the AI assistant to let Kabeeri identify the product blueprint, delivery mode, apps, modules, data entities, UI surfaces, and missing answers.",
      "Do not ask for the whole product to be generated in one step. Ask Kabeeri to create a first milestone or sprint, then approve the highest-value tasks with clear acceptance criteria.",
      "For every backend task, expect data model, API contract, validation, permissions, tests, and audit or logs where needed. For every frontend task, expect screens, states, responsive behavior, and integration contract.",
      "Before delivery, ask Kabeeri to run validation, policy gates, dashboard refresh, release readiness, and handoff notes so the next session knows exactly what happened."
    ]],
    ["What success looks like", [
      "The product has a visible app boundary, selected delivery mode, approved tasks, framework-aware prompt pack, database plan, UI plan, and a live dashboard state.",
      "The AI assistant can resume without rereading the whole repository because Kabeeri stores the important answers, decisions, task evidence, and current state.",
      "The project lead can inspect progress in normal language: what is done, what is blocked, what remains, which risks matter, and what should be built next."
    ]]
  ],
  ar: [
    ["*-HJD G0' 'DE+'D %DI 9ED -BJBJ", [
      "'(/# (C*'() G/A 'DEF*, (D:) 9'/J) +E '7D( EF E3'9/ 'D0C'! 'D'57F'9J #F J,9D C(J1J J-// blueprint HFE7 'D*3DJE H'D*7(JB'* H'DEH/JHD'* HCJ'F'* 'D(J'F'* H4'4'* 'DH',G) H'D%,'('* 'DF'B5).",
      "D' *7D( *HDJ/ 'DEF*, CDG AJ .7H) H'-/). '7D( EF C(J1J %F4'! #HD milestone #H sprint +E '9*E/ 'D*'3C'* 'D#9DI BJE) (E9'JJ1 B(HD H'6-).",
      "AJ CD *'3C ('C %F/ *HB9 data model HAPI contract Hvalidation Hpermissions H'.*('1'* Haudit #H logs 9F/ 'D-',). HAJ CD *'3C A1HF* %F/ *HB9 screens Hstates Hresponsive behavior Hintegration contract.",
      "B(D 'D*3DJE '7D( EF C(J1J *4:JD validate Hpolicy gates H*-/J+ 'D/'4(H1/ Hrelease readiness Hhandoff notes -*I *91A 'D,D3) 'D*'DJ) E' -/+ ('D6(7."
    ]],
    ["4CD 'DF,'- 'DFG'&J", [
      "'DEF*, DG app boundary H'6-) HFE7 *3DJE E.*'1 H*'3C'* E9*E/) H-2E) (1HE(* H'9J) ('DA1JEH1C H.7) B'9/) (J'F'* H.7) H',G'* H-'D) /'4(H1/ -J).",
      "J3*7J9 E3'9/ 'D0C'! 'D'57F'9J 'D'3*CE'D (/HF B1'!) 'D1J(H CDG D#F C(J1J J.2F 'D%,'('* H'DB1'1'* H/DJD 'D*'3C'* H'D-'D) 'D-'DJ).",
      "J3*7J9 'DE'DC AGE 'D*B/E (D:) 7(J9J): E' *E E' 'DE*97D E' 'DE*(BJ E' 'DE.'71 'DEGE) HE' 'D0J J,( (F'$G (9/ 0DC."
    ]]
  ]
};

function appendUniqueDetails(page, sections) {
  if (!page || !sections) return;
  const existing = new Set((page.details || []).map(([heading]) => heading));
  page.details = page.details || [];
  sections.forEach((section) => {
    if (!existing.has(section[0])) {
      page.details.push(section);
      existing.add(section[0]);
    }
  });
}

function applyDeepGuides() {
  ["en", "ar"].forEach((lang) => {
    Object.keys(docs[lang].pages).forEach((slug) => {
      appendUniqueDetails(docs[lang].pages[slug], universalDeepGuides[lang]);
      if (slug.startsWith("example-")) {
        appendUniqueDetails(docs[lang].pages[slug], exampleDeepGuides[lang]);
      }
    });
    Object.entries(focusedDeepGuides[lang]).forEach(([slug, sections]) => {
      appendUniqueDetails(docs[lang].pages[slug], sections);
    });
  });
}

function textForSearch(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(textForSearch).join(" ");
  if (typeof value === "object") return Object.values(value).map(textForSearch).join(" ");
  return "";
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s._:-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageTitle(lang, slug) {
  const row = pages.find(([id]) => id === slug);
  const page = docs[lang].pages[slug] || {};
  if (lang === "ar") return page.arTitle || (row ? row[2] : slug);
  return row ? row[1] : slug;
}

function buildSearchIndex(lang) {
  return pages.map(([slug]) => {
    const page = docs[lang].pages[slug] || {};
    const title = pageTitle(lang, slug);
    const body = textForSearch([title, page.lead, page.beginner, page.steps, page.sections, page.details, page.checklist, page.commands]);
    return { slug, title, text: normalizeSearch(body) };
  });
}

function searchMatches(entry, query) {
  if (!query) return true;
  return query.split(" ").every((term) => entry.text.includes(term));
}

function commandHtml(commands) {
  if (!commands || !commands.length) return "";
  const lang = currentLang();
  const dict = docs[lang].ui;
  const vibeTitle = lang === "ar" ? "\u062c\u062f\u0648\u0644 Vibe-first \u0627\u0644\u0645\u0643\u0627\u0641\u0626" : "Equivalent Vibe-first Table";
  const vibeRequest = lang === "ar" ? "\u0645\u0627\u0630\u0627 \u0623\u0642\u0648\u0644 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\u061f" : "What do I say to AI?";
  const vibeOutcome = lang === "ar" ? "\u0643\u064a\u0641 \u064a\u0633\u062a\u062e\u062f\u0645 \u0643\u0628\u064a\u0631\u064a \u0647\u0630\u0627 \u062e\u0644\u0641\u064a\u064b\u0627\u061f" : "How does Kabeeri use this behind the scenes?";
  const normalized = commands.map((item) => {
    const command = typeof item === "string" ? item : item.command;
    const description = typeof item === "string" ? describeCommand(command, lang) : item.description || describeCommand(command, lang);
    return {
      command: displayCommand(command),
      description,
      vibe: vibeFirstRow(command, description, lang)
    };
  });
  return `
    <section class="deep-section wide-section">
      <h2>${dict.commands}</h2>
      <div class="table-wrap">
        <table class="docs-table command-table">
          <thead>
            <tr><th>${dict.cliCommand}</th><th>${dict.cliDescription}</th></tr>
          </thead>
          <tbody>
            ${normalized.map((item) => `<tr><td><code>${escapeHtml(item.command)}</code></td><td>${inlineCode(item.description)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <h3 class="subtable-title">${vibeTitle}</h3>
      <div class="table-wrap vibe-table-wrap">
        <table class="docs-table command-table vibe-table">
          <thead>
            <tr><th>${vibeRequest}</th><th>${vibeOutcome}</th></tr>
          </thead>
          <tbody>
            ${normalized.map((item) => `<tr><td>${inlineCode(item.vibe.request)}</td><td>${inlineCode(item.vibe.outcome)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function capabilityTableHtml(lang) {
  const headers = lang === "ar" ? ["'DB/1)", "E'0' *A9D", "'DE5/1"] : ["Capability", "What it does", "Source"];
  return `
    <section class="deep-section wide-section">
      <h2>${lang === "ar" ? ",/HD 'DB/1'*" : "Capability Table"}</h2>
      <div class="table-wrap">
        <table class="docs-table">
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${capabilityRows[lang].map((row) => `<tr>${row.map((cell) => `<td>${inlineCode(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderNav(searchQuery = "") {
  const lang = currentLang();
  const slug = currentSlug();
  const nav = document.getElementById("sidebar-nav");
  const query = normalizeSearch(searchQuery);
  const results = buildSearchIndex(lang).filter((entry) => searchMatches(entry, query));
  const summary = query
    ? `<div class="search-summary">${lang === "ar" ? `F*'&, 'D(-+: ${results.length}` : `Search results: ${results.length}`}</div>`
    : "";
  const empty = query && !results.length
    ? `<div class="search-empty">${lang === "ar" ? "D' *H,/ 5A-) E7'(B). ,1Q( CDE) #(37 E+D tasks #H WordPress #H B'9/) 'D(J'F'*." : "No matching page. Try a simpler term such as tasks, WordPress, or database."}</div>`
    : "";
  nav.innerHTML = summary + empty + results.map(({ slug: id, title }) => {
    return `<a class="nav-link search-hit${id === slug ? " is-active" : ""}" href="${pagePath(lang, id)}">${title}</a>`;
  }).join("");
}

function renderLanguageLinks() {
  const lang = currentLang();
  const slug = currentSlug();
  document.querySelectorAll(".language-link").forEach((link) => {
    const target = link.dataset.langTarget;
    link.href = pagePath(target, slug);
    link.classList.toggle("is-active", target === lang);
    link.textContent = target === "ar" ? "'D91(J)" : "English";
  });
}

function renderContent() {
  const lang = currentLang();
  const slug = currentSlug();
  const dict = docs[lang];
  const page = dict.pages[slug] || dict.pages["what-is"];
  const title = lang === "ar" ? (page.arTitle || Object.fromEntries(pages.map(([id, , ar]) => [id, ar]))[slug]) : Object.fromEntries(pages.map(([id, en]) => [id, en]))[slug];
  const sectionCards = (page.sections || []).map(([heading, body]) => `
    <article class="info-card">
      <h3>${inlineCode(heading)}</h3>
      <p>${inlineCode(body)}</p>
    </article>
  `).join("");
  const detailBlocks = (page.details || []).map(([heading, items]) => `
    <article class="detail-block">
      <h3>${inlineCode(heading)}</h3>
      ${listHtml(items)}
    </article>
  `).join("");
  const capabilityTable = page.capabilityTable ? capabilityTableHtml(lang) : "";
  const checklist = page.checklist ? `<section class="deep-section"><h2>${dict.ui.checklist}</h2>${listHtml(page.checklist)}</section>` : "";
  const commands = commandHtml(page.commands);

  document.getElementById("content").innerHTML = `
    <p class="eyebrow">${dict.ui.eyebrow}</p>
    <h1>${inlineCode(title)}</h1>
    <p class="lead">${inlineCode(page.lead)}</p>
    <div class="beginner-note"><strong>${dict.ui.beginner}</strong><p>${inlineCode(page.beginner)}</p></div>
    ${page.steps ? `<section><h2>${dict.ui.steps}</h2>${stepsHtml(page.steps)}</section>` : ""}
    <section class="deep-section"><h2>${dict.ui.guide}</h2><div class="section-grid">${sectionCards}</div></section>
    ${capabilityTable}
    <section class="deep-section"><h2>${dict.ui.details}</h2><div class="detail-stack">${detailBlocks}</div></section>
    ${checklist}
    ${commands}
  `;
}

function bindSearch() {
  const lang = currentLang();
  const input = document.getElementById("doc-search");
  const label = document.querySelector(".search-label");
  input.placeholder = docs[lang].ui.search;
  if (label) label.textContent = docs[lang].ui.filter;
  input.addEventListener("input", () => {
    renderNav(input.value);
  });
}

applyDeepGuides();
renderNav();
renderLanguageLinks();
renderContent();
bindSearch();

