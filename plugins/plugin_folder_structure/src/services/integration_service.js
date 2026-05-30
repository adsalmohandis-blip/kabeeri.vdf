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
  const canonicalIntegrationDir = track === "owner"
    ? path.join(root, "docs")
    : path.join(root, "03_plugin_specifications", "integration_specification");
  const canonicalPlanDir = track === "owner"
    ? path.join(root, "docs")
    : path.join(root, "02_plugin_roadmaps_plans", "integration_plan");
  const canonicalEvidenceDir = track === "owner"
    ? path.join(root, "docs")
    : path.join(root, "10_plugin_evidence_audit", "integration_evidence");
  ensureDir(canonicalIntegrationDir);
  ensureDir(canonicalPlanDir);
  ensureDir(canonicalEvidenceDir);
  const canonicalFilePath = track === "owner"
    ? path.join(canonicalIntegrationDir, "INTEGRATIONS.md")
    : path.join(canonicalIntegrationDir, "integration_contracts.md");
  const current = readJson(track === "owner"
    ? path.join(root, "docs", "integrations.json")
    : path.join(canonicalEvidenceDir, "integrations.json"), { integrations: [] });
  current.integrations = Array.isArray(current.integrations) ? current.integrations : [];
  current.integrations.push({ target, mode, required, added_at: new Date().toISOString() });
  if (track === "owner") {
    writeJson(path.join(root, "docs", "integrations.json"), current);
    writeFileIfMissing(canonicalFilePath, "# Integrations\n");
  } else {
    writeJson(path.join(canonicalEvidenceDir, "integrations.json"), current);
    writeFileIfMissing(canonicalFilePath, "# Integration contracts\n");
    writeFileIfMissing(path.join(canonicalPlanDir, "required_integrations.md"), "# Required integrations\n");
    writeFileIfMissing(path.join(canonicalPlanDir, "optional_integrations.md"), "# Optional integrations\n");
  }
  if (track === "owner") {
    writeFileIfMissing(path.join(root, "docs", "INTEGRATIONS.md"), "# Integrations\n");
  } else {
    ensureDir(path.join(root, "10_plugin_evidence_audit"));
    writeFileIfMissing(path.join(root, "10_plugin_evidence_audit", "integration_summary.md"), "# Integration summary\n");
    writeFileIfMissing(path.join(canonicalEvidenceDir, "integration_contract_evidence.md"), "# Integration contract evidence\n");
  }
  return { report_type: "plugin_folder_structure_integration_add", status: "recorded", track, slug, target, mode, required, root };
}

function validateIntegration(context) {
  const slug = resolveSlug(context);
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const track = resolveTrack(context);
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const ownerFile = path.join(ownerRoot(slug), "docs", "INTEGRATIONS.md");
  const workspaceFile = path.join(workspaceRoot(slug), "03_plugin_specifications", "integration_specification", "integration_contracts.md");
  const evidenceWorkspaceFile = path.join(workspaceRoot(slug), "10_plugin_evidence_audit", "integration_evidence", "integrations.json");
  const ok = fs.existsSync(ownerFile) || fs.existsSync(workspaceFile) || fs.existsSync(evidenceWorkspaceFile);
  return { report_type: "plugin_folder_structure_integration_validate", slug, ok, ownerFile, workspaceFile, evidenceWorkspaceFile };
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
