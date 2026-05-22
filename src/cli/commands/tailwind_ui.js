const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");

function loadTailwindRuntime() {
  const runtimeIndex = path.join(repoRoot(), "plugins", "tailwind_ui", "runtime", "index.js");
  if (fs.existsSync(runtimeIndex)) return require(runtimeIndex);
  return require("../../../plugins/tailwind_ui/runtime");
}

function tailwindUi(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const runtime = loadTailwindRuntime();
  const mode = normalizeAction(action);

  if (!mode || mode === "status" || mode === "list") {
    const report = runtime.getPluginStatus();
    outputReport(report, flags);
    return;
  }

  if (mode === "snippet") {
    const report = runtime.buildTailwindHtmlSnippet({
      title: flags.title || value || rest.join(" ")
    });
    outputReport(report, flags);
    return;
  }

  if (mode === "utility-map" || mode === "utility_map") {
    const report = runtime.buildTailwindUtilityMap();
    outputReport(report, flags);
    return;
  }

  if (mode === "verify") {
    const report = runtime.verifyTailwindCoreDependencyRemoved();
    outputReport(report, flags);
    return;
  }

  throw new Error(`Unknown tailwind-ui action: ${action}`);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (!value) return "";
  if (value === "status" || value === "list") return "status";
  if (value === "snippet") return "snippet";
  if (value === "utility-map" || value === "utility_map" || value === "utilitymap") return "utility-map";
  if (value === "verify") return "verify";
  return value;
}

function outputReport(report, flags) {
  if (flags.json) console.log(JSON.stringify(report, null, 2));
  else if (report && typeof report.html === "string") console.log(report.html);
  else console.log(JSON.stringify(report, null, 2));
}

module.exports = {
  tailwindUi
};
