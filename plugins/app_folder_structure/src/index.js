const { registerAppFolderStructure } = require("./commands/register");
const { runStatus } = require("./commands/status");
const { runCreate } = require("./commands/create");
const { runValidate } = require("./commands/validate");
const { runRepair } = require("./commands/repair");
const { runManifest } = require("./commands/manifest");
const { runPrint } = require("./commands/print");

function appFolderStructure(action, value, flags = {}, rest = [], deps = {}) {
  const normalized = String(action || "").trim().toLowerCase();
  if (!normalized || normalized === "status") return runStatus({ action, value, flags, rest, deps }, deps);
  if (normalized === "create") return runCreate({ action, value, flags, rest, deps }, deps);
  if (normalized === "validate" || normalized === "readiness") return runValidate({ action, value, flags, rest, deps }, deps);
  if (normalized === "repair") return runRepair({ action, value, flags, rest, deps }, deps);
  if (normalized === "manifest") return runManifest({ action, value, flags, rest, deps }, deps);
  if (normalized === "print") return runPrint({ action, value, flags, rest, deps }, deps);
  if (normalized === "register") return registerAppFolderStructure({ action, value, flags, rest, deps });
  return runStatus({ action, value, flags, rest, deps }, deps);
}

module.exports = {
  appFolderStructure,
  registerAppFolderStructure
};
