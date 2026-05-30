const fs = require("fs");
const path = require("path");
const { fileExists, readJsonFile } = require("../fs_utils");

function matchesWords(text, words) {
  return (words || []).some((word) => String(text || "").includes(String(word).toLowerCase()));
}

function detectLanguage(text) {
  const value = String(text || "");
  if (/[\u0600-\u06ff]/.test(value)) return "ar";
  if (/[ÙØ]/.test(value) && !/[A-Za-z]/.test(value)) return "ar";
  return "en";
}

function resolveOutputLanguage(flags = {}, text = "") {
  const requested = flags.lang || flags.language || flags["output-language"];
  if (requested && !["auto", "user", "same"].includes(String(requested).toLowerCase())) {
    return String(requested).toLowerCase();
  }
  const projectPath = ".kabeeri/project.json";
  const cwdProjectPath = path.resolve(process.cwd(), projectPath);
  const project = fs.existsSync(cwdProjectPath)
    ? JSON.parse(fs.readFileSync(cwdProjectPath, "utf8"))
    : (fileExists(projectPath) ? readJsonFile(projectPath) : {});
  const projectLanguage = String(project.language || "").toLowerCase();
  if (projectLanguage && !["both", "auto", "user"].includes(projectLanguage)) return projectLanguage;
  return detectLanguage(text);
}

module.exports = {
  detectLanguage,
  matchesWords,
  resolveOutputLanguage
};
