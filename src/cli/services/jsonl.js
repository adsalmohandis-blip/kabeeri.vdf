const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");

function readJsonLines(relativePath) {
  const file = path.join(repoRoot(), relativePath);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function appendJsonLine(relativePath, value) {
  const file = path.join(repoRoot(), relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, "utf8");
}

function writeJsonLines(relativePath, records) {
  const file = path.join(repoRoot(), relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${(records || []).map((row) => JSON.stringify(row)).join("\n")}${(records || []).length ? "\n" : ""}`, "utf8");
}

module.exports = {
  appendJsonLine,
  readJsonLines,
  writeJsonLines
};
