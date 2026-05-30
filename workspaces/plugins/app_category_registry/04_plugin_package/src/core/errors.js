class AppCategoryRegistryError extends Error {
  constructor(message, code = "APP_CATEGORY_REGISTRY_ERROR") {
    super(message);
    this.name = "AppCategoryRegistryError";
    this.code = code;
  }
}

class CategoryValidationError extends AppCategoryRegistryError {
  constructor(message) {
    super(message, "CATEGORY_VALIDATION_ERROR");
    this.name = "CategoryValidationError";
  }
}

module.exports = { AppCategoryRegistryError, CategoryValidationError };
