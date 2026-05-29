const { dispatchPluginDevCommand } = require("./services/engine");

function pluginDev(action, value, flags = {}, rest = [], deps = {}) {
  return dispatchPluginDevCommand(action, value, flags, rest, deps);
}

module.exports = {
  pluginDev,
  dispatchPluginDevCommand
};
