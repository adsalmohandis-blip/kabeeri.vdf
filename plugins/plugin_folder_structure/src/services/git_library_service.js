const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { readJson, writeJson } = require("../utils/json_safe");

function getWorkspaceGitLibraryRoot(slug) {
  return path.join(repoRoot(), "workspaces", "plugins", slug, "inputs", "git_libraries");
}

function getOwnerGitLibraryRoot(slug) {
  return path.join(repoRoot(), "plugins", slug, "docs", "git_libraries");
}

function getGitLibraryRoot(track, slug) {
  if (track === "owner") return getOwnerGitLibraryRoot(slug);
  return getWorkspaceGitLibraryRoot(slug);
}

function resolveSlug(context) {
  return context.plugin_slug || context.value || context.rest[0] || context.flags.slug || "";
}

function addGitLibrary(context) {
  const track = resolveTrack(context);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const url = context.rest[0];
  const name = context.flags.name || slug || "library";
  const proposedUse = context.flags.use || "reference_only";
  const root = getGitLibraryRoot(track, slug);
  ensureDir(root);
  ensureDir(path.join(root, "library_analysis"));
  ensureDir(path.join(root, "license_review"));
  ensureDir(path.join(root, "security_review"));
  ensureDir(path.join(root, "compatibility_review"));
  ensureDir(path.join(root, "maintenance_review"));
  const librariesPath = path.join(root, "selected_libraries.json");
  const current = readJson(librariesPath, { libraries: [] });
  current.libraries = Array.isArray(current.libraries) ? current.libraries : [];
  current.libraries.push({ name, url, proposed_use: proposedUse, added_at: new Date().toISOString() });
  writeJson(librariesPath, current);
  writeFileIfMissing(path.join(root, "libraries.md"), "# Git libraries\n");
  writeFileIfMissing(path.join(root, "adoption_decisions.md"), "# Adoption decisions\n");
  return { report_type: "plugin_folder_structure_git_library_add", status: "recorded", track, slug, name, url, proposed_use: proposedUse, root };
}

function listGitLibraries(context) {
  const track = resolveTrack(context);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = getGitLibraryRoot(track, slug);
  const data = readJson(path.join(root, "selected_libraries.json"), { libraries: [] });
  return { report_type: "plugin_folder_structure_git_library_list", slug, root, libraries: data.libraries || [] };
}

function validateGitLibraries(context) {
  const track = resolveTrack(context);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = getGitLibraryRoot(track, slug);
  const data = readJson(path.join(root, "selected_libraries.json"), { libraries: [] });
  const ok = Array.isArray(data.libraries) && data.libraries.length > 0;
  return { report_type: "plugin_folder_structure_git_library_validate", slug, root, ok, count: data.libraries.length, next_action: ok ? "Adopt or reference the selected library explicitly." : "Add a governed Git library input." };
}

function runGitLibraryCommand(context) {
  const subAction = String(context.value || context.rest[0] || "").toLowerCase();
  const shifted = { ...context, value: context.rest[0], rest: context.rest.slice(1) };
  if (subAction === "add") return printResult(addGitLibrary(shifted), context);
  if (subAction === "list") return printResult(listGitLibraries(shifted), context);
  if (subAction === "validate") return printResult(validateGitLibraries(shifted), context);
  throw pluginFolderError(`Unknown git-library action: ${subAction || "(missing)"}`);
}

function printResult(report, context) {
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  addGitLibrary,
  listGitLibraries,
  validateGitLibraries,
  runGitLibraryCommand
};
