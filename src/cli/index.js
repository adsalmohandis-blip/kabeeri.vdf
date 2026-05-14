const { createWorkspace, defaultWorkstreams, ensureWorkspace, readJsonFile, writeJsonFile } = require("./workspace");
const fs = require("fs");
const path = require("path");
const { listFiles, readTextFile, writeTextFile, fileExists, repoRoot, resolveAsset, assertSafeName } = require("./fs_utils");
const { validateRepository } = require("./validate");
const { parseArgs, printHelp, printCommandHelp, table, normalizeCommandName } = require("./ui");
const { productPackage, upgrade, buildPackageCheck, buildUpgradeCheck } = require("./commands/package_upgrade");
const { buildPluginLoaderReport } = require("./services/plugin_loader");
const { repositoryStructure } = require("./commands/repository_structure");
const { plan, findPlan } = require("./commands/plan");
const { example } = require("./commands/example");
const { capability, getSystemAreas, getSuggestedQuestionsForArea, mapAreaToWorkstream } = require("./commands/capability");
const { resume, entry: entryCommand, onboarding: onboardingCommand, buildTrackContext, buildResumeReport } = require("./commands/resume");
const { track: trackCommand } = require("./commands/track");
const { sync } = require("./commands/sync");
const { guard, assertNoProtectedFrameworkFiles } = require("./commands/guard");
const { conflict } = require("./commands/conflict");
const { doctor, validateCommand } = require("./commands/health");
const { deliveryMode, buildDeliveryModeRecommendation } = require("./commands/delivery");
const { memory, buildMemorySummary } = require("./commands/memory");
const { promptPack, getPromptPackCatalog, detectFrameworkPacks, recommendFrameworkPacksForBlueprint } = require("./commands/prompt_pack");
const { composePromptPack: composePromptPackService } = require("./services/prompt_pack");
const questionnaireService = require("./services/questionnaire");
const vibeInteractions = require("./services/vibe_interactions");
const { vibe: vibeCommand } = require("./commands/vibe");
const { audit } = require("./commands/audit");
const { generator } = require("./commands/generator");
const { vscode } = require("./commands/vscode");
const { docsSite } = require("./commands/docs_site");
const { sourcePackage } = require("./commands/source_package");
const { projectProfile, buildProjectProfileRecommendation, persistProjectProfileRecommendation } = require("./commands/project_profile");
const { buildTaskLifecycleState, buildTaskLifecycleBoard, renderTaskLifecycleState, renderTaskLifecycleBoard, readTaskLifecycleTrash } = require("./commands/task_lifecycle");
const { taskAssessment, buildTaskAssessment, readTaskAssessmentsState, renderTaskAssessment, renderTaskAssessmentList } = require("./commands/task_assessment");
const { taskCoverage } = require("./commands/task_coverage");
const { softwareDesignReference, documentationGenerator } = require("./commands/reference_folders");
const { changeControl } = require("./commands/change_control");
const { init: initCommand } = require("./commands/init");
const { temp: tempCommand } = require("./commands/temp");
const { taskScheduler, buildTaskSchedulerReport, recordTaskSchedulerRoute } = require("./commands/task_scheduler");
const { wordpress: wordpressCommand } = require("./commands/wordpress");
const { questionnaire: questionnaireCommand } = require("./commands/questionnaire");
const { blueprint: blueprintCommand, dataDesign: dataDesignCommand } = require("./commands/blueprint");
const { evolution: evolutionCommand } = require("./commands/evolution");
const { traceability } = require("./commands/traceability");
const { plugin: pluginCommand } = require("./commands/plugin");
const { appWorkspace } = require("./commands/app_workspace");
const { multiAiCommunications } = require("./commands/multi_ai_communications");
const { ensureTaskTrashState, listTaskTrash, moveTaskToTrash, purgeExpiredTaskTrash, restoreTaskFromTrash, showTaskTrash, taskTrashSummary } = require("./services/task_trash");
const { suggestCommand: suggestCommandService } = require("./services/command_suggestions");
const { capitalize, isExpired, matchesAny, parseCsv, uniqueBy, uniqueList } = require("./services/collections");
const { detectLanguage: detectLanguageService, matchesWords: matchesWordsService, resolveOutputLanguage: resolveOutputLanguageService } = require("./services/text");
const { readStateArray, summarizeBy } = require("./services/state_utils");
const { objectLines, outputLines, recordLines } = require("./services/report_output");
const { policyReportItem, taskReportItem } = require("./services/report_items");
const { appendJsonLine, readJsonLines, writeJsonLines } = require("./services/jsonl");
const {
  getGitChangedFiles: getGitChangedFilesService,
  getGitChangedFileDetails: getGitChangedFileDetailsService,
  shouldUseLocalGitSnapshot: shouldUseLocalGitSnapshotService
} = require("./services/git_snapshot");
const {
  buildEvolutionSummary: buildEvolutionSummaryService,
  buildEvolutionTemporaryPrioritiesReport: buildEvolutionTemporaryPrioritiesReportService,
  advanceEvolutionTemporaryPriorities: advanceEvolutionTemporaryPrioritiesService,
  completeEvolutionTemporaryPriorities: completeEvolutionTemporaryPrioritiesService,
  handleEvolutionTemporaryPriorities: handleEvolutionTemporaryPrioritiesService,
  ensureEvolutionTemporaryPriorities: ensureEvolutionTemporaryPrioritiesService,
  getCurrentTemporaryPriorities: getCurrentTemporaryPrioritiesService,
  getCurrentEvolutionPriority: getCurrentEvolutionPriorityService,
  buildEvolutionTemporaryPrioritySlices: buildEvolutionTemporaryPrioritySlicesService
} = require("./services/evolution");
const { buildTaskMemory, ensureTaskMemory } = require("./services/task_memory");
const { dashboard, buildDashboardActionItems } = require("./commands/dashboard");
const {
  collectDashboardState: collectDashboardStateBase,
  writeDashboardStateFiles: writeDashboardStateFilesBase,
  refreshDashboardArtifacts: refreshDashboardArtifactsBase,
  refreshTaskTrackerState,
  buildTaskTrackerStateFromFiles,
  buildTaskTrackerState,
  buildTaskTrackerActionItems,
  buildWorkstreamSummaries,
  buildCustomerAppSummaries,
  collectWorkspaceDashboardSummaries,
  getDashboardWorkspaceRoots,
  parseWorkspaceRoots,
  summarizeWorkspaceRoot,
  buildDashboardUxGovernanceState
} = require("./commands/dashboard_state");
const {
  buildClientHomeHtml: buildClientHomeHtmlModule,
  buildDashboardHtml: buildDashboardHtmlModule,
  exportCustomerAppPages: exportCustomerAppPagesModule
} = require("./commands/dashboard_site");
const { serveSite } = require("./commands/site");
const { budget } = require("./commands/budget");
const { contextPack, preflight, modelRoute, findLatestContextPackForTask, getContextPack } = require("./commands/cost_control");
const { handoff } = require("./commands/handoff");
const { security, getLatestSecurityScan } = require("./commands/security");
const { migration, getMigrationPlan, latestMigrationChecks } = require("./commands/migration");
const { token, defaultForbiddenFiles } = require("./commands/token");
const { lock, locksOverlap, normalizeLockType, normalizeLockScope, pathScopeContains } = require("./commands/lock");
const { identity, ensureNoOtherOwner } = require("./commands/identity");
const { owner, isOwnerSessionActive } = require("./commands/owner");
const { acceptance } = require("./commands/acceptance");
const { sprint } = require("./commands/sprint");
const { runtimeReport } = require("./commands/runtime_report");
const { reports } = require("./commands/reports");
const {
  release,
  buildReleaseChecklist,
  buildReleaseNotes,
  buildScenarioReview,
  countIssues
} = require("./commands/release");
const { session } = require("./commands/session");
const { multiAiGovernance } = require("./commands/multi_ai_governance");
const { github } = require("./commands/github");
const { adr } = require("./commands/adr");
const {
  aiRun,
  ensureDecisionHistoryState,
  readAiRuns,
  buildAiRunHistoryReport,
  buildAiRunProvenanceReport,
  buildAiRunProvenanceMarkdown,
  buildAiRunProvenance,
  findAdr,
  normalizeAdrStatus,
  inferAdrImpact,
  markAdrSuperseded,
  assertKnownTasks,
  assertKnownAiRuns,
  linkAdrsToAiRuns,
  buildAdrReport
} = require("./commands/ai_run");
const {
  usage,
  pricing,
  recordUsageEvent,
  calculateUsageCost,
  getPricingCurrency,
  readUsageEvents,
  summarizeUsage,
  getTaskSprint,
  buildSprintSummary,
  buildDeveloperEfficiency,
  enforceBudgetApproval
} = require("./commands/usage_pricing");

const VERSION = require("../../package.json").version;

function getDashboardRuntimeDeps() {
  return {
    getWorkstreamRegistry,
    buildEvolutionSummary: buildEvolutionSummaryService,
    readAgileState,
    refreshAgileDashboardState,
    readStructuredState,
    refreshStructuredDashboardState,
    readAiRuns,
    buildAiRunHistoryReport,
    summarizeUsage,
    buildSprintSummary,
    buildDeveloperEfficiency,
    buildTaskTrackerStateFromFiles
  };
}

function getQuestionnaireRuntimeDeps() {
  return {
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    appendAudit,
    listFiles,
    table,
    getPromptPackCatalog,
    detectFrameworkPacks,
    recommendFrameworkPacksForBlueprint,
    buildCoverageMatrix: questionnaireService.buildCoverageMatrix,
    writeQuestionnaireReports: questionnaireService.writeQuestionnaireReports,
    buildMissingAnswersReport: questionnaireService.buildMissingAnswersReport,
    buildQuestionnaireFlow: questionnaireService.buildQuestionnaireFlow,
    questionnaireIntakePlan: (value, flags) => questionnaireService.questionnaireIntakePlan(value, flags, getQuestionnaireRuntimeDeps()),
    generateTasksFromCoverage: questionnaireService.generateTasksFromCoverage,
    resolveQuestionnaireGroups: questionnaireService.resolveQuestionnaireGroups,
    copyQuestionnaireFiles: questionnaireService.copyQuestionnaireFiles,
    questionnaireAnswer: (value, flags) => questionnaireService.questionnaireAnswer(value, flags, getQuestionnaireRuntimeDeps()),
    buildQuestionnaireFrameworkContext: questionnaireService.buildQuestionnaireFrameworkContext,
    buildAdaptiveIntakeQuestions: questionnaireService.buildAdaptiveIntakeQuestions,
    inferQuestionnaireBlueprint: questionnaireService.inferQuestionnaireBlueprint,
    resolveOutputLanguage: questionnaireService.resolveOutputLanguage,
    detectLanguage: questionnaireService.detectLanguage,
    inferQuestionAreas: questionnaireService.inferQuestionAreas,
    normalizeAnswerValue: questionnaireService.normalizeAnswerValue,
    inferAnswerConfidence: questionnaireService.inferAnswerConfidence,
    activateSystemArea: questionnaireService.activateSystemArea,
    getCoverageAction: questionnaireService.getCoverageAction,
    buildBlueprintRecommendation,
    buildBlueprintContext,
    getProductBlueprintCatalog,
    findProductBlueprint,
    buildDataDesignContext,
    buildUiDesignRecommendation,
    buildDeliveryModeRecommendation
  };
}

function getVibeRuntimeDeps() {
  return {
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    table,
    appendAudit,
    refreshDashboardArtifacts,
    classifyVibeIntent,
    buildVibeAskResponse,
    buildVibePlanSuggestions,
    buildSuggestedTaskCard,
    approveVibeSuggestion,
    convertVibeSuggestion,
    updateVibeSuggestionStatus,
    capturePostWork,
    attachIntentToVibeSession: vibeInteractions.attachIntentToVibeSession,
    attachSuggestionsToVibeSession: vibeInteractions.attachSuggestionsToVibeSession,
    appendJsonLine: vibeInteractions.appendJsonLine,
    vibeSession: vibeInteractions.vibeSession,
    vibeBrief: vibeInteractions.vibeBrief,
    vibeNext: vibeInteractions.vibeNext,
    ensureInteractionsState: vibeInteractions.ensureInteractionsState
  };
}

function collectDashboardState(options = {}) {
  return collectDashboardStateBase(options, getDashboardRuntimeDeps());
}

function writeDashboardStateFiles(state) {
  return writeDashboardStateFilesBase(state, getDashboardRuntimeDeps());
}

function refreshDashboardArtifacts(options = {}) {
  return refreshDashboardArtifactsBase(options, getDashboardRuntimeDeps());
}

function getActiveTrackSurface() {
  const cwd = repoRoot();
  const localPackage = fileExists("package.json") ? readJsonFile("package.json") : null;
  const hasWorkspace = fs.existsSync(path.join(cwd, ".kabeeri"));
  const hasOwnerState = fs.existsSync(path.join(cwd, "OWNER_DEVELOPMENT_STATE.md"));
  const appStack = (() => {
    if (!localPackage) return [];
    const deps = { ...(localPackage.dependencies || {}), ...(localPackage.devDependencies || {}) };
    const stacks = [];
    if (deps.next) stacks.push("nextjs");
    if (deps.react) stacks.push("react");
    if (deps.vue) stacks.push("vue");
    if (deps["@angular/core"]) stacks.push("angular");
    if (deps.expo) stacks.push("react_native_expo");
    if (deps.vite) stacks.push("vite");
    if (deps.express) stacks.push("express");
    if (localPackage.scripts && localPackage.scripts.dev) stacks.push("npm_app");
    return Array.from(new Set(stacks));
  })();
  const mode = hasOwnerState && localPackage && localPackage.name === "kabeeri-vdf" && fs.existsSync(path.join(cwd, "bin", "kvdf.js")) && fs.existsSync(path.join(cwd, "src", "cli", "index.js"))
    ? "framework_owner_development"
    : (hasWorkspace && appStack.length ? "kabeeri_user_app_workspace" : (hasWorkspace ? "kabeeri_user_workspace" : (appStack.length ? "application_without_kabeeri_workspace" : "unknown_folder")));
  const trackContext = buildTrackContext({ cwd, mode, hasWorkspace, appStack, hasOwnerState });
  if (trackContext.effective_track_surface === "owner") return "owner";
  if (trackContext.effective_track_surface === "developer") return "developer";
  return null;
}

const OWNER_ONLY_GROUPS = new Set(["evolution", "owner", "plugins"]);

function assertTrackSurfaceAllowed(group, action, trackSurface) {
  const normalizedGroup = String(group || "");
  if (!trackSurface) return;
  if (trackSurface === "developer" && OWNER_ONLY_GROUPS.has(normalizedGroup)) {
    throw new Error(`Owner-only command blocked in developer track: ${normalizedGroup}${action ? ` ${action}` : ""}.`);
  }
  if (trackSurface === "owner" && normalizedGroup === "app" && action === "workspace") {
    throw new Error(`Developer-only command blocked in owner track: ${normalizedGroup}${action ? ` ${action}` : ""}.`);
  }
}

function run(argv) {
  const args = parseArgs(argv);

  if (args.flags.version && args.positionals.length === 0) {
    console.log(`kvdf ${VERSION}`);
    return;
  }

  if (args.flags.help && args.positionals.length > 0) {
    const requestedCommand = normalizeCommandName(args.positionals[0]);
    assertTrackSurfaceAllowed(requestedCommand, null, getActiveTrackSurface());
    printCommandHelp(requestedCommand);
    return;
  }

  if (args.flags.help || args.positionals.length === 0) {
    printHelp();
    return;
  }

  const [rawGroup, action, value, ...rest] = args.positionals;
  const group = normalizeCommandName(rawGroup);

  if (group === "help") {
    if (action) {
      const requestedCommand = normalizeCommandName(action);
      assertTrackSurfaceAllowed(requestedCommand, null, getActiveTrackSurface());
      printCommandHelp(requestedCommand);
    } else {
      printHelp();
    }
    return;
  }

  assertTrackSurfaceAllowed(group, action, getActiveTrackSurface());

  if (group === "doctor") return doctor();
  if (group === "resume") return resume(action, value, args.flags);
  if (group === "start" || group === "start-here" || group === "entry") return entryCommand(action, value, args.flags);
  if (group === "track") return trackCommand(action, value, args.flags);
  if (group === "onboarding") return onboardingCommand(action, value, args.flags);
  if (group === "guard" || group === "boundary") return guard(action, value, args.flags);
  if (group === "conflict" || group === "conflicts" || group === "scan") return conflict(action, value, args.flags);
  if (group === "validate") return validateCommand(action, args.flags);
  if (group === "init") return initCommand(args.flags, {
    createWorkspace,
    questionnaireIntakePlan: (value, flags) => questionnaireService.questionnaireIntakePlan(value, flags, getQuestionnaireRuntimeDeps()),
    refreshDashboardArtifacts,
    appendAudit,
    readJsonFile,
    writeJsonFile,
    table,
    buildProjectProfileRecommendation: (value, flags) => buildProjectProfileRecommendation(value, flags, {
      buildBlueprintRecommendation,
      findProductBlueprint,
      getPromptPackCatalog,
      detectFrameworkPacks,
      recommendFrameworkPacksForBlueprint,
      resolveQuestionnaireGroups: questionnaireService.resolveQuestionnaireGroups,
      table,
      appendAudit
    }),
    persistProjectProfileRecommendation: (recommendation) => persistProjectProfileRecommendation(recommendation, { appendAudit })
  });
  if (group === "generator" || group === "generate") return generator(action, value, args.flags, { appendAudit, refreshDashboardArtifacts, fileExists });
  if (group === "create") return generator("create", action, args.flags, { appendAudit, refreshDashboardArtifacts, fileExists });
  if (group === "prompt-pack") return promptPack(action, value, args.flags, { composePromptPack: composePromptPackService });
  if (group === "temp") return tempCommand(action, value, args.flags, rest, { ensureWorkspace, readJsonFile, writeJsonFile, fileExists, table, appendAudit });
  if (group === "schedule" || group === "scheduler") return taskScheduler(action, value, args.flags, rest, { ensureWorkspace, readJsonFile, writeJsonFile, fileExists, table, appendAudit });
  if (group === "wordpress" || group === "wp") return wordpress(action, value, args.flags, rest);
  if (group === "example") return example(action, value);
  if (group === "questionnaire") return questionnaireCommand(action, value, args.flags, {
    ...getQuestionnaireRuntimeDeps()
  });
  if (group === "vibe") return vibeCommand(action, value, args.flags, rest, getVibeRuntimeDeps());
  if (group === "ask") return vibeCommand("ask", [action, value, ...rest].filter(Boolean).join(" "), args.flags, [], getVibeRuntimeDeps());
  if (group === "capture") return vibeCommand("capture", [action, value, ...rest].filter(Boolean).join(" "), args.flags, [], getVibeRuntimeDeps());
  if (group === "capability") return capability(action, value, args.flags);
  if (group === "structure" || group === "foldering") return repositoryStructure(action, value, args.flags);
  if (group === "blueprint") return blueprintCommand(action, value, args.flags, rest, {
    table,
    fileExists,
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    buildBlueprintRecommendation,
    buildBlueprintContext,
    buildAiBlueprintContext,
    buildBlueprintSelection,
    getProductBlueprintCatalog,
    findProductBlueprint,
    readProductBlueprintState,
    getCurrentBlueprintKey,
    buildDataDesignContext,
    renderBlueprintRecommendation,
    appendAudit
  });
  if (group === "data-design") return dataDesignCommand(action, value, args.flags, rest, {
    table,
    fileExists,
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    getDataDesignCatalog,
    readDataDesignState,
    getCurrentBlueprintKey,
    buildDataDesignContext,
    buildDataDesignReview,
    findProductBlueprint
  });
  if (group === "evolution") return evolutionCommand(action, value, args.flags, rest, {
    ensureWorkspace,
    fileExists,
    readJsonFile,
    writeJsonFile,
    readTextFile,
    table,
    appendAudit,
    refreshDashboardArtifacts,
    requireAnyRole,
    readStateArray,
    compactTitle,
    nextRecordId,
    parseCsv
  });
  if (group === "plugin" || group === "plugins") return pluginCommand(action, value, args.flags, rest, { ensureWorkspace, readJsonFile, writeJsonFile, table });
  if (group === "plan") return plan(action, value);
  if (group === "project" || group === "adopt") {
    const normalizedProjectAction = String(action || "").toLowerCase();
    if (["profile", "route", "recommend", "map", "status", "show", "list", "apply", "choose", "select", "set"].includes(normalizedProjectAction)) {
      return projectProfile(action, value, args.flags, rest, {
        ensureWorkspace,
        appendAudit,
        table,
        buildBlueprintRecommendation,
        findProductBlueprint,
        getPromptPackCatalog,
        detectFrameworkPacks,
        recommendFrameworkPacksForBlueprint,
        resolveQuestionnaireGroups: questionnaireService.resolveQuestionnaireGroups
      });
    }
    return projectAnalysis(action, value, args.flags, rest);
  }
    if (group === "task") return task(action, value, args.flags, rest);
    if (group === "trace" || group === "traceability") return traceability(action, value, args.flags, rest, { readAiRuns, buildAdrAiRunTraceReport });
    if (group === "change" || group === "change-control" || group === "risk" || group === "risk-control") return changeControl(action, value, args.flags, rest, { readAiRuns, buildAdrAiRunTraceReport });
    if (group === "workstream") return workstream(action, value, args.flags);
  if (group === "app") {
    if (action === "workspace") return appWorkspace(value, rest[0], args.flags, rest, { ensureWorkspace, table, appendAudit });
    return customerApp(action, value, args.flags);
  }
  if (group === "feature") return feature(action, value, args.flags);
  if (group === "journey") return journey(action, value, args.flags);
  if (group === "delivery") return deliveryMode(action, value, args.flags, rest, { appendAudit, getEffectiveActor });
  if (group === "structured" || group === "waterfall") return structured(action, value, args.flags, rest);
  if (group === "agile") return agile(action, value, args.flags, rest);
  if (group === "sprint") return sprint(action, value, args.flags, { requireAnyRole, appendAudit, buildSprintSummary });
  if (group === "session") return session(action, value, args.flags, {
    requireTaskExecutor,
    hasConfiguredIdentities,
    assertTaskCanStart,
    getTaskById,
    findActiveTaskToken,
    isExpired,
    getTaskSprint,
    appendAudit,
    calculateUsageCost,
    parseCsv,
    assertNoProtectedFrameworkFiles,
    enforceSessionAppBoundary,
    enforceTokenFileScope,
    enforceSessionLockCoverage,
    enforceSessionWorkstreamBoundary,
    appendJsonLine,
    summarizeUsage
  });
  if (group === "multi-ai" || group === "multi_ai") {
    if (action === "conversation" || action === "conversations" || action === "relay" || action === "inbox" || action === "messages" || action === "thread") {
      return multiAiCommunications(action, value, args.flags, rest, { appendAudit });
    }
    return multiAiGovernance(action, value, args.flags, { appendAudit, rest });
  }
  if (group === "acceptance") return acceptance(action, value, args.flags, { requireAnyRole, appendAudit });
  if (group === "audit") return audit(action, value, args.flags, { outputLines });
  if (group === "memory") return memory(action, value, args.flags, { appendAudit, getEffectiveActor });
  if (group === "adr") return adr(action, value, args.flags, {
    ensureDecisionHistoryState,
    findAdr,
    requireAnyRole,
    normalizeAdrStatus,
    parseCsv,
    assertKnownTasks: (taskIds) => assertKnownTasks(taskIds, { getTaskById }),
    assertKnownAiRuns,
    getEffectiveActor,
    inferAdrImpact,
    markAdrSuperseded,
    linkAdrsToAiRuns,
    appendJsonLine,
    readJsonLines,
    buildMemorySummary,
    appendAudit,
    outputLines,
    buildAdrReport,
    buildAdrAiRunTraceReport,
    readAiRuns,
    buildAdrAiRunTraceMarkdown
  });
  if (group === "ai-run" || group === "airun") return aiRun(action, value, args.flags, {
    appendAudit,
    getTaskById,
    getTaskWorkstreamsById,
    getEffectiveActor,
    requireAnyRole,
    parseCsv,
    appendJsonLine,
    outputLines
  });
  if (group === "developer") return identity("developers", action, value, args.flags, { requireAnyRole, parseCsv, validateKnownWorkstreams, appendAudit });
  if (group === "owner") return owner(action, value, args.flags, { appendAudit, ensureNoOtherOwner, requireOwnerAuthority, isExpired });
  if (group === "agent") return identity("agents", action, value, args.flags, { requireAnyRole, parseCsv, validateKnownWorkstreams, appendAudit });
  if (group === "lock") return lock(action, value, args.flags, { requireAnyRole, appendAudit, getWorkstreamPathRules, getTaskById, taskWorkstreams, getTaskAppPaths, validateKnownWorkstreams });
  if (group === "vscode") return vscode(action, value, args.flags);
  if (group === "docs" || group === "doc") return docsSite(action, value, args.flags);
  if (group === "source-package" || group === "source_package" || group === "sourcepackage") return sourcePackage(action, value, args.flags, rest);
  if (group === "software-design") return softwareDesignReference(action, value, args.flags);
  if (group === "docs-generator") return documentationGenerator(action, value, args.flags);
  if (group === "dashboard") return dashboard(action, value, args.flags, {
    ensureWorkspace,
    collectDashboardState,
    writeDashboardStateFiles,
    appendAudit,
    writeTextFile,
    buildClientHomeHtml: buildClientHomeHtmlModule,
    buildDashboardHtml: buildDashboardHtmlModule,
    exportCustomerAppPages: exportCustomerAppPagesModule,
    serveSite,
    summarizeWorkspaceRoot,
    repoRoot,
    refreshLiveReportsState,
    refreshAgileDashboardState,
    refreshStructuredDashboardState,
    normalizePublicUsername
  });
  if (group === "report" || group === "reports") return reports(action, value, args.flags, { refreshLiveReportsState, renderLiveReportsState, outputLines, writeJsonFile });
  if (group === "readiness") return runtimeReport("readiness", action, value, args.flags, {
    buildReadinessReport,
    buildGovernanceReport,
    refreshLiveReportsState,
    renderReadinessReport,
    renderGovernanceReport,
    outputLines,
    writeTextFile
  });
  if (group === "governance") return runtimeReport("governance", action, value, args.flags, {
    buildReadinessReport,
    buildGovernanceReport,
    refreshLiveReportsState,
    renderReadinessReport,
    renderGovernanceReport,
    outputLines,
    writeTextFile
  });
  if (group === "release") return release(action, value, args.flags, getReleaseCommandDeps());
  if (group === "github") return github(action, value, args.flags, {
    githubConfig,
    findPlan,
    printGithubDryRun,
    printGithubLabels,
    printGithubMilestones,
    printGithubIssues,
    releaseCommand: release,
    getReleaseCommandDeps,
    runGithubWriteGate,
    syncGithubLabels,
    syncGithubMilestones,
    syncGithubIssues,
    runReleasePublishGates,
    publishGithubRelease,
    appendAudit
  });
  if (group === "sync" || group === "team-sync") return sync(action, value, args.flags);
  if (group === "package" || group === "packaging") return productPackage(action, value, args.flags);
  if (group === "upgrade") return upgrade(action, value, args.flags);
  if (group === "token") return token(action, value, args.flags, {
    requireAnyRole,
    appendAudit,
    getTaskById,
    taskWorkstreams,
    validateKnownWorkstreams,
    getTaskAppPaths,
    getWorkstreamPathRules,
    normalizeLockScope,
    normalizePathRule,
    pathScopeContains,
    parseCsv,
    assertAssigneeCanTakeTask,
    hasConfiguredIdentities,
    getIdentity
  });
  if (group === "budget") return budget(action, value, args.flags, { requireAnyRole, appendAudit, getEffectiveActor, getOwnerActor });
  if (group === "pricing") return pricing(action, value, args.flags, { requireAnyRole, appendAudit });
  if (group === "usage") return usage(action, value, args.flags, { refreshDashboardArtifacts, appendAudit });
  if (group === "design") return design(action, value, args.flags);
  if (group === "policy") return policy(action, value, args.flags);
  if (group === "context-pack" || group === "context") return contextPack(action, value, args.flags, { appendAudit, getTaskById, calculateUsageCost, getPricingCurrency });
  if (group === "preflight") return preflight(action, value, args.flags, { appendAudit, getTaskById, calculateUsageCost, getPricingCurrency });
  if (group === "model-route" || group === "routing") return modelRoute(action, value, args.flags);
  if (group === "handoff") return handoff(action, value, args.flags, { runPolicyGate, collectDashboardState, summarizeUsage, appendAudit, getEffectiveActor });
  if (group === "security") return security(action, value, args.flags, { appendAudit });
  if (group === "migration" || group === "migrate") return migration(action, value, args.flags, { requireAnyRole, getEffectiveActor, appendAudit });

  throw new Error(`Unknown command: ${rawGroup}${suggestCommandService(rawGroup)}`);
}

function getReleaseCommandDeps() {
  return {
    findPlan,
    validateRepository,
    countIssues,
    outputLines,
    buildReadinessReport,
    buildReleaseChecklist,
    buildReleaseNotes,
    buildScenarioReview,
    previewPolicyGate,
    runPolicyGate,
    runReleasePublishGates,
    publishGithubRelease
  };
}

function wordpress(action, value, flags = {}, rest = []) {
  return wordpressCommand(action, value, flags, rest, {
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    repoRoot,
    fileExists,
    assertSafeName,
    table,
    appendAudit
  });

  ensureWorkspace();
  ensureWordPressState();

  if (!action || action === "help" || action === "status" || action === "list") {
    const state = readJsonFile(".kabeeri/wordpress.json");
    console.log("WordPress capability");
    console.log(table(["Area", "Value"], [
      ["Analyses", state.analyses.length],
      ["Plans", state.plans.length],
      ["Scaffolds", state.scaffolds.length],
      ["Current plan", state.current_plan_id || "none"]
    ]));
    console.log("");
    console.log(table(["Command", "Purpose"], [
      ["wordpress analyze --path <folder>", "Analyze an existing WordPress site before changes."],
      ["wordpress plan \"site description\"", "Create a WordPress build/adoption plan."],
      ["wordpress tasks --plan <id>", "Create governed tasks from the latest or selected WordPress plan."],
      ["wordpress plugin plan \"plugin description\" --name <Name>", "Create a governed WordPress plugin development plan."],
      ["wordpress plugin tasks --plan <id>", "Create governed tasks from the latest or selected plugin plan."],
      ["wordpress scaffold plugin --name <Name>", "Create a safe starter plugin skeleton."],
      ["wordpress scaffold theme --name <Name>", "Create a safe starter theme skeleton."],
      ["wordpress scaffold child-theme --name <Name> --parent <theme>", "Create a child theme skeleton."]
    ]));
    return;
  }

  if (action === "analyze" || action === "analyse") {
    const targetPath = resolveWordPressTargetPath(flags.path || value || rest[0] || ".");
    const analysis = analyzeWordPressProject(targetPath, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.analyses.push(analysis);
    state.current_analysis_id = analysis.analysis_id;
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.analyzed", "wordpress", analysis.analysis_id, `WordPress project analyzed: ${analysis.relative_path}`);
    if (flags.json) console.log(JSON.stringify(analysis, null, 2));
    else renderWordPressAnalysis(analysis);
    return;
  }

  if (action === "plan") {
    const description = [value, ...rest].filter(Boolean).join(" ") || flags.description || flags.type || "WordPress website";
    const plan = buildWordPressPlan(description, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.plans.push(plan);
    state.current_plan_id = plan.plan_id;
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.plan_created", "wordpress_plan", plan.plan_id, `WordPress plan created for ${plan.site_type}`);
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderWordPressPlan(plan);
    return;
  }

  if (action === "tasks" || action === "create-tasks") {
    const plan = findWordPressPlan(flags.plan || value);
    const tasks = createTasksFromWordPressPlan(plan, flags);
    appendAudit("wordpress.tasks_created", "wordpress_plan", plan.plan_id, `Created ${tasks.length} WordPress tasks`);
    if (flags.json) console.log(JSON.stringify({ plan_id: plan.plan_id, tasks }, null, 2));
    else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
    return;
  }

  if (action === "plugin" || action === "plugins") {
    const pluginAction = value || "status";
    if (pluginAction === "plan") {
      const description = rest.filter(Boolean).join(" ") || flags.description || flags.name || "WordPress plugin";
      const plan = buildWordPressPluginPlan(description, flags);
      const state = readJsonFile(".kabeeri/wordpress.json");
      state.plugin_plans = state.plugin_plans || [];
      state.plugin_plans.push(plan);
      state.current_plugin_plan_id = plan.plugin_plan_id;
      writeJsonFile(".kabeeri/wordpress.json", state);
      appendAudit("wordpress.plugin_plan_created", "wordpress_plugin_plan", plan.plugin_plan_id, `WordPress plugin plan created: ${plan.slug}`);
      if (flags.json) console.log(JSON.stringify(plan, null, 2));
      else renderWordPressPluginPlan(plan);
      return;
    }
    if (pluginAction === "tasks" || pluginAction === "create-tasks") {
      const plan = findWordPressPluginPlan(flags.plan || rest[0]);
      const tasks = createTasksFromWordPressPluginPlan(plan, flags);
      appendAudit("wordpress.plugin_tasks_created", "wordpress_plugin_plan", plan.plugin_plan_id, `Created ${tasks.length} WordPress plugin tasks`);
      if (flags.json) console.log(JSON.stringify({ plugin_plan_id: plan.plugin_plan_id, tasks }, null, 2));
      else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
      return;
    }
    if (pluginAction === "scaffold") {
      const result = scaffoldWordPress("plugin", flags);
      const state = readJsonFile(".kabeeri/wordpress.json");
      state.scaffolds.push(result);
      writeJsonFile(".kabeeri/wordpress.json", state);
      appendAudit("wordpress.plugin_scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress plugin scaffold created: ${result.slug}`);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`Created WordPress plugin scaffold at ${result.path}`);
        console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
      }
      return;
    }
    if (pluginAction === "checklist") {
      const checklist = buildWordPressPluginAcceptanceChecklist(flags.type || rest[0] || "general");
      if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
      else checklist.forEach((item) => console.log(`- ${item}`));
      return;
    }
    throw new Error(`Unknown wordpress plugin action: ${pluginAction}`);
  }

  if (action === "scaffold") {
    const scaffoldType = value || flags.type || rest[0] || "plugin";
    const result = scaffoldWordPress(scaffoldType, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.scaffolds.push(result);
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress ${result.type} scaffold created: ${result.slug}`);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`Created WordPress ${result.type} scaffold at ${result.path}`);
      console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
    }
    return;
  }

  if (action === "checklist") {
    const checklist = buildWordPressAcceptanceChecklist(flags.type || value || "general");
    if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
    else checklist.forEach((item) => console.log(`- ${item}`));
    return;
  }

  throw new Error(`Unknown wordpress action: ${action}`);
}

function ensureWordPressState() {
  if (!fileExists(".kabeeri/wordpress.json")) {
    writeJsonFile(".kabeeri/wordpress.json", { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null });
  }
}

function resolveWordPressTargetPath(input) {
  const fs = require("fs");
  const path = require("path");
  const targetPath = path.resolve(repoRoot(), input || ".");
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`WordPress path not found or not a directory: ${input}`);
  }
  return targetPath;
}

function analyzeWordPressProject(targetPath, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const rel = path.relative(repoRoot(), targetPath).replace(/\\/g, "/") || ".";
  const files = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name));
  const contentPath = path.join(targetPath, "wp-content");
  const pluginPath = path.join(contentPath, "plugins");
  const themePath = path.join(contentPath, "themes");
  const plugins = fs.existsSync(pluginPath) ? fs.readdirSync(pluginPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const themes = fs.existsSync(themePath) ? fs.readdirSync(themePath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const features = [];
  if (dirs.has("wp-content")) features.push("wp_content");
  if (files.has("wp-config.php")) features.push("wp_config");
  if (dirs.has("wp-admin") || dirs.has("wp-includes")) features.push("wordpress_core_present");
  if (plugins.includes("woocommerce")) features.push("woocommerce");
  if (plugins.includes("advanced-custom-fields") || plugins.includes("advanced-custom-fields-pro")) features.push("acf");
  if (plugins.includes("elementor") || plugins.includes("elementor-pro")) features.push("page_builder");
  if (plugins.includes("wordpress-seo") || plugins.includes("rank-math")) features.push("seo_plugin");
  const riskSignals = [];
  if (!dirs.has("wp-content") && !files.has("wp-config.php")) riskSignals.push("not_wordpress_root_or_missing_wp_content");
  if (files.has("wp-config.php")) riskSignals.push("wp_config_present_review_secrets");
  if (!flags.staging) riskSignals.push("staging_not_confirmed");
  if (!flags.backup) riskSignals.push("backup_not_confirmed");
  if (!plugins.length && dirs.has("wp-content")) riskSignals.push("plugins_not_detected_or_empty");
  const detectedType = features.includes("woocommerce") ? "woocommerce" : features.includes("wp_content") || features.includes("wp_config") ? "wordpress_site" : "unknown";
  const blueprint = features.includes("woocommerce") ? "ecommerce" : inferWordPressBlueprint(flags.type || flags.description || rel);
  return {
    analysis_id: `wordpress-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf wordpress analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_type: detectedType,
    detected_features: features,
    plugins,
    themes,
    recommended_blueprint: blueprint,
    recommended_prompt_pack: "wordpress",
    risk_level: riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low",
    risk_signals: riskSignals,
    forbidden_paths: ["wp-admin/", "wp-includes/", "wp-config.php", ".env", "uploads/"],
    allowed_change_zones: ["wp-content/plugins/<custom-plugin>/", "wp-content/themes/<child-or-custom-theme>/", "wp-content/mu-plugins/<custom-mu-plugin>/"],
    next_actions: [
      "Confirm staging and backup before editing.",
      `Run \`kvdf wordpress plan --mode existing --type ${detectedType === "woocommerce" ? "woocommerce" : blueprint}\`.`,
      "Use `kvdf prompt-pack compose wordpress --task <task-id>` for implementation tasks.",
      "Do not modify WordPress core files or production secrets.",
      "Create governed tasks with explicit plugin/theme scope before code changes."
    ]
  };
}

function buildWordPressPlan(description, flags = {}) {
  const mode = flags.mode || (flags.existing ? "existing" : "new");
  const siteType = flags.type || inferWordPressSiteType(description);
  const blueprintKey = flags.blueprint || inferWordPressBlueprint(siteType || description);
  const isExisting = mode === "existing" || mode === "adoption";
  const isWoo = siteType === "woocommerce" || blueprintKey === "ecommerce";
  const plan = {
    plan_id: flags.id || `wordpress-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plan",
    description,
    mode,
    site_type: siteType,
    blueprint_key: blueprintKey,
    delivery_mode: flags.delivery || (isExisting || isWoo ? "structured" : "agile"),
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      isExisting ? "kvdf wordpress analyze --path . --staging --backup" : "kvdf init --profile standard --mode agile",
      `kvdf blueprint recommend "${description}"`,
      `kvdf questionnaire plan "${description}" --framework wordpress --blueprint ${blueprintKey}`,
      `kvdf data-design context ${blueprintKey}`,
      `kvdf design recommend ${blueprintKey}`,
      "kvdf wordpress tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf handoff package --id wordpress-handoff --audience owner"
    ],
    phases: buildWordPressPhases(mode, siteType, blueprintKey),
    task_templates: buildWordPressTaskTemplates(mode, siteType, blueprintKey),
    acceptance_checklist: buildWordPressAcceptanceChecklist(siteType),
    safety_rules: [
      "Never edit wp-admin or wp-includes.",
      "Never commit wp-config.php secrets.",
      "Use a child theme or custom plugin for changes unless the Owner approves another route.",
      "Use staging and backup for existing sites.",
      "Keep WooCommerce order, payment, tax, and stock changes behind explicit tasks and review."
    ]
  };
  if (flags.analysis) plan.analysis_id = flags.analysis;
  return plan;
}

function buildWordPressPhases(mode, siteType, blueprintKey) {
  const base = mode === "existing"
    ? ["Analyze existing site", "Confirm staging backup and rollback", "Map plugins themes content and risks", "Plan controlled changes"]
    : ["Define site purpose and blueprint", "Choose theme/plugin strategy", "Plan content model and pages", "Scaffold safe extension layer"];
  const implementation = [
    "Build custom plugin/theme or child theme in scoped files",
    "Configure SEO accessibility performance and security",
    "Test forms content flows permissions and responsive behavior",
    "Prepare handoff rollback notes and Owner verification"
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    implementation.splice(1, 0, "Validate WooCommerce catalog checkout payments shipping tax stock and emails");
  }
  return [...base, ...implementation].map((title, index) => ({
    phase_id: `wp-phase-${String(index + 1).padStart(2, "0")}`,
    title,
    status: "planned"
  }));
}

function buildWordPressTaskTemplates(mode, siteType, blueprintKey) {
  const tasks = [
    ["WordPress discovery and scope confirmation", "docs", ["Staging and backup status recorded.", "Forbidden paths listed.", "Implementation route selected."]],
    ["WordPress content model and page map", "public_frontend", ["Pages, CPTs, taxonomies, menus, and forms are documented.", "SEO/GEO requirements are listed."]],
    ["WordPress safe extension scaffold", "backend", ["Custom plugin, theme, or child theme scaffold exists.", "No WordPress core files changed."]],
    ["WordPress UI implementation and responsive review", "public_frontend", ["Desktop/mobile states reviewed.", "Accessibility and semantic HTML considered."]],
    ["WordPress security performance and release review", "security", ["Security scan executed.", "Caching/performance risks reviewed.", "Rollback and handoff notes prepared."]]
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    tasks.splice(2, 0, ["WooCommerce catalog checkout and order flow", "backend", ["Products, cart, checkout, payment, shipping, tax, stock, and emails are covered.", "No live payment changes without sandbox evidence."]]);
  }
  if (mode === "existing") {
    tasks.unshift(["Existing WordPress site analysis", "docs", ["Plugins and themes detected.", "Risks and next actions recorded.", "Owner approves scope before changes."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressAcceptanceChecklist(siteType) {
  const checklist = [
    "WordPress core paths are not modified directly.",
    "Existing sites have staging and backup confirmed before changes.",
    "wp-config.php secrets are not copied into prompts or commits.",
    "Implementation scope chooses custom plugin, custom theme, or child theme explicitly.",
    "CPTs, taxonomies, shortcodes, admin settings, REST routes, and templates are documented when used.",
    "Nonces, capabilities, sanitization, escaping, and validation are reviewed.",
    "Responsive, accessibility, SEO/GEO, sitemap/schema, forms, and error states are reviewed.",
    "Handoff includes changed files, plugin/theme activation notes, rollback notes, and tests."
  ];
  if (siteType === "woocommerce") {
    checklist.push("WooCommerce checkout, payment sandbox, tax, shipping, stock, emails, refunds, and order statuses are reviewed.");
  }
  return checklist;
}

function buildWordPressPluginPlan(description, flags = {}) {
  const name = flags.name || inferWordPressPluginName(description);
  const slug = slugifyWordPressName(flags.slug || name);
  const pluginType = flags.type || inferWordPressPluginType(description);
  const plan = {
    plugin_plan_id: flags.id || `wordpress-plugin-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plugin plan",
    name,
    slug,
    description,
    plugin_type: pluginType,
    target_path: `wp-content/plugins/${slug}/`,
    delivery_mode: flags.delivery || "structured",
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      `kvdf wordpress plugin scaffold --name "${name}"`,
      "kvdf wordpress plugin tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf validate"
    ],
    architecture: buildWordPressPluginArchitecture(slug, pluginType),
    task_templates: buildWordPressPluginTaskTemplates(pluginType),
    acceptance_checklist: buildWordPressPluginAcceptanceChecklist(pluginType),
    safety_rules: [
      "Plugin code must live under wp-content/plugins/<plugin-slug>/ only.",
      "Use hooks, filters, CPTs, taxonomies, REST routes, shortcodes, blocks, or admin settings instead of editing WordPress core.",
      "Every form or state-changing request needs nonce and capability checks.",
      "Every input must be sanitized and every output escaped.",
      "Activation, deactivation, uninstall, migration, and rollback behavior must be documented before release."
    ]
  };
  return plan;
}

function buildWordPressPluginArchitecture(slug, pluginType) {
  const architecture = [
    { path: `${slug}.php`, purpose: "Plugin header, ABSPATH guard, constants, loader require, activation/deactivation hooks." },
    { path: "includes/class-plugin.php", purpose: "Central boot class that registers hooks and composes admin/public modules." },
    { path: "admin/class-admin.php", purpose: "Admin menus, settings pages, capability checks, settings validation." },
    { path: "public/class-public.php", purpose: "Shortcodes, frontend assets, public rendering, safe form handlers." },
    { path: "uninstall.php", purpose: "Explicit cleanup policy for options, custom tables, scheduled hooks, and plugin-owned data." },
    { path: "assets/css/ and assets/js/", purpose: "Scoped admin/public assets registered with WordPress enqueue APIs." },
    { path: "languages/", purpose: "Translation-ready text domain files." }
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    architecture.push({ path: "includes/class-content-types.php", purpose: "Custom post types, taxonomies, rewrite labels, and capability mapping." });
  }
  if (pluginType === "woocommerce") {
    architecture.push({ path: "includes/class-woocommerce.php", purpose: "WooCommerce hooks for checkout, products, orders, stock, emails, and refunds." });
  }
  if (pluginType === "integration") {
    architecture.push({ path: "includes/class-integration.php", purpose: "External API client, webhook verification, retries, and integration logs." });
  }
  return architecture;
}

function buildWordPressPluginTaskTemplates(pluginType) {
  const tasks = [
    ["Plugin requirements and boundaries", "docs", ["Plugin purpose, users, permissions, data ownership, and forbidden paths are documented.", "Activation, deactivation, uninstall, and rollback policy is clear."]],
    ["Plugin scaffold and bootstrapping", "backend", ["Plugin scaffold exists under wp-content/plugins only.", "ABSPATH guard, constants, loader, activation, deactivation, and uninstall files exist."]],
    ["Plugin security and permissions", "security", ["Nonces, capabilities, sanitization, escaping, validation, and direct access protection are reviewed.", "No secrets or production credentials are committed."]],
    ["Plugin admin and settings UX", "backend", ["Admin menus/settings use proper capabilities.", "Settings validation and error messages are implemented."]],
    ["Plugin public surface", "public_frontend", ["Shortcodes, blocks, templates, or frontend assets are scoped and accessible.", "Responsive, accessibility, and empty/error states are reviewed."]],
    ["Plugin testing and handoff", "qa", ["Activation/deactivation tested.", "Acceptance checklist completed.", "Handoff includes install, activation, rollback, changed files, and known risks."]]
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    tasks.splice(3, 0, ["Custom post types and taxonomies", "backend", ["CPT labels, supports, capabilities, rewrite rules, and taxonomies are registered.", "Admin columns and content editing flow are reviewed."]]);
  }
  if (pluginType === "woocommerce") {
    tasks.splice(3, 0, ["WooCommerce extension flow", "backend", ["Checkout, products, orders, payment/shipping/tax/stock touchpoints are explicit.", "Sandbox evidence exists before payment or order lifecycle changes."]]);
  }
  if (pluginType === "integration") {
    tasks.splice(3, 0, ["External integration and webhooks", "backend", ["API credentials are stored safely.", "Webhook signatures, retries, logs, and failure states are handled."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-plugin-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "docs" ? "planning" : workstream === "qa" || workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressPluginAcceptanceChecklist(pluginType) {
  const checklist = [
    "Plugin lives under wp-content/plugins/<plugin-slug>/ only.",
    "Plugin header, text domain, version, ABSPATH guard, and bootstrap are present.",
    "Activation and deactivation hooks are defined when needed.",
    "Uninstall behavior is explicit and does not delete customer data unexpectedly.",
    "Admin settings use capability checks and settings validation.",
    "All state-changing requests use nonces.",
    "All user input is sanitized and validated.",
    "All output is escaped for the correct context.",
    "REST routes define permissions callbacks.",
    "Shortcodes/blocks avoid unsafe HTML and handle empty/error states.",
    "Assets are enqueued through WordPress APIs and scoped to plugin screens where possible.",
    "No WordPress core, wp-config.php, uploads, or third-party plugin files are modified.",
    "Install, activation, rollback, and handoff notes are written."
  ];
  if (pluginType === "woocommerce") {
    checklist.push("WooCommerce checkout, order, stock, refund, tax, shipping, and email changes have sandbox evidence.");
  }
  if (pluginType === "integration") {
    checklist.push("External API failures, retries, webhook verification, and logs are covered.");
  }
  return checklist;
}

function findWordPressPluginPlan(planId) {
  const state = readJsonFile(".kabeeri/wordpress.json");
  const plans = state.plugin_plans || [];
  const id = planId || state.current_plugin_plan_id;
  const plan = plans.find((item) => item.plugin_plan_id === id) || plans[plans.length - 1];
  if (!plan) throw new Error("No WordPress plugin plan found. Run `kvdf wordpress plugin plan \"...\" --name <Name>` first.");
  return plan;
}

function createTasksFromWordPressPluginPlan(plan, flags = {}) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp-plugin";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: `${plan.name}: ${template.title}`,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plugin_plan",
      source_id: plan.plugin_plan_id,
      app_id: plan.slug,
      workstream: template.workstream || "backend",
      workstreams: [template.workstream || "backend"],
      allowed_files: [`wp-content/plugins/${plan.slug}/**`],
      forbidden_files: ["wp-admin/**", "wp-includes/**", "wp-config.php", "wp-content/uploads/**"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.plugin_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

function findWordPressPlan(planId) {
  const state = readJsonFile(".kabeeri/wordpress.json");
  const id = planId || state.current_plan_id;
  const plan = (state.plans || []).find((item) => item.plan_id === id) || (state.plans || [])[state.plans.length - 1];
  if (!plan) throw new Error("No WordPress plan found. Run `kvdf wordpress plan \"...\"` first.");
  return plan;
}

function createTasksFromWordPressPlan(plan, flags = {}) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: template.title,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plan",
      source_id: plan.plan_id,
      workstream: template.workstream || "public_frontend",
      workstreams: [template.workstream || "public_frontend"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.site_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

function scaffoldWordPress(type, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const name = flags.name || flags.slug || `kabeeri-${type}`;
  const slug = slugifyWordPressName(name);
  assertSafeName(slug);
  const root = path.resolve(repoRoot(), flags.path || ".");
  const force = Boolean(flags.force);
  const normalizedType = String(type || "plugin").toLowerCase();
  if (!["plugin", "theme", "child-theme", "child"].includes(normalizedType)) throw new Error(`Unknown WordPress scaffold type: ${type}`);
  const isTheme = normalizedType === "theme" || normalizedType === "child-theme" || normalizedType === "child";
  const base = isTheme ? path.join(root, "wp-content", "themes", slug) : path.join(root, "wp-content", "plugins", slug);
  if (fs.existsSync(base) && fs.readdirSync(base).length && !force) throw new Error(`Scaffold path is not empty: ${path.relative(repoRoot(), base).replace(/\\/g, "/")}. Use --force to write into it.`);
  fs.mkdirSync(base, { recursive: true });
  const files = [];
  const write = (relative, content) => {
    const target = path.join(base, relative);
    if (fs.existsSync(target) && !force) return;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
    files.push(path.relative(repoRoot(), target).replace(/\\/g, "/"));
  };
  if (!isTheme) {
    write(`${slug}.php`, buildWordPressPluginMain(slug, name));
    write("includes/class-plugin.php", buildWordPressPluginClass(slug));
    write("admin/class-admin.php", buildWordPressPluginAdminClass(slug));
    write("public/class-public.php", buildWordPressPluginPublicClass(slug));
    write("uninstall.php", buildWordPressPluginUninstall(slug));
    write("assets/css/admin.css", "");
    write("assets/css/public.css", "");
    write("assets/js/admin.js", "");
    write("assets/js/public.js", "");
    write("languages/.gitkeep", "");
    write("README.md", buildWordPressScaffoldReadme("plugin", slug));
  } else {
    const parent = flags.parent || "twentytwentyfour";
    write("style.css", buildWordPressThemeStyle(slug, name, normalizedType === "child-theme" || normalizedType === "child" ? parent : null));
    write("functions.php", buildWordPressThemeFunctions(slug, Boolean(normalizedType === "child-theme" || normalizedType === "child")));
    write("README.md", buildWordPressScaffoldReadme(normalizedType === "theme" ? "theme" : "child-theme", slug));
  }
  return {
    scaffold_id: `wordpress-scaffold-${Date.now()}`,
    created_at: new Date().toISOString(),
    type: normalizedType === "child" ? "child-theme" : normalizedType,
    slug,
    path: path.relative(repoRoot(), base).replace(/\\/g, "/"),
    files
  };
}

function slugifyWordPressName(value) {
  return String(value || "kabeeri-wordpress").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kabeeri-wordpress";
}

function inferWordPressPluginName(text) {
  const value = String(text || "").trim();
  if (!value) return "Kabeeri WordPress Plugin";
  return value.split(/\s+/).slice(0, 5).join(" ").replace(/^build\s+/i, "").replace(/^create\s+/i, "") || "Kabeeri WordPress Plugin";
}

function inferWordPressPluginType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|checkout|cart|order|payment|shipping|stock|refund/.test(value)) return "woocommerce";
  if (/booking|appointment|clinic|reservation|حجز|عيادة/.test(value)) return "booking";
  if (/api|webhook|integration|sync|crm|erp|gateway/.test(value)) return "integration";
  if (/cpt|post type|taxonomy|directory|listing|portfolio|content/.test(value)) return "cpt";
  return "business";
}

function buildWordPressPluginMain(slug, name) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
/**
 * Plugin Name: ${name}
 * Description: Kabeeri-scaffolded WordPress plugin. Keep custom behavior here instead of editing WordPress core.
 * Version: 0.1.0
 * Author: Kabeeri VDF
 * Text Domain: ${slug}
 */

if (!defined('ABSPATH')) {
    exit;
}

define('${constantPrefix}_VERSION', '0.1.0');
define('${constantPrefix}_FILE', __FILE__);
define('${constantPrefix}_PATH', plugin_dir_path(__FILE__));
define('${constantPrefix}_URL', plugin_dir_url(__FILE__));

require_once ${constantPrefix}_PATH . 'includes/class-plugin.php';

register_activation_hook(__FILE__, ['${className}_Plugin', 'activate']);
register_deactivation_hook(__FILE__, ['${className}_Plugin', 'deactivate']);

add_action('plugins_loaded', ['${className}_Plugin', 'boot']);
`;
}

function buildWordPressPluginClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Plugin {
    public static function boot(): void {
        require_once ${constantPrefix}_PATH . 'admin/class-admin.php';
        require_once ${constantPrefix}_PATH . 'public/class-public.php';

        ${className}_Admin::boot();
        ${className}_Public::boot();
    }

    public static function activate(): void {
        flush_rewrite_rules();
    }

    public static function deactivate(): void {
        flush_rewrite_rules();
    }
}
`;
}

function buildWordPressPluginAdminClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Admin {
    public static function boot(): void {
        add_action('admin_menu', [__CLASS__, 'register_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    public static function register_menu(): void {
        add_options_page(
            __('${slug}', '${slug}'),
            __('${slug}', '${slug}'),
            'manage_options',
            '${slug}',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function register_settings(): void {
        register_setting('${slug}', '${slug}_settings', [
            'type' => 'array',
            'sanitize_callback' => [__CLASS__, 'sanitize_settings'],
            'default' => [],
        ]);
    }

    public static function sanitize_settings(array $settings): array {
        return array_map('sanitize_text_field', $settings);
    }

    public static function render_settings_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', '${slug}'));
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('${slug}', '${slug}'); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields('${slug}'); ?>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
`;
}

function buildWordPressPluginPublicClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Public {
    public static function boot(): void {
        add_shortcode('${slug}', [__CLASS__, 'render_shortcode']);
    }

    public static function render_shortcode(array $atts = []): string {
        $atts = shortcode_atts([], $atts, '${slug}');
        return '<div class="${slug}">' . esc_html__('${slug} is ready.', '${slug}') . '</div>';
    }
}
`;
}

function buildWordPressPluginUninstall(slug) {
  return `<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Keep customer data by default. Add explicit cleanup here only when the Owner approves data removal.
delete_option('${slug}_settings');
`;
}

function buildWordPressThemeStyle(slug, name, parent) {
  return `/*
Theme Name: ${name}
${parent ? `Template: ${parent}\n` : ""}Theme URI: https://example.com/
Author: Kabeeri VDF
Description: Kabeeri-scaffolded ${parent ? "child" : "custom"} theme. Keep edits scoped and review responsive/accessibility states.
Version: 0.1.0
Text Domain: ${slug}
*/
`;
}

function buildWordPressThemeFunctions(slug, isChild) {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', function (): void {
    ${isChild ? "wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');\n    " : ""}wp_enqueue_style('${slug}-style', get_stylesheet_uri(), [], '0.1.0');
});
`;
}

function buildWordPressScaffoldReadme(type, slug) {
  return `# ${slug}

Type: WordPress ${type}

Generated by Kabeeri VDF.

## Safety

- Do not edit WordPress core files.
- Keep each change attached to a governed Kabeeri task.
- Use \`kvdf prompt-pack compose wordpress --task <task-id>\` before implementation.
- Run security, accessibility, responsive, and handoff checks before delivery.
`;
}

function inferWordPressSiteType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|store|shop|ecommerce|checkout|cart|product|متجر/.test(value)) return "woocommerce";
  if (/blog|article|personal|مدونة|مقالات/.test(value)) return "blog";
  if (/news|magazine|أخبار/.test(value)) return "news";
  if (/booking|appointment|clinic|حجز|عيادة/.test(value)) return "booking";
  return "corporate";
}

function inferWordPressBlueprint(text) {
  const type = inferWordPressSiteType(text);
  if (type === "woocommerce") return "ecommerce";
  if (type === "blog") return "blog";
  if (type === "news") return "news_website";
  if (type === "booking") return "booking";
  return "corporate_website";
}

function renderWordPressAnalysis(analysis) {
  console.log("WordPress analysis written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected type", analysis.detected_type],
    ["Features", analysis.detected_features.join(", ") || "none"],
    ["Plugins", analysis.plugins.slice(0, 8).join(", ") || "none"],
    ["Themes", analysis.themes.slice(0, 8).join(", ") || "none"],
    ["Blueprint", analysis.recommended_blueprint],
    ["Risk", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  analysis.next_actions.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPlan(plan) {
  console.log("WordPress plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plan_id],
    ["Mode", plan.mode],
    ["Site type", plan.site_type],
    ["Blueprint", plan.blueprint_key],
    ["Delivery", plan.delivery_mode],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Phases:");
  plan.phases.forEach((item) => console.log(`- ${item.phase_id}: ${item.title}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPluginPlan(plan) {
  console.log("WordPress plugin plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plugin_plan_id],
    ["Name", plan.name],
    ["Slug", plan.slug],
    ["Type", plan.plugin_type],
    ["Path", plan.target_path],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Architecture:");
  plan.architecture.forEach((item) => console.log(`- ${item.path}: ${item.purpose}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

function ensurePromptLayerState() {
  const fs = require("fs");
  const path = require("path");
  if (fileExists(".kabeeri")) {
    fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "prompt_layer"), { recursive: true });
    if (!fileExists(".kabeeri/prompt_layer/compositions.json")) writeJsonFile(".kabeeri/prompt_layer/compositions.json", { compositions: [] });
  }
}

function composePromptPack(packName, flags = {}) {
  ensureWorkspace();
  ensurePromptLayerState();
  assertSafeName(packName);
  const manifestPath = `prompt_packs/${packName}/prompt_pack_manifest.json`;
  if (!fileExists(manifestPath)) throw new Error(`Prompt pack not found: ${packName}`);
  const commonManifest = readJsonFile("prompt_packs/common/prompt_pack_manifest.json");
  const packManifest = readJsonFile(manifestPath);
  const taskId = flags.task || null;
  const taskItem = taskId ? getTaskById(taskId) : null;
  if (taskId && !taskItem) throw new Error(`Task not found: ${taskId}`);
  const contextPackId = flags.context || flags["context-pack"] || (taskId ? findLatestContextPackForTask(taskId) : null);
  const context = contextPackId ? getContextPack(contextPackId) : null;
  const selectedPrompt = flags.prompt || selectPromptFileForTask(packManifest, taskItem);
  const promptPath = `prompt_packs/${packName}/${selectedPrompt}`;
  if (!fileExists(promptPath)) throw new Error(`Prompt file not found in ${packName}: ${selectedPrompt}`);
  const commonFiles = (commonManifest.files || []).filter((file) => file.endsWith(".md") && file !== "README.md" && file !== "00_COMMON_PROMPT_LAYER_INDEX.md");
  const commonSections = commonFiles.map((file) => ({
    file,
    content: readTextFile(`prompt_packs/common/${file}`).trim()
  }));
  const stackPrompt = readTextFile(promptPath).trim();
  const idData = readJsonFile(".kabeeri/prompt_layer/compositions.json");
  idData.compositions = idData.compositions || [];
  const id = flags.id || `prompt-composition-${String(idData.compositions.length + 1).padStart(3, "0")}`;
  if (idData.compositions.some((item) => item.composition_id === id)) throw new Error(`Prompt composition already exists: ${id}`);
  const outputPath = flags.output || `.kabeeri/prompt_layer/${id}.md`;
  const composition = {
    composition_id: id,
    pack: packName,
    display_name: packManifest.display_name || packName,
    task_id: taskId,
    context_pack_id: contextPackId || null,
    selected_prompt: selectedPrompt,
    common_layer_version: commonManifest.version || "",
    common_files: commonSections.map((item) => item.file),
    common_policy_gates: commonManifest.policy_gates || [],
    traceability_outputs: commonManifest.traceability_outputs || [],
    output_path: outputPath,
    allowed_files: context ? context.allowed_files || [] : parseCsv(flags["allowed-files"]),
    forbidden_files: context ? context.forbidden_files || [] : parseCsv(flags["forbidden-files"] || ".env,secrets/,.git/"),
    acceptance_criteria: taskItem ? taskItem.acceptance_criteria || [] : [],
    estimated_tokens: estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem),
    created_at: new Date().toISOString()
  };
  writeTextFile(outputPath, buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context));
  idData.compositions.push(composition);
  writeJsonFile(".kabeeri/prompt_layer/compositions.json", idData);
  appendAudit("prompt_layer.composed", "prompt_composition", id, `Composed ${packName} prompt for ${taskId || "manual use"}`);
  console.log(JSON.stringify(composition, null, 2));
}

function selectPromptFileForTask(manifest, taskItem) {
  const files = manifest.files || [];
  const title = buildPromptSelectionText(taskItem);
  let bestRule = null;
  for (const rule of manifest.prompt_selection_keywords || []) {
    const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
    if (!rule.file || !files.includes(rule.file)) continue;
    const score = keywords.reduce((sum, keyword) => sum + (promptKeywordMatches(title, keyword) ? 1 : 0), 0);
    if (score > 0 && (!bestRule || score > bestRule.score)) bestRule = { file: rule.file, score };
  }
  if (bestRule) return bestRule.file;
  const candidates = [
    [["test", "qa", "review", "verify"], /test|review/i],
    [["permission", "notification", "camera", "location", "media", "device", "push"], /permission|notification|device/i],
    [["offline", "cache", "storage", "local"], /offline|storage|cache/i],
    [["auth", "user", "login", "permission", "role"], /auth|user|role|permission/i],
    [["form", "validation"], /form|validation/i],
    [["env", "config", "secret", "api url", "base url"], /env|config|api/i],
    [["route", "routing", "layout", "page"], /routing|layout|page/i],
    [["component", "design", "ui", "frontend"], /component|design|ui/i],
    [["api", "data", "fetch", "http", "controller"], /api|data|http|controller|route/i],
    [["release", "handoff"], /release|handoff/i]
  ];
  for (const [keywords, filePattern] of candidates) {
    if (keywords.some((keyword) => promptKeywordMatches(title, keyword))) {
      const found = files.find((file) => filePattern.test(file) && file.endsWith(".md"));
      if (found) return found;
    }
  }
  return files.find((file) => /^01_.*\.md$/.test(file)) || files.find((file) => file.endsWith(".md") && !file.includes("README")) || "README.md";
}

function buildPromptSelectionText(taskItem) {
  if (!taskItem) return "";
  return [
    taskItem.title,
    taskItem.type,
    taskItem.workstream,
    ...(Array.isArray(taskItem.workstreams) ? taskItem.workstreams : []),
    taskItem.description,
    taskItem.notes,
    ...(Array.isArray(taskItem.acceptance_criteria) ? taskItem.acceptance_criteria : [])
  ].filter(Boolean).join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

function promptKeywordMatches(text, keyword) {
  const value = String(keyword || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!value) return false;
  const escaped = value.split(" ").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem) {
  const chars = commonSections.reduce((sum, item) => sum + item.content.length, 0)
    + stackPrompt.length
    + JSON.stringify(context || {}).length
    + JSON.stringify(taskItem || {}).length;
  return Math.ceil(chars / 4);
}

function buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context) {
  return `# Composed Kabeeri Prompt - ${composition.composition_id}

Pack: ${composition.display_name}
Task: ${composition.task_id || "manual"}
Context pack: ${composition.context_pack_id || "none"}
Selected stack prompt: ${composition.selected_prompt}

## Execution Contract

- Work only on the task described below.
- Use the allowed files and forbidden files as hard scope boundaries.
- Follow the common prompt layer before the stack-specific prompt.
- Treat common policy gates as blockers when the task touches those areas.
- Preserve traceability through task evidence, AI run history, ADRs, captures, and handoff notes when relevant.
- Record AI run history after execution with \`kvdf ai-run record\`.
- If the output is useful, review it with \`kvdf ai-run accept\`; otherwise use \`kvdf ai-run reject\`.

## Task

${taskItem ? `Title: ${taskItem.title}
Status: ${taskItem.status}
Workstreams: ${taskWorkstreams(taskItem).join(", ")}
Source: ${taskItem.source || ""}
Acceptance:
${(taskItem.acceptance_criteria || []).length ? taskItem.acceptance_criteria.map((item) => `- ${item}`).join("\n") : "- None listed."}` : "No task was attached. Use this only for planning or a manually reviewed action."}

## Scope

Allowed files:
${composition.allowed_files.length ? composition.allowed_files.map((item) => `- ${item}`).join("\n") : "- None listed. Ask before editing broad areas."}

Forbidden files:
${composition.forbidden_files.length ? composition.forbidden_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Common Governance Checklist

Policy gates:
${composition.common_policy_gates.length ? composition.common_policy_gates.map((item) => `- ${item}`).join("\n") : "- None declared by common layer."}

Traceability outputs:
${composition.traceability_outputs.length ? composition.traceability_outputs.map((item) => `- ${item}`).join("\n") : "- None declared by common layer."}

## Context Pack

${context ? `Goal: ${context.goal || ""}
Required specs:
${(context.required_specs || []).length ? context.required_specs.map((item) => `- ${item}`).join("\n") : "- None listed."}

Open questions:
${(context.open_questions || []).length ? context.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

Memory summary:
${context.memory_summary || "No memory summary."}

Compact Guidance:
${renderCompactGuidance(context.compact_guidance)}` : "No context pack attached."}

## Common Prompt Layer

${commonSections.map((section) => `### ${section.file}\n\n${section.content}`).join("\n\n")}

## Stack-specific Prompt

${stackPrompt}
`;
}

function renderCompactGuidance(compactGuidance) {
  if (!compactGuidance) return "- None recorded.";
  const lines = [
    `- Task kind: ${compactGuidance.task_kind || "unknown"}`,
    `- Execution mode: ${compactGuidance.execution_mode || "guided_first"}`,
    `- Recommended model class: ${compactGuidance.recommended_model_class || "balanced"}`,
    `- Routing reason: ${compactGuidance.routing_reason || "No routing reason recorded."}`,
    `- Token-saving hint: ${compactGuidance.token_saving_hint || ""}`
  ];
  if ((compactGuidance.key_acceptance_summary || []).length) {
    lines.push("- Key acceptance summary:");
    lines.push(...compactGuidance.key_acceptance_summary.map((item) => `  - ${item}`));
  }
  if ((compactGuidance.open_questions || []).length) {
    lines.push("- Open questions:");
    lines.push(...compactGuidance.open_questions.map((item) => `  - ${item}`));
  }
  if (compactGuidance.ui_decisions && compactGuidance.ui_decisions.pending_count) {
    lines.push(`- Pending UI decisions: ${compactGuidance.ui_decisions.pending_count}`);
    lines.push(...compactGuidance.ui_decisions.pending_titles.map((item) => `  - ${item}`));
  }
  if ((compactGuidance.next_actions || []).length) {
    lines.push("- Next actions:");
    lines.push(...compactGuidance.next_actions.map((item) => `  - ${item}`));
  }
  return lines.join("\n");
}

function questionnaire(action, value, flags = {}) {
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
    return questionnaireAnswer(value, flags);
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

function questionnaireAnswer(questionId, flags = {}) {
  ensureWorkspace();
  const id = flags.question || questionId;
  if (!id) throw new Error("Missing question id.");
  if (flags.value === undefined && flags.answer === undefined) throw new Error("Missing --value.");
  const value = String(flags.value !== undefined ? flags.value : flags.answer);
  const answersFile = ".kabeeri/questionnaires/answers.json";
  const sourcesFile = ".kabeeri/questionnaires/answer_sources.json";
  const data = readJsonFile(answersFile);
  data.answers = data.answers || [];
  const existing = data.answers.find((answer) => answer.question_id === id);
  const areaIds = parseCsv(flags.areas || inferQuestionAreas(id).join(","));
  const item = {
    answer_id: existing ? existing.answer_id : `answer-${String(data.answers.length + 1).padStart(3, "0")}`,
    question_id: id,
    value,
    area_ids: areaIds,
    answered_by: flags.by || flags.actor || "local-user",
    answered_at: new Date().toISOString(),
    confidence: flags.confidence || inferAnswerConfidence(value),
    source: flags.source || "questionnaire",
    source_mode: flags["source-mode"] || "direct",
    delivery_mode: flags["delivery-mode"] || null,
    intake_mode: flags["intake-mode"] || "adaptive"
  };
  if (existing) Object.assign(existing, item);
  else data.answers.push(item);
  writeJsonFile(answersFile, data);

  const sources = readJsonFile(sourcesFile);
  sources.sources = sources.sources || [];
  sources.sources.push({
    source_id: `source-${String(sources.sources.length + 1).padStart(3, "0")}`,
    answer_id: item.answer_id,
    question_id: id,
    source_mode: item.source_mode,
    recorded_at: item.answered_at,
    summary: `Answer recorded for ${id}`
  });
  writeJsonFile(sourcesFile, sources);

  const matrix = buildCoverageMatrix();
  writeQuestionnaireReports(matrix);
  appendAudit("questionnaire.answer_recorded", "questionnaire", item.answer_id, `Answer recorded for ${id}`);
  console.log(`Recorded answer ${item.answer_id} for ${id}`);
}

function questionnaireIntakePlan(value, flags = {}) {
  ensureWorkspace();
  const description = flags.description || flags.text || flags.project || value || "";
  const blueprintKey = flags.blueprint || getCurrentBlueprintKey() || inferQuestionnaireBlueprint(description, flags);
  if (!blueprintKey) throw new Error("Missing project description or selected blueprint. Use `kvdf questionnaire plan \"Build ecommerce store...\"` or `--blueprint ecommerce`.");
  const plan = buildQuestionnaireIntakePlan(description || blueprintKey, blueprintKey, flags);
  const file = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  if (!fileExists(file)) writeJsonFile(file, { plans: [], current_plan_id: null });
  const state = readJsonFile(file);
  state.plans = state.plans || [];
  state.plans.push(plan);
  state.current_plan_id = plan.plan_id;
  writeJsonFile(file, state);
  appendAudit("questionnaire.intake_plan_created", "questionnaire", plan.plan_id, `Questionnaire intake plan created for ${blueprintKey}`);
  if (!flags.silent) {
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderQuestionnaireIntakePlan(plan);
  }
  return plan;
}

function vibe(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  vibeInteractions.ensureInteractionsState();
  const verb = String(action || "suggest").toLowerCase();
  const knownActions = new Set(["suggest", "ask", "capture", "list", "show", "convert", "approve", "reject", "plan", "brief", "next", "session"]);
  const message = knownActions.has(verb)
    ? [value, ...rest].filter(Boolean).join(" ").trim()
    : [action, value, ...rest].filter(Boolean).join(" ").trim();
  const effectiveAction = knownActions.has(verb) ? verb : "suggest";

  if (effectiveAction === "list") {
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    console.log(table(["Suggestion", "Title", "Workstream", "Risk", "Status"], suggestions.map((item) => [
      item.suggestion_id,
      item.title,
      item.workstream,
      item.risk_level,
      item.status
    ])));
    return;
  }

  if (effectiveAction === "brief") {
    return vibeInteractions.vibeBrief(flags);
  }

  if (effectiveAction === "next") {
    return vibeInteractions.vibeNext(flags);
  }

  if (effectiveAction === "session") {
    return vibeInteractions.vibeSession(value, flags, rest, { appendAudit });
  }

  if (effectiveAction === "show") {
    const id = value || flags.id;
    if (!id) throw new Error("Missing suggestion id.");
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    const found = suggestions.find((item) => item.suggestion_id === id);
    if (!found) throw new Error(`Suggested task not found: ${id}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (effectiveAction === "approve") {
    return approveVibeSuggestion(value || flags.id, flags);
  }

  if (effectiveAction === "convert") {
    return convertVibeSuggestion(value || flags.id, flags);
  }

  if (effectiveAction === "reject") {
    return updateVibeSuggestionStatus(value || flags.id, "rejected", flags.reason || "");
  }

  if (effectiveAction === "capture") {
    return capturePostWork(message, flags);
  }

  if (!message) throw new Error("Missing natural language request.");
  const intent = classifyVibeIntent(message, flags);
  vibeInteractions.attachIntentToVibeSession(intent, flags);
  vibeInteractions.appendJsonLine(".kabeeri/interactions/user_intents.jsonl", intent);
  appendAudit("vibe.intent_classified", "intent", intent.intent_id, `Vibe intent classified: ${intent.intent_type}`);

  if (effectiveAction === "ask" || intent.intent_type === "ask_question" || (intent.is_vague && effectiveAction !== "plan")) {
    const response = buildVibeAskResponse(intent);
    if (!flags.json) {
      console.log(response.lines.join("\n"));
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  const createdSuggestions = effectiveAction === "plan"
    ? buildVibePlanSuggestions(intent, flags)
    : [buildSuggestedTaskCard(intent, flags)];
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  data.suggested_tasks = data.suggested_tasks || [];
  data.suggested_tasks.push(...createdSuggestions);
  writeJsonFile(file, data);
  vibeInteractions.attachSuggestionsToVibeSession(createdSuggestions, flags);
  refreshDashboardArtifacts();
  for (const suggestion of createdSuggestions) {
    appendAudit("vibe.task_suggested", "suggestion", suggestion.suggestion_id, `Suggested task: ${suggestion.title}`);
  }
  console.log(JSON.stringify(createdSuggestions.length === 1 ? createdSuggestions[0] : { suggestions: createdSuggestions }, null, 2));
}

function ensureInteractionsState() {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(repoRoot(), ".kabeeri", "interactions");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/interactions/suggested_tasks.json")) writeJsonFile(".kabeeri/interactions/suggested_tasks.json", { suggested_tasks: [] });
  if (!fileExists(".kabeeri/interactions/post_work_captures.json")) writeJsonFile(".kabeeri/interactions/post_work_captures.json", { captures: [] });
  if (!fileExists(".kabeeri/interactions/vibe_sessions.json")) writeJsonFile(".kabeeri/interactions/vibe_sessions.json", { sessions: [], current_session_id: null });
  if (!fileExists(".kabeeri/interactions/context_briefs.json")) writeJsonFile(".kabeeri/interactions/context_briefs.json", { briefs: [] });
  if (!fs.existsSync(path.join(dir, "user_intents.jsonl"))) fs.writeFileSync(path.join(dir, "user_intents.jsonl"), "", "utf8");
}

function classifyVibeIntent(text, flags = {}) {
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const normalized = String(text || "").toLowerCase();
  const detectedWorkstreams = detectVibeWorkstreams(normalized);
  const riskLevel = detectVibeRisk(normalized, detectedWorkstreams);
  const intentType = flags.type || detectVibeIntentType(normalized);
  const missingDetails = detectVibeMissingDetails(normalized, intentType, detectedWorkstreams);
  const isVague = missingDetails.length > 0 || detectVagueIntent(normalized);
  return {
    intent_id: `intent-${String(intents.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    actor_id: flags.actor || "local-user",
    language: detectLanguage(text),
    text,
    intent_type: intentType,
    confidence: isVague ? 0.62 : 0.86,
    risk_level: riskLevel,
    detected_workstreams: detectedWorkstreams,
    missing_details: missingDetails,
    is_vague: isVague,
    suggested_next_action: isVague ? "ask_clarifying_question" : "create_suggested_task_card",
    status: "classified"
  };
}

function detectVibeIntentType(text) {
  if (matchesWords(text, ["?", "ازاي", "كيف", "what", "how", "هل"])) return "ask_question";
  if (matchesWords(text, ["capture", "سجل", "لخص اللي اتعمل", "post-work"])) return "capture_work";
  if (matchesWords(text, ["review", "راجع", "مراجعة"])) return "review_work";
  if (matchesWords(text, ["verify", "تحقق", "اعتماد"])) return "verify_task";
  if (matchesWords(text, ["cost", "تكلفة", "tokens", "budget"])) return "estimate_cost";
  if (matchesWords(text, ["github", "issue", "sync"])) return "sync_github";
  if (matchesWords(text, ["release", "publish", "نشر", "إصدار"])) return "publish_or_release";
  if (matchesWords(text, ["docs", "وثائق", "documentation"])) return "generate_docs";
  if (matchesWords(text, ["test", "validate", "check", "اختبار", "تشيك"])) return "run_check";
  return "create_task";
}

function detectVibeWorkstreams(text) {
  const matches = [];
  const rules = [
    ["backend", ["api", "backend", "server", "controller", "service", "laravel", "باك", "سيرفر"]],
    ["public_frontend", ["public", "frontend", "react", "vue", "angular", "page", "landing", "visitor", "فرونت", "واجهة", "صفحة"]],
    ["admin_frontend", ["admin", "dashboard", "settings", "backoffice", "أدمن", "داشبورد", "إعدادات"]],
    ["mobile", ["mobile", "ios", "android", "expo", "react native", "flutter", "device", "notification", "camera", "موبايل", "تطبيق موبايل"]],
    ["database", ["database", "migration", "schema", "table", "db", "داتابيز", "قاعدة", "جدول"]],
    ["qa", ["test", "tests", "qa", "acceptance", "اختبار", "تست"]],
    ["devops", ["deploy", "hosting", "ci", "docker", "github actions", "نشر", "استضافة"]],
    ["security", ["auth", "login", "permission", "secret", "secrets", "privacy", "صلاحيات", "أمان", "تسجيل دخول"]],
    ["docs", ["docs", "readme", "guide", "handoff", "وثائق", "دليل"]]
  ];
  for (const [stream, words] of rules) {
    if (matchesWords(text, words)) matches.push(stream);
  }
  return matches.length ? [...new Set(matches)] : ["docs"];
}

function detectVibeRisk(text, workstreams) {
  if (matchesWords(text, ["production", "publish", "migration", "auth", "payments", "secrets", "owner transfer", "delete", "overwrite", "نشر", "حذف", "مدفوعات", "صلاحيات"])) return "high";
  if ((workstreams || []).length > 1) return "medium";
  if (matchesWords(text, ["dashboard", "api", "database", "admin", "داشبورد", "داتابيز"])) return "medium";
  return "low";
}

function detectVibeMissingDetails(text, intentType, workstreams) {
  const missing = [];
  if (intentType === "create_task") {
    if (text.length < 18) missing.push("clear target surface");
    if (!matchesWords(text, ["user", "admin", "owner", "developer", "client", "مستخدم", "أدمن", "عميل", "مالك"])) missing.push("target user or actor");
    if (!matchesWords(text, ["when", "must", "should", "can", "save", "accept", "ready", "لازم", "يقدر", "يظهر", "يمنع"])) missing.push("acceptance criteria");
  }
  if ((workstreams || []).length > 1 && !matchesWords(text, ["integration", "ربط", "connect", "wire"])) missing.push("split or integration decision");
  return missing;
}

function detectVagueIntent(text) {
  return matchesWords(text, ["make it better", "fix everything", "improve ui", "clean the project", "production ready", "add dashboard", "connect payments", "حسن", "ظبط", "نضف", "طور الموضوع"]);
}

function buildSuggestedTaskCard(intent, flags = {}) {
  const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
  const workstream = flags.workstream || intent.detected_workstreams[0] || "docs";
  const taskType = intent.detected_workstreams.length > 1 ? "integration" : "feature";
  const title = flags.title || titleFromIntent(intent.text, workstream);
  return {
    suggestion_id: `suggestion-${String(suggestions.length + 1).padStart(3, "0")}`,
    source_intent_id: intent.intent_id,
    title,
    workstream,
    workstreams: intent.detected_workstreams,
    task_type: taskType,
    summary: intent.text,
    allowed_files: getWorkstreamPathRules(workstream),
    forbidden_files: defaultForbiddenFiles(),
    acceptance_criteria: buildVibeAcceptanceCriteria(intent, workstream),
    risk_level: intent.risk_level,
    estimated_cost_level: intent.risk_level === "high" ? "high" : intent.risk_level === "medium" ? "medium" : "low",
    approval_required: intent.risk_level !== "low" || taskType === "integration",
    suggested_assignee_role: workstream === "docs" ? "Maintainer" : "AI Developer",
    missing_details: intent.missing_details,
    status: "suggested",
    created_at: new Date().toISOString()
  };
}

function buildVibePlanSuggestions(intent, flags = {}) {
  const base = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
  const text = String(intent.text || "").toLowerCase();
  const templates = detectVibePlanTemplates(text);
  const workItems = templates.length ? templates : intent.detected_workstreams.map((stream) => ({
    title: titleFromIntent(intent.text, stream),
    workstream: stream,
    summary: intent.text,
    acceptance: [`${stream} scope is defined before implementation.`]
  }));
  return workItems.map((item, index) => {
    const stream = item.workstream || "docs";
    return {
      suggestion_id: `suggestion-${String(base.length + index + 1).padStart(3, "0")}`,
      source_intent_id: intent.intent_id,
      title: item.title,
      workstream: stream,
      workstreams: [stream],
      task_type: item.type || "feature",
      summary: item.summary || intent.text,
      allowed_files: getWorkstreamPathRules(stream),
      forbidden_files: defaultForbiddenFiles(),
      acceptance_criteria: item.acceptance || buildVibeAcceptanceCriteria(intent, stream),
      risk_level: item.risk || intent.risk_level,
      estimated_cost_level: item.cost || (intent.risk_level === "high" ? "high" : "medium"),
      approval_required: item.risk === "high" || intent.risk_level === "high",
      suggested_assignee_role: stream === "docs" ? "Maintainer" : "AI Developer",
      missing_details: [],
      status: "suggested",
      plan_group_id: intent.intent_id,
      created_at: new Date().toISOString()
    };
  });
}

function detectVibePlanTemplates(text) {
  if (!matchesWords(text, ["ecommerce", "e-commerce", "store", "shop", "checkout", "cart", "متجر", "سلة", "منتجات", "دفع"])) return [];
  return [
    {
      title: "Design ecommerce data model for products carts and orders",
      workstream: "database",
      type: "foundation",
      summary: "Create the database model for products, carts, orders, order items, and customer ownership.",
      acceptance: ["Product, cart, and order entities are listed.", "Required indexes and relationships are documented.", "Migration risks and rollback notes are captured."]
    },
    {
      title: "Build product catalog API",
      workstream: "backend",
      summary: "Expose product listing and detail endpoints for the storefront.",
      acceptance: ["Customers can list published products.", "Product detail endpoint returns price, stock, and media fields.", "Unauthorized admin-only fields are not exposed."]
    },
    {
      title: "Build public storefront product browsing",
      workstream: "public_frontend",
      summary: "Create the customer-facing product grid and product detail experience.",
      acceptance: ["Customers can browse product cards.", "Product detail page shows price and availability.", "Empty and loading states are handled."]
    },
    {
      title: "Build cart and checkout workflow",
      workstream: "backend",
      risk: "high",
      summary: "Implement cart mutation and checkout preparation workflow.",
      acceptance: ["Customers can add, update, and remove cart items.", "Checkout validates totals server-side.", "Payment integration boundaries are documented before live payment."]
    },
    {
      title: "Build admin product management screen",
      workstream: "admin_frontend",
      summary: "Create admin UI for creating and updating products.",
      acceptance: ["Owner can create and edit products.", "Validation errors are visible.", "Draft/published status is clear."]
    },
    {
      title: "Add ecommerce acceptance tests",
      workstream: "qa",
      type: "qa",
      summary: "Cover catalog, cart, checkout, and admin product management flows.",
      acceptance: ["Catalog happy path is tested.", "Cart mutation edge cases are tested.", "Admin product permissions are tested."]
    }
  ];
}

function titleFromIntent(text, workstream) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const prefix = workstream === "docs" ? "Document" : "Implement";
  if (!clean) return `${prefix} ${workstream} task`;
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}

function buildVibeAcceptanceCriteria(intent, workstream) {
  const base = [
    `Scope is limited to ${workstream}.`,
    "Changed files stay inside the suggested execution scope.",
    "Owner or reviewer can verify the result from the task summary."
  ];
  if (intent.risk_level === "high") base.push("High-risk behavior is covered by an explicit check or approval note.");
  if (intent.detected_workstreams.length > 1) base.push("Cross-workstream integration points are listed before implementation.");
  return base;
}

function buildVibeAskResponse(intent) {
  const questions = intent.missing_details.slice(0, 3).map((item) => `- Clarify ${item}.`);
  if (questions.length === 0) questions.push("- Confirm whether you want a suggested task card or only an explanation.");
  return {
    intent,
    lines: [
      `Intent: ${intent.intent_type}`,
      `Likely workstream: ${intent.detected_workstreams.join(", ")}`,
      `Risk: ${intent.risk_level}`,
      "",
      "Before creating a governed task:",
      ...questions,
      "",
      "Safe next step: run `kvdf vibe suggest \"...\"` with the clarified request."
    ]
  };
}

function convertVibeSuggestion(id, flags = {}) {
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "convert vibe suggestion");
  if (!id) throw new Error("Missing suggestion id.");
  const suggestionsFile = ".kabeeri/interactions/suggested_tasks.json";
  const suggestions = readJsonFile(suggestionsFile);
  const item = (suggestions.suggested_tasks || []).find((entry) => entry.suggestion_id === id);
  if (!item) throw new Error(`Suggested task not found: ${id}`);
  if (item.status === "converted_to_task") throw new Error(`Suggested task already converted: ${id}`);
  if (item.status === "rejected") throw new Error(`Suggested task is rejected and cannot be converted: ${id}`);
  if (item.approval_required && item.status !== "approved" && flags.force !== true && flags.force !== "true") {
    throw new Error(`Suggested task requires approval before conversion: ${id}. Run \`kvdf vibe approve ${id}\` or pass --force true with Owner authority.`);
  }
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  const workstreams = item.workstreams && item.workstreams.length ? item.workstreams : [item.workstream || "docs"];
  validateTaskBoundaryCreation(item.task_type || "general", workstreams, []);
  const taskItem = {
    id: taskId,
    title: item.title,
    status: "proposed",
    type: item.task_type || "general",
    workstream: workstreams[0],
    workstreams,
    source: `vibe:${item.source_intent_id}`,
    acceptance_criteria: item.acceptance_criteria || [],
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  item.status = "converted_to_task";
  item.task_id = taskId;
  item.converted_at = new Date().toISOString();
  writeJsonFile(tasksFile, data);
  writeJsonFile(suggestionsFile, suggestions);
  refreshDashboardArtifacts();
  appendAudit("vibe.suggestion_converted", "task", taskId, `Vibe suggestion converted: ${id}`);
  console.log(`Converted ${id} to ${taskId}`);
}

function approveVibeSuggestion(id, flags = {}) {
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "approve vibe suggestion");
  if (!id) throw new Error("Missing suggestion id.");
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  const item = (data.suggested_tasks || []).find((entry) => entry.suggestion_id === id);
  if (!item) throw new Error(`Suggested task not found: ${id}`);
  if (item.status === "converted_to_task") throw new Error(`Suggested task already converted: ${id}`);
  if (item.status === "rejected") throw new Error(`Suggested task is rejected and cannot be approved: ${id}`);
  item.status = "approved";
  item.approved_at = new Date().toISOString();
  item.approved_by = flags.actor || flags.approved_by || flags["approved-by"] || "local-owner";
  item.approval_note = flags.note || flags.reason || "";
  item.updated_at = item.approved_at;
  writeJsonFile(file, data);
  refreshDashboardArtifacts();
  appendAudit("vibe.suggestion_approved", "suggestion", id, `Vibe suggestion approved`);
  if (flags.json) console.log(JSON.stringify(item, null, 2));
  else console.log(`Suggestion ${id} approved. Next: kvdf vibe convert ${id}`);
}

function updateVibeSuggestionStatus(id, status, reason) {
  if (!id) throw new Error("Missing suggestion id.");
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  const item = (data.suggested_tasks || []).find((entry) => entry.suggestion_id === id);
  if (!item) throw new Error(`Suggested task not found: ${id}`);
  item.status = status;
  item.status_reason = reason;
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
  refreshDashboardArtifacts();
  appendAudit(`vibe.suggestion_${status}`, "suggestion", id, `Vibe suggestion ${status}`);
  console.log(`Suggestion ${id} is ${status}`);
}

function capturePostWork(message, flags = {}) {
  const parts = String(message || "").trim().split(/\s+/).filter(Boolean);
  const captureActions = new Set(["list", "show", "scan", "detect", "evidence", "reject", "link", "convert", "resolve"]);
  if (parts.length > 0 && captureActions.has(parts[0]) && (["scan", "detect"].includes(parts[0]) || !flags.summary)) {
    return capturePostWorkAction(parts[0], parts[1] || flags.id, flags);
  }
  const analysis = analyzePostWorkCapture(message || flags.summary, flags);
  assertNoProtectedFrameworkFiles(analysis.changedFiles, flags);
  if (flags.task && !analysis.matchedTask) throw new Error(`Task not found: ${flags.task}`);
  const aiRunIds = uniqueList(parseCsv(flags["ai-run"] || flags.ai_run || flags.run || flags.runs));
  const file = ".kabeeri/interactions/post_work_captures.json";
  const data = readJsonFile(file);
  data.captures = data.captures || [];
  const capture = {
    capture_id: `capture-${String(data.captures.length + 1).padStart(3, "0")}`,
    captured_at: new Date().toISOString(),
    task_id: analysis.matchedTask ? analysis.matchedTask.id : null,
    summary: analysis.text,
    files_changed: analysis.changedFiles,
    file_details: analysis.changedFileDetails,
    detected_workstreams: analysis.intent.detected_workstreams,
    app_usernames: analysis.appUsernames,
    risk_level: analysis.intent.risk_level,
    classification: analysis.classification,
    task_matches: analysis.taskMatches,
    checks_run: parseCsv(flags.checks),
    risks: parseCsv(flags.risks),
    acceptance_evidence: parseCsv(flags.evidence || flags.acceptance),
    ai_run_ids: aiRunIds,
    primary_ai_run_id: aiRunIds[0] || null,
    provenance: buildCaptureProvenance({
      capture_id: `capture-${String(data.captures.length + 1).padStart(3, "0")}`,
      task_id: analysis.matchedTask ? analysis.matchedTask.id : null,
      ai_run_ids: aiRunIds,
      classification: analysis.classification
    }),
    missing_evidence: buildCaptureMissingEvidence(flags, analysis.changedFiles),
    owner_verify_required: captureOwnerVerifyRequired(analysis.classification, analysis.intent.risk_level),
    recommended_next_action: captureNextAction(analysis.classification, analysis.matchedTask),
    status: analysis.classification === "matches_existing_task" ? "linked" : "captured"
  };
  data.captures.push(capture);
  writeJsonFile(file, data);
  if (aiRunIds.length) linkCaptureToAiRuns(capture.capture_id, aiRunIds);
  vibeInteractions.attachCaptureToVibeSession(capture, flags);
  vibeInteractions.appendJsonLine(".kabeeri/interactions/user_intents.jsonl", analysis.intent);
  refreshDashboardArtifacts();
  appendAudit("vibe.post_work_captured", "capture", capture.capture_id, `Post-work capture recorded`, {
    capture_id: capture.capture_id,
    task_id: capture.task_id || null,
    ai_run_ids: capture.ai_run_ids || [],
    classification: capture.classification
  });
  console.log(JSON.stringify(capture, null, 2));
}

function analyzePostWorkCapture(message, flags = {}) {
  const changedFileDetails = flags.files
    ? parseCsv(flags.files).map((file) => ({ file, status: "manual", raw: file }))
    : getGitChangedFileDetails();
  const changedFiles = changedFileDetails.map((item) => item.file);
  const text = message || flags.summary || "Post-work capture";
  const intent = classifyVibeIntent(`${text} ${changedFiles.join(" ")}`, { ...flags, type: "capture_work" });
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const matchedTask = flags.task ? getTaskById(flags.task) : inferCaptureTaskMatch(text, changedFiles, intent.detected_workstreams, tasks);
  const appUsernames = inferCaptureApps(changedFiles);
  const classification = classifyCapture(flags, matchedTask, changedFiles, appUsernames);
  const taskMatches = buildCaptureTaskMatches(text, changedFiles, intent.detected_workstreams, tasks).slice(0, 5);
  return {
    scan_id: `capture-scan-${Date.now()}`,
    generated_at: new Date().toISOString(),
    text,
    changedFileDetails,
    changedFiles,
    intent,
    matchedTask,
    appUsernames,
    classification,
    taskMatches,
    missing_evidence: buildCaptureMissingEvidence(flags, changedFiles),
    owner_verify_required: captureOwnerVerifyRequired(classification, intent.risk_level),
    recommended_next_action: captureNextAction(classification, matchedTask),
    would_create_capture: true
  };
}

function capturePostWorkAction(action, id, flags = {}) {
  const file = ".kabeeri/interactions/post_work_captures.json";
  const data = readJsonFile(file);
  data.captures = data.captures || [];

  if (action === "scan" || action === "detect") {
    const analysis = analyzePostWorkCapture(flags.summary || "", flags);
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  if (action === "list") {
    const rows = data.captures.map((item) => [
      item.capture_id,
      item.task_id || "",
      item.classification || "",
      item.status || "",
      (item.detected_workstreams || []).join(","),
      item.summary || ""
    ]);
    console.log(table(["Capture", "Task", "Classification", "Status", "Workstreams", "Summary"], rows));
    return;
  }

  const capture = data.captures.find((item) => item.capture_id === id);
  if (!capture) throw new Error(`Capture not found: ${id || ""}`);

  if (action === "show") {
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "evidence") {
    capture.checks_run = uniqueList([...(capture.checks_run || []), ...parseCsv(flags.checks)]);
    capture.acceptance_evidence = uniqueList([...(capture.acceptance_evidence || []), ...parseCsv(flags.evidence || flags.acceptance)]);
    capture.risks = uniqueList([...(capture.risks || []), ...parseCsv(flags.risks)]);
    capture.missing_evidence = buildCaptureMissingEvidenceFromRecord(capture);
    capture.updated_at = new Date().toISOString();
    capture.recommended_next_action = capture.missing_evidence.length
      ? "add missing capture evidence before resolving"
      : captureNextAction(capture.classification, capture.task_id ? getTaskById(capture.task_id) : null);
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_evidence_added", "capture", capture.capture_id, `Capture evidence updated`, {
      capture_id: capture.capture_id,
      task_id: capture.task_id || null,
      ai_run_ids: capture.ai_run_ids || [],
      checks_run: capture.checks_run || []
    });
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "reject") {
    capture.status = "rejected";
    capture.rejected_at = new Date().toISOString();
    capture.rejection_reason = flags.reason || "rejected";
    capture.recommended_next_action = "no further action unless work should be recaptured";
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_rejected", "capture", capture.capture_id, `Capture rejected`, {
      capture_id: capture.capture_id,
      task_id: capture.task_id || null,
      ai_run_ids: capture.ai_run_ids || [],
      rejection_reason: capture.rejection_reason
    });
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "link") {
    const taskId = flags.task || flags.to || flags.id;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    capture.task_id = taskId;
    capture.classification = "matches_existing_task";
    capture.status = "linked";
    capture.linked_at = new Date().toISOString();
    capture.recommended_next_action = `review task ${taskId} and attach capture evidence`;
    capture.provenance = {
      ...(capture.provenance || {}),
      task_id: taskId
    };
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_linked", "capture", capture.capture_id, `Capture linked to ${taskId}`, {
      capture_id: capture.capture_id,
      task_id: taskId,
      ai_run_ids: capture.ai_run_ids || []
    });
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "convert") {
    assertNoProtectedFrameworkFiles(capture.files_changed || [], flags);
    const taskId = convertCaptureToTask(capture, flags);
    capture.task_id = taskId;
    capture.classification = "converted_to_task";
    capture.status = "converted_to_task";
    capture.converted_at = new Date().toISOString();
    capture.recommended_next_action = `review and approve ${taskId}`;
    capture.provenance = {
      ...(capture.provenance || {}),
      task_id: taskId
    };
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_converted", "task", taskId, `Capture converted to task`, {
      capture_id: capture.capture_id,
      task_id: taskId,
      ai_run_ids: capture.ai_run_ids || []
    });
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "resolve") {
    if ((capture.missing_evidence || []).length && flags.force !== true && flags.force !== "true") {
      throw new Error(`Capture still has missing evidence: ${capture.missing_evidence.join(", ")}. Add evidence or use --force true.`);
    }
    capture.status = "resolved";
    capture.resolved_at = new Date().toISOString();
    capture.resolution = flags.reason || flags.summary || "resolved";
    capture.provenance = {
      ...(capture.provenance || {}),
      resolved_at: capture.resolved_at
    };
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_resolved", "capture", capture.capture_id, `Capture resolved`, {
      capture_id: capture.capture_id,
      task_id: capture.task_id || null,
      ai_run_ids: capture.ai_run_ids || [],
      resolution: capture.resolution
    });
    console.log(JSON.stringify(capture, null, 2));
  }
}

function convertCaptureToTask(capture, flags = {}) {
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  if (data.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = capture.detected_workstreams && capture.detected_workstreams.length ? capture.detected_workstreams : ["docs"];
  const appUsernames = capture.app_usernames || [];
  const appLinks = resolveTaskApps(appUsernames);
  const taskType = flags.type || (workstreams.length > 1 || appLinks.length > 1 ? "integration" : "general");
  validateTaskBoundaryCreation(taskType, workstreams, appLinks);
  const taskItem = {
    id: taskId,
    title: flags.title || capture.summary || `Review ${capture.capture_id}`,
    status: "proposed",
    type: taskType,
    workstream: workstreams[0],
    workstreams,
    app_usernames: appLinks.map((appItem) => appItem.username),
    app_username: appLinks[0] ? appLinks[0].username : null,
    app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
    source: `capture:${capture.capture_id}`,
    source_ai_run_ids: capture.ai_run_ids || capture.source_ai_run_ids || [],
    acceptance_criteria: buildCaptureAcceptanceCriteria(capture),
    capture_id: capture.capture_id,
    provenance: buildTaskProvenanceFromCapture(capture),
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  writeJsonFile(tasksFile, data);
  return taskId;
}

function buildCaptureProvenance({ capture_id, task_id, ai_run_ids = [], classification = "" }) {
  return {
    capture_id,
    task_id: task_id || null,
    ai_run_ids: uniqueList(ai_run_ids),
    classification,
    source: "post_work_capture"
  };
}

function buildTaskProvenanceFromCapture(capture) {
  return {
    source: capture.capture_id ? `capture:${capture.capture_id}` : "capture",
    capture_id: capture.capture_id || null,
    ai_run_ids: uniqueList(capture.ai_run_ids || capture.source_ai_run_ids || []),
    task_id: capture.task_id || null
  };
}

function linkCaptureToAiRuns(captureId, aiRunIds) {
  if (!captureId || !Array.isArray(aiRunIds) || aiRunIds.length === 0) return;
  const runs = readJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl");
  const usageEvents = readJsonLines(".kabeeri/ai_usage/usage_events.jsonl");
  let changed = false;
  for (const runId of aiRunIds) {
    const run = runs.find((item) => item.run_id === runId);
    if (!run) continue;
    run.capture_ids = uniqueList([...(run.capture_ids || []), captureId]);
    run.provenance = buildAiRunProvenance({
      ...run,
      capture_ids: run.capture_ids,
      task_id: run.task_id || null
    });
    run.updated_at = new Date().toISOString();
    for (const usageEvent of usageEvents) {
      if (usageEvent.ai_run_id === runId || usageEvent.run_id === runId) {
        usageEvent.capture_ids = uniqueList([...(usageEvent.capture_ids || []), captureId]);
        usageEvent.provenance = {
          ...(usageEvent.provenance || {}),
          capture_ids: usageEvent.capture_ids,
          ai_run_id: runId
        };
        usageEvent.updated_at = new Date().toISOString();
      }
    }
    changed = true;
  }
  if (changed) {
    writeJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl", runs);
    writeJsonLines(".kabeeri/ai_usage/usage_events.jsonl", usageEvents);
  }
}

function buildCaptureAcceptanceCriteria(capture) {
  const criteria = [];
  if ((capture.files_changed || []).length) criteria.push(`Review changed files: ${(capture.files_changed || []).join(", ")}`);
  if ((capture.checks_run || []).length) criteria.push(`Confirm checks passed: ${(capture.checks_run || []).join(", ")}`);
  else criteria.push("Add or run appropriate checks before Owner verification.");
  if ((capture.risks || []).length) criteria.push(`Resolve captured risks: ${(capture.risks || []).join(", ")}`);
  criteria.push("Attach capture evidence to task review.");
  return criteria;
}

function classifyCapture(flags, matchedTask, changedFiles, appUsernames) {
  if (flags.classification) return flags.classification;
  if (matchedTask) return "matches_existing_task";
  if (flags.exploration) return "exploration";
  if (flags.urgent || flags.hotfix) return "urgent_fix";
  if (changedFiles.length > 0 && changedFiles.every((file) => /\.(md|mdx|txt|html)$/i.test(file))) return "documentation_only";
  if (appUsernames.length > 1) return "unapproved_scope";
  return "needs_new_task";
}

function captureOwnerVerifyRequired(classification, riskLevel) {
  return ["matches_existing_task", "converted_to_task", "urgent_fix", "unapproved_scope"].includes(classification) || ["high", "critical"].includes(riskLevel);
}

function captureNextAction(classification, matchedTask) {
  if (classification === "matches_existing_task" && matchedTask) return `review task ${matchedTask.id} and attach capture evidence`;
  if (classification === "documentation_only") return "review docs diff and resolve capture";
  if (classification === "exploration") return "decide whether exploration should become a governed task";
  if (classification === "urgent_fix") return "create or link an urgent governed task and run policy checks";
  if (classification === "unapproved_scope") return "split or convert into an integration task before more work";
  return "convert capture into a governed task or link it to an existing task";
}

function buildCaptureMissingEvidence(flags, changedFiles) {
  const missing = [];
  if (!parseCsv(flags.checks).length) missing.push("checks_run");
  if (!parseCsv(flags.evidence || flags.acceptance).length) missing.push("acceptance_evidence");
  if (!changedFiles.length) missing.push("files_changed");
  return missing;
}

function buildCaptureMissingEvidenceFromRecord(capture) {
  const missing = [];
  if (!(capture.checks_run || []).length) missing.push("checks_run");
  if (!(capture.acceptance_evidence || []).length) missing.push("acceptance_evidence");
  if (!(capture.files_changed || []).length) missing.push("files_changed");
  return missing;
}

function inferCaptureTaskMatch(text, changedFiles, workstreams, tasks) {
  const matches = buildCaptureTaskMatches(text, changedFiles, workstreams, tasks);
  return matches.length && matches[0].score >= 3 ? tasks.find((item) => item.id === matches[0].task_id) : null;
}

function buildCaptureTaskMatches(text, changedFiles, workstreams, tasks) {
  const normalizedText = String(text || "").toLowerCase();
  const files = (changedFiles || []).map((item) => normalizeLockScope(item));
  const streams = new Set((workstreams || []).map((item) => normalizeWorkstreamId(item)));
  return (tasks || [])
    .filter((taskItem) => !["owner_verified", "rejected"].includes(taskItem.status))
    .map((taskItem) => {
      let score = 0;
      const title = String(taskItem.title || "").toLowerCase();
      const taskStreams = taskWorkstreams(taskItem);
      if (taskStreams.some((stream) => streams.has(stream))) score += 2;
      if (title && normalizedText && title.split(/\s+/).filter((word) => word.length > 3).some((word) => normalizedText.includes(word))) score += 1;
      const allowed = (taskItem.allowed_files || (taskItem.scope && taskItem.scope.allowed_files) || []).map((item) => normalizeLockScope(item));
      if (allowed.length && files.some((file) => allowed.some((scope) => pathScopeContains(scope, file)))) score += 2;
      return { task_id: taskItem.id, title: taskItem.title, status: taskItem.status, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

function inferCaptureApps(changedFiles) {
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const matched = [];
  for (const appItem of apps) {
    const appPath = normalizeAppPath(appItem.path || `apps/${appItem.username}`);
    if (!appPath) continue;
    if ((changedFiles || []).some((file) => pathScopeContains(appPath, normalizeLockScope(file)))) matched.push(appItem.username);
  }
  return uniqueList(matched);
}

function vibeSession(action, flags = {}, rest = []) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];
  const verb = String(action || "status").toLowerCase();
  if (verb === "start") {
    const id = flags.id || `vibe-session-${String(data.sessions.length + 1).padStart(3, "0")}`;
    const item = {
      session_id: id,
      title: flags.title || rest.join(" ") || "Vibe session",
      actor_id: flags.actor || "local-user",
      status: "active",
      intent_ids: [],
      suggestion_ids: [],
      capture_ids: [],
      started_at: new Date().toISOString()
    };
    data.sessions.push(item);
    data.current_session_id = id;
    writeJsonFile(file, data);
    appendAudit("vibe.session_started", "vibe_session", id, `Vibe session started`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (verb === "end") {
    const id = flags.id || data.current_session_id;
    if (!id) throw new Error("Missing vibe session id.");
    const item = data.sessions.find((sessionItem) => sessionItem.session_id === id);
    if (!item) throw new Error(`Vibe session not found: ${id}`);
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.summary = flags.summary || item.summary || "";
    if (data.current_session_id === id) data.current_session_id = null;
    writeJsonFile(file, data);
    appendAudit("vibe.session_completed", "vibe_session", id, `Vibe session completed`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  const current = data.sessions.find((item) => item.session_id === data.current_session_id) || null;
  console.log(JSON.stringify({ current_session_id: data.current_session_id || null, current, sessions_total: data.sessions.length }, null, 2));
}

function attachIntentToVibeSession(intent, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.intent_ids = uniqueList([...(item.intent_ids || []), intent.intent_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachSuggestionsToVibeSession(suggestions, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.suggestion_ids = uniqueList([...(item.suggestion_ids || []), ...(suggestions || []).map((suggestion) => suggestion.suggestion_id)]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachCaptureToVibeSession(capture, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.capture_ids = uniqueList([...(item.capture_ids || []), capture.capture_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function vibeBrief(flags = {}) {
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = fileExists(".kabeeri/interactions/vibe_sessions.json") ? readJsonFile(".kabeeri/interactions/vibe_sessions.json") : { current_session_id: null, sessions: [] };
  const openSuggestions = suggestions.filter((item) => ["suggested", "edited", "approved"].includes(item.status));
  const openTasks = tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const brief = {
    brief_id: `brief-${Date.now()}`,
    generated_at: new Date().toISOString(),
    current_vibe_session: sessions.current_session_id || null,
    latest_intent: intents[intents.length - 1] || null,
    open_suggestions: openSuggestions.slice(-8).map((item) => ({
      id: item.suggestion_id,
      title: item.title,
      workstream: item.workstream,
      risk: item.risk_level,
      status: item.status
    })),
    open_tasks: openTasks.slice(-10).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      workstream: item.workstream,
      assignee: item.assignee_id || null
    })),
    recent_captures: captures.slice(-5).map((item) => ({
      id: item.capture_id,
      summary: item.summary,
      files: item.files_changed || [],
      classification: item.classification
    })),
    token_saving_hint: "Use this brief as the next-session context instead of rereading the whole repository or chat history."
  };
  const file = ".kabeeri/interactions/context_briefs.json";
  const data = readJsonFile(file);
  data.briefs = data.briefs || [];
  data.briefs.push(brief);
  writeJsonFile(file, data);
  if (flags.json) console.log(JSON.stringify(brief, null, 2));
  else console.log(formatVibeBrief(brief));
}

function formatVibeBrief(brief) {
  const lines = [
    `Vibe brief: ${brief.brief_id}`,
    `Current session: ${brief.current_vibe_session || "none"}`,
    brief.latest_intent ? `Latest intent: ${brief.latest_intent.text}` : "Latest intent: none",
    "",
    "Open suggestions:",
    ...(brief.open_suggestions.length ? brief.open_suggestions.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Open tasks:",
    ...(brief.open_tasks.length ? brief.open_tasks.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Recent captures:",
    ...(brief.recent_captures.length ? brief.recent_captures.map((item) => `- ${item.id}: ${item.summary}`) : ["- none"]),
    "",
    brief.token_saving_hint
  ];
  return lines.join("\n");
}

function vibeNext(flags = {}) {
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const actions = [];
  const suggested = suggestions.find((item) => item.status === "suggested");
  if (suggested) actions.push({ action: "review_suggestion", command: `kvdf vibe show ${suggested.suggestion_id}`, reason: `Review ${suggested.title}` });
  const converted = suggestions.find((item) => item.status === "converted_to_task" && item.task_id && tasks.some((taskItem) => taskItem.id === item.task_id && taskItem.status === "proposed"));
  if (converted) actions.push({ action: "approve_or_refine_task", command: `kvdf task status ${converted.task_id}`, reason: "Converted Vibe task is still proposed." });
  const unassigned = tasks.find((item) => ["approved", "ready"].includes(item.status) && !item.assignee_id);
  if (unassigned) actions.push({ action: "assign_task", command: `kvdf task assign ${unassigned.id} --assignee <id>`, reason: "Approved task needs an assignee." });
  const uncaptured = captures.find((item) => item.classification === "needs_new_task" && item.status === "captured");
  if (uncaptured) actions.push({ action: "create_task_from_capture", command: `kvdf capture convert ${uncaptured.capture_id}`, reason: "Captured work has not been converted into governed work." });
  if (actions.length === 0) actions.push({ action: "create_or_capture_intent", command: `kvdf vibe "Describe the next change"`, reason: "No pending Vibe action found." });
  const result = { generated_at: new Date().toISOString(), actions: actions.slice(0, Number(flags.limit || 5)) };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  else console.log(table(["Action", "Command", "Reason"], result.actions.map((item) => [item.action, item.command, item.reason])));
}

function getGitChangedFiles() {
  return getGitChangedFilesService(repoRoot());
}

function getGitChangedFileDetails() {
  return getGitChangedFileDetailsService(repoRoot());
}

function matchesWords(text, words) {
  return matchesWordsService(text, words);
}

function detectLanguage(text) {
  return detectLanguageService(text);
}

function resolveOutputLanguage(flags = {}, text = "") {
  return resolveOutputLanguageService(flags, text);
}

function blueprint(action, value, flags = {}, rest = []) {
  const catalog = getProductBlueprintCatalog();
  const blueprints = catalog.blueprints || [];

  if (!action || action === "list") {
    const rows = blueprints.map((item) => [item.key, item.name, item.category, item.recommended_delivery, (item.channels || []).join(",")]);
    console.log(table(["Key", "Blueprint", "Category", "Delivery", "Channels"], rows));
    return;
  }

  if (action === "show") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const result = buildBlueprintContext(item, catalog.core_platform);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "recommend" || action === "detect" || action === "map") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product description.");
    const recommendation = buildBlueprintRecommendation(input, flags);
    if (fileExists(".kabeeri")) {
      const state = readProductBlueprintState();
      state.recommendations.push(recommendation);
      writeJsonFile(".kabeeri/product_blueprints.json", state);
    }
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderBlueprintRecommendation(recommendation);
    return;
  }

  if (action === "select" || action === "choose") {
    ensureWorkspace();
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const state = readProductBlueprintState();
    const selection = buildBlueprintSelection(item, flags);
    state.selected_blueprints.push(selection);
    state.current_blueprint = item.key;
    writeJsonFile(".kabeeri/product_blueprints.json", state);
    if (fileExists(".kabeeri/project.json")) {
      const project = readJsonFile(".kabeeri/project.json");
      project.product_blueprint = item.key;
      if (flags.delivery) project.delivery_mode = flags.delivery;
      writeJsonFile(".kabeeri/project.json", project);
    }
    console.log(JSON.stringify(selection, null, 2));
    return;
  }

  if (action === "context") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const context = buildAiBlueprintContext(item, catalog.core_platform);
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else {
      console.log(`AI Context: ${item.name}`);
      console.log(table(["Surface", "Items"], [
        ["Channels", context.channels.join(", ")],
        ["Backend modules", context.backend_modules.join(", ")],
        ["Frontend pages", context.frontend_pages.join(", ")],
        ["Database entities", context.database_entities.join(", ")],
        ["Workstreams", context.workstreams.join(", ")],
        ["Governance", context.governance_links.join(", ")]
      ]));
    }
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readProductBlueprintState();
    const rows = state.recommendations.map((item) => [
      item.recommendation_id,
      item.matches[0] ? item.matches[0].blueprint_key : "",
      item.matches[0] ? item.matches[0].score : 0,
      item.input
    ]);
    console.log(table(["ID", "Top match", "Score", "Input"], rows));
    return;
  }

  throw new Error(`Unknown blueprint action: ${action}`);
}

function getProductBlueprintCatalog() {
  return readJsonFile("standard_systems/PRODUCT_BLUEPRINT_CATALOG.json");
}

function findProductBlueprint(keyOrName) {
  const lookup = String(keyOrName || "").toLowerCase();
  if (!lookup) return null;
  return getProductBlueprintCatalog().blueprints.find((item) => {
    const names = [item.key, item.name, ...(item.aliases || [])].map((entry) => String(entry).toLowerCase());
    return names.includes(lookup);
  }) || null;
}

function readProductBlueprintState() {
  if (!fileExists(".kabeeri/product_blueprints.json")) {
    return { selected_blueprints: [], recommendations: [], current_blueprint: null };
  }
  const state = readJsonFile(".kabeeri/product_blueprints.json");
  return {
    selected_blueprints: state.selected_blueprints || [],
    recommendations: state.recommendations || [],
    current_blueprint: state.current_blueprint || null
  };
}

function buildBlueprintRecommendation(input, flags = {}) {
  const catalog = getProductBlueprintCatalog();
  const text = String(input || "").toLowerCase();
  const tokens = tokenizeBlueprintText(text);
  const matches = (catalog.blueprints || [])
    .map((item) => scoreBlueprint(item, text, tokens, flags))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(flags.limit || 5));
  const top = matches[0] ? findProductBlueprint(matches[0].blueprint_key) : null;
  return {
    recommendation_id: `blueprint-recommendation-${Date.now()}`,
    created_at: new Date().toISOString(),
    input,
    matches,
    suggested_delivery_mode: top ? top.recommended_delivery : "structured",
    developer_decision_required: true,
    ai_context_summary: top ? buildAiBlueprintContext(top, catalog.core_platform) : null,
    next_actions: top ? [
      `Review blueprint: kvdf blueprint show ${top.key}`,
      `Record choice: kvdf blueprint select ${top.key} --delivery ${top.recommended_delivery === "hybrid" ? "agile|structured" : top.recommended_delivery}`,
      "Use the AI context summary before creating tasks to reduce repeated discovery."
    ] : ["Clarify project type, main users, channels, payments/content/mobile needs."]
  };
}

function tokenizeBlueprintText(text) {
  return String(text || "")
    .split(/[^\p{L}\p{N}_]+/u)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function scoreBlueprint(item, text, tokens, flags = {}) {
  const reasons = [];
  let score = 0;
  const terms = uniqueList([item.key, item.name, ...(item.aliases || [])].map((entry) => String(entry).toLowerCase()));
  for (const term of terms) {
    if (!term) continue;
    if (text.includes(term)) {
      score += term === item.key ? 8 : 6;
      reasons.push(`matched term: ${term}`);
    }
  }
  for (const moduleName of [...(item.backend_modules || []), ...(item.frontend_pages || []), ...(item.database_entities || []), ...(item.channels || [])]) {
    const normalized = String(moduleName).toLowerCase().replace(/_/g, " ");
    if (text.includes(normalized) || tokens.includes(String(moduleName).toLowerCase())) score += 1;
  }
  if (flags.channel && (item.channels || []).includes(flags.channel)) {
    score += 3;
    reasons.push(`requested channel: ${flags.channel}`);
  }
  if (flags.category && item.category === flags.category) {
    score += 3;
    reasons.push(`requested category: ${flags.category}`);
  }
  if (flags.delivery && item.recommended_delivery === flags.delivery) {
    score += 2;
    reasons.push(`delivery fit: ${flags.delivery}`);
  }
  return {
    blueprint_key: item.key,
    name: item.name,
    category: item.category,
    score,
    recommended_delivery: item.recommended_delivery,
    reasons: reasons.slice(0, 5)
  };
}

function buildBlueprintContext(item, corePlatform) {
  return {
    ...item,
    core_platform: corePlatform,
    ai_context_summary: buildAiBlueprintContext(item, corePlatform)
  };
}

function buildAiBlueprintContext(item, corePlatform) {
  return {
    blueprint_key: item.key,
    name: item.name,
    category: item.category,
    recommended_delivery: item.recommended_delivery,
    channels: uniqueList([...(item.channels || [])]),
    backend_modules: uniqueList([...(corePlatform.backend_modules || []), ...(item.backend_modules || [])]),
    frontend_pages: uniqueList([...(item.frontend_pages || [])]),
    database_entities: uniqueList([...(corePlatform.database_entities || []), ...(item.database_entities || [])]),
    workstreams: uniqueList([...(item.workstreams || [])]),
    governance_links: uniqueList([...(corePlatform.governance_links || []), "capability_map", "runtime_schemas"]),
    risk_flags: uniqueList([...(item.risk_flags || [])])
  };
}

function buildBlueprintSelection(item, flags = {}) {
  const catalog = getProductBlueprintCatalog();
  const context = buildAiBlueprintContext(item, catalog.core_platform);
  return {
    selection_id: `blueprint-selection-${Date.now()}`,
    blueprint_key: item.key,
    selected_at: new Date().toISOString(),
    delivery_mode: flags.delivery || item.recommended_delivery,
    reason: flags.reason || "Selected by developer",
    channels: context.channels,
    backend_modules: context.backend_modules,
    frontend_pages: context.frontend_pages,
    database_entities: context.database_entities,
    workstreams: context.workstreams
  };
}

function renderBlueprintRecommendation(recommendation) {
  console.log(`Blueprint recommendation: ${recommendation.recommendation_id}`);
  console.log(table(["Blueprint", "Score", "Delivery", "Reasons"], recommendation.matches.map((item) => [
    `${item.name} (${item.blueprint_key})`,
    item.score,
    item.recommended_delivery,
    (item.reasons || []).join("; ")
  ])));
  if (recommendation.ai_context_summary) {
    const summary = recommendation.ai_context_summary;
    console.log("");
    console.log(`Top context: ${summary.name}`);
    console.log(table(["Surface", "Items"], [
      ["Channels", summary.channels.join(", ")],
      ["Backend modules", summary.backend_modules.slice(0, 12).join(", ")],
      ["Frontend pages", summary.frontend_pages.slice(0, 12).join(", ")],
      ["Database entities", summary.database_entities.slice(0, 12).join(", ")]
    ]));
  }
}

function dataDesign(action, value, flags = {}, rest = []) {
  const catalog = getDataDesignCatalog();

  if (!action || action === "principles" || action === "list") {
    const rows = catalog.universal_principles.map((item) => [item.key, item.title, item.why]);
    console.log(table(["Key", "Principle", "Why"], rows));
    return;
  }

  if (action === "principle" || action === "show") {
    const key = String(value || "").toLowerCase();
    const principle = catalog.universal_principles.find((item) => item.key === key);
    if (!principle) throw new Error(`Data design principle not found: ${value || ""}`);
    console.log(JSON.stringify(principle, null, 2));
    return;
  }

  if (action === "modules") {
    const rows = Object.entries(catalog.module_patterns).map(([key, item]) => [key, (item.entities || []).slice(0, 8).join(", "), (item.must_have || []).slice(0, 6).join(", ")]);
    console.log(table(["Module", "Entities", "Must have"], rows));
    return;
  }

  if (action === "module") {
    const key = String(value || "").toLowerCase();
    const module = catalog.module_patterns[key];
    if (!module) throw new Error(`Data design module not found: ${value || ""}`);
    console.log(JSON.stringify({ module_key: key, ...module }, null, 2));
    return;
  }

  if (action === "context" || action === "blueprint") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf data-design context ecommerce` or select a product blueprint first.");
    const context = buildDataDesignContext(blueprintKey, flags);
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context);
    return;
  }

  if (action === "recommend") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product or database description.");
    const blueprintRecommendation = buildBlueprintRecommendation(input, { limit: 1 });
    const top = blueprintRecommendation.matches[0] ? blueprintRecommendation.matches[0].blueprint_key : flags.blueprint;
    if (!top) throw new Error("Could not detect a product blueprint. Use --blueprint <key>.");
    const context = buildDataDesignContext(top, { ...flags, input });
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context);
    return;
  }

  if (action === "review") {
    ensureWorkspace();
    const target = value || flags.file || flags.target || "database_design";
    const review = buildDataDesignReview(target, flags);
    const state = readDataDesignState();
    state.reviews.push(review);
    writeJsonFile(".kabeeri/data_design.json", state);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "checklist") {
    if (flags.json) console.log(JSON.stringify({ checklist: catalog.approval_checklist }, null, 2));
    else console.log(table(["#", "Check"], catalog.approval_checklist.map((item, index) => [index + 1, item])));
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readDataDesignState();
    console.log(table(["Context", "Blueprint", "Modules", "Entities"], state.contexts.map((item) => [
      item.context_id,
      item.blueprint_key,
      item.modules.join(","),
      String((item.entities || []).length)
    ])));
    return;
  }

  throw new Error(`Unknown data-design action: ${action}`);
}

function getDataDesignCatalog() {
  return readJsonFile("standard_systems/DATA_DESIGN_BLUEPRINT.json");
}

function readDataDesignState() {
  if (!fileExists(".kabeeri/data_design.json")) return { contexts: [], reviews: [], current_context: null };
  const state = readJsonFile(".kabeeri/data_design.json");
  return {
    contexts: state.contexts || [],
    reviews: state.reviews || [],
    current_context: state.current_context || null
  };
}

function getCurrentBlueprintKey() {
  if (!fileExists(".kabeeri/product_blueprints.json")) return null;
  const state = readProductBlueprintState();
  return state.current_blueprint;
}

function buildDataDesignContext(blueprintKey, flags = {}) {
  const dataCatalog = getDataDesignCatalog();
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const modules = uniqueList(dataCatalog.blueprint_module_map[product.key] || ["core"]);
  const patterns = modules.map((key) => ({ key, ...(dataCatalog.module_patterns[key] || {}) }));
  const entities = uniqueList(patterns.flatMap((item) => item.entities || []));
  const mustHave = uniqueList(patterns.flatMap((item) => item.must_have || []));
  const indexes = uniqueList(patterns.flatMap((item) => item.indexes || []));
  const principles = dataCatalog.universal_principles.map((item) => item.key);
  return {
    context_id: `data-context-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    input: flags.input || null,
    modules,
    entities,
    must_have: mustHave,
    indexes,
    risk_flags: uniqueList([...(product.risk_flags || []), ...inferDataRiskFlags(modules)]),
    principles,
    checklist: dataCatalog.approval_checklist,
    ai_instructions: [
      "Design from business workflow before screens.",
      "Use normalized master data and snapshots for historical operations.",
      "Use primary keys, foreign keys, constraints, indexes, migrations, transactions, and idempotency where relevant.",
      "Do not implement database changes without migration and rollback planning for production systems.",
      "Use this context as a starting point; confirm requirements and acceptance criteria before coding."
    ]
  };
}

function inferDataRiskFlags(modules) {
  const risks = [];
  if (modules.includes("commerce")) risks.push("money_precision", "order_snapshots", "payment_idempotency");
  if (modules.includes("inventory")) risks.push("stock_movements", "concurrency");
  if (modules.includes("accounting")) risks.push("balanced_ledgers", "no_destructive_delete");
  if (modules.includes("cms_news")) risks.push("slug_redirects", "content_revisions");
  if (modules.includes("mobile")) risks.push("mobile_retries", "push_tokens", "offline_sync");
  if (modules.includes("booking")) risks.push("appointment_overlap", "timezone");
  if (modules.includes("delivery")) risks.push("tracking_events", "cod_reconciliation");
  if (modules.includes("integration")) risks.push("outbox_events", "provider_logs");
  return risks;
}

function buildDataDesignReview(target, flags = {}) {
  const text = [target, flags.notes || "", flags.entities || ""].join(" ").toLowerCase();
  const findings = [];
  const requiredSignals = [
    ["primary key", "Primary keys not mentioned."],
    ["foreign key", "Foreign keys not mentioned."],
    ["created_at", "created_at timestamps not mentioned."],
    ["updated_at", "updated_at timestamps not mentioned."],
    ["audit", "Audit logs not mentioned."],
    ["index", "Indexes not mentioned."],
    ["migration", "Migrations not mentioned."]
  ];
  for (const [needle, finding] of requiredSignals) {
    if (!text.includes(needle)) findings.push(finding);
  }
  if (text.includes("price float") || text.includes("amount float")) findings.push("Money appears to use float; use decimal or integer minor units.");
  if (text.includes("items json")) findings.push("Order/items appear stored as JSON; use child tables for reportable relationships.");
  if (text.includes("stock_quantity") && !text.includes("stock_movements")) findings.push("Inventory quantity appears direct-only; use stock_movements as source of truth.");
  return {
    review_id: `data-review-${Date.now()}`,
    created_at: new Date().toISOString(),
    target,
    status: findings.length ? "needs_attention" : "pass",
    findings,
    checked_rules: ["keys", "timestamps", "audit", "indexes", "migrations", "money", "json_overuse", "inventory_movements"]
  };
}

function renderDataDesignContext(context) {
  console.log(`Data design context: ${context.context_id}`);
  console.log(`Blueprint: ${context.blueprint_name} (${context.blueprint_key})`);
  console.log(table(["Surface", "Items"], [
    ["Modules", context.modules.join(", ")],
    ["Entities", context.entities.slice(0, 24).join(", ")],
    ["Must have", context.must_have.slice(0, 18).join(", ")],
    ["Indexes", context.indexes.slice(0, 12).join(", ")],
    ["Risks", context.risk_flags.join(", ")]
  ]));
}

function resolveQuestionnaireGroups(profile, group) {
  if (group) {
    assertSafeName(group);
    if (!["core", "production", "extension"].includes(group)) throw new Error("Invalid questionnaire group. Use core, production, or extension.");
    return [group];
  }
  const profileGroups = {
    lite: ["core"],
    standard: ["core", "production"],
    enterprise: ["core", "production", "extension"]
  };
  const normalized = profile || "lite";
  assertSafeName(normalized);
  if (!profileGroups[normalized]) throw new Error("Invalid questionnaire profile. Use lite, standard, or enterprise.");
  return profileGroups[normalized];
}

function copyQuestionnaireFiles(files, output, force) {
  const fs = require("fs");
  const path = require("path");
  const outputRoot = path.resolve(repoRoot(), output);
  for (const file of files) {
    const relative = file.replace(/^questionnaires\//, "");
    const target = path.join(outputRoot, relative);
    if (fs.existsSync(target) && !force) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(resolveAsset(file), target);
  }
}

function buildQuestionnaireFlow() {
  return {
    version: "v5.0.0",
    start_here: "kvdf questionnaire flow",
    next_command: "kvdf questionnaire plan \"Describe the project in one sentence\"",
    flow: [
      "entry_questions",
      "project_type_detection",
      "system_area_activation",
      "grouped_questionnaires",
      "conditional_deep_questions",
      "coverage_review",
      "missing_answers_only",
      "generated_docs_tasks"
    ],
    states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    rule_keys: ["question_minimization", "progressive_expansion", "unknown_follow_up", "no_silent_skip", "traceability"],
    rules: [
      "Question Minimization",
      "Progressive Expansion",
      "Unknown Follow-up",
      "No Silent Skip",
      "Traceability"
    ],
    operator_notes: [
      "Start from the questionnaire flow before searching the repo tree.",
      "Use capability list for the machine-readable system area map.",
      "If an area is unknown, ask a short follow-up instead of scanning unrelated folders."
    ],
    entry_questions: getEntryQuestions()
  };
}

function getEntryQuestions() {
  return [
    { question_id: "entry.project_type", text: "What type of project is this?", choices: ["saas", "ecommerce", "booking", "content", "landing_page", "internal_tool", "api", "mobile_app"] },
    { question_id: "entry.complexity", text: "How complex is the first release?", choices: ["small", "medium", "large", "unknown"] },
    { question_id: "entry.has_users", text: "Will people sign in?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_admin", text: "Does it need an admin panel?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_payments", text: "Are payments or billing required in V1?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_multi_tenancy", text: "Will multiple companies/tenants use separated spaces?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_public_frontend", text: "Does it have public pages?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.needs_integrations", text: "Does it integrate with external systems?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.needs_ai_features", text: "Does the product itself include AI features?", choices: ["yes", "no", "later", "unknown"] }
  ];
}

function inferQuestionnaireBlueprint(description, flags = {}) {
  if (flags.blueprint) return flags.blueprint;
  const input = String(description || "").trim();
  if (!input) return null;
  const recommendation = buildBlueprintRecommendation(input, { limit: 1 });
  return recommendation.matches[0] ? recommendation.matches[0].blueprint_key : null;
}

function buildQuestionnaireIntakePlan(description, blueprintKey, flags = {}) {
  const blueprint = findProductBlueprint(blueprintKey);
  if (!blueprint) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const outputLanguage = resolveOutputLanguage(flags, description);
  const blueprintContext = buildBlueprintContext(blueprint, getProductBlueprintCatalog().core_platform);
  const dataContext = buildDataDesignContext(blueprint.key, flags);
  const uiContext = buildUiDesignRecommendation(blueprint.key, flags);
  const delivery = buildDeliveryModeRecommendation(description, {
    ...flags,
    enterprise: flags.enterprise || /erp|enterprise|compliance|audit|large/i.test(description)
  });
  const frameworks = buildQuestionnaireFrameworkContext(description, blueprint, flags);
  const questions = buildAdaptiveIntakeQuestions({
    blueprint,
    blueprintContext,
    dataContext,
    uiContext,
    delivery,
    frameworks,
    flags
  });

  return {
    plan_id: `questionnaire-intake-${Date.now()}`,
    created_at: new Date().toISOString(),
    description,
    input_language: detectLanguage(description),
    output_language: outputLanguage,
    language_policy: "follow_user_language_unless_overridden",
    goal: "Generate focused developer questions that identify product type, framework stack, database model, UI approach, and delivery methodology before task generation.",
    blueprint: {
      key: blueprint.key,
      name: blueprint.name,
      category: blueprint.category,
      recommended_delivery: blueprint.recommended_delivery,
      channels: blueprint.channels || [],
      backend_modules: blueprint.backend_modules || [],
      frontend_pages: blueprint.frontend_pages || [],
      database_entities: blueprint.database_entities || [],
      risk_flags: blueprint.risk_flags || []
    },
    delivery_mode_recommendation: {
      recommended_mode: delivery.recommended_mode,
      confidence: delivery.confidence,
      scores: delivery.scores,
      developer_decision_required: true
    },
    framework_context: frameworks,
    data_design_context: {
      modules: dataContext.modules,
      entities: dataContext.entities,
      must_have: dataContext.must_have,
      risk_flags: dataContext.risk_flags
    },
    ui_ux_context: {
      experience_pattern: uiContext.experience_pattern,
      recommended_stacks: uiContext.recommended_stacks,
      component_groups: uiContext.component_groups,
      page_templates: uiContext.page_templates,
      layout_priorities: uiContext.layout_priorities,
      seo_geo: uiContext.seo_geo
    },
    generated_questions: questions,
    answer_commands: questions.slice(0, 8).map((question) => `kvdf questionnaire answer ${question.question_id} --value "<answer>" --areas ${question.area_ids.join(",")}`),
    next_actions: [
      `Answer and documentation language should be ${outputLanguage === "ar" ? "Arabic" : outputLanguage === "en" ? "English" : "the user's language"}.`,
      "Ask only the generated questions that are not already known from the developer's natural-language request.",
      "Record confirmed answers with `kvdf questionnaire answer` so coverage and missing-answer reports update.",
      "Use `kvdf delivery choose <mode>` after the developer approves Agile or Structured.",
      "Use Product Blueprint, Data Design, UI/UX Advisor, and Prompt Pack context before generating tasks."
    ]
  };
}

function buildQuestionnaireFrameworkContext(description, blueprint, flags = {}) {
  const packs = getPromptPackCatalog();
  const explicit = uniqueList(parseCsv([flags.framework, flags.backend, flags.frontend, flags.mobile, flags.stack].filter(Boolean).join(",")));
  const detected = detectFrameworkPacks(description, packs);
  const recommended = recommendFrameworkPacksForBlueprint(blueprint, packs);
  const selected = uniqueList([...explicit, ...detected, ...recommended].filter((item) => packs.some((pack) => pack.pack === item))).slice(0, 6);
  return {
    selected_packs: selected,
    explicit_packs: explicit,
    detected_packs: detected,
    recommended_packs: recommended,
    available_packs: packs.map((pack) => ({ pack: pack.pack, display_name: pack.display_name || pack.pack })),
    required_decisions: [
      "Confirm backend framework.",
      "Confirm frontend framework or UI library.",
      "Confirm mobile framework if mobile_app is in scope.",
      "Confirm database engine and ORM/migration approach.",
      "Confirm whether stack choice is fixed by the developer/client or open to recommendation."
    ]
  };
}

function buildAdaptiveIntakeQuestions(context) {
  const { blueprint, dataContext, uiContext, delivery, frameworks } = context;
  const questions = [];
  const add = (question) => questions.push({
    priority: question.priority || "medium",
    source_systems: question.source_systems || [],
    area_ids: question.area_ids || [],
    question_id: question.question_id,
    text: question.text,
    why: question.why,
    answer_type: question.answer_type || "text",
    choices: question.choices || []
  });

  add({
    priority: "high",
    question_id: "adaptive.product.blueprint_confirmation",
    text: `Is this project best described as ${blueprint.name}, or should Kabeeri use a different product blueprint?`,
    why: "The product blueprint determines modules, pages, database entities, workstreams, and risks.",
    answer_type: "choice",
    choices: [blueprint.key, "different_blueprint", "hybrid"],
    area_ids: ["product_business", "mvp_scope"],
    source_systems: ["product_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.delivery.mode_confirmation",
    text: `Should delivery use ${delivery.recommended_mode}, or does the developer prefer Agile/Structured differently?`,
    why: "The delivery mode changes planning depth, approval gates, sprint/phase records, and task slicing.",
    answer_type: "choice",
    choices: ["agile", "structured", "hybrid", "undecided"],
    area_ids: ["kabeeri_control_layer", "mvp_scope"],
    source_systems: ["delivery_mode_advisor"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.backend",
    text: "Which backend framework should own APIs, auth, business rules, migrations, and integrations?",
    why: "Framework choice selects prompt packs, folder rules, migrations, testing style, and execution scope.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "laravel", "nestjs", "django", "dotnet", "fastapi", "expressjs", "not_decided"]),
    area_ids: ["backend", "api_layer", "technology_governance"],
    source_systems: ["prompt_packs", "framework_context"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.frontend",
    text: "Which frontend framework/library should own the public/admin UI?",
    why: "Frontend stack affects routing, components, state, SEO/GEO, visual QA, and prompt pack selection.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "react", "nextjs", "vue", "nuxt-vue", "angular", "astro", "not_decided"]),
    area_ids: ["public_frontend", "admin_frontend", "technology_governance"],
    source_systems: ["prompt_packs", "ui_ux_advisor"]
  });
  if ((blueprint.channels || []).some((item) => String(item).includes("mobile"))) {
    add({
      priority: "high",
      question_id: "adaptive.framework.mobile",
      text: "Will the mobile channel use React Native Expo, Flutter, native apps, or be deferred?",
      why: "Mobile stack affects offline state, push notifications, app versions, deep links, permissions, and release handoff.",
      answer_type: "choice",
      choices: ["react-native-expo", "flutter", "native_ios_android", "deferred", "not_needed"],
      area_ids: ["mobile", "technology_governance"],
      source_systems: ["prompt_packs", "ui_ux_advisor"]
    });
  }
  add({
    priority: "high",
    question_id: "adaptive.database.engine",
    text: "Which database engine should be used, and is multi-tenancy required from day one?",
    why: "Database engine and tenancy shape migrations, constraints, indexing, data isolation, backups, and reporting.",
    answer_type: "text",
    choices: ["postgresql", "mysql", "sqlite_for_mvp", "mongodb", "not_decided"],
    area_ids: ["database", "multi_tenancy"],
    source_systems: ["data_design_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.database.workflow_entities",
    text: `Are these core entities correct for V1: ${dataContext.entities.slice(0, 12).join(", ")}?`,
    why: "Confirmed entities reduce database redesign and keep tasks aligned with the real business workflow.",
    answer_type: "confirm_or_edit",
    area_ids: ["database", "product_business"],
    source_systems: ["data_design_blueprint", "product_blueprint"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.experience_pattern",
    text: `Should the UI follow the ${uiContext.experience_pattern} pattern with pages like ${uiContext.page_templates.slice(0, 8).join(", ")}?`,
    why: "The UI pattern controls component groups, page templates, SEO/GEO needs, dashboard density, and mobile ergonomics.",
    answer_type: "confirm_or_edit",
    area_ids: ["ui_ux_design", "public_frontend", "admin_frontend"],
    source_systems: ["ui_ux_advisor"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.design_source",
    text: "Is there an approved design source, brand guide, reference website, Figma, or should Kabeeri propose a UI direction?",
    why: "Design governance blocks frontend implementation until design source, text spec, and visual expectations are clear.",
    answer_type: "choice",
    choices: ["figma_available", "brand_guide_available", "reference_sites", "kabeeri_suggests", "not_decided"],
    area_ids: ["ui_ux_design", "design_governance"],
    source_systems: ["ui_ux_advisor", "design_governance"]
  });
  for (const risk of (blueprint.risk_flags || []).slice(0, 4)) {
    add({
      priority: "medium",
      question_id: `adaptive.risk.${risk}`,
      text: `How should the project handle this risk: ${risk}?`,
      why: "Blueprint risks should become acceptance criteria, policy checks, or explicit deferrals.",
      answer_type: "text",
      area_ids: ["security", "qa", "product_business"],
      source_systems: ["product_blueprint", "policy_gates"]
    });
  }
  return questions;
}

function renderQuestionnaireIntakePlan(plan) {
  console.log(`Questionnaire intake plan: ${plan.plan_id}`);
  console.log(table(["Surface", "Value"], [
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Delivery", `${plan.delivery_mode_recommendation.recommended_mode} (${plan.delivery_mode_recommendation.confidence})`],
    ["Framework packs", plan.framework_context.selected_packs.join(", ") || "needs decision"],
    ["Data modules", plan.data_design_context.modules.join(", ")],
    ["UI pattern", plan.ui_ux_context.experience_pattern],
    ["Questions", plan.generated_questions.length]
  ]));
  console.log("");
  console.log(table(["Priority", "Question ID", "Question"], plan.generated_questions.map((item) => [
    item.priority,
    item.question_id,
    item.text
  ])));
}

function buildCoverageMatrix() {
  const answers = fileExists(".kabeeri/questionnaires/answers.json") ? readJsonFile(".kabeeri/questionnaires/answers.json").answers || [] : [];
  const answerMap = Object.fromEntries(answers.map((answer) => [answer.question_id, answer]));
  const projectType = normalizeAnswerValue(answerMap["entry.project_type"] && answerMap["entry.project_type"].value);
  const complexity = normalizeAnswerValue(answerMap["entry.complexity"] && answerMap["entry.complexity"].value);
  const areas = getSystemAreas().map((area) => {
    const activation = activateSystemArea(area, answerMap, projectType, complexity);
    const relatedAnswers = answers.filter((answer) => (answer.area_ids || []).includes(area.key));
    const status = relatedAnswers.some((answer) => ["unknown", "unsure", "not sure", "maybe"].includes(normalizeAnswerValue(answer.value)))
      ? "needs_follow_up"
      : activation.status;
    return {
      area_id: area.id,
      area_key: area.key,
      area: area.name,
      group: area.group,
      status,
      reason: status === "needs_follow_up" ? "Answer is uncertain and needs follow-up." : activation.reason,
      required_action: getCoverageAction(status, area),
      question_group: area.question_group,
      answered: relatedAnswers.length > 0,
      answers: relatedAnswers.map((answer) => ({
        answer_id: answer.answer_id,
        question_id: answer.question_id,
        source_mode: answer.source_mode
      }))
    };
  });
  return {
    generated_at: new Date().toISOString(),
    source: ".kabeeri/questionnaires/answers.json",
    project_type: projectType || "unknown",
    complexity: complexity || "unknown",
    areas,
    summary: summarizeBy(areas, "status")
  };
}

function writeQuestionnaireReports(matrix) {
  writeJsonFile(".kabeeri/questionnaires/coverage_matrix.json", matrix);
  writeJsonFile(".kabeeri/questionnaires/missing_answers_report.json", buildMissingAnswersReport(matrix));
}

function buildMissingAnswersReport(matrix) {
  const missing = (matrix.areas || [])
    .filter((area) => ["required", "unknown", "needs_follow_up"].includes(area.status) && !area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      status: area.status,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  const followUp = (matrix.areas || [])
    .filter((area) => area.status === "needs_follow_up" && area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  return {
    generated_at: new Date().toISOString(),
    project_type: matrix.project_type,
    missing,
    follow_up: followUp,
    totals: {
      missing: missing.length,
      follow_up: followUp.length
    }
  };
}

function generateTasksFromCoverage(flags = {}) {
  ensureWorkspace();
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "generate questionnaire tasks");
  const matrix = buildCoverageMatrix();
  writeQuestionnaireReports(matrix);
  const tasksFile = ".kabeeri/tasks.json";
  const tasksData = readJsonFile(tasksFile);
  tasksData.tasks = tasksData.tasks || [];
  const existingSources = new Set(tasksData.tasks.map((taskItem) => taskItem.source_reference).filter(Boolean));
  const targetStatuses = new Set(parseCsv(flags.statuses || "required,needs_follow_up"));
  const selected = matrix.areas.filter((area) => targetStatuses.has(area.status));
  const created = [];
  for (const area of selected) {
    const sourceReference = `coverage:${area.area_key}`;
    if (existingSources.has(sourceReference)) continue;
    const id = `task-${String(tasksData.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: `${area.status === "needs_follow_up" ? "Clarify" : "Define"} ${area.area}`,
      status: "proposed",
      type: area.status === "needs_follow_up" ? "questionnaire-follow-up" : "capability-coverage",
      workstream: mapAreaToWorkstream(area.area_key),
      workstreams: [mapAreaToWorkstream(area.area_key)],
      sprint_id: flags.sprint || null,
      source: "questionnaire_coverage",
      source_reference: sourceReference,
      source_mode: area.status === "needs_follow_up" ? "required" : "derived",
      provenance: {
        system_area_id: area.area_id,
        system_area_key: area.area_key,
        question_ids: (area.answers || []).map((answer) => answer.question_id),
        answer_ids: (area.answers || []).map((answer) => answer.answer_id),
        source_mode: area.status === "needs_follow_up" ? "required" : "derived",
        source_reason: area.reason
      },
      acceptance_criteria: [
        `${area.area} is answered, deferred, or marked not_applicable with a reason.`,
        "Coverage matrix is regenerated after the answer is recorded.",
        "Task provenance includes system area, question_id, answer_id, and source_mode when available."
      ],
      created_at: new Date().toISOString()
    };
    tasksData.tasks.push(taskItem);
    existingSources.add(sourceReference);
    created.push(taskItem);
  }
  writeJsonFile(tasksFile, tasksData);
  for (const taskItem of created) {
    appendAudit("task.generated_from_questionnaire", "task", taskItem.id, `Generated from ${taskItem.source_reference}`);
  }
  console.log(`Generated ${created.length} questionnaire coverage tasks.`);
}

function normalizeAnswerValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function inferAnswerConfidence(value) {
  return ["unknown", "unsure", "not_sure", "maybe"].includes(normalizeAnswerValue(value)) ? "low" : "confirmed";
}

function inferQuestionAreas(questionId) {
  const map = {
    "entry.project_type": ["product_business", "kabeeri_control_layer"],
    "entry.complexity": ["mvp_scope", "kabeeri_control_layer"],
    "entry.has_users": ["users_roles", "authentication", "authorization"],
    "entry.has_admin": ["admin_frontend", "admin_panel"],
    "entry.has_payments": ["payments_billing"],
    "entry.has_multi_tenancy": ["multi_tenancy", "tenant_admin_customization"],
    "entry.has_public_frontend": ["public_frontend", "seo", "accessibility"],
    "entry.needs_integrations": ["integrations"],
    "entry.needs_ai_features": ["ai_product_features"]
  };
  return map[questionId] || [];
}

function activateSystemArea(area, answers, projectType, complexity) {
  const value = (questionId) => normalizeAnswerValue(answers[questionId] && answers[questionId].value);
  const yes = (questionId) => value(questionId) === "yes";
  const no = (questionId) => value(questionId) === "no";
  const later = (questionId) => ["later", "deferred", "future"].includes(value(questionId));
  const unknown = (questionId) => !value(questionId) || value(questionId) === "unknown";
  const requiredBase = new Set(["product_business", "mvp_scope", "documentation", "kabeeri_control_layer", "security", "testing_qa", "error_handling"]);
  const backendProjects = new Set(["saas", "ecommerce", "booking", "internal_tool", "api", "mobile_app"]);
  const publicProjects = new Set(["saas", "ecommerce", "booking", "content", "landing_page"]);
  const commerceProjects = new Set(["ecommerce"]);

  if (requiredBase.has(area.key)) return { status: "required", reason: "Core Kabeeri project coverage area." };
  if (["backend_apis", "business_logic", "database"].includes(area.key) && backendProjects.has(projectType)) return { status: "required", reason: `${projectType} needs backend/data coverage.` };
  if (["public_frontend", "seo"].includes(area.key) && (publicProjects.has(projectType) || yes("entry.has_public_frontend"))) return { status: "required", reason: "Public pages exist." };
  if (["users_roles", "authentication", "authorization", "user_journeys", "onboarding"].includes(area.key)) {
    if (yes("entry.has_users") || ["saas", "ecommerce", "booking", "internal_tool", "mobile_app"].includes(projectType)) return { status: "required", reason: "Users need access and journeys." };
    if (unknown("entry.has_users")) return { status: "unknown", reason: "User access is not confirmed." };
    return { status: "not_applicable", reason: "No user sign-in in current scope." };
  }
  if (["admin_frontend", "admin_panel", "settings_system", "dashboard_customization"].includes(area.key)) {
    if (yes("entry.has_admin")) return { status: "required", reason: "Admin panel is required." };
    if (unknown("entry.has_admin")) return { status: "unknown", reason: "Admin need is not confirmed." };
    return { status: "not_applicable", reason: "No admin panel in current scope." };
  }
  if (area.key === "payments_billing") {
    if (yes("entry.has_payments") || commerceProjects.has(projectType)) return { status: "required", reason: "Payments or billing are in scope." };
    if (later("entry.has_payments")) return { status: "deferred", reason: "Payments are planned later." };
    if (unknown("entry.has_payments")) return { status: "unknown", reason: "Payments are not confirmed." };
    return { status: "not_applicable", reason: "Payments are not needed." };
  }
  if (["multi_tenancy", "tenant_admin_customization"].includes(area.key)) {
    if (yes("entry.has_multi_tenancy")) return { status: "required", reason: "Tenant separation is required." };
    if (later("entry.has_multi_tenancy")) return { status: "deferred", reason: "Multi-tenancy is planned later." };
    if (unknown("entry.has_multi_tenancy") && projectType === "saas") return { status: "unknown", reason: "SaaS tenancy model needs confirmation." };
    return { status: "not_applicable", reason: "Single organization/project scope." };
  }
  if (area.key === "integrations") {
    if (yes("entry.needs_integrations")) return { status: "required", reason: "External integrations are needed." };
    if (later("entry.needs_integrations")) return { status: "deferred", reason: "Integrations are planned later." };
    if (unknown("entry.needs_integrations")) return { status: "unknown", reason: "Integration need is not confirmed." };
  }
  if (area.key === "ai_product_features") {
    if (yes("entry.needs_ai_features")) return { status: "required", reason: "AI product features are in scope." };
    if (later("entry.needs_ai_features")) return { status: "deferred", reason: "AI features are planned later." };
    if (unknown("entry.needs_ai_features")) return { status: "unknown", reason: "AI product feature need is not confirmed." };
  }
  if (["monitoring", "backup_recovery", "deployment", "production_publish", "performance", "audit_logs", "legal_compliance", "data_governance"].includes(area.key)) {
    if (complexity === "large" || ["saas", "ecommerce", "booking"].includes(projectType)) return { status: "required", reason: "Operational readiness is important for this project type." };
    return { status: "optional", reason: "Useful for production hardening." };
  }
  if (no("entry.has_public_frontend") && ["seo", "accessibility", "public_frontend"].includes(area.key)) return { status: "not_applicable", reason: "No public frontend." };
  return { status: "optional", reason: "Useful capability, not confirmed for V1." };
}

function getCoverageAction(status, area) {
  const actions = {
    required: `Ask ${area.question_group} questions and generate tasks if unanswered.`,
    optional: "Keep available without blocking V1.",
    deferred: "Add to future roadmap and prevent accidental implementation now.",
    not_applicable: "No tasks required.",
    unknown: "Ask entry or follow-up questions before skipping.",
    needs_follow_up: "Ask small helper questions and resolve contradictions."
  };
  return actions[status] || "Review manually.";
}

function projectAnalysis(action, value, flags = {}, rest = []) {
  if (!action || ["help", "status"].includes(action)) {
    console.log("Project adoption commands");
    console.log(table(["Command", "Purpose"], [
      ["project analyze --path <folder>", "Inspect an existing application and write .kabeeri/project_analysis.json"],
      ["project profile route --goal <text>", "Route the project profile, delivery mode, and prompt packs into .kabeeri/project_profile.json"],
      ["project profile status", "Show the active project profile routing record"],
      ["adopt analyze --path <folder>", "Alias for project analyze"]
    ]));
    return;
  }

  if (action !== "analyze" && action !== "analyse") {
    throw new Error(`Unknown project action: ${action}`);
  }

  const fs = require("fs");
  const path = require("path");
  ensureWorkspace();
  const targetInput = flags.path || value || rest[0] || ".";
  const targetPath = path.resolve(repoRoot(), targetInput);
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`Project path not found or not a directory: ${targetInput}`);
  }

  const analysis = analyzeExistingProject(targetPath, flags);
  writeJsonFile(".kabeeri/project_analysis.json", analysis);
  appendAudit("project.analyzed", "project", analysis.analysis_id, `Existing project analyzed: ${analysis.relative_path}`);

  if (flags.json) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  console.log("Existing project analysis written to .kabeeri/project_analysis.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected stacks", analysis.detected_stacks.join(", ") || "unknown"],
    ["Potential apps", analysis.potential_apps.map((item) => `${item.type}:${item.path}`).join(", ") || "none"],
    ["Suggested delivery", analysis.suggested_delivery_mode],
    ["Risk level", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of analysis.next_actions) console.log(`- ${item}`);
}

function analyzeExistingProject(targetPath, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const root = repoRoot();
  const rel = path.relative(root, targetPath).replace(/\\/g, "/") || ".";
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const files = new Set(entries.filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(entries.filter((item) => item.isDirectory()).map((item) => item.name));
  const stacks = detectProjectStacks(targetPath, files, dirs);
  const potentialApps = detectPotentialApps(targetPath, dirs, stacks);
  const riskSignals = [];
  if (!files.has("README.md")) riskSignals.push("missing_readme");
  if (!files.has("package.json") && !files.has("composer.json") && !files.has("pyproject.toml") && !files.has("requirements.txt") && !files.has("pubspec.yaml")) riskSignals.push("unknown_dependency_manifest");
  if (!dirs.has("tests") && !dirs.has("__tests__") && !dirs.has("spec") && !dirs.has("test")) riskSignals.push("missing_visible_tests");
  if (files.has(".env")) riskSignals.push("env_file_present_review_secrets");

  const riskLevel = riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low";
  return {
    analysis_id: `project-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf project analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_stacks: stacks,
    top_level_directories: Array.from(dirs).sort(),
    top_level_files: Array.from(files).sort(),
    potential_apps: potentialApps,
    recommended_workstreams: inferWorkstreamsFromStacks(stacks, potentialApps),
    suggested_delivery_mode: flags.mode || inferDeliveryModeFromStacks(stacks, potentialApps, riskSignals),
    risk_level: riskLevel,
    risk_signals: riskSignals,
    next_actions: [
      "Review detected stacks and app boundaries before changing code.",
      "Create app records with `kvdf app create` for each real app boundary.",
      "Create or update workstreams with `kvdf workstream add` if defaults are not enough.",
      "Run `kvdf blueprint recommend \"describe the existing product\"` to map product capabilities.",
      "Run `kvdf questionnaire plan \"describe the existing product\"` to generate adoption questions.",
      "Create adoption tasks before feature implementation."
    ]
  };
}

function detectProjectStacks(targetPath, files, dirs) {
  const fs = require("fs");
  const path = require("path");
  const stacks = [];
  if (files.has("artisan") && files.has("composer.json")) stacks.push("laravel");
  else if (files.has("composer.json")) stacks.push("php_composer");
  if (files.has("package.json")) {
    stacks.push("node");
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(targetPath, "package.json"), "utf8"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.next) stacks.push("nextjs");
      if (deps.react) stacks.push("react");
      if (deps.nuxt) stacks.push("nuxt_vue");
      else if (deps.vue) stacks.push("vue");
      if (deps["@angular/core"]) stacks.push("angular");
      if (deps["@sveltejs/kit"]) stacks.push("sveltekit");
      if (deps.expo) stacks.push("react_native_expo");
      if (deps.express) stacks.push("expressjs");
      if (deps["@nestjs/core"]) stacks.push("nestjs");
      if (deps.astro) stacks.push("astro");
    } catch (error) {
      stacks.push("package_json_unreadable");
    }
  }
  if (files.has("manage.py")) stacks.push("django_or_python");
  if (files.has("pyproject.toml") || files.has("requirements.txt")) stacks.push("python");
  if (files.has("Gemfile")) stacks.push("ruby_or_rails");
  if (files.has("pubspec.yaml")) stacks.push("flutter_or_dart");
  if (files.has("angular.json")) stacks.push("angular");
  if (files.has("next.config.js") || files.has("next.config.mjs")) stacks.push("nextjs");
  if (files.has("astro.config.mjs")) stacks.push("astro");
  if (dirs.has("wp-content")) stacks.push("wordpress");
  return uniqueList(stacks);
}

function detectPotentialApps(targetPath, dirs, stacks) {
  const apps = [];
  const add = (type, appPath, reason) => apps.push({ type, path: appPath, reason });
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) add("backend", ".", "Backend framework detected at project root.");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) add("frontend", ".", "Frontend or web framework detected at project root.");
  if (stacks.some((item) => /expo|flutter|mobile/.test(item))) add("mobile", ".", "Mobile framework detected at project root.");
  for (const dir of ["apps", "packages", "frontend", "backend", "admin", "mobile", "api", "web"]) {
    if (dirs.has(dir)) add(inferAppTypeFromPath(dir), dir, `Common application folder detected: ${dir}.`);
  }
  return apps;
}

function inferAppTypeFromPath(value) {
  if (/api|backend/.test(value)) return "backend";
  if (/admin/.test(value)) return "admin_frontend";
  if (/mobile/.test(value)) return "mobile";
  return "frontend";
}

function inferWorkstreamsFromStacks(stacks, apps) {
  const workstreams = new Set();
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) workstreams.add("backend");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) workstreams.add("public_frontend");
  if (stacks.some((item) => /expo|flutter/.test(item))) workstreams.add("mobile");
  if (apps.some((item) => item.type === "admin_frontend")) workstreams.add("admin_frontend");
  workstreams.add("qa");
  workstreams.add("docs");
  return Array.from(workstreams);
}

function inferDeliveryModeFromStacks(stacks, apps, risks) {
  if (risks.length >= 3 || apps.length > 2) return "structured";
  return "agile";
}

function evolution(action, value, flags = {}, rest = []) {
  return evolutionCommand(action, value, flags, rest, {
    ensureWorkspace,
    fileExists,
    readJsonFile,
    writeJsonFile,
    readTextFile,
    table,
    appendAudit,
    refreshDashboardArtifacts,
    requireAnyRole,
    readStateArray,
    compactTitle,
    nextRecordId,
    parseCsv
  });
}

function createEvolutionTasks(change, flags = {}) {
  if (flags["no-tasks"]) return [];
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextTaskId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const createdAt = new Date().toISOString();
  const selectedAreas = orderEvolutionAreas(change.impacted_areas);
  const tasks = selectedAreas.map((area) => {
    const definition = evolutionAreaDefinition(area);
    const durable = buildEvolutionTaskExecutionDetails(change, area, definition);
    return {
      id: nextTaskId(),
      title: `Evolution Steward: update ${definition.label}`,
      status: "proposed",
      type: "framework_update",
      workstream: definition.workstream,
      workstreams: [definition.workstream],
      source: `evolution:${change.change_id}`,
      evolution_change_id: change.change_id,
      evolution_area: area,
      allowed_files: definition.files,
      acceptance_criteria: definition.acceptance,
      execution_summary: durable.execution_summary,
      resume_steps: durable.resume_steps,
      required_inputs: durable.required_inputs,
      expected_outputs: durable.expected_outputs,
      do_not_change: durable.do_not_change,
      verification_commands: durable.verification_commands,
      created_at: createdAt
    };
  });
  data.tasks.push(...tasks);
  writeJsonFile(tasksFile, data);
  for (const taskItem of tasks) {
    appendAudit("task.created", "task", taskItem.id, `Evolution follow-up task created: ${taskItem.title}`);
  }
  return tasks;
}

function buildEvolutionImpactPlan(change, tasks) {
  return {
    plan_id: `${change.change_id}-impact`,
    change_id: change.change_id,
    generated_at: new Date().toISOString(),
    title: change.title,
    status: "planned",
    impacted_areas: change.impacted_areas,
    dependency_rule: "When a Kabeeri framework capability changes, update every dependent runtime, schema, dashboard, report, documentation, and test surface before treating the change as done.",
    update_order: orderEvolutionAreas(change.impacted_areas),
    tasks: tasks.map((taskItem) => ({
      task_id: taskItem.id,
      area: taskItem.evolution_area,
      title: taskItem.title,
      workstream: taskItem.workstream,
      allowed_files: taskItem.allowed_files,
      execution_summary: taskItem.execution_summary,
      resume_steps: taskItem.resume_steps,
      expected_outputs: taskItem.expected_outputs,
      verification_commands: taskItem.verification_commands
    }))
  };
}

function buildEvolutionTaskExecutionDetails(change, area, definition) {
  const files = Array.isArray(definition.files) ? definition.files : [];
  const acceptance = Array.isArray(definition.acceptance) ? definition.acceptance : [];
  const changeTitle = change.title || change.description || change.change_id;
  const fileList = files.length ? files.join(", ") : "the files listed by the task scope";
  return {
    execution_summary: `Advance ${change.change_id} (${changeTitle}) by updating ${definition.label} only within ${fileList}.`,
    resume_steps: [
      `Read .kabeeri/evolution.json and confirm ${change.change_id} is still the source change.`,
      `Read this task's allowed_files and inspect only the files needed for ${definition.label}.`,
      `Apply the smallest coherent update for area '${area}' without starting a second Evolution priority.`,
      "Update related runtime state, docs, or tests only when they are inside the declared task scope.",
      "Run the listed verification commands or record why a command is not relevant."
    ],
    required_inputs: [
      `Evolution change ${change.change_id}`,
      `Impacted area: ${area}`,
      `Allowed files: ${fileList}`,
      `Acceptance criteria: ${acceptance.length ? acceptance.join(" | ") : "none listed"}`
    ],
    expected_outputs: [
      `${definition.label} reflects the requested Evolution change.`,
      "Changed files stay inside allowed_files unless the Owner explicitly expands scope.",
      "Acceptance criteria are satisfied or a blocker is recorded before handoff."
    ],
    do_not_change: [
      "Do not reorder unrelated Evolution priorities.",
      "Do not edit files outside allowed_files without explicit Owner confirmation.",
      "Do not mark the source change complete only because this one follow-up task is done."
    ],
    verification_commands: buildEvolutionTaskVerificationCommands(area)
  };
}

function buildEvolutionTaskVerificationCommands(area) {
  const commands = ["npm test"];
  if (area === "schemas") commands.unshift("npm run kvdf -- validate runtime-schemas");
  if (area === "tasks") commands.unshift("npm run kvdf -- validate tasks");
  if (area === "dashboard") commands.unshift("npm run kvdf -- dashboard state");
  if (area === "capabilities" || area === "docs" || area === "ai_context") commands.unshift("npm run kvdf -- validate");
  return Array.from(new Set(commands));
}

function inferEvolutionImpactedAreas(description, flags = {}) {
  const explicit = parseCsv(flags.areas || flags.area || "");
  if (explicit.length) return orderEvolutionAreas(explicit.map(normalizeEvolutionArea).filter(Boolean));
  const text = String(description || "").toLowerCase();
  const areas = new Set(["implementation", "tasks", "tests", "docs", "capabilities", "changelog"]);
  if (/cli|command|kvdf|help|terminal/.test(text)) areas.add("cli");
  if (/dashboard|live|json|monitor|state/.test(text)) areas.add("dashboard");
  if (/schema|contract|json state|validation|validate/.test(text)) areas.add("schemas");
  if (/report|readiness|governance/.test(text)) areas.add("reports");
  if (/github|release|publish/.test(text)) areas.add("release");
  if (/prompt|ai|vibe|question|intake|token|cost/.test(text)) areas.add("ai_context");
  return orderEvolutionAreas(Array.from(areas));
}

function normalizeEvolutionArea(area) {
  const value = String(area || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const aliases = {
    runtime: "implementation",
    code: "implementation",
    source: "implementation",
    task: "tasks",
    tracking: "tasks",
    doc: "docs",
    documentation: "docs",
    capability: "capabilities",
    capabilitymap: "capabilities",
    schema: "schemas",
    validation: "schemas",
    report: "reports",
    "live-report": "reports",
    "live-reports": "reports",
    "ai-context": "ai_context",
    ai: "ai_context",
    prompts: "ai_context",
    releases: "release"
  };
  return aliases[value] || value;
}

function orderEvolutionAreas(areas) {
  const order = ["implementation", "cli", "tasks", "schemas", "dashboard", "reports", "ai_context", "docs", "capabilities", "tests", "changelog", "release"];
  const normalized = [...new Set((areas || []).map(normalizeEvolutionArea).filter((area) => evolutionAreaDefinition(area, false)))];
  return normalized.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function evolutionAreaDefinition(area, required = true) {
  const definitions = {
    implementation: {
      label: "runtime implementation",
      workstream: "backend",
      files: ["src/cli/", "src/cli/workspace.js"],
      acceptance: ["Runtime behavior implements the requested Kabeeri capability.", "The implementation updates live state instead of relying on chat memory."]
    },
    cli: {
      label: "CLI surface and help",
      workstream: "docs",
      files: ["src/cli/index.js", "src/cli/ui.js", "cli/CLI_COMMAND_REFERENCE.md"],
      acceptance: ["The kvdf command surface is documented.", "Command help explains when and why to use the capability."]
    },
    tasks: {
      label: "task tracking integration",
      workstream: "docs",
      files: [".kabeeri/tasks.json", "knowledge/task_tracking/", "knowledge/task_tracking/TASK_GOVERNANCE.md"],
      acceptance: ["The update creates or links follow-up tasks.", "Task source and acceptance criteria identify the framework change."]
    },
    schemas: {
      label: "runtime schemas and validation",
      workstream: "qa",
      files: ["schemas/runtime/", "schemas/runtime/schema_registry.json", "src/cli/validate.js"],
      acceptance: ["New or changed runtime state has schema coverage.", "`kvdf validate runtime-schemas` can validate the state."]
    },
    dashboard: {
      label: "dashboard and live JSON surfaces",
      workstream: "admin_frontend",
      files: ["integrations/dashboard/", "src/cli/index.js", ".kabeeri/dashboard/"],
      acceptance: ["Dashboard state includes the update where operationally useful.", "The state can be refreshed after the change."]
    },
    reports: {
      label: "readiness/governance reports",
      workstream: "qa",
      files: [".kabeeri/reports/", "src/cli/index.js", "docs/internal/LIVE_JSON_REPORTS.md"],
      acceptance: ["Live reports summarize the update state.", "Action items show unfinished dependent work."]
    },
    ai_context: {
      label: "AI context and prompt guidance",
      workstream: "docs",
      files: ["knowledge/vibe_ux/", "packs/prompt_packs/", "README.md", "README_AR.md"],
      acceptance: ["AI assistants know how the capability affects their workflow.", "Prompt/context guidance avoids bypassing Kabeeri governance."]
    },
    docs: {
      label: "human documentation",
      workstream: "docs",
      files: ["docs/", "knowledge/"],
      acceptance: ["Human docs explain the capability, purpose, workflow, and source of truth.", "Arabic/English documentation is updated where the site exposes the capability."]
    },
    capabilities: {
      label: "capabilities reference",
      workstream: "docs",
      files: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/site/assets/js/app.js"],
      acceptance: ["The central capability map lists the new or changed capability.", "Docs site capability pages expose the capability to developers."]
    },
    tests: {
      label: "automated tests",
      workstream: "qa",
      files: ["tests/"],
      acceptance: ["Integration tests cover the new command/state behavior.", "`npm test` passes."]
    },
    changelog: {
      label: "changelog and owner state",
      workstream: "docs",
      files: ["CHANGELOG.md", "OWNER_DEVELOPMENT_STATE.md"],
      acceptance: ["CHANGELOG records the framework change.", "Owner development state is updated when the change affects future continuation."]
    },
    release: {
      label: "release and publishing guidance",
      workstream: "qa",
      files: ["docs/production/", "CHANGELOG.md"],
      acceptance: ["Release notes/gates mention any publishing impact.", "No release/publish step proceeds before validation."]
    }
  };
  const definition = definitions[area];
  if (!definition && required) throw new Error(`Unknown evolution area: ${area}`);
  return definition || null;
}

function buildEvolutionSummary(state) {
  return buildEvolutionSummaryService(state);
}

function renderEvolutionSummary(summary) {
  return [
    "# Evolution Steward",
    "",
    `Status: ${summary.status}`,
    `Changes: ${summary.changes_total}`,
    `Active changes: ${summary.active_changes}`,
    `Follow-up tasks: ${summary.follow_up_tasks_total}`,
    `Open follow-up tasks: ${summary.open_follow_up_tasks}`,
    `Development priorities: ${summary.open_priorities}/${summary.priorities_total} open`,
    `Deferred ideas: ${summary.open_deferred_ideas || 0}/${summary.deferred_ideas_total || 0} open`,
    `Temporary priority queue: ${summary.temporary_priority_queue ? `${summary.temporary_priority_queue.source_priority_id} (${summary.temporary_priority_queue.open_slices}/${summary.temporary_priority_queue.total_slices} open)` : "none"}`,
    `Multi-AI orchestration: ${summary.multi_ai ? `${summary.multi_ai.status} (${summary.multi_ai.active_queues} active queues)` : "none"}`,
    `Next priority: ${summary.next_priority ? summary.next_priority.title : "none"}`,
    `Current change: ${summary.current_change_id || "none"}`
  ].join("\n");
}

function ensureEvolutionTemporaryPriorities(state) {
  return ensureEvolutionTemporaryPrioritiesService(state);
  state.temporary_priorities = state.temporary_priorities && typeof state.temporary_priorities === "object" ? state.temporary_priorities : null;
}

function getCurrentTemporaryPriorities(state) {
  return getCurrentTemporaryPrioritiesService(state);
  ensureEvolutionTemporaryPriorities(state);
  return state.temporary_priorities;
}

function getCurrentEvolutionPriority(state) {
  return getCurrentEvolutionPriorityService(state);
  ensureEvolutionDevelopmentPriorities(state);
  return state.development_priorities.find((item) => item.status === "in_progress") || null;
}

function buildEvolutionTemporaryPrioritySlices(priority) {
  return buildEvolutionTemporaryPrioritySlicesService(priority);
  const title = priority ? priority.title : "Temporary execution priorities";
  const summary = priority ? priority.summary : "";
  return [
    {
      slice_id: "scope",
      order: 1,
      title: `Lock full task coverage for ${title}`,
      description: `Restate the active priority in execution terms, enumerate every required step from start to finish, and write down what must not change while the queue is in progress so nothing is left outside the queue. ${summary ? `Source summary: ${summary}` : ""}`.trim(),
      done_definition: "The owner can read a complete execution statement with no leftover work hidden outside the queue.",
      owner_confirmation_required: false
    },
    {
      slice_id: "map",
      order: 2,
      title: "Map every dependent surface",
      description: "Identify the files, runtime state, docs, schemas, tests, reports, and handoff surfaces that must move together so the priority stays completely covered.",
      done_definition: "All dependent surfaces are named before implementation starts and no known part is left unaccounted for.",
      owner_confirmation_required: false
    },
    {
      slice_id: "implement",
      order: 3,
      title: "Implement the complete task path",
      description: "Make the smallest code and state change that still covers the entire current task path from entry to finish with no leftover execution remainder.",
      done_definition: "The main change is implemented with no leftover execution remainder outside the queue.",
      owner_confirmation_required: false
    },
    {
      slice_id: "sync",
      order: 4,
      title: "Sync docs, state, and reports",
      description: "Update the source-of-truth docs, runtime state, and any dashboards or reports so the full task coverage is visible everywhere.",
      done_definition: "Documentation, live state, and reports all reflect the complete task path with no stray remainder.",
      owner_confirmation_required: false
    },
    {
      slice_id: "validate",
      order: 5,
      title: "Validate and close the queue",
      description: "Run the relevant checks, confirm there are no conflicts, and close the queue only when the entire current task has been covered from start to finish.",
      done_definition: "Validation passes and no uncovered part of the active task remains.",
      owner_confirmation_required: false
    }
  ];
}

function buildEvolutionTemporaryPrioritiesReport(state) {
  return buildEvolutionTemporaryPrioritiesReportService(state);
  const currentPriority = getCurrentEvolutionPriority(state);
  if (!currentPriority) {
    if (state.temporary_priorities && state.temporary_priorities.source_priority_id) state.temporary_priorities = null;
    return {
      report_type: "evolution_temporary_priorities",
      generated_at: new Date().toISOString(),
      status: "empty",
      active_priority: null,
      queue: null
    };
  }

  const sourceSignature = [currentPriority.id, currentPriority.status, currentPriority.updated_at || currentPriority.created_at || ""].join("|");
  const existing = state.temporary_priorities && state.temporary_priorities.source_priority_id === currentPriority.id && state.temporary_priorities.source_signature === sourceSignature
    ? state.temporary_priorities
    : null;
  const generatedAt = new Date().toISOString();
  const queue = existing || {
    queue_id: `${currentPriority.id}-temp`,
    source_priority_id: currentPriority.id,
    source_priority_title: currentPriority.title,
    source_priority_summary: currentPriority.summary,
    source_signature: sourceSignature,
    generated_at: generatedAt,
    expires_when_priority_changes: true,
    status: "active",
    current_slice_index: 0,
    coverage_policy: "full_task_coverage",
    slices: buildEvolutionTemporaryPrioritySlices(currentPriority).map((slice, index) => ({
      ...slice,
      state: index === 0 ? "active" : "pending",
      completed_at: null
    }))
  };

  if (existing && Array.isArray(existing.slices)) {
    queue.slices = existing.slices.map((slice, index) => ({
      ...slice,
      order: slice.order || index + 1,
      state: slice.state || (index === existing.current_slice_index ? "active" : "pending")
    }));
    queue.current_slice_index = Math.min(Math.max(Number(existing.current_slice_index || 0), 0), Math.max(queue.slices.length - 1, 0));
  }

  queue.current_slice = queue.slices[queue.current_slice_index] || null;
  queue.coverage_policy = queue.coverage_policy || "full_task_coverage";
  queue.updated_at = generatedAt;
  queue.expires_at = null;
  queue.status = queue.slices.some((slice) => slice.state === "blocked")
    ? "blocked"
    : queue.slices.every((slice) => slice.state === "done")
      ? "completed"
      : "active";
  if (queue.status === "completed") queue.current_slice = null;
  state.temporary_priorities = queue;
  return {
    report_type: "evolution_temporary_priorities",
    generated_at: generatedAt,
    status: queue.status,
    active_priority: {
      id: currentPriority.id,
      title: currentPriority.title,
      summary: currentPriority.summary,
      status: currentPriority.status
    },
    queue
  };
}

function advanceEvolutionTemporaryPriorities(state, flags = {}) {
  return advanceEvolutionTemporaryPrioritiesService(state, flags);
  const report = buildEvolutionTemporaryPrioritiesReport(state);
  const queue = state.temporary_priorities;
  if (!queue) {
    return {
      ...report,
      action: "advance",
      message: "No active temporary priorities queue exists."
    };
  }
  const currentSlice = queue.slices[queue.current_slice_index] || null;
  if (!currentSlice) {
    return {
      ...report,
      action: "advance",
      message: "Temporary priorities queue has no current slice."
    };
  }
  currentSlice.state = "done";
  currentSlice.completed_at = new Date().toISOString();
  const nextIndex = queue.slices.findIndex((slice, index) => index > queue.current_slice_index && slice.state !== "done");
  if (nextIndex >= 0) {
    queue.current_slice_index = nextIndex;
    queue.slices[nextIndex].state = "active";
    queue.current_slice = queue.slices[nextIndex];
    queue.status = "active";
  } else {
    queue.current_slice = null;
    queue.status = "completed";
    queue.completed_at = new Date().toISOString();
  }
  queue.updated_at = new Date().toISOString();
  return {
    report_type: "evolution_temporary_priorities_advanced",
    generated_at: new Date().toISOString(),
    active_priority: report.active_priority,
    queue,
    completed_slice: currentSlice,
    next_slice: queue.current_slice || null,
    status: queue.status
  };
}

function completeEvolutionTemporaryPriorities(state) {
  return completeEvolutionTemporaryPrioritiesService(state);
  const report = buildEvolutionTemporaryPrioritiesReport(state);
  const queue = state.temporary_priorities;
  if (!queue) {
    return {
      ...report,
      action: "complete",
      message: "No active temporary priorities queue exists."
    };
  }
  const completedAt = new Date().toISOString();
  for (const slice of queue.slices) {
    if (slice.state !== "done") {
      slice.state = "done";
      slice.completed_at = slice.completed_at || completedAt;
    }
  }
  queue.status = "completed";
  queue.completed_at = completedAt;
  queue.current_slice = null;
  queue.updated_at = completedAt;
  state.temporary_priorities = queue;
  return {
    report_type: "evolution_temporary_priorities_completed",
    generated_at: completedAt,
    active_priority: report.active_priority,
    queue,
    status: "completed"
  };
}

function handleEvolutionTemporaryPriorities(state, action, value, flags = {}, rest = []) {
  return handleEvolutionTemporaryPrioritiesService(state, action, value, flags, rest);
  const valueDrivenActions = new Set(["temp", "temporary", "temp-priorities", "temporary-priorities"]);
  const subaction = valueDrivenActions.has(String(action || "").toLowerCase())
    ? String(value || "show").toLowerCase()
    : String(action || "show").toLowerCase();
  if (["show", "list", "status", "temp", "temporary", "temp-priorities", "temporary-priorities"].includes(subaction)) {
    return buildEvolutionTemporaryPrioritiesReport(state);
  }
  if (["advance", "next"].includes(subaction)) return advanceEvolutionTemporaryPriorities(state, flags);
  if (["complete", "close", "finish"].includes(subaction)) return completeEvolutionTemporaryPriorities(state);
  if (subaction === "clear") {
    const queue = state.temporary_priorities;
    state.temporary_priorities = null;
    return {
      report_type: "evolution_temporary_priorities_cleared",
      generated_at: new Date().toISOString(),
      queue,
      status: "cleared"
    };
  }
  throw new Error(`Unknown temporary priorities action: ${subaction}`);
}

function renderEvolutionTemporaryPrioritiesReport(report) {
  if (report.report_type === "evolution_temporary_priorities_advanced") {
    return `Temporary priorities advanced: ${report.completed_slice.title} -> ${report.next_slice ? report.next_slice.title : "complete"}`;
  }
  if (report.report_type === "evolution_temporary_priorities_completed") {
    return `Temporary priorities completed for ${report.active_priority ? report.active_priority.id : "none"}`;
  }
  if (report.report_type === "evolution_temporary_priorities_cleared") {
    return "Temporary priorities queue cleared.";
  }
  if (report.status === "empty") return "No active temporary priorities queue.";
  const queue = report.queue;
  const lines = [
    "Temporary Execution Priorities",
    "",
    `Active priority: ${report.active_priority.id} - ${report.active_priority.title}`,
    `Queue status: ${report.status}`,
    `Current slice: ${queue.current_slice ? `${queue.current_slice.order}. ${queue.current_slice.title}` : "none"}`,
    `Expires with: ${queue.source_priority_id}`,
    "",
    "Slices:"
  ];
  for (const slice of queue.slices) {
    lines.push(`- [${slice.state}] ${slice.order}. ${slice.title}: ${slice.description}`);
  }
  return lines.join("\n");
}

function ensureEvolutionDevelopmentPriorities(state) {
  state.development_priorities = state.development_priorities || [];
  const existing = new Map(state.development_priorities.map((item) => [item.id, item]));
  for (const item of defaultEvolutionDevelopmentPriorities()) {
    const executionDetails = buildEvolutionPriorityExecutionDetails(item);
    if (!existing.has(item.id)) {
      state.development_priorities.push({ ...item, status: item.status || "planned", execution_details: executionDetails });
    } else {
      const current = existing.get(item.id);
      Object.assign(current, {
        priority: current.priority || item.priority,
        title: item.title,
        summary: item.summary,
        source: item.source,
        execution_details: current.execution_details || executionDetails
      });
      current.status = current.status || item.status || "planned";
    }
  }
  state.development_priorities.sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999));
}

function buildEvolutionPriorityExecutionDetails(priority) {
  return {
    execution_summary: `Execute priority ${priority.id}: ${priority.summary}`,
    resume_steps: [
      "Run `kvdf resume` and confirm the workspace is framework_owner_development.",
      `Run \`kvdf evolution priority ${priority.id} --status in_progress\` if the priority is not active yet.`,
      "Run `kvdf evolution temp` first and follow the current temporary slice before any implementation, docs, or tests.",
      "Create or update scoped tasks before handing execution to another tool.",
      "Run `npm test` and `kvdf conflict scan` before closing the priority."
    ],
    required_inputs: [
      `Priority id: ${priority.id}`,
      `Priority title: ${priority.title}`,
      `Source: ${priority.source || "unknown"}`
    ],
    expected_outputs: [
      "The priority has concrete tasks or slices with allowed files and acceptance criteria.",
      "Runtime state and documentation agree about the completed behavior.",
      "The owner can resume from Evolution state without chat history."
    ],
    do_not_change: [
      "Do not skip earlier open priorities without Owner confirmation.",
      "Do not start a broad feature outside the active priority.",
      "Do not close the priority while tests or conflict scan are failing."
    ],
    verification_commands: ["npm test", "npm run kvdf -- conflict scan"]
  };
}

function buildDeferredIdeaExecutionDetails(ideaId, title) {
  return {
    execution_summary: `Deferred idea ${ideaId} (${title}) is preserved for later review and must not be implemented until restored into Evolution.`,
    resume_steps: [
      `Run \`kvdf evolution deferred restore ${ideaId} --confirm-placement\` only after Owner approval.`,
      "Review duplicate capability risk before creating implementation tasks.",
      "Use the restored Evolution change and generated tasks as the execution source.",
      "Keep this deferred record as history after restore."
    ],
    required_inputs: [
      `Deferred idea id: ${ideaId}`,
      `Idea title: ${title}`,
      "Owner restore decision"
    ],
    expected_outputs: [
      "Either the idea remains deferred with analysis intact, or it is restored into a normal Evolution change.",
      "No implementation happens directly from the deferred idea record."
    ],
    do_not_change: [
      "Do not edit product/runtime code for a deferred idea before restore.",
      "Do not delete the deferred idea to save context.",
      "Do not treat analysis_summary as execution approval."
    ],
    verification_commands: ["npm run kvdf -- evolution deferred --json"]
  };
}

function defaultEvolutionDevelopmentPriorities() {
  return [
    {
      id: "evo-auto-001",
      priority: 1,
      title: "Autonomous Evolution Steward workflow",
      summary: "Make Evolution Steward the single automatic backlog for framework development priorities, feature requests, and next-step visibility.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-002",
      priority: 2,
      title: "Owner resume scan",
      summary: "Enhance kvdf resume --scan with owner checkpoint, diff summary, latest checks, and next exact development action.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-003",
      priority: 3,
      title: "Continue CLI index modularization",
      summary: "Keep extracting src/cli/index.js into command modules before broad feature work.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-004-temp-priorities",
      priority: 4,
      title: "Temporary execution priorities",
      summary: "Create a temporary queue for the current active main priority only, split it into execution-grade slices with durable descriptions, auto-advance through slices without owner re-approval inside the same priority, and expire the queue automatically when that main priority finishes.",
      source: "owner_conversation",
      status: "planned",
      change_id: "evo-003",
      created_at: "2026-05-10T18:58:29.473Z"
    },
    {
      id: "evo-auto-005-durable-task-details",
      priority: 5,
      title: "Durable execution-grade task descriptions",
      summary: "Make every task in development priorities and deferred ideas carry precise execution details so work can resume safely after power loss or interrupted sessions.",
      source: "owner_conversation",
      status: "planned",
      change_id: "evo-004",
      created_at: "2026-05-10T20:28:40.468Z"
    },
    {
      id: "evo-auto-017-multi-ai-governance",
      priority: 6,
      title: "Multi-AI governance with Leader orchestration and Merger layer",
      summary: "Make Evolution govern a multi-AI workflow with a first-in-session Leader AI that orchestrates priorities, per-AI temporary queues, semantic merge bundles, and delegated execution only when the Owner explicitly grants it, so multiple tools can work across devices without trampling the system or each other.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-004",
      priority: 7,
      title: "Runtime services layer",
      summary: "Move reusable runtime logic out of command handlers into services after command extraction pattern stabilizes.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-005",
      priority: 8,
      title: "Manual source package intake",
      summary: "Treat KVDF_New_Features_Docs as a manually requested source package that contains reference system designs and project-documentation generators, keep it out of automatic scans, and extract its contents before the folder is removed.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-006",
      priority: 9,
      title: "Reference design duplicate analysis",
      summary: "Analyze the Software Design System inside KVDF_New_Features_Docs only when requested, compare it against the central capability map, and avoid recreating existing capabilities under new names.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-007",
      priority: 10,
      title: "Project documentation generator import",
      summary: "Review the project documentation generator system inside KVDF_New_Features_Docs and import the reusable docs flow, templates, and catalog entries into the proper Kabeeri systems.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-008",
      priority: 11,
      title: "Source package cleanup and removal workflow",
      summary: "After both the Software Design System and the project documentation generator system from KVDF_New_Features_Docs are represented in Evolution Steward and the correct Kabeeri folders, clear the source package contents and remove the folder.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-009",
      priority: 12,
      title: "UI/UX questionnaire linkage",
      summary: "Make missing UI decisions explicit in questionnaire, resume output, and frontend task generation.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-010",
      priority: 13,
      title: "Low-cost project start mode",
      summary: "Add compact context, focused packs, and model-routing defaults for cheaper Kabeeri app development.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-011",
      priority: 14,
      title: "Runtime schema registry enforcement",
      summary: "Block or warn on new runtime state files without schema coverage or explicit exemption.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-012",
      priority: 15,
      title: "Docs source-of-truth checks",
      summary: "Detect commands/capabilities that exist in CLI but are missing from canonical docs.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-013",
      priority: 16,
      title: "Team GitHub sync deepening",
      summary: "Add issue/PR/status/comment integration and action-triggered feedback only for team mode.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-014",
      priority: 17,
      title: "Dashboard separation",
      summary: "Separate dashboard generation/state builders from CLI core and strengthen JSON contract tests.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-015",
      priority: 18,
      title: "Fast test layers",
      summary: "Add faster unit/service tests beside integration tests as runtime services are extracted.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-016",
      priority: 19,
      title: "Historical folder/version clarity",
      summary: "Mark historical folders and reports clearly so runtime never treats archived planning as current truth.",
      source: "technical_debt_review",
      status: "planned"
    }
  ];
}

function buildEvolutionPrioritiesReport(state) {
  ensureEvolutionDevelopmentPriorities(state);
  ensureEvolutionTemporaryPriorities(state);
  const openDeferredIdeas = getOpenDeferredIdeas(state);
  const priorities = [...(state.development_priorities || [])];
  const deferredSummary = {
    total: Array.isArray(state.deferred_ideas) ? state.deferred_ideas.length : 0,
    open: openDeferredIdeas.length,
    latest: openDeferredIdeas.length ? openDeferredIdeas[openDeferredIdeas.length - 1] : null
  };
  if (deferredSummary.open > 0) priorities.push(buildDeferredIdeasPriorityItem(priorities, deferredSummary));
  const temporaryReport = buildEvolutionTemporaryPrioritiesReport(state);
  const multiAiState = fileExists(".kabeeri/multi_ai_governance.json") ? readJsonFile(".kabeeri/multi_ai_governance.json") : null;
  const activeLeader = multiAiState && Array.isArray(multiAiState.leader_sessions)
    ? multiAiState.leader_sessions.find((item) => item.session_id === multiAiState.active_leader_session_id) || multiAiState.leader_sessions.find((item) => item.status === "active") || null
    : null;
  state.priorities_last_reviewed_at = new Date().toISOString();
  return {
    report_type: "evolution_development_priorities",
    generated_at: new Date().toISOString(),
    status: priorities.some((item) => !["done", "deferred", "rejected"].includes(item.status)) ? "active" : "complete",
    priorities,
    deferred_ideas: deferredSummary,
    temporary_priorities: temporaryReport.status === "empty" ? null : temporaryReport.queue,
    multi_ai: multiAiState ? {
      status: activeLeader ? "active" : "idle",
      active_leader_session_id: activeLeader ? activeLeader.session_id : null,
      active_leader_ai_id: activeLeader ? activeLeader.leader_ai_id : null,
      active_queues: Array.isArray(multiAiState.worker_queues) ? multiAiState.worker_queues.filter((item) => item.status === "active").length : 0
    } : null,
    next_priority: priorities.find((item) => !["done", "deferred", "rejected"].includes(item.status)) || null
  };
}

function buildEvolutionNextAction(next) {
  if (!next) return null;
  if (next.status === "planned") {
    if (next.id === "evo-auto-005-durable-task-details") {
      return "Activate the priority with `kvdf evolution priority evo-auto-005-durable-task-details --status in_progress`, then run `kvdf evolution temp` and expand each task and deferred idea with durable execution details before handing work to tools.";
    }
    return `Activate ${next.id} with \`kvdf evolution priority ${next.id} --status in_progress\`, then run \`kvdf evolution temp\` to generate the execution queue and start from the current slice.`;
  }
  if (next.status === "in_progress") {
    return `Run \`kvdf evolution temp\` for ${next.id} before any implementation, docs, or tests, then advance slices as each execution-grade task is completed.`;
  }
  if (next.status === "blocked") {
    return `Clear blockers for ${next.id} before advancing it again.`;
  }
  return `Review ${next.id} and update its status as needed.`;
}

function buildDeferredIdeasPriorityItem(priorities, summary) {
  const maxPriority = priorities.reduce((max, item) => Math.max(max, Number(item.priority || 0)), 0);
  return {
    id: "evo-deferred-ideas",
    priority: maxPriority + 1,
    title: "Deferred development ideas",
    summary: `${summary.open} deferred idea(s). Review with kvdf evolution deferred --json; restore selected ideas explicitly before implementation.`,
    source: "deferred_ideas_store",
    status: "deferred",
    count: summary.open,
    latest_idea_id: summary.latest ? summary.latest.idea_id : null,
    execution_details: {
      execution_summary: "Review deferred ideas as candidates only; do not execute them until the Owner restores a selected idea into Evolution.",
      resume_steps: [
        "Run `kvdf evolution deferred --json` to list open ideas.",
        "Compare the idea against the capability map and current priorities.",
        "Restore only the selected idea with explicit Owner placement confirmation.",
        "Let the restored idea create a normal Evolution change and scoped tasks before implementation."
      ],
      required_inputs: ["Deferred idea id", "Owner placement decision", "Capability duplicate review"],
      expected_outputs: ["A restored Evolution change or a decision to keep the idea deferred."],
      do_not_change: ["Do not implement directly from the deferred bucket.", "Do not reorder active priorities while reviewing deferred ideas."],
      verification_commands: ["npm run kvdf -- evolution priorities"]
    }
  };
}

function updateEvolutionPriority(state, id, flags = {}) {
  ensureEvolutionDevelopmentPriorities(state);
  const priority = state.development_priorities.find((item) => item.id === id || String(item.priority) === String(id));
  if (!priority) throw new Error(`Evolution priority not found: ${id}`);
  if (!flags.status && !flags.note && !flags.notes && !flags.summary) return priority;
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "update evolution priority");
  if (flags.status) {
    const status = String(flags.status).toLowerCase().replace(/-/g, "_");
    const allowed = new Set(["planned", "in_progress", "blocked", "done", "deferred", "rejected"]);
    if (!allowed.has(status)) throw new Error("Invalid priority status. Use planned, in_progress, blocked, done, deferred, or rejected.");
    priority.status = status;
  }
  const note = flags.note || flags.notes || flags.summary;
  if (note && note !== true) {
    priority.notes = priority.notes || [];
    priority.notes.push({ at: new Date().toISOString(), text: String(note) });
  }
  priority.updated_at = new Date().toISOString();
  buildEvolutionTemporaryPrioritiesReport(state);
  return priority;
}

function handleEvolutionDeferredIdeas(state, action, value, flags = {}, rest = []) {
  state.deferred_ideas = state.deferred_ideas || [];
  const subaction = action === "defer" ? "add" : String(value || "list").toLowerCase();
  const text = action === "defer"
    ? [value, ...rest].filter(Boolean).join(" ").trim()
    : rest.filter(Boolean).join(" ").trim();

  if (["list", "show", "status"].includes(subaction)) {
    const ideas = state.deferred_ideas.filter((item) => !flags.all ? item.status === "deferred" : true);
    return {
      report_type: "evolution_deferred_ideas",
      generated_at: new Date().toISOString(),
      status: ideas.length ? "has_deferred_ideas" : "empty",
      total: state.deferred_ideas.length,
      open: getOpenDeferredIdeas(state).length,
      ideas
    };
  }

  if (subaction === "add" || subaction === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "defer evolution idea");
    const description = text || flags.description || flags.summary || flags.title;
    if (!description || description === true) throw new Error("Missing deferred idea description.");
    const ideaId = nextDeferredIdeaId(state.deferred_ideas);
    const title = flags.title && flags.title !== true ? flags.title : compactTitle(description);
    const idea = {
      idea_id: ideaId,
      title,
      description: String(description),
      status: "deferred",
      source: flags.source || "owner_deferred_idea",
      reason: flags.reason || "Deferred by Owner for later review.",
      recommended_after: flags["recommended-after"] || null,
      recommended_before: flags["recommended-before"] || null,
      analysis_summary: flags.analysis || null,
      execution_details: buildDeferredIdeaExecutionDetails(ideaId, title),
      created_at: new Date().toISOString(),
      restored_at: null,
      restored_change_id: null
    };
    state.deferred_ideas.push(idea);
    return {
      report_type: "evolution_deferred_idea_added",
      generated_at: new Date().toISOString(),
      idea,
      priorities_hint: "This idea appears only inside the final deferred ideas bucket until the Owner restores it."
    };
  }

  if (subaction === "restore" || subaction === "promote") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "restore deferred idea");
    const ideaId = flags.id || rest[0];
    if (!ideaId) throw new Error("Missing deferred idea id.");
    const idea = state.deferred_ideas.find((item) => item.idea_id === ideaId);
    if (!idea) throw new Error(`Deferred idea not found: ${ideaId}`);
    if (idea.status !== "deferred") throw new Error(`Deferred idea is not open: ${ideaId}`);
    const description = flags.description || idea.description;
    const placement = buildEvolutionFeatureRequestPlacement(state, description, flags);
    if (placement.requires_confirmation && !isEvolutionPlacementConfirmed(flags)) {
      return {
        ...placement,
        deferred_idea: idea,
        restore_requires_confirmation: true
      };
    }
    const change = createEvolutionChange(state, description, {
      ...flags,
      title: flags.title || idea.title,
      source: "deferred_idea_restore"
    });
    change.restored_deferred_idea_id = idea.idea_id;
    change.priority_confirmation = {
      confirmed_at: new Date().toISOString(),
      active_priority_id: placement.active_priority ? placement.active_priority.id : null,
      recommended_position: placement.recommended_position || null,
      requested_position: flags["priority-position"] || flags.priority || null,
      confirmation_flag: flags["confirm-placement"] || flags["confirm-priority"] || flags.confirm
    };
    const tasks = createEvolutionTasks(change, flags);
    change.task_ids = tasks.map((item) => item.id);
    const plan = buildEvolutionImpactPlan(change, tasks);
    change.impact_plan_id = plan.plan_id;
    state.impact_plans.push(plan);
    state.current_change_id = change.change_id;
    idea.status = "restored";
    idea.restored_at = new Date().toISOString();
    idea.restored_change_id = change.change_id;
    refreshDashboardArtifacts();
    appendAudit("evolution.deferred_idea_restored", "evolution", idea.idea_id, `Deferred idea restored: ${idea.title}`);
    return {
      report_type: "evolution_deferred_idea_restored",
      generated_at: new Date().toISOString(),
      idea,
      change,
      impact_plan: plan,
      tasks
    };
  }

  throw new Error(`Unknown deferred ideas action: ${subaction}`);
}

function getOpenDeferredIdeas(state) {
  return (state.deferred_ideas || []).filter((item) => item.status === "deferred");
}

function nextDeferredIdeaId(items) {
  return `deferred-${String((items || []).length + 1).padStart(3, "0")}`;
}

function renderEvolutionDeferredIdeasResult(result) {
  if (result.report_type === "evolution_deferred_idea_added") {
    return `Deferred idea added: ${result.idea.idea_id} - ${result.idea.title}`;
  }
  if (result.report_type === "evolution_deferred_idea_restored") {
    return `Deferred idea restored: ${result.idea.idea_id} -> ${result.change.change_id}`;
  }
  if (result.report_type === "evolution_feature_request_placement") {
    return renderEvolutionFeatureRequestPlacement(result);
  }
  if (result.report_type === "evolution_deferred_ideas") {
    const rows = result.ideas.map((item) => [item.idea_id, item.status, item.title, item.created_at || ""]);
    return [
      "Kabeeri Deferred Development Ideas",
      table(["Idea", "Status", "Title", "Created"], rows.length ? rows : [["", "", "No deferred ideas.", ""]]),
      "",
      `Open: ${result.open}/${result.total}`
    ].join("\n");
  }
  return JSON.stringify(result, null, 2);
}

function renderEvolutionPriorities(report) {
  const rows = report.priorities.map((item) => [
    item.priority,
    item.id,
    item.status,
    item.title
  ]);
  const tempRows = report.temporary_priorities ? report.temporary_priorities.slices.map((slice) => [
    slice.order,
    slice.slice_id,
    slice.state,
    slice.title
  ]) : [];
  return [
    "Kabeeri Evolution Development Priorities",
    table(["#", "ID", "Status", "Title"], rows),
    "",
    report.temporary_priorities ? [
      "Temporary Execution Priorities",
      table(["#", "ID", "Status", "Title"], tempRows),
      ""
    ].join("\n") : "",
    `Multi-AI sync: ${report.multi_ai ? `${report.multi_ai.status} (${report.multi_ai.active_queues} active queues)` : "none"}`,
    `Next: ${report.next_priority ? `${report.next_priority.id} - ${report.next_priority.title}` : "none"}`
  ].join("\n");
}

function findExistingCapabilityMatches(description) {
  const capabilityText = fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md")
    ? readTextFile("docs/SYSTEM_CAPABILITIES_REFERENCE.md").toLowerCase()
    : "";
  const words = significantWords(description);
  return words
    .filter((word) => capabilityText.includes(word))
    .slice(0, 12);
}

function findExistingEvolutionMatches(state, description) {
  const words = significantWords(description);
  return (state.changes || [])
    .filter((change) => {
      const text = `${change.title || ""} ${change.description || ""}`.toLowerCase();
      return words.filter((word) => text.includes(word)).length >= Math.min(3, words.length);
    })
    .slice(0, 5)
    .map((change) => ({ change_id: change.change_id, title: change.title, status: change.status }));
}

function significantWords(value) {
  const stop = new Set(["add", "new", "the", "and", "for", "with", "from", "into", "system", "feature", "kabeeri", "kvdf", "????", "????", "????"]);
  return String(value || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !stop.has(word))
    .slice(0, 20);
}

function nextRecordId(items, field, prefix) {
  const existing = new Set((items || []).map((item) => item[field]));
  let index = (items || []).length + 1;
  let id = `${prefix}-${String(index).padStart(3, "0")}`;
  while (existing.has(id)) {
    index += 1;
    id = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return id;
}

function compactTitle(text) {
  const value = String(text || "").trim().replace(/\s+/g, " ");
  return value.length <= 76 ? value : `${value.slice(0, 73)}...`;
}

function task(action, id, flags, rest = []) {
  ensureWorkspace();
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];

  if (!action || action === "list") {
    const rows = data.tasks.map((item) => {
      const lifecycle = buildTaskLifecycleState(item);
      return [item.id, item.title, item.status, lifecycle.current_stage, item.assignee_id || ""];
    });
    console.log(table(["ID", "Title", "Status", "Lifecycle", "Assignee"], rows));
    return;
  }

  if (["tracker", "track", "dashboard", "live", "live-json"].includes(action)) {
    const tracker = refreshTaskTrackerState();
    if (flags.json || action === "live-json") console.log(JSON.stringify(tracker, null, 2));
    else console.log(renderTaskTrackerSummary(tracker));
    return;
  }

  if (["assessment", "assess", "assessments"].includes(action)) {
    taskAssessment(action, id, flags, rest);
    return;
  }

  if (["coverage", "cover"].includes(action)) {
    taskCoverage(action, id, flags, rest);
    return;
  }

  if (["lifecycle", "flow"].includes(action)) {
    const taskId = flags.id || id;
    if (taskId) {
      const found = data.tasks.find((item) => item.id === taskId);
      if (found) {
        const lifecycle = buildTaskLifecycleState(found);
        const output = { ...lifecycle, task: found };
        if (flags.json) console.log(JSON.stringify(output, null, 2));
        else console.log(renderTaskLifecycleState(output));
        return;
      }
      const archived = readTaskLifecycleTrash(taskId);
      if (archived) {
        const lifecycle = buildTaskLifecycleState({
          id: archived.id,
          title: archived.title,
          status: "trashed",
          trashed_at: archived.trashed_at,
          trashed_reason: archived.trashed_reason,
          original_status: archived.original_status
        }, { archived: true, original_status: archived.original_status, trashed_reason: archived.trashed_reason });
        const output = { ...lifecycle, task: archived };
        if (flags.json) console.log(JSON.stringify(output, null, 2));
        else console.log(renderTaskLifecycleState(output));
        return;
      }
      throw new Error(`Task not found: ${taskId}`);
    }
    const board = buildTaskLifecycleBoard(data.tasks);
    if (flags.json) console.log(JSON.stringify(board, null, 2));
    else console.log(renderTaskLifecycleBoard(board));
    return;
  }

  if (action === "status") {
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) {
      try {
      const trash = showTaskTrash(taskId);
      const schedulerReport = buildTaskSchedulerReport(readJsonFile, fileExists);
      const schedulerHistory = (schedulerReport.task_lineage || []).find((item) => item.task_id === taskId) || null;
      const lifecycle = buildTaskLifecycleState({
        id: trash.item.id,
        title: trash.item.title,
        status: "trashed",
        trashed_at: trash.item.trashed_at,
          trashed_reason: trash.item.trashed_reason,
        original_status: trash.item.original_status
      }, { archived: true, original_status: trash.item.original_status, trashed_reason: trash.item.trashed_reason });
      console.log(JSON.stringify({
        ...trash.item,
        lifecycle,
        scheduler_history: schedulerHistory,
        scheduler_restore_hint: schedulerHistory ? schedulerHistory.restore_hint || null : null
      }, null, 2));
      return;
    } catch (error) {
      throw new Error(`Task not found: ${taskId}`);
    }
    }
    const memory = ensureTaskMemory(found, { id: found.id, title: found.title, status: found.status, allowed_files: found.allowed_files });
    if (!found.execution_summary) found.execution_summary = memory.summary;
    if (!Array.isArray(found.resume_steps) || found.resume_steps.length === 0) found.resume_steps = memory.resume_steps;
    if (!Array.isArray(found.required_inputs) || found.required_inputs.length === 0) found.required_inputs = memory.required_inputs;
    if (!Array.isArray(found.expected_outputs) || found.expected_outputs.length === 0) found.expected_outputs = memory.expected_outputs;
    if (!Array.isArray(found.do_not_change) || found.do_not_change.length === 0) found.do_not_change = memory.do_not_change;
    if (!Array.isArray(found.verification_commands) || found.verification_commands.length === 0) found.verification_commands = memory.verification_commands;
    found.lifecycle = buildTaskLifecycleState(found);
    const assessmentsState = readTaskAssessmentsState();
    const assessment = (assessmentsState.assessments || []).find((item) => item.task_id === found.id || item.assessment_id === found.assessment_id) || null;
    if (assessment) found.assessment = assessment;
    if (found.coverage_report_path && fileExists(found.coverage_report_path)) found.coverage = readJsonFile(found.coverage_report_path);
    const schedulerReport = buildTaskSchedulerReport(readJsonFile, fileExists);
    const schedulerHistory = (schedulerReport.task_lineage || []).find((item) => item.task_id === found.id) || null;
    if (schedulerHistory) {
      found.scheduler_history = schedulerHistory;
      found.scheduler_restore_hint = schedulerHistory.restore_hint || null;
    }
    writeJsonFile(file, data);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create task");
    const title = flags.title;
    if (!title) throw new Error("Missing --title.");
    const next = data.tasks.length + 1;
    const workstreams = parseCsv(flags.workstreams || flags.workstream || "unassigned");
    const appRefs = parseCsv(flags.apps || flags.app || flags["app-username"]);
    const appLinks = resolveTaskApps(appRefs);
    const allowedFiles = parseCsv(flags["allowed-files"] || flags.allowed_files || flags.files || "");
    validateTaskBoundaryCreation(flags.type || "general", workstreams, appLinks);
    const memory = buildTaskMemory({
      id: flags.id || `task-${String(next).padStart(3, "0")}`,
      title,
      status: "proposed",
      type: flags.type || "general",
      workstream: workstreams[0] || "unassigned",
      workstreams,
      app_username: appLinks[0] ? appLinks[0].username : null,
      app_usernames: appLinks.map((appItem) => appItem.username),
      app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
      sprint_id: flags.sprint || null,
      source: flags.source || "manual",
      acceptance_criteria: flags.acceptance ? [flags.acceptance] : [],
      allowed_files: allowedFiles
    }, {
      purpose: flags.purpose || flags.objective || flags.goal || title,
      scope: flags.scope || null,
      allowed_files: allowedFiles,
      required_inputs: parseCsv(flags["required-inputs"] || flags.required_inputs),
      expected_outputs: parseCsv(flags["expected-outputs"] || flags.expected_outputs),
      do_not_change: parseCsv(flags["do-not-change"] || flags.do_not_change),
      verification_commands: parseCsv(flags["verification-commands"] || flags.verification_commands),
      resume_steps: parseCsv(flags["resume-steps"] || flags.resume_steps),
      handoff_note: flags.handoff || flags.note || flags.summary
    });
    const item = {
      id: memory.task_id,
      title,
      status: "proposed",
      type: flags.type || "general",
      workstream: workstreams[0] || "unassigned",
      workstreams,
      app_username: appLinks[0] ? appLinks[0].username : null,
      app_usernames: appLinks.map((appItem) => appItem.username),
      app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
      allowed_files: allowedFiles,
      sprint_id: flags.sprint || null,
      source: flags.source || "manual",
      acceptance_criteria: flags.acceptance ? [flags.acceptance] : [],
      execution_summary: memory.summary,
      memory,
      resume_steps: memory.resume_steps,
      required_inputs: memory.required_inputs,
      expected_outputs: memory.expected_outputs,
      do_not_change: memory.do_not_change,
      verification_commands: memory.verification_commands,
      created_at: new Date().toISOString()
    };
    data.tasks.push(item);
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("task.created", "task", item.id, `Task created: ${item.title}`);
    console.log(`Created task ${item.id}`);
    return;
  }

  if (action === "complete" || action === "close" || action === "finish" || action === "archive") {
    requireOwnerAuthority(flags);
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) throw new Error(`Task not found: ${taskId}`);
    if (!["owner_verified", "done", "closed"].includes(found.status) && !flags.force) {
      throw new Error("Task must be owner_verified before completion. Use --force to archive it manually.");
    }
    const finishedAt = new Date().toISOString();
    found.status = "done";
    found.completed_at = finishedAt;
    found.completed_by = getOwnerActor(flags);
    found.updated_at = finishedAt;
    writeJsonFile(file, data);
    const result = moveTaskToTrash(taskId, {
      reason: flags.reason || "completed",
      actor: getOwnerActor(flags)
    });
    const schedulerReport = buildTaskSchedulerReport(readJsonFile, fileExists);
    recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: `task-route-${String((schedulerReport.routes || []).length + 1).padStart(3, "0")}`,
      task_id: taskId,
      from: "tasks",
      to: "trash",
      result: "completed",
      created_at: finishedAt,
      created_by: getOwnerActor(flags),
      reason: flags.reason || "completed"
    });
    refreshDashboardArtifacts();
    appendAudit("task.completed", "task", taskId, `Task completed and moved to trash: ${found.title}`);
    console.log(JSON.stringify({
      ...result,
      completed_task: {
        id: taskId,
        status: "done",
        completed_at: finishedAt,
        completed_by: getOwnerActor(flags)
      }
    }, null, 2));
    return;
  }

  if (action === "memory") {
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) throw new Error(`Task not found: ${taskId}`);
    const memory = ensureTaskMemory(found, {
      id: found.id,
      title: found.title,
      status: found.status,
      workstreams: found.workstreams,
      app_usernames: found.app_usernames,
      app_paths: found.app_paths,
      allowed_files: found.allowed_files,
      acceptance_criteria: found.acceptance_criteria,
      required_inputs: found.required_inputs,
      expected_outputs: found.expected_outputs,
      do_not_change: found.do_not_change,
      verification_commands: found.verification_commands,
      resume_steps: found.resume_steps,
      source: found.source,
      scope: found.memory && found.memory.scope ? found.memory.scope : null
    });
    found.memory = memory;
    found.execution_summary = found.execution_summary || memory.summary;
    found.resume_steps = memory.resume_steps;
    found.required_inputs = memory.required_inputs;
    found.expected_outputs = memory.expected_outputs;
    found.do_not_change = memory.do_not_change;
    found.verification_commands = memory.verification_commands;
    found.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    if (flags.json) console.log(JSON.stringify(memory, null, 2));
    else console.log(renderTaskMemory(memory));
    return;
  }

  if (action === "trash") {
    const subaction = String(id || rest[0] || "list").trim().toLowerCase();
    const taskId = rest[0] || rest[1] || flags.id || null;
    if (subaction === "show") {
      if (!taskId) throw new Error("Missing task id.");
      console.log(JSON.stringify(showTaskTrash(taskId), null, 2));
      return;
    }
    if (subaction === "restore") {
      if (!taskId) throw new Error("Missing task id.");
      const restored = restoreTaskFromTrash(taskId, { reason: flags.reason || "restored" });
      const schedulerReport = buildTaskSchedulerReport(readJsonFile, fileExists);
      recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
        route_id: `task-route-${String((schedulerReport.routes || []).length + 1).padStart(3, "0")}`,
        task_id: taskId,
        from: "trash",
        to: "tasks",
        result: "completed",
        created_at: restored.generated_at || new Date().toISOString(),
        created_by: getOwnerActor(flags),
        reason: flags.reason || "restored"
      });
      refreshDashboardArtifacts();
      appendAudit("task.restored", "task", taskId, `Task restored from trash: ${restored.task.title}`);
      console.log(JSON.stringify(restored, null, 2));
      return;
    }
    if (subaction === "purge" || subaction === "sweep") {
      const report = purgeExpiredTaskTrash();
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    if (subaction === "list" || !subaction) {
      console.log(JSON.stringify(listTaskTrash(), null, 2));
      return;
    }
    if (subaction === "help") {
      console.log([
        "Task trash commands:",
        "  kvdf task trash list",
        "  kvdf task trash show <task-id>",
        "  kvdf task trash restore <task-id>",
        "  kvdf task trash purge",
        "  kvdf task trash sweep"
      ].join("\n"));
      return;
    }
    throw new Error(`Unknown trash subaction: ${subaction}`);
  }

  if (["approve", "assign", "start", "review", "verify", "reject", "reopen"].includes(action)) {
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) throw new Error(`Task not found: ${taskId}`);

    if (action === "approve") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "approve task");
      found.status = "approved";
    } else if (action === "assign") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "assign task");
      if (!flags.assignee) throw new Error("Missing --assignee.");
      assertAssigneeCanTakeTask(flags.assignee, found);
      found.status = "assigned";
      found.assignee_id = flags.assignee;
    } else if (action === "start") {
      requireTaskExecutor(flags, found);
      assertTaskCanStart(found);
      assertDocsFirstGateAllowsTaskStart(found);
      found.status = "in_progress";
    } else if (action === "review") {
      if (flags.actor && found.assignee_id && flags.actor === found.assignee_id) {
        throw new Error("Reviewer independence violation: assignee cannot review their own task.");
      }
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "review task");
      found.status = "review";
      found.reviewer_id = flags.reviewer || flags.actor || null;
    } else if (action === "verify") {
      requireOwnerAuthority(flags);
      requireAcceptanceForVerify(found);
      found.status = "owner_verified";
      found.verified_by = getOwnerActor(flags);
      found.verified_at = new Date().toISOString();
      revokeTaskTokens(taskId, "owner verify");
      releaseTaskLocks(taskId, "owner verify");
      generateVerificationReport(found);
    } else if (action === "reject") {
      requireAnyRole(flags, ["Owner"], "reject task");
      if (!flags.reason) throw new Error("Missing --reason.");
      found.status = "rejected";
      found.rejection_reason = flags.reason;
      found.rejected_at = new Date().toISOString();
      revokeTaskTokens(taskId, "owner reject");
    } else if (action === "reopen") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "reopen task");
      found.status = "ready";
      found.reopened_at = new Date().toISOString();
    }

    found.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit(`task.${action}`, "task", found.id, `Task ${action}: ${found.title}`);
    console.log(`Task ${found.id} is now ${found.status}`);
    return;
  }

  throw new Error(`Unknown task action: ${action}`);
}

function renderTaskTrackerSummary(tracker) {
  const summary = tracker.summary || {};
  const actionItems = tracker.action_items || [];
  const lifecycle = tracker.lifecycle || {};
  return [
    "Task Tracker Live State",
    "",
    `Generated at: ${tracker.generated_at || "unknown"}`,
    `Tasks: ${summary.total || 0}`,
    `Open: ${summary.open || 0}`,
    `Blocked: ${summary.blocked || 0}`,
    `Verified: ${summary.verified || 0}`,
    `Active tokens: ${summary.active_tokens || 0}`,
    `Active locks: ${summary.active_locks || 0}`,
    lifecycle.summary ? `Lifecycle stages: ${Object.entries(lifecycle.summary.by_stage || {}).map(([stage, count]) => `${stage}=${count}`).join(", ")}` : null,
    "",
    "Action items:",
    actionItems.length ? table(["Severity", "Task", "Message", "Next Action"], actionItems.map((item) => [
      item.severity || "info",
      item.task_id || "",
      item.message || "",
      item.next_action || ""
    ])) : "No action items."
  ].filter(Boolean).join("\n");
}

function renderTaskMemory(memory) {
  return [
    `Task Memory: ${memory.task_id}`,
    `Title: ${memory.title}`,
    `Status: ${memory.status}`,
    `Purpose: ${memory.purpose || "n/a"}`,
    `Summary: ${memory.summary || "n/a"}`,
    `Scope: ${memory.scope || "n/a"}`,
    "",
    "Acceptance criteria:",
    ...(memory.acceptance_criteria && memory.acceptance_criteria.length ? memory.acceptance_criteria.map((item) => `- ${item}`) : ["- n/a"]),
    "",
    "Source of truth:",
    `- Source: ${memory.source_of_truth && memory.source_of_truth.source ? memory.source_of_truth.source : "n/a"}`,
    `- Workstreams: ${(memory.source_of_truth && memory.source_of_truth.workstreams && memory.source_of_truth.workstreams.length) ? memory.source_of_truth.workstreams.join(", ") : "n/a"}`,
    `- Apps: ${(memory.source_of_truth && memory.source_of_truth.app_usernames && memory.source_of_truth.app_usernames.length) ? memory.source_of_truth.app_usernames.join(", ") : "n/a"}`,
    `- Allowed files: ${(memory.source_of_truth && memory.source_of_truth.allowed_files && memory.source_of_truth.allowed_files.length) ? memory.source_of_truth.allowed_files.join(", ") : "n/a"}`,
    "",
    "Required inputs:",
    ...(memory.required_inputs && memory.required_inputs.length ? memory.required_inputs.map((item) => `- ${item}`) : ["- n/a"]),
    "",
    "Expected outputs:",
    ...(memory.expected_outputs && memory.expected_outputs.length ? memory.expected_outputs.map((item) => `- ${item}`) : ["- n/a"]),
    "",
    "Do not change:",
    ...(memory.do_not_change && memory.do_not_change.length ? memory.do_not_change.map((item) => `- ${item}`) : ["- n/a"]),
    "",
    "Resume steps:",
    ...(memory.resume_steps && memory.resume_steps.length ? memory.resume_steps.map((step) => `- ${step}`) : ["- n/a"]),
    "",
    "Verification commands:",
    ...(memory.verification_commands && memory.verification_commands.length ? memory.verification_commands.map((command) => `- ${command}`) : ["- n/a"])
  ].join("\n");
}

function assertDocsFirstGateAllowsTaskStart(taskItem) {
  if (isDocsFirstTask(taskItem)) return;
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const openDocsFirst = tasks.filter((item) => isDocsFirstTask(item) && !["owner_verified", "done", "closed"].includes(item.status));
  if (openDocsFirst.length === 0) return;
  throw new Error(`Docs-first gate blocks implementation. Complete or verify ${openDocsFirst.length} documentation task(s) before starting ${taskItem.id}.`);
}

function isDocsFirstTask(taskItem) {
  return Boolean(
    taskItem &&
    (taskItem.docs_first_gate || taskItem.phase === "docs_first" || taskItem.type === "documentation" || taskItem.workstream === "docs") &&
    String(taskItem.source || "").startsWith("init_intake:")
  );
}

function validateTaskWorkstreamCreation(type, workstreams) {
  const active = (workstreams || []).filter((item) => item && item !== "unassigned");
  const normalizedType = String(type || "general").toLowerCase();
  validateKnownWorkstreams(active);
  if (active.length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
    throw new Error("Task touches multiple workstreams. Use --type integration for approved integration tasks.");
  }
}

function validateTaskBoundaryCreation(type, workstreams, apps) {
  validateTaskWorkstreamCreation(type, workstreams);
  const normalizedType = String(type || "general").toLowerCase();
  const appRecords = normalizeTaskAppRecords(apps);
  const productNames = getTaskAppProductNames(appRecords, fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {});
  if (appRecords.length > 1 && productNames.length === 0) {
    throw new Error("Task touches multiple apps but no product boundary is declared. Use --product on the app registry before creating cross-app tasks.");
  }
  if (productNames.length > 1) {
    throw new Error(`Task touches multiple products. Separate products need separate KVDF workspaces: ${productNames.join(", ")}`);
  }
  if (appRecords.length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
    throw new Error("Task touches multiple apps. Use --type integration for approved cross-app tasks.");
  }
}

function resolveTaskApps(appRefs) {
  if (!appRefs || appRefs.length === 0) return [];
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  return appRefs.map((ref) => {
    const normalized = normalizePublicUsername(ref);
    const appItem = apps.find((item) => item.username === normalized || item.app_id === ref);
    if (!appItem) throw new Error(`Customer app not found: ${ref}`);
    return appItem;
  });
}

function assertAssigneeCanTakeTask(assigneeId, task) {
  const identity = getIdentity(assigneeId);
  if (!identity) {
    if (hasConfiguredIdentities()) throw new Error(`Unknown assignee: ${assigneeId}`);
    return;
  }
  if (["Owner", "Maintainer"].includes(identity.role)) return;
  const allowed = (identity.workstreams || []).map((item) => String(item).toLowerCase());
  if (allowed.length === 0) return;
  const taskStreams = taskWorkstreams(task).filter((item) => item !== "unassigned");
  const denied = taskStreams.filter((stream) => !allowed.includes(stream));
  if (denied.length > 0) {
    throw new Error(`Workstream assignment denied: ${assigneeId} cannot take ${denied.join(", ")} task workstream.`);
  }
}

function taskWorkstreams(task) {
  const values = Array.isArray(task.workstreams) && task.workstreams.length ? task.workstreams : [task.workstream || "unassigned"];
  return values.map((item) => normalizeWorkstreamId(item)).filter(Boolean);
}

function workstream(action, value, flags = {}) {
  ensureWorkspace();
  const file = ".kabeeri/workstreams.json";
  if (!fileExists(file)) writeJsonFile(file, { workstreams: defaultWorkstreams() });
  const data = readJsonFile(file);
  data.workstreams = data.workstreams && data.workstreams.length ? data.workstreams : defaultWorkstreams();

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Paths", "Required Review"], data.workstreams.map((item) => [
      item.id,
      item.name || "",
      (item.path_rules || []).join(","),
      (item.required_review || []).join(",")
    ])));
    return;
  }

  if (action === "show" || action === "status") {
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing workstream id.");
    const item = data.workstreams.find((entry) => normalizeWorkstreamId(entry.id) === id);
    if (!item) throw new Error(`Workstream not found: ${id}`);
    const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskWorkstreams(taskItem).includes(id));
    const sessions = readStateArray(".kabeeri/sessions.json", "sessions").filter((sessionItem) => getTaskWorkstreamsById(sessionItem.task_id).includes(id));
    console.log(JSON.stringify({
      ...item,
      tasks_total: tasks.length,
      open_tasks: tasks.filter((taskItem) => !["owner_verified", "rejected", "done"].includes(taskItem.status)).length,
      sessions_total: sessions.length,
      active_sessions: sessions.filter((sessionItem) => sessionItem.status === "active").length
    }, null, 2));
    return;
  }

  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create workstream");
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing --id.");
    if (data.workstreams.some((item) => normalizeWorkstreamId(item.id) === id)) {
      throw new Error(`Workstream already exists: ${id}`);
    }
    const item = {
      id,
      name: flags.name || id,
      description: flags.description || "",
      path_rules: parsePathRules(flags.paths || flags.path || flags["path-rules"]),
      required_review: parseCsv(flags.review || flags["required-review"]),
      status: flags.status || "active",
      created_at: new Date().toISOString()
    };
    data.workstreams.push(item);
    writeJsonFile(file, data);
    appendAudit("workstream.created", "workstream", id, `Workstream created: ${item.name}`);
    console.log(`Created workstream ${id}`);
    return;
  }

  if (action === "update") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "update workstream");
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing workstream id.");
    const item = data.workstreams.find((entry) => normalizeWorkstreamId(entry.id) === id);
    if (!item) throw new Error(`Workstream not found: ${id}`);
    if (flags.name) item.name = flags.name;
    if (flags.description) item.description = flags.description;
    if (flags.paths || flags.path || flags["path-rules"]) item.path_rules = parsePathRules(flags.paths || flags.path || flags["path-rules"]);
    if (flags.review || flags["required-review"]) item.required_review = parseCsv(flags.review || flags["required-review"]);
    if (flags.status) item.status = flags.status;
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("workstream.updated", "workstream", id, `Workstream updated: ${item.name || id}`);
    console.log(`Updated workstream ${id}`);
    return;
  }

  if (action === "validate") {
    const issues = collectWorkstreamRuntimeIssues();
    if (issues.length === 0) {
      console.log("Workstream governance valid.");
      return;
    }
    for (const issue of issues) console.log(`FAIL ${issue}`);
    process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown workstream action: ${action}`);
}

function normalizeWorkstreamId(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function parsePathRules(value) {
  return parseCsv(value).map((item) => normalizePathRule(item)).filter(Boolean);
}

function normalizePathRule(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function getWorkstreamRegistry() {
  if (!fileExists(".kabeeri/workstreams.json")) return defaultWorkstreams();
  const data = readJsonFile(".kabeeri/workstreams.json");
  return (data.workstreams && data.workstreams.length ? data.workstreams : defaultWorkstreams()).filter((item) => item.status !== "inactive");
}

function validateKnownWorkstreams(workstreams) {
  const registry = getWorkstreamRegistry();
  if (registry.length === 0) return;
  const known = new Set(registry.map((item) => normalizeWorkstreamId(item.id)));
  const unknown = (workstreams || []).map((item) => normalizeWorkstreamId(item)).filter((item) => item && item !== "unassigned" && !known.has(item));
  if (unknown.length > 0) throw new Error(`Unknown workstream: ${unknown.join(", ")}`);
}

function getWorkstreamPathRules(id) {
  const item = getWorkstreamRegistry().find((entry) => normalizeWorkstreamId(entry.id) === normalizeWorkstreamId(id));
  return item ? (item.path_rules || []).map((rule) => normalizePathRule(rule)).filter(Boolean) : [];
}

function getTaskWorkstreamsById(taskId) {
  const taskItem = getTaskById(taskId);
  return taskItem ? taskWorkstreams(taskItem).filter((item) => item !== "unassigned") : [];
}

function collectWorkstreamRuntimeIssues() {
  const issues = [];
  const registry = getWorkstreamRegistry();
  const known = new Set(registry.map((item) => normalizeWorkstreamId(item.id)));
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = readStateArray(".kabeeri/sessions.json", "sessions");
  for (const item of registry) {
    if (!item.id) issues.push("workstream missing id");
    if (!item.name) issues.push(`workstream missing name: ${item.id || "unknown"}`);
    if (!Array.isArray(item.path_rules) || item.path_rules.length === 0) issues.push(`workstream missing path rules: ${item.id || "unknown"}`);
  }
  for (const taskItem of tasks) {
    for (const stream of taskWorkstreams(taskItem).filter((entry) => entry !== "unassigned")) {
      if (!known.has(stream)) issues.push(`task references unknown workstream: ${taskItem.id || "unknown"} -> ${stream}`);
    }
  }
  for (const sessionItem of sessions.filter((entry) => entry.status === "completed")) {
    const taskStreams = getTaskWorkstreamsById(sessionItem.task_id);
    if (taskStreams.length === 0) continue;
    const files = sessionItem.files_touched || [];
    for (const file of files) {
      if (!fileAllowedByWorkstreams(file, taskStreams)) {
        issues.push(`session file outside workstream boundary: ${sessionItem.session_id} -> ${file}`);
      }
    }
  }
  return issues;
}

function getTaskById(taskId) {
  if (!fileExists(".kabeeri/tasks.json")) return null;
  const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
  return tasks.find((taskItem) => taskItem.id === taskId) || null;
}

function customerApp(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/customer_apps.json";
  if (!fileExists(file)) writeJsonFile(file, { apps: [] });
  const data = readJsonFile(file);
  data.apps = data.apps || [];

  if (!action || action === "list") {
    console.log(table(["Username", "Name", "Type", "Path", "Status", "Public URL"], data.apps.map((item) => [
      item.username,
      item.name,
      item.app_type || item.type || "",
      item.path || "",
      item.status,
      publicCustomerAppUrl(item.username)
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create customer app");
    if (flags["separate-product"] === true || flags["separate-product"] === "true") {
      throw new Error("Separate products must use a separate KVDF workspace. Do not add unrelated apps to this folder.");
    }
    const username = normalizePublicUsername(flags.username || value);
    const name = flags.name || username;
    if (data.apps.some((item) => item.username === username)) {
      throw new Error(`Customer app username already exists: ${username}`);
    }
    const project = readJsonFile(".kabeeri/project.json");
    const productName = resolveWorkspaceProductName(project, data.apps, flags);
    if (!project.product_name) {
      project.product_name = productName;
      project.forbid_unrelated_apps = project.forbid_unrelated_apps !== false;
      writeJsonFile(".kabeeri/project.json", project);
    }
    enforceSameProductBoundary(data.apps, productName, project);
    const workstreams = parseCsv(flags.workstreams || flags.workstream);
    validateKnownWorkstreams(workstreams);
    const item = {
      app_id: flags["app-id"] || `app-${String(data.apps.length + 1).padStart(3, "0")}`,
      username,
      name,
      app_type: normalizeAppType(flags.type || flags["app-type"] || "application"),
      path: normalizeAppPath(flags.path || `apps/${username}`),
      product_name: productName,
      boundary: "same_product",
      status: normalizeCustomerAppStatus(flags.status || "draft"),
      audience: flags.audience || "",
      workstreams,
      feature_ids: parseCsv(flags.features),
      journey_ids: parseCsv(flags.journeys),
      public_url: publicCustomerAppUrl(username),
      created_at: new Date().toISOString()
    };
    data.apps.push(item);
    writeJsonFile(file, data);
    appendAudit("customer_app.created", "customer_app", username, `Customer app created: ${name}`);
    console.log(`Created customer app ${username}`);
    console.log(`Public URL: ${item.public_url}`);
    return;
  }

  if (action === "status") {
    const username = normalizePublicUsername(flags.username || value);
    const item = data.apps.find((appItem) => appItem.username === username);
    if (!item) throw new Error(`Customer app not found: ${username}`);
    if (flags.status) item.status = normalizeCustomerAppStatus(flags.status);
    if (flags.name) item.name = flags.name;
    if (flags.type || flags["app-type"]) item.app_type = normalizeAppType(flags.type || flags["app-type"]);
    if (flags.path) item.path = normalizeAppPath(flags.path);
    if (flags.product || flags["product-name"]) {
      const project = readJsonFile(".kabeeri/project.json");
      const productName = normalizeProductName(flags.product || flags["product-name"]);
      enforceSameProductBoundary(data.apps.filter((appItem) => appItem.username !== username), productName, project);
      item.product_name = productName;
      if (!project.product_name) {
        project.product_name = productName;
        project.forbid_unrelated_apps = project.forbid_unrelated_apps !== false;
        writeJsonFile(".kabeeri/project.json", project);
      }
    }
    if (flags.workstreams || flags.workstream) {
      const workstreams = parseCsv(flags.workstreams || flags.workstream);
      validateKnownWorkstreams(workstreams);
      item.workstreams = workstreams;
    }
    if (flags.audience) item.audience = flags.audience;
    if (flags.features) item.feature_ids = parseCsv(flags.features);
    if (flags.journeys) item.journey_ids = parseCsv(flags.journeys);
    item.public_url = publicCustomerAppUrl(item.username);
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("customer_app.status", "customer_app", username, `Customer app status updated: ${item.status}`);
    console.log(`Customer app ${username} is ${item.status}`);
    return;
  }

  if (action === "show") {
    const username = normalizePublicUsername(flags.username || value);
    const item = data.apps.find((appItem) => appItem.username === username);
    if (!item) throw new Error(`Customer app not found: ${username}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown app action: ${action}`);
}

function normalizePublicUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!username) throw new Error("Missing --username.");
  if (/^\d+$/.test(username)) {
    throw new Error("Invalid username. Public customer app routes cannot be numeric IDs.");
  }
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(username)) {
    throw new Error("Invalid username. Use 2-63 lowercase letters, numbers, or hyphens, starting with a letter or number.");
  }
  const reserved = new Set(["__kvdf", "dashboard", "admin", "api", "public", "static", "assets", "customer"]);
  if (reserved.has(username)) throw new Error(`Reserved username: ${username}`);
  return username;
}

function normalizeCustomerAppStatus(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["draft", "needs_review", "ready_to_demo", "ready_to_publish", "published", "archived"]);
  if (!allowed.has(normalized)) throw new Error("Invalid app status. Use draft, needs_review, ready_to_demo, ready_to_publish, published, or archived.");
  return normalized;
}

function normalizeAppType(value) {
  const normalized = String(value || "application").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["application", "backend", "frontend", "admin_frontend", "mobile", "api", "service", "worker"]);
  if (!allowed.has(normalized)) throw new Error("Invalid app type. Use application, backend, frontend, admin_frontend, mobile, api, service, or worker.");
  return normalized;
}

function normalizeAppPath(value) {
  const normalized = String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "");
  if (!normalized) throw new Error("Missing app path.");
  if (normalized.startsWith("../") || normalized === ".." || normalized.includes("/../")) {
    throw new Error("Invalid app path. App paths must stay inside the KVDF workspace.");
  }
  if (normalized === ".kabeeri" || normalized.startsWith(".kabeeri/")) {
    throw new Error("Invalid app path. .kabeeri is reserved for KVDF state.");
  }
  return normalized;
}

function normalizeProductName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getWorkspaceProductName(project = {}) {
  return normalizeProductName(project.product_name || project.name || "");
}

function enforceSameProductBoundary(existingApps, productName, project) {
  if (project.forbid_unrelated_apps === false) return;
  const normalizedProductName = normalizeProductName(productName);
  const existingProducts = [...new Set((existingApps || []).map((item) => normalizeProductName(item && item.product_name)).filter(Boolean))];
  if (existingProducts.length > 1) {
    throw new Error(`App boundary denied: multiple product names already exist in this workspace: ${existingProducts.join(", ")}. Separate products need separate KVDF workspaces.`);
  }
  const canonical = getWorkspaceProductName(project) || existingProducts[0] || "";
  if (!normalizedProductName) {
    if (!canonical) {
      throw new Error("Missing product name. Use --product <name> to declare the workspace product before creating apps.");
    }
    throw new Error(`Missing product name. Use --product ${JSON.stringify(canonical)} to keep apps inside the workspace product boundary.`);
  }
  if (!canonical) return;
  if (normalizedProductName !== canonical) {
    throw new Error("App boundary denied: this appears to be a separate product. Create a separate KVDF workspace.");
  }
}

function resolveWorkspaceProductName(project, existingApps, flags = {}) {
  const explicit = normalizeProductName(flags.product || flags["product-name"] || "");
  if (explicit) {
    enforceSameProductBoundary(existingApps, explicit, project);
    return explicit;
  }
  const existingProducts = [...new Set((existingApps || []).map((item) => normalizeProductName(item && item.product_name)).filter(Boolean))];
  if (existingProducts.length === 1) {
    enforceSameProductBoundary(existingApps, existingProducts[0], project);
    return existingProducts[0];
  }
  const canonical = getWorkspaceProductName(project);
  if (canonical) {
    enforceSameProductBoundary(existingApps, canonical, project);
    return canonical;
  }
  const fallback = normalizeProductName(flags.name || flags.username || "");
  if (fallback) {
    enforceSameProductBoundary(existingApps, fallback, project);
    return fallback;
  }
  throw new Error("Missing product name. Use --product <name> or a named app to declare the workspace product before creating the first app.");
}

function getTaskAppProductNames(apps, project = {}) {
  const productNames = [...new Set((apps || []).map((item) => normalizeProductName(item && (item.product_name || item.product || ""))).filter(Boolean))];
  if (productNames.length > 0) return productNames;
  const workspaceProduct = getWorkspaceProductName(project);
  return workspaceProduct ? [workspaceProduct] : [];
}

function normalizeTaskAppRecords(apps) {
  if (!Array.isArray(apps) || apps.length === 0) return [];
  if (typeof apps[0] === "string") return resolveTaskApps(apps);
  return apps.filter(Boolean);
}

function publicCustomerAppUrl(username) {
  return `/customer/apps/${username}`;
}

function feature(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/features.json";
  if (!fileExists(file)) writeJsonFile(file, { features: [] });
  const data = readJsonFile(file);
  data.features = data.features || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Title", "Readiness", "Tasks"], data.features.map((item) => [
      item.id,
      item.title,
      item.readiness,
      (item.task_ids || []).join(",")
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create feature");
    const title = flags.title || value;
    if (!title) throw new Error("Missing --title.");
    const id = flags.id || `feature-${String(data.features.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      title,
      readiness: normalizeFeatureReadiness(flags.readiness || "future"),
      audience: flags.audience || "",
      journey: flags.journey || "",
      task_ids: parseCsv(flags.tasks),
      created_at: new Date().toISOString()
    };
    data.features.push(item);
    writeJsonFile(file, data);
    appendAudit("feature.created", "feature", id, `Feature created: ${title}`);
    console.log(`Created feature ${id}`);
    return;
  }

  if (action === "status") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing feature id.");
    const item = data.features.find((featureItem) => featureItem.id === id);
    if (!item) throw new Error(`Feature not found: ${id}`);
    if (flags.readiness) item.readiness = normalizeFeatureReadiness(flags.readiness);
    if (flags.tasks) item.task_ids = parseCsv(flags.tasks);
    if (flags.audience) item.audience = flags.audience;
    if (flags.journey) item.journey = flags.journey;
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("feature.status", "feature", id, `Feature status updated: ${item.readiness}`);
    console.log(`Feature ${id} is ${item.readiness}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing feature id.");
    const item = data.features.find((featureItem) => featureItem.id === id);
    if (!item) throw new Error(`Feature not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown feature action: ${action}`);
}

function normalizeFeatureReadiness(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["ready_to_demo", "ready_to_publish", "needs_review", "future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid feature readiness. Use ready_to_demo, ready_to_publish, needs_review, or future.");
  return normalized;
}

function journey(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/journeys.json";
  if (!fileExists(file)) writeJsonFile(file, { journeys: [] });
  const data = readJsonFile(file);
  data.journeys = data.journeys || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Status", "Steps"], data.journeys.map((item) => [
      item.id,
      item.name,
      item.status,
      (item.steps || []).length
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create journey");
    const name = flags.name || value;
    if (!name) throw new Error("Missing --name.");
    const id = flags.id || `journey-${String(data.journeys.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      name,
      audience: flags.audience || "",
      status: normalizeJourneyStatus(flags.status || "draft"),
      steps: parseCsv(flags.steps),
      ready_to_show: flags["ready-to-show"] === true,
      created_at: new Date().toISOString()
    };
    data.journeys.push(item);
    writeJsonFile(file, data);
    appendAudit("journey.created", "journey", id, `Journey created: ${name}`);
    console.log(`Created journey ${id}`);
    return;
  }

  if (action === "status") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing journey id.");
    const item = data.journeys.find((journeyItem) => journeyItem.id === id);
    if (!item) throw new Error(`Journey not found: ${id}`);
    if (flags.status) item.status = normalizeJourneyStatus(flags.status);
    if (flags.steps) item.steps = parseCsv(flags.steps);
    if (flags["ready-to-show"] !== undefined) item.ready_to_show = flags["ready-to-show"] !== "false";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("journey.status", "journey", id, `Journey status updated: ${item.status}`);
    console.log(`Journey ${id} is ${item.status}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing journey id.");
    const item = data.journeys.find((journeyItem) => journeyItem.id === id);
    if (!item) throw new Error(`Journey not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown journey action: ${action}`);
}

function normalizeJourneyStatus(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["draft", "needs_review", "ready_to_show", "future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid journey status. Use draft, needs_review, ready_to_show, or future.");
  return normalized;
}

function design(action, value, flags) {
  ensureWorkspace();
  ensureDesignState();
  const file = ".kabeeri/design_sources/sources.json";
  const data = readJsonFile(file);
  data.sources = data.sources || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Type", "Status", "Use", "Location"], data.sources.map((item) => [
      item.id,
      item.source_type,
      item.approval_status,
      item.intended_use || "",
      item.source_location || ""
    ])));
    return;
  }

  if (action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "add design source");
    const id = flags.id || value || `design-source-${String(data.sources.length + 1).padStart(3, "0")}`;
    if (data.sources.some((item) => item.id === id)) throw new Error(`Design source already exists: ${id}`);
    const sourceType = normalizeDesignSourceType(flags.type || flags.sourceType || flags["source-type"]);
    if (!sourceType) throw new Error("Missing --type.");
    if (!flags.location) throw new Error("Missing --location.");
    const item = {
      id,
      source_type: sourceType,
      source_location: flags.location,
      owner_client: flags.owner || flags.client || "",
      intended_use: flags.use || flags["intended-use"] || "",
      approval_status: "submitted",
      snapshot_reference: null,
      extraction_mode: normalizeExtractionMode(flags.mode || flags["extraction-mode"] || "manual"),
      missing_information: parseCsv(flags.missing || flags["missing-information"]),
      notes: flags.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.sources.push(item);
    writeJsonFile(file, data);
    appendAudit("design_source.added", "design_source", id, `Design source added: ${sourceType}`);
    console.log(`Added design source ${id}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    console.log(JSON.stringify(getDesignSource(data, id), null, 2));
    return;
  }

  if (action === "snapshot") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "snapshot design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    item.snapshot_reference = {
      reference: flags.reference || flags.ref || item.source_location,
      captured_by: flags.by || flags["captured-by"] || getEffectiveActor(flags) || "local-cli",
      captured_at: new Date().toISOString(),
      checksum: flags.checksum || "",
      notes: flags.notes || ""
    };
    item.approval_status = "snapshot_taken";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.snapshot_taken", "design_source", id, `Design source snapshot taken: ${id}`);
    console.log(`Snapshot recorded for ${id}`);
    return;
  }

  if (action === "spec-list") {
    const specsData = readJsonFile(".kabeeri/design_sources/text_specs.json");
    specsData.specs = specsData.specs || [];
    console.log(table(["ID", "Source", "Status", "Scope", "Output"], specsData.specs.map((item) => [
      item.id,
      item.source_id,
      item.status,
      item.scope || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "spec-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create design text spec");
    const sourceId = flags.source || flags["source-id"] || value;
    if (!sourceId) throw new Error("Missing --source.");
    const source = getDesignSource(data, sourceId);
    if (!source.snapshot_reference) throw new Error(`Design source ${sourceId} needs a snapshot before text spec creation.`);
    const specsFile = ".kabeeri/design_sources/text_specs.json";
    const specsData = readJsonFile(specsFile);
    specsData.specs = specsData.specs || [];
    const id = flags.id || `text-spec-${String(specsData.specs.length + 1).padStart(3, "0")}`;
    if (specsData.specs.some((item) => item.id === id)) throw new Error(`Text spec already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const spec = {
      id,
      source_id: sourceId,
      snapshot_reference: source.snapshot_reference.reference || "",
      source_type: source.source_type,
      extraction_mode: normalizeExtractionMode(flags.mode || source.extraction_mode || "manual"),
      title: flags.title || source.intended_use || id,
      scope: flags.scope || source.intended_use || "",
      status: "draft",
      output_path: outputPath,
      open_questions: parseCsv(flags.questions || flags["open-questions"]),
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    specsData.specs.push(spec);
    writeJsonFile(specsFile, specsData);
    writeTextFile(outputPath, buildDesignTextSpecMarkdown(source, spec));
    appendAudit("design_text_spec.created", "design_text_spec", id, `Design text spec created for ${sourceId}`);
    console.log(`Created design text spec ${id}`);
    return;
  }

  if (action === "spec-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve design text spec");
    const specId = flags.id || value;
    if (!specId) throw new Error("Missing text spec id.");
    const specsFile = ".kabeeri/design_sources/text_specs.json";
    const specsData = readJsonFile(specsFile);
    const spec = getDesignTextSpec(specsData, specId);
    spec.status = "approved";
    spec.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    spec.approved_at = new Date().toISOString();
    spec.updated_at = new Date().toISOString();
    const source = getDesignSource(data, spec.source_id);
    source.approved_text_spec = spec.output_path;
    source.approval_status = "approved";
    source.design_tokens = flags.tokens || source.design_tokens || "";
    source.approved_by = spec.approved_by;
    source.approved_at = spec.approved_at;
    source.updated_at = new Date().toISOString();
    writeJsonFile(specsFile, specsData);
    writeJsonFile(file, data);
    appendAudit("design_text_spec.approved", "design_text_spec", specId, `Design text spec approved: ${spec.output_path}`);
    console.log(`Approved design text spec ${specId}`);
    return;
  }

  if (action === "missing-report") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create missing design report");
    const sourceId = flags.source || flags["source-id"] || value;
    if (!sourceId) throw new Error("Missing --source.");
    const source = getDesignSource(data, sourceId);
    const reportsFile = ".kabeeri/design_sources/missing_reports.json";
    const reportsData = readJsonFile(reportsFile);
    reportsData.reports = reportsData.reports || [];
    const id = flags.id || `missing-design-${String(reportsData.reports.length + 1).padStart(3, "0")}`;
    const report = {
      id,
      source_id: sourceId,
      affected_scope: flags.scope || source.intended_use || "",
      missing_items: parseCsv(flags.items || flags.missing || source.missing_information.join(",")),
      risk: flags.risk || "medium",
      required_decision: flags.decision || flags["required-decision"] || "",
      status: "open",
      created_at: new Date().toISOString()
    };
    reportsData.reports.push(report);
    writeJsonFile(reportsFile, reportsData);
    appendAudit("design_missing_report.created", "design_missing_report", id, `Missing design report created for ${sourceId}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "recommend" || action === "advisor" || action === "context") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design recommend ecommerce` or select a product blueprint first.");
    const recommendation = buildUiDesignRecommendation(blueprintKey, flags);
    const advisorFile = ".kabeeri/design_sources/ui_advisor.json";
    const advisorData = readJsonFile(advisorFile);
    advisorData.recommendations = advisorData.recommendations || [];
    advisorData.reviews = advisorData.reviews || [];
    advisorData.recommendations.push(recommendation);
    advisorData.current_recommendation = recommendation.recommendation_id;
    writeJsonFile(advisorFile, advisorData);
    appendAudit("design_ui_advisor.recommended", "ui_design", recommendation.recommendation_id, `UI design recommendation for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderUiDesignRecommendation(recommendation);
    return;
  }

  if (action === "ui-review" || action === "review-ui") {
    const target = value || flags.target || flags.file || "ui_design";
    const review = buildUiDesignReview(target, flags);
    const advisorFile = ".kabeeri/design_sources/ui_advisor.json";
    const advisorData = readJsonFile(advisorFile);
    advisorData.recommendations = advisorData.recommendations || [];
    advisorData.reviews = advisorData.reviews || [];
    advisorData.reviews.push(review);
    writeJsonFile(advisorFile, advisorData);
    appendAudit("design_ui_advisor.reviewed", "ui_design", review.review_id, `UI design review: ${review.status}`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "ui-checklist") {
    const catalog = getUiDesignCatalog();
    if (flags.json) console.log(JSON.stringify({ checklist: catalog.approval_checklist }, null, 2));
    else console.log(table(["#", "Check"], catalog.approval_checklist.map((item, index) => [index + 1, item])));
    return;
  }

  if (action === "ui-history") {
    const advisorData = readJsonFile(".kabeeri/design_sources/ui_advisor.json");
    console.log(table(["Recommendation", "Blueprint", "Pattern", "Components"], (advisorData.recommendations || []).map((item) => [
      item.recommendation_id,
      item.blueprint_key,
      item.experience_pattern,
      String((item.components || []).length)
    ])));
    return;
  }

  if (action === "theme-presets" || action === "token-presets" || action === "palette-presets") {
    const catalog = getThemeTokenPresetCatalog();
    if (flags.json) console.log(JSON.stringify(catalog, null, 2));
    else console.log(table(["Preset", "Personality", "Best for"], (catalog.presets || []).map((item) => [
      item.preset,
      item.personality,
      (item.best_for || []).join(", ")
    ])));
    return;
  }

  if (action === "theme-recommend" || action === "tokens-recommend" || action === "token-recommend") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design theme-recommend ecommerce`.");
    const recommendation = buildThemeTokenRecommendation(blueprintKey, flags);
    if (flags.output) {
      assertDesignTokenOutputPath(flags.output);
      writeJsonFile(flags.output, recommendation.token_set);
    }
    appendAudit("design_theme_tokens.recommended", "theme_tokens", recommendation.token_set.token_set_id, `Theme tokens recommended for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else {
      console.log(`Theme token recommendation: ${recommendation.token_set.token_set_id}`);
      console.log(table(["Field", "Value"], [
        ["Blueprint", `${recommendation.blueprint_name} (${recommendation.blueprint_key})`],
        ["Preset", recommendation.palette_preset],
        ["Density", recommendation.token_set.creative_profile.density],
        ["Output", flags.output || ""],
        ["Token reference", recommendation.reference]
      ]));
    }
    return;
  }

  if (action === "composition-list" || action === "compositions" || action === "component-compositions") {
    const catalog = getComponentCompositionCatalog();
    if (flags.json) console.log(JSON.stringify(catalog, null, 2));
    else console.log(table(["Composition", "Name", "Best for"], (catalog.compositions || []).map((item) => [
      item.composition_id,
      item.name,
      (item.best_for || []).join(", ")
    ])));
    return;
  }

  if (action === "composition-recommend" || action === "component-recommend" || action === "screen-compose") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design composition-recommend erp --page \"invoice table\"`.");
    const recommendation = buildComponentCompositionRecommendation(blueprintKey, flags);
    appendAudit("design_component_composition.recommended", "component_composition", recommendation.composition.composition_id, `Component composition recommended for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else {
      console.log(`Component composition recommendation: ${recommendation.composition.composition_id}`);
      console.log(table(["Field", "Value"], [
        ["Blueprint", `${recommendation.blueprint_name} (${recommendation.blueprint_key})`],
        ["Pattern", recommendation.experience_pattern],
        ["Composition", recommendation.composition.name],
        ["Score", recommendation.score],
        ["Prompt hint", recommendation.prompt_hint]
      ]));
    }
    return;
  }

  if (action === "framework-adapters" || action === "adapter-list" || action === "frameworks") {
    const catalog = getFrameworkAdapterCatalog();
    if (flags.json) console.log(JSON.stringify(catalog, null, 2));
    else console.log(table(["Adapter", "Framework", "Version", "Best for"], (catalog.adapters || []).map((item) => [
      item.adapter_key,
      item.framework,
      item.version,
      (item.best_for || []).slice(0, 3).join(", ")
    ])));
    return;
  }

  if (action === "framework-plan" || action === "adapter-plan" || action === "framework-adapter") {
    const blueprintKey = flags.blueprint || getCurrentBlueprintKey() || "erp";
    const recommendation = buildFrameworkAdapterRecommendation(blueprintKey, {
      ...flags,
      framework: value || flags.framework || flags.adapter || flags.library
    });
    appendAudit("design_framework_adapter.recommended", "framework_adapter", recommendation.adapter.adapter_key, `Framework adapter recommended for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else {
      console.log(`Framework adapter recommendation: ${recommendation.adapter.adapter_key}`);
      console.log(table(["Field", "Value"], [
        ["Blueprint", `${recommendation.blueprint_name} (${recommendation.blueprint_key})`],
        ["Framework", `${recommendation.adapter.framework} ${recommendation.adapter.version}`],
        ["Install", recommendation.adapter.install],
        ["Composition", recommendation.composition_id],
        ["Token set", recommendation.token_set_id],
        ["Prompt hint", recommendation.prompt_hint]
      ]));
    }
    return;
  }

  if (action === "variant-archetypes" || action === "creative-archetypes" || action === "variant-list") {
    const catalog = getCreativeVariantCatalog();
    if (flags.json) console.log(JSON.stringify(catalog, null, 2));
    else console.log(table(["Variant", "Name", "Best for"], (catalog.archetypes || []).map((item) => [
      item.variant_id,
      item.name,
      (item.best_for || []).slice(0, 4).join(", ")
    ])));
    return;
  }

  if (action === "variants" || action === "variant-recommend" || action === "creative-variants") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design variants ecommerce --page checkout`.");
    const recommendation = buildCreativeVariantRecommendation(blueprintKey, flags);
    appendAudit("design_creative_variants.recommended", "creative_variants", recommendation.recommendation_id, `Creative variants recommended for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else {
      console.log(`Creative variant recommendation: ${recommendation.recommendation_id}`);
      console.log(table(["Variant", "Density", "Hierarchy", "Prompt"], recommendation.variants.map((item) => [
        item.variant_id,
        item.density,
        item.page_hierarchy,
        item.prompt_hint
      ])));
    }
    return;
  }

  if (action === "ui-questions" || action === "decision-questions" || action === "design-questions") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey() || "ecommerce";
    const questions = buildUiDecisionQuestions(blueprintKey, flags);
    if (flags.json) console.log(JSON.stringify(questions, null, 2));
    else {
      console.log(`UI decision questions: ${questions.blueprint_name} (${questions.blueprint_key})`);
      console.log(table(["Priority", "Question ID", "Question"], questions.questions.map((item) => [
        item.priority,
        item.question_id,
        item.text
      ])));
    }
    return;
  }

  if (action === "ui-decisions" || action === "decision-profile" || action === "design-decisions") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design ui-decisions ecommerce --page checkout`.");
    const profile = buildUiDecisionProfile(blueprintKey, flags);
    appendAudit("design_ui_decision_profile.created", "ui_decision_profile", profile.profile_id, `UI decision profile created for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(profile, null, 2));
    else {
      console.log(`UI decision profile: ${profile.profile_id}`);
      console.log(table(["Field", "Value"], [
        ["Blueprint", `${profile.blueprint_name} (${profile.blueprint_key})`],
        ["Variant", profile.selected_variant.variant_id],
        ["Palette", profile.palette_preset],
        ["Density", profile.density],
        ["Adapter", profile.adapter_key],
        ["Composition", profile.composition_id],
        ["Missing answers", String(profile.missing_answers.length)]
      ]));
    }
    return;
  }

  if (action === "playbooks" || action === "ui-playbooks" || action === "project-playbooks") {
    const catalog = getProjectUiPlaybookCatalog();
    if (flags.json) console.log(JSON.stringify(catalog, null, 2));
    else console.log(table(["Blueprint", "Variant", "Composition", "Density"], (catalog.playbooks || []).map((item) => [
      item.blueprint_key,
      item.variant_archetype,
      item.composition_id,
      item.density
    ])));
    return;
  }

  if (action === "playbook" || action === "ui-playbook" || action === "project-playbook") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design playbook erp`.");
    const playbook = buildProjectUiPlaybookRecommendation(blueprintKey, flags);
    appendAudit("design_project_ui_playbook.recommended", "project_ui_playbook", playbook.blueprint_key, `Project UI playbook recommended for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(playbook, null, 2));
    else {
      console.log(`Project UI playbook: ${playbook.blueprint_name} (${playbook.blueprint_key})`);
      console.log(table(["Field", "Value"], [
        ["Variant", playbook.variant_archetype],
        ["Composition", playbook.composition_id],
        ["Adapter", playbook.adapter_key],
        ["Density", playbook.density],
        ["Missing answers", String(playbook.missing_answers.length)]
      ]));
    }
    return;
  }

  if (action === "reference-list" || action === "references" || action === "ref-list") {
    const catalog = getUiUxReferenceCatalog();
    const patterns = catalog.patterns || [];
    if (flags.json) console.log(JSON.stringify({ patterns }, null, 2));
    else console.log(table(["Code", "Name", "Category", "Style", "Best for"], patterns.map((item) => [
      item.code,
      item.name,
      item.category,
      item.style,
      (item.best_for || []).slice(0, 3).join(", ")
    ])));
    return;
  }

  if (action === "reference-show" || action === "ref-show") {
    const code = value || flags.code || flags.id;
    const item = getUiUxReferencePattern(code);
    if (flags.json) console.log(JSON.stringify(item, null, 2));
    else renderUiUxReferencePattern(item);
    return;
  }

  if (action === "reference-recommend" || action === "ref-recommend") {
    const brief = [value, flags.brief, flags.goal, flags.description].filter(Boolean).join(" ");
    if (!brief.trim()) throw new Error("Missing brief. Example: kvdf design reference-recommend \"admin ecommerce dashboard\"");
    const recommendation = recommendUiUxReferences(brief);
    const stateFile = ".kabeeri/design_sources/ui_ux_reference.json";
    const state = readJsonFile(stateFile);
    state.selections = state.selections || [];
    state.selections.push(recommendation);
    state.current_selection = recommendation.selection_id;
    writeJsonFile(stateFile, state);
    appendAudit("design_ui_ux_reference.recommended", "ui_ux_reference", recommendation.selection_id, `UI/UX reference recommendation for: ${brief}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else {
      console.log(`UI/UX reference recommendation: ${recommendation.selection_id}`);
      console.log(table(["Code", "Score", "Why"], recommendation.matches.map((match) => [
        match.code,
        match.score,
        match.reasons.join(", ")
      ])));
    }
    return;
  }

  if (action === "reference-questions" || action === "ref-questions") {
    const code = value || flags.code || flags.id;
    const item = getUiUxReferencePattern(code);
    const questionSet = buildUiUxReferenceQuestions(item, flags);
    const stateFile = ".kabeeri/design_sources/ui_ux_reference.json";
    const state = readJsonFile(stateFile);
    state.generated_questions = state.generated_questions || [];
    state.generated_questions.push(questionSet);
    writeJsonFile(stateFile, state);
    appendAudit("design_ui_ux_reference.questions", "ui_ux_reference", questionSet.question_set_id, `UI/UX questions generated from ${item.code}`);
    if (flags.json) console.log(JSON.stringify(questionSet, null, 2));
    else console.log(table(["#", "Question"], questionSet.questions.map((question, index) => [index + 1, question])));
    return;
  }

  if (action === "reference-tasks" || action === "ref-tasks") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "generate UI/UX reference tasks");
    const code = value || flags.code || flags.id;
    const item = getUiUxReferencePattern(code);
    const created = createTasksFromUiUxReference(item, flags);
    const stateFile = ".kabeeri/design_sources/ui_ux_reference.json";
    const state = readJsonFile(stateFile);
    state.generated_tasks = state.generated_tasks || [];
    state.generated_tasks.push({
      generation_id: `uiux-task-generation-${Date.now()}`,
      pattern_code: item.code,
      task_ids: created.map((taskItem) => taskItem.id),
      created_at: new Date().toISOString()
    });
    writeJsonFile(stateFile, state);
    console.log(`Generated ${created.length} UI/UX reference tasks from ${item.code}.`);
    return;
  }

  if (action === "page-list") {
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    pagesData.pages = pagesData.pages || [];
    console.log(table(["ID", "Text Spec", "Status", "Name", "Output"], pagesData.pages.map((item) => [
      item.id,
      item.text_spec_id,
      item.status,
      item.page_name || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "page-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create page spec");
    const specId = flags.spec || flags["text-spec"] || value;
    if (!specId) throw new Error("Missing --spec.");
    const specsData = readJsonFile(".kabeeri/design_sources/text_specs.json");
    const spec = getDesignTextSpec(specsData, specId);
    if (spec.status !== "approved") throw new Error(`Text spec ${specId} must be approved before page specs are created.`);
    const pagesFile = ".kabeeri/design_sources/page_specs.json";
    const pagesData = readJsonFile(pagesFile);
    pagesData.pages = pagesData.pages || [];
    const id = flags.id || `page-spec-${String(pagesData.pages.length + 1).padStart(3, "0")}`;
    if (pagesData.pages.some((item) => item.id === id)) throw new Error(`Page spec already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const page = {
      id,
      text_spec_id: specId,
      source_id: spec.source_id,
      page_name: flags.name || flags.title || spec.title || id,
      purpose: flags.purpose || "",
      audience: flags.audience || "",
      required_states: parseCsv(flags.states || "loading,empty,error,success,disabled"),
      status: "draft",
      output_path: outputPath,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    pagesData.pages.push(page);
    writeJsonFile(pagesFile, pagesData);
    writeTextFile(outputPath, buildPageSpecMarkdown(spec, page));
    appendAudit("design_page_spec.created", "design_page_spec", id, `Page spec created from ${specId}`);
    console.log(`Created page spec ${id}`);
    return;
  }

  if (action === "page-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve page spec");
    const pageId = flags.id || value;
    if (!pageId) throw new Error("Missing page spec id.");
    const pagesFile = ".kabeeri/design_sources/page_specs.json";
    const pagesData = readJsonFile(pagesFile);
    const page = getDesignPageSpec(pagesData, pageId);
    page.status = "approved";
    page.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    page.approved_at = new Date().toISOString();
    page.updated_at = new Date().toISOString();
    writeJsonFile(pagesFile, pagesData);
    appendAudit("design_page_spec.approved", "design_page_spec", pageId, `Page spec approved: ${page.output_path}`);
    console.log(`Approved page spec ${pageId}`);
    return;
  }

  if (action === "component-list") {
    const componentsData = readJsonFile(".kabeeri/design_sources/component_contracts.json");
    componentsData.components = componentsData.components || [];
    console.log(table(["ID", "Page", "Status", "Name", "Output"], componentsData.components.map((item) => [
      item.id,
      item.page_spec_id,
      item.status,
      item.component_name || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "component-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create component contract");
    const pageId = flags.page || flags["page-spec"] || value;
    if (!pageId) throw new Error("Missing --page.");
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    const page = getDesignPageSpec(pagesData, pageId);
    if (page.status !== "approved") throw new Error(`Page spec ${pageId} must be approved before component contracts are created.`);
    const componentsFile = ".kabeeri/design_sources/component_contracts.json";
    const componentsData = readJsonFile(componentsFile);
    componentsData.components = componentsData.components || [];
    const id = flags.id || `component-contract-${String(componentsData.components.length + 1).padStart(3, "0")}`;
    if (componentsData.components.some((item) => item.id === id)) throw new Error(`Component contract already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const component = {
      id,
      page_spec_id: pageId,
      text_spec_id: page.text_spec_id,
      source_id: page.source_id,
      component_name: flags.name || flags.title || id,
      variants: parseCsv(flags.variants || "default"),
      states: parseCsv(flags.states || "default,hover,focus,disabled,loading,error"),
      status: "draft",
      output_path: outputPath,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    componentsData.components.push(component);
    writeJsonFile(componentsFile, componentsData);
    writeTextFile(outputPath, buildComponentContractMarkdown(page, component));
    appendAudit("design_component_contract.created", "design_component_contract", id, `Component contract created from ${pageId}`);
    console.log(`Created component contract ${id}`);
    return;
  }

  if (action === "component-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve component contract");
    const componentId = flags.id || value;
    if (!componentId) throw new Error("Missing component contract id.");
    const componentsFile = ".kabeeri/design_sources/component_contracts.json";
    const componentsData = readJsonFile(componentsFile);
    const component = getDesignComponentContract(componentsData, componentId);
    component.status = "approved";
    component.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    component.approved_at = new Date().toISOString();
    component.updated_at = new Date().toISOString();
    writeJsonFile(componentsFile, componentsData);
    appendAudit("design_component_contract.approved", "design_component_contract", componentId, `Component contract approved: ${component.output_path}`);
    console.log(`Approved component contract ${componentId}`);
    return;
  }

  if (action === "visual-review-list" || action === "visual-list") {
    const reviewsData = readJsonFile(".kabeeri/design_sources/visual_reviews.json");
    reviewsData.reviews = reviewsData.reviews || [];
    console.log(table(["Review", "Task", "Page", "Decision", "Quality", "Screenshots", "Reviewer"], reviewsData.reviews.map((item) => [
      item.review_id,
      item.task_id || "",
      item.page_spec_id || "",
      item.decision,
      item.quality_score ? `${item.quality_score.score}/${item.quality_score.max_score}` : "",
      (item.screenshots || []).length,
      item.reviewer || ""
    ])));
    return;
  }

  if (action === "visual-rubric" || action === "qa-rubric") {
    const rubric = getVisualQualityRubric();
    if (flags.json) console.log(JSON.stringify(rubric, null, 2));
    else console.log(table(["Category", "Max", "Evidence"], rubric.categories.map((item) => [
      item.id,
      item.max_score,
      item.evidence.join(", ")
    ])));
    return;
  }

  if (action === "visual-review" || action === "visual") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Frontend Developer", "Admin Frontend Developer"], "record visual review");
    const pageId = flags.page || flags["page-spec"] || value;
    if (!pageId) throw new Error("Missing --page.");
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    const page = getDesignPageSpec(pagesData, pageId);
    if (page.status !== "approved") throw new Error(`Page spec ${pageId} must be approved before visual review.`);
    const taskId = flags.task || "";
    if (taskId && !getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
    const reviewsFile = ".kabeeri/design_sources/visual_reviews.json";
    const reviewsData = readJsonFile(reviewsFile);
    reviewsData.reviews = reviewsData.reviews || [];
    const review = {
      review_id: flags.id || `visual-review-${String(reviewsData.reviews.length + 1).padStart(3, "0")}`,
      task_id: taskId || null,
      page_spec_id: pageId,
      source_id: page.source_id,
      screenshots: parseCsv(flags.screenshots || flags.screenshot),
      viewport_checks: parseCsv(flags.viewports || "mobile,desktop"),
      checks: parseCsv(flags.checks || "responsive,states,accessibility,visual-match"),
      deviations: parseCsv(flags.deviations),
      decision: flags.decision || "pass",
      reviewer: flags.reviewer || getEffectiveActor(flags) || "local-cli",
      notes: flags.notes || "",
      reviewed_at: new Date().toISOString()
    };
    if (!["pass", "needs_rework", "blocked"].includes(review.decision)) throw new Error("Invalid --decision. Use pass, needs_rework, or blocked.");
    if (!review.screenshots.length) throw new Error("Missing --screenshots.");
    review.quality_score = buildVisualQualityScore(review, page, flags);
    reviewsData.reviews.push(review);
    writeJsonFile(reviewsFile, reviewsData);
    appendAudit("design_visual_review.recorded", "visual_review", review.review_id, `Visual review ${review.decision} for ${pageId}`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "gate" || action === "visual-gate") {
    const result = buildDesignGate(flags.task || value, flags);
    appendAudit("design_gate.evaluated", "design_gate", result.task_id || result.page_spec_id || "design", `Design gate: ${result.status}`);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`Design gate ${result.status}: ${(result.blockers || []).join("; ") || "ready"}`);
    if (result.status === "blocked" && (flags.strict === true || flags.strict === "true")) throw new Error(`Design gate blocked: ${result.blockers.join("; ")}`);
    return;
  }

  if (action === "governance" || action === "governance-report" || action === "qa") {
    const report = buildDesignGovernanceReport(flags);
    const reportsFile = ".kabeeri/design_sources/governance_reports.json";
    const reportsData = readJsonFile(reportsFile);
    reportsData.reports = reportsData.reports || [];
    reportsData.reports.push(report);
    writeJsonFile(reportsFile, reportsData);
    const output = flags.output || ".kabeeri/reports/design_governance_report.md";
    writeTextFile(output, buildDesignGovernanceMarkdown(report));
    appendAudit("design_governance.reported", "design_governance", report.report_id, `Design governance report: ${report.status}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Design governance report ${report.report_id}: ${report.status} (${report.score}/${report.max_score})`);
    return;
  }

  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    const approvedTextSpec = flags.spec || flags["text-spec"] || flags["approved-text-spec"];
    if (!approvedTextSpec) throw new Error("Missing --spec. Approved text spec is required before frontend implementation.");
    item.approval_status = "approved";
    item.approved_text_spec = approvedTextSpec;
    item.design_tokens = flags.tokens || "";
    item.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    item.approved_at = new Date().toISOString();
    item.notes = flags.notes || item.notes || "";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.approved", "design_source", id, `Design source approved with text spec: ${approvedTextSpec}`);
    console.log(`Approved design source ${id}`);
    return;
  }

  if (action === "reject") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "reject design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    item.approval_status = "rejected";
    item.rejection_reason = flags.reason || "";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.rejected", "design_source", id, `Design source rejected: ${id}`);
    console.log(`Rejected design source ${id}`);
    return;
  }

  if (action === "audit") {
    const id = flags.id || value;
    const selected = id ? [getDesignSource(data, id)] : data.sources;
    const report = buildDesignAudit(selected);
    const reportsFile = ".kabeeri/design_sources/audit_reports.json";
    const reportsData = readJsonFile(reportsFile);
    reportsData.reports = reportsData.reports || [];
    reportsData.reports.push(report);
    writeJsonFile(reportsFile, reportsData);
    appendAudit("design_source.audit", "design_source", id || "all", `Design source audit: ${report.status}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  throw new Error(`Unknown design action: ${action}`);
}

function ensureDesignState() {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(repoRoot(), ".kabeeri", "design_sources");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/design_sources/sources.json")) writeJsonFile(".kabeeri/design_sources/sources.json", { sources: [] });
  if (!fileExists(".kabeeri/design_sources/text_specs.json")) writeJsonFile(".kabeeri/design_sources/text_specs.json", { specs: [] });
  if (!fileExists(".kabeeri/design_sources/page_specs.json")) writeJsonFile(".kabeeri/design_sources/page_specs.json", { pages: [] });
  if (!fileExists(".kabeeri/design_sources/component_contracts.json")) writeJsonFile(".kabeeri/design_sources/component_contracts.json", { components: [] });
  if (!fileExists(".kabeeri/design_sources/missing_reports.json")) writeJsonFile(".kabeeri/design_sources/missing_reports.json", { reports: [] });
  if (!fileExists(".kabeeri/design_sources/visual_reviews.json")) writeJsonFile(".kabeeri/design_sources/visual_reviews.json", { reviews: [] });
  if (!fileExists(".kabeeri/design_sources/audit_reports.json")) writeJsonFile(".kabeeri/design_sources/audit_reports.json", { reports: [] });
  if (!fileExists(".kabeeri/design_sources/governance_reports.json")) writeJsonFile(".kabeeri/design_sources/governance_reports.json", { reports: [] });
  if (!fileExists(".kabeeri/design_sources/ui_advisor.json")) writeJsonFile(".kabeeri/design_sources/ui_advisor.json", { recommendations: [], reviews: [], current_recommendation: null });
  if (!fileExists(".kabeeri/design_sources/ui_ux_reference.json")) writeJsonFile(".kabeeri/design_sources/ui_ux_reference.json", { selections: [], generated_questions: [], generated_tasks: [], current_selection: null });
}

function getUiDesignCatalog() {
  return readJsonFile("standard_systems/UI_UX_DESIGN_BLUEPRINT.json");
}

function getUiUxReferenceCatalog() {
  return readJsonFile("knowledge/design_system/ui_ux_reference/UI_UX_REFERENCE_INDEX.json");
}

function getThemeTokenPresetCatalog() {
  return readJsonFile("knowledge/design_system/theme_token_intelligence/PALETTE_PRESET_CATALOG.json");
}

function getComponentCompositionCatalog() {
  return readJsonFile("knowledge/design_system/component_composition_intelligence/SCREEN_COMPOSITION_CATALOG.json");
}

function getFrameworkAdapterCatalog() {
  return readJsonFile("knowledge/design_system/framework_adapter_intelligence/UI_FRAMEWORK_ADAPTER_CATALOG.json");
}

function getCreativeVariantCatalog() {
  return readJsonFile("knowledge/design_system/creative_variant_intelligence/CREATIVE_VARIANT_CATALOG.json");
}

function getUiDecisionQuestionCatalog() {
  return readJsonFile("knowledge/design_system/ui_decision_intake/UI_DECISION_QUESTIONS.json");
}

function getProjectUiPlaybookCatalog() {
  return readJsonFile("knowledge/design_system/project_ui_playbooks/PROJECT_UI_PLAYBOOKS.json");
}

function findProjectUiPlaybook(blueprintKey) {
  const normalized = String(blueprintKey || "").trim().toLowerCase();
  const catalog = getProjectUiPlaybookCatalog();
  return (catalog.playbooks || []).find((item) => String(item.blueprint_key).toLowerCase() === normalized) || null;
}

function buildProjectUiPlaybookRecommendation(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const playbook = findProjectUiPlaybook(product.key);
  if (!playbook) throw new Error(`Project UI playbook not found: ${product.key}`);
  const uiDecisionProfile = buildUiDecisionProfile(product.key, {
    ...flags,
    page: flags.page || flags.screen || flags.intent,
    density: flags.density || playbook.density,
    navigation: flags.navigation || flags.nav || playbook.navigation_pattern,
    framework: flags.framework || flags.adapter || playbook.adapter_preference[0]
  });
  const answerMap = getQuestionnaireAnswerMap();
  const missingAnswers = (playbook.critical_questions || [])
    .filter((questionId) => !answerMap[questionId] && !hasUiDecisionFlagForQuestion(questionId, flags))
    .map((questionId) => {
      const question = (getUiDecisionQuestionCatalog().questions || []).find((item) => item.question_id === questionId);
      return {
        question_id: questionId,
        text: question ? question.text : `Answer ${questionId}`,
        answer_command: `kvdf questionnaire answer ${questionId} --value "<answer>" --areas ui_ux_design,design_governance`
      };
    });
  return {
    recommendation_id: `project-ui-playbook-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    category: product.category,
    variant_archetype: uiDecisionProfile.selected_variant.archetype_id || playbook.variant_archetype,
    selected_variant_id: uiDecisionProfile.selected_variant.variant_id,
    composition_id: flags.composition || playbook.composition_id,
    adapter_key: uiDecisionProfile.adapter_key,
    adapter_preference: playbook.adapter_preference,
    palette_preset: uiDecisionProfile.palette_preset,
    density: uiDecisionProfile.density,
    navigation_pattern: uiDecisionProfile.navigation_pattern,
    surface_style: uiDecisionProfile.surface_style,
    microcopy_tone: uiDecisionProfile.microcopy_tone,
    primary_focus: playbook.primary_focus || [],
    critical_questions: playbook.critical_questions || [],
    missing_answers: uniqueBy([...missingAnswers, ...(uiDecisionProfile.missing_answers || [])], "question_id"),
    avoid: playbook.avoid || [],
    references: {
      readme: "knowledge/design_system/project_ui_playbooks/README.md",
      catalog: "knowledge/design_system/project_ui_playbooks/PROJECT_UI_PLAYBOOKS.json",
      review: "knowledge/design_system/project_ui_playbooks/PLAYBOOK_REVIEW_CHECKLIST.md",
      ui_decision_intake: "knowledge/design_system/ui_decision_intake/README.md",
      creative_variant_catalog: "knowledge/design_system/creative_variant_intelligence/CREATIVE_VARIANT_CATALOG.json"
    },
    prompt_hint: `Use project UI playbook for ${product.key}: variant ${uiDecisionProfile.selected_variant.variant_id}, adapter ${uiDecisionProfile.adapter_key}, composition ${flags.composition || playbook.composition_id}, density ${uiDecisionProfile.density}.`
  };
}

function buildUiDecisionQuestions(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const questionCatalog = getUiDecisionQuestionCatalog();
  const patternKey = (getUiDesignCatalog().blueprint_experience_map || {})[product.key] || inferUiPatternFromBlueprint(product);
  const questions = (questionCatalog.questions || []).map((question) => ({
    ...question,
    answer_command: `kvdf questionnaire answer ${question.question_id} --value "<answer>" --areas ui_ux_design,design_governance`
  }));
  return {
    question_set_id: `ui-decision-questions-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    page_intent: flags.page || flags.screen || flags.intent || null,
    questions,
    references: {
      readme: "knowledge/design_system/ui_decision_intake/README.md",
      question_catalog: "knowledge/design_system/ui_decision_intake/UI_DECISION_QUESTIONS.json",
      mapping_rules: "knowledge/design_system/ui_decision_intake/ANSWER_MAPPING_RULES.md",
      review: "knowledge/design_system/ui_decision_intake/UI_DECISION_REVIEW_CHECKLIST.md"
    }
  };
}

function getQuestionnaireAnswerMap() {
  if (!fileExists(".kabeeri/questionnaires/answers.json")) return {};
  const data = readJsonFile(".kabeeri/questionnaires/answers.json");
  return Object.fromEntries((data.answers || []).map((answer) => [answer.question_id, answer]));
}

function collectUiDecisionText(answerMap, flags = {}) {
  const ids = [
    "ui.brand_personality",
    "ui.primary_user",
    "ui.primary_workflow",
    "ui.data_density",
    "ui.trust_risk",
    "ui.language_direction",
    "ui.visual_reference",
    "ui.motion_preference",
    "ui.navigation_preference",
    "ui.content_tone",
    "adaptive.ui.experience_pattern",
    "adaptive.ui.design_source",
    "adaptive.framework.frontend"
  ];
  const values = ids.map((id) => answerMap[id] && answerMap[id].value).filter((value) => value !== undefined && value !== null);
  values.push(flags.brand, flags.tone, flags.audience, flags.user, flags.workflow, flags.density, flags.risk, flags.language, flags.nav, flags.navigation, flags.motion, flags.page, flags.intent, flags.screen);
  return values.filter(Boolean).map((value) => String(value)).join(" ").toLowerCase();
}

function inferUiDecisionSignals(text, product, patternKey) {
  const signals = [];
  const add = (signal, reason) => signals.push({ signal, reason });
  if (/premium|trust|secure|privacy|finance|fintech|bank|health|clinic|medical|compliance|government/.test(text)) add("trust_first", "Answers emphasize trust, risk, privacy, finance, healthcare, or compliance.");
  if (/friendly|guided|onboarding|saas|workspace|assistant|help|warm/.test(text)) add("guided_workspace", "Answers emphasize guidance, SaaS, onboarding, or warm assistance.");
  if (/operator|admin|operations|erp|crm|approve|approval|monitor|search|filter|table|report/.test(text) || patternKey === "data_heavy_web_app") add("operator_density", "Answers or blueprint emphasize operational data work.");
  if (/commerce|checkout|buy|cart|marketplace|booking|compare|price|conversion/.test(text) || patternKey === "commerce_storefront") add("conversion_flow", "Answers or blueprint emphasize purchase, booking, or conversion.");
  if (/editorial|news|blog|docs|documentation|reader|content|article/.test(text) || patternKey === "seo_content_site") add("editorial_authority", "Answers or blueprint emphasize content authority.");
  if (/mobile|driver|field|employee|offline|touch|bottom nav/.test(text) || patternKey === "mobile_app") add("mobile_action", "Answers or blueprint emphasize mobile or field workflows.");
  if (/arabic|rtl|bilingual|mena|عربي|العربية/.test(text)) add("rtl_arabic", "Answers indicate Arabic, bilingual, MENA, or RTL UI.");
  return signals;
}

function scoreVariantFromDecisionSignals(variant, signals, text) {
  let score = 0;
  const id = variant.variant_id;
  const signalKeys = signals.map((item) => item.signal);
  if (signalKeys.includes("trust_first") && id === "premium_trust_portal") score += 8;
  if (signalKeys.includes("guided_workspace") && id === "guided_saas_workspace") score += 8;
  if (signalKeys.includes("operator_density") && id === "operator_command_center") score += 8;
  if (signalKeys.includes("conversion_flow") && id === "commerce_conversion_flow") score += 8;
  if (signalKeys.includes("editorial_authority") && id === "editorial_authority") score += 8;
  if (signalKeys.includes("mobile_action") && id === "mobile_action_hub") score += 8;
  for (const best of variant.best_for || []) if (text.includes(String(best).toLowerCase())) score += 2;
  return score;
}

function buildUiDecisionProfile(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const catalog = getUiDesignCatalog();
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const answerMap = getQuestionnaireAnswerMap();
  const text = collectUiDecisionText(answerMap, flags);
  const signals = inferUiDecisionSignals(text, product, patternKey);
  const variants = buildCreativeVariantRecommendation(product.key, { ...flags, pattern: patternKey, count: 5 }).variants || [];
  const ranked = variants
    .map((variant) => ({ variant, score: variant.score + scoreVariantFromDecisionSignals({ ...variant, variant_id: variant.archetype_id }, signals, text) }))
    .sort((a, b) => b.score - a.score || a.variant.variant_id.localeCompare(b.variant.variant_id));
  const selectedVariant = ranked[0] ? ranked[0].variant : variants[0];
  const themeTokenRecommendation = buildThemeTokenRecommendation(product.key, { ...flags, pattern: patternKey, preset: selectedVariant.palette_preset });
  const componentCompositionRecommendation = buildComponentCompositionRecommendation(product.key, { ...flags, pattern: patternKey });
  const frameworkAdapterRecommendation = buildFrameworkAdapterRecommendation(product.key, { ...flags, pattern: patternKey });
  const questions = buildUiDecisionQuestions(product.key, flags).questions;
  const missingAnswers = questions
    .filter((question) => question.priority === "high" && !answerMap[question.question_id] && !hasUiDecisionFlagForQuestion(question.question_id, flags))
    .map((question) => ({
      question_id: question.question_id,
      text: question.text,
      answer_command: question.answer_command
    }));
  const rtlEnabled = signals.some((item) => item.signal === "rtl_arabic") || shouldUseRtlArabicReferences(product, flags);
  return {
    profile_id: `ui-decision-profile-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    answer_source: ".kabeeri/questionnaires/answers.json",
    signals,
    selected_variant: selectedVariant,
    palette_preset: themeTokenRecommendation.palette_preset,
    density: flags.density || selectedVariant.density,
    navigation_pattern: flags.navigation || flags.nav || selectedVariant.navigation_pattern,
    surface_style: selectedVariant.surface_style,
    microcopy_tone: flags.tone || selectedVariant.microcopy_tone,
    motion_bias: flags.motion || selectedVariant.motion_bias,
    rtl_arabic_enabled: rtlEnabled,
    adapter_key: frameworkAdapterRecommendation.adapter.adapter_key,
    composition_id: componentCompositionRecommendation.composition.composition_id,
    token_set_id: themeTokenRecommendation.token_set.token_set_id,
    missing_answers: missingAnswers,
    references: {
      readme: "knowledge/design_system/ui_decision_intake/README.md",
      mapping_rules: "knowledge/design_system/ui_decision_intake/ANSWER_MAPPING_RULES.md",
      review: "knowledge/design_system/ui_decision_intake/UI_DECISION_REVIEW_CHECKLIST.md",
      variant_catalog: "knowledge/design_system/creative_variant_intelligence/CREATIVE_VARIANT_CATALOG.json"
    },
    prompt_hint: `Use UI decision profile ${selectedVariant.variant_id}, adapter ${frameworkAdapterRecommendation.adapter.adapter_key}, token_set ${themeTokenRecommendation.token_set.token_set_id}, and composition_id ${componentCompositionRecommendation.composition.composition_id}. Ask missing high-priority UI questions before final visual implementation.`
  };
}

function hasUiDecisionFlagForQuestion(questionId, flags = {}) {
  const byQuestion = {
    "ui.brand_personality": ["brand", "tone"],
    "ui.primary_user": ["audience", "user"],
    "ui.primary_workflow": ["workflow", "page", "intent", "screen"],
    "ui.data_density": ["density"]
  };
  return (byQuestion[questionId] || []).some((key) => flags[key]);
}

function buildCreativeVariantRecommendation(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const catalog = getUiDesignCatalog();
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const pattern = catalog.experience_patterns[patternKey];
  if (!pattern) throw new Error(`UI experience pattern not found: ${patternKey}`);
  const pageIntent = [flags.page, flags.intent, flags.screen, flags.description, flags.feature].filter(Boolean).join(" ");
  const themeTokenRecommendation = buildThemeTokenRecommendation(product.key, { ...flags, pattern: patternKey });
  const componentCompositionRecommendation = buildComponentCompositionRecommendation(product.key, { ...flags, pattern: patternKey });
  const frameworkAdapterRecommendation = buildFrameworkAdapterRecommendation(product.key, { ...flags, pattern: patternKey });
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""} ${(product.channels || []).join(" ")} ${(product.frontend_pages || []).join(" ")} ${pageIntent}`.toLowerCase();
  const variants = getCreativeVariantCatalog().archetypes || [];
  const count = Math.max(1, Math.min(Number(flags.count || 3), 5));
  const ranked = variants
    .map((variant) => {
      let score = 0;
      if ((variant.experience_patterns || []).includes(patternKey)) score += 6;
      for (const best of variant.best_for || []) {
        const value = String(best).toLowerCase();
        if (text.includes(value)) score += 3;
      }
      for (const palette of variant.palette_bias || []) {
        if (palette === themeTokenRecommendation.palette_preset) score += 2;
      }
      if (pageIntent && String(variant.prompt_summary || "").toLowerCase().includes(pageIntent.toLowerCase())) score += 1;
      return { variant, score };
    })
    .sort((a, b) => b.score - a.score || a.variant.variant_id.localeCompare(b.variant.variant_id));
  const selected = ranked.slice(0, count).map((item, index) => buildCreativeVariantPlan({
    archetype: item.variant,
    index,
    score: item.score,
    product,
    patternKey,
    pageIntent,
    themeTokenRecommendation,
    componentCompositionRecommendation,
    frameworkAdapterRecommendation,
    flags
  }));
  return {
    recommendation_id: `creative-variants-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    page_intent: pageIntent || null,
    token_set_id: themeTokenRecommendation.token_set.token_set_id,
    palette_preset: themeTokenRecommendation.palette_preset,
    composition_id: componentCompositionRecommendation.composition.composition_id,
    adapter_key: frameworkAdapterRecommendation.adapter.adapter_key,
    variants: selected,
    references: {
      readme: "knowledge/design_system/creative_variant_intelligence/README.md",
      contract: "knowledge/design_system/creative_variant_intelligence/VARIANT_GENERATION_CONTRACT.md",
      catalog: "knowledge/design_system/creative_variant_intelligence/CREATIVE_VARIANT_CATALOG.json",
      review: "knowledge/design_system/creative_variant_intelligence/VARIANT_REVIEW_CHECKLIST.md",
      execution_rules: "knowledge/design_system/ui_execution_kit/CREATIVE_VARIATION_RULES.md"
    },
    prompt_hint: `Choose one variant_id, then implement with adapter ${frameworkAdapterRecommendation.adapter.adapter_key}, token_set ${themeTokenRecommendation.token_set.token_set_id}, and composition_id ${componentCompositionRecommendation.composition.composition_id}.`
  };
}

function buildCreativeVariantPlan({ archetype, index, score, product, patternKey, pageIntent, themeTokenRecommendation, componentCompositionRecommendation, frameworkAdapterRecommendation, flags }) {
  const axes = inferCreativeVariationAxes(product, patternKey);
  const selectedPalette = (archetype.palette_bias || []).includes(themeTokenRecommendation.palette_preset)
    ? themeTokenRecommendation.palette_preset
    : ((archetype.palette_bias || [])[0] || themeTokenRecommendation.palette_preset);
  const variantId = `${product.key}-${archetype.variant_id}-${index + 1}`;
  return {
    variant_id: variantId,
    archetype_id: archetype.variant_id,
    name: archetype.name,
    score,
    page_intent: pageIntent || null,
    adapter_key: frameworkAdapterRecommendation.adapter.adapter_key,
    token_set_id: themeTokenRecommendation.token_set.token_set_id,
    composition_id: componentCompositionRecommendation.composition.composition_id,
    palette_preset: selectedPalette,
    density: flags.density || archetype.density,
    navigation_pattern: flags.navigation || flags.nav || archetype.navigation_pattern,
    page_hierarchy: archetype.page_hierarchy,
    component_emphasis: archetype.component_emphasis || [],
    surface_style: archetype.surface_style,
    motion_bias: archetype.motion_bias,
    microcopy_tone: flags.tone || archetype.microcopy_tone,
    empty_state_tone: archetype.empty_state_tone,
    changed_axes: uniqueList([
      "palette_preset",
      "density",
      "navigation_pattern",
      "page_hierarchy",
      "component_emphasis",
      "surface_style",
      "microcopy_tone",
      ...axes.slice(0, 4)
    ]).slice(0, 10),
    fixed_rules: [
      "Keep the selected framework adapter.",
      "Keep semantic tokens and avoid raw component colors.",
      "Keep loading, empty, error, success, disabled, and validation states.",
      "Keep accessibility, performance, content, motion, and RTL rules."
    ],
    prompt_hint: `${archetype.prompt_summary} Use variant_id ${variantId}; adapter ${frameworkAdapterRecommendation.adapter.adapter_key}; token_set ${themeTokenRecommendation.token_set.token_set_id}; composition_id ${componentCompositionRecommendation.composition.composition_id}.`
  };
}

function normalizeFrameworkAdapterKey(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/_/g, "-");
  const aliases = {
    bootstrap5: "bootstrap",
    "bootstrap-5": "bootstrap",
    tailwind: "tailwindcss",
    "tailwind-css": "tailwindcss",
    "foundation": "foundation-sites",
    "foundation-sites": "foundation-sites",
    material: "mui",
    "material-ui": "mui",
    "materialui": "mui",
    "ant": "antd",
    "ant-design": "antd",
    shadcn: "shadcn-ui",
    "shadcn/ui": "shadcn-ui",
    daisy: "daisyui",
    "daisy-ui": "daisyui"
  };
  return aliases[normalized] || normalized;
}

function findFrameworkAdapter(adapterKey) {
  const key = normalizeFrameworkAdapterKey(adapterKey);
  const catalog = getFrameworkAdapterCatalog();
  return (catalog.adapters || []).find((item) => item.adapter_key === key) || null;
}

function selectFrameworkAdapterKey(product, pattern, flags = {}) {
  const explicit = flags.framework || flags.adapter || flags.library || flags.stack || flags.ui_library || flags["ui-library"];
  if (explicit) return normalizeFrameworkAdapterKey(explicit);
  const approved = pattern && pattern.approved_ui_libraries ? pattern.approved_ui_libraries : [];
  if ((product.channels || []).includes("admin_web") && approved.includes("antd")) return "antd";
  if ((product.channels || []).includes("public_web") && approved.includes("tailwindcss")) return "tailwindcss";
  return normalizeFrameworkAdapterKey(approved[0] || "bootstrap");
}

function buildFrameworkCompositionMap(adapter, composition) {
  const componentMap = adapter.component_map || {};
  const aliases = {
    page_header: "layout_shell",
    header: "layout_shell",
    search_box: "form",
    filter_bar: "form",
    filters: "form",
    data_table: "table",
    data_grid: "table",
    status_badge: "badge",
    row_actions: "button",
    bulk_actions: "button",
    pagination: "table",
    confirm_modal: "modal",
    toast: "alert",
    error_state: "alert",
    success_state: "alert",
    validation: "form",
    skeleton: "loading",
    chart_card: "card",
    metric_card: "card",
    order_summary: "card",
    product_card: "card",
    sidebar: "layout_shell",
    topbar: "layout_shell",
    app_shell: "layout_shell"
  };
  const sourceComponents = uniqueList([
    ...(composition.primary_components || []),
    ...(composition.supporting_components || []),
    ...(composition.required_states || [])
  ]);
  return sourceComponents.map((component) => {
    const normalized = String(component || "").toLowerCase().replace(/-/g, "_");
    const direct = componentMap[normalized] || componentMap[aliases[normalized]];
    const fallbackKey = Object.keys(componentMap).find((key) => normalized.includes(key) || key.includes(normalized));
    return {
      source_component: component,
      adapter_component: direct || componentMap[fallbackKey] || "Use approved project component contract mapped through this adapter."
    };
  });
}

function buildFrameworkCompatibilityWarnings(adapter, product, flags = {}) {
  const warnings = [...(adapter.warnings || [])];
  const stackText = `${flags.stack || ""} ${flags.framework || ""} ${flags.runtime || ""} ${product.channels || ""} ${product.frontend_stack || ""}`.toLowerCase();
  const requires = adapter.requires || [];
  if (requires.includes("react") && !/react|next/.test(stackText)) {
    warnings.push("Adapter requires a React-compatible frontend. Confirm stack before implementation.");
  }
  if (requires.includes("tailwindcss") && !/tailwind|next|react/.test(stackText)) {
    warnings.push("Adapter requires an approved Tailwind CSS setup. Document build adapter before implementation.");
  }
  if (/bootstrap|bulma|foundation/.test(stackText) && ["mui", "antd", "foundation-sites", "bulma"].includes(adapter.adapter_key)) {
    warnings.push("Do not mix full UI frameworks on one surface without a migration decision.");
  }
  return uniqueList(warnings);
}

function buildFrameworkAdapterRecommendation(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const catalog = getUiDesignCatalog();
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const pattern = catalog.experience_patterns[patternKey];
  if (!pattern) throw new Error(`UI experience pattern not found: ${patternKey}`);
  const adapterKey = selectFrameworkAdapterKey(product, pattern, flags);
  const adapter = findFrameworkAdapter(adapterKey);
  if (!adapter) throw new Error(`Framework adapter not found: ${adapterKey}. Use \`kvdf design framework-adapters\`.`);
  const themeTokenRecommendation = buildThemeTokenRecommendation(product.key, { ...flags, pattern: patternKey });
  const componentCompositionRecommendation = buildComponentCompositionRecommendation(product.key, { ...flags, pattern: patternKey });
  const requestedCompositionId = flags.composition || flags["composition-id"] || flags.screen_composition;
  const composition = requestedCompositionId
    ? (getComponentCompositionCatalog().compositions || []).find((item) => item.composition_id === requestedCompositionId) || componentCompositionRecommendation.composition || {}
    : componentCompositionRecommendation.composition || {};
  const approvedKeys = pattern.approved_ui_libraries || [];
  const approvalStatus = approvedKeys.includes(adapter.adapter_key) ? "approved_for_pattern" : "requires_design_decision";
  return {
    recommendation_id: `framework-adapter-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    approval_status: approvalStatus,
    adapter,
    token_set_id: themeTokenRecommendation.token_set.token_set_id,
    palette_preset: themeTokenRecommendation.palette_preset,
    composition_id: composition.composition_id,
    composition_name: composition.name,
    composition_mapping: buildFrameworkCompositionMap(adapter, composition),
    compatibility_warnings: buildFrameworkCompatibilityWarnings(adapter, product, flags),
    references: {
      readme: "knowledge/design_system/framework_adapter_intelligence/README.md",
      contract: "knowledge/design_system/framework_adapter_intelligence/FRAMEWORK_ADAPTER_CONTRACT.md",
      catalog: "knowledge/design_system/framework_adapter_intelligence/UI_FRAMEWORK_ADAPTER_CATALOG.json",
      compatibility: "knowledge/design_system/framework_adapter_intelligence/STACK_COMPATIBILITY_RULES.md",
      review: "knowledge/design_system/framework_adapter_intelligence/ADAPTER_REVIEW_CHECKLIST.md",
      token_mapping: "knowledge/design_system/theme_token_intelligence/FRAMEWORK_TOKEN_MAPPING.md",
      composition_rules: "knowledge/design_system/component_composition_intelligence/FRAMEWORK_COMPOSITION_RULES.md"
    },
    prompt_hint: `Use adapter ${adapter.adapter_key}, token_set ${themeTokenRecommendation.token_set.token_set_id}, and composition_id ${composition.composition_id}. Do not add another UI framework unless explicitly approved.`
  };
}

function buildComponentCompositionRecommendation(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const catalog = getUiDesignCatalog();
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const pageIntent = [flags.page, flags.intent, flags.screen, flags.description, flags.feature].filter(Boolean).join(" ");
  const pageText = pageIntent.toLowerCase();
  const productText = `${product.key || ""} ${product.name || ""} ${product.category || ""} ${(product.frontend_pages || []).join(" ")}`.toLowerCase();
  const compositions = getComponentCompositionCatalog().compositions || [];
  const ranked = compositions
    .map((composition) => {
      let score = 0;
      if ((composition.experience_patterns || []).includes(patternKey)) score += 4;
      for (const best of composition.best_for || []) {
        const value = String(best).toLowerCase();
        if (pageText && pageText.includes(value)) score += 4;
        else if (productText.includes(value)) score += 2;
      }
      for (const keyword of composition.keywords || []) {
        const value = String(keyword).toLowerCase();
        if (pageText && pageText.includes(value)) score += 5;
        else if (productText.includes(value)) score += 1;
      }
      return { composition, score };
    })
    .sort((a, b) => b.score - a.score || a.composition.composition_id.localeCompare(b.composition.composition_id));
  const winner = ranked[0] || { composition: compositions[0] || {}, score: 0 };
  return {
    recommendation_id: `component-composition-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    page_intent: pageIntent || null,
    score: winner.score,
    composition: winner.composition,
    alternatives: ranked.slice(1, 4).map((item) => ({
      composition_id: item.composition.composition_id,
      name: item.composition.name,
      score: item.score
    })),
    references: {
      readme: "knowledge/design_system/component_composition_intelligence/README.md",
      contract: "knowledge/design_system/component_composition_intelligence/COMPONENT_COMPOSITION_CONTRACT.md",
      catalog: "knowledge/design_system/component_composition_intelligence/SCREEN_COMPOSITION_CATALOG.json",
      framework_rules: "knowledge/design_system/component_composition_intelligence/FRAMEWORK_COMPOSITION_RULES.md"
    },
    prompt_hint: `Use composition_id ${winner.composition.composition_id} and adapt tokens, density, copy, and variants from product answers.`
  };
}

function buildThemeTokenRecommendation(blueprintKey, flags = {}) {
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const catalog = getUiDesignCatalog();
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const presetCatalog = getThemeTokenPresetCatalog();
  const presetName = flags.preset || inferColorPalettePresets(product, patternKey)[0] || "saas_calm";
  const preset = findThemeTokenPreset(presetName) || findThemeTokenPreset("saas_calm");
  const motionSystem = inferMotionSystem(product, patternKey);
  const tokenSet = buildDesignTokenSetFromPreset(product, patternKey, preset, motionSystem, flags);
  return {
    recommendation_id: `theme-token-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    palette_preset: preset.preset,
    reference: "knowledge/design_system/theme_token_intelligence/PALETTE_PRESET_CATALOG.json",
    available_presets: (presetCatalog.presets || []).map((item) => item.preset),
    token_set: tokenSet,
    framework_mapping: {
      reference: "knowledge/design_system/theme_token_intelligence/FRAMEWORK_TOKEN_MAPPING.md",
      bootstrap: "Map semantic colors to Bootstrap theme colors and component variables.",
      tailwind: "Map semantic colors to CSS variables and theme utilities.",
      mui: "Map semantic colors to palette, spacing to spacing, radius to shape.",
      ant_design: "Map tokens through ConfigProvider theme tokens.",
      shadcn_ui: "Map CSS variables to project semantic tokens."
    },
    prompt_hint: `Use token file ${flags.output || "<exported-token-file>"} and do not paste raw palette values into prompts.`
  };
}

function assertDesignTokenOutputPath(outputPath) {
  const normalized = String(outputPath || "").replace(/\\/g, "/");
  if (normalized === ".kabeeri" || normalized.startsWith(".kabeeri/")) {
    throw new Error("Do not export theme token files under .kabeeri/. Use a project path such as knowledge/frontend_specs/tokens.json.");
  }
}

function findThemeTokenPreset(presetName) {
  const catalog = getThemeTokenPresetCatalog();
  const normalized = String(presetName || "").trim().toLowerCase();
  return (catalog.presets || []).find((item) => String(item.preset).toLowerCase() === normalized) || null;
}

function buildDesignTokenSetFromPreset(product, patternKey, preset, motionSystem, flags = {}) {
  const density = flags.density || (preset.creative_profile && preset.creative_profile.density) || inferDefaultDensity(product, patternKey);
  return {
    token_set_id: flags.id || `design-tokens-${product.key}-${preset.preset}`,
    status: "recommended",
    source_ids: parseCsv(flags.sources || flags.source),
    blueprint_key: product.key,
    experience_pattern: patternKey,
    palette_preset: preset.preset,
    creative_profile: {
      ...(preset.creative_profile || {}),
      density,
      accent_strategy: flags["accent-strategy"] || "single_primary_with_reserved_state_colors"
    },
    colors: preset.colors || {},
    typography: inferThemeTypography(product, flags),
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: density === "compact" ? "20px" : "24px",
      xl: density === "comfortable" ? "40px" : "32px"
    },
    radius: inferThemeRadius(preset.preset, density),
    shadow: inferThemeShadow(preset.preset),
    density: {
      comfortable: {
        section_gap: "32px",
        card_padding: "24px",
        control_gap: "12px"
      },
      balanced: {
        section_gap: "24px",
        card_padding: "16px",
        control_gap: "8px"
      },
      compact: {
        section_gap: "16px",
        card_padding: "12px",
        control_gap: "6px"
      },
      selected: density
    },
    motion: {
      level: motionSystem.level,
      duration: {
        instant: "80ms",
        fast: "120ms",
        normal: "200ms",
        medium: "300ms",
        slow: "500ms",
        showcase: "700ms"
      },
      easing: {
        standard: "ease-out",
        emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        exit: "ease-in",
        linear: "linear"
      },
      distance: {
        micro: "2px",
        small: "6px",
        medium: "12px",
        large: "24px"
      },
      scale: {
        press: "0.98",
        hover: "1.02",
        pop: "1.04"
      },
      reduced_motion_required: true
    },
    breakpoints: {
      mobile: "480px",
      tablet: "768px",
      desktop: "1024px"
    },
    approval: {
      approved_by: null,
      approved_at: null
    }
  };
}

function inferDefaultDensity(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  if (/admin|erp|crm|finance|fintech|accounting|wms|dashboard|helpdesk/.test(text) || patternKey === "data_heavy_web_app") return "compact";
  if (/landing|content|blog|news|medical|health|corporate/.test(text) || patternKey === "seo_content_site") return "comfortable";
  return "balanced";
}

function inferThemeTypography(product, flags = {}) {
  const wantsArabic = shouldUseRtlArabicReferences(product, flags);
  return {
    font_family: wantsArabic ? "system-ui, 'Segoe UI', Tahoma, sans-serif" : "system-ui, sans-serif",
    base_size: "16px",
    scale: {
      body: "1rem",
      small: "0.875rem",
      heading: "1.5rem"
    },
    notes: wantsArabic ? "Arabic/RTL surfaces should verify readable line-height, numerals, dates, and mixed LTR tokens." : "Adjust only from approved brand typography."
  };
}

function inferThemeRadius(presetName, density) {
  if (presetName === "enterprise_neutral" || density === "compact") return { sm: "3px", md: "6px", lg: "8px" };
  if (presetName === "clinical_trust" || density === "comfortable") return { sm: "6px", md: "10px", lg: "14px" };
  return { sm: "4px", md: "8px", lg: "12px" };
}

function inferThemeShadow(presetName) {
  if (presetName === "dark_governance") {
    return {
      sm: "0 1px 2px rgba(0, 0, 0, 0.24)",
      md: "0 12px 28px rgba(0, 0, 0, 0.28)"
    };
  }
  if (presetName === "enterprise_neutral" || presetName === "finance_precision") {
    return {
      sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
      md: "0 8px 18px rgba(15, 23, 42, 0.07)"
    };
  }
  return {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 8px 24px rgba(15, 23, 42, 0.08)"
  };
}

function getUiUxReferencePattern(code) {
  if (!code) throw new Error("Missing UI/UX reference code.");
  const normalized = String(code).trim().toUpperCase();
  const catalog = getUiUxReferenceCatalog();
  const item = (catalog.patterns || []).find((pattern) => String(pattern.code).toUpperCase() === normalized);
  if (!item) throw new Error(`UI/UX reference pattern not found: ${code}`);
  return item;
}

function renderUiUxReferencePattern(item) {
  console.log(`${item.code}: ${item.name}`);
  console.log(table(["Field", "Value"], [
    ["Category", item.category],
    ["Style", item.style],
    ["Best for", (item.best_for || []).join(", ")],
    ["Core layout", (item.core_layout || []).join(", ")],
    ["Components", (item.components || []).join(", ")],
    ["States", (item.required_states || []).join(", ")],
    ["Rules", (item.non_negotiable_rules || []).slice(0, 8).join("; ")],
    ["Knowledge file", item.knowledge_file || ""]
  ]));
}

function recommendUiUxReferences(brief) {
  const catalog = getUiUxReferenceCatalog();
  const text = String(brief || "").toLowerCase();
  const matches = (catalog.patterns || []).map((item) => {
    const keywords = uniqueList([
      item.code,
      item.name,
      item.category,
      item.style,
      ...(item.best_for || []),
      ...(item.keywords || []),
      ...(item.components || [])
    ].map((entry) => String(entry || "").toLowerCase()));
    const reasons = keywords.filter((keyword) => keyword && text.includes(keyword)).slice(0, 6);
    const score = reasons.length + ((item.best_for || []).some((entry) => text.includes(String(entry).toLowerCase())) ? 2 : 0);
    return { code: item.code, name: item.name, score, reasons: reasons.length ? reasons : ["fallback candidate"] };
  }).sort((a, b) => b.score - a.score || a.code.localeCompare(b.code)).slice(0, 3);
  return {
    selection_id: `uiux-reference-${Date.now()}`,
    brief,
    matches,
    guidance: [
      "Use the winning reference as inspiration only; implementation must come from approved text specs and design tokens.",
      "Generate questions before tasks when client/developer intent is incomplete.",
      "Create page specs and component contracts before frontend implementation tasks."
    ],
    created_at: new Date().toISOString()
  };
}

function buildUiUxReferenceQuestions(pattern, flags = {}) {
  const catalog = getUiUxReferenceCatalog();
  const generic = catalog.question_bank || [];
  const patternQuestions = pattern.question_prompts || [];
  const count = Number(flags.count || 16);
  const questions = uniqueList([...patternQuestions, ...generic]).slice(0, count);
  return {
    question_set_id: `uiux-questions-${pattern.code.toLowerCase()}-${Date.now()}`,
    pattern_code: pattern.code,
    pattern_name: pattern.name,
    language_policy: "Ask in the user's language. Keep technical labels only when they help the developer.",
    questions,
    created_at: new Date().toISOString()
  };
}

function createTasksFromUiUxReference(pattern, flags = {}) {
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextTaskId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const scope = flags.scope || flags.page || pattern.category || "ui";
  const templates = pattern.task_templates || [];
  const created = templates.map((template) => ({
    id: nextTaskId(),
    title: `${pattern.code}: ${template.title}`,
    status: "proposed",
    type: template.type || "frontend_design",
    workstream: template.workstream || "public_frontend",
    workstreams: [template.workstream || "public_frontend"],
    source: "ui_ux_reference",
    source_reference: `uiux-reference:${pattern.code}`,
    source_mode: "approved_reference",
    ui_ux_reference_code: pattern.code,
    scope,
    allowed_files: template.allowed_files || ["knowledge/design_system/**", "knowledge/frontend_specs/**", "src/**"],
    acceptance_criteria: template.acceptance_criteria || pattern.visual_acceptance.slice(0, 4),
    created_at: new Date().toISOString()
  }));
  data.tasks.push(...created);
  writeJsonFile(tasksFile, data);
  for (const taskItem of created) {
    appendAudit("task.generated_from_ui_ux_reference", "task", taskItem.id, `Generated from ${pattern.code}`);
  }
  return created;
}

function buildUiDesignRecommendation(blueprintKey, flags = {}) {
  const catalog = getUiDesignCatalog();
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const pattern = catalog.experience_patterns[patternKey];
  if (!pattern) throw new Error(`UI experience pattern not found: ${patternKey}`);
  const componentGroups = inferUiComponentGroups(patternKey, product);
  const components = uniqueList(componentGroups.flatMap((group) => catalog.component_sets[group] || []));
  const approvedLibraryKeys = new Set(pattern.approved_ui_libraries || []);
  const approvedUiLibraries = (catalog.approved_ui_libraries || []).filter((library) => approvedLibraryKeys.has(library.key));
  const businessUiPattern = inferBusinessUiPattern(product, patternKey);
  const templatePack = inferBusinessTemplatePack(businessUiPattern.key);
  const templateRecommendations = inferBusinessTemplateRecommendations(businessUiPattern.key, product, patternKey);
  const designReferences = inferBusinessDesignReferences(businessUiPattern.key, product, patternKey);
  const projectUiPlaybook = findProjectUiPlaybook(product.key);
  const motionSystem = inferMotionSystem(product, patternKey);
  const uiFlows = inferUiFlows(product, patternKey);
  const rtlArabicUi = inferRtlArabicUiReferences(product, flags);
  const accessibilityInclusiveUi = inferAccessibilityInclusiveUi(product, patternKey);
  const performanceWebVitalsUi = inferPerformanceWebVitalsUi(product, patternKey);
  const contentMicrocopyUx = inferContentMicrocopyUx(product, patternKey);
  const visualQualityGovernance = inferVisualQualityGovernance(product, patternKey);
  const uiDecisionProfile = buildUiDecisionProfile(product.key, { ...flags, pattern: patternKey });
  const themeTokenRecommendation = buildThemeTokenRecommendation(product.key, { ...flags, pattern: patternKey });
  const componentCompositionRecommendation = buildComponentCompositionRecommendation(product.key, { ...flags, pattern: patternKey });
  const frameworkAdapterRecommendation = buildFrameworkAdapterRecommendation(product.key, { ...flags, pattern: patternKey });
  const creativeVariantRecommendation = buildCreativeVariantRecommendation(product.key, { ...flags, pattern: patternKey, count: flags["variant-count"] || flags.count || 3 });
  return {
    recommendation_id: `ui-design-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    recommended_stacks: pattern.recommended_stacks || [],
    approved_ui_libraries: approvedUiLibraries,
    foundations: catalog.foundations || [],
    components,
    component_groups: componentGroups,
    page_templates: inferUiPageTemplates(product, patternKey),
    layout_priorities: pattern.layout_priorities || [],
    seo_geo: pattern.seo_geo || [],
    avoid: pattern.avoid || [],
    ui_execution_kit: {
      contract: "knowledge/design_system/ui_execution_kit/UI_CONTRACT.md",
      colors: "knowledge/design_system/ui_execution_kit/COLOR_SYSTEM.md",
      creative_variation: "knowledge/design_system/ui_execution_kit/CREATIVE_VARIATION_RULES.md",
      icon_map: "knowledge/design_system/ui_execution_kit/ICON_MAP.md",
      button_presets: "knowledge/design_system/ui_execution_kit/BUTTON_PRESETS.md",
      component_map: "knowledge/design_system/ui_execution_kit/COMPONENT_MAP.md",
      motion: "knowledge/design_system/ui_execution_kit/MOTION_MICROINTERACTIONS.md",
      assessment_template: "knowledge/design_system/ui_execution_kit/KVDF_DESIGN_SYSTEM_ASSESSMENT_TEMPLATE.md",
      ui_review: "knowledge/design_system/ui_execution_kit/UI_REVIEW.md",
      recipes: inferUiExecutionRecipes(patternKey)
    },
    business_ui_pattern: businessUiPattern,
    project_ui_playbook: projectUiPlaybook ? {
      enabled: true,
      variant_archetype: projectUiPlaybook.variant_archetype,
      composition_id: projectUiPlaybook.composition_id,
      adapter_preference: projectUiPlaybook.adapter_preference,
      density: projectUiPlaybook.density,
      navigation_pattern: projectUiPlaybook.navigation_pattern,
      primary_focus: projectUiPlaybook.primary_focus,
      critical_questions: projectUiPlaybook.critical_questions,
      avoid: projectUiPlaybook.avoid,
      references: {
        readme: "knowledge/design_system/project_ui_playbooks/README.md",
        catalog: "knowledge/design_system/project_ui_playbooks/PROJECT_UI_PLAYBOOKS.json",
        review: "knowledge/design_system/project_ui_playbooks/PLAYBOOK_REVIEW_CHECKLIST.md"
      }
    } : null,
    template_pack: templatePack,
    design_references: designReferences,
    recommended_templates: templateRecommendations,
    recommended_dashboard_style: templatePack ? templatePack.recommended_dashboard_style : inferBusinessDashboardStyle(businessUiPattern.key),
    theme_token_intelligence: {
      enabled: true,
      level: themeTokenRecommendation.palette_preset,
      references: {
        readme: "knowledge/design_system/theme_token_intelligence/README.md",
        contract: "knowledge/design_system/theme_token_intelligence/THEME_TOKEN_CONTRACT.md",
        preset_catalog: "knowledge/design_system/theme_token_intelligence/PALETTE_PRESET_CATALOG.json",
        framework_mapping: "knowledge/design_system/theme_token_intelligence/FRAMEWORK_TOKEN_MAPPING.md",
        variation_rules: "knowledge/design_system/theme_token_intelligence/THEME_VARIATION_RULES.md"
      },
      token_set: themeTokenRecommendation.token_set
    },
    component_composition_intelligence: {
      enabled: true,
      composition_id: componentCompositionRecommendation.composition.composition_id,
      name: componentCompositionRecommendation.composition.name,
      score: componentCompositionRecommendation.score,
      references: componentCompositionRecommendation.references,
      composition: componentCompositionRecommendation.composition,
      alternatives: componentCompositionRecommendation.alternatives
    },
    framework_adapter_intelligence: {
      enabled: true,
      adapter_key: frameworkAdapterRecommendation.adapter.adapter_key,
      framework: frameworkAdapterRecommendation.adapter.framework,
      approval_status: frameworkAdapterRecommendation.approval_status,
      install: frameworkAdapterRecommendation.adapter.install,
      imports: frameworkAdapterRecommendation.adapter.imports,
      icon_strategy: frameworkAdapterRecommendation.adapter.icon_strategy,
      token_set_id: frameworkAdapterRecommendation.token_set_id,
      composition_id: frameworkAdapterRecommendation.composition_id,
      composition_mapping: frameworkAdapterRecommendation.composition_mapping,
      compatibility_warnings: frameworkAdapterRecommendation.compatibility_warnings,
      references: frameworkAdapterRecommendation.references
    },
    creative_variant_intelligence: {
      enabled: true,
      selected_count: creativeVariantRecommendation.variants.length,
      variants: creativeVariantRecommendation.variants,
      references: creativeVariantRecommendation.references,
      prompt_hint: creativeVariantRecommendation.prompt_hint
    },
    ui_decision_intake: {
      enabled: true,
      selected_variant_id: uiDecisionProfile.selected_variant.variant_id,
      palette_preset: uiDecisionProfile.palette_preset,
      density: uiDecisionProfile.density,
      navigation_pattern: uiDecisionProfile.navigation_pattern,
      missing_answers: uiDecisionProfile.missing_answers,
      references: uiDecisionProfile.references,
      prompt_hint: uiDecisionProfile.prompt_hint
    },
    ui_flows: uiFlows,
    motion_system: motionSystem,
    accessibility_inclusive_ui: accessibilityInclusiveUi,
    performance_web_vitals_ui: performanceWebVitalsUi,
    content_microcopy_ux: contentMicrocopyUx,
    visual_quality_governance: visualQualityGovernance,
    rtl_arabic_ui: rtlArabicUi,
    color_palette_presets: inferColorPalettePresets(product, patternKey),
    creative_variation_axes: inferCreativeVariationAxes(product, patternKey),
    implementation_prompt: buildUiImplementationPrompt({
      product,
      businessUiPattern,
      designReferences,
      templateRecommendations,
      uiFlows,
      motionSystem,
      accessibilityInclusiveUi,
      performanceWebVitalsUi,
      contentMicrocopyUx,
      visualQualityGovernance,
      themeTokenRecommendation,
      componentCompositionRecommendation,
      frameworkAdapterRecommendation,
      creativeVariantRecommendation,
      uiDecisionProfile,
      rtlArabicUi,
      patternKey
    }),
    checklist: catalog.approval_checklist || [],
    ai_instructions: [
      "Start with approved design tokens and page specs before frontend implementation.",
      "When Bootstrap is selected, use the pinned bootstrap package and map Bootstrap variables/components into the project design system before building pages.",
      "When Tailwind CSS is selected, use the pinned tailwindcss package, document the build adapter, and map Tailwind theme variables/utilities into project tokens and component contracts before building pages.",
      "When selecting Bulma, Foundation, MUI, Ant Design, daisyUI, or shadcn/ui, confirm framework compatibility first and document the install command, token map, ownership model, and component contracts.",
      "Use Theme Token Intelligence to select/export a semantic token file before page implementation.",
      "Use Component Composition Intelligence to select a screen composition ID before code generation.",
      "Use Framework Adapter Intelligence to translate tokens and composition into the selected UI framework before writing frontend code.",
      "Use Project UI Playbooks to start from the product-type default UI direction before applying answer-driven overrides.",
      "Use Creative Variant Intelligence to choose a bounded design direction so similar apps do not receive identical UI.",
      "Use UI Decision Intake to map developer answers into variant, palette, density, navigation, and tone decisions.",
      "Use the UI Execution Kit files instead of repeating long UI instructions in prompts.",
      "Use the recommended business UI pattern and flow files before generating screen layouts.",
      "Apply the Accessibility and Inclusive UI Reference Pack for semantic HTML, keyboard, focus, forms, tables, dialogs, contrast, and readable content.",
      "Apply the Performance and Core Web Vitals UI Pack for LCP, INP, CLS, images, fonts, JavaScript, data rendering, skeletons, and loading states.",
      "Apply the Content and Microcopy UX Pack for action labels, empty/error states, validation, onboarding, confirmations, statuses, and product-aware tone.",
      "Apply the Visual Quality Governance Pack before Owner/client visual approval and use rubric scores for targeted rework.",
      "Use the motion system only for feedback, guidance, continuity, or perceived performance, and support reduced motion.",
      "When Arabic, bilingual, or RTL surfaces are present, apply the RTL Arabic UI Reference Pack before layout and component decisions.",
      "Apply creative variation from product answers so similar app types do not receive identical layout, palette, density, or tone.",
      "Choose components from the recommended component groups instead of inventing one-off UI.",
      "For SEO/GEO surfaces, use semantic HTML, structured data, breadcrumbs, clear headings, and fast pages.",
      "For dashboards, prioritize data density, filters, tables, keyboard navigation, permissions, and empty/error states.",
      "For mobile, prioritize touch targets, offline/error states, navigation clarity, push permission UX, and deep links."
    ]
  };
}

function inferUiPatternFromBlueprint(product) {
  if ((product.channels || []).includes("mobile_app")) return "mobile_app";
  if ((product.channels || []).includes("pos_terminal")) return "pos_operations";
  if ((product.category || "").includes("content")) return "seo_content_site";
  if ((product.category || "").includes("commerce")) return "commerce_storefront";
  return "data_heavy_web_app";
}

function inferUiComponentGroups(patternKey, product) {
  const groups = ["core"];
  if (patternKey === "seo_content_site") groups.push("content");
  if (patternKey === "commerce_storefront") groups.push("commerce", "content");
  if (patternKey === "data_heavy_web_app") groups.push("dashboard");
  if (patternKey === "pos_operations") groups.push("dashboard", "commerce");
  if (patternKey === "mobile_app") groups.push("mobile");
  if ((product.channels || []).some((item) => String(item).includes("admin"))) groups.push("dashboard");
  return uniqueList(groups);
}

function inferUiPageTemplates(product, patternKey) {
  const base = product.frontend_pages || [];
  const extras = {
    seo_content_site: ["home", "listing_page", "detail_page", "search_results", "faq_section", "contact_or_subscribe"],
    commerce_storefront: ["home", "category", "product_details", "cart", "checkout", "order_tracking", "account"],
    data_heavy_web_app: ["dashboard", "list_table", "detail_drawer", "create_edit_form", "reports", "settings"],
    pos_operations: ["sales_screen", "shift_open_close", "orders", "cash_drawer", "reports"],
    mobile_app: ["onboarding", "login", "home", "list", "detail", "profile", "settings", "offline_state"]
  };
  return uniqueList([...base, ...(extras[patternKey] || [])]);
}

function inferBusinessUiPattern(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  const direct = [
    ["ai", "ai-product"],
    ["ecommerce", "ecommerce"],
    ["marketplace", "marketplace"],
    ["booking", "booking"],
    ["delivery", "delivery"],
    ["crm", "crm"],
    ["erp", "erp"],
    ["dashboard", "dashboard"],
    ["admin", "admin-panel"],
    ["fintech", "fintech"],
    ["finance", "fintech"],
    ["accounting", "fintech"],
    ["billing", "fintech"],
    ["invoice", "fintech"],
    ["payment", "fintech"],
    ["health", "healthtech"],
    ["medical", "healthtech"],
    ["lms", "lms"],
    ["education", "lms"],
    ["real estate", "real-estate"],
    ["property", "real-estate"],
    ["corporate", "corporate"],
    ["landing", "landing-page"],
    ["saas", "saas"]
  ];
  const match = direct.find(([needle]) => text.includes(needle));
  let key = match ? match[1] : null;
  if (!key) {
    if (patternKey === "commerce_storefront") key = "ecommerce";
    else if (patternKey === "data_heavy_web_app") key = "admin-panel";
    else if (patternKey === "seo_content_site") key = "corporate";
    else if (patternKey === "mobile_app") key = "delivery";
    else key = "saas";
  }
  return {
    key,
    catalog: "knowledge/design_system/business_ui_patterns/BUSINESS_UI_PATTERN_CATALOG.json",
    template_index: "knowledge/design_system/business_ui_patterns/TEMPLATE_LIBRARY_INDEX.json",
    reference_index: "knowledge/design_system/business_ui_patterns/BUSINESS_REFERENCE_INDEX.json",
    pattern: `knowledge/design_system/business_ui_patterns/${key}/PATTERN.md`,
    template: "knowledge/design_system/business_ui_patterns/BUSINESS_PATTERN_TEMPLATE.md"
  };
}

function getBusinessReferenceIndex() {
  return readJsonFile("knowledge/design_system/business_ui_patterns/BUSINESS_REFERENCE_INDEX.json");
}

function inferBusinessDashboardStyle(businessType) {
  const index = getBusinessReferenceIndex();
  const entry = (index.references || []).find((item) => item.businessType === businessType);
  return entry ? entry.dashboardStyle || null : null;
}

function getBusinessTemplateIndex() {
  return readJsonFile("knowledge/design_system/business_ui_patterns/TEMPLATE_LIBRARY_INDEX.json");
}

function inferBusinessDesignReferences(businessType, product, patternKey) {
  const index = getBusinessReferenceIndex();
  const entry = (index.references || []).find((item) => item.businessType === businessType);
  if (!entry) return [];
  const text = `${product.key || ""} ${product.name || ""} ${(product.frontend_pages || []).join(" ")}`.toLowerCase();
  const keywordScore = (file) => {
    const name = file.toLowerCase();
    let score = 1;
    if (/dashboard|overview|analytics|report|kpi/.test(text) && /dashboard|overview|analytics|report/.test(name)) score += 3;
    if (/checkout|payment|invoice|billing|finance/.test(text) && /checkout|payment|billing|finance|invoice/.test(name)) score += 3;
    if (/product|catalog|storefront|commerce/.test(text) && /product|storefront|merchant/.test(name)) score += 3;
    if (/approval|workflow/.test(text) && /approval|workflow/.test(name)) score += 3;
    if (/table|records|crud|admin/.test(text) && /table|crud|record|admin/.test(name)) score += 3;
    if (/calendar|slot|booking|appointment/.test(text) && /calendar|slot|booking|service/.test(name)) score += 3;
    if (/prompt|chat|ai|file|usage/.test(text) && /prompt|streaming|file|usage|history/.test(name)) score += 3;
    if (patternKey === "data_heavy_web_app" && /table|workflow|audit|admin|dashboard/.test(name)) score += 1;
    return score;
  };
  return [...(entry.files || [])]
    .sort((a, b) => keywordScore(b) - keywordScore(a) || a.localeCompare(b))
    .slice(0, 5);
}

function inferBusinessTemplatePack(businessType) {
  const index = getBusinessTemplateIndex();
  const pack = (index.packs || []).find((item) => item.businessType === businessType);
  if (!pack) return null;
  return {
    business_type: pack.businessType,
    pattern: pack.pattern,
    templates: pack.templates,
    recommended_dashboard_style: pack.recommendedDashboardStyle || null
  };
}

function readTemplatePackTemplates(pack) {
  if (!pack || !pack.templates) return [];
  try {
    return readJsonFile(pack.templates);
  } catch (error) {
    return [];
  }
}

function inferBusinessTemplateRecommendations(businessType, product, patternKey) {
  const pack = inferBusinessTemplatePack(businessType);
  const templates = readTemplatePackTemplates(pack);
  const text = `${product.key || ""} ${product.name || ""} ${(product.frontend_pages || []).join(" ")}`.toLowerCase();
  const preferredViewTypes = [];
  if (/checkout|cart|order|payment|ecommerce|commerce/.test(text) || patternKey === "commerce_storefront") preferredViewTypes.push("checkout-summary", "product-card");
  if (/erp|invoice|approval|inventory|accounting/.test(text)) preferredViewTypes.push("data-table", "approval-stepper");
  if (/crm|lead|deal|pipeline/.test(text)) preferredViewTypes.push("pipeline-column");
  if (/booking|appointment|reservation/.test(text)) preferredViewTypes.push("time-slot-picker");
  if (/ai|prompt|chat|generation|automation/.test(text)) preferredViewTypes.push("prompt-input", "generated-result");
  if (/saas|subscription|workspace|usage/.test(text)) preferredViewTypes.push("onboarding", "usage-card");
  if (/dashboard|analytics|report|kpi/.test(text)) preferredViewTypes.push("kpi-band");
  if (/admin|backoffice|cms|moderation/.test(text)) preferredViewTypes.push("crud-table");

  const ranked = templates
    .map((template) => {
      const score = preferredViewTypes.includes(template.viewType) ? 2 : 1;
      return { ...template, score };
    })
    .sort((a, b) => b.score - a.score || a.templateId.localeCompare(b.templateId));

  return ranked.slice(0, 4).map((template) => ({
    template_id: template.templateId,
    name: template.name,
    business_type: template.businessType,
    view_type: template.viewType,
    file: template.files && template.files.template ? template.files.template : null,
    required_states: template.requiredStates || [],
    required_components: template.requiredComponents || [],
    acceptance_criteria: template.acceptanceCriteria || []
  }));
}

function inferUiExecutionRecipes(patternKey) {
  const common = [
    "knowledge/design_system/ui_execution_kit/recipes/EMPTY_STATE.md",
    "knowledge/design_system/ui_execution_kit/recipes/CONFIRM_MODAL.md"
  ];
  const byPattern = {
    seo_content_site: ["knowledge/design_system/ui_execution_kit/recipes/FORM_PAGE.md"],
    commerce_storefront: ["knowledge/design_system/ui_execution_kit/recipes/CRUD_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/FORM_PAGE.md"],
    data_heavy_web_app: ["knowledge/design_system/ui_execution_kit/recipes/DASHBOARD_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/CRUD_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/FORM_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/SETTINGS_PAGE.md"],
    pos_operations: ["knowledge/design_system/ui_execution_kit/recipes/DASHBOARD_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/CRUD_PAGE.md"],
    mobile_app: ["knowledge/design_system/ui_execution_kit/recipes/FORM_PAGE.md", "knowledge/design_system/ui_execution_kit/recipes/EMPTY_STATE.md"]
  };
  return uniqueList([...(byPattern[patternKey] || []), ...common]);
}

function inferUiFlows(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  const flows = [
    "knowledge/design_system/ui_flows/CRUD_FLOW.md",
    "knowledge/design_system/ui_flows/DELETE_CONFIRMATION_FLOW.md"
  ];
  if (/login|auth|account|user|admin|crm|erp|saas|dashboard/.test(text) || patternKey === "data_heavy_web_app") {
    flows.push("knowledge/design_system/ui_flows/AUTH_FLOW.md", "knowledge/design_system/ui_flows/USER_MANAGEMENT_FLOW.md");
  }
  if (/ecommerce|commerce|marketplace|delivery|checkout|cart/.test(text) || patternKey === "commerce_storefront") {
    flows.push("knowledge/design_system/ui_flows/CHECKOUT_FLOW.md", "knowledge/design_system/ui_flows/PAYMENT_CONFIRMATION_FLOW.md");
  }
  if (/booking|reservation|appointment|health|medical/.test(text)) {
    flows.push("knowledge/design_system/ui_flows/BOOKING_FLOW.md");
  }
  if (/saas|onboarding|lms|education|ai|corporate|landing/.test(text) || patternKey === "seo_content_site") {
    flows.push("knowledge/design_system/ui_flows/ONBOARDING_FLOW.md");
  }
  if (/ai|prompt|chatbot|generation|automation/.test(text)) {
    flows.push("knowledge/design_system/ui_flows/AI_PRODUCT_FLOW.md");
  }
  return uniqueList(flows);
}

function inferMotionSystem(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  let level = "BALANCED_MOTION";
  if (/admin|erp|fintech|finance|health|medical|security|wms|accounting/.test(text) || patternKey === "data_heavy_web_app") {
    level = "MINIMAL_MOTION";
  }
  if (/landing|corporate|portfolio|marketing|showcase/.test(text) || patternKey === "seo_content_site") {
    level = "EXPRESSIVE_MOTION";
  }
  return {
    level,
    reference: "knowledge/design_system/ui_execution_kit/MOTION_MICROINTERACTIONS.md",
    default_approach: level === "EXPRESSIVE_MOTION" ? "CSS transitions first; add AOS, GSAP, or Lottie only when justified." : "CSS transitions and existing UI framework motion first.",
    reduced_motion_required: true
  };
}

function inferAccessibilityInclusiveUi(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  let level = "ACCESSIBILITY_BALANCED";
  if (/admin|erp|crm|fintech|finance|health|medical|government|security|wms|accounting|billing|dashboard|helpdesk|hr|payroll/.test(text) || patternKey === "data_heavy_web_app") {
    level = "ACCESSIBILITY_STRICT";
  }
  if (/blog|news|content|documentation|knowledge|corporate|landing|newsletter/.test(text) || patternKey === "seo_content_site") {
    level = "ACCESSIBILITY_CONTENT";
  }
  const emphasisByLevel = {
    ACCESSIBILITY_STRICT: ["keyboard_first_workflows", "data_table_accessibility", "visible_focus", "precise_errors", "permission_and_audit_clarity"],
    ACCESSIBILITY_BALANCED: ["clear_flows", "form_recovery", "accessible_navigation", "reduced_motion", "touch_target_comfort"],
    ACCESSIBILITY_CONTENT: ["semantic_headings", "skip_links", "readable_line_length", "link_purpose", "image_alt_policy", "content_landmarks"]
  };
  return {
    enabled: true,
    level,
    references: {
      readme: "knowledge/design_system/accessibility_inclusive_ui/README.md",
      contract: "knowledge/design_system/accessibility_inclusive_ui/ACCESSIBILITY_CONTRACT.md",
      focus_keyboard: "knowledge/design_system/accessibility_inclusive_ui/FOCUS_KEYBOARD_RULES.md",
      semantic_html: "knowledge/design_system/accessibility_inclusive_ui/SEMANTIC_HTML_RULES.md",
      forms_errors: "knowledge/design_system/accessibility_inclusive_ui/FORMS_ERRORS_RULES.md",
      tables_data: "knowledge/design_system/accessibility_inclusive_ui/TABLES_DATA_ACCESSIBILITY.md",
      dialogs_overlays: "knowledge/design_system/accessibility_inclusive_ui/DIALOGS_OVERLAYS_RULES.md",
      content_readability: "knowledge/design_system/accessibility_inclusive_ui/CONTENT_READABILITY_RULES.md",
      review_checklist: "knowledge/design_system/accessibility_inclusive_ui/ACCESSIBILITY_REVIEW_CHECKLIST.md"
    },
    emphasis: emphasisByLevel[level] || emphasisByLevel.ACCESSIBILITY_BALANCED
  };
}

function inferPerformanceWebVitalsUi(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  let level = "PERFORMANCE_APP_BALANCED";
  if (/blog|news|content|documentation|knowledge|corporate|landing|newsletter|ecommerce|commerce|marketplace|loyalty|booking/.test(text) || patternKey === "seo_content_site" || patternKey === "commerce_storefront") {
    level = "PERFORMANCE_PUBLIC_STRICT";
  }
  if (/admin|erp|crm|fintech|finance|health|medical|dashboard|bi|wms|inventory|accounting|billing|helpdesk|hr|payroll/.test(text) || patternKey === "data_heavy_web_app") {
    level = "PERFORMANCE_DATA_HEAVY";
  }
  const emphasisByLevel = {
    PERFORMANCE_PUBLIC_STRICT: ["lcp_planning", "optimized_images", "font_loading", "low_javascript_weight", "stable_first_viewport", "core_web_vitals_evidence"],
    PERFORMANCE_APP_BALANCED: ["fast_first_usable_screen", "responsive_forms_filters", "progressive_data_loading", "route_level_splitting", "clear_loading_error_states"],
    PERFORMANCE_DATA_HEAVY: ["table_pagination_virtualization", "chart_lazy_loading", "filter_debounce", "stable_widget_dimensions", "independent_widget_failure"]
  };
  return {
    enabled: true,
    level,
    references: {
      readme: "knowledge/design_system/performance_web_vitals_ui/README.md",
      contract: "knowledge/design_system/performance_web_vitals_ui/PERFORMANCE_CONTRACT.md",
      core_web_vitals: "knowledge/design_system/performance_web_vitals_ui/CORE_WEB_VITALS_RULES.md",
      image_media: "knowledge/design_system/performance_web_vitals_ui/IMAGE_MEDIA_RULES.md",
      font_css: "knowledge/design_system/performance_web_vitals_ui/FONT_CSS_RULES.md",
      javascript_interaction: "knowledge/design_system/performance_web_vitals_ui/JAVASCRIPT_INTERACTION_RULES.md",
      data_rendering: "knowledge/design_system/performance_web_vitals_ui/DATA_RENDERING_RULES.md",
      loading_skeleton: "knowledge/design_system/performance_web_vitals_ui/LOADING_SKELETON_RULES.md",
      review_checklist: "knowledge/design_system/performance_web_vitals_ui/PERFORMANCE_REVIEW_CHECKLIST.md"
    },
    emphasis: emphasisByLevel[level] || emphasisByLevel.PERFORMANCE_APP_BALANCED
  };
}

function inferContentMicrocopyUx(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  let level = "CONTENT_OPERATIONAL";
  if (/ecommerce|commerce|marketplace|booking|landing|loyalty|checkout|store/.test(text) || patternKey === "commerce_storefront") {
    level = "CONTENT_CONVERSION";
  }
  if (/blog|news|content|documentation|knowledge|corporate|newsletter/.test(text) || patternKey === "seo_content_site") {
    level = "CONTENT_EDITORIAL";
  }
  if (/ai|prompt|chatbot|generation|automation|assistant/.test(text)) {
    level = "CONTENT_CONVERSATIONAL";
  }
  const emphasisByLevel = {
    CONTENT_OPERATIONAL: ["task_clarity", "permission_wording", "exact_status_labels", "recoverable_errors", "low_drama_confirmations"],
    CONTENT_CONVERSION: ["value_clarity", "friction_reduction", "price_fee_date_stock_clarity", "trust_signals", "next_step_confidence"],
    CONTENT_EDITORIAL: ["scannable_headings", "source_date_update_labels", "descriptive_links", "useful_summaries", "credible_tone"],
    CONTENT_CONVERSATIONAL: ["expectation_setting", "progress_messaging", "confidence_boundaries", "retry_edit_paths", "generated_output_state"]
  };
  return {
    enabled: true,
    level,
    references: {
      readme: "knowledge/design_system/content_microcopy_ux/README.md",
      contract: "knowledge/design_system/content_microcopy_ux/CONTENT_MICROCOPY_CONTRACT.md",
      action_labels: "knowledge/design_system/content_microcopy_ux/ACTION_LABEL_RULES.md",
      empty_error_states: "knowledge/design_system/content_microcopy_ux/EMPTY_ERROR_STATE_COPY.md",
      form_validation: "knowledge/design_system/content_microcopy_ux/FORM_VALIDATION_COPY.md",
      onboarding_help: "knowledge/design_system/content_microcopy_ux/ONBOARDING_HELP_COPY.md",
      confirmation_status: "knowledge/design_system/content_microcopy_ux/CONFIRMATION_STATUS_COPY.md",
      business_tone_matrix: "knowledge/design_system/content_microcopy_ux/BUSINESS_TONE_MATRIX.md",
      review_checklist: "knowledge/design_system/content_microcopy_ux/CONTENT_REVIEW_CHECKLIST.md"
    },
    emphasis: emphasisByLevel[level] || emphasisByLevel.CONTENT_OPERATIONAL
  };
}

function inferVisualQualityGovernance(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  let level = "VISUAL_QA_BALANCED";
  if (/admin|erp|crm|fintech|finance|health|medical|dashboard|wms|accounting|billing|security|governance/.test(text) || patternKey === "data_heavy_web_app") {
    level = "VISUAL_QA_STRICT";
  }
  if (/landing|corporate|ecommerce|commerce|marketplace|news|blog|content|documentation|showcase|portfolio/.test(text) || patternKey === "seo_content_site" || patternKey === "commerce_storefront") {
    level = "VISUAL_QA_PUBLIC_STRICT";
  }
  const emphasisByLevel = {
    VISUAL_QA_STRICT: ["data_density", "table_readability", "role_visibility", "safe_actions", "state_evidence", "keyboard_access"],
    VISUAL_QA_BALANCED: ["responsive_fit", "state_coverage", "accessibility_evidence", "microcopy_quality", "motion_control"],
    VISUAL_QA_PUBLIC_STRICT: ["first_viewport_quality", "brand_fit", "conversion_or_content_clarity", "core_web_vitals_evidence", "mobile_polish"]
  };
  return {
    enabled: true,
    level,
    references: {
      readme: "knowledge/design_system/visual_quality_governance/README.md",
      rubric: "knowledge/design_system/visual_quality_governance/VISUAL_QUALITY_RUBRIC.md",
      evidence: "knowledge/design_system/visual_quality_governance/VISUAL_REVIEW_EVIDENCE.md",
      checklist: "knowledge/design_system/visual_quality_governance/DESIGN_QA_CHECKLIST.md",
      rework_rules: "knowledge/design_system/visual_quality_governance/REWORK_DECISION_RULES.md"
    },
    required_runtime_commands: [
      "kvdf design visual-review --page <page-spec-id> --screenshots desktop.png,mobile.png --checks responsive,states,accessibility,performance,content,motion,creative",
      "kvdf design gate --task <task-id> --page <page-spec-id>",
      "kvdf design governance --json"
    ],
    emphasis: emphasisByLevel[level] || emphasisByLevel.VISUAL_QA_BALANCED
  };
}

function isTruthyFlag(value) {
  if (value === true) return true;
  if (value === false || value === undefined || value === null) return false;
  return ["1", "true", "yes", "y", "on"].includes(String(value).trim().toLowerCase());
}

function includesArabicText(value) {
  return /[\u0600-\u06ff]/.test(String(value || ""));
}

function shouldUseRtlArabicReferences(product, flags = {}) {
  const language = String(flags.lang || flags.language || flags["output-language"] || flags.locale || "").trim().toLowerCase();
  const direction = String(flags.dir || flags.direction || "").trim().toLowerCase();
  const text = [
    product.key,
    product.name,
    product.category,
    ...(product.channels || []),
    ...(product.frontend_pages || []),
    flags.description,
    flags.notes,
    flags.audience,
    flags.market
  ].filter(Boolean).join(" ");
  return (
    isTruthyFlag(flags.rtl) ||
    isTruthyFlag(flags["rtl-arabic"]) ||
    isTruthyFlag(flags.arabic) ||
    direction === "rtl" ||
    language === "ar" ||
    language === "arabic" ||
    language.startsWith("ar-") ||
    includesArabicText(text)
  );
}

function inferRtlArabicUiReferences(product, flags = {}) {
  const enabled = shouldUseRtlArabicReferences(product, flags);
  return {
    enabled,
    trigger: enabled ? "arabic_language_or_rtl_context" : "not_required",
    references: enabled ? {
      readme: "knowledge/design_system/rtl_arabic_ui/README.md",
      contract: "knowledge/design_system/rtl_arabic_ui/RTL_ARABIC_UI_CONTRACT.md",
      typography: "knowledge/design_system/rtl_arabic_ui/ARABIC_TYPOGRAPHY.md",
      layout_patterns: "knowledge/design_system/rtl_arabic_ui/RTL_LAYOUT_PATTERNS.md",
      component_rules: "knowledge/design_system/rtl_arabic_ui/RTL_COMPONENT_RULES.md",
      forms_tables: "knowledge/design_system/rtl_arabic_ui/ARABIC_FORMS_TABLES.md",
      accessibility: "knowledge/design_system/rtl_arabic_ui/RTL_ACCESSIBILITY.md",
      review_checklist: "knowledge/design_system/rtl_arabic_ui/RTL_REVIEW_CHECKLIST.md"
    } : {}
  };
}

function buildUiImplementationPrompt({ product, businessUiPattern, designReferences, templateRecommendations, uiFlows, motionSystem, accessibilityInclusiveUi, performanceWebVitalsUi, contentMicrocopyUx, visualQualityGovernance, themeTokenRecommendation, componentCompositionRecommendation, frameworkAdapterRecommendation, creativeVariantRecommendation, uiDecisionProfile, rtlArabicUi, patternKey }) {
  const templateNames = (templateRecommendations || []).map((item) => item.template_id).join(", ") || "selected template metadata";
  const referenceNames = (designReferences || []).map((item) => item.split("/").pop()).join(", ") || "selected design references";
  const flowNames = (uiFlows || []).map((item) => item.split("/").pop()).join(", ") || "selected user flow";
  const primaryVariant = creativeVariantRecommendation && creativeVariantRecommendation.variants ? creativeVariantRecommendation.variants[0] : null;
  const lines = [
    `Build or refactor the UI for ${product.name} using Kabeeri Design Intelligence Layer.`,
    `Business pattern: ${businessUiPattern.key}.`,
    `Experience pattern: ${patternKey}.`,
    `Use full design references: ${referenceNames}.`,
    `Use templates: ${templateNames}.`,
    `Use flows: ${flowNames}.`,
    `Use theme token preset: ${themeTokenRecommendation.palette_preset}; export or reference the token set instead of repeating palette values.`,
    `Use screen composition: ${componentCompositionRecommendation.composition.composition_id}; adapt components from the composition catalog instead of inventing a new arrangement.`,
    `Use framework adapter: ${frameworkAdapterRecommendation.adapter.adapter_key}; translate tokens and composition through this adapter before writing framework code.`,
    `Use UI decision intake: ${uiDecisionProfile.selected_variant.variant_id}; apply selected density ${uiDecisionProfile.density}, navigation ${uiDecisionProfile.navigation_pattern}, and tone ${uiDecisionProfile.microcopy_tone}.`,
    primaryVariant ? `Use creative variant: ${primaryVariant.variant_id}; apply its density, hierarchy, surface style, component emphasis, and tone while preserving fixed rules.` : "Use Creative Variation Rules so similar apps do not receive identical UI.",
    `Use motion level: ${motionSystem.level}; respect prefers-reduced-motion.`,
    `Use accessibility level: ${accessibilityInclusiveUi.level}; apply Accessibility Inclusive UI references for semantic HTML, keyboard, focus, forms, tables, dialogs, contrast, and readable content.`,
    `Use performance level: ${performanceWebVitalsUi.level}; apply Performance Web Vitals UI references for LCP, INP, CLS, images, fonts, JavaScript, data rendering, skeletons, and loading states.`,
    `Use content level: ${contentMicrocopyUx.level}; apply Content Microcopy UX references for action labels, empty/error states, validation, onboarding, confirmations, status labels, and business tone.`,
    `Use visual QA level: ${visualQualityGovernance.level}; apply Visual Quality Governance rubric before visual approval.`,
    "Use the UI Execution Kit: UI_CONTRACT, COLOR_SYSTEM, ICON_MAP, BUTTON_PRESETS, COMPONENT_MAP, MOTION_MICROINTERACTIONS, and UI_REVIEW.",
    "Include loading, empty, error, success, disabled, and validation states where data or forms exist.",
    "Apply creative variation from product answers so similar apps do not produce identical UI.",
    "Do not add unapproved UI libraries or raw colors."
  ];
  if (rtlArabicUi && rtlArabicUi.enabled) {
    lines.splice(11, 0, "Apply RTL Arabic UI references: RTL_ARABIC_UI_CONTRACT, ARABIC_TYPOGRAPHY, RTL_LAYOUT_PATTERNS, RTL_COMPONENT_RULES, ARABIC_FORMS_TABLES, RTL_ACCESSIBILITY, and RTL_REVIEW_CHECKLIST.");
  }
  return lines.join("\n");
}

function inferColorPalettePresets(product, patternKey) {
  const text = `${product.key || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  const presets = [];
  if (/erp|crm|inventory|wms|helpdesk|hr|bi|admin/.test(text) || patternKey === "data_heavy_web_app") presets.push("enterprise_neutral");
  if (/ecommerce|commerce|marketplace|loyalty|booking/.test(text) || patternKey === "commerce_storefront") presets.push("commerce_energy");
  if (/medical|clinic|dental|health|wellness/.test(text)) presets.push("clinical_trust");
  if (/billing|accounting|finance|fintech/.test(text)) presets.push("finance_precision");
  if (/blog|news|content|knowledge|documentation/.test(text) || patternKey === "seo_content_site") presets.push("content_editorial");
  if (/restaurant|pos|food/.test(text) || patternKey === "pos_operations") presets.push("restaurant_warmth");
  if (/governance|ai|cost|security/.test(text)) presets.push("dark_governance");
  presets.push("saas_calm", "arabic_corporate");
  return uniqueList(presets).slice(0, 4);
}

function inferCreativeVariationAxes(product, patternKey) {
  const axes = ["palette_preset", "density", "navigation_pattern", "surface_style", "microcopy_tone", "motion_level"];
  if (patternKey === "data_heavy_web_app") axes.push("dashboard_hierarchy", "table_density", "role_visibility");
  if (patternKey === "commerce_storefront") axes.push("product_card_style", "checkout_rhythm", "trust_signal_style");
  if (patternKey === "seo_content_site") axes.push("editorial_rhythm", "content_block_style", "heading_tone");
  if (patternKey === "pos_operations") axes.push("touch_target_scale", "operator_flow_priority", "offline_status_treatment");
  if (patternKey === "mobile_app") axes.push("navigation_depth", "gesture_pattern", "offline_empty_state_tone");
  if ((product.channels || []).some((item) => String(item).includes("admin"))) axes.push("admin_shell_style");
  return uniqueList(axes);
}

function buildUiDesignReview(target, flags = {}) {
  const text = [target, flags.notes || ""].join(" ").toLowerCase();
  const findings = [];
  const required = [
    ["tokens", "Design tokens not mentioned."],
    ["responsive", "Responsive behavior not mentioned."],
    ["accessibility", "Accessibility not mentioned."],
    ["keyboard", "Keyboard behavior not mentioned."],
    ["focus", "Focus behavior not mentioned."],
    ["loading", "Loading state not mentioned."],
    ["empty", "Empty state not mentioned."],
    ["error", "Error state not mentioned."],
    ["color", "Color palette or token usage not mentioned."],
    ["icon", "Icon rules or action icon usage not mentioned."],
    ["business", "Business UI pattern not mentioned."],
    ["flow", "User flow not mentioned."],
    ["composition", "Screen composition ID not mentioned."],
    ["adapter", "Framework adapter not mentioned."],
    ["variant", "Creative variant ID not mentioned."],
    ["motion", "Motion level or reduced-motion policy not mentioned."],
    ["performance", "Performance or Core Web Vitals not mentioned."],
    ["lcp", "LCP risk or primary content loading not mentioned."],
    ["cls", "CLS/layout stability not mentioned."],
    ["inp", "INP/interaction responsiveness not mentioned."],
    ["copy", "Content or microcopy rules not mentioned."],
    ["creative", "Creative variation profile not mentioned."]
  ];
  for (const [needle, finding] of required) {
    if (!text.includes(needle)) findings.push(finding);
  }
  if (/seo|news|blog|article|product|landing/.test(text)) {
    if (!text.includes("schema") && !text.includes("structured data")) findings.push("SEO/GEO surface does not mention structured data.");
    if (!text.includes("semantic")) findings.push("SEO/GEO surface does not mention semantic HTML.");
    if (!text.includes("breadcrumb")) findings.push("SEO/GEO surface does not mention breadcrumbs.");
    if (!text.includes("image") && !text.includes("media")) findings.push("Public/SEO UI does not mention image or media optimization.");
    if (!text.includes("font")) findings.push("Public/SEO UI does not mention font loading or font performance.");
  }
  if (/dashboard|erp|crm|table|admin/.test(text)) {
    if (!text.includes("filter")) findings.push("Dashboard/data-heavy UI does not mention filters.");
    if (!text.includes("pagination") && !text.includes("virtual")) findings.push("Dashboard/data-heavy UI does not mention pagination or virtualization.");
    if (!text.includes("table header") && !text.includes("aria-sort") && !text.includes("row context")) findings.push("Data-heavy UI does not mention accessible table headers, sorting, or row context.");
    if (!text.includes("virtual") && !text.includes("pagination")) findings.push("Data-heavy UI does not mention pagination or virtualization for performance.");
    if (!text.includes("debounce")) findings.push("Data-heavy UI does not mention debounced search or filters.");
  }
  if (/form|checkout|login|signup|settings|profile|input/.test(text)) {
    if (!text.includes("label")) findings.push("Form UI does not mention visible labels.");
    if (!text.includes("validation") && !text.includes("error")) findings.push("Form UI does not mention validation or recoverable errors.");
    if (!text.includes("helper") && !text.includes("hint")) findings.push("Form UI does not mention helper text or format guidance.");
  }
  if (/modal|dialog|drawer|popover|dropdown/.test(text)) {
    if (!text.includes("restore focus") && !text.includes("focus trap") && !text.includes("escape")) findings.push("Overlay UI does not mention focus management or Escape behavior.");
  }
  if (/image|media|hero|gallery|product|property|article/.test(text)) {
    if (!text.includes("width") && !text.includes("height") && !text.includes("aspect")) findings.push("Media-heavy UI does not mention stable image dimensions or aspect ratios.");
  }
  if (/empty|no data|no results/.test(text) && !/next action|create|reset|clear filters|retry/.test(text)) {
    findings.push("Empty/no-results state does not mention a next action.");
  }
  if (/something went wrong|error/.test(text) && !/retry|recover|fix|check|try again|support/.test(text)) {
    findings.push("Error state does not mention recovery.");
  }
  if (/delete|remove|archive|reject/.test(text) && !/consequence|cannot be undone|undo|confirm|object|record/.test(text)) {
    findings.push("Destructive action copy does not mention consequence or affected object.");
  }
  const hasArabicOrRtlContext = includesArabicText(text) || /\brtl\b|arabic|bilingual|mena|العربية|عربي/.test(text) || isTruthyFlag(flags.rtl) || isTruthyFlag(flags.arabic);
  if (hasArabicOrRtlContext) {
    if (!/\brtl\b|dir=|direction|arabic|العربية|عربي/.test(text)) findings.push("Arabic/RTL UI does not mention direction handling.");
    if (!/typography|font|خط|الخط/.test(text)) findings.push("Arabic/RTL UI does not mention Arabic typography.");
    if (!/number|date|table|form|رقم|تاريخ|جدول|نموذج/.test(text)) findings.push("Arabic/RTL UI does not mention forms, tables, numbers, or dates.");
  }
  return {
    review_id: `ui-review-${Date.now()}`,
    created_at: new Date().toISOString(),
    target,
    status: findings.length ? "needs_attention" : "pass",
    findings,
    checked_rules: ["tokens", "colors", "icons", "responsive", "accessibility", "keyboard", "focus", "semantic_html", "forms_errors", "tables_data", "dialogs_overlays", "performance", "core_web_vitals", "lcp", "inp", "cls", "asset_weight", "data_rendering", "content_microcopy", "action_labels", "empty_error_copy", "validation_copy", "business_tone", "states", "business_pattern", "user_flow", "component_composition", "framework_adapter", "creative_variant", "motion", "creative_variation", "visual_quality_governance", "rtl_arabic_ui", "seo_geo", "dashboard_ergonomics"]
  };
}

function renderUiDesignRecommendation(recommendation) {
  console.log(`UI design recommendation: ${recommendation.recommendation_id}`);
  console.log(`Blueprint: ${recommendation.blueprint_name} (${recommendation.blueprint_key})`);
  console.log(table(["Surface", "Items"], [
    ["Pattern", recommendation.experience_pattern],
    ["Stacks", recommendation.recommended_stacks.join(", ")],
    ["Approved UI libraries", (recommendation.approved_ui_libraries || []).map((library) => `${library.name} ${library.version}`).join(", ")],
    ["Component groups", (recommendation.component_groups || []).join(", ")],
    ["Business pattern", recommendation.business_ui_pattern ? recommendation.business_ui_pattern.key : ""],
    ["Project playbook", recommendation.project_ui_playbook ? `${recommendation.project_ui_playbook.variant_archetype} / ${recommendation.project_ui_playbook.composition_id}` : ""],
    ["Template pack", recommendation.template_pack ? recommendation.template_pack.pattern : ""],
    ["Design references", (recommendation.design_references || []).map((item) => item.split("/").pop()).slice(0, 5).join(", ")],
    ["Recommended templates", (recommendation.recommended_templates || []).map((item) => item.template_id).join(", ")],
    ["Dashboard style", recommendation.recommended_dashboard_style || ""],
    ["Theme tokens", recommendation.theme_token_intelligence ? recommendation.theme_token_intelligence.level : ""],
    ["Composition", recommendation.component_composition_intelligence ? recommendation.component_composition_intelligence.composition_id : ""],
    ["Framework adapter", recommendation.framework_adapter_intelligence ? recommendation.framework_adapter_intelligence.adapter_key : ""],
    ["UI decision", recommendation.ui_decision_intake ? recommendation.ui_decision_intake.selected_variant_id : ""],
    ["Creative variants", recommendation.creative_variant_intelligence ? (recommendation.creative_variant_intelligence.variants || []).map((item) => item.variant_id).join(", ") : ""],
    ["UI flows", (recommendation.ui_flows || []).map((item) => item.split("/").pop()).join(", ")],
    ["Motion", recommendation.motion_system ? recommendation.motion_system.level : ""],
    ["Accessibility", recommendation.accessibility_inclusive_ui ? recommendation.accessibility_inclusive_ui.level : ""],
    ["Performance", recommendation.performance_web_vitals_ui ? recommendation.performance_web_vitals_ui.level : ""],
    ["Content", recommendation.content_microcopy_ux ? recommendation.content_microcopy_ux.level : ""],
    ["Visual QA", recommendation.visual_quality_governance ? recommendation.visual_quality_governance.level : ""],
    ["RTL/Arabic UI", recommendation.rtl_arabic_ui && recommendation.rtl_arabic_ui.enabled ? "enabled" : "not required"],
    ["Palette presets", (recommendation.color_palette_presets || []).join(", ")],
    ["Creative axes", (recommendation.creative_variation_axes || []).slice(0, 8).join(", ")],
    ["Components", recommendation.components.slice(0, 24).join(", ")],
    ["Page templates", recommendation.page_templates.slice(0, 18).join(", ")],
    ["SEO/GEO", recommendation.seo_geo.join(", ")]
  ]));
}

function getDesignSource(data, id) {
  const item = (data.sources || []).find((source) => source.id === id);
  if (!item) throw new Error(`Design source not found: ${id}`);
  return item;
}

function normalizeDesignSourceType(value) {
  if (!value) return "";
  const normalized = String(value).trim().toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["figma", "pdf", "image", "screenshot", "google_drive_file", "adobe_xd", "sketch", "penpot", "canva", "framer", "webflow", "reference_website", "wireframe", "hand_drawn_sketch", "text_brief", "other"]);
  if (!allowed.has(normalized)) throw new Error(`Invalid design source type: ${value}`);
  return normalized;
}

function normalizeExtractionMode(value) {
  const normalized = String(value || "manual").trim().toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["manual", "assisted", "automated_future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid extraction mode. Use manual, assisted, or automated_future.");
  return normalized;
}

function getDesignTextSpec(data, id) {
  const item = (data.specs || []).find((spec) => spec.id === id);
  if (!item) throw new Error(`Design text spec not found: ${id}`);
  return item;
}

function getDesignPageSpec(data, id) {
  const item = (data.pages || []).find((page) => page.id === id);
  if (!item) throw new Error(`Design page spec not found: ${id}`);
  return item;
}

function getDesignComponentContract(data, id) {
  const item = (data.components || []).find((component) => component.id === id);
  if (!item) throw new Error(`Design component contract not found: ${id}`);
  return item;
}

function buildDesignTextSpecMarkdown(source, spec) {
  return `# Design Text Spec - ${spec.title}

## Status

${spec.status}

## Source

- Source ID: ${source.id}
- Source type: ${source.source_type}
- Snapshot: ${spec.snapshot_reference}
- Extraction mode: ${spec.extraction_mode}
- Original location: ${source.source_location}

## Scope

${spec.scope || "TBD"}

## Layout Structure

TBD. Describe sections, hierarchy, density, and responsive order.

## Content Requirements

TBD. List visible text, labels, imagery rules, and tone.

## Design Tokens

TBD. Link color, typography, spacing, radius, and motion tokens.

## Responsive Behavior

TBD. Define mobile, tablet, desktop, RTL, and LTR behavior.

## Component States

- loading: TBD
- empty: TBD
- error: TBD
- success: TBD
- disabled: TBD

## Data Requirements

TBD. Define required API/data fields, permissions, and empty data handling.

## Accessibility Notes

TBD. Define keyboard, focus, labels, contrast, motion, and screen reader requirements.

## Open Questions

${spec.open_questions.length > 0 ? spec.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

## Approval

- Status: ${spec.status}
- Approver:
- Approval date:
`;
}

function buildPageSpecMarkdown(spec, page) {
  return `# Page Spec - ${page.page_name}

## Page ID

${page.id}

## Source References

- Design source: ${page.source_id}
- Approved text spec: ${spec.output_path}
- Text spec ID: ${page.text_spec_id}

## Purpose

${page.purpose || "TBD"}

## Audience

${page.audience || "TBD"}

## Layout

TBD. Describe sections, order, density, and hierarchy.

## Data Requirements

TBD. Inputs, API data, states, permissions, and empty data rules.

## Required States

${page.required_states.map((state) => `- ${state}: TBD`).join("\n")}

## Responsive Behavior

TBD. Mobile, tablet, desktop, and RTL/LTR notes.

## Accessibility

TBD. Keyboard, focus, labels, contrast, motion, and screen reader notes.

## Acceptance Criteria

- Page follows the approved text spec.
- Required states are represented.
- Responsive behavior is reviewed.
- Accessibility requirements are reviewed.

## Approval

- Status: ${page.status}
- Approver:
- Approval date:
`;
}

function buildComponentContractMarkdown(page, component) {
  return `# Component Contract - ${component.component_name}

## Component ID

${component.id}

## Source References

- Design source: ${component.source_id}
- Page spec: ${page.output_path}
- Page spec ID: ${component.page_spec_id}
- Text spec ID: ${component.text_spec_id}

## Purpose

TBD. What the component is for.

## Variants

${component.variants.map((variant) => `- ${variant}`).join("\n")}

## States

${component.states.map((state) => `- ${state}: TBD`).join("\n")}

## Props / Inputs

TBD. Expected data, labels, icons, callbacks, and constraints.

## Design Tokens

TBD. Colors, typography, spacing, radius, shadows, and breakpoints.

## Accessibility

TBD. ARIA labels, keyboard behavior, focus order, contrast, and reduced motion.

## Forbidden Variations

TBD. Styles or behaviors the component must not introduce.

## Acceptance Criteria

- Component follows the approved page spec.
- All required states are represented.
- Props and data constraints are clear.
- Accessibility behavior is reviewable.

## Approval

- Status: ${component.status}
- Approver:
- Approval date:
`;
}

function buildDesignAudit(sources) {
  const pagesData = fileExists(".kabeeri/design_sources/page_specs.json") ? readJsonFile(".kabeeri/design_sources/page_specs.json") : { pages: [] };
  const componentsData = fileExists(".kabeeri/design_sources/component_contracts.json") ? readJsonFile(".kabeeri/design_sources/component_contracts.json") : { components: [] };
  const visualData = fileExists(".kabeeri/design_sources/visual_reviews.json") ? readJsonFile(".kabeeri/design_sources/visual_reviews.json") : { reviews: [] };
  const blockers = [];
  const warnings = [];
  for (const source of sources) {
    if (!source.snapshot_reference) blockers.push(`${source.id}: snapshot is missing.`);
    if (source.approval_status !== "approved") blockers.push(`${source.id}: design source is not approved.`);
    if (!source.approved_text_spec) blockers.push(`${source.id}: approved text spec is missing.`);
    if (!source.design_tokens) warnings.push(`${source.id}: design tokens are not linked.`);
    if ((source.missing_information || []).length > 0) warnings.push(`${source.id}: missing information remains: ${source.missing_information.join(", ")}.`);
    if (source.source_type === "reference_website") warnings.push(`${source.id}: reference website is inspiration only and must not be copied.`);
    const approvedPages = (pagesData.pages || []).filter((page) => page.source_id === source.id && page.status === "approved");
    if (source.approval_status === "approved" && approvedPages.length === 0) warnings.push(`${source.id}: no approved page spec is linked yet.`);
    const approvedComponents = (componentsData.components || []).filter((component) => component.source_id === source.id && component.status === "approved");
    if (approvedPages.length > 0 && approvedComponents.length === 0) warnings.push(`${source.id}: no approved component contracts are linked yet.`);
    const passingVisualReviews = (visualData.reviews || []).filter((review) => review.source_id === source.id && review.decision === "pass");
    if (approvedPages.length > 0 && passingVisualReviews.length === 0) warnings.push(`${source.id}: no passing visual review has been recorded yet.`);
  }
  return {
    report_id: `design-audit-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source_ids: sources.map((source) => source.id),
    status: blockers.length === 0 ? "pass" : "blocked",
    blockers,
    warnings,
    rule: "Frontend implementation is blocked until every raw design source has a snapshot and approved text spec."
  };
}

function buildDesignGate(taskId, flags = {}) {
  const pagesData = fileExists(".kabeeri/design_sources/page_specs.json") ? readJsonFile(".kabeeri/design_sources/page_specs.json") : { pages: [] };
  const componentsData = fileExists(".kabeeri/design_sources/component_contracts.json") ? readJsonFile(".kabeeri/design_sources/component_contracts.json") : { components: [] };
  const reviewsData = fileExists(".kabeeri/design_sources/visual_reviews.json") ? readJsonFile(".kabeeri/design_sources/visual_reviews.json") : { reviews: [] };
  const pageId = flags.page || flags["page-spec"];
  const blockers = [];
  const warnings = [];
  const taskItem = taskId ? getTaskById(taskId) : null;
  const frontendStreams = new Set(["public_frontend", "admin_frontend", "user_frontend", "internal_operations_frontend"]);
  const taskNeedsDesign = taskItem ? taskWorkstreams(taskItem).some((stream) => frontendStreams.has(stream)) : true;
  if (!taskNeedsDesign && !pageId) warnings.push(`${taskId}: task is not in a known frontend workstream.`);
  if (!pageId) blockers.push("page spec is required. Use --page page-spec-001.");
  const page = pageId ? (pagesData.pages || []).find((item) => item.id === pageId) : null;
  if (pageId && !page) blockers.push(`page spec not found: ${pageId}`);
  if (page && page.status !== "approved") blockers.push(`${pageId}: page spec is not approved.`);
  if (page) {
    const approvedComponents = (componentsData.components || []).filter((component) => component.page_spec_id === page.id && component.status === "approved");
    if (!approvedComponents.length) warnings.push(`${page.id}: no approved component contract is linked.`);
  }
  const matchingReviews = (reviewsData.reviews || []).filter((review) => {
    if (pageId && review.page_spec_id !== pageId) return false;
    if (taskId && review.task_id && review.task_id !== taskId) return false;
    return review.decision === "pass";
  });
  if (!matchingReviews.length) blockers.push("passing visual review is missing.");
  const weakReview = matchingReviews.find((review) => review.quality_score && review.quality_score.percent < 75);
  if (weakReview) warnings.push(`${weakReview.review_id}: visual quality score is below 75%.`);
  return {
    gate_id: `design-gate-${Date.now()}`,
    evaluated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : "pass",
    task_id: taskId || null,
    page_spec_id: pageId || null,
    blockers,
    warnings,
    visual_review_ids: matchingReviews.map((review) => review.review_id)
  };
}

function getVisualQualityRubric() {
  return {
    version: "visual-quality-governance-v1",
    reference: "knowledge/design_system/visual_quality_governance/VISUAL_QUALITY_RUBRIC.md",
    thresholds: {
      high_confidence: 90,
      pass_with_notes: 75,
      needs_rework: 60,
      blocked: 0
    },
    categories: [
      { id: "visual_match", max_score: 2, evidence: ["visual-match", "design", "tokens", "component-contracts"] },
      { id: "layout_responsive", max_score: 2, evidence: ["responsive", "mobile", "desktop"] },
      { id: "states_feedback", max_score: 2, evidence: ["states", "loading", "empty", "error", "success", "validation", "disabled"] },
      { id: "accessibility", max_score: 2, evidence: ["accessibility", "contrast", "keyboard", "focus", "aria", "touch-targets"] },
      { id: "performance", max_score: 2, evidence: ["performance", "web-vitals", "lcp", "inp", "cls", "lazy-loading"] },
      { id: "content_microcopy", max_score: 2, evidence: ["content", "copy", "microcopy", "validation-copy", "empty-copy", "error-copy"] },
      { id: "motion_behavior", max_score: 2, evidence: ["motion", "animation", "reduced-motion", "transition"] },
      { id: "creative_fit", max_score: 2, evidence: ["creative", "variation", "palette", "density", "personality"] },
      { id: "rtl_arabic", max_score: 2, evidence: ["rtl", "arabic", "bilingual", "direction"] }
    ]
  };
}

function buildVisualQualityScore(review, page, flags = {}) {
  const rubric = getVisualQualityRubric();
  const checks = new Set((review.checks || []).map((item) => String(item).toLowerCase()));
  const viewports = new Set((review.viewport_checks || []).map((item) => String(item).toLowerCase()));
  const screenshots = (review.screenshots || []).map((item) => String(item).toLowerCase());
  const deviations = review.deviations || [];
  const notes = String(review.notes || flags.notes || "").toLowerCase();
  const allEvidenceText = [
    ...checks,
    ...viewports,
    ...screenshots,
    ...deviations.map((item) => String(item).toLowerCase()),
    notes,
    String(page && page.page_name || "").toLowerCase(),
    String(page && page.purpose || "").toLowerCase()
  ].join(" ");
  const rtlRequired = Boolean(flags.rtl || flags.arabic || flags.bilingual || /rtl|arabic|bilingual|mena/.test(allEvidenceText));
  const categoryScores = rubric.categories.map((category) => {
    if (category.id === "rtl_arabic" && !rtlRequired) {
      return {
        id: category.id,
        score: 0,
        max_score: 0,
        status: "not_applicable",
        message: "RTL/Arabic review is not required for this visual review."
      };
    }
    let score = 0;
    if (category.evidence.some((item) => checks.has(item) || allEvidenceText.includes(item))) score = 2;
    if (category.id === "layout_responsive") {
      const hasMobile = viewports.has("mobile") || screenshots.some((item) => item.includes("mobile"));
      const hasDesktop = viewports.has("desktop") || screenshots.some((item) => item.includes("desktop"));
      score = hasMobile && hasDesktop && checks.has("responsive") ? 2 : hasMobile || hasDesktop || checks.has("responsive") ? 1 : 0;
    }
    if (category.id === "states_feedback") {
      const requiredStates = Array.isArray(page && page.required_states) ? page.required_states.map((item) => String(item).toLowerCase()) : [];
      const matchedStates = requiredStates.filter((state) => checks.has(state) || allEvidenceText.includes(state));
      if (requiredStates.length && matchedStates.length === requiredStates.length) score = 2;
      else if (requiredStates.length && matchedStates.length > 0) score = Math.max(score, 1);
    }
    if (category.id === "visual_match" && deviations.length && score === 2) score = 1;
    return {
      id: category.id,
      score,
      max_score: category.max_score,
      status: score === category.max_score ? "pass" : score > 0 ? "partial" : "missing",
      message: score === category.max_score ? "Evidence recorded." : "Add targeted evidence or fix this category."
    };
  });
  const maxScore = categoryScores.reduce((sum, item) => sum + item.max_score, 0);
  const score = categoryScores.reduce((sum, item) => sum + item.score, 0);
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 100;
  const status = review.decision === "blocked" || percent < 60 ? "blocked" : percent < 75 ? "needs_rework" : "pass";
  return {
    rubric_version: rubric.version,
    reference: rubric.reference,
    score,
    max_score: maxScore,
    percent,
    status,
    category_scores: categoryScores,
    missing_categories: categoryScores.filter((item) => item.max_score > 0 && item.score === 0).map((item) => item.id),
    rule: "Use the missing categories for targeted fixes instead of broad redesign prompts."
  };
}

function buildDesignGovernanceReport(flags = {}) {
  const sources = readStateArray(".kabeeri/design_sources/sources.json", "sources");
  const specs = readStateArray(".kabeeri/design_sources/text_specs.json", "specs");
  const pages = readStateArray(".kabeeri/design_sources/page_specs.json", "pages");
  const components = readStateArray(".kabeeri/design_sources/component_contracts.json", "components");
  const missingReports = readStateArray(".kabeeri/design_sources/missing_reports.json", "reports");
  const visualReviews = readStateArray(".kabeeri/design_sources/visual_reviews.json", "reviews");
  const advisor = fileExists(".kabeeri/design_sources/ui_advisor.json") ? readJsonFile(".kabeeri/design_sources/ui_advisor.json") : { recommendations: [], reviews: [] };
  const references = fileExists(".kabeeri/design_sources/ui_ux_reference.json") ? readJsonFile(".kabeeri/design_sources/ui_ux_reference.json") : { selections: [], generated_tasks: [] };
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const blockers = [];
  const warnings = [];
  const checks = [];
  const push = (id, status, message, weight = 1) => checks.push({ id, status, message, weight });
  const approvedSources = sources.filter((item) => item.approval_status === "approved");
  const approvedSpecs = specs.filter((item) => item.status === "approved");
  const approvedPages = pages.filter((item) => item.status === "approved");
  const approvedComponents = components.filter((item) => item.status === "approved");
  const passingReviews = visualReviews.filter((item) => item.decision === "pass");
  const scoredVisualReviews = visualReviews.filter((item) => item.quality_score && typeof item.quality_score.percent === "number");
  const averageVisualQuality = scoredVisualReviews.length
    ? Math.round(scoredVisualReviews.reduce((sum, item) => sum + item.quality_score.percent, 0) / scoredVisualReviews.length)
    : null;
  const openMissingReports = missingReports.filter((item) => item.status !== "closed");
  const frontendTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).some((stream) => ["public_frontend", "admin_frontend", "user_frontend", "internal_operations_frontend"].includes(stream)));

  for (const source of sources) {
    if (!source.snapshot_reference) blockers.push(`${source.id}: snapshot is missing.`);
    if (source.approval_status !== "approved") blockers.push(`${source.id}: source is not approved.`);
    if (source.approval_status === "approved" && !source.approved_text_spec) blockers.push(`${source.id}: approved text spec is missing.`);
    if (source.approval_status === "approved" && !source.design_tokens) warnings.push(`${source.id}: design tokens are not linked.`);
    if (source.source_type === "reference_website") warnings.push(`${source.id}: reference website must remain inspiration only; do not copy layout, text, or assets.`);
  }

  for (const spec of approvedSpecs) {
    if (!pages.some((page) => page.text_spec_id === spec.id)) warnings.push(`${spec.id}: no page spec has been created from this approved text spec.`);
  }

  for (const page of approvedPages) {
    const pageComponents = approvedComponents.filter((component) => component.page_spec_id === page.id);
    if (!pageComponents.length) warnings.push(`${page.id}: approved page has no approved component contract.`);
    const pageReviews = passingReviews.filter((review) => review.page_spec_id === page.id);
    if (!pageReviews.length) warnings.push(`${page.id}: approved page has no passing visual review.`);
    const requiredStates = page.required_states || [];
    for (const required of ["loading", "empty", "error"]) {
      if (!requiredStates.includes(required)) warnings.push(`${page.id}: required state missing from page spec: ${required}.`);
    }
  }

  for (const review of visualReviews) {
    if (!(review.screenshots || []).length) blockers.push(`${review.review_id}: screenshot evidence is missing.`);
    const checksList = review.checks || [];
    if (!checksList.includes("accessibility") && !checksList.includes("contrast")) warnings.push(`${review.review_id}: accessibility or contrast check is missing.`);
    if (!checksList.includes("responsive")) warnings.push(`${review.review_id}: responsive check is missing.`);
    for (const qualityCheck of ["performance", "content", "motion", "creative"]) {
      if (!checksList.includes(qualityCheck)) warnings.push(`${review.review_id}: ${qualityCheck} visual QA check is missing.`);
    }
    if (!review.quality_score) warnings.push(`${review.review_id}: visual quality rubric score is missing.`);
    if (review.quality_score && review.quality_score.percent < 75) warnings.push(`${review.review_id}: visual quality score is ${review.quality_score.percent}%, below 75%.`);
    const viewports = review.viewport_checks || [];
    if (!viewports.includes("mobile") || !viewports.includes("desktop")) warnings.push(`${review.review_id}: mobile and desktop viewport evidence should both be present.`);
  }

  if (sources.length && !approvedSources.length) blockers.push("No approved design source exists.");
  if (sources.length && !approvedSpecs.length) blockers.push("No approved design text spec exists.");
  if (approvedSpecs.length && !approvedPages.length) warnings.push("Approved text specs exist, but no approved page specs exist.");
  if (approvedPages.length && !approvedComponents.length) warnings.push("Approved pages exist, but no approved component contracts exist.");
  if (frontendTasks.length && !approvedPages.length) warnings.push("Frontend tasks exist without approved page specs.");
  if (frontendTasks.length && !passingReviews.length) warnings.push("Frontend tasks exist without passing visual review evidence.");
  if (!(advisor.recommendations || []).length) warnings.push("No UI/UX Advisor recommendation has been recorded.");
  if (!(references.selections || []).length) warnings.push("No UI/UX reference pattern selection has been recorded.");
  if (openMissingReports.length) warnings.push(`${openMissingReports.length} missing design report(s) remain open.`);

  push("source_snapshot", sources.length === 0 || sources.every((item) => item.snapshot_reference), "Every design source has a frozen snapshot before extraction.", 2);
  push("approved_text_specs", sources.length === 0 || approvedSpecs.length > 0, "Approved text specs exist before frontend implementation.", 2);
  push("design_tokens", approvedSources.length === 0 || approvedSources.every((item) => item.design_tokens), "Approved sources link design tokens.");
  push("page_specs", approvedSpecs.length === 0 || approvedPages.length > 0, "Approved text specs have approved page specs.", 2);
  push("component_contracts", approvedPages.length === 0 || approvedComponents.length > 0, "Approved pages have approved component contracts.");
  push("visual_reviews", approvedPages.length === 0 || passingReviews.length > 0, "Approved pages have passing visual review evidence.", 2);
  push("visual_evidence_quality", visualReviews.every((item) => (item.screenshots || []).length && (item.viewport_checks || []).includes("mobile") && (item.viewport_checks || []).includes("desktop")), "Visual reviews include screenshot and mobile/desktop evidence.");
  push("visual_quality_rubric", visualReviews.length === 0 || visualReviews.every((item) => item.quality_score && item.quality_score.percent >= 75), "Visual reviews include rubric scores at or above the pass-with-notes threshold.", 2);
  push("visual_qa_coverage", visualReviews.every((item) => ["responsive", "states", "accessibility", "performance", "content", "motion", "creative"].every((check) => (item.checks || []).includes(check))), "Visual reviews cover responsive, states, accessibility, performance, content, motion, and creative quality.");
  push("accessibility_checks", visualReviews.every((item) => (item.checks || []).includes("accessibility") || (item.checks || []).includes("contrast")), "Visual reviews include accessibility or contrast checks.");
  push("missing_design_closed", openMissingReports.length === 0, "Missing design reports are closed or intentionally resolved.");
  push("advisor_context", (advisor.recommendations || []).length > 0 || !sources.length, "UI/UX Advisor context is recorded when design work exists.");

  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
  const score = checks.filter((check) => check.status).reduce((sum, check) => sum + check.weight, 0);
  return {
    report_id: `design-governance-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "needs_attention" : "pass",
    score,
    max_score: maxScore,
    summary: {
      sources_total: sources.length,
      approved_sources: approvedSources.length,
      approved_text_specs: approvedSpecs.length,
      approved_page_specs: approvedPages.length,
      approved_component_contracts: approvedComponents.length,
      visual_reviews: visualReviews.length,
      passing_visual_reviews: passingReviews.length,
      scored_visual_reviews: scoredVisualReviews.length,
      average_visual_quality_percent: averageVisualQuality,
      open_missing_reports: openMissingReports.length,
      frontend_tasks: frontendTasks.length,
      ui_advisor_recommendations: (advisor.recommendations || []).length,
      ui_ux_reference_selections: (references.selections || []).length
    },
    blockers,
    warnings,
    checks,
    next_actions: buildDesignGovernanceNextActions(blockers, warnings),
    governance_rules: [
      "Raw visual sources are evidence, not implementation specs.",
      "Frontend implementation should start from approved text specs, page specs, component contracts, and design tokens.",
      "Reference websites are inspiration only and must not be copied.",
      "Visual acceptance requires screenshot evidence, responsive checks, accessibility/contrast checks, and recorded deviations.",
      "Visual QA should use the scored rubric to create targeted fixes instead of broad redesign prompts.",
      "Owner/client verification should happen after design gate and task acceptance evidence."
    ]
  };
}

function buildDesignGovernanceNextActions(blockers, warnings) {
  const actions = [];
  const text = `${blockers.join(" ")} ${warnings.join(" ")}`.toLowerCase();
  if (text.includes("snapshot")) actions.push("Run `kvdf design snapshot <source-id>` for each raw design source.");
  if (text.includes("text spec")) actions.push("Create and approve text specs with `kvdf design spec-create` then `kvdf design spec-approve`.");
  if (text.includes("design tokens")) actions.push("Attach design tokens during `kvdf design spec-approve --tokens <path>` or source approval.");
  if (text.includes("page spec")) actions.push("Create and approve page specs with `kvdf design page-create` and `kvdf design page-approve`.");
  if (text.includes("component")) actions.push("Create and approve component contracts for repeated UI with `kvdf design component-create`.");
  if (text.includes("visual review") || text.includes("screenshot")) actions.push("Record visual evidence with `kvdf design visual-review --screenshots desktop.png,mobile.png`.");
  if (text.includes("visual quality") || text.includes("visual qa")) actions.push("Apply `knowledge/design_system/visual_quality_governance/VISUAL_QUALITY_RUBRIC.md` and rerun `kvdf design visual-review` with targeted checks.");
  if (text.includes("performance") || text.includes("content") || text.includes("motion") || text.includes("creative")) actions.push("Add missing visual QA checks: responsive, states, accessibility, performance, content, motion, and creative.");
  if (text.includes("accessibility") || text.includes("contrast")) actions.push("Include accessibility and contrast checks in visual reviews.");
  if (text.includes("advisor")) actions.push("Run `kvdf design recommend <blueprint>` before major UI work.");
  if (text.includes("reference")) actions.push("Run `kvdf design reference-recommend \"<brief>\"` and treat matches as inspiration only.");
  if (!actions.length) actions.push("Continue with governed frontend implementation and run `kvdf design gate` before Owner verification.");
  return uniqueList(actions);
}

function buildDesignGovernanceMarkdown(report) {
  const lines = [
    `# Design Governance Report - ${report.report_id}`,
    "",
    `- Status: ${report.status}`,
    `- Score: ${report.score}/${report.max_score}`,
    `- Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    ...Object.entries(report.summary).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["- None."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["- None."]),
    "",
    "## Checks",
    "",
    "| Check | Status | Message |",
    "| --- | --- | --- |",
    ...report.checks.map((check) => `| ${check.id} | ${check.status ? "pass" : "fail"} | ${check.message} |`),
    "",
    "## Next Actions",
    "",
    ...report.next_actions.map((item) => `- ${item}`),
    "",
    "## Governance Rules",
    "",
    ...report.governance_rules.map((item) => `- ${item}`)
  ];
  return `${lines.join("\n")}\n`;
}

function policy(action, value, flags = {}) {
  ensureWorkspace();
  ensurePolicyState();

  if (!action || action === "list") {
    const policies = listPolicyFiles().map((file) => readJsonFile(file));
    console.log(table(["Policy", "Version", "Subject", "Checks"], policies.map((item) => [
      item.policy_id,
      item.version || "",
      item.subject_type || "",
      (item.required_checks || []).length
    ])));
    return;
  }

  if (action === "show") {
    const policyId = flags.id || value || "task_verification_policy";
    console.log(JSON.stringify(getPolicyDefinition(policyId), null, 2));
    return;
  }

  if (action === "evaluate" || action === "gate") {
    const valueLooksLikePolicy = value && String(value).endsWith("_policy");
    const policyId = flags.policy || flags.id || (valueLooksLikePolicy ? value : null) || policyIdForScope(flags.scope || (flags.task || value ? "task" : ""));
    const result = evaluatePolicy(policyId, {
      taskId: flags.task || (valueLooksLikePolicy ? null : value),
      planId: flags.plan,
      version: flags.version || value,
      audience: flags.audience,
      scope: flags.scope,
      stage: flags.stage || (action === "gate" ? "gate" : "evaluate"),
      actor: getEffectiveActor(flags) || flags.owner || flags.actor || ""
    });
    savePolicyResult(result);
    appendAudit(`policy.${action}`, "policy", result.policy_id, `Policy ${action}: ${result.status}`);

    if (action === "gate" && result.status === "blocked") {
      if (flags.override === "true" || flags.override === true) {
        applyPolicyOverride(result, flags);
        console.log(`Policy gate overridden for ${result.subject_id}`);
        return;
      }
      throw new Error(`Policy gate blocked: ${result.blockers.map((item) => item.check_id).join(", ")}`);
    }

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "status") {
    const latest = latestPolicyResults();
    if (flags.json) {
      console.log(JSON.stringify({ results: latest }, null, 2));
      return;
    }
    console.log(table(["Policy", "Subject", "Stage", "Status", "Blockers", "Evaluated"], latest.map((item) => [
      item.policy_id,
      item.subject_id,
      item.stage || "",
      item.status,
      (item.blockers || []).map((blocker) => blocker.check_id).join(", ") || "-",
      item.evaluated_at || ""
    ])));
    return;
  }

  if (action === "report") {
    const results = readJsonFile(".kabeeri/policies/policy_results.json").results || [];
    const output = flags.output || ".kabeeri/reports/policy_report.md";
    writeTextFile(output, buildPolicyReport(results));
    appendAudit("policy.report", "policy", "all", `Policy report written: ${output}`);
    console.log(`Wrote policy report: ${output}`);
    return;
  }

  throw new Error(`Unknown policy action: ${action}`);
}

function ensurePolicyState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "policies"), { recursive: true });
  if (!fileExists(".kabeeri/policies/policy_results.json")) writeJsonFile(".kabeeri/policies/policy_results.json", { results: [] });
  writeDefaultPolicy("task_verification_policy", {
      policy_id: "task_verification_policy",
      version: "1.0.0",
      subject_type: "task",
      required_checks: [
        { check_id: "source_reference_present", severity: "fail", description: "Task must include source provenance." },
        { check_id: "acceptance_criteria_present", severity: "fail", description: "Task must include acceptance criteria or an acceptance checklist." },
        { check_id: "owner_only_final_verify", severity: "fail", description: "Only the active Owner can final-verify the task." },
        { check_id: "output_contract_complete", severity: "fail", description: "AI Developer output must include summary, files changed, checks, risks, limitations, review needs, and next task." },
        { check_id: "access_token_revoked_after_verify", severity: "fail", description: "Task access token must be revoked or archived after Owner verification." },
        { check_id: "token_usage_recorded", severity: "warn", description: "AI token usage should be traceable by task, workstream, developer, provider, and model." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("release_policy", {
    policy_id: "release_policy",
    version: "1.0.0",
    subject_type: "release",
    required_checks: [
      { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed release publishing." },
      { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed release publishing." },
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings." },
      { check_id: "latest_migration_checks_not_blocked", severity: "fail", description: "Latest migration checks must not be blocked." },
      { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Latest governed policy results must not contain unresolved blockers." },
      { check_id: "owner_actor_for_confirmed_publish", severity: "fail", description: "Confirmed publish must be performed by an Owner actor." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("handoff_policy", {
    policy_id: "handoff_policy",
    version: "1.0.0",
    subject_type: "handoff",
    required_checks: [
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Client or Owner handoff must not include unresolved blocker security findings." },
      { check_id: "latest_policy_results_not_blocked", severity: "warn", description: "Handoff should call out unresolved policy blockers." },
      { check_id: "open_work_is_disclosed", severity: "warn", description: "Open tasks should be visible in the package roadmap and readiness reports." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("security_policy", {
    policy_id: "security_policy",
    version: "1.0.0",
    subject_type: "security",
    required_checks: [
      { check_id: "latest_security_scan_exists", severity: "warn", description: "Security governance should be based on a recorded scan." },
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have critical or high findings." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("migration_policy", {
    policy_id: "migration_policy",
    version: "1.0.0",
    subject_type: "migration",
    required_checks: [
      { check_id: "migration_plan_exists", severity: "fail", description: "A migration gate must target an existing migration plan." },
      { check_id: "rollback_plan_present", severity: "fail", description: "Migration must have a rollback plan." },
      { check_id: "backup_reference_present", severity: "fail", description: "Migration must record a backup reference." },
      { check_id: "latest_migration_check_not_blocked", severity: "fail", description: "Latest migration safety check for the plan must not be blocked." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("github_write_policy", {
    policy_id: "github_write_policy",
    version: "1.0.0",
    subject_type: "github_write",
    required_checks: [
      { check_id: "github_write_confirmation_present", severity: "fail", description: "GitHub writes must be explicitly confirmed." },
      { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed GitHub writes." },
      { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed GitHub writes." },
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings before GitHub writes." },
      { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Confirmed GitHub writes must not proceed with unresolved policy blockers." },
      { check_id: "owner_actor_for_github_write", severity: "fail", description: "Confirmed GitHub writes must be performed by an Owner actor." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
}

function writeDefaultPolicy(policyId, definition) {
  const file = `.kabeeri/policies/${policyId}.json`;
  if (!fileExists(file)) writeJsonFile(file, definition);
}

function listPolicyFiles() {
  return [
    ".kabeeri/policies/task_verification_policy.json",
    ".kabeeri/policies/release_policy.json",
    ".kabeeri/policies/handoff_policy.json",
    ".kabeeri/policies/security_policy.json",
    ".kabeeri/policies/migration_policy.json",
    ".kabeeri/policies/github_write_policy.json"
  ].filter((file) => fileExists(file));
}

function policyIdForScope(scope) {
  const normalized = String(scope || "").toLowerCase().replace(/-/g, "_");
  if (!normalized || normalized === "task" || normalized === "verify" || normalized === "verification") return "task_verification_policy";
  if (["release", "publish"].includes(normalized)) return "release_policy";
  if (["handoff", "delivery"].includes(normalized)) return "handoff_policy";
  if (normalized === "security") return "security_policy";
  if (["migration", "migrate"].includes(normalized)) return "migration_policy";
  if (["github", "github_write", "github-write", "remote_write", "remote-write"].includes(normalized)) return "github_write_policy";
  return normalized.endsWith("_policy") ? normalized : `${normalized}_policy`;
}

function getPolicyDefinition(policyId) {
  const file = `.kabeeri/policies/${policyId}.json`;
  if (!fileExists(file)) throw new Error(`Policy not found: ${policyId}`);
  return readJsonFile(file);
}

function evaluatePolicy(policyId, context) {
  const definition = getPolicyDefinition(policyId);
  if (policyId !== "task_verification_policy") return evaluateGovernancePolicy(definition, context);
  const taskId = context.taskId;
  if (!taskId) throw new Error("Missing --task.");
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  const checks = (definition.required_checks || []).map((check) => evaluateTaskPolicyCheck(check, taskItem, context));
  const blockers = checks.filter((check) => check.result === "fail" && check.severity === "fail");
  const warnings = checks.filter((check) => check.result === "warn" || (check.result === "fail" && check.severity === "warn"));
  return {
    result_id: `policy-result-${Date.now()}`,
    policy_id: definition.policy_id,
    policy_version: definition.version,
    subject_type: definition.subject_type,
    subject_id: taskId,
    stage: context.stage || "evaluate",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    evaluated_at: new Date().toISOString(),
    evaluated_by: context.actor || "local-cli",
    blockers,
    warnings,
    checks
  };
}

function evaluateGovernancePolicy(definition, context = {}) {
  const checks = (definition.required_checks || []).map((check) => evaluateGovernancePolicyCheck(definition, check, context));
  const blockers = checks.filter((check) => check.result === "fail" && check.severity === "fail");
  const warnings = checks.filter((check) => check.result === "warn" || (check.result === "fail" && check.severity === "warn"));
  const subjectId = policySubjectId(definition, context);
  return {
    result_id: `policy-result-${Date.now()}`,
    policy_id: definition.policy_id,
    policy_version: definition.version,
    subject_type: definition.subject_type,
    subject_id: subjectId,
    stage: context.stage || "evaluate",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    evaluated_at: new Date().toISOString(),
    evaluated_by: context.actor || "local-cli",
    blockers,
    warnings,
    checks
  };
}

function policySubjectId(definition, context) {
  if (definition.subject_type === "release") return context.version || "current-release";
  if (definition.subject_type === "handoff") return context.packageId || context.audience || "handoff";
  if (definition.subject_type === "migration") return context.planId || "migration";
  if (definition.subject_type === "security") return "latest-security-scan";
  if (definition.subject_type === "github_write") return context.operation || context.version || "github-write";
  return context.subjectId || definition.subject_type || definition.policy_id;
}

function evaluateGovernancePolicyCheck(definition, check, context) {
  const base = {
    check_id: check.check_id,
    severity: check.severity || "fail",
    description: check.description || ""
  };
  const pass = (evidence) => ({ ...base, result: "pass", evidence });
  const fail = (evidence) => ({ ...base, result: base.severity === "warn" ? "warn" : "fail", evidence });
  const warn = (evidence) => ({ ...base, result: "warn", evidence });

  if (check.check_id === "repository_validation_passes") {
    const validation = validateRepository("all");
    return validation.ok ? pass("kvdf validate all passed.") : fail(validation.lines.filter((line) => line.includes("missing") || line.includes("Invalid")).join(" | ") || "Repository validation failed.");
  }
  if (check.check_id === "latest_security_scan_exists") {
    const scan = getLatestSecurityScan();
    return scan ? pass(`${scan.scan_id}: ${scan.status}`) : fail("No security scan recorded. Run `kvdf security scan` first.");
  }
  if (check.check_id === "latest_security_scan_not_blocked") {
    const scan = getLatestSecurityScan();
    if (!scan) return warn("No security scan recorded yet.");
    return scan.status === "blocked" ? fail(`${scan.scan_id} has ${scan.blockers.length} blocker finding(s).`) : pass(`${scan.scan_id}: ${scan.status}`);
  }
  if (check.check_id === "latest_migration_checks_not_blocked") {
    const blocked = latestMigrationChecks().filter((item) => item.status === "blocked");
    return blocked.length ? fail(`${blocked.length} migration check(s) are blocked: ${blocked.map((item) => item.plan_id).join(", ")}`) : pass("No latest migration checks are blocked.");
  }
  if (check.check_id === "latest_policy_results_not_blocked") {
    const blocked = latestPolicyResults().filter((item) => item.status === "blocked" && item.policy_id !== definition.policy_id);
    return blocked.length ? fail(`${blocked.length} governed subject(s) have latest blocked policy results.`) : pass("No latest governed policy blockers found.");
  }
  if (check.check_id === "owner_actor_for_confirmed_publish") {
    if (!context.confirm) return pass("Not a confirmed publish operation.");
    const identity = getIdentity(context.actor);
    return identity && identity.role === "Owner" ? pass(`Owner actor=${context.actor}`) : fail("Confirmed publish has no Owner actor evidence.");
  }
  if (check.check_id === "github_write_confirmation_present") {
    return context.confirm ? pass(`Confirmed GitHub write: ${context.operation || "unknown"}`) : fail("Missing --confirm for GitHub write operation.");
  }
  if (check.check_id === "owner_actor_for_github_write") {
    const identity = getIdentity(context.actor);
    return identity && identity.role === "Owner" ? pass(`Owner actor=${context.actor}`) : fail("Confirmed GitHub write has no Owner actor evidence.");
  }
  if (check.check_id === "open_work_is_disclosed") {
    const openTasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
    return openTasks.length ? warn(`${openTasks.length} open task(s) will be disclosed in handoff reports.`) : pass("No open tasks recorded.");
  }
  if (check.check_id === "migration_plan_exists") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    return getMigrationPlan(context.planId) ? pass(`Migration plan exists: ${context.planId}`) : fail(`Migration plan not found: ${context.planId}`);
  }
  if (check.check_id === "rollback_plan_present") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const plan = getMigrationPlan(context.planId);
    return plan.rollback_plan_id ? pass(`Rollback plan: ${plan.rollback_plan_id}`) : fail(`Migration plan ${context.planId} has no rollback plan.`);
  }
  if (check.check_id === "backup_reference_present") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const plan = getMigrationPlan(context.planId);
    return plan.backup_reference ? pass(`Backup reference: ${plan.backup_reference}`) : fail(`Migration plan ${context.planId} has no backup reference.`);
  }
  if (check.check_id === "latest_migration_check_not_blocked") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const latest = latestMigrationChecks().find((item) => item.plan_id === context.planId);
    if (!latest) return fail(`No migration check recorded for ${context.planId}. Run kvdf migration check --plan ${context.planId}.`);
    return latest.status === "blocked" ? fail(`${latest.check_id} is blocked.`) : pass(`${latest.check_id}: ${latest.status}`);
  }
  return fail(`Unknown check: ${check.check_id}`);
}

function latestPolicyResults() {
  const results = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const latest = new Map();
  for (const item of results) {
    latest.set(`${item.policy_id}|${item.subject_type}|${item.subject_id}`, item);
  }
  return [...latest.values()];
}

function runPolicyGate(scope, context = {}, flags = {}) {
  if (flags["skip-policy-gate"] === true || flags["skip-policy-gate"] === "true") {
    appendAudit("policy.gate.skipped", "policy", scope, `Policy gate skipped for ${scope}`);
    return null;
  }
  ensurePolicyState();
  const result = evaluatePolicy(policyIdForScope(scope), {
    ...context,
    scope,
    stage: "gate",
    actor: getEffectiveActor(flags) || flags.owner || flags.actor || ""
  });
  savePolicyResult(result);
  appendAudit("policy.gate", "policy", result.policy_id, `Policy gate ${scope}: ${result.status}`);
  if (result.status === "blocked") {
    if (flags.override === "true" || flags.override === true) {
      applyPolicyOverride(result, flags);
      return result;
    }
    throw new Error(`Policy gate blocked: ${result.blockers.map((item) => item.check_id).join(", ")}`);
  }
  return result;
}

function previewPolicyGate(scope, context = {}, flags = {}) {
  ensurePolicyState();
  return evaluatePolicy(policyIdForScope(scope), {
    ...context,
    scope,
    stage: "gate",
    actor: getEffectiveActor(flags) || flags.owner || flags.actor || ""
  });
}

function evaluateTaskPolicyCheck(check, taskItem, context) {
  const base = {
    check_id: check.check_id,
    severity: check.severity || "fail",
    description: check.description || ""
  };
  const pass = (evidence) => ({ ...base, result: "pass", evidence });
  const fail = (evidence) => ({ ...base, result: base.severity === "warn" ? "warn" : "fail", evidence });

  if (check.check_id === "source_reference_present") {
    return taskItem.source || taskItem.provenance ? pass(`source=${taskItem.source || "provenance"}`) : fail("Task has no source or provenance field.");
  }
  if (check.check_id === "acceptance_criteria_present") {
    const records = readStateArray(".kabeeri/acceptance.json", "records").filter((item) => item.task_id === taskItem.id || item.task === taskItem.id);
    return (taskItem.acceptance_criteria || []).length > 0 || records.length > 0 ? pass("Acceptance evidence exists.") : fail("No task acceptance criteria or linked acceptance record.");
  }
  if (check.check_id === "owner_only_final_verify") {
    if (taskItem.status === "owner_verified") return taskItem.verified_by ? pass(`verified_by=${taskItem.verified_by}`) : fail("Task is verified but verified_by is missing.");
    return context.stage === "gate" && !context.actor ? fail("Gate requires an Owner actor for final verification.") : pass("Task is not final-verified yet.");
  }
  if (check.check_id === "output_contract_complete") {
    const sessions = readStateArray(".kabeeri/sessions.json", "sessions").filter((item) => item.task_id === taskItem.id && item.status === "completed");
    const complete = sessions.some((item) =>
      item.summary &&
      (item.files_touched || []).length > 0 &&
      (item.checks_run || []).length > 0 &&
      (item.risks || []).length > 0 &&
      (item.known_limitations || []).length > 0 &&
      item.needs_review &&
      item.next_suggested_task
    );
    return complete ? pass("At least one completed AI session has a complete output contract.") : fail("No completed AI session has the full output contract.");
  }
  if (check.check_id === "access_token_revoked_after_verify") {
    if (taskItem.status !== "owner_verified") return pass("Task is not owner-verified yet.");
    const active = readStateArray(".kabeeri/tokens.json", "tokens").filter((tokenItem) => tokenItem.task_id === taskItem.id && tokenItem.status === "active");
    return active.length === 0 ? pass("No active task tokens remain.") : fail(`${active.length} active token(s) remain after verification.`);
  }
  if (check.check_id === "token_usage_recorded") {
    const events = readUsageEvents().filter((event) => event.task_id === taskItem.id);
    return events.length > 0 ? pass(`${events.length} usage event(s) recorded.`) : fail("No AI usage event is linked to this task.");
  }
  return fail(`Unknown check: ${check.check_id}`);
}

function savePolicyResult(result) {
  const file = ".kabeeri/policies/policy_results.json";
  const data = readJsonFile(file);
  data.results = data.results || [];
  data.results.push(result);
  writeJsonFile(file, data);
}

function applyPolicyOverride(result, flags) {
  if (!flags.reason) throw new Error("Policy override requires --reason.");
  requireOwnerAuthority(flags);
  appendJsonLine(".kabeeri/approvals/approval_log.jsonl", {
    approval_id: `policy-override-${Date.now()}`,
    type: "policy_override",
    policy_id: result.policy_id,
    subject_id: result.subject_id,
    reason: flags.reason,
    approved_by: getOwnerActor(flags),
    approved_at: new Date().toISOString(),
    blockers: result.blockers.map((item) => item.check_id)
  });
  appendAudit("policy.override", "policy", result.policy_id, `Policy override for ${result.subject_id}: ${flags.reason}`);
}

function buildPolicyReport(results) {
  const latest = [...results].reverse();
  const lines = [
    "# Kabeeri Policy Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Results: ${results.length}`,
    `- Blocked: ${results.filter((item) => item.status === "blocked").length}`,
    `- Warning: ${results.filter((item) => item.status === "warning").length}`,
    `- Pass: ${results.filter((item) => item.status === "pass").length}`,
    "",
    "## Recent Results",
    "",
    "| Time | Policy | Subject | Stage | Status | Blockers |",
    "| --- | --- | --- | --- | --- | --- |"
  ];
  for (const item of latest.slice(0, 30)) {
    lines.push(`| ${item.evaluated_at} | ${item.policy_id} | ${item.subject_id} | ${item.stage} | ${item.status} | ${(item.blockers || []).map((blocker) => blocker.check_id).join(", ") || "-"} |`);
  }
  return `${lines.join("\n")}\n`;
}

function structured(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureStructuredState();
  const section = String(action || "summary").toLowerCase();
  const rawCommand = value || "";
  const command = String(rawCommand).toLowerCase();

  if (["summary", "status", "health", "state"].includes(section)) {
    const state = refreshStructuredDashboardState();
    if (flags.json || section === "state") console.log(JSON.stringify(state, null, 2));
    else console.log(renderStructuredHealth(state));
    return;
  }
  if (["requirement", "requirements", "req"].includes(section)) return structuredRequirement(command || "list", rest[0], flags);
  if (["phase", "phases"].includes(section)) return structuredPhase(command || "list", rest[0], flags);
  if (["milestone", "milestones"].includes(section)) return structuredMilestone(command || "list", rest[0], flags);
  if (["deliverable", "deliverables"].includes(section)) return structuredDeliverable(command || "list", rest[0], flags);
  if (["change", "changes", "change-request"].includes(section)) return structuredChange(command || "list", rest[0], flags);
  if (["risk", "risks"].includes(section)) return structuredRisk(command || "list", rest[0], flags);
  if (["gate", "gates"].includes(section)) return structuredGate(command || "list", rest[0], flags);
  if (section === "task" || section === "convert") return structuredRequirementTask(rawCommand, flags);

  throw new Error(`Unknown structured section: ${section}`);
}

function ensureStructuredState() {
  if (!fileExists(".kabeeri/structured.json")) {
    writeJsonFile(".kabeeri/structured.json", { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] });
  }
}

function readStructuredState() {
  ensureStructuredState();
  const data = readJsonFile(".kabeeri/structured.json");
  data.requirements = data.requirements || [];
  data.phases = data.phases || [];
  data.milestones = data.milestones || [];
  data.deliverables = data.deliverables || [];
  data.approvals = data.approvals || [];
  data.change_requests = data.change_requests || [];
  data.risks = data.risks || [];
  data.gates = data.gates || [];
  return data;
}

function writeStructuredState(data) {
  writeJsonFile(".kabeeri/structured.json", {
    requirements: data.requirements || [],
    phases: data.phases || [],
    milestones: data.milestones || [],
    deliverables: data.deliverables || [],
    approvals: data.approvals || [],
    change_requests: data.change_requests || [],
    risks: data.risks || [],
    gates: data.gates || []
  });
  refreshStructuredDashboardState(data);
}

function structuredRequirement(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Requirement", "Type", "Priority", "Status", "Phase", "Owner", "Title"], data.requirements.map((item) => [item.requirement_id, item.type, item.priority, item.status, item.phase_id || "", item.owner_id || "", item.title])));
    return;
  }
  if (action === "show") {
    console.log(JSON.stringify(findStructuredRequirement(data, id || flags.id), null, 2));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured requirement");
    const item = {
      requirement_id: flags.id || id || `REQ-${String(data.requirements.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled requirement",
      type: flags.type || "functional",
      priority: flags.priority || "medium",
      status: flags.status || "draft",
      source: flags.source || "manual",
      phase_id: flags.phase || null,
      owner_id: flags.owner || null,
      workstreams: parseCsv(flags.workstreams || flags.workstream),
      app_usernames: parseCsv(flags.apps || flags.app || flags["app-username"]),
      description: flags.description || "",
      acceptance_criteria: parseCsv(flags.acceptance || flags.criteria),
      non_functional_requirements: parseCsv(flags.nfr || flags["non-functional"]),
      dependencies: parseCsv(flags.dependencies),
      risks: parseCsv(flags.risks),
      task_ids: parseCsv(flags.tasks),
      approval_status: "pending",
      created_at: new Date().toISOString()
    };
    if (data.requirements.some((entry) => entry.requirement_id === item.requirement_id)) throw new Error(`Requirement already exists: ${item.requirement_id}`);
    data.requirements.push(item);
    writeStructuredState(data);
    appendAudit("structured.requirement_created", "requirement", item.requirement_id, `Requirement created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured requirement");
    const item = findStructuredRequirement(data, id || flags.id);
    item.approval_status = "approved";
    item.status = flags.status || "approved";
    item.approved_by = getEffectiveActor(flags) || flags.owner || "local-cli";
    item.approved_at = new Date().toISOString();
    addStructuredApproval(data, "requirement", item.requirement_id, item.approved_by, flags.reason || "Requirement approved.");
    writeStructuredState(data);
    appendAudit("structured.requirement_approved", "requirement", item.requirement_id, `Requirement approved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured requirement action: ${action}`);
}

function structuredPhase(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Phase", "Status", "Requirements", "Tasks", "Gate", "Title"], data.phases.map((item) => [item.phase_id, item.status, (item.requirement_ids || []).length, (item.task_ids || []).length, item.gate_status || "", item.title])));
    return;
  }
  if (action === "show") {
    console.log(JSON.stringify(findStructuredPhase(data, id || flags.id), null, 2));
    return;
  }
  if (action === "plan" || action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "plan structured phase");
    const phaseId = flags.id || id || `phase-${String(data.phases.length + 1).padStart(3, "0")}`;
    const requirementIds = parseCsv(flags.requirements || flags.reqs);
    const requirements = requirementIds.map((reqId) => findStructuredRequirement(data, reqId));
    const unapproved = requirements.filter((item) => item.approval_status !== "approved");
    if (unapproved.length && !flags.force) throw new Error(`Phase contains unapproved requirements: ${unapproved.map((item) => item.requirement_id).join(", ")}`);
    const phase = {
      phase_id: phaseId,
      title: flags.title || phaseId,
      objective: flags.objective || flags.goal || "",
      status: "planned",
      requirement_ids: requirementIds,
      task_ids: parseCsv(flags.tasks),
      deliverable_ids: parseCsv(flags.deliverables),
      entry_criteria: parseCsv(flags.entry || flags["entry-criteria"]),
      exit_criteria: parseCsv(flags.exit || flags["exit-criteria"]),
      owner_id: flags.owner || null,
      start_date: flags.start || null,
      end_date: flags.end || null,
      gate_status: "pending",
      risks: parseCsv(flags.risks),
      dependencies: parseCsv(flags.dependencies),
      created_at: new Date().toISOString()
    };
    if (data.phases.some((item) => item.phase_id === phase.phase_id)) throw new Error(`Phase already exists: ${phase.phase_id}`);
    data.phases.push(phase);
    for (const req of requirements) req.phase_id = phase.phase_id;
    writeStructuredState(data);
    appendAudit("structured.phase_planned", "phase", phase.phase_id, `Structured phase planned: ${phase.title}`);
    console.log(JSON.stringify(phase, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured phase");
    const phase = findStructuredPhase(data, id || flags.id);
    phase.status = "approved";
    phase.approved_by = getEffectiveActor(flags) || "local-cli";
    phase.approved_at = new Date().toISOString();
    addStructuredApproval(data, "phase", phase.phase_id, phase.approved_by, flags.reason || "Phase approved.");
    writeStructuredState(data);
    appendAudit("structured.phase_approved", "phase", phase.phase_id, `Structured phase approved: ${phase.title}`);
    console.log(JSON.stringify(phase, null, 2));
    return;
  }
  if (action === "complete") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "complete structured phase");
    const phase = findStructuredPhase(data, id || flags.id);
    const gate = evaluateStructuredPhaseGate(data, phase, flags);
    data.gates.push(gate);
    if (gate.status === "blocked" && !flags.force) {
      writeStructuredState(data);
      throw new Error(`Structured phase gate blocked: ${gate.blockers.map((item) => item.check_id).join(", ")}`);
    }
    phase.status = "completed";
    phase.gate_status = gate.status;
    phase.completed_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit("structured.phase_completed", "phase", phase.phase_id, `Structured phase completed: ${phase.title}`);
    console.log(JSON.stringify({ phase, gate }, null, 2));
    return;
  }
  throw new Error(`Unknown structured phase action: ${action}`);
}

function structuredMilestone(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Milestone", "Phase", "Status", "Due", "Title"], data.milestones.map((item) => [item.milestone_id, item.phase_id || "", item.status, item.due_date || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured milestone");
    const item = { milestone_id: flags.id || id || `milestone-${String(data.milestones.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled milestone", phase_id: flags.phase || null, status: flags.status || "planned", due_date: flags.due || null, exit_criteria: parseCsv(flags.exit || flags["exit-criteria"]), created_at: new Date().toISOString() };
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.milestones.push(item);
    writeStructuredState(data);
    appendAudit("structured.milestone_created", "milestone", item.milestone_id, `Milestone created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured milestone action: ${action}`);
}

function structuredDeliverable(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Deliverable", "Phase", "Status", "Owner", "Title"], data.deliverables.map((item) => [item.deliverable_id, item.phase_id || "", item.status, item.owner_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured deliverable");
    const item = { deliverable_id: flags.id || id || `deliverable-${String(data.deliverables.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled deliverable", phase_id: flags.phase || null, type: flags.type || "document", status: flags.status || "draft", owner_id: flags.owner || null, acceptance_criteria: parseCsv(flags.acceptance || flags.criteria), evidence: parseCsv(flags.evidence), created_at: new Date().toISOString() };
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.deliverables.push(item);
    writeStructuredState(data);
    appendAudit("structured.deliverable_created", "deliverable", item.deliverable_id, `Deliverable created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured deliverable");
    const item = data.deliverables.find((entry) => entry.deliverable_id === (id || flags.id));
    if (!item) throw new Error(`Deliverable not found: ${id || flags.id || ""}`);
    item.status = "approved";
    item.approved_by = getEffectiveActor(flags) || "local-cli";
    item.approved_at = new Date().toISOString();
    addStructuredApproval(data, "deliverable", item.deliverable_id, item.approved_by, flags.reason || "Deliverable approved.");
    writeStructuredState(data);
    appendAudit("structured.deliverable_approved", "deliverable", item.deliverable_id, `Deliverable approved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured deliverable action: ${action}`);
}

function structuredChange(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Change", "Impact", "Status", "Requirement", "Title"], data.change_requests.map((item) => [item.change_id, item.impact, item.status, item.requirement_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured change request");
    const item = { change_id: flags.id || id || `change-${String(data.change_requests.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled change request", requirement_id: flags.requirement || flags.req || null, phase_id: flags.phase || null, impact: flags.impact || "medium", status: "proposed", reason: flags.reason || "", scope_delta: parseCsv(flags.scope || flags["scope-delta"]), decision: null, created_at: new Date().toISOString() };
    if (item.requirement_id) findStructuredRequirement(data, item.requirement_id);
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.change_requests.push(item);
    writeStructuredState(data);
    appendAudit("structured.change_created", "change", item.change_id, `Change request created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve" || action === "reject") {
    requireAnyRole(flags, ["Owner", "Maintainer"], `${action} structured change request`);
    const item = data.change_requests.find((entry) => entry.change_id === (id || flags.id));
    if (!item) throw new Error(`Change request not found: ${id || flags.id || ""}`);
    item.status = action === "approve" ? "approved" : "rejected";
    item.decision = flags.reason || item.status;
    item.decided_by = getEffectiveActor(flags) || "local-cli";
    item.decided_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit(`structured.change_${item.status}`, "change", item.change_id, `Change request ${item.status}: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured change action: ${action}`);
}

function structuredRisk(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Risk", "Severity", "Status", "Owner", "Title"], data.risks.map((item) => [item.risk_id, item.severity, item.status, item.owner_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "create structured risk");
    const item = { risk_id: flags.id || id || `risk-${String(data.risks.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled risk", severity: normalizeStructuredSeverity(flags.severity || "medium"), status: "open", owner_id: flags.owner || null, mitigation: flags.mitigation || "", phase_id: flags.phase || null, requirement_id: flags.requirement || flags.req || null, created_at: new Date().toISOString() };
    data.risks.push(item);
    writeStructuredState(data);
    appendAudit("structured.risk_created", "risk", item.risk_id, `Risk created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (["mitigate", "close", "resolve"].includes(action)) {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "mitigate structured risk");
    const item = data.risks.find((entry) => entry.risk_id === (id || flags.id));
    if (!item) throw new Error(`Risk not found: ${id || flags.id || ""}`);
    item.status = "mitigated";
    item.mitigation = flags.mitigation || flags.reason || item.mitigation || "";
    item.mitigated_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit("structured.risk_mitigated", "risk", item.risk_id, `Risk mitigated: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured risk action: ${action}`);
}

function structuredGate(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Gate", "Phase", "Status", "Blockers", "Generated"], data.gates.map((item) => [item.gate_id, item.phase_id, item.status, (item.blockers || []).length, item.generated_at])));
    return;
  }
  if (action === "check") {
    const phase = findStructuredPhase(data, id || flags.phase || flags.id);
    const gate = evaluateStructuredPhaseGate(data, phase, flags);
    data.gates.push(gate);
    phase.gate_status = gate.status;
    writeStructuredState(data);
    appendAudit("structured.gate_checked", "phase", phase.phase_id, `Structured gate checked: ${gate.status}`);
    console.log(JSON.stringify(gate, null, 2));
    return;
  }
  throw new Error(`Unknown structured gate action: ${action}`);
}

function structuredRequirementTask(requirementId, flags = {}) {
  const data = readStructuredState();
  const requirement = findStructuredRequirement(data, flags.requirement || flags.req || requirementId);
  if (requirement.approval_status !== "approved" && !flags.force) throw new Error(`Requirement is not approved: ${requirement.requirement_id}`);
  const tasksFile = ".kabeeri/tasks.json";
  const taskData = readJsonFile(tasksFile);
  taskData.tasks = taskData.tasks || [];
  const taskId = flags.task || `task-${String(taskData.tasks.length + 1).padStart(3, "0")}`;
  if (taskData.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = parseCsv(flags.workstreams || flags.workstream || (requirement.workstreams || []).join(",") || "unassigned");
  const appRefs = parseCsv(flags.apps || flags.app || (requirement.app_usernames || []).join(","));
  const appLinks = resolveTaskApps(appRefs);
  validateTaskBoundaryCreation(flags.type || "structured_requirement", workstreams, appLinks);
  const taskItem = { id: taskId, title: flags.title || requirement.title, status: "proposed", type: flags.type || "structured_requirement", workstream: workstreams[0] || "unassigned", workstreams, app_username: appLinks[0] ? appLinks[0].username : null, app_usernames: appLinks.map((appItem) => appItem.username), app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean), source: "structured_requirement", source_reference: `requirement:${requirement.requirement_id}`, requirement_id: requirement.requirement_id, phase_id: requirement.phase_id || null, acceptance_criteria: requirement.acceptance_criteria || [], created_at: new Date().toISOString() };
  taskData.tasks.push(taskItem);
  writeJsonFile(tasksFile, taskData);
  requirement.task_ids = uniqueList([...(requirement.task_ids || []), taskId]);
  writeStructuredState(data);
  appendAudit("structured.requirement_converted", "task", taskId, `Requirement converted to task: ${requirement.requirement_id}`);
  console.log(JSON.stringify(taskItem, null, 2));
}

function findStructuredRequirement(data, id) {
  if (!id) throw new Error("Missing requirement id.");
  const item = data.requirements.find((entry) => entry.requirement_id === id);
  if (!item) throw new Error(`Requirement not found: ${id}`);
  return item;
}

function findStructuredPhase(data, id) {
  if (!id) throw new Error("Missing phase id.");
  const item = data.phases.find((entry) => entry.phase_id === id);
  if (!item) throw new Error(`Phase not found: ${id}`);
  return item;
}

function addStructuredApproval(data, subjectType, subjectId, actor, reason) {
  data.approvals.push({ approval_id: `structured-approval-${String(data.approvals.length + 1).padStart(3, "0")}`, subject_type: subjectType, subject_id: subjectId, actor, reason, approved_at: new Date().toISOString() });
}

function evaluateStructuredPhaseGate(data, phase, flags = {}) {
  const blockers = [];
  const warnings = [];
  const add = (target, check_id, message) => target.push({ check_id, message });
  const phaseRequirements = (phase.requirement_ids || []).map((reqId) => findStructuredRequirement(data, reqId));
  if (!phase.objective) add(warnings, "phase_objective_missing", "Structured phase should have a clear objective.");
  if (!phaseRequirements.length) add(blockers, "phase_requirements_missing", "Structured phase must include requirements.");
  for (const req of phaseRequirements) {
    if (req.approval_status !== "approved") add(blockers, "requirement_not_approved", `Requirement is not approved: ${req.requirement_id}`);
    if (!(req.acceptance_criteria || []).length) add(blockers, "requirement_acceptance_missing", `Requirement has no acceptance criteria: ${req.requirement_id}`);
    if (!(req.task_ids || []).length) add(warnings, "requirement_not_converted", `Requirement has no governed task yet: ${req.requirement_id}`);
  }
  const phaseDeliverables = (data.deliverables || []).filter((item) => item.phase_id === phase.phase_id || (phase.deliverable_ids || []).includes(item.deliverable_id));
  const unapprovedDeliverables = phaseDeliverables.filter((item) => item.status !== "approved");
  if (phaseDeliverables.length && unapprovedDeliverables.length) add(blockers, "deliverables_not_approved", `${unapprovedDeliverables.length} deliverable(s) are not approved.`);
  const openHighRisks = (data.risks || []).filter((item) => item.status === "open" && ["high", "critical"].includes(item.severity) && (!item.phase_id || item.phase_id === phase.phase_id));
  if (openHighRisks.length) add(blockers, "open_high_risks", `${openHighRisks.length} high/critical risk(s) remain open.`);
  const openChanges = (data.change_requests || []).filter((item) => item.status === "proposed" && (!item.phase_id || item.phase_id === phase.phase_id));
  if (openChanges.length) add(warnings, "open_change_requests", `${openChanges.length} change request(s) are still proposed.`);
  return { gate_id: flags.id || `structured-gate-${String((data.gates || []).length + 1).padStart(3, "0")}`, phase_id: phase.phase_id, generated_at: new Date().toISOString(), status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass", blockers, warnings, checks: [{ check_id: "phase_requirements", result: phaseRequirements.length ? "pass" : "fail" }, { check_id: "requirements_approved", result: phaseRequirements.every((req) => req.approval_status === "approved") ? "pass" : "fail" }, { check_id: "acceptance_criteria", result: phaseRequirements.every((req) => (req.acceptance_criteria || []).length) ? "pass" : "fail" }, { check_id: "deliverables_approved", result: unapprovedDeliverables.length ? "fail" : "pass" }, { check_id: "high_risks_mitigated", result: openHighRisks.length ? "fail" : "pass" }] };
}

function refreshStructuredDashboardState(existingData = null) {
  const data = existingData || readStructuredState();
  const tasks = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const approvedRequirements = data.requirements.filter((item) => item.approval_status === "approved");
  const requirementsWithTasks = data.requirements.filter((item) => (item.task_ids || []).length || tasks.some((task) => task.source_reference === `requirement:${item.requirement_id}`));
  const openRisks = data.risks.filter((item) => item.status === "open");
  const blockedGates = data.gates.filter((item) => item.status === "blocked");
  const actionItems = buildStructuredActionItems(data, openRisks, blockedGates, requirementsWithTasks);
  const state = { generated_at: new Date().toISOString(), source: ".kabeeri/structured.json", live_json_path: ".kabeeri/dashboard/structured_state.json", live_api_path: "/__kvdf/api/structured", summary: { requirements: data.requirements.length, approved_requirements: approvedRequirements.length, requirements_with_tasks: requirementsWithTasks.length, phases: data.phases.length, completed_phases: data.phases.filter((item) => item.status === "completed").length, milestones: data.milestones.length, approved_deliverables: data.deliverables.filter((item) => item.status === "approved").length, open_change_requests: data.change_requests.filter((item) => item.status === "proposed").length, open_high_risks: openRisks.filter((item) => ["high", "critical"].includes(item.severity)).length, blocked_gates: blockedGates.length, health: actionItems.some((item) => item.severity === "blocker") ? "blocked" : actionItems.length ? "needs_attention" : "healthy" }, phases: data.phases.map((phase) => ({ phase_id: phase.phase_id, title: phase.title, status: phase.status, gate_status: phase.gate_status || "pending", requirements: (phase.requirement_ids || []).length, tasks: (phase.task_ids || []).length })), traceability: { requirements_total: data.requirements.length, approved_requirements: approvedRequirements.length, requirements_with_tasks: requirementsWithTasks.length, orphan_tasks: tasks.filter((task) => task.source === "structured_requirement" && !data.requirements.some((req) => `requirement:${req.requirement_id}` === task.source_reference)).map((task) => task.id) }, gates: data.gates.slice(-10), risks: openRisks, change_requests: data.change_requests.filter((item) => item.status === "proposed"), action_items: actionItems };
  if (fileExists(".kabeeri/dashboard")) writeJsonFile(".kabeeri/dashboard/structured_state.json", state);
  return state;
}

function buildStructuredActionItems(data, openRisks, blockedGates, requirementsWithTasks) {
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const unapprovedRequirements = data.requirements.filter((item) => item.approval_status !== "approved");
  if (unapprovedRequirements.length) add("warning", "requirements", `${unapprovedRequirements.length} requirement(s) are not approved.`, "Run `kvdf structured requirement approve <id>` after review.");
  const noAcceptance = data.requirements.filter((item) => !(item.acceptance_criteria || []).length);
  if (noAcceptance.length) add("blocker", "requirements", `${noAcceptance.length} requirement(s) lack acceptance criteria.`, "Add measurable acceptance criteria before planning phases.");
  const unconverted = data.requirements.filter((item) => item.approval_status === "approved" && !requirementsWithTasks.includes(item));
  if (unconverted.length) add("info", "traceability", `${unconverted.length} approved requirement(s) have no governed task.`, "Run `kvdf structured task <requirement-id>` for implementation work.");
  const severeRisks = openRisks.filter((item) => ["high", "critical"].includes(item.severity));
  if (severeRisks.length) add("blocker", "risks", `${severeRisks.length} high/critical risk(s) are open.`, "Mitigate risks before phase closure or release.");
  if (blockedGates.length) add("blocker", "gates", `${blockedGates.length} structured gate(s) are blocked.`, "Run `kvdf structured gate check <phase-id>` and resolve blockers.");
  const proposedChanges = data.change_requests.filter((item) => item.status === "proposed");
  if (proposedChanges.length) add("warning", "change_control", `${proposedChanges.length} change request(s) need a decision.`, "Approve, reject, or defer change requests before scope closure.");
  return items;
}

function renderStructuredHealth(state) {
  const lines = ["# Kabeeri Structured Delivery Health", "", `Generated at: ${state.generated_at}`, `Health: ${state.summary.health}`, `Live JSON: ${state.live_json_path}`, "", "## Summary", ""];
  for (const [key, value] of Object.entries(state.summary || {})) lines.push(`- ${key}: ${value}`);
  lines.push("", "## Action Items", "");
  if (!(state.action_items || []).length) lines.push("- None.");
  for (const item of state.action_items || []) lines.push(`- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`);
  return `${lines.join("\n")}\n`;
}

function normalizeStructuredSeverity(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid structured severity. Use low, medium, high, or critical.");
  return normalized;
}

function agile(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureAgileState();
  const section = String(action || "summary").toLowerCase();
  const command = String(value || "").toLowerCase();

  if (section === "summary" || section === "status" || section === "list") {
    const result = refreshAgileDashboardState();
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(table(["Metric", "Value"], Object.entries(result.summary || {}).map(([key, val]) => [key, typeof val === "object" ? JSON.stringify(val) : val])));
    return;
  }

  if (section === "health" || section === "dashboard" || section === "state") {
    const result = refreshAgileDashboardState();
    if (flags.json || section === "state") console.log(JSON.stringify(result, null, 2));
    else console.log(renderAgileHealth(result));
    return;
  }

  if (section === "forecast") {
    const result = refreshAgileDashboardState();
    console.log(JSON.stringify(result.forecast || {}, null, 2));
    return;
  }

  if (section === "backlog") return agileBacklog(command || "list", rest[0], flags);
  if (section === "epic" || section === "epics") return agileEpic(command || "list", rest[0], flags);
  if (section === "story" || section === "stories") return agileStory(command || "list", rest[0], flags);
  if (section === "sprint") return agileSprint(command || "plan", rest[0], flags);
  if (section === "impediment" || section === "impediments") return agileImpediment(command || "list", rest[0], flags);
  if (section === "retro" || section === "retrospective" || section === "retrospectives") return agileRetrospective(command || "list", rest[0], flags);
  if (section === "release" || section === "releases") return agileRelease(command || "list", rest[0], flags);

  throw new Error(`Unknown agile section: ${section}`);
}

function ensureAgileState() {
  if (!fileExists(".kabeeri/agile.json")) {
    writeJsonFile(".kabeeri/agile.json", { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] });
  }
}

function readAgileState() {
  ensureAgileState();
  const data = readJsonFile(".kabeeri/agile.json");
  data.backlog = data.backlog || [];
  data.epics = data.epics || [];
  data.stories = data.stories || [];
  data.sprint_reviews = data.sprint_reviews || [];
  data.impediments = data.impediments || [];
  data.retrospectives = data.retrospectives || [];
  data.releases = data.releases || [];
  return data;
}

function writeAgileState(data) {
  writeJsonFile(".kabeeri/agile.json", {
    backlog: data.backlog || [],
    epics: data.epics || [],
    stories: data.stories || [],
    sprint_reviews: data.sprint_reviews || [],
    impediments: data.impediments || [],
    retrospectives: data.retrospectives || [],
    releases: data.releases || []
  });
  refreshAgileDashboardState(data);
}

function agileBacklog(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["ID", "Type", "Priority", "Status", "Title", "Source"], data.backlog.map((item) => [item.id, item.type, item.priority, item.status, item.title, item.source])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile backlog item");
    const item = {
      id: flags.id || id || `BL-${String(data.backlog.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled backlog item",
      type: flags.type || "story",
      priority: flags.priority || "medium",
      source: flags.source || "manual",
      status: flags.status || "proposed",
      notes: flags.notes || "",
      created_at: new Date().toISOString()
    };
    if (data.backlog.some((entry) => entry.id === item.id)) throw new Error(`Backlog item already exists: ${item.id}`);
    data.backlog.push(item);
    writeAgileState(data);
    appendAudit("agile.backlog_created", "backlog", item.id, `Backlog item created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile backlog action: ${action}`);
}

function agileEpic(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Epic", "Priority", "Status", "Stories", "Title"], data.epics.map((item) => [item.epic_id, item.priority, item.status, (item.story_ids || []).length, item.title])));
    return;
  }
  if (action === "show") {
    const epic = data.epics.find((item) => item.epic_id === (id || flags.id));
    if (!epic) throw new Error(`Epic not found: ${id || flags.id || ""}`);
    console.log(JSON.stringify(epic, null, 2));
    return;
  }
  if (action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile epic");
    const epic = {
      epic_id: flags.id || id || `epic-${String(data.epics.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled epic",
      business_goal: flags.goal || flags["business-goal"] || "",
      target_users: parseCsv(flags.users || flags["target-users"]),
      source: flags.source || "manual",
      priority: flags.priority || "medium",
      story_ids: parseCsv(flags.stories),
      acceptance_summary: flags.acceptance || "",
      out_of_scope: parseCsv(flags["out-of-scope"]),
      risks: parseCsv(flags.risks),
      target_release: flags.release || null,
      status: flags.status || "proposed",
      created_at: new Date().toISOString()
    };
    if (data.epics.some((item) => item.epic_id === epic.epic_id)) throw new Error(`Epic already exists: ${epic.epic_id}`);
    data.epics.push(epic);
    ensureBacklogItem(data, { id: epic.epic_id, title: epic.title, type: "epic", priority: epic.priority, source: epic.source, status: "proposed" });
    writeAgileState(data);
    appendAudit("agile.epic_created", "epic", epic.epic_id, `Epic created: ${epic.title}`);
    console.log(JSON.stringify(epic, null, 2));
    return;
  }
  throw new Error(`Unknown agile epic action: ${action}`);
}

function agileStory(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Story", "Epic", "Sprint", "Points", "Ready", "Status", "Title"], data.stories.map((item) => [item.story_id, item.epic_id || "", item.sprint_id || "", item.estimate_points || 0, item.ready_status || "not_ready", item.status, item.title])));
    return;
  }
  if (action === "show") {
    const story = findAgileStory(data, id || flags.id);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile story");
    const story = {
      story_id: flags.id || id || `story-${String(data.stories.length + 1).padStart(3, "0")}`,
      epic_id: flags.epic || null,
      title: flags.title || "Untitled story",
      user_role: flags.role || "user",
      want: flags.want || "",
      value: flags.value || "",
      story_text: flags.text || buildStoryText(flags.role || "user", flags.want || "", flags.value || ""),
      source: flags.source || "manual",
      priority: flags.priority || "medium",
      estimate_points: Number(flags.points || flags.estimate || 0),
      workstream: flags.workstream || "unassigned",
      sprint_id: flags.sprint || null,
      assignee_id: flags.assignee || null,
      reviewer_id: flags.reviewer || null,
      acceptance_criteria: parseCsv(flags.acceptance || flags.criteria),
      dependencies: parseCsv(flags.dependencies),
      risks: parseCsv(flags.risks),
      non_functional_requirements: parseCsv(flags.nfr || flags["non-functional"]),
      test_notes: flags.tests || flags["test-notes"] || "",
      tasks: parseCsv(flags.tasks),
      task_id: flags.task || null,
      definition_of_ready: {},
      definition_of_done: {},
      ready_status: "not_ready",
      status: flags.status || "backlog",
      created_at: new Date().toISOString()
    };
    story.definition_of_ready = computeStoryReady(story);
    story.ready_status = storyReadyStatus(story.definition_of_ready);
    if (data.stories.some((item) => item.story_id === story.story_id)) throw new Error(`Story already exists: ${story.story_id}`);
    if (story.epic_id && !data.epics.some((item) => item.epic_id === story.epic_id)) throw new Error(`Epic not found: ${story.epic_id}`);
    data.stories.push(story);
    if (story.epic_id) {
      const epic = data.epics.find((item) => item.epic_id === story.epic_id);
      epic.story_ids = uniqueList([...(epic.story_ids || []), story.story_id]);
    }
    ensureBacklogItem(data, { id: story.story_id, title: story.title, type: "story", priority: story.priority, source: story.source, status: story.status });
    writeAgileState(data);
    appendAudit("agile.story_created", "story", story.story_id, `Story created: ${story.title}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "ready") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "mark agile story ready");
    const story = findAgileStory(data, id || flags.id);
    if (flags.reviewer) story.reviewer_id = flags.reviewer;
    if (flags.acceptance) story.acceptance_criteria = uniqueList([...(story.acceptance_criteria || []), ...parseCsv(flags.acceptance)]);
    if (flags.dependencies) story.dependencies = uniqueList([...(story.dependencies || []), ...parseCsv(flags.dependencies)]);
    if (flags.risks) story.risks = uniqueList([...(story.risks || []), ...parseCsv(flags.risks)]);
    if (flags.nfr || flags["non-functional"]) story.non_functional_requirements = uniqueList([...(story.non_functional_requirements || []), ...parseCsv(flags.nfr || flags["non-functional"])]);
    if (flags.tests || flags["test-notes"]) story.test_notes = flags.tests || flags["test-notes"];
    if (flags.points) story.estimate_points = Number(flags.points);
    story.definition_of_ready = computeStoryReady(story);
    story.ready_status = storyReadyStatus(story.definition_of_ready);
    story.updated_at = new Date().toISOString();
    writeAgileState(data);
    appendAudit("agile.story_ready_checked", "story", story.story_id, `Story ready status: ${story.ready_status}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "task" || action === "convert") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "convert agile story to task");
    const story = findAgileStory(data, id || flags.id);
    const taskId = convertAgileStoryToTask(story, flags);
    story.task_id = taskId;
    story.status = story.sprint_id ? "selected_for_sprint" : "backlog";
    story.updated_at = new Date().toISOString();
    writeAgileState(data);
    appendAudit("agile.story_converted", "task", taskId, `Story converted to task: ${story.story_id}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  throw new Error(`Unknown agile story action: ${action}`);
}

function agileSprint(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "plan") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "plan agile sprint");
    const sprintId = flags.id || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const storyIds = parseCsv(flags.stories);
    const stories = storyIds.map((storyId) => findAgileStory(data, storyId));
    const notReady = stories.filter((story) => story.ready_status !== "ready");
    if (notReady.length && !flags.force) throw new Error(`Sprint contains not-ready stories: ${notReady.map((story) => story.story_id).join(", ")}`);
    const blockedByImpediments = stories.filter((story) => hasOpenStoryImpediment(data, story.story_id));
    if (blockedByImpediments.length && !flags.force) throw new Error(`Sprint contains stories with open impediments: ${blockedByImpediments.map((story) => story.story_id).join(", ")}`);
    const capacityPoints = Number(flags["capacity-points"] || flags.capacity || 0);
    const committedPoints = stories.reduce((sum, story) => sum + Number(story.estimate_points || 0), 0);
    if (capacityPoints > 0 && committedPoints > capacityPoints) throw new Error(`Sprint commitment exceeds capacity: ${committedPoints}/${capacityPoints} points`);
    upsertSprintRecord(sprintId, {
      name: flags.name || sprintId,
      goal: flags.goal || "",
      start_date: flags.start || null,
      end_date: flags.end || null,
      capacity_points: capacityPoints,
      capacity_hours: Number(flags["capacity-hours"] || 0),
      token_budget: Number(flags["token-budget"] || 0),
      committed_story_ids: storyIds,
      committed_points: committedPoints,
      planning_confidence: flags.confidence || inferSprintPlanningConfidence(capacityPoints, committedPoints, stories),
      risks: parseCsv(flags.risks),
      dependencies: parseCsv(flags.dependencies),
      scrum_master: flags["scrum-master"] || flags.facilitator || null
    });
    for (const story of stories) {
      story.sprint_id = sprintId;
      story.status = "selected_for_sprint";
      story.updated_at = new Date().toISOString();
    }
    writeAgileState(data);
    appendAudit("agile.sprint_planned", "sprint", sprintId, `Sprint planned with ${storyIds.length} stories`);
    console.log(JSON.stringify({ sprint_id: sprintId, committed_story_ids: storyIds, committed_points: committedPoints, capacity_points: capacityPoints, planning_confidence: flags.confidence || inferSprintPlanningConfidence(capacityPoints, committedPoints, stories) }, null, 2));
    return;
  }
  if (action === "review") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "record agile sprint review");
    const sprintId = flags.id || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const accepted = parseCsv(flags.accepted);
    const rework = parseCsv(flags.rework);
    const review = {
      review_id: flags.review || `sprint-review-${String(data.sprint_reviews.length + 1).padStart(3, "0")}`,
      sprint_id: sprintId,
      review_date: flags.date || new Date().toISOString(),
      goal_met: flags["goal-met"] || "partial",
      accepted_story_ids: accepted,
      rework_story_ids: rework,
      accepted_points: pointsForStories(data, accepted),
      rework_points: pointsForStories(data, rework),
      token_cost: Number(flags.cost || 0),
      reviewer: flags.reviewer || null,
      owner_decision: flags.decision || "reviewed",
      feedback: flags.feedback || "",
      next_backlog_changes: parseCsv(flags.next || flags["next-backlog"]),
      demo_notes: flags.demo || "",
      stakeholder_feedback: parseCsv(flags["stakeholder-feedback"]),
      action_items: parseCsv(flags.actions || flags["action-items"])
    };
    data.sprint_reviews.push(review);
    for (const story of data.stories) {
      if (accepted.includes(story.story_id)) story.status = "accepted";
      if (rework.includes(story.story_id)) story.status = "needs_rework";
    }
    updateSprintStatus(sprintId, review.goal_met === "yes" ? "reviewed" : "reviewed_with_followup");
    writeAgileState(data);
    appendAudit("agile.sprint_reviewed", "sprint", sprintId, `Sprint review recorded`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }
  throw new Error(`Unknown agile sprint action: ${action}`);
}

function agileImpediment(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Impediment", "Severity", "Status", "Sprint", "Story", "Owner", "Title"], data.impediments.map((item) => [
      item.impediment_id,
      item.severity,
      item.status,
      item.sprint_id || "",
      item.story_id || "",
      item.owner_id || "",
      item.title
    ])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "create agile impediment");
    const item = {
      impediment_id: flags.id || id || `impediment-${String(data.impediments.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled impediment",
      description: flags.description || flags.notes || "",
      severity: normalizeAgileSeverity(flags.severity || "medium"),
      status: "open",
      sprint_id: flags.sprint || null,
      story_id: flags.story || null,
      owner_id: flags.owner || null,
      target_resolution: flags.target || flags["target-resolution"] || null,
      created_at: new Date().toISOString()
    };
    if (item.story_id) findAgileStory(data, item.story_id);
    if (data.impediments.some((entry) => entry.impediment_id === item.impediment_id)) throw new Error(`Impediment already exists: ${item.impediment_id}`);
    data.impediments.push(item);
    if (item.story_id) {
      const story = findAgileStory(data, item.story_id);
      story.status = "blocked";
      story.updated_at = new Date().toISOString();
    }
    writeAgileState(data);
    appendAudit("agile.impediment_created", "impediment", item.impediment_id, `Impediment created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "resolve" || action === "close") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "resolve agile impediment");
    const item = data.impediments.find((entry) => entry.impediment_id === (id || flags.id));
    if (!item) throw new Error(`Impediment not found: ${id || flags.id || ""}`);
    item.status = "resolved";
    item.resolution = flags.resolution || flags.notes || "";
    item.resolved_at = new Date().toISOString();
    if (item.story_id) {
      const story = data.stories.find((entry) => entry.story_id === item.story_id);
      if (story && !hasOpenStoryImpediment(data, story.story_id, item.impediment_id)) {
        story.status = story.sprint_id ? "selected_for_sprint" : "backlog";
        story.updated_at = new Date().toISOString();
      }
    }
    writeAgileState(data);
    appendAudit("agile.impediment_resolved", "impediment", item.impediment_id, `Impediment resolved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile impediment action: ${action}`);
}

function agileRetrospective(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Retro", "Sprint", "Decision", "Actions", "Date"], data.retrospectives.map((item) => [
      item.retro_id,
      item.sprint_id,
      item.decision || "",
      (item.action_items || []).length,
      item.recorded_at
    ])));
    return;
  }
  if (action === "add" || action === "record" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "record agile retrospective");
    const sprintId = flags.sprint || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const item = {
      retro_id: flags.id || `retro-${String(data.retrospectives.length + 1).padStart(3, "0")}`,
      sprint_id: sprintId,
      recorded_at: flags.date || new Date().toISOString(),
      went_well: parseCsv(flags.good || flags["went-well"]),
      improve: parseCsv(flags.improve || flags["to-improve"]),
      action_items: parseCsv(flags.actions || flags["action-items"]),
      decision: flags.decision || "continue",
      facilitator: flags.facilitator || flags["scrum-master"] || null
    };
    data.retrospectives.push(item);
    writeAgileState(data);
    appendAudit("agile.retrospective_recorded", "sprint", sprintId, `Retrospective recorded: ${item.retro_id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile retrospective action: ${action}`);
}

function agileRelease(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Release", "Status", "Target", "Stories", "Points", "Readiness", "Title"], data.releases.map((item) => [
      item.release_id,
      item.status,
      item.target_date || "",
      (item.story_ids || []).length,
      item.total_points || 0,
      item.readiness_status || "unknown",
      item.title
    ])));
    return;
  }
  if (action === "show") {
    const release = findAgileRelease(data, id || flags.id);
    console.log(JSON.stringify(release, null, 2));
    return;
  }
  if (action === "plan" || action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "plan agile release");
    const storyIds = parseCsv(flags.stories);
    const epicIds = parseCsv(flags.epics);
    const stories = storyIds.map((storyId) => findAgileStory(data, storyId));
    for (const epicId of epicIds) {
      if (!data.epics.some((item) => item.epic_id === epicId)) throw new Error(`Epic not found: ${epicId}`);
    }
    const release = {
      release_id: flags.id || id || `release-${String(data.releases.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled release",
      goal: flags.goal || "",
      target_date: flags.target || flags["target-date"] || null,
      status: flags.status || "planned",
      epic_ids: epicIds,
      story_ids: storyIds,
      total_points: stories.reduce((sum, story) => sum + Number(story.estimate_points || 0), 0),
      accepted_story_ids: stories.filter((story) => story.status === "accepted").map((story) => story.story_id),
      risk_level: normalizeAgileReleaseRisk(flags.risk || inferReleaseRisk(stories, flags)),
      release_criteria: parseCsv(flags.criteria || flags["release-criteria"]),
      required_checks: parseCsv(flags.checks || flags["required-checks"]),
      known_risks: parseCsv(flags.risks),
      open_questions: parseCsv(flags.questions || flags["open-questions"]),
      readiness_status: "unknown",
      created_at: new Date().toISOString()
    };
    release.readiness_status = computeReleaseReadiness(release, stories);
    if (data.releases.some((item) => item.release_id === release.release_id)) throw new Error(`Release already exists: ${release.release_id}`);
    data.releases.push(release);
    writeAgileState(data);
    appendAudit("agile.release_planned", "release", release.release_id, `Agile release planned: ${release.title}`);
    console.log(JSON.stringify(release, null, 2));
    return;
  }
  if (action === "readiness" || action === "check") {
    const release = findAgileRelease(data, id || flags.id);
    const stories = (release.story_ids || []).map((storyId) => findAgileStory(data, storyId));
    release.accepted_story_ids = stories.filter((story) => story.status === "accepted").map((story) => story.story_id);
    release.total_points = stories.reduce((sum, story) => sum + Number(story.estimate_points || 0), 0);
    release.readiness_status = computeReleaseReadiness(release, stories);
    release.updated_at = new Date().toISOString();
    writeAgileState(data);
    console.log(JSON.stringify(release, null, 2));
    return;
  }
  throw new Error(`Unknown agile release action: ${action}`);
}

function ensureBacklogItem(data, item) {
  if (data.backlog.some((entry) => entry.id === item.id)) return;
  data.backlog.push({
    id: item.id,
    title: item.title,
    type: item.type,
    priority: item.priority || "medium",
    source: item.source || "manual",
    status: item.status || "proposed",
    notes: "",
    created_at: new Date().toISOString()
  });
}

function findAgileStory(data, storyId) {
  if (!storyId) throw new Error("Missing story id.");
  const story = data.stories.find((item) => item.story_id === storyId);
  if (!story) throw new Error(`Story not found: ${storyId}`);
  return story;
}

function buildStoryText(role, want, value) {
  return `As a ${role}, I want to ${want || "[action]"}, so that ${value || "[value]"}.`;
}

function computeStoryReady(story) {
  return {
    source: Boolean(story.source),
    acceptance_criteria: (story.acceptance_criteria || []).length > 0,
    estimate: Number(story.estimate_points || 0) > 0,
    reviewer: Boolean(story.reviewer_id),
    test_notes: Boolean(story.test_notes || (story.definition_of_done && story.definition_of_done.tests_defined)),
    value: Boolean(story.value || story.business_value)
  };
}

function storyReadyStatus(ready) {
  return Object.values(ready).every(Boolean) ? "ready" : "not_ready";
}

function convertAgileStoryToTask(story, flags = {}) {
  if (story.task_id && !flags.force) return story.task_id;
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  if (data.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = parseCsv(flags.workstreams || flags.workstream || story.workstream || "unassigned");
  const appRefs = parseCsv(flags.apps || flags.app || flags["app-username"]);
  const appLinks = resolveTaskApps(appRefs);
  validateTaskBoundaryCreation(flags.type || "story", workstreams, appLinks);
  const taskItem = {
    id: taskId,
    title: flags.title || story.title,
    status: "proposed",
    type: flags.type || "story",
    workstream: workstreams[0] || "unassigned",
    workstreams,
    app_username: appLinks[0] ? appLinks[0].username : null,
    app_usernames: appLinks.map((appItem) => appItem.username),
    app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
    sprint_id: flags.sprint || story.sprint_id || null,
    source: "user_story",
    source_reference: `story:${story.story_id}`,
    story_id: story.story_id,
    epic_id: story.epic_id || null,
    acceptance_criteria: story.acceptance_criteria || [],
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  writeJsonFile(tasksFile, data);
  return taskId;
}

function upsertSprintRecord(sprintId, fields) {
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];
  let sprintItem = data.sprints.find((item) => item.id === sprintId);
  if (!sprintItem) {
    sprintItem = { id: sprintId, name: fields.name || sprintId, status: "planned", created_at: new Date().toISOString() };
    data.sprints.push(sprintItem);
  }
  Object.assign(sprintItem, fields, { updated_at: new Date().toISOString() });
  writeJsonFile(file, data);
}

function updateSprintStatus(sprintId, status) {
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];
  const sprintItem = data.sprints.find((item) => item.id === sprintId);
  if (sprintItem) {
    sprintItem.status = status;
    sprintItem.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
  }
}

function pointsForStories(data, storyIds) {
  return storyIds.reduce((sum, storyId) => {
    const story = data.stories.find((item) => item.story_id === storyId);
    return sum + Number(story ? story.estimate_points || 0 : 0);
  }, 0);
}

function refreshAgileDashboardState(existingData = null) {
  const data = existingData || readAgileState();
  const sprints = fileExists(".kabeeri/sprints.json") ? readJsonFile(".kabeeri/sprints.json").sprints || [] : [];
  const reviews = data.sprint_reviews || [];
  const activeSprints = sprints.filter((item) => ["planned", "active", "in_progress"].includes(item.status || "planned"));
  const openImpediments = (data.impediments || []).filter((item) => item.status !== "resolved");
  const releases = data.releases || [];
  const nextRelease = releases.find((item) => !["released", "cancelled"].includes(item.status || "planned")) || releases[releases.length - 1] || null;
  const acceptedReviews = reviews.filter((item) => Number(item.accepted_points || 0) > 0 || Number(item.rework_points || 0) > 0);
  const lastFive = acceptedReviews.slice(-5);
  const averageVelocity = lastFive.length
    ? Math.round((lastFive.reduce((sum, item) => sum + Number(item.accepted_points || 0), 0) / lastFive.length) * 10) / 10
    : 0;
  const remainingPoints = (data.stories || [])
    .filter((item) => !["accepted", "deferred"].includes(item.status || "backlog"))
    .reduce((sum, item) => sum + Number(item.estimate_points || 0), 0);
  const actionItems = buildAgileActionItems(data, activeSprints, openImpediments, averageVelocity);
  const state = {
    generated_at: new Date().toISOString(),
    source: ".kabeeri/agile.json",
    live_json_path: ".kabeeri/dashboard/agile_state.json",
    live_api_path: "/__kvdf/api/agile",
    summary: {
      backlog_items: data.backlog.length,
      epics: data.epics.length,
      stories: data.stories.length,
      ready_stories: data.stories.filter((item) => item.ready_status === "ready").length,
      not_ready_stories: data.stories.filter((item) => item.ready_status !== "ready").length,
      committed_stories: data.stories.filter((item) => item.status === "selected_for_sprint").length,
      sprint_reviews: reviews.length,
      open_impediments: openImpediments.length,
      retrospectives: (data.retrospectives || []).length,
      releases: releases.length,
      next_release: nextRelease ? nextRelease.release_id : "none",
      health: actionItems.some((item) => item.severity === "blocker") ? "blocked" : actionItems.length ? "needs_attention" : "healthy"
    },
    active_sprints: activeSprints.map((sprintItem) => ({
      id: sprintItem.id,
      goal: sprintItem.goal || "",
      status: sprintItem.status || "planned",
      committed_points: Number(sprintItem.committed_points || 0),
      capacity_points: Number(sprintItem.capacity_points || 0),
      planning_confidence: sprintItem.planning_confidence || ""
    })),
    velocity: {
      average_last_5_sprints: averageVelocity,
      reviewed_sprints: acceptedReviews.length,
      latest_accepted_points: acceptedReviews.length ? Number(acceptedReviews[acceptedReviews.length - 1].accepted_points || 0) : 0
    },
    forecast: {
      remaining_points: remainingPoints,
      average_velocity: averageVelocity,
      estimated_sprints_remaining: averageVelocity > 0 ? Math.ceil(remainingPoints / averageVelocity) : null
    },
    impediments: openImpediments,
    releases: releases.slice(-5),
    release_readiness: nextRelease ? {
      release_id: nextRelease.release_id,
      status: nextRelease.status,
      readiness_status: nextRelease.readiness_status || "unknown",
      target_date: nextRelease.target_date || null,
      story_count: (nextRelease.story_ids || []).length,
      accepted_story_count: (nextRelease.accepted_story_ids || []).length,
      risk_level: nextRelease.risk_level || "medium"
    } : null,
    retrospectives: (data.retrospectives || []).slice(-5),
    action_items: actionItems
  };
  if (fileExists(".kabeeri/dashboard")) writeJsonFile(".kabeeri/dashboard/agile_state.json", state);
  return state;
}

function buildAgileActionItems(data, activeSprints, openImpediments, averageVelocity) {
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const notReady = (data.stories || []).filter((item) => item.ready_status !== "ready" && !["accepted", "deferred"].includes(item.status || "backlog"));
  if (notReady.length) add("warning", "readiness", `${notReady.length} stor(ies) are not Definition-of-Ready compliant.`, "Run `kvdf agile story ready <story-id>` after adding acceptance, points, reviewer, value, and test notes.");
  const readyUnconverted = (data.stories || []).filter((item) => item.ready_status === "ready" && !item.task_id);
  if (readyUnconverted.length) add("info", "task_conversion", `${readyUnconverted.length} ready stor(ies) are not governed tasks yet.`, "Run `kvdf agile story task <story-id>` before execution.");
  const severeImpediments = openImpediments.filter((item) => ["high", "critical"].includes(item.severity));
  if (severeImpediments.length) add("blocker", "impediments", `${severeImpediments.length} high/critical impediment(s) are open.`, "Resolve or explicitly re-plan the affected sprint/story.");
  for (const release of data.releases || []) {
    if (release.readiness_status === "blocked") add("blocker", "release", `Release ${release.release_id} is blocked.`, "Run `kvdf agile release readiness <release-id>` and resolve missing release criteria or open questions.");
    else if (release.readiness_status === "needs_attention") add("warning", "release", `Release ${release.release_id} needs attention.`, "Review release criteria, checks, risks, and unaccepted stories.");
  }
  for (const sprintItem of activeSprints) {
    if (!sprintItem.goal) add("warning", "sprint_goal", `Sprint ${sprintItem.id} has no sprint goal.`, "Add `--goal` during sprint planning.");
    if (Number(sprintItem.capacity_points || 0) && Number(sprintItem.committed_points || 0) > Number(sprintItem.capacity_points || 0) * 0.9) {
      add("warning", "capacity", `Sprint ${sprintItem.id} is committed above 90% of point capacity.`, "Review capacity buffer for bugs, review, and unplanned support.");
    }
  }
  if ((data.sprint_reviews || []).length >= 2 && averageVelocity === 0) add("warning", "velocity", "Reviewed sprints have zero accepted velocity.", "Review acceptance criteria, story slicing, and sprint commitment quality.");
  return items;
}

function renderAgileHealth(state) {
  const lines = [
    "# Kabeeri Agile Health",
    "",
    `Generated at: ${state.generated_at}`,
    `Health: ${state.summary.health}`,
    `Live JSON: ${state.live_json_path}`,
    "",
    "## Summary",
    ""
  ];
  for (const [key, value] of Object.entries(state.summary || {})) lines.push(`- ${key}: ${value}`);
  lines.push("", "## Forecast", "", `- remaining_points: ${state.forecast.remaining_points}`, `- average_velocity: ${state.forecast.average_velocity}`, `- estimated_sprints_remaining: ${state.forecast.estimated_sprints_remaining === null ? "unknown" : state.forecast.estimated_sprints_remaining}`);
  lines.push("", "## Action Items", "");
  if (!(state.action_items || []).length) lines.push("- None.");
  for (const item of state.action_items || []) lines.push(`- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`);
  return `${lines.join("\n")}\n`;
}

function hasOpenStoryImpediment(data, storyId, exceptId = null) {
  return (data.impediments || []).some((item) => item.story_id === storyId && item.impediment_id !== exceptId && item.status !== "resolved");
}

function inferSprintPlanningConfidence(capacityPoints, committedPoints, stories) {
  if (!capacityPoints) return "unknown";
  if (committedPoints > capacityPoints) return "overcommitted";
  if (committedPoints > capacityPoints * 0.9) return "low";
  if (stories.some((story) => story.ready_status !== "ready")) return "low";
  return "good";
}

function normalizeAgileSeverity(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid agile severity. Use low, medium, high, or critical.");
  return normalized;
}

function findActiveTaskToken(taskId, developerId) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  return tokens.find((token) => token.task_id === taskId && token.assignee_id === developerId && token.status === "active") || null;
}

function enforceTokenFileScope(sessionItem) {
  const token = sessionItem.token_id ? (readJsonFile(".kabeeri/tokens.json").tokens || []).find((item) => item.token_id === sessionItem.token_id) : null;
  if (!token) return;
  for (const file of sessionItem.files_touched || []) {
    if (matchesAny(file, token.forbidden_files || [])) {
      throw new Error(`File is forbidden by token ${token.token_id}: ${file}`);
    }
    if ((token.allowed_files || []).length > 0 && !matchesAny(file, token.allowed_files)) {
      throw new Error(`File is outside token scope ${token.token_id}: ${file}`);
    }
  }
}

function enforceSessionAppBoundary(sessionItem) {
  const taskItem = getTaskById(sessionItem.task_id);
  if (!taskItem) return;
  const appPaths = getTaskAppPaths(taskItem);
  if (appPaths.length === 0) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  for (const file of files) {
    const target = normalizeLockScope(file);
    if (!appPaths.some((appPath) => pathScopeContains(normalizeLockScope(appPath), target))) {
      throw new Error(`File is outside task app boundary: ${file}`);
    }
  }
}

function enforceSessionWorkstreamBoundary(sessionItem) {
  const taskStreams = getTaskWorkstreamsById(sessionItem.task_id);
  if (taskStreams.length === 0) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  for (const file of files) {
    if (!fileAllowedByWorkstreams(file, taskStreams)) {
      throw new Error(`File is outside task workstream boundary: ${file}`);
    }
  }
}

function fileAllowedByWorkstreams(file, workstreams) {
  const target = normalizeLockScope(file);
  const rules = (workstreams || []).flatMap((stream) => getWorkstreamPathRules(stream));
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    const normalized = normalizeLockScope(rule);
    if (!normalized) return false;
    if (normalized.includes("*")) {
      const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(target);
    }
    return target === normalized || target.startsWith(`${normalized}/`) || target.startsWith(normalized);
  });
}

function getTaskAppPaths(taskItem) {
  const direct = Array.isArray(taskItem.app_paths) ? taskItem.app_paths : [];
  if (direct.length > 0) return direct;
  const appNames = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
  if (appNames.length === 0) return [];
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  return apps
    .filter((appItem) => appNames.includes(appItem.username))
    .map((appItem) => appItem.path)
    .filter(Boolean);
}

function enforceSessionLockCoverage(sessionItem) {
  if (!hasConfiguredIdentities()) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  const locks = readJsonFile(".kabeeri/locks.json").locks || [];
  const activeTaskLocks = locks.filter((lockItem) => lockItem.status === "active" && lockItem.task_id === sessionItem.task_id);
  for (const file of files) {
    if (!activeTaskLocks.some((lockItem) => lockCoversFile(lockItem, file))) {
      throw new Error(`File is not covered by an active task lock: ${file}`);
    }
  }
}

function lockCoversFile(lockItem, file) {
  const type = normalizeLockType(lockItem.type);
  const scope = normalizeLockScope(lockItem.scope);
  const target = normalizeLockScope(file);
  if (type === "file") return scope === target;
  if (type === "folder") return pathScopeContains(scope, target);
  return false;
}

function assertTaskCanStart(task) {
  if (!task.assignee_id) throw new Error("Task cannot start without assignee.");
  const tokenData = readJsonFile(".kabeeri/tokens.json");
  const token = (tokenData.tokens || []).find((item) => item.task_id === task.id && item.assignee_id === task.assignee_id && item.status === "active");
  if (!token) throw new Error("Task cannot start without active access token for assignee.");
  if (isExpired(token.expires_at)) throw new Error(`Task access token expired: ${token.token_id}`);
  const lockData = readJsonFile(".kabeeri/locks.json");
  const hasLock = (lockData.locks || []).some((item) => item.task_id === task.id && item.status === "active");
  if (!hasLock) throw new Error("Task cannot start without at least one active lock.");
}

function requireAcceptanceForVerify(task) {
  const criteria = task.acceptance_criteria || [];
  if (criteria.length > 0) return;
  if (!fileExists(".kabeeri/acceptance.json")) throw new Error(`Task ${task.id} cannot be verified without acceptance criteria or reviewed acceptance record.`);
  const acceptanceState = readJsonFile(".kabeeri/acceptance.json");
  const checklist = (acceptanceState.checklists || []).find((item) => item.task_id === task.id);
  if (checklist && (checklist.items || []).some((item) => !item.checked)) {
    throw new Error(`Checklist incomplete for task ${task.id}. Please complete all checklist items first.`);
  }
  const records = acceptanceState.records || [];
  const accepted = records.some((record) => {
    const sameTask = record.task_id === task.id || record.subject_id === task.id;
    const reviewed = ["reviewed", "accepted"].includes(record.status);
    const passed = !record.result || record.result === "pass";
    return sameTask && reviewed && passed;
  });
  if (!accepted) throw new Error(`Task ${task.id} cannot be verified without acceptance criteria or reviewed acceptance record.`);
}

function findAgileRelease(data, releaseId) {
  if (!releaseId) throw new Error("Missing release id.");
  const release = (data.releases || []).find((item) => item.release_id === releaseId);
  if (!release) throw new Error(`Release not found: ${releaseId}`);
  return release;
}

function normalizeAgileReleaseRisk(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid agile release risk. Use low, medium, high, or critical.");
  return normalized;
}

function inferReleaseRisk(stories, flags = {}) {
  if (flags.questions || flags["open-questions"]) return "high";
  if (stories.some((story) => story.ready_status !== "ready" || story.status === "blocked")) return "high";
  if (stories.some((story) => story.status !== "accepted")) return "medium";
  return "low";
}

function computeReleaseReadiness(release, stories) {
  if ((release.open_questions || []).length) return "blocked";
  if ((release.release_criteria || []).length === 0 || (release.required_checks || []).length === 0) return "needs_attention";
  if (stories.some((story) => story.status === "blocked")) return "blocked";
  if (stories.some((story) => story.status !== "accepted")) return "needs_attention";
  if (["high", "critical"].includes(release.risk_level || "medium")) return "needs_attention";
  return "ready";
}

function runGithubWriteGate(action, subaction, plan, flags) {
  ensureWorkspace();
  const operation = `github ${action || "plan"} ${subaction || ""}`.trim();
  return runPolicyGate("github_write", {
    operation,
    version: plan.version,
    confirm: true
  }, flags);
}

function runReleasePublishGates(plan, flags = {}) {
  ensureWorkspace();
  const readinessGate = buildReadinessReport({ target: "release", strict: true });
  if (readinessGate.status !== "ready") {
    const readinessDetails = [
      ...readinessGate.blockers.map((item) => `- ${item}`),
      ...readinessGate.warnings.map((item) => `- ${item}`)
    ].join("; ");
    throw new Error(`Release publish blocked by readiness: ${readinessDetails || readinessGate.status}. Run \`kvdf readiness report --target release --strict\`.`);
  }
  const releaseGate = runPolicyGate("release", {
    version: plan.version,
    confirm: true
  }, flags);
  const githubGate = runGithubWriteGate("release", "publish", plan, flags);
  return { releaseGate, githubGate };
}

function githubConfig(action, flags = {}) {
  ensureWorkspace();
  const file = ".kabeeri/github/sync_config.json";
  const data = fileExists(file) ? readJsonFile(file) : { dry_run_default: true, write_requires_confirmation: true };

  if (!action || action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "set") {
    if (flags.repo) data.repo = flags.repo;
    if (flags.branch) data.branch = flags.branch;
    if (flags["default-version"]) data.default_version = flags["default-version"];
    if (flags.version) data.default_version = flags.version;
    if (flags["dry-run-default"] !== undefined) data.dry_run_default = flags["dry-run-default"] !== "false";
    data.write_requires_confirmation = true;
    data.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("github.config.updated", "github", "sync_config", "GitHub sync config updated");
    console.log("GitHub sync config updated.");
    return;
  }

  throw new Error(`Unknown GitHub config action: ${action}`);
}

function printGithubDryRun(plan, flags) {
  const lines = [
    `GitHub dry-run for ${plan.version}`,
    `Source: ${plan.file}`,
    "",
    `Labels: ${plan.data.labels.length}`,
    `Milestones: ${plan.data.milestones.length}`,
    `Issues: ${countIssues(plan.data)}`,
    "",
    "No remote GitHub changes were made."
  ];
  return outputLines(lines, flags.output);
}

function printGithubLabels(plan, flags) {
  const lines = [
    `GitHub label sync dry-run for ${plan.version}`,
    "",
    ...plan.data.labels.map((label) => `gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubMilestones(plan, flags) {
  const lines = [
    `GitHub milestone sync dry-run for ${plan.version}`,
    "",
    ...plan.data.milestones.map((milestone) => `gh api repos/:owner/:repo/milestones -f title="${milestone.title}" -f description="${milestone.goal}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubIssues(plan, flags) {
  const lines = [`GitHub issue sync dry-run for ${plan.version}`, ""];
  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const labels = (issue.labels || []).join(",");
      lines.push(`gh issue create --title "${escapeShellText(issue.title)}" --milestone "${escapeShellText(milestone.title)}" --label "${escapeShellText(labels)}"`);
    }
  }
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function syncGithubLabels(plan) {
  ensureGhAvailable();
  let created = 0;
  let updated = 0;
  for (const label of plan.data.labels) {
    const create = runGh(["label", "create", label.name, "--color", label.color, "--description", label.description], { allowFailure: true });
    if (create.ok) {
      created += 1;
    } else {
      runGh(["label", "edit", label.name, "--color", label.color, "--description", label.description]);
      updated += 1;
    }
  }
  console.log(`GitHub labels synced for ${plan.version}: ${created} created, ${updated} updated.`);
}

function syncGithubMilestones(plan) {
  ensureGhAvailable();
  const existing = getGithubMilestoneTitles();
  let created = 0;
  let skipped = 0;
  for (const milestone of plan.data.milestones) {
    if (existing.has(milestone.title)) {
      skipped += 1;
      continue;
    }
    runGh(["api", "repos/:owner/:repo/milestones", "-f", `title=${milestone.title}`, "-f", `description=${milestone.goal}`]);
    created += 1;
  }
  console.log(`GitHub milestones synced for ${plan.version}: ${created} created, ${skipped} existing.`);
}

function syncGithubIssues(plan) {
  ensureGhAvailable();
  const issueMap = loadIssueMap();
  let created = 0;
  let skipped = 0;

  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const issueKey = makePlanIssueKey(plan.version, milestone.title, issue.title);
      if (issueMap.items.some((item) => item.issue_key === issueKey && item.issue_number)) {
        skipped += 1;
        continue;
      }
      const labels = (issue.labels || []).join(",");
      const body = buildGithubIssueBody(plan, milestone, issue, issueKey);
      const args = ["issue", "create", "--title", issue.title, "--body", body, "--milestone", milestone.title];
      if (labels) args.push("--label", labels);
      const result = runGh(args);
      const issueNumber = parseIssueNumber(result.stdout);
      issueMap.items.push({
        issue_key: issueKey,
        issue_number: issueNumber,
        title: issue.title,
        milestone: milestone.title,
        labels: issue.labels || [],
        synced_at: new Date().toISOString()
      });
      created += 1;
    }
  }

  saveIssueMap(issueMap);
  console.log(`GitHub issues synced for ${plan.version}: ${created} created, ${skipped} existing.`);
}

function publishGithubRelease(plan, flags) {
  if (!flags.publishGatesPassed) runReleasePublishGates(plan, flags);
  ensureGhAvailable();
  const notesFile = flags.notes || `.kabeeri/releases/${plan.version}.notes.md`;
  writeTextFile(notesFile, `${buildReleaseNotes(plan).join("\n")}\n`);
  runGh(["release", "create", plan.version, "--title", `Kabeeri VDF ${plan.version}`, "--notes-file", notesFile]);
  console.log(`Published GitHub release ${plan.version}.`);
}

function ensureGhAvailable() {
  runGh(["--version"]);
}

function runGh(args, options = {}) {
  const { execFileSync } = require("child_process");
  try {
    const stdout = execFileSync("gh", args, { cwd: repoRoot(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, stdout: stdout.trim() };
  } catch (error) {
    if (options.allowFailure) {
      return { ok: false, stdout: error.stdout ? String(error.stdout) : "", stderr: error.stderr ? String(error.stderr) : error.message };
    }
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`gh ${args.join(" ")} failed: ${stderr}`);
  }
}

function getGithubMilestoneTitles() {
  const result = runGh(["api", "repos/:owner/:repo/milestones", "--paginate", "--jq", ".[].title"]);
  return new Set(result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

function loadIssueMap() {
  if (!fileExists(".kabeeri")) return { items: [], workspace: false };
  const file = ".kabeeri/github/issue_map.json";
  const data = fileExists(file) ? readJsonFile(file) : {};
  return {
    workspace: true,
    tasks: data.tasks || [],
    conflicts: data.conflicts || [],
    items: data.items || []
  };
}

function saveIssueMap(issueMap) {
  if (!issueMap.workspace) return;
  writeJsonFile(".kabeeri/github/issue_map.json", {
    tasks: issueMap.tasks || [],
    conflicts: issueMap.conflicts || [],
    items: issueMap.items || []
  });
}

function makePlanIssueKey(version, milestoneTitle, issueTitle) {
  return `${version}:${milestoneTitle}:${issueTitle}`;
}

function buildGithubIssueBody(plan, milestone, issue, issueKey) {
  return [
    "<!-- kabeeri-task-sync -->",
    `Plan: ${plan.version}`,
    `Issue key: ${issueKey}`,
    `Milestone goal: ${milestone.goal}`,
    "",
    "Labels:",
    ...(issue.labels || []).map((label) => `- ${label}`),
    "",
    "Generated by Kabeeri VDF CLI."
  ].join("\n");
}

function parseIssueNumber(output) {
  const match = String(output || "").match(/\/issues\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function refreshLiveReportsState(overrides = {}) {
  ensureWorkspace();
  const state = buildLiveReportsState(overrides);
  writeJsonFile(".kabeeri/reports/live_reports_state.json", state);
  return state;
}

function buildLiveReportsState(overrides = {}) {
  const taskTracker = overrides.task_tracker || refreshTaskTrackerState();
  const readiness = overrides.readiness || buildReadinessReport();
  const governance = overrides.governance || buildGovernanceReport();
  const packageCheck = overrides.package || buildPackageCheck();
  const upgradeCheck = overrides.upgrade || buildUpgradeCheck();
  const structuredDelivery = overrides.structured || refreshStructuredDashboardState();
  const resumeReport = overrides.resume || buildResumeReport({ scan: false });
  const dashboardUxAudits = readStateArray(".kabeeri/dashboard/ux_audits.json", "audits");
  const latestDashboardUx = dashboardUxAudits.length ? dashboardUxAudits[dashboardUxAudits.length - 1] : null;
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], current_change_id: null };
  const evolutionSummary = buildEvolutionSummaryService(evolutionState);
  const securityScan = getLatestSecurityScan();
  const migrationChecks = latestMigrationChecks();
  const generatedAt = new Date().toISOString();
  const reports = {
    readiness,
    governance,
    package: packageCheck,
    upgrade: upgradeCheck,
    structured: structuredDelivery,
    task_tracker: taskTracker,
    dashboard_ux: latestDashboardUx ? {
      report_type: "dashboard_ux_latest",
      status: latestDashboardUx.status,
      audit_id: latestDashboardUx.audit_id,
      audited_at: latestDashboardUx.audited_at,
      score: latestDashboardUx.score,
      max_score: latestDashboardUx.max_score,
      blockers: latestDashboardUx.blockers || 0,
      warnings: latestDashboardUx.warnings || 0
    } : {
      report_type: "dashboard_ux_latest",
      status: "missing",
      audit_id: null,
      blockers: 0,
      warnings: 1
    },
    evolution: evolutionSummary,
    security: securityScan ? {
      report_type: "security_latest",
      status: securityScan.status,
      scan_id: securityScan.scan_id,
      scanned_at: securityScan.scanned_at || securityScan.generated_at || null,
      findings_total: securityScan.findings_total || 0,
      blocker_findings: securityScan.blocker_findings || 0
    } : {
      report_type: "security_latest",
      status: "missing",
      scan_id: null,
      findings_total: 0,
      blocker_findings: 0
    },
    migration: {
      report_type: "migration_latest",
      status: migrationChecks.some((item) => item.status === "blocked") ? "blocked" : migrationChecks.length ? "checked" : "missing",
      checks_total: migrationChecks.length,
      blocked_checks: migrationChecks.filter((item) => item.status === "blocked").length,
      latest_check_id: migrationChecks.length ? migrationChecks[migrationChecks.length - 1].check_id : null
    }
  };
  const actionItems = buildLiveReportActionItems(reports, resumeReport);
  const blockedScenarios = buildBlockedScenariosReport(reports, actionItems, generatedAt);
  reports.blocked_scenarios = blockedScenarios;
  return {
    generated_at: generatedAt,
    source: ".kabeeri",
    live_json_path: ".kabeeri/reports/live_reports_state.json",
    live_api_path: "/__kvdf/api/reports",
    update_policy: {
      markdown_reports: "Human-readable snapshots. Regenerate only for review, handoff, or release.",
      live_json: "Derived runtime status. Refresh after task, dashboard, policy, security, migration, readiness, or governance changes.",
      source_of_truth: ".kabeeri state files remain canonical; live reports are derived summaries."
    },
    summary: {
      status: blockedScenarios.summary.blockers > 0 || reports.readiness.status === "blocked" || reports.governance.status === "blocked" || reports.package.status === "blocked" || reports.migration.status === "blocked" || reports.structured.summary.health === "blocked" ? "blocked" : actionItems.some((item) => item.severity === "warning") ? "warning" : "ready",
      readiness: reports.readiness.status,
      governance: reports.governance.status,
      package: reports.package.status,
      upgrade: reports.upgrade.status,
      structured: reports.structured.summary.health,
      task_tracker_open: reports.task_tracker.summary.open || 0,
      task_tracker_blocked: reports.task_tracker.summary.blocked || 0,
      dashboard_ux: reports.dashboard_ux.status,
      evolution: reports.evolution.status,
      security: reports.security.status,
      migration: reports.migration.status,
      action_items: actionItems.length,
      blocked_scenarios: blockedScenarios.summary.blockers
    },
    reports,
    blocked_scenarios: blockedScenarios,
    action_items: actionItems
  };
}

function buildLiveReportActionItems(reports, resumeReport = null) {
  const items = [];
  const push = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  if (reports.readiness.status === "blocked") push("blocker", "readiness", "Readiness report is blocked.", "Run `kvdf readiness report --json` and resolve blockers.");
  if (reports.governance.status === "blocked") push("blocker", "governance", "Governance report is blocked.", "Run `kvdf governance report --json` and resolve blockers.");
  if (reports.package.status === "blocked") push("blocker", "package", "Package check is blocked.", "Run `kvdf package check` and fix package contract blockers.");
  if (reports.structured && reports.structured.summary && reports.structured.summary.health === "blocked") push("blocker", "structured", "Structured delivery health is blocked.", "Run `kvdf structured health --json` and resolve phase, requirement, risk, or gate blockers.");
  if (reports.migration.status === "blocked") push("blocker", "migration", "Latest migration checks include blockers.", "Run `kvdf migration audit` and resolve blocked checks.");
  if (reports.security.status === "missing") push("warning", "security", "No security scan is recorded.", "Run `kvdf security scan` before release or handoff.");
  if (reports.dashboard_ux.status === "missing") push("warning", "dashboard", "No dashboard UX audit is recorded.", "Run `kvdf dashboard ux` after dashboard changes.");
  if (reports.evolution && reports.evolution.open_follow_up_tasks > 0) push("warning", "evolution", `${reports.evolution.open_follow_up_tasks} Evolution Steward follow-up task(s) are still open.`, "Run `kvdf evolution status` and finish dependent docs/runtime/test updates.");
  if (resumeReport && resumeReport.track_context && resumeReport.track_context.mismatch) {
    push(
      "warning",
      "track",
      "Session track differs from the current workspace context.",
      "Run `kvdf track route` or `kvdf resume` so the workspace context becomes the active track source."
    );
  }
  if ((reports.task_tracker.summary.open || 0) > 0) push("info", "tasks", `${reports.task_tracker.summary.open} task(s) are open.`, "Run `kvdf task tracker` for next actions.");
  return items;
}

function buildBlockedScenariosReport(reports, actionItems = [], generatedAt = new Date().toISOString()) {
  const blockers = [];
  const warnings = [];
  const push = (bucket, area, message, nextAction) => bucket.push({ area, message, next_action: nextAction });
  const reportBlock = (report, area, fallbackNextAction) => {
    if (!report) return;
    if (report.status === "blocked") push(blockers, area, `${capitalize(area)} report is blocked.`, fallbackNextAction);
    else if (report.status === "warning" || report.status === "needs_attention") push(warnings, area, `${capitalize(area)} report needs attention.`, fallbackNextAction);
  };

  reportBlock(reports.readiness, "readiness", "Run `kvdf readiness report --json` and resolve blockers.");
  reportBlock(reports.governance, "governance", "Run `kvdf governance report --json` and resolve blockers.");
  reportBlock(reports.package, "package", "Run `kvdf package check` and fix package contract blockers.");
  reportBlock(reports.structured, "structured", "Run `kvdf structured health --json` and resolve phase, requirement, risk, or gate blockers.");
  reportBlock(reports.migration, "migration", "Run `kvdf migration audit` and resolve blocked checks.");
  reportBlock(reports.security, "security", "Run `kvdf security scan` and remove high-risk findings.");
  reportBlock(reports.dashboard_ux, "dashboard", "Run `kvdf dashboard ux` after dashboard changes.");
  reportBlock(reports.evolution, "evolution", "Run `kvdf evolution status` and finish dependent docs/runtime/test updates.");

  const openTasks = Number(reports.task_tracker && reports.task_tracker.summary && reports.task_tracker.summary.open ? reports.task_tracker.summary.open : 0);
  const blockedTasks = Number(reports.task_tracker && reports.task_tracker.summary && reports.task_tracker.summary.blocked ? reports.task_tracker.summary.blocked : 0);
  if (blockedTasks > 0) push(blockers, "tasks", `${blockedTasks} task(s) are blocked.`, "Run `kvdf task tracker` and resolve blockers before closing tasks.");
  else if (openTasks > 0) push(warnings, "tasks", `${openTasks} task(s) are still open.`, "Run `kvdf task tracker` for next actions.");

  for (const item of actionItems || []) {
    if (item.severity === "blocker" && !blockers.some((entry) => entry.area === item.area && entry.message === item.message)) {
      push(blockers, item.area, item.message, item.next_action);
    } else if (item.severity === "warning" && !warnings.some((entry) => entry.area === item.area && entry.message === item.message)) {
      push(warnings, item.area, item.message, item.next_action);
    }
  }

  const summary = {
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "clear",
    blockers: blockers.length,
    warnings: warnings.length,
    total: blockers.length + warnings.length
  };
  return {
    report_type: "blocked_scenarios_report",
    generated_at: generatedAt,
    source: ".kabeeri",
    summary,
    blockers,
    warnings,
    next_actions: buildBlockedScenariosNextActions(blockers, warnings)
  };
}

function buildBlockedScenariosNextActions(blockers, warnings) {
  const actions = [];
  if (blockers.length) {
    actions.push(...blockers.slice(0, 6).map((item) => item.next_action).filter(Boolean));
    actions.push("Resolve the blocked scenarios before continuing broad development.");
  } else if (warnings.length) {
    actions.push(...warnings.slice(0, 6).map((item) => item.next_action).filter(Boolean));
    actions.push("Warnings are not hard blockers, but they should be reviewed before the next release or handoff.");
  } else {
    actions.push("No blocked scenarios recorded.");
  }
  return uniqueList(actions);
}

function renderLiveReportsState(state) {
  return [
    "# Kabeeri Live Reports State",
    "",
    `Generated at: ${state.generated_at}`,
    `Status: ${state.summary.status}`,
    `Live JSON: ${state.live_json_path}`,
    `Live API: ${state.live_api_path}`,
    "",
    "## Summary",
    "",
    ...objectLines(state.summary),
    "",
    "## Action Items",
    "",
    ...(state.action_items.length ? state.action_items.map((item) => `- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`) : ["No live report action items."])
  ];
}

function normalizeIndependentReportTarget(value) {
  const target = String(value || "workspace").trim().toLowerCase().replace(/_/g, "-");
  const aliases = {
    demo: "demo",
    show: "demo",
    handoff: "handoff",
    delivery: "handoff",
    release: "release",
    publish: "publish",
    production: "publish",
    workspace: "workspace",
    all: "workspace"
  };
  return aliases[target] || "workspace";
}

function isStrictReport(flags = {}) {
  return flags.strict === true || flags.strict === "true" || flags.mode === "strict";
}

function buildIndependentReportMeta(type, target, flags = {}) {
  return {
    report_id: `${type}-${target}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    report_type: type,
    target,
    strict: isStrictReport(flags),
    standalone: true,
    source_of_truth: ".kabeeri",
    dashboard_required: false,
    live_server_required: false,
    output_contract: {
      markdown: type === "readiness" ? ".kabeeri/reports/readiness_report.md" : ".kabeeri/reports/governance_report.md",
      json: "Use --json or --output <file>.json",
      live_json_refresh: ".kabeeri/reports/live_reports_state.json"
    }
  };
}

function buildReadinessReport(flags = {}) {
  const target = normalizeIndependentReportTarget(flags.target || flags.for || flags.scope);
  const strict = isStrictReport(flags);
  const state = collectDashboardState();
  const validation = validateRepository("all");
  const tasks = state.records.tasks;
  const features = state.records.features;
  const journeys = state.records.journeys;
  const latestPolicies = latestPolicyResults();
  const securityScan = getLatestSecurityScan();
  const migrationChecks = latestMigrationChecks();
  const policyBlockers = latestPolicies.filter((item) => item.status === "blocked");
  const migrationBlockers = migrationChecks.filter((item) => item.status === "blocked");
  const openTasks = tasks.filter((item) => !["owner_verified", "done", "closed", "rejected"].includes(item.status));
  const reviewTasks = tasks.filter((item) => ["review", "needs_review"].includes(item.status));
  const unreadyFeatures = features.filter((item) => !["ready_to_demo", "ready_to_publish"].includes(item.readiness || "future"));
  const unreadyJourneys = journeys.filter((item) => !(item.ready_to_show || item.status === "ready_to_show"));
  const unreviewedAiRuns = state.records.ai_run_report.totals.unreviewed || 0;
  const unresolvedCaptures = state.records.vibe_captures.filter((item) => !["resolved", "converted_to_task", "linked"].includes(item.status));
  const ungovernedCaptures = state.records.vibe_captures.filter((item) => !item.task_id && !["resolved", "converted_to_task", "linked"].includes(item.status));
  const activeUngovernedCaptures = state.records.vibe_captures.filter((item) => !item.task_id && (item.files_changed || []).length && !["resolved", "converted_to_task", "linked", "rejected"].includes(item.status));
  const blockers = [];
  const warnings = [];

  if (!validation.ok) blockers.push("Repository validation has failures.");
  if (policyBlockers.length) blockers.push(`${policyBlockers.length} latest policy result(s) are blocked.`);
  if (securityScan && securityScan.status === "blocked") blockers.push(`Latest security scan is blocked: ${securityScan.scan_id}.`);
  if (!securityScan) warnings.push("No security scan has been recorded.");
  if (migrationBlockers.length) blockers.push(`${migrationBlockers.length} latest migration check(s) are blocked.`);
  if (openTasks.length) warnings.push(`${openTasks.length} task(s) are still open.`);
  if (reviewTasks.length) warnings.push(`${reviewTasks.length} task(s) are waiting for review.`);
  if (unreadyFeatures.length) warnings.push(`${unreadyFeatures.length} feature(s) are not demo/publish ready.`);
  if (unreadyJourneys.length) warnings.push(`${unreadyJourneys.length} journey record(s) are not ready to show.`);
  if (unreviewedAiRuns) warnings.push(`${unreviewedAiRuns} AI run(s) are unreviewed.`);
  if (unresolvedCaptures.length) warnings.push(`${unresolvedCaptures.length} post-work capture(s) still need resolution.`);
  if (activeUngovernedCaptures.length) blockers.push(`${activeUngovernedCaptures.length} post-work capture(s) changed files without a linked task.`);
  else if (ungovernedCaptures.length) warnings.push(`${ungovernedCaptures.length} post-work capture(s) are not linked to tasks.`);
  if (strict && warnings.length) blockers.push(`Strict ${target} readiness treats warnings as release blockers.`);

  const meta = buildIndependentReportMeta("readiness", target, flags);
  return {
    ...meta,
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "ready",
    interpretation: blockers.length ? `${target} readiness is blocked.` : warnings.length ? `${target} readiness has warnings but no hard blockers.` : `${target} readiness is clear.`,
    blockers,
    warnings,
    summary: {
      tasks_total: tasks.length,
      open_tasks: openTasks.length,
      verified_tasks: tasks.filter((item) => item.status === "owner_verified").length,
      features_total: features.length,
      features_ready_to_demo: features.filter((item) => item.readiness === "ready_to_demo").length,
      features_ready_to_publish: features.filter((item) => item.readiness === "ready_to_publish").length,
      journeys_total: journeys.length,
      journeys_ready_to_show: journeys.filter((item) => item.ready_to_show || item.status === "ready_to_show").length,
      policy_blockers: policyBlockers.length,
      migration_blockers: migrationBlockers.length,
      security_status: securityScan ? securityScan.status : "missing",
      handoff_packages: state.records.handoff_packages.length,
      unreviewed_ai_runs: unreviewedAiRuns,
      unresolved_captures: unresolvedCaptures.length,
      ungoverned_captures: ungovernedCaptures.length
    },
    validation: {
      ok: validation.ok,
      failures: validation.lines.filter((line) => line.startsWith("FAIL"))
    },
    records: {
      open_tasks: openTasks.map(taskReportItem),
      unready_features: unreadyFeatures.map((item) => ({ id: item.id, title: item.title, readiness: item.readiness || "future" })),
      unready_journeys: unreadyJourneys.map((item) => ({ id: item.id, name: item.name, status: item.status || "draft" })),
      policy_blockers: policyBlockers.map(policyReportItem),
      migration_blockers: migrationBlockers.map((item) => ({ check_id: item.check_id, plan_id: item.plan_id, status: item.status })),
      latest_security_scan: securityScan ? { scan_id: securityScan.scan_id, status: securityScan.status, findings_total: securityScan.findings_total || 0 } : null,
      ungoverned_captures: ungovernedCaptures.map((item) => ({ capture_id: item.capture_id, classification: item.classification, files_changed: item.files_changed || [], status: item.status }))
    },
    next_actions: buildReadinessNextActions(target, blockers, warnings)
  };
}

function buildAdrAiRunTraceReport(adrs, runs) {
  const runsById = Object.fromEntries((runs || []).map((item) => [item.run_id, item]));
  const adrTrace = (adrs || []).map((adrItem) => {
    const linkedRuns = (adrItem.related_ai_runs || []).map((runId) => runsById[runId]).filter(Boolean);
    return {
      adr_id: adrItem.adr_id,
      title: adrItem.title,
      status: adrItem.status,
      impact: adrItem.impact || "",
      tasks: adrItem.related_tasks || [],
      run_ids: linkedRuns.map((item) => item.run_id),
      runs_total: linkedRuns.length,
      accepted_runs: linkedRuns.filter((item) => item.status === "accepted").length,
      rejected_runs: linkedRuns.filter((item) => item.status === "rejected").length,
      unreviewed_runs: linkedRuns.filter((item) => !["accepted", "rejected"].includes(item.status)).length,
      tokens: linkedRuns.reduce((sum, item) => sum + Number(item.total_tokens || 0), 0),
      cost: linkedRuns.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      decision: adrItem.decision
    };
  });
  const linkedRunIds = new Set(adrTrace.flatMap((item) => item.run_ids));
  const runsWithAdrField = new Set((runs || []).flatMap((item) => item.related_adrs || []).filter(Boolean));
  const unlinkedRuns = (runs || []).filter((item) => !linkedRunIds.has(item.run_id) && !(item.related_adrs || []).length);
  const openHighImpact = (adrs || []).filter((item) => item.status === "proposed" && ["critical", "high"].includes(item.impact || ""));
  const warnings = [];
  if (openHighImpact.length) warnings.push(`${openHighImpact.length} high-impact ADR(s) still need approval.`);
  if (unlinkedRuns.length) warnings.push(`${unlinkedRuns.length} AI run(s) are not linked to any ADR. This is fine for task-only work but weak for durable decisions.`);
  if (runsWithAdrField.size && !linkedRunIds.size) warnings.push("Some AI runs declare ADR links; run `kvdf ai-run link` if ADR records do not show them.");
  return {
    trace_id: `adr-ai-run-trace-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    generated_at: new Date().toISOString(),
    status: openHighImpact.length ? "needs_attention" : "pass",
    summary: {
      adrs_total: (adrs || []).length,
      approved_adrs: (adrs || []).filter((item) => item.status === "approved").length,
      ai_runs_total: (runs || []).length,
      linked_ai_runs: linkedRunIds.size,
      unlinked_ai_runs: unlinkedRuns.length,
      open_high_impact_adrs: openHighImpact.length
    },
    warnings,
    adr_trace: adrTrace,
    unlinked_run_ids: unlinkedRuns.map((item) => item.run_id),
    next_actions: buildAdrAiRunTraceNextActions(openHighImpact, unlinkedRuns)
  };
}

function buildAdrAiRunTraceNextActions(openHighImpact, unlinkedRuns) {
  const actions = [];
  if (openHighImpact.length) actions.push("Approve, reject, or supersede high-impact ADRs before treating architecture as stable.");
  if (unlinkedRuns.length) actions.push("For AI runs that shaped architecture, run `kvdf ai-run link <run-id> --adr <adr-id>`.");
  if (!actions.length) actions.push("Continue using ADRs for durable decisions and AI run reviews for accepted/rejected output history.");
  return actions;
}

function buildAdrAiRunTraceMarkdown(trace) {
  return [
    "# ADR / AI Run Decision Trace",
    "",
    `Generated at: ${trace.generated_at}`,
    `Status: ${trace.status}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    ...Object.entries(trace.summary).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Warnings",
    "",
    ...(trace.warnings.length ? trace.warnings.map((item) => `- ${item}`) : ["- None."]),
    "",
    "## ADR Trace",
    "",
    "| ADR | Status | Impact | Runs | Accepted | Rejected | Unreviewed | Tokens | Cost | Title |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...(trace.adr_trace.length ? trace.adr_trace.map((item) => `| ${item.adr_id} | ${item.status} | ${item.impact} | ${item.runs_total} | ${item.accepted_runs} | ${item.rejected_runs} | ${item.unreviewed_runs} | ${item.tokens} | ${item.cost} | ${item.title} |`) : ["| none |  |  | 0 | 0 | 0 | 0 | 0 | 0 |  |"]),
    "",
    "## Unlinked AI Runs",
    "",
    ...(trace.unlinked_run_ids.length ? trace.unlinked_run_ids.map((item) => `- ${item}`) : ["- None."]),
    "",
    "## Next Actions",
    "",
    ...trace.next_actions.map((item) => `- ${item}`)
  ];
}

function buildGovernanceReport(flags = {}) {
  const target = normalizeIndependentReportTarget(flags.target || flags.for || flags.scope);
  const strict = isStrictReport(flags);
  const state = collectDashboardState();
  const validation = validateRepository("workspace");
  const tasks = state.records.tasks;
  const developers = state.technical.developers || [];
  const agents = state.technical.agents || [];
  const tokens = state.records.tokens;
  const locks = state.records.locks;
  const policies = latestPolicyResults();
  const activeOwners = developers.filter((item) => item.role === "Owner" && item.status !== "inactive");
  const activeLocks = locks.filter((item) => item.status === "active");
  const activeTokens = tokens.filter((item) => item.status === "active");
  const expiredActiveTokens = activeTokens.filter((item) => item.expires_at && new Date(item.expires_at).getTime() < Date.now());
  const lockConflicts = findLockConflicts(activeLocks);
  const knownWorkstreams = new Set(state.records.workstreams.map((item) => normalizeWorkstreamId(item.id)));
  const securityScan = getLatestSecurityScan();
  const migrationChecks = latestMigrationChecks();
  const unknownWorkstreamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).some((stream) => !knownWorkstreams.has(stream)));
  const missingAssigneeTasks = tasks.filter((item) => ["assigned", "in_progress", "review"].includes(item.status) && !item.assignee_id);
  const policyBlockers = policies.filter((item) => item.status === "blocked");
  const blockers = [];
  const warnings = [];

  if (!validation.ok) blockers.push("Workspace governance validation has failures.");
  if (activeOwners.length > 1) blockers.push(`Multiple active Owners detected: ${activeOwners.length}.`);
  if (lockConflicts.length) blockers.push(`${lockConflicts.length} active lock conflict(s) detected.`);
  if (expiredActiveTokens.length) blockers.push(`${expiredActiveTokens.length} active token(s) are expired.`);
  if (unknownWorkstreamTasks.length) blockers.push(`${unknownWorkstreamTasks.length} task(s) reference unknown workstreams.`);
  if (policyBlockers.length) blockers.push(`${policyBlockers.length} latest policy result(s) are blocked.`);
  if (securityScan && securityScan.status === "blocked") blockers.push(`Latest security scan is blocked: ${securityScan.scan_id}.`);
  if (activeOwners.length === 0) warnings.push("No active Owner identity is configured.");
  if (missingAssigneeTasks.length) warnings.push(`${missingAssigneeTasks.length} active task(s) have no assignee.`);
  if (!state.records.workstreams.length) warnings.push("No workstream registry is configured.");
  if (!securityScan) warnings.push("No security scan has been recorded.");
  if (migrationChecks.some((item) => item.status === "blocked")) warnings.push(`${migrationChecks.filter((item) => item.status === "blocked").length} migration check(s) are blocked.`);
  if (strict && warnings.length) blockers.push(`Strict ${target} governance treats warnings as blockers.`);
  const coverage = buildGovernanceCoverage({
    state,
    validation,
    activeOwners,
    activeLocks,
    activeTokens,
    expiredActiveTokens,
    lockConflicts,
    policyBlockers,
    securityScan,
    migrationChecks
  });

  const meta = buildIndependentReportMeta("governance", target, flags);
  return {
    ...meta,
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    interpretation: blockers.length ? `${target} governance is blocked.` : warnings.length ? `${target} governance has warnings but no hard blockers.` : `${target} governance is healthy.`,
    blockers,
    warnings,
    summary: {
      owners_active: activeOwners.length,
      developers: developers.length,
      agents: agents.length,
      workstreams: state.records.workstreams.length,
      tasks: tasks.length,
      active_locks: activeLocks.length,
      lock_conflicts: lockConflicts.length,
      active_tokens: activeTokens.length,
      expired_active_tokens: expiredActiveTokens.length,
      policy_blockers: policyBlockers.length,
      missing_assignee_tasks: missingAssigneeTasks.length,
      unknown_workstream_tasks: unknownWorkstreamTasks.length
    },
    coverage,
    validation: {
      ok: validation.ok,
      failures: validation.lines.filter((line) => line.startsWith("FAIL"))
    },
    records: {
      owners: activeOwners.map((item) => ({ id: item.id, name: item.name, role: item.role })),
      lock_conflicts: lockConflicts,
      expired_active_tokens: expiredActiveTokens.map((item) => ({ token_id: item.token_id, task_id: item.task_id, assignee_id: item.assignee_id, expires_at: item.expires_at })),
      unknown_workstream_tasks: unknownWorkstreamTasks.map(taskReportItem),
      missing_assignee_tasks: missingAssigneeTasks.map(taskReportItem),
      policy_blockers: policyBlockers.map(policyReportItem)
    },
    next_actions: buildGovernanceNextActions(target, blockers, warnings)
  };
}

function renderReadinessReport(report) {
  return [
    "# Kabeeri Readiness Report",
    "",
    `Report ID: ${report.report_id}`,
    `Generated at: ${report.generated_at}`,
    `Target: ${report.target}`,
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `Dashboard required: ${report.dashboard_required ? "yes" : "no"}`,
    `Source of truth: ${report.source_of_truth}`,
    `Strict: ${report.strict ? "yes" : "no"}`,
    `Interpretation: ${report.interpretation || (report.status === "warning" && report.blockers.length === 0 ? "Warning means open work or missing checks, not a hard blocker." : report.status === "blocked" ? "Blocked means release or handoff should stop until blockers are resolved." : "Ready means no blockers or warnings were detected.")}`,
    "",
    "## Summary",
    "",
    ...objectLines(report.summary),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No readiness blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No readiness warnings detected."]),
    "",
    "## Open Tasks",
    "",
    ...recordLines(report.records.open_tasks, (item) => `${item.id}: ${item.title} (${item.status})`),
    "",
    "## Policy Blockers",
    "",
    ...recordLines(report.records.policy_blockers, (item) => `${item.policy_id}: ${item.subject_id} (${item.status})`),
    "",
    "## Next Actions",
    "",
    ...recordLines(report.next_actions || [], (item) => item)
  ];
}

function renderGovernanceReport(report) {
  return [
    "# Kabeeri Governance Report",
    "",
    `Report ID: ${report.report_id}`,
    `Generated at: ${report.generated_at}`,
    `Target: ${report.target}`,
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `Dashboard required: ${report.dashboard_required ? "yes" : "no"}`,
    `Source of truth: ${report.source_of_truth}`,
    `Strict: ${report.strict ? "yes" : "no"}`,
    `Interpretation: ${report.interpretation || ""}`,
    "",
    "## Summary",
    "",
    ...objectLines(report.summary),
    "",
    "## Governance Coverage",
    "",
    ...(report.coverage && report.coverage.dimensions ? report.coverage.dimensions.map((item) => `- ${item.dimension}: ${item.status} — ${item.summary}`) : ["No governance coverage data."]),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No governance blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No governance warnings detected."]),
    "",
    "## Lock Conflicts",
    "",
    ...recordLines(report.records.lock_conflicts, (item) => `${item.left} overlaps ${item.right}`),
    "",
    "## Policy Blockers",
    "",
    ...recordLines(report.records.policy_blockers, (item) => `${item.policy_id}: ${item.subject_id} (${item.status})`),
    "",
    "## Next Actions",
    "",
    ...recordLines(report.next_actions || [], (item) => item)
  ];
}

function buildReadinessNextActions(target, blockers, warnings) {
  if (blockers.length) return [
    "Resolve blockers before demo, handoff, release, or publish review.",
    "Run `kvdf validate` and rerun `kvdf readiness report --target " + target + "`.",
    "Use `kvdf reports live --json` when a compact automation-readable state is needed."
  ];
  if (warnings.length) return [
    "Review warnings with the Owner and decide whether they are acceptable for this target.",
    "For release or publish targets, rerun with `--strict` if warnings should block.",
    "Regenerate the report after open tasks, security scans, migrations, or captures change."
  ];
  return [
    "Attach this readiness snapshot to handoff, release review, or publish notes.",
    "Regenerate it after any task, policy, security, migration, or post-work capture changes."
  ];
}

function buildGovernanceNextActions(target, blockers, warnings) {
  if (blockers.length) return [
    "Fix governance blockers before assigning new sensitive work.",
    "Run `kvdf governance report --target " + target + "` after Owner, token, lock, workstream, or policy fixes.",
    "Use task scopes, locks, and tokens to keep AI/developer execution bounded."
  ];
  if (warnings.length) return [
    "Review warnings before scaling work to more developers or AI agents.",
    "For release or publish targets, rerun with `--strict` if governance warnings should block.",
    "Keep Owner, workstream, token, and lock state current."
  ];
  return [
    "Governance is healthy for the selected target.",
    "Regenerate after assignment, lock, token, Owner, workstream, or policy changes."
  ];
}

function buildGovernanceCoverage({ state, validation, activeOwners, activeLocks, activeTokens, expiredActiveTokens, lockConflicts, policyBlockers, securityScan, migrationChecks }) {
  const pluginLoader = buildPluginLoaderReport();
  const ownerTrackPlugin = Array.isArray(pluginLoader.plugins)
    ? pluginLoader.plugins.find((plugin) => plugin.plugin_id === "owner-track")
    : null;
  const pluginLoaderConfigured = pluginLoader.total_plugins > 0 && pluginLoader.active_plugins > 0;
  const dimensions = [
    {
      dimension: "trust",
      status: activeOwners.length >= 1 && !validation.ok ? "attention" : activeOwners.length >= 1 ? "covered" : "needs_owner",
      summary: activeOwners.length >= 1 ? "Owner identity is configured for trust decisions." : "No active Owner identity is configured yet.",
      signals: {
        active_owners: activeOwners.length,
        owner_session: fileExists(".kabeeri/session.json") ? Boolean(readJsonFile(".kabeeri/session.json").owner_id) : false
      },
      next_action: activeOwners.length >= 1 ? "Keep owner sessions and verification evidence current." : "Configure an active Owner identity before expanding governance."
    },
    {
      dimension: "safety",
      status: validation.ok && !lockConflicts.length && !expiredActiveTokens.length ? "covered" : "needs_attention",
      summary: lockConflicts.length ? "Lock conflicts need resolution." : expiredActiveTokens.length ? "Expired active tokens need renewal or revocation." : "Locks and execution scopes keep safety boundaries visible.",
      signals: {
        lock_conflicts: lockConflicts.length,
        expired_active_tokens: expiredActiveTokens.length,
        active_locks: activeLocks.length,
        active_tokens: activeTokens.length
      },
      next_action: lockConflicts.length ? "Resolve overlapping locks before assigning more work." : "Keep tokens and locks aligned with active tasks."
    },
    {
      dimension: "privacy",
      status: securityScan && securityScan.status === "blocked" ? "blocked" : securityScan ? "covered" : "needs_scan",
      summary: securityScan ? `Latest security scan is ${securityScan.status}.` : "No security scan has been recorded yet.",
      signals: {
        security_scan_id: securityScan ? securityScan.scan_id || null : null,
        security_status: securityScan ? securityScan.status : "missing"
      },
      next_action: securityScan ? "Run a new security scan when secrets, auth, or privacy-sensitive code changes." : "Run `kvdf security scan` before release or handoff."
    },
    {
      dimension: "compliance",
      status: policyBlockers.length || migrationChecks.some((item) => item.status === "blocked") ? "needs_attention" : "covered",
      summary: policyBlockers.length ? `${policyBlockers.length} policy result(s) are blocked.` : migrationChecks.some((item) => item.status === "blocked") ? "Migration checks still have blockers." : "Policy and migration checks are clear enough for current governance review.",
      signals: {
        policy_blockers: policyBlockers.length,
        migration_blockers: migrationChecks.filter((item) => item.status === "blocked").length
      },
      next_action: policyBlockers.length || migrationChecks.some((item) => item.status === "blocked")
        ? "Resolve policy or migration blockers before release or publish."
        : "Keep policy and migration checks current before handoff."
    },
    {
      dimension: "extensibility",
      status: pluginLoaderConfigured && state.records.workstreams.length ? "covered" : "needs_setup",
      summary: pluginLoaderConfigured ? "Plugin and capability surfaces are discoverable for extension work." : "Plugin loader or extension metadata is not fully configured.",
      signals: {
        plugin_loader_configured: pluginLoaderConfigured,
        plugin_loader_active: pluginLoader.active_plugins,
        owner_track_plugin_enabled: ownerTrackPlugin ? Boolean(ownerTrackPlugin.enabled) : null,
        workstreams_configured: state.records.workstreams.length > 0
      },
      next_action: pluginLoaderConfigured
        ? "Keep capability, plugin, and workstream metadata in sync for future extensions."
        : "Initialize plugin and capability extension metadata before broadening the surface."
    }
  ];
  return {
    report_type: "governance_coverage",
    generated_at: new Date().toISOString(),
    dimensions,
    summary: {
      covered: dimensions.filter((item) => item.status === "covered").length,
      needs_attention: dimensions.filter((item) => item.status !== "covered").length
    }
  };
}

function findLockConflicts(activeLocks) {
  const conflicts = [];
  for (let index = 0; index < activeLocks.length; index += 1) {
    for (let other = index + 1; other < activeLocks.length; other += 1) {
      if (locksOverlap(activeLocks[index], activeLocks[other])) {
        conflicts.push({ left: activeLocks[index].lock_id, right: activeLocks[other].lock_id, scope_left: activeLocks[index].scope, scope_right: activeLocks[other].scope });
      }
    }
  }
  return conflicts;
}

function escapeShellText(value) {
  return String(value || "").replace(/"/g, '\\"');
}

function requireOwnerAuthority(flags) {
  if (!fileExists(".kabeeri/owner_auth.json")) return;
  const auth = readJsonFile(".kabeeri/owner_auth.json");
  if (!auth.configured) return;
  const session = readJsonFile(".kabeeri/session.json");
  if (!isOwnerSessionActive(session)) {
    throw new Error("Owner session required. Run `kvdf owner login --id OWNER-ID` first.");
  }
  if (session.owner_id !== auth.owner_id) {
    throw new Error("Owner session does not match configured Owner.");
  }
  if (flags.owner && flags.owner !== session.owner_id) {
    throw new Error("Provided --owner does not match active Owner session.");
  }
}

function getOwnerActor(flags) {
  if (fileExists(".kabeeri/session.json")) {
    const session = readJsonFile(".kabeeri/session.json");
    if (isOwnerSessionActive(session)) return session.owner_id;
  }
  return flags.owner || "owner";
}

function getIdentity(actorId) {
  if (!actorId || !fileExists(".kabeeri")) return null;
  const developers = fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const agents = fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  return [...developers, ...agents].find((item) => item.id === actorId && item.status !== "inactive") || null;
}

function getEffectiveActor(flags = {}) {
  if (flags.actor) return flags.actor;
  if (fileExists(".kabeeri/session.json")) {
    const session = readJsonFile(".kabeeri/session.json");
    if (isOwnerSessionActive(session)) return session.owner_id;
  }
  return null;
}

function hasConfiguredIdentities() {
  if (!fileExists(".kabeeri")) return false;
  const developers = fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const agents = fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  const auth = fileExists(".kabeeri/owner_auth.json") ? readJsonFile(".kabeeri/owner_auth.json") : { configured: false };
  return auth.configured || [...developers, ...agents].some((item) => item.role === "Owner" && item.status !== "inactive");
}

function requireAnyRole(flags, roles, actionName) {
  if (!hasConfiguredIdentities()) return;
  const actorId = getEffectiveActor(flags);
  if (!actorId) throw new Error(`Actor required to ${actionName}. Use --actor ACTOR-ID or active Owner session.`);
  const identity = getIdentity(actorId);
  if (!identity) throw new Error(`Unknown actor: ${actorId}`);
  if (!roles.includes(identity.role)) {
    throw new Error(`Permission denied: ${identity.role} cannot ${actionName}. Required: ${roles.join(", ")}.`);
  }
}

function requireTaskExecutor(flags, task) {
  if (!hasConfiguredIdentities()) return;
  const actorId = getEffectiveActor(flags);
  if (!actorId) throw new Error("Actor required to execute task. Use --actor ACTOR-ID.");
  if (!task.assignee_id) {
    throw new Error(`Task ${task.id} is not assigned.`);
  }
  if (task.assignee_id && actorId !== task.assignee_id) {
    throw new Error(`Permission denied: ${actorId} is not assigned to ${task.id}.`);
  }
  const identity = getIdentity(actorId);
  if (!identity) throw new Error(`Unknown actor: ${actorId}`);
  const allowed = ["Owner", "Maintainer", "Owner-Developer", "Full-stack Developer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"];
  if (!allowed.includes(identity.role)) {
    throw new Error(`Permission denied: ${identity.role} cannot execute tasks.`);
  }
}

function generateVerificationReport(task) {
  const tokens = (readJsonFile(".kabeeri/tokens.json").tokens || []).filter((token) => token.task_id === task.id);
  const locks = (readJsonFile(".kabeeri/locks.json").locks || []).filter((lockItem) => lockItem.task_id === task.id);
  const usage = summarizeUsage().by_task[task.id] || { events: 0, tokens: 0, cost: 0 };
  const lines = [
    `# Final Verification Report - ${task.id}`,
    "",
    `Task: ${task.title}`,
    `Status: ${task.status}`,
    `Assignee: ${task.assignee_id || ""}`,
    `Reviewer: ${task.reviewer_id || ""}`,
    `Owner: ${task.verified_by || ""}`,
    `Verified at: ${task.verified_at || ""}`,
    "",
    "## Acceptance Criteria",
    ...(task.acceptance_criteria || []).map((item) => `- ${item}`),
    "",
    "## Tokens",
    ...tokens.map((token) => `- ${token.token_id}: ${token.status}`),
    "",
    "## Locks",
    ...locks.map((lockItem) => `- ${lockItem.lock_id}: ${lockItem.status} (${lockItem.scope})`),
    "",
    "## AI Usage",
    `Events: ${usage.events}`,
    `Tokens: ${usage.tokens}`,
    `Cost: ${usage.cost}`
  ];
  writeTextFile(`.kabeeri/reports/${task.id}.verification.md`, `${lines.join("\n")}\n`);
}

function revokeTaskTokens(taskId, reason) {
  const file = ".kabeeri/tokens.json";
  const data = readJsonFile(file);
  let changed = false;
  for (const token of data.tokens || []) {
    if (token.task_id === taskId && token.status === "active") {
      token.status = "revoked";
      token.revoked_at = new Date().toISOString();
      token.revocation_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function releaseTaskLocks(taskId, reason) {
  const file = ".kabeeri/locks.json";
  const data = readJsonFile(file);
  let changed = false;
  for (const item of data.locks || []) {
    if (item.task_id === taskId && item.status === "active") {
      item.status = "released";
      item.released_at = new Date().toISOString();
      item.release_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function appendAudit(eventType, entityType, entityId, summary, metadata = {}) {
  const fs = require("fs");
  const path = require("path");
  const line = JSON.stringify({
    event_id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_id: "local-cli",
    actor_role: "local",
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  });
  fs.appendFileSync(path.join(repoRoot(), ".kabeeri", "audit_log.jsonl"), `${line}\n`, "utf8");
}

module.exports = { run };



