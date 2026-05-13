const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { watchMultiAiRelay } = require("../services/multi_ai_relay");

function multiAiCommunications(action, value, flags = {}, rest = [], deps = {}) {
  const { appendAudit } = deps;
  ensureWorkspace();
  const file = ".kabeeri/multi_ai_communications.json";
  if (!localFileExists(file)) writeJsonFile(file, defaultMultiAiCommunicationsState());
  const state = readJsonFile(file);
  ensureMultiAiCommunicationsState(state);

  if (!action || action === "status" || action === "summary" || action === "list") {
    const report = buildMultiAiCommunicationsReport(state);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderMultiAiCommunicationsReport(report));
    return;
  }

  if (action === "conversation") {
    const subaction = normalizeSubaction(value, flags);
    if (!subaction || ["status", "show", "list", "summary"].includes(subaction)) {
      const report = buildMultiAiCommunicationsReport(state);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else console.log(renderMultiAiCommunicationsReport(report));
      return;
    }
    if (["start", "create", "open", "new"].includes(subaction)) {
      const result = startConversation(state, flags, appendAudit);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationResult(result));
      return;
    }
    if (["send", "relay", "post", "message"].includes(subaction)) {
      const result = sendConversationMessage(state, flags, appendAudit);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationResult(result));
      return;
    }
    if (["inbox", "queue"].includes(subaction)) {
      const result = listConversationInbox(state, flags);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationInboxResult(result));
      return;
    }
    if (["reply", "respond", "answer"].includes(subaction)) {
      const result = replyToConversation(state, flags, appendAudit);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationResult(result));
      return;
    }
    if (["close", "end", "resolve"].includes(subaction)) {
      const result = closeConversation(state, flags, appendAudit);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationResult(result));
      return;
    }
    throw new Error(`Unknown multi-ai conversation action: ${subaction}`);
  }

  if (action === "relay") {
    const subaction = normalizeSubaction(value, flags);
    if (subaction === "watch") {
      writeJsonFile(file, state);
      const result = watchMultiAiRelay(file, {
        iterations: flags.iterations,
        interval: flags.interval
      }, {
        readReport: () => buildMultiAiRelayReport(readJsonFile(file)),
        renderReport: (report) => renderMultiAiRelayReport(report)
      });
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (["inbox", "messages"].includes(subaction)) {
      const result = listConversationInbox(state, flags);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationInboxResult(result));
      return;
    }
    if (["clear", "close"].includes(subaction)) {
      const result = clearConversationInbox(state, flags);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else console.log(renderConversationClearResult(result));
      return;
    }
    const hasSendIntent = ["send", "relay", "post", "message"].includes(subaction) || Boolean(flags.from || flags.to || flags.message || flags.body || flags.text || flags.request);
    if (!hasSendIntent || ["status", "show", "summary", "report", "board", "inbox", "messages", "list"].includes(subaction)) {
      const report = buildMultiAiRelayReport(state);
      writeJsonFile(file, state);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else console.log(renderMultiAiRelayReport(report));
      return;
    }
    const result = sendConversationMessage(state, { ...flags, relay: true }, appendAudit);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderConversationResult(result));
    return;
  }

  if (action === "inbox" || action === "messages") {
    const result = listConversationInbox(state, flags);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderConversationInboxResult(result));
    return;
  }

  throw new Error(`Unknown multi-ai communications action: ${action}`);
}

function startConversation(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const fromAgentId = resolveConversationAgentId(flags, "from");
  const toAgentId = resolveConversationAgentId(flags, "to");
  if (!fromAgentId) throw new Error("Missing --from.");
  if (!toAgentId) throw new Error("Missing --to.");
  const topic = String(flags.topic || flags.title || flags.subject || "Agent-to-agent relay").trim();
  const body = String(flags.message || flags.body || flags.text || "").trim();
  const conversation = createConversation(state, { fromAgentId, toAgentId, topic, startedBy: fromAgentId, flags, now });
  state.conversations.push(conversation);
  let initialMessage = null;
  if (body) {
    initialMessage = createConversationMessage(conversation, {
      fromAgentId,
      toAgentId,
      body,
      status: "pending",
      replyToMessageId: null,
      now
    });
    conversation.messages.push(initialMessage);
    markConversationActivity(conversation, initialMessage, now);
  }
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.conversation_started", "multi_ai", conversation.conversation_id, `Conversation started between ${fromAgentId} and ${toAgentId}`);
  }
  return {
    report_type: "multi_ai_conversation_started",
    generated_at: now,
    conversation,
    message: initialMessage
  };
}

function sendConversationMessage(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const fromAgentId = resolveConversationAgentId(flags, "from");
  const toAgentId = resolveConversationAgentId(flags, "to");
  if (!fromAgentId) throw new Error("Missing --from.");
  if (!toAgentId) throw new Error("Missing --to.");
  const body = String(flags.message || flags.body || flags.text || flags.request || "").trim();
  if (!body) throw new Error("Missing --message.");
  const topic = String(flags.topic || flags.title || flags.subject || "Agent relay").trim();
  const conversation = resolveConversationForSend(state, { fromAgentId, toAgentId, topic, flags, now });
  const message = createConversationMessage(conversation, {
    fromAgentId,
    toAgentId,
    body,
    status: "pending",
    replyToMessageId: flags.reply_to || flags.replyTo || null,
    now
  });
  conversation.messages.push(message);
  markConversationActivity(conversation, message, now);
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.conversation_message_sent", "multi_ai", conversation.conversation_id, `Conversation message sent from ${fromAgentId} to ${toAgentId}`);
  }
  return {
    report_type: "multi_ai_conversation_message_sent",
    generated_at: now,
    conversation,
    message
  };
}

function listConversationInbox(state, flags) {
  const now = new Date().toISOString();
  const agentId = resolveConversationAgentId(flags, "agent");
  const targetConversations = state.conversations.filter((conversation) => {
    if (!agentId) return true;
    return Array.isArray(conversation.participants) && conversation.participants.some((participant) => participant.agent_id === agentId);
  });
  const inbox = [];
  for (const conversation of targetConversations) {
    for (const message of conversation.messages) {
      if (message.status !== "pending") continue;
      if (agentId && message.to_agent_id !== agentId) continue;
      inbox.push({
        conversation_id: conversation.conversation_id,
        topic: conversation.topic,
        message_id: message.message_id,
        from_agent_id: message.from_agent_id,
        to_agent_id: message.to_agent_id,
        body: message.body,
        status: message.status,
        created_at: message.created_at,
        reply_to_message_id: message.reply_to_message_id || null
      });
    }
  }
  return {
    report_type: "multi_ai_conversation_inbox",
    generated_at: now,
    agent_id: agentId || null,
    inbox,
    counts: {
      conversations: targetConversations.length,
      pending_messages: inbox.length
    }
  };
}

function clearConversationInbox(state, flags) {
  const now = new Date().toISOString();
  const agentId = resolveConversationAgentId(flags, "agent");
  if (!agentId) throw new Error("Missing --agent.");
  let clearedMessages = 0;
  for (const conversation of state.conversations) {
    if (!Array.isArray(conversation.messages)) continue;
    for (const message of conversation.messages) {
      if (message.status !== "pending") continue;
      if (message.to_agent_id !== agentId) continue;
      message.status = "cleared";
      message.cleared_at = now;
      message.updated_at = now;
      clearedMessages += 1;
    }
  }
  state.updated_at = now;
  return {
    report_type: "multi_ai_conversation_inbox_cleared",
    generated_at: now,
    agent_id: agentId,
    cleared_messages: clearedMessages
  };
}

function replyToConversation(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const responderId = resolveConversationAgentId(flags, "agent");
  if (!responderId) throw new Error("Missing --agent or --from.");
  const replyText = String(flags.reply || flags.response || flags.message || flags.body || flags.text || "").trim();
  if (!replyText) throw new Error("Missing --reply or --message.");
  const conversation = findConversationForReply(state, flags, responderId);
  if (!conversation) throw new Error("No pending conversation message found to reply to.");
  const original = findPendingMessageForResponder(conversation, responderId, flags);
  if (!original) throw new Error("No pending conversation message found to reply to.");
  original.status = "responded";
  original.response_body = replyText;
  original.responded_by = responderId;
  original.responded_at = now;
  original.updated_at = now;
  const replyMessage = createConversationMessage(conversation, {
    fromAgentId: responderId,
    toAgentId: original.from_agent_id,
    body: replyText,
    status: "delivered",
    replyToMessageId: original.message_id,
    now
  });
  replyMessage.delivered_at = now;
  conversation.messages.push(replyMessage);
  markConversationActivity(conversation, replyMessage, now);
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.conversation_replied", "multi_ai", conversation.conversation_id, `Conversation reply recorded by ${responderId}`);
  }
  return {
    report_type: "multi_ai_conversation_replied",
    generated_at: now,
    conversation,
    original_message: original,
    reply_message: replyMessage
  };
}

function closeConversation(state, flags, appendAudit) {
  const now = new Date().toISOString();
  const conversation = resolveConversationByIdOrThread(state, flags, true);
  if (!conversation) throw new Error("Conversation not found.");
  conversation.status = "closed";
  conversation.closed_at = now;
  conversation.updated_at = now;
  for (const message of conversation.messages) {
    if (message.status === "pending") {
      message.status = "closed";
      message.closed_at = now;
      message.updated_at = now;
    }
  }
  state.updated_at = now;
  if (appendAudit) {
    appendAudit("multi_ai.conversation_closed", "multi_ai", conversation.conversation_id, `Conversation closed: ${conversation.conversation_id}`);
  }
  return {
    report_type: "multi_ai_conversation_closed",
    generated_at: now,
    conversation
  };
}

function createConversation(state, { fromAgentId, toAgentId, topic, startedBy, flags, now }) {
  return {
    conversation_id: flags.id || nextConversationId(state),
    topic,
    status: "open",
    participants: uniqueStrings([fromAgentId, toAgentId]).map((agentId) => ({
      agent_id: agentId,
      role: agentId === startedBy ? "initiator" : "participant"
    })),
    messages: [],
    created_by: startedBy,
    created_at: now,
    updated_at: now,
    last_message_id: null,
    last_message_at: null,
    closed_at: null,
    relay_policy: {
      response_deadline_seconds: Number(flags["response-deadline"] || 300),
      ack_required: !isTruthyFlag(flags["no-ack"]),
      visible_to_owner: false
    }
  };
}

function createConversationMessage(conversation, { fromAgentId, toAgentId, body, status, replyToMessageId, now }) {
  return {
    message_id: nextConversationMessageId(conversation),
    conversation_id: conversation.conversation_id,
    from_agent_id: fromAgentId,
    to_agent_id: toAgentId,
    body,
    status,
    reply_to_message_id: replyToMessageId || null,
    created_at: now,
    updated_at: now,
    delivered_at: status === "delivered" ? now : null,
    acknowledged_at: null,
    responded_at: null
  };
}

function markConversationActivity(conversation, message, now) {
  conversation.updated_at = now;
  conversation.last_message_at = now;
  conversation.last_message_id = message.message_id;
}

function resolveConversationForSend(state, { fromAgentId, toAgentId, topic, flags, now }) {
  const conversationId = resolveConversationId(flags);
  if (conversationId) {
    const conversation = state.conversations.find((item) => item.conversation_id === conversationId);
    if (!conversation) throw new Error(`Conversation not found: ${conversationId}`);
    if (conversation.status === "closed") throw new Error(`Conversation is closed: ${conversationId}`);
    return conversation;
  }
  const existing = [...state.conversations].reverse().find((conversation) => {
    if (conversation.status !== "open") return false;
    if (!Array.isArray(conversation.participants)) return false;
    const participantIds = conversation.participants.map((item) => item.agent_id);
    const hasFrom = participantIds.includes(fromAgentId);
    const hasTo = participantIds.includes(toAgentId);
    if (!hasFrom || !hasTo) return false;
    if (!topic) return true;
    return normalizeText(conversation.topic) === normalizeText(topic);
  });
  if (existing) return existing;
  const conversation = createConversation(state, { fromAgentId, toAgentId, topic, startedBy: fromAgentId, flags, now });
  state.conversations.push(conversation);
  return conversation;
}

function findConversationForReply(state, flags, responderId) {
  const conversation = resolveConversationByIdOrThread(state, flags, false);
  if (conversation) return conversation;
  const agentFilter = resolveConversationAgentId(flags, "agent") || responderId;
  return [...state.conversations].reverse().find((item) => {
    if (item.status !== "open") return false;
    if (!Array.isArray(item.messages)) return false;
    return item.messages.some((message) => message.status === "pending" && message.to_agent_id === agentFilter);
  }) || null;
}

function findPendingMessageForResponder(conversation, responderId, flags) {
  const messageId = resolveConversationMessageId(flags);
  if (messageId) {
    return conversation.messages.find((message) => message.message_id === messageId && message.status === "pending" && message.to_agent_id === responderId) || null;
  }
  return [...conversation.messages].reverse().find((message) => message.status === "pending" && message.to_agent_id === responderId) || null;
}

function resolveConversationByIdOrThread(state, flags, allowAnyOpen = false) {
  const conversationId = resolveConversationId(flags);
  if (conversationId) {
    return state.conversations.find((item) => item.conversation_id === conversationId) || null;
  }
  if (allowAnyOpen) {
    const participantA = resolveConversationAgentId(flags, "from");
    const participantB = resolveConversationAgentId(flags, "to");
    const topic = String(flags.topic || flags.title || flags.subject || "").trim();
    if (participantA && participantB) {
      return [...state.conversations].reverse().find((conversation) => {
        if (conversation.status !== "open") return false;
        if (!Array.isArray(conversation.participants)) return false;
        const participantIds = conversation.participants.map((item) => item.agent_id);
        if (!participantIds.includes(participantA) || !participantIds.includes(participantB)) return false;
        if (!topic) return true;
        return normalizeText(conversation.topic) === normalizeText(topic);
      }) || null;
    }
  }
  return null;
}

function synchronizeRelayWithGovernance(governanceState, options = {}) {
  ensureWorkspace();
  const file = ".kabeeri/multi_ai_communications.json";
  if (!localFileExists(file)) writeJsonFile(file, defaultMultiAiCommunicationsState());
  const state = readJsonFile(file);
  ensureMultiAiCommunicationsState(state);
  const now = new Date().toISOString();
  const activeLeaderSession = getActiveLeaderSessionFromGovernance(governanceState);
  const activePriority = governanceState && governanceState.evolution_governor ? {
    id: governanceState.evolution_governor.current_priority_id || governanceState.evolution_governor.evolution_priority_id || null,
    title: governanceState.evolution_governor.current_priority_title || null,
    status: governanceState.evolution_governor.current_priority_status || null
  } : null;
  const workerQueues = Array.isArray(governanceState && governanceState.worker_queues) ? governanceState.worker_queues : [];
  const activeQueues = workerQueues.filter((queue) => queue.status === "active" && queue.ai_id);
  const pendingCalls = Array.isArray(governanceState && governanceState.call_inbox) ? governanceState.call_inbox.filter((call) => call.status === "pending") : [];
  const delivered = [];

  if (activeLeaderSession) {
    for (const queue of activeQueues) {
      const currentSlice = getQueueCurrentSlice(queue);
      const conversation = ensureRelayConversation(state, {
        fromAgentId: activeLeaderSession.leader_ai_id,
        toAgentId: queue.ai_id,
        topic: buildRelayTopic(activePriority, queue, currentSlice, "dispatch")
      }, now);
    const dispatchKey = [activeLeaderSession.session_id, queue.queue_id, queue.ai_id, currentSlice ? currentSlice.slice_id : "queue"].join("|");
      const existing = conversation.messages.find((message) => message.dispatch_key === dispatchKey && message.status === "pending");
      if (!existing) {
        const body = buildRelayDispatchMessageBody(activeLeaderSession, queue, currentSlice, activePriority);
        const message = createConversationMessage(conversation, {
          fromAgentId: activeLeaderSession.leader_ai_id,
          toAgentId: queue.ai_id,
          body,
          status: "pending",
          replyToMessageId: null,
          now
        });
        message.dispatch_key = dispatchKey;
        message.dispatch_type = "task_dispatch";
        message.leader_session_id = activeLeaderSession.session_id;
        message.queue_id = queue.queue_id;
        message.priority_id = activePriority ? activePriority.id : null;
        message.current_slice_id = currentSlice ? currentSlice.slice_id : null;
        message.current_task_id = currentSlice ? currentSlice.slice_id : queue.queue_id;
        conversation.messages.push(message);
        markConversationActivity(conversation, message, now);
        delivered.push({
          conversation_id: conversation.conversation_id,
          message_id: message.message_id,
          queue_id: queue.queue_id,
          ai_id: queue.ai_id
        });
        queue.relay_conversation_id = conversation.conversation_id;
        queue.relay_message_id = message.message_id;
        queue.relay_last_dispatched_at = now;
        queue.relay_dispatch_key = dispatchKey;
        queue.updated_at = now;
      }
    }
  }

  for (const call of pendingCalls) {
    const leaderAiId = activeLeaderSession ? activeLeaderSession.leader_ai_id : null;
    if (!leaderAiId) continue;
    const targetAiId = call.to_agent_id || leaderAiId;
    const conversation = ensureRelayConversation(state, {
      fromAgentId: call.from_agent_id,
      toAgentId: targetAiId,
      topic: buildRelayTopic(activePriority, { ai_id: targetAiId, queue_id: call.call_id }, null, call.to_agent_id ? "dispatch" : "leader-call")
    }, now);
    const relayKey = [call.call_id, targetAiId, call.request].join("|");
    const existing = conversation.messages.find((message) => message.dispatch_key === relayKey && message.status === "pending");
    if (!existing) {
      const message = createConversationMessage(conversation, {
        fromAgentId: call.from_agent_id,
        toAgentId: targetAiId,
        body: buildLeaderCallMessageBody({ ...call, to_agent_id: targetAiId }, activeLeaderSession),
        status: "pending",
        replyToMessageId: null,
        now
      });
      message.dispatch_key = relayKey;
      message.dispatch_type = "leader_call";
      message.call_id = call.call_id;
      conversation.messages.push(message);
      markConversationActivity(conversation, message, now);
      delivered.push({
        conversation_id: conversation.conversation_id,
        message_id: message.message_id,
        call_id: call.call_id
      });
      call.relay_conversation_id = conversation.conversation_id;
      call.relay_message_id = message.message_id;
      call.updated_at = now;
    }
  }

  const respondedCalls = Array.isArray(governanceState && governanceState.call_inbox) ? governanceState.call_inbox.filter((call) => call.status === "responded") : [];
  for (const call of respondedCalls) {
    if (!call.relay_conversation_id) continue;
    const conversation = state.conversations.find((item) => item.conversation_id === call.relay_conversation_id) || null;
    if (!conversation || !Array.isArray(conversation.messages)) continue;
    const original = conversation.messages.find((message) => message.message_id === call.relay_message_id || message.call_id === call.call_id || message.dispatch_key === [call.call_id, call.to_leader_session_id || "", call.request].join("|")) || null;
    if (original) {
      original.status = "responded";
      original.response_body = call.response || null;
      original.responded_by = call.responded_by || null;
      original.responded_at = call.responded_at || now;
      original.updated_at = now;
    }
    if (!call.relay_response_message_id && call.response) {
      const responder = call.responded_by || (activeLeaderSession ? activeLeaderSession.leader_ai_id : null) || "leader";
      const replyMessage = createConversationMessage(conversation, {
        fromAgentId: responder,
        toAgentId: call.from_agent_id,
        body: call.response,
        status: "delivered",
        replyToMessageId: original ? original.message_id : null,
        now
      });
      replyMessage.dispatch_type = "leader_call_response";
      replyMessage.call_id = call.call_id;
      replyMessage.delivered_at = now;
      conversation.messages.push(replyMessage);
      markConversationActivity(conversation, replyMessage, now);
      call.relay_response_message_id = replyMessage.message_id;
      call.relay_response_conversation_id = conversation.conversation_id;
    }
  }

  state.updated_at = now;
  writeJsonFile(file, state);
  return {
    report_type: "multi_ai_communications_synced",
    generated_at: now,
    active_leader_session_id: activeLeaderSession ? activeLeaderSession.session_id : null,
    active_priority_id: activePriority ? activePriority.id : null,
    delivered,
    counts: {
      conversations: state.conversations.length,
      pending_messages: state.conversations.flatMap((conversation) => Array.isArray(conversation.messages) ? conversation.messages : []).filter((message) => message.status === "pending").length,
      dispatch_threads: buildRelayDispatchBoard(state.conversations).length
    }
  };
}

function buildMultiAiCommunicationsReport(state) {
  const conversations = Array.isArray(state.conversations) ? state.conversations : [];
  const openConversations = conversations.filter((item) => item.status === "open");
  const closedConversations = conversations.filter((item) => item.status === "closed");
  const messages = conversations.flatMap((conversation) => Array.isArray(conversation.messages) ? conversation.messages.map((message) => ({ ...message, conversation_id: conversation.conversation_id, topic: conversation.topic })) : []);
  const pendingMessages = messages.filter((message) => message.status === "pending");
  const respondedMessages = messages.filter((message) => message.status === "responded");
  const dispatchBoard = buildRelayDispatchBoard(conversations);
  const latestConversation = conversations.length ? conversations[conversations.length - 1] : null;
  return {
    report_type: "multi_ai_communications_status",
    generated_at: new Date().toISOString(),
    state_file: ".kabeeri/multi_ai_communications.json",
    relay_policy: state.relay_policy,
    conversations,
    latest_conversation: latestConversation,
    counts: {
      conversations: conversations.length,
      open_conversations: openConversations.length,
      closed_conversations: closedConversations.length,
      messages: messages.length,
      pending_messages: pendingMessages.length,
      responded_messages: respondedMessages.length,
      dispatch_threads: dispatchBoard.length
    },
    dispatch_board: dispatchBoard,
    open_threads: openConversations.map((conversation) => ({
      conversation_id: conversation.conversation_id,
      topic: conversation.topic,
      participants: conversation.participants,
      message_count: Array.isArray(conversation.messages) ? conversation.messages.length : 0,
      updated_at: conversation.updated_at
    })),
    ai_instructions: [
      "Use `kvdf multi-ai relay inbox --agent <your-agent-id>` to check for pending dispatch messages.",
      "Do NOT poll the status or inbox repeatedly. Use `kvdf multi-ai relay watch --interval 2000` to wait synchronously.",
      "Clear your inbox promptly by responding using `kvdf multi-ai conversation reply`."
    ]
  };
}

function buildMultiAiRelayReport(state) {
  const communicationsReport = buildMultiAiCommunicationsReport(state);
  const inbox = communicationsReport.conversations.flatMap((conversation) => {
    if (conversation.status !== "open" || !Array.isArray(conversation.messages)) return [];
    return conversation.messages
      .filter((message) => message.status === "pending")
      .map((message) => ({
        conversation_id: conversation.conversation_id,
        topic: conversation.topic,
        message_id: message.message_id,
        from_agent_id: message.from_agent_id,
        to_agent_id: message.to_agent_id,
        body: message.body,
        status: message.status,
        reply_to_message_id: message.reply_to_message_id || null,
        created_at: message.created_at
      }));
  });
  return {
    report_type: "multi_ai_relay_status",
    generated_at: communicationsReport.generated_at,
    state_file: communicationsReport.state_file,
    counts: {
      conversations: communicationsReport.counts.conversations,
      pending_messages: communicationsReport.counts.pending_messages,
      responded_messages: communicationsReport.counts.responded_messages,
      dispatch_threads: communicationsReport.counts.dispatch_threads || 0,
      inbox_messages: inbox.length
    },
    inbox,
    dispatch_board: communicationsReport.dispatch_board || [],
    open_threads: communicationsReport.open_threads || [],
    ai_instructions: [
      "Use `kvdf multi-ai relay inbox --agent <your-agent-id>` to check for pending dispatch messages.",
      "Do NOT poll the status or inbox repeatedly. Use `kvdf multi-ai relay watch --interval 2000` to wait synchronously.",
      "Clear your inbox promptly by responding using `kvdf multi-ai conversation reply`."
    ]
  };
}

function renderMultiAiCommunicationsReport(report) {
  const lines = [
    "Multi-AI Communications Relay",
    "",
    `Conversations: ${report.counts.conversations}`,
    `Open threads: ${report.counts.open_conversations}`,
    `Pending messages: ${report.counts.pending_messages}`,
    `Responded messages: ${report.counts.responded_messages}`,
    `Dispatch threads: ${report.counts.dispatch_threads || 0}`,
    "",
    "Open conversations:"
  ];
  for (const conversation of report.open_threads) {
    lines.push(`- [${conversation.conversation_id}] ${conversation.topic} (${conversation.message_count} messages)`);
  }
  if (!report.open_threads.length) lines.push("- none");
  lines.push("", "Dispatch board:");
  for (const thread of report.dispatch_board || []) {
    lines.push(`- [${thread.conversation_id}] ${thread.topic} (${thread.pending_messages} pending)`);
  }
  if (!Array.isArray(report.dispatch_board) || !report.dispatch_board.length) lines.push("- none");
  return lines.join("\n");
}

function renderMultiAiRelayReport(report) {
  const lines = [
    report && report.render_mode === "watch" ? "Multi-AI Relay Watch" : "Multi-AI Relay",
    "",
    `Pending inbox messages: ${report.counts.inbox_messages}`,
    `Dispatch threads: ${report.counts.dispatch_threads}`,
    `Open conversations: ${report.open_threads.length}`,
    "",
    "Inbox:"
  ];
  for (const message of report.inbox) {
    lines.push(`- [${message.conversation_id}] ${message.to_agent_id} <- ${message.from_agent_id}: ${message.body}`);
  }
  if (!report.inbox.length) lines.push("- none");
  lines.push("", "Dispatch board:");
  for (const thread of report.dispatch_board) {
    lines.push(`- [${thread.conversation_id}] ${thread.topic} (${thread.pending_messages} pending)`);
  }
  if (!report.dispatch_board.length) lines.push("- none");
  return lines.join("\n");
}

function renderConversationResult(result) {
  if (result.report_type === "multi_ai_conversation_started") {
    return `Conversation started: ${result.conversation.conversation_id}`;
  }
  if (result.report_type === "multi_ai_conversation_message_sent") {
    return `Conversation message sent: ${result.conversation.conversation_id} -> ${result.message.message_id}`;
  }
  if (result.report_type === "multi_ai_conversation_replied") {
    return `Conversation reply recorded: ${result.conversation.conversation_id}`;
  }
  if (result.report_type === "multi_ai_conversation_closed") {
    return `Conversation closed: ${result.conversation.conversation_id}`;
  }
  return "Conversation updated.";
}

function renderConversationInboxResult(result) {
  const rows = result.inbox.map((message) => [
    message.conversation_id,
    message.message_id,
    message.from_agent_id,
    message.to_agent_id,
    message.status,
    message.body
  ]);
  return table(["Conversation", "Message", "From", "To", "Status", "Body"], rows);
}

function renderConversationClearResult(result) {
  return `Cleared ${result.cleared_messages || 0} inbox messages for ${result.agent_id}`;
}

function defaultMultiAiCommunicationsState() {
  return {
    version: "v1",
    relay_policy: {
      response_deadline_seconds: 300,
      ack_required: true,
      visible_to_owner: false
    },
    conversations: [],
    audit_trail: [],
    updated_at: null
  };
}

function ensureMultiAiCommunicationsState(state) {
  const defaults = defaultMultiAiCommunicationsState();
  state.version = state.version || defaults.version;
  state.relay_policy = mergeObject(defaults.relay_policy, state.relay_policy);
  state.conversations = Array.isArray(state.conversations) ? state.conversations : [];
  state.audit_trail = Array.isArray(state.audit_trail) ? state.audit_trail : [];
  state.updated_at = state.updated_at || null;
}

function resolveConversationAgentId(flags = {}, preferredKey = null, fallback = "") {
  const candidates = [];
  if (preferredKey && flags[preferredKey]) candidates.push(flags[preferredKey]);
  candidates.push(flags.agent, flags.ai, flags.from, flags.to, flags["agent-id"], flags.developer, process.env.KVDF_MULTI_AI_ID, process.env.KVDF_AI_ID, process.env.KVDF_AGENT_ID, fallback);
  const candidate = candidates.find((item) => String(item || "").trim()) || "";
  const normalized = String(candidate || "").trim();
  return normalized || null;
}

function resolveConversationId(flags = {}) {
  const candidate = flags.conversation || flags.id || flags.conversation_id || flags.thread || flags.thread_id || null;
  const normalized = String(candidate || "").trim();
  return normalized || null;
}

function resolveConversationMessageId(flags = {}) {
  const candidate = flags.message_id || flags.id || flags.reply_to || flags.replyTo || null;
  const normalized = String(candidate || "").trim();
  return normalized || null;
}

function nextConversationId(state) {
  return `multi-ai-conversation-${String(state.conversations.length + 1).padStart(3, "0")}`;
}

function nextConversationMessageId(conversation) {
  return `multi-ai-message-${String((conversation.messages ? conversation.messages.length : 0) + 1).padStart(3, "0")}`;
}

function normalizeSubaction(value, flags = {}) {
  if (value && typeof value === "string") return value;
  return flags.action || flags.cmd || "";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
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

function ensureRelayConversation(state, { fromAgentId, toAgentId, topic }, now) {
  const existing = [...state.conversations].reverse().find((conversation) => {
    if (conversation.status !== "open") return false;
    if (!Array.isArray(conversation.participants)) return false;
    const participantIds = conversation.participants.map((item) => item.agent_id);
    if (!participantIds.includes(fromAgentId) || !participantIds.includes(toAgentId)) return false;
    return normalizeText(conversation.topic) === normalizeText(topic);
  });
  if (existing) return existing;
  const conversation = createConversation(state, { fromAgentId, toAgentId, topic, startedBy: fromAgentId, flags: {}, now });
  conversation.origin = "multi_ai_governance";
  conversation.relay_type = "dispatch";
  conversation.sync_channel = "multi_ai";
  state.conversations.push(conversation);
  return conversation;
}

function buildRelayTopic(activePriority, queue, currentSlice, kind) {
  const priorityLabel = activePriority && activePriority.title ? activePriority.title : "Active priority";
  const queueLabel = queue && queue.ai_id ? queue.ai_id : "agent";
  const sliceLabel = currentSlice && currentSlice.title ? currentSlice.title : queue && queue.queue_id ? queue.queue_id : "queue";
  if (kind === "leader-call") return `Leader call :: ${priorityLabel} :: ${queueLabel}`;
  return `Dispatch :: ${priorityLabel} :: ${queueLabel} :: ${sliceLabel}`;
}

function buildRelayDispatchMessageBody(leaderSession, queue, currentSlice, activePriority) {
  const lines = [
    `Leader session: ${leaderSession.leader_ai_id} (${leaderSession.session_id})`,
    `Priority: ${activePriority && activePriority.id ? `${activePriority.id} - ${activePriority.title || ""}`.trim() : queue.source_priority_title || "unknown"}`,
    `Queue: ${queue.queue_id}`,
    `Agent: ${queue.ai_id}`,
    `Current slice: ${currentSlice ? `${currentSlice.slice_id} - ${currentSlice.title}` : "queue-level alignment"}`,
    `Done: ${currentSlice ? currentSlice.done_definition : "Continue aligned work on the assigned queue."}`
  ];
  if (currentSlice && Array.isArray(currentSlice.files) && currentSlice.files.length) {
    lines.push(`Files: ${currentSlice.files.join(", ")}`);
  }
  lines.push("Reply with progress, blockers, or a completed handoff summary.");
  return lines.join("\n");
}

function buildLeaderCallMessageBody(call, leaderSession) {
  return [
    `Leader session: ${leaderSession.leader_ai_id} (${leaderSession.session_id})`,
    `Call: ${call.call_id}`,
    `Request: ${call.request}`,
    "Reply with the action taken or the next needed clarification."
  ].join("\n");
}

function buildRelayDispatchBoard(conversations) {
  const dispatchThreads = conversations.filter((conversation) => conversation.relay_type === "dispatch" || conversation.sync_channel === "multi_ai");
  return dispatchThreads.map((conversation) => {
    const pendingMessages = Array.isArray(conversation.messages) ? conversation.messages.filter((message) => message.status === "pending").length : 0;
    return {
      conversation_id: conversation.conversation_id,
      topic: conversation.topic,
      status: conversation.status,
      participants: conversation.participants,
      message_count: Array.isArray(conversation.messages) ? conversation.messages.length : 0,
      pending_messages: pendingMessages,
      last_message_at: conversation.last_message_at || conversation.updated_at || null
    };
  });
}

function getQueueCurrentSlice(queue) {
  if (!queue || !Array.isArray(queue.slices)) return null;
  return queue.slices.find((slice) => slice.slice_id === queue.current_slice_id) || queue.slices.find((slice) => slice.state === "active") || queue.slices[0] || null;
}

function getActiveLeaderSessionFromGovernance(governanceState) {
  if (!governanceState) return null;
  const sessions = Array.isArray(governanceState.leader_sessions) ? governanceState.leader_sessions : [];
  if (governanceState.active_leader_session_id) {
    const active = sessions.find((session) => session.session_id === governanceState.active_leader_session_id && session.status === "active");
    if (active) return active;
  }
  return [...sessions].reverse().find((session) => session.status === "active") || null;
}

function localFileExists(relativePath) {
  const fullPath = path.join(repoRoot(), relativePath);
  return fs.existsSync(fullPath);
}

module.exports = {
  multiAiCommunications,
  defaultMultiAiCommunicationsState,
  ensureMultiAiCommunicationsState,
  buildMultiAiCommunicationsReport,
  buildMultiAiRelayReport,
  renderMultiAiRelayReport,
  watchMultiAiRelay,
  synchronizeRelayWithGovernance
};
