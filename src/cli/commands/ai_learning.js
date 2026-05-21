const fs = require("fs");
const os = require("os");
const path = require("path");
const { readJsonFile, writeJsonFile, fileExists } = require("../fs_utils");
const { parseCsv, uniqueList, uniqueBy } = require("../services/collections");
const { table } = require("../ui");

const AI_LEARNING_STATE_FILE = ".kabeeri/ai_learning/failure_patterns.json";
const AI_LEARNING_HARVEST_FILE = ".kabeeri/learning_harvest/candidates.json";
const AI_LEARNING_SHARED_PATTERNS_FILE = "knowledge/ai_learning/shared_patterns.json";
const AI_LEARNING_SHARED_FAST_PATHS_FILE = "knowledge/ai_learning/shared_fast_paths.json";
const AI_LEARNING_PROMOTION_RULES_FILE = "knowledge/ai_learning/promotion_rules.md";
const DEFAULT_STATE = {
  version: "1",
  patterns: [],
  fast_paths: [],
  shared_patterns: [],
  shared_fast_paths: [],
  promotions: []
};

const TRACKS = ["owner", "vibe", "plugin"];
const TRACK_ALIASES = {
  framework_owner: "owner",
  owner: "owner",
  vibe: "vibe",
  vibe_app_developer: "vibe",
  viber: "vibe",
  app: "vibe",
  app_developer: "vibe",
  plugin: "plugin"
};

const PATTERN_CATEGORIES = new Set([
  "test_failure",
  "scope_violation",
  "runtime_state",
  "generated_artifact",
  "track_confusion",
  "source_control",
  "security",
  "dashboard_confusion",
  "execution_loop",
  "other"
]);

const PATTERN_STATUSES = new Set(["active", "resolved", "ignored"]);
const FAST_PATH_STATUSES = new Set(["active", "ignored"]);
const LEARNING_CLASSIFICATIONS = new Set([
  "reusable",
  "app_specific",
  "sensitive",
  "noisy",
  "needs_review",
  "cloud_candidate",
  "not_cloud_safe"
]);

function aiLearning(action, value, flags = {}) {
  const normalizedAction = normalizeAction(action);
  const state = readAiLearningState();

  if (!normalizedAction || normalizedAction === "list") {
    const payload = buildListPayload(state);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderAiLearningList(payload);
    return;
  }

  if (normalizedAction === "capture") {
    const payload = capturePattern(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderCaptureResult(payload);
    return;
  }

  if (normalizedAction === "fast-path" || normalizedAction === "fast_path") {
    const payload = recordFastPath(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderFastPathResult(payload);
    return;
  }

  if (normalizedAction === "prompt-context" || normalizedAction === "prompt_context") {
    const payload = buildPromptContext(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderPromptContext(payload);
    return;
  }

  if (normalizedAction === "review") {
    const payload = reviewLearningCandidates(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderReviewResult(payload);
    return;
  }

  if (normalizedAction === "reject") {
    const payload = rejectLearningCandidate(state, value, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderRejectResult(payload);
    return;
  }

  if (normalizedAction === "export") {
    const payload = exportLearningState(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderExportResult(payload);
    return;
  }

  if (normalizedAction === "import") {
    const payload = importLearningState(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderImportResult(payload);
    return;
  }

  if (normalizedAction === "promote") {
    const payload = promoteLearningEntry(state, value, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderPromotionResult(payload);
    return;
  }

  if (normalizedAction === "shared") {
    const payload = buildSharedLearningPayload(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderSharedLearningList(payload);
    return;
  }

  if (normalizedAction === "metadata" || normalizedAction === "cloud-metadata" || normalizedAction === "cloud_metadata") {
    const payload = buildCloudReadyMetadata(state, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderCloudReadyMetadata(payload);
    return;
  }

  if (normalizedAction === "cache") {
    const payload = handleLearningCache(value, flags);
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    renderCacheResult(payload);
    return;
  }

  throw new Error(`Unknown ai learn action: ${action}`);
}

function capturePattern(state, flags) {
  const title = normalizeRequiredText(flags.title, "Missing --title.");
  const problem = normalizeRequiredText(flags.problem, "Missing --problem.");
  const fix = normalizeRequiredText(flags.fix, "Missing --fix.");
  const category = normalizePatternCategory(flags.category || "other");
  const track = resolveTrack(flags.track);
  const now = new Date().toISOString();
  const relatedFiles = normalizeStringList(flags.files || flags["related-files"]);
  const relatedCommands = normalizeStringList(flags.commands || flags["related-commands"] || flags.validation);
  const appliesToTracks = resolveAppliesToTracks(flags["applies-to-tracks"] || flags.applies_to_tracks || track);
  const rootCause = normalizeText(flags["root-cause"] || flags.root_cause || `Repeated ${category.replace(/_/g, " ")} in AI execution`);
  const preventionRule = normalizeText(flags["prevention-rule"] || flags.prevention_rule || `Before repeating this work, check ${title.toLowerCase()} and the saved validation order.`);
  const promptWarning = normalizeText(flags.warning || flags.prompt_warning || `Watch for ${title.toLowerCase()}.`);

  const existing = state.patterns.find((pattern) => samePattern(pattern, title, problem));
  const pattern = existing
    ? {
        ...existing,
        title,
        problem,
        category,
        root_cause: rootCause,
        fix,
        prevention_rule: preventionRule,
        applies_to_tracks: uniqueList([...(existing.applies_to_tracks || []), ...appliesToTracks]),
        related_files: uniqueList([...(existing.related_files || []), ...relatedFiles]),
        related_commands: uniqueList([...(existing.related_commands || []), ...relatedCommands]),
        seen_count: Number(existing.seen_count || 0) + 1,
        last_seen_at: now,
        status: normalizePatternStatus(flags.status || existing.status || "active"),
        prompt_warning: promptWarning
      }
    : {
        pattern_id: nextPatternId(state.patterns),
        title,
        category,
        problem,
        root_cause: rootCause,
        fix,
        prevention_rule: preventionRule,
        applies_to_tracks: appliesToTracks,
        related_files: relatedFiles,
        related_commands: relatedCommands,
        seen_count: 1,
        last_seen_at: now,
        status: normalizePatternStatus(flags.status || "active"),
        prompt_warning: promptWarning
      };

  state.patterns = upsertPattern(state.patterns, pattern);
  writeAiLearningState(state);

  return {
    report_type: "ai_learning_pattern_captured",
    generated_at: now,
    state_path: AI_LEARNING_STATE_FILE,
    track,
    pattern,
    state: summarizeAiLearningState(state)
  };
}

function recordFastPath(state, flags) {
  const title = normalizeRequiredText(flags.title, "Missing --title.");
  const track = resolveTrack(flags.track);
  const now = new Date().toISOString();
  const steps = normalizeStringList(flags.steps);
  if (!steps.length) throw new Error("Missing --steps.");
  const validationCommands = normalizeStringList(flags.validation || flags.validations || flags["validation-commands"]);
  const appliesToTracks = resolveAppliesToTracks(flags["applies-to-tracks"] || flags.applies_to_tracks || track);
  const problemType = normalizeText(flags.problem_type || flags.problem || title);

  const existing = state.fast_paths.find((fastPath) => normalizeKey(fastPath.title) === normalizeKey(title) && normalizeKey(fastPath.problem_type) === normalizeKey(problemType));
  const fastPath = existing
    ? {
        ...existing,
        title,
        problem_type: problemType,
        steps: steps.length ? steps : (existing.steps || []),
        validation_commands: validationCommands.length ? validationCommands : (existing.validation_commands || []),
        applies_to_tracks: uniqueList([...(existing.applies_to_tracks || []), ...appliesToTracks]),
        status: normalizeFastPathStatus(flags.status || existing.status || "active"),
        last_seen_at: now
      }
    : {
        fast_path_id: nextFastPathId(state.fast_paths),
        title,
        problem_type: problemType,
        steps,
        validation_commands: validationCommands,
        applies_to_tracks: appliesToTracks,
        status: normalizeFastPathStatus(flags.status || "active"),
        created_at: now,
        last_seen_at: now
      };

  state.fast_paths = upsertFastPath(state.fast_paths, fastPath);
  writeAiLearningState(state);

  return {
    report_type: "ai_learning_fast_path_recorded",
    generated_at: now,
    state_path: AI_LEARNING_STATE_FILE,
    track,
    fast_path: fastPath,
    state: summarizeAiLearningState(state)
  };
}

function buildListPayload(state) {
  const normalized = normalizeState(state);
  return {
    report_type: "ai_learning_memory_state",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    ...normalized,
    summary: summarizeAiLearningState(normalized)
  };
}

function buildPromptContext(state, flags) {
  const track = resolveTrack(flags.track);
  const normalized = normalizeState(state);
  const sharedKnowledge = readSharedKnowledgeState();
  const activePatterns = normalized.patterns.filter((pattern) => isTrackApplicable(pattern.applies_to_tracks, track) && normalizePatternStatus(pattern.status) === "active");
  const activeFastPaths = normalized.fast_paths.filter((fastPath) => isTrackApplicable(fastPath.applies_to_tracks, track) && normalizeFastPathStatus(fastPath.status) === "active");
  const sharedPatterns = uniqueBy([
    ...normalized.shared_patterns,
    ...sharedKnowledge.shared_patterns
  ].filter((pattern) => isTrackApplicable(pattern.applies_to_tracks, track) && normalizePatternStatus(pattern.status) === "active"), "pattern_id");
  const sharedFastPaths = uniqueBy([
    ...normalized.shared_fast_paths,
    ...sharedKnowledge.shared_fast_paths
  ].filter((fastPath) => isTrackApplicable(fastPath.applies_to_tracks, track) && normalizeFastPathStatus(fastPath.status) === "active"), "fast_path_id");
  const warningRules = uniqueBy([...activePatterns, ...sharedPatterns], "pattern_id");
  const fastPaths = uniqueBy([...activeFastPaths, ...sharedFastPaths], "fast_path_id");

  return {
    report_type: "ai_learning_prompt_context",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    track,
    active_warning_rules: warningRules.map((pattern) => ({
      pattern_id: pattern.pattern_id,
      title: pattern.title,
      category: pattern.category,
      problem: pattern.problem,
      root_cause: pattern.root_cause,
      fix: pattern.fix,
      prevention_rule: pattern.prevention_rule,
      prompt_warning: pattern.prompt_warning,
      applies_to_tracks: pattern.applies_to_tracks,
      related_files: pattern.related_files,
      related_commands: pattern.related_commands,
      seen_count: pattern.seen_count,
      last_seen_at: pattern.last_seen_at,
      status: pattern.status,
      shared: Boolean(pattern.shared_at || pattern.promotion_id)
    })),
    active_fast_paths: fastPaths.map((fastPath) => ({
      fast_path_id: fastPath.fast_path_id,
      title: fastPath.title,
      problem_type: fastPath.problem_type,
      steps: fastPath.steps,
      validation_commands: fastPath.validation_commands,
      applies_to_tracks: fastPath.applies_to_tracks,
      status: fastPath.status,
      shared: Boolean(fastPath.shared_at || fastPath.promotion_id)
    })),
    shared_warning_rules: sharedPatterns.map((pattern) => ({
      pattern_id: pattern.pattern_id,
      title: pattern.title,
      category: pattern.category,
      prompt_warning: pattern.prompt_warning,
      applies_to_tracks: pattern.applies_to_tracks,
      shared_at: pattern.shared_at || pattern.promoted_at || null
    })),
    shared_fast_path_summaries: sharedFastPaths.map((fastPath) => ({
      fast_path_id: fastPath.fast_path_id,
      title: fastPath.title,
      problem_type: fastPath.problem_type,
      validation_commands: fastPath.validation_commands,
      applies_to_tracks: fastPath.applies_to_tracks,
      shared_at: fastPath.shared_at || fastPath.promoted_at || null
    })),
    prompt_warnings: uniqueList([...activePatterns, ...sharedPatterns].map((pattern) => pattern.prompt_warning).filter(Boolean)),
    fast_path_summaries: fastPaths.map((fastPath) => ({
      fast_path_id: fastPath.fast_path_id,
      title: fastPath.title,
      problem_type: fastPath.problem_type,
      steps: fastPath.steps,
      validation_commands: fastPath.validation_commands
    })),
    summary: {
      warning_count: warningRules.length,
      fast_path_count: fastPaths.length,
      shared_warning_count: sharedPatterns.length,
      shared_fast_path_count: sharedFastPaths.length
    }
  };
}

function buildAiLearningPromptContext(track, options = {}) {
  const state = readAiLearningState();
  const payload = buildPromptContext(state, { track });
  if (options.include_all !== false) return payload;
  return {
    track: payload.track,
    active_warning_rules: payload.active_warning_rules,
    active_fast_paths: payload.active_fast_paths,
    shared_warning_rules: payload.shared_warning_rules,
    shared_fast_path_summaries: payload.shared_fast_path_summaries,
    prompt_warnings: payload.prompt_warnings,
    fast_path_summaries: payload.fast_path_summaries,
    summary: payload.summary
  };
}

function buildAiLearningPromptSection(aiLearning, options = {}) {
  if (!aiLearning || typeof aiLearning !== "object") return [];
  const promptContext = normalizeAiLearningPromptContext(aiLearning);
  const stateResync = options.state_resync || options.stateResync || null;
  const warningItems = uniqueBy([
    ...(Array.isArray(promptContext.active_warning_rules) ? promptContext.active_warning_rules : []),
    ...(Array.isArray(promptContext.shared_warning_rules) ? promptContext.shared_warning_rules : [])
  ], "pattern_id").filter(isPromptSafeLearningWarning);
  const fastPathItems = uniqueBy([
    ...(Array.isArray(promptContext.active_fast_paths) ? promptContext.active_fast_paths : []),
    ...(Array.isArray(promptContext.shared_fast_path_summaries) ? promptContext.shared_fast_path_summaries : [])
  ], "fast_path_id").filter(isPromptSafeLearningFastPath);
  const driftWarnings = buildStateResyncPromptWarnings(stateResync);
  if (!warningItems.length && !fastPathItems.length) return [];
  const lines = ["## AI Learning Context", ""];
  if (warningItems.length) {
    lines.push("Known recurring failure patterns:");
    for (const item of warningItems) {
      lines.push(`- ${item.prompt_warning || item.prevention_rule || item.title}`);
    }
  }
  if (fastPathItems.length) {
    if (warningItems.length) lines.push("");
    lines.push("Fast paths:");
    for (const item of fastPathItems) {
      const steps = Array.isArray(item.validation_commands) && item.validation_commands.length
        ? item.validation_commands
        : (Array.isArray(item.steps) ? item.steps : []);
      const summary = steps.length ? `${item.title}: ${steps.join(" -> ")}` : item.title;
      lines.push(`- ${summary}`);
    }
  }
  if (driftWarnings.length) {
    if (warningItems.length || fastPathItems.length) lines.push("");
    lines.push("State Resync / planner drift warnings:");
    for (const warning of driftWarnings) lines.push(`- ${warning}`);
  }
  return lines;
}

function normalizeAiLearningPromptContext(aiLearning) {
  return {
    track: normalizeText(aiLearning.track || ""),
    active_warning_rules: Array.isArray(aiLearning.active_warning_rules) ? aiLearning.active_warning_rules : [],
    active_fast_paths: Array.isArray(aiLearning.active_fast_paths) ? aiLearning.active_fast_paths : [],
    shared_warning_rules: Array.isArray(aiLearning.shared_warning_rules) ? aiLearning.shared_warning_rules : [],
    shared_fast_path_summaries: Array.isArray(aiLearning.shared_fast_path_summaries) ? aiLearning.shared_fast_path_summaries : []
  };
}

function buildStateResyncPromptWarnings(stateResync) {
  if (!stateResync || typeof stateResync !== "object") return [];
  if (String(stateResync.status || "").toLowerCase() === "current") return [];
  const messages = [];
  for (const reason of uniqueList([...(Array.isArray(stateResync.reasons) ? stateResync.reasons : []), stateResync.reason].filter(Boolean))) {
    const text = normalizeText(reason);
    if (text) messages.push(text);
  }
  if (!messages.length && stateResync.next_action) {
    messages.push(normalizeText(stateResync.next_action));
  }
  return messages.filter(Boolean);
}

function isPromptSafeLearningWarning(item) {
  const text = [
    item && item.prompt_warning,
    item && item.prevention_rule,
    item && item.title
  ].filter(Boolean).join(" ");
  return isPromptSafeLearningText(text);
}

function isPromptSafeLearningFastPath(item) {
  const text = [
    item && item.title,
    item && item.problem_type,
    ...(Array.isArray(item && item.steps) ? item.steps : []),
    ...(Array.isArray(item && item.validation_commands) ? item.validation_commands : [])
  ].filter(Boolean).join(" ");
  return isPromptSafeLearningText(text);
}

function isPromptSafeLearningText(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const sensitivePatterns = [
    /\b(secret|token|password|passwd|credential|api[-_ ]?key|bearer|private key|client[-\s]?specific|confidential|sensitive)\b/i,
    /\b\.env\b/i,
    /\bssn\b/i
  ];
  return !sensitivePatterns.some((pattern) => pattern.test(normalized));
}

function renderAiLearningList(payload) {
  console.log("AI Learning Memory");
  console.log("");
  console.log("Patterns");
  console.log(table(["ID", "Title", "Category", "Status", "Seen", "Tracks"], payload.patterns.map((pattern) => [
    pattern.pattern_id,
    pattern.title,
    pattern.category,
    pattern.status,
    pattern.seen_count,
    (pattern.applies_to_tracks || []).join(", ")
  ])));
  console.log("");
  console.log("Fast Paths");
  console.log(table(["ID", "Title", "Problem Type", "Status", "Tracks"], payload.fast_paths.map((fastPath) => [
    fastPath.fast_path_id,
    fastPath.title,
    fastPath.problem_type,
    fastPath.status,
    (fastPath.applies_to_tracks || []).join(", ")
  ])));
  console.log("");
  console.log("Shared Patterns");
  console.log(table(["ID", "Title", "Category", "Shared At"], payload.shared_patterns.map((pattern) => [
    pattern.pattern_id,
    pattern.title,
    pattern.category,
    pattern.shared_at || pattern.promoted_at || ""
  ])));
  console.log("");
  console.log("Shared Fast Paths");
  console.log(table(["ID", "Title", "Problem Type", "Shared At"], payload.shared_fast_paths.map((fastPath) => [
    fastPath.fast_path_id,
    fastPath.title,
    fastPath.problem_type,
    fastPath.shared_at || fastPath.promoted_at || ""
  ])));
  console.log("");
  console.log("Promotions");
  console.log(table(["ID", "Item", "Status"], payload.promotions.map((promotion) => [
    promotion.promotion_id,
    `${promotion.item_type}:${promotion.source_id}`,
    promotion.status
  ])));
}

function renderCaptureResult(payload) {
  console.log(`Captured AI learning pattern ${payload.pattern.pattern_id}`);
  console.log(payload.pattern.prompt_warning || payload.pattern.prevention_rule || payload.pattern.problem);
}

function renderFastPathResult(payload) {
  console.log(`Recorded AI learning fast path ${payload.fast_path.fast_path_id}`);
  console.log((payload.fast_path.steps || []).join(" -> "));
}

function renderPromptContext(payload) {
  console.log(`AI Learning Prompt Context (${payload.track})`);
  console.log("");
  console.log("Warnings");
  console.log(table(["ID", "Title", "Category", "Seen", "Warning"], payload.active_warning_rules.map((pattern) => [
    pattern.pattern_id,
    pattern.title,
    pattern.category,
    pattern.seen_count,
    pattern.prompt_warning
  ])));
  console.log("");
  console.log("Fast Paths");
  console.log(table(["ID", "Title", "Validation"], payload.active_fast_paths.map((fastPath) => [
    fastPath.fast_path_id,
    fastPath.title,
    (fastPath.validation_commands || []).join(", ")
  ])));
}

function renderSharedLearningList(payload) {
  console.log("Shared AI Learning");
  console.log("");
  console.log("Shared Patterns");
  console.log(table(["ID", "Title", "Category", "Tracks", "Shared At"], payload.shared_patterns.map((pattern) => [
    pattern.pattern_id,
    pattern.title,
    pattern.category,
    (pattern.applies_to_tracks || []).join(", "),
    pattern.shared_at || pattern.promoted_at || ""
  ])));
  console.log("");
  console.log("Shared Fast Paths");
  console.log(table(["ID", "Title", "Problem Type", "Tracks", "Shared At"], payload.shared_fast_paths.map((fastPath) => [
    fastPath.fast_path_id,
    fastPath.title,
    fastPath.problem_type,
    (fastPath.applies_to_tracks || []).join(", "),
    fastPath.shared_at || fastPath.promoted_at || ""
  ])));
  console.log("");
  console.log("Promotions");
  console.log(table(["ID", "Item", "Source", "Status"], payload.promotions.map((promotion) => [
    promotion.promotion_id,
    promotion.title,
    `${promotion.item_type}:${promotion.source_id}`,
    promotion.status
  ])));
}

function renderExportResult(payload) {
  console.log("AI Learning export prepared");
  console.log(`Export format: ${payload.export_format}`);
  console.log(`Shared items: ${payload.summary.shared_patterns_total + payload.summary.shared_fast_paths_total}`);
}

function renderImportResult(payload) {
  console.log("AI Learning import complete");
  console.log(`Imported patterns: ${payload.imported.patterns_total}`);
  console.log(`Imported fast paths: ${payload.imported.fast_paths_total}`);
}

function renderPromotionResult(payload) {
  console.log(`Promoted AI learning ${payload.promotion.item_type} ${payload.promotion.source_id}`);
  console.log(payload.promotion.cloud_ready_metadata ? "Cloud-ready metadata prepared." : "Cloud-ready metadata not requested.");
}

function renderCloudReadyMetadata(payload) {
  console.log("AI Learning Cloud Metadata");
  console.log("");
  console.log(table(["Field", "Value"], [
    ["Cloud ready", payload.cloud_ready ? "yes" : "no"],
    ["Sync mode", payload.sync_mode],
    ["Export format", payload.export_format],
    ["Provider", payload.provider],
    ["Shared patterns", String(payload.summary.shared_patterns_total)],
    ["Shared fast paths", String(payload.summary.shared_fast_paths_total)],
    ["Promotions", String(payload.summary.promotions_total)]
  ]));
}

function renderReviewResult(payload) {
  console.log("AI Learning Harvest Review");
  console.log("");
  console.log(table(["Candidate", "Title", "Classification", "State"], payload.candidates.map((candidate) => [
    candidate.candidate_id,
    candidate.title,
    candidate.classification,
    candidate.rejected ? "rejected" : candidate.approved ? "approved" : "pending"
  ])));
}

function renderRejectResult(payload) {
  console.log(`Rejected AI learning candidate ${payload.candidate.candidate_id}`);
  console.log(payload.candidate.rejection_reason || "No rejection reason supplied.");
}

function renderCacheResult(payload) {
  console.log("AI Learning Global Cache");
  console.log("");
  console.log(table(["Field", "Value"], [
    ["Patterns", String(payload.summary.shared_patterns_total)],
    ["Fast paths", String(payload.summary.shared_fast_paths_total)],
    ["Cache path", payload.cache_path]
  ]));
}

function readAiLearningState() {
  if (!fileExists(AI_LEARNING_STATE_FILE)) return normalizeState(DEFAULT_STATE);
  return normalizeState(readJsonFile(AI_LEARNING_STATE_FILE));
}

function writeAiLearningState(state) {
  writeJsonFile(AI_LEARNING_STATE_FILE, normalizeState(state));
}

function resolveWorkspaceLearningPath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

function resolveUserLearningCachePath(...segments) {
  const home = process.env.KABEERI_HOME || process.env.HOME || process.env.USERPROFILE || os.homedir();
  return path.join(home, ".kabeeri", "learning", ...segments);
}

function readJsonFileIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFileAbsolute(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readSharedKnowledgeState() {
  return {
    shared_patterns: normalizeSharedPatternList(readJsonFileIfExists(resolveWorkspaceLearningPath(AI_LEARNING_SHARED_PATTERNS_FILE), [])),
    shared_fast_paths: normalizeSharedFastPathList(readJsonFileIfExists(resolveWorkspaceLearningPath(AI_LEARNING_SHARED_FAST_PATHS_FILE), []))
  };
}

function writeSharedKnowledgeState(sharedPatterns, sharedFastPaths) {
  writeJsonFileAbsolute(resolveWorkspaceLearningPath(AI_LEARNING_SHARED_PATTERNS_FILE), sharedPatterns);
  writeJsonFileAbsolute(resolveWorkspaceLearningPath(AI_LEARNING_SHARED_FAST_PATHS_FILE), sharedFastPaths);
}

function readHarvestState() {
  const filePath = resolveWorkspaceLearningPath(AI_LEARNING_HARVEST_FILE);
  if (!fs.existsSync(filePath)) {
    return { version: "1", candidates: [] };
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    version: String(data.version || "1"),
    candidates: Array.isArray(data.candidates) ? data.candidates.map(normalizeLearningCandidate).filter(Boolean) : []
  };
}

function writeHarvestState(state) {
  writeJsonFileAbsolute(resolveWorkspaceLearningPath(AI_LEARNING_HARVEST_FILE), {
    version: "1",
    updated_at: new Date().toISOString(),
    candidates: Array.isArray(state.candidates) ? state.candidates.map(normalizeLearningCandidate).filter(Boolean) : []
  });
}

function readUserLearningCache() {
  const root = resolveUserLearningCachePath();
  return {
    cache_path: root,
    shared_patterns: normalizeSharedPatternList(readJsonFileIfExists(path.join(root, "shared_patterns.json"), [])),
    shared_fast_paths: normalizeSharedFastPathList(readJsonFileIfExists(path.join(root, "shared_fast_paths.json"), []))
  };
}

function writeUserLearningCache(sharedPatterns, sharedFastPaths) {
  const root = resolveUserLearningCachePath();
  writeJsonFileAbsolute(path.join(root, "shared_patterns.json"), sharedPatterns);
  writeJsonFileAbsolute(path.join(root, "shared_fast_paths.json"), sharedFastPaths);
}

function normalizeState(state) {
  const normalized = state && typeof state === "object" ? { ...state } : {};
  normalized.version = String(normalized.version || "1");
  normalized.patterns = Array.isArray(normalized.patterns) ? normalized.patterns.map(normalizePattern).filter(Boolean) : [];
  normalized.fast_paths = Array.isArray(normalized.fast_paths) ? normalized.fast_paths.map(normalizeFastPath).filter(Boolean) : [];
  normalized.shared_patterns = Array.isArray(normalized.shared_patterns) ? normalized.shared_patterns.map(normalizeSharedPattern).filter(Boolean) : [];
  normalized.shared_fast_paths = Array.isArray(normalized.shared_fast_paths) ? normalized.shared_fast_paths.map(normalizeSharedFastPath).filter(Boolean) : [];
  normalized.promotions = Array.isArray(normalized.promotions) ? normalized.promotions.map(normalizePromotion).filter(Boolean) : [];
  return normalized;
}

function exportLearningState(state, flags = {}) {
  const normalized = normalizeState(state);
  const payload = buildExportPayload(normalized, flags);
  const outputFile = normalizeText(flags.file || flags.output || flags.path || flags.to || "docs/kvdf-learning/learning-export.json");
  const resolved = resolveWorkspaceLearningPath(outputFile);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const markdownFile = resolved.replace(/\.json$/i, ".md");
  fs.writeFileSync(markdownFile, buildExportMarkdown(payload), "utf8");
  payload.output_file = path.relative(process.cwd(), resolved).replace(/\\/g, "/");
  payload.markdown_file = path.relative(process.cwd(), markdownFile).replace(/\\/g, "/");
  return payload;
}

function importLearningState(state, flags = {}) {
  if (resolveTrack(flags.track) !== "owner") throw new Error("AI learning import is owner-track only.");
  const inputFile = normalizeText(flags.file || flags.input || flags.source || flags.path || flags.from);
  if (!inputFile) throw new Error("Missing --from for ai learning import.");
  const resolved = resolveLearningFilePath(inputFile);
  if (!fs.existsSync(resolved)) throw new Error(`AI learning import file not found: ${inputFile}`);
  const imported = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (normalizeText(imported.report_type) !== "kvdf_ai_learning_export") throw new Error("Invalid AI learning export package.");
  const harvest = readHarvestState();
  const candidates = mergeLearningCandidates(harvest.candidates, buildCandidatesFromExport(imported, flags));
  writeHarvestState({ candidates });
  return buildImportPayload(candidates, imported, flags, inputFile);
}

function promoteLearningEntry(state, value, flags = {}) {
  if (resolveTrack(flags.track) !== "owner") throw new Error("AI learning promotion is owner-track only.");
  if (!isTruthyFlag(flags.confirm)) throw new Error("Missing --confirm for ai learning promote.");
  const candidateId = normalizeText(value || flags.value || flags.candidate_id || flags["candidate-id"] || flags.id);
  if (!candidateId) throw new Error("Missing candidate id for ai learning promote.");
  const harvest = readHarvestState();
  const candidate = harvest.candidates.find((item) => item.candidate_id === candidateId);
  if (!candidate) throw new Error(`AI learning candidate not found: ${candidateId}`);
  if (candidate.rejected) throw new Error(`AI learning candidate is rejected: ${candidateId}`);
  const sharedScope = resolveAppliesToTracks(flags["shared-scope"] || flags.shared_scope || flags.applies_to_tracks || "all");
  const ownerApprovedForCloud = isTruthyFlag(flags.owner_approved_for_cloud || flags["owner-approved-for-cloud"] || flags.cloud_approve || flags["cloud-approve"]);
  const current = normalizeState(state);
  const nextState = applyPromotion(current, candidate, { ...flags, shared_scope: sharedScope });
  writeAiLearningState(nextState);
  const nextHarvest = {
    candidates: harvest.candidates.map((item) => item.candidate_id === candidateId ? {
      ...item,
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: resolvePromotionActor(flags),
      owner_approved_for_cloud: ownerApprovedForCloud || Boolean(item.owner_approved_for_cloud)
    } : item)
  };
  writeHarvestState(nextHarvest);
  return buildPromotionPayload(nextState, {
    ...candidate,
    owner_approved_for_cloud: ownerApprovedForCloud || Boolean(candidate.owner_approved_for_cloud),
    cloud_ready_metadata: buildPromotionCloudMetadata({
      ...candidate,
      owner_approved_for_cloud: ownerApprovedForCloud || Boolean(candidate.owner_approved_for_cloud)
    }, candidate.item_type, sharedScope)
  }, { ...flags, shared_scope: sharedScope });
}

function buildSharedLearningPayload(state, flags = {}) {
  const normalized = normalizeState(state);
  const track = resolveTrack(flags.track);
  const sharedKnowledge = readSharedKnowledgeState();
  const sharedPatterns = uniqueBy([
    ...normalized.shared_patterns,
    ...sharedKnowledge.shared_patterns
  ].filter((pattern) => isTrackApplicable(pattern.applies_to_tracks, track)), "shared_pattern_id");
  const sharedFastPaths = uniqueBy([
    ...normalized.shared_fast_paths,
    ...sharedKnowledge.shared_fast_paths
  ].filter((fastPath) => isTrackApplicable(fastPath.applies_to_tracks, track)), "shared_fast_path_id");
  return {
    report_type: "ai_learning_shared_learning_state",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    track,
    shared_patterns: sharedPatterns,
    shared_fast_paths: sharedFastPaths,
    promotions: normalized.promotions,
    summary: {
      shared_patterns_total: sharedPatterns.length,
      shared_fast_paths_total: sharedFastPaths.length,
      promotions_total: normalized.promotions.length
    }
  };
}

function buildCloudReadyMetadata(state, flags = {}) {
  const normalized = normalizeState(state);
  const summary = summarizeAiLearningState(normalized);
  return {
    report_type: "ai_learning_cloud_ready_metadata",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    cloud_ready: true,
    sync_mode: "local_first",
    export_format: "json",
    provider: "future",
    track: resolveTrack(flags.track),
    summary: {
      ...summary,
      shared_patterns_total: normalized.shared_patterns.length,
      shared_fast_paths_total: normalized.shared_fast_paths.length,
      promotions_total: normalized.promotions.length
    },
    next_action: "Export or promote shared learning when you are ready to package metadata for a future cloud provider."
  };
}

function buildExportPayload(state, flags = {}) {
  const track = resolveTrack(flags.track);
  const appSlug = normalizeText(flags.app_slug || flags.app || path.basename(process.cwd()));
  const exportId = normalizeText(flags.export_id || `kvdf-ai-export-${track}-${appSlug}`.replace(/[^a-zA-Z0-9_.-]/g, "-"));
  const source = {
    export_id: exportId,
    track,
    app_slug: appSlug,
    repo_root_hint: process.cwd().replace(/\\/g, "/"),
    sanitized: true
  };
  const exportPatterns = state.patterns.map((pattern) => sanitizePatternForExport(pattern, track));
  const exportFastPaths = state.fast_paths.map((fastPath) => sanitizeFastPathForExport(fastPath, track));
  const promotionCandidates = buildPromotionCandidatesFromExportCollections(exportPatterns, exportFastPaths, source);
  const sensitiveItemsRemoved = [...exportPatterns, ...exportFastPaths].reduce((sum, item) => sum + Number(item.sensitive_items_removed || 0), 0);
  return {
    report_type: "kvdf_ai_learning_export",
    export_version: "1",
    generated_at: new Date().toISOString(),
    source,
    cloud_ready: false,
    consent_required: true,
    owner_approved_for_cloud: false,
    anonymized: true,
    sensitive_items_removed: sensitiveItemsRemoved,
    dataset_tags: uniqueList([
      ...exportPatterns.flatMap((item) => item.dataset_tags || []),
      ...exportFastPaths.flatMap((item) => item.dataset_tags || [])
    ]),
    training_eligible: false,
    patterns: exportPatterns,
    fast_paths: exportFastPaths,
    promotion_candidates: promotionCandidates
  };
}

function buildImportPayload(candidates, imported, flags = {}, inputFile = "") {
  return {
    report_type: "ai_learning_import",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    import_file: inputFile,
    track: resolveTrack(flags.track),
    candidates: candidates,
    imported: {
      patterns_total: Array.isArray(imported.patterns) ? imported.patterns.length : 0,
      fast_paths_total: Array.isArray(imported.fast_paths) ? imported.fast_paths.length : 0,
      promotion_candidates_total: Array.isArray(imported.promotion_candidates) ? imported.promotion_candidates.length : 0
    },
    summary: {
      candidates_total: candidates.length,
      reusable_total: candidates.filter((candidate) => candidate.classification === "reusable").length,
      sensitive_total: candidates.filter((candidate) => candidate.classification === "sensitive").length,
      cloud_candidate_total: candidates.filter((candidate) => candidate.classification === "cloud_candidate").length
    },
    next_action: "Run `kvdf learn review --json` to classify imported candidates."
  };
}

function buildPromotionPayload(state, promotion, flags = {}) {
  return {
    report_type: "ai_learning_promotion",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    track: resolveTrack(flags.track),
    promotion: {
      ...promotion,
      cloud_ready_metadata: promotion.cloud_ready_metadata && typeof promotion.cloud_ready_metadata === "object"
        ? { ...promotion.cloud_ready_metadata }
        : null
    },
    state,
    summary: {
      ...summarizeAiLearningState(state),
      shared_patterns_total: state.shared_patterns.length,
      shared_fast_paths_total: state.shared_fast_paths.length,
      promotions_total: state.promotions.length
    },
    cloud_ready_metadata: buildCloudReadyMetadata(state, flags)
  };
}

function reviewLearningCandidates(state, flags = {}) {
  const harvest = readHarvestState();
  const candidates = harvest.candidates.map((candidate) => classifyLearningCandidate(candidate, flags));
  return {
    report_type: "ai_learning_harvest_review",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_HARVEST_FILE,
    track: resolveTrack(flags.track),
    candidates,
    summary: {
      candidates_total: candidates.length,
      reusable_total: candidates.filter((candidate) => candidate.classification === "reusable").length,
      sensitive_total: candidates.filter((candidate) => candidate.classification === "sensitive").length,
      cloud_candidate_total: candidates.filter((candidate) => candidate.classification === "cloud_candidate").length,
      rejected_total: candidates.filter((candidate) => candidate.rejected).length
    }
  };
}

function rejectLearningCandidate(state, value, flags = {}) {
  if (resolveTrack(flags.track) !== "owner") throw new Error("AI learning rejection is owner-track only.");
  const candidateId = normalizeText(value || flags.candidate_id || flags["candidate-id"] || flags.id);
  if (!candidateId) throw new Error("Missing candidate id for ai learning reject.");
  const harvest = readHarvestState();
  const now = new Date().toISOString();
  const reason = normalizeText(flags.reason || flags.note || "");
  const updated = harvest.candidates.map((candidate) => candidate.candidate_id === candidateId ? {
    ...candidate,
    rejected: true,
    rejected_at: now,
    rejection_reason: reason,
    approved: false
  } : candidate);
  writeHarvestState({ candidates: updated });
  const candidate = updated.find((item) => item.candidate_id === candidateId);
  if (!candidate) throw new Error(`AI learning candidate not found: ${candidateId}`);
  return {
    report_type: "ai_learning_candidate_rejected",
    generated_at: now,
    state_path: AI_LEARNING_HARVEST_FILE,
    track: resolveTrack(flags.track),
    candidate
  };
}

function handleLearningCache(value, flags = {}) {
  const normalizedValue = normalizeAction(value);
  if (!normalizedValue || normalizedValue === "list") {
    return buildCachePayload(readUserLearningCache(), flags);
  }
  if (normalizedValue !== "update") throw new Error("Unknown ai learning cache action. Use update or list.");
  const inputFile = normalizeText(flags.file || flags.input || flags.source || flags.path || flags["from-export"] || flags.from_export || flags.from);
  if (!inputFile) throw new Error("Missing --from-export for ai learning cache update.");
  const resolved = resolveLearningFilePath(inputFile);
  if (!fs.existsSync(resolved)) throw new Error(`AI learning export file not found: ${inputFile}`);
  const exportPackage = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const sharedPatterns = normalizeSharedPatternList((exportPackage.patterns || []).map((item) => toSharedPatternFromExport(item, exportPackage.source)));
  const sharedFastPaths = normalizeSharedFastPathList((exportPackage.fast_paths || []).map((item) => toSharedFastPathFromExport(item, exportPackage.source)));
  writeUserLearningCache(sharedPatterns, sharedFastPaths);
  return buildCachePayload({ cache_path: resolveUserLearningCachePath(), shared_patterns: sharedPatterns, shared_fast_paths: sharedFastPaths }, flags);
}

function buildCachePayload(cache, flags = {}) {
  return {
    report_type: "kvdf_ai_learning_cache",
    generated_at: new Date().toISOString(),
    cache_path: cache.cache_path || resolveUserLearningCachePath(),
    track: resolveTrack(flags.track),
    shared_patterns: cache.shared_patterns || [],
    shared_fast_paths: cache.shared_fast_paths || [],
    summary: {
      shared_patterns_total: (cache.shared_patterns || []).length,
      shared_fast_paths_total: (cache.shared_fast_paths || []).length
    }
  };
}

function buildExportMarkdown(payload) {
  return [
    "# KVDF AI Learning Export",
    "",
    `- Report type: ${payload.report_type}`,
    `- Generated at: ${payload.generated_at}`,
    `- Track: ${payload.source.track}`,
    `- App slug: ${payload.source.app_slug}`,
    `- Cloud ready: ${payload.cloud_ready ? "yes" : "no"}`,
    `- Consent required: ${payload.consent_required ? "yes" : "no"}`,
    `- Training eligible: ${payload.training_eligible ? "yes" : "no"}`,
    `- Patterns: ${payload.patterns.length}`,
    `- Fast paths: ${payload.fast_paths.length}`,
    `- Candidates: ${payload.promotion_candidates.length}`,
    "",
    "## Candidate Preview",
    ...payload.promotion_candidates.slice(0, 20).map((candidate) => `- ${candidate.candidate_id}: ${candidate.title} (${candidate.classification})`)
  ].join("\n");
}

function buildCandidatesFromExport(exportPackage, flags = {}) {
  const source = exportPackage.source || {};
  const candidates = [];
  for (const pattern of Array.isArray(exportPackage.patterns) ? exportPackage.patterns : []) {
    candidates.push({
      candidate_id: nextLearningCandidateId(candidates),
      source_export_id: source.export_id || `${source.app_slug || "export"}-${source.track || resolveTrack(flags.track)}`,
      app_slug: normalizeText(source.app_slug || ""),
      source: { type: "learning_export", candidate_id: "", app_slug: normalizeText(source.app_slug || "") },
      item_type: "pattern",
      title: pattern.title,
      classification: pattern.classification || classifyExportPattern(pattern),
      generalized_problem: pattern.generalized_problem || pattern.problem || "",
      generalized_fix: pattern.generalized_fix || pattern.fix || "",
      prevention_rule: pattern.prevention_rule || "",
      prompt_warning: pattern.prompt_warning || "",
      applies_to_tracks: resolveAppliesToTracks(pattern.applies_to_tracks || source.track || resolveTrack(flags.track)),
      cloud_ready: Boolean(pattern.cloud_ready || exportPackage.cloud_ready),
      training_eligible: Boolean(pattern.training_eligible || exportPackage.training_eligible),
      owner_approved_for_cloud: Boolean(pattern.owner_approved_for_cloud || exportPackage.owner_approved_for_cloud),
      approved: false,
      rejected: false
    });
  }
  for (const fastPath of Array.isArray(exportPackage.fast_paths) ? exportPackage.fast_paths : []) {
    candidates.push({
      candidate_id: nextLearningCandidateId(candidates),
      source_export_id: source.export_id || `${source.app_slug || "export"}-${source.track || resolveTrack(flags.track)}`,
      app_slug: normalizeText(source.app_slug || ""),
      source: { type: "learning_export", candidate_id: "", app_slug: normalizeText(source.app_slug || "") },
      item_type: "fast-path",
      title: fastPath.title,
      classification: fastPath.classification || classifyExportFastPath(fastPath),
      generalized_problem: fastPath.generalized_problem || fastPath.problem_type || "",
      generalized_fix: fastPath.generalized_fix || fastPath.steps?.join(" -> ") || "",
      prevention_rule: fastPath.prevention_rule || "",
      prompt_warning: fastPath.prompt_warning || "",
      applies_to_tracks: resolveAppliesToTracks(fastPath.applies_to_tracks || source.track || resolveTrack(flags.track)),
      cloud_ready: Boolean(fastPath.cloud_ready || exportPackage.cloud_ready),
      training_eligible: Boolean(fastPath.training_eligible || exportPackage.training_eligible),
      owner_approved_for_cloud: Boolean(fastPath.owner_approved_for_cloud || exportPackage.owner_approved_for_cloud),
      approved: false,
      rejected: false
    });
  }
  return candidates.map(normalizeLearningCandidate).filter(Boolean);
}

function mergeLearningCandidates(current, incoming) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((candidate) => candidate.candidate_id));
  for (const candidate of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizeLearningCandidate(candidate);
    if (!normalized || seen.has(normalized.candidate_id)) continue;
    seen.add(normalized.candidate_id);
    list.push(normalized);
  }
  return list.sort((a, b) => a.candidate_id.localeCompare(b.candidate_id));
}

function applyPromotion(state, candidate, flags = {}) {
  const next = normalizeState(state);
  const promotedBy = normalizeText(flags.promoted_by || flags.owner || flags.by || resolvePromotionActor(flags));
  const sharedScope = resolveAppliesToTracks(flags["shared-scope"] || flags.shared_scope || flags.applies_to_tracks || "all");
  const now = new Date().toISOString();
  if (candidate.item_type === "pattern") {
    const sharedPattern = {
      shared_pattern_id: nextSharedPatternId(readSharedKnowledgeState().shared_patterns.concat(next.shared_patterns)),
      title: candidate.title,
      category: normalizePatternCategory(candidate.category || "other"),
      source: {
        type: "learning_export",
        candidate_id: candidate.candidate_id,
        app_slug: normalizeText(candidate.app_slug || candidate.source_app_slug || candidate.source_export_id || "unknown")
      },
      generalized_problem: normalizeText(candidate.generalized_problem || ""),
      generalized_fix: normalizeText(candidate.generalized_fix || ""),
      prevention_rule: normalizeText(candidate.prevention_rule || ""),
      prompt_warning: normalizeText(candidate.prompt_warning || ""),
      applies_to_tracks: sharedScope,
      applies_to_domains: [],
      approved_by: promotedBy,
      approved_at: now,
      status: "active",
      cloud_ready: false,
      training_eligible: false,
      owner_approved_for_cloud: Boolean(candidate.owner_approved_for_cloud && isTruthyFlag(flags.owner_approved_for_cloud || flags["owner-approved-for-cloud"] || flags.cloud_approve || flags["cloud-approve"]))
    };
    const sharedKnowledge = readSharedKnowledgeState();
    writeSharedKnowledgeState(
      upsertSharedKnowledgePattern(sharedKnowledge.shared_patterns, sharedPattern),
      sharedKnowledge.shared_fast_paths
    );
    next.shared_patterns = upsertSharedPattern(next.shared_patterns, {
      pattern_id: sharedPattern.shared_pattern_id,
      title: candidate.title,
      category: sharedPattern.category,
      problem: sharedPattern.generalized_problem,
      root_cause: "",
      fix: sharedPattern.generalized_fix,
      prevention_rule: sharedPattern.prevention_rule,
      applies_to_tracks: sharedPattern.applies_to_tracks,
      related_files: [],
      related_commands: [],
      seen_count: 1,
      last_seen_at: now,
      status: "active",
      prompt_warning: sharedPattern.prompt_warning,
      shared_at: now,
      shared_by: promotedBy,
      promotion_id: candidate.candidate_id,
      shared_scope: sharedScope
    });
  } else {
    const sharedFastPath = {
      shared_fast_path_id: nextSharedFastPathId(readSharedKnowledgeState().shared_fast_paths.concat(next.shared_fast_paths)),
      title: candidate.title,
      source: {
        type: "learning_export",
        candidate_id: candidate.candidate_id,
        app_slug: normalizeText(candidate.app_slug || candidate.source_app_slug || candidate.source_export_id || "unknown")
      },
      generalized_problem: normalizeText(candidate.generalized_problem || ""),
      generalized_fix: normalizeText(candidate.generalized_fix || ""),
      prevention_rule: normalizeText(candidate.prevention_rule || ""),
      prompt_warning: normalizeText(candidate.prompt_warning || ""),
      applies_to_tracks: sharedScope,
      applies_to_domains: [],
      approved_by: promotedBy,
      approved_at: now,
      status: "active",
      cloud_ready: false,
      training_eligible: false,
      owner_approved_for_cloud: Boolean(candidate.owner_approved_for_cloud && isTruthyFlag(flags.owner_approved_for_cloud || flags["owner-approved-for-cloud"] || flags.cloud_approve || flags["cloud-approve"]))
    };
    const sharedKnowledge = readSharedKnowledgeState();
    writeSharedKnowledgeState(
      sharedKnowledge.shared_patterns,
      upsertSharedKnowledgeFastPath(sharedKnowledge.shared_fast_paths, sharedFastPath)
    );
    next.shared_fast_paths = upsertSharedFastPath(next.shared_fast_paths, {
      fast_path_id: sharedFastPath.shared_fast_path_id,
      title: candidate.title,
      problem_type: sharedFastPath.generalized_problem,
      steps: sharedFastPath.generalized_fix ? [sharedFastPath.generalized_fix] : [],
      validation_commands: [],
      applies_to_tracks: sharedFastPath.applies_to_tracks,
      status: "active",
      created_at: now,
      last_seen_at: now,
      shared_at: now,
      shared_by: promotedBy,
      promotion_id: candidate.candidate_id,
      shared_scope: sharedScope
    });
  }
  next.promotions = upsertPromotion(next.promotions, {
    promotion_id: nextPromotionId(next.promotions),
    item_type: candidate.item_type,
    source_id: candidate.candidate_id,
    title: candidate.title,
    status: "promoted",
    promoted_at: now,
    promoted_by: promotedBy,
    shared_scope: sharedScope,
    notes: normalizeText(flags.notes || flags.note || ""),
    cloud_ready_metadata: buildPromotionCloudMetadata(candidate, candidate.item_type, sharedScope)
  });
  return next;
}

function buildPromotionCloudMetadata(item, itemType, sharedScope) {
  return {
    item_type: itemType,
    item_id: item.candidate_id || item.shared_pattern_id || item.shared_fast_path_id || item.pattern_id || item.fast_path_id,
    title: item.title,
    cloud_ready: Boolean(item.cloud_ready),
    consent_required: true,
    anonymized: true,
    sensitive_items_removed: Number(item.sensitive_items_removed || 0),
    dataset_tags: uniqueList(item.dataset_tags || []),
    training_eligible: Boolean(item.training_eligible),
    owner_approved_for_cloud: Boolean(item.owner_approved_for_cloud),
    shared_scope: sharedScope,
    export_format: "json",
    sync_mode: "local_first"
  };
}

function buildPromotionCandidatesFromExportCollections(patterns, fastPaths, source) {
  const candidates = [];
  for (const pattern of patterns) {
    candidates.push({
      candidate_id: nextLearningCandidateId(candidates),
      source_export_id: source.export_id || `${source.app_slug || "export"}-${source.track}`,
      app_slug: source.app_slug,
      title: pattern.title,
      classification: classifyExportPattern(pattern),
      generalized_problem: pattern.generalized_problem,
      generalized_fix: pattern.generalized_fix,
      prevention_rule: pattern.prevention_rule,
      prompt_warning: pattern.prompt_warning,
      applies_to_tracks: pattern.applies_to_tracks,
      cloud_ready: false,
      training_eligible: false,
      owner_approved_for_cloud: false,
      approved: false,
      rejected: false,
      item_type: "pattern"
    });
  }
  for (const fastPath of fastPaths) {
    candidates.push({
      candidate_id: nextLearningCandidateId(candidates),
      source_export_id: source.export_id || `${source.app_slug || "export"}-${source.track}`,
      app_slug: source.app_slug,
      title: fastPath.title,
      classification: classifyExportFastPath(fastPath),
      generalized_problem: fastPath.generalized_problem,
      generalized_fix: fastPath.generalized_fix,
      prevention_rule: fastPath.prevention_rule,
      prompt_warning: fastPath.prompt_warning,
      applies_to_tracks: fastPath.applies_to_tracks,
      cloud_ready: false,
      training_eligible: false,
      owner_approved_for_cloud: false,
      approved: false,
      rejected: false,
      item_type: "fast-path"
    });
  }
  return candidates;
}

function sanitizePatternForExport(pattern, track) {
  const sensitiveHits = countSensitiveItems([pattern.title, pattern.problem, pattern.root_cause, pattern.fix, pattern.prevention_rule, pattern.prompt_warning]);
  return {
    source_id: pattern.pattern_id,
    title: pattern.title,
    category: pattern.category,
    generalized_problem: normalizeText(pattern.problem),
    generalized_fix: normalizeText(pattern.fix),
    prevention_rule: normalizeText(pattern.prevention_rule),
    prompt_warning: normalizeText(pattern.prompt_warning),
    applies_to_tracks: resolveAppliesToTracks(pattern.applies_to_tracks || track),
    cloud_ready: false,
    consent_required: true,
    owner_approved_for_cloud: false,
    anonymized: true,
    sensitive_items_removed: sensitiveHits,
    dataset_tags: [pattern.category, track].filter(Boolean),
    training_eligible: false
  };
}

function sanitizeFastPathForExport(fastPath, track) {
  const sensitiveHits = countSensitiveItems([fastPath.title, fastPath.problem_type, ...(fastPath.steps || []), ...(fastPath.validation_commands || [])]);
  return {
    source_id: fastPath.fast_path_id,
    title: fastPath.title,
    generalized_problem: normalizeText(fastPath.problem_type),
    generalized_fix: (fastPath.steps || []).join(" -> "),
    prevention_rule: normalizeText(fastPath.validation_commands && fastPath.validation_commands.length ? `Validate with ${fastPath.validation_commands.join(", ")}` : ""),
    prompt_warning: normalizeText(fastPath.title ? `Watch for ${fastPath.title}.` : ""),
    applies_to_tracks: resolveAppliesToTracks(fastPath.applies_to_tracks || track),
    cloud_ready: false,
    consent_required: true,
    owner_approved_for_cloud: false,
    anonymized: true,
    sensitive_items_removed: sensitiveHits,
    dataset_tags: [track].filter(Boolean),
    training_eligible: false
  };
}

function toSharedPatternFromExport(item, source) {
  return normalizeSharedPattern({
    shared_pattern_id: normalizeText(item.shared_pattern_id || `shared-ai-pattern-${item.source_id || "export"}`),
    pattern_id: normalizeText(item.source_id || ""),
    title: item.title,
    category: item.category || "other",
    problem: item.generalized_problem,
    fix: item.generalized_fix,
    prevention_rule: item.prevention_rule,
    prompt_warning: item.prompt_warning,
    applies_to_tracks: item.applies_to_tracks,
    shared_at: new Date().toISOString(),
    shared_by: "cache",
    source: source,
    cloud_ready: Boolean(item.cloud_ready),
    training_eligible: Boolean(item.training_eligible),
    owner_approved_for_cloud: Boolean(item.owner_approved_for_cloud)
  });
}

function toSharedFastPathFromExport(item, source) {
  return normalizeSharedFastPath({
    shared_fast_path_id: normalizeText(item.shared_fast_path_id || `shared-ai-fast-path-${item.source_id || "export"}`),
    fast_path_id: normalizeText(item.source_id || ""),
    title: item.title,
    problem_type: item.generalized_problem,
    steps: item.generalized_fix ? [item.generalized_fix] : [],
    validation_commands: item.prevention_rule ? [item.prevention_rule] : [],
    applies_to_tracks: item.applies_to_tracks,
    shared_at: new Date().toISOString(),
    shared_by: "cache",
    source: source,
    cloud_ready: Boolean(item.cloud_ready),
    training_eligible: Boolean(item.training_eligible),
    owner_approved_for_cloud: Boolean(item.owner_approved_for_cloud)
  });
}

function classifyExportPattern(pattern) {
  const text = normalizeText([pattern.title, pattern.generalized_problem, pattern.generalized_fix, pattern.prevention_rule].join(" "));
  if (isSensitiveText(text)) return "not_cloud_safe";
  if (normalizeText(pattern.source_id).includes("/") || normalizeText(pattern.source_id).includes("\\")) return "app_specific";
  if ((pattern.applies_to_tracks || []).length > 1) return "reusable";
  if (pattern.generalized_problem.length < 8) return "needs_review";
  return "reusable";
}

function classifyExportFastPath(fastPath) {
  const text = normalizeText([fastPath.title, fastPath.generalized_problem, fastPath.generalized_fix, fastPath.prevention_rule].join(" "));
  if (isSensitiveText(text)) return "not_cloud_safe";
  if (normalizeText(fastPath.source_id).includes("/") || normalizeText(fastPath.source_id).includes("\\")) return "app_specific";
  if ((fastPath.applies_to_tracks || []).length > 1) return "reusable";
  return "needs_review";
}

function classifyLearningCandidate(candidate, flags = {}) {
  const current = normalizeLearningCandidate(candidate);
  if (!current) return null;
  const text = normalizeText([current.title, current.generalized_problem, current.generalized_fix, current.prevention_rule, current.prompt_warning].join(" "));
  let classification = current.classification && LEARNING_CLASSIFICATIONS.has(current.classification)
    ? current.classification
    : isSensitiveText(text)
      ? "sensitive"
      : current.applies_to_tracks.length > 1
        ? "reusable"
        : current.source_export_id && /export/i.test(current.source_export_id)
          ? "needs_review"
          : "app_specific";
  if (classification === "reusable" && (current.cloud_ready || current.training_eligible) && !current.owner_approved_for_cloud) {
    classification = "cloud_candidate";
  }
  return {
    ...current,
    classification,
    cloud_ready: Boolean(current.cloud_ready && classification !== "sensitive" && classification !== "not_cloud_safe"),
    training_eligible: Boolean(current.training_eligible && classification === "reusable"),
    owner_approved_for_cloud: Boolean(current.owner_approved_for_cloud),
    reviewer: normalizeText(flags.reviewer || "")
  };
}

function normalizeLearningCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  const candidateId = normalizeText(candidate.candidate_id);
  const title = normalizeText(candidate.title);
  if (!candidateId || !title) return null;
  const classification = normalizeText(candidate.classification || "needs_review");
  return {
    candidate_id: candidateId,
    source_export_id: normalizeText(candidate.source_export_id || ""),
    item_type: normalizeText(candidate.item_type || "pattern"),
    title,
    classification: LEARNING_CLASSIFICATIONS.has(classification) ? classification : "needs_review",
    generalized_problem: normalizeText(candidate.generalized_problem || ""),
    generalized_fix: normalizeText(candidate.generalized_fix || ""),
    prevention_rule: normalizeText(candidate.prevention_rule || ""),
    prompt_warning: normalizeText(candidate.prompt_warning || ""),
    applies_to_tracks: resolveAppliesToTracks(candidate.applies_to_tracks || TRACKS),
    cloud_ready: Boolean(candidate.cloud_ready),
    training_eligible: Boolean(candidate.training_eligible),
    owner_approved_for_cloud: Boolean(candidate.owner_approved_for_cloud),
    approved: Boolean(candidate.approved),
    approved_at: normalizeText(candidate.approved_at || ""),
    approved_by: normalizeText(candidate.approved_by || ""),
    rejected: Boolean(candidate.rejected),
    rejected_at: normalizeText(candidate.rejected_at || ""),
    rejection_reason: normalizeText(candidate.rejection_reason || ""),
    app_slug: normalizeText(candidate.app_slug || ""),
    source: candidate.source && typeof candidate.source === "object" ? { ...candidate.source } : undefined
  };
}

function normalizeSharedPatternList(patterns) {
  return Array.isArray(patterns) ? patterns.map(normalizeSharedPattern).filter(Boolean) : [];
}

function normalizeSharedFastPathList(fastPaths) {
  return Array.isArray(fastPaths) ? fastPaths.map(normalizeSharedFastPath).filter(Boolean) : [];
}

function nextLearningCandidateId(candidates) {
  const max = (candidates || []).reduce((highest, candidate) => {
    const match = String(candidate && candidate.candidate_id ? candidate.candidate_id : "").match(/^learning-candidate-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `learning-candidate-${String(max + 1).padStart(3, "0")}`;
}

function nextSharedPatternId(patterns) {
  const max = (patterns || []).reduce((highest, pattern) => {
    const match = String(pattern && pattern.shared_pattern_id ? pattern.shared_pattern_id : "").match(/^shared-ai-pattern-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `shared-ai-pattern-${String(max + 1).padStart(3, "0")}`;
}

function nextSharedFastPathId(fastPaths) {
  const max = (fastPaths || []).reduce((highest, fastPath) => {
    const match = String(fastPath && fastPath.shared_fast_path_id ? fastPath.shared_fast_path_id : "").match(/^shared-ai-fast-path-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `shared-ai-fast-path-${String(max + 1).padStart(3, "0")}`;
}

function upsertSharedKnowledgePattern(patterns, nextPattern) {
  const list = (patterns || []).filter((pattern) => normalizeText(pattern.shared_pattern_id) !== normalizeText(nextPattern.shared_pattern_id));
  list.push(nextPattern);
  return list.sort((a, b) => a.shared_pattern_id.localeCompare(b.shared_pattern_id));
}

function upsertSharedKnowledgeFastPath(fastPaths, nextFastPath) {
  const list = (fastPaths || []).filter((fastPath) => normalizeText(fastPath.shared_fast_path_id) !== normalizeText(nextFastPath.shared_fast_path_id));
  list.push(nextFastPath);
  return list.sort((a, b) => a.shared_fast_path_id.localeCompare(b.shared_fast_path_id));
}

function resolvePromotionActor(flags = {}) {
  return normalizeText(flags.approved_by || flags.promoted_by || flags.owner || flags.by || resolveDefaultTrack());
}

function isTruthyFlag(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  const normalized = normalizeKey(value);
  return ["1", "true", "yes", "y", "on", "confirm", "approved"].includes(normalized);
}

function countSensitiveItems(values) {
  return (values || []).filter((value) => isSensitiveText(value)).length;
}

function isSensitiveText(value) {
  const text = normalizeText(value);
  if (!text) return false;
  return /token|secret|password|passwd|credential|private key|api key|client secret|bearer/i.test(text);
}

function normalizePattern(pattern) {
  if (!pattern || typeof pattern !== "object") return null;
  const title = normalizeText(pattern.title);
  const problem = normalizeText(pattern.problem);
  if (!title || !problem) return null;
  return {
    pattern_id: normalizeText(pattern.pattern_id) || nextPatternId([]),
    title,
    category: normalizePatternCategory(pattern.category || "other"),
    problem,
    root_cause: normalizeText(pattern.root_cause || ""),
    fix: normalizeText(pattern.fix || ""),
    prevention_rule: normalizeText(pattern.prevention_rule || ""),
    applies_to_tracks: resolveAppliesToTracks(pattern.applies_to_tracks && pattern.applies_to_tracks.length ? pattern.applies_to_tracks : TRACKS),
    related_files: normalizeStringList(pattern.related_files),
    related_commands: normalizeStringList(pattern.related_commands),
    seen_count: Math.max(1, Number(pattern.seen_count || 1)),
    last_seen_at: normalizeText(pattern.last_seen_at || new Date().toISOString()),
    status: normalizePatternStatus(pattern.status || "active"),
    prompt_warning: normalizeText(pattern.prompt_warning || "")
  };
}

function normalizeFastPath(fastPath) {
  if (!fastPath || typeof fastPath !== "object") return null;
  const title = normalizeText(fastPath.title);
  const problemType = normalizeText(fastPath.problem_type);
  if (!title || !problemType) return null;
  return {
    fast_path_id: normalizeText(fastPath.fast_path_id) || nextFastPathId([]),
    title,
    problem_type: problemType,
    steps: normalizeStringList(fastPath.steps),
    validation_commands: normalizeStringList(fastPath.validation_commands),
    applies_to_tracks: resolveAppliesToTracks(fastPath.applies_to_tracks && fastPath.applies_to_tracks.length ? fastPath.applies_to_tracks : TRACKS),
    status: normalizeFastPathStatus(fastPath.status || "active"),
    created_at: normalizeText(fastPath.created_at || new Date().toISOString()),
    last_seen_at: normalizeText(fastPath.last_seen_at || new Date().toISOString())
  };
}

function normalizeSharedPattern(pattern) {
  if (!pattern || typeof pattern !== "object") return null;
  const title = normalizeText(pattern.title);
  const problem = normalizeText(pattern.generalized_problem || pattern.problem);
  if (!title || !problem) return null;
  const sharedPatternId = normalizeText(pattern.shared_pattern_id || pattern.pattern_id || nextSharedPatternId([]));
  return {
    shared_pattern_id: sharedPatternId,
    pattern_id: normalizeText(pattern.pattern_id || sharedPatternId),
    title,
    category: normalizePatternCategory(pattern.category || "other"),
    source: pattern.source && typeof pattern.source === "object" ? { ...pattern.source } : { type: "learning_export", candidate_id: normalizeText(pattern.source?.candidate_id || pattern.promotion_id || ""), app_slug: normalizeText(pattern.source?.app_slug || "") },
    generalized_problem: problem,
    generalized_fix: normalizeText(pattern.generalized_fix || pattern.fix || ""),
    prevention_rule: normalizeText(pattern.prevention_rule || ""),
    prompt_warning: normalizeText(pattern.prompt_warning || ""),
    applies_to_tracks: resolveAppliesToTracks(pattern.applies_to_tracks || pattern.shared_scope || TRACKS),
    applies_to_domains: Array.isArray(pattern.applies_to_domains) ? uniqueList(pattern.applies_to_domains) : [],
    approved_by: normalizeText(pattern.approved_by || pattern.shared_by || pattern.promoted_by || ""),
    approved_at: normalizeText(pattern.approved_at || pattern.shared_at || pattern.promoted_at || new Date().toISOString()),
    shared_by: normalizeText(pattern.shared_by || pattern.approved_by || pattern.promoted_by || ""),
    shared_at: normalizeText(pattern.shared_at || pattern.approved_at || pattern.promoted_at || new Date().toISOString()),
    status: normalizeText(pattern.status || "active"),
    cloud_ready: Boolean(pattern.cloud_ready),
    training_eligible: Boolean(pattern.training_eligible),
    owner_approved_for_cloud: Boolean(pattern.owner_approved_for_cloud)
  };
}

function normalizeSharedFastPath(fastPath) {
  if (!fastPath || typeof fastPath !== "object") return null;
  const title = normalizeText(fastPath.title);
  const problemType = normalizeText(fastPath.generalized_problem || fastPath.problem_type);
  if (!title || !problemType) return null;
  const sharedFastPathId = normalizeText(fastPath.shared_fast_path_id || fastPath.fast_path_id || nextSharedFastPathId([]));
  return {
    shared_fast_path_id: sharedFastPathId,
    fast_path_id: normalizeText(fastPath.fast_path_id || sharedFastPathId),
    title,
    problem_type: problemType,
    steps: normalizeStringList(fastPath.steps || fastPath.generalized_fix),
    validation_commands: normalizeStringList(fastPath.validation_commands || fastPath.prevention_rule),
    applies_to_tracks: resolveAppliesToTracks(fastPath.applies_to_tracks || fastPath.shared_scope || TRACKS),
    applies_to_domains: Array.isArray(fastPath.applies_to_domains) ? uniqueList(fastPath.applies_to_domains) : [],
    approved_by: normalizeText(fastPath.approved_by || fastPath.shared_by || fastPath.promoted_by || ""),
    approved_at: normalizeText(fastPath.approved_at || fastPath.shared_at || fastPath.promoted_at || new Date().toISOString()),
    shared_by: normalizeText(fastPath.shared_by || fastPath.approved_by || fastPath.promoted_by || ""),
    shared_at: normalizeText(fastPath.shared_at || fastPath.approved_at || fastPath.promoted_at || new Date().toISOString()),
    status: normalizeText(fastPath.status || "active"),
    cloud_ready: Boolean(fastPath.cloud_ready),
    training_eligible: Boolean(fastPath.training_eligible),
    owner_approved_for_cloud: Boolean(fastPath.owner_approved_for_cloud)
  };
}

function normalizePromotion(promotion) {
  if (!promotion || typeof promotion !== "object") return null;
  const itemType = normalizeText(promotion.item_type || promotion.type || "").toLowerCase();
  if (!["pattern", "fast-path", "fast_path"].includes(itemType)) return null;
  const sourceId = normalizeText(promotion.source_id || promotion.pattern_id || promotion.fast_path_id);
  if (!sourceId) return null;
  return {
    promotion_id: normalizeText(promotion.promotion_id || `ai-promotion-${String(Date.now()).slice(-6)}`),
    item_type: itemType === "fast_path" ? "fast-path" : itemType,
    source_id: sourceId,
    title: normalizeText(promotion.title || ""),
    status: normalizeText(promotion.status || "promoted"),
    promoted_at: normalizeText(promotion.promoted_at || promotion.shared_at || new Date().toISOString()),
    promoted_by: normalizeText(promotion.promoted_by || promotion.shared_by || ""),
    shared_scope: resolveAppliesToTracks(promotion.shared_scope || promotion.applies_to_tracks || TRACKS),
    notes: normalizeText(promotion.notes || ""),
    cloud_ready_metadata: promotion.cloud_ready_metadata && typeof promotion.cloud_ready_metadata === "object" ? { ...promotion.cloud_ready_metadata } : null
  };
}

function normalizePatternCategory(category) {
  const value = normalizeKey(category).replace(/-/g, "_");
  if (!PATTERN_CATEGORIES.has(value)) throw new Error("Invalid category. Use test_failure, scope_violation, runtime_state, generated_artifact, track_confusion, source_control, security, or other.");
  return value;
}

function normalizePatternStatus(status) {
  const value = normalizeKey(status);
  if (!PATTERN_STATUSES.has(value)) throw new Error("Invalid pattern status. Use active, resolved, or ignored.");
  return value;
}

function normalizeFastPathStatus(status) {
  const value = normalizeKey(status);
  if (!FAST_PATH_STATUSES.has(value)) throw new Error("Invalid fast path status. Use active or ignored.");
  return value;
}

function normalizeAction(action) {
  return normalizeKey(action).replace(/_/g, "-");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function resolveLearningFilePath(value) {
  const filePath = normalizeText(value);
  if (!filePath) return "";
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function normalizeStringList(value) {
  return uniqueList(parseCsv(value));
}

function normalizeRequiredText(value, message) {
  const text = normalizeText(value);
  if (!text) throw new Error(message);
  return text;
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
}

function resolveTrack(track) {
  const normalized = normalizeText(track);
  if (!normalized) return resolveDefaultTrack();
  if (normalizeKey(normalized) === "all" || normalizeKey(normalized) === "shared") return "all";
  const value = TRACK_ALIASES[normalizeKey(normalized)];
  if (!value) throw new Error("Invalid track. Use owner, vibe, or plugin.");
  return value;
}

function resolveDefaultTrack() {
  if (!fileExists(".kabeeri/session_track.json")) return "owner";
  try {
    const sessionTrack = readJsonFile(".kabeeri/session_track.json");
    if (sessionTrack && sessionTrack.active_track) {
      const normalized = TRACK_ALIASES[normalizeKey(sessionTrack.active_track)];
      if (normalized) return normalized;
    }
  } catch (error) {
    return "owner";
  }
  return "owner";
}

function resolveAppliesToTracks(value) {
  if (!value) return [resolveDefaultTrack()];
  if (Array.isArray(value)) {
    return uniqueList(value.flatMap((item) => resolveAppliesToTracks(item)));
  }
  const normalized = normalizeKey(value);
  if (!normalized) return [resolveDefaultTrack()];
  if (normalized === "all" || normalized === "shared") return [...TRACKS];
  const track = TRACK_ALIASES[normalized];
  if (!track) throw new Error("Invalid applies-to track. Use owner, vibe, plugin, shared, or all.");
  return [track];
}

function isTrackApplicable(tracks, track) {
  if (track === "all") return true;
  const normalizedTracks = resolveAppliesToTracks(tracks || []);
  return normalizedTracks.includes(track);
}

function samePattern(pattern, title, problem) {
  return normalizeKey(pattern.title) === normalizeKey(title) && normalizeKey(pattern.problem) === normalizeKey(problem);
}

function nextPatternId(patterns) {
  const max = (patterns || []).reduce((highest, pattern) => {
    const match = String(pattern && pattern.pattern_id ? pattern.pattern_id : "").match(/^ai-pattern-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `ai-pattern-${String(max + 1).padStart(3, "0")}`;
}

function nextFastPathId(fastPaths) {
  const max = (fastPaths || []).reduce((highest, fastPath) => {
    const match = String(fastPath && fastPath.fast_path_id ? fastPath.fast_path_id : "").match(/^ai-fast-path-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `ai-fast-path-${String(max + 1).padStart(3, "0")}`;
}

function upsertPattern(patterns, nextPattern) {
  const list = (patterns || []).filter((pattern) => !samePattern(pattern, nextPattern.title, nextPattern.problem));
  list.push(nextPattern);
  return list.sort((a, b) => a.pattern_id.localeCompare(b.pattern_id));
}

function upsertFastPath(fastPaths, nextFastPath) {
  const list = (fastPaths || []).filter((fastPath) => normalizeKey(fastPath.title) !== normalizeKey(nextFastPath.title) || normalizeKey(fastPath.problem_type) !== normalizeKey(nextFastPath.problem_type));
  list.push(nextFastPath);
  return list.sort((a, b) => a.fast_path_id.localeCompare(b.fast_path_id));
}

function mergeAiLearningState(current, imported, flags = {}) {
  const merged = normalizeState(current);
  const importedState = normalizeState(imported);
  merged.patterns = mergePatternCollections(merged.patterns, importedState.patterns, flags);
  merged.fast_paths = mergeFastPathCollections(merged.fast_paths, importedState.fast_paths, flags);
  merged.shared_patterns = mergeSharedPatternCollections(merged.shared_patterns, importedState.shared_patterns, flags);
  merged.shared_fast_paths = mergeSharedFastPathCollections(merged.shared_fast_paths, importedState.shared_fast_paths, flags);
  merged.promotions = mergePromotionCollections(merged.promotions, importedState.promotions);
  return merged;
}

function mergePatternCollections(current, incoming, flags = {}) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((pattern) => `${normalizeKey(pattern.title)}::${normalizeKey(pattern.problem)}`));
  for (const pattern of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizePattern(pattern);
    if (!normalized) continue;
    const key = `${normalizeKey(normalized.title)}::${normalizeKey(normalized.problem)}`;
    if (seen.has(key) && !Boolean(flags.force)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list.sort((a, b) => a.pattern_id.localeCompare(b.pattern_id));
}

function mergeFastPathCollections(current, incoming, flags = {}) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((fastPath) => `${normalizeKey(fastPath.title)}::${normalizeKey(fastPath.problem_type)}`));
  for (const fastPath of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizeFastPath(fastPath);
    if (!normalized) continue;
    const key = `${normalizeKey(normalized.title)}::${normalizeKey(normalized.problem_type)}`;
    if (seen.has(key) && !Boolean(flags.force)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list.sort((a, b) => a.fast_path_id.localeCompare(b.fast_path_id));
}

function mergeSharedPatternCollections(current, incoming, flags = {}) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((pattern) => `${normalizeKey(pattern.title)}::${normalizeKey(pattern.problem)}`));
  for (const pattern of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizeSharedPattern(pattern);
    if (!normalized) continue;
    const key = `${normalizeKey(normalized.title)}::${normalizeKey(normalized.problem)}`;
    if (seen.has(key) && !Boolean(flags.force)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list.sort((a, b) => a.pattern_id.localeCompare(b.pattern_id));
}

function mergeSharedFastPathCollections(current, incoming, flags = {}) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((fastPath) => `${normalizeKey(fastPath.title)}::${normalizeKey(fastPath.problem_type)}`));
  for (const fastPath of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizeSharedFastPath(fastPath);
    if (!normalized) continue;
    const key = `${normalizeKey(normalized.title)}::${normalizeKey(normalized.problem_type)}`;
    if (seen.has(key) && !Boolean(flags.force)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list.sort((a, b) => a.fast_path_id.localeCompare(b.fast_path_id));
}

function mergePromotionCollections(current, incoming) {
  const list = Array.isArray(current) ? [...current] : [];
  const seen = new Set(list.map((promotion) => `${normalizeKey(promotion.item_type)}::${normalizeKey(promotion.source_id)}`));
  for (const promotion of Array.isArray(incoming) ? incoming : []) {
    const normalized = normalizePromotion(promotion);
    if (!normalized) continue;
    const key = `${normalizeKey(normalized.item_type)}::${normalizeKey(normalized.source_id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list.sort((a, b) => a.promotion_id.localeCompare(b.promotion_id));
}

function upsertPromotion(promotions, nextPromotion) {
  const list = (promotions || []).filter((promotion) => `${normalizeKey(promotion.item_type)}::${normalizeKey(promotion.source_id)}` !== `${normalizeKey(nextPromotion.item_type)}::${normalizeKey(nextPromotion.source_id)}`);
  list.push(nextPromotion);
  return list.sort((a, b) => a.promotion_id.localeCompare(b.promotion_id));
}

function upsertSharedPattern(patterns, nextPattern) {
  const list = (patterns || []).filter((pattern) => !samePattern(pattern, nextPattern.title, nextPattern.problem));
  list.push(normalizeSharedPattern(nextPattern));
  return list.filter(Boolean).sort((a, b) => a.pattern_id.localeCompare(b.pattern_id));
}

function upsertSharedFastPath(fastPaths, nextFastPath) {
  const list = (fastPaths || []).filter((fastPath) => normalizeKey(fastPath.title) !== normalizeKey(nextFastPath.title) || normalizeKey(fastPath.problem_type) !== normalizeKey(nextFastPath.problem_type));
  list.push(normalizeSharedFastPath(nextFastPath));
  return list.filter(Boolean).sort((a, b) => a.fast_path_id.localeCompare(b.fast_path_id));
}

function nextPromotionId(promotions) {
  const max = (promotions || []).reduce((highest, promotion) => {
    const match = String(promotion && promotion.promotion_id ? promotion.promotion_id : "").match(/^ai-promotion-(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return `ai-promotion-${String(max + 1).padStart(3, "0")}`;
}

function summarizeAiLearningState(state) {
  return {
    version: state.version,
    patterns_total: Array.isArray(state.patterns) ? state.patterns.length : 0,
    active_patterns: Array.isArray(state.patterns) ? state.patterns.filter((pattern) => normalizePatternStatus(pattern.status) === "active").length : 0,
    fast_paths_total: Array.isArray(state.fast_paths) ? state.fast_paths.length : 0,
    active_fast_paths: Array.isArray(state.fast_paths) ? state.fast_paths.filter((fastPath) => normalizeFastPathStatus(fastPath.status) === "active").length : 0,
    shared_patterns_total: Array.isArray(state.shared_patterns) ? state.shared_patterns.length : 0,
    shared_fast_paths_total: Array.isArray(state.shared_fast_paths) ? state.shared_fast_paths.length : 0,
    promotions_total: Array.isArray(state.promotions) ? state.promotions.length : 0
  };
}

module.exports = {
  aiLearning,
  readAiLearningState,
  writeAiLearningState,
  summarizeAiLearningState,
  buildAiLearningPromptContext,
  buildAiLearningPromptSection,
  exportLearningState,
  importLearningState,
  promoteLearningEntry,
  reviewLearningCandidates,
  rejectLearningCandidate,
  handleLearningCache,
  buildSharedLearningPayload,
  buildCloudReadyMetadata
};
