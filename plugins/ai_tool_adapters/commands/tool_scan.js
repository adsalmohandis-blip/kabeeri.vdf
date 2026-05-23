const fs = require("fs");
const path = require("path");

const KNOWN_TOOL_CANDIDATES = [
  {
    command: "codex",
    tool_type: "codex_cli",
    display_name: "OpenAI Codex CLI",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    command: "claude",
    tool_type: "claude_code",
    display_name: "Claude Code",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    command: "cursor",
    tool_type: "cursor_cli",
    display_name: "Cursor CLI",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    command: "code",
    tool_type: "vscode_terminal",
    display_name: "VS Code",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    command: "ollama",
    tool_type: "local_model",
    display_name: "Ollama",
    capabilities: ["local_model", "prompt_execution"]
  },
  {
    command: "git",
    tool_type: "git",
    display_name: "Git",
    capabilities: ["source_control", "repository_inspection"]
  },
  {
    command: "node",
    tool_type: "node_runtime",
    display_name: "Node.js",
    capabilities: ["script_execution", "runtime_assist"]
  },
  {
    command: "npm",
    tool_type: "npm_runtime",
    display_name: "npm",
    capabilities: ["package_management", "script_execution"]
  }
];

function normalizeToolId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEditor(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["vscode", "cursor", "terminal", "unknown"].includes(normalized)) return normalized;
  return "unknown";
}

function titleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCandidateByCommand(command) {
  return KNOWN_TOOL_CANDIDATES.find((item) => item.command === command) || null;
}

function toolTypeForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.tool_type : "custom_tool";
}

function displayNameForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.display_name : titleCase(command);
}

function capabilitiesForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.capabilities.slice() : ["terminal_assist"];
}

function resolveExecutableOnPath(command) {
  const trimmed = String(command || "").trim();
  if (!trimmed) return null;

  const candidates = [];
  const searchPaths = String(process.env.PATH || "")
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean);

  const isWindows = process.platform === "win32";
  const hasExplicitExt = Boolean(path.extname(trimmed));
  const pathext = isWindows
    ? (String(process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";").map((item) => item.trim()).filter(Boolean))
    : [""];
  const extensions = isWindows && !hasExplicitExt
    ? ["", ...pathext.map((ext) => ext.startsWith(".") ? ext : `.${ext}`)]
    : [""];

  if (trimmed.includes(path.sep) || trimmed.includes("/")) {
    candidates.push(path.resolve(trimmed));
    if (isWindows && !hasExplicitExt) {
      for (const ext of extensions.slice(1)) candidates.push(path.resolve(`${trimmed}${ext}`));
    }
  }

  for (const baseDir of searchPaths) {
    for (const extension of extensions) {
      const candidate = path.join(baseDir, `${trimmed}${extension}`);
      candidates.push(candidate);
    }
  }

  for (const candidate of candidates) {
    try {
      const stats = fs.statSync(candidate);
      if (!stats.isFile()) continue;
      if (!isWindows) {
        fs.accessSync(candidate, fs.constants.X_OK);
      }
      return path.resolve(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

function scanKnownTools(now = new Date().toISOString()) {
  return KNOWN_TOOL_CANDIDATES.map((candidate) => {
    const resolved_path = resolveExecutableOnPath(candidate.command);
    return {
      command: candidate.command,
      tool_id: candidate.command,
      tool_type: candidate.tool_type,
      display_name: candidate.display_name,
      resolved_path,
      editor: "unknown",
      status: resolved_path ? "detected" : "missing",
      capabilities: candidate.capabilities.slice(),
      execution_enabled: false,
      detected_at: resolved_path ? now : null,
      registered_at: null,
      last_checked_at: now,
      notes: resolved_path ? null : "Not found on PATH."
    };
  });
}

function buildRegisteredToolFromInput(input = {}, now = new Date().toISOString()) {
  const rawTool = String(input.tool || "").trim();
  const tool_id = normalizeToolId(input.tool_id || rawTool);
  const command = String(input.command || rawTool || tool_id).trim();
  const descriptor = getCandidateByCommand(command);
  const explicitPath = String(input.path || "").trim();
  const resolved_path = explicitPath && explicitPath !== "auto"
    ? path.resolve(explicitPath)
    : resolveExecutableOnPath(descriptor ? descriptor.command : command);
  const status = explicitPath === "auto" && !resolved_path ? "missing" : "registered";
  return {
    tool_id: tool_id || normalizeToolId(command),
    tool_type: input.tool_type || toolTypeForCommand(descriptor ? descriptor.command : command),
    display_name: input.display_name || displayNameForCommand(descriptor ? descriptor.command : command),
    command,
    resolved_path: resolved_path || (explicitPath && explicitPath !== "auto" ? path.resolve(explicitPath) : null),
    editor: normalizeEditor(input.editor),
    status,
    capabilities: Array.isArray(input.capabilities) && input.capabilities.length ? Array.from(new Set(input.capabilities)) : capabilitiesForCommand(descriptor ? descriptor.command : command),
    execution_enabled: false,
    detected_at: resolved_path ? now : null,
    registered_at: now,
    last_checked_at: now,
    notes: input.notes || (status === "missing" ? "Registered before the command was detected on PATH." : null)
  };
}

function normalizeScanHistoryEntry(entry = {}) {
  return {
    scanned_at: entry.scanned_at || new Date().toISOString(),
    candidates: Array.isArray(entry.candidates) ? entry.candidates : [],
    detected_tools: Array.isArray(entry.detected_tools) ? entry.detected_tools : [],
    missing_tools: Array.isArray(entry.missing_tools) ? entry.missing_tools : [],
    notes: entry.notes || null
  };
}

module.exports = {
  KNOWN_TOOL_CANDIDATES,
  normalizeToolId,
  normalizeEditor,
  toolTypeForCommand,
  displayNameForCommand,
  capabilitiesForCommand,
  resolveExecutableOnPath,
  scanKnownTools,
  buildRegisteredToolFromInput,
  normalizeScanHistoryEntry
};
