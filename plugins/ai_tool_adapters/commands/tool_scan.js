const fs = require("fs");
const path = require("path");
const {
  buildAdaptationPackCatalogReport,
  buildPromptProfileCatalogReport,
  getAdaptationPackForCommand,
  summarizeAdaptationPack
} = require("./adapter_packs");

const ADAPTER_PROFILES = [
  {
    platform_name: "codex",
    command: "codex",
    commands: ["codex", "openai-codex"],
    tool_type: "codex_cli",
    display_name: "OpenAI Codex CLI",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "claude",
    command: "claude",
    commands: ["claude"],
    tool_type: "claude_code",
    display_name: "Claude Code",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "cursor",
    command: "cursor",
    commands: ["cursor"],
    tool_type: "cursor_cli",
    display_name: "Cursor",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "continue",
    command: "continue",
    commands: ["continue"],
    tool_type: "continue_dev",
    display_name: "Continue.dev",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "gemini",
    command: "gemini",
    commands: ["gemini"],
    tool_type: "gemini_cli",
    display_name: "Gemini CLI",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "kimi",
    command: "kimi",
    commands: ["kimi"],
    tool_type: "kimi_cli",
    display_name: "Kimi CLI",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "grok",
    command: "grok",
    commands: ["grok"],
    tool_type: "grok_cli",
    display_name: "Grok CLI",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "hooking", "session_audit"]
  },
  {
    platform_name: "openai_agents",
    command: "openai-agents",
    commands: ["openai-agents", "agents"],
    tool_type: "openai_agents_sdk",
    display_name: "OpenAI Agents SDK",
    adapter_family: "agent_sdk",
    adapter_surface: "sdk",
    capabilities: ["agent_orchestration", "tool_call_translation", "session_audit", "workflow_control"]
  },
  {
    platform_name: "mcp",
    command: "mcp",
    commands: ["mcp"],
    tool_type: "mcp_host",
    display_name: "MCP Host",
    adapter_family: "mcp_host",
    adapter_surface: "host",
    capabilities: ["tool_routing", "registry_lookup", "policy_enforcement", "session_audit"]
  },
  {
    platform_name: "aider",
    command: "aider",
    commands: ["aider"],
    tool_type: "aider_cli",
    display_name: "Aider",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    platform_name: "goose",
    command: "goose",
    commands: ["goose"],
    tool_type: "goose_cli",
    display_name: "Goose",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "workflow_orchestration"]
  },
  {
    platform_name: "opencode",
    command: "opencode",
    commands: ["opencode"],
    tool_type: "opencode_dev",
    display_name: "OpenCode",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "workflow_orchestration"]
  },
  {
    platform_name: "openhands",
    command: "openhands",
    commands: ["openhands"],
    tool_type: "openhands_cli",
    display_name: "OpenHands",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "workflow_orchestration"]
  },
  {
    platform_name: "qwen_code",
    command: "qwen-code",
    commands: ["qwen-code", "qwen"],
    tool_type: "qwen_code_cli",
    display_name: "Qwen Code",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "session_audit"]
  },
  {
    platform_name: "cplt",
    command: "cplt",
    commands: ["cplt"],
    tool_type: "cplt_cli",
    display_name: "CPLT",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist", "workflow_orchestration"]
  },
  {
    platform_name: "spec_kit",
    command: "spec-kit",
    commands: ["spec-kit", "spec"],
    tool_type: "spec_kit",
    display_name: "Spec Kit",
    adapter_family: "workflow_tool",
    adapter_surface: "cli",
    capabilities: ["spec_driven_planning", "task_breakdown", "approval_handling", "session_audit"]
  },
  {
    platform_name: "code",
    command: "code",
    commands: ["code"],
    tool_type: "vscode_terminal",
    display_name: "VS Code",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    capabilities: ["code_edit", "patch_proposal", "terminal_assist"]
  },
  {
    platform_name: "git",
    command: "git",
    commands: ["git"],
    tool_type: "git",
    display_name: "Git",
    adapter_family: "source_control",
    adapter_surface: "cli",
    capabilities: ["source_control", "repository_inspection"]
  },
  {
    platform_name: "node",
    command: "node",
    commands: ["node"],
    tool_type: "node_runtime",
    display_name: "Node.js",
    adapter_family: "runtime",
    adapter_surface: "cli",
    capabilities: ["script_execution", "runtime_assist"]
  },
  {
    platform_name: "npm",
    command: "npm",
    commands: ["npm"],
    tool_type: "npm_runtime",
    display_name: "npm",
    adapter_family: "package_manager",
    adapter_surface: "cli",
    capabilities: ["package_management", "script_execution"]
  },
  {
    platform_name: "ollama",
    command: "ollama",
    commands: ["ollama"],
    tool_type: "local_model",
    display_name: "Ollama",
    adapter_family: "model_runtime",
    adapter_surface: "cli",
    capabilities: ["local_model", "prompt_execution"]
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
  const normalized = String(command || "").trim().toLowerCase();
  if (!normalized) return null;
  return ADAPTER_PROFILES.find((item) => {
    const commands = Array.isArray(item.commands) && item.commands.length ? item.commands : [item.command];
    return commands.some((candidate) => String(candidate || "").trim().toLowerCase() === normalized);
  }) || null;
}

function getAdapterProfileForCommand(command) {
  return getCandidateByCommand(command);
}

function toolTypeForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.tool_type : "custom_tool";
}

function adaptationPackForCommand(command) {
  const pack = getAdaptationPackForCommand(command);
  return pack ? summarizeAdaptationPack(pack) : null;
}

function displayNameForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.display_name : titleCase(command);
}

function capabilitiesForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.capabilities.slice() : ["terminal_assist"];
}

function adapterFamilyForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.adapter_family : "custom";
}

function adapterSurfaceForCommand(command) {
  const candidate = getCandidateByCommand(command);
  return candidate ? candidate.adapter_surface : "cli";
}

function resolveExecutableOnPathFromCommands(commands = []) {
  for (const command of Array.isArray(commands) ? commands : []) {
    const resolved_path = resolveExecutableOnPath(command);
    if (resolved_path) {
      return {
        resolved_path,
        resolved_command: command
      };
    }
  }
  return {
    resolved_path: null,
    resolved_command: null
  };
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
  return ADAPTER_PROFILES.map((candidate) => {
    const detection = resolveExecutableOnPathFromCommands(candidate.commands || [candidate.command]);
    const adaptationPack = adaptationPackForCommand(candidate.command || candidate.platform_name);
    return {
      platform_name: candidate.platform_name,
      command: candidate.command,
      commands: Array.isArray(candidate.commands) ? candidate.commands.slice() : [candidate.command],
      tool_id: normalizeToolId(candidate.platform_name || candidate.command),
      tool_type: candidate.tool_type,
      display_name: candidate.display_name,
      adapter_family: candidate.adapter_family,
      adapter_surface: candidate.adapter_surface,
      adaptation_pack_id: adaptationPack ? adaptationPack.adaptation_pack_id : null,
      adaptation_pack_name: adaptationPack ? adaptationPack.display_name : null,
      adaptation_pack: adaptationPack,
      prompt_profile_id: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile.prompt_profile_id : null,
      prompt_profile: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile : null,
      activation_state: detection.resolved_path ? "installed" : "missing",
      resolved_command: detection.resolved_command || candidate.command,
      resolved_path: detection.resolved_path,
      editor: candidate.adapter_surface === "editor" ? "cursor" : "terminal",
      status: detection.resolved_path ? "detected" : "missing",
      capabilities: candidate.capabilities.slice(),
      execution_enabled: false,
      detected_at: detection.resolved_path ? now : null,
      registered_at: null,
      last_checked_at: now,
      notes: detection.resolved_path ? null : "Not found on PATH."
    };
  });
}

function buildRegisteredToolFromInput(input = {}, now = new Date().toISOString()) {
  const rawTool = String(input.tool || "").trim();
  const tool_id = normalizeToolId(input.tool_id || rawTool);
  const command = String(input.command || rawTool || tool_id).trim();
  const descriptor = getCandidateByCommand(command);
  const adaptationPack = adaptationPackForCommand(descriptor ? descriptor.command : command);
  const explicitPath = String(input.path || "").trim();
  const resolvedFromPath = explicitPath && explicitPath !== "auto"
    ? {
      resolved_path: path.resolve(explicitPath),
      resolved_command: descriptor ? descriptor.command : command
    }
    : resolveExecutableOnPathFromCommands(descriptor ? descriptor.commands : [command]);
  const resolved_path = resolvedFromPath.resolved_path || null;
  const status = explicitPath === "auto" && !resolved_path ? "missing" : "registered";
  return {
    tool_id: tool_id || normalizeToolId(command),
    platform_name: descriptor ? descriptor.platform_name : normalizeToolId(command) || "custom",
    tool_type: input.tool_type || toolTypeForCommand(descriptor ? descriptor.command : command),
    display_name: input.display_name || displayNameForCommand(descriptor ? descriptor.command : command),
    command: descriptor ? descriptor.command : command,
    commands: descriptor && Array.isArray(descriptor.commands) ? descriptor.commands.slice() : [command],
    resolved_command: resolvedFromPath.resolved_command || (descriptor ? descriptor.command : command),
    resolved_path,
    adapter_family: input.adapter_family || adapterFamilyForCommand(descriptor ? descriptor.command : command),
    adapter_surface: input.adapter_surface || adapterSurfaceForCommand(descriptor ? descriptor.command : command),
    adaptation_pack_id: adaptationPack ? adaptationPack.adaptation_pack_id : null,
    adaptation_pack_name: adaptationPack ? adaptationPack.display_name : null,
    adaptation_pack: adaptationPack,
    prompt_profile_id: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile.prompt_profile_id : null,
    prompt_profile: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile : null,
    activation_state: resolved_path ? "installed" : "missing",
    editor: normalizeEditor(input.editor || (descriptor && descriptor.adapter_surface === "editor" ? "cursor" : "terminal")),
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

function summarizeAdapterProfile(profile, detectedTools = []) {
  const adaptationPack = adaptationPackForCommand(profile.command || profile.platform_name);
  const matchingTools = Array.isArray(detectedTools) ? detectedTools.filter((tool) => {
    const toolNames = [tool.platform_name, tool.command, tool.resolved_command, tool.tool_id]
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean);
    const packNames = [profile.platform_name, profile.command, ...(Array.isArray(profile.commands) ? profile.commands : [])]
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean);
    return toolNames.some((item) => packNames.includes(item));
  }) : [];
  return {
    profile_id: normalizeToolId(profile.platform_name || profile.command),
    platform_name: profile.platform_name,
    command: profile.command,
    commands: Array.isArray(profile.commands) ? profile.commands.slice() : [profile.command],
    tool_type: profile.tool_type,
    display_name: profile.display_name,
    adapter_family: profile.adapter_family,
    adapter_surface: profile.adapter_surface,
    adaptation_pack_id: adaptationPack ? adaptationPack.adaptation_pack_id : null,
    adaptation_pack_name: adaptationPack ? adaptationPack.display_name : null,
    adaptation_pack: adaptationPack,
    prompt_profile_id: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile.prompt_profile_id : null,
    prompt_profile: adaptationPack && adaptationPack.prompt_profile ? adaptationPack.prompt_profile : null,
    activation_state: matchingTools.some((tool) => Boolean(tool && tool.resolved_path))
      ? "installed"
      : (matchingTools.length ? "detected" : "missing"),
    matching_tools: matchingTools.map((tool) => tool.tool_id || tool.command || tool.platform_name).filter(Boolean),
    capabilities: Array.isArray(profile.capabilities) ? profile.capabilities.slice() : []
  };
}

function buildAdapterCatalogReport(detectedTools = []) {
  const profiles = ADAPTER_PROFILES.map((profile) => summarizeAdapterProfile(profile, detectedTools));
  const adaptationPacks = buildAdaptationPackCatalogReport(detectedTools);
  const summary = profiles.reduce((acc, profile) => {
    acc.total += 1;
    acc.by_family[profile.adapter_family] = (acc.by_family[profile.adapter_family] || 0) + 1;
    acc.by_surface[profile.adapter_surface] = (acc.by_surface[profile.adapter_surface] || 0) + 1;
    acc.by_activation[profile.activation_state] = (acc.by_activation[profile.activation_state] || 0) + 1;
    return acc;
  }, { total: 0, by_family: {}, by_surface: {}, by_activation: {} });

  return {
    report_type: "ai_tool_adapters_catalog",
    plugin_id: "ai_tool_adapters",
    status: "available",
    count: profiles.length,
    summary,
    profiles,
    adaptation_packs: adaptationPacks.packs,
    adaptation_pack_count: adaptationPacks.count,
    prompt_profile_count: adaptationPacks.prompt_profile_count || 0,
    installed_count: adaptationPacks.installed_count,
    next_action: "Use ai-tool-adapter scan to detect which of these profiles are installed locally."
  };
}

function buildPromptCatalogReport(detectedTools = []) {
  return buildPromptProfileCatalogReport(detectedTools);
}

module.exports = {
  ADAPTER_PROFILES,
  KNOWN_TOOL_CANDIDATES: ADAPTER_PROFILES,
  normalizeToolId,
  normalizeEditor,
  toolTypeForCommand,
  displayNameForCommand,
  capabilitiesForCommand,
  adapterFamilyForCommand,
  adapterSurfaceForCommand,
  adaptationPackForCommand,
  resolveExecutableOnPath,
  resolveExecutableOnPathFromCommands,
  scanKnownTools,
  buildRegisteredToolFromInput,
  normalizeScanHistoryEntry,
  getAdapterProfileForCommand,
  summarizeAdapterProfile,
  buildAdapterCatalogReport,
  buildAdaptationPackCatalogReport,
  buildPromptCatalogReport
};
