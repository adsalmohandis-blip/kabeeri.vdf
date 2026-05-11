const { fileExists, listDirectories, readJsonFile } = require("../fs_utils");
const { table } = require("../ui");

function repositoryStructure(action, value, flags = {}) {
  const map = getRepositoryFolderingMap();

  if (!action || action === "map" || action === "list") {
    const report = buildRepositoryStructureReport(map);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderRepositoryStructureMap(report);
    return;
  }

  if (action === "show") {
    const key = normalizeFolderPath(value);
    if (!key) throw new Error("Missing folder name. Example: kvdf structure show standard_systems");
    const entry = (map.current_to_target || []).find((item) => normalizeFolderPath(item.path) === key);
    const group = (map.target_root_groups || []).find((item) => item.group === key || normalizeFolderPath(item.target_path) === key);
    const legacy = map.legacy_aliases && map.legacy_aliases[`${key}/`];
    if (!entry && !group && !legacy) throw new Error(`Foldering entry not found: ${value}`);
    console.log(JSON.stringify(entry ? { type: "current_path", ...entry } : group ? { type: "target_group", ...group } : { type: "legacy_alias", path: `${key}/`, target_path: legacy }, null, 2));
    return;
  }

  if (action === "validate" || action === "check") {
    const report = buildRepositoryStructureReport(map);
    if (flags.json) console.log(JSON.stringify(report.validation, null, 2));
    else renderRepositoryStructureValidation(report.validation);
    if (report.validation.status === "fail") process.exitCode = 1;
    return;
  }

  if (action === "guide" || action === "docs") {
    const guide = {
      source_of_truth: "knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json",
      documentation: "docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md",
      recommended_commands: [
        "kvdf structure map",
        "kvdf structure validate",
        "kvdf structure show standard_systems",
        "kvdf validate foldering"
      ],
      ai_usage: map.ai_usage || {}
    };
    if (flags.json) console.log(JSON.stringify(guide, null, 2));
    else {
      console.log("Kabeeri Repository Foldering Guide");
      console.log(table(["Item", "Path"], [
        ["Source of truth", guide.source_of_truth],
        ["Documentation", guide.documentation],
        ["AI rule", guide.ai_usage.context_summary || ""]
      ]));
    }
    return;
  }

  throw new Error(`Unknown structure action: ${action}`);
}

function getRepositoryFolderingMap() {
  return readJsonFile("standard_systems/REPOSITORY_FOLDERING_MAP.json");
}

function buildRepositoryStructureReport(map = getRepositoryFolderingMap()) {
  const rootFolders = listDirectories(".").filter((name) => !["node_modules", ".next", "dist", "coverage"].includes(name));
  const allowed = new Set((map.allowed_top_level || []).map(normalizeFolderPath));
  const targetGroups = new Map((map.target_root_groups || []).map((item) => [item.group, item]));
  const unknown_folders = rootFolders.filter((name) => !allowed.has(normalizeFolderPath(name)));
  const missing_mapped_paths = (map.current_to_target || [])
    .map((item) => normalizeFolderPath(item.path))
    .filter((pathName) => pathName && !pathName.includes(".") && !rootFolders.includes(pathName) && pathName !== ".kabeeri")
    .filter((pathName) => pathName !== "github" || !rootFolders.includes("github"));
  const rows = (map.current_to_target || []).map((entry) => {
    const folder = normalizeFolderPath(entry.path);
    const group = targetGroups.get(entry.target_group) || {};
    return {
      path: entry.path,
      target_group: entry.target_group,
      target_path: group.target_path || "",
      role: entry.role,
      migration_status: entry.migration_status,
      exists: rootFolders.includes(folder) || folder === ".kabeeri" || fileExists(folder)
    };
  });

  const validation = {
    report_type: "repository_foldering_validation",
    generated_at: new Date().toISOString(),
    status: unknown_folders.length === 0 ? "pass" : "needs_attention",
    unknown_folders,
    missing_mapped_paths,
    mapped_paths: rows.length,
    target_groups: (map.target_root_groups || []).length,
    next_actions: unknown_folders.length === 0
      ? ["Continue routing new features through the foldering map before adding top-level folders."]
      : unknown_folders.map((folder) => `Classify ${folder}/ into an existing target group or document a new-folder exception.`)
  };

  return {
    report_type: "repository_foldering_map",
    generated_at: new Date().toISOString(),
    map_version: map.map_version,
    status: map.status,
    principles: map.principles || [],
    target_root_groups: map.target_root_groups || [],
    current_to_target: rows,
    validation,
    ai_usage: map.ai_usage || {}
  };
}

function normalizeFolderPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/\/$/, "");
}

function renderRepositoryStructureMap(report) {
  console.log(`Kabeeri Repository Foldering Map v${report.map_version}`);
  console.log(table(["Current path", "Target group", "Target path", "Status"], report.current_to_target.map((item) => [
    item.path,
    item.target_group,
    item.target_path,
    item.migration_status
  ])));
  console.log("");
  renderRepositoryStructureValidation(report.validation);
}

function renderRepositoryStructureValidation(validation) {
  console.log(`Foldering validation: ${validation.status}`);
  console.log(table(["Check", "Value"], [
    ["Target groups", validation.target_groups],
    ["Mapped paths", validation.mapped_paths],
    ["Unknown folders", validation.unknown_folders.length ? validation.unknown_folders.join(", ") : "none"],
    ["Missing mapped paths", validation.missing_mapped_paths.length ? validation.missing_mapped_paths.join(", ") : "none"]
  ]));
  if (validation.next_actions && validation.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    validation.next_actions.forEach((item) => console.log(`- ${item}`));
  }
}

module.exports = {
  repositoryStructure,
  getRepositoryFolderingMap,
  buildRepositoryStructureReport
};
