const command = require("./commands/ecommerce_mobile_app");
const runtime = require("./runtime/ecommerce_mobile_app");

module.exports = {
  plugin_id: "ecommerce-mobile-app",
  name: "Ecommerce Mobile App Builder",
  command_entrypoint: "plugins/ecommerce-mobile-app/bootstrap.js",
  runtime_entrypoint: "plugins/ecommerce-mobile-app/runtime/ecommerce_mobile_app.js",
  ecommerceMobileApp: command.ecommerceMobileApp,
  command: command.ecommerceMobileApp,
  runtime,
  buildEcommerceMobileAppStatusReport: runtime.buildStatusReport,
  buildEcommerceMobileAppReport: runtime.buildReport,
  buildEcommerceMobileAppQuestions: runtime.buildQuestions,
  buildEcommerceMobileAppBrief: runtime.buildBrief,
  buildEcommerceMobileAppDesign: runtime.buildDesign,
  buildEcommerceMobileAppModules: runtime.buildModules,
  buildEcommerceMobileAppTasks: runtime.buildTasks
};
