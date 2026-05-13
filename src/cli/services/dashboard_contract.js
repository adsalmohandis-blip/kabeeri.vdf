function buildDashboardContracts(state = {}) {
  const workspace = state.workspace || {};
  const technical = state.technical || {};
  const business = state.business || {};
  const records = state.records || {};
  return {
    dashboard: {
      version: "dashboard-contract-v1",
      ok: Boolean(
        workspace && workspace.name && workspace.repo_root && workspace.live_dashboard
        && technical && technical.generated_at && technical.tasks && technical.ai_usage
        && business && business.generated_at && Array.isArray(business.customer_apps || business.apps) && Array.isArray(business.features || [])
        && records && Array.isArray(records.tasks) && records.evolution_summary
      ),
      sections: {
        workspace: Boolean(workspace.name && workspace.repo_root && workspace.live_dashboard),
        technical: Boolean(technical.generated_at && technical.tasks && technical.ai_usage),
        business: Boolean(business.generated_at && Array.isArray(business.customer_apps || business.apps) && Array.isArray(business.features || [])),
        records: Boolean(Array.isArray(records.tasks) && records.evolution_summary)
      }
    },
    task_tracker: {
      version: "task-tracker-contract-v1",
      ok: Boolean(state.task_tracker && state.task_tracker.generated_at && state.task_tracker.summary && Array.isArray(state.task_tracker.tasks)),
      sections: {
        generated_at: Boolean(state.task_tracker && state.task_tracker.generated_at),
        summary: Boolean(state.task_tracker && state.task_tracker.summary),
        records: Boolean(state.task_tracker && Array.isArray(state.task_tracker.tasks))
      }
    }
  };
}

function validateDashboardContracts(state = {}) {
  const contracts = buildDashboardContracts(state);
  const failures = [];
  if (!contracts.dashboard.ok) failures.push("dashboard contract failed");
  if (!contracts.task_tracker.ok) failures.push("task tracker contract failed");
  return { contracts, ok: failures.length === 0, failures };
}

module.exports = {
  buildDashboardContracts,
  validateDashboardContracts
};
