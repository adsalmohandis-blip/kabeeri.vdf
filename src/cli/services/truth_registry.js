const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");

const SOURCE_TRUTH_FILES = [
  "src/cli/commands/planner.js",
  "src/cli/commands/evolution.js",
  "src/cli/commands/index.js",
  "src/cli/index.js",
  "src/cli/dispatchers/build.js",
  "src/cli/dispatchers/truth.js",
  "src/cli/command_dispatcher.js",
  "src/cli/ui.js",
  "src/cli/commands/dashboard_state.js",
  "src/cli/commands/security_auditor.js",
  "src/cli/commands/release.js",
  "src/cli/commands/handoff.js",
  "src/cli/commands/security.js",
  "src/cli/commands/task_lifecycle.js",
  "src/cli/commands/task_scheduler.js",
  "src/cli/commands/delivery.js",
  "src/cli/commands/source_package.js",
  "src/cli/commands/reference_folders.js",
  "src/cli/commands/plugin.js",
  "src/cli/services/plugin_loader.js"
];

const DOCS_TRUTH_FILES = [
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
  "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
  "docs/workflows/PLANNER_SELF_PLANNING_ENGINE.md",
  "docs/workflows/PLANNER_DOCUMENTATION_SYSTEM.md",
  "docs/workflows/VIBER_DOCUMENTATION_PIPELINE.md",
  "docs/workflows/VIBER_VERSION_TO_PUBLISH_CONTROL.md",
  "docs/workflows/CANONICAL_TRUTH_AND_RECONCILIATION.md",
  "docs/workflows/SOURCE_CONTROL_PROVIDER_MODEL.md",
  "knowledge/governance/KVDF_PLANNER_LAYER.md"
];

const TEST_TRUTH_FILES = ["tests/cli.integration.test.js"];
const GENERATED_TRUTH_FILES = ["docs/reports", ".kabeeri/reports"];
const RUNTIME_TRUTH_FILES = [".kabeeri/planner.json", ".kabeeri/evolution.json", ".kabeeri/tasks.json", ".kabeeri/dashboard", ".kabeeri/reports"];

const TRUTH_FEATURES = [
  feature("planner.next", "Planner Next", {
    source_patterns: ["buildPlannerNextReport", "planner next --track"],
    docs_patterns: ["planner next", "planner prompt"],
    test_patterns: ["planner next"],
    support_required: true
  }),
  feature("planner.prompt", "Planner Prompt", {
    source_patterns: ["buildPlannerPromptReport", "buildPlannerPromptFromCurrentPlan"],
    docs_patterns: ["planner prompt --goal", "planner prompt --from-current"],
    test_patterns: ["planner prompt generates", "planner prompt from current"],
    support_required: true
  }),
  feature("planner.method", "Planner Method", {
    source_patterns: ["buildPlannerMethodReport", "buildPlannerMethodRecommendation"],
    docs_patterns: ["planner method", "selected planning method"],
    test_patterns: ["planner method recommends"],
    support_required: true
  }),
  feature("planner.auto", "Planner Auto", {
    source_patterns: ["buildPlannerAutoPlanReport", "planner auto --goal"],
    docs_patterns: ["planner auto", "self-planning package"],
    test_patterns: ["planner auto returns"],
    support_required: true
  }),
  feature("planner.review", "Planner Review", {
    source_patterns: ["buildPlannerReviewReport", "buildPlannerReviewSummary"],
    docs_patterns: ["planner review", "review scope"],
    test_patterns: ["planner review and resume"],
    support_required: true
  }),
  feature("planner.resume", "Planner Resume", {
    source_patterns: ["buildPlannerResumeReport", "buildPlannerResumeNextAction"],
    docs_patterns: ["planner resume", "resume planning"],
    test_patterns: ["planner review and resume", "planner resume stays safe"],
    support_required: true
  }),
  feature("planner.docs", "Planner Docs", {
    source_patterns: ["buildPlannerDocsCommandReport", "buildPlannerDocsPlan", "buildPlannerDocsMaterializationReport"],
    docs_patterns: ["planner docs catalog", "planner docs plan", "planner docs materialize", "planner docs status", "planner docs review"],
    test_patterns: ["planner docs catalog", "planner docs materialization", "planner docs status", "planner docs review"],
    schema_files: ["schemas/planner/planner-docs-catalog.schema.json", "schemas/planner/planner-docs-plan.schema.json", "schemas/planner/planner-docs-materialization.schema.json", "schemas/planner/planner-docs-status.schema.json"],
    support_required: true
  }),
  feature("planner.version", "Planner Version", {
    source_patterns: ["buildPlannerVersionCommandReport", "buildPlannerVersionControlSummary", "buildPlannerVersionPublishReadyReport"],
    docs_patterns: ["planner version status", "planner version gate", "planner version publish-ready", "planner version mark-published"],
    test_patterns: ["version-to-publish", "planner version status", "planner version gate"],
    schema_files: ["schemas/planner/viber-version-control.schema.json"],
    support_required: true
  }),
  feature("planner.feedback", "Planner Feedback", {
    source_patterns: ["buildPlannerFeedbackCommandReport", "kvdf_planner_execution_feedback"],
    docs_patterns: ["planner feedback", "execution feedback"],
    test_patterns: ["planner feedback"],
    support_required: true
  }),
  feature("planner.visual", "Planner Visual", {
    source_patterns: ["buildPlannerVisualReport", "buildPlannerVisualFromCurrentReport", "buildPlannerVisualPayload"],
    docs_patterns: ["planner visual", "visual planning"],
    test_patterns: ["planner visual"],
    support_required: true
  }),
  feature("planner.pipeline", "Planner Pipeline", {
    source_patterns: ["buildIdeaToEvolutionPipelineReport", "planner pipeline"],
    docs_patterns: ["planner pipeline", "idea-to-evolution pipeline"],
    test_patterns: ["planner pipeline"],
    support_required: true
  }),
  feature("planner.propose", "Planner Propose", {
    source_patterns: ["buildPlannerProposalReport", "planner propose"],
    docs_patterns: ["planner propose", "propose a plan"],
    test_patterns: ["planner propose persists"],
    support_required: true
  }),
  feature("planner.approve", "Planner Approve", {
    source_patterns: ["approvePlannerPlan", "planner approve"],
    docs_patterns: ["planner approve", "Owner approval"],
    test_patterns: ["planner approve promotes"],
    support_required: true
  }),
  feature("planner.current", "Planner Current", {
    source_patterns: ["buildPlannerCurrentReport", "kvdf_planner_current"],
    docs_patterns: ["planner current"],
    test_patterns: ["planner current returns"],
    support_required: true
  }),
  feature("planner.reject", "Planner Reject", {
    source_patterns: ["rejectPlannerPlan", "planner reject"],
    docs_patterns: ["planner reject"],
    test_patterns: ["planner reject"],
    support_required: true
  }),
  feature("planner.complete", "Planner Complete", {
    source_patterns: ["completePlannerPlan", "planner complete"],
    docs_patterns: ["planner complete"],
    test_patterns: ["planner complete"],
    support_required: true
  }),
  feature("planner.materialize", "Planner Materialize", {
    source_patterns: ["materializePlannerPlan", "planner materialize"],
    docs_patterns: ["planner materialize"],
    test_patterns: ["planner materialize"],
    support_required: true
  }),
  feature("planner.evolution", "Planner Evolution", {
    source_patterns: ["buildPlannerEvolutionReport", "kvdf_planner_evolution_plan"],
    docs_patterns: ["planner evolution", "idea-to-evolution"],
    test_patterns: ["planner evolution returns"],
    support_required: true
  }),
  feature("planner.task-punch", "Planner Task Punch", {
    source_patterns: ["buildPlannerTaskPunchReport", "kvdf_planner_task_punch"],
    docs_patterns: ["planner task-punch", "task punch"],
    test_patterns: ["planner task-punch"],
    support_required: true
  }),
  feature("security-auditor plugin", "Security Auditor Plugin", {
    source_patterns: ["securityAuditor", "plugins/security-auditor"],
    docs_patterns: ["security-auditor status|scan|report"],
    test_patterns: ["security-auditor"],
    plugin_id: "security-auditor",
    support_required: false
  }),
  feature("owner dashboard", "Owner Dashboard", {
    source_patterns: ["buildDashboardStateFiles", "buildPlannerDashboardState", "dashboard"],
    docs_patterns: ["Owner Dashboard", "owner dashboard"],
    test_patterns: ["dashboard state"],
    support_required: true
  }),
  feature("viber dashboard", "Viber Dashboard", {
    source_patterns: ["buildDashboardStateFilesForCurrentTrack", "collectDashboardStateForCurrentTrack"],
    docs_patterns: ["Viber Dashboard", "viber dashboard"],
    test_patterns: ["dashboard state"],
    support_required: true
  }),
  feature("source-control provider model", "Source Control Provider Model", {
    source_patterns: ["buildPlannerSourceControl", "source_control_mode", "github optional secondary provider"],
    docs_patterns: ["Source Control Provider Model", "GitHub is optional secondary provider/plugin"],
    test_patterns: ["source control mode"],
    support_required: true
  }),
  feature("viber documentation pipeline", "Viber Documentation Pipeline", {
    source_patterns: ["buildPlannerDocsPlan", "buildPlannerDocsMaterializationReport", "buildPlannerDocsStatusReport"],
    docs_patterns: ["Viber Documentation Pipeline", "Planner Documentation System"],
    test_patterns: ["planner docs plan", "planner docs materialization", "planner docs status"],
    schema_files: ["schemas/planner/planner-docs-plan.schema.json", "schemas/planner/planner-docs-status.schema.json"],
    support_required: true
  }),
  feature("version-to-publish control loop", "Version To Publish Control Loop", {
    source_patterns: ["buildPlannerVersionControlSummary", "buildPlannerVersionGateReport", "buildPlannerVersionPublishReadyReport", "buildPlannerVersionMarkPublishedReport"],
    docs_patterns: ["Version-To-Publish Control Loop", "Viber Version To Publish Control"],
    test_patterns: ["planner version status", "planner version gate", "planner version publish-ready"],
    schema_files: ["schemas/planner/viber-version-control.schema.json"],
    support_required: true
  })
];

function feature(id, title, config = {}) {
  return {
    id,
    title,
    source_files: config.source_files || inferSourceFiles(id),
    docs_files: config.docs_files || DOCS_TRUTH_FILES,
    test_files: config.test_files || TEST_TRUTH_FILES,
    schema_files: config.schema_files || [],
    runtime_files: config.runtime_files || RUNTIME_TRUTH_FILES,
    generated_files: config.generated_files || GENERATED_TRUTH_FILES,
    source_patterns: config.source_patterns || [],
    docs_patterns: config.docs_patterns || [],
    test_patterns: config.test_patterns || [],
    runtime_patterns: config.runtime_patterns || [],
    generated_patterns: config.generated_patterns || [],
    plugin_id: config.plugin_id || null,
    support_required: config.support_required !== false
  };
}

function inferSourceFiles(id) {
  if (String(id).startsWith("planner.")) return ["src/cli/commands/planner.js", "src/cli/index.js", "src/cli/ui.js"];
  if (id === "security-auditor plugin") return ["src/cli/commands/security_auditor.js", "plugins/security-auditor/plugin.json"];
  if (id === "owner dashboard" || id === "viber dashboard") return ["src/cli/commands/dashboard_state.js", "src/cli/index.js", "src/cli/ui.js"];
  if (id === "source-control provider model") return ["src/cli/commands/planner.js", "src/cli/commands/delivery.js", "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md"];
  if (id === "viber documentation pipeline") return ["src/cli/commands/planner.js", "src/cli/workspace.js"];
  if (id === "version-to-publish control loop") return ["src/cli/commands/planner.js", "src/cli/commands/release.js", "src/cli/commands/handoff.js", "src/cli/commands/security.js", "src/cli/commands/task_lifecycle.js", "src/cli/commands/evolution.js", "src/cli/commands/dashboard_state.js"];
  return ["src/cli/commands/planner.js"];
}

function buildTruthFeatureCatalog() {
  return TRUTH_FEATURES.map((entry) => ({ ...entry }));
}

function buildTruthFileText(relativePath) {
  const fullPath = path.join(repoRoot(), relativePath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return "";
  try {
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return "";
  }
}

function collectMatches(relativePath, patterns = []) {
  const text = buildTruthFileText(relativePath);
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const matches = [];
  for (const pattern of patterns) {
    const matcher = typeof pattern === "string"
      ? (line) => line.includes(pattern)
      : (line) => pattern.test(line);
    for (const [index, line] of lines.entries()) {
      if (matcher(line)) {
        matches.push(`${relativePath}:${index + 1}:${line.trim()}`);
      }
    }
  }
  return Array.from(new Set(matches));
}

function collectFileEvidence(files = [], patterns = []) {
  const evidence = [];
  for (const file of files) {
    if (!patterns.length) {
      const fullPath = path.join(repoRoot(), file);
      if (fs.existsSync(fullPath)) evidence.push(file);
      continue;
    }
    evidence.push(...collectMatches(file, patterns));
  }
  return Array.from(new Set(evidence));
}

function collectRuntimeEvidence(files = [], patterns = []) {
  const evidence = [];
  for (const file of files) {
    const fullPath = path.join(repoRoot(), file);
    if (!fs.existsSync(fullPath)) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      continue;
    }
    evidence.push(...collectMatches(file, patterns));
    if (!patterns.length) evidence.push(file);
  }
  return Array.from(new Set(evidence));
}

function collectPluginEvidence(feature) {
  if (!feature.plugin_id) return [];
  const manifestPath = `plugins/${feature.plugin_id}/plugin.json`;
  const fullPath = path.join(repoRoot(), manifestPath);
  if (!fs.existsSync(fullPath)) return [];
  try {
    const manifest = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return [manifestPath, ...(Array.isArray(manifest.command_surface) && manifest.command_surface.length ? [`command_surface:${manifest.command_surface.join(",")}`] : [])];
  } catch {
    return [manifestPath];
  }
}

function buildFeatureEvidence(feature) {
  const sourceEvidence = collectFileEvidence(feature.source_files, feature.source_patterns);
  const docsEvidence = collectFileEvidence(feature.docs_files, feature.docs_patterns);
  const schemaEvidence = collectFileEvidence(feature.schema_files, []);
  const testEvidence = collectFileEvidence(feature.test_files, feature.test_patterns);
  const runtimeEvidence = collectRuntimeEvidence(feature.runtime_files, feature.runtime_patterns);
  const generatedEvidence = collectFileEvidence(feature.generated_files, feature.generated_patterns);
  const pluginEvidence = collectPluginEvidence(feature);
  return { sourceEvidence, docsEvidence, schemaEvidence, testEvidence, runtimeEvidence, generatedEvidence, pluginEvidence };
}

function classifyFeature(feature) {
  const evidence = buildFeatureEvidence(feature);
  const sourceReady = evidence.sourceEvidence.length > 0 || evidence.pluginEvidence.length > 0;
  const supportReady = evidence.docsEvidence.length > 0 || evidence.schemaEvidence.length > 0 || evidence.testEvidence.length > 0 || !feature.support_required;
  if (sourceReady && supportReady) return { status: "implemented", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  if (sourceReady && !supportReady) return { status: "implemented", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  if (!sourceReady && evidence.docsEvidence.length > 0) return { status: "documented_but_not_implemented", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  if (!sourceReady && evidence.runtimeEvidence.length > 0) return { status: "runtime_only", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  if (!sourceReady && evidence.generatedEvidence.length > 0) return { status: "documented_but_not_implemented", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  if (sourceReady) return { status: "implemented", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
  return { status: "planned", confidence: supportConfidence(evidence), evidence, sourceReady, supportReady };
}

function supportConfidence(evidence) {
  const score = [evidence.sourceEvidence, evidence.docsEvidence, evidence.schemaEvidence, evidence.testEvidence, evidence.runtimeEvidence].filter((items) => Array.isArray(items) && items.length > 0).length;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function buildTruthAuditFeatureResult(featureId) {
  const feature = TRUTH_FEATURES.find((item) => item.id === featureId);
  if (!feature) {
    return {
      report_type: "kvdf_truth_feature",
      feature_id: featureId,
      status: "unknown",
      source_evidence: [],
      docs_evidence: [],
      schema_evidence: [],
      test_evidence: [],
      runtime_evidence: [],
      generated_report_evidence: [],
      confidence: "low",
      next_action: `Add canonical evidence for ${featureId} or confirm the feature id.`
    };
  }
  const classification = classifyFeature(feature);
  const evidence = classification.evidence;
  return {
    report_type: "kvdf_truth_feature",
    feature_id: feature.id,
    title: feature.title,
    status: classification.status,
    source_ready: Boolean(classification.sourceReady),
    support_complete: Boolean(classification.supportReady),
    source_evidence: [...evidence.sourceEvidence, ...evidence.pluginEvidence],
    docs_evidence: evidence.docsEvidence,
    schema_evidence: evidence.schemaEvidence,
    test_evidence: evidence.testEvidence,
    runtime_evidence: evidence.runtimeEvidence,
    generated_report_evidence: evidence.generatedEvidence,
    confidence: classification.confidence,
    next_action: classification.status === "implemented"
      ? `Keep ${feature.id} aligned across source, docs, and tests.`
      : classification.status === "runtime_only"
        ? `Promote the runtime state for ${feature.id} into source, docs, and tests or retire the runtime-only record.`
        : `Add source and support evidence for ${feature.id}.`
  };
}

function buildTruthAuditReport() {
  const features = buildTruthFeatureCatalog().map((feature) => ({ feature, result: buildTruthAuditFeatureResult(feature.id) }));
  const summary = {
    implemented: 0,
    implemented_but_undocumented: 0,
    documented_but_not_implemented: 0,
    runtime_only: 0,
    generated_snapshot_only: 0,
    planned: 0,
    stale_planned: 0,
    stale_recommended: 0,
    duplicate_runtime_links: 0,
    unknown: 0
  };
  const findings = [];
  for (const item of features) {
    const { feature, result } = item;
    if (result.status === "implemented" && result.support_complete) summary.implemented += 1;
    else if (result.status === "implemented" && !result.support_complete) summary.implemented_but_undocumented += 1;
    else if (result.status === "documented_but_not_implemented") summary.documented_but_not_implemented += 1;
    else if (result.status === "runtime_only") summary.runtime_only += 1;
    else if (result.status === "planned") summary.planned += 1;
    else summary.unknown += 1;

    const sourceEvidence = [...result.source_evidence, ...result.schema_evidence, ...result.test_evidence];
    findings.push({
      feature_id: feature.id,
      title: feature.title,
      status: result.status === "implemented" && !result.support_complete ? "implemented_but_undocumented" : result.status,
      evidence_source: sourceEvidence.length ? sourceEvidence : result.runtime_evidence.length ? result.runtime_evidence : result.generated_report_evidence,
      source_ready: result.source_ready,
      support_complete: result.support_complete,
      source_evidence: result.source_evidence,
      docs_evidence: result.docs_evidence,
      schema_evidence: result.schema_evidence,
      test_evidence: result.test_evidence,
      runtime_evidence: result.runtime_evidence,
      generated_report_evidence: result.generated_report_evidence,
      confidence: result.confidence,
      next_action: result.next_action
    });
  }
  const runtimeRecon = reconcileRuntimeTruth();
  summary.stale_planned = runtimeRecon.stale_planned.length;
  summary.stale_recommended = runtimeRecon.stale_recommended.length;
  summary.duplicate_runtime_links = runtimeRecon.duplicate_task_links.length;
  summary.generated_snapshot_only = runtimeRecon.generated_snapshot_only.length;
  summary.runtime_only += runtimeRecon.runtime_only_evolutions.length;
  findings.push(...runtimeRecon.findings);
  const status = runtimeRecon.duplicate_task_links.length || runtimeRecon.stale_planned.length || runtimeRecon.stale_recommended.length ? "warning" : "pass";
  return {
    report_type: "kvdf_truth_audit",
    generated_at: new Date().toISOString(),
    status,
    summary,
    findings,
    recommended_next_action: status === "pass"
      ? "Keep source, docs, tests, and runtime state aligned."
      : "Review stale runtime references and reconcile them against source-level evidence."
  };
}

function buildPlannerTruthReport() {
  const commands = [
    "planner.next",
    "planner.prompt",
    "planner.method",
    "planner.auto",
    "planner.review",
    "planner.resume",
    "planner.docs",
    "planner.version",
    "planner.feedback",
    "planner.visual",
    "planner.pipeline",
    "planner.propose",
    "planner.approve",
    "planner.current",
    "planner.materialize",
    "planner.task-punch",
    "planner.evolution",
    "planner.complete",
    "planner.reject"
  ].map((featureId) => buildTruthAuditFeatureResult(featureId));
  const docsDetected = collectFileEvidence(DOCS_TRUTH_FILES, ["planner", "truth", "version", "documentation"]);
  const schemasDetected = collectFileEvidence([
    "schemas/planner/planner-method.schema.json",
    "schemas/planner/planner-review.schema.json",
    "schemas/planner/planner-docs-materialization.schema.json",
    "schemas/planner/planner-docs-catalog.schema.json",
    "schemas/planner/planner-docs-plan.schema.json",
    "schemas/planner/planner-docs-status.schema.json",
    "schemas/planner/viber-version-control.schema.json"
  ]);
  const testsDetected = collectFileEvidence(TEST_TRUTH_FILES, ["planner method", "planner docs", "planner version", "planner feedback", "truth audit", "planner truth"]);
  const runtimePlannerState = safeJson(".kabeeri/planner.json");
  const runtimeRecon = reconcileRuntimeTruth();
  const staleRuntimeItems = [...runtimeRecon.stale_planned, ...runtimeRecon.stale_recommended];
  return {
    report_type: "kvdf_planner_truth",
    generated_at: new Date().toISOString(),
    planner_commands_detected: commands,
    planner_docs_detected: docsDetected,
    planner_schemas_detected: schemasDetected,
    planner_tests_detected: testsDetected,
    runtime_planner_state: runtimePlannerState,
    stale_runtime_items: staleRuntimeItems,
    status: staleRuntimeItems.length ? "warning" : "pass",
    next_action: staleRuntimeItems.length ? "Reconcile stale runtime planner items against source-level evidence." : "Planner runtime state is consistent with the current source surface."
  };
}

function reconcileRuntimeTruth(cwd = repoRoot()) {
  const runtimePlanner = safeJson(".kabeeri/planner.json", cwd);
  const runtimeEvolution = safeJson(".kabeeri/evolution.json", cwd);
  const runtimeTasks = safeJson(".kabeeri/tasks.json", cwd);
  const implementedFeatures = TRUTH_FEATURES.filter((feature) => classifyFeature(feature).status === "implemented");
  const implementedTitles = implementedFeatures.map((feature) => feature.title.toLowerCase());
  const runtimeItems = extractRuntimeItems(runtimePlanner, runtimeEvolution);
  const stale_planned = [];
  const stale_recommended = [];
  const runtime_only_evolutions = [];
  const duplicate_task_links = findDuplicateRuntimeTaskLinks(runtimeEvolution, runtimeTasks);
  const orphan_tasks = findOrphanTasks(runtimeEvolution, runtimeTasks);
  const findings = [];

  for (const item of runtimeItems) {
    const text = `${item.title || ""} ${item.summary || ""} ${item.description || ""}`.toLowerCase();
    const matched = implementedTitles.find((title) => title && text.includes(title));
    if (matched && ["planned", "future", "recommended", "deferred", "suggested"].includes(item.status)) {
      const record = { ...item, matched_feature: matched };
      if (item.kind === "priority" || item.kind === "recommended") stale_recommended.push(record);
      else stale_planned.push(record);
      findings.push({
        feature_id: item.id || item.title || "runtime-item",
        title: item.title || item.id || "runtime item",
        status: "stale_runtime",
        evidence_source: [`runtime:${item.source}`],
        runtime_evidence: [`${item.source}:${item.title || item.id || "unknown"}`],
        confidence: "medium",
        next_action: `Remove or update the stale runtime ${item.kind || "item"} once the source-level feature is confirmed.`
      });
    } else if (!matched && item.kind === "evolution") {
      runtime_only_evolutions.push({ ...item });
      findings.push({
        feature_id: item.id || item.title || "runtime-evolution",
        title: item.title || item.id || "runtime evolution",
        status: "runtime_only",
        evidence_source: [`runtime:${item.source}`],
        runtime_evidence: [`${item.source}:${item.title || item.id || "unknown"}`],
        confidence: "medium",
        next_action: "Reconcile the runtime evolution against source, docs, and tests before treating it as implemented."
      });
    }
  }

  const generated_snapshot_only = collectGeneratedSnapshotOnlyItems(runtimePlanner, runtimeEvolution);
  return {
    stale_planned,
    stale_recommended,
    duplicate_task_links,
    orphan_tasks,
    runtime_only_evolutions,
    source_implemented_features: implementedFeatures.map((feature) => feature.id),
    generated_snapshot_only,
    findings,
    runtime_planner_state: runtimePlanner,
    runtime_evolution_state: runtimeEvolution,
    runtime_tasks_state: runtimeTasks
  };
}

function findStaleRuntimePlannerItems(runtimePlanner) {
  const items = [];
  if (!runtimePlanner || typeof runtimePlanner !== "object") return items;
  const plan = runtimePlanner.current_plan || null;
  if (plan && String(plan.status || "").toLowerCase() === "proposed") {
    items.push({ id: plan.plan_id || "current-plan", title: plan.title || plan.goal || "current plan", status: plan.status, kind: "plan", source: ".kabeeri/planner.json" });
  }
  for (const entry of Array.isArray(runtimePlanner.plans) ? runtimePlanner.plans : []) {
    if (["proposed", "planned", "recommended", "future"].includes(String(entry.status || "").toLowerCase())) {
      items.push({ id: entry.plan_id || entry.id || "plan", title: entry.title || entry.goal || "plan", status: entry.status, kind: "plan", source: ".kabeeri/planner.json" });
    }
  }
  return items;
}

function extractRuntimeItems(runtimePlanner, runtimeEvolution) {
  const items = [];
  if (runtimePlanner && Array.isArray(runtimePlanner.plans)) {
    for (const plan of runtimePlanner.plans) {
      items.push({
        id: plan.plan_id || plan.id || plan.title || "plan",
        title: plan.title || plan.goal || plan.plan_id || "plan",
        summary: plan.summary || plan.next_action || "",
        description: plan.description || "",
        status: plan.status || "unknown",
        kind: "plan",
        source: ".kabeeri/planner.json"
      });
    }
  }
  if (runtimeEvolution && Array.isArray(runtimeEvolution.development_priorities)) {
    for (const priority of runtimeEvolution.development_priorities) {
      items.push({
        id: priority.id || priority.priority || priority.title || "priority",
        title: priority.title || priority.id || "priority",
        summary: priority.summary || priority.notes && priority.notes.map((item) => item.text).join(" ") || "",
        description: priority.description || "",
        status: priority.status || "unknown",
        kind: "priority",
        source: ".kabeeri/evolution.json"
      });
    }
  }
  if (runtimeEvolution && Array.isArray(runtimeEvolution.changes)) {
    for (const change of runtimeEvolution.changes) {
      items.push({
        id: change.change_id || change.id || "change",
        title: change.title || change.change_id || "change",
        summary: change.summary || change.description || "",
        description: change.description || "",
        status: change.status || "unknown",
        kind: "evolution",
        source: ".kabeeri/evolution.json"
      });
    }
  }
  if (runtimeEvolution && Array.isArray(runtimeEvolution.development_priorities)) {
    for (const priority of runtimeEvolution.development_priorities) {
      items.push({
        id: priority.id || priority.priority || priority.title || "priority",
        title: priority.title || priority.id || "priority",
        summary: priority.summary || priority.notes && priority.notes.map((item) => item.text).join(" ") || "",
        description: priority.description || "",
        status: priority.status || "unknown",
        kind: "priority",
        source: ".kabeeri/evolution.json"
      });
    }
  }
  if (runtimeEvolution && Array.isArray(runtimeEvolution.deferred_ideas)) {
    for (const idea of runtimeEvolution.deferred_ideas) {
      items.push({
        id: idea.idea_id || idea.id || "idea",
        title: idea.title || idea.idea_id || "idea",
        summary: idea.summary || idea.analysis_summary || "",
        description: idea.analysis_summary || "",
        status: idea.status || "unknown",
        kind: "recommended",
        source: ".kabeeri/evolution.json"
      });
    }
  }
  return items;
}

function findDuplicateRuntimeTaskLinks(runtimeEvolution, runtimeTasks) {
  const links = new Map();
  const duplicates = [];
  const changes = runtimeEvolution && Array.isArray(runtimeEvolution.changes) ? runtimeEvolution.changes : [];
  for (const change of changes) {
    const taskIds = Array.isArray(change.task_ids) ? change.task_ids : [];
    for (const taskId of taskIds) {
      const normalized = String(taskId || "").trim();
      if (!normalized) continue;
      const list = links.get(normalized) || [];
      list.push(change.change_id || change.id || "unknown");
      links.set(normalized, list);
    }
  }
  for (const [taskId, changeIds] of links.entries()) {
    if (changeIds.length > 1) {
      duplicates.push({ task_id: taskId, evolution_change_ids: Array.from(new Set(changeIds)) });
    }
  }
  for (const task of Array.isArray(runtimeTasks && runtimeTasks.tasks) ? runtimeTasks.tasks : []) {
    const seenChanges = new Set();
    const linked = String(task.evolution_change_id || "").trim();
    if (linked) seenChanges.add(linked);
    for (const change of changes) {
      const taskIds = Array.isArray(change.task_ids) ? change.task_ids : [];
      if (taskIds.map((item) => String(item || "").trim()).includes(String(task.id || task.task_id || "").trim())) {
        seenChanges.add(change.change_id || change.id || "unknown");
      }
    }
    if (seenChanges.size > 1) {
      duplicates.push({ task_id: task.id || task.task_id || "unknown", evolution_change_ids: Array.from(seenChanges) });
    }
  }
  return duplicates;
}

function findOrphanTasks(runtimeEvolution, runtimeTasks) {
  const linked = new Set();
  const changes = runtimeEvolution && Array.isArray(runtimeEvolution.changes) ? runtimeEvolution.changes : [];
  for (const change of changes) {
    for (const taskId of Array.isArray(change.task_ids) ? change.task_ids : []) linked.add(String(taskId || "").trim());
  }
  const tasks = runtimeTasks && Array.isArray(runtimeTasks.tasks) ? runtimeTasks.tasks : [];
  return tasks.filter((task) => !linked.has(String(task.id || task.task_id || "").trim()) && !String(task.evolution_change_id || "").trim())
    .map((task) => ({ task_id: task.id || task.task_id || "unknown", title: task.title || "", status: task.status || "unknown" }));
}

function collectGeneratedSnapshotOnlyItems(runtimePlanner, runtimeEvolution) {
  const items = [];
  if (runtimePlanner && Array.isArray(runtimePlanner.generated_reports)) {
    for (const report of runtimePlanner.generated_reports) items.push(report);
  }
  if (runtimeEvolution && Array.isArray(runtimeEvolution.scorecards)) {
    for (const scorecard of runtimeEvolution.scorecards) items.push(scorecard);
  }
  return items;
}

function safeJson(relativePath, cwd = repoRoot()) {
  try {
    const fullPath = path.join(cwd, relativePath);
    if (!fs.existsSync(fullPath)) return {};
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    return {};
  }
}

module.exports = {
  TRUTH_FEATURES,
  buildTruthFeatureCatalog,
  buildTruthAuditReport,
  buildTruthAuditFeatureResult,
  buildPlannerTruthReport,
  reconcileRuntimeTruth,
  findDuplicateRuntimeTaskLinks,
  findOrphanTasks
};
