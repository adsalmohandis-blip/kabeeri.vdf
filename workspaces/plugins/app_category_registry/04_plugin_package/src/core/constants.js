const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");
const WORKSPACE_ROOT = path.resolve(PACKAGE_ROOT, "..");

const DATA_DIRS = {
  categoryUniverse: path.join(PACKAGE_ROOT, "category_universe"),
  categories: path.join(PACKAGE_ROOT, "categories"),
  activeCatalog: path.join(PACKAGE_ROOT, "active_catalog"),
  readiness: path.join(PACKAGE_ROOT, "readiness"),
  visibility: path.join(PACKAGE_ROOT, "visibility"),
  questionnaires: path.join(PACKAGE_ROOT, "questionnaires"),
  docContracts: path.join(PACKAGE_ROOT, "doc_contracts"),
  roadmap: path.join(PACKAGE_ROOT, "roadmap"),
  workspace: path.join(PACKAGE_ROOT, "workspace"),
  evidence: path.join(PACKAGE_ROOT, "evidence")
};

module.exports = { PACKAGE_ROOT, WORKSPACE_ROOT, DATA_DIRS };
