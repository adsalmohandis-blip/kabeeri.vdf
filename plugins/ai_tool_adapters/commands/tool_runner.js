const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const RUNS_FILE = ".kabeeri/ai_tool_runs.jsonl";
const MAX_CAPTURE_CHARS = 64 * 1024;
const REDACTION_KEYS = [
  "API_KEY",
  "TOKEN",
  "SECRET",
  "PASSWORD",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY"
];

function repoRoot() {
  return path.resolve(process.cwd());
}

function getRunsPath() {
  return path.join(repoRoot(), RUNS_FILE);
}

function ensureWorkspace() {
  fs.mkdirSync(path.dirname(getRunsPath()), { recursive: true });
}

function readRunEvents() {
  ensureWorkspace();
  const file = getRunsPath();
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function appendRunEvent(event) {
  ensureWorkspace();
  fs.appendFileSync(getRunsPath(), `${JSON.stringify(event)}\n`, "utf8");
  return event;
}

function nextRunId(existingEvents = readRunEvents()) {
  let max = 0;
  for (const event of existingEvents || []) {
    const match = String(event && (event.run_id || event.event_id) || "").match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `ai-tool-run-${String(max + 1).padStart(3, "0")}`;
}

function redactSensitiveText(value) {
  const input = String(value || "");
  if (!input) return { text: "", redactions_applied: [] };
  let text = input;
  const redactionsApplied = new Set();
  for (const key of REDACTION_KEYS) {
    const pattern = new RegExp(`(${escapeRegExp(key)}\\s*=\\s*)([^\\s"']+)`, "gi");
    if (pattern.test(text)) {
      redactionsApplied.add(key);
      text = text.replace(pattern, `$1[REDACTED]`);
    }
  }
  return { text, redactions_applied: Array.from(redactionsApplied) };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function executeSpawn(command, args = [], options = {}) {
  const startedAt = new Date();
  const timeoutSeconds = Number(options.timeout_seconds || 0);
  const timeoutMs = timeoutSeconds > 0 ? timeoutSeconds * 1000 : 0;
  const captureStdout = options.capture_stdout !== false;
  const captureStderr = options.capture_stderr !== false;
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const maxCaptureChars = Number(options.max_capture_chars || MAX_CAPTURE_CHARS);
  const startedIso = startedAt.toISOString();
  const spawnOptions = {
    cwd,
    env,
    shell: false,
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"]
  };

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let stdoutTruncated = false;
    let stderrTruncated = false;
    let timedOut = false;
    let settled = false;
    let timeoutId = null;
    let killId = null;
    let child;

    try {
      child = spawn(command, args, spawnOptions);
    } catch (error) {
      const endedAt = new Date();
      return resolve({
        started_at: startedIso,
        ended_at: endedAt.toISOString(),
        duration_ms: endedAt.getTime() - startedAt.getTime(),
        exit_code: null,
        signal: null,
        stdout_excerpt: "",
        stderr_excerpt: "",
        redactions_applied: [],
        error: error.message,
        timed_out: false
      });
    }

    if (captureStdout && child.stdout) {
      child.stdout.on("data", (chunk) => {
        if (stdout.length >= maxCaptureChars) {
          stdoutTruncated = true;
          return;
        }
        stdout += chunk.toString("utf8");
        if (stdout.length > maxCaptureChars) {
          stdout = stdout.slice(0, maxCaptureChars);
          stdoutTruncated = true;
        }
      });
    }

    if (captureStderr && child.stderr) {
      child.stderr.on("data", (chunk) => {
        if (stderr.length >= maxCaptureChars) {
          stderrTruncated = true;
          return;
        }
        stderr += chunk.toString("utf8");
        if (stderr.length > maxCaptureChars) {
          stderr = stderr.slice(0, maxCaptureChars);
          stderrTruncated = true;
        }
      });
    }

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        if (child && !child.killed) {
          child.kill("SIGTERM");
          killId = setTimeout(() => {
            if (child && !child.killed) child.kill("SIGKILL");
          }, 1000);
        }
      }, timeoutMs);
      if (typeof timeoutId.unref === "function") timeoutId.unref();
    }

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (killId) clearTimeout(killId);
      if (error && (error.code === "EPERM" || String(error.message || "").includes("EPERM"))) {
        resolve(runSpawnSyncFallback(command, args, options, startedAt, error.message));
        return;
      }
      const endedAt = new Date();
      const stdoutExcerpt = formatExcerpt(stdout, stdoutTruncated);
      const stderrExcerpt = formatExcerpt(stderr, stderrTruncated);
      const redactedStdout = redactSensitiveText(stdoutExcerpt);
      const redactedStderr = redactSensitiveText(stderrExcerpt);
      resolve({
        started_at: startedIso,
        ended_at: endedAt.toISOString(),
        duration_ms: endedAt.getTime() - startedAt.getTime(),
        exit_code: null,
        signal: null,
        stdout_excerpt: redactedStdout.text,
        stderr_excerpt: redactedStderr.text,
        redactions_applied: Array.from(new Set([...redactedStdout.redactions_applied, ...redactedStderr.redactions_applied])),
        error: error.message,
        timed_out: false
      });
    });

    child.on("close", (exitCode, signal) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (killId) clearTimeout(killId);
      const endedAt = new Date();
      const stdoutExcerpt = formatExcerpt(stdout, stdoutTruncated);
      const stderrExcerpt = formatExcerpt(stderr, stderrTruncated);
      const redactedStdout = redactSensitiveText(stdoutExcerpt);
      const redactedStderr = redactSensitiveText(stderrExcerpt);
      resolve({
        started_at: startedIso,
        ended_at: endedAt.toISOString(),
        duration_ms: endedAt.getTime() - startedAt.getTime(),
        exit_code: typeof exitCode === "number" ? exitCode : null,
        signal: signal || null,
        stdout_excerpt: redactedStdout.text,
        stderr_excerpt: redactedStderr.text,
        redactions_applied: Array.from(new Set([...redactedStdout.redactions_applied, ...redactedStderr.redactions_applied])),
        error: null,
        timed_out: timedOut
      });
    });
  });
}

function runSpawnSyncFallback(command, args = [], options = {}, startedAt = new Date(), spawnErrorMessage = null) {
  const timeoutSeconds = Number(options.timeout_seconds || 0);
  const timeoutMs = timeoutSeconds > 0 ? timeoutSeconds * 1000 : 0;
  const captureStdout = options.capture_stdout !== false;
  const captureStderr = options.capture_stderr !== false;
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const maxBuffer = Number(options.max_capture_chars || MAX_CAPTURE_CHARS);
  const result = spawnSync(command, args, {
    cwd,
    env,
    shell: false,
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"],
    encoding: "utf8",
    timeout: timeoutMs > 0 ? timeoutMs : undefined,
    maxBuffer
  });
  const endedAt = new Date();
  const stdoutExcerpt = formatExcerpt(captureStdout ? String(result.stdout || "") : "", false);
  const stderrExcerpt = formatExcerpt(captureStderr ? String(result.stderr || "") : "", false);
  const redactedStdout = redactSensitiveText(stdoutExcerpt);
  const redactedStderr = redactSensitiveText(stderrExcerpt);
  const timedOut = Boolean(result.signal === "SIGTERM" || result.error && String(result.error.message || "").includes("timed out"));
  return {
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_ms: endedAt.getTime() - startedAt.getTime(),
    exit_code: typeof result.status === "number" ? result.status : null,
    signal: result.signal || null,
    stdout_excerpt: redactedStdout.text,
    stderr_excerpt: redactedStderr.text,
    redactions_applied: Array.from(new Set([...redactedStdout.redactions_applied, ...redactedStderr.redactions_applied])),
    error: spawnErrorMessage || (result.error ? result.error.message : null),
    timed_out: timedOut
  };
}

function formatExcerpt(text, truncated) {
  if (!text) return "";
  return truncated ? `${text.slice(0, MAX_CAPTURE_CHARS)}\n[TRUNCATED]` : text;
}

module.exports = {
  RUNS_FILE,
  MAX_CAPTURE_CHARS,
  ensureWorkspace,
  readRunEvents,
  appendRunEvent,
  nextRunId,
  redactSensitiveText,
  executeSpawn
};
