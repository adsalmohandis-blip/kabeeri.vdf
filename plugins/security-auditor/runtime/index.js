const fs = require("fs");
const path = require("path");
const {
  scanSecurityWorkspace,
  normalizeTrack,
  normalizeScope,
  resolveScopeFromFlags,
  resolveTrackFromWorkspace
} = require("./scanner");

const STATE_FILE = ".kabeeri/security/security_auditor_scans.json";

function ensureSecurityAuditorState(root = process.cwd()) {
  const statePath = path.join(root, STATE_FILE);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  if (!fs.existsSync(statePath)) {
    fs.writeFileSync(statePath, `${JSON.stringify({ version: "1", scans: [] }, null, 2)}\n`, "utf8");
  }
  return statePath;
}

function readSecurityAuditorState(root = process.cwd()) {
  const statePath = path.join(root, STATE_FILE);
  if (!fs.existsSync(statePath)) {
    return { version: "1", scans: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return normalizeState(parsed);
  } catch {
    return { version: "1", scans: [] };
  }
}

function writeSecurityAuditorState(root = process.cwd(), state = { version: "1", scans: [] }) {
  const statePath = ensureSecurityAuditorState(root);
  const normalized = normalizeState(state);
  fs.writeFileSync(statePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

function buildSecurityAuditorStatus(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const state = readSecurityAuditorState(root);
  const latestScan = state.scans.length ? state.scans[state.scans.length - 1] : null;
  return {
    report_type: "security_auditor_status",
    generated_at: new Date().toISOString(),
    state_file: STATE_FILE,
    plugin_enabled: Boolean(options.plugin_enabled),
    plugin_available: Boolean(options.plugin_available),
    track: normalizeTrack(options.track || resolveTrackFromWorkspace(root)),
    scope: normalizeScope(options.scope || "workspace"),
    scans_total: state.scans.length,
    latest_scan: latestScan
      ? {
          scan_id: latestScan.scan_id,
          status: latestScan.status,
          track: latestScan.track,
          scope: latestScan.scope,
          generated_at: latestScan.generated_at,
          summary: latestScan.summary
        }
      : null,
    external_tools_required: false,
    next_action: latestScan ? latestScan.next_action : "Run `kvdf security-auditor scan` to capture the first audit.",
    engine: "built-in"
  };
}

function runSecurityAuditorScan(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const track = normalizeTrack(options.track || resolveTrackFromWorkspace(root));
  const scope = normalizeScope(options.scope || resolveScopeFromFlags(options));
  const state = readSecurityAuditorState(root);
  const scan = scanSecurityWorkspace({
    ...options,
    root,
    track,
    scope
  });
  state.version = "1";
  state.scans = Array.isArray(state.scans) ? state.scans : [];
  state.scans.push(scan);
  writeSecurityAuditorState(root, state);
  return scan;
}

function buildSecurityAuditorReport(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const state = readSecurityAuditorState(root);
  const latestScan = selectLatestScan(state, options);
  if (!latestScan) {
    return {
      report_type: "security_auditor_report",
      generated_at: new Date().toISOString(),
      state_file: STATE_FILE,
      plugin_enabled: Boolean(options.plugin_enabled),
      plugin_available: Boolean(options.plugin_available),
      track: normalizeTrack(options.track || resolveTrackFromWorkspace(root)),
      scope: normalizeScope(options.scope || "workspace"),
      status: "pass",
      findings: [],
      summary: { blocked: 0, warnings: 0, files_scanned: 0 },
      next_action: "Run `kvdf security-auditor scan` to capture the first audit.",
      engine: "built-in",
      latest_scan: null
    };
  }
  return {
    report_type: "security_auditor_report",
    generated_at: new Date().toISOString(),
    state_file: STATE_FILE,
    plugin_enabled: Boolean(options.plugin_enabled),
    plugin_available: Boolean(options.plugin_available),
    track: latestScan.track,
    scope: latestScan.scope,
    status: latestScan.status,
    findings: latestScan.findings || [],
    summary: latestScan.summary || { blocked: 0, warnings: 0, files_scanned: 0 },
    next_action: latestScan.next_action || "Re-run the security auditor scan after fixes.",
    engine: latestScan.engine || "built-in",
    latest_scan: latestScan
  };
}

function selectLatestScan(state, options = {}) {
  const scans = Array.isArray(state.scans) ? state.scans : [];
  if (!scans.length) return null;
  const track = options.track ? normalizeTrack(options.track) : null;
  const scope = options.scope ? normalizeScope(options.scope) : null;
  const taskId = options.task ? String(options.task).trim() : null;
  const evolutionRef = options.evolution ? String(options.evolution).trim() : null;
  const filtered = scans.filter((scan) => {
    if (track && scan.track !== track) return false;
    if (scope && scan.scope !== scope) return false;
    if (taskId && scan.task_id !== taskId) return false;
    if (evolutionRef && scan.evolution !== evolutionRef) return false;
    return true;
  });
  return filtered.length ? filtered[filtered.length - 1] : scans[scans.length - 1];
}

function normalizeState(state) {
  if (!state || typeof state !== "object") return { version: "1", scans: [] };
  return {
    version: String(state.version || "1"),
    scans: Array.isArray(state.scans) ? state.scans : []
  };
}

module.exports = {
  STATE_FILE,
  ensureSecurityAuditorState,
  readSecurityAuditorState,
  writeSecurityAuditorState,
  buildSecurityAuditorStatus,
  runSecurityAuditorScan,
  buildSecurityAuditorReport
};
