const { collectSelectedCategoryIds, findCategoryById, loadCategoryFiles, uniqueStrings } = require("./registry_loader");

function normalizeSelection(selection = {}) {
  if (typeof selection !== "object" || Array.isArray(selection) || selection === null) {
    return { selected_category_ids: collectSelectedCategoryIds({ selected_category_ids: [selection] }) };
  }
  return selection;
}

function buildCategoryProfile(selection) {
  const normalizedSelection = normalizeSelection(selection || {});
  const categories = loadCategoryFiles();
  const selectedCategoryIds = collectSelectedCategoryIds(normalizedSelection);
  const selectedCategories = selectedCategoryIds
    .map((categoryId) => findCategoryById(categories, categoryId))
    .filter(Boolean);
  const now = new Date().toISOString();
  const selectedVersions = selectedCategories.map((category) => ({ id: category.id, version: category.version || null, schema_version: category.schema_version || null }));
  const selectedGroups = uniqueStrings(selectedCategories.map((category) => category.group));
  const placeholderSpecs = uniqueStrings([
    ...selectedCategories.flatMap((category) => category.required_uiux_specs || []),
    ...selectedCategories.flatMap((category) => category.required_system_design_specs || []),
    ...selectedCategories.flatMap((category) => category.required_database_specs || []),
    ...selectedCategories.flatMap((category) => category.required_questionnaire_packs || []),
    ...selectedCategories.flatMap((category) => category.required_roadmap_tracks || [])
  ]);

  return {
    app_id: normalizedSelection.app_id || normalizedSelection.app_slug || null,
    app_name: normalizedSelection.app_name || null,
    delivery_category: normalizedSelection.delivery_category || null,
    domain_category: normalizedSelection.domain_category || null,
    architecture_pattern: normalizedSelection.architecture_pattern || null,
    governance_profile: normalizedSelection.governance_profile || null,
    industry_category: normalizedSelection.industry_category || null,
    selected_category_ids: selectedCategoryIds,
    selected_categories: selectedCategories,
    selected_category_versions: selectedVersions,
    selected_groups: selectedGroups,
    selected_specs_placeholder: placeholderSpecs,
    selected_category_count: selectedCategories.length,
    source_of_truth: "category_registry",
    status: "draft",
    created_at: normalizedSelection.created_at || now,
    updated_at: now
  };
}

module.exports = { buildCategoryProfile };
