const { fileExists, listFiles, readJsonFile } = require("./fs_utils");

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

  if (scope === "business") {
    validateWorkspaceFile(".kabeeri/customer_apps.json", "apps", validateCustomerAppRecords, pass, fail);
    validateWorkspaceFile(".kabeeri/features.json", "features", validateFeatureRecords, pass, fail);
    validateWorkspaceFile(".kabeeri/journeys.json", "journeys", validateJourneyRecords, pass, fail);
  }

  if (scope === "questionnaire" || scope === "questionnaires" || scope === "coverage") {
    validateWorkspaceFile(".kabeeri/questionnaires/answers.json", "answers", validateQuestionnaireAnswers, pass, fail);
    validateWorkspaceFile(".kabeeri/questionnaires/coverage_matrix.json", "areas", validateCoverageAreas, pass, fail);
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
    coverage: "coverage",
    questionnaire: "questionnaire",
    questionnaires: "questionnaire",
    features: "business",
    journeys: "business"
  };
  return aliases[scope] || scope;
}

function validateWorkspaceFile(file, key, validator, pass, fail) {
  if (!fileExists(".kabeeri")) {
    fail(".kabeeri workspace missing; run `kvdf init` first");
    return;
  }
  validateJson(file, pass, fail);
  const data = safeRead(file, key);
  validator(data, pass, fail);
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

function validateCustomerAppRecords(records, pass, fail) {
  const allowed = new Set(["draft", "needs_review", "ready_to_demo", "ready_to_publish", "published", "archived"]);
  const usernames = new Set();
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
  }
  pass(`customer app records checked (${records.length})`);
}

function validateTaskRecords(tasks, pass, fail) {
  const allowed = new Set(["proposed", "approved", "ready", "assigned", "in_progress", "review", "owner_verified", "rejected"]);
  const ids = new Set();
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
    if (["assigned", "in_progress", "review", "owner_verified"].includes(task.status) && !task.assignee_id) {
      fail(`task missing assignee for status ${task.status}: ${task.id}`);
    }
  }
  pass(`task records checked (${tasks.length})`);
}

function taskWorkstreams(task) {
  const values = Array.isArray(task.workstreams) && task.workstreams.length ? task.workstreams : [task.workstream || "unassigned"];
  return values.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
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
  for (const identity of identities) {
    if (!identity.id) {
      fail("identity missing id");
    } else if (ids.has(identity.id)) {
      fail(`duplicate identity id: ${identity.id}`);
    } else {
      ids.add(identity.id);
    }
  }
  if (identities.length === ids.size) pass("identity IDs unique");

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
