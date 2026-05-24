const { ensureWifiDataSharingState, appendWifiDataTransferEvent, findWifiDataOutboxRecord, upsertWifiDataOutboxRecord, upsertWifiDataQuarantineRecord } = require("./state");
const {
  listInboxRecords,
  getInboxRecord,
  storeInboxRecord,
  updatePackageStatus
} = require("./transfer");
const { findTrustedNodeRecord } = require("./trusted_nodes");
const { getLatestPolicyResultForPackage } = require("./security_gate");

function wifiDataInbox(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "inbox") {
    return buildBlockedInboxReport("Unknown inbox action.");
  }
  if (!verb || verb === "list") {
    return buildInboxReport();
  }
  if (verb === "show") {
    return buildInboxItemReport(rest[0] || flags.package || flags.package_id || null);
  }
  if (verb === "accept") {
    return acceptInboxPackage({
      packageId: rest[0] || flags.package || flags.package_id || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (verb === "reject") {
    return rejectInboxPackage({
      packageId: rest[0] || flags.package || flags.package_id || null,
      reason: flags.reason || rest[1] || null
    });
  }
  return buildBlockedInboxReport(`Unknown inbox action: ${verb}`);
}

function buildInboxReport() {
  const inbox = listInboxRecords();
  return {
    report_type: "wifi_data_sharing_inbox",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    inbox,
    counts: {
      total: inbox.length,
      received: inbox.filter((item) => item.status === "received").length,
      accepted: inbox.filter((item) => item.status === "accepted").length,
      rejected: inbox.filter((item) => item.status === "rejected").length,
      quarantined: inbox.filter((item) => item.quarantined !== false).length
    }
  };
}

function buildInboxItemReport(packageId) {
  const item = getInboxRecord(packageId);
  if (!item) {
    return buildBlockedInboxReport("Inbox package not found.", packageId);
  }
  return {
    report_type: "wifi_data_sharing_inbox_item",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    inbox_item: item,
    package_id: packageId,
    next_action: "Run accept or reject to review the package. Nothing is auto-applied."
  };
}

function acceptInboxPackage({ packageId, confirm = false }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!confirm) {
    return buildBlockedInboxReport("Inbox accept requires --confirm.", packageId);
  }
  const item = getInboxRecord(packageId);
  if (!item) {
    return buildBlockedInboxReport("Inbox package not found.", packageId);
  }
  const policyResult = getLatestPolicyResultForPackage(packageId);
  if (!policyResult || policyResult.status !== "pass") {
    return buildBlockedInboxReport("A passing security result is required before inbox accept.", packageId);
  }
  const trusted = findTrustedNodeRecord(state, item.target_node_id || item.received_by_node_id || item.source_node_id);
  if (!trusted || trusted.trust_status !== "trusted") {
    return buildBlockedInboxReport("Inbox packages can only be accepted from trusted nodes.", packageId);
  }
  const updated = storeInboxRecord({
    ...item,
    status: "accepted",
    accepted_at: new Date().toISOString(),
    quarantined: false,
    review_required: false
  });
  updatePackageStatus(packageId, "accepted", {
    accepted_at: updated.accepted_at,
    quarantined: false
  });
  const outboxRecord = findWifiDataOutboxRecord(packageId);
  if (outboxRecord) {
    upsertWifiDataOutboxRecord({
      ...outboxRecord,
      status: "accepted",
      accepted_at: updated.accepted_at,
      updated_at: updated.accepted_at,
      last_error: null
    });
  }
  upsertWifiDataQuarantineRecord({
    package_id: packageId,
    transfer_id: item.transfer_id || null,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    package_type: item.package_type || null,
    title: item.title || null,
    status: "released",
    released_at: policyResult.generated_at || updated.accepted_at,
    updated_at: updated.accepted_at,
    review_required: false,
    security_result_id: policyResult.policy_result_id,
    security_status: policyResult.status
  });
  appendWifiDataTransferEvent({
    event_type: "package_accepted",
    transfer_id: item.transfer_id || null,
    package_id: packageId,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    created_at: updated.accepted_at
  });
  return {
    report_type: "wifi_data_sharing_inbox_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "accept",
    package_id: packageId,
    inbox_item: updated,
    next_action: "The package was accepted into the inbox review state only. No plugin state was auto-applied."
  };
}

function rejectInboxPackage({ packageId, reason }) {
  if (!reason) {
    return buildBlockedInboxReport("Inbox reject requires a reason.", packageId);
  }
  const item = getInboxRecord(packageId);
  if (!item) {
    return buildBlockedInboxReport("Inbox package not found.", packageId);
  }
  const updated = storeInboxRecord({
    ...item,
    status: "rejected",
    rejected_at: new Date().toISOString(),
    rejection_reason: reason,
    quarantined: true,
    review_required: false
  });
  updatePackageStatus(packageId, "rejected", {
    rejected_at: updated.rejected_at,
    rejection_reason: reason,
    quarantined: true
  });
  const outboxRecord = findWifiDataOutboxRecord(packageId);
  if (outboxRecord) {
    upsertWifiDataOutboxRecord({
      ...outboxRecord,
      status: "rejected",
      rejected_at: updated.rejected_at,
      rejection_reason: reason,
      updated_at: updated.rejected_at,
      last_error: reason
    });
  }
  upsertWifiDataQuarantineRecord({
    package_id: packageId,
    transfer_id: item.transfer_id || null,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    package_type: item.package_type || null,
    title: item.title || null,
    status: "rejected",
    rejected_at: updated.rejected_at,
    rejection_reason: reason,
    updated_at: updated.rejected_at,
    review_required: false,
    security_status: "blocked"
  });
  appendWifiDataTransferEvent({
    event_type: "package_rejected",
    transfer_id: item.transfer_id || null,
    package_id: packageId,
    source_node_id: item.source_node_id || null,
    target_node_id: item.target_node_id || null,
    created_at: updated.rejected_at
  });
  return {
    report_type: "wifi_data_sharing_inbox_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "reject",
    package_id: packageId,
    inbox_item: updated,
    reason,
    next_action: "The package stays quarantined and is not applied anywhere."
  };
}

function buildBlockedInboxReport(message, packageId = null) {
  return {
    report_type: "wifi_data_sharing_inbox",
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
  wifiDataInbox,
  buildInboxReport,
  buildInboxItemReport,
  acceptInboxPackage,
  rejectInboxPackage,
  buildBlockedInboxReport
};
