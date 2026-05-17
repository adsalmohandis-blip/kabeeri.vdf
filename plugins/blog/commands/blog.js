const runtime = require("../runtime/blog");

function blog(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  blog,
  buildBlogStatusReport: runtime.buildStatusReport,
  buildBlogReport: runtime.buildReport,
  buildBlogQuestions: runtime.buildQuestions,
  buildBlogBrief: runtime.buildBrief,
  buildBlogDesign: runtime.buildDesign,
  buildBlogModules: runtime.buildModules,
  buildBlogTasks: runtime.buildTasks
};
