const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { readJson, writeJson } = require("../utils/json_safe");

function ownerRoot(slug) {
  return path.join(repoRoot(), "plugins", slug);
}

function workspaceRoot(slug) {
  return path.join(repoRoot(), "workspaces", "plugins", slug);
}

function resolveSlug(context) {
  return context.plugin_slug || context.value || context.rest[0] || context.flags.slug || "";
}

function addIntegration(context) {
  const track = resolveTrack(context);
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const target = context.rest[0];
  const mode = context.flags.mode || "consume";
  const required = String(context.flags.required || "false").toLowerCase() === "true";
  const root = track === "owner" ? ownerRoot(slug) : workspaceRoot(slug);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const integrationDir = track === "owner"
    ? path.join(root, "docs")
    : path.join(root, "specifications", "integration_specification");
  ensureDir(integrationDir);
  const filePath = path.join(integrationDir, "integrations.json");
  const current = readJson(filePath, { integrations: [] });
  current.integrations = Array.isArray(current.integrations) ? current.integrations : [];
  current.integrations.push({ target, mode, required, added_at: new Date().toISOString() });
  writeJson(filePath, current);
  if (track === "owner") {
    writeFileIfMissing(path.join(root, "docs", "INTEGRATIONS.md"), "# Integrations\n");
  } else {
    ensureDir(path.join(root, "roadmaps_plans", "integration_plan"));
    ensureDir(path.join(root, "specifications", "integration_specification"));
  }
  return { report_type: "plugin_folder_structure_integration_add", status: "recorded", track, slug, target, mode, required, root };
}

function validateIntegration(context) {
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const track = resolveTrack(context);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const ownerFile = path.join(ownerRoot(slug), "docs", "INTEGRATIONS.md");
  const workspaceFile = path.join(workspaceRoot(slug), "specifications", "integration_specification", "integrations.json");
  const ok = fs.existsSync(ownerFile) || fs.existsSync(workspaceFile);
  return { report_type: "plugin_folder_structure_integration_validate", slug, ok, ownerFile, workspaceFile };
}

function runIntegrationCommand(context) {
  const subAction = String(context.value || context.rest[0] || "").toLowerCase();
  const shifted = { ...context, value: context.rest[0], rest: context.rest.slice(1) };
  if (subAction === "add") return printResult(addIntegration(shifted), context);
  if (subAction === "validate") return printResult(validateIntegration(shifted), context);
  throw pluginFolderError(`Unknown integration action: ${subAction || "(missing)"}`);
}

function printResult(report, context) {
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  addIntegration,
  validateIntegration,
  runIntegrationCommand
};
