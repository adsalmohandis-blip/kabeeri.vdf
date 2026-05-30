const { buildProfile } = require("./profile_service");
const { loadActiveCatalog, loadCategoryFiles, loadReadinessMatrix, loadVisibilityRules } = require("./registry_loader");
const { validateCategory } = require("./category_validator");
const { buildVisibilityReport, filterVisibleCategories } = require("./visibility_engine");

function validateRegistry(selection = null) {
  const categories = loadCategoryFiles();
  const activeCatalog = loadActiveCatalog();
  const readinessMatrix = loadReadinessMatrix();
  const visibilityRules = loadVisibilityRules();
  const issues = [];
  const warnings = [];
  const seen = new Set();
  const duplicateIds = [];

  for (const category of categories) {
    try {
      validateCategory(category);
    } catch (error) {
      issues.push({ id: category && category.id ? category.id : null, message: error.message, code: error.code || "CATEGORY_VALIDATION_ERROR" });
    }
    if (category && category.id) {
      if (seen.has(category.id)) duplicateIds.push(category.id);
      seen.add(category.id);
    }
  }

  const visibleDefaultCategories = filterVisibleCategories(categories);
  const visibilityReport = buildVisibilityReport(categories);
  const readinessEntries = Array.isArray(readinessMatrix.categories) ? readinessMatrix.categories : [];
  const missingActiveCategories = activeCatalog.active_categories.filter((categoryId) => !categories.some((category) => category.id === categoryId));

  let profileResult = null;
  if (selection) {
    profileResult = buildProfile(selection);
    if (profileResult && profileResult.compatibility && profileResult.compatibility.blocking) {
      warnings.push(...profileResult.compatibility.issues);
    }
  }

  const ok = issues.length === 0 && duplicateIds.length === 0;
  return {
    ok,
    valid: ok,
    category_count: categories.length,
    active_default_count: activeCatalog.default_active_categories.length,
    active_catalog_count: activeCatalog.active_categories.length,
    visible_default_count: visibleDefaultCategories.length,
    visibility_report: visibilityReport,
    readiness_count: readinessEntries.length,
    duplicate_ids: duplicateIds,
    missing_active_categories: missingActiveCategories,
    issues,
    warnings,
    visibility_rules: visibilityRules,
    profile: profileResult ? profileResult.profile : null,
    profile_compatibility: profileResult ? profileResult.compatibility : null
  };
}

module.exports = { validateRegistry };
