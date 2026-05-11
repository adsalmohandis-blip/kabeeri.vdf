function questionnaire(action, value, flags = {}, deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    appendAudit = () => {},
    listFiles = () => [],
    table = () => "",
    buildCoverageMatrix,
    writeQuestionnaireReports = () => {},
    buildMissingAnswersReport,
    buildQuestionnaireFlow,
    questionnaireIntakePlan,
    generateTasksFromCoverage,
    resolveQuestionnaireGroups,
    copyQuestionnaireFiles
  } = deps;

  const files = listFiles("questionnaires", ".docx", true);

  if (!action || action === "list") {
    const rows = files.map((file) => [file]);
    console.log(table(["Questionnaire"], rows));
    return;
  }

  if (action === "status") {
    console.log(`${files.length} questionnaire files found.`);
    return;
  }

  if (action === "entry" || action === "answer") {
    return deps.questionnaireAnswer(value, flags);
  }

  if (action === "coverage" || action === "matrix") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix();
    writeQuestionnaireReports(matrix);
    console.log(JSON.stringify(matrix, null, 2));
    return;
  }

  if (action === "missing") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix();
    writeQuestionnaireReports(matrix);
    const report = buildMissingAnswersReport(matrix);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "flow") {
    console.log(JSON.stringify(buildQuestionnaireFlow(), null, 2));
    return;
  }

  if (action === "plan" || action === "intake-plan" || action === "recommend") {
    return questionnaireIntakePlan(value, flags);
  }

  if (action === "generate-tasks" || action === "tasks") {
    return generateTasksFromCoverage(flags);
  }

  if (action === "create" || action === "export") {
    const groups = resolveQuestionnaireGroups(flags.profile, flags.group || value);
    const output = flags.output || "questionnaires";
    const selected = files.filter((file) => groups.some((group) => file.startsWith(`questionnaires/${group}/`)));
    if (selected.length === 0) throw new Error(`No questionnaire files found for: ${groups.join(", ")}`);
    copyQuestionnaireFiles(selected, output, Boolean(flags.force));
    console.log(`Exported ${selected.length} questionnaire files to ${output}`);
    return;
  }

  throw new Error(`Unknown questionnaire action: ${action}`);
}

module.exports = { questionnaire };
