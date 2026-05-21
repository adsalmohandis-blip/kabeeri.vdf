const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { repoRoot } = require("../fs_utils");

function shouldUseLocalGitSnapshot() {
  const value = String(process.env.KVDF_DISABLE_GIT_SPAWN || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function readGitRepositoryState(cwd = repoRoot()) {
  const gitRoot = findGitWorktreeRoot(cwd);
  if (!gitRoot) {
    return {
      available: false,
      is_repo: false,
      root: null,
      current_branch: null
    };
  }
  return {
    available: true,
    is_repo: true,
    root: gitRoot.root,
    current_branch: gitRoot.current_branch
  };
}

function findGitWorktreeRoot(startDir = repoRoot()) {
  let current = path.resolve(startDir);
  while (true) {
    const gitDir = path.join(current, ".git");
    if (fs.existsSync(gitDir)) {
      return readGitMetadataFromGitDir(current, gitDir);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function readGitMetadataFromGitDir(root, gitDirPath) {
  try {
    let actualGitDir = gitDirPath;
    if (fs.statSync(gitDirPath).isFile()) {
      const contents = String(fs.readFileSync(gitDirPath, "utf8") || "").trim();
      const match = contents.match(/^gitdir:\s*(.+)$/i);
      if (match) {
        const linkedPath = match[1].trim();
        actualGitDir = path.isAbsolute(linkedPath) ? linkedPath : path.resolve(root, linkedPath);
      }
    }
    const headPath = path.join(actualGitDir, "HEAD");
    const head = fs.existsSync(headPath) ? String(fs.readFileSync(headPath, "utf8") || "").trim() : "";
    const branchMatch = head.match(/^ref:\s*refs\/heads\/(.+)$/i);
    const currentBranch = branchMatch ? branchMatch[1].trim() || null : null;
    return {
      root,
      current_branch: currentBranch
    };
  } catch {
    return {
      root,
      current_branch: null
    };
  }
}

function getGitChangedFiles(cwd = repoRoot()) {
  return getGitChangedFileDetails(cwd).map((item) => item.file);
}

function getGitChangedFileDetails(cwd = repoRoot()) {
  if (shouldUseLocalGitSnapshot()) {
    return listLocalGitChangedFileDetails(cwd);
  }
  const result = spawnSync("git", ["status", "--short"], { cwd, encoding: "utf8" });
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => {
      const raw = line.trim();
      if (!raw) return null;
      const status = raw.slice(0, 2).trim() || "changed";
      const file = raw.replace(/^..?\s+/, "").replace(/^.* -> /, "");
      if (!file || file.startsWith(".kabeeri/interactions/")) return null;
      return { file, status, raw };
    })
    .filter(Boolean)
    .filter((item) => item.file && !item.file.startsWith(".kabeeri/interactions/"));
}

function readGitStatus(cwd = repoRoot()) {
  const details = getGitChangedFileDetails(cwd);
  return {
    available: true,
    changed_files: details.length,
    entries: details.map((item) => item.raw || `?? ${item.file}`)
  };
}

function readGitHeadCommit(cwd = repoRoot()) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd, encoding: "utf8" });
  if (result.status !== 0 || result.error) return null;
  const value = String(result.stdout || "").trim();
  return value || null;
}

function readGitRecentCommits(cwd = repoRoot(), limit = 10) {
  const result = spawnSync("git", ["log", `-n${Math.max(1, limit)}`, "--oneline"], { cwd, encoding: "utf8" });
  if (result.status !== 0 || result.error) return [];
  return String(result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readGitLatestTags(cwd = repoRoot(), limit = 10) {
  const result = spawnSync("git", ["tag", "--sort=-creatordate"], { cwd, encoding: "utf8" });
  if (result.status !== 0 || result.error) return [];
  return String(result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((tag) => tag.length > 0)
    .slice(0, Math.max(1, limit));
}

function listLocalGitChangedFileDetails(cwd = repoRoot()) {
  const gitDir = path.join(cwd, ".git");
  if (!fs.existsSync(gitDir)) return [];
  const entries = [];
  walk(cwd, cwd);
  return entries;

  function walk(root, current) {
    if (!fs.existsSync(current)) return;
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (item.name === ".git" || item.name === "node_modules") continue;
      const full = path.join(current, item.name);
      const relative = path.relative(root, full).replace(/\\/g, "/");
      if (relative.startsWith(".kabeeri/interactions/")) continue;
      if (item.isDirectory()) walk(root, full);
      else if (item.isFile()) entries.push({ file: relative, status: "??", raw: `?? ${relative}` });
    }
  }
}

module.exports = {
  getGitChangedFiles,
  getGitChangedFileDetails,
  readGitHeadCommit,
  readGitLatestTags,
  readGitRecentCommits,
  listLocalGitChangedFileDetails,
  readGitStatus,
  readGitRepositoryState,
  shouldUseLocalGitSnapshot
};
