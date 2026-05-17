const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function booking(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "booking-builder");
  const bundle = loadPluginBootstrap("booking-builder", { allowSourceFallback: true });
  if (!bundle || typeof bundle.booking !== "function") {
    throw new Error("Booking Builder plugin is not installed. Run `kvdf plugins install booking-builder` first.");
  }
  return bundle.booking(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  booking
};
