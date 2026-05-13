const { ensureWorkspace } = require("../workspace");

const BLOCKED_SCENARIOS_FILE = ".kabeeri/reports/blocked_scenarios_report.json";

function reports(action, value, flags = {}, deps = {}) {
  const { refreshLiveReportsState, renderLiveReportsState, outputLines, writeJsonFile = () => {} } = deps;
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
  if (["blocked", "blockers"].includes(selected)) {
    const state = refreshLiveReportsState();
    const report = state.blocked_scenarios || buildBlockedScenariosFromLiveState(state);
    writeJsonFile(BLOCKED_SCENARIOS_FILE, report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderBlockedScenariosReport(report));
    return;
  }
  if (selected === "show") {
    const state = refreshLiveReportsState();
    const reportName = value || flags.report;
    if (!reportName) throw new Error("Missing report name. Use readiness, governance, package, upgrade, task_tracker, dashboard_ux, evolution, security, migration, or blocked_scenarios.");
    const report = state.reports[reportName];
    if (!report) throw new Error(`Unknown live report: ${reportName}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  throw new Error(`Unknown reports action: ${selected}`);
}

function buildBlockedScenariosFromLiveState(state) {
  const report = state && state.blocked_scenarios ? state.blocked_scenarios : null;
  if (report) return report;
  return {
    report_type: "blocked_scenarios_report",
    generated_at: state.generated_at || new Date().toISOString(),
    source: state.source || ".kabeeri",
    summary: { blockers: 0, warnings: 0, total: 0, status: "clear" },
    blockers: [],
    warnings: [],
    next_actions: ["No blocked scenarios recorded."]
  };
}

function renderBlockedScenariosReport(report) {
  return [
    "Blocked Scenarios Report",
    "",
    `Generated at: ${report.generated_at || "unknown"}`,
    `Status: ${report.summary && report.summary.status ? report.summary.status : "clear"}`,
    `Blockers: ${report.summary ? report.summary.blockers || 0 : 0}`,
    `Warnings: ${report.summary ? report.summary.warnings || 0 : 0}`,
    "",
    "Blockers:",
    ...(report.blockers && report.blockers.length ? report.blockers.map((item) => `- ${item.area}: ${item.message} Next: ${item.next_action}`) : ["- none"]),
    "",
    "Warnings:",
    ...(report.warnings && report.warnings.length ? report.warnings.map((item) => `- ${item.area}: ${item.message} Next: ${item.next_action}`) : ["- none"]),
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"])
  ].join("\n");
}

module.exports = {
  reports
};
