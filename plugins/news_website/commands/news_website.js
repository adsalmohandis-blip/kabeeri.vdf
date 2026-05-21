const runtime = require("../runtime/news_website");

function newsWebsite(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  newsWebsite,
  buildNewsWebsiteStatusReport: runtime.buildStatusReport,
  buildNewsWebsiteReport: runtime.buildReport,
  buildNewsWebsiteQuestions: runtime.buildQuestions,
  buildNewsWebsiteBrief: runtime.buildBrief,
  buildNewsWebsiteDesign: runtime.buildDesign,
  buildNewsWebsiteModules: runtime.buildModules,
  buildNewsWebsiteTasks: runtime.buildTasks
};
