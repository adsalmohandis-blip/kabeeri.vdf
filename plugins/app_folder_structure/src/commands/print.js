const { printCategoryProfile } = require("../services/target_path_service");

function runPrint(context, deps = {}) {
  const category = context.flags?.category || context.value || context.rest?.[0] || "generic";
  const report = printCategoryProfile(category, deps);
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  return report;
}

module.exports = { runPrint };
