const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { version: kvdfVersion } = require("../../../package.json");

const REPO_ROOT = path.resolve(__dirname, "../../../");
const DEFAULT_DISCOVERY_PORT = 47632;
const STATE_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_sharing.json");
const DISCOVERY_LOG_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_discovery.jsonl");
const PAIRING_LOG_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_pairing.jsonl");
const TRANSFER_LOG_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_transfers.jsonl");
const TRANSFER_POLICY_RESULTS_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_transfer_policy_results.json");
const QUARANTINE_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_quarantine.json");
const OUTBOX_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_outbox.json");
const TRANSFER_SESSIONS_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_transfer_sessions.json");
const PACKAGES_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_packages.json");
const INBOX_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_inbox.json");
const APPLIED_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_applied.json");
const APPLY_EVENTS_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_apply_events.jsonl");
const RELEASE_REPORT_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_release_report.json");
const INTEGRITY_FILE = path.join(REPO_ROOT, ".kabeeri", "wifi_data_integrity.json");
const BACKUPS_DIR = path.join(REPO_ROOT, ".kabeeri", "wifi_data_backups");
const TEMPLATE_FILE = path.join(REPO_ROOT, "plugins", "wifi_data_sharing", "runtime", "wifi_data_sharing.template.json");

function repoRoot() {
  const overrideRoot = process.env.KVDF_REPO_ROOT;
  return overrideRoot ? path.resolve(overrideRoot) : REPO_ROOT;
}

function getStateFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_sharing.json");
}

function getDiscoveryLogFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_discovery.jsonl");
}

function getPairingLogFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_pairing.jsonl");
}

function getTransferLogFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_transfers.jsonl");
}

function getTransferPolicyResultsFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_transfer_policy_results.json");
}

function getQuarantineFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_quarantine.json");
}

function getOutboxFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_outbox.json");
}

function getTransferSessionsFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_transfer_sessions.json");
}

function getPackagesFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_packages.json");
}

function getInboxFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_inbox.json");
}

function getAppliedFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_applied.json");
}

function getApplyEventsFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_apply_events.jsonl");
}

function getReleaseReportFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_release_report.json");
}

function getIntegrityFile() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_integrity.json");
}

function getBackupsDir() {
  return path.join(repoRoot(), ".kabeeri", "wifi_data_backups");
}

function getTemplateFile() {
  return TEMPLATE_FILE;
}

function ensureWorkspace() {
  fs.mkdirSync(path.dirname(getStateFile()), { recursive: true });
}

function readTemplate() {
  return JSON.parse(fs.readFileSync(getTemplateFile(), "utf8"));
}

function cloneTemplate() {
  return JSON.parse(JSON.stringify(readTemplate()));
}

function defaultWifiDataSharingState() {
  return cloneTemplate();
}

function readWifiDataSharingState() {
  const stateFile = getStateFile();
  if (!fs.existsSync(stateFile)) {
    return defaultWifiDataSharingState();
  }
  return JSON.parse(fs.readFileSync(stateFile, "utf8"));
}

function ensureWifiDataSharingState() {
  ensureWorkspace();
  const stateFile = getStateFile();
  if (!fs.existsSync(stateFile)) {
    writeWifiDataSharingState(defaultWifiDataSharingState());
  }
  return readWifiDataSharingState();
}

function writeWifiDataSharingState(state) {
  ensureWorkspace();
  const stateFile = getStateFile();
  const next = {
    ...defaultWifiDataSharingState(),
    ...state,
    local_node: {
      ...defaultWifiDataSharingState().local_node,
      ...(state && state.local_node ? state.local_node : {})
    },
    discovery: {
      ...defaultWifiDataSharingState().discovery,
      ...(state && state.discovery ? state.discovery : {}),
      known_candidates: Array.isArray(state && state.discovery ? state.discovery.known_candidates : null)
        ? state.discovery.known_candidates
        : [],
      bootstrap_peers: Array.isArray(state && state.discovery ? state.discovery.bootstrap_peers : null)
        ? state.discovery.bootstrap_peers
        : []
    },
    pairing_sessions: Array.isArray(state && state.pairing_sessions) ? state.pairing_sessions : [],
    policies: {
      ...defaultWifiDataSharingState().policies,
      ...(state && state.policies ? state.policies : {})
    },
    trusted_nodes: Array.isArray(state && state.trusted_nodes) ? state.trusted_nodes : [],
    transfers: Array.isArray(state && state.transfers) ? state.transfers : []
  };
  fs.writeFileSync(stateFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

function normalizeTrustRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "owner" || value === "worker") return value;
  return "unknown";
}

function generateNodeId() {
  return `wifi-node-${crypto.randomBytes(6).toString("hex")}`;
}

function initWifiDataSharingState({ name, role } = {}) {
  const state = ensureWifiDataSharingState();
  const now = new Date().toISOString();
  const displayName = String(name || state.local_node.display_name || os.hostname()).trim() || os.hostname();
  state.created_at = state.created_at || now;
  state.updated_at = now;
  state.local_node.node_id = state.local_node.node_id || generateNodeId();
  state.local_node.display_name = displayName;
  state.local_node.hostname = os.hostname();
  state.local_node.platform = process.platform;
  state.local_node.kvdf_version = kvdfVersion;
  state.local_node.trust_role = normalizeTrustRole(role);
  state.local_node.status = "initialized";
  state.discovery.enabled = false;
  state.discovery.mode = "disabled";
  state.discovery.known_candidates = Array.isArray(state.discovery.known_candidates) ? state.discovery.known_candidates : [];
  state.discovery.bootstrap_peers = Array.isArray(state.discovery.bootstrap_peers) ? state.discovery.bootstrap_peers : [];
  writeWifiDataSharingState(state);
  return state;
}

function resetWifiDataSharingState({ confirm = false } = {}) {
  if (!confirm) {
    throw new Error("Reset requires --confirm.");
  }
  const state = defaultWifiDataSharingState();
  writeWifiDataSharingState(state);
  return state;
}

function appendWifiDataDiscoveryEvent(event) {
  ensureWorkspace();
  fs.appendFileSync(getDiscoveryLogFile(), `${JSON.stringify(event)}\n`, "utf8");
}

function appendWifiDataPairingEvent(event) {
  ensureWorkspace();
  fs.appendFileSync(getPairingLogFile(), `${JSON.stringify(event)}\n`, "utf8");
}

function appendWifiDataTransferEvent(event) {
  ensureWorkspace();
  fs.appendFileSync(getTransferLogFile(), `${JSON.stringify(event)}\n`, "utf8");
}

function appendWifiDataApplyEvent(event) {
  ensureWorkspace();
  fs.appendFileSync(getApplyEventsFile(), `${JSON.stringify(event)}\n`, "utf8");
}

function readJsonFile(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJsonFile(file, value) {
  ensureWorkspace();
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return value;
}

function defaultWifiDataPackagesState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    packages: []
  };
}

function defaultWifiDataInboxState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    inbox: []
  };
}

function defaultWifiTransferPolicyResultsState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    policy_results: []
  };
}

function defaultWifiDataQuarantineState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    quarantine: []
  };
}

function defaultWifiDataOutboxState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    outbox: []
  };
}

function defaultWifiTransferSessionsState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    transfer_sessions: []
  };
}

function defaultWifiDataAppliedState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    applied: []
  };
}

function defaultWifiDataReleaseReportState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    report: null
  };
}

function defaultWifiDataIntegrityState() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    created_at: null,
    updated_at: null,
    report: null
  };
}

function readWifiDataPackagesState() {
  return readJsonFile(getPackagesFile(), defaultWifiDataPackagesState());
}

function writeWifiDataPackagesState(state) {
  return writeJsonFile(getPackagesFile(), {
    ...defaultWifiDataPackagesState(),
    ...(state || {}),
    packages: Array.isArray(state && state.packages) ? state.packages : []
  });
}

function readWifiDataInboxState() {
  return readJsonFile(getInboxFile(), defaultWifiDataInboxState());
}

function writeWifiDataInboxState(state) {
  return writeJsonFile(getInboxFile(), {
    ...defaultWifiDataInboxState(),
    ...(state || {}),
    inbox: Array.isArray(state && state.inbox) ? state.inbox : []
  });
}

function readWifiTransferPolicyResultsState() {
  return readJsonFile(getTransferPolicyResultsFile(), defaultWifiTransferPolicyResultsState());
}

function writeWifiTransferPolicyResultsState(state) {
  return writeJsonFile(getTransferPolicyResultsFile(), {
    ...defaultWifiTransferPolicyResultsState(),
    ...(state || {}),
    policy_results: Array.isArray(state && state.policy_results) ? state.policy_results : []
  });
}

function appendWifiTransferPolicyResult(record) {
  const current = readWifiTransferPolicyResultsState();
  const policy_results = Array.isArray(current.policy_results) ? current.policy_results.slice() : [];
  const index = policy_results.findIndex((item) => item.policy_result_id === record.policy_result_id);
  if (index >= 0) policy_results[index] = { ...policy_results[index], ...record };
  else policy_results.push(record);
  writeWifiTransferPolicyResultsState({
    ...current,
    created_at: current.created_at || record.generated_at || new Date().toISOString(),
    updated_at: record.generated_at || new Date().toISOString(),
    policy_results
  });
  return record;
}

function readWifiDataQuarantineState() {
  return readJsonFile(getQuarantineFile(), defaultWifiDataQuarantineState());
}

function writeWifiDataQuarantineState(state) {
  return writeJsonFile(getQuarantineFile(), {
    ...defaultWifiDataQuarantineState(),
    ...(state || {}),
    quarantine: Array.isArray(state && state.quarantine) ? state.quarantine : []
  });
}

function upsertWifiDataQuarantineRecord(record) {
  const current = readWifiDataQuarantineState();
  const quarantine = Array.isArray(current.quarantine) ? current.quarantine.slice() : [];
  const index = quarantine.findIndex((item) => item.package_id === record.package_id);
  if (index >= 0) quarantine[index] = { ...quarantine[index], ...record };
  else quarantine.push(record);
  writeWifiDataQuarantineState({
    ...current,
    created_at: current.created_at || record.quarantined_at || record.updated_at || new Date().toISOString(),
    updated_at: record.updated_at || record.quarantined_at || new Date().toISOString(),
    quarantine
  });
  return record;
}

function findWifiDataQuarantineRecord(packageId) {
  if (!packageId) return null;
  const state = readWifiDataQuarantineState();
  return (Array.isArray(state.quarantine) ? state.quarantine : []).find((item) => item.package_id === packageId) || null;
}

function readWifiDataOutboxState() {
  return readJsonFile(getOutboxFile(), defaultWifiDataOutboxState());
}

function writeWifiDataOutboxState(state) {
  return writeJsonFile(getOutboxFile(), {
    ...defaultWifiDataOutboxState(),
    ...(state || {}),
    outbox: Array.isArray(state && state.outbox) ? state.outbox : []
  });
}

function upsertWifiDataOutboxRecord(record) {
  const current = readWifiDataOutboxState();
  const outbox = Array.isArray(current.outbox) ? current.outbox.slice() : [];
  const index = outbox.findIndex((item) => item.package_id === record.package_id || item.outbox_id === record.outbox_id);
  if (index >= 0) outbox[index] = { ...outbox[index], ...record };
  else outbox.push(record);
  writeWifiDataOutboxState({
    ...current,
    created_at: current.created_at || record.created_at || record.updated_at || new Date().toISOString(),
    updated_at: record.updated_at || record.created_at || new Date().toISOString(),
    outbox
  });
  return record;
}

function findWifiDataOutboxRecord(packageId) {
  if (!packageId) return null;
  const state = readWifiDataOutboxState();
  return (Array.isArray(state.outbox) ? state.outbox : []).find((item) => item.package_id === packageId || item.outbox_id === packageId) || null;
}

function readWifiTransferSessionsState() {
  return readJsonFile(getTransferSessionsFile(), defaultWifiTransferSessionsState());
}

function writeWifiTransferSessionsState(state) {
  return writeJsonFile(getTransferSessionsFile(), {
    ...defaultWifiTransferSessionsState(),
    ...(state || {}),
    transfer_sessions: Array.isArray(state && state.transfer_sessions) ? state.transfer_sessions : []
  });
}

function upsertWifiTransferSessionRecord(record) {
  const current = readWifiTransferSessionsState();
  const transfer_sessions = Array.isArray(current.transfer_sessions) ? current.transfer_sessions.slice() : [];
  const index = transfer_sessions.findIndex((item) => item.session_id === record.session_id);
  if (index >= 0) transfer_sessions[index] = { ...transfer_sessions[index], ...record };
  else transfer_sessions.push(record);
  writeWifiTransferSessionsState({
    ...current,
    created_at: current.created_at || record.created_at || record.started_at || new Date().toISOString(),
    updated_at: record.updated_at || record.created_at || new Date().toISOString(),
    transfer_sessions
  });
  return record;
}

function findWifiTransferSessionRecord(sessionId) {
  if (!sessionId) return null;
  const state = readWifiTransferSessionsState();
  return (Array.isArray(state.transfer_sessions) ? state.transfer_sessions : []).find((item) => item.session_id === sessionId) || null;
}

function readWifiDataAppliedState() {
  return readJsonFile(getAppliedFile(), defaultWifiDataAppliedState());
}

function writeWifiDataAppliedState(state) {
  return writeJsonFile(getAppliedFile(), {
    ...defaultWifiDataAppliedState(),
    ...(state || {}),
    applied: Array.isArray(state && state.applied) ? state.applied : []
  });
}

function upsertWifiDataAppliedRecord(record) {
  const current = readWifiDataAppliedState();
  const applied = Array.isArray(current.applied) ? current.applied.slice() : [];
  const index = applied.findIndex((item) => item.apply_id === record.apply_id || item.package_id === record.package_id);
  if (index >= 0) applied[index] = { ...applied[index], ...record };
  else applied.push(record);
  writeWifiDataAppliedState({
    ...current,
    created_at: current.created_at || record.created_at || new Date().toISOString(),
    updated_at: record.updated_at || record.created_at || new Date().toISOString(),
    applied
  });
  return record;
}

function findWifiDataAppliedRecord(packageId) {
  if (!packageId) return null;
  const state = readWifiDataAppliedState();
  return (Array.isArray(state.applied) ? state.applied : []).find((item) => (
    item.package_id === packageId
    || item.packet_id === packageId
    || item.apply_id === packageId
  )) || null;
}

function writeWifiDataReleaseReport(report) {
  return writeJsonFile(getReleaseReportFile(), {
    ...defaultWifiDataReleaseReportState(),
    version: report && report.version ? report.version : "v1",
    plugin_id: "wifi_data_sharing",
    created_at: report && report.created_at ? report.created_at : new Date().toISOString(),
    updated_at: report && report.updated_at ? report.updated_at : new Date().toISOString(),
    report: report || null
  });
}

function readWifiDataReleaseReport() {
  return readJsonFile(getReleaseReportFile(), defaultWifiDataReleaseReportState());
}

function writeWifiDataIntegrityReport(report) {
  return writeJsonFile(getIntegrityFile(), {
    ...defaultWifiDataIntegrityState(),
    version: report && report.version ? report.version : "v1",
    plugin_id: "wifi_data_sharing",
    created_at: report && report.created_at ? report.created_at : new Date().toISOString(),
    updated_at: report && report.updated_at ? report.updated_at : new Date().toISOString(),
    report: report || null
  });
}

function readWifiDataIntegrityReport() {
  return readJsonFile(getIntegrityFile(), defaultWifiDataIntegrityState());
}

function listWifiDataBackups() {
  const dir = getBackupsDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const backupDir = path.join(dir, entry.name);
      const manifestFile = path.join(backupDir, "manifest.json");
      let manifest = null;
      if (fs.existsSync(manifestFile)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
        } catch (error) {
          manifest = { backup_id: entry.name, status: "corrupt", error: error.message };
        }
      }
      return {
        backup_id: entry.name,
        path: backupDir,
        manifest
      };
    })
    .sort((left, right) => String(right.backup_id).localeCompare(String(left.backup_id)));
}

function mergeKnownCandidate(state, candidate) {
  state.discovery = state.discovery || defaultWifiDataSharingState().discovery;
  const current = Array.isArray(state.discovery.known_candidates) ? state.discovery.known_candidates : [];
  const index = current.findIndex((item) => item.node_id === candidate.node_id);
  if (index >= 0) {
    current[index] = {
      ...current[index],
      ...candidate,
      first_seen_at: current[index].first_seen_at || candidate.first_seen_at
    };
  } else {
    current.push(candidate);
  }
  state.discovery.known_candidates = current;
  state.discovery.enabled = true;
  state.discovery.last_scan_at = candidate.last_seen_at || new Date().toISOString();
  return state;
}

function buildWifiDataSharingStatusReport(state = ensureWifiDataSharingState()) {
  const initialized = Boolean(state && state.local_node && state.local_node.node_id);
  return {
    report_type: "wifi_data_sharing_status",
    plugin_id: "wifi_data_sharing",
    status: initialized ? "ready" : "uninitialized",
    state_file: ".kabeeri/wifi_data_sharing.json",
    discovery_log_file: ".kabeeri/wifi_data_discovery.jsonl",
    packages_file: ".kabeeri/wifi_data_packages.json",
    inbox_file: ".kabeeri/wifi_data_inbox.json",
    outbox_file: ".kabeeri/wifi_data_outbox.json",
    transfer_sessions_file: ".kabeeri/wifi_transfer_sessions.json",
    transfers_file: ".kabeeri/wifi_data_transfers.jsonl",
    local_node: state.local_node,
    discovery: state.discovery,
    pairing_sessions: Array.isArray(state.pairing_sessions) ? state.pairing_sessions : [],
    transfer_server: state.transfer_server || defaultWifiDataSharingState().transfer_server,
    policies: state.policies,
    next_action: initialized
      ? "Local Wi-Fi data sharing state is ready. Use discover, pairing, trust, package/inbox, outbox, or transfer-session commands when LAN sharing is available."
      : "Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` to initialize the local node."
  };
}

function buildWifiDataSharingPolicyReport(state = ensureWifiDataSharingState()) {
  const policies = state.policies || defaultWifiDataSharingState().policies;
  return {
    report_type: "wifi_data_sharing_policy",
    plugin_id: "wifi_data_sharing",
    status: "pass",
    security_posture: [
      "No external dependencies are used by this plugin.",
      "Network is disabled by default in the local state.",
      "Pairing is required before trust and package transfer.",
      "Received data is quarantined and never auto-applied."
    ],
    policies,
    allowed_surfaces: [
      "node identity",
      "local state",
      "candidate discovery metadata",
      "pairing metadata",
      "trusted nodes",
      "package catalogs",
      "inbox quarantine"
    ],
    blocked_surfaces: [
      "project data transfer to untrusted nodes",
      "automatic trust promotion",
      "unverified pairing",
      "governance replacement",
      "multi_ai_governance mutation"
    ]
  };
}

function buildWifiDataSharingCandidatesReport(state = ensureWifiDataSharingState()) {
  return {
    report_type: "wifi_data_sharing_candidates",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    candidates: Array.isArray(state.discovery && state.discovery.known_candidates) ? state.discovery.known_candidates : [],
    bootstrap_peers: Array.isArray(state.discovery && state.discovery.bootstrap_peers) ? state.discovery.bootstrap_peers : [],
    discovery_enabled: Boolean(state.discovery && state.discovery.enabled)
  };
}

function listBootstrapPeers(state = ensureWifiDataSharingState()) {
  return Array.isArray(state.discovery && state.discovery.bootstrap_peers) ? state.discovery.bootstrap_peers.slice() : [];
}

function normalizeBootstrapPeer(input = {}) {
  const host = String(input.host || "").trim();
  const port = Number(input.port || input.discovery_port || DEFAULT_DISCOVERY_PORT);
  const nodeId = String(input.node_id || "").trim();
  const peerId = String(input.peer_id || "").trim();
  if (!host && !nodeId) return null;
  const resolvedPort = Number.isFinite(port) && port > 0 ? Math.floor(port) : DEFAULT_DISCOVERY_PORT;
  return {
    peer_id: peerId || (nodeId ? `node:${nodeId}` : `host:${host}:${resolvedPort}`),
    node_id: nodeId || null,
    host,
    port: resolvedPort,
    display_name: String(input.display_name || input.name || "").trim() || null,
    trust_role: String(input.trust_role || input.role || "worker").trim().toLowerCase() || "worker",
    transport: "udp",
    enabled: input.enabled === false ? false : true,
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString()
  };
}

function upsertBootstrapPeer(state, peer = {}) {
  const current = listBootstrapPeers(state);
  const normalized = normalizeBootstrapPeer(peer);
  if (!normalized) {
    return {
      peer: null,
      peers: current
    };
  }
  const index = current.findIndex((item) => item.peer_id === normalized.peer_id);
  const now = new Date().toISOString();
  if (index >= 0) {
    current[index] = {
      ...current[index],
      ...normalized,
      updated_at: now
    };
  } else {
    current.push(normalized);
  }
  const nextState = {
    ...state,
    discovery: {
      ...(state && state.discovery ? state.discovery : {}),
      bootstrap_peers: current,
      enabled: true
    },
    updated_at: now
  };
  writeWifiDataSharingState(nextState);
  return {
    peer: normalized,
    peers: current
  };
}

function removeBootstrapPeer(state, peerId) {
  const peers = listBootstrapPeers(state);
  const target = String(peerId || "").trim();
  if (!target) {
    return {
      peer: null,
      peers
    };
  }
  const normalizedPeers = peers.filter((item) => item.peer_id !== target && item.node_id !== target && item.host !== target);
  if (normalizedPeers.length === peers.length) {
    return {
      peer: null,
      peers
    };
  }
  const removed = peers.find((item) => item.peer_id === target || item.node_id === target || item.host === target) || null;
  const now = new Date().toISOString();
  writeWifiDataSharingState({
    ...state,
    discovery: {
      ...(state && state.discovery ? state.discovery : {}),
      bootstrap_peers: normalizedPeers
    },
    updated_at: now
  });
  return {
    peer: removed,
    peers: normalizedPeers
  };
}

function clearBootstrapPeers(state) {
  const now = new Date().toISOString();
  writeWifiDataSharingState({
    ...state,
    discovery: {
      ...(state && state.discovery ? state.discovery : {}),
      bootstrap_peers: []
    },
    updated_at: now
  });
  return {
    peer: null,
    peers: []
  };
}

module.exports = {
  STATE_FILE,
  DISCOVERY_LOG_FILE,
  PAIRING_LOG_FILE,
  repoRoot,
  getStateFile,
  getDiscoveryLogFile,
  getPairingLogFile,
  ensureWorkspace,
  readTemplate,
  defaultWifiDataSharingState,
  readWifiDataSharingState,
  ensureWifiDataSharingState,
  writeWifiDataSharingState,
  initWifiDataSharingState,
  resetWifiDataSharingState,
  buildWifiDataSharingStatusReport,
  buildWifiDataSharingPolicyReport,
  buildWifiDataSharingCandidatesReport,
  appendWifiDataDiscoveryEvent,
  appendWifiDataPairingEvent,
  appendWifiDataTransferEvent,
  appendWifiDataApplyEvent,
  appendWifiTransferPolicyResult,
  readWifiDataPackagesState,
  writeWifiDataPackagesState,
  readWifiDataInboxState,
  writeWifiDataInboxState,
  readWifiDataOutboxState,
  writeWifiDataOutboxState,
  upsertWifiDataOutboxRecord,
  findWifiDataOutboxRecord,
  readWifiTransferSessionsState,
  writeWifiTransferSessionsState,
  upsertWifiTransferSessionRecord,
  findWifiTransferSessionRecord,
  readWifiDataAppliedState,
  writeWifiDataAppliedState,
  upsertWifiDataAppliedRecord,
  findWifiDataAppliedRecord,
  readWifiDataReleaseReport,
  writeWifiDataReleaseReport,
  readWifiDataIntegrityReport,
  writeWifiDataIntegrityReport,
  listWifiDataBackups,
  readWifiTransferPolicyResultsState,
  writeWifiTransferPolicyResultsState,
  readWifiDataQuarantineState,
  writeWifiDataQuarantineState,
  upsertWifiDataQuarantineRecord,
  findWifiDataQuarantineRecord,
  defaultWifiDataPackagesState,
  defaultWifiDataInboxState,
  defaultWifiDataOutboxState,
  defaultWifiTransferSessionsState,
  defaultWifiTransferPolicyResultsState,
  defaultWifiDataQuarantineState,
  getTransferLogFile,
  getTransferPolicyResultsFile,
  getQuarantineFile,
  getOutboxFile,
  getTransferSessionsFile,
  getPackagesFile,
  getInboxFile,
  getAppliedFile,
  getApplyEventsFile,
  getReleaseReportFile,
  getIntegrityFile,
  getBackupsDir,
  mergeKnownCandidate,
  normalizeTrustRole,
  generateNodeId,
  listBootstrapPeers,
  normalizeBootstrapPeer,
  upsertBootstrapPeer,
  removeBootstrapPeer,
  clearBootstrapPeers
};
