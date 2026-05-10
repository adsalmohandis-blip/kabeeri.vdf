const pages = [
  ["what-is", "Overview", "نظرة عامة"],
  ["start-here", "Start Here", "ابدأ من هنا"],
  ["install-profiles", "Install and Profiles", "التثبيت والبروفايلات"],
  ["ai-with-kabeeri", "AI Works Inside Kabeeri", "كيف يعمل AI داخل كبيري"],
  ["capabilities", "System Capabilities", "قدرات النظام"],
  ["repository-layout", "Repository Layout", "تنظيم المستودع"],
  ["new-project", "Start a New Application", "بدء تطبيق جديد"],
  ["existing-kabeeri-project", "Continue a Kabeeri Project", "استكمال مشروع كبيري"],
  ["existing-non-kabeeri-project", "Adopt an Existing App", "اعتماد تطبيق قائم"],
  ["delivery-mode", "Choose Agile or Structured", "اختيار Agile أو Structured"],
  ["agile-delivery", "Agile Delivery", "التسليم الأجايل"],
  ["structured-delivery", "Structured Delivery", "التسليم المنظم"],
  ["questionnaire-engine", "Questionnaire Engine", "محرك الأسئلة"],
  ["product-blueprints", "Product Blueprints", "خرائط المنتجات"],
  ["data-design", "Data Design", "تصميم البيانات"],
  ["ui-ux-advisor", "UI/UX Advisor", "مساعد تصميم الواجهات"],
  ["ui-ux-reference-library", "UI/UX Reference Library", "مكتبة مراجع UI/UX"],
  ["vibe-first", "Vibe-first Workflow", "مسار Vibe-first"],
  ["task-governance", "Task Governance", "حوكمة التاسكات"],
  ["app-boundary", "App Boundary Governance", "حوكمة حدود التطبيقات"],
  ["workstreams-scope", "Workstreams and Scope", "مسارات العمل والنطاق"],
  ["prompt-packs", "Prompt Packs", "حزم البرومبت"],
  ["wordpress-development", "WordPress Development", "تطوير WordPress"],
  ["wordpress-plugins", "WordPress Plugin Development", "تطوير إضافات WordPress"],
  ["dashboard-monitoring", "Live Dashboard", "الداشبورد الحي"],
  ["ai-cost-control", "AI Cost Control", "التحكم في تكلفة AI"],
  ["multi-ai-governance", "Multi-AI Governance", "حوكمة تعدد وكلاء AI"],
  ["github-release", "GitHub and Release Gates", "GitHub وبوابات الإصدار"],
  ["practical-examples", "Seven Practical Builds", "سبعة تطبيقات عملية"],
  ["example-ecommerce", "Example: Ecommerce Website", "مثال: متجر إلكتروني"],
  ["example-ai-team-ecommerce", "Example: 3 AI Developers Build Ecommerce", "مثال: 3 مطوري AI لبناء متجر"],
  ["example-blog", "Example: Personal Blog", "مثال: مدونة شخصية"],
  ["example-dental-clinic", "Example: Dental Clinic Booking", "مثال: عيادة أسنان وحجوزات"],
  ["example-crm", "Example: Professional CRM", "مثال: CRM احترافي"],
  ["example-mobile-commerce", "Example: Ecommerce Mobile App", "مثال: تطبيق موبايل للمتجر"],
  ["example-pos", "Example: Supermarket POS", "مثال: POS سوبرماركت"],
  ["example-wordpress-digital-agency", "Example: WordPress Digital Agency", "مثال: WordPress لشركة تسويق رقمي"],
  ["troubleshooting", "Troubleshooting", "حل المشكلات"]
];

const capabilityRows = {
  en: [
    ["CLI Engine", "Runs local workspace operations, validation, task lifecycle, dashboard export, package checks, and release gates.", "`bin/kvdf.js`, `src/cli/`, `cli/CLI_COMMAND_REFERENCE.md`"],
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
    ["Task Governance", "Turns work into scoped, source-backed, reviewable, token-aware, acceptance-driven units.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
    ["App Boundary Governance", "Allows related apps in one product workspace and blocks unrelated products from mixing in one folder.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
    ["Execution Scope Governance", "Connects tasks, apps, workstreams, allowed files, locks, and task access tokens.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
    ["Design Governance", "Converts design sources into approved text specs, page specs, component contracts, and visual checks.", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
    ["UI/UX Advisor", "Recommends interface patterns, component groups, page templates, SEO/GEO rules, and dashboard/mobile UX guidance.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
    ["UI/UX Reference Library", "Stores approved UI/UX rules and reference patterns, then generates design questions and governed frontend/design tasks from them.", "`knowledge/design_system/ui_ux_reference/`, `.kabeeri/design_sources/ui_ux_reference.json`"],
    ["ADR and AI Run History", "Preserves architecture decisions and accepted or rejected AI runs beyond chat history.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
    ["AI Cost Control", "Tracks usage, budgets, context packs, preflight estimates, model routing, accepted output, rework, and waste.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
    ["Live Dashboard", "Shows live technical, business, governance, task, app, cost, policy, workspace, and UX state.", "`integrations/dashboard/`, `.kabeeri/dashboard/`"],
    ["GitHub Sync", "Plans labels, milestones, issues, and release writes with dry-run defaults and confirmed write gates.", "`integrations/github_sync/`, `integrations/github/`"],
    ["Policy Gates", "Blocks unsafe verification, release, handoff, security, migration, and GitHub write operations.", "`schemas/policy*.json`, `.kabeeri/policies/`"],
    ["Evolution Steward", "Governs Kabeeri's own updates by recording requested framework changes, inferring impacted areas, creating follow-up tasks, and exposing unfinished dependent work to dashboard/live reports.", "`knowledge/governance/EVOLUTION_STEWARD.md`, `.kabeeri/evolution.json`, `kvdf evolution`"],
    ["Packaging and Upgrade", "Checks npm package readiness and workspace upgrade compatibility.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
  ],
  ar: [
    ["محرك CLI", "يشغل عمليات المساحة المحلية والتحقق ودورة حياة التاسكات وتصدير الداشبورد وفحص التغليف وبوابات الإصدار.", "`bin/kvdf.js`, `src/cli/`, `cli/CLI_COMMAND_REFERENCE.md`"],
    ["تنظيم المستودع", "يحافظ على تنظيم الفريمورك إلى runtime وknowledge وpacks وintegrations وschemas وdocs وtests وحالة حية.", "`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`"],
    ["حالة المشروع", "تخزن حقيقة المشروع والتاسكات والداشبورد والسياسات والتقارير والتوكنز والتكلفة والالتقاطات وسجل التدقيق.", "`.kabeeri/`"],
    ["تجربة Vibe-first", "تسمح للمطور بالكلام الطبيعي بينما يحول كبيري النية إلى اقتراحات وخطط والتقاطات وملخصات محكومة.", "`knowledge/vibe_ux/`, `.kabeeri/interactions/`"],
    ["مساعد نمط التسليم", "يساعد في الاختيار بين Agile وStructured حسب غموض المنتج وثبات النطاق والموافقات والمخاطر.", "`knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`"],
    ["خرائط المنتجات", "يفهم أنواع أنظمة السوق مثل متجر إلكتروني وERP وCRM وPOS وأخبار ومدونة وحجز وتوصيل وتطبيقات موبايل.", "`knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`"],
    ["تصميم البيانات", "يرشد تصميم قاعدة البيانات من دورة العمل والكيانات والعلاقات والقيود واللقطات والتدقيق والمعاملات والتقارير.", "`knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`"],
    ["تشغيل Agile", "يدير الباكلوج والإبيكس والستوريز والاسبرنت والمراجعات والسرعة والمعوقات وحالة داشبورد الاسبرنت.", "`knowledge/agile_delivery/`, `.kabeeri/agile.json`"],
    ["تشغيل Structured", "يدير المتطلبات والمراحل والمخرجات والتتبع والمخاطر وطلبات التغيير وبوابات المراحل.", "`knowledge/delivery_modes/`, `.kabeeri/structured.json`"],
    ["الأسئلة", "يجمع الإجابات المهمة فقط ويفعل مناطق النظام ويعرض النواقص ويولد التاسكات.", "`knowledge/questionnaires/`, `knowledge/questionnaire_engine/`"],
    ["حزم البرومبت", "توفر برومبتات واعية بالفريمورك مثل Laravel وReact وNext.js وVue وAngular وDjango وFastAPI وWordPress وExpo وFlutter وغيرها.", "`packs/prompt_packs/`"],
    ["تطوير WordPress", "يخطط مواقع WordPress الجديدة، ويعتمد المواقع القائمة، ويحلل plugins/themes، وينشئ plugins/themes آمنة، ويحول الخطة إلى تاسكات مع WordPress prompt pack بدون تعديل WordPress core.", "`packs/prompt_packs/wordpress/`, `.kabeeri/wordpress.json`, `schemas/runtime/wordpress-state.schema.json`"],
    ["تطوير إضافات WordPress", "ينشئ خطط plugins محكومة، وتاسكات محددة النطاق، وscaffold آمن، وقوائم قبول، وسياق جاهز للذكاء الاصطناعي لتطوير إضافات WordPress.", "`.kabeeri/wordpress.json`, `knowledge/wordpress/WORDPRESS_PLUGIN_DEVELOPMENT.md`, `wp-content/plugins/<slug>/`"],
    ["حوكمة التاسكات", "تحول العمل إلى وحدات ذات مصدر ونطاق ومراجعة وتوكنز ومعايير قبول.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
    ["حوكمة حدود التطبيقات", "تسمح بتطبيقات مرتبطة داخل منتج واحد وتمنع خلط منتجات غير مرتبطة في فولدر واحد.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
    ["حوكمة نطاق التنفيذ", "تربط التاسكات والتطبيقات ومسارات العمل والملفات المسموحة واللوكس وتوكنز التاسك.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
    ["حوكمة التصميم", "تحول مصادر التصميم إلى مواصفات نصية وصفحات وعقود مكونات وفحوصات بصرية معتمدة.", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
    ["مساعد UI/UX", "يقترح أنماط الواجهة ومجموعات المكونات وقوالب الصفحات وقواعد SEO/GEO وإرشاد الداشبورد والموبايل.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
    ["ADR وتاريخ تشغيل AI", "يحفظ قرارات المعمارية وتشغيلات AI المقبولة أو المرفوضة خارج ذاكرة الشات.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
    ["تكلفة AI", "يتتبع الاستخدام والميزانيات وحزم السياق والتقدير المسبق وتوجيه الموديلات والمخرجات المقبولة وإعادة العمل والهدر.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
    ["الداشبورد الحي", "يعرض الحالة التقنية والتجارية والحوكمة والتاسكات والتطبيقات والتكلفة والسياسات ومساحات العمل وتجربة الواجهة.", "`integrations/dashboard/`, `.kabeeri/dashboard/`"],
    ["مزامنة GitHub", "تخطط labels وmilestones وissues وrelease writes مع dry-run افتراضي وبوابات كتابة مؤكدة.", "`integrations/github_sync/`, `integrations/github/`"],
    ["بوابات السياسات", "تمنع التحقق والإصدار والتسليم والأمان والهجرة وكتابات GitHub غير الآمنة.", "`schemas/policy*.json`, `.kabeeri/policies/`"],
    ["التغليف والترقية", "تفحص جاهزية npm package وتوافق ترقية مساحات العمل.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
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
        lead: "Kabeeri VDF is a local-first operating framework for AI-assisted software development. It works with any AI coding assistant or automation tool the developer chooses. It does not replace Laravel, React, Next.js, Django, .NET, WordPress, hosting, Git, or the AI tool itself; it governs how a software idea becomes answers, tasks, prompts, implementation, review, dashboards, cost records, Owner verification, and release decisions.",
        beginner: "Think of Kabeeri as the project memory, delivery rulebook, AI coordination layer, and live dashboard around your codebase. The application is still built with its normal stack; Kabeeri keeps the work scoped, traceable, reviewable, and resumable.",
        sections: [
          ["What it governs", "Project intake, delivery mode, application boundaries, workstreams, questionnaires, product blueprints, data design, UI/UX guidance, prompt packs, tasks, reviews, policies, dashboards, GitHub sync, AI usage, and releases."],
          ["What it does not replace", "It is not the application framework, database, hosting platform, Git provider, or AI coding model. It sits above those tools and gives them context and guardrails."],
          ["Why it matters", "AI can generate code quickly, but projects fail when scope, source, acceptance, ownership, cost, and release readiness are unclear. Kabeeri makes those parts explicit."],
          ["Where truth lives", "Runtime truth lives in `.kabeeri/`; reusable system knowledge lives in `knowledge/`; exportable packs live in `packs/`; integrations live in `integrations/`; contracts live in `schemas/`."]
        ],
        steps: ["Open the repository", "Read current state", "Validate", "Choose scenario", "Answer missing questions", "Create scoped tasks", "Use AI on one task", "Review and verify", "Release or defer"],
        details: [
          ["Developer mental model", ["Use Kabeeri before coding to decide what should be built, during coding to constrain AI work, and after coding to record evidence and acceptance.", "If a session is closed, the next developer or AI assistant should recover from `.kabeeri/`, docs, task state, and dashboard state instead of old chat memory."]],
          ["Professional output", ["Every serious feature should have a source, scope, workstream, acceptance criteria, changed files, evidence, cost record, review status, and Owner decision.", "This is the difference between vibe coding as improvisation and vibe coding as a repeatable engineering workflow."]]
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
        steps: ["Identify scenario", "Validate", "Read dashboard", "Plan questions", "Select Agile or Structured", "Create tasks", "Use prompt pack", "Record evidence", "Owner verify"],
        details: [
          ["First ten minutes", ["Run validation, read the system capabilities file, inspect the repository layout, and open the dashboard state.", "Do not ask AI to modify code until the target task, allowed scope, and acceptance criteria are known."]],
          ["How Kabeeri reduces token use", ["The foldering map tells AI where to look first. Product blueprints and data design reduce repeated discovery. Prompt packs give stack-specific context. Task scope and context packs prevent broad scans.", "The result is less repeated explanation, less chat memory loss, and fewer accidental edits."]]
        ],
        checklist: ["You know which scenario you are in.", "Validation is green or blockers are known.", "The next task has source and acceptance criteria.", "The selected prompt pack matches the stack.", "Any broad work has a capture or planning record."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js questionnaire plan", "node bin/kvdf.js delivery recommend", "node bin/kvdf.js task tracker --json"]
      },
      "install-profiles": {
        lead: "This page explains how to get Kabeeri from GitHub, run it locally, expose the `kvdf` command, and choose the right project profile: `lite`, `standard`, or `enterprise`.",
        beginner: "`lite` is the small starter, `standard` is the normal recommended setup, and `enterprise` is the full governance setup.",
        sections: [
          ["Install from GitHub", "Clone the repository, install dependencies, run validation, then use `npm run kvdf -- ...` until the `kvdf` binary is linked or installed."],
          ["When `kvdf` becomes available", "After local linking or package installation, use `kvdf` directly in daily work. `node bin/kvdf.js` remains a source-code fallback for framework development."],
          ["`lite` profile", "Smallest practical project pack. Good for experiments, solo prototypes, simple websites, and early product discovery where heavy governance would slow the first steps."],
          ["`standard` profile", "Recommended default. Good for real client work, normal apps, AI-assisted builds, dashboards, task governance, prompt packs, and balanced Agile/Structured delivery."],
          ["`enterprise` profile", "Full operating pack. Good for large systems, teams, regulated work, multi-AI coordination, deeper acceptance, production governance, release gates, and stronger traceability."]
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
        steps: ["Talk normally", "Kabeeri records intent", "AI receives scoped context", "AI implements one task", "Kabeeri records evidence", "Owner verifies"],
        details: [
          ["What the developer actually does", ["Open the project folder, tell the assistant what you want, review the suggested plan and tasks, approve or adjust them, then let the assistant execute task by task.", "When a command is needed, the assistant can run it. The developer only needs to understand the journey, not memorize every command."]],
          ["What the AI must respect", ["AI should not modify unrelated files, skip validation, invent missing requirements, publish without gates, or treat vague chat as approval.", "AI should use product blueprints, questions, data design, UI/UX advisor, prompt packs, task scope, and dashboard state before implementation."]]
        ],
        checklist: ["Developer understands AI is the coding partner.", "Kabeeri is understood as the control environment.", "CLI is understood as an engine, not a burden.", "Dashboard is understood as monitoring.", "Tasks and verification remain required."],
        commands: ["node bin/kvdf.js vibe \"Build an ecommerce store\"", "node bin/kvdf.js dashboard serve --port auto", "node bin/kvdf.js context-pack create --task task-001", "node bin/kvdf.js prompt-pack compose react --task task-001"]
      },
      "capabilities": {
        lead: "This page is the web version of the Kabeeri capabilities reference. It explains what each capability owns, why it exists, and where a developer should look.",
        beginner: "When you are lost, this is the map. Pick the capability that matches your problem, then follow its source files and commands.",
        capabilityTable: true,
        sections: [
          ["How to read the table", "Each row is a system capability. The middle column explains the practical job. The source column tells the developer where to inspect or extend it."],
          ["What makes capabilities useful", "A capability is useful only if it has documentation, runtime state or executable checks, and a clear relationship to tasks, dashboards, or AI context."],
          ["How capabilities connect", "Product Blueprints feed Questionnaires. Questionnaires feed Tasks. Data Design and UI/UX Advisor improve those tasks. Prompt Packs guide AI implementation. Dashboard, policies, cost, and Owner verification close the loop."]
        ],
        steps: ["Find capability", "Open source", "Check runtime state", "Run command", "Update docs and tests", "Validate"],
        details: [
          ["Developer usage", ["Use this page before creating new folders or new systems. If a feature belongs to an existing capability, extend that capability instead of creating a new scattered document.", "For AI work, paste or summarize the relevant capability row and source path into the task context."]],
          ["Maintenance rule", ["When a capability changes, update the source docs, runtime implementation, schema if any, tests, and this docs site.", "The capabilities reference should remain the executive index of the whole framework."]]
        ],
        checklist: ["Capability exists in docs.", "Implementation or runtime state exists when needed.", "CLI or validation path exists when needed.", "Dashboard or reports can expose important state.", "The capability is reflected in this site."]
      },
      "repository-layout": {
        lead: "Kabeeri now uses a physical Laravel-like repository layout with a small set of top-level folders. This makes the framework easier to learn, faster for AI tools to scan, and safer to extend.",
        beginner: "If you are a developer, do not search the whole repository first. Start with the group that owns your problem: runtime in `src/`, knowledge in `knowledge/`, reusable packs in `packs/`, integrations in `integrations/`, docs in `docs/`, schemas in `schemas/`, tests in `tests/`, and live state in `.kabeeri/`.",
        sections: [
          ["`src/`", "Executable CLI runtime, command handlers, workspace helpers, validation logic, dashboard builders, and command behavior."],
          ["`knowledge/`", "Reusable operating knowledge: governance, product intelligence, delivery modes, questionnaires, task tracking, data design, UI/UX, Vibe UX, and design governance."],
          ["`packs/`", "Exportable assets: prompt packs, generators, templates, and examples used to start or guide customer projects."],
          ["`integrations/`", "External-facing adapters and surfaces: dashboard, GitHub, VS Code, platform integration, and multi-AI coordination material."],
          ["`docs/`", "Human documentation, architecture notes, production guides, reports, bilingual docs, docs site, and AI context."],
          ["`.kabeeri/`", "Live local workspace state. This is the source of truth for current project work, not a documentation folder."]
        ],
        steps: ["Read foldering map", "Choose owning root", "Add files inside existing group", "Keep runtime state under `.kabeeri/`", "Validate structure"],
        details: [
          ["Legacy aliases", ["Old root paths like `prompt_packs/`, `standard_systems/`, `dashboard/`, and `governance/` remain readable through CLI aliases for compatibility.", "New files should use the new physical folders. Aliases are a bridge, not the preferred layout."]],
          ["AI scan policy", ["AI tools should read `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` before broad scanning.", "This reduces token use and prevents the assistant from treating old moved folders as missing."]]
        ],
        checklist: ["No new top-level folder is created without a documented reason.", "New docs go under `docs/` or `knowledge/` depending on whether they are human docs or reusable system knowledge.", "Prompt packs and templates go under `packs/`.", "External surfaces go under `integrations/`."],
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
          ["5. Verify Owner setup", "Create or check the Owner session when final acceptance will require Owner verification."],
          ["6. Start the question system", "Use adaptive questions to discover product type, backend, frontend, database, UI/UX, delivery mode, and release risks."],
          ["7. Plan and execute", "Use blueprint, data design, UI/UX advisor, prompt packs, task governance, context packs, and dashboard monitoring to continue development."]
        ],
        steps: ["Kabeeri folder", "Dashboard", "Vibe-first", "Validate", "Owner", "Questions", "Plan", "AI implementation", "Review", "Handoff"],
        details: [
          ["Example: ecommerce with Laravel and React", ["Kabeeri treats backend Laravel and frontend React as related apps in one product workspace when they serve the same store.", "The product blueprint activates commerce, inventory, payments, shipping, customers, admin, storefront, SEO, security, tests, and release readiness."]],
          ["What good planning produces", ["A list of apps, workstreams, entities, pages, APIs, integrations, roles, acceptance criteria, risks, and initial tasks.", "The first implementation tasks should be small enough for one AI session and one review cycle."]]
        ],
        checklist: ["Product type selected.", "Apps and boundaries defined.", "Delivery mode selected.", "Questionnaire coverage known.", "Initial data model drafted.", "Initial UI pattern selected.", "Tasks are ready before coding."],
        commands: ["node bin/kvdf.js init --profile standard --mode agile", "node bin/kvdf.js dashboard generate", "node bin/kvdf.js vibe \"I want to build an ecommerce store\"", "node bin/kvdf.js validate", "node bin/kvdf.js owner status", "node bin/kvdf.js questionnaire plan \"Build an ecommerce store\"", "node bin/kvdf.js blueprint recommend \"Build an ecommerce store\"", "node bin/kvdf.js data-design context ecommerce", "node bin/kvdf.js design recommend ecommerce", "node bin/kvdf.js prompt-pack list"]
      },
      "existing-kabeeri-project": {
        lead: "Use this roadmap when the project already has `.kabeeri/` state and you are returning after a session break or another developer worked before you.",
        beginner: "Your first job is recovery. Kabeeri should tell you where the project stands, what changed, what is blocked, what is ready, and what should happen next.",
        sections: [
          ["Validate state", "Run validation to catch broken JSON, missing schemas, invalid tasks, lock conflicts, expired tokens, route boundary issues, and policy blockers."],
          ["Read dashboard state", "Use the live dashboard and task tracker to see progress, ready work, blockers, cost, workstreams, app state, and release status."],
          ["Inspect recent captures", "If work happened outside the ideal task flow, post-work capture can classify changed files and link them back to tasks or suggested tasks."],
          ["Continue only ready work", "Pick a task that is ready, assigned, scoped, and has acceptance criteria. Avoid restarting from vague memory."],
          ["Close the loop", "Record evidence, review output, update dashboard state, close locks or tokens, and ask for Owner verification when complete."]
        ],
        steps: ["Validate", "Dashboard", "Tasks", "Captures", "Locks/tokens", "Continue", "Evidence", "Owner verify"],
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
        lead: "Kabeeri supports two major delivery systems: Agile and Structured. The AI assistant should help the developer choose, but the developer or Owner makes the final decision.",
        beginner: "Agile is best when scope changes and you need learning through iterations. Structured is best when scope, approvals, documents, traceability, and phase gates matter more.",
        sections: [
          ["Use Agile when", "The product is evolving, the team expects feedback loops, priorities may change, and delivery is best organized as backlog, stories, sprints, reviews, and retrospectives."],
          ["Use Structured when", "The project needs formal requirements, approved phases, traceability, change control, enterprise handoff, client signoff, or regulated delivery."],
          ["Use both carefully", "A high-level Structured phase can contain Agile execution inside a phase, but Kabeeri should record which mode owns the decision and reporting."],
          ["Let Kabeeri recommend", "The recommendation should consider project type, uncertainty, client governance, team size, release pressure, risk, and documentation needs."]
        ],
        steps: ["Describe product", "Assess uncertainty", "Assess approvals", "Assess team workflow", "Recommend", "Owner chooses", "Record decision"],
        details: [
          ["Decision examples", ["A startup SaaS MVP with unclear scope usually fits Agile.", "A government ERP rollout with signed requirements usually fits Structured.", "An ecommerce MVP for one owner may use Agile, while a client ecommerce platform with fixed deliverables may use Structured."]],
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
          ["Sprint review", "Records accepted work, rework, goal result, evidence, and Owner feedback."],
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
        lead: "Task Governance is the core mechanism that turns ideas, answers, issues, and captures into safe executable work.",
        beginner: "A Kabeeri task is more than a todo. It has source, scope, workstream, assignee, reviewer, acceptance criteria, allowed files, token budget, evidence, and final verification path.",
        sections: [
          ["Source", "Every task should come from a product answer, blueprint, bug report, design spec, capture, GitHub issue, release need, or Owner decision."],
          ["Definition of Ready", "A task is not ready if scope, acceptance, workstream, dependencies, or reviewer are unknown."],
          ["Execution", "Work starts with assignment, optional lock, token scope, AI session, and allowed files."],
          ["Review", "Review checks changed files, evidence, tests, acceptance criteria, and policy gates."],
          ["Verification", "Owner verification accepts or rejects final completion and closes the loop."]
        ],
        steps: ["Source", "Draft", "Ready", "Assign", "Execute", "Review", "Owner verify", "Close"],
        details: [
          ["Why it prevents chaos", ["AI tools are powerful but can drift. Task governance gives each session a boundary and an acceptance target.", "This is especially important when multiple apps, developers, or AI agents share one workspace."]],
          ["Live JSON", ["Task tracker state can be represented as live JSON for dashboards and editor integrations.", "This reduces manual docs editing after every task because UI surfaces can read state directly."]]
        ],
        checklist: ["Task has source.", "Acceptance criteria are testable.", "Allowed files are clear.", "Reviewer exists.", "Evidence is recorded.", "Owner decision is recorded when required."],
        commands: ["node bin/kvdf.js task tracker --json", "node bin/kvdf.js validate task"]
      },
      "app-boundary": {
        lead: "App Boundary Governance decides whether multiple applications can live inside one Kabeeri workspace without mixing unrelated products.",
        beginner: "Backend Laravel plus React storefront plus admin dashboard can be one product if they serve the same ecommerce system. A store and a news platform for a different client should not share one Kabeeri folder.",
        sections: [
          ["Allowed", "Related apps in one product: backend API, storefront, admin panel, mobile app, worker, docs site, vendor portal, or driver app."],
          ["Blocked", "Unrelated products, unrelated clients, separate business lifecycles, or apps that need separate tasks, releases, cost, ownership, and governance."],
          ["Boundaries", "Each app should have path, type, product, workstreams, status, and integration relationship."],
          ["Cross-app work", "Integration tasks should explicitly mention every affected app and workstream."]
        ],
        steps: ["Identify product", "List apps", "Check relatedness", "Assign paths", "Assign workstreams", "Validate boundaries"],
        details: [
          ["Practical rule", ["A backend and frontend for the same ecommerce product are related applications, not unrelated products.", "Two different applications requested by the developer in the same folder are blocked unless they are modules/channels of one product."]],
          ["Why it matters", ["Without boundaries, tasks, costs, dashboards, releases, and AI context become polluted.", "Boundary governance keeps one workspace coherent."]]
        ],
        checklist: ["Every app has a product owner.", "Every app has a path.", "Relatedness is explicit.", "Cross-app tasks are marked as integration work."],
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
          ["Team mode", ["Teams need explicit ownership, locks, and token scopes before parallel work.", "AI agents should be treated as identities with constrained workstreams."]]
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
          ["Quality rule", ["Prompt packs should guide implementation, not bypass review.", "The output still needs tests, evidence, and Owner verification where required."]]
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
          ["Existing site flow", ["Start with `kvdf wordpress analyze --path existing-wordpress --staging --backup`.", "If staging or backup is missing, Kabeeri records risk and the AI should not perform broad changes until the Owner accepts the risk."]],
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
        lead: "The Live Dashboard is the operational view over `.kabeeri/` state. It helps developers, Owners, and AI assistants understand current truth quickly.",
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
          ["For teams", ["Cost by sprint, workstream, assignee, task, and accepted output helps the Owner understand ROI.", "Budget approvals prevent silent overuse."]]
        ],
        checklist: ["Pricing rules exist.", "Usage is linked to task or marked untracked.", "Context pack exists for large tasks.", "Accepted/rejected output is tracked.", "Budget approval exists for broad or expensive work."],
        commands: ["node bin/kvdf.js usage summary", "node bin/kvdf.js preflight estimate --task task-001", "node bin/kvdf.js model-route recommend --kind implementation --risk medium"]
      },
      "multi-ai-governance": {
        lead: "Multi-AI Governance controls identities, roles, sessions, locks, tokens, budgets, and Owner verification when humans and AI agents collaborate.",
        beginner: "Even if you are one developer, Kabeeri can treat you, AI coding assistants, IDE agents, and automation tools as actors whose work should be scoped, auditable, and reviewable.",
        sections: [
          ["Identities", "Developers and AI agents have IDs, roles, capabilities, and workstreams."],
          ["Sessions", "AI work sessions record task, developer or agent, provider, model, files, summary, and outcome."],
          ["Locks", "Prevent overlapping edits across people or agents."],
          ["Owner rule", "Only the active Owner can make final verification decisions when Owner verification is required."],
          ["Audit", "Important actions become audit events so project history survives chat resets."]
        ],
        steps: ["Define Owner", "Add developers/agents", "Assign workstreams", "Issue token", "Lock scope", "Record session", "Verify"],
        details: [
          ["Solo mode", ["Solo mode can reduce ceremony while keeping the same state shape.", "This means the project can later grow into team mode without losing governance."]],
          ["Parallel AI", ["Parallel agents should own disjoint scopes and should never silently overwrite each other.", "Kabeeri helps expose conflicts before they become broken code."]]
        ],
        checklist: ["Owner is known.", "Developers and agents are identified.", "Assignments are scoped.", "Locks are checked.", "Sessions are recorded.", "Owner verification is respected."],
        commands: ["node bin/kvdf.js developer solo --id dev-main --name \"Main Developer\"", "node bin/kvdf.js session start --task task-001 --developer agent-001"]
      },
      "github-release": {
        lead: "GitHub and Release Gates help Kabeeri publish or sync only after local truth, policies, security, migrations, and Owner decisions are ready.",
        beginner: "GitHub is a collaboration and publishing surface. It should not become the only source of truth for Kabeeri delivery state.",
        sections: [
          ["GitHub sync", "Maps tasks to issues, labels, milestones, and release plans, usually through dry-run first."],
          ["Release readiness", "Checks validation, notes, checklist, policies, security, migrations, blockers, and Owner evidence."],
          ["Publish gates", "Separate production-ready from actually published. A project can be deployable but intentionally not public."],
          ["Confirmed writes", "GitHub writes require explicit confirmation and policy gates."],
          ["Packaging", "Product packaging checks ensure the framework can be distributed with the right files after folder reorganization."]
        ],
        steps: ["Validate", "Security", "Migration check", "Policy gate", "Release checklist", "GitHub dry-run", "Confirm write"],
        details: [
          ["Why dry-run matters", ["Dry-run lets the developer inspect labels, issues, milestones, and release changes before touching GitHub.", "This protects the repository from accidental public or team-visible changes."]],
          ["Package readiness", ["After foldering changes, packaging must include `knowledge/`, `packs/`, `integrations/`, `schemas/`, `docs/`, `src/`, `bin/`, and `cli/`.", "Package checks prevent publishing an incomplete framework."]]
        ],
        checklist: ["Validation passed.", "Security state is acceptable.", "Migration risk is reviewed.", "Policy gates pass.", "GitHub write is dry-run first.", "Owner confirmation exists."],
        commands: ["node bin/kvdf.js release check --strict", "node bin/kvdf.js package check", "node bin/kvdf.js github plan --dry-run"]
      },
      "practical-examples": {
        lead: "This page shows seven practical build paths. Each example explains how a developer can use Kabeeri with any AI assistant from idea to handoff without needing deep technical experience first.",
        beginner: "Use these as story-like playbooks. Tell your AI assistant what goal, let Kabeeri choose product blueprint, delivery mode, questions, data design, UI direction, prompt packs, tasks, and dashboard checks, then implement one task at a time.",
        sections: [
          ["1. Full ecommerce website", "Use one product workspace with related apps: backend API, public storefront, admin panel, and possibly worker jobs. Recommended stack: Laravel or NestJS/FastAPI backend, React/Next.js storefront, admin dashboard with React/Mantine/Ant Design. Use Agile for MVP discovery or Structured for a client store with fixed scope. Kabeeri activates commerce, inventory, payments, shipping, coupons, reviews, customers, admin, SEO, security, tests, release gates, AI cost, and GitHub sync."],
          ["2. Personal blog website", "Use a simple content blueprint. Recommended stack: Astro or Next.js with Markdown/MDX, or WordPress if the user wants a CMS. Use Agile for iterative content/design or Structured if a client has approved pages. Kabeeri plans pages, posts, authors, categories, tags, SEO, sitemap, newsletter, comments, analytics, content workflow, UI typography, and deployment readiness."],
          ["3. Dental clinic booking website/system", "Treat it as booking plus service website plus admin panel. Recommended stack: Laravel or Django backend with React/Next.js frontend. Use Structured if the clinic owner has strict requirements, or Agile for fast MVP. Kabeeri plans services, dentists, availability, appointments, patient records, reminders, admin calendar, cancellation policy, roles, privacy, notifications, and reports."],
          ["4. Professional CRM", "Treat it as a data-heavy business operations system. Recommended stack: Laravel/NestJS/.NET/FastAPI backend with React, Angular, or Vue admin frontend. Use Structured for enterprise CRM or Agile for startup CRM. Kabeeri plans leads, contacts, companies, deals, pipeline, activities, follow-ups, quotes, permissions, audit, import/export, dashboards, reports, and integrations."],
          ["5. Mobile app for the ecommerce store", "Treat it as a related mobile channel for the ecommerce product, not a separate product. Recommended stack: React Native Expo or Flutter. Use Agile because mobile UX usually evolves through testing. Kabeeri links it to the ecommerce backend and plans onboarding, auth, product feed, search, cart, checkout, orders, push notifications, profile, deep links, offline cache, app versions, analytics, and store release readiness."],
          ["6. Supermarket POS system", "Treat it as a POS operations system with inventory and possibly offline mode. Recommended stack: Laravel/.NET/NestJS backend, React/Vue/Angular POS screen, or Electron/web kiosk if needed. Use Structured for serious retail rollout because devices, shifts, receipts, cash drawer, returns, inventory, and audit are critical. Kabeeri plans cashier flow, barcode, products, prices, taxes, shifts, payments, receipts, offline sales, stock movements, reports, permissions, and security."],
          ["7. WordPress digital agency website", "Use WordPress for a digital marketing agency website with public service pages, blog, case studies, lead forms, and four custom plugins for customers, service requests, invoices, and accounts. Kabeeri keeps each plugin scoped, secure, and task-governed under `wp-content/plugins/`."]
        ],
        steps: ["Describe idea", "Select blueprint", "Choose delivery mode", "Answer questions", "Plan data", "Plan UI", "Select prompt packs", "Create tasks", "AI implements", "Review", "Owner verifies", "Handoff"],
        details: [
          ["Universal AI flow", ["Tell your AI assistant what product in plain language. AI assistant uses Kabeeri to recommend blueprint, delivery mode, data design, UI direction, framework prompt packs, and first tasks.", "The AI assistant should implement only one governed task at a time, record changed files and evidence, then run validation and tests."]],
          ["Backend planning pattern", ["For every example, define users, roles, entities, APIs, validation, permissions, audit logs, integrations, tests, and release risks before asking AI to code.", "Use `data-design context` to avoid weak database models."]],
          ["Frontend planning pattern", ["For every example, define pages, layouts, components, empty/loading/error states, responsive behavior, accessibility, and SEO/GEO needs if public.", "Use `design recommend` and design source governance before frontend implementation."]],
          ["Handoff pattern", ["Before delivery, run validation, dashboard, readiness report, governance report, security scan, release gates, and handoff package.", "The result should be a project with visible state, not only generated code."]]
        ],
        checklist: ["Each example has a product blueprint.", "Delivery mode is selected.", "Backend and frontend are planned separately.", "Prompt packs match chosen stacks.", "Tasks are scoped before AI edits code.", "Dashboard and Owner verification close the work."],
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
        steps: ["Describe store", "Select ecommerce blueprint", "Choose Agile/Structured", "Answer questions", "Design database", "Plan storefront", "Plan admin", "Create tasks", "AI implements", "Test checkout", "Owner verifies", "Handoff"],
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
        beginner: "The improved scenario is not three AIs freely editing the same project. The safe scenario is one product workspace, one team lead/Owner, three registered AI agents, separate app boundaries, separate workstreams, scoped tasks, locks, tokens, handoff evidence, then integration tasks to join everything.",
        sections: [
          ["Recommended structure", "Treat the store as one product with related apps: `store-api`, `storefront-web`, `store-mobile`, and optional `admin-dashboard` or workers. The backend AI owns APIs and database changes. The web AI owns public storefront pages. The mobile AI owns Expo/Flutter screens and mobile integration. The team lead owns planning, approvals, task splitting, integration decisions, policy gates, and final verification."],
          ["Team lead role", "The lead is the human developer, Owner, or technical reviewer. The lead selects the product blueprint, chooses Agile or Structured, answers or approves questionnaire decisions, creates apps/workstreams, assigns tasks, issues tokens, reviews outputs, resolves conflicts, and decides when work is integrated."],
          ["Backend AI role", "The backend AI works only on API, database, auth, products, cart, checkout, orders, payments, inventory, webhooks, tests, and backend docs. It must publish API contracts before web/mobile consume them."],
          ["Web AI role", "The web AI works only on public ecommerce storefront: home, categories, product list, product detail, search, filters, cart drawer, checkout UI, account/order pages, SEO, responsive states, and web tests."],
          ["Mobile AI role", "The mobile AI works only on the mobile channel: onboarding, auth, product feed, search, product detail, cart, checkout integration, orders, profile, push token registration, offline/error states, and device testing."],
          ["How tasks move", "Tasks do not move by chat memory. A task is created, assigned, scoped, tokenized, locked, implemented, ended with evidence, reviewed, and then either verified or rejected. Cross-team work becomes an integration task owned by the lead or explicitly assigned as `type=integration`."],
          ["How the store is finished", "The store is not finished when three agents say done. It is finished when backend contracts are stable, web and mobile flows pass against the same backend, payment and order lifecycle are tested, policy/security/readiness gates pass, Owner verification is recorded, and a handoff package exists."]
        ],
        steps: ["Create product workspace", "Register apps", "Register AI agents", "Create workstreams", "Plan API contracts", "Split tasks", "Issue tokens and locks", "Backend builds contracts", "Web and mobile consume contracts", "Run integration tasks", "Review evidence", "Owner verifies", "Handoff"],
        details: [
          ["Permissions model", ["Owner or team lead can create apps, add agents, assign tasks, issue/revoke tokens, approve budget overruns, run policy gates, and verify final work.", "Backend AI can only work inside backend/database/API scopes assigned to its task.", "Web AI can only work inside storefront web paths assigned to public_frontend tasks.", "Mobile AI can only work inside mobile app paths assigned to mobile tasks.", "No AI agent should have Owner authority. If an AI needs broader scope, the lead creates a new integration task with explicit allowed files."]],
          ["Suggested apps", ["`store-api`: backend API and admin/API services.", "`storefront-web`: public web storefront.", "`store-mobile`: customer mobile app.", "`admin-dashboard`: optional admin panel if separated from backend.", "All apps can stay in one Kabeeri workspace because they are one ecommerce product. A separate unrelated store should use a separate Kabeeri folder."]],
          ["Task exchange rules", ["Backend AI does not hand files directly to the web/mobile AI. It hands over API contracts, endpoint notes, changed files, tests, and risks through session summary, capture, ADR if needed, and task evidence.", "Web/mobile AIs do not change backend code when an endpoint is missing. They create or request a backend task.", "Shared decisions such as auth strategy, cart sync, payment redirect, and order status naming should become ADRs or approved task notes.", "If web and mobile need the same API shape, the lead creates one contract task before UI tasks proceed."]],
          ["Per-agent handoff", ["Each AI session must end with changed files, checks run, summary, risks, and what remains blocked.", "Backend handoff must include endpoints, migrations, seed data, auth rules, idempotency/webhook notes, and tests.", "Web handoff must include pages/screens completed, API dependencies, responsive states, SEO/accessibility notes, and tests.", "Mobile handoff must include screens completed, API dependencies, device/platform notes, permissions, offline/error states, and release blockers."]],
          ["Integration plan", ["Integration Task 1: backend publishes product/catalog/cart/order API contracts.", "Integration Task 2: web storefront consumes API and validates cart/checkout/order flows.", "Integration Task 3: mobile app consumes same API and validates auth/product/cart/order flows.", "Integration Task 4: payment/order lifecycle tested end-to-end.", "Integration Task 5: readiness report, governance report, security scan, dashboard export, and handoff package."]],
          ["Conflict prevention", ["Use app boundaries so mobile cannot edit storefront and storefront cannot edit backend.", "Use workstreams so backend/database/public_frontend/mobile/security are explicit.", "Use locks before AI starts editing shared files.", "Use task access tokens so each AI has allowed_files and forbidden_files.", "Use policy gates before final verification or release."]],
          ["Common failure modes", ["All agents start coding before API contracts exist.", "Frontend agents invent mock data that does not match backend responses.", "Mobile app becomes a second product instead of a channel for the same store.", "The lead accepts separate demos but never tests the full checkout/order lifecycle.", "One agent edits shared config or auth files without an integration task."]]
        ],
        checklist: ["One ecommerce product workspace exists.", "Apps are registered with stable usernames.", "Backend, web, and mobile agents are registered.", "Each task has one owner, app scope, workstream, allowed files, and acceptance criteria.", "API contracts exist before frontend implementation depends on them.", "Integration tasks join backend, web, and mobile work.", "Each AI submits evidence and risks.", "Lead reviews, Owner verifies, gates pass, handoff package is generated."],
        commands: ["node bin/kvdf.js init --profile standard --mode agile", "node bin/kvdf.js app create --username store-api --name \"Store API\" --type backend --path apps/api --product Store", "node bin/kvdf.js app create --username storefront-web --name \"Storefront Web\" --type frontend --path apps/web --product Store", "node bin/kvdf.js app create --username store-mobile --name \"Store Mobile\" --type mobile --path apps/mobile --product Store", "node bin/kvdf.js agent add --id ai-backend --name \"AI Backend Developer\" --role \"AI Developer\" --workstreams backend,database,integration", "node bin/kvdf.js agent add --id ai-web --name \"AI Web Frontend Developer\" --role \"AI Developer\" --workstreams public_frontend", "node bin/kvdf.js agent add --id ai-mobile --name \"AI Mobile Developer\" --role \"AI Developer\" --workstreams mobile,integration", "node bin/kvdf.js task create --title \"Define ecommerce API contracts\" --app store-api --workstream backend", "node bin/kvdf.js task create --title \"Build storefront product listing\" --app storefront-web --workstream public_frontend", "node bin/kvdf.js task create --title \"Build mobile product feed\" --app store-mobile --workstream mobile", "node bin/kvdf.js task create --title \"Integrate checkout across API web and mobile\" --type integration --apps store-api,storefront-web,store-mobile --workstreams backend,public_frontend,mobile,integration", "node bin/kvdf.js token issue --task task-001 --assignee ai-backend", "node bin/kvdf.js lock create --type folder --scope apps/api --task task-001 --owner ai-backend", "node bin/kvdf.js session start --task task-001 --developer ai-backend", "node bin/kvdf.js session end session-001 --input-tokens 1000 --output-tokens 500 --files apps/api --summary \"API contracts implemented\" --checks \"npm test\" --risks \"Payment sandbox not connected\"", "node bin/kvdf.js readiness report", "node bin/kvdf.js governance report", "node bin/kvdf.js handoff package --id ecommerce-team-handoff --audience owner"]
      },
      "example-blog": {
        lead: "This playbook explains how to build a personal blog with Kabeeri and an AI assistant. The goal is not only pages; it is a maintainable content system with SEO, clean reading experience, and simple publishing flow.",
        beginner: "Tell your AI assistant: 'I want a personal blog.' Kabeeri should discover whether it is a static blog, CMS-backed blog, portfolio blog, newsletter blog, or paid-content blog before code starts.",
        sections: [
          ["Product shape", "A personal blog publishes articles, author profile, categories, tags, search, newsletter, SEO pages, about/contact pages, and maybe comments or paid content."],
          ["Recommended stack", "Astro or Next.js with Markdown/MDX for a fast personal blog. WordPress if the owner wants a classic CMS. Strapi or headless CMS if content should be managed separately."],
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
        steps: ["Define clinic services", "Plan booking rules", "Design data", "Plan public site", "Plan admin calendar", "Create tasks", "AI implements", "Test booking conflicts", "Owner verifies"],
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
        steps: ["Define store operations", "Choose Structured", "Design POS data", "Plan cashier UI", "Plan admin", "Create phase tasks", "AI implements", "Test sales/returns/offline", "Owner verifies"],
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
          ["Release blocked", "Check policy results, security scan, migration state, unresolved blockers, and Owner evidence."]
        ],
        steps: ["Run validate", "Find source", "Fix source", "Regenerate derived output", "Run tests", "Validate again"],
        details: [
          ["After folder reorganization", ["If a command uses an old path, first check whether it is a compatibility alias. The physical file may now be under `knowledge/`, `packs/`, or `integrations/`.", "Do not recreate old root folders just to satisfy a stale reference. Update the reference or asset alias."]],
          ["After a broken AI session", ["Capture changed files, compare them to the task scope, reject or split out unrelated edits, then create follow-up tasks.", "This preserves useful work without accepting unsafe drift."]]
        ],
        checklist: ["Failure source identified.", "No manual dashboard-only fix.", "No old root folder recreated accidentally.", "Validation rerun.", "Tests rerun when code changed."],
        commands: ["node bin/kvdf.js validate", "npm test", "node bin/kvdf.js structure validate --json"]
      }
    }
  },
  ar: {
    ui: {
      eyebrow: "توثيق Kabeeri VDF",
      beginner: "شرح مبسط",
      guide: "دليل المطور",
      steps: "خارطة الطريق المقترحة",
      checklist: "قائمة الجاهزية",
      commands: "أوامر مفيدة",
      details: "تفاصيل عميقة",
      mistakes: "سيناريوهات فشل شائعة",
      source: "مصدر الحقيقة",
      search: "ابحث في الدليل",
      filter: "تصفية"
    },
    pages: {
      "what-is": {
        lead: "Kabeeri VDF هو فريمورك تشغيل محلي لتطوير البرمجيات بمساعدة الذكاء الاصطناعي. يعمل مع أي مساعد برمجة أو أداة أتمتة بالذكاء الاصطناعي يختارها المطور. هو لا يستبدل Laravel أو React أو Next.js أو Django أو .NET أو WordPress أو الاستضافة أو Git أو أداة الذكاء الاصطناعي نفسها؛ دوره أن يحكم كيف تتحول الفكرة إلى إجابات وتاسكات وبرومبتات وتنفيذ ومراجعة وداشبورد وتكلفة AI وتحقق مالك وقرار إصدار.",
        beginner: "اعتبر كبيري ذاكرة المشروع وكتاب قواعد التسليم وطبقة تنسيق AI والداشبورد الحي حول الكود. التطبيق نفسه يظل مبنيًا بالفريمورك الطبيعي، وكبيري يحافظ على النطاق والتتبع والمراجعة والقدرة على استكمال العمل بعد انقطاع الجلسات.",
        sections: [
          ["ما الذي يحكمه", "استقبال المشروع، اختيار نمط التسليم، حدود التطبيقات، مسارات العمل، الأسئلة، خرائط المنتجات، تصميم البيانات، UI/UX، حزم البرومبت، التاسكات، المراجعات، السياسات، الداشبورد، GitHub sync، تكلفة AI، والإصدارات."],
          ["ما الذي لا يستبدله", "ليس فريمورك التطبيق ولا قاعدة البيانات ولا الاستضافة ولا Git ولا نموذج AI للكتابة. هو طبقة أعلى تعطي هذه الأدوات سياقًا وحدودًا."],
          ["لماذا مهم", "AI يكتب كود بسرعة، لكن المشاريع تفشل عندما يكون النطاق والمصدر ومعايير القبول والملكية والتكلفة وجاهزية الإصدار غير واضحة. كبيري يجعل هذه الأجزاء صريحة."],
          ["أين توجد الحقيقة", "الحالة الحية في `.kabeeri/`، والمعرفة القابلة لإعادة الاستخدام في `knowledge/`، والحزم القابلة للتصدير في `packs/`، والتكاملات في `integrations/`، والعقود في `schemas/`."]
        ],
        steps: ["افتح الريبو", "اقرأ الحالة", "تحقق", "اختر السيناريو", "أجب النواقص", "أنشئ تاسكات محددة", "استخدم AI على تاسك واحد", "راجع وتحقق", "أصدر أو أجل"],
        details: [
          ["عقلية المطور", ["استخدم كبيري قبل الكود لتحديد ما يجب بناؤه، وأثناء الكود لتقييد AI، وبعد الكود لتسجيل الدليل والقبول.", "لو اتقفلت الجلسة، المفروض المطور أو AI التالي يكمل من `.kabeeri/` والدوكس وحالة التاسكات والداشبورد بدل ذاكرة الشات القديمة."]],
          ["المخرج الاحترافي", ["كل ميزة جادة يجب أن يكون لها مصدر ونطاق ومسار عمل ومعايير قبول وملفات متغيرة ودليل وتكلفة وحالة مراجعة وقرار مالك.", "هذا هو الفرق بين vibe coding عشوائي وvibe coding قابل للتكرار هندسيًا."]]
        ],
        checklist: ["يوجد `.kabeeri/` أو خطة اعتماد.", "تنظيم المستودع مفهوم.", "السيناريو الحالي محدد.", "نمط التسليم واضح.", "التاسك التالي محدد وقابل للاختبار."],
        commands: ["node bin/kvdf.js validate", "node bin/kvdf.js structure map", "node bin/kvdf.js dashboard state"]
      }
    }
  }
};

const arOverrides = {
  "start-here": ["ابدأ من هنا", "هذه خريطة الدخول لأي مطور يفتح فولدر كبيري ويريد أن يعرف ماذا يفعل بدون تخمين.", "ابدأ بتحديد السيناريو: تطبيق جديد، مشروع كبيري قائم، أو كود موجود لم يبنَ بكبيري. كل سيناريو له طريق آمن مختلف."],
  "install-profiles": ["التثبيت والبروفايلات", "هذه الصفحة تشرح تحميل كبيري من GitHub وتشغيله محليًا واختيار البروفايل المناسب.", "`lite` صغير للتجارب، و`standard` هو الاختيار الافتراضي، و`enterprise` للحوكمة الكاملة."],
  "ai-with-kabeeri": ["كيف يعمل AI داخل كبيري", "كبيري مصمم للمطور الذي يريد أن يتكلم مع الذكاء الاصطناعي طبيعيًا بينما يعمل AI داخل بيئة مشروع محكومة.", "المطور لا يحتاج أن يعيش داخل أوامر CLI. الأوامر هي المحرك المحلي الذي يستطيع المساعد أو الداشبورد أو VS Code تشغيله خلف الكواليس."],
  "capabilities": ["قدرات النظام", "هذه الصفحة هي نسخة الويب من مرجع قدرات كبيري. تشرح ماذا تملك كل قدرة ولماذا موجودة وأين يبحث المطور.", "عندما تكون تائهًا، هذه هي الخريطة. اختر القدرة المناسبة للمشكلة ثم افتح مصادرها وأوامرها."],
  "repository-layout": ["تنظيم المستودع", "يستخدم كبيري الآن تنظيمًا فعليًا قريبًا من لارافيل بجذور قليلة وواضحة.", "لا تبحث في كل الريبو أولًا. ابدأ من `src/` للكود، `knowledge/` للمعرفة، `packs/` للحزم، `integrations/` للتكاملات، `docs/` للتوثيق، `schemas/` للعقود، و`.kabeeri/` للحالة الحية."],
  "new-project": ["بدء تطبيق جديد", "استخدم هذا المسار عندما تريد بناء تطبيق جديد من فكرة أو طلب عميل أو وصف طبيعي.", "لا تقفز للكود مباشرة. اجعل كبيري يفهم نوع المنتج ونمط التسليم وحدود التطبيقات وتصميم البيانات واتجاه الواجهة وخطة التاسكات."],
  "existing-kabeeri-project": ["استكمال مشروع كبيري", "استخدم هذا المسار عندما يكون المشروع لديه `.kabeeri/` وتعود بعد انقطاع جلسة أو بعد عمل مطور آخر.", "مهمتك الأولى هي الاسترجاع: تحقق من الحالة، اقرأ الداشبورد، اعرف الجاهز والمحجوب، ثم أكمل من تاسك آمن."],
  "existing-non-kabeeri-project": ["اعتماد تطبيق قائم", "استخدم هذا المسار عندما يكون الكود موجودًا لكنه لم يبنَ بكبيري.", "لا تعيد تنظيم الكود فورًا. أولًا افهمه واربط تطبيقاته وفولدراته ومخاطره ونموذج بياناته ومناطق الميزات، ثم أدخل الحوكمة تدريجيًا."],
  "delivery-mode": ["اختيار Agile أو Structured", "يدعم كبيري نظامين: Agile وStructured. يساعد AI في الاقتراح، لكن القرار النهائي للمطور أو المالك.", "Agile مناسب للتغيير والتعلم بالتكرار. Structured مناسب للمتطلبات الثابتة والاعتمادات والتوثيق والتسليم المؤسسي."],
  "agile-delivery": ["التسليم الأجايل", "Agile يحول العمل إلى backlog وepics وstories وsprints ومراجعات ومعوقات وتحسين مستمر.", "استخدمه عندما تريد تقدمًا تكراريًا سريعًا مع بقاء عمل AI محكومًا وقابلًا للمراجعة."],
  "structured-delivery": ["التسليم المنظم", "Structured هو نظام Waterfall للمتطلبات والمراحل والمخرجات والتتبع والمخاطر وطلبات التغيير وبوابات المراحل.", "استخدمه عندما تحتاج خطة شركات كبيرة يمكن مراجعتها واعتمادها وتسليمها بثقة."],
  "questionnaire-engine": ["محرك الأسئلة", "محرك الأسئلة يسأل السؤال المناسب في الوقت المناسب حتى لا يضيع المطور وAI الوقت في تفاصيل غير مهمة.", "بدل فورم ضخم، يبدأ كبيري واسعًا ثم يكتشف نوع المنتج ويفعل المناطق المهمة ويسأل فقط فيما يؤثر على التخطيط والتنفيذ."],
  "product-blueprints": ["خرائط المنتجات", "خرائط المنتجات تجعل كبيري يفهم أنظمة السوق المتكررة حتى لا يبدأ AI من صفحة بيضاء.", "عندما تقول متجر أو CRM أو ERP أو POS أو أخبار أو حجز أو توصيل أو موبايل، يجب أن يعرف كبيري القنوات والموديولات والصفحات والجداول والمخاطر المتوقعة."],
  "data-design": ["تصميم البيانات", "تصميم البيانات يساعد AI والمطور في بناء قاعدة بيانات موثوقة من دورة العمل وليس من شكل الشاشة.", "ابدأ بالworkflow الحقيقي ثم حدد الجداول والعلاقات والقيود والحالات والتدقيق والمعاملات واللقطات والتقارير."],
  "ui-ux-advisor": ["مساعد تصميم الواجهات", "مساعد UI/UX يختار تجربة الواجهة المناسبة ومجموعات المكونات وقوالب الصفحات وقواعد الوصول وSEO/GEO حسب نوع التطبيق.", "واجهة CRM ليست مثل مدونة، ومتجر إلكتروني ليس مثل Dashboard داخلي. كبيري يساعد AI على اختيار النمط المناسب."],
  "vibe-first": ["مسار Vibe-first", "Vibe-first يسمح للمطور بالكلام الطبيعي بينما يحول كبيري النية إلى عمل منظم وقابل للمراجعة.", "المطور لا يجب أن يحفظ أوامر. يمكنه أن يطلب طبيعيًا، وكبيري يسجل الاقتراحات والتاسكات والالتقاطات والسياق تحت السطح."],
  "task-governance": ["حوكمة التاسكات", "حوكمة التاسكات هي قلب كبيري لتحويل الأفكار والإجابات والمشاكل والالتقاطات إلى عمل آمن قابل للتنفيذ.", "تاسك كبيري ليس todo عادي. هو مصدر ونطاق ومسار عمل ومسؤول ومراجع ومعايير قبول وملفات مسموحة وتكلفة ودليل."],
  "app-boundary": ["حوكمة حدود التطبيقات", "تحدد هل يمكن وضع أكثر من تطبيق داخل فولدر كبيري واحد بدون خلط منتجات غير مرتبطة.", "Laravel backend مع React storefront لنفس المتجر يمكن أن يكونا منتجًا واحدًا. لكن متجر ومنصة أخبار لعميل آخر لا يجب خلطهما."],
  "workstreams-scope": ["مسارات العمل والنطاق", "مسارات العمل ونطاق التنفيذ يحددان من يعمل أين وعلى أي تطبيق ولأي تاسك.", "هذا يمنع تداخل backend وfrontend وmobile وdatabase وQA وsecurity وdocs أو تمدد التعديل بلا قصد."],
  "prompt-packs": ["حزم البرومبت", "حزم البرومبت تعطي أدوات AI تعليمات واعية بالفريمورك المستخدم.", "تاسك Laravel لا يكتب مثل تاسك React. كل فريمورك يحتاج سياقًا وقواعد أمان مختلفة."],
  "dashboard-monitoring": ["الداشبورد الحي", "الداشبورد الحي هو عرض تشغيلي فوق حالة `.kabeeri/`.", "استخدمه لمعرفة الجاهز والمحجوب والمكلف والخطر والمقبول وغير المكتمل وجاهزية الإصدار دون قراءة كل الملفات."],
  "ai-cost-control": ["التحكم في تكلفة AI", "تحكم تكلفة AI يجعل إنفاق التوكنز واضحًا ومقصودًا ومربوطًا بقيمة التسليم.", "تتبع ما صُرف، ولماذا، ولأي تاسك، وهل خرج منه عمل مقبول، وهل كان يمكن تقليل السياق أو اختيار موديل أرخص."],
  "multi-ai-governance": ["حوكمة تعدد وكلاء AI", "تتحكم في الهويات والأدوار والجلسات واللوكس والتوكنز والميزانيات وتحقق المالك عند تعاون البشر ووكلاء AI.", "حتى لو كنت مطورًا واحدًا، يمكن لكبيري أن يعامل مساعدي البرمجة بالذكاء الاصطناعي ووكلاء IDE وأدوات الأتمتة كأطراف عمل لها نطاق وتدقيق."],
  "github-release": ["GitHub وبوابات الإصدار", "تساعد GitHub وRelease Gates على النشر أو المزامنة بعد جاهزية الحقيقة المحلية والسياسات والأمان والهجرة وقرارات المالك.", "GitHub سطح تعاون ونشر، لكنه لا يصبح مصدر الحقيقة الوحيد لحالة تسليم كبيري."],
  "practical-examples": ["سبعة تطبيقات عملية", "هذه الصفحة تعرض سبعة مسارات بناء عملية وتشرح كيف يستخدم المطور كبيري مع أي مساعد ذكاء اصطناعي من الفكرة إلى التسليم.", "استخدمها كقصص عمل بسيطة: قل لمساعد الذكاء الاصطناعي الهدف، ودع كبيري يختار الخريطة والأسئلة وتصميم البيانات والواجهة وحزم البرومبت والتاسكات والداشبورد."],
  "example-ecommerce": ["مثال: متجر إلكتروني", "هذا الدليل يشرح بناء متجر إلكتروني كامل بكبيري ومساعد ذكاء اصطناعي من الفكرة إلى التسليم.", "قل لمساعد الذكاء الاصطناعي: أريد بناء متجر إلكتروني كامل. كبيري لا يبدأ بالكود فورًا؛ يختار blueprint ثم الأسئلة ثم تصميم البيانات والواجهة ثم التاسكات."],
  "example-ai-team-ecommerce": ["مثال: 3 مطوري AI لبناء متجر", "هذه الصفحة تشرح كيف يقود قائد فريق واحد ثلاثة مطوري AI لبناء متجر إلكتروني واحد: باك إند، واجهة ويب، وتطبيق موبايل.", "الفكرة الصحيحة ليست أن يعمل الثلاثة عشوائيًا في نفس الملفات. كبيري يجعل كل AI له تطبيق ومسار عمل وتاسك وتوكن وقفل وتسليم واضح، ثم يجمع القائد النتائج عبر تاسكات تكامل."],
  "example-blog": ["مثال: مدونة شخصية", "هذا الدليل يشرح بناء مدونة شخصية احترافية مع SEO وتجربة قراءة قوية.", "قل لمساعد الذكاء الاصطناعي: أريد مدونة شخصية. كبيري يحدد هل هي static أو CMS أو newsletter أو paid content قبل الكود."],
  "example-wordpress-digital-agency": ["مثال: WordPress لشركة تسويق رقمي", "هذا الدليل يشرح بناء موقع WordPress لشركة تسويق رقمي مع 4 إضافات لإدارة العملاء وطلبات الخدمات والفواتير والحسابات.", "قل لمساعد الذكاء الاصطناعي: أريد موقع WordPress لشركة تسويق رقمي مع نظام داخلي بسيط. كبيري يفصل الموقع العام عن plugins الأعمال حتى لا يتحول المشروع إلى تعديلات عشوائية."],
  "example-dental-clinic": ["مثال: عيادة أسنان وحجوزات", "هذا الدليل يشرح بناء موقع ونظام حجز لعيادة أسنان مع لوحة إدارة وتذكيرات.", "قل لمساعد الذكاء الاصطناعي: أريد نظام عيادة أسنان بالحجوزات. كبيري يتعامل معه كنظام مواعيد وبيانات شخصية وليس CRUD عشوائي."],
  "example-crm": ["مثال: CRM احترافي", "هذا الدليل يشرح بناء CRM احترافي لإدارة العملاء والمبيعات والمتابعات والتقارير.", "قل لمساعد الذكاء الاصطناعي: أريد CRM احترافي. كبيري يخططه كتطبيق أعمال كثيف البيانات بصلاحيات وpipeline وتقارير."],
  "example-mobile-commerce": ["مثال: تطبيق موبايل للمتجر", "هذا الدليل يشرح بناء تطبيق موبايل مرتبط بالمتجر الإلكتروني.", "قل لمساعد الذكاء الاصطناعي: أريد تطبيق موبايل للمتجر. كبيري يربطه بنفس منتج المتجر ولا يعامله كتطبيق منفصل غير مرتبط."],
  "example-pos": ["مثال: POS سوبرماركت", "هذا الدليل يشرح بناء نظام POS احترافي لسوبرماركت مع مخزون وورديات وإيصالات.", "قل لمساعد الذكاء الاصطناعي: أريد POS سوبرماركت. كبيري يتعامل معه كنظام تشغيل مالي ومخزني حساس."],
  "troubleshooting": ["حل المشكلات", "حل مشكلات كبيري يبدأ من مصدر الحقيقة وليس التخمين.", "عندما يحدث خطأ اسأل: هل المشكلة في `.kabeeri/` أو الدوكس أو schemas أو المسارات المنقولة أو CLI أو الداشبورد أو كود التطبيق؟"]
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
  arTitle: "تطوير WordPress",
  lead: "كبيري يقدر يبني موقع WordPress من الصفر أو يعتمد موقع WordPress قائم، لكن من خلال خطة محكومة: تحليل، staging، backup، تاسكات، scaffold آمن، prompt pack، مراجعة، وتسليم.",
  beginner: "قل لمساعد الذكاء الاصطناعي طبيعيًا: أريد موقع WordPress شركة، مدونة، أخبار، حجز، أو WooCommerce. كبيري سيحول ذلك إلى خطة وأوامر وتاسكات بدون تعديل WordPress core.",
  sections: [
    ["موقع جديد", "كبيري يحدد نوع الموقع، blueprint المناسب، الصفحات، المحتوى، CPTs، taxonomies، القوائم، النماذج، إعدادات الإدارة، SEO/GEO، وطريقة التنفيذ: plugin أو theme أو child theme."],
    ["موقع قائم", "كبيري يبدأ بتحليل `wp-content` والـ plugins والـ themes وإشارات WooCommerce ومخاطر staging وbackup قبل أي تعديل."],
    ["حدود التنفيذ الآمن", "أي تخصيص يجب أن يعيش في custom plugin أو custom theme أو child theme. ممنوع تعديل `wp-admin` و`wp-includes` و`wp-config.php` والـ uploads عشوائيًا."],
    ["WooCommerce", "المتاجر تحتاج تاسكات صريحة للمنتجات، السلة، checkout، الدفع، الشحن، الضرائب، المخزون، حالات الطلب، المرتجعات، والإيميلات."],
    ["استخدام AI", "استخدم `kvdf prompt-pack compose wordpress --task <task-id>` حتى يحصل مساعد الذكاء الاصطناعي على قواعد WordPress الخاصة بالـ hooks وnonces وcapabilities وsanitization وescaping وREST routes وWooCommerce."]
  ],
  steps: ["صف الموقع", "حلل أو صنف", "أكد staging/backup", "اختر blueprint", "أنشئ خطة WordPress", "ولد تاسكات", "أنشئ scaffold آمن", "ركب WordPress prompt", "نفذ تاسك واحد", "اختبر وسلم"],
  details: [
    ["من الصفر", ["ابدأ بـ `kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new`.", "بعدها أنشئ التاسكات، scaffold عند الحاجة، prompt pack لكل تاسك، ثم نفذ وافحص وسلم."]],
    ["موقع قائم", ["ابدأ بـ `kvdf wordpress analyze --path existing-wordpress --staging --backup`.", "لو staging أو backup غير مؤكد، يسجل كبيري الخطر ويجب ألا ينفذ AI تغييرات واسعة قبل قرار المالك."]],
    ["متى لا نستخدم WordPress", ["لو المشروع SaaS معقد أو عمليات realtime أو منطق تجاري ثقيل غير معتمد على CMS، قد يقترح كبيري Laravel أو Next.js أو Django أو غيرها.", "WordPress أقوى في مواقع المحتوى والشركات والتحرير وWooCommerce والمشاريع التي تستفيد من CMS."]]
  ],
  checklist: ["نوع الموقع معروف.", "الموقع القائم لديه staging وbackup.", "WordPress core ممنوع تعديله.", "طريقة التنفيذ plugin أو theme أو child theme واضحة.", "التاسكات لها acceptance criteria.", "WordPress prompt pack مركب لكل تاسك.", "الأمان وSEO/GEO والوصول والأداء والتسليم تمت مراجعتهم."]
};
docs.ar.pages["wordpress-plugins"] = {
  ...docs.en.pages["wordpress-plugins"],
  arTitle: "تطوير إضافات WordPress",
  lead: "كبيري يقدر يخطط وينشئ إضافات WordPress كنظام برمجي محكوم له معمارية وأمان وتاسكات وحدود ملفات ومعايير قبول وتسليم.",
  beginner: "قل لمساعد الذكاء الاصطناعي الإضافة التي تريدها. كبيري يحول الفكرة إلى plugin plan، وينشئ فولدر آمن داخل `wp-content/plugins`، ويولد تاسكات محددة النطاق، ثم يعطي الذكاء الاصطناعي قواعد WordPress قبل كتابة الكود.",
  sections: [
    ["متى نستخدم plugin", "استخدم plugin للسلوك البرمجي الذي يجب أن يعيش بعيدًا عن الثيم: حجوزات، WooCommerce extensions، CPTs، تكاملات، إعدادات إدارة، REST APIs، shortcodes، blocks، وموديولات قابلة لإعادة الاستخدام."],
    ["خطة الإضافة", "الخطة تسجل اسم الإضافة والـ slug والنوع والمسار والمعمارية وقوالب التاسكات وقواعد الأمان والأوامر المقترحة وقائمة القبول."],
    ["الهيكل المولد", "كبيري ينشئ هيكل محافظ فيه plugin header وloader وadmin class وpublic class وassets وlanguages وuninstall policy وREADME."],
    ["نموذج الأمان", "تطوير الإضافات يحتاج ABSPATH guards وcapabilities وnonces وsanitization وescaping وREST permission callbacks وuninstall آمن ومنع أسرار الإنتاج."],
    ["مسار AI", "بعد وجود الخطة والتاسكات، يتم استخدام WordPress prompt pack لكل تاسك حتى يعمل مساعد الذكاء الاصطناعي داخل فولدر الإضافة ويتجنب ملفات WordPress core."]
  ],
  steps: ["وصف الإضافة", "إنشاء plugin plan", "إنشاء scaffold", "إنشاء تاسكات plugin", "تركيب prompt pack", "تنفيذ تاسك واحد", "تشغيل الفحوصات", "تجهيز التسليم"],
  details: [
    ["إضافة حجوزات", ["استخدم `--type booking` للمواعيد والعيادات والحجوزات والتقويمات والإتاحة وshortcodes العامة.", "التاسكات تغطي نموذج البيانات وإعدادات الإدارة والفورم العام والتحقق والتنبيهات والتسليم."]],
    ["إضافة WooCommerce", ["استخدم `--type woocommerce` للـ checkout والمنتجات والطلبات والمخزون والمرتجعات والشحن والضرائب والدفع والإيميلات.", "أي تغيير في الدفع أو دورة حياة الطلب يحتاج sandbox evidence ومراجعة صريحة."]],
    ["إضافة تكامل", ["استخدم `--type integration` للـ APIs ومزامنة CRM/ERP والـ webhooks والبوابات الخارجية وإعادة المحاولة.", "التاسكات تغطي تخزين credentials والتحقق من webhooks واللوجز وإعادة المحاولة وحالات الفشل."]],
    ["إضافة CPT", ["استخدم `--type cpt` للأدلة والقوائم والبورتفوليو والمحتوى التحريري والتصنيفات وتدفقات إدارة المحتوى.", "التاسكات تغطي labels وcapabilities وrewrites وأعمدة الإدارة وملاحظات migration."]]
  ],
  checklist: ["الإضافة تعيش فقط داخل `wp-content/plugins/<slug>/`.", "خطة الإضافة والـ scaffold موجودان.", "التاسكات تحتوي allowed وforbidden file scopes.", "صفحات الإدارة تستخدم capabilities وsettings validation.", "الفورمات والتغييرات تستخدم nonces.", "المدخلات sanitized والمخرجات escaped.", "REST routes لديها permission callbacks.", "سلوك uninstall واضح.", "التسليم يشمل activation وrollback والملفات المتغيرة والاختبارات."]
};
docs.ar.pages["install-profiles"] = {
  ...docs.en.pages["install-profiles"],
  arTitle: "التثبيت والبروفايلات",
  lead: "هذه الصفحة تشرح تحميل كبيري من GitHub وتشغيله محليًا، ومتى تستخدم `kvdf` مباشرة، وكيف تختار البروفايل المناسب: `lite` أو `standard` أو `enterprise`.",
  beginner: "`lite` هو البداية الصغيرة، و`standard` هو الاختيار الموصى به لمعظم المشاريع، و`enterprise` هو الحوكمة الكاملة.",
  sections: [
    ["التثبيت من GitHub", "اعمل clone للريبو، ثبت الاعتمادات، شغل validation، ثم استخدم `npm run kvdf -- ...` إلى أن تربط أو تثبت أمر `kvdf`."],
    ["متى يعمل `kvdf` مباشرة", "بعد local linking أو تثبيت الحزمة، استخدم `kvdf` مباشرة في العمل اليومي. أما `node bin/kvdf.js` فهو fallback أثناء تطوير كبيري نفسه من السورس."],
    ["بروفايل `lite`", "أصغر إعداد عملي. مناسب للتجارب، النماذج السريعة، المواقع البسيطة، وبداية اكتشاف المنتج عندما لا تريد حوكمة ثقيلة."],
    ["بروفايل `standard`", "الاختيار الافتراضي الموصى به. مناسب للمشاريع الحقيقية والعملاء والتطبيقات العادية والذكاء الاصطناعي والداشبورد والتاسكات وPrompt Packs."],
    ["بروفايل `enterprise`", "الإعداد الكامل. مناسب للأنظمة الكبيرة والفرق والعمل المنظم والحوكمة متعددة المطورين وبوابات الإصدار والتتبع الأقوى."]
  ],
  steps: ["Clone من GitHub", "تثبيت الاعتمادات", "تشغيل validation", "اختيار profile", "إنشاء مشروع", "فتح المشروع", "تشغيل الداشبورد", "بدء العمل مع AI"],
  details: [
    ["إعداد GitHub", ["استخدم `git clone <repo-url>` لتحميل كبيري، ثم شغل `npm install` داخل الريبو.", "شغل `npm run kvdf -- --help` و`npm run kvdf -- validate` للتأكد أن النسخة سليمة قبل إنشاء المشاريع."]],
    ["أول مشروع موصى به", ["لمعظم المطورين ابدأ بـ `standard`: `kvdf create --profile standard --output my-project`.", "`lite` مناسب للحد الأدنى. `enterprise` مناسب عندما تكون الحوكمة والفريق والإصدار والتدقيق مهمة من اليوم الأول."]]
  ],
  checklist: ["تم تحميل الريبو من GitHub.", "تم تثبيت الاعتمادات.", "`npm run kvdf -- validate` ناجح.", "تم اختيار البروفايل بوعي.", "تم إنشاء مشروع جديد أو تهيئة الفولدر الحالي.", "يتم استخدام `kvdf` مباشرة بعد الربط أو التثبيت."]
};

const arDeepOverrides = {
  "ai-with-kabeeri": {
    sections: [
      ["تجربة المطور", "المطور يتكلم طبيعيًا، وكبيري يحول الكلام إلى حالة منظمة: blueprint وأسئلة وتاسكات وحزم سياق وبرومبت وداشبورد وتحقق."],
      ["دور AI", "مساعد الذكاء الاصطناعي أو أي مساعد AI يكتب الكود ويساعد في التصحيح، لكنه يعمل داخل تاسك محدد ومعايير قبول ونطاق ملفات."],
      ["دور CLI", "CLI ليس عبئًا على المطور؛ هو المحرك المحلي الموثوق الذي يمكن للمساعد أو الواجهة تشغيله."],
      ["دور الداشبورد", "الداشبورد يعرض الحقيقة من `.kabeeri/` حتى يعرف المطور أين وصل المشروع."],
      ["قيمة كبيري", "يقلل نسيان السياق، وتعديل AI العريض، وغموض التاسكات، وتكرار البرومبت، والتكلفة غير المتتبعة، والنشر غير الآمن."]
    ],
    details: [
      ["ماذا يفعل المطور فعليًا", ["يفتح فولدر المشروع، يخبر المساعد بما يريد، يراجع الخطة والتاسكات، ثم يترك التنفيذ يتم تاسكًا تلو الآخر.", "عندما يلزم أمر، يمكن للمساعد تشغيله. المطور يحتاج فهم الرحلة لا حفظ الأوامر."]],
      ["ما الذي يجب على AI احترامه", ["لا يعدل ملفات غير مرتبطة، لا يتجاوز validation، لا يخترع متطلبات، ولا ينشر بلا gates.", "يستخدم خرائط المنتجات والأسئلة وتصميم البيانات وUI/UX وحزم البرومبت قبل التنفيذ."]]
    ],
    checklist: ["المطور يفهم أن AI شريك كتابة الكود.", "كبيري هو بيئة التحكم.", "CLI محرك وليس عبئًا.", "الداشبورد مراقبة.", "التاسكات والتحقق مطلوبان."]
  },
  "start-here": {
    sections: [
      ["سيناريو تطبيق جديد", "ابدأ من الخريطة المنتجية ثم حدود التطبيقات ثم نمط التسليم ثم الأسئلة ثم تصميم البيانات والواجهة ثم التاسكات."],
      ["سيناريو مشروع كبيري قائم", "تحقق من `.kabeeri/`، اقرأ الداشبورد، افتح التاسكات الجاهزة، راجع الالتقاطات واللوكس والتوكنز، ثم أكمل من نقطة آمنة."],
      ["سيناريو كود قائم بدون كبيري", "لا تعيد التنظيم فورًا. افهم الفريمورك الحالي، اربط التطبيقات والموديولات والمخاطر، ثم أدخل الحوكمة تدريجيًا."],
      ["سيناريو طلب غامض", "استخدم Vibe-first لتحويل الطلب إلى اقتراحات تاسكات قابلة للمراجعة بدل تنفيذ واسع وخطر."],
      ["سيناريو إصدار أو GitHub", "لا تنشر ولا تكتب على GitHub إلا بعد validation وسياسات وأمان وهجرة وموافقة مالك."]
    ],
    details: [
      ["أول عشر دقائق", ["شغل التحقق، اقرأ ملف القدرات، افهم تنظيم الريبو، وافتح حالة الداشبورد.", "لا تبدأ تعديل كود قبل معرفة التاسك والنطاق ومعايير القبول."]],
      ["تقليل الوقت والتوكنز", ["خريطة الفولدرات تمنع البحث العشوائي، وخرائط المنتجات وتصميم البيانات وحزم البرومبت تقلل تكرار الشرح.", "الهدف أن يستكمل AI من مصدر حقيقة مختصر لا من ذاكرة شات طويلة."]]
    ],
    checklist: ["السيناريو محدد.", "التحقق ناجح أو البلوكرز معروفة.", "التاسك التالي له مصدر وقبول.", "حزمة البرومبت تطابق الفريمورك.", "أي عمل واسع له خطة أو capture."]
  },
  "capabilities": {
    sections: [
      ["كيف تقرأ الجدول", "كل صف يمثل قدرة داخل كبيري: ماذا تفعل، أين تعيش، وكيف تساعد المطور أو AI."],
      ["ما معنى قدرة حقيقية", "القدرة المفيدة لها توثيق وتنفيذ أو حالة runtime أو تحقق، وليست مجرد فكرة مكتوبة."],
      ["كيف ترتبط القدرات", "خرائط المنتجات تغذي الأسئلة، والأسئلة تغذي التاسكات، وتصميم البيانات وUI/UX يحسنان التاسكات، وحزم البرومبت توجه التنفيذ."],
      ["متى تضيف قدرة", "أضف قدرة جديدة فقط لو لها مسؤولية واضحة وليست تكرارًا لقدرة موجودة."],
      ["كيف تحافظ عليها", "أي تغيير في القدرة يجب أن ينعكس في الدوكس والتنفيذ والاختبارات والداشبورد إن لزم."]
    ],
    details: [
      ["استخدام المطور", ["افتح هذه الصفحة عندما لا تعرف أين تبحث.", "اختر القدرة الأقرب للمشكلة ثم افتح ملفات المصدر المذكورة في الجدول."]],
      ["استخدام AI", ["أعط AI اسم القدرة ومسارها قبل الطلب.", "هذا يقلل البحث الواسع ويمنع تعديل مكان خاطئ."]]
    ],
    checklist: ["القدرة موثقة.", "لها تنفيذ أو runtime عند الحاجة.", "لها علاقة واضحة بالتاسكات أو الداشبورد أو AI.", "موجودة في مرجع القدرات."]
  },
  "repository-layout": {
    sections: [
      ["`src/`", "كود التنفيذ الحقيقي ومحرك CLI والأوامر والتحقق وبناة الحالة."],
      ["`knowledge/`", "المعرفة الحاكمة: governance وdelivery وquestionnaires وdata design وUI/UX وVibe UX."],
      ["`packs/`", "حزم قابلة للتصدير: prompt packs وgenerators وtemplates وexamples."],
      ["`integrations/`", "تكاملات dashboard وGitHub وVS Code وmulti-AI وplatform."],
      ["`.kabeeri/`", "الحالة الحية للمشروع: تاسكات، سياسات، تقارير، تكلفة، داشبورد، تدقيق."]
    ],
    details: [
      ["المسارات القديمة", ["المسارات القديمة مثل `prompt_packs/` و`standard_systems/` تعمل كـ aliases للتوافق.", "لا تنشئ فولدرات قديمة جديدة؛ استخدم التنظيم الفعلي الجديد."]],
      ["قاعدة AI", ["اقرأ `REPOSITORY_FOLDERING_MAP.json` قبل البحث الواسع.", "هذا يقلل التوكنز ويمنع التشتت."]]
    ],
    checklist: ["لا يوجد top-level folder جديد بلا سبب.", "المعرفة في `knowledge/`.", "الحزم في `packs/`.", "التكاملات في `integrations/`.", "الحالة الحية في `.kabeeri/`."]
  },
  "new-project": {
    sections: [
      ["أنشئ أو افتح فولدر كبيري", "ابدأ داخل workspace كبيري. استخدم `init` للفولدر القائم أو `create` لبداية مولدة."],
      ["فعل المراقبة", "شغل `dashboard generate` أو `dashboard serve` حتى ترى الحالة من البداية."],
      ["استخدم Vibe-first عبر المساعد", "قل للمساعد ما تريد باللغة العادية، وهو يستخدم Vibe-first وCLI تحت السطح."],
      ["تحقق من ملفات كبيري", "شغل validation قبل التخطيط وقبل الإصدار."],
      ["تحقق من المالك", "افحص أو أنشئ Owner عندما يكون القبول النهائي مطلوبًا."],
      ["ابدأ نظام الأسئلة", "استخدم questionnaire plan لاكتشاف المنتج والباك إند والفرونت إند والبيانات والواجهة والمخاطر."],
      ["أكمل التطوير", "استخدم blueprint وdata design وUI/UX وprompt packs والتاسكات والداشبورد للتنفيذ خطوة بخطوة."]
    ],
    details: [
      ["مثال متجر إلكتروني", ["Laravel backend وReact storefront يعتبران تطبيقين مرتبطين داخل منتج واحد.", "الخريطة تفعل commerce وinventory وpayments وshipping وadmin وSEO وsecurity والاختبارات."]],
      ["الناتج الجيد", ["قائمة apps وموديولات وجداول وصفحات APIs ومخاطر وتاسكات أولى.", "أول تاسكات تكون صغيرة بما يكفي لجلسة AI واحدة ومراجعة واحدة."]]
    ],
    checklist: ["فولدر كبيري موجود.", "الداشبورد يعمل.", "Vibe-first متاح عبر المساعد.", "validation ناجح.", "Owner واضح.", "الأسئلة بدأت.", "التطوير مستمر بتاسكات صغيرة."]
  },
  "existing-kabeeri-project": {
    sections: [
      ["تحقق أولًا", "اكتشف ملفات JSON المكسورة، schemas الناقصة، اللوكس، التوكنز، والسياسات قبل التنفيذ."],
      ["اقرأ الداشبورد", "اعرف الجاهز والمحجوب والتكلفة والحالة التجارية والتقنية."],
      ["راجع الالتقاطات", "لو حدث عمل خارج التدفق المثالي، اربطه بتاسك أو اقتراح."],
      ["أكمل من تاسك جاهز", "لا تبدأ من ذاكرة الشات، ابدأ من مصدر الحقيقة."],
      ["أغلق الحلقة", "سجل الدليل والمراجعة وتحقق المالك وأغلق التوكن أو اللوكس."]
    ],
    details: [
      ["استرجاع الجلسة", ["استخدم context briefs والداشبورد كنقطة رجوع.", "لو الجلسة انتهت فجأة، نفذ capture قبل أي تعديل جديد."]],
      ["استرجاع الفريق", ["افحص workstreams واللوكس والتوكنز قبل التعديل.", "حتى المطور الواحد يستفيد لأن النظام يحميه من نسيان السياق."]]
    ],
    checklist: ["validation ناجح.", "لا يوجد lock conflict.", "التاسك التالي ready.", "التغييرات غير المتتبعة captured.", "الدليل والتكلفة مسجلان."]
  },
  "existing-non-kabeeri-project": {
    sections: [
      ["لا تكسر البنية", "احترم تنظيم Laravel أو Next.js أو Django أو WordPress أو أي فريمورك قائم."],
      ["ضعه داخل فولدر كبيري", "يمكن أن يكون كود التطبيق داخل فولدر كبيري أو يكون فولدر التطبيق نفسه هو workspace كبيري بعد `init`."],
      ["حلل المشروع", "استخدم `project analyze --path <folder>` لاكتشاف الفريمورك والتطبيقات والمخاطر ومسارات العمل."],
      ["أنشئ حالة اعتماد", "سجل هوية المشروع والتطبيقات والموديولات والمخاطر والحالة الحالية."],
      ["اربط الكود بالقدرات", "حدد auth وusers وdatabase وAPIs وfrontend وadmin وpayments وtests وsecurity."],
      ["وثق الموجود", "استخدم ADR وpost-work capture لحفظ قرارات حالية قبل التغيير."],
      ["ابدأ بتاسكات آمنة", "ابدأ بالتوثيق والتحقق والاختبارات والفهم قبل الميزات الكبيرة."]
    ],
    details: [
      ["أنواع الاعتماد", ["مشروع كبيري قائم: استكمال من الحالة.", "كود قائم بدون كبيري: بناء حالة حوله تدريجيًا."]],
      ["أول تاسكات آمنة", ["README وسياق، map للتطبيقات، فحص اختبارات، توثيق قاعدة البيانات، security scan.", "التغييرات الكبيرة تأتي بعد الفهم."]]
    ],
    checklist: ["بنية الفريمورك محفوظة.", "تم تشغيل project analyze.", "apps وworkstreams mapped.", "المخاطر مسجلة.", "missing answers موجودة.", "أول تاسكات اعتماد لا rewrite."]
  },
  "delivery-mode": {
    sections: [
      ["استخدم Agile عندما", "النطاق متغير وتحتاج backlog وstories وsprints ومراجعات."],
      ["استخدم Structured عندما", "المتطلبات والاعتمادات والتوثيق والتتبع أهم من سرعة الاسبرنت."],
      ["استخدم الاثنين بحذر", "يمكن أن تحتوي مرحلة Structured على تنفيذ Agile بشرط تسجيل من يملك القرار."],
      ["دع كبيري يقترح", "الاقتراح يعتمد على الغموض والمخاطر وحجم الفريق والعميل والتوثيق المطلوب."],
      ["سجل القرار", "لا تترك نمط العمل ضمنيًا؛ يجب أن يظهر في الحالة والداشبورد."]
    ],
    details: [
      ["أمثلة", ["SaaS MVP غالبًا Agile.", "ERP حكومي بمتطلبات موقعة غالبًا Structured."]],
      ["منع الخلط", ["وجود تاسكات لا يعني Agile.", "وجود مستندات لا يعني Structured."]]
    ],
    checklist: ["التوصية موجودة.", "قرار المالك مسجل.", "الداشبورد يطابق النمط.", "التاسكات أو المراحل تتبع القرار."]
  },
  "agile-delivery": {
    sections: [
      ["Backlog", "يجمع العمل حسب القيمة والمصدر والأولوية والاعتماديات."],
      ["Epics وStories", "تقسيم الأهداف إلى شرائح قابلة للاختبار."],
      ["Sprint Planning", "اختيار stories جاهزة حسب السعة والمخاطر والتكلفة."],
      ["Sprint Review", "تسجيل المقبول وإعادة العمل والدليل وملاحظات المالك."],
      ["Retrospective", "تحسين العملية وتقليل الهدر والمعوقات."]
    ],
    details: [
      ["Scrum Master قوي", ["كبيري يوضح العمل غير الجاهز والمعوقات ولا يسمح بتقدم وهمي.", "الهدف تسليم موثوق وليس طقوسًا."]],
      ["Agile مع AI", ["كل story يمكن أن تحمل تكلفة AI وحزمة برومبت ومسار عمل ودليل قبول.", "هذا يجعل جودة الاسبرنت وتكلفته قابلة للقياس."]]
    ],
    checklist: ["backlog موجود.", "stories لها قبول.", "السعة واقعية.", "المعوقات مسجلة.", "المراجعة تفرق المقبول عن rework."]
  },
  "structured-delivery": {
    sections: [
      ["Requirements", "ماذا سيبنى ولماذا ومن طلبه وكيف يقبل."],
      ["Phases", "تقسيم المتطلبات المعتمدة إلى مراحل بمخرجات وبوابات."],
      ["Traceability", "ربط المتطلبات بالتاسكات والاختبارات والقرارات والقبول."],
      ["Change Control", "أي تغيير نطاق يصبح طلب تغيير له أثر وموافقة."],
      ["Phase Gates", "منع الانتقال إذا المتطلبات أو الأدلة أو المخاطر ناقصة."]
    ],
    details: [
      ["سلوك شركات كبيرة", ["كل مرحلة تجيب: ما الداخل؟ ما الخارج؟ من وافق؟ ما الدليل؟ ما المخاطر؟", "هذا مهم للتسليم المؤسسي."]],
      ["Structured مع AI", ["AI ينفذ لكن لا يغير المتطلبات المعتمدة بصمت.", "الاكتشاف الجديد يتحول إلى change request."]]
    ],
    checklist: ["متطلبات معتمدة.", "مراحل واضحة.", "traceability متصلة.", "مخاطر ظاهرة.", "change requests محكومة."]
  },
  "questionnaire-engine": {
    sections: [
      ["أسئلة تكيفية", "الأسئلة تتغير حسب نوع المنتج والفريمورك والبيانات والواجهة والمخاطر."],
      ["Coverage Matrix", "يعرض المجاب والناقص والمجهول والمؤجل."],
      ["Missing Answers", "يحول الغموض إلى follow-ups أو تاسكات."],
      ["Task Generation", "يولد تاسكات لها provenance من السؤال والإجابة."],
      ["فائدة AI", "يعطي AI سياقًا مختصرًا بدل إعادة السؤال في كل جلسة."]
    ],
    details: [
      ["السؤال الجيد", ["السؤال الجيد يغير التخطيط أو البيانات أو الواجهة أو الأمان أو القبول.", "السؤال السيئ يجمع تفاصيل لا تؤثر."]],
      ["أمثلة", ["في ecommerce اسأل عن المنتجات والدفع والشحن والمرتجعات.", "في news اسأل عن التحرير والعاجل والمصادر والإعلانات وSEO."]]
    ],
    checklist: ["الأسئلة تناسب نوع المنتج.", "المجهول واضح.", "النواقص لها إجراء.", "التاسكات لها مصدر."]
  },
  "product-blueprints": {
    sections: [
      ["Core + Module + Channel", "كل منتج يتكون من نواة مشتركة وموديولات أعمال وقنوات استخدام."],
      ["أنظمة تجارية", "POS وERP وCRM ومخزون ومحاسبة ومتاجر وماركت بليس وتوصيل وحجز ومطاعم وHR ودعم فني."],
      ["أنظمة محتوى", "مدونة وأخبار ومجلة وموقع شركة ومركز معرفة وتوثيق ونشرة ومحتوى مدفوع."],
      ["تطبيقات موبايل", "تطبيق عميل ومندوب وسائق وموظف وأخبار وحجز وولاء وتعليم."],
      ["الناتج التخطيطي", "موديولات وجداول وصفحات وAPIs وتكاملات ومخاطر ومسارات عمل مقترحة."]
    ],
    details: [
      ["لماذا تقلل الأخطاء", ["AI قد ينسى المرتجعات في المتجر أو offline في POS أو workflow التحرير في الأخبار.", "الخرائط تحفظ معرفة السوق المتكررة داخل كبيري."]],
      ["كيف توسعها", ["أضف نوع منتج جديد فقط لو له موديولات أو جداول أو صفحات أو مخاطر مختلفة.", "اربطه بالأسئلة وتصميم البيانات وUI/UX وحزم البرومبت."]]
    ],
    checklist: ["نوع المنتج محدد.", "القنوات معروفة.", "الموديولات مقبولة أو مؤجلة.", "مناطق قاعدة البيانات محددة.", "المخاطر ظاهرة."]
  },
  "data-design": {
    sections: [
      ["صمم من دورة العمل", "لا تصمم الجداول من أسماء الصفحات؛ صمم من order وpayment وshipment وreturn وapproval."],
      ["Core + Modules", "افصل جداول النواة عن commerce وinventory وaccounting وCMS وmobile وbooking وغيرها."],
      ["سلامة البيانات", "استخدم primary keys وforeign keys وconstraints وحالات وتاريخ وتدقيق ومهاجرات."],
      ["السلامة التشغيلية", "استخدم transactions وidempotency وconcurrency وoutbox وsnapshots وقواعد الحذف."],
      ["الأداء", "خطط للفهارس والpagination والبحث وsummary tables وread models والأرشفة."]
    ],
    details: [
      ["أمثلة", ["في ecommerce لا تخزن order items كـ JSON لو تحتاج تقارير ومرتجعات جزئية.", "في inventory لا تجعل المخزون رقمًا فقط؛ استخدم stock_movements وstock_balances."]],
      ["أثره على AI", ["تاسك جاهز لتصميم البيانات يحدد entity وrelationship وmigration وvalidation وtransaction والاختبارات.", "هذا يمنع CRUD سطحي لا يتحمل العمل الحقيقي."]]
    ],
    checklist: ["workflow مكتوب.", "الجداول مجمعة حسب الموديول.", "العلاقات والقيود واضحة.", "الأموال ليست float.", "snapshots والتدقيق معروفان.", "مخاطر migration محسوبة."]
  },
  "ui-ux-advisor": {
    sections: [
      ["نوع التجربة", "موقع عام أو web app أو admin أو mobile أو POS أو customer portal أو news أو docs."],
      ["استراتيجية المكونات", "اختيار tables وfilters وdrawers وmodals وcards وforms وtabs وbreadcrumbs وcheckout وarticle layouts."],
      ["ربط التصميم بالحوكمة", "مصادر التصميم تتحول إلى specs وpage specs وcomponent contracts قبل التنفيذ."],
      ["SEO/GEO", "الصفحات العامة تحتاج HTML دلالي وعناوين وbreadcrumbs وstructured data وأداء ومحتوى مقروء."],
      ["إرشاد الفريمورك", "اختيار Next.js أو Astro أو React أو Vue أو Angular أو Expo أو Flutter حسب الحاجة."]
    ],
    details: [
      ["تصميم الداشبورد", ["الأدوات التشغيلية يجب أن تكون هادئة وكثيفة وقابلة للمسح السريع.", "الجداول والفلاتر والحالات أهم من hero تسويقي."]],
      ["تصميم المواقع العامة", ["المواقع العامة تحتاج بنية دلالية وسرعة ومحتوى واضح وسكيما وروابط داخلية.", "الجمال البصري مهم لكن وضوح المحتوى والأداء جزء من التصميم."]]
    ],
    checklist: ["نوع الواجهة معروف.", "قوالب الصفحات موجودة.", "المكونات محددة.", "responsive states مكتوبة.", "accessibility وSEO/GEO مذكوران عند الحاجة."]
  },
  "vibe-first": {
    sections: [
      ["تصنيف النية", "يفهم هل الطلب إنشاء تاسك أو سؤال أو فحص أو capture أو مراجعة أو إصدار."],
      ["كشف الغموض", "يمنع تنفيذ طلبات واسعة مثل حسن كل شيء بدون أسئلة أو تقسيم."],
      ["كروت التاسكات", "ينتج كارت مراجعة فيه عنوان وملخص ونطاق وملفات مسموحة ومخاطر وقبول."],
      ["Post-work capture", "لو حدث عمل خارج التدفق، يلتقط الملفات ويربطها بتاسك أو اقتراح."],
      ["Context briefs", "ينتج ملخصات صغيرة لاستكمال الجلسة بتوكنز أقل."]
    ],
    details: [
      ["لماذا يفيد AI assistant", ["يقلل إعادة الشرح ويعطي حدودًا للتنفيذ.", "يمنع تحويل الكلام الطبيعي إلى تصريح بتعديل كل شيء."]],
      ["مع أو بدون command", ["الأمر CLI مجرد سطح تشغيل.", "الشات والداشبورد وVS Code يمكن أن يستخدموا نفس المحرك دون أن يحفظ المطور الأمر."]]
    ],
    checklist: ["النية مصنفة.", "الغموض لا ينفذ مباشرة.", "الكارت قابل للمراجعة.", "capture يربط العمل غير المتتبع.", "context brief موجود."]
  },
  "task-governance": {
    sections: [
      ["المصدر", "كل تاسك يأتي من إجابة أو blueprint أو bug أو design spec أو capture أو GitHub issue أو قرار مالك."],
      ["Definition of Ready", "التاسك غير جاهز إذا النطاق أو القبول أو المسار أو الاعتماديات مجهولة."],
      ["التنفيذ", "يبدأ بإسناد ونطاق وتوكن وربما lock وجلسة AI."],
      ["المراجعة", "تفحص الملفات والدليل والاختبارات ومعايير القبول والسياسات."],
      ["التحقق", "قرار المالك يغلق الحلقة بالقبول أو الرفض."]
    ],
    details: [
      ["لماذا تمنع الفوضى", ["AI قد يتمدد خارج النطاق.", "التاسك يعطي كل جلسة حدودًا وهدف قبول."]],
      ["Live JSON", ["حالة task tracker يمكن قراءتها من الداشبورد وVS Code.", "هذا يقلل تعديل ملفات توثيق بعد كل تاسك."]]
    ],
    checklist: ["التاسك له مصدر.", "القبول قابل للاختبار.", "الملفات المسموحة واضحة.", "الدليل مسجل.", "قرار المالك مسجل عند الحاجة."]
  },
  "app-boundary": {
    sections: [
      ["المسموح", "تطبيقات مرتبطة في نفس المنتج مثل backend وstorefront وadmin وmobile وworker وvendor portal."],
      ["الممنوع", "منتجات أو عملاء أو دورات إصدار مستقلة يجب فصلها في فولدرات كبيري مختلفة."],
      ["تعريف الحدود", "كل app له path وtype وproduct وworkstreams وstatus."],
      ["عمل عابر للتطبيقات", "التاسك العابر يجب أن يذكر كل app وكل workstream متأثر."],
      ["قرار الفصل", "لو الشك كبير، افصل المنتجات بدل تلويث الحالة والتكلفة والداشبورد."]
    ],
    details: [
      ["قاعدة عملية", ["backend وfrontend لنفس المتجر منتج واحد.", "متجر ومنصة أخبار لعميل آخر منتجان منفصلان."]],
      ["لماذا مهم", ["الخلط يفسد التاسكات والتكلفة والإصدارات والسياق.", "الحدود تجعل workspace متماسكًا."]]
    ],
    checklist: ["كل app له product.", "كل app له path.", "العلاقة واضحة.", "تاسكات integration معلّمة."]
  },
  "workstreams-scope": {
    sections: [
      ["Workstreams", "مسؤوليات مثل backend وfrontend وadmin وmobile وdatabase وQA وsecurity وdocs."],
      ["Task tokens", "تضيق الصلاحية إلى ملفات ومسارات وتطبيقات ومسارات عمل محددة."],
      ["Locks", "تمنع تداخل التعديل بين أكثر من مطور أو AI."],
      ["Execution scope", "النطاق النهائي يأتي من task وapp وworkstream وtoken وأي broad approval."],
      ["Validation", "يتأكد أن الملفات والجلسات لا تخرج عن الحدود."]
    ],
    details: [
      ["مطور واحد", ["حتى solo يستفيد لأنه يقلل التعديلات العريضة ونسيان السياق.", "يمكن أن يكون أخف لكنه لا يلغي النموذج."]],
      ["فريق", ["الفريق يحتاج ملكية ولوكس وتوكنز قبل العمل المتوازي.", "وكلاء AI يعاملون كأطراف لها نطاقات."]]
    ],
    checklist: ["workstream موجود.", "allowed files مشتقة.", "token ليس أوسع من اللازم.", "lock conflicts مفحوصة.", "الجلسة داخل النطاق."]
  },
  "prompt-packs": {
    sections: [
      ["حزم الفريموركات", "Laravel وReact وVue وAngular وNext.js وAstro وDjango وFastAPI وNestJS وWordPress وExpo وغيرها."],
      ["Common layer", "قواعد مشتركة للنطاق والمراجعة والدليل وAI-run والسلامة."],
      ["Export", "يمكن تصدير الحزم إلى مشروع العميل."],
      ["Composition", "البرومبت المركب يجمع التاسك والنطاق والقبول وقواعد الفريمورك."],
      ["Review", "الحزمة توجه AI لكنها لا تلغي الاختبار والمراجعة."]
    ],
    details: [
      ["تقليل التوكنز", ["الحزمة تمنع شرح قواعد الفريمورك من الصفر كل مرة.", "مع context briefs تصبح الجلسات أقصر وأكثر اتساقًا."]],
      ["قاعدة الجودة", ["البرومبت لا يعني قبول المخرج.", "المخرج يحتاج دليل واختبارات وقرار."]]
    ],
    checklist: ["الحزمة تطابق stack.", "common layer مضاف.", "النطاق موجود.", "القبول موجود.", "AI run مسجل."]
  },
  "dashboard-monitoring": {
    sections: [
      ["Task tracker", "يعرض الجاهزية والحالة والمسؤول والقبول والمراجعة والتحقق."],
      ["Business state", "يعرض جاهزية الميزات والرحلات والديمو وقيمة المنتج."],
      ["Technical state", "يعرض apps وworkstreams وchecks وpolicies وsecurity وmigrations."],
      ["Cost and AI", "يعرض الاستخدام والميزانية والهدر والمقبول والمرفوض."],
      ["Multi-workspace", "يمكن متابعة أكثر من فولدر كبيري لمطور يعمل على أكثر من مشروع."]
    ],
    details: [
      ["Live JSON", ["الحالة المهمة تحت `.kabeeri/dashboard/` و`.kabeeri/reports/`.", "كل السطوح تقرأ نفس الحقيقة."]],
      ["UX الداشبورد", ["يجب أن يكون تشغيليًا وقابلًا للمسح السريع.", "الفلاتر والحالات أهم من الزخرفة."]]
    ],
    checklist: ["حالة الداشبورد موجودة.", "task tracker حديث.", "البلوكات قابلة للتنفيذ.", "التكلفة والسياسات ظاهرة.", "workspaces واضحة."]
  },
  "ai-cost-control": {
    sections: [
      ["Usage records", "تخزن provider وmodel وtokens وcost وtask وactor."],
      ["Context packs", "تجهز سياقًا صغيرًا للتاسك بدل قراءة الريبو كله."],
      ["Preflight", "تقدير تكلفة قبل تشغيل prompt كبير."],
      ["Model routing", "اختيار موديل حسب المخاطر والتعقيد."],
      ["Waste detection", "فصل المقبول عن المرفوض وإعادة العمل والاستكشاف وغير المتتبع."]
    ],
    details: [
      ["مطور واحد", ["مهم لأن إعادة شرح السياق تضيع وقتًا وتكلفة.", "context briefs تقلل ذلك."]],
      ["فريق", ["التكلفة حسب sprint وworkstream وtask تساعد المالك.", "budget approvals تمنع الصرف الصامت."]]
    ],
    checklist: ["pricing rules موجودة.", "usage مربوط بتاسك أو untracked.", "context pack موجود للمهام الكبيرة.", "accepted/rejected معروف.", "budget approval للتكلفة العالية."]
  },
  "multi-ai-governance": {
    sections: [
      ["Identities", "المطورون ووكلاء AI لهم IDs وأدوار وقدرات ومسارات عمل."],
      ["Sessions", "جلسات AI تسجل التاسك والموديل والملفات والملخص والنتيجة."],
      ["Locks", "تمنع تعديل نفس النطاق بالتوازي."],
      ["Owner rule", "المالك النشط يملك قرار التحقق النهائي عند الحاجة."],
      ["Audit", "الأفعال المهمة تسجل حتى لا تضيع مع إغلاق الشات."]
    ],
    details: [
      ["Solo mode", ["يقلل الطقوس ويحافظ على نفس شكل الحالة.", "يمكن التوسع لاحقًا لفريق بدون خسارة."]],
      ["Parallel AI", ["الوكلاء المتوازيون يحتاجون نطاقات منفصلة.", "كبيري يكشف التعارض قبل كسر الكود."]]
    ],
    checklist: ["المالك معروف.", "الهويات معرفة.", "التعيينات محددة.", "اللوكس مفحوصة.", "الجلسات مسجلة.", "تحقق المالك محترم."]
  },
  "github-release": {
    sections: [
      ["GitHub sync", "ربط التاسكات بالissues والlabels والmilestones غالبًا dry-run أولًا."],
      ["Release readiness", "فحص validation وnotes وchecklist وpolicies وsecurity وmigrations."],
      ["Publish gates", "فصل production-ready عن published فعليًا."],
      ["Confirmed writes", "أي كتابة GitHub تحتاج confirmation وسياسات."],
      ["Packaging", "التأكد أن الحزمة تشمل الفولدرات الجديدة بعد التنظيم."]
    ],
    details: [
      ["أهمية dry-run", ["يعرض التغييرات قبل لمس GitHub.", "يحمي الريبو من تغييرات عامة أو مرئية للفريق بالخطأ."]],
      ["جاهزية package", ["يجب تضمين `knowledge/` و`packs/` و`integrations/` و`schemas/` و`docs/` و`src/` و`bin/` و`cli/`.", "الفحص يمنع نشر فريمورك ناقص."]]
    ],
    checklist: ["validation ناجح.", "الأمان مقبول.", "الهجرة مفحوصة.", "السياسات ناجحة.", "GitHub dry-run أولًا.", "تأكيد المالك موجود."]
  },
  "practical-examples": {
    sections: [
      ["1. موقع متجر إلكتروني متكامل", "اعتبره منتجًا واحدًا له backend API وواجهة متجر ولوحة إدارة وربما jobs. اختر Laravel أو NestJS أو FastAPI للباك إند، وReact أو Next.js للواجهة. استخدم Agile للـ MVP أو Structured لو نطاق العميل ثابت. كبيري يفعل المنتجات والمخزون والدفع والشحن والكوبونات والمراجعات والعملاء والأدمن وSEO والأمان والاختبارات والإصدار."],
      ["2. موقع مدونة شخصية", "اعتبره نظام محتوى بسيط. اختر Astro أو Next.js مع Markdown/MDX، أو WordPress لو صاحب المشروع يريد CMS جاهز. كبيري يخطط المقالات والمؤلف والتصنيفات والوسوم وSEO وsitemap والنشرة والتعليقات والتحليلات وتجربة القراءة."],
      ["3. موقع ونظام عيادة أسنان بالحجوزات", "اعتبره موقع خدمات + نظام حجز + لوحة إدارة. اختر Laravel أو Django للباك إند وReact أو Next.js للواجهة. كبيري يخطط الخدمات والأطباء والمواعيد والمرضى والتذكيرات والتقويم والإلغاء والصلاحيات والخصوصية والتقارير."],
      ["4. نظام CRM احترافي", "اعتبره web app كثيف البيانات. اختر Laravel أو NestJS أو .NET أو FastAPI للباك إند وReact أو Angular أو Vue للوحة. كبيري يخطط العملاء المحتملين وجهات الاتصال والشركات والصفقات والpipeline والأنشطة والمتابعات والصلاحيات والتدقيق والاستيراد والتقارير."],
      ["5. تطبيق موبايل للمتجر الإلكتروني", "اعتبره قناة موبايل مرتبطة بنفس منتج المتجر، وليس منتجًا منفصلًا. اختر React Native Expo أو Flutter. كبيري يربطه بالباك إند ويخطط onboarding وauth وproduct feed وsearch وcart وcheckout وorders وpush notifications وprofile وdeep links وoffline cache وإصدارات التطبيق."],
      ["6. نظام POS احترافي لسوبرماركت", "اعتبره نظام تشغيل بيع ومخزون وقد يحتاج offline. اختر Laravel أو .NET أو NestJS للباك إند وReact أو Vue أو Angular لشاشة POS. استخدم Structured غالبًا لأن الأجهزة والورديات والإيصالات والكاش والمخزون والتدقيق حساسة. كبيري يخطط الكاشير والباركود والمنتجات والأسعار والضرائب والورديات والمدفوعات والإيصالات والمخزون والتقارير والصلاحيات."],
      ["7. موقع WordPress لشركة تسويق رقمي", "استخدم WordPress لموقع شركة تسويق رقمي فيه صفحات خدمات ومقالات ودراسات حالة ونماذج طلب، واستخدم 4 plugins مخصصة للعملاء وطلبات الخدمات والفواتير والحسابات. كبيري يجعل كل plugin في نطاق آمن وتاسكات واضحة داخل `wp-content/plugins/`."]
    ],
    details: [
      ["تدفق مساعد الذكاء الاصطناعي العام", ["قل لمساعد الذكاء الاصطناعي الهدف بلغة بسيطة، ومساعد الذكاء الاصطناعي يستخدم كبيري لاختيار blueprint ونمط التسليم والأسئلة وتصميم البيانات والواجهة وحزم البرومبت.", "مساعد الذكاء الاصطناعي ينفذ تاسك واحد فقط في كل مرة ويسجل الملفات والدليل ثم يشغل validation والاختبارات."]],
      ["تخطيط الباك إند", ["في كل مثال حدد المستخدمين والصلاحيات والجداول وAPIs والvalidations والتكاملات والاختبارات ومخاطر الإصدار.", "استخدم `data-design context` حتى لا ينتج AI قاعدة بيانات ضعيفة."]],
      ["تخطيط الفرونت إند", ["حدد الصفحات والتخطيطات والمكونات وحالات loading وempty وerror وresponsive وaccessibility وSEO/GEO عند الحاجة.", "استخدم `design recommend` وحوكمة مصادر التصميم قبل التنفيذ."]],
      ["التسليم", ["قبل التسليم شغل validation والداشبورد وتقارير readiness/governance وsecurity scan وrelease gates وhandoff package.", "المخرج الاحترافي هو كود + حالة مشروع واضحة وليس كود فقط."]]
    ],
    checklist: ["كل مثال له blueprint.", "نمط التسليم محدد.", "الباك إند والفرونت إند مخططان منفصلًا.", "حزم البرومبت تطابق التقنية.", "التاسكات محددة قبل تعديل مساعد الذكاء الاصطناعي.", "الداشبورد وتحقق المالك يغلقان العمل."]
  },
  "example-ecommerce": {
    sections: [
      ["شكل المنتج", "المتجر يبيع منتجات أونلاين ويحتاج كتالوج وسلة وcheckout ودفع وشحن وتتبع طلب ولوحة إدارة ومخزون وخصومات ومرتجعات ورسائل وSEO وتقارير."],
      ["التقنيات المناسبة", "Laravel أو NestJS أو FastAPI أو Django للباك إند. Next.js أو React للمتجر. React مع Ant Design أو Mantine أو MUI للوحة الإدارة. PostgreSQL أو MySQL للداتا."],
      ["نمط التسليم", "Agile لو MVP أو التصميم سيتغير. Structured لو العميل عنده متطلبات ثابتة وتكاملات دفع وشحن وفواتير وتواريخ تسليم واضحة."],
      ["قدرات كبيري", "Product Blueprint وApp Boundary وDelivery Advisor وQuestionnaire وData Design وUI/UX وPrompt Packs وTask Governance وDashboard وSecurity وRelease Gates."],
      ["حدود التطبيقات", "backend API وstorefront وadmin وworkers داخل workspace واحد لو لنفس المتجر. افصل فقط لو منتجات أو عملاء مختلفين."],
      ["مسارات العمل", "backend وdatabase وpublic_frontend وadmin_frontend وintegration وqa وsecurity وdocs وrelease."]
    ],
    details: [
      ["أسئلة كبيري المهمة", ["هل المنتجات بسيطة أم variants أم digital أم subscriptions؟", "هل يوجد مخزون وفروع ومخازن؟", "ما بوابات الدفع والشحن؟", "هل يوجد guest checkout وحساب عميل وكوبونات ومراجعات ومرتجعات وفواتير؟", "هل مطلوب عربي/إنجليزي وSEO وعملات وضرائب؟"]],
      ["تصميم البيانات", ["Core: users, roles, permissions, settings, files, audit_logs.", "Commerce: customers, products, variants, categories, carts, orders, order_items, payments, invoices, shipments, coupons, reviews, returns, refunds.", "Inventory: warehouses, stock_movements, stock_balances, reservations.", "مهم: order_items والفواتير تحفظ snapshot حتى لا تتغير الطلبات القديمة عند تغيير السعر."]],
      ["الباك إند", ["Auth وأدوار، كتالوج، cart API، checkout service، webhooks للدفع، تكامل الشحن، lifecycle للطلب، admin APIs، مخزون، emails، audit، import/export، reports.", "استخدم transactions في checkout والدفع وحجز المخزون والفاتورة.", "استخدم idempotency في الدفع والwebhooks وإنشاء الطلب."]],
      ["الفرونت إند", ["Home وcategories وproduct list وproduct details وsearch وfilters وcart drawer وcheckout وpayment result وaccount وorders وwishlist وreturns وFAQ.", "الصفحات العامة تحتاج SEO metadata وProduct schema وBreadcrumb schema وصور محسنة وحالات loading/empty/error وموبايل قوي."]],
      ["لوحة الإدارة", ["Products table وproduct form وcategories وinventory وorders وpayments وrefunds وshipments وcoupons وcustomers وreports وsettings وroles وaudit logs.", "استخدم tables وفلاتر وstatus badges وbulk actions وdrawers وconfirm modals."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["تاسك blueprint والأسئلة.", "تاسك migrations/models للمنتجات.", "تاسك cart/checkout backend.", "تاسك storefront listing/details.", "تاسك admin products.", "تاسك payment sandbox.", "تاسك orders/emails/reports.", "تاسك tests/security/handoff."]],
      ["القبول", ["العميل يضيف منتج للسلة ويدفع ويرى الطلب.", "الأدمن يضيف منتج ويعدل مخزون ويدير طلب.", "webhooks لا تكرر الدفع.", "الفاتورة القديمة لا تتغير.", "الواجهة responsive وSEO جيد.", "الداشبورد يعرض الحالة."]]
    ],
    checklist: ["blueprint المتجر محدد.", "التطبيقات مرتبطة.", "الدفع والشحن واضحان.", "snapshots موجودة.", "checkout آمن.", "storefront وadmin منفصلان.", "مساعد الذكاء الاصطناعي يعمل تاسك وراء تاسك."]
  },
  "example-blog": {
    sections: [
      ["شكل المنتج", "مدونة تنشر مقالات وملف كاتب وتصنيفات ووسوم وبحث ونشرة وربما تعليقات أو محتوى مدفوع."],
      ["التقنيات المناسبة", "Astro أو Next.js مع Markdown/MDX لمدونة سريعة. WordPress لو صاحب المشروع يريد CMS تقليدي. Strapi أو CMS headless لو إدارة المحتوى منفصلة."],
      ["نمط التسليم", "Agile لمدونة شخصية تتطور. Structured لو مشروع عميل له صفحات وهوية وSEO deliverables معتمدة."],
      ["قدرات كبيري", "Product Blueprint وQuestionnaire وUI/UX Advisor وDesign Governance وPrompt Packs وTask Governance وSEO/GEO وRelease Gates."],
      ["مسارات العمل", "public_frontend وcontent وdesign وseo وqa وdocs وrelease."],
      ["تعريف النجاح", "القارئ يجد المقالات ويقرأ بسهولة على الموبايل ومحركات البحث تفهم المحتوى."]
    ],
    details: [
      ["أسئلة كبيري", ["ما موضوع المدونة والجمهور؟", "Static أم CMS؟", "عربي أم إنجليزي أم الاثنين؟", "هل تحتاج newsletter أو comments أو author bio أو tags أو search؟", "ما أهداف SEO: topic clusters وschema وsitemap وRSS؟"]],
      ["موديل المحتوى", ["Static: title, slug, date, updated date, summary, tags, category, cover, author, SEO fields.", "CMS: posts, authors, categories, tags, media, comments, subscribers, redirects, seo_metadata.", "للغتين: خطط routes أو translations مبكرًا."]],
      ["الواجهة", ["Home وpost list وcategory وtag وarticle وabout وcontact وnewsletter وsearch وarchive.", "صفحة المقال تحتاج H1/H2 وTOC وreading time وauthor وdate وrelated posts وshare links وخط مريح."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["اختيار content model.", "layout/navigation/theme tokens.", "article listing/article page.", "SEO/sitemap/RSS/schema.", "search/newsletter/comments.", "performance/accessibility review."]],
      ["القبول", ["إضافة مقال جديدة سهلة.", "الموقع responsive ومقروء.", "SEO metadata وsitemap موجودان.", "RTL/LTR صحيح.", "الأداء جيد.", "handoff يشرح نشر مقالات جديدة."]]
    ],
    checklist: ["مصدر المحتوى محدد.", "post model واضح.", "الخط والتخطيط مقبولان.", "SEO/GEO موجود.", "workflow النشر موثق.", "الأداء مفحوص."]
  },
  "example-wordpress-digital-agency": {
    sections: [
      ["شكل المنتج", "موقع WordPress عام لشركة تسويق رقمي يعرض الخدمات والمقالات ودراسات الحالة ونماذج الطلب، ومعه طبقة تشغيل داخلية خفيفة داخل لوحة WordPress."],
      ["طريقة WordPress", "استخدم WordPress للمحتوى والصفحات وSEO، واستخدم plugins مخصصة لأي منطق أعمال يجب أن يعيش بعيدًا عن الثيم."],
      ["نمط التسليم", "Structured لو الصفحات والباقات والفواتير معتمدة من عميل. Agile لو الشركة ما زالت تجرب العروض والفنل ونموذج العميل."],
      ["قدرات كبيري", "WordPress Development وWordPress Plugin Development وData Design وUI/UX وPrompt Packs وTask Governance وSecurity وDashboard وHandoff."],
      ["حدود المنتج", "الموقع العام والـ 4 plugins منتج واحد داخل مساحة كبيري واحدة. لا تفصل كل plugin في مساحة غير مرتبطة إلا لو سيباع كمنتج مستقل."]
    ],
    details: [
      ["صفحات الموقع العام", ["Home تعرض العرض الأساسي والخدمات والدليل الاجتماعي وCTA.", "Service pages لخدمات SEO والإعلانات والسوشيال والمحتوى والهوية واللاندنج والتحليلات.", "Case studies تعرض المشكلة والعمل والنتيجة والأرقام.", "Blog/resources لمقالات SEO وأدلة الحملات والأسئلة.", "Contact/request page يربط نموذج الطلب بإضافة طلبات الخدمات."]],
      ["Plugin 1: العملاء", ["الاسم المقترح: `Agency Customers` والـ slug: `agency-customers`.", "يدير الشركات والجهات والبيانات والفوترة ومدير الحساب وسجل النشاط.", "لا تخلط customer مع WordPress user؛ العميل قد يكون سجل إداري فقط بدون حساب دخول."]],
      ["Plugin 2: طلبات الخدمات", ["الاسم المقترح: `Agency Service Requests` والـ slug: `agency-service-requests`.", "يحوّل نماذج الموقع إلى طلبات منظمة: خدمة مطلوبة، وصف، ميزانية، ملفات، حالة، مسؤول.", "الفورم العام يحتاج nonce وsanitization وقيود للملفات وحالات مثل new/reviewing/quoted/approved/in_progress/completed."]],
      ["Plugin 3: الفواتير", ["الاسم المقترح: `Agency Invoices` والـ slug: `agency-invoices`.", "ينشئ فواتير لخدمات التسويق والريتainer والحملات والإضافات.", "يحتاج invoice_items وpayments وstatus history وsnapshots لأسماء العميل والخدمة والسعر والضريبة.", "لا تحذف فاتورة مدفوعة؛ استخدم cancelled أو credit/refund flow."]],
      ["Plugin 4: الحسابات", ["الاسم المقترح: `Agency Accounts` والـ slug: `agency-accounts`.", "يدير الحسابات المالية أو أرصدة العملاء أو ملخصات الحساب وملاحظات الحساب.", "لا تجعل الحساب يعدل الفواتير مباشرة؛ الفاتورة والدفع هما مصدر الحقيقة، والحساب يعرض ملخصًا أو قيودًا منظمة."]],
      ["تكامل الإضافات", ["Customers هو سجل العميل المركزي.", "Service Requests تربط أو تنشئ customer.", "Invoices ترتبط بالعميل وقد ترتبط بطلب خدمة.", "Accounts تلخص الأرصدة والملاحظات بدون إفساد تاريخ الفواتير.", "استخدم hooks/actions وروابط إدارة واضحة بدل تعديل ملفات plugins الأخرى عشوائيًا."]],
      ["ترتيب التنفيذ", ["ابدأ بخطة موقع WordPress وصفحات الخدمات.", "ثم Customers، ثم Service Requests لأنه يربط الموقع بالعميل.", "ثم Invoices، ثم Accounts.", "بعدها نفذ تاسك Integration يجمع الطلب والعميل والفاتورة والحساب.", "اختم بالأمان والصلاحيات والتسليم."]]
    ],
    checklist: ["خطة موقع WordPress موجودة.", "4 plugin plans موجودة.", "كل إضافة لها slug وفولدر مستقل.", "طلبات الخدمات تستخدم nonce وsanitization.", "العملاء منفصلون عن WordPress users.", "الفواتير تستخدم snapshots وتعامل آمن مع المال.", "تكامل plugins واضح.", "التسليم يشرح activation order والrollback."]
  },
  "example-dental-clinic": {
    sections: [
      ["شكل المنتج", "موقع خدمات للعيادة + حجز مواعيد + لوحة إدارة للأطباء والموظفين."],
      ["التقنيات المناسبة", "Laravel أو Django أو NestJS للباك إند، React أو Next.js للواجهة، PostgreSQL/MySQL، وcalendar UI للإدارة."],
      ["نمط التسليم", "Structured لو العيادة تحتاج قواعد خصوصية ومواعيد دقيقة. Agile لو MVP سريع."],
      ["قدرات كبيري", "Booking Blueprint وData Design وUI/UX وApp Boundary وWorkstreams وSecurity وTask Governance وDashboard وNotifications."],
      ["مسارات العمل", "backend وdatabase وpublic_frontend وadmin_frontend وintegration وsecurity وqa وdocs."],
      ["تعريف النجاح", "المريض يحجز، والعيادة تدير التوفر، والموظف يؤكد أو يلغي أو يعيد الجدولة، والتذكيرات تعمل."]
    ],
    details: [
      ["أسئلة كبيري", ["كم طبيب وفرع؟", "ما الخدمات ومدة كل خدمة؟", "هل المريض يختار الطبيب؟", "هل الحجز فوري أم pending؟", "ما سياسة الإلغاء؟", "هل التذكير email أو SMS أو WhatsApp؟", "ما البيانات الحساسة ومن يراها؟"]],
      ["تصميم البيانات", ["Core: users, roles, permissions, audit_logs, settings.", "Clinic: dentists, services, staff_availability, appointments, patients, appointment_status_history, reminders, branches, rooms, cancellations.", "مهم: start_at وend_at مطلوبان، ويجب منع تداخل المواعيد."]],
      ["الباك إند", ["availability service وappointment creation وconflict detection وstatus transitions وreminders وadmin calendar API وpatient API وaudit.", "استخدم transactions عند تأكيد الحجز.", "انتبه للtimezone."]],
      ["الواجهة", ["Public: home/services/dentists/booking/contact/FAQ/policies.", "Booking: اختيار خدمة وطبيب وموعد وبيانات وتأكيد.", "Admin: calendar وappointments table وpatient detail وservices وavailability وreports."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["قواعد الحجز والداتا.", "backend للحجز والتوفر.", "public booking flow.", "admin calendar.", "reminders/audit.", "اختبار تداخل المواعيد."]],
      ["القبول", ["لا يمكن حجز نفس الطبيب في نفس الوقت.", "الإدارة تؤكد وتلغي وتعيد الجدولة.", "المريض يرى حالات واضحة.", "التذكيرات مسجلة.", "البيانات الحساسة محمية."]]
    ],
    checklist: ["قواعد الحجز واضحة.", "availability مصممة.", "منع التداخل موجود.", "public/admin flows موجودة.", "privacy/audit موجودان.", "reminders مختبرة."]
  },
  "example-crm": {
    sections: [
      ["شكل المنتج", "CRM يدير leads وcontacts وcompanies وdeals وpipeline وactivities وfollow-ups وnotes وfiles وquotes وreports وpermissions."],
      ["التقنيات المناسبة", "Laravel أو NestJS أو .NET أو Django أو FastAPI للباك إند، React أو Angular أو Vue للواجهة، وقاعدة PostgreSQL/MySQL."],
      ["نمط التسليم", "Structured لCRM شركة أو عميل كبير. Agile لCRM ناشئ يتغير فيه pipeline والتقارير."],
      ["قدرات كبيري", "CRM Blueprint وDelivery Advisor وData Design وUI/UX وWorkstreams وTask Governance وAI Cost وDashboard وSecurity وAudit."],
      ["مسارات العمل", "backend وdatabase وadmin_frontend وintegration وqa وsecurity وdocs وreporting."],
      ["تعريف النجاح", "فريق المبيعات يتابع leads والصفقات والأنشطة، والمدير يرى تقارير موثوقة."]
    ],
    details: [
      ["أسئلة كبيري", ["ما مراحل المبيعات؟", "من المستخدمون؟", "هل توزيع leads يدوي أم تلقائي؟", "هل تحتاج quotes وreminders وemail integration وimport/export وcustom fields؟", "ما التقارير المطلوبة؟"]],
      ["تصميم البيانات", ["Core: users, roles, permissions, audit_logs.", "CRM: leads, contacts, companies, deals, deal_stages, activities, notes, tasks, reminders, quotes, files, pipelines, assignments, custom_fields.", "مهم: لا تجعل كل شيء generic records إلا لو تبني low-code CRM."]],
      ["الباك إند", ["Lead CRUD وcontacts/companies وdeal pipeline وactivity timeline وassignment rules وreminders وsearch/filter وimport/export وaudit وpermissions وreports.", "استخدم pagination وindexes مبكرًا.", "افصل activity_logs عن audit_logs."]],
      ["الواجهة", ["Dashboard وleads table وpipeline board وcontact details وcompany profile وactivity timeline وtasks/reports/import/settings/users.", "استخدم UI كثيف: filters وsaved views وcolumn visibility وbulk actions وdrawers."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["pipeline/entities.", "leads/contacts/companies backend.", "deals/stages.", "admin table/pipeline UI.", "activity/reminders.", "import/export/reports.", "security/audit/tests/handoff."]],
      ["القبول", ["المندوب ينشئ lead.", "deal ينتقل بين مراحل مسموحة.", "المدير يرى pipeline report.", "الصلاحيات تمنع الوصول الخاطئ.", "import يسجل أخطاء الصفوف."]]
    ],
    checklist: ["sales process واضح.", "permissions matrix موجودة.", "pipeline entities واضحة.", "tables/filters مصممة.", "reports محددة.", "audit/import/export موجودة."]
  },
  "example-mobile-commerce": {
    sections: [
      ["شكل المنتج", "تطبيق عميل للموبايل يعرض المنتجات والبحث والسلة والدفع والطلبات والتنبيهات والحساب والمفضلة والدعم."],
      ["التقنيات المناسبة", "React Native Expo للتسليم السريع، أو Flutter لو الفريق يفضل Dart. الباك إند هو باك إند المتجر نفسه."],
      ["نمط التسليم", "Agile غالبًا لأن تجربة الموبايل تحتاج تجربة وتحسين. Structured لو API ومتطلبات المتجر ثابتة."],
      ["قدرات كبيري", "App Boundary وEcommerce Blueprint وMobile Prompt Pack وData Design وUI/UX وAPI Integration وDashboard وSecurity وRelease Gates."],
      ["مسارات العمل", "mobile وbackend وintegration وqa وsecurity وrelease وdocs."],
      ["تعريف النجاح", "التطبيق يستخدم نفس بيانات المتجر ويعرض المنتجات ويدير السلة والدفع وتتبع الطلب بشكل آمن."]
    ],
    details: [
      ["أسئلة كبيري", ["هل يستخدم نفس حساب العميل؟", "هل الدفع داخل التطبيق أم web checkout؟", "هل تحتاج push notifications وdeep links وoffline cache وbiometric وdark mode؟", "ما APIs الموجودة والناقصة؟"]],
      ["API والداتا", ["التطبيق لا يكرر داتا المتجر؛ يستهلك APIs للمنتجات والسلة والدفع والطلبات والحساب.", "موبايل يحتاج devices وpush_tokens وapp_sessions وapp_versions وpreferences وdeep_links.", "لا تخزن بيانات بطاقة الدفع في التطبيق."]],
      ["الشاشات", ["Onboarding وlogin/register وhome وcategories وsearch وproduct details وcart وcheckout وpayment result وorders وwishlist وprofile وsettings وsupport.", "كل شاشة تحتاج loading/empty/error/offline/success states."]],
      ["تكامل الباك إند", ["تأكد من response shapes وauth وpagination وcart sync وorder status وpush events وforce update endpoint.", "لو API ناقص، أنشئ backend task قبل mobile task."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["mobile shell/navigation.", "auth/secure storage.", "product feed/search/details.", "cart/checkout integration.", "orders/profile/notifications.", "offline/error states.", "device QA/handoff."]],
      ["القبول", ["login آمن.", "المنتجات تظهر من API.", "السلة والدفع يعملان.", "تتبع الطلب واضح.", "push token يعمل إذا مفعّل.", "offline/errors واضحة."]]
    ],
    checklist: ["التطبيق مربوط بنفس المتجر.", "API contracts معروفة.", "Expo أو Flutter محدد.", "الشاشات mapped.", "push/offline/versioning مخططة.", "device QA موجود."]
  },
  "example-pos": {
    sections: [
      ["شكل المنتج", "POS للسوبرماركت: شاشة كاشير وباركود وسلة وخصومات وضرائب ومدفوعات وإيصالات ومرتجعات وورديات وكاش ومخزون وتقارير."],
      ["التقنيات المناسبة", "Laravel أو .NET أو NestJS للباك إند، React أو Vue أو Angular لشاشة POS، PostgreSQL/MySQL. لو hardware desktop مهم يمكن إضافة Electron لاحقًا."],
      ["نمط التسليم", "Structured غالبًا لأن POS يمس المال والمخزون والموظفين والإيصالات. يمكن استخدام Agile داخل المراحل لتحسين الشاشة."],
      ["قدرات كبيري", "POS Blueprint وStructured Delivery وData Design وUI/UX وApp Boundary وSecurity وAudit وMigration وDashboard وRelease Gates."],
      ["مسارات العمل", "backend وdatabase وadmin_frontend وpos_frontend وintegration وqa وsecurity وdocs وrelease."],
      ["تعريف النجاح", "الكاشير يبيع بسرعة، الإيصال صحيح، المخزون يتغير بدقة، المرتجعات محكومة، والوردية تغلق بأرقام قابلة للتدقيق."]
    ],
    details: [
      ["أسئلة كبيري", ["كم فرع وجهاز؟", "هل المنتجات barcode أو SKU أو weighted items؟", "ما طرق الدفع؟", "هل يوجد receipt printer وcash drawer وscanner؟", "هل offline مطلوب؟", "كيف تتم المرتجعات والخصومات والضرائب وإغلاق الوردية؟"]],
      ["تصميم البيانات", ["Core: users, roles, permissions, branches, settings, audit_logs.", "POS: pos_devices, pos_sessions, cash_drawers, sales, sale_items, payments, returns, receipts.", "Inventory: products, barcodes, categories, stock_movements, stock_balances, warehouses.", "مهم: المخزون movements وليس رقمًا فقط، والمبيعات والإيصالات snapshots."]],
      ["الباك إند", ["product lookup بالباركود، إنشاء sale سريع، تسجيل payment، receipt generation، stock movement، returns، shift open/close، cash reconciliation، audit، reports.", "استخدم transaction في sale + payment + stock + receipt.", "offline يحتاج local sale IDs وخطة sync."]],
      ["واجهة POS", ["بحث/باركود سريع، cart، quantity، discounts، payment panel، receipt preview، returns، shift status، offline indicator، keyboard shortcuts.", "الشاشة يجب أن تكون ثابتة وسريعة بلا layout shifts."]],
      ["لوحة الإدارة", ["Products وprices وcategories وinventory وshifts وsales reports وusers/roles وtaxes وsettings وdevices وaudit logs.", "المدير يحتاج daily summaries وlow stock وcashier performance وbranch performance."]],
      ["تاسكات مساعد الذكاء الاصطناعي", ["operations/data model.", "products/barcode/inventory.", "sale transaction/receipt snapshot.", "cashier screen.", "shifts/cash drawer.", "returns/reports.", "hardware/offline strategy.", "security/tests/release/handoff."]],
      ["القبول", ["الباركود يضيف المنتج بسرعة.", "البيع ينشئ payment وreceipt وstock movement.", "المرتجع لا يفسد المخزون.", "إغلاق الوردية يعرض expected vs actual cash.", "المدير يراجع نشاط الكاشير."]]
    ],
    checklist: ["Structured مختار أو مبرر.", "cashier workflow واضح.", "inventory movements مصممة.", "receipt snapshots موجودة.", "shift closing مخطط.", "offline/hardware محدد.", "audit/reports موجودة."]
  },
  "troubleshooting": {
    sections: [
      ["validation fails", "اقرأ الملف أو schema أو قاعدة الحوكمة التي فشلت ثم أصلح المصدر."],
      ["مسار قديم", "قد يكون alias للتوافق؛ لا تعيد إنشاء فولدر قديم."],
      ["داشبورد قديم", "أعد توليد الحالة من `.kabeeri/` بدل تعديل UI يدويًا."],
      ["AI عدل كثيرًا", "استخدم scope وlocks وtokens وpost-work capture."],
      ["release blocked", "افحص policy results وsecurity وmigration وOwner evidence."]
    ],
    details: [
      ["بعد تنظيم الفولدرات", ["لو ظهر مسار قديم تحقق هل هو alias.", "الملف الفعلي غالبًا تحت `knowledge/` أو `packs/` أو `integrations/`."]],
      ["بعد جلسة AI سيئة", ["التقط الملفات وقارنها بالنطاق.", "اقبل المفيد بتاسكات منفصلة وارفض الانحراف."]]
    ],
    checklist: ["مصدر الفشل معروف.", "لا يوجد إصلاح UI فقط.", "لم يتم إحياء فولدر قديم.", "تمت إعادة validation.", "تم تشغيل tests عند تغيير الكود."]
  }
};

for (const [slug, override] of Object.entries(arDeepOverrides)) {
  docs.ar.pages[slug] = { ...docs.ar.pages[slug], ...override };
}

docs.ar.pages["example-ai-team-ecommerce"] = {
  ...docs.en.pages["example-ai-team-ecommerce"],
  arTitle: "مثال: 3 مطوري AI لبناء متجر",
  lead: "هذه الصفحة تشرح كيف يقود قائد فريق واحد ثلاثة مطوري AI لبناء متجر إلكتروني واحد: واحد للباك إند، واحد لواجهة الإنترنت، وواحد لتطبيق الموبايل.",
  beginner: "السيناريو الأفضل ليس أن يعمل الثلاثة عشوائيًا في نفس الملفات. السيناريو الآمن هو منتج واحد داخل مساحة كبيري، قائد فريق أو مالك واحد، ثلاثة وكلاء AI مسجلين، حدود تطبيقات منفصلة، مسارات عمل منفصلة، تاسكات محددة، أقفال وتوكنز، ثم تاسكات تكامل تجمع العمل.",
  sections: [
    ["الهيكل الموصى به", "اعتبر المتجر منتجًا واحدًا له تطبيقات مرتبطة: `store-api` للباك إند، `storefront-web` لواجهة الإنترنت، `store-mobile` للموبايل، وربما `admin-dashboard` أو workers. AI الباك إند يملك APIs وقاعدة البيانات. AI الويب يملك واجهة المتجر. AI الموبايل يملك تطبيق العميل. قائد الفريق يملك التخطيط والاعتماد والتكامل والتحقق النهائي."],
    ["دور قائد الفريق", "القائد هو المطور البشري أو المالك أو المراجع التقني. يختار blueprint، يقرر Agile أو Structured، يراجع إجابات الأسئلة، ينشئ التطبيقات ومسارات العمل، يسند التاسكات، يصدر التوكنز، يراجع الأدلة، يحل التعارضات، ويقرر متى يتم دمج العمل."],
    ["دور AI الباك إند", "يعمل فقط على API وقاعدة البيانات وauth والمنتجات والسلة وcheckout والطلبات والدفع والمخزون والـ webhooks والاختبارات الخلفية. يجب أن يثبت API contracts قبل أن تعتمد عليها واجهات الويب والموبايل."],
    ["دور AI واجهة الإنترنت", "يعمل فقط على storefront web: الرئيسية، التصنيفات، قائمة المنتجات، تفاصيل المنتج، البحث، الفلاتر، السلة، checkout UI، الحساب، الطلبات، SEO، responsive states، واختبارات الويب."],
    ["دور AI الموبايل", "يعمل فقط على قناة الموبايل: onboarding، login، product feed، search، product details، cart، checkout integration، orders، profile، push token registration، offline/error states، وdevice testing."],
    ["كيف تنتقل التاسكات", "التاسكات لا تنتقل بذاكرة الشات. كل تاسك ينشأ، يسند، يحدد نطاقه، يصدر له token، يقفل نطاقه، ينفذ، يسلم بدليل، يراجع، ثم يتحقق أو يرفض. أي عمل مشترك يصبح `type=integration`."],
    ["كيف ينتهي المتجر", "لا ينتهي المتجر عندما يقول كل AI إن شغله خلص. ينتهي عندما تكون API contracts مستقرة، الويب والموبايل يعملان على نفس الباك إند، checkout وorder lifecycle مختبران، السياسات والأمان والجاهزية ناجحة، والتحقق النهائي وحزمة التسليم موجودان."]
  ],
  steps: ["إنشاء مساحة المنتج", "تسجيل التطبيقات", "تسجيل وكلاء AI", "إنشاء مسارات العمل", "تثبيت API contracts", "تقسيم التاسكات", "إصدار tokens وlocks", "الباك إند يبني العقود", "الويب والموبايل يستهلكان العقود", "تاسكات التكامل", "مراجعة الأدلة", "تحقق المالك", "التسليم"],
  details: [
    ["نموذج الصلاحيات", ["القائد أو المالك يستطيع إنشاء التطبيقات وإضافة الوكلاء وإسناد التاسكات وإصدار أو سحب التوكنز وتشغيل policy gates والتحقق النهائي.", "AI الباك إند يعمل فقط داخل backend/database/API scopes الخاصة بتاسكه.", "AI الويب يعمل فقط داخل مسارات storefront web.", "AI الموبايل يعمل فقط داخل مسارات تطبيق الموبايل.", "لا يحصل أي وكيل AI على صلاحية Owner. توسيع النطاق يتم بتاسك integration واضح ومراجع."]],
    ["التطبيقات المقترحة", ["`store-api`: الباك إند وAPI والخدمات.", "`storefront-web`: واجهة المتجر على الإنترنت.", "`store-mobile`: تطبيق العميل للموبايل.", "`admin-dashboard`: لوحة الإدارة إذا كانت منفصلة.", "كل هذه التطبيقات يمكن أن تعيش داخل نفس مساحة كبيري لأنها منتج واحد. متجر آخر أو عميل آخر يحتاج مساحة كبيري منفصلة."]],
    ["قواعد تبادل العمل", ["AI الباك إند لا يسلم ملفات مباشرة للويب أو الموبايل؛ يسلم API contracts وendpoint notes والملفات المتغيرة والاختبارات والمخاطر.", "AI الويب والموبايل لا يغيران الباك إند عند نقص endpoint. يطلبان أو ينشئان تاسك باك إند.", "قرارات auth وcart sync وpayment redirect وorder status تسجل كـ ADR أو ملاحظات تاسك معتمدة.", "لو الويب والموبايل يحتاجان نفس API shape، ينشئ القائد تاسك contract قبل تنفيذ الواجهات."]],
    ["تسليم كل وكيل AI", ["كل session تنتهي بملفات متغيرة، checks، summary، risks، وما بقي blocked.", "تسليم الباك إند يشمل endpoints وmigrations وseed data وقواعد auth وidempotency/webhook notes والاختبارات.", "تسليم الويب يشمل الصفحات المكتملة واعتمادات API وحالات responsive وSEO/accessibility.", "تسليم الموبايل يشمل الشاشات واعتمادات API وملاحظات الأجهزة والصلاحيات وoffline/error states وrelease blockers."]],
    ["خطة التكامل", ["Integration Task 1: الباك إند ينشر عقود product/catalog/cart/order API.", "Integration Task 2: واجهة الويب تستهلك API وتتحقق من product/cart/checkout/order.", "Integration Task 3: الموبايل يستهلك نفس API ويتحقق من auth/product/cart/order.", "Integration Task 4: اختبار end-to-end للدفع والطلب.", "Integration Task 5: readiness report وgovernance report وsecurity scan وdashboard export وhandoff package."]],
    ["منع التعارض", ["استخدم app boundaries حتى لا يلمس الموبايل ملفات الويب ولا الويب ملفات الباك إند.", "استخدم workstreams لتوضيح backend وdatabase وpublic_frontend وmobile وsecurity.", "استخدم locks قبل بدء أي AI في ملفات مشتركة.", "استخدم task access tokens لتحديد allowed_files وforbidden_files.", "استخدم policy gates قبل التحقق النهائي أو الإصدار."]],
    ["أخطاء شائعة", ["كل الوكلاء يبدأون الكود قبل وجود API contracts.", "وكلاء الواجهة يخترعون mock data لا تطابق ردود الباك إند.", "تطبيق الموبايل يتحول إلى منتج منفصل بدل قناة لنفس المتجر.", "القائد يقبل عروض منفصلة ولا يختبر checkout/order lifecycle كامل.", "وكيل يغير auth أو config مشترك بدون تاسك integration."]]
  ],
  checklist: ["مساحة متجر واحدة موجودة.", "التطبيقات مسجلة بأسماء usernames ثابتة.", "وكلاء backend وweb وmobile مسجلون.", "كل تاسك له owner وapp scope وworkstream وallowed files وacceptance criteria.", "API contracts موجودة قبل اعتماد الواجهات عليها.", "تاسكات التكامل تجمع backend وweb وmobile.", "كل AI يسلم evidence وrisks.", "القائد يراجع والمالك يتحقق والـ gates تمر وحزمة التسليم تتولد."]
};

const cleanArabicTitles = {
  "what-is": "نظرة عامة",
  "start-here": "ابدأ من هنا",
  "ai-with-kabeeri": "كيف يعمل AI داخل كبيري",
  "capabilities": "قدرات النظام",
  "repository-layout": "تنظيم المستودع",
  "new-project": "بدء تطبيق جديد",
  "existing-kabeeri-project": "استكمال مشروع كبيري",
  "existing-non-kabeeri-project": "اعتماد تطبيق قائم",
  "delivery-mode": "اختيار Agile أو Structured",
  "agile-delivery": "التسليم الأجايل",
  "structured-delivery": "التسليم المنظم",
  "questionnaire-engine": "محرك الأسئلة",
  "product-blueprints": "خرائط المنتجات",
  "data-design": "تصميم البيانات",
  "ui-ux-advisor": "مساعد تصميم الواجهات",
  "vibe-first": "مسار Vibe-first",
  "task-governance": "حوكمة التاسكات",
  "app-boundary": "حوكمة حدود التطبيقات",
  "workstreams-scope": "مسارات العمل والنطاق",
  "prompt-packs": "حزم البرومبت",
  "dashboard-monitoring": "الداشبورد الحي",
  "ai-cost-control": "التحكم في تكلفة AI",
  "multi-ai-governance": "حوكمة تعدد وكلاء AI",
  "github-release": "GitHub وبوابات الإصدار",
  "practical-examples": "سبعة تطبيقات عملية",
  "example-ecommerce": "مثال: متجر إلكتروني",
  "example-ai-team-ecommerce": "مثال: 3 مطوري AI لبناء متجر",
  "example-blog": "مثال: مدونة شخصية",
  "example-wordpress-digital-agency": "مثال: WordPress لشركة تسويق رقمي",
  "example-dental-clinic": "مثال: عيادة أسنان وحجوزات",
  "example-crm": "مثال: CRM احترافي",
  "example-mobile-commerce": "مثال: تطبيق موبايل للمتجر",
  "example-pos": "مثال: POS سوبرماركت",
  "troubleshooting": "حل المشكلات"
};

pages.forEach((page) => {
  page[2] = cleanArabicTitles[page[0]] || page[2];
  if (docs.ar.pages[page[0]]) docs.ar.pages[page[0]].arTitle = page[2];
});

capabilityRows.ar = [
  ["محرك CLI", "يشغل عمليات مساحة العمل والتحقق والتاسكات والداشبورد والتغليف وبوابات الإصدار.", "`bin/kvdf.js`, `src/cli/`, `cli/CLI_COMMAND_REFERENCE.md`"],
  ["تنظيم المستودع", "ينظم كبيري إلى runtime وknowledge وpacks وintegrations وschemas وdocs وtests وحالة حية.", "`knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`"],
  ["حالة مساحة العمل", "تخزن حقيقة المشروع والتاسكات والسياسات والتقارير والتوكنز والتكلفة والالتقاطات وسجل التدقيق.", "`.kabeeri/`"],
  ["Vibe-first UX", "يسمح للمطور بالكلام الطبيعي بينما يحوله كبيري إلى اقتراحات وخطط والتقاطات وملخصات محكومة.", "`knowledge/vibe_ux/`, `.kabeeri/interactions/`"],
  ["مساعد نمط التسليم", "يساعد على اختيار Agile أو Structured حسب الغموض وثبات النطاق والاعتمادات والمخاطر.", "`knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`"],
  ["خرائط المنتجات", "يفهم أنظمة السوق مثل متجر وERP وCRM وPOS وأخبار ومدونة وحجز وتوصيل وموبايل.", "`knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`"],
  ["تصميم البيانات", "يرشد تصميم قاعدة البيانات من دورة العمل والعلاقات والقيود واللقطات والتدقيق والمعاملات والتقارير.", "`knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`"],
  ["Agile Runtime", "يدير الباك لوج والإبيكس والستوريز والاسبرنت والمراجعات والسرعة والمعوقات.", "`knowledge/agile_delivery/`, `.kabeeri/agile.json`"],
  ["Structured Runtime", "يدير المتطلبات والمراحل والمخرجات والتتبع والمخاطر وطلبات التغيير وبوابات المراحل.", "`knowledge/delivery_modes/`, `.kabeeri/structured.json`"],
  ["محرك الأسئلة", "يجمع الإجابات المهمة فقط ويفعل مناطق النظام ويكشف النواقص ويولد تاسكات.", "`knowledge/questionnaires/`, `knowledge/questionnaire_engine/`"],
  ["حزم البرومبت", "توفر تعليمات واعية بالفريمورك للارافيل وريأكت وNext.js وVue وAngular وDjango وFastAPI وWordPress وExpo وغيرها.", "`packs/prompt_packs/`"],
  ["حوكمة التاسكات", "تحول العمل إلى وحدات محددة المصدر والنطاق والمراجع ومعايير القبول والتوكنز.", "`knowledge/task_tracking/`, `.kabeeri/tasks.json`"],
  ["حوكمة حدود التطبيقات", "تسمح بتطبيقات مرتبطة داخل منتج واحد وتمنع خلط منتجات غير مرتبطة في فولدر واحد.", "`knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`"],
  ["حوكمة نطاق التنفيذ", "تربط التاسكات والتطبيقات ومسارات العمل والملفات المسموحة والأقفال وتوكنز التاسك.", "`knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`"],
  ["حوكمة التصميم", "تحول مصادر التصميم إلى مواصفات نصية وصفحات وعقود مكونات وفحوصات بصرية معتمدة.", "`knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`"],
  ["مساعد UI/UX", "يقترح أنماط الواجهة والمكونات وقوالب الصفحات وقواعد SEO/GEO وإرشاد الداشبورد والموبايل.", "`knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`"],
  ["ADR وتاريخ تشغيل AI", "يحفظ قرارات المعمارية وتشغيلات AI المقبولة أو المرفوضة خارج ذاكرة الشات.", "`knowledge/project_intelligence/`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`"],
  ["التحكم في تكلفة AI", "يتتبع الاستخدام والميزانيات وحزم السياق والتقدير المسبق وتوجيه الموديلات والهدر.", "`knowledge/ai_cost_control/`, `.kabeeri/ai_usage/`"],
  ["الداشبورد الحي", "يعرض الحالة التقنية والتجارية والحوكمة والتاسكات والتطبيقات والتكلفة والسياسات.", "`integrations/dashboard/`, `.kabeeri/dashboard/`"],
  ["GitHub Sync", "يخطط labels وmilestones وissues والإصدارات مع dry-run افتراضي وبوابات كتابة مؤكدة.", "`integrations/github_sync/`, `integrations/github/`"],
  ["Policy Gates", "تمنع التحقق أو الإصدار أو التسليم أو الأمن أو الهجرة أو كتابة GitHub بشكل غير آمن.", "`schemas/policy*.json`, `.kabeeri/policies/`"],
  ["التغليف والترقية", "يفحص جاهزية npm package وتوافق ترقية مساحات العمل.", "`docs/production/PACKAGING_GUIDE.md`, `docs/production/UPGRADE_GUIDE.md`"]
];

docs.ar.ui = {
  eyebrow: "توثيق Kabeeri VDF",
  beginner: "شرح مبسط",
  guide: "دليل المطور",
  steps: "خارطة الطريق المقترحة",
  checklist: "قائمة الجاهزية",
  commands: "أوامر CLI لهذه القدرة",
  details: "تفاصيل عميقة",
  mistakes: "سيناريوهات فشل شائعة",
  source: "مصدر الحقيقة",
  search: "ابحث في الدليل",
  filter: "تصفية",
  cliCommand: "الأمر",
  cliDescription: "الوصف"
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
    c("node bin/kvdf.js --help", "Show the complete local CLI surface available in this checkout.", "يعرض كل أوامر CLI المتاحة فعليًا في هذا الإصدار المحلي."),
    c("node bin/kvdf.js validate", "Validate repository assets, runtime JSON state, schemas, policies, prompt packs, and workspace health.", "يفحص ملفات النظام والحالة الحية والـ schemas والسياسات والحزم وصحة مساحة العمل."),
    c("node bin/kvdf.js structure map", "Show the repository organization map so the developer knows where every system area lives.", "يعرض خريطة تنظيم المستودع حتى يعرف المطور مكان كل منطقة في النظام."),
    c("node bin/kvdf.js dashboard state", "Print the live workspace state that powers the dashboard and resume flow.", "يعرض الحالة الحية التي يعتمد عليها الداشبورد واستكمال العمل.")
  ],
  "start-here": [
    c("node bin/kvdf.js validate", "Start by checking whether Kabeeri state and contracts are healthy.", "ابدأ بفحص صحة حالة كبيري والعقود قبل أي تنفيذ."),
    c("node bin/kvdf.js questionnaire plan \"Describe the app you want\"", "Generate the first focused question plan for a new or unclear product idea.", "ينشئ خطة أسئلة مركزة لأول فهم لفكرة التطبيق."),
    c("node bin/kvdf.js delivery recommend \"Describe the app you want\"", "Ask Kabeeri to recommend Agile or Structured delivery with reasons.", "يجعل كبيري يقترح Agile أو Structured مع الأسباب."),
    c("node bin/kvdf.js blueprint recommend \"Describe the app you want\"", "Map the idea to a known product blueprint such as ecommerce, CRM, POS, blog, or booking.", "يربط الفكرة بخريطة منتج معروفة مثل متجر أو CRM أو POS أو مدونة أو حجز."),
    c("node bin/kvdf.js task tracker --json", "Inspect current tasks as machine-readable state for AI and dashboard use.", "يعرض التاسكات بصيغة JSON مفيدة للذكاء الاصطناعي والداشبورد.")
  ],
  "install-profiles": [
    c("git clone <repo-url> kabeeri-vdf", "Download Kabeeri from GitHub into a local folder.", "يحمل كبيري من GitHub داخل فولدر محلي."),
    c("cd kabeeri-vdf", "Enter the cloned Kabeeri repository.", "يدخل إلى فولدر الريبو بعد التحميل."),
    c("npm install", "Install Node.js dependencies for the local Kabeeri checkout.", "يثبت اعتمادات Node.js للنسخة المحلية."),
    c("npm run kvdf -- --help", "Run the CLI before the `kvdf` binary is linked or installed.", "يشغل CLI قبل أن يصبح أمر `kvdf` مربوطًا أو مثبتًا."),
    c("npm run kvdf -- validate", "Validate the cloned repository and workspace state.", "يفحص الريبو وحالة مساحة العمل بعد التحميل."),
    c("kvdf docs open", "Open the live documentation site in the default browser.", "يفتح موقع الوثائق الحي في المتصفح الافتراضي."),
    c("npm run kvdf -- create --profile standard --output my-project", "Create a project from the recommended standard profile before direct `kvdf` is available.", "ينشئ مشروعًا ببروفايل standard قبل توفر `kvdf` مباشرة."),
    c("kvdf create --profile lite --output my-project", "Create the smallest practical starter project.", "ينشئ أصغر مشروع عملي للبدء."),
    c("kvdf create --profile standard --output my-project", "Create the recommended default project setup.", "ينشئ الإعداد الافتراضي الموصى به."),
    c("kvdf create --profile enterprise --output my-project", "Create the full governance-oriented project setup.", "ينشئ إعدادًا كاملًا للحوكمة والمشاريع الكبيرة.")
  ],
  "ai-with-kabeeri": [
    c("node bin/kvdf.js vibe \"Build an ecommerce store\"", "Turn natural language into governed suggested tasks instead of executing blindly.", "يحول الكلام الطبيعي إلى اقتراحات تاسكات محكومة بدل التنفيذ العشوائي."),
    c("node bin/kvdf.js docs serve --port auto --open", "Serve the Kabeeri documentation site locally and open it in the browser.", "يشغل موقع وثائق كبيري محليًا ويفتحه في المتصفح."),
    c("node bin/kvdf.js context-pack create --task task-001", "Create a compact AI context pack for one task to reduce token waste.", "ينشئ حزمة سياق صغيرة لتاسك واحد لتقليل استهلاك التوكنز."),
    c("node bin/kvdf.js prompt-pack compose react --task task-001", "Compose framework-aware instructions for AI using the task context.", "يركب تعليمات واعية بالفريمورك للذكاء الاصطناعي حسب التاسك."),
    c("node bin/kvdf.js session start --task task-001 --developer agent-001", "Start a governed AI session tied to a task and developer or AI agent.", "يبدأ جلسة AI محكومة ومربوطة بتاسك ومطور أو وكيل AI."),
    c("node bin/kvdf.js session end session-001 --input-tokens 1000 --output-tokens 500 --files src/example --summary \"Done\"", "Close the AI session with usage, touched files, summary, checks, and risks.", "ينهي جلسة AI مع تسجيل التوكنز والملفات والملخص والفحوصات والمخاطر.")
  ],
  "capabilities": [
    c("node bin/kvdf.js --help", "Discover every implemented command before documenting or using a capability.", "اكتشف كل أمر منفذ قبل توثيق أو استخدام أي قدرة."),
    c("node bin/kvdf.js capability list", "List the adaptive capability areas known to the questionnaire system.", "يعرض مناطق القدرات المعروفة لنظام الأسئلة."),
    c("node bin/kvdf.js capability show payments_billing", "Show one capability area and the questions or coverage related to it.", "يعرض قدرة واحدة والأسئلة أو التغطية المرتبطة بها."),
    c("node bin/kvdf.js capability map", "Print the capability map used by adaptive questionnaire coverage.", "يعرض خريطة القدرات المستخدمة في تغطية الأسئلة."),
    c("node bin/kvdf.js validate", "Confirm that the documented capabilities still match real runtime assets.", "يتأكد أن القدرات الموثقة ما زالت متوافقة مع الأصول الحقيقية.")
  ],
  "repository-layout": [
    c("node bin/kvdf.js structure map", "Print the Kabeeri folder map and current top-level groups.", "يعرض خريطة فولدرات كبيري والمجموعات الرئيسية."),
    c("node bin/kvdf.js structure map --json", "Print the same foldering map as JSON for automation or AI parsing.", "يعرض خريطة الفولدرات بصيغة JSON للأتمتة أو قراءة AI."),
    c("node bin/kvdf.js structure show standard_systems", "Show how a legacy or logical area maps into the new repository layout.", "يعرض كيف ترتبط منطقة منطقية أو قديمة بالتنظيم الجديد."),
    c("node bin/kvdf.js structure validate", "Validate the repository foldering map and root folder classification.", "يفحص صحة خريطة تنظيم المستودع وتصنيف الجذور."),
    c("node bin/kvdf.js validate foldering", "Run the foldering-specific validation path.", "يشغل فحص تنظيم الفولدرات تحديدًا.")
  ],
  "new-project": [
    c("node bin/kvdf.js init --profile standard --mode agile", "Initialize a standard Kabeeri workspace for a new Agile product.", "ينشئ مساحة عمل قياسية لمشروع جديد بنمط Agile."),
    c("node bin/kvdf.js init --profile standard --mode structured", "Initialize a standard workspace for a more planned Structured product.", "ينشئ مساحة عمل قياسية لمشروع يحتاج Structured."),
    c("node bin/kvdf.js dashboard generate", "Generate dashboard state after workspace initialization.", "يولد حالة الداشبورد بعد إنشاء مساحة العمل."),
    c("node bin/kvdf.js vibe \"I want to build an ecommerce store\"", "Start from natural language and let Kabeeri create reviewable suggested work.", "يبدأ من كلام طبيعي ويجعل كبيري يقترح عمل قابل للمراجعة."),
    c("node bin/kvdf.js owner status", "Check whether Owner auth is configured and whether a session is active.", "يفحص حالة المالك وهل توجد جلسة مالك نشطة."),
    c("node bin/kvdf.js questionnaire plan \"Build an ecommerce store\"", "Generate the first focused project-intake questions.", "ينشئ أول أسئلة مركزة لفهم المشروع."),
    c("node bin/kvdf.js blueprint recommend \"Build an ecommerce store\"", "Choose the closest market product blueprint.", "يقترح أقرب خريطة منتج من أنظمة السوق."),
    c("node bin/kvdf.js data-design context ecommerce", "Create database design context from the selected product blueprint.", "ينشئ سياق تصميم قاعدة البيانات من خريطة المنتج."),
    c("node bin/kvdf.js design recommend ecommerce", "Recommend UI/UX patterns and page/component groups.", "يقترح نمط الواجهة والصفحات والمكونات."),
    c("node bin/kvdf.js prompt-pack list", "List available framework prompt packs before implementation.", "يعرض حزم البرومبت المتاحة قبل التنفيذ.")
  ],
  "existing-kabeeri-project": [
    c("node bin/kvdf.js validate", "Check existing workspace health before continuing work.", "يفحص صحة مساحة العمل الحالية قبل الاستكمال."),
    c("node bin/kvdf.js dashboard state", "Read current live project status.", "يعرض حالة المشروع الحية."),
    c("node bin/kvdf.js task tracker --json", "Read task board state for continuation and AI context.", "يعرض حالة التاسكات للاستكمال وسياق AI."),
    c("node bin/kvdf.js capture list", "Show post-work captures that may need review or conversion to tasks.", "يعرض الالتقاطات بعد العمل التي قد تحتاج مراجعة أو تحويل لتاسكات."),
    c("node bin/kvdf.js policy status", "Show the latest policy results and blockers.", "يعرض آخر نتائج السياسات والموانع.")
  ],
  "existing-non-kabeeri-project": [
    c("node bin/kvdf.js init --profile standard --mode structured", "Create Kabeeri state around an existing project with a controlled adoption mode.", "ينشئ حالة كبيري حول مشروع قائم بنمط اعتماد منظم."),
    c("node bin/kvdf.js project analyze --path .", "Inspect the existing app folder, detect stacks, app boundaries, workstreams, and adoption risks.", "يحلل فولدر التطبيق القائم ويكتشف الفريموركات وحدود التطبيقات ومسارات العمل والمخاطر."),
    c("node bin/kvdf.js project analyze --path . --json", "Return the adoption analysis in JSON for AI or dashboard consumption.", "يعرض تحليل المشروع القائم بصيغة JSON للذكاء الاصطناعي أو الداشبورد."),
    c("node bin/kvdf.js app list", "List registered customer apps after adoption mapping.", "يعرض التطبيقات المسجلة بعد ربط المشروع."),
    c("node bin/kvdf.js workstream list", "List workstreams used to govern the adopted codebase.", "يعرض مسارات العمل التي تحكم الكود القائم."),
    c("node bin/kvdf.js adr list", "Review architecture decisions captured during adoption.", "يعرض قرارات المعمارية المسجلة أثناء الاعتماد.")
  ],
  "delivery-mode": [
    c("node bin/kvdf.js delivery recommend \"Describe the project\"", "Score Agile vs Structured and return rationale and next actions.", "يقارن Agile وStructured ويرجع الأسباب والخطوات التالية."),
    c("node bin/kvdf.js delivery recommend \"Describe the project\" --json", "Return the delivery recommendation as JSON for automation.", "يعرض توصية نمط التسليم بصيغة JSON للأتمتة."),
    c("node bin/kvdf.js delivery choose agile --reason \"MVP discovery\"", "Record the Owner/developer decision to use Agile.", "يسجل قرار استخدام Agile مع السبب."),
    c("node bin/kvdf.js delivery choose structured --reason \"Known compliant scope\"", "Record the decision to use Structured delivery.", "يسجل قرار استخدام Structured مع السبب."),
    c("node bin/kvdf.js delivery history", "Show previous recommendations and delivery decisions.", "يعرض تاريخ التوصيات وقرارات نمط التسليم.")
  ],
  "agile-delivery": [
    c("node bin/kvdf.js agile summary", "Show Agile runtime state: backlog, epics, stories, sprints, and reviews.", "يعرض حالة Agile: الباك لوج والإبيكس والستوريز والاسبرنتات والمراجعات."),
    c("node bin/kvdf.js agile backlog add --id BL-001 --title \"Checkout MVP\" --type epic --priority high --source \"vision\"", "Add a backlog item with priority and source provenance.", "يضيف عنصر باك لوج مع الأولوية والمصدر."),
    c("node bin/kvdf.js agile epic create --id epic-checkout --title \"Checkout\" --goal \"Customers can place orders\" --users customer --source \"vision\"", "Create an Agile epic with goal, users, and source.", "ينشئ epic بهدف ومستخدمين ومصدر."),
    c("node bin/kvdf.js agile story create --id story-checkout-001 --epic epic-checkout --title \"Cart checkout\" --role customer --want \"pay\" --value \"complete order\" --points 5 --workstream backend --acceptance \"Order is created\" --reviewer owner-001", "Create a user story with role, value, points, workstream, acceptance, and reviewer.", "ينشئ user story بدور وقيمة ونقاط ومسار عمل ومعايير قبول ومراجع."),
    c("node bin/kvdf.js agile story ready story-checkout-001", "Mark a story ready when it has enough detail.", "يحول الستوري إلى جاهزة عندما تكتمل تفاصيلها."),
    c("node bin/kvdf.js agile story task story-checkout-001 --task task-001", "Link an Agile story to a governed Kabeeri task.", "يربط الستوري بتاسك محكوم في كبيري."),
    c("node bin/kvdf.js agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10 --goal \"Checkout foundation\"", "Plan a sprint from ready stories and capacity.", "يخطط اسبرنت من ستوريز جاهزة وسعة محددة."),
    c("node bin/kvdf.js agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted", "Record sprint review and accepted stories.", "يسجل مراجعة الاسبرنت والستوريز المقبولة."),
    c("node bin/kvdf.js validate agile", "Validate Agile runtime consistency.", "يفحص اتساق حالة Agile.")
  ],
  "structured-delivery": [
    c("node bin/kvdf.js structured health", "Show Structured delivery health and unresolved issues.", "يعرض صحة Structured والمشاكل المفتوحة."),
    c("node bin/kvdf.js structured requirement add --id REQ-001 --title \"Email login\" --source questionnaire --acceptance \"User can login\"", "Add a requirement with source and acceptance criteria.", "يضيف متطلبًا بمصدر ومعايير قبول."),
    c("node bin/kvdf.js structured requirement approve REQ-001 --reason \"Owner reviewed\"", "Approve a requirement before implementation planning.", "يعتمد المتطلب قبل تخطيط التنفيذ."),
    c("node bin/kvdf.js structured phase plan phase-001 --requirements REQ-001 --goal \"Authentication foundation\"", "Plan a phase around approved requirements.", "يخطط مرحلة بناءً على متطلبات معتمدة."),
    c("node bin/kvdf.js structured task REQ-001 --task task-001", "Trace a requirement to a governed implementation task.", "يربط المتطلب بتاسك تنفيذ محكوم."),
    c("node bin/kvdf.js structured deliverable add --id deliv-001 --phase phase-001 --title \"Authentication specification\" --acceptance \"Owner approved\"", "Add a phase deliverable with acceptance criteria.", "يضيف مخرج مرحلة بمعايير قبول."),
    c("node bin/kvdf.js structured gate check phase-001", "Check whether a phase can pass its gate.", "يفحص هل المرحلة يمكنها عبور البوابة."),
    c("node bin/kvdf.js validate structured", "Validate Structured runtime consistency.", "يفحص اتساق حالة Structured.")
  ],
  "questionnaire-engine": [
    c("node bin/kvdf.js questionnaire list", "List questionnaire groups and available sources.", "يعرض مجموعات الأسئلة والمصادر المتاحة."),
    c("node bin/kvdf.js questionnaire flow", "Show the questionnaire flow and activation logic.", "يعرض تدفق الأسئلة ومنطق التفعيل."),
    c("node bin/kvdf.js questionnaire plan \"Build CRM\"", "Generate an adaptive intake plan from the product description.", "ينشئ خطة أسئلة تكيفية من وصف المنتج."),
    c("node bin/kvdf.js questionnaire answer entry.project_type --value saas", "Record one questionnaire answer into local runtime state.", "يسجل إجابة واحدة في حالة كبيري."),
    c("node bin/kvdf.js questionnaire coverage", "Generate the coverage matrix showing answered and missing areas.", "ينشئ مصفوفة التغطية للمناطق المجابة والناقصة."),
    c("node bin/kvdf.js questionnaire missing", "Write a missing-answers report for the next session.", "ينشئ تقرير الإجابات الناقصة للجلسة التالية."),
    c("node bin/kvdf.js questionnaire generate-tasks", "Generate proposed tasks from questionnaire gaps and answers.", "يولد تاسكات مقترحة من الإجابات والفجوات."),
    c("node bin/kvdf.js validate questionnaire", "Validate questionnaire runtime records.", "يفحص سجلات نظام الأسئلة.")
  ],
  "product-blueprints": [
    c("node bin/kvdf.js blueprint list", "List all available market product blueprints.", "يعرض كل خرائط المنتجات المتاحة."),
    c("node bin/kvdf.js blueprint show ecommerce", "Show one blueprint with channels, modules, pages, entities, and risks.", "يعرض خريطة منتج واحدة بالقنوات والموديولات والصفحات والكيانات والمخاطر."),
    c("node bin/kvdf.js blueprint recommend \"Build ecommerce store with payments\"", "Recommend the closest blueprint from natural language.", "يقترح أقرب خريطة منتج من الوصف الطبيعي."),
    c("node bin/kvdf.js blueprint select ecommerce --delivery structured --reason \"Large catalog\"", "Record the selected blueprint and delivery preference.", "يسجل خريطة المنتج المختارة ونمط التسليم."),
    c("node bin/kvdf.js blueprint context ecommerce --json", "Export compact AI-ready context for one product blueprint.", "يصدر سياقًا مختصرًا جاهزًا للذكاء الاصطناعي لخريطة منتج."),
    c("node bin/kvdf.js blueprint history", "Show previous blueprint recommendations and selections.", "يعرض تاريخ توصيات واختيارات خرائط المنتجات.")
  ],
  "data-design": [
    c("node bin/kvdf.js data-design principles", "List database design principles used by Kabeeri.", "يعرض مبادئ تصميم قواعد البيانات في كبيري."),
    c("node bin/kvdf.js data-design principle workflow_first", "Show one principle in detail.", "يعرض مبدأ واحد بالتفصيل."),
    c("node bin/kvdf.js data-design modules", "List data modules such as core, commerce, inventory, CMS, mobile, and accounting.", "يعرض موديولات البيانات مثل core وcommerce وinventory وCMS وmobile وaccounting."),
    c("node bin/kvdf.js data-design module commerce", "Show entities and rules for one data module.", "يعرض كيانات وقواعد موديول بيانات واحد."),
    c("node bin/kvdf.js data-design context ecommerce --json", "Generate database context for a product blueprint.", "ينشئ سياق قاعدة بيانات لخريطة منتج."),
    c("node bin/kvdf.js data-design recommend \"Build ecommerce store with payments inventory mobile app\" --json", "Recommend database modules and risk flags from a product description.", "يقترح موديولات قاعدة البيانات والمخاطر من وصف المنتج."),
    c("node bin/kvdf.js data-design checklist", "Print the database approval checklist.", "يعرض قائمة قبول تصميم قاعدة البيانات."),
    c("node bin/kvdf.js data-design review \"orders table with price float and items json\"", "Review a proposed design for common modeling problems.", "يراجع تصميمًا مقترحًا لاكتشاف مشاكل النمذجة الشائعة."),
    c("node bin/kvdf.js data-design history", "Show generated data-design contexts and recommendations.", "يعرض تاريخ سياقات وتوصيات تصميم البيانات.")
  ],
  "ui-ux-advisor": [
    c("node bin/kvdf.js design recommend ecommerce --json", "Recommend UI/UX pattern, components, templates, and SEO rules for ecommerce.", "يقترح نمط UI/UX ومكونات وقوالب وقواعد SEO للمتجر."),
    c("node bin/kvdf.js design recommend news_website --json", "Recommend interface structure for a news website.", "يقترح بنية واجهة موقع أخبار."),
    c("node bin/kvdf.js design recommend erp --json", "Recommend data-dense dashboard patterns for ERP-like products.", "يقترح أنماط داشبورد كثيفة البيانات لأنظمة ERP."),
    c("node bin/kvdf.js design ui-checklist", "Print the UI/UX approval checklist.", "يعرض قائمة قبول UI/UX."),
    c("node bin/kvdf.js design ui-review \"Describe the page\"", "Review a UI proposal for semantic HTML, responsiveness, states, accessibility, and SEO/GEO.", "يراجع اقتراح واجهة من ناحية الدلالة والتجاوب والحالات والوصول وSEO/GEO."),
    c("node bin/kvdf.js design ui-history", "Show prior UI advisor recommendations and reviews.", "يعرض تاريخ توصيات ومراجعات مساعد UI."),
    c("node bin/kvdf.js validate ui-design", "Validate UI design advisor runtime state.", "يفحص حالة مساعد تصميم الواجهات.")
  ],
  "ui-ux-reference-library": [
    c("kvdf design reference-list", "List approved UI/UX reference patterns.", "يعرض نماذج UI/UX المرجعية المعتمدة."),
    c("kvdf design reference-show ADMIT-ADB01", "Show one reference pattern, components, rules, states, and source file.", "يعرض نموذجًا مرجعيًا بكل مكوناته وقواعده وحالاته."),
    c("kvdf design reference-recommend \"admin ecommerce dashboard with orders and revenue\"", "Recommend the best reference pattern from a short project brief.", "يقترح أفضل نموذج مرجعي من وصف مختصر للمشروع."),
    c("kvdf design reference-questions ADMIT-ADB02", "Generate UI/UX discovery questions from a chosen reference.", "ينشئ أسئلة تصميم واجهات من نموذج مختار."),
    c("kvdf design reference-tasks ADMIT-ADB02 --scope \"ecommerce admin dashboard\"", "Create governed design-system, page-spec, component-contract, and QA tasks from the reference.", "ينشئ تاسكات حوكمة للتصميم والمواصفات والمكونات والجودة من المرجع.")
  ],
  "vibe-first": [
    c("node bin/kvdf.js vibe \"Add checkout\"", "Classify a natural-language request and create a suggested task card.", "يصنف طلبًا طبيعيًا وينشئ كارت تاسك مقترح."),
    c("node bin/kvdf.js vibe suggest \"Add checkout API\"", "Explicitly create a suggested task from text.", "ينشئ تاسك مقترح من النص بشكل صريح."),
    c("node bin/kvdf.js ask \"Improve the dashboard\"", "Handle a vague request safely by asking or suggesting smaller work.", "يتعامل مع طلب غامض بسؤال أو اقتراح عمل أصغر."),
    c("node bin/kvdf.js vibe list", "List suggested Vibe tasks.", "يعرض اقتراحات Vibe."),
    c("node bin/kvdf.js vibe show suggestion-001", "Show one suggestion card.", "يعرض كارت اقتراح واحد."),
    c("node bin/kvdf.js vibe convert suggestion-001", "Convert an approved suggestion into a governed task.", "يحول اقتراحًا معتمدًا إلى تاسك محكوم."),
    c("node bin/kvdf.js vibe reject suggestion-001 --reason \"Too broad\"", "Reject an unsafe or too broad suggestion.", "يرفض اقتراحًا واسعًا أو غير آمن."),
    c("node bin/kvdf.js vibe plan \"Build an ecommerce store\"", "Split a larger natural request into safer suggested cards.", "يقسم طلبًا كبيرًا إلى كروت اقتراح أصغر."),
    c("node bin/kvdf.js vibe session start --title \"Planning\"", "Start a Vibe planning session.", "يبدأ جلسة تخطيط Vibe."),
    c("node bin/kvdf.js vibe brief", "Generate a compact brief for resuming the next session.", "ينشئ ملخصًا صغيرًا لاستكمال الجلسة التالية."),
    c("node bin/kvdf.js capture scan --summary \"Updated filters\" --files src/cli/index.js", "Preview post-work classification, task matches, missing evidence, and next action without writing a record.", "يعرض تصنيف عمل post-work والتاسكات القريبة والأدلة الناقصة دون تسجيل."),
    c("node bin/kvdf.js capture --summary \"Updated filters\" --files src/cli/index.js --checks \"npm test\"", "Record post-work changes that happened outside a planned task.", "يسجل تغييرات تمت بعد العمل أو خارج تاسك مخطط."),
    c("node bin/kvdf.js capture evidence capture-001 --checks \"npm test\" --evidence \"manual review\"", "Attach checks and acceptance evidence before resolving the capture.", "يضيف الفحوصات ودليل القبول قبل إغلاق الالتقاط."),
    c("node bin/kvdf.js capture reject capture-001 --reason \"Exploration will not continue\"", "Reject a capture that should not become governed work.", "يرفض الالتقاط إذا لن يتحول إلى عمل محكوم."),
    c("node bin/kvdf.js validate capture", "Validate post-work capture records.", "يفحص سجلات post-work capture.")
  ],
  "wordpress-development": [
    c("kvdf wordpress analyze --path . --staging --backup", "Analyze an existing WordPress site and record plugins, themes, WooCommerce signals, risks, forbidden paths, and next actions.", "يحلل موقع WordPress قائم ويسجل plugins وthemes وإشارات WooCommerce والمخاطر والمسارات الممنوعة والخطوات التالية."),
    c("kvdf wordpress plan \"Build a WordPress company website\" --type corporate --mode new", "Create a governed plan for a new WordPress corporate website.", "ينشئ خطة محكومة لموقع WordPress شركة جديد."),
    c("kvdf wordpress plan \"Improve existing WooCommerce checkout\" --type woocommerce --mode existing", "Create an adoption/improvement plan for an existing WooCommerce site.", "ينشئ خطة اعتماد أو تطوير لمتجر WooCommerce قائم."),
    c("kvdf wordpress tasks", "Create governed tasks from the latest WordPress plan.", "ينشئ تاسكات محكومة من آخر خطة WordPress."),
    c("kvdf wordpress scaffold plugin --name \"Business Features\"", "Create a safe custom plugin skeleton under wp-content/plugins.", "ينشئ plugin آمن داخل wp-content/plugins."),
    c("kvdf wordpress scaffold theme --name \"Company Theme\"", "Create a safe custom theme skeleton under wp-content/themes.", "ينشئ theme آمن داخل wp-content/themes."),
    c("kvdf wordpress scaffold child-theme --name \"Company Child\" --parent twentytwentyfour", "Create a child theme skeleton for scoped visual changes.", "ينشئ child theme لتعديلات الواجهة ضمن نطاق آمن."),
    c("kvdf wordpress checklist woocommerce", "Print the WordPress/WooCommerce acceptance checklist.", "يعرض قائمة قبول WordPress/WooCommerce."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose the WordPress prompt pack for one governed task.", "يركب WordPress prompt pack لتاسك محكوم واحد.")
  ],
  "wordpress-plugins": [
    c("kvdf wordpress plugin plan \"Build a clinic booking plugin\" --name \"Clinic Booking\" --type booking", "Create a governed plugin plan for a booking plugin.", "ينشئ خطة محكومة لإضافة حجوزات."),
    c("kvdf wordpress plugin plan \"Create a WooCommerce checkout add-on\" --name \"Checkout Addon\" --type woocommerce", "Create a governed plugin plan for a WooCommerce extension.", "ينشئ خطة محكومة لإضافة WooCommerce."),
    c("kvdf wordpress plugin scaffold --name \"Clinic Booking\"", "Create the plugin folder, bootstrap file, admin/public classes, assets, uninstall file, and README.", "ينشئ فولدر الإضافة وملف التشغيل وadmin/public classes وassets وuninstall وREADME."),
    c("kvdf wordpress plugin tasks", "Create scoped tasks from the latest plugin plan.", "ينشئ تاسكات محددة النطاق من آخر خطة plugin."),
    c("kvdf wordpress plugin tasks --plan wordpress-plugin-plan-001 --json", "Create scoped tasks from a selected plugin plan and return JSON.", "ينشئ تاسكات من خطة plugin محددة ويعرض JSON."),
    c("kvdf wordpress plugin checklist", "Print the WordPress plugin acceptance checklist.", "يعرض قائمة قبول تطوير إضافات WordPress."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose WordPress implementation prompts for the selected governed task.", "يركب برومبتات WordPress لتاسك محكوم.")
  ],
  "task-governance": [
    c("node bin/kvdf.js task create --title \"Add API\" --sprint sprint-001", "Create a governed task with title and optional sprint.", "ينشئ تاسك محكوم بعنوان واسبرنت اختياري."),
    c("node bin/kvdf.js task create --title \"Integration\" --type integration --workstreams backend,public_frontend", "Create a task that intentionally spans multiple workstreams.", "ينشئ تاسك تكامل يمتد عمدًا لأكثر من مسار عمل."),
    c("node bin/kvdf.js task list", "List governed tasks.", "يعرض التاسكات."),
    c("node bin/kvdf.js task status --id task-001", "Show current status and details for a task.", "يعرض حالة وتفاصيل تاسك."),
    c("node bin/kvdf.js task assign task-001 --assignee agent-001", "Assign a task to a developer or AI agent.", "يسند تاسك لمطور أو وكيل AI."),
    c("node bin/kvdf.js task start task-001 --actor agent-001", "Move a task into active execution.", "ينقل التاسك إلى التنفيذ."),
    c("node bin/kvdf.js task review task-001 --actor reviewer-001", "Move a task into review.", "ينقل التاسك إلى المراجعة."),
    c("node bin/kvdf.js task verify task-001 --owner owner-001", "Owner-verify a completed task when evidence is ready.", "يتحقق المالك من تاسك مكتمل عند وجود الدليل."),
    c("node bin/kvdf.js task reject task-001", "Reject a task that fails review or verification.", "يرفض تاسك فشل في المراجعة أو التحقق."),
    c("node bin/kvdf.js validate task", "Validate task state and governance rules.", "يفحص حالة التاسكات وقواعد حوكمتها.")
  ],
  "app-boundary": [
    c("node bin/kvdf.js app create --username backend-api --name \"Laravel API\" --type backend --path apps/api-laravel --product \"Store\"", "Register a backend app as part of a product workspace.", "يسجل تطبيق باك إند داخل مساحة منتج."),
    c("node bin/kvdf.js app create --username storefront --name \"React Storefront\" --type frontend --path apps/storefront-react --product \"Store\"", "Register a frontend app in the same product boundary.", "يسجل تطبيق فرونت إند داخل نفس حدود المنتج."),
    c("node bin/kvdf.js app list", "List registered apps in the current workspace.", "يعرض التطبيقات المسجلة في مساحة العمل."),
    c("node bin/kvdf.js app show storefront", "Show one app boundary record.", "يعرض سجل حدود تطبيق واحد."),
    c("node bin/kvdf.js app status storefront --status ready_to_publish --workstreams public_frontend", "Update app readiness and associated workstreams.", "يحدث جاهزية التطبيق ومسارات العمل المرتبطة."),
    c("node bin/kvdf.js task create --title \"Wire API to storefront\" --type integration --apps backend-api,storefront --workstreams backend,public_frontend", "Create a cross-app integration task only when related apps belong to the same product.", "ينشئ تاسك تكامل بين تطبيقات مرتبطة داخل نفس المنتج."),
    c("node bin/kvdf.js validate routes", "Validate customer app route safety and app boundary rules.", "يفحص أمان روابط التطبيقات وحدودها.")
  ],
  "workstreams-scope": [
    c("node bin/kvdf.js workstream list", "List workstream boundaries.", "يعرض حدود مسارات العمل."),
    c("node bin/kvdf.js workstream show backend", "Show paths and review rules for one workstream.", "يعرض المسارات وقواعد المراجعة لمسار عمل."),
    c("node bin/kvdf.js workstream add --id payments --name \"Payments\" --paths src/payments,app/Payments --review security,contract_safety", "Add a new workstream with paths and review gates.", "يضيف مسار عمل جديد بمسارات وقواعد مراجعة."),
    c("node bin/kvdf.js workstream update backend --paths src/api,app/Http,routes/api.php", "Update allowed paths for an existing workstream.", "يحدث المسارات المسموحة لمسار عمل قائم."),
    c("node bin/kvdf.js token issue --task task-001 --assignee agent-001", "Issue a scoped task access token derived from task/workstream/app boundaries.", "يصدر توكن وصول مضبوط حسب حدود التاسك والمسار والتطبيق."),
    c("node bin/kvdf.js lock create --type folder --scope src/api --task task-001 --owner agent-001", "Create a lock to prevent overlapping edits.", "ينشئ قفلًا لمنع تعديلات متداخلة."),
    c("node bin/kvdf.js validate workstream", "Validate workstreams, assignments, and scope rules.", "يفحص مسارات العمل والإسناد والنطاق.")
  ],
  "prompt-packs": [
    c("node bin/kvdf.js prompt-pack list", "List all available framework prompt packs.", "يعرض كل حزم البرومبت المتاحة."),
    c("node bin/kvdf.js prompt-pack show laravel", "Show a specific stack prompt pack.", "يعرض حزمة برومبت لفريمورك معين."),
    c("node bin/kvdf.js prompt-pack common", "Show common prompt layer instructions applied before stack-specific prompts.", "يعرض طبقة البرومبت المشتركة قبل برومبت الفريمورك."),
    c("node bin/kvdf.js prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react", "Export a prompt pack into a project folder.", "يصدر حزمة برومبت داخل فولدر مشروع."),
    c("node bin/kvdf.js prompt-pack use react", "Install or copy a prompt pack into the default project prompt location.", "ينسخ حزمة برومبت إلى المكان الافتراضي داخل المشروع."),
    c("node bin/kvdf.js prompt-pack compose react --task task-001", "Compose a task-aware prompt with common and framework-specific rules.", "يركب برومبت واعي بالتاسك مع القواعد المشتركة وقواعد الفريمورك."),
    c("node bin/kvdf.js prompt-pack compositions", "List composed prompts created for tasks.", "يعرض البرومبتات المركبة للتاسكات."),
    c("node bin/kvdf.js prompt-pack validate react", "Validate one prompt pack manifest and files.", "يفحص حزمة برومبت واحدة.")
  ],
  "dashboard-monitoring": [
    c("node bin/kvdf.js dashboard generate", "Generate dashboard JSON and derived state from `.kabeeri`.", "يولد JSON وحالة الداشبورد من `.kabeeri`."),
    c("node bin/kvdf.js dashboard state", "Print full live state used by the dashboard API.", "يعرض الحالة الحية الكاملة التي يستخدمها API الداشبورد."),
    c("node bin/kvdf.js dashboard task-tracker", "Print the focused task tracker JSON.", "يعرض JSON لوحة تتبع التاسكات."),
    c("node bin/kvdf.js dashboard export", "Export static customer page and private dashboard HTML.", "يصدر صفحة العميل والداشبورد الخاص كـ HTML ثابت."),
    c("node bin/kvdf.js dashboard ux", "Run Dashboard UX Governance audit.", "يشغل تدقيق حوكمة تجربة الداشبورد."),
    c("node bin/kvdf.js dashboard serve --port auto", "Serve the live dashboard and API locally on an available port.", "يشغل الداشبورد الحي وAPI محليًا على بورت متاح."),
    c("node bin/kvdf.js dashboard workspace add --path ../store-a --name \"Store A\"", "Register another KVDF workspace as a linked dashboard summary.", "يسجل مساحة عمل كبيري أخرى كملخص مرتبط في الداشبورد."),
    c("node bin/kvdf.js reports live", "Write compact live report JSON for dashboards and automation.", "يكتب تقريرًا حيًا مختصرًا للداشبورد والأتمتة.")
  ],
  "ai-cost-control": [
    c("node bin/kvdf.js pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1 --currency USD", "Set model pricing rules for automatic cost calculation.", "يضبط قواعد تسعير الموديل لحساب التكلفة تلقائيًا."),
    c("node bin/kvdf.js pricing list", "List pricing rules.", "يعرض قواعد التسعير."),
    c("node bin/kvdf.js usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --workstream backend", "Record AI usage for a governed task.", "يسجل استهلاك AI لتاسك محكوم."),
    c("node bin/kvdf.js usage record --untracked --input-tokens 1000 --output-tokens 500 --cost 0.25 --source ad-hoc-prompt", "Record untracked/ad-hoc usage so it is not invisible.", "يسجل استهلاكًا عشوائيًا حتى لا يختفي من الحساب."),
    c("node bin/kvdf.js usage summary", "Show aggregated token and cost summary.", "يعرض ملخص التوكنز والتكلفة."),
    c("node bin/kvdf.js usage efficiency", "Show accepted, rejected, rework, and waste efficiency signals.", "يعرض إشارات كفاءة المخرجات المقبولة والمرفوضة والهدر."),
    c("node bin/kvdf.js budget approve --task task-001 --tokens 5000 --reason \"Owner approved extra work\"", "Approve a token budget overrun for a task.", "يعتمد تجاوز ميزانية توكنز لتاسك."),
    c("node bin/kvdf.js preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4", "Estimate token/cost/risk before sending context to AI.", "يقدر التوكنز والتكلفة والمخاطر قبل إرسال السياق لـ AI."),
    c("node bin/kvdf.js model-route recommend --kind implementation --risk medium", "Recommend cheap, balanced, premium, or human-only model routing.", "يقترح توجيه الموديل: رخيص أو متوازن أو قوي أو بشري فقط.")
  ],
  "multi-ai-governance": [
    c("node bin/kvdf.js owner init --id owner-001 --name \"Project Owner\"", "Create the single Owner identity.", "ينشئ هوية المالك الوحيد."),
    c("node bin/kvdf.js owner login --id owner-001", "Start an Owner session for protected operations.", "يبدأ جلسة مالك للعمليات المحمية."),
    c("node bin/kvdf.js developer solo --id dev-main --name \"Main Developer\"", "Configure one developer as full-stack across standard workstreams.", "يضبط مطورًا واحدًا كـ full-stack على المسارات القياسية."),
    c("node bin/kvdf.js developer add --id dev-001 --name \"Backend Dev\" --role Developer", "Add a human developer identity.", "يضيف هوية مطور بشري."),
    c("node bin/kvdf.js agent add --id agent-001 --name \"AI Backend Agent\" --role \"AI Developer\" --workstreams backend", "Add an AI agent identity with workstream limits.", "يضيف وكيل AI بحدود مسارات عمل."),
    c("node bin/kvdf.js token issue --task task-001 --assignee agent-001", "Issue a scoped token for one assignee and task.", "يصدر توكنًا محددًا لمكلف واحد وتاسك واحد."),
    c("node bin/kvdf.js lock list", "Show active locks.", "يعرض الأقفال النشطة."),
    c("node bin/kvdf.js session start --task task-001 --developer agent-001", "Start a governed execution session.", "يبدأ جلسة تنفيذ محكومة."),
    c("node bin/kvdf.js validate business", "Validate business feature and journey state.", "يفحص حالة الميزات والرحلات التجارية.")
  ],
  "github-release": [
    c("node bin/kvdf.js github config set --repo owner/repo --branch main --default-version v4.0.0", "Store local GitHub sync configuration.", "يسجل إعداد مزامنة GitHub محليًا."),
    c("node bin/kvdf.js github config show", "Show current GitHub sync configuration.", "يعرض إعداد GitHub الحالي."),
    c("node bin/kvdf.js github plan --version v4.0.0 --dry-run", "Preview GitHub sync work without writing to GitHub.", "يعرض خطة GitHub دون كتابة فعلية."),
    c("node bin/kvdf.js github label sync --version v4.0.0 --dry-run", "Preview label sync.", "يعرض مزامنة الليبلز دون تنفيذ."),
    c("node bin/kvdf.js github milestone sync --version v4.0.0 --dry-run", "Preview milestone sync.", "يعرض مزامنة milestones دون تنفيذ."),
    c("node bin/kvdf.js github issue sync --version v4.0.0 --dry-run", "Preview issue sync.", "يعرض مزامنة issues دون تنفيذ."),
    c("node bin/kvdf.js release check --version v4.0.0 --strict", "Run strict release readiness checks.", "يشغل فحص جاهزية الإصدار بصرامة."),
    c("node bin/kvdf.js release gate --version v4.0.0", "Evaluate release policy gate.", "يقيم بوابة سياسة الإصدار."),
    c("node bin/kvdf.js release publish-gate --version v4.0.0", "Evaluate release plus GitHub write gates before publish.", "يقيم بوابة الإصدار وبوابة كتابة GitHub قبل النشر."),
    c("node bin/kvdf.js release notes --version v4.0.0 --output RELEASE_NOTES.md", "Generate release notes.", "يولد ملاحظات الإصدار."),
    c("node bin/kvdf.js release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md", "Generate release checklist.", "يولد قائمة تحقق الإصدار.")
  ],
  "practical-examples": [
    c("node bin/kvdf.js blueprint recommend \"Build a supermarket POS\"", "Start practical examples by mapping the product type.", "ابدأ الأمثلة العملية بربط نوع المنتج بخريطة مناسبة."),
    c("node bin/kvdf.js questionnaire plan \"Build a dental clinic booking system\"", "Generate questions for the selected example.", "ينشئ أسئلة المثال المختار."),
    c("node bin/kvdf.js data-design context ecommerce", "Generate database context for the example.", "ينشئ سياق قاعدة البيانات للمثال."),
    c("node bin/kvdf.js design recommend ecommerce", "Generate UI/UX direction for the example.", "ينشئ اتجاه الواجهة وتجربة المستخدم للمثال."),
    c("node bin/kvdf.js prompt-pack compose react-native-expo --task task-mobile-001", "Compose a mobile task prompt for the ecommerce mobile app example.", "يركب برومبت تاسك موبايل لتطبيق المتجر."),
    c("node bin/kvdf.js handoff package --id client-handoff --audience client", "Generate a client handoff package after work is ready.", "ينشئ حزمة تسليم للعميل بعد الجاهزية.")
  ],
  "example-wordpress-digital-agency": [
    c("kvdf wordpress plan \"Build a WordPress digital marketing agency website with services blog case studies and lead forms\" --type corporate --mode new", "Create the governed WordPress site plan.", "ينشئ خطة موقع WordPress محكومة."),
    c("kvdf wordpress tasks", "Create governed tasks for the WordPress site plan.", "ينشئ تاسكات محكومة لخطة موقع WordPress."),
    c("kvdf wordpress plugin plan \"Manage digital agency customers and contacts\" --name \"Agency Customers\" --type business", "Plan the customers management plugin.", "يخطط إضافة إدارة العملاء."),
    c("kvdf wordpress plugin scaffold --name \"Agency Customers\"", "Scaffold the customers plugin folder.", "ينشئ هيكل إضافة العملاء."),
    c("kvdf wordpress plugin plan \"Manage service requests from public WordPress forms\" --name \"Agency Service Requests\" --type business", "Plan the service requests plugin.", "يخطط إضافة طلبات الخدمات."),
    c("kvdf wordpress plugin scaffold --name \"Agency Service Requests\"", "Scaffold the service requests plugin folder.", "ينشئ هيكل إضافة طلبات الخدمات."),
    c("kvdf wordpress plugin plan \"Manage invoices for agency services retainers and campaigns\" --name \"Agency Invoices\" --type business", "Plan the invoices plugin.", "يخطط إضافة الفواتير."),
    c("kvdf wordpress plugin scaffold --name \"Agency Invoices\"", "Scaffold the invoices plugin folder.", "ينشئ هيكل إضافة الفواتير."),
    c("kvdf wordpress plugin plan \"Manage agency accounts balances and account notes\" --name \"Agency Accounts\" --type business", "Plan the accounts plugin.", "يخطط إضافة الحسابات."),
    c("kvdf wordpress plugin scaffold --name \"Agency Accounts\"", "Scaffold the accounts plugin folder.", "ينشئ هيكل إضافة الحسابات."),
    c("kvdf prompt-pack compose wordpress --task task-001", "Compose WordPress AI instructions for one governed implementation task.", "يركب تعليمات WordPress لتاسك تنفيذ محكوم.")
  ],
  "troubleshooting": [
    c("node bin/kvdf.js validate", "Run the broadest health check first.", "يشغل أوسع فحص صحة أولًا."),
    c("node bin/kvdf.js policy status", "Inspect policy blockers.", "يفحص موانع السياسات."),
    c("node bin/kvdf.js security scan", "Run a local lightweight secret/security scan.", "يشغل فحصًا محليًا خفيفًا للأسرار والأمان."),
    c("node bin/kvdf.js structure validate --json", "Check foldering problems in machine-readable form.", "يفحص مشاكل تنظيم الفولدرات بصيغة JSON."),
    c("node bin/kvdf.js capture list", "Find unreviewed post-work changes.", "يعثر على تغييرات post-work غير مراجعة."),
    c("npm test", "Run the repository integration test suite.", "يشغل اختبارات التكامل في الريبو.")
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
  ["متى نستخدم `kvdf`", ["استخدم `kvdf` في موقع الوثائق، وفي العمل اليومي على المشاريع، وبعد تثبيت الحزمة، وفي VS Code tasks، وفي شرح الاستخدام لأي مطور عادي.", "`kvdf` هو الأمر الرسمي الموجه للمطور. يعمل عندما تكون الحزمة مثبتة أو مربوطة محليًا أو متاحة من npm/bin tooling. لذلك سيكون هو الشكل المعروض في الدوكس."]],
  ["متى نستخدم `node bin/kvdf.js`", ["استخدم `node bin/kvdf.js` فقط أثناء تطوير كبيري نفسه من سورس الريبو، أو عند debug مباشر لملف CLI، أو قبل ربط الحزمة، أو لو أمر `kvdf` غير موجود بعد في PATH.", "هذا مسار داخلي للمطورين الذين يطورون الفريمورك نفسه، وليس الشكل الأفضل لمستخدم الدوكس."]],
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
    ? "تعامل مع هذا الأمر كخطوة داخل كبيري ونفذها أو اقترح استخدامها عندما تكون مناسبة."
    : "Treat this command as a Kabeeri step and run or suggest it when it fits the current work.";
  const rows = [
    [/^npm test$/, isAr ? "اختبر التغييرات الحالية وتأكد أن النظام لم ينكسر." : "Test the current changes and confirm nothing broke.", isAr ? "يشغل اختبارات المشروع كدليل قبول قبل التسليم." : "Runs the project test suite as delivery evidence."],
    [/^kvdf validate/, isAr ? "افحص صحة ملفات كبيري والمشروع قبل ما نكمل." : "Check Kabeeri and project health before we continue.", isAr ? "يستخدم فحص الصحة لاكتشاف مشاكل الحالة والـ schemas والسياسات مبكرًا." : "Uses health validation to catch state, schema, and policy issues early."],
    [/^kvdf init/, isAr ? "جهز مساحة كبيري لمشروع جديد واختر طريقة التسليم المناسبة." : "Set up a Kabeeri workspace for a new project and choose the right delivery mode.", isAr ? "ينشئ حالة المشروع الأساسية بحيث يبدأ AI من مصدر حقيقة منظم." : "Creates base workspace state so AI starts from an organized source of truth."],
    [/dashboard serve/, isAr ? "افتح لوحة مراقبة حية أتابع منها المشروع." : "Open a live dashboard so I can monitor the project.", isAr ? "يشغل الداشبورد المحلي لمتابعة الحالة والتاسكات والتقارير." : "Serves the local dashboard for state, tasks, and reports."],
    [/dashboard generate|dashboard state|reports live|task tracker/, isAr ? "اعرض لي الحالة الحالية والتاسكات وما الذي يحتاج متابعة." : "Show me the current state, tasks, and what needs attention.", isAr ? "يقرأ أو يحدث JSON الحي الذي يعتمد عليه الداشبورد واستكمال الجلسات." : "Reads or updates the live JSON used by the dashboard and resume flow."],
    [/dashboard export/, isAr ? "جهز نسخة ثابتة من الداشبورد أو صفحة العميل للمراجعة." : "Prepare a static dashboard or customer page for review.", isAr ? "يصدر صفحات HTML ثابتة يمكن فتحها بدون سيرفر." : "Exports static HTML pages that can be opened without a server."],
    [/structure map|structure show|structure guide/, isAr ? "اشرح لي تنظيم فولدرات كبيري وأين أجد كل جزء." : "Explain Kabeeri foldering and where each area lives.", isAr ? "يعرض خريطة الفولدرات حتى لا يضيع AI أو المطور داخل الريبو." : "Shows the folder map so AI and developers do not get lost in the repo."],
    [/structure validate|validate foldering/, isAr ? "تأكد أن تنظيم الفولدرات ما زال صحيحًا." : "Make sure the foldering structure is still valid.", isAr ? "يفحص توافق الفولدرات مع خريطة تنظيم كبيري." : "Validates folders against the Kabeeri structure map."],
    [/questionnaire plan/, isAr ? `اسألني الأسئلة المهمة فقط لفهم المشروع${subject ? `: ${subject}` : ""}.` : `Ask only the important questions needed to understand the project${subject ? `: ${subject}` : ""}.`, isAr ? "يولد خطة أسئلة مختصرة مرتبطة بالمنتج والفريمورك وقاعدة البيانات والواجهة." : "Generates a compact intake plan linked to product, framework, data, and UI decisions."],
    [/questionnaire coverage|questionnaire missing/, isAr ? "راجع إجابات المشروع وقل لي ما الناقص قبل التنفيذ." : "Review project answers and tell me what is missing before implementation.", isAr ? "يكشف فجوات الأسئلة حتى لا يبدأ AI بسياق ناقص." : "Finds missing answers so AI does not start from incomplete context."],
    [/delivery recommend/, isAr ? `اقترح هل نشتغل Agile أم Structured ولماذا${subject ? ` لهذا المشروع: ${subject}` : ""}.` : `Recommend Agile or Structured delivery and explain why${subject ? ` for: ${subject}` : ""}.`, isAr ? "يقارن إشارات المشروع ويقترح نمط التسليم مع أسباب عملية." : "Compares project signals and recommends a delivery mode with rationale."],
    [/agile summary|agile sprint|validate agile/, isAr ? "نظم الشغل بطريقة Agile وراجع السبرنت والباكلوج." : "Organize the work with Agile and review the sprint/backlog.", isAr ? "يدير ملخص Agile والتخطيط والفحص حتى يظل التطوير قابلًا للتتبع." : "Manages Agile summary, planning, and checks so development stays traceable."],
    [/structured health|structured gate|validate structured/, isAr ? "نظم الشغل بطريقة Structured وراجع المراحل والبوابات." : "Organize the work with Structured delivery and review phases/gates.", isAr ? "يفحص المتطلبات والمراحل والبوابات والتتبع قبل الانتقال للمرحلة التالية." : "Checks requirements, phases, gates, and traceability before moving on."],
    [/blueprint/, isAr ? `افهم نوع النظام وحدد مكوناته وصفحاته وجداوله الأساسية${subject ? `: ${subject}` : ""}.` : `Understand the system type and identify its modules, pages, and core data${subject ? `: ${subject}` : ""}.`, isAr ? "يربط الفكرة بخريطة منتج جاهزة مثل متجر أو CRM أو POS أو مدونة." : "Maps the idea to a known product blueprint such as ecommerce, CRM, POS, or blog."],
    [/wordpress plugin/, isAr ? "تعامل مع هذا كإضافة WordPress: أنشئ plugin plan ثم scaffold ثم تاسكات محددة قبل التنفيذ." : "Treat this as a WordPress plugin: create a plugin plan, scaffold, and scoped tasks before implementation.", isAr ? "يربط الفكرة بفولدر plugin آمن وقواعد nonces/capabilities/sanitization/escaping بدل تعديل core." : "Binds the idea to a safe plugin folder and nonce/capability/sanitization/escaping rules instead of core edits."],
    [/wordpress/, isAr ? "تعامل مع هذا كمشروع WordPress: حلل أو خطط أو أنشئ plugin/theme آمن قبل التنفيذ." : "Treat this as a WordPress project: analyze, plan, or scaffold a safe plugin/theme before implementation.", isAr ? "يستخدم حالة WordPress وprompt pack وحدود wp-content لتقليل مخاطر تعديل core أو أسرار الإنتاج." : "Uses WordPress state, prompt pack, and wp-content boundaries to reduce core-edit and production-secret risks."],
    [/data-design/, isAr ? "ساعدني أصمم قاعدة البيانات بناءً على دورة العمل وليس شكل الصفحات فقط." : "Help me design the database from the business workflow, not only the screens.", isAr ? "ينتج سياق تصميم بيانات يقلل أخطاء الجداول والعلاقات والتقارير." : "Creates data-design context that reduces table, relationship, and reporting mistakes."],
    [/design recommend|design gate|validate ui-design|ui-checklist|ui-review/, isAr ? "اقترح أنسب واجهات ومكونات وتجربة استخدام لهذا المنتج." : "Recommend the best UI patterns, components, and UX for this product.", isAr ? "يحول نوع المنتج إلى صفحات ومكونات وقواعد SEO/GEO أو Dashboard/Mobile." : "Maps the product to pages, components, and SEO/GEO or dashboard/mobile rules."],
    [/prompt-pack/, isAr ? "جهز برومبت تنفيذ مناسب للفريمورك والتاسك الحالي." : "Prepare an implementation prompt for the current framework and task.", isAr ? "يركب سياق AI مختصرًا من قواعد عامة وحزمة الفريمورك والتاسك." : "Composes compact AI context from common rules, framework pack, and task."],
    [/vibe|capture/, isAr ? "حوّل كلامي الطبيعي أو الشغل الذي تم بالفعل إلى تاسكات قابلة للمراجعة." : "Turn my natural request or already-done work into reviewable tasks.", isAr ? "يسجل النية أو الالتقاط داخل `.kabeeri/interactions` بدل أن يضيع بين الجلسات." : "Records intent or post-work capture under `.kabeeri/interactions` instead of losing it between sessions."],
    [/task create|task assign|task start|task review|task verify|task reject|task status|task list/, isAr ? "حوّل هذا العمل إلى تاسك محكوم وتابع حالته حتى التسليم." : "Turn this work into a governed task and track it through delivery.", isAr ? "يدير التاسكات والإسناد والمراجعة والتحقق داخل نظام حوكمة كبيري." : "Manages tasks, assignment, review, and verification inside Kabeeri governance."],
    [/app create|app list|app show|app status|validate routes/, isAr ? "سجل التطبيقات وحدودها حتى لا تختلط ملفات المشاريع." : "Register app boundaries so project files do not get mixed.", isAr ? "يحكم العلاقة بين backend/frontend/mobile داخل نفس المنتج أو يمنع الخلط." : "Governs backend/frontend/mobile boundaries inside one product and prevents mixing."],
    [/workstream|token issue|lock create|lock list|session start|session end/, isAr ? "نظم صلاحيات المطورين والـ AI وحدود الملفات أثناء التنفيذ." : "Organize developer and AI permissions and file scope during execution.", isAr ? "يربط المسارات والتوكنز والأقفال والجلسات حتى يقل التضارب والهدر." : "Connects workstreams, tokens, locks, and sessions to reduce overlap and waste."],
    [/usage|pricing|budget|preflight|model-route/, isAr ? "قدر تكلفة AI والتوكنز واختر مستوى الموديل المناسب قبل التنفيذ." : "Estimate AI cost/tokens and choose the right model level before execution.", isAr ? "يسجل التكلفة والاستهلاك ويمنع هدر التوكنز في سياق غير ضروري." : "Tracks usage and cost and prevents token waste from oversized context."],
    [/owner|developer solo|developer add|agent add|validate business/, isAr ? "اضبط هوية المالك والمطورين ووكلاء AI وصلاحياتهم." : "Set up the Owner, developers, AI agents, and their permissions.", isAr ? "يحفظ الهويات والأدوار وحدود العمل قبل توزيع المهام." : "Stores identities, roles, and work boundaries before task distribution."],
    [/github|release|package check|handoff|readiness report|governance report|policy status|security scan/, isAr ? "راجع الجاهزية والسياسات والتسليم قبل النشر أو رفع التغييرات." : "Review readiness, policies, and handoff before publish or GitHub changes.", isAr ? "ينتج تقارير وبوابات تمنع النشر أو التسليم قبل اكتمال الدليل." : "Produces reports and gates that block publish or handoff until evidence is ready."]
  ];
  for (const [pattern, request, outcome] of rows) {
    if (pattern.test(text)) return { request, outcome };
  }
  return {
    request: generic,
    outcome: description || (isAr ? "يربط الطلب بقدرة مناسبة داخل كبيري." : "Connects the request to a matching Kabeeri capability.")
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
    [/validate runtime-schemas/, ["Validate runtime schema registry and state-file schema mappings.", "يفحص سجل schemas runtime وربط ملفات الحالة بها."]],
    [/validate prompt-packs/, ["Validate prompt pack manifests and prompt-pack assets.", "يفحص manifests وأصول حزم البرومبت."]],
    [/validate generators/, ["Validate generator profiles and related JSON contracts.", "يفحص بروفايلات التوليد وعقود JSON المرتبطة بها."]],
    [/validate acceptance/, ["Validate acceptance records and review format.", "يفحص سجلات القبول وشكل المراجعة."]],
    [/validate policy/, ["Validate policy definitions and saved policy results.", "يفحص تعريفات السياسات ونتائجها المحفوظة."]],
    [/validate design/, ["Validate design governance state and records.", "يفحص حالة وسجلات حوكمة التصميم."]],
    [/validate capture/, ["Validate post-work capture records.", "يفحص سجلات الالتقاط بعد العمل."]],
    [/validate ui-design/, ["Validate UI/UX advisor runtime state.", "يفحص حالة مساعد UI/UX."]],
    [/validate routes/, ["Validate customer app routes and app-boundary rules.", "يفحص روابط تطبيقات العملاء وقواعد حدود التطبيقات."]],
    [/validate workstream/, ["Validate workstreams, assignments, and execution boundaries.", "يفحص مسارات العمل والإسناد وحدود التنفيذ."]],
    [/validate agile/, ["Validate Agile backlog, stories, sprints, and links.", "يفحص الباك لوج والستوريز والاسبرنتات والروابط في Agile."]],
    [/validate structured/, ["Validate Structured requirements, phases, gates, and traceability.", "يفحص المتطلبات والمراحل والبوابات والتتبع في Structured."]],
    [/validate task/, ["Validate governed task state and task rules.", "يفحص حالة التاسكات وقواعدها."]],
    [/validate foldering/, ["Validate repository foldering rules.", "يفحص قواعد تنظيم الفولدرات."]],
    [/^node bin\\kvdf\.js validate$/, ["Run the full repository and workspace validation suite.", "يشغل فحصًا شاملًا للريبو ومساحة العمل."]],
    [/dashboard serve/, ["Serve the local live dashboard and API.", "يشغل الداشبورد الحي وAPI محليًا."]],
    [/dashboard export/, ["Export static dashboard and customer-facing pages.", "يصدر الداشبورد والصفحات الثابتة."]],
    [/app create --username .*--type backend/, ["Register a backend app inside the current product boundary.", "يسجل تطبيق باك إند داخل حدود المنتج الحالي."]],
    [/app create --username .*--type frontend/, ["Register a web/frontend app inside the current product boundary.", "يسجل تطبيق ويب أو فرونت إند داخل حدود المنتج الحالي."]],
    [/app create --username .*--type mobile/, ["Register a mobile app as a channel of the same product.", "يسجل تطبيق موبايل كقناة لنفس المنتج."]],
    [/agent add .*ai-backend/, ["Register the backend AI developer with backend/database/integration workstreams.", "يسجل مطور AI للباك إند بمسارات backend/database/integration."]],
    [/agent add .*ai-web/, ["Register the web frontend AI developer with public frontend scope.", "يسجل مطور AI لواجهة الويب بنطاق public_frontend."]],
    [/agent add .*ai-mobile/, ["Register the mobile AI developer with mobile/integration scope.", "يسجل مطور AI للموبايل بنطاق mobile/integration."]],
    [/task create .*--type integration/, ["Create a cross-app integration task with explicit apps and workstreams.", "ينشئ تاسك تكامل بين التطبيقات مع تحديد التطبيقات ومسارات العمل صراحة."]],
    [/task create .*--app store-api/, ["Create a backend-scoped task for the store API app.", "ينشئ تاسك محدد لتطبيق API الخاص بالمتجر."]],
    [/task create .*--app storefront-web/, ["Create a web storefront task scoped to the web app.", "ينشئ تاسك واجهة ويب محدد لتطبيق المتجر على الإنترنت."]],
    [/task create .*--app store-mobile/, ["Create a mobile task scoped to the customer mobile app.", "ينشئ تاسك موبايل محدد لتطبيق العميل."]],
    [/readiness report/, ["Generate a readiness report for demo, handoff, release, or publish review.", "ينشئ تقرير جاهزية للعرض أو التسليم أو مراجعة الإصدار أو النشر."]],
    [/governance report/, ["Generate a governance health report for Owner, agents, tasks, locks, tokens, and blockers.", "ينشئ تقرير صحة الحوكمة للمالك والوكلاء والتاسكات والأقفال والتوكنز والموانع."]],
  ];
  for (const [pattern, [en, ar]] of descriptions) {
    if (pattern.test(text)) return isAr ? ar : en;
  }
  if (text.includes("blueprint recommend")) return isAr ? "يقترح خريطة المنتج المناسبة من وصف طبيعي." : "Recommend a product blueprint from natural language.";
  if (text.includes("questionnaire plan")) return isAr ? "ينشئ خطة أسئلة مركزة حسب وصف المنتج." : "Generate a focused question plan from the product description.";
  if (text.includes("data-design context")) return isAr ? "ينشئ سياق تصميم بيانات مناسب لخريطة المنتج." : "Generate data-design context for a product blueprint.";
  if (text.includes("design recommend")) return isAr ? "يقترح نمط الواجهة والمكونات والصفحات المناسبة." : "Recommend UI patterns, components, and page templates.";
  if (text.includes("prompt-pack compose")) return isAr ? "يركب برومبت واعي بالفريمورك والتاسك." : "Compose a framework-aware prompt for a task.";
  if (text.includes("prompt-pack list")) return isAr ? "يعرض حزم البرومبت المتاحة." : "List available prompt packs.";
  if (text.includes("wordpress plugin plan")) return isAr ? "ينشئ خطة تطوير إضافة WordPress محكومة." : "Create a governed WordPress plugin development plan.";
  if (text.includes("wordpress plugin tasks")) return isAr ? "ينشئ تاسكات محددة النطاق من خطة plugin." : "Create scoped tasks from a plugin plan.";
  if (text.includes("wordpress plugin scaffold")) return isAr ? "ينشئ هيكل plugin آمن ومجهز." : "Create a safe, structured plugin scaffold.";
  if (text.includes("wordpress plugin checklist")) return isAr ? "يعرض قائمة قبول تطوير plugin." : "Print the plugin development acceptance checklist.";
  if (text.includes("wordpress analyze")) return isAr ? "يحلل موقع WordPress قائم قبل أي تعديل." : "Analyze an existing WordPress site before any change.";
  if (text.includes("wordpress plan")) return isAr ? "ينشئ خطة WordPress لموقع جديد أو موقع قائم." : "Create a WordPress plan for a new or existing site.";
  if (text.includes("wordpress tasks")) return isAr ? "ينشئ تاسكات محكومة من خطة WordPress." : "Create governed tasks from a WordPress plan.";
  if (text.includes("wordpress scaffold")) return isAr ? "ينشئ plugin أو theme أو child theme آمن." : "Create a safe plugin, theme, or child theme scaffold.";
  if (text.includes("wordpress checklist")) return isAr ? "يعرض قائمة قبول WordPress أو WooCommerce." : "Print the WordPress or WooCommerce acceptance checklist.";
  if (text.includes("task tracker")) return isAr ? "يعرض لوحة تتبع التاسكات كحالة قابلة للقراءة." : "Print task tracker state.";
  if (text.includes("dashboard state")) return isAr ? "يعرض الحالة الحية التي يعتمد عليها الداشبورد." : "Print live dashboard state.";
  if (text.includes("structure map")) return isAr ? "يعرض خريطة تنظيم المستودع." : "Print repository foldering map.";
  if (text.includes("structure validate")) return isAr ? "يفحص صحة تنظيم المستودع." : "Validate repository foldering.";
  if (text.includes("delivery recommend")) return isAr ? "يقترح نمط التسليم المناسب مع الأسباب." : "Recommend Agile or Structured delivery.";
  if (text.includes("agile summary")) return isAr ? "يعرض ملخص حالة Agile." : "Show Agile runtime summary.";
  if (text.includes("structured health")) return isAr ? "يعرض صحة مسار Structured." : "Show Structured delivery health.";
  if (text.includes("capture list")) return isAr ? "يعرض الالتقاطات المسجلة بعد العمل." : "List post-work captures.";
  if (text.includes("owner status")) return isAr ? "يعرض حالة المالك وجلسة التحقق." : "Show Owner and auth-session status.";
  if (text.includes("app list")) return isAr ? "يعرض التطبيقات المسجلة في مساحة العمل." : "List registered apps.";
  if (text.includes("workstream list")) return isAr ? "يعرض مسارات العمل المسجلة." : "List registered workstreams.";
  if (text.includes("adr list")) return isAr ? "يعرض قرارات المعمارية المسجلة." : "List ADR records.";
  if (text.includes("token show")) return isAr ? "يعرض تفاصيل توكن تاسك محدد." : "Show a task access token.";
  if (text.includes("usage summary")) return isAr ? "يعرض ملخص تكلفة وتوكنز AI." : "Show AI usage and cost summary.";
  if (text.includes("preflight estimate")) return isAr ? "يقدر تكلفة ومخاطر سياق AI قبل الإرسال." : "Estimate AI context cost and risk before execution.";
  if (text.includes("model-route recommend")) return isAr ? "يقترح فئة الموديل المناسبة للتاسك." : "Recommend a model routing class for the task.";
  if (text.includes("session start")) return isAr ? "يبدأ جلسة AI محكومة مرتبطة بتاسك." : "Start a governed AI execution session.";
  if (text.includes("release check")) return isAr ? "يفحص جاهزية الإصدار." : "Check release readiness.";
  if (text.includes("package check")) return isAr ? "يفحص جاهزية تغليف المنتج." : "Check package readiness.";
  if (text.includes("github plan")) return isAr ? "يعرض خطة GitHub دون كتابة فعلية." : "Preview GitHub sync without writing.";
  if (text.includes("handoff package")) return isAr ? "ينشئ حزمة تسليم للمالك أو العميل." : "Generate a handoff package.";
  if (text.includes("npm test")) return isAr ? "يشغل اختبارات التكامل في الريبو." : "Run the repository test suite.";
  return isAr ? "أمر CLI مرتبط بهذه القدرة. راجع مرجع CLI للتفاصيل الكاملة والخيارات." : "CLI command related to this capability. See the CLI reference for full options.";
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
      `أريد تخطيط إضافة WordPress${name ? ` باسم ${name}` : ""}${subject ? ` لغرض: ${subject}` : ""}.`,
      `Kabeeri records a plugin plan with type${type ? ` ${type}` : ""}, target folder, architecture, safety rules, tasks, and acceptance checklist.`,
      `كبيري يسجل plugin plan بنوع${type ? ` ${type}` : ""} وفولدر الهدف والمعمارية وقواعد الأمان والتاسكات وقائمة القبول.`
    );
  }
  if (lower.includes("wordpress plugin scaffold")) {
    return row(
      `Create the safe WordPress plugin scaffold${name ? ` for ${name}` : ""}.`,
      `أنشئ هيكل إضافة WordPress آمن${name ? ` لـ ${name}` : ""}.`,
      "Kabeeri creates the plugin folder, bootstrap file, admin/public classes, assets, languages, uninstall policy, and README.",
      "كبيري ينشئ فولدر الإضافة وملف التشغيل وadmin/public classes وassets وlanguages وuninstall policy وREADME."
    );
  }
  if (lower.includes("wordpress plugin tasks")) {
    return row(
      "Turn the latest WordPress plugin plan into scoped implementation tasks.",
      "حوّل آخر خطة إضافة WordPress إلى تاسكات تنفيذ محددة النطاق.",
      "Kabeeri creates governed tasks tied to the plugin plan, allowed files, workstreams, acceptance criteria, and review flow.",
      "كبيري ينشئ تاسكات محكومة مرتبطة بخطة الإضافة والملفات المسموحة ومسارات العمل ومعايير القبول والمراجعة."
    );
  }
  if (lower.includes("wordpress plugin checklist")) {
    return row(
      "Show me the acceptance checklist for WordPress plugin development.",
      "اعرض لي قائمة قبول تطوير إضافات WordPress.",
      "Kabeeri prints the plugin safety, architecture, permissions, sanitization, uninstall, testing, and handoff checklist.",
      "كبيري يعرض قائمة أمان الإضافة والمعمارية والصلاحيات والتنظيف وuninstall والاختبارات والتسليم."
    );
  }
  if (lower.includes("wordpress analyze")) {
    return row(
      "Analyze this existing WordPress site before making changes.",
      "حلل موقع WordPress القائم قبل أي تعديل.",
      "Kabeeri records detected plugins, themes, WooCommerce signals, staging/backup status, forbidden paths, risks, and next actions.",
      "كبيري يسجل plugins وthemes وإشارات WooCommerce وحالة staging/backup والمسارات الممنوعة والمخاطر والخطوات التالية."
    );
  }
  if (lower.includes("wordpress plan")) {
    return row(
      `Plan this WordPress site work${subject ? `: ${subject}` : ""}.`,
      `خطط عمل موقع WordPress هذا${subject ? `: ${subject}` : ""}.`,
      `Kabeeri creates a governed WordPress plan for ${type || "the selected site type"} with phases, tasks, safe extension strategy, and acceptance criteria.`,
      `كبيري ينشئ خطة WordPress محكومة لنوع ${type || "الموقع المختار"} مع مراحل وتاسكات واستراتيجية امتداد آمنة ومعايير قبول.`
    );
  }
  if (lower.includes("wordpress tasks")) {
    return row(
      "Create governed tasks from the current WordPress site plan.",
      "أنشئ تاسكات محكومة من خطة موقع WordPress الحالية.",
      "Kabeeri converts the WordPress plan into scoped tasks with workstreams, safety constraints, and acceptance criteria.",
      "كبيري يحول خطة WordPress إلى تاسكات محددة بمسارات عمل وقيود أمان ومعايير قبول."
    );
  }
  if (lower.includes("wordpress scaffold child-theme")) {
    return row(
      `Create a safe WordPress child theme scaffold${name ? ` for ${name}` : ""}.`,
      `أنشئ هيكل child theme آمن${name ? ` لـ ${name}` : ""}.`,
      "Kabeeri creates a child-theme extension point under wp-content without touching WordPress core.",
      "كبيري ينشئ نقطة امتداد child-theme داخل wp-content بدون لمس WordPress core."
    );
  }
  if (lower.includes("wordpress scaffold plugin")) {
    return row(
      `Create a safe WordPress plugin scaffold${name ? ` for ${name}` : ""}.`,
      `أنشئ هيكل plugin آمن${name ? ` لـ ${name}` : ""}.`,
      "Kabeeri creates a plugin extension point under wp-content/plugins with safe starter files.",
      "كبيري ينشئ نقطة امتداد plugin داخل wp-content/plugins مع ملفات بداية آمنة."
    );
  }
  if (lower.includes("prompt-pack compose wordpress")) {
    return row(
      `Prepare WordPress-specific AI instructions for task ${task}.`,
      `جهز تعليمات WordPress لمساعد الذكاء الاصطناعي لتاسك ${task}.`,
      "Kabeeri composes WordPress rules for hooks, nonces, capabilities, sanitization, escaping, REST routes, WooCommerce, and handoff.",
      "كبيري يركب قواعد WordPress الخاصة بـ hooks وnonces وcapabilities وsanitization وescaping وREST routes وWooCommerce والتسليم."
    );
  }
  if (lower.includes("docs open") || lower.includes("docs serve")) {
    return row(
      "Open the Kabeeri documentation site so I can read the current guidance.",
      "افتح موقع وثائق كبيري حتى أقرأ الإرشادات الحالية.",
      "Kabeeri regenerates the docs site, serves it locally, and can open it in the browser.",
      "كبيري يعيد توليد موقع الوثائق ويشغله محليًا ويمكنه فتحه في المتصفح."
    );
  }
  if (lower.includes("questionnaire plan")) {
    return row(
      `Ask me only the important questions for this project${subject ? `: ${subject}` : ""}.`,
      `اسألني فقط الأسئلة المهمة لهذا المشروع${subject ? `: ${subject}` : ""}.`,
      "Kabeeri generates focused intake questions from product blueprint, delivery mode, data design, UI, and prompt-pack signals.",
      "كبيري يولد أسئلة مركزة من خريطة المنتج ونمط التسليم وتصميم البيانات والواجهة وحزم البرومبت."
    );
  }
  if (lower.includes("blueprint recommend")) {
    return row(
      `Identify the product type, modules, pages, data entities, and risks${subject ? ` for: ${subject}` : ""}.`,
      `حدد نوع المنتج والموديولات والصفحات والجداول والمخاطر${subject ? ` لهذا الطلب: ${subject}` : ""}.`,
      "Kabeeri maps the idea to a known market blueprint such as ecommerce, CRM, POS, booking, blog, or WordPress.",
      "كبيري يربط الفكرة بخريطة منتج معروفة مثل متجر أو CRM أو POS أو حجز أو مدونة أو WordPress."
    );
  }
  if (lower.includes("data-design")) {
    return row(
      "Help me design the database from the business workflow, not only the screens.",
      "ساعدني أصمم قاعدة البيانات من دورة العمل وليس من شكل الصفحات فقط.",
      "Kabeeri creates data-design context covering entities, relationships, constraints, snapshots, audit, transactions, and reporting risks.",
      "كبيري ينشئ سياق تصميم بيانات يغطي الجداول والعلاقات والقيود واللقطات والتدقيق والمعاملات ومخاطر التقارير."
    );
  }
  if (lower.includes("design recommend")) {
    return row(
      "Recommend the best UI/UX pattern, page structure, and component groups for this product.",
      "اقترح أنسب نمط UI/UX وهيكل صفحات ومجموعات مكونات لهذا المنتج.",
      "Kabeeri maps the product to SEO/content, dashboard, commerce, mobile, or operational UI guidance.",
      "كبيري يربط المنتج بإرشادات SEO/content أو dashboard أو commerce أو mobile أو واجهات تشغيلية."
    );
  }
  if (lower.includes("prompt-pack compose")) {
    return row(
      `Prepare framework-aware AI instructions for task ${task}.`,
      `جهز تعليمات ذكاء اصطناعي واعية بالفريمورك لتاسك ${task}.`,
      "Kabeeri composes a compact prompt from common rules, the selected framework pack, and the governed task context.",
      "كبيري يركب برومبت مختصر من القواعد العامة وحزمة الفريمورك وسياق التاسك المحكوم."
    );
  }
  if (lower.includes("dashboard serve")) {
    return row(
      "Open a live dashboard so I can monitor the project.",
      "افتح داشبورد حي أتابع منه المشروع.",
      "Kabeeri serves local dashboard pages and live JSON APIs for state, tasks, reports, and governance.",
      "كبيري يشغل صفحات الداشبورد وواجهات JSON الحية للحالة والتاسكات والتقارير والحوكمة."
    );
  }
  if (lower.includes("dashboard") || lower.includes("reports live") || lower.includes("task tracker")) {
    return row(
      "Show me the current project state, tasks, reports, and next actions.",
      "اعرض لي حالة المشروع والتاسكات والتقارير والخطوات التالية.",
      "Kabeeri reads or refreshes live JSON state used by the dashboard, VS Code, automation, and AI context.",
      "كبيري يقرأ أو يحدث JSON الحي الذي يعتمد عليه الداشبورد وVS Code والأتمتة وسياق الذكاء الاصطناعي."
    );
  }
  if (lower.includes("app create")) {
    return row(
      "Register this app inside the product boundary so files and ownership stay clear.",
      "سجل هذا التطبيق داخل حدود المنتج حتى تظل الملفات والملكية واضحة.",
      "Kabeeri records app username, type, path, product, route, and task boundary rules.",
      "كبيري يسجل username ونوع التطبيق ومساره والمنتج والرابط وقواعد حدود التاسكات."
    );
  }
  if (lower.includes("agent add")) {
    return row(
      "Register this AI developer with its role and allowed workstreams.",
      "سجل مطور الذكاء الاصطناعي هذا بدوره ومسارات العمل المسموحة.",
      "Kabeeri stores the agent identity so tasks, sessions, locks, tokens, and cost can be attributed.",
      "كبيري يحفظ هوية الوكيل حتى ترتبط به التاسكات والجلسات والأقفال والتوكنز والتكلفة."
    );
  }
  if (lower.includes("task create")) {
    return row(
      `Create a governed task${app ? ` for ${app}` : ""} with clear scope and acceptance criteria.`,
      `أنشئ تاسك محكوم${app ? ` لتطبيق ${app}` : ""} بنطاق ومعايير قبول واضحة.`,
      "Kabeeri records the task source, app, workstream, type, owner, reviewer, allowed files, and acceptance targets.",
      "كبيري يسجل مصدر التاسك والتطبيق ومسار العمل والنوع والمسؤول والمراجع والملفات المسموحة ومعايير القبول."
    );
  }
  if (lower.includes("token issue")) {
    return row(
      `Give ${assignee || "the assigned AI/developer"} access to work only on task ${task}.`,
      `امنح ${assignee || "المطور أو مساعد الذكاء الاصطناعي"} صلاحية العمل فقط على تاسك ${task}.`,
      "Kabeeri issues a scoped task access token tied to assignment, expiry, workstream, and allowed execution scope.",
      "كبيري يصدر task access token محددًا مربوطًا بالإسناد والانتهاء ومسار العمل ونطاق التنفيذ المسموح."
    );
  }
  if (lower.includes("lock create")) {
    return row(
      `Lock ${scope || "the target files/folder"} while this task is being implemented.`,
      `اقفل ${scope || "الملفات أو الفولدر المطلوب"} أثناء تنفيذ هذا التاسك.`,
      "Kabeeri records a lock to prevent overlapping edits by parallel developers or AI agents.",
      "كبيري يسجل قفلًا لمنع تعارض التعديلات بين المطورين أو وكلاء الذكاء الاصطناعي المتوازيين."
    );
  }
  if (lower.includes("session start") || lower.includes("session end")) {
    return row(
      "Track this AI work session against the governed task and record evidence when it ends.",
      "تتبع جلسة عمل الذكاء الاصطناعي هذه على التاسك المحكوم وسجل الدليل عند انتهائها.",
      "Kabeeri links execution to task, developer, tokens, files, checks, risks, and AI usage records.",
      "كبيري يربط التنفيذ بالتاسك والمطور والتوكنز والملفات والفحوصات والمخاطر وسجلات استهلاك AI."
    );
  }
  if (lower.includes("validate")) {
    return row(
      "Check Kabeeri and project health before we continue.",
      "افحص صحة كبيري والمشروع قبل أن نكمل.",
      "Kabeeri validates schemas, runtime state, policies, prompt packs, foldering, and workspace governance.",
      "كبيري يفحص schemas وحالة runtime والسياسات وحزم البرومبت وتنظيم الفولدرات وحوكمة مساحة العمل."
    );
  }
  return row(
    "Treat this as a governed Kabeeri step and suggest or run it only when it fits the current work.",
    "تعامل مع هذا كخطوة محكومة داخل كبيري واقترحها أو نفذها فقط عندما تناسب العمل الحالي.",
    description || "Kabeeri connects the natural request to the matching runtime capability.",
    description || "كبيري يربط الطلب الطبيعي بالقدرة المناسبة داخل runtime."
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
      "The developer or owner decides product intent, delivery mode, acceptance criteria, priorities, and whether a suggested task is approved.",
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
      "For team work, evidence must include ownership, touched files, checks, blockers, and handoff notes so another AI assistant or developer can continue safely."
    ]]
  ],
  ar: [
    ["كيف تقرأ هذه الصفحة", [
      "ابدأ بالفكرة بلغة بسيطة، ثم اقرأ خارطة الطريق، وبعدها استخدم جدول الأوامر عند الحاجة. كبيري مصمم بحيث يتكلم المطور طبيعيًا، ومساعد الذكاء الاصطناعي يستخدم أوامر runtime في الخلفية عندما تكون مفيدة.",
      "اعتبر كل صفحة دليل قرار وليس صفحة حفظ أوامر. المخرج المهم هو تاسك أوضح، نطاق أأمن، دليل تنفيذ أفضل، وأسئلة مكررة أقل.",
      "لو تبني منتجًا حقيقيًا، اجعل الداشبورد الحي مفتوحًا واطلب من مساعد الذكاء الاصطناعي تحويل طلبك إلى تاسكات محكومة قبل بدء تعديل الكود."
    ]],
    ["ماذا يقرر المطور", [
      "المطور أو المالك يقرر هدف المنتج، ونمط التسليم، ومعايير القبول، والأولويات، وهل التاسك المقترح مقبول أم لا.",
      "كبيري لا يستبدل حكم صاحب المنتج. دوره أن يكشف الاختيارات والمخاطر والإجابات الناقصة ومسارات التنفيذ بشكل سهل المراجعة.",
      "لو الطلب غامض، الأفضل اعتماد تاسك صغير وواضح بدل بناء كبير غير محدد. هذا يجعل استكمال الجلسات أسهل وأقل خطأ."
    ]],
    ["ماذا يفعل مساعد الذكاء الاصطناعي", [
      "يستخدم هذه الصفحة كسياق، ثم يقرأ ملفات الحالة الحية وملفات المصدر المرتبطة قبل تعديل الكود.",
      "يحافظ على توافق حدود التطبيق، ومسار العمل، وتوكن التاسك، وحزمة البرومبت، وبوابات السياسة مع العمل الحقيقي.",
      "بعد التنفيذ يسجل ما تغير، وما تم فحصه، وما بقي كمخاطر، وأي تاسك أو قرار ينتمي إليه العمل."
    ]],
    ["الدليل المتوقع بعد العمل", [
      "تشغيل كبيري الجيد يترك وراءه سجلات تاسكات، وحالة داشبورد حية، ونتائج تحقق، وملاحظات جلسة، والتقاطات post-work، وأحيانًا ADR أو نتائج بوابات إصدار.",
      "لو الصفحة تشرح workflow لكن لا يوجد دليل يمكن إنتاجه، فهذا gap يجب إصلاحه قبل اعتبار المسار موثوقًا.",
      "في عمل الفريق يجب أن يتضمن الدليل المالك، والملفات التي تم لمسها، والفحوصات، والمعوقات، وملاحظات التسليم حتى يستطيع مطور أو AI آخر الاستكمال بأمان."
    ]]
  ]
};

const focusedDeepGuides = {
  en: {
    "new-project": [["New product intake depth", [
      "For a new app, Kabeeri should first identify whether you are describing one product with multiple channels or multiple unrelated products. Ecommerce backend plus web storefront plus mobile app is one product with related apps.",
      "The first useful output is not code. It is product type, delivery mode, app boundaries, expected modules, data entities, UI surfaces, risks, and a short list of questions that block planning.",
      "After answers are captured, Kabeeri should create initial tasks with owners, workstreams, allowed files, acceptance criteria, and validation steps."
    ]]],
    "existing-non-kabeeri-project": [["Adopting an existing app", [
      "Do not move an existing app blindly. Kabeeri should analyze the current stack, folder layout, framework conventions, database shape, environment files, tests, and deployment assumptions first.",
      "The adoption plan should separate observation from change. First register the app boundary, then document risks, then create small tasks for cleanup, tests, dashboard state, and future feature work.",
      "For WordPress or legacy projects, plugin/theme boundaries must be recorded clearly so AI does not mix business plugins, theme templates, uploads, and generated assets."
    ]]],
    "questionnaire-engine": [["Question quality", [
      "Good questions reduce token waste because the AI does not need to rediscover product intent every session.",
      "Kabeeri should ask only questions that change planning: product type, audience, data ownership, payments, permissions, integrations, delivery mode, UI channel, release target, and risk constraints.",
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
      "The AI assistant should not generate migrations until the workflow, entities, ownership, and historical records are clear enough to avoid painful redesign."
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
    "new-project": [["تعمق بدء منتج جديد", [
      "في تطبيق جديد يجب أن يحدد كبيري أولًا هل أنت تصف منتجًا واحدًا له قنوات متعددة أم منتجات مختلفة لا يجب خلطها. مثال: باك إند متجر مع واجهة ويب وتطبيق موبايل هو منتج واحد بتطبيقات مرتبطة.",
      "أول مخرج مفيد ليس الكود. المخرج هو نوع المنتج، ونمط التسليم، وحدود التطبيقات، والموديولات المتوقعة، وكيانات البيانات، وشاشات الواجهة، والمخاطر، وقائمة أسئلة قصيرة تمنع التخطيط الناقص.",
      "بعد تسجيل الإجابات، ينشئ كبيري تاسكات أولية لها مالك، ومسار عمل، وملفات مسموحة، ومعايير قبول، وخطوات تحقق."
    ]]],
    "existing-non-kabeeri-project": [["اعتماد مشروع قائم", [
      "لا تنقل مشروعًا قائمًا إلى كبيري بشكل أعمى. يجب أن يحلل كبيري الفريمورك، وتنظيم الفولدرات، وقواعد الإطار، وشكل قاعدة البيانات، وملفات البيئة، والاختبارات، وافتراضات النشر أولًا.",
      "خطة الاعتماد تفصل بين الفهم والتغيير. سجل حدود التطبيق، ثم وثق المخاطر، ثم أنشئ تاسكات صغيرة للتنظيف والاختبارات وحالة الداشبورد والعمل القادم.",
      "في WordPress أو المشاريع القديمة، يجب تسجيل حدود البلجنات والثيم بوضوح حتى لا يخلط AI بين business plugins وtheme templates وuploads وassets المولدة."
    ]]],
    "questionnaire-engine": [["جودة الأسئلة", [
      "الأسئلة الجيدة تقلل استهلاك التوكنز لأن AI لا يعيد اكتشاف هدف المنتج في كل جلسة.",
      "يسأل كبيري فقط الأسئلة التي تغير التخطيط: نوع المنتج، الجمهور، ملكية البيانات، الدفع، الصلاحيات، التكاملات، نمط التسليم، قناة الواجهة، هدف الإصدار، وقيود المخاطر.",
      "الإجابات تتحول إلى حالة قابلة لإعادة الاستخدام، وليست ذاكرة شات فقط. الداشبورد، ومولد التاسكات، وحزم البرومبت، وبوابات السياسة يجب أن تستفيد من نفس الإجابات."
    ]]],
    "product-blueprints": [["عمق خرائط المنتجات", [
      "الخريطة هي فهم سوقي لنوع المنتج. تقول لمساعد الذكاء الاصطناعي ما الموديولات والصفحات والعمليات والجداول والتكاملات والمخاطر الطبيعية لهذا النوع.",
      "استخدم الخرائط حتى لا تنسى ميزات بديهية: المتجر يحتاج طلبات ومدفوعات وشحن ومرتجعات ومراجعات وSEO وإدارة داخلية؛ وCRM يحتاج pipeline وأنشطة وإسناد وتذكيرات وتقارير.",
      "الخريطة قابلة للتعديل. يستطيع المطور حذف موديولات، أو اختيار MVP، أو تقسيم العمل إلى سبرنتات Agile أو مراحل Structured."
    ]]],
    "data-design": [["عمق تصميم قاعدة البيانات", [
      "يصمم كبيري من دورة العمل قبل الشاشات. الشاشات تتغير بسرعة، لكن عمليات مثل الطلب والدفع والشحن والمرتجع والحجز ونشر المقال وحركة المخزون أكثر ثباتًا.",
      "تصميم البيانات القوي يغطي العلاقات والقيود والفهارس واللقطات التاريخية وسجلات التدقيق وتاريخ الحالات والمعاملات ومنع التكرار وجداول التقارير وتوقعات النسخ الاحتياطي والاسترجاع.",
      "لا ينبغي لمساعد الذكاء الاصطناعي توليد migrations قبل وضوح workflow والكيانات والملكية والسجلات التاريخية بما يكفي لتجنب إعادة تصميم مؤلمة."
    ]]],
    "ui-ux-advisor": [["عمق تصميم الواجهات", [
      "يختار كبيري نمط الواجهة من وظيفة المنتج: صفحات SEO تحتاج HTML دلالي وstructured data؛ الداشبورد يحتاج جداول وفلاتر وصلاحيات وأفعال متكررة سريعة؛ الموبايل يحتاج offline ولمس وتنبيهات.",
      "المخرج يجب أن يتضمن خريطة صفحات، ومجموعات مكونات، وحالات الواجهة، وقواعد accessibility، وقواعد SEO/GEO عند الحاجة، وتوصية design tokens أو مكتبة UI.",
      "تاسك الواجهة الجيد يتضمن empty states وloading states وerror states وresponsive behavior ومعايير قبول للصور أو الفحص اليدوي."
    ]]],
    "vibe-first": [["عمق Vibe-first", [
      "Vibe-first يعني أن المطور يتكلم طبيعيًا بينما كبيري يحول النية إلى عمل قابل للمراجعة. هذا لا يعني أن AI ينفذ طلبًا غامضًا بدون موافقة.",
      "المسار الجيد ينتج intent classification وsuggested task card وتخمين workstream ومستوى مخاطرة وallowed/forbidden files ومعايير قبول وسؤال تالٍ عند الغموض.",
      "نفس الطلب يجب أن يعمل سواء جاء من الشات أو الداشبورد أو VS Code أو CLI. الـ CLI هو المحرك، لكن تجربة الإنسان تبقى طبيعية."
    ]]],
    "practical-examples": [["كيف تستخدم الأمثلة السبعة", [
      "كل مثال مكتوب كقصة منتج قابلة للتكرار: ماذا تسأل، كيف يصنف كبيري المنتج، ما نمط التسليم المناسب، ما أسطح الباك إند والفرونت إند، وما الدليل الذي يثبت الجاهزية.",
      "استخدم الأمثلة كسكريبت عند البدء مع مساعد ذكاء اصطناعي. اكتب هدف المنتج طبيعيًا، ثم اطلب من كبيري تشغيل blueprint وquestionnaire وdata design وUI design والتاسكات والبوابات المناسبة.",
      "الأمثلة السبعة تغطي المحتوى والتجارة والتشغيل والموبايل وCRM وPOS والحجوزات وWordPress حتى يعمل نفس النموذج الذهني مع مشاريع عملاء كثيرة."
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
      "The owner can inspect progress in normal language: what is done, what is blocked, what remains, which risks matter, and what should be built next."
    ]]
  ],
  ar: [
    ["تحويل هذا المثال إلى عمل حقيقي", [
      "ابدأ بكتابة هدف المنتج بلغة عادية، ثم اطلب من مساعد الذكاء الاصطناعي أن يجعل كبيري يحدد blueprint ونمط التسليم والتطبيقات والموديولات وكيانات البيانات وشاشات الواجهة والإجابات الناقصة.",
      "لا تطلب توليد المنتج كله في خطوة واحدة. اطلب من كبيري إنشاء أول milestone أو sprint، ثم اعتمد التاسكات الأعلى قيمة بمعايير قبول واضحة.",
      "في كل تاسك باك إند توقع data model وAPI contract وvalidation وpermissions واختبارات وaudit أو logs عند الحاجة. وفي كل تاسك فرونت إند توقع screens وstates وresponsive behavior وintegration contract.",
      "قبل التسليم اطلب من كبيري تشغيل validate وpolicy gates وتحديث الداشبورد وrelease readiness وhandoff notes حتى تعرف الجلسة التالية ما حدث بالضبط."
    ]],
    ["شكل النجاح النهائي", [
      "المنتج له app boundary واضحة، ونمط تسليم مختار، وتاسكات معتمدة، وحزمة برومبت واعية بالفريمورك، وخطة قاعدة بيانات، وخطة واجهات، وحالة داشبورد حية.",
      "يستطيع مساعد الذكاء الاصطناعي الاستكمال بدون قراءة الريبو كله لأن كبيري يخزن الإجابات والقرارات ودليل التاسكات والحالة الحالية.",
      "يستطيع المالك فهم التقدم بلغة طبيعية: ما تم، ما المتعطل، ما المتبقي، ما المخاطر المهمة، وما الذي يجب بناؤه بعد ذلك."
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
  const headers = lang === "ar" ? ["القدرة", "ماذا تفعل", "المصدر"] : ["Capability", "What it does", "Source"];
  return `
    <section class="deep-section wide-section">
      <h2>${lang === "ar" ? "جدول القدرات" : "Capability Table"}</h2>
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
    ? `<div class="search-summary">${lang === "ar" ? `نتائج البحث: ${results.length}` : `Search results: ${results.length}`}</div>`
    : "";
  const empty = query && !results.length
    ? `<div class="search-empty">${lang === "ar" ? "لا توجد صفحة مطابقة. جرّب كلمة أبسط مثل tasks أو WordPress أو قاعدة البيانات." : "No matching page. Try a simpler term such as tasks, WordPress, or database."}</div>`
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
    link.textContent = target === "ar" ? "العربية" : "English";
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
