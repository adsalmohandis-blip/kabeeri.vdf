const {
  DEFAULT_DISCOVERY_PORT,
  buildDiscoveryMessage,
  discoverCandidates,
  advertisePresence,
  parseDiscoveryMessage
} = require("../transport/udp_discovery");
const {
  ensureWifiDataSharingState,
  buildWifiDataSharingCandidatesReport,
  mergeKnownCandidate,
  appendWifiDataDiscoveryEvent,
  writeWifiDataSharingState
} = require("./state");
const { ingestTransportPacket } = require("./transfer");
const { upsertTrustedNode, findTrustedNodeRecord } = require("./trusted_nodes");

function recordDiscovery(state, candidate, message, remote, mode) {
  const now = new Date().toISOString();
  const nextCandidate = {
    ...candidate,
    first_seen_at: candidate.first_seen_at || now,
    last_seen_at: now,
    trust_status: "candidate"
  };
  const nextState = mergeKnownCandidate(state, nextCandidate);
  nextState.updated_at = now;
  nextState.discovery.enabled = true;
  nextState.discovery.mode = mode;
  writeWifiDataSharingState(nextState);
  appendWifiDataDiscoveryEvent({
    event_type: mode,
    protocol: message.protocol,
    protocol_version: message.protocol_version,
    service_name: message.service_name,
    node_id: message.node_id,
    display_name: message.display_name || null,
    hostname: message.hostname || null,
    platform: message.platform || null,
    address: remote.address || null,
    port: Number(remote.port || message.port || DEFAULT_DISCOVERY_PORT),
    sent_at: message.sent_at || now,
    observed_at: now,
    trust_status: "candidate"
  });
  return nextState;
}

function recordInboundPacket(state, packet, remote, mode) {
  const now = new Date().toISOString();
  ingestTransportPacket(packet, remote, {
    localNodeId: state && state.local_node ? state.local_node.node_id || null : null
  });
  const packetType = String(packet.packet_type || packet.message_type || "").trim().toLowerCase();
  const senderNodeId = String(packet.source_node_id || packet.node_id || packet.sender_node_id || "").trim();
  if (senderNodeId && ["worker_join_request", "worker_heartbeat", "worker_result", "assignment_packet"].includes(packetType)) {
    const existing = findTrustedNodeRecord(state, senderNodeId) || {};
    upsertTrustedNode(state, {
      ...existing,
      node_id: senderNodeId,
      display_name: packet.display_name || existing.display_name || packet.hostname || existing.hostname || senderNodeId,
      hostname: packet.hostname || existing.hostname || null,
      address: remote.address || existing.address || null,
      port: Number(remote.port || packet.port || existing.port || DEFAULT_DISCOVERY_PORT),
      platform: packet.platform || existing.platform || null,
      trust_role: existing.trust_role || "worker",
      trust_status: "trusted",
      trusted_at: existing.trusted_at || now,
      paired_at: existing.paired_at || now,
      owner_approved: true,
      last_seen_at: now,
      capabilities: Array.isArray(packet.capabilities) ? packet.capabilities.slice() : Array.isArray(existing.capabilities) ? existing.capabilities.slice() : [],
      transfer_allowed: true
    });
  }
  appendWifiDataDiscoveryEvent({
    event_type: `${mode}_packet`,
    protocol: packet.protocol || null,
    protocol_version: packet.protocol_version || null,
    service_name: packet.service_name || null,
    packet_type: packet.packet_type || packet.message_type || null,
    package_id: packet.package_id || packet.packet_id || null,
    node_id: packet.source_node_id || packet.node_id || null,
    display_name: packet.display_name || null,
    hostname: packet.hostname || null,
    platform: packet.platform || null,
    address: remote.address || null,
    port: Number(remote.port || packet.port || DEFAULT_DISCOVERY_PORT),
    sent_at: packet.sent_at || now,
    observed_at: now,
    trust_status: "candidate"
  });
  return state;
}

async function runDiscoverCommand(flags = {}) {
  const state = ensureWifiDataSharingState();
  if (!state.local_node || !state.local_node.node_id) {
    return {
      report_type: "wifi_data_sharing_discovery",
      status: "blocked",
      next_action: "Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.",
      candidates: []
    };
  }
  const timeoutMs = Number(flags.timeout || flags["timeout-ms"] || 5000);
  const loopback = Boolean(flags.loopback);
  const report = await discoverCandidates({
    state,
    timeoutMs,
    loopback,
    onCandidate: (candidate, message, remote) => recordDiscovery(state, candidate, message, remote, "discover"),
    onPacket: (packet, remote) => recordInboundPacket(state, packet, remote, "discover")
  });
  const refreshed = ensureWifiDataSharingState();
  refreshed.discovery.enabled = true;
  refreshed.discovery.mode = "discover";
  refreshed.updated_at = new Date().toISOString();
  writeWifiDataSharingState(refreshed);
  const result = {
    report_type: "wifi_data_sharing_discovery",
    plugin_id: "wifi_data_sharing",
    status: report.warnings && report.warnings.length ? "warning" : "ok",
    mode: "discover",
    timeout_ms: timeoutMs,
    loopback,
    discovery_port: DEFAULT_DISCOVERY_PORT,
    candidates: refreshed.discovery.known_candidates || [],
    warnings: report.warnings || [],
    elapsed_ms: report.elapsed_ms || 0,
    discovery_enabled: Boolean(refreshed.discovery.enabled)
  };
  return result;
}

async function runAdvertiseCommand(flags = {}) {
  const state = ensureWifiDataSharingState();
  if (!state.local_node || !state.local_node.node_id) {
    return {
      report_type: "wifi_data_sharing_advertise",
      status: "blocked",
      next_action: "Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.",
      candidates: []
    };
  }
  const durationMs = Number(flags.duration || flags["duration-ms"] || 10000);
  const loopback = Boolean(flags.loopback);
  const report = await advertisePresence({
    state,
    durationMs,
    loopback,
    onCandidate: (candidate, message, remote) => recordDiscovery(state, candidate, message, remote, "advertise"),
    onPacket: (packet, remote) => recordInboundPacket(state, packet, remote, "advertise")
  });
  const refreshed = ensureWifiDataSharingState();
  refreshed.discovery.enabled = true;
  refreshed.discovery.mode = "advertise";
  refreshed.updated_at = new Date().toISOString();
  writeWifiDataSharingState(refreshed);
  return {
    report_type: "wifi_data_sharing_advertise",
    plugin_id: "wifi_data_sharing",
    status: report.warnings && report.warnings.length ? "warning" : "ok",
    mode: "advertise",
    duration_ms: durationMs,
    loopback,
    discovery_port: DEFAULT_DISCOVERY_PORT,
    candidates: refreshed.discovery.known_candidates || [],
    warnings: report.warnings || [],
    elapsed_ms: report.elapsed_ms || 0,
    discovery_enabled: Boolean(refreshed.discovery.enabled)
  };
}

function buildDiscoveryMessageForTests(state, message_type, options = {}) {
  return buildDiscoveryMessage({
    state,
    message_type,
    ...options
  });
}

function parseDiscoveryMessageForTests(input) {
  return parseDiscoveryMessage(input);
}

function buildWifiDataSharingCandidatesFromState() {
  return buildWifiDataSharingCandidatesReport(ensureWifiDataSharingState());
}

module.exports = {
  runDiscoverCommand,
  runAdvertiseCommand,
  buildDiscoveryMessageForTests,
  parseDiscoveryMessageForTests,
  buildWifiDataSharingCandidatesFromState,
  recordDiscovery,
  recordInboundPacket
};
