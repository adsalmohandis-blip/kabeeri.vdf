const { buildListReport, buildScanReport, buildShowReport, buildStatusReport, ensureStateFile, registerTool, runScanAndRegister, unregisterTool } = require("./tool_registry");

function aiToolAdapters(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const normalizedAction = normalizeAction(action);

  if (!normalizedAction || normalizedAction === "status") {
    const report = buildStatusReport(ensureStateFile());
    outputReport(report, flags, renderStatusText);
    return report;
  }

  if (normalizedAction === "scan") {
    const state = ensureStateFile();
    const { state: nextState, scanHistoryEntry, added } = runScanAndRegister(state);
    const report = buildScanReport(nextState, nextState.tools, scanHistoryEntry, added);
    outputReport(report, flags, renderScanText);
    return report;
  }

  if (normalizedAction === "list") {
    const report = buildListReport(ensureStateFile());
    outputReport(report, flags, renderListText);
    return report;
  }

  if (normalizedAction === "register") {
    const tool = String(flags.tool || value || rest[0] || "").trim();
    if (!tool) {
      const report = buildMissingToolArgumentReport("register");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = registerTool({
      tool,
      path: String(flags.path || "auto").trim(),
      editor: flags.editor || "unknown"
    });
    outputReport(report, flags, renderToolText);
    return report;
  }

  if (normalizedAction === "unregister") {
    const toolId = String(flags.tool || value || rest[0] || "").trim();
    if (!toolId) {
      const report = buildMissingToolArgumentReport("unregister");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = unregisterTool(toolId);
    outputReport(report, flags, renderToolText);
    return report;
  }

  if (normalizedAction === "show") {
    const toolId = String(value || flags.tool || rest[0] || "").trim();
    if (!toolId) {
      const report = buildMissingToolArgumentReport("show");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = buildShowReport(toolId, ensureStateFile());
    outputReport(report, flags, renderToolText);
    return report;
  }

  throw new Error(`Unknown ai-tool-adapters action: ${action}`);
}

function normalizeAction(action) {
  return String(action || "").trim().toLowerCase();
}

function outputReport(report, flags, renderer = null) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (typeof renderer === "function") {
    console.log(renderer(report));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

function renderStatusText(report) {
  return [
    "AI Tool Adapters",
    `Status: ${report.status}`,
    `Tools: ${report.tools.total} total, ${report.tools.detected} detected, ${report.tools.registered} registered, ${report.tools.disabled} disabled`,
    `Execution default: ${report.execution_default}`,
    report.next_action
  ].join("\n");
}

function renderScanText(report) {
  return [
    "AI Tool Adapters Scan",
    `Detected: ${report.detected_tools.length}`,
    `Missing: ${report.missing_tools.length}`,
    report.next_action
  ].join("\n");
}

function renderListText(report) {
  if (!report.tools.length) return "No AI tools are registered yet.";
  return ["AI Tool Adapters", ...report.tools.map((tool) => `- ${tool.tool_id}: ${tool.status} (${tool.command})`)].join("\n");
}

function renderToolText(report) {
  if (!report.tool) return `AI tool not found: ${report.tool_id || "unknown"}`;
  return [
    `AI Tool: ${report.tool.tool_id}`,
    `Status: ${report.tool.status}`,
    `Command: ${report.tool.command}`,
    `Editor: ${report.tool.editor}`,
    `Execution enabled: ${report.tool.execution_enabled ? "yes" : "no"}`
  ].join("\n");
}

function renderWarningText(report) {
  return report.next_action || "AI Tool Adapters needs an argument.";
}

function buildMissingToolArgumentReport(action) {
  return {
    report_type: `ai_tool_adapters_${action}`,
    plugin_id: "ai_tool_adapters",
    status: "warning",
    tool: null,
    next_action: `Missing --tool for ai-tool-adapters ${action}.`
  };
}

module.exports = {
  aiToolAdapters,
  normalizeAction,
  outputReport,
  renderStatusText,
  renderScanText,
  renderListText,
  renderToolText,
  renderWarningText,
  buildMissingToolArgumentReport
};
