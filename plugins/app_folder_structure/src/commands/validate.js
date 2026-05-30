const { validateTargetStructure } = require("../services/target_path_service");
const { buildValidationReport } = require("../services/validation_service");
const { writeStructureEvidence } = require("../services/evidence_service");

function runValidate(context, deps = {}) {
  const validation = validateTargetStructure(context, deps);
  const report = buildValidationReport(validation.workspace_root || validation.workspaceRoot || context.flags?.workspace, validation, {
    app_slug: validation.app_slug || validation.workspace_slug || context.flags?.app || context.value || "",
    category: validation.selected_category || context.flags?.category || "generic"
  });
  writeStructureEvidence(report.workspace_root, "validate", report);
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  if (!report.ok) process.exitCode = 1;
  return report;
}

module.exports = { runValidate, validateTargetStructure };
