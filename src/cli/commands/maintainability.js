const { getCommandRegistry, formatNextExactAction } = require("../services/command_registry");
const { buildPipelineState } = require("../services/pipeline_guard");

const MAINTAINABILITY_REPORT_PATH = ".kabeeri/reports/maintainability.json";
const MAINTAINABILITY_SCORECARD_PATH = ".kabeeri/reports/kabeeri_scorecards.json";

function maintainability(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    fileExists = () => false,
    table = () => ""
  } = deps;

  ensureWorkspace();
  const selected = String(action || value || flags.action || flags.mode || "report").trim().toLowerCase();
  if (!["report", "show", "status"].includes(selected)) {
    throw new Error(`Unknown maintainability action: ${selected || "report"}`);
  }

  const state = buildPipelineState({ readJsonFile, fileExists });
  const scorecardReport = readJsonFile(MAINTAINABILITY_SCORECARD_PATH) || {};
  const scorecards = Array.isArray(scorecardReport.scorecards) ? scorecardReport.scorecards : [];
  const maintainabilityScorecard = scorecards.find((card) => String(card.card_id || card.evolution_change_id || "").includes("maintainability")) || null;
  const evolutionState = readJsonFile(".kabeeri/evolution.json") || {};
  const evolutionChanges = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  const maintainabilityChange = evolutionChanges.find((change) => String(change.change_id || change.scorecard_id || "").includes("maintainability")) || null;
  const registry = getCommandRegistry();
  const sharedCommands = registry.filter((entry) => entry.owner === "shared" || entry.owner === "kvdf-dev");
  const sharedServices = [
    "src/cli/services/command_registry.js",
    "src/cli/services/pipeline_guard.js",
    "src/cli/services/task_verification.js",
    "src/cli/services/plugin_loader.js",
    "src/cli/services/questionnaire.js"
  ];

  const report = {
    report_type: "kvdf_maintainability_report",
    generated_at: new Date().toISOString(),
    report_path: MAINTAINABILITY_REPORT_PATH,
    scorecard_source: MAINTAINABILITY_SCORECARD_PATH,
    scorecard: maintainabilityScorecard ? {
      scorecard_id: maintainabilityScorecard.card_id || "maintainability",
      change_id: maintainabilityScorecard.evolution_change_id || "evo-scorecard-maintainability",
      title: maintainabilityScorecard.title || "Maintainability and shared service extraction",
      score: maintainabilityScorecard.score != null ? maintainabilityScorecard.score : null,
      band: maintainabilityScorecard.band || null,
      strength: maintainabilityScorecard.strength || null,
      weakness: maintainabilityScorecard.weakness || null,
      next_action: maintainabilityScorecard.next_action || null,
      evidence: Array.isArray(maintainabilityScorecard.evidence) ? maintainabilityScorecard.evidence : []
    } : null,
    shared_service_inventory: sharedServices,
    shared_command_inventory: sharedCommands.map((entry) => ({
      key: entry.key,
      category: entry.category,
      stage: entry.stage,
      owner: entry.owner,
      purpose: entry.purpose
    })),
    live_state: {
      workspace_exists: Boolean(state.workspace_exists),
      current_delivery_mode: state.current_delivery_mode || null,
      current_blueprint: state.current_blueprint || null,
      questionnaire_plan_id: state.current_questionnaire_plan && (state.current_questionnaire_plan.plan_id || state.current_questionnaire_plan.current_plan_id) || null,
      packet_traceability_complete: Boolean(state.packet_traceability_complete),
      approved_or_ready_tasks: state.approved_or_ready_total || 0
    },
    next_exact_action: formatNextExactAction("Run `kvdf contract` or `kvdf pipeline strict` to inspect the shared service boundary."),
    command_registry_total: registry.length
  };

  writeJsonFile(MAINTAINABILITY_REPORT_PATH, report);

  if (flags.output && flags.output !== true) {
    writeTextFile(flags.output, flags.json ? `${JSON.stringify(report, null, 2)}\n` : renderMaintainabilityReport(report, table));
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderMaintainabilityReport(report, table));
}

function renderMaintainabilityReport(report, table) {
  const scorecardRows = report.scorecard ? [[
    report.scorecard.scorecard_id || "",
    report.scorecard.change_id || "",
    String(report.scorecard.score ?? ""),
    report.scorecard.band || "",
    report.scorecard.next_action || ""
  ]] : [["", "", "", "", ""]];
  const commandRows = (report.shared_command_inventory || []).map((entry) => [
    entry.key,
    entry.category,
    entry.stage,
    entry.owner,
    entry.purpose
  ]);

  return [
    "# KVDF Maintainability Report",
    "",
    `- Report path: ${report.report_path}`,
    `- Scorecard source: ${report.scorecard_source}`,
    `- Next exact action: ${report.next_exact_action}`,
    "",
    "## Scorecard",
    "",
    table(["Scorecard", "Change", "Score", "Band", "Next action"], scorecardRows),
    "",
    "## Shared Service Inventory",
    "",
    ...report.shared_service_inventory.map((item) => `- ${item}`),
    "",
    "## Shared Command Inventory",
    "",
    table(["Command", "Category", "Stage", "Owner", "Purpose"], commandRows),
    "",
    "## Live State",
    "",
    `- Workspace exists: ${report.live_state.workspace_exists ? "yes" : "no"}`,
    `- Current delivery mode: ${report.live_state.current_delivery_mode || "unset"}`,
    `- Current blueprint: ${report.live_state.current_blueprint || "unset"}`,
    `- Questionnaire plan: ${report.live_state.questionnaire_plan_id || "unset"}`,
    `- Packet traceability complete: ${report.live_state.packet_traceability_complete ? "yes" : "no"}`,
    `- Approved or ready tasks: ${report.live_state.approved_or_ready_tasks}`,
    ""
  ].join("\n");
}

module.exports = {
  MAINTAINABILITY_REPORT_PATH,
  maintainability,
  renderMaintainabilityReport
};
