const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog["ecommerce-mobile-app"]);

function ecommerceMobileApp(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  ecommerceMobileApp,
  buildEcommerceMobileAppStatusReport: runtime.buildStatusReport,
  buildEcommerceMobileAppReport: runtime.buildReport,
  buildEcommerceMobileAppQuestions: runtime.buildQuestions,
  buildEcommerceMobileAppBrief: runtime.buildBrief,
  buildEcommerceMobileAppDesign: runtime.buildDesign,
  buildEcommerceMobileAppModules: runtime.buildModules,
  buildEcommerceMobileAppTasks: runtime.buildTasks
};
