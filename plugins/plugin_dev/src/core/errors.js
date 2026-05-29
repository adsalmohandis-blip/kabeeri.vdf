function pluginDevError(message) {
  const error = new Error(message);
  error.code = "PLUGIN_DEV_ERROR";
  return error;
}

module.exports = {
  pluginDevError
};
