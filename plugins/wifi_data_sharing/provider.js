const fs = require("fs");
const path = require("path");
const { builtinModules } = require("module");

const manifest = require("./plugin.json");
const state = require("./commands/state");
const discovery = require("./commands/discovery");
const pairing = require("./commands/pairing");
const trustedNodes = require("./commands/trusted_nodes");
const transfer = require("./commands/transfer");
const outbox = require("./commands/outbox");
const retry = require("./commands/retry");
const securityGate = require("./commands/security_gate");
const quarantine = require("./commands/quarantine");

const ALLOWED_CORE_MODULES = new Set(
  builtinModules
    .map((name) => String(name || "").replace(/^node:/, ""))
    .filter(Boolean)
);

const BOOTSTRAP_PACKAGE_TYPES = new Set([
  "worker_join_request",
  "worker_heartbeat",
  "worker_result"
]);

function getProviderInfo() {
  return {
    provider_id: manifest.plugin_id,
    plugin_id: manifest.plugin_id,
    name: manifest.name,
    version: manifest.plugin_version,
    removable: Boolean(manifest.removable),
    bundle_type: manifest.bundle_type || "removable",
    load_strategy: manifest.load_strategy || "manifest_driven",
    track: manifest.track || "shared",
    plugin_family: manifest.plugin_family || "integration_plugin",
    plugin_type: manifest.plugin_type || "wifi_data_sharing",
    capabilities: Array.isArray(manifest.provides)
      ? manifest.provides.filter((capability) => [
        "wifi_data_provider_api",
        "lan_node_discovery",
        "trusted_node_registry",
        "data_package_transfer",
        "transfer_inbox",
        "wifi_data_outbox",
        "wifi_transfer_sessions",
        "resumable_transfer",
        "wifi_data_apply_bridge",
        "wifi_data_applied_records",
        "wifi_data_health",
        "wifi_data_release_readiness",
        "wifi_data_backup",
        "wifi_data_restore",
        "wifi_data_integrity",
        "wifi_data_dashboard",
        "wifi_data_audit",
        "wifi_data_evidence",
        "wifi_data_readiness"
      ].includes(capability))
      : [],
    consumed_by: Array.isArray(manifest.consumed_by) ? manifest.consumed_by.slice() : [],
    command_surface: Array.isArray(manifest.command_surface) ? manifest.command_surface.slice() : [],
    docs_surface: Array.isArray(manifest.docs_surface) ? manifest.docs_surface.slice() : []
  };
}

function ensureState() {
  return state.ensureWifiDataSharingState();
}

function getLocalNode() {
  const current = state.readWifiDataSharingState();
  return current && current.local_node ? { ...current.local_node } : { ...state.defaultWifiDataSharingState().local_node };
}

function listCandidates(options = {}) {
  const current = state.readWifiDataSharingState();
  const candidates = Array.isArray(current.discovery && current.discovery.known_candidates)
    ? current.discovery.known_candidates.map((candidate) => ({ ...candidate }))
    : [];
  return applyLimit(candidates, options.limit);
}

function listTrustedNodes(options = {}) {
  const current = state.readWifiDataSharingState();
  const trusted = Array.isArray(current.trusted_nodes)
    ? current.trusted_nodes.map((node) => ({ ...node }))
    : [];
  return applyLimit(trusted, options.limit);
}

function listInbox(options = {}) {
  const inbox = transfer.listInboxRecords().map((record) => ({ ...record }));
  const filtered = inbox.filter((item) => {
    if (options.packageId && item.package_id !== options.packageId) return false;
    if (options.status && String(item.status || "").toLowerCase() !== String(options.status).toLowerCase()) return false;
    return true;
  });
  return applyLimit(filtered, options.limit);
}

function getPackage(packageId) {
  return transfer.getPackage(packageId);
}

function normalizePackageDescriptor(packageDescriptor) {
  if (!packageDescriptor) return null;
  if (typeof packageDescriptor === "string") {
    return transfer.getPackage(packageDescriptor) || null;
  }
  if (packageDescriptor.package_id && !packageDescriptor.package_type && !packageDescriptor.payload && !packageDescriptor.sha256) {
    const record = transfer.getPackage(packageDescriptor.package_id);
    if (record) return { ...record };
    return null;
  }
  if (packageDescriptor.packet_id && !packageDescriptor.package_id) {
    return {
      package_id: packageDescriptor.packet_id,
      package_type: packageDescriptor.packet_type || packageDescriptor.package_type || "generic_json",
      payload: Object.prototype.hasOwnProperty.call(packageDescriptor, "payload") ? packageDescriptor.payload : null,
      payload_encoding: packageDescriptor.payload_encoding || packageDescriptor.payloadEncoding || "json",
      payload_size_bytes: Number(packageDescriptor.payload_size_bytes || packageDescriptor.size_bytes || 0),
      sha256: packageDescriptor.sha256 || null,
      target_node_id: packageDescriptor.target_node_id || null
    };
  }
  return { ...packageDescriptor };
}

function canSendPackage(packageDescriptor, targetNodeId, options = {}) {
  try {
    const report = evaluateCanSendPackage(packageDescriptor, targetNodeId, options);
    return report;
  } catch (error) {
    return buildBlockedCanSendReport(error.message, packageDescriptor, targetNodeId);
  }
}

function createPackage(packageInput = {}, options = {}) {
  const payload = Object.prototype.hasOwnProperty.call(packageInput, "payload") ? packageInput.payload : options.payload;
  const payloadEncoding = packageInput.payload_encoding || packageInput.payloadEncoding || options.payload_encoding || options.payloadEncoding || null;
  return transfer.createPackage({
    packageType: packageInput.packageType || packageInput.package_type || options.packageType || options.package_type || null,
    inputPath: packageInput.inputPath || packageInput.input_path || options.inputPath || options.input_path || null,
    title: packageInput.title || options.title || null,
    payload,
    payloadEncoding
  });
}

function sendPackage(packageId, targetNodeId, options = {}) {
  const canSend = canSendPackage(packageId, targetNodeId, options);
  if (canSend.status === "blocked") {
    return canSend;
  }
  if (Boolean(options.bootstrap) && !String(targetNodeId || "").trim()) {
    return transfer.sendBootstrapPacket({
      packageId,
      targetNodeId,
      confirm: Boolean(options.confirm),
      loopback: Boolean(options.loopback)
    });
  }
  return transfer.sendPackage({
    packageId,
    targetNodeId,
    confirm: Boolean(options.confirm),
    bootstrap: Boolean(options.bootstrap),
    loopback: Boolean(options.loopback)
  });
}

function sendBootstrapPacket(packageId, targetNodeId, options = {}) {
  const canSend = canSendPackage(packageId, targetNodeId, {
    ...options,
    bootstrap: true
  });
  if (canSend.status === "blocked") {
    return canSend;
  }
  return transfer.sendBootstrapPacket({
    packageId,
    targetNodeId,
    confirm: Boolean(options.confirm),
    loopback: Boolean(options.loopback)
  });
}

function buildProviderReport(options = {}) {
  const current = state.readWifiDataSharingState();
  const providerInfo = getProviderInfo();
  const localNode = getLocalNode();
  const candidates = listCandidates(options);
  const trusted = listTrustedNodes(options);
  const inbox = listInbox(options);
  const packagesReport = transfer.listPackages();
  const transfersReport = transfer.listTransfers();
  const outboxReport = outbox.buildOutboxReport();
  const transferSessionsReport = retry.buildTransferSessionsReport();
  const policyResultsState = state.readWifiTransferPolicyResultsState ? state.readWifiTransferPolicyResultsState() : { policy_results: [] };
  const quarantineState = state.readWifiDataQuarantineState ? state.readWifiDataQuarantineState() : { quarantine: [] };
  const appliedState = state.readWifiDataAppliedState ? state.readWifiDataAppliedState() : { applied: [] };
  const releaseReport = state.readWifiDataReleaseReport ? state.readWifiDataReleaseReport() : { report: null };
  const integrityReport = state.readWifiDataIntegrityReport ? state.readWifiDataIntegrityReport() : { report: null };
  const backups = state.listWifiDataBackups ? state.listWifiDataBackups() : [];
  const readiness = collectReadinessChecks();
  const status = readiness.blockers.length ? "blocked" : readiness.warnings.length ? "partial" : (localNode.node_id ? "ready" : "partial");
  const report = {
    report_type: "wifi_data_sharing_provider",
    plugin_id: manifest.plugin_id,
    provider_id: manifest.plugin_id,
    generated_at: new Date().toISOString(),
    status,
    provider_info: providerInfo,
    local_node: localNode,
    summary: {
      local_node_initialized: Boolean(localNode.node_id),
      candidates_count: candidates.length,
      trusted_nodes_count: trusted.length,
      revoked_nodes_count: trusted.filter((node) => node.trust_status === "revoked").length,
      packages_count: Array.isArray(packagesReport.packages) ? packagesReport.packages.length : 0,
      inbox_count: inbox.length,
      outbox_count: Array.isArray(outboxReport.outbox) ? outboxReport.outbox.length : 0,
      quarantine_count: inbox.filter((item) => item.quarantined !== false).length,
      quarantine_records_count: Array.isArray(quarantineState.quarantine) ? quarantineState.quarantine.length : 0,
      applied_count: Array.isArray(appliedState.applied) ? appliedState.applied.length : 0,
      backup_count: backups.length,
      policy_results_count: Array.isArray(policyResultsState.policy_results) ? policyResultsState.policy_results.length : 0,
      transfers_count: Array.isArray(transfersReport.transfers) ? transfersReport.transfers.length : 0,
      transfer_sessions_count: Array.isArray(transferSessionsReport.transfer_sessions) ? transferSessionsReport.transfer_sessions.length : 0,
      transfer_server_status: current.transfer_server ? current.transfer_server.status : "stopped",
      transfer_server_port: current.transfer_server ? current.transfer_server.port : null,
      release_status: releaseReport && releaseReport.report ? releaseReport.report.status : "missing",
      integrity_status: integrityReport && integrityReport.report ? integrityReport.report.status : "missing",
      policy_blockers: readiness.blockers.length
    },
    capabilities: providerInfo.capabilities,
    candidates,
    trusted_nodes: trusted,
    inbox,
    outbox: Array.isArray(outboxReport.outbox) ? outboxReport.outbox.slice(-5).reverse() : [],
    packages: Array.isArray(packagesReport.packages) ? packagesReport.packages.slice(-5).reverse() : [],
    transfers: Array.isArray(transfersReport.transfers) ? transfersReport.transfers.slice(-5).reverse() : [],
    transfer_sessions: Array.isArray(transferSessionsReport.transfer_sessions) ? transferSessionsReport.transfer_sessions.slice(-5).reverse() : [],
    integration_status: buildIntegrationStatus(),
    readiness: {
      status: readiness.status,
      blockers: readiness.blockers.slice(),
      warnings: readiness.warnings.slice(),
      next_action: readiness.next_action
    },
    warnings: buildProviderWarnings(current, readiness),
    next_action: buildProviderNextAction(status, localNode, readiness)
  };
  writeProviderReport(report);
  return report;
}

function buildReadinessReport() {
  const report = collectReadinessChecks();
  writeReadinessReport(report);
  return report;
}

function collectReadinessChecks() {
  const checks = [];
  const blockers = [];
  const warnings = [];
  const pluginManifestExists = fs.existsSync(path.join(__dirname, "plugin.json"));
  const bootstrapExportsCommand = bootstrapExportsCommandSurface();
  const providerExportsApi = providerExportsApiAvailable();
  const stateFileExists = fs.existsSync(state.getStateFile());
  const currentState = state.readWifiDataSharingState();
  const localNodeInitialized = Boolean(currentState && currentState.local_node && currentState.local_node.node_id);
  const discoveryAvailable = typeof discovery.runDiscoverCommand === "function" && typeof discovery.runAdvertiseCommand === "function";
  const trustedNodeRegistryAvailable = typeof trustedNodes.trustNode === "function" && typeof trustedNodes.revokeNode === "function";
  const transferAvailable = typeof transfer.createPackage === "function" && typeof transfer.sendPackage === "function" && typeof transfer.wifiDataTransfer === "function";
  const outboxAvailable = typeof outbox.buildOutboxReport === "function" && typeof outbox.wifiDataOutbox === "function";
  const transferSessionsAvailable = typeof retry.buildTransferSessionsReport === "function" && typeof retry.resumeTransferSession === "function";
  const applyAvailable = typeof require("./commands/apply").buildApplyReport === "function" && typeof require("./commands/apply").buildAppliedReport === "function";
  const healthAvailable = typeof require("./commands/health").buildHealthReport === "function";
  const releaseAvailable = typeof require("./commands/release").buildReleaseReport === "function" && typeof require("./commands/release").buildIntegrityReport === "function";
  const backupAvailable = typeof require("./commands/backup").buildBackupReport === "function" && typeof require("./commands/backup").createBackup === "function";
  const restoreAvailable = typeof require("./commands/restore").buildRestoreReport === "function";
  const securityGateAvailable = typeof securityGate.wifiDataSecurityGate === "function" && typeof securityGate.checkPackageSecurity === "function";
  const quarantineAvailable = typeof quarantine.wifiDataQuarantine === "function" && typeof quarantine.buildQuarantineReport === "function";
  const dashboardAvailable = fs.existsSync(path.join(__dirname, "commands", "dashboard.js"));
  const auditAvailable = fs.existsSync(path.join(__dirname, "commands", "audit.js"));
  const evidenceAvailable = fs.existsSync(path.join(__dirname, "commands", "evidence.js"));
  const simulationAvailable = fs.existsSync(path.join(__dirname, "commands", "simulate.js"));
  const noExternalDependencies = checkNoExternalDependencies();
  const coreWrapperThin = checkCoreWrapperThin();

  pushCheck(checks, "plugin_manifest_exists", pluginManifestExists ? "pass" : "fail", pluginManifestExists ? "Plugin manifest is present." : "Plugin manifest is missing.");
  pushCheck(checks, "bootstrap_exports_command", bootstrapExportsCommand ? "pass" : "fail", bootstrapExportsCommand ? "Bootstrap exports the wifiDataSharing command." : "Bootstrap does not export the wifiDataSharing command.");
  pushCheck(checks, "provider_exports_api", providerExportsApi ? "pass" : "fail", providerExportsApi ? "Provider API exports are available." : "Provider API exports are missing.");
  pushCheck(checks, "state_exists", stateFileExists ? "pass" : "warn", stateFileExists ? "Runtime state file is present." : "Runtime state file is missing; provider and command reports can still work from the template state.");
  pushCheck(checks, "local_node_initialized", localNodeInitialized ? "pass" : "fail", localNodeInitialized ? "Local node is initialized." : "Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` to initialize the local node.");
  pushCheck(checks, "discovery_available", discoveryAvailable ? "pass" : "fail", discoveryAvailable ? "Discovery commands are available." : "Discovery commands are unavailable.");
  pushCheck(checks, "trusted_node_registry_available", trustedNodeRegistryAvailable ? "pass" : "fail", trustedNodeRegistryAvailable ? "Trusted node registry commands are available." : "Trusted node registry commands are unavailable.");
  pushCheck(checks, "transfer_available", transferAvailable ? "pass" : "fail", transferAvailable ? "Package transfer commands are available." : "Package transfer commands are unavailable.");
  pushCheck(checks, "outbox_available", outboxAvailable ? "pass" : "fail", outboxAvailable ? "Outbox commands are available." : "Outbox commands are unavailable.");
  pushCheck(checks, "transfer_sessions_available", transferSessionsAvailable ? "pass" : "fail", transferSessionsAvailable ? "Transfer session commands are available." : "Transfer session commands are unavailable.");
  pushCheck(checks, "apply_available", applyAvailable ? "pass" : "fail", applyAvailable ? "Apply bridge commands are available." : "Apply bridge commands are unavailable.");
  pushCheck(checks, "health_available", healthAvailable ? "pass" : "fail", healthAvailable ? "Health commands are available." : "Health commands are unavailable.");
  pushCheck(checks, "release_available", releaseAvailable ? "pass" : "fail", releaseAvailable ? "Release and integrity commands are available." : "Release and integrity commands are unavailable.");
  pushCheck(checks, "backup_available", backupAvailable ? "pass" : "fail", backupAvailable ? "Backup commands are available." : "Backup commands are unavailable.");
  pushCheck(checks, "restore_available", restoreAvailable ? "pass" : "fail", restoreAvailable ? "Restore commands are available." : "Restore commands are unavailable.");
  pushCheck(checks, "security_gate_available", securityGateAvailable ? "pass" : "fail", securityGateAvailable ? "Security gate commands are available." : "Security gate commands are unavailable.");
  pushCheck(checks, "quarantine_available", quarantineAvailable ? "pass" : "fail", quarantineAvailable ? "Quarantine commands are available." : "Quarantine commands are unavailable.");
  pushCheck(checks, "dashboard_available", dashboardAvailable ? "pass" : "fail", dashboardAvailable ? "Dashboard commands are available." : "Dashboard commands are unavailable.");
  pushCheck(checks, "audit_available", auditAvailable ? "pass" : "fail", auditAvailable ? "Audit commands are available." : "Audit commands are unavailable.");
  pushCheck(checks, "evidence_available", evidenceAvailable ? "pass" : "fail", evidenceAvailable ? "Evidence commands are available." : "Evidence commands are unavailable.");
  pushCheck(checks, "simulation_available", simulationAvailable ? "pass" : "fail", simulationAvailable ? "Simulation commands are available." : "Simulation commands are unavailable.");
  pushCheck(checks, "no_external_dependencies", noExternalDependencies ? "pass" : "fail", noExternalDependencies ? "No external dependencies are imported by the wifi_data_sharing plugin." : "External dependencies were detected in the wifi_data_sharing plugin.");
  pushCheck(checks, "core_wrapper_thin", coreWrapperThin ? "pass" : "fail", coreWrapperThin ? "Core wrapper only routes to the plugin bootstrap." : "Core wrapper is doing more than routing to the plugin bootstrap.");

  for (const check of checks) {
    if (check.status === "fail") blockers.push(check.message);
    if (check.status === "warn") warnings.push(check.message);
  }

  return {
    report_type: "wifi_data_sharing_readiness",
    plugin_id: manifest.plugin_id,
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "partial" : "ready",
    checks,
    blockers,
    warnings,
    next_action: buildReadinessNextAction(blockers, warnings)
  };
}

function bootstrapExportsCommandSurface() {
  try {
    const source = fs.readFileSync(path.join(__dirname, "bootstrap.js"), "utf8");
    return /wifiDataSharing\s*:/.test(source)
      && /simulate\s*[,}]/.test(source)
      && /buildWifiDataSharingProviderReport\s*:/.test(source)
      && /buildWifiDataSharingDashboardReport\s*:/.test(source)
      && /buildWifiDataSharingAuditReport\s*:/.test(source)
      && /buildWifiDataSharingEvidenceReport\s*:/.test(source)
      && /buildWifiDataSharingSimulationReport\s*:/.test(source);
  } catch (error) {
    return false;
  }
}

function providerExportsApiAvailable() {
  return [
    getProviderInfo,
    ensureState,
    getLocalNode,
    listCandidates,
    listTrustedNodes,
    canSendPackage,
    createPackage,
    sendPackage,
    sendBootstrapPacket,
    listInbox,
    getPackage,
    buildProviderReport,
    buildReadinessReport
  ].every((fn) => typeof fn === "function");
}

function checkNoExternalDependencies() {
  const files = collectPluginJavaScriptFiles(path.join(__dirname, ".."));
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const imports = collectRequireTargets(content);
    for (const request of imports) {
      if (request.startsWith(".") || request.startsWith("/")) continue;
      const normalized = request.replace(/^node:/, "");
      if (ALLOWED_CORE_MODULES.has(normalized)) continue;
      return false;
    }
  }
  return true;
}

function checkCoreWrapperThin() {
  try {
    const file = path.join(state.repoRoot(), "src", "cli", "commands", "wifi_data_sharing.js");
    if (!fs.existsSync(file)) return false;
    const source = fs.readFileSync(file, "utf8");
    const forbiddenTokens = [
      "createPackage(",
      "sendPackage(",
      "discoverCandidates(",
      "advertisePresence(",
      "trustNode(",
      "revokeNode(",
      "crypto.",
      "net.",
      "dgram."
    ];
    return source.includes("loadPluginBootstrap(\"wifi_data_sharing\"") && !forbiddenTokens.some((token) => source.includes(token));
  } catch (error) {
    return false;
  }
}

function buildIntegrationStatus() {
  return {
    plugin_id: "multi_ai_governance",
    dependency_type: "optional",
    status: "available",
    purpose: "Send governed assignment and evidence packets between trusted local nodes without transferring authority.",
    next_action: "Use the multi_ai_governance client when you are ready to consume this provider."
  };
}

function buildProviderWarnings(currentState, readiness) {
  const warnings = [];
  if (!currentState.local_node || !currentState.local_node.node_id) {
    warnings.push("Local node is not initialized yet.");
  }
  if (readiness.warnings.length) warnings.push(...readiness.warnings);
  if ((currentState.policies && currentState.policies.network_default) === "disabled") {
    warnings.push("Network default is disabled; package exchange remains manually gated.");
  }
  return warnings;
}

function buildProviderNextAction(status, localNode, readiness) {
  if (status === "blocked") return readiness.next_action || "Resolve the readiness blockers.";
  if (!localNode.node_id) return "Initialize the local node before using provider features.";
  return "Use the provider, dashboard, or readiness commands to inspect local Wi-Fi/LAN sharing state.";
}

function buildReadinessNextAction(blockers, warnings) {
  if (blockers.length) return blockers[0];
  if (warnings.length) return warnings[0];
  return "Use the provider, dashboard, or transport commands after the local node is initialized.";
}

function writeProviderReport(report) {
  const file = getProviderReportFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function writeReadinessReport(report) {
  const file = getReadinessReportFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function getProviderReportFile() {
  return path.join(state.repoRoot(), ".kabeeri", "reports", "wifi_data_sharing_provider.json");
}

function getReadinessReportFile() {
  return path.join(state.repoRoot(), ".kabeeri", "reports", "wifi_data_sharing_readiness.json");
}

function readProviderReportFile() {
  const file = getProviderReportFile();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readReadinessReportFile() {
  const file = getReadinessReportFile();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectPluginJavaScriptFiles(rootDir) {
  const output = [];
  if (!fs.existsSync(rootDir)) return output;
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        output.push(fullPath);
      }
    }
  }
  return output;
}

function collectRequireTargets(source) {
  const requests = [];
  const requirePattern = /require\((['"])([^'"]+)\1\)/g;
  let match = null;
  while ((match = requirePattern.exec(source))) {
    requests.push(match[2]);
  }
  const importPattern = /import\s+(?:[^'"]+\s+from\s+)?(['"])([^'"]+)\1/g;
  while ((match = importPattern.exec(source))) {
    requests.push(match[2]);
  }
  return requests;
}

function pushCheck(checks, checkId, status, message) {
  checks.push({
    check_id: checkId,
    status,
    message
  });
}

function buildBlockedCanSendReport(message, packageDescriptor, targetNodeId) {
  const normalized = normalizePackageDescriptor(packageDescriptor);
  return {
    report_type: "wifi_data_sharing_can_send",
    plugin_id: manifest.plugin_id,
    provider_id: manifest.plugin_id,
    status: "blocked",
    can_send: false,
    package_id: normalized ? normalized.package_id || normalized.packet_id || null : null,
    package_type: normalized ? normalized.package_type || normalized.packet_type || null : null,
    package_size_bytes: Number(normalized && normalized.payload_size_bytes ? normalized.payload_size_bytes : 0),
    target_node_id: targetNodeId || (normalized ? normalized.target_node_id || null : null),
    transfer_mode: "single_frame",
    blockers: [message],
    warnings: [],
    next_action: message
  };
}

function evaluateCanSendPackage(packageDescriptor, targetNodeId, options = {}) {
  const current = state.readWifiDataSharingState();
  const normalized = normalizePackageDescriptor(packageDescriptor);
  if (!current.local_node || !current.local_node.node_id) {
    return buildBlockedCanSendReport("Initialize the local node before checking transfer eligibility.", normalized, targetNodeId);
  }
  if (!normalized) {
    return buildBlockedCanSendReport("Package descriptor is required.", normalized, targetNodeId);
  }
  const targetId = String(targetNodeId || normalized.target_node_id || options.targetNodeId || options.target_node_id || "").trim();
  const packageType = String(normalized.package_type || normalized.packet_type || "").trim().toLowerCase();
  const allowBootstrap = Boolean(options.bootstrap) && BOOTSTRAP_PACKAGE_TYPES.has(packageType);
  if (!targetId && !allowBootstrap) {
    return buildBlockedCanSendReport("Target node id is required.", normalized, targetNodeId);
  }
  if (!transfer.ALLOWED_PACKAGE_TYPES.has(packageType)) {
    return buildBlockedCanSendReport(`Unsupported package type: ${packageType || "unknown"}.`, normalized, targetId);
  }
  const trustedTargetNode = trustedNodes.findTrustedNodeRecord(current, targetId);
  const discoveredTargetNode = Array.isArray(current.discovery && current.discovery.known_candidates)
    ? current.discovery.known_candidates.find((item) => item && item.node_id === targetId)
    : null;
  const targetNode = trustedTargetNode || discoveredTargetNode || null;
  if (!targetNode && !allowBootstrap) {
    return buildBlockedCanSendReport(
      "Target node is not trusted.",
      normalized,
      targetId
    );
  }
  if (targetNode && targetNode.trust_status === "revoked") {
    return buildBlockedCanSendReport("Target node is revoked.", normalized, targetId);
  }
  if (targetNode && targetNode.trust_status !== "trusted" && !allowBootstrap) {
    return buildBlockedCanSendReport("Target node is not trusted.", normalized, targetId);
  }
  const packageSizeBytes = resolvePackageSize(normalized);
  if (packageSizeBytes > Number(current.policies && current.policies.max_package_bytes ? current.policies.max_package_bytes : transfer.PACKAGE_SIZE_LIMIT)) {
    return buildBlockedCanSendReport("Package exceeds the allowed size limit.", normalized, targetId);
  }
  if (hasPackageHash(normalized) && !verifyPackageDescriptorHash(normalized)) {
    return buildBlockedCanSendReport("Package hash validation failed.", normalized, targetId);
  }
  const warnings = [];
  if (current.policies && current.policies.data_transfer_default === "disabled") {
    warnings.push("Data transfer is disabled by default and should remain manually confirmed.");
  }
  const transferMode = packageSizeBytes > (256 * 1024) ? "chunked" : "single_frame";
  const status = warnings.length ? "warn" : "pass";
  return {
    report_type: "wifi_data_sharing_can_send",
    plugin_id: manifest.plugin_id,
    provider_id: manifest.plugin_id,
    status,
    can_send: true,
    package_id: normalized.package_id || normalized.packet_id || null,
    package_type: packageType,
    package_size_bytes: packageSizeBytes,
    target_node_id: targetId || null,
    target_trust_status: targetNode ? targetNode.trust_status : (allowBootstrap ? "broadcast" : null),
    bootstrap_packet: allowBootstrap,
    transfer_mode: transferMode,
    blockers: [],
    warnings,
    next_action: allowBootstrap && !targetId
      ? `Run \`kvdf wifi-data-sharing send --package ${normalized.package_id || normalized.packet_id || "<package-id>"} --confirm\` to broadcast the bootstrap packet on the LAN.`
      : `Run \`kvdf wifi-data-sharing send --package ${normalized.package_id || normalized.packet_id || "<package-id>"} --to ${targetId} --confirm\` to deliver it.`
  };
}

function verifyPackageDescriptorHash(packageDescriptor) {
  if (!packageDescriptor) return false;
  if (typeof packageDescriptor === "string") {
    const record = transfer.getPackage(packageDescriptor);
    return record ? transfer.verifyPackageHash(record) : false;
  }
  if (packageDescriptor.sha256 && Object.prototype.hasOwnProperty.call(packageDescriptor, "payload")) {
    return transfer.verifyPackageHash(packageDescriptor);
  }
  if (packageDescriptor.package_id) {
    const record = transfer.getPackage(packageDescriptor.package_id);
    if (record) return transfer.verifyPackageHash(record);
  }
  if (packageDescriptor.packet_id && Object.prototype.hasOwnProperty.call(packageDescriptor, "payload")) {
    const normalized = normalizeInlinePacketDescriptor(packageDescriptor);
    return transfer.verifyPackageHash(normalized);
  }
  return true;
}

function hasPackageHash(packageDescriptor) {
  if (!packageDescriptor) return false;
  if (typeof packageDescriptor === "string") {
    const record = transfer.getPackage(packageDescriptor);
    return Boolean(record && record.sha256);
  }
  if (packageDescriptor.sha256) return true;
  if (packageDescriptor.package_id) {
    const record = transfer.getPackage(packageDescriptor.package_id);
    return Boolean(record && record.sha256);
  }
  return false;
}

function normalizeInlinePacketDescriptor(packet) {
  const payloadRecord = transfer.normalizeInlinePackagePayload(
    String(packet.package_type || packet.packet_type || "generic_json").toLowerCase(),
    packet.payload,
    packet.payload_encoding || packet.payloadEncoding || null
  );
  return {
    package_id: packet.package_id || packet.packet_id,
    package_type: packet.package_type || packet.packet_type || "generic_json",
    payload: payloadRecord.value,
    payload_encoding: payloadRecord.encoding,
    payload_size_bytes: Buffer.isBuffer(payloadRecord.raw) ? payloadRecord.raw.length : Buffer.byteLength(String(payloadRecord.raw || ""), payloadRecord.encoding === "base64" ? "base64" : "utf8"),
    sha256: packet.sha256 || null,
    target_node_id: packet.target_node_id || null
  };
}

function resolvePackageSize(packageDescriptor) {
  if (!packageDescriptor) return 0;
  const direct = Number(packageDescriptor.payload_size_bytes || packageDescriptor.size_bytes || packageDescriptor.size || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (Object.prototype.hasOwnProperty.call(packageDescriptor, "payload")) {
    const normalized = normalizeInlinePacketDescriptor(packageDescriptor);
    return Number(normalized.payload_size_bytes || 0);
  }
  if (packageDescriptor.package_id || packageDescriptor.packet_id) {
    const record = transfer.getPackage(packageDescriptor.package_id || packageDescriptor.packet_id);
    if (record) return Number(record.payload_size_bytes || 0);
  }
  return 0;
}

function applyLimit(items, limit) {
  const numeric = Number(limit);
  if (!Number.isFinite(numeric) || numeric <= 0) return items;
  return items.slice(0, numeric);
}

module.exports = {
  getProviderInfo,
  ensureState,
  getLocalNode,
  listCandidates,
  listTrustedNodes,
  canSendPackage,
  createPackage,
  sendPackage,
  sendBootstrapPacket,
  listInbox,
  getPackage,
  buildProviderReport,
  buildReadinessReport,
  writeProviderReport,
  writeReadinessReport,
  collectReadinessChecks,
  checkNoExternalDependencies,
  checkCoreWrapperThin,
  readProviderReportFile
};
