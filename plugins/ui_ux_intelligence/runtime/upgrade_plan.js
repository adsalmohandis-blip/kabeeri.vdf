const { buildKnowledgePackStatus } = require("./knowledge_pack");
const { buildCatalogHealth } = require("./catalog_health");
const { buildUiUxGovernanceRegistry } = require("./governance_registry");

function buildUiUxUpgradePlan(options = {}) {
  const root = options.root;
  const knowledgePack = buildKnowledgePackStatus({ root, refresh: Boolean(options.refresh) });
  const catalogHealth = buildCatalogHealth({ root, refresh: Boolean(options.refresh) });
  const registry = buildUiUxGovernanceRegistry({ root, refresh: Boolean(options.refresh) });
  const risks = detectUpgradeRisks(catalogHealth, registry, options);
  const catalogImprovements = recommendNextCatalogImprovements({ catalogHealth, knowledgePack, registry, options });
  const runtimeImprovements = recommendNextIntegrationImprovements({ catalogHealth, knowledgePack, registry, options, scope: "runtime" });
  const plannerIntegrationImprovements = recommendNextIntegrationImprovements({ catalogHealth, knowledgePack, registry, options, scope: "planner" });
  const viberPipelineImprovements = recommendNextIntegrationImprovements({ catalogHealth, knowledgePack, registry, options, scope: "viber" });
  const status = catalogHealth.status === "blocked" || knowledgePack.status === "blocked" || registry.status === "blocked"
    ? "blocked"
    : (risks.length ? "warning" : "pass");
  return {
    report_type: "ui_ux_intelligence_upgrade_plan",
    status,
    current_version: knowledgePack.knowledge_pack_version || "0.1.0",
    recommended_next_version: "0.2.0",
    catalog_improvements: catalogImprovements,
    runtime_improvements: runtimeImprovements,
    planner_integration_improvements: plannerIntegrationImprovements,
    viber_pipeline_improvements: viberPipelineImprovements,
    risks,
    next_action: risks.length
      ? "Resolve the governance risks before upgrading the UI/UX intelligence knowledge pack."
      : "Document the next pack changes before modifying the plugin data."
  };
}

function detectUpgradeRisks(health, registry, options = {}) {
  const risks = [];
  if (health && health.status === "blocked") risks.push("Catalog health is blocked.");
  if (registry && registry.gaps && registry.gaps.length) risks.push(`Governance registry has ${registry.gaps.length} gap(s).`);
  if (!health || !Array.isArray(health.required_files) || !health.required_files.length) risks.push("Required file list is unavailable.");
  return uniqueStrings(risks);
}

function recommendNextCatalogImprovements(options = {}) {
  const improvements = [];
  const health = options.catalogHealth || {};
  if (health.status === "blocked") {
    improvements.push("Restore missing required data files and keep the manifest in sync with the data folder.");
  } else {
    improvements.push("Add a manifest checksum or catalog hash when a future pack version needs reproducibility proofs.");
    improvements.push("Keep the domain and stack catalogs flat so local search stays deterministic.");
  }
  improvements.push("Document any future optional domains in the manifest before enabling them.");
  return uniqueStrings(improvements);
}

function recommendNextIntegrationImprovements(options = {}) {
  const scope = String(options.scope || "").toLowerCase();
  const improvements = [];
  if (scope === "runtime") {
    improvements.push("Keep runtime modules read-only and derive governance summaries from local catalog data.");
    improvements.push("Prefer manifest-backed health checks over implicit file discovery.");
  } else if (scope === "planner") {
    improvements.push("Surface catalog health warnings in planner review and prompt outputs when UI/UX intelligence is included.");
    improvements.push("Keep planner integration optional and read-only.");
  } else if (scope === "viber") {
    improvements.push("Surface knowledge-pack and catalog-health summaries in the Viber dashboard only as read-only health indicators.");
    improvements.push("Block future upgrade suggestions until the catalog health report is clean.");
  } else {
    improvements.push("Keep future integrations optional, local-only, and read-only.");
  }
  return uniqueStrings(improvements);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxUpgradePlan,
  detectUpgradeRisks,
  recommendNextCatalogImprovements,
  recommendNextIntegrationImprovements
};
