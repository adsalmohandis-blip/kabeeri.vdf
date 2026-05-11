const { ensureWorkspace } = require("../workspace");

function reports(action, value, flags = {}, deps = {}) {
  const { refreshLiveReportsState, renderLiveReportsState, outputLines } = deps;
  ensureWorkspace();
  const selected = action || "live";
  if (["live", "refresh", "state", "status"].includes(selected)) {
    const state = refreshLiveReportsState();
    if (flags.json || selected === "state") {
      console.log(JSON.stringify(state, null, 2));
      return;
    }
    return outputLines(renderLiveReportsState(state), flags.output);
  }
  if (selected === "show") {
    const state = refreshLiveReportsState();
    const reportName = value || flags.report;
    if (!reportName) throw new Error("Missing report name. Use readiness, governance, package, upgrade, task_tracker, dashboard_ux, evolution, security, or migration.");
    const report = state.reports[reportName];
    if (!report) throw new Error(`Unknown live report: ${reportName}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  throw new Error(`Unknown reports action: ${selected}`);
}

module.exports = {
  reports
};
