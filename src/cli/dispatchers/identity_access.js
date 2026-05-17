const { handled } = require("./shared");

function dispatchIdentityAccessCommands({ group, action, value, flags, c }) {
  if (group === "developer") return handled(c.identity("developers", action, value, flags, { requireAnyRole: c.requireAnyRole, parseCsv: c.parseCsv, validateKnownWorkstreams: c.validateKnownWorkstreams, appendAudit: c.appendAudit }));
  if (group === "owner") return handled(c.owner(action, value, flags, { appendAudit: c.appendAudit, ensureNoOtherOwner: c.ensureNoOtherOwner, requireOwnerAuthority: c.requireOwnerAuthority, isExpired: c.isExpired }));
  if (group === "agent") return handled(c.identity("agents", action, value, flags, { requireAnyRole: c.requireAnyRole, parseCsv: c.parseCsv, validateKnownWorkstreams: c.validateKnownWorkstreams, appendAudit: c.appendAudit }));
  if (group === "lock") return handled(c.lock(action, value, flags, { requireAnyRole: c.requireAnyRole, appendAudit: c.appendAudit, getWorkstreamPathRules: c.getWorkstreamPathRules, getTaskById: c.getTaskById, taskWorkstreams: c.taskWorkstreams, getTaskAppPaths: c.getTaskAppPaths, validateKnownWorkstreams: c.validateKnownWorkstreams }));
  if (group === "token") return handled(c.token(action, value, flags, {
    requireAnyRole: c.requireAnyRole,
    appendAudit: c.appendAudit,
    getTaskById: c.getTaskById,
    taskWorkstreams: c.taskWorkstreams,
    validateKnownWorkstreams: c.validateKnownWorkstreams,
    getTaskAppPaths: c.getTaskAppPaths,
    getWorkstreamPathRules: c.getWorkstreamPathRules,
    normalizeLockScope: c.normalizeLockScope,
    normalizePathRule: c.normalizePathRule,
    pathScopeContains: c.pathScopeContains,
    parseCsv: c.parseCsv,
    assertAssigneeCanTakeTask: c.assertAssigneeCanTakeTask,
    hasConfiguredIdentities: c.hasConfiguredIdentities,
    getIdentity: c.getIdentity
  }));
  return null;
}

module.exports = {
  dispatchIdentityAccessCommands
};
