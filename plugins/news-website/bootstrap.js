const command = require("./commands/news_website");
const runtime = require("./runtime/news_website");

module.exports = {
  plugin_id: "news-website",
  name: "News Website Builder",
  command_entrypoint: "plugins/news-website/bootstrap.js",
  runtime_entrypoint: "plugins/news-website/runtime/news_website.js",
  newsWebsite: command.newsWebsite,
  command: command.newsWebsite,
  runtime,
  buildNewsWebsiteStatusReport: runtime.buildStatusReport,
  buildNewsWebsiteReport: runtime.buildReport,
  buildNewsWebsiteQuestions: runtime.buildQuestions,
  buildNewsWebsiteBrief: runtime.buildBrief,
  buildNewsWebsiteDesign: runtime.buildDesign,
  buildNewsWebsiteModules: runtime.buildModules,
  buildNewsWebsiteTasks: runtime.buildTasks
};
