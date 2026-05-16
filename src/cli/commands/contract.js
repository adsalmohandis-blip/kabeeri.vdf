const {
  buildAiCliOperatingContractReport,
  getCommandRegistry
} = require("../services/command_registry");
const {
  buildPipelineState,
  buildPipelineEnforcementMatrix,
  PIPELINE_MATRIX_DOC_PATH,
  PIPELINE_REPORT_PATH,
  renderPipelineEnforcementMatrix
} = require("../services/pipeline_guard");

const CONTRACT_REPORT_PATH = "docs/reports/KVDF_AI_CLI_OPERATING_CONTRACT.md";

function contract(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeTextFile = () => {},
    writeJsonFile = () => {},
    fileExists = () => false,
    table = () => ""
  } = deps;

  ensureWorkspace();
  const commandKey = String(value || flags.command || flags.key || rest[0] || "").trim();
  const state = buildPipelineState({ readJsonFile, fileExists });
  const pipelineMatrix = buildPipelineEnforcementMatrix(state, { fileExists, readJsonFile, table, taskId: flags.task || flags.id || null });
  const registry = getCommandRegistry();
  const report = buildAiCliOperatingContractReport(state, { commandKey, pipelineMatrix });
  const markdown = buildAiCliOperatingContractMarkdown(report, table);

  writeTextFile(CONTRACT_REPORT_PATH, markdown);
  writeJsonFile(PIPELINE_REPORT_PATH, {
    generated_at: new Date().toISOString(),
    status: pipelineMatrix.every((item) => item.status === "pass") ? "pass" : "blocked",
    blocked_total: pipelineMatrix.filter((item) => item.status !== "pass").length,
    matrix: pipelineMatrix
  });
  writeTextFile(PIPELINE_MATRIX_DOC_PATH, renderPipelineEnforcementMatrix(pipelineMatrix));

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(markdown);
}

function buildAiCliOperatingContractMarkdown(report, table) {
  const commandRows = (report.command_registry || []).map((entry) => [
    entry.key,
    entry.category,
    entry.stage,
    entry.owner,
    entry.purpose,
    (entry.next_commands || []).join(", ")
  ]);
  const selected = report.selected_command;
  const selectedRows = selected ? [[
    selected.key,
    selected.stage,
    selected.purpose,
    (selected.prerequisites || []).join("; "),
    (selected.outputs || []).join("; "),
    (selected.next_commands || []).join(", ")
  ]] : [["None selected.", "", "Run `kvdf contract <command>` to inspect a specific command.", "", "", ""]];

  return [
    "# KVDF AI and CLI Operating Contract",
    "",
    "## Role Split",
    "",
    `- AI: ${report.role_split.ai}`,
    `- CLI: ${report.role_split.cli}`,
    `- State: ${report.role_split.state}`,
    "",
    "## Operating Principles",
    "",
    ...report.operating_principles.map((item) => `- ${item}`),
    "",
    "## Session State",
    "",
    `- Workspace exists: ${report.session_state.workspace_exists ? "yes" : "no"}`,
    `- Current delivery mode: ${report.session_state.current_delivery_mode || "unset"}`,
    `- Current blueprint: ${report.session_state.current_blueprint || "unset"}`,
    `- Questionnaire plan: ${report.session_state.questionnaire_plan_id || "unset"}`,
    `- Approved or ready tasks: ${report.session_state.approved_or_ready_tasks}`,
    `- Packet traceability complete: ${report.session_state.packet_traceability_complete ? "yes" : "no"}`,
    `- Next exact action: ${report.next_exact_action}`,
    "",
    "## Selected Command",
    "",
    table(["Command", "Stage", "Purpose", "Prerequisites", "Outputs", "Next commands"], selectedRows),
    "",
    "## Command Registry",
    "",
    table(["Command", "Category", "Stage", "Owner", "Purpose", "Next commands"], commandRows),
    ""
  ].join("\n");
}

module.exports = {
  contract,
  CONTRACT_REPORT_PATH,
  buildAiCliOperatingContractMarkdown
};
