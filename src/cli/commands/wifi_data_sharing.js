const { getPluginRuntimeStatus } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function loadWifiDataSharingBundle() {
  const plugin = getPluginRuntimeStatus("wifi_data_sharing");
  if (!plugin || !plugin.available || !plugin.enabled) {
    return null;
  }
  return loadPluginBootstrap("wifi_data_sharing", { allowSourceFallback: true });
}

function buildUnavailableWifiDataSharingReport(action) {
  return {
    report_type: "wifi_data_sharing_unavailable",
    plugin_id: "wifi_data_sharing",
    plugin_name: "Wi-Fi Data Sharing",
    status: "unavailable",
    available: false,
    enabled_by_default: true,
    execution_enabled: false,
    requested_action: action || null,
    next_action: "Wi-Fi Data Sharing plugin is not installed or enabled. Run `kvdf plugins install wifi_data_sharing` first."
  };
}

function wifiDataSharing(action, value, flags = {}, rest = [], deps = {}) {
  const bundle = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadWifiDataSharingBundle();
  if (!bundle || typeof bundle.wifiDataSharing !== "function") {
    const report = buildUnavailableWifiDataSharingReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  return bundle.wifiDataSharing(action, value, flags, rest, deps);
}

module.exports = {
  wifiDataSharing,
  loadWifiDataSharingBundle,
  buildUnavailableWifiDataSharingReport
};
