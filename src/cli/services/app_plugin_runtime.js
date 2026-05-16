const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { buildPluginLoaderReport } = require("./plugin_loader");
const { buildPluginBundleContract } = require("./plugin_bundle_contract");

function createAppPluginRuntime(spec) {
  const pluginId = spec.plugin_id;
  const stateFile = spec.state_file;
  const displayName = spec.display_name || pluginId;
  const supportedModes = Array.isArray(spec.supported_modes) && spec.supported_modes.length ? spec.supported_modes : ["default"];
  const defaultMode = spec.default_mode || supportedModes[0];

  function ensureState(writeJsonFileFn = writeJsonFile, fileExistsFn = fileExists) {
    if (fileExistsFn(stateFile)) {
      const state = normalizeState(readJsonFile(stateFile));
      writeJsonFileFn(stateFile, state);
      return state;
    }
    const state = createEmptyState();
    writeJsonFileFn(stateFile, state);
    return state;
  }

  function createEmptyState() {
    return {
      schema_version: "v1",
      plugin_id: pluginId,
      updated_at: null,
      current_project_id: null,
      projects: [],
      events: []
    };
  }

  function normalizeState(state) {
    const normalized = state && typeof state === "object" ? { ...state } : createEmptyState();
    normalized.schema_version = normalized.schema_version || "v1";
    normalized.plugin_id = normalized.plugin_id || pluginId;
    normalized.updated_at = normalized.updated_at || null;
    normalized.current_project_id = normalized.current_project_id || null;
    normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
    normalized.events = Array.isArray(normalized.events) ? normalized.events : [];
    normalized.projects = normalized.projects.map((project) => normalizeProject(project));
    return normalized;
  }

  function normalizeProject(project) {
    const normalized = project && typeof project === "object" ? { ...project } : {};
    normalized.project_id = normalized.project_id || `${pluginId}-${Date.now()}`;
    normalized.slug = normalized.slug || slugify(normalized.name || normalized.project_id);
    normalized.name = normalized.name || displayName;
    normalized.mode = normalizeMode(normalized.mode || defaultMode);
    normalized.stage = normalized.stage || "intake";
    normalized.description = normalized.description || "";
    normalized.status = normalized.status || "active";
    normalized.created_at = normalized.created_at || new Date().toISOString();
    normalized.updated_at = normalized.updated_at || normalized.created_at;
    normalized.intake = normalized.intake || { questions: [], answers: [], missing_answers: [], answered_fields: [] };
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
    normalized.next_action = normalized.next_action || `kvdf ${pluginId} questionnaire`;
    normalized.artifacts = normalized.artifacts || {};
    return normalized;
  }

  function readState() {
    return fileExists(stateFile) ? normalizeState(readJsonFile(stateFile)) : createEmptyState();
  }

  function persistState(state, writeJsonFileFn = writeJsonFile) {
    const normalized = normalizeState(state);
    writeJsonFileFn(stateFile, normalized);
    return normalized;
  }

  function upsertCurrentProject(state, project) {
    const normalizedState = normalizeState(state);
    const normalizedProject = normalizeProject(project);
    const nextProjects = normalizedState.projects.filter((item) => item.project_id !== normalizedProject.project_id);
    nextProjects.push(normalizedProject);
    normalizedState.projects = nextProjects.sort((a, b) => a.created_at.localeCompare(b.created_at));
    normalizedState.current_project_id = normalizedProject.project_id;
    normalizedState.updated_at = new Date().toISOString();
    normalizedState.events.push({
      event_id: `${pluginId}-event-${String(normalizedState.events.length + 1).padStart(3, "0")}`,
      event_type: "project.upserted",
      project_id: normalizedProject.project_id,
      mode: normalizedProject.mode,
      stage: normalizedProject.stage,
      generated_at: normalizedState.updated_at
    });
    return normalizedState;
  }

  function getCurrentProject(state) {
    const normalized = normalizeState(state);
    if (!normalized.projects.length) return null;
    if (normalized.current_project_id) {
      const current = normalized.projects.find((item) => item.project_id === normalized.current_project_id);
      if (current) return current;
    }
    return normalized.projects[normalized.projects.length - 1];
  }

  function normalizeMode(value) {
    const mode = String(value || "").toLowerCase();
    return supportedModes.includes(mode) ? mode : defaultMode;
  }

  function slugify(value) {
    return String(value || pluginId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || pluginId;
  }

  function inferMode(value) {
    const text = String(value || "").toLowerCase();
    if (supportedModes.includes(text)) return text;
    const entries = [
      [supportedModes[0], text.includes(supportedModes[0])],
      [supportedModes[1], text.includes(supportedModes[1])]
    ];
    for (const [mode, match] of entries) if (mode && match) return mode;
    return defaultMode;
  }

  function createProject(value, flags = {}, deps = {}) {
    const { writeJsonFile: writeJsonFileFn = writeJsonFile } = deps;
    const plugin = deps.plugin || getPluginStatus();
    const state = readState();
    const description = [value, flags.description, flags.goal, flags.text]
      .filter(Boolean)
      .map((item) => String(item).trim())
      .join(" ")
      .trim();
    const name = flags.name || flags.title || description || displayName;
    const mode = normalizeMode(flags.mode || inferMode(description));
    const bundleContract = buildRuntimeBundleContract(plugin, mode, "intake", `kvdf ${pluginId} questionnaire`, supportedModes, defaultMode);
    const project = normalizeProject({
      project_id: flags.id || `${pluginId}-${slugify(name)}`,
      slug: slugify(flags.slug || name),
      name,
      mode,
      description,
      stage: "intake",
      status: "active",
      intake: { questions: [], answers: [], missing_answers: [], answered_fields: [] },
      blockers: [],
      next_action: `kvdf ${pluginId} questionnaire`,
      artifacts: { bundle_contract: bundleContract }
    });
    const nextState = upsertCurrentProject(state, project);
    persistState(nextState, writeJsonFileFn);
    return getCurrentProject(nextState);
  }

  function requireCurrentProject(state) {
    const project = getCurrentProject(state);
    if (!project) {
      throw new Error(`${displayName} runtime blocked: initialize a project first with \`kvdf ${pluginId} init\`.`);
    }
    return project;
  }

  function parseAnswers(flags = {}, rest = []) {
    const values = [];
    for (const raw of [flags.answer, flags.answers, flags.fill, ...rest].flat().filter(Boolean)) {
      const text = String(raw).trim();
      if (!text) continue;
      for (const chunk of text.split(/[;,]/)) {
        const token = chunk.trim();
        if (!token) continue;
        const [field, ...valueParts] = token.split(/[:=]/);
        if (!field || !valueParts.length) continue;
        values.push({ field: field.trim(), value: valueParts.join(":").trim() });
      }
    }
    return values;
  }

  function toQuestions(list, prefix) {
    return (Array.isArray(list) ? list : []).map((item, index) => {
      if (item && typeof item === "object" && item.question_id) return item;
      return {
        question_id: `${prefix}.${String(index + 1).padStart(2, "0")}`,
        text: String(item),
        required: true
      };
    });
  }

  function buildQuestions(mode) {
    const common = toQuestions(spec.common_questions || [], `${pluginId}.common`);
    const modeSpecific = toQuestions((spec.mode_questions && spec.mode_questions[mode]) || [], `${pluginId}.${mode}`);
    return [...common, ...modeSpecific];
  }

  function buildBrief(project, answers = []) {
    const missingAnswers = Array.isArray(project.intake?.missing_answers) ? project.intake.missing_answers : [];
    if (missingAnswers.length) {
      throw new Error(`${displayName} brief blocked: answer all questionnaire items first (${missingAnswers.join(", ")}).`);
    }
    const mode = normalizeMode(project.mode);
    const modeBrief = (spec.brief_modes && spec.brief_modes[mode]) || {};
    const baseBrief = spec.brief_base || {};
    const summary = {
      mode,
      audience: answers[0]?.value || project.name,
      booking_rules: baseBrief.flows || baseBrief.rules || ["discovery", "conversion", "admin"],
      ui: baseBrief.ui || ["landing page", "detail view", "conversion flow", "admin console"],
      system: baseBrief.system || ["durable state", "role-based edits", "approval trail"],
      data: baseBrief.data || ["records", "history", "notifications"]
    };
    if (modeBrief.flows) summary.booking_rules = summary.booking_rules.concat(modeBrief.flows);
    if (modeBrief.system) summary.system = summary.system.concat(modeBrief.system);
    if (modeBrief.data) summary.data = summary.data.concat(modeBrief.data);
    return summary;
  }

  function buildDesign(project, brief) {
    if (!brief) throw new Error(`${displayName} design blocked: generate the brief first.`);
    const mode = normalizeMode(project.mode);
    const basePages = Array.isArray(spec.base_pages) ? spec.base_pages : [];
    const modePages = (spec.mode_pages && spec.mode_pages[mode]) || [];
    const moduleHints = [];
    for (const module of [...(spec.base_modules || []), ...((spec.mode_modules && spec.mode_modules[mode]) || [])]) {
      moduleHints.push({ module_id: module.module_id, purpose: module.purpose });
    }
    return {
      mode,
      ui_patterns: basePages.map((page) => page.purpose),
      system_patterns: (brief.system || []).slice(0, 6),
      page_map: [...basePages, ...modePages],
      module_hints: moduleHints,
      design_summary: brief
    };
  }

  function buildModules(project, design) {
    if (!design) throw new Error(`${displayName} modules blocked: generate the design first.`);
    const mode = normalizeMode(project.mode);
    const baseModules = Array.isArray(spec.base_modules) ? spec.base_modules : [];
    const modeModules = (spec.mode_modules && spec.mode_modules[mode]) || [];
    return {
      mode,
      modules: [...baseModules, ...modeModules],
      dependency_map: [...baseModules, ...modeModules].map((module) => ({ module_id: module.module_id, dependencies: module.dependencies || [] })),
      plugin_candidates: spec.plugin_candidates || [],
      design_summary: design
    };
  }

  function buildPlanningReview(project, flags = {}) {
    if (!project.modules) throw new Error(`${displayName} planning review blocked: generate the modules first.`);
    const approved = Boolean(flags.confirm || flags.approve || flags.yes);
    const reviewedAt = new Date().toISOString();
    const reviewId = `review-${String(project.project_id || pluginId).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    return {
      review_id: reviewId,
      status: approved ? "approved" : "reviewed",
      reviewed_at: reviewedAt,
      reviewed_by: flags.by || flags.actor || "local-user",
      approved_at: approved ? reviewedAt : null,
      approved_by: approved ? (flags.by || flags.actor || "local-user") : null,
      summary: {
        brief_summary: project.brief,
        design_summary: project.design,
        module_count: Array.isArray(project.modules.modules) ? project.modules.modules.length : 0,
        notes: flags.note || flags.summary || "Planning pack reviewed for task generation."
      },
      next_action: approved ? `kvdf ${pluginId} tasks` : `kvdf ${pluginId} review --confirm`
    };
  }

  function buildTasks(project, modules, deliveryMode = "structured") {
    if (!modules || !Array.isArray(modules.modules) || modules.modules.length === 0) {
      throw new Error(`${displayName} tasks blocked: generate the modules first.`);
    }
    if (!project.planning_review || project.planning_review.status !== "approved") {
      throw new Error(`${displayName} tasks blocked: review and approve the planning pack first with \`kvdf ${pluginId} review --confirm\`.`);
    }
    const tasks = (modules.modules || []).map((module, index) => ({
      task_id: `${pluginId}-task-${String(index + 1).padStart(3, "0")}`,
      module_id: module.module_id,
      title: module.title,
      workstream: (module.workstreams && module.workstreams[0]) || "backend",
      delivery_mode: deliveryMode,
      acceptance_criteria: [
        `Build ${module.title.toLowerCase()}`,
        `Define ${module.purpose.toLowerCase()}`,
        "Cover happy path and error states"
      ],
      file_boundaries: [
        `plugins/${pluginId}/`,
        stateFile,
        "docs/reports/",
        `src/cli/commands/${pluginId.replace(/-/g, "_")}.js`
      ]
    }));
    return {
      delivery_mode: deliveryMode,
      proposed_tasks: tasks,
      task_count: tasks.length
    };
  }

    function buildApproval(project, taskPlan, flags = {}) {
      const batchId = flags.batch || `${pluginId}-batch-${String(project.approvals.length + 1).padStart(3, "0")}`;
      const blockers = [];
      if (!project.brief) blockers.push(`Run \`kvdf ${pluginId} brief\` first.`);
      if (!project.design) blockers.push(`Run \`kvdf ${pluginId} design\` first.`);
      if (!taskPlan || !Array.isArray(taskPlan.proposed_tasks) || taskPlan.proposed_tasks.length === 0) blockers.push(`Run \`kvdf ${pluginId} tasks\` first.`);
      if (Array.isArray(project.intake?.missing_answers) && project.intake.missing_answers.length) blockers.push(`Answer remaining questionnaire items first: ${project.intake.missing_answers.join(", ")}.`);
      const approved = Boolean(flags.confirm || flags.approve || flags.yes) && blockers.length === 0;
      return {
        batch_id: batchId,
        mode: project.mode,
        approved,
        blockers,
        tasks: (taskPlan && taskPlan.proposed_tasks) || [],
        next_action: approved ? "kvdf task assign" : `kvdf ${pluginId} report`
      };
  }

  function buildReport(project) {
    const stageOrder = ["intake", "questionnaire", "brief", "design", "modules", "review", "tasks", "approval", "execution"];
    const stageIndex = Math.max(stageOrder.indexOf(project.stage || "intake"), 0);
    const bundleContract = (project && project.artifacts && project.artifacts.bundle_contract) || null;
    const nextActions = [];
    if (!project.intake || !project.intake.questions.length) nextActions.push(`Run \`kvdf ${pluginId} questionnaire\` to capture project answers.`);
    else if (Array.isArray(project.intake.missing_answers) && project.intake.missing_answers.length) nextActions.push(`Answer remaining questionnaire items: ${project.intake.missing_answers.join(", ")}.`);
    else if (!project.brief) nextActions.push(`Run \`kvdf ${pluginId} brief\` to generate the brief artifacts.`);
    else if (!project.design) nextActions.push(`Run \`kvdf ${pluginId} design\` to map the UI and modules.`);
    else if (!project.modules) nextActions.push(`Run \`kvdf ${pluginId} modules\` to define the runtime modules.`);
    else if (!project.planning_review || project.planning_review.status !== "approved") nextActions.push(`Run \`kvdf ${pluginId} review --confirm\` to approve the planning pack.`);
    else if (!project.tasks) nextActions.push(`Run \`kvdf ${pluginId} tasks\` to create the approval-ready backlog.`);
    else if (!project.approvals.length) nextActions.push(`Run \`kvdf ${pluginId} approve\` to package an execution batch.`);
    else nextActions.push("Use the approved plugin batch with the governed task pipeline.");
    return {
      report_type: `${pluginId}_report`,
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

  function buildStatusReport(state, plugin, currentProject = null) {
    const project = currentProject || getCurrentProject(state);
    const bundleContract = (project && project.artifacts && project.artifacts.bundle_contract) || plugin.bundle_contract || null;
    return {
      report_type: `${pluginId}_status`,
      generated_at: new Date().toISOString(),
      plugin_id: pluginId,
      plugin_status: plugin.status,
      plugin_enabled: plugin.enabled,
      bundle_contract: bundleContract,
      bundle_contract_status: bundleContract ? bundleContract.status : "unknown",
      state_file: stateFile,
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
      next_exact_action: plugin.enabled ? (project ? project.next_action : `kvdf ${pluginId} init`) : `kvdf plugins install ${pluginId}`,
      next_action: plugin.enabled ? (project ? project.next_action : `kvdf ${pluginId} init`) : `kvdf plugins install ${pluginId}`,
      blockers: project ? project.blockers || [] : [],
      projects: state.projects.length
    };
  }

  function saveUpdatedProject(updatedProject, writeJsonFileFn) {
    const state = readState();
    const hasProject = state.projects.some((item) => item.project_id === updatedProject.project_id);
    const nextState = {
      ...state,
      current_project_id: updatedProject.project_id,
      projects: hasProject ? state.projects.map((item) => item.project_id === updatedProject.project_id ? updatedProject : item) : [...state.projects, updatedProject],
      updated_at: new Date().toISOString(),
      events: [
        ...state.events,
        {
          event_id: `${pluginId}-event-${String(state.events.length + 1).padStart(3, "0")}`,
          event_type: `project.${updatedProject.stage}`,
          project_id: updatedProject.project_id,
          mode: updatedProject.mode,
          stage: updatedProject.stage,
          generated_at: new Date().toISOString()
        }
      ]
    };
    persistState(nextState, writeJsonFileFn);
    return nextState;
  }

  function getPluginStatus() {
    const report = buildPluginLoaderReport();
    const plugin = report.plugins.find((item) => item.plugin_id === pluginId || item.bundle_path === `plugins/${pluginId}` || item.name === displayName);
    if (!plugin) {
      return { found: false, enabled: false, status: "uninstalled", plugin_id: pluginId };
    }
    return {
      found: true,
      enabled: plugin.enabled,
      status: plugin.status,
      plugin_id: plugin.plugin_id,
      bundle_path: plugin.bundle_path,
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

  function renderStatusReport(report, table) {
    console.log(`${displayName}`);
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

  function renderReport(report, table) {
    console.log(`${displayName} Report`);
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

  function command(action, value, flags = {}, rest = [], deps = {}) {
    const { ensureWorkspace = () => {}, table = () => "", appendAudit = () => {}, writeJsonFile = () => {} } = deps;
    ensureWorkspace();
    const plugin = getPluginStatus();
    const state = ensureState(writeJsonFile);

    if (!action || action === "help" || action === "status" || action === "list") {
      const report = buildStatusReport(state, plugin);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderStatusReport(report, table);
      return;
    }

    if (!plugin.enabled) {
      throw new Error(`${displayName} plugin blocked: ${plugin.status === "disabled" ? "enable" : "install"} ${pluginId} first with \`kvdf plugins ${plugin.status === "disabled" ? "enable" : "install"} ${pluginId}\`.`);
    }

    if (action === "init") {
      const description = [value, ...rest, flags.description, flags.goal, flags.text].filter(Boolean).join(" ").trim();
      const project = createProject(description, flags, { writeJsonFile, plugin });
      const report = buildStatusReport(readState(), plugin, project);
      appendAudit(`${pluginId}.project_created`, pluginId, project.project_id, `${displayName} project created: ${project.project_id}`);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderStatusReport(report, table);
      return;
    }

    const currentProject = requireCurrentProject(state);

    if (action === "questionnaire") {
      const answers = parseAnswers(flags, rest);
      const questions = buildQuestions(currentProject.mode);
      const answeredFields = answers.map((item) => item.field);
      const missingAnswers = questions.filter((question) => !answeredFields.includes(question.question_id)).map((question) => question.question_id);
      const updatedProject = {
        ...currentProject,
        stage: "questionnaire",
        intake: { questions, answers, answered_fields: answeredFields, missing_answers: missingAnswers },
        blockers: missingAnswers.length ? [`Missing answers: ${missingAnswers.join(", ")}`] : [],
        next_action: missingAnswers.length ? `kvdf ${pluginId} questionnaire` : `kvdf ${pluginId} brief`,
        updated_at: new Date().toISOString()
      };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.questionnaire`, pluginId, updatedProject.project_id, `${displayName} questionnaire prepared: ${updatedProject.project_id}`);
      const report = buildStatusReport(nextState, plugin, updatedProject);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderStatusReport(report, table);
      return;
    }

    if (action === "brief") {
      if (!currentProject.intake || !Array.isArray(currentProject.intake.questions) || currentProject.intake.questions.length === 0) {
        throw new Error(`${displayName} brief blocked: run \`kvdf ${pluginId} questionnaire\` first.`);
      }
      if (Array.isArray(currentProject.intake.missing_answers) && currentProject.intake.missing_answers.length) {
        throw new Error(`${displayName} brief blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
      }
      const brief = buildBrief(currentProject, currentProject.intake.answers || []);
      const updatedProject = { ...currentProject, stage: "brief", brief, blockers: [], next_action: `kvdf ${pluginId} design`, updated_at: new Date().toISOString() };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.brief`, pluginId, updatedProject.project_id, `${displayName} brief generated: ${updatedProject.project_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "design") {
      if (!currentProject.brief) throw new Error(`${displayName} design blocked: run \`kvdf ${pluginId} brief\` first.`);
      const design = buildDesign(currentProject, currentProject.brief);
      const updatedProject = { ...currentProject, stage: "design", design, blockers: [], next_action: `kvdf ${pluginId} modules`, updated_at: new Date().toISOString() };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.design`, pluginId, updatedProject.project_id, `${displayName} design mapped: ${updatedProject.project_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "modules") {
      if (!currentProject.design) throw new Error(`${displayName} modules blocked: run \`kvdf ${pluginId} design\` first.`);
      const modules = buildModules(currentProject, currentProject.design);
      const updatedProject = { ...currentProject, stage: "modules", modules, blockers: [], next_action: `kvdf ${pluginId} review`, updated_at: new Date().toISOString() };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.modules`, pluginId, updatedProject.project_id, `${displayName} modules derived: ${updatedProject.project_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "review") {
      if (!currentProject.modules) throw new Error(`${displayName} planning review blocked: run \`kvdf ${pluginId} modules\` first.`);
      const review = buildPlanningReview(currentProject, flags);
      const updatedProject = {
        ...currentProject,
        stage: "review",
        planning_review: review,
        blockers: review.status === "approved" ? [] : ["Planning pack reviewed and awaiting approval confirmation."],
        next_action: review.next_action,
        updated_at: new Date().toISOString()
      };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.review`, pluginId, updatedProject.project_id, `${displayName} planning pack reviewed: ${updatedProject.project_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "tasks") {
      if (!currentProject.modules) throw new Error(`${displayName} tasks blocked: run \`kvdf ${pluginId} modules\` first.`);
      if (!currentProject.planning_review || currentProject.planning_review.status !== "approved") {
        throw new Error(`${displayName} tasks blocked: review and approve the planning pack first with \`kvdf ${pluginId} review --confirm\`.`);
      }
      const deliveryMode = flags.delivery || (currentProject.mode === "subscription" || currentProject.mode === "franchise" ? "structured" : "agile");
      const tasks = buildTasks(currentProject, currentProject.modules, deliveryMode);
      const updatedProject = { ...currentProject, stage: "tasks", tasks, blockers: [], next_action: `kvdf ${pluginId} approve`, updated_at: new Date().toISOString() };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.tasks`, pluginId, updatedProject.project_id, `${displayName} tasks synthesized: ${updatedProject.project_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "approve") {
      if (!currentProject.tasks || !Array.isArray(currentProject.tasks.proposed_tasks) || currentProject.tasks.proposed_tasks.length === 0) {
        throw new Error(`${displayName} approval blocked: run \`kvdf ${pluginId} tasks\` first.`);
      }
      if (Array.isArray(currentProject.intake?.missing_answers) && currentProject.intake.missing_answers.length) {
        throw new Error(`${displayName} approval blocked: answer all questionnaire items first (${currentProject.intake.missing_answers.join(", ")}).`);
      }
      const approval = buildApproval(currentProject, currentProject.tasks, flags);
      const updatedProject = {
        ...currentProject,
        stage: approval.approved ? "approval" : currentProject.stage,
        approvals: [...(currentProject.approvals || []), approval],
        blockers: approval.blockers,
        next_action: approval.next_action,
        updated_at: new Date().toISOString()
      };
      const nextState = saveUpdatedProject(updatedProject, writeJsonFile);
      appendAudit(`${pluginId}.approval`, pluginId, updatedProject.project_id, `${displayName} batch packaged: ${approval.batch_id}`);
      if (flags.json) console.log(JSON.stringify(buildStatusReport(nextState, plugin, updatedProject), null, 2));
      else renderStatusReport(buildStatusReport(nextState, plugin, updatedProject), table);
      return;
    }

    if (action === "report") {
      const report = buildReport(currentProject);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderReport(report, table);
      return;
    }

    throw new Error(`Unknown ${pluginId} action: ${action}`);
  }

  return {
    command,
    buildStatusReport,
    buildReport,
    buildQuestions,
    buildBrief,
    buildDesign,
    buildModules,
    buildTasks
  };
}

function buildRuntimeBundleContract(plugin, mode, stage, nextExactAction, supportedModesValue = [], defaultModeValue = null) {
  const bundleContract = buildPluginBundleContract(plugin, {
    ready_action: nextExactAction || "Use the bundle command surface."
  });
  return {
    ...bundleContract,
    default_mode: defaultModeValue,
    supported_modes: supportedModesValue,
    current_mode: mode || null,
    current_stage: stage || "intake",
    runtime_stages: ["init", "questionnaire", "brief", "design", "modules", "review", "tasks", "approve", "report"]
  };
}

module.exports = {
  createAppPluginRuntime
};
