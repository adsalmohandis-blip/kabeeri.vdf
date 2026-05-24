const fs = require("fs");
const path = require("path");

const provider = require("../provider");
const state = require("./state");
const transfer = require("./transfer");
const outbox = require("./outbox");
const retry = require("./retry");

function wifiDataSharingDashboard(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = buildDashboardReport({ limit: flags.limit });
  outputReport(report, flags);
  return report;
}

function buildDashboardReport(options = {}) {
  const current = state.readWifiDataSharingState();
  const providerReport = provider.buildProviderReport({ limit: options.limit });
  const readiness = provider.collectReadinessChecks();
  const packages = transfer.listPackages().packages || [];
  const inbox = transfer.listInboxRecords();
  const outboxRecords = outbox.listOutboxRecords();
  const transfers = transfer.listTransfers().transfers || [];
  const transferSessions = retry.buildTransferSessionsReport().transfer_sessions || [];
  const trusted = provider.listTrustedNodes(options);
  const candidates = provider.listCandidates(options);
  const policyResultsState = state.readWifiTransferPolicyResultsState();
  const policyResults = Array.isArray(policyResultsState.policy_results) ? policyResultsState.policy_results : [];
  const quarantineState = state.readWifiDataQuarantineState();
  const quarantineRecords = Array.isArray(quarantineState.quarantine) ? quarantineState.quarantine : [];
  const report = {
    report_type: "wifi_data_sharing_dashboard",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: providerReport.status,
    summary: {
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id),
      candidates_count: candidates.length,
      trusted_nodes_count: trusted.filter((node) => node.trust_status === "trusted").length,
      revoked_nodes_count: trusted.filter((node) => node.trust_status === "revoked").length,
      packages_count: packages.length,
      outbox_count: outboxRecords.length,
      inbox_count: inbox.length,
      quarantine_count: quarantineRecords.length,
      completed_transfers: countCompletedTransfers(transfers),
      failed_transfers: countFailedTransfers(transfers),
      policy_blockers: readiness.blockers.length
    },
    provider: providerReport.provider_info,
    local_node: providerReport.local_node,
    nodes: buildNodeSnapshot(trusted, candidates),
    latest_packages: packages.slice(-5).reverse(),
    latest_inbox: inbox.slice(-5).reverse(),
    latest_outbox: outboxRecords.slice(-5).reverse(),
    latest_transfers: transfers.slice(-5).reverse(),
    latest_transfer_sessions: transferSessions.slice(-5).reverse(),
    latest_policy_results: policyResults.slice(-5).reverse(),
    warnings: buildWarnings(providerReport, readiness, quarantineRecords),
    next_actions: buildNextActions(providerReport, readiness, candidates, trusted, packages, inbox, outboxRecords, transfers, policyResults, quarantineRecords)
  };
  writeDashboardReport(report);
  return report;
}

function buildNodeSnapshot(trusted, candidates) {
  const trustedNodes = Array.isArray(trusted) ? trusted.slice() : [];
  const candidateNodes = Array.isArray(candidates) ? candidates.filter((candidate) => !trustedNodes.some((node) => node.node_id === candidate.node_id)) : [];
  return [
    ...trustedNodes.slice(0, 10),
    ...candidateNodes.slice(0, 10)
  ];
}

function countCompletedTransfers(transfers) {
  return (Array.isArray(transfers) ? transfers : []).filter((item) => {
    const status = String(item.status || "").toLowerCase();
    const eventType = String(item.event_type || "").toLowerCase();
    return ["sent", "received", "accepted"].includes(status)
      || ["package_received", "package_accepted", "transfer_session_resumed"].includes(eventType);
  }).length;
}

function countFailedTransfers(transfers) {
  return (Array.isArray(transfers) ? transfers : []).filter((item) => {
    const status = String(item.status || "").toLowerCase();
    const eventType = String(item.event_type || "").toLowerCase();
    return ["blocked", "failed", "rejected", "cancelled", "expired"].includes(status)
      || ["package_blocked", "package_rejected", "transfer_failed"].includes(eventType);
  }).length;
}

function buildWarnings(providerReport, readiness, quarantineRecords) {
  const warnings = new Set([
    ...(providerReport.warnings || []),
    ...(readiness.warnings || [])
  ]);
  if (Array.isArray(quarantineRecords) && quarantineRecords.some((item) => item.status === "quarantined")) {
    warnings.add("Some received packages are still quarantined and need review.");
  }
  return Array.from(warnings);
}

function buildNextActions(providerReport, readiness, candidates, trusted, packages, inbox, outboxRecords, transfers, policyResults, quarantineRecords) {
  const actions = [];
  if (!providerReport.summary.local_node_initialized) {
    actions.push("Initialize the local node with `kvdf wifi-data-sharing init --name <name> --role owner|worker`.");
  }
  if (readiness.blockers.length) {
    actions.push(readiness.next_action || readiness.blockers[0]);
  } else if (candidates.length === 0) {
    actions.push("Run discovery or advertise on a LAN node to collect candidates.");
  }
  if (trusted.filter((node) => node.trust_status === "trusted").length === 0) {
    actions.push("Verify pairing and trust a candidate node before sending packages.");
  }
  if (!packages.length) {
    actions.push("Create a bounded package before trying to send data.");
  }
  if (outboxRecords.length === 0) {
    actions.push("Use the outbox to inspect retryable or cancelled transfers.");
  }
  if (inbox.length && inbox.every((item) => item.status === "received")) {
    actions.push("Review the inbox and accept or reject packages explicitly.");
  }
  if (policyResults.length && policyResults.some((item) => item.status !== "pass")) {
    actions.push("Inspect the latest transfer security results before releasing quarantine.");
  }
  if (quarantineRecords.some((item) => item.status === "quarantined")) {
    actions.push("Release or reject quarantined packages manually after review.");
  }
  if (transfers.length === 0) {
    actions.push("Send a trusted package to record a local transfer event.");
  }
  return Array.from(new Set(actions));
}

function renderDashboardText(report) {
  return [
    "Wi-Fi Data Sharing Dashboard",
    `Status: ${report.status}`,
    `Local node: ${report.summary.local_node_initialized ? "initialized" : "uninitialized"}`,
    `Candidates: ${report.summary.candidates_count}`,
    `Trusted nodes: ${report.summary.trusted_nodes_count}`,
    `Revoked nodes: ${report.summary.revoked_nodes_count}`,
    `Packages: ${report.summary.packages_count}`,
    `Inbox: ${report.summary.inbox_count}`,
    `Outbox: ${report.summary.outbox_count}`,
    `Quarantine: ${report.summary.quarantine_count}`,
    `Transfers: ${report.summary.completed_transfers} completed, ${report.summary.failed_transfers} failed`,
    `Policy blockers: ${report.summary.policy_blockers}`,
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    "Next actions:",
    ...(report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- None."])
  ].join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderDashboardText(report));
}

function writeDashboardReport(report) {
  const file = pathJoinReports("wifi_data_sharing_dashboard.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function pathJoinReports(fileName) {
  return path.join(state.repoRoot(), ".kabeeri", "reports", fileName);
}

module.exports = {
  wifiDataSharingDashboard,
  buildDashboardReport,
  renderDashboardText
};
