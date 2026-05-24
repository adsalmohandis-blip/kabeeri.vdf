const {
  runTwoNodeSimulation,
  runSecuritySimulation,
  runTransferStressSimulation,
  DEFAULT_STRESS_SIZES
} = require("../simulation/two_node_harness");

function wifiDataSharingSimulate(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "simulate") {
    return buildBlockedSimulationReport("Unknown simulation action.");
  }
  if (!verb || verb === "two-node" || verb === "twonode" || verb === "two_node") {
    const report = buildTwoNodeSimulationReport({ keep: Boolean(flags.keep) });
    outputReport(report, flags);
    return report;
  }
  if (verb === "transfer") {
    const sizeBytes = Number(flags.size || flags.bytes || rest[0] || DEFAULT_STRESS_SIZES[0]);
    const report = buildTransferStressReport({ sizeBytes, keep: Boolean(flags.keep) });
    outputReport(report, flags);
    return report;
  }
  if (verb === "security") {
    const report = buildSecuritySimulationReport({ keep: Boolean(flags.keep) });
    outputReport(report, flags);
    return report;
  }
  return buildBlockedSimulationReport(`Unknown simulation action: ${verb}.`);
}

function buildTwoNodeSimulationReport(options = {}) {
  const report = runTwoNodeSimulation(options);
  report.report_type = "wifi_data_sharing_two_node_simulation";
  return report;
}

function buildWifiDataSharingSimulationReport(options = {}) {
  return buildTwoNodeSimulationReport(options);
}

function buildTransferStressReport(options = {}) {
  const report = runTransferStressSimulation(options);
  report.report_type = "wifi_data_sharing_transfer_stress";
  return report;
}

function buildSecuritySimulationReport(options = {}) {
  const report = runSecuritySimulation(options);
  report.report_type = "wifi_data_sharing_security_simulation";
  return report;
}

function renderSimulationReport(report) {
  if (!report) return "Wi-Fi Data Sharing Simulation\nStatus: blocked";
  const lines = [
    report.report_type === "wifi_data_sharing_transfer_stress"
      ? "Wi-Fi Data Sharing Transfer Stress Simulation"
      : report.report_type === "wifi_data_sharing_security_simulation"
        ? "Wi-Fi Data Sharing Security Simulation"
        : "Wi-Fi Data Sharing Two-Node Simulation",
    `Status: ${report.status}`,
    `Cleanup: ${report.cleanup || "completed"}`,
    ...(report.size_bytes ? [`Payload size: ${report.size_bytes} bytes`] : []),
    ...(Array.isArray(report.steps) && report.steps.length
      ? ["Steps:", ...report.steps.map((step) => `- ${step.step_id}: ${step.status} - ${step.message}`)]
      : []),
    ...(Array.isArray(report.warnings) && report.warnings.length
      ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)]
      : []),
    ...(Array.isArray(report.blockers) && report.blockers.length
      ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)]
      : []),
    report.next_action ? `Next: ${report.next_action}` : null
  ].filter(Boolean);
  if (report.report_type === "wifi_data_sharing_transfer_stress") {
    lines.push(`Temp paths: ${(report.temp_paths || []).length}`);
    if (report.manifest) {
      lines.push(`Chunks: ${report.manifest.total_chunks}`);
      lines.push(`Transfer mode: ${report.manifest.transfer_mode}`);
    }
  }
  if (report.report_type === "wifi_data_sharing_security_simulation" && report.security) {
    lines.push(`Security status: ${report.security.status || "unknown"}`);
  }
  return lines.join("\n");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderSimulationReport(report));
}

function buildBlockedSimulationReport(message) {
  return {
    report_type: "wifi_data_sharing_two_node_simulation",
    status: "fail",
    generated_at: new Date().toISOString(),
    steps: [],
    blockers: [message],
    warnings: [],
    temp_paths: [],
    cleanup: "failed",
    next_action: message
  };
}

module.exports = {
  wifiDataSharingSimulate,
  buildWifiDataSharingSimulationReport,
  buildTwoNodeSimulationReport,
  buildTransferStressReport,
  buildSecuritySimulationReport,
  renderSimulationReport,
  buildBlockedSimulationReport
};
