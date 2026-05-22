const fs = require("fs");
const path = require("path");

const SOURCE_ROOT = path.resolve(__dirname, "../../..");

function loadGithubProviderRuntime() {
  const runtimeIndex = path.join(SOURCE_ROOT, "plugins", "github_provider", "runtime", "index.js");
  if (fs.existsSync(runtimeIndex)) return require(runtimeIndex);
  return null;
}

function buildUnavailableGithubProviderReport(action) {
  return {
    report_type: "github_provider_unavailable",
    plugin_id: "github_provider",
    status: "unavailable",
    available: false,
    enabled_by_default: false,
    core_dependency: false,
    canonical_provider: false,
    remote_provider: "github",
    provider: "github",
    requested_action: action || null,
    next_action: "Install or enable github_provider to use GitHub remote provider features."
  };
}

function githubProvider(action, value, flags = {}, rest = [], deps = {}) {
  const runtime = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadGithubProviderRuntime();
  if (!runtime || typeof runtime.runGithubProvider !== "function") {
    const report = buildUnavailableGithubProviderReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  const normalizedFlags = { ...flags };
  return runtime.runGithubProvider(action, value, normalizedFlags, rest, deps);
}

module.exports = {
  githubProvider,
  loadGithubProviderRuntime,
  buildUnavailableGithubProviderReport
};
