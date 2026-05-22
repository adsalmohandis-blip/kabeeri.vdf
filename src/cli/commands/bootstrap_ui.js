const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");
const { summarizeUiAssetProvider } = require("../services/ui_asset_provider");

function loadBootstrapRuntime() {
  const root = repoRoot();
  const localRuntime = path.join(root, "plugins", "bootstrap_ui", "runtime");
  const localRuntimeIndex = path.join(localRuntime, "index.js");
  if (fs.existsSync(localRuntimeIndex)) {
    return require(localRuntime);
  }
  return require("../../../plugins/bootstrap_ui/runtime");
}

function bootstrapUi(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const mode = normalizeBootstrapUiAction(action);
  const runtime = loadBootstrapRuntime();

  if (!mode || mode === "status" || mode === "list") {
    const report = runtime.getPluginStatus();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "assets") {
    const report = runtime.buildBootstrapAssetReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "verify") {
    const report = runtime.verifyBootstrapAssets();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "provider") {
    const report = {
      report_type: "bootstrap_ui_provider",
      plugin_id: "bootstrap_ui",
      ...summarizeUiAssetProvider({
        ui_provider: flags["ui-provider"],
        provider: flags.provider,
        withBootstrap: flags["with-bootstrap"],
        with_bootstrap: flags.with_bootstrap,
        noBootstrap: flags["no-bootstrap"],
        no_bootstrap: flags.no_bootstrap
      })
    };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "snippet") {
    const report = runtime.buildBootstrapHtmlSnippet({
      title: flags.title || value || rest.join(" ")
    });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.html);
    return;
  }

  throw new Error(`Unknown bootstrap-ui action: ${action}`);
}

function normalizeBootstrapUiAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "status") return "status";
  if (value === "list") return "status";
  if (value === "assets") return "assets";
  if (value === "verify") return "verify";
  if (value === "provider") return "provider";
  if (value === "snippet") return "snippet";
  return value;
}

function renderJsonLike(report) {
  return JSON.stringify(report, null, 2);
}

module.exports = {
  bootstrapUi
};
