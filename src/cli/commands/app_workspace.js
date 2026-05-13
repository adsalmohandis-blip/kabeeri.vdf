const fs = require("fs");
const path = require("path");
const { fileExists, listDirectories, readJsonFile, repoRoot, assertSafeName, writeJsonFile } = require("../fs_utils");
const { seedDeveloperAppWorkspace } = require("../workspace");

const REGISTRY_FILE = ".kabeeri/app_workspaces.json";

function defaultAppWorkspaceRegistry() {
  return { version: "v1", workspaces: [], updated_at: null };
}

function ensureAppWorkspaceRegistry() {
  if (!fileExists(REGISTRY_FILE)) {
    writeJsonFile(REGISTRY_FILE, defaultAppWorkspaceRegistry());
  }
  const registry = readJsonFile(REGISTRY_FILE);
  registry.workspaces = Array.isArray(registry.workspaces) ? registry.workspaces : [];
  return registry;
}

function normalizeWorkspaceType(value) {
  const normalized = String(value || "application").trim().toLowerCase();
  const allowed = new Set(["application", "backend", "frontend", "admin_frontend", "mobile", "api", "service", "worker"]);
  if (!allowed.has(normalized)) {
    throw new Error("Invalid workspace type. Use application, backend, frontend, admin_frontend, mobile, api, service, or worker.");
  }
  return normalized;
}

function discoverAppWorkspaces() {
  const root = path.join(repoRoot(), "workspaces", "apps");
  if (!fs.existsSync(root)) return [];
  return listDirectories("workspaces/apps").map((slug) => {
    const workspaceRoot = path.join(root, slug);
    const localState = path.join(workspaceRoot, ".kabeeri", "workspace.json");
    const metadata = fileExists(path.join("workspaces/apps", slug, ".kabeeri/workspace.json"))
      ? readJsonFile(path.join("workspaces/apps", slug, ".kabeeri/workspace.json"))
      : {};
    return {
      slug,
      name: metadata.app_name || metadata.app_slug || slug,
      app_type: metadata.app_type || "application",
      root: `workspaces/apps/${slug}`,
      created_at: metadata.created_at || null,
      status: metadata.workspace_kind || "developer_app",
      local_state_exists: fs.existsSync(localState)
    };
  });
}

function renderAppWorkspaceTable(workspaces, table) {
  return table(["Slug", "Name", "Type", "Root", "Status"], workspaces.map((item) => [
    item.slug,
    item.name,
    item.app_type,
    item.root,
    item.status || ""
  ]));
}

function appWorkspace(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => {}, ensureWorkspace = () => {}, appendAudit = () => {} } = deps;
  ensureWorkspace();
  const registry = ensureAppWorkspaceRegistry();
  const registryWorkspaces = Array.isArray(registry.workspaces) ? registry.workspaces : [];
  const discovered = discoverAppWorkspaces();
  const merged = new Map();
  for (const item of [...registryWorkspaces, ...discovered]) {
    if (!item || !item.slug) continue;
    merged.set(item.slug, {
      ...merged.get(item.slug),
      ...item
    });
  }

  if (!action || ["list", "status"].includes(action)) {
    const workspaces = [...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug));
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "developer_app_workspaces",
        state_file: REGISTRY_FILE,
        workspace_count: workspaces.length,
        workspaces
      }, null, 2));
    } else {
      console.log(renderAppWorkspaceTable(workspaces, table));
    }
    return;
  }

  if (action === "create") {
    const slug = String(flags.slug || value || flags.username || "").trim().toLowerCase();
    if (!slug) throw new Error("Missing --slug.");
    assertSafeName(slug);
    if (merged.has(slug)) throw new Error(`App workspace already exists: ${slug}`);
    const name = flags.name || slug;
    const appType = normalizeWorkspaceType(flags.type || flags["app-type"] || "application");
    const scaffold = seedDeveloperAppWorkspace(slug, { name, appType });
    const record = {
      slug,
      name,
      app_type: appType,
      root: scaffold.workspace_root,
      status: "developer_app",
      created_at: new Date().toISOString(),
      updated_at: null
    };
    registry.workspaces.push(record);
    registry.updated_at = new Date().toISOString();
    writeJsonFile(REGISTRY_FILE, registry);
    appendAudit("app_workspace.created", "app_workspace", slug, `Developer app workspace created: ${name}`);
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "developer_app_workspace_scaffold",
        state_file: REGISTRY_FILE,
        workspace: record,
        created_files: scaffold.created
      }, null, 2));
    } else {
      console.log(`Created app workspace ${slug}`);
      console.log(`Root: ${record.root}`);
    }
    return;
  }

  if (action === "show") {
    const slug = String(flags.slug || value || flags.username || "").trim().toLowerCase();
    if (!slug) throw new Error("Missing app workspace slug.");
    const workspace = merged.get(slug);
    if (!workspace) throw new Error(`App workspace not found: ${slug}`);
    const localStatePath = path.join(repoRoot(), workspace.root, ".kabeeri", "workspace.json");
    const localState = fs.existsSync(localStatePath) ? readJsonFile(path.join(workspace.root, ".kabeeri/workspace.json")) : null;
    const report = {
      report_type: "developer_app_workspace",
      state_file: REGISTRY_FILE,
      workspace,
      local_state: localState
    };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return;
  }

  throw new Error(`Unknown app workspace action: ${action}`);
}

module.exports = {
  appWorkspace,
  defaultAppWorkspaceRegistry,
  ensureAppWorkspaceRegistry
};
