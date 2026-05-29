const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function listFiles(dirPath) {
  if (!dirExists(dirPath)) return [];
  return fs.readdirSync(dirPath);
}

function writeIfMissing(filePath, content) {
  if (fileExists(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, String(content || ""), "utf8");
  return true;
}

module.exports = {
  ensureDir,
  fileExists,
  dirExists,
  listFiles,
  writeIfMissing
};
