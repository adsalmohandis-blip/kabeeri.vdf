const fs = require("fs");
const path = require("path");
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
  const manifestPath = resolvePluginPath("plugin.json");
  const runtimePath = resolvePluginPath("runtime", "index.js");
  const pluginPresent = Boolean(safeStat(manifestPath) && safeStat(runtimePath));
  return {
    report_type: "ui_dashboard_kits_status",
    plugin_id: "ui_dashboard_kits",
    status: pluginPresent ? "available" : "warning",
    enabled_by_default: false,
    core_dependency: false,
    checks: [...CHECK_RULES],
    next_action: "Run kvdf ui-dashboard-kits check <files...>."
  };
}

function buildUiDashboardKitsStatus() {
  return getPluginStatus();
}

function buildExamplesReport() {
  return {
    report_type: "ui_dashboard_kits_examples",
    examples: listMarkdownEntries("examples", "example"),
    next_action: "Use these examples as UI dashboard guidance or copy them into a task punch.",
    plugin_id: "ui_dashboard_kits"
  };
}

function buildTemplatesReport() {
  return {
    report_type: "ui_dashboard_kits_templates",
    templates: fs.existsSync(resolvePluginPath("templates"))
      ? fs.readdirSync(resolvePluginPath("templates"))
        .filter((entry) => safeStat(resolvePluginPath("templates", entry))?.isFile())
        .sort((a, b) => a.localeCompare(b))
        .map((entry) => ({
          id: `template:${path.basename(entry, path.extname(entry))}`,
          name: path.basename(entry, path.extname(entry)).replace(/[-_]/g, " "),
          path: path.relative(pluginRoot(), resolvePluginPath("templates", entry)).replace(/\\/g, "/")
        }))
      : [],
    next_action: "Use these templates as starter HTML for dashboard or docs surfaces.",
    plugin_id: "ui_dashboard_kits"
  };
}

function buildSnippetsReport() {
  return {
    report_type: "ui_dashboard_kits_snippets",
    snippets: fs.existsSync(resolvePluginPath("snippets"))
      ? fs.readdirSync(resolvePluginPath("snippets"))
        .filter((entry) => safeStat(resolvePluginPath("snippets", entry))?.isFile())
        .sort((a, b) => a.localeCompare(b))
        .map((entry) => ({
          id: `snippet:${path.basename(entry, path.extname(entry))}`,
          name: path.basename(entry, path.extname(entry)).replace(/[-_]/g, " "),
          path: path.relative(pluginRoot(), resolvePluginPath("snippets", entry)).replace(/\\/g, "/")
        }))
      : [],
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
  buildExamplesReport,
  buildTemplatesReport,
  buildSnippetsReport,
  CHECK_RULES,
  renderUsage,
  renderCheckText,
  checkUiFiles
};
