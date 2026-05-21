const fs = require("fs");
const path = require("path");
const { getSecurityAuditRules } = require("./rules");

const DEFAULT_EXCLUDES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "tmp",
  "temp",
  ".kabeeri/security",
  ".kabeeri/site",
  ".kabeeri/plugin-links",
  "plugins/security_auditor"
];

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".jsonl",
  ".md",
  ".txt",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".scss",
  ".sh",
  ".py",
  ".rb",
  ".php",
  ".go",
  ".java",
  ".kt",
  ".sql",
  ".env"
]);

function scanSecurityWorkspace(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const track = normalizeTrack(options.track || resolveTrackFromWorkspace(root));
  const scope = normalizeScope(options.scope || resolveScopeFromFlags(options));
  const rules = getSecurityAuditRules();
  const targetPatterns = collectTargetPatterns(root, options);
  const excludes = [...DEFAULT_EXCLUDES, ...normalizePatternList(options.exclude)];
  const files = collectFiles(root, { targetPatterns, excludes });
  const findings = [];

  for (const file of files) {
    const content = safeReadText(file.fullPath, options.max_bytes || 400000);
    if (content === null) continue;
    evaluateFile(file.relative, content, rules, findings);
  }

  const summary = summarizeFindings(findings, files.length);
  const status = summary.blocked > 0 ? "blocked" : summary.warnings > 0 ? "warning" : "pass";

  return {
    report_type: "security_auditor_scan",
    scan_id: `security-audit-${Date.now()}`,
    generated_at: new Date().toISOString(),
    track,
    scope,
    task_id: options.task ? String(options.task).trim() : null,
    evolution: options.evolution ? String(options.evolution).trim() : null,
    target_hints: targetPatterns,
    engine: "built-in",
    status,
    findings,
    summary,
    next_action: buildNextAction(status, summary, scope, track)
  };
}

function collectTargetPatterns(root, options = {}) {
  const patterns = [];
  const include = normalizePatternList(options.include);
  const file = options.file ? normalizePatternList(options.file) : [];
  const files = normalizePatternList(options.files);
  patterns.push(...include, ...file, ...files);

  if (options.task) {
    patterns.push(...gatherTaskHints(root, options.task));
  }
  if (options.evolution) {
    patterns.push(...gatherEvolutionHints(root, options.evolution));
  }

  return uniquePatterns(patterns);
}

function gatherTaskHints(root, taskRef) {
  const state = readJsonIfExists(path.join(root, ".kabeeri", "tasks.json"), { tasks: [] });
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const resolved = resolveTaskRef(tasks, taskRef);
  if (!resolved) return [];
  const hints = [
    ...normalizePatternList(resolved.allowed_files),
    ...normalizePatternList(resolved.scope && resolved.scope.allowed_files),
    ...normalizePatternList(resolved.memory && resolved.memory.source_of_truth && resolved.memory.source_of_truth.allowed_files),
    ...normalizePatternList(resolved.source_of_truth && resolved.source_of_truth.allowed_files)
  ];
  return hints;
}

function gatherEvolutionHints(root, evolutionRef) {
  const state = readJsonIfExists(path.join(root, ".kabeeri", "evolution.json"), { changes: [], current_change_id: null });
  const changes = Array.isArray(state.changes) ? state.changes : [];
  const resolved = resolveEvolutionRef(changes, state.current_change_id, evolutionRef);
  if (!resolved) return [];
  const hints = [
    ...normalizePatternList(resolved.allowed_files),
    ...normalizePatternList(resolved.scope && resolved.scope.allowed_files)
  ];
  if (Array.isArray(resolved.task_ids) && resolved.task_ids.length) {
    const taskState = readJsonIfExists(path.join(root, ".kabeeri", "tasks.json"), { tasks: [] });
    const tasks = Array.isArray(taskState.tasks) ? taskState.tasks : [];
    for (const taskId of resolved.task_ids) {
      const task = tasks.find((item) => item.id === taskId);
      if (task) {
        hints.push(...normalizePatternList(task.allowed_files));
        hints.push(...normalizePatternList(task.scope && task.scope.allowed_files));
        hints.push(...normalizePatternList(task.memory && task.memory.source_of_truth && task.memory.source_of_truth.allowed_files));
      }
    }
  }
  return hints;
}

function resolveTaskRef(tasks, taskRef) {
  const normalized = normalizeText(taskRef);
  if (!normalized) return null;
  if (normalized === "current" || normalized === "latest" || normalized === "active") {
    return tasks[tasks.length - 1] || null;
  }
  return tasks.find((item) => normalizeText(item.id) === normalized || normalizeText(item.task_id) === normalized) || null;
}

function resolveEvolutionRef(changes, currentChangeId, evolutionRef) {
  const normalized = normalizeText(evolutionRef);
  if (!normalized) {
    if (currentChangeId) {
      return changes.find((item) => normalizeText(item.change_id) === normalizeText(currentChangeId) || normalizeText(item.id) === normalizeText(currentChangeId)) || changes[changes.length - 1] || null;
    }
    return changes[changes.length - 1] || null;
  }
  if (normalized === "current" || normalized === "latest" || normalized === "active") {
    return changes.find((item) => normalizeText(item.change_id) === normalizeText(currentChangeId) || normalizeText(item.id) === normalizeText(currentChangeId)) || changes[changes.length - 1] || null;
  }
  return changes.find((item) => normalizeText(item.change_id) === normalized || normalizeText(item.id) === normalized) || null;
}

function collectFiles(root, { targetPatterns = [], excludes = [] } = {}) {
  const patterns = uniquePatterns(normalizePatternList(targetPatterns));
  const excludePatterns = uniquePatterns(normalizePatternList(excludes));
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = normalizePath(path.relative(root, fullPath));
      if (!relative) continue;
      if (isExcluded(relative, excludePatterns)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!isLikelyTextFile(relative)) continue;
      if (patterns.length > 0 && !patterns.some((pattern) => pathMatchesPattern(relative, pattern))) continue;
      files.push({ fullPath, relative });
    }
  }

  walk(root);
  return files.sort((left, right) => left.relative.localeCompare(right.relative));
}

function evaluateFile(relative, content, rules, findings) {
  const normalizedRelative = normalizePath(relative);
  const lines = String(content).split(/\r?\n/);

  if (isEnvLeakFile(normalizedRelative)) {
    pushFinding(findings, {
      rule: {
        rule_id: "env_file",
        category: "secrets",
        severity: "high",
        message: "A real .env-style file is present in the workspace.",
        next_action: "Remove the file from source control and keep placeholder values in .env.example only."
      },
      file: normalizedRelative,
      line: 1,
      evidence: "[file path only]"
    });
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const rule of rules) {
      if (rule.path_only) continue;
      if (rule.pattern.test(line)) {
        pushFinding(findings, {
          rule,
          file: normalizedRelative,
          line: lineIndex + 1,
          evidence: redactEvidence(line)
        });
      }
    }
  }

  for (const rule of rules) {
    if (!rule.path_only) continue;
    if (rule.pattern.test(normalizedRelative)) {
      pushFinding(findings, {
        rule,
        file: normalizedRelative,
        line: 1,
        evidence: "[file path only]"
      });
    }
  }
}

function pushFinding(findings, { rule, file, line, evidence }) {
  findings.push({
    finding_id: `security-finding-${String(findings.length + 1).padStart(3, "0")}`,
    rule_id: rule.rule_id,
    category: rule.category,
    severity: rule.severity,
    file,
    line,
    message: rule.message,
    evidence,
    next_action: rule.next_action
  });
}

function summarizeFindings(findings, filesScanned) {
  const blocked = findings.filter((item) => ["critical", "high"].includes(item.severity)).length;
  const warnings = findings.filter((item) => ["medium", "low"].includes(item.severity)).length;
  return {
    blocked,
    warnings,
    files_scanned: filesScanned
  };
}

function buildNextAction(status, summary, scope, track) {
  if (status === "blocked") {
    return `Remove ${summary.blocked} blocker finding(s) for the ${track} ${scope} scope, then re-run kvdf security-auditor scan before handoff or release.`;
  }
  if (status === "warning") {
    return `Review ${summary.warnings} warning finding(s) for the ${track} ${scope} scope, then re-run kvdf security-auditor scan.`;
  }
  return `No blocking security patterns found for the ${track} ${scope} scope. Keep using the core security gate before release or publish.`;
}

function resolveTrackFromWorkspace(root) {
  const sessionTrack = readJsonIfExists(path.join(root, ".kabeeri", "session_track.json"), null);
  if (sessionTrack && sessionTrack.active) {
    if (sessionTrack.active_track === "framework_owner") return "owner";
    if (sessionTrack.active_track === "vibe_app_developer") return "vibe";
  }
  return "owner";
}

function resolveScopeFromFlags(options = {}) {
  if (options.task) return "task";
  if (options.evolution) return "evolution";
  if (normalizePatternList(options.include).length || normalizePatternList(options.file).length || normalizePatternList(options.files).length) {
    return "manual";
  }
  return "workspace";
}

function normalizeTrack(value) {
  const normalized = normalizeText(value);
  if (["owner", "framework_owner", "framework-owner"].includes(normalized)) return "owner";
  if (["vibe", "app", "developer", "app_developer", "vibe_app_developer", "app-developer"].includes(normalized)) return "vibe";
  if (["plugin", "plugins"].includes(normalized)) return "plugin";
  return "owner";
}

function normalizeScope(value) {
  const normalized = normalizeText(value);
  if (["task", "evolution", "workspace", "manual"].includes(normalized)) return normalized;
  return "workspace";
}

function normalizePatternList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return uniquePatterns(value.flatMap((item) => normalizePatternList(item)));
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniquePatterns(values) {
  return Array.from(new Set((values || []).map((item) => normalizePath(item)).filter(Boolean)));
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function isExcluded(relative, excludePatterns) {
  const normalized = normalizePath(relative);
  return excludePatterns.some((pattern) => pathMatchesPattern(normalized, pattern));
}

function pathMatchesPattern(relative, pattern) {
  const normalizedRelative = normalizePath(relative);
  const normalizedPattern = normalizePath(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern.includes("*")) {
    const regex = new RegExp(`^${escapeRegex(normalizedPattern).replace(/\\\*\\\*/g, ".*").replace(/\\\*/g, "[^/]*")}$`, "i");
    return regex.test(normalizedRelative);
  }
  return normalizedRelative === normalizedPattern || normalizedRelative.startsWith(`${normalizedPattern}/`);
}

function isLikelyTextFile(relative) {
  const ext = path.extname(relative).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) return true;
  if (!ext) return true;
  return ext === ".jsonl";
}

function isEnvLeakFile(relative) {
  const fileName = path.basename(relative).toLowerCase();
  return fileName === ".env" || (fileName.startsWith(".env.") && !fileName.endsWith(".example"));
}

function safeReadText(fullPath, maxBytes) {
  try {
    const size = fs.statSync(fullPath).size;
    if (Number.isFinite(maxBytes) && size > maxBytes) return null;
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return null;
  }
}

function readJsonIfExists(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function redactEvidence(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed) return "[redacted]";
  if (trimmed.length <= 16) return "[redacted]";
  return `${trimmed.slice(0, 10)}...[redacted]...${trimmed.slice(-6)}`;
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  scanSecurityWorkspace,
  collectTargetPatterns,
  collectFiles,
  evaluateFile,
  summarizeFindings,
  normalizeTrack,
  normalizeScope,
  resolveScopeFromFlags,
  resolveTrackFromWorkspace
};
