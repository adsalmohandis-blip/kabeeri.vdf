const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function token(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  const requireAnyRole = deps.requireAnyRole || (() => {});
  const appendAudit = deps.appendAudit || (() => {});
  const file = ".kabeeri/tokens.json";
  const data = readJsonFile(file);
  data.tokens = data.tokens || [];

  if (!action || action === "list") {
    console.log(table(["Token", "Task", "Assignee", "Scope", "Status"], data.tokens.map((item) => [item.token_id, item.task_id, item.assignee_id, item.scope_mode || "manual", item.status])));
    return;
  }

  if (action === "show" || action === "status") {
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const tokenItem = data.tokens.find((item) => item.token_id === tokenId);
    if (!tokenItem) throw new Error(`Token not found: ${tokenId}`);
    console.log(JSON.stringify(tokenItem, null, 2));
    return;
  }

  if (action === "issue") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "issue token");
    const taskId = flags.task || value;
    const assignee = flags.assignee;
    if (!taskId) throw new Error("Missing --task.");
    if (!assignee) throw new Error("Missing --assignee.");
    assertTokenCanBeIssued(taskId, assignee, deps);
    const scope = buildExecutionScope(taskId, flags, null, deps);
    const issuedToken = {
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null,
      workstreams: scope.workstreams,
      app_usernames: scope.app_usernames,
      allowed_files: scope.allowed_files,
      forbidden_files: scope.forbidden_files,
      scope_mode: scope.scope_mode,
      scope_source: scope.scope_source,
      scope_warnings: scope.scope_warnings,
      max_usage_tokens: flags["max-usage-tokens"] ? Number(flags["max-usage-tokens"]) : null,
      max_cost: flags["max-cost"] ? Number(flags["max-cost"]) : null,
      budget_approval_required: Boolean(flags["budget-approval-required"])
    };
    data.tokens.push(issuedToken);
    writeJsonFile(file, data);
    appendAudit("access_token.issued", "token", issuedToken.token_id, `Token issued for ${taskId}`);
    console.log(`Issued token ${issuedToken.token_id}`);
    return;
  }

  if (action === "revoke") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "revoke token");
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const tokenItem = data.tokens.find((item) => item.token_id === tokenId);
    if (!tokenItem) throw new Error(`Token not found: ${tokenId}`);
    tokenItem.status = "revoked";
    tokenItem.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("access_token.revoked", "token", tokenItem.token_id, "Token revoked");
    console.log(`Revoked token ${tokenItem.token_id}`);
    return;
  }

  if (action === "reissue") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "reissue token");
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const previous = data.tokens.find((item) => item.token_id === tokenId);
    if (!previous) throw new Error(`Token not found: ${tokenId}`);
    if (previous.status === "active" && !flags.force) {
      throw new Error("Cannot reissue an active token without --force.");
    }
    const taskId = flags.task || previous.task_id;
    const assignee = flags.assignee || previous.assignee_id;
    assertTokenCanBeIssued(taskId, assignee, deps);
    const scope = buildExecutionScope(taskId, flags, previous, deps);
    const reissuedToken = {
      ...previous,
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || previous.expires_at || null,
      workstreams: scope.workstreams,
      app_usernames: scope.app_usernames,
      allowed_files: scope.allowed_files,
      forbidden_files: scope.forbidden_files,
      scope_mode: scope.scope_mode,
      scope_source: scope.scope_source,
      scope_warnings: scope.scope_warnings,
      max_usage_tokens: flags["max-usage-tokens"] ? Number(flags["max-usage-tokens"]) : previous.max_usage_tokens || null,
      max_cost: flags["max-cost"] ? Number(flags["max-cost"]) : previous.max_cost || null,
      budget_approval_required: flags["budget-approval-required"] !== undefined ? Boolean(flags["budget-approval-required"]) : Boolean(previous.budget_approval_required),
      reissued_from: previous.token_id,
      reissue_reason: flags.reason || "",
      revoked_at: undefined,
      revocation_reason: undefined
    };
    data.tokens.push(reissuedToken);
    writeJsonFile(file, data);
    appendAudit("access_token.reissued", "token", reissuedToken.token_id, `Token reissued from ${previous.token_id}`);
    console.log(`Reissued token ${reissuedToken.token_id} from ${previous.token_id}`);
    return;
  }

  throw new Error(`Unknown token action: ${action}`);
}

function buildExecutionScope(taskId, flags = {}, previous = null, deps = {}) {
  const getTaskById = requireDep(deps, "getTaskById");
  const taskWorkstreams = requireDep(deps, "taskWorkstreams");
  const validateKnownWorkstreams = requireDep(deps, "validateKnownWorkstreams");
  const getTaskAppPaths = requireDep(deps, "getTaskAppPaths");
  const getWorkstreamPathRules = requireDep(deps, "getWorkstreamPathRules");
  const normalizeLockScope = requireDep(deps, "normalizeLockScope");
  const normalizePathRule = requireDep(deps, "normalizePathRule");
  const pathScopeContains = requireDep(deps, "pathScopeContains");
  const parseCsv = requireDep(deps, "parseCsv");
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  const workstreams = taskWorkstreams(taskItem).filter((item) => item !== "unassigned");
  validateKnownWorkstreams(workstreams);
  const appUsernames = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
  const explicitAllowed = flags["allowed-files"] ? parseCsv(flags["allowed-files"]) : null;
  const explicitForbidden = flags["forbidden-files"] ? parseCsv(flags["forbidden-files"]) : null;
  const autoAllowed = deriveExecutionAllowedFiles(taskItem, workstreams, {
    getTaskAppPaths,
    getWorkstreamPathRules,
    normalizeLockScope,
    normalizePathRule,
    pathScopeContains
  });
  const allowedFiles = explicitAllowed || (previous && !flags["auto-scope"] ? previous.allowed_files || [] : autoAllowed);
  const forbiddenFiles = explicitForbidden || (previous && !flags["forbidden-files"] ? previous.forbidden_files || [] : defaultForbiddenFiles());
  const scopeMode = explicitAllowed ? "manual" : "auto";
  const warnings = [];
  if (allowedFiles.length === 0) warnings.push("token has no allowed_files; execution falls back to app/workstream/session gates");
  if (explicitAllowed) {
    const broad = findPathsOutsideDerivedScope(explicitAllowed, autoAllowed, { normalizeLockScope, pathScopeContains });
    if (broad.length > 0 && !flags["allow-broad-scope"]) {
      throw new Error(`Token scope is broader than task app/workstream boundaries: ${broad.join(", ")}. Use --allow-broad-scope for an audited override.`);
    }
    if (broad.length > 0) warnings.push(`broad scope override: ${broad.join(", ")}`);
  }
  return {
    workstreams,
    app_usernames: appUsernames,
    allowed_files: allowedFiles,
    forbidden_files: forbiddenFiles,
    scope_mode: scopeMode,
    scope_source: explicitAllowed && warnings.some((item) => item.startsWith("broad scope override"))
      ? "manual_allowed_files_override"
      : explicitAllowed ? "manual_allowed_files" : "task_app_and_workstream_boundaries",
    scope_warnings: warnings
  };
}

function deriveExecutionAllowedFiles(taskItem, workstreams, deps = {}) {
  const { getTaskAppPaths, getWorkstreamPathRules, normalizeLockScope, normalizePathRule, pathScopeContains } = deps;
  const appPaths = getTaskAppPaths(taskItem);
  const workstreamPaths = workstreams.flatMap((stream) => getWorkstreamPathRules(stream));
  if (appPaths.length > 0 && workstreamPaths.length > 0) {
    const scoped = [];
    for (const appPath of appPaths) {
      const appScope = normalizeLockScope(appPath);
      for (const streamPath of workstreamPaths) {
        const streamScope = normalizeLockScope(streamPath);
        if (!streamScope) continue;
        if (pathScopeContains(appScope, streamScope)) scoped.push(streamScope);
        else if (pathScopeContains(streamScope, appScope)) scoped.push(appScope);
      }
    }
    if (scoped.length > 0) return uniqueList(scoped);
  }
  return uniqueList([...appPaths, ...workstreamPaths].map((item) => normalizePathRule(item)).filter(Boolean));
}

function defaultForbiddenFiles() {
  return [".env", ".env.*", "secrets/", ".kabeeri/owner_auth.json", ".kabeeri/session.json"];
}

function findPathsOutsideDerivedScope(requested, derived, deps = {}) {
  const { normalizeLockScope, pathScopeContains } = deps;
  if (!derived || derived.length === 0) return [];
  return requested.filter((item) => {
    const target = normalizeLockScope(item);
    return !derived.some((scope) => {
      const normalized = normalizeLockScope(scope);
      return target === normalized || pathScopeContains(normalized, target) || pathScopeContains(target, normalized);
    });
  });
}

function assertTokenCanBeIssued(taskId, assigneeId, deps = {}) {
  const getTaskById = requireDep(deps, "getTaskById");
  const assertAssigneeCanTakeTask = requireDep(deps, "assertAssigneeCanTakeTask");
  const hasConfiguredIdentities = requireDep(deps, "hasConfiguredIdentities");
  const getIdentity = requireDep(deps, "getIdentity");
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  assertAssigneeCanTakeTask(assigneeId, taskItem);
  if (hasConfiguredIdentities()) {
    const identity = getIdentity(assigneeId);
    if (!identity) throw new Error(`Unknown assignee: ${assigneeId}`);
    if (taskItem.assignee_id && taskItem.assignee_id !== assigneeId) {
      throw new Error(`Token assignee mismatch: ${taskId} is assigned to ${taskItem.assignee_id}.`);
    }
  }
}

function requireDep(deps, name) {
  if (typeof deps[name] !== "function") throw new Error(`Missing token dependency: ${name}`);
  return deps[name];
}

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

module.exports = {
  token,
  defaultForbiddenFiles
};
