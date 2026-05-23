const {
  buildListReport,
  buildScanReport,
  buildShowReport,
  buildStatusReport,
  ensureStateFile,
  registerTool,
  runScanAndRegister,
  unregisterTool
} = require("./tool_registry");
const {
  buildDisableExecutionReport,
  buildEnableExecutionReport,
  buildRunContractReport,
  buildRunReport,
  buildRunShowReport,
  buildRunsReport,
  buildTestReport,
  readRunContractFromFile
} = require("./run_contract");
const provider = require("../provider");

async function aiToolAdapters(action, value, flags = {}, rest = [], deps = {}) {
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

  if (normalizedAction === "provider") {
    const report = provider.buildAdapterProviderReport({ state: ensureStateFile() });
    outputReport(report, flags, renderProviderText);
    return report;
  }

  if (normalizedAction === "capabilities") {
    const report = buildCapabilitiesReport(ensureStateFile());
    outputReport(report, flags, renderCapabilitiesText);
    return report;
  }

  if (normalizedAction === "can-run") {
    const contractPath = String(flags.contract || value || rest[0] || "").trim();
    const report = buildCanRunContractReport(contractPath, { state: ensureStateFile() });
    outputReport(report, flags, renderCanRunText);
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

  if (normalizedAction === "test") {
    const toolId = String(flags.tool || value || rest[0] || "").trim();
    const report = buildTestReport(toolId, flags.contract || null, { state: ensureStateFile() });
    outputReport(report, flags, renderContractText);
    return report;
  }

  if (normalizedAction === "run") {
    const toolId = String(flags.tool || value || rest[0] || "").trim();
    const contractPath = String(flags.contract || rest[0] || "").trim();
    const report = await buildRunReport(toolId, contractPath, { confirm: Boolean(flags.confirm) }, { state: ensureStateFile() });
    outputReport(report, flags, renderRunText);
    return report;
  }

  if (normalizedAction === "runs") {
    const report = buildRunsReport();
    outputReport(report, flags, renderRunsText);
    return report;
  }

  if (normalizedAction === "run-show") {
    const runId = String(value || flags.id || flags.run || rest[0] || "").trim();
    if (!runId) {
      const report = buildMissingRunArgumentReport();
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = buildRunShowReport(runId);
    outputReport(report, flags, renderRunText);
    return report;
  }

  if (normalizedAction === "evidence") {
    const runId = String(flags.run || flags.id || value || rest[0] || "").trim();
    if (!runId) {
      const report = buildMissingEvidenceArgumentReport();
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const evidence = provider.getRunEvidence(runId);
    const report = buildEvidenceReport(runId, evidence);
    outputReport(report, flags, renderEvidenceText);
    return report;
  }

  if (normalizedAction === "enable-execution") {
    const toolId = String(flags.tool || value || rest[0] || "").trim();
    if (!toolId) {
      const report = buildMissingToolArgumentReport("enable-execution");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    if (!flags.confirm) {
      const report = {
        report_type: "ai_tool_adapters_enable_execution",
        plugin_id: "ai_tool_adapters",
        status: "blocked",
        tool_id: toolId,
        execution_enabled: false,
        next_action: "Re-run enable-execution with --confirm to toggle the registry flag."
      };
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = buildEnableExecutionReport(toolId);
    outputReport(report, flags, renderToolText);
    return report;
  }

  if (normalizedAction === "disable-execution") {
    const toolId = String(flags.tool || value || rest[0] || "").trim();
    if (!toolId) {
      const report = buildMissingToolArgumentReport("disable-execution");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = buildDisableExecutionReport(toolId);
    outputReport(report, flags, renderToolText);
    return report;
  }

  if (normalizedAction === "contract") {
    const report = buildRunContractReport(flags.contract || value || rest[0] || null, { confirm: Boolean(flags.confirm) });
    outputReport(report, flags, renderContractText);
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

function renderContractText(report) {
  return [
    `Run Contract: ${report.contract_path || "n/a"}`,
    `Status: ${report.status}`,
    `Valid: ${report.valid ? "yes" : "no"}`,
    report.next_action
  ].join("\n");
}

function renderRunText(report) {
  return [
    `Run: ${report.run_id || "n/a"}`,
    `Status: ${report.status}`,
    `Tool: ${report.tool_id || "n/a"}`,
    report.next_action
  ].join("\n");
}

function renderRunsText(report) {
  return [
    "AI Tool Adapter Runs",
    `Total: ${report.count}`,
    `Completed: ${report.status_counts.completed || 0}`,
    `Failed: ${report.status_counts.failed || 0}`,
    `Timed out: ${report.status_counts.timed_out || 0}`,
    `Blocked: ${report.status_counts.blocked || 0}`,
    report.next_action
  ].join("\n");
}

function renderProviderText(report) {
  return [
    "AI Tool Adapters Provider",
    `Provider: ${report.provider_id}`,
    `Tools: ${report.tools_count}`,
    `Execution-enabled tools: ${report.execution_enabled_count}`,
    `Integration: ${report.integration_status && report.integration_status.status ? report.integration_status.status : "unknown"}`,
    report.next_action
  ].join("\n");
}

function renderCapabilitiesText(report) {
  return [
    "AI Tool Adapter Capabilities",
    `Tools: ${report.tools.length}`,
    ...report.tools.map((tool) => `- ${tool.tool_id}: ${tool.capabilities.join(", ")}`),
    report.next_action
  ].join("\n");
}

function renderCanRunText(report) {
  return [
    "AI Tool Adapter Run Readiness",
    `Status: ${report.status}`,
    `Valid: ${report.valid ? "yes" : "no"}`,
    `Execution enabled: ${report.execution_enabled ? "yes" : "no"}`,
    report.next_action
  ].join("\n");
}

function renderEvidenceText(report) {
  return [
    "AI Tool Adapter Run Evidence",
    report.found ? `Run: ${report.run_id}` : `Run not found: ${report.run_id || "unknown"}`,
    report.found ? `Status: ${report.run.status}` : "Status: missing",
    report.next_action
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

function buildMissingRunArgumentReport() {
  return {
    report_type: "ai_tool_adapters_run_show",
    plugin_id: "ai_tool_adapters",
    status: "warning",
    found: false,
    run_id: null,
    run: null,
    next_action: "Missing run id for ai-tool-adapters run-show."
  };
}

function buildMissingEvidenceArgumentReport() {
  return {
    report_type: "ai_tool_adapters_evidence",
    plugin_id: "ai_tool_adapters",
    status: "warning",
    found: false,
    run_id: null,
    run: null,
    next_action: "Missing run id for ai-tool-adapters evidence."
  };
}

function buildCapabilitiesReport(state) {
  const tools = provider.listAvailableTools({ state });
  return {
    report_type: "ai_tool_adapters_capabilities",
    plugin_id: "ai_tool_adapters",
    status: tools.length ? "available" : "warning",
    provider_id: "ai_tool_adapters",
    tools,
    count: tools.length,
    next_action: tools.length
      ? "Use ai-tool-adapters can-run with a governed contract to verify readiness."
      : "Run ai-tool-adapters scan to detect tools before inspecting capabilities."
  };
}

function buildCanRunContractReport(contractPath, options = {}) {
  if (!contractPath) {
    return {
      report_type: "ai_tool_adapters_can_run",
      plugin_id: "ai_tool_adapters",
      status: "warning",
      valid: false,
      contract: null,
      tool: null,
      blockers: ["missing contract path"],
      warnings: [],
      policy_checks: [],
      execution_enabled: false,
      next_action: "Provide --contract <path> to inspect a run contract."
    };
  }
  let contract;
  try {
    contract = readRunContractFromFile(contractPath);
  } catch (error) {
    return {
      report_type: "ai_tool_adapters_can_run",
      plugin_id: "ai_tool_adapters",
      status: "blocked",
      valid: false,
      contract_path: contractPath,
      contract: null,
      tool: null,
      blockers: [error.message],
      warnings: [],
      policy_checks: [],
      execution_enabled: false,
      next_action: "Provide a valid run contract before asking if it can run."
    };
  }
  const report = provider.canRunContract(contract, options);
  return {
    ...report,
    contract_path: contractPath
  };
}

function buildEvidenceReport(runId, evidence) {
  if (!evidence) {
    return {
      report_type: "ai_tool_adapters_evidence",
      plugin_id: "ai_tool_adapters",
      status: "warning",
      found: false,
      run_id: runId || null,
      run: null,
      next_action: "Run ai-tool-adapters runs or rerun a governed contract to create evidence."
    };
  }
  return {
    report_type: "ai_tool_adapters_evidence",
    plugin_id: "ai_tool_adapters",
    status: "available",
    found: true,
    run_id: runId,
    run: evidence,
    next_action: "Use the evidence record to review policy checks and redactions."
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
  renderContractText,
  renderRunText,
  renderRunsText,
  renderProviderText,
  renderCapabilitiesText,
  renderCanRunText,
  renderEvidenceText,
  buildMissingToolArgumentReport,
  buildMissingRunArgumentReport,
  buildMissingEvidenceArgumentReport,
  buildCapabilitiesReport,
  buildCanRunContractReport,
  buildEvidenceReport
};
