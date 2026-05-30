const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { readGitRepositoryState } = require("./git_snapshot");
const { normalizeTrackAssignment } = require("./track_control");

function normalizeTrack(value) {
  return normalizeTrackAssignment(value) || "framework_owner";
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePath(value) {
  return path.resolve(String(value || ""));
}

function isInsidePath(childPath, parentPath) {
  const normalizedChild = normalizePath(childPath);
  const normalizedParent = normalizePath(parentPath);
  return normalizedChild === normalizedParent || normalizedChild.startsWith(`${normalizedParent}${path.sep}`);
}

function readPackageName(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return String(pkg && pkg.name || "").trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

function findKvdfRepoRoot(startDir = repoRoot()) {
  let current = path.resolve(startDir);
  while (true) {
    const packageName = readPackageName(path.join(current, "package.json"));
    if (packageName === "kabeeri-vdf") return current;
    if (
      fs.existsSync(path.join(current, "src", "cli", "index.js")) &&
      fs.existsSync(path.join(current, "docs", "cli", "CLI_COMMAND_REFERENCE.md"))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function resolveWorkspaceRootFromAppSlug({ cwd, kvdfRepoRoot, appSlug }) {
  const normalizedAppSlug = normalizeAppSlug(appSlug);
  if (!normalizedAppSlug) return null;
  const root = kvdfRepoRoot ? path.resolve(kvdfRepoRoot, "workspaces", "apps", normalizedAppSlug) : path.resolve(cwd, "workspaces", "apps", normalizedAppSlug);
  return fs.existsSync(root) ? root : null;
}

function findAppWorkspaceRootFromCwd(cwd, appSlug = "") {
  const normalizedAppSlug = normalizeAppSlug(appSlug);
  let current = path.resolve(cwd);
  while (true) {
    const parent = path.dirname(current);
    if (parent === current) break;
    const grandParent = path.dirname(parent);
    if (parent === "apps" && grandParent === "workspaces") {
      if (!normalizedAppSlug || path.basename(current).toLowerCase() === normalizedAppSlug) return current;
    }
    if (grandParent && path.basename(parent).toLowerCase() === "apps" && path.basename(grandParent).toLowerCase() === "workspaces") {
      if (!normalizedAppSlug || path.basename(current).toLowerCase() === normalizedAppSlug) return current;
    }
    current = parent;
  }
  return null;
}

function readGitRemoteUrlsFromGitRoot(gitRoot) {
  if (!gitRoot) return [];
  const actualGitDir = resolveActualGitDir(gitRoot);
  const configPath = path.join(actualGitDir, "config");
  if (!fs.existsSync(configPath)) return [];
  const text = String(fs.readFileSync(configPath, "utf8") || "");
  const urls = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*url\s*=\s*(.+)\s*$/i);
    if (match) urls.push(match[1].trim());
  }
  return [...new Set(urls.filter(Boolean))];
}

function resolveActualGitDir(root) {
  const gitDirPath = path.join(root, ".git");
  if (!fs.existsSync(gitDirPath)) return gitDirPath;
  try {
    if (fs.statSync(gitDirPath).isFile()) {
      const contents = String(fs.readFileSync(gitDirPath, "utf8") || "").trim();
      const match = contents.match(/^gitdir:\s*(.+)$/i);
      if (match) {
        const linkedPath = match[1].trim();
        return path.isAbsolute(linkedPath) ? linkedPath : path.resolve(root, linkedPath);
      }
    }
  } catch {
    return gitDirPath;
  }
  return gitDirPath;
}

function detectRemoteProvider(remoteUrl) {
  const normalized = String(remoteUrl || "").trim().toLowerCase();
  if (!normalized) return "none";
  if (normalized.includes("github.com")) return "github";
  if (normalized.includes("gitlab.com")) return "gitlab";
  if (normalized.includes("bitbucket.org")) return "bitbucket";
  return "custom";
}

function readWorkspaceLinkedRoots(appRoot) {
  if (!appRoot) return [];
  const candidates = [
    path.join(appRoot, ".kabeeri", "workspace.json"),
    path.join(appRoot, ".kabeeri", "project.json")
  ];
  const linkedRoots = [];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    try {
      const data = JSON.parse(fs.readFileSync(candidate, "utf8"));
      if (Array.isArray(data.linked_workspace_roots)) linkedRoots.push(...data.linked_workspace_roots);
    } catch {
      // Ignore malformed optional metadata.
    }
  }
  return [...new Set(linkedRoots.map((item) => String(item || "").trim()).filter(Boolean))];
}

function buildGitContext(options = {}) {
  const cwd = path.resolve(options.cwd || repoRoot());
  const track = normalizeTrack(options.track || "framework_owner");
  const appSlug = normalizeAppSlug(options.appSlug || options.app_slug || options.app || "");
  const kvdfRepoRoot = options.kvdfRepoRoot ? path.resolve(options.kvdfRepoRoot) : findKvdfRepoRoot(cwd);
  const gitRepository = options.gitRepository || readGitRepositoryState(cwd);
  const gitRoot = gitRepository && gitRepository.available && gitRepository.root ? path.resolve(gitRepository.root) : null;
  const currentBranch = gitRepository && gitRepository.current_branch ? String(gitRepository.current_branch || "").trim() || null : null;
  const appRoot = resolveWorkspaceRootFromAppSlug({ cwd, kvdfRepoRoot, appSlug })
    || findAppWorkspaceRootFromCwd(cwd, appSlug)
    || null;
  const workspaceLinkedRoots = readWorkspaceLinkedRoots(appRoot);
  const remoteUrls = readGitRemoteUrlsFromGitRoot(gitRoot);
  const remoteUrl = remoteUrls.length ? remoteUrls[0] : null;
  const remoteProvider = detectRemoteProvider(remoteUrl);
  const classification = classifyGitContext({
    cwd,
    track,
    kvdfRepoRoot,
    appRoot,
    gitRoot,
    workspaceLinkedRoots
  });
  const baseCapabilities = {
    push_allowed: false,
    branch_allowed: false,
    pr_allowed: false
  };
  if (classification === "kvdf_core_repo") {
    baseCapabilities.push_allowed = track === "framework_owner" && Boolean(gitRoot) && remoteProvider !== "none";
    baseCapabilities.branch_allowed = track === "framework_owner" && Boolean(gitRoot);
    baseCapabilities.pr_allowed = track === "framework_owner" && Boolean(gitRoot) && remoteProvider !== "none";
  } else if (classification === "standalone_app_repo" || classification === "linked_external_app_repo") {
    baseCapabilities.push_allowed = Boolean(gitRoot) && remoteProvider !== "none";
    baseCapabilities.branch_allowed = Boolean(gitRoot);
    baseCapabilities.pr_allowed = Boolean(gitRoot) && remoteProvider !== "none";
  }
  if (classification === "app_workspace_inside_kvdf_repo") {
    baseCapabilities.push_allowed = false;
    baseCapabilities.branch_allowed = false;
    baseCapabilities.pr_allowed = false;
  }
  if (classification === "no_git" || classification === "unknown") {
    baseCapabilities.push_allowed = false;
    baseCapabilities.branch_allowed = false;
    baseCapabilities.pr_allowed = false;
  }
  const reason = buildGitContextReason({ classification, track, kvdfRepoRoot, appRoot, gitRoot, remoteProvider });
  return {
    classification,
    track,
    cwd,
    kvdf_repo_root: kvdfRepoRoot,
    app_root: appRoot,
    git_root: gitRoot,
    current_branch: currentBranch,
    remote_provider: remoteProvider,
    remote_url: remoteUrl,
    push_allowed: baseCapabilities.push_allowed,
    branch_allowed: baseCapabilities.branch_allowed,
    pr_allowed: baseCapabilities.pr_allowed,
    reason,
    next_action: buildGitContextNextAction({ classification, track, remoteProvider })
  };
}

function classifyGitContext({ cwd, track, kvdfRepoRoot, appRoot, gitRoot, workspaceLinkedRoots = [] }) {
  if (!gitRoot) return "no_git";
  const normalizedTrack = normalizeTrack(track);
  const hasKvdfRepo = Boolean(kvdfRepoRoot);
  const appWorkspaceInsideKvdfRepo = Boolean(
    hasKvdfRepo &&
    appRoot &&
    isInsidePath(appRoot, path.join(kvdfRepoRoot, "workspaces", "apps")) &&
    normalizePath(gitRoot) === normalizePath(kvdfRepoRoot) &&
    appRoot !== kvdfRepoRoot
  );
  if (appWorkspaceInsideKvdfRepo && normalizedTrack === "vibe_app_developer") return "app_workspace_inside_kvdf_repo";
  if (appWorkspaceInsideKvdfRepo && normalizedTrack === "plugin") return "app_workspace_inside_kvdf_repo";
  if (hasKvdfRepo && isInsidePath(gitRoot, kvdfRepoRoot) && normalizedTrack === "framework_owner") return "kvdf_core_repo";
  if (appRoot && gitRoot === appRoot) {
    if (workspaceLinkedRoots.some((item) => normalizePath(item) === normalizePath(gitRoot))) {
      return "linked_external_app_repo";
    }
    if (hasKvdfRepo && !isInsidePath(appRoot, kvdfRepoRoot)) {
      return workspaceLinkedRoots.length > 0 ? "linked_external_app_repo" : "standalone_app_repo";
    }
    return "standalone_app_repo";
  }
  if (workspaceLinkedRoots.some((item) => normalizePath(item) === normalizePath(gitRoot))) return "linked_external_app_repo";
  if (!hasKvdfRepo) return "standalone_app_repo";
  return "unknown";
}

function buildGitContextReason({ classification, track, kvdfRepoRoot, appRoot, gitRoot, remoteProvider }) {
  if (classification === "app_workspace_inside_kvdf_repo") {
    return "Viber app workspace is inside the KVDF Core repository. Git operations would target KVDF Core, so push/branch/PR are blocked.";
  }
  if (classification === "kvdf_core_repo") {
    return "Git resolves to the KVDF Core repository and Owner track delivery can stay direct-to-main.";
  }
  if (classification === "standalone_app_repo") {
    return "The app workspace has its own Git repository, so branch/push/PR can be evaluated without affecting KVDF Core.";
  }
  if (classification === "linked_external_app_repo") {
    return "The app workspace is linked to an external repository, so Git delivery can be isolated from KVDF Core.";
  }
  if (classification === "no_git") {
    return "No Git repository was detected, so local-only delivery is the safe fallback.";
  }
  return "The Git context is ambiguous or unsafe for branch / PR delivery.";
}

function buildGitContextNextAction({ classification, track, remoteProvider }) {
  if (classification === "app_workspace_inside_kvdf_repo") {
    return "Use local-only mode or link the app to its own Git repository.";
  }
  if (classification === "no_git") {
    return "Use local-only planning or initialize a standalone app repository.";
  }
  if (classification === "standalone_app_repo" || classification === "linked_external_app_repo") {
    if (remoteProvider === "none") return "Branch and push are optional once a remote provider is configured.";
    return "Branch, push, and PR are available only when the selected source-control mode explicitly enables them.";
  }
  if (classification === "kvdf_core_repo") {
    return track === "framework_owner"
      ? "Use direct-to-main for KVDF Core Owner work."
      : "Keep Viber/App delivery local-only unless the app has its own repository."
      ;
  }
  return "Inspect the workspace boundary before using branch, push, or PR commands.";
}

function buildSourceControlContextReport(options = {}) {
  const gitContext = buildGitContext(options);
  return {
    report_type: "kvdf_source_control_context",
    git_context: gitContext,
    next_action: gitContext.next_action
  };
}

function summarizeGitContext(gitContext = {}) {
  const parts = [
    gitContext.classification || "unknown",
    gitContext.track || "framework_owner",
    gitContext.remote_provider && gitContext.remote_provider !== "none" ? `remote:${gitContext.remote_provider}` : null
  ].filter(Boolean);
  return parts.join(" / ");
}

module.exports = {
  buildGitContext,
  buildSourceControlContextReport,
  summarizeGitContext,
  normalizeTrack
};
