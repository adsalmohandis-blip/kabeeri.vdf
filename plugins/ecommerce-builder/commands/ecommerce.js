const {
  ECOMMERCE_STATE_FILE,
  ensureEcommerceState,
  readEcommerceState,
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
  getCurrentEcommerceProject,
  updateCurrentProject
} = require("../runtime/ecommerce");

function ecommerce(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    writeJsonFile = () => {},
    table = () => "",
    appendAudit = () => {},
    plugin = null
  } = deps;

  ensureWorkspace();
  const ecommercePlugin = getEcommercePluginStatus(plugin);
  const state = ensureEcommerceState(writeJsonFile);

  if (!action || action === "help" || action === "status" || action === "list") {
    const report = buildEcommerceStatusReport(state, ecommercePlugin);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderEcommerceStatusReport(report, table);
    return;
  }

  if (!ecommercePlugin.enabled) {
    throw new Error(`Ecommerce plugin blocked: ${ecommercePlugin.status === "disabled" ? "enable" : "install"} ecommerce-builder first with \`kvdf plugins ${ecommercePlugin.status === "disabled" ? "enable" : "install"} ecommerce-builder\`.`);
  }

  if (action === "init") {
    const description = [value, ...rest, flags.description, flags.goal, flags.text].filter(Boolean).join(" ").trim();
    const project = createEcommerceProject(description, flags, { writeJsonFile, plugin: ecommercePlugin });
    const report = buildEcommerceStatusReport(readEcommerceState(), ecommercePlugin, project);
    appendAudit("ecommerce.project_created", "ecommerce", project.project_id, `Ecommerce project created: ${project.project_id}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderEcommerceStatusReport(report, table);
    return;
  }

  const currentProject = requireCurrentEcommerceProject(state);

  if (action === "questionnaire") {
    const answers = parseEcommerceAnswers(flags, rest);
    const questions = buildEcommerceQuestions(currentProject.mode);
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
      next_action: missingAnswers.length ? "kvdf ecommerce questionnaire" : "kvdf ecommerce brief",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.questionnaire", "ecommerce", updatedProject.project_id, `Ecommerce questionnaire prepared: ${updatedProject.project_id}`);
    const report = buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderEcommerceStatusReport(report, table);
    return;
  }

  if (action === "brief") {
    if (!currentProject.intake || !Array.isArray(currentProject.intake.questions) || currentProject.intake.questions.length === 0) {
      throw new Error("Ecommerce brief blocked: run `kvdf ecommerce questionnaire` first.");
    }
    if (Array.isArray(currentProject.intake.missing_answers) && currentProject.intake.missing_answers.length) {
      throw new Error(`Ecommerce brief blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
    }
    const brief = buildEcommerceBrief(currentProject, currentProject.intake.answers || []);
    const updatedProject = {
      ...currentProject,
      stage: "brief",
      brief,
      blockers: [],
      next_action: "kvdf ecommerce design",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.brief", "ecommerce", updatedProject.project_id, `Ecommerce brief generated: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "design") {
    if (!currentProject.brief) throw new Error("Ecommerce design blocked: run `kvdf ecommerce brief` first.");
    const design = buildEcommerceDesign(currentProject, currentProject.brief);
    const updatedProject = {
      ...currentProject,
      stage: "design",
      design,
      blockers: [],
      next_action: "kvdf ecommerce modules",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.design", "ecommerce", updatedProject.project_id, `Ecommerce design mapped: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "modules") {
    if (!currentProject.design) throw new Error("Ecommerce modules blocked: run `kvdf ecommerce design` first.");
    const modules = buildEcommerceModules(currentProject, currentProject.design);
    const updatedProject = {
      ...currentProject,
      stage: "modules",
      modules,
      blockers: [],
      next_action: "kvdf ecommerce review",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.modules", "ecommerce", updatedProject.project_id, `Ecommerce modules derived: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "review") {
    if (!currentProject.modules) throw new Error("Ecommerce planning review blocked: run `kvdf ecommerce modules` first.");
    const review = buildEcommercePlanningReview(currentProject, flags);
    const updatedProject = {
      ...currentProject,
      stage: "review",
      planning_review: review,
      blockers: review.status === "approved" ? [] : ["Planning pack reviewed and awaiting approval confirmation."],
      next_action: review.next_action,
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.review", "ecommerce", updatedProject.project_id, `Ecommerce planning pack reviewed: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "tasks") {
    if (!currentProject.modules) throw new Error("Ecommerce tasks blocked: run `kvdf ecommerce modules` first.");
    const deliveryMode = flags.delivery || (currentProject.mode === "marketplace" || currentProject.mode === "subscription" ? "structured" : "agile");
    const tasks = buildEcommerceTasks(currentProject, currentProject.modules, deliveryMode);
    const updatedProject = {
      ...currentProject,
      stage: "tasks",
      tasks,
      blockers: [],
      next_action: "kvdf ecommerce approve",
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.tasks", "ecommerce", updatedProject.project_id, `Ecommerce tasks synthesized: ${updatedProject.project_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "approve") {
    if (!currentProject.tasks || !Array.isArray(currentProject.tasks.proposed_tasks) || currentProject.tasks.proposed_tasks.length === 0) {
      throw new Error("Ecommerce approval blocked: run `kvdf ecommerce tasks` first.");
    }
    if (Array.isArray(currentProject.intake?.missing_answers) && currentProject.intake.missing_answers.length) {
      throw new Error(`Ecommerce approval blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
    }
    const approval = buildEcommerceApproval(currentProject, currentProject.tasks, flags);
    const updatedProject = {
      ...currentProject,
      stage: approval.approved ? "approval" : currentProject.stage,
      approvals: [...(currentProject.approvals || []), approval],
      blockers: approval.blockers,
      next_action: approval.next_action,
      updated_at: new Date().toISOString()
    };
    const nextState = saveUpdatedEcommerceProject(updatedProject, writeJsonFile);
    appendAudit("ecommerce.approval", "ecommerce", updatedProject.project_id, `Ecommerce batch packaged: ${approval.batch_id}`);
    if (flags.json) console.log(JSON.stringify(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), null, 2));
    else renderEcommerceStatusReport(buildEcommerceStatusReport(nextState, ecommercePlugin, updatedProject), table);
    return;
  }

  if (action === "report") {
    const report = buildEcommerceReport(currentProject);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderEcommerceReport(report, table);
    return;
  }

  throw new Error(`Unknown ecommerce action: ${action}`);
}

function getEcommercePluginStatus(plugin) {
  if (!plugin) {
    return { found: false, enabled: false, status: "uninstalled", plugin_id: "ecommerce-builder" };
  }
  return {
    found: true,
    enabled: Boolean(plugin.enabled),
    status: plugin.status || (plugin.enabled ? "enabled" : "disabled"),
    plugin_id: plugin.plugin_id || "ecommerce-builder",
    bundle_path: plugin.bundle_path || "plugins/ecommerce-builder",
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

function buildEcommerceStatusReport(state, plugin, currentProject = null) {
  const project = currentProject || getCurrentEcommerceProject(state);
  return {
    report_type: "ecommerce_builder_status",
    generated_at: new Date().toISOString(),
    plugin_id: "ecommerce-builder",
    plugin_status: plugin.status,
    plugin_enabled: plugin.enabled,
    bundle_contract: (project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null,
    bundle_contract_status: ((project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null)
      ? ((project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null).status
      : "unknown",
    state_file: ECOMMERCE_STATE_FILE,
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
    next_exact_action: plugin.enabled ? (project ? project.next_action : "kvdf ecommerce init") : "kvdf plugins install ecommerce-builder",
    next_action: plugin.enabled ? (project ? project.next_action : "kvdf ecommerce init") : "kvdf plugins install ecommerce-builder",
    blockers: project ? project.blockers || [] : [],
    projects: state.projects.length
  };
}

function saveUpdatedEcommerceProject(updatedProject, writeJsonFile) {
  const state = readEcommerceState();
  const nextState = updateCurrentProject(updatedProject, writeJsonFile);
  return nextState;
}

function renderEcommerceStatusReport(report, table) {
  console.log("Kabeeri Ecommerce Builder");
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

function renderEcommerceReport(report, table) {
  console.log("Ecommerce Builder Report");
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
  ecommerce,
  buildEcommerceStatusReport,
  buildEcommerceReport,
  buildEcommerceQuestions,
  buildEcommerceBrief,
  buildEcommerceDesign,
  buildEcommerceModules,
  buildEcommerceTasks
};
