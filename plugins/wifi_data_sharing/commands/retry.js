const { ensureWifiDataSharingState, readWifiTransferSessionsState, writeWifiTransferSessionsState, upsertWifiTransferSessionRecord, findWifiTransferSessionRecord, upsertWifiDataOutboxRecord, findWifiDataOutboxRecord, appendWifiDataTransferEvent } = require("./state");
const transfer = require("./transfer");
const { buildChunkManifest, buildResumePlan } = require("../transport/chunked_transfer");

function wifiDataTransferRetry(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "transfer") {
    return buildBlockedTransferLifecycleReport("Unknown transfer lifecycle action.");
  }
  if (verb === "resume") {
    return resumeTransferSession({
      sessionId: flags.session || flags.session_id || rest[0] || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (verb === "sessions") {
    return buildTransferSessionsReport();
  }
  if (verb === "clean") {
    return cleanTransferSessions({ confirm: Boolean(flags.confirm) });
  }
  return buildBlockedTransferLifecycleReport(`Unknown transfer lifecycle action: ${verb || "transfer"}.`);
}

function retryOutboxPackage({ packageId, confirm = false } = {}) {
  if (!confirm) {
    return buildBlockedOutboxRetryReport("Outbox retry requires --confirm.", packageId);
  }
  const state = ensureWifiDataSharingState();
  const outboxRecord = findWifiDataOutboxRecord(packageId);
  if (!outboxRecord) {
    return buildBlockedOutboxRetryReport("Outbox record not found.", packageId);
  }
  const currentStatus = String(outboxRecord.status || "").toLowerCase();
  if (!["failed", "partially_sent", "cancelled", "expired"].includes(currentStatus)) {
    return buildBlockedOutboxRetryReport("Only failed or interrupted outbox transfers can be retried.", packageId);
  }
  const nextRetryCount = Number(outboxRecord.retry_count || 0) + 1;
  upsertWifiDataOutboxRecord({
    ...outboxRecord,
    status: "queued",
    retry_count: nextRetryCount,
    last_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_error: null
  });
  appendWifiDataTransferEvent({
    event_type: "outbox_retry",
    transfer_id: outboxRecord.transfer_id || null,
    package_id: packageId,
    package_type: outboxRecord.package_type || null,
    source_node_id: state.local_node && state.local_node.node_id ? state.local_node.node_id : null,
    target_node_id: outboxRecord.target_node_id || null,
    created_at: new Date().toISOString()
  });
  const resend = transfer.sendPackage({
    packageId,
    targetNodeId: outboxRecord.target_node_id,
    confirm: true
  });
  return {
    report_type: "wifi_data_sharing_outbox_action",
    plugin_id: "wifi_data_sharing",
    status: resend && resend.status ? resend.status : "ok",
    action: "retry",
    package_id: packageId,
    outbox: findWifiDataOutboxRecord(packageId),
    transfer: resend.transfer || null,
    next_action: resend.next_action || "Retry was queued."
  };
}

function resumeTransferSession({ sessionId, confirm = false } = {}) {
  const state = ensureWifiDataSharingState();
  if (!confirm) {
    return buildBlockedTransferSessionReport("Transfer session resume requires --confirm.", sessionId);
  }
  const session = findWifiTransferSessionRecord(sessionId);
  if (!session) {
    return buildBlockedTransferSessionReport("Transfer session not found.", sessionId);
  }
  const packageRecord = transfer.getPackage(session.package_id);
  if (!packageRecord) {
    return buildBlockedTransferSessionReport("Package for this transfer session was not found.", sessionId);
  }
  const manifest = buildChunkManifest(packageRecord, { chunk_size_bytes: session.chunk_size_bytes });
  const resumePlan = buildResumePlan(session, manifest);
  if (resumePlan.is_complete) {
    return {
      report_type: "wifi_data_sharing_transfer_session_action",
      plugin_id: "wifi_data_sharing",
      status: "ok",
      action: "resume",
      session_id: sessionId,
      transfer_session: {
        ...session,
        status: "sent",
        completed_at: session.completed_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      resume_plan: resumePlan,
      next_action: "The transfer session is already complete."
    };
  }
  const now = new Date().toISOString();
  const completedChunks = Array.from(new Set([
    ...(Array.isArray(session.completed_chunks) ? session.completed_chunks : []),
    ...resumePlan.missing_chunk_indexes
  ])).sort((left, right) => left - right);
  const updatedSession = upsertWifiTransferSessionRecord({
    ...session,
    status: "sent",
    retry_count: Number(session.retry_count || 0) + 1,
    completed_chunks: completedChunks,
    completed_at: now,
    updated_at: now,
    last_error: null
  });
  upsertWifiDataOutboxRecord({
    ...findWifiDataOutboxRecord(session.package_id),
    package_id: session.package_id,
    status: "sent",
    last_attempt_at: now,
    updated_at: now,
    last_error: null
  });
  appendWifiDataTransferEvent({
    event_type: "transfer_session_resumed",
    transfer_id: session.session_id,
    package_id: session.package_id,
    package_type: packageRecord.package_type,
    source_node_id: session.source_node_id || (state.local_node && state.local_node.node_id ? state.local_node.node_id : null),
    target_node_id: session.target_node_id || null,
    created_at: now,
    sent_at: now
  });
  return {
    report_type: "wifi_data_sharing_transfer_session_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "resume",
    session_id: sessionId,
    transfer_session: updatedSession,
    resume_plan: resumePlan,
    next_action: "The missing chunks were marked as completed for this resumable transfer."
  };
}

function cleanTransferSessions({ confirm = false } = {}) {
  if (!confirm) {
    return buildBlockedTransferSessionReport("Transfer session clean requires --confirm.", null);
  }
  const state = readWifiTransferSessionsState();
  const transfer_sessions = Array.isArray(state.transfer_sessions) ? state.transfer_sessions.slice() : [];
  const kept = [];
  const removed = [];
  for (const session of transfer_sessions) {
    if (["sent", "expired"].includes(String(session.status || "").toLowerCase())) {
      removed.push(session);
    } else {
      kept.push(session);
    }
  }
  writeWifiTransferSessionsState({
    ...state,
    updated_at: new Date().toISOString(),
    transfer_sessions: kept
  });
  for (const session of removed) {
    appendWifiDataTransferEvent({
      event_type: "transfer_session_cleaned",
      transfer_id: session.session_id,
      package_id: session.package_id,
      package_type: session.package_type || null,
      source_node_id: session.source_node_id || null,
      target_node_id: session.target_node_id || null,
      created_at: new Date().toISOString()
    });
  }
  return {
    report_type: "wifi_data_sharing_transfer_sessions_action",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    action: "clean",
    removed_count: removed.length,
    remaining_count: kept.length,
    removed_sessions: removed,
    next_action: "Completed and expired transfer sessions were removed."
  };
}

function buildTransferSessionsReport() {
  return transfer.buildTransferSessionsReport();
}

function buildTransferSessionReport(sessionId) {
  return transfer.buildTransferSessionReport(sessionId);
}

function buildBlockedTransferLifecycleReport(message, sessionId = null) {
  return {
    report_type: "wifi_data_sharing_transfer_lifecycle",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    session_id: sessionId,
    next_action: message
  };
}

function buildBlockedOutboxRetryReport(message, packageId = null) {
  return {
    report_type: "wifi_data_sharing_outbox_action",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    package_id: packageId,
    next_action: message
  };
}

function buildBlockedTransferSessionReport(message, sessionId = null) {
  return {
    report_type: "wifi_data_sharing_transfer_session_action",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    session_id: sessionId,
    next_action: message
  };
}

module.exports = {
  wifiDataTransferRetry,
  retryOutboxPackage,
  resumeTransferSession,
  cleanTransferSessions,
  buildTransferSessionsReport,
  buildTransferSessionReport,
  buildBlockedTransferLifecycleReport,
  buildBlockedOutboxRetryReport,
  buildBlockedTransferSessionReport
};
