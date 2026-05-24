const {
  buildListReport,
  buildCatalogReport,
  buildAdaptationPackReport,
  buildPromptCatalogReport,
  buildScanReport,
  buildShowReport,
  buildStatusReport,
  ensureStateFile,
  registerTool,
  runScanAndRegister,
  unregisterTool
} = require("./tool_registry");
const { buildPromptCompositionReport } = require("./adapter_packs");
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
const dashboard = require("./dashboard");
const readiness = require("./readiness");
const evidence = require("./evidence");
const audit = require("./audit");
const policyGate = require("./policy_gate");
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

  if (normalizedAction === "catalog" || normalizedAction === "profiles") {
    const report = buildCatalogReport(ensureStateFile());
    outputReport(report, flags, renderCatalogText);
    return report;
  }

  if (normalizedAction === "packs" || normalizedAction === "adaptation-packs" || normalizedAction === "pack") {
    const report = buildAdaptationPackReport(ensureStateFile());
    outputReport(report, flags, renderAdaptationPackText);
    return report;
  }

  if (normalizedAction === "prompts" || normalizedAction === "prompt-profiles" || normalizedAction === "vibe") {
    const report = buildPromptCatalogReport(ensureStateFile());
    outputReport(report, flags, renderPromptCatalogText);
    return report;
  }

  if (normalizedAction === "compose" || normalizedAction === "prompt" || normalizedAction === "promptize" || normalizedAction === "vibe-prompt" || normalizedAction === "preset" || normalizedAction === "prompt-preset") {
    const report = buildPromptCompositionReport({
      brief: String(flags.brief || flags.vibe || value || rest.join(" ") || "").trim(),
      tool: flags.tool || flags.platform || flags.command || null,
      track: flags.track || flags.workflow_track || flags.scope || null,
      track_mode: flags.track_mode || flags.trackMode || flags.template_mode || flags.templateMode || null,
      preset: flags.preset || flags.template || flags.mode || null,
      context: flags.context || flags.background || null,
      audience: flags.audience || flags.user || null,
      objective: flags.objective || flags.goal || null,
      deliverable: flags.deliverable || flags.output || null,
      tone: flags.tone || flags.style || null,
      format: flags.format || flags.output_format || null,
      validation: parsePromptListFlag(flags.validation || flags.checks || flags.acceptance_criteria),
      constraints: parsePromptListFlag(flags.constraints || flags.constraint),
      checklist: parsePromptListFlag(flags.checklist),
      response_style: parsePromptListFlag(flags.response_style),
      clarify_limit: flags.clarify_limit || flags.clarify || null,
      title: flags.title || flags.prompt_title || null
    }, {
      tool: flags.tool || flags.platform || flags.command || null
    });
    outputReport(report, flags, renderPromptCompositionText);
    return report;
  }

  if (normalizedAction === "blueprint" || normalizedAction === "prompt-blueprint") {
    const report = buildPromptCompositionReport({
      brief: String(flags.brief || flags.vibe || value || rest.join(" ") || "").trim(),
      tool: flags.tool || flags.platform || flags.command || null,
      track: flags.track || flags.workflow_track || flags.scope || null,
      track_mode: flags.track_mode || flags.trackMode || flags.template_mode || flags.templateMode || null,
      preset: flags.preset || flags.template || flags.mode || null,
      context: flags.context || flags.background || null,
      audience: flags.audience || flags.user || null,
      objective: flags.objective || flags.goal || null,
      deliverable: flags.deliverable || flags.output || null,
      tone: flags.tone || flags.style || null,
      format: flags.format || flags.output_format || null,
      validation: parsePromptListFlag(flags.validation || flags.checks || flags.acceptance_criteria),
      constraints: parsePromptListFlag(flags.constraints || flags.constraint),
      checklist: parsePromptListFlag(flags.checklist),
      response_style: parsePromptListFlag(flags.response_style),
      clarify_limit: flags.clarify_limit || flags.clarify || null,
      title: flags.title || flags.prompt_title || null
    }, {
      tool: flags.tool || flags.platform || flags.command || null
    });
    outputReport(report.prompt_blueprint || report, flags, renderPromptBlueprintText);
    return report;
  }

  if (normalizedAction === "register") {
    const tool = String(flags.tool || flags.command || value || rest[0] || "").trim();
    if (!tool) {
      const report = buildMissingToolArgumentReport("register");
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = registerTool({
      tool,
      path: String(flags.path || "auto").trim(),
      editor: flags.editor || "unknown",
      adapter_family: flags.family || undefined,
      adapter_surface: flags.surface || undefined
    });
    outputReport(report, flags, renderToolText);
    return report;
  }

  if (normalizedAction === "provider") {
    const report = provider.buildAdapterProviderReport({ state: ensureStateFile() });
    outputReport(report, flags, renderProviderText);
    return report;
  }

  if (normalizedAction === "dashboard") {
    const report = dashboard.buildDashboardReport({ limit: flags.limit });
    outputReport(report, flags, dashboard.renderDashboardText);
    return report;
  }

  if (normalizedAction === "readiness") {
    const report = readiness.buildReadinessReport();
    outputReport(report, flags, readiness.renderReadinessText);
    return report;
  }

  if (normalizedAction === "audit") {
    const report = audit.buildAuditReport({ limit: flags.limit });
    outputReport(report, flags, audit.renderAuditText);
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
    const policyReport = policyGate.evaluateContract(contractPath, { state: ensureStateFile(), confirm: Boolean(flags.confirm) });
    if (policyReport.status === "blocked" || policyReport.status === "fail" || (policyReport.status === "warn" && !flags.confirm)) {
      const report = policyGate.buildPolicyRunBlockReport(policyReport);
      outputReport(report, flags, renderRunText);
      return report;
    }
    const report = await buildRunReport(toolId, contractPath, { confirm: Boolean(flags.confirm) }, { state: ensureStateFile() });
    outputReport(report, flags, renderRunText);
    return report;
  }

  if (normalizedAction === "policy") {
    const contractPath = String(flags.contract || value || rest[0] || "").trim();
    const report = policyGate.evaluateContract(contractPath, { state: ensureStateFile(), confirm: Boolean(flags.confirm) });
    outputReport(report, flags, renderPolicyText);
    return report;
  }

  if (normalizedAction === "policy-results") {
    const report = policyGate.buildPolicyResultsReport();
    outputReport(report, flags, renderPolicyResultsText);
    return report;
  }

  if (normalizedAction === "policy-show") {
    const policyResultId = String(value || flags.id || flags.policy || rest[0] || "").trim();
    if (!policyResultId) {
      const report = buildMissingPolicyArgumentReport();
      outputReport(report, flags, renderWarningText);
      return report;
    }
    const report = policyGate.buildPolicyShowReport(policyResultId);
    outputReport(report, flags, renderPolicyShowText);
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
    const runId = String(flags.run || flags.id || value || rest[0] || "").trim() || null;
    const report = evidence.buildEvidenceReport({ runId, limit: flags.limit });
    outputReport(report, flags, evidence.renderEvidenceText);
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

  throw new Error(`Unknown ai-tool-adapter action: ${action}`);
}

function normalizeAction(action) {
  return String(action || "").trim().toLowerCase();
}

function parsePromptListFlag(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const normalized = String(value || "").trim();
  if (!normalized) return [];
  return normalized
    .split(/[\n,|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
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
    "AI Tool Adapter",
    `Status: ${report.status}`,
    `Tools: ${report.tools.total} total, ${report.tools.detected} detected, ${report.tools.registered} registered, ${report.tools.disabled} disabled`,
    `Adapter catalog: ${report.adapter_catalog_size || 0} profiles`,
    `Prompt profiles: ${report.prompt_profile_count || 0}`,
    `Execution default: ${report.execution_default}`,
    report.next_action
  ].join("\n");
}

function renderScanText(report) {
  return [
    "AI Tool Adapter Scan",
    `Detected: ${report.detected_tools.length}`,
    `Missing: ${report.missing_tools.length}`,
    report.next_action
  ].join("\n");
}

function renderListText(report) {
  if (!report.tools.length) return "No AI tools are registered yet.";
  return ["AI Tool Adapter", ...report.tools.map((tool) => `- ${tool.tool_id}: ${tool.status} (${tool.command})`)].join("\n");
}

function renderCatalogText(report) {
  return [
    "AI Tool Adapter Catalog",
    `Profiles: ${report.count}`,
    `Installed: ${report.installed_count || 0}`,
    `Prompt profiles: ${report.prompt_profile_count || 0}`,
    ...report.profiles.map((profile) => `- ${profile.platform_name}: ${profile.tool_type} [${profile.adapter_family}/${profile.adapter_surface}] (${profile.commands.join(", ")}) [${profile.activation_state}]`),
    report.next_action
  ].join("\n");
}

function renderAdaptationPackText(report) {
  return [
    "AI Tool Adapter Adaptation Packs",
    `Packs: ${report.count}`,
    `Installed: ${report.installed_count || 0}`,
    ...report.packs.map((pack) => `- ${pack.platform_name}: ${pack.intent} [${pack.activation_state}]`),
    report.next_action
  ].join("\n");
}

function renderPromptCatalogText(report) {
  return [
    "AI Tool Adapter Prompt Profiles",
    `Profiles: ${report.count}`,
    `Installed packs: ${report.installed_count || 0}`,
    ...report.prompt_profiles.map((profile) => `- ${profile.platform_name}: ${profile.prompt_profile.role} (${profile.prompt_profile.prompt_mode}) [${profile.activation_state}]`),
    report.next_action
  ].join("\n");
}

function renderPromptCompositionText(report) {
  return [
    "AI Tool Adapter Prompt Composition",
    `Status: ${report.status}`,
    `Title: ${report.prompt_title || "n/a"}`,
    `Track: ${report.track_label || report.track || "Vibe/App track"}`,
    `Track mode: ${report.track_mode_label || report.track_mode || "general track template"}`,
    report.track_mode_goal ? `Track mode goal: ${report.track_mode_goal}` : null,
    `Preset: ${report.preset_label || report.preset || "general task prompt"}`,
    `Tool: ${report.platform_name || report.command || "generic"}`,
    `Prompt mode: ${report.prompt_mode || "governed"}`,
    report.input_brief ? `Brief: ${report.input_brief}` : "Brief: n/a",
    ...(Array.isArray(report.track_mode_aliases) && report.track_mode_aliases.length ? [`Track mode aliases:\n${report.track_mode_aliases.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.track_mode_examples) && report.track_mode_examples.length ? [`Track mode examples:\n${report.track_mode_examples.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.track_examples) && report.track_examples.length ? [`Track examples:\n${report.track_examples.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.decision_checkpoints) && report.decision_checkpoints.length ? [`Decision checkpoints:\n${report.decision_checkpoints.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.examples) && report.examples.length ? [`Examples:\n${report.examples.map((item) => `- ${item}`).join("\n")}`] : []),
    report.system_prompt ? `System prompt:\n${report.system_prompt}` : null,
    report.developer_prompt ? `Developer prompt:\n${report.developer_prompt}` : null,
    report.professional_prompt ? `Professional prompt:\n${report.professional_prompt}` : null,
    report.next_action
  ].filter(Boolean).join("\n\n");
}

function renderPromptBlueprintText(report) {
  return [
    "AI Tool Adapter Prompt Blueprint",
    `Title: ${report.prompt_title || "n/a"}`,
    `Track: ${report.track_label || report.track || "Vibe/App track"}`,
    `Track mode: ${report.track_mode_label || report.track_mode || "general track template"}`,
    report.track_mode_goal ? `Track mode goal: ${report.track_mode_goal}` : null,
    `Style: ${report.style_label || "governed professional prompt"}`,
    `Preset: ${report.preset_label || report.preset || "general task prompt"}`,
    `Tool: ${report.tool && report.tool.platform_name ? report.tool.platform_name : "generic"}`,
    report.brief ? `Brief: ${report.brief}` : "Brief: n/a",
    ...(Array.isArray(report.track_mode_aliases) && report.track_mode_aliases.length ? [`Track mode aliases:\n${report.track_mode_aliases.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.track_mode_examples) && report.track_mode_examples.length ? [`Track mode examples:\n${report.track_mode_examples.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.track_examples) && report.track_examples.length ? [`Track examples:\n${report.track_examples.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.decision_checkpoints) && report.decision_checkpoints.length ? [`Decision checkpoints:\n${report.decision_checkpoints.map((item) => `- ${item}`).join("\n")}`] : []),
    ...(Array.isArray(report.examples) && report.examples.length ? [`Examples:\n${report.examples.map((item) => `- ${item}`).join("\n")}`] : []),
    report.system_prompt ? `System prompt:\n${report.system_prompt}` : null,
    report.developer_prompt ? `Developer prompt:\n${report.developer_prompt}` : null,
    report.user_prompt ? `User prompt:\n${report.user_prompt}` : null
  ].filter(Boolean).join("\n\n");
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
    "AI Tool Adapter Provider",
    `Provider: ${report.provider_id}`,
    `Tools: ${report.tools_count}`,
    `Execution-enabled tools: ${report.execution_enabled_count}`,
    `Catalog profiles: ${report.adapter_catalog_count}`,
    `Catalog installed: ${report.adapter_catalog_installed_count || 0}`,
    `Adaptation packs: ${report.adaptation_pack_count || 0}`,
    `Adaptation packs installed: ${report.adaptation_pack_installed_count || 0}`,
    `Prompt profiles: ${report.prompt_profile_count || 0}`,
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
    `Status: ${report.status}`,
    `Total runs: ${report.count}`,
    report.filter_run_id ? `Filter: ${report.filter_run_id}` : "Filter: latest runs",
    ...(report.run ? [
      `Selected run: ${report.run.run_id}`,
      `Selected status: ${report.run.status}`,
      `Selected tool: ${report.run.tool_id || "unknown"}`
    ] : ["Selected run: none"]),
    ...(report.latest_runs && report.latest_runs.length ? ["Latest runs:", ...report.latest_runs.map((run) => `- ${run.run_id}: ${run.status} (${run.tool_id || "unknown"})`)] : ["Latest runs: none"]),
    ...(report.warnings && report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    report.next_action
  ].join("\n");
}

function renderPolicyText(report) {
  return [
    "AI Tool Adapter Policy",
    `Status: ${report.status}`,
    `Contract: ${report.contract_id || "n/a"}`,
    `Tool: ${report.tool_id || "n/a"}`,
    report.next_action
  ].join("\n");
}

function renderPolicyResultsText(report) {
  return [
    "AI Tool Adapter Policy Results",
    `Total: ${report.count}`,
    report.next_action
  ].join("\n");
}

function renderPolicyShowText(report) {
  return [
    "AI Tool Adapter Policy Result",
    report.found ? `Result: ${report.policy_result_id}` : `Result not found: ${report.policy_result_id || "unknown"}`,
    report.found ? `Status: ${report.result.status}` : "Status: missing",
    report.next_action
  ].join("\n");
}

function renderWarningText(report) {
  return report.next_action || "AI Tool Adapter needs an argument.";
}

function buildMissingToolArgumentReport(action) {
  return {
    report_type: `ai_tool_adapters_${action}`,
    plugin_id: "ai_tool_adapters",
    status: "warning",
    tool: null,
    next_action: `Missing --tool for ai-tool-adapter ${action}.`
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
    next_action: "Missing run id for ai-tool-adapter run-show."
  };
}

function buildMissingPolicyArgumentReport() {
  return {
    report_type: "ai_tool_adapters_policy_show",
    plugin_id: "ai_tool_adapters",
    status: "warning",
    found: false,
    policy_result_id: null,
    result: null,
    next_action: "Missing policy result id for ai-tool-adapter policy-show."
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
      ? "Use ai-tool-adapter can-run with a governed contract to verify readiness."
      : "Run ai-tool-adapter scan to detect tools before inspecting capabilities."
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
      next_action: "Run ai-tool-adapter runs or rerun a governed contract to create evidence."
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

function buildPromptBlueprintReport(input = {}, options = {}) {
  const report = buildPromptCompositionReport(input, options);
  return report.prompt_blueprint || report;
}

module.exports = {
  aiToolAdapters,
  normalizeAction,
  outputReport,
  renderStatusText,
  renderScanText,
  renderListText,
  renderCatalogText,
  renderAdaptationPackText,
  renderPromptCatalogText,
  renderPromptCompositionText,
  renderPromptBlueprintText,
  renderToolText,
  renderWarningText,
  renderContractText,
  renderRunText,
  renderRunsText,
  renderProviderText,
  renderCapabilitiesText,
  renderCanRunText,
  renderEvidenceText,
  renderPolicyText,
  renderPolicyResultsText,
  renderPolicyShowText,
  buildMissingToolArgumentReport,
  buildMissingRunArgumentReport,
  buildMissingPolicyArgumentReport,
  buildCapabilitiesReport,
  buildCatalogReport,
  buildAdaptationPackReport,
  buildPromptCompositionReport,
  buildPromptBlueprintReport,
  buildPromptCatalogReport,
  buildCanRunContractReport,
  buildEvidenceReport
};
