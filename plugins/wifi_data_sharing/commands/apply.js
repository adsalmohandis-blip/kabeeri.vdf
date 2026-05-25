const fs = require("fs");
const path = require("path");

const state = require("./state");

function wifiDataSharingApply(action, value, flags = {}, rest = []) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const normalizedValue = String(value || "").trim().toLowerCase();
  void rest;

  if (normalizedAction !== "apply") {
    throw new Error(`Unknown wifi-data-sharing apply action: ${action}`);
  }

  if (!normalizedValue || normalizedValue === "apply" || normalizedValue === "create") {
    const report = buildApplyReport({
      packageId: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      confirm: Boolean(flags.confirm),
      approvedBy: flags.by || flags.approved_by || flags.actor || null,
      reason: flags.reason || flags.note || null
    });
    outputReport(report, flags);
    return report;
  }

  if (normalizedValue === "show") {
    const report = buildAppliedItemReport(flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null);
    outputReport(report, flags);
    return report;
  }

  if (normalizedValue === "reject" || normalizedValue === "cancel") {
    const report = buildApplyActionReport({
      action: normalizedValue,
      packageId: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      confirm: Boolean(flags.confirm),
      reason: flags.reason || flags.note || rest.slice(1).join(" ") || null
    });
    outputReport(report, flags);
    return report;
  }

  const report = buildAppliedReport();
  outputReport(report, flags);
  return report;
}

function buildApplyReport({ packageId, confirm = false, approvedBy = null, reason = null } = {}) {
  if (!confirm) {
    return buildBlockedReport("Packet apply requires --confirm.", "apply", "Use `kvdf wifi-data-sharing apply --package <packet-id> --confirm` to record the explicit apply bridge.");
  }

  const packetState = readMultiAiWifiPacketState();
  const packet = findPacketRecord(packetState, packageId);
  if (!packet) {
    return buildBlockedReport("Approved packet not found.", "apply", "Consume the packet with `--decision approve` first, then retry apply.");
  }

  const packetDecision = packet.application_decision && packet.application_decision.decision
    ? String(packet.application_decision.decision).trim().toLowerCase()
    : packet.status === "approved"
      ? "approved"
      : null;
  if (packetDecision !== "approved") {
    return buildBlockedReport(
      "Packet must already be approved before apply.",
      "apply",
      "Run `kvdf multi-ai wifi packet consume <package-id> --confirm --decision approve` first."
    );
  }

  const existing = state.findWifiDataAppliedRecord(packet.packet_id || packet.package_id || packageId);
  if (existing && String(existing.status || "").toLowerCase() === "applied") {
    return {
      report_type: "wifi_data_sharing_apply",
      plugin_id: "wifi_data_sharing",
      generated_at: new Date().toISOString(),
      status: "ok",
      applied_record: existing,
      packet,
      next_action: "The packet was already applied. Use show or applied to review the bridge record."
    };
  }

  const now = new Date().toISOString();
  const applyRecord = {
    apply_id: buildNextApplyId(),
    plugin_id: "wifi_data_sharing",
    source_type: "multi_ai_governance_packet",
    packet_id: packet.packet_id || packageId,
    package_id: packet.package_id || null,
    packet_type: packet.packet_type || null,
    queue_id: packet.queue_id || null,
    assignment_id: packet.assignment_id || null,
    leader_session_id: packet.leader_session_id || null,
    target_plugin: packet.target_plugin || "multi_ai_governance",
    authority_model: "multi_ai_governance",
    status: "applied",
    applied_at: now,
    applied_by: String(approvedBy || packet.application_decision && packet.application_decision.decided_by || "owner").trim() || "owner",
    approved_by: packet.application_decision && packet.application_decision.decided_by ? packet.application_decision.decided_by : null,
    decision: "approved",
    decision_reason: reason || packet.application_decision && packet.application_decision.reason || null,
    bridge_applied: true,
    bridge_target: "wifi_data_sharing",
    bridge_scope: "explicit_apply_bridge",
    source_packet_status: packet.status || null,
    source_packet_decision: packetDecision,
    source_packet_updated_at: packet.updated_at || packet.consumed_at || packet.approved_at || null,
    created_at: now,
    updated_at: now
  };

  state.upsertWifiDataAppliedRecord(applyRecord);
  state.appendWifiDataApplyEvent({
    event_type: "wifi_data_apply_applied",
    apply_id: applyRecord.apply_id,
    packet_id: applyRecord.packet_id,
    package_id: applyRecord.package_id,
    status: applyRecord.status,
    decision: applyRecord.decision,
    reason: applyRecord.decision_reason || null,
    applied_at: now,
    applied_by: applyRecord.applied_by,
    authority_model: "multi_ai_governance"
  });

  return {
    report_type: "wifi_data_sharing_apply",
    plugin_id: "wifi_data_sharing",
    generated_at: now,
    status: "ok",
    applied_record: applyRecord,
    packet,
    next_action: "The packet was explicitly applied to the plugin-owned bridge record only. multi_ai_governance was not mutated."
  };
}

function buildAppliedReport() {
  const appliedState = state.readWifiDataAppliedState();
  const applied = Array.isArray(appliedState.applied) ? appliedState.applied.slice() : [];
  const counts = {
    total: applied.length,
    applied: applied.filter((item) => item.status === "applied").length,
    rejected: applied.filter((item) => item.status === "rejected").length,
    cancelled: applied.filter((item) => item.status === "cancelled").length
  };
  return {
    report_type: "wifi_data_sharing_applied",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: applied.length ? "ok" : "empty",
    counts,
    applied: applied.slice(-20).reverse(),
    next_action: applied.length
      ? "Use `kvdf wifi-data-sharing apply show <id>` to inspect a bridge record or `apply reject/cancel` to update it explicitly."
      : "Use `kvdf wifi-data-sharing apply --package <packet-id> --confirm` after an approved multi-AI packet is ready."
  };
}

function buildAppliedItemReport(packageId) {
  const appliedRecord = state.findWifiDataAppliedRecord(packageId);
  if (!appliedRecord) {
    return buildBlockedReport("Applied record not found.", "show", "Use `kvdf wifi-data-sharing applied` to list bridge records.");
  }
  return {
    report_type: "wifi_data_sharing_applied_item",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: "ok",
    applied_record: appliedRecord,
    next_action: "The bridge record is local evidence only. It does not change multi_ai_governance state."
  };
}

function buildApplyActionReport({ action, packageId, confirm = false, reason = null } = {}) {
  if (!confirm) {
    return buildBlockedReport(`Packet apply ${action} requires --confirm.`, action, "Use `--confirm` to modify the bridge record.");
  }
  const appliedRecord = state.findWifiDataAppliedRecord(packageId);
  if (!appliedRecord) {
    return buildBlockedReport("Applied record not found.", action, "Use `kvdf wifi-data-sharing applied` to find the bridge record first.");
  }
  const now = new Date().toISOString();
  const status = action === "reject" ? "rejected" : "cancelled";
  const nextRecord = {
    ...appliedRecord,
    status,
    updated_at: now,
    ...(action === "reject"
      ? {
          rejected_at: now,
          rejection_reason: reason || null
        }
      : {
          cancelled_at: now,
          cancel_reason: reason || null
        })
  };
  state.upsertWifiDataAppliedRecord(nextRecord);
  state.appendWifiDataApplyEvent({
    event_type: action === "reject" ? "wifi_data_apply_rejected" : "wifi_data_apply_cancelled",
    apply_id: nextRecord.apply_id,
    packet_id: nextRecord.packet_id,
    package_id: nextRecord.package_id,
    status,
    reason: reason || null,
    updated_at: now
  });
  return {
    report_type: "wifi_data_sharing_apply_action",
    plugin_id: "wifi_data_sharing",
    action,
    generated_at: now,
    status: "ok",
    applied_record: nextRecord,
    package_id: nextRecord.package_id || nextRecord.packet_id || null,
    reason: reason || null,
    next_action: action === "reject"
      ? "The bridge record was explicitly rejected. No automatic governance mutation occurred."
      : "The bridge record was explicitly cancelled. No automatic governance mutation occurred."
  };
}

function buildBlockedReport(message, action, nextAction) {
  return {
    report_type: "wifi_data_sharing_apply_blocked",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: "blocked",
    action,
    message,
    next_action: nextAction || "No bridge mutation was performed."
  };
}

function readMultiAiWifiPacketState() {
  const file = getMultiAiWifiPacketsFile();
  if (!fs.existsSync(file)) {
    return { packets: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : { packets: [] };
  } catch (error) {
    return { packets: [], parse_error: error.message };
  }
}

function getMultiAiWifiPacketsFile() {
  return path.join(state.repoRoot(), ".kabeeri", "multi_ai_wifi_packets.json");
}

function findPacketRecord(packetState, packageId) {
  const id = String(packageId || "").trim();
  if (!id) return null;
  const packets = Array.isArray(packetState && packetState.packets) ? packetState.packets : [];
  return packets.find((item) => item.packet_id === id || item.package_id === id) || null;
}

function buildNextApplyId() {
  const current = state.readWifiDataAppliedState();
  const applied = Array.isArray(current.applied) ? current.applied : [];
  return `wifi-apply-${String(applied.length + 1).padStart(3, "0")}`;
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderApplyText(report));
}

function renderApplyText(report) {
  if (!report) return "";
  if (report.report_type === "wifi_data_sharing_apply") {
    return [
      "Wi-Fi Data Sharing Apply",
      `Status: ${report.status}`,
      report.applied_record ? `Apply ID: ${report.applied_record.apply_id}` : null,
      report.packet ? `Packet: ${report.packet.packet_id || report.packet.package_id || "unknown"}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "wifi_data_sharing_applied") {
    const applied = Array.isArray(report.applied) ? report.applied : [];
    return [
      "Wi-Fi Data Sharing Applied Records",
      `Total: ${report.counts.total}`,
      `Applied: ${report.counts.applied}`,
      `Rejected: ${report.counts.rejected}`,
      `Cancelled: ${report.counts.cancelled}`,
      ...applied.map((item) => `- ${item.apply_id} (${item.status}) ${item.packet_id || item.package_id || ""}`.trim()),
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "wifi_data_sharing_applied_item") {
    return [
      "Wi-Fi Data Sharing Applied Record",
      `Status: ${report.status}`,
      report.applied_record ? `Apply ID: ${report.applied_record.apply_id}` : null,
      report.applied_record ? `Packet: ${report.applied_record.packet_id || report.applied_record.package_id || "unknown"}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "wifi_data_sharing_apply_action") {
    return [
      `Wi-Fi Data Sharing Apply ${String(report.action || "").toUpperCase()}`,
      `Status: ${report.status}`,
      report.applied_record ? `Apply ID: ${report.applied_record.apply_id}` : null,
      report.reason ? `Reason: ${report.reason}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "wifi_data_sharing_apply_blocked") {
    return [
      "Wi-Fi Data Sharing Apply",
      `Status: ${report.status}`,
      report.message ? `Message: ${report.message}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  return JSON.stringify(report, null, 2);
}

module.exports = {
  wifiDataSharingApply,
  buildApplyReport,
  buildAppliedReport,
  buildAppliedItemReport,
  buildApplyActionReport,
  renderApplyText,
  getMultiAiWifiPacketsFile
};
