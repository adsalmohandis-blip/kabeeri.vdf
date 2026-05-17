const { handled } = require("./shared");

function dispatchDeliveryOpsCommands({ group, action, value, flags, rest, c }) {
  if (group === "plan") return handled(c.plan(action, value));
  if (group === "project" || group === "adopt") {
    const normalizedProjectAction = String(action || "").toLowerCase();
    if (["profile", "route", "recommend", "map", "status", "show", "list", "apply", "choose", "select", "set"].includes(normalizedProjectAction)) {
      return handled(c.projectProfile(action, value, flags, rest, {
        ensureWorkspace: c.ensureWorkspace,
        appendAudit: c.appendAudit,
        table: c.table,
        buildBlueprintRecommendation: c.buildBlueprintRecommendation,
        findProductBlueprint: c.findProductBlueprint,
        getPromptPackCatalog: c.getPromptPackCatalog,
        detectFrameworkPacks: c.detectFrameworkPacks,
        recommendFrameworkPacksForBlueprint: c.recommendFrameworkPacksForBlueprint,
        resolveQuestionnaireGroups: c.questionnaireService.resolveQuestionnaireGroups
      }));
    }
    return handled(c.projectCommand(action, value, flags, rest, {
      ensureWorkspace: c.ensureWorkspace,
      readJsonFile: c.readJsonFile,
      writeJsonFile: c.writeJsonFile,
      repoRoot: c.repoRoot,
      appendAudit: c.appendAudit,
      table: c.table
    }));
  }
  if (group === "task") return handled(c.task(action, value, flags, rest));
  if (group === "trace" || group === "traceability") return handled(c.traceability(action, value, flags, rest, { readAiRuns: c.readAiRuns, buildAdrAiRunTraceReport: c.buildAdrAiRunTraceReport }));
  if (group === "change" || group === "change-control" || group === "risk" || group === "risk-control") return handled(c.changeControl(action, value, flags, rest, { readAiRuns: c.readAiRuns, buildAdrAiRunTraceReport: c.buildAdrAiRunTraceReport }));
  if (group === "workstream") return handled(c.workstream(action, value, flags));
  if (group === "app") {
    if (action === "workspace") return handled(c.appWorkspace(value, rest[0], flags, rest, { ensureWorkspace: c.ensureWorkspace, table: c.table, appendAudit: c.appendAudit }));
    return handled(c.customerApp(action, value, flags));
  }
  if (group === "feature") return handled(c.feature(action, value, flags));
  if (group === "journey") return handled(c.journey(action, value, flags));
  if (group === "delivery") return handled(c.deliveryMode(action, value, flags, rest, { appendAudit: c.appendAudit, getEffectiveActor: c.getEffectiveActor }));
  if (group === "structured" || group === "waterfall") return handled(c.structured(action, value, flags, rest));
  if (group === "agile") return handled(c.agile(action, value, flags, rest));
  if (group === "sprint") return handled(c.sprint(action, value, flags, { requireAnyRole: c.requireAnyRole, appendAudit: c.appendAudit, buildSprintSummary: c.buildSprintSummary }));
  return null;
}

module.exports = {
  dispatchDeliveryOpsCommands
};
