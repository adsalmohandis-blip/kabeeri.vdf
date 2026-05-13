const fs = require("fs");
const path = require("path");
const { fileExists, repoRoot, readJsonFile, writeJsonFile } = require("../fs_utils");
const { table } = require("../ui");
const { uniqueList } = require("./collections");
const { appendJsonLine, readJsonLines } = require("./jsonl");
const { readStateArray } = require("./state_utils");

function ensureInteractionsState() {
  const dir = path.join(repoRoot(), ".kabeeri", "interactions");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/interactions/suggested_tasks.json")) writeJsonFile(".kabeeri/interactions/suggested_tasks.json", { suggested_tasks: [] });
  if (!fileExists(".kabeeri/interactions/post_work_captures.json")) writeJsonFile(".kabeeri/interactions/post_work_captures.json", { captures: [] });
  if (!fileExists(".kabeeri/interactions/vibe_sessions.json")) writeJsonFile(".kabeeri/interactions/vibe_sessions.json", { sessions: [], current_session_id: null });
  if (!fileExists(".kabeeri/interactions/context_briefs.json")) writeJsonFile(".kabeeri/interactions/context_briefs.json", { briefs: [] });
  if (!fs.existsSync(path.join(dir, "user_intents.jsonl"))) fs.writeFileSync(path.join(dir, "user_intents.jsonl"), "", "utf8");
}

function vibeSession(action, flags = {}, rest = [], deps = {}) {
  const appendAudit = deps.appendAudit || (() => {});
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];
  const verb = String(action || "status").toLowerCase();
  if (verb === "start") {
    const id = flags.id || `vibe-session-${String(data.sessions.length + 1).padStart(3, "0")}`;
    const item = {
      session_id: id,
      title: flags.title || rest.join(" ") || "Vibe session",
      actor_id: flags.actor || "local-user",
      status: "active",
      intent_ids: [],
      suggestion_ids: [],
      capture_ids: [],
      started_at: new Date().toISOString()
    };
    data.sessions.push(item);
    data.current_session_id = id;
    writeJsonFile(file, data);
    appendAudit("vibe.session_started", "vibe_session", id, `Vibe session started`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (verb === "end") {
    const id = flags.id || data.current_session_id;
    if (!id) throw new Error("Missing vibe session id.");
    const item = data.sessions.find((sessionItem) => sessionItem.session_id === id);
    if (!item) throw new Error(`Vibe session not found: ${id}`);
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.summary = flags.summary || item.summary || "";
    if (data.current_session_id === id) data.current_session_id = null;
    writeJsonFile(file, data);
    appendAudit("vibe.session_completed", "vibe_session", id, `Vibe session completed`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  const current = data.sessions.find((item) => item.session_id === data.current_session_id) || null;
  console.log(JSON.stringify({ current_session_id: data.current_session_id || null, current, sessions_total: data.sessions.length }, null, 2));
}

function attachIntentToVibeSession(intent, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.intent_ids = uniqueList([...(item.intent_ids || []), intent.intent_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachSuggestionsToVibeSession(suggestions, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.suggestion_ids = uniqueList([...(item.suggestion_ids || []), ...(suggestions || []).map((suggestion) => suggestion.suggestion_id)]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachCaptureToVibeSession(capture, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.capture_ids = uniqueList([...(item.capture_ids || []), capture.capture_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function vibeBrief(flags = {}, deps = {}) {
  const getTaskById = deps.getTaskById || (() => null);
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = fileExists(".kabeeri/interactions/vibe_sessions.json") ? readJsonFile(".kabeeri/interactions/vibe_sessions.json") : { current_session_id: null, sessions: [] };
  const openSuggestions = suggestions.filter((item) => ["suggested", "edited", "approved"].includes(item.status));
  const openTasks = tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const brief = {
    brief_id: `brief-${Date.now()}`,
    generated_at: new Date().toISOString(),
    current_vibe_session: sessions.current_session_id || null,
    latest_intent: intents[intents.length - 1] || null,
    open_suggestions: openSuggestions.slice(-8).map((item) => ({
      id: item.suggestion_id,
      title: item.title,
      workstream: item.workstream,
      risk: item.risk_level,
      status: item.status
    })),
    open_tasks: openTasks.slice(-10).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      workstream: item.workstream,
      assignee: item.assignee_id || null
    })),
    recent_captures: captures.slice(-5).map((item) => ({
      id: item.capture_id,
      summary: item.summary,
      files: item.files_changed || [],
      classification: item.classification
    })),
    token_saving_hint: "Use this brief as the next-session context instead of rereading the whole repository or chat history."
  };
  const file = ".kabeeri/interactions/context_briefs.json";
  const data = readJsonFile(file);
  data.briefs = data.briefs || [];
  data.briefs.push(brief);
  writeJsonFile(file, data);
  if (flags.json) console.log(JSON.stringify(brief, null, 2));
  else console.log(formatVibeBrief(brief));
  return brief;
}

function formatVibeBrief(brief) {
  const lines = [
    `Vibe brief: ${brief.brief_id}`,
    `Current session: ${brief.current_vibe_session || "none"}`,
    brief.latest_intent ? `Latest intent: ${brief.latest_intent.text}` : "Latest intent: none",
    "",
    "Open suggestions:",
    ...(brief.open_suggestions.length ? brief.open_suggestions.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Open tasks:",
    ...(brief.open_tasks.length ? brief.open_tasks.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Recent captures:",
    ...(brief.recent_captures.length ? brief.recent_captures.map((item) => `- ${item.id}: ${item.summary}`) : ["- none"]),
    "",
    brief.token_saving_hint
  ];
  return lines.join("\n");
}

function vibeNext(flags = {}, deps = {}) {
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const actions = [];
  const suggested = suggestions.find((item) => item.status === "suggested");
  if (suggested) actions.push({ action: "review_suggestion", command: `kvdf vibe show ${suggested.suggestion_id}`, reason: `Review ${suggested.title}` });
  const converted = suggestions.find((item) => item.status === "converted_to_task" && item.task_id && tasks.some((taskItem) => taskItem.id === item.task_id && taskItem.status === "proposed"));
  if (converted) actions.push({ action: "approve_or_refine_task", command: `kvdf task status ${converted.task_id}`, reason: "Converted Vibe task is still proposed." });
  const unassigned = tasks.find((item) => ["approved", "ready"].includes(item.status) && !item.assignee_id);
  if (unassigned) actions.push({ action: "assign_task", command: `kvdf task assign ${unassigned.id} --assignee <id>`, reason: "Approved task needs an assignee." });
  const uncaptured = captures.find((item) => item.classification === "needs_new_task" && item.status === "captured");
  if (uncaptured) actions.push({ action: "create_task_from_capture", command: `kvdf capture convert ${uncaptured.capture_id}`, reason: "Captured work has not been converted into governed work." });
  if (actions.length === 0) actions.push({ action: "create_or_capture_intent", command: `kvdf vibe "Describe the next change"`, reason: "No pending Vibe action found." });
  const result = { generated_at: new Date().toISOString(), actions: actions.slice(0, Number(flags.limit || 5)) };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  else console.log(table(["Action", "Command", "Reason"], result.actions.map((item) => [item.action, item.command, item.reason])));
  return result;
}

module.exports = {
  ensureInteractionsState,
  vibeSession,
  attachIntentToVibeSession,
  attachSuggestionsToVibeSession,
  attachCaptureToVibeSession,
  vibeBrief,
  vibeNext,
  formatVibeBrief,
  readStateArray,
  readJsonLines,
  appendJsonLine
};
