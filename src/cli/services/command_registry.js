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
    key: "wifi-data-sharing",
    aliases: ["wifi_data_sharing", "wifidata", "wifi-share"],
    category: "integration",
    stage: "local-network",
    owner: "shared",
    purpose: "Manage local Wi-Fi/LAN node identity, policy visibility, discovery, pairing, trusted nodes, bounded package transfer, inbox review, apply bridge records, release readiness, backups, integrity checks, dashboard visibility, audit traces, evidence summaries, and local simulation/stress verification for trusted KVDF/KVDOS nodes.",
    prerequisites: ["The wifi_data_sharing plugin exists and can read or create its state file."],
    outputs: ["Local node identity", "discovery status", "candidate list", "pairing sessions", "trusted node registry", "apply bridge records", "release readiness report", "integrity report", "backup snapshots", "provider status", "readiness report", "dashboard report", "audit report", "evidence summary", "simulation report", "package inbox", "package outbox", "transfer sessions", "package catalog", "transfer log", "policy posture", "security policy results", "quarantine review state"],
    next_commands: ["kvdf wifi-data-sharing status", "kvdf wifi-data-sharing init", "kvdf wifi-data-sharing discover", "kvdf wifi-data-sharing provider", "kvdf wifi-data-sharing readiness", "kvdf wifi-data-sharing dashboard", "kvdf wifi-data-sharing audit", "kvdf wifi-data-sharing evidence", "kvdf wifi-data-sharing apply", "kvdf wifi-data-sharing applied", "kvdf wifi-data-sharing health", "kvdf wifi-data-sharing release report", "kvdf wifi-data-sharing backup create", "kvdf wifi-data-sharing backup restore <backup-id>", "kvdf wifi-data-sharing integrity check", "kvdf wifi-data-sharing simulate two-node", "kvdf wifi-data-sharing simulate transfer --size 1024", "kvdf wifi-data-sharing simulate security", "kvdf wifi-data-sharing pairing create", "kvdf wifi-data-sharing pairing verify", "kvdf wifi-data-sharing trust", "kvdf wifi-data-sharing trusted", "kvdf wifi-data-sharing candidates", "kvdf wifi-data-sharing policy", "kvdf wifi-data-sharing package create", "kvdf wifi-data-sharing send", "kvdf wifi-data-sharing inbox", "kvdf wifi-data-sharing outbox", "kvdf wifi-data-sharing transfer sessions", "kvdf wifi-data-sharing transfers", "kvdf wifi-data-sharing security check", "kvdf wifi-data-sharing security results", "kvdf wifi-data-sharing quarantine", "kvdf wifi-data-sharing server start", "kvdf wifi-data-sharing server status"],
    file_dependencies: [".kabeeri/wifi_data_sharing.json", ".kabeeri/wifi_data_discovery.jsonl", ".kabeeri/wifi_data_packages.json", ".kabeeri/wifi_data_inbox.json", ".kabeeri/wifi_data_outbox.json", ".kabeeri/wifi_transfer_sessions.json", ".kabeeri/wifi_data_applied.json", ".kabeeri/wifi_data_apply_events.jsonl", ".kabeeri/wifi_data_release_report.json", ".kabeeri/wifi_data_integrity.json", ".kabeeri/wifi_data_transfers.jsonl", ".kabeeri/wifi_transfer_policy_results.json", ".kabeeri/wifi_data_quarantine.json", ".kabeeri/reports/wifi_data_sharing_provider.json", ".kabeeri/reports/wifi_data_sharing_readiness.json", ".kabeeri/reports/wifi_data_sharing_dashboard.json", ".kabeeri/reports/wifi_data_sharing_audit.json"],
    ai_role: "Use local Wi-Fi/LAN state to inspect candidates and policy without granting trust or transferring data.",
    cli_role: "Route all Wi-Fi data sharing operations through the removable plugin and keep Core thin."
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
    aliases: ["maintainability report", "maintenance", "maintenance report", "cleaner", "cleanup", "cleaner report"],
    category: "governance",
    stage: "assessment",
    owner: "shared",
    purpose: "Expose the shared-service extraction scorecard, live maintainability state, repo-wide cleanup workflow, fast and slow maintenance modes, file-by-file maintenance inspection path, and relocation plan for mislocated files and folders.",
    prerequisites: ["Workspace or report state can be read."],
    outputs: ["Maintainability report", "cleanup summary", "maintenance inspection", "maintenance relocation", "shared-service inventory", "cleanup audit", "live JSON state", "fast maintenance audit", "slow maintenance audit"],
    next_commands: ["kvdf maintenance fast", "kvdf maintenance slow", "kvdf cleaner inspect", "kvdf cleaner relocate review", "kvdf cleaner relocate", "kvdf cleaner report", "kvdf pipeline strict", "kvdf cleaner cleanup", "kvdf cleaner approve --confirm"],
    file_dependencies: [".kabeeri/reports/maintainability.json", ".kabeeri/reports/kabeeri_scorecards.json", ".kabeeri/reports/kvdf_maintenance_inspection.json", ".kabeeri/reports/kvdf_maintenance_relocation.json"],
    ai_role: "Use the maintainability report to see which runtime helpers were extracted, then choose fast or slow maintenance mode before reviewing the inspection and relocation plan.",
    cli_role: "Persist the maintainability snapshot, fast or slow cleanup workflow, file-by-file inspection, relocation plan, and cleanup execution state."
  },
  {
    key: "vibe-maintainer",
    aliases: ["vibe maintainer", "vibe_maintainer", "maintainer", "vibe-maintenance"],
    category: "governance",
    stage: "workspace-maintenance",
    owner: "app-or-owner",
    purpose: "Inspect and maintain vibe developer app workspaces with fast and slow modes, scope selection, safe relocation review, approval, execution, and finalization.",
    prerequisites: ["At least one app workspace exists or can be discovered."],
    outputs: ["Workspace maintenance audit", "workspace inspection", "workspace relocation review", "maintenance summary"],
    next_commands: ["kvdf vibe-maintainer cleanup", "kvdf vibe-maintainer inspect", "kvdf vibe-maintainer report", "kvdf vibe-maintainer relocate", "kvdf vibe-maintainer approve", "kvdf vibe-maintainer execute", "kvdf vibe-maintainer finalize"],
    file_dependencies: [".kabeeri/reports/vibe_maintainer_audit.json", ".kabeeri/reports/vibe_maintainer_summary.json", ".kabeeri/reports/vibe_maintainer_inspection.json", ".kabeeri/reports/vibe_maintainer_relocation.json"],
    ai_role: "Use the workspace maintenance report to decide whether to clean one app workspace or all app workspaces before applying any relocation plan.",
    cli_role: "Persist scope-aware workspace maintenance state, reports, and lifecycle transitions."
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
