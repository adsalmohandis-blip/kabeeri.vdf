const {
  ensureWifiDataSharingState,
  readWifiDataSharingState,
  writeWifiDataSharingState,
  appendWifiDataPairingEvent,
  mergeKnownCandidate
} = require("./state");
const { buildPairingSessionFromState, isExpired } = require("./pairing");

function trustedNodes(action, value, flags = {}, rest = []) {
  const normalized = normalizeTrustedAction(action, value);
  if (normalized === "trusted") {
    return buildTrustedNodesReport(ensureWifiDataSharingState());
  }
  if (normalized === "trust") {
    return trustNode({
      nodeId: flags.node || flags.node_id || value || rest[0] || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (normalized === "revoke") {
    return revokeNode({
      nodeId: flags.node || flags.node_id || value || rest[0] || null,
      reason: flags.reason || rest[1] || null
    });
  }
  if (normalized === "node") {
    const subAction = String(value || "").trim().toLowerCase();
    if (subAction === "show") {
      return buildTrustedNodeReport(ensureWifiDataSharingState(), rest[0] || flags.node || null);
    }
  }
  return buildUnavailableTrustedNodesReport(action);
}

function trustNode({ nodeId, confirm = false }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!confirm) {
    return {
      report_type: "wifi_data_sharing_trust",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "Trust requires --confirm after pairing verification."
    };
  }
  const session = findVerifiedPairingSession(state, nodeId);
  if (!session) {
    return {
      report_type: "wifi_data_sharing_trust",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "Verify a pairing session first, then trust the node."
    };
  }
  const now = new Date().toISOString();
  const existing = findTrustedNodeRecord(state, nodeId);
  if (existing && existing.trust_status === "revoked" && existing.revoked_at && new Date(session.verified_at || session.created_at).getTime() <= new Date(existing.revoked_at).getTime()) {
    return {
      report_type: "wifi_data_sharing_trust",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "This node was revoked. Create and verify a new pairing session before trusting again."
    };
  }
  const nodeProfile = resolveNodeProfile(state, nodeId) || {};
  const trustedRecord = {
    node_id: nodeId,
    display_name: nodeProfile.display_name || null,
    hostname: nodeProfile.hostname || null,
    address: nodeProfile.address || null,
    platform: nodeProfile.platform || null,
    capabilities: Array.isArray(nodeProfile.capabilities) ? nodeProfile.capabilities.slice() : ["discovery"],
    trust_status: "trusted",
    trusted_at: now,
    revoked_at: null,
    revocation_reason: null,
    transfer_allowed: false,
    pairing_id: session.pairing_id,
    pairing_verified_at: session.verified_at || session.created_at
  };
  upsertTrustedNode(state, trustedRecord);
  appendWifiDataPairingEvent({
    event_type: "node_trusted",
    node_id: nodeId,
    pairing_id: session.pairing_id,
    trusted_at: now
  });
  return {
    report_type: "wifi_data_sharing_trust",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    node_id: nodeId,
    trust_status: "trusted",
    trusted_at: now,
    transfer_allowed: false,
    next_action: `Node ${nodeId} is trusted for local Wi-Fi data sharing. Transfer remains disabled until later phases.`
  };
}

function revokeNode({ nodeId, reason }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!reason) {
    return {
      report_type: "wifi_data_sharing_revoke",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "Revoke requires a reason."
    };
  }
  const existing = findTrustedNodeRecord(state, nodeId);
  if (!existing) {
    return {
      report_type: "wifi_data_sharing_revoke",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "Trusted node record not found."
    };
  }
  const now = new Date().toISOString();
  const revokedRecord = {
    ...existing,
    trust_status: "revoked",
    revoked_at: now,
    revocation_reason: reason,
    transfer_allowed: false
  };
  upsertTrustedNode(state, revokedRecord);
  appendWifiDataPairingEvent({
    event_type: "node_revoked",
    node_id: nodeId,
    revoked_at: now,
    reason
  });
  return {
    report_type: "wifi_data_sharing_revoke",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    node_id: nodeId,
    trust_status: "revoked",
    revoked_at: now,
    reason,
    next_action: "The node is revoked and cannot receive data until a new pairing session is verified."
  };
}

function buildTrustedNodesReport(state = readWifiDataSharingState()) {
  const trusted_nodes = Array.isArray(state.trusted_nodes) ? state.trusted_nodes : [];
  return {
    report_type: "wifi_data_sharing_trusted_nodes",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    trusted_nodes,
    counts: {
      total: trusted_nodes.length,
      trusted: trusted_nodes.filter((item) => item.trust_status === "trusted").length,
      revoked: trusted_nodes.filter((item) => item.trust_status === "revoked").length
    }
  };
}

function buildTrustedNodeReport(state = readWifiDataSharingState(), nodeId) {
  const node = findTrustedNodeRecord(state, nodeId) || resolveNodeProfile(state, nodeId);
  if (!node) {
    return {
      report_type: "wifi_data_sharing_node",
      plugin_id: "wifi_data_sharing",
      status: "blocked",
      node_id: nodeId || null,
      next_action: "No trusted, paired, or discovered node matches that id."
    };
  }
  const pairing = buildPairingSessionFromState(state, nodeId);
  return {
    report_type: "wifi_data_sharing_node",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    node,
    pairing_session: pairing,
    trust_status: node.trust_status || "candidate"
  };
}

function findTrustedNodeRecord(state, nodeId) {
  const trusted = Array.isArray(state.trusted_nodes) ? state.trusted_nodes : [];
  return trusted.find((item) => item.node_id === nodeId) || null;
}

function resolveNodeProfile(state, nodeId) {
  if (!nodeId) return null;
  const discovery = Array.isArray(state.discovery && state.discovery.known_candidates) ? state.discovery.known_candidates : [];
  const trusted = Array.isArray(state.trusted_nodes) ? state.trusted_nodes : [];
  return trusted.find((item) => item.node_id === nodeId)
    || discovery.find((item) => item.node_id === nodeId)
    || null;
}

function upsertTrustedNode(state, record) {
  const trusted = Array.isArray(state.trusted_nodes) ? state.trusted_nodes.slice() : [];
  const index = trusted.findIndex((item) => item.node_id === record.node_id);
  if (index >= 0) trusted[index] = record;
  else trusted.push(record);
  const nextState = {
    ...state,
    trusted_nodes: trusted,
    updated_at: new Date().toISOString()
  };
  writeWifiDataSharingState(nextState);
  return nextState;
}

function findVerifiedPairingSession(state, nodeId) {
  const sessions = Array.isArray(state.pairing_sessions) ? state.pairing_sessions : [];
  const now = Date.now();
  return sessions
    .filter((session) => session.candidate_node_id === nodeId && session.status === "verified")
    .sort((a, b) => new Date(b.verified_at || b.created_at).getTime() - new Date(a.verified_at || a.created_at).getTime())
    .find((session) => !isExpired(session, now));
}

function buildUnavailableTrustedNodesReport(action) {
  return {
    report_type: "wifi_data_sharing_trusted_nodes",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    requested_action: action || null,
    next_action: "Use `kvdf wifi-data-sharing trusted` after initialization."
  };
}

function normalizeTrustedAction(action, value) {
  const actionValue = String(action || "").trim().toLowerCase();
  const valueValue = String(value || "").trim().toLowerCase();
  if (actionValue === "node") return "node";
  return actionValue || valueValue;
}

function assertInitialized(state) {
  if (!state || !state.local_node || !state.local_node.node_id) {
    throw new Error("Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.");
  }
}

module.exports = {
  trustedNodes,
  trustNode,
  revokeNode,
  buildTrustedNodesReport,
  buildTrustedNodeReport,
  findTrustedNodeRecord,
  resolveNodeProfile,
  upsertTrustedNode,
  findVerifiedPairingSession,
  buildUnavailableTrustedNodesReport
};
