const { CategoryValidationError } = require("../core/errors");

function validateCategory(category) {
  const required = ["id", "name", "description", "group", "layer", "lifecycle_status", "activation_status", "spec_status", "visibility", "version", "schema_version"];
  for (const key of required) {
    if (!category || !category[key]) {
      throw new CategoryValidationError(`Category missing required field: ${key}`);
    }
  }
  if (!/^[a-z0-9_]+$/i.test(String(category.id))) {
    throw new CategoryValidationError(`Category id must be slug-safe: ${category.id}`);
  }
  if (!["draft", "experimental", "beta", "stable", "deprecated"].includes(category.lifecycle_status)) {
    throw new CategoryValidationError(`Invalid lifecycle_status for ${category.id}`);
  }
  if (!["active", "inactive", "admin_only", "hidden"].includes(category.activation_status)) {
    throw new CategoryValidationError(`Invalid activation_status for ${category.id}`);
  }
  if (!["none", "partial", "ready", "verified"].includes(category.spec_status)) {
    throw new CategoryValidationError(`Invalid spec_status for ${category.id}`);
  }
  if (!["default", "advanced", "coming_soon", "hidden"].includes(category.visibility)) {
    throw new CategoryValidationError(`Invalid visibility for ${category.id}`);
  }
  const arrayFields = [
    "compatible_with",
    "required_uiux_specs",
    "required_system_design_specs",
    "required_database_specs",
    "required_questionnaire_packs",
    "required_roadmap_tracks",
    "governance_profiles",
    "testing_focus",
    "readiness_checks"
  ];
  for (const field of arrayFields) {
    if (category[field] !== undefined && !Array.isArray(category[field])) {
      throw new CategoryValidationError(`Category field must be an array: ${field}`);
    }
  }
  return true;
}

module.exports = { validateCategory };
