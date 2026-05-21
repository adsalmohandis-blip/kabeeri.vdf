const questionnaireService = require("../services/questionnaire");
const {
  buildEvolutionOrderValidationReport,
  renderEvolutionOrderValidationFailure
} = require("./evolution");

function resolveQuestionnaireAppName(value, flags = {}) {
  return String(
    flags.app ||
    flags["app-name"] ||
    flags.app_slug ||
    flags.appSlug ||
    (typeof value === "string" ? value : "")
  ).trim();
}

function questionnaire(action, value, flags = {}, deps = {}) {
  if (action === "generate-tasks" || action === "tasks") {
    const appName = resolveQuestionnaireAppName(value, flags);
    if (appName) {
      const report = buildEvolutionOrderValidationReport(appName, flags, { ...deps });
      if (!report.task_generation_allowed) {
        const error = new Error(renderEvolutionOrderValidationFailure(report));
        error.report = report;
        throw error;
      }
    }
  }
  return questionnaireService.questionnaire(action, value, flags, {
    ...questionnaireService,
    ...deps
  });
}

module.exports = { questionnaire };
