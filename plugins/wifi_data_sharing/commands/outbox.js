const { ensureWifiDataSharingState, readWifiDataOutboxState, findWifiDataOutboxRecord, upsertWifiDataOutboxRecord, findWifiTransferSessionRecord, upsertWifiTransferSessionRecord, appendWifiDataTransferEvent } = require("./state");
const { retryOutboxPackage, buildBlockedOutboxRetryReport } = require("./retry");

function wifiDataOutbox(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "outbox") {
    return buildBlockedOutboxReport("Unknown outbox action.");
  }
  if (!verb || verb === "list") {
    return buildOutboxReport();
  }
  if (verb === "show") {
    return buildOutboxItemReport(rest[0] || flags.package || flags.package_id || null);
  }
  if (verb === "retry") {
    return retryOutboxPackage({
      packageId: rest[0] || flags.package || flags.package_id || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (verb === "cancel") {
    return cancelOutboxPackage({
      packageId: rest[0] || flags.package || flags.package_id || null,
      reason: flags.reason || rest[1] || null
    });
  }
  return buildBlockedOutboxReport(`Unknown outbox action: ${verb}`);
}

function buildOutboxReport() {
  const outbox = listOutboxRecords();
  return {
    report_type: "wifi_data_sharing_outbox",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    outbox,
    counts: {
      total: outbox.length,
      created: outbox.filter((item) => item.status === "created").length,
      queued: outbox.filter((item) => item.status === "queued").length,
      sending: outbox.filter((item) => item.status === "sending").length,
      partially_sent: outbox.filter((item) => item.status === "partially_sent").length,
      sent: outbox.filter((item) => item.status === "sent").length,
      accepted: outbox.filter((item) => item.status === "accepted").length,
      rejected: outbox.filter((item) => item.status === "rejected").length,
      failed: outbox.filter((item) => item.status === "failed").length,
      cancelled: outbox.filter((item) => item.status === "cancelled").length,
      expired: outbox.filter((item) => item.status === "expired").length
    }
  };
}

function buildOutboxItemReport(packageId) {
  const item = findWifiDataOutboxRecord(packageId);
  if (!item) {
    return buildBlockedOutboxReport("Outbox package not found.", packageId);
  }
  return {
    report_type: "wifi_data_sharing_outbox_item",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    outbox_item: item,
    package_id: packageId,
    next_action: "Retry or cancel the transfer if needed."
  };
}

function cancelOutboxPackage({ packageId, reason }) {
  if (!reason) {
    return buildBlockedOutboxReport("Outbox cancel requires a reason.", packageId);
  }
  const state = ensureWifiDataSharingState();
  const item = findWifiDataOutboxRecord(packageId);
  if (!item) {
    return buildBlockedOutboxReport("Outbox package not found.", packageId);
  }
  const now = new Date().toISOString();
  const updated = upsertWifiDataOutboxRecord({
    ...item,
    status: "cancelled",
    cancelled_at: now,
    cancel_reason: reason,
    updated_at: now,
    last_error: reason
  });
  if (item.session_id) {
    const session = findWifiTransferSessionRecord(item.session_id);
    if (session) {
      upsertWifiTransferSessionRecord({
        ...session,
        status: "cancelled",
        updated_at: now,
        last_error: reason,
        completed_at: session.completed_at || null
      });
    }
  }
  appendWifiDataTransferEvent({
    event_type: "outbox_cancelled",
    transfer_id: item.transfer_id || null,
    package_id: packageId,
    package_type: item.package_type || null,
    source_node_id: state.local_node && state.local_node.node_id ? state.local_node.node_id : null,
    target_node_id: item.target_node_id || null,
    created_at: now
  });
  return {
    report_type: "wifi_data_sharing_outbox_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "cancel",
    package_id: packageId,
    outbox_item: updated,
    reason,
    next_action: "The outbox item is cancelled and will not be retried automatically."
  };
}

function listOutboxRecords() {
  const outboxState = readWifiDataOutboxState();
  return Array.isArray(outboxState.outbox) ? outboxState.outbox : [];
}

function buildBlockedOutboxReport(message, packageId = null) {
  return buildBlockedOutboxRetryReport(message, packageId);
}

module.exports = {
  wifiDataOutbox,
  buildOutboxReport,
  buildOutboxItemReport,
  cancelOutboxPackage,
  listOutboxRecords,
  buildBlockedOutboxReport
};
