const fs = require("fs");
const path = require("path");

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf8");
  if (!String(raw || "").trim()) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeJsonIfMissing(filePath, value) {
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf8");
    if (String(raw || "").trim()) return false;
  }
  writeJson(filePath, value);
  return true;
}

module.exports = { readJson, writeJson, writeJsonIfMissing };
