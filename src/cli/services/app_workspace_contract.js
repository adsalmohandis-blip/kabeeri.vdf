const fs = require("fs");
const path = require("path");

const { repoRoot, readJsonFile } = require("../fs_utils");

const APP_WORKSPACE_REQUIRED_ROOTS = ["src", "tests", "docs", ".kabeeri"];
const APP_WORKSPACE_REQUIRED_FILES = [
  "package.json",
  "README.md",
  ".kabeeri/project.json",
  ".kabeeri/workspace.json",
  ".kabeeri/session.json",
  ".kabeeri/session_track.json",
  ".kabeeri/tasks.json",
  ".kabeeri/task_trash.json",
  ".kabeeri/scorecards.json"
];

function normalizeSurfaceScopes(value, appType = "application") {
  const scopes = normalizeList(value);
  if (scopes.length > 0) return scopes;
  const normalizedType = String(appType || "application").trim().toLowerCase();
  if (normalizedType === "frontend") return ["website"];
  if (normalizedType === "admin_frontend") return ["admin"];
  if (normalizedType === "mobile") return ["mobile"];
  return ["shared"];
}

function normalizeBoundaryRoots(value) {
  return normalizeList(value).map((item) => normalizeBoundaryPath(item)).filter(Boolean);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value);
  }
  if (typeof value === "string") {
    return uniqueStrings(value.split(/[,\s]+/));
  }
  return [];
}

function uniqueStrings(values = []) {
  return [...new Set(values.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))];
}

function normalizeBoundaryPath(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function resolveWorkspaceRoot(workspaceRootOrSlug) {
  const text = String(workspaceRootOrSlug || "").trim();
  if (!text) return null;
  if (path.isAbsolute(text)) return path.resolve(text);
  if (text.includes(path.sep) || text.includes("/")) return path.resolve(repoRoot(), text);
  return path.resolve(repoRoot(), "workspaces", "apps", text);
}

function readWorkspaceJson(workspaceRoot) {
  const target = path.join(workspaceRoot, ".kabeeri", "workspace.json");
  if (!fs.existsSync(target)) return null;
  return readJsonFile(path.relative(repoRoot(), target));
}

function readProjectJson(workspaceRoot) {
  const target = path.join(workspaceRoot, ".kabeeri", "project.json");
  if (!fs.existsSync(target)) return null;
  return readJsonFile(path.relative(repoRoot(), target));
}

function classifyWorkspaceBoundaryPath(targetPath, workspaceRootOrSlug, options = {}) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug);
  const rootRelative = workspaceRoot ? path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/") : null;
  const normalizedTarget = normalizeBoundaryPath(targetPath);
  const normalizedWorkspaceRoot = normalizeBoundaryPath(rootRelative);
  const absoluteWorkspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : null;
  const normalizedAbsoluteWorkspaceRoot = normalizeBoundaryPath(absoluteWorkspaceRoot);
  const absoluteTarget = resolveBoundaryTargetAbsolute(normalizedTarget, workspaceRoot, rootRelative);
  const normalizedAbsoluteTarget = normalizeBoundaryPath(absoluteTarget);
  const linkedRoots = (options.linked_workspace_roots || options.linked_paths || [])
    .map((item) => resolveBoundaryRootAbsolute(item, workspaceRoot, rootRelative))
    .filter(Boolean);

  function withinRoot(root) {
    if (!root) return false;
    const normalizedRoot = normalizeBoundaryPath(root);
    return normalizedAbsoluteTarget === normalizedRoot
      || normalizedAbsoluteTarget.startsWith(`${normalizedRoot}/`);
  }

  for (const root of linkedRoots) {
    if (withinRoot(root)) {
      return {
        status: "linked",
        path: normalizedTarget || normalizedAbsoluteTarget,
        workspace_root: normalizedWorkspaceRoot || normalizedAbsoluteWorkspaceRoot,
        linked_root: root,
        reason: "path is inside an explicitly linked workspace boundary"
      };
    }
  }

  if (absoluteWorkspaceRoot && withinRoot(absoluteWorkspaceRoot)) {
    return {
      status: "allowed",
      path: normalizedTarget || normalizedAbsoluteTarget,
      workspace_root: normalizedWorkspaceRoot || normalizedAbsoluteWorkspaceRoot,
      reason: "path is inside the active workspace boundary"
    };
  }

  return {
    status: "blocked",
    path: normalizedTarget || normalizedAbsoluteTarget,
    workspace_root: normalizedWorkspaceRoot || normalizedAbsoluteWorkspaceRoot,
    reason: "path is outside the active workspace boundary"
  };
}

function resolveBoundaryTargetAbsolute(targetPath, workspaceRoot, rootRelative) {
  if (path.isAbsolute(targetPath)) return path.resolve(targetPath);
  const normalized = normalizeBoundaryPath(targetPath);
  const workspaceRootRelative = normalizeBoundaryPath(rootRelative);
  const repoLikePrefixes = [workspaceRootRelative, "workspaces/"].filter(Boolean);
  if (repoLikePrefixes.some((prefix) => prefix && (normalized === prefix || normalized.startsWith(`${prefix}/`)))) {
    return path.resolve(repoRoot(), normalized);
  }
  return path.resolve(workspaceRoot || repoRoot(), normalized);
}

function resolveBoundaryRootAbsolute(value, workspaceRoot, rootRelative) {
  const normalized = normalizeBoundaryPath(value);
  if (!normalized) return null;
  if (path.isAbsolute(normalized)) return path.resolve(normalized);
  const workspaceRootRelative = normalizeBoundaryPath(rootRelative);
  if (workspaceRootRelative && (normalized === workspaceRootRelative || normalized.startsWith(`${workspaceRootRelative}/`))) {
    return path.resolve(repoRoot(), normalized);
  }
  if (normalized.startsWith("workspaces/") || normalized.startsWith(".kabeeri/") || normalized.startsWith("plugins/") || normalized.startsWith("docs/")) {
    return path.resolve(repoRoot(), normalized);
  }
  return path.resolve(repoRoot(), normalized);
}

function summarizeWorkspaceBoundary(paths, workspaceRootOrSlug, options = {}) {
  const items = normalizeList(paths);
  const classifications = items.map((item) => classifyWorkspaceBoundaryPath(item, workspaceRootOrSlug, options));
  return {
    report_type: "workspace_boundary_classification",
    workspace_root: resolveWorkspaceRoot(workspaceRootOrSlug)
      ? path.relative(repoRoot(), resolveWorkspaceRoot(workspaceRootOrSlug)).replace(/\\/g, "/")
      : null,
    linked_workspace_roots: normalizeBoundaryRoots(options.linked_workspace_roots || options.linked_paths),
    counts: {
      allowed: classifications.filter((item) => item.status === "allowed").length,
      linked: classifications.filter((item) => item.status === "linked").length,
      blocked: classifications.filter((item) => item.status === "blocked").length
    },
    items: classifications
  };
}

function validateDeveloperAppWorkspace(workspaceRootOrSlug, options = {}) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug);
  const requiredRootFolders = options.required_root_folders || APP_WORKSPACE_REQUIRED_ROOTS;
  const requiredFiles = options.required_files || APP_WORKSPACE_REQUIRED_FILES;
  const linkedWorkspaceRoots = normalizeBoundaryRoots(options.linked_workspace_roots || options.linked_paths);
  const report = {
    report_type: "developer_app_workspace_validation",
    workspace_root: workspaceRoot ? path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/") : null,
    workspace_slug: workspaceRoot ? path.basename(workspaceRoot) : null,
    workspace_kind: null,
    app_type: null,
    surface_scopes: [],
    linked_workspace_roots: linkedWorkspaceRoots,
    required_root_folders: requiredRootFolders,
    required_files: requiredFiles,
    present_paths: [],
    missing_paths: [],
    checks: [],
    ok: true,
    next_exact_action: workspaceRoot ? `kvdf app workspace show ${path.basename(workspaceRoot)}` : "kvdf app workspace list"
  };

  function addCheck(id, passed, message, evidence = "") {
    report.checks.push({ id, passed, message, evidence });
    if (!passed) report.ok = false;
  }

  if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
    report.ok = false;
    report.missing_paths.push(workspaceRoot ? path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/") : "workspaces/apps/<slug>");
    addCheck("workspace_root", false, "App workspace root is missing.");
    return report;
  }

  for (const rootFolder of requiredRootFolders) {
    const target = path.join(workspaceRoot, rootFolder);
    const relative = path.relative(repoRoot(), target).replace(/\\/g, "/");
    if (fs.existsSync(target)) {
      report.present_paths.push(relative);
      addCheck(`root:${rootFolder}`, true, `${rootFolder} present.`, relative);
    } else {
      report.missing_paths.push(relative);
      addCheck(`root:${rootFolder}`, false, `${rootFolder} missing.`, relative);
    }
  }

  for (const relativeFile of requiredFiles) {
    const target = path.join(workspaceRoot, relativeFile);
    const relative = path.relative(repoRoot(), target).replace(/\\/g, "/");
    if (fs.existsSync(target)) {
      report.present_paths.push(relative);
      addCheck(`file:${relativeFile}`, true, `${relativeFile} present.`, relative);
    } else {
      report.missing_paths.push(relative);
      addCheck(`file:${relativeFile}`, false, `${relativeFile} missing.`, relative);
    }
  }

  const workspace = readWorkspaceJson(workspaceRoot);
  const project = readProjectJson(workspaceRoot);
  if (workspace) {
    report.workspace_kind = workspace.workspace_kind || null;
    report.app_type = workspace.app_type || null;
    report.surface_scopes = normalizeSurfaceScopes(workspace.surface_scopes, workspace.app_type || "application");
    addCheck("workspace_kind", workspace.workspace_kind === "developer_app", `workspace_kind is ${workspace.workspace_kind || "unset"}.`, ".kabeeri/workspace.json");
    addCheck("workspace_root", normalizePath(workspace.root) === normalizePath(path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/")), "workspace root matches the scaffold root.", ".kabeeri/workspace.json");
    addCheck("workspace_slug", String(workspace.app_slug || "").trim() === path.basename(workspaceRoot), "workspace slug matches the scaffold root.", ".kabeeri/workspace.json");
    addCheck("workspace_surface_scopes", normalizeSurfaceScopes(workspace.surface_scopes, workspace.app_type || "application").length > 0, "workspace surface scopes are defined.", ".kabeeri/workspace.json");
  } else {
    report.ok = false;
    addCheck("workspace_json", false, ".kabeeri/workspace.json is missing.");
  }

  if (project) {
    addCheck("project_kind", project.workspace_kind === "developer_app", `project workspace_kind is ${project.workspace_kind || "unset"}.`, ".kabeeri/project.json");
    addCheck("project_slug", String(project.app_slug || "").trim() === path.basename(workspaceRoot), "project slug matches the scaffold root.", ".kabeeri/project.json");
    addCheck("project_root", normalizePath(project.root) === normalizePath(path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/")), "project root matches the scaffold root.", ".kabeeri/project.json");
  } else {
    report.ok = false;
    addCheck("project_json", false, ".kabeeri/project.json is missing.");
  }

  const workspaceLinkedRoots = normalizeBoundaryRoots(workspace && workspace.linked_workspace_roots);
  const projectLinkedRoots = normalizeBoundaryRoots(project && project.linked_workspace_roots);
  const effectiveLinkedRoots = linkedWorkspaceRoots.length > 0
    ? linkedWorkspaceRoots
    : workspaceLinkedRoots.length > 0
      ? workspaceLinkedRoots
      : projectLinkedRoots;
  report.linked_workspace_roots = effectiveLinkedRoots;
  report.boundary = summarizeWorkspaceBoundary(
    [...requiredRootFolders, ...requiredFiles, ...effectiveLinkedRoots],
    workspaceRoot,
    { linked_workspace_roots: effectiveLinkedRoots }
  );
  addCheck(
    "boundary_classifier",
    report.boundary.counts.blocked === 0,
    report.boundary.counts.blocked === 0 ? "workspace boundary items classify cleanly." : "workspace boundary classifier found blocked paths.",
    ".kabeeri/workspace.json"
  );

  const sessionTrackPath = path.join(workspaceRoot, ".kabeeri", "session_track.json");
  if (fs.existsSync(sessionTrackPath)) {
    const sessionTrack = readJsonFile(path.relative(repoRoot(), sessionTrackPath));
    const activeTrack = String(sessionTrack.active_track || "").trim();
    const roleGate = String(sessionTrack.role_gate || "").trim();
    addCheck("session_track_version", sessionTrack.version === "v1", `session track version is ${sessionTrack.version || "unset"}.`, ".kabeeri/session_track.json");
    addCheck("session_track_surface", activeTrack === "vibe_app_developer", `session track surface is ${activeTrack || "unset"}.`, ".kabeeri/session_track.json");
    addCheck("session_track_role_gate", roleGate === "app_workspace", `session track role gate is ${roleGate || "unset"}.`, ".kabeeri/session_track.json");
  } else {
    report.ok = false;
    addCheck("session_track_json", false, ".kabeeri/session_track.json is missing.");
  }

  if (project && report.surface_scopes.length === 0) {
    report.surface_scopes = normalizeSurfaceScopes(project.surface_scopes, project.app_type || "application");
  }

  report.required_root_folders_present = requiredRootFolders.filter((item) => fs.existsSync(path.join(workspaceRoot, item))).length;
  report.required_files_present = requiredFiles.filter((item) => fs.existsSync(path.join(workspaceRoot, item))).length;
  report.missing_count = report.missing_paths.length;
  report.status = report.ok ? "compliant" : "needs_attention";
  return report;
}

function normalizePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function summarizeWorkspaceContract(report) {
  return {
    workspace_root: report.workspace_root,
    workspace_slug: report.workspace_slug,
    app_type: report.app_type,
    surface_scopes: report.surface_scopes,
    linked_workspace_roots: report.linked_workspace_roots,
    boundary: report.boundary,
    boundary_status: report.boundary
      ? report.boundary.counts.blocked > 0
        ? "blocked"
        : report.boundary.counts.linked > 0
          ? "linked"
          : "allowed"
      : "unknown",
    status: report.status,
    missing_count: report.missing_count,
    next_exact_action: report.next_exact_action
  };
}

module.exports = {
  APP_WORKSPACE_REQUIRED_FILES,
  APP_WORKSPACE_REQUIRED_ROOTS,
  classifyWorkspaceBoundaryPath,
  normalizeBoundaryRoots,
  normalizeSurfaceScopes,
  resolveWorkspaceRoot,
  summarizeWorkspaceBoundary,
  validateDeveloperAppWorkspace,
  summarizeWorkspaceContract
};
