const { handled } = require("./shared");

function dispatchSessionOpsCommands({ group, action, value, flags, rest, c }) {
  if (group === "session") return handled(c.session(action, value, flags, {
    requireTaskExecutor: c.requireTaskExecutor,
    hasConfiguredIdentities: c.hasConfiguredIdentities,
    assertTaskCanStart: c.assertTaskCanStart,
    getTaskById: c.getTaskById,
    findActiveTaskToken: c.findActiveTaskToken,
    isExpired: c.isExpired,
    getTaskSprint: c.getTaskSprint,
    appendAudit: c.appendAudit,
    calculateUsageCost: c.calculateUsageCost,
    parseCsv: c.parseCsv,
    assertNoProtectedFrameworkFiles: c.assertNoProtectedFrameworkFiles,
    enforceSessionAppBoundary: c.enforceSessionAppBoundary,
    enforceTokenFileScope: c.enforceTokenFileScope,
    enforceSessionLockCoverage: c.enforceSessionLockCoverage,
    enforceSessionWorkstreamBoundary: c.enforceSessionWorkstreamBoundary,
    appendJsonLine: c.appendJsonLine,
    summarizeUsage: c.summarizeUsage
  }));
  if (group === "multi-ai" || group === "multi_ai") {
    if (action === "conversation" || action === "conversations" || action === "relay" || action === "inbox" || action === "messages" || action === "thread") {
      return handled(c.multiAiCommunications(action, value, flags, rest, { appendAudit: c.appendAudit }));
    }
    return handled(c.multiAiGovernance(action, value, flags, { appendAudit: c.appendAudit, rest }));
  }
  return null;
}

module.exports = {
  dispatchSessionOpsCommands
};
