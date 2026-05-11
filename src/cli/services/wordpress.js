function ensureWordPressState(writeJsonFile, fileExists) {
  if (!fileExists(".kabeeri/wordpress.json")) {
    writeJsonFile(".kabeeri/wordpress.json", { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null });
  }
}

function loadWordPressState(readJsonFile) {
  return readJsonFile(".kabeeri/wordpress.json");
}

function saveWordPressState(writeJsonFile, state) {
  writeJsonFile(".kabeeri/wordpress.json", state);
}

function recordWordPressAnalysis(readJsonFile, writeJsonFile, analysis) {
  const state = loadWordPressState(readJsonFile);
  state.analyses.push(analysis);
  state.current_analysis_id = analysis.analysis_id;
  saveWordPressState(writeJsonFile, state);
}

function recordWordPressPlan(readJsonFile, writeJsonFile, plan) {
  const state = loadWordPressState(readJsonFile);
  state.plans.push(plan);
  state.current_plan_id = plan.plan_id;
  saveWordPressState(writeJsonFile, state);
}

function recordWordPressPluginPlan(readJsonFile, writeJsonFile, plan) {
  const state = loadWordPressState(readJsonFile);
  state.plugin_plans = state.plugin_plans || [];
  state.plugin_plans.push(plan);
  state.current_plugin_plan_id = plan.plugin_plan_id;
  saveWordPressState(writeJsonFile, state);
}

function recordWordPressScaffold(readJsonFile, writeJsonFile, scaffold) {
  const state = loadWordPressState(readJsonFile);
  state.scaffolds = state.scaffolds || [];
  state.scaffolds.push(scaffold);
  saveWordPressState(writeJsonFile, state);
}

function findWordPressPlan(planId, readJsonFile) {
  const state = loadWordPressState(readJsonFile);
  const id = planId || state.current_plan_id;
  const plan = (state.plans || []).find((item) => item.plan_id === id) || (state.plans || [])[state.plans.length - 1];
  if (!plan) throw new Error("No WordPress plan found. Run `kvdf wordpress plan \"...\"` first.");
  return plan;
}

function findWordPressPluginPlan(planId, readJsonFile) {
  const state = loadWordPressState(readJsonFile);
  const plans = state.plugin_plans || [];
  const id = planId || state.current_plugin_plan_id;
  const plan = plans.find((item) => item.plugin_plan_id === id) || plans[plans.length - 1];
  if (!plan) throw new Error("No WordPress plugin plan found. Run `kvdf wordpress plugin plan \"...\" --name <Name>` first.");
  return plan;
}

function createTasksFromWordPressPlan(plan, flags, readJsonFile, writeJsonFile) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: template.title,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plan",
      source_id: plan.plan_id,
      workstream: template.workstream || "public_frontend",
      workstreams: [template.workstream || "public_frontend"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.site_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

function createTasksFromWordPressPluginPlan(plan, flags, readJsonFile, writeJsonFile) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp-plugin";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: `${plan.name}: ${template.title}`,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plugin_plan",
      source_id: plan.plugin_plan_id,
      app_id: plan.slug,
      workstream: template.workstream || "backend",
      workstreams: [template.workstream || "backend"],
      allowed_files: [`wp-content/plugins/${plan.slug}/**`],
      forbidden_files: ["wp-admin/**", "wp-includes/**", "wp-config.php", "wp-content/uploads/**"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.plugin_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

module.exports = {
  ensureWordPressState,
  loadWordPressState,
  saveWordPressState,
  recordWordPressAnalysis,
  recordWordPressPlan,
  recordWordPressPluginPlan,
  recordWordPressScaffold,
  findWordPressPlan,
  findWordPressPluginPlan,
  createTasksFromWordPressPlan,
  createTasksFromWordPressPluginPlan
};
