const fs = require("fs");
const path = require("path");
const {
  loadCatalog,
  getCatalogSummary,
  getProductType,
  getStackProfile,
  normalizeText,
  searchCatalog
} = require("./catalog");
const {
  detectProductType,
  recommendStyle,
  recommendPalette,
  recommendTypography,
  recommendLayoutPatterns,
  recommendUxRules,
  recommendAntiPatterns,
  recommendCharts,
  recommendIcons,
  recommendStackGuidance,
  recommendUiUx
} = require("./recommender");
const {
  generateDesignSystem,
  buildColorSystem,
  buildTypographySystem,
  buildLayoutSystem,
  buildComponentGuidance,
  buildMotionRules,
  buildAccessibilityGuidance,
  buildPreDeliveryChecklist
} = require("./design_system");
const { generateChecklist, categorizeChecklistItems, summarizeChecklist } = require("./checklist");
const {
  generateDocsSections,
  buildUiUxDesignSection,
  buildUxPrinciplesSection,
  buildInformationArchitectureSection,
  buildUserFlowsSection,
  buildWireframesSection,
  buildUiSpecificationSection,
  buildAccessibilitySection,
  mapSectionsToViberDocs
} = require("./docs_adapter");
const { auditUiUxTarget, auditTextContent, summarizeAudit } = require("./audit");
const { buildUiUxScorecard, scoreChecklist, scoreAuditFindings, scoreDocsCompleteness, calculateUiUxReadinessScore, summarizeScorecard } = require("./scorecard");
const { buildUiUxGate, evaluateUiUxStageGate, evaluateUiUxHandoffGate, evaluateUiUxPublishReadinessGate } = require("./gate");
const { buildViberUiUxReadiness, readUiUxDocsFromApp, summarizeUiUxReadiness } = require("./readiness");
const { generateDesignTokens, buildColorTokens, buildTypographyTokens, buildSpacingTokens, buildRadiusTokens, buildShadowTokens, buildMotionTokens, buildStateTokens } = require("./tokens");
const { generateComponentBlueprint, inferComponentSet, buildComponentStates, buildComponentAccessibility, buildComponentAcceptanceCriteria } = require("./components");
const { generateScreenBlueprint, inferScreens, buildScreenSections, buildScreenStates, buildScreenAcceptanceCriteria } = require("./screens");
const { generateUiUxHandoffPack, buildHandoffMarkdown, mapHandoffToViberDocs } = require("./handoff_pack");
const { buildUiPatternLibrary, inferRelevantPatterns, buildPatternAcceptanceCriteria, buildPatternAntiPatterns, buildPatternImplementationNotes } = require("./pattern_library");
const { buildImplementationGuidance, buildStackGuidance, buildComponentImplementationGuidance, buildScreenImplementationGuidance, buildStateImplementationGuidance, buildAccessibilityImplementationGuidance, buildTestingImplementationGuidance } = require("./implementation_guidance");
const { buildUiUxPromptPack, buildCodexUiImplementationPrompt, buildUiReviewPrompt, buildUiFixPrompt, renderPromptPackMarkdown } = require("./prompt_pack");
const { buildUiUxEvidenceManifest, normalizeEvidenceItem, classifyEvidencePath, summarizeEvidenceManifest, renderEvidenceMarkdown } = require("./evidence");
const { buildVisualQaContract, buildScreenQaRequirements, buildStateQaRequirements, buildResponsiveQaRequirements, buildAccessibilityQaRequirements, evaluateVisualQaEvidence, renderVisualQaMarkdown } = require("./visual_qa");
const { buildUiUxAcceptanceGate, evaluateScorecardForAcceptance, evaluateEvidenceForAcceptance, evaluateDocsForAcceptance, summarizeAcceptanceGate } = require("./acceptance_gate");
const { buildUiUxRegressionChecklist, buildRegressionItemsFromScreens, buildRegressionItemsFromComponents, buildRegressionItemsFromStates, summarizeRegressionChecklist, renderRegressionMarkdown } = require("./regression");

const PLUGIN_ID = "ui_ux_intelligence";
const EXPECTED_DATA_FILES = [
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
];
const EXPECTED_STACK_FILES = [
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
];
const EXPECTED_REFERENCE_LOGIC_FILES = ["core.py", "search.py", "design_system.py"];
const EXPECTED_REFERENCE_DOC_FILES = ["quick-reference.md", "skill-content.md"];
const EXPECTED_SOURCE_FILES = [
  ...EXPECTED_DATA_FILES,
  ...EXPECTED_STACK_FILES,
  ...EXPECTED_REFERENCE_LOGIC_FILES,
  ...EXPECTED_REFERENCE_DOC_FILES
];

function getPluginStatus(root = process.cwd()) {
  const pluginPath = path.join(root, "plugins", PLUGIN_ID, "plugin.json");
  const available = fs.existsSync(pluginPath);
  const catalog = loadCatalog({ root });
  return {
    report_type: "ui_ux_intelligence_status",
    plugin_id: PLUGIN_ID,
    status: available ? "available" : "missing",
    standalone: true,
    external_github_dependency: false,
    catalog_ready: catalog.catalog_ready,
    capabilities: ["source-status", "catalog", "search", "recommend", "design_system", "checklist", "docs", "audit", "scorecard", "gate", "readiness", "handoff_pack", "tokens", "components", "screens", "patterns", "implementation_guidance", "prompt_pack", "evidence", "visual_qa", "acceptance_gate", "regression"],
    next_action: catalog.catalog_ready
      ? "Run kvdf ui-ux-intelligence catalog --json or kvdf ui-ux-intelligence search --query \"...\" --domain all --json."
      : "Install the relocated CSV data into plugins/ui_ux_intelligence/data/ and plugins/ui_ux_intelligence/data/stacks/."
  };
}

function buildSourceStatusReport(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const dataRoot = path.join(root, "plugins", PLUGIN_ID, "data");
  const catalog = loadCatalog({ root, refresh: true });
  const installedDataFiles = collectInstalledFiles(dataRoot, EXPECTED_DATA_FILES);
  const installedStackFiles = collectInstalledFiles(path.join(dataRoot, "stacks"), EXPECTED_STACK_FILES);
  const installedComplete = installedDataFiles.length === EXPECTED_DATA_FILES.length && installedStackFiles.length === EXPECTED_STACK_FILES.length;
  const status = installedComplete ? "ready" : catalog.catalog_ready || installedDataFiles.length > 0 || installedStackFiles.length > 0 ? "partial" : "missing";
  return {
    report_type: "ui_ux_intelligence_source_status",
    data_root: normalizePathForReport(dataRoot, root),
    layout: "flat",
    status,
    expected_files_total: EXPECTED_SOURCE_FILES.length,
    installed_data_files: installedDataFiles,
    installed_stack_files: installedStackFiles,
    installed_data_files_total: installedDataFiles.length,
    installed_stack_files_total: installedStackFiles.length,
    catalog_ready: catalog.catalog_ready,
    temp_meta_dependency: !catalog.catalog_ready,
    temp_meta_ignored: true,
    next_action: catalog.catalog_ready
      ? "Use plugins/ui_ux_intelligence/data/ as the live catalog source."
      : "Run the relocation/import phase after all expected files are present."
  };
}

function collectInstalledFiles(directory, expectedFiles) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const found = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  return expectedFiles.filter((name) => found.includes(name));
}

function searchUiUx(input, options = {}) {
  return searchCatalog(input, options);
}

function recommendAndBuild(input, options = {}) {
  return recommendUiUx(input, options);
}

function buildDesignSystem(input, options = {}) {
  return generateDesignSystem(input, options);
}

function buildChecklist(input, options = {}) {
  return generateChecklist(input, options);
}

function buildDocsSections(input, options = {}) {
  return generateDocsSections(input, options);
}

function buildAudit(input, options = {}) {
  return auditUiUxTarget(input, options);
}

function getCatalogReport(options = {}) {
  const root = typeof options.repoRoot === "function" ? options.repoRoot() : typeof options.root === "string" ? options.root : process.cwd();
  return getCatalogSummary({ root, refresh: Boolean(options.refresh) });
}

function normalizePathForReport(value, root) {
  const normalized = path.resolve(value).replace(/\\/g, "/");
  const normalizedRoot = path.resolve(root).replace(/\\/g, "/");
  return normalized.startsWith(`${normalizedRoot}/`) || normalized === normalizedRoot
    ? path.relative(root, value).replace(/\\/g, "/")
    : normalized;
}

function buildMarkdownStatus(report) {
  return [
    "UI UX Intelligence",
    "",
    `Plugin: ${report.plugin_id}`,
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `External GitHub dependency: ${report.external_github_dependency ? "yes" : "no"}`,
    `Catalog ready: ${report.catalog_ready ? "yes" : "no"}`,
    `Capabilities: ${report.capabilities.join(", ")}`,
    `Next action: ${report.next_action}`
  ].join("\n");
}

function listExpectedSourceFiles() {
  return [...EXPECTED_SOURCE_FILES];
}

module.exports = {
  PLUGIN_ID,
  EXPECTED_DATA_FILES,
  EXPECTED_STACK_FILES,
  EXPECTED_REFERENCE_LOGIC_FILES,
  EXPECTED_REFERENCE_DOC_FILES,
  EXPECTED_SOURCE_FILES,
  getPluginStatus,
  buildSourceStatusReport,
  getCatalogReport,
  searchUiUx,
  detectProductType,
  recommendStyle,
  recommendPalette,
  recommendTypography,
  recommendLayoutPatterns,
  recommendUxRules,
  recommendAntiPatterns,
  recommendCharts,
  recommendIcons,
  recommendStackGuidance,
  recommendAndBuild,
  recommendUiUx,
  buildDesignSystem,
  generateDesignSystem,
  buildColorSystem,
  buildTypographySystem,
  buildLayoutSystem,
  buildComponentGuidance,
  buildMotionRules,
  buildAccessibilityGuidance,
  buildPreDeliveryChecklist,
  buildChecklist,
  generateChecklist,
  categorizeChecklistItems,
  summarizeChecklist,
  buildDocsSections,
  generateDocsSections,
  buildUiUxDesignSection,
  buildUxPrinciplesSection,
  buildInformationArchitectureSection,
  buildUserFlowsSection,
  buildWireframesSection,
  buildUiSpecificationSection,
  buildAccessibilitySection,
  mapSectionsToViberDocs,
  buildAudit,
  auditUiUxTarget,
  auditTextContent,
  summarizeAudit,
  buildUiUxScorecard,
  scoreChecklist,
  scoreAuditFindings,
  scoreDocsCompleteness,
  calculateUiUxReadinessScore,
  summarizeScorecard,
  buildUiUxGate,
  evaluateUiUxStageGate,
  evaluateUiUxHandoffGate,
  evaluateUiUxPublishReadinessGate,
  buildViberUiUxReadiness,
  readUiUxDocsFromApp,
  summarizeUiUxReadiness,
  generateDesignTokens,
  buildColorTokens,
  buildTypographyTokens,
  buildSpacingTokens,
  buildRadiusTokens,
  buildShadowTokens,
  buildMotionTokens,
  buildStateTokens,
  generateComponentBlueprint,
  inferComponentSet,
  buildComponentStates,
  buildComponentAccessibility,
  buildComponentAcceptanceCriteria,
  generateScreenBlueprint,
  inferScreens,
  buildScreenSections,
  buildScreenStates,
  buildScreenAcceptanceCriteria,
  generateUiUxHandoffPack,
  buildHandoffMarkdown,
  mapHandoffToViberDocs,
  buildUiPatternLibrary,
  inferRelevantPatterns,
  buildPatternAcceptanceCriteria,
  buildPatternAntiPatterns,
  buildPatternImplementationNotes,
  buildImplementationGuidance,
  buildStackGuidance,
  buildComponentImplementationGuidance,
  buildScreenImplementationGuidance,
  buildStateImplementationGuidance,
  buildAccessibilityImplementationGuidance,
  buildTestingImplementationGuidance,
  buildUiUxPromptPack,
  buildCodexUiImplementationPrompt,
  buildUiReviewPrompt,
  buildUiFixPrompt,
  renderPromptPackMarkdown,
  buildUiUxEvidenceManifest,
  normalizeEvidenceItem,
  classifyEvidencePath,
  summarizeEvidenceManifest,
  renderEvidenceMarkdown,
  buildVisualQaContract,
  buildScreenQaRequirements,
  buildStateQaRequirements,
  buildResponsiveQaRequirements,
  buildAccessibilityQaRequirements,
  evaluateVisualQaEvidence,
  renderVisualQaMarkdown,
  buildUiUxAcceptanceGate,
  evaluateScorecardForAcceptance,
  evaluateEvidenceForAcceptance,
  evaluateDocsForAcceptance,
  summarizeAcceptanceGate,
  buildUiUxRegressionChecklist,
  buildRegressionItemsFromScreens,
  buildRegressionItemsFromComponents,
  buildRegressionItemsFromStates,
  summarizeRegressionChecklist,
  renderRegressionMarkdown,
  buildMarkdownStatus,
  listExpectedSourceFiles
};
