const fs = require("fs");
const path = require("path");
const { buildDashboardKitGuidance, buildDashboardKitHtmlComment, buildDashboardKitProviderSummary, buildDashboardSurfaceRecommendations } = require("./provider");
const { listDashboardKits, getDashboardKit, recommendDashboardKit } = require("./kits");
const { listExamples, getExample, summarizeExamples } = require("./examples");
const { listTemplates, getTemplate, summarizeTemplates } = require("./templates");
const { listSnippets, getSnippet, summarizeSnippets } = require("./snippets");
const {
  CHECK_RULES,
  checkUiFiles,
  renderUsage,
  renderCheckText,
  runCheckUiCli
} = require("./check_ui");

function pluginRoot() {
  return path.resolve(__dirname, "..");
}

function resolvePluginPath(...segments) {
  return path.join(pluginRoot(), ...segments);
}

function safeStat(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.statSync(filePath) : null;
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function firstHeading(content) {
  const match = String(content || "").match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function firstParagraph(content) {
  const trimmed = String(content || "").trim();
  if (!trimmed) return "";
  const blocks = trimmed.split(/\n{2,}/);
  return blocks.find((block) => !/^#/.test(block.trim()))?.trim() || "";
}

function listMarkdownEntries(folder, kind) {
  const folderPath = resolvePluginPath(folder);
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter((entry) => safeStat(path.join(folderPath, entry))?.isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const fullPath = path.join(folderPath, entry);
      const content = readText(fullPath);
      const relPath = path.relative(pluginRoot(), fullPath).replace(/\\/g, "/");
      return {
        id: `${kind}:${path.basename(entry, path.extname(entry))}`,
        name: path.basename(entry, path.extname(entry)).replace(/[-_]/g, " "),
        title: firstHeading(content) || path.basename(entry, path.extname(entry)).replace(/[-_]/g, " "),
        path: relPath,
        summary: firstParagraph(content).slice(0, 220)
      };
    });
}

function getPluginStatus() {
  const provider = buildDashboardKitProviderSummary();
  const manifestPath = resolvePluginPath("plugin.json");
  const runtimePath = resolvePluginPath("runtime", "index.js");
  const pluginPresent = Boolean(safeStat(manifestPath) && safeStat(runtimePath));
  return {
    report_type: "ui_dashboard_kits_status",
    plugin_id: "ui_dashboard_kits",
    status: pluginPresent ? "available" : "warning",
    enabled_by_default: false,
    core_dependency: false,
    ui_library_dependency: false,
    checks: [...CHECK_RULES],
    provider,
    next_action: "Run kvdf ui-dashboard-kits check <files...>."
  };
}

function buildUiDashboardKitsStatus() {
  return getPluginStatus();
}

function buildExamplesReport() {
  const examples = listExamples();
  return {
    report_type: "ui_dashboard_kits_examples",
    examples,
    count: examples.length,
    next_action: "Use these examples as UI dashboard guidance or copy them into a task punch.",
    plugin_id: "ui_dashboard_kits"
  };
}

function buildTemplatesReport() {
  const templates = listTemplates();
  return {
    report_type: "ui_dashboard_kits_templates",
    templates,
    count: templates.length,
    next_action: "Use these templates as starter HTML for dashboard or docs surfaces.",
    plugin_id: "ui_dashboard_kits"
  };
}

function buildSnippetsReport() {
  const snippets = listSnippets();
  return {
    report_type: "ui_dashboard_kits_snippets",
    snippets,
    count: snippets.length,
    next_action: "Use these snippets as small UI contract reminders in prompts and task punches.",
    plugin_id: "ui_dashboard_kits"
  };
}

function buildUiDashboardKitsCheckReport(files = [], options = {}) {
  return checkUiFiles(files, options);
}

function buildUiDashboardKitsCheckCli(argv = process.argv.slice(2)) {
  return runCheckUiCli(argv);
}

module.exports = {
  getPluginStatus,
  buildUiDashboardKitsStatus,
  buildUiDashboardKitsCheckReport,
  buildUiDashboardKitsCheckCli,
  buildDashboardKitProviderSummary,
  buildDashboardKitGuidance,
  buildDashboardKitHtmlComment,
  buildDashboardSurfaceRecommendations,
  listDashboardKits,
  getDashboardKit,
  recommendDashboardKit,
  buildExamplesReport,
  buildTemplatesReport,
  buildSnippetsReport,
  listExamples,
  getExample,
  summarizeExamples,
  listTemplates,
  getTemplate,
  summarizeTemplates,
  listSnippets,
  getSnippet,
  summarizeSnippets,
  CHECK_RULES,
  renderUsage,
  renderCheckText,
  checkUiFiles
};
