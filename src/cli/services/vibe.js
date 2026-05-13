function vibe(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    ensureInteractionsState = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    table = () => "",
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    classifyVibeIntent,
    buildVibeAskResponse,
    buildVibePlanSuggestions,
    buildSuggestedTaskCard,
    approveVibeSuggestion,
    convertVibeSuggestion,
    updateVibeSuggestionStatus,
    capturePostWork,
    attachIntentToVibeSession = () => {},
    attachSuggestionsToVibeSession = () => {},
    appendJsonLine = () => {},
    vibeSession,
    vibeBrief,
    vibeNext
  } = deps;

  ensureWorkspace();
  ensureInteractionsState();
  const verb = String(action || "suggest").toLowerCase();
  const knownActions = new Set(["suggest", "ask", "capture", "list", "show", "convert", "approve", "reject", "plan", "brief", "next", "session"]);
  const message = knownActions.has(verb)
    ? [value, ...rest].filter(Boolean).join(" ").trim()
    : [action, value, ...rest].filter(Boolean).join(" ").trim();
  const effectiveAction = knownActions.has(verb) ? verb : "suggest";

  if (effectiveAction === "list") {
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    console.log(table(["Suggestion", "Title", "Workstream", "Risk", "Status"], suggestions.map((item) => [
      item.suggestion_id,
      item.title,
      item.workstream,
      item.risk_level,
      item.status
    ])));
    return;
  }

  if (effectiveAction === "brief") {
    return vibeBrief(flags);
  }

  if (effectiveAction === "next") {
    return vibeNext(flags);
  }

  if (effectiveAction === "session") {
    return vibeSession(value, flags, rest, { appendAudit });
  }

  if (effectiveAction === "show") {
    const id = value || flags.id;
    if (!id) throw new Error("Missing suggestion id.");
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    const found = suggestions.find((item) => item.suggestion_id === id);
    if (!found) throw new Error(`Suggested task not found: ${id}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (effectiveAction === "approve") {
    return approveVibeSuggestion(value || flags.id, flags);
  }

  if (effectiveAction === "convert") {
    return convertVibeSuggestion(value || flags.id, flags);
  }

  if (effectiveAction === "reject") {
    return updateVibeSuggestionStatus(value || flags.id, "rejected", flags.reason || "");
  }

  if (effectiveAction === "capture") {
    return capturePostWork(message, flags);
  }

  if (!message) throw new Error("Missing natural language request.");
  const intent = classifyVibeIntent(message, flags);
  attachIntentToVibeSession(intent, flags);
  appendJsonLine(".kabeeri/interactions/user_intents.jsonl", intent);
  appendAudit("vibe.intent_classified", "intent", intent.intent_id, `Vibe intent classified: ${intent.intent_type}`);

  if (effectiveAction === "ask" || intent.intent_type === "ask_question" || (intent.is_vague && effectiveAction !== "plan")) {
    const response = buildVibeAskResponse(intent);
    if (!flags.json) {
      console.log(response.lines.join("\n"));
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  const createdSuggestions = effectiveAction === "plan"
    ? buildVibePlanSuggestions(intent, flags)
    : [buildSuggestedTaskCard(intent, flags)];
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  data.suggested_tasks = data.suggested_tasks || [];
  data.suggested_tasks.push(...createdSuggestions);
  writeJsonFile(file, data);
  attachSuggestionsToVibeSession(createdSuggestions, flags);
  refreshDashboardArtifacts();
  for (const suggestion of createdSuggestions) {
    appendAudit("vibe.task_suggested", "suggestion", suggestion.suggestion_id, `Suggested task: ${suggestion.title}`);
  }
  console.log(JSON.stringify(createdSuggestions.length === 1 ? createdSuggestions[0] : { suggestions: createdSuggestions }, null, 2));
}

module.exports = { vibe };
