const path = require("path");
const { PACKAGE_ROOT } = require("../core/constants");

function getPackageStructureReport() {
  return {
    package_root: PACKAGE_ROOT,
    standard_dirs: [
      "plugin.json",
      "bootstrap.js",
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "src",
      "schemas",
      "docs",
      "tests",
      "prompts",
      "dashboard",
      "examples",
      "config",
      "plugin_manifest.json"
    ],
    standard_source_dirs: [
      "src/index.js",
      "src/commands",
      "src/services",
      "src/core",
      "src/adapters",
      "src/policies",
      "src/utils"
    ],
    standard_package_contract: [
      "src/index.js",
      "src/commands",
      "src/services",
      "src/core",
      "src/adapters",
      "src/policies",
      "src/utils"
    ],
    docs_root: path.join(PACKAGE_ROOT, "docs")
  };
}

module.exports = { getPackageStructureReport };
