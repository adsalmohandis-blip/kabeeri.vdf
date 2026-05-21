const {
  getPluginStatus,
  buildSourceStatusReport,
  searchUiUx,
  recommendAndBuild,
  buildDesignSystem,
  buildChecklist,
  buildDocsSections,
  buildAudit
} = require("../../../plugins/ui_ux_intelligence/runtime");

function uiUxIntelligence(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => "" } = deps;
  const mode = normalizeAction(action);

  if (!mode || mode === "status" || mode === "list") {
    const report = getPluginStatus(typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd());
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderStatus(report));
    return;
  }

  if (mode === "source-status") {
    const report = buildSourceStatusReport({
      root: typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd(),
      source_root: flags.source_root || flags.sourceRoot || flags.root
    });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderSourceStatus(report, table));
    return;
  }

  const idea = resolveIdea(value, flags, rest);
  if (mode === "search") {
    const report = searchUiUx(idea, flags);
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

  throw new Error(`Unknown ui-ux-intelligence action: ${action}`);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "design_system") return "design-system";
  if (value === "source_status") return "source-status";
  return value;
}

function resolveIdea(value, flags = {}, rest = []) {
  const candidates = [value, flags.idea, flags.goal, rest.filter(Boolean).join(" ")];
  const result = candidates.find((item) => typeof item === "string" && item.trim());
  return result ? String(result).trim() : "";
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
    `Next action: ${report.next_action}`
  ].join("\n");
}

function renderJsonLike(report) {
  return JSON.stringify(report, null, 2);
}

module.exports = {
  uiUxIntelligence
};
