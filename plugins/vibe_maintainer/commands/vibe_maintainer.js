const runtime = require("../runtime/vibe_maintainer");

function vibeMaintainer(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  vibeMaintainer,
  buildVibeMaintainerAuditReport: runtime.buildVibeMaintainerAuditReport,
  buildVibeMaintainerSummaryReport: runtime.buildVibeMaintainerSummaryReport,
  buildVibeMaintainerInspectionReport: runtime.buildVibeMaintainerInspectionReport,
  buildVibeMaintainerRelocationReport: runtime.buildVibeMaintainerRelocationReport
};
