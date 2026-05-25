const { loadPluginBootstrap } = require("../services/plugin_mounts");

function loadKcloudDataSharingBundle() {
  return loadPluginBootstrap("kcloud_data_sharing", { allowSourceFallback: true });
}

function buildUnavailableKcloudDataSharingReport(action) {
  return {
    report_type: "kcloud_data_sharing_unavailable",
    plugin_id: "kcloud_data_sharing",
    plugin_name: "KCloud Data Sharing",
    status: "unavailable",
    available: false,
    enabled_by_default: true,
    execution_enabled: false,
    requested_action: action || null,
    next_action: "KCloud Data Sharing is not installed or enabled. Run `kvdf plugins install kcloud_data_sharing` first."
  };
}

function kcloudDataSharing(action, value, flags = {}, rest = [], deps = {}) {
  const bundle = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadKcloudDataSharingBundle();
  if (!bundle || typeof bundle.kcloudDataSharing !== "function") {
    const report = buildUnavailableKcloudDataSharingReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  const report = bundle.kcloudDataSharing(action, value, flags, rest, deps);
  if (report && typeof report === "object") {
    const render = bundle.renderKcloudDataSharingReport || bundle.renderKcloudReport;
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else if (typeof render === "function") console.log(render(report));
    else console.log(JSON.stringify(report, null, 2));
  }
  return report;
}

module.exports = {
  kcloudDataSharing,
  loadKcloudDataSharingBundle,
  buildUnavailableKcloudDataSharingReport
};
