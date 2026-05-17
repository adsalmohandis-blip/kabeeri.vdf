const { handled } = require("./shared");

function dispatchEvolutionOpsCommands({ group, action, value, flags, rest, c }) {
  if (group === "batch-exe") return handled(c.evolutionCommand("batch-exe", value, flags, rest, {
    ensureWorkspace: c.ensureWorkspace,
    fileExists: c.fileExists,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    readTextFile: c.readTextFile,
    table: c.table,
    appendAudit: c.appendAudit,
    refreshDashboardArtifacts: c.refreshDashboardArtifacts,
    requireAnyRole: c.requireAnyRole,
    readStateArray: c.readStateArray,
    compactTitle: c.compactTitle,
    nextRecordId: c.nextRecordId,
    parseCsv: c.parseCsv
  }));
  if (group === "evolution") return handled(c.evolutionCommand(action, value, flags, rest, {
    ensureWorkspace: c.ensureWorkspace,
    fileExists: c.fileExists,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    readTextFile: c.readTextFile,
    table: c.table,
    appendAudit: c.appendAudit,
    refreshDashboardArtifacts: c.refreshDashboardArtifacts,
    requireAnyRole: c.requireAnyRole,
    readStateArray: c.readStateArray,
    compactTitle: c.compactTitle,
    nextRecordId: c.nextRecordId,
    parseCsv: c.parseCsv
  }));
  if (group === "plugin" || group === "plugins") return handled(c.pluginCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, table: c.table }));
  return null;
}

module.exports = {
  dispatchEvolutionOpsCommands
};
