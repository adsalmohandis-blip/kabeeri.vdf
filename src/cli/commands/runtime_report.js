const { ensureWorkspace } = require("../workspace");

function runtimeReport(type, action, value, flags = {}, deps = {}) {
  const {
    buildReadinessReport,
    buildGovernanceReport,
    refreshLiveReportsState,
    renderReadinessReport,
    renderGovernanceReport,
    outputLines,
    writeTextFile
  } = deps;
  ensureWorkspace();
  const selected = value || action || "report";
  if (!["report", "show", "status"].includes(selected)) throw new Error(`Unknown ${type} action: ${selected}`);
  const report = type === "readiness" ? buildReadinessReport(flags) : buildGovernanceReport(flags);
  refreshLiveReportsState({ [type]: report });
  if (flags.json) {
    const content = `${JSON.stringify(report, null, 2)}\n`;
    if (flags.output && flags.output !== true) writeTextFile(flags.output, content);
    else console.log(content.trimEnd());
    return;
  }
  const lines = type === "readiness" ? renderReadinessReport(report) : renderGovernanceReport(report);
  outputLines(lines, flags.output);
}

module.exports = {
  runtimeReport
};
