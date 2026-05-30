const fs = require("fs");
const path = require("path");

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function writeFileIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

module.exports = { ensureDirSync, writeFileIfMissing };
