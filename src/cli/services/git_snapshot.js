const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { repoRoot } = require("../fs_utils");

function shouldUseLocalGitSnapshot() {
  const value = String(process.env.KVDF_DISABLE_GIT_SPAWN || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
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
  listLocalGitChangedFileDetails,
  readGitStatus,
  shouldUseLocalGitSnapshot
};
