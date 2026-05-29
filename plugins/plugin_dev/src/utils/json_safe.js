const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonFile(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeTextFile(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, String(value || ""), "utf8");
}

function readTextFile(filePath, fallback = "") {
  if (!fs.existsSync(filePath)) return fallback;
  return fs.readFileSync(filePath, "utf8");
}

module.exports = {
  ensureDir,
  readJsonFile,
  writeJsonFile,
  writeTextFile,
  readTextFile
};
