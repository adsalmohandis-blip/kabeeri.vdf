const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function isNonEmptyFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath) && isNonEmptyFile(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function writeFileIfEmpty(filePath, content) {
  if (isNonEmptyFile(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function dirIsEmpty(dirPath) {
  return !fs.existsSync(dirPath) || fs.readdirSync(dirPath).length === 0;
}

module.exports = { ensureDir, writeFileIfMissing, writeFileIfEmpty, dirIsEmpty, fileExists, isNonEmptyFile };
