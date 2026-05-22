const assert = require("assert");

const {
  createStudioNavigationModel,
  formatStudioNavigationHelp,
  formatStudioNavigationState,
  main,
  renderStudioNavigation,
  primaryNavigationRoutes
} = require("../src/studio_navigation");

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

test("impl-2 navigation model exposes primary routes and defaults to home", () => {
  const model = createStudioNavigationModel();

  assert.strictEqual(model.surface, "studio-navigation");
  assert.strictEqual(model.title, "Primary Studio Navigation");
  assert.strictEqual(model.active_route, "home");
  assert.strictEqual(model.items.length, primaryNavigationRoutes.length);
  assert.deepStrictEqual(model.items.map((item) => item.id), [
    "home",
    "projects",
    "discovery",
    "spec",
    "tasks",
    "approvals",
    "reports",
    "settings"
  ]);
  assert.ok(model.items.every((item) => item.placeholder === true));
  assert.ok(model.items[0].active);
});

test("impl-2 navigation render keeps placeholder route definitions only", () => {
  const model = createStudioNavigationModel({ activeRoute: "tasks" });
  const html = renderStudioNavigation(model);
  const formatted = formatStudioNavigationState(model);

  assert.match(html, /studio-primary-navigation/);
  assert.match(html, /Primary navigation/);
  assert.match(html, /navigation-note/);
  assert.match(html, /data-route="tasks"/);
  assert.match(html, /is-active/);
  assert.match(formatted, /Active route: tasks/);
  assert.match(formatted, /navigation scaffold is placeholder-only/i);
  assert.doesNotMatch(html, /runtime/i);
  assert.doesNotMatch(html, /cloud/i);
  assert.doesNotMatch(html, /execution/i);
});

test("impl-2 navigation CLI help and json output stay explicit", () => {
  const help = captureStdout(() => main(["--help"]));
  const json = captureStdout(() => main(["--json", "--route", "reports"]));

  assert.match(help.output, /Usage: node src\/studio_navigation\.js/);
  assert.match(help.output, /does not render registry or runtime behavior/i);
  assert.match(json.output, /"active_route": "reports"/);
  assert.match(formatStudioNavigationHelp(), /primary Studio navigation scaffold/i);
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
  console.log(`All ${tests.length} impl-2 navigation tests passed.`);
}
