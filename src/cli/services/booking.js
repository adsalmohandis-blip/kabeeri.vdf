const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { buildPluginBundleContract } = require("./plugin_bundle_contract");

const BOOKING_STATE_FILE = ".kabeeri/booking.json";
const SUPPORTED_MODES = ["appointments", "services", "classes", "hotels", "events"];

function ensureBookingState(writeJsonFileFn = writeJsonFile, fileExistsFn = fileExists) {
  if (fileExistsFn(BOOKING_STATE_FILE)) {
    const state = normalizeBookingState(readJsonFile(BOOKING_STATE_FILE));
    writeJsonFileFn(BOOKING_STATE_FILE, state);
    return state;
  }
  const state = createEmptyBookingState();
  writeJsonFileFn(BOOKING_STATE_FILE, state);
  return state;
}

function createEmptyBookingState() {
  return {
    schema_version: "v1",
    plugin_id: "booking-builder",
    updated_at: null,
    current_project_id: null,
    projects: [],
    events: []
  };
}

function normalizeBookingState(state) {
  const normalized = state && typeof state === "object" ? { ...state } : createEmptyBookingState();
  normalized.schema_version = normalized.schema_version || "v1";
  normalized.plugin_id = normalized.plugin_id || "booking-builder";
  normalized.updated_at = normalized.updated_at || null;
  normalized.current_project_id = normalized.current_project_id || null;
  normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
  normalized.events = Array.isArray(normalized.events) ? normalized.events : [];
  normalized.projects = normalized.projects.map((project) => normalizeBookingProject(project));
  return normalized;
}

function normalizeBookingProject(project) {
  const normalized = project && typeof project === "object" ? { ...project } : {};
  normalized.project_id = normalized.project_id || `booking-${Date.now()}`;
  normalized.slug = normalized.slug || slugifyBookingName(normalized.name || normalized.project_id);
  normalized.name = normalized.name || "Booking Project";
  normalized.mode = normalizeBookingMode(normalized.mode || normalized.project_mode || "appointments");
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
  normalized.next_action = normalized.next_action || "kvdf booking questionnaire";
  normalized.artifacts = normalized.artifacts || {};
  return normalized;
}

function readBookingState() {
  return fileExists(BOOKING_STATE_FILE)
    ? normalizeBookingState(readJsonFile(BOOKING_STATE_FILE))
    : createEmptyBookingState();
}

function upsertCurrentProject(state, project) {
  const normalizedState = normalizeBookingState(state);
  const normalizedProject = normalizeBookingProject(project);
  const nextProjects = normalizedState.projects.filter((item) => item.project_id !== normalizedProject.project_id);
  nextProjects.push(normalizedProject);
  normalizedState.projects = nextProjects.sort((a, b) => a.created_at.localeCompare(b.created_at));
  normalizedState.current_project_id = normalizedProject.project_id;
  normalizedState.updated_at = new Date().toISOString();
  normalizedState.events.push({
    event_id: `booking-event-${String(normalizedState.events.length + 1).padStart(3, "0")}`,
    event_type: "project.upserted",
    project_id: normalizedProject.project_id,
    mode: normalizedProject.mode,
    stage: normalizedProject.stage,
    generated_at: normalizedState.updated_at
  });
  return normalizedState;
}

function persistBookingState(state, writeJsonFileFn = writeJsonFile) {
  const normalized = normalizeBookingState(state);
  writeJsonFileFn(BOOKING_STATE_FILE, normalized);
  return normalized;
}

function getCurrentBookingProject(state) {
  const normalized = normalizeBookingState(state);
  if (!normalized.projects.length) return null;
  if (normalized.current_project_id) {
    const current = normalized.projects.find((item) => item.project_id === normalized.current_project_id);
    if (current) return current;
  }
  return normalized.projects[normalized.projects.length - 1];
}

function inferBookingMode(value) {
  const text = String(value || "").toLowerCase();
  if (/hotel|room|stay|resort/.test(text)) return "hotels";
  if (/class|course|workshop|training/.test(text)) return "classes";
  if (/event|ticket|venue|conference|concert/.test(text)) return "events";
  if (/service|salon|clinic|consult|appointment/.test(text)) return "services";
  return "appointments";
}

function normalizeBookingMode(value) {
  const mode = String(value || "").toLowerCase();
  return SUPPORTED_MODES.includes(mode) ? mode : "appointments";
}

function slugifyBookingName(value) {
  return String(value || "booking-project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "booking-project";
}

function createBookingProject(value, flags = {}, deps = {}) {
  const { writeJsonFile: writeJsonFileFn = writeJsonFile, fileExists: fileExistsFn = fileExists } = deps;
  const plugin = deps.plugin || null;
  const state = readBookingState();
  const description = [value, flags.description, flags.goal, flags.text]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .join(" ")
    .trim();
  const name = flags.name || flags.title || description || "Booking Project";
  const mode = normalizeBookingMode(flags.mode || inferBookingMode(description));
  const project = normalizeBookingProject({
    project_id: flags.id || `booking-${slugifyBookingName(name)}`,
    slug: slugifyBookingName(flags.slug || name),
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
    next_action: "kvdf booking questionnaire",
    artifacts: {
      bundle_contract: buildBookingBundleContract(plugin, mode, "intake", "kvdf booking questionnaire")
    }
  });
  const nextState = upsertCurrentProject(state, project);
  persistBookingState(nextState, writeJsonFileFn);
  return getCurrentBookingProject(nextState);
}

function requireCurrentBookingProject(state) {
  const project = getCurrentBookingProject(state);
  if (!project) {
    throw new Error("Booking runtime blocked: initialize a booking project first with `kvdf booking init`.");
  }
  return project;
}

function parseBookingAnswers(flags = {}, rest = []) {
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

function buildBookingQuestions(mode) {
  const common = [
    {
      question_id: "booking.goal",
      text: "What is the booking goal and who is the primary audience?",
      choices: ["appointments", "services", "classes", "hotels", "events"],
      required: true
    },
    {
      question_id: "booking.timezone",
      text: "What timezone should booking rules use?",
      required: true
    },
    {
      question_id: "booking.payment",
      text: "Is payment, deposit, or invoice handling required?",
      choices: ["none", "deposit", "full_payment", "invoice", "mixed"],
      required: true
    },
    {
      question_id: "booking.reminders",
      text: "Should confirmations and reminders be sent automatically?",
      choices: ["yes", "no", "manual"],
      required: true
    },
    {
      question_id: "booking.reschedule",
      text: "Can customers reschedule or cancel themselves?",
      choices: ["yes", "no", "staff_only"],
      required: true
    },
    {
      question_id: "booking.admin_roles",
      text: "Which staff roles manage availability and bookings?",
      required: true
    }
  ];
  const modeSpecific = {
    appointments: [
      { question_id: "booking.appointment_duration", text: "What is the default appointment duration?", required: true },
      { question_id: "booking.practitioner_schedule", text: "Do practitioners manage their own calendars?", choices: ["yes", "no"], required: true }
    ],
    services: [
      { question_id: "booking.service_catalog", text: "What services can be booked and what durations do they need?", required: true },
      { question_id: "booking.staff_assignment", text: "Should services be assigned to one or more staff members?", choices: ["yes", "no"], required: true }
    ],
    classes: [
      { question_id: "booking.capacity", text: "What is the capacity for each class or workshop?", required: true },
      { question_id: "booking.waitlist", text: "Should waitlists and roster management be supported?", choices: ["yes", "no"], required: true }
    ],
    hotels: [
      { question_id: "booking.room_inventory", text: "What room or unit types are available?", required: true },
      { question_id: "booking.checkin_checkout", text: "What are the check-in and check-out rules?", required: true }
    ],
    events: [
      { question_id: "booking.ticketing", text: "Will the event use tickets, reservations, or both?", choices: ["tickets", "reservations", "both"], required: true },
      { question_id: "booking.capacity_controls", text: "Do you need capacity, seating, or RSVP controls?", required: true }
    ]
  };
  return [...common, ...(modeSpecific[mode] || [])];
}

function buildBookingBrief(project, answers = []) {
  const missingAnswers = Array.isArray(project.intake?.missing_answers) ? project.intake.missing_answers : [];
  if (missingAnswers.length) {
    throw new Error(`Booking brief blocked: answer all questionnaire items first (${missingAnswers.join(", ")}).`);
  }
  const mode = normalizeBookingMode(project.mode);
  const summary = {
    mode,
    audience: answers.find((item) => item.field === "booking.goal")?.value || project.name,
    booking_rules: mode === "hotels"
      ? ["room inventory", "stay length", "availability windows", "check-in/out"]
      : mode === "classes"
        ? ["capacity", "schedule windows", "waitlist", "roster"]
        : mode === "events"
          ? ["ticketing", "capacity control", "venue windows", "check-in"]
          : ["availability", "booking duration", "reminders", "reschedule policy"],
    ui: [
      "landing page with clear booking CTA",
      "booking form with validation",
      "customer confirmation and history",
      "admin scheduling dashboard"
    ],
    system: [
      "durable booking state",
      "conflict checks",
      "notification hooks",
      "reviewable approval trail"
    ],
    data: [
      "customers",
      "availability",
      "bookings",
      "notifications"
    ]
  };
  if (mode === "hotels") summary.data.push("rooms", "rates", "stay_rules");
  if (mode === "events") summary.data.push("tickets", "capacity_controls", "checkins");
  if (mode === "classes") summary.data.push("sessions", "waitlists", "rosters");
  return summary;
}

function buildBookingDesign(project, brief) {
  if (!brief) {
    throw new Error("Booking design blocked: generate the booking brief first.");
  }
  const mode = normalizeBookingMode(project.mode);
  const basePages = [
    { page_id: "landing", purpose: "Service discovery and booking entry" },
    { page_id: "booking_form", purpose: "Reservation capture and validation" },
    { page_id: "confirmation", purpose: "Booking receipt and next steps" },
    { page_id: "customer_account", purpose: "Self-service booking history and rescheduling" }
  ];
  const modePages = {
    appointments: [
      { page_id: "practitioner_schedule", purpose: "Calendar for practitioner availability" }
    ],
    services: [
      { page_id: "service_catalog", purpose: "Browse services and choose add-ons" }
    ],
    classes: [
      { page_id: "class_calendar", purpose: "Browse sessions and waitlist options" }
    ],
    hotels: [
      { page_id: "room_picker", purpose: "Search rooms, rates, and stay windows" }
    ],
    events: [
      { page_id: "ticket_selection", purpose: "Choose ticket tiers and seating" }
    ]
  };
  const moduleHints = {
    booking: "Core reservation creation, validation, and confirmation",
    availability: "Availability windows, blackout periods, and conflict checks",
    reminders: "Confirmation, reminder, and follow-up notifications",
    reschedule: "Reschedule and cancellation flows",
    customer_account: "Customer history and self-service",
    admin_dashboard: "Staff scheduling and booking administration"
  };
  return {
    mode,
    ui_patterns: [
      "public landing CTA",
      "form-stepper",
      "confirmation receipt",
      "calendar panel"
    ],
    system_patterns: [
      "durable state machine",
      "availability guard",
      "notification queue",
      "audit-friendly transitions"
    ],
    page_map: [...basePages, ...(modePages[mode] || [])],
    module_hints: moduleHints,
    brief_summary: brief
  };
}

function buildBookingModules(project, design) {
  if (!design) {
    throw new Error("Booking modules blocked: generate the booking design first.");
  }
  const mode = normalizeBookingMode(project.mode);
  const commonModules = [
    {
      module_id: "booking",
      title: "Reservation engine",
      purpose: "Create and validate reservations safely.",
      workstreams: ["backend", "public_frontend"],
      dependencies: []
    },
    {
      module_id: "availability",
      title: "Availability and conflict checks",
      purpose: "Prevent overlaps, enforce windows, and manage blackout rules.",
      workstreams: ["backend"],
      dependencies: ["booking"]
    },
    {
      module_id: "reminders",
      title: "Notifications and reminders",
      purpose: "Send confirmations and reminder messages.",
      workstreams: ["backend", "integration"],
      dependencies: ["booking"]
    },
    {
      module_id: "reschedule",
      title: "Reschedule and cancellation",
      purpose: "Support change and cancellation workflows.",
      workstreams: ["backend", "public_frontend"],
      dependencies: ["booking", "availability"]
    },
    {
      module_id: "customer_account",
      title: "Customer self-service",
      purpose: "Show booking history, receipts, and rescheduling.",
      workstreams: ["public_frontend", "backend"],
      dependencies: ["booking"]
    },
    {
      module_id: "admin_dashboard",
      title: "Staff scheduling dashboard",
      purpose: "Allow staff to manage reservations, capacity, and exceptions.",
      workstreams: ["admin", "backend"],
      dependencies: ["booking", "availability"]
    }
  ];
  const modeModules = {
    appointments: [
      {
        module_id: "practitioner_schedule",
        title: "Practitioner calendar",
        purpose: "Track provider availability and working hours.",
        workstreams: ["backend"],
        dependencies: ["availability"]
      }
    ],
    services: [
      {
        module_id: "service_catalog",
        title: "Service catalog",
        purpose: "Describe bookable services, durations, and add-ons.",
        workstreams: ["backend", "admin"],
        dependencies: ["booking"]
      },
      {
        module_id: "staff_assignment",
        title: "Staff assignment",
        purpose: "Assign services to staff and manage capacity.",
        workstreams: ["backend", "admin"],
        dependencies: ["availability"]
      }
    ],
    classes: [
      {
        module_id: "class_calendar",
        title: "Class calendar",
        purpose: "Handle schedules, sessions, rosters, and waitlists.",
        workstreams: ["backend", "admin"],
        dependencies: ["availability"]
      }
    ],
    hotels: [
      {
        module_id: "room_inventory",
        title: "Room inventory",
        purpose: "Track room types, quantities, and occupancy rules.",
        workstreams: ["backend", "admin"],
        dependencies: ["availability"]
      },
      {
        module_id: "rate_plans",
        title: "Rate plans",
        purpose: "Manage seasonal pricing, nightly rates, and booking rules.",
        workstreams: ["backend", "admin"],
        dependencies: ["room_inventory"]
      }
    ],
    events: [
      {
        module_id: "ticketing",
        title: "Ticketing and RSVP",
        purpose: "Sell tickets or handle RSVP registration.",
        workstreams: ["backend", "public_frontend"],
        dependencies: ["booking"]
      },
      {
        module_id: "checkin_gate",
        title: "Check-in and admission",
        purpose: "Scan or confirm attendance at the event gate.",
        workstreams: ["backend", "admin"],
        dependencies: ["ticketing"]
      }
    ]
  };
  return {
    mode,
    modules: [...commonModules, ...(modeModules[mode] || [])],
    dependency_map: [...commonModules, ...(modeModules[mode] || [])]
      .map((module) => ({ module_id: module.module_id, dependencies: module.dependencies })),
    plugin_candidates: ["calendar", "payments", "notifications", "analytics"],
    design_summary: design
  };
}

function buildBookingTasks(project, modules, deliveryMode = "structured") {
  if (!modules || !Array.isArray(modules.modules) || modules.modules.length === 0) {
    throw new Error("Booking tasks blocked: generate the booking modules first.");
  }
  if (!project.planning_review || project.planning_review.status !== "approved") {
    throw new Error("Booking tasks blocked: review and approve the planning pack first with `kvdf booking review --confirm`.");
  }
  const taskTemplates = {
    booking: ["Build reservation creation and validation", "Define booking data flow and persistence", "Cover create/update/cancel paths"],
    availability: ["Build availability conflict checks", "Define blackout and slot rules", "Cover overlaps and time windows"],
    reminders: ["Build confirmation and reminder notifications", "Define notification triggers and templates", "Cover retry and delivery failure paths"],
    reschedule: ["Build reschedule and cancellation flows", "Define self-service and staff-only actions", "Cover state changes and audit trail"],
    customer_account: ["Build customer booking history", "Define self-service history and receipts", "Cover login and empty-state handling"],
    admin_dashboard: ["Build staff scheduling dashboard", "Define review and exception handling", "Cover admin filters and overview states"],
    practitioner_schedule: ["Build practitioner availability calendar", "Define provider working hours and exceptions", "Cover calendar edits and blocked times"],
    service_catalog: ["Build service catalog management", "Define service durations and add-ons", "Cover service create and edit flows"],
    staff_assignment: ["Build staff assignment workflows", "Define assignment capacity and ownership", "Cover reassignment and unassigned states"],
    class_calendar: ["Build class calendar and waitlist flows", "Define recurrence and roster state", "Cover waitlist promotion and capacity"],
    room_inventory: ["Build room inventory management", "Define room types and occupancy", "Cover availability and sold-out states"],
    rate_plans: ["Build rate plan management", "Define seasonal and nightly pricing", "Cover rate selection and fallback states"],
    ticketing: ["Build ticketing and RSVP flows", "Define ticket tiers and attendee capture", "Cover sold-out and confirmation states"],
    checkin_gate: ["Build check-in and admission flows", "Define gate validation and attendance", "Cover scan and manual fallback paths"]
  };
  const tasks = (modules.modules || []).map((module, index) => {
    const template = taskTemplates[module.module_id] || [`Build ${module.title}`, `Define ${module.purpose}`, "Cover happy path and error states"];
    return {
      task_id: `booking-task-${String(index + 1).padStart(3, "0")}`,
      module_id: module.module_id,
      title: module.title,
      workstream: module.workstreams[0] || "backend",
      delivery_mode: deliveryMode,
      acceptance_criteria: template,
      file_boundaries: [
        "plugins/booking-builder/",
        ".kabeeri/booking.json",
        "docs/reports/",
        "src/cli/commands/booking.js"
      ]
    };
  });
  return {
    delivery_mode: deliveryMode,
    proposed_tasks: tasks,
    task_count: tasks.length
  };
}

function buildBookingPlanningReview(project, flags = {}) {
  if (!project.modules) {
    throw new Error("Booking planning review blocked: generate the booking modules first.");
  }
  const now = new Date().toISOString();
  const approved = Boolean(flags.confirm || flags.approve || flags.yes);
  return {
    review_id: `booking-review-${String(project.project_id || "booking").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
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
    next_action: approved ? "kvdf booking tasks" : "kvdf booking review --confirm"
  };
}

function buildBookingApproval(project, taskPlan, flags = {}) {
  const batchId = flags.batch || `booking-batch-${String(project.approvals.length + 1).padStart(3, "0")}`;
  const blockers = [];
  if (!project.brief) blockers.push("Run `kvdf booking brief` first.");
  if (!project.design) blockers.push("Run `kvdf booking design` first.");
  if (!taskPlan || !Array.isArray(taskPlan.proposed_tasks) || taskPlan.proposed_tasks.length === 0) blockers.push("Run `kvdf booking tasks` first.");
  if (Array.isArray(project.intake?.missing_answers) && project.intake.missing_answers.length) {
    blockers.push(`Answer remaining questionnaire items first: ${project.intake.missing_answers.join(", ")}.`);
  }
  const approved = Boolean(flags.confirm || flags.approve || flags.yes) && blockers.length === 0;
  return {
    batch_id: batchId,
    approved,
    blockers,
    tasks: (taskPlan && taskPlan.proposed_tasks) || [],
    next_action: approved ? "kvdf task assign" : "kvdf booking report"
  };
}

function buildBookingReport(project) {
  const stageOrder = ["intake", "questionnaire", "brief", "design", "modules", "review", "tasks", "approval", "execution"];
  const stageIndex = Math.max(stageOrder.indexOf(project.stage || "intake"), 0);
  const bundleContract = project && project.artifacts ? project.artifacts.bundle_contract || null : null;
  const nextActions = [];
  if (!project.intake || !project.intake.questions.length) nextActions.push("Run `kvdf booking questionnaire` to capture project answers.");
  else if (Array.isArray(project.intake.missing_answers) && project.intake.missing_answers.length) nextActions.push(`Answer remaining questionnaire items: ${project.intake.missing_answers.join(", ")}.`);
  else if (!project.brief) nextActions.push("Run `kvdf booking brief` to generate the brief artifacts.");
  else if (!project.design) nextActions.push("Run `kvdf booking design` to map the UI and modules.");
  else if (!project.modules) nextActions.push("Run `kvdf booking modules` to define the runtime modules.");
  else if (!project.planning_review || project.planning_review.status !== "approved") nextActions.push("Run `kvdf booking review --confirm` to approve the planning pack.");
  else if (!project.tasks) nextActions.push("Run `kvdf booking tasks` to create the approval-ready backlog.");
  else if (!project.approvals.length) nextActions.push("Run `kvdf booking approve` to package an execution batch.");
  else nextActions.push("Use the approved booking batch with the governed task pipeline.");
  return {
    report_type: "booking_builder_report",
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
    artifacts: project.artifacts || {},
    timeline: project.events || []
  };
}

function updateCurrentProject(state, updater) {
  const normalized = normalizeBookingState(state);
  const project = requireCurrentBookingProject(normalized);
  const updatedProject = normalizeBookingProject(updater({ ...project }));
  const nextState = upsertCurrentProject(normalized, updatedProject);
  return nextState;
}

function buildBookingBundleContract(plugin, mode, stage, nextExactAction) {
  const fallback = {
    plugin_id: "booking-builder",
    name: "Booking Builder",
    bundle_path: "plugins/booking-builder",
    plugin_family: "app_builder",
    plugin_type: "booking",
    bundle_type: "removable",
    track: "app",
    state_file: BOOKING_STATE_FILE,
    enabled: Boolean(plugin && plugin.enabled),
    status: plugin && plugin.bundle_contract ? plugin.bundle_contract.status : "unknown",
    required_folders: ["commands", "docs", "prompts", "schemas", "templates", "tests"],
    optional_folders: ["references", "examples", "assets", "dashboard", "business-type"],
    domain_folders: ["business-type", "references", "examples", "assets", "dashboard"],
    command_surface: [
      "kvdf booking status",
      "kvdf booking init",
      "kvdf booking questionnaire",
      "kvdf booking brief",
      "kvdf booking design",
      "kvdf booking modules",
      "kvdf booking review",
      "kvdf booking tasks",
      "kvdf booking approve",
      "kvdf booking report",
      "kvdf plugins install booking-builder",
      "kvdf plugins uninstall booking-builder"
    ],
    docs_surface: [
      "plugins/booking-builder/README.md",
      "plugins/booking-builder/docs/index.md",
      "plugins/booking-builder/docs/cli.md"
    ]
  };
  const base = plugin && plugin.bundle_contract ? plugin.bundle_contract : buildPluginBundleContract(fallback, { ready_action: nextExactAction });
  return {
    ...base,
    current_mode: mode || null,
    current_stage: stage || "intake",
    runtime_stages: ["init", "questionnaire", "brief", "design", "modules", "review", "tasks", "approve", "report"],
    next_exact_action: nextExactAction || base.next_exact_action
  };
}

module.exports = {
  BOOKING_STATE_FILE,
  ensureBookingState,
  readBookingState,
  persistBookingState,
  createBookingProject,
  requireCurrentBookingProject,
  getCurrentBookingProject,
  parseBookingAnswers,
  buildBookingQuestions,
  buildBookingBrief,
  buildBookingDesign,
  buildBookingModules,
  buildBookingTasks,
  buildBookingPlanningReview,
  buildBookingApproval,
  buildBookingReport,
  inferBookingMode,
  normalizeBookingMode,
  slugifyBookingName,
  updateCurrentProject
};
