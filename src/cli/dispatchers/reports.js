const { handled } = require("./shared");

function dispatchReportCommands({ group, action, value, flags, c }) {
  if (group === "audit") return handled(c.audit(action, value, flags, { outputLines: c.outputLines }));
  if (group === "memory") return handled(c.memory(action, value, flags, { appendAudit: c.appendAudit, getEffectiveActor: c.getEffectiveActor }));
  if (group === "adr") return handled(c.adr(action, value, flags, {
    ensureDecisionHistoryState: c.ensureDecisionHistoryState,
    findAdr: c.findAdr,
    requireAnyRole: c.requireAnyRole,
    normalizeAdrStatus: c.normalizeAdrStatus,
    parseCsv: c.parseCsv,
    assertKnownTasks: (taskIds) => c.assertKnownTasks(taskIds, { getTaskById: c.getTaskById }),
    assertKnownAiRuns: c.assertKnownAiRuns,
    getEffectiveActor: c.getEffectiveActor,
    inferAdrImpact: c.inferAdrImpact,
    markAdrSuperseded: c.markAdrSuperseded,
    linkAdrsToAiRuns: c.linkAdrsToAiRuns,
    appendJsonLine: c.appendJsonLine,
    readJsonLines: c.readJsonLines,
    buildMemorySummary: c.buildMemorySummary,
    appendAudit: c.appendAudit,
    outputLines: c.outputLines,
    buildAdrReport: c.buildAdrReport,
    buildAdrAiRunTraceReport: c.buildAdrAiRunTraceReport,
    readAiRuns: c.readAiRuns,
    buildAdrAiRunTraceMarkdown: c.buildAdrAiRunTraceMarkdown
  }));
  if (group === "ai-run" || group === "airun") return handled(c.aiRun(action, value, flags, {
    appendAudit: c.appendAudit,
    getTaskById: c.getTaskById,
    getTaskWorkstreamsById: c.getTaskWorkstreamsById,
    getEffectiveActor: c.getEffectiveActor,
    requireAnyRole: c.requireAnyRole,
    parseCsv: c.parseCsv,
    appendJsonLine: c.appendJsonLine,
    outputLines: c.outputLines
  }));
  if (group === "dashboard") return handled(c.dashboard(action, value, flags, {
    ensureWorkspace: c.ensureWorkspace,
    collectDashboardState: c.collectDashboardState,
    writeDashboardStateFiles: c.writeDashboardStateFiles,
    appendAudit: c.appendAudit,
    writeTextFile: c.writeTextFile,
    buildClientHomeHtml: c.buildClientHomeHtmlModule,
    buildDashboardHtml: c.buildDashboardHtmlModule,
    exportCustomerAppPages: c.exportCustomerAppPagesModule,
    serveSite: c.serveSite,
    summarizeWorkspaceRoot: c.summarizeWorkspaceRoot,
    repoRoot: c.repoRoot,
    refreshLiveReportsState: c.refreshLiveReportsState,
    refreshAgileDashboardState: c.refreshAgileDashboardState,
    refreshStructuredDashboardState: c.refreshStructuredDashboardState,
    normalizePublicUsername: c.normalizePublicUsername
  }));
  if (group === "report" || group === "reports") return handled(c.reports(action, value, flags, { refreshLiveReportsState: c.refreshLiveReportsState, renderLiveReportsState: c.renderLiveReportsState, outputLines: c.outputLines, writeJsonFile: c.writeJsonFile }));
  if (group === "readiness") return handled(c.runtimeReport("readiness", action, value, flags, {
    buildReadinessReport: c.buildReadinessReport,
    buildGovernanceReport: c.buildGovernanceReport,
    refreshLiveReportsState: c.refreshLiveReportsState,
    renderReadinessReport: c.renderReadinessReport,
    renderGovernanceReport: c.renderGovernanceReport,
    outputLines: c.outputLines,
    writeTextFile: c.writeTextFile
  }));
  if (group === "governance") return handled(c.runtimeReport("governance", action, value, flags, {
    buildReadinessReport: c.buildReadinessReport,
    buildGovernanceReport: c.buildGovernanceReport,
    refreshLiveReportsState: c.refreshLiveReportsState,
    renderReadinessReport: c.renderReadinessReport,
    renderGovernanceReport: c.renderGovernanceReport,
    outputLines: c.outputLines,
    writeTextFile: c.writeTextFile
  }));
  return null;
}

module.exports = {
  dispatchReportCommands
};
