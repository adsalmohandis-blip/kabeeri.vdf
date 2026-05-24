const provider = require("../provider");

function wifiDataSharingReadiness(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = provider.buildReadinessReport();
  outputReport(report, flags);
  return report;
}

function buildReadinessReport() {
  return provider.buildReadinessReport();
}

function renderReadinessText(report) {
  return [
    "Wi-Fi Data Sharing Readiness",
    `Status: ${report.status}`,
    ...report.checks.map((check) => `- ${check.check_id}: ${check.status} - ${check.message}`),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    ...(report.blockers.length ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)] : []),
    `Next action: ${report.next_action}`
  ].join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderReadinessText(report));
}

module.exports = {
  wifiDataSharingReadiness,
  buildReadinessReport,
  renderReadinessText
};
