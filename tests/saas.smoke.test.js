const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const serverFile = path.join(repoRoot, "apps", "saas", "src", "server.js");

assert.ok(fs.existsSync(serverFile), "SaaS server file should exist");
assert.ok(fs.existsSync(path.join(repoRoot, "apps", "saas", "data", "seed.json")), "SaaS seed file should exist");
assert.ok(fs.existsSync(path.join(repoRoot, "apps", "saas", "public", "styles.css")), "SaaS stylesheet should exist");

const result = spawnSync(process.execPath, [serverFile, "--check"], {
  cwd: repoRoot,
  encoding: "utf8"
});

assert.strictEqual(result.status, 0, `SaaS check failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
assert.match(result.stdout, /Kabeeri SaaS scaffold OK/);

const { readSeed } = require(serverFile);
const seed = readSeed();
assert.ok(Array.isArray(seed.workspaces), "SaaS seed workspaces should be an array");
assert.ok(seed.workspaces.length >= 1, "SaaS seed should include workspaces");

console.log("OK saas scaffold smoke test");
