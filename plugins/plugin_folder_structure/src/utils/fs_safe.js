const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function dirIsEmpty(dirPath) {
  if (!fs.existsSync(dirPath)) return true;
  return fs.readdirSync(dirPath).length === 0;
}

module.exports = {
  ensureDir,
  writeFileIfMissing,
  dirIsEmpty
};
