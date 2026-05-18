const { readJsonFile, writeJsonFile, fileExists } = require("../fs_utils");
const { parseCsv, uniqueList } = require("../services/collections");
const { table } = require("../ui");

const AI_LEARNING_STATE_FILE = ".kabeeri/ai_learning/failure_patterns.json";
const DEFAULT_STATE = {
  version: "1",
  patterns: [],
  fast_paths: []
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
  "other"
]);

const PATTERN_STATUSES = new Set(["active", "resolved", "ignored"]);
const FAST_PATH_STATUSES = new Set(["active", "ignored"]);

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
  const activePatterns = normalized.patterns.filter((pattern) => isTrackApplicable(pattern.applies_to_tracks, track) && normalizePatternStatus(pattern.status) === "active");
  const activeFastPaths = normalized.fast_paths.filter((fastPath) => isTrackApplicable(fastPath.applies_to_tracks, track) && normalizeFastPathStatus(fastPath.status) === "active");

  return {
    report_type: "ai_learning_prompt_context",
    generated_at: new Date().toISOString(),
    state_path: AI_LEARNING_STATE_FILE,
    track,
    active_warning_rules: activePatterns.map((pattern) => ({
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
      status: pattern.status
    })),
    active_fast_paths: activeFastPaths.map((fastPath) => ({
      fast_path_id: fastPath.fast_path_id,
      title: fastPath.title,
      problem_type: fastPath.problem_type,
      steps: fastPath.steps,
      validation_commands: fastPath.validation_commands,
      applies_to_tracks: fastPath.applies_to_tracks,
      status: fastPath.status
    })),
    prompt_warnings: activePatterns.map((pattern) => pattern.prompt_warning).filter(Boolean),
    fast_path_summaries: activeFastPaths.map((fastPath) => ({
      fast_path_id: fastPath.fast_path_id,
      title: fastPath.title,
      problem_type: fastPath.problem_type,
      steps: fastPath.steps,
      validation_commands: fastPath.validation_commands
    })),
    summary: {
      warning_count: activePatterns.length,
      fast_path_count: activeFastPaths.length
    }
  };
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

function readAiLearningState() {
  if (!fileExists(AI_LEARNING_STATE_FILE)) return normalizeState(DEFAULT_STATE);
  return normalizeState(readJsonFile(AI_LEARNING_STATE_FILE));
}

function writeAiLearningState(state) {
  writeJsonFile(AI_LEARNING_STATE_FILE, normalizeState(state));
}

function normalizeState(state) {
  const normalized = state && typeof state === "object" ? { ...state } : {};
  normalized.version = String(normalized.version || "1");
  normalized.patterns = Array.isArray(normalized.patterns) ? normalized.patterns.map(normalizePattern).filter(Boolean) : [];
  normalized.fast_paths = Array.isArray(normalized.fast_paths) ? normalized.fast_paths.map(normalizeFastPath).filter(Boolean) : [];
  return normalized;
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

function summarizeAiLearningState(state) {
  return {
    version: state.version,
    patterns_total: Array.isArray(state.patterns) ? state.patterns.length : 0,
    active_patterns: Array.isArray(state.patterns) ? state.patterns.filter((pattern) => normalizePatternStatus(pattern.status) === "active").length : 0,
    fast_paths_total: Array.isArray(state.fast_paths) ? state.fast_paths.length : 0,
    active_fast_paths: Array.isArray(state.fast_paths) ? state.fast_paths.filter((fastPath) => normalizeFastPathStatus(fastPath.status) === "active").length : 0
  };
}

module.exports = {
  aiLearning,
  readAiLearningState,
  writeAiLearningState,
  summarizeAiLearningState
};
