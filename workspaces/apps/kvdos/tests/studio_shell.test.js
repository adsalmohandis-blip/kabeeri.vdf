const assert = require("assert");

const {
  createStudioShellFrame,
  formatStudioShellFrame,
  formatStudioShellHelp,
  main,
  renderStudioShellFrame
} = require("../src/studio_shell");

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

test("impl-1 shell frame exposes top-level layout regions and placeholders", () => {
  const frame = createStudioShellFrame({ selectedProject: "alpha-project" });

  assert.strictEqual(frame.surface, "studio-shell");
  assert.strictEqual(frame.title, "KVDOS Local Studio");
  assert.strictEqual(frame.current_project, "alpha-project");
  assert.strictEqual(frame.layout.type, "studio-shell-frame");
  assert.deepStrictEqual(frame.layout.regions.map((region) => region.id), [
    "top-bar",
    "left-sidebar",
    "main-canvas",
    "right-panel",
    "bottom-strip"
  ]);
  assert.ok(frame.layout.regions.every((region) => region.placeholder === true));
  assert.strictEqual(frame.placeholder_regions.length, 5);
  assert.match(frame.placeholder_regions[0].purpose, /current project/i);
});

test("impl-1 shell render keeps placeholder regions only", () => {
  const frame = createStudioShellFrame();
  const html = renderStudioShellFrame(frame);
  const formatted = formatStudioShellFrame(frame);

  assert.match(html, /kvdos-studio-shell/);
  assert.match(html, /shell-top-bar/);
  assert.match(html, /shell-left-sidebar/);
  assert.match(html, /shell-main-canvas/);
  assert.match(html, /shell-right-panel/);
  assert.match(html, /shell-bottom-strip/);
  assert.match(html, /Placeholder shell regions only/);
  assert.match(html, /No project selected/);
  assert.match(formatted, /Surface: studio-shell/);
  assert.match(formatted, /Layout regions:/);
  assert.match(formatted, /top-bar: Top bar \[placeholder\]/);
  assert.doesNotMatch(html, /project registry selector/i);
  assert.doesNotMatch(html, /runtime status/i);
  assert.doesNotMatch(html, /cloud login/i);
  assert.doesNotMatch(html, /release packaging/i);
});

test("impl-1 shell CLI help and json output stay explicit", () => {
  const help = captureStdout(() => main(["--help"]));
  const json = captureStdout(() => main(["--json", "--project", "alpha-project"]));

  assert.match(help.output, /Usage: npm run studio:shell/);
  assert.match(help.output, /does not execute tasks or invoke cloud behavior/i);
  assert.match(json.output, /"surface": "studio-shell"/);
  assert.match(json.output, /"current_project": "alpha-project"/);
  assert.match(formatStudioShellHelp(), /first Studio shell frame skeleton/i);
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
  console.log(`All ${tests.length} impl-1 shell tests passed.`);
}
