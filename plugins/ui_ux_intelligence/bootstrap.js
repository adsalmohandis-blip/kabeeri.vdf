const runtime = require("./runtime/index");

module.exports = {
  plugin_id: "ui_ux_intelligence",
  name: "UI UX Intelligence",
  command_entrypoint: "plugins/ui_ux_intelligence/bootstrap.js",
  runtime_entrypoint: "plugins/ui_ux_intelligence/bootstrap.js",
  runtime_path: "plugins/ui_ux_intelligence/bootstrap.js",
  ...runtime
};
