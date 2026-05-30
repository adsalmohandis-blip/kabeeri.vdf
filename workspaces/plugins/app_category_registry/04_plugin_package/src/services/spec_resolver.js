const { findCategoryById, loadCategoryFiles, uniqueStrings } = require("./registry_loader");

function hasCategory(profile, categoryId) {
  return uniqueStrings(profile.selected_category_ids || []).includes(categoryId)
    || String(profile.delivery_category || "") === categoryId
    || String(profile.domain_category || "") === categoryId
    || String(profile.architecture_pattern || "") === categoryId
    || String(profile.governance_profile || "") === categoryId
    || String(profile.industry_category || "") === categoryId;
}

function docsForProfile(profile) {
  const docs = ["requirements", "uiux", "system_design", "testing", "deployment", "evidence"];
  if (hasCategory(profile, "api_only_backend") || hasCategory(profile, "web_application") || hasCategory(profile, "ecommerce_platform") || hasCategory(profile, "saas_platform") || hasCategory(profile, "crm_admin_system")) {
    docs.push("api");
  }
  if (hasCategory(profile, "ecommerce_platform") || hasCategory(profile, "saas_platform") || hasCategory(profile, "marketplace_platform") || hasCategory(profile, "crm_admin_system") || hasCategory(profile, "booking_scheduling_system") || hasCategory(profile, "data_analytics_dashboard")) {
    docs.push("database");
  }
  if (hasCategory(profile, "ecommerce_platform") || hasCategory(profile, "marketplace_platform") || hasCategory(profile, "saas_platform") || hasCategory(profile, "ai_agent_automation_app")) {
    docs.push("security");
  }
  return uniqueStrings(docs);
}

function docsByCategory(profile) {
  const categoryIds = uniqueStrings(profile.selected_category_ids || []);
  const docs = [];
  if (categoryIds.includes("ecommerce_platform") || profile.governance_profile === "payment_commerce_app") {
    docs.push("product_catalog", "cart", "checkout", "payments", "orders", "inventory", "admin");
  }
  if (categoryIds.includes("saas_platform") || profile.architecture_pattern === "multi_tenant_saas" || profile.governance_profile === "multi_tenant_saas") {
    docs.push("tenant_model", "billing", "subscription", "onboarding");
  }
  if (categoryIds.includes("ai_agent_automation_app") || profile.architecture_pattern === "ai_agent_architecture") {
    docs.push("tool_governance", "memory_context", "safety_guardrails", "audit_log");
  }
  if (categoryIds.includes("mobile_application")) {
    docs.push("device_permissions", "offline_states", "push_notifications", "platform_support");
  }
  if (categoryIds.includes("data_analytics_dashboard")) {
    docs.push("metrics_catalog", "charting", "datasource", "refresh_strategy");
  }
  return uniqueStrings(docs);
}

function buildDocContracts(docNames = []) {
  return uniqueStrings(docNames).map((docName) => ({
    id: docName,
    name: docName,
    track: "app_category_registry",
    required_inputs: ["profile", "questionnaire", "source_map"],
    required_sections: ["overview", "requirements", "dependencies", "acceptance", "evidence"],
    source_requirements: ["confirmed", "inferred"],
    output_format: "markdown",
    approval_required: true,
    evidence_required: true,
    readiness_checks: ["inputs_loaded", "profile_valid", "source_coverage"]
  }));
}

function resolveSpecProfile(profile = {}, questionnaireProfile = null) {
  const categories = loadCategoryFiles();
  const selectedCategories = uniqueStrings(profile.selected_category_ids || []).map((categoryId) => findCategoryById(categories, categoryId)).filter(Boolean);
  const required_uiux_specs = uniqueStrings(selectedCategories.flatMap((category) => category.required_uiux_specs || []));
  const required_system_design_specs = uniqueStrings(selectedCategories.flatMap((category) => category.required_system_design_specs || []));
  const required_database_specs = uniqueStrings(selectedCategories.flatMap((category) => category.required_database_specs || []));
  const required_questionnaire_packs = uniqueStrings(selectedCategories.flatMap((category) => category.required_questionnaire_packs || []));
  const required_roadmap_tracks = uniqueStrings(selectedCategories.flatMap((category) => category.required_roadmap_tracks || []));
  const required_docs = docsForProfile(profile);
  const category_docs = docsByCategory(profile);

  return {
    app_id: profile.app_id || null,
    selected_category_ids: profile.selected_category_ids || [],
    required_uiux_specs,
    required_system_design_specs,
    required_database_specs,
    required_questionnaire_packs,
    required_roadmap_tracks,
    required_docs,
    docs_by_category: category_docs,
    questionnaire_profile_status: questionnaireProfile ? questionnaireProfile.status : null,
    doc_contracts: buildDocContracts(required_docs.concat(category_docs.map((doc) => doc.id))),
    requires_database: required_database_specs.length > 0 || required_docs.includes("database"),
    requires_security: required_docs.includes("security"),
    requires_api: required_docs.includes("api")
  };
}

module.exports = { resolveSpecProfile };
