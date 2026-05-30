const { validateRegistry } = require("../services/validation_service");
const { normalizeSelectionInput } = require("../services/selection_parser");

function validate(value, flags = {}, rest = []) {
  const selection = normalizeSelectionInput(value, flags, rest);
  const report = Object.keys(selection).length ? validateRegistry(selection) : validateRegistry();
  return report;
}

module.exports = { validate };
