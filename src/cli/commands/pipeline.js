const {
  PIPELINE_MATRIX_DOC_PATH,
  PIPELINE_REPORT_PATH,
  assertStrictPipeline,
  buildPipelineEnforcementMatrix,
  buildPipelineState,
  getPipelineNextExactAction,
  renderPipelineEnforcementMatrix
} = require("../services/pipeline_guard");
const fs = require("fs");

function pipeline(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    fileExists = () => false,
    table = () => ""
  } = deps;

  const verb = String(action || "matrix").toLowerCase();
  if (["help", "--help", "-h"].includes(verb)) {
    console.log([
      "Usage:",
      "  kvdf pipeline matrix",
      "  kvdf pipeline strict [--task <task-id>]",
      "  kvdf pipeline check <command-key> [--task <task-id>]",
      "",
      "Commands:",
      "  matrix   Render the strict pipeline guard table.",
      "  strict   Render the guard table and fail closed if any stage is broken. Use --task to inspect a single task path.",
      "  check    Inspect one pipeline command guard by key."
    ].join("\n"));
    return;
  }

  ensureWorkspace();
  const state = buildPipelineState({ readJsonFile, fileExists });
  const readTextFile = (targetPath) => fs.readFileSync(targetPath, "utf8");
  const taskId = flags.task || flags.id || rest[0] || null;
  const matrix = buildPipelineEnforcementMatrix(state, { table, fileExists, readJsonFile, readTextFile, taskId });

  if (verb === "strict" || verb === "enforce") {
    const blocked = matrix.filter((item) => item.status !== "pass");
    const nextExactAction = getPipelineNextExactAction(matrix);
    writeJsonFile(PIPELINE_REPORT_PATH, {
      generated_at: new Date().toISOString(),
      status: blocked.length ? "blocked" : "pass",
      blocked_total: blocked.length,
      matrix,
      next_exact_action: nextExactAction
    });
    writeTextFile(PIPELINE_MATRIX_DOC_PATH, renderPipelineEnforcementMatrix(matrix));
    if (blocked.length) {
      const first = blocked[0];
      throw new Error(first.failure_message);
    }
    console.log(renderPipelineEnforcementMatrix(matrix));
    return;
  }

  if (verb === "matrix" || verb === "status" || verb === "report" || !verb) {
    const nextExactAction = getPipelineNextExactAction(matrix);
    writeJsonFile(PIPELINE_REPORT_PATH, {
      generated_at: new Date().toISOString(),
      status: matrix.every((item) => item.status === "pass") ? "pass" : "blocked",
      blocked_total: matrix.filter((item) => item.status !== "pass").length,
      matrix,
      next_exact_action: nextExactAction
    });
    writeTextFile(PIPELINE_MATRIX_DOC_PATH, renderPipelineEnforcementMatrix(matrix));
    if (flags.json) console.log(JSON.stringify({ generated_at: new Date().toISOString(), next_exact_action: nextExactAction, matrix }, null, 2));
    else console.log(renderPipelineEnforcementMatrix(matrix));
    return;
  }

  if (verb === "check") {
    const commandKey = value || flags.command;
    if (!commandKey) throw new Error("Missing pipeline command key.");
    const result = assertStrictPipeline(commandKey, state, { table, fileExists, readJsonFile, readTextFile, taskId });
    writeJsonFile(PIPELINE_REPORT_PATH, {
      generated_at: new Date().toISOString(),
      status: "pass",
      command_key: commandKey,
      matrix,
      next_exact_action: result.entry.next_action
    });
    writeTextFile(PIPELINE_MATRIX_DOC_PATH, renderPipelineEnforcementMatrix(matrix));
    console.log(JSON.stringify({ ...result.entry, next_exact_action: result.entry.next_action }, null, 2));
    return;
  }

  throw new Error(`Unknown pipeline action: ${action}`);
}

module.exports = { pipeline };
