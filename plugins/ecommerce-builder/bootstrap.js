const command = require("./commands/ecommerce");
const runtime = require("./runtime/ecommerce");

module.exports = {
  plugin_id: "ecommerce-builder",
  name: "Ecommerce Builder",
  command_entrypoint: "plugins/ecommerce-builder/bootstrap.js",
  runtime_entrypoint: "plugins/ecommerce-builder/runtime/ecommerce.js",
  ecommerce: command.ecommerce,
  command,
  runtime
};
