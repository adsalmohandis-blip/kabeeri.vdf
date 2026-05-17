const fs = require("fs");
const path = require("path");
const { fileExists, listDirectories, readJsonFile, repoRoot, assertSafeName, writeJsonFile } = require("../fs_utils");
const { seedDeveloperAppWorkspace } = require("../workspace");
const { normalizeSurfaceScopes, summarizeWorkspaceContract, validateDeveloperAppWorkspace } = require("../services/app_workspace_contract");
const {
  buildAppScorecardReport,
  buildAppScorecardSummaryLine,
  lockAppScorecards,
  refreshAppScorecards,
  reviewAppScorecards,
  seedAppScorecardState
} = require("../services/app_scorecards");

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
      surface_scopes: normalizeSurfaceScopes(metadata.surface_scopes, metadata.app_type || "application"),
      linked_workspace_roots: Array.isArray(metadata.linked_workspace_roots) ? metadata.linked_workspace_roots : [],
      root: `workspaces/apps/${slug}`,
      created_at: metadata.created_at || null,
      status: metadata.workspace_kind || "developer_app",
      local_state_exists: fs.existsSync(localState)
    };
  });
}

function renderAppWorkspaceTable(workspaces, table) {
  return table(["Slug", "Name", "Type", "Surfaces", "Boundary", "Root", "Status"], workspaces.map((item) => [
    item.slug,
    item.name,
    item.app_type,
    Array.isArray(item.surface_scopes) ? item.surface_scopes.join(", ") : "",
    item.boundary_status || "",
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
    const workspaces = [...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug)).map((item) => {
      const validation = validateDeveloperAppWorkspace(item.root);
      const scorecards = refreshAppScorecards(item.root) || seedAppScorecardState(item.root);
      return {
        ...item,
        surface_scopes: validation.surface_scopes,
        contract_status: validation.status,
        contract_missing: validation.missing_count,
        boundary_status: validation.boundary ? (validation.boundary.counts.blocked > 0 ? "blocked" : validation.boundary.counts.linked > 0 ? "linked" : "allowed") : "unknown",
        scorecard_status: scorecards && scorecards.summary ? (scorecards.summary.release_ready ? "ready" : scorecards.summary.blocked > 0 ? "blocked" : "needs_attention") : "unknown",
        scorecards: scorecards ? scorecards.summary : null
      };
    });
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
    const surfaceScopes = normalizeSurfaceScopes(flags.surfaces || flags.surface || flags["surface-scopes"], appType);
    const scaffold = seedDeveloperAppWorkspace(slug, { name, appType, surfaceScopes });
    const record = {
      slug,
      name,
      app_type: appType,
      root: scaffold.workspace_root,
      status: "developer_app",
      surface_scopes: surfaceScopes,
      linked_workspace_roots: [],
      created_at: new Date().toISOString(),
      updated_at: null
    };
    registry.workspaces.push(record);
    registry.updated_at = new Date().toISOString();
    writeJsonFile(REGISTRY_FILE, registry);
    const scorecards = seedAppScorecardState(record.root, {
      by: "app_workspace_create",
      summary: "Initial app scorecards seeded from the workspace scaffold."
    });
    appendAudit("app_workspace.created", "app_workspace", slug, `Developer app workspace created: ${name}`);
    const validation = validateDeveloperAppWorkspace(record.root);
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "developer_app_workspace_scaffold",
        state_file: REGISTRY_FILE,
        workspace: record,
        created_files: scaffold.created,
        validation,
        scorecards: scorecards ? scorecards.summary : null
      }, null, 2));
    } else {
      console.log(`Created app workspace ${slug}`);
      console.log(`Root: ${record.root}`);
      console.log(`Status: ${validation.status}`);
      console.log(buildAppScorecardSummaryLine(scorecards || { summary: {} }));
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
    const validation = validateDeveloperAppWorkspace(workspace.root);
    const scorecards = refreshAppScorecards(workspace.root);
    const report = {
      report_type: "developer_app_workspace",
      state_file: REGISTRY_FILE,
      workspace,
      local_state: localState,
      validation,
      contract: summarizeWorkspaceContract(validation),
      scorecards: scorecards ? scorecards.summary : null
    };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "validate") {
    const slug = String(flags.slug || value || flags.username || "").trim().toLowerCase();
    const workspaces = slug ? [merged.get(slug)].filter(Boolean) : [...merged.values()];
    if (!workspaces.length) throw new Error(slug ? `App workspace not found: ${slug}` : "No app workspaces found.");
    const validations = workspaces.map((workspace) => {
      const validation = validateDeveloperAppWorkspace(workspace.root);
      const scorecards = refreshAppScorecards(workspace.root);
      return {
        ...validation,
        workspace: {
          slug: workspace.slug,
          name: workspace.name,
          root: workspace.root,
          app_type: workspace.app_type,
          surface_scopes: workspace.surface_scopes || []
        },
        scorecards: scorecards ? scorecards.summary : null
      };
    });
    const ok = validations.every((item) => item.ok);
    const report = {
      report_type: "developer_app_workspace_validation_report",
      state_file: REGISTRY_FILE,
      ok,
      workspace_count: validations.length,
      validations,
      next_exact_action: ok ? "kvdf task tracker" : "kvdf app workspace validate"
    };
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(JSON.stringify(report, null, 2));
    }
    if (!ok) process.exitCode = 1;
    return;
  }

  if (action === "scorecards" || action === "scorecard") {
    const slug = String(flags.slug || value || flags.username || "").trim().toLowerCase();
    const workspace = slug ? merged.get(slug) : null;
    const targetRoot = workspace ? workspace.root : process.cwd();
    const command = String(rest[0] || flags.mode || flags.action || "").trim().toLowerCase();
    const scorecards = flags.review || command === "review"
      ? reviewAppScorecards(targetRoot, flags)
      : flags.lock || command === "lock"
        ? lockAppScorecards(targetRoot, flags)
        : refreshAppScorecards(targetRoot, flags);
    const report = buildAppScorecardReport(targetRoot, flags);
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(buildAppScorecardSummaryLine(scorecards || report));
      console.log(JSON.stringify({
        review_state: report.review_state,
        summary: report.summary,
        next_exact_action: report.next_exact_action
      }, null, 2));
      console.log(renderAppWorkspaceTable([{
        slug: report.workspace_slug,
        name: report.app_name,
        app_type: report.app_type,
        surface_scopes: report.surface_scopes,
        boundary_status: report.summary && report.summary.release_ready ? "ready" : "needs_attention",
        root: report.workspace_root,
        status: report.review_state ? report.review_state.status : "draft"
      }], table));
    }
    return;
  }

  throw new Error(`Unknown app workspace action: ${action}`);
}

module.exports = {
  appWorkspace,
  defaultAppWorkspaceRegistry,
  ensureAppWorkspaceRegistry
};
