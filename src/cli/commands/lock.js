const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function lock(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit, getWorkstreamPathRules, getTaskById, taskWorkstreams, getTaskAppPaths, validateKnownWorkstreams } = deps;
  ensureWorkspace();
  const file = ".kabeeri/locks.json";
  const data = readJsonFile(file);
  data.locks = data.locks || [];

  if (!action || action === "list") {
    console.log(table(["Lock", "Type", "Scope", "Task", "Owner", "Status"], data.locks.map((item) => [item.lock_id, item.type, item.scope, item.task_id, item.owner_id, item.status])));
    return;
  }

  if (action === "create") {
    if (!flags.type) throw new Error("Missing --type.");
    if (!flags.task) throw new Error("Missing --task.");
    if (!flags.owner) throw new Error("Missing --owner.");
    if (flags.actor && flags.actor !== flags.owner) {
      requireAnyRole(flags, ["Owner", "Maintainer"], "create lock for another actor");
    } else {
      requireAnyRole({ ...flags, actor: flags.owner }, ["Owner", "Maintainer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"], "create lock");
    }
    const scopeInfo = deriveLockScope(flags.task, flags.type, {
      getTaskById,
      taskWorkstreams,
      getTaskAppPaths,
      getWorkstreamPathRules,
      validateKnownWorkstreams
    });
    const explicitScope = flags.scope ? normalizeLockScope(flags.scope) : "";
    const derivedScopes = scopeInfo.derived_scopes || [];
    const scope = explicitScope || scopeInfo.scope;
    if (!scope) throw new Error("Unable to derive a lock scope from task boundaries. Provide --scope explicitly.");
    if (explicitScope && derivedScopes.length && !isScopeInsideDerivedBoundary(explicitScope, derivedScopes)) {
      throw new Error(`Lock scope is broader than task app/workstream boundaries: ${explicitScope}. Use a narrower scope inside the task boundary.`);
    }
    const activeConflict = findLockConflict(data.locks, { type: flags.type, scope, task_id: flags.task }, { getWorkstreamPathRules });
    if (activeConflict) throw new Error(`Active lock conflict: ${activeConflict.lock_id} (${activeConflict.type}:${activeConflict.scope})`);
    const item = {
      lock_id: `lock-${String(data.locks.length + 1).padStart(3, "0")}`,
      type: flags.type,
      scope,
      task_id: flags.task,
      owner_id: flags.owner,
      reason: flags.reason || "",
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null,
      scope_mode: scopeInfo.scope_mode,
      scope_source: scopeInfo.scope_source,
      scope_warnings: scopeInfo.scope_warnings
    };
    data.locks.push(item);
    writeJsonFile(file, data);
    appendAudit("lock.created", "lock", item.lock_id, `Lock created for ${item.scope}`);
    console.log(`Created lock ${item.lock_id}`);
    return;
  }

  if (action === "release") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "release lock");
    const lockId = value || flags.id;
    if (!lockId) throw new Error("Missing lock id.");
    const item = data.locks.find((entry) => entry.lock_id === lockId);
    if (!item) throw new Error(`Lock not found: ${lockId}`);
    item.status = "released";
    item.released_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("lock.released", "lock", item.lock_id, `Lock released for ${item.scope}`);
    console.log(`Released lock ${item.lock_id}`);
    return;
  }

  throw new Error(`Unknown lock action: ${action}`);
}

function findLockConflict(locks, requested, deps = {}) {
  return (locks || []).find((lockItem) => {
    if (lockItem.status !== "active") return false;
    if (lockItem.lock_id === requested.lock_id) return false;
    return locksOverlap(lockItem, requested, deps);
  });
}

function deriveLockScope(taskId, lockType, deps = {}) {
  const getTaskById = requireDep(deps, "getTaskById");
  const taskWorkstreams = requireDep(deps, "taskWorkstreams");
  const getTaskAppPaths = requireDep(deps, "getTaskAppPaths");
  const getWorkstreamPathRules = requireDep(deps, "getWorkstreamPathRules");
  const validateKnownWorkstreams = requireDep(deps, "validateKnownWorkstreams");
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  const normalizedType = normalizeLockType(lockType);
  if (normalizedType === "task") {
    return {
      scope: normalizeLockScope(taskId),
      scope_mode: "task",
      scope_source: "task_boundary",
      scope_warnings: [],
      derived_scopes: [normalizeLockScope(taskId)]
    };
  }
  const workstreams = taskWorkstreams(taskItem).filter((item) => item !== "unassigned");
  validateKnownWorkstreams(workstreams);
  const appPaths = getTaskAppPaths(taskItem).map((item) => normalizePathRule(item)).filter(Boolean);
  const workstreamPaths = workstreams.flatMap((stream) => getWorkstreamPathRules(stream).map((item) => normalizePathRule(item)).filter(Boolean));
  const derivedScopes = deriveBoundaryScopes(appPaths, workstreamPaths, normalizedType);
  const selected = selectNarrowestScope(derivedScopes);
  return {
    scope: selected,
    scope_mode: "auto",
    scope_source: "task_app_and_workstream_boundaries",
    scope_warnings: derivedScopes.length > 1 ? [`derived from ${derivedScopes.length} candidate boundary scopes`] : [],
    derived_scopes: derivedScopes
  };
}

function deriveBoundaryScopes(appPaths, workstreamPaths, lockType) {
  const candidates = uniqueList([...appPaths, ...workstreamPaths].map((item) => normalizeLockScope(item)).filter(Boolean));
  if (candidates.length === 0) return [];
  const filtered = lockType === "file"
    ? candidates.filter((item) => item.includes("."))
    : candidates.filter((item) => !item.includes("."));
  const usable = filtered.length > 0 ? filtered : candidates;
  if (appPaths.length > 0 && workstreamPaths.length > 0) {
    const overlap = [];
    for (const appPath of appPaths) {
      const normalizedApp = normalizeLockScope(appPath);
      for (const streamPath of workstreamPaths) {
        const normalizedStream = normalizeLockScope(streamPath);
        if (pathScopeContains(normalizedApp, normalizedStream)) overlap.push(normalizedStream);
        else if (pathScopeContains(normalizedStream, normalizedApp)) overlap.push(normalizedApp);
      }
    }
    if (overlap.length > 0) {
      const overlapCandidates = uniqueList(overlap.map((item) => normalizeLockScope(item)));
      const overlapFiltered = lockType === "file"
        ? overlapCandidates.filter((item) => item.includes("."))
        : overlapCandidates.filter((item) => !item.includes("."));
      return overlapFiltered.length > 0 ? overlapFiltered : overlapCandidates;
    }
  }
  return usable;
}

function selectNarrowestScope(scopes) {
  const unique = uniqueList((scopes || []).map((item) => normalizeLockScope(item)).filter(Boolean));
  if (unique.length === 0) return "";
  const sorted = [...unique].sort((left, right) => right.length - left.length);
  const top = sorted.filter((item) => item.length === sorted[0].length);
  if (top.length > 1) {
    throw new Error(`Unable to derive a unique lock scope from task boundaries: ${top.join(", ")}. Provide --scope explicitly.`);
  }
  return sorted[0];
}

function isScopeInsideDerivedBoundary(requested, derivedScopes) {
  const normalizedRequested = normalizeLockScope(requested);
  return (derivedScopes || []).some((scope) => {
    const normalizedScope = normalizeLockScope(scope);
    return normalizedRequested === normalizedScope || pathScopeContains(normalizedScope, normalizedRequested);
  });
}

function locksOverlap(existing, requested, deps = {}) {
  const existingType = normalizeLockType(existing.type);
  const requestedType = normalizeLockType(requested.type);
  const existingScope = normalizeLockScope(existing.scope);
  const requestedScope = normalizeLockScope(requested.scope);
  const getWorkstreamPathRules = deps.getWorkstreamPathRules || null;

  if (!existingScope || !requestedScope) return false;
  if (existingType === requestedType && existingScope === requestedScope) return true;

  if (existingType === "task" || requestedType === "task") {
    return String(existing.task_id || "").toLowerCase() && String(requested.task_id || "").toLowerCase() && normalizeLockScope(existing.task_id) === normalizeLockScope(requested.task_id);
  }

  if (existingType === "workstream" || requestedType === "workstream") {
    if (existingType === "workstream" && requestedType === "workstream") {
      return existingScope === requestedScope;
    }
    const workstreamScope = existingType === "workstream" ? existingScope : requestedScope;
    const pathScope = existingType === "workstream" ? requestedScope : existingScope;
    return workstreamScopeContainsPath(workstreamScope, pathScope, getWorkstreamPathRules);
  }

  if (existingType === "folder" && ["folder", "file"].includes(requestedType)) {
    return pathScopeContains(existingScope, requestedScope);
  }

  if (requestedType === "folder" && ["folder", "file"].includes(existingType)) {
    return pathScopeContains(requestedScope, existingScope);
  }

  return false;
}

function workstreamScopeContainsPath(workstreamId, scope, getWorkstreamPathRules) {
  const normalizedWorkstream = normalizeLockScope(workstreamId);
  const normalizedScope = normalizeLockScope(scope);
  if (!normalizedWorkstream || !normalizedScope) return false;
  const rules = typeof getWorkstreamPathRules === "function" ? getWorkstreamPathRules(normalizedWorkstream) : [normalizedWorkstream];
  return (rules || []).some((rule) => {
    const normalizedRule = normalizeLockScope(rule);
    if (!normalizedRule) return false;
    if (normalizedRule.includes("*")) {
      const escaped = normalizedRule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(normalizedScope);
    }
    return normalizedScope === normalizedRule || normalizedScope.startsWith(`${normalizedRule}/`) || normalizedScope.startsWith(normalizedRule);
  });
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

function normalizePathRule(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function pathScopeContains(parent, child) {
  return child === parent || child.startsWith(`${parent}/`);
}

function requireDep(deps, name) {
  if (typeof deps[name] !== "function") throw new Error(`Missing lock dependency: ${name}`);
  return deps[name];
}

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

module.exports = {
  lock,
  findLockConflict,
  locksOverlap,
  normalizeLockType,
  normalizeLockScope,
  pathScopeContains
};
