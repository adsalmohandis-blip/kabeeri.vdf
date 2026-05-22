const fs = require("fs");
const path = require("path");
const {
  getPluginStatus,
  buildSourceStatusReport,
  getCatalogReport,
  searchUiUx,
  recommendAndBuild,
  buildDesignSystem,
  buildChecklist,
  buildDocsSections,
  buildAudit,
  generateDesignTokens,
  generateComponentBlueprint,
  generateScreenBlueprint,
  generateUiUxHandoffPack,
  buildHandoffMarkdown,
  buildUiPatternLibrary,
  buildImplementationGuidance,
  buildUiUxPromptPack,
  renderPromptPackMarkdown,
  buildUiUxScorecard,
  buildUiUxGate,
  buildViberUiUxReadiness,
  buildUiUxEvidenceManifest,
  renderEvidenceMarkdown,
  buildVisualQaContract,
  renderVisualQaMarkdown,
  buildUiUxAcceptanceGate,
  summarizeAcceptanceGate,
  buildUiUxRegressionChecklist,
  renderRegressionMarkdown,
  readKnowledgePackManifest,
  buildKnowledgePackStatus,
  buildCatalogHealth,
  buildUiUxGovernanceRegistry,
  buildUiUxUpgradePlan,
  buildUiUxGovernance
} = require("../../../plugins/ui_ux_intelligence/runtime");

function uiUxIntelligence(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => "" } = deps;
  const mode = normalizeAction(action);

  if (!mode || mode === "status" || mode === "list") {
    const report = getPluginStatus(process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderStatus(report));
    return;
  }

  if (mode === "source-status") {
    const root = process.cwd();
    const dataReport = buildSourceStatusReport({ root });
    const tempReport = inspectTempMetaSourceStatus({
      root,
      sourceRoot: flags.source_root || flags.sourceRoot || flags.root
    });
    const report = {
      ...dataReport,
      ...tempReport,
      status: dataReport.catalog_ready ? "ready" : tempReport.status,
      temp_meta_dependency: !dataReport.catalog_ready
    };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderSourceStatus(report, table));
    return;
  }

  if (mode === "catalog") {
    const report = getCatalogReport({ root: process.cwd(), refresh: true });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "knowledge-pack" || mode === "knowledge_pack") {
    const report = buildKnowledgePackReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "catalog-health" || mode === "catalog_health") {
    const report = buildCatalogHealthReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "governance-registry" || mode === "governance_registry") {
    const report = buildGovernanceRegistryReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "upgrade-plan" || mode === "upgrade_plan") {
    const report = buildUpgradePlanReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "governance") {
    const report = buildGovernanceReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  const idea = resolveIdea(value, flags, rest);
  if (mode === "search") {
    const report = searchUiUx(resolveSearchQuery(value, flags, rest, idea), {
      ...flags,
      domain: resolveDomain(flags),
      limit: flags.limit || flags.max_results || flags.maxResults,
      refresh: true
    });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderSearch(report, table));
    return;
  }
  if (mode === "recommend") {
    const report = recommendAndBuild(idea, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "design-system" || mode === "design_system") {
    const report = buildDesignSystem(idea, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "checklist") {
    const report = buildChecklist(idea, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderChecklist(report, table));
    return;
  }
  if (mode === "docs") {
    const report = buildDocsSections(idea, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "audit") {
    const target = String(flags.target || value || rest[0] || "").trim();
    const report = buildAudit(target, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "scorecard") {
    const input = resolveIdea(value, flags, rest);
    const report = buildUiUxScorecard(input, { ...flags, target: flags.target });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "gate") {
    const input = resolveIdea(value, flags, rest);
    const report = buildUiUxGate(input, { ...flags, target: flags.target, stage: flags.stage || flags.gate });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "readiness") {
    const input = resolveIdea(value, flags, rest);
    const report = buildViberUiUxReadiness(input, { ...flags, app: flags.app || flags.app_slug, stage: flags.stage });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "handoff-pack" || mode === "handoff_pack") {
    const input = resolveIdea(value, flags, rest);
    const report = buildUiUxHandoffPackReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, buildHandoffMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(buildHandoffMarkdown(report));
    return;
  }
  if (mode === "patterns") {
    const input = resolveIdea(value, flags, rest);
    const report = buildUiPatternLibraryReport(input, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "implementation-guidance" || mode === "implementation_guidance") {
    const input = resolveIdea(value, flags, rest);
    const report = buildImplementationGuidanceReport(input, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "prompt-pack" || mode === "prompt_pack") {
    const input = resolveIdea(value, flags, rest);
    const report = buildPromptPackReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, renderPromptPackMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderPromptPackMarkdown(report));
    return;
  }
  if (mode === "tokens") {
    const input = resolveIdea(value, flags, rest);
    const report = generateDesignTokens(input, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "components") {
    const input = resolveIdea(value, flags, rest);
    const report = generateComponentBlueprint(input, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "screens") {
    const input = resolveIdea(value, flags, rest);
    const report = generateScreenBlueprint(input, flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }
  if (mode === "evidence") {
    const input = resolveIdea(value, flags, rest);
    const report = buildEvidenceReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, renderEvidenceMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderEvidenceMarkdown(report));
    return;
  }
  if (mode === "visual-qa" || mode === "visual_qa") {
    const input = resolveIdea(value, flags, rest);
    const report = buildVisualQaReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, renderVisualQaMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderVisualQaMarkdown(report));
    return;
  }
  if (mode === "acceptance-gate" || mode === "acceptance_gate") {
    const input = resolveIdea(value, flags, rest);
    const report = buildAcceptanceGateReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, renderAcceptanceGateMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderAcceptanceGateMarkdown(report));
    return;
  }
  if (mode === "regression") {
    const input = resolveIdea(value, flags, rest);
    const report = buildRegressionReport(input, flags);
    if (flags.output) writeUiUxOutput(flags.output, renderRegressionMarkdown(report), process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderRegressionMarkdown(report));
    return;
  }

  throw new Error(`Unknown ui-ux-intelligence action: ${action}`);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "design_system") return "design-system";
  if (value === "source_status") return "source-status";
  if (value === "handoff_pack") return "handoff-pack";
  if (value === "implementation_guidance") return "implementation-guidance";
  if (value === "prompt_pack") return "prompt-pack";
  if (value === "visual_qa") return "visual-qa";
  if (value === "acceptance_gate") return "acceptance-gate";
  if (value === "knowledge_pack") return "knowledge-pack";
  if (value === "catalog_health") return "catalog-health";
  if (value === "governance_registry") return "governance-registry";
  if (value === "upgrade_plan") return "upgrade-plan";
  return value;
}

function resolveIdea(value, flags = {}, rest = []) {
  const candidates = [value, flags.idea, flags.goal, flags.query, rest.filter(Boolean).join(" ")];
  const result = candidates.find((item) => typeof item === "string" && item.trim());
  return result ? String(result).trim() : "";
}

function resolveSearchQuery(value, flags = {}, rest = [], fallback = "") {
  const candidates = [flags.query, value, flags.idea, flags.goal, rest.filter(Boolean).join(" "), fallback];
  const result = candidates.find((item) => typeof item === "string" && item.trim());
  return result ? String(result).trim() : "";
}

function resolveDomain(flags = {}) {
  const candidates = [flags.domain, flags.dom, flags.scope];
  const result = candidates.find((item) => typeof item === "string" && item.trim());
  return result ? String(result).trim() : "all";
}

function inspectTempMetaSourceStatus({ root, sourceRoot }) {
  const resolvedSourceRoot = path.resolve(sourceRoot || path.join(root, "plugins", "ui_ux_intelligence", "_temp_meta"));
  const exists = fs.existsSync(resolvedSourceRoot);
  const expectedFiles = [
    "products.csv",
    "styles.csv",
    "colors.csv",
    "typography.csv",
    "ui-reasoning.csv",
    "ux-guidelines.csv",
    "charts.csv",
    "landing.csv",
    "icons.csv",
    "app-interface.csv",
    "react-performance.csv",
    "angular.csv",
    "astro.csv",
    "flutter.csv",
    "html-tailwind.csv",
    "jetpack-compose.csv",
    "laravel.csv",
    "nextjs.csv",
    "nuxt-ui.csv",
    "nuxtjs.csv",
    "react-native.csv",
    "react.csv",
    "shadcn.csv",
    "svelte.csv",
    "swiftui.csv",
    "threejs.csv",
    "vue.csv",
    "core.py",
    "search.py",
    "design_system.py",
    "quick-reference.md",
    "skill-content.md"
  ];

  if (!exists) {
    return {
      source_root: path.relative(root, resolvedSourceRoot).replace(/\\/g, "/"),
      layout: "flat",
      found_files_total: 0,
      missing_files: [...expectedFiles],
      found_files: [],
      data_files: [],
      stack_files: [],
      reference_logic_files: [],
      reference_doc_files: [],
      unexpected_files: [],
      temp_meta_ignored: true
    };
  }

  const entries = fs.readdirSync(resolvedSourceRoot, { withFileTypes: true });
  const fileNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => `${entry.name}/`);
  const dataFiles = fileNames.filter((name) => [
    "products.csv",
    "styles.csv",
    "colors.csv",
    "typography.csv",
    "ui-reasoning.csv",
    "ux-guidelines.csv",
    "charts.csv",
    "landing.csv",
    "icons.csv",
    "app-interface.csv",
    "react-performance.csv"
  ].includes(name));
  const stackFiles = fileNames.filter((name) => [
    "angular.csv",
    "astro.csv",
    "flutter.csv",
    "html-tailwind.csv",
    "jetpack-compose.csv",
    "laravel.csv",
    "nextjs.csv",
    "nuxt-ui.csv",
    "nuxtjs.csv",
    "react-native.csv",
    "react.csv",
    "shadcn.csv",
    "svelte.csv",
    "swiftui.csv",
    "threejs.csv",
    "vue.csv"
  ].includes(name));
  const referenceLogicFiles = fileNames.filter((name) => ["core.py", "search.py", "design_system.py"].includes(name));
  const referenceDocFiles = fileNames.filter((name) => ["quick-reference.md", "skill-content.md"].includes(name));
  const recognized = [...dataFiles, ...stackFiles, ...referenceLogicFiles, ...referenceDocFiles];
  const unexpectedFiles = [
    ...fileNames.filter((name) => !expectedFiles.includes(name)),
    ...directories
  ].sort();
  const missingFiles = expectedFiles.filter((name) => !recognized.includes(name));
  return {
    source_root: path.relative(root, resolvedSourceRoot).replace(/\\/g, "/"),
    layout: "flat",
    found_files_total: fileNames.length + directories.length,
    missing_files: missingFiles,
    found_files: [...recognized, ...unexpectedFiles].sort(),
    data_files: dataFiles,
    stack_files: stackFiles,
    reference_logic_files: referenceLogicFiles,
    reference_doc_files: referenceDocFiles,
    unexpected_files: unexpectedFiles,
    temp_meta_ignored: true,
    temp_meta_found_files_total: fileNames.length + directories.length
  };
}

function buildUiUxHandoffPackReport(input, flags = {}) {
  const report = generateUiUxHandoffPack(input, {
    ...flags,
    app: flags.app || flags.app_slug || flags.appSlug || ""
  });
  return report;
}

function buildUiPatternLibraryReport(input, flags = {}) {
  return buildUiPatternLibrary(input, {
    ...flags,
    stack: flags.stack || flags.stack_name || flags.framework || ""
  });
}

function buildImplementationGuidanceReport(input, flags = {}) {
  return buildImplementationGuidance(input, {
    ...flags,
    stack: flags.stack || flags.stack_name || flags.framework || ""
  });
}

function buildPromptPackReport(input, flags = {}) {
  return buildUiUxPromptPack(input, {
    ...flags,
    stack: flags.stack || flags.stack_name || flags.framework || "",
    executor: flags.executor || flags.role || "codex",
    app: flags.app || flags.app_slug || flags.appSlug || ""
  });
}

function buildEvidenceReport(input, flags = {}) {
  return buildUiUxEvidenceManifest(input, {
    ...flags,
    app: flags.app || flags.app_slug || flags.appSlug || "",
    evidence: flags.evidence || flags.evidence_paths || flags.paths || "",
    screens: flags.screens || "",
    states: flags.states || "",
    stage: flags.stage || "validation"
  });
}

function buildVisualQaReport(input, flags = {}) {
  return buildVisualQaContract(input, {
    ...flags,
    app: flags.app || flags.app_slug || flags.appSlug || "",
    evidence: flags.evidence || flags.evidence_paths || flags.paths || "",
    screens: flags.screens || "",
    states: flags.states || "",
    stage: flags.stage || "validation"
  });
}

function buildAcceptanceGateReport(input, flags = {}) {
  return buildUiUxAcceptanceGate(input, {
    ...flags,
    app: flags.app || flags.app_slug || flags.appSlug || "",
    stage: flags.stage || "handoff",
    strict: Boolean(flags.strict),
    evidence: flags.evidence || flags.evidence_paths || flags.paths || "",
    screens: flags.screens || "",
    states: flags.states || ""
  });
}

function buildRegressionReport(input, flags = {}) {
  return buildUiUxRegressionChecklist(input, {
    ...flags,
    app: flags.app || flags.app_slug || flags.appSlug || "",
    evidence: flags.evidence || flags.evidence_paths || flags.paths || "",
    screens: flags.screens || "",
    states: flags.states || ""
  });
}

function buildKnowledgePackReport(flags = {}) {
  return buildKnowledgePackStatus({ root: process.cwd(), refresh: Boolean(flags.refresh) });
}

function buildCatalogHealthReport(flags = {}) {
  return buildCatalogHealth({ root: process.cwd(), refresh: Boolean(flags.refresh) });
}

function buildGovernanceRegistryReport(flags = {}) {
  return buildUiUxGovernanceRegistry({ root: process.cwd(), refresh: Boolean(flags.refresh) });
}

function buildUpgradePlanReport(flags = {}) {
  return buildUiUxUpgradePlan({ root: process.cwd(), refresh: Boolean(flags.refresh) });
}

function buildGovernanceReport(flags = {}) {
  return buildUiUxGovernance({ root: process.cwd(), refresh: Boolean(flags.refresh) });
}

function renderAcceptanceGateMarkdown(report) {
  return [
    "# UI/UX Acceptance Gate",
    "",
    `- App: ${report.app || "n/a"}`,
    `- Status: ${report.status || "warning"}`,
    `- Score: ${report.score || 0}`,
    `- Grade: ${report.grade || "F"}`,
    `- Next action: ${report.next_action || "Resolve the acceptance blockers before UI/UX handoff."}`,
    "",
    "## Criteria",
    ...(Array.isArray(report.criteria) && report.criteria.length
      ? report.criteria.map((item) => [
        `### ${item.criteria_id}`,
        `- Title: ${item.title}`,
        `- Status: ${item.status}`,
        `- Evidence: ${(item.evidence || []).join(", ") || "none"}`,
        `- Next action: ${item.next_action}`,
        ""
      ]).flat()
      : ["- None"]),
    "",
    "## Blockers",
    ...(Array.isArray(report.blockers) && report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    ...(Array.isArray(report.warnings) && report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["- None"])
  ].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function writeUiUxOutput(outputPath, content, root) {
  const resolved = path.resolve(root, outputPath);
  const allowedRoots = [
    path.join(root, "docs"),
    path.join(root, "docs", "reports"),
    path.join(root, "workspaces", "apps")
  ].map((item) => path.resolve(item));
  const isAllowed = allowedRoots.some((allowed) => resolved === allowed || resolved.startsWith(`${allowed}${path.sep}`));
  if (!isAllowed) {
    throw new Error("Unsafe output path. Use a path under docs/ or workspaces/apps/.");
  }
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, "utf8");
}

function renderStatus(report) {
  return [
    "UI UX Intelligence",
    "",
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `Catalog ready: ${report.catalog_ready ? "yes" : "no"}`,
    `Next action: ${report.next_action}`
  ].join("\n");
}

function renderSourceStatus(report, table) {
  const rows = [
    ["Temp source files", String(report.found_files_total || 0)],
    ["Installed data files", String(report.installed_data_files_total || 0)],
    ["Installed stack files", String(report.installed_stack_files_total || 0)],
    ["Layout", report.layout],
    ["Status", report.status],
    ["Expected files", String(report.expected_files_total)],
    ["Found files", String(report.found_files_total)],
    ["Missing files", report.missing_files.join(", ") || "none"],
    ["Unexpected files", report.unexpected_files.join(", ") || "none"]
  ];
  return [
    "UI UX Intelligence Source Status",
    "",
    table(["Field", "Value"], rows),
    "",
    `Next action: ${report.next_action}`
  ].join("\n");
}

function renderSearch(report, table) {
  const rows = report.results.map((item) => [item.kind, item.id, item.label, String(item.score)]);
  return [
    "UI UX Intelligence Search",
    "",
    `Query: ${report.query}`,
    "",
    table(["Kind", "Id", "Label", "Score"], rows.length ? rows : [["", "", "No matches.", ""]]),
    "",
    `Next action: ${report.next_action}`
  ].join("\n");
}

function renderChecklist(report, table) {
  const rows = report.checklist.map((item) => [item.check_id, item.title, item.category, item.severity, item.required ? "yes" : "no"]);
  return [
    "UI UX Intelligence Checklist",
    "",
    table(["Check", "Title", "Category", "Severity", "Required"], rows.length ? rows : [["", "", "No checklist items.", "", ""]]),
    "",
    `Summary: ${report.summary.total} total, ${report.summary.blockers} blockers, ${report.summary.warnings} warnings`,
    "",
    `Next action: ${report.next_action}`
  ].join("\n");
}

function renderJsonLike(report) {
  return JSON.stringify(report, null, 2);
}

module.exports = {
  uiUxIntelligence
};
