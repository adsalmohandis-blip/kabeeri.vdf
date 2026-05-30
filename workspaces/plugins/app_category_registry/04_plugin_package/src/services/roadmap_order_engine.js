const { loadRoadmapTemplates, uniqueStrings } = require("./registry_loader");

function getTemplateId(profile = {}) {
  const selected = uniqueStrings(profile.selected_category_ids || []);
  if (selected.includes("ecommerce_platform") || profile.governance_profile === "payment_commerce_app") return "ecommerce_platform";
  if (selected.includes("saas_platform") || profile.architecture_pattern === "multi_tenant_saas" || profile.governance_profile === "multi_tenant_saas") return "multi_tenant_saas";
  if (selected.includes("mobile_application")) return "mobile_application";
  if (selected.includes("desktop_application")) return "desktop_application";
  if (selected.includes("api_only_backend")) return "api_only_backend";
  if (selected.includes("cms_platform")) return "cms_platform";
  if (selected.includes("marketplace_platform")) return "marketplace_platform";
  if (selected.includes("crm_admin_system")) return "crm_admin_system";
  if (selected.includes("booking_scheduling_system")) return "booking_scheduling_system";
  if (selected.includes("ai_agent_automation_app")) return "ai_agent_automation_app";
  if (selected.includes("data_analytics_dashboard")) return "data_analytics_dashboard";
  return "generic_web_application";
}

function buildTrackObjects(order = []) {
  return order.map((trackId, index) => ({
    id: trackId,
    name: trackId.replace(/_/g, " "),
    order: index + 1,
    category_relevance: index === 0 ? "foundation" : "shared",
    depends_on: index === 0 ? [] : [order[index - 1]],
    can_run_parallel_with: index === 0 ? [] : order.slice(0, index - 1).slice(-1),
    blocks: index < order.length - 1 ? [order[index + 1]] : [],
    uses_outputs_from: index === 0 ? [] : [order[index - 1]],
    required_inputs: index === 0 ? ["profile"] : [order[index - 1]],
    required_outputs: [trackId],
    approval_gate: index >= 3,
    required_evidence: index >= 3,
    readiness_checks: ["inputs_ready", "dependencies_ready"],
    phases: [trackId]
  }));
}

function buildRoadmapOrder(profile = {}, specProfile = null) {
  const templates = loadRoadmapTemplates();
  const templateId = getTemplateId(profile);
  const template = templates[templateId] || templates.generic_web_application || { id: templateId, tracks: ["requirements", "uiux", "system_design", "testing", "deployment"] };
  const coreOrder = ["app_category_setup", "source_intake", "questionnaire", ...(Array.isArray(template.tracks) ? template.tracks : []), "evidence_readiness"];
  const order = uniqueStrings(coreOrder);
  return {
    app_id: profile.app_id || null,
    template_id: templateId,
    spec_profile_requires_database: Boolean(specProfile && specProfile.requires_database),
    order,
    tracks: buildTrackObjects(order),
    master_roadmap: {
      id: templateId,
      track_count: order.length,
      generated_from: template.source_name || null
    }
  };
}

module.exports = { buildRoadmapOrder };
