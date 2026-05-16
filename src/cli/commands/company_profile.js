const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog["company-profile"]);

function companyProfile(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  companyProfile,
  buildCompanyProfileStatusReport: runtime.buildStatusReport,
  buildCompanyProfileReport: runtime.buildReport,
  buildCompanyProfileQuestions: runtime.buildQuestions,
  buildCompanyProfileBrief: runtime.buildBrief,
  buildCompanyProfileDesign: runtime.buildDesign,
  buildCompanyProfileModules: runtime.buildModules,
  buildCompanyProfileTasks: runtime.buildTasks
};
