const { parseCliArgs, toBoolean } = require("./lib/command_args");

const acceptedWorkspaceKinds = ["workspace", "application", "opened_folder"];
const preparedStudioSlices = [
  "impl-4 Open Folder / Open Workspace Flow",
  "impl-5 Recent Workspaces + Project Registry",
  "impl-6 Selected Workspace Context"
];

function normalizeWorkspaceKind(value) {
  const normalized = String(value || "workspace").trim().toLowerCase();
  return acceptedWorkspaceKinds.includes(normalized) ? normalized : "workspace";
}

function createWorkspaceModel(options = {}) {
  const selectedWorkspaceLabel = options.selectedWorkspaceLabel || options.workspace || null;
  const selectedWorkspaceKind = normalizeWorkspaceKind(options.selectedWorkspaceKind || options.kind);
  const selectedWorkspaceId = options.selectedWorkspaceId || selectedWorkspaceLabel || null;
  const hasSelection = Boolean(selectedWorkspaceLabel || selectedWorkspaceId);
  const selectedWorkspace = hasSelection
    ? {
        id: selectedWorkspaceId,
        label: selectedWorkspaceLabel || selectedWorkspaceId,
        kind: selectedWorkspaceKind,
        opened_folder: selectedWorkspaceKind === "opened_folder",
        user_owned: true,
        internal_files_hidden: true,
        visibility: "workspace_first"
      }
    : null;

  return {
    report_type: "kvdos_workspace_model",
    stage_id: "impl-3",
    stage_title: "Workspace-Based IDE Model",
    title: "Workspace-Based IDE Model",
    surface: "workspace-model",
    purpose: "Define KVDOS Studio as a workspace-first IDE with hidden internal product files and selected workspace context.",
    workspace_contract: {
      accepted_kinds: acceptedWorkspaceKinds,
      default_mode: "workspace_first",
      supported_contexts: ["selected_workspace", "recent_workspaces", "open_workspace"],
      prepared_followup_slices: preparedStudioSlices
    },
    visibility: {
      normal_user_view: "opened_workspace_or_application_only",
      internal_product_files_hidden_by_default: true,
      repo_root_kvdf_core_files_hidden: true,
      developer_mode_future_only: true,
      internal_mode_future_only: true
    },
    boundary: {
      no_hardcoded_repo_paths: true,
      no_single_project_assumption: true,
      no_runtime_behavior: true,
      no_persistence_behavior: true
    },
    selected_workspace: selectedWorkspace,
    workspace_context: {
      active: hasSelection,
      selected_workspace_label: selectedWorkspace ? selectedWorkspace.label : null,
      selected_workspace_kind: selectedWorkspace ? selectedWorkspace.kind : null,
      selected_workspace_visibility: selectedWorkspace ? selectedWorkspace.visibility : "workspace_first",
      normal_user_view: "opened_workspace_or_application_only"
    }
  };
}

function formatWorkspaceModelState(model = createWorkspaceModel()) {
  const selected = model.selected_workspace
    ? `${model.selected_workspace.label} (${model.selected_workspace.kind})`
    : "none";
  return [
    `Surface: ${model.surface}`,
    `Stage: ${model.stage_id} - ${model.stage_title}`,
    `Title: ${model.title}`,
    `Purpose: ${model.purpose}`,
    `Selected workspace: ${selected}`,
    `Normal user view: ${model.visibility.normal_user_view}`,
    `Internal files hidden by default: ${model.visibility.internal_product_files_hidden_by_default ? "yes" : "no"}`,
    `Developer mode future only: ${model.visibility.developer_mode_future_only ? "yes" : "no"}`,
    `Internal mode future only: ${model.visibility.internal_mode_future_only ? "yes" : "no"}`,
    `Prepared follow-up slices: ${model.workspace_contract.prepared_followup_slices.join(", ")}`,
    "This workspace model is contract-only and does not open folders or persist state."
  ].join("\n");
}

function formatWorkspaceModelHelp() {
  return [
    "KVDOS workspace:model",
    "Usage: node src/workspace_model.js [--json] [--workspace <name>] [--kind <workspace|application|opened_folder>]",
    "",
    "Prints the impl-3 workspace-first model and boundary rules.",
    "This command does not open folders, persist state, or expose internal product files."
  ].join("\n");
}

function main(argv = process.argv.slice(2)) {
  const { command, flags } = parseCliArgs(argv);
  if (command === "help" || flags.help) {
    process.stdout.write(`${formatWorkspaceModelHelp()}\n`);
    return { help: true };
  }

  const model = createWorkspaceModel({
    selectedWorkspaceId: flags.id || null,
    selectedWorkspaceLabel: flags.workspace || flags.label || null,
    selectedWorkspaceKind: flags.kind || null,
    internalMode: toBoolean(flags["internal-mode"])
  });

  if (toBoolean(flags.json)) {
    process.stdout.write(`${JSON.stringify(model, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatWorkspaceModelState(model)}\n`);
  }
  return model;
}

if (require.main === module) {
  main();
}

module.exports = {
  acceptedWorkspaceKinds,
  createWorkspaceModel,
  formatWorkspaceModelHelp,
  formatWorkspaceModelState,
  main,
  normalizeWorkspaceKind,
  preparedStudioSlices
};
