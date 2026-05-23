const assert = require("assert");
const { pathToFileURL } = require("url");

const { createWorkspaceModel, formatWorkspaceModelHelp, formatWorkspaceModelState, main, acceptedWorkspaceKinds } = require("../src/workspace_model");
const { createStudioShell } = require("../src/studio");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function captureStdout(fn) {
  const original = process.stdout.write;
  let output = "";
  process.stdout.write = (chunk) => {
    output += String(chunk);
    return true;
  };
  try {
    const value = fn();
    return { output, value };
  } finally {
    process.stdout.write = original;
  }
}

test("impl-3 workspace model exposes workspace-first boundaries by default", () => {
  const model = createWorkspaceModel();

  assert.strictEqual(model.report_type, "kvdos_workspace_model");
  assert.strictEqual(model.stage_id, "impl-3");
  assert.strictEqual(model.stage_title, "Workspace-Based IDE Model");
  assert.strictEqual(model.surface, "workspace-model");
  assert.strictEqual(model.selected_workspace, null);
  assert.strictEqual(model.workspace_context.active, false);
  assert.strictEqual(model.visibility.normal_user_view, "opened_workspace_or_application_only");
  assert.strictEqual(model.visibility.internal_product_files_hidden_by_default, true);
  assert.strictEqual(model.visibility.repo_root_kvdf_core_files_hidden, true);
  assert.strictEqual(model.visibility.developer_mode_future_only, true);
  assert.strictEqual(model.visibility.internal_mode_future_only, true);
  assert.deepStrictEqual(model.workspace_contract.accepted_kinds, acceptedWorkspaceKinds);
  assert.ok(model.workspace_contract.prepared_followup_slices.includes("impl-4 Open Folder / Open Workspace Flow"));
  assert.ok(model.workspace_contract.prepared_followup_slices.includes("impl-6 Selected Workspace Context"));
});

test("impl-3 workspace model can represent a selected application workspace", () => {
  const model = createWorkspaceModel({
    selectedWorkspaceId: "atlas-studio",
    selectedWorkspaceLabel: "Atlas Studio",
    selectedWorkspaceKind: "application"
  });

  assert.ok(model.selected_workspace);
  assert.strictEqual(model.selected_workspace.id, "atlas-studio");
  assert.strictEqual(model.selected_workspace.label, "Atlas Studio");
  assert.strictEqual(model.selected_workspace.kind, "application");
  assert.strictEqual(model.selected_workspace.opened_folder, false);
  assert.strictEqual(model.selected_workspace.user_owned, true);
  assert.strictEqual(model.selected_workspace.internal_files_hidden, true);
  assert.strictEqual(model.workspace_context.active, true);
  assert.strictEqual(model.workspace_context.selected_workspace_label, "Atlas Studio");
  assert.strictEqual(model.workspace_context.selected_workspace_kind, "application");
  assert.strictEqual(model.workspace_context.selected_workspace_visibility, "workspace_first");
});

test("impl-3 workspace model formatting and CLI help stay explicit", () => {
  const formatted = formatWorkspaceModelState(createWorkspaceModel({ selectedWorkspaceLabel: "Atlas Studio" }));
  const help = captureStdout(() => main(["--help"]));
  const json = captureStdout(() => main(["--json", "--workspace", "Atlas Studio", "--kind", "application"]));

  assert.match(formatted, /Workspace-Based IDE Model/);
  assert.match(formatted, /workspace-first/);
  assert.match(formatted, /Internal files hidden by default: yes/);
  assert.match(formatted, /This workspace model is contract-only/);
  assert.match(help.output, /Usage: node src\/workspace_model\.js/);
  assert.match(help.output, /does not open folders, persist state, or expose internal product files/i);
  assert.match(json.output, /"surface": "workspace-model"/);
  assert.match(json.output, /"selected_workspace_label": "Atlas Studio"/);
  assert.match(formatWorkspaceModelHelp(), /workspace-first model and boundary rules/i);
});

test("impl-3 workspace model stays free of hard-coded repo paths", async () => {
  const modelPath = pathToFileURL(require("path").join(__dirname, "..", "src", "workspace_model.js")).href;
  const module = await import(modelPath);
  const model = module.createWorkspaceModel({ selectedWorkspaceLabel: "Atlas Studio" });
  const serialized = JSON.stringify(model);

  assert.strictEqual(serialized.includes("kabeeri.vdf"), false);
  assert.strictEqual(serialized.includes("workspaces/apps/kvdos"), false);
  assert.strictEqual(serialized.includes(".vscode/settings.json"), false);
  assert.strictEqual(serialized.includes(".kabeeri"), false);
});

test("impl-3 workspace model is wired into the studio helper", () => {
  const shell = createStudioShell();

  assert.ok(shell.workspace_model);
  assert.strictEqual(shell.workspace_model.stage_id, "impl-3");
  assert.strictEqual(shell.workspace_model.visibility.internal_product_files_hidden_by_default, true);
  assert.strictEqual(shell.workspace_model.workspace_context.active, false);
});

let failed = 0;
for (const item of tests) {
  try {
    item.fn();
    console.log(`OK ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${item.name}`);
    console.error(error.stack || error.message);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} impl-3 workspace tests passed.`);
}
