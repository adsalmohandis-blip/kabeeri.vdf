const { handled } = require("./shared");

function dispatchSafetyCommands({ group, action, value, flags, rest, c }) {
  if (group === "doctor") return handled(c.doctor());
  if (group === "resume") return handled(c.resume(action, value, flags));
  if (group === "start" || group === "start-here" || group === "entry") return handled(c.entryCommand(action, value, flags));
  if (group === "track") return handled(c.trackCommand(action, value, flags));
  if (group === "onboarding") return handled(c.onboardingCommand(action, value, flags));
  if (group === "guard" || group === "boundary") return handled(c.guard(action, value, flags));
  if (group === "conflict" || group === "conflicts" || group === "scan") return handled(c.conflict(action, value, flags));
  if (group === "validate") return handled(c.validateCommand(action, flags));
  if (group === "init") {
    return handled(c.initCommand(flags, {
      createWorkspace: c.createWorkspace,
      questionnaireIntakePlan: (nextValue, nextFlags) => c.questionnaireService.questionnaireIntakePlan(nextValue, nextFlags, c.getQuestionnaireRuntimeDeps()),
      refreshDashboardArtifacts: c.refreshDashboardArtifacts,
      appendAudit: c.appendAudit,
      readJsonFile: c.readJsonFile,
      writeJsonFile: c.writeJsonFile,
      writeTextFile: c.writeTextFile,
      table: c.table,
      buildProjectProfileRecommendation: (nextValue, nextFlags) => c.buildProjectProfileRecommendation(nextValue, nextFlags, {
        buildBlueprintRecommendation: c.buildBlueprintRecommendation,
        findProductBlueprint: c.findProductBlueprint,
        getPromptPackCatalog: c.getPromptPackCatalog,
        detectFrameworkPacks: c.detectFrameworkPacks,
        recommendFrameworkPacksForBlueprint: c.recommendFrameworkPacksForBlueprint,
        resolveQuestionnaireGroups: c.questionnaireService.resolveQuestionnaireGroups,
        table: c.table,
        appendAudit: c.appendAudit
      }),
      persistProjectProfileRecommendation: (recommendation) => c.persistProjectProfileRecommendation(recommendation, { appendAudit: c.appendAudit })
    }));
  }
  return null;
}

module.exports = {
  dispatchSafetyCommands
};
