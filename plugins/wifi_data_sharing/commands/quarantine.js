const {
  ensureWifiDataSharingState,
  readWifiDataQuarantineState,
  findWifiDataQuarantineRecord,
  upsertWifiDataQuarantineRecord,
  appendWifiDataTransferEvent
} = require("./state");
const transfer = require("./transfer");
const { getLatestPolicyResultForPackage } = require("./security_gate");

function wifiDataQuarantine(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "quarantine") {
    return buildBlockedQuarantineReport("Unknown quarantine action.");
  }
  if (!verb || verb === "list") {
    return buildQuarantineReport();
  }
  if (verb === "show") {
    return buildQuarantineItemReport(rest[0] || flags.package || flags.package_id || null);
  }
  if (verb === "release") {
    return releaseQuarantineItem({
      packageId: rest[0] || flags.package || flags.package_id || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (verb === "reject") {
    return rejectQuarantineItem({
      packageId: rest[0] || flags.package || flags.package_id || null,
      reason: flags.reason || rest[1] || null
    });
  }
  return buildBlockedQuarantineReport(`Unknown quarantine action: ${verb}`);
}

function buildQuarantineReport() {
  const current = readWifiDataQuarantineState();
  const quarantine = Array.isArray(current.quarantine) ? current.quarantine : [];
  return {
    report_type: "wifi_data_sharing_quarantine",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    quarantine,
    counts: {
      total: quarantine.length,
      quarantined: quarantine.filter((item) => item.status === "quarantined").length,
      released: quarantine.filter((item) => item.status === "released").length,
      rejected: quarantine.filter((item) => item.status === "rejected").length
    }
  };
}

function buildQuarantineItemReport(packageId) {
  const item = findWifiDataQuarantineRecord(packageId);
  if (!item) {
    return buildBlockedQuarantineReport("Quarantine package not found.", packageId);
  }
  return {
    report_type: "wifi_data_sharing_quarantine_item",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    quarantine_item: item,
    policy_result: getLatestPolicyResultForPackage(packageId),
    next_action: "Review the security result, then release or reject manually."
  };
}

function releaseQuarantineItem({ packageId, confirm = false }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!confirm) {
    return buildBlockedQuarantineReport("Quarantine release requires --confirm.", packageId);
  }
  const item = findWifiDataQuarantineRecord(packageId);
  if (!item) {
    return buildBlockedQuarantineReport("Quarantine package not found.", packageId);
  }
  const policyResult = getLatestPolicyResultForPackage(packageId);
  if (!policyResult || policyResult.status !== "pass") {
    return buildBlockedQuarantineReport("Security pass is required before quarantine release.", packageId);
  }
  const packageRecord = transfer.getPackage(packageId) || null;
  const inboxItem = transfer.getInboxRecord(packageId);
  const now = new Date().toISOString();
  const updated = upsertWifiDataQuarantineRecord({
    ...item,
    status: "released",
    released_at: now,
    updated_at: now,
    review_required: true,
    security_status: policyResult.status
  });
  if (inboxItem) {
    transfer.storeInboxRecord({
      ...inboxItem,
      status: "received",
      quarantined: false,
      review_required: true,
      released_at: now,
      security_result_id: policyResult.policy_result_id
    });
  }
  if (packageRecord) {
    transfer.updatePackageStatus(packageId, packageRecord.status || "received", {
      released_at: now,
      quarantined: false
    });
  }
  appendWifiDataTransferEvent({
    event_type: "package_quarantine_released",
    transfer_id: item.transfer_id || null,
    package_id: packageId,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    created_at: now
  });
  return {
    report_type: "wifi_data_sharing_quarantine_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "release",
    package_id: packageId,
    quarantine_item: updated,
    policy_result: policyResult,
    next_action: "The package is released from quarantine but it is still only in inbox review. Use inbox accept to finalize the review."
  };
}

function rejectQuarantineItem({ packageId, reason }) {
  if (!reason) {
    return buildBlockedQuarantineReport("Quarantine reject requires a reason.", packageId);
  }
  const item = findWifiDataQuarantineRecord(packageId);
  if (!item) {
    return buildBlockedQuarantineReport("Quarantine package not found.", packageId);
  }
  const packageRecord = transfer.getPackage(packageId) || null;
  const inboxItem = transfer.getInboxRecord(packageId);
  const now = new Date().toISOString();
  const updated = upsertWifiDataQuarantineRecord({
    ...item,
    status: "rejected",
    rejected_at: now,
    rejection_reason: reason,
    updated_at: now,
    review_required: false,
    security_status: item.security_status || "blocked"
  });
  if (inboxItem) {
    transfer.storeInboxRecord({
      ...inboxItem,
      status: "rejected",
      quarantined: true,
      review_required: false,
      rejected_at: now,
      rejection_reason: reason
    });
  }
  if (packageRecord) {
    transfer.updatePackageStatus(packageId, "rejected", {
      rejected_at: now,
      rejection_reason: reason,
      quarantined: true
    });
  }
  appendWifiDataTransferEvent({
    event_type: "package_rejected",
    transfer_id: item.transfer_id || null,
    package_id: packageId,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    created_at: now,
    rejection_reason: reason
  });
  return {
    report_type: "wifi_data_sharing_quarantine_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "reject",
    package_id: packageId,
    quarantine_item: updated,
    reason,
    next_action: "The package remains rejected and will not be auto-applied."
  };
}

function buildBlockedQuarantineReport(message, packageId = null) {
  return {
    report_type: "wifi_data_sharing_quarantine",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    package_id: packageId,
    next_action: message
  };
}

function assertInitialized(state) {
  if (!state || !state.local_node || !state.local_node.node_id) {
    throw new Error("Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.");
  }
}

module.exports = {
  wifiDataQuarantine,
  buildQuarantineReport,
  buildQuarantineItemReport,
  releaseQuarantineItem,
  rejectQuarantineItem,
  buildBlockedQuarantineReport
};
