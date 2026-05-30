const { uniqueStrings } = require("./registry_loader");

function buildEvidenceSummary(profile, outputs = {}) {
  const evidenceFiles = [
    ".kabeeri/category_evidence.json",
    ".kabeeri/source_inventory.yaml",
    ".kabeeri/source_map.yaml",
    ".kabeeri/questionnaire_profile.yaml",
    ".kabeeri/spec_profile.yaml",
    ".kabeeri/micro_doc_contract.yaml",
    ".kabeeri/roadmap_profile.yaml",
    ".kabeeri/roadmap_order.yaml",
    ".kabeeri/workspace_plan.yaml",
    ".kabeeri/approval_gates.json"
  ];
  return {
    app_id: profile.app_id || null,
    generated_at: new Date().toISOString(),
    evidence_files: evidenceFiles,
    evidence_sections: uniqueStrings(Object.keys(outputs)),
    summary: {
      source_count: outputs.source && outputs.source.sources ? outputs.source.sources.length : 0,
      question_count: outputs.questionnaire && outputs.questionnaire.questions ? outputs.questionnaire.questions.length : 0,
      required_doc_count: outputs.spec && outputs.spec.required_docs ? outputs.spec.required_docs.length : 0,
      roadmap_track_count: outputs.roadmap && outputs.roadmap.order ? outputs.roadmap.order.length : 0,
      workspace_folder_count: outputs.workspace && outputs.workspace.folders ? outputs.workspace.folders.length : 0
    }
  };
}

module.exports = { buildEvidenceSummary };
