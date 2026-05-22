const fs = require("fs");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..");
const roadmapPath = path.join(workspaceRoot, "docs", "roadmap", "KVDOS_V1_IMPLEMENTATION_PUNCH.md");
const taskMapPath = path.join(workspaceRoot, "docs", "roadmap", "KVDOS_V1_IMPLEMENTATION_TASK_MAP.md");

const implementationBaseline = {
  report_type: "kvdos_implementation_baseline",
  stage_id: "impl-0",
  stage_title: "Implementation Baseline And Guardrails",
  branch_name: "impl/impl-0-baseline-and-guardrails",
  suggested_pr_title: "impl-0: establish KVDOS v1 implementation baseline",
  status: "ready_for_impl_0_only",
  owner_approval_required: true
};

const allowedAreas = [
  "workspaces/apps/kvdos/src/**",
  "workspaces/apps/kvdos/tests/**",
  "workspaces/apps/kvdos/docs/**"
];

const forbiddenAreas = [
  "repo-root KVDF core files",
  "workspaces/apps/kvdos/.kabeeri/**",
  ".vscode/settings.json",
  "runtime",
  "SQLite",
  "cloud API",
  "execution",
  "packaging",
  "bridge",
  "marketplace",
  "enterprise",
  "Web3"
];

const validationCommands = [
  "git diff --check",
  "git status --short --untracked-files=all",
  "npm test",
  "npm run check"
];

const smokeValidationCommands = [
  "npm run impl:baseline -- --json",
  "npm run check"
];

const branchDiscipline = {
  required_branch: implementationBaseline.branch_name,
  next_slice_locked_until_merge: true,
  owner_approval_required_before_merge: true,
  no_shared_feature_branching: true
};

const implementationTracking = {
  scope: "app-local implementation baseline and guardrails",
  slice: implementationBaseline.stage_id,
  notes: [
    "Track only impl-0 work on the current branch.",
    "Do not widen scope to later slices or core runtime surfaces.",
    "Keep all guardrail checks app-local."
  ]
};

function pathExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function buildImplementationBaselineReport(options = {}) {
  return {
    ...implementationBaseline,
    current_branch: options.currentBranch || null,
    roadmap_ready: pathExists(roadmapPath),
    task_map_ready: pathExists(taskMapPath),
    allowed_areas: allowedAreas,
    forbidden_areas: forbiddenAreas,
    branch_discipline: branchDiscipline,
    validation_commands: validationCommands,
    smoke_validation_commands: smokeValidationCommands,
    implementation_tracking: implementationTracking,
    source_docs: {
      roadmap: path.relative(workspaceRoot, roadmapPath).replace(/\\/g, "/"),
      task_map: path.relative(workspaceRoot, taskMapPath).replace(/\\/g, "/")
    }
  };
}

function formatList(values = [], indent = "  - ") {
  return values.map((value) => `${indent}${value}`).join("\n");
}

function formatImplementationBaselineReport(report) {
  return [
    `KVDOS Implementation Baseline`,
    `Stage: ${report.stage_id} - ${report.stage_title}`,
    `Status: ${report.status}`,
    `Branch: ${report.branch_name}`,
    `Owner approval required: ${report.owner_approval_required ? "yes" : "no"}`,
    `Roadmap ready: ${report.roadmap_ready ? "yes" : "no"}`,
    `Task map ready: ${report.task_map_ready ? "yes" : "no"}`,
    "",
    "Allowed areas:",
    formatList(report.allowed_areas),
    "",
    "Forbidden areas:",
    formatList(report.forbidden_areas),
    "",
    "Branch discipline:",
    formatList(Object.entries(report.branch_discipline).map(([key, value]) => `${key}: ${value}`)),
    "",
    "Validation commands:",
    formatList(report.validation_commands),
    "",
    "Smoke validation commands:",
    formatList(report.smoke_validation_commands),
    "",
    "Implementation tracking:",
    formatList(report.implementation_tracking.notes),
    "",
    `Source roadmap: ${report.source_docs.roadmap}`,
    `Source task map: ${report.source_docs.task_map}`
  ].join("\n");
}

function formatImplementationBaselineHelp() {
  return [
    "KVDOS implementation baseline",
    "Usage: npm run impl:baseline -- [--json]",
    "",
    "Prints the impl-0 guardrail and tracking baseline.",
    "This command does not implement product features."
  ].join("\n");
}

function main(argv = process.argv.slice(2)) {
  const wantsJson = argv.includes("--json");
  const wantsHelp = argv.includes("--help") || argv.includes("-h") || argv[0] === "help";
  if (wantsHelp) {
    process.stdout.write(`${formatImplementationBaselineHelp()}\n`);
    return { help: true };
  }
  const report = buildImplementationBaselineReport({ currentBranch: process.env.GIT_BRANCH || null });
  if (wantsJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatImplementationBaselineReport(report)}\n`);
  }
  return report;
}

if (require.main === module) {
  main();
}

module.exports = {
  allowedAreas,
  branchDiscipline,
  buildImplementationBaselineReport,
  forbiddenAreas,
  formatImplementationBaselineHelp,
  formatImplementationBaselineReport,
  implementationBaseline,
  implementationTracking,
  main,
  smokeValidationCommands,
  validationCommands
};
