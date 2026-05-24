const fs = require("fs");

const state = require("./state");
const transfer = require("./transfer");
const trustedNodes = require("./trusted_nodes");

function wifiDataSharingEvidence(action, value, flags = {}, rest = []) {
  void action;
  void value;
  const report = buildEvidenceReport({
    packageId: flags.package || flags.package_id || rest[0] || null
  });
  outputReport(report, flags);
  return report;
}

function buildEvidenceReport(options = {}) {
  const packageId = normalizePackageId(options.packageId);
  const current = state.readWifiDataSharingState();
  const packagesState = state.readWifiDataPackagesState();
  const inboxState = state.readWifiDataInboxState();
  const outboxState = state.readWifiDataOutboxState();
  const quarantineState = state.readWifiDataQuarantineState();
  const policyResultsState = state.readWifiTransferPolicyResultsState();
  const packageRecords = Array.isArray(packagesState.packages) ? packagesState.packages : [];
  const inboxRecords = Array.isArray(inboxState.inbox) ? inboxState.inbox : [];
  const outboxRecords = Array.isArray(outboxState.outbox) ? outboxState.outbox : [];
  const quarantineRecords = Array.isArray(quarantineState.quarantine) ? quarantineState.quarantine : [];
  const policyResults = Array.isArray(policyResultsState.policy_results) ? policyResultsState.policy_results : [];
  const transferEvents = safeReadJsonLines(state.getTransferLogFile());
  const pairingEvents = safeReadJsonLines(state.getPairingLogFile());
  const focusNodeId = packageId ? findNodeIdForPackage(current, packageId) : null;
  const trustedNode = focusNodeId ? trustedNodes.findTrustedNodeRecord(current, focusNodeId) : null;
  const focusedPackage = packageId ? packageRecords.find((item) => item.package_id === packageId) || transfer.getPackage(packageId) : null;
  const relatedInbox = filterByPackageId(inboxRecords, packageId);
  const relatedOutbox = filterByPackageId(outboxRecords, packageId);
  const relatedQuarantine = filterByPackageId(quarantineRecords, packageId);
  const relatedPolicyResults = filterByPackageId(policyResults, packageId);
  const relatedTransfers = filterByPackageId(transferEvents, packageId);
  const relatedPairingEvents = focusNodeId
    ? pairingEvents.filter((event) => event.candidate_node_id === focusNodeId || event.node_id === focusNodeId)
    : pairingEvents.slice();
  const warnings = [];
  if (!current.local_node || !current.local_node.node_id) {
    warnings.push("Local node is not initialized.");
  }
  if (!packageId) {
    warnings.push("No package id provided; showing the current local evidence set.");
  } else if (!focusedPackage && !relatedInbox.length && !relatedOutbox.length && !relatedQuarantine.length && !relatedTransfers.length) {
    warnings.push(`No evidence was found for package ${packageId}.`);
  }
  const report = {
    report_type: "wifi_data_sharing_evidence",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: warnings.length ? "partial" : "ok",
    package_id: packageId,
    package: focusedPackage || null,
    package_lifecycle: relatedInbox.length || relatedOutbox.length || relatedQuarantine.length
      ? {
        inbox: relatedInbox,
        outbox: relatedOutbox,
        quarantine: relatedQuarantine
      }
      : {
        inbox: packageId ? [] : inboxRecords.slice(-10).reverse(),
        outbox: packageId ? [] : outboxRecords.slice(-10).reverse(),
        quarantine: packageId ? [] : quarantineRecords.slice(-10).reverse()
      },
    transfer_lifecycle: relatedTransfers.length ? relatedTransfers : transferEvents.slice(-10).reverse(),
    policy_results: relatedPolicyResults.length ? relatedPolicyResults : policyResults.slice(-10).reverse(),
    pairing_trust_events: relatedPairingEvents.length ? relatedPairingEvents : pairingEvents.slice(-10).reverse(),
    trusted_node: trustedNode,
    summary: {
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id),
      packages_count: packageRecords.length,
      inbox_count: inboxRecords.length,
      outbox_count: outboxRecords.length,
      quarantine_count: quarantineRecords.length,
      transfer_events_count: transferEvents.length,
      policy_results_count: policyResults.length,
      pairing_events_count: pairingEvents.length
    },
    warnings,
    next_action: buildNextAction(packageId, focusedPackage, warnings, relatedInbox, relatedOutbox, relatedQuarantine)
  };
  return report;
}

function buildNextAction(packageId, focusedPackage, warnings, relatedInbox, relatedOutbox, relatedQuarantine) {
  if (warnings.length && warnings[0].includes("Local node")) {
    return "Initialize the local node before collecting or reviewing evidence.";
  }
  if (packageId && !focusedPackage && !relatedInbox.length && !relatedOutbox.length && !relatedQuarantine.length) {
    return "Create or send a package first, then re-run evidence for that package id.";
  }
  if (relatedQuarantine.some((item) => item.status === "quarantined")) {
    return "Release or reject quarantined packages explicitly after security review.";
  }
  return "Use the evidence report to trace package, transfer, policy, and trust activity without executing anything.";
}

function filterByPackageId(records, packageId) {
  if (!packageId) return [];
  return (Array.isArray(records) ? records : []).filter((record) => {
    return record.package_id === packageId
      || record.packet_id === packageId
      || record.transfer_id === packageId
      || record.outbox_id === packageId
      || record.session_id === packageId;
  });
}

function findNodeIdForPackage(current, packageId) {
  const packageRecord = transfer.getPackage(packageId);
  if (packageRecord && packageRecord.target_node_id) return packageRecord.target_node_id;
  const inboxItem = transfer.getInboxRecord(packageId);
  if (inboxItem && inboxItem.target_node_id) return inboxItem.target_node_id;
  const outboxRecord = state.findWifiDataOutboxRecord(packageId);
  if (outboxRecord && outboxRecord.target_node_id) return outboxRecord.target_node_id;
  const quarantineRecord = state.findWifiDataQuarantineRecord(packageId);
  if (quarantineRecord && quarantineRecord.target_node_id) return quarantineRecord.target_node_id;
  const trusted = Array.isArray(current.trusted_nodes) ? current.trusted_nodes : [];
  return trusted[0] ? trusted[0].node_id : null;
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

function normalizePackageId(packageId) {
  const value = String(packageId || "").trim();
  return value.length ? value : null;
}

function renderEvidenceText(report) {
  return [
    "Wi-Fi Data Sharing Evidence",
    `Status: ${report.status}`,
    report.package_id ? `Package: ${report.package_id}` : "Package: all available evidence",
    `Packages: ${report.summary.packages_count}`,
    `Inbox: ${report.summary.inbox_count}`,
    `Outbox: ${report.summary.outbox_count}`,
    `Quarantine: ${report.summary.quarantine_count}`,
    `Transfer events: ${report.summary.transfer_events_count}`,
    `Policy results: ${report.summary.policy_results_count}`,
    `Pairing events: ${report.summary.pairing_events_count}`,
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    "Next action:",
    `- ${report.next_action}`
  ].join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderEvidenceText(report));
}

module.exports = {
  wifiDataSharingEvidence,
  buildEvidenceReport,
  renderEvidenceText
};
