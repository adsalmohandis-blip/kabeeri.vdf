const {
  buildOwnerPlanId,
  buildOwnerVersionId,
  buildOwnerEvolutionId,
  buildOwnerTaskId,
  buildViberPlanId,
  buildViberVersionId,
  buildViberEvolutionId,
  buildViberTaskId,
  validateNamingId,
  explainNamingRules,
  buildNamingValidationReport,
  buildNamingMigrationPlan
} = require("../services/naming_governance");
const { normalizeTrackAssignment } = require("../services/track_control");

function naming(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const mode = normalizeAction(action);
  if (mode === "preview") {
    const report = buildNamingPreviewReport(value, flags);
    outputNamingReport(report, flags);
    return report;
  }
  if (mode === "migrate") {
    const report = buildNamingMigrationPlan(flags);
    outputNamingReport(report, flags);
    return report;
  }
  if (!mode || mode === "validate") {
    const report = buildNamingValidationReport();
    outputNamingReport(report, flags);
    return report;
  }
  throw new Error(`Unknown naming action: ${action}`);
}

function buildNamingPreviewReport(value, flags = {}) {
  const track = canonicalTrack(flags.track || value || "owner");
  const type = String(flags.type || "").trim().toLowerCase();
  const title = String(flags.title || "").trim();
  const effectiveTitle = title || (type === "version" ? "Foundation" : "");
  const appSlug = String(flags.app || flags.app_slug || flags["app-slug"] || "").trim();
  const evolutionId = String(flags.evolution || flags.evolution_id || "").trim();
  const version = String(flags.version || "").trim();
  const order = flags.order || "1";
  const date = flags.date || null;
  const workstream = String(flags.workstream || "").trim();
  const label = String(flags.label || "").trim();
  const category = String(flags.category || "").trim();

  const preview = {
    report_type: "kvdf_naming_preview",
    track,
    type,
    title: effectiveTitle || null,
    generated_id: null,
    valid: false,
    rules_applied: []
  };

  try {
    const generated_id = buildPreviewId({ track, type, title: effectiveTitle, appSlug, evolutionId, version, order, date, workstream, label, category });
    preview.generated_id = generated_id;
    preview.valid = Boolean(generated_id);
    preview.rules_applied = explainNamingRules({ track, type }).rules;
    preview.rules_applied.push(`track:${track}`);
    preview.rules_applied.push(`type:${type}`);
    const validation = validateNamingId({
      id: generated_id,
      track,
      type,
      title: effectiveTitle,
      appSlug,
      evolutionId,
      version,
      order,
      date,
      workstream,
      label,
      category
    }, { track, type, title, appSlug, evolutionId, version, order, date, workstream, label, category });
    preview.valid = validation.valid;
    preview.expected_id = validation.expected_id;
    preview.normalized_id = validation.normalized_id;
    if (!validation.valid) {
      preview.errors = validation.errors;
    }
  } catch (error) {
    preview.valid = false;
    preview.errors = [error.message];
  }

  if (type === "version" && !title) preview.title = preview.title || "Foundation";
  return preview;
}

function buildPreviewId(options) {
  const { track, type, title, appSlug, evolutionId, version, order, date, workstream, label, category } = options;
  if (track === "framework_owner" && type === "plan") return buildOwnerPlanId({ date, order, title });
  if (track === "framework_owner" && type === "version") return buildOwnerVersionId({ version, label, title });
  if (track === "framework_owner" && type === "evolution") return buildOwnerEvolutionId({ version, order, title });
  if (track === "framework_owner" && type === "task") return buildOwnerTaskId({ evolutionId, order, title });
  if (track === "vibe_app_developer" && type === "plan") return buildViberPlanId({ appSlug, date, order, title });
  if (track === "vibe_app_developer" && type === "version") return buildViberVersionId({ appSlug, version, label, title });
  if (track === "vibe_app_developer" && type === "evolution") return buildViberEvolutionId({ appSlug, version, order, category, title });
  if (track === "vibe_app_developer" && type === "task") return buildViberTaskId({ appSlug, evolutionId, order, workstream, title });
  throw new Error(`Unsupported naming preview combination: ${track}/${type}`);
}

function outputNamingReport(report, flags) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderNamingReport(report));
}

function renderNamingReport(report) {
  return [
    "KVDF Naming Governance",
    `Report: ${report.report_type}`,
    `Track: ${report.track}`,
    `Type: ${report.type || "validate"}`,
    `ID: ${report.generated_id || "validation only"}`,
    `Valid: ${String(report.valid ?? report.status === "pass")}`
  ].join("\n");
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (!value) return "validate";
  if (["preview", "validate", "migrate"].includes(value)) return value;
  return value;
}

function canonicalTrack(track) {
  return normalizeTrackAssignment(track) || "framework_owner";
}

module.exports = {
  naming,
  buildNamingPreviewReport,
  buildPreviewId,
  renderNamingReport,
  canonicalTrack
};
