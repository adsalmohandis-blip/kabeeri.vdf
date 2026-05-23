const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const wrapperPath = path.join(repoRoot, "src", "cli", "commands", "ai_tool_adapters.js");
const packageJsonPath = path.join(repoRoot, "package.json");
const pluginManifestPath = path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json");
const bootstrapPath = path.join(repoRoot, "plugins", "ai_tool_adapters", "bootstrap.js");

assert.ok(fs.existsSync(wrapperPath), "Core wrapper file must exist.");

const wrapperSource = fs.readFileSync(wrapperPath, "utf8");
assert.ok(wrapperSource.includes('loadPluginBootstrap("ai_tool_adapters"'), "Wrapper should route through the plugin mount/loader path.");
assert.ok(wrapperSource.includes("AI Tool Adapters plugin is not installed or enabled."), "Wrapper should fail closed with a clear unavailable message.");
assert.ok(!wrapperSource.includes("process.env.PATH"), "Wrapper must not contain tool scanner implementation details.");
assert.ok(!wrapperSource.includes("PATHEXT"), "Wrapper must not contain platform scanner implementation details.");
assert.ok(!wrapperSource.includes("resolveExecutableOnPath"), "Wrapper must not contain registry/scanner logic.");
assert.ok(!wrapperSource.includes("scanKnownTools"), "Wrapper must not contain discovery logic.");
assert.ok(!wrapperSource.includes("appendRunEvent"), "Wrapper must not contain runner/evidence logic.");

const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, "utf8"));
assert.strictEqual(pluginManifest.plugin_id, "ai_tool_adapters");

const bootstrap = require(bootstrapPath);
assert.strictEqual(typeof bootstrap.aiToolAdapters, "function");
assert.strictEqual(typeof bootstrap.provider, "object");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
assert.ok(!packageJson.dependencies || !Object.prototype.hasOwnProperty.call(packageJson.dependencies, "ai_tool_adapters"));
assert.ok(!packageJson.devDependencies || !Object.prototype.hasOwnProperty.call(packageJson.devDependencies, "ai_tool_adapters"));

