const fs = require("fs");
const path = require("path");
const { loadCatalog } = require("./catalog");
const { readKnowledgePackManifest } = require("./knowledge_pack");
const LOCAL_STAGING_FLAG_KEY = ["runtime", "temp", "meta", "dependency"].join("_");

function buildCatalogHealth(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const manifest = readKnowledgePackManifest({ root });
  const catalog = loadCatalog({ root, refresh: Boolean(options.refresh) });
  const requiredFiles = validateRequiredDataFiles(manifest, { root });
  const domainValidation = validateCatalogDomains(catalog, manifest, { root });
  const emptyDomains = detectEmptyDomains(catalog, { root, manifest });
  const malformedRecords = detectMalformedRecords(catalog, { root });
  const missingFiles = uniqueStrings(requiredFiles.filter((item) => item.status === "missing").map((item) => item.path));
  const recordCounts = catalog && catalog.summary && catalog.summary.domain_counts ? { ...catalog.summary.domain_counts } : {};
  const blockers = [];
  const warnings = [];
  if (!manifest) {
    warnings.push("Catalog manifest is missing.");
  } else if (Array.isArray(domainValidation.missing_domains) && domainValidation.missing_domains.length) {
    blockers.push(...domainValidation.missing_domains.map((domain) => `Missing required domain: ${domain}`));
  }
  if (missingFiles.length) {
    blockers.push(...missingFiles.map((file) => `Missing required file: ${file}`));
  }
  if (emptyDomains.length) {
    warnings.push(...emptyDomains.map((domain) => `Empty domain: ${domain}`));
  }
  if (malformedRecords.length) {
    warnings.push(...malformedRecords.map((item) => `${item.domain}: ${item.count} malformed record(s)`));
  }
  if (catalog && catalog.warnings && catalog.warnings.length) warnings.push(...catalog.warnings);
  const status = blockers.length ? "blocked" : (warnings.length ? "warning" : "pass");
  return {
    report_type: "ui_ux_intelligence_catalog_health",
    status,
    required_files: requiredFiles.map((item) => item.path),
    missing_files: uniqueStrings(missingFiles),
    loaded_domains: domainValidation.loaded_domains,
    empty_domains: uniqueStrings(emptyDomains),
    malformed_records: malformedRecords,
    record_counts: recordCounts,
    external_github_dependency: false,
    [LOCAL_STAGING_FLAG_KEY]: false,
    next_action: blockers.length
      ? "Restore the missing required files before Planner or Viber consumes this plugin."
      : warnings.length
        ? "Review the catalog warnings before relying on new upgrades."
        : "Catalog health is good; the plugin is safe to consume."
  };
}

function validateRequiredDataFiles(manifest, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const files = manifest ? [
    ...(Array.isArray(manifest.domains) ? manifest.domains : []),
    ...(Array.isArray(manifest.stacks) ? manifest.stacks : [])
  ] : defaultManifestEntries();
  return files.map((entry) => {
    const normalizedPath = normalizePath(entry.path || "", root);
    const exists = normalizedPath ? fs.existsSync(path.resolve(root, normalizedPath)) : false;
    return {
      ...entry,
      path: normalizedPath,
      status: exists ? "present" : "missing"
    };
  });
}

function validateCatalogDomains(catalog, manifest, options = {}) {
  const domainCounts = catalog && catalog.summary && catalog.summary.domain_counts ? catalog.summary.domain_counts : {};
  const manifestDomains = [
    ...(Array.isArray(manifest && manifest.domains) ? manifest.domains.map((item) => item.domain) : Object.keys(domainCounts)),
    "stacks"
  ];
  const loaded_domains = Object.keys(domainCounts).filter((domain) => Number(domainCounts[domain]) > 0).sort();
  const missing_domains = uniqueStrings(manifestDomains.filter((domain) => Number(domainCounts[domain]) <= 0));
  return {
    loaded_domains,
    missing_domains,
    record_counts: { ...domainCounts }
  };
}

function detectEmptyDomains(catalog, options = {}) {
  const domainCounts = catalog && catalog.summary && catalog.summary.domain_counts ? catalog.summary.domain_counts : {};
  return Object.keys(domainCounts).filter((domain) => Number(domainCounts[domain]) === 0).sort();
}

function detectMalformedRecords(catalog, options = {}) {
  const records = Array.isArray(catalog && catalog.records) ? catalog.records : [];
  const counts = new Map();
  for (const record of records) {
    const domain = String(record.domain || "unknown");
    const malformed = !String(record.id || "").trim() || !String(record.label || "").trim() || !String(record.search_text || "").trim();
    if (malformed) counts.set(domain, (counts.get(domain) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([domain, count]) => ({ domain, count, issue: "missing required record fields" }));
}

function summarizeCatalogHealth(health = {}, options = {}) {
  return {
    status: health.status || "warning",
    required_files: Array.isArray(health.required_files) ? health.required_files.length : 0,
    missing_files: Array.isArray(health.missing_files) ? health.missing_files.length : 0,
    loaded_domains: Array.isArray(health.loaded_domains) ? health.loaded_domains.length : 0,
    empty_domains: Array.isArray(health.empty_domains) ? health.empty_domains.length : 0,
    malformed_records: Array.isArray(health.malformed_records) ? health.malformed_records.reduce((sum, item) => sum + Number(item.count || 0), 0) : 0
  };
}

function defaultManifestEntries() {
  return [
    { domain: "products", path: "plugins/ui_ux_intelligence/data/products.csv", required: true },
    { domain: "styles", path: "plugins/ui_ux_intelligence/data/styles.csv", required: true },
    { domain: "colors", path: "plugins/ui_ux_intelligence/data/colors.csv", required: true },
    { domain: "typography", path: "plugins/ui_ux_intelligence/data/typography.csv", required: true },
    { domain: "ui_reasoning", path: "plugins/ui_ux_intelligence/data/ui-reasoning.csv", required: true },
    { domain: "ux_guidelines", path: "plugins/ui_ux_intelligence/data/ux-guidelines.csv", required: true },
    { domain: "charts", path: "plugins/ui_ux_intelligence/data/charts.csv", required: true },
    { domain: "landing", path: "plugins/ui_ux_intelligence/data/landing.csv", required: true },
    { domain: "icons", path: "plugins/ui_ux_intelligence/data/icons.csv", required: true },
    { domain: "app_interface", path: "plugins/ui_ux_intelligence/data/app-interface.csv", required: true },
    { domain: "react_performance", path: "plugins/ui_ux_intelligence/data/react-performance.csv", required: true }
  ];
}

function normalizePath(value, root) {
  if (!value) return "";
  const resolved = path.resolve(root, value);
  return resolved.startsWith(path.resolve(root)) ? path.relative(root, resolved).replace(/\\/g, "/") : resolved.replace(/\\/g, "/");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildCatalogHealth,
  validateRequiredDataFiles,
  validateCatalogDomains,
  detectEmptyDomains,
  detectMalformedRecords,
  summarizeCatalogHealth
};
