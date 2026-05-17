const {
  fileExists,
  readJsonFile,
  writeJsonFile,
  buildEcommerceBundleContract
} = require("../lib/ecommerce_helpers");

const ECOMMERCE_STATE_FILE = ".kabeeri/ecommerce.json";
const SUPPORTED_MODES = ["store", "marketplace", "digital-products", "subscription", "services"];

function ensureEcommerceState(writeJsonFileFn = writeJsonFile, fileExistsFn = fileExists) {
  if (fileExistsFn(ECOMMERCE_STATE_FILE)) {
    const state = normalizeEcommerceState(readJsonFile(ECOMMERCE_STATE_FILE));
    writeJsonFileFn(ECOMMERCE_STATE_FILE, state);
    return state;
  }
  const state = createEmptyEcommerceState();
  writeJsonFileFn(ECOMMERCE_STATE_FILE, state);
  return state;
}

function createEmptyEcommerceState() {
  return {
    schema_version: "v1",
    plugin_id: "ecommerce-builder",
    updated_at: null,
    current_project_id: null,
    projects: [],
    events: []
  };
}

function normalizeEcommerceState(state) {
  const normalized = state && typeof state === "object" ? { ...state } : createEmptyEcommerceState();
  normalized.schema_version = normalized.schema_version || "v1";
  normalized.plugin_id = normalized.plugin_id || "ecommerce-builder";
  normalized.updated_at = normalized.updated_at || null;
  normalized.current_project_id = normalized.current_project_id || null;
  normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
  normalized.events = Array.isArray(normalized.events) ? normalized.events : [];
  normalized.projects = normalized.projects.map((project) => normalizeEcommerceProject(project));
  return normalized;
}

function normalizeEcommerceProject(project) {
  const normalized = project && typeof project === "object" ? { ...project } : {};
  normalized.project_id = normalized.project_id || `eco-${Date.now()}`;
  normalized.slug = normalized.slug || slugifyEcommerceName(normalized.name || normalized.project_id);
  normalized.name = normalized.name || "Ecommerce Project";
  normalized.mode = normalizeEcommerceMode(normalized.mode || normalized.project_mode || "store");
  normalized.stage = normalized.stage || "intake";
  normalized.description = normalized.description || "";
  normalized.status = normalized.status || "active";
  normalized.created_at = normalized.created_at || new Date().toISOString();
  normalized.updated_at = normalized.updated_at || normalized.created_at;
  normalized.intake = normalized.intake || {
    questions: [],
    answers: [],
    missing_answers: [],
    answered_fields: []
  };
  normalized.brief = normalized.brief || null;
  normalized.design = normalized.design || null;
  normalized.modules = normalized.modules || null;
  normalized.planning_review = normalized.planning_review || {
    review_id: null,
    status: "pending",
    reviewed_at: null,
    reviewed_by: null,
    approved_at: null,
    approved_by: null,
    summary: null
  };
  normalized.tasks = normalized.tasks || null;
  normalized.approvals = Array.isArray(normalized.approvals) ? normalized.approvals : [];
  normalized.blockers = Array.isArray(normalized.blockers) ? normalized.blockers : [];
  normalized.next_action = normalized.next_action || "kvdf ecommerce questionnaire";
  normalized.artifacts = normalized.artifacts || {};
  return normalized;
}

function readEcommerceState() {
  return fileExists(ECOMMERCE_STATE_FILE)
    ? normalizeEcommerceState(readJsonFile(ECOMMERCE_STATE_FILE))
    : createEmptyEcommerceState();
}

function upsertCurrentProject(state, project) {
  const normalizedState = normalizeEcommerceState(state);
  const normalizedProject = normalizeEcommerceProject(project);
  const nextProjects = normalizedState.projects.filter((item) => item.project_id !== normalizedProject.project_id);
  nextProjects.push(normalizedProject);
  normalizedState.projects = nextProjects.sort((a, b) => a.created_at.localeCompare(b.created_at));
  normalizedState.current_project_id = normalizedProject.project_id;
  normalizedState.updated_at = new Date().toISOString();
  normalizedState.events.push({
    event_id: `ecommerce-event-${String(normalizedState.events.length + 1).padStart(3, "0")}`,
    event_type: "project.upserted",
    project_id: normalizedProject.project_id,
    mode: normalizedProject.mode,
    stage: normalizedProject.stage,
    generated_at: normalizedState.updated_at
  });
  return normalizedState;
}

function persistEcommerceState(state, writeJsonFileFn = writeJsonFile) {
  const normalized = normalizeEcommerceState(state);
  writeJsonFileFn(ECOMMERCE_STATE_FILE, normalized);
  return normalized;
}

function getCurrentEcommerceProject(state) {
  const normalized = normalizeEcommerceState(state);
  if (!normalized.projects.length) return null;
  if (normalized.current_project_id) {
    const current = normalized.projects.find((item) => item.project_id === normalized.current_project_id);
    if (current) return current;
  }
  return normalized.projects[normalized.projects.length - 1];
}

function inferEcommerceMode(value) {
  const text = String(value || "").toLowerCase();
  if (/marketplace|vendor|multi-vendor|multi vendor|seller/.test(text)) return "marketplace";
  if (/digital|download|ebook|template|course|file/.test(text)) return "digital-products";
  if (/subscription|membership|recurring|renewal|billing/.test(text)) return "subscription";
  if (/service|consult|agency|quote|appointment|booking/.test(text)) return "services";
  return "store";
}

function normalizeEcommerceMode(value) {
  const mode = String(value || "").toLowerCase();
  return SUPPORTED_MODES.includes(mode) ? mode : "store";
}

function slugifyEcommerceName(value) {
  return String(value || "ecommerce-project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ecommerce-project";
}

function createEcommerceProject(value, flags = {}, deps = {}) {
  const { writeJsonFile: writeJsonFileFn = writeJsonFile } = deps;
  const plugin = deps.plugin || null;
  const state = readEcommerceState();
  const description = [value, flags.description, flags.goal, flags.text]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .join(" ")
    .trim();
  const name = flags.name || flags.title || description || "Ecommerce Project";
  const mode = normalizeEcommerceMode(flags.mode || inferEcommerceMode(description));
  const project = normalizeEcommerceProject({
    project_id: flags.id || `eco-${slugifyEcommerceName(name)}`,
    slug: slugifyEcommerceName(flags.slug || name),
    name,
    mode,
    description,
    stage: "intake",
    status: "active",
    intake: {
      questions: [],
      answers: [],
      missing_answers: [],
      answered_fields: []
    },
    blockers: [],
    next_action: "kvdf ecommerce questionnaire",
    artifacts: {
      bundle_contract: buildEcommerceBundleState(plugin, mode, "intake", "kvdf ecommerce questionnaire")
    }
  });
  const nextState = upsertCurrentProject(state, project);
  persistEcommerceState(nextState, writeJsonFileFn);
  return getCurrentEcommerceProject(nextState);
}

function requireCurrentEcommerceProject(state) {
  const project = getCurrentEcommerceProject(state);
  if (!project) {
    throw new Error("Ecommerce runtime blocked: initialize an ecommerce project first with `kvdf ecommerce init`.");
  }
  return project;
}

function parseEcommerceAnswers(flags = {}, rest = []) {
  const values = [];
  for (const raw of [flags.answer, flags.answers, flags.fill, ...rest].flat().filter(Boolean)) {
    const text = String(raw).trim();
    if (!text) continue;
    for (const chunk of text.split(/[;,]/)) {
      const token = chunk.trim();
      if (!token) continue;
      const [field, ...valueParts] = token.split(/[:=]/);
      if (!field || !valueParts.length) continue;
      values.push({
        field: field.trim(),
        value: valueParts.join(":").trim()
      });
    }
  }
  return values;
}

function buildEcommerceQuestions(mode) {
  const common = [
    {
      question_id: "commerce.goal",
      text: "What are you selling and who is the primary buyer?",
      required: true
    },
    {
      question_id: "commerce.currency",
      text: "What currency or currencies should the store use?",
      required: true
    },
    {
      question_id: "commerce.payments",
      text: "Which payment providers or payout methods are required?",
      required: true
    },
    {
      question_id: "commerce.tax",
      text: "What tax, VAT, or invoice rules should apply?",
      required: true
    },
    {
      question_id: "commerce.fulfillment",
      text: "How are goods or services fulfilled after purchase?",
      required: true
    },
    {
      question_id: "commerce.admin_roles",
      text: "Which staff roles manage orders, products, or operations?",
      required: true
    }
  ];
  const modeSpecific = {
    store: [
      { question_id: "commerce.catalog_size", text: "How large is the catalog and are variants required?", required: true },
      { question_id: "commerce.inventory", text: "Do you need live inventory or stock reservations?", choices: ["yes", "no"], required: true }
    ],
    marketplace: [
      { question_id: "commerce.vendors", text: "How do vendors onboard and who approves them?", required: true },
      { question_id: "commerce.commission", text: "What commission or fee model should the marketplace use?", required: true }
    ],
    "digital-products": [
      { question_id: "commerce.digital_assets", text: "What digital products or downloads are sold?", required: true },
      { question_id: "commerce.licensing", text: "Do you need licensing, download limits, or expiry controls?", required: true }
    ],
    subscription: [
      { question_id: "commerce.billing_cycle", text: "What is the billing cadence and renewal model?", required: true },
      { question_id: "commerce.entitlements", text: "What subscriber entitlements or access rules apply?", required: true }
    ],
    services: [
      { question_id: "commerce.service_catalog", text: "What services are sold and how are they scoped?", required: true },
      { question_id: "commerce.booking_flow", text: "Do services need scheduling, quotes, or lead capture?", required: true }
    ]
  };
  return [...common, ...(modeSpecific[mode] || [])];
}

function buildEcommerceBrief(project, answers = []) {
  const missingAnswers = Array.isArray(project.intake?.missing_answers) ? project.intake.missing_answers : [];
  if (missingAnswers.length) {
    throw new Error(`Ecommerce brief blocked: answer all questionnaire items first (${missingAnswers.join(", ")}).`);
  }
  const mode = normalizeEcommerceMode(project.mode);
  const primaryGoal = answers.find((item) => item.field === "commerce.goal")?.value || project.name;
  const summary = {
    mode,
    audience: primaryGoal,
    commercial_model: mode === "marketplace"
      ? ["multi-vendor catalog", "commission management", "vendor onboarding", "payouts"]
      : mode === "digital-products"
        ? ["instant delivery", "secure downloads", "licensing", "entitlement control"]
        : mode === "subscription"
          ? ["recurring billing", "plan management", "renewals", "member access"]
          : mode === "services"
            ? ["service catalog", "quoting or booking", "payments", "admin operations"]
            : ["catalog browsing", "cart", "checkout", "fulfillment"],
    ui: [
      "landing page with strong value proposition",
      "catalog or plan listing",
      "product detail and cart/checkout flow",
      "customer account and order history",
      "admin operations console"
    ],
    system: [
      "durable commerce state",
      "payment and fulfillment hooks",
      "order lifecycle tracking",
      "reviewable approval trail"
    ],
    data: [
      "customers",
      "catalog",
      "orders",
      "payments",
      "fulfillment"
    ]
  };
  if (mode === "marketplace") summary.data.push("vendors", "commissions", "payouts");
  if (mode === "digital-products") summary.data.push("assets", "downloads", "licenses");
  if (mode === "subscription") summary.data.push("plans", "subscriptions", "entitlements");
  if (mode === "services") summary.data.push("services", "quotes", "bookings");
  return summary;
}

function buildEcommerceDesign(project, brief) {
  if (!brief) {
    throw new Error("Ecommerce design blocked: generate the ecommerce brief first.");
  }
  const mode = normalizeEcommerceMode(project.mode);
  const basePages = [
    { page_id: "landing", purpose: "Product discovery and acquisition" },
    { page_id: "catalog", purpose: "Browse products, plans, or services" },
    { page_id: "detail", purpose: "Inspect the selected item and purchase options" },
    { page_id: "cart_checkout", purpose: "Complete purchase, payment, and confirmation" },
    { page_id: "account", purpose: "Customer history, invoices, and subscriptions" }
  ];
  const modePages = {
    store: [
      { page_id: "inventory_admin", purpose: "Manage stock, variants, and SKU status" }
    ],
    marketplace: [
      { page_id: "vendor_portal", purpose: "Vendor onboarding, catalog, and payouts" }
    ],
    "digital-products": [
      { page_id: "downloads", purpose: "Manage digital files, licensing, and delivery" }
    ],
    subscription: [
      { page_id: "billing_portal", purpose: "Manage plans, renewals, and entitlements" }
    ],
    services: [
      { page_id: "service_ops", purpose: "Manage quotes, schedules, and service delivery" }
    ]
  };
  const moduleHints = {
    catalog: "Product, plan, or service discovery and listing",
    cart: "Shopping cart and line item management",
    checkout: "Checkout form, validation, and review",
    payments: "Payment capture, retries, and provider hooks",
    orders: "Order lifecycle and customer history",
    account: "Customer account and self-service",
    admin_dashboard: "Staff operations and reporting"
  };
  if (mode === "marketplace") {
    moduleHints.vendors = "Vendor onboarding and management";
    moduleHints.payouts = "Commission and payout management";
  }
  if (mode === "digital-products") {
    moduleHints.downloads = "Secure asset delivery and licensing";
  }
  if (mode === "subscription") {
    moduleHints.subscriptions = "Recurring plans and billing lifecycle";
  }
  if (mode === "services") {
    moduleHints.quotes = "Lead capture and quote approval";
    moduleHints.booking = "Service booking and scheduling";
  }
  return {
    mode,
    ui_patterns: [
      "strong product discovery",
      "sticky cart or plan summary",
      "clear trust and payment signals",
      "admin first operations view"
    ],
    system_patterns: [
      "durable commerce state",
      "idempotent checkout flow",
      "audit-friendly order events",
      "approval-ready task trail"
    ],
    page_map: [...basePages, ...(modePages[mode] || [])],
    module_hints: Object.entries(moduleHints).map(([module_id, purpose]) => ({ module_id, purpose })),
    design_summary: brief
  };
}

function buildEcommerceModules(project, design) {
  if (!design) {
    throw new Error("Ecommerce modules blocked: generate the ecommerce design first.");
  }
  const mode = normalizeEcommerceMode(project.mode);
  const commonModules = [
    {
      module_id: "catalog",
      title: "Catalog",
      purpose: "Manage products, services, or plans users can browse.",
      workstreams: ["backend", "public_frontend"],
      dependencies: []
    },
    {
      module_id: "cart",
      title: "Cart",
      purpose: "Manage saved items, quantities, and pricing snapshots.",
      workstreams: ["backend", "public_frontend"],
      dependencies: ["catalog"]
    },
    {
      module_id: "checkout",
      title: "Checkout",
      purpose: "Capture checkout details and validate the order.",
      workstreams: ["backend", "public_frontend"],
      dependencies: ["cart"]
    },
    {
      module_id: "payments",
      title: "Payments",
      purpose: "Integrate payment providers and payment confirmation.",
      workstreams: ["backend", "integration"],
      dependencies: ["checkout"]
    },
    {
      module_id: "orders",
      title: "Orders",
      purpose: "Persist order lifecycle and customer history.",
      workstreams: ["backend", "admin"],
      dependencies: ["payments"]
    },
    {
      module_id: "account",
      title: "Account",
      purpose: "Give customers a self-service history and support view.",
      workstreams: ["public_frontend", "backend"],
      dependencies: ["orders"]
    },
    {
      module_id: "admin_dashboard",
      title: "Admin dashboard",
      purpose: "Help staff manage catalog, orders, and exceptions.",
      workstreams: ["admin", "backend"],
      dependencies: ["orders"]
    }
  ];
  const modeModules = {
    store: [
      {
        module_id: "inventory",
        title: "Inventory",
        purpose: "Track stock, reservations, and low-stock states.",
        workstreams: ["backend", "admin"],
        dependencies: ["catalog", "orders"]
      },
      {
        module_id: "shipping",
        title: "Shipping",
        purpose: "Manage rates, shipping rules, and delivery updates.",
        workstreams: ["backend", "integration"],
        dependencies: ["orders"]
      }
    ],
    marketplace: [
      {
        module_id: "vendors",
        title: "Vendor portal",
        purpose: "Onboard vendors and manage their listings.",
        workstreams: ["backend", "admin"],
        dependencies: ["catalog"]
      },
      {
        module_id: "payouts",
        title: "Payouts",
        purpose: "Track commissions, balances, and vendor payouts.",
        workstreams: ["backend", "integration"],
        dependencies: ["vendors", "payments"]
      }
    ],
    "digital-products": [
      {
        module_id: "downloads",
        title: "Secure downloads",
        purpose: "Deliver files and enforce download limits.",
        workstreams: ["backend", "integration"],
        dependencies: ["orders", "payments"]
      },
      {
        module_id: "licensing",
        title: "Licensing",
        purpose: "Manage license keys, expiry, and entitlements.",
        workstreams: ["backend", "admin"],
        dependencies: ["downloads"]
      }
    ],
    subscription: [
      {
        module_id: "subscriptions",
        title: "Subscriptions",
        purpose: "Manage recurring billing and plan renewals.",
        workstreams: ["backend", "integration"],
        dependencies: ["payments"]
      },
      {
        module_id: "entitlements",
        title: "Entitlements",
        purpose: "Control access to subscription benefits and plans.",
        workstreams: ["backend", "admin"],
        dependencies: ["subscriptions"]
      }
    ],
    services: [
      {
        module_id: "service_catalog",
        title: "Service catalog",
        purpose: "Represent services, packages, and add-ons.",
        workstreams: ["backend", "public_frontend"],
        dependencies: ["catalog"]
      },
      {
        module_id: "booking_requests",
        title: "Booking or quote requests",
        purpose: "Capture service requests, quotes, and scheduling.",
        workstreams: ["backend", "public_frontend"],
        dependencies: ["service_catalog"]
      }
    ]
  };
  return {
    mode,
    modules: [...commonModules, ...(modeModules[mode] || [])],
    dependency_map: [...commonModules, ...(modeModules[mode] || [])].map((module) => ({
      module_id: module.module_id,
      dependencies: module.dependencies
    })),
    plugin_candidates: ["payments", "shipping", "analytics", "notifications"],
    design_summary: design
  };
}

function buildEcommerceTasks(project, modules, deliveryMode = "structured") {
  if (!modules || !Array.isArray(modules.modules) || modules.modules.length === 0) {
    throw new Error("Ecommerce tasks blocked: generate the ecommerce modules first.");
  }
  if (!project.planning_review || project.planning_review.status !== "approved") {
    throw new Error("Ecommerce tasks blocked: review and approve the planning pack first with `kvdf ecommerce review --confirm`.");
  }
  const taskTemplates = {
    catalog: ["Build the catalog data flow", "Define item discovery and content rules", "Cover create, update, and browse paths"],
    cart: ["Build cart persistence and totals", "Define quantity and pricing updates", "Cover empty, populated, and invalid states"],
    checkout: ["Build checkout form validation", "Define customer and order review flows", "Cover happy path and validation errors"],
    payments: ["Build payment provider integration", "Define capture, refund, and retry flows", "Cover success, failure, and webhook handling"],
    orders: ["Build the order lifecycle", "Define order statuses and notifications", "Cover create, update, and cancel paths"],
    account: ["Build customer account history", "Define receipts and support views", "Cover login and empty-state handling"],
    admin_dashboard: ["Build the admin operations dashboard", "Define order review and exception handling", "Cover filtering and status views"],
    inventory: ["Build inventory tracking", "Define stock reservation and depletion rules", "Cover low-stock and sold-out states"],
    shipping: ["Build shipping calculations and updates", "Define rates and dispatch rules", "Cover delivery and tracking states"],
    vendors: ["Build vendor onboarding", "Define vendor approval and catalog management", "Cover onboarding and suspension states"],
    payouts: ["Build vendor payout tracking", "Define commission and transfer rules", "Cover payout lifecycle and exceptions"],
    downloads: ["Build secure digital delivery", "Define access links and expiry rules", "Cover download and revoked states"],
    licensing: ["Build licensing controls", "Define license keys and expiry handling", "Cover invalid and renewal states"],
    subscriptions: ["Build recurring billing", "Define renewals and billing events", "Cover trial, active, and cancelled states"],
    entitlements: ["Build entitlement gating", "Define access tiers and member benefits", "Cover upgrade and access-denied states"],
    service_catalog: ["Build service catalog management", "Define packages and add-ons", "Cover browse and edit flows"],
    booking_requests: ["Build quote or booking request flows", "Define scheduling and request lifecycle", "Cover submitted and follow-up states"]
  };
  const tasks = (modules.modules || []).map((module, index) => {
    const template = taskTemplates[module.module_id] || [`Build ${module.title}`, `Define ${module.purpose}`, "Cover happy path and error states"];
    return {
      task_id: `ecommerce-task-${String(index + 1).padStart(3, "0")}`,
      module_id: module.module_id,
      title: module.title,
      workstream: module.workstreams[0] || "backend",
      delivery_mode: deliveryMode,
      acceptance_criteria: template,
      file_boundaries: [
        "plugins/ecommerce-builder/",
        ".kabeeri/ecommerce.json",
        "docs/reports/",
        "plugins/ecommerce-builder/bootstrap.js"
      ]
    };
  });
  return {
    delivery_mode: deliveryMode,
    proposed_tasks: tasks,
    task_count: tasks.length
  };
}

function buildEcommercePlanningReview(project, flags = {}) {
  if (!project.modules) {
    throw new Error("Ecommerce planning review blocked: generate the ecommerce modules first.");
  }
  const now = new Date().toISOString();
  const approved = Boolean(flags.confirm || flags.approve || flags.yes);
  return {
    review_id: `ecommerce-review-${String(project.project_id || "ecommerce").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    status: approved ? "approved" : "reviewed",
    reviewed_at: now,
    reviewed_by: flags.by || flags.actor || "local-user",
    approved_at: approved ? now : null,
    approved_by: approved ? (flags.by || flags.actor || "local-user") : null,
    summary: {
      brief_summary: project.brief,
      design_summary: project.design,
      module_count: Array.isArray(project.modules.modules) ? project.modules.modules.length : 0,
      notes: flags.note || flags.summary || "Planning pack reviewed for task generation."
    },
    next_action: approved ? "kvdf ecommerce tasks" : "kvdf ecommerce review --confirm"
  };
}

function buildEcommerceApproval(project, taskPlan, flags = {}) {
  const batchId = flags.batch || `ecommerce-batch-${String(project.approvals.length + 1).padStart(3, "0")}`;
  const blockers = [];
  if (!project.brief) blockers.push("Run `kvdf ecommerce brief` first.");
  if (!project.design) blockers.push("Run `kvdf ecommerce design` first.");
  if (!taskPlan || !Array.isArray(taskPlan.proposed_tasks) || taskPlan.proposed_tasks.length === 0) blockers.push("Run `kvdf ecommerce tasks` first.");
  if (Array.isArray(project.intake?.missing_answers) && project.intake.missing_answers.length) {
    blockers.push(`Answer remaining questionnaire items first: ${project.intake.missing_answers.join(", ")}.`);
  }
  const approved = Boolean(flags.confirm || flags.approve || flags.yes) && blockers.length === 0;
  return {
    batch_id: batchId,
    approved,
    blockers,
    tasks: (taskPlan && taskPlan.proposed_tasks) || [],
    next_action: approved ? "kvdf task assign" : "kvdf ecommerce report"
  };
}

function buildEcommerceReport(project) {
  const stageOrder = ["intake", "questionnaire", "brief", "design", "modules", "review", "tasks", "approval", "execution"];
  const stageIndex = Math.max(stageOrder.indexOf(project.stage || "intake"), 0);
  const bundleContract = project && project.artifacts ? project.artifacts.bundle_contract || null : null;
  const nextActions = [];
  if (!project.intake || !project.intake.questions.length) nextActions.push("Run `kvdf ecommerce questionnaire` to capture project answers.");
  else if (Array.isArray(project.intake.missing_answers) && project.intake.missing_answers.length) nextActions.push(`Answer remaining questionnaire items: ${project.intake.missing_answers.join(", ")}.`);
  else if (!project.brief) nextActions.push("Run `kvdf ecommerce brief` to generate the brief artifacts.");
  else if (!project.design) nextActions.push("Run `kvdf ecommerce design` to map the UI and modules.");
  else if (!project.modules) nextActions.push("Run `kvdf ecommerce modules` to define the runtime modules.");
  else if (!project.planning_review || project.planning_review.status !== "approved") nextActions.push("Run `kvdf ecommerce review --confirm` to approve the planning pack.");
  else if (!project.tasks) nextActions.push("Run `kvdf ecommerce tasks` to create the approval-ready backlog.");
  else if (!project.approvals.length) nextActions.push("Run `kvdf ecommerce approve` to package an execution batch.");
  else nextActions.push("Use the approved ecommerce batch with the governed task pipeline.");
  return {
    report_type: "ecommerce_builder_report",
    generated_at: new Date().toISOString(),
    project_id: project.project_id,
    mode: project.mode,
    stage: project.stage,
    status: project.status,
    bundle_contract: bundleContract,
    bundle_contract_status: bundleContract ? bundleContract.status : "unknown",
    summary: {
      stage_index: stageIndex,
      questions: project.intake.questions.length,
      answers: project.intake.answers.length,
      modules: project.modules ? project.modules.modules.length : 0,
      tasks: project.tasks ? project.tasks.task_count : 0,
      batches: project.approvals.length
    },
    blockers: project.blockers || [],
    next_actions: nextActions,
    next_exact_action: nextActions[0] || null,
    artifacts: project.artifacts || {}
  };
}

function updateCurrentProject(updatedProject, writeJsonFileFn = writeJsonFile) {
  const state = readEcommerceState();
  const hasProject = state.projects.some((item) => item.project_id === updatedProject.project_id);
  const nextState = {
    ...state,
    current_project_id: updatedProject.project_id,
    projects: hasProject
      ? state.projects.map((item) => item.project_id === updatedProject.project_id ? updatedProject : item)
      : [...state.projects, updatedProject],
    updated_at: new Date().toISOString(),
    events: [
      ...state.events,
      {
        event_id: `ecommerce-event-${String(state.events.length + 1).padStart(3, "0")}`,
        event_type: `project.${updatedProject.stage}`,
        project_id: updatedProject.project_id,
        mode: updatedProject.mode,
        stage: updatedProject.stage,
        generated_at: new Date().toISOString()
      }
    ]
  };
  persistEcommerceState(nextState, writeJsonFileFn);
  return nextState;
}

function buildEcommerceBundleState(plugin, mode, stage, nextExactAction) {
  const fallback = {
    plugin_id: "ecommerce-builder",
    name: "Ecommerce Builder",
    bundle_path: "plugins/ecommerce-builder",
    plugin_family: "app_builder",
    plugin_type: "ecommerce",
    bundle_type: "removable",
    track: "app",
    state_file: ECOMMERCE_STATE_FILE,
    enabled: Boolean(plugin && plugin.enabled),
    status: plugin && plugin.bundle_contract ? plugin.bundle_contract.status : "unknown",
    required_folders: ["commands", "docs", "prompts", "schemas", "templates", "tests"],
    optional_folders: ["references", "examples", "assets", "dashboard", "business-type"],
    domain_folders: ["business-type", "references", "examples", "assets", "dashboard"],
    command_surface: [
      "kvdf ecommerce status",
      "kvdf ecommerce init",
      "kvdf ecommerce questionnaire",
      "kvdf ecommerce brief",
      "kvdf ecommerce design",
      "kvdf ecommerce modules",
      "kvdf ecommerce review",
      "kvdf ecommerce tasks",
      "kvdf ecommerce approve",
      "kvdf ecommerce report",
      "kvdf plugins install ecommerce-builder",
      "kvdf plugins uninstall ecommerce-builder"
    ],
    docs_surface: [
      "plugins/ecommerce-builder/README.md",
      "plugins/ecommerce-builder/docs/index.md",
      "plugins/ecommerce-builder/docs/cli.md"
    ]
  };
  const base = plugin && plugin.bundle_contract ? plugin.bundle_contract : buildEcommerceBundleContract(fallback, { ready_action: nextExactAction });
  return {
    ...base,
    current_mode: mode || null,
    current_stage: stage || "intake",
    runtime_stages: ["init", "questionnaire", "brief", "design", "modules", "review", "tasks", "approve", "report"],
    next_exact_action: nextExactAction || base.next_exact_action
  };
}

module.exports = {
  ECOMMERCE_STATE_FILE,
  ensureEcommerceState,
  readEcommerceState,
  persistEcommerceState,
  createEcommerceProject,
  requireCurrentEcommerceProject,
  parseEcommerceAnswers,
  buildEcommerceQuestions,
  buildEcommerceBrief,
  buildEcommerceDesign,
  buildEcommerceModules,
  buildEcommerceTasks,
  buildEcommercePlanningReview,
  buildEcommerceApproval,
  buildEcommerceReport,
  normalizeEcommerceMode,
  getCurrentEcommerceProject,
  updateCurrentProject
};
