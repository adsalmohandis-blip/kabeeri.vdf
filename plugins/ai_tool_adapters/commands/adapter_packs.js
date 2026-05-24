function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneList(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function buildPromptProfile(config) {
  const family = String(config.adapter_family || "custom").trim();
  const surface = String(config.adapter_surface || "cli").trim();
  const roleByFamily = {
    agent_cli: "governed code assistant",
    editor_integration: "editor-integrated coding assistant",
    agent_sdk: "tool-call orchestration assistant",
    mcp_host: "governance-aware tool router",
    workflow_tool: "spec-driven planning assistant",
    source_control: "source-control operations assistant",
    runtime: "local runtime assistant",
    package_manager: "package and script operations assistant",
    model_runtime: "local model runtime assistant"
  };
  const role = config.prompt_role || roleByFamily[family] || "governed assistant";
  const defaults = {
    core_instruction: `You are the ${config.display_name} adaptation pack. Stay local, governed, and auditable.`,
    constraints: [
      "Do not perform actions outside the requested scope.",
      "Prefer explicit commands over inferred behavior.",
      "Refuse destructive or credential-exposing actions unless the governing contract explicitly allows them.",
      "Keep every run explainable and reviewable."
    ],
    response_style: [
      "Be concise and action-oriented.",
      "Provide a clear plan before execution.",
      "Report blockers instead of silently working around them."
    ],
    checklist: [
      "Confirm the requested tool and command surface.",
      "Identify the minimal safe change.",
      "Check policy and contract constraints.",
      "Keep output aligned to the requested task."
    ],
    templates: {
      task_intake: `Task intake for ${config.display_name}: identify the goal, the minimum safe command surface, and any governance constraints.`,
      execution_plan: `Execution plan for ${config.display_name}: list the exact steps, expected effect, and rollback/validation points.`,
      review: `Review for ${config.display_name}: verify scope, safety, evidence, and whether any step needs explicit confirmation.`
    }
  };

  return {
    prompt_profile_id: `${normalizeId(config.platform_name)}-prompt-profile`,
    role,
    surface,
    core_instruction: config.prompt_core_instruction || defaults.core_instruction,
    constraints: cloneList(config.prompt_constraints || defaults.constraints),
    response_style: cloneList(config.prompt_response_style || defaults.response_style),
    checklist: cloneList(config.prompt_checklist || defaults.checklist),
    templates: {
      task_intake: config.prompt_templates && config.prompt_templates.task_intake ? config.prompt_templates.task_intake : defaults.templates.task_intake,
      execution_plan: config.prompt_templates && config.prompt_templates.execution_plan ? config.prompt_templates.execution_plan : defaults.templates.execution_plan,
      review: config.prompt_templates && config.prompt_templates.review ? config.prompt_templates.review : defaults.templates.review
    },
    preferred_temperature: config.prompt_temperature ?? 0.2,
    preferred_max_iterations: config.prompt_max_iterations ?? 6,
    prompt_mode: config.prompt_mode || "governed",
    notes: config.prompt_notes || null
  };
}

function cloneObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMultilineText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function ensureList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeWhitespace(item)).filter(Boolean);
  }
  const normalized = normalizeWhitespace(value);
  return normalized ? [normalized] : [];
}

function uniqueList(values = []) {
  return Array.from(new Set(ensureList(values)));
}

function toSentence(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function summarizePromptProfile(profile) {
  if (!profile) return null;
  return {
    prompt_profile_id: profile.prompt_profile_id,
    role: profile.role,
    surface: profile.surface,
    core_instruction: profile.core_instruction,
    constraints: cloneList(profile.constraints),
    response_style: cloneList(profile.response_style),
    checklist: cloneList(profile.checklist),
    templates: {
      task_intake: profile.templates.task_intake,
      execution_plan: profile.templates.execution_plan,
      review: profile.templates.review
    },
    preferred_temperature: profile.preferred_temperature,
    preferred_max_iterations: profile.preferred_max_iterations,
    prompt_mode: profile.prompt_mode,
    notes: profile.notes
  };
}

function selectAdaptationPack(input = {}, options = {}) {
  const hint = normalizeWhitespace(
    input.tool ||
    input.tool_id ||
    input.platform_name ||
    input.command ||
    input.adapter_name ||
    options.tool ||
    options.tool_id ||
    options.platform_name ||
    options.command
  ).toLowerCase();
  if (!hint) return null;
  return getAdaptationPackForCommand(hint) || getAdaptationPackForPlatform(hint) || null;
}

function buildPromptBlock(title, values = []) {
  const items = uniqueList(values);
  if (!items.length) return null;
  return [`${title}:`, ...items.map((item) => `- ${item}`)].join("\n");
}

const TRACK_MODE_ALIASES = {
  owner_core: ["owner core", "owner-core", "core", "implementation", "source", "main"],
  owner_docs: ["owner docs", "owner-docs", "docs", "documentation", "readme", "guide", "explain"],
  vibe_product: ["vibe product", "product", "app", "delivery", "feature", "roadmap"],
  vibe_ux: ["vibe ux", "ux", "ui", "design", "screen", "layout", "flow", "wireframe"],
  plugin_manifest: ["plugin manifest", "manifest", "plugin.json", "bundle", "package", "surface"],
  plugin_runtime: ["plugin runtime", "runtime", "runner", "execution", "bootstrap", "provider"],
  plugin_schema: ["plugin schema", "schema", "state", "contract", "validation", "json schema"]
};

function resolveTrackModeAlias(value) {
  const normalized = normalizeWhitespace(value).toLowerCase().replace(/[\s_-]+/g, "_");
  if (!normalized) return "";
  const canonicalModes = Object.keys(TRACK_MODE_ALIASES);
  if (canonicalModes.includes(normalized)) return normalized;
  const probe = normalized.replace(/_/g, " ");
  for (const [mode, aliases] of Object.entries(TRACK_MODE_ALIASES)) {
    if (aliases.some((alias) => {
      const aliasText = normalizeWhitespace(alias).toLowerCase();
      if (!aliasText) return false;
      if (/^[a-z0-9]+$/.test(aliasText)) {
        return new RegExp(`\\b${aliasText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(probe);
      }
      return probe === aliasText || probe.includes(aliasText);
    })) {
      return mode;
    }
  }
  return normalized;
}

function selectPromptPreset(input = {}, pack = null) {
  const explicit = normalizeWhitespace(input.preset || input.prompt_preset || "").toLowerCase();
  if (explicit) {
    const normalized = explicit.replace(/[\s_-]+/g, "_");
    if (["bugfix", "feature", "feature_build", "code_review", "review", "refactor", "docs", "documentation", "plan"].includes(normalized)) {
      return normalized === "feature" ? "feature_build" : normalized === "review" ? "code_review" : normalized === "docs" ? "documentation" : normalized;
    }
  }

  const probe = normalizeWhitespace([
    input.brief,
    input.vibe,
    input.prompt,
    input.message,
    input.request,
    input.task,
    input.summary,
    pack ? pack.intent : ""
  ].join(" ")).toLowerCase();

  if (/(bug|fix|issue|error|broken|failing|failure|regression)/.test(probe)) return "bugfix";
  if (/(review|audit|inspect|check|verify|qa|testing)/.test(probe)) return "code_review";
  if (/(refactor|cleanup|simplify|restructure|rename)/.test(probe)) return "refactor";
  if (/(docs|documentation|readme|guide|write docs)/.test(probe)) return "documentation";
  if (/(plan|design|spec|proposal|roadmap)/.test(probe)) return "plan";
  if (/(feature|build|implement|add|create|ship)/.test(probe)) return "feature_build";
  return "general";
}

function getPromptPresetGuide(preset, pack, promptProfile) {
  const displayName = pack ? pack.display_name : "the selected tool";
  const base = {
    preset,
    preset_label: "general task prompt",
    user_opening: [
      "Describe the task clearly.",
      "State the target outcome and the safest path.",
      "Request clarification if the scope is missing."
    ],
    examples: [
      `Example: "Update ${displayName} workflow to make the task safer and easier to validate."`,
      `Example: "Refine the request into a clear, governed task with scope, constraints, and validation."`
    ],
    section_overrides: {}
  };

  if (preset === "bugfix") {
    return {
      ...base,
      preset_label: "bugfix prompt",
      user_opening: [
        "Describe the bug and the visible failure.",
        "State the expected behavior and the minimal safe fix.",
        "Call out validation steps and rollback risks."
      ],
      examples: [
        `Example: "Fix the login bug in ${displayName} with the smallest safe change and a clear validation command."`,
        `Example: "Turn this bug report into a governed fix plan with file targets, constraints, and test steps."`
      ],
      section_overrides: {
        must_include: ["bug symptoms", "expected behavior", "minimal fix", "validation"],
        output_contract: [
          "Summarize the bug first.",
          "Name the smallest safe fix.",
          "Include validation and rollback notes."
        ]
      }
    };
  }

  if (preset === "feature_build") {
    return {
      ...base,
      preset_label: "feature build prompt",
      user_opening: [
        "Describe the new capability and its user value.",
        "State the acceptance criteria and dependencies.",
        "Call out the safest implementation path."
      ],
      examples: [
        `Example: "Add the missing account settings flow in ${displayName} with acceptance criteria and validation."`,
        `Example: "Convert this feature request into a build plan with scope, dependencies, and review checkpoints."`
      ],
      section_overrides: {
        must_include: ["feature outcome", "acceptance criteria", "dependencies", "validation"],
        output_contract: [
          "Summarize the feature clearly.",
          "List acceptance criteria and dependencies.",
          "Show the implementation and validation path."
        ]
      }
    };
  }

  if (preset === "code_review") {
    return {
      ...base,
      preset_label: "code review prompt",
      user_opening: [
        "Describe what should be reviewed and why.",
        "State the risks, expected issues, and focus areas.",
        "Ask for a concise findings-first response."
      ],
      examples: [
        `Example: "Review this ${displayName} change for correctness, regressions, and missing validation."`,
        `Example: "Turn this review note into a findings-first checklist with severity and fix suggestions."`
      ],
      section_overrides: {
        must_include: ["review target", "risk areas", "findings format", "validation"],
        output_contract: [
          "Start with findings.",
          "Rank issues by severity.",
          "End with concise fixes or follow-up checks."
        ],
        response_frame: [
          "Lead with findings.",
          "Group issues by severity or theme.",
          "Finish with the recommended next action."
        ]
      }
    };
  }

  if (preset === "refactor") {
    return {
      ...base,
      preset_label: "refactor prompt",
      user_opening: [
        "Describe the structural improvement you want.",
        "State what must stay stable and what can change.",
        "Call out verification and rollback requirements."
      ],
      examples: [
        `Example: "Refactor this ${displayName} flow to reduce duplication without changing behavior."`,
        `Example: "Turn this cleanup request into a bounded refactor plan with safety checks."`
      ],
      section_overrides: {
        must_include: ["stability constraints", "refactor target", "validation", "rollback"],
        output_contract: [
          "Explain the refactor goal.",
          "List the stable behavior that must not change.",
          "Include validation and rollback notes."
        ]
      }
    };
  }

  if (preset === "documentation") {
    return {
      ...base,
      preset_label: "documentation prompt",
      user_opening: [
        "Describe the docs target and audience.",
        "State the key information that must be captured.",
        "Ask for clarity, accuracy, and completeness."
      ],
      examples: [
        `Example: "Write documentation for ${displayName} setup with a concise quickstart and validation steps."`,
        `Example: "Turn this note into a clear docs brief with structure, examples, and review checks."`
      ],
      section_overrides: {
        must_include: ["audience", "structure", "examples", "review"],
        output_contract: [
          "Summarize the doc task.",
          "List the target audience and sections.",
          "End with review and accuracy checks."
        ]
      }
    };
  }

  if (preset === "plan") {
    return {
      ...base,
      preset_label: "planning prompt",
      user_opening: [
        "Describe the objective and the intended outcome.",
        "State the milestones and dependencies.",
        "Ask for a reviewable plan with handoff details."
      ],
      examples: [
        `Example: "Plan the next ${displayName} release with milestones, dependencies, and owner handoff."`,
        `Example: "Convert this rough idea into a structured plan with acceptance criteria and next steps."`
      ],
      section_overrides: {
        must_include: ["milestones", "dependencies", "handoff", "acceptance criteria"],
        output_contract: [
          "Summarize the plan objective.",
          "List milestones and dependencies.",
          "Close with the handoff owner and next step."
        ]
      }
    };
  }

  return base;
}

function normalizeTrack(value, pack = null) {
  const raw = normalizeWhitespace(value || "").toLowerCase().replace(/[\s_-]+/g, "_");
  if (raw) {
    if (["owner", "framework_owner", "core", "kvdf_core", "kvdf"].includes(raw)) return "owner";
    if (["vibe", "app", "viber", "kvdos", "kvdos_app", "product"].includes(raw)) return "vibe";
    if (["plugin", "plugins", "integration", "extension"].includes(raw)) return "plugin";
  }
  const family = String(pack && pack.adapter_family ? pack.adapter_family : "").trim().toLowerCase();
  const surface = String(pack && pack.adapter_surface ? pack.adapter_surface : "").trim().toLowerCase();
  if (family === "source_control" || family === "workflow_tool") return "owner";
  if (surface === "editor") return "vibe";
  return "vibe";
}

function getTrackTemplateGuide(track, pack, promptProfile) {
  const displayName = pack ? pack.display_name : "the selected tool";
  const trackLabel = track === "owner"
    ? "KVDF Core owner track"
    : track === "plugin"
      ? "plugin track"
      : "Vibe/App track";
  const base = {
    track,
    track_label: trackLabel,
    track_goal: "Keep the prompt explicit, scoped, and ready for governed execution.",
    track_constraints: [
      "Do not expand outside the active track boundary.",
      "Keep the task local to the current repo and request.",
      "Ask for clarification if the track or target files are unclear."
    ],
    track_examples: [
      `Example: "Translate this short request into a ${trackLabel} prompt for ${displayName}."`,
      `Example: "Turn the vibe sentence into a track-aware task with scope, constraints, and validation."`
    ],
    track_frame: [
      "State the active track first.",
      "Name the target boundary and files.",
      "Keep the output aligned to that track's delivery rules."
    ],
    track_focus: []
  };

  if (track === "owner") {
    return {
      ...base,
      track_goal: "Keep KVDF Core work direct, authoritative, and main-branch ready.",
      track_constraints: [
        "Prefer direct-to-main KVDF Core work unless explicit branching is requested.",
        "Do not drift into KVDOS app delivery or plugin packaging work.",
        "Keep validation order explicit and source evidence first."
      ],
      track_examples: [
        `Example: "Turn this owner-track note into a KVDF Core prompt with direct-to-main scope, explicit files, and validation."`,
        `Example: "Rewrite this into a framework-owner task that keeps core files, governance, and tests in scope."`
      ],
      track_frame: [
        "Name the owner-track target first.",
        "Call out the core files, docs, schemas, or tests being changed.",
        "End with validation and rollback guidance."
      ],
      track_focus: [
        "KVDF Core source, docs, schemas, runtime, and tests stay in scope.",
        "Direct-to-main is the default delivery mode for owner work.",
        "Keep app-track and plugin-track files out unless explicitly requested."
      ]
    };
  }

  if (track === "plugin") {
    return {
      ...base,
      track_goal: "Keep plugin work local, removable, and compatibility-safe.",
      track_constraints: [
        "Do not link to removed pack sources or external runtime roots.",
        "Keep plugin manifests, schemas, runtime, docs, and tests aligned.",
        "Preserve removal safety and avoid hidden dependencies."
      ],
      track_examples: [
        `Example: "Convert this into a plugin-track prompt for ${displayName} with manifest, schema, runtime, and test scope."`,
        `Example: "Rewrite this as a plugin-safe task that avoids linking back to removed source packs."`
      ],
      track_frame: [
        "Name the plugin target and the removable bundle boundary.",
        "List manifest/runtime/schema/test files explicitly.",
        "End with compatibility and validation notes."
      ],
      track_focus: [
        "Plugins must stay removable and self-contained.",
        "No direct or indirect dependency on removed source packs.",
        "Keep runtime state and docs consistent with the manifest."
      ]
    };
  }

  return {
    ...base,
    track_goal: "Keep app-track work local-first and product-focused.",
    track_constraints: [
      "Do not edit KVDF Core source files unless explicitly asked.",
      "Keep KVDOS/app delivery and UX context in scope.",
      "Preserve local-first delivery and track boundaries."
    ],
    track_examples: [
      `Example: "Turn this into a KVDOS/Vibe app-track prompt for ${displayName} with product, UX, and delivery scope."`,
      `Example: "Rewrite this vibe note into an app-track prompt that stays local-first and product-focused."`
    ],
    track_frame: [
      "Name the app-track target first.",
      "Keep the prompt focused on the product surface, UX, or app delivery path.",
      "End with app validation and handoff notes."
    ],
    track_focus: [
      "App-track work should stay local-first and product-oriented.",
      "Avoid editing KVDF Core and plugin surfaces unless the request says so.",
      "Use KVDOS language when the prompt is clearly commercial/product-facing."
    ]
  };
}

function selectTrackMode(input = {}, track = "vibe", pack = null) {
  const explicit = normalizeWhitespace(input.track_mode || input.mode || input.template_mode || "").toLowerCase();
  if (explicit) {
    const normalized = resolveTrackModeAlias(explicit);
    if (Object.prototype.hasOwnProperty.call(TRACK_MODE_ALIASES, normalized)) {
      return normalized;
    }
  }

  const probe = normalizeWhitespace([
    input.brief,
    input.vibe,
    input.prompt,
    input.message,
    input.request,
    input.task,
    input.summary,
    input.context,
    input.background,
    input.notes,
    pack ? pack.intent : "",
    track
  ].join(" ")).toLowerCase();

  if (track === "owner") {
    if (/(docs?|documentation|readme|guide|comment|explain|manual)/.test(probe)) return "owner_docs";
    return "owner_core";
  }
  if (track === "plugin") {
    if (/(schema|json schema|validation|contract)/.test(probe)) return "plugin_schema";
    if (/(runtime|runner|bootstrap|execution|spawn)/.test(probe)) return "plugin_runtime";
    return "plugin_manifest";
  }
  if (/(ux|ui|visual|design|screen|layout|flow|wireframe)/.test(probe)) return "vibe_ux";
  return "vibe_product";
}

function getTrackModeGuide(track, mode, pack, promptProfile) {
  const displayName = pack ? pack.display_name : "the selected tool";
  const trackLabel = track === "owner"
    ? "KVDF Core owner track"
    : track === "plugin"
      ? "plugin track"
      : "Vibe/App track";
  const base = {
    track_mode: mode,
    track_mode_label: "general track template",
    track_mode_goal: "Keep the prompt aligned to the active track and task.",
    track_mode_aliases: TRACK_MODE_ALIASES[mode] ? cloneList(TRACK_MODE_ALIASES[mode]) : [],
    track_mode_constraints: [],
    track_mode_examples: [
      `Example: "Use the general ${trackLabel} template for ${displayName}."`
    ],
    track_mode_frame: [
      "Name the sub-mode if it is known.",
      "Keep the prompt within the track boundary.",
      "End with the expected validation or handoff."
    ]
  };

  if (mode === "owner_core") {
    return {
      ...base,
      track_mode_label: "owner core template",
      track_mode_goal: "Keep core implementation work direct, main-ready, and evidence-first.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.owner_core),
      track_mode_constraints: [
        "Prefer source changes, tests, schemas, and runtime work.",
        "Do not drift into docs-only or app-track phrasing.",
        "Keep the path to validation explicit."
      ],
      track_mode_examples: [
        `Example: "Use the owner core template for ${displayName} to update source, tests, and validation."`,
        `Example: "Rewrite this into a core implementation prompt with direct-to-main scope."`
      ],
      track_mode_frame: [
        "Start with the core source files or modules.",
        "Describe the implementation work and safety checks.",
        "End with validation and rollback guidance."
      ]
    };
  }

  if (mode === "owner_docs") {
    return {
      ...base,
      track_mode_label: "owner docs template",
      track_mode_goal: "Keep KVDF Core documentation authoritative and easy to review.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.owner_docs),
      track_mode_constraints: [
        "Focus on docs, guides, references, and explanations.",
        "Avoid unnecessary code changes unless explicitly asked.",
        "Keep the docs aligned with current source evidence."
      ],
      track_mode_examples: [
        `Example: "Use the owner docs template for ${displayName} to update governance docs and usage guidance."`,
        `Example: "Turn this note into a core docs prompt with audience, structure, and review checks."`
      ],
      track_mode_frame: [
        "Name the docs target and audience first.",
        "List the sections or references that need updates.",
        "End with accuracy, consistency, and review notes."
      ]
    };
  }

  if (mode === "vibe_ux") {
    return {
      ...base,
      track_mode_label: "vibe ux template",
      track_mode_goal: "Keep app UX prompts concrete, visual, and product-oriented.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.vibe_ux),
      track_mode_constraints: [
        "Focus on screens, layout, flows, and interaction details.",
        "Keep the request local-first and product-facing.",
        "Avoid core-repo or plugin-system detours."
      ],
      track_mode_examples: [
        `Example: "Use the vibe UX template for ${displayName} to redesign a screen flow with validation."`,
        `Example: "Turn this app note into a UX prompt with layout, interaction, and handoff details."`
      ],
      track_mode_frame: [
        "Name the screen or flow first.",
        "Describe the visual and interaction changes.",
        "End with UX validation and implementation notes."
      ]
    };
  }

  if (mode === "vibe_product") {
    return {
      ...base,
      track_mode_label: "vibe product template",
      track_mode_goal: "Keep app prompts focused on product outcome and delivery.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.vibe_product),
      track_mode_constraints: [
        "Focus on product value, acceptance criteria, and delivery scope.",
        "Keep the prompt local-first and customer-facing.",
        "Avoid turning the prompt into core framework work."
      ],
      track_mode_examples: [
        `Example: "Use the vibe product template for ${displayName} to turn this feature idea into a delivery plan."`,
        `Example: "Rewrite this app idea into a product prompt with outcomes, scope, and validation."`
      ],
      track_mode_frame: [
        "Name the product outcome first.",
        "List the user value and acceptance criteria.",
        "End with delivery and validation notes."
      ]
    };
  }

  if (mode === "plugin_manifest") {
    return {
      ...base,
      track_mode_label: "plugin manifest template",
      track_mode_goal: "Keep plugin manifest prompts focused on packaging, identity, and surface area.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.plugin_manifest),
      track_mode_constraints: [
        "Keep plugin id, manifest fields, command surface, and docs in scope.",
        "Avoid linking to removed pack sources or external roots.",
        "Keep the bundle removable and self-contained."
      ],
      track_mode_examples: [
        `Example: "Use the plugin manifest template for ${displayName} to update plugin.json, docs, and commands."`,
        `Example: "Turn this plugin note into a manifest prompt with compatibility and removal safety."`
      ],
      track_mode_frame: [
        "Name the plugin manifest target first.",
        "List the manifest and documentation surfaces.",
        "End with compatibility and removal-safety checks."
      ]
    };
  }

  if (mode === "plugin_runtime") {
    return {
      ...base,
      track_mode_label: "plugin runtime template",
      track_mode_goal: "Keep plugin runtime prompts focused on commands, execution, and provider behavior.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.plugin_runtime),
      track_mode_constraints: [
        "Focus on runtime entrypoints, command handlers, provider APIs, and execution policy.",
        "Avoid introducing hidden dependencies.",
        "Keep the runtime self-contained and testable."
      ],
      track_mode_examples: [
        `Example: "Use the plugin runtime template for ${displayName} to update command handling and provider behavior."`,
        `Example: "Rewrite this plugin runtime note into a governed execution prompt with tests."`
      ],
      track_mode_frame: [
        "Name the runtime surface first.",
        "Describe the behavior change and safety checks.",
        "End with runtime validation and tests."
      ]
    };
  }

  if (mode === "plugin_schema") {
    return {
      ...base,
      track_mode_label: "plugin schema template",
      track_mode_goal: "Keep plugin schema prompts focused on state shape, contracts, and validation.",
      track_mode_aliases: cloneList(TRACK_MODE_ALIASES.plugin_schema),
      track_mode_constraints: [
        "Focus on JSON schema, state shape, and contract compatibility.",
        "Keep the data model explicit and versioned.",
        "Preserve backward compatibility where possible."
      ],
      track_mode_examples: [
        `Example: "Use the plugin schema template for ${displayName} to update state and response schemas."`,
        `Example: "Turn this schema note into a validation prompt with compatibility checks."`
      ],
      track_mode_frame: [
        "Name the schema or state file first.",
        "Describe the shape change and compatibility impact.",
        "End with validation and migration notes."
      ]
    };
  }

  return base;
}

function getPromptCompositionGuide(pack, promptProfile) {
  const platform = String(pack && pack.platform_name ? pack.platform_name : "").trim().toLowerCase();
  const family = String(pack && pack.adapter_family ? pack.adapter_family : "").trim().toLowerCase();
  const surface = String(pack && pack.adapter_surface ? pack.adapter_surface : "").trim().toLowerCase();
  const baseGuide = {
    style_label: "governed professional prompt",
    priority_order: ["goal", "scope", "context", "constraints", "validation"],
    must_include: ["clear task statement", "explicit scope", "governance constraints", "validation steps"],
    avoid: ["vague ambition", "unbounded refactors", "hidden side effects"],
    section_order: ["system", "developer", "user"],
    decision_checkpoints: [
      "Confirm the requested track and mode before acting.",
      "Keep the work inside the narrowest safe scope.",
      "End with validation and open-risk notes."
    ],
    response_frame: [
      "Start with a concise summary.",
      "Follow with the implementation or reasoning detail.",
      "End with validation and open risks."
    ],
    output_contract: [
      "State the result clearly.",
      "List the steps or files touched.",
      "Include validation or verification.",
      "Call out any open risks or follow-ups."
    ],
    tool_notes: []
  };

  if (platform === "codex") {
    return {
      ...baseGuide,
      style_label: "patch-first engineering prompt",
      priority_order: ["goal", "target files", "minimal diff", "validation", "rollback"],
      must_include: ["target files", "minimal diff", "verification command", "rollback note"],
      avoid: ["speculative refactors", "broad rewrites", "hidden commands"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Start with the summary of the patch.",
        "List the exact files changed and why.",
        "Finish with the validation command and rollback note."
      ],
      decision_checkpoints: [
        "Confirm the exact target files before editing.",
        "Prefer the smallest safe diff.",
        "Validate with a concrete command and mention rollback notes."
      ],
      output_contract: [
        "Return a concise summary first.",
        "List the exact files changed.",
        "Include the validation command that should be run.",
        "Call out rollback or risk notes if needed."
      ],
      tool_notes: [
        "Prefer file-by-file change scope.",
        "State the exact validation command.",
        "Keep the diff minimal and auditable."
      ]
    };
  }

  if (platform === "claude") {
    return {
      ...baseGuide,
      style_label: "reasoning-first coding prompt",
      priority_order: ["goal", "reasoning", "scope", "safety", "validation"],
      must_include: ["reasoning path", "bounded scope", "safety checks", "final verification"],
      avoid: ["open-ended exploration", "implicit assumptions", "silent fallback behavior"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Open with the reasoning path.",
        "Then provide the bounded implementation plan.",
        "Close with verification and confirmation points."
      ],
      decision_checkpoints: [
        "Explain the reasoning path clearly.",
        "Surface assumptions and confirmation points.",
        "Finish with validation and safety checks."
      ],
      output_contract: [
        "Summarize the reasoning path.",
        "Show the implementation plan.",
        "Include validation and safety checks.",
        "End with open questions or confirmation points."
      ],
      tool_notes: [
        "Explain the reasoning before the execution plan.",
        "Keep the prompt bounded and explicit.",
        "Surface decision points that need confirmation."
      ]
    };
  }

  if (platform === "gemini") {
    return {
      ...baseGuide,
      style_label: "structured iteration prompt",
      priority_order: ["goal", "steps", "edge cases", "checks", "output"],
      must_include: ["ordered steps", "edge cases", "output format", "validation criteria"],
      avoid: ["multi-topic drift", "ambiguous output expectations", "unbounded iteration"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Use numbered steps.",
        "State edge cases and the output format explicitly.",
        "Close with validation criteria."
      ],
      decision_checkpoints: [
        "Break the work into numbered steps.",
        "Call out edge cases and output expectations.",
        "Close with a checkable validation rule."
      ],
      output_contract: [
        "Use numbered steps for execution.",
        "Include edge cases and validation criteria.",
        "State the expected output format clearly.",
        "Keep the scope tight and iterative."
      ],
      tool_notes: [
        "Use structured sections and numbered execution steps.",
        "Ask for only the necessary clarifications.",
        "Keep the output format explicit."
      ]
    };
  }

  if (surface === "editor" || platform === "cursor" || platform === "continue" || platform === "code") {
    return {
      ...baseGuide,
      style_label: "editor-native change prompt",
      priority_order: ["goal", "active file context", "edit plan", "validation", "review"],
      must_include: ["active files", "edit steps", "editor-friendly validation", "review checklist"],
      avoid: ["hidden file changes", "background automation", "unclear buffers"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Name the active files first.",
        "Provide the edit steps in order.",
        "End with editor validation and review notes."
      ],
      decision_checkpoints: [
        "Name the active file set first.",
        "Keep the editor workflow explicit.",
        "End with review notes and validation."
      ],
      output_contract: [
        "Name the active file or files first.",
        "List the edit steps in order.",
        "Include editor-friendly validation.",
        "Add a short review checklist."
      ],
      tool_notes: [
        "Treat the editor context as first-class.",
        "Separate UI guidance from shell execution.",
        "Make the edited files explicit."
      ]
    };
  }

  if (family === "agent_sdk" || family === "mcp_host") {
    return {
      ...baseGuide,
      style_label: "orchestration prompt",
      priority_order: ["goal", "tool sequence", "policy", "evidence", "output"],
      must_include: ["tool call sequence", "policy gate", "evidence capture", "handoff path"],
      avoid: ["free-form tool invocation", "implicit authorities", "state drift"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Describe the tool-call sequence first.",
        "Show the policy gate and evidence capture next.",
        "Finish with deterministic handoff/output notes."
      ],
      decision_checkpoints: [
        "Keep tool authority explicit.",
        "Capture policy and evidence points.",
        "Preserve deterministic handoff behavior."
      ],
      output_contract: [
        "Describe the tool-call sequence.",
        "Point out the policy gate or authority step.",
        "Show where evidence is captured.",
        "Keep handoff and output deterministic."
      ],
      tool_notes: [
        "Represent the flow as tool-call steps.",
        "Keep governance boundaries visible.",
        "Note where evidence is captured."
      ]
    };
  }

  if (family === "workflow_tool") {
    return {
      ...baseGuide,
      style_label: "spec-driven planning prompt",
      priority_order: ["goal", "plan", "acceptance criteria", "dependencies", "handoff"],
      must_include: ["acceptance criteria", "dependency notes", "handoff criteria"],
      avoid: ["missing acceptance criteria", "vague deliverables", "unowned follow-up work"],
      section_order: ["system", "developer", "user"],
      response_frame: [
        "Start with the plan summary.",
        "List acceptance criteria and dependencies.",
        "End with the handoff owner and next step."
      ],
      decision_checkpoints: [
        "Write acceptance criteria before execution details.",
        "Name dependencies or prerequisites.",
        "Make the handoff owner obvious."
      ],
      output_contract: [
        "Write a plan that can be reviewed and approved.",
        "List acceptance criteria explicitly.",
        "Include dependencies or prerequisites.",
        "Clarify the handoff owner or next step."
      ],
      tool_notes: [
        "Make the plan testable and reviewable.",
        "Tie the prompt to explicit acceptance criteria.",
        "Keep the handoff obvious."
      ]
    };
  }

  return baseGuide;
}

function composeProfessionalPrompt(input = {}, options = {}) {
  const source = typeof input === "string" ? { brief: input } : cloneObject(input);
  const merged = { ...cloneObject(options), ...source };
  const brief = normalizeWhitespace(
    merged.brief ||
    merged.vibe ||
    merged.prompt ||
    merged.message ||
    merged.request ||
    merged.task ||
    merged.summary
  );
  const pack = selectAdaptationPack(merged, options);
  const promptProfile = pack ? pack.prompt_profile : null;
  const track = normalizeTrack(merged.track || merged.workflow_track || merged.scope || options.track || options.workflow_track || options.scope, pack);
  const trackMode = selectTrackMode(merged, track, pack);
  const context = normalizeMultilineText(merged.context || merged.background || merged.notes || "");
  const objective = normalizeWhitespace(merged.objective || merged.goal || merged.outcome || brief);
  const audience = normalizeWhitespace(merged.audience || merged.user || merged.owner || "");
  const deliverable = normalizeWhitespace(merged.deliverable || merged.output || merged.result || "");
  const tone = normalizeWhitespace(merged.tone || merged.style || "");
  const format = normalizeWhitespace(merged.format || merged.output_format || "");
  const validation = ensureList(merged.validation || merged.checks || merged.acceptance_criteria);
  const constraints = uniqueList([
    ...(promptProfile ? promptProfile.constraints : []),
    merged.constraint,
    merged.constraints,
    options.constraint,
    options.constraints
  ]);
  const checklist = uniqueList([
    ...(promptProfile ? promptProfile.checklist : []),
    merged.checklist,
    options.checklist
  ]);
  const responseStyle = uniqueList([
    ...(promptProfile ? promptProfile.response_style : []),
    merged.response_style,
    options.response_style
  ]);
  const clarifyingQuestions = Number.isFinite(Number(merged.clarify_limit || options.clarify_limit))
    ? Math.max(0, Number(merged.clarify_limit || options.clarify_limit))
    : 3;
  const taskSentence = brief ? toSentence(brief) : "";
  const promptTitle = normalizeWhitespace(merged.title || merged.prompt_title || (pack ? `${pack.display_name} prompt pack` : "Professional prompt pack"));
  const promptPreset = selectPromptPreset(merged, pack);
  const presetGuide = getPromptPresetGuide(promptPreset, pack, promptProfile);
  const trackGuide = getTrackTemplateGuide(track, pack, promptProfile);
  const trackModeGuide = getTrackModeGuide(track, trackMode, pack, promptProfile);
  const compositionGuide = getPromptCompositionGuide(pack, promptProfile);
  const mergedGuide = {
    ...compositionGuide,
    ...presetGuide,
    ...trackGuide,
    ...trackModeGuide,
    section_overrides: presetGuide.section_overrides || {}
  };
  const mergedMustInclude = uniqueList([
    ...(compositionGuide.must_include || []),
    ...(mergedGuide.section_overrides.must_include || [])
  ]);
  const mergedOutputContract = uniqueList([
    ...(compositionGuide.output_contract || []),
    ...(mergedGuide.section_overrides.output_contract || [])
  ]);
  const mergedResponseFrame = uniqueList([
    ...(compositionGuide.response_frame || []),
    ...(mergedGuide.section_overrides.response_frame || [])
  ]);
  const systemAddendum = [
    buildPromptBlock("Tool-specific guidance", compositionGuide.tool_notes),
    buildPromptBlock("Preset guidance", presetGuide.user_opening),
    buildPromptBlock("Track guidance", trackGuide.track_focus),
    buildPromptBlock("Track mode goal", [trackModeGuide.track_mode_goal]),
    buildPromptBlock("Track mode guidance", trackModeGuide.track_mode_constraints),
    buildPromptBlock("Track mode aliases", trackModeGuide.track_mode_aliases),
    buildPromptBlock("Decision checkpoints", compositionGuide.decision_checkpoints),
    buildPromptBlock("Prompt examples", uniqueList([...(presetGuide.examples || []), ...(trackGuide.track_examples || []), ...(trackModeGuide.track_mode_examples || [])]))
  ].filter(Boolean).join("\n\n");
  const systemPrompt = [
    promptProfile ? promptProfile.core_instruction : "You are a governed AI assistant.",
    buildPromptBlock("Constraints", constraints),
    buildPromptBlock("Checklist", checklist),
    buildPromptBlock("Output contract", mergedOutputContract),
    systemAddendum
  ]
    .filter(Boolean)
    .join("\n\n");
  const developerPrompt = [
    promptProfile ? `Role: ${promptProfile.role}` : "Role: governed assistant",
    promptProfile ? `Mode: ${promptProfile.prompt_mode}` : "Mode: governed",
    promptProfile ? `Surface: ${promptProfile.surface}` : "Surface: generic",
    `Composition style: ${compositionGuide.style_label}`,
    `Track: ${trackGuide.track_label}`,
    `Track mode: ${trackModeGuide.track_mode_label}`,
    buildPromptBlock("Track mode goal", [trackModeGuide.track_mode_goal]),
    buildPromptBlock("Track mode aliases", trackModeGuide.track_mode_aliases),
    `Prompt preset: ${presetGuide.preset_label}`,
    buildPromptBlock("Response style", responseStyle),
    buildPromptBlock("Response frame", mergedResponseFrame),
    buildPromptBlock("Decision checkpoints", compositionGuide.decision_checkpoints),
    buildPromptBlock("Output contract", mergedOutputContract),
    `Convert the short brief into a professional execution prompt before any tool is used.`,
    `Keep the prompt specific, scoped, and ready for governed execution.`
  ]
    .filter(Boolean)
    .join("\n\n");
  const userPromptSections = [
    `Task: ${taskSentence || "Define the requested work clearly."}`,
    objective && objective !== taskSentence ? `Objective: ${objective}` : null,
    context ? `Context:\n${context}` : null,
    audience ? `Audience: ${audience}` : null,
    deliverable ? `Deliverable: ${deliverable}` : null,
    tone ? `Tone: ${tone}` : null,
    format ? `Format: ${format}` : null,
    buildPromptBlock("Constraints", constraints),
    buildPromptBlock("Validation", validation),
    buildPromptBlock("Must include", mergedMustInclude),
    buildPromptBlock("Avoid", compositionGuide.avoid),
    buildPromptBlock("Track guidance", trackGuide.track_focus),
    buildPromptBlock("Track mode goal", [trackModeGuide.track_mode_goal]),
    buildPromptBlock("Track mode guidance", trackModeGuide.track_mode_constraints),
    buildPromptBlock("Track mode aliases", trackModeGuide.track_mode_aliases),
    buildPromptBlock("Decision checkpoints", compositionGuide.decision_checkpoints),
    buildPromptBlock("Prompt examples", uniqueList([...(presetGuide.examples || []), ...(trackGuide.track_examples || []), ...(trackModeGuide.track_mode_examples || [])])),
    buildPromptBlock("Output contract", mergedOutputContract),
    `Questions: If any detail is ambiguous, ask up to ${clarifyingQuestions} concise clarifying questions before acting.`
  ]
    .filter(Boolean);
  const professionalPrompt = userPromptSections.join("\n\n");
  const promptBlueprint = {
    prompt_title: promptTitle || null,
    brief: brief || null,
    track,
    track_label: trackGuide.track_label,
    track_mode: trackModeGuide.track_mode,
    track_mode_label: trackModeGuide.track_mode_label,
    track_mode_goal: trackModeGuide.track_mode_goal,
    preset: promptPreset,
    preset_label: presetGuide.preset_label,
    tool: pack ? {
      platform_name: pack.platform_name,
      command: pack.command,
      display_name: pack.display_name,
      adapter_family: pack.adapter_family,
      adapter_surface: pack.adapter_surface,
      adaptation_pack_id: pack.adaptation_pack_id,
      prompt_profile_id: promptProfile ? promptProfile.prompt_profile_id : null
    } : null,
    style_label: compositionGuide.style_label,
    priority_order: compositionGuide.priority_order,
    must_include: compositionGuide.must_include,
    avoid: compositionGuide.avoid,
    response_frame: mergedResponseFrame,
    output_contract: mergedOutputContract,
    section_order: compositionGuide.section_order,
    track_constraints: trackGuide.track_constraints,
    track_examples: trackGuide.track_examples,
    track_frame: trackGuide.track_frame,
    track_focus: trackGuide.track_focus,
    track_mode_constraints: trackModeGuide.track_mode_constraints,
    track_mode_examples: trackModeGuide.track_mode_examples,
    track_mode_frame: trackModeGuide.track_mode_frame,
    track_mode_aliases: trackModeGuide.track_mode_aliases,
    decision_checkpoints: compositionGuide.decision_checkpoints,
    examples: presetGuide.examples,
    system_prompt: systemPrompt,
    developer_prompt: developerPrompt,
    user_prompt: professionalPrompt,
    prompt_sections: {
      task: taskSentence || null,
      objective: objective || null,
      context: context || null,
      audience: audience || null,
      deliverable: deliverable || null,
      tone: tone || null,
      format: format || null,
      constraints,
      validation,
      checklist,
      response_style: responseStyle
    },
    clarifying_question_limit: clarifyingQuestions
  };
  const composedPrompt = [
    promptTitle ? `# ${promptTitle}` : null,
    systemPrompt ? `## System\n${systemPrompt}` : null,
    developerPrompt ? `## Developer\n${developerPrompt}` : null,
    `## User\n${professionalPrompt}`
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    report_type: "ai_tool_adapters_prompt_composition",
    plugin_id: "ai_tool_adapters",
    status: brief ? "available" : "warning",
    prompt_title: promptTitle || null,
    input_brief: brief || null,
    prompt_mode: promptProfile ? promptProfile.prompt_mode : "governed",
    track,
    track_label: trackGuide.track_label,
    track_mode: trackModeGuide.track_mode,
    track_mode_label: trackModeGuide.track_mode_label,
    track_mode_goal: trackModeGuide.track_mode_goal,
    preset: promptPreset,
    preset_label: presetGuide.preset_label,
    platform_name: pack ? pack.platform_name : null,
    command: pack ? pack.command : null,
    adaptation_pack_id: pack ? pack.adaptation_pack_id : null,
    adaptation_pack_name: pack ? pack.display_name : null,
    adaptation_pack: pack ? summarizeAdaptationPack(pack) : null,
    prompt_profile: summarizePromptProfile(promptProfile),
    track_constraints: trackGuide.track_constraints,
    track_examples: trackGuide.track_examples,
    track_frame: trackGuide.track_frame,
    track_focus: trackGuide.track_focus,
    track_mode_constraints: trackModeGuide.track_mode_constraints,
    track_mode_examples: trackModeGuide.track_mode_examples,
    track_mode_frame: trackModeGuide.track_mode_frame,
    track_mode_aliases: trackModeGuide.track_mode_aliases,
    decision_checkpoints: compositionGuide.decision_checkpoints,
    examples: presetGuide.examples,
    system_prompt: systemPrompt,
    developer_prompt: developerPrompt,
    professional_prompt: professionalPrompt,
    composed_prompt: composedPrompt,
    prompt_blueprint: promptBlueprint,
    prompt_sections: {
      task: taskSentence || null,
      objective: objective || null,
      context: context || null,
      audience: audience || null,
      deliverable: deliverable || null,
      tone: tone || null,
      format: format || null,
      constraints,
      validation,
      checklist,
      response_style: responseStyle
    },
    clarifying_question_limit: clarifyingQuestions,
    words: composedPrompt.split(/\s+/).filter(Boolean).length,
    next_action: brief
      ? "Use the composed prompt with the selected AI tool or insert it into a governed run contract."
      : "Provide a short brief so the plugin can turn it into a professional prompt."
  };
}

function createPack(config) {
  const commands = Array.isArray(config.commands) && config.commands.length
    ? Array.from(new Set(config.commands.map((item) => String(item).trim()).filter(Boolean)))
    : [config.command];
  const tags = Array.isArray(config.tags) && config.tags.length
    ? Array.from(new Set(config.tags.map((item) => String(item).trim()).filter(Boolean)))
    : [config.adapter_surface, config.adapter_family].filter(Boolean);
  return {
    adaptation_pack_id: `${normalizeId(config.platform_name)}-adaptation-pack`,
    platform_name: config.platform_name,
    command: config.command,
    commands,
    display_name: config.display_name,
    tool_type: config.tool_type,
    adapter_family: config.adapter_family,
    adapter_surface: config.adapter_surface,
    pack_version: config.pack_version || "1.0.0",
    description: config.description || config.intent,
    intent: config.intent,
    operator_mode: "governed-local",
    activation_mode: config.activation_mode || "auto-detect",
    pack_class: config.pack_class || "tool-adaptation",
    tags,
    primary_use_cases: Array.isArray(config.primary_use_cases) ? config.primary_use_cases.slice() : [],
    command_aliases: commands.slice(),
    safety_rules: Array.isArray(config.safety_rules) ? config.safety_rules.slice() : [],
    contract_hints: Array.isArray(config.contract_hints) ? config.contract_hints.slice() : [],
    prompt_profile: buildPromptProfile(config),
    notes: config.notes || null
  };
}

const ADAPTATION_PACKS = [
  createPack({
    platform_name: "codex",
    command: "codex",
    commands: ["codex", "openai-codex"],
    display_name: "OpenAI Codex CLI",
    tool_type: "codex_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Patch codebases, propose diffs, and assist with terminal-driven development.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist"],
    safety_rules: ["Prefer minimal diffs.", "Avoid destructive commands unless explicitly confirmed.", "Keep worktree changes auditable."],
    contract_hints: ["Use validated run contracts.", "Treat confirmation as mandatory for execution."],
    prompt_role: "governed patch author",
    prompt_constraints: [
      "Focus on minimal diffs.",
      "Use concrete file paths and commands.",
      "Avoid speculative refactors."
    ],
    prompt_templates: {
      task_intake: "For Codex, identify the smallest safe patch, the target files, and any commands that validate the change.",
      execution_plan: "For Codex, produce a short patch plan with file-by-file steps and validation commands.",
      review: "For Codex, check whether the patch is minimal, reversible, and covered by tests."
    }
  }),
  createPack({
    platform_name: "claude",
    command: "claude",
    commands: ["claude"],
    display_name: "Claude Code",
    tool_type: "claude_code",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Support reasoning-heavy coding work with patch-first execution and controlled shell access.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist", "session_audit"],
    safety_rules: ["Keep actions explainable.", "Use the governed contract before execution.", "Preserve user intent across edit loops."],
    contract_hints: ["Route through multi_ai_governance for approvals.", "Capture evidence for any run."],
    prompt_role: "reasoning-first governed coding assistant",
    prompt_templates: {
      task_intake: "For Claude Code, clarify the reasoning, scope, and any safety constraints before changing files.",
      execution_plan: "For Claude Code, outline the reasoning path, then the exact edits, then the validation steps.",
      review: "For Claude Code, confirm the reasoning stayed bounded by the request and the contract."
    }
  }),
  createPack({
    platform_name: "cursor",
    command: "cursor",
    commands: ["cursor"],
    display_name: "Cursor",
    tool_type: "cursor_cli",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    intent: "Bridge editor-centric coding workflows into the governed tool registry.",
    primary_use_cases: ["code_edit", "patch_proposal", "hooking"],
    safety_rules: ["Respect editor context.", "Avoid hidden background changes.", "Keep registry state synchronized."],
    contract_hints: ["Treat the editor as an integration surface, not an authority."],
    prompt_role: "editor-integrated assistant",
    prompt_templates: {
      task_intake: "For Cursor, identify the active editor context, the files involved, and the smallest safe edit.",
      execution_plan: "For Cursor, prefer editor-aware guidance, keeping shell steps separate from UI actions.",
      review: "For Cursor, verify that edits, prompts, and approvals stayed visible in the editor flow."
    }
  }),
  createPack({
    platform_name: "continue",
    command: "continue",
    commands: ["continue"],
    display_name: "Continue.dev",
    tool_type: "continue_dev",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    intent: "Provide an editor-native coding assistant path with local governance hooks.",
    primary_use_cases: ["code_edit", "patch_proposal", "hooking"],
    safety_rules: ["Keep local state explicit.", "Do not auto-approve edits.", "Surface all model actions through contracts."],
    contract_hints: ["Use the same registry and policy flow as CLI tools."],
    prompt_role: "editor-integrated governed assistant",
    prompt_templates: {
      task_intake: "For Continue.dev, separate editor guidance from governed execution steps.",
      execution_plan: "For Continue.dev, keep the plan local, explicit, and contract-aware.",
      review: "For Continue.dev, ensure no background automation escaped the policy boundary."
    }
  }),
  createPack({
    platform_name: "gemini",
    command: "gemini",
    commands: ["gemini"],
    display_name: "Gemini CLI",
    tool_type: "gemini_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Support multi-step content and coding tasks with structured command handling.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist"],
    safety_rules: ["Keep command intent narrow.", "Prefer explicit arguments over inference.", "Preserve local evidence."],
    contract_hints: ["Pair with governed execution and captured logs."],
    prompt_role: "general-purpose terminal coding assistant",
    prompt_templates: {
      task_intake: "For Gemini CLI, identify the exact command intent, the safest scope, and the validation method.",
      execution_plan: "For Gemini CLI, generate a concise step list with explicit arguments and checks.",
      review: "For Gemini CLI, verify the action stayed within the contract and the local evidence log."
    }
  }),
  createPack({
    platform_name: "kimi",
    command: "kimi",
    commands: ["kimi"],
    display_name: "Kimi CLI",
    tool_type: "kimi_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Handle general local assistant flows with explicit registry control.",
    primary_use_cases: ["code_edit", "terminal_assist"],
    safety_rules: ["Keep runs local and auditable.", "Block unscoped shell behavior.", "Require contract checks before execution."],
    contract_hints: ["The pack should remain fail-closed."],
    prompt_role: "local assistant with strict shell boundaries",
    prompt_templates: {
      task_intake: "For Kimi CLI, keep the request local, bounded, and traceable.",
      execution_plan: "For Kimi CLI, prefer one focused change with explicit verification.",
      review: "For Kimi CLI, confirm no command escaped the governed allowlist."
    }
  }),
  createPack({
    platform_name: "grok",
    command: "grok",
    commands: ["grok"],
    display_name: "Grok CLI",
    tool_type: "grok_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Provide a governed pathway for assistant-style command execution.",
    primary_use_cases: ["code_edit", "terminal_assist"],
    safety_rules: ["Keep every run inspectable.", "Do not bypass the registry.", "Preserve redaction on evidence."],
    contract_hints: ["Collect evidence for each action."],
    prompt_role: "assistant with defensive execution posture",
    prompt_templates: {
      task_intake: "For Grok CLI, state the desired effect, then the exact command surface.",
      execution_plan: "For Grok CLI, emit a narrow plan that is easy to audit and repeat.",
      review: "For Grok CLI, ensure evidence and redaction stayed intact."
    }
  }),
  createPack({
    platform_name: "openai_agents",
    command: "openai-agents",
    commands: ["openai-agents", "agents"],
    display_name: "OpenAI Agents SDK",
    tool_type: "openai_agents_sdk",
    adapter_family: "agent_sdk",
    adapter_surface: "sdk",
    intent: "Support SDK-driven agent orchestration with policy-visible tool calls.",
    primary_use_cases: ["agent_orchestration", "tool_call_translation", "workflow_control"],
    safety_rules: ["Keep agent steps serialized.", "Make tool calls policy-aware.", "Persist run evidence."],
    contract_hints: ["Use as a structured SDK adapter rather than a free-form shell."],
    prompt_role: "tool-call orchestration assistant",
    prompt_templates: {
      task_intake: "For the Agents SDK, identify the tool sequence and the governing constraints.",
      execution_plan: "For the Agents SDK, serialize tool calls and note evidence collection points.",
      review: "For the Agents SDK, confirm tool calls remained policy-visible and bounded."
    }
  }),
  createPack({
    platform_name: "mcp",
    command: "mcp",
    commands: ["mcp"],
    display_name: "MCP Host",
    tool_type: "mcp_host",
    adapter_family: "mcp_host",
    adapter_surface: "host",
    intent: "Route tools through a governed MCP host view with registry and policy awareness.",
    primary_use_cases: ["tool_routing", "registry_lookup", "policy_enforcement"],
    safety_rules: ["Route through local governance.", "Keep host behavior declarative.", "Avoid implicit execution paths."],
    contract_hints: ["Treat the MCP host as a brokered surface."],
    prompt_role: "broker and policy gate",
    prompt_templates: {
      task_intake: "For the MCP host, identify the requested tool route and any registry lookups needed.",
      execution_plan: "For the MCP host, keep routing decisions declarative and auditable.",
      review: "For the MCP host, verify the route did not bypass policy or registry controls."
    }
  }),
  createPack({
    platform_name: "aider",
    command: "aider",
    commands: ["aider"],
    display_name: "Aider",
    tool_type: "aider_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Support patch-oriented coding loops with concise command execution.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist"],
    safety_rules: ["Keep diffs focused.", "Avoid silent file churn.", "Use explicit run contracts."],
    contract_hints: ["Best fit for edit-centric sessions."],
    prompt_role: "focused patch assistant",
    prompt_templates: {
      task_intake: "For Aider, choose the smallest useful patch and the simplest validation path.",
      execution_plan: "For Aider, keep changes clustered by file and avoid extraneous edits.",
      review: "For Aider, ensure the patch is readable, reversible, and test-backed."
    }
  }),
  createPack({
    platform_name: "goose",
    command: "goose",
    commands: ["goose"],
    display_name: "Goose",
    tool_type: "goose_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Drive multi-step development assistance through governed local execution.",
    primary_use_cases: ["code_edit", "workflow_orchestration", "terminal_assist"],
    safety_rules: ["Keep workflows observable.", "Use explicit approvals.", "Store evidence for each run."],
    contract_hints: ["Prefer sequential, inspectable tasks."],
    prompt_role: "workflow orchestration assistant",
    prompt_templates: {
      task_intake: "For Goose, break the work into visible steps and identify all approval points.",
      execution_plan: "For Goose, prefer sequential steps with explicit validation after each phase.",
      review: "For Goose, confirm every step remained observable and governed."
    }
  }),
  createPack({
    platform_name: "opencode",
    command: "opencode",
    commands: ["opencode"],
    display_name: "OpenCode",
    tool_type: "opencode_dev",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Support code-first local workflows with governed execution.",
    primary_use_cases: ["code_edit", "workflow_orchestration", "terminal_assist"],
    safety_rules: ["Keep the editor and shell surfaces separated.", "Do not escalate privileges implicitly.", "Audit every run."],
    contract_hints: ["Good fit for structured dev loops."],
    prompt_role: "structured development assistant",
    prompt_templates: {
      task_intake: "For OpenCode, identify the source files, the target change, and the least risky execution path.",
      execution_plan: "For OpenCode, keep the editor, shell, and evidence flows separate and explicit.",
      review: "For OpenCode, ensure the run stayed governed and the output is easy to audit."
    }
  }),
  createPack({
    platform_name: "openhands",
    command: "openhands",
    commands: ["openhands"],
    display_name: "OpenHands",
    tool_type: "openhands_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Support autonomous task execution while staying within governance boundaries.",
    primary_use_cases: ["code_edit", "workflow_orchestration", "terminal_assist"],
    safety_rules: ["Keep autonomy bounded by contracts.", "Record every action.", "Use local registry state as the source of truth."],
    contract_hints: ["Never bypass the approval path."],
    prompt_role: "bounded autonomous assistant",
    prompt_templates: {
      task_intake: "For OpenHands, define the goal, the guardrails, and the completion criteria before acting.",
      execution_plan: "For OpenHands, keep the workstep sequence explicit, reversible, and logged.",
      review: "For OpenHands, verify autonomy never exceeded the approved contract."
    }
  }),
  createPack({
    platform_name: "qwen_code",
    command: "qwen-code",
    commands: ["qwen-code", "qwen"],
    display_name: "Qwen Code",
    tool_type: "qwen_code_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Provide a governed code-assistant profile for local development work.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist"],
    safety_rules: ["Keep the execution envelope narrow.", "Use explicit command matching.", "Preserve audit trails."],
    contract_hints: ["Alias-aware command matching is expected."],
    prompt_role: "alias-aware coding assistant",
    prompt_templates: {
      task_intake: "For Qwen Code, map aliases carefully and choose the least surprising command path.",
      execution_plan: "For Qwen Code, keep the action narrow, explicit, and testable.",
      review: "For Qwen Code, ensure alias matching did not widen the allowed execution scope."
    }
  }),
  createPack({
    platform_name: "cplt",
    command: "cplt",
    commands: ["cplt"],
    display_name: "CPLT",
    tool_type: "cplt_cli",
    adapter_family: "agent_cli",
    adapter_surface: "cli",
    intent: "Handle compact local coding assistance with policy-governed execution.",
    primary_use_cases: ["code_edit", "workflow_orchestration", "terminal_assist"],
    safety_rules: ["Keep actions visible.", "Prefer minimal edits.", "Track state in the registry."],
    contract_hints: ["Use the standard governed contract path."],
    prompt_role: "compact coding assistant",
    prompt_templates: {
      task_intake: "For CPLT, keep the task small, the output concrete, and the validation obvious.",
      execution_plan: "For CPLT, avoid broad refactors and stay close to the registry record.",
      review: "For CPLT, ensure the change stayed compact and governed."
    }
  }),
  createPack({
    platform_name: "spec_kit",
    command: "spec-kit",
    commands: ["spec-kit", "spec"],
    display_name: "Spec Kit",
    tool_type: "spec_kit",
    adapter_family: "workflow_tool",
    adapter_surface: "cli",
    intent: "Translate specs into structured work while keeping approvals explicit.",
    primary_use_cases: ["spec_driven_planning", "task_breakdown", "approval_handling"],
    safety_rules: ["Keep planning separate from execution.", "Track approval boundaries.", "Avoid hidden side effects."],
    contract_hints: ["Best used before governed execution."],
    prompt_role: "spec-driven planning assistant",
    prompt_templates: {
      task_intake: "For Spec Kit, convert the request into steps, constraints, and approval boundaries.",
      execution_plan: "For Spec Kit, produce a plan that separates specification from implementation.",
      review: "For Spec Kit, ensure the plan is concrete enough to govern execution safely."
    }
  }),
  createPack({
    platform_name: "code",
    command: "code",
    commands: ["code"],
    display_name: "VS Code",
    tool_type: "vscode_terminal",
    adapter_family: "editor_integration",
    adapter_surface: "editor",
    intent: "Capture editor-assisted local development as a governed integration surface.",
    primary_use_cases: ["code_edit", "patch_proposal", "terminal_assist"],
    safety_rules: ["Distinguish editor actions from shell runs.", "Avoid implicit automation.", "Keep registry updates explicit."],
    contract_hints: ["Treat as an editor integration pack."],
    prompt_role: "editor integration assistant",
    prompt_templates: {
      task_intake: "For VS Code, identify what belongs in the editor and what belongs in the governed runner.",
      execution_plan: "For VS Code, keep the editor workflow explicit and separate from shell execution.",
      review: "For VS Code, confirm the integration remained local and observable."
    }
  }),
  createPack({
    platform_name: "git",
    command: "git",
    commands: ["git"],
    display_name: "Git",
    tool_type: "git",
    adapter_family: "source_control",
    adapter_surface: "cli",
    intent: "Support repository inspection and source control with strict governance.",
    primary_use_cases: ["source_control", "repository_inspection"],
    safety_rules: ["Preserve history integrity.", "Avoid destructive repository actions without confirmation.", "Keep commands explicit."],
    contract_hints: ["Best for read/inspect flows and governed change application."],
    prompt_role: "source-control assistant",
    prompt_templates: {
      task_intake: "For Git, identify the exact repository operation and the safety implications.",
      execution_plan: "For Git, prefer inspect-first flows and explicit commands for any mutation.",
      review: "For Git, verify no destructive action happened without the required confirmation."
    }
  }),
  createPack({
    platform_name: "node",
    command: "node",
    commands: ["node"],
    display_name: "Node.js",
    tool_type: "node_runtime",
    adapter_family: "runtime",
    adapter_surface: "cli",
    intent: "Run local JavaScript utilities and scripts under the adapter registry.",
    primary_use_cases: ["script_execution", "runtime_assist"],
    safety_rules: ["Keep scripts scoped.", "Avoid unrestricted process spawning.", "Redact sensitive output."],
    contract_hints: ["Useful for local tooling support."],
    prompt_role: "local runtime assistant",
    prompt_templates: {
      task_intake: "For Node.js, specify the script, the inputs, and the safest execution envelope.",
      execution_plan: "For Node.js, keep the script bounded and the output redacted where needed.",
      review: "For Node.js, ensure no unscoped process work escaped the contract."
    }
  }),
  createPack({
    platform_name: "npm",
    command: "npm",
    commands: ["npm"],
    display_name: "npm",
    tool_type: "npm_runtime",
    adapter_family: "package_manager",
    adapter_surface: "cli",
    intent: "Support package management and script execution through governed commands.",
    primary_use_cases: ["package_management", "script_execution"],
    safety_rules: ["Keep installs explicit.", "Avoid hidden lifecycle scripts unless allowed.", "Track run evidence."],
    contract_hints: ["Use only through validated run contracts."],
    prompt_role: "package management assistant",
    prompt_templates: {
      task_intake: "For npm, identify the command, the package effect, and any lifecycle risks.",
      execution_plan: "For npm, prefer explicit flags and narrow package scopes.",
      review: "For npm, confirm no hidden install behavior or unexpected scripts executed."
    }
  }),
  createPack({
    platform_name: "ollama",
    command: "ollama",
    commands: ["ollama"],
    display_name: "Ollama",
    tool_type: "local_model",
    adapter_family: "model_runtime",
    adapter_surface: "cli",
    intent: "Provide a local model runtime profile for prompt execution and model access.",
    primary_use_cases: ["local_model", "prompt_execution"],
    safety_rules: ["Keep local model usage auditable.", "Avoid implicit network dependencies.", "Track runtime provenance in state."],
    contract_hints: ["Useful as a local model backend."],
    prompt_role: "local model runtime assistant",
    prompt_templates: {
      task_intake: "For Ollama, identify the model, the prompt, and the local runtime constraint.",
      execution_plan: "For Ollama, keep model access local, traceable, and bounded by policy.",
      review: "For Ollama, verify no hidden remote dependency or untracked prompt path was used."
    }
  })
];

function getAdaptationPackForCommand(command) {
  const normalized = String(command || "").trim().toLowerCase();
  if (!normalized) return null;
  return ADAPTATION_PACKS.find((pack) => {
    const commands = Array.isArray(pack.commands) && pack.commands.length ? pack.commands : [pack.command];
    return commands.some((candidate) => String(candidate || "").trim().toLowerCase() === normalized);
  }) || null;
}

function getAdaptationPackForPlatform(platformName) {
  const normalized = String(platformName || "").trim().toLowerCase();
  if (!normalized) return null;
  return ADAPTATION_PACKS.find((pack) => String(pack.platform_name || "").trim().toLowerCase() === normalized) || null;
}

function summarizeAdaptationPack(pack) {
  if (!pack) return null;
  return {
    adaptation_pack_id: pack.adaptation_pack_id,
    platform_name: pack.platform_name,
    command: pack.command,
    commands: Array.isArray(pack.commands) ? pack.commands.slice() : [],
    display_name: pack.display_name,
    tool_type: pack.tool_type,
    adapter_family: pack.adapter_family,
    adapter_surface: pack.adapter_surface,
    pack_version: pack.pack_version,
    pack_class: pack.pack_class,
    description: pack.description,
    intent: pack.intent,
    operator_mode: pack.operator_mode,
    activation_mode: pack.activation_mode,
    tags: Array.isArray(pack.tags) ? pack.tags.slice() : [],
    primary_use_cases: Array.isArray(pack.primary_use_cases) ? pack.primary_use_cases.slice() : [],
    safety_rules: Array.isArray(pack.safety_rules) ? pack.safety_rules.slice() : [],
    contract_hints: Array.isArray(pack.contract_hints) ? pack.contract_hints.slice() : [],
    prompt_profile: pack.prompt_profile ? {
      prompt_profile_id: pack.prompt_profile.prompt_profile_id,
      role: pack.prompt_profile.role,
      surface: pack.prompt_profile.surface,
      core_instruction: pack.prompt_profile.core_instruction,
      constraints: cloneList(pack.prompt_profile.constraints),
      response_style: cloneList(pack.prompt_profile.response_style),
      checklist: cloneList(pack.prompt_profile.checklist),
      templates: {
        task_intake: pack.prompt_profile.templates.task_intake,
        execution_plan: pack.prompt_profile.templates.execution_plan,
        review: pack.prompt_profile.templates.review
      },
      preferred_temperature: pack.prompt_profile.preferred_temperature,
      preferred_max_iterations: pack.prompt_profile.preferred_max_iterations,
      prompt_mode: pack.prompt_profile.prompt_mode,
      notes: pack.prompt_profile.notes
    } : null,
    notes: pack.notes || null
  };
}

function packMatchesTool(pack, tool) {
  if (!pack || !tool) return false;
  const toolNames = [
    tool.platform_name,
    tool.command,
    tool.resolved_command,
    tool.tool_id
  ]
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
  const packNames = [
    pack.platform_name,
    pack.command,
    ...(Array.isArray(pack.commands) ? pack.commands : [])
  ]
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
  return toolNames.some((item) => packNames.includes(item));
}

function buildAdaptationPackCatalogReport(detectedTools = []) {
  const packs = ADAPTATION_PACKS.map((pack) => {
    const summary = summarizeAdaptationPack(pack);
    const matchingTools = Array.isArray(detectedTools) ? detectedTools.filter((tool) => packMatchesTool(pack, tool)) : [];
    const installed = matchingTools.some((tool) => Boolean(tool && tool.resolved_path));
    return {
      ...summary,
      activation_state: installed ? "installed" : (matchingTools.length ? "detected" : "missing"),
      matching_tools: matchingTools.map((tool) => tool.tool_id || tool.command || tool.platform_name).filter(Boolean),
      matching_commands: matchingTools.map((tool) => tool.command || tool.resolved_command).filter(Boolean),
      detected: matchingTools.length > 0,
      installed
    };
  });
  const summary = packs.reduce((acc, pack) => {
    acc.total += 1;
    acc.by_family[pack.adapter_family] = (acc.by_family[pack.adapter_family] || 0) + 1;
    acc.by_surface[pack.adapter_surface] = (acc.by_surface[pack.adapter_surface] || 0) + 1;
    acc.by_activation[pack.activation_state] = (acc.by_activation[pack.activation_state] || 0) + 1;
    if (pack.installed) acc.installed += 1;
    return acc;
  }, { total: 0, installed: 0, by_family: {}, by_surface: {}, by_activation: {} });
  return {
    report_type: "ai_tool_adapters_adaptation_packs",
    plugin_id: "ai_tool_adapters",
    status: "available",
    count: packs.length,
    summary,
    packs,
    installed_count: summary.installed,
    prompt_profile_count: packs.filter((pack) => Boolean(pack.prompt_profile)).length,
    next_action: "Use the adaptation pack data to keep each tool profile behavior consistent and governed."
  };
}

function buildPromptProfileCatalogReport(detectedTools = []) {
  const packReport = buildAdaptationPackCatalogReport(detectedTools);
  return {
    report_type: "ai_tool_adapters_prompt_profiles",
    plugin_id: "ai_tool_adapters",
    status: "available",
    count: packReport.packs.length,
    installed_count: packReport.installed_count,
    prompt_profiles: packReport.packs
      .filter((pack) => Boolean(pack.prompt_profile))
      .map((pack) => ({
        adaptation_pack_id: pack.adaptation_pack_id,
        platform_name: pack.platform_name,
        display_name: pack.display_name,
        prompt_profile: pack.prompt_profile,
        activation_state: pack.activation_state,
        installed: pack.installed
      })),
    next_action: "Use the prompt profiles to seed model-specific system and developer guidance."
  };
}

function buildPromptCompositionReport(input = {}, options = {}) {
  return composeProfessionalPrompt(input, options);
}

module.exports = {
  ADAPTATION_PACKS,
  getAdaptationPackForCommand,
  getAdaptationPackForPlatform,
  summarizeAdaptationPack,
  summarizePromptProfile,
  buildAdaptationPackCatalogReport,
  buildPromptProfileCatalogReport,
  composeProfessionalPrompt,
  buildPromptCompositionReport
};
