function isVisibleByDefault(category) {
  return category
    && category.activation_status === "active"
    && (category.spec_status === "ready" || category.spec_status === "verified")
    && category.visibility === "default";
}

function isVisibleInAdvancedCatalog(category) {
  return Boolean(category)
    && ["active", "admin_only", "hidden"].includes(category.activation_status)
    && ["advanced", "coming_soon", "hidden"].includes(category.visibility);
}

function filterVisibleCategories(categories = [], options = {}) {
  const includeAdvanced = Boolean(options.includeAdvanced);
  const includeInactive = Boolean(options.includeInactive);
  return (Array.isArray(categories) ? categories : []).filter((category) => {
    if (isVisibleByDefault(category)) return true;
    if (includeAdvanced && isVisibleInAdvancedCatalog(category)) return true;
    if (includeInactive && category && category.activation_status === "inactive") return true;
    return false;
  });
}

function buildVisibilityReport(categories = []) {
  const list = Array.isArray(categories) ? categories : [];
  const defaultVisible = list.filter(isVisibleByDefault);
  const advancedVisible = list.filter(isVisibleInAdvancedCatalog);
  const hidden = list.filter((category) => category && category.visibility === "hidden");
  return {
    total: list.length,
    default_visible: defaultVisible.length,
    advanced_visible: advancedVisible.length,
    hidden: hidden.length,
    default_category_ids: defaultVisible.map((category) => category.id),
    advanced_category_ids: advancedVisible.map((category) => category.id)
  };
}

module.exports = { buildVisibilityReport, filterVisibleCategories, isVisibleByDefault, isVisibleInAdvancedCatalog };
