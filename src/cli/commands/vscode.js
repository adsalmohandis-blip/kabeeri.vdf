const fs = require("fs");
const path = require("path");
const { readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot } = require("../fs_utils");
const { table } = require("../ui");

function vscode(action, value, flags = {}) {
  if (!action || action === "status") {
    const files = [
      ".vscode/tasks.json",
      ".vscode/extensions.json",
      ".vscode/kvdf.commands.json",
      ".vscode/kvdf-extension/package.json",
      ".vscode/kvdf-extension/extension.js"
    ];
    console.log(table(["File", "Status"], files.map((file) => [file, fileExists(file) ? "present" : "missing"])));
    return;
  }

  if (action === "report") {
    const report = buildVscodeIntegrationReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderVscodeIntegrationReport(report);
    return;
  }

  if (action === "scaffold" || action === "init") {
    const force = Boolean(flags.force);
    writeJsonIfAllowed(".vscode/tasks.json", buildVscodeTasks(), force);
    writeJsonIfAllowed(".vscode/extensions.json", {
      recommendations: [],
      unwantedRecommendations: []
    }, force);
    writeJsonIfAllowed(".vscode/kvdf.commands.json", {
      version: 1,
      source: "kvdf vscode scaffold",
      commands: [
        { title: "KVDF: Help", command: "kvdf --help" },
        { title: "KVDF: Doctor", command: "kvdf doctor" },
        { title: "KVDF: Validate", command: "kvdf validate" },
        { title: "KVDF: Dashboard Export", command: "kvdf dashboard export" },
        { title: "KVDF: GitHub Dry Run", command: "kvdf github issue sync --version v4.0.0 --dry-run" },
        { title: "KVDF: GitHub Integration Report", command: "kvdf github report --json" },
        { title: "KVDF: VS Code Integration Report", command: "kvdf vscode report --json" }
      ]
    }, force);
    writeJsonIfAllowed(".vscode/kvdf-extension/package.json", buildVscodeExtensionPackage(), force);
    writeIfAllowed(".vscode/kvdf-extension/extension.js", buildVscodeExtensionJs(), force);
    writeIfAllowed(".vscode/kvdf-extension/README.md", buildVscodeExtensionReadme(), force);
    console.log("VS Code KVDF workspace files generated.");
    return;
  }

  throw new Error(`Unknown vscode action: ${action}`);
}

function buildVscodeExtensionPackage() {
  return {
    name: "kabeeri-vdf-local",
    displayName: "Kabeeri VDF Local",
    description: "Local VS Code panels for Kabeeri VDF workspace state.",
    version: "0.1.0",
    publisher: "kabeeri-local",
    engines: { vscode: "^1.80.0" },
    activationEvents: [
      "onCommand:kvdf.openDashboard",
      "onCommand:kvdf.openTasks",
      "onCommand:kvdf.openUsage",
      "onCommand:kvdf.syncGithub"
    ],
    main: "./extension.js",
    contributes: {
      commands: [
        { command: "kvdf.openDashboard", title: "KVDF: Open Dashboard" },
        { command: "kvdf.openTasks", title: "KVDF: Open Tasks" },
        { command: "kvdf.openUsage", title: "KVDF: Show Token Usage" },
        { command: "kvdf.syncGithub", title: "KVDF: GitHub Dry Run" }
      ]
    }
  };
}

function buildVscodeExtensionJs() {
  return `"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const vscode = require("vscode");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("kvdf.openDashboard", () => showPanel("dashboard")),
    vscode.commands.registerCommand("kvdf.openTasks", () => showPanel("tasks")),
    vscode.commands.registerCommand("kvdf.openUsage", () => showPanel("usage")),
    vscode.commands.registerCommand("kvdf.syncGithub", () => runKvdf("github issue sync --version v4.0.0 --dry-run"))
  );
}

function workspaceRoot() {
  const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
  return folder ? folder.uri.fsPath : process.cwd();
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(workspaceRoot(), relativePath), "utf8"));
  } catch (_) {
    return fallback;
  }
}

function showPanel(kind) {
  const panel = vscode.window.createWebviewPanel("kvdf." + kind, "KVDF " + kind, vscode.ViewColumn.One, { enableScripts: false });
  panel.webview.html = buildHtml(kind);
}

function buildHtml(kind) {
  const tasks = readJson(".kabeeri/tasks.json", { tasks: [] }).tasks || [];
  const usage = readJson(".kabeeri/ai_usage/usage_summary.json", { total_tokens: 0, total_cost: 0 });
  const technical = readJson(".kabeeri/dashboard/technical_state.json", {});
  const apps = readJson(".kabeeri/customer_apps.json", { apps: [] }).apps || [];
  const rows = kind === "tasks"
    ? tasks.map((item) => [item.id, item.title, item.status, item.assignee_id || ""])
    : kind === "usage"
      ? [["total", usage.total_tokens || 0, usage.total_cost || 0, usage.currency || "USD"]]
      : apps.map((item) => [item.username, item.name, item.status, "/customer/apps/" + item.username]);
  return "<!doctype html><html><head><meta charset=\\"utf-8\\"><style>body{font-family:Arial,sans-serif;padding:18px;color:#1f2933}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d9dee7;padding:8px;text-align:left}th{background:#eef2f7}code{background:#eef2f7;padding:2px 4px}</style></head><body>"
    + "<h1>KVDF " + escape(kind) + "</h1>"
    + "<p>Generated from local <code>.kabeeri</code> state. Dashboard generated at " + escape(technical.generated_at || "not generated") + ".</p>"
    + table(rows)
    + "</body></html>";
}

function table(rows) {
  if (!rows.length) return "<p>No records.</p>";
  return "<table><tbody>" + rows.map((row) => "<tr>" + row.map((cell) => "<td>" + escape(cell) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
}

function escape(value) {
  return String(value == null ? "" : value).replace(/[&<>\\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\"": "&quot;" }[char]));
}

function runKvdf(command) {
  const terminal = vscode.window.createTerminal("KVDF");
  terminal.show();
  terminal.sendText("kvdf " + command);
}

function deactivate() {}

module.exports = { activate, deactivate };
`;
}

function buildVscodeExtensionReadme() {
  return `# Kabeeri VDF Local VS Code Extension

This scaffold provides local VS Code command-palette panels for the current workspace:

- KVDF: Open Dashboard
- KVDF: Open Tasks
- KVDF: Show Token Usage
- KVDF: GitHub Dry Run

It reads from local \`.kabeeri\` state files and does not become the source of truth.
`;
}

function buildVscodeTasks() {
  return {
    version: "2.0.0",
    tasks: [
      vscodeShellTask("KVDF: Help", "kvdf --help"),
      vscodeShellTask("KVDF: Doctor", "kvdf doctor"),
      vscodeShellTask("KVDF: Validate", "kvdf validate"),
      vscodeShellTask("KVDF: Dashboard Export", "kvdf dashboard export"),
      vscodeShellTask("KVDF: GitHub Issue Dry Run", "kvdf github issue sync --version v4.0.0 --dry-run"),
      vscodeShellTask("KVDF: GitHub Integration Report", "kvdf github report --json"),
      vscodeShellTask("KVDF: VS Code Integration Report", "kvdf vscode report --json")
    ]
  };
}

function buildVscodeIntegrationReport(flags = {}) {
  const files = [
    ".vscode/tasks.json",
    ".vscode/extensions.json",
    ".vscode/kvdf.commands.json",
    ".vscode/kvdf-extension/package.json",
    ".vscode/kvdf-extension/extension.js",
    "plugins/vscode_extension/README.md",
    "plugins/vscode_extension/COMMAND_PALETTE_PLAN.md"
  ];
  const fileState = files.map((file) => ({
    file,
    status: fileExists(file) ? "present" : "missing"
  }));
  const commandPalette = fileExists(".vscode/kvdf.commands.json") ? readJsonFile(".vscode/kvdf.commands.json") : { commands: [] };
  const tasks = fileExists(".vscode/tasks.json") ? readJsonFile(".vscode/tasks.json") : { tasks: [] };
  const extensionPackage = fileExists(".vscode/kvdf-extension/package.json") ? readJsonFile(".vscode/kvdf-extension/package.json") : {};
  const report = {
    report_type: "vscode_integration_report",
    generated_at: new Date().toISOString(),
    source_of_truth: ".kabeeri",
    file_state: fileState,
    workspace_tasks: Array.isArray(tasks.tasks) ? tasks.tasks.length : 0,
    command_palette_entries: Array.isArray(commandPalette.commands) ? commandPalette.commands.length : 0,
    extension_commands: Array.isArray(extensionPackage.contributes && extensionPackage.contributes.commands) ? extensionPackage.contributes.commands.length : 0,
    activation_events: Array.isArray(extensionPackage.activationEvents) ? extensionPackage.activationEvents.length : 0,
    next_actions: buildVscodeIntegrationActions(fileState)
  };
  if (flags.json) return report;
  return report;
}

function renderVscodeIntegrationReport(report) {
  console.log("Kabeeri VS Code Integration Report");
  console.log(table(["Field", "Value"], [
    ["Workspace tasks", report.workspace_tasks],
    ["Command palette entries", report.command_palette_entries],
    ["Extension commands", report.extension_commands],
    ["Activation events", report.activation_events]
  ]));
  console.log("");
  console.log("Files:");
  for (const item of report.file_state) console.log(`- ${item.file}: ${item.status}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function buildVscodeIntegrationActions(fileState) {
  const actions = [];
  if (fileState.some((item) => item.status === "missing")) actions.push("Run `kvdf vscode scaffold` to materialize the missing editor bridge files.");
  else actions.push("The VS Code scaffold is present; use `kvdf vscode status` or `kvdf vscode report` to review it.");
  actions.push("Keep VS Code commands as thin wrappers over the CLI and `.kabeeri` state.");
  actions.push("Do not write project truth from the extension; keep Kabeeri as the source of truth.");
  return actions;
}

function vscodeShellTask(label, command) {
  return {
    label,
    type: "shell",
    command,
    group: "build",
    problemMatcher: []
  };
}

function writeIfAllowed(filePath, content, force) {
  const absolutePath = path.resolve(repoRoot(), filePath);
  if (fs.existsSync(absolutePath) && !force) return;
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function writeJsonIfAllowed(relativePath, data, force) {
  if (fileExists(relativePath) && !force) return;
  writeJsonFile(relativePath, data);
}

module.exports = {
  vscode
};
