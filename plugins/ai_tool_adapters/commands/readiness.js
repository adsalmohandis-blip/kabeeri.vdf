const fs = require("fs");
const path = require("path");

const provider = require("../provider");
const policyGate = require("./policy_gate");
const registry = require("./tool_registry");

const READINESS_REPORT_FILE = ".kabeeri/reports/ai_tool_adapters_readiness.json";
const SCHEMA_REGISTRY_FILE = "schemas/runtime/schema_registry.json";
const PACKAGE_JSON_FILE = "package.json";
const PLUGIN_MANIFEST_FILE = path.join(__dirname, "..", "plugin.json");
const BOOTSTRAP_FILE = path.join(__dirname, "..", "bootstrap.js");
const RUN_CONTRACT_SCHEMA_FILE = path.join(__dirname, "..", "schemas", "ai-tool-run-contract.schema.json");

function buildReadinessReport() {
  const checks = [];
  const blockers = [];
  const warnings = [];
  const pluginManifestExists = fs.existsSync(PLUGIN_MANIFEST_FILE);
  const bootstrapExportsCommand = bootstrapExportsAiToolAdapters();
  const statePath = registry.getStatePath();
  const registryStateExists = fs.existsSync(statePath);
  const schemaRegistered = validateSchemaRegistry();
  const executionDefaultDisabled = checkExecutionDefaultDisabled(registryStateExists);
  const runContractSchemaExists = fs.existsSync(RUN_CONTRACT_SCHEMA_FILE);
  const policyGateAvailable = typeof policyGate.evaluateContract === "function";
  const evidenceLogAvailable = fs.existsSync(path.join(process.cwd(), ".kabeeri", "ai_tool_runs.jsonl"));
  const providerApiAvailable = typeof provider.buildAdapterProviderReport === "function" && typeof provider.canRunContract === "function";
  const noExternalDependencies = checkNoExternalDependencies();

  pushCheck(checks, "plugin_manifest_exists", pluginManifestExists ? "pass" : "fail", pluginManifestExists ? "Plugin manifest is present." : "Plugin manifest is missing.");
  pushCheck(checks, "bootstrap_exports_command", bootstrapExportsCommand ? "pass" : "fail", bootstrapExportsCommand ? "Bootstrap exports the aiToolAdapters command." : "Bootstrap does not export the aiToolAdapters command.");
  pushCheck(checks, "registry_state_exists", registryStateExists ? "pass" : "warn", registryStateExists ? "Registry state file is present." : "Registry state file is missing; visibility still works with defaults.");
  pushCheck(checks, "schema_registered", schemaRegistered ? "pass" : "fail", schemaRegistered ? "Plugin runtime and report schemas are registered." : "Required schema registry entries are missing.");
  pushCheck(checks, "execution_default_disabled", executionDefaultDisabled.status, executionDefaultDisabled.message);
  pushCheck(checks, "run_contract_schema_exists", runContractSchemaExists ? "pass" : "fail", runContractSchemaExists ? "Run contract schema is present." : "Run contract schema is missing.");
  pushCheck(checks, "policy_gate_available", policyGateAvailable ? "pass" : "fail", policyGateAvailable ? "Policy gate module is available." : "Policy gate module is unavailable.");
  pushCheck(checks, "evidence_log_available", evidenceLogAvailable ? "pass" : "warn", evidenceLogAvailable ? "Run evidence log is present." : "Run evidence log is missing; evidence will be partial until a run is recorded.");
  pushCheck(checks, "provider_api_available", providerApiAvailable ? "pass" : "fail", providerApiAvailable ? "Provider API is available." : "Provider API is unavailable.");
  pushCheck(checks, "no_external_dependencies", noExternalDependencies ? "pass" : "fail", noExternalDependencies ? "No external dependencies are declared." : "package.json declares external dependencies.");

  for (const check of checks) {
    if (check.status === "fail") blockers.push(check.message);
    if (check.status === "warn") warnings.push(check.message);
  }

  const status = blockers.length ? "blocked" : warnings.length ? "partial" : "ready";
  const report = {
    report_type: "ai_tool_adapters_readiness",
    generated_at: new Date().toISOString(),
    status,
    checks,
    blockers,
    warnings,
    next_action: buildNextAction(status, blockers, warnings)
  };
  writeReadinessReport(report);
  return report;
}

function bootstrapExportsAiToolAdapters() {
  try {
    const source = fs.readFileSync(BOOTSTRAP_FILE, "utf8");
    return /aiToolAdapters\s*:/.test(source) || /aiToolAdapters/.test(source);
  } catch (error) {
    return false;
  }
}

function validateSchemaRegistry() {
  try {
    const file = path.join(process.cwd(), SCHEMA_REGISTRY_FILE);
    if (!fs.existsSync(file)) return false;
    const registryFile = JSON.parse(fs.readFileSync(file, "utf8"));
    const requiredEntries = [
      [".kabeeri/ai_tool_adapters.json", "plugins/ai_tool_adapters/schemas/ai-tool-adapters-state.schema.json"],
      [".kabeeri/ai_tool_runs.jsonl", "plugins/ai_tool_adapters/schemas/ai-tool-run-event.schema.json"],
      [".kabeeri/ai_tool_policy_results.json", "schemas/runtime/ai-tool-policy-result.schema.json"],
      [".kabeeri/reports/ai_tool_adapters_dashboard.json", "plugins/ai_tool_adapters/schemas/ai-tool-dashboard-state.schema.json"],
      [".kabeeri/reports/ai_tool_adapters_readiness.json", "plugins/ai_tool_adapters/schemas/ai-tool-readiness-report.schema.json"]
    ];
    const stateEntries = Array.isArray(registryFile.state_files) ? registryFile.state_files : [];
    const jsonlEntries = Array.isArray(registryFile.jsonl_files) ? registryFile.jsonl_files : [];
    return requiredEntries.every(([runtimePath, schemaPath]) => (
      stateEntries.concat(jsonlEntries).some((entry) => entry && entry.path === runtimePath && entry.schema === schemaPath)
    ));
  } catch (error) {
    return false;
  }
}

function checkExecutionDefaultDisabled(registryStateExists) {
  if (!registryStateExists) {
    return {
      status: "warn",
      message: "Registry state file is missing; the default execution policy remains disabled in the template."
    };
  }
  try {
    const state = registry.readState({ createIfMissing: false });
    if (!state || !state.policies) {
      return {
        status: "warn",
        message: "Registry state exists but no policy block was found."
      };
    }
    return state.policies.execution_default === "disabled"
      ? { status: "pass", message: "Registry execution default is disabled." }
      : { status: "fail", message: "Registry execution default is not disabled." };
  } catch (error) {
    return {
      status: "fail",
      message: `Unable to read registry policy defaults: ${error.message}`
    };
  }
}

function checkNoExternalDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_FILE), "utf8"));
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {})
    ];
    return dependencyNames.length === 0;
  } catch (error) {
    return false;
  }
}

function pushCheck(checks, checkId, status, message) {
  checks.push({
    check_id: checkId,
    status,
    message
  });
}

function buildNextAction(status, blockers, warnings) {
  if (status === "ready") {
    return "Use kvdf ai-tool-adapter dashboard --json and evidence --json to review status and run history.";
  }
  if (status === "partial") {
    if (warnings.length) return warnings[0];
    return "Review the partial readiness checks before enabling execution."
  }
  if (blockers.length) return blockers[0];
  return "Review the readiness checks before enabling execution.";
}

function writeReadinessReport(report) {
  const file = path.join(process.cwd(), READINESS_REPORT_FILE);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function renderReadinessText(report) {
  return [
    "AI Tool Adapter Readiness",
    `Status: ${report.status}`,
    ...report.checks.map((check) => `- ${check.check_id}: ${check.status} - ${check.message}`),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    ...(report.blockers.length ? ["Blockers:", ...report.blockers.map((item) => `- ${item}`)] : []),
    `Next action: ${report.next_action}`
  ].join("\n");
}

module.exports = {
  READINESS_REPORT_FILE,
  buildReadinessReport,
  writeReadinessReport,
  renderReadinessText,
  validateSchemaRegistry,
  checkExecutionDefaultDisabled,
  checkNoExternalDependencies,
  bootstrapExportsAiToolAdapters
};
