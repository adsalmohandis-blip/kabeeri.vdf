const { dispatchSafetyCommands } = require("./dispatchers/safety");
const { dispatchBuildCommands } = require("./dispatchers/build");
const { dispatchReportCommands } = require("./dispatchers/reports");
const { dispatchOpsCommands } = require("./dispatchers/ops");

function dispatchCommand({ group, action, value, flags = {}, rest = [], rawGroup, context }) {
  const c = context;

  const safety = dispatchSafetyCommands({ group, action, value, flags, rest, c });
  if (safety) return safety.result;
  const build = dispatchBuildCommands({ group, action, value, flags, rest, rawGroup, c });
  if (build) return build.result;
  const report = dispatchReportCommands({ group, action, value, flags, c });
  if (report) return report.result;
  const ops = dispatchOpsCommands({ group, action, value, flags, rest, c });
  if (ops) return ops.result;

  throw new Error(`Unknown command: ${rawGroup}${c.suggestCommandService(rawGroup)}`);
}

module.exports = {
  dispatchCommand
};
