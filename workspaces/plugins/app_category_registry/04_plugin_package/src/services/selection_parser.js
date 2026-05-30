const { uniqueStrings } = require("./registry_loader");
const { slugify } = require("../utils/slugify");

function normalizeSelectionInput(value, flags = {}, rest = []) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  const selection = {};
  const normalizedFlags = flags && typeof flags === "object" ? flags : {};
  const flagKeys = [
    ["app_id", "appId", "app-id"],
    ["app_name", "appName", "name", "app-name"],
    ["delivery_category", "delivery"],
    ["domain_category", "domain"],
    ["architecture_pattern", "architecture"],
    ["governance_profile", "governance"],
    ["industry_category", "industry"],
    ["selected_category_ids", "selected-category-ids", "categories", "category_ids"]
  ];

  for (const [targetKey, ...aliases] of flagKeys) {
    for (const alias of aliases) {
      if (normalizedFlags[alias] !== undefined && normalizedFlags[alias] !== null && normalizedFlags[alias] !== "") {
        selection[targetKey] = normalizedFlags[alias];
        break;
      }
    }
  }

  if (value !== undefined && value !== null && String(value).trim()) {
    selection.selected_category_ids = selection.selected_category_ids || [value];
  } else if (rest.length) {
    selection.selected_category_ids = selection.selected_category_ids || rest.filter(Boolean);
  }

  if (selection.app_id) selection.app_id = slugify(selection.app_id);
  if (selection.app_name && typeof selection.app_name === "string") selection.app_name = selection.app_name.trim();
  if (selection.selected_category_ids) selection.selected_category_ids = uniqueStrings([].concat(selection.selected_category_ids));

  return selection;
}

module.exports = { normalizeSelectionInput };
