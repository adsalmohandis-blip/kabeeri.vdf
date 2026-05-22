const { buildKnowledgePackStatus } = require("./knowledge_pack");
const { buildCatalogHealth } = require("./catalog_health");

const CAPABILITIES = [
  "catalog_search",
  "recommendation",
  "design_system",
  "checklist",
  "docs_sections",
  "audit",
  "scorecard",
  "gate",
  "readiness",
  "handoff_readiness",
  "tokens",
  "component_blueprint",
  "screen_blueprint",
  "handoff_pack",
  "pattern_library",
  "implementation_guidance",
  "prompt_pack",
  "evidence_manifest",
  "visual_qa_contract",
  "acceptance_gate",
  "regression_checklist",
  "knowledge_pack_status",
  "catalog_health",
  "governance_registry",
  "upgrade_plan"
];

function buildUiUxGovernanceRegistry(options = {}) {
  const root = options.root;
  const knowledgePack = buildKnowledgePackStatus({ root, refresh: Boolean(options.refresh) });
  const catalogHealth = buildCatalogHealth({ root, refresh: Boolean(options.refresh) });
  const capabilities = listUiUxCapabilities(options);
  const commands = mapCapabilitiesToCommands(options);
  const plannerIntegrations = mapCapabilitiesToPlannerIntegrations(options);
  const viberPipelineIntegrations = mapCapabilitiesToViberStages(options);
  const schemas = listUiUxSchemas(options);
  const docs = listUiUxDocs(options);
  const runtimeModules = listUiUxRuntimeModules(options);
  const gaps = uniqueStrings([
    ...(knowledgePack.blockers || []),
    ...(catalogHealth.status === "blocked" ? ["catalog_health_blocked"] : []),
    ...(commands.length < capabilities.length ? ["missing command mapping"] : [])
  ]);
  const status = gaps.length ? (catalogHealth.status === "blocked" || knowledgePack.status === "blocked" ? "blocked" : "warning") : "pass";
  return {
    report_type: "ui_ux_intelligence_governance_registry",
    plugin_id: "ui_ux_intelligence",
    status,
    capabilities,
    commands,
    planner_integrations: plannerIntegrations,
    viber_pipeline_integrations: viberPipelineIntegrations,
    schemas,
    docs,
    runtime_modules: runtimeModules,
    gaps,
    next_action: gaps.length
      ? "Resolve the catalog or knowledge pack gaps before relying on future UI/UX upgrades."
      : "The governance registry is aligned with the local UI/UX intelligence runtime."
  };
}

function listUiUxCapabilities(options = {}) {
  return [...CAPABILITIES];
}

function mapCapabilitiesToCommands(options = {}) {
  return [
    "catalog_search -> kvdf ui-ux-intelligence search",
    "recommendation -> kvdf ui-ux-intelligence recommend",
    "design_system -> kvdf ui-ux-intelligence design-system",
    "checklist -> kvdf ui-ux-intelligence checklist",
    "docs_sections -> kvdf ui-ux-intelligence docs",
    "audit -> kvdf ui-ux-intelligence audit",
    "scorecard -> kvdf ui-ux-intelligence scorecard",
    "gate -> kvdf ui-ux-intelligence gate",
    "readiness -> kvdf ui-ux-intelligence readiness",
    "handoff_readiness -> kvdf ui-ux-intelligence handoff-pack",
    "tokens -> kvdf ui-ux-intelligence tokens",
    "component_blueprint -> kvdf ui-ux-intelligence components",
    "screen_blueprint -> kvdf ui-ux-intelligence screens",
    "handoff_pack -> kvdf ui-ux-intelligence handoff-pack",
    "pattern_library -> kvdf ui-ux-intelligence patterns",
    "implementation_guidance -> kvdf ui-ux-intelligence implementation-guidance",
    "prompt_pack -> kvdf ui-ux-intelligence prompt-pack",
    "evidence_manifest -> kvdf ui-ux-intelligence evidence",
    "visual_qa_contract -> kvdf ui-ux-intelligence visual-qa",
    "acceptance_gate -> kvdf ui-ux-intelligence acceptance-gate",
    "regression_checklist -> kvdf ui-ux-intelligence regression",
    "knowledge_pack_status -> kvdf ui-ux-intelligence knowledge-pack",
    "catalog_health -> kvdf ui-ux-intelligence catalog-health",
    "governance_registry -> kvdf ui-ux-intelligence governance-registry",
    "upgrade_plan -> kvdf ui-ux-intelligence upgrade-plan",
    "governance -> kvdf ui-ux-intelligence governance"
  ];
}

function mapCapabilitiesToPlannerIntegrations(options = {}) {
  return [
    "planner docs plan/materialize: optional UI/UX docs, handoff, and evidence summaries",
    "planner review: optional governance, evidence, and acceptance summaries",
    "planner visual: optional UI/UX summary with safe readiness hints",
    "planner prompt: optional governance warning and stop condition hints",
    "planner version/train readiness: optional governance summary when included"
  ];
}

function mapCapabilitiesToViberStages(options = {}) {
  return [
    "ui_ux_design",
    "validation",
    "handoff",
    "publish_readiness",
    "docs_materialization",
    "task_punch_review"
  ];
}

function summarizeGovernanceRegistry(registry = {}, options = {}) {
  return {
    status: registry.status || "warning",
    capability_count: Array.isArray(registry.capabilities) ? registry.capabilities.length : 0,
    command_count: Array.isArray(registry.commands) ? registry.commands.length : 0,
    gap_count: Array.isArray(registry.gaps) ? registry.gaps.length : 0
  };
}

function listUiUxSchemas(options = {}) {
  return [
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-recommendation.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-design-system.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-checklist.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-docs.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-audit.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-scorecard.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-gate.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-readiness.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-tokens.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-components.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-screens.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-handoff-pack.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-pattern-library.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-prompt-pack.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-implementation-guidance.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-evidence.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-visual-qa.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-acceptance-gate.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-regression.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-knowledge-pack.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-catalog-health.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-governance-registry.schema.json",
    "plugins/ui_ux_intelligence/schemas/ui-ux-intelligence-upgrade-plan.schema.json"
  ];
}

function listUiUxDocs(options = {}) {
  return [
    "plugins/ui_ux_intelligence/docs/index.md",
    "plugins/ui_ux_intelligence/docs/cli.md",
    "docs/cli/CLI_COMMAND_REFERENCE.md",
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    "docs/workflows/VIBER_DOCUMENTATION_PIPELINE.md"
  ];
}

function listUiUxRuntimeModules(options = {}) {
  return [
    "plugins/ui_ux_intelligence/runtime/index.js",
    "plugins/ui_ux_intelligence/runtime/catalog.js",
    "plugins/ui_ux_intelligence/runtime/search_engine.js",
    "plugins/ui_ux_intelligence/runtime/recommender.js",
    "plugins/ui_ux_intelligence/runtime/design_system.js",
    "plugins/ui_ux_intelligence/runtime/checklist.js",
    "plugins/ui_ux_intelligence/runtime/docs_adapter.js",
    "plugins/ui_ux_intelligence/runtime/audit.js",
    "plugins/ui_ux_intelligence/runtime/scorecard.js",
    "plugins/ui_ux_intelligence/runtime/gate.js",
    "plugins/ui_ux_intelligence/runtime/readiness.js",
    "plugins/ui_ux_intelligence/runtime/tokens.js",
    "plugins/ui_ux_intelligence/runtime/components.js",
    "plugins/ui_ux_intelligence/runtime/screens.js",
    "plugins/ui_ux_intelligence/runtime/handoff_pack.js",
    "plugins/ui_ux_intelligence/runtime/pattern_library.js",
    "plugins/ui_ux_intelligence/runtime/implementation_guidance.js",
    "plugins/ui_ux_intelligence/runtime/prompt_pack.js",
    "plugins/ui_ux_intelligence/runtime/evidence.js",
    "plugins/ui_ux_intelligence/runtime/visual_qa.js",
    "plugins/ui_ux_intelligence/runtime/acceptance_gate.js",
    "plugins/ui_ux_intelligence/runtime/regression.js",
    "plugins/ui_ux_intelligence/runtime/knowledge_pack.js",
    "plugins/ui_ux_intelligence/runtime/catalog_health.js",
    "plugins/ui_ux_intelligence/runtime/governance_registry.js",
    "plugins/ui_ux_intelligence/runtime/upgrade_plan.js"
  ];
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxGovernanceRegistry,
  listUiUxCapabilities,
  mapCapabilitiesToCommands,
  mapCapabilitiesToPlannerIntegrations,
  mapCapabilitiesToViberStages,
  summarizeGovernanceRegistry
};
