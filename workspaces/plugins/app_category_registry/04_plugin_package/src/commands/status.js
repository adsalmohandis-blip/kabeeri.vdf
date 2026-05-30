const { getStatusReport } = require("../services/status_service");

function status() {
  return getStatusReport();
}

module.exports = { status };
