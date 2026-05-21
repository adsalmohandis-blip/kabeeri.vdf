const fs = require("fs");
const path = require("path");

const { fileExists, repoRoot } = require("../fs_utils");
const { readJsonFile } = require("../workspace");
const { getPluginRuntimeStatus } = require("./plugin_loader");

const DEFAULT_SECURITY_GATE_POLICY = {
  security_gate_policy_version: "1",
  default_required: false,
  strict_blocking: false,
  required_scopes: [],
  required_tracks: [],
  required_before: [],
  blocked_statuses: ["blocked"],
  warning_statuses: ["warning"],
  missing_plugin_behavior: "warn",
  notes: ["Default policy is non-blocking unless explicitly configured."]
};

function buildSecurityGateState(options = {}) {
  const root = path.resolve(options.root || repoRoot());
  const policyInfo = readSecurityGatePolicy(root);
  const plugin = readSecurityAuditorPluginState(root);
  const scope = normalizeSecurityGateScope(options.scope, options);
  const track = normalizeSecurityGateTrack(options.track || inferSecurityGateTrack(root, options, scope));
  const target = resolveSecurityGateTarget(root, scope, options);
  const required = determineSecurityGateRequired(policyInfo.policy, options, { scope, track, target });
  const strictBlocking = Boolean(options.strict || policyInfo.policy.strict_blocking);
  const scans = readSecurityGateScans(root);
  const lastScan = selectLatestSecurityGateScan(scans, { scope, track, target });
  const findingsSummary = summarizeSecurityGateFindings(lastScan);
  const status = resolveSecurityGateStatus({
    required,
    strictBlocking,
    plugin,
    lastScan,
    policy: policyInfo.policy
  });
  const next_action = resolveSecurityGateNextAction({
    status,
    required,
    strictBlocking,
    plugin,
    lastScan,
    policy: policyInfo.policy
  });

  const gate = {
    report_type: "kvdf_security_gate_state",
    security_gate_version: "1",
    status,
    plugin,
    track,
    scope,
    required,
    strict_blocking: strictBlocking,
    policy_source: policyInfo.source,
    policy_path: policyInfo.policy_path,
    last_scan: lastScan,
    findings_summary: findingsSummary,
    target,
    next_action
  };

  if (options.persist) {
    ensureSecurityGateStateDir(root);
    const statePath = path.join(root, ".kabeeri", "security", "security_gate_state.json");
    fs.writeFileSync(statePath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");
  }

  return gate;
}

function readSecurityGatePolicy(root = repoRoot()) {
  const policyPath = path.join(root, ".kabeeri", "policies", "security_gate_policy.json");
  if (!fs.existsSync(policyPath)) {
    return {
      policy: { ...DEFAULT_SECURITY_GATE_POLICY },
      source: "default",
      policy_path: ".kabeeri/policies/security_gate_policy.json"
    };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(policyPath, "utf8"));
    return {
      policy: normalizeSecurityGatePolicy(parsed),
      source: "runtime",
      policy_path: ".kabeeri/policies/security_gate_policy.json"
    };
  } catch {
    return {
      policy: { ...DEFAULT_SECURITY_GATE_POLICY },
      source: "default",
      policy_path: ".kabeeri/policies/security_gate_policy.json"
    };
  }
}

function normalizeSecurityGatePolicy(policy = {}) {
  return {
    security_gate_policy_version: String(policy.security_gate_policy_version || "1"),
    default_required: Boolean(policy.default_required),
    strict_blocking: Boolean(policy.strict_blocking),
    required_scopes: normalizeStringArray(policy.required_scopes),
    required_tracks: normalizeStringArray(policy.required_tracks),
    required_before: normalizeStringArray(policy.required_before),
    blocked_statuses: normalizeStringArray(policy.blocked_statuses, DEFAULT_SECURITY_GATE_POLICY.blocked_statuses),
    warning_statuses: normalizeStringArray(policy.warning_statuses, DEFAULT_SECURITY_GATE_POLICY.warning_statuses),
    missing_plugin_behavior: normalizeMissingPluginBehavior(policy.missing_plugin_behavior),
    notes: normalizeStringArray(policy.notes)
  };
}

function normalizeMissingPluginBehavior(value) {
  const normalized = String(value || DEFAULT_SECURITY_GATE_POLICY.missing_plugin_behavior).trim().toLowerCase();
  if (["warn", "block", "ignore"].includes(normalized)) return normalized;
  return DEFAULT_SECURITY_GATE_POLICY.missing_plugin_behavior;
}

function readSecurityAuditorPluginState(root = repoRoot()) {
  const plugin = getPluginRuntimeStatus("security-auditor");
  const pluginPath = path.join(root, "plugins", "security_auditor", "plugin.json");
  if (!plugin) {
    const installed = fs.existsSync(pluginPath);
    const commandEntrypoint = installed ? safeReadPluginManifestField(pluginPath, "command_entrypoint") : null;
    const runtimeEntrypoint = installed ? safeReadPluginManifestField(pluginPath, "runtime_entrypoint") : null;
    const entrypoint = runtimeEntrypoint || commandEntrypoint || null;
    const available = Boolean(installed && entrypoint && fs.existsSync(path.join(root, entrypoint)));
    return {
      plugin_id: "security-auditor",
      installed,
      enabled: false,
      available,
      active: false
    };
  }

  return {
    plugin_id: "security-auditor",
    installed: Boolean(plugin.installed !== false),
    enabled: Boolean(plugin.enabled),
    available: Boolean(plugin.available),
    active: Boolean(plugin.active),
    command_entrypoint: plugin.command_entrypoint || null,
    runtime_entrypoint: plugin.runtime_entrypoint || null
  };
}

function safeReadPluginManifestField(manifestPath, field) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return manifest && typeof manifest === "object" ? manifest[field] || null : null;
  } catch {
    return null;
  }
}

function resolveSecurityGateTarget(root, scope, options = {}) {
  if (scope === "task" || options.task || options.task_id) {
    const taskId = String(options.task || options.task_id || "").trim();
    const task = taskId ? findExactTaskById(root, taskId) : null;
    if (!task) {
      if (taskId) throw new Error(`Task not found: ${taskId}`);
      return { task_id: null, evolution_id: null, handoff_id: null };
    }
    return {
      task_id: task.id || task.task_id || task.taskId || null,
      evolution_id: task.evolution_change_id || task.evolution_id || task.evolution_milestone_id || null,
      handoff_id: null,
      task_status: task.status || null
    };
  }

  if (scope === "evolution" || options.evolution) {
    const evolutionRef = String(options.evolution || "").trim();
    const evolution = evolutionRef === "current"
      ? findCurrentEvolution(root)
      : findExactEvolution(root, evolutionRef);
    if (evolutionRef && !evolution) {
      if (options.persist === false) {
        return {
          task_id: null,
          evolution_id: null,
          handoff_id: null,
          evolution_status: null
        };
      }
      throw new Error(evolutionRef === "current" ? "Current evolution not found." : `Evolution not found: ${evolutionRef}`);
    }
    return {
      task_id: null,
      evolution_id: evolution ? evolution.change_id || evolution.evolution_id || evolution.id || null : null,
      handoff_id: null,
      evolution_status: evolution ? evolution.status || null : null
    };
  }

  if (scope === "handoff" || options.handoff) {
    return {
      task_id: null,
      evolution_id: null,
      handoff_id: options.handoff_id || options.packageId || null
    };
  }

  return {
    task_id: null,
    evolution_id: null,
    handoff_id: null
  };
}

function determineSecurityGateRequired(policy, options = {}, context = {}) {
  if (options.required || options["required"] || options["security-required"] || options.security_required) return true;
  if (policy.default_required) return true;
  if (context.scope && policy.required_scopes.includes(context.scope)) return true;
  if (context.track && policy.required_tracks.includes(context.track)) return true;
  if (context.moment && policy.required_before.includes(context.moment)) return true;

  const inferredMoment = inferSecurityGateMoment({
    ...options,
    task_status: context.target && context.target.task_status ? context.target.task_status : options.task_status,
    evolution_status: context.target && context.target.evolution_status ? context.target.evolution_status : options.evolution_status
  }, context);
  if (inferredMoment && policy.required_before.includes(inferredMoment)) return true;
  return false;
}

function inferSecurityGateMoment(options = {}, context = {}) {
  const scope = context.scope || normalizeSecurityGateScope(options.scope, options);
  if (options.before || options.moment) return normalizeStringValue(options.before || options.moment);
  if (scope === "handoff") return "handoff";
  if (scope === "task") {
    const status = normalizeStringValue(options.task_status || options.status || options.taskStateStatus || "");
    if (["owner_verified", "verified", "done", "closed", "completed"].includes(status)) return "task_complete";
  }
  if (scope === "evolution") {
    const status = normalizeStringValue(options.evolution_status || options.status || "");
    if (["done", "closed", "verified"].includes(status)) return "evolution_closeout";
  }
  return null;
}

function normalizeSecurityGateScope(scope, options = {}) {
  const raw = String(scope || (options.handoff ? "handoff" : "")).trim().toLowerCase();
  if (raw === "task") return "task";
  if (raw === "evolution") return "evolution";
  if (raw === "handoff") return "handoff";
  if (raw === "release") return "workspace";
  if (raw === "manual") return "manual";
  return "workspace";
}

function normalizeSecurityGateTrack(value, fallback = "owner") {
  const normalized = String(value || fallback || "owner").trim().toLowerCase();
  if (["vibe", "viber", "app", "developer_app", "vibe_app_developer", "app_developer"].includes(normalized)) return "vibe";
  if (["plugin", "security-auditor"].includes(normalized)) return "plugin";
  return "owner";
}

function readSecurityGateScans(root = repoRoot()) {
  const scans = [];
  const corePath = path.join(root, ".kabeeri", "security", "security_scans.json");
  const auditorPath = path.join(root, ".kabeeri", "security", "security_auditor_scans.json");

  if (fs.existsSync(corePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(corePath, "utf8"));
      for (const scan of Array.isArray(parsed.scans) ? parsed.scans : []) {
        scans.push(normalizeSecurityScan(scan, "core"));
      }
    } catch {
      // Ignore malformed local state and keep the command safe.
    }
  }

  if (fs.existsSync(auditorPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(auditorPath, "utf8"));
      for (const scan of Array.isArray(parsed.scans) ? parsed.scans : []) {
        scans.push(normalizeSecurityScan(scan, "plugin"));
      }
    } catch {
      // Ignore malformed local state and keep the command safe.
    }
  }

  return scans;
}

function normalizeSecurityScan(scan, source) {
  if (!scan || typeof scan !== "object") return null;
  const summary = scan.summary && typeof scan.summary === "object"
    ? {
        blocked: Number(scan.summary.blocked || 0),
        warnings: Number(scan.summary.warnings || 0),
        files_scanned: Number(scan.summary.files_scanned || 0)
      }
    : {
        blocked: Array.isArray(scan.blockers) ? scan.blockers.length : Number(scan.status === "blocked" ? 1 : 0),
        warnings: Number(scan.status === "warning" ? Math.max(1, scan.findings_total || (Array.isArray(scan.findings) ? scan.findings.length : 0)) : 0),
        files_scanned: Number(scan.files_scanned || 0)
      };

  const findingsTotal = Number(
    scan.findings_total ||
    (Array.isArray(scan.findings) ? scan.findings.length : 0) ||
    summary.blocked + summary.warnings
  );

  return {
    scan_id: scan.scan_id || scan.id || `${source}-security-scan-${Date.now()}`,
    source,
    status: scan.status || "unknown",
    generated_at: scan.generated_at || null,
    track: normalizeSecurityGateTrack(scan.track || "owner"),
    scope: normalizeSecurityGateScope(scan.scope || "workspace"),
    task_id: scan.task_id || null,
    evolution: scan.evolution || scan.evolution_id || null,
    summary,
    files_scanned: Number(scan.files_scanned || summary.files_scanned || 0),
    findings_total: findingsTotal,
    next_action: scan.next_action || null,
    engine: scan.engine || (source === "plugin" ? "security-auditor" : "core"),
    findings: Array.isArray(scan.findings) ? scan.findings : []
  };
}

function selectLatestSecurityGateScan(scans = [], filters = {}) {
  const filtered = (Array.isArray(scans) ? scans : []).filter((scan) => {
    if (!scan) return false;
    if (filters.track && scan.track !== filters.track) return false;
    if (filters.scope && scan.scope !== filters.scope) return false;
    if (filters.task_id && scan.task_id !== filters.task_id) return false;
    if (filters.evolution_id && scan.evolution !== filters.evolution_id) return false;
    return true;
  });
  const pool = filtered.length ? filtered : scans;
  return pool.slice().sort((left, right) => {
    const leftTime = Date.parse(left.generated_at || "") || 0;
    const rightTime = Date.parse(right.generated_at || "") || 0;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return String(left.scan_id || "").localeCompare(String(right.scan_id || ""));
  }).pop() || null;
}

function summarizeSecurityGateFindings(scan) {
  if (!scan) return { blocked: 0, warnings: 0, files_scanned: 0 };
  return {
    blocked: Number(scan.summary && scan.summary.blocked !== undefined ? scan.summary.blocked : 0),
    warnings: Number(scan.summary && scan.summary.warnings !== undefined ? scan.summary.warnings : 0),
    files_scanned: Number(scan.summary && scan.summary.files_scanned !== undefined ? scan.summary.files_scanned : 0)
  };
}

function resolveSecurityGateStatus({ required, strictBlocking, plugin, lastScan, policy }) {
  const pluginMissing = !plugin.installed || !plugin.available || !plugin.enabled;
  const scanStatus = lastScan ? normalizeStringValue(lastScan.status) : "";
  const blockedScan = lastScan && policy.blocked_statuses.includes(scanStatus);
  const warningScan = lastScan && policy.warning_statuses.includes(scanStatus);
  const passScan = lastScan && scanStatus === "pass";

  if (pluginMissing && !lastScan) {
    if (required && policy.missing_plugin_behavior === "block") return "blocked";
    if (required && policy.missing_plugin_behavior === "warn") return "warning";
    return "not_required";
  }

  if (!lastScan) {
    if (required) return pluginMissing ? "warning" : "unavailable";
    return pluginMissing ? "not_required" : "unavailable";
  }

  if (blockedScan) {
    if (!required) return "warning";
    return strictBlocking ? "blocked" : "warning";
  }

  if (warningScan) return "warning";
  if (passScan) return required ? "pass" : "pass";

  if (pluginMissing) {
    if (required && policy.missing_plugin_behavior === "block") return "blocked";
    if (required) return "warning";
    return "not_required";
  }

  return required ? "unavailable" : "not_required";
}

function resolveSecurityGateNextAction({ status, required, strictBlocking, plugin, lastScan, policy }) {
  if (status === "pass") {
    return required
      ? "Security gate passed. Continue with the current workflow."
      : "Security evidence is available, but the gate is optional for this scope.";
  }

  if (status === "blocked") {
    if (!plugin.installed || !plugin.available || !plugin.enabled) {
      return policy.missing_plugin_behavior === "block"
        ? "Install or enable security-auditor, then rerun the required security gate."
        : "Install or enable security-auditor, then rerun the security gate.";
    }
    return lastScan && lastScan.scan_id
      ? `Address blocker findings in ${lastScan.scan_id} and rerun the scan.`
      : "Run security-auditor scan to capture blocker findings and rerun the gate.";
  }

  if (status === "warning") {
    if (!required) {
      return plugin.installed && plugin.available && plugin.enabled
        ? "Review the warning findings, then refresh the optional security gate when convenient."
        : "Security gate is optional here; install or enable security-auditor if you want scan output.";
    }
    return strictBlocking
      ? "Warnings are present under strict security policy. Fix the findings before closing the gate."
      : "Review the warning findings and rerun the gate before closeout.";
  }

  if (status === "unavailable") {
    return plugin.installed && plugin.available && plugin.enabled
      ? "Run security-auditor scan to populate the security gate."
      : "Install or enable security-auditor to make the security gate available.";
  }

  return "Security gate is optional for this scope.";
}

function findExactTaskById(root, taskId) {
  const tasksPath = path.join(root, ".kabeeri", "tasks.json");
  if (!taskId || !fs.existsSync(tasksPath)) return null;
  const state = JSON.parse(fs.readFileSync(tasksPath, "utf8"));
  const tasks = collectTaskRecords(state);
  const matches = tasks.filter((task) => {
    if (!task || typeof task !== "object") return false;
    return ["id", "task_id", "taskId"].some((field) => String(task[field] || "").trim() === String(taskId).trim());
  });
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Ambiguous task id: ${taskId}`);
  return matches[0];
}

function collectTaskRecords(state) {
  if (Array.isArray(state)) return state.filter(Boolean);
  if (!state || typeof state !== "object") return [];
  const records = [];
  for (const key of ["tasks", "active_tasks", "items"]) {
    if (Array.isArray(state[key])) records.push(...state[key].filter(Boolean));
  }
  return records;
}

function findExactEvolution(root, evolutionId) {
  const evolutionPath = path.join(root, ".kabeeri", "evolution.json");
  if (!evolutionId || !fs.existsSync(evolutionPath)) return null;
  const state = JSON.parse(fs.readFileSync(evolutionPath, "utf8"));
  const candidates = collectEvolutionRecords(state);
  const matches = candidates.filter((item) => ["change_id", "evolution_id", "id"].some((field) => String(item[field] || "").trim() === String(evolutionId).trim()));
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Ambiguous evolution id: ${evolutionId}`);
  return matches[0];
}

function findCurrentEvolution(root) {
  const evolutionPath = path.join(root, ".kabeeri", "evolution.json");
  if (!fs.existsSync(evolutionPath)) return null;
  const state = JSON.parse(fs.readFileSync(evolutionPath, "utf8"));
  const candidates = collectEvolutionRecords(state);
  const currentChangeId = state.current_change_id || state.current_evolution_id || null;
  if (currentChangeId) {
    const current = candidates.find((item) => ["change_id", "evolution_id", "id"].some((field) => String(item[field] || "").trim() === String(currentChangeId).trim()));
    if (current) return current;
  }

  const precedence = ["current", "active", "planned"];
  for (const status of precedence) {
    const matching = candidates.filter((item) => String(item.status || "").trim().toLowerCase() === status);
    if (matching.length === 1) return matching[0];
    if (matching.length > 1) {
      throw new Error(`Ambiguous current evolution: ${matching.map((item) => item.change_id || item.evolution_id || item.id).join(", ")}`);
    }
  }
  return null;
}

function collectEvolutionRecords(state) {
  if (Array.isArray(state)) return state.filter(Boolean);
  if (!state || typeof state !== "object") return [];
  const records = [];
  for (const key of ["changes", "active_changes", "evolutions", "items"]) {
    if (Array.isArray(state[key])) records.push(...state[key].filter(Boolean));
  }
  return records;
}

function normalizeStringArray(values, fallback = []) {
  const items = Array.isArray(values) ? values : fallback;
  return items.map((item) => normalizeStringValue(item)).filter(Boolean);
}

function normalizeStringValue(value) {
  return String(value || "").trim().toLowerCase();
}

function ensureSecurityGateStateDir(root = repoRoot()) {
  fs.mkdirSync(path.join(root, ".kabeeri", "security"), { recursive: true });
}

module.exports = {
  DEFAULT_SECURITY_GATE_POLICY,
  buildSecurityGateState,
  readSecurityGatePolicy,
  normalizeSecurityGatePolicy,
  readSecurityAuditorPluginState,
  readSecurityGateScans,
  selectLatestSecurityGateScan,
  summarizeSecurityGateFindings,
  resolveSecurityGateStatus,
  resolveSecurityGateNextAction,
  normalizeSecurityGateScope,
  normalizeSecurityGateTrack,
  findExactTaskById,
  findCurrentEvolution
};
