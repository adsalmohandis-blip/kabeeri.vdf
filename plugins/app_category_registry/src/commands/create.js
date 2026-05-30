const { buildProfile } = require("../services/profile_service");
const { getWorkspaceTargetPlan } = require("../services/target_path_service");
const { normalizeSelectionInput } = require("../services/selection_parser");
const {
  buildAppPipelineContract,
  writeAppPipelineContract
} = require("../../../../src/cli/services/app_pipeline_contract");

function create(value, flags = {}, rest = []) {
  const selection = normalizeSelectionInput(value, flags, rest);
  const plan = buildProfile(selection);
  const pipelineContract = buildAppPipelineContract({
    selection,
    profile: plan.profile,
    compatibility: plan.compatibility,
    source: plan.source,
    questionnaire: plan.questionnaire,
    spec: plan.spec,
    roadmap: plan.roadmap,
    workspace: plan.workspace,
    evidence: plan.evidence
  });
  const pipelineContractPath = writeAppPipelineContract(process.cwd(), pipelineContract);
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
    target_workspace: getWorkspaceTargetPlan(selection.app_id || selection.app_name || selection.selected_category_ids && selection.selected_category_ids[0] || "app"),
    pipeline_contract: pipelineContract,
    pipeline_contract_path: pipelineContractPath
  };
}

module.exports = { create };
