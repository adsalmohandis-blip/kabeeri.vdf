const { loadWorkspacePlanTemplate, uniqueStrings } = require("./registry_loader");

function buildBaseFolders() {
  return [
    "docs/requirements",
    "docs/uiux",
    "docs/system-design",
    "docs/database",
    "docs/api",
    "docs/security",
    "docs/testing",
    "docs/deployment",
    "docs/evidence",
    "specs",
    "roadmap",
    "roadmap/tracks",
    "tasks",
    "prompts",
    "evidence",
    "tests"
  ];
}

function buildCategoryFolders(profile = {}) {
  const ids = uniqueStrings(profile.selected_category_ids || []);
  const folders = [];
  if (ids.includes("ecommerce_platform") || profile.governance_profile === "payment_commerce_app") {
    folders.push("docs/uiux/screen-specs", "docs/system-design/modules", "docs/database/tables", "specs/catalog", "specs/cart", "specs/checkout", "specs/payments", "specs/orders", "specs/inventory", "specs/admin", "tests/payment", "tests/order-lifecycle", "evidence/payments", "evidence/security");
  }
  if (ids.includes("saas_platform") || profile.architecture_pattern === "multi_tenant_saas") {
    folders.push("specs/tenant", "specs/billing", "specs/subscription", "specs/onboarding", "tests/tenant", "tests/billing");
  }
  if (ids.includes("mobile_application")) {
    folders.push("docs/uiux/screens", "docs/uiux/navigation", "specs/offline", "specs/push", "tests/mobile", "evidence/mobile");
  }
  if (ids.includes("ai_agent_automation_app") || profile.architecture_pattern === "ai_agent_architecture") {
    folders.push("specs/tools", "specs/memory", "specs/safety", "tests/agent-safety", "evidence/agent-governance");
  }
  if (ids.includes("data_analytics_dashboard")) {
    folders.push("specs/metrics", "specs/charts", "specs/datasource", "tests/analytics", "evidence/analytics");
  }
  return uniqueStrings(folders);
}

function buildWorkspacePlan(profile = {}, specProfile = null, roadmapProfile = null, options = {}) {
  const template = loadWorkspacePlanTemplate();
  const folders = uniqueStrings([...(template.folders || []), ...buildBaseFolders(), ...buildCategoryFolders(profile)]);
  return {
    app_id: profile.app_id || null,
    app_name: profile.app_name || null,
    track: options.track || "app_category_registry",
    workspace_template: profile.selected_categories && profile.selected_categories[0] ? profile.selected_categories[0].workspace_template || null : null,
    dry_run: options.dry_run !== undefined ? Boolean(options.dry_run) : true,
    apply: Boolean(options.apply),
    folders,
    docs_root: "docs",
    roadmap_root: "roadmap",
    tests_root: "tests",
    evidence_root: "evidence",
    spec_profile_status: specProfile ? specProfile.required_docs : [],
    roadmap_order: roadmapProfile ? roadmapProfile.order : [],
    existing_folders: Array.isArray(options.existing_folders) ? options.existing_folders : [],
    safety: {
      destructive: false,
      overwrite_non_empty: false,
      inactive_categories_allowed: false
    }
  };
}

module.exports = { buildWorkspacePlan };
