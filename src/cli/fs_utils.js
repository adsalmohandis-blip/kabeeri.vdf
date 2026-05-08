const fs = require("fs");
const path = require("path");

function repoRoot() {
  return process.cwd();
}

function packageRoot() {
  return path.resolve(__dirname, "../..");
}

function resolveRepo(relativePath = "") {
  return path.join(repoRoot(), relativePath);
}

function resolveAsset(relativePath = "") {
  const local = resolveRepo(relativePath);
  if (fs.existsSync(local)) return local;
  return path.join(packageRoot(), relativePath);
}

function fileExists(relativePath) {
  return fs.existsSync(resolveRepo(relativePath)) || fs.existsSync(path.join(packageRoot(), relativePath));
}

function readTextFile(relativePath) {
  return fs.readFileSync(resolveAsset(relativePath), "utf8");
}

function writeTextFile(relativePath, content) {
  const fullPath = resolveRepo(relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function readJsonFile(relativePath) {
  return JSON.parse(readTextFile(relativePath));
}

function writeJsonFile(relativePath, data) {
  writeTextFile(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function listDirectories(relativePath) {
  const fullPath = resolveAsset(relativePath);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listFiles(relativePath, extension, recursive = false) {
  const root = resolveAsset(relativePath);
  if (!fs.existsSync(root)) return [];
  const output = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory() && recursive) {
        walk(fullPath);
      } else if (entry.isFile() && (!extension || entry.name.endsWith(extension))) {
        const base = fullPath.startsWith(repoRoot()) ? repoRoot() : packageRoot();
        output.push(path.relative(base, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  walk(root);
  return output.sort();
}

function assertSafeName(value) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
    throw new Error(`Unsafe name: ${value}`);
  }
}

module.exports = {
  repoRoot,
  packageRoot,
  resolveRepo,
  resolveAsset,
  fileExists,
  readTextFile,
  writeTextFile,
  readJsonFile,
  writeJsonFile,
  listDirectories,
  listFiles,
  assertSafeName
};
