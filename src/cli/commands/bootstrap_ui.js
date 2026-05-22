const { buildBootstrapAssetReport, buildBootstrapHtmlSnippet, getPluginStatus } = require("../../../plugins/bootstrap_ui/runtime");

function bootstrapUi(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const mode = normalizeBootstrapUiAction(action);

  if (!mode || mode === "status" || mode === "list") {
    const report = getPluginStatus();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "assets") {
    const report = buildBootstrapAssetReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderJsonLike(report));
    return;
  }

  if (mode === "snippet") {
    const report = buildBootstrapHtmlSnippet({
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
  if (value === "snippet") return "snippet";
  return value;
}

function renderJsonLike(report) {
  return JSON.stringify(report, null, 2);
}

module.exports = {
  bootstrapUi
};
