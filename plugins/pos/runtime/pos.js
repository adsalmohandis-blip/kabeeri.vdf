const path = require("path");

function resolveRepoRootFromCli() {
  const cliEntry = process.argv[1] ? path.resolve(process.argv[1]) : null;
  if (!cliEntry) {
    throw new Error("POS runtime blocked: unable to resolve CLI entrypoint.");
  }
  return path.dirname(path.dirname(cliEntry));
}

const repoRoot = resolveRepoRootFromCli();
const { createAppPluginRuntime } = require(path.join(repoRoot, "src/cli/services/app_plugin_runtime"));
const catalog = require(path.join(repoRoot, "src/cli/services/app_plugin_catalog"));

module.exports = createAppPluginRuntime(catalog.pos);
