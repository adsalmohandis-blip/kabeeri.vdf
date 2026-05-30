const fs = require("fs");
const path = require("path");
const { DATA_DIRS } = require("../core/constants");
const { safeJsonParse } = require("../utils/json_safe");

function uniqueStrings(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readJsonFile(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return safeJsonParse(fs.readFileSync(filePath, "utf8"), fallback);
}

function readJsonDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) return [];
  return fs.readdirSync(directoryPath)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const filePath = path.join(directoryPath, file);
      return {
        file_name: file,
        file_path: filePath,
        data: readJsonFile(filePath, null)
      };
    })
    .filter((entry) => entry.data !== null);
}

function loadCategoryUniverse() {
  return readJsonFile(path.join(DATA_DIRS.categoryUniverse, "universe.json"), { groups: [], categories: [] });
}

function loadCategoryFiles() {
  return readJsonDirectory(DATA_DIRS.categories).map((entry) => ({
    ...entry.data,
    source_file: entry.file_path,
    source_name: entry.file_name
  }));
}

function loadActiveCatalog() {
  const defaultCatalog = readJsonFile(path.join(DATA_DIRS.activeCatalog, "default_active_categories.json"), { categories: [] });
  const commonCatalog = readJsonFile(path.join(DATA_DIRS.activeCatalog, "common_app_categories.json"), { categories: [] });
  const advancedCatalog = readJsonFile(path.join(DATA_DIRS.activeCatalog, "advanced_categories.json"), { categories: [] });
  const defaultActive = uniqueStrings(defaultCatalog.categories);
  const commonActive = uniqueStrings(commonCatalog.categories);
  const advanced = uniqueStrings(advancedCatalog.categories);
  return {
    default_active_categories: defaultActive,
    common_app_categories: commonActive,
    advanced_categories: advanced,
    active_categories: uniqueStrings([...defaultActive, ...commonActive]),
    active_catalog_files: [
      path.join(DATA_DIRS.activeCatalog, "default_active_categories.json"),
      path.join(DATA_DIRS.activeCatalog, "common_app_categories.json"),
      path.join(DATA_DIRS.activeCatalog, "advanced_categories.json")
    ]
  };
}

function loadReadinessMatrix() {
  return readJsonFile(path.join(DATA_DIRS.readiness, "category_readiness_matrix.json"), { categories: [] });
}

function loadVisibilityRules() {
  return readJsonFile(path.join(DATA_DIRS.visibility, "visibility_rules.json"), {
    default_rule: { activation_status: "active", spec_status: ["ready", "verified"], visibility: "default" },
    advanced_rule: { activation_status: ["active", "admin_only", "hidden"], visibility: ["advanced", "coming_soon", "hidden"] }
  });
}

function loadQuestionnairePacks() {
  const layers = ["base", "delivery", "domain", "architecture", "governance", "industry"];
  const packs = {};
  for (const layer of layers) {
    packs[layer] = readJsonDirectory(path.join(DATA_DIRS.questionnaires, layer)).map((entry) => ({
      ...entry.data,
      layer,
      source_file: entry.file_path,
      source_name: entry.file_name
    }));
  }
  return packs;
}

function loadRoadmapTemplates() {
  const entries = readJsonDirectory(path.join(DATA_DIRS.roadmap, "templates"));
  return entries.reduce((acc, entry) => {
    const data = entry.data || {};
    if (data.id) {
      acc[data.id] = { ...data, source_file: entry.file_path, source_name: entry.file_name };
    }
    return acc;
  }, {});
}

function loadDocContractFolders() {
  if (!fs.existsSync(DATA_DIRS.docContracts)) return [];
  return fs.readdirSync(DATA_DIRS.docContracts)
    .filter((file) => fs.statSync(path.join(DATA_DIRS.docContracts, file)).isDirectory())
    .sort((a, b) => a.localeCompare(b));
}

function loadWorkspacePlanTemplate() {
  return readJsonFile(path.join(DATA_DIRS.workspace, "workspace_plan.json"), { dry_run: true, folders: [] });
}

function indexCategories(categories) {
  return (Array.isArray(categories) ? categories : []).reduce((acc, category) => {
    if (category && category.id) acc[normalizeKey(category.id)] = category;
    return acc;
  }, {});
}

function findCategoryById(categories, categoryId) {
  const index = indexCategories(categories);
  return index[normalizeKey(categoryId)] || null;
}

function collectSelectedCategoryIds(selection = {}) {
  const values = [];
  if (Array.isArray(selection.selected_category_ids)) values.push(...selection.selected_category_ids);
  if (typeof selection.selected_category_ids === "string") values.push(...selection.selected_category_ids.split(/[ ,]+/g));
  const keys = ["delivery_category", "domain_category", "architecture_pattern", "governance_profile", "industry_category"];
  for (const key of keys) {
    if (selection[key]) values.push(selection[key]);
  }
  if (selection.category_id) values.push(selection.category_id);
  return uniqueStrings(values.map(normalizeKey));
}

function buildQuestionPackIndex(packs) {
  return Object.entries(packs).flatMap(([layer, items]) => items.map((item) => ({
    id: item.id || item.source_name.replace(/\.json$/i, ""),
    layer,
    questions: Array.isArray(item.questions) ? item.questions : [],
    source_name: item.source_name,
    source_file: item.source_file
  })));
}

module.exports = {
  buildQuestionPackIndex,
  collectSelectedCategoryIds,
  findCategoryById,
  indexCategories,
  loadActiveCatalog,
  loadCategoryFiles,
  loadCategoryUniverse,
  loadDocContractFolders,
  loadQuestionnairePacks,
  loadReadinessMatrix,
  loadRoadmapTemplates,
  loadVisibilityRules,
  loadWorkspacePlanTemplate,
  normalizeKey,
  readJsonDirectory,
  readJsonFile,
  uniqueStrings
};
