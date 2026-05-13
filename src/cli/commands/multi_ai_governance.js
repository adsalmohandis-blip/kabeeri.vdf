const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { synchronizeRelayWithGovernance } = require("./multi_ai_communications");
const { ensureEvolutionDevelopmentPriorities } = require("../services/evolution");
const {
  resolvePlannedAiCandidateFromList,
  resolvePlannedAiCandidates,
  buildGovernanceCandidatePool,
  resolvePlannedWorkersForDistribution: resolvePlannedWorkersForDistributionService
} = require("../services/ai_planner");

function multiAiGovernance(action, value, flags = {}, deps = {}) {
  const { appendAudit, rest = [] } = deps;
  ensureWorkspace();
  const file = ".kabeeri/multi_ai_governance.json";
  if (!localFileExists(file)) writeJsonFile(file, defaultMultiAiGovernanceState());
  const state = readJsonFile(file);
  ensureMultiAiGovernanceState(state);

  if (!action || action === "status" || action === "summary") {
    ensureAutoLeaderSession(state, flags, appendAudit, "status");
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "status" });
    const report = buildMultiAiGovernanceReport(state);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderMultiAiGovernanceReport(report));
    return;
  }

  if (action === "leader") {
    const result = handleLeaderAction(state, value, flags, appendAudit, rest);
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "leader" });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderLeaderResult(result));
    return;
  }

  if (action === "agent") {
    const result = handleAgentAction(state, value, flags, appendAudit, rest);
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "agent" });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderAgentResult(result));
    return;
  }

  if (action === "queue") {
    ensureAutoLeaderSession(state, flags, appendAudit, "queue");
    const result = handleQueueAction(state, value, flags, appendAudit, rest);
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "queue" });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderQueueResult(result));
    return;
  }

  if (action === "merge") {
    ensureAutoLeaderSession(state, flags, appendAudit, "merge");
    const result = handleMergeAction(state, value, flags, appendAudit, rest);
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "merge" });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderMergeResult(result));
    return;
  }

  if (action === "sync" || action === "align" || action === "distribute") {
    ensureAutoLeaderSession(state, flags, appendAudit, "sync");
    const result = handleSyncAction(state, action, value, flags, appendAudit, rest);
    state.last_relay_sync = synchronizeRelayWithGovernance(state, { reason: "sync" });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderSyncResult(result));
    return;
  }

  throw new Error(`Unknown multi-ai action: ${action}`);
}

function handleLeaderAction(state, value, flags, appendAudit, rest = []) {
  const subaction = normalizeSubaction(value, flags);
  if (!subaction || subaction === "status" || subaction === "show") {
    return buildMultiAiGovernanceReport(state);
  }

  if (subaction === "start" || subaction === "enter" || subaction === "claim") {
    const leaderAiId = resolveLeaderAiId(flags, value);
    const existing = getActiveLeaderSession(state);
    if (existing && existing.leader_ai_id === leaderAiId && !flags.force) {
      return {
        report_type: "multi_ai_leader_started",
        generated_at: new Date().toISOString(),
        leader_session: existing,
        reused: true
      };
    }
    if (existing && existing.leader_ai_id !== leaderAiId && !flags.transfer && !flags.force) {
      throw new Error(`Leader session already active: ${existing.leader_ai_id}. Use --transfer or --force to replace it.`);
    }
    if (existing && existing.leader_ai_id !== leaderAiId) {
      existing.status = "transferred";
      existing.ended_at = new Date().toISOString();
      existing.updated_at = existing.ended_at;
      existing.superseded_by_session_id = flags.session || null;
    }
    const now = new Date().toISOString();
    const activePriority = getCurrentEvolutionPriority();
    const session = {
      session_id: flags.session || nextLeaderSessionId(state),
      leader_ai_id: leaderAiId,
      leader_name: flags.name || flags.label || leaderAiId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      role: "orchestrator",
      delegated_execution_allowed: isTruthyFlag(flags["allow-execution"]) || isTruthyFlag(flags.execution) || isTruthyFlag(flags.delegated),
      delegated_by_owner_id: flags.owner || flags["owner-id"] || null,
      delegated_scope: flags.scope || null,
      source: flags.source || (existing ? "leader_transfer" : "first_ai_session"),
      current_priority_id: activePriority ? activePriority.id : null,
      current_priority_title: activePriority ? activePriority.title : null,
      current_priority_status: activePriority ? activePriority.status : null,
      current_temporary_queue_id: null,
      current_temporary_slice_id: null,
      current_temporary_slice_title: null,
      status: "active",
      started_at: now,
      updated_at: now
    };
    state.leader_sessions.push(session);
    state.active_leader_session_id = session.session_id;
    state.updated_at = now;
    if (appendAudit) {
      appendAudit("multi_ai.leader_started", "multi_ai", session.session_id, `Leader session started for ${leaderAiId}`);
    }
    return {
      report_type: "multi_ai_leader_started",
      generated_at: now,
      leader_session: session
    };
  }

  if (subaction === "ensure" || subaction === "auto" || subaction === "claim-auto") {
    const existing = getActiveLeaderSession(state);
    if (existing) {
      return {
        report_type: "multi_ai_leader_ensured",
        generated_at: new Date().toISOString(),
        leader_session: existing,
        reused: true
      };
    }
    const leaderAiId = resolveLeaderAiId(flags, value);
    const now = new Date().toISOString();
    const activePriority = getCurrentEvolutionPriority();
    const session = {
      session_id: flags.session || nextLeaderSessionId(state),
      leader_ai_id: leaderAiId,
      leader_name: flags.name || flags.label || leaderAiId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      role: "orchestrator",
      delegated_execution_allowed: isTruthyFlag(flags["allow-execution"]) || isTruthyFlag(flags.execution) || isTruthyFlag(flags.delegated),
      delegated_by_owner_id: flags.owner || flags["owner-id"] || null,
      delegated_scope: flags.scope || null,
      source: flags.source || "auto_elected",
      current_priority_id: activePriority ? activePriority.id : null,
      current_priority_title: activePriority ? activePriority.title : null,
      current_priority_status: activePriority ? activePriority.status : null,
      current_temporary_queue_id: null,
      current_temporary_slice_id: null,
      current_temporary_slice_title: null,
      status: "active",
      started_at: now,
      updated_at: now,
      auto_elected: true
    };
    state.leader_sessions.push(session);
    state.active_leader_session_id = session.session_id;
    state.updated_at = now;
    if (appendAudit) {
      appendAudit("multi_ai.leader_auto_elected", "multi_ai", session.session_id, `Leader session auto-elected for ${leaderAiId}`);
    }
    return {
      report_type: "multi_ai_leader_ensured",
      generated_at: now,
      leader_session: session
    };
  }

  if (subaction === "transfer") {
    const nextLeaderAiId = flags.ai || flags.to || flags.leader || flags.developer;
    if (!nextLeaderAiId) throw new Error("Missing --ai.");
    const current = getActiveLeaderSession(state);
    if (!current) throw new Error("No active leader session exists.");
    const now = new Date().toISOString();
    current.status = "transferred";
    current.ended_at = now;
    current.updated_at = now;
    const session = {
      session_id: flags.session || nextLeaderSessionId(state),
      leader_ai_id: nextLeaderAiId,
      leader_name: flags.name || flags.label || nextLeaderAiId,
      provider: flags.provider || current.provider || "unknown",
      model: flags.model || current.model || "unknown",
      role: "orchestrator",
      delegated_execution_allowed: isTruthyFlag(flags["allow-execution"]) || current.delegated_execution_allowed,
      delegated_by_owner_id: flags.owner || current.delegated_by_owner_id || null,
      delegated_scope: flags.scope || current.delegated_scope || null,
      source: "leader_transfer",
      current_priority_id: current.current_priority_id || null,
      current_priority_title: current.current_priority_title || null,
      current_priority_status: current.current_priority_status || null,
      current_temporary_queue_id: current.current_temporary_queue_id || null,
      current_temporary_slice_id: current.current_temporary_slice_id || null,
      current_temporary_slice_title: current.current_temporary_slice_title || null,
      status: "active",
      started_at: now,
      updated_at: now,
      previous_session_id: current.session_id
    };
    state.leader_sessions.push(session);
    state.active_leader_session_id = session.session_id;
    state.updated_at = now;
    if (appendAudit) {
      appendAudit("multi_ai.leader_transferred", "multi_ai", session.session_id, `Leader session transferred to ${nextLeaderAiId}`);
    }
    return {
      report_type: "multi_ai_leader_transferred",
      generated_at: now,
      previous_leader_session: current,
      leader_session: session
    };
  }

  if (subaction === "call" || subaction === "ask" || subaction === "request" || subaction === "dispatch" || subaction === "delegate") {
    return recordLeaderDispatch(state, flags, appendAudit, subaction);
  }

  if (subaction === "end" || subaction === "close") {
    const current = getActiveLeaderSession(state);
    if (!current) throw new Error("No active leader session exists.");
    const now = new Date().toISOString();
    current.status = "ended";
    current.ended_at = now;
    current.updated_at = now;
    retireAgentEntryForLeader(state, current.leader_ai_id, now, "ended");
    state.active_leader_session_id = null;
    const promoted = promoteNextLeaderFromAgents(state, appendAudit, now, "leader_end", { excludeAgentId: current.leader_ai_id });
    state.updated_at = now;
    if (appendAudit) {
      appendAudit("multi_ai.leader_ended", "multi_ai", current.session_id, `Leader session ended for ${current.leader_ai_id}`);
    }
    return {
      report_type: "multi_ai_leader_ended",
      generated_at: now,
      leader_session: current,
      next_leader_session: promoted
    };
  }

  if (subaction === "release" || subaction === "relinquish" || subaction === "step-down" || subaction === "yield") {
    const current = getActiveLeaderSession(state);
    if (!current) {
      return {
        report_type: "multi_ai_leader_released",
        generated_at: new Date().toISOString(),
        leader_session: null,
        released: true
      };
    }
    const now = new Date().toISOString();
    current.status = "relinquished";
    current.ended_at = now;
    current.updated_at = now;
    retireAgentEntryForLeader(state, current.leader_ai_id, now, "relinquished");
    state.active_leader_session_id = null;
    const promoted = promoteNextLeaderFromAgents(state, appendAudit, now, "leader_release", { excludeAgentId: current.leader_ai_id });
    state.updated_at = now;
    if (appendAudit) {
      appendAudit("multi_ai.leader_relinquished", "multi_ai", current.session_id, `Leader session relinquished for ${current.leader_ai_id}`);
    }
    return {
      report_type: "multi_ai_leader_released",
      generated_at: now,
      leader_session: current,
      next_leader_session: promoted
    };
  }

  throw new Error(`Unknown multi-ai leader action: ${subaction}`);
}

function handleAgentAction(state, value, flags, appendAudit, rest = []) {
  const subaction = normalizeSubaction(value, flags);
  if (!subaction || subaction === "list" || subaction === "show") {
    return buildAgentHubReport(state);
  }

  if (["register", "enter", "join", "start", "claim"].includes(subaction)) {
    const entry = recordAgentEntry(state, flags, appendAudit, subaction);
    const leaderSession = ensureLeaderFromAgentHub(state, flags, appendAudit, entry);
    const becameLeader = leaderSession && leaderSession.leader_ai_id === entry.agent_id && leaderSession.leader_entry_id === entry.entry_id;
    return {
      report_type: becameLeader ? "multi_ai_agent_entered_and_leader" : "multi_ai_agent_entered",
      generated_at: entry.entered_at,
      agent_entry: entry,
      active_leader_session: leaderSession || getActiveLeaderSession(state)
    };
  }

  if (["heartbeat", "ping", "touch"].includes(subaction)) {
    const entry = upsertAgentHeartbeat(state, flags, appendAudit);
    return {
      report_type: "multi_ai_agent_heartbeat",
      generated_at: entry.updated_at,
      agent_entry: entry
    };
  }

  if (["call", "ask", "notify", "request"].includes(subaction)) {
    return recordLeaderCall(state, flags, appendAudit, subaction);
  }

  if (["next", "claim-next", "autonomy", "take-next"].includes(subaction)) {
    return claimAutonomousPriority(state, flags, appendAudit);
  }

  if (["respond", "answer", "reply"].includes(subaction)) {
    return respondToLeaderCall(state, flags, appendAudit);
  }

  if (["leave", "disconnect", "release", "end"].includes(subaction)) {
    return leaveAgentHub(state, flags, appendAudit);
  }

  throw new Error(`Unknown multi-ai agent action: ${subaction}`);
}

function buildAgentHubReport(state) {
  const activeLeaderSession = getActiveLeaderSession(state);
  const communications = readMultiAiCommunicationsSnapshot();
  return {
    report_type: "multi_ai_agent_hub_status",
    generated_at: new Date().toISOString(),
    active_leader_session: activeLeaderSession,
    leader_lease: activeLeaderSession ? {
      lease_expires_at: activeLeaderSession.lease_expires_at || null,
      last_heartbeat_at: activeLeaderSession.last_heartbeat_at || null,
      lease_seconds: state.lease_policy.lease_seconds
    } : null,
    agent_entries: state.agent_entries,
    call_inbox: state.call_inbox,
    autonomy_claims: state.autonomy_claims,
    autonomy_board: buildAutonomyBoard(state),
    conversation_hub: communications ? {
      state_file: ".kabeeri/multi_ai_communications.json",
      conversations: communications.counts.conversations,
      open_conversations: communications.counts.open_conversations,
      pending_messages: communications.counts.pending_messages
    } : null,
    lease_policy: state.lease_policy,
    counts: {
      agents: state.agent_entries.length,
      active_agents: state.agent_entries.filter((item) => item.status === "active").length,
      pending_calls: state.call_inbox.filter((item) => item.status === "pending").length,
      autonomy_claims: state.autonomy_claims.length,
      conversations: communications ? communications.counts.conversations : 0,
      open_conversations: communications ? communications.counts.open_conversations : 0,
      pending_messages: communications ? communications.counts.pending_messages : 0
    }
  };
}

function resolveAgentHubId(flags = {}, fallback = "") {
  const candidate = flags.ai || flags.agent || flags["agent-id"] || flags.developer || flags.leader || process.env.KVDF_MULTI_AI_ID || process.env.KVDF_AI_ID || process.env.KVDF_AGENT_ID || fallback;
  const normalized = String(candidate || "").trim();
  return normalized || "agent-unknown";
}

function resolveLeaderEligibility(flags = {}, existingEntry = null) {
  if (isTruthyFlag(flags["leader-eligible"]) || isTruthyFlag(flags.leader_eligible) || isTruthyFlag(flags["allow-leadership"])) {
    return true;
  }
  if (isTruthyFlag(flags["worker-only"]) || isTruthyFlag(flags.worker_only)) {
    return false;
  }
  const explicitRole = String(flags.role || existingEntry?.role || "").trim().toLowerCase();
  if (explicitRole === "leader") return true;
  if (explicitRole === "worker") return false;
  const provider = String(flags.provider || existingEntry?.provider || "").trim().toLowerCase();
  const model = String(flags.model || existingEntry?.model || "").trim().toLowerCase();
  const agentId = String(flags.ai || flags.agent || flags["agent-id"] || existingEntry?.agent_id || "").trim().toLowerCase();
  const agentName = String(flags.name || flags.label || existingEntry?.agent_name || "").trim().toLowerCase();
  const disallowedProviders = ["gemini", "google", "bard"];
  if ([provider, model, agentId, agentName].some((value) => disallowedProviders.some((token) => value.includes(token)))) {
    return false;
  }
  if (typeof existingEntry?.leader_eligible === "boolean") {
    return existingEntry.leader_eligible;
  }
  return true;
}

function resolveAutonomyLeaderEligibility(flags = {}, existingEntry = null) {
  if (isTruthyFlag(flags["leader-eligible"]) || isTruthyFlag(flags.leader_eligible) || isTruthyFlag(flags["allow-leadership"])) {
    return true;
  }
  if (isTruthyFlag(flags["worker-only"]) || isTruthyFlag(flags.worker_only)) {
    return false;
  }
  if (String(flags.role || existingEntry?.role || "").trim().toLowerCase() === "leader") {
    return true;
  }
  return false;
}

function recordAgentEntry(state, flags, appendAudit, source) {
  const now = new Date().toISOString();
  const agentId = resolveAgentHubId(flags, source);
  let entry = state.agent_entries.find((item) => item.agent_id === agentId);
  if (!entry) {
    entry = {
      entry_id: `multi-ai-agent-${String(state.agent_entries.length + 1).padStart(3, "0")}`,
      agent_id: agentId,
      agent_name: flags.name || flags.label || agentId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      role: flags.role || "worker",
      capabilities: normalizeAiList(flags.capabilities || flags.skills || flags.tags || flags.capability || []),
      leader_eligible: resolveLeaderEligibility(flags, null),
      status: "active",
      entered_at: now,
      last_seen_at: now,
      entered_source: source,
      notes: flags.notes || flags.note || null
    };
    state.agent_entries.push(entry);
  } else {
    entry.status = "active";
    entry.agent_name = flags.name || flags.label || entry.agent_name;
    entry.provider = flags.provider || entry.provider || "unknown";
    entry.model = flags.model || entry.model || "unknown";
    entry.role = flags.role || entry.role || "worker";
    if (flags.capabilities || flags.skills || flags.tags || flags.capability) {
      entry.capabilities = normalizeAiList(flags.capabilities || flags.skills || flags.tags || flags.capability || []);
    } else {
      entry.capabilities = normalizeAiList(entry.capabilities || []);
    }
    entry.leader_eligible = resolveLeaderEligibility(flags, entry);
    entry.last_seen_at = now;
    entry.reentered_at = now;
    entry.updated_at = now;
  }
  if (appendAudit) {
    appendAudit("multi_ai.agent_entered", "multi_ai", entry.entry_id, `Agent entered: ${entry.agent_id}`);
  }
  return entry;
}

function upsertAgentHeartbeat(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const agentId = resolveAgentHubId(flags, "heartbeat");
  let entry = state.agent_entries.find((item) => item.agent_id === agentId);
  if (!entry) {
    entry = recordAgentEntry(state, { ...flags, ai: agentId }, appendAudit, "heartbeat");
  } else {
    entry.last_seen_at = now;
    entry.updated_at = now;
  }
  const leader = getActiveLeaderSession(state);
  if (leader && leader.leader_ai_id === entry.agent_id) {
    refreshLeaderLease(leader, state, now);
  }
  if (appendAudit) {
    appendAudit("multi_ai.agent_heartbeat", "multi_ai", entry.entry_id, `Agent heartbeat: ${entry.agent_id}`);
  }
  return entry;
}

function ensureLeaderFromAgentHub(state, flags, appendAudit, entry) {
  const current = getActiveLeaderSession(state);
  if (current) {
    if (current.leader_ai_id === entry.agent_id) refreshLeaderLease(current, state, new Date().toISOString());
    return current;
  }
  const activeAgents = state.agent_entries
    .filter((item) => item.status === "active" && item.leader_eligible !== false)
    .sort((a, b) => compareDates(a.entered_at, b.entered_at));
  const selected = activeAgents[0] || entry;
  if (!selected || selected.leader_eligible === false) return null;
  const now = new Date().toISOString();
  const session = createLeaderSessionFromAgentEntry(state, selected, flags, now, "agent_hub_first_entry");
  refreshLeaderLease(session, state, now);
  if (appendAudit) {
    appendAudit("multi_ai.leader_promoted_from_agent_hub", "multi_ai", session.session_id, `Leader promoted from agent entry: ${selected.agent_id}`);
  }
  return session;
}

function createLeaderSessionFromAgentEntry(state, entry, flags, now, source) {
  const activePriority = getCurrentEvolutionPriority();
  const session = {
    session_id: flags.session || nextLeaderSessionId(state),
    leader_ai_id: entry.agent_id,
    leader_name: entry.agent_name || entry.agent_id,
    provider: entry.provider || flags.provider || "unknown",
    model: entry.model || flags.model || "unknown",
    role: "orchestrator",
    delegated_execution_allowed: isTruthyFlag(flags.delegated) || isTruthyFlag(flags["allow-execution"]) || false,
    delegated_by_owner_id: flags.owner || flags["owner-id"] || null,
    delegated_scope: flags.scope || null,
    source,
    current_priority_id: activePriority ? activePriority.id : null,
    current_priority_title: activePriority ? activePriority.title : null,
    current_priority_status: activePriority ? activePriority.status : null,
    current_temporary_queue_id: null,
    current_temporary_slice_id: null,
    current_temporary_slice_title: null,
    status: "active",
    started_at: now,
    updated_at: now,
    auto_elected: true,
    leader_entry_id: entry.entry_id,
    leader_eligible: true
  };
  state.leader_sessions.push(session);
  state.active_leader_session_id = session.session_id;
  state.updated_at = now;
  return session;
}

function refreshLeaderLease(leaderSession, state, now) {
  if (!leaderSession) return null;
  const leaseSeconds = Number(state.lease_policy && state.lease_policy.lease_seconds ? state.lease_policy.lease_seconds : 60);
  leaderSession.last_heartbeat_at = now;
  leaderSession.lease_expires_at = addSeconds(now, leaseSeconds);
  leaderSession.updated_at = now;
  return leaderSession;
}

function recordLeaderCall(state, flags, appendAudit, source) {
  const now = new Date().toISOString();
  let leaderSession = getActiveLeaderSession(state);
  if (!leaderSession) {
    leaderSession = ensureAutoLeaderSession(state, flags, appendAudit, "leader_call");
  }
  if (!leaderSession) throw new Error("No active leader session exists.");
  const fromAgentId = resolveAgentHubId(flags, source);
  const requestText = String(flags.request || flags.message || flags.title || flags.subject || "leader call").trim();
  const callKey = [fromAgentId, leaderSession.session_id, requestText].join("|");
  let call = state.call_inbox.find((item) => item.call_key === callKey && item.status === "pending");
  if (!call) {
    call = {
      call_id: `multi-ai-call-${String(state.call_inbox.length + 1).padStart(3, "0")}`,
      call_key: callKey,
      from_agent_id: fromAgentId,
      to_leader_session_id: leaderSession.session_id,
      request: requestText,
      status: "pending",
      attempt_count: 1,
      created_at: now,
      last_called_at: now,
      updated_at: now
    };
    state.call_inbox.push(call);
  } else {
    call.attempt_count += 1;
    call.last_called_at = now;
    call.updated_at = now;
  }
  const windowMs = Number(state.lease_policy.unanswered_window_seconds || 20) * 1000;
  if (call.attempt_count >= Number(state.lease_policy.unanswered_call_limit || 2) && compareDates(now, call.created_at) <= windowMs) {
    const released = forceLeaderReleaseForUnansweredCall(state, leaderSession, appendAudit, call, now);
    return {
      report_type: "multi_ai_leader_call_escalated",
      generated_at: now,
      call,
      previous_leader_session: released.previous_leader_session,
      leader_session: released.leader_session
    };
  }
  if (appendAudit) {
    appendAudit("multi_ai.leader_call_recorded", "multi_ai", call.call_id, `Leader call recorded for ${leaderSession.leader_ai_id}`);
  }
  return {
    report_type: "multi_ai_leader_call_recorded",
    generated_at: now,
    call,
    leader_session: leaderSession
  };
}

function recordLeaderDispatch(state, flags, appendAudit, source) {
  const now = new Date().toISOString();
  let leaderSession = getActiveLeaderSession(state);
  if (!leaderSession) {
    leaderSession = ensureAutoLeaderSession(state, flags, appendAudit, "leader_call");
  }
  if (!leaderSession) throw new Error("No active leader session exists.");
  const requestText = String(flags.request || flags.message || flags.title || flags.subject || "leader dispatch").trim();
  const targetAiId = resolveDispatchTargetAiId(state, flags, leaderSession, requestText);
  if (!targetAiId) throw new Error("Missing --ai or no suitable target agent found.");
  const callKey = [leaderSession.leader_ai_id, targetAiId, leaderSession.session_id, requestText].join("|");
  let call = state.call_inbox.find((item) => item.call_key === callKey && item.status === "pending");
  if (!call) {
    call = {
      call_id: `multi-ai-call-${String(state.call_inbox.length + 1).padStart(3, "0")}`,
      call_key: callKey,
      from_agent_id: leaderSession.leader_ai_id,
      to_agent_id: targetAiId,
      from_leader_session_id: leaderSession.session_id,
      request: requestText,
      status: "pending",
      attempt_count: 1,
      created_at: now,
      last_called_at: now,
      updated_at: now,
      dispatch_mode: "leader_to_agent",
      source
    };
    state.call_inbox.push(call);
  } else {
    call.attempt_count += 1;
    call.last_called_at = now;
    call.updated_at = now;
  }
  if (appendAudit) {
    appendAudit("multi_ai.leader_dispatch_recorded", "multi_ai", call.call_id, `Leader dispatch recorded for ${leaderSession.leader_ai_id} -> ${targetAiId}`);
  }
  return {
    report_type: "multi_ai_leader_dispatch_recorded",
    generated_at: now,
    call,
    leader_session: leaderSession
  };
}

function resolveDispatchTargetAiId(state, flags, leaderSession, requestText) {
  const explicit = flags.ai || flags.to || flags.target || flags["to-ai"];
  const normalizedExplicit = String(explicit || "").trim();
  if (normalizedExplicit) return normalizedExplicit;
  return resolvePlannedAiCandidateFromList(
    buildGovernanceCandidatePool(state),
    {
      request: requestText,
      title: flags.title,
      name: flags.name,
      label: flags.label,
      description: flags.description,
      summary: flags.summary,
      topic: flags.topic
    },
    {
      explicitKeys: [],
      excludeAgentId: leaderSession.leader_ai_id,
      fallbackText: requestText
    }
  );
}

function respondToLeaderCall(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const callId = flags.id || flags.call || flags.call_id || null;
  let call = null;
  if (callId) {
    call = state.call_inbox.find((item) => item.call_id === callId || item.call_key === callId);
  }
  if (!call) call = [...state.call_inbox].reverse().find((item) => item.status === "pending") || null;
  if (!call) throw new Error("No pending leader call found.");
  call.status = "responded";
  call.response = flags.response || flags.reply || flags.message || "responded";
  call.responded_by = resolveAgentHubId(flags, "respond");
  call.responded_at = now;
  call.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.leader_call_responded", "multi_ai", call.call_id, `Leader call responded: ${call.call_id}`);
  }
  return {
    report_type: "multi_ai_leader_call_responded",
    generated_at: now,
    call
  };
}

function claimAutonomousPriority(state, flags, appendAudit) {
  const now = new Date().toISOString();
  let leaderSession = getActiveLeaderSession(state);
  if (!leaderSession) {
    leaderSession = ensureAutoLeaderSession(state, flags, appendAudit, "autonomy");
  }
  if (!leaderSession) throw new Error("An active leader session is required before autonomy claims.");

  const agentId = String(flags.ai || flags.agent || flags["agent-id"] || flags.developer || "").trim();
  if (!agentId) throw new Error("Missing --ai.");
  const claimCount = Math.max(1, Math.min(6, Number(flags.count || flags.limit || 1) || 1));
  const agentName = flags.name || flags.label || null;
  const provider = flags.provider || null;
  const model = flags.model || null;
  const capabilities = normalizeAiList(flags.capabilities || flags.skills || flags.tags || flags.capability || []);

  let entry = state.agent_entries.find((item) => item.agent_id === agentId);
  if (!entry) {
    entry = {
      entry_id: `multi-ai-agent-${String(state.agent_entries.length + 1).padStart(3, "0")}`,
      agent_id: agentId,
      agent_name: agentName || agentId,
      provider: provider || "unknown",
      model: model || "unknown",
      role: flags.role || "worker",
      capabilities,
      leader_eligible: resolveAutonomyLeaderEligibility(flags, null),
      status: "active",
      entered_at: now,
      last_seen_at: now,
      entered_source: "autonomy_claim",
      notes: flags.notes || flags.note || "Auto-registered for priority claiming"
    };
    state.agent_entries.push(entry);
  } else {
    entry.status = "active";
    entry.agent_name = agentName || entry.agent_name || agentId;
    entry.provider = provider || entry.provider || "unknown";
    entry.model = model || entry.model || "unknown";
    entry.role = flags.role || entry.role || "worker";
    if (capabilities.length) entry.capabilities = capabilities;
    entry.leader_eligible = resolveAutonomyLeaderEligibility(flags, entry);
    entry.last_seen_at = now;
    entry.updated_at = now;
  }

  const evolutionSnapshot = readEvolutionSnapshot();
  const priorities = Array.isArray(evolutionSnapshot.state && evolutionSnapshot.state.development_priorities)
    ? evolutionSnapshot.state.development_priorities
    : [];
  const activePriorityId = evolutionSnapshot.active_priority ? evolutionSnapshot.active_priority.id : null;
  const claimedPriorityIds = new Set((state.autonomy_claims || [])
    .filter((claim) => ["claimed", "active", "queued"].includes(claim.status))
    .map((claim) => claim.priority_id));
  const availablePriorities = priorities
    .filter((priority) => priority && priority.id !== activePriorityId && !["done", "deferred", "rejected"].includes(priority.status))
    .filter((priority) => !claimedPriorityIds.has(priority.id))
    .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999));
  const selectedPriorities = availablePriorities.slice(0, claimCount);

  if (!selectedPriorities.length) {
    return {
      report_type: "multi_ai_autonomy_claimed",
      generated_at: now,
      agent_entry: entry,
      leader_session: leaderSession,
      claims: [],
      available_priorities: buildAutonomyPriorityList(availablePriorities, state),
      message: "No unclaimed open priorities were available."
    };
  }

  const queue = ensurePriorityAutonomyQueue(state, leaderSession, entry, flags, now);
  const claims = [];
  for (const priority of selectedPriorities) {
    const claim = createAutonomyClaim(state, queue, entry, leaderSession, priority, flags, now);
    claims.push(claim);
  }
  if (!queue.current_slice_id && queue.slices[0]) {
    queue.current_slice_id = queue.slices[0].slice_id;
  }
  queue.status = "active";
  queue.updated_at = now;
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.autonomy_claimed", "multi_ai", queue.queue_id, `Autonomous priorities claimed by ${agentId}`);
  }
  return {
    report_type: "multi_ai_autonomy_claimed",
    generated_at: now,
    agent_entry: entry,
    leader_session: leaderSession,
    queue,
    claims,
    available_priorities: buildAutonomyPriorityList(availablePriorities.slice(selectedPriorities.length), state)
  };
}

function ensurePriorityAutonomyQueue(state, leaderSession, agentEntry, flags, now) {
  const assignmentMode = "priority_autonomy";
  let queue = state.worker_queues.find((item) => item.leader_session_id === leaderSession.session_id && item.ai_id === agentEntry.agent_id && item.status === "active" && item.assignment_mode === assignmentMode);
  if (queue) return queue;
  queue = {
    queue_id: flags.id || `multi-ai-queue-${String(state.worker_queues.length + 1).padStart(3, "0")}`,
    leader_session_id: leaderSession.session_id,
    ai_id: agentEntry.agent_id,
    ai_name: agentEntry.agent_name || agentEntry.agent_id,
    provider: agentEntry.provider || "unknown",
    model: agentEntry.model || "unknown",
    capabilities: normalizeAiList(agentEntry.capabilities || []),
    evolution_priority_id: null,
    evolution_priority_title: null,
    source_priority_queue_id: null,
    source_priority_id: null,
    source_priority_title: null,
    assignment_mode: assignmentMode,
    tool_symbol: flags.symbol || agentEntry.agent_id,
    status: "active",
    created_at: now,
    updated_at: now,
    current_slice_id: null,
    source_priority_slice_ids: [],
    slices: []
  };
  state.worker_queues.push(queue);
  return queue;
}

function createAutonomyClaim(state, queue, agentEntry, leaderSession, priority, flags, now) {
  const queueSliceId = `slice-${String(queue.slices.length + 1).padStart(3, "0")}`;
  const claimId = `multi-ai-autonomy-${String(state.autonomy_claims.length + 1).padStart(3, "0")}`;
  const claim = {
    claim_id: claimId,
    agent_id: agentEntry.agent_id,
    agent_name: agentEntry.agent_name || agentEntry.agent_id,
    queue_id: queue.queue_id,
    slice_id: queueSliceId,
    leader_session_id: leaderSession.session_id,
    priority_id: priority.id,
    priority_title: priority.title,
    priority_order: Number(priority.priority || 0),
    assignment_mode: queue.assignment_mode,
    status: "claimed",
    created_at: now,
    updated_at: now
  };
  state.autonomy_claims.push(claim);
  const slice = createQueueSlice(queue, `Claim priority: ${priority.title}`, {
    id: queueSliceId,
    description: priority.summary || priority.description || "",
    done: (priority.execution_details && priority.execution_details.execution_summary) || priority.summary || `Complete ${priority.title} and report back.`,
    files: Array.isArray(priority.execution_details && priority.execution_details.included_surfaces) ? priority.execution_details.included_surfaces : [],
    source_slice_id: priority.id,
    source_priority_id: priority.id,
    assigned_ai_id: agentEntry.agent_id,
    assigned_by_leader_session_id: leaderSession.session_id,
    tool_symbol: flags.symbol || agentEntry.agent_id,
    provenance_tag: `autonomy:${priority.id}:${agentEntry.agent_id}`
  });
  slice.state = queue.slices.length === 0 ? "active" : "queued";
  queue.slices.push(slice);
  queue.source_priority_slice_ids.push(priority.id);
  if (queue.slices.length === 1) {
    queue.current_slice_id = slice.slice_id;
  }
  if (!queue.evolution_priority_id) {
    queue.evolution_priority_id = priority.id;
    queue.evolution_priority_title = priority.title;
    queue.source_priority_id = priority.id;
    queue.source_priority_title = priority.title;
  }
  return claim;
}

function buildAutonomyPriorityList(priorities, state) {
  const activeClaims = new Set((state.autonomy_claims || [])
    .filter((claim) => ["claimed", "active", "queued"].includes(claim.status))
    .map((claim) => claim.priority_id));
  return (Array.isArray(priorities) ? priorities : []).map((priority) => ({
    priority_id: priority.id,
    priority_order: Number(priority.priority || 0),
    title: priority.title,
    status: priority.status,
    claimed: activeClaims.has(priority.id)
  }));
}

function leaveAgentHub(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const agentId = resolveAgentHubId(flags, "leave");
  const entry = state.agent_entries.find((item) => item.agent_id === agentId);
  if (entry) {
    entry.status = "inactive";
    entry.left_at = now;
    entry.updated_at = now;
  }
  const currentLeader = getActiveLeaderSession(state);
  let promotion = null;
  if (currentLeader && currentLeader.leader_ai_id === agentId) {
    promotion = releaseAndPromoteNextLeader(state, appendAudit, now, "agent_left");
  }
  if (appendAudit) {
    appendAudit("multi_ai.agent_left", "multi_ai", entry ? entry.entry_id : agentId, `Agent left hub: ${agentId}`);
  }
  return {
    report_type: "multi_ai_agent_left",
    generated_at: now,
    agent_entry: entry,
    previous_leader_session: promotion ? promotion.previous_leader_session : currentLeader,
    active_leader_session: promotion ? promotion.leader_session : getActiveLeaderSession(state)
  };
}

function forceLeaderReleaseForUnansweredCall(state, leaderSession, appendAudit, call, now) {
  const current = leaderSession || getActiveLeaderSession(state);
  if (!current) {
    return { previous_leader_session: null, leader_session: null };
  }
  current.status = "relinquished";
  current.ended_at = now;
  current.updated_at = now;
  current.released_due_to_call_id = call.call_id;
  current.released_due_to_call_attempts = call.attempt_count;
  retireAgentEntryForLeader(state, current.leader_ai_id, now, "unanswered_call");
  state.active_leader_session_id = null;
  const promoted = promoteNextLeaderFromAgents(state, appendAudit, now, "unanswered_call", { excludeAgentId: current.leader_ai_id });
  if (appendAudit) {
    appendAudit("multi_ai.leader_released_unanswered_call", "multi_ai", current.session_id, `Leader released after unanswered calls for ${current.leader_ai_id}`);
  }
  return { previous_leader_session: current, leader_session: promoted };
}

function releaseAndPromoteNextLeader(state, appendAudit, now, reason) {
  const current = getActiveLeaderSession(state);
  if (!current) return { previous_leader_session: null, leader_session: null };
  current.status = "relinquished";
  current.ended_at = now;
  current.updated_at = now;
  retireAgentEntryForLeader(state, current.leader_ai_id, now, "agent_left");
  state.active_leader_session_id = null;
  const promoted = promoteNextLeaderFromAgents(state, appendAudit, now, reason, { excludeAgentId: current.leader_ai_id });
  return { previous_leader_session: current, leader_session: promoted };
}

function retireAgentEntryForLeader(state, leaderAiId, now, reason) {
  if (!leaderAiId) return null;
  const entry = state.agent_entries.find((item) => item.agent_id === leaderAiId);
  if (!entry) return null;
  entry.status = "inactive";
  entry.released_at = now;
  entry.release_reason = reason;
  entry.updated_at = now;
  return entry;
}

function promoteNextLeaderFromAgents(state, appendAudit, now, reason, options = {}) {
  const candidates = state.agent_entries
    .filter((item) => item.status === "active" && item.leader_eligible !== false && item.agent_id !== options.excludeAgentId)
    .sort((a, b) => compareDates(a.entered_at, b.entered_at));
  const next = candidates[0] || null;
  if (!next) return null;
  const existing = state.leader_sessions.find((item) => item.leader_ai_id === next.agent_id && item.status === "active");
  if (existing) {
    state.active_leader_session_id = existing.session_id;
    refreshLeaderLease(existing, state, now);
    return existing;
  }
  const session = createLeaderSessionFromAgentEntry(state, next, { source: reason || "leader_promotion" }, now, reason || "leader_promotion");
  refreshLeaderLease(session, state, now);
  if (appendAudit) {
    appendAudit("multi_ai.leader_promoted", "multi_ai", session.session_id, `Leader promoted to ${next.agent_id}`);
  }
  return session;
}

function addSeconds(value, seconds) {
  const base = value instanceof Date ? value : new Date(value);
  const result = new Date(base.getTime());
  result.setUTCSeconds(result.getUTCSeconds() + Number(seconds || 0));
  return result.toISOString();
}

function handleQueueAction(state, value, flags, appendAudit, rest = []) {
  const subaction = normalizeSubaction(value, flags);
  if (!subaction || subaction === "list" || subaction === "show") {
    return {
      report_type: "multi_ai_queue_list",
      generated_at: new Date().toISOString(),
      queues: state.worker_queues
    };
  }

  if (subaction === "add" || subaction === "push") {
    const leaderSession = getActiveLeaderSession(state);
    if (!leaderSession) throw new Error("An active leader session is required before queue assignment.");
    const aiId = resolveQueueAiId(state, flags);
    if (!aiId) throw new Error("Missing --ai.");
    const title = flags.title || flags.name || flags.label;
    if (!title) throw new Error("Missing --title.");
    const queue = ensureWorkerQueue(state, leaderSession.session_id, aiId, flags);
    const slice = createQueueSlice(queue, title, flags);
    queue.slices.push(slice);
    queue.updated_at = slice.updated_at;
    queue.current_slice_id = queue.current_slice_id || slice.slice_id;
    queue.status = "active";
    state.updated_at = queue.updated_at;
    if (appendAudit) {
      appendAudit("multi_ai.queue_slice_added", "multi_ai", queue.queue_id, `Queue slice added for ${aiId}`);
    }
    return {
      report_type: "multi_ai_queue_slice_added",
      generated_at: slice.updated_at,
      queue,
      slice
    };
  }

  if (["claim", "start", "begin", "progress", "advance", "next", "complete", "finish", "block", "handoff"].includes(subaction)) {
    const queueId = flags.id || rest[0] || value;
    if (!queueId) throw new Error("Missing queue id.");
    const queue = state.worker_queues.find((item) => item.queue_id === queueId);
    if (!queue) throw new Error(`Queue not found: ${queueId}`);
    if (subaction === "claim" || subaction === "start" || subaction === "begin") {
      queue.status = "active";
      queue.current_slice_id = queue.current_slice_id || (queue.slices[0] ? queue.slices[0].slice_id : null);
      markQueueCurrentSlice(queue, "active");
      queue.updated_at = new Date().toISOString();
      state.updated_at = queue.updated_at;
      return {
        report_type: "multi_ai_queue_claimed",
        generated_at: queue.updated_at,
        queue,
        current_slice: getQueueCurrentSlice(queue)
      };
    }
    if (subaction === "progress" || subaction === "advance" || subaction === "next") {
      const result = advanceQueueSlice(queue);
      state.updated_at = result.generated_at;
      if (appendAudit) {
        appendAudit("multi_ai.queue_slice_advanced", "multi_ai", queue.queue_id, `Queue advanced for ${queue.ai_id}`);
      }
      return result;
    }
    if (subaction === "complete" || subaction === "finish") {
      const result = completeQueue(queue);
      state.updated_at = result.generated_at;
      if (appendAudit) {
        appendAudit("multi_ai.queue_completed", "multi_ai", queue.queue_id, `Queue completed for ${queue.ai_id}`);
      }
      return result;
    }
    if (subaction === "block") {
      const currentSlice = getQueueCurrentSlice(queue);
      if (currentSlice) {
        currentSlice.state = "blocked";
        currentSlice.updated_at = new Date().toISOString();
      }
      queue.status = "blocked";
      queue.updated_at = new Date().toISOString();
      state.updated_at = queue.updated_at;
      return {
        report_type: "multi_ai_queue_blocked",
        generated_at: queue.updated_at,
        queue,
        current_slice: currentSlice
      };
    }
    if (subaction === "handoff") {
      const targetAiId = flags.ai || flags.to || flags.target || flags.assignee;
      if (!targetAiId) throw new Error("Missing target AI id.");
      queue.ai_id = targetAiId;
      queue.ai_name = flags.name || flags.label || targetAiId;
      queue.tool_symbol = flags.symbol || targetAiId;
      queue.assignment_mode = "handoff";
      queue.updated_at = new Date().toISOString();
      state.updated_at = queue.updated_at;
      if (appendAudit) {
        appendAudit("multi_ai.queue_handoff", "multi_ai", queue.queue_id, `Queue handed off to ${targetAiId}`);
      }
      return {
        report_type: "multi_ai_queue_handed_off",
        generated_at: queue.updated_at,
        queue
      };
    }
  }

  if (subaction === "clear" || subaction === "close") {
    const queueId = flags.id || rest[0] || value;
    if (!queueId) throw new Error("Missing queue id.");
    const queue = state.worker_queues.find((item) => item.queue_id === queueId);
    if (!queue) throw new Error(`Queue not found: ${queueId}`);
    queue.status = "closed";
    queue.closed_at = new Date().toISOString();
    queue.updated_at = queue.closed_at;
    state.updated_at = queue.updated_at;
    if (appendAudit) {
      appendAudit("multi_ai.queue_closed", "multi_ai", queue.queue_id, `Queue closed for ${queue.ai_id}`);
    }
    return {
      report_type: "multi_ai_queue_closed",
      generated_at: queue.updated_at,
      queue
    };
  }

  throw new Error(`Unknown multi-ai queue action: ${subaction}`);
}

function handleMergeAction(state, value, flags, appendAudit, rest = []) {
  const subaction = normalizeSubaction(value, flags);
  if (!subaction || subaction === "list" || subaction === "show") {
    return {
      report_type: "multi_ai_merge_list",
      generated_at: new Date().toISOString(),
      merge_bundles: state.merge_bundles
    };
  }

  if (subaction === "add" || subaction === "record") {
    const leaderSession = getActiveLeaderSession(state);
    if (!leaderSession) throw new Error("An active leader session is required before recording merge bundles.");
    const sourceQueueIds = parseCsvLike(flags.sources || flags.queues || flags.from);
    const title = flags.title || flags.name || flags.label || "Multi-AI merge bundle";
    const summary = flags.summary || flags.description || "";
    const bundle = {
      bundle_id: flags.id || nextMergeBundleId(state),
      leader_session_id: leaderSession.session_id,
      source_queue_ids: sourceQueueIds,
      source_ai_ids: resolveSourceAiIds(state, sourceQueueIds),
      target_priority_id: flags.priority || flags.priority_id || leaderSession.current_priority_id || null,
      title,
      summary,
      status: "pending_validation",
      manifest: {
        title,
        summary,
        files: parseCsvLike(flags.files || ""),
        merge_strategy: flags.strategy || "semantic",
        owner_delegated: isTruthyFlag(flags.delegated) || isTruthyFlag(flags["allow-execution"]),
        contributors: sourceQueueIds.map((queueId) => {
          const queue = state.worker_queues.find((item) => item.queue_id === queueId || item.ai_id === queueId);
          return queue ? { ai_id: queue.ai_id, tool_symbol: queue.tool_symbol || queue.ai_id, queue_id: queue.queue_id } : null;
        }).filter(Boolean)
      },
      validation: {
        status: "not_run",
        checks: []
      },
      semantic_merge: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    state.merge_bundles.push(bundle);
    state.updated_at = bundle.updated_at;
    if (appendAudit) {
      appendAudit("multi_ai.merge_bundle_recorded", "multi_ai", bundle.bundle_id, `Merge bundle recorded for ${leaderSession.session_id}`);
    }
    return {
      report_type: "multi_ai_merge_bundle_recorded",
      generated_at: bundle.created_at,
      bundle
    };
  }

  if (subaction === "preview" || subaction === "plan" || subaction === "semantic") {
    const bundleId = flags.id || rest[0] || value;
    if (!bundleId) throw new Error("Missing bundle id.");
    const bundle = state.merge_bundles.find((item) => item.bundle_id === bundleId);
    if (!bundle) throw new Error(`Merge bundle not found: ${bundleId}`);
    const semanticMerge = buildSemanticMergePlan(state, bundle);
    bundle.semantic_merge = semanticMerge;
    bundle.updated_at = semanticMerge.generated_at;
    state.updated_at = bundle.updated_at;
    return {
      report_type: "multi_ai_merge_bundle_preview",
      generated_at: semanticMerge.generated_at,
      bundle,
      semantic_merge: semanticMerge
    };
  }

  if (subaction === "commit" || subaction === "finalize" || subaction === "merge") {
    const bundleId = flags.id || rest[0] || value;
    if (!bundleId) throw new Error("Missing bundle id.");
    const bundle = state.merge_bundles.find((item) => item.bundle_id === bundleId);
    if (!bundle) throw new Error(`Merge bundle not found: ${bundleId}`);
    const semanticMerge = bundle.semantic_merge && bundle.semantic_merge.bundle_id === bundle.bundle_id
      ? bundle.semantic_merge
      : buildSemanticMergePlan(state, bundle);
    bundle.semantic_merge = semanticMerge;
    if (semanticMerge.status === "conflict" && !flags.force) {
      throw new Error("Semantic merge conflict detected. Resolve the overlapping surfaces or use --force only with Owner approval.");
    }
    if (bundle.validation && bundle.validation.status !== "pass" && !flags.force) {
      throw new Error("Merge bundle must validate before commit. Use --force only if the Owner explicitly allows it.");
    }
    bundle.status = "merged";
    bundle.merged_at = new Date().toISOString();
    bundle.updated_at = bundle.merged_at;
    bundle.provenance = buildMergeProvenance(bundle);
    bundle.provenance.semantic_status = semanticMerge.status;
    bundle.provenance.semantic_surface_count = Array.isArray(semanticMerge.files) ? semanticMerge.files.length : 0;
    bundle.provenance.semantic_conflict_count = Array.isArray(semanticMerge.conflicts) ? semanticMerge.conflicts.length : 0;
    bundle.provenance.semantic_review_required = semanticMerge.status !== "semantic_ready";
    for (const queueId of bundle.source_queue_ids || []) {
      const queue = state.worker_queues.find((item) => item.queue_id === queueId);
      if (queue) {
        queue.status = "merged";
        queue.updated_at = bundle.updated_at;
      }
    }
    state.updated_at = bundle.updated_at;
    if (appendAudit) {
      appendAudit("multi_ai.merge_bundle_committed", "multi_ai", bundle.bundle_id, `Merge bundle committed`);
    }
    return {
      report_type: "multi_ai_merge_bundle_committed",
      generated_at: bundle.updated_at,
      bundle
    };
  }

  if (subaction === "validate") {
    const bundleId = flags.id || rest[0] || value;
    if (!bundleId) throw new Error("Missing bundle id.");
    const bundle = state.merge_bundles.find((item) => item.bundle_id === bundleId);
    if (!bundle) throw new Error(`Merge bundle not found: ${bundleId}`);
    const semanticMerge = buildSemanticMergePlan(state, bundle);
    bundle.semantic_merge = semanticMerge;
    bundle.validation = {
      status: semanticMerge.status === "conflict" ? "fail" : "pass",
      checks: parseCsvLike(flags.checks || "evolution-state,locks,schemas,semantic-surface-analysis"),
      validated_at: new Date().toISOString()
    };
    bundle.status = "validated";
    bundle.updated_at = bundle.validation.validated_at;
    state.updated_at = bundle.updated_at;
    if (appendAudit) {
      appendAudit("multi_ai.merge_bundle_validated", "multi_ai", bundle.bundle_id, `Merge bundle validated`);
    }
    return {
      report_type: "multi_ai_merge_bundle_validated",
      generated_at: bundle.updated_at,
      bundle,
      semantic_merge: semanticMerge
    };
  }

  throw new Error(`Unknown multi-ai merge action: ${subaction}`);
}

function handleSyncAction(state, action, value, flags, appendAudit, rest = []) {
  const subaction = normalizeSubaction(value, flags) || "status";
  if (["status", "show", "report", "summary"].includes(subaction)) {
    return buildMultiAiSyncReport(state);
  }

  if (["align", "leader", "leader-sync"].includes(subaction)) {
    return syncWithEvolution(state, flags, appendAudit, { distribute: false });
  }

  if (["distribute", "assign", "hydrate", "run"].includes(subaction)) {
    return syncWithEvolution(state, flags, appendAudit, { distribute: true, rest });
  }

  if (action === "distribute" && !value) {
    return syncWithEvolution(state, flags, appendAudit, { distribute: true, rest });
  }

  throw new Error(`Unknown multi-ai sync action: ${subaction}`);
}

function buildMultiAiGovernanceReport(state) {
  const activeLeaderSession = getActiveLeaderSession(state);
  const activeQueues = state.worker_queues.filter((queue) => queue.status === "active");
  const pendingBundles = state.merge_bundles.filter((bundle) => bundle.status === "pending_validation");
  const evolutionSnapshot = readEvolutionSnapshot();
  const communicationsSnapshot = readMultiAiCommunicationsSnapshot();
  const currentTask = buildMultiAiCurrentTask(activeLeaderSession, evolutionSnapshot);
  return {
    report_type: "multi_ai_governance_status",
    generated_at: new Date().toISOString(),
    evolution_governor: state.evolution_governor,
    evolution_priority: evolutionSnapshot.active_priority,
    evolution_temporary_priority_queue: evolutionSnapshot.temporary_queue,
    active_leader_session: activeLeaderSession,
    agent_hub: buildAgentHubReport(state),
    conversation_hub: communicationsSnapshot ? {
      state_file: ".kabeeri/multi_ai_communications.json",
      conversations: communicationsSnapshot.counts.conversations,
      open_conversations: communicationsSnapshot.counts.open_conversations,
      pending_messages: communicationsSnapshot.counts.pending_messages,
      responded_messages: communicationsSnapshot.counts.responded_messages,
      dispatch_threads: communicationsSnapshot.counts.dispatch_threads || 0
    } : null,
    relay_board: communicationsSnapshot ? communicationsSnapshot.dispatch_board || [] : [],
    current_task: currentTask,
    leader_takeover_ready: !activeLeaderSession,
    leader_sessions: state.leader_sessions,
    worker_queues: state.worker_queues,
    merge_bundles: state.merge_bundles,
    autonomy_board: buildAutonomyBoard(state),
    counts: {
      leader_sessions: state.leader_sessions.length,
      agents: state.agent_entries.length,
      active_agents: state.agent_entries.filter((item) => item.status === "active").length,
      pending_calls: state.call_inbox.filter((item) => item.status === "pending").length,
      conversations: communicationsSnapshot ? communicationsSnapshot.counts.conversations : 0,
      open_conversations: communicationsSnapshot ? communicationsSnapshot.counts.open_conversations : 0,
      pending_messages: communicationsSnapshot ? communicationsSnapshot.counts.pending_messages : 0,
      active_queues: activeQueues.length,
      merge_bundles: state.merge_bundles.length,
      pending_validation_bundles: pendingBundles.length,
      distributed_slices: state.worker_queues.reduce((total, queue) => total + queue.slices.length, 0),
      autonomy_claims: Array.isArray(state.autonomy_claims) ? state.autonomy_claims.length : 0
    },
    ai_instructions: [
      "Before claiming a queue, check `multi-ai status` to see if a Leader is orchestrating the priority.",
      "Do NOT poll status to wait for tasks. Use `kvdf multi-ai relay watch --interval 2000` to wait efficiently.",
      "Merge bundles require semantic validation. Create a bundle and resolve conflicts before committing."
    ]
  };
}

function buildMultiAiSyncReport(state) {
  const report = buildMultiAiGovernanceReport(state);
  return {
    ...report,
    report_type: "multi_ai_sync_status",
    sync_alignment: buildMultiAiAlignment(state, report)
  };
}

function buildAutonomyBoard(state) {
  const evolutionSnapshot = readEvolutionSnapshot();
  const priorities = Array.isArray(evolutionSnapshot.state && evolutionSnapshot.state.development_priorities)
    ? evolutionSnapshot.state.development_priorities
    : [];
  const activePriorityId = evolutionSnapshot.active_priority ? evolutionSnapshot.active_priority.id : null;
  const openPriorities = priorities
    .filter((priority) => priority && priority.id !== activePriorityId && !["done", "deferred", "rejected"].includes(priority.status))
    .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999));
  const activeClaims = Array.isArray(state.autonomy_claims) ? state.autonomy_claims.filter((claim) => ["claimed", "active", "queued"].includes(claim.status)) : [];
  const claimedIds = new Set(activeClaims.map((claim) => claim.priority_id));
  return {
    status: openPriorities.length ? "available" : "empty",
    total_open_priorities: openPriorities.length,
    available_priorities: buildAutonomyPriorityList(openPriorities.filter((priority) => !claimedIds.has(priority.id)), state),
    claims: activeClaims.map((claim) => ({
      claim_id: claim.claim_id,
      agent_id: claim.agent_id,
      agent_name: claim.agent_name,
      queue_id: claim.queue_id,
      slice_id: claim.slice_id,
      priority_id: claim.priority_id,
      priority_title: claim.priority_title,
      priority_order: claim.priority_order,
      status: claim.status,
      created_at: claim.created_at,
      updated_at: claim.updated_at
    }))
  };
}

function renderMultiAiGovernanceReport(report) {
  const agentHub = report.agent_hub || {};
  const conversationHub = report.conversation_hub || {};
  const autonomyBoard = report.autonomy_board || {};
  const lines = [
    "Multi-AI Governance",
    "",
    `Evolution governor: ${report.evolution_governor.evolution_priority_id || "none"}`,
    `Evolution temp queue: ${report.evolution_temporary_priority_queue ? `${report.evolution_temporary_priority_queue.queue_id} (${report.evolution_temporary_priority_queue.status})` : "none"}`,
    `Active leader: ${report.active_leader_session ? `${report.active_leader_session.leader_ai_id} (${report.active_leader_session.session_id})` : "none"}`,
    `Agent hub entries: ${agentHub.counts ? `${agentHub.counts.agents} total, ${agentHub.counts.active_agents} active` : "0 total, 0 active"}`,
    `Pending calls: ${agentHub.counts ? agentHub.counts.pending_calls : 0}`,
    `Conversation threads: ${conversationHub.conversations || 0} total, ${conversationHub.open_conversations || 0} open`,
    `Pending relay messages: ${conversationHub.pending_messages || 0}`,
    `Dispatch threads: ${conversationHub.dispatch_threads || 0}`,
    `Leader lease: ${agentHub.leader_lease && agentHub.leader_lease.lease_expires_at ? `expires ${agentHub.leader_lease.lease_expires_at}` : "none"}`,
    `Current task: ${report.current_task ? `${report.current_task.task_id} - ${report.current_task.title}` : "none"}`,
    `Delegated execution: ${report.active_leader_session && report.active_leader_session.delegated_execution_allowed ? "enabled" : "disabled"}`,
    `Worker queues: ${report.worker_queues.length} (active ${report.counts.active_queues})`,
    `Distributed slices: ${report.counts.distributed_slices}`,
    `Autonomy claims: ${report.counts.autonomy_claims || 0}`,
    `Merge bundles: ${report.counts.merge_bundles}`,
    `Pending validation bundles: ${report.counts.pending_validation_bundles}`,
    `Autonomy board: ${autonomyBoard.total_open_priorities || 0} open / ${Array.isArray(autonomyBoard.claims) ? autonomyBoard.claims.length : 0} claimed`,
    "",
    "Queues:"
  ];
  for (const queue of report.worker_queues) {
    lines.push(`- [${queue.status}] ${queue.ai_id} :: ${queue.queue_id} (${queue.slices.length} slices)`);
  }
  if (!report.worker_queues.length) lines.push("- none");
  lines.push("", "Merge Bundles:");
  for (const bundle of report.merge_bundles) {
    const semanticLabel = bundle.semantic_merge ? ` | semantic=${bundle.semantic_merge.status}` : "";
    lines.push(`- [${bundle.status}] ${bundle.bundle_id} <- ${bundle.source_queue_ids.join(", ") || "none"}${semanticLabel}`);
  }
  if (!report.merge_bundles.length) lines.push("- none");
  return lines.join("\n");
}

function renderSyncResult(result) {
  const alignment = result.sync_alignment || {};
  return [
    "Multi-AI Sync",
    "",
    `Leader: ${result.active_leader_session ? `${result.active_leader_session.leader_ai_id} (${result.active_leader_session.session_id})` : "none"}`,
    `Evolution priority: ${result.evolution_priority ? `${result.evolution_priority.id} - ${result.evolution_priority.title}` : "none"}`,
    `Evolution temp queue: ${result.evolution_temporary_priority_queue ? `${result.evolution_temporary_priority_queue.queue_id} (${result.evolution_temporary_priority_queue.status})` : "none"}`,
    `Alignment: ${alignment.status || "unknown"}`,
    `Worker queues: ${result.worker_queues.length}`,
    `Merge bundles: ${result.merge_bundles.length}`
  ].join("\n");
}

function renderLeaderResult(result) {
  if (result.report_type === "multi_ai_leader_started") return `Leader AI started: ${result.leader_session.leader_ai_id} (${result.leader_session.session_id})`;
  if (result.report_type === "multi_ai_leader_ensured") return `Leader AI ensured: ${result.leader_session.leader_ai_id} (${result.leader_session.session_id})`;
  if (result.report_type === "multi_ai_leader_transferred") return `Leader AI transferred to: ${result.leader_session.leader_ai_id} (${result.leader_session.session_id})`;
  if (result.report_type === "multi_ai_leader_ended") return `Leader AI ended: ${result.leader_session.leader_ai_id} (${result.leader_session.session_id})`;
  if (result.report_type === "multi_ai_leader_released") return result.leader_session ? `Leader AI released: ${result.leader_session.leader_ai_id} (${result.leader_session.session_id})` : "Leader AI released.";
  if (result.report_type === "multi_ai_leader_dispatch_recorded") return `Leader dispatch recorded: ${result.call.call_id} -> ${result.call.to_agent_id}`;
  return "Leader AI updated.";
}

function renderAgentResult(result) {
  if (result.report_type === "multi_ai_agent_entered_and_leader") {
    return `Agent entered and leader promoted: ${result.agent_entry.agent_id} (${result.agent_entry.entry_id})`;
  }
  if (result.report_type === "multi_ai_agent_entered") return `Agent entered: ${result.agent_entry.agent_id} (${result.agent_entry.entry_id})`;
  if (result.report_type === "multi_ai_agent_heartbeat") return `Agent heartbeat: ${result.agent_entry.agent_id} (${result.agent_entry.entry_id})`;
  if (result.report_type === "multi_ai_autonomy_claimed") return `Autonomy claimed: ${result.agent_entry.agent_id} (${result.claims.length} task(s))`;
  if (result.report_type === "multi_ai_leader_call_recorded") return `Leader call recorded: ${result.call.call_id}`;
  if (result.report_type === "multi_ai_leader_call_escalated") return `Leader call escalated and leadership released: ${result.call.call_id}`;
  if (result.report_type === "multi_ai_leader_call_responded") return `Leader call responded: ${result.call.call_id}`;
  if (result.report_type === "multi_ai_agent_left") return `Agent left hub: ${result.agent_entry ? result.agent_entry.agent_id : "unknown"}`;
  return "Agent hub updated.";
}

function renderQueueResult(result) {
  if (result.report_type === "multi_ai_queue_slice_added") return `Queue slice added: ${result.queue.queue_id} -> ${result.slice.slice_id}`;
  if (result.report_type === "multi_ai_queue_closed") return `Queue closed: ${result.queue.queue_id}`;
  if (result.report_type === "multi_ai_queue_claimed") return `Queue claimed: ${result.queue.queue_id}`;
  if (result.report_type === "multi_ai_queue_advanced") return `Queue advanced: ${result.queue.queue_id}`;
  if (result.report_type === "multi_ai_queue_completed") return `Queue completed: ${result.queue.queue_id}`;
  if (result.report_type === "multi_ai_queue_blocked") return `Queue blocked: ${result.queue.queue_id}`;
  if (result.report_type === "multi_ai_queue_handed_off") return `Queue handed off: ${result.queue.queue_id}`;
  return "Queue updated.";
}

function renderMergeResult(result) {
  if (result.report_type === "multi_ai_merge_bundle_recorded") return `Merge bundle recorded: ${result.bundle.bundle_id}`;
  if (result.report_type === "multi_ai_merge_bundle_validated") return `Merge bundle validated: ${result.bundle.bundle_id}`;
  if (result.report_type === "multi_ai_merge_bundle_preview") return `Merge bundle previewed: ${result.bundle.bundle_id}`;
  if (result.report_type === "multi_ai_merge_bundle_committed") return `Merge bundle committed: ${result.bundle.bundle_id}`;
  return "Merge bundle updated.";
}

function defaultMultiAiGovernanceState() {
  return {
    version: "v1",
    evolution_governor: {
      scope: "Evolution",
      description: "Evolution is the global priority governor for Kabeeri framework development.",
      evolution_priority_id: null,
      current_priority_id: null,
      current_priority_title: null,
      current_priority_status: null,
      current_temporary_queue_id: null,
      current_temporary_queue_status: null,
      current_temporary_slice_id: null,
      current_temporary_slice_title: null
    },
    active_leader_session_id: null,
    agent_entries: [],
    call_inbox: [],
    lease_policy: {
      lease_seconds: 60,
      unanswered_window_seconds: 20,
      unanswered_call_limit: 2
    },
    leader_sessions: [],
    worker_queues: [],
    merge_bundles: [],
    autonomy_claims: [],
    audit_trail: [],
    updated_at: null
  };
}

function ensureMultiAiGovernanceState(state) {
  const defaults = defaultMultiAiGovernanceState();
  state.version = state.version || defaults.version;
  state.evolution_governor = mergeObject(defaults.evolution_governor, state.evolution_governor);
  state.active_leader_session_id = state.active_leader_session_id || null;
  state.agent_entries = Array.isArray(state.agent_entries) ? state.agent_entries : [];
  state.call_inbox = Array.isArray(state.call_inbox) ? state.call_inbox : [];
  state.lease_policy = mergeObject(defaults.lease_policy, state.lease_policy);
  state.leader_sessions = Array.isArray(state.leader_sessions) ? state.leader_sessions : [];
  state.worker_queues = Array.isArray(state.worker_queues) ? state.worker_queues : [];
  state.merge_bundles = Array.isArray(state.merge_bundles) ? state.merge_bundles : [];
  state.autonomy_claims = Array.isArray(state.autonomy_claims) ? state.autonomy_claims : [];
  state.audit_trail = Array.isArray(state.audit_trail) ? state.audit_trail : [];
  state.updated_at = state.updated_at || null;
  const activePriority = getCurrentEvolutionPriority();
  if (activePriority) {
    state.evolution_governor.evolution_priority_id = activePriority.id;
    state.evolution_governor.current_priority_id = activePriority.id;
    state.evolution_governor.current_priority_title = activePriority.title;
    state.evolution_governor.current_priority_status = activePriority.status;
  } else {
    state.evolution_governor.current_priority_id = null;
    state.evolution_governor.current_priority_title = null;
    state.evolution_governor.current_priority_status = null;
  }
  const evolutionSnapshot = readEvolutionSnapshot();
  if (evolutionSnapshot.temporary_queue) {
    state.evolution_governor.current_temporary_queue_id = evolutionSnapshot.temporary_queue.queue_id;
    state.evolution_governor.current_temporary_queue_status = evolutionSnapshot.temporary_queue.status;
    state.evolution_governor.current_temporary_slice_id = evolutionSnapshot.temporary_queue.current_slice ? evolutionSnapshot.temporary_queue.current_slice.slice_id : null;
    state.evolution_governor.current_temporary_slice_title = evolutionSnapshot.temporary_queue.current_slice ? evolutionSnapshot.temporary_queue.current_slice.title : null;
  } else {
    state.evolution_governor.current_temporary_queue_id = null;
    state.evolution_governor.current_temporary_queue_status = null;
    state.evolution_governor.current_temporary_slice_id = null;
    state.evolution_governor.current_temporary_slice_title = null;
  }
}

function ensureAutoLeaderSession(state, flags, appendAudit, reason) {
  const current = getActiveLeaderSession(state);
  if (current) {
    const now = new Date().toISOString();
    const activePriority = getCurrentEvolutionPriority();
    const evolutionSnapshot = readEvolutionSnapshot();
    alignLeaderSessionWithEvolution(current, activePriority, evolutionSnapshot.temporary_queue, now);
    state.updated_at = now;
    return current;
  }
  if (flags && (flags["no-auto-leader"] === true || flags["no-auto-leader"] === "true")) return null;
  const now = new Date().toISOString();
  const activePriority = getCurrentEvolutionPriority();
  const activeAgents = state.agent_entries
    .filter((item) => item.status === "active" && item.leader_eligible !== false)
    .sort((a, b) => compareDates(a.entered_at, b.entered_at));
  const hasAnyActiveAgents = state.agent_entries.some((item) => item.status === "active");
  const selectedAgent = activeAgents[0] || null;
  if (!selectedAgent && hasAnyActiveAgents) {
    if (appendAudit) {
      appendAudit("multi_ai.leader_auto_election_blocked", "multi_ai", "multi-ai", "Leader auto-election blocked because no active agents are leader-eligible.");
    }
    return null;
  }
  const leaderAiId = selectedAgent ? selectedAgent.agent_id : resolveLeaderAiId(flags, reason);
  const session = {
    session_id: flags.session || nextLeaderSessionId(state),
    leader_ai_id: leaderAiId,
    leader_name: flags.name || flags.label || leaderAiId,
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    role: "orchestrator",
    delegated_execution_allowed: isTruthyFlag(flags["allow-execution"]) || isTruthyFlag(flags.execution) || isTruthyFlag(flags.delegated),
    delegated_by_owner_id: flags.owner || flags["owner-id"] || null,
    delegated_scope: flags.scope || null,
    source: flags.source || `auto_elected:${reason || "operation"}`,
    current_priority_id: activePriority ? activePriority.id : null,
    current_priority_title: activePriority ? activePriority.title : null,
    current_priority_status: activePriority ? activePriority.status : null,
    current_temporary_queue_id: null,
    current_temporary_slice_id: null,
    current_temporary_slice_title: null,
    status: "active",
    started_at: now,
    updated_at: now,
    auto_elected: true,
    leader_entry_id: selectedAgent ? selectedAgent.entry_id : null,
    source: selectedAgent ? "agent_hub_auto_elected" : `auto_elected:${reason || "operation"}`
  };
  state.leader_sessions.push(session);
  state.active_leader_session_id = session.session_id;
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.leader_auto_elected", "multi_ai", session.session_id, `Leader session auto-elected for ${leaderAiId}`);
  }
  return session;
}

function resolveLeaderAiId(flags = {}, fallback = "") {
  const candidate = flags.ai || flags.leader || flags.developer || flags["leader-ai"] || flags["agent-id"] || process.env.KVDF_MULTI_AI_ID || process.env.KVDF_AI_ID || process.env.KVDF_AGENT_ID || fallback;
  const normalized = String(candidate || "").trim();
  const disallowed = new Set(["start", "enter", "claim", "ensure", "auto", "status", "summary", "queue", "merge", "sync", "align", "distribute"]);
  if (normalized && !disallowed.has(normalized)) return normalized;
  return "auto-leader";
}

function getCurrentEvolutionPriority() {
  const state = readEvolutionSnapshot().state;
  const priorities = Array.isArray(state.development_priorities) ? state.development_priorities : [];
  return priorities.find((item) => item.status === "in_progress") || priorities.find((item) => item.priority === 1) || null;
}

function readEvolutionSnapshot() {
  const evolutionFile = ".kabeeri/evolution.json";
  if (!localFileExists(evolutionFile)) {
    const state = { development_priorities: [], temporary_priorities: null };
    ensureEvolutionDevelopmentPriorities(state);
    return {
      state,
      active_priority: state.development_priorities.find((item) => item.status === "in_progress") || state.development_priorities.find((item) => item.priority === 1) || defaultEvolutionPriority(),
      temporary_queue: null
    };
  }
  const state = readJsonFile(evolutionFile);
  ensureEvolutionDevelopmentPriorities(state);
  const priorities = Array.isArray(state.development_priorities) ? state.development_priorities : [];
  const activePriority = priorities.find((item) => item.status === "in_progress") || priorities.find((item) => item.priority === 1) || defaultEvolutionPriority();
  const persistedQueue = state.temporary_priorities && typeof state.temporary_priorities === "object" ? state.temporary_priorities : null;
  return {
    state,
    active_priority: activePriority,
    temporary_queue: persistedQueue || (activePriority ? buildEphemeralTemporaryQueue(activePriority) : null)
  };
}

function readMultiAiCommunicationsSnapshot() {
  const communicationsFile = ".kabeeri/multi_ai_communications.json";
  if (!localFileExists(communicationsFile)) return null;
  const state = readJsonFile(communicationsFile);
  const conversations = Array.isArray(state.conversations) ? state.conversations : [];
  const messages = conversations.flatMap((conversation) => Array.isArray(conversation.messages) ? conversation.messages.map((message) => ({ ...message, conversation_id: conversation.conversation_id })) : []);
  const dispatchBoard = conversations.filter((conversation) => conversation.relay_type === "dispatch" || conversation.sync_channel === "multi_ai").map((conversation) => ({
    conversation_id: conversation.conversation_id,
    topic: conversation.topic,
    status: conversation.status,
    participants: conversation.participants,
    message_count: Array.isArray(conversation.messages) ? conversation.messages.length : 0,
    pending_messages: Array.isArray(conversation.messages) ? conversation.messages.filter((message) => message.status === "pending").length : 0,
    last_message_at: conversation.last_message_at || conversation.updated_at || null
  }));
  return {
    state,
    conversations,
    counts: {
      conversations: conversations.length,
      open_conversations: conversations.filter((item) => item.status === "open").length,
      closed_conversations: conversations.filter((item) => item.status === "closed").length,
      pending_messages: messages.filter((item) => item.status === "pending").length,
      responded_messages: messages.filter((item) => item.status === "responded").length,
      delivered_messages: messages.filter((item) => item.status === "delivered").length,
      dispatch_threads: dispatchBoard.length
    },
    dispatch_board: dispatchBoard
  };
}

function defaultEvolutionPriority() {
  return {
    id: "evo-auto-044-task-trash-system",
    priority: 1,
    title: "Task Trash System",
    summary: "Default Evolution-governed priority used when a new workspace has not materialized the full priority list yet.",
    status: "planned"
  };
}

function localFileExists(relativePath) {
  const fullPath = path.join(repoRoot(), relativePath);
  return fs.existsSync(fullPath);
}

function buildEphemeralTemporaryQueue(priority) {
  const title = priority.title || priority.id || "Evolution priority";
  const slices = [
    ["scope", `Lock scope for ${title}`, "Restate the active priority, outcome, and boundaries before worker execution."],
    ["map", "Map dependent surfaces", "Name the runtime, schema, docs, tests, reports, and dashboard surfaces that must move together."],
    ["implement", "Implement the coherent change", "Apply the smallest complete change assigned to this worker without spilling into another feature."],
    ["sync", "Sync docs, state, and reports", "Update source-of-truth docs and derived state that reflect this priority."],
    ["validate", "Validate and close the slice", "Run the relevant checks and report risks before handing the result to the leader."]
  ].map(([sliceId, sliceTitle, description], index) => ({
    slice_id: sliceId,
    order: index + 1,
    title: sliceTitle,
    description,
    done_definition: "The leader can merge or review this slice without guessing the worker intent.",
    owner_confirmation_required: false,
    state: index === 0 ? "active" : "pending",
    completed_at: null
  }));
  return {
    queue_id: `${priority.id}-temp`,
    source_priority_id: priority.id,
    source_priority_title: priority.title,
    source_priority_summary: priority.summary || "",
    source_signature: [priority.id, priority.status, priority.updated_at || priority.created_at || ""].join("|"),
    generated_at: new Date().toISOString(),
    ephemeral: true,
    expires_when_priority_changes: true,
    status: "active",
    current_slice_index: 0,
    current_slice: slices[0],
    slices
  };
}

function getActiveLeaderSession(state) {
  const now = new Date().toISOString();
  if (state.active_leader_session_id) {
    const active = state.leader_sessions.find((item) => item.session_id === state.active_leader_session_id);
    if (active && active.status === "active") {
      if (active.lease_expires_at && compareDates(now, active.lease_expires_at) > 0) {
        active.status = "expired";
        active.ended_at = now;
        active.updated_at = now;
        retireAgentEntryForLeader(state, active.leader_ai_id, now, "lease_expired");
        state.active_leader_session_id = null;
        return promoteNextLeaderFromAgents(state, null, now, "lease_expired", { excludeAgentId: active.leader_ai_id });
      }
      return active;
    }
    if (active) {
      state.active_leader_session_id = null;
    }
  }
  const fallback = state.leader_sessions.find((item) => item.status === "active") || null;
  if (fallback && fallback.lease_expires_at && compareDates(now, fallback.lease_expires_at) > 0) {
    fallback.status = "expired";
    fallback.ended_at = now;
    fallback.updated_at = now;
    retireAgentEntryForLeader(state, fallback.leader_ai_id, now, "lease_expired");
    if (state.active_leader_session_id === fallback.session_id) state.active_leader_session_id = null;
    return promoteNextLeaderFromAgents(state, null, now, "lease_expired", { excludeAgentId: fallback.leader_ai_id });
  }
  return fallback;
}

function compareDates(left, right) {
  return new Date(left).getTime() - new Date(right).getTime();
}

function ensureWorkerQueue(state, leaderSessionId, aiId, flags = {}) {
  const assignmentMode = flags.assignment_mode || "manual";
  const existing = state.worker_queues.find((item) => item.leader_session_id === leaderSessionId && item.ai_id === aiId && item.status === "active" && item.assignment_mode === assignmentMode);
  if (existing) return existing;
  const activePriority = getCurrentEvolutionPriority();
  const evolutionSnapshot = readEvolutionSnapshot();
  const now = new Date().toISOString();
  const queue = {
    queue_id: flags.id || `multi-ai-queue-${String(state.worker_queues.length + 1).padStart(3, "0")}`,
    leader_session_id: leaderSessionId,
    ai_id: aiId,
    ai_name: flags.name || flags.label || aiId,
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    capabilities: normalizeAiList(flags.capabilities || flags.skills || flags.tags || flags.capability || []),
    evolution_priority_id: flags.priority || flags.priority_id || (activePriority ? activePriority.id : null),
    evolution_priority_title: activePriority ? activePriority.title : null,
    source_priority_queue_id: evolutionSnapshot.temporary_queue ? evolutionSnapshot.temporary_queue.queue_id : null,
    source_priority_id: evolutionSnapshot.temporary_queue ? evolutionSnapshot.temporary_queue.source_priority_id : null,
    source_priority_title: evolutionSnapshot.temporary_queue ? evolutionSnapshot.temporary_queue.source_priority_title : null,
    assignment_mode: flags.assignment_mode || "manual",
    tool_symbol: flags.symbol || aiId,
    status: "active",
    created_at: now,
    updated_at: now,
    current_slice_id: null,
    source_priority_slice_ids: [],
    slices: []
  };
  state.worker_queues.push(queue);
  return queue;
}

function createQueueSlice(queue, title, flags = {}) {
  const now = new Date().toISOString();
  return {
    slice_id: flags.id || `slice-${String(queue.slices.length + 1).padStart(3, "0")}`,
    order: queue.slices.length + 1,
    title,
    description: flags.description || flags.summary || "",
    done_definition: flags.done || flags["done-definition"] || "Validated and merged by the leader workflow.",
    owner_confirmation_required: isTruthyFlag(flags["owner-confirmation-required"]) || false,
    files: parseCsvLike(flags.files || ""),
    source_slice_id: flags.source_slice_id || null,
    source_priority_id: flags.source_priority_id || queue.source_priority_id || null,
    assigned_ai_id: flags.assigned_ai_id || queue.ai_id,
    assigned_by_leader_session_id: flags.assigned_by_leader_session_id || queue.leader_session_id,
    tool_symbol: flags.tool_symbol || queue.tool_symbol || queue.ai_id,
    provenance_tag: flags.provenance_tag || `${flags.assigned_ai_id || queue.ai_id}:${flags.source_slice_id || "local"}`,
    state: "queued",
    created_at: now,
    updated_at: now
  };
}

function getQueueCurrentSlice(queue) {
  if (!queue || !Array.isArray(queue.slices)) return null;
  if (queue.current_slice_id) {
    const byId = queue.slices.find((slice) => slice.slice_id === queue.current_slice_id);
    if (byId) return byId;
  }
  return queue.slices.find((slice) => slice.state === "active") || queue.slices[0] || null;
}

function markQueueCurrentSlice(queue, stateName) {
  const currentSlice = getQueueCurrentSlice(queue);
  if (!currentSlice) return null;
  currentSlice.state = stateName;
  currentSlice.updated_at = new Date().toISOString();
  queue.current_slice_id = currentSlice.slice_id;
  return currentSlice;
}

function advanceQueueSlice(queue) {
  const now = new Date().toISOString();
  const currentSlice = getQueueCurrentSlice(queue);
  if (!currentSlice) {
    return {
      report_type: "multi_ai_queue_advanced",
      generated_at: now,
      queue,
      completed_slice: null,
      next_slice: null,
      status: queue.status
    };
  }
  currentSlice.state = "done";
  currentSlice.completed_at = now;
  currentSlice.updated_at = now;
  const nextSlice = queue.slices.find((slice) => slice.order > currentSlice.order && slice.state !== "done");
  if (nextSlice) {
    nextSlice.state = "active";
    nextSlice.updated_at = now;
    queue.current_slice_id = nextSlice.slice_id;
    queue.status = "active";
  } else {
    queue.current_slice_id = null;
    queue.status = "completed";
    queue.closed_at = now;
  }
  queue.updated_at = now;
  return {
    report_type: "multi_ai_queue_advanced",
    generated_at: now,
    queue,
    completed_slice: currentSlice,
    next_slice: nextSlice || null,
    status: queue.status
  };
}

function completeQueue(queue) {
  const now = new Date().toISOString();
  const currentSlice = getQueueCurrentSlice(queue);
  for (const slice of queue.slices || []) {
    if (slice.state !== "done") {
      slice.state = "done";
      slice.completed_at = slice.completed_at || now;
      slice.updated_at = now;
    }
  }
  queue.current_slice_id = null;
  queue.status = "completed";
  queue.closed_at = now;
  queue.updated_at = now;
  return {
    report_type: "multi_ai_queue_completed",
    generated_at: now,
    queue,
    completed_slice: currentSlice || null,
    status: queue.status
  };
}

function buildMergeProvenance(bundle) {
  return {
    bundle_id: bundle.bundle_id,
    source_queue_ids: bundle.source_queue_ids || [],
    source_ai_ids: bundle.source_ai_ids || [],
    created_at: bundle.created_at,
    validation_status: bundle.validation ? bundle.validation.status : "not_run",
    committed_at: bundle.merged_at || null
  };
}

function buildSemanticMergePlan(state, bundle) {
  const generatedAt = new Date().toISOString();
  const manifestFiles = parseCsvLike(bundle.manifest && bundle.manifest.files ? bundle.manifest.files : []);
  const sourceQueues = (bundle.source_queue_ids || [])
    .map((queueId) => state.worker_queues.find((item) => item.queue_id === queueId || item.ai_id === queueId))
    .filter(Boolean);
  const files = uniqueStrings([
    ...manifestFiles,
    ...sourceQueues.flatMap((queue) => Array.isArray(queue.slices)
      ? queue.slices.flatMap((slice) => Array.isArray(slice.files) ? slice.files : [])
      : [])
  ]);
  const filePlans = files.map((filePath) => buildSemanticFilePlan(filePath, state, bundle, sourceQueues));
  const reviewItems = filePlans.filter((item) => item.overlap_risk !== "none").map((item) => ({
    file: item.path,
    reason: item.merge_mode === "file-level" ? "shared file requires leader review" : "surface overlap requires semantic review",
    contributors: item.contributors.map((item) => item.ai_id),
    surface_type: item.surface_type
  }));
  const status = reviewItems.length ? "owner_review_required" : "semantic_ready";
  return {
    bundle_id: bundle.bundle_id,
    generated_at: generatedAt,
    status,
    merge_strategy: bundle.manifest && bundle.manifest.merge_strategy ? bundle.manifest.merge_strategy : "semantic",
    source_queue_ids: bundle.source_queue_ids || [],
    source_ai_ids: bundle.source_ai_ids || [],
    files: filePlans,
    review_items: reviewItems,
    summary: {
      file_count: filePlans.length,
      shared_file_count: filePlans.filter((item) => item.contributors.length > 1).length,
      critical_surface_count: filePlans.filter((item) => item.risk_level === "critical").length
    }
  };
}

function buildSemanticFilePlan(filePath, state, bundle, sourceQueues) {
  const contributors = collectFileContributors(filePath, sourceQueues, bundle);
  const surface = classifySemanticSurface(filePath);
  const content = readSemanticFileContent(filePath);
  const sections = buildSemanticSections(filePath, content);
  const contributorIds = uniqueStrings(contributors.map((item) => item.ai_id));
  const overlapRisk = contributors.length > 1 || surface.risk_level === "critical" ? "review" : "none";
  return {
    path: filePath,
    surface_type: surface.surface_type,
    risk_level: surface.risk_level,
    merge_mode: surface.merge_mode,
    contributors,
    contributor_ids: contributorIds,
    sections,
    overlap_risk: overlapRisk,
    notes: surface.notes
  };
}

function collectFileContributors(filePath, sourceQueues, bundle) {
  const bundleContributors = new Map((bundle.manifest && Array.isArray(bundle.manifest.contributors) ? bundle.manifest.contributors : []).map((item) => [item.queue_id, item]));
  const contributors = [];
  for (const queue of sourceQueues) {
    const touched = Array.isArray(queue.slices) && queue.slices.some((slice) => Array.isArray(slice.files) && slice.files.includes(filePath));
    const declared = bundle.manifest && Array.isArray(bundle.manifest.files) && bundle.manifest.files.includes(filePath);
    if (!touched && !declared) continue;
    contributors.push({
      ai_id: queue.ai_id,
      queue_id: queue.queue_id,
      tool_symbol: queue.tool_symbol || queue.ai_id,
      source_slice_ids: uniqueStrings((queue.slices || []).filter((slice) => Array.isArray(slice.files) && slice.files.includes(filePath)).map((slice) => slice.source_slice_id || slice.slice_id)),
      manifest_hint: bundleContributors.has(queue.queue_id) ? bundleContributors.get(queue.queue_id).tool_symbol || null : null
    });
  }
  if (!contributors.length && sourceQueues.length) {
    for (const queue of sourceQueues) {
      contributors.push({
        ai_id: queue.ai_id,
        queue_id: queue.queue_id,
        tool_symbol: queue.tool_symbol || queue.ai_id,
        source_slice_ids: [],
        manifest_hint: null
      });
    }
  }
  return contributors;
}

function classifySemanticSurface(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  const ext = path.extname(normalized).toLowerCase();
  if (normalized === "src/cli/index.js" || normalized.startsWith(".kabeeri/") || normalized.includes("schemas/runtime/") || normalized.includes("knowledge/governance/")) {
    return {
      surface_type: "critical_shared_runtime",
      risk_level: "critical",
      merge_mode: "leader_review",
      notes: "Shared governance or runtime surface requires semantic review before commit."
    };
  }
  if (ext === ".js" || ext === ".mjs" || ext === ".cjs" || ext === ".ts" || ext === ".tsx") {
    return {
      surface_type: "script_module",
      risk_level: "medium",
      merge_mode: "section-aware",
      notes: "Module sections can usually be merged semantically by function and export boundaries."
    };
  }
  if (ext === ".json" || ext === ".jsonc") {
    return {
      surface_type: "structured_data",
      risk_level: "medium",
      merge_mode: "key-aware",
      notes: "Structured data should merge by top-level keys and preserve schema contracts."
    };
  }
  if (ext === ".md" || ext === ".mdx") {
    return {
      surface_type: "document",
      risk_level: "low",
      merge_mode: "section-aware",
      notes: "Documentation merges by heading sections and ordered notes."
    };
  }
  if (ext === ".html" || ext === ".htm") {
    return {
      surface_type: "markup_document",
      risk_level: "low",
      merge_mode: "section-aware",
      notes: "Markup merges by semantic regions such as header, main, section, and script."
    };
  }
  return {
    surface_type: "generic_file",
    risk_level: "low",
    merge_mode: "file-level",
    notes: "Generic files are tracked as full-file semantic units."
  };
}

function readSemanticFileContent(filePath) {
  const fullPath = path.join(repoRoot(), filePath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return "";
  return fs.readFileSync(fullPath, "utf8");
}

function buildSemanticSections(filePath, content) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  const ext = path.extname(normalized).toLowerCase();
  if (!content) {
    return [{ section_id: "full-file", name: "full file", scope: normalized, source: "empty" }];
  }
  if (ext === ".md" || ext === ".mdx") {
    const headings = Array.from(content.matchAll(/^(#{1,6})\s+(.+)$/gm)).map((match, index) => ({
      section_id: `heading-${index + 1}`,
      name: match[2].trim(),
      scope: `heading:${match[1].length}`,
      source: "markdown"
    }));
    return headings.length ? headings : [{ section_id: "full-file", name: "full file", scope: normalized, source: "markdown" }];
  }
  if (ext === ".json" || ext === ".jsonc") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.keys(parsed).map((key, index) => ({
          section_id: `key-${index + 1}`,
          name: key,
          scope: `json:${key}`,
          source: "json"
        }));
      }
    } catch (error) {
      return [{ section_id: "full-file", name: "full file", scope: normalized, source: "json-parse-failed" }];
    }
    return [{ section_id: "full-file", name: "full file", scope: normalized, source: "json" }];
  }
  if (ext === ".js" || ext === ".mjs" || ext === ".cjs" || ext === ".ts" || ext === ".tsx") {
    const sections = [];
    if (/\b(import|require)\b/.test(content)) {
      sections.push({ section_id: "imports", name: "imports", scope: "module-imports", source: "js" });
    }
    const functionNames = Array.from(content.matchAll(/\bfunction\s+([A-Za-z0-9_$]+)/g)).map((match) => match[1]);
    const arrowNames = Array.from(content.matchAll(/\b(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/g)).map((match) => match[1]);
    const classNames = Array.from(content.matchAll(/\bclass\s+([A-Za-z0-9_$]+)/g)).map((match) => match[1]);
    const exportNames = Array.from(content.matchAll(/\bexport\s+(?:default\s+)?(?:function\s+)?([A-Za-z0-9_$]+)/g)).map((match) => match[1]).filter(Boolean);
    const moduleExportNames = Array.from(content.matchAll(/\bmodule\.exports(?:\.[A-Za-z0-9_$]+)?\s*=\s*/g)).map((match, index) => `module-export-${index + 1}`);
    for (const name of uniqueStrings([...functionNames, ...arrowNames, ...classNames, ...exportNames, ...moduleExportNames])) {
      sections.push({
        section_id: name.replace(/[^A-Za-z0-9_$-]/g, "-").toLowerCase(),
        name,
        scope: `symbol:${name}`,
        source: "js-symbol"
      });
    }
    if (!sections.length) {
      sections.push({ section_id: "full-file", name: "full file", scope: normalized, source: "js" });
    }
    return sections;
  }
  if (ext === ".html" || ext === ".htm") {
    const sections = Array.from(content.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)).map((match, index) => ({
      section_id: `section-${index + 1}`,
      name: `section ${index + 1}`,
      scope: "semantic-section",
      source: "html"
    }));
    if (sections.length) return sections;
    return [{ section_id: "full-file", name: "full file", scope: normalized, source: "html" }];
  }
  return [{ section_id: "full-file", name: "full file", scope: normalized, source: "generic" }];
}

function syncWithEvolution(state, flags = {}, appendAudit, options = {}) {
  const { distribute = false, rest = [] } = options;
  const evolutionSnapshot = readEvolutionSnapshot();
  const activePriority = evolutionSnapshot.active_priority;
  const temporaryQueue = evolutionSnapshot.temporary_queue;
  let leaderAiId = flags["leader-ai"] || flags.leader_ai || flags.leader || null;
  let workerAis = normalizeAiList(flags.workers || flags["worker-ais"] || flags.ais || flags["ai-list"] || flags["distributed-ai"] || flags.ai);
  if (!leaderAiId && workerAis.length) {
    leaderAiId = workerAis.shift();
  }
  workerAis = workerAis.filter((aiId) => aiId && aiId !== leaderAiId);
  const now = new Date().toISOString();

  if (activePriority) {
    state.evolution_governor.evolution_priority_id = activePriority.id;
    state.evolution_governor.current_priority_id = activePriority.id;
    state.evolution_governor.current_priority_title = activePriority.title;
    state.evolution_governor.current_priority_status = activePriority.status;
  }
  state.evolution_governor.current_temporary_queue_id = temporaryQueue ? temporaryQueue.queue_id : null;
  state.evolution_governor.current_temporary_queue_status = temporaryQueue ? temporaryQueue.status : null;
  state.evolution_governor.current_temporary_slice_id = temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.slice_id : null;
  state.evolution_governor.current_temporary_slice_title = temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.title : null;

  let leaderSession = getActiveLeaderSession(state);
  if (!leaderSession && leaderAiId) {
    leaderSession = createLeaderSessionFromSync(state, {
      ai: leaderAiId,
      name: flags["leader-name"] || flags.leader_name || flags.name || leaderAiId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      session: flags.session || null,
      source: flags.source || "evolution_sync",
      delegated: isTruthyFlag(flags.delegated) || isTruthyFlag(flags["allow-execution"]),
      owner: flags.owner || flags["owner-id"] || null,
      scope: flags.scope || null
    }, activePriority, temporaryQueue, now);
  } else if (leaderSession) {
    alignLeaderSessionWithEvolution(leaderSession, activePriority, temporaryQueue, now);
  }

  const distribution = distribute && leaderSession
    ? distributeTemporaryPrioritySlices(state, leaderSession, workerAis, temporaryQueue, flags, now)
    : [];

  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.synced_with_evolution", "multi_ai", leaderSession ? leaderSession.session_id : "multi-ai", `Multi-AI sync ran against ${activePriority ? activePriority.id : "no active priority"}`);
  }

  return {
    report_type: distribute ? "multi_ai_sync_distribution" : "multi_ai_sync_alignment",
    generated_at: now,
    evolution_priority: activePriority,
    evolution_temporary_priority_queue: temporaryQueue,
    active_leader_session: leaderSession,
    worker_queues: state.worker_queues,
    merge_bundles: state.merge_bundles,
    distributed_queues: distribution,
    sync_alignment: buildMultiAiAlignment(state, {
      evolution_priority: activePriority,
      evolution_temporary_priority_queue: temporaryQueue,
      active_leader_session: leaderSession,
      worker_queues: state.worker_queues,
      merge_bundles: state.merge_bundles
    })
  };
}

function createLeaderSessionFromSync(state, flags, activePriority, temporaryQueue, now) {
  const session = {
    session_id: flags.session || nextLeaderSessionId(state),
    leader_ai_id: flags.ai,
    leader_name: flags.name || flags.label || flags.ai,
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    role: "orchestrator",
    delegated_execution_allowed: isTruthyFlag(flags.delegated),
    delegated_by_owner_id: flags.owner || null,
    delegated_scope: flags.scope || null,
    source: flags.source || "evolution_sync",
    current_priority_id: activePriority ? activePriority.id : null,
    current_priority_title: activePriority ? activePriority.title : null,
    current_priority_status: activePriority ? activePriority.status : null,
    current_temporary_queue_id: temporaryQueue ? temporaryQueue.queue_id : null,
    current_temporary_slice_id: temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.slice_id : null,
    current_temporary_slice_title: temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.title : null,
    status: "active",
    started_at: now,
    updated_at: now
  };
  state.leader_sessions.push(session);
  state.active_leader_session_id = session.session_id;
  return session;
}

function alignLeaderSessionWithEvolution(leaderSession, activePriority, temporaryQueue, now) {
  leaderSession.current_priority_id = activePriority ? activePriority.id : null;
  leaderSession.current_priority_title = activePriority ? activePriority.title : null;
  leaderSession.current_priority_status = activePriority ? activePriority.status : null;
  leaderSession.current_temporary_queue_id = temporaryQueue ? temporaryQueue.queue_id : null;
  leaderSession.current_temporary_slice_id = temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.slice_id : null;
  leaderSession.current_temporary_slice_title = temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice.title : null;
  leaderSession.updated_at = now;
}

function distributeTemporaryPrioritySlices(state, leaderSession, workerAis, temporaryQueue, flags, now) {
  if (!temporaryQueue) return [];
  const availableSlices = Array.isArray(temporaryQueue.slices) ? temporaryQueue.slices : [];
  const plannedWorkers = Array.isArray(workerAis) && workerAis.length ? workerAis : resolvePlannedWorkersForDistributionService(state, leaderSession, temporaryQueue, flags);
  if (!plannedWorkers.length) return [];
  const distributions = [];
  const workerCount = plannedWorkers.length;
  plannedWorkers.forEach((aiId, workerIndex) => {
    const queue = ensureWorkerQueue(state, leaderSession.session_id, aiId, {
      id: flags.id ? `${flags.id}-${workerIndex + 1}` : undefined,
      name: flags.name || flags.label || aiId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      assignment_mode: "temporary_priority_distribution",
      symbol: flags.symbols ? parseCsvLike(flags.symbols)[workerIndex] || aiId : aiId
    });
    queue.assignment_mode = "temporary_priority_distribution";
    queue.source_priority_queue_id = temporaryQueue.queue_id;
    queue.source_priority_id = temporaryQueue.source_priority_id;
    queue.source_priority_title = temporaryQueue.source_priority_title;
    queue.evolution_priority_id = temporaryQueue.source_priority_id;
    queue.evolution_priority_title = temporaryQueue.source_priority_title;
    queue.slices = [];
    queue.source_priority_slice_ids = [];
    const assigned = availableSlices.filter((_, sliceIndex) => sliceIndex % workerCount === workerIndex);
    assigned.forEach((slice, assignedIndex) => {
      const copied = createQueueSlice(queue, slice.title, {
        id: `${slice.slice_id}-${workerIndex + 1}`,
        description: slice.description,
        done: slice.done_definition,
        files: slice.files || [],
        source_slice_id: slice.slice_id,
        source_priority_id: temporaryQueue.source_priority_id,
        assigned_ai_id: aiId,
        assigned_by_leader_session_id: leaderSession.session_id,
        tool_symbol: flags.symbols ? parseCsvLike(flags.symbols)[workerIndex] || aiId : aiId,
        provenance_tag: `${aiId}:${slice.slice_id}`,
        "owner-confirmation-required": slice.owner_confirmation_required
      });
      copied.order = assignedIndex + 1;
      copied.state = assignedIndex === 0 ? "active" : "queued";
      queue.slices.push(copied);
      queue.source_priority_slice_ids.push(slice.slice_id);
    });
    queue.current_slice_id = queue.slices[0] ? queue.slices[0].slice_id : null;
    queue.updated_at = now;
    queue.status = queue.slices.length ? "active" : "idle";
    distributions.push({
      queue_id: queue.queue_id,
      ai_id: aiId,
      slices: queue.slices.map((slice) => slice.slice_id)
    });
  });
  state.updated_at = now;
  return distributions;
}

function resolvePlannedWorkersForDistribution(state, leaderSession, temporaryQueue, flags) {
  const candidates = resolvePlannedAiCandidates(buildQueueCandidatePool(state), {
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

function buildMultiAiAlignment(state, report) {
  const activeLeader = report.active_leader_session || getActiveLeaderSession(state);
  const evolutionPriorityId = report.evolution_priority ? report.evolution_priority.id : null;
  const temporaryQueueId = report.evolution_temporary_priority_queue ? report.evolution_temporary_priority_queue.queue_id : null;
  const leaderAligned = !activeLeader || activeLeader.current_priority_id === evolutionPriorityId;
  const temporaryAligned = !activeLeader || activeLeader.current_temporary_queue_id === temporaryQueueId;
  return {
    status: leaderAligned && temporaryAligned ? "aligned" : "needs_attention",
    leader_aligned: leaderAligned,
    temporary_queue_aligned: temporaryAligned,
    current_leader_session_id: activeLeader ? activeLeader.session_id : null,
    current_priority_id: activeLeader ? activeLeader.current_priority_id : null,
    current_temporary_queue_id: activeLeader ? activeLeader.current_temporary_queue_id || null : null,
    current_task_id: report.current_task ? report.current_task.task_id : null,
    current_task_title: report.current_task ? report.current_task.title : null
  };
}

function buildMultiAiCurrentTask(activeLeaderSession, evolutionSnapshot) {
  const temporaryQueue = evolutionSnapshot.temporary_queue;
  const currentSlice = temporaryQueue && temporaryQueue.current_slice ? temporaryQueue.current_slice : null;
  if (!temporaryQueue && !currentSlice) return null;
  const taskId = currentSlice ? currentSlice.slice_id : temporaryQueue.queue_id;
  return {
    task_id: taskId,
    title: currentSlice ? currentSlice.title : temporaryQueue.source_priority_title || "Evolution priority",
    description: currentSlice ? currentSlice.description : temporaryQueue.source_priority_summary || "",
    status: currentSlice ? currentSlice.state : temporaryQueue.status || "active",
    source_priority_id: temporaryQueue ? temporaryQueue.source_priority_id : null,
    source_priority_title: temporaryQueue ? temporaryQueue.source_priority_title : null,
    source_queue_id: temporaryQueue ? temporaryQueue.queue_id : null,
    assigned_leader_ai_id: activeLeaderSession ? activeLeaderSession.leader_ai_id : null,
    assigned_leader_session_id: activeLeaderSession ? activeLeaderSession.session_id : null,
    type: "evolution_slice"
  };
}

function resolveQueueAiId(state, flags = {}) {
  const explicit = flags.ai || flags.developer || flags.assignee || flags.owner;
  if (explicit) return explicit;
  return resolvePlannedAiCandidateFromList(buildGovernanceCandidatePool(state), flags, {
    searchKeys: ["title", "name", "label", "description", "summary", "topic"]
  });
}

function buildQueueCandidatePool(state) {
  const activeAgents = Array.isArray(state.agent_entries) ? state.agent_entries.filter((entry) => entry.status === "active") : [];
  const activeQueues = Array.isArray(state.worker_queues) ? state.worker_queues.filter((queue) => queue.status === "active" && queue.ai_id) : [];
  const byAgentId = new Map();
  for (const entry of activeAgents) {
    byAgentId.set(entry.agent_id, {
      agent_id: entry.agent_id,
      agent_name: entry.agent_name || entry.agent_id,
      provider: entry.provider || "unknown",
      model: entry.model || "unknown",
      role: entry.role || "worker",
      capabilities: normalizeAiList(entry.capabilities || entry.skills || entry.tags || entry.capability || []),
      leader_eligible: entry.leader_eligible,
      entered_at: entry.entered_at || null,
      last_seen_at: entry.last_seen_at || null,
      active_queue_count: 0,
      queue_labels: []
    });
  }
  for (const queue of activeQueues) {
    const candidate = byAgentId.get(queue.ai_id) || {
      agent_id: queue.ai_id,
      agent_name: queue.ai_name || queue.ai_id,
      provider: queue.provider || "unknown",
      model: queue.model || "unknown",
      role: "worker",
      capabilities: normalizeAiList(queue.capabilities || queue.skills || queue.tags || queue.capability || []),
      leader_eligible: false,
      entered_at: queue.created_at || null,
      last_seen_at: queue.updated_at || null,
      active_queue_count: 0,
      queue_labels: []
    };
    candidate.active_queue_count += 1;
    candidate.queue_labels.push(String(queue.assignment_mode || "queue").toLowerCase());
    byAgentId.set(queue.ai_id, candidate);
  }
  return Array.from(byAgentId.values());
}

function scoreQueueCandidate(candidate, priorityText) {
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
  score -= candidate.active_queue_count;
  return score;
}

function normalizeAiList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveSourceAiIds(state, sourceQueueIds) {
  const ids = new Set();
  for (const queueId of sourceQueueIds) {
    const queue = state.worker_queues.find((item) => item.queue_id === queueId || item.ai_id === queueId);
    if (queue) ids.add(queue.ai_id);
  }
  return Array.from(ids);
}

function nextLeaderSessionId(state) {
  return `multi-ai-leader-${String(state.leader_sessions.length + 1).padStart(3, "0")}`;
}

function nextMergeBundleId(state) {
  return `multi-ai-merge-${String(state.merge_bundles.length + 1).padStart(3, "0")}`;
}

function normalizeSubaction(value, flags = {}) {
  if (value && typeof value === "string") return value;
  return flags.action || flags.cmd || "";
}

function parseCsvLike(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes" || value === "on";
}

function mergeObject(base, input) {
  const output = { ...base };
  for (const [key, value] of Object.entries(input || {})) {
    output[key] = value;
  }
  return output;
}

module.exports = {
  multiAiGovernance,
  defaultMultiAiGovernanceState,
  ensureMultiAiGovernanceState,
  buildMultiAiGovernanceReport,
  getCurrentEvolutionPriority
};
