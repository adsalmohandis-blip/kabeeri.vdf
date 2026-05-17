const runtime = require("../runtime/company_profile");

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
