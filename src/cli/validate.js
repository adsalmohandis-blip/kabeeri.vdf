const { fileExists, listDirectories, listFiles, readJsonFile, readTextFile } = require("./fs_utils");
const { defaultWorkstreams } = require("./workspace");

function validateRepository(scope) {
  scope = normalizeScope(scope || "all");
  const lines = [];
  let ok = true;

  function pass(message) {
    lines.push(`OK   ${message}`);
  }

  function fail(message) {
    ok = false;
    lines.push(`FAIL ${message}`);
  }

  function checkFile(path) {
    if (fileExists(path)) pass(path);
    else fail(`${path} is missing`);
  }

  if (scope === "all" || scope === "core") {
    checkFile("README.md");
    checkFile("ROADMAP.md");
    checkFile("CHANGELOG.md");
    checkFile("cli/CLI_COMMAND_REFERENCE.md");
  }

  if (scope === "all" || scope === "schemas") {
    for (const file of listFiles("schemas", ".json")) validateJson(file, pass, fail);
  }

  if (scope === "all" || scope === "blueprint" || scope === "blueprints") {
    validateProductBlueprintCatalog(pass, fail);
  }

  if (scope === "all" || scope === "data-design" || scope === "database-design") {
    validateDataDesignCatalog(pass, fail);
  }

  if (scope === "all" || scope === "ui-design" || scope === "frontend-design") {
    validateUiDesignCatalog(pass, fail);
  }

  if (scope === "all" || scope === "foldering" || scope === "structure") {
    validateRepositoryFoldering(pass, fail);
  }

  if (scope === "all" || scope === "runtime-schemas") {
    validateRuntimeSchemas(pass, fail);
  }

  if (scope === "all" || scope === "generators") {
    for (const file of listFiles("generators", ".json")) validateJson(file, pass, fail);
  }

  if (scope === "all" || scope === "prompt-packs") {
    const manifests = listFiles("prompt_packs", "prompt_pack_manifest.json", true);
    if (manifests.length === 0) fail("No prompt pack manifests found");
    for (const file of manifests) validateJson(file, pass, fail);
  }

  if (scope === "all" || scope === "plans") {
    for (const file of [
      "platform_integration/milestones_and_issues.v3.0.0.json",
      "multi_ai_governance/milestones_and_issues.v4.0.0.json",
      "project_intelligence/milestones_and_issues.v5.0.0.json"
    ]) {
      if (fileExists(file)) validatePlan(file, pass, fail);
    }
  }

  if (scope === "all" || scope === "workspace") {
    if (fileExists(".kabeeri")) {
      for (const file of listFiles(".kabeeri", ".json", true)) validateJson(file, pass, fail);
      validateWorkspaceGovernance(pass, fail);
      pass(".kabeeri workspace present");
    } else {
      lines.push("WARN .kabeeri workspace missing; run `kvdf init` when starting a real project");
    }
  }

  if (scope === "task" || scope === "tasks") {
    validateWorkspaceFile(".kabeeri/tasks.json", "tasks", validateTaskRecords, pass, fail);
  }

  if (scope === "acceptance") {
    validateWorkspaceFile(".kabeeri/acceptance.json", "records", validateAcceptanceRecords, pass, fail);
  }

  if (scope === "policy" || scope === "policies") {
    validatePolicyState(pass, fail);
  }

  if (scope === "workstream" || scope === "workstreams") {
    if (fileExists(".kabeeri/workstreams.json")) validateWorkspaceFile(".kabeeri/workstreams.json", "workstreams", validateWorkstreamRecords, pass, fail);
    else validateWorkstreamRecords(defaultWorkstreams(), pass, fail);
    validateWorkstreamGovernance(pass, fail);
  }

  if (scope === "business") {
    validateWorkspaceFile(".kabeeri/customer_apps.json", "apps", validateCustomerAppRecords, pass, fail);
    validateWorkspaceFile(".kabeeri/features.json", "features", validateFeatureRecords, pass, fail);
    validateWorkspaceFile(".kabeeri/journeys.json", "journeys", validateJourneyRecords, pass, fail);
  }

  if (scope === "questionnaire" || scope === "questionnaires" || scope === "coverage") {
    validateWorkspaceFile(".kabeeri/questionnaires/answers.json", "answers", validateQuestionnaireAnswers, pass, fail);
    validateWorkspaceFile(".kabeeri/questionnaires/coverage_matrix.json", "areas", validateCoverageAreas, pass, fail);
  }

  if (scope === "vibe" || scope === "capture" || scope === "captures") {
    validateWorkspaceFile(".kabeeri/interactions/post_work_captures.json", "captures", validatePostWorkCaptures, pass, fail);
  }

  if (scope === "agile") {
    validateWorkspaceFile(".kabeeri/agile.json", null, validateAgileState, pass, fail);
  }

  if (scope === "structured") {
    validateWorkspaceFile(".kabeeri/structured.json", null, validateStructuredState, pass, fail);
  }

  if (scope === "dashboard" || scope === "dashboard-ux") {
    validateWorkspaceFile(".kabeeri/dashboard/ux_audits.json", "audits", validateDashboardUxAudits, pass, fail);
  }

  if (scope === "design") {
    validateWorkspaceFile(".kabeeri/design_sources/sources.json", "sources", validateDesignSources, pass, fail);
    validateWorkspaceFile(".kabeeri/design_sources/page_specs.json", "pages", validateDesignPages, pass, fail);
    validateWorkspaceFile(".kabeeri/design_sources/component_contracts.json", "components", validateDesignComponents, pass, fail);
    validateWorkspaceFile(".kabeeri/design_sources/visual_reviews.json", "reviews", validateDesignVisualReviews, pass, fail);
  }

  if (scope === "all" || scope === "adr") {
    validateWorkspaceFile(".kabeeri/adr/records.json", "adrs", validateAdrRecords, pass, fail);
  }

  if (scope === "all" || scope === "ai-run" || scope === "ai-runs") {
    validateAiRunHistory(pass, fail);
  }

  if (scope === "all" || scope === "prompt-layer" || scope === "common-prompt") {
    validatePromptLayer(pass, fail);
  }

  if (scope === "app" || scope === "apps" || scope === "routes") {
    validateWorkspaceFile(".kabeeri/customer_apps.json", "apps", validateCustomerAppRecords, pass, fail);
  }

  return { ok, lines };
}

function normalizeScope(scope) {
  const aliases = {
    task: "task",
    tasks: "tasks",
    acceptance: "acceptance",
    "prompt-pack": "prompt-packs",
    prompts: "prompt-packs",
    app: "app",
    apps: "apps",
    routes: "routes",
    workstream: "workstream",
    workstreams: "workstream",
    policy: "policy",
    policies: "policy",
    schema: "schemas",
    schemas: "schemas",
    "runtime-schema": "runtime-schemas",
    "runtime-schemas": "runtime-schemas",
    runtime: "runtime-schemas",
    coverage: "coverage",
    questionnaire: "questionnaire",
    questionnaires: "questionnaire",
    features: "business",
    journeys: "business",
    vibe: "vibe",
    capture: "capture",
    captures: "capture",
    agile: "agile",
    structured: "structured",
    waterfall: "structured",
    delivery: "structured",
    blueprint: "blueprint",
    blueprints: "blueprint",
    data: "data-design",
    database: "data-design",
    "data-design": "data-design",
    "database-design": "data-design",
    "ui-design": "ui-design",
    "frontend-design": "ui-design",
    foldering: "foldering",
    structure: "foldering",
    dashboard: "dashboard",
    "dashboard-ux": "dashboard-ux",
    design: "design",
    designs: "design",
    adr: "adr",
    adrs: "adr",
    "ai-run": "ai-run",
    "ai-runs": "ai-runs",
    airun: "ai-run",
    "prompt-layer": "prompt-layer",
    "common-prompt": "common-prompt"
  };
  return aliases[scope] || scope;
}

function validateProductBlueprintCatalog(pass, fail) {
  const file = "standard_systems/PRODUCT_BLUEPRINT_CATALOG.json";
  checkProductBlueprintFile(file, pass, fail);
}

function validateDataDesignCatalog(pass, fail) {
  const file = "standard_systems/DATA_DESIGN_BLUEPRINT.json";
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  validateJson(file, pass, fail);
  const data = readJsonFile(file);
  const principles = data.universal_principles || [];
  const modules = data.module_patterns || {};
  if (!Array.isArray(principles) || principles.length < 8) fail("data design catalog must include universal principles");
  for (const item of principles) {
    if (!item.key || !item.title || !item.why) fail(`data design principle incomplete: ${item.key || "unknown"}`);
  }
  for (const [key, module] of Object.entries(modules)) {
    if (!Array.isArray(module.entities)) fail(`data design module ${key} missing entities`);
    if (!Array.isArray(module.must_have)) fail(`data design module ${key} missing must_have`);
    if (!Array.isArray(module.indexes)) fail(`data design module ${key} missing indexes`);
  }
  pass(`data design catalog checked: ${principles.length} principles, ${Object.keys(modules).length} modules`);
}

function validateUiDesignCatalog(pass, fail) {
  const file = "standard_systems/UI_UX_DESIGN_BLUEPRINT.json";
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  validateJson(file, pass, fail);
  const data = readJsonFile(file);
  const foundations = data.foundations || [];
  const components = data.component_sets || {};
  const patterns = data.experience_patterns || {};
  if (!Array.isArray(foundations) || foundations.length < 6) fail("UI design catalog must include foundations");
  if (!components.core || !Array.isArray(components.core)) fail("UI design catalog missing core component set");
  for (const [key, pattern] of Object.entries(patterns)) {
    if (!Array.isArray(pattern.recommended_stacks)) fail(`UI pattern ${key} missing recommended_stacks`);
    if (!Array.isArray(pattern.layout_priorities)) fail(`UI pattern ${key} missing layout_priorities`);
    if (!Array.isArray(pattern.seo_geo)) fail(`UI pattern ${key} missing seo_geo`);
  }
  pass(`UI design catalog checked: ${foundations.length} foundations, ${Object.keys(components).length} component sets, ${Object.keys(patterns).length} patterns`);
}

function validateRepositoryFoldering(pass, fail) {
  const file = "standard_systems/REPOSITORY_FOLDERING_MAP.json";
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  validateJson(file, pass, fail);
  const data = readJsonFile(file);
  const groups = data.target_root_groups || [];
  const mappings = data.current_to_target || [];
  const groupKeys = new Set(groups.map((item) => item.group));
  const seenPaths = new Set();
  if (groups.length < 6) fail("foldering map must define stable target root groups");
  if (mappings.length < 10) fail("foldering map must classify current top-level paths");
  for (const item of mappings) {
    if (!groupKeys.has(item.target_group)) fail(`foldering path ${item.path} points to unknown group ${item.target_group}`);
    if (seenPaths.has(item.path)) fail(`foldering path is duplicated: ${item.path}`);
    seenPaths.add(item.path);
  }
  const rootFolders = listDirectories(".").filter((name) => !["node_modules", ".next", "dist", "coverage"].includes(name));
  const allowed = new Set((data.allowed_top_level || []).map((item) => String(item).replace(/\/$/, "")));
  const unknown = rootFolders.filter((name) => !allowed.has(name));
  if (unknown.length) fail(`foldering has unclassified top-level folders: ${unknown.join(", ")}`);
  else pass(`foldering root checked: ${rootFolders.length} folders classified`);
  pass(`foldering map checked: ${groups.length} groups, ${mappings.length} mapped paths`);
}

function checkProductBlueprintFile(file, pass, fail) {
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  validateJson(file, pass, fail);
  const data = readJsonFile(file);
  const blueprints = data.blueprints || [];
  const keys = new Set();
  if (!Array.isArray(blueprints) || blueprints.length === 0) fail("product blueprint catalog must include blueprints");
  for (const item of blueprints) {
    if (!item.key) fail("product blueprint missing key");
    else if (keys.has(item.key)) fail(`duplicate product blueprint key: ${item.key}`);
    else keys.add(item.key);
    for (const field of ["name", "category", "recommended_delivery"]) {
      if (!item[field]) fail(`product blueprint ${item.key || "unknown"} missing ${field}`);
    }
    for (const field of ["channels", "backend_modules", "frontend_pages", "database_entities", "workstreams", "risk_flags"]) {
      if (!Array.isArray(item[field])) fail(`product blueprint ${item.key || "unknown"} ${field} must be an array`);
    }
  }
  pass(`product blueprints checked: ${blueprints.length}`);
}

function validateWorkspaceFile(file, key, validator, pass, fail) {
  if (!fileExists(".kabeeri")) {
    fail(".kabeeri workspace missing; run `kvdf init` first");
    return;
  }
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  validateJson(file, pass, fail);
  const data = key ? safeRead(file, key) : readJsonFile(file);
  validator(data, pass, fail);
}

function validateRuntimeSchemas(pass, fail) {
  const registryFile = "schemas/runtime/schema_registry.json";
  validateJson(registryFile, pass, fail);
  if (!fileExists(registryFile)) return;
  const registry = readJsonFile(registryFile);
  const stateFiles = registry.state_files || [];
  const jsonlFiles = registry.jsonl_files || [];
  let checkedJson = 0;
  let checkedJsonl = 0;

  for (const entry of [...stateFiles, ...jsonlFiles]) {
    if (!entry.schema) fail(`runtime registry entry missing schema: ${entry.path || "unknown"}`);
    else if (!fileExists(entry.schema)) fail(`runtime schema missing: ${entry.schema}`);
    else validateJson(entry.schema, pass, fail);
    if (!entry.path) fail(`runtime registry entry missing path for schema: ${entry.schema || "unknown"}`);
  }

  if (fileExists(".kabeeri")) {
    const mappedJson = new Set(stateFiles.map((entry) => entry.path));
    for (const file of listFiles(".kabeeri", ".json", true)) {
      if (isRuntimeSchemaCoverageExempt(file)) continue;
      if (!mappedJson.has(file)) fail(`runtime JSON state has no schema mapping: ${file}`);
    }
  }

  for (const entry of stateFiles) {
    if (!entry.path || !entry.schema || !fileExists(entry.path)) continue;
    const schema = fileExists(entry.schema) ? readJsonFile(entry.schema) : null;
    const data = readJsonFile(entry.path);
    if (schema) validateDataAgainstSchema(data, schema, entry.path, pass, fail);
    checkedJson += 1;
  }

  for (const entry of jsonlFiles) {
    if (!entry.path || !entry.schema || !fileExists(entry.path)) continue;
    const schema = fileExists(entry.schema) ? readJsonFile(entry.schema) : null;
    const records = readJsonLines(entry.path, fail);
    if (schema) {
      records.forEach((record, index) => validateDataAgainstSchema(record, schema, `${entry.path}:${index + 1}`, pass, fail));
    }
    checkedJsonl += 1;
  }

  pass(`runtime schema registry checked (${stateFiles.length} JSON mappings, ${jsonlFiles.length} JSONL mappings)`);
  pass(`runtime schema validation checked (${checkedJson} JSON files, ${checkedJsonl} JSONL files)`);
}

function isRuntimeSchemaCoverageExempt(file) {
  return file.endsWith(".example.json") || file.includes("/site/") || file.includes("\\site\\");
}

function validateDataAgainstSchema(data, schema, label, pass, fail) {
  const errors = [];
  validateSchemaNode(data, schema, label, errors);
  if (errors.length === 0) pass(`${label} matches ${schema.title || "runtime schema"}`);
  else for (const error of errors) fail(error);
}

function validateSchemaNode(value, schema, pathLabel, errors) {
  if (!schema || typeof schema !== "object") return;
  if (schema.type && !valueMatchesSchemaType(value, schema.type)) {
    errors.push(`${pathLabel} expected ${formatSchemaType(schema.type)} but got ${value === null ? "null" : Array.isArray(value) ? "array" : typeof value}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathLabel} has invalid value: ${value}`);
    return;
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${pathLabel} is below minimum ${schema.minimum}`);
  }
  if (typeof value === "string" && schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`${pathLabel} is shorter than minLength ${schema.minLength}`);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (value[key] === undefined) errors.push(`${pathLabel} missing required property: ${key}`);
    }
    const properties = schema.properties || {};
    for (const [key, childSchema] of Object.entries(properties)) {
      if (value[key] !== undefined) validateSchemaNode(value[key], childSchema, `${pathLabel}.${key}`, errors);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${pathLabel} has fewer than ${schema.minItems} items`);
    if (schema.items) value.forEach((item, index) => validateSchemaNode(item, schema.items, `${pathLabel}[${index}]`, errors));
  }
}

function valueMatchesSchemaType(value, type) {
  const types = Array.isArray(type) ? type : [type];
  return types.some((item) => {
    if (item === "array") return Array.isArray(value);
    if (item === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
    if (item === "integer") return Number.isInteger(value);
    if (item === "number") return typeof value === "number" && Number.isFinite(value);
    if (item === "null") return value === null;
    return typeof value === item;
  });
}

function formatSchemaType(type) {
  return Array.isArray(type) ? type.join("|") : type;
}

function readJsonLines(file, fail) {
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return [];
  }
  try {
    return readTextFile(file)
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    fail(`${file} has invalid jsonl: ${error.message}`);
    return [];
  }
}

function validateQuestionnaireAnswers(records, pass, fail) {
  const ids = new Set();
  for (const record of records) {
    if (!record.answer_id) fail("questionnaire answer missing answer_id");
    else if (ids.has(record.answer_id)) fail(`duplicate answer id: ${record.answer_id}`);
    else ids.add(record.answer_id);
    if (!record.question_id) fail(`answer missing question_id: ${record.answer_id || "unknown"}`);
    if (record.value === undefined) fail(`answer missing value: ${record.answer_id || "unknown"}`);
    if (!record.source_mode) fail(`answer missing source_mode: ${record.answer_id || "unknown"}`);
    if (!Array.isArray(record.area_ids)) fail(`answer area_ids must be an array: ${record.answer_id || "unknown"}`);
  }
  pass(`questionnaire answers checked (${records.length})`);
}

function validateCoverageAreas(records, pass, fail) {
  const allowed = new Set(["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"]);
  for (const record of records) {
    if (!record.area_key) fail("coverage area missing area_key");
    if (!allowed.has(record.status)) fail(`coverage area has invalid status: ${record.area_key || "unknown"} (${record.status})`);
    if (["required", "unknown", "needs_follow_up"].includes(record.status) && !record.required_action) {
      fail(`coverage area missing required action: ${record.area_key || "unknown"}`);
    }
  }
  pass(`coverage areas checked (${records.length})`);
}

function validatePostWorkCaptures(records, pass, fail) {
  const ids = new Set();
  const allowedClassifications = new Set([
    "matches_existing_task",
    "needs_new_task",
    "unapproved_scope",
    "exploration",
    "urgent_fix",
    "documentation_only",
    "converted_to_task"
  ]);
  const allowedStatuses = new Set(["captured", "linked", "converted_to_task", "resolved", "rejected"]);
  const tasks = safeRead(".kabeeri/tasks.json", "tasks");
  const taskIds = new Set(tasks.map((task) => task.id));
  for (const record of records) {
    if (!record.capture_id) fail("post-work capture missing capture_id");
    else if (ids.has(record.capture_id)) fail(`duplicate post-work capture id: ${record.capture_id}`);
    else ids.add(record.capture_id);
    if (!record.summary) fail(`post-work capture missing summary: ${record.capture_id || "unknown"}`);
    if (!Array.isArray(record.files_changed)) fail(`post-work capture files_changed must be an array: ${record.capture_id || "unknown"}`);
    if (!Array.isArray(record.detected_workstreams)) fail(`post-work capture detected_workstreams must be an array: ${record.capture_id || "unknown"}`);
    if (!allowedClassifications.has(record.classification)) fail(`post-work capture has invalid classification: ${record.capture_id || "unknown"} (${record.classification})`);
    if (!allowedStatuses.has(record.status)) fail(`post-work capture has invalid status: ${record.capture_id || "unknown"} (${record.status})`);
    if (record.task_id && !taskIds.has(record.task_id)) fail(`post-work capture references missing task: ${record.capture_id || "unknown"} -> ${record.task_id}`);
    if (["matches_existing_task", "converted_to_task"].includes(record.classification) && !record.task_id) {
      fail(`post-work capture classification requires task_id: ${record.capture_id || "unknown"}`);
    }
  }
  pass(`post-work captures checked (${records.length})`);
}

function validateAgileState(state, pass, fail) {
  const data = state && typeof state === "object" ? state : {};
  const backlog = Array.isArray(data.backlog) ? data.backlog : [];
  const epics = Array.isArray(data.epics) ? data.epics : [];
  const stories = Array.isArray(data.stories) ? data.stories : [];
  const reviews = Array.isArray(data.sprint_reviews) ? data.sprint_reviews : [];
  const impediments = Array.isArray(data.impediments) ? data.impediments : [];
  const retrospectives = Array.isArray(data.retrospectives) ? data.retrospectives : [];
  if (!Array.isArray(data.backlog)) fail("agile backlog must be an array");
  if (!Array.isArray(data.epics)) fail("agile epics must be an array");
  if (!Array.isArray(data.stories)) fail("agile stories must be an array");
  if (!Array.isArray(data.sprint_reviews)) fail("agile sprint_reviews must be an array");
  if (data.impediments !== undefined && !Array.isArray(data.impediments)) fail("agile impediments must be an array");
  if (data.retrospectives !== undefined && !Array.isArray(data.retrospectives)) fail("agile retrospectives must be an array");

  const backlogIds = new Set();
  const epicIds = new Set();
  const storyIds = new Set();
  const reviewIds = new Set();
  const impedimentIds = new Set();
  const retroIds = new Set();
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((task) => task.id));
  const sprintIds = new Set(safeRead(".kabeeri/sprints.json", "sprints").map((sprint) => sprint.id));
  const allowedBacklogTypes = new Set(["epic", "story", "task"]);
  const allowedPriorities = new Set(["critical", "high", "medium", "low", "deferred"]);
  const allowedStoryStatuses = new Set(["backlog", "selected_for_sprint", "in_progress", "review_needed", "accepted", "needs_rework", "blocked", "deferred"]);

  for (const item of backlog) {
    if (!item.id) fail("agile backlog item missing id");
    else if (backlogIds.has(item.id)) fail(`duplicate agile backlog id: ${item.id}`);
    else backlogIds.add(item.id);
    if (!item.title) fail(`agile backlog item missing title: ${item.id || "unknown"}`);
    if (!allowedBacklogTypes.has(item.type)) fail(`agile backlog item has invalid type: ${item.id || "unknown"} (${item.type})`);
    if (!allowedPriorities.has(item.priority || "medium")) fail(`agile backlog item has invalid priority: ${item.id || "unknown"} (${item.priority})`);
    if (!item.source) fail(`agile backlog item missing source: ${item.id || "unknown"}`);
  }

  for (const epic of epics) {
    if (!epic.epic_id) fail("agile epic missing epic_id");
    else if (epicIds.has(epic.epic_id)) fail(`duplicate agile epic id: ${epic.epic_id}`);
    else epicIds.add(epic.epic_id);
    if (!epic.title) fail(`agile epic missing title: ${epic.epic_id || "unknown"}`);
    if (!epic.source) fail(`agile epic missing source: ${epic.epic_id || "unknown"}`);
    if (!Array.isArray(epic.story_ids)) fail(`agile epic story_ids must be an array: ${epic.epic_id || "unknown"}`);
  }

  for (const story of stories) {
    if (!story.story_id) fail("agile story missing story_id");
    else if (storyIds.has(story.story_id)) fail(`duplicate agile story id: ${story.story_id}`);
    else storyIds.add(story.story_id);
    if (!story.title) fail(`agile story missing title: ${story.story_id || "unknown"}`);
    if (story.epic_id && !epicIds.has(story.epic_id)) fail(`agile story references missing epic: ${story.story_id || "unknown"} -> ${story.epic_id}`);
    if (story.sprint_id && !sprintIds.has(story.sprint_id)) fail(`agile story references missing sprint: ${story.story_id || "unknown"} -> ${story.sprint_id}`);
    if (story.task_id && !taskIds.has(story.task_id)) fail(`agile story references missing task: ${story.story_id || "unknown"} -> ${story.task_id}`);
    if (!Array.isArray(story.acceptance_criteria)) fail(`agile story acceptance_criteria must be an array: ${story.story_id || "unknown"}`);
    if (!allowedStoryStatuses.has(story.status || "backlog")) fail(`agile story has invalid status: ${story.story_id || "unknown"} (${story.status})`);
    if (story.ready_status === "ready") {
      if (!(story.acceptance_criteria || []).length) fail(`ready agile story missing acceptance criteria: ${story.story_id || "unknown"}`);
      if (!Number(story.estimate_points || 0)) fail(`ready agile story missing estimate points: ${story.story_id || "unknown"}`);
      if (!story.reviewer_id) fail(`ready agile story missing reviewer: ${story.story_id || "unknown"}`);
      if (!story.value && !story.business_value) fail(`ready agile story missing business value: ${story.story_id || "unknown"}`);
      if (!story.test_notes && !(story.definition_of_done && story.definition_of_done.tests_defined)) fail(`ready agile story missing test notes: ${story.story_id || "unknown"}`);
    }
  }

  for (const review of reviews) {
    if (!review.review_id) fail("agile sprint review missing review_id");
    else if (reviewIds.has(review.review_id)) fail(`duplicate agile sprint review id: ${review.review_id}`);
    else reviewIds.add(review.review_id);
    if (!review.sprint_id) fail(`agile sprint review missing sprint_id: ${review.review_id || "unknown"}`);
    else if (!sprintIds.has(review.sprint_id)) fail(`agile sprint review references missing sprint: ${review.review_id || "unknown"} -> ${review.sprint_id}`);
    for (const storyId of [...(review.accepted_story_ids || []), ...(review.rework_story_ids || [])]) {
      if (!storyIds.has(storyId)) fail(`agile sprint review references missing story: ${review.review_id || "unknown"} -> ${storyId}`);
    }
  }

  for (const impediment of impediments) {
    if (!impediment.impediment_id) fail("agile impediment missing impediment_id");
    else if (impedimentIds.has(impediment.impediment_id)) fail(`duplicate agile impediment id: ${impediment.impediment_id}`);
    else impedimentIds.add(impediment.impediment_id);
    if (!impediment.title) fail(`agile impediment missing title: ${impediment.impediment_id || "unknown"}`);
    if (!["low", "medium", "high", "critical"].includes(impediment.severity || "medium")) fail(`agile impediment has invalid severity: ${impediment.impediment_id || "unknown"} (${impediment.severity})`);
    if (!["open", "resolved", "deferred"].includes(impediment.status || "open")) fail(`agile impediment has invalid status: ${impediment.impediment_id || "unknown"} (${impediment.status})`);
    if (impediment.story_id && !storyIds.has(impediment.story_id)) fail(`agile impediment references missing story: ${impediment.impediment_id || "unknown"} -> ${impediment.story_id}`);
    if (impediment.sprint_id && !sprintIds.has(impediment.sprint_id)) fail(`agile impediment references missing sprint: ${impediment.impediment_id || "unknown"} -> ${impediment.sprint_id}`);
  }

  for (const retro of retrospectives) {
    if (!retro.retro_id) fail("agile retrospective missing retro_id");
    else if (retroIds.has(retro.retro_id)) fail(`duplicate agile retrospective id: ${retro.retro_id}`);
    else retroIds.add(retro.retro_id);
    if (!retro.sprint_id) fail(`agile retrospective missing sprint_id: ${retro.retro_id || "unknown"}`);
    else if (!sprintIds.has(retro.sprint_id)) fail(`agile retrospective references missing sprint: ${retro.retro_id || "unknown"} -> ${retro.sprint_id}`);
    if (!Array.isArray(retro.action_items)) fail(`agile retrospective action_items must be an array: ${retro.retro_id || "unknown"}`);
  }
  pass(`agile state checked (${backlog.length} backlog, ${epics.length} epics, ${stories.length} stories, ${reviews.length} reviews, ${impediments.length} impediments, ${retrospectives.length} retrospectives)`);
}

function validateStructuredState(state, pass, fail) {
  const data = state && typeof state === "object" ? state : {};
  const requirements = Array.isArray(data.requirements) ? data.requirements : [];
  const phases = Array.isArray(data.phases) ? data.phases : [];
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const deliverables = Array.isArray(data.deliverables) ? data.deliverables : [];
  const changes = Array.isArray(data.change_requests) ? data.change_requests : [];
  const risks = Array.isArray(data.risks) ? data.risks : [];
  const gates = Array.isArray(data.gates) ? data.gates : [];
  if (!Array.isArray(data.requirements)) fail("structured requirements must be an array");
  if (!Array.isArray(data.phases)) fail("structured phases must be an array");
  if (!Array.isArray(data.milestones)) fail("structured milestones must be an array");
  if (!Array.isArray(data.deliverables)) fail("structured deliverables must be an array");
  if (!Array.isArray(data.change_requests)) fail("structured change_requests must be an array");
  if (!Array.isArray(data.risks)) fail("structured risks must be an array");
  if (!Array.isArray(data.gates)) fail("structured gates must be an array");

  const requirementIds = new Set();
  const phaseIds = new Set();
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((task) => task.id));
  const allowedPriorities = new Set(["critical", "high", "medium", "low", "deferred"]);
  const allowedRequirementStatuses = new Set(["draft", "approved", "planned", "in_progress", "verified", "accepted", "deferred", "rejected"]);

  for (const item of requirements) {
    if (!item.requirement_id) fail("structured requirement missing requirement_id");
    else if (requirementIds.has(item.requirement_id)) fail(`duplicate structured requirement id: ${item.requirement_id}`);
    else requirementIds.add(item.requirement_id);
    if (!item.title) fail(`structured requirement missing title: ${item.requirement_id || "unknown"}`);
    if (!item.source) fail(`structured requirement missing source: ${item.requirement_id || "unknown"}`);
    if (!allowedPriorities.has(item.priority || "medium")) fail(`structured requirement has invalid priority: ${item.requirement_id || "unknown"} (${item.priority})`);
    if (!allowedRequirementStatuses.has(item.status || "draft")) fail(`structured requirement has invalid status: ${item.requirement_id || "unknown"} (${item.status})`);
    if (!Array.isArray(item.acceptance_criteria)) fail(`structured requirement acceptance_criteria must be an array: ${item.requirement_id || "unknown"}`);
    if (item.approval_status === "approved" && !(item.acceptance_criteria || []).length) fail(`approved structured requirement missing acceptance criteria: ${item.requirement_id || "unknown"}`);
    for (const taskId of item.task_ids || []) {
      if (!taskIds.has(taskId)) fail(`structured requirement references missing task: ${item.requirement_id || "unknown"} -> ${taskId}`);
    }
  }

  for (const phase of phases) {
    if (!phase.phase_id) fail("structured phase missing phase_id");
    else if (phaseIds.has(phase.phase_id)) fail(`duplicate structured phase id: ${phase.phase_id}`);
    else phaseIds.add(phase.phase_id);
    if (!phase.title) fail(`structured phase missing title: ${phase.phase_id || "unknown"}`);
    if (!Array.isArray(phase.requirement_ids)) fail(`structured phase requirement_ids must be an array: ${phase.phase_id || "unknown"}`);
    for (const reqId of phase.requirement_ids || []) {
      if (!requirementIds.has(reqId)) fail(`structured phase references missing requirement: ${phase.phase_id || "unknown"} -> ${reqId}`);
    }
    for (const taskId of phase.task_ids || []) {
      if (!taskIds.has(taskId)) fail(`structured phase references missing task: ${phase.phase_id || "unknown"} -> ${taskId}`);
    }
  }

  for (const item of milestones) {
    if (!item.milestone_id) fail("structured milestone missing milestone_id");
    if (item.phase_id && !phaseIds.has(item.phase_id)) fail(`structured milestone references missing phase: ${item.milestone_id || "unknown"} -> ${item.phase_id}`);
  }
  for (const item of deliverables) {
    if (!item.deliverable_id) fail("structured deliverable missing deliverable_id");
    if (item.phase_id && !phaseIds.has(item.phase_id)) fail(`structured deliverable references missing phase: ${item.deliverable_id || "unknown"} -> ${item.phase_id}`);
  }
  for (const item of changes) {
    if (!item.change_id) fail("structured change request missing change_id");
    if (item.requirement_id && !requirementIds.has(item.requirement_id)) fail(`structured change references missing requirement: ${item.change_id || "unknown"} -> ${item.requirement_id}`);
    if (item.phase_id && !phaseIds.has(item.phase_id)) fail(`structured change references missing phase: ${item.change_id || "unknown"} -> ${item.phase_id}`);
  }
  for (const item of risks) {
    if (!item.risk_id) fail("structured risk missing risk_id");
    if (!["low", "medium", "high", "critical"].includes(item.severity || "medium")) fail(`structured risk has invalid severity: ${item.risk_id || "unknown"} (${item.severity})`);
    if (!["open", "mitigated", "accepted", "closed"].includes(item.status || "open")) fail(`structured risk has invalid status: ${item.risk_id || "unknown"} (${item.status})`);
  }
  for (const item of gates) {
    if (!item.gate_id) fail("structured gate missing gate_id");
    if (item.phase_id && !phaseIds.has(item.phase_id)) fail(`structured gate references missing phase: ${item.gate_id || "unknown"} -> ${item.phase_id}`);
    if (!["pass", "warning", "blocked"].includes(item.status || "warning")) fail(`structured gate has invalid status: ${item.gate_id || "unknown"} (${item.status})`);
  }
  pass(`structured state checked (${requirements.length} requirements, ${phases.length} phases, ${milestones.length} milestones, ${deliverables.length} deliverables, ${changes.length} changes, ${risks.length} risks, ${gates.length} gates)`);
}

function validateDashboardUxAudits(records, pass, fail) {
  const ids = new Set();
  for (const record of records) {
    if (!record.audit_id) fail("dashboard UX audit missing audit_id");
    else if (ids.has(record.audit_id)) fail(`duplicate dashboard UX audit id: ${record.audit_id}`);
    else ids.add(record.audit_id);
    if (!["pass", "needs_attention"].includes(record.status)) fail(`dashboard UX audit has invalid status: ${record.audit_id || "unknown"} (${record.status})`);
    if (!Array.isArray(record.checks)) fail(`dashboard UX audit checks must be an array: ${record.audit_id || "unknown"}`);
    if (!Array.isArray(record.action_items)) fail(`dashboard UX audit action_items must be an array: ${record.audit_id || "unknown"}`);
    if (Number(record.score || 0) > Number(record.max_score || 0)) fail(`dashboard UX audit score exceeds max_score: ${record.audit_id || "unknown"}`);
  }
  pass(`dashboard UX audits checked (${records.length})`);
}

function validateDesignSources(records, pass, fail) {
  const ids = new Set();
  for (const record of records) {
    if (!record.id) fail("design source missing id");
    else if (ids.has(record.id)) fail(`duplicate design source id: ${record.id}`);
    else ids.add(record.id);
    if (!record.source_type) fail(`design source missing source_type: ${record.id || "unknown"}`);
    if (!record.source_location) fail(`design source missing source_location: ${record.id || "unknown"}`);
    if (record.approval_status === "approved" && !record.approved_text_spec) fail(`approved design source missing approved_text_spec: ${record.id || "unknown"}`);
  }
  pass(`design sources checked (${records.length})`);
}

function validateDesignPages(records, pass, fail) {
  const ids = new Set();
  const sourceIds = new Set(safeRead(".kabeeri/design_sources/sources.json", "sources").map((item) => item.id));
  for (const record of records) {
    if (!record.id) fail("design page spec missing id");
    else if (ids.has(record.id)) fail(`duplicate design page spec id: ${record.id}`);
    else ids.add(record.id);
    if (!record.source_id || !sourceIds.has(record.source_id)) fail(`design page spec references missing source: ${record.id || "unknown"} -> ${record.source_id || ""}`);
    if (!Array.isArray(record.required_states)) fail(`design page spec required_states must be an array: ${record.id || "unknown"}`);
  }
  pass(`design page specs checked (${records.length})`);
}

function validateDesignComponents(records, pass, fail) {
  const ids = new Set();
  const pageIds = new Set(safeRead(".kabeeri/design_sources/page_specs.json", "pages").map((item) => item.id));
  for (const record of records) {
    if (!record.id) fail("design component contract missing id");
    else if (ids.has(record.id)) fail(`duplicate design component contract id: ${record.id}`);
    else ids.add(record.id);
    if (!record.page_spec_id || !pageIds.has(record.page_spec_id)) fail(`design component contract references missing page: ${record.id || "unknown"} -> ${record.page_spec_id || ""}`);
    if (!Array.isArray(record.variants)) fail(`design component variants must be an array: ${record.id || "unknown"}`);
    if (!Array.isArray(record.states)) fail(`design component states must be an array: ${record.id || "unknown"}`);
  }
  pass(`design component contracts checked (${records.length})`);
}

function validateDesignVisualReviews(records, pass, fail) {
  const ids = new Set();
  const pageIds = new Set(safeRead(".kabeeri/design_sources/page_specs.json", "pages").map((item) => item.id));
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((item) => item.id));
  for (const record of records) {
    if (!record.review_id) fail("design visual review missing review_id");
    else if (ids.has(record.review_id)) fail(`duplicate design visual review id: ${record.review_id}`);
    else ids.add(record.review_id);
    if (!record.page_spec_id || !pageIds.has(record.page_spec_id)) fail(`design visual review references missing page: ${record.review_id || "unknown"} -> ${record.page_spec_id || ""}`);
    if (record.task_id && !taskIds.has(record.task_id)) fail(`design visual review references missing task: ${record.review_id || "unknown"} -> ${record.task_id}`);
    if (!Array.isArray(record.screenshots) || record.screenshots.length === 0) fail(`design visual review requires screenshots: ${record.review_id || "unknown"}`);
    if (!["pass", "needs_rework", "blocked"].includes(record.decision)) fail(`design visual review has invalid decision: ${record.review_id || "unknown"} (${record.decision})`);
  }
  pass(`design visual reviews checked (${records.length})`);
}

function validateAdrRecords(records, pass, fail) {
  const ids = new Set();
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((item) => item.id));
  const aiRunIds = new Set(readJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl", fail).map((item) => item.run_id));
  const allowed = new Set(["proposed", "approved", "superseded", "rejected"]);
  for (const record of records) {
    if (!record.adr_id) fail("ADR missing adr_id");
    else if (ids.has(record.adr_id)) fail(`duplicate ADR id: ${record.adr_id}`);
    else ids.add(record.adr_id);
    if (!record.title) fail(`ADR missing title: ${record.adr_id || "unknown"}`);
    if (!allowed.has(record.status)) fail(`ADR has invalid status: ${record.adr_id || "unknown"} (${record.status})`);
    if (!record.context) fail(`ADR missing context: ${record.adr_id || "unknown"}`);
    if (!record.decision) fail(`ADR missing decision: ${record.adr_id || "unknown"}`);
    if (record.status === "approved" && !record.approved_by) fail(`approved ADR missing approved_by: ${record.adr_id || "unknown"}`);
    for (const taskId of record.related_tasks || []) {
      if (!taskIds.has(taskId)) fail(`ADR references missing task: ${record.adr_id || "unknown"} -> ${taskId}`);
    }
    for (const runId of record.related_ai_runs || []) {
      if (!aiRunIds.has(runId)) fail(`ADR references missing AI run: ${record.adr_id || "unknown"} -> ${runId}`);
    }
  }
  pass(`ADR records checked (${records.length})`);
}

function validateAiRunHistory(pass, fail) {
  const runs = readJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl", fail);
  const accepted = readJsonLines(".kabeeri/ai_runs/accepted_runs.jsonl", fail);
  const rejected = readJsonLines(".kabeeri/ai_runs/rejected_runs.jsonl", fail);
  const ids = new Set();
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((item) => item.id));
  const allowed = new Set(["recorded", "accepted", "rejected"]);
  for (const run of runs) {
    if (!run.run_id) fail("AI run missing run_id");
    else if (ids.has(run.run_id)) fail(`duplicate AI run id: ${run.run_id}`);
    else ids.add(run.run_id);
    if (run.task_id && run.task_id !== "untracked" && !taskIds.has(run.task_id)) fail(`AI run references missing task: ${run.run_id || "unknown"} -> ${run.task_id}`);
    if (!run.developer_id && !run.agent_id) fail(`AI run missing developer_id: ${run.run_id || "unknown"}`);
    if (!run.provider) fail(`AI run missing provider: ${run.run_id || "unknown"}`);
    if (!run.model) fail(`AI run missing model: ${run.run_id || "unknown"}`);
    if (!allowed.has(run.status || "recorded")) fail(`AI run has invalid status: ${run.run_id || "unknown"} (${run.status})`);
    if (Number(run.total_tokens || 0) < 0) fail(`AI run has negative tokens: ${run.run_id || "unknown"}`);
    if (Number(run.cost || 0) < 0) fail(`AI run has negative cost: ${run.run_id || "unknown"}`);
  }
  for (const review of [...accepted, ...rejected]) {
    if (!review.run_id || !ids.has(review.run_id)) fail(`AI run review references missing run: ${review.review_id || "unknown"} -> ${review.run_id || ""}`);
    if (!["accepted", "rejected"].includes(review.decision)) fail(`AI run review has invalid decision: ${review.review_id || "unknown"} (${review.decision})`);
    if (review.decision === "rejected" && !review.reason) fail(`rejected AI run review missing reason: ${review.review_id || "unknown"}`);
  }
  pass(`AI runs checked (${runs.length} runs, ${accepted.length} accepted reviews, ${rejected.length} rejected reviews)`);
}

function validatePromptLayer(pass, fail) {
  validateJson("prompt_packs/common/prompt_pack_manifest.json", pass, fail);
  const manifest = fileExists("prompt_packs/common/prompt_pack_manifest.json") ? readJsonFile("prompt_packs/common/prompt_pack_manifest.json") : { files: [] };
  for (const file of manifest.files || []) {
    if (!fileExists(`prompt_packs/common/${file}`)) fail(`common prompt layer file missing: ${file}`);
  }
  const compositions = fileExists(".kabeeri/prompt_layer/compositions.json")
    ? safeRead(".kabeeri/prompt_layer/compositions.json", "compositions")
    : [];
  validatePromptCompositions(compositions, pass, fail);
  pass(`common prompt layer checked (${(manifest.files || []).length} files)`);
}

function validatePromptCompositions(records, pass, fail) {
  const ids = new Set();
  const taskIds = new Set(safeRead(".kabeeri/tasks.json", "tasks").map((item) => item.id));
  const contextIds = new Set(safeRead(".kabeeri/ai_usage/context_packs.json", "context_packs").map((item) => item.context_pack_id));
  for (const record of records) {
    if (!record.composition_id) fail("prompt composition missing composition_id");
    else if (ids.has(record.composition_id)) fail(`duplicate prompt composition id: ${record.composition_id}`);
    else ids.add(record.composition_id);
    if (!record.pack) fail(`prompt composition missing pack: ${record.composition_id || "unknown"}`);
    else if (!fileExists(`prompt_packs/${record.pack}/prompt_pack_manifest.json`)) fail(`prompt composition references missing pack: ${record.composition_id || "unknown"} -> ${record.pack}`);
    if (record.task_id && !taskIds.has(record.task_id)) fail(`prompt composition references missing task: ${record.composition_id || "unknown"} -> ${record.task_id}`);
    if (record.context_pack_id && !contextIds.has(record.context_pack_id)) fail(`prompt composition references missing context pack: ${record.composition_id || "unknown"} -> ${record.context_pack_id}`);
    if (!Array.isArray(record.common_files)) fail(`prompt composition common_files must be an array: ${record.composition_id || "unknown"}`);
    if (!record.output_path) fail(`prompt composition missing output_path: ${record.composition_id || "unknown"}`);
  }
  pass(`prompt compositions checked (${records.length})`);
}

function validateCustomerAppRecords(records, pass, fail) {
  const allowed = new Set(["draft", "needs_review", "ready_to_demo", "ready_to_publish", "published", "archived"]);
  const usernames = new Set();
  const paths = [];
  const knownWorkstreams = new Set(readWorkstreamRegistry().map((item) => normalizeWorkstreamId(item.id)).filter(Boolean));
  for (const record of records) {
    if (!record.username) {
      fail("customer app missing username");
      continue;
    }
    if (usernames.has(record.username)) fail(`duplicate customer app username: ${record.username}`);
    else usernames.add(record.username);
    if (/^\d+$/.test(record.username)) fail(`customer app username cannot be numeric: ${record.username}`);
    if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(record.username)) fail(`customer app username invalid: ${record.username}`);
    const publicUrl = record.public_url || `/customer/apps/${record.username}`;
    if (publicUrl !== `/customer/apps/${record.username}`) fail(`customer app public_url must use username: ${record.username}`);
    if (/\/customer\/apps\/\d+(?:\/|$)/.test(publicUrl)) fail(`customer app public_url exposes numeric id: ${publicUrl}`);
    if (!record.name) fail(`customer app missing name: ${record.username}`);
    if (!allowed.has(record.status || "draft")) fail(`customer app has invalid status: ${record.username} (${record.status})`);
    const appPath = normalizeAppPath(record.path || `apps/${record.username}`);
    if (!appPath) fail(`customer app missing path: ${record.username}`);
    else paths.push({ username: record.username, path: appPath });
    if (!record.app_type && !record.type) fail(`customer app missing app_type: ${record.username}`);
    for (const stream of record.workstreams || []) {
      const normalized = normalizeWorkstreamId(stream);
      if (knownWorkstreams.size > 0 && normalized && !knownWorkstreams.has(normalized)) {
        fail(`customer app references unknown workstream: ${record.username} -> ${normalized}`);
      }
    }
  }
  for (let index = 0; index < paths.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < paths.length; otherIndex += 1) {
      const left = paths[index];
      const right = paths[otherIndex];
      if (left.path === right.path || pathScopeContains(left.path, right.path) || pathScopeContains(right.path, left.path)) {
        fail(`customer app path boundary overlap: ${left.username} overlaps ${right.username}`);
      }
    }
  }
  pass(`customer app records checked (${records.length})`);
}

function normalizeAppPath(value) {
  const normalized = String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  if (!normalized || normalized.startsWith("../") || normalized === ".." || normalized.includes("/../")) return "";
  if (normalized === ".kabeeri" || normalized.startsWith(".kabeeri/")) return "";
  return normalized;
}

function validateTaskRecords(tasks, pass, fail) {
  const allowed = new Set(["proposed", "approved", "ready", "assigned", "in_progress", "review", "owner_verified", "rejected"]);
  const ids = new Set();
  const knownWorkstreams = new Set(readWorkstreamRegistry().map((item) => normalizeWorkstreamId(item.id)).filter(Boolean));
  for (const task of tasks) {
    if (!task.id) fail("task missing id");
    else if (ids.has(task.id)) fail(`duplicate task id: ${task.id}`);
    else ids.add(task.id);
    if (!task.title) fail(`task missing title: ${task.id || "unknown"}`);
    if (!allowed.has(task.status)) fail(`task has invalid status: ${task.id || "unknown"} (${task.status})`);
    const workstreams = taskWorkstreams(task).filter((item) => item !== "unassigned");
    const type = String(task.type || "general").toLowerCase();
    if (workstreams.length > 1 && !["integration", "integration-task"].includes(type)) {
      fail(`task touches multiple workstreams without integration type: ${task.id || "unknown"}`);
    }
    for (const stream of workstreams) {
      if (knownWorkstreams.size > 0 && !knownWorkstreams.has(stream)) fail(`task references unknown workstream: ${task.id || "unknown"} -> ${stream}`);
    }
    if (["assigned", "in_progress", "review", "owner_verified"].includes(task.status) && !task.assignee_id) {
      fail(`task missing assignee for status ${task.status}: ${task.id}`);
    }
  }
  pass(`task records checked (${tasks.length})`);
}

function taskWorkstreams(task) {
  const values = Array.isArray(task.workstreams) && task.workstreams.length ? task.workstreams : [task.workstream || "unassigned"];
  return values.map((item) => normalizeWorkstreamId(item)).filter(Boolean);
}

function validateWorkstreamRecords(records, pass, fail) {
  const ids = new Set();
  for (const record of records) {
    const id = normalizeWorkstreamId(record.id);
    if (!id) fail("workstream missing id");
    else if (ids.has(id)) fail(`duplicate workstream id: ${id}`);
    else ids.add(id);
    if (!record.name) fail(`workstream missing name: ${id || "unknown"}`);
    if (!Array.isArray(record.path_rules) || record.path_rules.length === 0) {
      fail(`workstream missing path rules: ${id || "unknown"}`);
    }
    for (const rule of record.path_rules || []) {
      if (!normalizePathRule(rule)) fail(`workstream has invalid path rule: ${id || "unknown"}`);
    }
  }
  pass(`workstream records checked (${records.length})`);
}

function validateAcceptanceRecords(records, pass, fail) {
  const allowed = new Set(["draft", "reviewed", "accepted", "rejected"]);
  const ids = new Set();
  for (const record of records) {
    if (!record.id) fail("acceptance record missing id");
    else if (ids.has(record.id)) fail(`duplicate acceptance id: ${record.id}`);
    else ids.add(record.id);
    if (!record.task_id && !record.subject_id && !record.version) fail(`acceptance record missing subject: ${record.id || "unknown"}`);
    if (!allowed.has(record.status || "draft")) fail(`acceptance record has invalid status: ${record.id || "unknown"} (${record.status})`);
  }
  pass(`acceptance records checked (${records.length})`);
}

function validatePolicyState(pass, fail) {
  if (!fileExists(".kabeeri")) {
    fail(".kabeeri workspace missing; run `kvdf init` first");
    return;
  }

  const files = [
    ".kabeeri/policies/task_verification_policy.json",
    ".kabeeri/policies/release_policy.json",
    ".kabeeri/policies/handoff_policy.json",
    ".kabeeri/policies/security_policy.json",
    ".kabeeri/policies/migration_policy.json",
    ".kabeeri/policies/github_write_policy.json"
  ];

  let checked = 0;
  for (const file of files) {
    validateJson(file, pass, fail);
    if (!fileExists(file)) continue;
    validatePolicyDefinition(readJsonFile(file), file, pass, fail);
    checked += 1;
  }

  validateJson(".kabeeri/policies/policy_results.json", pass, fail);
  const results = safeRead(".kabeeri/policies/policy_results.json", "results");
  validatePolicyResults(results, pass, fail);
  pass(`policy definitions checked (${checked})`);
}

function validatePolicyDefinition(policy, file, pass, fail) {
  if (!policy.policy_id) fail(`policy missing policy_id: ${file}`);
  if (!policy.version) fail(`policy missing version: ${policy.policy_id || file}`);
  if (!policy.subject_type) fail(`policy missing subject_type: ${policy.policy_id || file}`);
  if (!Array.isArray(policy.required_checks) || policy.required_checks.length === 0) {
    fail(`policy has no required_checks: ${policy.policy_id || file}`);
    return;
  }

  const checkIds = new Set();
  const allowedSeverity = new Set(["fail", "warn"]);
  for (const check of policy.required_checks) {
    if (!check.check_id) fail(`policy check missing check_id: ${policy.policy_id || file}`);
    else if (checkIds.has(check.check_id)) fail(`duplicate policy check id: ${policy.policy_id}/${check.check_id}`);
    else checkIds.add(check.check_id);
    if (!allowedSeverity.has(check.severity || "fail")) fail(`invalid policy check severity: ${policy.policy_id}/${check.check_id || "unknown"}`);
    if (!check.description) fail(`policy check missing description: ${policy.policy_id}/${check.check_id || "unknown"}`);
  }
}

function validatePolicyResults(results, pass, fail) {
  const ids = new Set();
  const allowedStatus = new Set(["pass", "warning", "blocked", "overridden"]);
  const allowedCheckResult = new Set(["pass", "warn", "fail"]);
  for (const result of results) {
    if (!result.result_id) fail("policy result missing result_id");
    else if (ids.has(result.result_id)) fail(`duplicate policy result id: ${result.result_id}`);
    else ids.add(result.result_id);
    if (!result.policy_id) fail(`policy result missing policy_id: ${result.result_id || "unknown"}`);
    if (!result.subject_type) fail(`policy result missing subject_type: ${result.result_id || "unknown"}`);
    if (!result.subject_id) fail(`policy result missing subject_id: ${result.result_id || "unknown"}`);
    if (!allowedStatus.has(result.status)) fail(`policy result has invalid status: ${result.result_id || "unknown"} (${result.status})`);
    if (!result.evaluated_at || Number.isNaN(Date.parse(result.evaluated_at))) fail(`policy result has invalid evaluated_at: ${result.result_id || "unknown"}`);
    for (const check of result.checks || []) {
      if (!check.check_id) fail(`policy result check missing check_id: ${result.result_id || "unknown"}`);
      if (!allowedCheckResult.has(check.result)) fail(`policy result check has invalid result: ${result.result_id || "unknown"}/${check.check_id || "unknown"}`);
    }
  }
  pass(`policy results checked (${results.length})`);
}

function validateFeatureRecords(records, pass, fail) {
  const allowed = new Set(["ready_to_demo", "ready_to_publish", "needs_review", "future"]);
  const ids = new Set();
  for (const record of records) {
    if (!record.id) fail("feature missing id");
    else if (ids.has(record.id)) fail(`duplicate feature id: ${record.id}`);
    else ids.add(record.id);
    if (!record.title) fail(`feature missing title: ${record.id || "unknown"}`);
    if (!allowed.has(record.readiness || "future")) fail(`feature has invalid readiness: ${record.id || "unknown"} (${record.readiness})`);
  }
  pass(`feature records checked (${records.length})`);
}

function validateJourneyRecords(records, pass, fail) {
  const allowed = new Set(["draft", "needs_review", "ready_to_show", "future"]);
  const ids = new Set();
  for (const record of records) {
    if (!record.id) fail("journey missing id");
    else if (ids.has(record.id)) fail(`duplicate journey id: ${record.id}`);
    else ids.add(record.id);
    if (!record.name) fail(`journey missing name: ${record.id || "unknown"}`);
    if (!allowed.has(record.status || "draft")) fail(`journey has invalid status: ${record.id || "unknown"} (${record.status})`);
    if (!Array.isArray(record.steps)) fail(`journey steps must be an array: ${record.id || "unknown"}`);
  }
  pass(`journey records checked (${records.length})`);
}

function locksOverlap(left, right) {
  const leftType = normalizeLockType(left.type);
  const rightType = normalizeLockType(right.type);
  const leftScope = normalizeLockScope(left.scope);
  const rightScope = normalizeLockScope(right.scope);
  if (!leftScope || !rightScope) return false;
  if (leftType === rightType && leftScope === rightScope) return true;
  if (leftType === "workstream" || rightType === "workstream") {
    return leftType === "workstream" && rightType === "workstream" && leftScope === rightScope;
  }
  if (leftType === "folder" && ["folder", "file"].includes(rightType)) return pathScopeContains(leftScope, rightScope);
  if (rightType === "folder" && ["folder", "file"].includes(leftType)) return pathScopeContains(rightScope, leftScope);
  return false;
}

function normalizeLockType(type) {
  const value = String(type || "").toLowerCase().replace(/[_-]/g, "");
  const aliases = {
    directory: "folder",
    dir: "folder",
    folder: "folder",
    file: "file",
    task: "task",
    workstream: "workstream",
    databasetable: "database_table",
    table: "database_table",
    promptpack: "prompt_pack"
  };
  return aliases[value] || String(type || "").toLowerCase();
}

function normalizeLockScope(scope) {
  return String(scope || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function pathScopeContains(parent, child) {
  return child === parent || child.startsWith(`${parent}/`);
}

function validateWorkspaceGovernance(pass, fail) {
  const developers = safeRead(".kabeeri/developers.json", "developers");
  const agents = safeRead(".kabeeri/agents.json", "agents");
  const identities = [...developers, ...agents];
  const owners = identities.filter((item) => item.role === "Owner" && item.status !== "inactive");
  if (owners.length <= 1) pass("single Owner rule valid");
  else fail(`single Owner rule violated (${owners.length} active Owners)`);

  if (fileExists(".kabeeri/owner_auth.json")) {
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    if (!auth.configured) {
      pass("owner auth not configured");
    } else if (owners.some((owner) => owner.id === auth.owner_id)) {
      pass("owner auth matches active Owner");
    } else {
      fail("owner auth does not match an active Owner identity");
    }
  }

  const ids = new Set();
  const workstreams = readWorkstreamRegistry();
  const knownWorkstreams = new Set(workstreams.map((item) => normalizeWorkstreamId(item.id)).filter(Boolean));
  for (const identity of identities) {
    if (!identity.id) {
      fail("identity missing id");
    } else if (ids.has(identity.id)) {
      fail(`duplicate identity id: ${identity.id}`);
    } else {
      ids.add(identity.id);
    }
    if (knownWorkstreams.size > 0) {
      for (const stream of identity.workstreams || []) {
        const normalized = normalizeWorkstreamId(stream);
        if (normalized && !knownWorkstreams.has(normalized)) fail(`identity references unknown workstream: ${identity.id || "unknown"} -> ${normalized}`);
      }
    }
  }
  if (identities.length === ids.size) pass("identity IDs unique");

  validateDeveloperMode(developers, pass, fail);

  const locks = safeRead(".kabeeri/locks.json", "locks").filter((lock) => lock.status === "active");
  for (let index = 0; index < locks.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < locks.length; otherIndex += 1) {
      if (locksOverlap(locks[index], locks[otherIndex])) {
        fail(`active lock conflict: ${locks[index].lock_id || locks[index].scope} overlaps ${locks[otherIndex].lock_id || locks[otherIndex].scope}`);
      }
    }
  }
  pass("active lock conflicts checked");

  const tokens = safeRead(".kabeeri/tokens.json", "tokens");
  for (const token of tokens.filter((item) => item.status === "active")) {
    if (token.expires_at && Date.parse(token.expires_at) <= Date.now()) {
      fail(`active token expired: ${token.token_id}`);
    }
  }
  pass("active token expiry checked");
  validateExecutionScopeTokens(tokens, pass, fail);

  for (const file of [".kabeeri/ai_usage/usage_events.jsonl", ".kabeeri/audit_log.jsonl"]) {
    validateJsonl(file, pass, fail);
  }

  const sessions = safeRead(".kabeeri/sessions.json", "sessions");
  for (const session of sessions.filter((item) => item.status === "completed")) {
    if (!session.summary) fail(`completed session missing summary: ${session.session_id}`);
    const reportPath = `.kabeeri/reports/${session.session_id}.handoff.md`;
    if (fileExists(reportPath)) pass(`session handoff exists: ${session.session_id}`);
    else fail(`session handoff missing: ${session.session_id}`);
  }

  validateAppBoundaryGovernance(pass, fail);
  validateWorkstreamGovernance(pass, fail);
}

function validateDeveloperMode(developers, pass, fail) {
  if (!fileExists(".kabeeri/developer_mode.json")) {
    pass("developer mode not configured");
    return;
  }
  const mode = readJsonFile(".kabeeri/developer_mode.json");
  if (mode.mode !== "solo") {
    pass(`developer mode: ${mode.mode || "unset"}`);
    return;
  }
  const developer = developers.find((item) => item.id === mode.solo_developer_id && item.status !== "inactive");
  if (!developer) {
    fail(`solo developer mode references missing developer: ${mode.solo_developer_id || "unknown"}`);
    return;
  }
  const required = ["backend", "public_frontend", "admin_frontend", "database", "devops", "qa"];
  const workstreams = (developer.workstreams || []).map((item) => String(item).toLowerCase());
  const missing = required.filter((item) => !workstreams.includes(item));
  if (missing.length > 0) fail(`solo developer missing workstreams: ${missing.join(", ")}`);
  else pass("solo developer mode valid");
}

function validateAppBoundaryGovernance(pass, fail) {
  const apps = safeRead(".kabeeri/customer_apps.json", "apps");
  const tasks = safeRead(".kabeeri/tasks.json", "tasks");
  const appNames = new Set(apps.map((item) => item.username));
  for (const task of tasks) {
    const taskApps = Array.isArray(task.app_usernames) && task.app_usernames.length
      ? task.app_usernames
      : task.app_username ? [task.app_username] : [];
    const normalizedType = String(task.type || "general").toLowerCase();
    if (taskApps.length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
      fail(`task touches multiple apps without integration type: ${task.id || "unknown"}`);
    }
    for (const appName of taskApps) {
      if (!appNames.has(appName)) fail(`task references missing app boundary: ${task.id || "unknown"} -> ${appName}`);
    }
  }
  pass("app boundary governance checked");
}

function validateWorkstreamGovernance(pass, fail) {
  const workstreams = readWorkstreamRegistry();
  if (workstreams.length === 0) {
    pass("workstream governance not configured");
    return;
  }
  const known = new Set(workstreams.map((item) => normalizeWorkstreamId(item.id)).filter(Boolean));
  const tasks = safeRead(".kabeeri/tasks.json", "tasks");
  const sessions = safeRead(".kabeeri/sessions.json", "sessions");
  for (const task of tasks) {
    for (const stream of taskWorkstreams(task).filter((item) => item !== "unassigned")) {
      if (!known.has(stream)) fail(`task references unknown workstream: ${task.id || "unknown"} -> ${stream}`);
    }
  }
  for (const session of sessions.filter((item) => item.status === "completed")) {
    const task = tasks.find((taskItem) => taskItem.id === session.task_id);
    if (!task) continue;
    const taskStreams = taskWorkstreams(task).filter((item) => item !== "unassigned");
    if (taskStreams.length === 0) continue;
    for (const file of session.files_touched || []) {
      if (!fileAllowedByWorkstreams(file, taskStreams, workstreams)) {
        fail(`session file outside workstream boundary: ${session.session_id} -> ${file}`);
      }
    }
  }
  pass("workstream governance checked");
}

function validateExecutionScopeTokens(tokens, pass, fail) {
  const tasks = safeRead(".kabeeri/tasks.json", "tasks");
  for (const token of tokens) {
    if (!token.task_id) fail(`token missing task_id: ${token.token_id || "unknown"}`);
    if (!token.assignee_id) fail(`token missing assignee_id: ${token.token_id || "unknown"}`);
    const task = tasks.find((item) => item.id === token.task_id);
    if (!task) {
      fail(`token references missing task: ${token.token_id || "unknown"} -> ${token.task_id || "unknown"}`);
      continue;
    }
    const taskStreams = taskWorkstreams(task).filter((item) => item !== "unassigned");
    const tokenStreams = (token.workstreams || []).map((item) => normalizeWorkstreamId(item)).filter(Boolean);
    for (const stream of tokenStreams) {
      if (!taskStreams.includes(stream)) fail(`token workstream outside task: ${token.token_id || "unknown"} -> ${stream}`);
    }
    if (token.status === "active" && token.allowed_files && token.allowed_files.length > 0) {
      const appPaths = taskAppPaths(task);
      const derived = deriveValidationScope(task, taskStreams, appPaths);
      const broad = findPathsOutsideDerivedScope(token.allowed_files, derived);
      if (broad.length > 0 && !String(token.scope_source || "").includes("override")) {
        fail(`token scope broader than task boundaries: ${token.token_id || "unknown"} -> ${broad.join(", ")}`);
      }
    }
  }
  pass("execution scope tokens checked");
}

function taskAppPaths(task) {
  const direct = Array.isArray(task.app_paths) ? task.app_paths : [];
  if (direct.length > 0) return direct;
  const appNames = Array.isArray(task.app_usernames) && task.app_usernames.length
    ? task.app_usernames
    : task.app_username ? [task.app_username] : [];
  if (appNames.length === 0) return [];
  const apps = safeRead(".kabeeri/customer_apps.json", "apps");
  return apps.filter((app) => appNames.includes(app.username)).map((app) => app.path).filter(Boolean);
}

function deriveValidationScope(task, workstreams, appPaths) {
  const registry = readWorkstreamRegistry();
  const streamPaths = workstreams.flatMap((id) => {
    const stream = registry.find((item) => normalizeWorkstreamId(item.id) === normalizeWorkstreamId(id));
    return stream ? stream.path_rules || [] : [];
  });
  if (appPaths.length > 0 && streamPaths.length > 0) {
    const scoped = [];
    for (const appPath of appPaths) {
      const appScope = normalizePathRule(appPath).toLowerCase().replace(/\/$/, "");
      for (const streamPath of streamPaths) {
        const streamScope = normalizePathRule(streamPath).toLowerCase().replace(/\/$/, "");
        if (pathScopeContains(appScope, streamScope)) scoped.push(streamScope);
        else if (pathScopeContains(streamScope, appScope)) scoped.push(appScope);
      }
    }
    if (scoped.length > 0) return [...new Set(scoped)];
  }
  return [...new Set([...appPaths, ...streamPaths].map((item) => normalizePathRule(item)).filter(Boolean))];
}

function findPathsOutsideDerivedScope(requested, derived) {
  if (!derived || derived.length === 0) return [];
  return requested.filter((item) => {
    const target = normalizePathRule(item).toLowerCase().replace(/\/$/, "");
    return !derived.some((scope) => {
      const normalized = normalizePathRule(scope).toLowerCase().replace(/\/$/, "");
      return target === normalized || pathScopeContains(normalized, target) || pathScopeContains(target, normalized);
    });
  });
}

function fileAllowedByWorkstreams(file, streamIds, registry) {
  const target = normalizePathRule(file).toLowerCase().replace(/\/$/, "");
  const rules = streamIds.flatMap((id) => {
    const stream = registry.find((item) => normalizeWorkstreamId(item.id) === normalizeWorkstreamId(id));
    return stream ? stream.path_rules || [] : [];
  });
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    const normalized = normalizePathRule(rule).toLowerCase().replace(/\/$/, "");
    if (!normalized) return false;
    if (normalized.includes("*")) {
      const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(target);
    }
    return target === normalized || target.startsWith(`${normalized}/`) || target.startsWith(normalized);
  });
}

function normalizeWorkstreamId(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function normalizePathRule(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "");
}

function readWorkstreamRegistry() {
  if (!fileExists(".kabeeri")) return [];
  if (!fileExists(".kabeeri/workstreams.json")) return defaultWorkstreams();
  const records = safeRead(".kabeeri/workstreams.json", "workstreams");
  return records.length ? records : defaultWorkstreams();
}

function safeRead(file, key) {
  if (!fileExists(file)) return [];
  try {
    return readJsonFile(file)[key] || [];
  } catch {
    return [];
  }
}

function validateJsonl(file, pass, fail) {
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return;
  }
  const fs = require("fs");
  const path = require("path");
  const fullPath = path.join(process.cwd(), file);
  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/).filter(Boolean);
  try {
    for (const line of lines) JSON.parse(line);
    pass(`${file} JSONL valid`);
  } catch (error) {
    fail(`${file} JSONL invalid: ${error.message}`);
  }
}

function validateJson(file, pass, fail) {
  try {
    readJsonFile(file);
    pass(`${file} JSON valid`);
  } catch (error) {
    fail(`${file} JSON invalid: ${error.message}`);
  }
}

function validatePlan(file, pass, fail) {
  try {
    const data = readJsonFile(file);
    const milestoneCount = Array.isArray(data.milestones) ? data.milestones.length : 0;
    const issueCount = (data.milestones || []).reduce((sum, milestone) => sum + (milestone.issues || []).length, 0);
    if (data.totals && data.totals.milestones === milestoneCount && data.totals.issues === issueCount) {
      pass(`${file} totals valid (${milestoneCount} milestones, ${issueCount} issues)`);
    } else {
      fail(`${file} totals mismatch`);
    }
  } catch (error) {
    fail(`${file} invalid: ${error.message}`);
  }
}

module.exports = { validateRepository };
