function buildSessionHandoff(item) {
  const contract = item.contract || {};
  const scope = item.scope || contract.scope || {};
  const outputContract = item.output_contract || {};
  const evidence = item.handoff_evidence || [];
  const lines = [
    `# AI Session Handoff - ${item.session_id}`,
    "",
    `Task: ${item.task_id}`,
    `Developer: ${item.developer_id}`,
    `Provider/Model: ${item.provider}/${item.model}`,
    `Started: ${item.started_at}`,
    `Ended: ${item.ended_at || ""}`,
    "",
    "## Session Contract",
    `Contract type: ${contract.contract_type || "ai_session"}`,
    `Task title: ${contract.task_title || ""}`,
    `Task status: ${contract.task_status || ""}`,
    `Token: ${contract.token_id || item.token_id || ""}`,
    `Scope mode: ${scope.scope_mode || ""}`,
    `Scope source: ${scope.scope_source || ""}`,
    `Workstreams: ${(scope.workstreams || []).join(", ") || "None"}`,
    `Allowed files: ${(scope.allowed_files || []).join(", ") || "None"}`,
    "",
    "## Summary",
    item.summary || "No summary provided.",
    "",
    "## Files Changed",
    ...(item.files_touched || []).map((file) => `- ${file}`),
    "",
    "## Checks Run",
    ...(item.checks_run || []).map((check) => `- ${check}`),
    "",
    "## Risks",
    ...(item.risks || []).map((risk) => `- ${risk}`),
    "",
    "## Known Limitations",
    ...(item.known_limitations || []).map((limitation) => `- ${limitation}`),
    "",
    "## Needs Review",
    item.needs_review || "Not specified.",
    "",
    "## Next Suggested Task",
    item.next_suggested_task || "None.",
    "",
    "## Output Contract",
    `Summary: ${outputContract.summary || item.summary || ""}`,
    `Files touched: ${(outputContract.files_touched || item.files_touched || []).join(", ") || "None"}`,
    `Checks run: ${(outputContract.checks_run || item.checks_run || []).join(", ") || "None"}`,
    `Risks: ${(outputContract.risks || item.risks || []).join(", ") || "None"}`,
    `Known limitations: ${(outputContract.known_limitations || item.known_limitations || []).join(", ") || "None"}`,
    `Needs review: ${outputContract.needs_review || item.needs_review || "Not specified."}`,
    `Next suggested task: ${outputContract.next_suggested_task || item.next_suggested_task || "None."}`,
    "",
    "## Handoff Evidence",
    ...(evidence.length ? evidence.map((entry) => `- ${entry.evidence_type}: ${entry.path}`) : ["- None recorded."]),
    "",
    "## Usage",
    `Input tokens: ${item.input_tokens || 0}`,
    `Output tokens: ${item.output_tokens || 0}`,
    `Cached tokens: ${item.cached_tokens || 0}`,
    `Total tokens: ${item.total_tokens || 0}`,
    `Cost: ${item.cost || 0}`
  ];
  return `${lines.join("\n")}\n`;
}

module.exports = {
  buildSessionHandoff
};
