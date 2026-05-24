const fs = require("fs");

const promptPacks = require("./commands/adapter_packs");
const registry = require("./commands/tool_registry");
const toolScan = require("./commands/tool_scan");
const runContract = require("./commands/run_contract");
const runner = require("./commands/tool_runner");

const PROVIDER_ID = "ai_tool_adapters";
const AUTHORITY_PLUGIN_ID = "multi_ai_governance";
const LATEST_RUN_LIMIT = 5;

function getProviderInfo() {
  const state = registry.ensureStateFile();
  const catalog = toolScan.buildAdapterCatalogReport(state.tools || []);
  const packCatalog = registry.buildAdaptationPackReport(state);
  const promptCatalog = registry.buildPromptCatalogReport(state);
  return {
    provider_id: PROVIDER_ID,
    plugin_id: PROVIDER_ID,
    plugin_name: "AI Tool Adapter",
    display_name: "AI Tool Adapter",
    provider_role: "ai_tool_capability_provider",
    authority_plugin_id: AUTHORITY_PLUGIN_ID,
    authority_role: "governance",
    execution_default: "disabled",
    state_file: registry.STATE_FILE,
    runs_file: runner.RUNS_FILE,
    adapter_catalog_count: catalog.count,
    adapter_catalog_installed_count: catalog.installed_count || 0,
    adaptation_pack_count: packCatalog.count,
    adaptation_pack_installed_count: packCatalog.installed_count || 0,
    prompt_profile_count: promptCatalog.count,
    prompt_composition_supported: true,
    supported_adapter_families: catalog.summary.by_family,
    supported_adapter_surfaces: catalog.summary.by_surface,
    supported_adapter_activation_states: catalog.summary.by_activation,
    available: true,
    enabled_by_default: true
  };
}

function ensureState(options = {}) {
  return options.state || registry.ensureStateFile();
}

function listAvailableTools(options = {}) {
  const state = ensureState(options);
  return (state.tools || []).map((tool) => summarizeTool(tool));
}

function getToolCapabilities(toolId, options = {}) {
  const state = ensureState(options);
  const tool = toolId ? registry.findTool(state, toolId) : null;
  if (!tool) {
    return {
      report_type: "ai_tool_adapters_tool_capabilities",
      plugin_id: PROVIDER_ID,
      found: false,
      tool_id: toolId || null,
      tool: null,
      capabilities: [],
      execution_enabled: false,
      status: "warning",
      next_action: "Run ai-tool-adapter scan or register the tool before requesting capabilities."
    };
  }
  return {
    report_type: "ai_tool_adapters_tool_capabilities",
    plugin_id: PROVIDER_ID,
    found: true,
    tool_id: tool.tool_id,
    tool: summarizeTool(tool),
    capabilities: Array.isArray(tool.capabilities) ? tool.capabilities.slice() : [],
    execution_enabled: Boolean(tool.execution_enabled),
    status: "available",
    next_action: "Use multi_ai_governance to authorize a contract before running this tool."
  };
}

function canRunContract(contract, options = {}) {
  const state = ensureState(options);
  const loaded = loadContractInput(contract);
  if (loaded.error) {
    return buildCanRunReport({
      contract: normalizeContractShape(contract),
      tool: null,
      blockers: [loaded.error],
      warnings: [],
      policy_checks: []
    }, false);
  }
  const validation = runContract.validateRunContract(loaded.contract, { state, confirm: true });
  return buildCanRunReport(validation, validation.valid);
}

async function runContractWithProvider(contract, options = {}) {
  const state = ensureState(options);
  const loaded = loadContractInput(contract);
  if (loaded.error) {
    return buildRunBlockedReport({
      contract: normalizeContractShape(contract),
      tool: null,
      blockers: [loaded.error],
      warnings: [],
      policy_checks: []
    }, loaded.error, true);
  }
  const normalizedContract = {
    ...loaded.contract,
    tool_id: loaded.contract.tool_id || options.tool_id || null
  };
  return runContract.buildRunReportFromContract(normalizedContract, { confirm: Boolean(options.confirm) }, { state });
}

function getRunEvidence(runId) {
  if (!runId) return null;
  const events = runner.readRunEvents();
  return events.find((event) => event.run_id === runId || event.event_id === runId) || null;
}

function buildAdapterProviderReport(options = {}) {
  const tools = listAvailableTools(options);
  const state = ensureState(options);
  const catalog = toolScan.buildAdapterCatalogReport(state.tools || []);
  const packCatalog = registry.buildAdaptationPackReport(state);
  const promptCatalog = registry.buildPromptCatalogReport(state);
  const runEvents = runner.readRunEvents().slice(-LATEST_RUN_LIMIT).reverse().map((event) => summarizeRunEvent(event));
  return {
    report_type: "ai_tool_adapters_provider",
    provider_id: PROVIDER_ID,
    plugin_id: PROVIDER_ID,
    plugin_name: "AI Tool Adapter",
    display_name: "AI Tool Adapter",
    tools_count: tools.length,
    available_tools: tools,
    execution_enabled_count: tools.filter((tool) => tool.execution_enabled).length,
    adapter_catalog_count: catalog.count,
    adapter_catalog_installed_count: catalog.installed_count || 0,
    adaptation_pack_count: packCatalog.count,
    adaptation_pack_installed_count: packCatalog.installed_count || 0,
    prompt_profile_count: promptCatalog.count,
    prompt_composition_supported: true,
    adapter_catalog_summary: catalog.summary,
    adaptation_pack_catalog: packCatalog.packs || [],
    prompt_profile_catalog: promptCatalog.prompt_profiles || [],
    latest_runs: runEvents,
    integration_status: {
      provider_api: "available",
      authority_plugin_id: AUTHORITY_PLUGIN_ID,
      dependency_type: "optional",
      status: "ready",
      note: "Capability is provided by ai_tool_adapter; authority remains in multi_ai_governance."
    },
    next_action: "Use multi_ai_governance to authorize an assignment, then call ai_tool_adapter runContract with a validated contract."
  };
}

function buildAdapterCatalogReport() {
  return toolScan.buildAdapterCatalogReport();
}

function buildPromptCompositionReport(input = {}, options = {}) {
  return promptPacks.buildPromptCompositionReport(input, options);
}

function buildPromptBlueprintReport(input = {}, options = {}) {
  const report = promptPacks.buildPromptCompositionReport(input, options);
  return report.prompt_blueprint || report;
}

function buildCanRunReport(validation, ready) {
  return {
    report_type: "ai_tool_adapters_can_run",
    plugin_id: PROVIDER_ID,
    status: ready ? "pass" : "blocked",
    valid: ready,
    contract_id: validation.contract ? validation.contract.contract_id || null : null,
    contract: validation.contract || null,
    tool: validation.tool ? summarizeTool(validation.tool) : null,
    blockers: Array.isArray(validation.blockers) ? validation.blockers.slice() : [],
    warnings: Array.isArray(validation.warnings) ? validation.warnings.slice() : [],
    policy_checks: Array.isArray(validation.policy_checks) ? validation.policy_checks.slice() : [],
    execution_enabled: Boolean(validation.tool && validation.tool.execution_enabled),
    next_action: ready
      ? "multi_ai_governance can approve the assignment, then call ai_tool_adapter runContract with --confirm."
      : "Fix the blockers before requesting a governed run."
  };
}

function buildRunBlockedReport(validation, errorMessage, dryRun = true) {
  const event = buildBlockedEvidenceEvent(validation, errorMessage);
  return {
    report_type: "ai_tool_adapters_run",
    plugin_id: PROVIDER_ID,
    status: "blocked",
    dry_run: dryRun,
    run_id: event.run_id,
    event_id: event.event_id,
    contract_id: event.contract_id,
    task_id: event.task_id,
    assignment_id: event.assignment_id,
    tool_id: event.tool_id,
    command: event.command,
    args_count: event.args_count,
    working_directory: event.working_directory,
    started_at: event.started_at,
    ended_at: event.ended_at,
    duration_ms: event.duration_ms,
    exit_code: event.exit_code,
    signal: event.signal,
    stdout_excerpt: event.stdout_excerpt,
    stderr_excerpt: event.stderr_excerpt,
    redactions_applied: event.redactions_applied,
    policy_checks: event.policy_checks,
    error: event.error,
    next_action: "Review the contract blockers and coordinate through multi_ai_governance before trying again."
  };
}

function buildBlockedEvidenceEvent(validation, reason) {
  const runId = runner.nextRunId();
  const contract = normalizeContractShape(validation.contract) || {};
  const tool = validation.tool || { tool_id: contract.tool_id || "unknown" };
  const now = new Date().toISOString();
  const event = {
    event_id: runId,
    run_id: runId,
    contract_id: contract.contract_id || null,
    tool_id: tool.tool_id || null,
    task_id: contract.task_id ?? null,
    assignment_id: contract.assignment_id ?? null,
    status: "blocked",
    command: contract.command || null,
    args_count: Array.isArray(contract.args) ? contract.args.length : 0,
    working_directory: contract.working_directory || ".",
    started_at: now,
    ended_at: now,
    duration_ms: 0,
    exit_code: null,
    signal: null,
    stdout_excerpt: "",
    stderr_excerpt: "",
    redactions_applied: [],
    policy_checks: Array.isArray(validation.policy_checks) ? validation.policy_checks.slice() : [],
    error: reason || "contract blocked"
  };
  return runner.appendRunEvent(event);
}

function loadContractInput(contract) {
  if (!contract) {
    return { error: "missing contract" };
  }
  if (typeof contract === "string") {
    try {
      return { contract: runContract.readRunContractFromFile(contract) };
    } catch (error) {
      return { error: error.message };
    }
  }
  if (typeof contract === "object") {
    return { contract };
  }
  return { error: "missing contract" };
}

function normalizeContractShape(contract) {
  if (!contract || typeof contract !== "object") return null;
  return {
    contract_id: contract.contract_id ?? null,
    requested_by: contract.requested_by ?? "manual",
    task_id: contract.task_id ?? null,
    assignment_id: contract.assignment_id ?? null,
    tool_id: contract.tool_id ?? null,
    working_directory: contract.working_directory ?? ".",
    command: contract.command ?? null,
    args: Array.isArray(contract.args) ? contract.args.slice() : [],
    stdin: contract.stdin ?? null,
    allowed_commands: Array.isArray(contract.allowed_commands) ? contract.allowed_commands.slice() : [],
    forbidden_commands: Array.isArray(contract.forbidden_commands) ? contract.forbidden_commands.slice() : [],
    allowed_files: Array.isArray(contract.allowed_files) ? contract.allowed_files.slice() : [],
    forbidden_files: Array.isArray(contract.forbidden_files) ? contract.forbidden_files.slice() : [],
    timeout_seconds: Number.isFinite(Number(contract.timeout_seconds)) ? Number(contract.timeout_seconds) : 900,
    capture_stdout: contract.capture_stdout !== undefined ? Boolean(contract.capture_stdout) : true,
    capture_stderr: contract.capture_stderr !== undefined ? Boolean(contract.capture_stderr) : true,
    evidence_required: contract.evidence_required !== undefined ? Boolean(contract.evidence_required) : true
  };
}

function summarizeTool(tool) {
  if (!tool) return null;
  return {
    tool_id: tool.tool_id,
    platform_name: tool.platform_name ?? null,
    tool_type: tool.tool_type,
    display_name: tool.display_name,
    command: tool.command,
    commands: Array.isArray(tool.commands) ? tool.commands.slice() : [],
    resolved_path: tool.resolved_path ?? null,
    resolved_command: tool.resolved_command ?? null,
    adapter_family: tool.adapter_family ?? null,
    adapter_surface: tool.adapter_surface ?? null,
    adaptation_pack_id: tool.adaptation_pack_id ?? null,
    adaptation_pack_name: tool.adaptation_pack_name ?? null,
    adaptation_pack: tool.adaptation_pack ?? null,
    prompt_profile_id: tool.prompt_profile_id ?? null,
    prompt_profile: tool.prompt_profile ?? null,
    activation_state: tool.activation_state ?? null,
    editor: tool.editor,
    status: tool.status,
    capabilities: Array.isArray(tool.capabilities) ? tool.capabilities.slice() : [],
    execution_enabled: Boolean(tool.execution_enabled),
    detected_at: tool.detected_at ?? null,
    registered_at: tool.registered_at ?? null,
    last_checked_at: tool.last_checked_at ?? null,
    notes: tool.notes ?? null
  };
}

function summarizeRunEvent(event) {
  if (!event) return null;
  return {
    run_id: event.run_id,
    event_id: event.event_id,
    contract_id: event.contract_id,
    tool_id: event.tool_id,
    task_id: event.task_id ?? null,
    assignment_id: event.assignment_id ?? null,
    status: event.status,
    command: event.command,
    args_count: event.args_count,
    working_directory: event.working_directory,
    started_at: event.started_at,
    ended_at: event.ended_at,
    duration_ms: event.duration_ms,
    exit_code: event.exit_code,
    signal: event.signal ?? null,
    error: event.error ?? null
  };
}

module.exports = {
  PROVIDER_ID,
  getProviderInfo,
  ensureState,
  listAvailableTools,
  getToolCapabilities,
  canRunContract,
  runContract: runContractWithProvider,
  getRunEvidence,
  buildAdapterProviderReport,
  buildAdapterCatalogReport,
  buildPromptCompositionReport,
  buildPromptBlueprintReport
};
