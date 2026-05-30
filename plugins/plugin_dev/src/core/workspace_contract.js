const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { buildPluginLoaderReport } = require("../../../../src/cli/services/plugin_loader");
const { pluginFolderStructure } = require("../../../plugin_folder_structure/bootstrap");
const { resolveTargetWorkspaceRoot } = require("../../../plugin_folder_structure/src/services/target_path_service");
const { PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES } = require("./constants");
const { pluginDevError } = require("./errors");
const { resolveTrack } = require("./track_resolver");
const { ensureDir, readJsonFile, writeJsonFile } = require("../utils/json_safe");

const REQUIRED_WORKSPACE_FOLDERS = ["docs", "prompts", "runtime", "dashboard", "viber_blocking", "src", "schemas", "tests"];

function getWorkspaceRoot(context) {
  const root = repoRoot();
  if (context.flags && (context.flags.workspace || context.flags.root)) {
    return path.resolve(root, String(context.flags.workspace || context.flags.root));
  }
  const track = resolveTrack(context);
  const slug = String(context.plugin_slug || "").trim();
  if (!slug) {
    return track === "owner"
      ? path.join(root, "plugins", "<plugin-slug>")
      : path.join(root, "workspaces", "plugins", "<plugin-slug>");
  }
  return resolveTargetWorkspaceRoot(slug, track);
}

function getArtifactsRoot(workspaceRoot) {
  return path.join(workspaceRoot, "docs", "plugin_dev");
}

function getPluginFolderStructureStatus() {
  const report = buildPluginLoaderReport();
  const plugin = (report.plugins || []).find((item) => item.plugin_id === "plugin_folder_structure");
  return {
    installed: Boolean(plugin),
    enabled: Boolean(plugin && plugin.enabled),
    discoverable: Boolean(plugin && plugin.manifest),
    plugin
  };
}

function buildWorkspaceContractReport(context) {
  const loader = getPluginFolderStructureStatus();
  const workspaceRoot = getWorkspaceRoot(context);
  const exists = fs.existsSync(workspaceRoot);
  const missing = [];
  if (exists) {
    for (const folder of REQUIRED_WORKSPACE_FOLDERS) {
      if (!fs.existsSync(path.join(workspaceRoot, folder))) missing.push(folder);
    }
  }
  const contractPath = path.join(repoRoot(), "plugins", "plugin_folder_structure", "plugin.json");
  const contract = readJsonFile(contractPath, null);
  const contractAvailable = Boolean(contract);
  return {
    report_type: "plugin_dev_workspace_contract",
    plugin_id: "plugin_dev",
    generated_at: new Date().toISOString(),
    plugin_slug: context.plugin_slug,
    track: context.track,
    workspace_root: workspaceRoot,
    exists,
    contract_available: contractAvailable,
    workspace_contract_source: "plugin_folder_structure",
    workspace_contract_available: contractAvailable,
    plugin_folder_structure: loader,
    required_folders: REQUIRED_WORKSPACE_FOLDERS,
    missing,
    valid: exists && missing.length === 0 && loader.installed && loader.enabled && contractAvailable
  };
}

function ensureWorkspace(context, deps = {}) {
  const report = buildWorkspaceContractReport(context);
  if (report.valid) return report;
  if (context.track === "viber") throw pluginDevError(PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES.viber);
  if (!report.plugin_folder_structure.installed || !report.plugin_folder_structure.enabled) {
    return { ...report, delegated: false, limited_mode: true };
  }
  if (deps.delegate === false) {
    return { ...report, delegated: false };
  }
  const previousLog = console.log;
  const previousError = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    pluginFolderStructure("create", context.plugin_slug, { track: context.track, slug: context.plugin_slug }, []);
  } finally {
    console.log = previousLog;
    console.error = previousError;
  }
  return buildWorkspaceContractReport(context);
}

module.exports = {
  REQUIRED_WORKSPACE_FOLDERS,
  getArtifactsRoot,
  getPluginFolderStructureStatus,
  getWorkspaceRoot,
  buildWorkspaceContractReport,
  ensureWorkspace
};
