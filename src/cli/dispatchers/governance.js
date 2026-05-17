const { handled } = require("./shared");

function dispatchGovernanceCommands({ group, action, value, flags, c }) {
  if (group === "budget") return handled(c.budget(action, value, flags, { requireAnyRole: c.requireAnyRole, appendAudit: c.appendAudit, getEffectiveActor: c.getEffectiveActor, getOwnerActor: c.getOwnerActor }));
  if (group === "pricing") return handled(c.pricing(action, value, flags, { requireAnyRole: c.requireAnyRole, appendAudit: c.appendAudit }));
  if (group === "usage") return handled(c.usage(action, value, flags, { refreshDashboardArtifacts: c.refreshDashboardArtifacts, appendAudit: c.appendAudit }));
  if (group === "design") return handled(c.design(action, value, flags));
  if (group === "policy") return handled(c.policy(action, value, flags));
  if (group === "context-pack" || group === "context") return handled(c.contextPack(action, value, flags, { appendAudit: c.appendAudit, getTaskById: c.getTaskById, calculateUsageCost: c.calculateUsageCost, getPricingCurrency: c.getPricingCurrency }));
  if (group === "preflight") return handled(c.preflight(action, value, flags, { appendAudit: c.appendAudit, getTaskById: c.getTaskById, calculateUsageCost: c.calculateUsageCost, getPricingCurrency: c.getPricingCurrency }));
  if (group === "model-route" || group === "routing") return handled(c.modelRoute(action, value, flags));
  if (group === "handoff") return handled(c.handoff(action, value, flags, { runPolicyGate: c.runPolicyGate, collectDashboardState: c.collectDashboardState, summarizeUsage: c.summarizeUsage, appendAudit: c.appendAudit, getEffectiveActor: c.getEffectiveActor }));
  if (group === "security") return handled(c.security(action, value, flags, { appendAudit: c.appendAudit }));
  if (group === "migration" || group === "migrate") return handled(c.migration(action, value, flags, { requireAnyRole: c.requireAnyRole, getEffectiveActor: c.getEffectiveActor, appendAudit: c.appendAudit }));
  return null;
}

module.exports = {
  dispatchGovernanceCommands
};
