const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");

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

function runKvdf(args, options = {}) {
  const cwd = options.cwd || path.resolve(__dirname, "..");
  const previousCwd = process.cwd();
  const stdout = [];
  const stderr = [];
  const previousLog = console.log;
  const previousError = console.error;
  process.chdir(cwd);
  console.log = (...values) => stdout.push(util.format(...values));
  console.error = (...values) => stderr.push(util.format(...values));
  try {
    run(args);
  } finally {
    console.log = previousLog;
    console.error = previousError;
    process.chdir(previousCwd);
  }
  return { stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

test("plugin-dev status is routable", () => {
  const result = runKvdf(["plugin-dev", "status", "--json"]);
  const payload = JSON.parse(result.stdout.trim());
  assert.strictEqual(payload.report_type, "plugin_dev_status");
  assert.ok(Array.isArray(payload.available_command_groups));
});

test("plugin-dev doctor is routable", () => {
  const result = runKvdf(["plugin-dev", "doctor", "--json"]);
  const payload = JSON.parse(result.stdout.trim());
  assert.strictEqual(payload.report_type, "plugin_dev_doctor");
  assert.ok(Array.isArray(payload.checks));
});
