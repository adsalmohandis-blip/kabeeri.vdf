const provider = require("../provider");

function wifiDataSharingProvider(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = provider.buildProviderReport({ limit: flags.limit });
  outputReport(report, flags);
  return report;
}

function buildProviderReport(options = {}) {
  return provider.buildProviderReport(options);
}

function renderProviderText(report) {
  return [
    "Wi-Fi Data Sharing Provider",
    `Status: ${report.status}`,
    `Local node: ${report.local_node && report.local_node.node_id ? report.local_node.node_id : "uninitialized"}`,
    `Candidates: ${report.summary.candidates_count}`,
    `Trusted nodes: ${report.summary.trusted_nodes_count}`,
    `Revoked nodes: ${report.summary.revoked_nodes_count}`,
    `Packages: ${report.summary.packages_count}`,
    `Inbox: ${report.summary.inbox_count}`,
    `Quarantine: ${report.summary.quarantine_count}`,
    `Transfers: ${report.summary.transfers_count}`,
    `Integration: ${report.integration_status && report.integration_status.status ? report.integration_status.status : "unknown"}`,
    `Next action: ${report.next_action}`
  ].join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderProviderText(report));
}

module.exports = {
  wifiDataSharingProvider,
  buildProviderReport,
  renderProviderText
};
