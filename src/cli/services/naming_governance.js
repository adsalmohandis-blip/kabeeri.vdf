const VIBER_EVOLUTION_CATEGORIES = new Set([
  "boundary-stabilization",
  "local-ui-foundation",
  "runtime-state",
  "discovery-spec",
  "tasking-approval",
  "cloud-commercial-control",
  "local-license-gate",
  "release-access",
  "safety-quality",
  "execution-review",
  "release-packaging",
  "bridge-evolution"
]);

const TASK_WORKSTREAMS = new Set([
  "docs",
  "frontend",
  "backend",
  "database",
  "api",
  "security",
  "testing",
  "devops",
  "source-control",
  "handoff",
  "dashboard",
  "ai-learning",
  "plugin",
  "governance"
]);

function normalizeSlug(value) {
  const raw = String(value || "").trim().toLowerCase();
  const slug = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

function normalizeDateStamp(date) {
  if (!date) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "");
  }
  if (/^\d{8}$/.test(String(date).trim())) return String(date).trim();
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "");
  }
  return value.toISOString().slice(0, 10).replace(/-/g, "");
}

function normalizeVersionCore(value) {
  const raw = String(value || "").trim().toLowerCase();
  const withoutPrefix = raw.replace(/^v(?=\d)/, "");
  const normalized = withoutPrefix
    .replace(/[_\s]+/g, ".")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "0.0.0";
}

function normalizeVersionSlug(version) {
  const core = normalizeVersionCore(version).replace(/\./g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return `v${core || "0-0-0"}`;
}

function normalizeOrderNumber(value) {
  const numeric = Number.parseInt(String(value || "1"), 10);
  const safe = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  return String(safe).padStart(2, "0");
}

function normalizeEvolutionCategory(value) {
  const normalized = normalizeSlug(value).replace(/_/g, "-");
  return VIBER_EVOLUTION_CATEGORIES.has(normalized) ? normalized : "boundary-stabilization";
}

function normalizeTaskWorkstream(value) {
  const normalized = normalizeSlug(value).replace(/_/g, "-");
  return TASK_WORKSTREAMS.has(normalized) ? normalized : "frontend";
}

function buildOwnerPlanId(options = {}) {
  const dateStamp = normalizeDateStamp(options.date);
  const order = normalizeOrderNumber(options.order);
  const slug = normalizeSlug(options.slug || options.title || options.name || options.label || "plan");
  return `oplan-${dateStamp}-${order}-${slug}`;
}

function buildOwnerVersionId(options = {}) {
  const versionCore = normalizeVersionCore(options.version || options.version_id || options.label || "0.0.0");
  const label = normalizeSlug(options.label || options.title || options.name || "release");
  return `kvdf-v${versionCore}-${label}`;
}

function buildOwnerEvolutionId(options = {}) {
  const versionSlug = normalizeVersionSlug(options.version || options.version_slug || options.version_id || "v0.0.0");
  const order = normalizeOrderNumber(options.order);
  const slug = normalizeSlug(options.slug || options.title || options.name || options.label || "evolution");
  return `oevo-${versionSlug}-${order}-${slug}`;
}

function buildOwnerTaskId(options = {}) {
  const evolutionId = normalizeSlug(options.evolutionId || options.evolution_id || options.evolution || "oevo-v0-0-0-01-evolution");
  const order = normalizeOrderNumber(options.order);
  const verbObject = normalizeSlug(options.verbObject || options.title || options.name || "task");
  return `otask-${evolutionId}-${order}-${verbObject}`;
}

function buildViberPlanId(options = {}) {
  const appSlug = normalizeSlug(options.appSlug || options.app || options.slug || "app");
  const dateStamp = normalizeDateStamp(options.date);
  const order = normalizeOrderNumber(options.order);
  const slug = normalizeSlug(options.slug || options.title || options.name || options.label || "plan");
  return `vplan-${appSlug}-${dateStamp}-${order}-${slug}`;
}

function buildViberVersionId(options = {}) {
  const appSlug = normalizeSlug(options.appSlug || options.app || options.slug || "app");
  const versionCore = normalizeVersionCore(options.version || options.version_id || "0.0.0");
  const label = normalizeSlug(options.label || options.title || options.name || "release");
  return `${appSlug}-v${versionCore}-${label}`;
}

function buildViberEvolutionId(options = {}) {
  const appSlug = normalizeSlug(options.appSlug || options.app || options.slug || "app");
  const versionSlug = normalizeVersionSlug(options.version || options.version_slug || options.version_id || "v0.0.0");
  const order = normalizeOrderNumber(options.order);
  const category = normalizeEvolutionCategory(options.category || options.type || "boundary-stabilization");
  const slug = normalizeSlug(options.slug || options.title || options.name || options.label || "evolution");
  return `vevo-${appSlug}-${versionSlug}-${order}-${category}-${slug}`;
}

function buildViberTaskId(options = {}) {
  const appSlug = normalizeSlug(options.appSlug || options.app || options.slug || "app");
  const evolutionId = normalizeSlug(options.evolutionId || options.evolution_id || options.evolution || "vevo-app-v0-0-0-01-boundary-stabilization-evolution");
  const order = normalizeOrderNumber(options.order);
  const workstream = normalizeTaskWorkstream(options.workstream || options.stream || "frontend");
  const verbObject = normalizeSlug(options.verbObject || options.title || options.name || "task");
  return `vtask-${appSlug}-${evolutionId}-${order}-${workstream}-${verbObject}`;
}

function validateNamingId(idOrInput, options = {}) {
  const input = typeof idOrInput === "object" && idOrInput !== null ? { ...idOrInput } : { id: idOrInput };
  const type = String(options.type || input.type || "").trim().toLowerCase();
  const track = String(options.track || input.track || "").trim().toLowerCase();
  const id = String(input.id || input.generated_id || input.generatedId || "").trim();
  const expected = buildExpectedId(type, track, { ...options, ...input });
  const rulesApplied = [];
  if (track === "owner" || track === "framework_owner") rulesApplied.push("owner-track-id-format");
  if (track === "vibe" || track === "vibe_app_developer") rulesApplied.push("viber-track-id-format");
  if (type === "plan") rulesApplied.push("plan-id-format");
  if (type === "version") rulesApplied.push("version-id-format");
  if (type === "evolution") rulesApplied.push("evolution-id-format");
  if (type === "task") rulesApplied.push("task-id-format");
  const errors = [];
  if (!type) errors.push("Missing naming type.");
  if (!track) errors.push("Missing naming track.");
  if (!id) errors.push("Missing naming id.");
  if (!expected) errors.push("Insufficient inputs to build an expected naming id.");
  if (expected && id !== expected) errors.push(`Expected ${expected} but received ${id || "(empty)"}.`);
  const valid = errors.length === 0;
  return {
    valid,
    id,
    expected_id: expected || null,
    normalized_id: expected || id || null,
    rules_applied: rulesApplied,
    errors
  };
}

function explainNamingRules(options = {}) {
  const track = canonicalTrack(String(options.track || "").trim().toLowerCase());
  const type = String(options.type || "").trim().toLowerCase() || null;
  const examples = buildNamingExamples(track, type);
  const rules = [
    "IDs are lowercase and deterministic.",
    "Titles may change later, but generated IDs stay stable after creation.",
    "Owner and Viber IDs never collide because the track prefix stays explicit.",
    "Viber IDs always include the app slug.",
    "Order numbers are two-digit, zero-padded positions.",
    "Track- and type-specific suffixes are normalized to kebab-case."
  ];
  return {
    track,
    type,
    rules,
    examples
  };
}

function buildExpectedId(type, track, options) {
  const normalizedTrack = canonicalTrack(track);
  const normalizedType = String(type || "").trim().toLowerCase();
  if (normalizedTrack === "framework_owner") {
    if (normalizedType === "plan") return buildOwnerPlanId(options);
    if (normalizedType === "version") return buildOwnerVersionId(options);
    if (normalizedType === "evolution") return buildOwnerEvolutionId(options);
    if (normalizedType === "task") return buildOwnerTaskId(options);
  }
  if (normalizedTrack === "vibe_app_developer") {
    if (normalizedType === "plan") return buildViberPlanId(options);
    if (normalizedType === "version") return buildViberVersionId(options);
    if (normalizedType === "evolution") return buildViberEvolutionId(options);
    if (normalizedType === "task") return buildViberTaskId(options);
  }
  return null;
}

function buildNamingExamples(track, type) {
  const canonical = canonicalTrack(track);
  const sampleDate = "20260522";
  const sampleVersion = "v0.2.0";
  const sampleEvolution = canonical === "framework_owner"
    ? buildOwnerEvolutionId({ version: sampleVersion, order: 3, title: "Validation Gate" })
    : buildViberEvolutionId({ appSlug: "booking", version: sampleVersion, order: 3, category: "safety_quality", title: "Validation Gate" });
  const ownerExamples = {
    plan: buildOwnerPlanId({ date: sampleDate, order: 1, title: "Planner Readiness" }),
    version: buildOwnerVersionId({ version: sampleVersion, title: "Foundation" }),
    evolution: sampleEvolution,
    task: buildOwnerTaskId({ evolutionId: sampleEvolution, order: 1, title: "Build Booking Form" })
  };
  const vibeExamples = {
    plan: buildViberPlanId({ appSlug: "booking", date: sampleDate, order: 1, title: "Planner Readiness" }),
    version: buildViberVersionId({ appSlug: "booking", version: sampleVersion, title: "Foundation" }),
    evolution: buildViberEvolutionId({ appSlug: "booking", version: sampleVersion, order: 3, category: "safety_quality", title: "Validation Gate" }),
    task: buildViberTaskId({
      appSlug: "booking",
      evolutionId: "vevo-booking-v0-2-0-03-safety-quality-validation-gate",
      order: 1,
      workstream: "frontend",
      title: "Build Booking Form"
    })
  };
  const source = canonical === "framework_owner" ? ownerExamples : vibeExamples;
  if (type && source[type]) {
    return [source[type]];
  }
  return [source.plan, source.version, source.evolution, source.task];
}

function canonicalTrack(track) {
  const value = String(track || "").trim().toLowerCase();
  if (["owner", "framework_owner", "kvdf"].includes(value)) return "framework_owner";
  if (["vibe", "app", "vibe_app_developer", "developer"].includes(value)) return "vibe_app_developer";
  return value || "framework_owner";
}

function buildNamingValidationReport() {
  const checks = [
    validateNamingId({ id: buildOwnerPlanId({ date: "20260522", order: 1, title: "Planner Readiness" }), track: "owner", type: "plan", date: "20260522", order: 1, title: "Planner Readiness" }, { track: "owner", type: "plan", date: "20260522", order: 1, title: "Planner Readiness" }),
    validateNamingId({ id: buildOwnerVersionId({ version: "v0.4.0", title: "Foundation" }), track: "owner", type: "version", version: "v0.4.0", title: "Foundation" }, { track: "owner", type: "version", version: "v0.4.0", title: "Foundation" }),
    validateNamingId({ id: buildOwnerEvolutionId({ version: "v0.4.0", order: 3, title: "Validation Gate" }), track: "owner", type: "evolution", version: "v0.4.0", order: 3, title: "Validation Gate" }, { track: "owner", type: "evolution", version: "v0.4.0", order: 3, title: "Validation Gate" }),
    validateNamingId({ id: buildOwnerTaskId({ evolutionId: buildOwnerEvolutionId({ version: "v0.4.0", order: 3, title: "Validation Gate" }), order: 1, title: "Build Booking Form" }), track: "owner", type: "task", evolutionId: buildOwnerEvolutionId({ version: "v0.4.0", order: 3, title: "Validation Gate" }), order: 1, title: "Build Booking Form" }, { track: "owner", type: "task", evolutionId: buildOwnerEvolutionId({ version: "v0.4.0", order: 3, title: "Validation Gate" }), order: 1, title: "Build Booking Form" }),
    validateNamingId({ id: buildViberPlanId({ appSlug: "booking", date: "20260522", order: 1, title: "Planner Readiness" }), track: "vibe", type: "plan", appSlug: "booking", date: "20260522", order: 1, title: "Planner Readiness" }, { track: "vibe", type: "plan", appSlug: "booking", date: "20260522", order: 1, title: "Planner Readiness" }),
    validateNamingId({ id: buildViberVersionId({ appSlug: "booking", version: "v0.1.0", title: "Foundation" }), track: "vibe", type: "version", appSlug: "booking", version: "v0.1.0", title: "Foundation" }, { track: "vibe", type: "version", appSlug: "booking", version: "v0.1.0", title: "Foundation" }),
    validateNamingId({ id: buildViberEvolutionId({ appSlug: "booking", version: "v0.2.0", order: 3, category: "safety_quality", title: "Validation Gate" }), track: "vibe", type: "evolution", appSlug: "booking", version: "v0.2.0", order: 3, category: "safety_quality", title: "Validation Gate" }, { track: "vibe", type: "evolution", appSlug: "booking", version: "v0.2.0", order: 3, category: "safety_quality", title: "Validation Gate" }),
    validateNamingId({ id: buildViberTaskId({ appSlug: "booking", evolutionId: "vevo-booking-v0-2-0-03-safety-quality-validation-gate", order: 1, workstream: "frontend", title: "Build Booking Form" }), track: "vibe", type: "task", appSlug: "booking", evolutionId: "vevo-booking-v0-2-0-03-safety-quality-validation-gate", order: 1, workstream: "frontend", title: "Build Booking Form" }, { track: "vibe", type: "task", appSlug: "booking", evolutionId: "vevo-booking-v0-2-0-03-safety-quality-validation-gate", order: 1, workstream: "frontend", title: "Build Booking Form" })
  ];
  const blocked = checks.filter((item) => !item.valid);
  return {
    report_type: "kvdf_naming_validation",
    status: blocked.length ? "blocked" : "pass",
    checks,
    total_checks: checks.length,
    passed_checks: checks.length - blocked.length,
    blocked_checks: blocked.length,
    rules: explainNamingRules({ track: "owner" }).rules,
    next_action: "Use kvdf naming preview --track <owner|vibe> --type <plan|version|evolution|task> --json."
  };
}

module.exports = {
  normalizeSlug,
  normalizeDateStamp,
  normalizeVersionSlug,
  normalizeOrderNumber,
  normalizeEvolutionCategory,
  normalizeTaskWorkstream,
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
  buildNamingValidationReport
};
