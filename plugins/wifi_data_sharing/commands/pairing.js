const crypto = require("crypto");
const {
  ensureWifiDataSharingState,
  readWifiDataSharingState,
  writeWifiDataSharingState,
  appendWifiDataPairingEvent
} = require("./state");

const PAIRING_TTL_MS = 10 * 60 * 1000;

function createPairing(action, value, flags = {}, rest = []) {
  const normalized = normalizePairingAction(action, value);
  if (normalized !== "create") {
    return buildUnavailablePairingReport(action);
  }
  return createPairingSession({
    nodeId: flags.node || flags.node_id || flags.candidate || value || rest[0] || null
  });
}

function verifyPairing(action, value, flags = {}, rest = []) {
  const normalized = normalizePairingAction(action, value);
  if (normalized !== "verify") {
    return buildUnavailablePairingReport(action);
  }
  return verifyPairingCode({
    nodeId: flags.node || flags.node_id || value || rest[0] || null,
    code: flags.code || rest[1] || null
  });
}

function createPairingSession({ nodeId }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  const candidate = findDiscoverableNode(state, nodeId);
  if (!candidate) {
    return {
      report_type: "wifi_data_sharing_pairing",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "Discover the node first, then run `kvdf wifi-data-sharing pairing create --node <candidate-node-id>`."
    };
  }
  const now = new Date().toISOString();
  const pairingId = buildPairingId(state);
  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS).toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const pairingCodeHash = hashPairingCode({ pairingId, nodeId: candidate.node_id, code, salt, expiresAt });
  const session = {
    pairing_id: pairingId,
    candidate_node_id: candidate.node_id,
    pairing_code_hash: pairingCodeHash,
    pairing_code_salt: salt,
    status: "pending",
    created_at: now,
    expires_at: expiresAt,
    verified_at: null,
    pairing_verified: false,
    candidate_snapshot: snapshotCandidate(candidate)
  };
  const nextState = {
    ...state,
    pairing_sessions: [...(Array.isArray(state.pairing_sessions) ? state.pairing_sessions : []), session],
    updated_at: now
  };
  writeWifiDataSharingState(nextState);
  appendWifiDataPairingEvent({
    event_type: "pairing_created",
    pairing_id: pairingId,
    candidate_node_id: candidate.node_id,
    created_at: now,
    expires_at: expiresAt
  });
  return {
    report_type: "wifi_data_sharing_pairing",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    pairing_id: pairingId,
    candidate_node_id: candidate.node_id,
    pairing_code: formatPairingCode(code),
    expires_at: expiresAt,
    pairing_verified: false,
    next_action: `Run \`kvdf wifi-data-sharing pairing verify --node ${candidate.node_id} --code <code>\` before trust.`
  };
}

function verifyPairingCode({ nodeId, code }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  const now = new Date().toISOString();
  const session = findLatestPendingSession(state, nodeId);
  if (!session) {
    return buildBlockedPairingReport("No pending pairing session found for that node.", nodeId);
  }
  if (isExpired(session, now)) {
    const expiredSession = { ...session, status: "expired" };
    updatePairingSession(state, expiredSession);
    appendWifiDataPairingEvent({
      event_type: "pairing_expired",
      pairing_id: session.pairing_id,
      candidate_node_id: session.candidate_node_id,
      expired_at: now
    });
    return {
      report_type: "wifi_data_sharing_pairing",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      pairing_id: session.pairing_id,
      candidate_node_id: session.candidate_node_id,
      next_action: "The pairing code expired. Create a new pairing session."
    };
  }
  if (!code || !matchesPairingCode(session, code)) {
    return buildBlockedPairingReport("The pairing code did not match.", nodeId, session.pairing_id);
  }
  const verifiedSession = {
    ...session,
    status: "verified",
    verified_at: now,
    pairing_verified: true
  };
  updatePairingSession(state, verifiedSession);
  appendWifiDataPairingEvent({
    event_type: "pairing_verified",
    pairing_id: session.pairing_id,
    candidate_node_id: session.candidate_node_id,
    verified_at: now
  });
  return {
    report_type: "wifi_data_sharing_pairing",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    pairing_id: session.pairing_id,
    candidate_node_id: session.candidate_node_id,
    pairing_verified: true,
    verified_at: now,
    next_action: `Run \`kvdf wifi-data-sharing trust --node ${session.candidate_node_id} --confirm\` to mark the node trusted.`
  };
}

function updatePairingSession(state, session) {
  const sessions = Array.isArray(state.pairing_sessions) ? state.pairing_sessions.slice() : [];
  const index = sessions.findIndex((item) => item.pairing_id === session.pairing_id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  writeWifiDataSharingState({
    ...state,
    pairing_sessions: sessions,
    updated_at: new Date().toISOString()
  });
}

function buildPairingReport(state = readWifiDataSharingState()) {
  const sessions = Array.isArray(state.pairing_sessions) ? state.pairing_sessions : [];
  return {
    report_type: "wifi_data_sharing_pairing_report",
    plugin_id: "wifi_data_sharing",
    status: sessions.length ? "ok" : "empty",
    pairing_sessions: sessions,
    active_sessions: sessions.filter((session) => session.status === "pending").length,
    verified_sessions: sessions.filter((session) => session.status === "verified").length,
    expired_sessions: sessions.filter((session) => session.status === "expired").length
  };
}

function buildPairingId(state) {
  const sessions = Array.isArray(state && state.pairing_sessions) ? state.pairing_sessions : [];
  const nextIndex = sessions.length + 1;
  return `wifi-pairing-${String(nextIndex).padStart(3, "0")}`;
}

function buildUnavailablePairingReport(action) {
  return {
    report_type: "wifi_data_sharing_pairing",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    requested_action: action || null,
    next_action: "Use `kvdf wifi-data-sharing pairing create --node <candidate-node-id>` or `pairing verify` after initialization."
  };
}

function buildBlockedPairingReport(message, nodeId, pairingId = null) {
  return {
    report_type: "wifi_data_sharing_pairing",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    node_id: nodeId || null,
    pairing_id: pairingId,
    next_action: message
  };
}

function normalizePairingAction(action, value) {
  const actionValue = String(action || "").trim().toLowerCase();
  const valueValue = String(value || "").trim().toLowerCase();
  if (actionValue === "pairing") return valueValue || "status";
  return actionValue;
}

function assertInitialized(state) {
  if (!state || !state.local_node || !state.local_node.node_id) {
    throw new Error("Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.");
  }
}

function findDiscoverableNode(state, nodeId) {
  if (!nodeId) return null;
  const discovery = Array.isArray(state.discovery && state.discovery.known_candidates) ? state.discovery.known_candidates : [];
  const trusted = Array.isArray(state.trusted_nodes) ? state.trusted_nodes : [];
  return discovery.find((item) => item.node_id === nodeId) || trusted.find((item) => item.node_id === nodeId) || null;
}

function findLatestPendingSession(state, nodeId) {
  const sessions = Array.isArray(state.pairing_sessions) ? state.pairing_sessions : [];
  return sessions
    .filter((session) => session.candidate_node_id === nodeId && session.status === "pending")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    [0] || null;
}

function isExpired(session, now = Date.now()) {
  const currentTime = now instanceof Date
    ? now.getTime()
    : typeof now === "string"
      ? new Date(now).getTime()
      : Number(now);
  return Boolean(session && session.expires_at && new Date(session.expires_at).getTime() <= currentTime);
}

function generatePairingCode() {
  const digits = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function formatPairingCode(code) {
  return String(code || "").trim();
}

function hashPairingCode({ pairingId, nodeId, code, salt, expiresAt }) {
  return crypto.createHmac("sha256", salt)
    .update([pairingId, nodeId, normalizePairingCode(code), expiresAt].join(":"))
    .digest("hex");
}

function matchesPairingCode(session, code) {
  const expected = Buffer.from(session.pairing_code_hash, "hex");
  const actual = Buffer.from(hashPairingCode({
    pairingId: session.pairing_id,
    nodeId: session.candidate_node_id,
    code: normalizePairingCode(code),
    salt: session.pairing_code_salt,
    expiresAt: session.expires_at
  }), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function snapshotCandidate(candidate) {
  return {
    node_id: candidate.node_id || null,
    display_name: candidate.display_name || null,
    hostname: candidate.hostname || null,
    address: candidate.address || null,
    platform: candidate.platform || null,
    capabilities: Array.isArray(candidate.capabilities) ? candidate.capabilities.slice() : ["discovery"]
  };
}

function buildPairingSessionFromState(state, nodeId) {
  const sessions = Array.isArray(state.pairing_sessions) ? state.pairing_sessions : [];
  return sessions.find((session) => session.candidate_node_id === nodeId) || null;
}

function normalizePairingCode(code) {
  return String(code || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

module.exports = {
  PAIRING_TTL_MS,
  createPairing,
  verifyPairing,
  createPairingSession,
  verifyPairingCode,
  buildPairingId,
  buildPairingReport,
  buildUnavailablePairingReport,
  buildBlockedPairingReport,
  generatePairingCode,
  hashPairingCode,
  matchesPairingCode,
  buildPairingSessionFromState,
  findDiscoverableNode,
  findLatestPendingSession,
  isExpired,
  formatPairingCode,
  normalizePairingCode
};
