const { buildCategoryProfile } = require("./category_profile_builder");
const { assessCompatibility } = require("./compatibility_engine");
const { routeSourceIntake } = require("./source_intake_router");
const { buildQuestionnaireProfile } = require("./questionnaire_router");
const { resolveSpecProfile } = require("./spec_resolver");
const { buildRoadmapOrder } = require("./roadmap_order_engine");
const { buildWorkspacePlan } = require("./workspace_planner");
const { buildEvidenceSummary } = require("./evidence_writer");

function buildProfile(selection) {
  const profile = buildCategoryProfile(selection);
  const compatibility = assessCompatibility(profile);
  const source = routeSourceIntake(selection && selection.sources ? selection.sources : [], profile);
  const questionnaire = buildQuestionnaireProfile(profile, source.sources);
  const spec = resolveSpecProfile(profile, questionnaire);
  const roadmap = buildRoadmapOrder(profile, spec);
  const workspace = buildWorkspacePlan(profile, spec, roadmap);
  const evidence = buildEvidenceSummary(profile, { source, questionnaire, spec, roadmap, workspace });
  return { profile, compatibility, source, questionnaire, spec, roadmap, workspace, evidence };
}

module.exports = { buildProfile };
