const fs = require("fs");
const path = require("path");
const {
  getProductType,
  getStackProfile,
  normalizeText
} = require("./catalog");
const { searchCatalog } = require("./search_engine");
const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");
const { generateChecklist } = require("./checklist");
const { generateDocsSections } = require("./docs_adapter");
const { auditUiUx } = require("./audit");

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
  return {
    report_type: "ui_ux_intelligence_status",
    plugin_id: PLUGIN_ID,
    status: available ? "available" : "missing",
    standalone: true,
    external_github_dependency: false,
    catalog_ready: false,
    capabilities: ["source-status", "search", "recommend", "design_system", "checklist", "docs", "audit"],
    next_action: "Place selected files flat under plugins/ui_ux_intelligence/_temp_meta/, then run kvdf ui-ux-intelligence source-status --json."
  };
}

function buildSourceStatusReport(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const sourceRoot = path.resolve(options.source_root || options.sourceRoot || path.join(root, "plugins", PLUGIN_ID, "_temp_meta"));
  const exists = fs.existsSync(sourceRoot);
  const normalizedSourceRoot = normalizePathForReport(sourceRoot, root);
  if (!exists) {
    return {
      report_type: "ui_ux_intelligence_source_status",
      source_root: normalizedSourceRoot,
      layout: "flat",
      status: "missing",
      expected_files_total: EXPECTED_SOURCE_FILES.length,
      found_files_total: 0,
      missing_files: [...EXPECTED_SOURCE_FILES],
      found_files: [],
      data_files: [],
      stack_files: [],
      reference_logic_files: [],
      reference_doc_files: [],
      unexpected_files: [],
      temp_meta_ignored: true,
      next_action: "Place selected files flat under plugins/ui_ux_intelligence/_temp_meta/, then run kvdf ui-ux-intelligence source-status --json."
    };
  }

  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });
  const fileNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => `${entry.name}/`);
  const dataFiles = fileNames.filter((name) => EXPECTED_DATA_FILES.includes(name));
  const stackFiles = fileNames.filter((name) => EXPECTED_STACK_FILES.includes(name));
  const referenceLogicFiles = fileNames.filter((name) => EXPECTED_REFERENCE_LOGIC_FILES.includes(name));
  const referenceDocFiles = fileNames.filter((name) => EXPECTED_REFERENCE_DOC_FILES.includes(name));
  const recognized = [...dataFiles, ...stackFiles, ...referenceLogicFiles, ...referenceDocFiles];
  const unexpectedFiles = [
    ...fileNames.filter((name) => !EXPECTED_SOURCE_FILES.includes(name)),
    ...directories
  ].sort();
  const missingFiles = EXPECTED_SOURCE_FILES.filter((name) => !recognized.includes(name));
  const foundFiles = [...recognized, ...unexpectedFiles].sort();
  const foundFilesTotal = fileNames.length + directories.length;
  let status = "partial";
  if (foundFilesTotal === 0 || recognized.length === 0) {
    status = "missing";
  } else if (!missingFiles.length && !unexpectedFiles.length) {
    status = "ready";
  }
  return {
    report_type: "ui_ux_intelligence_source_status",
    source_root: normalizedSourceRoot,
    layout: "flat",
    status,
    expected_files_total: EXPECTED_SOURCE_FILES.length,
    found_files_total: foundFilesTotal,
    missing_files: missingFiles,
    found_files: foundFiles,
    data_files: dataFiles,
    stack_files: stackFiles,
    reference_logic_files: referenceLogicFiles,
    reference_doc_files: referenceDocFiles,
    unexpected_files: unexpectedFiles,
    temp_meta_ignored: true,
    next_action: "Run the relocation/import phase after all expected files are present."
  };
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
  return auditUiUx(input, options);
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
  searchUiUx,
  recommendAndBuild,
  buildDesignSystem,
  buildChecklist,
  buildDocsSections,
  buildAudit,
  buildMarkdownStatus,
  listExpectedSourceFiles
};
