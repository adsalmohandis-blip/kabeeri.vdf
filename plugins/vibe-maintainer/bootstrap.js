const command = require("./commands/vibe_maintainer");
const runtime = require("./runtime/vibe_maintainer");

module.exports = {
  plugin_id: "vibe-maintainer",
  name: "Vibe Maintainer",
  command_entrypoint: "plugins/vibe-maintainer/bootstrap.js",
  runtime_entrypoint: "plugins/vibe-maintainer/runtime/vibe_maintainer.js",
  vibeMaintainer: command.vibeMaintainer,
  command: command.vibeMaintainer,
  runtime,
  buildVibeMaintainerAuditReport: runtime.buildVibeMaintainerAuditReport,
  buildVibeMaintainerSummaryReport: runtime.buildVibeMaintainerSummaryReport,
  buildVibeMaintainerInspectionReport: runtime.buildVibeMaintainerInspectionReport,
  buildVibeMaintainerRelocationReport: runtime.buildVibeMaintainerRelocationReport,
  persistVibeMaintainerState: runtime.persistVibeMaintainerState
};
