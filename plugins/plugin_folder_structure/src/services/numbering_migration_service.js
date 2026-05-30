const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { readJson, writeJson } = require("../utils/json_safe");

function workspaceRoot(slug) {
  return path.join(repoRoot(), "workspaces", "plugins", slug);
}

function appendJsonl(filePath, record) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function renameFolder(root, fromName, toName, force = false) {
  const fromPath = path.join(root, fromName);
  const toPath = path.join(root, toName);
  if (!fs.existsSync(fromPath)) {
    return { moved: false, skipped: true, fromPath, toPath };
  }
  if (!fs.existsSync(toPath)) {
    fs.renameSync(fromPath, toPath);
    return { moved: true, fromPath, toPath };
  }
  const fromEntries = fs.readdirSync(fromPath);
  const toEntries = fs.readdirSync(toPath);
  if (toEntries.length > 0 && fromEntries.length > 0 && !force) {
    return { moved: false, conflict: true, fromPath, toPath, fromEntries, toEntries };
  }
  if (force) {
    fs.rmSync(toPath, { recursive: true, force: true });
    fs.renameSync(fromPath, toPath);
    return { moved: true, forced: true, fromPath, toPath };
  }
  for (const entry of fromEntries) {
    fs.renameSync(path.join(fromPath, entry), path.join(toPath, entry));
  }
  fs.rmSync(fromPath, { recursive: true, force: true });
  return { moved: true, merged: true, fromPath, toPath };
}

function replaceInTextFiles(root, replacements, exclude = new Set()) {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      const relative = path.relative(root, full).replace(/\\/g, "/");
      if (exclude.has(relative)) continue;
      if (!/\.(js|json|md|yaml|yml|txt)$/i.test(entry.name)) continue;
      let content = fs.readFileSync(full, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        if (content.includes(from)) {
          content = content.split(from).join(to);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(full, content, "utf8");
    }
  }
}

function fixNumbering(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") {
    throw pluginFolderError("Numbering cleanup is only available for Plugin Development Track workspaces.");
  }
  const slug = context.plugin_slug || context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = workspaceRoot(slug);
  if (!fs.existsSync(root)) throw pluginFolderError(`Workspace not found: ${root}`);
  const force = Boolean(context.flags && context.flags.force);

  const renameResults = [
    renameFolder(root, "07_plugin_agents", "08_plugin_agents", force),
    renameFolder(root, "06_plugin_task_punches", "07_plugin_task_punches", force),
    renameFolder(root, "05_plugin_evolutions", "06_plugin_evolutions", force),
    renameFolder(root, "04_plugin_version_control", "05_plugin_version_control", force),
    renameFolder(root, "03_plugin_package", "04_plugin_package", force)
  ];
  const conflict = renameResults.find((item) => item && item.conflict);
  if (conflict) {
    const archiveRoot = path.join(root, "99_plugin_archive");
    ensureDir(archiveRoot);
    writeFileIfMissing(path.join(archiveRoot, "plugin_package_numbering_conflict.md"), [
      "# Plugin Package Numbering Conflict",
      "",
      `- workspace: ${root}`,
      `- from: ${path.basename(conflict.fromPath)}`,
      `- to: ${path.basename(conflict.toPath)}`,
      `- action: manual review required`
    ].join("\n") + "\n");
    return {
      report_type: "plugin_folder_structure_fix_numbering",
      status: "conflict",
      slug,
      root,
      conflict
    };
  }

  const sourceFolder = path.join(root, "08_plugin_source");
  const archiveRoot = path.join(root, "99_plugin_archive");
  ensureDir(archiveRoot);
  if (fs.existsSync(sourceFolder)) {
    writeFileIfMissing(path.join(archiveRoot, "source_tracking_deprecated.md"), `# Source Tracking Deprecated\n\nThe redundant source-pointer folder has been removed from ${slug}. The canonical package lives in ./04_plugin_package/.\n`);
    fs.rmSync(sourceFolder, { recursive: true, force: true });
  }

  replaceInTextFiles(root, [
    ["03_plugin_package", "04_plugin_package"],
    ["04_plugin_version_control", "05_plugin_version_control"],
    ["05_plugin_evolutions", "06_plugin_evolutions"],
    ["06_plugin_task_punches", "07_plugin_task_punches"],
    ["07_plugin_agents", "08_plugin_agents"]
  ], new Set([
    "plugin_workspace_manifest.json",
    "99_plugin_archive/package_folder_renumbering.md",
    "99_plugin_archive/plugin_package_numbering_conflict.md"
  ]));

  const manifestPath = path.join(root, "plugin_workspace_manifest.json");
  const manifest = readJson(manifestPath, {});
  manifest.package_root = `./workspaces/plugins/${slug}/04_plugin_package/`;
  manifest.actual_plugin_package = "04_plugin_package";
  manifest.canonical_package_folder = "04_plugin_package";
  manifest.previous_package_folder = "03_plugin_package";
  manifest.renumbering_migrated = true;
  manifest.removed_redundant_source_folder = true;
  manifest.updated_at = new Date().toISOString();
  delete manifest.source_tracking_folder;
  if (!manifest.compatibility) manifest.compatibility = {};
  manifest.compatibility.actual_plugin_package = "04_plugin_package";
  manifest.compatibility.canonical_package_folder = "04_plugin_package";
  manifest.compatibility.previous_package_folder = "03_plugin_package";
  manifest.compatibility.renumbering_migrated = true;
  manifest.compatibility.removed_redundant_source_folder = true;
  delete manifest.compatibility.source_tracking_folder;
  writeJson(manifestPath, manifest);

  const auditDir = path.join(root, "10_plugin_evidence_audit");
  ensureDir(auditDir);
  writeFileIfMissing(path.join(auditDir, "audit_log.md"), "# Audit log\n");
  writeFileIfMissing(path.join(auditDir, "audit_log.jsonl"), "");
  const event = {
    event_id: `numbering-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_track: track,
    command: "plugin-folder fix-numbering",
    plugin_slug: slug,
    previous_status: "legacy_numbering",
    new_status: "canonical_numbering",
    files_changed: [],
    evidence_path: "./workspaces/plugins/<plugin-slug>/10_plugin_evidence_audit/audit_log.jsonl",
    result: "recorded",
    notes: "Renumbered plugin-dev workspace to the canonical sequential folder set."
  };
  fs.appendFileSync(path.join(auditDir, "audit_log.md"), `\n- ${event.timestamp} ${event.command} ${slug}\n`, "utf8");
  appendJsonl(path.join(auditDir, "audit_log.jsonl"), event);

  writeFileIfMissing(path.join(archiveRoot, "package_folder_renumbering.md"), [
    "# Package Folder Renumbering",
    "",
    `- plugin_slug: ${slug}`,
    `- workspace_path: ./workspaces/plugins/${slug}/`,
    `- package_root: ./workspaces/plugins/${slug}/04_plugin_package/`,
    `- canonical_package_folder: 04_plugin_package`,
    `- previous_package_folder: 03_plugin_package`,
    `- removed_redundant_source_folder: true`
  ].join("\n") + "\n");

  return {
    report_type: "plugin_folder_structure_fix_numbering",
    status: "migrated",
    slug,
    root,
    package_root: `./workspaces/plugins/${slug}/04_plugin_package/`,
    canonical_package_folder: "04_plugin_package",
    previous_package_folder: "03_plugin_package",
    removed_redundant_source_folder: true
  };
}

function runFixNumberingCommand(context) {
  const report = fixNumbering(context);
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  fixNumbering,
  runFixNumberingCommand
};
