const command = require("./commands/company_profile");
const runtime = require("./runtime/company_profile");

module.exports = {
  plugin_id: "company-profile",
  name: "Company Profile Builder",
  command_entrypoint: "plugins/company-profile/bootstrap.js",
  runtime_entrypoint: "plugins/company-profile/runtime/company_profile.js",
  companyProfile: command.companyProfile,
  command: command.companyProfile,
  runtime,
  buildCompanyProfileStatusReport: runtime.buildStatusReport,
  buildCompanyProfileReport: runtime.buildReport,
  buildCompanyProfileQuestions: runtime.buildQuestions,
  buildCompanyProfileBrief: runtime.buildBrief,
  buildCompanyProfileDesign: runtime.buildDesign,
  buildCompanyProfileModules: runtime.buildModules,
  buildCompanyProfileTasks: runtime.buildTasks
};
