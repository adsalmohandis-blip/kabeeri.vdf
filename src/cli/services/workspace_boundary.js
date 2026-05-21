const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");

function readJsonFileIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizePath(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "");
}

function normalizeTrack(value) {
  const text = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "_");
  if (text === "owner" || text === "framework_owner" || text === "kvdf") return "framework_owner";
  if (text === "vibe" || text === "viber" || text === "vibe_app_developer" || text === "app") return "vibe_app_developer";
  if (text === "plugin" || text === "plugins") return "plugin";
  return "unknown";
}

function resolveWorkspaceRoot(cwd = repoRoot()) {
  const normalized = path.resolve(cwd);
  const appMatch = normalized.match(/workspaces[\\/]+apps[\\/]+([^\\/]+)$/i);
  if (appMatch) return { kind: "viber_app", root: normalized, app_slug: appMatch[1], plugin_id: null };
  const pluginMatch = normalized.match(/plugins[\\/]+([^\\/]+)$/i);
  if (pluginMatch) return { kind: "plugin", root: normalized, app_slug: null, plugin_id: pluginMatch[1] };
  return { kind: null, root: normalized, app_slug: null, plugin_id: null };
}

function detectWorkspaceKind({ cwd = repoRoot(), packageJson = null, workspaceJson = null, projectJson = null, pluginJson = null, targetTrack = null, appSlug = null, pluginId = null } = {}) {
  const root = path.resolve(cwd);
  const repoName = String(packageJson && packageJson.name || "").trim().toLowerCase();
  const resolved = resolveWorkspaceRoot(root);
  if (pluginJson || pluginId || resolved.kind === "plugin") return "plugin";
  if (repoName === "kabeeri-vdf" || repoName.includes("kabeeri") || fs.existsSync(path.join(root, "bin", "kvdf.js")) || fs.existsSync(path.join(root, "src", "cli", "index.js"))) {
    return "kvdf_core";
  }
  if (resolved.kind === "viber_app" || workspaceJson || projectJson || appSlug || repoName.includes("kvdos") || /kvdos/i.test(root)) return "viber_app";
  if (normalizeTrack(targetTrack) === "framework_owner") return "kvdf_core";
  return "unknown";
}

function buildWorkspacePaths(kind, { appSlug = null, pluginId = null } = {}) {
  if (kind === "plugin") {
    const id = String(pluginId || "plugin").trim();
    return {
      allowed_paths: [
        `plugins/${id}/`,
        `plugins/${id}/docs/`,
        `plugins/${id}/runtime/`,
        `plugins/${id}/tests/`,
        `plugins/${id}/schemas/`
      ],
      forbidden_paths: [
        "KVDOS/",
        ".kabeeri/",
        "workspaces/apps/",
        "plugins/*/runtime/",
        "plugins/*/plugin.json",
        "docs/reports/"
      ]
    };
  }

  if (kind === "viber_app") {
    const slug = String(appSlug || "app-draft").trim();
    return {
      allowed_paths: [
        `workspaces/apps/${slug}/`,
        `workspaces/apps/${slug}/docs/`,
        `workspaces/apps/${slug}/src/`,
        `workspaces/apps/${slug}/tests/`,
        `workspaces/apps/${slug}/.kabeeri/`
      ],
      forbidden_paths: [
        "src/cli/",
        "knowledge/governance/",
        "packs/",
        "schemas/",
        "docs/reports/",
        "KVDOS/"
      ]
    };
  }

  if (kind === "kvdf_core") {
    return {
      allowed_paths: [
        "src/cli/",
        "docs/",
        "knowledge/",
        "packs/",
        "schemas/",
        "tests/",
        "plugins/kvdf_dev/"
      ],
      forbidden_paths: [
        "KVDOS/",
        "workspaces/apps/",
        "plugins/*/runtime/",
        "plugins/*/plugin.json",
        "docs/site/pages/en/vibe-developer.html"
      ]
    };
  }

  return {
    allowed_paths: [],
    forbidden_paths: [
      "KVDOS/",
      "src/cli/",
      "workspaces/apps/",
      "plugins/",
      ".kabeeri/"
    ]
  };
}

function buildWorkspaceBoundaryReport(options = {}) {
  const cwd = path.resolve(options.cwd || repoRoot());
  const packageJson = readJsonFileIfExists(path.join(cwd, "package.json"));
  const workspaceJson = readJsonFileIfExists(path.join(cwd, ".kabeeri", "workspace.json"));
  const projectJson = readJsonFileIfExists(path.join(cwd, ".kabeeri", "project.json"));
  const pluginJson = readJsonFileIfExists(path.join(cwd, "plugin.json")) || readJsonFileIfExists(path.join(cwd, ".codex-plugin", "plugin.json"));
  const resolved = resolveWorkspaceRoot(cwd);
  const kind = detectWorkspaceKind({
    cwd,
    packageJson,
    workspaceJson,
    projectJson,
    pluginJson,
    targetTrack: options.targetTrack,
    appSlug: options.appSlug,
    pluginId: options.pluginId
  });
  const track = normalizeTrack(options.targetTrack || (kind === "kvdf_core" ? "framework_owner" : kind === "plugin" ? "plugin" : "vibe_app_developer"));
  const appSlug = String(options.appSlug || resolved.app_slug || workspaceJson && workspaceJson.app_slug || projectJson && projectJson.app_slug || (kind === "viber_app" ? path.basename(cwd) : "")).trim() || null;
  const pluginId = String(options.pluginId || resolved.plugin_id || pluginJson && pluginJson.plugin_id || "").trim() || null;
  const pathSet = buildWorkspacePaths(kind, { appSlug, pluginId });
  const targetWorkspace = kind === "kvdf_core"
    ? "kvdf_core"
    : kind === "viber_app"
      ? `workspaces/apps/${appSlug || "app-draft"}`
      : kind === "plugin"
        ? `plugins/${pluginId || "plugin"}`
        : "unknown";
  const status = kind === "unknown" ? "blocked" : "pass";
  const writePolicy = {
    can_write: kind !== "unknown",
    requires_owner_approval: kind !== "kvdf_core" ? true : false,
    reason: kind === "unknown"
      ? "Workspace identity is ambiguous."
      : kind === "kvdf_core"
        ? "KVDF Core workspace detected."
        : kind === "viber_app"
          ? "Viber app workspace detected."
          : "Plugin workspace detected."
  };
  return {
    report_type: "kvdf_workspace_boundary_report",
    generated_at: new Date().toISOString(),
    status,
    target_track: track,
    target_workspace: targetWorkspace,
    workspace: {
      kind,
      root: cwd,
      app_slug: appSlug,
      plugin_id: pluginId
    },
    repo: {
      root: cwd,
      name: packageJson && packageJson.name ? packageJson.name : path.basename(cwd)
    },
    allowed_paths: pathSet.allowed_paths,
    forbidden_paths: pathSet.forbidden_paths,
    source_of_truth: {
      primary: kind === "kvdf_core" ? "latest_main" : kind === "viber_app" ? "workspace_files" : kind === "plugin" ? "workspace_files" : "unknown",
      secondary: [
        kind === "kvdf_core" ? "merged_pr_history" : null,
        packageJson ? "package_json" : null,
        workspaceJson ? "workspace_json" : null,
        projectJson ? "project_json" : null,
        pluginJson ? "plugin_manifest" : null
      ].filter(Boolean),
      stale_candidates: []
    },
    stale_state: {
      roadmap_files: [],
      reports: [],
      runtime_items: [],
      status: kind === "unknown" ? "blocked" : "pass"
    },
    write_policy: {
      ...writePolicy
    },
    next_action: kind === "unknown"
      ? "Confirm the target repo, workspace, app, or plugin before planning or writing."
      : kind === "kvdf_core"
        ? "Write only to KVDF Core allowed paths."
        : kind === "viber_app"
          ? "Write only inside the app workspace boundary."
          : "Write only inside the selected plugin boundary."
  };
}

module.exports = {
  buildWorkspaceBoundaryReport,
  detectWorkspaceKind,
  buildWorkspacePaths,
  normalizeTrack,
  resolveWorkspaceRoot
};
