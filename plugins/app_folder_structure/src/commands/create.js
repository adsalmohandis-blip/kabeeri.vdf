const { createTargetStructure } = require("../services/target_path_service");

function runCreate(context, deps = {}) {
  const result = createTargetStructure(context, deps);
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.message);
  }
  return result;
}

module.exports = { createTargetStructure, runCreate };
