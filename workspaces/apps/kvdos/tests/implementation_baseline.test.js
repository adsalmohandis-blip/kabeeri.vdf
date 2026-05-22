const assert = require("assert");

const {
  allowedAreas,
  branchDiscipline,
  buildImplementationBaselineReport,
  forbiddenAreas,
  formatImplementationBaselineHelp,
  formatImplementationBaselineReport,
  implementationBaseline,
  main,
  smokeValidationCommands,
  validationCommands
} = require("../src/implementation_baseline");

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

test("impl-0 baseline report exposes stage, branch, and readiness", () => {
  const report = buildImplementationBaselineReport({ currentBranch: "impl/impl-0-baseline-and-guardrails" });

  assert.strictEqual(report.report_type, "kvdos_implementation_baseline");
  assert.strictEqual(report.stage_id, "impl-0");
  assert.strictEqual(report.stage_title, implementationBaseline.stage_title);
  assert.strictEqual(report.branch_name, "impl/impl-0-baseline-and-guardrails");
  assert.strictEqual(report.suggested_pr_title, "impl-0: establish KVDOS v1 implementation baseline");
  assert.strictEqual(report.owner_approval_required, true);
  assert.ok(Array.isArray(report.allowed_areas));
  assert.ok(Array.isArray(report.forbidden_areas));
  assert.ok(Array.isArray(report.validation_commands));
  assert.ok(Array.isArray(report.smoke_validation_commands));
  assert.strictEqual(report.current_branch, "impl/impl-0-baseline-and-guardrails");
  assert.strictEqual(report.roadmap_ready, true);
  assert.strictEqual(report.task_map_ready, true);
});

test("impl-0 baseline keeps the intended app-local boundaries", () => {
  assert.deepStrictEqual(allowedAreas, [
    "workspaces/apps/kvdos/src/**",
    "workspaces/apps/kvdos/tests/**",
    "workspaces/apps/kvdos/docs/**"
  ]);
  assert.ok(forbiddenAreas.includes("repo-root KVDF core files"));
  assert.ok(forbiddenAreas.includes(".vscode/settings.json"));
  assert.ok(forbiddenAreas.includes("runtime"));
  assert.ok(forbiddenAreas.includes("cloud API"));
});

test("impl-0 baseline exposes the required validation and smoke commands", () => {
  assert.ok(validationCommands.includes("git diff --check"));
  assert.ok(validationCommands.includes("git status --short --untracked-files=all"));
  assert.ok(validationCommands.includes("npm test"));
  assert.ok(validationCommands.includes("npm run check"));
  assert.ok(smokeValidationCommands.includes("npm run impl:baseline -- --json"));
  assert.ok(smokeValidationCommands.includes("npm run check"));
});

test("impl-0 branch discipline remains strict", () => {
  assert.strictEqual(branchDiscipline.required_branch, "impl/impl-0-baseline-and-guardrails");
  assert.strictEqual(branchDiscipline.next_slice_locked_until_merge, true);
  assert.strictEqual(branchDiscipline.owner_approval_required_before_merge, true);
  assert.strictEqual(branchDiscipline.no_shared_feature_branching, true);
});

test("impl-0 CLI help and report formatting stay explicit", () => {
  const help = captureStdout(() => main(["--help"]));
  const json = captureStdout(() => main(["--json"]));
  const formatted = formatImplementationBaselineReport(buildImplementationBaselineReport());

  assert.match(help.output, /Usage: npm run impl:baseline/);
  assert.match(help.output, /does not implement product features/i);
  assert.match(json.output, /"stage_id": "impl-0"/);
  assert.match(formatted, /KVDOS Implementation Baseline/);
  assert.match(formatted, /Branch discipline:/);
  assert.match(formatted, /Smoke validation commands:/);
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
  console.log(`All ${tests.length} impl-0 baseline tests passed.`);
}
