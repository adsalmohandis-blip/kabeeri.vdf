const command = require("./commands/blog");
const runtime = require("./runtime/blog");

module.exports = {
  plugin_id: "blog",
  name: "Blog Builder",
  command_entrypoint: "plugins/blog/bootstrap.js",
  runtime_entrypoint: "plugins/blog/runtime/blog.js",
  blog: command.blog,
  command: command.blog,
  runtime,
  buildBlogStatusReport: runtime.buildStatusReport,
  buildBlogReport: runtime.buildReport,
  buildBlogQuestions: runtime.buildQuestions,
  buildBlogBrief: runtime.buildBrief,
  buildBlogDesign: runtime.buildDesign,
  buildBlogModules: runtime.buildModules,
  buildBlogTasks: runtime.buildTasks
};
