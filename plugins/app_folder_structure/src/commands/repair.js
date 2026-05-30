const { repairTargetStructure } = require("../services/target_path_service");

function runRepair(context, deps = {}) {
  const report = repairTargetStructure(context, deps);
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  if (!report.validation || !report.validation.ok) process.exitCode = 1;
  return report;
}

module.exports = { repairTargetStructure, runRepair };
