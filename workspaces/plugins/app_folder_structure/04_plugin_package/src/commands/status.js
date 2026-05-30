const { buildStatusReport, renderStatusReport } = require("../services/status_service");

function runStatus(context, deps = {}) {
  const report = buildStatusReport(context, deps);
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(renderStatusReport(report));
  }
  return report;
}

module.exports = { buildStatusReport, renderStatusReport, runStatus };
