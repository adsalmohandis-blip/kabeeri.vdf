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
    onCandidate: (candidate, message, remote) => recordDiscovery(state, candidate, message, remote, "discover")
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
    onCandidate: (candidate, message, remote) => recordDiscovery(state, candidate, message, remote, "advertise")
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
  recordDiscovery
};
