const { table } = require("../ui");

const COMMAND_REGISTRY = [
  {
    key: "resume",
    aliases: ["start", "entry"],
    category: "session",
    stage: "entry",
    owner: "shared",
    purpose: "Resolve the current workspace, track, and the next exact action.",
    prerequisites: ["A readable workspace or session state."],
    outputs: ["Track context", "next action", "workspace mode"],
    next_commands: ["kvdf contract", "kvdf init", "kvdf track status"],
    file_dependencies: [".kabeeri/session_track.json", ".kabeeri/project.json"],
    ai_role: "Use the current state to choose the next command without guessing.",
    cli_role: "Tell the AI where it is and what it may do next."
  },
  {
    key: "init",
    aliases: ["create"],
    category: "workspace",
    stage: "bootstrap",
    owner: "shared",
    purpose: "Create the minimum viable workspace state and intake scaffolding.",
    prerequisites: ["A writable workspace root."],
    outputs: [".kabeeri workspace state", "project profile hints", "first-step guidance"],
    next_commands: ["kvdf questionnaire plan", "kvdf project profile route"],
    file_dependencies: [".kabeeri/project.json", ".kabeeri/questionnaires/adaptive_intake_plan.json"],
    ai_role: "Start a workspace without skipping the intake stage.",
    cli_role: "Create canonical state files before any higher-level planning starts."
  },
  {
    key: "delivery",
    aliases: ["agile", "structured"],
    category: "planning",
    stage: "mode-selection",
    owner: "app-or-owner",
    purpose: "Persist whether the work will follow Agile or Structured delivery.",
    prerequisites: ["Workspace state exists."],
    outputs: ["delivery_mode", "delivery_decisions", "mode-aware intake"],
    next_commands: ["kvdf questionnaire plan", "kvdf blueprint recommend"],
    file_dependencies: [".kabeeri/delivery_decisions.json", ".kabeeri/project.json"],
    ai_role: "Treat the delivery mode as an explicit branch, not a memory-only choice.",
    cli_role: "Persist the chosen mode and keep downstream planning in sync."
  },
  {
    key: "project-profile",
    aliases: ["project profile", "project"],
    category: "planning",
    stage: "classification",
    owner: "shared",
    purpose: "Classify the project and route the intake flow into the right profile.",
    prerequisites: ["Workspace state exists."],
    outputs: ["Project profile", "delivery recommendation", "intake signals"],
    next_commands: ["kvdf delivery choose", "kvdf questionnaire plan"],
    file_dependencies: [".kabeeri/project_profile.json", ".kabeeri/project.json"],
    ai_role: "Turn a raw vibe line into a structured project shape.",
    cli_role: "Store the classification as durable workspace state."
  },
  {
    key: "questionnaire",
    aliases: ["questionnaire plan"],
    category: "planning",
    stage: "intake",
    owner: "shared",
    purpose: "Collect the missing product facts that shape the app or system.",
    prerequisites: ["Delivery mode exists", "project context exists"],
    outputs: ["Questionnaire plan", "coverage matrix", "missing-answer report"],
    next_commands: ["kvdf brief", "kvdf blueprint", "kvdf task packet"],
    file_dependencies: [".kabeeri/questionnaires/adaptive_intake_plan.json", ".kabeeri/questionnaires/coverage_matrix.json"],
    ai_role: "Ask only the questions needed to unblock execution.",
    cli_role: "Keep the intake plan reproducible and persisted."
  },
  {
    key: "blueprint",
    aliases: ["data-design"],
    category: "design",
    stage: "shape",
    owner: "shared",
    purpose: "Translate the intake into concrete structure: pages, modules, data, and UI hints.",
    prerequisites: ["Questionnaire plan exists."],
    outputs: ["Blueprint selection", "data design context", "UI planning hints"],
    next_commands: ["kvdf task assessment", "kvdf task packet"],
    file_dependencies: [".kabeeri/product_blueprints.json", ".kabeeri/data_design.json"],
    ai_role: "Convert intent into a buildable structure.",
    cli_role: "Write the canonical blueprint outputs and keep the route explicit."
  },
  {
    key: "task-packet",
    aliases: ["task packet"],
    category: "execution",
    stage: "control-plane",
    owner: "kvdf-dev",
    purpose: "Compile the durable execution packet from intake, design, and approved tasks.",
    prerequisites: ["Delivery map exists", "traceability chain is complete", "approved or ready tasks exist"],
    outputs: ["Control-plane packet", "packet report"],
    next_commands: ["kvdf task executor-contract", "kvdf task batch-run"],
    file_dependencies: ["docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json"],
    ai_role: "Use the packet as the execution boundary instead of the chat transcript.",
    cli_role: "Compile the packet only when the upstream state is ready."
  },
  {
    key: "task-executor-contract",
    aliases: ["task executor-contract"],
    category: "execution",
    stage: "boundary",
    owner: "kvdf-dev",
    purpose: "Derive the packet-only file/action boundary for the worker.",
    prerequisites: ["Control-plane packet exists."],
    outputs: ["Executor boundary", "allowed/forbidden action list"],
    next_commands: ["kvdf task batch-run --mode execute"],
    file_dependencies: ["docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json"],
    ai_role: "Stay inside the packet-derived boundary.",
    cli_role: "Narrow execution to the explicit contract."
  },
  {
    key: "task-batch-run",
    aliases: ["task batch-run"],
    category: "execution",
    stage: "execution",
    owner: "kvdf-dev",
    purpose: "Start approved tasks in governed order and stop on the first blocker.",
    prerequisites: ["Control-plane packet exists", "executor contract exists"],
    outputs: ["Execution report", "task state updates"],
    next_commands: ["kvdf task verify", "kvdf task complete"],
    file_dependencies: [".kabeeri/reports/task_batch_run.json"],
    ai_role: "Execute only the approved slice the packet exposes.",
    cli_role: "Run the batch and persist the execution trail."
  },
  {
    key: "pipeline",
    aliases: ["pipeline matrix", "pipeline strict", "pipeline check"],
    category: "governance",
    stage: "validation",
    owner: "shared",
    purpose: "Render and enforce the strict pipeline guard table.",
    prerequisites: ["Pipeline state can be read."],
    outputs: ["Pipeline matrix report", "blocked-stage reasons"],
    next_commands: ["kvdf contract", "kvdf task packet", "kvdf task batch-run"],
    file_dependencies: ["docs/reports/KVDF_PIPELINE_ENFORCEMENT_MATRIX.md", ".kabeeri/reports/pipeline_enforcement.json"],
    ai_role: "Use the pipeline gates to understand whether the next command is allowed.",
    cli_role: "Fail closed and expose the exact blocker."
  },
  {
    key: "scorecards",
    aliases: ["scorecard"],
    category: "governance",
    stage: "assessment",
    owner: "shared",
    purpose: "Score the Kabeeri system across core quality areas and preserve the cards as a review-only planning artifact.",
    prerequisites: ["Evolution state can be read."],
    outputs: ["Scorecards report", "review-only scorecard state"],
    next_commands: ["kvdf contract", "kvdf pipeline strict"],
    file_dependencies: ["docs/reports/KVDF_SCORECARDS.md", ".kabeeri/reports/kabeeri_scorecards.json", ".kabeeri/evolution.json"],
    ai_role: "Treat the scorecards as an evidence-based evaluation before any Evolution planning is requested explicitly.",
    cli_role: "Persist the scorecards, keep the report durable, and only materialize Evolution work when explicitly asked."
  },
  {
    key: "plugin",
    aliases: ["plugins"],
    category: "governance",
    stage: "capability",
    owner: "shared",
    purpose: "Control install, enable, disable, and report the plugin loader state.",
    prerequisites: ["Plugin manifests exist."],
    outputs: ["Plugin loader state", "status report"],
    next_commands: ["kvdf plugin status", "kvdf contract"],
    file_dependencies: [".kabeeri/plugins.json"],
    ai_role: "Treat plugin state as a capability gate before using plugin-owned commands.",
    cli_role: "Canonicalize plugin state and keep it persisted."
  },
  {
    key: "contract",
    aliases: ["operator", "ai-contract"],
    category: "governance",
    stage: "control-plane",
    owner: "shared",
    purpose: "Explain the AI/CLI operating contract and the current next exact action.",
    prerequisites: ["Workspace or pipeline state can be read."],
    outputs: ["Operating contract report", "current next action"],
    next_commands: ["kvdf resume", "kvdf pipeline strict", "kvdf task packet"],
    file_dependencies: ["docs/reports/KVDF_AI_CLI_OPERATING_CONTRACT.md"],
    ai_role: "Use CLI output as the authoritative execution boundary.",
    cli_role: "Expose the contract in a durable and machine-readable way."
  },
  {
    key: "maintainability",
    aliases: ["maintainability report"],
    category: "governance",
    stage: "assessment",
    owner: "shared",
    purpose: "Expose the shared-service extraction scorecard and live maintainability state.",
    prerequisites: ["Workspace or report state can be read."],
    outputs: ["Maintainability report", "shared-service inventory", "live JSON state"],
    next_commands: ["kvdf contract", "kvdf pipeline strict", "kvdf scorecards"],
    file_dependencies: [".kabeeri/reports/maintainability.json", ".kabeeri/reports/kabeeri_scorecards.json"],
    ai_role: "Use the maintainability report to see which runtime helpers were extracted and what still needs cleanup.",
    cli_role: "Persist the maintainability snapshot so the runtime stops depending on chat memory."
  }
];

function normalizeCommandKey(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function getCommandRegistry() {
  return COMMAND_REGISTRY.map((entry) => ({
    ...entry,
    aliases: [...(entry.aliases || [])],
    prerequisites: [...(entry.prerequisites || [])],
    outputs: [...(entry.outputs || [])],
    next_commands: [...(entry.next_commands || [])],
    file_dependencies: [...(entry.file_dependencies || [])]
  }));
}

function findCommandContract(commandKey) {
  const normalized = normalizeCommandKey(commandKey);
  if (!normalized) return null;
  return getCommandRegistry().find((entry) => {
    if (normalizeCommandKey(entry.key) === normalized) return true;
    return (entry.aliases || []).some((alias) => normalizeCommandKey(alias) === normalized);
  }) || null;
}

function buildCommandRegistryTable(registry) {
  const rows = registry.map((entry) => [
    entry.key,
    entry.category,
    entry.stage,
    entry.owner,
    entry.purpose,
    (entry.next_commands || []).join(", ")
  ]);
  return table(["Command", "Category", "Stage", "Owner", "Purpose", "Next commands"], rows);
}

function buildCommandRegistryMarkdown(registry) {
  const rows = registry.map((entry) => `| ${entry.key} | ${entry.category} | ${entry.stage} | ${entry.owner} | ${entry.purpose} | ${(entry.next_commands || []).join("; ")} |`);
  return [
    "# KVDF AI and CLI Operating Contract",
    "",
    "## Command Registry",
    "",
    "| Command | Category | Stage | Owner | Purpose | Next commands |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    ""
  ].join("\n");
}

function buildAiCliOperatingContractReport(state, options = {}) {
  const registry = getCommandRegistry();
  const command = options.commandKey ? findCommandContract(options.commandKey) : null;
  const pipelineMatrix = Array.isArray(options.pipelineMatrix) ? options.pipelineMatrix : [];
  const blockedStage = pipelineMatrix.find((entry) => entry.status !== "pass") || null;
  const currentNextAction = blockedStage ? blockedStage.next_action : "All pipeline stages currently pass.";

  return {
    report_type: "kvdf_ai_cli_operating_contract",
    generated_at: new Date().toISOString(),
    report_path: "docs/reports/KVDF_AI_CLI_OPERATING_CONTRACT.md",
    role_split: {
      ai: "Reason over current state, choose the next CLI command, and stay inside the command contract.",
      cli: "Validate prerequisites, persist state, write artifacts, and fail closed when something is missing.",
      state: "Filesystem state under .kabeeri/ and docs/reports/ is the source of truth."
    },
    operating_principles: [
      "AI reads state, CLI enforces the gate, and files record the result.",
      "No command should silently guess or auto-skip a missing prerequisite.",
      "Every write command must explain what it needs and what it produced.",
      "The next exact action should always be available in the report.",
      "Blocked paths are useful if they say why they blocked and what to do next."
    ],
    session_state: {
      workspace_exists: Boolean(state && state.workspace_exists),
      current_delivery_mode: (state && state.current_delivery_mode) || null,
      current_blueprint: (state && state.current_blueprint) || null,
      questionnaire_plan_id: (state && state.current_questionnaire_plan && (state.current_questionnaire_plan.plan_id || state.current_questionnaire_plan.current_plan_id)) || null,
      approved_or_ready_tasks: (state && state.approved_or_ready_total) || 0,
      packet_traceability_complete: Boolean(state && state.packet_traceability_complete),
      pipeline_next_action: currentNextAction
    },
    selected_command: command,
    command_registry_total: registry.length,
    command_registry: registry,
    pipeline_summary: pipelineMatrix,
    next_exact_action: currentNextAction,
    command_contract_summary: command
  };
}

function formatNextExactAction(nextExactAction) {
  const value = String(nextExactAction || "").trim();
  return `Next exact action: ${value || "none"}`;
}

module.exports = {
  buildAiCliOperatingContractReport,
  buildCommandRegistryMarkdown,
  buildCommandRegistryTable,
  findCommandContract,
  formatNextExactAction,
  getCommandRegistry
};
