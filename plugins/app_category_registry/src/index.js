const { create } = require("./commands/create");
const { plan } = require("./commands/plan");
const { profile } = require("./commands/profile");
const { register } = require("./commands/register");
const { status } = require("./commands/status");
const { validate } = require("./commands/validate");
const { getPackageStructureReport } = require("./services/package_structure_service");
const { getStatusReport } = require("./services/status_service");
const { getWorkspaceTargetPlan } = require("./services/target_path_service");
const { buildProfile } = require("./services/profile_service");
const { validateRegistry } = require("./services/validation_service");
const { buildRoadmapOrder } = require("./services/roadmap_order_engine");
const { buildWorkspacePlan } = require("./services/workspace_planner");
const { resolveSpecProfile } = require("./services/spec_resolver");
const { buildEvidenceSummary } = require("./services/evidence_writer");
const { routeSourceIntake } = require("./services/source_intake_router");
const { buildQuestionnaireProfile } = require("./services/questionnaire_router");

function appCategoryRegistry(action, value, flags = {}, rest = [], deps = {}) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  let result;

  if (!normalizedAction || normalizedAction === "status") result = status(value, flags, rest, deps);
  else if (normalizedAction === "create") result = create(value, flags, rest, deps);
  else if (normalizedAction === "profile") result = profile(value, flags, rest, deps);
  else if (normalizedAction === "plan") result = plan(value, flags, rest, deps);
  else if (normalizedAction === "validate") result = validate(value, flags, rest, deps);
  else if (normalizedAction === "register") result = register();
  else throw new Error(`Unknown app-category action: ${action}`);

  if (flags && flags.json) {
    console.log(JSON.stringify(result, null, 2));
  }
  return result;
}

const appCategoryRegistryApi = {
  appCategoryRegistry,
  getPackageStructureReport,
  getStatusReport,
  getWorkspaceTargetPlan,
  buildProfile,
  validateRegistry,
  buildRoadmapOrder,
  buildWorkspacePlan,
  resolveSpecProfile,
  buildEvidenceSummary,
  routeSourceIntake,
  buildQuestionnaireProfile,
  create,
  plan,
  profile,
  status,
  validate,
  register
};

module.exports = { appCategoryRegistry, appCategoryRegistryApi, appCategoryRegistryCommand: appCategoryRegistry, registerAppCategoryRegistry: register };
