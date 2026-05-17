const fs = require("fs");
const path = require("path");
const { repoRoot, fileExists, readJsonFile, writeJsonFile, assertSafeName } = require("./fs_utils");
const { DEFAULT_RETENTION_DAYS } = require("./services/task_trash");
const { normalizeSurfaceScopes } = require("./services/app_workspace_contract");

function getStateDir() {
  return ".kabeeri";
}

function ensureWorkspace() {
  if (!fileExists(getStateDir())) {
    throw new Error("No .kabeeri workspace found. Run `kvdf init` first.");
  }
}

function buildAppDocTemplate({ title, purpose, questions = [], sections = [], notes = [] }) {
  const lines = [
    `# ${title}`,
    "",
    "## Purpose",
    purpose,
    ""
  ];
  if (questions.length) {
    lines.push("## Questions this document must answer");
    for (const question of questions) lines.push(`- ${question}`);
    lines.push("");
  }
  if (sections.length) {
    lines.push("## Suggested sections");
    for (const section of sections) lines.push(`- ${section}`);
    lines.push("");
  }
  if (notes.length) {
    lines.push("## Notes");
    for (const note of notes) lines.push(`- ${note}`);
    lines.push("");
  }
  return { content: lines.join("\n") };
}

function buildAppDocsPackageTemplates(options = {}) {
  const appName = String(options.name || "the app").trim();
  const appSlug = String(options.slug || "app-slug").trim();
  const packageIntro = [
    `This folder is the portable app-doc package for ${appName}.`,
    "It should let another system understand the app without rereading chat history.",
    "Keep the final app knowledge here even if Kabeeri was used to create it."
  ];
  const templates = [
    {
      path: "README.md",
      content: [
        `# ${options.name || appSlug}`,
        "",
        ...packageIntro.map((line) => line),
        "",
        "## Portable doc set",
        "",
        "Core app docs:",
        "- `docs/00-overview.md`",
        "- `docs/01-vision-and-goals.md`",
        "- `docs/02-scope-and-non-goals.md`",
        "- `docs/03-users-and-personas.md`",
        "- `docs/04-user-stories-and-jobs-to-be-done.md`",
        "- `docs/05-ux-principles.md`",
        "- `docs/06-information-architecture.md`",
        "- `docs/07-user-flows.md`",
        "- `docs/08-wireframes.md`",
        "- `docs/09-ui-specification.md`",
        "- `docs/10-content-and-tone.md`",
        "- `docs/11-accessibility.md`",
        "- `docs/12-architecture-overview.md`",
        "- `docs/13-module-breakdown.md`",
        "- `docs/14-service-boundaries.md`",
        "- `docs/15-api-contracts.md`",
        "- `docs/16-authentication-and-permissions.md`",
        "- `docs/17-error-handling.md`",
        "- `docs/18-integration-map.md`",
        "- `docs/19-data-model.md`",
        "- `docs/20-entities-and-relationships.md`",
        "- `docs/21-data-dictionary.md`",
        "- `docs/22-schema-rules.md`",
        "- `docs/23-state-and-lifecycle.md`",
        "- `docs/24-feature-breakdown.md`",
        "- `docs/25-task-plan.md`",
        "- `docs/26-implementation-order.md`",
        "- `docs/27-release-plan.md`",
        "- `docs/28-acceptance-criteria.md`",
        "- `docs/29-test-strategy.md`",
        "- `docs/30-qa-checklist.md`",
        "- `docs/31-edge-cases.md`",
        "- `docs/32-performance-notes.md`",
        "- `docs/33-deployment-and-environments.md`",
        "- `docs/34-observability-and-analytics.md`",
        "- `docs/35-support-runbook.md`",
        "- `docs/36-backup-and-recovery.md`",
        "- `docs/37-change-log.md`",
        "- `docs/38-security-and-privacy.md`",
        "- `docs/39-compliance-notes.md`",
        "- `docs/40-audit-and-logging.md`",
        "- `docs/41-role-and-permission-matrix.md`",
        "- `docs/42-vendor-and-dependency-inventory.md`",
        "",
        "## How to use this package",
        "- Fill the app docs before implementation whenever the app is new or still being reconstructed.",
        "- Keep the final answers in this folder even if Kabeeri helped produce them.",
        "- Treat `docs/` as the portable product knowledge package and `.kabeeri/` as the working state.",
        ""
      ].join("\n")
    },
    {
      path: "00-overview.md",
      ...buildAppDocTemplate({
        title: "App Overview",
        purpose: `Summarize what ${appName} is, who owns it, and why it exists.`,
        questions: [
          "What is the app trying to accomplish?",
          "Who is the owner and who are the main users?",
          "What would make this app successful?",
          "What is definitely not part of this app?"
        ],
        sections: ["Purpose", "Audience", "Business value", "Current status", "Related docs"]
      })
    },
    {
      path: "01-vision-and-goals.md",
      ...buildAppDocTemplate({
        title: "Vision And Goals",
        purpose: "Explain the product vision, strategic goals, and measurable outcomes for the app.",
        questions: [
          "What business result should the app drive?",
          "What outcomes matter most in the first release?",
          "How will we know the app is working?"
        ],
        sections: ["Vision", "Goals", "Success metrics", "Release target"]
      })
    },
    {
      path: "02-scope-and-non-goals.md",
      ...buildAppDocTemplate({
        title: "Scope And Non-Goals",
        purpose: "Define the exact boundaries of the app so the build stays focused.",
        questions: [
          "What is in scope for this version?",
          "What is explicitly out of scope?",
          "What assumptions are we relying on?"
        ],
        sections: ["In scope", "Out of scope", "Assumptions", "Constraints"]
      })
    },
    {
      path: "03-users-and-personas.md",
      ...buildAppDocTemplate({
        title: "Users And Personas",
        purpose: "Describe the people and roles that will use the app.",
        questions: [
          "Who uses the app directly?",
          "Which roles have different permissions or goals?",
          "Which persona is the primary buyer or operator?"
        ],
        sections: ["Personas", "Roles", "Needs", "Permissions", "Pain points"]
      })
    },
    {
      path: "04-user-stories-and-jobs-to-be-done.md",
      ...buildAppDocTemplate({
        title: "User Stories And Jobs To Be Done",
        purpose: "Translate the product goal into concrete user value and behaviors.",
        questions: [
          "What does each user need to do?",
          "What job is the app hired to complete?",
          "Which stories are must-have versus later?"
        ],
        sections: ["User stories", "Jobs to be done", "Priority order", "Acceptance notes"]
      })
    },
    {
      path: "05-ux-principles.md",
      ...buildAppDocTemplate({
        title: "UX Principles",
        purpose: "Define the experience values that shape all interface decisions.",
        questions: [
          "What should the interface feel like?",
          "What interaction style is preferred?",
          "What should the app never do?"
        ],
        sections: ["Principles", "Interaction tone", "Motion guidance", "Decision rules"]
      })
    },
    {
      path: "06-information-architecture.md",
      ...buildAppDocTemplate({
        title: "Information Architecture",
        purpose: "Map the screens, navigation, and content hierarchy of the app.",
        questions: [
          "What are the top-level sections?",
          "How does a user move between screens?",
          "What content belongs together?"
        ],
        sections: ["Navigation model", "Page hierarchy", "Primary routes", "Content grouping"]
      })
    },
    {
      path: "07-user-flows.md",
      ...buildAppDocTemplate({
        title: "User Flows",
        purpose: "Document the step-by-step journeys users take through the app.",
        questions: [
          "What are the critical journeys?",
          "What happens when a step fails?",
          "Which screens are entered from each flow?"
        ],
        sections: ["Happy paths", "Failure paths", "Transitions", "Edge states"]
      })
    },
    {
      path: "08-wireframes.md",
      ...buildAppDocTemplate({
        title: "Wireframes",
        purpose: "Capture the intended layout and screen structure before code starts.",
        questions: [
          "What belongs on each screen?",
          "What needs to be above the fold?",
          "Which elements are fixed versus dynamic?"
        ],
        sections: ["Screen inventory", "Layout notes", "Responsive notes", "Visual hierarchy"]
      })
    },
    {
      path: "09-ui-specification.md",
      ...buildAppDocTemplate({
        title: "UI Specification",
        purpose: "Define the final interface behavior, components, and states.",
        questions: [
          "What components are required?",
          "What interaction states need to exist?",
          "What should the user see on success and failure?"
        ],
        sections: ["Components", "States", "Variants", "Interaction rules"]
      })
    },
    {
      path: "10-content-and-tone.md",
      ...buildAppDocTemplate({
        title: "Content And Tone",
        purpose: "Record the voice, microcopy, and content style the app should use.",
        questions: [
          "How should the app speak to users?",
          "What copy style should warnings and empty states use?",
          "Which terms should be standardized?"
        ],
        sections: ["Voice", "Terminology", "Microcopy", "Empty states", "Error text"]
      })
    },
    {
      path: "11-accessibility.md",
      ...buildAppDocTemplate({
        title: "Accessibility",
        purpose: "Define the accessibility and inclusive design requirements for the app.",
        questions: [
          "What contrast, keyboard, and screen-reader support is required?",
          "Are there motion, focus, or input constraints?",
          "What accessibility checks must pass before handoff?"
        ],
        sections: ["Accessibility goals", "Keyboard behavior", "Contrast", "Testing checklist"]
      })
    },
    {
      path: "12-architecture-overview.md",
      ...buildAppDocTemplate({
        title: "Architecture Overview",
        purpose: "Summarize the technical shape of the app and its major layers.",
        questions: [
          "What runtime or stack is being used?",
          "What are the major system layers?",
          "What boundaries must stay clean?"
        ],
        sections: ["Stack", "Layering", "Runtime boundaries", "High-level decisions"]
      })
    },
    {
      path: "13-module-breakdown.md",
      ...buildAppDocTemplate({
        title: "Module Breakdown",
        purpose: "Break the app into buildable modules and ownership boundaries.",
        questions: [
          "Which modules exist?",
          "How do modules depend on each other?",
          "What can be built independently?"
        ],
        sections: ["Modules", "Responsibilities", "Dependencies", "Implementation order"]
      })
    },
    {
      path: "14-service-boundaries.md",
      ...buildAppDocTemplate({
        title: "Service Boundaries",
        purpose: "Define which service owns which responsibility and what must not leak across layers.",
        questions: [
          "Which services are allowed to own state?",
          "Which service calls are internal versus external?",
          "What must never be coupled directly?"
        ],
        sections: ["Service map", "Responsibility split", "Boundary rules", "Cross-service calls"]
      })
    },
    {
      path: "15-api-contracts.md",
      ...buildAppDocTemplate({
        title: "API Contracts",
        purpose: "Record the request and response contracts the app depends on.",
        questions: [
          "What endpoints exist?",
          "What inputs and outputs are expected?",
          "What errors and status codes matter?"
        ],
        sections: ["Endpoints", "Payloads", "Status codes", "Error shapes", "Versioning"]
      })
    },
    {
      path: "16-authentication-and-permissions.md",
      ...buildAppDocTemplate({
        title: "Authentication And Permissions",
        purpose: "Describe identity, role, and permission behavior for the app.",
        questions: [
          "How do users sign in?",
          "Which roles can access which areas?",
          "What happens when permission is missing?"
        ],
        sections: ["Auth model", "Roles", "Permissions", "Protected actions"]
      })
    },
    {
      path: "17-error-handling.md",
      ...buildAppDocTemplate({
        title: "Error Handling",
        purpose: "Document the failure states, recovery messages, and operator responses.",
        questions: [
          "What can fail?",
          "How should failures be surfaced to users?",
          "What is the recovery path?"
        ],
        sections: ["Error classes", "Recovery behavior", "User messages", "Logging expectations"]
      })
    },
    {
      path: "18-integration-map.md",
      ...buildAppDocTemplate({
        title: "Integration Map",
        purpose: "Show the external systems and internal dependencies the app connects to.",
        questions: [
          "Which third-party services does the app depend on?",
          "What data crosses the boundary?",
          "Which integrations are optional?"
        ],
        sections: ["External systems", "Data exchange", "Failure modes", "Fallback behavior"]
      })
    },
    {
      path: "19-data-model.md",
      ...buildAppDocTemplate({
        title: "Data Model",
        purpose: "Define the core data objects and how the app stores and uses them.",
        questions: [
          "What are the main business entities?",
          "Which data is owned by the app?",
          "What is persisted versus derived?"
        ],
        sections: ["Entities", "Ownership", "Persistence", "Derived data"]
      })
    },
    {
      path: "20-entities-and-relationships.md",
      ...buildAppDocTemplate({
        title: "Entities And Relationships",
        purpose: "Describe how the app data entities relate to one another.",
        questions: [
          "Which entities link to which?",
          "What is one-to-one, one-to-many, or many-to-many?",
          "What cardinality rules matter?"
        ],
        sections: ["Entity map", "Relationships", "Cardinality", "Lifecycle notes"]
      })
    },
    {
      path: "21-data-dictionary.md",
      ...buildAppDocTemplate({
        title: "Data Dictionary",
        purpose: "List the important fields, meanings, and validation rules for app data.",
        questions: [
          "What does each field mean?",
          "Which fields are required?",
          "What constraints or defaults apply?"
        ],
        sections: ["Field catalog", "Definitions", "Required values", "Validation rules"]
      })
    },
    {
      path: "22-schema-rules.md",
      ...buildAppDocTemplate({
        title: "Schema Rules",
        purpose: "Record the structural rules for database tables, documents, or API schemas.",
        questions: [
          "What constraints must the schema enforce?",
          "Which indexes or uniqueness rules matter?",
          "What should migrations preserve?"
        ],
        sections: ["Schema constraints", "Indexes", "Uniqueness", "Migration notes"]
      })
    },
    {
      path: "23-state-and-lifecycle.md",
      ...buildAppDocTemplate({
        title: "State And Lifecycle",
        purpose: "Define how important objects move through states over time.",
        questions: [
          "What states exist?",
          "What transitions are allowed?",
          "What events trigger lifecycle changes?"
        ],
        sections: ["States", "Transitions", "Triggers", "Terminal conditions"]
      })
    },
    {
      path: "24-feature-breakdown.md",
      ...buildAppDocTemplate({
        title: "Feature Breakdown",
        purpose: "Split the app into the major features that can be planned and delivered.",
        questions: [
          "What features make up the app?",
          "Which features are MVP versus later?",
          "What dependencies exist between features?"
        ],
        sections: ["Feature list", "Priorities", "Dependencies", "Notes"]
      })
    },
    {
      path: "25-task-plan.md",
      ...buildAppDocTemplate({
        title: "Task Plan",
        purpose: "Convert the design into a governed build sequence.",
        questions: [
          "What is the first task to build?",
          "What tasks depend on others?",
          "What is the smallest safe order of work?"
        ],
        sections: ["Task sequence", "Dependencies", "Workstreams", "Acceptance links"]
      })
    },
    {
      path: "26-implementation-order.md",
      ...buildAppDocTemplate({
        title: "Implementation Order",
        purpose: "Explain the recommended build order for the app.",
        questions: [
          "What must be implemented before UI work?",
          "What must be in place before backend work?",
          "What can be built in parallel?"
        ],
        sections: ["Phase order", "Parallelizable work", "Blocking dependencies"]
      })
    },
    {
      path: "27-release-plan.md",
      ...buildAppDocTemplate({
        title: "Release Plan",
        purpose: "Describe how the app is prepared, verified, and released.",
        questions: [
          "What must pass before release?",
          "What is the release destination or environment?",
          "What is the rollback expectation?"
        ],
        sections: ["Release criteria", "Environment targets", "Rollback", "Approval path"]
      })
    },
    {
      path: "28-acceptance-criteria.md",
      ...buildAppDocTemplate({
        title: "Acceptance Criteria",
        purpose: "List the conditions that prove the app is correctly built.",
        questions: [
          "How do we know the app is done?",
          "What evidence should exist?",
          "What must a reviewer check?"
        ],
        sections: ["Feature acceptance", "Evidence", "Reviewer checklist"]
      })
    },
    {
      path: "29-test-strategy.md",
      ...buildAppDocTemplate({
        title: "Test Strategy",
        purpose: "Define how the app should be tested across layers.",
        questions: [
          "What should be covered by unit, integration, and end-to-end tests?",
          "Which flows are most important?",
          "What test evidence is required?"
        ],
        sections: ["Test layers", "Critical scenarios", "Coverage targets", "Evidence"]
      })
    },
    {
      path: "30-qa-checklist.md",
      ...buildAppDocTemplate({
        title: "QA Checklist",
        purpose: "Capture the manual checks needed before handoff or release.",
        questions: [
          "What must QA verify by hand?",
          "What screens or flows are high risk?",
          "What browser or device checks matter?"
        ],
        sections: ["Manual checks", "Device checks", "Regression list", "Sign-off"]
      })
    },
    {
      path: "31-edge-cases.md",
      ...buildAppDocTemplate({
        title: "Edge Cases",
        purpose: "Record the unusual scenarios that must still behave safely.",
        questions: [
          "What should happen when data is missing?",
          "What happens on slow or failed network calls?",
          "Which states are easy to break?"
        ],
        sections: ["Failure scenarios", "Boundary cases", "Recovery behavior"]
      })
    },
    {
      path: "32-performance-notes.md",
      ...buildAppDocTemplate({
        title: "Performance Notes",
        purpose: "Document the performance expectations and constraints for the app.",
        questions: [
          "Which screens or actions need to stay fast?",
          "What performance bottlenecks matter?",
          "What should be measured?"
        ],
        sections: ["Performance goals", "Bottlenecks", "Monitoring", "Optimization notes"]
      })
    },
    {
      path: "33-deployment-and-environments.md",
      ...buildAppDocTemplate({
        title: "Deployment And Environments",
        purpose: "Explain where the app runs and how it is deployed.",
        questions: [
          "What environments exist?",
          "How does code reach each environment?",
          "What configuration changes between environments?"
        ],
        sections: ["Environments", "Deployment flow", "Config differences", "Promotion steps"]
      })
    },
    {
      path: "34-observability-and-analytics.md",
      ...buildAppDocTemplate({
        title: "Observability And Analytics",
        purpose: "Define logs, metrics, events, and product analytics for the app.",
        questions: [
          "What should be logged?",
          "Which product events matter?",
          "What should be monitored for failure or abuse?"
        ],
        sections: ["Logging", "Metrics", "Product events", "Dashboards", "Alerts"]
      })
    },
    {
      path: "35-support-runbook.md",
      ...buildAppDocTemplate({
        title: "Support Runbook",
        purpose: "Give operators the steps they need to support the app in production.",
        questions: [
          "What should support do when something breaks?",
          "What are the known operator commands or workflows?",
          "Who should be contacted for escalation?"
        ],
        sections: ["Support steps", "Escalation", "Known issues", "Contact points"]
      })
    },
    {
      path: "36-backup-and-recovery.md",
      ...buildAppDocTemplate({
        title: "Backup And Recovery",
        purpose: "Describe backup expectations and the recovery path for important app data.",
        questions: [
          "What data needs backup coverage?",
          "How is recovery tested?",
          "What is the acceptable recovery target?"
        ],
        sections: ["Backup scope", "Recovery steps", "Recovery target", "Validation"]
      })
    },
    {
      path: "37-change-log.md",
      ...buildAppDocTemplate({
        title: "Change Log",
        purpose: "Record the meaningful changes made to the app over time.",
        questions: [
          "What changed in each release?",
          "What decisions should future teams know?",
          "What should be preserved for migration or audit?"
        ],
        sections: ["Release entries", "Decision notes", "Migration notes"]
      })
    },
    {
      path: "38-security-and-privacy.md",
      ...buildAppDocTemplate({
        title: "Security And Privacy",
        purpose: "Capture the sensitive-data, access, and privacy rules for the app.",
        questions: [
          "What data is sensitive?",
          "What access controls are required?",
          "What privacy or compliance constraints apply?"
        ],
        sections: ["Sensitive data", "Access control", "Privacy rules", "Retention"]
      })
    },
    {
      path: "39-compliance-notes.md",
      ...buildAppDocTemplate({
        title: "Compliance Notes",
        purpose: "Describe any legal, policy, or regulatory requirements the app must respect.",
        questions: [
          "Which compliance rules apply?",
          "What evidence should be retained?",
          "What review gate is needed?"
        ],
        sections: ["Applicable rules", "Evidence", "Review gate", "Open questions"]
      })
    },
    {
      path: "40-audit-and-logging.md",
      ...buildAppDocTemplate({
        title: "Audit And Logging",
        purpose: "Define the audit trail and logging expectations for significant app events.",
        questions: [
          "Which actions should be auditable?",
          "How long should logs be retained?",
          "What should a reviewer be able to reconstruct?"
        ],
        sections: ["Audit events", "Log retention", "Reconstruction notes"]
      })
    },
    {
      path: "41-role-and-permission-matrix.md",
      ...buildAppDocTemplate({
        title: "Role And Permission Matrix",
        purpose: "Show which roles can do what inside the app.",
        questions: [
          "Which roles exist?",
          "Which actions are role-gated?",
          "Which screens or APIs require special permission?"
        ],
        sections: ["Roles", "Permissions", "Restricted actions", "Escalation"]
      })
    },
    {
      path: "42-vendor-and-dependency-inventory.md",
      ...buildAppDocTemplate({
        title: "Vendor And Dependency Inventory",
        purpose: "List the external vendors, packages, and services the app depends on.",
        questions: [
          "What third-party dependencies exist?",
          "Which dependencies are critical?",
          "What happens if a vendor changes?"
        ],
        sections: ["Vendors", "Packages", "Service dependencies", "Risk notes"]
      })
    }
  ];
  return templates;
}

function seedAppDocsPackage(workspaceRoot, options = {}) {
  const docsRoot = path.join(workspaceRoot, "docs");
  const assetsRoot = path.join(workspaceRoot, "assets");
  fs.mkdirSync(docsRoot, { recursive: true });
  fs.mkdirSync(assetsRoot, { recursive: true });
  const templates = buildAppDocsPackageTemplates(options);
  const created = [];
  for (const template of templates) {
    const relativePath = template.path.startsWith("docs/") ? template.path : path.join("docs", template.path).replace(/\\/g, "/");
    const target = path.join(workspaceRoot, relativePath);
    if (fs.existsSync(target)) {
      created.push({ path: path.relative(repoRoot(), target).replace(/\\/g, "/"), status: "exists" });
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, template.content, "utf8");
    created.push({ path: path.relative(repoRoot(), target).replace(/\\/g, "/"), status: "created" });
  }
  return created;
}

function createWorkspace({ profile, mode, lang }) {
  const root = repoRoot();
  const stateDir = path.join(root, getStateDir());
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(path.join(stateDir, "dashboard"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "github"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_usage"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "questionnaires"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "memory"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "adr"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_runs"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "policies"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "events"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "approvals"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "migrations"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "security"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "handoff"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "design_sources"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "interactions"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "reports"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "prompt_layer"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "plugins"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "metadata"), { recursive: true });
  fs.mkdirSync(path.join(root, "workspaces"), { recursive: true });
  fs.mkdirSync(path.join(root, "workspaces", "apps"), { recursive: true });
  fs.mkdirSync(path.join(root, "plugins", "kvdf-dev"), { recursive: true });
  fs.mkdirSync(path.join(root, "plugins", "kvdf-dev", "docs"), { recursive: true });
  for (const folder of [
    "commands",
    "prompts",
    "schemas",
    "templates",
    "tests",
    "references",
    "examples",
    "assets",
    "dashboard",
    "governance",
    "evolution",
    "capabilities",
    "runtime",
    "plugin-control",
    "tracks",
    "reports"
  ]) {
    fs.mkdirSync(path.join(root, "plugins", "kvdf-dev", folder), { recursive: true });
  }

  const files = [
    ["project.json", {
      framework: "Kabeeri VDF",
      project_scope: "single_product_multi_app",
      product_name: "",
      forbid_unrelated_apps: true,
      profile,
      delivery_mode: mode,
      language: lang,
      version: "0.1.0",
      created_at: new Date().toISOString()
    }],
    ["project_profile.json", {
      version: "v1",
      recommendations: [],
      current_recommendation_id: null,
      current_profile: profile,
      current_delivery_mode: mode,
      selected_prompt_packs: [],
      intake_groups: [],
      updated_at: new Date().toISOString()
    }],
    ["delivery_mode.json", {
      mode,
      enabled_agile_features: mode === "agile",
      version: "1.1.0"
    }],
    ["tasks.json", { tasks: [] }],
    ["task_assessments.json", { version: "v1", assessments: [], updated_at: null }],
    ["task_trash.json", { trash: [], retention_days: DEFAULT_RETENTION_DAYS, last_sweep_at: null }],
    ["scorecards.json", {
      version: "v1",
      generated_at: null,
      workspace_root: ".",
      workspace_slug: "kabeeri-core",
      workspace_kind: "framework_owner",
      app_slug: "kabeeri-core",
      app_name: "Kabeeri Development",
      app_type: "framework",
      surface_scopes: [],
      linked_workspace_roots: [],
      current_plan_id: null,
      review_state: { status: "locked", reviewed_at: null, reviewed_by: null, locked_at: null, locked_by: null, notes: [] },
      cards: [],
      surface_cards: [],
      summary: {}
    }],
    ["customer_apps.json", { apps: [] }],
    ["features.json", { features: [] }],
    ["journeys.json", { journeys: [] }],
    ["version_compatibility.json", { created_with_version: "0.1.0", current_engine_version: "0.1.0", compatibility_status: "current", migration_required: false, last_migration: null }],
    ["migration_state.json", { phase: "none", pending_migration: null, last_migration: null, rollback_available: false, migration_risks: [] }],
    ["sprints.json", { sprints: [] }],
    ["delivery_decisions.json", { recommendations: [], decisions: [], current_mode: mode || "structured" }],
    ["product_blueprints.json", { selected_blueprints: [], recommendations: [], current_blueprint: null }],
    ["data_design.json", { contexts: [], reviews: [], current_context: null }],
    ["wordpress.json", { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null }],
    ["evolution.json", { changes: [], impact_plans: [], current_change_id: null }],
    ["agile.json", { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] }],
    ["structured.json", { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] }],
    ["sessions.json", { sessions: [] }],
    ["developers.json", { developers: [] }],
    ["agents.json", { agents: [] }],
    ["developer_mode.json", { mode: "unset", solo_developer_id: null, workstreams: [] }],
    ["workstreams.json", { workstreams: defaultWorkstreams() }],
    ["owner_auth.json", { configured: false }],
    ["owner_docs_tokens.json", { version: "v1", tokens: [], updated_at: null }],
    ["owner_transfer_tokens.json", { tokens: [] }],
    ["session.json", { active: false }],
    ["session_track.json", { version: "v1", active: false, active_track: null, role_gate: "setup_required", activated_features: [], blocked_features: [], activated_at: null, updated_at: null }],
    ["multi_ai_communications.json", { version: "v1", relay_policy: { response_deadline_seconds: 300, ack_required: true, visible_to_owner: false }, conversations: [], audit_trail: [], updated_at: null }],
    ["locks.json", { locks: [] }],
    ["acceptance.json", { records: [] }],
    ["tokens.json", { tokens: [] }],
    ["questionnaires/answers.json", { answers: [] }],
    ["questionnaires/answer_sources.json", { sources: [] }],
    ["questionnaires/completion_state.json", { groups: {}, areas: {} }],
    ["questionnaires/adaptive_intake_plan.json", { plans: [], current_plan_id: null }],
    ["questionnaires/coverage_matrix.json", { generated_at: null, areas: [] }],
    ["questionnaires/missing_answers_report.json", { generated_at: null, missing: [] }],
    ["plugins.json", {
      plugin_loader_version: 1,
      enabled_plugins: ["github", "github_sync", "kvdf-dev", "multi_ai_governance"],
      disabled_plugins: [
        "blog",
        "booking-builder",
        "company-profile",
        "crm",
        "ecommerce-builder",
        "ecommerce-mobile-app",
        "news-website",
        "pos"
      ],
      updated_at: null
    }],
    ["app_workspaces.json", { version: "v1", workspaces: [], updated_at: null }],
    ["metadata/milestones.json", { milestones: [] }],
    ["metadata/team.json", { team_members: [] }],
    ["metadata/decisions.json", { decisions: [] }],
    ["metadata/changelog.json", { changes: [] }],
    ["dashboard/technical_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["dashboard/business_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["dashboard/task_tracker_state.json", { generated_at: null, source: ".kabeeri/tasks.json", summary: {}, board: {}, tasks: [], action_items: [] }],
    ["dashboard/agile_state.json", { generated_at: null, source: ".kabeeri/agile.json", summary: {}, active_sprints: [], velocity: {}, impediments: [], action_items: [] }],
    ["dashboard/structured_state.json", { generated_at: null, source: ".kabeeri/structured.json", summary: {}, phases: [], traceability: {}, gates: [], action_items: [] }],
    ["dashboard/ux_audits.json", { audits: [] }],
    ["reports/live_reports_state.json", { generated_at: null, source: ".kabeeri", summary: {}, reports: {}, action_items: [] }],
    ["github/sync_config.json", { dry_run_default: true, write_requires_confirmation: true }],
    ["github/issue_map.json", { tasks: [], conflicts: [] }],
    ["policies/policy_results.json", { results: [] }],
    ["policies/task_verification_policy.json", {
      policy_id: "task_verification_policy",
      version: "1.0.0",
      subject_type: "task",
      required_checks: [
        { check_id: "source_reference_present", severity: "fail", description: "Task must include source provenance." },
        { check_id: "acceptance_criteria_present", severity: "fail", description: "Task must include acceptance criteria or an acceptance checklist." },
        { check_id: "owner_only_final_verify", severity: "fail", description: "Only the active Owner can final-verify the task." },
        { check_id: "output_contract_complete", severity: "fail", description: "AI Developer output must include summary, files changed, checks, risks, limitations, review needs, and next task." },
        { check_id: "access_token_revoked_after_verify", severity: "fail", description: "Task access token must be revoked or archived after Owner verification." },
        { check_id: "token_usage_recorded", severity: "warn", description: "AI token usage should be traceable by task, workstream, developer, provider, and model." }
      ],
      manual_override: {
        allowed: true,
        requires_owner: true,
        requires_reason: true,
        audit_event_required: true
      }
    }],
    ["policies/release_policy.json", {
      policy_id: "release_policy",
      version: "1.0.0",
      subject_type: "release",
      required_checks: [
        { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed release publishing." },
        { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed release publishing." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings." },
        { check_id: "latest_migration_checks_not_blocked", severity: "fail", description: "Latest migration checks must not be blocked." },
        { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Latest governed policy results must not contain unresolved blockers." },
        { check_id: "owner_actor_for_confirmed_publish", severity: "fail", description: "Confirmed publish must be performed by an Owner actor." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/handoff_policy.json", {
      policy_id: "handoff_policy",
      version: "1.0.0",
      subject_type: "handoff",
      required_checks: [
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Client or Owner handoff must not include unresolved blocker security findings." },
        { check_id: "latest_policy_results_not_blocked", severity: "warn", description: "Handoff should call out unresolved policy blockers." },
        { check_id: "open_work_is_disclosed", severity: "warn", description: "Open tasks should be visible in the package roadmap and readiness reports." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/security_policy.json", {
      policy_id: "security_policy",
      version: "1.0.0",
      subject_type: "security",
      required_checks: [
        { check_id: "latest_security_scan_exists", severity: "warn", description: "Security governance should be based on a recorded scan." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have critical or high findings." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/migration_policy.json", {
      policy_id: "migration_policy",
      version: "1.0.0",
      subject_type: "migration",
      required_checks: [
        { check_id: "migration_plan_exists", severity: "fail", description: "A migration gate must target an existing migration plan." },
        { check_id: "rollback_plan_present", severity: "fail", description: "Migration must have a rollback plan." },
        { check_id: "backup_reference_present", severity: "fail", description: "Migration must record a backup reference." },
        { check_id: "latest_migration_check_not_blocked", severity: "fail", description: "Latest migration safety check for the plan must not be blocked." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/github_write_policy.json", {
      policy_id: "github_write_policy",
      version: "1.0.0",
      subject_type: "github_write",
      required_checks: [
        { check_id: "github_write_confirmation_present", severity: "fail", description: "GitHub writes must be explicitly confirmed." },
        { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed GitHub writes." },
        { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed GitHub writes." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings before GitHub writes." },
        { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Confirmed GitHub writes must not proceed with unresolved policy blockers." },
        { check_id: "owner_actor_for_github_write", severity: "warn", description: "Confirmed GitHub writes should be performed by an Owner actor." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["ai_usage/usage_summary.json", { total_events: 0, total_tokens: 0, total_cost: 0 }],
    ["ai_usage/pricing_rules.json", { currency: "USD", providers: [] }],
    ["ai_usage/budget_approvals.json", { approvals: [] }],
    ["ai_usage/cost_breakdown.json", { by_task: {}, by_developer: {}, by_workstream: {}, by_provider: {} }],
    ["ai_usage/context_packs.json", { context_packs: [] }],
    ["ai_usage/cost_preflights.json", { preflights: [] }],
    ["ai_usage/model_routing.json", {
      routes: [
        { task_kind: "intent_classification", recommended_model_class: "cheap", reason: "Short classification can use low-cost models or local rules." },
        { task_kind: "context_pack_generation", recommended_model_class: "cheap", reason: "File lists, summaries, and acceptance extraction should be inexpensive." },
        { task_kind: "standard_docs_spec", recommended_model_class: "balanced", reason: "Documentation synthesis needs quality but usually does not require premium reasoning." },
        { task_kind: "implementation", recommended_model_class: "balanced", reason: "Production code changes usually need stronger reasoning than simple classification." },
        { task_kind: "security_review", recommended_model_class: "premium", reason: "Security review has higher risk and benefits from stronger reasoning." },
        { task_kind: "owner_verify", recommended_model_class: "human_only", reason: "Final verification is Owner-only." }
      ]
    }],
    ["handoff/packages.json", { packages: [] }],
    ["security/security_scans.json", { scans: [] }],
    ["security/security_readiness.json", { checks: [] }],
    ["migrations/migration_plans.json", { plans: [] }],
    ["migrations/rollback_plans.json", { rollback_plans: [] }],
    ["migrations/migration_checks.json", { checks: [] }],
    ["migrations/migration_audit.json", { events: [] }],
    ["design_sources/sources.json", { sources: [] }],
    ["design_sources/text_specs.json", { specs: [] }],
    ["design_sources/page_specs.json", { pages: [] }],
    ["design_sources/component_contracts.json", { components: [] }],
    ["design_sources/missing_reports.json", { reports: [] }],
    ["design_sources/visual_reviews.json", { reviews: [] }],
    ["design_sources/audit_reports.json", { reports: [] }],
    ["design_sources/governance_reports.json", { reports: [] }],
    ["design_sources/ui_advisor.json", { recommendations: [], reviews: [], current_recommendation: null }],
    ["design_sources/ui_ux_reference.json", { selections: [], generated_questions: [], generated_tasks: [], current_selection: null }],
    ["adr/records.json", { adrs: [] }],
    ["prompt_layer/compositions.json", { compositions: [] }],
    ["interactions/suggested_tasks.json", { suggested_tasks: [] }],
    ["interactions/post_work_captures.json", { captures: [] }],
    ["interactions/vibe_sessions.json", { sessions: [], current_session_id: null }],
    ["interactions/context_briefs.json", { briefs: [] }]
  ];

  const created = [];
  for (const [relative, data] of files) {
    const target = path.join(getStateDir(), relative).replace(/\\/g, "/");
    if (fs.existsSync(path.join(root, target))) {
      created.push({ path: target, status: "exists" });
      continue;
    }
    writeJsonFile(target, data);
    created.push({ path: target, status: "created" });
  }

  const handoffTemplate = path.join(stateDir, "handoff", "CLIENT_HANDOFF_PACKAGE_TEMPLATE.md");
  if (!fs.existsSync(handoffTemplate)) {
    fs.writeFileSync(handoffTemplate, `# Client Handoff Package Template

## Project Summary

- Project name:
- Owner:
- Delivery mode:
- Intake mode:
- Current version:
- Handoff date:

## Business Summary

Describe the product goal, target audience, user value, and what is ready to show.

## Technical Summary

Describe architecture, stack, backend/frontend/admin split, database, integrations, deployment state, and known technical limits.

## Feature Readiness

| Feature | Status | Evidence | Notes |
|---|---|---|---|

## Production Vs Publish

State whether the project is local, development, staging, production-ready, published, or maintenance.

## AI Token Cost Summary

Summarize cost by task, sprint, workstream, developer or AI agent, provider, model, accepted output, rejected output, rework, and untracked usage.

## Known Risks And Limitations

List open risks, deferred features, and operational constraints.

## Next Roadmap

List recommended next tasks, next sprint candidates, and future version priorities.

## Owner Verification

Owner approval is required before final delivery, release, publish, or scope closure.
`, "utf8");
    created.push({ path: ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md", status: "created" });
  } else {
    created.push({ path: ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md", status: "exists" });
  }

  const auditFile = path.join(stateDir, "audit_log.jsonl");
  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(auditFile, "", "utf8");
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "exists" });
  }

  const usageEventsFile = path.join(stateDir, "ai_usage", "usage_events.jsonl");
  if (!fs.existsSync(usageEventsFile)) {
    fs.writeFileSync(usageEventsFile, "", "utf8");
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "exists" });
  }

  for (const relative of [
    "memory/decisions.jsonl",
    "memory/assumptions.jsonl",
    "memory/constraints.jsonl",
    "memory/risks.jsonl",
    "memory/deferred_features.jsonl",
    "ai_runs/prompt_runs.jsonl",
    "ai_runs/accepted_runs.jsonl",
    "ai_runs/rejected_runs.jsonl",
    "events/event_log.jsonl",
    "approvals/approval_log.jsonl"
  ]) {
    const target = path.join(stateDir, relative);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, "", "utf8");
      created.push({ path: `.kabeeri/${relative}`, status: "created" });
    } else {
      created.push({ path: `.kabeeri/${relative}`, status: "exists" });
    }
  }

  const userIntents = path.join(stateDir, "interactions", "user_intents.jsonl");
  if (!fs.existsSync(userIntents)) {
    fs.writeFileSync(userIntents, "", "utf8");
    created.push({ path: ".kabeeri/interactions/user_intents.jsonl", status: "created" });
  }

  const kvdfDevPluginManifest = path.join(root, "plugins", "kvdf-dev", "plugin.json");
  if (!fs.existsSync(kvdfDevPluginManifest)) {
    fs.writeFileSync(kvdfDevPluginManifest, JSON.stringify({
      plugin_id: "kvdf-dev",
      name: "KVDF Dev System Bundle",
      bundle_type: "removable",
      load_strategy: "manifest_driven",
      track: "framework_owner",
      plugin_family: "framework_plugin",
      plugin_type: "kvdf_core",
      removable: true,
      enabled_by_default: true,
      description: "Removable KVDF dev bundle that exposes framework stewardship surfaces.",
      required_folders: [
        "commands",
        "docs",
        "prompts",
        "schemas",
        "templates",
        "tests"
      ],
      optional_folders: [
        "references",
        "examples",
        "assets",
        "dashboard",
        "plugin-control",
        "runtime",
        "tracks"
      ],
      domain_folders: [
        "commands",
        "docs",
        "prompts",
        "schemas",
        "templates",
        "tests",
        "references",
        "examples",
        "assets",
        "dashboard",
        "plugin-control",
        "runtime",
        "tracks"
      ],
      command_surface: [
        "kvdf evolution",
        "kvdf evolution roadmap",
        "kvdf evolution priorities",
        "kvdf evolution partition",
        "kvdf evolution batch-exe",
        "kvdf batch-exe",
        "kvdf task packet",
        "kvdf task executor-contract",
        "kvdf task batch-run",
        "kvdf plugins install kvdf-dev",
        "kvdf plugins enable kvdf-dev",
        "kvdf plugins uninstall kvdf-dev",
        "kvdf plugins disable kvdf-dev"
      ],
      docs_surface: [
        "plugins/kvdf-dev/docs/index.md",
        "knowledge/governance/EVOLUTION_STEWARD.md",
        "docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md"
      ]
    }, null, 2) + "\n", "utf8");
    created.push({ path: "plugins/kvdf-dev/plugin.json", status: "created" });
  } else {
    created.push({ path: "plugins/kvdf-dev/plugin.json", status: "exists" });
  }

  const kvdfDevDocsIndex = path.join(root, "plugins", "kvdf-dev", "docs", "index.md");
  if (!fs.existsSync(kvdfDevDocsIndex)) {
    fs.writeFileSync(kvdfDevDocsIndex, [
      "# KVDF Dev System",
      "",
      "This bundle packages the framework-development side of KVDF as a removable plugin.",
      "",
      "- Open with `kvdf evolution`.",
      "- Use `kvdf batch-exe` to run governed ready-task batches.",
      "- Install with `kvdf plugins install kvdf-dev` or uninstall with `kvdf plugins uninstall kvdf-dev` when framework work needs to be toggled.",
      ""
    ].join("\n"), "utf8");
    created.push({ path: "plugins/kvdf-dev/docs/index.md", status: "created" });
  } else {
    created.push({ path: "plugins/kvdf-dev/docs/index.md", status: "exists" });
  }

  const workspacesRoot = path.join(root, "workspaces", "apps");
  if (!fs.existsSync(workspacesRoot)) {
    fs.mkdirSync(workspacesRoot, { recursive: true });
    created.push({ path: "workspaces/apps", status: "created" });
  } else {
    created.push({ path: "workspaces/apps", status: "exists" });
  }

  return created;
}

function seedDeveloperAppWorkspace(workspaceSlug, options = {}) {
  const root = repoRoot();
  const slug = String(workspaceSlug || "").trim().toLowerCase();
  if (!slug) throw new Error("Missing app workspace slug.");
  assertSafeName(slug);
  const workspaceRoot = path.join(root, "workspaces", "apps", slug);
  const rootProject = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const productName = String(options.productName || rootProject.product_name || rootProject.name || "").trim();
  const forbidUnrelatedApps = rootProject.forbid_unrelated_apps !== false;
  const surfaceScopes = normalizeSurfaceScopes(options.surfaceScopes || options.surface_scopes, options.appType || "application");
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const created = [];
  for (const dir of [".kabeeri", "src", "tests", "docs", "assets"]) {
    const target = path.join(workspaceRoot, dir);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
      created.push({ path: `workspaces/apps/${slug}/${dir}`, status: "created" });
    } else {
      created.push({ path: `workspaces/apps/${slug}/${dir}`, status: "exists" });
    }
  }
  const localState = [
    [".kabeeri/project.json", {
      framework: "Kabeeri VDF",
      workspace_kind: "developer_app",
      app_slug: slug,
      app_name: options.name || slug,
      app_type: options.appType || "application",
      surface_scopes: surfaceScopes,
      linked_workspace_roots: [],
      product_name: productName,
      forbid_unrelated_apps: forbidUnrelatedApps,
      root: `workspaces/apps/${slug}`,
      version: "0.1.0",
      created_at: new Date().toISOString()
    }],
    [".kabeeri/tasks.json", { tasks: [] }],
    [".kabeeri/task_trash.json", { trash: [], retention_days: DEFAULT_RETENTION_DAYS, last_sweep_at: null }],
    [".kabeeri/scorecards.json", { version: "v1", generated_at: null, workspace_root: `workspaces/apps/${slug}`, workspace_slug: slug, workspace_kind: "developer_app", app_slug: slug, app_name: options.name || slug, app_type: options.appType || "application", surface_scopes: surfaceScopes, linked_workspace_roots: [], current_plan_id: null, review_state: { status: "draft", reviewed_at: null, reviewed_by: null, locked_at: null, locked_by: null, notes: [] }, cards: [], surface_cards: [], summary: {} }],
    [".kabeeri/session.json", { active: false }],
    [".kabeeri/session_track.json", { version: "v1", active: false, active_track: "vibe_app_developer", role_gate: "app_workspace", activated_features: [], blocked_features: [], activated_at: null, updated_at: null }],
    [".kabeeri/workspace.json", {
      workspace_contract_version: "v1",
      workspace_kind: "developer_app",
      app_slug: slug,
      app_name: options.name || slug,
      app_type: options.appType || "application",
      surface_scopes: surfaceScopes,
      linked_workspace_roots: [],
      product_name: productName,
      forbid_unrelated_apps: forbidUnrelatedApps,
      root: `workspaces/apps/${slug}`,
      created_at: new Date().toISOString()
    }]
  ];
  for (const [relative, data] of localState) {
    const target = path.join(workspaceRoot, relative);
    if (!fs.existsSync(target)) {
      writeJsonFile(path.join(`workspaces/apps/${slug}`, relative).replace(/\\/g, "/"), data);
      created.push({ path: `workspaces/apps/${slug}/${relative}`, status: "created" });
    } else {
      created.push({ path: `workspaces/apps/${slug}/${relative}`, status: "exists" });
    }
  }
  const packageJson = path.join(workspaceRoot, "package.json");
  if (!fs.existsSync(packageJson)) {
    fs.writeFileSync(packageJson, `${JSON.stringify({
      name: slug,
      private: true,
      version: "0.1.0",
      scripts: { test: "echo \"No app tests configured yet\"" }
    }, null, 2)}\n`, "utf8");
    created.push({ path: `workspaces/apps/${slug}/package.json`, status: "created" });
  } else {
    created.push({ path: `workspaces/apps/${slug}/package.json`, status: "exists" });
  }
  const readme = path.join(workspaceRoot, "README.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, `# ${options.name || slug}\n\nDeveloper app workspace scaffolded by KVDF.\n`, "utf8");
    created.push({ path: `workspaces/apps/${slug}/README.md`, status: "created" });
  } else {
    created.push({ path: `workspaces/apps/${slug}/README.md`, status: "exists" });
  }
  const docsCreated = seedAppDocsPackage(workspaceRoot, { name: options.name || slug, slug });
  created.push(...docsCreated);
  return { workspace_root: `workspaces/apps/${slug}`, workspace_slug: slug, created };
}

function defaultWorkstreams() {
  return [
    { id: "backend", name: "Backend", description: "Server-side application code, APIs, jobs, and backend services.", path_rules: ["app/Http/", "app/Models/", "app/Services/", "routes/api.php", "src/api/", "src/server/", "server/", "backend/", "api/"], required_review: ["api_contract", "security"] },
    { id: "public_frontend", name: "Public Frontend", description: "Customer-facing web or mobile UI.", path_rules: ["src/", "resources/js/", "resources/views/", "frontend/", "web/", "client/", "apps/storefront", "apps/public"], required_review: ["ux", "accessibility"] },
    { id: "admin_frontend", name: "Admin Frontend", description: "Backoffice, dashboard, and internal operations UI.", path_rules: ["admin/", "dashboard/", "resources/admin/", "apps/admin", "src/admin/"], required_review: ["permissions", "operator_flow"] },
    { id: "mobile", name: "Mobile", description: "iOS/Android app code, Expo/React Native apps, Flutter apps, mobile navigation, and device integrations.", path_rules: ["mobile/", "apps/mobile/", "apps/app/", "app/", "src/mobile/", "android/", "ios/"], required_review: ["device_check", "permissions", "accessibility"] },
    { id: "database", name: "Database", description: "Migrations, schema, seeders, and database scripts.", path_rules: ["database/", "migrations/", "prisma/", "schema/", "db/"], required_review: ["migration_safety", "rollback"] },
    { id: "devops", name: "DevOps", description: "Deployment, CI, infrastructure, containers, and runtime configuration.", path_rules: [".github/", "Dockerfile", "docker-compose.yml", "deploy/", "infra/", "k8s/", "terraform/"], required_review: ["deployment_safety"] },
    { id: "qa", name: "QA", description: "Automated tests, QA plans, fixtures, and verification artifacts.", path_rules: ["tests/", "test/", "spec/", "cypress/", "playwright/", "qa/"], required_review: ["test_coverage"] },
    { id: "docs", name: "Documentation", description: "Project documentation, handoff notes, and operating guides.", path_rules: ["docs/", "README.md", "CHANGELOG.md", "governance/", "cli/", "dashboard/"], required_review: ["clarity"] },
    { id: "integrations", name: "Integrations / Plugins", description: "Third-party plugin bundles, webhooks, provider adapters, and external APIs.", path_rules: ["plugins/", "webhooks/", "providers/", "src/plugins/", "app/Plugins/"], required_review: ["contract_safety"] },
    { id: "security", name: "Security", description: "Security scans, auth-sensitive code, secrets rules, and hardening work.", path_rules: ["security/", ".kabeeri/security/", "auth/", "src/auth/", "app/Auth/"], required_review: ["security_review"] }
  ];
}

module.exports = {
  createWorkspace,
  defaultWorkstreams,
  ensureWorkspace,
  getStateDir,
  seedDeveloperAppWorkspace,
  seedAppDocsPackage,
  readJsonFile,
  writeJsonFile
};
