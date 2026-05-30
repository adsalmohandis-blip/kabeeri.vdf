const { PACKAGE_ROOT } = require("../core/constants");
const { loadActiveCatalog, loadCategoryFiles, loadCategoryUniverse, loadReadinessMatrix, loadVisibilityRules } = require("./registry_loader");
const { buildVisibilityReport } = require("./visibility_engine");

function getStatusReport() {
  const categories = loadCategoryFiles();
  const universe = loadCategoryUniverse();
  const activeCatalog = loadActiveCatalog();
  const readinessMatrix = loadReadinessMatrix();
  const visibilityRules = loadVisibilityRules();
  return {
    plugin: "app_category_registry",
    package_root: PACKAGE_ROOT,
    role: "category brain for KVDOS app creation",
    category_universe: "data-driven",
    category_count: categories.length,
    universe_count: Array.isArray(universe.categories) ? universe.categories.length : 0,
    active_default_categories: activeCatalog.default_active_categories,
    active_catalog_categories: activeCatalog.active_categories,
    readiness_count: Array.isArray(readinessMatrix.categories) ? readinessMatrix.categories.length : 0,
    visibility_report: buildVisibilityReport(categories),
    visibility_rules: visibilityRules,
    outputs: [
      ".kabeeri/app_category_profile.yaml",
      ".kabeeri/source_inventory.yaml",
      ".kabeeri/source_map.yaml",
      ".kabeeri/questionnaire_profile.yaml",
      ".kabeeri/spec_profile.yaml",
      ".kabeeri/micro_doc_contract.yaml",
      ".kabeeri/roadmap_profile.yaml",
      ".kabeeri/workspace_plan.yaml",
      ".kabeeri/category_evidence.json"
    ]
  };
}

module.exports = { getStatusReport };
