const assert = require("assert");
const { buildOwnerStructurePlan, buildWorkspaceStructurePlan } = require("../../src/services/target_path_service");

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

test("owner structure plan uses the unified shell folders", () => {
  const plan = buildOwnerStructurePlan("alpha-plugin");
  const root = plan.root.replace(/\\/g, "/");
  assert.ok(root.endsWith("plugins/alpha-plugin"));
  const paths = plan.directories.map((item) => item.replace(/\\/g, "/"));
  for (const folder of ["docs", "prompts", "runtime", "dashboard", "viber_blocking", "src", "schemas", "tests"]) {
    assert.ok(paths.some((item) => item.endsWith(`/${folder}`)), `missing ${folder}`);
  }
  assert.ok(paths.some((item) => item.endsWith("/src/commands")));
  assert.ok(paths.some((item) => item.endsWith("/src/core")));
  assert.ok(paths.some((item) => item.endsWith("/src/services")));
  assert.ok(paths.some((item) => item.endsWith("/src/utils")));
  assert.ok(paths.some((item) => item.endsWith("/tests/unit")));
  assert.ok(paths.some((item) => item.endsWith("/tests/contract")));
  assert.ok(paths.some((item) => item.endsWith("/tests/integration")));
  assert.ok(paths.some((item) => item.endsWith("/tests/smoke")));
});

test("workspace structure plan keeps governance folders without numbering", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const root = plan.root.replace(/\\/g, "/");
  assert.ok(root.endsWith("workspaces/plugins/alpha-plugin"));
  const paths = plan.directories.map((item) => item.replace(/\\/g, "/"));
  for (const folder of ["docs", "prompts", "runtime", "dashboard", "viber_blocking", "src", "schemas", "tests", "inputs", "identity", "roadmaps_plans", "specifications", "version_control", "evolutions", "task_punches", "agents", "source", "tests_quality", "evidence_audit", "reviews_approvals", "package_release", "documentation", "archive"]) {
    assert.ok(paths.some((item) => item.endsWith(`/${folder}`)), `missing ${folder}`);
  }
  assert.ok(paths.some((item) => item.endsWith("/inputs/git_libraries/library_analysis")));
  assert.ok(paths.some((item) => item.endsWith("/source/alpha-plugin")));
  assert.ok(paths.some((item) => item.endsWith("/tests/unit")));
  assert.ok(paths.some((item) => item.endsWith("/tests/integration")));
});
