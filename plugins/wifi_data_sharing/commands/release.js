const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const state = require("./state");
const OPTIONAL_MULTI_AI_PACKET_FILE = path.join(state.repoRoot(), ".kabeeri", "multi_ai_wifi_packets.json");

function wifiDataSharingRelease(action, value, flags = {}, rest = []) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const normalizedValue = String(value || "").trim().toLowerCase();
  void rest;

  if (!["release", "integrity"].includes(normalizedAction)) {
    throw new Error(`Unknown wifi-data-sharing release action: ${action}`);
  }

  if (normalizedAction === "integrity" || normalizedValue === "check") {
    const report = buildIntegrityReport();
    outputReport(report, flags);
    return report;
  }

  const report = buildReleaseReport();
  outputReport(report, flags);
  return report;
}

function buildReleaseReport() {
  const current = state.ensureWifiDataSharingState();
  const integrity = buildIntegrityReport();
  const backups = state.listWifiDataBackups();
  const applied = state.readWifiDataAppliedState();
  const packetsBridge = readMultiAiWifiPacketsState();
  const checks = [];
  const blockers = [];
  const warnings = [];

  addCheck(checks, "state_file_present", fs.existsSync(state.getStateFile()), "fail", "wifi_data_sharing state file exists.");
  addCheck(checks, "local_node_initialized", Boolean(current.local_node && current.local_node.node_id), "fail", "Local node is initialized.");
  addCheck(checks, "state_version_supported", String(current.version || "").trim() === "v1", "fail", "State version is v1.");
  addCheck(checks, "integrity_report_available", Boolean(integrity), "warn", "An integrity report could be generated.");
  addCheck(checks, "integrity_report_ok", integrity.status === "ok", "fail", "Integrity report is clean.");
  addCheck(checks, "backup_available", backups.length > 0, "warn", "At least one backup exists.");
  addCheck(checks, "apply_bridge_available", Array.isArray(applied.applied), "warn", "Apply bridge state is available.");
  addCheck(checks, "multi_ai_packet_state_visible", !packetsBridge.parse_error, "warn", "multi_ai packet bridge state is readable when present.");

  collectIssues(checks, blockers, warnings);

  const status = blockers.length ? "blocked" : warnings.length ? "partial" : "ready";
  const report = {
    report_type: "wifi_data_sharing_release_report",
    plugin_id: "wifi_data_sharing",
    version: "v1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status,
    checks,
    blockers,
    warnings,
    summary: {
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id),
      backup_count: backups.length,
      applied_count: Array.isArray(applied.applied) ? applied.applied.length : 0,
      integrity_status: integrity.status,
      integrity_checked_at: integrity.generated_at || null,
      bridge_packet_count: Array.isArray(packetsBridge.packets) ? packetsBridge.packets.length : 0
    },
    integrity,
    backups: backups.slice(0, 10),
    next_action: buildReleaseNextAction(status, blockers, warnings, backups)
  };
  state.writeWifiDataReleaseReport(report);
  return report;
}

function buildIntegrityReport({ persist = true } = {}) {
  const current = state.ensureWifiDataSharingState();
  const files = buildIntegrityFileList();
  const checkedFiles = [];
  const blockers = [];
  const warnings = [];
  for (const item of files) {
    const exists = fs.existsSync(item.path);
    if (!exists) {
      if (item.required) blockers.push(`${item.label} is missing.`);
      else warnings.push(`${item.label} is missing.`);
      checkedFiles.push({
        label: item.label,
        path: item.path,
        required: item.required,
        exists: false,
        bytes: 0,
        sha256: null
      });
      continue;
    }
    const raw = fs.readFileSync(item.path);
    checkedFiles.push({
      label: item.label,
      path: item.path,
      required: item.required,
      exists: true,
      bytes: raw.length,
      sha256: sha256(raw)
    });
  }
  if (!current.local_node || !current.local_node.node_id) {
    warnings.push("Local node is not initialized.");
  }
  const status = blockers.length ? "blocked" : warnings.length ? "partial" : "ok";
  const report = {
    report_type: "wifi_data_sharing_integrity",
    plugin_id: "wifi_data_sharing",
    version: "v1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status,
    checks: checkedFiles,
    blockers,
    warnings,
    summary: {
      checked_count: checkedFiles.length,
      present_count: checkedFiles.filter((item) => item.exists).length,
      missing_count: checkedFiles.filter((item) => !item.exists).length,
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id)
    },
    next_action: buildIntegrityNextAction(status, blockers, warnings)
  };
  if (persist) {
    state.writeWifiDataIntegrityReport(report);
  }
  return report;
}

function buildIntegrityFileList() {
  return [
    { label: "wifi_data_sharing state", path: state.getStateFile(), required: true },
    { label: "packages", path: state.getPackagesFile(), required: true },
    { label: "inbox", path: state.getInboxFile(), required: true },
    { label: "outbox", path: state.getOutboxFile(), required: true },
    { label: "transfer sessions", path: state.getTransferSessionsFile(), required: true },
    { label: "transfer policy results", path: state.getTransferPolicyResultsFile(), required: true },
    { label: "quarantine", path: state.getQuarantineFile(), required: true },
    { label: "applied bridge", path: state.getAppliedFile(), required: false },
    { label: "apply events", path: state.getApplyEventsFile(), required: false },
    { label: "discovery log", path: state.getDiscoveryLogFile(), required: false },
    { label: "pairing log", path: state.getPairingLogFile(), required: false },
    { label: "transfer log", path: state.getTransferLogFile(), required: false },
    { label: "release report", path: state.getReleaseReportFile(), required: false },
    { label: "integrity report", path: state.getIntegrityFile(), required: false },
    { label: "multi_ai wifi packets", path: OPTIONAL_MULTI_AI_PACKET_FILE, required: false }
  ];
}

function buildReleaseNextAction(status, blockers, warnings, backups) {
  if (status === "blocked") {
    return blockers[0] || "Resolve blockers before considering release readiness.";
  }
  if (!backups.length) {
    return "Create a backup before releasing this plugin state.";
  }
  if (warnings.length) {
    return warnings[0];
  }
  return "The plugin is release-ready. Use backup and integrity reports to validate local state before shipping changes.";
}

function buildIntegrityNextAction(status, blockers, warnings) {
  if (status === "blocked") {
    return blockers[0] || "Restore the missing runtime files.";
  }
  if (warnings.length) {
    return warnings[0];
  }
  return "Integrity is clean. You can create a backup or run the release report next.";
}

function collectIssues(checks, blockers, warnings) {
  for (const check of checks) {
    if (check.status === "fail" || check.status === "blocked") blockers.push(check.message);
    if (check.status === "warn") warnings.push(check.message);
  }
}

function addCheck(checks, checkId, condition, failSeverity, message) {
  checks.push({
    check_id: checkId,
    status: condition ? "pass" : failSeverity === "warn" ? "warn" : "fail",
    message
  });
}

function readMultiAiWifiPacketsState() {
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

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function renderReleaseText(report) {
  if (!report) return "";
  if (report.report_type === "wifi_data_sharing_integrity") {
    return [
      "Wi-Fi Data Sharing Integrity",
      `Status: ${report.status}`,
      `Checked: ${report.summary.checked_count}`,
      `Present: ${report.summary.present_count}`,
      `Missing: ${report.summary.missing_count}`,
      ...(report.blockers.length ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)] : []),
      ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
      `Next: ${report.next_action}`
    ].join("\n");
  }
  return [
    "Wi-Fi Data Sharing Release Report",
    `Status: ${report.status}`,
    `Backups: ${report.summary.backup_count}`,
    `Applied records: ${report.summary.applied_count}`,
    `Integrity status: ${report.summary.integrity_status}`,
    ...(report.blockers.length ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)] : []),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    `Next: ${report.next_action}`
  ].join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderReleaseText(report));
}

module.exports = {
  wifiDataSharingRelease,
  buildReleaseReport,
  buildIntegrityReport,
  renderReleaseText,
  getMultiAiWifiPacketsFile
};
