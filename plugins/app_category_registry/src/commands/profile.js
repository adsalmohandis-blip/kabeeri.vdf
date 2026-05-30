const { buildProfile } = require("../services/profile_service");
const { normalizeSelectionInput } = require("../services/selection_parser");

function profile(value, flags = {}, rest = []) {
  const selection = normalizeSelectionInput(value, flags, rest);
  return buildProfile(selection);
}

module.exports = { profile };
