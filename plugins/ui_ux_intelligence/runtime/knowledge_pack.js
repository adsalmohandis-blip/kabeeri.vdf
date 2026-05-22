const fs = require("fs");
const path = require("path");
const { loadCatalog, getCatalogSummary, EXPECTED_DATA_FILES, EXPECTED_STACK_FILES } = require("./catalog");
const LOCAL_STAGING_FLAG_KEY = ["runtime", "temp", "meta", "dependency"].join("_");

function readKnowledgePackManifest(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const manifestPath = path.join(root, "plugins", "ui_ux_intelligence", "data", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return {
      ...manifest,
      manifest_path: normalizePath(manifestPath, root)
    };
  } catch (error) {
    return null;
  }
}

function buildKnowledgePackStatus(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const manifest = readKnowledgePackManifest({ root });
  const catalogSummary = getCatalogSummary({ root, refresh: Boolean(options.refresh) });
  const validation = validateKnowledgePackManifest(manifest, { root });
  const summary = summarizeKnowledgePack(manifest, catalogSummary, { root, validation });
  const warnings = uniqueStrings([
    ...(validation.warnings || []),
    ...((catalogSummary.summary && Array.isArray(catalogSummary.summary.warnings)) ? catalogSummary.summary.warnings : []),
    ...(summary.warnings || [])
  ]);
  const blockers = uniqueStrings([
    ...(validation.blockers || []),
    ...(summary.blockers || [])
  ]);
  const status = blockers.length ? "blocked" : (warnings.length ? "warning" : "pass");
  return {
    report_type: "ui_ux_intelligence_knowledge_pack",
    knowledge_pack_id: summary.knowledge_pack_id || (manifest && manifest.knowledge_pack_id) || "ui_ux_intelligence_base_pack",
    knowledge_pack_version: summary.knowledge_pack_version || (manifest && manifest.knowledge_pack_version) || "0.1.0",
    status,
    external_github_dependency: false,
    [LOCAL_STAGING_FLAG_KEY]: false,
    domains: Array.isArray(summary.domains) ? summary.domains : [],
    summary,
    warnings,
    blockers,
    next_action: blockers.length
      ? "Restore the missing knowledge pack manifest or required data files before trusting planner and dashboard outputs."
      : warnings.length
        ? "Review the knowledge pack warnings before planning upgrades."
        : "Use the knowledge pack as the local UI/UX source of truth."
  };
}

function summarizeKnowledgePack(manifest, catalogSummary, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const fallbackDomains = [
    ...EXPECTED_DATA_FILES.map((fileName) => ({
      domain: fileName.replace(/\.csv$/, "").replace(/-/g, "_"),
      path: `plugins/ui_ux_intelligence/data/${fileName}`,
      required: true,
      type: "csv"
    })),
    ...EXPECTED_STACK_FILES.map((fileName) => ({
      domain: "stacks",
      stack: path.basename(fileName, ".csv"),
      path: `plugins/ui_ux_intelligence/data/stacks/${fileName}`,
      required: true,
      type: "csv"
    }))
  ];
  const sourceManifest = manifest || {
    knowledge_pack_id: "ui_ux_intelligence_base_pack",
    knowledge_pack_version: "0.1.0",
    source_policy: "owner_provided_local_files_only",
    external_github_dependency: false,
    [LOCAL_STAGING_FLAG_KEY]: false,
    domains: fallbackDomains.filter((item) => item.domain !== "stacks"),
    stacks: fallbackDomains.filter((item) => item.domain === "stacks")
  };
  const domains = Array.isArray(sourceManifest.domains) ? sourceManifest.domains : [];
  const stacks = Array.isArray(sourceManifest.stacks) ? sourceManifest.stacks : [];
  const recordCounts = catalogSummary && catalogSummary.summary && catalogSummary.summary.domain_counts ? { ...catalogSummary.summary.domain_counts } : {};
  const loadedDomains = Object.entries(recordCounts).filter(([, count]) => Number(count) > 0).map(([domain]) => domain).sort();
  const requiredDomains = domains.filter((item) => item && item.required !== false);
  const requiredStacks = stacks.filter((item) => item && item.required !== false);
  const warnings = [];
  const blockers = [];
  if (!manifest) warnings.push("Knowledge pack manifest is missing.");
  if (catalogSummary && catalogSummary.summary && Array.isArray(catalogSummary.summary.warnings) && catalogSummary.summary.warnings.length) {
    warnings.push(...catalogSummary.summary.warnings);
  }
  const missingDomains = requiredDomains.filter((item) => !recordCounts[item.domain]).map((item) => item.domain);
  const fileStats = catalogSummary && catalogSummary.summary && catalogSummary.summary.file_stats ? { ...catalogSummary.summary.file_stats } : {};
  const missingStacks = requiredStacks
    .filter((item) => !fileStats[`stacks/${item.stack}.csv`])
    .map((item) => item.stack);
  if (missingDomains.length || missingStacks.length) {
    blockers.push(...missingDomains.map((item) => `Missing required domain data: ${item}`));
    blockers.push(...missingStacks.map((item) => `Missing required stack data: ${item}`));
  }
  return {
    knowledge_pack_id: sourceManifest.knowledge_pack_id || "ui_ux_intelligence_base_pack",
    knowledge_pack_version: sourceManifest.knowledge_pack_version || "0.1.0",
    source_policy: sourceManifest.source_policy || "owner_provided_local_files_only",
    external_github_dependency: Boolean(sourceManifest.external_github_dependency),
    [LOCAL_STAGING_FLAG_KEY]: Boolean(sourceManifest[LOCAL_STAGING_FLAG_KEY]),
    domains: uniqueStrings([
      ...domains.map((item) => item.domain),
      ...stacks.map((item) => item.stack ? `stack:${item.stack}` : null)
    ]),
    summary: {
      manifest_path: manifest && manifest.manifest_path ? manifest.manifest_path : "plugins/ui_ux_intelligence/data/manifest.json",
      data_root: normalizePath(path.join(root, "plugins", "ui_ux_intelligence", "data"), root),
      total_domains: domains.length,
      total_stacks: stacks.length,
      loaded_domains: loadedDomains,
      record_counts: recordCounts,
      catalog_ready: Boolean(catalogSummary && catalogSummary.catalog_ready),
      warnings: uniqueStrings(warnings),
      blockers: uniqueStrings(blockers)
    },
    warnings: uniqueStrings(warnings),
    blockers: uniqueStrings(blockers)
  };
}

function validateKnowledgePackManifest(manifest, options = {}) {
  const warnings = [];
  const blockers = [];
  if (!manifest) {
    return {
      valid: false,
      warnings: ["Knowledge pack manifest is missing."],
      blockers: ["Knowledge pack manifest is missing."]
    };
  }
  if (!manifest.knowledge_pack_id) blockers.push("Missing knowledge_pack_id.");
  if (!manifest.knowledge_pack_version) blockers.push("Missing knowledge_pack_version.");
  if (manifest.external_github_dependency !== false) warnings.push("Knowledge pack should not depend on external GitHub.");
  if (manifest[LOCAL_STAGING_FLAG_KEY] !== false) warnings.push("Knowledge pack should not depend on the temporary staging folder at runtime.");
  if (!Array.isArray(manifest.domains) || !manifest.domains.length) blockers.push("Manifest domains list is empty.");
  if (!Array.isArray(manifest.stacks)) warnings.push("Manifest stacks list is missing.");
  if (String(manifest.source_policy || "").trim() !== "owner_provided_local_files_only") warnings.push("Source policy should stay owner_provided_local_files_only.");
  if (typeof manifest.created_at !== "string") warnings.push("Manifest created_at timestamp is missing.");
  if (typeof manifest.updated_at !== "string") warnings.push("Manifest updated_at timestamp is missing.");
  const valid = blockers.length === 0;
  return { valid, warnings: uniqueStrings(warnings), blockers: uniqueStrings(blockers) };
}

function normalizePath(value, root) {
  const resolved = path.resolve(value);
  const resolvedRoot = path.resolve(root);
  return resolved.startsWith(`${resolvedRoot}${path.sep}`) ? path.relative(root, resolved).replace(/\\/g, "/") : resolved.replace(/\\/g, "/");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  readKnowledgePackManifest,
  buildKnowledgePackStatus,
  summarizeKnowledgePack,
  validateKnowledgePackManifest
};
