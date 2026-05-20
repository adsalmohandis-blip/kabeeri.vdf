const { buildTruthAuditReport, buildTruthAuditFeatureResult, buildPlannerTruthReport, reconcileRuntimeTruth } = require("./truth_registry");

function buildTruthFeatureReport(featureId) {
  return buildTruthAuditFeatureResult(featureId);
}

function buildTruthAudit() {
  return buildTruthAuditReport();
}

function buildPlannerTruth() {
  return buildPlannerTruthReport();
}

function buildEvolutionReconciliation() {
  const reconciliation = reconcileRuntimeTruth();
  const runtimePlanner = reconciliation.runtime_planner_state || {};
  const runtimeEvolution = reconciliation.runtime_evolution_state || {};
  const runtimeTasks = reconciliation.runtime_tasks_state || {};
  return {
    report_type: "kvdf_evolution_reconciliation",
    done_total: Array.isArray(runtimeEvolution.changes) ? runtimeEvolution.changes.filter((change) => ["done", "verified", "closed"].includes(String(change.status || "").toLowerCase())).length : 0,
    planned_total: Array.isArray(runtimeEvolution.development_priorities) ? runtimeEvolution.development_priorities.filter((item) => ["planned", "proposed", "recommended"].includes(String(item.status || "").toLowerCase())).length : 0,
    future_total: Array.isArray(runtimeEvolution.deferred_ideas) ? runtimeEvolution.deferred_ideas.length : 0,
    stale_planned: reconciliation.stale_planned,
    stale_recommended: reconciliation.stale_recommended,
    duplicate_task_links: reconciliation.duplicate_task_links,
    orphan_tasks: reconciliation.orphan_tasks,
    runtime_only_evolutions: reconciliation.runtime_only_evolutions,
    source_implemented_features: reconciliation.source_implemented_features,
    recommended_cleanup_actions: buildCleanupActions(reconciliation),
    runtime_planner_state: runtimePlanner,
    runtime_evolution_state: runtimeEvolution,
    runtime_tasks_state: runtimeTasks
  };
}

function buildCleanupActions(reconciliation) {
  const actions = [];
  if (reconciliation.stale_planned.length) actions.push("Update stale planned runtime items so they no longer point at already implemented capabilities.");
  if (reconciliation.stale_recommended.length) actions.push("Trim stale recommended runtime items that duplicate current source-level features.");
  if (reconciliation.duplicate_task_links.length) actions.push("Deduplicate task links so each task has one governed evolution owner unless explicitly shared.");
  if (reconciliation.orphan_tasks.length) actions.push("Assign or archive orphan tasks that are no longer linked to a live evolution.");
  if (reconciliation.runtime_only_evolutions.length) actions.push("Promote runtime-only evolutions into source/docs/tests or remove them from runtime state.");
  if (!actions.length) actions.push("No cleanup actions required.");
  return actions;
}

module.exports = {
  buildTruthFeatureReport,
  buildTruthAudit,
  buildPlannerTruth,
  buildEvolutionReconciliation
};
