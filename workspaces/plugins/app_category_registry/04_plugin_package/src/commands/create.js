const { buildProfile } = require("../services/profile_service");
const { getWorkspaceTargetPlan } = require("../services/target_path_service");
const { normalizeSelectionInput } = require("../services/selection_parser");

function create(value, flags = {}, rest = []) {
  const selection = normalizeSelectionInput(value, flags, rest);
  const plan = buildProfile(selection);
  return {
    app_category_registry: true,
    selection,
    category_profile: plan.profile,
    compatibility: plan.compatibility,
    source: plan.source,
    questionnaire: plan.questionnaire,
    spec_profile: plan.spec,
    roadmap_profile: plan.roadmap,
    workspace_plan: plan.workspace,
    evidence: plan.evidence,
    target_workspace: getWorkspaceTargetPlan(selection.app_id || selection.app_name || selection.selected_category_ids && selection.selected_category_ids[0] || "app")
  };
}

module.exports = { create };
