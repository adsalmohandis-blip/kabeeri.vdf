const assert = require("assert");
const { loadActiveCatalog, loadCategoryFiles, loadCategoryUniverse } = require("../../src/services/registry_loader");

const categories = loadCategoryFiles();
const activeCatalog = loadActiveCatalog();
const universe = loadCategoryUniverse();

assert.ok(Array.isArray(categories));
assert.ok(categories.some((category) => category.id === "web_application"));
assert.ok(Array.isArray(activeCatalog.active_categories));
assert.ok(activeCatalog.active_categories.includes("web_application"));
assert.ok(Array.isArray(universe.categories));
