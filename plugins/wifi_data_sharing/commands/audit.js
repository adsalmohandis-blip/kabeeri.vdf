const fs = require("fs");
const path = require("path");

const state = require("./state");
const transfer = require("./transfer");
const outbox = require("./outbox");

function wifiDataSharingAudit(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = buildAuditReport({ packageId: flags.package || flags.package_id || null });
  outputReport(report, flags);
  return report;
}

function buildAuditReport(options = {}) {
  const current = state.readWifiDataSharingState();
  const packageId = normalizePackageId(options.packageId);
  const discoveryEvents = safeReadJsonLines(state.getDiscoveryLogFile());
  const pairingEvents = safeReadJsonLines(state.getPairingLogFile());
  const transferEvents = safeReadJsonLines(state.getTransferLogFile());
  const policyResultsState = state.readWifiTransferPolicyResultsState();
  const policyResults = Array.isArray(policyResultsState.policy_results) ? policyResultsState.policy_results : [];
  const quarantineState = state.readWifiDataQuarantineState();
  const quarantineRecords = Array.isArray(quarantineState.quarantine) ? quarantineState.quarantine : [];
  const outboxRecords = outbox.listOutboxRecords();
  const inboxRecords = transfer.listInboxRecords();
  const packagesState = state.readWifiDataPackagesState();
  const packages = Array.isArray(packagesState.packages) ? packagesState.packages : [];
  const trustedNodes = Array.isArray(current.trusted_nodes) ? current.trusted_nodes : [];
  const warnings = [];
  if (!current.local_node || !current.local_node.node_id) {
    warnings.push("Local node is not initialized.");
  }
  if (!discoveryEvents.length) warnings.push("No discovery events were recorded yet.");
  if (!pairingEvents.length) warnings.push("No pairing events were recorded yet.");
  if (!transferEvents.length) warnings.push("No transfer events were recorded yet.");
  if (!policyResults.length) warnings.push("No security policy results were recorded yet.");
  const report = {
    report_type: "wifi_data_sharing_audit",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: warnings.length ? "partial" : "ok",
    files_checked: buildFilesChecked(),
    summary: {
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id),
      candidates_count: Array.isArray(current.discovery && current.discovery.known_candidates) ? current.discovery.known_candidates.length : 0,
      trusted_nodes_count: trustedNodes.filter((node) => node.trust_status === "trusted").length,
      revoked_nodes_count: trustedNodes.filter((node) => node.trust_status === "revoked").length,
      packages_count: packages.length,
      inbox_count: inboxRecords.length,
      outbox_count: outboxRecords.length,
      quarantine_count: quarantineRecords.length,
      discovery_events_count: discoveryEvents.length,
      pairing_events_count: pairingEvents.length,
      transfer_events_count: transferEvents.length,
      policy_results_count: policyResults.length
    },
    latest_events: buildTimeline([
      ...mapEvents(discoveryEvents, "discovery"),
      ...mapEvents(pairingEvents, "pairing"),
      ...mapEvents(transferEvents, "transfer"),
      ...mapEvents(policyResults, "policy"),
      ...mapEvents(quarantineRecords, "quarantine"),
      ...mapEvents(outboxRecords, "outbox"),
      ...mapEvents(inboxRecords, "inbox")
    ]).slice(-20).reverse(),
    warnings,
    next_actions: buildNextActions(warnings, current, quarantineRecords, outboxRecords)
  };
  writeAuditReport(report);
  return report;
}

function buildFilesChecked() {
  return [
    ".kabeeri/wifi_data_sharing.json",
    ".kabeeri/wifi_data_discovery.jsonl",
    ".kabeeri/wifi_data_pairing.jsonl",
    ".kabeeri/wifi_data_transfers.jsonl",
    ".kabeeri/wifi_transfer_policy_results.json",
    ".kabeeri/wifi_data_quarantine.json",
    ".kabeeri/wifi_data_outbox.json",
    ".kabeeri/wifi_data_inbox.json"
  ];
}

function buildTimeline(records) {
  return (Array.isArray(records) ? records : [])
    .filter(Boolean)
    .sort((left, right) => new Date(left.created_at || left.updated_at || left.at || 0).getTime() - new Date(right.created_at || right.updated_at || right.at || 0).getTime());
}

function mapEvents(records, kind) {
  return (Array.isArray(records) ? records : []).map((record) => ({
    kind,
    event_type: record.event_type || record.status || record.action || kind,
    package_id: record.package_id || null,
    node_id: record.node_id || record.candidate_node_id || record.source_node_id || record.target_node_id || null,
    status: record.status || record.trust_status || null,
    created_at: record.created_at || record.sent_at || record.received_at || record.generated_at || record.updated_at || null,
    summary: record.reason || record.rejection_reason || record.message || record.next_action || null
  }));
}

function buildNextActions(warnings, current, quarantineRecords, outboxRecords) {
  const actions = [];
  if (!current.local_node || !current.local_node.node_id) {
    actions.push("Initialize the local node before using local Wi-Fi data sharing.");
  }
  if (warnings.length) {
    actions.push(warnings[0]);
  }
  if (Array.isArray(quarantineRecords) && quarantineRecords.some((item) => item.status === "quarantined")) {
    actions.push("Review quarantined packages and release or reject them explicitly.");
  }
  if (Array.isArray(outboxRecords) && outboxRecords.some((item) => ["failed", "cancelled", "expired"].includes(String(item.status || "").toLowerCase()))) {
    actions.push("Inspect failed outbox transfers and retry only after review.");
  }
  if (!actions.length) {
    actions.push("Use dashboard, evidence, or readiness reports to trace local LAN sharing activity.");
  }
  return Array.from(new Set(actions));
}

function normalizePackageId(packageId) {
  const value = String(packageId || "").trim();
  return value.length ? value : null;
}

function safeReadJsonLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  const records = [];
  for (const line of lines) {
    try {
      records.push(JSON.parse(line));
    } catch (lineError) {
      records.push({ event_type: "parse_error", message: lineError.message, raw: line });
    }
  }
  return records;
}

function renderAuditText(report) {
  return [
    "Wi-Fi Data Sharing Audit",
    `Status: ${report.status}`,
    `Local node: ${report.summary.local_node_initialized ? "initialized" : "uninitialized"}`,
    `Candidates: ${report.summary.candidates_count}`,
    `Trusted nodes: ${report.summary.trusted_nodes_count}`,
    `Revoked nodes: ${report.summary.revoked_nodes_count}`,
    `Packages: ${report.summary.packages_count}`,
    `Inbox: ${report.summary.inbox_count}`,
    `Outbox: ${report.summary.outbox_count}`,
    `Quarantine: ${report.summary.quarantine_count}`,
    `Discovery events: ${report.summary.discovery_events_count}`,
    `Pairing events: ${report.summary.pairing_events_count}`,
    `Transfer events: ${report.summary.transfer_events_count}`,
    `Policy results: ${report.summary.policy_results_count}`,
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
  console.log(renderAuditText(report));
}

function writeAuditReport(report) {
  const file = path.join(state.repoRoot(), ".kabeeri", "reports", "wifi_data_sharing_audit.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

module.exports = {
  wifiDataSharingAudit,
  buildAuditReport,
  renderAuditText
};
