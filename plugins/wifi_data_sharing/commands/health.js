const fs = require("fs");

const state = require("./state");
const release = require("./release");

function wifiDataSharingHealth(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = buildHealthReport();
  outputReport(report, flags);
  return report;
}

function buildHealthReport() {
  const current = state.ensureWifiDataSharingState();
  const releaseReport = state.readWifiDataReleaseReport();
  const integrityReport = state.readWifiDataIntegrityReport();
  const backups = state.listWifiDataBackups();
  const releaseInfo = releaseReport && releaseReport.report ? releaseReport.report : null;
  const integrityInfo = integrityReport && integrityReport.report ? integrityReport.report : null;
  const checks = [];
  const blockers = [];
  const warnings = [];

  addCheck(checks, "state_file_present", fs.existsSync(state.getStateFile()), "fail", "wifi_data_sharing state file exists.");
  addCheck(checks, "local_node_initialized", Boolean(current.local_node && current.local_node.node_id), "fail", "Local node is initialized.");
  addCheck(checks, "integrity_report_available", Boolean(integrityInfo), "warn", "An integrity report is available.");
  addCheck(checks, "integrity_status_ok", Boolean(integrityInfo && integrityInfo.status === "ok"), "warn", "Integrity report status is ok.");
  addCheck(checks, "release_report_available", Boolean(releaseInfo), "warn", "A release readiness report is available.");
  addCheck(checks, "release_status_ready", Boolean(releaseInfo && releaseInfo.status === "ready"), "warn", "Release readiness report is ready.");
  addCheck(checks, "backup_available", backups.length > 0, "warn", "At least one backup exists.");

  collectIssues(checks, blockers, warnings);
  const status = blockers.length ? "blocked" : warnings.length ? "partial" : "ready";

  return {
    report_type: "wifi_data_sharing_health",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status,
    checks,
    blockers,
    warnings,
    summary: {
      local_node_initialized: Boolean(current.local_node && current.local_node.node_id),
      backup_count: backups.length,
      release_status: releaseInfo ? releaseInfo.status : "missing",
      integrity_status: integrityInfo ? integrityInfo.status : "missing"
    },
    next_action: buildNextAction(status, blockers, warnings, backups, releaseInfo, integrityInfo)
  };
}

function buildNextAction(status, blockers, warnings, backups, releaseInfo, integrityInfo) {
  if (status === "blocked") {
    return blockers[0] || "Resolve the blocked health check first.";
  }
  if (!backups.length) {
    return "Create a backup before shipping release changes.";
  }
  if (!integrityInfo || integrityInfo.status !== "ok") {
    return "Run an integrity check to confirm runtime files are healthy.";
  }
  if (!releaseInfo || releaseInfo.status !== "ready") {
    return "Run the release report to verify readiness.";
  }
  if (warnings.length) {
    return warnings[0];
  }
  return "Health is good. The plugin is ready for release-oriented checks.";
}

function addCheck(checks, checkId, condition, failSeverity, message) {
  checks.push({
    check_id: checkId,
    status: condition ? "pass" : failSeverity === "warn" ? "warn" : "fail",
    message
  });
}

function collectIssues(checks, blockers, warnings) {
  for (const check of checks) {
    if (check.status === "fail" || check.status === "blocked") blockers.push(check.message);
    if (check.status === "warn") warnings.push(check.message);
  }
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderHealthText(report));
}

function renderHealthText(report) {
  return [
    "Wi-Fi Data Sharing Health",
    `Status: ${report.status}`,
    `Backups: ${report.summary.backup_count}`,
    `Release status: ${report.summary.release_status}`,
    `Integrity status: ${report.summary.integrity_status}`,
    ...(report.blockers.length ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)] : []),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    `Next: ${report.next_action}`
  ].join("\n");
}

module.exports = {
  wifiDataSharingHealth,
  buildHealthReport,
  renderHealthText
};
