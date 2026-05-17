const command = require("./commands/crm");
const runtime = require("./runtime/crm");

module.exports = {
  plugin_id: "crm",
  name: "CRM Builder",
  command_entrypoint: "plugins/crm/bootstrap.js",
  runtime_entrypoint: "plugins/crm/runtime/crm.js",
  crm: command.crm,
  command,
  runtime
};
