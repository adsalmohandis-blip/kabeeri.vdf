const { fileExists, readJsonFile } = require("../fs_utils");

function matchesWords(text, words) {
  return (words || []).some((word) => String(text || "").includes(String(word).toLowerCase()));
}

function detectLanguage(text) {
  return /[\u0600-\u06ff]/.test(String(text || "")) ? "ar" : "en";
}

function resolveOutputLanguage(flags = {}, text = "") {
  const requested = flags.lang || flags.language || flags["output-language"];
  if (requested && !["auto", "user", "same"].includes(String(requested).toLowerCase())) {
    return String(requested).toLowerCase();
  }
  const projectPath = ".kabeeri/project.json";
  const project = fileExists(projectPath) ? readJsonFile(projectPath) : {};
  const projectLanguage = String(project.language || "").toLowerCase();
  if (projectLanguage && !["both", "auto", "user"].includes(projectLanguage)) return projectLanguage;
  return detectLanguage(text);
}

module.exports = {
  detectLanguage,
  matchesWords,
  resolveOutputLanguage
};
