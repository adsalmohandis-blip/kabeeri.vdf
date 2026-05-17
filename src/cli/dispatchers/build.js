const { handled } = require("./shared");

function dispatchBuildCommands({ group, action, value, flags, rest, rawGroup, c }) {
  if (group === "generator" || group === "generate") return handled(c.generator(action, value, flags, { appendAudit: c.appendAudit, refreshDashboardArtifacts: c.refreshDashboardArtifacts, fileExists: c.fileExists }));
  if (group === "create") return handled(c.generator("create", action, flags, { appendAudit: c.appendAudit, refreshDashboardArtifacts: c.refreshDashboardArtifacts, fileExists: c.fileExists }));
  if (group === "prompt-pack") return handled(c.promptPack(action, value, flags, { composePromptPack: c.composePromptPackService }));
  if (group === "temp") return handled(c.tempCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "schedule" || group === "scheduler") return handled(c.taskScheduler(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "pipeline") return handled(c.pipelineCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table }));
  if (group === "contract" || group === "operator" || group === "ai-contract") return handled(c.contractCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table }));
  if (group === "maintainability") return handled(c.maintainabilityCommand(action, value, flags, rest, {
    rawGroup,
    ensureWorkspace: c.ensureWorkspace,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    writeTextFile: c.writeTextFile,
    fileExists: c.fileExists,
    table: c.table,
    requireAnyRole: c.requireAnyRole,
    appendAudit: c.appendAudit,
    refreshDashboardArtifacts: c.refreshDashboardArtifacts,
    readStateArray: c.readStateArray,
    compactTitle: c.compactTitle,
    nextRecordId: c.nextRecordId,
    parseCsv: c.parseCsv
  }));
  if (group === "vibe-maintainer" || group === "vibe_maintainer" || group === "maintainer") return handled(c.vibeMaintainer(action, value, flags, rest, {
    ensureWorkspace: c.ensureWorkspace,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    writeTextFile: c.writeTextFile,
    fileExists: c.fileExists,
    table: c.table,
    appendAudit: c.appendAudit,
    repoRoot: c.repoRoot
  }));
  if (group === "company-profile" || group === "company_profile") return handled(c.companyProfile(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "news-website" || group === "news_website") return handled(c.newsWebsite(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "blog") return handled(c.blog(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "ecommerce-mobile-app" || group === "ecommerce_mobile_app") return handled(c.ecommerceMobileApp(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "crm") return handled(c.crm(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "pos") return handled(c.pos(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "ecommerce") return handled(c.ecommerceCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "wordpress" || group === "wp") return handled(c.wordpress(action, value, flags, rest));
  if (group === "booking") return handled(c.bookingCommand(action, value, flags, rest, { ensureWorkspace: c.ensureWorkspace, readJsonFile: c.readJsonFile, writeJsonFile: c.writeJsonFile, writeTextFile: c.writeTextFile, fileExists: c.fileExists, table: c.table, appendAudit: c.appendAudit }));
  if (group === "example") return handled(c.example(action, value));
  if (group === "questionnaire") return handled(c.questionnaireCommand(action, value, flags, { ...c.getQuestionnaireRuntimeDeps() }));
  if (group === "vibe") return handled(c.vibeCommand(action, value, flags, rest, c.getVibeRuntimeDeps()));
  if (group === "ask") return handled(c.vibeCommand("ask", [action, value, ...rest].filter(Boolean).join(" "), flags, [], c.getVibeRuntimeDeps()));
  if (group === "capture") return handled(c.vibeCommand("capture", [action, value, ...rest].filter(Boolean).join(" "), flags, [], c.getVibeRuntimeDeps()));
  if (group === "capability") return handled(c.capability(action, value, flags));
  if (group === "structure" || group === "foldering") return handled(c.repositoryStructure(action, value, flags));
  if (group === "blueprint") return handled(c.blueprintCommand(action, value, flags, rest, {
    table: c.table,
    fileExists: c.fileExists,
    ensureWorkspace: c.ensureWorkspace,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    buildBlueprintRecommendation: c.buildBlueprintRecommendation,
    buildBlueprintContext: c.buildBlueprintContext,
    buildAiBlueprintContext: c.buildAiBlueprintContext,
    buildBlueprintSelection: c.buildBlueprintSelection,
    getProductBlueprintCatalog: c.getProductBlueprintCatalog,
    findProductBlueprint: c.findProductBlueprint,
    readProductBlueprintState: c.readProductBlueprintState,
    getCurrentBlueprintKey: c.getCurrentBlueprintKey,
    buildDataDesignContext: c.buildDataDesignContext,
    renderBlueprintRecommendation: c.renderBlueprintRecommendation,
    appendAudit: c.appendAudit
  }));
  if (group === "data-design") return handled(c.dataDesignCommand(action, value, flags, rest, {
    table: c.table,
    fileExists: c.fileExists,
    ensureWorkspace: c.ensureWorkspace,
    readJsonFile: c.readJsonFile,
    writeJsonFile: c.writeJsonFile,
    getDataDesignCatalog: c.getDataDesignCatalog,
    readDataDesignState: c.readDataDesignState,
    getCurrentBlueprintKey: c.getCurrentBlueprintKey,
    buildDataDesignContext: c.buildDataDesignContext,
    buildDataDesignReview: c.buildDataDesignReview,
    findProductBlueprint: c.findProductBlueprint
  }));
  return null;
}

module.exports = {
  dispatchBuildCommands
};
