const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { buildDashboardContracts, validateDashboardContracts } = require("../src/cli/services/dashboard_contract");
const { buildAiCliOperatingContractReport, findCommandContract, getCommandRegistry } = require("../src/cli/services/command_registry");
const { buildPluginLoaderReport } = require("../src/cli/services/plugin_loader");
const { suggestCommand } = require("../src/cli/services/command_suggestions");
const { capitalize, isExpired, matchesAny, parseCsv, uniqueBy, uniqueList } = require("../src/cli/services/collections");
const { getCoverageAction, normalizeAnswerValue, inferAnswerConfidence } = require("../src/cli/services/questionnaire");
const { buildEvolutionScorecards } = require("../src/cli/services/evolution");
const { buildSessionHandoff } = require("../src/cli/services/session_handoff");
const { classifyWorkspaceBoundaryPath, summarizeWorkspaceBoundary, validateDeveloperAppWorkspace } = require("../src/cli/services/app_workspace_contract");
const { objectLines, recordLines } = require("../src/cli/services/report_output");
const { policyReportItem, taskReportItem } = require("../src/cli/services/report_items");
const { appendJsonLine, readJsonLines, writeJsonLines } = require("../src/cli/services/jsonl");
const { readStateArray, summarizeBy } = require("../src/cli/services/state_utils");
const { buildLocalServerSkipMessage, shouldStartLocalServer } = require("../src/cli/services/local_server");
const { detectLanguage, matchesWords, resolveOutputLanguage } = require("../src/cli/services/text");
const { buildBootContext } = require("../src/core/bootstrap");
const { serveSite } = require("../src/cli/commands/site");
const {
  getGitChangedFileDetails,
  readGitStatus,
  shouldUseLocalGitSnapshot
} = require("../src/cli/services/git_snapshot");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-service-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("dashboard contracts expose workspace, technical, business, and tracker checks", () => {
  const state = {
    workspace: {
      name: "Kabeeri",
      repo_root: "D:/repo",
      live_dashboard: { private_dashboard: "/__kvdf/dashboard" }
    },
    technical: {
      generated_at: "2026-05-12T00:00:00.000Z",
      tasks: {},
      ai_usage: {}
    },
    business: {
      generated_at: "2026-05-12T00:00:00.000Z",
      customer_apps: [],
      features: []
    },
    records: {
      tasks: [],
      evolution_summary: {},
      generated_at: "2026-05-12T00:00:00.000Z"
    },
    task_tracker: {
      generated_at: "2026-05-12T00:00:00.000Z",
      summary: {},
      tasks: []
    }
  };

  const contracts = buildDashboardContracts(state);
  assert.strictEqual(contracts.dashboard.ok, true);
  assert.strictEqual(contracts.task_tracker.ok, true);
  const validation = validateDashboardContracts(state);
  assert.strictEqual(validation.ok, true);
  assert.deepStrictEqual(validation.failures, []);
});

test("dashboard contracts reject missing core sections", () => {
  const validation = validateDashboardContracts({ workspace: {}, technical: {}, business: {}, records: {}, task_tracker: {} });
  assert.strictEqual(validation.ok, false);
  assert.ok(validation.failures.includes("dashboard contract failed"));
  assert.ok(validation.failures.includes("task tracker contract failed"));
});

test("command registry exposes the AI/CLI contract and core command stages", () => {
  const registry = getCommandRegistry();
  assert.ok(Array.isArray(registry));
  assert.ok(registry.length >= 10);
  const contract = findCommandContract("contract");
  assert.ok(contract);
  assert.strictEqual(contract.stage, "control-plane");
  assert.ok(contract.next_commands.includes("kvdf resume"));
  const scorecards = findCommandContract("scorecards");
  assert.ok(scorecards);
  assert.strictEqual(scorecards.stage, "assessment");
  assert.ok(scorecards.next_commands.includes("kvdf contract"));
  const maintainability = findCommandContract("maintainability");
  assert.ok(maintainability);
  assert.strictEqual(maintainability.stage, "assessment");
  assert.ok(maintainability.next_commands.includes("kvdf pipeline strict"));
  const report = buildAiCliOperatingContractReport({
    workspace_exists: true,
    current_delivery_mode: "agile",
    current_blueprint: "ecommerce",
    current_questionnaire_plan: { plan_id: "plan-001" },
    approved_or_ready_total: 2,
    packet_traceability_complete: true
  }, {
    commandKey: "task-packet",
    pipelineMatrix: [
      { status: "pass", next_action: "Proceed." },
      { status: "pass", next_action: "Proceed." }
    ]
  });
  assert.strictEqual(report.report_type, "kvdf_ai_cli_operating_contract");
  assert.strictEqual(report.selected_command.key, "task-packet");
  assert.strictEqual(report.next_exact_action, "All pipeline stages currently pass.");
  assert.ok(report.next_exact_action.length > 0);
});

test("evolution scorecards build a review-only scorecard report", () => {
  const state = {
    changes: [],
    impact_plans: [],
    development_priorities: [],
    deferred_ideas: [],
    scorecards: []
  };
  const report = buildEvolutionScorecards(state);
  assert.strictEqual(report.report_type, "kabeeri_scorecards");
  assert.strictEqual(report.scorecards.length, 6);
  assert.ok(report.scorecards.every((card) => Array.isArray(card.impacted_areas) && card.impacted_areas.length > 0));
  assert.ok(report.summary.average_score > 0);
  assert.ok(Array.isArray(report.scorecard_plans));
  assert.strictEqual(report.scorecard_plans.length, 0);
  assert.ok(Array.isArray(report.scorecard_tasks));
  assert.strictEqual(report.scorecard_tasks.length, 0);
  assert.ok(report.next_actions.some((item) => item.includes("standalone evaluation artifact")));
});

test("bootstrap context exposes a deterministic boot path and reversible plugin loader", () => {
  const boot = buildBootContext();
  assert.strictEqual(boot.report_type, "kvdf_bootstrap_context");
  assert.deepStrictEqual(boot.boot_path, [
    "bin/kvdf.js",
    "src/core/bootstrap.js",
    "src/cli/index.js"
  ]);
  assert.strictEqual(boot.single_boot_entry, "bin/kvdf.js");
  assert.strictEqual(boot.loader_strategy, "manifest_driven_reversible_plugins");
  assert.strictEqual(boot.runtime_split.boot_entry, "bin/kvdf.js");
  assert.strictEqual(boot.runtime_split.shared_runtime_entry, "src/cli/index.js");
  assert.strictEqual(boot.runtime_split.track_boundaries.control_plane, "bin/kvdf.js");
  assert.strictEqual(boot.runtime_split.track_boundaries.shared_runtime, "src/cli/index.js");
  assert.strictEqual(boot.runtime_split.track_boundaries.plugin_runtime_root, "plugins/kvdf-dev/");
  assert.strictEqual(boot.shared_runtime.status, "ready");
  assert.ok(Array.isArray(boot.plugin_loader.plugins));
  assert.ok(boot.plugin_loader.plugins.some((item) => item.plugin_id === "kvdf-dev"));
  assert.ok(boot.reversible_plugins.includes("kvdf-dev"));
});

test("plugin loader surfaces bundle contracts for installed plugin bundles", () => {
  const report = buildPluginLoaderReport();
  const ecommerce = report.plugins.find((item) => item.plugin_id === "ecommerce-builder");
  assert.ok(ecommerce);
  assert.ok(ecommerce.bundle_contract);
  assert.strictEqual(ecommerce.bundle_contract.status, "ready");
  assert.ok(Array.isArray(ecommerce.bundle_contract.required_folders));
  assert.ok(ecommerce.bundle_contract.required_folders.includes("docs"));
  assert.ok(ecommerce.bundle_contract.next_exact_action.length > 0);
});

test("questionnaire helpers normalize answers and confidence", () => {
  assert.strictEqual(normalizeAnswerValue("  Maybe Later  "), "maybe_later");
  assert.strictEqual(inferAnswerConfidence("maybe"), "low");
  assert.strictEqual(inferAnswerConfidence("yes"), "confirmed");
});

test("coverage actions describe the follow-up behavior", () => {
  assert.match(getCoverageAction("required", { question_group: "UI decisions" }), /Ask UI decisions questions/);
  assert.match(getCoverageAction("deferred", { question_group: "UI decisions" }), /future roadmap/);
  assert.match(getCoverageAction("unknown", { question_group: "UI decisions" }), /follow-up questions/);
});

test("text helpers match words and resolve output language from project state", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
      fs.writeFileSync(path.join(dir, ".kabeeri", "project.json"), JSON.stringify({ language: "fr" }), "utf8");

      assert.strictEqual(matchesWords("Hello world", ["world"]), true);
      assert.strictEqual(matchesWords("Hello world", ["planet"]), false);
      assert.strictEqual(detectLanguage("مرحبا"), "ar");
      assert.strictEqual(detectLanguage("Hello"), "en");
      assert.strictEqual(resolveOutputLanguage({}, "Hello"), "fr");
      assert.strictEqual(resolveOutputLanguage({ language: "es" }, "Hello"), "es");
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("collections helpers parse csv and de-duplicate items", () => {
  assert.deepStrictEqual(parseCsv("alpha, beta, gamma"), ["alpha", "beta", "gamma"]);
  assert.deepStrictEqual(parseCsv(["alpha, beta", "gamma", ["delta", "alpha"]]), ["alpha", "beta", "gamma", "delta"]);
  assert.deepStrictEqual(uniqueList(["a", "b", "", "a", null, "c"]), ["a", "b", "c"]);
  assert.deepStrictEqual(uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], "id"), [{ id: 1 }, { id: 2 }]);
  assert.strictEqual(matchesAny("src/app/page.tsx", ["src/app/"]), true);
  assert.strictEqual(matchesAny("src/app/page.tsx", ["src/*/page.tsx"]), true);
  assert.strictEqual(matchesAny("src/lib/index.ts", ["src/app/"]), false);
  assert.strictEqual(isExpired(new Date(Date.now() - 1000).toISOString()), true);
  assert.strictEqual(isExpired(new Date(Date.now() + 60_000).toISOString()), false);
  assert.strictEqual(capitalize("kabeeri"), "Kabeeri");
});

test("command suggestions provide close matches for unknown commands", () => {
  assert.match(suggestCommand("evolutio"), /Did you mean "evolution"/);
  assert.strictEqual(suggestCommand("zzzzzz"), "");
});

test("git snapshot helpers read local workspace state without spawning git", () => {
  const previousValue = process.env.KVDF_DISABLE_GIT_SPAWN;
  process.env.KVDF_DISABLE_GIT_SPAWN = "1";
  withTempDir((dir) => {
    fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(dir, "node_modules"), { recursive: true });
    fs.mkdirSync(path.join(dir, ".kabeeri", "interactions"), { recursive: true });
    fs.writeFileSync(path.join(dir, "changed.txt"), "changed", "utf8");
    fs.writeFileSync(path.join(dir, ".kabeeri", "interactions", "ignored.json"), "{}", "utf8");

    assert.strictEqual(shouldUseLocalGitSnapshot(), true);
    const details = getGitChangedFileDetails(dir);
    assert.strictEqual(details.length, 1);
    assert.strictEqual(details[0].file, "changed.txt");
    assert.strictEqual(details[0].status, "??");

    const status = readGitStatus(dir);
    assert.strictEqual(status.changed_files, 1);
    assert.ok(status.entries.some((entry) => entry.includes("changed.txt")));
  });
  if (previousValue === undefined) delete process.env.KVDF_DISABLE_GIT_SPAWN;
  else process.env.KVDF_DISABLE_GIT_SPAWN = previousValue;
});

test("session handoff helper renders a resumable markdown report", () => {
  const markdown = buildSessionHandoff({
    session_id: "session-001",
    task_id: "task-123",
    developer_id: "dev-1",
    provider: "openai",
    model: "gpt-5",
    started_at: "2026-05-12T10:00:00.000Z",
    ended_at: "2026-05-12T10:30:00.000Z",
    summary: "Implemented the change.",
    files_touched: ["src/app.js"],
    checks_run: ["npm test"],
    risks: ["Minor regression risk"],
    known_limitations: ["Needs follow-up"],
    needs_review: "Owner review",
    next_suggested_task: "Run follow-up validation",
    input_tokens: 120,
    output_tokens: 60,
    cached_tokens: 10,
    total_tokens: 190,
    cost: 1.25
  });

  assert.match(markdown, /AI Session Handoff - session-001/);
  assert.match(markdown, /## Summary/);
  assert.match(markdown, /src\/app\.js/);
  assert.match(markdown, /Input tokens: 120/);
  assert.match(markdown, /Cost: 1.25/);
});

test("state helpers read arrays and summarize values", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
      fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({ tasks: [{ status: "open" }, { status: "open" }, { status: "done" }] }), "utf8");

      assert.deepStrictEqual(readStateArray(".kabeeri/tasks.json", "tasks"), [{ status: "open" }, { status: "open" }, { status: "done" }]);
      assert.deepStrictEqual(summarizeBy([{ status: "open" }, { status: "done" }, {}], "status"), { open: 1, done: 1, unknown: 1 });
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("report output helpers format object and record lines", () => {
  assert.deepStrictEqual(objectLines({ a: 1, b: "two" }), ["- a: 1", "- b: two"]);
  assert.deepStrictEqual(recordLines([{ id: 1 }], (item) => `item-${item.id}`), ["- item-1"]);
  assert.deepStrictEqual(recordLines([], (item) => item), ["None."]);
});

test("report item helpers normalize task and policy records", () => {
  assert.deepStrictEqual(taskReportItem({ id: "task-1", title: "Do it", status: "open", workstreams: ["docs"], assignee_id: null }), {
    id: "task-1",
    title: "Do it",
    status: "open",
    workstreams: ["docs"],
    assignee_id: ""
  });
  assert.deepStrictEqual(policyReportItem({ policy_id: "p1", subject_type: "task", subject_id: "task-1", status: "blocked", evaluated_at: "2026-05-12" }), {
    policy_id: "p1",
    subject_type: "task",
    subject_id: "task-1",
    status: "blocked",
    evaluated_at: "2026-05-12"
  });
});

test("workspace boundary classifier distinguishes allowed, linked, and blocked paths", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      fs.mkdirSync(path.join(dir, "workspaces", "apps", "storefront-web", ".kabeeri"), { recursive: true });
      fs.mkdirSync(path.join(dir, "workspaces", "apps", "storefront-web", "src"), { recursive: true });
      fs.writeFileSync(path.join(dir, "workspaces", "apps", "storefront-web", ".kabeeri", "workspace.json"), JSON.stringify({
        workspace_contract_version: "v1",
        workspace_kind: "developer_app",
        app_slug: "storefront-web",
        app_name: "Storefront Web",
        app_type: "frontend",
        surface_scopes: ["website"],
        linked_workspace_roots: [path.join(dir, "shared-design")],
        root: "workspaces/apps/storefront-web"
      }, null, 2), "utf8");
      fs.writeFileSync(path.join(dir, "workspaces", "apps", "storefront-web", ".kabeeri", "project.json"), JSON.stringify({
        workspace_kind: "developer_app",
        app_slug: "storefront-web",
        app_type: "frontend",
        surface_scopes: ["website"],
        linked_workspace_roots: [path.join(dir, "shared-design")],
        root: "workspaces/apps/storefront-web"
      }, null, 2), "utf8");
      const allowed = classifyWorkspaceBoundaryPath("src/index.js", "workspaces/apps/storefront-web");
      const linked = classifyWorkspaceBoundaryPath(path.join(dir, "shared-design", "spec.md"), "workspaces/apps/storefront-web", {
        linked_workspace_roots: [path.join(dir, "shared-design")]
      });
      const blocked = classifyWorkspaceBoundaryPath(path.join(dir, "other-project", "notes.md"), "workspaces/apps/storefront-web");
      assert.strictEqual(allowed.status, "allowed");
      assert.strictEqual(linked.status, "linked");
      assert.strictEqual(blocked.status, "blocked");

      const summary = summarizeWorkspaceBoundary(["src/index.js", path.join(dir, "shared-design", "spec.md"), path.join(dir, "other-project", "notes.md")], "workspaces/apps/storefront-web", {
        linked_workspace_roots: [path.join(dir, "shared-design")]
      });
      assert.strictEqual(summary.counts.allowed, 1);
      assert.strictEqual(summary.counts.linked, 1);
      assert.strictEqual(summary.counts.blocked, 1);

      const validation = validateDeveloperAppWorkspace("workspaces/apps/storefront-web");
      assert.ok(validation.boundary);
      assert.strictEqual(validation.boundary.counts.linked, 1);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("jsonl helper reads line-delimited records", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      fs.mkdirSync(path.join(dir, ".kabeeri", "reports"), { recursive: true });
      fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "items.jsonl"), `${JSON.stringify({ id: 1 })}\n${JSON.stringify({ id: 2 })}\n`, "utf8");
      assert.deepStrictEqual(readJsonLines(".kabeeri/reports/items.jsonl"), [{ id: 1 }, { id: 2 }]);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("jsonl helper appends and writes records", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      appendJsonLine(".kabeeri/reports/appended.jsonl", { id: 1 });
      appendJsonLine(".kabeeri/reports/appended.jsonl", { id: 2 });
      assert.deepStrictEqual(readJsonLines(".kabeeri/reports/appended.jsonl"), [{ id: 1 }, { id: 2 }]);

      writeJsonLines(".kabeeri/reports/written.jsonl", [{ id: 3 }, { id: 4 }]);
      assert.deepStrictEqual(readJsonLines(".kabeeri/reports/written.jsonl"), [{ id: 3 }, { id: 4 }]);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("local server helpers skip serve mode in non-interactive environments", () => {
  const previousCi = process.env.CI;
  process.env.CI = "true";
  withTempDir((dir) => {
    const result = serveSite(4177, {}, {
      repoRoot: () => dir,
      collectDashboardState: () => ({}),
      writeDashboardStateFiles: () => {},
      buildDashboardHtml: () => "<html></html>",
      refreshLiveReportsState: () => ({}),
      refreshAgileDashboardState: () => ({}),
      refreshStructuredDashboardState: () => ({}),
      normalizePublicUsername: () => {}
    });

    assert.strictEqual(shouldStartLocalServer({}), false);
    assert.strictEqual(result.report_type, "local_server_skipped");
    assert.match(result.message, /Use --force-server/);
    assert.match(buildLocalServerSkipMessage("Kabeeri docs site server"), /non-interactive mode/);
  });
  if (previousCi === undefined) delete process.env.CI;
  else process.env.CI = previousCi;
});
