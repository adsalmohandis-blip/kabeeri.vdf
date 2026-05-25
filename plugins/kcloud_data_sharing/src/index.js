const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");

const PLUGIN_NAME = "KCloud Data Sharing";
const AUTHORITY_PLUGIN = "multi_ai_governance";
const RUNTIME_ROOT = ".kabeeri/kcloud";
const CONFIG_FILE = `${RUNTIME_ROOT}/config.json`;

function kcloudDataSharing(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const subaction = normalizeAction(value || action);
  if (!action || subaction === "status" || subaction === "summary" || subaction === "show") {
    return buildKcloudStatusReport(flags);
  }
  if (subaction === "init" || String(action).trim().toLowerCase() === "init") {
    return initKcloudConfig(flags);
  }
  throw new Error(`Unknown kcloud action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildKcloudStatusReport(flags = {}) {
  ensureWorkspace();
  const runtimeRoot = RUNTIME_ROOT;
  const configPath = CONFIG_FILE;
  const configExists = fs.existsSync(path.join(repoRoot(), configPath));
  const config = configExists ? readJsonFile(configPath) : null;
  const repoUrl = config && config.repo_url ? config.repo_url : detectRepoUrl();
  return {
    report_type: "kcloud_data_sharing_status",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    plugin_id: "kcloud_data_sharing",
    authority_plugin: AUTHORITY_PLUGIN,
    transmit_status: config && config.transmit_enabled ? "enabled" : "disabled",
    receive_status: config && config.receive_enabled ? "enabled" : "disabled",
    cloud_project_connection_status: config && config.cloud_project_id ? "connected" : "not_connected",
    local_runtime_state_path: runtimeRoot,
    config_path: configPath,
    config_exists: configExists,
    project_id: config ? config.project_id : null,
    repo_url: repoUrl || null,
    cloud_project_id: config ? config.cloud_project_id : null,
    next_action: configExists ? "Use `kvdf kcloud init` to refresh the local shell config if needed." : "Run `kvdf kcloud init` to create the local cloud config."
  };
}

function initKcloudConfig(flags = {}) {
  ensureWorkspace();
  const now = new Date().toISOString();
  const repoUrl = String(flags.repo_url || flags.repoUrl || detectRepoUrl() || "").trim() || null;
  const config = {
    project_id: String(flags.project_id || flags.projectId || "").trim() || null,
    repo_url: repoUrl,
    cloud_project_id: null,
    transmit_enabled: false,
    receive_enabled: false,
    authority_plugin: AUTHORITY_PLUGIN,
    created_at: now,
    updated_at: now
  };
  writeJsonFile(CONFIG_FILE, config);
  return {
    report_type: "kcloud_data_sharing_initialized",
    generated_at: now,
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    config_path: CONFIG_FILE,
    config
  };
}

function renderKcloudReport(report) {
  if (!report || typeof report !== "object") return String(report || "");
  if (report.report_type === "kcloud_data_sharing_status") {
    return [
      `${report.plugin_name} (${report.plugin_id})`,
      `Authority plugin: ${report.authority_plugin}`,
      `Transmit status: ${report.transmit_status}`,
      `Receive status: ${report.receive_status}`,
      `Cloud project connection status: ${report.cloud_project_connection_status}`,
      `Local runtime state path: ${report.local_runtime_state_path}`,
      `Config path: ${report.config_path}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_initialized") {
    return [
      `${report.plugin_name} initialized`,
      `Runtime root: ${report.runtime_root}`,
      `Config path: ${report.config_path}`,
      `Authority plugin: ${report.authority_plugin}`
    ].join("\n");
  }
  return JSON.stringify(report, null, 2);
}

function detectRepoUrl() {
  try {
    const value = execFileSync("git", ["config", "--get", "remote.origin.url"], { cwd: repoRoot(), stdio: ["ignore", "pipe", "ignore"] });
    return String(value).trim() || null;
  } catch (error) {
    return null;
  }
}

function normalizeAction(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = {
  kcloudDataSharing,
  buildKcloudStatusReport,
  initKcloudConfig,
  renderKcloudReport,
  detectRepoUrl,
  CONFIG_FILE,
  RUNTIME_ROOT,
  AUTHORITY_PLUGIN
};
