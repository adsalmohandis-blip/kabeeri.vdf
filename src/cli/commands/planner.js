const fs = require("fs");
const path = require("path");

const DEFAULT_ALLOWED_FILES = [
  "knowledge/governance/KVDF_PLANNER_LAYER.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
  "schemas/planner/evolution-plan.schema.json",
  "schemas/planner/task-punch.schema.json",
  "packs/planner/evolution-planner.prompt.md",
  "packs/planner/codex-execution.prompt.md",
  "src/cli/commands/planner.js",
  "src/cli/dispatchers/build.js",
  "src/cli/index.js",
  "tests/cli.integration.test.js",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md"
];

const DEFAULT_FORBIDDEN_FILES = [
  ".kabeeri/",
  "KVDOS/",
  "workspaces/apps/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  "docs/reports/",
  "src/cli/commands/dashboard.js",
  "src/cli/commands/dashboard_site.js",
  "src/cli/commands/dashboard_state.js"
];

const DEFAULT_VALIDATION_COMMANDS = ["node bin/kvdf.js validate", "npm test", "npm run check"];

const DEFAULT_OUT_OF_SCOPE = [
  "KVDOS files or workspace content",
  "runtime state under .kabeeri/",
  "branch/PR as the default KVDF Core delivery path",
  "plugin runtime behavior",
  "app builder behavior",
  "dashboard behavior",
  "evolution execution behavior outside the planner layer MVP"
];

function planner(action, value, flags = {}, rest = [], deps = {}) {
  const mode = normalizeMode(action);
  if (["next", "status", "show", "plan"].includes(mode)) {
    const report = buildPlannerNextReport(deps);
    if (flags.json && typeof console.log === "function") console.log(JSON.stringify(report, null, 2));
    else if (typeof deps.table === "function") console.log(renderPlannerNextReport(report, deps.table));
    else console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (mode === "prompt") {
    const goal = resolveGoal(value, flags, rest);
    if (!goal) throw new Error("Missing goal for planner prompt.");
    const report = buildPlannerPromptReport(goal, deps);
    if (flags.json && typeof console.log === "function") console.log(JSON.stringify(report, null, 2));
    else console.log(renderPlannerPromptReport(report));
    return;
  }
  if (mode === "evolution") {
    const goal = resolveGoal(value, flags, rest);
    if (!goal) throw new Error("Missing goal for planner evolution.");
    const report = buildPlannerEvolutionReport(goal, deps);
    if (flags.json && typeof console.log === "function") console.log(JSON.stringify(report, null, 2));
    else if (typeof deps.table === "function") console.log(renderPlannerEvolutionPlan(report, deps.table));
    else console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (mode === "task-punch") {
    const goal = resolveGoal(value, flags, rest);
    if (!goal) throw new Error("Missing goal for planner task punch.");
    const report = buildPlannerTaskPunchReport(goal, deps);
    if (flags.json && typeof console.log === "function") console.log(JSON.stringify(report, null, 2));
    else if (typeof deps.table === "function") console.log(renderPlannerTaskPunchReport(report, deps.table));
    else console.log(JSON.stringify(report, null, 2));
    return;
  }
  throw new Error(`Unknown planner action: ${action}`);
}

function buildPlannerNextReport(deps = {}) {
  const context = readPlannerContext(deps);
  const recommended = recommendNextEvolution(context);
  const evolutionPlan = buildPlannerEvolutionPlan(recommended.title, context);
  const taskPunch = buildPlannerTaskPunch(evolutionPlan.evolution_plan.title, context);
  return {
    report_type: "kvdf_planner_next",
    generated_at: new Date().toISOString(),
    track: "framework_owner",
    delivery_mode: "direct_main",
    source: context.source,
    recommended_evolution: recommended,
    allowed_files: evolutionPlan.evolution_plan.allowed_files,
    forbidden_files: evolutionPlan.evolution_plan.forbidden_files,
    out_of_scope: evolutionPlan.evolution_plan.out_of_scope,
    recommended_commands: [
      "kvdf planner next --json",
      `kvdf planner evolution --goal \"${evolutionPlan.evolution_plan.title}\" --json`,
      ...DEFAULT_VALIDATION_COMMANDS
    ],
    validation_commands: DEFAULT_VALIDATION_COMMANDS,
    stop_condition: evolutionPlan.evolution_plan.stop_condition,
    task_punch: taskPunch,
    next_action: `Run kvdf planner evolution --goal \"${evolutionPlan.evolution_plan.title}\" --json`
  };
}

function buildPlannerPromptReport(goal, deps = {}) {
  const context = readPlannerContext(deps);
  const plan = buildPlannerEvolutionPlan(goal, context);
  return {
    report_type: "kvdf_planner_codex_prompt",
    generated_at: new Date().toISOString(),
    track: "framework_owner",
    delivery_mode: "direct_main",
    goal,
    allowed_files: plan.evolution_plan.allowed_files,
    forbidden_files: plan.evolution_plan.forbidden_files,
    validation_commands: plan.evolution_plan.validation_commands,
    stop_condition: plan.evolution_plan.stop_condition,
    prompt: renderCodexPrompt({
      goal,
      plan: plan.evolution_plan,
      taskPunch: plan.task_punch,
      context
    })
  };
}

function buildPlannerEvolutionReport(goal, deps = {}) {
  const context = readPlannerContext(deps);
  const plan = buildPlannerEvolutionPlan(goal, context);
  return {
    report_type: "kvdf_planner_evolution_plan",
    generated_at: new Date().toISOString(),
    track: "framework_owner",
    delivery_mode: "direct_main",
    goal,
    evolution_plan: plan.evolution_plan,
    task_punch: plan.task_punch,
    prompt: renderCodexPrompt({
      goal,
      plan: plan.evolution_plan,
      taskPunch: plan.task_punch,
      context
    })
  };
}

function buildPlannerTaskPunchReport(goal, deps = {}) {
  const context = readPlannerContext(deps);
  const plan = buildPlannerEvolutionPlan(goal, context);
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    track: "framework_owner",
    delivery_mode: "direct_main",
    evolution_id: plan.evolution_plan.evolution_id,
    title: `${plan.evolution_plan.title} Task Punch`,
    tasks: plan.task_punch.tasks
  };
}

function buildPlannerEvolutionPlan(goal, context = {}) {
  const title = normalizeEvolutionTitle(goal);
  const evolutionId = normalizeEvolutionId(title);
  const area = "kvdf_development_pipeline_dev";
  const nextAction = `Run kvdf planner evolution --goal "${title.replace(/"/g, '\\"')}" --json`;
  const reason = context.source.open_tasks_total > 0
    ? "The repository still has active framework work that should be wrapped in a deterministic planner plan before execution."
    : "The repository has no open framework-owner priority, so the next governed step is the planner layer MVP that can generate the next Evolution and Task Punch from local context.";
  const plan = {
    report_type: "kvdf_planner_evolution_plan",
    evolution_id: evolutionId,
    title,
    track: "framework_owner",
    area,
    reason,
    in_scope: [
      "Planner governance docs and workflow docs",
      "Planner schemas, prompt templates, and CLI command wiring",
      "Deterministic next-Evolution recommendation from repo/runtime context",
      "Task Punch generation with allowed and forbidden file lists",
      "Codex-ready prompt generation for direct-to-main KVDF Core delivery"
    ],
    out_of_scope: [...DEFAULT_OUT_OF_SCOPE],
    allowed_files: [...DEFAULT_ALLOWED_FILES],
    forbidden_files: [...DEFAULT_FORBIDDEN_FILES],
    acceptance_criteria: [
      "The planner can recommend the next KVDF Core Evolution without relying on chat memory.",
      "The planner can emit a Task Punch with scoped tasks, allowed files, forbidden files, validation commands, and a stop condition.",
      "The planner can emit a Codex-ready execution prompt for KVDF Core direct-to-main delivery.",
      "The planner does not write runtime state under .kabeeri/ in the MVP.",
      "The planner keeps branch/PR optional and never treats it as the default KVDF Core path."
    ],
    validation_commands: [...DEFAULT_VALIDATION_COMMANDS],
    delivery_mode: "direct_main",
    next_action: nextAction,
    stop_condition: "Stop if the requested change would touch KVDOS, runtime state under .kabeeri/, plugin runtime behavior, dashboard behavior, or any file outside the allowed KVDF Core planner scope."
  };
  return {
    evolution_plan: plan,
    task_punch: buildPlannerTaskPunch(title, context)
  };
}

function buildPlannerTaskPunch(title, context = {}) {
  const evolutionId = normalizeEvolutionId(title);
  const docsTask = {
    id: `${evolutionId}-docs`,
    title: "Document the planner layer and workflow contract",
    status: "proposed",
    allowed_files: [
      "knowledge/governance/KVDF_PLANNER_LAYER.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
      "packs/planner/evolution-planner.prompt.md",
      "packs/planner/codex-execution.prompt.md",
      "schemas/planner/evolution-plan.schema.json",
      "schemas/planner/task-punch.schema.json"
    ],
    forbidden_files: [...DEFAULT_FORBIDDEN_FILES],
    acceptance_criteria: [
      "The planner layer governance document explains the roles and rules clearly.",
      "The workflow document shows Owner direction -> planner -> Codex execution -> validation -> review -> direct-to-main commit.",
      "The prompt templates exist and match the direct-to-main KVDF Core policy."
    ],
    validation_commands: [...DEFAULT_VALIDATION_COMMANDS],
    stop_condition: "Stop if the documentation would describe branch/PR as the default KVDF Core delivery path."
  };
  const cliTask = {
    id: `${evolutionId}-cli`,
    title: "Wire the planner command into the KVDF Core CLI",
    status: "proposed",
    allowed_files: [
      "src/cli/commands/planner.js",
      "src/cli/dispatchers/build.js",
      "src/cli/index.js"
    ],
    forbidden_files: [...DEFAULT_FORBIDDEN_FILES],
    acceptance_criteria: [
      "kvdf planner next --json returns a deterministic recommendation.",
      "kvdf planner prompt --goal \"...\" --json returns a Codex-ready prompt.",
      "KVDF Core stays direct-to-main by default and branch/PR remains optional only."
    ],
    validation_commands: [...DEFAULT_VALIDATION_COMMANDS],
    stop_condition: "Stop if command wiring would make branch/PR the default KVDF Core path."
  };
  const testsTask = {
    id: `${evolutionId}-tests`,
    title: "Add planner integration and documentation coverage",
    status: "proposed",
    allowed_files: [
      "tests/cli.integration.test.js",
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md"
    ],
    forbidden_files: [...DEFAULT_FORBIDDEN_FILES],
    acceptance_criteria: [
      "The planner command has integration coverage for JSON and prompt output.",
      "The CLI command reference documents the planner command family.",
      "The system capabilities reference records the Planner Layer under KVDF Development Pipeline Dev."
    ],
    validation_commands: [...DEFAULT_VALIDATION_COMMANDS],
    stop_condition: "Stop if the test additions require runtime state edits or unrelated feature changes."
  };
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    evolution_id: evolutionId,
    title: `${title} Task Punch`,
    tasks: [docsTask, cliTask, testsTask],
    source: context.source || {}
  };
}

function renderCodexPrompt({ goal, plan, taskPunch, context }) {
  const allowedFiles = plan.allowed_files || DEFAULT_ALLOWED_FILES;
  const forbiddenFiles = plan.forbidden_files || DEFAULT_FORBIDDEN_FILES;
  const validationCommands = plan.validation_commands || DEFAULT_VALIDATION_COMMANDS;
  const taskLines = (taskPunch.tasks || []).map((task, index) => `${index + 1}. ${task.title}`);
  return [
    "CODEx PROMPT — KVDF Core",
    "",
    "Context:",
    "- Repo: kabeeri.vdf",
    "- Track: Owner Track / KVDF Core only",
    "- Delivery mode: Direct-to-main",
    "- No branch / no PR unless explicitly requested",
    "- Do not touch KVDOS",
    "- Do not commit runtime state under .kabeeri/",
    "- The Owner is the only active KVDF Core developer",
    "- Codex is the executor, not the planner",
    context.source && context.source.track ? `- Current track: ${context.source.track}` : null,
    "",
    "Goal:",
    goal,
    "",
    "Scope:",
    `Allowed files:\n${allowedFiles.map((item) => `- ${item}`).join("\n")}`,
    `Forbidden files:\n${forbiddenFiles.map((item) => `- ${item}`).join("\n")}`,
    "",
    "Implementation tasks:",
    ...taskLines,
    "",
    "Validation:",
    "Run:",
    ...validationCommands.map((command) => `- ${command}`),
    "",
    "Commit:",
    "git add -A",
    "git commit -m \"feat: add KVDF planner layer MVP\"",
    "git push origin main",
    "",
    `Stop condition: ${plan.stop_condition}`
  ].filter(Boolean).join("\n");
}

function readPlannerContext(deps = {}) {
  const repoRootPath = typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd();
  const evolutionFile = path.join(repoRootPath, ".kabeeri", "evolution.json");
  const tasksFile = path.join(repoRootPath, ".kabeeri", "tasks.json");
  const capabilityRegistryFile = path.join(repoRootPath, "knowledge", "standard_systems", "KVDF_CANONICAL_CAPABILITY_REGISTRY.json");
  const evolutionState = fs.existsSync(evolutionFile) ? safeReadJson(evolutionFile) : { changes: [], development_priorities: [] };
  const taskState = fs.existsSync(tasksFile) ? safeReadJson(tasksFile) : { tasks: [] };
  const capabilityRegistry = fs.existsSync(capabilityRegistryFile) ? safeReadJson(capabilityRegistryFile) : null;
  const buildEvolutionSummary = typeof deps.buildEvolutionSummary === "function" ? deps.buildEvolutionSummary : null;
  const summary = buildEvolutionSummary ? buildEvolutionSummary(evolutionState) : null;
  const openTasksTotal = Array.isArray(taskState.tasks)
    ? taskState.tasks.filter((task) => !["owner_verified", "done", "closed", "rejected"].includes(String(task.status || "").toLowerCase())).length
    : 0;
  const openPrioritiesTotal = Array.isArray(evolutionState.development_priorities)
    ? evolutionState.development_priorities.filter((item) => !["done", "deferred", "rejected"].includes(String(item.status || "").toLowerCase())).length
    : 0;
  return {
    repo_root: repoRootPath,
    source: {
      report_type: "kvdf_planner_context",
      track: "framework_owner",
      runtime_state_present: fs.existsSync(path.join(repoRootPath, ".kabeeri")),
      open_tasks_total: openTasksTotal,
      open_priorities_total: openPrioritiesTotal,
      evolution_summary: summary ? {
        current_change_id: summary.current_change_id || null,
        next_priority: summary.next_priority ? {
          id: summary.next_priority.id || null,
          title: summary.next_priority.title || null,
          status: summary.next_priority.status || null
        } : null
      } : null,
      capability_registry: capabilityRegistry ? {
        report_type: capabilityRegistry.report_type || "kvdf_canonical_capability_registry",
        registry_version: capabilityRegistry.registry_version || "1",
        area_count: Array.isArray(capabilityRegistry.areas) ? capabilityRegistry.areas.length : 0
      } : null
    }
  };
}

function recommendNextEvolution(context = {}) {
  const summary = context.source && context.source.evolution_summary ? context.source.evolution_summary : null;
  const nextPriority = summary && summary.next_priority ? summary.next_priority : null;
  if (nextPriority) {
    return {
      evolution_id: nextPriority.id || normalizeEvolutionId(nextPriority.title || "Next KVDF evolution"),
      title: nextPriority.title || "Next KVDF evolution",
      reason: "The current open framework priority is the next governed Evolution.",
      area: "kvdf_development_pipeline_dev",
      risk: String(nextPriority.risk || "medium").toLowerCase()
    };
  }
  return {
    evolution_id: "kvdf-planner-layer-mvp",
    title: "KVDF Planner Layer MVP",
    reason: "No open framework-owner priority or task punch remains, so the repository should add a deterministic planner layer that recommends the next governed Evolution and Codex-ready execution prompt from local context.",
    area: "kvdf_development_pipeline_dev",
    risk: "medium"
  };
}

function resolveGoal(value, flags = {}, rest = []) {
  const candidates = [value, flags.goal, flags.title, rest.join(" ")];
  const goal = candidates.find((item) => typeof item === "string" && item.trim());
  return goal ? String(goal).trim() : "";
}

function normalizeMode(value) {
  return String(value || "next").trim().toLowerCase();
}

function normalizeEvolutionTitle(goal) {
  const text = String(goal || "").trim();
  if (/planner/i.test(text)) return "KVDF Planner Layer MVP";
  if (/direct[- ]?to[- ]?main/i.test(text)) return "KVDF Core Direct-to-Main Delivery Guidance";
  if (/capability/i.test(text)) return "KVDF Canonical Capability Registry";
  return text ? `KVDF Core Evolution — ${text}` : "KVDF Core Evolution MVP";
}

function normalizeEvolutionId(title) {
  return String(title || "kvdf-evolution").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function renderPlannerNextReport(report, table) {
  const rows = [
    ["Track", report.track],
    ["Delivery mode", report.delivery_mode],
    ["Recommended evolution", report.recommended_evolution.title],
    ["Area", report.recommended_evolution.area],
    ["Risk", report.recommended_evolution.risk],
    ["Next action", report.next_action]
  ];
  const tasks = (report.task_punch && report.task_punch.tasks) || [];
  const taskRows = tasks.map((task) => [
    task.id,
    task.title,
    task.status,
    (task.allowed_files || []).length.toString()
  ]);
  const lines = [
    "KVDF Planner Next",
    "",
    table(["Field", "Value"], rows),
    "",
    "Out of scope:",
    ...(report.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(report.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(report.validation_commands || []).map((item) => `- ${item}`),
    "",
    "Task Punch:",
    taskRows.length ? table(["Task ID", "Title", "Status", "Allowed files"], taskRows) : "No tasks generated.",
    "",
    `Stop condition: ${report.stop_condition}`
  ];
  return lines.join("\n");
}

function renderPlannerEvolutionPlan(report, table) {
  const plan = report.evolution_plan || report;
  const rows = [
    ["Evolution", plan.title],
    ["Area", plan.area],
    ["Track", plan.track],
    ["Delivery mode", plan.delivery_mode],
    ["Next action", plan.next_action]
  ];
  return [
    "KVDF Planner Evolution Plan",
    "",
    table(["Field", "Value"], rows),
    "",
    "In scope:",
    ...(plan.in_scope || []).map((item) => `- ${item}`),
    "",
    "Out of scope:",
    ...(plan.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(plan.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...(plan.forbidden_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(plan.validation_commands || []).map((item) => `- ${item}`),
    "",
    `Stop condition: ${plan.stop_condition}`
  ].join("\n");
}

function renderPlannerPromptReport(report) {
  return report.prompt;
}

function renderPlannerTaskPunchReport(report, table) {
  const rows = (report.tasks || []).map((task) => [
    task.id,
    task.title,
    task.status,
    (task.allowed_files || []).length.toString()
  ]);
  return [
    "KVDF Planner Task Punch",
    "",
    table(["Task ID", "Title", "Status", "Allowed files"], rows),
    "",
    `Evolution: ${report.evolution_id}`
  ].join("\n");
}

module.exports = {
  planner,
  buildPlannerNextReport,
  buildPlannerPromptReport,
  buildPlannerEvolutionReport,
  buildPlannerTaskPunchReport,
  buildPlannerEvolutionPlan,
  renderPlannerNextReport,
  renderPlannerEvolutionPlan,
  renderPlannerPromptReport,
  renderPlannerTaskPunchReport
};
