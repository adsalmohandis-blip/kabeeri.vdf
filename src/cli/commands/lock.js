const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function lock(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit } = deps;
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
    if (!flags.scope) throw new Error("Missing --scope.");
    if (!flags.task) throw new Error("Missing --task.");
    if (!flags.owner) throw new Error("Missing --owner.");
    if (flags.actor && flags.actor !== flags.owner) {
      requireAnyRole(flags, ["Owner", "Maintainer"], "create lock for another actor");
    } else {
      requireAnyRole({ ...flags, actor: flags.owner }, ["Owner", "Maintainer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"], "create lock");
    }
    const activeConflict = findLockConflict(data.locks, { type: flags.type, scope: flags.scope, task_id: flags.task });
    if (activeConflict) throw new Error(`Active lock conflict: ${activeConflict.lock_id} (${activeConflict.type}:${activeConflict.scope})`);
    const item = {
      lock_id: `lock-${String(data.locks.length + 1).padStart(3, "0")}`,
      type: flags.type,
      scope: flags.scope,
      task_id: flags.task,
      owner_id: flags.owner,
      reason: flags.reason || "",
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null
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

function findLockConflict(locks, requested) {
  return (locks || []).find((lockItem) => {
    if (lockItem.status !== "active") return false;
    if (lockItem.lock_id === requested.lock_id) return false;
    return locksOverlap(lockItem, requested);
  });
}

function locksOverlap(existing, requested) {
  const existingType = normalizeLockType(existing.type);
  const requestedType = normalizeLockType(requested.type);
  const existingScope = normalizeLockScope(existing.scope);
  const requestedScope = normalizeLockScope(requested.scope);

  if (!existingScope || !requestedScope) return false;
  if (existingType === requestedType && existingScope === requestedScope) return true;

  if (existingType === "workstream" || requestedType === "workstream") {
    return existingType === "workstream" && requestedType === "workstream" && existingScope === requestedScope;
  }

  if (existingType === "folder" && ["folder", "file"].includes(requestedType)) {
    return pathScopeContains(existingScope, requestedScope);
  }

  if (requestedType === "folder" && ["folder", "file"].includes(existingType)) {
    return pathScopeContains(requestedScope, existingScope);
  }

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

module.exports = {
  lock,
  findLockConflict,
  locksOverlap,
  normalizeLockType,
  normalizeLockScope,
  pathScopeContains
};
