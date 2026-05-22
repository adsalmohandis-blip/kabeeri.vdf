const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");

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

const NAMING_POLICY = "kvdf_naming_governance_v1";
const NAMING_RUNTIME_FILES = [
  { file: ".kabeeri/planner.json", source_kind: "planner" },
  { file: ".kabeeri/evolution.json", source_kind: "evolution" },
  { file: ".kabeeri/tasks.json", source_kind: "tasks" },
  { file: ".kabeeri/task_trash.json", source_kind: "task_trash" },
  { file: ".kabeeri/handoff/packages.json", source_kind: "handoff" }
];
const NAMING_REPORT_DIRECTORIES = [
  { dir: "docs/reports", source_kind: "report" },
  { dir: ".kabeeri/reports", source_kind: "report" }
];
const NAMING_SKIP_KEYS = new Set([
  "memory",
  "source_of_truth",
  "resume_steps",
  "required_inputs",
  "expected_outputs",
  "do_not_change",
  "verification_commands",
  "notes"
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

function normalizeVersionForNaming(version) {
  const core = normalizeVersionCore(version);
  const parts = String(core || "").split(".").filter(Boolean);
  if (parts.length === 2 && parts.every((part) => /^\d+$/.test(part))) {
    return `${core}.0`;
  }
  return core;
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

function buildNamingIdentity(options = {}) {
  const objectType = String(options.objectType || options.object_type || "").trim().toLowerCase();
  const normalizedTrack = canonicalTrack(options.track || options.mode || options.planner_mode || options.delivery_mode || "framework_owner");
  const title = String(options.title || options.name || options.label || "").trim();
  const slug = normalizeSlug(options.slug || title || options.id || options.legacyId || options.legacy_id || objectType || "item");
  const legacyId = String(options.legacyId || options.legacy_id || options.id || options.plan_id || options.version_id || options.evolution_id || options.task_id || "").trim();
  const appSlug = normalizeSlug(options.appSlug || options.app_slug || options.app || "");
  const order = normalizeOrderNumber(options.order || options.index || 1);
  const version = normalizeVersionForNaming(options.version || options.version_id || options.version_slug || options.versionSlug || "v0.0.0");
  const category = normalizeEvolutionCategory(options.category || options.evolution_category || options.type || "");
  const workstream = normalizeTaskWorkstream(options.workstream || options.stream || "");
  let normalizedId = legacyId || slug;
  if (objectType === "plan") {
    normalizedId = normalizedTrack === "vibe_app_developer"
      ? buildViberPlanId({ appSlug: appSlug || options.app || "app", date: options.date || options.generatedAt || options.createdAt || options.materializedAt, order, slug, title })
      : buildOwnerPlanId({ date: options.date || options.generatedAt || options.createdAt || options.materializedAt, order, slug, title });
  } else if (objectType === "version") {
    normalizedId = normalizedTrack === "vibe_app_developer"
      ? buildViberVersionId({ appSlug: appSlug || options.app || "app", version, label: slug || title || legacyId || "release" })
      : buildOwnerVersionId({ version, label: slug || title || legacyId || "release" });
  } else if (objectType === "evolution") {
    normalizedId = normalizedTrack === "vibe_app_developer"
      ? buildViberEvolutionId({ appSlug: appSlug || options.app || "app", version, order, category, slug, title })
      : buildOwnerEvolutionId({ version, order, slug, title });
  } else if (objectType === "task") {
    normalizedId = normalizedTrack === "vibe_app_developer"
      ? buildViberTaskId({ appSlug: appSlug || options.app || "app", evolutionId: options.evolutionId || options.evolution_id || options.evolution || legacyId || "evolution", order, workstream, verbObject: slug || title })
      : buildOwnerTaskId({ evolutionId: options.evolutionId || options.evolution_id || options.evolution || legacyId || "evolution", order, verbObject: slug || title });
  }
  const normalized = String(normalizedId || "").trim() || slug || legacyId || objectType || "item";
  const preservedLegacyId = legacyId && legacyId !== normalized ? legacyId : null;
  return {
    id: normalized,
    normalized_id: normalized,
    legacy_id: preservedLegacyId,
    title,
    slug,
    track: normalizedTrack,
    object_type: objectType || "item",
    naming_policy: NAMING_POLICY,
    app_slug: appSlug || null,
    workstream: objectType === "task" ? workstream : undefined,
    category: objectType === "evolution" ? category : undefined
  };
}

function attachNamingIdentity(record = {}, options = {}) {
  const identity = buildNamingIdentity({ ...options, legacy_id: options.legacy_id || record.legacy_id || record.id || record.plan_id || record.version_id || record.evolution_id || record.task_id });
  return {
    ...record,
    ...identity
  };
}

function buildNamingValidationReport(options = {}) {
  const scan = scanNamingRuntimeState(options);
  const invalidIds = [];
  const missingNormalizedIds = [];
  const legacyOnly = [];
  const duplicates = [];
  const crossTrackCollisions = [];
  const recommendations = [];
  const identifierMap = new Map();

  for (const record of scan.records) {
    const analysis = analyzeNamingRecord(record);
    record.analysis = analysis;
    if (analysis.invalid) {
      invalidIds.push(toNamingIssueItem(record, analysis, "invalid"));
    }
    if (analysis.missing_normalized_id) {
      missingNormalizedIds.push(toNamingIssueItem(record, analysis, "missing_normalized_id"));
    }
    if (analysis.legacy_only) {
      legacyOnly.push(toNamingIssueItem(record, analysis, "legacy_only"));
    }

    for (const identifier of analysis.identifiers) {
      if (!identifier) continue;
      if (!identifierMap.has(identifier)) identifierMap.set(identifier, []);
      identifierMap.get(identifier).push({
        record,
        track: record.track || "framework_owner",
        object_type: record.object_type || "item",
        source_file: record.source_file,
        source_path: record.source_path
      });
    }
  }

  for (const [identifier, grouped] of identifierMap.entries()) {
    const uniqueTracks = new Set(grouped.map((entry) => entry.track || "framework_owner"));
    if (grouped.length > 1) {
      if (uniqueTracks.size > 1) {
        crossTrackCollisions.push({
          id: identifier,
          tracks: Array.from(uniqueTracks),
          count: grouped.length,
          records: grouped.map(({ record, source_file, source_path }) => ({
            id: record.normalized_id || record.raw_id || record.legacy_id || null,
            legacy_id: record.legacy_id || null,
            normalized_id: record.normalized_id || null,
            track: record.track || "framework_owner",
            object_type: record.object_type || "item",
            title: record.title || "",
            source_file,
            source_path
          }))
        });
      } else {
        duplicates.push({
          id: identifier,
          track: Array.from(uniqueTracks)[0] || "framework_owner",
          count: grouped.length,
          records: grouped.map(({ record, source_file, source_path }) => ({
            id: record.normalized_id || record.raw_id || record.legacy_id || null,
            legacy_id: record.legacy_id || null,
            normalized_id: record.normalized_id || null,
            track: record.track || "framework_owner",
            object_type: record.object_type || "item",
            title: record.title || "",
            source_file,
            source_path
          }))
        });
      }
    }
  }

  if (scan.records.length === 0) {
    recommendations.push("No naming-bearing runtime objects were found locally. Create or materialize planner, evolution, or task state before relying on naming validation.");
  } else {
    if (missingNormalizedIds.length) recommendations.push("Backfill normalized_id fields for legacy-only objects while preserving legacy_id values.");
    if (invalidIds.length) recommendations.push("Fix invalid IDs before materializing or publishing dependent runtime state.");
    if (duplicates.length || crossTrackCollisions.length) recommendations.push("Resolve duplicate and cross-track ID collisions before release or handoff.");
    if (!invalidIds.length && !duplicates.length && !crossTrackCollisions.length && !missingNormalizedIds.length && !legacyOnly.length) {
      recommendations.push("Naming records are clean. Continue with the current workflow.");
    }
  }

  const status = invalidIds.length || duplicates.length || crossTrackCollisions.length
    ? "blocked"
    : (scan.records.length === 0 || missingNormalizedIds.length || legacyOnly.length ? "warning" : "pass");

  return {
    report_type: "kvdf_naming_validation",
    status,
    scanned: scan.scanned,
    invalid_ids: invalidIds,
    missing_normalized_ids: missingNormalizedIds,
    legacy_only: legacyOnly,
    duplicates,
    cross_track_collisions: crossTrackCollisions,
    recommendations,
    next_action: status === "blocked"
      ? "Resolve invalid IDs and collisions before continuing naming-governed planning."
      : "Review the migration plan and backfill normalized IDs where needed."
  };
}

function buildNamingMigrationPlan(options = {}) {
  const scan = scanNamingRuntimeState(options);
  const changes = [];
  const warnings = [];

  for (const record of scan.records) {
    const analysis = analyzeNamingRecord(record);
    if (!analysis.legacy_only && !analysis.missing_normalized_id && !analysis.invalid) continue;
    const suggestedIdentity = buildNamingIdentity({
      objectType: record.object_type || "item",
      track: record.track || "framework_owner",
      title: record.title || record.goal || record.name || "",
      slug: record.slug || record.title || record.name || record.goal || "",
      appSlug: record.app_slug || record.app || "",
      version: record.version || record.version_id || record.version_slug || record.versionSlug || "",
      order: record.order || record.index || 1,
      category: record.category || record.evolution_category || "",
      workstream: record.workstream || record.stream || "",
      legacy_id: record.legacy_id || record.raw_id || record.id || record.plan_id || record.version_id || record.evolution_id || record.task_id || record.change_id || "",
      id: record.raw_id || record.legacy_id || record.normalized_id || record.id || ""
    });
    changes.push({
      source_file: record.source_file,
      source_path: record.source_path,
      object_type: record.object_type || "item",
      track: record.track || "framework_owner",
      title: record.title || "",
      current_id: record.normalized_id || record.raw_id || record.legacy_id || null,
      legacy_id: record.legacy_id || null,
      suggested_normalized_id: suggestedIdentity.normalized_id || analysis.expected_id || null,
      action: record.normalized_id ? "retain" : "add_normalized_id",
      notes: analysis.invalid
        ? ["Review malformed or legacy-only IDs before migrating."]
        : ["Add normalized_id beside the preserved legacy_id."]
    });
  }

  if (changes.length === 0) {
    warnings.push("No legacy or missing-normalized records were found in the local runtime state.");
  } else {
    warnings.push("Dry-run only. Review the suggested normalized IDs before applying any migration.");
  }

  return {
    report_type: "kvdf_naming_migration_plan",
    dry_run: true,
    changes,
    warnings,
    next_action: "Review migration plan before applying any changes."
  };
}

function scanNamingRuntimeState(options = {}) {
  const records = [];
  const scanned = {
    plans: 0,
    versions: 0,
    evolutions: 0,
    tasks: 0,
    reports: 0
  };
  for (const entry of NAMING_RUNTIME_FILES) {
    const data = readLocalJsonFileIfExists(entry.file);
    if (!data) continue;
    scanNamingValue(data, {
      source_file: entry.file,
      source_kind: entry.source_kind,
      object_type: null,
      track: null,
      app_slug: null
    }, records, scanned);
  }
  for (const directory of NAMING_REPORT_DIRECTORIES) {
    for (const file of listLocalJsonFiles(directory.dir)) {
      const data = readLocalJsonFileIfExists(file);
      if (!data) continue;
      scanned.reports += 1;
      scanNamingValue(data, {
        source_file: file,
        source_kind: directory.source_kind,
        object_type: inferObjectTypeFromSourceFile(file),
        track: null,
        app_slug: null
      }, records, scanned);
    }
  }
  return { records, scanned };
}

function scanNamingValue(value, context = {}, records = [], scanned = {}) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      scanNamingValue(value[index], {
        ...context,
        path: [...(context.path || []), String(index)]
      }, records, scanned);
    }
    return records;
  }
  if (!value || typeof value !== "object") return records;

  const objectType = inferNamingObjectType(value, context);
  const track = inferNamingTrack(value, context, objectType);
  const appSlug = inferNamingAppSlug(value, context);
  const record = createNamingRecord(value, {
    ...context,
    object_type: objectType,
    track,
    app_slug: appSlug
  });

  if (record) {
    records.push(record);
    if (record.object_type === "plan") scanned.plans += 1;
    if (record.object_type === "version") scanned.versions += 1;
    if (record.object_type === "evolution") scanned.evolutions += 1;
    if (record.object_type === "task") scanned.tasks += 1;
  }

  for (const [key, child] of Object.entries(value)) {
    if (NAMING_SKIP_KEYS.has(key)) continue;
    scanNamingValue(child, {
      ...context,
      source_file: context.source_file,
      source_kind: context.source_kind,
      object_type: inferObjectTypeFromKey(key, objectType),
      track: inferNamingTrack(value, { ...context, key }, objectType),
      app_slug: inferNamingAppSlug(value, context),
      path: [...(context.path || []), key]
    }, records, scanned);
  }
  return records;
}

function createNamingRecord(value, context = {}) {
  const objectType = String(context.object_type || value.object_type || "").trim().toLowerCase();
  const rawId = firstString(
    value,
    [specificIdKeyForType(objectType), "id", "change_id", "package_id", "handoff_id", "report_id"]
  );
  const normalizedId = firstString(value, ["normalized_id"]);
  const legacyId = firstString(value, ["legacy_id"]) || (!normalizedId ? rawId : null);
  const title = firstString(value, ["title", "name", "goal", "label"]);
  const slug = firstString(value, ["slug"]);
  const version = firstString(value, ["version", "version_id", "version_slug", "versionSlug"]);
  const order = firstString(value, ["order", "index", "position", "sequence"]);
  const category = firstString(value, ["category", "evolution_category", "phase", "stage", "type"]);
  const workstream = firstString(value, ["workstream", "stream"]);
  const appSlug = firstString(value, ["app_slug", "appSlug", "app", "workspace_slug"]);
  const track = context.track || inferNamingTrack(value, context, objectType);
  const candidate = {
    source_file: context.source_file || "",
    source_path: Array.isArray(context.path) ? context.path.join(".") : "",
    source_kind: context.source_kind || "runtime",
    object_type: objectType || inferNamingObjectType(value, context) || "item",
    track: canonicalTrack(track),
    app_slug: appSlug || null,
    title: title || "",
    slug: slug || "",
    raw_id: rawId || null,
    normalized_id: normalizedId || null,
    legacy_id: legacyId || null,
    version: version || null,
    order: order || null,
    category: category || null,
    workstream: workstream || null,
    record: value
  };
  if (!candidate.object_type || candidate.object_type === "item") {
    if (!candidate.raw_id && !candidate.normalized_id && !candidate.legacy_id) return null;
  }
  if (candidate.object_type === "item" && !candidate.raw_id && !candidate.normalized_id && !candidate.legacy_id) return null;
  return candidate;
}

function analyzeNamingRecord(record) {
  const identifiers = [];
  const expectedId = buildExpectedId(record.object_type, record.track, {
    title: record.title || "",
    slug: record.slug || record.title || "",
    appSlug: record.app_slug || "",
    version: record.version || "",
    order: record.order || 1,
    category: record.category || "",
    workstream: record.workstream || "",
    evolutionId: record.record && (record.record.evolution_id || record.record.evolutionId || record.record.change_id || ""),
    evolution_id: record.record && (record.record.evolution_id || record.record.evolutionId || record.record.change_id || ""),
    legacy_id: record.legacy_id || record.raw_id || ""
  });
  const effectiveId = record.normalized_id || record.raw_id || record.legacy_id || "";
  if (record.normalized_id) identifiers.push(record.normalized_id);
  if (record.raw_id && record.raw_id !== record.normalized_id) identifiers.push(record.raw_id);
  if (record.legacy_id && record.legacy_id !== record.raw_id && record.legacy_id !== record.normalized_id) identifiers.push(record.legacy_id);

  const rawIsWellFormed = isLikelyLegacyId(effectiveId);
  const hasNormalized = Boolean(record.normalized_id);
  const hasLegacy = Boolean(record.legacy_id);
  const missingNormalizedId = !hasNormalized && Boolean(effectiveId);
  let legacyOnly = false;
  let invalid = false;
  let message = null;

  if (!effectiveId) {
    invalid = true;
    message = `Missing naming id for ${record.object_type || "item"} in ${record.source_file || "unknown source"}.`;
  } else if (hasNormalized) {
    if (expectedId && record.normalized_id !== expectedId) {
      invalid = true;
      message = `Normalized id ${record.normalized_id} does not match expected ${expectedId}.`;
    } else if (!rawIsWellFormed && record.raw_id) {
      invalid = true;
      message = `Raw id ${record.raw_id} is not valid naming format.`;
    }
  } else if (hasLegacy || rawIsWellFormed) {
    legacyOnly = true;
    if (expectedId && record.raw_id && record.raw_id !== expectedId && !rawIsWellFormed) {
      invalid = true;
      message = `Legacy id ${record.raw_id} is malformed and cannot be migrated safely.`;
    }
  } else {
    invalid = true;
    message = `ID ${effectiveId} is not valid naming format.`;
  }

  if (!hasNormalized && !rawIsWellFormed && effectiveId) {
    invalid = true;
    message = message || `ID ${effectiveId} is not valid naming format.`;
  }

  if (!hasNormalized && (hasLegacy || rawIsWellFormed || effectiveId)) legacyOnly = legacyOnly || Boolean(effectiveId);

  return {
    invalid,
    missing_normalized_id: missingNormalizedId,
    legacy_only: legacyOnly && !hasNormalized,
    expected_id: expectedId || null,
    identifiers,
    message,
    valid: !invalid
  };
}

function toNamingIssueItem(record, analysis, reason) {
  return {
    reason,
    id: record.normalized_id || record.raw_id || record.legacy_id || null,
    normalized_id: record.normalized_id || null,
    legacy_id: record.legacy_id || null,
    expected_id: analysis.expected_id || null,
    track: record.track || "framework_owner",
    object_type: record.object_type || "item",
    title: record.title || "",
    source_file: record.source_file || "",
    source_path: record.source_path || ""
  };
}

function readLocalJsonFileIfExists(relativePath) {
  const fullPath = path.join(repoRoot(), relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return null;
  }
}

function listLocalJsonFiles(relativeDir) {
  const root = path.join(repoRoot(), relativeDir);
  if (!fs.existsSync(root)) return [];
  const output = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        output.push(path.relative(repoRoot(), full).replace(/\\/g, "/"));
      }
    }
  };
  walk(root);
  return output.sort();
}

function inferObjectTypeFromSourceFile(sourceFile = "") {
  const normalized = String(sourceFile || "").toLowerCase();
  if (normalized.includes("planner")) return "plan";
  if (normalized.includes("evolution")) return "evolution";
  if (normalized.includes("task_trash") || normalized.includes("tasks")) return "task";
  return null;
}

function inferObjectTypeFromKey(key, parentType = null) {
  const normalized = String(key || "").trim().toLowerCase();
  if (["plans", "plan", "current_plan", "next_plan", "recommended_plan", "materialized_plan"].includes(normalized)) return "plan";
  if (["versions", "version", "current_version", "next_version", "version_plan"].includes(normalized)) return "version";
  if (["changes", "change", "evolutions", "evolution", "current_evolution", "next_evolution", "recommended_evolution", "materialized_evolution"].includes(normalized)) return "evolution";
  if (["tasks", "task", "task_punch", "task_punches", "trash", "current_task", "materialized_task"].includes(normalized)) return "task";
  return null;
}

function inferNamingObjectType(value, context = {}) {
  if (value && typeof value === "object") {
    const explicit = String(value.object_type || value.type || "").trim().toLowerCase();
    if (["plan", "version", "evolution", "task"].includes(explicit)) return explicit;
  }
  return inferObjectTypeFromKey(context.key || context.current_key || context.path && context.path[context.path.length - 1], context.object_type)
    || context.object_type
    || null;
}

function inferNamingTrack(value, context = {}, objectType = null) {
  const explicit = String((value && value.track) || context.track || "").trim().toLowerCase();
  if (explicit === "vibe" || explicit === "vibe_app_developer") return "vibe_app_developer";
  if (explicit === "owner" || explicit === "framework_owner" || explicit === "kvdf") return "framework_owner";
  if (value && (value.app_slug || value.appSlug || value.app)) return "vibe_app_developer";
  if (context.source_file && String(context.source_file).includes("task_trash")) return "framework_owner";
  return objectType === "task" && (value && (value.app_slug || value.appSlug || value.app)) ? "vibe_app_developer" : "framework_owner";
}

function inferNamingAppSlug(value, context = {}) {
  const appSlug = firstString(value, ["app_slug", "appSlug", "app", "workspace_slug", "app_id"]);
  return appSlug || context.app_slug || null;
}

function firstString(value, keys = []) {
  if (!value || typeof value !== "object") return null;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    const candidate = value[key];
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return null;
}

function specificIdKeyForType(objectType) {
  switch (String(objectType || "").trim().toLowerCase()) {
    case "plan":
      return "plan_id";
    case "version":
      return "version_id";
    case "evolution":
      return "evolution_id";
    case "task":
      return "task_id";
    default:
      return "id";
  }
}

function isLikelyLegacyId(value) {
  const normalized = String(value || "").trim();
  return Boolean(normalized) && /^[a-z0-9][a-z0-9-]*$/.test(normalized) && !/\s/.test(normalized);
}

module.exports = {
  normalizeSlug,
  normalizeDateStamp,
  normalizeVersionSlug,
  normalizeVersionForNaming,
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
  buildNamingIdentity,
  attachNamingIdentity,
  validateNamingId,
  explainNamingRules,
  buildNamingValidationReport,
  scanNamingRuntimeState,
  buildNamingMigrationPlan
};
