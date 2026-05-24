const {
  ensureWifiDataSharingState,
  initWifiDataSharingState,
  resetWifiDataSharingState,
  readWifiDataSharingState,
  buildWifiDataSharingStatusReport: buildStatusReport,
  buildWifiDataSharingPolicyReport: buildPolicyReport,
  buildWifiDataSharingCandidatesReport: buildCandidatesReport
} = require("./state");
const { runDiscoverCommand, runAdvertiseCommand } = require("./discovery");
const { createPairing, verifyPairing, buildPairingReport } = require("./pairing");
const { trustedNodes, buildTrustedNodesReport, buildTrustedNodeReport, trustNode, revokeNode } = require("./trusted_nodes");
const { wifiDataTransfer, buildServerReport, buildPackagesReport, buildTransfersReport, buildTransferReport } = require("./transfer");
const { wifiDataInbox, buildInboxReport, buildInboxItemReport } = require("./inbox");
const { wifiDataSecurityGate, buildSecurityResultsReport } = require("./security_gate");
const { wifiDataQuarantine, buildQuarantineReport, buildQuarantineItemReport } = require("./quarantine");
const { wifiDataOutbox } = require("./outbox");
const { wifiDataTransferRetry } = require("./retry");
const { wifiDataSharingProvider, buildProviderReport } = require("./provider");
const { wifiDataSharingReadiness, buildReadinessReport } = require("./readiness");
const { wifiDataSharingDashboard, buildDashboardReport } = require("./dashboard");
const { wifiDataSharingAudit, buildAuditReport } = require("./audit");
const { wifiDataSharingEvidence, buildEvidenceReport } = require("./evidence");
const { wifiDataSharingSimulate, buildTwoNodeSimulationReport, buildTransferStressReport, buildSecuritySimulationReport } = require("./simulate");

function wifiDataSharing(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status") {
    const report = buildStatusReport(ensureWifiDataSharingState());
    outputReport(report, flags);
    return report;
  }
  if (normalized === "state") {
    const report = readWifiDataSharingState();
    outputReport(report, flags);
    return report;
  }
  if (normalized === "init") {
    const report = initWifiDataSharingState({
      name: flags.name || flags.display_name || value || rest[0] || null,
      role: flags.role || flags.trust_role || rest[1] || "unknown"
    });
    outputReport(buildStatusReport(report), flags);
    return report;
  }
  if (normalized === "reset") {
    const report = resetWifiDataSharingState({ confirm: Boolean(flags.confirm) });
    outputReport(buildStatusReport(report), flags);
    return report;
  }
  if (normalized === "policy") {
    const report = buildPolicyReport(ensureWifiDataSharingState());
    outputReport(report, flags);
    return report;
  }
  if (normalized === "discover") {
    return runDiscoverCommand(flags).then((report) => {
      outputReport(report, flags);
      return report;
    });
  }
  if (normalized === "advertise") {
    return runAdvertiseCommand(flags).then((report) => {
      outputReport(report, flags);
      return report;
    });
  }
  if (normalized === "candidates") {
    const report = buildCandidatesReport(ensureWifiDataSharingState());
    outputReport(report, flags);
    return report;
  }
  if (normalized === "provider") {
    const report = wifiDataSharingProvider(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "readiness") {
    const report = wifiDataSharingReadiness(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "dashboard") {
    const report = wifiDataSharingDashboard(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "audit") {
    const report = wifiDataSharingAudit(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "evidence") {
    const report = wifiDataSharingEvidence(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "simulate") {
    const report = wifiDataSharingSimulate(normalized, value, flags, rest);
    return report;
  }
  if (normalized === "server" || normalized === "package" || normalized === "send" || normalized === "transfers" || normalized === "transfer") {
    if (normalized === "transfer" && ["resume", "clean", "sessions"].includes(String(value || "").trim().toLowerCase())) {
      const report = wifiDataTransferRetry(normalized, value, flags, rest);
      outputReport(report, flags);
      return report;
    }
    const report = wifiDataTransfer(normalized, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "inbox") {
    const report = wifiDataInbox(normalized, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "security") {
    const report = wifiDataSecurityGate(normalized, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "quarantine") {
    const report = wifiDataQuarantine(normalized, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "outbox") {
    const report = wifiDataOutbox(normalized, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "pairing") {
    const report = routePairing(value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  if (normalized === "trusted" || normalized === "trust" || normalized === "revoke" || normalized === "node") {
    const report = routeTrusted(action, value, flags, rest);
    outputReport(report, flags);
    return report;
  }
  throw new Error(`Unknown wifi-data-sharing action: ${action}`);
}

function buildWifiDataSharingStatusReport(state) {
  return buildStatusReport(state);
}

function buildWifiDataSharingPolicyReport(state) {
  return buildPolicyReport(state);
}

function buildWifiDataSharingStateReport() {
  return readWifiDataSharingState();
}

function buildWifiDataSharingCandidatesReport(state) {
  return buildCandidatesReport(state);
}

function routePairing(value, flags, rest) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "create") {
    return createPairing("pairing", value, flags, rest);
  }
  if (normalized === "verify") {
    return verifyPairing("pairing", value, flags, rest);
  }
  return buildPairingReport(ensureWifiDataSharingState());
}

function routeTrusted(action, value, flags, rest) {
  const normalized = String(action || "").trim().toLowerCase();
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
  if (normalized === "node" && String(value || "").trim().toLowerCase() === "show") {
    return buildTrustedNodeReport(ensureWifiDataSharingState(), rest[0] || flags.node || null);
  }
  return trustedNodes(action, value, flags, rest);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (["wifi-data-sharing", "wifi_data_sharing", "wifidata", "wifi-share"].includes(value)) return "status";
  return value;
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_status") {
    console.log([
      "Wi-Fi Data Sharing",
      `Status: ${report.status}`,
      `Node: ${report.local_node && report.local_node.node_id ? report.local_node.node_id : "uninitialized"}`,
      `Discovery: ${report.discovery && report.discovery.enabled ? "enabled" : "disabled"}`,
      `Next: ${report.next_action}`
    ].join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_policy") {
    console.log([
      "Wi-Fi Data Sharing Policy",
      `Network default: ${report.policies.network_default}`,
      `Pairing required: ${report.policies.pairing_required}`,
      `Data transfer default: ${report.policies.data_transfer_default}`,
      `Max package bytes: ${report.policies.max_package_bytes}`,
      "",
      `Posture: ${report.security_posture.join(" | ")}`
    ].join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_candidates") {
    const candidates = Array.isArray(report.candidates) ? report.candidates : [];
    console.log(`Known candidates: ${candidates.length}`);
    for (const candidate of candidates) {
      console.log(`- ${candidate.display_name || candidate.node_id} @ ${candidate.address || "unknown"}:${candidate.port || ""}`);
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_provider") {
    console.log([
      "Wi-Fi Data Sharing Provider",
      `Status: ${report.status}`,
      `Node: ${report.local_node && report.local_node.node_id ? report.local_node.node_id : "uninitialized"}`,
      `Trusted: ${report.summary.trusted_nodes_count}`,
      `Candidates: ${report.summary.candidates_count}`,
      `Packages: ${report.summary.packages_count}`,
      `Outbox: ${report.summary.outbox_count}`,
      `Transfer sessions: ${report.summary.transfer_sessions_count}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_readiness") {
    console.log([
      "Wi-Fi Data Sharing Readiness",
      `Status: ${report.status}`,
      ...(report.checks || []).map((check) => `- ${check.check_id}: ${check.status}`),
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_dashboard") {
    console.log([
      "Wi-Fi Data Sharing Dashboard",
      `Status: ${report.status}`,
      `Local node: ${report.summary.local_node_initialized ? "initialized" : "uninitialized"}`,
      `Candidates: ${report.summary.candidates_count}`,
      `Trusted nodes: ${report.summary.trusted_nodes_count}`,
      `Packages: ${report.summary.packages_count}`,
      `Outbox: ${report.summary.outbox_count}`,
      `Inbox: ${report.summary.inbox_count}`,
      `Quarantine: ${report.summary.quarantine_count}`,
      `Transfers: ${report.summary.completed_transfers} completed, ${report.summary.failed_transfers} failed`,
      `Policy blockers: ${report.summary.policy_blockers}`,
      report.next_actions && report.next_actions.length ? `Next: ${report.next_actions[0]}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_audit") {
    console.log([
      "Wi-Fi Data Sharing Audit",
      `Status: ${report.status}`,
      `Local node: ${report.summary.local_node_initialized ? "initialized" : "uninitialized"}`,
      `Packages: ${report.summary.packages_count}`,
      `Inbox: ${report.summary.inbox_count}`,
      `Outbox: ${report.summary.outbox_count}`,
      `Quarantine: ${report.summary.quarantine_count}`,
      report.next_actions && report.next_actions.length ? `Next: ${report.next_actions[0]}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_evidence") {
    console.log([
      "Wi-Fi Data Sharing Evidence",
      `Status: ${report.status}`,
      report.package_id ? `Package: ${report.package_id}` : "Package: all available evidence",
      `Packages: ${report.summary.packages_count}`,
      `Transfer events: ${report.summary.transfer_events_count}`,
      `Policy results: ${report.summary.policy_results_count}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_pairing") {
    console.log([
      "Wi-Fi Data Sharing Pairing",
      `Status: ${report.status}`,
      `Node: ${report.candidate_node_id || report.node_id || "unknown"}`,
      report.pairing_id ? `Pairing ID: ${report.pairing_id}` : null,
      report.pairing_code ? `Pairing Code: ${report.pairing_code}` : null,
      report.expires_at ? `Expires: ${report.expires_at}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_trusted_nodes") {
    const nodes = Array.isArray(report.trusted_nodes) ? report.trusted_nodes : [];
    console.log(`Trusted nodes: ${nodes.length}`);
    for (const node of nodes) {
      console.log(`- ${node.node_id} (${node.trust_status}) ${node.display_name || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_node") {
    console.log([
      "Wi-Fi Data Sharing Node",
      `Status: ${report.status}`,
      `Node: ${report.node && report.node.node_id ? report.node.node_id : "unknown"}`,
      `Trust: ${report.trust_status || "candidate"}`
    ].join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_trust" || report && report.report_type === "wifi_data_sharing_revoke") {
    console.log([
      `Wi-Fi Data Sharing ${report.report_type === "wifi_data_sharing_trust" ? "Trust" : "Revoke"}`,
      `Status: ${report.status}`,
      `Node: ${report.node_id || "unknown"}`,
      report.trust_status ? `Trust: ${report.trust_status}` : null,
      report.reason ? `Reason: ${report.reason}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_server") {
    console.log([
      "Wi-Fi Data Sharing Server",
      `Status: ${report.status}`,
      report.transfer_server ? `Port: ${report.transfer_server.port || "n/a"}` : null,
      report.transfer_server ? `Server: ${report.transfer_server.status}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_package") {
    console.log([
      "Wi-Fi Data Sharing Package",
      `Status: ${report.status}`,
      report.package ? `Package: ${report.package.package_id}` : null,
      report.package ? `Type: ${report.package.package_type}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_packages") {
    const packages = Array.isArray(report.packages) ? report.packages : [];
    console.log(`Packages: ${packages.length}`);
    for (const item of packages) {
      console.log(`- ${item.package_id} (${item.package_type}) ${item.status || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_send") {
    console.log([
      "Wi-Fi Data Sharing Send",
      `Status: ${report.status}`,
      report.transfer ? `Transfer: ${report.transfer.transfer_id}` : null,
      report.package_id ? `Package: ${report.package_id}` : null,
      report.target_node_id ? `Target: ${report.target_node_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_inbox") {
    const inbox = Array.isArray(report.inbox) ? report.inbox : [];
    console.log(`Inbox: ${inbox.length}`);
    for (const item of inbox) {
      console.log(`- ${item.package_id} (${item.status}) ${item.title || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_inbox_item") {
    console.log([
      "Wi-Fi Data Sharing Inbox Item",
      `Status: ${report.status}`,
      report.inbox_item ? `Package: ${report.inbox_item.package_id}` : null,
      report.inbox_item ? `Package status: ${report.inbox_item.status}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_inbox_action") {
    console.log([
      `Wi-Fi Data Sharing Inbox ${report.action === "accept" ? "Accept" : "Reject"}`,
      `Status: ${report.status}`,
      report.package_id ? `Package: ${report.package_id}` : null,
      report.reason ? `Reason: ${report.reason}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_security_result") {
    console.log([
      "Wi-Fi Data Sharing Security Check",
      `Status: ${report.status}`,
      report.policy_result ? `Package: ${report.policy_result.package_id}` : null,
      report.policy_result ? `Sender: ${report.policy_result.sender_node_id || "unknown"}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_security_results") {
    const results = Array.isArray(report.policy_results) ? report.policy_results : [];
    console.log(`Security policy results: ${results.length}`);
    for (const item of results) {
      console.log(`- ${item.policy_result_id} ${item.package_id || ""} (${item.status})`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_quarantine") {
    const records = Array.isArray(report.quarantine) ? report.quarantine : [];
    console.log(`Quarantine records: ${records.length}`);
    for (const item of records) {
      console.log(`- ${item.package_id} (${item.status}) ${item.title || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_quarantine_item") {
    console.log([
      "Wi-Fi Data Sharing Quarantine Item",
      `Status: ${report.status}`,
      report.quarantine_item ? `Package: ${report.quarantine_item.package_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_quarantine_action") {
    console.log([
      `Wi-Fi Data Sharing Quarantine ${report.action === "release" ? "Release" : "Reject"}`,
      `Status: ${report.status}`,
      report.package_id ? `Package: ${report.package_id}` : null,
      report.reason ? `Reason: ${report.reason}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_outbox") {
    const outbox = Array.isArray(report.outbox) ? report.outbox : [];
    console.log(`Outbox: ${outbox.length}`);
    for (const item of outbox) {
      console.log(`- ${item.package_id} (${item.status}) ${item.title || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_outbox_item") {
    console.log([
      "Wi-Fi Data Sharing Outbox Item",
      `Status: ${report.status}`,
      report.outbox_item ? `Package: ${report.outbox_item.package_id}` : null,
      report.outbox_item ? `Transfer mode: ${report.outbox_item.transfer_mode || "single_frame"}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_outbox_action") {
    console.log([
      `Wi-Fi Data Sharing Outbox ${report.action === "retry" ? "Retry" : "Cancel"}`,
      `Status: ${report.status}`,
      report.package_id ? `Package: ${report.package_id}` : null,
      report.reason ? `Reason: ${report.reason}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfer_sessions") {
    const sessions = Array.isArray(report.transfer_sessions) ? report.transfer_sessions : [];
    console.log(`Transfer sessions: ${sessions.length}`);
    for (const item of sessions) {
      console.log(`- ${item.session_id} (${item.status}) ${item.package_id || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfer_session") {
    console.log([
      "Wi-Fi Data Sharing Transfer Session",
      `Status: ${report.status}`,
      report.transfer_session ? `Session: ${report.transfer_session.session_id}` : null,
      report.transfer_session ? `Package: ${report.transfer_session.package_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfer_session_action") {
    console.log([
      `Wi-Fi Data Sharing Transfer Session ${report.action === "resume" ? "Resume" : "Clean"}`,
      `Status: ${report.status}`,
      report.session_id ? `Session: ${report.session_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfer_sessions_action") {
    console.log([
      "Wi-Fi Data Sharing Transfer Sessions Clean",
      `Status: ${report.status}`,
      `Removed: ${report.removed_count}`,
      `Remaining: ${report.remaining_count}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfers") {
    const transfers = Array.isArray(report.transfers) ? report.transfers : [];
    console.log(`Transfers: ${transfers.length}`);
    for (const item of transfers) {
      console.log(`- ${item.event_type || item.transfer_id || "transfer"} ${item.package_id || ""}`.trim());
    }
    return;
  }
  if (report && report.report_type === "wifi_data_sharing_transfer") {
    console.log([
      "Wi-Fi Data Sharing Transfer",
      `Status: ${report.status}`,
      report.transfer ? `Transfer: ${report.transfer.transfer_id}` : null,
      report.transfer ? `Package: ${report.transfer.package_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n"));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

module.exports = {
  wifiDataSharing,
  buildWifiDataSharingStatusReport,
  buildWifiDataSharingPolicyReport,
  buildWifiDataSharingStateReport,
  buildWifiDataSharingCandidatesReport,
  buildProviderReport,
  buildReadinessReport,
  buildDashboardReport,
  buildAuditReport,
  buildEvidenceReport,
  buildTwoNodeSimulationReport,
  buildTransferStressReport,
  buildSecuritySimulationReport
};
