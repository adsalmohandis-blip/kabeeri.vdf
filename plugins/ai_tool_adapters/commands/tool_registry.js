const fs = require("fs");
const path = require("path");
const {
  buildRegisteredToolFromInput,
  buildAdapterCatalogReport,
  buildAdaptationPackCatalogReport,
  buildPromptCatalogReport,
  adaptationPackForCommand,
  getAdapterProfileForCommand,
  normalizeScanHistoryEntry,
  normalizeToolId,
  scanKnownTools
} = require("./tool_scan");

const STATE_FILE = ".kabeeri/ai_tool_adapters.json";
const TEMPLATE_FILE = path.join(__dirname, "..", "runtime", "ai_tool_adapters.template.json");

function getStatePath() {
  return path.resolve(process.cwd(), STATE_FILE);
}

function readTemplateState() {
  return JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8"));
}

function ensureWorkspace() {
  fs.mkdirSync(path.dirname(getStatePath()), { recursive: true });
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8"));
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(path.resolve(process.cwd(), filePath), `${JSON.stringify(value, null, 2)}\n`);
}

function createDefaultState() {
  return JSON.parse(JSON.stringify(readTemplateState()));
}

function normalizePolicies(policies = {}) {
  const template = createDefaultState().policies;
  return {
    execution_default: "disabled",
    manual_registration_allowed: true,
    external_dependencies_allowed: false,
    ...template,
    ...policies
  };
}

function normalizeToolRecord(tool = {}) {
  const now = new Date().toISOString();
  const descriptor = getAdapterProfileForCommand(tool.command || tool.platform_name || tool.resolved_command || tool.tool_id || "") || null;
  const command = String(tool.command || (descriptor ? descriptor.command : tool.tool_id || "")).trim();
  const adaptationPack = adaptationPackForCommand(command);
  return {
    tool_id: normalizeToolId(tool.tool_id || command),
    platform_name: tool.platform_name || (descriptor ? descriptor.platform_name : null),
    tool_type: tool.tool_type || (descriptor ? descriptor.tool_type : "custom_tool"),
    display_name: tool.display_name || (descriptor ? descriptor.display_name : command || "Unknown Tool"),
    command,
    commands: Array.isArray(tool.commands) && tool.commands.length
      ? Array.from(new Set(tool.commands.map((item) => String(item).trim()).filter(Boolean)))
      : (descriptor && Array.isArray(descriptor.commands) ? descriptor.commands.slice() : [command]),
    resolved_command: tool.resolved_command || (descriptor ? descriptor.command : command),
    resolved_path: tool.resolved_path ?? null,
    adapter_family: tool.adapter_family || (descriptor ? descriptor.adapter_family : "custom"),
    adapter_surface: tool.adapter_surface || (descriptor ? descriptor.adapter_surface : "cli"),
    adaptation_pack_id: tool.adaptation_pack_id || (adaptationPack ? adaptationPack.adaptation_pack_id : null),
    adaptation_pack_name: tool.adaptation_pack_name || (adaptationPack ? adaptationPack.display_name : null),
    adaptation_pack: tool.adaptation_pack || adaptationPack,
    prompt_profile_id: tool.prompt_profile_id || (adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile.prompt_profile_id : null),
    prompt_profile: tool.prompt_profile || (adaptationPack ? adaptationPack.prompt_profile : null),
    activation_state: tool.activation_state || (tool.resolved_path ? "installed" : (adaptationPack ? "missing" : "unknown")),
    editor: String(tool.editor || (descriptor && descriptor.adapter_surface === "editor" ? "cursor" : "unknown")).trim() || "unknown",
    status: ["detected", "registered", "missing", "disabled"].includes(tool.status) ? tool.status : "missing",
    capabilities: Array.isArray(tool.capabilities) && tool.capabilities.length
      ? Array.from(new Set(tool.capabilities))
      : (descriptor ? descriptor.capabilities.slice() : ["terminal_assist"]),
    execution_enabled: Boolean(tool.execution_enabled),
    detected_at: tool.detected_at ?? null,
    registered_at: tool.registered_at ?? null,
    last_checked_at: tool.last_checked_at ?? null,
    notes: tool.notes ?? null,
    updated_at: tool.updated_at ?? now
  };
}

function normalizeState(state) {
  const template = createDefaultState();
  const source = state && typeof state === "object" ? state : {};
  return {
    ...template,
    ...source,
    version: "v1",
    generated_at: source.generated_at ?? template.generated_at ?? null,
    updated_at: source.updated_at ?? template.updated_at ?? null,
    tools: Array.isArray(source.tools) ? source.tools.map((tool) => normalizeToolRecord(tool)) : [],
    scan_history: Array.isArray(source.scan_history) ? source.scan_history.map((entry) => normalizeScanHistoryEntry(entry)) : [],
    policies: normalizePolicies(source.policies)
  };
}

function readState({ createIfMissing = true } = {}) {
  ensureWorkspace();
  const statePath = getStatePath();
  if (!fs.existsSync(statePath)) {
    if (!createIfMissing) return null;
    const state = createDefaultState();
    writeState(state);
    return state;
  }
  return normalizeState(readJsonFile(STATE_FILE));
}

function writeState(state) {
  ensureWorkspace();
  const normalized = normalizeState(state);
  fs.mkdirSync(path.dirname(getStatePath()), { recursive: true });
  writeJsonFile(STATE_FILE, normalized);
  return normalized;
}

function ensureStateFile() {
  return readState({ createIfMissing: true });
}

function findTool(state, toolId) {
  const normalizedId = normalizeToolId(toolId);
  return (state.tools || []).find((tool) => tool.tool_id === normalizedId || tool.command === toolId || tool.resolved_command === toolId) || null;
}

function upsertTool(state, toolRecord) {
  const next = normalizeState(state);
  const record = normalizeToolRecord(toolRecord);
  const existingIndex = next.tools.findIndex((tool) => tool.tool_id === record.tool_id || tool.command === record.command);
  if (existingIndex >= 0) next.tools[existingIndex] = { ...next.tools[existingIndex], ...record };
  else next.tools.push(record);
  next.tools.sort((left, right) => left.tool_id.localeCompare(right.tool_id));
  next.updated_at = new Date().toISOString();
  if (!next.generated_at) next.generated_at = next.updated_at;
  return writeState(next);
}

function disableTool(state, toolId) {
  const next = normalizeState(state);
  const record = findTool(next, toolId);
  if (!record) {
    return { state: next, tool: null };
  }
  record.status = "disabled";
  record.execution_enabled = false;
  record.last_checked_at = new Date().toISOString();
  record.notes = record.notes || "Disabled by unregister command.";
  next.updated_at = record.last_checked_at;
  if (!next.generated_at) next.generated_at = next.updated_at;
  return { state: writeState(next), tool: normalizeToolRecord(record) };
}

function setToolExecutionEnabled(state, toolId, enabled) {
  const next = normalizeState(state);
  const record = findTool(next, toolId);
  if (!record) {
    return { state: next, tool: null };
  }
  record.execution_enabled = Boolean(enabled);
  if (enabled && record.status === "disabled") {
    record.status = "registered";
  }
  record.last_checked_at = new Date().toISOString();
  record.updated_at = record.last_checked_at;
  next.updated_at = record.updated_at;
  if (!next.generated_at) next.generated_at = next.updated_at;
  return { state: writeState(next), tool: normalizeToolRecord(record) };
}

function buildCounts(tools = []) {
  const byFamily = {};
  const bySurface = {};
  for (const tool of tools) {
    const family = String(tool.adapter_family || "custom");
    const surface = String(tool.adapter_surface || "cli");
    byFamily[family] = (byFamily[family] || 0) + 1;
    bySurface[surface] = (bySurface[surface] || 0) + 1;
  }
  return {
    total: tools.length,
    detected: tools.filter((tool) => tool.status === "detected").length,
    registered: tools.filter((tool) => tool.status === "registered").length,
    missing: tools.filter((tool) => tool.status === "missing").length,
    disabled: tools.filter((tool) => tool.status === "disabled").length,
    by_family: byFamily,
    by_surface: bySurface
  };
}

function buildStatusReport(state = ensureStateFile()) {
  const normalized = normalizeState(state);
  const counts = buildCounts(normalized.tools);
  const catalog = buildAdapterCatalogReport(normalized.tools);
  const packCatalog = buildAdaptationPackReport(normalized.tools);
  const promptCatalog = buildPromptCatalogReport(normalized);
  return {
    report_type: "ai_tool_adapters_status",
    plugin_id: "ai_tool_adapters",
    status: "available",
    available: true,
    enabled_by_default: true,
    state_path: STATE_FILE,
    execution_default: normalized.policies.execution_default,
    policies: normalized.policies,
    tools: counts,
    adapter_catalog_size: catalog.count,
    adapter_catalog_installed_count: catalog.installed_count || 0,
    supported_adapter_families: catalog.summary.by_family,
    supported_adapter_surfaces: catalog.summary.by_surface,
    supported_adapter_activation_states: catalog.summary.by_activation,
    adaptation_pack_count: packCatalog.count,
    adaptation_pack_installed_count: packCatalog.installed_count || 0,
    prompt_profile_count: promptCatalog.count,
    execution_enabled: false,
    next_action: "Run kvdf ai-tool-adapter scan --json to detect local AI tools and compare them against the adapter catalog."
  };
}

function buildListReport(state = ensureStateFile()) {
  const normalized = normalizeState(state);
  const counts = buildCounts(normalized.tools);
  return {
    report_type: "ai_tool_adapters_list",
    plugin_id: "ai_tool_adapters",
    tools: normalized.tools,
    count: normalized.tools.length,
    adapter_families: counts.by_family,
    adapter_surfaces: counts.by_surface,
    adapter_activation_states: buildAdapterCatalogReport(normalized.tools).summary.by_activation,
    prompt_profile_count: buildPromptCatalogReportWrapper(normalized).count,
    next_action: "Run kvdf ai-tool-adapter scan --json to refresh detected tools."
  };
}

function buildMissingToolReport(toolId) {
  return {
    report_type: "ai_tool_adapters_show",
    plugin_id: "ai_tool_adapters",
    status: "warning",
    found: false,
    tool_id: normalizeToolId(toolId),
    tool: null,
    next_action: "Run kvdf ai-tool-adapter scan --json or register the tool manually."
  };
}

function buildShowReport(toolId, state = ensureStateFile()) {
  const normalized = normalizeState(state);
  const tool = findTool(normalized, toolId);
  if (!tool) return buildMissingToolReport(toolId);
  return {
    report_type: "ai_tool_adapters_show",
    plugin_id: "ai_tool_adapters",
    status: tool.status === "disabled" ? "warning" : "available",
    found: true,
    tool_id: tool.tool_id,
    tool,
    next_action: tool.status === "disabled"
      ? "Run kvdf ai-tool-adapter register --tool <tool> to reactivate the registry entry."
      : "Run kvdf ai-tool-adapter scan --json to refresh the local detection record."
  };
}

function mergeDetectedTools(state, detectedTools, now = new Date().toISOString()) {
  const next = normalizeState(state);
  const added = [];
  for (const tool of detectedTools) {
    const existing = findTool(next, tool.tool_id);
    if (existing) {
      existing.last_checked_at = now;
      existing.resolved_path = tool.resolved_path || existing.resolved_path;
      existing.resolved_command = tool.resolved_command || existing.resolved_command;
      existing.adapter_family = tool.adapter_family || existing.adapter_family;
      existing.adapter_surface = tool.adapter_surface || existing.adapter_surface;
      existing.adaptation_pack_id = tool.adaptation_pack_id || existing.adaptation_pack_id;
      existing.adaptation_pack_name = tool.adaptation_pack_name || existing.adaptation_pack_name;
      existing.adaptation_pack = tool.adaptation_pack || existing.adaptation_pack;
      existing.prompt_profile_id = tool.prompt_profile_id || existing.prompt_profile_id;
      existing.prompt_profile = tool.prompt_profile || existing.prompt_profile;
      existing.activation_state = tool.activation_state || existing.activation_state;
      if (existing.status !== "disabled") {
        existing.status = existing.status === "registered" ? "registered" : "detected";
        if (!existing.detected_at) existing.detected_at = tool.detected_at || now;
      }
      continue;
    }
    next.tools.push(normalizeToolRecord({
      ...tool,
      status: "detected",
      execution_enabled: false,
      detected_at: tool.detected_at || now,
      registered_at: null,
      last_checked_at: now,
      notes: tool.notes || null
    }));
    added.push(tool.tool_id);
  }
  next.tools.sort((left, right) => left.tool_id.localeCompare(right.tool_id));
  next.updated_at = now;
  if (!next.generated_at) next.generated_at = now;
  const scanHistoryEntry = normalizeScanHistoryEntry({
    scanned_at: now,
    candidates: detectedTools.map((tool) => ({
      tool_id: tool.tool_id,
      platform_name: tool.platform_name,
      tool_type: tool.tool_type,
      command: tool.command,
      resolved_command: tool.resolved_command,
      resolved_path: tool.resolved_path,
      detected: Boolean(tool.resolved_path),
      editor: tool.editor,
      status: tool.status,
      capabilities: tool.capabilities,
      adapter_family: tool.adapter_family,
      adapter_surface: tool.adapter_surface,
      adaptation_pack_id: tool.adaptation_pack_id,
      adaptation_pack_name: tool.adaptation_pack_name,
      adaptation_pack: tool.adaptation_pack,
      prompt_profile_id: tool.prompt_profile_id,
      prompt_profile: tool.prompt_profile,
      activation_state: tool.activation_state
    })),
    detected_tools: detectedTools.filter((tool) => tool.resolved_path).map((tool) => tool.tool_id),
    missing_tools: detectedTools.filter((tool) => !tool.resolved_path).map((tool) => tool.tool_id),
    notes: "Path scan completed without running any tools."
  });
  next.scan_history.push(scanHistoryEntry);
  return {
    state: writeState(next),
    scanHistoryEntry,
    added
  };
}

function buildRegisterReport(state, toolRecord) {
  return {
    report_type: "ai_tool_adapters_register",
    plugin_id: "ai_tool_adapters",
    status: toolRecord.status === "missing" ? "warning" : "pass",
    tool: toolRecord,
    execution_enabled: false,
    next_action: "Execution remains disabled in this phase. Use scan or list to inspect local registry state."
  };
}

function buildUnregisterReport(toolRecord) {
  return {
    report_type: "ai_tool_adapters_unregister",
    plugin_id: "ai_tool_adapters",
    status: toolRecord ? "pass" : "warning",
    tool: toolRecord,
    execution_enabled: false,
    next_action: "Execution stays disabled. Re-register the tool later if needed."
  };
}

function buildScanReport(state, detectedTools, scanHistoryEntry, added = []) {
  const counts = buildCounts(detectedTools);
  const catalog = buildAdapterCatalogReport(detectedTools);
  const packCatalog = buildAdaptationPackReport({ tools: detectedTools });
  const promptCatalog = buildPromptCatalogReportWrapper({ tools: detectedTools });
  return {
    report_type: "ai_tool_adapters_scan",
    plugin_id: "ai_tool_adapters",
    status: detectedTools.some((tool) => !tool.resolved_path) ? "warning" : "pass",
    scanned_at: scanHistoryEntry.scanned_at,
    candidates: scanHistoryEntry.candidates,
    detected_tools: scanHistoryEntry.detected_tools,
    missing_tools: scanHistoryEntry.missing_tools,
    tools_added: added,
    tools_total: state.tools.length,
    adapter_families: counts.by_family,
    adapter_surfaces: counts.by_surface,
    adapter_activation_states: counts.by_family ? catalog.summary.by_activation : {},
    adapter_catalog_installed_count: catalog.installed_count || 0,
    adaptation_pack_count: packCatalog.count,
    adaptation_pack_installed_count: packCatalog.installed_count || 0,
    prompt_profile_count: promptCatalog.count,
    execution_enabled: false,
    next_action: "Review the detected tools, then use register only for registry updates. Tool execution remains disabled."
  };
}

function runScanAndRegister(state = ensureStateFile()) {
  const now = new Date().toISOString();
  const detectedTools = scanKnownTools(now);
  return mergeDetectedTools(state, detectedTools, now);
}

function registerTool(input = {}) {
  const state = ensureStateFile();
  const toolRecord = buildRegisteredToolFromInput(input);
  const next = upsertTool(state, toolRecord);
  return buildRegisterReport(next, findTool(next, toolRecord.tool_id) || toolRecord);
}

function unregisterTool(toolId) {
  const state = ensureStateFile();
  const result = disableTool(state, toolId);
  return buildUnregisterReport(result.tool);
}

function buildCatalogReport(state = null) {
  const tools = state && Array.isArray(state.tools) ? state.tools : [];
  return buildAdapterCatalogReport(tools);
}

function buildAdaptationPackReport(state = null) {
  const tools = state && Array.isArray(state.tools) ? state.tools : [];
  return buildAdaptationPackCatalogReport(tools);
}

function buildPromptCatalogReportWrapper(state = null) {
  const tools = state && Array.isArray(state.tools) ? state.tools : [];
  return buildPromptCatalogReport(tools);
}

module.exports = {
  STATE_FILE,
  getStatePath,
  readTemplateState,
  createDefaultState,
  normalizeState,
  normalizeToolRecord,
  ensureStateFile,
  readState,
  writeState,
  findTool,
  upsertTool,
  disableTool,
  setToolExecutionEnabled,
  buildCounts,
  buildStatusReport,
  buildListReport,
  buildShowReport,
  buildMissingToolReport,
  mergeDetectedTools,
  buildRegisterReport,
  buildUnregisterReport,
  buildScanReport,
  buildCatalogReport,
  buildAdaptationPackReport,
  buildPromptCatalogReport: buildPromptCatalogReportWrapper,
  runScanAndRegister,
  registerTool,
  unregisterTool
};
