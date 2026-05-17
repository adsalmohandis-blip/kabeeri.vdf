const {
  BOOKING_STATE_FILE,
  ensureBookingState,
  readBookingState,
  persistBookingState,
  createBookingProject,
  requireCurrentBookingProject,
  parseBookingAnswers,
  buildBookingQuestions,
  buildBookingBrief,
  buildBookingDesign,
  buildBookingModules,
  buildBookingTasks,
  buildBookingPlanningReview,
  buildBookingApproval,
  buildBookingReport,
  getCurrentBookingProject
} = require("../runtime/booking");

function booking(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    writeJsonFile = () => {},
    table = () => "",
    appendAudit = () => {},
    plugin = null
  } = deps;

  ensureWorkspace();
  const bookingPlugin = getBookingPluginStatus(plugin);
  const state = ensureBookingState(writeJsonFile);

  if (!action || action === "help" || action === "status" || action === "list") {
    const report = buildBookingStatusReport(state, bookingPlugin);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderBookingStatusReport(report, table);
    return;
  }

  if (!bookingPlugin.enabled) {
    throw new Error(`Booking plugin blocked: ${bookingPlugin.status === "disabled" ? "enable" : "install"} booking-builder first with \`kvdf plugins ${bookingPlugin.status === "disabled" ? "enable" : "install"} booking-builder\`.`);
  }

  if (action === "init") {
    const description = [value, ...rest, flags.description, flags.goal, flags.text].filter(Boolean).join(" ").trim();
    const project = createBookingProject(description, flags, { writeJsonFile, plugin: bookingPlugin });
    const report = buildBookingStatusReport(readBookingState(), bookingPlugin, project);
    appendAudit("booking.project_created", "booking", project.project_id, `Booking project created: ${project.project_id}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderBookingStatusReport(report, table);
    return;
  }

  const currentProject = requireCurrentBookingProject(state);

  if (action === "questionnaire") {
    const answers = parseBookingAnswers(flags, rest);
    const questions = buildBookingQuestions(currentProject.mode);
    const answeredFields = answers.map((item) => item.field);
    const missingAnswers = questions
      .filter((question) => !answeredFields.includes(question.question_id))
      .map((question) => question.question_id);
    const updatedProject = {
      ...currentProject,
      stage: "questionnaire",
      intake: {
        questions,
        answers,
        answered_fields: answeredFields,
        missing_answers: missingAnswers
      },
      blockers: missingAnswers.length ? [`Missing answers: ${missingAnswers.join(", ")}`] : [],
      next_action: missingAnswers.length ? "kvdf booking questionnaire" : "kvdf booking brief",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.questionnaire", "booking", updatedProject.project_id, `Booking questionnaire prepared: ${updatedProject.project_id}`);
    const report = buildBookingStatusReport(nextState, bookingPlugin, updatedProject);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderBookingStatusReport(report, table);
    return;
  }

  if (action === "brief") {
    if (!currentProject.intake || !Array.isArray(currentProject.intake.questions) || currentProject.intake.questions.length === 0) {
      throw new Error("Booking brief blocked: run `kvdf booking questionnaire` first.");
    }
    if (Array.isArray(currentProject.intake.missing_answers) && currentProject.intake.missing_answers.length) {
      throw new Error(`Booking brief blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
    }
    const brief = buildBookingBrief(currentProject, currentProject.intake.answers || []);
    const updatedProject = {
      ...currentProject,
      stage: "brief",
      brief,
      blockers: [],
      next_action: "kvdf booking design",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.brief", "booking", updatedProject.project_id, `Booking brief generated: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "design") {
    if (!currentProject.brief) throw new Error("Booking design blocked: run `kvdf booking brief` first.");
    const design = buildBookingDesign(currentProject, currentProject.brief);
    const updatedProject = {
      ...currentProject,
      stage: "design",
      design,
      blockers: [],
      next_action: "kvdf booking modules",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.design", "booking", updatedProject.project_id, `Booking design mapped: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "modules") {
    if (!currentProject.design) throw new Error("Booking modules blocked: run `kvdf booking design` first.");
    const modules = buildBookingModules(currentProject, currentProject.design);
    const updatedProject = {
      ...currentProject,
      stage: "modules",
      modules,
      blockers: [],
      next_action: "kvdf booking review",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.modules", "booking", updatedProject.project_id, `Booking modules derived: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "review") {
    if (!currentProject.modules) throw new Error("Booking planning review blocked: run `kvdf booking modules` first.");
    const review = buildBookingPlanningReview(currentProject, flags);
    const updatedProject = {
      ...currentProject,
      stage: "review",
      planning_review: review,
      blockers: review.status === "approved" ? [] : ["Planning pack reviewed and awaiting approval confirmation."],
      next_action: review.next_action,
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.review", "booking", updatedProject.project_id, `Booking planning pack reviewed: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "tasks") {
    if (!currentProject.modules) throw new Error("Booking tasks blocked: run `kvdf booking modules` first.");
    const deliveryMode = flags.delivery || (currentProject.mode === "hotels" || currentProject.mode === "events" ? "structured" : "agile");
    const tasks = buildBookingTasks(currentProject, currentProject.modules, deliveryMode);
    const updatedProject = {
      ...currentProject,
      stage: "tasks",
      tasks,
      blockers: [],
      next_action: "kvdf booking approve",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.tasks", "booking", updatedProject.project_id, `Booking tasks synthesized: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "approve") {
    if (!currentProject.tasks || !Array.isArray(currentProject.tasks.proposed_tasks) || currentProject.tasks.proposed_tasks.length === 0) {
      throw new Error("Booking approval blocked: run `kvdf booking tasks` first.");
    }
    if (Array.isArray(currentProject.intake?.missing_answers) && currentProject.intake.missing_answers.length) {
      throw new Error(`Booking approval blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
    }
    const approval = buildBookingApproval(currentProject, currentProject.tasks, flags);
    const updatedProject = {
      ...currentProject,
      stage: approval.approved ? "approval" : currentProject.stage,
      approvals: [...(currentProject.approvals || []), approval],
      blockers: approval.blockers,
      next_action: approval.next_action,
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedBookingProject(updatedProject, writeJsonFile);
    appendAudit("booking.approval", "booking", updatedProject.project_id, `Booking batch packaged: ${approval.batch_id}`);
    if (flags.json) console.log(JSON.stringify(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), null, 2));
    else renderBookingStatusReport(buildBookingStatusReport(nextState, bookingPlugin, updatedProject), table);
    return;
  }

  if (action === "report") {
    const report = buildBookingReport(currentProject);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderBookingReport(report, table);
    return;
  }

  throw new Error(`Unknown booking action: ${action}`);
}

function getBookingPluginStatus(plugin) {
  if (!plugin) {
    return { found: false, enabled: false, status: "uninstalled", plugin_id: "booking-builder" };
  }
  return {
    found: true,
    enabled: Boolean(plugin.enabled),
    status: plugin.status || (plugin.enabled ? "enabled" : "disabled"),
    plugin_id: plugin.plugin_id || "booking-builder",
    bundle_path: plugin.bundle_path || "plugins/booking-builder",
    plugin_family: plugin.plugin_family || null,
    plugin_type: plugin.plugin_type || null,
    required_folders: plugin.required_folders || [],
    optional_folders: plugin.optional_folders || [],
    domain_folders: plugin.domain_folders || [],
    command_surface: plugin.command_surface || [],
    docs_surface: plugin.docs_surface || [],
    bundle_contract: plugin.bundle_contract || null
  };
}

function buildBookingStatusReport(state, plugin, currentProject = null) {
  const project = currentProject || getCurrentBookingProject(state);
  return {
    report_type: "booking_builder_status",
    generated_at: new Date().toISOString(),
    plugin_id: "booking-builder",
    plugin_status: plugin.status,
    plugin_enabled: plugin.enabled,
    bundle_contract: (project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null,
    bundle_contract_status: ((project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null)
      ? ((project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null).status
      : "unknown",
    state_file: BOOKING_STATE_FILE,
    current_project: project ? {
      project_id: project.project_id,
      name: project.name,
      slug: project.slug,
      mode: project.mode,
      stage: project.stage,
      next_action: project.next_action,
      blockers: project.blockers,
      questions: project.intake.questions.length,
      answers: project.intake.answers.length,
      modules: project.modules ? project.modules.modules.length : 0,
      tasks: project.tasks ? project.tasks.task_count : 0,
      planning_review: project.planning_review ? {
        status: project.planning_review.status,
        reviewed_at: project.planning_review.reviewed_at,
        approved_at: project.planning_review.approved_at
      } : null,
      batches: project.approvals.length
    } : null,
    next_exact_action: plugin.enabled ? (project ? project.next_action : "kvdf booking init") : "kvdf plugins install booking-builder",
    next_action: plugin.enabled ? (project ? project.next_action : "kvdf booking init") : "kvdf plugins install booking-builder",
    blockers: project ? project.blockers || [] : [],
    projects: state.projects.length
  };
}

function saveUpdatedBookingProject(updatedProject, writeJsonFile) {
  const state = readBookingState();
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
        event_id: `booking-event-${String(state.events.length + 1).padStart(3, "0")}`,
        event_type: `project.${updatedProject.stage}`,
        project_id: updatedProject.project_id,
        mode: updatedProject.mode,
        stage: updatedProject.stage,
        generated_at: new Date().toISOString()
      }
    ]
  };
  persistBookingState(nextState, writeJsonFile);
  return nextState;
}

function renderBookingStatusReport(report, table) {
  console.log("Kabeeri Booking Builder");
  console.log(table(["Field", "Value"], [
    ["Plugin status", report.plugin_status],
    ["Plugin enabled", report.plugin_enabled ? "yes" : "no"],
    ["Bundle contract", report.bundle_contract_status || "unknown"],
    ["State file", report.state_file],
    ["Project", report.current_project ? report.current_project.project_id : "none"],
    ["Mode", report.current_project ? report.current_project.mode : "none"],
    ["Stage", report.current_project ? report.current_project.stage : "intake"],
    ["Questions", report.current_project ? report.current_project.questions : 0],
    ["Tasks", report.current_project ? report.current_project.tasks : 0],
    ["Batches", report.current_project ? report.current_project.batches : 0]
  ]));
  console.log("");
  console.log("Next action:");
  console.log(`- ${report.next_action}`);
  if (report.blockers && report.blockers.length) {
    console.log("");
    console.log("Blockers:");
    for (const item of report.blockers) console.log(`- ${item}`);
  }
}

function renderBookingReport(report, table) {
  console.log("Booking Builder Report");
  console.log(table(["Field", "Value"], [
    ["Project", report.project_id],
    ["Mode", report.mode],
    ["Stage", report.stage],
    ["Status", report.status],
    ["Bundle contract", report.bundle_contract_status || "unknown"],
    ["Questions", report.summary.questions],
    ["Answers", report.summary.answers],
    ["Modules", report.summary.modules],
    ["Tasks", report.summary.tasks],
    ["Batches", report.summary.batches]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions || []) console.log(`- ${item}`);
  if (report.blockers && report.blockers.length) {
    console.log("");
    console.log("Blockers:");
    for (const item of report.blockers) console.log(`- ${item}`);
  }
}

module.exports = {
  booking,
  buildBookingStatusReport,
  buildBookingReport,
  buildBookingQuestions,
  buildBookingBrief,
  buildBookingDesign,
  buildBookingModules,
  buildBookingTasks
};
