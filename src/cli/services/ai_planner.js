function normalizeAiList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPlannedAiCandidatePoolFromEntries(entries, options = {}) {
  const items = Array.isArray(entries) ? entries : [];
  const mapEntry = typeof options.mapEntry === "function"
    ? options.mapEntry
    : (entry) => ({
        agent_id: entry && (entry.agent_id || entry.id || entry.ai_id),
        agent_name: entry && (entry.agent_name || entry.name || entry.label || entry.id || entry.ai_id),
        provider: entry && (entry.provider || "unknown"),
        model: entry && (entry.model || "unknown"),
        role: entry && (entry.role || "worker"),
        capabilities: normalizeAiList(entry && (entry.capabilities || entry.skills || entry.tags || entry.capability || [])),
        leader_eligible: entry && entry.leader_eligible !== false,
        active_queue_count: Number(entry && entry.active_queue_count) || 0,
        entered_at: entry && (entry.entered_at || entry.created_at || entry.updated_at || null),
        last_seen_at: entry && (entry.last_seen_at || entry.updated_at || entry.created_at || null),
        queue_labels: normalizeAiList(entry && (entry.queue_labels || entry.labels || entry.workstreams || []))
      });
  return items
    .map((entry, index) => mapEntry(entry, index))
    .filter((candidate) => candidate && candidate.agent_id);
}

function resolvePlannedAiCandidateFromList(candidates, flags = {}, options = {}) {
  const explicitKeys = Array.isArray(options.explicitKeys) ? options.explicitKeys : ["ai"];
  for (const key of explicitKeys) {
    const explicit = flags[key];
    const normalizedExplicit = String(explicit || "").trim();
    if (normalizedExplicit) return normalizedExplicit;
  }
  const searchText = buildPlanningSearchText(flags, options.searchKeys, options.fallbackText);
  const filtered = (Array.isArray(candidates) ? candidates : []).filter((candidate) => candidate && candidate.agent_id && candidate.agent_id !== options.excludeAgentId);
  if (!filtered.length) return null;
  const scored = filtered.map((candidate) => ({
    candidate,
    score: scorePlannedAiCandidate(candidate, searchText)
  })).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return compareDates(
      left.candidate.last_seen_at || left.candidate.entered_at || "1970-01-01T00:00:00.000Z",
      right.candidate.last_seen_at || right.candidate.entered_at || "1970-01-01T00:00:00.000Z"
    );
  });
  return scored[0] ? scored[0].candidate.agent_id : null;
}

function resolvePlannedAiCandidates(candidates, flags = {}, options = {}) {
  const searchText = buildPlanningSearchText(flags, options.searchKeys, options.fallbackText);
  return (Array.isArray(candidates) ? candidates : [])
    .filter((candidate) => candidate && candidate.agent_id && candidate.agent_id !== options.excludeAgentId)
    .map((candidate) => ({
      candidate,
      score: scorePlannedAiCandidate(candidate, searchText)
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return compareDates(
        left.candidate.last_seen_at || left.candidate.entered_at || "1970-01-01T00:00:00.000Z",
        right.candidate.last_seen_at || right.candidate.entered_at || "1970-01-01T00:00:00.000Z"
      );
    })
    .map((item) => item.candidate);
}

function buildGovernanceCandidatePool(state) {
  const activeQueues = Array.isArray(state && state.worker_queues) ? state.worker_queues.filter((queue) => queue.status === "active" && queue.ai_id) : [];
  const agents = Array.isArray(state && state.agent_entries) ? state.agent_entries : [];
  const byAgentId = new Map();
  for (const entry of agents) {
    const agentId = entry && (entry.agent_id || entry.id || entry.ai_id);
    if (!agentId) continue;
    const candidate = byAgentId.get(agentId) || {
      agent_id: agentId,
      agent_name: entry.name || entry.agent_name || agentId,
      provider: entry.provider || "unknown",
      model: entry.model || "unknown",
      role: entry.role || "worker",
      capabilities: normalizeAiList(entry.capabilities || entry.skills || entry.tags || entry.capability || []),
      leader_eligible: entry.leader_eligible !== false,
      active_queue_count: 0,
      entered_at: entry.created_at || entry.updated_at || null,
      last_seen_at: entry.updated_at || entry.created_at || null,
      queue_labels: []
    };
    byAgentId.set(agentId, candidate);
  }
  for (const queue of activeQueues) {
    const queueAgentId = queue && (queue.ai_id || queue.agent_id || queue.id);
    if (!queueAgentId) continue;
    const candidate = byAgentId.get(queueAgentId) || {
      agent_id: queueAgentId,
      agent_name: queue.ai_name || queue.agent_name || queueAgentId,
      provider: queue.provider || "unknown",
      model: queue.model || "unknown",
      role: queue.role || "worker",
      capabilities: normalizeAiList(queue.capabilities || queue.skills || queue.tags || queue.capability || []),
      leader_eligible: queue.leader_eligible !== false,
      active_queue_count: 0,
      entered_at: queue.created_at || queue.updated_at || null,
      last_seen_at: queue.updated_at || queue.created_at || null,
      queue_labels: []
    };
    candidate.active_queue_count = (candidate.active_queue_count || 0) + 1;
    candidate.queue_labels = normalizeAiList([...(candidate.queue_labels || []), queue.assignment_mode || queue.status || "active"]);
    candidate.capabilities = normalizeAiList([...(candidate.capabilities || []), ...(queue.capabilities || []), ...(queue.skills || []), ...(queue.tags || [])]);
    candidate.last_seen_at = candidate.last_seen_at || queue.updated_at || queue.created_at || null;
    byAgentId.set(queueAgentId, candidate);
  }
  return Array.from(byAgentId.values());
}

function resolvePlannedWorkersForDistribution(state, leaderSession, temporaryQueue, flags) {
  const candidates = resolvePlannedAiCandidates(buildGovernanceCandidatePool(state), {
    title: temporaryQueue ? temporaryQueue.source_priority_title : flags.title,
    name: temporaryQueue ? temporaryQueue.source_priority_title : flags.name,
    label: flags.label,
    description: temporaryQueue ? temporaryQueue.source_priority_summary : flags.description,
    summary: temporaryQueue ? temporaryQueue.source_priority_summary : flags.summary,
    topic: temporaryQueue ? temporaryQueue.source_priority_title : flags.topic
  }, {
    excludeAgentId: leaderSession ? leaderSession.leader_ai_id : null
  });
  const limit = Math.max(1, Math.min(3, Array.isArray(temporaryQueue && temporaryQueue.slices) ? temporaryQueue.slices.length : 0 || 1));
  return candidates.slice(0, limit).map((candidate) => candidate.agent_id);
}

function buildPlanningSearchText(flags = {}, searchKeys = [], fallbackText = "") {
  const keys = Array.isArray(searchKeys) && searchKeys.length
    ? searchKeys
    : ["title", "name", "label", "description", "summary", "topic", "request", "message", "subject"];
  const values = keys.map((key) => flags[key]).filter(Boolean);
  if (fallbackText) values.unshift(fallbackText);
  return String(values.join(" ")).trim().toLowerCase();
}

function scorePlannedAiCandidate(candidate, priorityText) {
  const labelText = String([
    candidate.agent_id,
    candidate.agent_name,
    candidate.provider,
    candidate.model,
    candidate.role,
    ...(candidate.capabilities || []),
    ...(candidate.queue_labels || [])
  ].join(" ")).trim().toLowerCase();
  const capabilityText = String((candidate.capabilities || []).join(" ")).trim().toLowerCase();
  let score = 0;
  if (!candidate.active_queue_count) score += 3;
  if (priorityText.includes("review") || priorityText.includes("validate") || priorityText.includes("test") || priorityText.includes("qa")) {
    if (/(review|qa|test|validate|check|audit)/.test(labelText)) score += 6;
  }
  if (priorityText.includes("relay") || priorityText.includes("conversation") || priorityText.includes("inbox") || priorityText.includes("dispatch")) {
    if (/(relay|conversation|inbox|dispatch|assistant|agent)/.test(labelText)) score += 5;
    if (/(coordinator|orchestrator)/.test(candidate.role) || (candidate.queue_labels && candidate.queue_labels.includes("relay"))) score += 6;
    if (/(coordinator|orchestrator|dispatcher|relay|communications|inbox|conversation)/.test(capabilityText)) score += 4;
  }
  if (priorityText.includes("docs") || priorityText.includes("doc") || priorityText.includes("report") || priorityText.includes("sync")) {
    if (/(doc|docs|report|writer|sync)/.test(labelText)) score += 4;
  }
  if (priorityText.includes("implement") || priorityText.includes("runtime") || priorityText.includes("service") || priorityText.includes("backend") || priorityText.includes("api")) {
    if (/(code|implement|dev|backend|api|runtime|service)/.test(labelText)) score += 4;
  }
  if (priorityText.includes("ui") || priorityText.includes("frontend") || priorityText.includes("design")) {
    if (/(ui|frontend|design|layout|visual)/.test(labelText)) score += 4;
  }
  score -= candidate.active_queue_count || 0;
  return score;
}

function compareDates(left, right) {
  return new Date(left).getTime() - new Date(right).getTime();
}

module.exports = {
  resolvePlannedAiCandidateFromList,
  resolvePlannedAiCandidates,
  normalizeAiList,
  buildPlannedAiCandidatePoolFromEntries,
  buildGovernanceCandidatePool,
  resolvePlannedWorkersForDistribution,
  buildPlanningSearchText,
  scorePlannedAiCandidate
};
